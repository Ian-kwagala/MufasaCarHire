"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  MessageCircle,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";
import type { SiteSettings } from "@/lib/types";
import { normalizeWhatsAppNumber } from "@/lib/whatsapp";
import {
  buildProceduralVehicle,
  createContactShadowTexture,
  createStudioFloorTexture,
  SHOWROOM_FINISHES,
  SHOWROOM_VEHICLES,
  type BuiltVehicleBundle,
  type ShowroomVehicleType,
} from "@/lib/threeVehicles";

type CameraPresetId = "hero" | "front" | "side" | "rear" | "top";

const CAMERA_PRESETS: {
  id: CameraPresetId;
  label: string;
  position: [number, number, number];
  target: [number, number, number];
}[] = [
  { id: "hero", label: "3/4 View", position: [4.6, 2.25, 4.9], target: [0, 0.8, 0] },
  { id: "front", label: "Front", position: [0.0, 1.55, 5.8], target: [0, 0.82, 0] },
  { id: "side", label: "Profile", position: [6.4, 1.5, 0.1], target: [0, 0.85, 0] },
  { id: "rear", label: "Rear", position: [-3.1, 1.9, -4.9], target: [0, 0.85, 0] },
  { id: "top", label: "Overhead", position: [0.1, 7.2, 2.6], target: [0, 0.5, 0] },
];

function detectSoftwareGl(renderer: THREE.WebGLRenderer): boolean {
  try {
    const gl = renderer.getContext();
    const dbg = gl.getExtension("WEBGL_debug_renderer_info");
    const rendererStr = dbg
      ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL))
      : String(gl.getParameter(gl.RENDERER));
    return /swiftshader|llvmpipe|mesa|software|microsoft basic render/i.test(
      rendererStr
    );
  } catch {
    return false;
  }
}

function disposeObjectTree(root: THREE.Object3D) {
  root.traverse((node) => {
    if (node instanceof THREE.Mesh) {
      node.geometry?.dispose();
      if (Array.isArray(node.material)) {
        node.material.forEach((m) => {
          disposeMaterialTextures(m);
          m.dispose();
        });
      } else if (node.material) {
        disposeMaterialTextures(node.material);
        node.material.dispose();
      }
    }
  });
}

function disposeMaterialTextures(mat: THREE.Material) {
  const rec = mat as unknown as Record<string, unknown>;
  for (const key of ["map", "normalMap", "roughnessMap", "metalnessMap", "alphaMap"]) {
    const tex = rec[key];
    if (tex instanceof THREE.Texture) {
      tex.dispose();
    }
  }
}

