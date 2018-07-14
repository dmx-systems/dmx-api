import { TopicType, AssocType } from './model'
import restClient from './rest-client'
import utils from './utils'
import Vue from 'vue'

// Note: the type cache is reactive state. E.g. new topic types appear in the Search Widget's
// type menu automatically (see computed property "menuTopicTypes" in dm5-webclient.vue).

const state = {
  topicTypes: undefined,    // object: type URI (string) -> TopicType
  assocTypes: undefined,    // object: type URI (string) -> AssocType
  dataTypes: undefined,     // object: data type URI (string) -> data type (Topic)
  roleTypes: undefined      // object: role type URI (string) -> role type (Topic)
}

const actions = {

  putTopicType (_, topicType) {
    _putTopicType(topicType)
  },

  putAssocType (_, assocType) {
    _putAssocType(assocType)
  },

  // WebSocket messages

  _newTopicType (_, {topicType}) {
    putTopicType(topicType)
  },

  _newAssocType (_, {assocType}) {
    putAssocType(assocType)
  },

  _processDirectives (_, directives) {
    // Consider deleting a selected type in the webclient. 2 directives are processed: delete-topic and delete-type.
    // Delete-topic triggers a route change, causing the webclient's "object" state to reset.
    // Delete-type removes the type from cache, triggering recalculation of the webclient's "object" getter.
    // At that moment webclient's "object" state is still set as route changes perform asynchronously (through the route
    // watcher). Recalculation of the "object" getter fails ("type not found in type cache") as the type is already
    // removed but "object" state is still set.
    // As a workaround we postpone processing the delete-type directive to the next tick. At that moment "object" state
    // is reset.
    // TODO: proper synchronization of route change and directives processing. This is supposed to be the sole
    // responsibility of the webclient. The dm5 library must not participate in synchronization. The dm5 library
    // is supposed to have no knowledge about the webclient.
    Vue.nextTick(() => {
      console.log(`Type-cache: processing ${directives.length} directives`)
      directives.forEach(dir => {
        switch (dir.type) {
        case "UPDATE_TOPIC_TYPE":
          putTopicType(dir.arg)
          break
        case "DELETE_TOPIC_TYPE":
          removeTopicType(dir.arg.uri)
          break
        case "UPDATE_ASSOCIATION_TYPE":
          putAssocType(dir.arg)
          break
        case "DELETE_ASSOCIATION_TYPE":
          removeAssocType(dir.arg.uri)
          break
        }
      })
    })
  }
}

function init (store) {
  store.registerModule('typeCache', {
    state,
    actions
  })
  // init state
  return Promise.all([
    restClient.getAllTopicTypes().then(topicTypes => {
      state.topicTypes = utils.mapByUri(topicTypes)
      _putTopicType(bootstrapType())
    }),
    restClient.getAllAssocTypes().then(assocTypes => {
      state.assocTypes = utils.mapByUri(assocTypes)
    }),
    restClient.getTopicsByType('dm4.core.data_type').then(dataTypes => {
      state.dataTypes = utils.mapByUri(dataTypes)
    }),
    restClient.getTopicsByType('dm4.core.role_type').then(roleTypes => {
      state.roleTypes = utils.mapByUri(roleTypes)
    })
  ]).then(() => {
    // console.log('### Type cache ready!')
  })
}

// ---

const getTopicType = getType('topicTypes', 'Topic type')
const getAssocType = getType('assocTypes', 'Assoc type')
const getDataType  = getType('dataTypes',  'Data type')
const getRoleType  = getType('roleTypes',  'Role type')

function getType (prop, name) {
  return uri => {
    const type = state[prop][uri]
    if (!type) {
      throw Error(`${name} "${uri}" not found in type cache`)
    }
    return type
  }
}

// ---

function putTopicType (topicType) {
  _putTopicType(new TopicType(topicType))
}

function putAssocType (assocType) {
  _putAssocType(new AssocType(assocType))
}

// ---

function _putTopicType (topicType) {
  if (!(topicType instanceof TopicType)) {
    throw Error(topicType + " is not a TopicType")
  }
  // Note: type cache must be reactive
  Vue.set(state.topicTypes, topicType.uri, topicType)
}

function _putAssocType (assocType) {
  if (!(assocType instanceof AssocType)) {
    throw Error(assocType + " is not an AssocType")
  }
  // Note: type cache must be reactive
  Vue.set(state.assocTypes, assocType.uri, assocType)
}

// ---

function removeTopicType (uri) {
  // Note: type cache must be reactive
  Vue.delete(state.topicTypes, uri)
}

function removeAssocType (uri) {
  // Note: type cache must be reactive
  Vue.delete(state.assocTypes, uri)
}

// ---

function bootstrapType () {
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
  getAssocType,
  getDataType,
  getRoleType
}
