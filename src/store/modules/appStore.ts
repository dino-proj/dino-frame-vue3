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

import { AuthToken } from '../../auth'
import { useLocalCache, useSessionCache } from '../../cache'
import { defineStore, _GettersTree } from 'pinia'
import { Tenant, UserInfo } from '../../frame'

const CACHE_KEY_AUTH = 'dino_auth'
const CACHE_KEY_USER = 'dino_user'

export interface AppState {
  authToken: AuthToken
  tenant: Tenant
  user: UserInfo<any>
  permissions: string[]
}

declare type Getters = _GettersTree<AppState>

interface Actions {
  setTenant: (tenant: Tenant) => void
  setUser: <ID = number>(user: UserInfo<ID>) => void
  setAuthToken: (token: AuthToken) => void
  setPermissions: (perms: string[]) => void
  isLogin: () => boolean
  logout: () => void
}

export const appStoreDefinition = defineStore<string, AppState, Getters, Actions>({
  id: 'appStore',
  state: () => {
    return {
      authToken: useLocalCache().get(CACHE_KEY_AUTH),
      tenant: null,
      user: useSessionCache().get(CACHE_KEY_USER),
      permissions: [],
    }
  },

  actions: {
    setTenant(tenant: Tenant) {
      this.tenant = tenant
    },

    setUser<ID = number>(user: UserInfo<ID>) {
      useSessionCache().set(CACHE_KEY_USER, user)
      this.user = user
    },

    setAuthToken(authToken: AuthToken) {
      useLocalCache().set(CACHE_KEY_AUTH, authToken, authToken.expiresIn)
      this.authToken = authToken
    },

    setPermissions(perms: string[]) {
      this.permissions = perms
    },

    isLogin(): boolean {
      return !this.user
    },

    logout() {
      useLocalCache().delete(CACHE_KEY_AUTH)
      useSessionCache().delete(CACHE_KEY_USER)
      this.user = null
      this.authToken = null
    },
  },
})
