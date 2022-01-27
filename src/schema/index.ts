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

import { isArray, isNumber, isObject } from 'lodash'
import { Component, ref, Ref } from 'vue'
import { CrudAPI } from '../api'
import { useFormatter } from '../formatter'
import { NamedType, TypeNameExtract } from '../types'

export interface Option {
  value: string | string[] | number | number[] | any | any[]
  label?: string
  icon?: Component
  children?: OptionsProvider
  tagType?: string
}

export type OptionsProvider = Option[] | ((kw?: string | number | any) => Promise<Option[]>)

export interface FieldTypeBase<Type extends string, Bindings> extends NamedType<Type> {
  bindings: Bindings
}

export type FieldTypeNameExtend<FT> = TypeNameExtract<FT> | TypeNameExtract<TypeImage>

export interface TypeFile
  extends FieldTypeBase<
    'file',
    {
      fileSize: number
      service: string
      postfixes?: string | string[]
    }
  > {
  type: 'file'
  fileSize: number
  service: string
  postfixes?: string | string[]
}
export const isTypeFile = (t: any): t is TypeFile => {
  return isObject(t) && (t as any).type === 'file'
}
export interface TypeImage
  extends FieldTypeBase<
    'image',
    {
      fileSize: number
      service: string
      isCover?: boolean
      width?: number
      height?: number
      postfixes?: string | string[]
    }
  > {
  type: 'image'
  fileSize: number
  service: string
  isCover?: boolean
  width?: number
  height?: number
  postfixes?: string | string[]
}

export const isTypeImage = (t: any): t is TypeImage => {
  return isObject(t) && (t as any).type === 'image'
}
export type TypeVideo = {
  type: 'video'
  fileSize: number
  service: string
  postfixes?: string | string[]
}
export const isTypeVideo = (t: any): t is TypeVideo => {
  return isObject(t) && (t as any).type === 'video'
}
export type TypeMultiple = {
  type: 'multiple'
  fileSize: number
  service: string
  toUpload: [TypeFile?, TypeImage?, TypeVideo?]
  postfixes?: string | string[]
}

export const isTypeMultiple = (t: any): t is TypeMultiple => {
  return isObject(t) && (t as any).type === 'multiple'
}

export type FieldType =
  | 'index'
  | 'input'
  | 'text'
  | 'number'
  | 'switch'
  | 'select'
  | 'multi-select'
  | 'radio'
  | 'radio-button'
  | 'time'
  | 'date'
  | 'datetime'
  | 'select-input'
  | 'color'
  | 'rate'
  | 'tree'
  | TypeFile
  | TypeImage
  | TypeVideo
  | TypeMultiple
  | 'slide'
  | 'slot'
  | 'upload'
  | 'editor'
  | 'title'
  | 'radio-group'
  | 'custom'
  | 'cascader'
  | 'operation'

export interface ComponentBindings {
  [key: string]: any
}

interface CommonConfig {
  field?: string
  label?: string
  hint?: string
  formatter?: (val: any) => any
  options?: OptionsProvider
  bindings?: ComponentBindings
}
export interface EditConfig extends CommonConfig {
  span?: number
  config?: object
  editable?: boolean
  placeholder?: string
  rule?: object[] | object
}
export interface SearchConfig extends CommonConfig {
  span?: number
  config?: object
  clearable?: boolean
  defaultValue?: string | string[] | number | number[]
  editable?: boolean
  placeholder?: string
  border?: boolean //多选框边框
}
export interface TableConfig extends CommonConfig {
  width?: number | string
  minWidth?: number | string
  actions?: any
  asTag?: boolean
  ifempty?: any
}
export interface ViewConfig extends CommonConfig {
  span?: number
  asTag?: boolean
  ifempty?: any
}

interface CommonSchema {
  field: string //字段名(接口字段)
  label: string //对应名称
  tips?: string // 提示语
  type?: FieldType //表单类型
  actions?: any
}

export interface FieldSchema extends CommonSchema {
  config?: {
    hint?: string
    ifempty?: any
    span?: number
    width?: number | string
    minWidth?: number | string
    actions?: any
    options?: OptionsProvider
    asTag?: boolean
    formatter?: (val: any) => any
  }
  edit?: EditConfig | false | 'uneditable'
  view?: ViewConfig | false
  table?: TableConfig | false
}

export interface GroupSchema<SchemaType> {
  title: string
  fields: SchemaType[]
}

export type TableSchema = CommonSchema & TableConfig

export type ViewSchema = CommonSchema & ViewConfig

export type EditSchema = CommonSchema & EditConfig

export type SearchSchema = CommonSchema & SearchConfig

export interface CrudSchema {
  toTable: () => TableSchema[]
  toView: () => GroupSchema<ViewSchema>[] | ViewSchema[]
  toEdit: (action?: string) => GroupSchema<EditSchema>[] | EditSchema[]
  toDel: (action?: string) => CrudAPI<any> | null
}

