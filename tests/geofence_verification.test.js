/**
 * =========================================================
 * AUTOMATED TEST SUITE: GPS GEOFENCING & ATTENDANCE VERIFICATION
 * Project: SmartAttend - Smart QR Attendance System
 * College: R.C.Patel Institute of Technology, Shirpur
 * =========================================================
 */

import { calculateHaversineDistance, verifyGeofence, isValidCoordinate, offsetCoordinates } from '../src/utils/geoUtils.js';

let passed = 0;
let failed = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`  ✅ PASS: ${testName} ${details ? `(${details})` : ''}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName} ${details ? `(${details})` : ''}`);
    failed++;
  }
}

console.log('================================================================');
console.log('🧪 RUNNING SMARTATTEND GPS GEOFENCING TEST SUITE');
console.log('================================================================\n');

// Mock Classroom: Room 204 - DS Lab (R.C. Patel Institute of Tech)
const mockRoom204 = {
  id: 'CR-204',
  name: 'Room 204 - Data Science Lab',
  roomNumber: '204',
  building: 'Main CS Block (2nd Floor)',
  latitude: 21.311500,
  longitude: 74.881200,
  radiusMeters: 20,
  maxAccuracyAllowed: 50,
  status: 'Active'
};

// -------------------------------------------------------------
// Test Case 1: Student inside permitted radius with acceptable accuracy
// -------------------------------------------------------------
console.log('--- TEST GROUP 1: Physical Proximity & Geofencing ---');
{
  // Student standing 5m away inside the room
  const studentInside = offsetCoordinates(mockRoom204.latitude, mockRoom204.longitude, 5, 45);
  const result = verifyGeofence(
    { latitude: studentInside.latitude, longitude: studentInside.longitude, accuracy: 8 },
    mockRoom204
  );

  assert(result.isValid === true, 'Test 1.1: Student inside permitted radius succeeds', `Distance: ${result.distanceMeters}m <= ${result.allowedRadius}m`);
}

// -------------------------------------------------------------
// Test Case 2: Student outside permitted radius (e.g. Canteen 140m away)
// -------------------------------------------------------------
{
  const studentInCanteen = offsetCoordinates(mockRoom204.latitude, mockRoom204.longitude, 140, 180);
  const result = verifyGeofence(
    { latitude: studentInCanteen.latitude, longitude: studentInCanteen.longitude, accuracy: 12 },
    mockRoom204
  );

  assert(result.isValid === false, 'Test 2.1: Student in canteen is rejected', `Distance: ${result.distanceMeters}m > ${result.allowedRadius}m`);
  assert(result.reason === 'OUT_OF_BOUNDS', 'Test 2.2: Rejection reason is OUT_OF_BOUNDS');
}

// -------------------------------------------------------------
// Test Case 3: Student exactly on the configured radius boundary
// -------------------------------------------------------------
{
  const studentOnBoundary = offsetCoordinates(mockRoom204.latitude, mockRoom204.longitude, 20.0, 90);
  const result = verifyGeofence(
    { latitude: studentOnBoundary.latitude, longitude: studentOnBoundary.longitude, accuracy: 10 },
    mockRoom204
  );

  assert(result.isValid === true, 'Test 3.1: Student on exact 20m boundary is accepted (<= radius)', `Distance: ${result.distanceMeters}m`);
}

// -------------------------------------------------------------
// Test Case 4: Location missing / permission denied
// -------------------------------------------------------------
console.log('\n--- TEST GROUP 2: Sensor & Permission Handling ---');
{
  const resultMissing = verifyGeofence(null, mockRoom204);
  assert(resultMissing.isValid === false, 'Test 4.1: Missing location payload is rejected');
  assert(resultMissing.reason === 'NO_LOCATION', 'Test 4.2: Reason is NO_LOCATION');

  const resultEmpty = verifyGeofence({}, mockRoom204);
  assert(resultEmpty.isValid === false, 'Test 4.3: Empty location coordinates rejected');
}

// -------------------------------------------------------------
// Test Case 5: Poor GPS Accuracy Threshold (±95m > max 50m)
// -------------------------------------------------------------
{
  const studentWeakGps = offsetCoordinates(mockRoom204.latitude, mockRoom204.longitude, 6, 0);
  const result = verifyGeofence(
    { latitude: studentWeakGps.latitude, longitude: studentWeakGps.longitude, accuracy: 95 },
    mockRoom204
  );

  assert(result.isValid === false, 'Test 5.1: Inaccurate GPS fix (±95m) is rejected for retry');
  assert(result.reason === 'POOR_GPS_ACCURACY', 'Test 5.2: Reason is POOR_GPS_ACCURACY', `Accuracy: ±${result.accuracy}m > max ±${result.maxAccuracy}m`);
}

// -------------------------------------------------------------
// Test Case 6: Coordinate Validation & Injection Safeguards
// -------------------------------------------------------------
console.log('\n--- TEST GROUP 3: Security & Validation Safeguards ---');
{
  assert(isValidCoordinate(21.3115, 74.8812) === true, 'Test 6.1: Valid coordinates format passed');
  assert(isValidCoordinate(95.0, 74.8812) === false, 'Test 6.2: Out of range latitude (>90) blocked');
  assert(isValidCoordinate(-92.0, 74.8812) === false, 'Test 6.3: Out of range latitude (<-90) blocked');
  assert(isValidCoordinate(21.3115, 195.0) === false, 'Test 6.4: Out of range longitude (>180) blocked');
  assert(isValidCoordinate('invalid', 'coordinates') === false, 'Test 6.5: Non-numeric strings blocked');
  assert(isValidCoordinate(Infinity, 74.8812) === false, 'Test 6.6: Infinite coordinates blocked');
  assert(isValidCoordinate(NaN, 74.8812) === false, 'Test 6.7: NaN coordinates blocked');
}

// -------------------------------------------------------------
// Test Case 7: Haversine Calculation Mathematical Precision
// -------------------------------------------------------------
{
  // Distance from (0, 0) to (0, 1) degree longitude on equator: approx 111.195 km = 111195m
  const equatorDist = calculateHaversineDistance(0, 0, 0, 1);
  assert(Math.abs(equatorDist - 111195) < 200, 'Test 7.1: Equator 1-degree longitude distance precision', `Got ${equatorDist}m`);

  // Distance between same points must be 0
  const zeroDist = calculateHaversineDistance(21.3115, 74.8812, 21.3115, 74.8812);
  assert(zeroDist === 0, 'Test 7.2: Distance to identical point is exactly 0.0m');
}

console.log('\n================================================================');
console.log(`📊 TEST SUITE SUMMARY: ${passed} PASSED | ${failed} FAILED`);
console.log('================================================================');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
