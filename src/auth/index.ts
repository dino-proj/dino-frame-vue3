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

import { Tenant, UserInfo } from '../frame'

/**
 * 登录凭证
 */
export interface AuthToken {
  refreshToken: string
  expiresIn: number
  authHeaderName: string
  authPayload: string
}

export interface DinoLoginAuthInfo<U extends UserInfo = UserInfo> {
  currentTenant?: Tenant
  tenantList?: Tenant[]
  user?: U
  authToken: AuthToken
}

export interface AuthApi<T extends DinoLoginAuthInfo<U>, U extends UserInfo = UserInfo> {
  loginByToken: (token: AuthToken) => Promise<T>

  logout: () => Promise<boolean>
}
