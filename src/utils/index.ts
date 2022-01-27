// Copyright 2021 dinospring.cn
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { camelCase, isArray, isDate, isFunction, isNil, isNumber, isObject, isRegExp, isString, snakeCase } from 'lodash-es'

/**
 * 将对象的snake属性转换为camle格式
 * @param source 源对象
 * @param target 目标对象，可选
 * @returns
 */
export const toCamleObject = <T>(source: Object, target?: T): T => {
  if (isNil(source) || isString(source) || isNumber(source) || isRegExp(source) || isDate(source) || isFunction(source)) {
    return source as unknown as T
  }
  if (isArray(source)) {
    return source.map((v) => toCamleObject(v)) as unknown as T
  }
  const res = target ?? ({} as T)

  for (const prop in source) {
    const val = source[prop]
    if (prop.startsWith('@')) {
      res[prop] = toCamleObject(val)
    } else {
      res[camelCase(prop)] = toCamleObject(val)
    }
  }

  return res
}

/**
 * 将对象的camle属性转换为snake格式
 * @param source 源对象
 * @param target 目标对象，可选
 * @returns
 */
export const toSnakeObject = <T>(source: any, target?: T): T => {
  if (isNil(source) || isString(source) || isNumber(source) || isRegExp(source) || isDate(source) || isFunction(source)) {
    return source as unknown as T
  }
  if (isArray(source)) {
    return source.map((v) => toSnakeObject(v)) as unknown as T
  }
  const res = target ?? ({} as T)

  for (const prop in source) {
    const val = source[prop]
    if (prop.startsWith('@')) {
      res[prop] = toSnakeObject(val)
    } else {
      res[snakeCase(prop)] = toSnakeObject(val)
    }
  }

  return res
}

/**
 * 将'T | T[]' 这种类型统一处理成 T[]类型
 * @param v
 * @returns
 */
export const asArray = <T>(v: T | T[]): T[] => {
  if (isNil(v)) {
    return []
  }
  if (isArray(v)) {
    return v
  }
  return [v]
}

/**
 * 同步获取值或函数调用结果
 * @param v
 * @param restArgs
 * @returns
 */
export const awaitGet = <T>(v: T | ((...args: any[]) => Promise<T>) | ((...args: any[]) => T) | Promise<T>, ...restArgs: any[]): T => {
  if (isFunction(v)) {
    const fun = v as (...args: any[]) => Promise<T>
    v = fun(...restArgs)
  }
  if (isPromise(v)) {
    return Promise.all([v])[0]
  } else {
    return v
  }
}

/**
 * 是否是Promise对象
 * @param val
 * @returns
 */
export const isPromise = <T = any>(val: unknown): val is Promise<T> => {
  return isObject(val) && isFunction(val['then']) && isFunction(val['catch'])
}

let uuid = 1

/**
 * 生成不断增长的id
 * @param prefix 前缀
 * @returns
 */
export const useUUID = (prefix?: string): string => {
  return (prefix ?? '') + ++uuid
}
