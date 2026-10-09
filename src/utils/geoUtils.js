/**
 * =========================================================
 * GEOSPATIAL UTILITIES & HAVERSINE DISTANCE ENGINE
 * College: R.C.Patel Institute of Technology, Shirpur
 * Smart QR Attendance System - Geofencing Engine
 * =========================================================
 */

// Earth's mean radius in meters
const EARTH_RADIUS_METERS = 6371000;

/**
 * Converts degrees to radians
 * @param {number} degrees 
 * @returns {number} radians
 */
export const toRadians = (degrees) => {
  return (degrees * Math.PI) / 180;
};

/**
 * Validates whether latitude and longitude are valid numeric coordinates.
 * @param {number|string} lat 
 * @param {number|string} lon 
 * @returns {boolean}
 */
export const isValidCoordinate = (lat, lon) => {
  const numLat = Number(lat);
  const numLon = Number(lon);
  
  if (isNaN(numLat) || isNaN(numLon) || !isFinite(numLat) || !isFinite(numLon)) {
    return false;
  }
  
  // Latitude must be between -90 and +90
  // Longitude must be between -180 and +180
  if (numLat < -90 || numLat > 90 || numLon < -180 || numLon > 180) {
    return false;
  }
  
  return true;
};

/**
 * Calculates great-circle distance between two geographic coordinates using the Haversine formula.
 * Formula:
 * a = sin²(Δφ/2) + cos(φ1) * cos(φ2) * sin²(Δλ/2)
 * c = 2 * atan2(√a, √(1−a))
 * d = R * c
 * 
 * @param {number} lat1 Latitude of point 1 (degrees)
 * @param {number} lon1 Longitude of point 1 (degrees)
 * @param {number} lat2 Latitude of point 2 (degrees)
 * @param {number} lon2 Longitude of point 2 (degrees)
 * @returns {number} Distance in meters
 */
export const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
  if (!isValidCoordinate(lat1, lon1) || !isValidCoordinate(lat2, lon2)) {
    throw new Error('Invalid coordinates provided to Haversine calculation');
  }

  const phi1 = toRadians(Number(lat1));
  const phi2 = toRadians(Number(lat2));
  const deltaPhi = toRadians(Number(lat2) - Number(lat1));
  const deltaLambda = toRadians(Number(lon2) - Number(lon1));

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) *
    Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = EARTH_RADIUS_METERS * c;
  return Math.round(distance * 10) / 10; // Round to 1 decimal place (e.g., 8.4 meters)
};

/**
 * Verifies if a student's reported GPS coordinates fall within the registered classroom geofence.
 * 
 * @param {Object} studentLocation - { latitude, longitude, accuracy }
 * @param {Object} classroom - { id, name, latitude, longitude, radiusMeters, maxAccuracyAllowed }
 * @param {number} [systemMaxAccuracy=60] - Fallback maximum allowable GPS accuracy radius in meters
 * @returns {Object} { isValid, distanceMeters, accuracy, reason, message }
 */
export const verifyGeofence = (studentLocation, classroom, systemMaxAccuracy = 60) => {
  if (!classroom) {
    return {
      isValid: false,
      reason: 'CLASSROOM_NOT_FOUND',
      message: 'Classroom configuration not found for this attendance session.'
    };
  }

  if (!studentLocation || studentLocation.latitude === undefined || studentLocation.longitude === undefined) {
    return {
      isValid: false,
      reason: 'NO_LOCATION',
      message: 'Student GPS coordinates were not provided. Attendance requires physical presence verification.'
    };
  }

  const { latitude, longitude, accuracy = 0 } = studentLocation;

  // 1. Validate coordinate ranges
  if (!isValidCoordinate(latitude, longitude)) {
    return {
      isValid: false,
      reason: 'INVALID_COORDINATES',
      message: 'Student coordinates are malformed or out of valid geographic range.'
    };
  }

  if (!isValidCoordinate(classroom.latitude, classroom.longitude)) {
    return {
      isValid: false,
      reason: 'INVALID_CLASSROOM_COORDINATES',
      message: 'Registered classroom coordinates in database are invalid.'
    };
  }

  // 2. Validate GPS accuracy threshold
  const maxAccuracy = classroom.maxAccuracyAllowed || systemMaxAccuracy;
  if (accuracy > 0 && accuracy > maxAccuracy) {
    return {
      isValid: false,
      accuracy: Math.round(accuracy),
      maxAccuracy,
      reason: 'POOR_GPS_ACCURACY',
      message: `GPS signal accuracy is too weak (±${Math.round(accuracy)}m). Maximum allowed accuracy is ±${maxAccuracy}m. Please step near a window/open area and retry.`
    };
  }

  // 3. Compute distance via Haversine
  const distanceMeters = calculateHaversineDistance(
    latitude,
    longitude,
    classroom.latitude,
    classroom.longitude
  );

  const allowedRadius = Number(classroom.radiusMeters) || 20;

  // 4. Geofence Boundary Check
  if (distanceMeters <= allowedRadius) {
    return {
      isValid: true,
      distanceMeters,
      allowedRadius,
      accuracy: Math.round(accuracy),
      classroomId: classroom.id,
      classroomName: classroom.name,
      message: `Location verified! You are ${distanceMeters}m from ${classroom.name} (within ${allowedRadius}m radius).`
    };
  } else {
    return {
      isValid: false,
      distanceMeters,
      allowedRadius,
      accuracy: Math.round(accuracy),
      classroomId: classroom.id,
      classroomName: classroom.name,
      reason: 'OUT_OF_BOUNDS',
      message: `Attendance rejected: You are ${distanceMeters}m away from ${classroom.name}. Allowed radius is ${allowedRadius}m.`
    };
  }
};

/**
 * Calculates a point given an origin coordinate, bearing (degrees), and distance (meters).
 * Useful for generating realistic simulation test cases.
 * 
 * @param {number} lat Origin latitude
 * @param {number} lon Origin longitude
 * @param {number} distanceMeters Distance to offset in meters
 * @param {number} bearingDegrees Bearing in degrees (0 = North, 90 = East, 180 = South, 270 = West)
 * @returns {{ latitude: number, longitude: number }}
 */
export const offsetCoordinates = (lat, lon, distanceMeters, bearingDegrees = 45) => {
  const delta = distanceMeters / EARTH_RADIUS_METERS;
  const theta = toRadians(bearingDegrees);
  const phi1 = toRadians(lat);
  const lambda1 = toRadians(lon);

  const phi2 = Math.asin(
    Math.sin(phi1) * Math.cos(delta) +
    Math.cos(phi1) * Math.sin(delta) * Math.cos(theta)
  );

  const lambda2 = lambda1 + Math.atan2(
    Math.sin(theta) * Math.sin(delta) * Math.cos(phi1),
    Math.cos(delta) - Math.sin(phi1) * Math.sin(phi2)
  );

  return {
    latitude: Number(((phi2 * 180) / Math.PI).toFixed(6)),
    longitude: Number(((lambda2 * 180) / Math.PI).toFixed(6))
  };
};
