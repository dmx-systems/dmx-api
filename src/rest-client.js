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

  getTopic (id, includeChilds) {
    const config = {params: {include_childs: includeChilds}}
    return http.get(`/core/topic/${id}`, config).then(response =>
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
   * @param   traversalFilter
   *            Optional: Traversal Filtering.
   *            An object with 4 properties (each one is optional):
   *              "assocTypeUri"
   *              "myRoleTypeUri"
   *              "othersRoleTypeUri"
   *              "othersTopicTypeUri"
   *            If not specified no filter is applied.
   */
  getTopicRelatedTopics (topicId, traversalFilter) {
    var params = traversalFilter && {
      assoc_type_uri:        traversalFilter.assocTypeUri,
      my_role_type_uri:      traversalFilter.myRoleTypeUri,
      others_role_type_uri:  traversalFilter.othersRoleTypeUri,
      others_topic_type_uri: traversalFilter.othersTopicTypeUri,
    }
    return http.get(`/core/topic/${topicId}/related_topics`, {params}).then(response =>
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

  // Associations

  getAssoc (id, includeChilds) {
    const config = {params: {include_childs: includeChilds}}
    return http.get(`/core/association/${id}`, config).then(response =>
      new Assoc(response.data)
    ).catch(error => {
      console.error(error)
    })
  },

  // Types

  getAllTopicTypes () {
    return http.get('/core/topictype/all').then(response =>
      utils.instantiateMany(response.data, TopicType)
    ).catch(error => {
      console.error(error)
    })
  },

  getAllAssocTypes () {
    return http.get('/core/assoctype/all').then(response =>
      utils.instantiateMany(response.data, AssocType)
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

  getTopicmap (topicmapId) {
    return http.get(`/topicmap/${topicmapId}`).then(response =>
      new Topicmap(response.data)
    ).catch(error => {
      console.error(error)
    })
  },

  addTopicToTopicmap (topicmapId, topicId, viewProps) {
    // ### TODO: drop rounding and let the backend work with floats?
    viewProps['dm4.topicmaps.x'] = Math.round(viewProps['dm4.topicmaps.x'])
    viewProps['dm4.topicmaps.y'] = Math.round(viewProps['dm4.topicmaps.y'])
    //
    http.post(`/topicmap/${topicmapId}/topic/${topicId}`, viewProps).catch(error => {
      console.error(error)
    })
  },

  addAssocToTopicmap (topicmapId, assocId) {
    http.post(`/topicmap/${topicmapId}/association/${assocId}`).catch(error => {
      console.error(error)
    })
  },

  setTopicPosition (topicmapId, topicId, pos) {
    // ### TODO: drop rounding and let the backend work with floats?
    pos.x = Math.round(pos.x)
    pos.y = Math.round(pos.y)
    //
    http.put(`/topicmap/${topicmapId}/topic/${topicId}/${pos.x}/${pos.y}`).catch(error => {
      console.error(error)
    })
  },



  // === Access Control ===

  getUsername () {
    return http.get("/accesscontrol/user").then(response =>
      response.data
    ).catch(error => {
      console.error(error)
    })
  },

  login (credentials) {
    return http.post("/accesscontrol/login", undefined, {
      auth: credentials
    })
  },

  logout () {
    http.post("/accesscontrol/logout").catch(error => {
      console.error(error)
    })
  }
}
