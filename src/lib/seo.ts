import type { Review, SiteSettings, Vehicle } from "./types";
import { normalizeWhatsAppNumber } from "./whatsapp";

export function getSiteBaseUrl(): string {
  const envUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl && /^https?:\/\//i.test(envUrl)) {
    return envUrl.replace(/\/+$/, "");
  }
  return "https://mufasacarhire.ug";
}

/**
 * Builds Schema.org LocalBusiness + AutoRental JSON-LD structured data
 * optimized for "Kampala car hire" and "Entebbe airport transfers".
 */
export function buildLocalBusinessJsonLd(params: {
  settings: SiteSettings;
  vehicles?: Vehicle[];
  reviews?: Review[];
}): Record<string, unknown> {
  const { settings, vehicles = [], reviews = [] } = params;
  const baseUrl = getSiteBaseUrl();
  const primaryPhone = `+${normalizeWhatsAppNumber(settings.primary_whatsapp)}`;
  const secondaryPhone = settings.secondary_whatsapp
    ? `+${normalizeWhatsAppNumber(settings.secondary_whatsapp)}`
    : undefined;

  const sameAs = [settings.facebook_url, settings.instagram_url].filter(
    (u): u is string => Boolean(u && u.trim())
  );

  const airportRateUgx = Number(settings.airport_rate_ugx || 80000);
  const selfDriveUgx = Number(settings.self_drive_daily_ugx || 120000);

  const catalogOffers: Record<string, unknown>[] = [
    {
      "@type": "Offer",
      name: "Entebbe Airport Transfers (Entebbe ↔ Kampala)",
      description:
        "Fixed-rate Entebbe International Airport pickup and drop-off to Kampala hotels, Kololo, Nakasero, Muyenga, and Munyonyo with live flight tracking.",
      price: String(airportRateUgx),
      priceCurrency: "UGX",
      url: `${baseUrl}/airport-transfers`,
      availability: "https://schema.org/InStock",
    },
    {
      "@type": "Offer",
      name: "Kampala Car Hire & Day-1 Self-Drive",
      description:
        "GPS-tracked, insured Toyota Premio, Fielder, Wish, Noah, and executive Land Cruisers available chauffeur-driven or self-drive in Kampala.",
      price: String(selfDriveUgx),
      priceCurrency: "UGX",
      url: `${baseUrl}/fleet`,
      availability: "https://schema.org/InStock",
    },
    {
      "@type": "Offer",
      name: "Moving & Cargo Logistics Kampala",
      description:
        "1–3 tonne cargo vans and 3–5 tonne Fuso Canter box trucks for home moves, office relocations, and Kikubo/Owino SME deliveries.",
      url: `${baseUrl}/moving-cargo`,
      availability: "https://schema.org/InStock",
    },
    {
      "@type": "Offer",
      name: "Corporate, NGO Retainers & Hotel Transfers",
      description:
        "Monthly vehicle retainers with SLA reliability, consolidated invoicing, and 10% hotel concierge referral partnerships.",
      url: `${baseUrl}/corporate`,
      availability: "https://schema.org/InStock",
    },
  ];

  // Include active fixed-rate fleet vehicles in the catalog
  for (const v of vehicles.filter((item) => item.active === 1 && item.rate_ugx)) {
    catalogOffers.push({
      "@type": "Offer",
      itemOffered: {
        "@type": "Vehicle",
        name: v.name,
        description: v.best_uses,
        vehicleSeatingCapacity: v.seats,
      },
      price: String(v.rate_ugx),
      priceCurrency: "UGX",
      url: `${baseUrl}/fleet?vehicle=${v.id}`,
      availability: "https://schema.org/InStock",
    });
  }

  const activeReviews = reviews.filter((r) => r.active === 1);
  const avgRating =
    activeReviews.length > 0
      ? Number(
          (
            activeReviews.reduce((sum, r) => sum + Number(r.rating || 5), 0) /
            activeReviews.length
          ).toFixed(1)
        )
      : 5;

  const contactPoints: Record<string, unknown>[] = [
    {
      "@type": "ContactPoint",
      telephone: primaryPhone,
      contactType: "reservations",
      availableLanguage: ["English", "Luganda", "Swahili"],
      areaServed: "UG",
    },
  ];

  if (secondaryPhone) {
    contactPoints.push({
      "@type": "ContactPoint",
      telephone: secondaryPhone,
      contactType: "customer service",
      availableLanguage: ["English", "Luganda"],
      areaServed: "UG",
    });
  }

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "AutoRental"],
    "@id": `${baseUrl}/#localbusiness`,
    name: settings.company_name,
    alternateName: "Mufasa Car Hire Kampala",
    slogan: settings.slogan,
    description:
      "Kampala car hire, fixed-rate Entebbe airport transfers (UGX 80,000), Day-1 self-drive rentals, corporate & NGO retainers, and vetted moving & cargo logistics across Uganda.",
    keywords:
      "Kampala car hire, Entebbe airport transfers, car rental Kampala Uganda, self drive Kampala, chauffeur car hire Uganda, Entebbe airport taxi pickup, Kampala moving vans",
    url: baseUrl,
    telephone: primaryPhone,
    email: settings.official_email,
    priceRange: "UGX 60,000 - UGX 2,200,000",
    currenciesAccepted: "UGX, USD",
    paymentAccepted:
      "MTN Mobile Money, Airtel Money, Cash, Bank Transfer, Corporate Invoice",
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.office_address,
      addressLocality: "Kampala",
      addressRegion: "Central Region",
      addressCountry: "UG",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 0.3712,
      longitude: 32.6425,
    },
    hasMap: settings.google_maps_url || undefined,
    areaServed: [
      { "@type": "City", name: "Kampala" },
      { "@type": "City", name: "Entebbe" },
      { "@type": "Place", name: "Entebbe International Airport" },
      { "@type": "Country", name: "Uganda" },
    ],
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "00:00",
        closes: "23:59",
      },
    ],
    contactPoint: contactPoints,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Kampala Car Hire & Entebbe Airport Transfer Services",
      itemListElement: catalogOffers,
    },
  };

  if (settings.logo_url) {
    jsonLd.logo = settings.logo_url.startsWith("http")
      ? settings.logo_url
      : `${baseUrl}${settings.logo_url}`;
  }

  if (sameAs.length > 0) {
    jsonLd.sameAs = sameAs;
  }

  if (activeReviews.length > 0) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: avgRating,
      reviewCount: activeReviews.length,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return jsonLd;
}

/**
 * Safely serializes JSON-LD to embed inside <script type="application/ld+json">,
 * escaping "<" characters to prevent script tag breakouts.
 */
export function serializeJsonLd(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
