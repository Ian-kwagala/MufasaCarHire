import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { hashPassword } from "./auth";
import type {
  Booking,
  BookingStatus,
  PackageItem,
  Review,
  SiteSettings,
  Vehicle,
} from "./types";

/**
 * SQLite database layer powered by Node's built-in node:sqlite module.
 * Automatically creates the database file (data/mufasa.db) and seeds
 * all Mufasa Car Hire brand details, vehicles, packages, and reviews on first run.
 */

const globalForDb = globalThis as unknown as {
  __mufasaDb?: DatabaseSync;
  __mufasaDbInitialized?: boolean;
};

function getDbInstance(): DatabaseSync {
  if (!globalForDb.__mufasaDb) {
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const dbPath = path.join(dataDir, "mufasa.db");
    const db = new DatabaseSync(dbPath);
    db.exec("PRAGMA journal_mode = WAL;");
    db.exec("PRAGMA foreign_keys = ON;");
    globalForDb.__mufasaDb = db;
  }

  if (!globalForDb.__mufasaDbInitialized) {
    initializeSchemaAndSeed(globalForDb.__mufasaDb);
    globalForDb.__mufasaDbInitialized = true;
  }

  return globalForDb.__mufasaDb;
}

/**
 * Node's built-in node:sqlite returns row objects with a null prototype,
 * which React Server Components cannot serialize when passing props to
 * Client Components. Spreading into a fresh object restores Object.prototype.
 */
function toPlainRow<T>(row: unknown): T {
  return { ...(row as Record<string, unknown>) } as T;
}

function toPlainRowOrNull<T>(row: unknown): T | null {
  return row ? ({ ...(row as Record<string, unknown>) } as T) : null;
}

function toPlainRows<T>(rows: unknown[]): T[] {
  return rows.map((row) => ({ ...(row as Record<string, unknown>) }) as T);
}

const DEFAULT_SETTINGS: SiteSettings = {
  company_name: "Mufasa Car Hire",
  slogan: "Travel Like a KING",
  tagline: "Car Hire • Corporate Logistics • Moving Services",
  primary_whatsapp: "256708854302",
  secondary_whatsapp: "256787166808",
  official_email: "info@mufasacarhire.ug",
  office_address: "Namugongo Road, at Jenik Pharmacy, Kampala, Uganda",
  google_maps_url: "https://maps.google.com/?q=Namugongo+Road+Jenik+Pharmacy+Kampala",
  facebook_url: "",
  instagram_url: "",
  logo_url: "", // Empty uses built-in Lion + Car SVG emblem until uploaded in Admin
  hero_title: "Travel Like a KING Across Kampala & Uganda",
  hero_subtitle:
    "Kampala's most trustworthy car hire, Entebbe Airport transfers, and moving & cargo partner — GPS-tracked, insured, and confirmed on WhatsApp within 30 minutes.",
  airport_rate_ugx: "80000",
  airport_rate_usd: "22",
  usd_exchange_rate: "3700",
  self_drive_daily_ugx: "120000",
  self_drive_deposit_ugx: "300000",
  mtn_momo_code: "",
  airtel_money_code: "",
  bank_details: "",
  show_payment_publicly: "false",
  promo_banner_active: "true",
  promo_code: "KING15",
  promo_discount_percent: "15",
  promo_description:
    "Launch Promo: 15% Discount for our first 50 clients (shareable via WhatsApp referral). Use code KING15 when booking.",
  loyalty_banner_text:
    "Monthly Loyalty Reward: Book 4+ times in a month and receive 1 complimentary half-day hire (UGX 60,000 value).",
  about_story:
    "Mufasa Car Hire is a Kampala-based transport and logistics company built on a capital-efficient hybrid model: company-owned passenger vehicles for daily and corporate car hire, paired with a vetted network of 5–8 van and truck partners for on-demand moving and cargo jobs. Our positioning is simple: not the cheapest, the most trustworthy.",
};

