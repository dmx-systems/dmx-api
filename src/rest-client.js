import http from 'axios'
import utils from './utils'
import { Topic, Assoc, RelatedTopic, TopicType, AssocType, Topicmap } from './model'

export default {

  // Note: exceptions thrown in the handlers passed to then/catch are swallowed silently!
  // They do not reach the caller. Apparently they're swallowed by the ES6 Promises
  // implementation, not by axios. See Matt Zabriskie's (the author of axios) comment here:
  // https://github.com/mzabriskie/axios/issues/42
  // See also:
  // http://jamesknelson.com/are-es6-promises-swallowing-your-errors/
  //
  // As a workaround we catch here explicitly and log the error at least.
  // Note: the caller continues to work with flawed (undefined) data then!



  // === Core ===

  // Topics

  getTopic (id, includeChilds, includeAssocChilds) {
    return http.get(`/core/topic/${id}`, {params: {
      include_childs: includeChilds,
      include_assoc_childs: includeAssocChilds
    }}).then(response =>
      new Topic(response.data)
    ).catch(error => {
      console.error(error)
    })
  },

  getTopicsByType (typeUri) {
    return http.get(`/core/topic/by_type/${typeUri}`).then(response =>
      utils.instantiateMany(response.data, Topic)
    ).catch(error => {
      console.error(error)
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
    return http.get(`/core/topic/${topicId}/related_topics`, {params: _filter(filter)}).then(response =>
      utils.instantiateMany(response.data, RelatedTopic)
    ).catch(error => {
      console.error(error)
    })
  },

  searchTopics (searchTerm, typeUri) {
    const config = {params: {search: searchTerm, field: typeUri}}
    return http.get('/core/topic', config).then(response =>
      utils.instantiateMany(response.data, Topic)
    ).catch(error => {
      console.error(error)
    })
  },

  createTopic (topicModel) {
    return http.post('/core/topic', topicModel).then(response =>
      new Topic(response.data)
    ).catch(error => {
      console.error(error)
    })
  },

  updateTopic (topicModel) {
    return http.put(`/core/topic/${topicModel.id}`, topicModel).then(response =>
      response.data
    ).catch(error => {
      console.error(error)
    })
  },

  deleteTopic (id) {
    return http.delete(`/core/topic/${id}`).then(response =>
      response.data
    ).catch(error => {
      console.error(error)
    })
  },

  // Associations

  getAssoc (id, includeChilds, includeAssocChilds) {
    return http.get(`/core/association/${id}`, {params: {
      include_childs: includeChilds,
      include_assoc_childs: includeAssocChilds
    }}).then(response =>
      new Assoc(response.data)
    ).catch(error => {
      console.error(error)
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
  getAssocRelatedTopics (assocId, filter) {
    return http.get(`/core/association/${assocId}/related_topics`, {params: _filter(filter)}).then(response =>
      utils.instantiateMany(response.data, RelatedTopic)
    ).catch(error => {
      console.error(error)
    })
  },

  createAssoc (assocModel) {
    return http.post('/core/association', assocModel).then(response =>
      new Assoc(response.data)
    ).catch(error => {
      console.error(error)
    })
  },

  updateAssoc (assocModel) {
    return http.put(`/core/association/${assocModel.id}`, assocModel).then(response =>
      response.data
    ).catch(error => {
      console.error(error)
    })
  },

  deleteAssoc (id) {
    return http.delete(`/core/association/${id}`).then(response =>
      response.data
    ).catch(error => {
      console.error(error)
    })
  },

  // Topic Types

  getAllTopicTypes () {
    return http.get('/core/topictype/all').then(response =>
      utils.instantiateMany(response.data, TopicType)
    ).catch(error => {
      console.error(error)
    })
  },

  createTopicType (typeModel) {
    return http.post('/core/topictype', typeModel).then(response =>
      new TopicType(response.data)
    ).catch(error => {
      console.error(error)
    })
  },

  updateTopicType (typeModel) {
    return http.put('/core/topictype', typeModel).then(response =>
      response.data
    ).catch(error => {
      console.error(error)
    })
  },

  // Association Types

  getAllAssocTypes () {
    return http.get('/core/assoctype/all').then(response =>
      utils.instantiateMany(response.data, AssocType)
    ).catch(error => {
      console.error(error)
    })
  },

  updateAssocType (typeModel) {
    return http.put('/core/assoctype', typeModel).then(response =>
      response.data
    ).catch(error => {
      console.error(error)
    })
  },

  // Plugins

  getPlugins () {
    return http.get('/core/plugin').then(response =>
      response.data
    ).catch(error => {
      console.error(error)
    })
  },

  // WebSockets

  getWebsocketConfig () {
    return http.get('/core/websockets').then(response =>
      response.data
    ).catch(error => {
      console.error(error)
    })
  },



  // === Topicmaps ===

  createTopicmap (name, topicmapTypeUri, isPrivate) {
    return http.post('/topicmap', undefined, {
      params: {
        name,
        renderer_uri: topicmapTypeUri,
        private: isPrivate
      }
    }).then(response =>
      response.data
    ).catch(error => {
      console.error(error)
    })
  },

  getTopicmap (topicmapId) {
    return http.get(`/topicmap/${topicmapId}`).then(response =>
      new Topicmap(response.data)
    ).catch(error => {
      console.error(error)
    })
  },

  addTopicToTopicmap (topicmapId, topicId, viewProps) {
    roundPos(viewProps, 'dm4.topicmaps.x', 'dm4.topicmaps.y')
    http.post(`/topicmap/${topicmapId}/topic/${topicId}`, viewProps).catch(error => {
      console.error(error)
    })
  },

  addAssocToTopicmap (topicmapId, assocId, viewProps) {
    http.post(`/topicmap/${topicmapId}/association/${assocId}`, viewProps).catch(error => {
      console.error(error)
    })
  },

  addRelatedTopicToTopicmap (topicmapId, topicId, assocId, viewProps) {
    if (viewProps) {
      roundPos(viewProps, 'dm4.topicmaps.x', 'dm4.topicmaps.y')
    } else {
      viewProps = {}    // let axios send a proper Content-Type header
    }
    http.post(`/topicmap/${topicmapId}/topic/${topicId}/association/${assocId}`, viewProps).catch(error => {
      console.error(error)
    })
  },

  setTopicViewProps (topicmapId, topicId, viewProps) {
    // TODO: round coordinates?
    http.put(`/topicmap/${topicmapId}/topic/${topicId}`, viewProps).catch(error => {
      console.error(error)
    })
  },

  setAssocViewProps (topicmapId, assocId, viewProps) {
    http.put(`/topicmap/${topicmapId}/association/${assocId}`, viewProps).catch(error => {
      console.error(error)
    })
  },

  setTopicPosition (topicmapId, topicId, pos) {
    roundPos(pos, 'x', 'y')
    http.put(`/topicmap/${topicmapId}/topic/${topicId}/${pos.x}/${pos.y}`).catch(error => {
      console.error(error)
    })
  },

  setTopicVisibility (topicmapId, topicId, visibility) {
    http.put(`/topicmap/${topicmapId}/topic/${topicId}/${visibility}`).catch(error => {
      console.error(error)
    })
  },

  removeAssocFromTopicmap (topicmapId, assocId) {
    http.delete(`/topicmap/${topicmapId}/association/${assocId}`).catch(error => {
      console.error(error)
    })
  },



  // === Workspaces ===

  /**
   * @param   uri   optional
   */
  createWorkspace (name, uri, sharingModeUri) {
    return http.post('/workspace', undefined, {params: {name, uri, sharing_mode_uri: sharingModeUri}}).then(response =>
      response.data
    ).catch(error => {
      console.error(error)
    })
  },

  getAssignedTopics (workspaceId, topicTypeUri, includeChilds, includeAssocChilds) {
    return http.get(`/workspace/${workspaceId}/topics/${topicTypeUri}`, {params: {
      include_childs: includeChilds,
      include_assoc_childs: includeAssocChilds
    }}).then(response =>
      utils.instantiateMany(response.data, Topic)
    ).catch(error => {
      console.error(error)
    })
  },

  getAssignedWorkspace (objectId) {
    return http.get(`/workspace/object/${objectId}`).then(response =>
      new Topic(response.data)
    ).catch(error => {
      console.error(error)
    })
  },



  // === Access Control ===

  login (credentials) {
    return http.post('/accesscontrol/login', undefined, {
      auth: credentials
    })
  },

  logout () {
    return http.post('/accesscontrol/logout').catch(error => {
      console.error(error)
    })
  },

  getUsername () {
    return http.get('/accesscontrol/user').then(response =>
      response.data
    ).catch(error => {
      console.error(error)
    })
  },

  getTopicPermissions (id) {
    return http.get(`/accesscontrol/topic/${id}`).then(response =>
      response.data
    ).catch(error => {
      console.error(error)
    })
  },

  getAssocPermissions (id) {
    return http.get(`/accesscontrol/association/${id}`).then(response =>
      response.data
    ).catch(error => {
      console.error(error)
    })
  },



  // === XML ===

  getXML (url) {
    return http.get(url).then(response =>
      response.request.responseXML.documentElement
    ).catch(error => {
      console.error(error)
    })
  }
}

function _filter (filter) {
  return filter && {
    assoc_type_uri:        filter.assocTypeUri,
    my_role_type_uri:      filter.myRoleTypeUri,
    others_role_type_uri:  filter.othersRoleTypeUri,
    others_topic_type_uri: filter.othersTopicTypeUri,
  }
}

// ### TODO: drop rounding and let the backend work with floats?
function roundPos (pos, x, y) {
  pos[x] = Math.round(pos[x])
  pos[y] = Math.round(pos[y])
}
