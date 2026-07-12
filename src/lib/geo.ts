// ---------------------------------------------------------------------------
// Offline distance estimation. No external geocoding/distance API — miles are
// computed from a bundled dataset of major US freight metros via the haversine
// great-circle distance times a road-circuity factor. Swap CITY_COORDS for a
// real geocoder + routing API later without changing callers.
// ---------------------------------------------------------------------------

export interface LatLng {
  lat: number;
  lng: number;
}

/**
 * Great-circle miles are shorter than driven miles. ~1.15 fits interstate-heavy
 * freight lanes well (the all-roads average is closer to 1.2, but long-haul
 * trucking runs straighter highways).
 */
export const ROAD_CIRCUITY_FACTOR = 1.15;

const EARTH_RADIUS_MI = 3958.8;

/** City center coordinates, keyed by "CITY, ST" (uppercased). */
export const CITY_COORDS: Record<string, LatLng> = {
  "NEW YORK, NY": { lat: 40.7128, lng: -74.006 },
  "LOS ANGELES, CA": { lat: 34.0522, lng: -118.2437 },
  "CHICAGO, IL": { lat: 41.8781, lng: -87.6298 },
  "HOUSTON, TX": { lat: 29.7604, lng: -95.3698 },
  "PHOENIX, AZ": { lat: 33.4484, lng: -112.074 },
  "PHILADELPHIA, PA": { lat: 39.9526, lng: -75.1652 },
  "SAN ANTONIO, TX": { lat: 29.4241, lng: -98.4936 },
  "SAN DIEGO, CA": { lat: 32.7157, lng: -117.1611 },
  "DALLAS, TX": { lat: 32.7767, lng: -96.797 },
  "FORT WORTH, TX": { lat: 32.7555, lng: -97.3308 },
  "SAN JOSE, CA": { lat: 37.3382, lng: -121.8863 },
  "AUSTIN, TX": { lat: 30.2672, lng: -97.7431 },
  "JACKSONVILLE, FL": { lat: 30.3322, lng: -81.6557 },
  "COLUMBUS, OH": { lat: 39.9612, lng: -82.9988 },
  "CHARLOTTE, NC": { lat: 35.2271, lng: -80.8431 },
  "INDIANAPOLIS, IN": { lat: 39.7684, lng: -86.1581 },
  "SAN FRANCISCO, CA": { lat: 37.7749, lng: -122.4194 },
  "SEATTLE, WA": { lat: 47.6062, lng: -122.3321 },
  "DENVER, CO": { lat: 39.7392, lng: -104.9903 },
  "WASHINGTON, DC": { lat: 38.9072, lng: -77.0369 },
  "NASHVILLE, TN": { lat: 36.1627, lng: -86.7816 },
  "OKLAHOMA CITY, OK": { lat: 35.4676, lng: -97.5164 },
  "EL PASO, TX": { lat: 31.7619, lng: -106.485 },
  "BOSTON, MA": { lat: 42.3601, lng: -71.0589 },
  "PORTLAND, OR": { lat: 45.5152, lng: -122.6784 },
  "LAS VEGAS, NV": { lat: 36.1699, lng: -115.1398 },
  "DETROIT, MI": { lat: 42.3314, lng: -83.0458 },
  "MEMPHIS, TN": { lat: 35.1495, lng: -90.049 },
  "LOUISVILLE, KY": { lat: 38.2527, lng: -85.7585 },
  "BALTIMORE, MD": { lat: 39.2904, lng: -76.6122 },
  "MILWAUKEE, WI": { lat: 43.0389, lng: -87.9065 },
  "ALBUQUERQUE, NM": { lat: 35.0844, lng: -106.6504 },
  "TUCSON, AZ": { lat: 32.2226, lng: -110.9747 },
  "FRESNO, CA": { lat: 36.7378, lng: -119.7871 },
  "SACRAMENTO, CA": { lat: 38.5816, lng: -121.4944 },
  "KANSAS CITY, MO": { lat: 39.0997, lng: -94.5786 },
  "ATLANTA, GA": { lat: 33.749, lng: -84.388 },
  "OMAHA, NE": { lat: 41.2565, lng: -95.9345 },
  "COLORADO SPRINGS, CO": { lat: 38.8339, lng: -104.8214 },
  "RALEIGH, NC": { lat: 35.7796, lng: -78.6382 },
  "MIAMI, FL": { lat: 25.7617, lng: -80.1918 },
  "LONG BEACH, CA": { lat: 33.7701, lng: -118.1937 },
  "VIRGINIA BEACH, VA": { lat: 36.8529, lng: -75.978 },
  "OAKLAND, CA": { lat: 37.8044, lng: -122.2712 },
  "MINNEAPOLIS, MN": { lat: 44.9778, lng: -93.265 },
  "TULSA, OK": { lat: 36.154, lng: -95.9928 },
  "TAMPA, FL": { lat: 27.9506, lng: -82.4572 },
  "ARLINGTON, TX": { lat: 32.7357, lng: -97.1081 },
  "NEW ORLEANS, LA": { lat: 29.9511, lng: -90.0715 },
  "WICHITA, KS": { lat: 37.6872, lng: -97.3301 },
  "CLEVELAND, OH": { lat: 41.4993, lng: -81.6944 },
  "BAKERSFIELD, CA": { lat: 35.3733, lng: -119.0187 },
  "AURORA, CO": { lat: 39.7294, lng: -104.8319 },
  "ANAHEIM, CA": { lat: 33.8366, lng: -117.9143 },
  "HONOLULU, HI": { lat: 21.3069, lng: -157.8583 },
  "SANTA ANA, CA": { lat: 33.7455, lng: -117.8677 },
  "RIVERSIDE, CA": { lat: 33.9806, lng: -117.3755 },
  "CORPUS CHRISTI, TX": { lat: 27.8006, lng: -97.3964 },
  "LEXINGTON, KY": { lat: 38.0406, lng: -84.5037 },
  "STOCKTON, CA": { lat: 37.9577, lng: -121.2908 },
  "ST. LOUIS, MO": { lat: 38.627, lng: -90.1994 },
  "SAINT LOUIS, MO": { lat: 38.627, lng: -90.1994 },
  "PITTSBURGH, PA": { lat: 40.4406, lng: -79.9959 },
  "CINCINNATI, OH": { lat: 39.1031, lng: -84.512 },
  "ANCHORAGE, AK": { lat: 61.2181, lng: -149.9003 },
  "GREENSBORO, NC": { lat: 36.0726, lng: -79.792 },
  "PLANO, TX": { lat: 33.0198, lng: -96.6989 },
  "NEWARK, NJ": { lat: 40.7357, lng: -74.1724 },
  "TOLEDO, OH": { lat: 41.6528, lng: -83.5379 },
  "LINCOLN, NE": { lat: 40.8136, lng: -96.7026 },
  "ORLANDO, FL": { lat: 28.5383, lng: -81.3792 },
  "CHANDLER, AZ": { lat: 33.3062, lng: -111.8413 },
  "MADISON, WI": { lat: 43.0731, lng: -89.4012 },
  "BUFFALO, NY": { lat: 42.8864, lng: -78.8784 },
  "DURHAM, NC": { lat: 35.994, lng: -78.8986 },
  "SALT LAKE CITY, UT": { lat: 40.7608, lng: -111.891 },
  "RENO, NV": { lat: 39.5296, lng: -119.8138 },
  "RICHMOND, VA": { lat: 37.5407, lng: -77.436 },
  "BIRMINGHAM, AL": { lat: 33.5186, lng: -86.8104 },
  "SPOKANE, WA": { lat: 47.6588, lng: -117.426 },
  "DES MOINES, IA": { lat: 41.5868, lng: -93.625 },
  "MODESTO, CA": { lat: 37.6391, lng: -120.9969 },
  "FAYETTEVILLE, NC": { lat: 35.0527, lng: -78.8784 },
  "TACOMA, WA": { lat: 47.2529, lng: -122.4443 },
  "OXNARD, CA": { lat: 34.1975, lng: -119.1771 },
  "FONTANA, CA": { lat: 34.0922, lng: -117.435 },
  "COLUMBUS, GA": { lat: 32.4609, lng: -84.9877 },
  "MONTGOMERY, AL": { lat: 32.3668, lng: -86.3 },
  "MOBILE, AL": { lat: 30.6954, lng: -88.0399 },
  "LITTLE ROCK, AR": { lat: 34.7465, lng: -92.2896 },
  "GRAND RAPIDS, MI": { lat: 42.9634, lng: -85.6681 },
  "SALEM, OR": { lat: 44.9429, lng: -123.0351 },
  "KNOXVILLE, TN": { lat: 35.9606, lng: -83.9207 },
  "CHATTANOOGA, TN": { lat: 35.0456, lng: -85.3097 },
  "WORCESTER, MA": { lat: 42.2626, lng: -71.8023 },
  "PROVIDENCE, RI": { lat: 41.824, lng: -71.4128 },
  "FORT WAYNE, IN": { lat: 41.0793, lng: -85.1394 },
  "TEMPE, AZ": { lat: 33.4255, lng: -111.94 },
  "ONTARIO, CA": { lat: 34.0633, lng: -117.6509 },
  "SPRINGFIELD, MO": { lat: 37.209, lng: -93.2923 },
  "SIOUX FALLS, SD": { lat: 43.5446, lng: -96.7311 },
  "PEORIA, IL": { lat: 40.6936, lng: -89.589 },
  "SHREVEPORT, LA": { lat: 32.5252, lng: -93.7502 },
  "BOISE, ID": { lat: 43.615, lng: -116.2023 },
  "SAVANNAH, GA": { lat: 32.0809, lng: -81.0912 },
  "LAREDO, TX": { lat: 27.5306, lng: -99.4803 },
  "CHARLESTON, SC": { lat: 32.7765, lng: -79.9311 },
  "COLUMBIA, SC": { lat: 34.0007, lng: -81.0348 },
  "GREENVILLE, SC": { lat: 34.8526, lng: -82.394 },
  "JACKSON, MS": { lat: 32.2988, lng: -90.1848 },
  "HARRISBURG, PA": { lat: 40.2732, lng: -76.8867 },
  "ALLENTOWN, PA": { lat: 40.6084, lng: -75.4902 },
  "SYRACUSE, NY": { lat: 43.0481, lng: -76.1474 },
  "ROCHESTER, NY": { lat: 43.1566, lng: -77.6088 },
  "ALBANY, NY": { lat: 42.6526, lng: -73.7562 },
  "DAYTON, OH": { lat: 39.7589, lng: -84.1916 },
  "AKRON, OH": { lat: 41.0814, lng: -81.519 },
  "FLINT, MI": { lat: 43.0125, lng: -83.6875 },
  "GARY, IN": { lat: 41.5934, lng: -87.3464 },
  "ROCKFORD, IL": { lat: 42.2711, lng: -89.0937 },
  "GREEN BAY, WI": { lat: 44.5133, lng: -88.0158 },
  "DULUTH, MN": { lat: 46.7867, lng: -92.1005 },
  "FARGO, ND": { lat: 46.8772, lng: -96.7898 },
  "BILLINGS, MT": { lat: 45.7833, lng: -108.5007 },
  "CHEYENNE, WY": { lat: 41.14, lng: -104.8202 },
  "AMARILLO, TX": { lat: 35.222, lng: -101.8313 },
  "LUBBOCK, TX": { lat: 33.5779, lng: -101.8552 },
  "MC ALLEN, TX": { lat: 26.2034, lng: -98.23 },
  "MCALLEN, TX": { lat: 26.2034, lng: -98.23 },
  "BROWNSVILLE, TX": { lat: 25.9017, lng: -97.4975 },
  "BATON ROUGE, LA": { lat: 30.4515, lng: -91.1871 },
  "PENSACOLA, FL": { lat: 30.4213, lng: -87.2169 },
  "TALLAHASSEE, FL": { lat: 30.4383, lng: -84.2807 },
  "FORT LAUDERDALE, FL": { lat: 26.1224, lng: -80.1373 },
  "WEST PALM BEACH, FL": { lat: 26.7153, lng: -80.0534 },
  "FORT MYERS, FL": { lat: 26.6406, lng: -81.8723 },
  "LAKELAND, FL": { lat: 28.0395, lng: -81.9498 },
  "OGDEN, UT": { lat: 41.223, lng: -111.9738 },
  "PROVO, UT": { lat: 40.2338, lng: -111.6585 },
  "EUGENE, OR": { lat: 44.0521, lng: -123.0868 },
  "YAKIMA, WA": { lat: 46.6021, lng: -120.5059 },
  "SAN BERNARDINO, CA": { lat: 34.1083, lng: -117.2898 },
  "SALINAS, CA": { lat: 36.6777, lng: -121.6555 },
};

/** Normalize "  Los Angeles ,  ca " → "LOS ANGELES, CA". */
function key(city: string, state: string): string {
  return `${city.trim().toUpperCase()}, ${state.trim().toUpperCase()}`;
}

export function hasCity(city: string, state: string): boolean {
  return key(city, state) in CITY_COORDS;
}

function haversineMiles(a: LatLng, b: LatLng): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_MI * Math.asin(Math.sqrt(h));
}

/**
 * Estimated driving miles between two US cities, or null if either city is not
 * in the bundled dataset (caller should fall back to manual entry).
 */
export function distanceMiles(
  originCity: string,
  originState: string,
  destCity: string,
  destState: string,
): number | null {
  const a = CITY_COORDS[key(originCity, originState)];
  const b = CITY_COORDS[key(destCity, destState)];
  if (!a || !b) return null;
  return Math.round(haversineMiles(a, b) * ROAD_CIRCUITY_FACTOR);
}
