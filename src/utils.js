import {Topic} from './model'
import _clone from 'clone'
import _debounce from 'debounce'

/**
 * Instantiates plain objects.
 *
 * @param   objects   an array of plain objects
 * @param   clazz     the class to instantiate
 *
 * @return  array of instantiated objects
 */
function instantiateMany (objects, clazz) {
  return objects.map(object => new clazz(object))                                            /* eslint new-cap: "off" */
}

// ---

// Note: recursion is indirect via Topic constructor
function instantiateChildren (children) {
  const _children = {}
  for (const compDefUri in children) {
    _children[compDefUri] = _instantiateChild(children[compDefUri])
  }
  return _children
}

function _instantiateChild (child) {
  if (Array.isArray(child)) {
    return child.map(topic => new Topic(topic))
  } else {
    return new Topic(child)
  }
}

// ---

// TODO: drop; export directly
function clone (o) {
  return _clone(o)
}

// TODO: drop; export directly
function debounce (func, delay, immediate) {
  return _debounce(func, delay, immediate)
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
  objects.forEach(object => {
    map[object[prop]] = object
  })
  return map
}

// ---

function forEach (object, visitor) {
  for (const key in object) {
    visitor(object[key])
  }
}

function filter (object, predicate) {
  const map = {}
  for (const key in object) {
    const val = object[key]
    if (predicate(val)) {
      map[key] = val
    }
  }
  return map
}

function isEmpty (object) {
  return !Object.keys(object).length
}

// ---

/**
 * Returns a cookie value.
 *
 * @param   name    the name of the cookie, e.g. "dmx_workspace_id".
 *
 * @return  the cookie value (string) or <code>null</code> if no such cookie exist.
 */
function getCookie (name) {
  // Note: document.cookie contains all cookies as one string, e.g. "dmx_workspace_id=1234; dmx_topicmap_id=2345"
  const match = document.cookie.match(new RegExp(`\\b${name}=(\\w*)`))
  return match && match[1]
}

function setCookie (name, value) {
  document.cookie = cookie(name, value)
}

function deleteCookie (name) {
  // Note: setting the expire date to yesterday removes the cookie
  const days = -1
  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
  //
  document.cookie = cookie(name, '') + `;Expires=${expires.toGMTString()}`
}

function cookie (name, value) {
  return `${name}=${value};Path=/;SameSite=Strict`
}

// ---

const luceneSymbols = [
  '+', '-', '&&', '||', '!', '(', ')', '{', '}', '[', ']', '^', '"', '~', '*', '?', ':', '\\', 'AND', 'OR', 'NOT'
]

function containsLuceneSymbol (input) {
  return luceneSymbols.some(symbol => input.includes(symbol))
}

/**
 * Transforms user input into a Lucene query that can be used for an incremental search.
 *
 * @param     allowSingleLetterSearch   optional; if trueish a search for a single letter as *word begin* is allowed.
 *                                      Note: a search for a single letter as *whole word* (that is when followed by
 *                                      space) is always allowed.
 *
 * @return    a Lucene query.
 *            If input is a single character returns empty string to signalize the caller no search should be triggered.
 */
function fulltextQuery (input, allowSingleLetterSearch) {
  let query = input.trim()
  if (!containsLuceneSymbol(input)) {
    query = query.split(/ +/).join(' AND ')
    if (!input.endsWith(' ')) {
      if (query.length === 1 && !allowSingleLetterSearch) {
        query = ''
      } else if (query) {
        query += '*'
      }
    }
  }
  return query
}

// ---

/**
 * @param   size    File size in bytes.
 */
function formatFileSize (size) {
  const units = ["bytes", "KB", "MB", "GB"]
  let i
  for (i = 0; i <= 2; i++) {
    if (size < 1024) {
      return result()
    }
    size /= 1024
  }
  return result()

  function result() {
    const decimals = Math.max(i - 1, 0)
    return round(size, decimals) + " " + units[i]
  }
}

function round (val, decimals) {
  const factor = Math.pow(10, decimals)
  return Math.round(factor * val) / factor
}

function stripHtml (html) {
  return html.replace(/<.*?>/g, '')     // *? is the reluctant version of the * quantifier (which is greedy)
}

// ---

export default {
  instantiateMany,
  instantiateChildren,
  clone,
  debounce,
  mapById,
  mapByUri,
  mapByTypeUri,
  forEach,
  filter,
  isEmpty,
  getCookie,
  setCookie,
  deleteCookie,
  fulltextQuery,
  formatFileSize,
  round,
  stripHtml
}
