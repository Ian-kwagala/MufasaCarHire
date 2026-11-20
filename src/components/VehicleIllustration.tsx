import React from "react";

/**
 * Displays the uploaded vehicle photo if available, or a clean vector silhouette
 * tailored to the vehicle category so the site looks polished out of the box.
 */
export function VehicleIllustration({
  imageUrl,
  name,
  category,
}: {
  imageUrl?: string;
  name: string;
  category: string;
}) {
  if (imageUrl) {
    return (
      <div className="relative h-48 w-full overflow-hidden rounded-t-2xl bg-slate-100">
        <img
          src={imageUrl}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
    );
  }

  const lower = `${name} ${category}`.toLowerCase();
  const isTruck = lower.includes("truck") || lower.includes("canter") || lower.includes("cargo");
  const isBusOrVan = lower.includes("coaster") || lower.includes("hiace") || lower.includes("bus");
  const isSuv = lower.includes("cruiser") || lower.includes("suv") || lower.includes("4x4");

  return (
    <div className="relative flex h-48 w-full flex-col items-center justify-center overflow-hidden rounded-t-2xl bg-gradient-to-br from-navy via-navy-light to-navy-dark p-6 text-white">
      <div className="absolute right-3 top-3 rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold text-gold">
        Photo Preview Ready
      </div>

      {isTruck ? (
        <svg viewBox="0 0 160 80" className="h-24 w-40" fill="none">
          <rect x="14" y="16" width="84" height="42" rx="4" fill="#FFFFFF" fillOpacity="0.95" />
          <path d="M98 28H128L142 42V58H98V28Z" fill="#C59B3B" />
          <path d="M106 33H125L135 43H106V33Z" fill="#0E2444" />
          <circle cx="38" cy="60" r="10" fill="#09182E" stroke="#C59B3B" strokeWidth="3" />
          <circle cx="122" cy="60" r="10" fill="#09182E" stroke="#C59B3B" strokeWidth="3" />
          <text x="56" y="42" textAnchor="middle" fill="#0E2444" fontSize="10" fontWeight="bold">
            MUFASA CARGO
          </text>
        </svg>
      ) : isBusOrVan ? (
        <svg viewBox="0 0 160 80" className="h-24 w-40" fill="none">
          <rect x="14" y="18" width="128" height="40" rx="10" fill="#FFFFFF" fillOpacity="0.95" />
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
