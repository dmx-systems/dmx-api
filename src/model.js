import rpc from './rpc'
import typeCache from './type-cache'
import permCache from './permission-cache'
import utils from './utils'
import Vue from 'vue'

// TODO: inject or factor out
const DEFAULT_TOPIC_ICON = '\uf111'               // fa-circle
const DEFAULT_TOPIC_TYPE_ICON = '\uf10c'          // fa-circle-o
const DEFAULT_ICON_COLOR = 'hsl(210, 50%, 53%)'   // matches dmx-color-picker blue
const DEFAULT_ASSOC_COLOR = 'hsl(0, 0%, 80%)'     // matches dmx-color-picker gray
const DEFAULT_BACKGROUND_COLOR = '#f5f7fa'        // matches dmx-webclient --background-color

let iconRenderers = {}

class DMXObject {

  constructor (object) {
    if (!object) {
      throw Error(`invalid object passed to DMXObject constructor: ${object}`)
    } else if (object.constructor.name !== 'Object') {
      throw Error(`DMXObject constructor expects Object, got ${object.constructor.name} ${JSON.stringify(object)}`)
    }
    this.id      = object.id
    this.uri     = object.uri
    this.typeUri = object.typeUri
    this.value   = object.value
    this.children = utils.instantiateChildren(object.children)
  }

  get typeName () {
    return this.type.value
  }

  get backgroundColor () {
    return this.type._getBackgroundColor() || DEFAULT_BACKGROUND_COLOR
  }

  getCreationTime () {
    return rpc.getCreationTime(this.id)
  }

  getModificationTime () {
    return rpc.getModificationTime(this.id)
  }

  getCreator () {
    return rpc.getCreator(this.id)
  }

  getModifier () {
    return rpc.getModifier(this.id)
  }

  getWorkspace () {
    return rpc.getAssignedWorkspace(this.id)
  }

  assignToWorkspace (workspaceId) {
    return rpc.assignToWorkspace(this.id, workspaceId)
  }

  getTopicmapTopics () {
    return rpc.getTopicmapTopics(this.id)
  }

  getRelatedTopicsWithoutChilds () {
    return rpc.getRelatedTopicsWithoutChilds(this.id)
  }

  /**
   * @return  true if this object is editable *in principle*, independent of user's authorization.
   *
   *          For entity topics, assocs and types <code>true</code> is returned, provided "Noneditable" is
   *          not set in the type's view config.
   *          For value topics, or if "Noneditable" is set, <code>false</code> is returned.
   */
  get isEditable () {
    return (this.isAssoc || this.isType || this.type.isEntity) && !this.type.isNoneditable
  }

  /**
   * @return  a promise for a true/false value
   */
  isWritable () {
    return permCache.isWritable(this.id)
  }

  /**
   * Returns true if this object equals the given object.
   *
   * In case of composite objects this method expects all child topics be present (according to type definition) in
   * both objects. One exception: at deeper levels for entity types only the identitity attributes must be present.
   * Child topics can have empty values though.
   * Consider calling newFormModel() for both objects before calling this method.
   */
  equals (object) {
    return this._equals(object) && (!this.assoc || this.assoc._equals(object.assoc))
  }

  _equals (object) {
    return this.id      === object.id &&
           this.uri     === object.uri &&
           this.typeUri === object.typeUri &&
           this.value   === object.value &&
           this.childrenEquals(object.children)
  }

