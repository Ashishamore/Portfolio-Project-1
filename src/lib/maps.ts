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

/** Google's own hosts, including the short links the Share button hands out. */
const MAP_HOSTS = /(^|\.)(google\.[a-z]{2,3}(\.[a-z]{2})?|goo\.gl)$/i

/** A bare "lat,lng" pair, which Maps accepts anywhere a place name goes. */
const COORDS = /^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/

function toUrl(value: string): URL | null {
  try {
    const url = new URL(value.trim())
    return url.protocol === 'http:' || url.protocol === 'https:' ? url : null
  } catch {
    return null
  }
}

/**
 * Whether a pasted string is a Google Maps link. A google.com URL only counts
 * when it actually points at Maps — a search result page is not a location.
 */
export function isMapUrl(value: string): boolean {
  const url = toUrl(value)
  if (!url || !MAP_HOSTS.test(url.hostname)) return false
  if (/(^|\.)goo\.gl$/i.test(url.hostname)) return true
  return url.pathname.startsWith('/maps') || url.hostname.startsWith('maps.')
}

export type ParsedMapLink = {
  /** The place's name where the link carries one, e.g. "Conrad Pune". */
  label?: string
  /** "lat,lng" where the link pins a point, ready to hand back to Maps. */
  coords?: string
}

/**
 * What a Maps link says about the place it points to. Short links from the Share
 * button are opaque — only Google can resolve them — so they parse to nothing and
 * are simply followed as-is.
 */
export function parseMapUrl(value: string): ParsedMapLink {
  const url = toUrl(value)
  if (!url) return {}

  const parsed: ParsedMapLink = {}

  // /maps/place/<name>/@... — the name Maps itself shows for the pin.
  const place = url.pathname.match(/\/maps\/place\/([^/@]+)/)
  if (place) parsed.label = decodeSegment(place[1])

  // Covers both the documented ?api=1 links and the older ?q= ones.
  const query =
    url.searchParams.get('query') ??
    url.searchParams.get('q') ??
    url.searchParams.get('destination')
  const queryCoords = query?.match(COORDS)
  if (query && !queryCoords && !parsed.label) parsed.label = query.trim()

  // The pin's own coordinates beat the @ pair, which is only wherever the map
  // happened to be framed when the link was copied.
  const pin = url.href.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/)
  const centre = url.pathname.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/)
  const point = pin ?? centre ?? queryCoords
  if (point) parsed.coords = `${point[1]},${point[2]}`

  return parsed
}

function decodeSegment(segment: string): string {
  const spaced = segment.replace(/\+/g, ' ')
  try {
    return decodeURIComponent(spaced).trim()
  } catch {
    // A half-escaped segment is still better read than dropped.
    return spaced.trim()
  }
}

/**
 * The best description of the place we can hand to Google. Coordinates from an
 * attached link are exact, and its place name is at least what the link points
 * at; a short link yields neither, so the written location stands in until
 * Google resolves it for whoever opens it.
 */
function targetOf(location: string, mapUrl?: string): string {
  if (!mapUrl?.trim()) return location
  const { coords, label } = parseMapUrl(mapUrl)
  return coords ?? label ?? location
}

/** Where the preview points. Kept in step with the buttons below it. */
export function embedUrlFor(location: string, mapUrl?: string): string {
  return mapEmbedUrl(targetOf(location, mapUrl))
}

/** The place itself. An attached link is the one the owner chose, so it wins. */
export function placeUrlFor(location: string, mapUrl?: string): string {
  return mapUrl?.trim() || mapPlaceUrl(location)
}

export function directionsUrlFor(location: string, mapUrl?: string): string {
  return mapDirectionsUrl(targetOf(location, mapUrl))
}
