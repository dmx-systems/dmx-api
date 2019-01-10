import restClient from './rest-client'
import typeCache from './type-cache'
import permCache from './permission-cache'
import utils from './utils'
import Vue from 'vue'

// TODO: inject or factor out
const DEFAULT_TOPIC_ICON = '\uf111'               // fa-circle
const DEFAULT_TOPIC_TYPE_ICON = '\uf10c'          // fa-circle-o
const DEFAULT_ASSOC_COLOR = 'hsl(0, 0%, 80%)'     // matches dm5-color-picker gray

class DMXObject {

  constructor (object) {
    if (object.constructor.name !== 'Object') {
      throw Error(`DMXObject constructor expects plain Object, got ${object.constructor.name} (${object})`)
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
        Vue.set(this.childs, assocDef.assocDefUri, childs)
      }
    })
    return this
  }

  clone () {
    return utils.clone(this)
  }
}

class Topic extends DMXObject {

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

  get icon () {
    return this.getType()._getIcon() || DEFAULT_TOPIC_ICON
  }

  isType () {
    // TODO: meta type?
    return this.typeUri === 'dmx.core.topic_type' ||
           this.typeUri === 'dmx.core.assoc_type'
  }

  isAssocDef () {
    return false    // topics are never assoc defs
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

  asType () {
    if (this.typeUri === 'dmx.core.topic_type') {
      return typeCache.getTopicType(this.uri)
    } else if (this.typeUri === 'dmx.core.assoc_type') {
      return typeCache.getAssocType(this.uri)
    } else {
      throw Error(`Not a type: ${this}`)
    }
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

class Assoc extends DMXObject {

  constructor (assoc) {
    super(assoc)
    // Note: for update models the roles are optional.
    // Compare to ModelFactoryImpl.newAssociationModel(JSONObject assoc).
    if (assoc.role1) {
      this.role1 = new Player(assoc.role1)
    }
    if (assoc.role2) {
      this.role2 = new Player(assoc.role2)
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

  // TODO: rename to "hasTopicPlayer"
  isTopicPlayer (topicId) {
    return this.role1.topicId === topicId || this.role2.topicId === topicId
  }

  // ---

  // TODO: make it a "type" getter?
  getType () {
    return typeCache.getAssocType(this.typeUri)
  }

  // TODO: make it a "color" getter?
  getColor () {
    return this.getType()._getColor() || DEFAULT_ASSOC_COLOR
  }

  isType () {
    return false    // assocs are never types
  }

  isAssocDef () {
    return this.typeUri === 'dmx.core.composition_def'
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

  asAssocDef () {
    const role = this.getRole('dmx.core.parent_type')
    const type = typeCache.getTypeById(role.topicId)
    return type.getAssocDefById(this.id)
  }
}

class Player {

  constructor (player) {
    if (player.topicId === -1 || player.assocId === -1) {
      throw Error(`Player ID is -1 in ${JSON.stringify(player)}`)
    }
    // TODO: arg check: player ID must not be undefined
    this.topicId     = player.topicId       // always set for topic player. 0 is a valid ID. Undefined for assoc player.
    this.topicUri    = player.topicUri      // optionally set for topic player. May be undefined.
    this.assocId     = player.assocId       // always set for assoc player. Undefined for topic player.
    this.roleTypeUri = player.roleTypeUri   // always set.
  }

  getRoleType () {
    return typeCache.getRoleType(this.roleTypeUri)
  }

  get roleTypeName () {
    return this.getRoleType().value
  }

  isTopicPlayer () {
    return this.topicId >= 0    // Note: 0 is a valid topic ID
  }

  isAssocPlayer () {
    return this.assocId
  }

  get id () {
    if (this.isTopicPlayer()) {
      return this.topicId
    } else if (this.isAssocPlayer()) {
      return this.assocId
    }
    throw Error(`Player ID not set in role ${JSON.stringify(this)}`)
  }

  fetch () {
    if (this.isTopicPlayer()) {
      return restClient.getTopic(this.topicId)
    } else if (this.isAssocPlayer()) {
      return restClient.getAssoc(this.assocId)
    }
    throw Error(`Player ID not set in role ${JSON.stringify(this)}`)
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
    this.assocDefs   = utils.instantiateMany(type.assocDefs, AssocDef)
    this.viewConfig  = utils.mapByTypeUri(utils.instantiateMany(type.viewConfigTopics, Topic))    // TODO: rename prop?
  }

  isSimple () {
    return ['dmx.core.text', 'dmx.core.html', 'dmx.core.number', 'dmx.core.boolean'].includes(this.dataTypeUri)
  }

  isComposite () {
    return !this.isSimple()
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

  getAssocDefById (id) {
    const assocDefs = this.assocDefs.filter(assocDef => assocDef.id === id)
    if (assocDefs.length !== 1) {
      throw Error(`Type "${this.uri}" has ${assocDefs.length} assoc defs with ID ${id}`)
    }
    return assocDefs[0]
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

  get icon () {
    return this._getIcon() || DEFAULT_TOPIC_TYPE_ICON
  }

  _getIcon () {
    return this.getViewConfig('dmx.webclient.icon')
  }

  isTopicType () {
    return true
  }

  isAssocType () {
    return false
  }

  update () {
    return restClient.updateTopicType(this.toExternalForm())
  }
}

class AssocType extends Type {

  _getColor () {
    return this.getViewConfig('dmx.webclient.color')
  }

  isTopicType () {
    return false
  }

  isAssocType () {
    return true
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
    if (!this.isAssocDef()) {
      throw Error(`Unexpected association type URI: "${this.typeUri}"`);
    }
    return 'dmx.core.composition';
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
   * @return    all topics of this topicmap, including hidden ones (array of dm5.ViewTopic)
   */
  getTopics () {
    return Object.values(this.topics)
  }

  mapTopics (func) {
    return this.getTopics().map(func)
  }

  filterTopics (filter) {
    return this.getTopics().filter(filter)
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
  getAssocsWithTopicPlayer (topicId) {
    return this.filterAssocs(assoc => assoc.isTopicPlayer(topicId))
  }

  getAssocIfExists (id) {
    return this.assocs[id]
  }

  hasAssoc (id) {
    return this.getAssocIfExists(id)
  }

  /**
   * @return    all assocs of this topicmap (array of dm5.ViewAssoc)
   */
  getAssocs () {
    return Object.values(this.assocs)
  }

  mapAssocs (func) {
    return this.getAssocs().map(func)
  }

  filterAssocs (filter) {
    return this.getAssocs().filter(filter)
  }

  /**
   * @param   assoc   a dm5.ViewAssoc
   */
  addAssoc (assoc) {
    if (!(assoc instanceof ViewAssoc)) {
      throw Error(`addAssoc() expects a ViewAssoc, got ${assoc.constructor.name}`)
    }
    // reactivity is required to trigger "visibleAssocIds" getter (module dm5-cytoscape-renderer)
    Vue.set(this.assocs, assoc.id, assoc)
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
    // reactivity is required to trigger "visibleAssocIds" getter (module dm5-cytoscape-renderer)
    Vue.delete(this.assocs, id)
  }

  /**
   * Removes all associations the given topic is a player in.
   */
  removeAssocs (topicId) {
    this.getAssocsWithTopicPlayer(topicId).forEach(assoc => {
      this.removeAssoc(assoc.id)
    })
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
      const pos1 = this.getPosition(o.role1.id)
      const pos2 = this.getPosition(o.role2.id)
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
  DMXObject,
  Topic,
  Assoc,
  Player,
  RelatedTopic,
  Type,
  TopicType,
  AssocType,
  Topicmap,
  ViewTopic,
  ViewAssoc,
  Geomap
}
