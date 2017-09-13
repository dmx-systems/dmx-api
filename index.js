import { Topic, Assoc, RelatedTopic, TopicType, AssocType, Topicmap, ViewTopic } from './src/model'
import restClient from './src/rest-client'
import typeCache  from './src/type-cache'
import utils      from './src/utils'

export default {

  Topic,
  Assoc,
  RelatedTopic,
  TopicType,
  AssocType,
  Topicmap,
  ViewTopic,

  restClient,
  typeCache: {
    getTopicType: typeCache.getTopicType,
    getAssocType: typeCache.getAssocType,
  },
  utils,

  init (store) {
    typeCache.init(store)
  },

  // synchronization helper
  ready () {
    return typeCache.ready()
  }
}