  childrenEquals (children) {
    return !this.type.compDefs.some(compDef => {
      const compDefUri = compDef.compDefUri
      const child = this.children[compDefUri]
      const _child = children[compDefUri]
      if (!child) {     // TODO: at deeper levels for entity types only compare their identity attributes
        return false
      }
      if (compDef.isOne) {
        return !child.equals(_child)
      } else if (child.length !== _child.length) {
        return true
      } else {
        let i = 0
        return child.some(child => !child.equals(_child[i++]))
      }
    })
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

  get type () {
    return typeCache.getTopicType(this.typeUri)
  }

  get icon () {
    const renderer = iconRenderers[this.typeUri]
    if (renderer) {
      return renderer(this)
    }
    return this.type._getIcon() || DEFAULT_TOPIC_ICON
  }

  get iconColor () {
    return this.type._getColor() || DEFAULT_ICON_COLOR
  }

  get isType () {
    // TODO: meta type?
    return this.typeUri === 'dmx.core.topic_type' ||
           this.typeUri === 'dmx.core.assoc_type'
  }

  get isRoleType () {
    return this.typeUri === 'dmx.core.role_type'
  }

  get isCompDef () {
    return false    // topics are never comp defs
  }

  /**
   * @param   filter
   *            Optional: 1-hop traversal filtering. An object with 4 properties (each one is optional):
   *              "assocTypeUri"
   *              "myRoleTypeUri"
   *              "othersRoleTypeUri"
   *              "othersTopicTypeUri"
   *            If not specified no filter is applied.
   */
  getRelatedTopics (filter) {
    return rpc.getTopicRelatedTopics(this.id, filter)
  }

  update () {
    // console.log('update', this)
    return rpc.updateTopic(this)
  }

  get isTopic () {
    return true
  }

  get isAssoc () {
    return false
  }

  newViewTopic (viewProps) {
    return new ViewTopic({
      id:       this.id,
      uri:      this.uri,
      typeUri:  this.typeUri,
      value:    this.value,
      children: {},     // Note: this topic's children are not used as they are instantiated already. The ViewTopic
                        // constructor would instantiate them another time, which would fail. Instead we set the
                        // children afterwards (see revealTopic() below). TODO: clear this situation.
                        // Note: children are needed in ViewTopic for rendering e.g. a Topicmap topic with its
                        // maptype-specific icon.
      viewProps
    })
  }

  asType () {
    if (this.typeUri === 'dmx.core.topic_type') {
      return typeCache.getTopicType(this.uri)
    } else if (this.typeUri === 'dmx.core.assoc_type') {
      return typeCache.getAssocType(this.uri)
    } else {
      throw Error(`not a type: ${this}`)
    }
  }

  asRoleType () {
    if (this.isRoleType) {
      return typeCache.getRoleType(this.uri)
    } else {
      throw Error(`not a role type: ${this}`)
    }
  }
}

class Assoc extends DMXObject {

  constructor (assoc) {
    super(assoc)
    // Note 1: for update models the players are optional.
    // Compare to ModelFactoryImpl.newAssocModel(JSONObject assoc).
    // Note 2: when a ViewAssoc is created the Assoc constructor is invoked, and both players would
    // be instantiated again, resulting in "DMXObject constructor expects Object, got Topic/Assoc".
    // ### TODO: rethink about instantiation of first-class objects in conjunction with view-objects
    const p1 = assoc.player1
    const p2 = assoc.player2
    if (p1) {
      this.player1 = p1 instanceof Player ? p1 : new Player(p1)
    }
    if (p2) {
      this.player2 = p2 instanceof Player ? p2 : new Player(p2)
    }
  }

  // ---

  getPlayer (roleTypeUri) {
    const match1 = this.player1.roleTypeUri === roleTypeUri
    const match2 = this.player2.roleTypeUri === roleTypeUri
    if (match1 && match2) {
      throw Error(`both players of association ${this.id} have role type ${roleTypeUri}`)
    }
    return match1 ? this.player1 : match2 ? this.player2 : undefined
  }

  getOtherPlayerId (id) {
    if (this.player1.id === id) {
      return this.player2.id
    } else if (this.player2.id === id) {
      return this.player1.id
    } else {
      throw Error(`${id} is not a player in assoc ${JSON.stringify(this)}`)
    }
  }

  /**
   * @param   id    a topic ID or an assoc ID
   */
  hasPlayer (id) {
    return this.player1.id === id || this.player2.id === id
  }

  // ---

  get type () {
    return typeCache.getAssocType(this.typeUri)
  }

  get color () {
    return this.type._getColor() || DEFAULT_ASSOC_COLOR
  }

  get isType () {
    return false    // assocs are never types
  }

  get isRoleType () {
    return false    // assocs are never role types
  }

  get isCompDef () {
    return this.typeUri === 'dmx.core.composition_def'
  }

  /**
   * @param   filter
   *            Optional: 1-hop traversal filtering. An object with 4 properties (each one is optional):
   *              "assocTypeUri"
   *              "myRoleTypeUri"
   *              "othersRoleTypeUri"
   *              "othersTopicTypeUri"
   *            If not specified no filter is applied.
   */
  getRelatedTopics (filter) {
    return rpc.getAssocRelatedTopics(this.id, filter)
  }

