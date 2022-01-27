import { isUndefined } from 'lodash-es'
import WebStorageCache from 'web-storage-cache'

export interface Cache {
  /**
   * 往缓存中插入数据。
   * @param key
   * @param value 支持所以可以JSON.parse 的类型。注：当为undefined的时候会执行 delete(key)操作。
   * @param expr 单位：秒，不传则为长期
   */
  set(key: string, value: any, expr?: number): void

  /**
   * 根据key获取缓存中未超时数据。返回相应类型String、Boolean、PlainObject、Array的值。
   */
  get(key: string): any

  /**
   * 根据key判断缓存中数据是否存在，且未超时。
   */
  exist(key: string): boolean

  /**
   * 根据key删除缓存中的值
   */
  delete(key: string): void

  /**
   * 清空缓存中全部的值
   * 注意：这个方法会清除不是使用WebStorageCache插入的值。推荐使用:deleteAllExpires
   */
  clear(): void

  /**
   * 根据key为已存在的（未超时的）缓存值以当前时间为基准设置新的超时时间。
   * @param key
   * @param expr 单位：秒, 以当前时间为起点的新的超时时间
   */
  renew(key: string, expr: number): void
}

class CacheStorage implements Cache {
  private storage: WebStorageCache

  public constructor(cacheType: 'sessionStorage' | 'localStorage') {
    this.storage = new WebStorageCache({
      storage: cacheType,
    })
  }

  public set<T = any>(key: string, value: T, expr?: number): void {
    this.storage.deleteAllExpires()
    if (isUndefined(expr) || isNaN(expr)) {
      this.storage.set(key, value)
    } else {
      this.storage.set(key, value, { exp: expr })
    }
  }
  public get<T>(key: string): T {
    this.storage.deleteAllExpires()
    return this.storage.get(key) as T
  }
  public exist(key: string): boolean {
    this.storage.deleteAllExpires()
    return this.storage.get(key) != null
  }

  public delete(key: string): void {
    this.storage.deleteAllExpires()
    this.storage.delete(key)
  }

  public clear(): void {
    this.storage.clear()
  }

  public renew(key: string, expr: number): void {
    this.storage.touch(key, expr)
  }
}

const sessionCache: CacheStorage = new CacheStorage('sessionStorage')

const localCache: CacheStorage = new CacheStorage('localStorage')

export const useSessionCache = (): Cache => {
  return sessionCache
}

export const useLocalCache = (): Cache => {
  return localCache
}
