# DeepaMehta 5 base types and API

## Version History

**0.37** -- Mar 30, 2020

* Remove "Geomaps" API
* Model:
    * add `assignToWorkspace()` to `DMXObject`
* REST client:
    * add `assignToWorkspace()` method

**0.36** -- Nov 21, 2019

* Model:
    * add `equals()` to `DMXObject`
    * add `hasObject(id)` and `hasVisibleObject()` to `Topicmap`
    * Fix: TopicType's `newTopicModel()` initializes `typeUri` of all child topic's (recursively)
* REST client:
    * add `getPrivateWorkspace()` method
    * add `searchChildTopics` boolean param (optional) to `queryTopicsFulltext()`
    * clears the permission cache on `login()`/`logout()`
* Type cache: add `getAllTopicTypes()`, `getAllAssocTypes()`, `getAllDataTypes()`, `getAllRoleTypes()`  methods
* Utils: add `deleteCookie()`

**0.35** -- Aug 26, 2019

* Utils: `fulltextQuery()` supports single-letter whole-word search

**0.34** -- Aug 23, 2019

* Utils: add param `allowSingleLetterSearch` to `fulltextQuery()` 

**0.33** -- Aug 15, 2019

* Model: add `getRelatedTopicsWithoutChilds()` to DMXObject
* REST client:
    * add `getRelatedTopicsWithoutChilds()`
    * suppress error handler for certain requests
* Utils: add `fulltextQuery()`

**0.32** -- Jul 22, 2019

* Several API and JSON renamings:
    * "AssocDef" -> "CompDef" (composition definition)
    * "Role" -> "Player"
    * "Childs" -> "Children"
* REST client:
    * `createTopicmap()`: drop `isPrivate` param, add `viewProps` param
    * Rename `searchTopics()` -> `queryTopicsFulltext()`
* Change license to `AGPL-3.0`

**0.31** -- May 27, 2019

* Support for icon color and background color
* Support for role types
* REST client: support for authorization methods
* Model: replace DMXObject `getType()` by `type` getter

**0.30** -- Apr 22, 2019

* Model: topic/assoc hide implies unpin
* REST client: Topicmap `setTopicPositions()` does x/y rounding
* REST client: adapt to server-side Topicmaps API (`setTopicPositions()` sends object)

**0.29** -- Apr 1, 2019

* Support for assoc visibility
* Support for topicmap pan/zoom state
* Support for geomap center/zoom state

**0.28** -- Mar 2, 2019

* Support for retrieving topic/assoc meta data (timestamps, creator/modifier, workspace assignment, ...)

**0.27** -- Jan 29, 2019

* Model: more support for assocs with assoc players
* Type cache: exported as `dm5.typeCache`
* Library is build as UMD and advertised via `unpkg` field (package.json)
* Change license to `GPL-3.0-or-later`

**0.26** -- Jan 5, 2019

* Model: consolidate `DMXObject`, `Player`, and `Topicmap`

**0.25** -- Dec 21, 2018

* Various changes in Model, REST client, and Type cache

**0.24** -- Nov 24, 2018

* Model:
    * add `isTopicType()`, `isAssocType()` to `Type`
    * adapt `Type.isComposite()` to new data type `dmx.core.composite`
    * drop `indexModes` from `Type`
    * drop `getIdentityAssocDefs()` from `Type`
    * Fix: topicmap `ViewAssoc` reactivity
    * Fix: `AssocRole` `getPlayer()` for topic 0
* REST client:
    * add `createUserAccount()`

**0.23** -- Nov 7, 2018

* Support for geomaps (new model class `Geomap`, new REST client methods `getGeomap()` and `getDomainTopics()`)
* Model: new methods in `Type`: `isValue()`, `isIdentity()`, `getIdentityAssocDefs()`
* Utils: new method `debounce()`

**0.22** -- Oct 21, 2018

* Model:
    * new methods in `Topicmap`: `filterTopics()`, `filterAssocs()`
    * new method in `Assoc`: `getColor()`
    * dropped method in `Topicmap`: `visibleTopicIds()`. Use the more generic `filterTopics()` instead.

**0.21** -- Oct 6, 2018

* Model: add `Topicmap.visibleTopicIds()`
* Model fix: `Topicmap` reactivity

**0.20** -- Aug 18, 2018

* Model:
    * Drop assoc types "Aggregation Definition" and "Aggregation"
    * "Cardinality" definition makes use of type system
    * Drop concept "Parent Cardinality"
* REST client:
    * New function: `createAssocType()`
    * `createTopic()` and `createAssoc()` return directives too
    * Config property `onHttpError` is optional
* Type cache: fix synchronization of `UPDATE_TYPE` directives

**0.19** -- Jul 31, 2018

* Change type URI prefixes `dm4` -> `dmx`
* Add GitLab CI/CD

**0.18** -- Jul 17, 2018

* Model extension: `AssocRole.getPlayerId()`, `Topicmap.getObject(id)`, `Topicmap.getPosition(id)`
* Type cache: process delete-type directives

**0.17** -- Jun 20, 2018

* Support for backend "multi" API:
    * New in REST client: `hideMulti()`, `deleteMulti()`, `setTopicPositions()`
* Model: new in `ViewTopic`/`ViewAssoc`: `isPinned()`, `setPinned()`

**0.16** -- May 1, 2018

* Distribute in pre-compiled form

**0.15** -- Apr 10, 2018

* Init option `onHttpError` allows the host application to handle HTTP errors.

**0.14** -- Apr 7, 2018

* Model: class `ViewAssoc` is exported
* REST client fix: `createTopicmap()` returns a `Topic` object

**0.13** -- Mar 25, 2018

* Model: `Topicmap.revealTopic()`'s `pos` param is optional. If not given it's up to the topicmap renderer to position the topic.
* Utils: `clone()` for deep-cloning arbitrary objects
* Depends on module `clone` instead `lodash.clonedeep`

**0.12** -- Mar 10, 2018

* Model + REST client: support for "view props"
* Model: new in `ViewTopic`/`ViewAssoc`: `fetchObject()`
* Utils: `isEmpty()`
* Utils fix: `instantiateChilds()` has no side effect

**0.11** -- Feb 21, 2018

* Model: new in `DeepaMehtaObject`: `isTopic()`, `isAssoc()`, `clone()`
* REST client: `logout()` returns a promise.

**0.10** -- Feb 3, 2018

* Support for access control

**0.9** -- Jan 13, 2018

* Support for cardinality "many"

**0.8** -- Dec 5, 2017

* Support for "relating associations"

**0.7** -- Nov 19, 2017

* Client-synchronization for types

**0.6** -- Oct 19, 2017

* Create/edit types

**0.5** -- Oct 3, 2017

* Create topicmaps/workspaces

**0.4** -- Jul 17, 2017

**0.3** -- Jun 30, 2017

**0.2** -- Jun 14, 2017

**0.1** -- Apr 28, 2017

------------
Jörg Richter  
Mar 30, 2020