  update () {
    console.log('update', this)
    return rpc.updateAssoc(this)
  }

  get isTopic () {
    return false
  }

  get isAssoc () {
    return true
  }

  newViewAssoc (viewProps) {
    return new ViewAssoc({
      id:      this.id,
      uri:     this.uri,
      typeUri: this.typeUri,
      value:   this.value,
      children: {},     // TODO: children needed in a ViewTopic?
      player1: this.player1,
      player2: this.player2,
      viewProps
    })
  }

  asCompDef () {
    const player = this.getPlayer('dmx.core.parent_type')
    const type = typeCache.getTypeById(player.topicId)
    return type.getCompDefById(this.id)
  }
}

class Player {

  constructor (player) {
    if (player.topicId === -1 || player.assocId === -1) {
      throw Error(`player ID is -1 in ${JSON.stringify(player)}`)
    }
    // TODO: arg check: player ID must not be undefined
    this.topicId     = player.topicId       // always set for topic player. 0 is a valid ID. Undefined for assoc player.
    this.topicUri    = player.topicUri      // optionally set for topic player. May be undefined.
    this.assocId     = player.assocId       // always set for assoc player. Undefined for topic player.
    this.roleTypeUri = player.roleTypeUri   // always set.
    player.topic && (this.topic = new Topic(player.topic))
    player.assoc && (this.assoc = new Assoc(player.assoc))
  }

  getRoleType () {
    return typeCache.getRoleType(this.roleTypeUri)
  }

  get roleTypeName () {
    return this.getRoleType().value
  }

  get arrowShape () {
    return this.getRoleType().getViewConfig('dmx.webclient.arrow_shape') || 'none'
  }

  get hollow () {
    return this.getRoleType().getViewConfig('dmx.webclient.hollow') || false
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
    throw Error(`ID not set in player ${JSON.stringify(this)}`)
  }

  fetch () {
    if (this.isTopicPlayer()) {
      return rpc.getTopic(this.topicId)
    } else if (this.isAssocPlayer()) {
      return rpc.getAssoc(this.assocId)
    }
    throw Error(`ID not set in player ${JSON.stringify(this)}`)
  }
}

class RelatedTopic extends Topic {
  constructor (topic) {
    super(topic)
    if (!topic.assoc) {
      throw Error('object passed to RelatedTopic constructor has no `assoc` property')
    }
    this.assoc = new Assoc(topic.assoc)
  }
}

// TODO: name it "DMXType"
class Type extends Topic {

  constructor (type) {
    super(type)
    this.dataTypeUri = type.dataTypeUri
    this.compDefs   = utils.instantiateMany(type.compDefs, CompDef)
    this.viewConfig = utils.mapByTypeUri(utils.instantiateMany(type.viewConfigTopics, Topic))
  }

  get isSimple () {
    return ['dmx.core.text', 'dmx.core.html', 'dmx.core.number', 'dmx.core.boolean'].includes(this.dataTypeUri)
  }

  get isComposite () {
    return !this.isSimple
  }

  get isValue () {
    return this.dataTypeUri === 'dmx.core.value'
  }

  get isEntity () {
    return this.dataTypeUri === 'dmx.core.entity'
  }

  get dataType () {
    return typeCache.getDataType(this.dataTypeUri)
  }

  getCompDefById (id) {
    const compDefs = this.compDefs.filter(compDef => compDef.id === id)
    if (compDefs.length !== 1) {
      throw Error(`type "${this.uri}" has ${compDefs.length} comp defs with ID ${id}`)
    }
    return compDefs[0]
  }

  // ### TODO: copy in CompDef
  // ### TODO: copy in RoleType
  getViewConfig (childTypeUri) {
    // TODO: don't hardcode config type URI
    const configTopic = this.viewConfig['dmx.webclient.view_config']
    if (!configTopic) {
      // console.warn(`Type "${this.uri}" has no view config`)
      return
    }
    const topic = configTopic.children[childTypeUri]
    return topic && topic.value
  }

  _getColor () {
    return this.getViewConfig('dmx.webclient.color')
  }

