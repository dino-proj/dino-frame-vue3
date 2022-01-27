import { App } from 'vue'
import { createRouter, createWebHashHistory, RouteComponent, RouteMeta, RouteRecordRaw, RouteRecordRedirectOption } from 'vue-router'
import NProgress from 'nprogress' // progress bar
import 'nprogress/css/nprogress.css' // progress bar style
import { useAppStore, usePageStore } from '../store'
import { useDinoFrame } from '../'
import { awaitGet } from '../utils'
import { isArray } from 'lodash-es'

const router = createRouter({
  history: createWebHashHistory(),
  strict: true,
  routes: [],
})

export interface Oper {
  resource: string | symbol
  op: string | string[] | symbol | symbol[]
}
export interface Permition {
  userType: string | string[] | symbol | symbol[]
  opers: Oper | Oper[]
}

export declare type RouteComponentRaw = RouteComponent | (() => Promise<RouteComponent>)
export declare type RouteRedirect = RouteRecordRedirectOption

/**
 * 页面Meta信息
 */
export interface PageMeta {
  title: string
  icon?: string
  hidden?: boolean
  affix?: boolean
}

/**
 * 单页面信息
 */
export interface Page {
  name: string | 'Login' | 'Home'
  path: string
  redirect?: RouteRedirect
  permition: 'anon' | Permition | Permition[]
  component: RouteComponentRaw
  children?: Page[]
  meta?: PageMeta & Record<string | number | symbol, any>
}

export declare type PageProvider<T = Page[]> = () => Promise<T>

/**
 * 框架页面路由信息
 */
export interface RouterConfig {
  home: Omit<Page, 'name'> | PageProvider<Omit<Page, 'name' | 'permition'>>
  login?: Omit<Page, 'name' | 'permition'>
  notFound: RouteComponentRaw
  primaryPages: Page[] | PageProvider<Page[]>
  secondaryPages?: Page[] | PageProvider<Page[]>
}

export const setupRouter = (app: App, config: RouterConfig) => {
  handlePages(config)
  app.use(router)
}

export const useRouter = (): typeof router => {
  return router
}

function handlePages(config: RouterConfig) {
  //add Login page
  if (config.login) {
    router.addRoute({
      path: config.login.path,
      name: 'Login',
      component: config.login.component,
      redirect: config.login.redirect,
      meta: toMeta(config.login),
    })
  }

  //add Home page
  const homePage = awaitGet(config.home)
  if (homePage) {
    router.addRoute({
      path: homePage.path,
      name: 'Home',
      component: awaitGet(homePage.component),
      redirect: homePage.redirect,
      children: homePage.children ? homePage.children.map(toRoute) : null,
      meta: toMeta(homePage),
    })
  }

  //添加Primary路由
  const primPages = awaitGet(config.primaryPages)
  if (isArray(primPages)) {
    primPages.forEach((page) => {
      console.log(page)
      router.addRoute(toRoute(page))
    })
  }

  //添加PageStore
  usePageStore().setPrimaryPages(homePage ? [homePage as Page, ...primPages] : primPages)

  //添加Secondary路由
  const secondPages = awaitGet(config.secondaryPages)
  if (isArray(secondPages)) {
    secondPages.forEach((page) => {
      console.log(page)
      router.addRoute(toRoute(page))
    })
  }

  //添加PageStore
  usePageStore().setSeconaryPages(secondPages)
}

function toRoute(page: Page): RouteRecordRaw {
  return {
    path: page.path,
    name: page.name,
    component: page.component,
    redirect: page.redirect,
    children: page.children ? page.children.map(toRoute) : null,
    meta: toMeta(page),
  }
}

function toMeta(page: Partial<Page>): RouteMeta {
  return {
    permition: page.permition,
    ...(page.meta ?? {}),
  }
}

router.beforeEach((to, from, next) => {
  NProgress.start()

  console.log(router.getRoutes())

  const appStore = useAppStore()
  const page = to.meta?.page as Page

  //去登录页面
  if (to.name === 'Login') {
    next()
    return
  }

  //如果页面允许匿名访问
  if (!page || page.permition === 'anon') {
    next()
    return
  }

  //用户未登录，且to页面需要权限，则跳转至登录页面
  if (!appStore.user) {
    next({
      name: 'Login',
      query: {
        redirect: to.path + to.query,
      },
    })
  } else {
    next()
  }
})

router.afterEach((to) => {
  const page = to.meta as unknown as PageMeta

  if (page) {
    document.title = useDinoFrame().title + ' - ' + page.title
  } else {
    document.title = useDinoFrame().title
  }

  NProgress.done() // 结束Progress
})
