import * as model   from './model'
import rpc          from './rpc'
import permCache    from './permission-cache'
import utils        from './utils'
import icons        from './icons'
import DMXWebSocket from './websocket'
import {default as typeCache, init as initTypeCache, storeModule} from './type-cache'

console.log('[DMX-API] 2024/08/13')

let adminWorkspaceId    // promise

const clientId = newClientId()
updateClientIdCookie()

window.addEventListener('focus', updateClientIdCookie)

export default {

  ...model,
  rpc,
  typeCache,
  permCache,
  utils,
  icons,

  init (config) {
    adminWorkspaceId = rpc.getAdminWorkspaceId()
    config.store.registerModule('typeCache', storeModule)
    config.messageHandler && new DMXWebSocket(rpc.getWebsocketConfig(), config.messageHandler)
    config.onHttpError && rpc.setErrorHandler(config.onHttpError)
    config.iconRenderers && model.setIconRenderers(config.iconRenderers)
    return initTypeCache(config.topicTypes)
  },

  /**
   * @return  a promise for a true/false value
   */
  isAdmin () {
    return adminWorkspaceId.then(id => permCache.isWritable(id))
  }
}

function updateClientIdCookie () {
  utils.setCookie('dmx_client_id', clientId)
}

function newClientId () {
  return Math.floor(Number.MAX_SAFE_INTEGER * Math.random())
}
