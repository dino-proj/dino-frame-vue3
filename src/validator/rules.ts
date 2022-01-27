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

import { dateFormatToRegExp, isEmail, isEndsWith, isHost, isHttpsUrl, isIdCard, isIp, isNum, isPhone, isStartsWith, isTel, isUrl } from './validators'

import { eq, isArrayLike, isEmpty, isNil, isNumber, isRegExp, toNumber, trimEnd } from 'lodash-es'
import { RuleConfig, ValidateContext } from './'

/**
 * rules from https://github.com/wearebraid/vue-formulate
 */
export const rules: Record<string, RuleConfig> = {
  /**
   * Rule: the value must be "yes", "on", "1", or true
   */
  accepted: {
    generator: function (): (context: ValidateContext) => Promise<boolean> {
      return ({ value }) => {
        return Promise.resolve(['yes', 'on', '1', 1, true, 'true'].includes(value))
      }
    },
    usage: 'accepted //the value must be "yes", "on", "1", or true',
  },

  /**
   * Rule: checks if a value is after a given date. Defaults to current time
   */
  after: {
    generator: function (compare?: string): (context: ValidateContext) => Promise<boolean> {
      return ({ value }) => {
        const timestamp = compare ? Date.parse(compare) : new Date()
        const fieldValue = Date.parse(value)
        return Promise.resolve(isNaN(fieldValue) ? false : fieldValue > timestamp)
      }
    },
    usage: ['after', 'after:2022-01-01 //时间在2022-01-01之后'],
  },

  /**
   * Rule: checks if the value is only alpha
   */
  alpha: {
    generator: function (set: 'default' | 'latin' = 'default'): (context: ValidateContext) => Promise<boolean> {
      const sets = {
        default: /^[a-zA-ZÀ-ÖØ-öø-ÿĄąĆćĘęŁłŃńŚśŹźŻż]+$/,
        latin: /^[a-zA-Z]+$/,
      }
      const selectedSet = Object.prototype.hasOwnProperty.call(sets, set) ? set : 'default'
      return ({ value }) => {
        return Promise.resolve(sets[selectedSet].test(value))
      }
    },
    usage: ['alpha', 'alpha:latin'],
  },

  /**
   * Rule: checks if the value is alpha numeric
   */
  alphanumeric: {
    generator: function (set: 'default' | 'latin' = 'default'): (context: ValidateContext) => Promise<boolean> {
      const sets = {
        default: /^[a-zA-Z0-9À-ÖØ-öø-ÿĄąĆćĘęŁłŃńŚśŹźŻż]+$/,
        latin: /^[a-zA-Z0-9]+$/,
      }
      const selectedSet = Object.prototype.hasOwnProperty.call(sets, set) ? set : 'default'
      return ({ value }) => {
        return Promise.resolve(sets[selectedSet].test(value))
      }
    },
    usage: ['alphanumeric', 'alphanumeric:latin'],
  },

  /**
   * Rule: checks if a value is after a given date. Defaults to current time
   */
  before: {
    generator: function (compare?: string): (context: ValidateContext) => Promise<boolean> {
      return ({ value }) => {
        const timestamp = compare ? Date.parse(compare) : new Date()
        const fieldValue = Date.parse(value)
        return Promise.resolve(isNaN(fieldValue) ? false : fieldValue < timestamp)
      }
    },
    usage: ['before', 'before:2022-01-01'],
  },

  /**
   * Rule: checks if the value is between two other values
   */
  between: {
    generator: function (from?: number, to?: number): (context: ValidateContext) => Promise<boolean> {
      const f = toNumber(from)
      const t = toNumber(to)
      return ({ value }) => {
        if (!isNum(value)) {
          return Promise.resolve(false)
        }
        const v = toNumber(value)
        return Promise.resolve(v > f && v < t)
      }
    },
    usage: ['between:1,10 // >1 && <10'],
  },

  /**
   * Confirm that the value of one field is the same as another, mostly used
   * for password confirmations.
   */
  confirm: {
    generator: function (field?: string): (context: ValidateContext) => Promise<boolean> {
      return ({ value, name, getValue }) => {
        const confirmFieldName = !isEmpty(field) ? field : trimEnd(name, '_confirm')
        const v = getValue(confirmFieldName)
        return Promise.resolve(eq(value, v))
      }
    },
    usage: ["confirm //如本字段去掉'_confirm'后缀的那个字段值一致", 'confirm:pwd //与pwd字段一致'],
  },

  /**
   * Rule: ensures the value is a date according to Date.parse(), or a format
   * regex.
   */
  date: {
    generator: function (format?: string): (context: ValidateContext) => Promise<boolean> {
      return ({ value }) => {
        if (isNil(format)) {
          return Promise.resolve(!isNaN(Date.parse(value)))
        } else {
          return Promise.resolve(dateFormatToRegExp(format).test(value))
        }
      }
    },
    usage: ['date', 'date:YYYY-MM-DD'],
  },

  /**
   * Rule: test the `value` is email
   */
  email: {
    generator: function (): (context: ValidateContext) => Promise<boolean> {
      return ({ value }) => {
        return Promise.resolve(isEmail(value))
      }
    },
    usage: 'email',
  },

  /**
   * Rule: Value ends with one of the given Strings
   */
  endsWith: {
    generator: function (...stack: string[]): (context: ValidateContext) => Promise<boolean> {
      return ({ value }) => {
        return Promise.resolve(isEndsWith(value, ...stack))
      }
    },
    usage: 'ends_with:abc,123 //以abc或者123结尾',
  },

  /**
   * Rule: Value is in an array (stack).
   */
  in: {
    generator: function (...stack: string[]): (context: ValidateContext) => Promise<boolean> {
      return ({ value }) => {
        return Promise.resolve(stack.findIndex(value) >= 0)
      }
    },
    usage: 'in:beijing,shanghai //是否是shanghai或者bejing',
  },

  /**
   * Rule: Match the value against a (stack) of patterns or strings
   */
  matches: {
    generator: function (...stack: (string | RegExp)[]): (context: ValidateContext) => Promise<boolean> {
      const patterns: (string | RegExp)[] = stack.map((pattern) => {
        if (isRegExp(pattern)) {
          return pattern
        } else if (pattern.startsWith('/') && pattern.endsWith('/')) {
          return new RegExp(pattern.substr(1, pattern.length - 2))
        } else {
          return pattern
        }
      })
      return ({ value }) => {
        const ret = !!patterns.find((pattern) => {
          if (pattern instanceof RegExp) {
            return pattern.test(value)
          } else {
            return value === pattern
          }
        })
        return Promise.resolve(ret)
      }
    },
    usage: ['matches:/\\d+/ //正则表达式判断是否是数字', 'matches:beijing,/\\d+/ //是否是beijing或者正则表达式数字'],
  },

  /**
   * Check the minimum value of a particular.
   */
  min: {
    generator: function (minimum?: number): (context: ValidateContext) => Promise<boolean> {
      const m = toNumber(minimum)
      return ({ value }) => {
        return Promise.resolve(isNum(value) && toNumber(value) >= m)
      }
    },
    usage: 'min:10 //>=10',
  },

  /**
   * Check the maximum value of a particular.
   */
  max: {
    generator: function (maximum?: number): (context: ValidateContext) => Promise<boolean> {
      const m = toNumber(maximum)
      return ({ value }) => {
        return Promise.resolve(isNum(value) && toNumber(value) <= m)
      }
    },
    usage: 'max:10 //<=10',
  },

  /**
   * Rule: Value is not in stack.
   */
  not: {
    generator: function (...stack: string[]): (context: ValidateContext) => Promise<boolean> {
      return ({ value }) => {
        return Promise.resolve(stack.findIndex(value) === -1)
      }
    },
    usage: 'not:beijing,shanghai //不是beijing或shanghai',
  },

  /**
   * Rule: checks if the value is only alpha numeric
   */
  number: {
    generator: function (): (context: ValidateContext) => Promise<boolean> {
      return ({ value }) => {
        return Promise.resolve(isNum(value))
      }
    },
    usage: 'number',
  },

  /**
   * Rule: must be a value - allows for an optional argument "whitespace" with a possible value 'trim' and default 'pre'.
   */
  required: {
    generator: function (trim?: 'trim'): (context: ValidateContext) => Promise<boolean> {
      const isTrim: boolean = trim === 'trim'
      return ({ value }) => {
        if (Array.isArray(value)) {
          return Promise.resolve(!!value.length)
        }
        if (typeof value === 'string') {
          return Promise.resolve(isTrim ? !!value.trim() : !!value)
        }
        if (typeof value === 'object') {
          return Promise.resolve(!value ? false : !!Object.keys(value).length)
        }
        return Promise.resolve(true)
      }
    },
    usage: ['required', 'required:trim //去除空格'],
  },

  /**
   * Rule: Value starts with one of the given Strings
   */
  startsWith: {
    generator: function (...stack: string[]): (context: ValidateContext) => Promise<boolean> {
      return ({ value }) => {
        return Promise.resolve(isStartsWith(value, ...stack))
      }
    },
    usage: 'starts_with:abc,123 //以abc或者123开头',
  },

  /**
   * Rule: checks if a string is a valid url
   */
  url: {
    generator: function (part?: 'https' | 'host'): (context: ValidateContext) => Promise<boolean> {
      const fn = isNil(part) ? isUrl : (part === 'host' && isHost) || isHttpsUrl
      return ({ value }) => {
        return Promise.resolve(fn(value))
      }
    },
    usage: ['url', 'url:https //判断是否是https', 'url:host //检查填入的是域名地址'],
  },

  /**
   * Rule: the value is optional
   */
  optional: {
    generator: function (): (context: ValidateContext) => Promise<boolean> {
      return ({ value }) => {
        if (isEmpty(value)) {
          return Promise.reject()
        } else {
          return Promise.resolve(true)
        }
      }
    },
    usage: 'optional|email //可以为空，如果不是空则必须是email',
    errorMsg: {
      _: '',
    },
  },

  len: {
    generator: function (min?: string | number, max?: string | number): (context: ValidateContext) => Promise<boolean> {
      if (isNil(min) && isNil(max)) {
        console.log('len usage:', this.usage.join('\n'))
        throw new Error('len param error')
      }
      const theMin = isNumber(min) ? min : toNumber(min) || 0
      let theMax = max
      if (isNil(max)) {
        theMax = theMin
      }

      return ({ value }) => {
        return Promise.resolve(isArrayLike(value) && value.length >= theMin && value.length <= theMax)
      }
    },
    usage: [
      'len:10 // 数组或字符串.length==10', //
      'len:4,10 // 数组或字符串.length >=4 && <=10', //
      'len:4, // 数组或字符串.length>=4', //
      'len:,10 // 数组或字符串.length<=10',
    ],
    errorMsg: {
      zh: ({ value }, min?: string | number, max?: string | number) => {
        if (Array.isArray(value)) {
          return min + '' + max
        }
      },
    },
  },

  /**
   * Rule: if is China Identity Card
   */
  idcard: {
    generator: function (): (context: ValidateContext) => Promise<boolean> {
      return ({ value }) => {
        return Promise.resolve(isIdCard(value))
      }
    },
    usage: 'idcard',
    errorMsg: {
      zh: '身份证号码格式错误',
    },
  },

  /**
   * Rule: if is China Mobile Number
   */
  mobile: {
    generator: function (): (context: ValidateContext) => Promise<boolean> {
      return ({ value }) => {
        return Promise.resolve(isPhone(value))
      }
    },
    usage: 'mobile',
    errorMsg: {
      zh: '手机号格式错误',
    },
  },

  /**
   * Rule: if is China Mobile or Tel Number
   */
  tel: {
    generator: function (): (context: ValidateContext) => Promise<boolean> {
      return ({ value }) => {
        return Promise.resolve(isTel(value) || isPhone(value))
      }
    },
    usage: 'tel',
    errorMsg: {
      zh: '{value} 不是一个正确手机或电话号',
    },
  },

  ip: {
    generator: function (version?: 'v4' | 'v6'): (context: ValidateContext) => Promise<boolean> {
      const fn = isNil(version) ? isIp : isIp[version]
      return ({ value }) => {
        return Promise.resolve(fn(value))
      }
    },
    usage: ['ip //ipV6或V4', 'ip:v6 //ipV6格式', 'ip:v4 //ipV4格式'],
    errorMsg: {
      zh: 'IP地址格式不正确',
    },
  },
}
