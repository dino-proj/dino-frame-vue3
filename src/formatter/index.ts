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

import dayjs from 'dayjs'
import { isFunction, isNull, isUndefined, isNumber } from 'lodash-es'

export interface FormatConfig extends Record<string, any> {
  name: string
  type: string
  ifempty?: string
}

export interface FormatContext {
  config: FormatConfig
  index: number
  value: any
  getValue: (name: string) => any
}

export type FormatFunction = (context: FormatContext) => any

export type FormatFunctionBuilder = <T extends FormatConfig>(config?: T) => FormatFunction

export const useFormatter = (type: string, ifempty?: any, fmt?: Function): ((val: any) => any) => {
  if (type === 'date') {
    return (val) => {
      if (isNumber(val)) {
        return dayjs(val).format('YYYY-MM-DD')
      } else {
        return (isNull(val) || isUndefined(val)) && ifempty ? ifempty : val
      }
    }
  } else if (type === 'datetime') {
    return (val) => {
      if (isNumber(val)) {
        return dayjs(val).format('YYYY-MM-DD HH:mm:ss')
      } else {
        return (isNull(val) || isUndefined(val)) && ifempty ? ifempty : val
      }
    }
  } else {
    return (val: any) => {
      if (ifempty && (isNull(val) || isUndefined(val))) {
        return ifempty
      } else if (isFunction(fmt)) {
        return fmt(val)
      } else {
        return val
      }
    }
  }
}

export const unitFormat = (size: number): string => {
  //格式化文件大小
  if (size == null) {
    return '0B'
  }
  const unitArr = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const index = Math.floor(Math.log(size) / Math.log(1024))
  const calSize = size / Math.pow(1024, index)
  return trimRight(calSize.toFixed(2), '.00') + unitArr[index]
}

function trimRight(src: string, postfix: string) {
  if (src.endsWith(postfix)) {
    return src.substr(0, src.length - postfix.length)
  } else {
    return src
  }
}

export const formatters: Record<string, FormatFunctionBuilder> = {
  date: ({ ifempty }): FormatFunction => {
    return ({ value }) => {
      if (isNumber(value)) {
        return dayjs(value).format('YYYY-MM-DD')
      } else {
        return value ?? ifempty
      }
    }
  },
  datetime: ({ ifempty }): FormatFunction => {
    return ({ value }) => {
      if (isNumber(value)) {
        return dayjs(value).format('YYYY-MM-DD HH:mm:ss')
      } else {
        return value ?? ifempty
      }
    }
  },
}
