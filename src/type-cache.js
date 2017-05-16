import restClient from './rest-client'
import utils from './utils'

const state = {
  topicTypes: {},    // an object: type URI (string) -> TopicType
  assocTypes: {}     // an object: type URI (string) -> AssocType
}

const getters = {
  menuTopicTypes: state => utils.filter(state.topicTypes, topicType =>
    topicType.getViewConfig('dm4.webclient.show_in_create_menu')
  )
}

function init (store) {
  store.registerModule('typeCache', {
    state,
    getters
  })
  // init state
  restClient.getAllTopicTypes().then(topicTypes => {
    state.topicTypes = utils.mapByUri(topicTypes)
  })
  restClient.getAllAssocTypes().then(assocTypes => {
    state.assocTypes = utils.mapByUri(assocTypes)
  })
}

function getTopicType (uri) {
  const type = state.topicTypes[uri]
  if (!type) {
    throw Error(`Topic type ${uri} not found in type cache`)
  }
  return type
}

function getAssocType (uri) {
  const type = state.assocTypes[uri]
  if (!type) {
    throw Error(`Assoc type ${uri} not found in type cache`)
  }
  return type
}

export default {
  init,
  getTopicType,
  getAssocType
}
