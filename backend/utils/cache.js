/**
 * In-Memory Cache Utility
 * Provides simple key-value caching with TTL support
 * Can be easily replaced with Redis for production scaling
 */

class CacheService {
  constructor() {
    this.cache = new Map();
    this.timers = new Map();
  }

  /**
   * Set a value in cache with optional TTL
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in milliseconds (default: 24 hours)
   */
  set(key, value, ttl = 24 * 60 * 60 * 1000) {
    // Clear existing timer if any
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    // Set the value
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttl
    });

    // Set expiration timer
    const timer = setTimeout(() => {
      this.delete(key);
    }, ttl);

    this.timers.set(key, timer);
  }

  /**
   * Get a value from cache
   * @param {string} key - Cache key
   * @returns {any} Cached value or null if not found/expired
   */
  get(key) {
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    // Check if expired
    if (Date.now() > item.expiresAt) {
      this.delete(key);
      return null;
    }

    return item.value;
  }

  /**
   * Delete a value from cache
   * @param {string} key - Cache key
   */
  delete(key) {
    // Clear timer
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }

    // Delete cache entry
    this.cache.delete(key);
  }

  /**
   * Check if key exists in cache and is not expired
   * @param {string} key - Cache key
   * @returns {boolean}
   */
  has(key) {
    return this.get(key) !== null;
  }

  /**
   * Clear all cache entries
   */
  clear() {
    // Clear all timers
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }

    this.cache.clear();
    this.timers.clear();
  }

  /**
   * Get cache statistics
   * @returns {object} Cache stats
   */
  getStats() {
    const now = Date.now();
    let activeEntries = 0;
    let expiredEntries = 0;

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        expiredEntries++;
      } else {
        activeEntries++;
      }
    }

    return {
      totalEntries: this.cache.size,
      activeEntries,
      expiredEntries,
      memoryUsage: process.memoryUsage().heapUsed
    };
  }

  /**
   * Clean up expired entries manually
   */
  cleanup() {
    const now = Date.now();
    const keysToDelete = [];

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.delete(key));
    
    return keysToDelete.length;
  }
}

// Singleton instance
const cache = new CacheService();

// Cleanup expired entries every hour (unref to not prevent process exit)
const cleanupInterval = setInterval(() => {
  const cleaned = cache.cleanup();
  if (cleaned > 0) {
    console.log(`[Cache] Cleaned up ${cleaned} expired entries`);
  }
}, 60 * 60 * 1000);
cleanupInterval.unref();

export default cache;
