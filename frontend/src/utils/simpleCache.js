// Simple in-memory cache with TTL support

const cache = new Map();

/**
 * Get cached data if it exists and hasn't expired
 * @param {string} key - Cache key
 * @returns {any|null} Cached data or null if not found/expired
 */
export function getCache(key) {
  const entry = cache.get(key);
  if (!entry) return null;

  const now = Date.now();
  if (now > entry.expiresAt) {
    cache.delete(key);
    return null;
  }

  return entry.data;
}

/**
 * Store data in cache with TTL
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 * @param {number} ttl - Time to live in milliseconds
 */
export function setCache(key, data, ttl) {
  const expiresAt = Date.now() + ttl;
  cache.set(key, { data, expiresAt });
}

/**
 * Clear specific cache entry or all cache
 * @param {string} [key] - Cache key to clear. If not provided, clears all cache.
 */
export function clearCache(key) {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
}
