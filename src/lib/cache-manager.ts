/**
 * Advanced Cache Manager for Dr. Niaraki Website
 * Handles intelligent caching of heavy components and resources
 */

interface CacheEntry {
  data: unknown;
  timestamp: number;
  expiryTime: number;
  version: string;
  accessCount: number;
  lastAccess: number;
}

interface CacheConfig {
  maxSize: number;
  defaultTTL: number; // Time to live in milliseconds
  persistKey: string;
  version: string;
}

class CacheManager {
  private cache: Map<string, CacheEntry>;
  private config: CacheConfig;
  private storageKey: string;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: 50,
      defaultTTL: 30 * 60 * 1000, // 30 minutes
      persistKey: 'dr-niaraki-cache',
      version: '1.0.0',
      ...config,
    };
    
    this.cache = new Map();
    this.storageKey = this.config.persistKey;
    this.loadFromStorage();
  }

  /**
   * Set item in cache with optional TTL
   */
  set(key: string, data: unknown, ttl?: number): void {
    const now = Date.now();
    const expiryTime = now + (ttl || this.config.defaultTTL);
    
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.config.maxSize) {
      this.evictOldest();
    }

    const entry: CacheEntry = {
      data,
      timestamp: now,
      expiryTime,
      version: this.config.version,
      accessCount: 1,
      lastAccess: now,
    };

    this.cache.set(key, entry);
    this.saveToStorage();
  }

  /**
   * Get item from cache
   */
  get(key: string): unknown | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiryTime) {
      this.cache.delete(key);
      this.saveToStorage();
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccess = Date.now();
    
    return entry.data;
  }

  /**
   * Check if item exists and is valid
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }

    // Check if expired
    if (Date.now() > entry.expiryTime) {
      this.cache.delete(key);
      this.saveToStorage();
      return false;
    }

    return true;
  }

  /**
   * Remove item from cache
   */
  delete(key: string): boolean {
    const result = this.cache.delete(key);
    if (result) {
      this.saveToStorage();
    }
    return result;
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    this.clearStorage();
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    entries: Array<{
      key: string;
      size: number;
      lastAccess: Date;
      accessCount: number;
      expiresAt: Date;
    }>;
  } {
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      size: JSON.stringify(entry.data).length,
      lastAccess: new Date(entry.lastAccess),
      accessCount: entry.accessCount,
      expiresAt: new Date(entry.expiryTime),
    }));

    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitRate: this.calculateHitRate(),
      entries,
    };
  }

  /**
   * Evict expired entries
   */
  cleanup(): number {
    const now = Date.now();
    let removedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiryTime) {
        this.cache.delete(key);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      this.saveToStorage();
    }

    return removedCount;
  }

  /**
   * Preload multiple items
   */
  async preload(items: Array<{ key: string; loader: () => Promise<unknown>; ttl?: number }>): Promise<void> {
    const promises = items.map(async ({ key, loader, ttl }) => {
      if (!this.has(key)) {
        try {
          const data = await loader();
          this.set(key, data, ttl);
        } catch (error) {
          console.warn(`Failed to preload cache item ${key}:`, error);
        }
      }
    });

    await Promise.allSettled(promises);
  }

  /**
   * Invalidate cache based on pattern
   */
  invalidatePattern(pattern: RegExp): number {
    let removedCount = 0;
    
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      this.saveToStorage();
    }

    return removedCount;
  }

  private evictOldest(): void {
    let oldestKey = '';
    let oldestAccess = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccess < oldestAccess) {
        oldestAccess = entry.lastAccess;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  private calculateHitRate(): number {
    if (this.cache.size === 0) {
      return 0;
    }
    
    const totalAccesses = Array.from(this.cache.values())
      .reduce((sum, entry) => sum + entry.accessCount, 0);
    
    return totalAccesses / this.cache.size;
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const cacheData = {
        version: this.config.version,
        entries: Array.from(this.cache.entries()),
        timestamp: Date.now(),
      };
      
      localStorage.setItem(this.storageKey, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to save cache to localStorage:', error);
    }
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) {
        return;
      }

      const cacheData = JSON.parse(stored);
      
      // Check version compatibility
      if (cacheData.version !== this.config.version) {
        this.clearStorage();
        return;
      }

      // Restore cache entries, filtering out expired ones
      const now = Date.now();
      for (const [key, entry] of cacheData.entries) {
        if (now <= entry.expiryTime) {
          this.cache.set(key, entry);
        }
      }
    } catch (error) {
      console.warn('Failed to load cache from localStorage:', error);
      this.clearStorage();
    }
  }

  private clearStorage(): void {
    if (typeof window === 'undefined') {
      return;
    }
    
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.warn('Failed to clear cache storage:', error);
    }
  }
}

// Create singleton instance
export const cacheManager = new CacheManager({
  maxSize: 100,
  defaultTTL: 30 * 60 * 1000, // 30 minutes
  persistKey: 'dr-niaraki-cache',
  version: '1.0.0',
});

// Component cache utilities
export const ComponentCache = {
  // Cache component data
  cacheComponent: (componentId: string, data: unknown, ttl?: number) => {
    cacheManager.set(`component:${componentId}`, data, ttl);
  },

  // Get cached component data
  getCachedComponent: (componentId: string) => {
    return cacheManager.get(`component:${componentId}`);
  },

  // Check if component is cached
  isComponentCached: (componentId: string) => {
    return cacheManager.has(`component:${componentId}`);
  },

  // Cache animation data
  cacheAnimation: (animationId: string, data: unknown, ttl?: number) => {
    cacheManager.set(`animation:${animationId}`, data, ttl);
  },

  // Get cached animation data
  getCachedAnimation: (animationId: string) => {
    return cacheManager.get(`animation:${animationId}`);
  },

  // Invalidate component cache
  invalidateComponent: (componentId: string) => {
    cacheManager.delete(`component:${componentId}`);
  },

  // Invalidate all components
  invalidateAllComponents: () => {
    cacheManager.invalidatePattern(/^component:/);
  },

  // Get cache statistics
  getStats: () => cacheManager.getStats(),

  // Cleanup expired entries
  cleanup: () => cacheManager.cleanup(),
};

export default cacheManager; 