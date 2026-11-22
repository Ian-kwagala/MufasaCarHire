"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AdvancedMarker,
  APIProvider,
  InfoWindow,
  Map as GoogleMap,
  Pin,
  useAdvancedMarkerRef,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import {
  Clock,
  Loader2,
  MapPin,
  MessageCircle,
  Navigation,
  Route as RouteIcon,
  Search,
} from "lucide-react";
import type { SiteSettings } from "@/lib/types";
import { normalizeWhatsAppNumber } from "@/lib/whatsapp";
import { isGmpQuotaError, triggerGmpQuotaBanner } from "./GmpQuotaBanner";

interface ResolvedPoint {
  label: string;
  address: string;
  position: google.maps.LatLngLiteral;
}

interface RouteSummary {
  distanceMeters: number;
  durationMillis: number;
  originPoint: ResolvedPoint;
  destinationPoint: ResolvedPoint;
}

const KAMPALA_CENTER: google.maps.LatLngLiteral = {
  lat: 0.3476,
  lng: 32.5825,
};

const QUICK_ROUTES: {
  id: string;
  label: string;
  originQuery: string;
  destinationQuery: string;
}[] = [
  {
    id: "ebb-kampala",
    label: "Entebbe Airport → Central Kampala",
    originQuery: "Entebbe International Airport, Uganda",
    destinationQuery: "Kampala City Centre, Uganda",
  },
  {
    id: "ebb-kololo",
    label: "Entebbe Airport → Kololo / Nakasero",
    originQuery: "Entebbe International Airport, Uganda",
    destinationQuery: "Kololo, Kampala, Uganda",
  },
  {
    id: "kampala-namugongo",
    label: "Namugongo Dispatch → Entebbe Airport",
    originQuery: "Namugongo Road, Kampala, Uganda",
    destinationQuery: "Entebbe International Airport, Uganda",
  },
  {
    id: "kampala-jinja",
    label: "Kampala → Jinja Highway",
    originQuery: "Kampala, Uganda",
    destinationQuery: "Jinja, Uganda",
  },
];

function formatDuration(durationMillis: number): string {
  const totalMins = Math.max(1, Math.round(durationMillis / 60000));
  if (totalMins < 60) return `${totalMins} mins`;
  const hrs = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  return mins > 0 ? `${hrs} hr ${mins} mins` : `${hrs} hr`;
}

