import * as THREE from "three";

export type ShowroomVehicleType = "saloon" | "suv" | "cargo";

export interface ShowroomVehicleSpec {
  id: ShowroomVehicleType;
  label: string;
  modelName: string;
  tagline: string;
  rateDisplay: string;
  seats: string;
  luggage: string;
  transmission: string;
  driveMode: string;
  defaultColor: string;
}

export const SHOWROOM_VEHICLES: ShowroomVehicleSpec[] = [
  {
    id: "saloon",
    label: "Executive Saloon",
    modelName: "Toyota Premio / Fielder Class",
    tagline: "Airport Transfers & City Chauffeur",
    rateDisplay: "UGX 150,000 / day",
    seats: "4 Passengers",
    luggage: "3 Suitcases",
    transmission: "Automatic",
    driveMode: "Self-Drive / Chauffeur",
    defaultColor: "#F1F5F9",
  },
  {
    id: "suv",
    label: "4x4 Land Cruiser",
    modelName: "Land Cruiser Prado / TX VIP",
    tagline: "Upcountry, Safari & Diplomatic Fleet",
    rateDisplay: "UGX 350,000 / day",
    seats: "5–7 Passengers",
    luggage: "5 Suitcases",
    transmission: "Automatic 4WD",
    driveMode: "Chauffeur / Corporate",
    defaultColor: "#14294A",
  },
  {
    id: "cargo",
    label: "Cargo & Moving Van",
    modelName: "HiAce / 1.5T Commercial Mover",
    tagline: "Home Relocation & Kikubo Logistics",
    rateDisplay: "UGX 220,000 / trip",
    seats: "3 Crew + 1.5T Bay",
    luggage: "1,500 kg Payload",
    transmission: "Manual / Diesel",
    driveMode: "Driver + Loaders",
    defaultColor: "#E8EEF5",
  },
];

export const SHOWROOM_FINISHES = [
  { name: "Pearl White", hex: "#F1F5F9" },
  { name: "Mufasa Navy", hex: "#14294A" },
  { name: "Metallic Silver", hex: "#94A3B8" },
  { name: "Obsidian Black", hex: "#1A1F2B" },
  { name: "Safari Gold", hex: "#C59B3B" },
];

export interface BuiltVehicleBundle {
  group: THREE.Group;
  paintMaterial: THREE.MeshPhysicalMaterial;
  headlightMaterial: THREE.MeshStandardMaterial;
  taillightMaterial: THREE.MeshStandardMaterial;
  wheels: THREE.Object3D[];
}

