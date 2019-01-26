import restClient from './rest-client'

export default {
  isTopicWritable,
  isAssocWritable,
  clear
}

// Key is a topic/association ID.
// Value is a promise for a permissions object:
//   {
//     "dmx.accesscontrol.operation.write": true|false
//   }
//
// Note: at client-side there is no explicit READ permission.
// The webclient never gets hold of an object the user is not allowed to read.
// The server would not send it in the first place.
// ### TODO: not fully true. Think about logout: the webclient might still hold
// objects which are not readable anymore.
let permissionCache = {}

/**
 * @return  a promise for a true/false value
 */
function isTopicWritable (id) {
  return _isWritable(id, restClient.getTopicPermissions)
}

/**
 * @return  a promise for a true/false value
 */
function isAssocWritable (id) {
  return _isWritable(id, restClient.getAssocPermissions)
}

/**
 * @return  a promise for a true/false value
 */
function _isWritable (id, retrievalFunc) {
  return (permissionCache[id] || (permissionCache[id] = retrievalFunc(id))).then(permissions =>
    permissions['dmx.accesscontrol.operation.write']
  )
}

function clear () {
  permissionCache = {}
}