function initializeSchemaAndSeed(db: DatabaseSync): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS vehicles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      filter_group TEXT NOT NULL,
      fleet_type TEXT NOT NULL,
      drive_option TEXT NOT NULL,
      transmission TEXT NOT NULL DEFAULT 'Automatic',
      seats TEXT NOT NULL,
      ac INTEGER NOT NULL DEFAULT 1,
      luggage TEXT NOT NULL,
      best_uses TEXT NOT NULL,
      price_display TEXT NOT NULL,
      rate_ugx INTEGER,
      is_quote_only INTEGER NOT NULL DEFAULT 0,
      image_url TEXT NOT NULL DEFAULT '',
      video_url TEXT NOT NULL DEFAULT '',
      featured INTEGER NOT NULL DEFAULT 0,
      active INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS packages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price_display TEXT NOT NULL,
      rate_ugx INTEGER,
      details TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_name TEXT NOT NULL,
      client_role TEXT NOT NULL,
      rating INTEGER NOT NULL DEFAULT 5,
      quote TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id TEXT UNIQUE NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      booking_date TEXT NOT NULL DEFAULT '',
      booking_time TEXT NOT NULL DEFAULT '',
      service_type TEXT NOT NULL,
      vehicle_id INTEGER,
      vehicle_name TEXT NOT NULL DEFAULT '',
      vehicle_source TEXT NOT NULL DEFAULT 'Unassigned',
      drive_mode TEXT NOT NULL DEFAULT 'With Driver',
      pickup_location TEXT NOT NULL DEFAULT '',
      dropoff_location TEXT NOT NULL DEFAULT '',
      flight_number TEXT NOT NULL DEFAULT '',
      meet_and_greet INTEGER NOT NULL DEFAULT 0,
      load_description TEXT NOT NULL DEFAULT '',
      helpers_needed TEXT NOT NULL DEFAULT 'N/A',
      company_hotel_name TEXT NOT NULL DEFAULT '',
      monthly_needs TEXT NOT NULL DEFAULT '',
      client_name TEXT NOT NULL,
      client_phone TEXT NOT NULL,
      client_email TEXT NOT NULL DEFAULT '',
      client_type TEXT NOT NULL DEFAULT 'Individual',
      promo_or_hotel_code TEXT NOT NULL DEFAULT '',
      marketing_opt_in INTEGER NOT NULL DEFAULT 0,
      rate_shown TEXT NOT NULL DEFAULT '',
      currency TEXT NOT NULL DEFAULT 'UGX',
      client_total_ugx INTEGER NOT NULL DEFAULT 0,
      payment_method TEXT NOT NULL DEFAULT 'Pending',
      driver_commission_ugx INTEGER NOT NULL DEFAULT 0,
      partner_payout_ugx INTEGER NOT NULL DEFAULT 0,
      hotel_fee_ugx INTEGER NOT NULL DEFAULT 0,
      mufasa_net_ugx INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'New',
      admin_notes TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Seed default settings if missing
  const insertSetting = db.prepare(
    "INSERT OR IGNORE INTO site_settings (key, value) VALUES (?, ?)"
  );
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    insertSetting.run(key, value);
  }

  // Seed default admin user if no admin exists
  const adminCount = db
    .prepare("SELECT COUNT(*) as count FROM admin_users")
    .get() as { count: number };
  if (adminCount.count === 0) {
    const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || "MufasaKing2026!";
    db.prepare(
      "INSERT INTO admin_users (username, password_hash, role) VALUES (?, ?, 'admin')"
    ).run("admin", hashPassword(defaultPassword));
  }

  // Ensure video_url and transmission columns exist on pre-existing databases
  const vehicleColumns = db
    .prepare("PRAGMA table_info(vehicles)")
    .all() as Array<{ name: string }>;
  if (!vehicleColumns.some((col) => col.name === "video_url")) {
    db.exec("ALTER TABLE vehicles ADD COLUMN video_url TEXT NOT NULL DEFAULT '';");
  }
  if (!vehicleColumns.some((col) => col.name === "transmission")) {
    db.exec(
      "ALTER TABLE vehicles ADD COLUMN transmission TEXT NOT NULL DEFAULT '';"
    );
  }

  // Seed vehicles from Master Brief Page 2 if table is empty
  const vehicleCount = db
    .prepare("SELECT COUNT(*) as count FROM vehicles")
    .get() as { count: number };
  if (vehicleCount.count === 0) {
    const insertVehicle = db.prepare(`
      INSERT INTO vehicles (
        name, category, filter_group, fleet_type, drive_option, transmission,
        seats, ac, luggage, best_uses, price_display, rate_ugx,
        is_quote_only, image_url, video_url, featured, active, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    `);

    const seedVehicles = [
      [
        "Toyota Premio / Fielder",
        "Saloon / Estate",
        "saloons_mpvs",
        "OWNED",
        "DRIVER_OR_SELF",
        "Automatic",
        "4 Passengers",
        1,
        "3 Suitcases",
        "Daily town runs, Entebbe Airport transfers, executive meetings, weekly & monthly corporate hire.",
        "UGX 120,000 / day",
        120000,
        0,
        "/fleet/premio.jpg",
        "/videos/premio.mp4",
        1,
        1,
      ],
      [
        "Toyota Wish / Noah",
        "MPV / 7-Seater",
        "saloons_mpvs",
        "OWNED",
        "DRIVER_OR_SELF",
        "Automatic",
        "7 Passengers",
        1,
        "5 Suitcases",
        "Family travel, airport pickups with heavy luggage, small team movements, upcountry trips.",
        "From UGX 160,000 / day",
        160000,
        0,
        "/fleet/wish.jpg",
        "/videos/wish.mp4",
        1,
        2,
      ],
      [
        "Toyota Land Cruiser / SUV",
        "4x4 Executive",
        "suvs_buses",
        "PARTNER / VIP",
        "DRIVER_OR_REQUEST_SELF",
        "Automatic (4x4)",
        "5–7 Passengers",
        1,
        "5+ Suitcases",
        "VIPs, diplomats, NGO field missions, rough upcountry terrain, airport pickups.",
        "Get Instant Quote",
        null,
        1,
        "/fleet/land-cruiser.jpg",
        "/videos/land-cruiser.mp4",
        1,
        3,
      ],
      [
        "Toyota HiAce Van",
        "Passenger Van",
        "suvs_buses",
        "PARTNER",
        "DRIVER_ONLY",
        "Manual / Automatic",
        "14 Passengers",
        1,
        "Group Luggage",
        "Group airport transfers, town runs, upcountry tours, school & company trips.",
        "Get Instant Quote",
        null,
        1,
        "/fleet/hiace.jpg",
        "/videos/hiace.mp4",
        0,
        4,
      ],
      [
        "Toyota Coaster Bus",
        "Group Bus",
        "suvs_buses",
        "PARTNER",
        "DRIVER_ONLY",
        "Manual (Commercial)",
        "28–30 Passengers",
        1,
        "Overhead + Boot",
        "School trips, company trips, staff shuttles, conferences, group events.",
        "Get Instant Quote",
        null,
        1,
        "/fleet/coaster.jpg",
        "/videos/coaster.mp4",
        0,
        5,
      ],
      [
        "Cargo Vans (1–3 Tonne)",
        "Moving & SME Cargo",
        "moving_cargo",
        "PARTNER (5–8)",
        "DRIVER_ONLY",
        "Manual (Commercial)",
        "2 + Cargo Bay",
        0,
        "1–3 Tonnes",
        "SME goods delivery, Kikubo & Owino Market runs, Industrial Area runs, small home moves.",
        "Get Quote (Ref avg: UGX 350k)",
        350000,
        1,
        "/fleet/cargo-van.jpg",
        "/videos/cargo-van.mp4",
        1,
        6,
      ],
      [
        "Box Truck / Fuso Canter & Pickups",
        "Heavy Moving & Bulk Cargo",
        "moving_cargo",
        "PARTNER (5–8)",
        "DRIVER_ONLY",
        "Manual (Heavy Duty)",
        "3 + Box Cargo",
        0,
        "3–5+ Tonnes",
        "Home moving, office moving, heavy bulk cargo & equipment transport.",
        "Get Instant Quote",
        null,
        1,
        "/fleet/fuso-truck.jpg",
        "/videos/fuso-truck.mp4",
        0,
        7,
      ],
    ];

    for (const v of seedVehicles) {
      insertVehicle.run(...(v as (string | number | null)[]));
    }
  } else {
    // Backfill default showcase photos, videos & transmission on existing seeded vehicles if blank
    const mediaDefaults: Array<{
      match: string;
      image: string;
      video: string;
      transmission: string;
    }> = [
      {
        match: "%Premio%",
        image: "/fleet/premio.jpg",
        video: "/videos/premio.mp4",
        transmission: "Automatic",
      },
      {
        match: "%Wish%",
        image: "/fleet/wish.jpg",
        video: "/videos/wish.mp4",
        transmission: "Automatic",
      },
      {
        match: "%Land Cruiser%",
        image: "/fleet/land-cruiser.jpg",
        video: "/videos/land-cruiser.mp4",
        transmission: "Automatic (4x4)",
      },
      {
        match: "%HiAce%",
        image: "/fleet/hiace.jpg",
        video: "/videos/hiace.mp4",
        transmission: "Manual / Automatic",
      },
      {
        match: "%Coaster%",
        image: "/fleet/coaster.jpg",
        video: "/videos/coaster.mp4",
        transmission: "Manual (Commercial)",
      },
      {
        match: "%Cargo Vans%",
        image: "/fleet/cargo-van.jpg",
        video: "/videos/cargo-van.mp4",
        transmission: "Manual (Commercial)",
      },
      {
        match: "%Fuso%",
        image: "/fleet/fuso-truck.jpg",
        video: "/videos/fuso-truck.mp4",
        transmission: "Manual (Heavy Duty)",
      },
    ];
    const backfillImage = db.prepare(
      "UPDATE vehicles SET image_url = ? WHERE name LIKE ? AND (image_url IS NULL OR image_url = '')"
    );
    const backfillVideo = db.prepare(
      "UPDATE vehicles SET video_url = ? WHERE name LIKE ? AND (video_url IS NULL OR video_url = '')"
    );
    const backfillTransmission = db.prepare(
      "UPDATE vehicles SET transmission = ? WHERE name LIKE ? AND (transmission IS NULL OR transmission = '')"
    );
    for (const item of mediaDefaults) {
      backfillImage.run(item.image, item.match);
      backfillVideo.run(item.video, item.match);
      backfillTransmission.run(item.transmission, item.match);
    }
    db.prepare(
      "UPDATE vehicles SET transmission = 'Automatic' WHERE transmission IS NULL OR transmission = ''"
    ).run();
  }

  // Seed pricing packages from Master Brief Page 3 if table is empty
  const packageCount = db
    .prepare("SELECT COUNT(*) as count FROM packages")
    .get() as { count: number };
  if (packageCount.count === 0) {
    const insertPackage = db.prepare(`
      INSERT INTO packages (name, price_display, rate_ugx, details, active, sort_order)
      VALUES (?, ?, ?, ?, 1, ?)
    `);
    const seedPackages = [
      [
        "Half-Day Saloon Hire",
        "UGX 60,000",
        60000,
        "4 hours within Kampala. Ideal for meetings, errands, and town runs.",
        1,
      ],
      [
        "Daily Saloon Hire",
        "UGX 120,000 / day",
        120000,
        "Standard full-day rate (driver included). Fuel terms confirmed clearly upfront.",
        2,
      ],
      [
        "Self-Drive Hire (Day 1)",
        "From UGX 120,000 / day",
        120000,
        "Available from Day 1 on owned vehicles. Requires valid Driving Permit, National ID/Passport, and refundable security deposit.",
        3,
      ],
      [
        "Weekly Package (Saloon)",
        "UGX 600,000 / week",
        600000,
        "6-day package (includes 10% discount). Great for visiting consultants & weekly projects.",
        4,
      ],
      [
        "Entebbe Airport Transfer",
        "UGX 80,000 / trip",
        80000,
        "Entebbe ↔ Kampala fixed rate. Includes live flight tracking so drivers wait if flights are delayed.",
        5,
      ],
      [
        "Upcountry / Long-Distance",
        "From UGX 200,000+",
        200000,
        "Final quote depends on destination, trip duration, and fuel arrangement.",
        6,
      ],
      [
        "Corporate / NGO Retainer",
        "From UGX 1,500,000 – 2,200,000 / mo",
        1500000,
        "Dedicated vehicle allocation, priority booking, SLA reliability, and monthly invoicing.",
        7,
      ],
      [
        "SUV, HiAce, Coaster & Cargo",
        "Get Instant Quote",
        null,
        "Custom pricing sent within 30 minutes on WhatsApp based on vehicle size, route, and cargo load.",
        8,
      ],
    ];
    for (const p of seedPackages) {
      insertPackage.run(...(p as (string | number | null)[]));
    }
  }

  // Seed initial client reviews if empty
  const reviewCount = db
    .prepare("SELECT COUNT(*) as count FROM reviews")
    .get() as { count: number };
  if (reviewCount.count === 0) {
    const insertReview = db.prepare(
      "INSERT INTO reviews (client_name, client_role, rating, quote, active) VALUES (?, ?, ?, ?, 1)"
    );
    const seedReviews = [
      [
        "Sarah K.",
        "NGO Operations Lead, Kololo",
        5,
        "Our consultant's Entebbe flight was delayed by 2 hours, and Mufasa's driver tracked the flight and waited right at arrivals with zero extra stress.",
      ],
      [
        "David M.",
        "Wholesale Trader, Kikubo",
        5,
        "Booked a 2-tonne cargo van for our weekly stock delivery from Kikubo to Ntinda. Clear pricing upfront and the team arrived right on time.",
      ],
      [
        "Grace N.",
        "Corporate Executive, Nakasero",
        5,
        "Clean Toyota Premio, very polite driver, and WhatsApp confirmation took less than 15 minutes. Truly reliable service.",
      ],
    ];
    for (const r of seedReviews) {
      insertReview.run(...(r as (string | number)[]));
    }
  }
}