  _getBackgroundColor () {
    return this.getViewConfig('dmx.webclient.color#dmx.webclient.background_color')
  }

  get isNoneditable () {
    return this.getViewConfig('dmx.webclient.noneditable')
  }

  /**
   * Creates a form model for this type.
   *
   * @param   object  optional, if given its values are filled in. ### FIXDOC
   *                  The object is expected to be of *this* type.
   *
   * @return  the created form model. ### FIXDOC
   */
  newFormModel (object) {
    const o = this._newFormModel(object)
    object.children = utils.instantiateChildren(o.children)
    return object
  }

  /**
   * @param   object  optional, if given its values are filled in.
   *                  The object is expected to be of *this* type.
   *
   * @return  a newly constructed plain object
   */
  _newFormModel (object) {

    function _newFormModel (object, type, level, compDef) {
      const o = type._newInstance(object)
      if (type.isComposite) {
        type.compDefs.forEach(compDef => {
          // Reduced details: at deeper levels for entity types only their identity attributes are included
          if (level === 0 || type.isValue || compDef.isIdentityAttr) {
            const compDefUri = compDef.compDefUri
            const childType = compDef.childType
            const child = object && object.children[compDefUri]
            const nextLevel = level + 1
            if (compDef.isOne) {
              o.children[compDefUri] = _newFormModel(child, childType, nextLevel, compDef)
            } else {
              if (child && child.length) {
                o.children[compDefUri] = child.map(object => _newFormModel(object, childType, nextLevel, compDef))
              } else {
                o.children[compDefUri] = [_newFormModel(undefined, childType, nextLevel, compDef)]
              }
            }
          }
        })
      }
      if (level) {
        o.assoc = compDef.instanceLevelAssocType._newFormModel(object && object.assoc)
      }
      return o
    }

    return _newFormModel(object, this, 0)
  }

  _newInstance (object) {
    // console.log('_newInstance', this, object)
    const o = {
      id:      object ? object.id      : -1,
      uri:     object ? object.uri     : '',
      typeUri: object ? object.typeUri : this.uri,
      value:   object ? object.value   : '',
      children: {}
    }
    return o
  }
}

class TopicType extends Type {

  /**
   * Creates a form model for this topic type, and fills in the given value.
   *
   * @returns   a newly constructed plain object.
   */
  newTopicModel (simpleValue) {
    const topic = this._newFormModel()
    initTopicValue(topic, this)
    return topic

    function initTopicValue (topic, type) {
      if (type.isSimple) {
        topic.value = simpleValue
      } else {
        const compDef = type.compDefs[0]
        const children = topic.children[compDef.compDefUri]
        const child = compDef.isOne ? children : children[0]
        initTopicValue(child, compDef.childType)
      }
    }
  }

  get icon () {
    return this._getIcon() || DEFAULT_TOPIC_TYPE_ICON
  }

  _getIcon () {
    return this.getViewConfig('dmx.webclient.icon')
  }

  get isTopicType () {
    return true
  }

  get isAssocType () {
    return false
  }

  update () {
    return rpc.updateTopicType(this)
  }
}

class AssocType extends Type {

  get isTopicType () {
    return false
  }

  get isAssocType () {
    return true
  }

  update () {
    return rpc.updateAssocType(this)
  }
}

class CompDef extends Assoc {

  constructor (compDef) {
    super(compDef)
    this.viewConfig = utils.mapByTypeUri(utils.instantiateMany(compDef.viewConfigTopics, Topic))
    //
    // derived properties
    //
    this.parentTypeUri = this.getPlayer('dmx.core.parent_type').topicUri
    this.childTypeUri  = this.getPlayer('dmx.core.child_type').topicUri
    //
    const customAssocType = this.children['dmx.core.assoc_type#dmx.core.custom_assoc_type']
    this.customAssocTypeUri = customAssocType && customAssocType.uri    // may be undefined
    this.compDefUri = this.childTypeUri + (this.customAssocTypeUri ? '#' + this.customAssocTypeUri : '')
    this.instanceLevelAssocTypeUri = this.customAssocTypeUri || this._defaultInstanceLevelAssocTypeUri()
    //
    const cardinality = this.children['dmx.core.cardinality']
    if (cardinality) {
      this.childCardinalityUri = cardinality.uri
    } else {
      throw Error(`comp def ${this.compDefUri} has no cardinality child (parent type: ${this.parentTypeUri})`)
    }
    //
    const isIdentityAttr = this.children['dmx.core.identity_attr']
    if (isIdentityAttr) {
      this.isIdentityAttr = isIdentityAttr.value
    } else {
      this.isIdentityAttr = false
    }
    //
    const includeInLabel = this.children['dmx.core.include_in_label']
    if (includeInLabel) {
      this.includeInLabel = includeInLabel.value
    } else {
      this.includeInLabel = false
    }
  }

