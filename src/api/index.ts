import { extend, isFunction, join } from 'lodash-es'

import { useDinoFrame } from '../'

import axios, { AxiosError, AxiosInstance, ResponseType, AxiosRequestConfig, AxiosResponse } from 'axios'
import { stringify } from 'qs'
import { useMessage } from '../message'
import { asArray, toSnakeObject } from '../utils'

let request: AxiosInstance = null

/**
 * Api配置
 */
export interface ApiConfig {
  /**
   * api请求基础路径
   */
  baseUrl: string

  /**
   * 接口请求超时时间(毫秒)
   */
  requestTimeout: number

  /**
   * 接口成功返回状态码，例如 0
   */
  successCode: number | number[]

  /**
   * 需要重新登录的状态码
   */
  needLoginCode: number | number[]
}

const defaultApiConfig: ApiConfig = {
  baseUrl: '',
  requestTimeout: 10000,
  successCode: 0,
  needLoginCode: [630],
}

type ParamType = Record<string, any>

/**
 * Get请求的配置类型
 */
export interface GetConfig {
  url: string
  headers?: Record<string, string>
  params?: ParamType
  responseType?: ResponseType
  timeout?: number
  baseURL?: string
}

/**
 * Post 请求的配置类型
 */
export interface PostConfig extends GetConfig {
  data: Record<string, any>
  contentType?: string
}

/**
 * 上传请求
 */
export interface UploadConfig extends GetConfig {
  data: FormData
  method?: 'post' | 'put'
  onProgress?: (progress: ProgressEvent) => void
}

/**
 * Fetch请求
 */
interface FetchConfig extends Omit<PostConfig, 'data'> {
  method: 'get' | 'post' | 'delete' | 'put'
  data?: Record<string, any> | FormData
  onProgress?: (progress: ProgressEvent) => void
}

/**
 * 分页参数类型
 */
export interface Pageable {
  /**
   * 页码，第一页是’0‘
   */
  pn: number

  /**
   * 每页的长度
   */
  pl: number
}

/**
 * 排序参数类型
 */
export interface Sortable {
  /**
   * 排序，格式为: property(:asc|desc)。 默认按照asc升序， 支持多维度排序
   */
  sort?: string | string[]
}

/**
 * Api请求响应类型
 */
export interface Response<DataType> {
  code: number
  msg: string
  cost: number
  data: DataType
}

/**
 * 分页API请求响应类型
 */
export interface PageResponse<DataType> extends Response<DataType[]>, Pageable {
  /**
   * 总记录数
   */
  total: number

  /**
   * 总页数
   */
  totalPage: number
}

/**
 * fetch函数
 * @param param 请求配置信息
 * @returns Promise对象
 */
export const fetch = <Type>({ url, method, headers, params, data, contentType, responseType, timeout, onProgress, baseURL }: FetchConfig): Promise<Type> => {
  return request({
    baseURL,
    url,
    method: method || 'get',
    params: toSnakeObject(params),
    data: data,
    responseType: responseType,
    headers: {
      ...headers,
      'Content-Type': contentType || 'application/json',
    },
    timeout,
    onUploadProgress: onProgress,
    onDownloadProgress: onProgress,
  }) as any
}

/**
 * 上传函数
 * @param param 请求配置信息
 * @returns Promise对象
 */
export const upload = <Type>({ url, method, headers, params, data, responseType, onProgress, timeout }: UploadConfig): Promise<Response<Type>> => {
  return fetch<Response<Type>>({ url, method: method || 'post', headers, params, data, contentType: 'multipart/form-data', responseType, timeout: timeout | 300000, onProgress })
}

/**
 * Get函数
 * @param param0 请求配置信息
 * @returns
 */
export const get = <Type>({ url, headers, params, responseType }: GetConfig): Promise<Response<Type>> => {
  return fetch<Response<Type>>({ url, method: 'get', headers, params, responseType })
}

/**
 * 分页Get函数
 * @param param0 请求配置信息
 * @param page 分页信息
 * @returns
 */
export const getPage = <Type>({ url, headers, params, responseType }: GetConfig, page: Pageable): Promise<PageResponse<Type>> => {
  return fetch<PageResponse<Type>>({ url, method: 'get', headers, params: extend(params, page), responseType })
}

/**
 * Post函数
 * @param param 请求配置信息
 * @returns
 */
export const post = <Type>({ url, headers, params, data, contentType, responseType }: PostConfig): Promise<Response<Type>> => {
  return fetch<Response<Type>>({ url, method: 'post', headers, params, data: { body: toSnakeObject(data) }, contentType, responseType })
}

/**
 * 分页Post函数
 * @param param 请求配置信息
 * @param page 分页信息
 * @returns
 */
