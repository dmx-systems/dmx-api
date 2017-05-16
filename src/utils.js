import { Topic } from './model'

/**
 * @param   objects   an array of objects
 */
function instantiateMany (objects, clazz) {
  return objects.map(object => new clazz(object))
}

// ---

function instantiateChilds (childs) {
  for (var assocDefUri in childs) {
    childs[assocDefUri] = instantiateChild(childs[assocDefUri])
  }
  return childs
}

function instantiateChild (child) {
  if (Array.isArray(child)) {
    return child.map(topic => new Topic(topic))
  } else {
    return new Topic(child)
  }
}

// ---

function mapById (objects) {
  return mapByProp(objects, 'id')
}

function mapByUri (objects) {
  return mapByProp(objects, 'uri')
}

function mapByTypeUri (objects) {
  return mapByProp(objects, 'typeUri')
}

function mapByProp (objects, prop) {
  var map = {}
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
    if (predicate(object[key])) {
      map[key] = object[key]
    }
  }
  return map
}

// ---

export default {
  instantiateMany,
  instantiateChilds,
  mapById,
  mapByUri,
  mapByTypeUri,
  forEach,
  filter
}