  // ---

  get childType () {
    return typeCache.getTopicType(this.childTypeUri)
  }

  get instanceLevelAssocType () {
    return typeCache.getAssocType(this.instanceLevelAssocTypeUri)
  }

  /**
   * Returns the custom assoc type (a dmx.AssocType object), or undefined if no one is set.
   */
  get customAssocType () {
    return this.customAssocTypeUri && typeCache.getAssocType(this.customAssocTypeUri)
  }

  get isOne () {
    return this.childCardinalityUri === 'dmx.core.one'
  }

  get isMany () {
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
    return configTopic.children[childTypeUri]
  }

  // TODO: a getViewConfig() form that falls back to the child type view config?

  _defaultInstanceLevelAssocTypeUri () {
    if (!this.isCompDef) {
      throw Error(`unexpected association type URI: "${this.typeUri}"`)
    }
    return 'dmx.core.composition'
  }

  emptyChildInstance () {
    const topic = this.childType._newFormModel()
    topic.assoc = this.instanceLevelAssocType._newFormModel()
    return new Topic(topic)
  }
}

class RoleType extends Topic {

  constructor (roleType) {
    super(roleType)
    this.viewConfig = utils.mapByTypeUri(utils.instantiateMany(roleType.viewConfigTopics, Topic))
  }

  getViewConfig (childTypeUri) {
    // TODO: don't hardcode config type URI
    const configTopic = this.viewConfig['dmx.webclient.view_config']
    if (!configTopic) {
      // console.warn(`Type "${this.uri}" has no view config`)
      return
    }
    const topic = configTopic.children[childTypeUri]
    return topic && topic.value
  }
}

class Topicmap extends Topic {

  constructor (topicmap) {
    super(topicmap.topic)
    this.viewProps = topicmap.viewProps
    this._topics = utils.mapById(utils.instantiateMany(topicmap.topics, ViewTopic))   // map: ID -> dmx.ViewTopic
    this._assocs = utils.mapById(utils.instantiateMany(topicmap.assocs, ViewAssoc))   // map: ID -> dmx.ViewAssoc
  }

  getTopic (id) {
    const topic = this.getTopicIfExists(id)
    if (!topic) {
      throw Error(`topic ${id} not found in topicmap ${this.id}`)
    }
    return topic
  }

  getAssoc (id) {
    const assoc = this.getAssocIfExists(id)
    if (!assoc) {
      throw Error(`assoc ${id} not found in topicmap ${this.id}`)
    }
    return assoc
  }

  /**
   * @param   id      a topic ID or an assoc ID
   */
  getObject (id) {
    const o = this.getTopicIfExists(id) || this.getAssocIfExists(id)
    if (!o) {
      throw Error(`topic/assoc ${id} not found in topicmap ${this.id}`)
    }
    return o
  }

  getTopicIfExists (id) {
    return this._topics[id]
  }

  getAssocIfExists (id) {
    return this._assocs[id]
  }

  hasTopic (id) {
    return this.getTopicIfExists(id)
  }

  hasAssoc (id) {
    return this.getAssocIfExists(id)
  }

  hasObject (id) {
    return this.hasTopic(id) || this.hasAssoc(id)
  }

  hasVisibleObject (id) {
    const o = this.getTopicIfExists(id) || this.getAssocIfExists(id)
    return o && o.isVisible()
  }

  /**
   * @return    all topics of this topicmap, including hidden ones (array of dmx.ViewTopic)
   */
  get topics () {
    return Object.values(this._topics)
  }

  /**
   * @return    all assocs of this topicmap, including hidden ones (array of dmx.ViewAssoc)
   */
  get assocs () {
    return Object.values(this._assocs)
  }

