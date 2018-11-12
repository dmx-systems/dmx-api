import restClient from './rest-client'
import typeCache from './type-cache'
import permCache from './permission-cache'
import utils from './utils'
import Vue from 'vue'

// TODO: inject or factor out
const DEFAULT_TOPIC_ICON = '\uf111'
const DEFAULT_ASSOC_COLOR = 'hsl(0, 0%, 80%)'     // matches dm5-color-picker gray

class DeepaMehtaObject {

  constructor (object) {
    if (object.constructor.name !== 'Object') {
      throw Error(`DeepaMehtaObject constructor expects plain Object, got ${object.constructor.name} (${object})`)
    }
    this.id      = object.id
    this.uri     = object.uri
    this.typeUri = object.typeUri
    this.value   = object.value
    this.childs  = utils.instantiateChilds(object.childs)
  }

  get typeName () {
    return this.getType().value
  }

  // TODO: drop it
  getChildTopic (assocDefUri) {
    return this.childs[assocDefUri]
  }

  /**
   * Operates in-place
   *
   * @return    this object
   */
  fillChilds () {
    this.getType().assocDefs.forEach(assocDef => {
      let childs = this.childs[assocDef.assocDefUri]
      let child
      if (!childs) {
        // Note: child instantiation is done by the Topic constructor (recursively)
        child = new Topic(assocDef.getChildType().emptyInstance())
      }
      if (assocDef.isOne()) {
        if (childs) {
          childs.fillChilds()
        } else {
          childs = child
        }
        childs.fillRelatingAssoc(assocDef)
      } else {
        if (childs) {
          childs.forEach(child => {
            child.fillChilds()
          })
        } else {
          childs = [child]
        }
        childs.forEach(child => {
          child.fillRelatingAssoc(assocDef)
        })
      }
      if (child) {
        // Note: this object might be on display. Setting the childs must be reactive.
        // this.childs[assocDef.assocDefUri] = childs
        Vue.set(this.childs, assocDef.assocDefUri, childs)
      }
    })
    return this
  }

  clone () {
    return utils.clone(this)
  }
}

class Topic extends DeepaMehtaObject {

  constructor (topic) {
    super(topic)
    // relating assoc
    if (topic.assoc) {
      this.assoc = new Assoc(topic.assoc)
    }
  }

  // ---

  // TODO: make it a "type" getter?
  getType () {
    return typeCache.getTopicType(this.typeUri)
  }

  isType () {
    // TODO: meta type?
    return this.typeUri === 'dmx.core.topic_type' ||
           this.typeUri === 'dmx.core.assoc_type'
  }

  getRelatedTopics () {
    return restClient.getTopicRelatedTopics(this.id)
  }

  update () {
    console.log('update', this)
    return restClient.updateTopic(this)
  }

  /**
   * @return  a promise for a true/false value
   */
  isWritable () {
    return permCache.isTopicWritable(this.id)
  }

  isTopic () {
    return true
  }

  isAssoc () {
    return false
  }

  newViewTopic (viewProps) {
    return new ViewTopic({
      id:      this.id,
      uri:     this.uri,
      typeUri: this.typeUri,
      value:   this.value,
      childs: {},     // TODO: childs needed in a ViewTopic?
      viewProps: viewProps
    })
  }

  // ---

  asType () {
    if (this.typeUri === 'dmx.core.topic_type') {
      return typeCache.getTopicType(this.uri)
    } else if (this.typeUri === 'dmx.core.assoc_type') {
      return typeCache.getAssocType(this.uri)
    } else {
      throw Error(`Not a type: ${this}`)
    }
  }

  getIcon () {
    return this.getType().getIcon() || DEFAULT_TOPIC_ICON
  }

  fillRelatingAssoc (assocDef) {
    if (this.assoc) {
      this.assoc.fillChilds()
    } else {
      this.assoc = new Assoc(assocDef.getInstanceLevelAssocType().emptyInstance())
      // Note: reactivity seems not be an issue here. I don't know why.
      // Vue.set(this, 'assoc', new Assoc(assocDef.getInstanceLevelAssocType().emptyInstance()))
    }
  }
}

class Assoc extends DeepaMehtaObject {

  constructor (assoc) {
    super(assoc)
    // Note: for update models the roles are optional.
    // Compare to ModelFactoryImpl.newAssociationModel(JSONObject assoc).
    if (assoc.role1) {
      this.role1 = new AssocRole(assoc.role1)
    }
    if (assoc.role2) {
      this.role2 = new AssocRole(assoc.role2)
    }
  }

  // ---

