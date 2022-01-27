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

import { AuthApi, AuthToken, DinoLoginAuthInfo } from '../auth'
import { useAppStore } from '../store'

/**
 * 租户信息
 */
export interface Tenant {
  [K: string]: any
  id: string
  name: string
  logo: string
}

/**
 * 用户信息
 */
export interface UserInfo<K = number> extends Record<string, any> {
  id: K
  userType: string
  displayName: string
  avatarUrl: string
}

/**
 * DinoFrame对象
 */
export interface DinoFrame {
  title: string
  tenant: () => Tenant
  setTenant: (tenant: Tenant) => void
  user: <ID = number>() => UserInfo<ID>
  setUser: (user: UserInfo) => void
  authToken: () => AuthToken
  setAuthToken: (auth: AuthToken) => void
  authApi: <T extends DinoLoginAuthInfo<U>, U extends UserInfo>() => AuthApi<T, U>
  setAuthApi: <T extends DinoLoginAuthInfo<U>, U extends UserInfo>(authApi: AuthApi<T, U>) => void
  logout: () => void
  autoLogin: () => Promise<boolean>
  gotoHome: () => void
  gotoLogin: (redirect?: string) => void
}

const appFrame: DinoFrame & Record<string, any> = {
  _authApi: null,
  title: '',
  tenant: function (): Tenant {
    return useAppStore().tenant
  },
  user: function <ID = number>(): UserInfo<ID> {
    return useAppStore().user
  },
  authToken: (): AuthToken => {
    return useAppStore().authToken
  },
  setTenant: function (tenant: Tenant): void {
    useAppStore().setTenant(tenant)
  },
  setUser: function <ID = number>(user: UserInfo<ID>): void {
    useAppStore().setUser(user)
  },
  setAuthToken: (auth: AuthToken): void => {
    useAppStore().setAuthToken(auth)
  },
  authApi: <T extends DinoLoginAuthInfo<U>, U extends UserInfo>(): AuthApi<T, U> => {
    return appFrame._authApi
  },
  setAuthApi: <T extends DinoLoginAuthInfo<U>, U extends UserInfo>(authApi: AuthApi<T, U>): void => {
    appFrame._authApi = authApi
  },
  logout: function (): void {
    useAppStore().logout()
    if (appFrame._authApi) {
      appFrame.authApi().logout()
    }
    appFrame.gotoHome()
  },

  autoLogin: function (): Promise<boolean> {
    if (!appFrame._authApi) {
      throw new Error('AuthApi is not provided.')
    }

    return new Promise<boolean>((resolve, reject) => {
      appFrame
        .authApi()
        .loginByToken(appFrame.authToken())
        .then((auth) => {
          appFrame.setAuthToken(auth.authToken)
          appFrame.setTenant(auth.currentTenant)
          appFrame.setUser(auth.user)
          resolve(true)
        })
        .catch((e) => reject(e))
    })
  },

  gotoHome: (): void => {
    appFrame.$router.push({ name: 'Home' })
  },
  gotoLogin: (redirect?: string): void => {
    appFrame.$router.push({
      name: 'Login',
      query: {
        redirect: redirect ?? appFrame.$router.currentRoute.value.path,
      },
    })
  },
}

export const useDinoFrame = (): DinoFrame => {
  return appFrame
}
