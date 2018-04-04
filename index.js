import {
  DeepaMehtaObject, Topic, Assoc, AssocRole, RelatedTopic, Type, TopicType, AssocType, Topicmap, ViewTopic, ViewAssoc
} from './src/model'
import restClient from './src/rest-client'
import typeCache  from './src/type-cache'
import permCache  from './src/permission-cache'
import utils      from './src/utils'

export default {

  DeepaMehtaObject, Topic, Assoc, AssocRole, RelatedTopic, Type, TopicType, AssocType, Topicmap, ViewTopic, ViewAssoc,

  restClient,
  permCache,
  utils,

  init (store) {
    return typeCache.init(store)
  }
}
