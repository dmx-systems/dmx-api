import {
  DeepaMehtaObject, Topic, Assoc, AssocRole, RelatedTopic, TopicType, AssocType, Topicmap, ViewTopic
} from './src/model'
import restClient from './src/rest-client'
import typeCache  from './src/type-cache'
import utils      from './src/utils'

export default {

  DeepaMehtaObject, Topic, Assoc, AssocRole, RelatedTopic, TopicType, AssocType, Topicmap, ViewTopic,

  restClient,
  utils,

  init (store) {
    return typeCache.init(store)
  }
}
