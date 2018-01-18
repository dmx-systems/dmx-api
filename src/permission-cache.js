import restClient from './rest-client'

// Key is a topic/association ID.
// Value is a promise for a permissions object:
//   {
//     "dm4.accesscontrol.operation.write": true|false
//   }
//
// Note: at client-side there is no explicit READ permission.
// The Webclient never gets hold of an object the user is not allowed to read.
// The server would not send it in the first place.
// ### TODO: not fully true. Think about logout: the Webclient might still hold
// objects which are not readable anymore.
var permissionCache = {}

/**
 * @return  a promise for a permissions object
 */
function isTopicWritable (id) {
  return _isWritable(id, restClient.getTopicPermissions)
}

/**
 * @return  a promise for a permissions object
 */
function isAssocWritable (id) {
  return _isWritable(id, restClient.getAssocPermissions)
}

function _isWritable (id, retrievalFunc) {
  return (permissionCache[id] || (permissionCache[id] = retrievalFunc(id))).then(permissions =>
    permissions['dm4.accesscontrol.operation.write']
  )
}

function clear () {
  permissionCache = {}
}

export default {
  isTopicWritable,
  isAssocWritable,
  clear
}