// ============================================================================
// Settings Helpers
// ============================================================================

export function getSiteSettings(): SiteSettings {
  const db = getDbInstance();
  const rows = db.prepare("SELECT key, value FROM site_settings").all() as Array<{
    key: string;
    value: string;
  }>;
  const map: Record<string, string> = { ...DEFAULT_SETTINGS };
  for (const row of rows) {
    map[row.key] = row.value;
  }
  return map as unknown as SiteSettings;
}

export function updateSiteSettings(partial: Partial<SiteSettings>): SiteSettings {
  const db = getDbInstance();
  const upsert = db.prepare(
    "INSERT INTO site_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
  );
  for (const [key, value] of Object.entries(partial)) {
    if (value !== undefined && key in DEFAULT_SETTINGS) {
      upsert.run(key, String(value));
    }
  }
  return getSiteSettings();
}

// ============================================================================
// Vehicles Helpers
// ============================================================================

export function getVehicles(options?: { activeOnly?: boolean }): Vehicle[] {
  const db = getDbInstance();
  const sql = options?.activeOnly
    ? "SELECT * FROM vehicles WHERE active = 1 ORDER BY sort_order ASC, id ASC"
    : "SELECT * FROM vehicles ORDER BY sort_order ASC, id ASC";
  return toPlainRows<Vehicle>(db.prepare(sql).all());
}

