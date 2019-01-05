import {
  DMXObject, Topic, Assoc, Player, RelatedTopic, Type, TopicType, AssocType, Topicmap, ViewTopic, ViewAssoc, Geomap
} from './model'
import restClient from './rest-client'
import typeCache  from './type-cache'
import permCache  from './permission-cache'
import utils      from './utils'

console.log('[DMX] Client API 2019/01/05')

export default {

  DMXObject, Topic, Assoc, Player, RelatedTopic, Type, TopicType, AssocType, Topicmap, ViewTopic, ViewAssoc, Geomap,

  restClient,
  permCache,
  utils,

  init (config) {
    config.onHttpError && restClient.setErrorHandler(config.onHttpError)
    return typeCache.init(config.store)
  }
}
