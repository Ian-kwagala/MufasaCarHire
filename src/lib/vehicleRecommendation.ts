import type { Vehicle } from "./types";

export type LuggageLoadLevel =
  | "light"
  | "medium"
  | "heavy"
  | "cargo_small"
  | "cargo_heavy";

export interface RecommendationInput {
  serviceType: string;
  passengers?: number;
  luggageLevel?: LuggageLoadLevel;
  pickupLocation?: string;
  dropoffLocation?: string;
  driveMode?: "With Driver" | "Self-Drive";
  daysCount?: number;
  movingCategory?: string;
  helpersNeeded?: string;
  loadDescription?: string;
}

export interface VehicleRecommendation {
  vehicle: Vehicle;
  alternative?: Vehicle;
  headline: string;
  reasons: string[];
  driveNote?: string;
}

const UPCOUNTRY_KEYWORDS = [
  "upcountry",
  "safari",
  "jinja",
  "mbarara",
  "gulu",
  "mbale",
  "fort portal",
  "kasese",
  "bwindi",
  "murchison",
  "queen elizabeth",
  "hoima",
  "lira",
  "arua",
  "kabale",
  "masaka",
  "masindi",
  "soroti",
  "kidepo",
  "rough",
  "field",
  "village",
  "farm",
];

const CARGO_MARKET_KEYWORDS = [
  "kikubo",
  "owino",
  "industrial",
  "warehouse",
  "wholesale",
  "cargo",
  "moving",
  "furniture",
  "boxes",
  "cartons",
  "stock",
];

const HEAVY_CARGO_KEYWORDS = [
  "3 bedroom",
  "3-bedroom",
  "4 bedroom",
  "4-bedroom",
  "5 bedroom",
  "full house",
  "whole house",
  "office",
  "desks",
  "5 tonne",
  "5-tonne",
  "4 tonne",
  "3 tonne",
  "bulk",
  "fuso",
  "canter",
  "heavy",
  "equipment",
  "machinery",
  "pallets",
  "generator",
  "50 cartons",
  "100 cartons",
];

const VIP_KEYWORDS = [
  "serena",
  "munyonyo",
  "speke",
  "marriott",
  "hilton",
  "diplomat",
  "vip",
  "executive",
  "embassy",
  "director",
  "wedding",
];

function classifyVehicle(v: Vehicle):
  | "saloon"
  | "mpv"
  | "suv"
  | "hiace"
  | "coaster"
  | "cargo_van"
  | "box_truck" {
  const text = `${v.name} ${v.category}`.toLowerCase();
  if (
    text.includes("fuso") ||
    text.includes("canter") ||
    text.includes("box truck") ||
    text.includes("heavy moving")
  ) {
    return "box_truck";
  }
  if (v.filter_group === "moving_cargo" || text.includes("cargo")) {
    return "cargo_van";
  }
  if (text.includes("coaster") || text.includes("bus")) {
    return "coaster";
  }
  if (text.includes("hiace") || text.includes("14")) {
    return "hiace";
  }
  if (
    text.includes("cruiser") ||
    text.includes("suv") ||
    text.includes("4x4") ||
    text.includes("prado")
  ) {
    return "suv";
  }
  if (
    text.includes("wish") ||
    text.includes("noah") ||
    text.includes("mpv") ||
    text.includes("7-seater")
  ) {
    return "mpv";
  }
  return "saloon";
}

function hasAny(haystack: string, keywords: string[]): boolean {
  return keywords.some((kw) => haystack.includes(kw));
}

/**
 * Computes the best-fit vehicle from the live fleet catalog based on trip inputs
 * entered by the customer (passengers, luggage/load, route terrain, drive mode, service type).
 */
