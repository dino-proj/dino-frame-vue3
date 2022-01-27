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

import is_Ip from 'is-ip'
import { escapeRegExp, isEmpty, isNumber } from 'lodash'

// 验证网址
export function isUrl(path: string): boolean {
  return /(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)*([\w\-\.,@?^=%&amp;:/~\+#]*[\w\-\@?^=%&amp;/~\+#])?/.test(path)
}

// 验证是否是https网址
export function isHttpsUrl(path: string): boolean {
  return /https:\/\/[\w\-_]+(\.[\w\-_]+)*([\w\-\.,@?^=%&amp;:/~\+#]*[\w\-\@?^=%&amp;/~\+#])?/.test(path)
}

// 验证是否是host，ip或者域名
export function isHost(path: string) {
  return /[\w\-_]+(\.[\w\-_]+)*(\:\d+)?/.test(path)
}

// 验证是否是Ip
export const isIp = is_Ip

// 验证邮箱
export function isEmail(path: string): boolean {
  return /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/.test(path)
}

// 验证手机
export function isPhone(tel: string): boolean {
  return /^[1][3-9]\d{9}$/.test(tel)
}

// 验证身份证号
export function isIdCard(id: any): boolean {
  return /^[1-9]\d{5}(18|19|20|(3\d))\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/.test(id)
}

// 验证固定电话
export function isTel(tel: any): boolean {
  return /^((0\d{2,3})-)(\d{7,8})(-(\d{3,}))?$/.test(tel)
}

// 验证数字
export function isNum(num: any): boolean {
  return isNumber(num) || /^\d*$/.test(num)
}

// 判读字符串是否以某些为结尾
export function isEndsWith(value: string, ...ends: string[]): boolean {
  if (!ends.length) {
    return true
  }
  if (isEmpty(value)) {
    return false
  }
  for (const end of ends) {
    if (value.endsWith(end)) {
      return true
    }
  }
  return false
}

// 判读字符串是否以某些为开始
export function isStartsWith(value: string, ...starts: string[]): boolean {
  if (!starts.length) {
    return true
  }
  if (isEmpty(value)) {
    return false
  }
  for (const end of starts) {
    if (value.startsWith(end)) {
      return true
    }
  }
  return false
}

// 将日期格式转换成正则表达式
export function dateFormatToRegExp(format: string) {
  const escaped = `^${escapeRegExp(format)}$`
  const formats = {
    MM: '(0[1-9]|1[012])',
    M: '([1-9]|1[012])',
    DD: '([012][0-9]|3[01])',
    D: '([012]?[0-9]|3[01])',
    YYYY: '\\d{4}',
    YY: '\\d{2}',
  }
  return new RegExp(
    Object.keys(formats).reduce((regex, fmt) => {
      return regex.replace(fmt, formats[fmt])
    }, escaped),
  )
}