export function defineCrudSchema(fields: FieldSchema[] | GroupSchema<FieldSchema>[], editConfig?: FieldSchema[] | GroupSchema<FieldSchema>[] | any): CrudSchema {
  const fs2table = (fs: FieldSchema[]): TableSchema[] => {
    const arr: TableSchema[] = []
    fs.forEach((f) => {
      if (f.table === false) {
        return
      }
      const { type } = f
      const { ifempty } = f.config || {}

      let { field, label, actions } = f
      let { width, hint, options, formatter, asTag, minWidth } = f.config || {}
      if (f.table) {
        field = f.table.field ?? field
        label = f.table.label ?? label
        hint = f.table.hint ?? hint
        options = f.table.options ?? options
        asTag = f.table.asTag ?? asTag
        width = f.table.width ?? width
        minWidth = f.table.minWidth ?? minWidth
        formatter = f.table.formatter ?? formatter
        actions = f.table.actions ?? actions
      }
      width = isNumber(width) ? width + 'px' : width
      minWidth = isNumber(minWidth) ? minWidth + 'px' : minWidth

      formatter = useFormatter(type as string, ifempty, formatter)
      const bindings = f.table && f.table.bindings

      arr.push({ field, label, type, hint, ifempty, options, asTag, width, minWidth, formatter, bindings, actions })
    })
    return arr
  }

  const fs2view = (fs: FieldSchema[]): ViewSchema[] => {
    const arr: ViewSchema[] = []
    fs.forEach((f) => {
      if (f.view === false) {
        return
      }
      const { type } = f
      const { ifempty } = f.config || {}

      let { field, label } = f
      let { span, hint, options, formatter, asTag } = f.config || {}
      if (f.view) {
        field = f.view.field ?? field
        label = f.view.label ?? label
        hint = f.view.hint ?? hint
        options = f.view.options ?? options
        asTag = f.view.asTag ?? asTag
        span = f.view.span ?? span
        formatter = f.view.formatter ?? formatter
      }

      formatter = useFormatter(type as string, ifempty, formatter)
      const bindings = f.view && f.view.bindings

      arr.push({ field, label, type, hint, ifempty, options, asTag, span, formatter, bindings })
    })
    return arr
  }

  const fs2edit = (fs: FieldSchema[]): EditSchema[] => {
    const arr: EditSchema[] = []
    fs.forEach((f) => {
      if (f.edit === false) {
        return
      }
      const { type, tips } = f
      let { field, label, config } = f
      let { span, hint, options } = f.config || {}

      if (f.edit && f.edit !== 'uneditable') {
        field = f.edit.field ?? field
        label = f.edit.label ?? label
        hint = f.edit.hint ?? hint
        options = f.edit.options ?? options
        span = f.edit.span ?? span
        config = f.edit.config ?? config
      }

      const bindings = f.edit && f.edit !== 'uneditable' && f.edit.bindings
      const placeholder = f.edit && f.edit !== 'uneditable' && f.edit.placeholder
      const rule = f.edit && f.edit !== 'uneditable' && f.edit.rule

      const editable = f.edit === 'uneditable' ? false : (f.edit && f.edit.editable) ?? true

      arr.push({
        field,
        config,
        label,
        type,
        tips,
        hint,
        span,
        options,
        editable,
        placeholder,
        rule,
        bindings,
      })
    })
    return arr
  }

  const fg2cb = <Type>(fs: GroupSchema<FieldSchema>[], cb: (fs: FieldSchema[]) => Type[]): GroupSchema<Type>[] => {
    const arr: GroupSchema<Type>[] = []

    fs.forEach((field) => {
      arr.push({
        title: field.title,
        fields: cb(field.fields),
      })
    })

    return arr
  }

  const fg2plain = <Type>(fs: GroupSchema<FieldSchema>[], cb: (fs: FieldSchema[]) => Type[]): Type[] => {
    const arr: Type[] = []
    fs.forEach((f) => {
      arr.push(...cb(f.fields))
    })
    return arr
  }

  return {
    toTable() {
      if ('fields' in fields[0]) {
        return fg2plain(this.fields as GroupSchema<FieldSchema>[], fs2table)
      } else {
        return fs2table(fields as FieldSchema[])
      }
    },
    toView() {
      if ('fields' in fields[0]) {
        return fg2cb(fields as GroupSchema<FieldSchema>[], fs2view)
      } else {
        return fs2view(fields as FieldSchema[])
      }
    },
    toDel(actions?: string) {
      if (actions && editConfig && editConfig[actions] && editConfig[actions].api) {
        return editConfig[actions].api
      }
      return null
    },
    toEdit(actions?: string) {
      if (editConfig) {
        let result = actions ? editConfig[actions] || editConfig : editConfig
        let ar = []
        if (isArray(result)) {
          ar = result
        } else {
          ar = result.edit || []
        }
        if (ar[0].title) {
          // 是分步操作的那种
          ar = ar.map((v) => {
            v.fields = v.fields
              ? v.fields?.map((x) => {
                if (x.editable !== false) {
                  x['editable'] = true
                }
                return x
              })
              : []

            return v
          })
        } else {
          // 不是分步的
          ar = ar.map((v) => {
            if (v.editable !== false) {
              v['editable'] = true
            }
            return v
          })
        }
        if (isArray(result)) {
          result = ar
        } else {
          result['edit'] = ar
        }
        return result
      }
      if ('fields' in fields[0]) {
        return fg2cb(fields as GroupSchema<FieldSchema>[], fs2edit)
      } else {
        return fs2edit(fields as FieldSchema[])
      }
    },
  }
}

export const defineOptionProvider = (valueProp: string, labelProp: string, kwProp: string, api: CrudAPI<any>, params?: { [key: string]: any }): ((kw?: string) => Promise<Option[]>) => {
  return (kw?: string): Promise<Option[]> => {
    return new Promise<Option[]>((resolve, reject) => {
      const listParams = params ? { ...params } : {}
      listParams[kwProp] = kw
      api
        .listPage(listParams, { pn: 0, pl: 100 })
        .then((ret) => {
          const arr: Option[] = []

          if (ret.data) {
            for (const d of ret.data) {
              arr.push({ value: d[valueProp], label: d[labelProp] })
            }
          }
          resolve(arr)
        })
        .catch((reson) => {
          reject(reson)
        })
    })
  }
}

export const promiseRef = <T>(cb: (...args: any) => Promise<T>, ...args: any): Ref<T> => {
  const v = ref<T>()
  cb(args).then((ret) => (v.value = ret))
  return v
}
