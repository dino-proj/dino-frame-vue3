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
 * 自定义拖动指令
 * @description  使用方式：v-drag="[dragDom,dragHeader]"，如 `<div v-drag="['.drag-container .el-dialog', '.drag-container .el-dialog__header']"></div>`
 * @description dragDom 要拖动的元素，dragHeader 要拖动的 Header 位置
 * @link 注意：https://github.com/element-plus/element-plus/issues/522
 * @lick 参考：https://blog.csdn.net/weixin_46391323/article/details/105228020?utm_medium=distribute.pc_relevant.none-task-blog-baidujs_title-10&spm=1001.2101.3001.4242
 */
export const dragDirective: Directive = {
  mounted(el, binding) {
    if (!binding.value) return false

    const dragDom = document.querySelector(binding.value[0]) as HTMLElement
    const dragHeader = document.querySelector(binding.value[1]) as HTMLElement

    dragHeader.onmouseover = () => (dragHeader.style.cursor = `move`)

    function down(e: any, type: string) {
      // 鼠标按下，计算当前元素距离可视区的距离
      const disX = type === 'pc' ? e.clientX - dragHeader.offsetLeft : e.touches[0].clientX - dragHeader.offsetLeft
      const disY = type === 'pc' ? e.clientY - dragHeader.offsetTop : e.touches[0].clientY - dragHeader.offsetTop

      // body当前宽度
      const screenWidth = document.body.clientWidth
      // 可见区域高度(应为body高度，可某些环境下无法获取)
      const screenHeight = document.documentElement.clientHeight

      // 对话框宽度
      const dragDomWidth = dragDom.offsetWidth
      // 对话框高度
      const dragDomheight = dragDom.offsetHeight

      const minDragDomLeft = dragDom.offsetLeft
      const maxDragDomLeft = screenWidth - dragDom.offsetLeft - dragDomWidth

      const minDragDomTop = dragDom.offsetTop
      const maxDragDomTop = screenHeight - dragDom.offsetTop - dragDomheight

      // 获取到的值带px 正则匹配替换
      let styL: any = getComputedStyle(dragDom).left
      let styT: any = getComputedStyle(dragDom).top

      // 注意在ie中 第一次获取到的值为组件自带50% 移动之后赋值为px
      if (styL.includes('%')) {
        styL = +document.body.clientWidth * (+styL.replace(/\%/g, '') / 100)
        styT = +document.body.clientHeight * (+styT.replace(/\%/g, '') / 100)
      } else {
        styL = +styL.replace(/\px/g, '')
        styT = +styT.replace(/\px/g, '')
      }

      return {
        disX,
        disY,
        minDragDomLeft,
        maxDragDomLeft,
        minDragDomTop,
        maxDragDomTop,
        styL,
        styT,
      }
    }

    function move(e: any, type: string, obj: any) {
      const { disX, disY, minDragDomLeft, maxDragDomLeft, minDragDomTop, maxDragDomTop, styL, styT } = obj

      // 通过事件委托，计算移动的距离
      let left = type === 'pc' ? e.clientX - disX : e.touches[0].clientX - disX
      let top = type === 'pc' ? e.clientY - disY : e.touches[0].clientY - disY

      // 边界处理
      if (-left > minDragDomLeft) {
        left = -minDragDomLeft
      } else if (left > maxDragDomLeft) {
        left = maxDragDomLeft
      }

      if (-top > minDragDomTop) {
        top = -minDragDomTop
      } else if (top > maxDragDomTop) {
        top = maxDragDomTop
      }

      // 移动当前元素
      dragDom.style.cssText += `;left:${left + styL}px;top:${top + styT}px;`
    }

    /**
     * pc端
     * onmousedown 鼠标按下触发事件
     * onmousemove 鼠标按下时持续触发事件
     * onmouseup 鼠标抬起触发事件
     */
    dragHeader.onmousedown = (e) => {
      const obj = down(e, 'pc')
      document.onmousemove = (e) => {
        move(e, 'pc', obj)
      }
      document.onmouseup = () => {
        document.onmousemove = null
        document.onmouseup = null
      }
    }

    /**
     * 移动端
     * ontouchstart 当按下手指时，触发ontouchstart
     * ontouchmove 当移动手指时，触发ontouchmove
     * ontouchend 当移走手指时，触发ontouchend
     */
    dragHeader.ontouchstart = (e) => {
      const obj = down(e, 'app')
      document.ontouchmove = (e) => {
        move(e, 'app', obj)
      }
      document.ontouchend = () => {
        document.ontouchmove = null
        document.ontouchend = null
      }
    }
  },
}
