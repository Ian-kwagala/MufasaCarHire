/**
 * Shared TypeScript types for Mufasa Car Hire website and admin dashboard.
 * Kept in one file so frontend components, API routes, and DB helpers stay aligned.
 */

export interface SiteSettings {
  company_name: string;
  slogan: string;
  tagline: string;
  primary_whatsapp: string;
  secondary_whatsapp: string;
  official_email: string;
  office_address: string;
  google_maps_url: string;
  facebook_url: string;
  instagram_url: string;
  logo_url: string;
  hero_title: string;
  hero_subtitle: string;
  airport_rate_ugx: string;
  airport_rate_usd: string;
  usd_exchange_rate: string;
  self_drive_daily_ugx: string;
  self_drive_deposit_ugx: string;
  mtn_momo_code: string;
  airtel_money_code: string;
  bank_details: string;
  show_payment_publicly: string; // "true" | "false"
  promo_banner_active: string; // "true" | "false"
  promo_code: string;
  promo_discount_percent: string;
  promo_description: string;
  loyalty_banner_text: string;
  about_story: string;
}

export type FleetFilterGroup = "saloons_mpvs" | "suvs_buses" | "moving_cargo";
export type DriveOptionType =
  | "DRIVER_OR_SELF"
  | "DRIVER_ONLY"
  | "DRIVER_OR_REQUEST_SELF";

export interface Vehicle {
  id: number;
  name: string;
  category: string;
  filter_group: FleetFilterGroup;
  fleet_type: string; // e.g., "OWNED", "PARTNER", "PARTNER / VIP"
  drive_option: DriveOptionType;
  seats: string;
  ac: number; // 1 = yes, 0 = no
  luggage: string;
  best_uses: string;
  price_display: string;
  rate_ugx: number | null;
  is_quote_only: number; // 1 = quote button, 0 = fixed price
  image_url: string;
  featured: number; // 1 = shown on home page
  active: number; // 1 = visible on website
  sort_order: number;
}

export interface PackageItem {
  id: number;
  name: string;
  price_display: string;
  rate_ugx: number | null;
  details: string;
  active: number;
  sort_order: number;
}

export interface Review {
  id: number;
  client_name: string;
  client_role: string;
  rating: number;
  quote: string;
  active: number;
  created_at: string;
}

export type BookingStatus =
  | "New"
  | "Quoted"
  | "Confirmed"
  | "In Progress"
  | "Completed"
  | "Cancelled";

export interface Booking {
  id: number;
  job_id: string;
  created_at: string;
  booking_date: string;
  booking_time: string;
  service_type: string;
  vehicle_id: number | null;
  vehicle_name: string;
  vehicle_source: string; // "Owned" | "Partner" | "Unassigned"
  drive_mode: string; // "With Driver" | "Self-Drive"
  pickup_location: string;
  dropoff_location: string;
  flight_number: string;
  meet_and_greet: number; // 0 or 1
  load_description: string;
  helpers_needed: string;
  company_hotel_name: string;
  monthly_needs: string;
  client_name: string;
  client_phone: string;
  client_email: string;
  client_type: string; // "Individual" | "Hotel" | "NGO / Corporate" | "SME / Wholesaler"
  promo_or_hotel_code: string;
  marketing_opt_in: number; // 0 or 1
  rate_shown: string;
  currency: string;
  client_total_ugx: number;
  payment_method: string;
  driver_commission_ugx: number;
  partner_payout_ugx: number;
  hotel_fee_ugx: number;
  mufasa_net_ugx: number;
  status: BookingStatus;
  admin_notes: string;
}
