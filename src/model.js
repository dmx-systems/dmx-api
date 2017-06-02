import typeCache from './type-cache'
import utils from './utils'

class DeepaMehtaObject {
  constructor (object) {
    this.id      = object.id
    this.uri     = object.uri
    this.typeUri = object.type_uri
    this.value   = object.value
    this.childs  = utils.instantiateChilds(object.childs)
  }

  get typeName () {
    return this.getType().value
  }
}

class Topic extends DeepaMehtaObject {
  getType () {
    return typeCache.getTopicType(this.typeUri)
  }
}

class Assoc extends DeepaMehtaObject {

  constructor (assoc) {
    super(assoc)
    this.role1 = assoc.role_1
    this.role2 = assoc.role_2
  }

  getType () {
    return typeCache.getAssocType(this.typeUri)
  }

  getRole (roleTypeUri) {
    var match1 = this.role1.role_type_uri === roleTypeUri
    var match2 = this.role2.role_type_uri === roleTypeUri
    if (match1 && match2) {
      throw Error(`Both role types of association ${this.id} match ${roleTypeUri}`)
    }
    return match1 ? this.role1 : match2 ? this.role2 : undefined
  }
}

class Type extends Topic {

  constructor (type) {
    super(type)
    this.dataType   = type.data_type_uri
    this.indexModes = type.index_mode_uris
    this.assocDefs  = utils.instantiateMany(type.assoc_defs, AssocDef)
    this.viewConfig = utils.mapByTypeUri(utils.instantiateMany(type.view_config_topics, Topic))
  }

  isSimple () {
    return this.dataType !== 'dm4.core.composite'
  }

  getViewConfig (childTypeUri) {
    // TODO: don't hardcode config type URI
    const configTopic = this.viewConfig['dm4.webclient.view_config']
    if (!configTopic) {
      console.warn(`Type "${this.uri}" has no view config`)
      return
    }
    const topic = configTopic.childs[childTypeUri]
    return topic && topic.value
  }
}

class TopicType extends Type {

  newTopicModel (simpleValue) {
    const topic = _newTopicModel(this.uri)
    topic.type_uri = this.uri
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
}

class AssocType extends Type {
}

class AssocDef extends Assoc {

  constructor (assocDef) {
    super(assocDef)
    this.parentCard = assocDef.parent_cardinality_uri
    this.childCard  = assocDef.child_cardinality_uri
    // derived properties
    this.parentTypeUri = this.getRole('dm4.core.parent_type').topic_uri
    this.childTypeUri  = this.getRole('dm4.core.child_type').topic_uri
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
    this.topics = utils.mapById(utils.instantiateMany(topicmap.topics, TopicmapTopic))
    this.assocs = utils.mapById(utils.instantiateMany(topicmap.assocs, Assoc))
  }

  getTopic (id) {
    var topic = this.topics[id]
    if (!topic) {
      throw Error(`Topic ${id} not found in topicmap ${this.id}`)
    }
    return topic
  }

  getAssoc (id) {
    var assoc = this.assocs[id]
    if (!assoc) {
      throw Error(`Assoc ${id} not found in topicmap ${this.id}`)
    }
    return assoc
  }

  /**
   * @param   topic   a TopicmapTopic
   */
  addTopic (topic) {
    if (!(topic instanceof TopicmapTopic)) {
      throw Error(topic + " is not a TopicmapTopic")
    }
    this.topics[topic.id] = topic
  }

  /**
   * @param   assoc   an Association
   */
  addAssoc (assoc) {
    if (!(assoc instanceof Association)) {
      throw Error(assoc + " is not an Association")
    }
    this.assocs[assoc.id] = assoc
  }

  forEachTopic (visitor) {
    utils.forEach(this.topics, visitor)
  }

  forEachAssoc (visitor) {
    utils.forEach(this.assocs, visitor)
  }
}

class TopicmapTopic extends Topic {

  constructor (topic) {
    super(topic)
    this.viewProps = topic.view_props
  }

  getPosition () {
    return {
      x: this.viewProps['dm4.topicmaps.x'],
      y: this.viewProps['dm4.topicmaps.y']
    }
  }

  setPosition (pos) {
    this.viewProps['dm4.topicmaps.x'] = pos.x
    this.viewProps['dm4.topicmaps.y'] = pos.y
  }
}

export { Topic, Assoc, TopicType, AssocType, Topicmap, TopicmapTopic }
