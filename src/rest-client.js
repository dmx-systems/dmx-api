import http from 'axios'
import permCache  from './permission-cache'
import utils from './utils'
import { Topic, Assoc, RelatedTopic, TopicType, AssocType, Topicmap } from './model'

// Vanilla instance without error interceptor.
// In contrast the default http instance allows the caller to set an error handler (see setErrorHandler()).
const _http = http.create()

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
    return http.get(`/core/topic/uri/${uri}`, {params: {
      children: includeChildren,
      assoc_children: includeAssocChildren
    }}).then(response =>
      new Topic(response.data)    // FIXME: no result
    )
  },

  getTopicsByType (typeUri) {
    return http.get(`/core/topics/type/${typeUri}`).then(response =>
      utils.instantiateMany(response.data, Topic)
    )
  },

  getTopicByValue (typeUri, value) {
    return http.get(`/core/topic/type/${typeUri}/${value}`).then(response =>
      new Topic(response.data)    // FIXME: no result
    )
  },

  getTopicsByValue (typeUri, value) {
    return http.get(`/core/topics/type/${typeUri}/${value}`).then(response =>
      utils.instantiateMany(response.data, Topic)
    )
  },

  queryTopics (typeUri, value) {
    return http.get(`/core/topics/type/${typeUri}/query/${value}`).then(response =>
      utils.instantiateMany(response.data, Topic)
    )
  },

  /**
   * Performs a fulltext search.
   *
   * @param   query               A Lucene search query.
   * @param   topicTypeUri        Optional: only topics of this type are searched. If not given (falsish) all topics are
   *                              searched.
   * @param   searchChildTopics   Optional: if true the topic's child topics are searched as well. Works only if
   *                              "topicTypeUri" is given.
   */
  queryTopicsFulltext (query, topicTypeUri, searchChildTopics) {
    // suppress error handler as for incremental search the query might be (temporarily) syntactically incorrect
    const params = {topic_type_uri: topicTypeUri, search_child_topics: searchChildTopics}
    return _http.get(`/core/topics/query/${query}`, {params}).then(response => {
      const {query, topicTypeUri, searchChildTopics, topics} = response.data
      return {
        query, topicTypeUri, searchChildTopics,
        topics: utils.instantiateMany(topics, Topic)
      }
    })
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
    return http.get(`/core/topic/${topicId}/related-topics`, {params: _filter(filter)}).then(response =>
      utils.instantiateMany(response.data, RelatedTopic)
    )
  },

  // TODO: add getTopicRelatedAssocs()

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
    return http.get(`/core/assoc/${id}`, {params: {
      children: includeChildren,
      assoc_children: includeAssocChildren
    }}).then(response =>
      new Assoc(response.data)
    )
  },

  // TODO: add missing assoc Core Service calls e.g. getAssocByValue(), queryAssocs(), ...

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
    return http.get(`/core/assoc/${assocId}/related-topics`, {params: _filter(filter)}).then(response =>
      utils.instantiateMany(response.data, RelatedTopic)
    )
  },

  // TODO: add getAssocRelatedAssocs()

  createAssoc (assocModel) {
    return http.post('/core/assoc', assocModel).then(response => {
      const assoc = new Assoc(response.data)
      assoc.directives = response.data.directives
      return assoc
    })
  },

  updateAssoc (assocModel) {
    return http.put(`/core/assoc/${assocModel.id}`, assocModel).then(response =>
      response.data
    )
  },

  deleteAssoc (id) {
    return http.delete(`/core/assoc/${id}`).then(response =>
      response.data
    )
  },

  // Object

  getRelatedTopicsWithoutChilds (objectId) {
    return http.get(`/core/object/${objectId}/related-topics`).then(response =>
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
    return http.get('/core/plugins').then(response =>
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
    return http.post('/topicmaps', viewProps, {
      params: {
        name,
        topicmap_type_uri: topicmapTypeUri
      }
    }).then(response =>
      new Topic(response.data)
    )
  },

  getTopicmap (topicmapId) {
    return http.get(`/topicmaps/${topicmapId}`).then(response =>
      new Topicmap(response.data)
    )
  },

  getTopicmapTopics (objectId) {
    return http.get(`/topicmaps/object/${objectId}`).then(response =>
      utils.instantiateMany(response.data, RelatedTopic)
    )
  },

  addTopicToTopicmap (topicmapId, topicId, viewProps) {
    roundPos(viewProps, 'dmx.topicmaps.x', 'dmx.topicmaps.y')
    http.post(`/topicmaps/${topicmapId}/topic/${topicId}`, viewProps)
  },

  addAssocToTopicmap (topicmapId, assocId, viewProps) {
    http.post(`/topicmaps/${topicmapId}/assoc/${assocId}`, viewProps)
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
    http.post(`/topicmaps/${topicmapId}/topic/${topicId}/assoc/${assocId}`, viewProps)
  },

  setTopicViewProps (topicmapId, topicId, viewProps) {
    // TODO: round coordinates?
    http.put(`/topicmaps/${topicmapId}/topic/${topicId}`, viewProps)
  },

  setAssocViewProps (topicmapId, assocId, viewProps) {
    http.put(`/topicmaps/${topicmapId}/assoc/${assocId}`, viewProps)
  },

  // Note: no debounce here; consecutive calls might relate to *different* topics
  setTopicPosition (topicmapId, topicId, pos) {
    roundPos(pos, 'x', 'y')
    http.put(`/topicmaps/${topicmapId}/topic/${topicId}/x/${pos.x}/y/${pos.y}`)
  },

  // Note: no debounce here; consecutive calls might relate to *different* topic collections
  /**
   * @param   topicCoords    array of 3-prop objects: 'topicId', 'x', 'y'
   */
  setTopicPositions (topicmapId, topicCoords) {
    roundPos(topicCoords, 'x', 'y')
    http.put(`/topicmaps/${topicmapId}`, {topicCoords})
  },

  setTopicVisibility (topicmapId, topicId, visibility) {
    http.put(`/topicmaps/${topicmapId}/topic/${topicId}/visibility/${visibility}`)
  },

  // TODO: setAssocVisibility()? Actually not needed by DMX webclient.

  hideMulti (topicmapId, idLists) {
    http.put(`/topicmaps/${topicmapId}${toPath(idLists)}/visibility/false`)
  },

  setTopicmapViewport: utils.debounce((topicmapId, pan, zoom) => {
    // console.log('setTopicmapViewport')
    roundPos(pan, 'x', 'y')
    http.put(`/topicmaps/${topicmapId}/pan/${pan.x}/${pan.y}/zoom/${zoom}`)
  }, 3000),

  // === Workspaces ===

  /**
   * @param   uri   optional
   */
  createWorkspace (name, uri, sharingModeUri) {
    return http.post('/workspaces', undefined, {
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
    return http.get(`/workspaces/${workspaceId}/topics/${topicTypeUri}`, {params: {
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
    return http.get(`/workspaces/object/${objectId}`).then(response =>
      // Note: if no workspace is assigned the response is 204 No Content; "data" is the empty string then
      response.data && new Topic(response.data)
    )
  },

  assignToWorkspace (objectId, workspaceId) {
    http.put(`/workspaces/${workspaceId}/object/${objectId}`)
  },


  // === Access Control ===

  /**
   * @param   credentials   object with 'username' and 'password' props
   */
  login (credentials, authMethod = 'Basic') {
    // suppress error handler as the client application is supposed to present the error to the user specially
    return _http.post('/accesscontrol/login', undefined, {
      headers: {
        'Authorization': authMethod + ' ' + btoa(credentials.username + ':' + credentials.password)
      }
    }).then(() => permCache.clear())
  },

  logout () {
    return http.post('/accesscontrol/logout')
      .then(() => permCache.clear())
  },

  getUsername () {
    return http.get('/accesscontrol/user').then(response =>
      response.data
    )
  },

  getPrivateWorkspace () {
    return http.get(`/accesscontrol/user/workspace`).then(response =>
      new Topic(response.data)
    )
  },

  getWorkspaceOwner (id) {
    return http.get(`/accesscontrol/workspace/${id}/owner`).then(response =>
      response.data
    )
  },

  getTopicPermissions (id) {
    return http.get(`/accesscontrol/topic/${id}`).then(response =>
      response.data
    )
  },

  getAssocPermissions (id) {
    return http.get(`/accesscontrol/assoc/${id}`).then(response =>
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
