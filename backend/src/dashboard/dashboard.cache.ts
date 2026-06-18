interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export class DashboardCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly TTL = 30000; // 30 seconds

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  clear(): void {
    this.cache.clear();
  }
}
