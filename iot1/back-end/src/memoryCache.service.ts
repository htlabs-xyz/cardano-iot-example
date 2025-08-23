import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import type { Cache } from 'cache-manager';

@Injectable()
export class MemoryCacheService {
  private readonly prefix = (process.env.CACHE_PREFIX ?? 'app').trim();

  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  private k(key: string) {
    return `${this.prefix}:${key}`;
  }

  async get<T = unknown>(key: string): Promise<T | undefined> {
    return (await this.cache.get<T>(this.k(key))) ?? undefined;
  }

  async set<T = unknown>(key: string, value: T, ttlMs?: number): Promise<void> {
    if (ttlMs && ttlMs > 0) {
      await this.cache.set(this.k(key), value, ttlMs / 1000);
    } else {
      await this.cache.set(this.k(key), value);
    }
  }

  async del(key: string): Promise<void> {
    await this.cache.del(this.k(key));
  }

  async clear(): Promise<void> {
    await this.cache.clear();
  }

  async getOrSet<T>(
    key: string,
    compute: () => Promise<T> | T,
    ttlMs?: number,
  ): Promise<T> {
    const cacheKey = this.k(key);
    const existing = await this.cache.get<T>(cacheKey);
    if (existing !== undefined) return existing;

    const value = await compute();
    if (ttlMs && ttlMs > 0) {
      await this.cache.set(cacheKey, value, ttlMs / 1000);
    } else {
      await this.cache.set(cacheKey, value);
    }
    return value;
  }
}
