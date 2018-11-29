module.exports=function(e){var t={};function i(n){if(t[n])return t[n].exports;var o=t[n]={i:n,l:!1,exports:{}};return e[n].call(o.exports,o,o.exports,i),o.l=!0,o.exports}return i.m=e,i.c=t,i.d=function(e,t,n){i.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},i.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},i.t=function(e,t){if(1&t&&(e=i(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(i.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)i.d(n,o,function(t){return e[t]}.bind(null,o));return n},i.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return i.d(t,"a",t),t},i.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},i.p="",i(i.s=4)}([function(e,t){e.exports=require("axios")},function(e,t){e.exports=require("vue")},function(e,t){e.exports=require("clone")},function(e,t){e.exports=require("debounce")},function(e,t,i){"use strict";i.r(t);var n=i(0),o=i.n(n),r=i(2),s=i.n(r),c=i(3),a=i.n(c);function u(e,t){var i={};return e.forEach(function(e){return i[e[t]]=e}),i}var p={instantiateMany:function(e,t){return e.map(function(e){return new t(e)})},instantiateChilds:function(e){var t={};for(var i in e)t[i]=(n=e[i],Array.isArray(n)?n.map(function(e){return new V(e)}):new V(n));var n;return t},clone:function(e){return s()(e)},debounce:function(e,t,i){return a()(e,t,i)},mapById:function(e){return u(e,"id")},mapByUri:function(e){return u(e,"uri")},mapByTypeUri:function(e){return u(e,"typeUri")},forEach:function(e,t){for(var i in e)t(e[i])},filter:function(e,t){var i={};for(var n in e){var o=e[n];t(o)&&(i[n]=o)}return i},isEmpty:function(e){return!Object.keys(e).length},getCookie:function(e){var t=document.cookie.match(new RegExp("\\b"+e+"=(\\w*)"));return t&&t[1]},setCookie:function(e,t){document.cookie=e+"="+t+";path=/"}},l={getTopic:function(e,t,i){return o.a.get("/core/topic/"+e,{params:{include_childs:t,include_assoc_childs:i}}).then(function(e){return new V(e.data)})},getTopicByUri:function(e,t,i){return o.a.get("/core/topic/by_uri/"+e,{params:{include_childs:t,include_assoc_childs:i}}).then(function(e){return new V(e.data)})},getTopicsByType:function(e){return o.a.get("/core/topic/by_type/"+e).then(function(e){return p.instantiateMany(e.data,V)})},getTopicRelatedTopics:function(e,t){return o.a.get("/core/topic/"+e+"/related_topics",{params:y(t)}).then(function(e){return p.instantiateMany(e.data,B)})},searchTopics:function(e,t){var i={params:{search:e,field:t}};return o.a.get("/core/topic",i).then(function(e){return p.instantiateMany(e.data,V)})},createTopic:function(e){return o.a.post("/core/topic",e).then(function(e){var t=new V(e.data);return t.directives=e.data.directives,t})},updateTopic:function(e){return o.a.put("/core/topic/"+e.id,e).then(function(e){return e.data})},deleteTopic:function(e){return o.a.delete("/core/topic/"+e).then(function(e){return e.data})},getAssoc:function(e,t,i){return o.a.get("/core/association/"+e,{params:{include_childs:t,include_assoc_childs:i}}).then(function(e){return new M(e.data)})},getAssocRelatedTopics:function(e,t){return o.a.get("/core/association/"+e+"/related_topics",{params:y(t)}).then(function(e){return p.instantiateMany(e.data,B)})},createAssoc:function(e){return o.a.post("/core/association",e).then(function(e){var t=new M(e.data);return t.directives=e.data.directives,t})},updateAssoc:function(e){return o.a.put("/core/association/"+e.id,e).then(function(e){return e.data})},deleteAssoc:function(e){return o.a.delete("/core/association/"+e).then(function(e){return e.data})},deleteMulti:function(e){return o.a.delete("/core"+f(e)).then(function(e){return e.data})},getAllTopicTypes:function(){return o.a.get("/core/topictype/all").then(function(e){return p.instantiateMany(e.data,L)})},createTopicType:function(e){return o.a.post("/core/topictype",e).then(function(e){return new L(e.data)})},updateTopicType:function(e){return o.a.put("/core/topictype",e).then(function(e){return e.data})},getAllAssocTypes:function(){return o.a.get("/core/assoctype/all").then(function(e){return p.instantiateMany(e.data,W)})},createAssocType:function(e){return o.a.post("/core/assoctype",e).then(function(e){return new W(e.data)})},updateAssocType:function(e){return o.a.put("/core/assoctype",e).then(function(e){return e.data})},getPlugins:function(){return o.a.get("/core/plugin").then(function(e){return e.data})},getWebsocketConfig:function(){return o.a.get("/core/websockets").then(function(e){return e.data})},createTopicmap:function(e,t,i){return o.a.post("/topicmap",void 0,{params:{name:e,renderer_uri:t,private:i}}).then(function(e){return new V(e.data)})},getTopicmap:function(e){return o.a.get("/topicmap/"+e).then(function(e){return new Y(e.data)})},addTopicToTopicmap:function(e,t,i){d(i,"dmx.topicmaps.x","dmx.topicmaps.y"),o.a.post("/topicmap/"+e+"/topic/"+t,i)},addAssocToTopicmap:function(e,t,i){o.a.post("/topicmap/"+e+"/association/"+t,i)},addRelatedTopicToTopicmap:function(e,t,i,n){n?d(n,"dmx.topicmaps.x","dmx.topicmaps.y"):n={},o.a.post("/topicmap/"+e+"/topic/"+t+"/association/"+i,n)},setTopicViewProps:function(e,t,i){o.a.put("/topicmap/"+e+"/topic/"+t,i)},setAssocViewProps:function(e,t,i){o.a.put("/topicmap/"+e+"/association/"+t,i)},setTopicPosition:function(e,t,i){d(i,"x","y"),o.a.put("/topicmap/"+e+"/topic/"+t+"/"+i.x+"/"+i.y)},setTopicVisibility:function(e,t,i){o.a.put("/topicmap/"+e+"/topic/"+t+"/"+i)},removeAssocFromTopicmap:function(e,t){o.a.delete("/topicmap/"+e+"/association/"+t)},hideMulti:function(e,t){o.a.put("/topicmap/"+e+f(t)+"/visibility/false")},setTopicPositions:function(e,t){o.a.put("/topicmap/"+e,t)},getGeomap:function(e){return o.a.get("/geomap/"+e).then(function(e){return new H(e.data)})},getDomainTopics:function(e,t,i){return o.a.get("/geomap/coord/"+e,{params:{include_childs:t,include_assoc_childs:i}}).then(function(e){return p.instantiateMany(e.data,V)})},createWorkspace:function(e,t,i){return o.a.post("/workspace",void 0,{params:{name:e,uri:t,sharing_mode_uri:i}}).then(function(e){return e.data})},getAssignedTopics:function(e,t,i,n){return o.a.get("/workspace/"+e+"/topics/"+t,{params:{include_childs:i,include_assoc_childs:n}}).then(function(e){return p.instantiateMany(e.data,V)})},getAssignedWorkspace:function(e){return o.a.get("/workspace/object/"+e).then(function(e){return new V(e.data)})},login:function(e){return o.a.post("/accesscontrol/login",void 0,{auth:e})},logout:function(){return o.a.post("/accesscontrol/logout")},getUsername:function(){return o.a.get("/accesscontrol/user").then(function(e){return e.data})},getTopicPermissions:function(e){return o.a.get("/accesscontrol/topic/"+e).then(function(e){return e.data})},getAssocPermissions:function(e){return o.a.get("/accesscontrol/association/"+e).then(function(e){return e.data})},createUserAccount:function(e,t){return o.a.post("/accesscontrol/user_account",{username:e,password:t}).then(function(e){return new V(e.data)})},getXML:function(e){return o.a.get(e).then(function(e){return e.request.responseXML.documentElement})},setErrorHandler:function(e){o.a.interceptors.response.use(function(e){return e},function(t){return e(t),Promise.reject(t)})}};function f(e){var t="";return e.topicIds.length&&(t+="/topics/"+e.topicIds),e.assocIds.length&&(t+="/assocs/"+e.assocIds),t}function y(e){return e&&{assoc_type_uri:e.assocTypeUri,my_role_type_uri:e.myRoleTypeUri,others_role_type_uri:e.othersRoleTypeUri,others_topic_type_uri:e.othersTopicTypeUri}}function d(e,t,i){e[t]=Math.round(e[t]),e[i]=Math.round(e[i])}var h=i(1),v=i.n(h),T={topicTypes:void 0,assocTypes:void 0,dataTypes:void 0,roleTypes:void 0},g={putTopicType:function(e,t){k(t)},putAssocType:function(e,t){A(t)},_newTopicType:function(e,t){_(t.topicType)},_newAssocType:function(e,t){w(t.assocType)},_processDirectives:function(e,t){console.log("Type-cache: processing "+t.length+" directives (UPDATE_TYPE)"),t.forEach(function(e){switch(e.type){case"UPDATE_TOPIC_TYPE":_(e.arg);break;case"UPDATE_ASSOCIATION_TYPE":w(e.arg)}}),v.a.nextTick(function(){console.log("Type-cache: processing "+t.length+" directives (DELETE_TYPE)"),t.forEach(function(e){switch(e.type){case"DELETE_TOPIC_TYPE":t=e.arg.uri,v.a.delete(T.topicTypes,t);break;case"DELETE_ASSOCIATION_TYPE":!function(e){v.a.delete(T.assocTypes,e)}(e.arg.uri)}var t})})}};function m(e,t){return function(i){var n=T[e][i];if(!n)throw Error(t+' "'+i+'" not in type cache');return n}}function _(e){k(new L(e))}function w(e){A(new W(e))}function k(e){if(!(e instanceof L))throw Error(e+" is not a TopicType");v.a.set(T.topicTypes,e.uri,e)}function A(e){if(!(e instanceof W))throw Error(e+" is not an AssocType");v.a.set(T.assocTypes,e.uri,e)}var x={init:function(e){return e.registerModule("typeCache",{state:T,actions:g}),Promise.all([l.getAllTopicTypes().then(function(e){T.topicTypes=p.mapByUri(e),k(new L({uri:"dmx.core.meta_meta_type",typeUri:"dmx.core.meta_meta_meta_type",value:"Meta Meta Type",dataTypeUri:"dmx.core.text",assocDefs:[],viewConfigTopics:[]}))}),l.getAllAssocTypes().then(function(e){T.assocTypes=p.mapByUri(e)}),l.getTopicsByType("dmx.core.data_type").then(function(e){T.dataTypes=p.mapByUri(e)}),l.getTopicsByType("dmx.core.role_type").then(function(e){T.roleTypes=p.mapByUri(e)})]).then(function(){})},getTopicType:m("topicTypes","Topic type"),getAssocType:m("assocTypes","Assoc type"),getDataType:m("dataTypes","Data type"),getRoleType:m("roleTypes","Role type"),getTypeById:function(e){var t=Object.values(T.topicTypes).concat(Object.values(T.assocTypes)).filter(function(t){return t.id===e});if(1!==t.length)throw Error(t.length+" types with ID "+e+" in type cache");return t[0]}},b={};function P(e,t){return(b[e]||(b[e]=t(e))).then(function(e){return e["dmx.accesscontrol.operation.write"]})}var U={isTopicWritable:function(e){return P(e,l.getTopicPermissions)},isAssocWritable:function(e){return P(e,l.getAssocPermissions)},clear:function(){b={}}},E=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var i=arguments[t];for(var n in i)Object.prototype.hasOwnProperty.call(i,n)&&(e[n]=i[n])}return e},I=function(){function e(e,t){for(var i=0;i<t.length;i++){var n=t[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}return function(t,i,n){return i&&e(t.prototype,i),n&&e(t,n),t}}();function O(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function C(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}function j(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}var D=function(){function e(t){if(j(this,e),"Object"!==t.constructor.name)throw Error("DeepaMehtaObject constructor expects plain Object, got "+t.constructor.name+" ("+t+")");this.id=t.id,this.uri=t.uri,this.typeUri=t.typeUri,this.value=t.value,this.childs=p.instantiateChilds(t.childs)}return I(e,[{key:"getChildTopic",value:function(e){return this.childs[e]}},{key:"fillChilds",value:function(){var e=this;return this.getType().assocDefs.forEach(function(t){var i=e.childs[t.assocDefUri],n=void 0;i||(n=new V(t.getChildType().emptyInstance())),t.isOne()?(i?i.fillChilds():i=n,i.fillRelatingAssoc(t)):(i?i.forEach(function(e){e.fillChilds()}):i=[n],i.forEach(function(e){e.fillRelatingAssoc(t)})),n&&v.a.set(e.childs,t.assocDefUri,i)}),this}},{key:"clone",value:function(){return p.clone(this)}},{key:"typeName",get:function(){return this.getType().value}}]),e}(),V=function(e){function t(e){j(this,t);var i=O(this,(t.__proto__||Object.getPrototypeOf(t)).call(this,e));return e.assoc&&(i.assoc=new M(e.assoc)),i}return C(t,D),I(t,[{key:"getType",value:function(){return x.getTopicType(this.typeUri)}},{key:"isType",value:function(){return"dmx.core.topic_type"===this.typeUri||"dmx.core.assoc_type"===this.typeUri}},{key:"isAssocDef",value:function(){return!1}},{key:"getRelatedTopics",value:function(){return l.getTopicRelatedTopics(this.id)}},{key:"update",value:function(){return console.log("update",this),l.updateTopic(this)}},{key:"isWritable",value:function(){return U.isTopicWritable(this.id)}},{key:"isTopic",value:function(){return!0}},{key:"isAssoc",value:function(){return!1}},{key:"newViewTopic",value:function(e){return new q({id:this.id,uri:this.uri,typeUri:this.typeUri,value:this.value,childs:{},viewProps:e})}},{key:"asType",value:function(){if("dmx.core.topic_type"===this.typeUri)return x.getTopicType(this.uri);if("dmx.core.assoc_type"===this.typeUri)return x.getAssocType(this.uri);throw Error("Not a type: "+this)}},{key:"getIcon",value:function(){return this.getType()._getIcon()||""}},{key:"fillRelatingAssoc",value:function(e){this.assoc?this.assoc.fillChilds():this.assoc=new M(e.getInstanceLevelAssocType().emptyInstance())}}]),t}(),M=function(e){function t(e){j(this,t);var i=O(this,(t.__proto__||Object.getPrototypeOf(t)).call(this,e));return e.role1&&(i.role1=new R(e.role1)),e.role2&&(i.role2=new R(e.role2)),i}return C(t,D),I(t,[{key:"getRole",value:function(e){var t=this.role1.roleTypeUri===e,i=this.role2.roleTypeUri===e;if(t&&i)throw Error("Both role types of association "+this.id+" match "+e);return t?this.role1:i?this.role2:void 0}},{key:"isTopicPlayer",value:function(e){return this.role1.topicId===e||this.role2.topicId===e}},{key:"hasAssocPlayer",value:function(){return this.role1.hasAssocPlayer()||this.role2.hasAssocPlayer()}},{key:"getType",value:function(){return x.getAssocType(this.typeUri)}},{key:"isType",value:function(){return!1}},{key:"isAssocDef",value:function(){return"dmx.core.composition_def"===this.typeUri}},{key:"getRelatedTopics",value:function(){return l.getAssocRelatedTopics(this.id)}},{key:"update",value:function(){return console.log("update",this),l.updateAssoc(this)}},{key:"isWritable",value:function(){return U.isAssocWritable(this.id)}},{key:"isTopic",value:function(){return!1}},{key:"isAssoc",value:function(){return!0}},{key:"newViewAssoc",value:function(e){return new F({id:this.id,uri:this.uri,typeUri:this.typeUri,value:this.value,childs:{},role1:this.role1,role2:this.role2,viewProps:e})}},{key:"asAssocDef",value:function(){var e=this.getRole("dmx.core.parent_type");return x.getTypeById(e.topicId).getAssocDefById(this.id)}},{key:"getColor",value:function(){return this.getType()._getColor()||"hsl(0, 0%, 80%)"}}]),t}(),R=function(){function e(t){j(this,e),this.topicId=t.topicId,this.topicUri=t.topicUri,this.assocId=t.assocId,this.roleTypeUri=t.roleTypeUri}return I(e,[{key:"getType",value:function(){return x.getRoleType(this.roleTypeUri)}},{key:"hasAssocPlayer",value:function(){return this.assocId}},{key:"getPlayerId",value:function(){if(this.hasAssocPlayer())return this.assocId;if(void 0!==this.topicId)return this.topicId;throw Error("getPlayerId() called when a topic player is specified by URI")}},{key:"getPlayer",value:function(){if(void 0!==this.topicId)return l.getTopic(this.topicId);if(void 0!==this.topicUri)return l.getTopicByUri(this.topicUri);throw Error("Role "+JSON.stringify(this)+" is not a topic player")}},{key:"typeName",get:function(){return this.getType().value}}]),e}(),B=function(e){function t(e){j(this,t);var i=O(this,(t.__proto__||Object.getPrototypeOf(t)).call(this,e));return i.assoc=new M(e.assoc),i}return C(t,V),t}(),S=function(e){function t(e){j(this,t);var i=O(this,(t.__proto__||Object.getPrototypeOf(t)).call(this,e));return i.dataTypeUri=e.dataTypeUri,i.assocDefs=p.instantiateMany(e.assocDefs,N),i.viewConfig=p.mapByTypeUri(p.instantiateMany(e.viewConfigTopics,V)),i}return C(t,V),I(t,[{key:"isSimple",value:function(){return["dmx.core.text","dmx.core.html","dmx.core.number","dmx.core.boolean"].includes(this.dataTypeUri)}},{key:"isComposite",value:function(){return!this.isSimple()}},{key:"isValue",value:function(){return"dmx.core.value"===this.dataTypeUri}},{key:"isIdentity",value:function(){return"dmx.core.identity"===this.dataTypeUri}},{key:"getDataType",value:function(){return x.getDataType(this.dataTypeUri)}},{key:"getAssocDefById",value:function(e){var t=this.assocDefs.filter(function(t){return t.id===e});if(1!==t.length)throw Error('Type "'+this.uri+'" has '+t.length+" assoc defs with ID "+e);return t[0]}},{key:"getViewConfig",value:function(e){var t=this.viewConfig["dmx.webclient.view_config"];if(t){var i=t.childs[e];return i&&i.value}}},{key:"emptyInstance",value:function(){var e,t=this;return{id:-1,uri:"",typeUri:this.uri,value:"",childs:(e={},t.assocDefs.forEach(function(t){var i=t.getChildType().emptyInstance();e[t.assocDefUri]=t.isOne()?i:[i]}),e)}}},{key:"toExternalForm",value:function(){var e=JSON.parse(JSON.stringify(this));return e.assocDefs.forEach(function(e){e.assocTypeUri=e.typeUri,delete e.typeUri}),console.log("toExternalForm",e),e}}]),t}(),L=function(e){function t(){return j(this,t),O(this,(t.__proto__||Object.getPrototypeOf(t)).apply(this,arguments))}return C(t,S),I(t,[{key:"newTopicModel",value:function(e){var t=function t(i){var n=x.getTopicType(i);if(n.isSimple())return{value:e};var o=n.assocDefs[0],r=t(o.childTypeUri);return{childs:(s={},c=o.assocDefUri,a=o.isOne()?r:[r],c in s?Object.defineProperty(s,c,{value:a,enumerable:!0,configurable:!0,writable:!0}):s[c]=a,s)};var s,c,a}(this.uri);return t.typeUri=this.uri,t}},{key:"isTopicType",value:function(){return!0}},{key:"isAssocType",value:function(){return!1}},{key:"_getIcon",value:function(){return this.getViewConfig("dmx.webclient.icon")}},{key:"update",value:function(){return l.updateTopicType(this.toExternalForm())}}]),t}(),W=function(e){function t(){return j(this,t),O(this,(t.__proto__||Object.getPrototypeOf(t)).apply(this,arguments))}return C(t,S),I(t,[{key:"isTopicType",value:function(){return!1}},{key:"isAssocType",value:function(){return!0}},{key:"_getColor",value:function(){return this.getViewConfig("dmx.webclient.color")}},{key:"update",value:function(){return l.updateAssocType(this.toExternalForm())}}]),t}(),N=function(e){function t(e){j(this,t);var i=O(this,(t.__proto__||Object.getPrototypeOf(t)).call(this,e));i.viewConfig=p.mapByTypeUri(p.instantiateMany(e.viewConfigTopics,V)),i.parentTypeUri=i.getRole("dmx.core.parent_type").topicUri,i.childTypeUri=i.getRole("dmx.core.child_type").topicUri;var n=i.childs["dmx.core.assoc_type#dmx.core.custom_assoc_type"];i.customAssocTypeUri=n&&n.uri,i.assocDefUri=i.childTypeUri+(i.customAssocTypeUri?"#"+i.customAssocTypeUri:""),i.instanceLevelAssocTypeUri=i.customAssocTypeUri||i._defaultInstanceLevelAssocTypeUri();var o=i.childs["dmx.core.cardinality"];if(!o)throw Error("Assoc def "+i.assocDefUri+" has no cardinality child (parent type: "+i.parentTypeUri+")");i.childCardinalityUri=o.uri;var r=i.childs["dmx.core.identity_attr"];i.isIdentityAttr=!!r&&r.value;var s=i.childs["dmx.core.include_in_label"];return i.includeInLabel=!!s&&s.value,i}return C(t,M),I(t,[{key:"getChildType",value:function(){return x.getTopicType(this.childTypeUri)}},{key:"getInstanceLevelAssocType",value:function(){return x.getAssocType(this.instanceLevelAssocTypeUri)}},{key:"getCustomAssocType",value:function(){return this.customAssocTypeUri&&x.getAssocType(this.customAssocTypeUri)}},{key:"isOne",value:function(){return"dmx.core.one"===this.childCardinalityUri}},{key:"isMany",value:function(){return"dmx.core.many"===this.childCardinalityUri}},{key:"getViewConfig",value:function(e){var t=this._getViewConfig(e);return t&&t.value}},{key:"_getViewConfig",value:function(e){var t=this.viewConfig["dmx.webclient.view_config"];if(t)return t.childs[e]}},{key:"_defaultInstanceLevelAssocTypeUri",value:function(){if(!this.isAssocDef())throw Error('Unexpected association type URI: "'+this.typeUri+'"');return"dmx.core.composition"}},{key:"emptyChildInstance",value:function(){var e=this.getChildType().emptyInstance();return e.assoc=this.getInstanceLevelAssocType().emptyInstance(),new V(e)}}]),t}(),Y=function(e){function t(e){j(this,t);var i=O(this,(t.__proto__||Object.getPrototypeOf(t)).call(this,e.info));return i.topics=p.mapById(p.instantiateMany(e.topics,q)),i.assocs=p.mapById(p.instantiateMany(e.assocs,F)),i}return C(t,V),I(t,[{key:"getTopic",value:function(e){var t=this.getTopicIfExists(e);if(!t)throw Error("Topic "+e+" not found in topicmap "+this.id);return t}},{key:"getTopicIfExists",value:function(e){return this.topics[e]}},{key:"hasTopic",value:function(e){return this.getTopicIfExists(e)}},{key:"addTopic",value:function(e){if(!(e instanceof q))throw Error("addTopic() expects a ViewTopic, got "+e.constructor.name);v.a.set(this.topics,e.id,e)}},{key:"revealTopic",value:function(e,t){var i={},n=this.getTopicIfExists(e.id);if(n)n.isVisible()||(n.setVisibility(!0),i.type="show");else{var o=E({},t?{"dmx.topicmaps.x":t.x,"dmx.topicmaps.y":t.y}:void 0,{"dmx.topicmaps.visibility":!0,"dmx.topicmaps.pinned":!1});this.addTopic(e.newViewTopic(o)),i.type="add",i.viewProps=o}return i}},{key:"removeTopic",value:function(e){v.a.delete(this.topics,e)}},{key:"forEachTopic",value:function(e){p.forEach(this.topics,e)}},{key:"filterTopics",value:function(e){return Object.values(this.topics).filter(e)}},{key:"getAssoc",value:function(e){var t=this.getAssocIfExists(e);if(!t)throw Error("Assoc "+e+" not found in topicmap "+this.id);return t}},{key:"getAssocs",value:function(e){var t=[];return this.forEachAssoc(function(i){i.isTopicPlayer(e)&&t.push(i)}),t}},{key:"getAssocIfExists",value:function(e){return this.assocs[e]}},{key:"hasAssoc",value:function(e){return this.getAssocIfExists(e)}},{key:"addAssoc",value:function(e){if(!(e instanceof F))throw Error("addAssoc() expects a ViewAssoc, got "+e.constructor.name);v.a.set(this.assocs,e.id,e)}},{key:"revealAssoc",value:function(e){var t={};if(!this.getAssocIfExists(e.id)){var i={"dmx.topicmaps.pinned":!1};this.addAssoc(e.newViewAssoc(i)),t.type="add",t.viewProps=i}return t}},{key:"removeAssoc",value:function(e){v.a.delete(this.assocs,e)}},{key:"removeAssocs",value:function(e){var t=this;this.getAssocs(e).forEach(function(e){t.removeAssoc(e.id)})}},{key:"forEachAssoc",value:function(e){p.forEach(this.assocs,e)}},{key:"filterAssocs",value:function(e){return Object.values(this.assocs).filter(e)}},{key:"getObject",value:function(e){var t=this.getTopicIfExists(e)||this.getAssocIfExists(e);if(!t)throw Error("Topic/assoc "+e+" not found in topicmap "+this.id);return t}},{key:"getPosition",value:function(e){var t=this.getObject(e);if(t.isTopic())return t.getPosition();var i=this.getPosition(t.role1.getPlayerId()),n=this.getPosition(t.role2.getPlayerId());return{x:(i.x+n.x)/2,y:(i.y+n.y)/2}}}]),t}(),q=function(e){function t(e){j(this,t);var i=O(this,(t.__proto__||Object.getPrototypeOf(t)).call(this,e));return i.viewProps=e.viewProps,i}return C(t,V),I(t,[{key:"getPosition",value:function(){return{x:this.getViewProp("dmx.topicmaps.x"),y:this.getViewProp("dmx.topicmaps.y")}}},{key:"isVisible",value:function(){return this.getViewProp("dmx.topicmaps.visibility")}},{key:"isPinned",value:function(){return this.getViewProp("dmx.topicmaps.pinned")}},{key:"setPosition",value:function(e){this.setViewProp("dmx.topicmaps.x",e.x),this.setViewProp("dmx.topicmaps.y",e.y)}},{key:"setVisibility",value:function(e){this.setViewProp("dmx.topicmaps.visibility",e)}},{key:"setPinned",value:function(e){this.setViewProp("dmx.topicmaps.pinned",e)}},{key:"getViewProp",value:function(e){return this.viewProps[e]}},{key:"setViewProp",value:function(e,t){v.a.set(this.viewProps,e,t)}},{key:"fetchObject",value:function(){return l.getTopic(this.id,!0,!0)}}]),t}(),F=function(e){function t(e){j(this,t);var i=O(this,(t.__proto__||Object.getPrototypeOf(t)).call(this,e));return i.viewProps=e.viewProps,i}return C(t,M),I(t,[{key:"isPinned",value:function(){return this.getViewProp("dmx.topicmaps.pinned")}},{key:"setPinned",value:function(e){this.setViewProp("dmx.topicmaps.pinned",e)}},{key:"getViewProp",value:function(e){return this.viewProps[e]}},{key:"setViewProp",value:function(e,t){v.a.set(this.viewProps,e,t)}},{key:"fetchObject",value:function(){return l.getAssoc(this.id,!0,!0)}}]),t}(),H=function(e){function t(e){j(this,t);var i=O(this,(t.__proto__||Object.getPrototypeOf(t)).call(this,e.info));return i.geoCoordTopics=e.geoCoordTopics,i}return C(t,V),t}();console.log("[DMX] Client API 2018/11/29");t.default={DeepaMehtaObject:D,Topic:V,Assoc:M,AssocRole:R,RelatedTopic:B,Type:S,TopicType:L,AssocType:W,Topicmap:Y,ViewTopic:q,ViewAssoc:F,Geomap:H,restClient:l,permCache:U,utils:p,init:function(e){return e.onHttpError&&l.setErrorHandler(e.onHttpError),x.init(e.store)}}}]);