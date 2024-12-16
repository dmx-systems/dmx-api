# DMX 5 base types and API

## Version History

**4.0** -- Oct 16, 2024

* BREAKING CHANGES
    - requires Vue 3 (instead Vue 2)

**3.1** -- Oct 16, 2024

* Adapted to DMX 5.3.5 (account management)

**3.0.1** -- Jun 6, 2023

* Improvement:
    - In case of a dropped WebSocket connection an alert is shown and the page is reloaded

**3.0** -- May 19, 2023

Version 3.0 of the `dmx-api` library extends/modifies the API in order to support a wider variety of frontend
applications. Additionally, depending on application type, the launch time is reduced as less data is transferred from
server ([#497](https://git.dmx.systems/dmx-platform/dmx-platform/-/issues/497),
[#501](https://git.dmx.systems/dmx-platform/dmx-platform/-/issues/501)). This required some breaking changes in the
library's `init()` function.

* BREAKING CHANGES
    - changed behavior of the library's `init()` function:
        - The client-side type cache is not fully pre-populated by default anymore. Instead the application pass
          `topicTypes` config to pre-populate selectively, or pass `all`. Depending on application type this results in
          less data transfer at application launch.
        - The SVG utility for FontAwesome icons is not initialized by default anymore. Instead an application can
          initialize it on-demand (by calling `dmx.icons.init()`). Applications who don't need it launch quicker as
          downloading the FontAwesome SVG data (450K) is omitted.
    - rename class `Type` -> `DMXType`
    - remove `getPosition()` from `ViewTopic`. Use the new `pos` getter instead.
* Improvement:
    - The library's `init()` function optionally opens the WebSocket for client-synchronization (if `messageHandler`
      config is passed). The application no longer depends on
      [dmx-websocket](https://github.com/dmx-systems/dmx-websocket) module then.
    - Vanilla [axios](https://github.com/axios/axios) http instance (without error interceptor set by application) is
      exported as `rpc._http`.
* Model:
    - change `Type`'s `newFormModel()`:
        - `object` parameter is now optional
        - add `allChildren` parameter (optional)
    - add (optional) `level` parameter to `CompDef`'s `emptyChildInstance()`
    - add `panX`, `panY`, `zoom`, `bgImageUrl` getters to `Topicmap`
    - add `updateTopic()`, `updateAssoc()` to `Topicmap` (part of
      [dmx-topicmap-panel](https://github.com/dmx-systems/dmx-topicmap-panel) protocol)
    - add `pos` getter to `ViewTopic`
* RPC:
    - add `getTopicType()` and `getAssocType()`
    - add `includeChildren` parameter to `getTopicmap()`
    - add `includeChildren` and `includeAssocChildren` parameters to `getAssignedWorkspace()`
    - add `getMemberships()` to get the members of a workspace
    - add `bulkUpdateUserMemberships()` and `bulkUpdateWorkspaceMemberships()`
    - add `deleteWorkspace()`
    - change `updateTopic()`: returns `Topic` plus directives (formerly just directives)
    - change `login()`: returned promise resolves with username (formerly undefined)
* Utils:
    - add `stripHtml()`
* Fix:
    - fixed a bug where nested entities loose their child values while update request (thanks to @gevlish)

**2.1** -- Jun 13, 2021

* Model:
    * add class `RoleType`
    * add `isEditable` getter to `DMXObject`
    * add `isRoleType` getter to `DMXObject`
    * add `asRoleType()` to `Topic`
    * add `arrowShape` and `hollow` getters to `Player`
    * add `isNoneditable` getter to `Type`
* RPC:
    * add `getAllRoleTypes()`
    * add `getTopicTypeImplicitly()`, `getAssocTypeImplicitly()`, `getRoleTypeImplicitly()`
    * add `getConfigDefs()`, `getConfigTopic()`, `updateConfigTopic()`
* Utils:
    * add `formatFileSize()`
    * add `round()`
* Fixes:
    * Model: fix `TopicType.newTopicModel()` regarding identity attributes
    * Model: `_newInstance()` fills in `0` object value as is (not as `''`)
    * Type cache: `initTypeCache` action returns promise

**2.0** -- Dec 30, 2020

* BREAKING CHANGES
    * rename `restClient` -> `rpc`
    * various `dm5` -> `dmx` renamings
    * Model:
        * replace various `DMXObject`, `Type`, `CompDef` methods by getters
        * drop various `DMXObject`, `Topic`, `Type` methods
* Feature:
    * SVG icon utility (for FontAwesome 4.7)
    * support for `SameSite` cookie attribute
* Model:
    * add `newFormModel()` to `Type`
    * add `getOtherPlayerId()` to `Assoc`
* RPC:
    * add `query()`
* Chore:
    * adapt URLs to `github.com/dmx-systems`
    * remove `/dist` from repo
    * code run through `eslint`

**1.0** -- Aug 4, 2020

* Feature: Configurable Icon Renderers
    * new config option: `iconRenderers`
* Model:
    * drop `toExternalForm()` method from `Type` class
* REST client:
    * add `getTopicByValue()`, `getTopicsByValue()`
    * add `queryTopics()`
    * add `getAdminWorkspaceId()`
    * generic `getPermissions()` method
* Global:
    * add `isAdmin()`
* Fix:
    * Model: `fillChildren()` when multi-value is empty array

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

* Model: `Topicmap.revealTopic()`'s `pos` param is optional. If not given it's up to the topicmap renderer to position
  the topic.
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
Oct 16, 2024
