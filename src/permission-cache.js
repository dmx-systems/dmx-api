import rpc from './rpc'

export default {
  isWritable,
  clear
}

// Key is a topic/assoc ID.
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
 * @param   id    a topic/assoc ID.
 *
 * @return  a promise for a true/false value
 */
function isWritable (id) {
  return (permissionCache[id] || (permissionCache[id] = rpc.getPermissions(id))).then(permissions =>
    permissions['dmx.accesscontrol.operation.write']
  )
}

function clear () {
  permissionCache = {}
}
