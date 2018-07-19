import {
  DeepaMehtaObject, Topic, Assoc, AssocRole, RelatedTopic, Type, TopicType, AssocType, Topicmap, ViewTopic, ViewAssoc
} from './model'
import restClient from './rest-client'
import typeCache  from './type-cache'
import permCache  from './permission-cache'
import utils      from './utils'

console.log('DM5 API 2018/07/19.2')

export default {

  DeepaMehtaObject, Topic, Assoc, AssocRole, RelatedTopic, Type, TopicType, AssocType, Topicmap, ViewTopic, ViewAssoc,

  restClient,
  permCache,
  utils,

  init (config) {
    restClient.setErrorHandler(config.onHttpError)
    return typeCache.init(config.store)
  }
}
