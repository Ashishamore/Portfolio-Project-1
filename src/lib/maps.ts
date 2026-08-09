/**
 * Google Maps links for a place written as free text. There is no geocoding
 * service here, so the location string is handed to Google as a search query —
 * exactly what pasting it into the Maps search box would do.
 */

/** Keyless embed used for the map preview. Zoomed to street level. */
export function mapEmbedUrl(location: string): string {
  return `https://maps.google.com/maps?q=${encodeURIComponent(location)}&z=15&output=embed`
}

/** The place itself, opened in the Maps app on a phone and the site elsewhere. */
export function mapPlaceUrl(location: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`
}

/** Navigation to the place, with the starting point left to the device. */
export function mapDirectionsUrl(location: string): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(location)}`
}