export function createStudioFloorTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    const grad = ctx.createRadialGradient(
      size / 2,
      size / 2,
      size * 0.04,
      size / 2,
      size / 2,
      size * 0.5
    );
    grad.addColorStop(0, "#1c2c46");
    grad.addColorStop(0.55, "#111e33");
    grad.addColorStop(1, "#091220");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // Subtle architectural floor grain & concentric showroom rings
    ctx.strokeStyle = "rgba(197, 155, 59, 0.14)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size * 0.24, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;
    for (let r = 0.12; r <= 0.45; r += 0.11) {
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size * r, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createContactShadowTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    ctx.clearRect(0, 0, size, size);
    const grad = ctx.createRadialGradient(
      size / 2,
      size / 2,
      size * 0.08,
      size / 2,
      size / 2,
      size * 0.48
    );
    grad.addColorStop(0, "rgba(2, 6, 14, 0.85)");
    grad.addColorStop(0.55, "rgba(2, 6, 14, 0.42)");
    grad.addColorStop(1, "rgba(2, 6, 14, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export function createLicensePlateTexture(text: string): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, 256, 64);
    ctx.strokeStyle = "#0e2444";
    ctx.lineWidth = 4;
    ctx.strokeRect(3, 3, 250, 58);

    // Uganda band on left
    ctx.fillStyle = "#0e2444";
    ctx.fillRect(5, 5, 42, 54);
    ctx.fillStyle = "#c59b3b";
    ctx.font = "bold 16px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("UG", 26, 33);

    ctx.fillStyle = "#0e2444";
    ctx.font = "bold 28px monospace";
    ctx.fillText(text, 150, 34);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function buildWheel(
  radius: number,
  width: number,
  spokeCount: number,
  castShadow: boolean
): THREE.Group {
  const wheel = new THREE.Group();

  const rubberMat = new THREE.MeshStandardMaterial({
    color: 0x16191f,
    roughness: 0.86,
    metalness: 0.05,
  });

  const rimMat = new THREE.MeshStandardMaterial({
    color: 0xdbe4f0,
    roughness: 0.22,
    metalness: 0.88,
  });

  const darkHubMat = new THREE.MeshStandardMaterial({
    color: 0x0e2444,
    roughness: 0.35,
    metalness: 0.6,
  });

  const caliperMat = new THREE.MeshStandardMaterial({
    color: 0xc59b3b,
    roughness: 0.3,
    metalness: 0.72,
  });

  // Tire cylinder
  const tireGeo = new THREE.CylinderGeometry(radius, radius, width, 28);
  tireGeo.rotateZ(Math.PI / 2);
  const tire = new THREE.Mesh(tireGeo, rubberMat);
  tire.castShadow = castShadow;
  tire.receiveShadow = true;
  wheel.add(tire);

  // Sidewall bevel torus on outer and inner edges
  const bevelGeo = new THREE.TorusGeometry(radius * 0.82, width * 0.16, 10, 28);
  bevelGeo.rotateY(Math.PI / 2);
  const outerBevel = new THREE.Mesh(bevelGeo, rubberMat);
  outerBevel.position.x = width * 0.36;
  wheel.add(outerBevel);

  const innerBevel = new THREE.Mesh(bevelGeo, rubberMat);
  innerBevel.position.x = -width * 0.36;
  wheel.add(innerBevel);

  // Recessed alloy barrel
  const barrelGeo = new THREE.CylinderGeometry(
    radius * 0.64,
    radius * 0.64,
    width * 0.88,
    24
  );
  barrelGeo.rotateZ(Math.PI / 2);
  const barrel = new THREE.Mesh(barrelGeo, darkHubMat);
  wheel.add(barrel);

  // Outer alloy lip
  const lipGeo = new THREE.TorusGeometry(radius * 0.62, 0.022, 10, 28);
  lipGeo.rotateY(Math.PI / 2);
  const lip = new THREE.Mesh(lipGeo, rimMat);
  lip.position.x = width * 0.45;
  wheel.add(lip);

  // Spokes
  const spokeGeo = new THREE.BoxGeometry(0.03, radius * 0.56, 0.052);
  for (let i = 0; i < spokeCount; i++) {
    const angle = (i / spokeCount) * Math.PI * 2;
    const spoke = new THREE.Mesh(spokeGeo, rimMat);
    spoke.position.set(
      width * 0.42,
      Math.cos(angle) * radius * 0.3,
      Math.sin(angle) * radius * 0.3
    );
    spoke.rotation.x = angle;
    wheel.add(spoke);
  }

  // Center gold emblem cap
  const capGeo = new THREE.CylinderGeometry(
    radius * 0.16,
    radius * 0.16,
    0.04,
    18
  );
  capGeo.rotateZ(Math.PI / 2);
  const cap = new THREE.Mesh(capGeo, caliperMat);
  cap.position.x = width * 0.44;
  wheel.add(cap);

  return wheel;
}

function makeExtrudedProfile(
  points: [number, number][],
  width: number,
  bevelSize = 0.04,
  bevelThickness = 0.04
): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) {
    shape.lineTo(points[i][0], points[i][1]);
  }
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: width,
    bevelEnabled: true,
    bevelSegments: 3,
    steps: 1,
    bevelSize,
    bevelThickness,
  });

  // Center along Z then rotate so profile X becomes vehicle length (Z), profile Y stays height (Y), depth becomes width (X)
  geo.translate(0, 0, -width / 2);
  geo.rotateY(Math.PI / 2);
  geo.computeVertexNormals();
  return geo;
}

function groundGroupToZero(group: THREE.Group) {
  group.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(group);
  if (Number.isFinite(box.min.y)) {
    group.position.y -= box.min.y;
  }
}