export function recommendVehicle(
  vehicles: Vehicle[],
  input: RecommendationInput
): VehicleRecommendation | null {
  if (!vehicles.length) return null;

  const byKind = new Map<ReturnType<typeof classifyVehicle>, Vehicle>();
  for (const v of vehicles) {
    const kind = classifyVehicle(v);
    if (!byKind.has(kind)) {
      byKind.set(kind, v);
    }
  }

  const pick = (
    preferred: Array<ReturnType<typeof classifyVehicle>>
  ): Vehicle => {
    for (const kind of preferred) {
      const found = byKind.get(kind);
      if (found) return found;
    }
    return vehicles[0];
  };

  const passengers = Math.max(1, Number(input.passengers || 1));
  const luggage = input.luggageLevel ?? "medium";
  const routeText = `${input.pickupLocation ?? ""} ${input.dropoffLocation ?? ""} ${
    input.loadDescription ?? ""
  }`.toLowerCase();
  const isUpcountry = hasAny(routeText, UPCOUNTRY_KEYWORDS);
  const isCargoArea = hasAny(routeText, CARGO_MARKET_KEYWORDS);
  const isHeavyCargoText = hasAny(routeText, HEAVY_CARGO_KEYWORDS);
  const isVipContext =
    input.serviceType === "Corporate" || hasAny(routeText, VIP_KEYWORDS);
  const wantsSelfDrive = input.driveMode === "Self-Drive";

  // 1. Moving & Cargo Service or Cargo Load Selected
  if (
    input.serviceType === "Moving & Cargo" ||
    luggage === "cargo_small" ||
    luggage === "cargo_heavy" ||
    (isCargoArea && input.serviceType !== "Airport Transfer")
  ) {
    const needsFullCrew =
      (input.helpersNeeded ?? "").includes("3–4") ||
      (input.helpersNeeded ?? "").includes("Full Moving Crew");
    const isHeavy =
      luggage === "cargo_heavy" ||
      isHeavyCargoText ||
      needsFullCrew ||
      input.movingCategory === "Office Moving";

    if (isHeavy) {
      const vehicle = pick(["box_truck", "cargo_van"]);
      const alt = byKind.get("cargo_van");
      return {
        vehicle,
        alternative: alt && alt.id !== vehicle.id ? alt : undefined,
        headline: "Recommended for Heavy Move or Bulk Cargo",
        reasons: [
          "Enclosed 3–5+ tonne box capacity protects furniture, office gear & bulk stock",
          isUpcountry
            ? "Built for highway & upcountry cargo hauls with experienced driver"
            : "Ideal for multi-bedroom moves, office relocations & large wholesale loads",
        ],
        driveNote: wantsSelfDrive
          ? "Cargo trucks always include an experienced Mufasa partner driver."
          : undefined,
      };
    }

    const vehicle = pick(["cargo_van", "box_truck"]);
    const alt = byKind.get("box_truck");
    return {
      vehicle,
      alternative: alt && alt.id !== vehicle.id ? alt : undefined,
      headline: "Recommended for SME Stock & Urban Moving",
      reasons: [
        "1–3 tonne cargo bay navigates Kikubo, Owino & Kampala estates easily",
        "Fast loading turnaround with vetted commercial driver included",
      ],
      driveNote: wantsSelfDrive
        ? "Cargo vans always include an experienced Mufasa partner driver."
        : undefined,
    };
  }

  // 2. Large Groups (15–30 passengers) -> Coaster Bus
  if (passengers >= 15) {
    const vehicle = pick(["coaster", "hiace"]);
    const alt = byKind.get("hiace");
    return {
      vehicle,
      alternative: alt && alt.id !== vehicle.id ? alt : undefined,
      headline: `Recommended for Large Group (${passengers} Passengers)`,
      reasons: [
        "28–30 comfortable A/C seats with overhead racks + luggage boot",
        "Keeps your whole conference, school, or tour group in one coordinated vehicle",
      ],
      driveNote: wantsSelfDrive
        ? "Group buses include a licensed professional chauffeur."
        : undefined,
    };
  }

  // 3. Medium Groups (8–14 passengers) -> HiAce Van
  if (passengers >= 8) {
    const vehicle = pick(["hiace", "coaster", "mpv"]);
    const alt = byKind.get("coaster");
    return {
      vehicle,
      alternative: alt && alt.id !== vehicle.id ? alt : undefined,
      headline: `Recommended for Group Travel (${passengers} Passengers)`,
      reasons: [
        "14-passenger A/C cabin with dedicated group luggage capacity",
        input.serviceType === "Airport Transfer"
          ? "Single coordinated Entebbe pickup instead of splitting into 3 saloons"
          : "Cost-effective for team field trips, tours & hotel group shuttles",
      ],
      driveNote: wantsSelfDrive
        ? "14-seater passenger vans include a dedicated Mufasa driver."
        : undefined,
    };
  }

  // 4. Upcountry / Rough Terrain or VIP Corporate Executive -> Land Cruiser 4x4
  if (
    (isUpcountry && !wantsSelfDrive) ||
    (isUpcountry && (passengers >= 4 || luggage === "heavy" || (input.daysCount ?? 1) >= 2)) ||
    (input.serviceType === "Corporate" && (isUpcountry || passengers >= 5 || luggage === "heavy"))
  ) {
    const vehicle = pick(["suv", "mpv", "saloon"]);
    const alt = byKind.get("mpv");
    return {
      vehicle,
      alternative: alt && alt.id !== vehicle.id ? alt : undefined,
      headline: isUpcountry
        ? "Recommended for Upcountry & Highway Terrain"
        : "Recommended for Executive & NGO Travel",
      reasons: [
        "High-clearance 4x4 stability for upcountry roads, field missions & VIP comfort",
        "Seats 5–7 passengers comfortably with 5+ suitcases and full A/C",
      ],
      driveNote: wantsSelfDrive
        ? "Self-drive on executive 4x4 SUVs is available on request with ID & deposit."
        : undefined,
    };
  }

  // 5. Family / Small Team (5–7 passengers) OR Heavy Luggage (3+ pax with heavy bags) -> 7-Seater MPV
  if (passengers >= 5 || (luggage === "heavy" && passengers >= 3)) {
    const vehicle = pick(["mpv", "suv", "hiace"]);
    const alt = byKind.get("suv");
    return {
      vehicle,
      alternative: alt && alt.id !== vehicle.id ? alt : undefined,
      headline:
        passengers >= 5
          ? `Recommended for ${passengers} Passengers`
          : "Recommended for Extra Luggage Space",
      reasons: [
        "Spacious 7-seater MPV fits up to 5 large suitcases with comfortable legroom",
        wantsSelfDrive
          ? "Company-owned & eligible for Day-1 Self-Drive (Permit + ID + Deposit)"
          : "Great value for families, airport arrivals with heavy bags & small teams",
      ],
    };
  }

  // 6. Executive Airport / Corporate with Heavy Bags or VIP Hotel -> Land Cruiser or MPV alternative
  if (luggage === "heavy" && isVipContext && !wantsSelfDrive) {
    const vehicle = pick(["suv", "mpv", "saloon"]);
    const alt = byKind.get("saloon");
    return {
      vehicle,
      alternative: alt && alt.id !== vehicle.id ? alt : undefined,
      headline: "Recommended for VIP Transfer & Heavy Luggage",
      reasons: [
        "Executive 4x4 presence for hotel & diplomatic pickups with ample boot space",
        "Includes uniformed driver and live Entebbe flight monitoring",
      ],
    };
  }

  // 7. Standard 1–4 Passengers (Kampala / Airport / Daily Self-Drive) -> Toyota Premio / Fielder
  const vehicle = pick(["saloon", "mpv"]);
  const alt = isUpcountry ? byKind.get("suv") : byKind.get("mpv");
  return {
    vehicle,
    alternative: alt && alt.id !== vehicle.id ? alt : undefined,
    headline:
      input.serviceType === "Airport Transfer"
        ? "Best Value for Entebbe Airport Transfer"
        : wantsSelfDrive
        ? "Top Pick for Day-1 Self-Drive"
        : "Best Match for 1–4 Passengers",
    reasons: [
      input.serviceType === "Airport Transfer"
        ? "Fixed UGX 80,000 ($22) Kampala–Entebbe rate with live flight tracking"
        : (input.daysCount ?? 1) >= 6
        ? "Fuel-efficient saloon — eligible for discounted weekly hire rates"
        : "Clean, fuel-efficient 4-seater saloon with room for 3 suitcases",
      wantsSelfDrive
        ? "Company-owned fleet with Day-1 self-drive ready (UGX 120,000/day)"
        : "GPS-tracked, insured & confirmed on WhatsApp within 30 minutes",
    ],
  };
}
