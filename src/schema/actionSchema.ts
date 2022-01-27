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

import { ItemContext, ProviderFunction1 } from '../types'
import { Component } from 'vue'
import { isTypeOfByPropertyBuilder } from '..'

type StyleType = 'primary' | 'success' | 'warning' | 'danger' | 'text'

/**
 * 行为Schema定义
 */
export interface ActionSchema {
  icon?: Component
  label?: ProviderFunction1<ItemContext, string>
  disabled?: boolean
  action: (context: ItemContext) => void
  danger?: boolean
  style?: StyleType
}

/**
 * 行为组定义
 */
export interface ActionGroupSchema {
  icon?: Component
  label?: ProviderFunction1<ItemContext, string>
  disabled?: boolean
  style?: StyleType
  children: ProviderFunction1<ItemContext, ActionSchema[]>
}

/**
 * ActionSchema类型定义
 */
export type ActionSchemaType = ActionSchema | ActionGroupSchema

/**
 * ActionGroupSchema类型断言函数
 */
export const isActionGroupSchema = isTypeOfByPropertyBuilder<ActionGroupSchema>('children')

/**
 * ActionSchema Provider函数定义
 */
export type ActionSchemaProvider = (context: ItemContext, ...rest: any[]) => ActionSchemaType[]
