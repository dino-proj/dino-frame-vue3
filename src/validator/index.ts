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

import { asArray } from '../utils'
import { Function1, Many, snakeCase, camelCase, toString, has } from 'lodash'
import { rules } from './rules'

export interface ValidateContext {
  name: string
  value: any
  getValue: (name: string) => any
}

export interface ErrorContext extends ValidateContext {
  params: string[]
}

export type ValuedateFunction = (context: ValidateContext) => Promise<boolean>

export interface RuleConfig {
  generator: () => ValuedateFunction
  usage: Many<string>
  errorMsg?: Record<string, string | Function1<ErrorContext, string>>
}

/**
 * 定义Rule
 * @param addRules
 */
export const defineRule = (name: string, addRules: RuleConfig | RuleConfig[]) => {
  asArray(addRules).forEach((rule) => {
    if (has(rules, snakeCase(name))) {
      console.warn('validator rule[' + name + '] will be override.')
    }
    rules[snakeCase(name)] = rule
  })
}

/**
 * 打印validator规则的Usage
 */
export const printRulesUsage = () => {
  Object.values(rules).forEach((rule) => console.log(toString(rule.usage)))
}

/**
 * Given an array or string return an array of callables.
 * @param {array|string} validation
 * @return {array} an array of functions
 */
export function parseRules(validation: Many<string>) {
  if (typeof validation === 'string') {
    return parseRules(validation.split('|'))
  }
  if (!Array.isArray(validation)) {
    return []
  }
  return validation.map((rule) => parseRule(rule)).filter((f) => !!f)
}
/**
 * Given a string or function, parse it and return an array in the format
 * [fn, [...arguments]]
 * @param {string|function} rule
 */
function parseRule(rule) {
  if (typeof rule === 'function') {
    return [rule, []]
  }
  if (Array.isArray(rule) && rule.length) {
    rule = rule.map((r) => r) // light clone
    const [ruleName, modifier] = parseModifier(rule.shift())
    if (typeof ruleName === 'string' && has(rules, ruleName)) {
      return [rules[ruleName], rule, ruleName, modifier]
    }
    if (typeof ruleName === 'function') {
      return [ruleName, rule, ruleName, modifier]
    }
  }
  if (typeof rule === 'string' && rule) {
    const segments = rule.split(':')
    const [ruleName, modifier] = parseModifier(segments.shift())
    if (has(rules, ruleName)) {
      return [rules[ruleName], segments.length ? segments.join(':').split(',') : [], ruleName, modifier]
    } else {
      throw new Error(`Unknown validation rule ${rule}`)
    }
  }
  return false
}

/**
 * Return the rule name with the applicable modifier as an array.
 * @param {string} ruleName
 * @return {array} [ruleName, modifier]
 */
function parseModifier(ruleName: string) {
  if (/^[\^]/.test(ruleName.charAt(0))) {
    return [camelCase(ruleName.substring(1)), ruleName.charAt(0)]
  }
  return [camelCase(ruleName), null]
}
