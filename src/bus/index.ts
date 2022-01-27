import mitt, { Emitter } from 'mitt'
import { UserInfo } from '../frame'

export type FrameEvents = {
  login: UserInfo
  logout: string
}

const bus: Emitter<FrameEvents> = mitt<FrameEvents>()

export default bus

export const useBus = (): typeof bus => {
  return bus
}
