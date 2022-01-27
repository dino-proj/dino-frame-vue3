import { createPinia } from 'pinia'
import { App } from 'vue'
import { appStoreDefinition } from './modules/appStore'
import { pageStoreDefinition } from './modules/pageStore'

const pinia = createPinia()

export const setupStore = (app: App) => {
  app.use(pinia)
}

export const useAppStore = (): ReturnType<typeof appStoreDefinition> => {
  return appStoreDefinition(pinia)
}

export const usePageStore = (): ReturnType<typeof pageStoreDefinition> => {
  return pageStoreDefinition(pinia)
}
