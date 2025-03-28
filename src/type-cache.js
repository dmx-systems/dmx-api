import { nextTick } from 'vue'
import { Topic, TopicType, AssocType, RoleType } from './model'
import rpc from './rpc'
import utils from './utils'

const typeP = {}      // intermediate type promises

// Note: the type cache is reactive state. E.g. new topic types appear in the Search Widget's
// type menu automatically (see "createTopicTypes" getter in search.js of module dmx-search).
const state = {
  topicTypes: {},     // object: topic type URI (string) -> TopicType
  assocTypes: {},     // object: assoc type URI (string) -> AssocType
  roleTypes:  {},     // object: role type URI (string) -> RoleType
  dataTypes:  {}      // object: data type URI (string) -> data type (Topic)
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

  /**
   * Re-populates the type cache with *all* types readable by current user.
   */
  initTypeCache () {
    return initAllTypes()
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
    // "object" getter fails ("unknown type") as the type is already removed but "object" state is still
    // set.
    // As a workaround processing the delete-type directive is postponed to the next tick. At that moment "object" state
    // is reset.
    // TODO: proper synchronization of route change and directives processing. This is supposed to be the sole
    // responsibility of the webclient. The dmx-api library must not participate in synchronization. The dmx-api library
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
      case 'UPDATE_ASSOC_TYPE':
        putAssocType(dir.arg)
        break
      case 'UPDATE_ROLE_TYPE':
        putRoleType(dir.arg)
        break
      }
      // Note: role types are never updated as they are simple values and thus immutable
    })
    nextTick(() => {
      // console.log(`Type-cache: processing ${directives.length} directives (DELETE_TYPE)`)
      directives.forEach(dir => {
        switch (dir.type) {
        case 'DELETE_TOPIC_TYPE':
          removeTopicType(dir.arg.uri)
          break
        case 'DELETE_ASSOC_TYPE':
          removeAssocType(dir.arg.uri)
          break
        case 'DELETE_TOPIC':      // TODO: DELETE_ROLE_TYPE
          if (dir.arg.typeUri === 'dmx.core.role_type') {
            removeRoleType(dir.arg.uri)
          }
          break
        }
      })
    })
  }
}

function init (topicTypes) {
  if (topicTypes) {
    let p
    if (topicTypes === 'all') {
      p = initAllTypes()
    } else {
      topicTypes.forEach(_initTopicType)
      // TODO: return promise
    }
    return p
  }
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
  const type = _getType(uri, prop)
  if (!type) {
    throw Error(`${className} "${uri}" not in type cache`)
  }
  return type
}

function getTypeById (id) {
  const types = Object.values(state.topicTypes).concat(
                Object.values(state.assocTypes)).filter(type => type.id === id)               /* eslint indent: "off" */
  if (types.length !== 1) {
    throw Error(`${types.length} types with ID ${id} in type cache`)
  }
  return types[0]
}

// ---

// TODO: the following 4 functions return async data so they should return promise

// IMPORTANT: calling these methods must be synced, otherwise you might get undefined

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

/**
 * @return  the requested types (array), or undefined if types are not yet loaded
 */
function getAllTypes (prop) {
  return state[prop] && Object.values(state[prop])
}

// ---

function initAllTypes () {
  return Promise.all([
    // init state
    rpc.getAllTopicTypes().then(topicTypes => {
      state.topicTypes = utils.mapByUri(topicTypes)
      _putTopicType(bootstrapType())
    }),
    rpc.getAllAssocTypes().then(assocTypes => {
      state.assocTypes = utils.mapByUri(assocTypes)
    }),
    rpc.getAllRoleTypes().then(roleTypes => {
      state.roleTypes = utils.mapByUri(roleTypes)
    }),
    rpc.getTopicsByType('dmx.core.data_type').then(dataTypes => {
      state.dataTypes = utils.mapByUri(dataTypes)
    })
  ])
}

function _initTopicType (uri) {
  _initType(uri, 'topicTypes', TopicType, rpc.getTopicType).then(topicType => {
    topicType.compDefs.forEach(compDef => {
      _initTopicType(compDef.childTypeUri)
      _initAssocType(compDef.instanceLevelAssocTypeUri)
    })
  })
}

function _initAssocType (uri) {
  _initType(uri, 'assocTypes', AssocType, rpc.getAssocType).then(assocType => {
    assocType.compDefs.forEach(compDef => {
      _initTopicType(compDef.childTypeUri)
      // TODO: call _initAssocType()?
    })
  })
}

function _initType (uri, prop, typeClass, fetchFunc) {
  const type = _getType(uri, prop)
  if (type) {
    return Promise.resolve(type)
  } else {
    let p = typeP[uri]
    if (!p) {
      p = fetchFunc(uri).then(type => {
        _putType(type, typeClass, prop)
        delete typeP[uri]
        return type
      })
      typeP[uri] = p
    }
    return p
  }
}

function _getType (uri, prop) {
  return state[prop] && state[prop][uri]
}

// ---

function putTopicType (topicType) {
  _putTopicType(new TopicType(topicType))
}

function putAssocType (assocType) {
  _putAssocType(new AssocType(assocType))
}

function putRoleType (roleType) {
  _putRoleType(new RoleType(roleType))
}

// ---

function _putTopicType (topicType) {
  _putType(topicType, TopicType, 'topicTypes')
}

function _putAssocType (assocType) {
  _putType(assocType, AssocType, 'assocTypes')
}

function _putRoleType (roleType) {
  _putType(roleType, RoleType, 'roleTypes')
}

function _putType (type, typeClass, prop) {
  if (!(type instanceof typeClass)) {
    throw Error(`can't cache "${type.constructor.name}", expected is "${typeClass.name}", ${JSON.stringify(type)}`)
  }
  state[prop][type.uri] = type
}

// ---

function removeTopicType (uri) {
  delete state.topicTypes[uri]
}

function removeAssocType (uri) {
  delete state.assocTypes[uri]
}

function removeRoleType (uri) {
  delete state.roleTypes[uri]
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

// public API

export default {
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

// module internal API

export {init}
export const storeModule = {state, actions}
