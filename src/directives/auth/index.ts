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

import { useAppStore } from '../../store'
import { asArray } from '../../utils'
import { Directive } from 'vue'

/**
 * 用户权限指令
 * @directive 单个权限验证（v-auth="xxx"）
 * @directive 多个权限验证，满足一个则显示（v-auth="[xxx,xxx]"）
 * @directive 多个权限验证，全部满足则显示（v-auth-all="[xxx,xxx]"）
 */
export const authDirective: Directive = {
  mounted(el, binding) {
    const requiredRoles: string[] = asArray(binding.value)
    const permList = useAppStore().permissions
    if (!permList.some((v: string) => requiredRoles.indexOf(v) >= 0)) {
      el.parentNode.removeChild(el)
    }
  },
}