function PlaceAutocompleteInput({
  id,
  label,
  placeholder,
  value,
  onValueChange,
  onPlaceResolved,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onValueChange: (val: string) => void;
  onPlaceResolved: (point: ResolvedPoint) => void;
}) {
  const placesLib = useMapsLibrary("places");
  const sessionTokenRef =
    useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const [suggestions, setSuggestions] = useState<
    google.maps.places.AutocompleteSuggestion[]
  >([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!placesLib || !open) return;
    const trimmed = value.trim();
    if (trimmed.length < 3) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(() => {
      const { AutocompleteSessionToken, AutocompleteSuggestion } = placesLib;
      if (!sessionTokenRef.current) {
        sessionTokenRef.current = new AutocompleteSessionToken();
      }

      setSearching(true);
      AutocompleteSuggestion.fetchAutocompleteSuggestions({
        input: trimmed,
        sessionToken: sessionTokenRef.current,
        includedRegionCodes: ["ug"],
      })
        .then((res) => {
          setSuggestions(res?.suggestions ?? []);
          setSearching(false);
        })
        .catch((err) => {
          setSearching(false);
          setSuggestions([]);
          if (isGmpQuotaError(err)) {
            triggerGmpQuotaBanner();
          }
        });
    }, 260);

    return () => clearTimeout(timer);
  }, [placesLib, value, open]);

  const handleSelect = useCallback(
    async (suggestion: google.maps.places.AutocompleteSuggestion) => {
      if (!placesLib || !suggestion.placePrediction) return;
      try {
        const place = suggestion.placePrediction.toPlace();
        await place.fetchFields({
          fields: ["displayName", "formattedAddress", "location", "viewport"],
        });

        const loc = place.location;
        if (loc) {
          const text =
            place.displayName ||
            place.formattedAddress ||
            suggestion.placePrediction.text.text;
          onValueChange(text);
          onPlaceResolved({
            label: text,
            address: place.formattedAddress || text,
            position: { lat: loc.lat(), lng: loc.lng() },
          });
        }
      } catch (err) {
        if (isGmpQuotaError(err)) {
          triggerGmpQuotaBanner();
        }
      } finally {
        sessionTokenRef.current = null;
        setSuggestions([]);
        setOpen(false);
      }
    },
    [placesLib, onPlaceResolved, onValueChange]
  );

  return (
    <div className="relative">
      <label
        htmlFor={id}
        className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500"
      >
        {label}
      </label>
      <div className="relative mt-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          id={id}
          type="text"
          value={value}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 180)}
          onChange={(e) => {
            onValueChange(e.target.value);
            setOpen(true);
          }}
          placeholder={placeholder}
          className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-8 text-sm font-medium text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/25"
        />
        {searching && (
          <Loader2 className="absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-gold-hover" />
        )}
      </div>

      {open && suggestions.length > 0 && (
        <ul className="absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-xl">
          {suggestions.map((item, idx) => (
            <li key={item.placePrediction?.placeId ?? idx}>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  void handleSelect(item);
                }}
                className="flex w-full items-start gap-2.5 px-3 py-2 text-left text-xs text-navy hover:bg-slate-bg"
              >
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-hover" />
                <span className="font-medium">
                  {item.placePrediction?.text.text}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AnchoredMarker({
  point,
  badgeText,
  background,
  borderColor,
  glyphColor,
}: {
  point: ResolvedPoint;
  badgeText: string;
  background: string;
  borderColor: string;
  glyphColor: string;
}) {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={point.position}
        title={point.label}
        onClick={() => setInfoOpen((prev) => !prev)}
      >
        <Pin
          background={background}
          borderColor={borderColor}
          glyphColor={glyphColor}
          scale={1.15}
        />
      </AdvancedMarker>
      {infoOpen && marker && (
        <InfoWindow
          anchor={marker}
          maxWidth={240}
          onCloseClick={() => setInfoOpen(false)}
        >
          <div className="p-1 text-navy">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-gold-hover">
              {badgeText}
            </div>
            <div className="mt-0.5 text-xs font-extrabold">{point.label}</div>
            {point.address && point.address !== point.label && (
              <div className="mt-0.5 text-[11px] text-slate-600">
                {point.address}
              </div>
            )}
          </div>
        </InfoWindow>
      )}
    </>
  );
}

function RouteLayer({
  originInput,
  destinationInput,
  originResolved,
  destinationResolved,
  requestNonce,
  onRouteComputed,
  onStatusChange,
}: {
  originInput: string;
  destinationInput: string;
  originResolved: ResolvedPoint | null;
  destinationResolved: ResolvedPoint | null;
  requestNonce: number;
  onRouteComputed: (summary: RouteSummary | null) => void;
  onStatusChange: (status: { loading: boolean; error: string | null }) => void;
}) {
  const map = useMap();
  const routesLib = useMapsLibrary("routes");
  const polylinesRef = useRef<google.maps.Polyline[]>([]);

  useEffect(() => {
    if (!routesLib || !map || !originInput.trim() || !destinationInput.trim()) {
      return;
    }

    let cancelled = false;
    polylinesRef.current.forEach((p) => p.setMap(null));
    polylinesRef.current = [];

    onStatusChange({ loading: true, error: null });

    // Modern Routes API SDK wrapper (replaces legacy DirectionsService)
    // Docs: https://developers.google.com/maps/documentation/javascript/routes?utm_campaign=gmp_mcp_codeassist_v1_aistudio
    const routeOrigin = originResolved?.position ?? originInput.trim();
    const routeDestination =
      destinationResolved?.position ?? destinationInput.trim();

    const routesApi = routesLib as unknown as {
      Route: {
        computeRoutes: (req: Record<string, unknown>) => Promise<{
          routes?: Array<{
            distanceMeters?: number;
            durationMillis?: number;
            viewport?: google.maps.LatLngBounds;
            legs?: Array<{
              startLocation?: { latLng?: google.maps.LatLng };
              endLocation?: { latLng?: google.maps.LatLng };
            }>;
            createPolylines: () => google.maps.Polyline[];
          }>;
        }>;
      };
    };

    routesApi.Route.computeRoutes({
      origin: routeOrigin,
      destination: routeDestination,
      travelMode: "DRIVING",
      fields: ["path", "distanceMeters", "durationMillis", "viewport", "legs"],
    })
      .then((response) => {
        if (cancelled) return;
        const primaryRoute = response?.routes?.[0];
        if (!primaryRoute) {
          onStatusChange({
            loading: false,
            error: "No driving route found between those two Uganda locations.",
          });
          onRouteComputed(null);
          return;
        }

        const polylines = primaryRoute.createPolylines();
        polylines.forEach((polyline) => {
          polyline.setOptions({
            strokeColor: "#0E2444",
            strokeOpacity: 0.92,
            strokeWeight: 6,
          });
          polyline.setMap(map);
        });
        polylinesRef.current = polylines;

        if (primaryRoute.viewport) {
          map.fitBounds(primaryRoute.viewport, 60);
        }

        const firstLeg = primaryRoute.legs?.[0];
        const startLatLng = firstLeg?.startLocation?.latLng;
        const endLatLng = firstLeg?.endLocation?.latLng;

        const computedOrigin: ResolvedPoint = originResolved ?? {
          label: originInput.trim(),
          address: originInput.trim(),
          position: startLatLng
            ? { lat: startLatLng.lat(), lng: startLatLng.lng() }
            : KAMPALA_CENTER,
        };

        const computedDest: ResolvedPoint = destinationResolved ?? {
          label: destinationInput.trim(),
          address: destinationInput.trim(),
          position: endLatLng
            ? { lat: endLatLng.lat(), lng: endLatLng.lng() }
            : KAMPALA_CENTER,
        };

        onRouteComputed({
          distanceMeters: primaryRoute.distanceMeters ?? 0,
          durationMillis: primaryRoute.durationMillis ?? 0,
          originPoint: computedOrigin,
          destinationPoint: computedDest,
        });
        onStatusChange({ loading: false, error: null });
      })
      .catch((err) => {
        if (cancelled) return;
        if (isGmpQuotaError(err)) {
          triggerGmpQuotaBanner();
          onStatusChange({
            loading: false,
            error:
              "Live route estimation is temporarily unavailable due to API quota limits.",
          });
        } else {
          onStatusChange({
            loading: false,
            error:
              "Could not compute that driving route. Try choosing a suggestion from the dropdown.",
          });
        }
        onRouteComputed(null);
      });

    return () => {
      cancelled = true;
      polylinesRef.current.forEach((p) => p.setMap(null));
      polylinesRef.current = [];
    };
  }, [
    routesLib,
    map,
    originInput,
    destinationInput,
    originResolved,
    destinationResolved,
    requestNonce,
    onRouteComputed,
    onStatusChange,
  ]);

  return null;
}

export function KampalaRouteMap({
  apiKey,
  settings,
  heading = "Interactive Kampala & Entebbe Route Planner",
  subheading = "Preview live driving distance and travel time between Entebbe Airport, Kampala hotels, and upcountry destinations using Google Maps Platform.",
}: {
  apiKey?: string;
  settings: SiteSettings;
  heading?: string;
  subheading?: string;
}) {
  const resolvedKey =
    apiKey ||
    (typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""
      : "");

  const [originText, setOriginText] = useState(QUICK_ROUTES[0].originQuery);
  const [destinationText, setDestinationText] = useState(
    QUICK_ROUTES[0].destinationQuery
  );
  const [originResolved, setOriginResolved] = useState<ResolvedPoint | null>(
    null
  );
  const [destinationResolved, setDestinationResolved] =
    useState<ResolvedPoint | null>(null);
  const [requestNonce, setRequestNonce] = useState(1);
  const [routeSummary, setRouteSummary] = useState<RouteSummary | null>(null);
  const [status, setStatus] = useState<{
    loading: boolean;
    error: string | null;
  }>({ loading: false, error: null });

  const handlePresetClick = (preset: (typeof QUICK_ROUTES)[number]) => {
    setOriginResolved(null);
    setDestinationResolved(null);
    setOriginText(preset.originQuery);
    setDestinationText(preset.destinationQuery);
    setRequestNonce((n) => n + 1);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRequestNonce((n) => n + 1);
  };

  const km = routeSummary ? (routeSummary.distanceMeters / 1000).toFixed(1) : null;
  const durationLabel = routeSummary
    ? formatDuration(routeSummary.durationMillis)
    : null;

  const waRouteQuoteUrl = `https://wa.me/${normalizeWhatsAppNumber(
    settings.primary_whatsapp
  )}?text=${encodeURIComponent(
    `Hello Mufasa Car Hire! I would like a quick quote for this route:\n• Pickup: ${originText}\n• Drop-off: ${destinationText}${
      km && durationLabel ? `\n• Estimated Route: ${km} km (${durationLabel})` : ""
    }`
  )}`;

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <p className="text-xs font-extrabold uppercase tracking-widest text-gold-hover">
            Live Uganda Route Preview
          </p>
          <h2 className="mt-1.5 text-2xl font-extrabold text-navy sm:text-3xl text-balance">
            {heading}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {subheading}
          </p>
        </div>

        <a
          href={waRouteQuoteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-gold text-xs sm:text-sm"
        >
          <MessageCircle className="h-4 w-4" />
          <span>Quote This Route on WhatsApp</span>
        </a>
      </div>

      {!resolvedKey ? (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-bg p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy text-gold">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-navy">
                  Direct Route Quote via WhatsApp Dispatch
                </h3>
                <p className="mt-1 text-xs text-slate-600">
                  Interactive map tiles are currently loading offline. Pick a popular corridor below to get an instant fare quote from our Kampala desk.
                </p>
              </div>
            </div>
            <a
              href={waRouteQuoteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold text-xs sm:text-sm"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Get Instant Route Quote</span>
            </a>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {QUICK_ROUTES.map((preset) => (
              <a
                key={preset.id}
                href={`https://wa.me/${normalizeWhatsAppNumber(
                  settings.primary_whatsapp
                )}?text=${encodeURIComponent(
                  `Hello Mufasa Car Hire! Please quote a vehicle for ${preset.originQuery} to ${preset.destinationQuery}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-xs font-bold text-navy transition-colors hover:border-gold hover:bg-gold-soft"
              >
                {preset.label}
              </a>
            ))}
          </div>
        </div>
      ) : (
        <APIProvider
          apiKey={resolvedKey}
          language="en"
          region="UG"
          libraries={["marker", "places", "routes"]}
        >
          <div className="mt-6 grid gap-6 lg:grid-cols-12">
            {/* Left Control Panel */}
            <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-4">
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <PlaceAutocompleteInput
                  id="gmp-pickup-input"
                  label="Pickup Location"
                  placeholder="e.g. Entebbe International Airport"
                  value={originText}
                  onValueChange={(val) => {
                    setOriginText(val);
                    setOriginResolved(null);
                  }}
                  onPlaceResolved={(pt) => {
                    setOriginResolved(pt);
                    setRequestNonce((n) => n + 1);
                  }}
                />

                <PlaceAutocompleteInput
                  id="gmp-dropoff-input"
                  label="Drop-Off Destination"
                  placeholder="e.g. Kololo, Serena Hotel, Jinja..."
                  value={destinationText}
                  onValueChange={(val) => {
                    setDestinationText(val);
                    setDestinationResolved(null);
                  }}
                  onPlaceResolved={(pt) => {
                    setDestinationResolved(pt);
                    setRequestNonce((n) => n + 1);
                  }}
                />

                <button
                  type="submit"
                  disabled={status.loading}
                  className="btn-navy w-full text-xs sm:text-sm"
                >
                  {status.loading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-gold" />
                  ) : (
                    <Navigation className="h-4 w-4 text-gold" />
                  )}
                  <span>
                    {status.loading ? "Calculating Route..." : "Calculate Live Route"}
                  </span>
                </button>
              </form>

              {/* Quick Corridor Shortcuts */}
              <div className="mt-5 border-t border-slate-200 pt-4">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  Popular Corridors
                </p>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {QUICK_ROUTES.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handlePresetClick(preset)}
                      className="rounded-lg border border-slate-200 bg-slate-bg px-2.5 py-1.5 text-left text-[11px] font-bold text-navy transition-colors hover:border-gold hover:bg-gold-soft"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Route Telemetry Summary */}
              <div className="mt-5 rounded-xl border border-navy/10 bg-navy p-4 text-white">
                {status.error ? (
                  <p className="text-xs font-medium text-amber-300">
                    {status.error}
                  </p>
                ) : routeSummary ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-white/70">
                        <RouteIcon className="h-3.5 w-3.5 text-gold" />
                        <span>Distance</span>
                      </div>
                      <div className="mt-1 text-xl font-extrabold tabular-nums text-white">
                        {km} km
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-white/70">
                        <Clock className="h-3.5 w-3.5 text-gold" />
                        <span>Drive Time</span>
                      </div>
                      <div className="mt-1 text-xl font-extrabold tabular-nums text-gold">
                        {durationLabel}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-white/75">
                    Select pickup and drop-off locations above to preview your
                    driving route and estimated journey time.
                  </p>
                )}
              </div>
            </div>

            {/* Right Interactive Google Map (explicit height required by CF2) */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm lg:col-span-8">
              <div className="h-[420px] w-full lg:h-[480px]">
                <GoogleMap
                  mapId="DEMO_MAP_ID"
                  defaultCenter={KAMPALA_CENTER}
                  defaultZoom={11}
                  gestureHandling="greedy"
                  fullscreenControl={true}
                  streetViewControl={false}
                  mapTypeControl={false}
                  internalUsageAttributionIds={[
                    "gmp_mcp_codeassist_v1_aistudio",
                  ]}
                  className="h-full w-full"
                >
                  <RouteLayer
                    originInput={originText}
                    destinationInput={destinationText}
                    originResolved={originResolved}
                    destinationResolved={destinationResolved}
                    requestNonce={requestNonce}
                    onRouteComputed={setRouteSummary}
                    onStatusChange={setStatus}
                  />

                  {routeSummary && (
                    <>
                      <AnchoredMarker
                        point={routeSummary.originPoint}
                        badgeText="Pickup Point"
                        background="#0E2444"
                        borderColor="#C59B3B"
                        glyphColor="#FFFFFF"
                      />
                      <AnchoredMarker
                        point={routeSummary.destinationPoint}
                        badgeText="Drop-Off Point"
                        background="#C59B3B"
                        borderColor="#0E2444"
                        glyphColor="#0E2444"
                      />
                    </>
                  )}
                </GoogleMap>
              </div>
            </div>
          </div>
        </APIProvider>
      )}
    </section>
  );
}