export function upsertVehicle(
  data: Partial<Vehicle> & { id?: number }
): Vehicle {
  const db = getDbInstance();
  if (data.id) {
    db.prepare(`
      UPDATE vehicles SET
        name = ?, category = ?, filter_group = ?, fleet_type = ?,
        drive_option = ?, transmission = ?, seats = ?, ac = ?, luggage = ?, best_uses = ?,
        price_display = ?, rate_ugx = ?, is_quote_only = ?, image_url = ?,
        video_url = ?, featured = ?, active = ?, sort_order = ?
      WHERE id = ?
    `).run(
      data.name ?? "",
      data.category ?? "",
      data.filter_group ?? "saloons_mpvs",
      data.fleet_type ?? "OWNED",
      data.drive_option ?? "DRIVER_OR_SELF",
      data.transmission ?? "Automatic",
      data.seats ?? "",
      data.ac ?? 1,
      data.luggage ?? "",
      data.best_uses ?? "",
      data.price_display ?? "Get Instant Quote",
      data.rate_ugx ?? null,
      data.is_quote_only ?? 0,
      data.image_url ?? "",
      data.video_url ?? "",
      data.featured ?? 0,
      data.active ?? 1,
      data.sort_order ?? 10,
      data.id
    );
    return toPlainRow<Vehicle>(
      db.prepare("SELECT * FROM vehicles WHERE id = ?").get(data.id)
    );
  }

  const info = db
    .prepare(`
      INSERT INTO vehicles (
        name, category, filter_group, fleet_type, drive_option, transmission,
        seats, ac, luggage, best_uses, price_display, rate_ugx,
        is_quote_only, image_url, video_url, featured, active, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .run(
      data.name ?? "New Vehicle",
      data.category ?? "Saloon",
      data.filter_group ?? "saloons_mpvs",
      data.fleet_type ?? "OWNED",
      data.drive_option ?? "DRIVER_OR_SELF",
      data.transmission ?? "Automatic",
      data.seats ?? "4 Passengers",
      data.ac ?? 1,
      data.luggage ?? "3 Suitcases",
      data.best_uses ?? "",
      data.price_display ?? "Get Instant Quote",
      data.rate_ugx ?? null,
      data.is_quote_only ?? 0,
      data.image_url ?? "",
      data.video_url ?? "",
      data.featured ?? 0,
      data.active ?? 1,
      data.sort_order ?? 10
    );
  return toPlainRow<Vehicle>(
    db
      .prepare("SELECT * FROM vehicles WHERE id = ?")
      .get(Number(info.lastInsertRowid))
  );
}

export function deleteVehicle(id: number): void {
  const db = getDbInstance();
  db.prepare("DELETE FROM vehicles WHERE id = ?").run(id);
}

// ============================================================================
// Packages Helpers
// ============================================================================

export function getPackages(options?: { activeOnly?: boolean }): PackageItem[] {
  const db = getDbInstance();
  const sql = options?.activeOnly
    ? "SELECT * FROM packages WHERE active = 1 ORDER BY sort_order ASC, id ASC"
    : "SELECT * FROM packages ORDER BY sort_order ASC, id ASC";
  return toPlainRows<PackageItem>(db.prepare(sql).all());
}

export function upsertPackage(
  data: Partial<PackageItem> & { id?: number }
): PackageItem {
  const db = getDbInstance();
  if (data.id) {
    db.prepare(`
      UPDATE packages SET name = ?, price_display = ?, rate_ugx = ?, details = ?, active = ?, sort_order = ?
      WHERE id = ?
    `).run(
      data.name ?? "",
      data.price_display ?? "",
      data.rate_ugx ?? null,
      data.details ?? "",
      data.active ?? 1,
      data.sort_order ?? 10,
      data.id
    );
    return toPlainRow<PackageItem>(
      db.prepare("SELECT * FROM packages WHERE id = ?").get(data.id)
    );
  }
  const info = db
    .prepare(
      "INSERT INTO packages (name, price_display, rate_ugx, details, active, sort_order) VALUES (?, ?, ?, ?, ?, ?)"
    )
    .run(
      data.name ?? "New Package",
      data.price_display ?? "Get Quote",
      data.rate_ugx ?? null,
      data.details ?? "",
      data.active ?? 1,
      data.sort_order ?? 10
    );
  return toPlainRow<PackageItem>(
    db
      .prepare("SELECT * FROM packages WHERE id = ?")
      .get(Number(info.lastInsertRowid))
  );
}

export function deletePackage(id: number): void {
  const db = getDbInstance();
  db.prepare("DELETE FROM packages WHERE id = ?").run(id);
}

// ============================================================================
// Reviews Helpers
// ============================================================================

export function getReviews(options?: { activeOnly?: boolean }): Review[] {
  const db = getDbInstance();
  const sql = options?.activeOnly
    ? "SELECT * FROM reviews WHERE active = 1 ORDER BY id DESC"
    : "SELECT * FROM reviews ORDER BY id DESC";
  return toPlainRows<Review>(db.prepare(sql).all());
}

export function upsertReview(data: Partial<Review> & { id?: number }): Review {
  const db = getDbInstance();
  if (data.id) {
    db.prepare(
      "UPDATE reviews SET client_name = ?, client_role = ?, rating = ?, quote = ?, active = ? WHERE id = ?"
    ).run(
      data.client_name ?? "",
      data.client_role ?? "",
      data.rating ?? 5,
      data.quote ?? "",
      data.active ?? 1,
      data.id
    );
    return toPlainRow<Review>(
      db.prepare("SELECT * FROM reviews WHERE id = ?").get(data.id)
    );
  }
  const info = db
    .prepare(
      "INSERT INTO reviews (client_name, client_role, rating, quote, active) VALUES (?, ?, ?, ?, ?)"
    )
    .run(
      data.client_name ?? "Verified Client",
      data.client_role ?? "Kampala",
      data.rating ?? 5,
      data.quote ?? "",
      data.active ?? 1
    );
  return toPlainRow<Review>(
    db
      .prepare("SELECT * FROM reviews WHERE id = ?")
      .get(Number(info.lastInsertRowid))
  );
}

export function deleteReview(id: number): void {
  const db = getDbInstance();
  db.prepare("DELETE FROM reviews WHERE id = ?").run(id);
}

// ============================================================================
// Bookings / Customer Orders Helpers
// ============================================================================

function generateNextJobId(db: DatabaseSync): string {
  const row = db
    .prepare("SELECT MAX(id) as maxId FROM bookings")
    .get() as { maxId: number | null };
  const nextNum = (row?.maxId ?? 0) + 1;
  return `MCH-${String(nextNum).padStart(3, "0")}`;
}

export function createBooking(input: Partial<Booking>): Booking {
  const db = getDbInstance();
  const jobId = generateNextJobId(db);

  const info = db
    .prepare(`
      INSERT INTO bookings (
        job_id, booking_date, booking_time, service_type, vehicle_id, vehicle_name,
        vehicle_source, drive_mode, pickup_location, dropoff_location, flight_number,
        meet_and_greet, load_description, helpers_needed, company_hotel_name, monthly_needs,
        client_name, client_phone, client_email, client_type, promo_or_hotel_code,
        marketing_opt_in, rate_shown, currency, client_total_ugx, payment_method,
        driver_commission_ugx, partner_payout_ugx, hotel_fee_ugx, mufasa_net_ugx,
        status, admin_notes
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?
      )
    `)
    .run(
      jobId,
      input.booking_date ?? "",
      input.booking_time ?? "",
      input.service_type ?? "Car Hire",
      input.vehicle_id ?? null,
      input.vehicle_name ?? "",
      input.vehicle_source ?? "Unassigned",
      input.drive_mode ?? "With Driver",
      input.pickup_location ?? "",
      input.dropoff_location ?? "",
      input.flight_number ?? "",
      input.meet_and_greet ? 1 : 0,
      input.load_description ?? "",
      input.helpers_needed ?? "N/A",
      input.company_hotel_name ?? "",
      input.monthly_needs ?? "",
      input.client_name ?? "Customer",
      input.client_phone ?? "",
      input.client_email ?? "",
      input.client_type ?? "Individual",
      input.promo_or_hotel_code ?? "",
      input.marketing_opt_in ? 1 : 0,
      input.rate_shown ?? "Get Quote",
      input.currency ?? "UGX",
      input.client_total_ugx ?? 0,
      input.payment_method ?? "Pending",
      input.driver_commission_ugx ?? 0,
      input.partner_payout_ugx ?? 0,
      input.hotel_fee_ugx ?? 0,
      input.mufasa_net_ugx ?? 0,
      "New",
      input.admin_notes ?? ""
    );

  return toPlainRow<Booking>(
    db
      .prepare("SELECT * FROM bookings WHERE id = ?")
      .get(Number(info.lastInsertRowid))
  );
}

export function getBookings(filters?: {
  status?: string;
  serviceType?: string;
  search?: string;
}): Booking[] {
  const db = getDbInstance();
  const clauses: string[] = [];
  const params: (string | number)[] = [];

  if (filters?.status && filters.status !== "All") {
    clauses.push("status = ?");
    params.push(filters.status);
  }
  if (filters?.serviceType && filters.serviceType !== "All") {
    clauses.push("service_type = ?");
    params.push(filters.serviceType);
  }
  if (filters?.search && filters.search.trim()) {
    const q = `%${filters.search.trim()}%`;
    clauses.push(
      "(job_id LIKE ? OR client_name LIKE ? OR client_phone LIKE ? OR vehicle_name LIKE ? OR pickup_location LIKE ? OR dropoff_location LIKE ? OR promo_or_hotel_code LIKE ?)"
    );
    params.push(q, q, q, q, q, q, q);
  }

  const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
  return toPlainRows<Booking>(
    db.prepare(`SELECT * FROM bookings ${where} ORDER BY id DESC`).all(...params)
  );
}

export function updateBooking(
  id: number,
  patch: Partial<Booking> & { status?: BookingStatus }
): Booking | null {
  const db = getDbInstance();
  const existing = db
    .prepare("SELECT * FROM bookings WHERE id = ?")
    .get(id) as unknown as Booking | undefined;
  if (!existing) return null;

  const clientTotal = Number(patch.client_total_ugx ?? existing.client_total_ugx) || 0;
  const driverComm = Number(patch.driver_commission_ugx ?? existing.driver_commission_ugx) || 0;
  const partnerPay = Number(patch.partner_payout_ugx ?? existing.partner_payout_ugx) || 0;
  const hotelFee = Number(patch.hotel_fee_ugx ?? existing.hotel_fee_ugx) || 0;

  // Compute Mufasa Net automatically unless explicitly overridden
  const computedNet =
    patch.mufasa_net_ugx !== undefined
      ? Number(patch.mufasa_net_ugx)
      : Math.max(0, clientTotal - driverComm - partnerPay - hotelFee);

  db.prepare(`
    UPDATE bookings SET
      status = ?,
      vehicle_source = ?,
      vehicle_name = ?,
      drive_mode = ?,
      payment_method = ?,
      client_total_ugx = ?,
      driver_commission_ugx = ?,
      partner_payout_ugx = ?,
      hotel_fee_ugx = ?,
      mufasa_net_ugx = ?,
      admin_notes = ?
    WHERE id = ?
  `).run(
    patch.status ?? existing.status,
    patch.vehicle_source ?? existing.vehicle_source,
    patch.vehicle_name ?? existing.vehicle_name,
    patch.drive_mode ?? existing.drive_mode,
    patch.payment_method ?? existing.payment_method,
    clientTotal,
    driverComm,
    partnerPay,
    hotelFee,
    computedNet,
    patch.admin_notes ?? existing.admin_notes,
    id
  );

  return toPlainRowOrNull<Booking>(
    db.prepare("SELECT * FROM bookings WHERE id = ?").get(id)
  );
}

export function deleteBooking(id: number): void {
  const db = getDbInstance();
  db.prepare("DELETE FROM bookings WHERE id = ?").run(id);
}

// ============================================================================
// Admin User Helpers
// ============================================================================

export function getAdminUserByUsername(
  username: string
): { id: number; username: string; password_hash: string; role: string } | null {
  const db = getDbInstance();
  const row = db
    .prepare("SELECT id, username, password_hash, role FROM admin_users WHERE username = ?")
    .get(username) as
    | { id: number; username: string; password_hash: string; role: string }
    | undefined;
  return toPlainRowOrNull<{
    id: number;
    username: string;
    password_hash: string;
    role: string;
  }>(row);
}

export function updateAdminPassword(username: string, newPassword: string): void {
  const db = getDbInstance();
  db.prepare("UPDATE admin_users SET password_hash = ? WHERE username = ?").run(
    hashPassword(newPassword),
    username
  );
}
