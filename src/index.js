import {
  DMXObject, Topic, Assoc, Player, RelatedTopic, Type, TopicType, AssocType, RoleType, Topicmap, ViewTopic, ViewAssoc,
  setIconRenderers
} from './model'
import {
  default as typeCache,
  init as initTypeCache,
  storeModule
} from './type-cache'
import rpc          from './rpc'
import permCache    from './permission-cache'
import utils        from './utils'
import icons        from './icons'
import DMXWebSocket from './websocket'

console.log('[DMX-API] 2023/05/17')

let adminWorkspaceId    // promise

const clientId = newClientId()
updateClientIdCookie()

window.addEventListener('focus', updateClientIdCookie)

export default {

  /* eslint object-property-newline: "off" */
  DMXObject, Topic, Assoc, Player, RelatedTopic, Type, TopicType, AssocType, RoleType, Topicmap, ViewTopic, ViewAssoc,

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
    config.iconRenderers && setIconRenderers(config.iconRenderers)
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
  // DEV && console.log('dmx_client_id', clientId)
  utils.setCookie('dmx_client_id', clientId)
}

function newClientId () {
  return Math.floor(Number.MAX_SAFE_INTEGER * Math.random())
}
