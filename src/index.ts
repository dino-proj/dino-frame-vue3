import { App } from 'vue'
import { ApiConfig, setupApi } from './api'
import { AuthApi, DinoLoginAuthInfo } from './auth'
import { setupDirectives } from './directives'
import { DinoFrame, Tenant, useDinoFrame } from './frame'
import { RouterConfig, setupRouter, useRouter } from './router'
import { setupStore } from './store'

/**
 * dinoFrame配置信息
 */
export interface DinoFrameConfig {
  title: string
  apiConfig: ApiConfig
  routerConfig: RouterConfig
  ready?: (dinoApp: DinoFrame) => void
  tenant?: Tenant
  authApi?: AuthApi<DinoLoginAuthInfo>
}
export const setupFrame = (app: App, config: DinoFrameConfig) => {
  const appFrame = useDinoFrame()

  // 设置指令
  setupDirectives(app)

  // 设置路由
  setupRouter(app, config.routerConfig)

  // 设置状态管理器
  setupStore(app) // 引入状态管理

  // 设置API
  setupApi(config.apiConfig)

  appFrame.title = config.title

  if (config.ready) {
    useRouter()
      .isReady()
      .then(() => {
        config.ready(appFrame)
      })
  }

  if (config.tenant) {
    appFrame.setTenant(config.tenant)
  }

  if (config.authApi) {
    appFrame.setAuthApi(config.authApi)
  }
}

export * from './api'
export * from './auth'
export * from './bus'
export * from './cache'
export * from './formatter'
export * from './frame'
export * from './message'
export * from './router'
export * from './store'
export * from './schema'
export * from './schema/actionSchema'
export * from './validator'
export * as utils from './utils'
export * as validator from './validator/validators'
export * from './types'
