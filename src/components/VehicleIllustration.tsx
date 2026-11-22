"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Maximize2, Pause, Play, Video } from "lucide-react";
import { EASE_SMOOTH } from "./MotionPrimitives";

interface VehicleIllustrationProps {
  imageUrl?: string;
  videoUrl?: string;
  name: string;
  category: string;
  /** When true (e.g., card is hovered on desktop), plays the looping showcase video */
  isHovered?: boolean;
  /** Optional callback to open the full video / comparison modal */
  onOpenVideo?: () => void;
  /** Compact height option for smaller preview tiles */
  compact?: boolean;
}

/**
 * Interactive vehicle media frame that displays a high-resolution photo and
 * seamlessly transitions into a looping HTML5 showcase video on hover or tap,
 * with a clean vector silhouette fallback if media is unavailable.
 */
export function VehicleIllustration({
  imageUrl,
  videoUrl,
  name,
  category,
  isHovered = false,
  onOpenVideo,
  compact = false,
}: VehicleIllustrationProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [manualPlay, setManualPlay] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const hasVideo = Boolean(videoUrl && !videoError);
  const shouldPlay = hasVideo && (isHovered || manualPlay);
  const heightClass = compact ? "h-40" : "h-52";

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !hasVideo) return;

    if (shouldPlay) {
      const playPromise = el.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {
          // Ignore autoplay interruption when pointer leaves quickly
        });
      }
    } else {
      el.pause();
      setIsPlaying(false);
    }
  }, [shouldPlay, hasVideo]);

  if (imageUrl && !imageError) {
    return (
      <div
        className={`relative ${heightClass} w-full overflow-hidden rounded-t-2xl bg-navy-dark select-none`}
      >
        {/* Base High-Res Vehicle Photo */}
        <img
          src={imageUrl}
          alt={name}
          referrerPolicy="no-referrer"
          onError={() => setImageError(true)}
          className={`h-full w-full object-cover transition-transform duration-700 ease-out ${
            isHovered ? "scale-105" : "scale-100"
          }`}
        />

        {/* Looping Showcase HTML5 Video Layer */}
        {hasVideo && (
          <video
            ref={videoRef}
            src={videoUrl}
            poster={imageUrl}
            muted
            loop
            playsInline
            preload="metadata"
            onCanPlay={() => setVideoReady(true)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onError={() => setVideoError(true)}
            onTimeUpdate={(e) => {
              const target = e.currentTarget;
              if (target.duration > 0) {
                setVideoProgress((target.currentTime / target.duration) * 100);
              }
            }}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
              shouldPlay && videoReady ? "opacity-100" : "opacity-0"
            }`}
          />
        )}

        {/* Measured Bottom Contrast Scrim */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-navy-dark/80 via-navy-dark/30 to-transparent"
        />

        {/* Video Controls Overlay (Bottom Bar) */}
        {hasVideo && (
          <div className="absolute inset-x-3 bottom-3 z-10 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setManualPlay((prev) => !prev);
              }}
              aria-label={isPlaying ? `Pause ${name} video` : `Play ${name} video`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-navy/85 px-2.5 py-1.5 text-[11px] font-bold text-white backdrop-blur-xs border border-white/15 transition-colors hover:bg-navy hover:border-gold/70 hover:text-gold whitespace-nowrap"
            >
              {isPlaying ? (
                <>
                  <Pause className="h-3 w-3 text-gold" />
                  <span>Playing Video</span>
                </>
              ) : (
                <>
                  <Play className="h-3 w-3 text-gold fill-gold" />
                  <span>Video Preview</span>
                </>
              )}
            </button>

            {onOpenVideo && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenVideo();
                }}
                aria-label={`Open full video walkaround for ${name}`}
                className="inline-flex items-center gap-1 rounded-lg bg-navy/85 px-2.5 py-1.5 text-[11px] font-bold text-white backdrop-blur-xs border border-white/15 transition-colors hover:bg-gold hover:text-navy hover:border-gold whitespace-nowrap"
              >
                <Maximize2 className="h-3 w-3" />
                <span>Inspect</span>
              </button>
            )}
          </div>
        )}

        {/* Animated Gold Progress Rail While Video Plays */}
        {hasVideo && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-white/15">
            <motion.div
              className="h-full bg-gold origin-left"
              animate={{
                scaleX: isPlaying ? Math.max(0.06, videoProgress / 100) : 0,
                opacity: isPlaying ? 1 : 0,
              }}
              transition={{ duration: 0.2, ease: EASE_SMOOTH }}
            />
          </div>
        )}
      </div>
    );
  }

  // Fallback Vector Silhouette when no photo is configured
  const lower = `${name} ${category}`.toLowerCase();
  const isTruck =
    lower.includes("truck") || lower.includes("canter") || lower.includes("cargo");
  const isBusOrVan =
    lower.includes("coaster") || lower.includes("hiace") || lower.includes("bus");
  const isSuv =
    lower.includes("cruiser") || lower.includes("suv") || lower.includes("4x4");

  return (
    <div
      className={`relative flex ${heightClass} w-full flex-col items-center justify-center overflow-hidden rounded-t-2xl bg-gradient-to-br from-navy via-navy-light to-navy-dark p-6 text-white`}
    >
      {hasVideo && onOpenVideo && (
        <button
          type="button"
          onClick={onOpenVideo}
          className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-gold hover:bg-white/20"
        >
          <Video className="h-3 w-3" />
          <span>Watch Video</span>
        </button>
      )}

      {isTruck ? (
        <svg viewBox="0 0 160 80" className="h-24 w-40" fill="none">
          <rect
            x="14"
            y="16"
            width="84"
            height="42"
            rx="4"
            fill="#FFFFFF"
            fillOpacity="0.95"
          />
          <path d="M98 28H128L142 42V58H98V28Z" fill="#C59B3B" />
          <path d="M106 33H125L135 43H106V33Z" fill="#0E2444" />
          <circle cx="38" cy="60" r="10" fill="#09182E" stroke="#C59B3B" strokeWidth="3" />
          <circle cx="122" cy="60" r="10" fill="#09182E" stroke="#C59B3B" strokeWidth="3" />
          <text
            x="56"
            y="42"
            textAnchor="middle"
            fill="#0E2444"
            fontSize="10"
            fontWeight="bold"
          >
            MUFASA CARGO
          </text>
        </svg>
      ) : isBusOrVan ? (
        <svg viewBox="0 0 160 80" className="h-24 w-40" fill="none">
          <rect
            x="14"
            y="18"
            width="128"
            height="40"
            rx="10"
            fill="#FFFFFF"
            fillOpacity="0.95"
          />
          <rect x="24" y="25" width="22" height="14" rx="2" fill="#0E2444" />
          <rect x="52" y="25" width="22" height="14" rx="2" fill="#0E2444" />
          <rect x="80" y="25" width="22" height="14" rx="2" fill="#0E2444" />
          <path d="M108 25H132L137 39H108V25Z" fill="#0E2444" />
          <rect x="14" y="46" width="128" height="4" fill="#C59B3B" />
          <circle cx="42" cy="60" r="10" fill="#09182E" stroke="#C59B3B" strokeWidth="3" />
          <circle cx="118" cy="60" r="10" fill="#09182E" stroke="#C59B3B" strokeWidth="3" />
        </svg>
      ) : isSuv ? (
        <svg viewBox="0 0 160 80" className="h-24 w-40" fill="none">
          <path
            d="M16 42L26 22H106L128 36L144 40V56H16V42Z"
            fill="#FFFFFF"
            fillOpacity="0.95"
          />
          <path d="M32 26H68V38H24L32 26Z" fill="#0E2444" />
          <path d="M74 26H102L118 38H74V26Z" fill="#0E2444" />
          <rect x="12" y="46" width="136" height="4" rx="2" fill="#C59B3B" />
          <circle cx="42" cy="58" r="11" fill="#09182E" stroke="#C59B3B" strokeWidth="3" />
          <circle cx="118" cy="58" r="11" fill="#09182E" stroke="#C59B3B" strokeWidth="3" />
        </svg>
      ) : (
        <svg viewBox="0 0 160 80" className="h-24 w-40" fill="none">
          <path
            d="M16 46L26 38L46 24H102L124 38L144 43V56H16V46Z"
            fill="#FFFFFF"
            fillOpacity="0.95"
          />
          <path d="M49 28H75V38H34L49 28Z" fill="#0E2444" />
          <path d="M80 28H100L116 38H80V28Z" fill="#0E2444" />
          <rect x="20" y="46" width="120" height="3" fill="#C59B3B" />
          <circle cx="42" cy="57" r="10" fill="#09182E" stroke="#C59B3B" strokeWidth="3" />
          <circle cx="118" cy="57" r="10" fill="#09182E" stroke="#C59B3B" strokeWidth="3" />
        </svg>
      )}
      <span className="mt-1 text-xs font-semibold text-white/75">{category}</span>
    </div>
  );
}