  getRole (roleTypeUri) {
    var match1 = this.role1.roleTypeUri === roleTypeUri
    var match2 = this.role2.roleTypeUri === roleTypeUri
    if (match1 && match2) {
      throw Error(`Both role types of association ${this.id} match ${roleTypeUri}`)
    }
    return match1 ? this.role1 : match2 ? this.role2 : undefined
  }

  isTopicPlayer (topicId) {
    return this.role1.topicId === topicId || this.role2.topicId === topicId
  }

  hasAssocPlayer () {
    return this.role1.hasAssocPlayer() || this.role2.hasAssocPlayer()
  }

  // ---

  getType () {
    return typeCache.getAssocType(this.typeUri)
  }

  isType () {
    return false    // assocs are never types
  }

  getRelatedTopics () {
    return restClient.getAssocRelatedTopics(this.id)
  }

  update () {
    console.log('update', this)
    return restClient.updateAssoc(this)
  }

  /**
   * @return  a promise for a true/false value
   */
  isWritable () {
    return permCache.isAssocWritable(this.id)
  }

  isTopic () {
    return false
  }

  isAssoc () {
    return true
  }

  newViewAssoc (viewProps) {
    return new ViewAssoc({
      id:      this.id,
      uri:     this.uri,
      typeUri: this.typeUri,
      value:   this.value,
      childs: {},     // TODO: childs needed in a ViewTopic?
      role1:   this.role1,
      role2:   this.role2,
      viewProps: viewProps
    })
  }

  getColor () {
    return this.getType().getColor() || DEFAULT_ASSOC_COLOR
  }
}

// TODO: rename to "AssocPlayer", "Player"?
class AssocRole {

  constructor (role) {
    this.topicId     = role.topicId
    this.topicUri    = role.topicUri
    this.assocId     = role.assocId
    this.roleTypeUri = role.roleTypeUri
  }

  // TODO: rename to "getRoleType"?
  getType () {
    return typeCache.getRoleType(this.roleTypeUri)
  }

  // TODO: rename to "roleTypeName"?
  get typeName () {
    return this.getType().value
  }

  // TODO: rename to "isAssocPlayer"?
  hasAssocPlayer () {
    return this.assocId
  }

  // TODO: rename to "getId"?
  getPlayerId () {
    if (this.hasAssocPlayer()) {
      return this.assocId
    } else if (this.topicId !== undefined) {
      return this.topicId
    } else {
      throw Error('getPlayerId() called when a topic player is specified by URI')
    }
  }

  // TODO: rename to "fetch"?
  getPlayer () {
    if (!this.topicId) {
      throw Error(`Assoc role ${JSON.stringify(this)} has no topic player`)
    }
    return restClient.getTopic(this.topicId)
  }
}

class RelatedTopic extends Topic {
  constructor (topic) {
    super(topic)
    this.assoc = new Assoc(topic.assoc)
  }
}

class Type extends Topic {

  constructor (type) {
    super(type)
    this.dataTypeUri = type.dataTypeUri
    this.indexModes  = type.indexModeUris                                                         // TODO: rename prop?
    this.assocDefs   = utils.instantiateMany(type.assocDefs, AssocDef)
    this.viewConfig  = utils.mapByTypeUri(utils.instantiateMany(type.viewConfigTopics, Topic))    // TODO: rename prop?
  }

  isSimple () {
    return ['dmx.core.text', 'dmx.core.html', 'dmx.core.number', 'dmx.core.boolean'].includes(this.dataTypeUri)
  }

  isComposite () {
    return this.isValue() || this.isIdentity()
  }

  isValue () {
    return this.dataTypeUri === 'dmx.core.value'
  }

  isIdentity () {
    return this.dataTypeUri === 'dmx.core.identity'
  }

  getDataType () {
    return typeCache.getDataType(this.dataTypeUri)
  }

  getIdentityAssocDefs () {
    // If no identity attribute is defined the first assoc def (if exists) is regarded identity
    // ### TODO: drop this fallback. See #70.
    // Without it e.g. in a Person form the "Phone Label" and "Address Label" fields would not
    // appear unless they are declared as identity attributes.
    const assocDefs = this.assocDefs.filter(assocDef => assocDef.isIdentityAttr)
    return assocDefs.length ? assocDefs : this.assocDefs.length ? [this.assocDefs[0]] : []
  }

  // ### TODO: copy in AssocDef
  getViewConfig (childTypeUri) {
    // TODO: don't hardcode config type URI
    const configTopic = this.viewConfig['dmx.webclient.view_config']
    if (!configTopic) {
      // console.warn(`Type "${this.uri}" has no view config`)
      return
    }
    const topic = configTopic.childs[childTypeUri]
    return topic && topic.value
  }

