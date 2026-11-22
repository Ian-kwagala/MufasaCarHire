/**
 * Resolves the Google Maps Platform API key from server environment variables.
 * Supports Next.js standard variables as well as auto-provisioned VITE_GOOGLE_MAPS_API_KEY.
 */
export function getGoogleMapsApiKey(): string {
  return (
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.VITE_GOOGLE_MAPS_API_KEY ||
    ""
  );
}
