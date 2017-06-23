import { TopicType } from './model'
import restClient from './rest-client'
import utils from './utils'
import Vue from 'vue'

const state = {
  topicTypes: {},    // type URI (string) -> TopicType
  assocTypes: {}     // type URI (string) -> AssocType
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
  putTopicType(bootstrapType())
  restClient.getAllTopicTypes().then(topicTypes => {
    topicTypes.forEach(topicType => {
      putTopicType(topicType)
    })
  })
  restClient.getAllAssocTypes().then(assocTypes => {
    assocTypes.forEach(assocType => {
      putAssocType(assocType)
    })
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

function putTopicType(topicType) {
  if (!(topicType instanceof TopicType)) {
    throw Error(topicType + " is not a TopicType")
  }
  // Note: type cache must be reactive
  Vue.set(state.topicTypes, topicType.uri, topicType)
}

function putAssocType(assocType) {
  if (!(assocType instanceof AssocType)) {
    throw Error(assocType + " is not a AssocType")
  }
  // Note: type cache must be reactive
  Vue.set(state.assocTypes, assocType.uri, assocType)
}

function bootstrapType() {
  return new TopicType({
    uri: "dm4.core.meta_meta_type",
    typeUri: "dm4.core.meta_meta_meta_type",
    value: "Meta Meta Type",
    dataTypeUri: "dm4.core.text",
    assocDefs: [],
    viewConfigTopics: []
  })
}

export default {
  init,
  getTopicType,
  getAssocType
}
