export type CityInfo = {
  name: string
  /** Shown in front of the city in pickers. */
  icon: string
  lat: number
  lng: number
  /** Surfaced as a ready-made suggestion before the full list. */
  top?: boolean
}

/** Every city photographers are based in, with coordinates for "near me" matching. */
export const CITIES: CityInfo[] = [
  { name: 'Mumbai', icon: '🏙️', lat: 19.076, lng: 72.8777, top: true },
  { name: 'Bengaluru', icon: '🌿', lat: 12.9716, lng: 77.5946, top: true },
  { name: 'Jaipur', icon: '🏰', lat: 26.9124, lng: 75.7873, top: true },
  { name: 'Goa', icon: '🏖️', lat: 15.4909, lng: 73.8278, top: true },
  { name: 'Udaipur', icon: '🛶', lat: 24.5854, lng: 73.7125 },
  { name: 'Kochi', icon: '🌴', lat: 9.9312, lng: 76.2673 },
  { name: 'Varanasi', icon: '🛕', lat: 25.3176, lng: 82.9739 },
  { name: 'Leh', icon: '⛰️', lat: 34.1526, lng: 77.5771 },
]

export const TOP_CITIES = CITIES.filter((c) => c.top)

export function cityIcon(name: string): string {
  return CITIES.find((c) => c.name === name)?.icon ?? '📍'
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180
}

/** Great-circle distance in km. */
function distanceKm(aLat: number, aLng: number, b: CityInfo): number {
  const R = 6371
  const dLat = toRad(b.lat - aLat)
  const dLng = toRad(b.lng - aLng)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

/**
 * Closest city that actually has photographers — there is no geocoding service here,
 * so coordinates are resolved against the known list rather than a real address.
 */
export function nearestCity(lat: number, lng: number): { city: CityInfo; km: number } {
  let best = { city: CITIES[0], km: distanceKm(lat, lng, CITIES[0]) }
  for (const city of CITIES.slice(1)) {
    const km = distanceKm(lat, lng, city)
    if (km < best.km) best = { city, km }
  }
  return best
}