export const postPage = <Type>({ url, headers, params, data, contentType, responseType }: PostConfig, page: Pageable): Promise<PageResponse<Type>> => {
  return fetch<PageResponse<Type>>({ url, method: 'post', headers, params: extend(params, page), data: { body: toSnakeObject(data) }, contentType, responseType })
}

/**
 * 定义一个Upload函数
 * @param <R> 返回类型
 * @param <T> 请求参数的类型
 * @param config 请求的配置信息
 * @param defaultParam 请求的默认参数
 * @returns 一个请求函数
 */
export const defineUploadApi = <R = any, T = ParamType>(
  config: Omit<UploadConfig, 'params' | 'data'>,
  defaultParam?: Partial<T>,
): ((data: FormData, params?: T, onProgress?: UploadConfig['onProgress']) => Promise<Response<R>>) => {
  return (data: FormData, param?: T, onProgress?: UploadConfig['onProgress']): Promise<Response<R>> => {
    return upload<R>({ ...config, params: extend({}, defaultParam, param), data, onProgress: onProgress ?? config.onProgress })
  }
}

/**
 * 定义一个Get函数
 * @param <R> 返回类型
 * @param <D> Form数据的类型
 * @param <T> 请求参数的类型
 * @param config 请求的配置信息
 * @param defaultParam 请求的默认参数
 * @returns 一个请求函数
 */
export const defineGetApi = <R = any, T = ParamType>(config: Omit<GetConfig, 'params'>, defaultParam?: Partial<T>): ((params?: T) => Promise<Response<R>>) => {
  return (param?: T): Promise<Response<R>> => {
    return get<R>({ ...config, params: extend({}, defaultParam, param) })
  }
}

/**
 * 定义一个分页Get函数
 * @param <R> 返回类型
 * @param <T> 请求参数的类型
 * @param config 请求的配置信息
 * @param defaultParam 请求的默认参数
 * @returns 一个分页请求函数
 */
export const defineGetPageApi = <R = any, T = ParamType>(config: Omit<GetConfig, 'params'>, defaultParam?: Partial<T>): ((params: T, page: Pageable) => Promise<PageResponse<R>>) => {
  return (params: T, page: Pageable): Promise<PageResponse<R>> => {
    return getPage<R>({ ...config, params: extend({}, defaultParam, params) }, page)
  }
}

/**
 * 定义一个Post函数
 * @param <R> 返回类型
 * @param <D> Post数据的类型
 * @param <T> 请求参数的类型
 * @param config 请求的配置信息
 * @param defaultParam 请求的默认参数
 * @returns 一个请求函数
 */
export const definePostApi = <R = any, D = ParamType, T = ParamType>(config: Omit<PostConfig, 'params' | 'data'>, defaultParam?: Partial<T>): ((data: D, params?: T) => Promise<Response<R>>) => {
  return (data: D, param?: T): Promise<Response<R>> => {
    return post<R>({ ...config, params: extend({}, defaultParam, param), data })
  }
}

/**
 * 定义一个分页Post函数
 * @param <R> 返回类型
 * @param <D> Post数据的类型
 * @param <T> 请求参数的类型
 * @param config 请求的配置信息
 * @param defaultParam 请求的默认参数
 * @returns 一个分页请求函数
 */
export const definePostPageApi = <R, D = ParamType, T = ParamType>(
  config: Omit<PostConfig, 'params' | 'data'>,
  defaultParam?: Partial<T>,
): ((data: D, page: Pageable, params?: T) => Promise<PageResponse<R>>) => {
  return (data: D, page: Pageable, param?: T): Promise<PageResponse<R>> => {
    return postPage<R>({ ...config, params: extend({}, defaultParam, param), data }, page)
  }
}

/**
 * 增删改查API类型
 */
export interface CrudAPI<Type = any> {
  /**
   * 获取单个类型
   */
  getOne: (id: string | number) => Promise<Response<Type>>

  /**
   * 获取一页数据
   */
  listPage: (data: ParamType, page: Pageable) => Promise<PageResponse<Type>>

  /**
   * 添加一个Entity
   */
  addOne: (data: ParamType) => Promise<Response<Type>>

  /**
   * 删除一个或多个Entity
   */
  delete: (ids: string[] | string) => Promise<Response<boolean>>

  /**
   * 改变Entity的状态
   */
  changeStatus: (ids: string[] | string, status: string) => Promise<Response<boolean>>

  /**
   * 更新一个对象
   */
  updateOne: (id: string, data: ParamType) => Promise<Response<Type>>
}

/**
 * 增删改查API配置类型
 */
export interface CrudApiConfig<Type> {
  basePath: string
  list?: string | CrudAPI<Type>['listPage']
  get?: string | CrudAPI<Type>['getOne']
  add?: string | CrudAPI<Type>['addOne']
  delete?: string | CrudAPI<Type>['delete']
  status?: string | CrudAPI<Type>['changeStatus']
  update?: string | CrudAPI<Type>['updateOne']
}