  /**
   * @returns   a plain object.
   */
  emptyInstance () {

    const emptyChilds = () => {
      const childs = {}
      this.assocDefs.forEach(assocDef => {
        const child = assocDef.getChildType().emptyInstance()
        childs[assocDef.assocDefUri] = assocDef.isOne() ? child : [child]
      })
      return childs
    }

    return {
      id: -1,
      uri: '',
      typeUri: this.uri,
      value: '',
      childs: emptyChilds()
    }
  }

  toExternalForm () {
    const type = JSON.parse(JSON.stringify(this))
    type.assocDefs.forEach(assocDef => {
      assocDef.assocTypeUri = assocDef.typeUri
      delete assocDef.typeUri
    })
    console.log('toExternalForm', type)
    return type
  }
}

class TopicType extends Type {

  newTopicModel (simpleValue) {

    const topic = _newTopicModel(this.uri)
    topic.typeUri = this.uri
    return topic

    function _newTopicModel (typeUri) {
      const type = typeCache.getTopicType(typeUri)
      if (type.isSimple()) {
        return {
          value: simpleValue
        }
      } else {
        const assocDef = type.assocDefs[0]
        const child = _newTopicModel(assocDef.childTypeUri)
        return {
          childs: {
            [assocDef.assocDefUri]: assocDef.isOne() ? child : [child]
          }
        }
      }
    }
  }

  getIcon () {
    return this.getViewConfig('dmx.webclient.icon')
  }

  update () {
    return restClient.updateTopicType(this.toExternalForm())
  }
}

class AssocType extends Type {

  getColor () {
    return this.getViewConfig('dmx.webclient.color')
  }

  update () {
    return restClient.updateAssocType(this.toExternalForm())
  }
}

class AssocDef extends Assoc {

  constructor (assocDef) {
    super(assocDef)
    this.viewConfig = utils.mapByTypeUri(utils.instantiateMany(assocDef.viewConfigTopics, Topic))  // TODO: rename prop?
    //
    // derived properties
    //
    this.parentTypeUri = this.getRole('dmx.core.parent_type').topicUri
    this.childTypeUri  = this.getRole('dmx.core.child_type').topicUri
    //
    const customAssocType = this.childs['dmx.core.assoc_type#dmx.core.custom_assoc_type']
    this.customAssocTypeUri = customAssocType && customAssocType.uri    // may be undefined
    this.assocDefUri = this.childTypeUri + (this.customAssocTypeUri ? "#" + this.customAssocTypeUri : "")
    this.instanceLevelAssocTypeUri = this.customAssocTypeUri || this._defaultInstanceLevelAssocTypeUri()
    //
    const cardinality = this.childs['dmx.core.cardinality']
    if (cardinality) {
      this.childCardinalityUri = cardinality.uri
    } else {
      throw Error(`Assoc def ${this.assocDefUri} has no cardinality child (parent type: ${this.parentTypeUri})`)
    }
    //
    const isIdentityAttr = this.childs['dmx.core.identity_attr']
    if (isIdentityAttr) {
      this.isIdentityAttr = isIdentityAttr.value
    } else {
      // ### TODO: should an isIdentityAttr child always exist?
      // console.warn(`Assoc def ${this.assocDefUri} has no identity_attr child (parent type: ${this.parentTypeUri})`)
      this.isIdentityAttr = false
    }
    //
    const includeInLabel = this.childs['dmx.core.include_in_label']
    if (includeInLabel) {
      this.includeInLabel = includeInLabel.value
    } else {
      // ### TODO: should an includeInLabel child always exist?
      //console.warn(`Assoc def ${this.assocDefUri} has no include_in_label child (parent type: ${this.parentTypeUri})`)
      this.includeInLabel = false
    }
  }

  // TODO: make these 5 derived properties?

  getChildType () {
    return typeCache.getTopicType(this.childTypeUri)
  }

  getInstanceLevelAssocType () {
    return typeCache.getAssocType(this.instanceLevelAssocTypeUri)
  }

  /**
   * Returns the custom assoc type (a dm5.AssocType object), or undefined if no one is set.
   */
  getCustomAssocType () {
    return this.customAssocTypeUri && typeCache.getAssocType(this.customAssocTypeUri)
  }

  isOne () {
    return this.childCardinalityUri === 'dmx.core.one'
  }

  isMany () {
    return this.childCardinalityUri === 'dmx.core.many'
  }

  // ---

  getViewConfig (childTypeUri) {
    const topic = this._getViewConfig(childTypeUri)
    return topic && topic.value
  }

