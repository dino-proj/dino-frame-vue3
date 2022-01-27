import type { App } from 'vue'
import { authDirective } from './auth'

import { clipboard } from './clipboard'
import { dragDirective } from './drag'
import { wavesDirective } from './waves'

export function setupDirectives(app: App) {
  app.directive('clipboard', clipboard)
  app.directive('drag', dragDirective)
  app.directive('waves', wavesDirective)
  app.directive('auth', authDirective)
}
