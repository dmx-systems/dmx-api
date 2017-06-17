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

/**
 * @param   map   optional
 */
function mapById (objects, map) {
  return _mapByProp(objects, 'id', map)
}

/**
 * @param   map   optional
 */
function mapByUri (objects, map) {
  return _mapByProp(objects, 'uri', map)
}

/**
 * @param   map   optional
 */
function mapByTypeUri (objects, map) {
  return _mapByProp(objects, 'typeUri', map)
}

function _mapByProp (objects, prop, map) {
  map = map || {}
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
  setCookie
}
