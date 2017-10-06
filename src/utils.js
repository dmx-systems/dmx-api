import { Topic } from './model'

/**
 * Instantiates plain objects.
 *
 * @param   objects   an array of plain objects
 * @param   clazz     the class to instantiate
 *
 * @return  array of instantiated objects
 */
function instantiateMany (objects, clazz) {
  return objects.map(object => new clazz(object))
}

// ---

function instantiateChilds (childs) {
  for (var assocDefUri in childs) {
    childs[assocDefUri] = _instantiateChild(childs[assocDefUri])
  }
  return childs
}

function _instantiateChild (child) {
  if (Array.isArray(child)) {
    return child.map(topic => new Topic(topic))
  } else {
    return new Topic(child)
  }
}

// ---

function mapById (objects) {
  return _mapByProp(objects, 'id')
}

function mapByUri (objects) {
  return _mapByProp(objects, 'uri')
}

function mapByTypeUri (objects) {
  return _mapByProp(objects, 'typeUri')
}

function _mapByProp (objects, prop) {
  const map = {}
  objects.forEach(object => map[object[prop]] = object)
  return map
}

// ---

function forEach (object, visitor) {
  for (var key in object) {
    visitor(object[key])
  }
}

function filter (object, predicate) {
  const map = {}
  for (var key in object) {
    const val = object[key]
    if (predicate(val)) {
      map[key] = val
    }
  }
  return map
}

// ---

/**
 * Returns a cookie value.
 *
 * @param   name    the name of the cookie, e.g. "dm4_workspace_id".
 *
 * @return  the cookie value (string) or undefined if no such cookie exist.
 */
function getCookie(name) {
  // Note: document.cookie contains all cookies as one string, e.g. "dm4_workspace_id=123; dm4_topicmap_id=234"
  const match = document.cookie.match(new RegExp(`\\b${name}=(\\w*)`))
  return match && match[1]
}

function setCookie (name, value) {
  document.cookie = `${name}=${value};path=/`
}

// ---

export default {
  instantiateMany,
  instantiateChilds,
  mapById,
  mapByUri,
  mapByTypeUri,
  forEach,
  filter,
  getCookie,
  setCookie
}
