# DeepaMehta 5 base types and API

## Version History

**0.13** -- Mar 25, 2018

* Model: `Topicmap.revealTopic()`'s `pos` param is optional. If not given it's up to the topicmap renderer to position the topic.
* Utils: `clone()` for deep-cloning arbitrary objects
* Depends on module `clone` instead `lodash.clonedeep`

**0.12** -- Mar 10, 2018

* Model + REST client: support for "view props"
* Model: `ViewTopic` and `ViewAssoc` have `fetchObject()`
* Utils: `isEmpty()`
* Utils fix: `instantiateChilds()` has no side effect

**0.11** -- Feb 21, 2018

* Model: `DeepaMehtaObject` has `isTopic()`, `isAssoc()`, `clone()`
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
Mar 25, 2018
