import { TopicType, AssocType } from './model'
import restClient from './rest-client'
import utils from './utils'
import Vue from 'vue'

const state = {
  topicTypes: undefined,    // type URI (string) -> TopicType
  assocTypes: undefined,    // type URI (string) -> AssocType
  dataTypes: undefined,     // data type URI (string) -> data type (a Topic object)
  roleTypes: undefined      // role type URI (string) -> role type (a Topic object)
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

  _processDirectives ({dispatch}, directives) {
    console.log(`Type-cache: processing ${directives.length} directives`)
    directives.forEach(dir => {
      switch (dir.type) {
      case "UPDATE_TOPIC_TYPE":
        putTopicType(dir.arg)
        break
      case "DELETE_TOPIC_TYPE":
        // TODO
        console.warn('Directive DELETE_TOPIC_TYPE not yet implemented')
        break
      case "UPDATE_ASSOCIATION_TYPE":
        putAssocType(dir.arg)
        break
      case "DELETE_ASSOCIATION_TYPE":
        // TODO
        console.warn('Directive DELETE_ASSOCIATION_TYPE not yet implemented')
        break
      }
    })
  }
}

// TODO: move to Webclient?
const getters = {
  menuTopicTypes: state => utils.filter(state.topicTypes, topicType =>
    topicType.getViewConfig('dm4.webclient.show_in_create_menu')
  )
}

function init (store) {
  store.registerModule('typeCache', {
    state,
    actions,
    getters
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
    console.log('### Type cache ready!')
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

function putTopicType(topicType) {
  _putTopicType(new TopicType(topicType))
}

function putAssocType(assocType) {
  _putAssocType(new AssocType(assocType))
}

// ---

function _putTopicType(topicType) {
  if (!(topicType instanceof TopicType)) {
    throw Error(topicType + " is not a TopicType")
  }
  // Note: type cache must be reactive
  Vue.set(state.topicTypes, topicType.uri, topicType)
}

function _putAssocType(assocType) {
  if (!(assocType instanceof AssocType)) {
    throw Error(assocType + " is not an AssocType")
  }
  // Note: type cache must be reactive
  Vue.set(state.assocTypes, assocType.uri, assocType)
}

// ---

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
  //
  getTopicType,
  getAssocType,
  getDataType,
  getRoleType
}