export function buildProceduralVehicle(
  type: ShowroomVehicleType,
  paintHex: string,
  headlightsOn: boolean,
  castShadow: boolean
): BuiltVehicleBundle {
  const group = new THREE.Group();
  const wheels: THREE.Object3D[] = [];

  const paintMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(paintHex),
    metalness: 0.58,
    roughness: 0.26,
    clearcoat: 0.92,
    clearcoatRoughness: 0.1,
  });

  const trimDarkMat = new THREE.MeshStandardMaterial({
    color: 0x151b26,
    roughness: 0.65,
    metalness: 0.25,
  });

  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xe6eef8,
    roughness: 0.14,
    metalness: 0.94,
  });

  const goldAccentMat = new THREE.MeshStandardMaterial({
    color: 0xc59b3b,
    roughness: 0.24,
    metalness: 0.86,
  });

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x0b1628,
    roughness: 0.08,
    metalness: 0.18,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
  });

  const headlightMaterial = new THREE.MeshStandardMaterial({
    color: 0xf8fbff,
    emissive: new THREE.Color(0xfff1c9),
    emissiveIntensity: headlightsOn ? 2.4 : 0.15,
    roughness: 0.12,
    metalness: 0.1,
  });

  const taillightMaterial = new THREE.MeshStandardMaterial({
    color: 0xb91c1c,
    emissive: new THREE.Color(0xef4444),
    emissiveIntensity: headlightsOn ? 1.8 : 0.25,
    roughness: 0.18,
    metalness: 0.15,
  });

  const plateTexture = createLicensePlateTexture("UBQ 420M");
  const plateMat = new THREE.MeshStandardMaterial({
    map: plateTexture,
    roughness: 0.4,
    metalness: 0.1,
  });

  const addMesh = (
    geo: THREE.BufferGeometry,
    mat: THREE.Material,
    x = 0,
    y = 0,
    z = 0,
    shadow = castShadow
  ) => {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = shadow;
    mesh.receiveShadow = true;
    group.add(mesh);
    return mesh;
  };

  if (type === "saloon") {
    // Lower sculpted body profile (Z is front = +2.3, rear = -2.25)
    // In profile space before rotateY(PI/2), X maps to -Z, so negate X for front (+Z)
    const bodyGeo = makeExtrudedProfile(
      [
        [-2.25, 0.36],
        [2.2, 0.36],
        [2.26, 0.62],
        [2.16, 0.88],
        [1.15, 0.96],
        [-1.35, 0.98],
        [-2.18, 0.9],
        [-2.28, 0.6],
      ],
      1.68,
      0.06,
      0.06
    );
    addMesh(bodyGeo, paintMaterial);

    // Swept cabin greenhouse
    const cabinGeo = makeExtrudedProfile(
      [
        [-1.35, 0.95],
        [1.08, 0.94],
        [0.45, 1.48],
        [-0.78, 1.48],
      ],
      1.36,
      0.045,
      0.045
    );
    addMesh(cabinGeo, paintMaterial);

    // Tinted glass wrap inset
    const glassGeo = makeExtrudedProfile(
      [
        [-1.24, 0.99],
        [0.98, 0.98],
        [0.42, 1.43],
        [-0.74, 1.43],
      ],
      1.42,
      0.02,
      0.02
    );
    addMesh(glassGeo, glassMat, 0, 0, 0, false);

    // Underbody rocker trim
    addMesh(new THREE.BoxGeometry(1.76, 0.11, 4.32), trimDarkMat, 0, 0.35, 0);

    // Front radiator grille + horizontal chrome slats + gold badge
    addMesh(new THREE.BoxGeometry(0.92, 0.24, 0.12), trimDarkMat, 0, 0.62, 2.26);
    for (let i = -1; i <= 1; i++) {
      addMesh(
        new THREE.BoxGeometry(0.84, 0.022, 0.14),
        chromeMat,
        0,
        0.62 + i * 0.065,
        2.265,
        false
      );
    }
    addMesh(new THREE.BoxGeometry(0.14, 0.1, 0.16), goldAccentMat, 0, 0.64, 2.27, false);

    // Dual LED headlights
    addMesh(new THREE.BoxGeometry(0.36, 0.13, 0.14), headlightMaterial, -0.62, 0.72, 2.22, false);
    addMesh(new THREE.BoxGeometry(0.36, 0.13, 0.14), headlightMaterial, 0.62, 0.72, 2.22, false);

    // Wraparound tail lights & trunk chrome bar
    addMesh(new THREE.BoxGeometry(0.46, 0.14, 0.12), taillightMaterial, -0.58, 0.78, -2.23, false);
    addMesh(new THREE.BoxGeometry(0.46, 0.14, 0.12), taillightMaterial, 0.58, 0.78, -2.23, false);
    addMesh(new THREE.BoxGeometry(0.95, 0.035, 0.08), chromeMat, 0, 0.78, -2.26, false);

    // Side mirrors
    addMesh(new THREE.BoxGeometry(0.22, 0.1, 0.14), paintMaterial, -0.92, 1.04, 0.58);
    addMesh(new THREE.BoxGeometry(0.22, 0.1, 0.14), paintMaterial, 0.92, 1.04, 0.58);

    // Chrome window beltline & door handles
    addMesh(new THREE.BoxGeometry(1.78, 0.028, 2.15), chromeMat, 0, 0.96, -0.1, false);
    addMesh(new THREE.BoxGeometry(1.82, 0.03, 0.18), chromeMat, 0, 0.86, 0.25, false);
    addMesh(new THREE.BoxGeometry(1.82, 0.03, 0.18), chromeMat, 0, 0.86, -0.62, false);

    // License plates front & rear
    addMesh(new THREE.BoxGeometry(0.46, 0.12, 0.03), plateMat, 0, 0.45, 2.31, false);
    addMesh(new THREE.BoxGeometry(0.46, 0.12, 0.03), plateMat, 0, 0.54, -2.29, false);

    // Dual chrome exhaust tips
    const exGeo = new THREE.CylinderGeometry(0.042, 0.042, 0.18, 14);
    exGeo.rotateX(Math.PI / 2);
    addMesh(exGeo, chromeMat, -0.52, 0.34, -2.28, false);
    addMesh(exGeo, chromeMat, 0.52, 0.34, -2.28, false);

    // 4 wheels
    const wheelPositions: [number, number, number][] = [
      [-0.86, 0.36, 1.38],
      [0.86, 0.36, 1.38],
      [-0.86, 0.36, -1.36],
      [0.86, 0.36, -1.36],
    ];
    for (const [wx, wy, wz] of wheelPositions) {
      const w = buildWheel(0.35, 0.22, 5, castShadow);
      w.position.set(wx, wy, wz);
      if (wx < 0) w.rotation.y = Math.PI;
      group.add(w);
      wheels.push(w);
    }
  } else if (type === "suv") {
    // 4x4 Land Cruiser VIP SUV
    const bodyGeo = makeExtrudedProfile(
      [
        [-2.35, 0.52],
        [2.32, 0.52],
        [2.4, 0.82],
        [2.3, 1.2],
        [1.15, 1.24],
        [-2.25, 1.24],
        [-2.38, 0.84],
      ],
      1.86,
      0.065,
      0.065
    );
    addMesh(bodyGeo, paintMaterial);

    // Upright commanding SUV greenhouse
    const cabinGeo = makeExtrudedProfile(
      [
        [-2.14, 1.2],
        [1.1, 1.2],
        [0.64, 1.9],
        [-2.0, 1.9],
      ],
      1.66,
      0.05,
      0.05
    );
    addMesh(cabinGeo, paintMaterial);

    // Tinted SUV glass wrap
    const glassGeo = makeExtrudedProfile(
      [
        [-2.04, 1.24],
        [1.02, 1.24],
        [0.6, 1.84],
        [-1.92, 1.84],
      ],
      1.72,
      0.02,
      0.02
    );
    addMesh(glassGeo, glassMat, 0, 0, 0, false);

    // Rugged fender cladding & side running boards
    addMesh(new THREE.BoxGeometry(2.04, 0.1, 2.25), trimDarkMat, 0, 0.44, 0);
    addMesh(new THREE.BoxGeometry(2.08, 0.04, 2.15), chromeMat, 0, 0.48, 0, false);

    // Heavy front skid plate & rear diffuser
    addMesh(new THREE.BoxGeometry(1.5, 0.16, 0.25), chromeMat, 0, 0.48, 2.34);
    addMesh(new THREE.BoxGeometry(1.88, 0.2, 0.2), trimDarkMat, 0, 0.54, -2.35);

    // Bold vertical chrome grille
    addMesh(new THREE.BoxGeometry(1.12, 0.44, 0.14), trimDarkMat, 0, 0.94, 2.38);
    for (let i = -3; i <= 3; i++) {
      addMesh(
        new THREE.BoxGeometry(0.032, 0.36, 0.16),
        chromeMat,
        i * 0.14,
        0.94,
        2.39,
        false
      );
    }
    addMesh(new THREE.BoxGeometry(0.2, 0.14, 0.18), goldAccentMat, 0, 0.96, 2.41, false);

    // High LED headlights & fog lights
    addMesh(new THREE.BoxGeometry(0.4, 0.18, 0.14), headlightMaterial, -0.74, 1.04, 2.35, false);
    addMesh(new THREE.BoxGeometry(0.4, 0.18, 0.14), headlightMaterial, 0.74, 1.04, 2.35, false);
    addMesh(new THREE.BoxGeometry(0.22, 0.09, 0.12), headlightMaterial, -0.76, 0.68, 2.39, false);
    addMesh(new THREE.BoxGeometry(0.22, 0.09, 0.12), headlightMaterial, 0.76, 0.68, 2.39, false);

    // Vertical LED tail lights
    addMesh(new THREE.BoxGeometry(0.22, 0.42, 0.12), taillightMaterial, -0.84, 1.06, -2.36, false);
    addMesh(new THREE.BoxGeometry(0.22, 0.42, 0.12), taillightMaterial, 0.84, 1.06, -2.36, false);

    // Aluminum roof rails
    addMesh(new THREE.BoxGeometry(0.06, 0.07, 2.35), chromeMat, -0.68, 1.98, -0.68);
    addMesh(new THREE.BoxGeometry(0.06, 0.07, 2.35), chromeMat, 0.68, 1.98, -0.68);

    // Side mirrors
    addMesh(new THREE.BoxGeometry(0.26, 0.14, 0.16), paintMaterial, -1.04, 1.32, 0.75);
    addMesh(new THREE.BoxGeometry(0.26, 0.14, 0.16), paintMaterial, 1.04, 1.32, 0.75);

    // License plates
    addMesh(new THREE.BoxGeometry(0.48, 0.13, 0.03), plateMat, 0, 0.62, 2.43, false);
    addMesh(new THREE.BoxGeometry(0.48, 0.13, 0.03), plateMat, 0, 0.92, -2.4, false);

    // 4 chunky all-terrain wheels
    const wheelPositions: [number, number, number][] = [
      [-0.95, 0.46, 1.46],
      [0.95, 0.46, 1.46],
      [-0.95, 0.46, -1.42],
      [0.95, 0.46, -1.42],
    ];
    for (const [wx, wy, wz] of wheelPositions) {
      const w = buildWheel(0.45, 0.28, 6, castShadow);
      w.position.set(wx, wy, wz);
      if (wx < 0) w.rotation.y = Math.PI;
      group.add(w);
      wheels.push(w);
    }
  } else {
    // Commercial High-Roof Cargo & Moving Van (HiAce / 1.5T Mover)
    const bodyGeo = makeExtrudedProfile(
      [
        [-2.5, 0.46],
        [2.38, 0.46],
        [2.46, 0.98],
        [2.24, 1.32],
        [1.76, 2.18],
        [-2.42, 2.18],
        [-2.52, 1.2],
      ],
      1.84,
      0.06,
      0.06
    );
    addMesh(bodyGeo, paintMaterial);

    // Front cab windshield & side cab windows
    const windshieldGeo = makeExtrudedProfile(
      [
        [1.15, 1.26],
        [2.24, 1.26],
        [1.78, 2.06],
        [1.15, 2.06],
      ],
      1.78,
      0.02,
      0.02
    );
    addMesh(windshieldGeo, glassMat, 0, 0, 0, false);

    // Navy & Gold Mufasa corporate side livery stripe
    addMesh(new THREE.BoxGeometry(1.98, 0.14, 3.55), goldAccentMat, 0, 1.05, -0.62, false);
    addMesh(new THREE.BoxGeometry(1.97, 0.08, 3.55), trimDarkMat, 0, 0.93, -0.62, false);

    // Corrugated cargo bay panel ribs
    for (let z = -2.1; z <= 0.7; z += 0.56) {
      addMesh(new THREE.BoxGeometry(1.98, 0.75, 0.035), trimDarkMat, 0, 1.62, z, false);
    }

    // Heavy-duty bumpers front & rear
    addMesh(new THREE.BoxGeometry(1.96, 0.26, 0.24), trimDarkMat, 0, 0.56, 2.42);
    addMesh(new THREE.BoxGeometry(1.96, 0.24, 0.22), trimDarkMat, 0, 0.56, -2.48);

    // Front grille & badge
    addMesh(new THREE.BoxGeometry(1.18, 0.28, 0.12), trimDarkMat, 0, 0.98, 2.45);
    addMesh(new THREE.BoxGeometry(0.18, 0.12, 0.16), goldAccentMat, 0, 1.0, 2.47, false);

    // Headlights & vertical commercial tail lamps
    addMesh(new THREE.BoxGeometry(0.36, 0.2, 0.14), headlightMaterial, -0.74, 1.0, 2.44, false);
    addMesh(new THREE.BoxGeometry(0.36, 0.2, 0.14), headlightMaterial, 0.74, 1.0, 2.44, false);
    addMesh(new THREE.BoxGeometry(0.18, 0.56, 0.12), taillightMaterial, -0.84, 1.12, -2.5, false);
    addMesh(new THREE.BoxGeometry(0.18, 0.56, 0.12), taillightMaterial, 0.84, 1.12, -2.5, false);

    // Rear double cargo door seam & chrome latches
    addMesh(new THREE.BoxGeometry(0.03, 1.48, 0.06), trimDarkMat, 0, 1.38, -2.52, false);
    addMesh(new THREE.BoxGeometry(0.16, 0.06, 0.08), chromeMat, -0.14, 1.06, -2.54, false);

    // Commercial side mirrors & roof cargo rack
    addMesh(new THREE.BoxGeometry(0.24, 0.22, 0.12), trimDarkMat, -1.04, 1.56, 1.68);
    addMesh(new THREE.BoxGeometry(0.24, 0.22, 0.12), trimDarkMat, 1.04, 1.56, 1.68);
    addMesh(new THREE.BoxGeometry(1.52, 0.05, 3.1), trimDarkMat, 0, 2.28, -0.68);
    addMesh(new THREE.BoxGeometry(1.52, 0.04, 0.08), goldAccentMat, 0, 2.31, 0.82, false);

    // License plates
    addMesh(new THREE.BoxGeometry(0.48, 0.13, 0.03), plateMat, 0, 0.58, 2.55, false);
    addMesh(new THREE.BoxGeometry(0.48, 0.13, 0.03), plateMat, 0, 0.82, -2.55, false);

    // 4 heavy-duty wheels
    const wheelPositions: [number, number, number][] = [
      [-0.93, 0.4, 1.62],
      [0.93, 0.4, 1.62],
      [-0.93, 0.4, -1.52],
      [0.93, 0.4, -1.52],
    ];
    for (const [wx, wy, wz] of wheelPositions) {
      const w = buildWheel(0.39, 0.25, 6, castShadow);
      w.position.set(wx, wy, wz);
      if (wx < 0) w.rotation.y = Math.PI;
      group.add(w);
      wheels.push(w);
    }
  }

  groundGroupToZero(group);

  return {
    group,
    paintMaterial,
    headlightMaterial,
    taillightMaterial,
    wheels,
  };
}