  // ### TODO: principal copy in Type
  _getViewConfig (childTypeUri) {
    // TODO: don't hardcode config type URI
    const configTopic = this.viewConfig['dmx.webclient.view_config']
    if (!configTopic) {
      // console.warn(`Type "${this.uri}" has no view config`)
      return
    }
    return configTopic.childs[childTypeUri]
  }

  // TODO: a getViewConfig() form that falls back to the child type view config?

  _defaultInstanceLevelAssocTypeUri () {
    if (this.typeUri === 'dmx.core.composition_def') {
      return 'dmx.core.composition';
    } else {
      throw Error(`Unexpected association type URI: "${this.typeUri}"`);
    }
  }

  emptyChildInstance () {
    const topic = this.getChildType().emptyInstance()
    topic.assoc = this.getInstanceLevelAssocType().emptyInstance()
    return new Topic(topic)
  }
}

class Topicmap extends Topic {

  constructor (topicmap) {
    super(topicmap.info)
    this.topics = utils.mapById(utils.instantiateMany(topicmap.topics, ViewTopic))  // map: ID -> dm5.ViewTopic
    this.assocs = utils.mapById(utils.instantiateMany(topicmap.assocs, ViewAssoc))  // map: ID -> dm5.ViewAssoc
  }

  // Topics

  getTopic (id) {
    var topic = this.getTopicIfExists(id)
    if (!topic) {
      throw Error(`Topic ${id} not found in topicmap ${this.id}`)
    }
    return topic
  }

  getTopicIfExists (id) {
    return this.topics[id]
  }

  hasTopic (id) {
    return this.getTopicIfExists(id)
  }

  /**
   * @param   topic   a dm5.ViewTopic
   */
  addTopic (topic) {
    if (!(topic instanceof ViewTopic)) {
      throw Error(`addTopic() expects a ViewTopic, got ${topic.constructor.name}`)
    }
    // reactivity is required to trigger "visibleTopicIds" getter (module dm5-cytoscape-renderer)
    Vue.set(this.topics, topic.id, topic)
  }

  /**
   * @param   topic   a dm5.Topic
   * @param   pos     Optional: the topic position (an object with "x", "y" properties).
   *                  If not given it's up to the topicmap renderer to position the topic.
   */
  revealTopic (topic, pos) {
    const op = {}
    const viewTopic = this.getTopicIfExists(topic.id)
    if (!viewTopic) {
      const viewProps = {
        ...pos ? {
          'dmx.topicmaps.x': pos.x,
          'dmx.topicmaps.y': pos.y
        } : undefined,
        'dmx.topicmaps.visibility': true,
        'dmx.topicmaps.pinned': false
      }
      this.addTopic(topic.newViewTopic(viewProps))
      op.type = 'add'
      op.viewProps = viewProps
    } else {
      if (!viewTopic.isVisible()) {
        viewTopic.setVisibility(true)
        op.type = 'show'
      }
    }
    return op
  }

  removeTopic (id) {
    // reactivity is required to trigger "visibleTopicIds" getter (module dm5-cytoscape-renderer)
    Vue.delete(this.topics, id)
  }

  forEachTopic (visitor) {
    utils.forEach(this.topics, visitor)
  }

  filterTopics (filter) {
    return Object.values(this.topics).filter(filter)
  }

  // Associations

  getAssoc (id) {
    var assoc = this.getAssocIfExists(id)
    if (!assoc) {
      throw Error(`Assoc ${id} not found in topicmap ${this.id}`)
    }
    return assoc
  }

  /**
   * Returns all associations the given topic is a player in.
   */
  getAssocs (topicId) {
    const assocs = []
    this.forEachAssoc(assoc => {
      if (assoc.isTopicPlayer(topicId)) {
        assocs.push(assoc)
      }
    })
    return assocs
  }

  getAssocIfExists (id) {
    return this.assocs[id]
  }

  hasAssoc (id) {
    return this.getAssocIfExists(id)
  }

  /**
   * @param   assoc   a dm5.ViewAssoc
   */
  addAssoc (assoc) {
    if (!(assoc instanceof ViewAssoc)) {
      throw Error(`addAssoc() expects a ViewAssoc, got ${assoc.constructor.name}`)
    }
    this.assocs[assoc.id] = assoc
  }

  /**
   * @param   assoc   a dm5.Assoc
   */
  revealAssoc (assoc) {
    const op = {}
    const viewAssoc = this.getAssocIfExists(assoc.id)
    if (!viewAssoc) {
      const viewProps = {
        'dmx.topicmaps.pinned': false
      }
      this.addAssoc(assoc.newViewAssoc(viewProps))
      op.type = 'add'
      op.viewProps = viewProps
    }
    return op
  }

