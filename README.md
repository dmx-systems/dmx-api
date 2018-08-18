# DeepaMehta 5 base types and API

## Version History

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
Aug 18, 2018
