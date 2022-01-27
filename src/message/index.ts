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

import { isNil } from 'lodash-es'
import { inject } from 'vue'

export declare type MessageFun = (msg: string, options?: any) => void

/**
 * 消息提示接口
 */
export interface Message {
  success: MessageFun
  info: MessageFun
  warning: MessageFun
  error: MessageFun
}

/**
 * 消息类型
 */
export type MessageType = `${string & keyof Message}`

let msg: Message

/**
 * 使用消息函数，用来显示提示消息
 * @param msgType 消息类型
 * @returns
 */
export function useMessage(): Message
export function useMessage(msgType: MessageType): MessageFun
export function useMessage(msgType?: MessageType): MessageFun | Message {
  const msgObj = inject('', msg)
  if (isNil(msgObj)) {
    throw new Error('Please use `setupMessage()` or `provide("")` first before call `useMessage()`')
  }
  if (!isNil(msgType)) {
    return msgObj[msgType]
  }
  return msgObj
}

/**
 * 设置消息处理对象
 * @param _msg
 */
export const setupMessage = (_msg: Message): void => {
  msg = _msg
}
