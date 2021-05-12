import {
  DMXObject, Topic, Assoc, Player, RelatedTopic, Type, TopicType, AssocType, Topicmap, ViewTopic, ViewAssoc,
  setIconRenderers
} from './model'
import rpc       from './rpc'
import typeCache from './type-cache'
import permCache from './permission-cache'
import utils     from './utils'
import icons     from './icons'

console.log('[DMX-API] 2021/05/12')

let adminWorkspaceId    // promise

export default {

  /* eslint object-property-newline: "off" */
  DMXObject, Topic, Assoc, Player, RelatedTopic, Type, TopicType, AssocType, Topicmap, ViewTopic, ViewAssoc,

  rpc,
  typeCache,
  permCache,
  utils,
  icons,

  init (config) {
    config.iconRenderers && setIconRenderers(config.iconRenderers)
    config.onHttpError && rpc.setErrorHandler(config.onHttpError)
    adminWorkspaceId = rpc.getAdminWorkspaceId()
    return typeCache.init(config.store)
  },

  /**
   * @return  a promise for a true/false value
   */
  isAdmin () {
    return adminWorkspaceId.then(id => permCache.isWritable(id))
  }
}
