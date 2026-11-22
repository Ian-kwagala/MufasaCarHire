import React from "react";
import type { Review, SiteSettings, Vehicle } from "@/lib/types";
import { buildLocalBusinessJsonLd, serializeJsonLd } from "@/lib/seo";

/**
 * Embeds Schema.org LocalBusiness + AutoRental JSON-LD structured data
 * globally via the root layout so every route serves consistent local SEO signals
 * for "Kampala car hire" and "Entebbe airport transfers".
 */
export function LocalBusinessJsonLd({
  settings,
  vehicles,
  reviews,
}: {
  settings: SiteSettings;
  vehicles: Vehicle[];
  reviews: Review[];
}) {
  const schema = buildLocalBusinessJsonLd({ settings, vehicles, reviews });

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }}
    />
  );
}
