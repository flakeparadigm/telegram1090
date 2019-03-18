/**
 * Airplane Service
 *
 * This service will handle tracking the airplane data received from dump1090.
 * Planned responsibilities, ordered by priority:
 *   1. Gather and keep latest data point(s) about visible planes
 *   2. Alert initializer when a plane enters the geofence
 *   3. Garbage collect or swap off old data
 *
 * Future ideas:
 *   - Track high-level daily stats about planes seen
 *   - Persist daily stats for historical purposes
 *   - Track and save observed flight paths (not just latest location)
 *   - Generate flight path images on a map
 */
