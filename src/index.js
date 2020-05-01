import {
  DMXObject, Topic, Assoc, Player, RelatedTopic, Type, TopicType, AssocType, Topicmap, ViewTopic, ViewAssoc
} from './model'
import restClient from './rest-client'
import typeCache  from './type-cache'
import permCache  from './permission-cache'
import utils      from './utils'

console.log('[DMX] Client Library 2020/05/01')

export default {

  DMXObject, Topic, Assoc, Player, RelatedTopic, Type, TopicType, AssocType, Topicmap, ViewTopic, ViewAssoc,

  restClient,
  typeCache,
  permCache,
  utils,

  init (config) {
    config.onHttpError && restClient.setErrorHandler(config.onHttpError)
    return typeCache.init(config.store)
  }
}
