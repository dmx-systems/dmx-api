import {
  DMXObject, Topic, Assoc, Player, RelatedTopic, Type, TopicType, AssocType, Topicmap, ViewTopic, ViewAssoc,
  setIconRenderers
} from './model'
import rpc          from './rpc'
import typeCache    from './type-cache'
import permCache    from './permission-cache'
import utils        from './utils'
import icons        from './icons'
import DMXWebSocket from './websocket'

console.log('[DMX-API] 2023/05/14')

let adminWorkspaceId    // promise

const clientId = newClientId()
updateClientIdCookie()

window.addEventListener('focus', updateClientIdCookie)

export default {

  /* eslint object-property-newline: "off" */
  DMXObject, Topic, Assoc, Player, RelatedTopic, Type, TopicType, AssocType, Topicmap, ViewTopic, ViewAssoc,

  rpc,
  typeCache,
  permCache,
  utils,
  icons,

  init (config) {
    adminWorkspaceId = rpc.getAdminWorkspaceId()
    config.store.registerModule('typeCache', typeCache.storeModule)
    config.messageHandler && new DMXWebSocket(rpc.getWebsocketConfig(), config.messageHandler)
    config.onHttpError && rpc.setErrorHandler(config.onHttpError)
    config.iconRenderers && setIconRenderers(config.iconRenderers)
    return typeCache.init(config.topicTypes)
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