/**
 * 定义一个增删改查API
 * @param config 配置信息
 * @param defaultParam API默认参数
 * @returns
 */
export const defineCrudApi = <T>(config: CrudApiConfig<T>, defaultParam?: ParamType): CrudAPI<T> => {
  const getFn = isFunction(config.get)
    ? config.get
    : (id: string | number): Promise<Response<T>> => {
      return get<T>({ url: `${config.basePath || ''}/${config.get || 'id'}`, params: extend({}, defaultParam, { id }) })
    }

  const listFn = isFunction(config.list)
    ? config.list
    : (data: ParamType, page: Pageable): Promise<PageResponse<T>> => {
      return postPage<T>({ url: `${config.basePath || ''}/${config.list || 'list'}`, params: extend({}, defaultParam), data }, page)
    }

  const addFn = isFunction(config.add)
    ? config.add
    : (data: ParamType): Promise<Response<T>> => {
      return post<T>({ url: `${config.basePath || ''}/${config.add || 'add'}`, params: extend({}, defaultParam), data })
    }

  const updateFn = isFunction(config.update)
    ? config.update
    : (id: string, data: ParamType): Promise<Response<T>> => {
      return post<T>({ url: `${config.basePath || ''}/${config.update || 'update'}`, params: extend({}, defaultParam, { id }), data })
    }

  const statusFn = isFunction(config.status)
    ? config.status
    : (ids: string[] | string, status: string): Promise<Response<boolean>> => {
      return get<boolean>({ url: `${config.basePath || ''}/${config.status || 'status'}`, params: extend({}, defaultParam, { ids: join(ids, ','), status: status }) })
    }

  const delsFn = isFunction(config.delete)
    ? config.delete
    : (ids: string[] | string): Promise<Response<boolean>> => {
      return get<boolean>({ url: `${config.basePath || ''}/${config.delete || 'delete'}`, params: extend({}, defaultParam, { ids: join(ids, ',') }) })
    }

  return {
    getOne: getFn,
    listPage: listFn,
    addOne: addFn,
    updateOne: updateFn,
    delete: delsFn,
    changeStatus: statusFn,
  }
}

export interface TreeApi<Type = any> {
  getTree: (parentId: string | number) => Promise<Response<Type>>
  getPickerTree: (parentId: string | number) => Promise<Response<Type>>
  getSearch: (data: object, page: Pageable) => Promise<PageResponse<Type>>
  getOptions?: (data: ParamType, page: Pageable) => Promise<PageResponse<Type>>
}

/**
 * 配置API
 * @param config api配置
 */
export const setupApi = (config?: Partial<ApiConfig>) => {
  if (config) {
    extend(defaultApiConfig, config)
  }

  request = useAxios(defaultApiConfig)
}

/**
 * 使用API
 */
export const useApi = (): typeof request => {
  if (!request) {
    throw new Error('Please call `setupApi()` before useApi')
  }
  return request
}

/**
 * 创建一个新的Axios请求对象
 * @param config 配置信息
 * @returns
 */
const useAxios = (config: ApiConfig) => {
  // 创建axios实例
  const service: AxiosInstance = axios.create({
    baseURL: config.baseUrl, // api 的 base_url
    timeout: config.requestTimeout, // 请求超时时间
  })

  const successCode: number[] = asArray(config.successCode)
  const needLoginCode: number[] = asArray(config.needLoginCode)

  // request拦截器
  service.interceptors.request.use(
    (conf: AxiosRequestConfig) => {
      if (conf.method === 'post' && conf.headers['Content-Type'] === 'application/x-www-form-urlencoded') {
        conf.data = stringify(conf.data)
      }

      if (useDinoFrame().tenant()) {
        conf.url = conf.url.replace('{tenant}', useDinoFrame().tenant().id)
      }

      const authToken = useDinoFrame().authToken()
      if (authToken) {
        conf.headers[authToken.authHeaderName] = authToken.authPayload
      }
      return conf
    },
    (error: AxiosError) => {
      // Do something with request error
      console.log(error) // for debug
      Promise.reject(error)
    },
  )

  // response 拦截器
  service.interceptors.response.use(
    (response: AxiosResponse) => {
      const data = response.data as Response<any>

      if (successCode.indexOf(data.code) >= 0) {
        return response.data
      } else if (needLoginCode.indexOf(data.code) >= 0) {
        return useDinoFrame()
          .autoLogin()
          .then(() => {
            return service(response.config)
          })
          .catch(() => {
            useMessage().error('登录已过期，请重新登录')
            useDinoFrame().gotoLogin()
          })
      } else {
        useMessage().error(data.msg)
        return Promise.reject(data)
      }
    },
    (error: AxiosError) => {
      console.log(error.code, 'err:' + error) // for debug

      useMessage().error('网络错误，请检查网络连接是否正常！')
      return Promise.reject(error)
    },
  )

  return service
}
