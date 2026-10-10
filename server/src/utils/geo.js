/**
 * Geo utilities for distance calculation, GeoJSON adaptation,
 * and 250-metre privacy grid cell aggregation.
 */

// Earth radius in meters
const EARTH_RADIUS_METERS = 6371000;

/**
 * Calculates distance in meters between two [latitude, longitude] or GeoJSON [longitude, latitude] coordinates.
 */
export function calculateDistanceMeters(coordA, coordB, isGeoJSON = false) {
  if (!coordA || !coordB) return null;
  
  const lat1 = isGeoJSON ? coordA[1] : coordA[0];
  const lon1 = isGeoJSON ? coordA[0] : coordA[1];
  const lat2 = isGeoJSON ? coordB[1] : coordB[0];
  const lon2 = isGeoJSON ? coordB[0] : coordB[1];

  if (typeof lat1 !== 'number' || typeof lon1 !== 'number' || typeof lat2 !== 'number' || typeof lon2 !== 'number') {
    return null;
  }

  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(EARTH_RADIUS_METERS * c);
}

/**
 * Snap a latitude and longitude to an approximate 250m grid cell center.
 * ~250m corresponds to approx 0.00225 degrees latitude.
 * Returns a cell identifier and the cell center coordinates for privacy-preserving heatmap rendering.
 */
export function get250mGridCell(lat, lon) {
  if (typeof lat !== 'number' || typeof lon !== 'number') return null;

  // Approx 0.00225 degrees ~ 250 meters
  const STEP = 0.00225;
  const snappedLat = Math.round(lat / STEP) * STEP;
  const snappedLon = Math.round(lon / STEP) * STEP;

  const cellId = `cell_${snappedLat.toFixed(5)}_${snappedLon.toFixed(5)}`;
  return {
    cellId,
    centerLat: Number(snappedLat.toFixed(5)),
    centerLon: Number(snappedLon.toFixed(5))
  };
}
