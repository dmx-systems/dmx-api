import {
  DMXObject, Topic, Assoc, Player, RelatedTopic, Type, TopicType, AssocType, Topicmap, ViewTopic, ViewAssoc,
  setIconRenderers
} from './model'
import rpc       from './rpc'
import typeCache from './type-cache'
import permCache from './permission-cache'
import utils     from './utils'
import icons     from './icons'

console.log('[DMX-API] 2022/04/11')

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
    config.store.registerModule('typeCache', typeCache.storeModule)
    config.onHttpError && rpc.setErrorHandler(config.onHttpError)
    config.iconRenderers && setIconRenderers(config.iconRenderers)
    config.topicTypes && config.topicTypes.forEach(fetchTopicType)
    adminWorkspaceId = rpc.getAdminWorkspaceId()
  },

  /**
   * @return  a promise for a true/false value
   */
  isAdmin () {
    return adminWorkspaceId.then(id => permCache.isWritable(id))
  }
}

// FIXME: do not fetch multiple times
function fetchTopicType (typeUri) {
  typeCache.initTopicType(typeUri).then(() => {
    typeCache.getTopicType(typeUri).compDefs.forEach(compDef => {
      fetchTopicType(compDef.childTypeUri)
      fetchAssocType(compDef.instanceLevelAssocTypeUri)
    })
  })
}

// FIXME: do not fetch multiple times
function fetchAssocType (typeUri) {
  typeCache.initAssocType(typeUri).then(() => {
    typeCache.getAssocType(typeUri).compDefs.forEach(compDef => {
      fetchTopicType(compDef.childTypeUri)
    })
  })
}