  /**
   * Returns the position of the given topic/assoc.
   *
   * Note: ViewTopic has getPosition() too but ViewAssoc has not
   * as a ViewAssoc doesn't know the Topicmap it belongs to.
   *
   * @param   id      a topic ID or an assoc ID
   */
  getPosition (id) {
    const o = this.getObject(id)
    if (o.isTopic) {
      return o.getPosition()
    } else {
      const pos1 = this.getPosition(o.player1.id)
      const pos2 = this.getPosition(o.player2.id)
      return {
        x: (pos1.x + pos2.x) / 2,
        y: (pos1.y + pos2.y) / 2
      }
    }
  }

  /**
   * @param   topic   a dmx.ViewTopic
   */
  addTopic (topic) {
    if (!(topic instanceof ViewTopic)) {
      throw Error(`addTopic() expects a ViewTopic, got ${topic.constructor.name}`)
    }
    // reactivity is required to trigger "visibleTopicIds" getter (module dmx-cytoscape-renderer)
    Vue.set(this._topics, topic.id, topic)
  }

  /**
   * @param   assoc   a dmx.ViewAssoc
   */
  addAssoc (assoc) {
    if (!(assoc instanceof ViewAssoc)) {
      throw Error(`addAssoc() expects a ViewAssoc, got ${assoc.constructor.name}`)
    }
    // reactivity is required to trigger "visibleAssocIds" getter (module dmx-cytoscape-renderer)
    Vue.set(this._assocs, assoc.id, assoc)
  }

  /**
   * Adds a topic to this topicmap resp. set it to visible.
   *
   * @param   topic   a dmx.Topic
   * @param   pos     Optional: the topic position (an object with "x", "y" properties).
   *                  If not given it's up to the topicmap renderer to position the topic.
   *
   * @return  an "op" object which tells the caller what type of operation has been performed.
   *          Its "type" property is one of these:
   *            - "add": the topic was not contained in the topicmap before, and now has been added.
   *            - "show": the topic is already contained in the topicmap but was hidden; now it is set to visible
   *              and its original position is restored (a possibly given "pos" argument is not used).
   *            - undefined: the topic is already contained in the topicmap and is visible; nothing was performed
   *              (a possibly given "pos" argument is not used).
   *          In case of "add" and "show": the op's "viewTopic" property contains the topic added/set to visible.
   */
  revealTopic (topic, pos) {
    const op = {}
    let viewTopic = this.getTopicIfExists(topic.id)
    if (!viewTopic) {
      viewTopic = topic.newViewTopic({
        ...pos ? {
          'dmx.topicmaps.x': pos.x,
          'dmx.topicmaps.y': pos.y
        } : undefined,
        'dmx.topicmaps.visibility': true,
        'dmx.topicmaps.pinned': false
      })
      viewTopic.children = topic.children   // ### TODO, see comment in newViewTopic() above
      this.addTopic(viewTopic)
      op.type = 'add'
      op.viewTopic = viewTopic
    } else {
      if (!viewTopic.isVisible()) {
        viewTopic.setVisibility(true)
        op.type = 'show'
        op.viewTopic = viewTopic
      }
    }
    return op
  }

  /**
   * @param   assoc   a dmx.Assoc
   */
  revealAssoc (assoc) {
    const op = {}
    let viewAssoc = this.getAssocIfExists(assoc.id)
    if (!viewAssoc) {
      viewAssoc = assoc.newViewAssoc({
        'dmx.topicmaps.visibility': true,
        'dmx.topicmaps.pinned': false
      })
      this.addAssoc(viewAssoc)
      op.type = 'add'
      op.viewAssoc = viewAssoc
    } else {
      if (!viewAssoc.isVisible()) {
        viewAssoc.setVisibility(true)
        op.type = 'show'
        op.viewAssoc = viewAssoc
      }
    }
    return op
  }

  /**
   * Note: if the topic is not in this topicmap nothing is performed.
   */
  removeTopic (id) {
    // reactivity is required to trigger "visibleTopicIds" getter (module dmx-cytoscape-renderer)
    Vue.delete(this._topics, id)
  }

