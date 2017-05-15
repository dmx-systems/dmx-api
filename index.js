import { Topic, Assoc, TopicType, AssocType, Topicmap, TopicmapTopic } from './src/model'

export default {
  Topic,
  Assoc,
  TopicType,
  AssocType,
  Topicmap,
  TopicmapTopic,
  //
  restClient: require('./src/rest-client').default,
  typeCache: require('./src/type-cache').default,
  utils: require('./src/utils').default
}
