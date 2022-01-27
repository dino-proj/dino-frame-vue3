// Copyright 2022 dinospring.cn
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

import { isFunction } from '@vue/shared'
import { get, has } from 'lodash-es'

/**
 * interface‘命名类型’系统
 *
 * @remark
 * 可以通过 {@link isTypeOf} 来判断是否是某种类型
 * 可以通过 {@link TypeNameExtract}来生成命名类型的类,如：
 * ```jsx
 * interface A extends NamedType<'a'>{}
 * interface B extends NamedType<'b'>{}
 *
 * type TypeNames = TypeNameExtract<A | B> //得到 'a' | 'b'
 *
 * ```
 */
export interface NamedType<TypeName extends string> {
  type: TypeName
}

/**
 * 根据类型名，判断对象是否是某种类型
 * @param obj 对象
 * @param typeName 命名类型
 * @returns
 */
export const isTypeOf = <Type extends NamedType<any>>(obj: any, typeName: Type['type']): obj is Type => {
  return get(obj, typeName) === typeName
}

/**
 * 根据对象Property属性是否存在的类型断言函数
 * @param val 判断的对象
 * @param property 对象的属性
 * @returns
 */
export const isTypeOfByProperty = <Type>(val: any, property: [keyof Type]): val is Type => {
  return has(val, property)
}

/**
 * 生成根据类型属性是否存在的类型断言函数
 * @param path 类型的属性，参见Loadsh {@link has}函数
 * @returns
 */
export const isTypeOfByPropertyBuilder = <Type>(path: string | string[]): ((val: any) => val is Type) => {
  return (val: any): val is Type => {
    return has(val, path)
  }
}

/**
 * 获取{@link NamedType} 类型的type串
 */
export type TypeNameExtract<FT> = FT extends NamedType<any> ? FT['type'] : never

/**
 * 用于Item处理的回调函数Context参数类型
 */
export interface ItemContext<ItemType = any> {
  item: ItemType
  index: number
}

/**
 * 用户Item的某个Field处理的回调函数的Context参数类型
 */
export interface ItemFieldContext<ItemType = any> extends ItemContext<ItemType> {
  field: string
  value: any
  getValue: <T = any>(field: string) => T
}

/**
 * Provider函数类型类型定义，无参数
 */
export declare type ProviderFunction<Return> = Return | ((...rests: any[]) => Return)

/**
 * Provider函数类型类型定义，1个Context参数
 */
export declare type ProviderFunction1<Param, Return> = Return | ((context: Param, ...rests: any[]) => Return)

/**
 * 获取Provider的值
 * @param provider Provider 对象
 * @returns
 */
export const getProviderValue = <Return>(provider: ProviderFunction<Return>, ...rests: any[]): Return => {
  if (isFunction(provider)) {
    return provider(...rests)
  } else {
    return provider
  }
}

/**
 * 获取Provider的值
 * @param provider Provider 对象
 * @param context 传给Provider的Context
 * @returns
 */
export const getProviderValue1 = <Param, Return>(provider: ProviderFunction1<Param, Return>, context: Param, ...rests: any[]): Return => {
  if (isFunction(provider)) {
    return provider(context, rests)
  } else {
    return provider
  }
}

/**
 * 键值对类型
 */
export interface ValueLabel<ValueType = string> {
  value: ValueType
  label: string
}