export function Fleet3DShowroom({ settings }: { settings: SiteSettings }) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [vehicleType, setVehicleType] = useState<ShowroomVehicleType>("saloon");
  const [paintHex, setPaintHex] = useState<string>(SHOWROOM_VEHICLES[0].defaultColor);
  const [activePreset, setActivePreset] = useState<CameraPresetId>("hero");
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [headlightsOn, setHeadlightsOn] = useState<boolean>(true);
  const [dockOpen, setDockOpen] = useState<boolean>(true);
  const [webglFallback, setWebglFallback] = useState<boolean>(false);

  // Refs shared with the imperative Three.js lifecycle
  const sceneRef = useRef<THREE.Scene | null>(null);
  const vehicleBundleRef = useRef<BuiltVehicleBundle | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const isSoftRef = useRef<boolean>(false);
  const autoRotateRef = useRef<boolean>(true);
  const cameraTweenRef = useRef<{
    active: boolean;
    startPos: THREE.Vector3;
    endPos: THREE.Vector3;
    startTarget: THREE.Vector3;
    endTarget: THREE.Vector3;
    progress: number;
  } | null>(null);
  const requestRenderRef = useRef<() => void>(() => {});

  const currentSpec =
    SHOWROOM_VEHICLES.find((v) => v.id === vehicleType) ?? SHOWROOM_VEHICLES[0];

  const finishName =
    SHOWROOM_FINISHES.find((f) => f.hex.toLowerCase() === paintHex.toLowerCase())
      ?.name ?? "Custom Finish";

  // Sync autoRotate ref
  useEffect(() => {
    autoRotateRef.current = autoRotate;
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate && !isSoftRef.current;
    }
    requestRenderRef.current();
  }, [autoRotate]);

  // Mount Three.js scene once
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      const testCanvas = document.createElement("canvas");
      const testGl =
        testCanvas.getContext("webgl2") || testCanvas.getContext("webgl");
      if (!testGl) {
        setWebglFallback(true);
        return;
      }

      // Probe software renderer before committing AA/shadow settings
      const probeDbg = testGl.getExtension("WEBGL_debug_renderer_info");
      const probeStr = probeDbg
        ? String(testGl.getParameter(probeDbg.UNMASKED_RENDERER_WEBGL))
        : String(testGl.getParameter(testGl.RENDERER));
      const softInit = /swiftshader|llvmpipe|mesa|software|microsoft basic render/i.test(
        probeStr
      );

      renderer = new THREE.WebGLRenderer({
        antialias: !softInit,
        powerPreference: "high-performance",
        alpha: false,
      });
    } catch {
      setWebglFallback(true);
      return;
    }

    const isSoftwareGl = detectSoftwareGl(renderer);
    isSoftRef.current = isSoftwareGl;

    const width = Math.max(container.clientWidth, 320);
    const height = Math.max(container.clientHeight, 320);

    renderer.setSize(width, height);
    renderer.setPixelRatio(
      isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2)
    );
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = !isSoftwareGl;
    if (!isSoftwareGl) {
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    container.innerHTML = "";
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    container.appendChild(renderer.domElement);

    // Scene + Horizon-Matched Fog
    const scene = new THREE.Scene();
    const bgColor = new THREE.Color(0x091220);
    scene.background = bgColor;
    scene.fog = new THREE.FogExp2(0x091220, 0.032);
    sceneRef.current = scene;

    // RoomEnvironment IBL on EVERY device (hardware & software WebGL alike)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envRT = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envRT.texture;
    roomEnv.dispose();
    pmremGenerator.dispose();

    // Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 80);
    camera.position.set(4.6, 2.25, 4.9);
    cameraRef.current = camera;

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0.8, 0);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.enablePan = false;
    controls.minDistance = 3.8;
    controls.maxDistance = 11.5;
    controls.minPolarAngle = 0.22;
    controls.maxPolarAngle = Math.PI / 2 - 0.04;
    controls.autoRotate = autoRotateRef.current && !isSoftwareGl;
    controls.autoRotateSpeed = 0.9;
    controls.update();
    controlsRef.current = controls;

    // Studio 3-Point Lighting (consistent intensities across hardware & software)
    const hemiLight = new THREE.HemisphereLight(0xb8d4ff, 0x26221c, 0.95);
    hemiLight.position.set(0, 12, 0);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff4e0, 2.2);
    keyLight.position.set(6, 9, 6);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.camera.near = 1;
      keyLight.shadow.camera.far = 26;
      keyLight.shadow.camera.left = -5;
      keyLight.shadow.camera.right = 5;
      keyLight.shadow.camera.top = 5;
      keyLight.shadow.camera.bottom = -5;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xffd27d, 0.85);
    rimLight.position.set(-7, 4.5, -6);
    scene.add(rimLight);

    // Architectural Studio Floor
    const floorTex = createStudioFloorTexture();
    const floorGeo = new THREE.CircleGeometry(28, 48);
    floorGeo.rotateX(-Math.PI / 2);
    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTex,
      roughness: 0.78,
      metalness: 0.12,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = -0.08;
    floor.receiveShadow = true;
    scene.add(floor);

    // Raised Showroom Turntable Plinth + Mufasa Gold Ring
    const plinthGeo = new THREE.CylinderGeometry(3.25, 3.45, 0.08, 48);
    const plinthMat = new THREE.MeshStandardMaterial({
      color: 0x13223a,
      roughness: 0.42,
      metalness: 0.35,
    });
    const plinth = new THREE.Mesh(plinthGeo, plinthMat);
    plinth.position.y = -0.04;
    plinth.receiveShadow = true;
    scene.add(plinth);

    const ringGeo = new THREE.TorusGeometry(3.27, 0.025, 12, 64);
    ringGeo.rotateX(Math.PI / 2);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xc59b3b,
      roughness: 0.28,
      metalness: 0.85,
      emissive: new THREE.Color(0x6b4e12),
      emissiveIntensity: 0.35,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.y = 0.005;
    scene.add(ring);

    // Grounded Contact Shadow Plane (always anchors tires even on software WebGL)
    const shadowTex = createContactShadowTexture();
    const contactGeo = new THREE.PlaneGeometry(3.3, 5.8);
    contactGeo.rotateX(-Math.PI / 2);
    const contactMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
    });
    const contactShadow = new THREE.Mesh(contactGeo, contactMat);
    contactShadow.position.y = 0.004;
    scene.add(contactShadow);

    // Build Initial Vehicle
    const initialBundle = buildProceduralVehicle(
      "saloon",
      SHOWROOM_VEHICLES[0].defaultColor,
      true,
      !isSoftwareGl
    );
    scene.add(initialBundle.group);
    vehicleBundleRef.current = initialBundle;

    // Render loop: on-demand + fenceSync paced on software WebGL, 60fps RAF on GPU
    let disposed = false;
    let rafId = 0;
    let dirty = true;
    const gl = renderer.getContext();

    const afterDraw = (fn: () => void) => {
      if (gl instanceof WebGL2RenderingContext) {
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        if (!sync) {
          requestAnimationFrame(fn);
          return;
        }
        gl.flush();
        const poll = () => {
          if (disposed) {
            gl.deleteSync(sync);
            return;
          }
          if (gl.getSyncParameter(sync, gl.SYNC_STATUS) === gl.SIGNALED) {
            gl.deleteSync(sync);
            fn();
          } else {
            requestAnimationFrame(poll);
          }
        };
        requestAnimationFrame(poll);
      } else {
        requestAnimationFrame(fn);
      }
    };

    const applyCameraTween = (step: number) => {
      const tween = cameraTweenRef.current;
      if (!tween || !tween.active) return false;
      tween.progress = Math.min(1, tween.progress + step);
      const t = 1 - Math.pow(1 - tween.progress, 3);
      camera.position.lerpVectors(tween.startPos, tween.endPos, t);
      controls.target.lerpVectors(tween.startTarget, tween.endTarget, t);
      if (tween.progress >= 1) {
        tween.active = false;
      }
      return true;
    };

    const renderOnce = () => {
      if (disposed) return;
      controls.update();
      renderer.render(scene, camera);
    };

    let softFramePending = false;
    const requestRender = () => {
      if (disposed) return;
      dirty = true;
      if (isSoftwareGl && !softFramePending) {
        softFramePending = true;
        requestAnimationFrame(() => {
          if (disposed) return;
          softFramePending = false;
          if (!dirty) return;
          dirty = false;
          const tweening = applyCameraTween(0.24);
          renderOnce();
          if (tweening) {
            afterDraw(() => requestRender());
          }
        });
      }
    };
    requestRenderRef.current = requestRender;

    controls.addEventListener("change", () => {
      if (isSoftwareGl) requestRender();
    });

    controls.addEventListener("start", () => {
      if (cameraTweenRef.current) {
        cameraTweenRef.current.active = false;
      }
    });

    // Initial draw
    if (isSoftwareGl) {
      renderOnce();
    } else {
      const clock = new THREE.Clock();
      const tick = () => {
        if (disposed) return;
        rafId = requestAnimationFrame(tick);
        const dt = Math.min(clock.getDelta(), 0.05);
        applyCameraTween(dt * 2.6);
        // Subtle wheel rotation when auto-rotating for lifelike motion
        if (autoRotateRef.current && vehicleBundleRef.current) {
          for (const w of vehicleBundleRef.current.wheels) {
            w.rotation.x += dt * 0.45;
          }
        }
        controls.update();
        renderer.render(scene, camera);
      };
      tick();
    }

    // Responsive ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
      if (disposed) return;
      for (const entry of entries) {
        const w = Math.max(Math.floor(entry.contentRect.width), 320);
        const h = Math.max(Math.floor(entry.contentRect.height), 320);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h, false);
        requestRender();
      }
    });
    resizeObserver.observe(container);

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      controls.dispose();
      if (vehicleBundleRef.current) {
        scene.remove(vehicleBundleRef.current.group);
        disposeObjectTree(vehicleBundleRef.current.group);
        vehicleBundleRef.current = null;
      }
      disposeObjectTree(scene);
      envRT.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Swap procedural vehicle model when vehicleType changes
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    if (vehicleBundleRef.current) {
      scene.remove(vehicleBundleRef.current.group);
      disposeObjectTree(vehicleBundleRef.current.group);
      vehicleBundleRef.current = null;
    }

    const bundle = buildProceduralVehicle(
      vehicleType,
      paintHex,
      headlightsOn,
      !isSoftRef.current
    );
    scene.add(bundle.group);
    vehicleBundleRef.current = bundle;
    requestRenderRef.current();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleType]);

  // Update paint color without rebuilding geometry
  useEffect(() => {
    const bundle = vehicleBundleRef.current;
    if (!bundle) return;
    bundle.paintMaterial.color.set(paintHex);
    requestRenderRef.current();
  }, [paintHex]);

  // Update headlight/taillight emissive state
  useEffect(() => {
    const bundle = vehicleBundleRef.current;
    if (!bundle) return;
    bundle.headlightMaterial.emissiveIntensity = headlightsOn ? 2.4 : 0.15;
    bundle.taillightMaterial.emissiveIntensity = headlightsOn ? 1.8 : 0.25;
    requestRenderRef.current();
  }, [headlightsOn]);

  function selectCameraPreset(presetId: CameraPresetId) {
    setActivePreset(presetId);
    const preset = CAMERA_PRESETS.find((p) => p.id === presetId);
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!preset || !camera || !controls) return;

    cameraTweenRef.current = {
      active: true,
      startPos: camera.position.clone(),
      endPos: new THREE.Vector3(...preset.position),
      startTarget: controls.target.clone(),
      endTarget: new THREE.Vector3(...preset.target),
      progress: 0,
    };
    requestRenderRef.current();
  }

  function handleVehicleSwitch(nextType: ShowroomVehicleType) {
    setVehicleType(nextType);
    const spec = SHOWROOM_VEHICLES.find((v) => v.id === nextType);
    if (spec) {
      setPaintHex(spec.defaultColor);
    }
  }

  const quoteUrl = `https://wa.me/${normalizeWhatsAppNumber(
    settings.primary_whatsapp
  )}?text=${encodeURIComponent(
    `Hello Mufasa Car Hire! I just inspected the ${currentSpec.label} (${currentSpec.modelName}, ${finishName}) in your 3D Showroom and would like a quick booking quote.`
  )}`;

  return (
    <div className="relative h-[calc(100vh-66px)] min-h-[600px] w-full overflow-hidden bg-[#091220] text-white select-none">
      {/* Full-Bleed WebGL Canvas Container */}
      <div
        ref={containerRef}
        className="h-full w-full cursor-grab active:cursor-grabbing"
        aria-label="Interactive 3D vehicle showroom canvas"
      />

      {/* Graceful non-WebGL Fallback */}
      {webglFallback && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#091220] p-6 text-center">
          <p className="text-xs font-extrabold uppercase tracking-widest text-gold">
            3D Showroom Unavailable
          </p>
          <h2 className="mt-2 text-2xl font-extrabold text-white">
            WebGL is disabled on this browser
          </h2>
          <p className="mt-2 max-w-md text-sm text-white/75">
            Explore our full vehicle lineup with HD photos and video walkthroughs
            in the Fleet Catalog.
          </p>
          <Link href="/fleet" className="btn-gold mt-6 text-sm">
            Open Fleet Catalog
          </Link>
        </div>
      )}

      {/* Minimal Top-Left Vehicle Title & Specs Overlay (Solid rgba, NO backdrop-filter over WebGL) */}
      <div className="pointer-events-none absolute top-4 left-4 right-4 z-10 flex flex-wrap items-start justify-between gap-3 sm:top-6 sm:left-6 sm:right-6">
        <div className="pointer-events-auto max-w-sm rounded-2xl border border-white/15 bg-[#0b182e]/92 px-4 py-3.5 shadow-xl">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-gold">
            <Link
              href="/fleet"
              className="inline-flex items-center gap-1 text-white/75 hover:text-gold transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Fleet</span>
            </Link>
            <span className="text-white/30">/</span>
            <span>3D Showroom</span>
          </div>
          <h1 className="mt-1 text-lg font-extrabold tracking-tight text-white sm:text-xl">
            {currentSpec.label}
          </h1>
          <p className="text-xs text-white/75">{currentSpec.modelName}</p>
          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-white/10 pt-2 text-[11px] font-semibold text-white/85">
            <span className="text-gold font-extrabold tabular-nums">
              {currentSpec.rateDisplay}
            </span>
            <span>·</span>
            <span>{currentSpec.seats}</span>
            <span>·</span>
            <span>{currentSpec.transmission}</span>
          </div>
        </div>

        {/* Top-Right Direct WhatsApp Quote CTA */}
        <div className="pointer-events-auto flex items-center gap-2">
          <a
            href={quoteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold px-4! py-2.5! text-xs sm:text-sm shadow-xl"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Book This Class</span>
          </a>
        </div>
      </div>

      {/* Compact Collapsible Bottom Dock (Solid rgba, NO backdrop-filter over WebGL) */}
      <div className="pointer-events-none absolute inset-x-0 bottom-4 z-10 flex flex-col items-center px-3 sm:bottom-5 sm:px-6">
        <div className="pointer-events-auto w-full max-w-4xl rounded-2xl border border-white/15 bg-[#0b182e]/95 shadow-2xl">
          {/* Compact Top Strip of Dock */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5">
            {/* Vehicle Class Switcher */}
            <div className="flex flex-wrap items-center gap-1.5">
              {SHOWROOM_VEHICLES.map((v) => {
                const active = v.id === vehicleType;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => handleVehicleSwitch(v.id)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                      active
                        ? "bg-gold text-navy"
                        : "bg-white/8 text-white/85 hover:bg-white/15"
                    }`}
                  >
                    {v.label}
                  </button>
                );
              })}
            </div>

            {/* Quick Scene Toggles & Collapse Button */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setHeadlightsOn((prev) => !prev)}
                title="Toggle LED Headlights"
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                  headlightsOn
                    ? "bg-gold/20 text-gold border border-gold/40"
                    : "bg-white/8 text-white/75 hover:bg-white/15"
                }`}
              >
                <Lightbulb className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Lights</span>
              </button>

              <button
                type="button"
                onClick={() => setAutoRotate((prev) => !prev)}
                title={autoRotate ? "Pause turntable" : "Resume turntable"}
                className="inline-flex items-center gap-1 rounded-lg bg-white/8 px-2.5 py-1.5 text-xs font-semibold text-white/85 hover:bg-white/15 transition-colors"
              >
                {autoRotate ? (
                  <Pause className="h-3.5 w-3.5 text-gold" />
                ) : (
                  <Play className="h-3.5 w-3.5 text-gold" />
                )}
                <span className="hidden sm:inline">
                  {autoRotate ? "Spin" : "Paused"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => selectCameraPreset("hero")}
                title="Reset camera angle"
                className="inline-flex items-center justify-center rounded-lg bg-white/8 p-1.5 text-white/85 hover:bg-white/15 transition-colors"
                aria-label="Reset camera view"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setDockOpen((prev) => !prev)}
                aria-expanded={dockOpen}
                aria-label={dockOpen ? "Collapse controls" : "Expand controls"}
                className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-white/85 hover:bg-white/15 transition-colors"
              >
                {dockOpen ? (
                  <ChevronDown className="h-3.5 w-3.5" />
                ) : (
                  <ChevronUp className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Expandable Finish + Camera Presets Row */}
          {dockOpen && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-3.5 py-2.5">
              {/* Paint Finish Swatches */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-white/60">
                  Finish
                </span>
                <div className="flex items-center gap-1.5">
                  {SHOWROOM_FINISHES.map((swatch) => {
                    const selected =
                      swatch.hex.toLowerCase() === paintHex.toLowerCase();
                    return (
                      <button
                        key={swatch.name}
                        type="button"
                        onClick={() => setPaintHex(swatch.hex)}
                        title={swatch.name}
                        aria-label={`Paint finish ${swatch.name}`}
                        className={`h-6 w-6 rounded-full border-2 transition-transform ${
                          selected
                            ? "scale-110 border-gold ring-2 ring-gold/40"
                            : "border-white/30 hover:scale-105"
                        }`}
                        style={{ backgroundColor: swatch.hex }}
                      />
                    );
                  })}
                </div>
                <span className="hidden text-xs font-semibold text-white/80 md:inline">
                  {finishName}
                </span>
              </div>

              {/* Camera Angle Presets */}
              <div className="flex flex-wrap items-center gap-1">
                <span className="mr-1 text-[11px] font-bold uppercase tracking-wider text-white/60">
                  Camera
                </span>
                {CAMERA_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => selectCameraPreset(preset.id)}
                    className={`rounded-md px-2.5 py-1 text-[11px] font-bold transition-colors ${
                      activePreset === preset.id
                        ? "bg-white text-navy"
                        : "bg-white/8 text-white/80 hover:bg-white/15"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <p className="mt-1.5 text-[11px] font-medium text-white/55">
          Drag to orbit 360° · Scroll or pinch to zoom · Switch vehicle body &amp; finish below
        </p>
      </div>
    </div>
  );
}
