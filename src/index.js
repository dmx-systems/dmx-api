import {
  DMXObject, Topic, Assoc, Player, RelatedTopic, Type, TopicType, AssocType, Topicmap, ViewTopic, ViewAssoc,
  setIconRenderers
} from './model'
import restClient from './rest-client'
import typeCache  from './type-cache'
import permCache  from './permission-cache'
import utils      from './utils'

console.log('[DMX-API] 1.0')

let adminWorkspaceId    // promise

export default {

  DMXObject, Topic, Assoc, Player, RelatedTopic, Type, TopicType, AssocType, Topicmap, ViewTopic, ViewAssoc,

  restClient,
  typeCache,
  permCache,
  utils,

  init (config) {
    config.iconRenderers && setIconRenderers(config.iconRenderers)
    config.onHttpError && restClient.setErrorHandler(config.onHttpError)
    adminWorkspaceId = restClient.getAdminWorkspaceId()
    return typeCache.init(config.store)
  },

  /**
   * @return  a promise for a true/false value
   */
  isAdmin () {
    return adminWorkspaceId
      .then(id => permCache.isWritable(id))
      // .then(isAdmin => console.log('isAdmin', isAdmin))
  }
}