  removeAssoc (id) {
    delete this.assocs[id]
  }

  /**
   * Removes all associations the given topic is a player in.
   */
  removeAssocs (topicId) {
    this.getAssocs(topicId).forEach(assoc => {
      this.removeAssoc(assoc.id)
    })
  }

  forEachAssoc (visitor) {
    utils.forEach(this.assocs, visitor)
  }

  filterAssocs (filter) {
    return Object.values(this.assocs).filter(filter)
  }

  // Generic

  getObject (id) {
    const o = this.getTopicIfExists(id) || this.getAssocIfExists(id)
    if (!o) {
      throw Error(`Topic/assoc ${id} not found in topicmap ${this.id}`)
    }
    return o
  }

  /**
   * Returns the position of the given topic/assoc.
   *
   * Note: ViewTopic has getPosition() too but ViewAssoc has not
   * as a ViewAssoc doesn't know the Topicmap it belongs to.
   */
  getPosition (id) {
    const o = this.getObject(id)
    if (o.isTopic()) {
      return o.getPosition()
    } else {
      const pos1 = this.getPosition(o.role1.getPlayerId())
      const pos2 = this.getPosition(o.role2.getPlayerId())
      return {
        x: (pos1.x + pos2.x) / 2,
        y: (pos1.y + pos2.y) / 2
      }
    }
  }
}

// TODO: common base class for ViewTopic and ViewAssoc?

class ViewTopic extends Topic {

  constructor (topic) {
    super(topic)
    this.viewProps = topic.viewProps
  }

  getPosition () {
    return {
      x: this.getViewProp('dmx.topicmaps.x'),
      y: this.getViewProp('dmx.topicmaps.y')
    }
  }

  isVisible () {
    return this.getViewProp('dmx.topicmaps.visibility')
  }

  // TODO: avoid copy in ViewAssoc
  isPinned () {
    return this.getViewProp('dmx.topicmaps.pinned')
  }

  setPosition (pos) {
    this.setViewProp('dmx.topicmaps.x', pos.x)
    this.setViewProp('dmx.topicmaps.y', pos.y)
  }

  setVisibility (visibility) {
    this.setViewProp('dmx.topicmaps.visibility', visibility)
  }

  // TODO: avoid copy in ViewAssoc
  setPinned (pinned) {
    this.setViewProp('dmx.topicmaps.pinned', pinned)
  }

  // TODO: avoid copy in ViewAssoc
  getViewProp (propUri) {
    return this.viewProps[propUri]
  }

  // TODO: avoid copy in ViewAssoc
  setViewProp (propUri, value) {
    // Note: some view props must be reactive, e.g. 'dmx.topicmaps.pinned' reflects pin button state.
    // Test it with topics which don't have a 'dmx.topicmaps.pinned' setting yet. ### FIXDOC
    Vue.set(this.viewProps, propUri, value)
  }

  fetchObject () {
    return restClient.getTopic(this.id, true, true)
  }
}

class ViewAssoc extends Assoc {

  constructor (assoc) {
    super(assoc)
    this.viewProps = assoc.viewProps
  }

  // TODO: avoid copy in ViewTopic
  isPinned () {
    return this.getViewProp('dmx.topicmaps.pinned')
  }

  // TODO: avoid copy in ViewTopic
  setPinned (pinned) {
    this.setViewProp('dmx.topicmaps.pinned', pinned)
  }

  // TODO: avoid copy in ViewTopic
  getViewProp (propUri) {
    return this.viewProps[propUri]
  }

  // TODO: avoid copy in ViewTopic
  setViewProp (propUri, value) {
    // Note: some view props must be reactive, e.g. 'dmx.topicmaps.pinned' reflects pin button state.
    // Test it with assocs which don't have a 'dmx.topicmaps.pinned' setting yet. ### FIXDOC
    Vue.set(this.viewProps, propUri, value)
  }

  fetchObject () {
    return restClient.getAssoc(this.id, true, true)
  }
}

class Geomap extends Topic {
  constructor (geomap) {
    super(geomap.info)
    // Note: we don't instantiate dm5.Topic objects as not required at the moment
    this.geoCoordTopics = geomap.geoCoordTopics
  }
}

export {
  DeepaMehtaObject,
  Topic,
  Assoc,
  AssocRole,
  RelatedTopic,
  Type,
  TopicType,
  AssocType,
  Topicmap,
  ViewTopic,
  ViewAssoc,
  Geomap
}
