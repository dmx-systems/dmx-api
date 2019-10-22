import { Topic, TopicType, AssocType } from './model'
import restClient from './rest-client'
import utils from './utils'
import Vue from 'vue'

// Note: the type cache is reactive state. E.g. new topic types appear in the Search Widget's
// type menu automatically (see computed property "menuTopicTypes" in dm5-webclient.vue).

const state = {
  topicTypes: undefined,    // object: type URI (string) -> TopicType
  assocTypes: undefined,    // object: type URI (string) -> AssocType
  dataTypes:  undefined,    // object: data type URI (string) -> data type (Topic)
  roleTypes:  undefined     // object: role type URI (string) -> role type (Topic)
}

const actions = {

  putTopicType (_, topicType) {
    _putTopicType(topicType)
  },

  putAssocType (_, assocType) {
    _putAssocType(assocType)
  },

  putRoleType (_, roleType) {
    _putRoleType(roleType)
  },

  // WebSocket messages

  _newTopicType (_, {topicType}) {
    putTopicType(topicType)
  },

  _newAssocType (_, {assocType}) {
    putAssocType(assocType)
  },

  _newRoleType (_, {roleType}) {
    putRoleType(roleType)
  },

  _processDirectives (_, directives) {
    // DELETE_TYPE directives must be processed in the *next* tick.
    // UPDATE_TYPE directives must be processed in the *same* tick.
    //
    // Consider deleting a selected type in the webclient. 2 directives are processed: delete-topic and delete-type.
    // Delete-topic triggers a route change, causing the webclient's "object" state to reset. Delete-type removes the
    // type from cache, triggering recalculation of the webclient's "object" getter. At that moment webclient's "object"
    // state is still set as route changes perform asynchronously (through the route watcher). Recalculation of the
    // "object" getter fails ("type not in type cache") as the type is already removed but "object" state is still
    // set.
    // As a workaround processing the delete-type directive is postponed to the next tick. At that moment "object" state
    // is reset.
    // TODO: proper synchronization of route change and directives processing. This is supposed to be the sole
    // responsibility of the webclient. The dm5 library must not participate in synchronization. The dm5 library
    // is supposed to have no knowledge about the webclient.
    //
    // Consider updating a type URI in the webclient. 3 directives are processed: delete-type, update-type, and
    // update-topic. update-topic triggers recalculation of the webclient's "object" getter. The getter callback is
    // executed in next tick (as getters work asynchronously). At that time the type -- with the new URI -- must already
    // exist in type cache. (Otherwise recalculation of the "object" getter would fail with "type not in type
    // cache".)
    // Processing the update-type directive in the *same* tick ensures the type cache is up-to-date *before* the getter
    // callback executes.
    // console.log(`Type-cache: processing ${directives.length} directives (UPDATE_TYPE)`)
    directives.forEach(dir => {
      switch (dir.type) {
      case 'UPDATE_TOPIC_TYPE':
        putTopicType(dir.arg)
        break
      case 'UPDATE_ASSOCIATION_TYPE':
        putAssocType(dir.arg)
        break
      }
      // Note: role types are never updated as they are simple values and thus immutable
    })
    Vue.nextTick(() => {
      // console.log(`Type-cache: processing ${directives.length} directives (DELETE_TYPE)`)
      directives.forEach(dir => {
        switch (dir.type) {
        case 'DELETE_TOPIC_TYPE':
          removeTopicType(dir.arg.uri)
          break
        case 'DELETE_ASSOCIATION_TYPE':
          removeAssocType(dir.arg.uri)
          break
        case 'DELETE_TOPIC':
          if (dir.arg.typeUri === 'dmx.core.role_type') {
            removeRoleType(dir.arg.uri)
          }
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
    restClient.getTopicsByType('dmx.core.data_type').then(dataTypes => {
      state.dataTypes = utils.mapByUri(dataTypes)
    }),
    restClient.getTopicsByType('dmx.core.role_type').then(roleTypes => {
      state.roleTypes = utils.mapByUri(roleTypes)
    })
  ]).then(() => {
    // console.log('### Type cache ready!')
  })
}

// ---

function getTopicType (uri) {
  return getType(uri, 'topic type', 'topicTypes')
}

function getAssocType (uri) {
  return getType(uri, 'assoc type', 'assocTypes')
}

function getDataType (uri) {
  return getType(uri, 'data type', 'dataTypes')
}

function getRoleType (uri) {
  return getType(uri, 'role type', 'roleTypes')
}

function getType (uri, className, prop) {
  const type = state[prop] && state[prop][uri]
  if (!type) {
    throw Error(`${className} "${uri}" not in type cache`)
  }
  return type
}

function getTypeById (id) {
  const types = Object.values(state.topicTypes).concat(
                Object.values(state.assocTypes)).filter(type => type.id === id)
  if (types.length !== 1) {
    throw Error(`${types.length} types with ID ${id} in type cache`)
  }
  return types[0]
}

// ---

function getAllTopicTypes () {
  return getAllTypes('topicTypes')
}

function getAllAssocTypes () {
  return getAllTypes('assocTypes')
}

function getAllDataTypes () {
  return getAllTypes('dataTypes')
}

function getAllRoleTypes () {
  return getAllTypes('roleTypes')
}

function getAllTypes (prop) {
  return Object.values(state[prop])
}

// ---

function putTopicType (topicType) {
  _putTopicType(new TopicType(topicType))
}

function putAssocType (assocType) {
  _putAssocType(new AssocType(assocType))
}

function putRoleType (roleType) {
  _putRoleType(new Topic(roleType))
}

// ---

function _putTopicType (topicType) {
  _putType(topicType, TopicType, 'topicTypes')
}

function _putAssocType (assocType) {
  _putType(assocType, AssocType, 'assocTypes')
}

function _putRoleType (roleType) {
  _putType(roleType, Topic, 'roleTypes')
}

function _putType (type, typeClass, prop) {
  if (!(type instanceof typeClass)) {
    throw Error(`can't cache "${type.constructor.name}", expected is "${typeClass.name}", ${JSON.stringify(type)}`)
  }
  // Note: type cache must be reactive
  Vue.set(state[prop], type.uri, type)
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

function removeRoleType (uri) {
  // Note: type cache must be reactive
  Vue.delete(state.roleTypes, uri)
}

// ---

function bootstrapType () {
  return new TopicType({
    uri: 'dmx.core.meta_meta_type',
    typeUri: 'dmx.core.meta_meta_meta_type',
    value: 'Meta Meta Type',
    dataTypeUri: 'dmx.core.text',
    compDefs: [],
    viewConfigTopics: []
  })
}

export default {
  init,
  getTopicType,
  getAssocType,
  getDataType,
  getRoleType,
  getTypeById,
  getAllTopicTypes,
  getAllAssocTypes,
  getAllDataTypes,
  getAllRoleTypes
}