  /**
   * Note: if the assoc is not in this topicmap nothing is performed.
   */
  removeAssoc (id) {
    // reactivity is required to trigger "visibleAssocIds" getter (module dmx-cytoscape-renderer)
    Vue.delete(this._assocs, id)
  }

  // Associations

  /**
   * Returns all assocs the given topic/assoc is a player in.
   *
   * @param   id    a topic ID or an assoc ID
   *
   * @return  array of dmx.ViewAssoc
   */
  getAssocsWithPlayer (id) {
    return this.assocs.filter(assoc => assoc.hasPlayer(id))
  }

  // TODO: drop it? In most cases the caller needs control over the recursion.
  hideAssocsWithPlayer (id) {
    this.getAssocsWithPlayer(id).forEach(assoc => {
      assoc.setVisibility(false)
      this.hideAssocsWithPlayer(assoc.id)       // recursion
    })
  }

  /**
   * Removes all associations which have the given player.
   *
   * @param   id    a topic ID or an assoc ID
   */
  // TODO: drop it? In most cases the caller needs control over the recursion.
  removeAssocsWithPlayer (id) {
    this.getAssocsWithPlayer(id).forEach(assoc => {
      this.removeAssoc(assoc.id)
      this.removeAssocsWithPlayer(assoc.id)     // recursion
    })
  }

  /**
   * @param   assoc   a dmx.Assoc or a dmx.ViewAssoc
   * @param   id      a topic ID or an assoc ID
   */
  getOtherPlayer (assoc, id) {
    return this.getObject(assoc.getOtherPlayerId(id))
  }

  // Topicmap

  setViewport (pan, zoom) {
    this.viewProps['dmx.topicmaps.pan_x'] = pan.x
    this.viewProps['dmx.topicmaps.pan_y'] = pan.y
    this.viewProps['dmx.topicmaps.zoom'] = zoom
  }
}

const viewPropsMixin = Base => class extends Base {

  // TODO: make it a "visible" getter?
  isVisible () {
    return this.getViewProp('dmx.topicmaps.visibility')
  }

  setVisibility (visibility) {
    this.setViewProp('dmx.topicmaps.visibility', visibility)
    if (!visibility) {
      this.setPinned(false)     // hide implies unpin
    }
  }

  // TODO: make it a "pinned" getter?
  isPinned () {
    return this.getViewProp('dmx.topicmaps.pinned')
  }

  setPinned (pinned) {
    this.setViewProp('dmx.topicmaps.pinned', pinned)
  }

  getViewProp (propUri) {
    return this.viewProps[propUri]
  }

  setViewProp (propUri, value) {
    // Note: some view props must be reactive, e.g. 'dmx.topicmaps.pinned' reflects pin button state.
    // Test it with topics/assocs which don't have a 'dmx.topicmaps.pinned' setting yet. ### FIXDOC
    Vue.set(this.viewProps, propUri, value)
  }
}

class ViewTopic extends viewPropsMixin(Topic) {

  constructor (topic) {
    super(topic)
    if (!topic.viewProps) {
      throw TypeError(`"viewProps" not set in topic passed to ViewTopic constructor; topic=${JSON.stringify(topic)}`)
    }
    this.viewProps = topic.viewProps
  }

  fetchObject () {
    return rpc.getTopic(this.id, true, true)
  }

  // TODO: make it a "pos" getter?
  getPosition () {
    return {
      x: this.getViewProp('dmx.topicmaps.x'),
      y: this.getViewProp('dmx.topicmaps.y')
    }
  }

  setPosition (pos) {
    this.setViewProp('dmx.topicmaps.x', pos.x)
    this.setViewProp('dmx.topicmaps.y', pos.y)
  }
}

class ViewAssoc extends viewPropsMixin(Assoc) {

  constructor (assoc) {
    super(assoc)
    if (!assoc.viewProps) {
      throw TypeError(`"viewProps" not set in assoc passed to ViewAssoc constructor; assoc=${JSON.stringify(assoc)}`)
    }
    this.viewProps = assoc.viewProps
  }

  fetchObject () {
    return rpc.getAssoc(this.id, true, true)
  }
}

function setIconRenderers (_iconRenderers) {
  iconRenderers = _iconRenderers
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
  RoleType,
  Topicmap,
  ViewTopic,
  ViewAssoc,
  //
  setIconRenderers
}
