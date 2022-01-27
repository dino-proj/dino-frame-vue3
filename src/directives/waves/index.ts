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

import { Directive } from 'vue'

/**
 * 按钮波浪指令
 * @directive 默认方式：v-waves，如 `<div v-waves></div>`
 * @directive 参数方式：v-waves=" |light|red|orange|purple|green|teal"，如 `<div v-waves="'light'"></div>`
 */
export const wavesDirective: Directive = {
  mounted(el, binding) {
    el.classList.add('waves-effect')
    binding.value && el.classList.add(`waves-${binding.value}`)
    function setConvertStyle(obj: { [key: string]: unknown }) {
      let style = ''
      for (const i in obj) {
        if (Object.hasOwnProperty.call(obj, i)) style += `${i}:${obj[i]};`
      }
      return style
    }
    function onCurrentClick(e: { [key: string]: unknown }) {
      const elDiv = document.createElement('div')
      elDiv.classList.add('waves-ripple')
      el.appendChild(elDiv)
      const styles = {
        left: `${e.layerX}px`,
        top: `${e.layerY}px`,
        opacity: 1,
        transform: `scale(${(el.clientWidth / 100) * 10})`,
        'transition-duration': `750ms`,
        'transition-timing-function': `cubic-bezier(0.250, 0.460, 0.450, 0.940)`,
      }
      elDiv.setAttribute('style', setConvertStyle(styles))
      setTimeout(() => {
        elDiv.setAttribute(
          'style',
          setConvertStyle({
            opacity: 0,
            transform: styles.transform,
            left: styles.left,
            top: styles.top,
          }),
        )
        setTimeout(() => {
          elDiv && el.removeChild(elDiv)
        }, 750)
      }, 450)
    }
    el.addEventListener('mousedown', onCurrentClick, false)
  },

  unmounted(el) {
    el.addEventListener('mousedown', () => {})
  },
}
