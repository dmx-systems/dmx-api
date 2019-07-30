import http from 'axios'
import utils from './utils'
import { Topic, Assoc, RelatedTopic, TopicType, AssocType, Topicmap, Geomap } from './model'

export default {

  // === Core ===

  // Topics

  getTopic (id, includeChildren, includeAssocChildren) {
    return http.get(`/core/topic/${id}`, {params: {
      children: includeChildren,
      assoc_children: includeAssocChildren
    }}).then(response =>
      new Topic(response.data)
    )
  },

  getTopicByUri (uri, includeChildren, includeAssocChildren) {
    return http.get(`/core/topic/by_uri/${uri}`, {params: {
      children: includeChildren,
      assoc_children: includeAssocChildren
    }}).then(response =>
      new Topic(response.data)
    )
  },

  getTopicsByType (typeUri) {
    return http.get(`/core/topic/by_type/${typeUri}`).then(response =>
      utils.instantiateMany(response.data, Topic)
    )
  },

  /**
   * @param   filter
   *            Optional: 1-hop traversal filtering. An object with 4 properties (each one is optional):
   *              "assocTypeUri"
   *              "myRoleTypeUri"
   *              "othersRoleTypeUri"
   *              "othersTopicTypeUri"
   *            If not specified no filter is applied.
   */
  getTopicRelatedTopics (topicId, filter) {
    return http.get(`/core/topic/${topicId}/related_topics`, {params: _filter(filter)}).then(response =>
      utils.instantiateMany(response.data, RelatedTopic)
    )
  },

  queryTopicsFulltext (searchTerm, typeUri) {
    const config = {params: {search: searchTerm, field: typeUri}}
    return http.get('/core/topic', config).then(response =>
      utils.instantiateMany(response.data, Topic)
    )
  },

  createTopic (topicModel) {
    return http.post('/core/topic', topicModel).then(response => {
      const topic = new Topic(response.data)
      topic.directives = response.data.directives
      return topic
    })
  },

  updateTopic (topicModel) {
    return http.put(`/core/topic/${topicModel.id}`, topicModel).then(response =>
      response.data
    )
  },

  deleteTopic (id) {
    return http.delete(`/core/topic/${id}`).then(response =>
      response.data
    )
  },

  // Associations

  getAssoc (id, includeChildren, includeAssocChildren) {
    return http.get(`/core/association/${id}`, {params: {
      children: includeChildren,
      assoc_children: includeAssocChildren
    }}).then(response =>
      new Assoc(response.data)
    )
  },

  /**
   * @param   filter
   *            Optional: 1-hop traversal filtering. An object with 4 properties (each one is optional):
   *              "assocTypeUri"
   *              "myRoleTypeUri"
   *              "othersRoleTypeUri"
   *              "othersTopicTypeUri"
   *            If not specified no filter is applied.
   */
  getAssocRelatedTopics (assocId, filter) {
    return http.get(`/core/association/${assocId}/related_topics`, {params: _filter(filter)}).then(response =>
      utils.instantiateMany(response.data, RelatedTopic)
    )
  },

  createAssoc (assocModel) {
    return http.post('/core/association', assocModel).then(response => {
      const assoc = new Assoc(response.data)
      assoc.directives = response.data.directives
      return assoc
    })
  },

  updateAssoc (assocModel) {
    return http.put(`/core/association/${assocModel.id}`, assocModel).then(response =>
      response.data
    )
  },

  deleteAssoc (id) {
    return http.delete(`/core/association/${id}`).then(response =>
      response.data
    )
  },

  // Object

  getRelatedTopicsWithoutChilds (objectId) {
    return http.get(`/core/object/${objectId}/related_topics`).then(response =>
      utils.instantiateMany(response.data, RelatedTopic)
    )
  },

  // Multi Topic/Assoc

  deleteMulti (idLists) {
    return http.delete('/core' + toPath(idLists)).then(response =>
      response.data
    )
  },

  // Topic Types

  getAllTopicTypes () {
    return http.get('/core/topictype/all').then(response =>
      utils.instantiateMany(response.data, TopicType)
    )
  },

  createTopicType (typeModel) {
    return http.post('/core/topictype', typeModel).then(response =>
      new TopicType(response.data)
    )
  },

  updateTopicType (typeModel) {
    return http.put('/core/topictype', typeModel).then(response =>
      response.data
    )
  },

  // Association Types

  getAllAssocTypes () {
    return http.get('/core/assoctype/all').then(response =>
      utils.instantiateMany(response.data, AssocType)
    )
  },

  createAssocType (typeModel) {
    return http.post('/core/assoctype', typeModel).then(response =>
      new AssocType(response.data)
    )
  },

  updateAssocType (typeModel) {
    return http.put('/core/assoctype', typeModel).then(response =>
      response.data
    )
  },

  // Role Types

  createRoleType (topicModel) {
    return http.post('/core/roletype', topicModel).then(response =>
      new Topic(response.data)
    )
  },

  // Plugins

  getPlugins () {
    return http.get('/core/plugin').then(response =>
      response.data
    )
  },

  // WebSockets

  getWebsocketConfig () {
    return http.get('/core/websockets').then(response =>
      response.data
    )
  },

  // === Topicmaps ===

  createTopicmap (name, topicmapTypeUri, viewProps) {
    return http.post('/topicmap', viewProps, {
      params: {
        name,
        topicmap_type_uri: topicmapTypeUri
      }
    }).then(response =>
      new Topic(response.data)
    )
  },

  getTopicmap (topicmapId) {
    return http.get(`/topicmap/${topicmapId}`).then(response =>
      new Topicmap(response.data)
    )
  },

  getTopicmapTopics (objectId) {
    return http.get(`/topicmap/object/${objectId}`).then(response =>
      utils.instantiateMany(response.data, RelatedTopic)
    )
  },

  addTopicToTopicmap (topicmapId, topicId, viewProps) {
    roundPos(viewProps, 'dmx.topicmaps.x', 'dmx.topicmaps.y')
    http.post(`/topicmap/${topicmapId}/topic/${topicId}`, viewProps)
  },

  addAssocToTopicmap (topicmapId, assocId, viewProps) {
    http.post(`/topicmap/${topicmapId}/association/${assocId}`, viewProps)
  },

  /**
   * @param   viewProps   the topic view props to send; if undefined no props are sent
   */
  addRelatedTopicToTopicmap (topicmapId, topicId, assocId, viewProps) {
    if (viewProps) {
      roundPos(viewProps, 'dmx.topicmaps.x', 'dmx.topicmaps.y')
    } else {
      viewProps = {}    // let axios send a proper Content-Type header
    }
    http.post(`/topicmap/${topicmapId}/topic/${topicId}/association/${assocId}`, viewProps)
  },

  setTopicViewProps (topicmapId, topicId, viewProps) {
    // TODO: round coordinates?
    http.put(`/topicmap/${topicmapId}/topic/${topicId}`, viewProps)
  },

  setAssocViewProps (topicmapId, assocId, viewProps) {
    http.put(`/topicmap/${topicmapId}/association/${assocId}`, viewProps)
  },

  // Note: no debounce here; consecutive calls might relate to *different* topics
  setTopicPosition (topicmapId, topicId, pos) {
    roundPos(pos, 'x', 'y')
    http.put(`/topicmap/${topicmapId}/topic/${topicId}/${pos.x}/${pos.y}`)
  },

  // Note: no debounce here; consecutive calls might relate to *different* topic collections
  /**
   * @param   topicCoords    array of 3-prop objects: 'topicId', 'x', 'y'
   */
  setTopicPositions (topicmapId, topicCoords) {
    roundPos(topicCoords, 'x', 'y')
    http.put(`/topicmap/${topicmapId}`, {topicCoords})
  },

  setTopicVisibility (topicmapId, topicId, visibility) {
    http.put(`/topicmap/${topicmapId}/topic/${topicId}/${visibility}`)
  },

  // TODO: setAssocVisibility()? Actually not needed by DMX webclient.

  hideMulti (topicmapId, idLists) {
    http.put(`/topicmap/${topicmapId}${toPath(idLists)}/visibility/false`)
  },

  setTopicmapViewport: utils.debounce((topicmapId, pan, zoom) => {
    // console.log('setTopicmapViewport')
    roundPos(pan, 'x', 'y')
    http.put(`/topicmap/${topicmapId}/pan/${pan.x}/${pan.y}/zoom/${zoom}`)
  }, 3000),

  // === Geomaps ===

  getGeomap (geomapId) {
    return http.get(`/geomap/${geomapId}`).then(response =>
      new Geomap(response.data)
    )
  },

  getDomainTopics (geoCoordId, includeChildren, includeAssocChildren) {
    return http.get(`/geomap/coord/${geoCoordId}`, {params: {
      children: includeChildren,
      assoc_children: includeAssocChildren
    }}).then(response =>
      utils.instantiateMany(response.data, Topic)
    )
  },

  setGeomapState: utils.debounce((geomapId, lon, lat, zoom) => {
    console.log('setGeomapState', lon, lat, zoom)
    http.put(`/geomap/${geomapId}/center/${lon}/${lat}/zoom/${zoom}`)
  }, 3000),

  // === Workspaces ===

  /**
   * @param   uri   optional
   */
  createWorkspace (name, uri, sharingModeUri) {
    return http.post('/workspace', undefined, {
      params: {
        name,
        uri,
        sharing_mode_uri: sharingModeUri
      }
    }).then(response =>
      response.data
    )
  },

  getAssignedTopics (workspaceId, topicTypeUri, includeChildren, includeAssocChildren) {
    return http.get(`/workspace/${workspaceId}/topics/${topicTypeUri}`, {params: {
      children: includeChildren,
      assoc_children: includeAssocChildren
    }}).then(response =>
      utils.instantiateMany(response.data, Topic)
    )
  },

  /**
   * @return  the workspace topic, or empty string if no workspace is assigned
   */
  getAssignedWorkspace (objectId) {
    return http.get(`/workspace/object/${objectId}`).then(response =>
      // Note: if no workspace is assigned the response is 204 No Content; "data" is the empty string then
      response.data && new Topic(response.data)
    )
  },

  // === Access Control ===

  /**
   * @param   credentials   object with 'username' and 'password' props
   */
  login (credentials, authMethod = 'Basic') {
    return http.post('/accesscontrol/login', undefined, {
      headers: {
        'Authorization': authMethod + ' ' + btoa(credentials.username + ':' + credentials.password)
      }
    })
  },

  logout () {
    return http.post('/accesscontrol/logout')
  },

  getUsername () {
    return http.get('/accesscontrol/user').then(response =>
      response.data
    )
  },

  getTopicPermissions (id) {
    return http.get(`/accesscontrol/topic/${id}`).then(response =>
      response.data
    )
  },

  getAssocPermissions (id) {
    return http.get(`/accesscontrol/association/${id}`).then(response =>
      response.data
    )
  },

  getCreator (id) {
    return http.get(`/accesscontrol/object/${id}/creator`).then(response =>
      response.data
    )
  },

  getModifier (id) {
    return http.get(`/accesscontrol/object/${id}/modifier`).then(response =>
      response.data
    )
  },

  getWorkspaceOwner (id) {
    return http.get(`/accesscontrol/workspace/${id}/owner`).then(response =>
      response.data
    )
  },

  getAuthorizationMethods () {
    return http.get('/accesscontrol/methods').then(response =>
      response.data
    )
  },

  /**
   * @param   password   expected to be SHA256 encoded
   *
   * @return  a promise for a Username topic
   */
  createUserAccount (username, password) {
    return http.post('/accesscontrol/user_account', {
      username, password
    }).then(response =>
      new Topic(response.data)
    )
  },

  // === Timestamps ===

  getCreationTime (id) {
    return http.get(`/timestamps/object/${id}/created`).then(response =>
      response.data
    )
  },

  getModificationTime (id) {
    return http.get(`/timestamps/object/${id}/modified`).then(response =>
      response.data
    )
  },

  // === XML ===

  getXML (url) {
    return http.get(url).then(response =>
      response.request.responseXML.documentElement
    )
  },

  // === Error Handling ===

  setErrorHandler (onHttpError) {
    http.interceptors.response.use(
      response => response,
      error => {
        onHttpError(error)
        return Promise.reject(error)
      }
    )
  }
}

function toPath(idLists) {
  let path = ''
  if (idLists.topicIds.length) {
    path += `/topics/${idLists.topicIds}`
  }
  if (idLists.assocIds.length) {
    path += `/assocs/${idLists.assocIds}`
  }
  return path
}

function _filter (filter) {
  return filter && {
    assoc_type_uri:        filter.assocTypeUri,
    my_role_type_uri:      filter.myRoleTypeUri,
    others_role_type_uri:  filter.othersRoleTypeUri,
    others_topic_type_uri: filter.othersTopicTypeUri,
  }
}

/**
 * @param   pos   an object or an array of objects
 */
function roundPos (pos, x, y) {
  if (Array.isArray(pos)) {
    pos.forEach(pos => _roundPos(pos, x, y))
  } else {
    _roundPos(pos, x, y)
  }
}

/**
 * @param   pos   an object
 */
function _roundPos (pos, x, y) {
  pos[x] = Math.round(pos[x])
  pos[y] = Math.round(pos[y])
}
