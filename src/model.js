import typeCache from './type-cache'
import restClient from './rest-client'
import utils from './utils'

// TODO: inject
const DEFAULT_TOPIC_ICON = '\uf10c'

class DeepaMehtaObject {

  constructor (object) {
    if (object instanceof DeepaMehtaObject) {
      throw Error('DeepaMehtaObject constructor called with a DeepaMehtaObject')
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

  getChildTopic (assocDefUri) {
    return this.childs[assocDefUri]
  }

  fillChilds () {
    this.getType().assocDefs.forEach(assocDef => {
      const childs = this.childs[assocDef.assocDefUri]
      if (childs) {
        if (assocDef.isOne()) {
          childs.fillChilds()
        } else {
          childs.forEach(child => {
            child.fillChilds()
          })
        }
      } else {
        const child = new Topic(assocDef.getChildType().emptyTopic())
        this.childs[assocDef.assocDefUri] = assocDef.isOne() ? child : [child]
      }
    })
  }
}

class Topic extends DeepaMehtaObject {

  getType () {
    return typeCache.getTopicType(this.typeUri)
  }

  getIcon () {
    return this.getType().getViewConfig('dm4.webclient.icon') || DEFAULT_TOPIC_ICON
  }

  getRelatedTopics () {
    return restClient.getTopicRelatedTopics(this.id)
  }

  update () {
    return restClient.updateTopic(this)
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
}

class Assoc extends DeepaMehtaObject {

  constructor (assoc) {
    super(assoc)
    this.role1 = assoc.role1
    this.role2 = assoc.role2
  }

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

  getType () {
    return typeCache.getAssocType(this.typeUri)
  }

  getRelatedTopics () {
    return restClient.getAssocRelatedTopics(this.id)
  }

  update () {
    return restClient.updateAssoc(this)
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
    this.dataType   = type.dataTypeUri
    this.indexModes = type.indexModeUris
    this.assocDefs  = utils.instantiateMany(type.assocDefs, AssocDef)
    this.viewConfig = utils.mapByTypeUri(utils.instantiateMany(type.viewConfigTopics, Topic))
  }

  isSimple () {
    return this.dataType !== 'dm4.core.composite'
  }

  getViewConfig (childTypeUri) {
    // TODO: don't hardcode config type URI
    const configTopic = this.viewConfig['dm4.webclient.view_config']
    if (!configTopic) {
      // console.warn(`Type "${this.uri}" has no view config`)
      return
    }
    const topic = configTopic.childs[childTypeUri]
    return topic && topic.value
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

  /**
   * @returns   a plain object.
   */
  emptyTopic () {

    const emptyChilds = () => {
      const childs = {}
      this.assocDefs.forEach(assocDef => {
        const child = assocDef.getChildType().emptyTopic()
        childs[assocDef.assocDefUri] = assocDef.isOne() ? child : [child]
      })
      return childs
    }

    return {
      typeUri: this.uri,
      value: '',
      childs: emptyChilds()
    }
  }
}

class AssocType extends Type {
}

class AssocDef extends Assoc {

  constructor (assocDef) {
    super(assocDef)
    this.parentCard = assocDef.parentCardinalityUri
    this.childCard  = assocDef.childCardinalityUri
    // derived properties
    this.parentTypeUri = this.getRole('dm4.core.parent_type').topicUri
    this.childTypeUri  = this.getRole('dm4.core.child_type').topicUri
    //
    const customAssocType = this.childs['dm4.core.assoc_type#dm4.core.custom_assoc_type']
    this.customAssocTypeUri = customAssocType && customAssocType.uri
    this.assocDefUri = this.childTypeUri + (this.customAssocTypeUri ? "#" + this.customAssocTypeUri : "")
    //
    this.includeInLabel = this.childs['dm4.core.include_in_label'].value
  }

  getChildType () {
    return typeCache.getTopicType(this.childTypeUri)
  }

  isOne () {
    return this.childCard === 'dm4.core.one'
  }

  isMany () {
    return this.childCard === 'dm4.core.many'
  }
}

class Topicmap extends Topic {

  constructor (topicmap) {
    super(topicmap.info)
    this.topics = utils.mapById(utils.instantiateMany(topicmap.topics, ViewTopic))  // map: ID -> dm5.ViewTopic
    this.assocs = utils.mapById(utils.instantiateMany(topicmap.assocs, Assoc))      // map: ID -> dm5.Assoc
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
   * @param   topic   a ViewTopic
   */
  addTopic (topic) {
    if (!(topic instanceof ViewTopic)) {
      throw Error(topic + " is not a ViewTopic")
    }
    this.topics[topic.id] = topic
  }

  /**
   * @param   topic   a dm5.Topic object
   * @param   pos     the topic position (an object with "x", "y" properties).
   */
  revealTopic (topic, pos) {
    const op = {}
    const viewTopic = this.getTopicIfExists(topic.id)
    if (!viewTopic) {
      const viewProps = {
        'dm4.topicmaps.x': pos.x,
        'dm4.topicmaps.y': pos.y,
        'dm4.topicmaps.visibility': true,
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
    delete this.topics[id]
  }

  forEachTopic (visitor) {
    utils.forEach(this.topics, visitor)
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
   * @param   assoc   an Assoc
   */
  addAssoc (assoc) {
    if (!(assoc instanceof Assoc)) {
      throw Error(assoc + " is not an Assoc")
    }
    this.assocs[assoc.id] = assoc
  }

  /**
   * @param   assoc   a dm5.Assoc object
   */
  revealAssoc (assoc) {
    const op = {}
    const viewAssoc = this.getAssocIfExists(assoc.id)
    if (!viewAssoc) {
      this.addAssoc(assoc)
      op.type = 'add'
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
}

class ViewTopic extends Topic {

  constructor (topic) {
    super(topic)
    this.viewProps = topic.viewProps
  }

  getPosition () {
    return {
      x: this.viewProps['dm4.topicmaps.x'],
      y: this.viewProps['dm4.topicmaps.y']
    }
  }

  isVisible () {
    return this.viewProps['dm4.topicmaps.visibility']
  }

  setPosition (pos) {
    this.viewProps['dm4.topicmaps.x'] = pos.x
    this.viewProps['dm4.topicmaps.y'] = pos.y
  }

  setVisibility (visibility) {
    this.viewProps['dm4.topicmaps.visibility'] = visibility
  }
}

export { Topic, Assoc, RelatedTopic, TopicType, AssocType, Topicmap, ViewTopic }
