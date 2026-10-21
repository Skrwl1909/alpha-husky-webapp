/* tactical_ops.js v3.5.0-player-clarity-return-loop */
var TacticalOpsBundle=(function(e){Object.defineProperties(e,{__esModule:{value:!0},[Symbol.toStringTag]:{value:`Module`}});var t=Object.create,n=Object.defineProperty,r=Object.getOwnPropertyDescriptor,i=Object.getOwnPropertyNames,a=Object.getPrototypeOf,o=Object.prototype.hasOwnProperty,s=(e,t)=>()=>(t||(e((t={exports:{}}).exports,t,t.exports),e=null),t.exports),c=(e,t)=>{let r={};for(var i in e)n(r,i,{get:e[i],enumerable:!0});return t||n(r,Symbol.toStringTag,{value:`Module`}),r},l=(e,t,a,s)=>{if(t&&typeof t==`object`||typeof t==`function`)for(var c=i(t),l=0,u=c.length,d;l<u;l++)d=c[l],!o.call(e,d)&&d!==a&&n(e,d,{get:(e=>t[e]).bind(null,d),enumerable:!(s=r(t,d))||s.enumerable});return e},u=(e,r,i)=>(i=e==null?{}:t(a(e)),l(r||!e||!e.__esModule||!o.call(e,`default`)?n(i,`default`,{value:e,enumerable:!0}):i,e)),d=s((e=>{function t(e,t){var n=e.length;e.push(t);a:for(;0<n;){var r=n-1>>>1,a=e[r];if(0<i(a,t))e[r]=t,e[n]=a,n=r;else break a}}function n(e){return e.length===0?null:e[0]}function r(e){if(e.length===0)return null;var t=e[0],n=e.pop();if(n!==t){e[0]=n;a:for(var r=0,a=e.length,o=a>>>1;r<o;){var s=2*(r+1)-1,c=e[s],l=s+1,u=e[l];if(0>i(c,n))l<a&&0>i(u,c)?(e[r]=u,e[l]=n,r=l):(e[r]=c,e[s]=n,r=s);else if(l<a&&0>i(u,n))e[r]=u,e[l]=n,r=l;else break a}}return t}function i(e,t){var n=e.sortIndex-t.sortIndex;return n===0?e.id-t.id:n}if(e.unstable_now=void 0,typeof performance==`object`&&typeof performance.now==`function`){var a=performance;e.unstable_now=function(){return a.now()}}else{var o=Date,s=o.now();e.unstable_now=function(){return o.now()-s}}var c=[],l=[],u=1,d=null,f=3,p=!1,m=!1,h=!1,g=!1,_=typeof setTimeout==`function`?setTimeout:null,v=typeof clearTimeout==`function`?clearTimeout:null,y=typeof setImmediate<`u`?setImmediate:null;function b(e){for(var i=n(l);i!==null;){if(i.callback===null)r(l);else if(i.startTime<=e)r(l),i.sortIndex=i.expirationTime,t(c,i);else break;i=n(l)}}function x(e){if(h=!1,b(e),!m){if(n(c)!==null)m=!0,ee||(ee=!0,w());else{var t=n(l);t!==null&&ae(x,t.startTime-e)}}}var ee=!1,S=-1,C=5,te=-1;function ne(){return g?!0:!(e.unstable_now()-te<C)}function re(){if(g=!1,ee){var t=e.unstable_now();te=t;var i=!0;try{a:{m=!1,h&&(h=!1,v(S),S=-1),p=!0;var a=f;try{b:{for(b(t),d=n(c);d!==null&&!(d.expirationTime>t&&ne());){var o=d.callback;if(typeof o==`function`){d.callback=null,f=d.priorityLevel;var s=o(d.expirationTime<=t);if(t=e.unstable_now(),typeof s==`function`){d.callback=s,b(t),i=!0;break b}d===n(c)&&r(c),b(t)}else r(c);d=n(c)}if(d!==null)i=!0;else{var u=n(l);u!==null&&ae(x,u.startTime-t),i=!1}}break a}finally{d=null,f=a,p=!1}i=void 0}}finally{i?w():ee=!1}}}var w;if(typeof y==`function`)w=function(){y(re)};else if(typeof MessageChannel<`u`){var T=new MessageChannel,ie=T.port2;T.port1.onmessage=re,w=function(){ie.postMessage(null)}}else w=function(){_(re,0)};function ae(t,n){S=_(function(){t(e.unstable_now())},n)}e.unstable_IdlePriority=5,e.unstable_ImmediatePriority=1,e.unstable_LowPriority=4,e.unstable_NormalPriority=3,e.unstable_Profiling=null,e.unstable_UserBlockingPriority=2,e.unstable_cancelCallback=function(e){e.callback=null},e.unstable_forceFrameRate=function(e){0>e||125<e?console.error(`forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported`):C=0<e?Math.floor(1e3/e):5},e.unstable_getCurrentPriorityLevel=function(){return f},e.unstable_next=function(e){switch(f){case 1:case 2:case 3:var t=3;break;default:t=f}var n=f;f=t;try{return e()}finally{f=n}},e.unstable_requestPaint=function(){g=!0},e.unstable_runWithPriority=function(e,t){switch(e){case 1:case 2:case 3:case 4:case 5:break;default:e=3}var n=f;f=e;try{return t()}finally{f=n}},e.unstable_scheduleCallback=function(r,i,a){var o=e.unstable_now();switch(typeof a==`object`&&a?(a=a.delay,a=typeof a==`number`&&0<a?o+a:o):a=o,r){case 1:var s=-1;break;case 2:s=250;break;case 5:s=1073741823;break;case 4:s=1e4;break;default:s=5e3}return s=a+s,r={id:u++,callback:i,priorityLevel:r,startTime:a,expirationTime:s,sortIndex:-1},a>o?(r.sortIndex=a,t(l,r),n(c)===null&&r===n(l)&&(h?(v(S),S=-1):h=!0,ae(x,a-o))):(r.sortIndex=s,t(c,r),m||p||(m=!0,ee||(ee=!0,w()))),r},e.unstable_shouldYield=ne,e.unstable_wrapCallback=function(e){var t=f;return function(){var n=f;f=t;try{return e.apply(this,arguments)}finally{f=n}}}})),f=s(((e,t)=>{t.exports=d()})),p=s((e=>{var t=Symbol.for(`react.transitional.element`),n=Symbol.for(`react.portal`),r=Symbol.for(`react.fragment`),i=Symbol.for(`react.strict_mode`),a=Symbol.for(`react.profiler`),o=Symbol.for(`react.consumer`),s=Symbol.for(`react.context`),c=Symbol.for(`react.forward_ref`),l=Symbol.for(`react.suspense`),u=Symbol.for(`react.memo`),d=Symbol.for(`react.lazy`),f=Symbol.for(`react.activity`),p=Symbol.iterator;function m(e){return typeof e!=`object`||!e?null:(e=p&&e[p]||e[`@@iterator`],typeof e==`function`?e:null)}var h={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},g=Object.assign,_={};function v(e,t,n){this.props=e,this.context=t,this.refs=_,this.updater=n||h}v.prototype.isReactComponent={},v.prototype.setState=function(e,t){if(typeof e!=`object`&&typeof e!=`function`&&e!=null)throw Error(`takes an object of state variables to update or a function which returns an object of state variables.`);this.updater.enqueueSetState(this,e,t,`setState`)},v.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,`forceUpdate`)};function y(){}y.prototype=v.prototype;function b(e,t,n){this.props=e,this.context=t,this.refs=_,this.updater=n||h}var x=b.prototype=new y;x.constructor=b,g(x,v.prototype),x.isPureReactComponent=!0;var ee=Array.isArray;function S(){}var C={H:null,A:null,T:null,S:null},te=Object.prototype.hasOwnProperty;function ne(e,n,r){var i=r.ref;return{$$typeof:t,type:e,key:n,ref:i===void 0?null:i,props:r}}function re(e,t){return ne(e.type,t,e.props)}function w(e){return typeof e==`object`&&!!e&&e.$$typeof===t}function T(e){var t={"=":`=0`,":":`=2`};return`$`+e.replace(/[=:]/g,function(e){return t[e]})}var ie=/\/+/g;function ae(e,t){return typeof e==`object`&&e&&e.key!=null?T(``+e.key):t.toString(36)}function oe(e){switch(e.status){case`fulfilled`:return e.value;case`rejected`:throw e.reason;default:switch(typeof e.status==`string`?e.then(S,S):(e.status=`pending`,e.then(function(t){e.status===`pending`&&(e.status=`fulfilled`,e.value=t)},function(t){e.status===`pending`&&(e.status=`rejected`,e.reason=t)})),e.status){case`fulfilled`:return e.value;case`rejected`:throw e.reason}}throw e}function se(e,r,i,a,o){var s=typeof e;(s===`undefined`||s===`boolean`)&&(e=null);var c=!1;if(e===null)c=!0;else switch(s){case`bigint`:case`string`:case`number`:c=!0;break;case`object`:switch(e.$$typeof){case t:case n:c=!0;break;case d:return c=e._init,se(c(e._payload),r,i,a,o)}}if(c)return o=o(e),c=a===``?`.`+ae(e,0):a,ee(o)?(i=``,c!=null&&(i=c.replace(ie,`$&/`)+`/`),se(o,r,i,``,function(e){return e})):o!=null&&(w(o)&&(o=re(o,i+(o.key==null||e&&e.key===o.key?``:(``+o.key).replace(ie,`$&/`)+`/`)+c)),r.push(o)),1;c=0;var l=a===``?`.`:a+`:`;if(ee(e))for(var u=0;u<e.length;u++)a=e[u],s=l+ae(a,u),c+=se(a,r,i,s,o);else if(u=m(e),typeof u==`function`)for(e=u.call(e),u=0;!(a=e.next()).done;)a=a.value,s=l+ae(a,u++),c+=se(a,r,i,s,o);else if(s===`object`){if(typeof e.then==`function`)return se(oe(e),r,i,a,o);throw r=String(e),Error(`Objects are not valid as a React child (found: `+(r===`[object Object]`?`object with keys {`+Object.keys(e).join(`, `)+`}`:r)+`). If you meant to render a collection of children, use an array instead.`)}return c}function ce(e,t,n){if(e==null)return e;var r=[],i=0;return se(e,r,``,``,function(e){return t.call(n,e,i++)}),r}function E(e){if(e._status===-1){var t=e._result;t=t(),t.then(function(t){(e._status===0||e._status===-1)&&(e._status=1,e._result=t)},function(t){(e._status===0||e._status===-1)&&(e._status=2,e._result=t)}),e._status===-1&&(e._status=0,e._result=t)}if(e._status===1)return e._result.default;throw e._result}var D=typeof reportError==`function`?reportError:function(e){if(typeof window==`object`&&typeof window.ErrorEvent==`function`){var t=new window.ErrorEvent(`error`,{bubbles:!0,cancelable:!0,message:typeof e==`object`&&e&&typeof e.message==`string`?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process==`object`&&typeof process.emit==`function`){process.emit(`uncaughtException`,e);return}console.error(e)},O={map:ce,forEach:function(e,t,n){ce(e,function(){t.apply(this,arguments)},n)},count:function(e){var t=0;return ce(e,function(){t++}),t},toArray:function(e){return ce(e,function(e){return e})||[]},only:function(e){if(!w(e))throw Error(`React.Children.only expected to receive a single React element child.`);return e}};e.Activity=f,e.Children=O,e.Component=v,e.Fragment=r,e.Profiler=a,e.PureComponent=b,e.StrictMode=i,e.Suspense=l,e.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=C,e.__COMPILER_RUNTIME={__proto__:null,c:function(e){return C.H.useMemoCache(e)}},e.cache=function(e){return function(){return e.apply(null,arguments)}},e.cacheSignal=function(){return null},e.cloneElement=function(e,t,n){if(e==null)throw Error(`The argument must be a React element, but you passed `+e+`.`);var r=g({},e.props),i=e.key;if(t!=null)for(a in t.key!==void 0&&(i=``+t.key),t)!te.call(t,a)||a===`key`||a===`__self`||a===`__source`||a===`ref`&&t.ref===void 0||(r[a]=t[a]);var a=arguments.length-2;if(a===1)r.children=n;else if(1<a){for(var o=Array(a),s=0;s<a;s++)o[s]=arguments[s+2];r.children=o}return ne(e.type,i,r)},e.createContext=function(e){return e={$$typeof:s,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null},e.Provider=e,e.Consumer={$$typeof:o,_context:e},e},e.createElement=function(e,t,n){var r,i={},a=null;if(t!=null)for(r in t.key!==void 0&&(a=``+t.key),t)te.call(t,r)&&r!==`key`&&r!==`__self`&&r!==`__source`&&(i[r]=t[r]);var o=arguments.length-2;if(o===1)i.children=n;else if(1<o){for(var s=Array(o),c=0;c<o;c++)s[c]=arguments[c+2];i.children=s}if(e&&e.defaultProps)for(r in o=e.defaultProps,o)i[r]===void 0&&(i[r]=o[r]);return ne(e,a,i)},e.createRef=function(){return{current:null}},e.forwardRef=function(e){return{$$typeof:c,render:e}},e.isValidElement=w,e.lazy=function(e){return{$$typeof:d,_payload:{_status:-1,_result:e},_init:E}},e.memo=function(e,t){return{$$typeof:u,type:e,compare:t===void 0?null:t}},e.startTransition=function(e){var t=C.T,n={};C.T=n;try{var r=e(),i=C.S;i!==null&&i(n,r),typeof r==`object`&&r&&typeof r.then==`function`&&r.then(S,D)}catch(e){D(e)}finally{t!==null&&n.types!==null&&(t.types=n.types),C.T=t}},e.unstable_useCacheRefresh=function(){return C.H.useCacheRefresh()},e.use=function(e){return C.H.use(e)},e.useActionState=function(e,t,n){return C.H.useActionState(e,t,n)},e.useCallback=function(e,t){return C.H.useCallback(e,t)},e.useContext=function(e){return C.H.useContext(e)},e.useDebugValue=function(){},e.useDeferredValue=function(e,t){return C.H.useDeferredValue(e,t)},e.useEffect=function(e,t){return C.H.useEffect(e,t)},e.useEffectEvent=function(e){return C.H.useEffectEvent(e)},e.useId=function(){return C.H.useId()},e.useImperativeHandle=function(e,t,n){return C.H.useImperativeHandle(e,t,n)},e.useInsertionEffect=function(e,t){return C.H.useInsertionEffect(e,t)},e.useLayoutEffect=function(e,t){return C.H.useLayoutEffect(e,t)},e.useMemo=function(e,t){return C.H.useMemo(e,t)},e.useOptimistic=function(e,t){return C.H.useOptimistic(e,t)},e.useReducer=function(e,t,n){return C.H.useReducer(e,t,n)},e.useRef=function(e){return C.H.useRef(e)},e.useState=function(e){return C.H.useState(e)},e.useSyncExternalStore=function(e,t,n){return C.H.useSyncExternalStore(e,t,n)},e.useTransition=function(){return C.H.useTransition()},e.version=`19.2.0`})),m=s(((e,t)=>{t.exports=p()})),h=s((e=>{var t=m();function n(e){var t=`https://react.dev/errors/`+e;if(1<arguments.length){t+=`?args[]=`+encodeURIComponent(arguments[1]);for(var n=2;n<arguments.length;n++)t+=`&args[]=`+encodeURIComponent(arguments[n])}return`Minified React error #`+e+`; visit `+t+` for the full message or use the non-minified dev environment for full errors and additional helpful warnings.`}function r(){}var i={d:{f:r,r:function(){throw Error(n(522))},D:r,C:r,L:r,m:r,X:r,S:r,M:r},p:0,findDOMNode:null},a=Symbol.for(`react.portal`);function o(e,t,n){var r=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:a,key:r==null?null:``+r,children:e,containerInfo:t,implementation:n}}var s=t.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;function c(e,t){if(e===`font`)return``;if(typeof t==`string`)return t===`use-credentials`?t:``}e.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=i,e.createPortal=function(e,t){var r=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)throw Error(n(299));return o(e,t,null,r)},e.flushSync=function(e){var t=s.T,n=i.p;try{if(s.T=null,i.p=2,e)return e()}finally{s.T=t,i.p=n,i.d.f()}},e.preconnect=function(e,t){typeof e==`string`&&(t?(t=t.crossOrigin,t=typeof t==`string`?t===`use-credentials`?t:``:void 0):t=null,i.d.C(e,t))},e.prefetchDNS=function(e){typeof e==`string`&&i.d.D(e)},e.preinit=function(e,t){if(typeof e==`string`&&t&&typeof t.as==`string`){var n=t.as,r=c(n,t.crossOrigin),a=typeof t.integrity==`string`?t.integrity:void 0,o=typeof t.fetchPriority==`string`?t.fetchPriority:void 0;n===`style`?i.d.S(e,typeof t.precedence==`string`?t.precedence:void 0,{crossOrigin:r,integrity:a,fetchPriority:o}):n===`script`&&i.d.X(e,{crossOrigin:r,integrity:a,fetchPriority:o,nonce:typeof t.nonce==`string`?t.nonce:void 0})}},e.preinitModule=function(e,t){if(typeof e==`string`){if(typeof t==`object`&&t){if(t.as==null||t.as===`script`){var n=c(t.as,t.crossOrigin);i.d.M(e,{crossOrigin:n,integrity:typeof t.integrity==`string`?t.integrity:void 0,nonce:typeof t.nonce==`string`?t.nonce:void 0})}}else t??i.d.M(e)}},e.preload=function(e,t){if(typeof e==`string`&&typeof t==`object`&&t&&typeof t.as==`string`){var n=t.as,r=c(n,t.crossOrigin);i.d.L(e,n,{crossOrigin:r,integrity:typeof t.integrity==`string`?t.integrity:void 0,nonce:typeof t.nonce==`string`?t.nonce:void 0,type:typeof t.type==`string`?t.type:void 0,fetchPriority:typeof t.fetchPriority==`string`?t.fetchPriority:void 0,referrerPolicy:typeof t.referrerPolicy==`string`?t.referrerPolicy:void 0,imageSrcSet:typeof t.imageSrcSet==`string`?t.imageSrcSet:void 0,imageSizes:typeof t.imageSizes==`string`?t.imageSizes:void 0,media:typeof t.media==`string`?t.media:void 0})}},e.preloadModule=function(e,t){if(typeof e==`string`){if(t){var n=c(t.as,t.crossOrigin);i.d.m(e,{as:typeof t.as==`string`&&t.as!==`script`?t.as:void 0,crossOrigin:n,integrity:typeof t.integrity==`string`?t.integrity:void 0})}else i.d.m(e)}},e.requestFormReset=function(e){i.d.r(e)},e.unstable_batchedUpdates=function(e,t){return e(t)},e.useFormState=function(e,t,n){return s.H.useFormState(e,t,n)},e.useFormStatus=function(){return s.H.useHostTransitionStatus()},e.version=`19.2.0`})),g=s(((e,t)=>{function n(){if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<`u`&&typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE==`function`)try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(n)}catch(e){console.error(e)}}n(),t.exports=h()})),_=s((e=>{var t=f(),n=m(),r=g();function i(e){var t=`https://react.dev/errors/`+e;if(1<arguments.length){t+=`?args[]=`+encodeURIComponent(arguments[1]);for(var n=2;n<arguments.length;n++)t+=`&args[]=`+encodeURIComponent(arguments[n])}return`Minified React error #`+e+`; visit `+t+` for the full message or use the non-minified dev environment for full errors and additional helpful warnings.`}function a(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)}function o(e){var t=e,n=e;if(e.alternate)for(;t.return;)t=t.return;else{e=t;do t=e,t.flags&4098&&(n=t.return),e=t.return;while(e)}return t.tag===3?n:null}function s(e){if(e.tag===13){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function c(e){if(e.tag===31){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function l(e){if(o(e)!==e)throw Error(i(188))}function u(e){var t=e.alternate;if(!t){if(t=o(e),t===null)throw Error(i(188));return t===e?e:null}for(var n=e,r=t;;){var a=n.return;if(a===null)break;var s=a.alternate;if(s===null){if(r=a.return,r!==null){n=r;continue}break}if(a.child===s.child){for(s=a.child;s;){if(s===n)return l(a),e;if(s===r)return l(a),t;s=s.sibling}throw Error(i(188))}if(n.return!==r.return)n=a,r=s;else{for(var c=!1,u=a.child;u;){if(u===n){c=!0,n=a,r=s;break}if(u===r){c=!0,r=a,n=s;break}u=u.sibling}if(!c){for(u=s.child;u;){if(u===n){c=!0,n=s,r=a;break}if(u===r){c=!0,r=s,n=a;break}u=u.sibling}if(!c)throw Error(i(189))}}if(n.alternate!==r)throw Error(i(190))}if(n.tag!==3)throw Error(i(188));return n.stateNode.current===n?e:t}function d(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e;for(e=e.child;e!==null;){if(t=d(e),t!==null)return t;e=e.sibling}return null}var p=Object.assign,h=Symbol.for(`react.element`),_=Symbol.for(`react.transitional.element`),v=Symbol.for(`react.portal`),y=Symbol.for(`react.fragment`),b=Symbol.for(`react.strict_mode`),x=Symbol.for(`react.profiler`),ee=Symbol.for(`react.consumer`),S=Symbol.for(`react.context`),C=Symbol.for(`react.forward_ref`),te=Symbol.for(`react.suspense`),ne=Symbol.for(`react.suspense_list`),re=Symbol.for(`react.memo`),w=Symbol.for(`react.lazy`),T=Symbol.for(`react.activity`),ie=Symbol.for(`react.memo_cache_sentinel`),ae=Symbol.iterator;function oe(e){return typeof e!=`object`||!e?null:(e=ae&&e[ae]||e[`@@iterator`],typeof e==`function`?e:null)}var se=Symbol.for(`react.client.reference`);function ce(e){if(e==null)return null;if(typeof e==`function`)return e.$$typeof===se?null:e.displayName||e.name||null;if(typeof e==`string`)return e;switch(e){case y:return`Fragment`;case x:return`Profiler`;case b:return`StrictMode`;case te:return`Suspense`;case ne:return`SuspenseList`;case T:return`Activity`}if(typeof e==`object`)switch(e.$$typeof){case v:return`Portal`;case S:return e.displayName||`Context`;case ee:return(e._context.displayName||`Context`)+`.Consumer`;case C:var t=e.render;return e=e.displayName,e||(e=t.displayName||t.name||``,e=e===``?`ForwardRef`:`ForwardRef(`+e+`)`),e;case re:return t=e.displayName||null,t===null?ce(e.type)||`Memo`:t;case w:t=e._payload,e=e._init;try{return ce(e(t))}catch{}}return null}var E=Array.isArray,D=n.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,O=r.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,le={pending:!1,data:null,method:null,action:null},ue=[],de=-1;function fe(e){return{current:e}}function pe(e){0>de||(e.current=ue[de],ue[de]=null,de--)}function k(e,t){de++,ue[de]=e.current,e.current=t}var me=fe(null),he=fe(null),ge=fe(null),_e=fe(null);function ve(e,t){switch(k(ge,t),k(he,e),k(me,null),t.nodeType){case 9:case 11:e=(e=t.documentElement)&&(e=e.namespaceURI)?Vd(e):0;break;default:if(e=t.tagName,t=t.namespaceURI)t=Vd(t),e=Hd(t,e);else switch(e){case`svg`:e=1;break;case`math`:e=2;break;default:e=0}}pe(me),k(me,e)}function A(){pe(me),pe(he),pe(ge)}function ye(e){e.memoizedState!==null&&k(_e,e);var t=me.current,n=Hd(t,e.type);t!==n&&(k(he,e),k(me,n))}function be(e){he.current===e&&(pe(me),pe(he)),_e.current===e&&(pe(_e),Qf._currentValue=le)}var xe,Se;function Ce(e){if(xe===void 0)try{throw Error()}catch(e){var t=e.stack.trim().match(/\n( *(at )?)/);xe=t&&t[1]||``,Se=-1<e.stack.indexOf(`
    at`)?` (<anonymous>)`:-1<e.stack.indexOf(`@`)?`@unknown:0:0`:``}return`
`+xe+e+Se}var we=!1;function Te(e,t){if(!e||we)return``;we=!0;var n=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{var r={DetermineComponentFrameRoot:function(){try{if(t){var n=function(){throw Error()};if(Object.defineProperty(n.prototype,"props",{set:function(){throw Error()}}),typeof Reflect==`object`&&Reflect.construct){try{Reflect.construct(n,[])}catch(e){var r=e}Reflect.construct(e,[],n)}else{try{n.call()}catch(e){r=e}e.call(n.prototype)}}else{try{throw Error()}catch(e){r=e}(n=e())&&typeof n.catch==`function`&&n.catch(function(){})}}catch(e){if(e&&r&&typeof e.stack==`string`)return[e.stack,r.stack]}return[null,null]}};r.DetermineComponentFrameRoot.displayName=`DetermineComponentFrameRoot`;var i=Object.getOwnPropertyDescriptor(r.DetermineComponentFrameRoot,`name`);i&&i.configurable&&Object.defineProperty(r.DetermineComponentFrameRoot,"name",{value:`DetermineComponentFrameRoot`});var a=r.DetermineComponentFrameRoot(),o=a[0],s=a[1];if(o&&s){var c=o.split(`
`),l=s.split(`
`);for(i=r=0;r<c.length&&!c[r].includes(`DetermineComponentFrameRoot`);)r++;for(;i<l.length&&!l[i].includes(`DetermineComponentFrameRoot`);)i++;if(r===c.length||i===l.length)for(r=c.length-1,i=l.length-1;1<=r&&0<=i&&c[r]!==l[i];)i--;for(;1<=r&&0<=i;r--,i--)if(c[r]!==l[i]){if(r!==1||i!==1)do if(r--,i--,0>i||c[r]!==l[i]){var u=`
`+c[r].replace(` at new `,` at `);return e.displayName&&u.includes(`<anonymous>`)&&(u=u.replace(`<anonymous>`,e.displayName)),u}while(1<=r&&0<=i);break}}}finally{we=!1,Error.prepareStackTrace=n}return(n=e?e.displayName||e.name:``)?Ce(n):``}function j(e,t){switch(e.tag){case 26:case 27:case 5:return Ce(e.type);case 16:return Ce(`Lazy`);case 13:return e.child!==t&&t!==null?Ce(`Suspense Fallback`):Ce(`Suspense`);case 19:return Ce(`SuspenseList`);case 0:case 15:return Te(e.type,!1);case 11:return Te(e.type.render,!1);case 1:return Te(e.type,!0);case 31:return Ce(`Activity`);default:return``}}function Ee(e){try{var t=``,n=null;do t+=j(e,n),n=e,e=e.return;while(e);return t}catch(e){return`
Error generating stack: `+e.message+`
`+e.stack}}var De=Object.prototype.hasOwnProperty,Oe=t.unstable_scheduleCallback,ke=t.unstable_cancelCallback,Ae=t.unstable_shouldYield,je=t.unstable_requestPaint,Me=t.unstable_now,Ne=t.unstable_getCurrentPriorityLevel,Pe=t.unstable_ImmediatePriority,Fe=t.unstable_UserBlockingPriority,Ie=t.unstable_NormalPriority,Le=t.unstable_LowPriority,Re=t.unstable_IdlePriority,ze=t.log,Be=t.unstable_setDisableYieldValue,Ve=null,He=null;function Ue(e){if(typeof ze==`function`&&Be(e),He&&typeof He.setStrictMode==`function`)try{He.setStrictMode(Ve,e)}catch{}}var We=Math.clz32?Math.clz32:qe,Ge=Math.log,Ke=Math.LN2;function qe(e){return e>>>=0,e===0?32:31-(Ge(e)/Ke|0)|0}var Je=256,Ye=262144,Xe=4194304;function Ze(e){var t=e&42;if(t!==0)return t;switch(e&-e){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:return 64;case 128:return 128;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:return e&261888;case 262144:case 524288:case 1048576:case 2097152:return e&3932160;case 4194304:case 8388608:case 16777216:case 33554432:return e&62914560;case 67108864:return 67108864;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 0;default:return e}}function Qe(e,t,n){var r=e.pendingLanes;if(r===0)return 0;var i=0,a=e.suspendedLanes,o=e.pingedLanes;e=e.warmLanes;var s=r&134217727;return s===0?(s=r&~a,s===0?o===0?n||(n=r&~e,n!==0&&(i=Ze(n))):i=Ze(o):i=Ze(s)):(r=s&~a,r===0?(o&=s,o===0?n||(n=s&~e,n!==0&&(i=Ze(n))):i=Ze(o)):i=Ze(r)),i===0?0:t!==0&&t!==i&&(t&a)===0&&(a=i&-i,n=t&-t,a>=n||a===32&&n&4194048)?t:i}function $e(e,t){return(e.pendingLanes&~(e.suspendedLanes&~e.pingedLanes)&t)===0}function et(e,t){switch(e){case 1:case 2:case 4:case 8:case 64:return t+250;case 16:case 32:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t+5e3;case 4194304:case 8388608:case 16777216:case 33554432:return-1;case 67108864:case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function tt(){var e=Xe;return Xe<<=1,!(Xe&62914560)&&(Xe=4194304),e}function nt(e){for(var t=[],n=0;31>n;n++)t.push(e);return t}function rt(e,t){e.pendingLanes|=t,t!==268435456&&(e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0)}function it(e,t,n,r,i,a){var o=e.pendingLanes;e.pendingLanes=n,e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0,e.expiredLanes&=n,e.entangledLanes&=n,e.errorRecoveryDisabledLanes&=n,e.shellSuspendCounter=0;var s=e.entanglements,c=e.expirationTimes,l=e.hiddenUpdates;for(n=o&~n;0<n;){var u=31-We(n),d=1<<u;s[u]=0,c[u]=-1;var f=l[u];if(f!==null)for(l[u]=null,u=0;u<f.length;u++){var p=f[u];p!==null&&(p.lane&=-536870913)}n&=~d}r!==0&&at(e,r,0),a!==0&&i===0&&e.tag!==0&&(e.suspendedLanes|=a&~(o&~t))}function at(e,t,n){e.pendingLanes|=t,e.suspendedLanes&=~t;var r=31-We(t);e.entangledLanes|=t,e.entanglements[r]=e.entanglements[r]|1073741824|n&261930}function ot(e,t){var n=e.entangledLanes|=t;for(e=e.entanglements;n;){var r=31-We(n),i=1<<r;i&t|e[r]&t&&(e[r]|=t),n&=~i}}function st(e,t){var n=t&-t;return n=n&42?1:ct(n),(n&(e.suspendedLanes|t))===0?n:0}function ct(e){switch(e){case 2:e=1;break;case 8:e=4;break;case 32:e=16;break;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:e=128;break;case 268435456:e=134217728;break;default:e=0}return e}function lt(e){return e&=-e,2<e?8<e?e&134217727?32:268435456:8:2}function ut(){var e=O.p;return e===0?(e=window.event,e===void 0?32:mp(e.type)):e}function dt(e,t){var n=O.p;try{return O.p=e,t()}finally{O.p=n}}var ft=Math.random().toString(36).slice(2),M=`__reactFiber$`+ft,N=`__reactProps$`+ft,pt=`__reactContainer$`+ft,mt=`__reactEvents$`+ft,ht=`__reactListeners$`+ft,gt=`__reactHandles$`+ft,_t=`__reactResources$`+ft,vt=`__reactMarker$`+ft;function yt(e){delete e[M],delete e[N],delete e[mt],delete e[ht],delete e[gt]}function bt(e){var t=e[M];if(t)return t;for(var n=e.parentNode;n;){if(t=n[pt]||n[M]){if(n=t.alternate,t.child!==null||n!==null&&n.child!==null)for(e=df(e);e!==null;){if(n=e[M])return n;e=df(e)}return t}e=n,n=e.parentNode}return null}function xt(e){if(e=e[M]||e[pt]){var t=e.tag;if(t===5||t===6||t===13||t===31||t===26||t===27||t===3)return e}return null}function St(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e.stateNode;throw Error(i(33))}function Ct(e){var t=e[_t];return t||(t=e[_t]={hoistableStyles:new Map,hoistableScripts:new Map}),t}function wt(e){e[vt]=!0}var Tt=new Set,Et={};function Dt(e,t){Ot(e,t),Ot(e+`Capture`,t)}function Ot(e,t){for(Et[e]=t,e=0;e<t.length;e++)Tt.add(t[e])}var kt=RegExp(`^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$`),At={},jt={};function Mt(e){return De.call(jt,e)?!0:De.call(At,e)?!1:kt.test(e)?jt[e]=!0:(At[e]=!0,!1)}function Nt(e,t,n){if(Mt(t)){if(n===null)e.removeAttribute(t);else{switch(typeof n){case`undefined`:case`function`:case`symbol`:e.removeAttribute(t);return;case`boolean`:var r=t.toLowerCase().slice(0,5);if(r!==`data-`&&r!==`aria-`){e.removeAttribute(t);return}}e.setAttribute(t,``+n)}}}function Pt(e,t,n){if(n===null)e.removeAttribute(t);else{switch(typeof n){case`undefined`:case`function`:case`symbol`:case`boolean`:e.removeAttribute(t);return}e.setAttribute(t,``+n)}}function Ft(e,t,n,r){if(r===null)e.removeAttribute(n);else{switch(typeof r){case`undefined`:case`function`:case`symbol`:case`boolean`:e.removeAttribute(n);return}e.setAttributeNS(t,n,``+r)}}function It(e){switch(typeof e){case`bigint`:case`boolean`:case`number`:case`string`:case`undefined`:return e;case`object`:return e;default:return``}}function Lt(e){var t=e.type;return(e=e.nodeName)&&e.toLowerCase()===`input`&&(t===`checkbox`||t===`radio`)}function Rt(e,t,n){var r=Object.getOwnPropertyDescriptor(e.constructor.prototype,t);if(!e.hasOwnProperty(t)&&r!==void 0&&typeof r.get==`function`&&typeof r.set==`function`){var i=r.get,a=r.set;return Object.defineProperty(e,t,{configurable:!0,get:function(){return i.call(this)},set:function(e){n=``+e,a.call(this,e)}}),Object.defineProperty(e,t,{enumerable:r.enumerable}),{getValue:function(){return n},setValue:function(e){n=``+e},stopTracking:function(){e._valueTracker=null,delete e[t]}}}}function zt(e){if(!e._valueTracker){var t=Lt(e)?`checked`:`value`;e._valueTracker=Rt(e,t,``+e[t])}}function Bt(e){if(!e)return!1;var t=e._valueTracker;if(!t)return!0;var n=t.getValue(),r=``;return e&&(r=Lt(e)?e.checked?`true`:`false`:e.value),e=r,e!==n&&(t.setValue(e),!0)}function Vt(e){if(e=e||(typeof document<`u`?document:void 0),e===void 0)return null;try{return e.activeElement||e.body}catch{return e.body}}var Ht=/[\n"\\]/g;function Ut(e){return e.replace(Ht,function(e){return`\\`+e.charCodeAt(0).toString(16)+` `})}function Wt(e,t,n,r,i,a,o,s){e.name=``,o!=null&&typeof o!=`function`&&typeof o!=`symbol`&&typeof o!=`boolean`?e.type=o:e.removeAttribute(`type`),t==null?o!==`submit`&&o!==`reset`||e.removeAttribute(`value`):o===`number`?(t===0&&e.value===``||e.value!=t)&&(e.value=``+It(t)):e.value!==``+It(t)&&(e.value=``+It(t)),t==null?n==null?r!=null&&e.removeAttribute(`value`):Kt(e,o,It(n)):Kt(e,o,It(t)),i==null&&a!=null&&(e.defaultChecked=!!a),i!=null&&(e.checked=i&&typeof i!=`function`&&typeof i!=`symbol`),s!=null&&typeof s!=`function`&&typeof s!=`symbol`&&typeof s!=`boolean`?e.name=``+It(s):e.removeAttribute(`name`)}function Gt(e,t,n,r,i,a,o,s){if(a!=null&&typeof a!=`function`&&typeof a!=`symbol`&&typeof a!=`boolean`&&(e.type=a),t!=null||n!=null){if(!(a!==`submit`&&a!==`reset`||t!=null)){zt(e);return}n=n==null?``:``+It(n),t=t==null?n:``+It(t),s||t===e.value||(e.value=t),e.defaultValue=t}r=r??i,r=typeof r!=`function`&&typeof r!=`symbol`&&!!r,e.checked=s?e.checked:!!r,e.defaultChecked=!!r,o!=null&&typeof o!=`function`&&typeof o!=`symbol`&&typeof o!=`boolean`&&(e.name=o),zt(e)}function Kt(e,t,n){t===`number`&&Vt(e.ownerDocument)===e||e.defaultValue===``+n||(e.defaultValue=``+n)}function qt(e,t,n,r){if(e=e.options,t){t={};for(var i=0;i<n.length;i++)t[`$`+n[i]]=!0;for(n=0;n<e.length;n++)i=t.hasOwnProperty(`$`+e[n].value),e[n].selected!==i&&(e[n].selected=i),i&&r&&(e[n].defaultSelected=!0)}else{for(n=``+It(n),t=null,i=0;i<e.length;i++){if(e[i].value===n){e[i].selected=!0,r&&(e[i].defaultSelected=!0);return}t!==null||e[i].disabled||(t=e[i])}t!==null&&(t.selected=!0)}}function Jt(e,t,n){t!=null&&(t=``+It(t),t!==e.value&&(e.value=t),n==null)?e.defaultValue!==t&&(e.defaultValue=t):e.defaultValue=n==null?``:``+It(n)}function Yt(e,t,n,r){if(t==null){if(r!=null){if(n!=null)throw Error(i(92));if(E(r)){if(1<r.length)throw Error(i(93));r=r[0]}n=r}n??(n=``),t=n}n=It(t),e.defaultValue=n,r=e.textContent,r===n&&r!==``&&r!==null&&(e.value=r),zt(e)}function Xt(e,t){if(t){var n=e.firstChild;if(n&&n===e.lastChild&&n.nodeType===3){n.nodeValue=t;return}}e.textContent=t}var Zt=new Set(`animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp`.split(` `));function Qt(e,t,n){var r=t.indexOf(`--`)===0;n==null||typeof n==`boolean`||n===``?r?e.setProperty(t,``):t===`float`?e.cssFloat=``:e[t]=``:r?e.setProperty(t,n):typeof n!=`number`||n===0||Zt.has(t)?t===`float`?e.cssFloat=n:e[t]=(``+n).trim():e[t]=n+`px`}function $t(e,t,n){if(t!=null&&typeof t!=`object`)throw Error(i(62));if(e=e.style,n!=null){for(var r in n)!n.hasOwnProperty(r)||t!=null&&t.hasOwnProperty(r)||(r.indexOf(`--`)===0?e.setProperty(r,``):r===`float`?e.cssFloat=``:e[r]=``);for(var a in t)r=t[a],t.hasOwnProperty(a)&&n[a]!==r&&Qt(e,a,r)}else for(var o in t)t.hasOwnProperty(o)&&Qt(e,o,t[o])}function en(e){if(e.indexOf(`-`)===-1)return!1;switch(e){case`annotation-xml`:case`color-profile`:case`font-face`:case`font-face-src`:case`font-face-uri`:case`font-face-format`:case`font-face-name`:case`missing-glyph`:return!1;default:return!0}}var tn=new Map([[`acceptCharset`,`accept-charset`],[`htmlFor`,`for`],[`httpEquiv`,`http-equiv`],[`crossOrigin`,`crossorigin`],[`accentHeight`,`accent-height`],[`alignmentBaseline`,`alignment-baseline`],[`arabicForm`,`arabic-form`],[`baselineShift`,`baseline-shift`],[`capHeight`,`cap-height`],[`clipPath`,`clip-path`],[`clipRule`,`clip-rule`],[`colorInterpolation`,`color-interpolation`],[`colorInterpolationFilters`,`color-interpolation-filters`],[`colorProfile`,`color-profile`],[`colorRendering`,`color-rendering`],[`dominantBaseline`,`dominant-baseline`],[`enableBackground`,`enable-background`],[`fillOpacity`,`fill-opacity`],[`fillRule`,`fill-rule`],[`floodColor`,`flood-color`],[`floodOpacity`,`flood-opacity`],[`fontFamily`,`font-family`],[`fontSize`,`font-size`],[`fontSizeAdjust`,`font-size-adjust`],[`fontStretch`,`font-stretch`],[`fontStyle`,`font-style`],[`fontVariant`,`font-variant`],[`fontWeight`,`font-weight`],[`glyphName`,`glyph-name`],[`glyphOrientationHorizontal`,`glyph-orientation-horizontal`],[`glyphOrientationVertical`,`glyph-orientation-vertical`],[`horizAdvX`,`horiz-adv-x`],[`horizOriginX`,`horiz-origin-x`],[`imageRendering`,`image-rendering`],[`letterSpacing`,`letter-spacing`],[`lightingColor`,`lighting-color`],[`markerEnd`,`marker-end`],[`markerMid`,`marker-mid`],[`markerStart`,`marker-start`],[`overlinePosition`,`overline-position`],[`overlineThickness`,`overline-thickness`],[`paintOrder`,`paint-order`],[`panose-1`,`panose-1`],[`pointerEvents`,`pointer-events`],[`renderingIntent`,`rendering-intent`],[`shapeRendering`,`shape-rendering`],[`stopColor`,`stop-color`],[`stopOpacity`,`stop-opacity`],[`strikethroughPosition`,`strikethrough-position`],[`strikethroughThickness`,`strikethrough-thickness`],[`strokeDasharray`,`stroke-dasharray`],[`strokeDashoffset`,`stroke-dashoffset`],[`strokeLinecap`,`stroke-linecap`],[`strokeLinejoin`,`stroke-linejoin`],[`strokeMiterlimit`,`stroke-miterlimit`],[`strokeOpacity`,`stroke-opacity`],[`strokeWidth`,`stroke-width`],[`textAnchor`,`text-anchor`],[`textDecoration`,`text-decoration`],[`textRendering`,`text-rendering`],[`transformOrigin`,`transform-origin`],[`underlinePosition`,`underline-position`],[`underlineThickness`,`underline-thickness`],[`unicodeBidi`,`unicode-bidi`],[`unicodeRange`,`unicode-range`],[`unitsPerEm`,`units-per-em`],[`vAlphabetic`,`v-alphabetic`],[`vHanging`,`v-hanging`],[`vIdeographic`,`v-ideographic`],[`vMathematical`,`v-mathematical`],[`vectorEffect`,`vector-effect`],[`vertAdvY`,`vert-adv-y`],[`vertOriginX`,`vert-origin-x`],[`vertOriginY`,`vert-origin-y`],[`wordSpacing`,`word-spacing`],[`writingMode`,`writing-mode`],[`xmlnsXlink`,`xmlns:xlink`],[`xHeight`,`x-height`]]),nn=/^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;function rn(e){return nn.test(``+e)?`javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')`:e}function an(){}var on=null;function sn(e){return e=e.target||e.srcElement||window,e.correspondingUseElement&&(e=e.correspondingUseElement),e.nodeType===3?e.parentNode:e}var cn=null,ln=null;function un(e){var t=xt(e);if(t&&(e=t.stateNode)){var n=e[N]||null;a:switch(e=t.stateNode,t.type){case`input`:if(Wt(e,n.value,n.defaultValue,n.defaultValue,n.checked,n.defaultChecked,n.type,n.name),t=n.name,n.type===`radio`&&t!=null){for(n=e;n.parentNode;)n=n.parentNode;for(n=n.querySelectorAll(`input[name="`+Ut(``+t)+`"][type="radio"]`),t=0;t<n.length;t++){var r=n[t];if(r!==e&&r.form===e.form){var a=r[N]||null;if(!a)throw Error(i(90));Wt(r,a.value,a.defaultValue,a.defaultValue,a.checked,a.defaultChecked,a.type,a.name)}}for(t=0;t<n.length;t++)r=n[t],r.form===e.form&&Bt(r)}break a;case`textarea`:Jt(e,n.value,n.defaultValue);break a;case`select`:t=n.value,t!=null&&qt(e,!!n.multiple,t,!1)}}}var dn=!1;function fn(e,t,n){if(dn)return e(t,n);dn=!0;try{return e(t)}finally{if(dn=!1,(cn!==null||ln!==null)&&(bu(),cn&&(t=cn,e=ln,ln=cn=null,un(t),e)))for(t=0;t<e.length;t++)un(e[t])}}function pn(e,t){var n=e.stateNode;if(n===null)return null;var r=n[N]||null;if(r===null)return null;n=r[t];a:switch(t){case`onClick`:case`onClickCapture`:case`onDoubleClick`:case`onDoubleClickCapture`:case`onMouseDown`:case`onMouseDownCapture`:case`onMouseMove`:case`onMouseMoveCapture`:case`onMouseUp`:case`onMouseUpCapture`:case`onMouseEnter`:(r=!r.disabled)||(e=e.type,r=e!==`button`&&e!==`input`&&e!==`select`&&e!==`textarea`),e=!r;break a;default:e=!1}if(e)return null;if(n&&typeof n!=`function`)throw Error(i(231,t,typeof n));return n}var mn=typeof window<`u`&&window.document!==void 0&&window.document.createElement!==void 0,hn=!1;if(mn)try{var gn={};Object.defineProperty(gn,"passive",{get:function(){hn=!0}}),window.addEventListener(`test`,gn,gn),window.removeEventListener(`test`,gn,gn)}catch{hn=!1}var _n=null,vn=null,yn=null;function bn(){if(yn)return yn;var e,t=vn,n=t.length,r,i=`value`in _n?_n.value:_n.textContent,a=i.length;for(e=0;e<n&&t[e]===i[e];e++);var o=n-e;for(r=1;r<=o&&t[n-r]===i[a-r];r++);return yn=i.slice(e,1<r?1-r:void 0)}function xn(e){var t=e.keyCode;return`charCode`in e?(e=e.charCode,e===0&&t===13&&(e=13)):e=t,e===10&&(e=13),32<=e||e===13?e:0}function Sn(){return!0}function Cn(){return!1}function wn(e){function t(t,n,r,i,a){for(var o in this._reactName=t,this._targetInst=r,this.type=n,this.nativeEvent=i,this.target=a,this.currentTarget=null,e)e.hasOwnProperty(o)&&(t=e[o],this[o]=t?t(i):i[o]);return this.isDefaultPrevented=(i.defaultPrevented==null?!1===i.returnValue:i.defaultPrevented)?Sn:Cn,this.isPropagationStopped=Cn,this}return p(t.prototype,{preventDefault:function(){this.defaultPrevented=!0;var e=this.nativeEvent;e&&(e.preventDefault?e.preventDefault():typeof e.returnValue!=`unknown`&&(e.returnValue=!1),this.isDefaultPrevented=Sn)},stopPropagation:function(){var e=this.nativeEvent;e&&(e.stopPropagation?e.stopPropagation():typeof e.cancelBubble!=`unknown`&&(e.cancelBubble=!0),this.isPropagationStopped=Sn)},persist:function(){},isPersistent:Sn}),t}var Tn={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(e){return e.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},En=wn(Tn),Dn=p({},Tn,{view:0,detail:0}),On=wn(Dn),kn,An,jn,Mn=p({},Dn,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:Un,button:0,buttons:0,relatedTarget:function(e){return e.relatedTarget===void 0?e.fromElement===e.srcElement?e.toElement:e.fromElement:e.relatedTarget},movementX:function(e){return`movementX`in e?e.movementX:(e!==jn&&(jn&&e.type===`mousemove`?(kn=e.screenX-jn.screenX,An=e.screenY-jn.screenY):An=kn=0,jn=e),kn)},movementY:function(e){return`movementY`in e?e.movementY:An}}),Nn=wn(Mn),Pn=wn(p({},Mn,{dataTransfer:0})),Fn=wn(p({},Dn,{relatedTarget:0})),In=wn(p({},Tn,{animationName:0,elapsedTime:0,pseudoElement:0})),Ln=wn(p({},Tn,{clipboardData:function(e){return`clipboardData`in e?e.clipboardData:window.clipboardData}})),Rn=wn(p({},Tn,{data:0})),zn={Esc:`Escape`,Spacebar:` `,Left:`ArrowLeft`,Up:`ArrowUp`,Right:`ArrowRight`,Down:`ArrowDown`,Del:`Delete`,Win:`OS`,Menu:`ContextMenu`,Apps:`ContextMenu`,Scroll:`ScrollLock`,MozPrintableKey:`Unidentified`},Bn={8:`Backspace`,9:`Tab`,12:`Clear`,13:`Enter`,16:`Shift`,17:`Control`,18:`Alt`,19:`Pause`,20:`CapsLock`,27:`Escape`,32:` `,33:`PageUp`,34:`PageDown`,35:`End`,36:`Home`,37:`ArrowLeft`,38:`ArrowUp`,39:`ArrowRight`,40:`ArrowDown`,45:`Insert`,46:`Delete`,112:`F1`,113:`F2`,114:`F3`,115:`F4`,116:`F5`,117:`F6`,118:`F7`,119:`F8`,120:`F9`,121:`F10`,122:`F11`,123:`F12`,144:`NumLock`,145:`ScrollLock`,224:`Meta`},Vn={Alt:`altKey`,Control:`ctrlKey`,Meta:`metaKey`,Shift:`shiftKey`};function Hn(e){var t=this.nativeEvent;return t.getModifierState?t.getModifierState(e):(e=Vn[e])?!!t[e]:!1}function Un(){return Hn}var Wn=wn(p({},Dn,{key:function(e){if(e.key){var t=zn[e.key]||e.key;if(t!==`Unidentified`)return t}return e.type===`keypress`?(e=xn(e),e===13?`Enter`:String.fromCharCode(e)):e.type===`keydown`||e.type===`keyup`?Bn[e.keyCode]||`Unidentified`:``},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:Un,charCode:function(e){return e.type===`keypress`?xn(e):0},keyCode:function(e){return e.type===`keydown`||e.type===`keyup`?e.keyCode:0},which:function(e){return e.type===`keypress`?xn(e):e.type===`keydown`||e.type===`keyup`?e.keyCode:0}})),Gn=wn(p({},Mn,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0})),Kn=wn(p({},Dn,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:Un})),qn=wn(p({},Tn,{propertyName:0,elapsedTime:0,pseudoElement:0})),Jn=wn(p({},Mn,{deltaX:function(e){return`deltaX`in e?e.deltaX:`wheelDeltaX`in e?-e.wheelDeltaX:0},deltaY:function(e){return`deltaY`in e?e.deltaY:`wheelDeltaY`in e?-e.wheelDeltaY:`wheelDelta`in e?-e.wheelDelta:0},deltaZ:0,deltaMode:0})),Yn=wn(p({},Tn,{newState:0,oldState:0})),Xn=[9,13,27,32],Zn=mn&&`CompositionEvent`in window,Qn=null;mn&&`documentMode`in document&&(Qn=document.documentMode);var $n=mn&&`TextEvent`in window&&!Qn,er=mn&&(!Zn||Qn&&8<Qn&&11>=Qn),tr=` `,nr=!1;function rr(e,t){switch(e){case`keyup`:return Xn.indexOf(t.keyCode)!==-1;case`keydown`:return t.keyCode!==229;case`keypress`:case`mousedown`:case`focusout`:return!0;default:return!1}}function ir(e){return e=e.detail,typeof e==`object`&&`data`in e?e.data:null}var ar=!1;function or(e,t){switch(e){case`compositionend`:return ir(t);case`keypress`:return t.which===32?(nr=!0,tr):null;case`textInput`:return e=t.data,e===tr&&nr?null:e;default:return null}}function sr(e,t){if(ar)return e===`compositionend`||!Zn&&rr(e,t)?(e=bn(),yn=vn=_n=null,ar=!1,e):null;switch(e){case`paste`:return null;case`keypress`:if(!(t.ctrlKey||t.altKey||t.metaKey)||t.ctrlKey&&t.altKey){if(t.char&&1<t.char.length)return t.char;if(t.which)return String.fromCharCode(t.which)}return null;case`compositionend`:return er&&t.locale!==`ko`?null:t.data;default:return null}}var cr={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function lr(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t===`input`?!!cr[e.type]:t===`textarea`}function ur(e,t,n,r){cn?ln?ln.push(r):ln=[r]:cn=r,t=Ed(t,`onChange`),0<t.length&&(n=new En(`onChange`,`change`,null,n,r),e.push({event:n,listeners:t}))}var dr=null,fr=null;function pr(e){yd(e,0)}function mr(e){if(Bt(St(e)))return e}function hr(e,t){if(e===`change`)return t}var gr=!1;if(mn){var _r;if(mn){var vr=`oninput`in document;if(!vr){var yr=document.createElement(`div`);yr.setAttribute(`oninput`,`return;`),vr=typeof yr.oninput==`function`}_r=vr}else _r=!1;gr=_r&&(!document.documentMode||9<document.documentMode)}function br(){dr&&(dr.detachEvent(`onpropertychange`,xr),fr=dr=null)}function xr(e){if(e.propertyName===`value`&&mr(fr)){var t=[];ur(t,fr,e,sn(e)),fn(pr,t)}}function Sr(e,t,n){e===`focusin`?(br(),dr=t,fr=n,dr.attachEvent(`onpropertychange`,xr)):e===`focusout`&&br()}function Cr(e){if(e===`selectionchange`||e===`keyup`||e===`keydown`)return mr(fr)}function wr(e,t){if(e===`click`)return mr(t)}function Tr(e,t){if(e===`input`||e===`change`)return mr(t)}function Er(e,t){return e===t&&(e!==0||1/e==1/t)||e!==e&&t!==t}var Dr=typeof Object.is==`function`?Object.is:Er;function Or(e,t){if(Dr(e,t))return!0;if(typeof e!=`object`||!e||typeof t!=`object`||!t)return!1;var n=Object.keys(e),r=Object.keys(t);if(n.length!==r.length)return!1;for(r=0;r<n.length;r++){var i=n[r];if(!De.call(t,i)||!Dr(e[i],t[i]))return!1}return!0}function kr(e){for(;e&&e.firstChild;)e=e.firstChild;return e}function Ar(e,t){var n=kr(e);e=0;for(var r;n;){if(n.nodeType===3){if(r=e+n.textContent.length,e<=t&&r>=t)return{node:n,offset:t-e};e=r}a:{for(;n;){if(n.nextSibling){n=n.nextSibling;break a}n=n.parentNode}n=void 0}n=kr(n)}}function jr(e,t){return e&&t?e===t?!0:e&&e.nodeType===3?!1:t&&t.nodeType===3?jr(e,t.parentNode):`contains`in e?e.contains(t):e.compareDocumentPosition?!!(e.compareDocumentPosition(t)&16):!1:!1}function Mr(e){e=e!=null&&e.ownerDocument!=null&&e.ownerDocument.defaultView!=null?e.ownerDocument.defaultView:window;for(var t=Vt(e.document);t instanceof e.HTMLIFrameElement;){try{var n=typeof t.contentWindow.location.href==`string`}catch{n=!1}if(n)e=t.contentWindow;else break;t=Vt(e.document)}return t}function Nr(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t&&(t===`input`&&(e.type===`text`||e.type===`search`||e.type===`tel`||e.type===`url`||e.type===`password`)||t===`textarea`||e.contentEditable===`true`)}var Pr=mn&&`documentMode`in document&&11>=document.documentMode,Fr=null,Ir=null,Lr=null,Rr=!1;function zr(e,t,n){var r=n.window===n?n.document:n.nodeType===9?n:n.ownerDocument;Rr||Fr==null||Fr!==Vt(r)||(r=Fr,`selectionStart`in r&&Nr(r)?r={start:r.selectionStart,end:r.selectionEnd}:(r=(r.ownerDocument&&r.ownerDocument.defaultView||window).getSelection(),r={anchorNode:r.anchorNode,anchorOffset:r.anchorOffset,focusNode:r.focusNode,focusOffset:r.focusOffset}),Lr&&Or(Lr,r)||(Lr=r,r=Ed(Ir,`onSelect`),0<r.length&&(t=new En(`onSelect`,`select`,null,t,n),e.push({event:t,listeners:r}),t.target=Fr)))}function Br(e,t){var n={};return n[e.toLowerCase()]=t.toLowerCase(),n[`Webkit`+e]=`webkit`+t,n[`Moz`+e]=`moz`+t,n}var Vr={animationend:Br(`Animation`,`AnimationEnd`),animationiteration:Br(`Animation`,`AnimationIteration`),animationstart:Br(`Animation`,`AnimationStart`),transitionrun:Br(`Transition`,`TransitionRun`),transitionstart:Br(`Transition`,`TransitionStart`),transitioncancel:Br(`Transition`,`TransitionCancel`),transitionend:Br(`Transition`,`TransitionEnd`)},Hr={},Ur={};mn&&(Ur=document.createElement(`div`).style,`AnimationEvent`in window||(delete Vr.animationend.animation,delete Vr.animationiteration.animation,delete Vr.animationstart.animation),`TransitionEvent`in window||delete Vr.transitionend.transition);function Wr(e){if(Hr[e])return Hr[e];if(!Vr[e])return e;var t=Vr[e],n;for(n in t)if(t.hasOwnProperty(n)&&n in Ur)return Hr[e]=t[n];return e}var Gr=Wr(`animationend`),Kr=Wr(`animationiteration`),P=Wr(`animationstart`),qr=Wr(`transitionrun`),Jr=Wr(`transitionstart`),Yr=Wr(`transitioncancel`),Xr=Wr(`transitionend`),Zr=new Map,Qr=`abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel`.split(` `);Qr.push(`scrollEnd`);function $r(e,t){Zr.set(e,t),Dt(t,[e])}var ei=typeof reportError==`function`?reportError:function(e){if(typeof window==`object`&&typeof window.ErrorEvent==`function`){var t=new window.ErrorEvent(`error`,{bubbles:!0,cancelable:!0,message:typeof e==`object`&&e&&typeof e.message==`string`?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process==`object`&&typeof process.emit==`function`){process.emit(`uncaughtException`,e);return}console.error(e)},ti=[],ni=0,ri=0;function ii(){for(var e=ni,t=ri=ni=0;t<e;){var n=ti[t];ti[t++]=null;var r=ti[t];ti[t++]=null;var i=ti[t];ti[t++]=null;var a=ti[t];if(ti[t++]=null,r!==null&&i!==null){var o=r.pending;o===null?i.next=i:(i.next=o.next,o.next=i),r.pending=i}a!==0&&ci(n,i,a)}}function ai(e,t,n,r){ti[ni++]=e,ti[ni++]=t,ti[ni++]=n,ti[ni++]=r,ri|=r,e.lanes|=r,e=e.alternate,e!==null&&(e.lanes|=r)}function oi(e,t,n,r){return ai(e,t,n,r),li(e)}function si(e,t){return ai(e,null,null,t),li(e)}function ci(e,t,n){e.lanes|=n;var r=e.alternate;r!==null&&(r.lanes|=n);for(var i=!1,a=e.return;a!==null;)a.childLanes|=n,r=a.alternate,r!==null&&(r.childLanes|=n),a.tag===22&&(e=a.stateNode,e===null||e._visibility&1||(i=!0)),e=a,a=a.return;return e.tag===3?(a=e.stateNode,i&&t!==null&&(i=31-We(n),e=a.hiddenUpdates,r=e[i],r===null?e[i]=[t]:r.push(t),t.lane=n|536870912),a):null}function li(e){if(50<du)throw du=0,fu=null,Error(i(185));for(var t=e.return;t!==null;)e=t,t=e.return;return e.tag===3?e.stateNode:null}var ui={};function di(e,t,n,r){this.tag=e,this.key=n,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.refCleanup=this.ref=null,this.pendingProps=t,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=r,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function fi(e,t,n,r){return new di(e,t,n,r)}function pi(e){return e=e.prototype,!(!e||!e.isReactComponent)}function mi(e,t){var n=e.alternate;return n===null?(n=fi(e.tag,t,e.key,e.mode),n.elementType=e.elementType,n.type=e.type,n.stateNode=e.stateNode,n.alternate=e,e.alternate=n):(n.pendingProps=t,n.type=e.type,n.flags=0,n.subtreeFlags=0,n.deletions=null),n.flags=e.flags&65011712,n.childLanes=e.childLanes,n.lanes=e.lanes,n.child=e.child,n.memoizedProps=e.memoizedProps,n.memoizedState=e.memoizedState,n.updateQueue=e.updateQueue,t=e.dependencies,n.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext},n.sibling=e.sibling,n.index=e.index,n.ref=e.ref,n.refCleanup=e.refCleanup,n}function hi(e,t){e.flags&=65011714;var n=e.alternate;return n===null?(e.childLanes=0,e.lanes=t,e.child=null,e.subtreeFlags=0,e.memoizedProps=null,e.memoizedState=null,e.updateQueue=null,e.dependencies=null,e.stateNode=null):(e.childLanes=n.childLanes,e.lanes=n.lanes,e.child=n.child,e.subtreeFlags=0,e.deletions=null,e.memoizedProps=n.memoizedProps,e.memoizedState=n.memoizedState,e.updateQueue=n.updateQueue,e.type=n.type,t=n.dependencies,e.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext}),e}function gi(e,t,n,r,a,o){var s=0;if(r=e,typeof e==`function`)pi(e)&&(s=1);else if(typeof e==`string`)s=Uf(e,n,me.current)?26:e===`html`||e===`head`||e===`body`?27:5;else a:switch(e){case T:return e=fi(31,n,t,a),e.elementType=T,e.lanes=o,e;case y:return _i(n.children,a,o,t);case b:s=8,a|=24;break;case x:return e=fi(12,n,t,a|2),e.elementType=x,e.lanes=o,e;case te:return e=fi(13,n,t,a),e.elementType=te,e.lanes=o,e;case ne:return e=fi(19,n,t,a),e.elementType=ne,e.lanes=o,e;default:if(typeof e==`object`&&e)switch(e.$$typeof){case S:s=10;break a;case ee:s=9;break a;case C:s=11;break a;case re:s=14;break a;case w:s=16,r=null;break a}s=29,n=Error(i(130,e===null?`null`:typeof e,``)),r=null}return t=fi(s,n,t,a),t.elementType=e,t.type=r,t.lanes=o,t}function _i(e,t,n,r){return e=fi(7,e,r,t),e.lanes=n,e}function vi(e,t,n){return e=fi(6,e,null,t),e.lanes=n,e}function yi(e){var t=fi(18,null,null,0);return t.stateNode=e,t}function bi(e,t,n){return t=fi(4,e.children===null?[]:e.children,e.key,t),t.lanes=n,t.stateNode={containerInfo:e.containerInfo,pendingChildren:null,implementation:e.implementation},t}var xi=new WeakMap;function Si(e,t){if(typeof e==`object`&&e){var n=xi.get(e);return n===void 0?(t={value:e,source:t,stack:Ee(t)},xi.set(e,t),t):n}return{value:e,source:t,stack:Ee(t)}}var Ci=[],wi=0,Ti=null,Ei=0,Di=[],Oi=0,ki=null,Ai=1,ji=``;function Mi(e,t){Ci[wi++]=Ei,Ci[wi++]=Ti,Ti=e,Ei=t}function Ni(e,t,n){Di[Oi++]=Ai,Di[Oi++]=ji,Di[Oi++]=ki,ki=e;var r=Ai;e=ji;var i=32-We(r)-1;r&=~(1<<i),n+=1;var a=32-We(t)+i;if(30<a){var o=i-i%5;a=(r&(1<<o)-1).toString(32),r>>=o,i-=o,Ai=1<<32-We(t)+i|n<<i|r,ji=a+e}else Ai=1<<a|n<<i|r,ji=e}function Pi(e){e.return!==null&&(Mi(e,1),Ni(e,1,0))}function Fi(e){for(;e===Ti;)Ti=Ci[--wi],Ci[wi]=null,Ei=Ci[--wi],Ci[wi]=null;for(;e===ki;)ki=Di[--Oi],Di[Oi]=null,ji=Di[--Oi],Di[Oi]=null,Ai=Di[--Oi],Di[Oi]=null}function Ii(e,t){Di[Oi++]=Ai,Di[Oi++]=ji,Di[Oi++]=ki,Ai=t.id,ji=t.overflow,ki=e}var Li=null,F=null,I=!1,Ri=null,zi=!1,Bi=Error(i(519));function Vi(e){throw qi(Si(Error(i(418,1<arguments.length&&arguments[1]!==void 0&&arguments[1]?`text`:`HTML`,``)),e)),Bi}function Hi(e){var t=e.stateNode,n=e.type,r=e.memoizedProps;switch(t[M]=e,t[N]=r,n){case`dialog`:Q(`cancel`,t),Q(`close`,t);break;case`iframe`:case`object`:case`embed`:Q(`load`,t);break;case`video`:case`audio`:for(n=0;n<_d.length;n++)Q(_d[n],t);break;case`source`:Q(`error`,t);break;case`img`:case`image`:case`link`:Q(`error`,t),Q(`load`,t);break;case`details`:Q(`toggle`,t);break;case`input`:Q(`invalid`,t),Gt(t,r.value,r.defaultValue,r.checked,r.defaultChecked,r.type,r.name,!0);break;case`select`:Q(`invalid`,t);break;case`textarea`:Q(`invalid`,t),Yt(t,r.value,r.defaultValue,r.children)}n=r.children,typeof n!=`string`&&typeof n!=`number`&&typeof n!=`bigint`||t.textContent===``+n||!0===r.suppressHydrationWarning||Md(t.textContent,n)?(r.popover!=null&&(Q(`beforetoggle`,t),Q(`toggle`,t)),r.onScroll!=null&&Q(`scroll`,t),r.onScrollEnd!=null&&Q(`scrollend`,t),r.onClick!=null&&(t.onclick=an),t=!0):t=!1,t||Vi(e,!0)}function Ui(e){for(Li=e.return;Li;)switch(Li.tag){case 5:case 31:case 13:zi=!1;return;case 27:case 3:zi=!0;return;default:Li=Li.return}}function Wi(e){if(e!==Li)return!1;if(!I)return Ui(e),I=!0,!1;var t=e.tag,n;if((n=t!==3&&t!==27)&&((n=t===5)&&(n=e.type,n=n===`form`||n===`button`||Ud(e.type,e.memoizedProps)),n=!n),n&&F&&Vi(e),Ui(e),t===13){if(e=e.memoizedState,e=e===null?null:e.dehydrated,!e)throw Error(i(317));F=uf(e)}else if(t===31){if(e=e.memoizedState,e=e===null?null:e.dehydrated,!e)throw Error(i(317));F=uf(e)}else t===27?(t=F,Zd(e.type)?(e=lf,lf=null,F=e):F=t):F=Li?cf(e.stateNode.nextSibling):null;return!0}function Gi(){F=Li=null,I=!1}function Ki(){var e=Ri;return e!==null&&(Zl===null?Zl=e:Zl.push.apply(Zl,e),Ri=null),e}function qi(e){Ri===null?Ri=[e]:Ri.push(e)}var Ji=fe(null),Yi=null,Xi=null;function Zi(e,t,n){k(Ji,t._currentValue),t._currentValue=n}function Qi(e){e._currentValue=Ji.current,pe(Ji)}function $i(e,t,n){for(;e!==null;){var r=e.alternate;if((e.childLanes&t)===t?r!==null&&(r.childLanes&t)!==t&&(r.childLanes|=t):(e.childLanes|=t,r!==null&&(r.childLanes|=t)),e===n)break;e=e.return}}function ea(e,t,n,r){var a=e.child;for(a!==null&&(a.return=e);a!==null;){var o=a.dependencies;if(o!==null){var s=a.child;o=o.firstContext;a:for(;o!==null;){var c=o;o=a;for(var l=0;l<t.length;l++)if(c.context===t[l]){o.lanes|=n,c=o.alternate,c!==null&&(c.lanes|=n),$i(o.return,n,e),r||(s=null);break a}o=c.next}}else if(a.tag===18){if(s=a.return,s===null)throw Error(i(341));s.lanes|=n,o=s.alternate,o!==null&&(o.lanes|=n),$i(s,n,e),s=null}else s=a.child;if(s!==null)s.return=a;else for(s=a;s!==null;){if(s===e){s=null;break}if(a=s.sibling,a!==null){a.return=s.return,s=a;break}s=s.return}a=s}}function ta(e,t,n,r){e=null;for(var a=t,o=!1;a!==null;){if(!o){if(a.flags&524288)o=!0;else if(a.flags&262144)break}if(a.tag===10){var s=a.alternate;if(s===null)throw Error(i(387));if(s=s.memoizedProps,s!==null){var c=a.type;Dr(a.pendingProps.value,s.value)||(e===null?e=[c]:e.push(c))}}else if(a===_e.current){if(s=a.alternate,s===null)throw Error(i(387));s.memoizedState.memoizedState!==a.memoizedState.memoizedState&&(e===null?e=[Qf]:e.push(Qf))}a=a.return}e!==null&&ea(t,e,n,r),t.flags|=262144}function na(e){for(e=e.firstContext;e!==null;){if(!Dr(e.context._currentValue,e.memoizedValue))return!0;e=e.next}return!1}function ra(e){Yi=e,Xi=null,e=e.dependencies,e!==null&&(e.firstContext=null)}function L(e){return aa(Yi,e)}function ia(e,t){return Yi===null&&ra(e),aa(e,t)}function aa(e,t){var n=t._currentValue;if(t={context:t,memoizedValue:n,next:null},Xi===null){if(e===null)throw Error(i(308));Xi=t,e.dependencies={lanes:0,firstContext:t},e.flags|=524288}else Xi=Xi.next=t;return n}var R=typeof AbortController<`u`?AbortController:function(){var e=[],t=this.signal={aborted:!1,addEventListener:function(t,n){e.push(n)}};this.abort=function(){t.aborted=!0,e.forEach(function(e){return e()})}},oa=t.unstable_scheduleCallback,sa=t.unstable_NormalPriority,z={$$typeof:S,Consumer:null,Provider:null,_currentValue:null,_currentValue2:null,_threadCount:0};function ca(){return{controller:new R,data:new Map,refCount:0}}function la(e){e.refCount--,e.refCount===0&&oa(sa,function(){e.controller.abort()})}var B=null,ua=0,da=0,fa=null;function pa(e,t){if(B===null){var n=B=[];ua=0,da=dd(),fa={status:`pending`,value:void 0,then:function(e){n.push(e)}}}return ua++,t.then(ma,ma),t}function ma(){if(--ua===0&&B!==null){fa!==null&&(fa.status=`fulfilled`);var e=B;B=null,da=0,fa=null;for(var t=0;t<e.length;t++)(0,e[t])()}}function ha(e,t){var n=[],r={status:`pending`,value:null,reason:null,then:function(e){n.push(e)}};return e.then(function(){r.status=`fulfilled`,r.value=t;for(var e=0;e<n.length;e++)(0,n[e])(t)},function(e){for(r.status=`rejected`,r.reason=e,e=0;e<n.length;e++)(0,n[e])(void 0)}),r}var ga=D.S;D.S=function(e,t){eu=Me(),typeof t==`object`&&t&&typeof t.then==`function`&&pa(e,t),ga!==null&&ga(e,t)};var _a=fe(null);function va(){var e=_a.current;return e===null?q.pooledCache:e}function ya(e,t){t===null?k(_a,_a.current):k(_a,t.pool)}function ba(){var e=va();return e===null?null:{parent:z._currentValue,pool:e}}var xa=Error(i(460)),Sa=Error(i(474)),Ca=Error(i(542)),wa={then:function(){}};function Ta(e){return e=e.status,e===`fulfilled`||e===`rejected`}function Ea(e,t,n){switch(n=e[n],n===void 0?e.push(t):n!==t&&(t.then(an,an),t=n),t.status){case`fulfilled`:return t.value;case`rejected`:throw e=t.reason,ka(e),e;default:if(typeof t.status==`string`)t.then(an,an);else{if(e=q,e!==null&&100<e.shellSuspendCounter)throw Error(i(482));e=t,e.status=`pending`,e.then(function(e){if(t.status===`pending`){var n=t;n.status=`fulfilled`,n.value=e}},function(e){if(t.status===`pending`){var n=t;n.status=`rejected`,n.reason=e}})}switch(t.status){case`fulfilled`:return t.value;case`rejected`:throw e=t.reason,ka(e),e}throw Oa=t,xa}}function Da(e){try{var t=e._init;return t(e._payload)}catch(e){throw typeof e==`object`&&e&&typeof e.then==`function`?(Oa=e,xa):e}}var Oa=null;function V(){if(Oa===null)throw Error(i(459));var e=Oa;return Oa=null,e}function ka(e){if(e===xa||e===Ca)throw Error(i(483))}var Aa=null,ja=0;function Ma(e){var t=ja;return ja+=1,Aa===null&&(Aa=[]),Ea(Aa,e,t)}function Na(e,t){t=t.props.ref,e.ref=t===void 0?null:t}function Pa(e,t){throw t.$$typeof===h?Error(i(525)):(e=Object.prototype.toString.call(t),Error(i(31,e===`[object Object]`?`object with keys {`+Object.keys(t).join(`, `)+`}`:e)))}function Fa(e){function t(t,n){if(e){var r=t.deletions;r===null?(t.deletions=[n],t.flags|=16):r.push(n)}}function n(n,r){if(!e)return null;for(;r!==null;)t(n,r),r=r.sibling;return null}function r(e){for(var t=new Map;e!==null;)e.key===null?t.set(e.index,e):t.set(e.key,e),e=e.sibling;return t}function a(e,t){return e=mi(e,t),e.index=0,e.sibling=null,e}function o(t,n,r){return t.index=r,e?(r=t.alternate,r===null?(t.flags|=67108866,n):(r=r.index,r<n?(t.flags|=67108866,n):r)):(t.flags|=1048576,n)}function s(t){return e&&t.alternate===null&&(t.flags|=67108866),t}function c(e,t,n,r){return t===null||t.tag!==6?(t=vi(n,e.mode,r),t.return=e,t):(t=a(t,n),t.return=e,t)}function l(e,t,n,r){var i=n.type;return i===y?d(e,t,n.props.children,r,n.key):t!==null&&(t.elementType===i||typeof i==`object`&&i&&i.$$typeof===w&&Da(i)===t.type)?(t=a(t,n.props),Na(t,n),t.return=e,t):(t=gi(n.type,n.key,n.props,null,e.mode,r),Na(t,n),t.return=e,t)}function u(e,t,n,r){return t===null||t.tag!==4||t.stateNode.containerInfo!==n.containerInfo||t.stateNode.implementation!==n.implementation?(t=bi(n,e.mode,r),t.return=e,t):(t=a(t,n.children||[]),t.return=e,t)}function d(e,t,n,r,i){return t===null||t.tag!==7?(t=_i(n,e.mode,r,i),t.return=e,t):(t=a(t,n),t.return=e,t)}function f(e,t,n){if(typeof t==`string`&&t!==``||typeof t==`number`||typeof t==`bigint`)return t=vi(``+t,e.mode,n),t.return=e,t;if(typeof t==`object`&&t){switch(t.$$typeof){case _:return n=gi(t.type,t.key,t.props,null,e.mode,n),Na(n,t),n.return=e,n;case v:return t=bi(t,e.mode,n),t.return=e,t;case w:return t=Da(t),f(e,t,n)}if(E(t)||oe(t))return t=_i(t,e.mode,n,null),t.return=e,t;if(typeof t.then==`function`)return f(e,Ma(t),n);if(t.$$typeof===S)return f(e,ia(e,t),n);Pa(e,t)}return null}function p(e,t,n,r){var i=t===null?null:t.key;if(typeof n==`string`&&n!==``||typeof n==`number`||typeof n==`bigint`)return i===null?c(e,t,``+n,r):null;if(typeof n==`object`&&n){switch(n.$$typeof){case _:return n.key===i?l(e,t,n,r):null;case v:return n.key===i?u(e,t,n,r):null;case w:return n=Da(n),p(e,t,n,r)}if(E(n)||oe(n))return i===null?d(e,t,n,r,null):null;if(typeof n.then==`function`)return p(e,t,Ma(n),r);if(n.$$typeof===S)return p(e,t,ia(e,n),r);Pa(e,n)}return null}function m(e,t,n,r,i){if(typeof r==`string`&&r!==``||typeof r==`number`||typeof r==`bigint`)return e=e.get(n)||null,c(t,e,``+r,i);if(typeof r==`object`&&r){switch(r.$$typeof){case _:return e=e.get(r.key===null?n:r.key)||null,l(t,e,r,i);case v:return e=e.get(r.key===null?n:r.key)||null,u(t,e,r,i);case w:return r=Da(r),m(e,t,n,r,i)}if(E(r)||oe(r))return e=e.get(n)||null,d(t,e,r,i,null);if(typeof r.then==`function`)return m(e,t,n,Ma(r),i);if(r.$$typeof===S)return m(e,t,n,ia(t,r),i);Pa(t,r)}return null}function h(i,a,s,c){for(var l=null,u=null,d=a,h=a=0,g=null;d!==null&&h<s.length;h++){d.index>h?(g=d,d=null):g=d.sibling;var _=p(i,d,s[h],c);if(_===null){d===null&&(d=g);break}e&&d&&_.alternate===null&&t(i,d),a=o(_,a,h),u===null?l=_:u.sibling=_,u=_,d=g}if(h===s.length)return n(i,d),I&&Mi(i,h),l;if(d===null){for(;h<s.length;h++)d=f(i,s[h],c),d!==null&&(a=o(d,a,h),u===null?l=d:u.sibling=d,u=d);return I&&Mi(i,h),l}for(d=r(d);h<s.length;h++)g=m(d,i,h,s[h],c),g!==null&&(e&&g.alternate!==null&&d.delete(g.key===null?h:g.key),a=o(g,a,h),u===null?l=g:u.sibling=g,u=g);return e&&d.forEach(function(e){return t(i,e)}),I&&Mi(i,h),l}function g(a,s,c,l){if(c==null)throw Error(i(151));for(var u=null,d=null,h=s,g=s=0,_=null,v=c.next();h!==null&&!v.done;g++,v=c.next()){h.index>g?(_=h,h=null):_=h.sibling;var y=p(a,h,v.value,l);if(y===null){h===null&&(h=_);break}e&&h&&y.alternate===null&&t(a,h),s=o(y,s,g),d===null?u=y:d.sibling=y,d=y,h=_}if(v.done)return n(a,h),I&&Mi(a,g),u;if(h===null){for(;!v.done;g++,v=c.next())v=f(a,v.value,l),v!==null&&(s=o(v,s,g),d===null?u=v:d.sibling=v,d=v);return I&&Mi(a,g),u}for(h=r(h);!v.done;g++,v=c.next())v=m(h,a,g,v.value,l),v!==null&&(e&&v.alternate!==null&&h.delete(v.key===null?g:v.key),s=o(v,s,g),d===null?u=v:d.sibling=v,d=v);return e&&h.forEach(function(e){return t(a,e)}),I&&Mi(a,g),u}function b(e,r,o,c){if(typeof o==`object`&&o&&o.type===y&&o.key===null&&(o=o.props.children),typeof o==`object`&&o){switch(o.$$typeof){case _:a:{for(var l=o.key;r!==null;){if(r.key===l){if(l=o.type,l===y){if(r.tag===7){n(e,r.sibling),c=a(r,o.props.children),c.return=e,e=c;break a}}else if(r.elementType===l||typeof l==`object`&&l&&l.$$typeof===w&&Da(l)===r.type){n(e,r.sibling),c=a(r,o.props),Na(c,o),c.return=e,e=c;break a}n(e,r);break}t(e,r),r=r.sibling}o.type===y?(c=_i(o.props.children,e.mode,c,o.key),c.return=e,e=c):(c=gi(o.type,o.key,o.props,null,e.mode,c),Na(c,o),c.return=e,e=c)}return s(e);case v:a:{for(l=o.key;r!==null;){if(r.key===l){if(r.tag===4&&r.stateNode.containerInfo===o.containerInfo&&r.stateNode.implementation===o.implementation){n(e,r.sibling),c=a(r,o.children||[]),c.return=e,e=c;break a}n(e,r);break}t(e,r),r=r.sibling}c=bi(o,e.mode,c),c.return=e,e=c}return s(e);case w:return o=Da(o),b(e,r,o,c)}if(E(o))return h(e,r,o,c);if(oe(o)){if(l=oe(o),typeof l!=`function`)throw Error(i(150));return o=l.call(o),g(e,r,o,c)}if(typeof o.then==`function`)return b(e,r,Ma(o),c);if(o.$$typeof===S)return b(e,r,ia(e,o),c);Pa(e,o)}return typeof o==`string`&&o!==``||typeof o==`number`||typeof o==`bigint`?(o=``+o,r!==null&&r.tag===6?(n(e,r.sibling),c=a(r,o),c.return=e,e=c):(n(e,r),c=vi(o,e.mode,c),c.return=e,e=c),s(e)):n(e,r)}return function(e,t,n,r){try{ja=0;var i=b(e,t,n,r);return Aa=null,i}catch(t){if(t===xa||t===Ca)throw t;var a=fi(29,t,null,e.mode);return a.lanes=r,a.return=e,a}}}var Ia=Fa(!0),La=Fa(!1),Ra=!1;function za(e){e.updateQueue={baseState:e.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,lanes:0,hiddenCallbacks:null},callbacks:null}}function Ba(e,t){e=e.updateQueue,t.updateQueue===e&&(t.updateQueue={baseState:e.baseState,firstBaseUpdate:e.firstBaseUpdate,lastBaseUpdate:e.lastBaseUpdate,shared:e.shared,callbacks:null})}function Va(e){return{lane:e,tag:0,payload:null,callback:null,next:null}}function Ha(e,t,n){var r=e.updateQueue;if(r===null)return null;if(r=r.shared,K&2){var i=r.pending;return i===null?t.next=t:(t.next=i.next,i.next=t),r.pending=t,t=li(e),ci(e,null,n),t}return ai(e,r,t,n),li(e)}function Ua(e,t,n){if(t=t.updateQueue,t!==null&&(t=t.shared,n&4194048)){var r=t.lanes;r&=e.pendingLanes,n|=r,t.lanes=n,ot(e,n)}}function Wa(e,t){var n=e.updateQueue,r=e.alternate;if(r!==null&&(r=r.updateQueue,n===r)){var i=null,a=null;if(n=n.firstBaseUpdate,n!==null){do{var o={lane:n.lane,tag:n.tag,payload:n.payload,callback:null,next:null};a===null?i=a=o:a=a.next=o,n=n.next}while(n!==null);a===null?i=a=t:a=a.next=t}else i=a=t;n={baseState:r.baseState,firstBaseUpdate:i,lastBaseUpdate:a,shared:r.shared,callbacks:r.callbacks},e.updateQueue=n}else e=n.lastBaseUpdate,e===null?n.firstBaseUpdate=t:e.next=t,n.lastBaseUpdate=t}var Ga=!1;function Ka(){if(Ga){var e=fa;if(e!==null)throw e}}function qa(e,t,n,r){Ga=!1;var i=e.updateQueue;Ra=!1;var a=i.firstBaseUpdate,o=i.lastBaseUpdate,s=i.shared.pending;if(s!==null){i.shared.pending=null;var c=s,l=c.next;c.next=null,o===null?a=l:o.next=l,o=c;var u=e.alternate;u!==null&&(u=u.updateQueue,s=u.lastBaseUpdate,s!==o&&(s===null?u.firstBaseUpdate=l:s.next=l,u.lastBaseUpdate=c))}if(a!==null){var d=i.baseState;o=0,u=l=c=null,s=a;do{var f=s.lane&-536870913,m=f!==s.lane;if(m?(Y&f)===f:(r&f)===f){f!==0&&f===da&&(Ga=!0),u!==null&&(u=u.next={lane:0,tag:s.tag,payload:s.payload,callback:null,next:null});a:{var h=e,g=s;f=t;var _=n;switch(g.tag){case 1:if(h=g.payload,typeof h==`function`){d=h.call(_,d,f);break a}d=h;break a;case 3:h.flags=h.flags&-65537|128;case 0:if(h=g.payload,f=typeof h==`function`?h.call(_,d,f):h,f==null)break a;d=p({},d,f);break a;case 2:Ra=!0}}f=s.callback,f!==null&&(e.flags|=64,m&&(e.flags|=8192),m=i.callbacks,m===null?i.callbacks=[f]:m.push(f))}else m={lane:f,tag:s.tag,payload:s.payload,callback:s.callback,next:null},u===null?(l=u=m,c=d):u=u.next=m,o|=f;if(s=s.next,s===null){if(s=i.shared.pending,s===null)break;m=s,s=m.next,m.next=null,i.lastBaseUpdate=m,i.shared.pending=null}}while(1);u===null&&(c=d),i.baseState=c,i.firstBaseUpdate=l,i.lastBaseUpdate=u,a===null&&(i.shared.lanes=0),Gl|=o,e.lanes=o,e.memoizedState=d}}function Ja(e,t){if(typeof e!=`function`)throw Error(i(191,e));e.call(t)}function Ya(e,t){var n=e.callbacks;if(n!==null)for(e.callbacks=null,e=0;e<n.length;e++)Ja(n[e],t)}var Xa=fe(null),Za=fe(0);function Qa(e,t){e=Ul,k(Za,e),k(Xa,t),Ul=e|t.baseLanes}function $a(){k(Za,Ul),k(Xa,Xa.current)}function eo(){Ul=Za.current,pe(Xa),pe(Za)}var to=fe(null),no=null;function ro(e){var t=e.alternate;k(co,co.current&1),k(to,e),no===null&&(t===null||Xa.current!==null||t.memoizedState!==null)&&(no=e)}function io(e){k(co,co.current),k(to,e),no===null&&(no=e)}function ao(e){e.tag===22?(k(co,co.current),k(to,e),no===null&&(no=e)):oo(e)}function oo(){k(co,co.current),k(to,to.current)}function so(e){pe(to),no===e&&(no=null),pe(co)}var co=fe(0);function lo(e){for(var t=e;t!==null;){if(t.tag===13){var n=t.memoizedState;if(n!==null&&(n=n.dehydrated,n===null||af(n)||of(n)))return t}else if(t.tag===19&&(t.memoizedProps.revealOrder===`forwards`||t.memoizedProps.revealOrder===`backwards`||t.memoizedProps.revealOrder===`unstable_legacy-backwards`||t.memoizedProps.revealOrder===`together`)){if(t.flags&128)return t}else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return null;t=t.return}t.sibling.return=t.return,t=t.sibling}return null}var uo=0,H=null,U=null,W=null,fo=!1,po=!1,mo=!1,ho=0,go=0,_o=null,vo=0;function yo(){throw Error(i(321))}function bo(e,t){if(t===null)return!1;for(var n=0;n<t.length&&n<e.length;n++)if(!Dr(e[n],t[n]))return!1;return!0}function xo(e,t,n,r,i,a){return uo=a,H=t,t.memoizedState=null,t.updateQueue=null,t.lanes=0,D.H=e===null||e.memoizedState===null?Ls:Rs,mo=!1,a=n(r,i),mo=!1,po&&(a=Co(t,n,r,i)),So(e),a}function So(e){D.H=Is;var t=U!==null&&U.next!==null;if(uo=0,W=U=H=null,fo=!1,go=0,_o=null,t)throw Error(i(300));e===null||tc||(e=e.dependencies,e!==null&&na(e)&&(tc=!0))}function Co(e,t,n,r){H=e;var a=0;do{if(po&&(_o=null),go=0,po=!1,25<=a)throw Error(i(301));if(a+=1,W=U=null,e.updateQueue!=null){var o=e.updateQueue;o.lastEffect=null,o.events=null,o.stores=null,o.memoCache!=null&&(o.memoCache.index=0)}D.H=zs,o=t(n,r)}while(po);return o}function wo(){var e=D.H,t=e.useState()[0];return t=typeof t.then==`function`?Ao(t):t,e=e.useState()[0],(U===null?null:U.memoizedState)!==e&&(H.flags|=1024),t}function To(){var e=ho!==0;return ho=0,e}function Eo(e,t,n){t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~n}function Do(e){if(fo){for(e=e.memoizedState;e!==null;){var t=e.queue;t!==null&&(t.pending=null),e=e.next}fo=!1}uo=0,W=U=H=null,po=!1,go=ho=0,_o=null}function G(){var e={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return W===null?H.memoizedState=W=e:W=W.next=e,W}function Oo(){if(U===null){var e=H.alternate;e=e===null?null:e.memoizedState}else e=U.next;var t=W===null?H.memoizedState:W.next;if(t!==null)W=t,U=e;else{if(e===null)throw H.alternate===null?Error(i(467)):Error(i(310));U=e,e={memoizedState:U.memoizedState,baseState:U.baseState,baseQueue:U.baseQueue,queue:U.queue,next:null},W===null?H.memoizedState=W=e:W=W.next=e}return W}function ko(){return{lastEffect:null,events:null,stores:null,memoCache:null}}function Ao(e){var t=go;return go+=1,_o===null&&(_o=[]),e=Ea(_o,e,t),t=H,(W===null?t.memoizedState:W.next)===null&&(t=t.alternate,D.H=t===null||t.memoizedState===null?Ls:Rs),e}function jo(e){if(typeof e==`object`&&e){if(typeof e.then==`function`)return Ao(e);if(e.$$typeof===S)return L(e)}throw Error(i(438,String(e)))}function Mo(e){var t=null,n=H.updateQueue;if(n!==null&&(t=n.memoCache),t==null){var r=H.alternate;r!==null&&(r=r.updateQueue,r!==null&&(r=r.memoCache,r!=null&&(t={data:r.data.map(function(e){return e.slice()}),index:0})))}if(t??(t={data:[],index:0}),n===null&&(n=ko(),H.updateQueue=n),n.memoCache=t,n=t.data[t.index],n===void 0)for(n=t.data[t.index]=Array(e),r=0;r<e;r++)n[r]=ie;return t.index++,n}function No(e,t){return typeof t==`function`?t(e):t}function Po(e){return Fo(Oo(),U,e)}function Fo(e,t,n){var r=e.queue;if(r===null)throw Error(i(311));r.lastRenderedReducer=n;var a=e.baseQueue,o=r.pending;if(o!==null){if(a!==null){var s=a.next;a.next=o.next,o.next=s}t.baseQueue=a=o,r.pending=null}if(o=e.baseState,a===null)e.memoizedState=o;else{t=a.next;var c=s=null,l=null,u=t,d=!1;do{var f=u.lane&-536870913;if(f===u.lane?(uo&f)===f:(Y&f)===f){var p=u.revertLane;if(p===0)l!==null&&(l=l.next={lane:0,revertLane:0,gesture:null,action:u.action,hasEagerState:u.hasEagerState,eagerState:u.eagerState,next:null}),f===da&&(d=!0);else if((uo&p)===p){u=u.next,p===da&&(d=!0);continue}else f={lane:0,revertLane:u.revertLane,gesture:null,action:u.action,hasEagerState:u.hasEagerState,eagerState:u.eagerState,next:null},l===null?(c=l=f,s=o):l=l.next=f,H.lanes|=p,Gl|=p;f=u.action,mo&&n(o,f),o=u.hasEagerState?u.eagerState:n(o,f)}else p={lane:f,revertLane:u.revertLane,gesture:u.gesture,action:u.action,hasEagerState:u.hasEagerState,eagerState:u.eagerState,next:null},l===null?(c=l=p,s=o):l=l.next=p,H.lanes|=f,Gl|=f;u=u.next}while(u!==null&&u!==t);if(l===null?s=o:l.next=c,!Dr(o,e.memoizedState)&&(tc=!0,d&&(n=fa,n!==null)))throw n;e.memoizedState=o,e.baseState=s,e.baseQueue=l,r.lastRenderedState=o}return a===null&&(r.lanes=0),[e.memoizedState,r.dispatch]}function Io(e){var t=Oo(),n=t.queue;if(n===null)throw Error(i(311));n.lastRenderedReducer=e;var r=n.dispatch,a=n.pending,o=t.memoizedState;if(a!==null){n.pending=null;var s=a=a.next;do o=e(o,s.action),s=s.next;while(s!==a);Dr(o,t.memoizedState)||(tc=!0),t.memoizedState=o,t.baseQueue===null&&(t.baseState=o),n.lastRenderedState=o}return[o,r]}function Lo(e,t,n){var r=H,a=Oo(),o=I;if(o){if(n===void 0)throw Error(i(407));n=n()}else n=t();var s=!Dr((U||a).memoizedState,n);if(s&&(a.memoizedState=n,tc=!0),a=a.queue,cs(Bo.bind(null,r,a,e),[e]),a.getSnapshot!==t||s||W!==null&&W.memoizedState.tag&1){if(r.flags|=2048,rs(9,{destroy:void 0},zo.bind(null,r,a,n,t),null),q===null)throw Error(i(349));o||uo&127||Ro(r,t,n)}return n}function Ro(e,t,n){e.flags|=16384,e={getSnapshot:t,value:n},t=H.updateQueue,t===null?(t=ko(),H.updateQueue=t,t.stores=[e]):(n=t.stores,n===null?t.stores=[e]:n.push(e))}function zo(e,t,n,r){t.value=n,t.getSnapshot=r,Vo(t)&&Ho(e)}function Bo(e,t,n){return n(function(){Vo(t)&&Ho(e)})}function Vo(e){var t=e.getSnapshot;e=e.value;try{var n=t();return!Dr(e,n)}catch{return!0}}function Ho(e){var t=si(e,2);t!==null&&hu(t,e,2)}function Uo(e){var t=G();if(typeof e==`function`){var n=e;if(e=n(),mo){Ue(!0);try{n()}finally{Ue(!1)}}}return t.memoizedState=t.baseState=e,t.queue={pending:null,lanes:0,dispatch:null,lastRenderedReducer:No,lastRenderedState:e},t}function Wo(e,t,n,r){return e.baseState=n,Fo(e,U,typeof r==`function`?r:No)}function Go(e,t,n,r,a){if(Ns(e))throw Error(i(485));if(e=t.action,e!==null){var o={payload:a,action:e,next:null,isTransition:!0,status:`pending`,value:null,reason:null,listeners:[],then:function(e){o.listeners.push(e)}};D.T===null?o.isTransition=!1:n(!0),r(o),n=t.pending,n===null?(o.next=t.pending=o,Ko(t,o)):(o.next=n.next,t.pending=n.next=o)}}function Ko(e,t){var n=t.action,r=t.payload,i=e.state;if(t.isTransition){var a=D.T,o={};D.T=o;try{var s=n(i,r),c=D.S;c!==null&&c(o,s),qo(e,t,s)}catch(n){Yo(e,t,n)}finally{a!==null&&o.types!==null&&(a.types=o.types),D.T=a}}else try{a=n(i,r),qo(e,t,a)}catch(n){Yo(e,t,n)}}function qo(e,t,n){typeof n==`object`&&n&&typeof n.then==`function`?n.then(function(n){Jo(e,t,n)},function(n){return Yo(e,t,n)}):Jo(e,t,n)}function Jo(e,t,n){t.status=`fulfilled`,t.value=n,Xo(t),e.state=n,t=e.pending,t!==null&&(n=t.next,n===t?e.pending=null:(n=n.next,t.next=n,Ko(e,n)))}function Yo(e,t,n){var r=e.pending;if(e.pending=null,r!==null){r=r.next;do t.status=`rejected`,t.reason=n,Xo(t),t=t.next;while(t!==r)}e.action=null}function Xo(e){e=e.listeners;for(var t=0;t<e.length;t++)(0,e[t])()}function Zo(e,t){return t}function Qo(e,t){if(I){var n=q.formState;if(n!==null){a:{var r=H;if(I){if(F){b:{for(var i=F,a=zi;i.nodeType!==8;)if(!a||(i=cf(i.nextSibling),i===null)){i=null;break b}a=i.data,i=a===`F!`||a===`F`?i:null}if(i){F=cf(i.nextSibling),r=i.data===`F!`;break a}}Vi(r)}r=!1}r&&(t=n[0])}}return n=G(),n.memoizedState=n.baseState=t,r={pending:null,lanes:0,dispatch:null,lastRenderedReducer:Zo,lastRenderedState:t},n.queue=r,n=As.bind(null,H,r),r.dispatch=n,r=Uo(!1),a=Ms.bind(null,H,!1,r.queue),r=G(),i={state:t,dispatch:null,action:e,pending:null},r.queue=i,n=Go.bind(null,H,i,a,n),i.dispatch=n,r.memoizedState=e,[t,n,!1]}function $o(e){return es(Oo(),U,e)}function es(e,t,n){if(t=Fo(e,t,Zo)[0],e=Po(No)[0],typeof t==`object`&&t&&typeof t.then==`function`)try{var r=Ao(t)}catch(e){throw e===xa?Ca:e}else r=t;t=Oo();var i=t.queue,a=i.dispatch;return n!==t.memoizedState&&(H.flags|=2048,rs(9,{destroy:void 0},ts.bind(null,i,n),null)),[r,a,e]}function ts(e,t){e.action=t}function ns(e){var t=Oo(),n=U;if(n!==null)return es(t,n,e);Oo(),t=t.memoizedState,n=Oo();var r=n.queue.dispatch;return n.memoizedState=e,[t,r,!1]}function rs(e,t,n,r){return e={tag:e,create:n,deps:r,inst:t,next:null},t=H.updateQueue,t===null&&(t=ko(),H.updateQueue=t),n=t.lastEffect,n===null?t.lastEffect=e.next=e:(r=n.next,n.next=e,e.next=r,t.lastEffect=e),e}function is(){return Oo().memoizedState}function as(e,t,n,r){var i=G();H.flags|=e,i.memoizedState=rs(1|t,{destroy:void 0},n,r===void 0?null:r)}function os(e,t,n,r){var i=Oo();r=r===void 0?null:r;var a=i.memoizedState.inst;U!==null&&r!==null&&bo(r,U.memoizedState.deps)?i.memoizedState=rs(t,a,n,r):(H.flags|=e,i.memoizedState=rs(1|t,a,n,r))}function ss(e,t){as(8390656,8,e,t)}function cs(e,t){os(2048,8,e,t)}function ls(e){H.flags|=4;var t=H.updateQueue;if(t===null)t=ko(),H.updateQueue=t,t.events=[e];else{var n=t.events;n===null?t.events=[e]:n.push(e)}}function us(e){var t=Oo().memoizedState;return ls({ref:t,nextImpl:e}),function(){if(K&2)throw Error(i(440));return t.impl.apply(void 0,arguments)}}function ds(e,t){return os(4,2,e,t)}function fs(e,t){return os(4,4,e,t)}function ps(e,t){if(typeof t==`function`){e=e();var n=t(e);return function(){typeof n==`function`?n():t(null)}}if(t!=null)return e=e(),t.current=e,function(){t.current=null}}function ms(e,t,n){n=n==null?null:n.concat([e]),os(4,4,ps.bind(null,t,e),n)}function hs(){}function gs(e,t){var n=Oo();t=t===void 0?null:t;var r=n.memoizedState;return t!==null&&bo(t,r[1])?r[0]:(n.memoizedState=[e,t],e)}function _s(e,t){var n=Oo();t=t===void 0?null:t;var r=n.memoizedState;if(t!==null&&bo(t,r[1]))return r[0];if(r=e(),mo){Ue(!0);try{e()}finally{Ue(!1)}}return n.memoizedState=[r,t],r}function vs(e,t,n){return n===void 0||uo&1073741824&&!(Y&261930)?e.memoizedState=t:(e.memoizedState=n,e=mu(),H.lanes|=e,Gl|=e,n)}function ys(e,t,n,r){return Dr(n,t)?n:Xa.current===null?!(uo&42)||uo&1073741824&&!(Y&261930)?(tc=!0,e.memoizedState=n):(e=mu(),H.lanes|=e,Gl|=e,t):(e=vs(e,n,r),Dr(e,t)||(tc=!0),e)}function bs(e,t,n,r,i){var a=O.p;O.p=a!==0&&8>a?a:8;var o=D.T,s={};D.T=s,Ms(e,!1,t,n);try{var c=i(),l=D.S;l!==null&&l(s,c),typeof c==`object`&&c&&typeof c.then==`function`?js(e,t,ha(c,r),pu(e)):js(e,t,r,pu(e))}catch(n){js(e,t,{then:function(){},status:`rejected`,reason:n},pu())}finally{O.p=a,o!==null&&s.types!==null&&(o.types=s.types),D.T=o}}function xs(){}function Ss(e,t,n,r){if(e.tag!==5)throw Error(i(476));var a=Cs(e).queue;bs(e,a,t,le,n===null?xs:function(){return ws(e),n(r)})}function Cs(e){var t=e.memoizedState;if(t!==null)return t;t={memoizedState:le,baseState:le,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:No,lastRenderedState:le},next:null};var n={};return t.next={memoizedState:n,baseState:n,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:No,lastRenderedState:n},next:null},e.memoizedState=t,e=e.alternate,e!==null&&(e.memoizedState=t),t}function ws(e){var t=Cs(e);t.next===null&&(t=e.alternate.memoizedState),js(e,t.next.queue,{},pu())}function Ts(){return L(Qf)}function Es(){return Oo().memoizedState}function Ds(){return Oo().memoizedState}function Os(e){for(var t=e.return;t!==null;){switch(t.tag){case 24:case 3:var n=pu();e=Va(n);var r=Ha(t,e,n);r!==null&&(hu(r,t,n),Ua(r,t,n)),t={cache:ca()},e.payload=t;return}t=t.return}}function ks(e,t,n){var r=pu();n={lane:r,revertLane:0,gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null},Ns(e)?Ps(t,n):(n=oi(e,t,n,r),n!==null&&(hu(n,e,r),Fs(n,t,r)))}function As(e,t,n){js(e,t,n,pu())}function js(e,t,n,r){var i={lane:r,revertLane:0,gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null};if(Ns(e))Ps(t,i);else{var a=e.alternate;if(e.lanes===0&&(a===null||a.lanes===0)&&(a=t.lastRenderedReducer,a!==null))try{var o=t.lastRenderedState,s=a(o,n);if(i.hasEagerState=!0,i.eagerState=s,Dr(s,o))return ai(e,t,i,0),q===null&&ii(),!1}catch{}if(n=oi(e,t,i,r),n!==null)return hu(n,e,r),Fs(n,t,r),!0}return!1}function Ms(e,t,n,r){if(r={lane:2,revertLane:dd(),gesture:null,action:r,hasEagerState:!1,eagerState:null,next:null},Ns(e)){if(t)throw Error(i(479))}else t=oi(e,n,r,2),t!==null&&hu(t,e,2)}function Ns(e){var t=e.alternate;return e===H||t!==null&&t===H}function Ps(e,t){po=fo=!0;var n=e.pending;n===null?t.next=t:(t.next=n.next,n.next=t),e.pending=t}function Fs(e,t,n){if(n&4194048){var r=t.lanes;r&=e.pendingLanes,n|=r,t.lanes=n,ot(e,n)}}var Is={readContext:L,use:jo,useCallback:yo,useContext:yo,useEffect:yo,useImperativeHandle:yo,useLayoutEffect:yo,useInsertionEffect:yo,useMemo:yo,useReducer:yo,useRef:yo,useState:yo,useDebugValue:yo,useDeferredValue:yo,useTransition:yo,useSyncExternalStore:yo,useId:yo,useHostTransitionStatus:yo,useFormState:yo,useActionState:yo,useOptimistic:yo,useMemoCache:yo,useCacheRefresh:yo};Is.useEffectEvent=yo;var Ls={readContext:L,use:jo,useCallback:function(e,t){return G().memoizedState=[e,t===void 0?null:t],e},useContext:L,useEffect:ss,useImperativeHandle:function(e,t,n){n=n==null?null:n.concat([e]),as(4194308,4,ps.bind(null,t,e),n)},useLayoutEffect:function(e,t){return as(4194308,4,e,t)},useInsertionEffect:function(e,t){as(4,2,e,t)},useMemo:function(e,t){var n=G();t=t===void 0?null:t;var r=e();if(mo){Ue(!0);try{e()}finally{Ue(!1)}}return n.memoizedState=[r,t],r},useReducer:function(e,t,n){var r=G();if(n!==void 0){var i=n(t);if(mo){Ue(!0);try{n(t)}finally{Ue(!1)}}}else i=t;return r.memoizedState=r.baseState=i,e={pending:null,lanes:0,dispatch:null,lastRenderedReducer:e,lastRenderedState:i},r.queue=e,e=e.dispatch=ks.bind(null,H,e),[r.memoizedState,e]},useRef:function(e){var t=G();return e={current:e},t.memoizedState=e},useState:function(e){e=Uo(e);var t=e.queue,n=As.bind(null,H,t);return t.dispatch=n,[e.memoizedState,n]},useDebugValue:hs,useDeferredValue:function(e,t){return vs(G(),e,t)},useTransition:function(){var e=Uo(!1);return e=bs.bind(null,H,e.queue,!0,!1),G().memoizedState=e,[!1,e]},useSyncExternalStore:function(e,t,n){var r=H,a=G();if(I){if(n===void 0)throw Error(i(407));n=n()}else{if(n=t(),q===null)throw Error(i(349));Y&127||Ro(r,t,n)}a.memoizedState=n;var o={value:n,getSnapshot:t};return a.queue=o,ss(Bo.bind(null,r,o,e),[e]),r.flags|=2048,rs(9,{destroy:void 0},zo.bind(null,r,o,n,t),null),n},useId:function(){var e=G(),t=q.identifierPrefix;if(I){var n=ji,r=Ai;n=(r&~(1<<32-We(r)-1)).toString(32)+n,t=`_`+t+`R_`+n,n=ho++,0<n&&(t+=`H`+n.toString(32)),t+=`_`}else n=vo++,t=`_`+t+`r_`+n.toString(32)+`_`;return e.memoizedState=t},useHostTransitionStatus:Ts,useFormState:Qo,useActionState:Qo,useOptimistic:function(e){var t=G();t.memoizedState=t.baseState=e;var n={pending:null,lanes:0,dispatch:null,lastRenderedReducer:null,lastRenderedState:null};return t.queue=n,t=Ms.bind(null,H,!0,n),n.dispatch=t,[e,t]},useMemoCache:Mo,useCacheRefresh:function(){return G().memoizedState=Os.bind(null,H)},useEffectEvent:function(e){var t=G(),n={impl:e};return t.memoizedState=n,function(){if(K&2)throw Error(i(440));return n.impl.apply(void 0,arguments)}}},Rs={readContext:L,use:jo,useCallback:gs,useContext:L,useEffect:cs,useImperativeHandle:ms,useInsertionEffect:ds,useLayoutEffect:fs,useMemo:_s,useReducer:Po,useRef:is,useState:function(){return Po(No)},useDebugValue:hs,useDeferredValue:function(e,t){return ys(Oo(),U.memoizedState,e,t)},useTransition:function(){var e=Po(No)[0],t=Oo().memoizedState;return[typeof e==`boolean`?e:Ao(e),t]},useSyncExternalStore:Lo,useId:Es,useHostTransitionStatus:Ts,useFormState:$o,useActionState:$o,useOptimistic:function(e,t){return Wo(Oo(),U,e,t)},useMemoCache:Mo,useCacheRefresh:Ds};Rs.useEffectEvent=us;var zs={readContext:L,use:jo,useCallback:gs,useContext:L,useEffect:cs,useImperativeHandle:ms,useInsertionEffect:ds,useLayoutEffect:fs,useMemo:_s,useReducer:Io,useRef:is,useState:function(){return Io(No)},useDebugValue:hs,useDeferredValue:function(e,t){var n=Oo();return U===null?vs(n,e,t):ys(n,U.memoizedState,e,t)},useTransition:function(){var e=Io(No)[0],t=Oo().memoizedState;return[typeof e==`boolean`?e:Ao(e),t]},useSyncExternalStore:Lo,useId:Es,useHostTransitionStatus:Ts,useFormState:ns,useActionState:ns,useOptimistic:function(e,t){var n=Oo();return U===null?(n.baseState=e,[e,n.queue.dispatch]):Wo(n,U,e,t)},useMemoCache:Mo,useCacheRefresh:Ds};zs.useEffectEvent=us;function Bs(e,t,n,r){t=e.memoizedState,n=n(r,t),n=n==null?t:p({},t,n),e.memoizedState=n,e.lanes===0&&(e.updateQueue.baseState=n)}var Vs={enqueueSetState:function(e,t,n){e=e._reactInternals;var r=pu(),i=Va(r);i.payload=t,n!=null&&(i.callback=n),t=Ha(e,i,r),t!==null&&(hu(t,e,r),Ua(t,e,r))},enqueueReplaceState:function(e,t,n){e=e._reactInternals;var r=pu(),i=Va(r);i.tag=1,i.payload=t,n!=null&&(i.callback=n),t=Ha(e,i,r),t!==null&&(hu(t,e,r),Ua(t,e,r))},enqueueForceUpdate:function(e,t){e=e._reactInternals;var n=pu(),r=Va(n);r.tag=2,t!=null&&(r.callback=t),t=Ha(e,r,n),t!==null&&(hu(t,e,n),Ua(t,e,n))}};function Hs(e,t,n,r,i,a,o){return e=e.stateNode,typeof e.shouldComponentUpdate==`function`?e.shouldComponentUpdate(r,a,o):t.prototype&&t.prototype.isPureReactComponent?!Or(n,r)||!Or(i,a):!0}function Us(e,t,n,r){e=t.state,typeof t.componentWillReceiveProps==`function`&&t.componentWillReceiveProps(n,r),typeof t.UNSAFE_componentWillReceiveProps==`function`&&t.UNSAFE_componentWillReceiveProps(n,r),t.state!==e&&Vs.enqueueReplaceState(t,t.state,null)}function Ws(e,t){var n=t;if(`ref`in t)for(var r in n={},t)r!==`ref`&&(n[r]=t[r]);if(e=e.defaultProps)for(var i in n===t&&(n=p({},n)),e)n[i]===void 0&&(n[i]=e[i]);return n}function Gs(e){ei(e)}function Ks(e){console.error(e)}function qs(e){ei(e)}function Js(e,t){try{var n=e.onUncaughtError;n(t.value,{componentStack:t.stack})}catch(e){setTimeout(function(){throw e})}}function Ys(e,t,n){try{var r=e.onCaughtError;r(n.value,{componentStack:n.stack,errorBoundary:t.tag===1?t.stateNode:null})}catch(e){setTimeout(function(){throw e})}}function Xs(e,t,n){return n=Va(n),n.tag=3,n.payload={element:null},n.callback=function(){Js(e,t)},n}function Zs(e){return e=Va(e),e.tag=3,e}function Qs(e,t,n,r){var i=n.type.getDerivedStateFromError;if(typeof i==`function`){var a=r.value;e.payload=function(){return i(a)},e.callback=function(){Ys(t,n,r)}}var o=n.stateNode;o!==null&&typeof o.componentDidCatch==`function`&&(e.callback=function(){Ys(t,n,r),typeof i!=`function`&&(ru===null?ru=new Set([this]):ru.add(this));var e=r.stack;this.componentDidCatch(r.value,{componentStack:e===null?``:e})})}function $s(e,t,n,r,a){if(n.flags|=32768,typeof r==`object`&&r&&typeof r.then==`function`){if(t=n.alternate,t!==null&&ta(t,n,a,!0),n=to.current,n!==null){switch(n.tag){case 31:case 13:return no===null?Du():n.alternate===null&&Wl===0&&(Wl=3),n.flags&=-257,n.flags|=65536,n.lanes=a,r===wa?n.flags|=16384:(t=n.updateQueue,t===null?n.updateQueue=new Set([r]):t.add(r),Gu(e,r,a)),!1;case 22:return n.flags|=65536,r===wa?n.flags|=16384:(t=n.updateQueue,t===null?(t={transitions:null,markerInstances:null,retryQueue:new Set([r])},n.updateQueue=t):(n=t.retryQueue,n===null?t.retryQueue=new Set([r]):n.add(r)),Gu(e,r,a)),!1}throw Error(i(435,n.tag))}return Gu(e,r,a),Du(),!1}if(I)return t=to.current,t===null?(r!==Bi&&(t=Error(i(423),{cause:r}),qi(Si(t,n))),e=e.current.alternate,e.flags|=65536,a&=-a,e.lanes|=a,r=Si(r,n),a=Xs(e.stateNode,r,a),Wa(e,a),Wl!==4&&(Wl=2)):(!(t.flags&65536)&&(t.flags|=256),t.flags|=65536,t.lanes=a,r!==Bi&&(e=Error(i(422),{cause:r}),qi(Si(e,n)))),!1;var o=Error(i(520),{cause:r});if(o=Si(o,n),Xl===null?Xl=[o]:Xl.push(o),Wl!==4&&(Wl=2),t===null)return!0;r=Si(r,n),n=t;do{switch(n.tag){case 3:return n.flags|=65536,e=a&-a,n.lanes|=e,e=Xs(n.stateNode,r,e),Wa(n,e),!1;case 1:if(t=n.type,o=n.stateNode,!(n.flags&128)&&(typeof t.getDerivedStateFromError==`function`||o!==null&&typeof o.componentDidCatch==`function`&&(ru===null||!ru.has(o))))return n.flags|=65536,a&=-a,n.lanes|=a,a=Zs(a),Qs(a,e,n,r),Wa(n,a),!1}n=n.return}while(n!==null);return!1}var ec=Error(i(461)),tc=!1;function nc(e,t,n,r){t.child=e===null?La(t,null,n,r):Ia(t,e.child,n,r)}function rc(e,t,n,r,i){n=n.render;var a=t.ref;if(`ref`in r){var o={};for(var s in r)s!==`ref`&&(o[s]=r[s])}else o=r;return ra(t),r=xo(e,t,n,o,a,i),s=To(),e!==null&&!tc?(Eo(e,t,i),Dc(e,t,i)):(I&&s&&Pi(t),t.flags|=1,nc(e,t,r,i),t.child)}function ic(e,t,n,r,i){if(e===null){var a=n.type;return typeof a==`function`&&!pi(a)&&a.defaultProps===void 0&&n.compare===null?(t.tag=15,t.type=a,ac(e,t,a,r,i)):(e=gi(n.type,null,r,t,t.mode,i),e.ref=t.ref,e.return=t,t.child=e)}if(a=e.child,!Oc(e,i)){var o=a.memoizedProps;if(n=n.compare,n=n===null?Or:n,n(o,r)&&e.ref===t.ref)return Dc(e,t,i)}return t.flags|=1,e=mi(a,r),e.ref=t.ref,e.return=t,t.child=e}function ac(e,t,n,r,i){if(e!==null){var a=e.memoizedProps;if(Or(a,r)&&e.ref===t.ref){if(tc=!1,t.pendingProps=r=a,Oc(e,i))e.flags&131072&&(tc=!0);else return t.lanes=e.lanes,Dc(e,t,i)}}return pc(e,t,n,r,i)}function oc(e,t,n,r){var i=r.children,a=e===null?null:e.memoizedState;if(e===null&&t.stateNode===null&&(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),r.mode===`hidden`){if(t.flags&128){if(a=a===null?n:a.baseLanes|n,e!==null){for(r=t.child=e.child,i=0;r!==null;)i=i|r.lanes|r.childLanes,r=r.sibling;r=i&~a}else r=0,t.child=null;return cc(e,t,a,n,r)}if(n&536870912)t.memoizedState={baseLanes:0,cachePool:null},e!==null&&ya(t,a===null?null:a.cachePool),a===null?$a():Qa(t,a),ao(t);else return r=t.lanes=536870912,cc(e,t,a===null?n:a.baseLanes|n,n,r)}else a===null?(e!==null&&ya(t,null),$a(),oo(t)):(ya(t,a.cachePool),Qa(t,a),oo(t),t.memoizedState=null);return nc(e,t,i,n),t.child}function sc(e,t){return e!==null&&e.tag===22||t.stateNode!==null||(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),t.sibling}function cc(e,t,n,r,i){var a=va();return a=a===null?null:{parent:z._currentValue,pool:a},t.memoizedState={baseLanes:n,cachePool:a},e!==null&&ya(t,null),$a(),ao(t),e!==null&&ta(e,t,r,!0),t.childLanes=i,null}function lc(e,t){return t=Sc({mode:t.mode,children:t.children},e.mode),t.ref=e.ref,e.child=t,t.return=e,t}function uc(e,t,n){return Ia(t,e.child,null,n),e=lc(t,t.pendingProps),e.flags|=2,so(t),t.memoizedState=null,e}function dc(e,t,n){var r=t.pendingProps,a=!!(t.flags&128);if(t.flags&=-129,e===null){if(I){if(r.mode===`hidden`)return e=lc(t,r),t.lanes=536870912,sc(null,e);if(io(t),(e=F)?(e=rf(e,zi),e=e!==null&&e.data===`&`?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:ki===null?null:{id:Ai,overflow:ji},retryLane:536870912,hydrationErrors:null},n=yi(e),n.return=t,t.child=n,Li=t,F=null)):e=null,e===null)throw Vi(t);return t.lanes=536870912,null}return lc(t,r)}var o=e.memoizedState;if(o!==null){var s=o.dehydrated;if(io(t),a){if(t.flags&256)t.flags&=-257,t=uc(e,t,n);else if(t.memoizedState!==null)t.child=e.child,t.flags|=128,t=null;else throw Error(i(558))}else if(tc||ta(e,t,n,!1),a=(n&e.childLanes)!==0,tc||a){if(r=q,r!==null&&(s=st(r,n),s!==0&&s!==o.retryLane))throw o.retryLane=s,si(e,s),hu(r,e,s),ec;Du(),t=uc(e,t,n)}else e=o.treeContext,F=cf(s.nextSibling),Li=t,I=!0,Ri=null,zi=!1,e!==null&&Ii(t,e),t=lc(t,r),t.flags|=4096;return t}return e=mi(e.child,{mode:r.mode,children:r.children}),e.ref=t.ref,t.child=e,e.return=t,e}function fc(e,t){var n=t.ref;if(n===null)e!==null&&e.ref!==null&&(t.flags|=4194816);else{if(typeof n!=`function`&&typeof n!=`object`)throw Error(i(284));(e===null||e.ref!==n)&&(t.flags|=4194816)}}function pc(e,t,n,r,i){return ra(t),n=xo(e,t,n,r,void 0,i),r=To(),e!==null&&!tc?(Eo(e,t,i),Dc(e,t,i)):(I&&r&&Pi(t),t.flags|=1,nc(e,t,n,i),t.child)}function mc(e,t,n,r,i,a){return ra(t),t.updateQueue=null,n=Co(t,r,n,i),So(e),r=To(),e!==null&&!tc?(Eo(e,t,a),Dc(e,t,a)):(I&&r&&Pi(t),t.flags|=1,nc(e,t,n,a),t.child)}function hc(e,t,n,r,i){if(ra(t),t.stateNode===null){var a=ui,o=n.contextType;typeof o==`object`&&o&&(a=L(o)),a=new n(r,a),t.memoizedState=a.state!==null&&a.state!==void 0?a.state:null,a.updater=Vs,t.stateNode=a,a._reactInternals=t,a=t.stateNode,a.props=r,a.state=t.memoizedState,a.refs={},za(t),o=n.contextType,a.context=typeof o==`object`&&o?L(o):ui,a.state=t.memoizedState,o=n.getDerivedStateFromProps,typeof o==`function`&&(Bs(t,n,o,r),a.state=t.memoizedState),typeof n.getDerivedStateFromProps==`function`||typeof a.getSnapshotBeforeUpdate==`function`||typeof a.UNSAFE_componentWillMount!=`function`&&typeof a.componentWillMount!=`function`||(o=a.state,typeof a.componentWillMount==`function`&&a.componentWillMount(),typeof a.UNSAFE_componentWillMount==`function`&&a.UNSAFE_componentWillMount(),o!==a.state&&Vs.enqueueReplaceState(a,a.state,null),qa(t,r,a,i),Ka(),a.state=t.memoizedState),typeof a.componentDidMount==`function`&&(t.flags|=4194308),r=!0}else if(e===null){a=t.stateNode;var s=t.memoizedProps,c=Ws(n,s);a.props=c;var l=a.context,u=n.contextType;o=ui,typeof u==`object`&&u&&(o=L(u));var d=n.getDerivedStateFromProps;u=typeof d==`function`||typeof a.getSnapshotBeforeUpdate==`function`,s=t.pendingProps!==s,u||typeof a.UNSAFE_componentWillReceiveProps!=`function`&&typeof a.componentWillReceiveProps!=`function`||(s||l!==o)&&Us(t,a,r,o),Ra=!1;var f=t.memoizedState;a.state=f,qa(t,r,a,i),Ka(),l=t.memoizedState,s||f!==l||Ra?(typeof d==`function`&&(Bs(t,n,d,r),l=t.memoizedState),(c=Ra||Hs(t,n,c,r,f,l,o))?(u||typeof a.UNSAFE_componentWillMount!=`function`&&typeof a.componentWillMount!=`function`||(typeof a.componentWillMount==`function`&&a.componentWillMount(),typeof a.UNSAFE_componentWillMount==`function`&&a.UNSAFE_componentWillMount()),typeof a.componentDidMount==`function`&&(t.flags|=4194308)):(typeof a.componentDidMount==`function`&&(t.flags|=4194308),t.memoizedProps=r,t.memoizedState=l),a.props=r,a.state=l,a.context=o,r=c):(typeof a.componentDidMount==`function`&&(t.flags|=4194308),r=!1)}else{a=t.stateNode,Ba(e,t),o=t.memoizedProps,u=Ws(n,o),a.props=u,d=t.pendingProps,f=a.context,l=n.contextType,c=ui,typeof l==`object`&&l&&(c=L(l)),s=n.getDerivedStateFromProps,(l=typeof s==`function`||typeof a.getSnapshotBeforeUpdate==`function`)||typeof a.UNSAFE_componentWillReceiveProps!=`function`&&typeof a.componentWillReceiveProps!=`function`||(o!==d||f!==c)&&Us(t,a,r,c),Ra=!1,f=t.memoizedState,a.state=f,qa(t,r,a,i),Ka();var p=t.memoizedState;o!==d||f!==p||Ra||e!==null&&e.dependencies!==null&&na(e.dependencies)?(typeof s==`function`&&(Bs(t,n,s,r),p=t.memoizedState),(u=Ra||Hs(t,n,u,r,f,p,c)||e!==null&&e.dependencies!==null&&na(e.dependencies))?(l||typeof a.UNSAFE_componentWillUpdate!=`function`&&typeof a.componentWillUpdate!=`function`||(typeof a.componentWillUpdate==`function`&&a.componentWillUpdate(r,p,c),typeof a.UNSAFE_componentWillUpdate==`function`&&a.UNSAFE_componentWillUpdate(r,p,c)),typeof a.componentDidUpdate==`function`&&(t.flags|=4),typeof a.getSnapshotBeforeUpdate==`function`&&(t.flags|=1024)):(typeof a.componentDidUpdate!=`function`||o===e.memoizedProps&&f===e.memoizedState||(t.flags|=4),typeof a.getSnapshotBeforeUpdate!=`function`||o===e.memoizedProps&&f===e.memoizedState||(t.flags|=1024),t.memoizedProps=r,t.memoizedState=p),a.props=r,a.state=p,a.context=c,r=u):(typeof a.componentDidUpdate!=`function`||o===e.memoizedProps&&f===e.memoizedState||(t.flags|=4),typeof a.getSnapshotBeforeUpdate!=`function`||o===e.memoizedProps&&f===e.memoizedState||(t.flags|=1024),r=!1)}return a=r,fc(e,t),r=!!(t.flags&128),a||r?(a=t.stateNode,n=r&&typeof n.getDerivedStateFromError!=`function`?null:a.render(),t.flags|=1,e!==null&&r?(t.child=Ia(t,e.child,null,i),t.child=Ia(t,null,n,i)):nc(e,t,n,i),t.memoizedState=a.state,e=t.child):e=Dc(e,t,i),e}function gc(e,t,n,r){return Gi(),t.flags|=256,nc(e,t,n,r),t.child}var _c={dehydrated:null,treeContext:null,retryLane:0,hydrationErrors:null};function vc(e){return{baseLanes:e,cachePool:ba()}}function yc(e,t,n){return e=e===null?0:e.childLanes&~n,t&&(e|=Jl),e}function bc(e,t,n){var r=t.pendingProps,a=!1,o=!!(t.flags&128),s;if((s=o)||(s=e!==null&&e.memoizedState===null?!1:!!(co.current&2)),s&&(a=!0,t.flags&=-129),s=!!(t.flags&32),t.flags&=-33,e===null){if(I){if(a?ro(t):oo(t),(e=F)?(e=rf(e,zi),e=e!==null&&e.data!==`&`?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:ki===null?null:{id:Ai,overflow:ji},retryLane:536870912,hydrationErrors:null},n=yi(e),n.return=t,t.child=n,Li=t,F=null)):e=null,e===null)throw Vi(t);return of(e)?t.lanes=32:t.lanes=536870912,null}var c=r.children;return r=r.fallback,a?(oo(t),a=t.mode,c=Sc({mode:`hidden`,children:c},a),r=_i(r,a,n,null),c.return=t,r.return=t,c.sibling=r,t.child=c,r=t.child,r.memoizedState=vc(n),r.childLanes=yc(e,s,n),t.memoizedState=_c,sc(null,r)):(ro(t),xc(t,c))}var l=e.memoizedState;if(l!==null&&(c=l.dehydrated,c!==null)){if(o)t.flags&256?(ro(t),t.flags&=-257,t=Cc(e,t,n)):t.memoizedState===null?(oo(t),c=r.fallback,a=t.mode,r=Sc({mode:`visible`,children:r.children},a),c=_i(c,a,n,null),c.flags|=2,r.return=t,c.return=t,r.sibling=c,t.child=r,Ia(t,e.child,null,n),r=t.child,r.memoizedState=vc(n),r.childLanes=yc(e,s,n),t.memoizedState=_c,t=sc(null,r)):(oo(t),t.child=e.child,t.flags|=128,t=null);else if(ro(t),of(c)){if(s=c.nextSibling&&c.nextSibling.dataset,s)var u=s.dgst;s=u,r=Error(i(419)),r.stack=``,r.digest=s,qi({value:r,source:null,stack:null}),t=Cc(e,t,n)}else if(tc||ta(e,t,n,!1),s=(n&e.childLanes)!==0,tc||s){if(s=q,s!==null&&(r=st(s,n),r!==0&&r!==l.retryLane))throw l.retryLane=r,si(e,r),hu(s,e,r),ec;af(c)||Du(),t=Cc(e,t,n)}else af(c)?(t.flags|=192,t.child=e.child,t=null):(e=l.treeContext,F=cf(c.nextSibling),Li=t,I=!0,Ri=null,zi=!1,e!==null&&Ii(t,e),t=xc(t,r.children),t.flags|=4096);return t}return a?(oo(t),c=r.fallback,a=t.mode,l=e.child,u=l.sibling,r=mi(l,{mode:`hidden`,children:r.children}),r.subtreeFlags=l.subtreeFlags&65011712,u===null?(c=_i(c,a,n,null),c.flags|=2):c=mi(u,c),c.return=t,r.return=t,r.sibling=c,t.child=r,sc(null,r),r=t.child,c=e.child.memoizedState,c===null?c=vc(n):(a=c.cachePool,a===null?a=ba():(l=z._currentValue,a=a.parent===l?a:{parent:l,pool:l}),c={baseLanes:c.baseLanes|n,cachePool:a}),r.memoizedState=c,r.childLanes=yc(e,s,n),t.memoizedState=_c,sc(e.child,r)):(ro(t),n=e.child,e=n.sibling,n=mi(n,{mode:`visible`,children:r.children}),n.return=t,n.sibling=null,e!==null&&(s=t.deletions,s===null?(t.deletions=[e],t.flags|=16):s.push(e)),t.child=n,t.memoizedState=null,n)}function xc(e,t){return t=Sc({mode:`visible`,children:t},e.mode),t.return=e,e.child=t}function Sc(e,t){return e=fi(22,e,null,t),e.lanes=0,e}function Cc(e,t,n){return Ia(t,e.child,null,n),e=xc(t,t.pendingProps.children),e.flags|=2,t.memoizedState=null,e}function wc(e,t,n){e.lanes|=t;var r=e.alternate;r!==null&&(r.lanes|=t),$i(e.return,t,n)}function Tc(e,t,n,r,i,a){var o=e.memoizedState;o===null?e.memoizedState={isBackwards:t,rendering:null,renderingStartTime:0,last:r,tail:n,tailMode:i,treeForkCount:a}:(o.isBackwards=t,o.rendering=null,o.renderingStartTime=0,o.last=r,o.tail=n,o.tailMode=i,o.treeForkCount=a)}function Ec(e,t,n){var r=t.pendingProps,i=r.revealOrder,a=r.tail;r=r.children;var o=co.current,s=!!(o&2);if(s?(o=o&1|2,t.flags|=128):o&=1,k(co,o),nc(e,t,r,n),r=I?Ei:0,!s&&e!==null&&e.flags&128)a:for(e=t.child;e!==null;){if(e.tag===13)e.memoizedState!==null&&wc(e,n,t);else if(e.tag===19)wc(e,n,t);else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break a;for(;e.sibling===null;){if(e.return===null||e.return===t)break a;e=e.return}e.sibling.return=e.return,e=e.sibling}switch(i){case`forwards`:for(n=t.child,i=null;n!==null;)e=n.alternate,e!==null&&lo(e)===null&&(i=n),n=n.sibling;n=i,n===null?(i=t.child,t.child=null):(i=n.sibling,n.sibling=null),Tc(t,!1,i,n,a,r);break;case`backwards`:case`unstable_legacy-backwards`:for(n=null,i=t.child,t.child=null;i!==null;){if(e=i.alternate,e!==null&&lo(e)===null){t.child=i;break}e=i.sibling,i.sibling=n,n=i,i=e}Tc(t,!0,n,null,a,r);break;case`together`:Tc(t,!1,null,null,void 0,r);break;default:t.memoizedState=null}return t.child}function Dc(e,t,n){if(e!==null&&(t.dependencies=e.dependencies),Gl|=t.lanes,(n&t.childLanes)===0){if(e!==null){if(ta(e,t,n,!1),(n&t.childLanes)===0)return null}else return null}if(e!==null&&t.child!==e.child)throw Error(i(153));if(t.child!==null){for(e=t.child,n=mi(e,e.pendingProps),t.child=n,n.return=t;e.sibling!==null;)e=e.sibling,n=n.sibling=mi(e,e.pendingProps),n.return=t;n.sibling=null}return t.child}function Oc(e,t){return(e.lanes&t)!==0||(e=e.dependencies,!!(e!==null&&na(e)))}function kc(e,t,n){switch(t.tag){case 3:ve(t,t.stateNode.containerInfo),Zi(t,z,e.memoizedState.cache),Gi();break;case 27:case 5:ye(t);break;case 4:ve(t,t.stateNode.containerInfo);break;case 10:Zi(t,t.type,t.memoizedProps.value);break;case 31:if(t.memoizedState!==null)return t.flags|=128,io(t),null;break;case 13:var r=t.memoizedState;if(r!==null)return r.dehydrated===null?(n&t.child.childLanes)===0?(ro(t),e=Dc(e,t,n),e===null?null:e.sibling):bc(e,t,n):(ro(t),t.flags|=128,null);ro(t);break;case 19:var i=!!(e.flags&128);if(r=(n&t.childLanes)!==0,r||(ta(e,t,n,!1),r=(n&t.childLanes)!==0),i){if(r)return Ec(e,t,n);t.flags|=128}if(i=t.memoizedState,i!==null&&(i.rendering=null,i.tail=null,i.lastEffect=null),k(co,co.current),r)break;return null;case 22:return t.lanes=0,oc(e,t,n,t.pendingProps);case 24:Zi(t,z,e.memoizedState.cache)}return Dc(e,t,n)}function Ac(e,t,n){if(e!==null){if(e.memoizedProps!==t.pendingProps)tc=!0;else{if(!Oc(e,n)&&!(t.flags&128))return tc=!1,kc(e,t,n);tc=!!(e.flags&131072)}}else tc=!1,I&&t.flags&1048576&&Ni(t,Ei,t.index);switch(t.lanes=0,t.tag){case 16:a:{var r=t.pendingProps;if(e=Da(t.elementType),t.type=e,typeof e==`function`)pi(e)?(r=Ws(e,r),t.tag=1,t=hc(null,t,e,r,n)):(t.tag=0,t=pc(null,t,e,r,n));else{if(e!=null){var a=e.$$typeof;if(a===C){t.tag=11,t=rc(null,t,e,r,n);break a}if(a===re){t.tag=14,t=ic(null,t,e,r,n);break a}}throw t=ce(e)||e,Error(i(306,t,``))}}return t;case 0:return pc(e,t,t.type,t.pendingProps,n);case 1:return r=t.type,a=Ws(r,t.pendingProps),hc(e,t,r,a,n);case 3:a:{if(ve(t,t.stateNode.containerInfo),e===null)throw Error(i(387));r=t.pendingProps;var o=t.memoizedState;a=o.element,Ba(e,t),qa(t,r,null,n);var s=t.memoizedState;if(r=s.cache,Zi(t,z,r),r!==o.cache&&ea(t,[z],n,!0),Ka(),r=s.element,o.isDehydrated){if(o={element:r,isDehydrated:!1,cache:s.cache},t.updateQueue.baseState=o,t.memoizedState=o,t.flags&256){t=gc(e,t,r,n);break a}if(r!==a){a=Si(Error(i(424)),t),qi(a),t=gc(e,t,r,n);break a}switch(e=t.stateNode.containerInfo,e.nodeType){case 9:e=e.body;break;default:e=e.nodeName===`HTML`?e.ownerDocument.body:e}for(F=cf(e.firstChild),Li=t,I=!0,Ri=null,zi=!0,n=La(t,null,r,n),t.child=n;n;)n.flags=n.flags&-3|4096,n=n.sibling}else{if(Gi(),r===a){t=Dc(e,t,n);break a}nc(e,t,r,n)}t=t.child}return t;case 26:return fc(e,t),e===null?(n=kf(t.type,null,t.pendingProps,null))?t.memoizedState=n:I||(n=t.type,e=t.pendingProps,r=Bd(ge.current).createElement(n),r[M]=t,r[N]=e,Pd(r,n,e),wt(r),t.stateNode=r):t.memoizedState=kf(t.type,e.memoizedProps,t.pendingProps,e.memoizedState),null;case 27:return ye(t),e===null&&I&&(r=t.stateNode=ff(t.type,t.pendingProps,ge.current),Li=t,zi=!0,a=F,Zd(t.type)?(lf=a,F=cf(r.firstChild)):F=a),nc(e,t,t.pendingProps.children,n),fc(e,t),e===null&&(t.flags|=4194304),t.child;case 5:return e===null&&I&&((a=r=F)&&(r=tf(r,t.type,t.pendingProps,zi),r===null?a=!1:(t.stateNode=r,Li=t,F=cf(r.firstChild),zi=!1,a=!0)),a||Vi(t)),ye(t),a=t.type,o=t.pendingProps,s=e===null?null:e.memoizedProps,r=o.children,Ud(a,o)?r=null:s!==null&&Ud(a,s)&&(t.flags|=32),t.memoizedState!==null&&(a=xo(e,t,wo,null,null,n),Qf._currentValue=a),fc(e,t),nc(e,t,r,n),t.child;case 6:return e===null&&I&&((e=n=F)&&(n=nf(n,t.pendingProps,zi),n===null?e=!1:(t.stateNode=n,Li=t,F=null,e=!0)),e||Vi(t)),null;case 13:return bc(e,t,n);case 4:return ve(t,t.stateNode.containerInfo),r=t.pendingProps,e===null?t.child=Ia(t,null,r,n):nc(e,t,r,n),t.child;case 11:return rc(e,t,t.type,t.pendingProps,n);case 7:return nc(e,t,t.pendingProps,n),t.child;case 8:return nc(e,t,t.pendingProps.children,n),t.child;case 12:return nc(e,t,t.pendingProps.children,n),t.child;case 10:return r=t.pendingProps,Zi(t,t.type,r.value),nc(e,t,r.children,n),t.child;case 9:return a=t.type._context,r=t.pendingProps.children,ra(t),a=L(a),r=r(a),t.flags|=1,nc(e,t,r,n),t.child;case 14:return ic(e,t,t.type,t.pendingProps,n);case 15:return ac(e,t,t.type,t.pendingProps,n);case 19:return Ec(e,t,n);case 31:return dc(e,t,n);case 22:return oc(e,t,n,t.pendingProps);case 24:return ra(t),r=L(z),e===null?(a=va(),a===null&&(a=q,o=ca(),a.pooledCache=o,o.refCount++,o!==null&&(a.pooledCacheLanes|=n),a=o),t.memoizedState={parent:r,cache:a},za(t),Zi(t,z,a)):((e.lanes&n)!==0&&(Ba(e,t),qa(t,null,null,n),Ka()),a=e.memoizedState,o=t.memoizedState,a.parent===r?(r=o.cache,Zi(t,z,r),r!==a.cache&&ea(t,[z],n,!0)):(a={parent:r,cache:r},t.memoizedState=a,t.lanes===0&&(t.memoizedState=t.updateQueue.baseState=a),Zi(t,z,r))),nc(e,t,t.pendingProps.children,n),t.child;case 29:throw t.pendingProps}throw Error(i(156,t.tag))}function jc(e){e.flags|=4}function Mc(e,t,n,r,i){if((t=!!(e.mode&32))&&(t=!1),t){if(e.flags|=16777216,(i&335544128)===i){if(e.stateNode.complete)e.flags|=8192;else if(wu())e.flags|=8192;else throw Oa=wa,Sa}}else e.flags&=-16777217}function Nc(e,t){if(t.type!==`stylesheet`||t.state.loading&4)e.flags&=-16777217;else if(e.flags|=16777216,!Wf(t)){if(wu())e.flags|=8192;else throw Oa=wa,Sa}}function Pc(e,t){t!==null&&(e.flags|=4),e.flags&16384&&(t=e.tag===22?536870912:tt(),e.lanes|=t,Yl|=t)}function Fc(e,t){if(!I)switch(e.tailMode){case`hidden`:t=e.tail;for(var n=null;t!==null;)t.alternate!==null&&(n=t),t=t.sibling;n===null?e.tail=null:n.sibling=null;break;case`collapsed`:n=e.tail;for(var r=null;n!==null;)n.alternate!==null&&(r=n),n=n.sibling;r===null?t||e.tail===null?e.tail=null:e.tail.sibling=null:r.sibling=null}}function Ic(e){var t=e.alternate!==null&&e.alternate.child===e.child,n=0,r=0;if(t)for(var i=e.child;i!==null;)n|=i.lanes|i.childLanes,r|=i.subtreeFlags&65011712,r|=i.flags&65011712,i.return=e,i=i.sibling;else for(i=e.child;i!==null;)n|=i.lanes|i.childLanes,r|=i.subtreeFlags,r|=i.flags,i.return=e,i=i.sibling;return e.subtreeFlags|=r,e.childLanes=n,t}function Lc(e,t,n){var r=t.pendingProps;switch(Fi(t),t.tag){case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return Ic(t),null;case 1:return Ic(t),null;case 3:return n=t.stateNode,r=null,e!==null&&(r=e.memoizedState.cache),t.memoizedState.cache!==r&&(t.flags|=2048),Qi(z),A(),n.pendingContext&&(n.context=n.pendingContext,n.pendingContext=null),(e===null||e.child===null)&&(Wi(t)?jc(t):e===null||e.memoizedState.isDehydrated&&!(t.flags&256)||(t.flags|=1024,Ki())),Ic(t),null;case 26:var a=t.type,o=t.memoizedState;return e===null?(jc(t),o===null?(Ic(t),Mc(t,a,null,r,n)):(Ic(t),Nc(t,o))):o?o===e.memoizedState?(Ic(t),t.flags&=-16777217):(jc(t),Ic(t),Nc(t,o)):(e=e.memoizedProps,e!==r&&jc(t),Ic(t),Mc(t,a,e,r,n)),null;case 27:if(be(t),n=ge.current,a=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==r&&jc(t);else{if(!r){if(t.stateNode===null)throw Error(i(166));return Ic(t),null}e=me.current,Wi(t)?Hi(t,e):(e=ff(a,r,n),t.stateNode=e,jc(t))}return Ic(t),null;case 5:if(be(t),a=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==r&&jc(t);else{if(!r){if(t.stateNode===null)throw Error(i(166));return Ic(t),null}if(o=me.current,Wi(t))Hi(t,o);else{var s=Bd(ge.current);switch(o){case 1:o=s.createElementNS(`http://www.w3.org/2000/svg`,a);break;case 2:o=s.createElementNS(`http://www.w3.org/1998/Math/MathML`,a);break;default:switch(a){case`svg`:o=s.createElementNS(`http://www.w3.org/2000/svg`,a);break;case`math`:o=s.createElementNS(`http://www.w3.org/1998/Math/MathML`,a);break;case`script`:o=s.createElement(`div`),o.innerHTML=`<script><\/script>`,o=o.removeChild(o.firstChild);break;case`select`:o=typeof r.is==`string`?s.createElement(`select`,{is:r.is}):s.createElement(`select`),r.multiple?o.multiple=!0:r.size&&(o.size=r.size);break;default:o=typeof r.is==`string`?s.createElement(a,{is:r.is}):s.createElement(a)}}o[M]=t,o[N]=r;a:for(s=t.child;s!==null;){if(s.tag===5||s.tag===6)o.appendChild(s.stateNode);else if(s.tag!==4&&s.tag!==27&&s.child!==null){s.child.return=s,s=s.child;continue}if(s===t)break a;for(;s.sibling===null;){if(s.return===null||s.return===t)break a;s=s.return}s.sibling.return=s.return,s=s.sibling}t.stateNode=o;a:switch(Pd(o,a,r),a){case`button`:case`input`:case`select`:case`textarea`:r=!!r.autoFocus;break a;case`img`:r=!0;break a;default:r=!1}r&&jc(t)}}return Ic(t),Mc(t,t.type,e===null?null:e.memoizedProps,t.pendingProps,n),null;case 6:if(e&&t.stateNode!=null)e.memoizedProps!==r&&jc(t);else{if(typeof r!=`string`&&t.stateNode===null)throw Error(i(166));if(e=ge.current,Wi(t)){if(e=t.stateNode,n=t.memoizedProps,r=null,a=Li,a!==null)switch(a.tag){case 27:case 5:r=a.memoizedProps}e[M]=t,e=!!(e.nodeValue===n||r!==null&&!0===r.suppressHydrationWarning||Md(e.nodeValue,n)),e||Vi(t,!0)}else e=Bd(e).createTextNode(r),e[M]=t,t.stateNode=e}return Ic(t),null;case 31:if(n=t.memoizedState,e===null||e.memoizedState!==null){if(r=Wi(t),n!==null){if(e===null){if(!r)throw Error(i(318));if(e=t.memoizedState,e=e===null?null:e.dehydrated,!e)throw Error(i(557));e[M]=t}else Gi(),!(t.flags&128)&&(t.memoizedState=null),t.flags|=4;Ic(t),e=!1}else n=Ki(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=n),e=!0;if(!e)return t.flags&256?(so(t),t):(so(t),null);if(t.flags&128)throw Error(i(558))}return Ic(t),null;case 13:if(r=t.memoizedState,e===null||e.memoizedState!==null&&e.memoizedState.dehydrated!==null){if(a=Wi(t),r!==null&&r.dehydrated!==null){if(e===null){if(!a)throw Error(i(318));if(a=t.memoizedState,a=a===null?null:a.dehydrated,!a)throw Error(i(317));a[M]=t}else Gi(),!(t.flags&128)&&(t.memoizedState=null),t.flags|=4;Ic(t),a=!1}else a=Ki(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=a),a=!0;if(!a)return t.flags&256?(so(t),t):(so(t),null)}return so(t),t.flags&128?(t.lanes=n,t):(n=r!==null,e=e!==null&&e.memoizedState!==null,n&&(r=t.child,a=null,r.alternate!==null&&r.alternate.memoizedState!==null&&r.alternate.memoizedState.cachePool!==null&&(a=r.alternate.memoizedState.cachePool.pool),o=null,r.memoizedState!==null&&r.memoizedState.cachePool!==null&&(o=r.memoizedState.cachePool.pool),o!==a&&(r.flags|=2048)),n!==e&&n&&(t.child.flags|=8192),Pc(t,t.updateQueue),Ic(t),null);case 4:return A(),e===null&&Sd(t.stateNode.containerInfo),Ic(t),null;case 10:return Qi(t.type),Ic(t),null;case 19:if(pe(co),r=t.memoizedState,r===null)return Ic(t),null;if(a=!!(t.flags&128),o=r.rendering,o===null){if(a)Fc(r,!1);else{if(Wl!==0||e!==null&&e.flags&128)for(e=t.child;e!==null;){if(o=lo(e),o!==null){for(t.flags|=128,Fc(r,!1),e=o.updateQueue,t.updateQueue=e,Pc(t,e),t.subtreeFlags=0,e=n,n=t.child;n!==null;)hi(n,e),n=n.sibling;return k(co,co.current&1|2),I&&Mi(t,r.treeForkCount),t.child}e=e.sibling}r.tail!==null&&Me()>tu&&(t.flags|=128,a=!0,Fc(r,!1),t.lanes=4194304)}}else{if(!a){if(e=lo(o),e!==null){if(t.flags|=128,a=!0,e=e.updateQueue,t.updateQueue=e,Pc(t,e),Fc(r,!0),r.tail===null&&r.tailMode===`hidden`&&!o.alternate&&!I)return Ic(t),null}else 2*Me()-r.renderingStartTime>tu&&n!==536870912&&(t.flags|=128,a=!0,Fc(r,!1),t.lanes=4194304)}r.isBackwards?(o.sibling=t.child,t.child=o):(e=r.last,e===null?t.child=o:e.sibling=o,r.last=o)}return r.tail===null?(Ic(t),null):(e=r.tail,r.rendering=e,r.tail=e.sibling,r.renderingStartTime=Me(),e.sibling=null,n=co.current,k(co,a?n&1|2:n&1),I&&Mi(t,r.treeForkCount),e);case 22:case 23:return so(t),eo(),r=t.memoizedState!==null,e===null?r&&(t.flags|=8192):e.memoizedState!==null!==r&&(t.flags|=8192),r?n&536870912&&!(t.flags&128)&&(Ic(t),t.subtreeFlags&6&&(t.flags|=8192)):Ic(t),n=t.updateQueue,n!==null&&Pc(t,n.retryQueue),n=null,e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(n=e.memoizedState.cachePool.pool),r=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(r=t.memoizedState.cachePool.pool),r!==n&&(t.flags|=2048),e!==null&&pe(_a),null;case 24:return n=null,e!==null&&(n=e.memoizedState.cache),t.memoizedState.cache!==n&&(t.flags|=2048),Qi(z),Ic(t),null;case 25:return null;case 30:return null}throw Error(i(156,t.tag))}function Rc(e,t){switch(Fi(t),t.tag){case 1:return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 3:return Qi(z),A(),e=t.flags,e&65536&&!(e&128)?(t.flags=e&-65537|128,t):null;case 26:case 27:case 5:return be(t),null;case 31:if(t.memoizedState!==null){if(so(t),t.alternate===null)throw Error(i(340));Gi()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 13:if(so(t),e=t.memoizedState,e!==null&&e.dehydrated!==null){if(t.alternate===null)throw Error(i(340));Gi()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 19:return pe(co),null;case 4:return A(),null;case 10:return Qi(t.type),null;case 22:case 23:return so(t),eo(),e!==null&&pe(_a),e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 24:return Qi(z),null;case 25:return null;default:return null}}function zc(e,t){switch(Fi(t),t.tag){case 3:Qi(z),A();break;case 26:case 27:case 5:be(t);break;case 4:A();break;case 31:t.memoizedState!==null&&so(t);break;case 13:so(t);break;case 19:pe(co);break;case 10:Qi(t.type);break;case 22:case 23:so(t),eo(),e!==null&&pe(_a);break;case 24:Qi(z)}}function Bc(e,t){try{var n=t.updateQueue,r=n===null?null:n.lastEffect;if(r!==null){var i=r.next;n=i;do{if((n.tag&e)===e){r=void 0;var a=n.create,o=n.inst;r=a(),o.destroy=r}n=n.next}while(n!==i)}}catch(e){Z(t,t.return,e)}}function Vc(e,t,n){try{var r=t.updateQueue,i=r===null?null:r.lastEffect;if(i!==null){var a=i.next;r=a;do{if((r.tag&e)===e){var o=r.inst,s=o.destroy;if(s!==void 0){o.destroy=void 0,i=t;var c=n,l=s;try{l()}catch(e){Z(i,c,e)}}}r=r.next}while(r!==a)}}catch(e){Z(t,t.return,e)}}function Hc(e){var t=e.updateQueue;if(t!==null){var n=e.stateNode;try{Ya(t,n)}catch(t){Z(e,e.return,t)}}}function Uc(e,t,n){n.props=Ws(e.type,e.memoizedProps),n.state=e.memoizedState;try{n.componentWillUnmount()}catch(n){Z(e,t,n)}}function Wc(e,t){try{var n=e.ref;if(n!==null){switch(e.tag){case 26:case 27:case 5:var r=e.stateNode;break;case 30:r=e.stateNode;break;default:r=e.stateNode}typeof n==`function`?e.refCleanup=n(r):n.current=r}}catch(n){Z(e,t,n)}}function Gc(e,t){var n=e.ref,r=e.refCleanup;if(n!==null){if(typeof r==`function`)try{r()}catch(n){Z(e,t,n)}finally{e.refCleanup=null,e=e.alternate,e!=null&&(e.refCleanup=null)}else if(typeof n==`function`)try{n(null)}catch(n){Z(e,t,n)}else n.current=null}}function Kc(e){var t=e.type,n=e.memoizedProps,r=e.stateNode;try{a:switch(t){case`button`:case`input`:case`select`:case`textarea`:n.autoFocus&&r.focus();break a;case`img`:n.src?r.src=n.src:n.srcSet&&(r.srcset=n.srcSet)}}catch(t){Z(e,e.return,t)}}function qc(e,t,n){try{var r=e.stateNode;Fd(r,e.type,n,t),r[N]=t}catch(t){Z(e,e.return,t)}}function Jc(e){return e.tag===5||e.tag===3||e.tag===26||e.tag===27&&Zd(e.type)||e.tag===4}function Yc(e){a:for(;;){for(;e.sibling===null;){if(e.return===null||Jc(e.return))return null;e=e.return}for(e.sibling.return=e.return,e=e.sibling;e.tag!==5&&e.tag!==6&&e.tag!==18;){if(e.tag===27&&Zd(e.type)||e.flags&2||e.child===null||e.tag===4)continue a;e.child.return=e,e=e.child}if(!(e.flags&2))return e.stateNode}}function Xc(e,t,n){var r=e.tag;if(r===5||r===6)e=e.stateNode,t?(n.nodeType===9?n.body:n.nodeName===`HTML`?n.ownerDocument.body:n).insertBefore(e,t):(t=n.nodeType===9?n.body:n.nodeName===`HTML`?n.ownerDocument.body:n,t.appendChild(e),n=n._reactRootContainer,n!=null||t.onclick!==null||(t.onclick=an));else if(r!==4&&(r===27&&Zd(e.type)&&(n=e.stateNode,t=null),e=e.child,e!==null))for(Xc(e,t,n),e=e.sibling;e!==null;)Xc(e,t,n),e=e.sibling}function Zc(e,t,n){var r=e.tag;if(r===5||r===6)e=e.stateNode,t?n.insertBefore(e,t):n.appendChild(e);else if(r!==4&&(r===27&&Zd(e.type)&&(n=e.stateNode),e=e.child,e!==null))for(Zc(e,t,n),e=e.sibling;e!==null;)Zc(e,t,n),e=e.sibling}function Qc(e){var t=e.stateNode,n=e.memoizedProps;try{for(var r=e.type,i=t.attributes;i.length;)t.removeAttributeNode(i[0]);Pd(t,r,n),t[M]=e,t[N]=n}catch(t){Z(e,e.return,t)}}var $c=!1,el=!1,tl=!1,nl=typeof WeakSet==`function`?WeakSet:Set,rl=null;function il(e,t){if(e=e.containerInfo,Rd=sp,e=Mr(e),Nr(e)){if(`selectionStart`in e)var n={start:e.selectionStart,end:e.selectionEnd};else a:{n=(n=e.ownerDocument)&&n.defaultView||window;var r=n.getSelection&&n.getSelection();if(r&&r.rangeCount!==0){n=r.anchorNode;var a=r.anchorOffset,o=r.focusNode;r=r.focusOffset;try{n.nodeType,o.nodeType}catch{n=null;break a}var s=0,c=-1,l=-1,u=0,d=0,f=e,p=null;b:for(;;){for(var m;f!==n||a!==0&&f.nodeType!==3||(c=s+a),f!==o||r!==0&&f.nodeType!==3||(l=s+r),f.nodeType===3&&(s+=f.nodeValue.length),(m=f.firstChild)!==null;)p=f,f=m;for(;;){if(f===e)break b;if(p===n&&++u===a&&(c=s),p===o&&++d===r&&(l=s),(m=f.nextSibling)!==null)break;f=p,p=f.parentNode}f=m}n=c===-1||l===-1?null:{start:c,end:l}}else n=null}n=n||{start:0,end:0}}else n=null;for(zd={focusedElem:e,selectionRange:n},sp=!1,rl=t;rl!==null;)if(t=rl,e=t.child,t.subtreeFlags&1028&&e!==null)e.return=t,rl=e;else for(;rl!==null;){switch(t=rl,o=t.alternate,e=t.flags,t.tag){case 0:if(e&4&&(e=t.updateQueue,e=e===null?null:e.events,e!==null))for(n=0;n<e.length;n++)a=e[n],a.ref.impl=a.nextImpl;break;case 11:case 15:break;case 1:if(e&1024&&o!==null){e=void 0,n=t,a=o.memoizedProps,o=o.memoizedState,r=n.stateNode;try{var h=Ws(n.type,a);e=r.getSnapshotBeforeUpdate(h,o),r.__reactInternalSnapshotBeforeUpdate=e}catch(e){Z(n,n.return,e)}}break;case 3:if(e&1024){if(e=t.stateNode.containerInfo,n=e.nodeType,n===9)ef(e);else if(n===1)switch(e.nodeName){case`HEAD`:case`HTML`:case`BODY`:ef(e);break;default:e.textContent=``}}break;case 5:case 26:case 27:case 6:case 4:case 17:break;default:if(e&1024)throw Error(i(163))}if(e=t.sibling,e!==null){e.return=t.return,rl=e;break}rl=t.return}}function al(e,t,n){var r=n.flags;switch(n.tag){case 0:case 11:case 15:bl(e,n),r&4&&Bc(5,n);break;case 1:if(bl(e,n),r&4){if(e=n.stateNode,t===null)try{e.componentDidMount()}catch(e){Z(n,n.return,e)}else{var i=Ws(n.type,t.memoizedProps);t=t.memoizedState;try{e.componentDidUpdate(i,t,e.__reactInternalSnapshotBeforeUpdate)}catch(e){Z(n,n.return,e)}}}r&64&&Hc(n),r&512&&Wc(n,n.return);break;case 3:if(bl(e,n),r&64&&(e=n.updateQueue,e!==null)){if(t=null,n.child!==null)switch(n.child.tag){case 27:case 5:t=n.child.stateNode;break;case 1:t=n.child.stateNode}try{Ya(e,t)}catch(e){Z(n,n.return,e)}}break;case 27:t===null&&r&4&&Qc(n);case 26:case 5:bl(e,n),t===null&&r&4&&Kc(n),r&512&&Wc(n,n.return);break;case 12:bl(e,n);break;case 31:bl(e,n),r&4&&dl(e,n);break;case 13:bl(e,n),r&4&&fl(e,n),r&64&&(e=n.memoizedState,e!==null&&(e=e.dehydrated,e!==null&&(n=Ju.bind(null,n),sf(e,n))));break;case 22:if(r=n.memoizedState!==null||$c,!r){t=t!==null&&t.memoizedState!==null||el,i=$c;var a=el;$c=r,(el=t)&&!a?Sl(e,n,!!(n.subtreeFlags&8772)):bl(e,n),$c=i,el=a}break;case 30:break;default:bl(e,n)}}function ol(e){var t=e.alternate;t!==null&&(e.alternate=null,ol(t)),e.child=null,e.deletions=null,e.sibling=null,e.tag===5&&(t=e.stateNode,t!==null&&yt(t)),e.stateNode=null,e.return=null,e.dependencies=null,e.memoizedProps=null,e.memoizedState=null,e.pendingProps=null,e.stateNode=null,e.updateQueue=null}var sl=null,cl=!1;function ll(e,t,n){for(n=n.child;n!==null;)ul(e,t,n),n=n.sibling}function ul(e,t,n){if(He&&typeof He.onCommitFiberUnmount==`function`)try{He.onCommitFiberUnmount(Ve,n)}catch{}switch(n.tag){case 26:el||Gc(n,t),ll(e,t,n),n.memoizedState?n.memoizedState.count--:n.stateNode&&(n=n.stateNode,n.parentNode.removeChild(n));break;case 27:el||Gc(n,t);var r=sl,i=cl;Zd(n.type)&&(sl=n.stateNode,cl=!1),ll(e,t,n),pf(n.stateNode),sl=r,cl=i;break;case 5:el||Gc(n,t);case 6:if(r=sl,i=cl,sl=null,ll(e,t,n),sl=r,cl=i,sl!==null){if(cl)try{(sl.nodeType===9?sl.body:sl.nodeName===`HTML`?sl.ownerDocument.body:sl).removeChild(n.stateNode)}catch(e){Z(n,t,e)}else try{sl.removeChild(n.stateNode)}catch(e){Z(n,t,e)}}break;case 18:sl!==null&&(cl?(e=sl,Qd(e.nodeType===9?e.body:e.nodeName===`HTML`?e.ownerDocument.body:e,n.stateNode),Np(e)):Qd(sl,n.stateNode));break;case 4:r=sl,i=cl,sl=n.stateNode.containerInfo,cl=!0,ll(e,t,n),sl=r,cl=i;break;case 0:case 11:case 14:case 15:Vc(2,n,t),el||Vc(4,n,t),ll(e,t,n);break;case 1:el||(Gc(n,t),r=n.stateNode,typeof r.componentWillUnmount==`function`&&Uc(n,t,r)),ll(e,t,n);break;case 21:ll(e,t,n);break;case 22:el=(r=el)||n.memoizedState!==null,ll(e,t,n),el=r;break;default:ll(e,t,n)}}function dl(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null))){e=e.dehydrated;try{Np(e)}catch(e){Z(t,t.return,e)}}}function fl(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null&&(e=e.dehydrated,e!==null))))try{Np(e)}catch(e){Z(t,t.return,e)}}function pl(e){switch(e.tag){case 31:case 13:case 19:var t=e.stateNode;return t===null&&(t=e.stateNode=new nl),t;case 22:return e=e.stateNode,t=e._retryCache,t===null&&(t=e._retryCache=new nl),t;default:throw Error(i(435,e.tag))}}function ml(e,t){var n=pl(e);t.forEach(function(t){if(!n.has(t)){n.add(t);var r=Yu.bind(null,e,t);t.then(r,r)}})}function hl(e,t){var n=t.deletions;if(n!==null)for(var r=0;r<n.length;r++){var a=n[r],o=e,s=t,c=s;a:for(;c!==null;){switch(c.tag){case 27:if(Zd(c.type)){sl=c.stateNode,cl=!1;break a}break;case 5:sl=c.stateNode,cl=!1;break a;case 3:case 4:sl=c.stateNode.containerInfo,cl=!0;break a}c=c.return}if(sl===null)throw Error(i(160));ul(o,s,a),sl=null,cl=!1,o=a.alternate,o!==null&&(o.return=null),a.return=null}if(t.subtreeFlags&13886)for(t=t.child;t!==null;)_l(t,e),t=t.sibling}var gl=null;function _l(e,t){var n=e.alternate,r=e.flags;switch(e.tag){case 0:case 11:case 14:case 15:hl(t,e),vl(e),r&4&&(Vc(3,e,e.return),Bc(3,e),Vc(5,e,e.return));break;case 1:hl(t,e),vl(e),r&512&&(el||n===null||Gc(n,n.return)),r&64&&$c&&(e=e.updateQueue,e!==null&&(r=e.callbacks,r!==null&&(n=e.shared.hiddenCallbacks,e.shared.hiddenCallbacks=n===null?r:n.concat(r))));break;case 26:var a=gl;if(hl(t,e),vl(e),r&512&&(el||n===null||Gc(n,n.return)),r&4){var o=n===null?null:n.memoizedState;if(r=e.memoizedState,n===null){if(r===null){if(e.stateNode===null){a:{r=e.type,n=e.memoizedProps,a=a.ownerDocument||a;b:switch(r){case`title`:o=a.getElementsByTagName(`title`)[0],(!o||o[vt]||o[M]||o.namespaceURI===`http://www.w3.org/2000/svg`||o.hasAttribute(`itemprop`))&&(o=a.createElement(r),a.head.insertBefore(o,a.querySelector(`head > title`))),Pd(o,r,n),o[M]=e,wt(o),r=o;break a;case`link`:var s=Vf(`link`,`href`,a).get(r+(n.href||``));if(s){for(var c=0;c<s.length;c++)if(o=s[c],o.getAttribute(`href`)===(n.href==null||n.href===``?null:n.href)&&o.getAttribute(`rel`)===(n.rel==null?null:n.rel)&&o.getAttribute(`title`)===(n.title==null?null:n.title)&&o.getAttribute(`crossorigin`)===(n.crossOrigin==null?null:n.crossOrigin)){s.splice(c,1);break b}}o=a.createElement(r),Pd(o,r,n),a.head.appendChild(o);break;case`meta`:if(s=Vf(`meta`,`content`,a).get(r+(n.content||``))){for(c=0;c<s.length;c++)if(o=s[c],o.getAttribute(`content`)===(n.content==null?null:``+n.content)&&o.getAttribute(`name`)===(n.name==null?null:n.name)&&o.getAttribute(`property`)===(n.property==null?null:n.property)&&o.getAttribute(`http-equiv`)===(n.httpEquiv==null?null:n.httpEquiv)&&o.getAttribute(`charset`)===(n.charSet==null?null:n.charSet)){s.splice(c,1);break b}}o=a.createElement(r),Pd(o,r,n),a.head.appendChild(o);break;default:throw Error(i(468,r))}o[M]=e,wt(o),r=o}e.stateNode=r}else Hf(a,e.type,e.stateNode)}else e.stateNode=If(a,r,e.memoizedProps)}else o===r?r===null&&e.stateNode!==null&&qc(e,e.memoizedProps,n.memoizedProps):(o===null?n.stateNode!==null&&(n=n.stateNode,n.parentNode.removeChild(n)):o.count--,r===null?Hf(a,e.type,e.stateNode):If(a,r,e.memoizedProps))}break;case 27:hl(t,e),vl(e),r&512&&(el||n===null||Gc(n,n.return)),n!==null&&r&4&&qc(e,e.memoizedProps,n.memoizedProps);break;case 5:if(hl(t,e),vl(e),r&512&&(el||n===null||Gc(n,n.return)),e.flags&32){a=e.stateNode;try{Xt(a,``)}catch(t){Z(e,e.return,t)}}r&4&&e.stateNode!=null&&(a=e.memoizedProps,qc(e,a,n===null?a:n.memoizedProps)),r&1024&&(tl=!0);break;case 6:if(hl(t,e),vl(e),r&4){if(e.stateNode===null)throw Error(i(162));r=e.memoizedProps,n=e.stateNode;try{n.nodeValue=r}catch(t){Z(e,e.return,t)}}break;case 3:if(Bf=null,a=gl,gl=gf(t.containerInfo),hl(t,e),gl=a,vl(e),r&4&&n!==null&&n.memoizedState.isDehydrated)try{Np(t.containerInfo)}catch(t){Z(e,e.return,t)}tl&&(tl=!1,yl(e));break;case 4:r=gl,gl=gf(e.stateNode.containerInfo),hl(t,e),vl(e),gl=r;break;case 12:hl(t,e),vl(e);break;case 31:hl(t,e),vl(e),r&4&&(r=e.updateQueue,r!==null&&(e.updateQueue=null,ml(e,r)));break;case 13:hl(t,e),vl(e),e.child.flags&8192&&e.memoizedState!==null!=(n!==null&&n.memoizedState!==null)&&($l=Me()),r&4&&(r=e.updateQueue,r!==null&&(e.updateQueue=null,ml(e,r)));break;case 22:a=e.memoizedState!==null;var l=n!==null&&n.memoizedState!==null,u=$c,d=el;if($c=u||a,el=d||l,hl(t,e),el=d,$c=u,vl(e),r&8192)a:for(t=e.stateNode,t._visibility=a?t._visibility&-2:t._visibility|1,a&&(n===null||l||$c||el||xl(e)),n=null,t=e;;){if(t.tag===5||t.tag===26){if(n===null){l=n=t;try{if(o=l.stateNode,a)s=o.style,typeof s.setProperty==`function`?s.setProperty(`display`,`none`,`important`):s.display=`none`;else{c=l.stateNode;var f=l.memoizedProps.style,p=f!=null&&f.hasOwnProperty(`display`)?f.display:null;c.style.display=p==null||typeof p==`boolean`?``:(``+p).trim()}}catch(e){Z(l,l.return,e)}}}else if(t.tag===6){if(n===null){l=t;try{l.stateNode.nodeValue=a?``:l.memoizedProps}catch(e){Z(l,l.return,e)}}}else if(t.tag===18){if(n===null){l=t;try{var m=l.stateNode;a?$d(m,!0):$d(l.stateNode,!1)}catch(e){Z(l,l.return,e)}}}else if((t.tag!==22&&t.tag!==23||t.memoizedState===null||t===e)&&t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break a;for(;t.sibling===null;){if(t.return===null||t.return===e)break a;n===t&&(n=null),t=t.return}n===t&&(n=null),t.sibling.return=t.return,t=t.sibling}r&4&&(r=e.updateQueue,r!==null&&(n=r.retryQueue,n!==null&&(r.retryQueue=null,ml(e,n))));break;case 19:hl(t,e),vl(e),r&4&&(r=e.updateQueue,r!==null&&(e.updateQueue=null,ml(e,r)));break;case 30:break;case 21:break;default:hl(t,e),vl(e)}}function vl(e){var t=e.flags;if(t&2){try{for(var n,r=e.return;r!==null;){if(Jc(r)){n=r;break}r=r.return}if(n==null)throw Error(i(160));switch(n.tag){case 27:var a=n.stateNode;Zc(e,Yc(e),a);break;case 5:var o=n.stateNode;n.flags&32&&(Xt(o,``),n.flags&=-33),Zc(e,Yc(e),o);break;case 3:case 4:var s=n.stateNode.containerInfo;Xc(e,Yc(e),s);break;default:throw Error(i(161))}}catch(t){Z(e,e.return,t)}e.flags&=-3}t&4096&&(e.flags&=-4097)}function yl(e){if(e.subtreeFlags&1024)for(e=e.child;e!==null;){var t=e;yl(t),t.tag===5&&t.flags&1024&&t.stateNode.reset(),e=e.sibling}}function bl(e,t){if(t.subtreeFlags&8772)for(t=t.child;t!==null;)al(e,t.alternate,t),t=t.sibling}function xl(e){for(e=e.child;e!==null;){var t=e;switch(t.tag){case 0:case 11:case 14:case 15:Vc(4,t,t.return),xl(t);break;case 1:Gc(t,t.return);var n=t.stateNode;typeof n.componentWillUnmount==`function`&&Uc(t,t.return,n),xl(t);break;case 27:pf(t.stateNode);case 26:case 5:Gc(t,t.return),xl(t);break;case 22:t.memoizedState===null&&xl(t);break;case 30:xl(t);break;default:xl(t)}e=e.sibling}}function Sl(e,t,n){for(n=n&&!!(t.subtreeFlags&8772),t=t.child;t!==null;){var r=t.alternate,i=e,a=t,o=a.flags;switch(a.tag){case 0:case 11:case 15:Sl(i,a,n),Bc(4,a);break;case 1:if(Sl(i,a,n),r=a,i=r.stateNode,typeof i.componentDidMount==`function`)try{i.componentDidMount()}catch(e){Z(r,r.return,e)}if(r=a,i=r.updateQueue,i!==null){var s=r.stateNode;try{var c=i.shared.hiddenCallbacks;if(c!==null)for(i.shared.hiddenCallbacks=null,i=0;i<c.length;i++)Ja(c[i],s)}catch(e){Z(r,r.return,e)}}n&&o&64&&Hc(a),Wc(a,a.return);break;case 27:Qc(a);case 26:case 5:Sl(i,a,n),n&&r===null&&o&4&&Kc(a),Wc(a,a.return);break;case 12:Sl(i,a,n);break;case 31:Sl(i,a,n),n&&o&4&&dl(i,a);break;case 13:Sl(i,a,n),n&&o&4&&fl(i,a);break;case 22:a.memoizedState===null&&Sl(i,a,n),Wc(a,a.return);break;case 30:break;default:Sl(i,a,n)}t=t.sibling}}function Cl(e,t){var n=null;e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(n=e.memoizedState.cachePool.pool),e=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(e=t.memoizedState.cachePool.pool),e!==n&&(e!=null&&e.refCount++,n!=null&&la(n))}function wl(e,t){e=null,t.alternate!==null&&(e=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==e&&(t.refCount++,e!=null&&la(e))}function Tl(e,t,n,r){if(t.subtreeFlags&10256)for(t=t.child;t!==null;)El(e,t,n,r),t=t.sibling}function El(e,t,n,r){var i=t.flags;switch(t.tag){case 0:case 11:case 15:Tl(e,t,n,r),i&2048&&Bc(9,t);break;case 1:Tl(e,t,n,r);break;case 3:Tl(e,t,n,r),i&2048&&(e=null,t.alternate!==null&&(e=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==e&&(t.refCount++,e!=null&&la(e)));break;case 12:if(i&2048){Tl(e,t,n,r),e=t.stateNode;try{var a=t.memoizedProps,o=a.id,s=a.onPostCommit;typeof s==`function`&&s(o,t.alternate===null?`mount`:`update`,e.passiveEffectDuration,-0)}catch(e){Z(t,t.return,e)}}else Tl(e,t,n,r);break;case 31:Tl(e,t,n,r);break;case 13:Tl(e,t,n,r);break;case 23:break;case 22:a=t.stateNode,o=t.alternate,t.memoizedState===null?a._visibility&2?Tl(e,t,n,r):(a._visibility|=2,Dl(e,t,n,r,!!(t.subtreeFlags&10256)||!1)):a._visibility&2?Tl(e,t,n,r):Ol(e,t),i&2048&&Cl(o,t);break;case 24:Tl(e,t,n,r),i&2048&&wl(t.alternate,t);break;default:Tl(e,t,n,r)}}function Dl(e,t,n,r,i){for(i=i&&(!!(t.subtreeFlags&10256)||!1),t=t.child;t!==null;){var a=e,o=t,s=n,c=r,l=o.flags;switch(o.tag){case 0:case 11:case 15:Dl(a,o,s,c,i),Bc(8,o);break;case 23:break;case 22:var u=o.stateNode;o.memoizedState===null?(u._visibility|=2,Dl(a,o,s,c,i)):u._visibility&2?Dl(a,o,s,c,i):Ol(a,o),i&&l&2048&&Cl(o.alternate,o);break;case 24:Dl(a,o,s,c,i),i&&l&2048&&wl(o.alternate,o);break;default:Dl(a,o,s,c,i)}t=t.sibling}}function Ol(e,t){if(t.subtreeFlags&10256)for(t=t.child;t!==null;){var n=e,r=t,i=r.flags;switch(r.tag){case 22:Ol(n,r),i&2048&&Cl(r.alternate,r);break;case 24:Ol(n,r),i&2048&&wl(r.alternate,r);break;default:Ol(n,r)}t=t.sibling}}var kl=8192;function Al(e,t,n){if(e.subtreeFlags&kl)for(e=e.child;e!==null;)jl(e,t,n),e=e.sibling}function jl(e,t,n){switch(e.tag){case 26:Al(e,t,n),e.flags&kl&&e.memoizedState!==null&&Gf(n,gl,e.memoizedState,e.memoizedProps);break;case 5:Al(e,t,n);break;case 3:case 4:var r=gl;gl=gf(e.stateNode.containerInfo),Al(e,t,n),gl=r;break;case 22:e.memoizedState===null&&(r=e.alternate,r!==null&&r.memoizedState!==null?(r=kl,kl=16777216,Al(e,t,n),kl=r):Al(e,t,n));break;default:Al(e,t,n)}}function Ml(e){var t=e.alternate;if(t!==null&&(e=t.child,e!==null)){t.child=null;do t=e.sibling,e.sibling=null,e=t;while(e!==null)}}function Nl(e){var t=e.deletions;if(e.flags&16){if(t!==null)for(var n=0;n<t.length;n++){var r=t[n];rl=r,Il(r,e)}Ml(e)}if(e.subtreeFlags&10256)for(e=e.child;e!==null;)Pl(e),e=e.sibling}function Pl(e){switch(e.tag){case 0:case 11:case 15:Nl(e),e.flags&2048&&Vc(9,e,e.return);break;case 3:Nl(e);break;case 12:Nl(e);break;case 22:var t=e.stateNode;e.memoizedState!==null&&t._visibility&2&&(e.return===null||e.return.tag!==13)?(t._visibility&=-3,Fl(e)):Nl(e);break;default:Nl(e)}}function Fl(e){var t=e.deletions;if(e.flags&16){if(t!==null)for(var n=0;n<t.length;n++){var r=t[n];rl=r,Il(r,e)}Ml(e)}for(e=e.child;e!==null;){switch(t=e,t.tag){case 0:case 11:case 15:Vc(8,t,t.return),Fl(t);break;case 22:n=t.stateNode,n._visibility&2&&(n._visibility&=-3,Fl(t));break;default:Fl(t)}e=e.sibling}}function Il(e,t){for(;rl!==null;){var n=rl;switch(n.tag){case 0:case 11:case 15:Vc(8,n,t);break;case 23:case 22:if(n.memoizedState!==null&&n.memoizedState.cachePool!==null){var r=n.memoizedState.cachePool.pool;r!=null&&r.refCount++}break;case 24:la(n.memoizedState.cache)}if(r=n.child,r!==null)r.return=n,rl=r;else a:for(n=e;rl!==null;){r=rl;var i=r.sibling,a=r.return;if(ol(r),r===n){rl=null;break a}if(i!==null){i.return=a,rl=i;break a}rl=a}}}var Ll={getCacheForType:function(e){var t=L(z),n=t.data.get(e);return n===void 0&&(n=e(),t.data.set(e,n)),n},cacheSignal:function(){return L(z).controller.signal}},Rl=typeof WeakMap==`function`?WeakMap:Map,K=0,q=null,J=null,Y=0,X=0,zl=null,Bl=!1,Vl=!1,Hl=!1,Ul=0,Wl=0,Gl=0,Kl=0,ql=0,Jl=0,Yl=0,Xl=null,Zl=null,Ql=!1,$l=0,eu=0,tu=1/0,nu=null,ru=null,iu=0,au=null,ou=null,su=0,cu=0,lu=null,uu=null,du=0,fu=null;function pu(){return K&2&&Y!==0?Y&-Y:D.T===null?ut():dd()}function mu(){if(Jl===0){if(!(Y&536870912)||I){var e=Ye;Ye<<=1,!(Ye&3932160)&&(Ye=262144),Jl=e}else Jl=536870912}return e=to.current,e!==null&&(e.flags|=32),Jl}function hu(e,t,n){(e===q&&(X===2||X===9)||e.cancelPendingCommit!==null)&&(Su(e,0),yu(e,Y,Jl,!1)),rt(e,n),K&2&&e===q||(e===q&&(!(K&2)&&(Kl|=n),Wl===4&&yu(e,Y,Jl,!1)),rd(e))}function gu(e,t,n){if(K&6)throw Error(i(327));var r=!n&&!(t&127)&&(t&e.expiredLanes)===0||$e(e,t),a=r?Au(e,t):Ou(e,t,!0),o=r;do{if(a===0){Vl&&!r&&yu(e,t,0,!1);break}if(n=e.current.alternate,o&&!vu(n))a=Ou(e,t,!1),o=!1;else{if(a===2){if(o=t,e.errorRecoveryDisabledLanes&o)var s=0;else s=e.pendingLanes&-536870913,s=s===0?s&536870912?536870912:0:s;if(s!==0){t=s;a:{var c=e;a=Xl;var l=c.current.memoizedState.isDehydrated;if(l&&(Su(c,s).flags|=256),s=Ou(c,s,!1),s!==2){if(Hl&&!l){c.errorRecoveryDisabledLanes|=o,Kl|=o,a=4;break a}o=Zl,Zl=a,o!==null&&(Zl===null?Zl=o:Zl.push.apply(Zl,o))}a=s}if(o=!1,a!==2)continue}}if(a===1){Su(e,0),yu(e,t,0,!0);break}a:{switch(r=e,o=a,o){case 0:case 1:throw Error(i(345));case 4:if((t&4194048)!==t)break;case 6:yu(r,t,Jl,!Bl);break a;case 2:Zl=null;break;case 3:case 5:break;default:throw Error(i(329))}if((t&62914560)===t&&(a=$l+300-Me(),10<a)){if(yu(r,t,Jl,!Bl),Qe(r,0,!0)!==0)break a;su=t,r.timeoutHandle=Kd(_u.bind(null,r,n,Zl,nu,Ql,t,Jl,Kl,Yl,Bl,o,`Throttled`,-0,0),a);break a}_u(r,n,Zl,nu,Ql,t,Jl,Kl,Yl,Bl,o,null,-0,0)}break}}while(1);rd(e)}function _u(e,t,n,r,i,a,o,s,c,l,u,d,f,p){if(e.timeoutHandle=-1,d=t.subtreeFlags,d&8192||(d&16785408)==16785408){d={stylesheets:null,count:0,imgCount:0,imgBytes:0,suspenseyImages:[],waitingForImages:!0,waitingForViewTransition:!1,unsuspend:an},jl(t,a,d);var m=(a&62914560)===a?$l-Me():(a&4194048)===a?eu-Me():0;if(m=qf(d,m),m!==null){su=a,e.cancelPendingCommit=m(Lu.bind(null,e,t,a,n,r,i,o,s,c,u,d,null,f,p)),yu(e,a,o,!l);return}}Lu(e,t,a,n,r,i,o,s,c)}function vu(e){for(var t=e;;){var n=t.tag;if((n===0||n===11||n===15)&&t.flags&16384&&(n=t.updateQueue,n!==null&&(n=n.stores,n!==null)))for(var r=0;r<n.length;r++){var i=n[r],a=i.getSnapshot;i=i.value;try{if(!Dr(a(),i))return!1}catch{return!1}}if(n=t.child,t.subtreeFlags&16384&&n!==null)n.return=t,t=n;else{if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return!0;t=t.return}t.sibling.return=t.return,t=t.sibling}}return!0}function yu(e,t,n,r){t&=~ql,t&=~Kl,e.suspendedLanes|=t,e.pingedLanes&=~t,r&&(e.warmLanes|=t),r=e.expirationTimes;for(var i=t;0<i;){var a=31-We(i),o=1<<a;r[a]=-1,i&=~o}n!==0&&at(e,n,t)}function bu(){return K&6?!0:(id(0,!1),!1)}function xu(){if(J!==null){if(X===0)var e=J.return;else e=J,Xi=Yi=null,Do(e),Aa=null,ja=0,e=J;for(;e!==null;)zc(e.alternate,e),e=e.return;J=null}}function Su(e,t){var n=e.timeoutHandle;n!==-1&&(e.timeoutHandle=-1,qd(n)),n=e.cancelPendingCommit,n!==null&&(e.cancelPendingCommit=null,n()),su=0,xu(),q=e,J=n=mi(e.current,null),Y=t,X=0,zl=null,Bl=!1,Vl=$e(e,t),Hl=!1,Yl=Jl=ql=Kl=Gl=Wl=0,Zl=Xl=null,Ql=!1,t&8&&(t|=t&32);var r=e.entangledLanes;if(r!==0)for(e=e.entanglements,r&=t;0<r;){var i=31-We(r),a=1<<i;t|=e[i],r&=~a}return Ul=t,ii(),n}function Cu(e,t){H=null,D.H=Is,t===xa||t===Ca?(t=V(),X=3):t===Sa?(t=V(),X=4):X=t===ec?8:typeof t==`object`&&t&&typeof t.then==`function`?6:1,zl=t,J===null&&(Wl=1,Js(e,Si(t,e.current)))}function wu(){var e=to.current;return e===null?!0:(Y&4194048)===Y?no===null:(Y&62914560)===Y||Y&536870912?e===no:!1}function Tu(){var e=D.H;return D.H=Is,e===null?Is:e}function Eu(){var e=D.A;return D.A=Ll,e}function Du(){Wl=4,Bl||(Y&4194048)!==Y&&to.current!==null||(Vl=!0),!(Gl&134217727)&&!(Kl&134217727)||q===null||yu(q,Y,Jl,!1)}function Ou(e,t,n){var r=K;K|=2;var i=Tu(),a=Eu();(q!==e||Y!==t)&&(nu=null,Su(e,t)),t=!1;var o=Wl;a:do try{if(X!==0&&J!==null){var s=J,c=zl;switch(X){case 8:xu(),o=6;break a;case 3:case 2:case 9:case 6:to.current===null&&(t=!0);var l=X;if(X=0,zl=null,Pu(e,s,c,l),n&&Vl){o=0;break a}break;default:l=X,X=0,zl=null,Pu(e,s,c,l)}}ku(),o=Wl;break}catch(t){Cu(e,t)}while(1);return t&&e.shellSuspendCounter++,Xi=Yi=null,K=r,D.H=i,D.A=a,J===null&&(q=null,Y=0,ii()),o}function ku(){for(;J!==null;)Mu(J)}function Au(e,t){var n=K;K|=2;var r=Tu(),a=Eu();q!==e||Y!==t?(nu=null,tu=Me()+500,Su(e,t)):Vl=$e(e,t);a:do try{if(X!==0&&J!==null){t=J;var o=zl;b:switch(X){case 1:X=0,zl=null,Pu(e,t,o,1);break;case 2:case 9:if(Ta(o)){X=0,zl=null,Nu(t);break}t=function(){X!==2&&X!==9||q!==e||(X=7),rd(e)},o.then(t,t);break a;case 3:X=7;break a;case 4:X=5;break a;case 7:Ta(o)?(X=0,zl=null,Nu(t)):(X=0,zl=null,Pu(e,t,o,7));break;case 5:var s=null;switch(J.tag){case 26:s=J.memoizedState;case 5:case 27:var c=J;if(s?Wf(s):c.stateNode.complete){X=0,zl=null;var l=c.sibling;if(l!==null)J=l;else{var u=c.return;u===null?J=null:(J=u,Fu(u))}break b}}X=0,zl=null,Pu(e,t,o,5);break;case 6:X=0,zl=null,Pu(e,t,o,6);break;case 8:xu(),Wl=6;break a;default:throw Error(i(462))}}ju();break}catch(t){Cu(e,t)}while(1);return Xi=Yi=null,D.H=r,D.A=a,K=n,J===null?(q=null,Y=0,ii(),Wl):0}function ju(){for(;J!==null&&!Ae();)Mu(J)}function Mu(e){var t=Ac(e.alternate,e,Ul);e.memoizedProps=e.pendingProps,t===null?Fu(e):J=t}function Nu(e){var t=e,n=t.alternate;switch(t.tag){case 15:case 0:t=mc(n,t,t.pendingProps,t.type,void 0,Y);break;case 11:t=mc(n,t,t.pendingProps,t.type.render,t.ref,Y);break;case 5:Do(t);default:zc(n,t),t=J=hi(t,Ul),t=Ac(n,t,Ul)}e.memoizedProps=e.pendingProps,t===null?Fu(e):J=t}function Pu(e,t,n,r){Xi=Yi=null,Do(t),Aa=null,ja=0;var i=t.return;try{if($s(e,i,t,n,Y)){Wl=1,Js(e,Si(n,e.current)),J=null;return}}catch(t){if(i!==null)throw J=i,t;Wl=1,Js(e,Si(n,e.current)),J=null;return}t.flags&32768?(I||r===1?e=!0:Vl||Y&536870912?e=!1:(Bl=e=!0,(r===2||r===9||r===3||r===6)&&(r=to.current,r!==null&&r.tag===13&&(r.flags|=16384))),Iu(t,e)):Fu(t)}function Fu(e){var t=e;do{if(t.flags&32768){Iu(t,Bl);return}e=t.return;var n=Lc(t.alternate,t,Ul);if(n!==null){J=n;return}if(t=t.sibling,t!==null){J=t;return}J=t=e}while(t!==null);Wl===0&&(Wl=5)}function Iu(e,t){do{var n=Rc(e.alternate,e);if(n!==null){n.flags&=32767,J=n;return}if(n=e.return,n!==null&&(n.flags|=32768,n.subtreeFlags=0,n.deletions=null),!t&&(e=e.sibling,e!==null)){J=e;return}J=e=n}while(e!==null);Wl=6,J=null}function Lu(e,t,n,r,a,o,s,c,l){e.cancelPendingCommit=null;do Hu();while(iu!==0);if(K&6)throw Error(i(327));if(t!==null){if(t===e.current)throw Error(i(177));if(o=t.lanes|t.childLanes,o|=ri,it(e,n,o,s,c,l),e===q&&(J=q=null,Y=0),ou=t,au=e,su=n,cu=o,lu=a,uu=r,t.subtreeFlags&10256||t.flags&10256?(e.callbackNode=null,e.callbackPriority=0,Xu(Ie,function(){return Uu(),null})):(e.callbackNode=null,e.callbackPriority=0),r=!!(t.flags&13878),t.subtreeFlags&13878||r){r=D.T,D.T=null,a=O.p,O.p=2,s=K,K|=4;try{il(e,t,n)}finally{K=s,O.p=a,D.T=r}}iu=1,Ru(),zu(),Bu()}}function Ru(){if(iu===1){iu=0;var e=au,t=ou,n=!!(t.flags&13878);if(t.subtreeFlags&13878||n){n=D.T,D.T=null;var r=O.p;O.p=2;var i=K;K|=4;try{_l(t,e);var a=zd,o=Mr(e.containerInfo),s=a.focusedElem,c=a.selectionRange;if(o!==s&&s&&s.ownerDocument&&jr(s.ownerDocument.documentElement,s)){if(c!==null&&Nr(s)){var l=c.start,u=c.end;if(u===void 0&&(u=l),`selectionStart`in s)s.selectionStart=l,s.selectionEnd=Math.min(u,s.value.length);else{var d=s.ownerDocument||document,f=d&&d.defaultView||window;if(f.getSelection){var p=f.getSelection(),m=s.textContent.length,h=Math.min(c.start,m),g=c.end===void 0?h:Math.min(c.end,m);!p.extend&&h>g&&(o=g,g=h,h=o);var _=Ar(s,h),v=Ar(s,g);if(_&&v&&(p.rangeCount!==1||p.anchorNode!==_.node||p.anchorOffset!==_.offset||p.focusNode!==v.node||p.focusOffset!==v.offset)){var y=d.createRange();y.setStart(_.node,_.offset),p.removeAllRanges(),h>g?(p.addRange(y),p.extend(v.node,v.offset)):(y.setEnd(v.node,v.offset),p.addRange(y))}}}}for(d=[],p=s;p=p.parentNode;)p.nodeType===1&&d.push({element:p,left:p.scrollLeft,top:p.scrollTop});for(typeof s.focus==`function`&&s.focus(),s=0;s<d.length;s++){var b=d[s];b.element.scrollLeft=b.left,b.element.scrollTop=b.top}}sp=!!Rd,zd=Rd=null}finally{K=i,O.p=r,D.T=n}}e.current=t,iu=2}}function zu(){if(iu===2){iu=0;var e=au,t=ou,n=!!(t.flags&8772);if(t.subtreeFlags&8772||n){n=D.T,D.T=null;var r=O.p;O.p=2;var i=K;K|=4;try{al(e,t.alternate,t)}finally{K=i,O.p=r,D.T=n}}iu=3}}function Bu(){if(iu===4||iu===3){iu=0,je();var e=au,t=ou,n=su,r=uu;t.subtreeFlags&10256||t.flags&10256?iu=5:(iu=0,ou=au=null,Vu(e,e.pendingLanes));var i=e.pendingLanes;if(i===0&&(ru=null),lt(n),t=t.stateNode,He&&typeof He.onCommitFiberRoot==`function`)try{He.onCommitFiberRoot(Ve,t,void 0,(t.current.flags&128)==128)}catch{}if(r!==null){t=D.T,i=O.p,O.p=2,D.T=null;try{for(var a=e.onRecoverableError,o=0;o<r.length;o++){var s=r[o];a(s.value,{componentStack:s.stack})}}finally{D.T=t,O.p=i}}su&3&&Hu(),rd(e),i=e.pendingLanes,n&261930&&i&42?e===fu?du++:(du=0,fu=e):du=0,id(0,!1)}}function Vu(e,t){(e.pooledCacheLanes&=t)===0&&(t=e.pooledCache,t!=null&&(e.pooledCache=null,la(t)))}function Hu(){return Ru(),zu(),Bu(),Uu()}function Uu(){if(iu!==5)return!1;var e=au,t=cu;cu=0;var n=lt(su),r=D.T,a=O.p;try{O.p=32>n?32:n,D.T=null,n=lu,lu=null;var o=au,s=su;if(iu=0,ou=au=null,su=0,K&6)throw Error(i(331));var c=K;if(K|=4,Pl(o.current),El(o,o.current,s,n),K=c,id(0,!1),He&&typeof He.onPostCommitFiberRoot==`function`)try{He.onPostCommitFiberRoot(Ve,o)}catch{}return!0}finally{O.p=a,D.T=r,Vu(e,t)}}function Wu(e,t,n){t=Si(n,t),t=Xs(e.stateNode,t,2),e=Ha(e,t,2),e!==null&&(rt(e,2),rd(e))}function Z(e,t,n){if(e.tag===3)Wu(e,e,n);else for(;t!==null;){if(t.tag===3){Wu(t,e,n);break}if(t.tag===1){var r=t.stateNode;if(typeof t.type.getDerivedStateFromError==`function`||typeof r.componentDidCatch==`function`&&(ru===null||!ru.has(r))){e=Si(n,e),n=Zs(2),r=Ha(t,n,2),r!==null&&(Qs(n,r,t,e),rt(r,2),rd(r));break}}t=t.return}}function Gu(e,t,n){var r=e.pingCache;if(r===null){r=e.pingCache=new Rl;var i=new Set;r.set(t,i)}else i=r.get(t),i===void 0&&(i=new Set,r.set(t,i));i.has(n)||(Hl=!0,i.add(n),e=Ku.bind(null,e,t,n),t.then(e,e))}function Ku(e,t,n){var r=e.pingCache;r!==null&&r.delete(t),e.pingedLanes|=e.suspendedLanes&n,e.warmLanes&=~n,q===e&&(Y&n)===n&&(Wl===4||Wl===3&&(Y&62914560)===Y&&300>Me()-$l?!(K&2)&&Su(e,0):ql|=n,Yl===Y&&(Yl=0)),rd(e)}function qu(e,t){t===0&&(t=tt()),e=si(e,t),e!==null&&(rt(e,t),rd(e))}function Ju(e){var t=e.memoizedState,n=0;t!==null&&(n=t.retryLane),qu(e,n)}function Yu(e,t){var n=0;switch(e.tag){case 31:case 13:var r=e.stateNode,a=e.memoizedState;a!==null&&(n=a.retryLane);break;case 19:r=e.stateNode;break;case 22:r=e.stateNode._retryCache;break;default:throw Error(i(314))}r!==null&&r.delete(t),qu(e,n)}function Xu(e,t){return Oe(e,t)}var Zu=null,Qu=null,$u=!1,ed=!1,td=!1,nd=0;function rd(e){e!==Qu&&e.next===null&&(Qu===null?Zu=Qu=e:Qu=Qu.next=e),ed=!0,$u||($u=!0,ud())}function id(e,t){if(!td&&ed){td=!0;do for(var n=!1,r=Zu;r!==null;){if(!t){if(e!==0){var i=r.pendingLanes;if(i===0)var a=0;else{var o=r.suspendedLanes,s=r.pingedLanes;a=(1<<31-We(42|e)+1)-1,a&=i&~(o&~s),a=a&201326741?a&201326741|1:a?a|2:0}a!==0&&(n=!0,ld(r,a))}else a=Y,a=Qe(r,r===q?a:0,r.cancelPendingCommit!==null||r.timeoutHandle!==-1),!(a&3)||$e(r,a)||(n=!0,ld(r,a))}r=r.next}while(n);td=!1}}function ad(){od()}function od(){ed=$u=!1;var e=0;nd!==0&&Gd()&&(e=nd);for(var t=Me(),n=null,r=Zu;r!==null;){var i=r.next,a=sd(r,t);a===0?(r.next=null,n===null?Zu=i:n.next=i,i===null&&(Qu=n)):(n=r,(e!==0||a&3)&&(ed=!0)),r=i}iu!==0&&iu!==5||id(e,!1),nd!==0&&(nd=0)}function sd(e,t){for(var n=e.suspendedLanes,r=e.pingedLanes,i=e.expirationTimes,a=e.pendingLanes&-62914561;0<a;){var o=31-We(a),s=1<<o,c=i[o];c===-1?((s&n)===0||(s&r)!==0)&&(i[o]=et(s,t)):c<=t&&(e.expiredLanes|=s),a&=~s}if(t=q,n=Y,n=Qe(e,e===t?n:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),r=e.callbackNode,n===0||e===t&&(X===2||X===9)||e.cancelPendingCommit!==null)return r!==null&&r!==null&&ke(r),e.callbackNode=null,e.callbackPriority=0;if(!(n&3)||$e(e,n)){if(t=n&-n,t===e.callbackPriority)return t;switch(r!==null&&ke(r),lt(n)){case 2:case 8:n=Fe;break;case 32:n=Ie;break;case 268435456:n=Re;break;default:n=Ie}return r=cd.bind(null,e),n=Oe(n,r),e.callbackPriority=t,e.callbackNode=n,t}return r!==null&&r!==null&&ke(r),e.callbackPriority=2,e.callbackNode=null,2}function cd(e,t){if(iu!==0&&iu!==5)return e.callbackNode=null,e.callbackPriority=0,null;var n=e.callbackNode;if(Hu()&&e.callbackNode!==n)return null;var r=Y;return r=Qe(e,e===q?r:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),r===0?null:(gu(e,r,t),sd(e,Me()),e.callbackNode!=null&&e.callbackNode===n?cd.bind(null,e):null)}function ld(e,t){if(Hu())return null;gu(e,t,!0)}function ud(){Yd(function(){K&6?Oe(Pe,ad):od()})}function dd(){if(nd===0){var e=da;e===0&&(e=Je,Je<<=1,!(Je&261888)&&(Je=256)),nd=e}return nd}function fd(e){return e==null||typeof e==`symbol`||typeof e==`boolean`?null:typeof e==`function`?e:rn(``+e)}function pd(e,t){var n=t.ownerDocument.createElement(`input`);return n.name=t.name,n.value=t.value,e.id&&n.setAttribute(`form`,e.id),t.parentNode.insertBefore(n,t),e=new FormData(e),n.parentNode.removeChild(n),e}function md(e,t,n,r,i){if(t===`submit`&&n&&n.stateNode===i){var a=fd((i[N]||null).action),o=r.submitter;o&&(t=(t=o[N]||null)?fd(t.formAction):o.getAttribute(`formAction`),t!==null&&(a=t,o=null));var s=new En(`action`,`action`,null,r,i);e.push({event:s,listeners:[{instance:null,listener:function(){if(r.defaultPrevented){if(nd!==0){var e=o?pd(i,o):new FormData(i);Ss(n,{pending:!0,data:e,method:i.method,action:a},null,e)}}else typeof a==`function`&&(s.preventDefault(),e=o?pd(i,o):new FormData(i),Ss(n,{pending:!0,data:e,method:i.method,action:a},a,e))},currentTarget:i}]})}}for(var hd=0;hd<Qr.length;hd++){var gd=Qr[hd];$r(gd.toLowerCase(),`on`+(gd[0].toUpperCase()+gd.slice(1)))}$r(Gr,`onAnimationEnd`),$r(Kr,`onAnimationIteration`),$r(P,`onAnimationStart`),$r(`dblclick`,`onDoubleClick`),$r(`focusin`,`onFocus`),$r(`focusout`,`onBlur`),$r(qr,`onTransitionRun`),$r(Jr,`onTransitionStart`),$r(Yr,`onTransitionCancel`),$r(Xr,`onTransitionEnd`),Ot(`onMouseEnter`,[`mouseout`,`mouseover`]),Ot(`onMouseLeave`,[`mouseout`,`mouseover`]),Ot(`onPointerEnter`,[`pointerout`,`pointerover`]),Ot(`onPointerLeave`,[`pointerout`,`pointerover`]),Dt(`onChange`,`change click focusin focusout input keydown keyup selectionchange`.split(` `)),Dt(`onSelect`,`focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange`.split(` `)),Dt(`onBeforeInput`,[`compositionend`,`keypress`,`textInput`,`paste`]),Dt(`onCompositionEnd`,`compositionend focusout keydown keypress keyup mousedown`.split(` `)),Dt(`onCompositionStart`,`compositionstart focusout keydown keypress keyup mousedown`.split(` `)),Dt(`onCompositionUpdate`,`compositionupdate focusout keydown keypress keyup mousedown`.split(` `));var _d=`abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting`.split(` `),vd=new Set(`beforetoggle cancel close invalid load scroll scrollend toggle`.split(` `).concat(_d));function yd(e,t){t=!!(t&4);for(var n=0;n<e.length;n++){var r=e[n],i=r.event;r=r.listeners;a:{var a=void 0;if(t)for(var o=r.length-1;0<=o;o--){var s=r[o],c=s.instance,l=s.currentTarget;if(s=s.listener,c!==a&&i.isPropagationStopped())break a;a=s,i.currentTarget=l;try{a(i)}catch(e){ei(e)}i.currentTarget=null,a=c}else for(o=0;o<r.length;o++){if(s=r[o],c=s.instance,l=s.currentTarget,s=s.listener,c!==a&&i.isPropagationStopped())break a;a=s,i.currentTarget=l;try{a(i)}catch(e){ei(e)}i.currentTarget=null,a=c}}}}function Q(e,t){var n=t[mt];n===void 0&&(n=t[mt]=new Set);var r=e+`__bubble`;n.has(r)||(Cd(t,e,2,!1),n.add(r))}function bd(e,t,n){var r=0;t&&(r|=4),Cd(n,e,r,t)}var xd=`_reactListening`+Math.random().toString(36).slice(2);function Sd(e){if(!e[xd]){e[xd]=!0,Tt.forEach(function(t){t!==`selectionchange`&&(vd.has(t)||bd(t,!1,e),bd(t,!0,e))});var t=e.nodeType===9?e:e.ownerDocument;t===null||t[xd]||(t[xd]=!0,bd(`selectionchange`,!1,t))}}function Cd(e,t,n,r){switch(mp(t)){case 2:var i=cp;break;case 8:i=lp;break;default:i=up}n=i.bind(null,t,n,e),i=void 0,!hn||t!==`touchstart`&&t!==`touchmove`&&t!==`wheel`||(i=!0),r?i===void 0?e.addEventListener(t,n,!0):e.addEventListener(t,n,{capture:!0,passive:i}):i===void 0?e.addEventListener(t,n,!1):e.addEventListener(t,n,{passive:i})}function wd(e,t,n,r,i){var a=r;if(!(t&1)&&!(t&2)&&r!==null)a:for(;;){if(r===null)return;var s=r.tag;if(s===3||s===4){var c=r.stateNode.containerInfo;if(c===i)break;if(s===4)for(s=r.return;s!==null;){var l=s.tag;if((l===3||l===4)&&s.stateNode.containerInfo===i)return;s=s.return}for(;c!==null;){if(s=bt(c),s===null)return;if(l=s.tag,l===5||l===6||l===26||l===27){r=a=s;continue a}c=c.parentNode}}r=r.return}fn(function(){var r=a,i=sn(n),s=[];a:{var c=Zr.get(e);if(c!==void 0){var l=En,u=e;switch(e){case`keypress`:if(xn(n)===0)break a;case`keydown`:case`keyup`:l=Wn;break;case`focusin`:u=`focus`,l=Fn;break;case`focusout`:u=`blur`,l=Fn;break;case`beforeblur`:case`afterblur`:l=Fn;break;case`click`:if(n.button===2)break a;case`auxclick`:case`dblclick`:case`mousedown`:case`mousemove`:case`mouseup`:case`mouseout`:case`mouseover`:case`contextmenu`:l=Nn;break;case`drag`:case`dragend`:case`dragenter`:case`dragexit`:case`dragleave`:case`dragover`:case`dragstart`:case`drop`:l=Pn;break;case`touchcancel`:case`touchend`:case`touchmove`:case`touchstart`:l=Kn;break;case Gr:case Kr:case P:l=In;break;case Xr:l=qn;break;case`scroll`:case`scrollend`:l=On;break;case`wheel`:l=Jn;break;case`copy`:case`cut`:case`paste`:l=Ln;break;case`gotpointercapture`:case`lostpointercapture`:case`pointercancel`:case`pointerdown`:case`pointermove`:case`pointerout`:case`pointerover`:case`pointerup`:l=Gn;break;case`toggle`:case`beforetoggle`:l=Yn}var d=!!(t&4),f=!d&&(e===`scroll`||e===`scrollend`),p=d?c===null?null:c+`Capture`:c;d=[];for(var m=r,h;m!==null;){var g=m;if(h=g.stateNode,g=g.tag,g!==5&&g!==26&&g!==27||h===null||p===null||(g=pn(m,p),g!=null&&d.push(Td(m,g,h))),f)break;m=m.return}0<d.length&&(c=new l(c,u,null,n,i),s.push({event:c,listeners:d}))}}if(!(t&7)){a:{if(c=e===`mouseover`||e===`pointerover`,l=e===`mouseout`||e===`pointerout`,c&&n!==on&&(u=n.relatedTarget||n.fromElement)&&(bt(u)||u[pt]))break a;if((l||c)&&(c=i.window===i?i:(c=i.ownerDocument)?c.defaultView||c.parentWindow:window,l?(u=n.relatedTarget||n.toElement,l=r,u=u?bt(u):null,u!==null&&(f=o(u),d=u.tag,u!==f||d!==5&&d!==27&&d!==6)&&(u=null)):(l=null,u=r),l!==u)){if(d=Nn,g=`onMouseLeave`,p=`onMouseEnter`,m=`mouse`,(e===`pointerout`||e===`pointerover`)&&(d=Gn,g=`onPointerLeave`,p=`onPointerEnter`,m=`pointer`),f=l==null?c:St(l),h=u==null?c:St(u),c=new d(g,m+`leave`,l,n,i),c.target=f,c.relatedTarget=h,g=null,bt(i)===r&&(d=new d(p,m+`enter`,u,n,i),d.target=h,d.relatedTarget=f,g=d),f=g,l&&u)b:{for(d=Dd,p=l,m=u,h=0,g=p;g;g=d(g))h++;g=0;for(var _=m;_;_=d(_))g++;for(;0<h-g;)p=d(p),h--;for(;0<g-h;)m=d(m),g--;for(;h--;){if(p===m||m!==null&&p===m.alternate){d=p;break b}p=d(p),m=d(m)}d=null}else d=null;l!==null&&Od(s,c,l,d,!1),u!==null&&f!==null&&Od(s,f,u,d,!0)}}a:{if(c=r?St(r):window,l=c.nodeName&&c.nodeName.toLowerCase(),l===`select`||l===`input`&&c.type===`file`)var v=hr;else if(lr(c)){if(gr)v=Tr;else{v=Cr;var y=Sr}}else l=c.nodeName,!l||l.toLowerCase()!==`input`||c.type!==`checkbox`&&c.type!==`radio`?r&&en(r.elementType)&&(v=hr):v=wr;if(v&&(v=v(e,r))){ur(s,v,n,i);break a}y&&y(e,c,r),e===`focusout`&&r&&c.type===`number`&&r.memoizedProps.value!=null&&Kt(c,`number`,c.value)}switch(y=r?St(r):window,e){case`focusin`:(lr(y)||y.contentEditable===`true`)&&(Fr=y,Ir=r,Lr=null);break;case`focusout`:Lr=Ir=Fr=null;break;case`mousedown`:Rr=!0;break;case`contextmenu`:case`mouseup`:case`dragend`:Rr=!1,zr(s,n,i);break;case`selectionchange`:if(Pr)break;case`keydown`:case`keyup`:zr(s,n,i)}var b;if(Zn)b:{switch(e){case`compositionstart`:var x=`onCompositionStart`;break b;case`compositionend`:x=`onCompositionEnd`;break b;case`compositionupdate`:x=`onCompositionUpdate`;break b}x=void 0}else ar?rr(e,n)&&(x=`onCompositionEnd`):e===`keydown`&&n.keyCode===229&&(x=`onCompositionStart`);x&&(er&&n.locale!==`ko`&&(ar||x!==`onCompositionStart`?x===`onCompositionEnd`&&ar&&(b=bn()):(_n=i,vn=`value`in _n?_n.value:_n.textContent,ar=!0)),y=Ed(r,x),0<y.length&&(x=new Rn(x,e,null,n,i),s.push({event:x,listeners:y}),b?x.data=b:(b=ir(n),b!==null&&(x.data=b)))),(b=$n?or(e,n):sr(e,n))&&(x=Ed(r,`onBeforeInput`),0<x.length&&(y=new Rn(`onBeforeInput`,`beforeinput`,null,n,i),s.push({event:y,listeners:x}),y.data=b)),md(s,e,r,n,i)}yd(s,t)})}function Td(e,t,n){return{instance:e,listener:t,currentTarget:n}}function Ed(e,t){for(var n=t+`Capture`,r=[];e!==null;){var i=e,a=i.stateNode;if(i=i.tag,i!==5&&i!==26&&i!==27||a===null||(i=pn(e,n),i!=null&&r.unshift(Td(e,i,a)),i=pn(e,t),i!=null&&r.push(Td(e,i,a))),e.tag===3)return r;e=e.return}return[]}function Dd(e){if(e===null)return null;do e=e.return;while(e&&e.tag!==5&&e.tag!==27);return e||null}function Od(e,t,n,r,i){for(var a=t._reactName,o=[];n!==null&&n!==r;){var s=n,c=s.alternate,l=s.stateNode;if(s=s.tag,c!==null&&c===r)break;s!==5&&s!==26&&s!==27||l===null||(c=l,i?(l=pn(n,a),l!=null&&o.unshift(Td(n,l,c))):i||(l=pn(n,a),l!=null&&o.push(Td(n,l,c)))),n=n.return}o.length!==0&&e.push({event:t,listeners:o})}var kd=/\r\n?/g,Ad=/\u0000|\uFFFD/g;function jd(e){return(typeof e==`string`?e:``+e).replace(kd,`
`).replace(Ad,``)}function Md(e,t){return t=jd(t),jd(e)===t}function $(e,t,n,r,a,o){switch(n){case`children`:typeof r==`string`?t===`body`||t===`textarea`&&r===``||Xt(e,r):(typeof r==`number`||typeof r==`bigint`)&&t!==`body`&&Xt(e,``+r);break;case`className`:Pt(e,`class`,r);break;case`tabIndex`:Pt(e,`tabindex`,r);break;case`dir`:case`role`:case`viewBox`:case`width`:case`height`:Pt(e,n,r);break;case`style`:$t(e,r,o);break;case`data`:if(t!==`object`){Pt(e,`data`,r);break}case`src`:case`href`:if(r===``&&(t!==`a`||n!==`href`)||r==null||typeof r==`function`||typeof r==`symbol`||typeof r==`boolean`){e.removeAttribute(n);break}r=rn(``+r),e.setAttribute(n,r);break;case`action`:case`formAction`:if(typeof r==`function`){e.setAttribute(n,`javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')`);break}if(typeof o==`function`&&(n===`formAction`?(t!==`input`&&$(e,t,`name`,a.name,a,null),$(e,t,`formEncType`,a.formEncType,a,null),$(e,t,`formMethod`,a.formMethod,a,null),$(e,t,`formTarget`,a.formTarget,a,null)):($(e,t,`encType`,a.encType,a,null),$(e,t,`method`,a.method,a,null),$(e,t,`target`,a.target,a,null))),r==null||typeof r==`symbol`||typeof r==`boolean`){e.removeAttribute(n);break}r=rn(``+r),e.setAttribute(n,r);break;case`onClick`:r!=null&&(e.onclick=an);break;case`onScroll`:r!=null&&Q(`scroll`,e);break;case`onScrollEnd`:r!=null&&Q(`scrollend`,e);break;case`dangerouslySetInnerHTML`:if(r!=null){if(typeof r!=`object`||!(`__html`in r))throw Error(i(61));if(n=r.__html,n!=null){if(a.children!=null)throw Error(i(60));e.innerHTML=n}}break;case`multiple`:e.multiple=r&&typeof r!=`function`&&typeof r!=`symbol`;break;case`muted`:e.muted=r&&typeof r!=`function`&&typeof r!=`symbol`;break;case`suppressContentEditableWarning`:case`suppressHydrationWarning`:case`defaultValue`:case`defaultChecked`:case`innerHTML`:case`ref`:break;case`autoFocus`:break;case`xlinkHref`:if(r==null||typeof r==`function`||typeof r==`boolean`||typeof r==`symbol`){e.removeAttribute(`xlink:href`);break}n=rn(``+r),e.setAttributeNS(`http://www.w3.org/1999/xlink`,`xlink:href`,n);break;case`contentEditable`:case`spellCheck`:case`draggable`:case`value`:case`autoReverse`:case`externalResourcesRequired`:case`focusable`:case`preserveAlpha`:r!=null&&typeof r!=`function`&&typeof r!=`symbol`?e.setAttribute(n,``+r):e.removeAttribute(n);break;case`inert`:case`allowFullScreen`:case`async`:case`autoPlay`:case`controls`:case`default`:case`defer`:case`disabled`:case`disablePictureInPicture`:case`disableRemotePlayback`:case`formNoValidate`:case`hidden`:case`loop`:case`noModule`:case`noValidate`:case`open`:case`playsInline`:case`readOnly`:case`required`:case`reversed`:case`scoped`:case`seamless`:case`itemScope`:r&&typeof r!=`function`&&typeof r!=`symbol`?e.setAttribute(n,``):e.removeAttribute(n);break;case`capture`:case`download`:!0===r?e.setAttribute(n,``):!1!==r&&r!=null&&typeof r!=`function`&&typeof r!=`symbol`?e.setAttribute(n,r):e.removeAttribute(n);break;case`cols`:case`rows`:case`size`:case`span`:r!=null&&typeof r!=`function`&&typeof r!=`symbol`&&!isNaN(r)&&1<=r?e.setAttribute(n,r):e.removeAttribute(n);break;case`rowSpan`:case`start`:r==null||typeof r==`function`||typeof r==`symbol`||isNaN(r)?e.removeAttribute(n):e.setAttribute(n,r);break;case`popover`:Q(`beforetoggle`,e),Q(`toggle`,e),Nt(e,`popover`,r);break;case`xlinkActuate`:Ft(e,`http://www.w3.org/1999/xlink`,`xlink:actuate`,r);break;case`xlinkArcrole`:Ft(e,`http://www.w3.org/1999/xlink`,`xlink:arcrole`,r);break;case`xlinkRole`:Ft(e,`http://www.w3.org/1999/xlink`,`xlink:role`,r);break;case`xlinkShow`:Ft(e,`http://www.w3.org/1999/xlink`,`xlink:show`,r);break;case`xlinkTitle`:Ft(e,`http://www.w3.org/1999/xlink`,`xlink:title`,r);break;case`xlinkType`:Ft(e,`http://www.w3.org/1999/xlink`,`xlink:type`,r);break;case`xmlBase`:Ft(e,`http://www.w3.org/XML/1998/namespace`,`xml:base`,r);break;case`xmlLang`:Ft(e,`http://www.w3.org/XML/1998/namespace`,`xml:lang`,r);break;case`xmlSpace`:Ft(e,`http://www.w3.org/XML/1998/namespace`,`xml:space`,r);break;case`is`:Nt(e,`is`,r);break;case`innerText`:case`textContent`:break;default:(!(2<n.length)||n[0]!==`o`&&n[0]!==`O`||n[1]!==`n`&&n[1]!==`N`)&&(n=tn.get(n)||n,Nt(e,n,r))}}function Nd(e,t,n,r,a,o){switch(n){case`style`:$t(e,r,o);break;case`dangerouslySetInnerHTML`:if(r!=null){if(typeof r!=`object`||!(`__html`in r))throw Error(i(61));if(n=r.__html,n!=null){if(a.children!=null)throw Error(i(60));e.innerHTML=n}}break;case`children`:typeof r==`string`?Xt(e,r):(typeof r==`number`||typeof r==`bigint`)&&Xt(e,``+r);break;case`onScroll`:r!=null&&Q(`scroll`,e);break;case`onScrollEnd`:r!=null&&Q(`scrollend`,e);break;case`onClick`:r!=null&&(e.onclick=an);break;case`suppressContentEditableWarning`:case`suppressHydrationWarning`:case`innerHTML`:case`ref`:break;case`innerText`:case`textContent`:break;default:if(!Et.hasOwnProperty(n))a:{if(n[0]===`o`&&n[1]===`n`&&(a=n.endsWith(`Capture`),t=n.slice(2,a?n.length-7:void 0),o=e[N]||null,o=o==null?null:o[n],typeof o==`function`&&e.removeEventListener(t,o,a),typeof r==`function`)){typeof o!=`function`&&o!==null&&(n in e?e[n]=null:e.hasAttribute(n)&&e.removeAttribute(n)),e.addEventListener(t,r,a);break a}n in e?e[n]=r:!0===r?e.setAttribute(n,``):Nt(e,n,r)}}}function Pd(e,t,n){switch(t){case`div`:case`span`:case`svg`:case`path`:case`a`:case`g`:case`p`:case`li`:break;case`img`:Q(`error`,e),Q(`load`,e);var r=!1,a=!1,o;for(o in n)if(n.hasOwnProperty(o)){var s=n[o];if(s!=null)switch(o){case`src`:r=!0;break;case`srcSet`:a=!0;break;case`children`:case`dangerouslySetInnerHTML`:throw Error(i(137,t));default:$(e,t,o,s,n,null)}}a&&$(e,t,`srcSet`,n.srcSet,n,null),r&&$(e,t,`src`,n.src,n,null);return;case`input`:Q(`invalid`,e);var c=o=s=a=null,l=null,u=null;for(r in n)if(n.hasOwnProperty(r)){var d=n[r];if(d!=null)switch(r){case`name`:a=d;break;case`type`:s=d;break;case`checked`:l=d;break;case`defaultChecked`:u=d;break;case`value`:o=d;break;case`defaultValue`:c=d;break;case`children`:case`dangerouslySetInnerHTML`:if(d!=null)throw Error(i(137,t));break;default:$(e,t,r,d,n,null)}}Gt(e,o,c,l,u,s,a,!1);return;case`select`:for(a in Q(`invalid`,e),r=s=o=null,n)if(n.hasOwnProperty(a)&&(c=n[a],c!=null))switch(a){case`value`:o=c;break;case`defaultValue`:s=c;break;case`multiple`:r=c;default:$(e,t,a,c,n,null)}t=o,n=s,e.multiple=!!r,t==null?n!=null&&qt(e,!!r,n,!0):qt(e,!!r,t,!1);return;case`textarea`:for(s in Q(`invalid`,e),o=a=r=null,n)if(n.hasOwnProperty(s)&&(c=n[s],c!=null))switch(s){case`value`:r=c;break;case`defaultValue`:a=c;break;case`children`:o=c;break;case`dangerouslySetInnerHTML`:if(c!=null)throw Error(i(91));break;default:$(e,t,s,c,n,null)}Yt(e,r,a,o);return;case`option`:for(l in n)if(n.hasOwnProperty(l)&&(r=n[l],r!=null))switch(l){case`selected`:e.selected=r&&typeof r!=`function`&&typeof r!=`symbol`;break;default:$(e,t,l,r,n,null)}return;case`dialog`:Q(`beforetoggle`,e),Q(`toggle`,e),Q(`cancel`,e),Q(`close`,e);break;case`iframe`:case`object`:Q(`load`,e);break;case`video`:case`audio`:for(r=0;r<_d.length;r++)Q(_d[r],e);break;case`image`:Q(`error`,e),Q(`load`,e);break;case`details`:Q(`toggle`,e);break;case`embed`:case`source`:case`link`:Q(`error`,e),Q(`load`,e);case`area`:case`base`:case`br`:case`col`:case`hr`:case`keygen`:case`meta`:case`param`:case`track`:case`wbr`:case`menuitem`:for(u in n)if(n.hasOwnProperty(u)&&(r=n[u],r!=null))switch(u){case`children`:case`dangerouslySetInnerHTML`:throw Error(i(137,t));default:$(e,t,u,r,n,null)}return;default:if(en(t)){for(d in n)n.hasOwnProperty(d)&&(r=n[d],r!==void 0&&Nd(e,t,d,r,n,void 0));return}}for(c in n)n.hasOwnProperty(c)&&(r=n[c],r!=null&&$(e,t,c,r,n,null))}function Fd(e,t,n,r){switch(t){case`div`:case`span`:case`svg`:case`path`:case`a`:case`g`:case`p`:case`li`:break;case`input`:var a=null,o=null,s=null,c=null,l=null,u=null,d=null;for(m in n){var f=n[m];if(n.hasOwnProperty(m)&&f!=null)switch(m){case`checked`:break;case`value`:break;case`defaultValue`:l=f;default:r.hasOwnProperty(m)||$(e,t,m,null,r,f)}}for(var p in r){var m=r[p];if(f=n[p],r.hasOwnProperty(p)&&(m!=null||f!=null))switch(p){case`type`:o=m;break;case`name`:a=m;break;case`checked`:u=m;break;case`defaultChecked`:d=m;break;case`value`:s=m;break;case`defaultValue`:c=m;break;case`children`:case`dangerouslySetInnerHTML`:if(m!=null)throw Error(i(137,t));break;default:m!==f&&$(e,t,p,m,r,f)}}Wt(e,s,c,l,u,d,o,a);return;case`select`:for(o in m=s=c=p=null,n)if(l=n[o],n.hasOwnProperty(o)&&l!=null)switch(o){case`value`:break;case`multiple`:m=l;default:r.hasOwnProperty(o)||$(e,t,o,null,r,l)}for(a in r)if(o=r[a],l=n[a],r.hasOwnProperty(a)&&(o!=null||l!=null))switch(a){case`value`:p=o;break;case`defaultValue`:c=o;break;case`multiple`:s=o;default:o!==l&&$(e,t,a,o,r,l)}t=c,n=s,r=m,p==null?!!r!=!!n&&(t==null?qt(e,!!n,n?[]:``,!1):qt(e,!!n,t,!0)):qt(e,!!n,p,!1);return;case`textarea`:for(c in m=p=null,n)if(a=n[c],n.hasOwnProperty(c)&&a!=null&&!r.hasOwnProperty(c))switch(c){case`value`:break;case`children`:break;default:$(e,t,c,null,r,a)}for(s in r)if(a=r[s],o=n[s],r.hasOwnProperty(s)&&(a!=null||o!=null))switch(s){case`value`:p=a;break;case`defaultValue`:m=a;break;case`children`:break;case`dangerouslySetInnerHTML`:if(a!=null)throw Error(i(91));break;default:a!==o&&$(e,t,s,a,r,o)}Jt(e,p,m);return;case`option`:for(var h in n)if(p=n[h],n.hasOwnProperty(h)&&p!=null&&!r.hasOwnProperty(h))switch(h){case`selected`:e.selected=!1;break;default:$(e,t,h,null,r,p)}for(l in r)if(p=r[l],m=n[l],r.hasOwnProperty(l)&&p!==m&&(p!=null||m!=null))switch(l){case`selected`:e.selected=p&&typeof p!=`function`&&typeof p!=`symbol`;break;default:$(e,t,l,p,r,m)}return;case`img`:case`link`:case`area`:case`base`:case`br`:case`col`:case`embed`:case`hr`:case`keygen`:case`meta`:case`param`:case`source`:case`track`:case`wbr`:case`menuitem`:for(var g in n)p=n[g],n.hasOwnProperty(g)&&p!=null&&!r.hasOwnProperty(g)&&$(e,t,g,null,r,p);for(u in r)if(p=r[u],m=n[u],r.hasOwnProperty(u)&&p!==m&&(p!=null||m!=null))switch(u){case`children`:case`dangerouslySetInnerHTML`:if(p!=null)throw Error(i(137,t));break;default:$(e,t,u,p,r,m)}return;default:if(en(t)){for(var _ in n)p=n[_],n.hasOwnProperty(_)&&p!==void 0&&!r.hasOwnProperty(_)&&Nd(e,t,_,void 0,r,p);for(d in r)p=r[d],m=n[d],!r.hasOwnProperty(d)||p===m||p===void 0&&m===void 0||Nd(e,t,d,p,r,m);return}}for(var v in n)p=n[v],n.hasOwnProperty(v)&&p!=null&&!r.hasOwnProperty(v)&&$(e,t,v,null,r,p);for(f in r)p=r[f],m=n[f],!r.hasOwnProperty(f)||p===m||p==null&&m==null||$(e,t,f,p,r,m)}function Id(e){switch(e){case`css`:case`script`:case`font`:case`img`:case`image`:case`input`:case`link`:return!0;default:return!1}}function Ld(){if(typeof performance.getEntriesByType==`function`){for(var e=0,t=0,n=performance.getEntriesByType(`resource`),r=0;r<n.length;r++){var i=n[r],a=i.transferSize,o=i.initiatorType,s=i.duration;if(a&&s&&Id(o)){for(o=0,s=i.responseEnd,r+=1;r<n.length;r++){var c=n[r],l=c.startTime;if(l>s)break;var u=c.transferSize,d=c.initiatorType;u&&Id(d)&&(c=c.responseEnd,o+=u*(c<s?1:(s-l)/(c-l)))}if(--r,t+=8*(a+o)/(i.duration/1e3),e++,10<e)break}}if(0<e)return t/e/1e6}return navigator.connection&&(e=navigator.connection.downlink,typeof e==`number`)?e:5}var Rd=null,zd=null;function Bd(e){return e.nodeType===9?e:e.ownerDocument}function Vd(e){switch(e){case`http://www.w3.org/2000/svg`:return 1;case`http://www.w3.org/1998/Math/MathML`:return 2;default:return 0}}function Hd(e,t){if(e===0)switch(t){case`svg`:return 1;case`math`:return 2;default:return 0}return e===1&&t===`foreignObject`?0:e}function Ud(e,t){return e===`textarea`||e===`noscript`||typeof t.children==`string`||typeof t.children==`number`||typeof t.children==`bigint`||typeof t.dangerouslySetInnerHTML==`object`&&t.dangerouslySetInnerHTML!==null&&t.dangerouslySetInnerHTML.__html!=null}var Wd=null;function Gd(){var e=window.event;return e&&e.type===`popstate`?e!==Wd&&(Wd=e,!0):(Wd=null,!1)}var Kd=typeof setTimeout==`function`?setTimeout:void 0,qd=typeof clearTimeout==`function`?clearTimeout:void 0,Jd=typeof Promise==`function`?Promise:void 0,Yd=typeof queueMicrotask==`function`?queueMicrotask:Jd===void 0?Kd:function(e){return Jd.resolve(null).then(e).catch(Xd)};function Xd(e){setTimeout(function(){throw e})}function Zd(e){return e===`head`}function Qd(e,t){var n=t,r=0;do{var i=n.nextSibling;if(e.removeChild(n),i&&i.nodeType===8){if(n=i.data,n===`/$`||n===`/&`){if(r===0){e.removeChild(i),Np(t);return}r--}else if(n===`$`||n===`$?`||n===`$~`||n===`$!`||n===`&`)r++;else if(n===`html`)pf(e.ownerDocument.documentElement);else if(n===`head`){n=e.ownerDocument.head,pf(n);for(var a=n.firstChild;a;){var o=a.nextSibling,s=a.nodeName;a[vt]||s===`SCRIPT`||s===`STYLE`||s===`LINK`&&a.rel.toLowerCase()===`stylesheet`||n.removeChild(a),a=o}}else n===`body`&&pf(e.ownerDocument.body)}n=i}while(n);Np(t)}function $d(e,t){var n=e;e=0;do{var r=n.nextSibling;if(n.nodeType===1?t?(n._stashedDisplay=n.style.display,n.style.display=`none`):(n.style.display=n._stashedDisplay||``,n.getAttribute(`style`)===``&&n.removeAttribute(`style`)):n.nodeType===3&&(t?(n._stashedText=n.nodeValue,n.nodeValue=``):n.nodeValue=n._stashedText||``),r&&r.nodeType===8){if(n=r.data,n===`/$`){if(e===0)break;e--}else n!==`$`&&n!==`$?`&&n!==`$~`&&n!==`$!`||e++}n=r}while(n)}function ef(e){var t=e.firstChild;for(t&&t.nodeType===10&&(t=t.nextSibling);t;){var n=t;switch(t=t.nextSibling,n.nodeName){case`HTML`:case`HEAD`:case`BODY`:ef(n),yt(n);continue;case`SCRIPT`:case`STYLE`:continue;case`LINK`:if(n.rel.toLowerCase()===`stylesheet`)continue}e.removeChild(n)}}function tf(e,t,n,r){for(;e.nodeType===1;){var i=n;if(e.nodeName.toLowerCase()!==t.toLowerCase()){if(!r&&(e.nodeName!==`INPUT`||e.type!==`hidden`))break}else if(!r){if(t===`input`&&e.type===`hidden`){var a=i.name==null?null:``+i.name;if(i.type===`hidden`&&e.getAttribute(`name`)===a)return e}else return e}else if(!e[vt])switch(t){case`meta`:if(!e.hasAttribute(`itemprop`))break;return e;case`link`:if(a=e.getAttribute(`rel`),a===`stylesheet`&&e.hasAttribute(`data-precedence`)||a!==i.rel||e.getAttribute(`href`)!==(i.href==null||i.href===``?null:i.href)||e.getAttribute(`crossorigin`)!==(i.crossOrigin==null?null:i.crossOrigin)||e.getAttribute(`title`)!==(i.title==null?null:i.title))break;return e;case`style`:if(e.hasAttribute(`data-precedence`))break;return e;case`script`:if(a=e.getAttribute(`src`),(a!==(i.src==null?null:i.src)||e.getAttribute(`type`)!==(i.type==null?null:i.type)||e.getAttribute(`crossorigin`)!==(i.crossOrigin==null?null:i.crossOrigin))&&a&&e.hasAttribute(`async`)&&!e.hasAttribute(`itemprop`))break;return e;default:return e}if(e=cf(e.nextSibling),e===null)break}return null}function nf(e,t,n){if(t===``)return null;for(;e.nodeType!==3;)if((e.nodeType!==1||e.nodeName!==`INPUT`||e.type!==`hidden`)&&!n||(e=cf(e.nextSibling),e===null))return null;return e}function rf(e,t){for(;e.nodeType!==8;)if((e.nodeType!==1||e.nodeName!==`INPUT`||e.type!==`hidden`)&&!t||(e=cf(e.nextSibling),e===null))return null;return e}function af(e){return e.data===`$?`||e.data===`$~`}function of(e){return e.data===`$!`||e.data===`$?`&&e.ownerDocument.readyState!==`loading`}function sf(e,t){var n=e.ownerDocument;if(e.data===`$~`)e._reactRetry=t;else if(e.data!==`$?`||n.readyState!==`loading`)t();else{var r=function(){t(),n.removeEventListener(`DOMContentLoaded`,r)};n.addEventListener(`DOMContentLoaded`,r),e._reactRetry=r}}function cf(e){for(;e!=null;e=e.nextSibling){var t=e.nodeType;if(t===1||t===3)break;if(t===8){if(t=e.data,t===`$`||t===`$!`||t===`$?`||t===`$~`||t===`&`||t===`F!`||t===`F`)break;if(t===`/$`||t===`/&`)return null}}return e}var lf=null;function uf(e){e=e.nextSibling;for(var t=0;e;){if(e.nodeType===8){var n=e.data;if(n===`/$`||n===`/&`){if(t===0)return cf(e.nextSibling);t--}else n!==`$`&&n!==`$!`&&n!==`$?`&&n!==`$~`&&n!==`&`||t++}e=e.nextSibling}return null}function df(e){e=e.previousSibling;for(var t=0;e;){if(e.nodeType===8){var n=e.data;if(n===`$`||n===`$!`||n===`$?`||n===`$~`||n===`&`){if(t===0)return e;t--}else n!==`/$`&&n!==`/&`||t++}e=e.previousSibling}return null}function ff(e,t,n){switch(t=Bd(n),e){case`html`:if(e=t.documentElement,!e)throw Error(i(452));return e;case`head`:if(e=t.head,!e)throw Error(i(453));return e;case`body`:if(e=t.body,!e)throw Error(i(454));return e;default:throw Error(i(451))}}function pf(e){for(var t=e.attributes;t.length;)e.removeAttributeNode(t[0]);yt(e)}var mf=new Map,hf=new Set;function gf(e){return typeof e.getRootNode==`function`?e.getRootNode():e.nodeType===9?e:e.ownerDocument}var _f=O.d;O.d={f:vf,r:yf,D:Sf,C:Cf,L:wf,m:Tf,X:Df,S:Ef,M:Of};function vf(){var e=_f.f(),t=bu();return e||t}function yf(e){var t=xt(e);t!==null&&t.tag===5&&t.type===`form`?ws(t):_f.r(e)}var bf=typeof document>`u`?null:document;function xf(e,t,n){var r=bf;if(r&&typeof t==`string`&&t){var i=Ut(t);i=`link[rel="`+e+`"][href="`+i+`"]`,typeof n==`string`&&(i+=`[crossorigin="`+n+`"]`),hf.has(i)||(hf.add(i),e={rel:e,crossOrigin:n,href:t},r.querySelector(i)===null&&(t=r.createElement(`link`),Pd(t,`link`,e),wt(t),r.head.appendChild(t)))}}function Sf(e){_f.D(e),xf(`dns-prefetch`,e,null)}function Cf(e,t){_f.C(e,t),xf(`preconnect`,e,t)}function wf(e,t,n){_f.L(e,t,n);var r=bf;if(r&&e&&t){var i=`link[rel="preload"][as="`+Ut(t)+`"]`;t===`image`&&n&&n.imageSrcSet?(i+=`[imagesrcset="`+Ut(n.imageSrcSet)+`"]`,typeof n.imageSizes==`string`&&(i+=`[imagesizes="`+Ut(n.imageSizes)+`"]`)):i+=`[href="`+Ut(e)+`"]`;var a=i;switch(t){case`style`:a=Af(e);break;case`script`:a=Pf(e)}mf.has(a)||(e=p({rel:`preload`,href:t===`image`&&n&&n.imageSrcSet?void 0:e,as:t},n),mf.set(a,e),r.querySelector(i)!==null||t===`style`&&r.querySelector(jf(a))||t===`script`&&r.querySelector(Ff(a))||(t=r.createElement(`link`),Pd(t,`link`,e),wt(t),r.head.appendChild(t)))}}function Tf(e,t){_f.m(e,t);var n=bf;if(n&&e){var r=t&&typeof t.as==`string`?t.as:`script`,i=`link[rel="modulepreload"][as="`+Ut(r)+`"][href="`+Ut(e)+`"]`,a=i;switch(r){case`audioworklet`:case`paintworklet`:case`serviceworker`:case`sharedworker`:case`worker`:case`script`:a=Pf(e)}if(!mf.has(a)&&(e=p({rel:`modulepreload`,href:e},t),mf.set(a,e),n.querySelector(i)===null)){switch(r){case`audioworklet`:case`paintworklet`:case`serviceworker`:case`sharedworker`:case`worker`:case`script`:if(n.querySelector(Ff(a)))return}r=n.createElement(`link`),Pd(r,`link`,e),wt(r),n.head.appendChild(r)}}}function Ef(e,t,n){_f.S(e,t,n);var r=bf;if(r&&e){var i=Ct(r).hoistableStyles,a=Af(e);t=t||`default`;var o=i.get(a);if(!o){var s={loading:0,preload:null};if(o=r.querySelector(jf(a)))s.loading=5;else{e=p({rel:`stylesheet`,href:e,"data-precedence":t},n),(n=mf.get(a))&&Rf(e,n);var c=o=r.createElement(`link`);wt(c),Pd(c,`link`,e),c._p=new Promise(function(e,t){c.onload=e,c.onerror=t}),c.addEventListener(`load`,function(){s.loading|=1}),c.addEventListener(`error`,function(){s.loading|=2}),s.loading|=4,Lf(o,t,r)}o={type:`stylesheet`,instance:o,count:1,state:s},i.set(a,o)}}}function Df(e,t){_f.X(e,t);var n=bf;if(n&&e){var r=Ct(n).hoistableScripts,i=Pf(e),a=r.get(i);a||(a=n.querySelector(Ff(i)),a||(e=p({src:e,async:!0},t),(t=mf.get(i))&&zf(e,t),a=n.createElement(`script`),wt(a),Pd(a,`link`,e),n.head.appendChild(a)),a={type:`script`,instance:a,count:1,state:null},r.set(i,a))}}function Of(e,t){_f.M(e,t);var n=bf;if(n&&e){var r=Ct(n).hoistableScripts,i=Pf(e),a=r.get(i);a||(a=n.querySelector(Ff(i)),a||(e=p({src:e,async:!0,type:`module`},t),(t=mf.get(i))&&zf(e,t),a=n.createElement(`script`),wt(a),Pd(a,`link`,e),n.head.appendChild(a)),a={type:`script`,instance:a,count:1,state:null},r.set(i,a))}}function kf(e,t,n,r){var a=(a=ge.current)?gf(a):null;if(!a)throw Error(i(446));switch(e){case`meta`:case`title`:return null;case`style`:return typeof n.precedence==`string`&&typeof n.href==`string`?(t=Af(n.href),n=Ct(a).hoistableStyles,r=n.get(t),r||(r={type:`style`,instance:null,count:0,state:null},n.set(t,r)),r):{type:`void`,instance:null,count:0,state:null};case`link`:if(n.rel===`stylesheet`&&typeof n.href==`string`&&typeof n.precedence==`string`){e=Af(n.href);var o=Ct(a).hoistableStyles,s=o.get(e);if(s||(a=a.ownerDocument||a,s={type:`stylesheet`,instance:null,count:0,state:{loading:0,preload:null}},o.set(e,s),(o=a.querySelector(jf(e)))&&!o._p&&(s.instance=o,s.state.loading=5),mf.has(e)||(n={rel:`preload`,as:`style`,href:n.href,crossOrigin:n.crossOrigin,integrity:n.integrity,media:n.media,hrefLang:n.hrefLang,referrerPolicy:n.referrerPolicy},mf.set(e,n),o||Nf(a,e,n,s.state))),t&&r===null)throw Error(i(528,``));return s}if(t&&r!==null)throw Error(i(529,``));return null;case`script`:return t=n.async,n=n.src,typeof n==`string`&&t&&typeof t!=`function`&&typeof t!=`symbol`?(t=Pf(n),n=Ct(a).hoistableScripts,r=n.get(t),r||(r={type:`script`,instance:null,count:0,state:null},n.set(t,r)),r):{type:`void`,instance:null,count:0,state:null};default:throw Error(i(444,e))}}function Af(e){return`href="`+Ut(e)+`"`}function jf(e){return`link[rel="stylesheet"][`+e+`]`}function Mf(e){return p({},e,{"data-precedence":e.precedence,precedence:null})}function Nf(e,t,n,r){e.querySelector(`link[rel="preload"][as="style"][`+t+`]`)?r.loading=1:(t=e.createElement(`link`),r.preload=t,t.addEventListener(`load`,function(){return r.loading|=1}),t.addEventListener(`error`,function(){return r.loading|=2}),Pd(t,`link`,n),wt(t),e.head.appendChild(t))}function Pf(e){return`[src="`+Ut(e)+`"]`}function Ff(e){return`script[async]`+e}function If(e,t,n){if(t.count++,t.instance===null)switch(t.type){case`style`:var r=e.querySelector(`style[data-href~="`+Ut(n.href)+`"]`);if(r)return t.instance=r,wt(r),r;var a=p({},n,{"data-href":n.href,"data-precedence":n.precedence,href:null,precedence:null});return r=(e.ownerDocument||e).createElement(`style`),wt(r),Pd(r,`style`,a),Lf(r,n.precedence,e),t.instance=r;case`stylesheet`:a=Af(n.href);var o=e.querySelector(jf(a));if(o)return t.state.loading|=4,t.instance=o,wt(o),o;r=Mf(n),(a=mf.get(a))&&Rf(r,a),o=(e.ownerDocument||e).createElement(`link`),wt(o);var s=o;return s._p=new Promise(function(e,t){s.onload=e,s.onerror=t}),Pd(o,`link`,r),t.state.loading|=4,Lf(o,n.precedence,e),t.instance=o;case`script`:return o=Pf(n.src),(a=e.querySelector(Ff(o)))?(t.instance=a,wt(a),a):(r=n,(a=mf.get(o))&&(r=p({},n),zf(r,a)),e=e.ownerDocument||e,a=e.createElement(`script`),wt(a),Pd(a,`link`,r),e.head.appendChild(a),t.instance=a);case`void`:return null;default:throw Error(i(443,t.type))}else t.type===`stylesheet`&&!(t.state.loading&4)&&(r=t.instance,t.state.loading|=4,Lf(r,n.precedence,e));return t.instance}function Lf(e,t,n){for(var r=n.querySelectorAll(`link[rel="stylesheet"][data-precedence],style[data-precedence]`),i=r.length?r[r.length-1]:null,a=i,o=0;o<r.length;o++){var s=r[o];if(s.dataset.precedence===t)a=s;else if(a!==i)break}a?a.parentNode.insertBefore(e,a.nextSibling):(t=n.nodeType===9?n.head:n,t.insertBefore(e,t.firstChild))}function Rf(e,t){e.crossOrigin??(e.crossOrigin=t.crossOrigin),e.referrerPolicy??(e.referrerPolicy=t.referrerPolicy),e.title??(e.title=t.title)}function zf(e,t){e.crossOrigin??(e.crossOrigin=t.crossOrigin),e.referrerPolicy??(e.referrerPolicy=t.referrerPolicy),e.integrity??(e.integrity=t.integrity)}var Bf=null;function Vf(e,t,n){if(Bf===null){var r=new Map,i=Bf=new Map;i.set(n,r)}else i=Bf,r=i.get(n),r||(r=new Map,i.set(n,r));if(r.has(e))return r;for(r.set(e,null),n=n.getElementsByTagName(e),i=0;i<n.length;i++){var a=n[i];if(!(a[vt]||a[M]||e===`link`&&a.getAttribute(`rel`)===`stylesheet`)&&a.namespaceURI!==`http://www.w3.org/2000/svg`){var o=a.getAttribute(t)||``;o=e+o;var s=r.get(o);s?s.push(a):r.set(o,[a])}}return r}function Hf(e,t,n){e=e.ownerDocument||e,e.head.insertBefore(n,t===`title`?e.querySelector(`head > title`):null)}function Uf(e,t,n){if(n===1||t.itemProp!=null)return!1;switch(e){case`meta`:case`title`:return!0;case`style`:if(typeof t.precedence!=`string`||typeof t.href!=`string`||t.href===``)break;return!0;case`link`:if(typeof t.rel!=`string`||typeof t.href!=`string`||t.href===``||t.onLoad||t.onError)break;switch(t.rel){case`stylesheet`:return e=t.disabled,typeof t.precedence==`string`&&e==null;default:return!0}case`script`:if(t.async&&typeof t.async!=`function`&&typeof t.async!=`symbol`&&!t.onLoad&&!t.onError&&t.src&&typeof t.src==`string`)return!0}return!1}function Wf(e){return!(e.type===`stylesheet`&&!(e.state.loading&3))}function Gf(e,t,n,r){if(n.type===`stylesheet`&&(typeof r.media!=`string`||!1!==matchMedia(r.media).matches)&&!(n.state.loading&4)){if(n.instance===null){var i=Af(r.href),a=t.querySelector(jf(i));if(a){t=a._p,typeof t==`object`&&t&&typeof t.then==`function`&&(e.count++,e=Jf.bind(e),t.then(e,e)),n.state.loading|=4,n.instance=a,wt(a);return}a=t.ownerDocument||t,r=Mf(r),(i=mf.get(i))&&Rf(r,i),a=a.createElement(`link`),wt(a);var o=a;o._p=new Promise(function(e,t){o.onload=e,o.onerror=t}),Pd(a,`link`,r),n.instance=a}e.stylesheets===null&&(e.stylesheets=new Map),e.stylesheets.set(n,t),(t=n.state.preload)&&!(n.state.loading&3)&&(e.count++,n=Jf.bind(e),t.addEventListener(`load`,n),t.addEventListener(`error`,n))}}var Kf=0;function qf(e,t){return e.stylesheets&&e.count===0&&Xf(e,e.stylesheets),0<e.count||0<e.imgCount?function(n){var r=setTimeout(function(){if(e.stylesheets&&Xf(e,e.stylesheets),e.unsuspend){var t=e.unsuspend;e.unsuspend=null,t()}},6e4+t);0<e.imgBytes&&Kf===0&&(Kf=62500*Ld());var i=setTimeout(function(){if(e.waitingForImages=!1,e.count===0&&(e.stylesheets&&Xf(e,e.stylesheets),e.unsuspend)){var t=e.unsuspend;e.unsuspend=null,t()}},(e.imgBytes>Kf?50:800)+t);return e.unsuspend=n,function(){e.unsuspend=null,clearTimeout(r),clearTimeout(i)}}:null}function Jf(){if(this.count--,this.count===0&&(this.imgCount===0||!this.waitingForImages)){if(this.stylesheets)Xf(this,this.stylesheets);else if(this.unsuspend){var e=this.unsuspend;this.unsuspend=null,e()}}}var Yf=null;function Xf(e,t){e.stylesheets=null,e.unsuspend!==null&&(e.count++,Yf=new Map,t.forEach(Zf,e),Yf=null,Jf.call(e))}function Zf(e,t){if(!(t.state.loading&4)){var n=Yf.get(e);if(n)var r=n.get(null);else{n=new Map,Yf.set(e,n);for(var i=e.querySelectorAll(`link[data-precedence],style[data-precedence]`),a=0;a<i.length;a++){var o=i[a];(o.nodeName===`LINK`||o.getAttribute(`media`)!==`not all`)&&(n.set(o.dataset.precedence,o),r=o)}r&&n.set(null,r)}i=t.instance,o=i.getAttribute(`data-precedence`),a=n.get(o)||r,a===r&&n.set(null,i),n.set(o,i),this.count++,r=Jf.bind(this),i.addEventListener(`load`,r),i.addEventListener(`error`,r),a?a.parentNode.insertBefore(i,a.nextSibling):(e=e.nodeType===9?e.head:e,e.insertBefore(i,e.firstChild)),t.state.loading|=4}}var Qf={$$typeof:S,Provider:null,Consumer:null,_currentValue:le,_currentValue2:le,_threadCount:0};function $f(e,t,n,r,i,a,o,s,c){this.tag=1,this.containerInfo=e,this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.next=this.pendingContext=this.context=this.cancelPendingCommit=null,this.callbackPriority=0,this.expirationTimes=nt(-1),this.entangledLanes=this.shellSuspendCounter=this.errorRecoveryDisabledLanes=this.expiredLanes=this.warmLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=nt(0),this.hiddenUpdates=nt(null),this.identifierPrefix=r,this.onUncaughtError=i,this.onCaughtError=a,this.onRecoverableError=o,this.pooledCache=null,this.pooledCacheLanes=0,this.formState=c,this.incompleteTransitions=new Map}function ep(e,t,n,r,i,a,o,s,c,l,u,d){return e=new $f(e,t,n,o,c,l,u,d,s),t=1,!0===a&&(t|=24),a=fi(3,null,null,t),e.current=a,a.stateNode=e,t=ca(),t.refCount++,e.pooledCache=t,t.refCount++,a.memoizedState={element:r,isDehydrated:n,cache:t},za(a),e}function tp(e){return e?(e=ui,e):ui}function np(e,t,n,r,i,a){i=tp(i),r.context===null?r.context=i:r.pendingContext=i,r=Va(t),r.payload={element:n},a=a===void 0?null:a,a!==null&&(r.callback=a),n=Ha(e,r,t),n!==null&&(hu(n,e,t),Ua(n,e,t))}function rp(e,t){if(e=e.memoizedState,e!==null&&e.dehydrated!==null){var n=e.retryLane;e.retryLane=n!==0&&n<t?n:t}}function ip(e,t){rp(e,t),(e=e.alternate)&&rp(e,t)}function ap(e){if(e.tag===13||e.tag===31){var t=si(e,67108864);t!==null&&hu(t,e,67108864),ip(e,67108864)}}function op(e){if(e.tag===13||e.tag===31){var t=pu();t=ct(t);var n=si(e,t);n!==null&&hu(n,e,t),ip(e,t)}}var sp=!0;function cp(e,t,n,r){var i=D.T;D.T=null;var a=O.p;try{O.p=2,up(e,t,n,r)}finally{O.p=a,D.T=i}}function lp(e,t,n,r){var i=D.T;D.T=null;var a=O.p;try{O.p=8,up(e,t,n,r)}finally{O.p=a,D.T=i}}function up(e,t,n,r){if(sp){var i=dp(r);if(i===null)wd(e,t,r,fp,n),Cp(e,r);else if(Tp(i,e,t,n,r))r.stopPropagation();else if(Cp(e,r),t&4&&-1<Sp.indexOf(e)){for(;i!==null;){var a=xt(i);if(a!==null)switch(a.tag){case 3:if(a=a.stateNode,a.current.memoizedState.isDehydrated){var o=Ze(a.pendingLanes);if(o!==0){var s=a;for(s.pendingLanes|=2,s.entangledLanes|=2;o;){var c=1<<31-We(o);s.entanglements[1]|=c,o&=~c}rd(a),!(K&6)&&(tu=Me()+500,id(0,!1))}}break;case 31:case 13:s=si(a,2),s!==null&&hu(s,a,2),bu(),ip(a,2)}if(a=dp(r),a===null&&wd(e,t,r,fp,n),a===i)break;i=a}i!==null&&r.stopPropagation()}else wd(e,t,r,null,n)}}function dp(e){return e=sn(e),pp(e)}var fp=null;function pp(e){if(fp=null,e=bt(e),e!==null){var t=o(e);if(t===null)e=null;else{var n=t.tag;if(n===13){if(e=s(t),e!==null)return e;e=null}else if(n===31){if(e=c(t),e!==null)return e;e=null}else if(n===3){if(t.stateNode.current.memoizedState.isDehydrated)return t.tag===3?t.stateNode.containerInfo:null;e=null}else t!==e&&(e=null)}}return fp=e,null}function mp(e){switch(e){case`beforetoggle`:case`cancel`:case`click`:case`close`:case`contextmenu`:case`copy`:case`cut`:case`auxclick`:case`dblclick`:case`dragend`:case`dragstart`:case`drop`:case`focusin`:case`focusout`:case`input`:case`invalid`:case`keydown`:case`keypress`:case`keyup`:case`mousedown`:case`mouseup`:case`paste`:case`pause`:case`play`:case`pointercancel`:case`pointerdown`:case`pointerup`:case`ratechange`:case`reset`:case`resize`:case`seeked`:case`submit`:case`toggle`:case`touchcancel`:case`touchend`:case`touchstart`:case`volumechange`:case`change`:case`selectionchange`:case`textInput`:case`compositionstart`:case`compositionend`:case`compositionupdate`:case`beforeblur`:case`afterblur`:case`beforeinput`:case`blur`:case`fullscreenchange`:case`focus`:case`hashchange`:case`popstate`:case`select`:case`selectstart`:return 2;case`drag`:case`dragenter`:case`dragexit`:case`dragleave`:case`dragover`:case`mousemove`:case`mouseout`:case`mouseover`:case`pointermove`:case`pointerout`:case`pointerover`:case`scroll`:case`touchmove`:case`wheel`:case`mouseenter`:case`mouseleave`:case`pointerenter`:case`pointerleave`:return 8;case`message`:switch(Ne()){case Pe:return 2;case Fe:return 8;case Ie:case Le:return 32;case Re:return 268435456;default:return 32}default:return 32}}var hp=!1,gp=null,_p=null,vp=null,yp=new Map,bp=new Map,xp=[],Sp=`mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset`.split(` `);function Cp(e,t){switch(e){case`focusin`:case`focusout`:gp=null;break;case`dragenter`:case`dragleave`:_p=null;break;case`mouseover`:case`mouseout`:vp=null;break;case`pointerover`:case`pointerout`:yp.delete(t.pointerId);break;case`gotpointercapture`:case`lostpointercapture`:bp.delete(t.pointerId)}}function wp(e,t,n,r,i,a){return e===null||e.nativeEvent!==a?(e={blockedOn:t,domEventName:n,eventSystemFlags:r,nativeEvent:a,targetContainers:[i]},t!==null&&(t=xt(t),t!==null&&ap(t)),e):(e.eventSystemFlags|=r,t=e.targetContainers,i!==null&&t.indexOf(i)===-1&&t.push(i),e)}function Tp(e,t,n,r,i){switch(t){case`focusin`:return gp=wp(gp,e,t,n,r,i),!0;case`dragenter`:return _p=wp(_p,e,t,n,r,i),!0;case`mouseover`:return vp=wp(vp,e,t,n,r,i),!0;case`pointerover`:var a=i.pointerId;return yp.set(a,wp(yp.get(a)||null,e,t,n,r,i)),!0;case`gotpointercapture`:return a=i.pointerId,bp.set(a,wp(bp.get(a)||null,e,t,n,r,i)),!0}return!1}function Ep(e){var t=bt(e.target);if(t!==null){var n=o(t);if(n!==null){if(t=n.tag,t===13){if(t=s(n),t!==null){e.blockedOn=t,dt(e.priority,function(){op(n)});return}}else if(t===31){if(t=c(n),t!==null){e.blockedOn=t,dt(e.priority,function(){op(n)});return}}else if(t===3&&n.stateNode.current.memoizedState.isDehydrated){e.blockedOn=n.tag===3?n.stateNode.containerInfo:null;return}}}e.blockedOn=null}function Dp(e){if(e.blockedOn!==null)return!1;for(var t=e.targetContainers;0<t.length;){var n=dp(e.nativeEvent);if(n===null){n=e.nativeEvent;var r=new n.constructor(n.type,n);on=r,n.target.dispatchEvent(r),on=null}else return t=xt(n),t!==null&&ap(t),e.blockedOn=n,!1;t.shift()}return!0}function Op(e,t,n){Dp(e)&&n.delete(t)}function kp(){hp=!1,gp!==null&&Dp(gp)&&(gp=null),_p!==null&&Dp(_p)&&(_p=null),vp!==null&&Dp(vp)&&(vp=null),yp.forEach(Op),bp.forEach(Op)}function Ap(e,n){e.blockedOn===n&&(e.blockedOn=null,hp||(hp=!0,t.unstable_scheduleCallback(t.unstable_NormalPriority,kp)))}var jp=null;function Mp(e){jp!==e&&(jp=e,t.unstable_scheduleCallback(t.unstable_NormalPriority,function(){jp===e&&(jp=null);for(var t=0;t<e.length;t+=3){var n=e[t],r=e[t+1],i=e[t+2];if(typeof r!=`function`){if(pp(r||n)===null)continue;break}var a=xt(n);a!==null&&(e.splice(t,3),t-=3,Ss(a,{pending:!0,data:i,method:n.method,action:r},r,i))}}))}function Np(e){function t(t){return Ap(t,e)}gp!==null&&Ap(gp,e),_p!==null&&Ap(_p,e),vp!==null&&Ap(vp,e),yp.forEach(t),bp.forEach(t);for(var n=0;n<xp.length;n++){var r=xp[n];r.blockedOn===e&&(r.blockedOn=null)}for(;0<xp.length&&(n=xp[0],n.blockedOn===null);)Ep(n),n.blockedOn===null&&xp.shift();if(n=(e.ownerDocument||e).$$reactFormReplay,n!=null)for(r=0;r<n.length;r+=3){var i=n[r],a=n[r+1],o=i[N]||null;if(typeof a==`function`)o||Mp(n);else if(o){var s=null;if(a&&a.hasAttribute(`formAction`)){if(i=a,o=a[N]||null)s=o.formAction;else if(pp(i)!==null)continue}else s=o.action;typeof s==`function`?n[r+1]=s:(n.splice(r,3),r-=3),Mp(n)}}}function Pp(){function e(e){e.canIntercept&&e.info===`react-transition`&&e.intercept({handler:function(){return new Promise(function(e){return i=e})},focusReset:`manual`,scroll:`manual`})}function t(){i!==null&&(i(),i=null),r||setTimeout(n,20)}function n(){if(!r&&!navigation.transition){var e=navigation.currentEntry;e&&e.url!=null&&navigation.navigate(e.url,{state:e.getState(),info:`react-transition`,history:`replace`})}}if(typeof navigation==`object`){var r=!1,i=null;return navigation.addEventListener(`navigate`,e),navigation.addEventListener(`navigatesuccess`,t),navigation.addEventListener(`navigateerror`,t),setTimeout(n,100),function(){r=!0,navigation.removeEventListener(`navigate`,e),navigation.removeEventListener(`navigatesuccess`,t),navigation.removeEventListener(`navigateerror`,t),i!==null&&(i(),i=null)}}}function Fp(e){this._internalRoot=e}Ip.prototype.render=Fp.prototype.render=function(e){var t=this._internalRoot;if(t===null)throw Error(i(409));var n=t.current;np(n,pu(),e,t,null,null)},Ip.prototype.unmount=Fp.prototype.unmount=function(){var e=this._internalRoot;if(e!==null){this._internalRoot=null;var t=e.containerInfo;np(e.current,2,null,e,null,null),bu(),t[pt]=null}};function Ip(e){this._internalRoot=e}Ip.prototype.unstable_scheduleHydration=function(e){if(e){var t=ut();e={blockedOn:null,target:e,priority:t};for(var n=0;n<xp.length&&t!==0&&t<xp[n].priority;n++);xp.splice(n,0,e),n===0&&Ep(e)}};var Lp=n.version;if(Lp!==`19.2.0`)throw Error(i(527,Lp,`19.2.0`));O.findDOMNode=function(e){var t=e._reactInternals;if(t===void 0)throw typeof e.render==`function`?Error(i(188)):(e=Object.keys(e).join(`,`),Error(i(268,e)));return e=u(t),e=e===null?null:d(e),e=e===null?null:e.stateNode,e};var Rp={bundleType:0,version:`19.2.0`,rendererPackageName:`react-dom`,currentDispatcherRef:D,reconcilerVersion:`19.2.0`};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<`u`){var zp=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!zp.isDisabled&&zp.supportsFiber)try{Ve=zp.inject(Rp),He=zp}catch{}}e.createRoot=function(e,t){if(!a(e))throw Error(i(299));var n=!1,r=``,o=Gs,s=Ks,c=qs;return t!=null&&(!0===t.unstable_strictMode&&(n=!0),t.identifierPrefix!==void 0&&(r=t.identifierPrefix),t.onUncaughtError!==void 0&&(o=t.onUncaughtError),t.onCaughtError!==void 0&&(s=t.onCaughtError),t.onRecoverableError!==void 0&&(c=t.onRecoverableError)),t=ep(e,1,!1,null,null,n,r,null,o,s,c,Pp),e[pt]=t.current,Sd(e),new Fp(t)}})),v=s(((e,t)=>{function n(){if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<`u`&&typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE==`function`)try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(n)}catch(e){console.error(e)}}n(),t.exports=_()})),y=u(m()),b=v(),x={standard:{name:`STANDARD APPROACH`,copy:`Spread across the west edge. Cover the north and center.`,cells:[{c:1,r:2},{c:1,r:0},{c:0,r:3}]},south:{name:`SOUTH APPROACH`,copy:`Group along the south edge. A different route; the north starts exposed. Same squad and stats.`,cells:[{c:0,r:4},{c:2,r:4},{c:0,r:2}]}};function ee(e){return e>=2?`HIGH`:e===1?`REDUCED`:`CLEAR`}function S(e){return e>=2?`Reinforcements arrive on their scheduled round.`:`Reinforcements arrive 1 round later in relevant Field Ops.`}function C(e){if(!e.results||e.outcome===`ongoing`)return null;let{victory:t,turns:n,squadStanding:r,squadDeployed:i}=e.results;return{victory:t,turns:n,squadStanding:r,squadDeployed:i,objectiveComplete:e.results.objectiveComplete===!0,healingActions:e.healingActions||0,...e.failureReason?{failureReason:e.failureReason}:{}}}function te(e){return e===`attrition`?`ATTRITION`:`PURSUIT`}function ne(e,t){return e===`TARGET_ESCAPED`?`The signal courier reached its exit.`:e===`DEADLINE`?`The completion window closed.`:t===`SURVIVE`?`A squad member fell. The full squad must survive.`:`The squad was defeated.`}function re(e){return new Date(e*1e3).toISOString().slice(0,16).replace(`T`,` `)+` UTC`}function w(e){if(!e||typeof e!=`object`)return null;let t=e;return typeof t.id!=`string`||!t.id.trim()||typeof t.name!=`string`||!t.name.trim()||typeof t.img!=`string`||!/^https:\/\//.test(t.img)?null:{id:t.id,name:t.name,img:t.img}}function T(e){return{defId:`pet:${e.id}`,name:e.name,team:`ally`,role:`companion`,hp:78,atk:18,def:6,spd:13,move:4,sprite:e.img,portrait:e.img,skillIds:[`pet-bite`,`pet-hamstring`]}}var ie=`/images/tactical_ops`,ae=`${ie}/alpha.png`,oe=`${ie}/alpha-attack.png`,se=`${ie}/alpha-portrait.jpg`,ce={id:`broken-signal`,name:`BROKEN SIGNAL`,objective:`Eliminate the hostile force and secure the tactical sector.`},E={alpha:{defId:`alpha`,name:`ALPHA`,team:`ally`,role:`alpha`,hp:120,atk:28,def:12,spd:14,move:3,sprite:ae,attackSprite:oe,portrait:se,skillIds:[`alpha-strike`,`alpha-rend`,`alpha-howl`]},"ally-02":{defId:`ally-02`,name:`CNC`,team:`ally`,role:`skirmisher`,hp:96,atk:22,def:8,spd:12,move:2,sprite:`${ie}/cnc_map_unit.webp`,portrait:`${ie}/cnc_portrait.webp`,skillIds:[`u02-shot`,`u02-burst`,`u02-suppress`]},"ally-03":{defId:`ally-03`,name:`SHADOW`,team:`ally`,role:`support`,hp:100,atk:16,def:10,spd:10,move:2,sprite:`${ie}/ally03.png`,portrait:`${ie}/ally03.png`,skillIds:[`u03-tap`,`u03-mend`,`u03-pack`]},hostile:{defId:`hostile`,name:`HOUND MK-2`,team:`enemy`,role:`hostile`,hp:68,atk:16,def:8,spd:11,move:2,sprite:`${ie}/hound.png`,portrait:`${ie}/hound.png`,skillIds:[`hostile-strike`,`hostile-maul`]},leader:{defId:`leader`,name:`BRUTE LEADER`,team:`enemy`,role:`leader`,hp:148,atk:24,def:14,spd:9,move:2,sprite:`${ie}/leader.png`,portrait:`${ie}/leader.png`,skillIds:[`leader-strike`,`leader-crush`,`leader-intimidate`]}},D=[{defId:`alpha`,id:`alpha`,c:2,r:2},{defId:`ally-02`,id:`ally-02`,c:1,r:0},{defId:`ally-03`,id:`ally-03`,c:1,r:4},{defId:`hostile`,id:`h1`,c:5,r:0},{defId:`hostile`,id:`h2`,c:5,r:3},{defId:`hostile`,id:`h3`,c:6,r:4},{defId:`leader`,id:`leader`,c:6,r:2}],O={"field-relay-recovery":6,"field-relay-hold":6,"field-relay-intercept":7,"field-isolated-hold":5};function le(e,t){let n=e.directive?[structuredClone(e.directive)]:[];if(e.activity!==`FIELD_OP`||t?.reportVersion!==3||t.directiveTier!==`advanced`)return n;let r=t.directiveSet===`pursuit`;if(r&&e.objectiveType===`SURVIVE`){let e=n.find(e=>e.reinforcement);e?.reinforcement&&(e.reinforcement.triggerRound=2,e.reinforcement.spawn.r=0,e.copy=`A HOUND enters from the north-east in round 2, one round later with reduced/clear pressure. Occupied entries use the nearest free cell.`)}let i=O[e.missionId];if(r&&i?n.push({type:`NO_SAFE_EXTRACTION`,name:`NO SAFE EXTRACTION`,maxRounds:i,copy:`Complete by the end of round ${i}. At round ${i+1}, the operation fails even if your squad is standing.`}):n.some(e=>e.supportCooldownExtra)||n.push({type:`DISRUPTED_SUPPORT`,name:`DISRUPTED SUPPORT`,supportCooldownExtra:1,copy:`Healing and allied support skills take 1 extra personal turn to recharge. SILENT SHELTER bypasses this penalty for PACK SUPPORT.`}),!n.some(e=>e.reinforcement)){let e=r?2:3;n.push({type:`REINFORCEMENTS`,name:`REINFORCEMENTS`,copy:`A HOUND enters from the ${r?`north`:`south`}-east in round ${e}, one round later with reduced/clear pressure. Occupied entries use the nearest free cell.`,reinforcement:{spawn:{defId:`hostile`,id:`field-reinforcement`,c:7,r:r?0:4},triggerRound:e,telegraphed:!0,spawned:!1}})}return n}function ue(e){let t=e.directive?.recoverEveryRounds;return!t||e.round%t===0}function de(e,t,n){return n.ignoreDisruption?0:t.team===`ally`&&n.effects.some(e=>e.kind===`heal`||e.kind===`status`&&[`SELF`,`ALLY_SINGLE`,`ALLY_AOE`].includes(n.targetType))&&e?.supportCooldownExtra||0}function fe(e){let t=e.objective;if(t?.type!==`HOLD`||!t.terminal)return!1;let n=e.units.filter(e=>!e.defeated&&Math.abs(e.c-t.terminal.c)+Math.abs(e.r-t.terminal.r)<=(t.radius??0));return n.some(e=>e.team===`ally`)&&!n.some(e=>e.team===`enemy`)}function pe(e){let t=e.objective;if(e.directive?.maxRounds&&e.round>e.directive.maxRounds)return{state:{...e,failureReason:`DEADLINE`},result:`defeat`};if(t?.type===`INTERCEPT`){let n=e.units.find(e=>e.id===t.targetId);return n?.defeated?{state:e,result:e.units.some(e=>e.team===`ally`&&!e.defeated)?`victory`:`defeat`}:n&&n.c===t.exit.c&&n.r===t.exit.r?{state:{...e,failureReason:`TARGET_ESCAPED`},result:`defeat`}:{state:e,result:null}}if(t?.type!==`HOLD`&&t?.type!==`SURVIVE`)return{state:e,result:null};let n=e.units.filter(e=>e.team===`ally`);if(!n.some(e=>!e.defeated)||t.type===`SURVIVE`&&n.some(e=>e.defeated))return{state:e,result:`defeat`};let r=e.round>t.checkedRound,i=t.type===`SURVIVE`?e.round-1:fe(e)?t.progress+ +!!r:0;return{state:{...e,objective:{...t,progress:i,checkedRound:e.round}},result:i>=t.duration?`victory`:null}}function k(e){let t=e.objective,n=e.directive,r=t?.type===`HOLD`?`HOLD ${t.progress}/${t.duration} · ${fe(e)?`CONTROLLED`:`OCCUPY / CLEAR AREA`}`:t?.type===`SURVIVE`?`SURVIVE ${t.progress}/${t.duration} · ALL SQUAD MUST STAND`:n?.recoverEveryRounds?`RECOVER · SIGNAL ${ue(e)?`OPEN`:`JAMMED — EVEN ROUNDS ONLY`}`:``,i=[n?.reinforcement&&e.reinforcement?`HOUND · ${e.reinforcement.spawned?`ARRIVED`:`ROUND ${e.reinforcement.triggerRound}`}`:``,n?.supportCooldownExtra?`SUPPORT COOLDOWNS +${n.supportCooldownExtra}`:``,n?.maxRounds?`WINDOW · ${Math.max(0,n.maxRounds-e.round+1)} ROUNDS LEFT`:``];return[t?.type===`INTERCEPT`?`INTERCEPT · STOP COURIER BEFORE EXIT`:r,...i].filter(Boolean).join(` · `)}function me(e){if(!e.length)return null;if(e.length===1)return structuredClone(e[0]);if(e.filter(e=>e.reinforcement).length>1)throw Error(`Only one reinforcement schedule per condition set`);return{type:`COMPOSITE`,name:e.map(e=>e.name).join(` + `),copy:e.map(e=>e.copy).join(` `),conditions:structuredClone(e),recoverEveryRounds:Math.max(...e.map(e=>e.recoverEveryRounds||0)),supportCooldownExtra:Math.max(...e.map(e=>e.supportCooldownExtra||0)),maxRounds:e.find(e=>e.maxRounds)?.maxRounds,reinforcement:structuredClone(e.find(e=>e.reinforcement)?.reinforcement)}}var he={"broken-signal":{art:`/images/tactical_ops/presentation/tactical_ops_battlefield_backdrop.png`}};function ge(e){return he[e?.battlefield||`broken-signal`]||he[`broken-signal`]}var _e=[{defId:`alpha`,id:`alpha`,c:0,r:2},{defId:`ally-02`,id:`ally-02`,c:1,r:0},{defId:`ally-03`,id:`ally-03`,c:1,r:4},{defId:`hostile`,id:`h1`,c:5,r:1},{defId:`hostile`,id:`h2`,c:6,r:3},{defId:`hostile`,id:`h3`,c:7,r:0}],ve=[{defId:`alpha`,id:`alpha`,c:0,r:2},{defId:`hostile`,id:`h1`,c:5,r:1},{defId:`hostile`,id:`h2`,c:6,r:3}],A={c:6,r:2},ye=[{defId:`alpha`,id:`alpha`,c:1,r:2},{defId:`ally-02`,id:`ally-02`,c:1,r:0},{defId:`ally-03`,id:`ally-03`,c:0,r:3},{defId:`leader`,id:`leader`,c:6,r:2},{defId:`hostile`,id:`h1`,c:4,r:0},{defId:`hostile`,id:`h2`,c:5,r:4}],be={spawn:{defId:`hostile`,id:`commander-reinforcement`,c:7,r:4},triggerRound:2};function xe(e,t){let n=!!(t&&e[1]===`pet:${t.id}`);return e.length!==2||e[0]!==`alpha`||!n&&![`ally-02`,`ally-03`].includes(e[1])?null:[{defId:`alpha`,id:`alpha`,c:0,r:2},{defId:e[1],id:e[1],c:1,r:e[1]===`ally-02`?0:4,...n?{unitDef:T(t)}:{}},...ve.filter(e=>e.defId===`hostile`)]}function Se(e,t){return e.length!==3||e[0]!==`alpha`||new Set(e).size!==3||!e.slice(1).every(e=>e===`ally-02`||e===`ally-03`||t&&e===`pet:${t.id}`)?null:[{...ye[0]},...e.slice(1).map((e,n)=>({defId:e,id:e,c:+(n===0),r:n===0?0:3,...t&&e===`pet:${t.id}`?{unitDef:T(t)}:{}})),...ye.slice(3)]}var Ce={operationId:`broken-signal`,name:`BROKEN SIGNAL`,orderedMissionIds:[`broken-signal-breach`,`broken-signal-recover`,`broken-signal-commander`]},we={operationId:`dead-relay`,name:`THE DEAD RELAY`,orderedMissionIds:[`dead-relay-courier`,`dead-relay-hold`,`dead-relay-guardian`]},Te={"broken-signal-breach":{missionId:`broken-signal-breach`,operationId:Ce.operationId,name:`BREACH`,objectiveType:`ELIMINATE`,squadCap:3,briefCopy:`Break the perimeter before the signal disappears. Eliminate the HOUND MK-2 patrol.`,resultsCopy:`BREACH CLEARED. RECOVER SIGNAL UNLOCKED.`,executable:!0,spawns:_e},"broken-signal-recover":{missionId:`broken-signal-recover`,operationId:Ce.operationId,name:`RECOVER SIGNAL`,objectiveType:`RECOVER`,squadCap:2,briefCopy:`Reach the relay terminal and recover the signal before the HOUND MK-2 patrol can stop you.`,resultsCopy:`OBJECTIVE COMPLETE · SIGNAL RECOVERED.`,executable:!0,terminal:A},"broken-signal-commander":{missionId:`broken-signal-commander`,operationId:Ce.operationId,name:`SIGNAL COMMANDER`,objectiveType:`BOSS`,squadCap:3,briefCopy:`Break the commander signal. Control the HOUND pressure or find an opening to defeat the BRUTE LEADER.`,resultsCopy:`Continue to save: OPERATION 01 — BROKEN SIGNAL CLEARED · ARCHIVE ENTRY RECORDED · NEXT OPERATION SLOT OPENED. No Operation assigned.`,executable:!0,spawns:ye}};function j(e){return e&&Te[e]||null}var Ee={activity:`FIELD_OP`,operationId:`field-ops`,regionId:`broken-signal`,battlefield:`broken-signal`,squadCap:3,executable:!0,resultsCopy:`Field Op complete. Your result records commander progress, the optional challenge and temporary signal pressure.`};Object.assign(Te,{"field-relay-recovery":{...Ee,missionId:`field-relay-recovery`,name:`RELAY RECOVERY`,objectiveType:`RECOVER`,challenge:{type:`TURN_LIMIT`,limit:4,label:`Recover by the end of round 4`},briefCopy:`Reach the relay and use RECOVER from within 1 cell. Eliminating the HOUND patrol is optional.`,terminal:{c:6,r:2},objective:{type:`RECOVER`,terminal:{c:6,r:2},completed:!1},spawns:ve.filter(e=>e.defId===`hostile`),directive:{type:`SIGNAL_INTERFERENCE`,name:`SIGNAL INTERFERENCE`,recoverEveryRounds:2,copy:`RECOVER works only on even rounds (2, 4, 6...). Move and attack normally; reach cover or prepare protection while the signal is jammed.`},squadHint:`PET mobility can reach the relay early. CNC controls patrol pressure; SHADOW protects a squad waiting for the signal window.`},"field-relay-hold":{...Ee,missionId:`field-relay-hold`,name:`RELAY HOLD`,objectiveType:`HOLD`,challenge:{type:`NO_HEALING`,label:`Clear without using a healing skill`},briefCopy:`Keep at least one ally within 1 cell of the marked relay, with no enemy inside that area, across 3 consecutive round changes. Losing control resets progress.`,objective:{type:`HOLD`,terminal:{c:3,r:2},radius:1,duration:3,progress:0,checkedRound:1},spawns:[{defId:`hostile`,id:`h1`,c:5,r:1},{defId:`hostile`,id:`h2`,c:6,r:3}],directive:{type:`REINFORCEMENTS`,name:`REINFORCEMENTS`,copy:`One HOUND arrives at the marked entry in round 2, or round 3 when signal pressure is reduced/clear (nearest free cell if occupied). Clear or slow enemies before they contest the relay.`,reinforcement:{spawn:{defId:`hostile`,id:`field-reinforcement`,c:7,r:2},triggerRound:2,telegraphed:!0,spawned:!1}},squadHint:`CNC pressure helps keep the area clear. SHADOW sustains the holder; PET control can delay the arriving HOUND.`},"field-squad-survival":{...Ee,missionId:`field-squad-survival`,name:`SQUAD SURVIVAL`,objectiveType:`SURVIVE`,challenge:{type:`SQUAD`,required:[`ally-02`,`PET`],label:`Clear with CNC and your equipped PET`},briefCopy:`Keep all three squad members standing through 4 rounds, until round 5 begins. Any squad member falling fails the mission. Clearing enemies early does not end the timer.`,objective:{type:`SURVIVE`,duration:4,progress:0,checkedRound:1},spawns:[{defId:`hostile`,id:`h1`,c:4,r:0},{defId:`hostile`,id:`h2`,c:5,r:4},{defId:`hostile`,id:`h3`,c:6,r:2}],directive:{type:`DISRUPTED_SUPPORT`,name:`DISRUPTED SUPPORT`,supportCooldownExtra:1,copy:`Allied healing and self/ally buff skills take 1 extra personal turn to recharge after use. Attacks and movement are unchanged. Time support carefully and protect the weakest squad member.`},squadHint:`SHADOW still provides sustain, but timing matters. CNC can reduce incoming pressure; PET mobility and slows help keep the squad safe.`},"field-relay-intercept":{...Ee,missionId:`field-relay-intercept`,name:`RELAY INTERCEPT`,objectiveType:`RECOVER`,briefCopy:`Recover at the northern relay from within 1 cell. Rush the terminal or control the patrol before the incoming HOUND closes the route.`,terminal:{c:6,r:0},objective:{type:`RECOVER`,terminal:{c:6,r:0},completed:!1},spawns:[{defId:`hostile`,id:`h1`,c:4,r:1},{defId:`hostile`,id:`h2`,c:6,r:3}],directive:{type:`REINFORCEMENTS`,name:`REINFORCEMENTS`,copy:`One HOUND enters from the north-east in round 2, or round 3 when signal pressure is reduced/clear. The entry uses the nearest free cell if occupied.`,reinforcement:{spawn:{defId:`hostile`,id:`field-reinforcement`,c:7,r:0},triggerRound:2,telegraphed:!0,spawned:!1}},challenge:{type:`NO_HEALING`,label:`Recover without using a healing skill`},squadHint:`CNC can open the northern route. PET speed favors a rush; SHADOW makes a slower approach safer.`},"field-isolated-hold":{...Ee,missionId:`field-isolated-hold`,name:`ISOLATED HOLD`,objectiveType:`HOLD`,briefCopy:`Control the southern relay area within 1 cell for 2 consecutive round changes. Any enemy inside contests it; losing control resets progress. The BRUTE LEADER applies pressure from the center.`,objective:{type:`HOLD`,terminal:{c:4,r:3},radius:1,duration:2,progress:0,checkedRound:1},spawns:[{defId:`leader`,id:`leader`,c:6,r:2},{defId:`hostile`,id:`h1`,c:5,r:0}],directive:{type:`DISRUPTED_SUPPORT`,name:`DISRUPTED SUPPORT`,supportCooldownExtra:1,copy:`Allied healing and self/ally buff skills take 1 extra personal turn to recharge. Hold the area while planning longer gaps between support actions.`},challenge:{type:`TURN_LIMIT`,limit:5,label:`Secure the area by the end of round 5`},squadHint:`SHADOW can protect a stationary holder. CNC or PET control helps keep the leader outside the area. South Approach changes the route to this relay.`},"field-rearguard":{...Ee,missionId:`field-rearguard`,name:`REARGUARD`,objectiveType:`SURVIVE`,briefCopy:`Keep all three squad members standing through 5 rounds, until round 6 begins. Defend against the patrol and the arriving HOUND. Any squad member falling fails the mission.`,objective:{type:`SURVIVE`,duration:5,progress:0,checkedRound:1},spawns:[{defId:`hostile`,id:`h1`,c:4,r:1},{defId:`hostile`,id:`h2`,c:5,r:4}],directive:{type:`REINFORCEMENTS`,name:`REINFORCEMENTS`,copy:`One HOUND arrives from the south-east in round 3, or round 4 when signal pressure is reduced/clear. Protect the flank or regroup before it arrives.`,reinforcement:{spawn:{defId:`hostile`,id:`field-reinforcement`,c:7,r:4},triggerRound:3,telegraphed:!0,spawned:!1}},challenge:{type:`SQUAD`,required:[`ally-03`,`PET`],label:`Survive with SHADOW and your equipped PET`},squadHint:`SHADOW can sustain a defensive group. PET slows help delay the new arrival; CNC offers pressure if you forgo the optional squad challenge.`},"dead-relay-courier":{activity:`CANON`,missionId:`dead-relay-courier`,operationId:we.operationId,battlefield:`broken-signal`,name:`THE COURIER`,objectiveType:`INTERCEPT`,squadCap:3,executable:!0,briefCopy:`HOUND is evacuating relay intel. Stop the reinforced SIGNAL COURIER before it reaches the south-east exit. It moves up to 2 cells each turn, while a HOUND patrol pressures your flank. Slow, intercept or focus fire. Stop it by round 4 on the FIRST successful clear to earn intel for the next mission.`,resultsCopy:`Courier stopped. Relay coordinates recovered. The counterattack is imminent.`,objective:{type:`INTERCEPT`,targetId:`courier`,exit:{c:7,r:4}},spawns:[{defId:`hostile`,id:`courier`,c:4,r:0,unitDef:{...E.hostile,defId:`signal-courier`,name:`SIGNAL COURIER`,hp:100,move:2}},{defId:`hostile`,id:`h1`,c:5,r:3},{defId:`hostile`,id:`h2`,c:3,r:3}],squadHint:`CNC can suppress the fleeing courier. PET slows make interception easier, while SHADOW keeps a forward blocker alive.`},"dead-relay-hold":{activity:`CANON`,missionId:`dead-relay-hold`,operationId:we.operationId,battlefield:`broken-signal`,name:`RELAY UNDER FIRE`,objectiveType:`HOLD`,squadCap:3,executable:!0,briefCopy:`Hold the relay for 3 consecutive round changes. Any enemy inside the marked zone resets control. Your recovered courier intel delays one HOUND reinforcement by a round.`,resultsCopy:`Relay secured. The defensive perimeter is stable. Guardian access confirmed.`,objective:{type:`HOLD`,terminal:{c:3,r:2},radius:1,duration:3,progress:0,checkedRound:1},spawns:[{defId:`hostile`,id:`h1`,c:5,r:1},{defId:`hostile`,id:`h2`,c:6,r:3}],directive:{type:`REINFORCEMENTS`,name:`REINFORCEMENTS`,copy:`A HOUND arrives from the east on round 2, or round 3 if courier intel was captured in the first mission.`,reinforcement:{spawn:{defId:`hostile`,id:`dead-relay-reinforcement`,c:7,r:2},triggerRound:2,telegraphed:!0,spawned:!1}},squadHint:`SHADOW can sustain relay control. CNC and PET prevent enemy contesting.`},"dead-relay-guardian":{activity:`CANON`,missionId:`dead-relay-guardian`,operationId:we.operationId,battlefield:`broken-signal`,name:`RELAY GUARDIAN`,objectiveType:`BOSS`,squadCap:3,executable:!0,briefCopy:`Eliminate the Dead Relay Guardian while a telegraphed HOUND reinforcement closes from the flank. This is the final mission of Operation 02.`,resultsCopy:`OPERATION 02 — THE DEAD RELAY SECURED. Canonical campaign archive updated.`,objective:{type:`BOSS`,targetId:`leader`},spawns:[{defId:`leader`,id:`leader`,c:6,r:2,unitDef:{...E.leader,name:`DEAD RELAY GUARDIAN`}},{defId:`hostile`,id:`h1`,c:4,r:0},{defId:`hostile`,id:`h2`,c:5,r:4}],directive:{type:`REINFORCEMENTS`,name:`GUARDIAN REINFORCEMENT`,copy:`One HOUND enters from the south-east on round 3. The entry is telegraphed.`,reinforcement:{spawn:{defId:`hostile`,id:`guardian-reinforcement`,c:7,r:4},triggerRound:3,telegraphed:!0,spawned:!1}},squadHint:`Use your Pack's control and sustain to counter the Guardian's pressure, then focus on the boss.`}});var De=structuredClone(Te[`field-relay-intercept`]);Te[`field-relay-intercept`]={...De,objectiveType:`INTERCEPT`,terminal:void 0,briefCopy:`Stop the SIGNAL COURIER before it reaches the south-east EXIT. It moves 1 cell on each personal turn, taking the shortest free route. Block the route, slow it, or focus fire; patrol kills are optional.`,objective:{type:`INTERCEPT`,targetId:`courier`,exit:{c:7,r:4}},spawns:[{defId:`hostile`,id:`courier`,c:4,r:0,unitDef:{...E.hostile,defId:`signal-courier`,name:`SIGNAL COURIER`,move:1}},{defId:`hostile`,id:`h1`,c:4,r:2},{defId:`hostile`,id:`h2`,c:6,r:3}],challenge:{type:`NO_HEALING`,label:`Intercept without using a healing skill`},squadHint:`CNC DISRUPTOR and PET HAMSTRING slow the courier's turns. PET mobility can block its exit; SHADOW protects a forward blocker at the cost of another control unit.`};function Oe(e,t){return e.missionId===`field-relay-intercept`&&t?.reportVersion!=null&&t.reportVersion<3?De:e}function ke(e,t,n,r=`standard`){if(e.operationId===we.operationId){let r=Se(t,n);return r?[...r.slice(0,3),...e.spawns||[]]:null}if(e.activity===`FIELD_OP`){let i=Se(t,n);return i&&x[r]?[...i.slice(0,3).map((e,t)=>({...e,...x[r].cells[t]})),...e.spawns||[]]:null}return e.objectiveType===`RECOVER`?xe(t,n):e.objectiveType===`BOSS`?Se(t,n):e.spawns||null}function Ae(e,t=!1,n,r){e=Oe(e,n);let i=e.objective?structuredClone(e.objective):e.objectiveType===`RECOVER`&&e.terminal?{type:`RECOVER`,terminal:{...e.terminal},completed:!1}:e.objectiveType===`BOSS`?{type:`BOSS`,targetId:`leader`}:null,a=me(le(e,n)),o=a?.reinforcement||(e.objectiveType===`BOSS`?{...be,spawn:{...be.spawn},telegraphed:t,spawned:!1}:null);return e.activity===`FIELD_OP`&&o&&n&&n.pressure<2&&(o.triggerRound+=1),e.missionId===`dead-relay-hold`&&o&&r?.courierTraceAcquired&&(o.triggerRound=3),{objective:i,directive:a,reinforcement:o}}function je(){if(typeof window>`u`)return null;let e=window.FirstSessionSpine;return!e||typeof e.view!=`function`||typeof e.subscribe!=`function`||typeof e.acknowledge!=`function`?null:e}function Me(){let e=je();return e?{view(){return{result:e.view()?.result??void 0}},subscribe(t){let n=e.subscribe(t);return typeof n==`function`?n:()=>void 0},acknowledge(t){return e.acknowledge(t)===!0}}:null}var Ne=e=>e.replace(/([a-z0-9])([A-Z])/g,`$1-$2`).toLowerCase(),Pe=e=>e.replace(/^([A-Z])|[\s-_]+(\w)/g,(e,t,n)=>n?n.toUpperCase():t.toLowerCase()),Fe=e=>{let t=Pe(e);return t.charAt(0).toUpperCase()+t.slice(1)},Ie=(...e)=>e.filter((e,t,n)=>!!e&&e.trim()!==``&&n.indexOf(e)===t).join(` `).trim(),Le=e=>{for(let t in e)if(t.startsWith(`aria-`)||t===`role`||t===`title`)return!0},Re={xmlns:`http://www.w3.org/2000/svg`,width:24,height:24,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:2,strokeLinecap:`round`,strokeLinejoin:`round`},ze=(0,y.forwardRef)(({color:e=`currentColor`,size:t=24,strokeWidth:n=2,absoluteStrokeWidth:r,className:i=``,children:a,iconNode:o,...s},c)=>(0,y.createElement)(`svg`,{ref:c,...Re,width:t,height:t,stroke:e,strokeWidth:r?Number(n)*24/Number(t):n,className:Ie(`lucide`,i),...!a&&!Le(s)&&{"aria-hidden":`true`},...s},[...o.map(([e,t])=>(0,y.createElement)(e,t)),...Array.isArray(a)?a:[a]])),Be=(e,t)=>{let n=(0,y.forwardRef)(({className:n,...r},i)=>(0,y.createElement)(ze,{ref:i,iconNode:t,className:Ie(`lucide-${Ne(Fe(e))}`,`lucide-${e}`,n),...r}));return n.displayName=Fe(e),n},Ve=Be(`axe`,[[`path`,{d:`m14 12-8.381 8.38a1 1 0 0 1-3.001-3L11 9`,key:`5z9253`}],[`path`,{d:`M15 15.5a.5.5 0 0 0 .5.5A6.5 6.5 0 0 0 22 9.5a.5.5 0 0 0-.5-.5h-1.672a2 2 0 0 1-1.414-.586l-5.062-5.062a1.205 1.205 0 0 0-1.704 0L9.352 5.648a1.205 1.205 0 0 0 0 1.704l5.062 5.062A2 2 0 0 1 15 13.828z`,key:`19zklq`}]]),He=Be(`chevron-right`,[[`path`,{d:`m9 18 6-6-6-6`,key:`mthhwq`}]]),Ue=Be(`chevrons-right`,[[`path`,{d:`m6 17 5-5-5-5`,key:`xnjwq`}],[`path`,{d:`m13 17 5-5-5-5`,key:`17xmmf`}]]),We=Be(`crosshair`,[[`circle`,{cx:`12`,cy:`12`,r:`10`,key:`1mglay`}],[`line`,{x1:`22`,x2:`18`,y1:`12`,y2:`12`,key:`l9bcsi`}],[`line`,{x1:`6`,x2:`2`,y1:`12`,y2:`12`,key:`13hhkx`}],[`line`,{x1:`12`,x2:`12`,y1:`6`,y2:`2`,key:`10w3f3`}],[`line`,{x1:`12`,x2:`12`,y1:`22`,y2:`18`,key:`15g9kq`}]]),Ge=Be(`heart-pulse`,[[`path`,{d:`M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z`,key:`c3ymky`}],[`path`,{d:`M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27`,key:`1uw2ng`}]]),Ke=Be(`paw-print`,[[`circle`,{cx:`11`,cy:`4`,r:`2`,key:`vol9p0`}],[`circle`,{cx:`18`,cy:`8`,r:`2`,key:`17gozi`}],[`circle`,{cx:`20`,cy:`16`,r:`2`,key:`1v9bxh`}],[`path`,{d:`M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z`,key:`1ydw1z`}]]),qe=Be(`rotate-ccw`,[[`path`,{d:`M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8`,key:`1357e3`}],[`path`,{d:`M3 3v5h5`,key:`1xhq8a`}]]),Je=Be(`shield`,[[`path`,{d:`M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z`,key:`oel41y`}]]),Ye=Be(`slash`,[[`path`,{d:`M22 2 2 22`,key:`y4kqgn`}]]),Xe=Be(`swords`,[[`polyline`,{points:`14.5 17.5 3 6 3 3 6 3 17.5 14.5`,key:`1hfsw2`}],[`line`,{x1:`13`,x2:`19`,y1:`19`,y2:`13`,key:`1vrmhu`}],[`line`,{x1:`16`,x2:`20`,y1:`16`,y2:`20`,key:`1bron3`}],[`line`,{x1:`19`,x2:`21`,y1:`21`,y2:`19`,key:`13pww6`}],[`polyline`,{points:`14.5 6.5 18 3 21 3 21 6 17.5 9.5`,key:`hbey2j`}],[`line`,{x1:`5`,x2:`9`,y1:`14`,y2:`18`,key:`1hf58s`}],[`line`,{x1:`7`,x2:`4`,y1:`17`,y2:`20`,key:`pidxm4`}],[`line`,{x1:`3`,x2:`5`,y1:`19`,y2:`21`,key:`1pehsh`}]]),Ze=Be(`target`,[[`circle`,{cx:`12`,cy:`12`,r:`10`,key:`1mglay`}],[`circle`,{cx:`12`,cy:`12`,r:`6`,key:`1vlfrh`}],[`circle`,{cx:`12`,cy:`12`,r:`2`,key:`1c9p78`}]]),Qe=Be(`volume-2`,[[`path`,{d:`M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z`,key:`uqj9uw`}],[`path`,{d:`M16 9a5 5 0 0 1 0 6`,key:`1q6k2b`}],[`path`,{d:`M19.364 18.364a9 9 0 0 0 0-12.728`,key:`ijwkga`}]]),$e=Be(`volume-x`,[[`path`,{d:`M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z`,key:`uqj9uw`}],[`line`,{x1:`22`,x2:`16`,y1:`9`,y2:`15`,key:`1ewh16`}],[`line`,{x1:`16`,x2:`22`,y1:`9`,y2:`15`,key:`5ykzw1`}]]),et={alpha:[`vanguard`,`howlkeeper`],"ally-02":[`pursuer`,`disruptor`],"ally-03":[`sentinel`,`medic`]},tt={alpha:[`alpha-strike`,`alpha-rend`,`alpha-howl`],"ally-02":[`u02-shot`,`u02-burst`,`u02-suppress`],"ally-03":[`u03-tap`,`u03-mend`,`u03-pack`]},nt=[{skillId:`alpha-strike`,rank:1,label:`Long Step`,description:`Strike reaches one tile farther.`,rangeDelta:1},{skillId:`alpha-strike`,rank:2,label:`Relentless`,description:`Strike reaches two tiles farther.`,rangeDelta:2},{skillId:`alpha-rend`,rank:1,label:`Deep Cut`,description:`Bleed lasts one additional turn.`,durationDelta:1},{skillId:`alpha-rend`,rank:2,label:`Open Wound`,description:`Bleed lasts two additional turns.`,durationDelta:2},{skillId:`alpha-howl`,rank:1,label:`Pack Echo`,description:`Howl cooldown reduced by one turn.`,cooldownDelta:-1},{skillId:`alpha-howl`,rank:2,label:`Pack Rhythm`,description:`Howl cooldown reduced by two turns.`,cooldownDelta:-2},{skillId:`u02-shot`,rank:1,label:`Long Reach`,description:`Thrust reaches one additional tile.`,rangeDelta:1},{skillId:`u02-shot`,rank:2,label:`Pursuit`,description:`Thrust reaches two additional tiles.`,rangeDelta:2},{skillId:`u02-burst`,rank:1,label:`Rapid Lunge`,description:`Lunge cooldown reduced by one.`,cooldownDelta:-1},{skillId:`u02-burst`,rank:2,label:`Flow State`,description:`Lunge cooldown reduced by two.`,cooldownDelta:-2},{skillId:`u02-suppress`,rank:1,label:`Sustained Pressure`,description:`Pressure control lasts longer.`,durationDelta:1},{skillId:`u02-suppress`,rank:2,label:`Signal Lock`,description:`Pressure control lasts two turns longer.`,durationDelta:2},{skillId:`u03-tap`,rank:1,label:`Extended Reach`,description:`Basic skill reaches one tile farther.`,rangeDelta:1},{skillId:`u03-tap`,rank:2,label:`Relay Reach`,description:`Basic skill reaches two tiles farther.`,rangeDelta:2},{skillId:`u03-mend`,rank:1,label:`Fast Recovery`,description:`Mend cooldown reduced by one.`,cooldownDelta:-1},{skillId:`u03-mend`,rank:2,label:`Field Triage`,description:`Mend cooldown reduced by two.`,cooldownDelta:-2},{skillId:`u03-pack`,rank:1,label:`Long Watch`,description:`Pack support lasts one extra turn.`,durationDelta:1},{skillId:`u03-pack`,rank:2,label:`Hold Together`,description:`Pack support lasts two extra turns.`,durationDelta:2}];function rt(e){if(!e||typeof e!=`object`)throw Error(`invalid_growth_snapshot`);let t=e;if(t.version!==1||!Number.isSafeInteger(t.revision)||t.revision<0||!Array.isArray(t.heroes)||t.heroes.length!==3)throw Error(`invalid_growth_snapshot`);let n=Object.keys(et);for(let e of n){let n=t.heroes.find(t=>t&&t.heroId===e);if(!n||t.heroes.filter(t=>t&&t.heroId===e).length!==1)throw Error(`invalid_growth_hero`);if(n.discipline!==null&&!et[e].includes(n.discipline))throw Error(`invalid_growth_discipline`);if(!n.ranks||typeof n.ranks!=`object`||Array.isArray(n.ranks))throw Error(`invalid_growth_ranks`);if(Object.keys(n.ranks).length&&n.discipline===null)throw Error(`invalid_growth_discipline`);if(n.respecUsed!==void 0&&typeof n.respecUsed!=`boolean`)throw Error(`invalid_growth_respec`);for(let[t,r]of Object.entries(n.ranks))if(!tt[e].includes(t)||!Number.isInteger(r)||r<1||r>2)throw Error(`invalid_growth_rank`)}return t}function it(e){let t=e.split(`:mastery:`)[0];switch(t){case`u02-lunge-vanguard`:return`u02-burst`;case`u02-pressure-disruptor`:return`u02-suppress`;case`u03-mend-restorer`:return`u03-mend`;case`u03-pack-warden`:return`u03-pack`;default:return t}}function at(e,t){let n=it(e.id);if(!t||!tt[t.heroId]?.includes(n))return e;let r=t.ranks[n]??0;if(!Number.isInteger(r)||r<0||r>2)return e;let i=r?nt.find(e=>e.skillId===n&&e.rank===r):void 0,a={...e,maxRange:Math.max(e.minRange,e.maxRange+(i?.rangeDelta??0)),cooldownMax:Math.max(+(e.cooldownMax>0),e.cooldownMax+(i?.cooldownDelta??0)),effects:e.effects.map(e=>e.kind===`status`&&i?.durationDelta?{...e,duration:(e.duration??1)+i.durationDelta}:{...e})};switch(t.discipline){case`vanguard`:n===`alpha-howl`&&!a.effects.some(e=>e.status===`GUARD`)&&a.effects.push({kind:`status`,status:`GUARD`,duration:1,value:.2,on:`aoe_allies`});break;case`howlkeeper`:e.id===`alpha-howl`&&(a.radius+=1);break;case`pursuer`:n===`u02-shot`&&(a.maxRange+=1);break;case`disruptor`:n===`u02-suppress`&&(a.effects=a.effects.map(e=>e.kind===`status`?{...e,duration:(e.duration??1)+1}:e));break;case`sentinel`:n===`u03-pack`&&!a.effects.some(e=>e.status===`GUARD`)&&a.effects.push({kind:`status`,status:`GUARD`,duration:1,value:.2,on:`aoe_allies`});break;case`medic`:n===`u03-mend`&&(a.cooldownMax=Math.max(1,a.cooldownMax-1))}return a}var ot=e=>{let t,n=new Set,r=(e,r)=>{let i=typeof e==`function`?e(t):e;if(!Object.is(i,t)){let e=t;t=r??(typeof i!=`object`||!i)?i:Object.assign({},t,i),n.forEach(n=>n(t,e))}},i=()=>t,a={setState:r,getState:i,getInitialState:()=>o,subscribe:e=>(n.add(e),()=>n.delete(e))},o=t=e(r,i,a);return a},st=e=>e?ot(e):ot,ct=e=>e;function lt(e,t=ct){let n=y.useSyncExternalStore(e.subscribe,()=>t(e.getState()),()=>t(e.getInitialState()));return y.useDebugValue(n),n}var ut=e=>{let t=st(e),n=e=>lt(t,e);return Object.assign(n,t),n},dt=e=>e?ut(e):ut,ft=`ah_tactical_battlefield_lab_v1`,M=(()=>{if(typeof window>`u`)return!1;try{return new URLSearchParams(window.location.search).get(`tacticalBattlefieldVNext`)===`1`||window.localStorage.getItem(ft)===`10x7`}catch{return!1}})(),N=M?10:8,pt=M?7:5,mt=100,ht=50,gt=1;function _t(){gt=1}function vt(e,t){return e.statuses.find(e=>e.type===t)}function yt(e,t,n,r,i){let a=e.statuses.find(e=>e.type===t);if(a){let t={...a,source:n,duration:Math.max(a.duration,r),value:i};return{unit:{...e,statuses:e.statuses.map(e=>e.id===a.id?t:e)},applied:t,refreshed:!0}}let o={id:`st-${gt++}`,type:t,source:n,duration:r,value:i};return{unit:{...e,statuses:[...e.statuses,o]},applied:o,refreshed:!1}}function bt(e,t,n){let r=vt(e,t),i=vt(e,n),a=1;return r&&(a+=r.value),i&&(a-=i.value),Math.max(.4,a)}function xt(e){return Math.max(1,Math.round(e.atk*bt(e,`ATK_UP`,`ATK_DOWN`)))}function St(e){return Math.max(0,Math.round(e.def*bt(e,`DEF_UP`,`DEF_DOWN`)))}function Ct(e){return Math.max(1,Math.round(e.spd*bt(e,`SPD_UP`,`SPD_DOWN`)))}function wt(e){return vt(e,`GUARD`)?.5:1}var Tt={ATK_UP:`ATK UP`,DEF_UP:`DEF UP`,SPD_UP:`SPD UP`,GUARD:`GUARD`,BLEED:`BLEED`,ATK_DOWN:`ATK DOWN`,DEF_DOWN:`DEF DOWN`,SPD_DOWN:`SPD DOWN`},Et={ATK_UP:`ATK+`,DEF_UP:`DEF+`,SPD_UP:`SPD+`,GUARD:`GRD`,BLEED:`BLD`,ATK_DOWN:`ATK-`,DEF_DOWN:`DEF-`,SPD_DOWN:`SPD-`};function Dt(e,t,n){let r=e*t,i=St(n),a=i/(i+50);return Math.max(1,Math.round(r*(1-a)))}function Ot(e,t,n,r){let i=Math.round(e+n*t);return Math.max(0,Math.min(i,r.maxHp-r.hp))}function kt(e,t){return e>=0&&e<N&&t>=0&&t<pt}function At(e,t){return Math.max(Math.abs(e.c-t.c),Math.abs(e.r-t.r))}function jt(e,t){return`${e},${t}`}function Mt(e,t){let n=new Set;for(let r of e)r.defeated||t&&r.id===t||n.add(jt(r.c,r.r));return n}function Nt(e,t,n){return e.find(e=>!e.defeated&&e.c===t&&e.r===n)}function Pt(e,t){let n=[];for(let[r,i]of[[1,0],[-1,0],[0,1],[0,-1]]){let a=e+r,o=t+i;kt(a,o)&&n.push({c:a,r:o})}return n}function Ft(e,t,n=e.move){if(n<=0)return[];let r=Mt(t,e.id),i=new Set([jt(e.c,e.r)]),a=[],o=[{c:e.c,r:e.r,d:0}];for(;o.length;){let e=o.shift();if(e.d!==n)for(let t of Pt(e.c,e.r)){let n=jt(t.c,t.r);i.has(n)||r.has(n)||(i.add(n),a.push(t),o.push({...t,d:e.d+1}))}}return a}function It(e,t,n,r){return kt(t,n)&&!Mt(e,r).has(jt(t,n))}function Lt(e,t){let n=t/(pt-1),r=26+n*52,i=34+n*8,a=e/(N-1);return{x:50-i+i*2*a,y:r}}function Rt(e,t,n){let r=At(e,t);return r>=n.minRange&&r<=n.maxRange}function zt(e,t){return e.filter(e=>!e.defeated&&(!t||e.team===t))}function Bt(e,t,n,r){return zt(e,r).filter(e=>At(e,t)<=n)}function Vt(e,t,n,r,i){switch(n.targetType){case`SELF`:return t.defeated?[]:[t];case`ALLY_SINGLE`:{let i=e.find(e=>e.id===r);return!i||i.defeated||i.team!==t.team||!Rt(t,i,n)?[]:[i]}case`ENEMY_SINGLE`:{let i=e.find(e=>e.id===r);return!i||i.defeated||i.team===t.team||!Rt(t,i,n)?[]:[i]}case`ALLY_AOE`:return Bt(e,{c:t.c,r:t.r},n.radius,t.team);case`ENEMY_AOE`:return Bt(e,{c:t.c,r:t.r},n.radius,t.team===`ally`?`enemy`:`ally`);case`AREA_RADIUS`:{let a=null;if(i&&kt(i.c,i.r))a=i;else if(r){let t=e.find(e=>e.id===r);t&&(a={c:t.c,r:t.r})}if(!a||!Rt(t,a,n))return[];let o=t.team===`ally`?`enemy`:`ally`;return Bt(e,a,n.radius,o)}default:return[]}}function Ht(e,t,n){switch(n.targetType){case`SELF`:case`ALLY_AOE`:case`ENEMY_AOE`:return[t.id];case`ALLY_SINGLE`:return zt(e,t.team).filter(e=>Rt(t,e,n)).map(e=>e.id);case`ENEMY_SINGLE`:return zt(e,t.team===`ally`?`enemy`:`ally`).filter(e=>Rt(t,e,n)).map(e=>e.id);case`AREA_RADIUS`:return zt(e,t.team===`ally`?`enemy`:`ally`).filter(e=>Rt(t,e,n)).map(e=>e.id);default:return[]}}function Ut(e){return e.targetType===`ALLY_SINGLE`||e.targetType===`ENEMY_SINGLE`||e.targetType===`AREA_RADIUS`}function Wt(e){return e===`SELF`||e===`ALLY_SINGLE`||e===`ENEMY_SINGLE`||e===`ALLY_AOE`||e===`ENEMY_AOE`||e===`AREA_RADIUS`}function Gt(e,t){return t.meter===e.meter?Ct(t)-Ct(e)||e.id.localeCompare(t.id):t.meter-e.meter}function Kt(e){let t=e.map(e=>({...e}));for(let e=0;e<400;e++){if(zt(t).filter(e=>e.meter>=100).length)return t;for(let e of t)e.defeated||(e.meter+=Ct(e))}return t}function qt(e){let t=zt(e).filter(e=>e.meter>=100);return t.length?(t.sort(Gt),t[0].id):null}function Jt(e){return{...e,meter:Math.max(0,e.meter-100),hasMoved:!1,hasActed:!1}}function Yt(e,t=6){let n=[],r=e.units.map(e=>({...e,statuses:e.statuses.map(e=>({...e})),cooldowns:{...e.cooldowns}}));if(e.activeId){let t=r.find(t=>t.id===e.activeId&&!t.defeated);t&&n.push(t.id)}for(;n.length<t;){r=Kt(r);let e=qt(r);if(!e)break;n.push(e),r=r.map(t=>t.id===e?Jt(t):t)}return n.slice(0,t)}var Xt={"pet-bite":{id:`pet-bite`,name:`BITE`,desc:`Quick melee bite. Range 1.`,slot:`A1`,cooldownMax:0,targetType:`ENEMY_SINGLE`,minRange:1,maxRange:1,radius:0,effects:[{kind:`damage`,multiplier:1,on:`hits`}]},"pet-hamstring":{id:`pet-hamstring`,name:`HAMSTRING`,desc:`Melee bite. Slows enemy initiative by 50% for 2 turns, buying time to reach the relay.`,slot:`A2`,cooldownMax:3,targetType:`ENEMY_SINGLE`,minRange:1,maxRange:1,radius:0,effects:[{kind:`damage`,multiplier:.6,on:`hits`},{kind:`status`,status:`SPD_DOWN`,duration:2,value:.5,on:`hits`}]},"alpha-strike":{id:`alpha-strike`,name:`STRIKE`,desc:`Melee hit. Range 1.`,slot:`A1`,cooldownMax:0,targetType:`ENEMY_SINGLE`,minRange:1,maxRange:1,radius:0,effects:[{kind:`damage`,multiplier:1,on:`hits`}]},"alpha-rend":{id:`alpha-rend`,name:`REND`,desc:`Heavy melee hit. Applies Bleed for 2 turns.`,slot:`A2`,cooldownMax:3,targetType:`ENEMY_SINGLE`,minRange:1,maxRange:1,radius:0,effects:[{kind:`damage`,multiplier:1.45,on:`hits`},{kind:`status`,status:`BLEED`,duration:2,value:8,on:`hits`}]},"alpha-howl":{id:`alpha-howl`,name:`HOWL`,desc:`Squad pressure. Nearby allies gain ATK and SPD for 2 turns.`,slot:`A3`,cooldownMax:4,targetType:`ALLY_AOE`,minRange:0,maxRange:0,radius:2,effects:[{kind:`status`,status:`ATK_UP`,duration:2,value:.3,on:`aoe_allies`},{kind:`status`,status:`SPD_UP`,duration:2,value:.3,on:`aoe_allies`}]},"u02-shot":{id:`u02-shot`,name:`THRUST`,desc:`Polearm reach strike. Range 3.`,slot:`A1`,cooldownMax:0,targetType:`ENEMY_SINGLE`,minRange:1,maxRange:3,radius:0,effects:[{kind:`damage`,multiplier:1,on:`hits`}]},"u02-burst":{id:`u02-burst`,name:`LUNGE`,desc:`Heavy reach hit. Range 3.`,slot:`A2`,cooldownMax:3,targetType:`ENEMY_SINGLE`,minRange:1,maxRange:3,radius:0,effects:[{kind:`damage`,multiplier:1.55,on:`hits`}]},"u02-suppress":{id:`u02-suppress`,name:`PRESSURE`,desc:`Reach control. Lowers enemy ATK for 2 turns.`,slot:`A3`,cooldownMax:3,targetType:`ENEMY_SINGLE`,minRange:1,maxRange:3,radius:0,effects:[{kind:`damage`,multiplier:.7,on:`hits`},{kind:`status`,status:`ATK_DOWN`,duration:2,value:.3,on:`hits`}]},"u02-lunge-vanguard":{id:`u02-lunge-vanguard`,name:`LUNGE`,slot:`A2`,desc:`VANGUARD: commit to range 1. Heavy hit; gain 50% initiative speed for 2 turns.`,cooldownMax:3,targetType:`ENEMY_SINGLE`,minRange:1,maxRange:1,radius:0,effects:[{kind:`damage`,multiplier:1.55,on:`hits`},{kind:`status`,status:`SPD_UP`,duration:2,value:.5,on:`self`}]},"u02-pressure-disruptor":{id:`u02-pressure-disruptor`,name:`PRESSURE`,slot:`A3`,desc:`DISRUPTOR: range 3. No damage; lower enemy ATK by 30% and initiative speed by 40% for 2 turns.`,cooldownMax:3,targetType:`ENEMY_SINGLE`,minRange:1,maxRange:3,radius:0,effects:[{kind:`status`,status:`ATK_DOWN`,duration:2,value:.3,on:`hits`},{kind:`status`,status:`SPD_DOWN`,duration:2,value:.4,on:`hits`}]},"u03-tap":{id:`u03-tap`,name:`SWEEP`,desc:`Staff contact. Range 2.`,slot:`A1`,cooldownMax:0,targetType:`ENEMY_SINGLE`,minRange:1,maxRange:2,radius:0,effects:[{kind:`damage`,multiplier:.75,on:`hits`}]},"u03-mend":{id:`u03-mend`,name:`MEND`,desc:`Restore HP to one ally.`,slot:`A2`,cooldownMax:2,targetType:`ALLY_SINGLE`,minRange:0,maxRange:3,radius:0,effects:[{kind:`heal`,base:32,scale:.4,on:`primary`}]},"u03-pack":{id:`u03-pack`,name:`PACK SUPPORT`,desc:`Group mend. Nearby allies gain DEF for 2 turns.`,slot:`A3`,cooldownMax:4,targetType:`ALLY_AOE`,minRange:0,maxRange:0,radius:2,effects:[{kind:`heal`,base:18,scale:.2,on:`aoe_allies`},{kind:`status`,status:`DEF_UP`,duration:2,value:.4,on:`aoe_allies`}]},"u03-mend-restorer":{id:`u03-mend-restorer`,name:`MEND`,slot:`A2`,desc:`RESTORER: heal SHADOW and allies within 1 cell. Replaces the range-3 single-target heal.`,cooldownMax:2,targetType:`ALLY_AOE`,minRange:0,maxRange:0,radius:1,effects:[{kind:`heal`,base:32,scale:.4,on:`aoe_allies`}]},"u03-pack-warden":{id:`u03-pack-warden`,name:`PACK SUPPORT`,slot:`A3`,desc:`WARDEN: protect SHADOW and allies within 2 cells for 2 turns. Halves incoming damage; no healing or DEF boost.`,cooldownMax:4,targetType:`ALLY_AOE`,minRange:0,maxRange:0,radius:2,effects:[{kind:`status`,status:`GUARD`,duration:2,value:.5,on:`aoe_allies`}]},"hound-fortify":{id:`hound-fortify`,name:`BULWARK GUARD`,desc:`Protect the frontline by reducing incoming damage.`,slot:`A2`,cooldownMax:3,targetType:`SELF`,minRange:0,maxRange:0,radius:0,effects:[{kind:`status`,status:`GUARD`,duration:2,value:.5,on:`self`}]},"hound-pulse":{id:`hound-pulse`,name:`PULSE SHOT`,desc:`Medium-to-long range signal pulse. Weak at close quarters.`,slot:`A1`,cooldownMax:0,targetType:`ENEMY_SINGLE`,minRange:2,maxRange:4,radius:0,effects:[{kind:`damage`,multiplier:.85,on:`hits`}]},"hound-aim":{id:`hound-aim`,name:`TARGET LOCK`,desc:`Precise ranged attack which marks a vulnerable target.`,slot:`A2`,cooldownMax:3,targetType:`ENEMY_SINGLE`,minRange:2,maxRange:4,radius:0,effects:[{kind:`damage`,multiplier:1.2,on:`hits`},{kind:`status`,status:`DEF_DOWN`,duration:2,value:.2,on:`hits`}]},"hound-interference":{id:`hound-interference`,name:`SIGNAL JAM`,desc:`Jams one squad member and weakens their attack and speed.`,slot:`A2`,cooldownMax:3,targetType:`ENEMY_SINGLE`,minRange:1,maxRange:3,radius:0,effects:[{kind:`damage`,multiplier:.35,on:`hits`},{kind:`status`,status:`ATK_DOWN`,duration:2,value:.25,on:`hits`},{kind:`status`,status:`SPD_DOWN`,duration:2,value:.2,on:`hits`}]},"hostile-strike":{id:`hostile-strike`,name:`STRIKE`,desc:`Melee contact.`,slot:`A1`,cooldownMax:0,targetType:`ENEMY_SINGLE`,minRange:1,maxRange:1,radius:0,effects:[{kind:`damage`,multiplier:1,on:`hits`}]},"hostile-maul":{id:`hostile-maul`,name:`MAUL`,desc:`Heavy melee. Lowers ATK for 1 turn.`,slot:`A2`,cooldownMax:3,targetType:`ENEMY_SINGLE`,minRange:1,maxRange:1,radius:0,effects:[{kind:`damage`,multiplier:1.3,on:`hits`},{kind:`status`,status:`ATK_DOWN`,duration:1,value:.25,on:`hits`}]},"leader-strike":{id:`leader-strike`,name:`STRIKE`,desc:`Heavy melee contact.`,slot:`A1`,cooldownMax:0,targetType:`ENEMY_SINGLE`,minRange:1,maxRange:1,radius:0,effects:[{kind:`damage`,multiplier:1,on:`hits`}]},"leader-crush":{id:`leader-crush`,name:`CRUSH`,desc:`Devastating melee blow.`,slot:`A2`,cooldownMax:3,targetType:`ENEMY_SINGLE`,minRange:1,maxRange:1,radius:0,effects:[{kind:`damage`,multiplier:1.5,on:`hits`}]},"leader-intimidate":{id:`leader-intimidate`,name:`INTIMIDATE`,desc:`Tactical pressure. Lowers target ATK for 2 turns.`,slot:`A3`,cooldownMax:4,targetType:`ENEMY_SINGLE`,minRange:1,maxRange:2,radius:0,effects:[{kind:`damage`,multiplier:.55,on:`hits`},{kind:`status`,status:`ATK_DOWN`,duration:2,value:.3,on:`hits`}]}};function Zt(e){let t=Xt[e];if(!t)throw Error(`Unknown skill ${e}`);return t}function Qt(e){return e.skillIds.map(t=>at(Zt(t),e.growth))}function $t(e,t){return Math.max(0,e.cooldowns[t]??0)}function en(e,t){return $t(e,t.id)<=0}function tn(e,t,n){return e.map(e=>e.id===t?n(e):e)}function nn(e,t,n,r){let i=e.units.find(t=>t.id===e.activeId);if(!i||i.defeated||i.hasActed)return{state:e,events:[],ok:!1,reason:`no-actor`};if(!i.skillIds.includes(t))return{state:e,events:[],ok:!1,reason:`unknown-skill`};let a=at(Zt(t),i.growth);if(!en(i,a))return{state:e,events:[],ok:!1,reason:`cooldown`};if(Ut(a)&&!n&&!r)return{state:e,events:[],ok:!1,reason:`need-target`};let o=Vt(e.units,i,a,n,r);if(Ut(a)&&o.length===0)return{state:e,events:[],ok:!1,reason:`invalid-target`};!Ut(a)&&a.targetType!==`SELF`&&o.length;let s=[],c=e.units.map(e=>({...e,statuses:e.statuses.map(e=>({...e})),cooldowns:{...e.cooldowns}})),l=e.hostilesEliminated,u=e.damageTaken,d=n?c.find(e=>e.id===n):o[0],f=xt(i),p=d?(e=>c.find(t=>t.id===e)?.name??e)(d.id):a.targetType===`SELF`?i.name:`squad`;s.push({type:`ticker`,text:`${i.name}  ·  ${a.name}${p&&p!==i.name?`  →  ${p}`:``}`});let m=e=>{if(e===`self`)return[c.find(e=>e.id===i.id)];if(e===`primary`){let e=d?c.find(e=>e.id===d.id):c.find(e=>e.id===i.id);return e?[e]:[]}return e===`aoe_allies`?o.filter(e=>e.team===i.team).map(e=>c.find(t=>t.id===e.id)):e===`aoe_enemies`?o.filter(e=>e.team!==i.team).map(e=>c.find(t=>t.id===e.id)):o.map(e=>c.find(t=>t.id===e.id)).filter(Boolean)};for(let e of a.effects){let t=m(e.on??`hits`).filter(Boolean);for(let n of t){let t=c.find(e=>e.id===n.id);if(t&&!t.defeated){if(e.kind===`damage`){let n=Dt(f,e.multiplier??1,t);n=Math.max(1,Math.round(n*wt(t)));let r=Math.max(0,t.hp-n),i=r<=0;t.team===`ally`&&(u+=n),i&&t.team===`enemy`&&!t.defeated&&(l+=1),c=tn(c,t.id,e=>({...e,hp:r,defeated:i,statuses:i?[]:e.statuses})),s.push({type:`damage`,unitId:t.id,amount:n,text:`-${n}`,kind:`dmg`}),i&&s.push({type:`defeat`,unitId:t.id,text:`DOWN`,kind:`info`})}else if(e.kind===`heal`){let n=Ot(e.base??0,e.scale??0,f,t);n>0&&(c=tn(c,t.id,e=>({...e,hp:Math.min(e.maxHp,e.hp+n)})),s.push({type:`heal`,unitId:t.id,amount:n,text:`+${n}`,kind:`heal`}))}else if(e.kind===`status`&&e.status){let n=e.duration??1,r=e.value??0,i=yt(t,e.status,a.id,n,r);c=tn(c,t.id,()=>i.unit),s.push({type:`status`,unitId:t.id,text:Tt[e.status],kind:e.status===`GUARD`?`guard`:`status`})}}}}return c=tn(c,i.id,t=>({...t,hasActed:!0,cooldowns:{...t.cooldowns,[a.id]:a.cooldownMax+de(e.directive,i,a)}})),a.cooldownMax>0&&s.push({type:`cooldown`,unitId:i.id,text:a.name}),{state:{...e,healingActions:(e.healingActions||0)+(i.team===`ally`&&a.effects.some(e=>e.kind===`heal`)?1:0),units:c,hostilesEliminated:l,damageTaken:u,actionSkillId:null,mode:`locked`},events:s,ok:!0}}function rn(e,t){return Qt(t).map(n=>{let r=$t(t,n.id),i=r<=0;return{...n,desc:de(e.directive,t,n)?`${n.desc} Disrupted Support: cooldown +${de(e.directive,t,n)}.`:n.desc,ready:i,cd:r,targets:i?Ht(e.units,t,n):[]}})}function an(e,t){return zt(t,e.team===`ally`?`enemy`:`ally`)}function on(e,t){return zt(t,e.team)}function sn(e){let t=0;return e.role===`alpha`&&(t+=40),e.role===`support`&&(t+=12),t+=(1-e.hp/e.maxHp)*30,t+=xt(e)*.4,t}function cn(e,t,n){if(!t.length)return null;let r=[...t].sort((t,n)=>e.archetype===`DISRUPTOR`?Number(n.role===`support`)-Number(t.role===`support`)||sn(n)-sn(t):e.archetype===`MARKSMAN`?sn(n)-sn(t)||At(e,n)-At(e,t):e.role===`leader`?sn(n)-sn(t)||t.hp-n.hp:t.hp-n.hp||At(e,t)-At(e,n));return(r.filter(t=>Rt(e,t,n))[0]??r[0])||null}function ln(e,t,n,r){if(Rt(e,r,n))return null;let i=Ft(e,t),a=null,o=1e9;for(let t of i){let i=At(t,r),s=(i>=n.minRange&&i<=n.maxRange?0:100)+(e.archetype===`MARKSMAN`?Math.abs(i-Math.max(2,n.maxRange-1)):i);s<o&&(o=s,a=t)}return a}function un(e,t){let n=e.objective;if(n?.type!==`INTERCEPT`||n.targetId!==t.id)return null;let r=new Map,i=e=>`${e.c},${e.r}`,a=new Set(e.units.filter(e=>!e.defeated&&e.id!==t.id).map(i)),o=[{...n.exit,d:0}];r.set(i(n.exit),0);for(let e=0;e<o.length;e++){let t=o[e];for(let[e,n]of[[1,0],[-1,0],[0,1],[0,-1]]){let s={c:t.c+e,r:t.r+n,d:t.d+1};!kt(s.c,s.r)||a.has(i(s))||r.has(i(s))||(r.set(i(s),s.d),o.push(s))}}if(!t.hasMoved){let n=Ft(t,e.units).filter(e=>(r.get(i(e))??1/0)<(r.get(i(t))??1/0));if(n.sort((e,t)=>(r.get(i(e))??1/0)-(r.get(i(t))??1/0)),n[0])return{type:`move`,to:n[0]}}let s=rn(e,t).find(e=>e.ready&&e.slot===`A1`),c=s&&Ht(e.units,t,s)[0];return c?{type:`skill`,skillId:s.id,targetId:c}:{type:`skip`}}function dn(e){let t=e.units.find(t=>t.id===e.activeId);if(!t||t.defeated||t.team!==`enemy`)return{type:`skip`};let n=un(e,t);if(n)return n;let r=rn(e,t).filter(e=>e.ready);if(t.archetype===`MARKSMAN`&&!t.hasMoved&&an(t,e.units).some(e=>At(t,e)<=1)){let n=Ft(t,e.units).map(n=>({cell:n,d:Math.min(...an(t,e.units).map(e=>At(n,e)))})).sort((e,t)=>t.d-e.d||e.cell.c-t.cell.c||e.cell.r-t.cell.r);if(n[0]?.d>1)return{type:`move`,to:n[0].cell}}let i=an(t,e.units);if(!i.length)return{type:`skip`};let a=[...r].sort((e,n)=>{let r={A3:0,A2:1,A1:2}[e.slot]-{A3:0,A2:1,A1:2}[n.slot];return t.role===`leader`&&e.id.includes(`intimidate`)&&n.slot!==`A3`?-1:r});for(let n of a){if(n.targetType===`SELF`||n.targetType===`ALLY_AOE`||n.targetType===`ENEMY_AOE`){if(n.targetType===`ALLY_AOE`&&on(t,e.units).filter(e=>e.hp<e.maxHp*.85).length===0&&n.effects.every(e=>e.kind!==`damage`))continue;return t.hasMoved,{type:`skill`,skillId:n.id}}let a=cn(t,i,n);if(a){if(Rt(t,a,n))return{type:`skill`,skillId:n.id,targetId:a.id};if(!t.hasMoved){let i=ln(t,e.units,n,a);if(i){let e={...t,c:i.c,r:i.r};if(Rt(e,a,n))return{type:`move`,to:i,then:{type:`skill`,skillId:n.id,targetId:a.id}};let o=r.find(e=>e.slot===`A1`)??n;return Rt(e,a,o)?{type:`move`,to:i,then:{type:`skill`,skillId:o.id,targetId:a.id}}:{type:`move`,to:i}}}}}if(!t.hasMoved){let n=[...i].sort((e,t)=>sn(t)-sn(e))[0],a=Ft(t,e.units),o=null,s=At(t,n);for(let e of a){let t=At(e,n);t<s&&(s=t,o=e)}if(o){let e={...t,c:o.c,r:o.r},n=r.find(e=>e.slot===`A1`);if(n){let t=cn(e,i,n);if(t&&Rt(e,t,n))return{type:`move`,to:o,then:{type:`skill`,skillId:n.id,targetId:t.id}}}return{type:`move`,to:o}}}return{type:`skip`}}function fn(e,t){let n=e.units.find(t=>t.id===e.activeId);if(!n)return!1;if(t.type===`skip`)return!0;if(t.type===`move`)return Ft(n,e.units).some(e=>e.c===t.to.c&&e.r===t.to.r);if(t.type===`skill`){let r=Zt(t.skillId);return!n.skillIds.includes(r.id)||!en(n,r)?!1:!Ut(r)||Ht(e.units,n,r).includes(t.targetId??``)}return!1}function pn(e){if(e.team!==`enemy`)return null;if(e.id===`courier`||e.defId===`signal-courier`)return`COURIER`;if(e.role===`leader`||e.id===`leader`)return`COMMANDER`;if(/reinforcement/.test(e.id))return`SKIRMISHER`;let t=e.id.match(/(?:^|[^a-z])h(\d+)(?:$|[^a-z])/i);return[`BULWARK`,`MARKSMAN`,`DISRUPTOR`,`SKIRMISHER`][((t?Number(t[1]):1)-1)%4]}function mn(e,t){return t===`COURIER`?{...e,move:Math.max(e.move,2),skillIds:[`hostile-strike`]}:t===`COMMANDER`?{...e,skillIds:[`leader-strike`,`leader-crush`,`leader-intimidate`]}:t===`BULWARK`?{...e,name:`HOUND BULWARK`,hp:Math.round(e.hp*1.35),def:e.def+5,move:1,skillIds:[`hostile-strike`,`hound-fortify`]}:t===`MARKSMAN`?{...e,name:`HOUND MARKSMAN`,hp:Math.round(e.hp*.88),move:2,skillIds:[`hound-pulse`,`hound-aim`]}:t===`DISRUPTOR`?{...e,name:`HOUND DISRUPTOR`,hp:Math.round(e.hp*.95),skillIds:[`hostile-strike`,`hound-interference`]}:{...e,name:`HOUND SKIRMISHER`,hp:Math.round(e.hp*.85),spd:e.spd+3,move:Math.max(3,e.move),skillIds:[`hostile-strike`,`hostile-maul`]}}function hn(e){return Number.isInteger(e.cols)&&Number.isInteger(e.rows)&&e.cols>=3&&e.rows>=3&&e.cols<=24&&e.rows<=16}function gn(e,t){return t.c>=0&&t.c<e.cols&&t.r>=0&&t.r<e.rows&&Number.isInteger(t.c)&&Number.isInteger(t.r)}function _n(e,t,n){if(!hn(t)||!hn(n)||!gn(t,e))throw Error(`invalid topology or source point`);return{c:Math.round(e.c*(n.cols-1)/(t.cols-1)),r:Math.round(e.r*(n.rows-1)/(t.rows-1))}}var vn=`https://res.cloudinary.com/dnjwvxinh/image/upload`;function yn(){return typeof window>`u`?null:window}function bn(e){return String(e??``).trim()}function xn(...e){for(let t of e){let e=bn(t);if(e)return e}return``}function Sn(e){return bn(e).toLowerCase().replace(/[^\w]+/g,`_`).replace(/^_+|_+$/g,``)}function Cn(e){let t=bn(e),n=t.match(/\/assets\/(skins|equip|items)\/([^/?#]+)/i);return n?`${vn}/f_auto,q_auto/${n[1]}/${n[2]}`:t}function wn(e){return e?!!(e.startsWith(`blob:`)||e.startsWith(`data:`)||/^https?:\/\//i.test(e)||e.startsWith(`/`)):!1}function Tn(e,t){if(!e||typeof e!=`object`)return null;let n=e;if(n.empty===!0)return null;let r=xn(n.item_key,n.itemKey,n.key,n.item),i=xn(n.name,n.label,r);if(!r&&!i)return null;let a=xn(n.icon,n.img,n.image,n.image_path,n.imageUrl,n.url);return{slot:t,key:r||Sn(i),name:i||r,icon:Cn(a)||En(r||i),rarity:xn(n.rarity,`common`)}}function En(e){let t=Sn(e);return t?`${vn}/f_auto,q_auto/equip/${t}.png`:``}function Dn(e){let t=Sn(e);return t?`${vn}/f_auto,q_auto/skins/${t}.webp`:``}function On(e){let t=`${e?.key||``} ${e?.name||``}`.toLowerCase();return/axe|cleaver|chop|hatchet/.test(t)?`axe`:/spear|pike|pole|glaive|halberd|lance/.test(t)?`spear`:/staff|rod|scepter|wand|signal/.test(t)?`staff`:/hammer|mace|maul|gavel/.test(t)?`hammer`:/claw|fang|gauntlet|fist|knuckle/.test(t)?`claw`:/blade|sword|saber|omen|edge|fangblade|knife|dagger/.test(t)?`blade`:`melee`}function kn(e){return e===`melee`?`MELEE KIT`:e.toUpperCase()}function An(e,t){if(!e)return null;let n=(Array.isArray(e.slots)?e.slots:[]).find(e=>Sn(e?.slot)===t);if(n)return Tn(n,t);let r=e.equippedBySlot||e.equipped||{};if(r&&typeof r==`object`){let e=r[t];if(e)return Tn(e,t)}let i=(Array.isArray(e.loadout)?e.loadout:[]).find(e=>Sn(e?.slot)===t);return i?Tn(i,t):null}function jn(){let e=yn();if(!e)return null;let t=e.Equipped;return t&&t.state&&typeof t.state==`object`?t.state:e.__AH_EQUIPPED_STATE__&&typeof e.__AH_EQUIPPED_STATE__==`object`?e.__AH_EQUIPPED_STATE__:null}function Mn(){let e=yn();if(!e)return{};let t=e.__PROFILE__||e.PROFILE||e.profileState||e.lastProfile||{};return t&&typeof t==`object`?t:{}}function Nn(){let e=yn(),t=Mn(),n=``,r=``,i=``;try{let t=e?.document&&e.document.getElementById(`player-skin`);if(t){let e=t;n=xn(e.currentSrc,e.src),r=xn(e.dataset?.skinKey,e.getAttribute?.(`data-skin-key`)),i=xn(e.alt)}}catch{}let a=t.skin;if(typeof a==`string`)n=n||a;else if(a&&typeof a==`object`){let e=a;n=n||xn(e.img,e.url,e.preview_url,e.previewUrl),r=r||xn(e.key,e.skinKey,e.skin_key),i=i||xn(e.name,e.label)}return r=r||xn(t.skinKey,t.skin_key,t.activeSkin?.key),n=n||xn(t.heroImg,t.heroPng,t.character,t.characterPng,t.activeSkin?.img),!n&&r&&(n=`/assets/skins/${Sn(r)}.webp`),i.toLowerCase()===`alpha husky skin`&&(i=``),!i&&r&&(i=r.replace(/[_-]+/g,` `).replace(/\bskin\b/gi,``).trim()),{url:n,key:Sn(r),name:i}}function Pn(){let e=yn();if(!e)return``;let t=bn(e.__EquippedCharImgUrl);if(t)return t;try{let t=e.document&&e.document.getElementById(`equipped-character-img`),n=xn(t?.currentSrc,t?.src);if(wn(n))return n}catch{}return``}function Fn(e){let t=e?.weapon??null,n=e?.armor??null,r=e?.weaponClass||On(t),i=(e?.skinName||``).trim(),a=t?.name||kn(r),o=n?.name||``,s=[i,t?.name?t.name:kn(r)].filter(Boolean);return{unitName:e?.unitName||`ALPHA`,nickname:e?.nickname||``,skinKey:e?.skinKey||``,skinName:i,skinUrl:e?.skinUrl||``,portraitUrl:e?.portraitUrl||`/images/tactical_ops/alpha-portrait.jpg`,spriteUrl:e?.spriteUrl||`/images/tactical_ops/alpha.png`,attackSpriteUrl:e?.attackSpriteUrl||`/images/tactical_ops/alpha-attack.png`,weapon:t,armor:n,weaponClass:r,weaponLabel:a,armorLabel:o,summary:s.join(`  ·  `)||`ALPHA  ·  MELEE KIT`,source:e?.source||`fallback`,live:e?.live===!0}}function In(){let e=Mn(),t=jn(),n=Nn(),r=Pn(),i=xn(e.nickname,e.name,e.displayName),a=i?i.toUpperCase():`ALPHA`,o=An(t,`weapon`)||An(e,`weapon`),s=An(t,`armor`)||An(e,`armor`),c=wn(n.url)?Cn(n.url):n.key?Dn(n.key):``,l=wn(c)?c:``,u=wn(r)?r:``,d=`fallback`,f=se;u?(f=u,d=`character-image`):l?(f=l,d=`skin`):(o||s)&&(d=`equipped`),d===`fallback`&&(o||s||n.key)&&(d=`equipped`);let p=d!==`fallback`||!!(o||s||n.key||i);return Fn({unitName:a,nickname:i,skinKey:n.key,skinName:n.name||(n.key?n.key.replace(/_+/g,` `):``),skinUrl:c,portraitUrl:f,spriteUrl:ae,attackSpriteUrl:oe,weapon:o,armor:s,source:d,live:p})}function Ln(e,t){return!t||e.defId!==`alpha`&&e.id!==`alpha`?e:{...e,name:t.unitName||e.name,portrait:t.portraitUrl||e.portrait,sprite:t.spriteUrl||e.sprite,attackSprite:t.attackSpriteUrl||e.attackSprite}}async function Rn(){let e=yn();if(!e)return!1;if(jn())return!0;let t=e.apiPost||e.S?.apiPost;try{if(typeof t==`function`){let n=await t(`/webapp/equipped/state`,{}),r=n&&(n.data||n.state||n);if(n&&(n.ok===!0||r?.slots)){e.__AH_EQUIPPED_STATE__=r;let t=e.Equipped;return t&&typeof t==`object`&&!t.state&&(t.state=r),!0}}}catch{}return!1}function zn(e){let t=yn();if(e&&t&&(t.__AH_TO_IDENTITY__=e),t&&t.__AH_TO_IDENTITY__)return t.__AH_TO_IDENTITY__;let n=In();return t&&(t.__AH_TO_IDENTITY__=n),n}var Bn={cols:8,rows:5},Vn={cols:10,rows:7},Hn=e=>M?_n(e,Bn,Vn):{...e};function Un(e){return{...e,statuses:e.statuses.map(e=>({...e})),cooldowns:{...e.cooldowns}}}function Wn(e,t,n,r,i,a){let o=a||E[e];if(!o)throw Error(`Unknown unit def ${e}`);let s=M?pn({id:t,defId:o.defId,role:o.role,team:o.team}):null,c=s?mn(o,s):o,l={};for(let e of c.skillIds)l[e]=0;let u={id:t,...s?{archetype:s}:{},defId:c.defId,name:c.name,team:c.team,role:c.role,hp:c.hp,maxHp:c.hp,atk:c.atk,def:c.def,spd:c.spd,move:c.move,recoverRange:c.recoverRange,c:n,r,statuses:[],cooldowns:l,meter:0,hasMoved:!1,hasActed:!1,defeated:!1,sprite:c.sprite,attackSprite:c.attackSprite,portrait:c.portrait,skillIds:[...c.skillIds],combatMastery:c.combatMastery?{...c.combatMastery}:void 0};return c.defId===`alpha`&&i?{...Ln(u,i),weaponIcon:i.weapon?.icon||``,identitySource:i.source}:u}function Gn(e,t=D,n=null,r=null,i=null,a=null,o){_t();let s=t.map(e=>({...e,...Hn(e)})),c=new Set;for(let e of s){let t=e.c+`,`+e.r;if(c.has(t))throw Error(`Battlefield spawn collision at `+t);c.add(t)}let l=o?rt(o):null,u=s.map(t=>{let n=Wn(t.defId,t.id,t.c,t.r,e,t.unitDef),r=l?.heroes.find(e=>e.heroId===n.defId&&n.team===`ally`);return r?{...n,growth:{...r,ranks:{...r.ranks}}}:n});return{units:u,activeId:null,inspectId:null,actionSkillId:null,mode:`idle`,round:1,unitTurn:0,actionsLeftInRound:zt(u).length,outcome:`ongoing`,damageTaken:0,healingActions:0,hostilesEliminated:0,results:null,objective:n?(()=>{let e=structuredClone(n);return(e.type===`RECOVER`||e.type===`HOLD`)&&e.terminal&&(e.terminal=Hn(e.terminal)),e.type===`INTERCEPT`&&(e.exit=Hn(e.exit)),e})():null,reinforcement:r?{...r,spawn:{...r.spawn,...Hn(r.spawn)}}:null,signalCarrierId:i,directive:a?structuredClone(a):null,routingTraceAcquired:!1,seed:1}}function Kn(e){return e.filter(e=>e.team===`ally`).length}function qn(e){if(e.outcome!==`ongoing`)return e;let t=e.signalCarrierId&&!e.routingTraceAcquired&&e.units.find(t=>t.id===e.signalCarrierId)?.defeated===!0&&zt(e.units,`enemy`).length>0?{...e,routingTraceAcquired:!0}:e,n=zt(t.units,`ally`),r=zt(t.units,`enemy`),i=Kn(t.units),a=pe(t);if(t=a.state,a.result){let e=a.result===`victory`,r={victory:e,turns:t.round,hostilesEliminated:t.hostilesEliminated,squadStanding:n.length,squadDeployed:i,damageTaken:t.damageTaken,bonesRecovered:0,objectiveComplete:e};return{...t,outcome:a.result,results:r,mode:`locked`,activeId:null,actionSkillId:null}}if(t.objective?.type===`BOSS`&&t.units.find(e=>e.id===t.objective.targetId)?.defeated||t.objective?.type===`RECOVER`&&t.objective.completed){let e={victory:!0,turns:t.round,hostilesEliminated:t.hostilesEliminated,squadStanding:n.length,squadDeployed:i,damageTaken:t.damageTaken,bonesRecovered:0,objectiveComplete:!0};return{...t,outcome:`victory`,results:e,mode:`locked`,activeId:null,actionSkillId:null}}if(r.length===0&&!t.objective){let e={victory:!0,turns:t.round,hostilesEliminated:t.hostilesEliminated,squadStanding:n.length,squadDeployed:i,damageTaken:t.damageTaken,bonesRecovered:18+t.hostilesEliminated*6};return{...t,outcome:`victory`,results:e,mode:`locked`,activeId:null,actionSkillId:null}}if(n.length===0){let e={victory:!1,turns:t.round,hostilesEliminated:t.hostilesEliminated,squadStanding:0,squadDeployed:i,damageTaken:t.damageTaken,bonesRecovered:0};return{...t,outcome:`defeat`,results:e,mode:`locked`,activeId:null,actionSkillId:null}}return t}function Jn(e){let t={};for(let[n,r]of Object.entries(e.cooldowns))t[n]=Math.max(0,(r??0)-1);return{...e,cooldowns:t}}function Yn(e,t){let n=[],r=e.units.map(Un),i=e.hostilesEliminated,a=e.damageTaken;r=r.map(e=>{if(e.id!==t||e.defeated)return e;let r=Jn(e),o=[];for(let e of r.statuses){if(e.type===`BLEED`){let t=Math.max(1,Math.round(e.value)),o=Math.max(0,r.hp-t),s=o<=0;if(r.team===`ally`&&(a+=t),s&&r.team===`enemy`&&!r.defeated&&(i+=1),n.push({type:`damage`,unitId:r.id,amount:t,text:`-${t}`,kind:`dmg`}),n.push({type:`ticker`,text:`${r.name}  ·  BLEED`}),s)return n.push({type:`defeat`,unitId:r.id,text:`DOWN`,kind:`info`}),{...r,hp:o,defeated:!0,statuses:[]};r={...r,hp:o}}let t=e.duration-1;t<=0?n.push({type:`expire`,unitId:r.id,text:`${Tt[e.type]} ended`,kind:`info`}):o.push({...e,duration:t})}return{...r,statuses:o,hasMoved:!1,hasActed:!1}});let o={...e,units:r,hostilesEliminated:i,damageTaken:a,activeId:t,inspectId:null,actionSkillId:null,mode:`selected`};o=qn(o);let s=o.units.find(e=>e.id===t);return(o.outcome!==`ongoing`||!s||s.defeated)&&(o={...o,activeId:s&&!s.defeated?o.activeId:null,mode:`locked`}),{state:o,events:n}}function Xn(e){if(e.outcome!==`ongoing`)return{state:e,events:[]};let t=Kt(e.units.map(Un)),n=qt(t);if(!n)return{state:e,events:[]};t=t.map(e=>e.id===n?Jt(e):e);let r=e.actionsLeftInRound,i=e.round;r<=0&&(i+=1,r=Math.max(1,zt(t).length)),--r;let a=Yn({...e,units:t,unitTurn:e.unitTurn+1,round:i,actionsLeftInRound:r,mode:`locked`},n),o=a.state,s=[...a.events],c=o.reinforcement;if(o.outcome===`ongoing`&&c&&!c.spawned&&o.round>=c.triggerRound){let e=c.spawn;if(o.directive?.reinforcement){let t=Array.from({length:N*pt},(e,t)=>({c:t%N,r:Math.floor(t/N)})).filter(e=>It(o.units,e.c,e.r)).sort((t,n)=>Math.abs(t.c-e.c)+Math.abs(t.r-e.r)-(Math.abs(n.c-e.c)+Math.abs(n.r-e.r)));if(!t.length)return{state:o,events:s};e={...e,...t[0]}}let t=Wn(e.defId,e.id,e.c,e.r);o={...o,units:[...o.units,t],reinforcement:{...c,spawned:!0}},s.push({type:`ticker`,text:`REINFORCEMENT INBOUND · HOUND MK-2`})}let l=o.units.find(e=>e.id===n);return o.outcome===`ongoing`&&(!l||l.defeated)?Xn({...o,activeId:null}):{state:o,events:s}}function Zn(e,t=D,n=null,r=null,i=null,a=null,o){return Xn(Gn(e,t,n,r,i,a,o))}function Qn(e){let t=e.units.find(t=>t.id===e.activeId),n=e.objective;return!n||n.type!==`RECOVER`||n.completed||!t||t.team!==`ally`||t.defeated||t.hasActed?!1:ue(e)&&Math.abs(t.c-n.terminal.c)+Math.abs(t.r-n.terminal.r)<=(t.recoverRange||1)}function $n(e){if(!Qn(e))return{state:e,events:[],ok:!1};let t=e.units.find(t=>t.id===e.activeId),n=e.units.map(e=>e.id===t.id?{...e,hasActed:!0}:e);return{state:qn({...e,units:n,objective:{...e.objective,completed:!0},actionSkillId:null,mode:`locked`}),ok:!0,events:[{type:`status`,unitId:t.id,text:`SIGNAL RECOVERED`,kind:`info`},{type:`ticker`,text:`OBJECTIVE COMPLETE · SIGNAL RECOVERED`}]}}function er(e,t,n){let r=e.units.find(t=>t.id===e.activeId);if(!r||r.defeated||r.hasMoved||r.hasActed||!It(e.units,t,n,r.id)||!Ft(r,e.units).some(e=>e.c===t&&e.r===n))return{state:e,events:[],ok:!1};let i=e.units.map(e=>e.id===r.id?{...e,c:t,r:n,hasMoved:!0}:e);return{state:qn({...e,units:i,inspectId:null}),events:[{type:`move`,unitId:r.id,text:`${r.name}  ·  repositions`},{type:`ticker`,text:`${r.name}  ·  repositions`}],ok:!0}}function tr(e){let t=e.units.find(t=>t.id===e.activeId);if(!t||t.defeated||t.hasActed)return{state:e,events:[],ok:!1};let n=e.units.map(e=>e.id===t.id?{...e,hasActed:!0}:e);return{state:{...e,units:n,actionSkillId:null,mode:`locked`},events:[{type:`ticker`,text:`${t.name}  ·  holds`}],ok:!0}}function nr(e,t,n,r){let i=nn(e,t,n,r);return i.ok?{...i,state:qn(i.state)}:i}function rr(e,t){if(!fn(e,t)&&t.type!==`skip`){let t=tr(e);return{state:t.state,events:t.events}}let n=[],r=e;if(t.type===`skip`){let e=tr(r);return{state:e.state,events:e.events}}if(t.type===`move`){let e=er(r,t.to.c,t.to.r);if(e.ok&&(r=e.state,n.push(...e.events)),r.outcome!==`ongoing`)return{state:r,events:n};if(t.then){let e=rr(r,t.then);return{state:e.state,events:[...n,...e.events]}}let i=tr(r);return{state:i.state,events:[...n,...i.events]}}if(t.type===`skill`){let e=nr(r,t.skillId,t.targetId,t.cell);if(e.ok)return{state:e.state,events:[...n,...e.events]};let i=tr(r);return{state:i.state,events:[...n,...i.events]}}return{state:r,events:n}}function ir(e){return dn(e)}function ar(e){let t=e.skillIds[0];return t?at(Zt(t),e.growth).maxRange:1}var or=c({BATTLEFIELD_LAB_KEY:()=>ft,BATTLEFIELD_VNEXT_PREVIEW:()=>M,DEF_CURVE:()=>50,GRID_COLS:()=>N,GRID_ROWS:()=>pt,METER_MAX:()=>100,STATUS_LABEL:()=>Tt,STATUS_SHORT:()=>Et,a1Range:()=>ar,advanceToNext:()=>Xn,aiUsesLegalRules:()=>fn,applyAi:()=>rr,applySkill:()=>nn,applyStatus:()=>yt,availableSkills:()=>rn,beginUnitTurn:()=>Yn,canOccupy:()=>It,canRecover:()=>Qn,cellKey:()=>jt,chebyshev:()=>At,chooseAiAction:()=>dn,computeHeal:()=>Ot,consumeMeter:()=>Jt,cooldownLeft:()=>$t,createBattle:()=>Gn,effectiveAtk:()=>xt,effectiveDef:()=>St,effectiveSpd:()=>Ct,evaluateOutcome:()=>qn,fieldPercent:()=>Lt,hasStatus:()=>vt,inBounds:()=>kt,inSkillRange:()=>Rt,incomingDamageMultiplier:()=>wt,isLegalTargetType:()=>Wt,living:()=>zt,mitigatedDamage:()=>Dt,occupiedKeys:()=>Mt,pickReadyId:()=>qt,planAi:()=>ir,previewQueue:()=>Yt,reachableCells:()=>Ft,resetStatusSeq:()=>_t,resolveSkillTargets:()=>Vt,skillNeedsTargetPick:()=>Ut,skillReady:()=>en,startBattle:()=>Zn,tickUntilReady:()=>Kt,tryMove:()=>er,tryRecover:()=>$n,trySkill:()=>nr,trySkip:()=>tr,unitAt:()=>Nt,unitSkills:()=>Qt,unitsInRadius:()=>Bt,validTargetIds:()=>Ht}),sr=null,cr=!1;function lr(){if(typeof window>`u`)return null;if(!sr){let e=window.AudioContext||window.webkitAudioContext;if(!e)return null;sr=new e}return sr}function ur(){let e=lr();e&&e.state===`suspended`&&e.resume()}function dr(){return cr}function fr(e){cr=e;try{localStorage.setItem(`tactical-ops-mute`,e?`1`:`0`)}catch{}}function pr(){try{cr=localStorage.getItem(`tactical-ops-mute`)===`1`}catch{cr=!1}return cr}function mr(e,t,n,r=.05,i=0){if(cr)return;let a=lr();if(!a)return;let o=a.currentTime+i,s=a.createOscillator(),c=a.createGain();s.type=n,s.frequency.setValueAtTime(e,o),c.gain.setValueAtTime(1e-4,o),c.gain.exponentialRampToValueAtTime(r,o+.012),c.gain.exponentialRampToValueAtTime(1e-4,o+t),s.connect(c),c.connect(a.destination),s.start(o),s.stop(o+t+.02)}function hr(e){switch(e){case`select`:mr(620,.06,`triangle`,.03);break;case`ui`:mr(480,.05,`square`,.02);break;case`move`:mr(220,.08,`sine`,.03);break;case`hit`:mr(140,.1,`sawtooth`,.06),mr(90,.12,`square`,.03,.02);break;case`guard`:mr(360,.1,`triangle`,.04);break;case`heal`:mr(520,.1,`sine`,.04),mr(780,.12,`sine`,.03,.05);break;case`turn`:mr(180,.14,`triangle`,.04),mr(240,.12,`sine`,.03,.08);break;case`win`:mr(440,.16,`triangle`,.05),mr(660,.2,`triangle`,.045,.12);break;case`lose`:mr(160,.22,`sawtooth`,.04),mr(90,.28,`sine`,.04,.1);break;case`status`:mr(400,.08,`triangle`,.03)}}var gr={"ally-02":{name:`CNC`,trained:{name:`REACH CONTROL`,copy:`PRESSURE reaches 1 cell farther, including DISRUPTOR.`,effect:{slot:`A3`,range:1}},options:{A:{name:`RELENTLESS`,copy:`PRESSURE recharges 1 personal turn sooner.`,effect:{slot:`A3`,cooldown:-1}},B:{name:`PIN DOWN`,copy:`PRESSURE debuffs last 1 personal turn longer.`,effect:{slot:`A3`,statusDuration:1}}}},"ally-03":{name:`SHADOW`,trained:{name:`WIDE SHELTER`,copy:`PACK SUPPORT reaches allies 1 cell farther, including WARDEN.`,effect:{slot:`A3`,radius:1}},options:{A:{name:`STEADY HAND`,copy:`MEND recharges 1 personal turn sooner, including RESTORER.`,effect:{slot:`A2`,cooldown:-1}},B:{name:`SILENT SHELTER`,copy:`PACK SUPPORT keeps its protection but removes healing and ignores Disrupted Support's extra cooldown. MEND still counts as healing.`,effect:{slot:`A3`,noHealing:!0,ignoreDisruption:!0}}}},PET:{name:`PET`,trained:{name:`RELAY SCOUT`,copy:`RECOVER works from 2 cells away. Signal windows still apply.`,effect:{recoverRange:2}},options:{A:{name:`REACHING SNARE`,copy:`HAMSTRING reaches 1 cell farther; control a nearby threat without leaving your position.`,effect:{slot:`A2`,range:1}},B:{name:`PATHFINDER`,copy:`Move 1 extra cell per personal turn to reach objectives or regroup with SHADOW.`,effect:{move:1}}}}},_r=e=>{let t=e.startsWith(`pet:`)?`PET`:e;return Object.hasOwn(gr,t)?gr[t]:void 0},vr=(e,t)=>e?.[t]||{progress:0,stage:1,unlockedOptions:[],selected:null};function yr(e){if(!e||typeof e!=`object`)return{};let t={};for(let[n,r]of Object.entries(e)){if(!_r(n)||!r||typeof r!=`object`)continue;let e=r,i=Number.isInteger(e.progress)&&e.progress>=0?Math.min(8,e.progress):0,a=i>=8?3:i>=3?2:1;t[n]={progress:i,stage:a,unlockedOptions:a===3?[`A`,`B`]:[],selected:a===3?e.selected===`B`?`B`:`A`:null}}return t}function br(e,t){return e.map(e=>{let n=_r(e.id),r=vr(t,e.id);if(!n||r.stage<2)return e;let i=structuredClone(e.unitDef||E[e.defId]);i.combatMastery={progress:r.progress,stage:r.stage,selected:r.selected};let a=[n.trained,...r.stage>=3&&r.selected?[n.options[r.selected]]:[]];for(let{effect:e}of a)e.move&&(i.move+=e.move),e.recoverRange&&(i.recoverRange=e.recoverRange);return i.skillIds=i.skillIds.map(e=>{let t=Xt[e],i=a.filter(({effect:e})=>e.slot===t.slot);if(!i.length)return e;let o=`${e}:mastery:${n.name}:${r.stage}:${r.selected||`none`}`;if(!Xt[o]){let e=structuredClone(t);e.id=o;for(let{name:t,copy:n,effect:r}of i){e.maxRange+=r.range||0,e.radius+=r.radius||0,e.cooldownMax=Math.max(0,e.cooldownMax+(r.cooldown||0)),r.noHealing&&(e.effects=e.effects.filter(e=>e.kind!==`heal`)),r.ignoreDisruption&&(e.ignoreDisruption=!0);for(let t of e.effects)t.kind===`status`&&t.duration&&(t.duration+=r.statusDuration||0);e.desc+=` Mastery / ${t}: ${n}`}Xt[o]=e}return o}),{...e,unitDef:i}})}var xr={attack:3,defense:3,hp:12,initiative:1};function Sr(e,t){if(e.version!==1)return 0;let n=Number(e[t]);return Number.isFinite(n)?Math.max(0,Math.min(xr[t],Math.floor(n))):0}function Cr(e){let t=e&&typeof e==`object`?e:{};return{version:1,attack:Sr(t,`attack`),defense:Sr(t,`defense`),hp:Sr(t,`hp`),initiative:Sr(t,`initiative`)}}var wr=[`strength`,`agility`,`defense`,`vitality`,`intelligence`,`luck`];function Tr(e){if(!e||typeof e!=`object`||Array.isArray(e))throw Error(`invalid_combat_profile_v2`);return e}function Er(e,t){if(Object.keys(e).length!==t.length||!t.every(t=>Object.prototype.hasOwnProperty.call(e,t)))throw Error(`invalid_combat_profile_v2`)}function Dr(e,t,n){if(typeof e!=`number`||!Number.isInteger(e)||e<t||e>n)throw Error(`invalid_combat_profile_v2`);return e}function Or(e,t=!1){let n=Tr(e);Er(n,[...wr]);let r={};for(let e of wr)r[e]=Dr(n[e],t?-1e3:0,1e4);return r}function kr(e,t){if(typeof e!=`string`||e.length<1||e.length>t)throw Error(`invalid_combat_profile_v2`);return e}function Ar(e){if(e===void 0)return null;let t=Tr(e);if(Er(t,[`version`,`mode`,`alpha`,`pet`]),t.version!==2||t.mode!==`inputs-only`)throw Error(`invalid_combat_profile_v2`);let n=Tr(t.alpha);Er(n,[`level`,`base`,`gear`]);let r={level:Dr(n.level,1,1e4),base:Or(n.base),gear:Or(n.gear,!0)},i=null;if(t.pet!==null){let e=Tr(t.pet);Er(e,[`id`,`name`,`img`,`level`,`effective`]);let n=kr(e.img,2048);if(!n.startsWith(`https://`))throw Error(`invalid_combat_profile_v2`);i={id:kr(e.id,128),name:kr(e.name,128),img:n,level:Dr(e.level,1,1e4),effective:Or(e.effective)}}return{version:2,mode:`inputs-only`,alpha:r,pet:i}}var jr=[`hp`,`atk`,`def`,`spd`];function Mr(e){if(!e||typeof e!=`object`||Array.isArray(e))throw Error(`invalid_combat_profile_v3`);return e}function Nr(e,t){if(Object.keys(e).length!==t.length||!t.every(t=>Object.prototype.hasOwnProperty.call(e,t)))throw Error(`invalid_combat_profile_v3`)}function Pr(e,t,n){if(typeof e!=`number`||!Number.isInteger(e)||e<t||e>n)throw Error(`invalid_combat_profile_v3`);return e}function Fr(e,t,n){let r={};return jr.forEach((i,a)=>{r[i]=Pr(e[i],t[a],t[a]+n[a])}),r}function Ir(e){if(e===void 0)return null;let t=Mr(e);if(Nr(t,[`version`,`mode`,`alpha`,`pet`]),t.version!==3||t.mode!==`battle-v1`)throw Error(`invalid_combat_profile_v3`);let n=Mr(t.alpha);Nr(n,[...jr]);let r=Fr(n,[120,28,12,14],[18,11,9,2]),i=null;if(t.pet!==null){let e=Mr(t.pet);Nr(e,[`id`,`name`,`img`,...jr]);for(let t of[`id`,`name`,`img`])if(typeof e[t]!=`string`||!e[t].length||e[t].length>(t===`img`?2048:128))throw Error(`invalid_combat_profile_v3`);if(!e.img.startsWith(`https://`))throw Error(`invalid_combat_profile_v3`);i={id:e.id,name:e.name,img:e.img,...Fr(e,[78,18,6,13],[13,7,5,2])}}return{version:3,mode:`battle-v1`,alpha:r,pet:i}}function Lr(e,t,n){if(!t)return e;if(!n||n.pet?.id!==t.pet?.id||n.pet===null!=(t.pet===null))throw Error(`combat_profile_version_mismatch`);let r=0,i=0,a=e.map(e=>{if(e.defId===`alpha`)return r++,{...e,unitDef:{...e.unitDef||E.alpha,...t.alpha}};if(e.defId.startsWith(`pet:`)||e.id.startsWith(`pet:`)){if(i++,!t.pet||e.id!==`pet:${t.pet.id}`||!e.unitDef)throw Error(`combat_pet_mismatch`);let{hp:n,atk:r,def:a,spd:o}=t.pet;return{...e,unitDef:{...e.unitDef,hp:n,atk:r,def:a,spd:o}}}return e});if(r!==1||i>1||i>0&&!t.pet)throw Error(`combat_squad_mismatch`);return a}function Rr(e){"@babel/helpers - typeof";return Rr=typeof Symbol==`function`&&typeof Symbol.iterator==`symbol`?function(e){return typeof e}:function(e){return e&&typeof Symbol==`function`&&e.constructor===Symbol&&e!==Symbol.prototype?`symbol`:typeof e},Rr(e)}function zr(e,t){if(Rr(e)!=`object`||!e)return e;var n=e[Symbol.toPrimitive];if(n!==void 0){var r=n.call(e,t||`default`);if(Rr(r)!=`object`)return r;throw TypeError(`@@toPrimitive must return a primitive value.`)}return(t===`string`?String:Number)(e)}function Br(e){var t=zr(e,`string`);return Rr(t)==`symbol`?t:t+``}function Vr(e,t,n){return(t=Br(t))in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function Hr(e){if(!e||typeof e!=`object`)return;let t=e;if(!(!Number.isInteger(t.cycleId)||!Number.isInteger(t.pressure)||t.pressure<0||t.pressure>3||![`standard`,`south`].includes(t.approach)||![1,2,3].includes(t.reportVersion))&&(t.reportVersion!==3||[`standard`,`advanced`].includes(t.directiveTier)&&[`pursuit`,`attrition`].includes(t.directiveSet)))return{cycleId:t.cycleId,pressure:t.pressure,approach:t.approach,reportVersion:t.reportVersion,...t.reportVersion===3?{directiveTier:t.directiveTier,directiveSet:t.directiveSet}:{}}}function Ur(e){if(!e||typeof e!=`object`)return null;let t=e;return typeof t.runId!=`string`||typeof t.missionId!=`string`||typeof t.victory!=`boolean`||typeof t.challengeSuccess!=`boolean`||typeof t.regionalApplied!=`boolean`||![t.cycleId,t.challengeBonus,t.progressEarned,t.progressBefore,t.progressAfter,t.rankBefore,t.rankAfter,t.pressureBefore,t.pressureAfter,t.recordedAt].every(Number.isInteger)||!Array.isArray(t.unlockedApproaches)||!t.unlockedApproaches.every(e=>e===`standard`||e===`south`)?null:{...t,xpGranted:Number.isInteger(t.xpGranted)?Number(t.xpGranted):0,bonesGranted:Number.isInteger(t.bonesGranted)?Number(t.bonesGranted):0}}function Wr(e){try{return rt(e)}catch{return null}}function Gr(e){let t=Wr(e);if(!t)throw new P(`invalid_growth_snapshot`);return t}function Kr(e,t){if(!e||typeof e!=`object`||!Number.isSafeInteger(t)||t<0)return null;let n=e,r=Wr({...n,revision:t});return!r||!Number.isSafeInteger(n.earnedPoints)||Number(n.earnedPoints)<0||!Number.isSafeInteger(n.spentPoints)||Number(n.spentPoints)<0||Number(n.spentPoints)>Number(n.earnedPoints)||!Array.isArray(n.claimedFirstClears)||n.claimedFirstClears.length!==Number(n.earnedPoints)||n.claimedFirstClears.some(e=>typeof e!=`string`)||new Set(n.claimedFirstClears).size!==n.claimedFirstClears.length||r.heroes.some(e=>typeof e.respecUsed!=`boolean`)||r.heroes.reduce((e,t)=>e+Object.values(t.ranks).reduce((e,t)=>e+t,0),0)!==Number(n.spentPoints)?null:{...r,earnedPoints:Number(n.earnedPoints),spentPoints:Number(n.spentPoints),claimedFirstClears:[...n.claimedFirstClears]}}var P=class extends Error{constructor(e,t=null){super(e),Vr(this,`code`,void 0),Vr(this,`state`,void 0),this.code=e,this.state=t}};function qr(){if(typeof window>`u`)return null;let e=window,t=e.apiPost||e.S?.apiPost||e.AH?.apiPost;return typeof t==`function`?t:null}function Jr(e){if(!e||typeof e!=`object`)return null;let t=e,n=String(t.foundationStage||``);if(![`solo-1`,`solo-2`,`ally-koda`,`full-broken-signal`,`completed`].includes(n))return null;let r=Number(t.revision);if(!Number.isInteger(r)||r<0)return null;let i={packMastery:yr(t.packMastery),version:1,foundationStage:n,completed:t.completed===!0||n===`completed`,revision:r,activeRunId:typeof t.activeRunId==`string`&&t.activeRunId?t.activeRunId:null,lastCompletedRunId:typeof t.lastCompletedRunId==`string`&&t.lastCompletedRunId?t.lastCompletedRunId:null,updatedAt:Number.isFinite(Number(t.updatedAt))?Number(t.updatedAt):0};if(Object.prototype.hasOwnProperty.call(t,`playerGrowth`)){let e=Kr(t.playerGrowth,r);if(!e)return null;i.playerGrowth=e}if(t.fieldOps&&typeof t.fieldOps==`object`){let e=t.fieldOps;if(!e.records||typeof e.records!=`object`)return null;let n={};for(let[t,r]of Object.entries(e.records)){if(!r||typeof r!=`object`)return null;let e=r;if(e.missionId!==t||!Number.isInteger(e.clearCount)||Number(e.clearCount)<0)return null;n[t]={missionId:t,completed:Number(e.clearCount)>0,clearCount:Number(e.clearCount),lastClearedAt:Number(e.lastClearedAt)||0,failCount:Number(e.failCount)||0,challengeCount:Number(e.challengeCount)||0,lastClearCycle:Number.isInteger(e.lastClearCycle)?Number(e.lastClearCycle):null,lastChallengeCycle:Number.isInteger(e.lastChallengeCycle)?Number(e.lastChallengeCycle):null},Array.isArray(e.squadIds)&&e.squadIds.every(e=>typeof e==`string`)&&(n[t].squadIds=[...e.squadIds]),n[t].advancedClearCount=Number.isInteger(e.advancedClearCount)&&Number(e.advancedClearCount)>=0?Number(e.advancedClearCount):0,n[t].lastAdvancedCycle=Number.isInteger(e.lastAdvancedCycle)?Number(e.lastAdvancedCycle):null}let r=Zr({field:{...e,status:`active`,missions:{}}});if(!r)return null;if(i.fieldOps={records:n,activeMissionRun:r.field.activeMissionRun,lastCompletedMissionRunId:r.field.lastCompletedMissionRunId},e.board!=null||e.commander!=null||e.region!=null){let t=e.board,n=e.commander,r=e.region;if(!t||!Number.isInteger(t.cycleId)||!Number.isInteger(t.nextRotationAt)||!Array.isArray(t.activeMissionIds)||t.activeMissionIds.length!==3||new Set(t.activeMissionIds).size!==3||!t.activeMissionIds.every(e=>typeof e==`string`)||!n||![1,2,3].includes(n.rank)||!Number.isInteger(n.progress)||n.progress<0||!Array.isArray(n.unlockedApproaches)||!n.unlockedApproaches.every(e=>e===`standard`||e===`south`)||t.reportVersion!=null&&(t.reportVersion!==3||![`pursuit`,`attrition`].includes(t.directiveSet))||n.unlockedDirectiveTiers!=null&&(!Array.isArray(n.unlockedDirectiveTiers)||!n.unlockedDirectiveTiers.every(e=>[`standard`,`advanced`].includes(e)))||!r||!Number.isInteger(r.pressure)||r.pressure<0||r.pressure>3||r.cycleId!==t.cycleId)return null;let a=e.rotationProgress;if(a!=null&&(!Number.isInteger(a.cycleId)||a.cycleId!==t.cycleId||!Number.isInteger(a.securedCount)||!Number.isInteger(a.total)||a.total!==3||a.securedCount<0||a.securedCount>a.total||![a.clearedMissionIds,a.challengeMissionIds,a.advancedMissionIds].every(e=>Array.isArray(e)&&e.every(e=>typeof e==`string`&&t.activeMissionIds.includes(e)))||typeof a.frontSecured!=`boolean`||a.frontSecured!==(a.securedCount===a.total)))return null;let o=e.careerRecord;if(o!=null&&(o.version!==1||![o.missionSecures,o.challenges,o.advancedClears,o.frontsSecured].every(e=>Number.isInteger(e)&&e>=0)||o.lastSecuredCycle!=null&&!Number.isInteger(o.lastSecuredCycle)))return null;Object.assign(i.fieldOps,{board:t,commander:n,region:r,...a?{rotationProgress:a}:{},...o?{careerRecord:o}:{},lastResult:Ur(e.lastResult)})}}let a=Zr(t.operations);if(i.playerIdentity=t.playerIdentity&&typeof t.playerIdentity==`object`?t.playerIdentity:void 0,i.activeTacticalProfile=Cr(t.activeTacticalProfile),Object.prototype.hasOwnProperty.call(t,`activeCombatProfileV2`)&&(i.activeCombatProfileV2=Ar(t.activeCombatProfileV2)),i.equippedPet=w(t.equippedPet),a&&(i.operations=a),t.campaignIntel&&typeof t.campaignIntel==`object`){let e=t.campaignIntel[`dead-relay`];e&&typeof e==`object`&&typeof e.courierTraceAcquired==`boolean`&&(i.campaignIntel={"dead-relay":{courierTraceAcquired:e.courierTraceAcquired}})}return i.kodaSidegrade=a?.[`broken-signal`]?.status===`cleared`&&(t.kodaSidegrade===`A`||t.kodaSidegrade===`B`)?t.kodaSidegrade:null,i.shadowSidegrade=a?.[`broken-signal`]?.status===`cleared`&&(t.shadowSidegrade===`A`||t.shadowSidegrade===`B`)?t.shadowSidegrade:null,t.intel&&typeof t.intel==`object`&&(i.intel={routingTrace:!!t.intel.routingTrace,commanderProfile:!!t.intel.commanderProfile}),t.archive&&typeof t.archive==`object`&&(i.archive={brokenSignal:!!t.archive.brokenSignal}),(t.nextOperationSlot===`unassigned`||t.nextOperationSlot===null)&&(i.nextOperationSlot=t.nextOperationSlot),i}function Yr(e){if(!e||typeof e!=`object`)return null;let t=e;return t.version===1&&typeof t.courierTraceAcquired==`boolean`?{version:1,courierTraceAcquired:t.courierTraceAcquired}:null}function Xr(e){if(!e||typeof e!=`object`)return null;let t=e;return typeof t.victory!=`boolean`||typeof t.objectiveComplete!=`boolean`||typeof t.missionId!=`string`||typeof t.runId!=`string`||typeof t.intelEarned!=`boolean`||![t.turns,t.squadStanding,t.squadDeployed].every(Number.isInteger)?null:{victory:t.victory,objectiveComplete:t.objectiveComplete,turns:Number(t.turns),squadStanding:Number(t.squadStanding),squadDeployed:Number(t.squadDeployed),missionId:t.missionId,runId:t.runId,intelEarned:t.intelEarned,...typeof t.failureReason==`string`?{failureReason:t.failureReason}:{}}}function Zr(e){if(!e||typeof e!=`object`)return null;let t=e,n={};for(let[e,r]of Object.entries(t)){if(!r||typeof r!=`object`)return null;let t=r;if(t.status!==`active`&&t.status!==`cleared`||!t.missions||typeof t.missions!=`object`)return null;let i={};for(let[e,n]of Object.entries(t.missions)){if(n!==`locked`&&n!==`available`&&n!==`cleared`)return null;i[e]=n}let a=t.activeMissionRun,o=null;if(a!=null){if(typeof a!=`object`)return null;let e=a;if(typeof e.runId!=`string`||typeof e.missionId!=`string`)return null;let t=Array.isArray(e.squadIds)&&e.squadIds.every(e=>typeof e==`string`)?e.squadIds:[],n=Hr(e.fieldContext);if(e.fieldContext!=null&&!n)return null;o={runId:e.runId,missionId:e.missionId,squadIds:t,tacticalProfile:Cr(e.tacticalProfile),packMastery:yr(e.packMastery),...e.playerGrowth==null?{}:{playerGrowth:Gr(e.playerGrowth)},...Object.prototype.hasOwnProperty.call(e,`combatProfileV2`)?{combatProfileV2:Ar(e.combatProfileV2)}:{},...Object.prototype.hasOwnProperty.call(e,`combatProfileV3`)?{combatProfileV3:Ir(e.combatProfileV3)}:{},...n?{fieldContext:n}:{},...Yr(e.campaignContext)?{campaignContext:Yr(e.campaignContext)}:{}}}n[e]={status:t.status,missions:i,activeMissionRun:o,lastCompletedMissionRunId:typeof t.lastCompletedMissionRunId==`string`&&t.lastCompletedMissionRunId?t.lastCompletedMissionRunId:null}}return n}async function Qr(e,t={}){let n=qr();if(!n)throw new P(`progression_unavailable`);let r;try{r=await n(e,t)}catch(e){let t=e&&typeof e==`object`?e:{},n=t.details;throw new P(String(t.code||`progression_request_failed`),Jr(n?.state))}if(!r||typeof r!=`object`)throw new P(`invalid_progression_response`);let i=r,a=i.details;if(i.ok!==!0)throw new P(String(i.code||`progression_request_failed`),Jr(a?.state));return i}function $r(e){let t=Jr(e.data);if(!t)throw new P(`invalid_progression_response`);return t}async function ei(){return $r(await Qr(`/webapp/tactical-foundation/state`))}async function ti(e,t){return $r(await Qr(`/webapp/tactical-foundation/start`,{requestId:e,expectedRevision:t}))}async function ni(e,t,n){return $r(await Qr(`/webapp/tactical-foundation/continue`,{requestId:e,expectedRevision:t,runId:n}))}async function ri(e,t,n,r,i){let a=await Qr(`/webapp/tactical-foundation/mission/start`,{requestId:e,expectedRevision:t,missionId:n,...r?{squadIds:r}:{},...i?{fieldOptions:i}:{}}),o=a.run;if(!o||typeof o!=`object`)throw new P(`invalid_progression_response`);let s=o;if(typeof s.runId!=`string`||typeof s.missionId!=`string`)throw new P(`invalid_progression_response`);let c=Array.isArray(s.squadIds)&&s.squadIds.every(e=>typeof e==`string`)?s.squadIds:[],l=Hr(s.fieldContext);if(s.fieldContext!=null&&!l)throw new P(`invalid_progression_response`);return{state:$r(a),run:{runId:s.runId,missionId:s.missionId,squadIds:c,tacticalProfile:Cr(s.tacticalProfile),packMastery:yr(s.packMastery),...s.playerGrowth==null?{}:{playerGrowth:Gr(s.playerGrowth)},...Object.prototype.hasOwnProperty.call(s,`combatProfileV2`)?{combatProfileV2:Ar(s.combatProfileV2)}:{},...Object.prototype.hasOwnProperty.call(s,`combatProfileV3`)?{combatProfileV3:Ir(s.combatProfileV3)}:{},...l?{fieldContext:l}:{},...Yr(s.campaignContext)?{campaignContext:Yr(s.campaignContext)}:{}}}}async function ii(e,t,n,r=!1,i,a){let o=await Qr(`/webapp/tactical-foundation/mission/continue`,{requestId:e,expectedRevision:t,runId:n,completionIntent:a?a.victory:!i||i.victory,routingTraceAcquired:r,...i?{fieldReport:i}:{},...a?{campaignReport:a}:{}});return{state:$r(o),firstClear:o.firstClear===!0,fieldResult:Ur(o.fieldResult),campaignResult:Xr(o.campaignResult)}}async function ai(e,t,n,r){return $r(await Qr(`/webapp/tactical-foundation/${n}-sidegrade`,{requestId:e,expectedRevision:t,[`${n}Sidegrade`]:r}))}async function oi(e,t,n,r,i,a){return $r(await Qr(`/webapp/tactical-foundation/growth/upgrade`,{requestId:e,expectedRevision:t,heroId:n,discipline:r,skillId:i,rank:a}))}async function si(e,t,n){return $r(await Qr(`/webapp/tactical-foundation/growth/respec`,{requestId:e,expectedRevision:t,heroId:n}))}async function ci(e,t,n,r){return $r(await Qr(`/webapp/tactical-foundation/pack-mastery`,{requestId:e,expectedRevision:t,unitId:n,choice:r}))}function li(e){let t=typeof crypto<`u`&&typeof crypto.randomUUID==`function`?crypto.randomUUID():String(Date.now())+`-`+Math.random().toString(36).slice(2);return`tops-foundation-`+e+`-`+t}var ui=`tactical_ops.js v3.5.0-player-clarity-return-loop`;function di(e){return e.defId===`alpha`||e.role===`alpha`?`alpha`:e.defId===`ally-02`?`cnc`:e.defId===`ally-03`?`shadow`:`pet`}function fi(e,t){return e.growth?.ranks[it(t)]||0}function pi(e,t){let n=e.combatMastery;if(!n||n.stage<2)return null;let r=it(t),i=di(e);if(i===`cnc`&&r===`u02-suppress`)return n.stage>=3?`signature`:`trained`;if(i===`shadow`){if(r===`u03-pack`)return n.stage>=3&&n.selected===`B`?`signature`:`trained`;if(r===`u03-mend`&&n.stage>=3&&n.selected===`A`)return`signature`}return i===`pet`&&r===`pet-hamstring`&&n.stage>=3&&n.selected===`A`?`signature`:null}function mi(e,t){let n=pi(e,t);if(n)return n;let r=fi(e,t);return r===2?`rank2`:r===1?`rank1`:`base`}function hi(e,t){let n=mi(e,t);return n===`signature`?`SIGNATURE`:n===`trained`?`TRAINED`:n===`rank2`?`R2`:n===`rank1`?`R1`:null}function gi(e){if(e.defId===`alpha`)return e.growth?.discipline?.toUpperCase()||null;let t=e.combatMastery;return!t||t.stage<2?null:t.stage>=3&&t.selected?`MASTERED · ${t.selected}`:`TRAINED · 3/8`}function _i(e,t,n,r){let i=Zt(e),a={...t,discipline:t.discipline||r},o=at(i,a),s=at(i,{...a,ranks:{...a.ranks,[e]:n}}),c=[];s.maxRange!==o.maxRange&&c.push(`RANGE ${o.maxRange} → ${s.maxRange}`),s.cooldownMax!==o.cooldownMax&&c.push(`COOLDOWN ${o.cooldownMax} → ${s.cooldownMax}`);let l=o.effects.find(e=>e.kind===`status`)?.duration||0,u=s.effects.find(e=>e.kind===`status`)?.duration||0;return u!==l&&c.push(`STATUS ${l} → ${u} TURNS`),c}function vi(e,t,n,r,i){let a=n.filter(e=>(e.type===`damage`||e.type===`heal`||e.type===`status`)&&!!e.unitId);if(!a.length&&!i)return null;let o=at(Zt(t),e.growth),s=a.filter(e=>e.type===`damage`).reduce((e,t)=>e+(t.amount||0),0),c=a.filter(e=>e.type===`heal`).reduce((e,t)=>e+(t.amount||0),0),l=a.filter(e=>e.type===`status`),u=l.some(e=>e.kind===`guard`),d=i?`control`:s?`damage`:c?`heal`:u?`guard`:l.length?`control`:`support`,f=i?`ENEMY INTENT CANCELED`:s?`−${s} HP`:c?`+${c} HP`:l.length?l[0].text||`STATUS APPLIED`:`EFFECT RESOLVED`,p=mi(e,t),m=hi(e,t),h=o.targetType===`ALLY_AOE`||o.targetType===`SELF`?e.id:a[0]?.unitId||e.id;return{id:r,actorId:e.id,targetId:h,affinity:di(e),tier:p,title:`${o.name}${m?` · `+m:``}`,consequence:f,mode:d,interrupted:i}}function yi(e,t,n){return di(e)!==`pet`||e.combatMastery?.stage!==3||e.combatMastery.selected!==`B`||e.c===t.c&&e.r===t.r?null:{id:n,actorId:e.id,targetId:t.id,affinity:`pet`,tier:`signature`,title:`PATHFINDER · SIGNATURE`,consequence:`POSITION SECURED`,mode:`movement`,interrupted:!1}}var bi=`/images/tactical_ops/combat_fx/v1/`,xi={alpha_strike:540,alpha_rend:680,alpha_howl:820,alpha_guard:640,cnc_thrust:500,cnc_lunge:580,cnc_pressure:720,cnc_interrupt:760,shadow_sweep:520,shadow_mend:760,shadow_pack_heal_def:820,shadow_pack_def_only:820,shadow_pack_guard:820,pet_bite:500,pet_hamstring:740,pet_pathfinder:660,objective_recover:880};function Si(e,t,n,r){if(!(e in xi))throw Error(`Unknown combat FX `+e);return{id:t,name:e,targetId:n,terminal:r,durationMs:xi[e]}}function Ci(e,t,n,r,i){let a=it(t),o=e=>n.some(t=>t.type===e),s=e=>n.some(t=>t.type===`status`&&(t.text||``).toUpperCase()===e),c=e=>[...new Set(n.filter(t=>t.type===e&&t.unitId).map(e=>e.unitId))],l=c(`damage`)[0]||c(`status`)[0]||c(`heal`)[0],u=[],d=(t,n)=>u.push(Si(t,r+u.length,n||e.id)),f=o(`damage`),p=n.some(e=>e.type===`heal`&&(e.amount||0)>0);switch(a){case`alpha-strike`:f&&d(`alpha_strike`,l);break;case`alpha-rend`:f&&d(`alpha_rend`,l);break;case`alpha-howl`:if((s(`ATK UP`)||s(`SPD UP`))&&d(`alpha_howl`),s(`GUARD`))for(let e of c(`status`).filter(e=>n.some(t=>t.type===`status`&&t.unitId===e&&t.kind===`guard`)))d(`alpha_guard`,e);break;case`u02-shot`:f&&d(`cnc_thrust`,l);break;case`u02-burst`:f&&d(`cnc_lunge`,l);break;case`u02-suppress`:s(`ATK DOWN`)&&d(`cnc_pressure`,l),i&&d(`cnc_interrupt`,l);break;case`u03-tap`:f&&d(`shadow_sweep`,l);break;case`u03-mend`:if(p)for(let e of c(`heal`))d(`shadow_mend`,e);break;case`u03-pack`:p&&s(`DEF UP`)?d(`shadow_pack_heal_def`):s(`DEF UP`)&&d(`shadow_pack_def_only`),s(`GUARD`)&&d(`shadow_pack_guard`);break;case`pet-bite`:f&&d(`pet_bite`,l);break;case`pet-hamstring`:s(`SPD DOWN`)&&d(`pet_hamstring`,l)}return u}function wi(e,t,n){return!e.defId.startsWith(`pet:`)||e.combatMastery?.stage!==3||e.combatMastery.selected!==`B`||e.c===t.c&&e.r===t.r?[]:Math.abs(e.c-t.c)+Math.abs(e.r-t.r)>4?[Si(`pet_pathfinder`,n,e.id)]:[]}var Ti={id:`solo-1`,operationName:`BROKEN SIGNAL — CONTACT`,objective:`Close to melee and eliminate the hostile scout.`,teaching:`Move, then Strike at range 1.`,next:`solo-2`,resultsTitle:`DRILL COMPLETE`,resultsNote:`Next: multiple hostiles.`,spawns:[{defId:`alpha`,id:`alpha`,c:2,r:2},{defId:`hostile`,id:`h2`,c:5,r:3}]},Ei={id:`solo-2`,operationName:`BROKEN SIGNAL — SPLIT CONTACT`,objective:`Eliminate both hostiles. You cannot be in two cells at once.`,teaching:`Two threats. Reposition between contacts.`,next:`ally-koda`,resultsTitle:`DRILL COMPLETE`,resultsNote:`COLDNCURSED / CNC — BUG HUNTER WARDEN joins Alpha for the next deployment.`,spawns:[{defId:`alpha`,id:`alpha`,c:2,r:2},{defId:`hostile`,id:`h1`,c:5,r:0},{defId:`hostile`,id:`h2`,c:5,r:3}]},Di={id:`ally-koda`,operationName:`BROKEN SIGNAL — PACK LINK`,objective:`Fight with CNC. Cover range while Alpha holds melee.`,teaching:`CNC strikes at range 3. Howl covers nearby allies.`,next:`full-broken-signal`,resultsTitle:`SQUAD LINK ESTABLISHED`,resultsNote:`Full operation ready.`,spawns:[{defId:`alpha`,id:`alpha`,c:2,r:2},{defId:`ally-02`,id:`ally-02`,c:1,r:0},{defId:`hostile`,id:`h1`,c:5,r:0},{defId:`hostile`,id:`h2`,c:5,r:3}]},Oi={id:`full-broken-signal`,operationName:`BROKEN SIGNAL`,objective:`Eliminate the hostile force and secure the tactical sector.`,teaching:`Full pack. Shadow supports. Break the leader.`,next:null,resultsTitle:`OPERATION COMPLETE`,resultsNote:`Hostile force eliminated.`,spawns:D},ki={"solo-1":Ti,"solo-2":Ei,"ally-koda":Di,"full-broken-signal":Oi},Ai=`solo-1`;function ji(e){return Object.prototype.hasOwnProperty.call(ki,e)}function Mi(e){return e&&ji(e)?ki[e]:Ti}function Ni(e,t){return e?Mi(t).spawns:D}function Pi(e,t){return e?Mi(t):Oi}function Fi(e){let t=new Set,n=[];for(let r of e){let e=r.unitDef||E[r.defId];e&&e.team===`ally`&&!t.has(e.defId)&&(t.add(e.defId),n.push(e))}return n}function Ii(e){let t=new Map;for(let n of e){let e=n.unitDef||E[n.defId];e&&e.team===`enemy`&&t.set(e.defId,{def:e,count:(t.get(e.defId)?.count||0)+1})}return[...t.values()]}var Li=`tactical-intent-vnext.0`,F=M,I=[`ATTACK`,`AREA`,`JAM`,`ESCAPE`,`REINFORCEMENT`,`CHARGE`],Ri=[`KILL`,`DISRUPT`,`REPOSITION`,`BLOCK`,`PROTECT`,`TRADE`];function zi(e){return Number.isInteger(e.c)&&Number.isInteger(e.r)&&e.c>=0&&e.c<N&&e.r>=0&&e.r<pt}function Bi(e,t){return e.c===t.c&&e.r===t.r}function Vi(e,t){if(!e.id||!e.enemyId||!I.includes(e.kind)||!e.predictedEffect.trim()||e.warnsOnUnitTurn!==t.unitTurn||!Number.isInteger(e.resolvesOnUnitTurn)||e.resolvesOnUnitTurn<=e.warnsOnUnitTurn||![`CANCEL`,`REANNOUNCE`].includes(e.fallbackPolicy)||!e.responses.length||!e.responses.every(e=>Ri.includes(e))||e.responses.length!==new Set(e.responses).size||!e.impactTiles.length||!e.impactTiles.every(zi)||e.targetTile!==null&&!zi(e.targetTile)||!e.targetUnitId&&!e.targetTile)throw Error(`invalid_tactical_intent`);let n=t.units.find(t=>t.id===e.enemyId);if(!n||n.team!==`enemy`||n.defeated)throw Error(`invalid_tactical_intent_source`);if(e.targetUnitId){let n=t.units.find(t=>t.id===e.targetUnitId);if(!n||n.defeated)throw Error(`invalid_tactical_intent_target`);if(e.targetTile&&!Bi(n,e.targetTile))throw Error(`intent_target_tile_mismatch`)}let r=Object.freeze({...e,targetTile:e.targetTile?Object.freeze({...e.targetTile}):null,impactTiles:Object.freeze(e.impactTiles.map(e=>Object.freeze({...e}))),responses:Object.freeze([...e.responses]),phase:`WINDUP`,rulesetVersion:Li});return{plan:r,event:{type:`threat_announced`,intentId:r.id,enemyId:r.enemyId,unitTurn:t.unitTurn}}}function Hi(e,t,n=!1){if(e.rulesetVersion!==`tactical-intent-vnext.0`||t.unitTurn<e.warnsOnUnitTurn)throw Error(`intent_ruleset_or_clock_mismatch`);let r=t.units.find(t=>t.id===e.enemyId),i=e.targetUnitId?t.units.find(t=>t.id===e.targetUnitId):null,a=!r||r.defeated?`SOURCE_DEFEATED`:n?`COUNTERED`:e.targetUnitId&&(!i||i.defeated)?`TARGET_GONE`:i&&e.targetTile&&!Bi(i,e.targetTile)?`TARGET_MOVED`:null;if(a)return{status:`CANCELED`,reason:a,events:[{type:`threat_countered`,intentId:e.id,reason:a,unitTurn:t.unitTurn}]};if(t.unitTurn<e.resolvesOnUnitTurn)return{status:`WAIT`,plan:e,events:[]};if(e.phase===`COMMIT`)throw Error(`intent_already_committed`);return{status:`COMMIT`,plan:Object.freeze({...e,phase:`COMMIT`}),events:[{type:`threat_committed`,intentId:e.id,unitTurn:t.unitTurn}]}}function Ui(e,t,n){if(e.phase!==`COMMIT`||!Number.isInteger(t)||t<e.resolvesOnUnitTurn||n!==!0)throw Error(`unconfirmed_tactical_resolution`);return[{type:`threat_resolved`,intentId:e.id,unitTurn:t,confirmedByEngine:!0}]}var Wi=()=>({pending:[],ledger:[],sequence:0,reactionObserved:{}});function Gi(e){return e.type===`skill`?e:e.type===`move`&&e.then?.type===`skill`?e.then:null}function Ki(e){return{c:e.c,r:e.r}}function qi(e,t){let n=Yt(e,12),r=n.indexOf(t);if(r<0)return!1;let i=n.indexOf(t,r+1);return i<0?!1:n.slice(r+1,i).some(t=>e.units.some(e=>e.id===t&&e.team===`ally`&&!e.defeated))}function Ji(e,t){if(!e.pending.length)return e;let n=[],r={...e.reactionObserved},i=[...e.ledger];for(let a of e.pending){let e=Hi(a.plan,t);e.status===`CANCELED`?(i.push(...e.events),delete r[a.plan.id]):n.push(a)}return n.length===e.pending.length?e:{...e,pending:n,reactionObserved:r,ledger:i}}function Yi(e,t){let n=t.units.find(e=>e.id===t.activeId);if(!n||n.team!==`ally`||n.defeated)return e;let r={...e.reactionObserved};for(let n of e.pending)t.unitTurn>n.plan.warnsOnUnitTurn&&(r[n.plan.id]=!0);return{...e,reactionObserved:r}}function Xi(e,t,n,r){if(n.type===`skip`||!Gi(n))return null;let i=e.units.find(e=>e.id===t);if(!i||i.defeated||i.team!==`enemy`)return null;let a=Gi(n),o=a?Zt(a.skillId):null;if(o&&(o.targetType===`SELF`||o.targetType===`ALLY_AOE`))return null;let s=a?.targetId?e.units.find(e=>e.id===a.targetId):null,c=s?Ki(s):a?.cell?Ki(a.cell):n.type===`move`?Ki(n.to):Ki(i),l=o&&[`AREA_RADIUS`,`ENEMY_AOE`].includes(o.targetType)?Array.from({length:N*pt},(e,t)=>({c:t%N,r:Math.floor(t/N)})).filter(e=>Math.max(Math.abs(e.c-c.c),Math.abs(e.r-c.r))<=o.radius):[c],u=o?.id.includes(`interference`)||o?.id.includes(`intimidate`)?`JAM`:n.type===`move`&&!a?`CHARGE`:o?.targetType===`AREA_RADIUS`||o?.targetType===`ENEMY_AOE`?`AREA`:`ATTACK`,{plan:d}=Vi({id:`threat:${e.unitTurn}:${t}:${r}`,enemyId:t,kind:u,targetUnitId:s?.id??null,targetTile:c,impactTiles:l,predictedEffect:o?o.name:`Enemy attack`,warnsOnUnitTurn:e.unitTurn,resolvesOnUnitTurn:e.unitTurn+1,responses:[`KILL`,`DISRUPT`,`REPOSITION`,`BLOCK`,`PROTECT`,`TRADE`],fallbackPolicy:`CANCEL`},e);return{plan:d,action:n}}function Zi(e,t){let n=t.units.find(e=>e.id===t.activeId);if(!n||n.team!==`enemy`||n.defeated||e.pending.some(e=>e.plan.enemyId===n.id)||!qi(t,n.id))return e;let r=dn(t),i=Xi(t,n.id,r,e.sequence+1);return i?{...e,sequence:e.sequence+1,pending:[...e.pending,i],ledger:[...e.ledger,{type:`threat_announced`,intentId:i.plan.id,enemyId:n.id,unitTurn:t.unitTurn}]}:e}function Qi(e,t){let n=e.pending.findIndex(e=>e.plan.enemyId===t.activeId);if(n<0)return{cycle:e,state:t};let r=e.pending[n],i=Hi(r.plan,t);if(i.status===`COMMIT`&&!e.reactionObserved[r.plan.id]||i.status===`WAIT`)return{cycle:e,state:t};let a=e.pending.filter((e,t)=>t!==n),o={...e.reactionObserved};if(delete o[r.plan.id],i.status===`CANCELED`)return{state:t,cycle:{...e,pending:a,reactionObserved:o,ledger:[...e.ledger,...i.events]}};if(!fn(t,r.action))return{state:t,cycle:{...e,pending:a,reactionObserved:o,ledger:[...e.ledger,{type:`threat_countered`,intentId:r.plan.id,reason:`INVALIDATED`,unitTurn:t.unitTurn}]}};let s=t,c=rr(t,r.action),l=c.state!==s&&c.events.some(e=>e.type===`damage`||e.type===`status`||e.type===`move`||e.type===`heal`);return{state:c.state,events:c.events,cycle:{...e,pending:a,reactionObserved:o,ledger:[...e.ledger,...l?[...i.events,...Ui(i.plan,t.unitTurn,!0)]:[{type:`threat_countered`,intentId:r.plan.id,reason:`INVALIDATED`,unitTurn:t.unitTurn}]]}}}function $i(e,t,n,r,i,a,o){let s=t.units.find(e=>e.id===r);if(!s||s.team!==`ally`||s.defeated||s.defId!==`ally-02`||s.growth?.discipline!==`disruptor`||!(a===`u02-suppress`||a===`u02-pressure-disruptor`||a.startsWith(`u02-pressure-disruptor:mastery:`)||a.startsWith(`u02-suppress:mastery:`))||!o.some(e=>e.type===`status`&&e.unitId===i)||t.unitTurn!==n.unitTurn)return{cycle:e,interrupted:!1};let c=e.pending.find(e=>e.plan.enemyId===i);if(!c)return{cycle:e,interrupted:!1};let l=Hi(c.plan,n,!0);if(l.status!==`CANCELED`)return{cycle:e,interrupted:!1};let u={...e.reactionObserved};return delete u[c.plan.id],{interrupted:!0,cycle:{...e,pending:e.pending.filter(e=>e.plan.id!==c.plan.id),reactionObserved:u,ledger:[...e.ledger,...l.events],interruptedEnemyIds:[...e.interruptedEnemyIds||[],i]}}}function ea(e,t){return t?e.map(e=>e.defId===`ally-02`?{...e,unitDef:{...E[`ally-02`],move:t===`A`?3:2,skillIds:t===`A`?[`u02-shot`,`u02-lunge-vanguard`,`u02-suppress`]:[`u02-shot`,`u02-burst`,`u02-pressure-disruptor`]}}:e):e}function ta(e,t){return t?e.map(e=>e.defId===`ally-03`?{...e,unitDef:{...E[`ally-03`],skillIds:t===`A`?[`u03-tap`,`u03-mend-restorer`,`u03-pack`]:[`u03-tap`,`u03-mend`,`u03-pack-warden`]}}:e):e}function na(e,t){return br(ta(ea(e,t.kodaSidegrade),t.shadowSidegrade),t.packMastery)}var ra=ui;function L(e){return new Promise(t=>{if(typeof requestAnimationFrame>`u`){setTimeout(t,e);return}let n=performance.now(),r=i=>{i-n>=e?t():requestAnimationFrame(r)};requestAnimationFrame(r)})}var ia=1,aa=1,R=0,oa=!1;function sa(e){return Yt(e,7)}function z(){return{units:[],activeId:null,inspectId:null,actionSkillId:null,mode:`idle`,round:1,unitTurn:0,actionsLeftInRound:0,outcome:`ongoing`,damageTaken:0,hostilesEliminated:0,results:null,seed:1,objective:null,reinforcement:null,signalCarrierId:null,routingTraceAcquired:!1}}function ca(e){return e.units.find(t=>t.id===e.activeId)}function la(e){return e.foundationStage===`completed`?`full-broken-signal`:e.foundationStage}var B=dt((e,t)=>{let n=(n,r)=>{n&&(e({combatMoment:n}),L(1150).then(()=>{r===R&&t().combatMoment?.id===n.id&&e({combatMoment:null})}))},r=(n,r)=>{if(!n.length)return;let i=n.slice(0,5);e({combatFx:i}),L(Math.max(...i.map(e=>e.durationMs))+70).then(()=>{r===R&&t().combatFx[0]?.id===i[0].id&&e({combatFx:[]})})},i=(t,n,r)=>{let i=ia++;e(e=>({floats:[...e.floats,{id:i,unitId:t,text:n,kind:r}]})),L(900).then(()=>{e(e=>({floats:e.floats.filter(e=>e.id!==i)}))})},a=async(t,n)=>{for(let r of t){if(n!==R)return;if(r.type===`ticker`&&r.text&&e({ticker:r.text}),r.type===`banner`&&r.text){if(e({banner:r.text}),hr(`turn`),await L(520),n!==R)return;e({banner:null})}r.type===`damage`&&r.unitId&&r.text&&(hr(`hit`),e({impactId:r.unitId,impactKey:aa++}),i(r.unitId,r.text,r.kind??`dmg`),await L(280)),r.type===`heal`&&r.unitId&&r.text&&(hr(`heal`),i(r.unitId,r.text,`heal`),await L(240)),r.type===`status`&&r.unitId&&r.text&&(hr(`status`),i(r.unitId,r.text,r.kind??`status`),await L(180)),r.type===`expire`&&r.unitId&&r.text&&i(r.unitId,r.text,`info`),r.type===`defeat`&&r.unitId&&(i(r.unitId,r.text??`DOWN`,`info`),await L(260)),r.type===`move`&&hr(`move`)}},o=async n=>{let{battle:r}=t();if(r.outcome===`victory`)return e({busy:!0,banner:`SECTOR SECURED`,ticker:null,attackingId:null}),hr(`win`),await L(1400),n===R&&e({screen:`sector`,busy:!1,banner:null}),!0;if(r.outcome===`defeat`){if(e({busy:!0,banner:`OPERATION FAILED`,ticker:null,attackingId:null}),hr(`lose`),await L(1200),n!==R)return!0;let r=j(t().selectedMissionId);return e({screen:r?.activity===`FIELD_OP`||r?.operationId===we.operationId?`results`:`defeat`,busy:!1,banner:null}),r?.activity===`FIELD_OP`&&t().saveFieldResult(),!0}return!1},s=Wi(),c=async n=>{if(n!==R||await o(n))return;let r=Xn(t().battle);if(F&&(s=Ji(s,r.state),e({threats:s.pending.map(e=>e.plan)})),e({battle:r.state,queue:sa(r.state)}),await a(r.events,n),n!==R||await o(n))return;let i=ca(t().battle);if(F&&i?.team===`ally`&&(s=Yi(s,t().battle)),!i)e({busy:!1});else if(i.team===`enemy`){if(e({busy:!0,ticker:`${i.name}`}),await L(280),n!==R)return;await l(n)}else e({busy:!1,ticker:i.hasMoved?`${i.name}  ·  act`:`${i.name}  ·  move or act`})},l=async n=>{let r=t().battle,i=ca(r);if(!i||i.team!==`enemy`){await c(n);return}if(F&&s.interruptedEnemyIds?.includes(i.id)){s={...s,interruptedEnemyIds:s.interruptedEnemyIds.filter(e=>e!==i.id)};let t=tr(r);if(!t.ok)throw Error(`interrupted_enemy_could_not_skip`);e({battle:t.state,queue:sa(t.state),ticker:`INTERRUPTED · ENEMY TURN LOST`}),await a(t.events,n),n===R&&await c(n);return}if(F){let t=s.pending.find(e=>e.plan.enemyId===i.id);if(t){let i=Qi(s,r);if(s=i.cycle,e({threats:s.pending.map(e=>e.plan)}),i.state!==r){if(e({battle:i.state,queue:sa(i.state)}),await a(i.events??[],n),n!==R)return;await L(160),n===R&&await c(n);return}if(!s.pending.some(e=>e.plan.id===t.plan.id)){let t=tr(r);e({battle:t.state,queue:sa(t.state),ticker:`THREAT COUNTERED`}),await a(t.events,n),n===R&&await c(n);return}let o=tr(r);e({battle:o.state,queue:sa(o.state),ticker:`THREAT WAITING`}),await a(o.events,n),n===R&&await c(n);return}{let t=Zi(s,r);if(t.pending.length>s.pending.length){s=t,e({threats:s.pending.map(e=>e.plan)});let i=tr(r);e({battle:i.state,queue:sa(i.state),ticker:`ENEMY INTENT REVEALED`}),await a(i.events,n),n===R&&await c(n);return}}}let o=ir(r);o.type===`move`&&e({attackingId:null}),o.type===`skill`&&e({attackingId:i.id,lastActionSkillId:o.skillId});let l=rr(t().battle,o);e({battle:l.state,queue:sa(l.state),attackingId:o.type===`skill`?i.id:null}),await a(l.events,n),n===R&&(e({attackingId:null}),await L(160),await c(n))},u=async n=>{if(t().battle.routingTraceAcquired&&!oa){if(oa=!0,e({banner:`ROUTING TRACE ACQUIRED`,ticker:`Carrier signal recovered`}),hr(`status`),await L(900),n!==R)return;e({banner:null})}F&&(s=Ji(s,t().battle),e({threats:s.pending.map(e=>e.plan)})),!await o(n)&&await c(n)},d=t=>{e({progression:t,progressionStatus:`ready`,progressionError:null,progressionCommitPending:!1,onboardingEnabled:!0,onboardingStageId:la(t),foundationCompleted:t.completed})},f=async(n,r)=>{let i=t();if(i.screen!==`brief`||i.busy||i.kodaSavePending||i.shadowSavePending||i.progression?.operations?.[`broken-signal`]?.status!==`cleared`||r!==`A`&&r!==`B`)return;let a=n===`koda`?`kodaSavePending`:`shadowSavePending`;e({[a]:!0,progressionError:null});try{let e=await ai(li(`${n}-sidegrade`),i.progression.revision,n,r);e.revision>=(t().progression?.revision||0)&&d(e)}catch(r){let i=r instanceof P?r.state:null;i&&i.revision>=(t().progression?.revision||0)&&d(i),e({progressionError:`${n===`koda`?`CNC`:`SHADOW`} selection could not be saved. Retry your choice.`})}finally{e({[a]:!1})}},p=(n,r,i,o,c=!1,u=!1,d=null,f,p,m,h)=>{oa=!1,s=Wi();let g=zn(In()),{onboardingEnabled:_,onboardingStageId:v}=t(),y=i||Ni(_,v),b=o?{type:`RECOVER`,terminal:o,completed:!1}:c?{type:`BOSS`,targetId:`leader`}:null,x=c?{...be,spawn:{...be.spawn},telegraphed:u,spawned:!1}:null,ee=f?Ae(f,u,p,m):{objective:b,reinforcement:x,directive:null},S=Zn(g,y,ee.objective,ee.reinforcement,d,ee.directive,h);hr(`turn`),e({screen:`battle`,identity:g,battle:S.state,queue:sa(S.state),busy:!0,banner:null,ticker:null,floats:[],threats:[],attackingId:null,impactId:null,combatMoment:null,combatFx:[],currentRunKey:r,currentFieldContext:p||null,fieldResult:null,campaignResult:null,currentCampaignContext:m||null,continueRequestId:null}),(async()=>{if(await a(S.events,n),n!==R)return;let r=ca(t().battle);r?.team===`enemy`?await l(n):e({busy:!1,ticker:r?r.name+`  ·  move or act`:null})})()};return{screen:`hub`,battle:z(),busy:!1,banner:null,ticker:null,floats:[],threats:[],attackingId:null,lastActionSkillId:null,impactId:null,impactKey:0,combatMoment:null,combatFx:[],muted:!1,queue:[],identity:In(),onboardingEnabled:!1,onboardingStageId:Ai,onboardingCompleted:{},lastVictoryKey:null,currentRunKey:null,progression:null,progressionStatus:`idle`,progressionError:null,progressionCommitPending:!1,continueRequestId:null,foundationCompleted:!1,selectedMissionId:null,missionFirstClear:null,selectedSquadIds:[],selectedApproach:`standard`,selectedDirectiveTier:`standard`,currentFieldContext:null,fieldResult:null,campaignResult:null,currentCampaignContext:null,kodaSavePending:!1,shadowSavePending:!1,configureOnboarding:n=>{let r=t().onboardingEnabled,i=typeof n.enabled==`boolean`?n.enabled:r,a=t().onboardingStageId,o=t().onboardingCompleted,s=t().lastVictoryKey,c=t().currentRunKey;n.stageId!=null&&n.stageId!==``?a=Mi(n.stageId).id:i&&!r&&(a=Ai,o={},s=null,c=null),e({onboardingEnabled:i,onboardingStageId:a,onboardingCompleted:o,lastVictoryKey:s,currentRunKey:c})},loadFoundationProgression:async()=>{e({progressionStatus:`loading`,progressionError:null});try{let t=await ei();d(t),t.completed&&t.operations?.[`broken-signal`]&&e({screen:`war-table`})}catch(t){let n=t instanceof P?t.code:`progression_request_failed`,r=t instanceof P?t.state:null;r&&d(r),e({progressionStatus:r?`ready`:`error`,progressionError:n})}},refreshIdentity:()=>{e({identity:zn(In())}),Rn().then(t=>{t&&e({identity:zn(In())})})},upgradeGrowth:async(n,r,i,a)=>{let o=t(),s=o.progression?.playerGrowth;if(o.screen!==`war-table`||o.busy||o.progressionCommitPending||!o.progression||!s)return;let c=s.heroes.find(e=>e.heroId===n);if(!(!c||c.discipline&&c.discipline!==r||!(n===`alpha`&&[`vanguard`,`howlkeeper`].includes(r)||n===`ally-02`&&[`pursuer`,`disruptor`].includes(r)||n===`ally-03`&&[`sentinel`,`medic`].includes(r))||s.earnedPoints-s.spentPoints<1||(c.ranks[i]??0)+1!==a)){e({progressionCommitPending:!0,progressionError:null});try{let e=await oi(li(`growth-upgrade`),o.progression.revision,n,r,i,a);e.revision>=(t().progression?.revision??0)&&d(e)}catch(n){let r=n instanceof P?n.state:null;r&&r.revision>=(t().progression?.revision??0)&&d(r),e({progressionError:`Skillbook choice was not saved. Check your points or refresh and retry.`})}finally{e({progressionCommitPending:!1})}}},respecGrowth:async n=>{let r=t(),i=(r.progression?.playerGrowth)?.heroes.find(e=>e.heroId===n);if(!(r.screen!==`war-table`||r.busy||r.progressionCommitPending||!r.progression||!i||i.respecUsed||Object.keys(i.ranks).length===0)){e({progressionCommitPending:!0,progressionError:null});try{let e=await si(li(`growth-respec`),r.progression.revision,n);e.revision>=(t().progression?.revision??0)&&d(e)}catch(n){let r=n instanceof P?n.state:null;r&&r.revision>=(t().progression?.revision??0)&&d(r),e({progressionError:`Respec was not saved. Refresh your Skillbook and try again.`})}finally{e({progressionCommitPending:!1})}}},selectMastery:async(n,r)=>{let i=t();if([`brief`,`war-table`].includes(i.screen)&&!i.busy&&!i.progressionCommitPending&&i.progression){e({progressionCommitPending:!0,progressionError:null});try{let e=await ci(li(`pack-mastery`),i.progression.revision,n,r);d(e)}catch(t){let n=t instanceof P?t.state:null;n&&d(n),e({progressionError:t instanceof P&&t.code===`mastery_run_active`?`Finish this companion's committed attempt before changing mastery.`:`Mastery option could not be saved. Refresh and retry.`})}finally{e({progressionCommitPending:!1})}}},selectDirectiveTier:n=>{let r=t();r.screen!==`brief`||r.busy||r.progressionCommitPending||j(r.selectedMissionId)?.activity!==`FIELD_OP`||!r.progression?.fieldOps?.commander?.unlockedDirectiveTiers?.includes(n)||e({selectedDirectiveTier:n})},selectApproach:n=>{let r=t();r.screen!==`brief`||r.busy||j(r.selectedMissionId)?.activity!==`FIELD_OP`||r.progression?.fieldOps?.commander?.unlockedApproaches.includes(n)&&e({selectedApproach:n})},saveFieldResult:async()=>{let n=t();if(n.screen!==`results`||n.progressionCommitPending||!n.currentRunKey||!n.progression||j(n.selectedMissionId)?.activity!==`FIELD_OP`||n.fieldResult?.runId===n.currentRunKey)return;let r=C(n.battle);if(!r)return;let i=n.continueRequestId||li(`mission-continue`);e({progressionCommitPending:!0,progressionError:null,continueRequestId:i});try{let a=await ii(i,n.progression.revision,n.currentRunKey,!1,r);if(!a.fieldResult||a.fieldResult.runId!==n.currentRunKey)throw new P(`invalid_progression_response`);if(t().currentRunKey!==n.currentRunKey)return;d(a.state),e({fieldResult:a.fieldResult,progressionCommitPending:!1})}catch(r){if(t().currentRunKey!==n.currentRunKey)return;let i=r instanceof P?r.state:null;i&&d(i);let a=i?.fieldOps?.lastResult;a?.runId===n.currentRunKey?e({fieldResult:a,progressionError:null,progressionCommitPending:!1}):e({progressionCommitPending:!1,progressionError:`Result could not be recorded. Retry saving before returning or replaying.`})}},saveCampaignResult:async()=>{let n=t(),r=j(n.selectedMissionId);if(r?.operationId!==we.operationId||n.screen!==`results`||n.progressionCommitPending||!n.currentRunKey||!n.progression||!n.battle.results||n.battle.outcome===`ongoing`||n.campaignResult?.runId===n.currentRunKey)return;let i=n.battle.results,a={victory:n.battle.outcome===`victory`,turns:i.turns,objectiveComplete:n.battle.outcome===`victory`,squadStanding:i.squadStanding,squadDeployed:i.squadDeployed,...n.battle.failureReason?{failureReason:n.battle.failureReason}:{}},o=n.continueRequestId||li(`mission-continue`);e({progressionCommitPending:!0,progressionError:null,continueRequestId:o});try{let r=await ii(o,n.progression.revision,n.currentRunKey,!1,void 0,a);if(!r.campaignResult||r.campaignResult.runId!==n.currentRunKey)throw new P(`invalid_progression_response`);if(t().currentRunKey!==n.currentRunKey)return;d(r.state),e({campaignResult:r.campaignResult,progressionCommitPending:!1})}catch(i){if(t().currentRunKey!==n.currentRunKey)return;let o=i instanceof P?i.state:null;if(o&&(d(o),o.operations?.[we.operationId]?.lastCompletedMissionRunId===n.currentRunKey)){e({campaignResult:{...a,runId:n.currentRunKey,missionId:r.missionId,intelEarned:!1},progressionCommitPending:!1,progressionError:null});return}e({progressionCommitPending:!1,progressionError:`Campaign record not saved. Retry before exiting or deploying again.`})}},openBrief:()=>{let n=t();n.foundationCompleted||n.progressionStatus===`error`||(hr(`ui`),e({screen:`brief`,identity:zn(In())}))},openOperationBrief:n=>{let r=t(),i=j(n);if(i?.activity===`FIELD_OP`&&!r.progression?.fieldOps?.board?.activeMissionIds.includes(n)&&r.progression?.fieldOps?.activeMissionRun?.missionId!==n){e({screen:`war-table`,progressionError:`That Field Op is no longer active. Choose one of the current three missions.`,selectedMissionId:null});return}let a=i?.activity===`FIELD_OP`?`available`:r.progression?.operations?.[i?.operationId||`broken-signal`]?.missions[n];if(!r.foundationCompleted||!i||!a||a===`locked`)return;hr(`ui`);let o=i.activity===`FIELD_OP`?r.progression?.fieldOps?.activeMissionRun:r.progression?.operations?.[i.operationId]?.activeMissionRun,s=o?.missionId===n?o.squadIds:r.progression?.fieldOps?.records[n]?.squadIds,c=s&&Se(s,r.progression?.equippedPet)?[...s]:[`alpha`,`ally-02`,`ally-03`];e({screen:`brief`,selectedMissionId:n,campaignResult:null,currentCampaignContext:o?.campaignContext||null,selectedDirectiveTier:o?.missionId===n&&o.fieldContext?.directiveTier||`standard`,selectedApproach:o?.missionId===n&&o.fieldContext?.approach||`standard`,fieldResult:null,missionFirstClear:null,selectedSquadIds:i.squadCap===3?c:[],progressionError:null,identity:zn(In())})},backToHub:()=>{let n=t();n.progressionCommitPending||(n.screen===`results`&&j(n.selectedMissionId)?.activity===`FIELD_OP`&&!n.fieldResult?n.saveFieldResult():n.screen===`results`&&j(n.selectedMissionId)?.operationId===we.operationId&&!n.campaignResult?n.saveCampaignResult():(R++,hr(`ui`),e({screen:t().foundationCompleted&&t().progression?.operations?.[`broken-signal`]?`war-table`:`hub`,battle:z(),banner:null,ticker:null,busy:!1,floats:[],queue:[],identity:zn(In()),selectedMissionId:null,missionFirstClear:null,selectedSquadIds:[]})))},deploy:()=>{if(t().busy||t().progressionCommitPending||t().kodaSavePending||t().shadowSavePending)return;let n=++R,r=t();if(r.onboardingEnabled&&r.progression){if(r.progressionStatus!==`ready`)return;if(r.foundationCompleted){let t=j(r.selectedMissionId);if(!t||!t.executable)return;if(t.activity===`FIELD_OP`&&!r.progression.fieldOps?.board){e({progressionError:`Refresh the War Table before deploying.`});return}let i=t.activity===`FIELD_OP`||t.operationId===we.operationId||t.objectiveType===`RECOVER`||t.objectiveType===`BOSS`?r.selectedSquadIds:void 0;if(!ke(t,i||[],r.progression.equippedPet,r.selectedApproach)){e({progressionError:t.objectiveType===`BOSS`?`Choose exactly two companions for ALPHA.`:`Choose CNC, SHADOW or your equipped PET to accompany ALPHA.`});return}e({busy:!0,ticker:`Preparing operation run…`,progressionError:null}),(async()=>{try{let e=await ri(li(`mission-start`),r.progression.revision,t.missionId,i,t.activity===`FIELD_OP`?{cycleId:r.progression.fieldOps.board.cycleId,approach:r.selectedApproach,...r.progression.fieldOps.board.reportVersion===3?{reportVersion:3,directiveTier:r.selectedDirectiveTier}:{}}:void 0);if(n!==R)return;d(e.state);let a=Oe(t,e.run.fieldContext),o=e.run.combatProfileV2?.pet,s=o?{id:o.id,name:o.name,img:o.img}:e.state.equippedPet,c=ke(a,e.run.squadIds,s,e.run.fieldContext?.approach);if(!c)throw new P(`invalid_progression_response`);p(n,e.run.runId,Lr(na(c,{...e.state,packMastery:e.run.packMastery||{}}),e.run.combatProfileV3||null,e.run.combatProfileV2),a.objectiveType===`RECOVER`?a.terminal:void 0,t.objectiveType===`BOSS`,r.progression.intel?.routingTrace===!0,t.missionId===`broken-signal-breach`?`h1`:null,a,e.run.fieldContext,e.run.campaignContext,e.run.playerGrowth||null)}catch(t){if(n!==R)return;let r=t instanceof P?t.code:`progression_request_failed`,i=t instanceof P?t.state:null;i&&d(i),e({screen:`war-table`,busy:!1,ticker:null,progressionError:r,selectedMissionId:null})}})();return}e({busy:!0,ticker:`Preparing Foundation run…`,progressionError:null}),(async()=>{try{let t=await ti(li(`start`),r.progression.revision);if(n!==R)return;if(d(t),t.completed||!t.activeRunId){e({screen:`war-table`,battle:z(),busy:!1,ticker:null});return}p(n,t.activeRunId)}catch(t){if(n!==R)return;let r=t instanceof P?t.code:`progression_request_failed`,i=t instanceof P?t.state:null;i&&d(i),e({screen:`brief`,busy:!1,ticker:null,progressionError:r})}})();return}let i=zn(In()),{onboardingEnabled:o,onboardingStageId:s}=t(),c=Zn(i,Ni(o,s));hr(`turn`),e({screen:`battle`,identity:i,battle:c.state,queue:sa(c.state),busy:!0,banner:null,ticker:null,floats:[],attackingId:null,impactId:null,currentRunKey:`${s}:${n}`}),(async()=>{if(await a(c.events,n),n!==R)return;let r=ca(t().battle);r?.team===`enemy`?await l(n):e({busy:!1,ticker:r?`${r.name}  ·  move or act`:null})})()},inspectUnit:n=>{let{battle:r,busy:i,screen:a}=t();if(i||a!==`battle`)return;let o=r.units.find(e=>e.id===n);o&&!o.defeated&&(r.mode===`targeting`&&r.actionSkillId?t().selectTarget(n):(hr(`select`),e({battle:{...r,inspectId:r.inspectId===n?null:n}})))},selectCell:(i,a)=>{let{battle:o,busy:s,screen:c}=t();if(s||c!==`battle`)return;let l=o.units.find(e=>!e.defeated&&e.c===i&&e.r===a);if(l){t().inspectUnit(l.id);return}if(o.mode===`targeting`){e({battle:{...o,mode:`selected`,actionSkillId:null}});return}let u=ca(o);if(!u||u.team!==`ally`||u.hasMoved||u.hasActed)return;let d=er(o,i,a);if(!d.ok)return;hr(`move`),e({battle:d.state,queue:sa(d.state),ticker:`${u.name}  ·  repositions`});let f=d.state.units.find(e=>e.id===u.id);f&&(n(yi(u,f,aa++),R),r(wi(u,f,aa++),R))},selectSkill:i=>{let{battle:o,busy:s}=t();if(s)return;let c=ca(o);if(!c||c.team!==`ally`||c.hasActed||c.defeated||!c.skillIds.includes(i))return;let l=at(Zt(i),c.growth);if((c.cooldowns[i]??0)>0)return;if(o.mode===`targeting`&&o.actionSkillId===i){e({battle:{...o,mode:`selected`,actionSkillId:null}});return}if(hr(`select`),!Ut(l)){let t=++R;e({busy:!0,attackingId:c.id,lastActionSkillId:i});let s=nr(o,i);if(!s.ok){e({busy:!1,attackingId:null,ticker:`${c.name}  ·  no target in range`});return}e({battle:s.state,queue:sa(s.state)}),n(vi(c,i,s.events,aa++,!1),t),r(Ci(c,i,s.events,aa++,!1),t),(async()=>{await a(s.events,t),e({attackingId:null}),await u(t)})();return}let d=Ht(o.units,c,l);e({battle:{...o,mode:`targeting`,actionSkillId:i,inspectId:null},ticker:d.length===0?l.maxRange<=1?`${c.name}  ·  melee — move adjacent`:`${c.name}  ·  no target in range`:l.desc})},selectTarget:i=>{let{battle:o,busy:c}=t();if(c||o.mode!==`targeting`||!o.actionSkillId)return;let l=ca(o);if(!l||l.hasActed)return;let d=++R,f=o.actionSkillId;e({busy:!0,attackingId:l.id,lastActionSkillId:f});let p=nr(o,f,i);if(!p.ok){e({busy:!1,attackingId:null});return}let m=F?$i(s,o,p.state,l.id,i,f,p.events):{cycle:s,interrupted:!1};m.interrupted&&(s=m.cycle),e({battle:p.state,queue:sa(p.state),...m.interrupted?{threats:s.pending.map(e=>e.plan)}:{}}),n(vi(l,f,p.events,aa++,m.interrupted),d),r(Ci(l,f,p.events,aa++,m.interrupted),d),(async()=>{await a(p.events,d),m.interrupted&&(e({ticker:`SIGNAL INTERRUPTED · ENEMY INTENT CANCELED`}),hr(`status`)),e({attackingId:null}),await u(d)})()},selectRecover:()=>{let{battle:n,busy:i}=t();if(i)return;let o=ca(n);if(!o||o.team!==`ally`||o.hasActed||o.defeated)return;let s=$n(n);if(!s.ok){e({ticker:`${o.name}  ·  move adjacent to the relay terminal`});return}let c=++R;e({busy:!0,battle:s.state,queue:sa(s.state),ticker:`SIGNAL RECOVERED`}),n.objective?.type===`RECOVER`&&r([Si(`objective_recover`,aa++,void 0,n.objective.terminal)],c),(async()=>{await a(s.events,c),await u(c)})()},selectKodaSidegrade:e=>f(`koda`,e),selectShadowSidegrade:e=>f(`shadow`,e),toggleCommanderTeammate:n=>{let r=t();if(r.screen!==`brief`||r.busy||r.kodaSavePending||r.shadowSavePending||r.selectedMissionId!==`broken-signal-commander`&&j(r.selectedMissionId)?.activity!==`FIELD_OP`&&j(r.selectedMissionId)?.operationId!==we.operationId||!xe([`alpha`,n],r.progression?.equippedPet))return;let i=r.selectedSquadIds.slice(1);e({selectedSquadIds:[`alpha`,...i.includes(n)?i.filter(e=>e!==n):i.length<2?[...i,n]:i],progressionError:null})},selectRecoverTeammate:n=>{let r=t();r.screen!==`brief`||r.busy||r.kodaSavePending||r.shadowSavePending||r.selectedMissionId!==`broken-signal-recover`||xe([`alpha`,n],r.progression?.equippedPet)&&e({selectedSquadIds:[`alpha`,n],progressionError:null})},skipTurn:()=>{let{battle:n,busy:r}=t();if(r)return;let i=ca(n);if(!i||i.team!==`ally`||i.hasActed)return;let a=++R,o=tr(n);o.ok&&(e({battle:o.state,busy:!0,ticker:o.events[0]?.text??null}),u(a))},cancel:()=>{let{battle:n,busy:r}=t();r||(n.mode===`targeting`?e({battle:{...n,mode:`selected`,actionSkillId:null}}):e({battle:{...n,inspectId:null}}))},replay:()=>{let e=t();if(!e.progressionCommitPending){if(j(e.selectedMissionId)?.operationId===we.operationId&&e.screen===`results`){if(!e.campaignResult){e.saveCampaignResult();return}e.continueOnboarding(!0)}else j(e.selectedMissionId)?.activity===`FIELD_OP`?e.screen===`results`?e.continueOnboarding(!0):e.selectedMissionId&&(R++,e.openOperationBrief(e.selectedMissionId)):e.deploy()}},continueOnboarding:(n=!1)=>{let r=t();if(r.screen!==`results`)return;if(j(r.selectedMissionId)?.activity===`FIELD_OP`){if(!r.fieldResult){t().saveFieldResult();return}if(r.progressionCommitPending)return;t().backToHub(),n&&r.selectedMissionId&&(t().openOperationBrief(r.selectedMissionId),t().selectDirectiveTier(r.selectedDirectiveTier),t().selectApproach(r.selectedApproach));return}if(j(r.selectedMissionId)?.operationId===we.operationId){if(r.progressionCommitPending)return;if(!r.campaignResult){r.saveCampaignResult();return}let e=r.selectedMissionId;t().backToHub(),n&&e&&t().openOperationBrief(e);return}if(r.battle.outcome!==`victory`)return;if(r.foundationCompleted&&r.selectedMissionId){if(r.progressionCommitPending||!r.currentRunKey||!r.progression)return;let i=r.continueRequestId||li(`mission-continue`);e({progressionCommitPending:!0,progressionError:null,continueRequestId:i}),(async()=>{try{let a=await ii(i,r.progression.revision,r.currentRunKey,r.selectedMissionId===`broken-signal-breach`&&r.battle.routingTraceAcquired);d(a.state),R++,hr(`ui`),e({screen:`war-table`,battle:z(),banner:null,ticker:null,busy:!1,floats:[],queue:[],currentRunKey:null,continueRequestId:null,missionFirstClear:j(r.selectedMissionId)?.activity===`FIELD_OP`?null:a.firstClear,selectedMissionId:null,selectedSquadIds:[]}),n===!0&&r.selectedMissionId&&t().openOperationBrief(r.selectedMissionId)}catch(t){let n=t instanceof P?t.code:`progression_request_failed`,r=t instanceof P?t.state:null;r&&d(r),e({progressionCommitPending:!1,progressionError:n})}})();return}if(!r.onboardingEnabled){t().backToHub();return}if(r.progression){if(r.progressionCommitPending||!r.currentRunKey)return;let t=r.continueRequestId||li(`continue`);e({progressionCommitPending:!0,progressionError:null,continueRequestId:t}),(async()=>{try{let n=await ni(t,r.progression.revision,r.currentRunKey);if(d(n),R++,hr(`ui`),n.completed){e({screen:`war-table`,battle:z(),banner:null,ticker:null,busy:!1,floats:[],queue:[],currentRunKey:null,continueRequestId:null});return}e({screen:`brief`,battle:z(),banner:null,ticker:null,busy:!1,floats:[],queue:[],currentRunKey:null,continueRequestId:null,identity:zn(In())})}catch(t){let n=t instanceof P?t.code:`progression_request_failed`,i=t instanceof P?t.state:null;i&&(d(i),i.completed?e({screen:`war-table`,battle:z(),currentRunKey:null,continueRequestId:null}):i.foundationStage!==r.onboardingStageId&&e({screen:`brief`,battle:z(),currentRunKey:null,continueRequestId:null})),e({progressionCommitPending:!1,progressionError:n})}})();return}let i=Mi(r.onboardingStageId),a=r.currentRunKey;if(a&&r.lastVictoryKey!==a){let n={...r.onboardingCompleted,[i.id]:!0},o=i.next;if(e({onboardingCompleted:n,lastVictoryKey:a,onboardingStageId:o??i.id}),!o){t().backToHub();return}}else if(!i.next){t().backToHub();return}R++,hr(`ui`),e({screen:`brief`,battle:z(),banner:null,ticker:null,busy:!1,floats:[],queue:[],identity:zn(In())})},dismissSector:()=>{hr(`ui`),e({screen:`results`}),j(t().selectedMissionId)?.activity===`FIELD_OP`&&t().saveFieldResult(),j(t().selectedMissionId)?.operationId===we.operationId&&t().saveCampaignResult()},toggleMute:()=>{let n=!t().muted;fr(n),e({muted:n})}}});function ua(){let e=B.getState(),t=e.battle,n=ca(t),r=e.identity;return{version:ra,screen:e.screen,turn:t.round,phase:n?.team===`enemy`?`enemy`:`player`,mode:t.mode,selectedId:t.activeId,busy:e.busy,units:t.units.map(e=>({id:e.id,name:e.name,side:e.team,hp:e.hp,maxHp:e.maxHp,atk:e.atk,def:e.def,spd:e.spd,move:e.move,c:e.c,r:e.r,hasMoved:e.hasMoved,hasActed:e.hasActed,guarding:e.statuses.some(e=>e.type===`GUARD`),defeated:e.defeated,strikeRange:ar(e),statuses:e.statuses,cooldowns:e.cooldowns})),results:t.results,activeId:t.activeId,queue:e.queue,identity:{source:r.source,live:r.live,unitName:r.unitName,skinKey:r.skinKey,skinName:r.skinName,weapon:r.weaponLabel,armor:r.armorLabel,summary:r.summary}}}function da(){let{battle:e,busy:t}=B.getState();if(t||e.mode===`targeting`)return[];let n=ca(e);return!n||n.team!==`ally`||n.hasMoved||n.hasActed||n.defeated?[]:Ft(n,e.units)}function fa(){let{battle:e}=B.getState(),t=new Set;if(e.mode!==`targeting`||!e.actionSkillId)return t;let n=ca(e);if(!n)return t;try{let r=at(Zt(e.actionSkillId),n.growth);for(let i of Ht(e.units,n,r))t.add(i)}catch{}return t}typeof window<`u`&&(window.__tactical=B);var pa={"alpha-rend":{archetype:`heavy`,cue:`CLOSE · BLEED`,effectClass:`control`},"alpha-howl":{archetype:`support`,cue:`AURA · R2`,targetClass:`aura`,effectClass:`buff`},"pet-hamstring":{archetype:`control`,cue:`CLOSE · SLOW`,effectClass:`control`},"u02-suppress":{archetype:`control`,cue:`CONTROL · 3`,effectClass:`control`},"u02-pressure-disruptor":{archetype:`control`,cue:`CONTROL · 3`,effectClass:`control`},"u03-mend":{archetype:`heal`,cue:`ALLY · 3`,targetClass:`ally`,effectClass:`heal`},"u03-mend-restorer":{archetype:`heal`,cue:`AURA · R1`,targetClass:`aura`,effectClass:`heal`},"u03-pack":{archetype:`support`,cue:`AURA · R2`,targetClass:`aura`,effectClass:`buff`},"u03-pack-warden":{archetype:`support`,cue:`AURA · R2`,targetClass:`aura`,effectClass:`buff`}};function ma(e){return e.targetType===`ALLY_AOE`?`aura`:e.targetType===`ALLY_SINGLE`||e.targetType===`SELF`?`ally`:`enemy`}function ha(e){if(e.effects.some(e=>e.kind===`heal`))return`heal`;let t=e.effects.filter(e=>e.kind===`status`);return t.some(e=>e.status&&String(e.status).endsWith(`_DOWN`))||t.some(e=>e.status===`BLEED`)?`control`:t.length?`buff`:`damage`}function ga(e,t){return t===`heal`?`heal`:t===`control`?`control`:t===`buff`?`support`:e.effects.some(e=>e.kind===`damage`&&(e.multiplier??1)>=1.35)?`heavy`:`strike`}function _a(e,t){return e.targetType===`ALLY_AOE`?`AURA · R${Math.max(1,e.radius)}`:e.targetType===`ALLY_SINGLE`?`ALLY · ${e.maxRange}`:e.targetType===`SELF`?`SELF`:t===`control`?e.maxRange<=1?`CLOSE · CTRL`:`CONTROL · ${e.maxRange}`:e.maxRange<=1?`CLOSE · 1`:`REACH · ${e.maxRange}`}function va(e){let t=ha(e),n={archetype:ga(e,t),cue:_a(e,t),targetClass:ma(e),effectClass:t},r=pa[it(e.id)]||{};return{...n,...r,cue:e.targetType===`ALLY_AOE`?`AURA · R${Math.max(1,e.radius)}`:_a(e,t)}}var ya={archetype:`objective`,cue:`OBJECTIVE`,targetClass:`objective`,effectClass:`objective`};function ba(e,t){if(e.outcome!==`ongoing`)return null;let n=e.units.find(t=>t.id===e.activeId);if(!n||n.team!==`ally`||n.defeated||n.hasActed)return null;let r=e.units.filter(e=>!e.defeated&&e.team===`ally`),i=e.units.some(e=>e.defId===`alpha`&&e.defeated);if(e.mode===`targeting`&&e.actionSkillId){let t=at(Zt(e.actionSkillId),n.growth),r=Ht(e.units,n,t).length;return r===0?{title:`NO TARGET IN RANGE`,copy:n.hasMoved?`This skill cannot hit from here. Tap the skill again to cancel, then choose another ability or SKIP.`:`Tap the skill again to cancel. Move closer, then try again.`}:{title:`TARGET READY`,copy:`Tap one of the ${r} highlighted legal targets to use ${t.name}.`}}let a=n.skillIds.map(e=>at(Zt(e),n.growth)).filter(e=>(n.cooldowns[e.id]??0)===0).some(t=>(t.targetType===`ENEMY_SINGLE`||t.targetType===`AREA_RADIUS`)&&Ht(e.units,n,t).length>0);return i&&r.length>0?{title:`THE PACK FIGHTS ON`,copy:a?`${n.name} can still attack. Select a skill and a highlighted target.`:n.hasMoved?`${n.name} has no enemy in range. Use a support skill or SKIP to pass the turn.`:`${n.name} is still active. Move into range, use support, or SKIP.`}:!a&&!n.hasMoved&&Ft(n,e.units).length>0?{title:`POSITION FIRST`,copy:`No enemy in attack range. Move into range or use an available support skill.`}:!a&&n.hasMoved?{title:`NO ATTACK IN RANGE`,copy:`Use an available support skill or SKIP. Your next turn will come.`}:t?.objectiveType===`HOLD`?{title:`HOLD THE RELAY`,copy:`Keep a living ally inside the marked zone. Clear enemies contesting it.`}:t?.objectiveType===`SURVIVE`?{title:`SURVIVE THE WAVES`,copy:`Keep your squad standing until the required round. Eliminating enemies early does not end the timer.`}:t?.objectiveType===`RECOVER`?{title:`REACH THE RELAY`,copy:`Approach the terminal and activate RECOVER when the signal is open.`}:null}var xa=`/images/tactical_ops/emblems`,Sa={alpha:{core:`${xa}/emblem_alpha_core.png`,vanguard:`${xa}/emblem_alpha_vanguard.png`,howlkeeper:`${xa}/emblem_alpha_howlkeeper.png`},"ally-02":{core:`${xa}/emblem_cnc_core.png`,pursuer:`${xa}/emblem_cnc_pursuer.png`,disruptor:`${xa}/emblem_cnc_disruptor.png`},"ally-03":{core:`${xa}/emblem_shadow_core.png`,sentinel:`${xa}/emblem_shadow_sentinel.png`,medic:`${xa}/emblem_shadow_medic.png`}};function Ca(e,t){if(!Object.prototype.hasOwnProperty.call(Sa,e))return null;let n=Sa[e];return(t&&Object.prototype.hasOwnProperty.call(n,t)?n[t]:n.core)||null}var wa={action_alpha_strike:`/images/tactical_ops/actions/action_alpha_strike.png`,action_alpha_rend:`/images/tactical_ops/actions/action_alpha_rend.png`,action_alpha_howl:`/images/tactical_ops/actions/action_alpha_howl.png`,action_cnc_thrust:`/images/tactical_ops/actions/action_cnc_thrust.png`,action_cnc_lunge:`/images/tactical_ops/actions/action_cnc_lunge.png`,action_cnc_pressure:`/images/tactical_ops/actions/action_cnc_pressure.png`,action_shadow_sweep:`/images/tactical_ops/actions/action_shadow_sweep.png`,action_shadow_mend:`/images/tactical_ops/actions/action_shadow_mend.png`,action_shadow_pack_support:`/images/tactical_ops/actions/action_shadow_pack_support.png`,action_pet_bite:`/images/tactical_ops/actions/action_pet_bite.png`,action_pet_hamstring:`/images/tactical_ops/actions/action_pet_hamstring.png`,action_system_move:`/images/tactical_ops/actions/action_system_move.png`,action_system_recover:`/images/tactical_ops/actions/action_system_recover.png`,action_system_skip:`/images/tactical_ops/actions/action_system_skip.png`},Ta={"alpha-strike":`action_alpha_strike`,"alpha-rend":`action_alpha_rend`,"alpha-howl":`action_alpha_howl`,"u02-shot":`action_cnc_thrust`,"u02-burst":`action_cnc_lunge`,"u02-lunge-vanguard":`action_cnc_lunge`,"u02-suppress":`action_cnc_pressure`,"u02-pressure-disruptor":`action_cnc_pressure`,"u03-tap":`action_shadow_sweep`,"u03-mend":`action_shadow_mend`,"u03-mend-restorer":`action_shadow_mend`,"u03-pack":`action_shadow_pack_support`,"u03-pack-warden":`action_shadow_pack_support`,"pet-bite":`action_pet_bite`,"pet-hamstring":`action_pet_hamstring`};function Ea(e){let t=Ta[e.split(`:mastery:`)[0]];return t?wa[t]:null}function Da(e){return e===`move`?wa.action_system_move:e===`recover`?wa.action_system_recover:wa.action_system_skip}var Oa=s((e=>{var t=Symbol.for(`react.transitional.element`),n=Symbol.for(`react.fragment`);function r(e,n,r){var i=null;if(r!==void 0&&(i=``+r),n.key!==void 0&&(i=``+n.key),`key`in n)for(var a in r={},n)a!==`key`&&(r[a]=n[a]);else r=n;return n=r.ref,{$$typeof:t,type:e,key:i,ref:n===void 0?null:n,props:r}}e.Fragment=n,e.jsx=r,e.jsxs=r})),V=s(((e,t)=>{t.exports=Oa()}))(),ka={battlefield:`/images/tactical_ops/presentation/tactical_ops_battlefield_backdrop.png`,traceTarget:`/images/tactical_ops/presentation/tactical_ops_trace_target.png`,signalRecovery:`/images/tactical_ops/presentation/tactical_ops_signal_recovery_marker.png`,bossTarget:`/images/tactical_ops/presentation/tactical_ops_boss_target.png`,reinforcementWarning:`/images/tactical_ops/presentation/tactical_ops_reinforcement_warning.png`};function Aa(){if(typeof window>`u`)return null;let e=window,t=e.__PROFILE__||e.PROFILE||e.profileState||e.lastProfile||{},n=t.level??t.lv??t.hero_level??t.heroLevel,r=typeof n==`number`?n:Number(n);return Number.isFinite(r)&&r>0?Math.floor(r):null}function ja(e){return e===`ATK_UP`||e===`DEF_UP`||e===`SPD_UP`||e===`GUARD`}function Ma(e){return e.role===`leader`?`leader`:e.role===`hostile`?`hound`:e.role===`alpha`?`alpha`:e.role===`ranged`||e.role===`skirmisher`?`skirmisher`:e.role===`support`?`support`:``}function Na({archetype:e}){let t={className:`t-act-svg`,"aria-hidden":!0};return e===`strike`?(0,V.jsx)(Ye,{...t}):e===`heavy`?(0,V.jsx)(Ve,{...t}):e===`control`?(0,V.jsx)(We,{...t}):e===`heal`?(0,V.jsx)(Ge,{...t}):e===`support`?(0,V.jsx)(Je,{...t}):e===`objective`?(0,V.jsx)(Ze,{...t}):(0,V.jsx)(Xe,{...t})}function Pa({src:e,archetype:t,fallback:n}){let r=n===`skip`?(0,V.jsx)(Ue,{className:`t-act-svg`,"aria-hidden":`true`}):(0,V.jsx)(Na,{archetype:t});return e?(0,V.jsxs)(`span`,{className:`t-act-art`,"aria-hidden":`true`,children:[(0,V.jsx)(`img`,{className:`t-act-image`,src:e,alt:``,draggable:!1,decoding:`async`,onError:e=>e.currentTarget.parentElement?.classList.add(`has-icon-error`)}),(0,V.jsx)(`span`,{className:`t-act-fallback`,children:r})]},e):r}function Fa(e,t,n){let r=t-n;return r===0?`${e} ${t}`:`${e} ${r>0?`+`:``}${r}`}function Ia({selected:e,guarding:t}){return(0,V.jsxs)(`svg`,{className:`t-ring`,viewBox:`0 0 100 36`,"aria-hidden":`true`,children:[(0,V.jsx)(`ellipse`,{cx:`50`,cy:`22`,rx:e?40:34,ry:e?12:10,fill:`none`,stroke:`currentColor`,strokeWidth:e?1.8:1.2,opacity:e?.95:.55}),(0,V.jsx)(`ellipse`,{cx:`50`,cy:`22`,rx:e?32:26,ry:e?9:7,fill:`none`,stroke:`currentColor`,strokeWidth:`0.7`,opacity:`0.4`,strokeDasharray:`2 3`}),t?(0,V.jsx)(`ellipse`,{cx:`50`,cy:`22`,rx:`44`,ry:`13.5`,fill:`none`,stroke:`currentColor`,strokeWidth:`1`,opacity:`0.85`}):null]})}function La({unit:e,selected:t,validTarget:n,targeting:r,attacking:i,inspecting:a,signalCarrier:o,interceptTarget:s=!1}){let c=Lt(e.c,e.r),l=B(e=>e.inspectUnit),u=B(e=>e.selectTarget),d=[`t-token`,e.team,Ma(e),e.defeated?`defeated`:``,e.hasActed?`acted`:``,t?`selected active`:``,a?`inspect`:``,r&&!n&&!t?`subdued`:``,r&&n?`targetable`:``,i?`attacking`:``,o?`trace-carrier`:``,e.role===`leader`?`boss-target`:``,`depth-${Math.max(0,Math.min(4,Math.floor(e.r*4/(pt-1))))}`,e.c<=1?`edge-left`:``,e.c>=N-2?`edge-right`:``].filter(Boolean).join(` `),f=i&&e.attackSprite?e.attackSprite:e.sprite;return(0,V.jsxs)(`div`,{className:d,style:{left:`${c.x}%`,top:`${c.y}%`,zIndex:4+e.r*4+(t?2:0)},children:[(0,V.jsx)(Ia,{selected:t,guarding:e.statuses.some(e=>e.type===`GUARD`)&&!e.defeated}),r&&n&&!e.defeated?(0,V.jsxs)(`span`,{className:`t-target-reticle ${e.team}`,"aria-hidden":`true`,children:[(0,V.jsx)(`i`,{}),(0,V.jsx)(`i`,{}),(0,V.jsx)(`i`,{}),(0,V.jsx)(`i`,{})]}):null,e.archetype&&!e.defeated?(0,V.jsx)(`span`,{className:`t-enemy-archetype t-archetype-${e.archetype.toLowerCase()}`,"aria-label":`Enemy class: ${e.archetype}`,children:e.archetype}):null,o&&!e.defeated?(0,V.jsxs)(V.Fragment,{children:[(0,V.jsx)(`img`,{className:`t-token-marker trace`,src:ka.traceTarget,alt:``}),(0,V.jsx)(`span`,{className:`t-objective-badge trace`,children:`TRACE TARGET`})]}):null,s&&!e.defeated?(0,V.jsxs)(V.Fragment,{children:[(0,V.jsx)(`img`,{className:`t-token-marker trace`,src:ka.traceTarget,alt:``}),(0,V.jsx)(`span`,{className:`t-objective-badge trace`,children:`COURIER`})]}):null,e.role===`leader`&&!e.defeated?(0,V.jsxs)(V.Fragment,{children:[(0,V.jsx)(`img`,{className:`t-token-marker boss`,src:ka.bossTarget,alt:``}),(0,V.jsx)(`span`,{className:`t-objective-badge boss`,children:`BOSS`})]}):null,(0,V.jsx)(`img`,{className:`body`,src:f,alt:``,draggable:!1}),(0,V.jsx)(`button`,{type:`button`,className:`t-hit`,"aria-label":e.name,onPointerDown:t=>{t.stopPropagation(),ur(),r&&n?u(e.id):l(e.id)}}),e.defeated?null:(0,V.jsxs)(`div`,{className:`t-plate`,children:[(0,V.jsx)(`div`,{className:`t-plate-name`,children:(0,V.jsx)(`span`,{children:e.name})}),(0,V.jsxs)(`div`,{className:`t-hp`,children:[(0,V.jsx)(`div`,{className:`t-hp-bar`,children:(0,V.jsx)(`i`,{style:{width:`${e.hp/e.maxHp*100}%`}})}),(0,V.jsxs)(`span`,{className:`t-hp-num`,children:[e.hp,`/`,e.maxHp]})]}),e.statuses.length?(0,V.jsx)(`div`,{className:`t-chips`,children:e.statuses.slice(0,3).map(e=>(0,V.jsx)(`span`,{className:`t-chip ${ja(e.type)?`buff`:`debuff`}`,children:Et[e.type]},e.id))}):null,o&&!e.defeated?(0,V.jsx)(`div`,{className:`t-chips`,children:(0,V.jsx)(`span`,{className:`t-chip buff`,children:`TRACE`})}):null]})]})}function Ra(){let e=B(e=>e.queue),t=B(e=>e.battle.units),n=B(e=>e.battle.activeId);return(0,V.jsx)(`div`,{className:`t-order`,"aria-label":`Turn order`,children:e.map((e,r)=>{let i=t.find(t=>t.id===e);return i?(0,V.jsx)(`div`,{className:`t-order-unit ${i.team===`enemy`?`enemy`:``} ${e===n&&r===0?`active`:``}`,title:i.name,children:(0,V.jsx)(`img`,{src:i.portrait||i.sprite,alt:``})},`${e}-${r}`):null})})}function za({unit:e}){let[t,n]=(0,y.useState)(!1),r=e.portrait||e.sprite;return(0,V.jsxs)(`span`,{className:`t-status-portrait`,"aria-hidden":`true`,children:[!t&&r?(0,V.jsx)(`img`,{src:r,alt:``,onError:()=>n(!0)},r):null,(0,V.jsx)(Ke,{className:`t-status-portrait-fallback`})]})}function Ba(){let e=B(e=>e.battle.inspectId),t=B(e=>e.battle.activeId),n=B(e=>e.battle.units),r=B(e=>e.identity),i=B(e=>e.progression?.equippedPet),a=n.find(t=>t.id===e)||n.find(e=>e.id===t)||n.find(e=>e.role===`alpha`&&e.team===`ally`&&!e.defeated);if(!a)return null;let o=a.role===`alpha`||a.defId===`alpha`||a.id===`alpha`,s=o?Aa():null,c=o?[s==null?null:`Lv ${s}`,r.skinName||r.armorLabel||r.weaponLabel].filter(Boolean).join(` · `):``,l=xt(a),u=St(a);return(0,V.jsxs)(`aside`,{className:`t-status ${a.team}${o?` is-alpha`:``}`,onPointerDown:e=>e.stopPropagation(),"aria-label":`Selected unit`,children:[(0,V.jsx)(za,{unit:a},a.id),(0,V.jsxs)(`div`,{className:`t-status-main`,children:[(0,V.jsxs)(`div`,{className:`t-status-head`,children:[(0,V.jsx)(`div`,{className:`t-status-name`,children:a.name}),o&&i?(0,V.jsx)(`span`,{className:`t-status-pet`,title:i.name,children:(0,V.jsx)(Ke,{className:`t-ico`,"aria-hidden":`true`})}):null]}),gi(a)?(0,V.jsxs)(`span`,{className:`t-combat-identity t-identity-${di(a)}`,children:[Ca(a.defId,a.growth?.discipline)?(0,V.jsx)(`img`,{className:`t-combat-emblem`,src:Ca(a.defId,a.growth?.discipline),alt:``,onError:e=>{e.currentTarget.style.display=`none`}}):null,gi(a)]}):null,c?(0,V.jsx)(`div`,{className:`t-status-kit`,children:c}):null,(0,V.jsxs)(`div`,{className:`t-status-mods`,children:[(0,V.jsx)(`span`,{children:Fa(`ATK`,l,a.atk)}),(0,V.jsx)(`span`,{children:Fa(`DEF`,u,a.def)})]}),(0,V.jsxs)(`div`,{className:`t-hp`,children:[(0,V.jsx)(`div`,{className:`t-hp-bar`,children:(0,V.jsx)(`i`,{style:{width:`${a.hp/a.maxHp*100}%`}})}),(0,V.jsxs)(`span`,{className:`t-hp-num`,children:[a.hp,`/`,a.maxHp]})]}),a.statuses.length?(0,V.jsx)(`div`,{className:`t-chips`,children:a.statuses.slice(0,3).map(e=>(0,V.jsx)(`span`,{className:`t-chip ${ja(e.type)?`buff`:`debuff`}`,children:Et[e.type]},e.id))}):null]}),(0,V.jsxs)(`dl`,{className:`t-status-stats`,children:[(0,V.jsxs)(`div`,{children:[(0,V.jsx)(`dt`,{children:`ATK`}),(0,V.jsx)(`dd`,{children:l})]}),(0,V.jsxs)(`div`,{children:[(0,V.jsx)(`dt`,{children:`DEF`}),(0,V.jsx)(`dd`,{children:u})]}),(0,V.jsxs)(`div`,{children:[(0,V.jsx)(`dt`,{children:`SPD`}),(0,V.jsx)(`dd`,{children:Ct(a)})]}),(0,V.jsxs)(`div`,{children:[(0,V.jsx)(`dt`,{children:`MOV`}),(0,V.jsx)(`dd`,{children:a.move})]})]})]})}function Va(){let e=B(e=>e.battle),t=j(B(e=>e.selectedMissionId)),n=k(e),r=e.objective;if(!n&&!t?.challenge&&!r)return null;let i=r?.type===`RECOVER`&&!ue(e),a=r?.type===`RECOVER`?i?`Recover — Signal Jammed`:`Recover — Signal Open`:r?.type===`SURVIVE`?`Survive`:r?.type===`HOLD`?`Hold`:r?.type===`INTERCEPT`?`Intercept`:r?.type===`BOSS`?`Defeat Commander`:t?.name||`Objective`,o=r?.type===`RECOVER`?i?`Even rounds only`:`Reach the relay and recover`:n,s=[e.directive?.supportCooldownExtra?`Support cooldowns +${e.directive.supportCooldownExtra}`:``,e.directive?.maxRounds?`${Math.max(0,e.directive.maxRounds-e.round+1)} rounds left`:``].filter(Boolean).join(` · `),c=r&&(r.type===`HOLD`||r.type===`SURVIVE`)?r.duration:t?.challenge?.type===`TURN_LIMIT`?t.challenge.limit:null;return(0,V.jsxs)(`div`,{className:`t-obj-chip`,role:`status`,children:[(0,V.jsx)(`strong`,{children:a}),o?(0,V.jsxs)(`span`,{children:[o,s?` · ${s}`:``]}):s?(0,V.jsx)(`span`,{children:s}):null,t?.challenge?(0,V.jsxs)(`small`,{children:[`OPTIONAL / `,t.challenge.label]}):null,c?(0,V.jsxs)(`div`,{className:`t-obj-rounds`,children:[(0,V.jsxs)(`em`,{children:[`Round `,e.round,`/`,c]}),(0,V.jsx)(`span`,{className:`t-obj-dots`,"aria-hidden":`true`,children:Array.from({length:Math.min(c,8)},(t,n)=>(0,V.jsx)(`i`,{className:n<e.round?`on`:``},n))})]}):null]})}function Ha(){let e=B(e=>e.battle),t=B(e=>e.busy),n=B(e=>e.selectSkill),r=B(e=>e.selectRecover),i=e.units.find(t=>t.id===e.activeId),a=!(!i||i.team!==`ally`||i.hasActed||i.defeated||t),o=i?rn(e,i):[],s=e.objective?.type===`RECOVER`&&!e.objective.completed,c=Qn(e);return i?.team===`enemy`?(0,V.jsx)(`div`,{className:`t-actions t-actions-enemy`,"aria-live":`polite`,children:(0,V.jsxs)(`div`,{className:`t-enemy-command`,children:[(0,V.jsx)(Xe,{className:`t-enemy-command-icon`,"aria-hidden":`true`}),(0,V.jsx)(`span`,{children:`ENEMY ACTION`}),(0,V.jsx)(`small`,{children:i.name})]})}):(0,V.jsxs)(`div`,{className:`t-actions${s?` has-obj`:``}`,children:[[0,1,2].map(t=>{let r=o[t],s=e.actionSkillId&&r&&e.actionSkillId===r.id,c=r&&!r.ready,l=r?va(r):null,u=r&&i?mi(i,r.id):`base`,d=r&&i?hi(i,r.id):null;return(0,V.jsxs)(`button`,{type:`button`,className:`t-act t-growth-${u} ${s?`on`:``} ${c?`cooling`:``} ${l?`kind-${l.archetype} fx-${l.effectClass}`:``}`,disabled:!a||!r||!!c,"aria-pressed":!!s,"aria-label":r?`${r.slot} ${r.name}. ${r.desc}`:`Empty slot A${t+1}`,onClick:()=>{r&&(ur(),n(r.id))},children:[(0,V.jsx)(Pa,{src:r?Ea(r.id):null,archetype:l?.archetype}),(0,V.jsx)(`span`,{className:`slot`,children:r?.slot??`A${t+1}`}),d?(0,V.jsx)(`span`,{className:`t-skill-rank${d===`SIGNATURE`?` is-signature`:``}`,"aria-label":`Upgrade ${d}`,children:d}):null,(0,V.jsx)(`span`,{className:`name`,children:r?.name??`—`}),l?(0,V.jsx)(`span`,{className:`meta`,children:l.cue}):null,c?(0,V.jsxs)(`span`,{className:`cd`,children:[r.cd,`T`]}):null]},t)}),s?(0,V.jsxs)(`button`,{type:`button`,className:`t-act t-act-obj kind-${ya.archetype} fx-${ya.effectClass} ${c?`on`:`cooling`}`,disabled:!a||!c,"aria-label":c?`Recover. Complete objective, consumes action.`:`Recover unavailable`,onClick:()=>{ur(),r()},children:[(0,V.jsx)(Pa,{src:Da(`recover`),archetype:ya.archetype}),(0,V.jsx)(`span`,{className:`slot`,children:`OBJ`}),(0,V.jsx)(`span`,{className:`name`,children:`RECOVER`}),(0,V.jsx)(`span`,{className:`meta`,children:ya.cue})]}):null]})}function Ua(){let e=B(e=>e.battle.units),t=B(e=>e.battle.round),n=B(e=>e.battle.mode),r=B(e=>e.battle.activeId),i=B(e=>e.battle.inspectId),a=B(e=>e.battle.actionSkillId),o=B(e=>e.lastActionSkillId),s=B(e=>e.combatMoment),c=B(e=>e.combatFx),l=B(e=>e.banner),u=B(e=>e.ticker),d=B(e=>e.floats),f=B(e=>e.threats),p=B(e=>e.attackingId),m=B(e=>e.impactId),h=B(e=>e.impactKey),g=B(e=>e.muted),_=B(e=>e.busy),v=B(e=>e.selectCell),b=B(e=>e.skipTurn),x=B(e=>e.cancel),ee=B(e=>e.toggleMute),S=B(e=>e.battle.objective),C=j(B(e=>e.selectedMissionId)),te=B(e=>e.battle.reinforcement),ne=B(e=>e.battle.signalCarrierId),re=(0,y.useMemo)(()=>new Set(da().map(e=>jt(e.c,e.r))),[e,r,n,_,a]),w=(0,y.useMemo)(()=>fa(),[e,r,n,a]),T=e.find(e=>e.id===r),ie=a?Zt(a):null,ae=ie?va(ie):null,oe=o?Zt(o):null,se=oe?va(oe):null,E=!(!T||T.team!==`ally`||T.hasActed||T.defeated||_),D=e.find(e=>e.id===m&&!e.defeated),O=D?Lt(D.c,D.r):null,le=T?.team===`enemy`?`Enemy act`:`Your act`,ue=C?.activity===`FIELD_OP`?`FIELD OP / ${C.name}`:ce.name,de=ba(B.getState().battle,C);return(0,V.jsxs)(`div`,{className:`t-battle${M?` battlefield-vnext-preview`:``}${ae?` is-focusing focus-${ae.targetClass} effect-${ae.effectClass}`:``}`,"data-impact-kind":se?.effectClass||`damage`,children:[(0,V.jsxs)(`header`,{className:`t-top`,children:[(0,V.jsx)(`div`,{className:`t-brand`,children:(0,V.jsx)(`div`,{children:(0,V.jsxs)(`h1`,{className:`t-title`,children:[`Alpha Husky `,(0,V.jsx)(`span`,{className:`t-brand-sep`,children:`//`}),` Tactical Ops`]})})}),(0,V.jsxs)(`div`,{className:`t-turn`,children:[(0,V.jsxs)(`strong`,{children:[`TURN `,String(t).padStart(2,`0`)]}),(0,V.jsxs)(`span`,{className:`t-turn-sub`,children:[le,T?` · ${T.name}`:``]})]}),(0,V.jsxs)(`div`,{className:`t-obj`,children:[ue,M?(0,V.jsx)(`span`,{className:`t-battle-lab-tag`,children:` · LAB 10×7`}):null]})]}),(0,V.jsx)(`div`,{className:`t-order-wrap`,children:(0,V.jsx)(Ra,{})}),de?(0,V.jsxs)(`div`,{className:`t-player-guidance`,role:`status`,children:[(0,V.jsx)(`strong`,{children:de.title}),(0,V.jsx)(`span`,{children:de.copy})]}):null,u?(0,V.jsx)(`div`,{className:`t-ticker`,children:u}):null,te?.telegraphed&&!te.spawned?(0,V.jsx)(`div`,{className:`t-ticker t-ticker-warn`,children:`ROUTING TRACE · REINFORCEMENT DETECTED`}):null,(0,V.jsx)(`div`,{className:`t-field-wrap`,children:(0,V.jsxs)(`div`,{className:`t-field`,onPointerDown:e=>{_||e.target===e.currentTarget&&x()},children:[(0,V.jsx)(`img`,{className:`t-field-art`,src:ge(C).art,alt:``}),(0,V.jsx)(`div`,{className:`t-field-grade`}),(0,V.jsx)(`div`,{className:`t-vignette`}),(0,V.jsx)(`div`,{className:`t-grid`,"aria-hidden":`true`,children:Array.from({length:N*pt},(e,t)=>{let n=t%N,r=Math.floor(t/N),i=Lt(n,r);return(0,V.jsx)(`i`,{style:{left:`${i.x}%`,top:`${i.y}%`}},`g-${n}-${r}`)})}),f.flatMap(e=>e.impactTiles.map((t,n)=>{let r=Lt(t.c,t.r);return(0,V.jsx)(`div`,{className:`t-threat-tile`,style:{left:r.x+`%`,top:r.y+`%`},"aria-hidden":`true`},e.id+`:`+n)})),S?.type===`HOLD`&&S.terminal?Array.from({length:N*pt},(e,t)=>({c:t%N,r:Math.floor(t/N)})).filter(e=>Math.abs(e.c-S.terminal.c)+Math.abs(e.r-S.terminal.r)<=(S.radius??0)).map(e=>{let t=Lt(e.c,e.r);return(0,V.jsx)(`div`,{className:`t-hold-cell`,style:{left:`${t.x}%`,top:`${t.y}%`},"aria-label":`Hold area`,children:`HOLD`},`hold-${e.c}-${e.r}`)}):null,S?.type===`RECOVER`?(()=>{let e=Lt(S.terminal.c,S.terminal.r);return(0,V.jsxs)(`div`,{className:`t-terminal ${S.completed?`complete`:``}`,style:{left:`${e.x}%`,top:`${e.y}%`},"aria-label":`Relay terminal`,children:[(0,V.jsx)(`img`,{className:`t-objective-marker-art`,src:ka.signalRecovery,alt:``}),(0,V.jsx)(`span`,{children:`RELAY`}),(0,V.jsx)(`small`,{children:S.completed?`RECOVERED`:`RECOVER`})]})})():null,S?.type===`INTERCEPT`?(()=>{let e=Lt(S.exit.c,S.exit.r);return(0,V.jsxs)(`div`,{className:`t-terminal`,style:{left:`${e.x}%`,top:`${e.y}%`},"aria-label":`Courier escape exit`,children:[(0,V.jsx)(`img`,{className:`t-objective-marker-art`,src:ka.reinforcementWarning,alt:``}),(0,V.jsx)(`span`,{children:`EXIT`}),(0,V.jsx)(`small`,{children:`BLOCK / INTERCEPT`})]})})():null,te?.telegraphed&&!te.spawned?(()=>{let e=Lt(te.spawn.c,te.spawn.r);return(0,V.jsxs)(`div`,{className:`t-reinforcement-marker`,style:{left:`${e.x}%`,top:`${e.y}%`},children:[(0,V.jsx)(`img`,{className:`t-objective-marker-art`,src:ka.reinforcementWarning,alt:``}),(0,V.jsx)(`span`,{children:`INBOUND`}),(0,V.jsx)(`small`,{children:`HOUND`})]})})():null,Array.from({length:N*pt},(e,t)=>{let n=t%N,r=Math.floor(t/N),i=jt(n,r);if(!re.has(i))return null;let a=Lt(n,r);return(0,V.jsx)(`button`,{type:`button`,className:`t-cell move`,style:{left:`${a.x}%`,top:`${a.y}%`},"aria-label":`Move to ${n},${r}`,onPointerDown:e=>{e.stopPropagation(),ur(),v(n,r)}},i)}),e.slice().sort((e,t)=>e.r-t.r||e.c-t.c).map(e=>(0,V.jsx)(La,{unit:e,selected:e.id===r,validTarget:w.has(e.id),targeting:n===`targeting`,attacking:e.id===p,inspecting:e.id===i,signalCarrier:e.id===ne,interceptTarget:S?.type===`INTERCEPT`&&e.id===S.targetId},e.id)),c.map(t=>{let n=e.find(e=>e.id===t.targetId),r=t.terminal||n;if(!r)return null;let i=Lt(r.c,r.r);return(0,V.jsx)(`div`,{className:`t-sprite-fx`,style:{left:i.x+`%`,top:i.y+`%`},"aria-hidden":`true`,children:(0,V.jsx)(`div`,{className:`t-sprite-fx-clip`,style:{animationDuration:t.durationMs+`ms`},children:(0,V.jsx)(`div`,{className:`t-sprite-fx-sheet`,style:{backgroundImage:`url("${bi}${t.name}.webp")`,animationDuration:t.durationMs+`ms`}})})},t.id)}),s&&(()=>{let t=e.find(e=>e.id===s.targetId);if(!t)return null;let n=Lt(t.c,t.r);return(0,V.jsxs)(`div`,{className:`t-master-fx fx-affinity-${s.affinity} fx-tier-${s.tier} fx-mode-${s.mode}`,style:{left:`${n.x}%`,top:`${n.y}%`},"aria-hidden":`true`,children:[(0,V.jsx)(`i`,{className:`t-master-fx-ring`}),(0,V.jsx)(`i`,{className:`t-master-fx-core`})]},s.id)})(),d.map(t=>{let n=e.find(e=>e.id===t.unitId);if(!n)return null;let r=Lt(n.c,n.r);return(0,V.jsx)(`div`,{className:`t-float ${t.kind}`,style:{left:`${r.x}%`,top:`${r.y-6}%`},children:t.text},t.id)}),O?(0,V.jsx)(`div`,{className:`t-impact t-impact-${se?.effectClass||`damage`}`,style:{left:`${O.x}%`,top:`${O.y-4}%`}},h):null,(0,V.jsx)(Ba,{}),(0,V.jsx)(Va,{})]})}),f.length>0?(0,V.jsxs)(`aside`,{className:`t-threat-brief`,role:`status`,"aria-live":`polite`,"aria-label":`Incoming enemy attack`,children:[(0,V.jsxs)(`div`,{className:`t-threat-brief-head`,children:[(0,V.jsx)(`span`,{className:`t-threat-brief-pip`,"aria-hidden":`true`}),` INCOMING ATTACK `,(0,V.jsx)(`small`,{children:`RED = DANGER`})]}),(0,V.jsx)(`div`,{className:`t-threat-brief-detail`,children:f.length===1?f[0].predictedEffect:`${f.length} ENEMY ATTACKS LOCKED`}),(0,V.jsxs)(`div`,{className:`t-threat-brief-action`,children:[`MOVE OFF RED `,(0,V.jsx)(`span`,{children:`·`}),` INTERRUPT `,(0,V.jsx)(`span`,{children:`·`}),` GUARD`]})]}):null,s?(0,V.jsxs)(`div`,{className:`t-master-moment t-master-moment-${s.affinity} t-master-moment-${s.tier}`,role:`status`,"aria-live":`polite`,children:[(0,V.jsx)(`strong`,{children:s.title}),(0,V.jsx)(`small`,{children:s.consequence})]},s.id):null,l?(0,V.jsx)(`div`,{className:`t-banner`,children:(0,V.jsx)(`span`,{children:l})}):null,(0,V.jsxs)(`footer`,{className:`t-dock`,children:[(0,V.jsx)(`button`,{type:`button`,className:`t-icon-btn`,"aria-label":g?`Unmute`:`Mute`,onClick:()=>{let e=!dr();fr(e),ee(),ur(),e||hr(`ui`)},children:g?(0,V.jsx)($e,{className:`t-ico`}):(0,V.jsx)(Qe,{className:`t-ico`})}),(0,V.jsx)(Ha,{}),(0,V.jsxs)(`button`,{type:`button`,className:`t-btn t-skip`,disabled:!E,onClick:()=>{ur(),b()},children:[(0,V.jsx)(Pa,{src:Da(`skip`),fallback:`skip`}),`Skip`]})]})]})}function Wa(e){e.currentTarget.src=se}function Ga(){let e=B(e=>e.identity);return(0,V.jsxs)(`div`,{className:`t-id-card`,"aria-label":`Player identity`,children:[(0,V.jsx)(`img`,{src:e.portraitUrl,alt:``,onError:Wa}),(0,V.jsxs)(`div`,{children:[(0,V.jsx)(`strong`,{children:e.unitName}),(0,V.jsx)(`small`,{children:e.summary})]})]})}function Ka(e){return{"REACH CONTROL":`PRESSURE +1 RANGE`,"WIDE SHELTER":`PACK SUPPORT +1 RANGE`,"RELAY SCOUT":`RECOVER FROM 2 CELLS`,RELENTLESS:`PRESSURE COOLDOWN -1 TURN`,"PIN DOWN":`PRESSURE DEBUFFS +1 TURN`,"STEADY HAND":`MEND COOLDOWN -1 TURN`,"SILENT SHELTER":`PACK SUPPORT: NO HEALING / IGNORE DISRUPTION`,"REACHING SNARE":`HAMSTRING +1 RANGE`,PATHFINDER:`MOVE +1 CELL`}[e.name]||e.copy}function qa(e){return e.gained===3?`FIRST CLEAR + CHALLENGE`:e.progress<8?e.gained===2?`FIRST CLEAR`:`CHALLENGE`:`FIRST CLEAR / CHALLENGE / CAP REACHED`}function Ja(e,t){return e===`ally-02`?{label:`CNC`,sublabel:`RELAY SCOUT`}:e===`ally-03`?{label:`SHADOW`,sublabel:`STEALTH OPERATIVE`}:{label:`PET`,sublabel:t||`COMPANION`}}function Ya({snapshot:e}){let t=B(e=>e.progression),n=B(e=>e.progressionCommitPending||e.busy),r=B(e=>e.selectMastery),i=t?.equippedPet,[a,o]=(0,y.useState)(`ally-02`),s=[`ally-02`,`ally-03`,...i?[`pet:${i.id}`]:[]],c=[t?.fieldOps?.activeMissionRun,...Object.values(t?.operations||{}).map(e=>e.activeMissionRun)];return(0,V.jsxs)(`section`,{className:`t-panel t-brief-block t-pack-mastery t-pack-mastery-premium t-pack-mastery-v29`,"aria-label":`Pack Mastery`,children:[(0,V.jsxs)(`div`,{className:`t-pack-head`,children:[(0,V.jsxs)(`div`,{children:[(0,V.jsx)(`div`,{className:`t-kicker`,children:`Your squad`}),(0,V.jsx)(`h2`,{className:`t-title`,children:`PACK MASTERY`}),(0,V.jsx)(`p`,{children:`Take companions into Field Ops to unlock permanent tactical abilities.`})]}),(0,V.jsx)(`small`,{children:`First clear +2 · challenge +1`})]}),(0,V.jsx)(`nav`,{className:`t-premium-mastery-roster`,"aria-label":`Select companion mastery`,children:s.map(e=>(0,V.jsxs)(`button`,{type:`button`,className:a===e?`is-selected`:``,"aria-pressed":a===e,onClick:()=>o(e),children:[(0,V.jsx)(`img`,{src:e.startsWith(`pet:`)?i?.img||E[`ally-03`].portrait:E[e].portrait,alt:``,onError:Wa}),(0,V.jsx)(`strong`,{children:Ja(e,i?.name).label})]},e))}),(0,V.jsx)(`div`,{className:`t-pack-list t-premium-mastery-selected`,children:s.map(o=>{let l=_r(o);if(!l||s.includes(a)&&o!==a||!s.includes(a)&&o!==s[0])return null;let u=vr(e||t?.packMastery,o),d=c.some(e=>e?.squadIds.includes(o)),f=u.stage>=3&&u.selected?l.options[u.selected]:null,p=Ja(o,i?.name),m=f||(u.stage>=2?l.trained:null),h=u.stage<2?3:u.stage<3?8:null,g=u.stage<2?Ka(l.trained):u.stage<3?`Choose a specialization`:`All mastery options unlocked`;return(0,V.jsxs)(`article`,{className:`t-mastery-row t-mastery-premium-row t-mastery-card-v29`,"data-mastery-companion":o,children:[(0,V.jsx)(`div`,{className:`t-mastery-avatar t-premium-avatar`,"aria-hidden":`true`,children:(0,V.jsx)(`img`,{src:o.startsWith(`pet:`)?i?.img||E[`ally-03`].portrait:E[o].portrait,alt:``,onError:Wa})}),(0,V.jsxs)(`div`,{className:`t-mastery-main`,children:[u.stage>=2?(0,V.jsx)(`div`,{className:`t-mastery-combat-badge ${u.stage>=3?`is-signature`:`is-trained`}`,children:u.stage>=3?`SIGNATURE EVOLUTION · 8/8`:`AWAKENED · 3/8`}):null,(0,V.jsxs)(`div`,{className:`t-mastery-topline`,children:[(0,V.jsxs)(`div`,{children:[(0,V.jsx)(`strong`,{children:p.label}),(0,V.jsx)(`span`,{children:p.sublabel})]}),(0,V.jsxs)(`div`,{className:`t-mastery-status`,children:[(0,V.jsxs)(`span`,{children:[u.progress,`/8 MASTERY`]}),(0,V.jsx)(`b`,{children:u.stage>=3?`MASTERED`:`STAGE ${u.stage}`})]})]}),(0,V.jsx)(`div`,{className:`t-mastery-progressline`,children:(0,V.jsx)(`progress`,{className:`t-progress`,"aria-label":`${l.name} mastery`,value:u.progress,max:8})}),(0,V.jsxs)(`div`,{className:`t-mastery-now-next`,children:[(0,V.jsxs)(`div`,{children:[(0,V.jsx)(`span`,{className:`t-kicker`,children:`Active`}),(0,V.jsx)(`strong`,{children:m?m.name:`NO MASTERY YET`}),(0,V.jsx)(`small`,{children:m?Ka(m):`Earn 3 Mastery to unlock the first ability.`})]}),(0,V.jsxs)(`div`,{children:[(0,V.jsx)(`span`,{className:`t-kicker`,children:`Next`}),(0,V.jsx)(`strong`,{children:h?`AT ${h} MASTERY`:`ALL PATHS UNLOCKED`}),(0,V.jsx)(`small`,{children:g})]})]}),(0,V.jsxs)(`details`,{className:`t-detail t-mastery-detail`,children:[(0,V.jsx)(`summary`,{children:u.stage>=3?`Specialization`:`Ability details`}),(0,V.jsxs)(`p`,{children:[u.stage>=2?`TRAINED`:`AT 3 MASTERY`,`: `,l.trained.name,` / `,l.trained.copy]}),u.stage>=3?(0,V.jsxs)(V.Fragment,{children:[(0,V.jsx)(`div`,{className:`t-brief-actions`,children:[`A`,`B`].map(e=>(0,V.jsxs)(`button`,{type:`button`,className:`t-btn ${u.selected===e?`t-btn-primary`:``}`,"aria-pressed":u.selected===e,disabled:n||d,onClick:()=>void r(o,e),children:[l.options[e].name,u.selected===e?` / ACTIVE`:``]},e))}),[`A`,`B`].map(e=>(0,V.jsx)(`p`,{children:(0,V.jsxs)(`small`,{children:[l.options[e].name,`: `,l.options[e].copy]})},e))]}):(0,V.jsx)(`p`,{children:(0,V.jsx)(`small`,{children:`Specializations unlock at 8 Mastery.`})})]}),d?(0,V.jsx)(`small`,{className:`t-mastery-locked`,children:`Finish this companion's current run before changing specialization.`}):null]})]},o)})}),i?null:(0,V.jsx)(`small`,{className:`t-pack-pet-note`,children:`Equip a PET to add it to Pack Mastery.`})]})}function Xa({changes:e,victory:t}){return e?.length?(0,V.jsxs)(`section`,{className:`t-mastery-feedback`,"aria-label":`Pack Mastery`,children:[(0,V.jsx)(`div`,{className:`t-kicker`,children:`PACK MASTERY`}),e.map(e=>{let n=_r(e.unitId);return n?(0,V.jsxs)(`div`,{className:`t-mastery-row t-mastery-reward ${e.beforeStage===e.stage?``:`is-unlock`}`,"data-mastery-unit":e.unitId,children:[(0,V.jsxs)(`div`,{className:`t-mastery-heading`,children:[(0,V.jsx)(`strong`,{children:n.name}),(0,V.jsx)(`span`,{children:e.stage===3?`STAGE 3 COMPLETE`:`STAGE ${e.beforeStage===e.stage?``:`${e.beforeStage} → `}${e.stage}`}),e.gained>0||e.stage<3?(0,V.jsxs)(`b`,{children:[`+`,e.gained,` MASTERY`]}):null]}),e.gained>0?(0,V.jsx)(`small`,{children:qa(e)}):null,(0,V.jsx)(`progress`,{className:`t-progress`,"aria-label":`${n.name} mastery`,value:e.progress,max:8}),e.beforeStage<2&&e.stage>=2?(0,V.jsxs)(`div`,{className:`t-mastery-unlock`,children:[(0,V.jsxs)(`strong`,{children:[`AWAKENED · `,n.trained.name]}),(0,V.jsx)(`p`,{children:n.trained.copy})]}):null,e.newOptions.length?(0,V.jsxs)(`div`,{className:`t-mastery-unlock is-signature`,children:[(0,V.jsx)(`strong`,{children:`SIGNATURE EVOLUTION · 8/8`}),(0,V.jsxs)(`p`,{children:[n.options.A.name,` / `,n.options.B.name]}),(0,V.jsx)(`p`,{children:`Specializations unlocked. Choose outside an active run.`})]}):null,!e.gained&&e.progress<8?(0,V.jsx)(`small`,{children:t?`Award already earned. Try another mission or challenge.`:`Clear a Field Op to progress.`}):null]},e.unitId):null})]}):null}var Za={alpha:`ALPHA`,"ally-02":`CNC`,"ally-03":`SHADOW`},Qa={vanguard:`Protects the front line with a guarded HOWL.`,howlkeeper:`Extends HOWL's squad-wide reach.`,pursuer:`Extends THRUST's pursuit reach.`,disruptor:`Extends PRESSURE's enemy control.`,sentinel:`Adds GUARD to PACK SUPPORT.`,medic:`Makes MEND available more frequently.`};function $a(){let e=B(e=>e.progression?.playerGrowth),t=B(e=>e.progressionCommitPending),n=B(e=>e.progressionError),r=B(e=>e.upgradeGrowth),i=B(e=>e.respecGrowth),[a,o]=(0,y.useState)(`alpha`),[s,c]=(0,y.useState)(`vanguard`),[l,u]=(0,y.useState)(null),[d,f]=(0,y.useState)(!1),[p,m]=(0,y.useState)(null),h=e?.heroes.find(e=>e.heroId===a),g=e?e.earnedPoints-e.spentPoints:0;(0,y.useEffect)(()=>{c(h?.discipline??et[a][0]),u(null),f(!1)},[a,h?.discipline]);let _=l?Zt(l):null,v=(l?h?.ranks[l]??0:0)+1,b=l?nt.find(e=>e.skillId===l&&e.rank===v):null,x=t||!e||g<1||h?.discipline!=null&&h.discipline!==s,ee=!!(l&&b&&!x),S=!!(h?.discipline&&!h?.respecUsed&&Object.keys(h.ranks).length>0),C=l&&b&&h?_i(l,h,v,s):[],te=!(!p||t||e?.heroes.find(e=>e.heroId===p.heroId)?.ranks[p.skillId]!==p.rank);return(0,V.jsxs)(`section`,{className:`t-panel t-growth-panel`,"aria-label":`Character Skillbook`,children:[(0,V.jsxs)(`header`,{className:`t-growth-heading`,children:[(0,V.jsxs)(`div`,{children:[(0,V.jsx)(`span`,{className:`t-kicker`,children:`SQUAD PROGRESSION`}),(0,V.jsx)(`h2`,{children:`CHARACTER SKILLBOOK`}),(0,V.jsx)(`p`,{children:`Choose how each squad member fights. Your choices are saved to your Alpha account.`})]}),(0,V.jsxs)(`div`,{className:`t-growth-points`,children:[(0,V.jsx)(`strong`,{children:e?g:`—`}),(0,V.jsx)(`small`,{children:`AVAILABLE POINTS`})]})]}),e?(0,V.jsxs)(V.Fragment,{children:[(0,V.jsx)(`nav`,{className:`t-growth-roster`,"aria-label":`Choose squad member`,children:Object.keys(Za).map(e=>(0,V.jsxs)(`button`,{className:e===a?`is-selected`:``,"aria-pressed":e===a,type:`button`,onClick:()=>o(e),children:[(0,V.jsx)(`img`,{src:E[e].portrait,alt:``,onError:Wa}),(0,V.jsx)(`span`,{children:Za[e]})]},e))}),(0,V.jsxs)(`div`,{className:`t-growth-copy`,children:[(0,V.jsx)(`img`,{className:`t-growth-core-emblem`,src:Ca(a,h?.discipline)||``,alt:``,onError:e=>{e.currentTarget.style.display=`none`}}),(0,V.jsx)(`strong`,{children:Za[a]}),(0,V.jsx)(`span`,{children:h?.discipline?`SPECIALIZATION LOCKED IN`:`CHOOSE FIRST SPECIALIZATION`})]}),(0,V.jsx)(`div`,{className:`t-growth-paths`,children:et[a].map(e=>(0,V.jsxs)(`button`,{type:`button`,className:e===s?`is-selected`:``,disabled:t||h?.discipline!=null&&h.discipline!==e,"aria-pressed":e===s,onClick:()=>{c(e),u(null)},children:[(0,V.jsx)(`img`,{className:`t-growth-path-emblem`,src:Ca(a,e)||``,alt:``,loading:`lazy`,onError:e=>{e.currentTarget.style.display=`none`}}),(0,V.jsx)(`b`,{children:e.toUpperCase()}),(0,V.jsx)(`small`,{children:Qa[e]})]},e))}),(0,V.jsx)(`div`,{className:`t-growth-skill-list`,children:tt[a].map(e=>{let t=Zt(e),n=h?.ranks[e]??0,r=nt.find(t=>t.skillId===e&&t.rank===n+1);return(0,V.jsxs)(`button`,{type:`button`,"aria-pressed":l===e,className:l===e?`is-selected`:``,onClick:()=>{u(e),f(!1)},children:[(0,V.jsxs)(`span`,{className:`t-growth-skill-title`,children:[(0,V.jsxs)(`span`,{className:`t-growth-skill-label`,children:[(0,V.jsx)(`img`,{className:`t-growth-action-icon`,src:Ea(e)||``,alt:``,loading:`lazy`,onError:e=>{e.currentTarget.style.display=`none`}}),t.slot,` · `,t.name]}),(0,V.jsxs)(`em`,{children:[`RANK `,n,`/2`]})]}),(0,V.jsx)(`small`,{children:r?r.description:`Maximum rank reached`})]},e)})}),(0,V.jsxs)(`div`,{className:`t-growth-confirm`,children:[(0,V.jsxs)(`div`,{"aria-live":`polite`,children:[(0,V.jsx)(`strong`,{children:_?_.name:`SELECT A SKILL`}),(0,V.jsx)(`small`,{children:b?.description??(_?`All upgrades unlocked.`:`Select one of the three skills to see its next upgrade.`)}),C.length?(0,V.jsx)(`div`,{className:`t-growth-delta`,"aria-label":`Actual combat upgrade preview`,children:C.map(e=>(0,V.jsx)(`b`,{children:e},e))}):null,v===2&&b?(0,V.jsx)(`span`,{className:`t-growth-signature`,children:`RANK 2 · EVOLVED COMBAT EFFECT`}):null,(0,V.jsx)(`small`,{children:h?.discipline&&h.discipline!==s?`Other specialization is locked. Use your one free respec to change it.`:g<1?`Earn a point from a first-time mission clear.`:`Each upgrade costs 1 point and changes real combat behavior.`})]}),(0,V.jsx)(`button`,{className:`t-btn t-btn-primary`,type:`button`,disabled:!ee,onClick:()=>{l&&ee&&(m({heroId:a,skillId:l,rank:v}),r(a,s,l,v))},children:t?`SAVING...`:`CONFIRM UPGRADE`})]}),te?(0,V.jsxs)(`p`,{className:`t-growth-confirmed`,role:`status`,children:[`UPGRADE RECORDED · RANK `,p?.rank,`/2 · READY FOR NEXT BATTLE`]}):null,S?(0,V.jsx)(`div`,{className:`t-growth-respec`,children:d?(0,V.jsxs)(V.Fragment,{children:[(0,V.jsx)(`span`,{children:`Refund this hero's skill points and reset their specialization? This is irreversible.`}),(0,V.jsx)(`button`,{className:`t-btn`,disabled:t,type:`button`,onClick:()=>f(!1),children:`CANCEL`}),(0,V.jsx)(`button`,{className:`t-btn`,disabled:t,type:`button`,onClick:()=>{f(!1),i(a)},children:`CONFIRM RESET`})]}):(0,V.jsx)(`button`,{className:`t-btn`,type:`button`,disabled:t,onClick:()=>f(!0),children:`RESET THIS HERO · ONCE FREE`})}):h?.respecUsed?(0,V.jsx)(`small`,{className:`t-growth-notice`,children:`This hero has already used their one free respec.`}):null,n?(0,V.jsx)(`p`,{className:`t-growth-error`,role:`alert`,children:n}):null]}):(0,V.jsx)(`p`,{className:`t-growth-notice`,children:`Skillbook is waiting for authenticated server progression. No upgrades can be spent offline.`})]})}var eo=[`Recon`,`Control`,`Defense`,`Mobility`,`Support`];function to(e){let t=e.effects.filter(e=>e.kind===`status`);return e.effects.some(e=>e.kind===`heal`)?`Support`:t.some(e=>e.status===`GUARD`||e.status===`DEF_UP`)?`Defense`:t.some(e=>e.status===`ATK_DOWN`||e.status===`SPD_DOWN`)?`Control`:t.some(e=>e.status===`SPD_UP`&&e.on===`self`)?`Mobility`:t.some(e=>e.status===`ATK_UP`||e.status===`SPD_UP`)?`Support`:null}function no(e,t){let n=[];for(let r of e){let e=t?.heroes.find(e=>e.heroId===r.defId),i=Array.isArray(r.skillIds)?r.skillIds:[];for(let t of i){let i=at(Zt(t),e),a=to(i);a&&n.push({family:a,unit:r.name,skillId:it(t),skillName:i.name,slot:i.slot,description:i.desc,cooldown:i.cooldownMax})}}return n}function ro(e,t){if(!e.includes(`alpha`))return`Alpha must lead the deployed squad.`;let n=[];return e.includes(`ally-02`)||n.push(`CNC range and pressure`),e.includes(`ally-03`)||n.push(`SHADOW healing and shelter`),t&&!e.includes(`pet:${t}`)&&n.push(`PET pursuit and HAMSTRING`),n.length?`Not deployed: ${n.join(`; `)}.`:`All currently available squad roles are deployed.`}function io(e,t){return e.flatMap(e=>{let n=t?.heroes.find(t=>t.heroId===e.defId);return e.skillIds.map(t=>{let r=at(Zt(t),n);return{unitId:e.defId,unitName:e.name,slot:r.slot,skillId:t,name:r.name,family:to(r),cooldown:r.cooldownMax,minRange:r.minRange,maxRange:r.maxRange,description:r.desc,targetType:r.targetType,effects:r.effects.map(e=>({...e}))}})})}function ao(e,t,n=!1){let r=t?.heroes.find(e=>e.heroId===`ally-02`)?.discipline===`disruptor`,i=n&&r?e.find(e=>e.unitId===`ally-02`&&it(e.skillId)===`u02-suppress`&&e.effects.some(e=>e.kind===`status`&&e.on===`hits`)):void 0,a=e.find(e=>e.effects.some(e=>e.kind===`status`&&e.status===`SPD_DOWN`&&(e.on===`hits`||e.on===`primary`||e.on===`aoe_enemies`))),o=e.find(e=>e.effects.some(e=>e.kind===`status`&&(e.status===`GUARD`||e.status===`DEF_UP`)&&(e.on===`aoe_allies`||e.on===`primary`))),s=e.find(e=>e.effects.some(e=>e.kind===`heal`&&(e.on===`primary`||e.on===`aoe_allies`))),c=(e,t,n,r)=>({id:e,label:t,available:!!n,source:n?`${n.unitName} · ${n.name}`:null,detail:r});return[c(`INTERRUPT`,`CANCEL LOCKED ATTACK`,i,n?`CNC Disruptor PRESSURE can cancel a confirmed locked attack.`:`Available only while VNext intent telegraphs are enabled.`),c(`SLOW`,`SLOW PURSUIT`,a,`Speed reduction can delay a pursuing or escaping unit.`),c(`PROTECT`,`PROTECT ALLIES`,o,`Shield or DEF support reduces danger while allies hold position.`),c(`RECOVER`,`RECOVER HP`,s,`Healing restores allies after damage; it does not cancel a locked attack.`)]}var oo={startHero:`/images/tactical_ops/presentation/tactical_ops_start_hero_backdrop.png`,battlefield:`/images/tactical_ops/presentation/tactical_ops_battlefield_backdrop.png`,operationPlate:`/images/tactical_ops/presentation/tactical_ops_broken_signal_operation_plate.png`,resultsPlate:`/images/tactical_ops/presentation/tactical_ops_operation_complete_plate.png`,bossTarget:`/images/tactical_ops/presentation/tactical_ops_boss_target.png`,recoveryMarker:`/images/tactical_ops/presentation/tactical_ops_signal_recovery_marker.png`,traceTarget:`/images/tactical_ops/presentation/tactical_ops_trace_target.png`,reinforcementWarning:`/images/tactical_ops/presentation/tactical_ops_reinforcement_warning.png`};function so(e){return e.objectiveType===`BOSS`?{art:oo.bossTarget,tone:`boss`,label:`COMMAND TARGET`}:e.objectiveType===`RECOVER`?{art:oo.recoveryMarker,tone:`recover`,label:`SIGNAL RECOVERY`}:e.objectiveType===`INTERCEPT`?{art:oo.traceTarget,tone:`intercept`,label:`INTERCEPT`}:e.objectiveType===`HOLD`?{art:oo.reinforcementWarning,tone:`hold`,label:`HOLD THE LINE`}:e.objectiveType===`SURVIVE`?{art:oo.battlefield,tone:`survive`,label:`ENDURE`}:{art:oo.operationPlate,tone:`assault`,label:`ASSAULT`}}var co={alpha:`Melee pressure`,skirmisher:`Skirmisher`,ranged:`Skirmisher`,support:`Support`,companion:`Mobile control`,hostile:`Melee`,leader:`Heavy`};function lo(e){let t=e.objective;return t?.type===`INTERCEPT`?`Stop the courier before the south-east exit.`:t?.type===`HOLD`?`Control the relay · ${t.duration} consecutive round changes.`:t?.type===`SURVIVE`?`Keep the full squad standing · ${t.duration} rounds.`:e.objectiveType===`RECOVER`?`Reach the relay. Use RECOVER.`:e.objectiveType===`BOSS`?e.operationId===we.operationId?`Defeat the DEAD RELAY GUARDIAN.`:`Defeat the SIGNAL COMMANDER.`:`Eliminate the HOUND patrol.`}function uo(e){return e.objectiveType===`SURVIVE`?`Your squad is ready. Deploy to earn Commander progress and rewards.`:e.objectiveType===`HOLD`?`Hold the relay under pressure and stabilize the area.`:e.objectiveType===`RECOVER`?`Move fast, reach the relay and recover the signal before the area collapses.`:e.objectiveType===`BOSS`?`End the chain. Defeat the Signal Commander and secure the operation.`:`Clear the route, protect your squad and keep momentum.`}function H(e){return e.directive?.name||`STANDARD CONDITIONS`}function U(e,t){let n=e.skillIds.map(e=>Xt[e]?.name).filter(Boolean).join(` / `);return`${e.defId===`ally-02`?`BUG HUNTER WARDEN · Spear skirmisher`:co[e.role]||e.role} · ${n} · ${t||`MOVE ${e.move}`}`}function W({dim:e=.55,art:t=`/images/tactical_ops/battlefield.jpg`,className:n=``}){return(0,V.jsxs)(`div`,{className:`t-bg ${n}`,"aria-hidden":`true`,children:[(0,V.jsx)(`img`,{src:t,alt:``}),(0,V.jsx)(`div`,{className:`t-vignette`,style:{background:`rgb(10 12 16 / ${e})`}})]})}function fo(){let e=B(e=>e.openBrief),t=B(e=>e.onboardingEnabled),n=B(e=>e.onboardingStageId),r=B(e=>e.foundationCompleted),i=B(e=>e.progressionStatus),a=B(e=>e.progressionError),o=Pi(t,n),s=r?`Foundation complete`:t?o.operationName:ce.name,c=r?`Broken Signal training sequence completed.`:t?o.objective:i===`error`?`Foundation progression could not be loaded. Reopen Tactical Ops to retry.`:ce.objective;return(0,V.jsxs)(`div`,{className:`t-fill`,children:[(0,V.jsx)(W,{dim:.35,art:oo.startHero,className:`t-bg-hero`}),(0,V.jsx)(`div`,{className:`t-vignette`}),(0,V.jsx)(`div`,{className:`t-hub`,children:(0,V.jsxs)(`div`,{className:`t-hub-copy`,children:[(0,V.jsx)(`div`,{className:`t-kicker`,children:`Alpha Husky`}),(0,V.jsx)(`h1`,{className:`t-title`,children:`Tactical Ops`}),(0,V.jsx)(Ga,{}),(0,V.jsx)(`h2`,{children:`Combat Core`}),(0,V.jsxs)(`div`,{className:`t-panel t-op-card`,children:[(0,V.jsx)(`span`,{className:`t-kicker`,children:`Operation`}),(0,V.jsx)(`strong`,{children:s}),(0,V.jsx)(`p`,{children:c})]}),a?(0,V.jsx)(`p`,{style:{color:`var(--t-enemy)`,margin:`0.8rem 0 0`},children:a}):null,(0,V.jsx)(`div`,{className:`t-brief-actions`,children:(0,V.jsxs)(`button`,{type:`button`,className:`t-btn t-btn-primary`,onClick:e,disabled:r||i===`error`,children:[r?`Foundation complete`:`Mission Brief`,(0,V.jsx)(He,{className:`t-ico`})]})})]})})]})}function po({receipt:e}){let t=B(e=>e.backToHub);return(0,V.jsxs)(`div`,{className:`t-fill`,children:[(0,V.jsx)(W,{dim:.6}),(0,V.jsx)(`div`,{className:`t-overlay t-results-overlay`,children:(0,V.jsxs)(`div`,{className:`t-modal t-panel t-results ${e.victory?`is-victory`:`is-failure`}`,"data-first-session-result":e.runId,children:[(0,V.jsxs)(`header`,{className:`t-outcome-hero`,children:[(0,V.jsxs)(`span`,{className:`t-kicker`,children:[`ACTION / `,e.name]}),(0,V.jsx)(`h2`,{className:`t-title`,children:e.victory?`MISSION SECURED`:`MISSION LOST`})]}),(0,V.jsx)(Ga,{}),(0,V.jsxs)(`dl`,{className:`t-stats`,children:[(0,V.jsxs)(`div`,{children:[(0,V.jsx)(`dt`,{children:`Turns`}),(0,V.jsx)(`dd`,{children:e.results.turns})]}),(0,V.jsxs)(`div`,{children:[(0,V.jsx)(`dt`,{children:`Eliminated`}),(0,V.jsx)(`dd`,{children:e.results.hostilesEliminated})]}),(0,V.jsxs)(`div`,{children:[(0,V.jsx)(`dt`,{children:`Squad standing`}),(0,V.jsxs)(`dd`,{children:[e.results.squadStanding,` / `,e.results.squadDeployed]})]})]}),(0,V.jsxs)(`section`,{"aria-label":`Consequence`,children:[(0,V.jsx)(`div`,{className:`t-kicker`,children:`CONSEQUENCE`}),(0,V.jsx)(`p`,{children:e.consequence})]}),e.fieldResult?(0,V.jsx)(mo,{result:e.fieldResult}):(0,V.jsxs)(`section`,{"aria-label":`Growth`,children:[(0,V.jsx)(`div`,{className:`t-kicker`,children:`GROWTH`}),(0,V.jsx)(`p`,{children:e.growth})]}),(0,V.jsx)(`div`,{className:`t-brief-actions t-result-actions`,children:(0,V.jsx)(`button`,{type:`button`,className:`t-btn t-btn-primary`,onClick:()=>{if(Me()?.acknowledge(e.runId)){let e=B.getState();[`results`,`defeat`].includes(e.screen)&&t()}},children:`Continue`})})]})})]})}function mo({result:e}){let t=e.advancedUnlocked?`ADVANCED DIRECTIVES`:e.unlockedApproaches.includes(`south`)?`SOUTH APPROACH`:null,n=e.rankAfter<2?6:12;return(0,V.jsxs)(`section`,{className:`t-field-feedback`,"aria-label":`Recorded Field Op result`,children:[t?(0,V.jsxs)(`div`,{className:`t-unlock`,children:[(0,V.jsx)(`span`,{className:`t-kicker`,children:`UNLOCKED`}),(0,V.jsx)(`strong`,{children:t})]}):null,(0,V.jsxs)(`div`,{className:`t-progress-heading`,children:[(0,V.jsxs)(`div`,{children:[(0,V.jsx)(`span`,{className:`t-kicker`,children:`COMMANDER`}),(0,V.jsxs)(`strong`,{children:[`RANK `,e.rankBefore===e.rankAfter?``:`${e.rankBefore} → `,e.rankAfter]})]}),(0,V.jsxs)(`b`,{children:[`+`,e.progressEarned,(0,V.jsx)(`small`,{children:`PROGRESS`})]})]}),(0,V.jsx)(`progress`,{className:`t-progress`,"aria-label":`Commander progress`,value:Math.min(e.progressAfter,n),max:n}),(0,V.jsxs)(`div`,{className:`t-progress-caption`,children:[(0,V.jsxs)(`span`,{children:[e.progressBefore,` → `,e.progressAfter,` TOTAL`]}),(0,V.jsx)(`span`,{children:e.rankAfter>=3?`CERTIFIED · ALL CURRENT COMMAND TOOLS OPEN`:`${Math.max(0,n-e.progressAfter)} TO RANK ${e.rankAfter+1}`})]}),e.victory&&e.progressEarned===0?(0,V.jsxs)(`div`,{className:`t-mission-strip`,children:[(0,V.jsx)(`span`,{children:`CLEAR SECURED · REPLAY`}),(0,V.jsx)(`span`,{children:`+0 COMMANDER`})]}):null,e.victory&&e.firstCycleSecure===!1&&e.progressEarned>0?(0,V.jsxs)(`div`,{className:`t-mission-strip`,children:[(0,V.jsx)(`span`,{children:`CLEAR ALREADY SECURED`}),(0,V.jsxs)(`span`,{children:[`CHALLENGE +`,e.challengeBonus,` COMMANDER`]})]}):null,(0,V.jsxs)(`div`,{className:`t-mission-strip`,children:[(0,V.jsx)(`span`,{children:e.legacyReport?`CHALLENGE UNMEASURED`:e.challengeSuccess?e.challengeBonus?`CHALLENGE MET · +${e.challengeBonus} COMMANDER`:`CHALLENGE ✓`:`CHALLENGE NOT MET`}),e.directiveTier===`advanced`?(0,V.jsxs)(`span`,{children:[`ADVANCED · `,te(e.directiveSet),e.firstCycleAdvanced?` · SECURED TODAY`:e.victory?` · REPLAY`:` · FAILED`]}):null]}),(0,V.jsx)(`p`,{className:`t-player-result-meaning`,children:e.victory?e.progressEarned>0?`PROGRESS RECORDED · YOUR NEXT COMMANDER MILESTONE IS CLOSER.`:`MISSION REPLAY COMPLETE · COMMANDER REWARDS ALREADY SECURED THIS ROTATION.`:`NO COMMANDER PROGRESS EARNED · REASSESS YOUR SQUAD AND TRY AGAIN.`}),(0,V.jsxs)(`div`,{className:`t-mission-strip t-field-rewards`,"aria-label":`Character rewards`,children:[(0,V.jsxs)(`span`,{children:[`+`,e.xpGranted,` EXP`]}),(0,V.jsxs)(`span`,{children:[`+`,e.bonesGranted,` BONES`]})]}),e.challengeSuccess&&!e.challengeBonus?(0,V.jsx)(`small`,{children:`Challenge bonus already earned this rotation.`}):null,(0,V.jsx)(Xa,{changes:e.masteryChanges,victory:e.victory}),(0,V.jsxs)(`div`,{className:`t-world-change`,children:[(0,V.jsx)(`span`,{className:`t-kicker`,children:`SIGNAL PRESSURE`}),(0,V.jsx)(`strong`,{children:e.regionalApplied?`${ee(e.pressureBefore)} → ${ee(e.pressureAfter)}`:`CURRENT ROTATION UNCHANGED`}),(0,V.jsx)(`small`,{children:e.regionalApplied?e.pressureAfter<2?`+1 ROUND DELAY · REINFORCEMENTS`:`REINFORCEMENTS ON SCHEDULE`:`Earlier rotation attempt. Current front and Commander certification unchanged.`})]})]})}function ho(){let[e,t]=(0,y.useState)(`command`),[n,r]=(0,y.useState)(`skillbook`),[i,a]=(0,y.useState)(null),o=B(e=>e.progression),s=B(e=>e.openOperationBrief),c=B(e=>e.progressionError),l=B(e=>e.missionFirstClear),u=o?.operations?.[Ce.operationId],d=o?.operations?.[we.operationId],f=o?.campaignIntel?.[`dead-relay`]?.courierTraceAcquired===!0,p=o?.fieldOps,m=B(e=>e.loadFoundationProgression),h=B(e=>e.progressionStatus===`loading`);(0,y.useEffect)(()=>{if(!p?.board)return;let e=()=>{document.visibilityState===`visible`&&B.getState().progressionStatus!==`loading`&&m()},t=window.setTimeout(e,Math.max(1e3,p.board.nextRotationAt*1e3-Date.now()+250));return document.addEventListener(`visibilitychange`,e),window.addEventListener(`focus`,e),()=>{window.clearTimeout(t),document.removeEventListener(`visibilitychange`,e),window.removeEventListener(`focus`,e)}},[p?.board?.nextRotationAt,m]);let g=p?.board?.activeMissionIds||[],_=g.map(e=>j(e)).filter(Boolean),v=p?.board?.cycleId,b=p?.rotationProgress,x=new Set(b?.clearedMissionIds||[]),C=p?.activeMissionRun&&g.includes(p.activeMissionRun.missionId)?j(p.activeMissionRun.missionId):null,ne=C||_.find(e=>p?.records[e.missionId]?.lastClearCycle!==v)||_[0]||null,w=ne?p?.records[ne.missionId]:null,T=ne?w?.lastClearCycle===v:!1,ie=ne?w?.lastChallengeCycle===v:!1,ae=p?.board?re(p.board.nextRotationAt):`REFRESH REQUIRED`,oe=p?.commander?.rank||1,se=p?.commander?.progress||0,ce=p?.commander?.nextRankAt||null,E=ce?Math.max(0,ce-se):0,D=p?.region?ee(p.region.pressure):`UNKNOWN`,O=p?.region?S(p.region.pressure):`Refresh to load current field conditions.`,le=p?.board?.reportVersion===3?te(p.board.directiveSet):null,ue=d?.activeMissionRun?.missionId||we.orderedMissionIds.find(e=>d?.missions[e]===`available`)||null,de=u?.status===`cleared`?d?`BROKEN SIGNAL COMPLETE · OPERATION 02 THE DEAD RELAY NOW AVAILABLE`:`BROKEN SIGNAL COMPLETE · FIELD OPS NOW DRIVE YOUR TACTICAL PROGRESSION`:u?.missions[`broken-signal-recover`]===`cleared`?`RECOVER SIGNAL CLEARED · SIGNAL COMMANDER AVAILABLE`:`BREACH CLEARED · RECOVER SIGNAL UNLOCKED`,fe=d?(0,V.jsxs)(`section`,{className:`t-panel ${d.status===`cleared`?`t-wt-story-archive`:`t-wt-campaign-feature`}`,"aria-label":`Operation 02 campaign`,children:[(0,V.jsxs)(`div`,{className:`t-wt-section-head`,children:[(0,V.jsxs)(`div`,{children:[(0,V.jsx)(`span`,{className:`t-kicker`,children:`STORY CAMPAIGN · OPERATION 02`}),(0,V.jsx)(`h2`,{className:`t-title`,children:`THE DEAD RELAY`})]}),(0,V.jsx)(`strong`,{children:d.status===`cleared`?`CAMPAIGN SECURED`:d.missions[`dead-relay-courier`]===`locked`?`LOCKED`:`IN PROGRESS`})]}),(0,V.jsx)(`p`,{children:`Intercept the courier. Hold the relay. Defeat its Guardian. Each first clear unlocks the next stage; your courier Intel changes the Hold mission.`}),d.status!==`cleared`&&ue?(0,V.jsxs)(`div`,{className:`t-wt-campaign-actions`,children:[(0,V.jsxs)(`div`,{children:[(0,V.jsx)(`span`,{className:`t-kicker`,children:`NEXT STORY MISSION`}),(0,V.jsx)(`strong`,{children:j(ue)?.name||`THE DEAD RELAY`})]}),(0,V.jsx)(`button`,{className:`t-btn t-btn-primary t-wt-campaign-cta`,type:`button`,disabled:h,onClick:()=>s(ue),children:d.activeMissionRun?.missionId?`RESUME CAMPAIGN`:`CONTINUE CAMPAIGN`})]}):null,(0,V.jsxs)(`div`,{className:`t-mission-strip`,children:[(0,V.jsx)(`span`,{children:`COURIER TRACE`}),(0,V.jsx)(`strong`,{children:f?`ACQUIRED · HOUND ARRIVES 1 ROUND LATER`:`NOT RECORDED · EARLY INTERCEPT REQUIRED`})]}),(0,V.jsx)(`div`,{className:`t-brief-grid t-wt-canon-grid`,children:we.orderedMissionIds.map((e,t)=>{let n=j(e);if(!n)return null;let r=d.missions[e]||`locked`,i=d.activeMissionRun?.missionId===e;return(0,V.jsxs)(`div`,{className:`t-panel t-brief-block t-story-mission is-${r}`,children:[(0,V.jsxs)(`span`,{className:`t-kicker`,children:[`MISSION `,String(t+1).padStart(2,`0`),` · `,n.objectiveType]}),(0,V.jsx)(`strong`,{children:n.name}),(0,V.jsx)(`small`,{children:r===`cleared`?`CLEARED`:r===`available`?`AVAILABLE`:`LOCKED`}),(0,V.jsx)(`button`,{type:`button`,className:`t-btn`,disabled:h||r===`locked`,onClick:()=>s(e),children:i?`RESUME FROM START`:r===`cleared`?`REPLAY`:r===`available`?`VIEW BRIEF`:`LOCKED`})]},e)})}),(0,V.jsx)(`small`,{children:`Resume restarts the accepted battle from turn 1; mid-battle positions and HP are not saved.`})]}):null;return(0,V.jsxs)(`div`,{className:`t-fill`,children:[(0,V.jsx)(W,{dim:.5,art:oo.startHero,className:`t-bg-hero`}),(0,V.jsx)(`div`,{className:`t-vignette`}),(0,V.jsxs)(`div`,{className:`t-brief t-war-table-premium t-war-table-v29 t-command-art-shell t-premium-ux`,style:{maxWidth:`64rem`},children:[(0,V.jsxs)(`header`,{className:`t-panel t-wt-hero t-wt-hero-compact`,children:[(0,V.jsxs)(`div`,{className:`t-wt-branding`,children:[(0,V.jsx)(`div`,{className:`t-kicker`,children:`Alpha Husky / Tactical Ops`}),(0,V.jsx)(`h1`,{className:`t-title t-wt-title`,children:`TACTICAL OPS`}),(0,V.jsx)(`p`,{className:`t-wt-intro`,children:`Your next move starts here.`}),c?(0,V.jsx)(`p`,{className:`t-wt-error`,children:c}):null,l?(0,V.jsx)(`p`,{className:`t-wt-highlight`,children:de}):null]}),(0,V.jsx)(`button`,{className:`t-wt-refresh`,type:`button`,disabled:h,onClick:()=>void m(),"aria-label":`Refresh Tactical Ops`,children:h?`SYNCING…`:`REFRESH`})]}),(0,V.jsx)(`nav`,{className:`t-command-nav t-command-framed-nav`,"aria-label":`Tactical command sections`,children:[[`command`,`01`,`COMMAND`],[`missions`,`02`,`MISSIONS`],[`squad`,`03`,`SQUAD`],[`archive`,`04`,`ARCHIVE`]].map(([n,r,i])=>(0,V.jsxs)(`button`,{type:`button`,className:e===n?`is-current`:``,"aria-pressed":e===n,onClick:()=>t(n),children:[(0,V.jsx)(`span`,{children:r}),(0,V.jsx)(`strong`,{children:i})]},n))}),e===`command`?(0,V.jsxs)(`div`,{className:`t-command-pane`,"aria-label":`Command overview`,children:[ne?(()=>{let e=so(ne);return(0,V.jsxs)(V.Fragment,{children:[(0,V.jsxs)(`section`,{className:`t-player-route`,"aria-label":`Your next tactical goal`,children:[(0,V.jsx)(`span`,{className:`t-kicker`,children:C?`CONTINUE YOUR RUN`:`YOUR NEXT STEP`}),(0,V.jsx)(`strong`,{children:ne.name}),(0,V.jsx)(`p`,{children:lo(Oe(ne,{reportVersion:p?.board?.reportVersion||2}))}),(0,V.jsxs)(`div`,{className:`t-player-route-metrics`,children:[(0,V.jsxs)(`span`,{children:[b?.securedCount||0,`/`,b?.total||g.length,` FIELD OPS SECURED`]}),(0,V.jsx)(`span`,{children:ce?`${E} TO COMMANDER RANK ${oe+1}`:`COMMANDER CERTIFIED`}),(0,V.jsx)(`span`,{children:T?ie?`CLEAR + CHALLENGE SECURED`:`OPTIONAL CHALLENGE REMAINS`:`FIRST CLEAR AVAILABLE`})]}),(0,V.jsx)(`small`,{children:T&&ie?`This mission's Commander rewards are already secured for this rotation. Try another operation.`:`First clears and challenges grant Commander progress. Companion Mastery unlocks at 3/8 and 8/8.`})]}),(0,V.jsxs)(`section`,{className:`t-panel t-wt-feature t-wt-next-op t-command-mission-feature t-mission-tone-${e.tone}`,"aria-label":`Recommended next operation`,children:[(0,V.jsxs)(`div`,{className:`t-wt-feature-art`,children:[(0,V.jsx)(`img`,{src:e.art,alt:``,"aria-hidden":`true`}),(0,V.jsx)(`span`,{className:`t-wt-art-label`,children:e.label})]}),(0,V.jsxs)(`div`,{className:`t-wt-feature-copy`,children:[(0,V.jsx)(`div`,{className:`t-kicker`,children:C?`Resume run`:`Next op`}),(0,V.jsx)(`h2`,{children:ne.name}),(0,V.jsx)(`p`,{className:`t-wt-objective`,children:lo(Oe(ne,{reportVersion:p?.board?.reportVersion||2}))}),(0,V.jsxs)(`div`,{className:`t-wt-reward-chips t-premium-reward-strip`,"aria-label":`Mission progression rewards`,children:[(0,V.jsxs)(`span`,{children:[(0,V.jsx)(`b`,{children:T?`✓`:`+2`}),` `,T?`Clear secured · replay`:`Commander`]}),(0,V.jsxs)(`span`,{className:ie?`is-earned`:``,children:[(0,V.jsx)(`b`,{children:ie?`✓`:`+1`}),` `,ie?`Challenge`:`Commander · Challenge`]}),(0,V.jsxs)(`span`,{children:[(0,V.jsx)(`b`,{children:`+2`}),` Mastery first clear`]})]})]}),(0,V.jsx)(`div`,{className:`t-wt-feature-cta`,children:(0,V.jsxs)(`button`,{className:`t-btn t-btn-primary t-wt-main-cta t-command-hero-cta`,type:`button`,disabled:h,onClick:()=>s(ne.missionId),children:[C?`RESUME OP`:T?`DEPLOY AGAIN`:`VIEW BRIEF`,(0,V.jsx)(He,{className:`t-ico`})]})})]})]})})():null,(0,V.jsxs)(`section`,{className:`t-wt-status-rail t-wt-status-rail-v29 t-premium-status-rail`,"aria-label":`Tactical Ops overview`,children:[(0,V.jsxs)(`div`,{className:`t-panel t-wt-status-card t-wt-rank-card`,children:[(0,V.jsx)(`span`,{className:`t-kicker`,children:`Commander`}),(0,V.jsx)(`strong`,{children:oe>=3?`RANK 3 · CERTIFIED`:`RANK ${oe}`}),ce?(0,V.jsxs)(V.Fragment,{children:[(0,V.jsx)(`progress`,{className:`t-progress`,value:Math.min(se,ce),max:ce}),(0,V.jsxs)(`small`,{children:[se,` / `,ce,` progress`]})]}):(0,V.jsx)(`small`,{children:`All current command tools unlocked`})]}),(0,V.jsxs)(`div`,{className:`t-panel t-wt-status-card t-wt-pressure-card is-${D.toLowerCase()}`,children:[(0,V.jsx)(`span`,{className:`t-kicker`,children:`Area status`}),(0,V.jsx)(`strong`,{children:D}),(0,V.jsx)(`small`,{children:O})]}),(0,V.jsxs)(`div`,{className:`t-panel t-wt-status-card`,children:[(0,V.jsx)(`span`,{className:`t-kicker`,children:`Rotation`}),(0,V.jsx)(`strong`,{children:ae}),(0,V.jsxs)(`small`,{children:[g.length||0,` active Field Ops`,le?` · ${le}`:``]})]})]}),p?.board&&b?(0,V.jsxs)(`button`,{type:`button`,className:`t-premium-front-link`,onClick:()=>t(`missions`),children:[(0,V.jsxs)(`span`,{children:[(0,V.jsx)(`strong`,{children:`FRONT STATUS`}),(0,V.jsxs)(`small`,{children:[b.securedCount,`/`,b.total,` SECURED · `,b.challengeMissionIds.length,` CHALLENGES`]})]}),(0,V.jsxs)(`span`,{children:[`VIEW MISSIONS `,(0,V.jsx)(He,{className:`t-ico`})]})]}):null,p?.activeMissionRun&&!p.board?.activeMissionIds.includes(p.activeMissionRun.missionId)?(0,V.jsxs)(`section`,{className:`t-panel t-wt-legacy-run`,children:[(0,V.jsxs)(`div`,{children:[(0,V.jsx)(`div`,{className:`t-kicker`,children:`Saved run`}),(0,V.jsx)(`strong`,{children:j(p.activeMissionRun.missionId)?.name}),(0,V.jsx)(`p`,{children:`This run started before the rotation changed. Its original conditions are preserved.`})]}),(0,V.jsx)(`button`,{type:`button`,className:`t-btn`,onClick:()=>s(p.activeMissionRun.missionId),children:`RESUME`})]}):null]}):null,e===`missions`?(0,V.jsxs)(`div`,{className:`t-command-pane`,"aria-label":`Operations and field missions`,children:[d?.status===`cleared`?null:fe,(0,V.jsxs)(`section`,{className:`t-panel t-wt-section t-wt-current-ops`,"aria-label":`Current Field Ops`,children:[(0,V.jsxs)(`div`,{className:`t-wt-section-head`,children:[(0,V.jsxs)(`div`,{children:[(0,V.jsx)(`div`,{className:`t-kicker`,children:`This rotation`}),(0,V.jsx)(`h2`,{className:`t-title`,children:`CURRENT FIELD OPS`})]}),(0,V.jsxs)(`span`,{children:[g.length,` ACTIVE`]})]}),(0,V.jsx)(`nav`,{className:`t-op-selector`,"aria-label":`Select a Field Op`,children:_.map((e,t)=>(0,V.jsxs)(`button`,{type:`button`,"aria-pressed":(i&&g.includes(i)?i:g[0])===e.missionId,className:(i&&g.includes(i)?i:g[0])===e.missionId?`is-selected`:``,onClick:()=>a(e.missionId),children:[(0,V.jsx)(`span`,{children:String(t+1).padStart(2,`0`)}),(0,V.jsx)(`strong`,{children:e.name}),(0,V.jsx)(`small`,{children:x.has(e.missionId)?`SECURED`:`FIRST CLEAR`})]},e.missionId))}),(0,V.jsx)(`div`,{className:`t-wt-mission-list t-op-selected`,children:_.filter(e=>e.missionId===(i&&g.includes(i)?i:g[0])).map(e=>{let t=p?.records[e.missionId],n=t?.lastClearCycle===p?.board?.cycleId,r=t?.lastChallengeCycle===p?.board?.cycleId,i=Oe(e,{reportVersion:p?.board?.reportVersion||2}),a=so(i);return(0,V.jsxs)(`article`,{className:`t-wt-mission-card t-panel t-mission-tone-${a.tone} ${n?`is-cleared`:`is-active`}`,children:[(0,V.jsxs)(`div`,{className:`t-wt-mission-art`,children:[(0,V.jsx)(`img`,{src:a.art,alt:``,"aria-hidden":`true`}),(0,V.jsx)(`span`,{className:`t-wt-mission-type`,children:a.label})]}),(0,V.jsxs)(`div`,{className:`t-wt-mission-body`,children:[(0,V.jsxs)(`div`,{className:`t-wt-mission-head`,children:[(0,V.jsxs)(`div`,{children:[(0,V.jsx)(`h3`,{children:e.name}),(0,V.jsx)(`p`,{children:lo(i)})]}),(0,V.jsx)(`div`,{className:`t-wt-mission-state`,children:n?`SECURED TODAY`:`AVAILABLE`})]}),(0,V.jsxs)(`div`,{className:`t-player-mission-counter`,children:[`OPERATION `,g.indexOf(e.missionId)+1,` / `,g.length,` · `,a.label,` · `,n?`CLEARED`:`UNCLEARED`]}),(0,V.jsxs)(`div`,{className:`t-wt-mission-meta`,children:[(0,V.jsxs)(`span`,{children:[(0,V.jsx)(`b`,{children:`CLEAR`}),` `,n?`SECURED · REPLAY`:`+2 COMMANDER`]}),(0,V.jsxs)(`span`,{className:r?`is-earned`:``,children:[(0,V.jsx)(`b`,{children:`CHALLENGE`}),` `,r?`✓`:`+1 COMMANDER · ${e.challenge?.label||`Optional challenge`}`]})]}),(0,V.jsxs)(`details`,{className:`t-detail t-wt-card-detail`,children:[(0,V.jsx)(`summary`,{children:`Field conditions`}),(0,V.jsxs)(`p`,{children:[(0,V.jsxs)(`strong`,{children:[H(e),`.`]}),` `,uo(e)]}),(0,V.jsxs)(`p`,{children:[(0,V.jsx)(`strong`,{children:`Area:`}),` `,O]})]})]}),(0,V.jsx)(`div`,{className:`t-wt-mission-cta`,children:(0,V.jsxs)(`button`,{className:`t-btn t-btn-primary`,type:`button`,disabled:h,onClick:()=>s(e.missionId),children:[n?`DEPLOY AGAIN`:`VIEW BRIEF`,(0,V.jsx)(He,{className:`t-ico`})]})})]},e.missionId)})})]})]}):null,e===`squad`?(0,V.jsxs)(`div`,{className:`t-command-pane`,"aria-label":`Character progression and mastery`,children:[(0,V.jsxs)(`div`,{className:`t-premium-squad-switch`,role:`group`,"aria-label":`Squad progression view`,children:[(0,V.jsx)(`button`,{type:`button`,"aria-pressed":n===`skillbook`,className:n===`skillbook`?`is-selected`:``,onClick:()=>r(`skillbook`),children:`CHARACTER SKILLBOOK`}),(0,V.jsx)(`button`,{type:`button`,"aria-pressed":n===`mastery`,className:n===`mastery`?`is-selected`:``,onClick:()=>r(`mastery`),children:`PACK MASTERY`})]}),n===`skillbook`?(0,V.jsx)($a,{}):(0,V.jsx)(Ya,{})]}):null,e===`archive`?(0,V.jsxs)(`div`,{className:`t-command-pane`,"aria-label":`Campaign archive and test settings`,children:[d?.status===`cleared`?fe:null,(0,V.jsxs)(`details`,{className:`t-panel t-wt-story-archive`,children:[(0,V.jsxs)(`summary`,{children:[(0,V.jsxs)(`span`,{children:[(0,V.jsx)(`span`,{className:`t-kicker`,children:`Story archive`}),(0,V.jsx)(`strong`,{children:`OPERATION 01 · BROKEN SIGNAL`})]}),(0,V.jsx)(`b`,{children:u?.status===`cleared`?`COMPLETE`:`IN PROGRESS`})]}),(0,V.jsx)(`p`,{children:u?.status===`cleared`?`Canon secured. Replay the three story missions whenever you want.`:`Complete BREACH → RECOVER SIGNAL → SIGNAL COMMANDER to secure the operation.`}),(0,V.jsx)(`div`,{className:`t-brief-grid t-wt-canon-grid`,children:Ce.orderedMissionIds.map((e,t)=>{let n=j(e);if(!n)return null;let r=u?.missions[e]||`locked`,i=n.executable&&(r===`available`||r===`cleared`);return(0,V.jsxs)(`div`,{className:`t-panel t-brief-block t-story-mission is-${r}`,children:[(0,V.jsxs)(`span`,{className:`t-kicker`,children:[`MISSION `,String(t+1).padStart(2,`0`)]}),(0,V.jsx)(`strong`,{children:n.name}),(0,V.jsx)(`small`,{children:r===`cleared`?`CLEARED`:r===`available`?`AVAILABLE`:`LOCKED`}),(0,V.jsx)(`button`,{type:`button`,className:`t-btn`,disabled:!i,onClick:()=>s(e),children:r===`cleared`?`REPLAY`:r===`available`?`VIEW BRIEF`:`LOCKED`})]},e)})})]}),p?.lastResult?(0,V.jsxs)(`details`,{className:`t-detail t-wt-last-result t-wt-secondary-detail`,children:[(0,V.jsxs)(`summary`,{children:[`Last result · `,re(p.lastResult.recordedAt)]}),(0,V.jsxs)(`strong`,{children:[j(p.lastResult.missionId)?.name,` · `,p.lastResult.victory?`CLEARED`:`FAILED`]}),(0,V.jsx)(mo,{result:p.lastResult})]}):null,(0,V.jsxs)(`section`,{className:`t-panel t-wt-battlefield-lab`,"aria-label":`Battlefield Lab testing mode`,children:[(0,V.jsxs)(`div`,{children:[(0,V.jsx)(`span`,{className:`t-kicker`,children:`BATTLEFIELD LAB · DEVICE TEST`}),(0,V.jsx)(`strong`,{children:M?`10 × 7 · EXPERIMENTAL`:`8 × 5 · CURRENT`}),(0,V.jsx)(`p`,{children:`Compare real missions with your signed-in Alpha account. This setting changes only the battlefield on this device. It does not reset or replace your account.`})]}),(0,V.jsx)(`button`,{type:`button`,className:`t-btn`,"aria-label":M?`Switch to current 8 by 5 battlefield`:`Switch to experimental 10 by 7 battlefield`,onClick:()=>{try{if(M){window.localStorage.removeItem(ft);let e=new URL(window.location.href);if(e.searchParams.has(`tacticalBattlefieldVNext`)){e.searchParams.delete(`tacticalBattlefieldVNext`),window.location.replace(e.toString());return}}else window.localStorage.setItem(ft,`10x7`);window.location.reload()}catch{window.alert(`Could not save the test mode on this device.`)}},children:M?`USE 8 × 5`:`TEST 10 × 7`})]})]}):null]})]})}function go(){let[e,t]=(0,y.useState)(`mission`),[n,r]=(0,y.useState)(`alpha`),[i,a]=(0,y.useState)(!1),o=B(e=>e.identity),s=B(e=>e.deploy),c=B(e=>e.backToHub),l=B(e=>e.onboardingEnabled),u=B(e=>e.onboardingStageId),d=B(e=>e.selectedMissionId),f=B(e=>e.selectedSquadIds),p=B(e=>e.selectedApproach),m=B(e=>e.selectedDirectiveTier),h=B(e=>e.selectDirectiveTier),g=B(e=>e.selectApproach),_=B(e=>e.progression?.fieldOps),v=B(e=>e.progression?.packMastery),b=B(e=>e.progression?.playerGrowth),C=B(e=>e.selectRecoverTeammate),ne=B(e=>e.toggleCommanderTeammate),w=B(e=>e.progression?.equippedPet),T=B(e=>e.progression?.kodaSidegrade),ie=B(e=>e.progression?.operations?.[`broken-signal`]?.status===`cleared`),ae=B(e=>e.kodaSavePending),oe=B(e=>e.selectKodaSidegrade),se=B(e=>e.progression?.shadowSidegrade),E=B(e=>e.shadowSavePending),D=B(e=>e.selectShadowSidegrade),O=B(e=>e.progressionError),ue=B(e=>e.busy),de=Pi(l,u),fe=B(e=>e.progression?.operations?.[we.operationId]?.activeMissionRun),pe=B(e=>e.progression?.campaignIntel?.[`dead-relay`]?.courierTraceAcquired===!0),k=fe?.missionId===d?fe.campaignContext:{version:1,courierTraceAcquired:pe},me=j(d),he=me?.operationId===we.operationId,ge=he?fe:_?.activeMissionRun,_e=ge?.missionId===d&&ge.squadIds.join(`,`)===f.join(`,`)&&(ge.fieldContext?.approach||`standard`)===p&&(ge.fieldContext?.directiveTier||`standard`)===m,ve=_e&&ge?.fieldContext?ge.fieldContext:{pressure:_?.region?.pressure??2,reportVersion:_?.board?.reportVersion||2,directiveTier:m,directiveSet:_?.board?.directiveSet},A=me?Oe(me,ve):null,be=A?.activity===`FIELD_OP`,Se=!!(A&&(be||he||A.objectiveType===`BOSS`)),Ce=A?ke(A,f,w,p)||(be||he?ke(A,[`alpha`,`ally-02`,`ally-03`],w):A.objectiveType===`RECOVER`?xe([`alpha`,`ally-02`]):ye.filter(e=>![`ally-02`,`ally-03`].includes(e.defId))):de.spawns,Te=A?na(Ce,{kodaSidegrade:T,shadowSidegrade:se,packMastery:_e?ge?.packMastery||{}:v}):Ce,Ee=A?le(A,ve):[],De=A&&(be||he)?Ae(A,!1,ve,k).reinforcement?.triggerRound:void 0,je=A?A.name:l?de.operationName:ce.name,Me=A?A.briefCopy:l?de.objective:ce.objective,Ne=Fi(Te).map(e=>Ln(e,o)),Pe=_e?ge?.playerGrowth:b,Fe=no(Ne,Pe),Ie=io(Ne,Pe),Le=ao(Ie,Pe,F),Re=ro(f.length?f:Ne.map(e=>e.defId),w?.id),ze=Ii(Te),Be=A?`${A.objectiveType} · Squad cap ${A.squadCap}. `:l?de.teaching:`Units act individually by Speed. Alpha must close to melee range 1 before Strike or Rend.`,Ve=be||he?`PRIMARY OBJECTIVE: ${A.objectiveType}`:A?.objectiveType===`RECOVER`?`PRIMARY OBJECTIVE: RECOVER THE SIGNAL`:A?.objectiveType===`BOSS`?`PRIMARY OBJECTIVE: DEFEAT THE SIGNAL COMMANDER`:A?.objectiveType===`ELIMINATE`?`PRIMARY OBJECTIVE: ELIMINATE HOSTILES`:null,Ue=!A&&l&&u===`ally-koda`?`CNC JOINED · ROSTER UPDATED`:!A&&l&&u===`full-broken-signal`?`SHADOW JOINED · FULL SQUAD READY`:null,We=he?A?.missionId===`dead-relay-courier`?`EARLY INTERCEPT: first win by round 4 grants Courier Trace. Slower victory still unlocks Hold.`:A?.missionId===`dead-relay-hold`?`COURIER TRACE ${k.courierTraceAcquired?`ACTIVE: HOUND ROUND 3`:`NOT ACQUIRED: HOUND ROUND 2`}`:`Guardian reinforcement arrives on round 3.`:A?.objectiveType===`BOSS`?`Routing Trace telegraphs the fixed reinforcement.`:A?.missionId===`broken-signal-breach`?`TRACE target can reveal Routing Trace.`:`No Intel required.`,Ge=A?so(A):{art:oo.operationPlate,tone:`assault`,label:`TACTICAL OPS`};return(0,V.jsxs)(`div`,{className:`t-fill`,children:[(0,V.jsx)(W,{dim:.58}),(0,V.jsxs)(`div`,{className:`t-brief t-deployment t-deployment-v29 t-command-art-shell t-premium-ux`,children:[(0,V.jsxs)(`header`,{className:`t-deploy-hero t-deploy-hero-v29 t-command-brief-hero t-mission-tone-${Ge.tone}`,children:[(0,V.jsx)(`img`,{src:Ge.art,alt:``,"aria-hidden":`true`}),(0,V.jsxs)(`div`,{className:`t-deploy-hero-copy`,children:[(0,V.jsx)(`div`,{className:`t-deploy-mode-label`,children:Ge.label}),(0,V.jsxs)(`div`,{className:`t-kicker`,children:[be?`FIELD OPS`:`TACTICAL OPS`,` / MISSION BRIEF`]}),(0,V.jsx)(`h1`,{className:`t-title`,children:je}),(0,V.jsx)(`p`,{children:A?lo(A):Me})]}),be&&_?.board?(0,V.jsxs)(`div`,{className:`t-deploy-rotation`,children:[(0,V.jsx)(`span`,{className:`t-kicker`,children:`Rotation`}),(0,V.jsx)(`strong`,{children:re(_.board.nextRotationAt)})]}):null]}),(0,V.jsx)(`nav`,{className:`t-command-nav t-deploy-command-nav t-command-framed-nav`,"aria-label":`Mission preparation sections`,children:[[`mission`,`01`,`MISSION`],[`squad`,`02`,`SQUAD`],[`loadout`,`03`,`LOADOUT`],[`intel`,`04`,`INTEL`]].map(([n,r,i])=>(0,V.jsxs)(`button`,{type:`button`,className:e===n?`is-current`:``,"aria-pressed":e===n,onClick:()=>t(n),children:[(0,V.jsx)(`span`,{children:r}),(0,V.jsx)(`strong`,{children:i})]},n))}),e===`mission`?(0,V.jsxs)(`div`,{className:`t-command-pane t-deploy-command-pane`,"aria-label":`Mission objective and rewards`,children:[Ue?(0,V.jsx)(`div`,{className:`t-recruit-moment`,children:Ue}):null,he?(0,V.jsxs)(`div`,{className:`t-panel t-deploy-overview`,children:[(0,V.jsx)(`strong`,{children:`MISSION INTEL`}),(0,V.jsx)(`p`,{children:We})]}):null,(0,V.jsxs)(`section`,{className:`t-panel t-deploy-overview`,"aria-label":`Mission overview`,children:[(0,V.jsxs)(`div`,{className:`t-deploy-summary-main`,children:[(0,V.jsx)(`div`,{className:`t-kicker`,children:`Objective`}),(0,V.jsx)(`strong`,{children:Ve?Ve.replace(`PRIMARY OBJECTIVE: `,``):A?lo(A):Me}),(0,V.jsx)(`p`,{children:A?Me:Be})]}),be?(0,V.jsxs)(V.Fragment,{children:[(0,V.jsxs)(`div`,{className:`t-deploy-summary-card`,children:[(0,V.jsx)(`span`,{className:`t-kicker`,children:`Clear reward`}),(0,V.jsx)(`strong`,{children:`+2 COMMANDER`}),(0,V.jsx)(`small`,{children:`First clear also grows deployed companions.`})]}),(0,V.jsxs)(`div`,{className:`t-deploy-summary-card`,children:[(0,V.jsx)(`span`,{className:`t-kicker`,children:`Bonus challenge`}),(0,V.jsx)(`strong`,{children:`+1 COMMANDER`}),(0,V.jsx)(`small`,{children:A?.challenge?.label||`Optional challenge`})]}),(0,V.jsxs)(`div`,{className:`t-deploy-summary-card t-deploy-pressure is-${ee(ve.pressure).toLowerCase()}`,children:[(0,V.jsx)(`span`,{className:`t-kicker`,children:`Area status`}),(0,V.jsx)(`strong`,{children:ee(ve.pressure)}),(0,V.jsx)(`small`,{children:S(ve.pressure)})]})]}):null]})]}):null,e===`squad`?(0,V.jsxs)(`div`,{className:`t-command-pane t-deploy-command-pane`,"aria-label":`Squad composition and mastery`,children:[(0,V.jsxs)(`section`,{className:`t-panel t-deploy-squad`,"aria-label":`Squad`,children:[(0,V.jsxs)(`div`,{className:`t-wt-section-head`,children:[(0,V.jsxs)(`div`,{children:[(0,V.jsx)(`div`,{className:`t-kicker`,children:`Squad`}),(0,V.jsxs)(`h2`,{className:`t-title`,children:[Ne.length,` / `,A?.squadCap||Ne.length,` DEPLOYED`]})]}),_e?(0,V.jsx)(`span`,{children:he?`RESUMING ACCEPTED RUN · ROUND 1 RESTART`:`RESUMING SAVED RUN`}):null]}),(0,V.jsx)(`div`,{className:`t-squad-preview t-squad-preview-v29`,"aria-label":`Selected squad`,children:Ne.map(e=>(0,V.jsxs)(`div`,{children:[(0,V.jsx)(`img`,{src:e.portrait,onError:e.defId===`alpha`?Wa:void 0,alt:``}),(0,V.jsx)(`span`,{children:e.defId===`ally-02`?`CNC`:e.role===`companion`?`PET`:e.name})]},e.defId))}),Se?(0,V.jsxs)(`div`,{className:`t-deploy-squad-picker`,children:[(0,V.jsx)(`p`,{children:`Choose two tactical companions.`}),(0,V.jsx)(`div`,{className:`t-brief-actions`,children:[{id:`ally-02`,label:`CNC`,role:`PRESSURE / DISRUPTION`,available:!0},{id:`ally-03`,label:`SHADOW`,role:`SUSTAIN / PROTECTION`,available:!0},{id:w?`pet:${w.id}`:`pet:unavailable`,label:w?`PET · ${w.name}`:`PET`,role:w?`MOBILITY / CONTROL`:`NO VALID PET EQUIPPED`,available:!!w}].map(e=>{let t=f.includes(e.id);return(0,V.jsxs)(`button`,{type:`button`,"aria-pressed":t,disabled:ue||ae||E||!e.available||!t&&f.length>=3,className:`t-btn ${t?`t-btn-primary`:`t-btn-ghost`}`,onClick:()=>ne(e.id),children:[e.label,(0,V.jsx)(`br`,{}),(0,V.jsx)(`small`,{children:e.role})]},e.id)})})]}):null,A?.objectiveType===`RECOVER`&&!be?(0,V.jsxs)(`div`,{className:`t-deploy-squad-picker`,children:[(0,V.jsx)(`p`,{children:`Choose one teammate for this recovery mission.`}),(0,V.jsxs)(`div`,{className:`t-brief-actions`,children:[(0,V.jsxs)(`button`,{type:`button`,disabled:ue,className:`t-btn ${f[1]===`ally-02`?`t-btn-primary`:`t-btn-ghost`}`,onClick:()=>C(`ally-02`),children:[`CNC`,(0,V.jsx)(`br`,{}),(0,V.jsx)(`small`,{children:`OFFENSE · PRESSURE`})]}),(0,V.jsxs)(`button`,{type:`button`,disabled:ue,className:`t-btn ${f[1]===`ally-03`?`t-btn-primary`:`t-btn-ghost`}`,onClick:()=>C(`ally-03`),children:[`SHADOW`,(0,V.jsx)(`br`,{}),(0,V.jsx)(`small`,{children:`SUPPORT · SUSTAIN`})]}),(0,V.jsxs)(`button`,{type:`button`,disabled:ue||!w,className:`t-btn ${w&&f[1]===`pet:${w.id}`?`t-btn-primary`:`t-btn-ghost`}`,onClick:()=>w&&C(`pet:${w.id}`),children:[`PET`,w?` · ${w.name}`:``,(0,V.jsx)(`br`,{}),(0,V.jsx)(`small`,{children:w?`MOBILITY · CONTROL`:`UNAVAILABLE`})]})]})]}):null]}),A?(0,V.jsxs)(`div`,{className:`t-brief-mastery-optional`,children:[(0,V.jsxs)(`button`,{type:`button`,className:`t-brief-optional-toggle`,"aria-expanded":i,onClick:()=>a(e=>!e),children:[(0,V.jsx)(`strong`,{children:`PACK MASTERY`}),(0,V.jsx)(`span`,{children:i?`HIDE DETAILS −`:`VIEW PROGRESSION +`})]}),i?(0,V.jsx)(Ya,{snapshot:_e?ge?.packMastery:void 0}):null]}):null]}):null,e===`loadout`?(0,V.jsx)(`div`,{className:`t-command-pane t-deploy-command-pane`,"aria-label":`Equipped protocols and sidegrades`,children:(0,V.jsxs)(`section`,{className:`t-panel t-codex-brief`,"aria-label":`Signal Codex equipped capabilities`,children:[(0,V.jsx)(`div`,{className:`t-wt-section-head`,children:(0,V.jsxs)(`div`,{children:[(0,V.jsx)(`span`,{className:`t-kicker`,children:`SQUAD BUILD · REAL ABILITIES`}),(0,V.jsx)(`h2`,{className:`t-title`,children:`SIGNAL CODEX`})]})}),(0,V.jsx)(`p`,{className:`t-codex-tradeoff`,children:Re}),(0,V.jsx)(`p`,{className:`t-codex-note`,children:`Current squad's equipped protocols, based on real A1/A2/A3 abilities. No extra skills or battle slots are granted.`}),(0,V.jsxs)(`div`,{className:`t-codex-loadout`,children:[(0,V.jsx)(`strong`,{children:`ACTIVE LOADOUT · EXISTING ABILITY SLOTS`}),(0,V.jsx)(`small`,{children:`Change your squad above. Saved CNC / SHADOW variants can be selected below when unlocked; existing A1 / A2 / A3 cooldown rules stay in force.`}),(0,V.jsx)(`nav`,{className:`t-loadout-unit-picker`,"aria-label":`Select unit abilities`,children:Ne.map(e=>(0,V.jsxs)(`button`,{type:`button`,className:(Ne.some(e=>e.defId===n)?n:Ne[0]?.defId)===e.defId?`is-selected`:``,"aria-pressed":(Ne.some(e=>e.defId===n)?n:Ne[0]?.defId)===e.defId,onClick:()=>r(e.defId),children:[(0,V.jsx)(`img`,{src:e.portrait,alt:``,onError:Wa}),(0,V.jsx)(`span`,{children:e.defId===`ally-02`?`CNC`:e.defId===`ally-03`?`SHADOW`:e.defId.startsWith(`pet:`)?`PET`:e.name})]},e.defId))}),Ne.filter(e=>e.defId===(Ne.some(e=>e.defId===n)?n:Ne[0]?.defId)).map(e=>(0,V.jsxs)(`div`,{className:`t-codex-unit`,children:[(0,V.jsxs)(`b`,{children:[e.name,` · `,e.defId.startsWith(`pet:`)?`2 ABILITIES`:`3 ABILITIES`]}),(0,V.jsx)(`div`,{className:`t-codex-slots`,children:Ie.filter(t=>t.unitId===e.defId).map((e,t)=>(0,V.jsxs)(`div`,{className:`t-codex-slot`,children:[(0,V.jsxs)(`strong`,{children:[e.slot,` · `,e.name]}),(0,V.jsxs)(`small`,{children:[e.family||`BASIC ATTACK`,` · CD `,e.cooldown,` · RANGE `,e.minRange,`–`,e.maxRange]})]},e.skillId+t))})]},e.defId))]}),(0,V.jsxs)(`div`,{className:`t-codex-counterlist`,"aria-label":`Tactical counter options`,children:[(0,V.jsx)(`strong`,{children:`COUNTERPLAY AVAILABLE TO THIS SQUAD`}),(0,V.jsx)(`div`,{className:`t-codex-counters`,children:Le.map(e=>(0,V.jsxs)(`div`,{className:`t-codex-counter ${e.available?`is-ready`:`is-missing`}`,children:[(0,V.jsxs)(`b`,{children:[e.label,` · `,e.available?`READY`:`NOT EQUIPPED`]}),(0,V.jsx)(`small`,{children:e.source||e.detail})]},e.id))})]}),(0,V.jsxs)(`div`,{className:`t-codex-variants`,children:[(0,V.jsx)(`strong`,{children:`EXISTING SAVED VARIANTS`}),_e?(0,V.jsx)(`small`,{className:`t-codex-note`,children:`Accepted run · squad and variants are locked until this mission ends.`}):null,A&&Te.some(e=>e.defId===`ally-02`)?(0,V.jsxs)(`div`,{className:`t-panel t-brief-block t-sidegrade-card`,children:[(0,V.jsx)(`div`,{className:`t-kicker`,children:`CNC · BUG HUNTER WARDEN`}),ie?(0,V.jsxs)(V.Fragment,{children:[(0,V.jsxs)(`div`,{className:`t-brief-actions`,children:[(0,V.jsx)(`button`,{type:`button`,disabled:_e||ue||ae||E,"aria-pressed":T===`A`,className:`t-btn ${T===`A`?`t-btn-primary`:`t-btn-ghost`}`,onClick:()=>void oe(`A`),children:`A · VANGUARD`}),(0,V.jsx)(`button`,{type:`button`,disabled:_e||ue||ae||E,"aria-pressed":T===`B`,className:`t-btn ${T===`B`?`t-btn-primary`:`t-btn-ghost`}`,onClick:()=>void oe(`B`),children:`B · DISRUPTOR`})]}),(0,V.jsx)(`small`,{children:ae?`Saving CNC choice…`:T?`SAVED · ${T===`A`?`VANGUARD`:`DISRUPTOR`}`:`Base CNC · no sidegrade selected`})]}):(0,V.jsx)(`small`,{children:`CNC sidegrades unlock after BROKEN SIGNAL is cleared.`})]}):null,A&&Te.some(e=>e.defId===`ally-03`)?(0,V.jsxs)(`div`,{className:`t-panel t-brief-block t-sidegrade-card`,children:[(0,V.jsx)(`div`,{className:`t-kicker`,children:`SHADOW · STAFF SUPPORT`}),ie?(0,V.jsxs)(V.Fragment,{children:[(0,V.jsxs)(`div`,{className:`t-brief-actions`,children:[(0,V.jsx)(`button`,{type:`button`,disabled:_e||ue||ae||E,"aria-pressed":se===`A`,className:`t-btn ${se===`A`?`t-btn-primary`:`t-btn-ghost`}`,onClick:()=>void D(`A`),children:`A · RESTORER`}),(0,V.jsx)(`button`,{type:`button`,disabled:_e||ue||ae||E,"aria-pressed":se===`B`,className:`t-btn ${se===`B`?`t-btn-primary`:`t-btn-ghost`}`,onClick:()=>void D(`B`),children:`B · WARDEN`})]}),(0,V.jsx)(`small`,{children:E?`Saving SHADOW choice…`:se?`SAVED · ${se===`A`?`RESTORER`:`WARDEN`}`:`Base SHADOW · no sidegrade selected`})]}):(0,V.jsx)(`small`,{children:`SHADOW sidegrades unlock after BROKEN SIGNAL is cleared.`})]}):null]}),(0,V.jsxs)(`details`,{className:`t-codex-reference`,children:[(0,V.jsx)(`summary`,{children:`ALL PROTOCOL FAMILIES · REFERENCE`}),(0,V.jsx)(`div`,{className:`t-codex-grid`,children:eo.map(e=>{let t=Fe.filter(t=>t.family===e);return(0,V.jsxs)(`div`,{className:`t-codex-family`,children:[(0,V.jsx)(`strong`,{children:e.toUpperCase()}),t.length?t.map((e,t)=>(0,V.jsxs)(`div`,{className:`t-codex-skill`,children:[(0,V.jsxs)(`b`,{children:[e.unit,` · `,e.slot,` `,e.skillName]}),(0,V.jsxs)(`small`,{children:[`CD `,e.cooldown,` · `,e.description]})]},e.unit+e.skillId+t)):(0,V.jsx)(`small`,{className:`t-codex-empty`,children:`No equipped protocol in this family.`})]},e)})})]})]})}):null,e===`intel`?(0,V.jsxs)(`div`,{className:`t-command-pane t-deploy-command-pane`,"aria-label":`Mission conditions and enemy intelligence`,children:[Ee.length||be?(0,V.jsxs)(`section`,{className:`t-panel t-deploy-rules`,children:[(0,V.jsxs)(`div`,{className:`t-command-conditions-head`,children:[(0,V.jsxs)(`span`,{children:[(0,V.jsx)(`span`,{className:`t-kicker`,children:`Tactical setup`}),(0,V.jsx)(`strong`,{children:`CONDITIONS & APPROACH`})]}),(0,V.jsxs)(`b`,{children:[m.toUpperCase(),p===`standard`?``:` · ${x[p].name}`]})]}),Ee.length?(0,V.jsxs)(`section`,{className:`t-conditions`,"aria-label":`Special conditions`,children:[Ee.map(e=>(0,V.jsxs)(`div`,{className:`t-condition t-condition-v29`,children:[(0,V.jsx)(`strong`,{children:e.maxRounds?`DEADLINE · ROUND ${e.maxRounds}`:e.reinforcement?`REINFORCEMENTS · ROUND ${De}`:e.supportCooldownExtra?`LIMITED SUPPORT · +1 TURN`:e.name}),(0,V.jsx)(`p`,{children:e.copy})]},e.type)),A?.squadHint?(0,V.jsxs)(`p`,{className:`t-deploy-tip`,children:[(0,V.jsx)(`strong`,{children:`Squad tip:`}),` `,A.squadHint]}):null]}):null,be?(0,V.jsxs)(`div`,{className:`t-deployment-options t-deployment-options-v29`,children:[_e?(0,V.jsx)(`p`,{className:`t-deploy-resume`,children:`Original conditions are locked for this saved run. Changing squad, route or tier starts a new attempt.`}):null,_?.board?.reportVersion===3?(0,V.jsxs)(V.Fragment,{children:[(0,V.jsx)(`div`,{className:`t-kicker`,children:`Directive tier`}),(0,V.jsx)(`div`,{className:`t-brief-actions`,children:[`standard`,`advanced`].map(e=>(0,V.jsxs)(`button`,{type:`button`,className:`t-btn ${m===e?`t-btn-primary`:``}`,"aria-pressed":m===e,disabled:ue||!_.commander?.unlockedDirectiveTiers?.includes(e),onClick:()=>h(e),children:[e.toUpperCase(),e===`advanced`&&!_.commander?.unlockedDirectiveTiers?.includes(e)?` / RANK 3`:``]},e))}),(0,V.jsx)(`small`,{children:m===`advanced`?`${te(ve.directiveSet)} · Advanced clear is recorded.`:`Standard field conditions.`})]}):null,(0,V.jsx)(`div`,{className:`t-kicker`,children:`Deployment approach`}),(0,V.jsx)(`div`,{className:`t-brief-actions`,children:[`standard`,`south`].map(e=>(0,V.jsxs)(`button`,{type:`button`,className:`t-btn ${p===e?`t-btn-primary`:``}`,"aria-pressed":p===e,disabled:ue||!_?.commander?.unlockedApproaches.includes(e),onClick:()=>g(e),children:[x[e].name,e===`south`&&!_?.commander?.unlockedApproaches.includes(`south`)?` / RANK 2`:``]},e))}),(0,V.jsx)(`small`,{children:x[p].copy})]}):null]}):null,A?(0,V.jsxs)(`details`,{className:`t-panel t-deploy-depth`,children:[(0,V.jsxs)(`summary`,{children:[(0,V.jsxs)(`span`,{children:[(0,V.jsx)(`span`,{className:`t-kicker`,children:`Optional depth`}),(0,V.jsx)(`strong`,{children:`MASTERY & LOADOUT`})]}),(0,V.jsx)(`b`,{children:`VIEW`})]}),(0,V.jsxs)(`details`,{className:`t-detail t-loadout-details`,children:[(0,V.jsx)(`summary`,{children:`Squad abilities & hostile intel`}),(0,V.jsxs)(`div`,{className:`t-brief-grid`,children:[(0,V.jsxs)(`div`,{className:`t-panel t-brief-block`,children:[(0,V.jsx)(`h3`,{children:`Allied squad`}),(0,V.jsx)(Ga,{}),Ne.map(e=>(0,V.jsxs)(`div`,{className:`t-unit-row`,children:[(0,V.jsx)(`img`,{src:e.portrait,onError:e.defId===`alpha`?Wa:void 0,alt:``,style:e.defId===`alpha`?void 0:{objectPosition:`50% 12%`}}),(0,V.jsxs)(`div`,{children:[(0,V.jsx)(`div`,{className:`t-title`,style:{fontSize:`0.95rem`},children:e.defId===`ally-02`?`COLDNCURSED`:e.name}),(0,V.jsx)(`div`,{style:{color:`var(--t-muted)`,fontSize:`0.8rem`},children:U(e)})]})]},e.defId))]}),(0,V.jsxs)(`div`,{className:`t-panel t-brief-block`,children:[(0,V.jsx)(`h3`,{children:`Hostile force`}),ze.map(({def:e,count:t})=>(0,V.jsxs)(`div`,{className:`t-unit-row`,children:[(0,V.jsx)(`div`,{className:`t-unit-ph enemy`}),(0,V.jsxs)(`div`,{children:[(0,V.jsx)(`div`,{className:`t-title`,style:{fontSize:`0.95rem`},children:t>1?`${e.name} × ${t}`:e.name}),(0,V.jsx)(`div`,{style:{color:`var(--t-muted)`,fontSize:`0.8rem`},children:U(e,`${e.hp} HP`)})]})]},e.defId)),(0,V.jsx)(`p`,{style:{color:`var(--t-faint)`,fontSize:`0.78rem`,margin:`0.8rem 0 0`,lineHeight:1.45},children:We})]})]})]})]}):null]}):null,(0,V.jsxs)(`div`,{className:`t-brief-actions t-deploy-actions t-deploy-actions-v29 t-command-action-dock`,children:[(0,V.jsx)(`button`,{type:`button`,className:`t-btn t-btn-ghost`,onClick:c,children:`BACK`}),(0,V.jsxs)(`button`,{type:`button`,className:`t-btn t-btn-primary`,onClick:s,disabled:ue||ae||E||!!A&&!ke(A,f,w),children:[`DEPLOY SQUAD`,(0,V.jsx)(He,{className:`t-ico`})]})]}),O?(0,V.jsx)(`p`,{style:{color:`var(--t-enemy)`,marginTop:`0.8rem`},children:O}):null]})]})}function _o(){let e=B(e=>e.dismissSector),t=B(e=>e.battle.objective?.type===`BOSS`),n=B(e=>j(e.selectedMissionId)?.activity===`FIELD_OP`);return(0,y.useEffect)(()=>{let t=0,n=performance.now(),r=i=>{i-n>=1600?e():t=requestAnimationFrame(r)};return t=requestAnimationFrame(r),()=>cancelAnimationFrame(t)},[e]),(0,V.jsxs)(`div`,{className:`t-fill`,children:[(0,V.jsx)(W,{dim:.5}),(0,V.jsx)(`div`,{className:`t-overlay`,style:{background:`rgb(10 12 16 / 0.45)`},children:(0,V.jsxs)(`div`,{className:`t-modal t-panel`,children:[(0,V.jsx)(`div`,{className:`t-kicker`,children:n?`FIELD OP`:`Operation`}),(0,V.jsx)(`h2`,{className:`t-title`,children:n?`Objective Complete`:`Sector Secured`}),(0,V.jsx)(`p`,{style:{color:`var(--t-muted)`,margin:`0 0 1.1rem`},children:n?`Mission objective achieved. Review Results to save this clear.`:t?`BRUTE LEADER defeated. Commander signal broken.`:`Hostile force eliminated.`}),(0,V.jsx)(`button`,{type:`button`,className:`t-btn t-btn-primary`,onClick:e,children:`Continue`})]})})]})}function vo(){let e=B(e=>e.battle.failureReason),t=B(e=>e.battle.results),n=B(e=>e.fieldResult),r=B(e=>e.campaignResult),i=B(e=>e.saveCampaignResult),a=B(e=>e.saveFieldResult),o=B(e=>e.replay),s=B(e=>e.backToHub),c=B(e=>e.continueOnboarding),l=B(e=>e.onboardingEnabled),u=B(e=>e.onboardingStageId),d=B(e=>e.selectedMissionId),f=B(e=>e.foundationCompleted),p=B(e=>e.progression),m=B(e=>e.progressionCommitPending),h=B(e=>e.progressionError),g=B(e=>e.battle.routingTraceAcquired),_=Pi(l,u),v=j(d),y=v?.activity===`FIELD_OP`,b=v?.operationId===we.operationId;if(!t)return null;let x=f&&!!v&&t.victory,ee=l&&!f&&t.victory||x,S=ee&&_.next!=null,C=x&&p?.operations?.[v?.operationId||Ce.operationId]?.missions[v?.missionId||``]===`available`;return(0,V.jsxs)(`div`,{className:`t-fill`,children:[(0,V.jsx)(W,{dim:.6}),(0,V.jsx)(`div`,{className:`t-overlay t-results-overlay`,children:(0,V.jsxs)(`div`,{className:`t-modal t-panel t-results ${t.victory?`is-victory`:`is-failure`}`,children:[(0,V.jsxs)(`header`,{className:`t-outcome-hero`,children:[(0,V.jsx)(`img`,{className:`t-results-plate`,src:t.victory?oo.resultsPlate:oo.operationPlate,alt:``,"aria-hidden":`true`}),(0,V.jsx)(`span`,{className:`t-outcome-stamp`,children:t.victory?`MISSION SECURED`:`MISSION LOST`}),(0,V.jsx)(`div`,{className:`t-kicker`,children:y?`FIELD OP / ${v.name}`:x&&v?v.name:ee?_.operationName:`Broken Signal`}),(0,V.jsx)(`h2`,{className:`t-title`,children:b?t.victory?v?.objectiveType===`BOSS`?`DEAD RELAY SECURED`:`OBJECTIVE SECURED`:`MISSION FAILED`:y?t.victory?`FIELD OP COMPLETE`:`FIELD OP FAILED`:x?v?.objectiveType===`BOSS`?`SIGNAL COMMANDER DOWN`:v?.objectiveType===`RECOVER`?`OBJECTIVE COMPLETE`:C?`BREACH CLEARED`:`BREACH REPLAY COMPLETE`:ee?_.resultsTitle:`Operation Complete`})]}),ee?(0,V.jsx)(`p`,{style:{color:`var(--t-muted)`,margin:`0 0 1.1rem`},children:y?null:x?v?.objectiveType===`RECOVER`?C?`Continue to unlock SIGNAL COMMANDER.`:`SIGNAL RECOVERED.`:v?.objectiveType===`ELIMINATE`&&C?`RECOVER AVAILABLE.`:null:_.resultsNote}):null,x&&v?.missionId===`broken-signal-breach`?(0,V.jsxs)(`p`,{style:{color:g||p?.intel?.routingTrace?`var(--t-accent)`:`var(--t-faint)`,margin:`0 0 0.8rem`},children:[`ROUTING TRACE — `,g||p?.intel?.routingTrace?`ACQUIRED`:`MISSED`]}):null,x&&!b&&v?.objectiveType===`BOSS`?(0,V.jsx)(`p`,{style:{color:`var(--t-accent)`,margin:`0 0 0.8rem`},children:C?v.resultsCopy:p?.operations?.[we.operationId]?`BROKEN SIGNAL CLEARED · THE DEAD RELAY CAMPAIGN AVAILABLE`:`BROKEN SIGNAL remains CLEARED · ARCHIVE AVAILABLE · NEXT OPERATION SLOT EMPTY / UNASSIGNED`}):null,y?(0,V.jsxs)(`div`,{children:[t.victory?null:(0,V.jsxs)(`p`,{children:[ne(e,v.objectiveType),` No clear or commander progress earned.`]}),n?(0,V.jsx)(mo,{result:n}):(0,V.jsx)(`p`,{role:`status`,children:m?`Recording result…`:`Result not recorded yet.`})]}):null,y?(0,V.jsxs)(`details`,{className:`t-detail`,children:[(0,V.jsx)(`summary`,{children:`Challenge objective`}),(0,V.jsx)(`p`,{children:v.challenge?.label})]}):null,b?(0,V.jsxs)(`div`,{className:`t-panel t-deploy-overview`,role:`status`,children:[(0,V.jsx)(`strong`,{children:r?`RECORDED IN CAMPAIGN HISTORY`:m?`RECORDING CAMPAIGN RESULT...`:`RESULT AWAITS SERVER RECORD`}),(0,V.jsx)(`p`,{children:v?.missionId===`dead-relay-courier`?p?.campaignIntel?.[`dead-relay`]?.courierTraceAcquired||r?.intelEarned?`COURIER TRACE ACTIVE · HOUND REINFORCEMENT DELAYED IN HOLD`:t.victory?`Courier stopped. Early Intel was not secured; Hold is still unlocked.`:`Courier escaped. Retry this mission to open the relay route.`:v?.missionId===`dead-relay-hold`?t.victory?`Relay controlled. Guardian now available.`:`Relay control lost. Retry to secure the location.`:t.victory?`The Dead Relay is secure. Your campaign completion is recorded.`:`Guardian resisted. Regroup and retry.`})]}):null,(0,V.jsx)(Ga,{}),(0,V.jsxs)(`dl`,{className:`t-stats`,children:[(0,V.jsxs)(`div`,{children:[(0,V.jsx)(`dt`,{children:`Turns`}),(0,V.jsx)(`dd`,{children:String(t.turns).padStart(2,`0`)})]}),(0,V.jsxs)(`div`,{children:[(0,V.jsx)(`dt`,{children:`Eliminated`}),(0,V.jsx)(`dd`,{children:t.hostilesEliminated})]}),(0,V.jsxs)(`div`,{children:[(0,V.jsx)(`dt`,{children:`Squad standing`}),(0,V.jsxs)(`dd`,{children:[t.squadStanding,` / `,t.squadDeployed]})]}),(0,V.jsxs)(`div`,{children:[(0,V.jsx)(`dt`,{children:`Damage taken`}),(0,V.jsx)(`dd`,{children:t.damageTaken})]})]}),p?.playerGrowth&&t.victory&&(y&&n||b&&r)?(0,V.jsxs)(`section`,{className:`t-growth-result`,"aria-label":`Server confirmed Skillbook progression`,children:[(0,V.jsx)(`span`,{className:`t-kicker`,children:`SERVER-CONFIRMED PROGRESSION`}),(0,V.jsxs)(`strong`,{children:[p.playerGrowth.earnedPoints-p.playerGrowth.spentPoints,` SKILL POINTS AVAILABLE`]}),(0,V.jsx)(`small`,{children:`First-time mission clears add one point. Spend available points on the War Table Skillbook before your next deployment.`})]}):null,(0,V.jsx)(`div`,{className:`t-brief-actions t-result-actions`,children:b?r?(0,V.jsxs)(V.Fragment,{children:[(0,V.jsx)(`button`,{type:`button`,className:`t-btn t-btn-primary`,onClick:()=>c(),children:`BACK TO CAMPAIGN`}),(0,V.jsx)(`button`,{type:`button`,className:`t-btn`,onClick:o,children:`REPLAY / SQUAD`})]}):(0,V.jsx)(`button`,{type:`button`,className:`t-btn t-btn-primary`,disabled:m,onClick:()=>void i(),children:m?`Recording...`:t.victory?`SAVE VICTORY`:`RECORD FAILURE / RETRY`}):y?(0,V.jsx)(V.Fragment,{children:n?(0,V.jsxs)(V.Fragment,{children:[(0,V.jsx)(`button`,{type:`button`,className:`t-btn t-btn-primary`,onClick:()=>c(),children:n.victory?`SEE NEXT FIELD OP`:`REGROUP AT WAR TABLE`}),(0,V.jsx)(`button`,{type:`button`,className:`t-btn`,onClick:o,children:`Replay / Squad`})]}):(0,V.jsx)(`button`,{type:`button`,className:`t-btn t-btn-primary`,disabled:m,onClick:()=>void a(),children:m?`Recording...`:`Retry saving result`})}):ee?(0,V.jsxs)(V.Fragment,{children:[(0,V.jsxs)(`button`,{type:`button`,className:`t-btn t-btn-primary`,onClick:()=>c(),disabled:m,children:[m?`Saving…`:y?`Save clear / Field Ops`:x||S?`Continue`:`Return to Tactical Ops`,x||S?(0,V.jsx)(He,{className:`t-ico`}):null]}),(0,V.jsx)(`button`,{type:`button`,className:`t-btn`,onClick:o,disabled:m,children:y?`Save clear / Replay`:x?`REPLAY`:`Replay this drill`})]}):(0,V.jsxs)(V.Fragment,{children:[(0,V.jsx)(`button`,{type:`button`,className:`t-btn t-btn-primary`,onClick:o,children:`Replay operation`}),(0,V.jsx)(`button`,{type:`button`,className:`t-btn`,onClick:s,children:`Return to Tactical Ops`})]})}),h?(0,V.jsx)(`p`,{style:{color:`var(--t-enemy)`,margin:`0.8rem 0 0`},children:h}):null]})})]})}function yo(){let e=B(e=>e.battle.failureReason),t=j(B(e=>e.selectedMissionId)),n=t?.activity===`FIELD_OP`,r=B(e=>e.replay),i=B(e=>e.backToHub);return(0,V.jsxs)(`div`,{className:`t-fill`,children:[(0,V.jsx)(W,{dim:.7}),(0,V.jsx)(`div`,{className:`t-overlay`,children:(0,V.jsxs)(`div`,{className:`t-modal t-panel`,children:[(0,V.jsx)(`div`,{className:`t-kicker`,style:{color:`var(--t-enemy)`},children:n?`FIELD OP / ${t.name}`:`Broken Signal`}),(0,V.jsx)(`h2`,{className:`t-title`,children:n?`FIELD OP FAILED`:`Operation Failed`}),(0,V.jsx)(`p`,{style:{color:`var(--t-muted)`,margin:`0 0 1.1rem`},children:n?ne(e,t.objectiveType):`All allied units are down.`}),(0,V.jsxs)(`div`,{className:`t-brief-actions`,style:{justifyContent:`center`},children:[(0,V.jsxs)(`button`,{type:`button`,className:`t-btn t-btn-primary`,onClick:r,children:[(0,V.jsx)(qe,{className:`t-ico`}),` Retry`]}),(0,V.jsx)(`button`,{type:`button`,className:`t-btn`,onClick:i,children:`Return`})]})]})})]})}function bo(){let[,e]=(0,y.useState)(0);(0,y.useEffect)(()=>Me()?.subscribe(()=>e(e=>e+1)),[]);let t=Me()?.view().result,n=B(e=>e.screen),r=B(e=>e.selectSkill),i=B(e=>e.skipTurn),a=B(e=>e.muted);return(0,y.useEffect)(()=>{pr()&&(B.setState({muted:!0}),fr(!0))},[]),(0,y.useEffect)(()=>{let e=e=>{let t=B.getState(),n=t.battle.units.find(e=>e.id===t.battle.activeId);e.key===`1`&&n&&r(n.skillIds[0]),e.key===`2`&&n&&r(n.skillIds[1]),e.key===`3`&&n&&r(n.skillIds[2]),(e.key===`s`||e.key===`S`)&&i()};window.addEventListener(`keydown`,e);let t=()=>ur();return window.addEventListener(`pointerdown`,t,{once:!0}),()=>{window.removeEventListener(`keydown`,e),window.removeEventListener(`pointerdown`,t)}},[r,i]),(0,y.useEffect)(()=>{fr(a)},[a]),(0,V.jsx)(`div`,{className:`t-shell`,"data-screen":t?.confirmed?`results`:n,children:t?.confirmed?(0,V.jsx)(po,{receipt:t}):(0,V.jsxs)(V.Fragment,{children:[n===`hub`?(0,V.jsx)(fo,{}):null,n===`war-table`?(0,V.jsx)(ho,{}):null,n===`brief`?(0,V.jsx)(go,{}):null,n===`battle`?(0,V.jsx)(Ua,{}):null,n===`sector`?(0,V.jsx)(_o,{}):null,n===`results`?(0,V.jsx)(vo,{}):null,n===`defeat`?(0,V.jsx)(yo,{}):null]})})}var xo=`/* Alpha Husky Tactical Ops — viewport-first playability (V1)\r
   Combat layout only. No orientation gate. */\r
\r
#tacticalOpsRoot {\r
  --t-font-display: "Rajdhani", "Trebuchet MS", sans-serif;\r
  --t-font-sans: "Source Sans 3", "Segoe UI", system-ui, sans-serif;\r
  --t-bg: #07090d;\r
  --t-surface: #0c1016;\r
  --t-elevated: #121820;\r
  --t-fg: #e7edf3;\r
  --t-muted: #7f8a97;\r
  --t-faint: #55606c;\r
  --t-line: #232a33;\r
  --t-ally: #3ec6ff;\r
  --t-ally-dim: #102e3d;\r
  --t-enemy: #e23d3d;\r
  --t-enemy-dim: #3d1212;\r
  --t-heal: #6fbf8a;\r
  --t-radius-sm: 6px;\r
  --t-radius-md: 10px;\r
  --t-radius-lg: 14px;\r
  --tops-header: 40px;\r
  --tops-order: 0px;\r
  --tops-status: 0px;\r
  --tops-dock: 56px;\r
  z-index: 1500;\r
  width: 100%;\r
  width: 100vw;\r
  height: 100%;\r
  height: 100dvh;\r
  height: 100svh;\r
  max-height: 100svh;\r
  color: var(--t-fg);\r
  font-family: var(--t-font-sans);\r
  background: var(--t-bg);\r
  -webkit-tap-highlight-color: transparent;\r
  overscroll-behavior: none;\r
  touch-action: manipulation;\r
  position: fixed;\r
  inset: 0;\r
  overflow: hidden;\r
  container-type: size;\r
  container-name: tops;\r
}\r
\r
#tacticalOpsRoot[data-open="0"] {\r
  visibility: hidden;\r
  pointer-events: none;\r
}\r
\r
#tacticalOpsRoot[data-open="1"] {\r
  visibility: visible;\r
  pointer-events: auto;\r
}\r
\r
#tacticalOpsRoot,\r
#tacticalOpsRoot * {\r
  box-sizing: border-box;\r
}\r
\r
#tacticalOpsRoot button:not(:disabled),\r
#tacticalOpsRoot [role="button"]:not(:disabled) {\r
  cursor: pointer;\r
}\r
\r
#tacticalOpsRoot .t-ico {\r
  flex-shrink: 0;\r
  width: 16px;\r
  height: 16px;\r
}\r
\r
/* Rotate gate permanently disabled — portrait is a first-class layout. */\r
#tacticalOpsRoot .t-rotate-gate,\r
#tacticalOpsRoot .t-hint {\r
  display: none !important;\r
}\r
\r
#tacticalOpsRoot .t-shell {\r
  height: 100%;\r
  width: 100%;\r
  min-height: 0;\r
  background: var(--t-bg);\r
  color: var(--t-fg);\r
  font-family: var(--t-font-sans);\r
  -webkit-user-select: none;\r
  user-select: none;\r
  touch-action: manipulation;\r
  position: relative;\r
  overflow: hidden;\r
  display: flex;\r
  flex-direction: column;\r
}\r
\r
#tacticalOpsRoot .t-fill {\r
  position: absolute;\r
  inset: 0;\r
}\r
\r
#tacticalOpsRoot .t-bg {\r
  background:\r
    radial-gradient(120% 80% at 20% 40%, #143c5047, transparent 55%),\r
    radial-gradient(100% 80% at 85% 45%, #50101052, transparent 50%),\r
    var(--t-bg);\r
  position: absolute;\r
  inset: 0;\r
}\r
\r
#tacticalOpsRoot .t-bg img {\r
  object-fit: cover;\r
  opacity: 0.42;\r
  filter: saturate(0.72) brightness(0.55) contrast(1.12);\r
  width: 100%;\r
  height: 100%;\r
}\r
\r
#tacticalOpsRoot .t-bg-hero img {\r
  object-position: 50% 36%;\r
  opacity: 0.58;\r
  filter: saturate(0.82) brightness(0.62) contrast(1.08);\r
}\r
\r
#tacticalOpsRoot .t-vignette {\r
  pointer-events: none;\r
  background:\r
    linear-gradient(#07090de0 0%, transparent 16%, transparent 80%, #07090df2 100%),\r
    radial-gradient(transparent 40%, #07090dcc 100%);\r
  position: absolute;\r
  inset: 0;\r
  z-index: 2;\r
}\r
\r
#tacticalOpsRoot .t-panel {\r
  background: #080c11e6;\r
  border: 1px solid #e8edf21f;\r
  box-shadow: 0 12px 40px #00000073;\r
}\r
\r
#tacticalOpsRoot .t-kicker {\r
  font-family: var(--t-font-display);\r
  letter-spacing: 0.28em;\r
  text-transform: uppercase;\r
  color: var(--t-ally);\r
  font-size: 0.68rem;\r
  font-weight: 600;\r
}\r
\r
#tacticalOpsRoot .t-title {\r
  font-family: var(--t-font-display);\r
  letter-spacing: 0.08em;\r
  text-transform: uppercase;\r
  font-weight: 700;\r
  line-height: 0.95;\r
}\r
\r
#tacticalOpsRoot .t-btn {\r
  min-height: 48px;\r
  font-family: var(--t-font-display);\r
  letter-spacing: 0.16em;\r
  text-transform: uppercase;\r
  color: var(--t-fg);\r
  border-radius: var(--t-radius-sm);\r
  background: #171d24eb;\r
  border: 1px solid #e8edf229;\r
  justify-content: center;\r
  align-items: center;\r
  gap: 0.5rem;\r
  padding: 0 1.25rem;\r
  font-size: 0.92rem;\r
  font-weight: 700;\r
  transition: transform 0.15s cubic-bezier(0.22, 1, 0.36, 1), background 0.15s, border-color 0.15s;\r
  display: inline-flex;\r
  touch-action: manipulation;\r
  user-select: none;\r
}\r
\r
#tacticalOpsRoot .t-btn:hover:not(:disabled) {\r
  background: #1e2a34f2;\r
  border-color: #3ec6ff8c;\r
}\r
\r
#tacticalOpsRoot .t-btn:active:not(:disabled) {\r
  transform: scale(0.98);\r
}\r
\r
#tacticalOpsRoot .t-btn:disabled {\r
  opacity: 0.38;\r
}\r
\r
#tacticalOpsRoot .t-btn-primary {\r
  color: var(--t-ally);\r
  background: #3ec6ff24;\r
  border-color: #3ec6ff8c;\r
}\r
\r
#tacticalOpsRoot .t-btn-primary:hover:not(:disabled) {\r
  background: #3ec6ff38;\r
}\r
\r
#tacticalOpsRoot .t-btn-ghost {\r
  background: transparent;\r
}\r
\r
/* Hub / brief / results */\r
#tacticalOpsRoot .t-hub {\r
  height: 100%;\r
  padding: max(1.25rem, env(safe-area-inset-top)) max(1.25rem, env(safe-area-inset-right))\r
    max(1.5rem, env(safe-area-inset-bottom)) max(1.25rem, env(safe-area-inset-left));\r
  flex-direction: column;\r
  justify-content: flex-end;\r
  display: flex;\r
  position: relative;\r
  z-index: 2;\r
  pointer-events: auto;\r
}\r
\r
#tacticalOpsRoot .t-hub-copy {\r
  z-index: 2;\r
  max-width: 36rem;\r
  position: relative;\r
}\r
\r
#tacticalOpsRoot .t-hub h1 {\r
  margin: 0.2rem 0 0;\r
  font-size: max(2.2rem, min(8vw, 4.6rem));\r
}\r
\r
#tacticalOpsRoot .t-operation-plate {\r
  width: min(100%, 42rem);\r
  height: clamp(4.75rem, 14vw, 8rem);\r
  margin: 0.8rem 0 0;\r
  overflow: hidden;\r
  border: 1px solid #3ec6ff33;\r
  background: #080c11;\r
  pointer-events: none;\r
}\r
\r
#tacticalOpsRoot .t-operation-plate img {\r
  display: block;\r
  width: 100%;\r
  height: 100%;\r
  object-fit: cover;\r
  object-position: center;\r
  opacity: 0.82;\r
  filter: saturate(0.8) brightness(0.82);\r
}\r
\r
#tacticalOpsRoot .t-results-plate {\r
  position: absolute;\r
  inset: 0 auto 0 0;\r
  z-index: 0;\r
  width: 38%;\r
  height: 100%;\r
  object-fit: cover;\r
  object-position: center;\r
  opacity: 0.18;\r
  filter: saturate(0.72) brightness(0.78);\r
  pointer-events: none;\r
}\r
\r
#tacticalOpsRoot .t-hub h2 {\r
  color: var(--t-muted);\r
  font-size: max(1rem, min(3vw, 1.6rem));\r
  font-family: var(--t-font-display);\r
  letter-spacing: 0.32em;\r
  margin: 0.15rem 0 1.25rem;\r
  font-weight: 600;\r
}\r
\r
#tacticalOpsRoot .t-op-card {\r
  border-radius: var(--t-radius-md);\r
  flex-direction: column;\r
  gap: 0.35rem;\r
  max-width: 28rem;\r
  margin-bottom: 1.15rem;\r
  padding: 1rem 1.15rem;\r
  display: flex;\r
}\r
\r
#tacticalOpsRoot .t-op-card strong {\r
  font-family: var(--t-font-display);\r
  letter-spacing: 0.18em;\r
  font-size: 1.05rem;\r
}\r
\r
#tacticalOpsRoot .t-op-card p {\r
  color: var(--t-muted);\r
  margin: 0;\r
  font-size: 0.92rem;\r
  line-height: 1.45;\r
}\r
\r
#tacticalOpsRoot .t-brief {\r
  z-index: 2;\r
  height: 100%;\r
  padding: max(1rem, env(safe-area-inset-top)) max(1rem, env(safe-area-inset-right))\r
    max(1.1rem, env(safe-area-inset-bottom)) max(1rem, env(safe-area-inset-left));\r
  flex-direction: column;\r
  display: flex;\r
  position: relative;\r
  overflow: auto;\r
  pointer-events: auto;\r
}\r
\r
#tacticalOpsRoot .t-brief-grid {\r
  grid-template-columns: 1fr;\r
  gap: 0.75rem;\r
  margin: 1rem 0 auto;\r
  display: grid;\r
}\r
\r
@media (min-width: 800px) {\r
  #tacticalOpsRoot .t-brief-grid {\r
    grid-template-columns: 1.1fr 0.9fr;\r
  }\r
}\r
\r
#tacticalOpsRoot .t-brief-block {\r
  border-radius: var(--t-radius-md);\r
  padding: 0.95rem 1rem;\r
}\r
\r
#tacticalOpsRoot .t-brief-block h3 {\r
  font-family: var(--t-font-display);\r
  letter-spacing: 0.2em;\r
  color: var(--t-muted);\r
  margin: 0 0 0.55rem;\r
  font-size: 0.78rem;\r
}\r
\r
#tacticalOpsRoot .t-unit-row {\r
  border-bottom: 1px solid #e8edf20f;\r
  align-items: center;\r
  gap: 0.7rem;\r
  padding: 0.45rem 0;\r
  display: flex;\r
}\r
\r
#tacticalOpsRoot .t-unit-row:last-child {\r
  border-bottom: 0;\r
}\r
\r
#tacticalOpsRoot .t-unit-row img,\r
#tacticalOpsRoot .t-unit-ph {\r
  object-fit: cover;\r
  object-position: 50% 40%;\r
  background: var(--t-elevated);\r
  border: 1px solid #3ec6ff40;\r
  border-radius: 4px;\r
  width: 42px;\r
  height: 42px;\r
  flex-shrink: 0;\r
}\r
\r
#tacticalOpsRoot .t-unit-ph.enemy {\r
  border-color: #e23d3d66;\r
}\r
\r
#tacticalOpsRoot .t-brief-actions {\r
  flex-wrap: wrap;\r
  gap: 0.7rem;\r
  display: flex;\r
}\r
\r
#tacticalOpsRoot .t-mission-strip {\r
  display: flex;\r
  flex-wrap: wrap;\r
  gap: 0.35rem;\r
  margin: 0.75rem 0 0;\r
}\r
\r
#tacticalOpsRoot .t-mission-strip span,\r
#tacticalOpsRoot .t-recruit-moment {\r
  border: 1px solid #3ec6ff55;\r
  background: #0c2534c9;\r
  color: #bcefff;\r
  border-radius: 4px;\r
  padding: 0.28rem 0.4rem;\r
  font-family: var(--t-font-display);\r
  font-size: 0.62rem;\r
  letter-spacing: 0.08em;\r
}\r
\r
#tacticalOpsRoot .t-recruit-moment {\r
  display: inline-block;\r
  margin-top: 0.8rem;\r
  color: #d9ffe9;\r
  border-color: #72e6a477;\r
  background: #153829c9;\r
}\r
\r
#tacticalOpsRoot .t-field-rewards span {\r
  color: #ace6bd;\r
  border-color: #83d6a466;\r
  background: #102b22;\r
}\r
\r
#tacticalOpsRoot .t-brief-actions .t-btn small {\r
  display: block;\r
  margin-top: 0.18rem;\r
  color: var(--t-muted);\r
  font-size: 0.56rem;\r
  letter-spacing: 0.07em;\r
}\r
\r
#tacticalOpsRoot .t-overlay {\r
  z-index: 50;\r
  background: #0a0c109e;\r
  justify-content: center;\r
  align-items: center;\r
  padding: 1rem;\r
  display: flex;\r
  position: absolute;\r
  inset: 0;\r
  pointer-events: auto;\r
}\r
\r
#tacticalOpsRoot .t-modal {\r
  border-radius: var(--t-radius-lg);\r
  text-align: center;\r
  width: min(420px, 100%);\r
  padding: 1.4rem 1.3rem 1.2rem;\r
  position: relative;\r
  overflow: hidden;\r
  isolation: isolate;\r
}\r
\r
#tacticalOpsRoot .t-modal > :not(.t-results-plate) {\r
  position: relative;\r
  z-index: 1;\r
}\r
\r
#tacticalOpsRoot .t-modal h2 {\r
  margin: 0.2rem 0 0.7rem;\r
  font-size: max(1.6rem, min(4vw, 2.2rem));\r
}\r
\r
#tacticalOpsRoot .t-stats {\r
  text-align: left;\r
  grid-template-columns: 1fr 1fr;\r
  gap: 0.55rem 1rem;\r
  margin: 1rem 0 1.2rem;\r
  display: grid;\r
}\r
\r
#tacticalOpsRoot .t-stats dt {\r
  font-family: var(--t-font-display);\r
  letter-spacing: 0.12em;\r
  color: var(--t-muted);\r
  text-transform: uppercase;\r
  font-size: 0.68rem;\r
}\r
\r
#tacticalOpsRoot .t-stats dd {\r
  font-family: var(--t-font-display);\r
  font-variant-numeric: tabular-nums;\r
  margin: 0.1rem 0 0;\r
  font-size: 1.25rem;\r
  font-weight: 700;\r
  white-space: nowrap;\r
}\r
\r
/* Compact / standard: stacked HUD, battlefield is the 1fr region.\r
   Wide: overlay HUD on a full-bleed field.\r
   Field row uses minmax(160px, 1fr) so absolute .t-field children cannot collapse the row to 0. */\r
\r
#tacticalOpsRoot .t-battle {\r
  display: grid;\r
  grid-template-columns: minmax(0, 1fr);\r
  grid-template-rows: auto minmax(160px, 1fr) auto;\r
  grid-template-areas:\r
    "top"\r
    "field"\r
    "dock";\r
  height: 100%;\r
  width: 100%;\r
  min-height: 0;\r
  flex: 1 1 auto;\r
  position: relative;\r
  overflow: hidden;\r
}\r
\r
#tacticalOpsRoot .t-top {\r
  grid-area: top;\r
  z-index: 36;\r
  min-height: 38px;\r
  max-height: 48px;\r
  padding: max(0.1rem, env(safe-area-inset-top)) max(0.5rem, env(safe-area-inset-right)) 0.1rem\r
    max(0.5rem, env(safe-area-inset-left));\r
  pointer-events: none;\r
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);\r
  align-items: center;\r
  gap: 0.3rem;\r
  display: grid;\r
  position: relative;\r
  background: linear-gradient(#07090de6 0%, #07090d66 100%);\r
  border-bottom: 1px solid #3ec6ff26;\r
}\r
\r
#tacticalOpsRoot .t-top > * {\r
  pointer-events: auto;\r
}\r
\r
#tacticalOpsRoot .t-brand {\r
  align-items: flex-start;\r
  gap: 0;\r
  min-width: 0;\r
  display: flex;\r
}\r
\r
#tacticalOpsRoot .t-brand img {\r
  display: none;\r
}\r
\r
#tacticalOpsRoot .t-brand h1 {\r
  letter-spacing: 0.14em;\r
  margin: 0;\r
  font-size: 0.7rem;\r
  white-space: nowrap;\r
  overflow: hidden;\r
  text-overflow: ellipsis;\r
  font-weight: 700;\r
}\r
\r
#tacticalOpsRoot .t-brand-sep {\r
  color: var(--t-faint);\r
  letter-spacing: 0.08em;\r
  font-weight: 600;\r
}\r
\r
#tacticalOpsRoot .t-brand p {\r
  display: none;\r
}\r
\r
#tacticalOpsRoot .t-turn {\r
  text-align: center;\r
}\r
\r
#tacticalOpsRoot .t-turn strong {\r
  font-family: var(--t-font-display);\r
  letter-spacing: 0.2em;\r
  font-size: 0.7rem;\r
  display: inline;\r
  line-height: 1;\r
}\r
\r
#tacticalOpsRoot .t-turn-sub {\r
  display: none;\r
}\r
\r
#tacticalOpsRoot .t-obj {\r
  text-align: right;\r
  font-family: var(--t-font-display);\r
  letter-spacing: 0.12em;\r
  color: var(--t-ally);\r
  justify-self: end;\r
  font-size: 0.58rem;\r
  min-width: 0;\r
  white-space: nowrap;\r
  overflow: hidden;\r
  text-overflow: ellipsis;\r
}\r
\r
#tacticalOpsRoot .t-obj small {\r
  display: none;\r
}\r
\r
#tacticalOpsRoot .t-order-wrap {\r
  grid-area: field;\r
  position: absolute;\r
  z-index: 33;\r
  top: 0.42rem;\r
  left: 50%;\r
  transform: translateX(-50%);\r
  display: flex;\r
  justify-content: center;\r
  padding: 0;\r
  pointer-events: none;\r
  max-width: min(28vw, 140px);\r
  align-self: start;\r
  height: max-content;\r
}\r
\r
#tacticalOpsRoot .t-order {\r
  display: flex;\r
  gap: 0.28rem;\r
  justify-content: center;\r
  align-items: center;\r
  overflow-x: auto;\r
  overflow-y: hidden;\r
  max-width: 100%;\r
  scrollbar-width: none;\r
}\r
\r
#tacticalOpsRoot .t-order::-webkit-scrollbar {\r
  display: none;\r
}\r
\r
#tacticalOpsRoot .t-order-unit {\r
  width: 22px;\r
  height: 22px;\r
  border-radius: 4px;\r
  border: 1px solid #e8edf22e;\r
  overflow: hidden;\r
  position: relative;\r
  opacity: 0.55;\r
  flex-shrink: 0;\r
  background: var(--t-elevated);\r
  box-shadow: 0 2px 8px #0008;\r
}\r
\r
#tacticalOpsRoot .t-order-unit img {\r
  width: 100%;\r
  height: 100%;\r
  object-fit: cover;\r
  object-position: 50% 18%;\r
  display: block;\r
}\r
\r
#tacticalOpsRoot .t-order-unit.active {\r
  opacity: 1;\r
  border-color: var(--t-ally);\r
  box-shadow: 0 0 0 1px #3ec6ff99, 0 0 10px #3ec6ff55;\r
  transform: scale(1.12);\r
}\r
\r
#tacticalOpsRoot .t-order-unit.enemy {\r
  border-color: #e23d3d66;\r
}\r
\r
#tacticalOpsRoot .t-order-unit.enemy.active {\r
  border-color: var(--t-enemy);\r
  box-shadow: 0 0 0 1px #e23d3d99, 0 0 10px #e23d3d55;\r
}\r
\r
#tacticalOpsRoot .t-top,\r
#tacticalOpsRoot .t-order-wrap,\r
#tacticalOpsRoot .t-status,\r
#tacticalOpsRoot .t-dock {\r
  flex: 0 0 auto;\r
}\r
\r
#tacticalOpsRoot .t-field-wrap {\r
  grid-area: field;\r
  min-height: var(--tops-field-h, 160px);\r
  min-width: 0;\r
  position: relative;\r
  overflow: hidden;\r
  align-self: stretch;\r
  justify-self: stretch;\r
  width: 100%;\r
  height: var(--tops-field-h, auto);\r
  flex: 1 1 auto;\r
}\r
\r
#tacticalOpsRoot .t-field {\r
  position: absolute;\r
  inset: 0;\r
  width: 100%;\r
  height: 100%;\r
  overflow: hidden;\r
}\r
\r
#tacticalOpsRoot .t-field-art {\r
  object-fit: cover;\r
  object-position: 50% 46%;\r
  filter: saturate(0.9) brightness(0.8) contrast(1.08);\r
  width: 100%;\r
  height: 100%;\r
  min-width: 100%;\r
  min-height: 100%;\r
  display: block;\r
  position: absolute;\r
  inset: 0;\r
  pointer-events: none;\r
}\r
\r
#tacticalOpsRoot .t-field-grade {\r
  pointer-events: none;\r
  position: absolute;\r
  inset: 0;\r
  background:\r
    linear-gradient(180deg, #07090d55 0%, transparent 14%, transparent 78%, #07090de6 100%),\r
    radial-gradient(70% 55% at 22% 48%, #123a4e40 0%, transparent 58%),\r
    radial-gradient(60% 50% at 78% 42%, #4a141440 0%, transparent 55%);\r
  z-index: 1;\r
}\r
\r
#tacticalOpsRoot .t-field .t-vignette {\r
  z-index: 3;\r
}\r
\r
#tacticalOpsRoot .t-grid {\r
  pointer-events: none;\r
  position: absolute;\r
  inset: 0;\r
  z-index: 4;\r
}\r
\r
#tacticalOpsRoot .t-grid i {\r
  position: absolute;\r
  width: 9px;\r
  height: 9px;\r
  transform: translate(-50%, -50%) rotate(45deg);\r
  border: 1px solid #3ec6ff40;\r
  background: #3ec6ff14;\r
}\r
\r
#tacticalOpsRoot .t-cell {\r
  z-index: 8;\r
  background: transparent;\r
  border: 0;\r
  border-radius: 999px;\r
  width: 44px;\r
  min-width: 44px;\r
  height: 44px;\r
  min-height: 44px;\r
  padding: 0;\r
  position: absolute;\r
  transform: translate(-50%, -50%);\r
  touch-action: manipulation;\r
}\r
\r
#tacticalOpsRoot .t-cell.move:after {\r
  content: "";\r
  background: radial-gradient(circle, #3ec6ffa8 0%, #3ec6ff1f 68%, transparent 72%);\r
  border: 1px solid #3ec6ffb3;\r
  border-radius: 999px;\r
  width: 16px;\r
  height: 16px;\r
  position: absolute;\r
  top: 50%;\r
  left: 50%;\r
  transform: translate(-50%, -50%);\r
  box-shadow: 0 0 12px #3ec6ff59;\r
}\r
\r
#tacticalOpsRoot .t-cell.move:hover:after,\r
#tacticalOpsRoot .t-cell.move:focus-visible:after {\r
  width: 20px;\r
  height: 20px;\r
}\r
\r
#tacticalOpsRoot .t-terminal {\r
  z-index: 7;\r
  position: absolute;\r
  transform: translate(-50%, -90%);\r
  display: grid;\r
  place-items: center;\r
  width: 58px;\r
  height: 58px;\r
  border: 2px solid #3ec6ff;\r
  border-radius: 12px;\r
  background: linear-gradient(145deg, #173a49ee, #081016ee);\r
  box-shadow: 0 0 0 5px #3ec6ff20, 0 0 22px #3ec6ff99;\r
  color: #d7f7ff;\r
  pointer-events: none;\r
  animation: t-objective-pulse 1.8s ease-in-out infinite;\r
}\r
\r
#tacticalOpsRoot .t-objective-marker-art {\r
  position: absolute;\r
  left: 50%;\r
  bottom: 40%;\r
  width: 72px;\r
  max-width: none;\r
  height: auto;\r
  transform: translateX(-50%);\r
  pointer-events: none;\r
}\r
\r
#tacticalOpsRoot .t-terminal span {\r
  font-family: var(--t-font-display);\r
  font-size: 0.62rem;\r
  letter-spacing: 0.12em;\r
}\r
\r
#tacticalOpsRoot .t-terminal small {\r
  color: #78e6ff;\r
  font-size: 0.48rem;\r
  letter-spacing: 0.11em;\r
}\r
\r
#tacticalOpsRoot .t-terminal.complete {\r
  border-color: #72e6a4;\r
  box-shadow: 0 0 0 5px #72e6a420, 0 0 22px #72e6a499;\r
}\r
\r
#tacticalOpsRoot .t-reinforcement-marker {\r
  z-index: 7;\r
  pointer-events: none;\r
  position: absolute;\r
  transform: translate(-50%, -50%);\r
  display: grid;\r
  place-items: center;\r
  width: 52px;\r
  height: 52px;\r
  border: 2px dashed #ff6666;\r
  border-radius: 999px;\r
  color: #ffd4d4;\r
  background: #3a10107a;\r
  box-shadow: 0 0 18px #e23d3d8a;\r
  animation: t-objective-pulse 1.1s ease-in-out infinite;\r
}\r
\r
#tacticalOpsRoot .t-reinforcement-marker span,\r
#tacticalOpsRoot .t-reinforcement-marker small {\r
  font-family: var(--t-font-display);\r
  letter-spacing: 0.1em;\r
  font-size: 0.52rem;\r
}\r
\r
#tacticalOpsRoot .t-reinforcement-marker small { color: #ffaaaa; font-size: 0.43rem; }\r
\r
#tacticalOpsRoot .t-reinforcement-marker .t-objective-marker-art {\r
  width: 66px;\r
  bottom: 36%;\r
}\r
\r
#tacticalOpsRoot .t-objective-badge {\r
  z-index: 12;\r
  position: absolute;\r
  top: -8%;\r
  left: 50%;\r
  transform: translateX(-50%);\r
  padding: 0.2rem 0.3rem;\r
  border-radius: 3px;\r
  font-family: var(--t-font-display);\r
  font-size: 0.48rem;\r
  letter-spacing: 0.1em;\r
  white-space: nowrap;\r
  pointer-events: none;\r
}\r
\r
#tacticalOpsRoot .t-objective-badge.trace { color: #d6f9ff; background: #0b607ac9; border: 1px solid #61ddff; }\r
#tacticalOpsRoot .t-objective-badge.boss { color: #ffe1e1; background: #741d1dcc; border: 1px solid #ff7373; }\r
#tacticalOpsRoot .t-token.trace-carrier .t-ring { filter: drop-shadow(0 0 12px #61ddff) !important; }\r
#tacticalOpsRoot .t-token.boss-target .t-ring { filter: drop-shadow(0 0 14px #ff5959) !important; }\r
\r
#tacticalOpsRoot .t-token-marker {\r
  position: absolute;\r
  z-index: 11;\r
  left: 50%;\r
  bottom: 61%;\r
  width: 58%;\r
  max-width: 72px;\r
  min-width: 34px;\r
  height: auto;\r
  transform: translateX(-50%);\r
  pointer-events: none;\r
}\r
\r
#tacticalOpsRoot .t-token-marker.trace { filter: drop-shadow(0 0 7px #61ddffaa); }\r
#tacticalOpsRoot .t-token-marker.boss { filter: drop-shadow(0 0 7px #ff5959aa); }\r
\r
@keyframes t-objective-pulse { 50% { filter: brightness(1.25); box-shadow: 0 0 0 7px #3ec6ff24, 0 0 28px #3ec6ffcc; } }\r
\r
#tacticalOpsRoot .t-token {\r
  z-index: 5;\r
  pointer-events: none;\r
  width: 13.6%;\r
  min-width: 48px;\r
  max-width: 132px;\r
  transition: left 0.28s cubic-bezier(0.22, 1, 0.36, 1), top 0.28s cubic-bezier(0.22, 1, 0.36, 1),\r
    opacity 0.28s, filter 0.2s;\r
  position: absolute;\r
  transform: translate(-50%, -88%);\r
}\r
\r
#tacticalOpsRoot .t-token.alpha {\r
  width: 15.2%;\r
  min-width: 54px;\r
  max-width: 148px;\r
}\r
\r
#tacticalOpsRoot .t-token.leader {\r
  width: 16.5%;\r
  min-width: 58px;\r
  max-width: 160px;\r
}\r
\r
#tacticalOpsRoot .t-token.hound {\r
  width: 14.5%;\r
  min-width: 52px;\r
  max-width: 140px;\r
}\r
\r
#tacticalOpsRoot .t-token.defeated {\r
  opacity: 0;\r
  pointer-events: none;\r
  filter: grayscale() brightness(0.4);\r
}\r
\r
#tacticalOpsRoot .t-token.acted:not(.selected) {\r
  filter: saturate(0.7) brightness(0.82);\r
}\r
\r
#tacticalOpsRoot .t-token.subdued {\r
  opacity: 0.55;\r
  filter: saturate(0.55);\r
}\r
\r
#tacticalOpsRoot .t-token.targetable:not(.defeated) .t-ring {\r
  filter: drop-shadow(0 0 8px #e23d3dd9);\r
}\r
\r
#tacticalOpsRoot .t-token.targetable.ally:not(.defeated) .t-ring {\r
  filter: drop-shadow(0 0 8px #3ec6ffd9);\r
}\r
\r
#tacticalOpsRoot .t-token.attacking img.body {\r
  animation: 0.38s cubic-bezier(0.22, 1, 0.36, 1) t-lunge;\r
}\r
\r
#tacticalOpsRoot .t-token.enemy.attacking img.body {\r
  animation: 0.38s cubic-bezier(0.22, 1, 0.36, 1) t-lunge-left;\r
}\r
\r
#tacticalOpsRoot .t-ring {\r
  pointer-events: none;\r
  width: 108%;\r
  position: absolute;\r
  bottom: 1%;\r
  left: 50%;\r
  transform: translate(-50%);\r
  filter: drop-shadow(0 0 8px currentColor);\r
}\r
\r
#tacticalOpsRoot .t-token.ally .t-ring {\r
  color: var(--t-ally);\r
}\r
\r
#tacticalOpsRoot .t-token.enemy .t-ring {\r
  color: var(--t-enemy);\r
}\r
\r
#tacticalOpsRoot .t-token.active .t-ring {\r
  filter: drop-shadow(0 0 12px #3ec6ffe6);\r
}\r
\r
#tacticalOpsRoot .t-token.enemy.active .t-ring {\r
  filter: drop-shadow(0 0 12px #e23d3de6);\r
}\r
\r
#tacticalOpsRoot .t-hit {\r
  pointer-events: auto;\r
  z-index: 2;\r
  background: transparent;\r
  border: 0;\r
  width: 44px;\r
  height: 56px;\r
  min-width: 44px;\r
  min-height: 44px;\r
  padding: 0;\r
  position: absolute;\r
  bottom: 6%;\r
  left: 50%;\r
  transform: translate(-50%);\r
  touch-action: manipulation;\r
}\r
\r
#tacticalOpsRoot .t-token img.body {\r
  pointer-events: none;\r
  filter: drop-shadow(0 10px 12px #0000008c);\r
  width: 100%;\r
  height: auto;\r
  display: block;\r
}\r
\r
#tacticalOpsRoot .t-plate {\r
  pointer-events: none;\r
  background: #07090df2;\r
  border: 1px solid #e8edf21f;\r
  border-radius: 4px;\r
  min-width: 64px;\r
  max-width: 104px;\r
  padding: 0.1rem 0.3rem 0.14rem;\r
  position: absolute;\r
  top: -30px;\r
  left: 50%;\r
  transform: translate(-50%);\r
  box-shadow: 0 6px 16px #00000073;\r
}\r
\r
#tacticalOpsRoot .t-token.enemy .t-plate {\r
  border-color: #e23d3d73;\r
}\r
\r
#tacticalOpsRoot .t-token.ally .t-plate {\r
  border-color: #3ec6ff61;\r
}\r
\r
#tacticalOpsRoot .t-token.inspect:not(.active) .t-plate {\r
  border-color: #e8edf273;\r
}\r
\r
#tacticalOpsRoot .t-plate-name {\r
  font-family: var(--t-font-display);\r
  letter-spacing: 0.1em;\r
  white-space: nowrap;\r
  justify-content: space-between;\r
  align-items: center;\r
  gap: 0.35rem;\r
  font-size: 0.64rem;\r
  font-weight: 700;\r
  display: flex;\r
}\r
\r
#tacticalOpsRoot .t-hp {\r
  align-items: center;\r
  gap: 0.3rem;\r
  margin-top: 0.12rem;\r
  display: flex;\r
}\r
\r
#tacticalOpsRoot .t-hp-bar {\r
  background: #e8edf21f;\r
  border-radius: 99px;\r
  flex: 1;\r
  height: 4px;\r
  overflow: hidden;\r
}\r
\r
#tacticalOpsRoot .t-hp-bar > i {\r
  background: var(--t-ally);\r
  width: 0;\r
  height: 100%;\r
  transition: width 0.28s cubic-bezier(0.22, 1, 0.36, 1);\r
  display: block;\r
}\r
\r
#tacticalOpsRoot .t-token.ally .t-hp-bar > i {\r
  background: linear-gradient(90deg, #2aa8e0, #7ae0ff);\r
}\r
\r
#tacticalOpsRoot .t-token.enemy .t-hp-bar > i {\r
  background: linear-gradient(90deg, #c62828, #ff6b6b);\r
}\r
\r
#tacticalOpsRoot .t-hp-num {\r
  font-family: var(--t-font-display);\r
  font-variant-numeric: tabular-nums;\r
  color: var(--t-muted);\r
  font-size: 0.58rem;\r
}\r
\r
#tacticalOpsRoot .t-chips {\r
  display: flex;\r
  gap: 0.15rem;\r
  flex-wrap: wrap;\r
  margin-top: 0.12rem;\r
}\r
\r
#tacticalOpsRoot .t-chip {\r
  font-family: var(--t-font-display);\r
  font-size: 0.52rem;\r
  letter-spacing: 0.08em;\r
  padding: 0 0.22rem;\r
  border-radius: 2px;\r
  border: 1px solid #e8edf233;\r
  color: var(--t-muted);\r
  line-height: 1.3;\r
}\r
\r
#tacticalOpsRoot .t-chip.buff {\r
  color: var(--t-ally);\r
  border-color: #3ec6ff66;\r
}\r
\r
#tacticalOpsRoot .t-chip.debuff {\r
  color: #ff8a8a;\r
  border-color: #e23d3d73;\r
}\r
\r
#tacticalOpsRoot .t-float {\r
  font-family: var(--t-font-display);\r
  letter-spacing: 0.06em;\r
  pointer-events: none;\r
  z-index: 20;\r
  text-shadow: 0 2px 8px #000c;\r
  font-size: 1rem;\r
  font-weight: 700;\r
  animation: 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards t-float;\r
  position: absolute;\r
  transform: translate(-50%, -120%);\r
}\r
\r
#tacticalOpsRoot .t-float.dmg {\r
  color: #ff6b6b;\r
}\r
\r
#tacticalOpsRoot .t-float.heal {\r
  color: var(--t-heal);\r
}\r
\r
#tacticalOpsRoot .t-float.guard,\r
#tacticalOpsRoot .t-float.info {\r
  color: var(--t-ally);\r
  font-size: 0.78rem;\r
}\r
\r
#tacticalOpsRoot .t-impact {\r
  pointer-events: none;\r
  z-index: 18;\r
  border: 2px solid #e8edf2d9;\r
  border-radius: 99px;\r
  width: 54px;\r
  height: 54px;\r
  animation: 0.38s ease-out forwards t-impact;\r
  position: absolute;\r
  transform: translate(-50%, -50%);\r
}\r
\r
/* Compact always-visible selected-unit status */\r
#tacticalOpsRoot .t-status {\r
  grid-area: field;\r
  position: absolute;\r
  z-index: 35;\r
  top: 0.4rem;\r
  left: max(0.4rem, env(safe-area-inset-left));\r
  display: grid;\r
  grid-template-columns: auto minmax(0, 1fr);\r
  align-items: center;\r
  gap: 0.4rem;\r
  width: min(214px, 56vw);\r
  padding: 0.34rem 0.48rem 0.36rem;\r
  margin: 0;\r
  background: #080c11f2;\r
  border: 1px solid #3ec6ff40;\r
  border-radius: 8px;\r
  pointer-events: none;\r
  min-height: 0;\r
  box-shadow: 0 8px 22px #00000080;\r
  align-self: start;\r
  justify-self: start;\r
  height: max-content;\r
}\r
\r
#tacticalOpsRoot .t-status.enemy {\r
  border-color: #e23d3d55;\r
}\r
\r
#tacticalOpsRoot .t-status img {\r
  width: 38px;\r
  height: 38px;\r
  object-fit: cover;\r
  object-position: 50% 18%;\r
  border-radius: 4px;\r
  border: 1px solid #3ec6ff59;\r
  flex-shrink: 0;\r
}\r
\r
#tacticalOpsRoot .t-status.enemy img {\r
  border-color: #e23d3d73;\r
}\r
\r
#tacticalOpsRoot .t-status-head {\r
  display: flex;\r
  align-items: center;\r
  gap: 0.28rem;\r
  min-width: 0;\r
}\r
\r
#tacticalOpsRoot .t-status-name {\r
  font-family: var(--t-font-display);\r
  letter-spacing: 0.14em;\r
  font-size: 0.74rem;\r
  font-weight: 700;\r
  line-height: 1.05;\r
  white-space: nowrap;\r
  overflow: hidden;\r
  text-overflow: ellipsis;\r
}\r
\r
#tacticalOpsRoot .t-status-pet {\r
  color: var(--t-ally);\r
  display: inline-flex;\r
  flex-shrink: 0;\r
}\r
\r
#tacticalOpsRoot .t-status-pet .t-ico {\r
  width: 12px;\r
  height: 12px;\r
}\r
\r
#tacticalOpsRoot .t-status-kit {\r
  font-family: var(--t-font-display);\r
  letter-spacing: 0.1em;\r
  color: var(--t-muted);\r
  font-size: 0.52rem;\r
  text-transform: uppercase;\r
  white-space: nowrap;\r
  overflow: hidden;\r
  text-overflow: ellipsis;\r
  margin-top: 0.04rem;\r
}\r
\r
#tacticalOpsRoot .t-status-mods {\r
  display: flex;\r
  gap: 0.35rem;\r
  font-family: var(--t-font-display);\r
  letter-spacing: 0.1em;\r
  color: var(--t-ally);\r
  font-size: 0.56rem;\r
  font-weight: 700;\r
  margin-top: 0.1rem;\r
}\r
\r
#tacticalOpsRoot .t-status-mods span {\r
  border: 1px solid #3ec6ff33;\r
  background: #3ec6ff12;\r
  border-radius: 4px;\r
  padding: 0.04rem 0.28rem;\r
}\r
\r
#tacticalOpsRoot .t-status.enemy .t-status-mods {\r
  color: #ff8a8a;\r
}\r
\r
#tacticalOpsRoot .t-status.enemy .t-status-mods span {\r
  border-color: #e23d3d55;\r
  background: #e23d3d18;\r
}\r
\r
#tacticalOpsRoot .t-status .t-hp {\r
  margin-top: 0.2rem;\r
}\r
\r
#tacticalOpsRoot .t-status .t-hp-bar {\r
  height: 5px;\r
}\r
\r
#tacticalOpsRoot .t-status-stats {\r
  display: none;\r
}\r
\r
#tacticalOpsRoot .t-status-stats dt {\r
  font-family: var(--t-font-display);\r
  letter-spacing: 0.08em;\r
  color: var(--t-muted);\r
  font-size: 0.52rem;\r
}\r
\r
#tacticalOpsRoot .t-status-stats dd {\r
  margin: 0;\r
  font-family: var(--t-font-display);\r
  font-size: 0.72rem;\r
  font-variant-numeric: tabular-nums;\r
}\r
\r
#tacticalOpsRoot .t-status-empty {\r
  opacity: 0.4;\r
}\r
\r
#tacticalOpsRoot .t-dock {\r
  grid-area: dock;\r
  z-index: 36;\r
  padding: 0.12rem max(0.4rem, env(safe-area-inset-right)) max(0.34rem, env(safe-area-inset-bottom))\r
    max(0.4rem, env(safe-area-inset-left));\r
  background: linear-gradient(#0000, #07090df5 42%);\r
  grid-template-columns: 44px minmax(0, 1fr) auto;\r
  align-items: stretch;\r
  gap: 0.28rem;\r
  display: grid;\r
  position: relative;\r
}\r
\r
#tacticalOpsRoot .t-icon-btn {\r
  border-radius: var(--t-radius-sm);\r
  width: 44px;\r
  height: 44px;\r
  min-width: 44px;\r
  min-height: 44px;\r
  color: var(--t-fg);\r
  background: #10141acc;\r
  border: 1px solid #e8edf21f;\r
  place-items: center;\r
  display: grid;\r
  touch-action: manipulation;\r
}\r
\r
#tacticalOpsRoot .t-actions {\r
  display: flex;\r
  gap: 0.28rem;\r
  width: 100%;\r
  max-width: 42rem;\r
  margin: 0 auto;\r
  min-width: 0;\r
}\r
\r
#tacticalOpsRoot .t-act {\r
  text-align: center;\r
  min-height: 52px;\r
  min-width: 0;\r
  flex: 1 1 0;\r
  color: var(--t-fg);\r
  border-radius: var(--t-radius-sm);\r
  background: #0a0e14f2;\r
  border: 1px solid #e8edf224;\r
  flex-direction: column;\r
  justify-content: center;\r
  align-items: center;\r
  gap: 0.02rem;\r
  padding: 0.38rem 0.18rem 0.28rem;\r
  transition: border-color 0.15s, background 0.15s, transform 0.15s cubic-bezier(0.22, 1, 0.36, 1);\r
  display: flex;\r
  position: relative;\r
  overflow: hidden;\r
  touch-action: manipulation;\r
  user-select: none;\r
}\r
\r
#tacticalOpsRoot .t-act .row {\r
  display: none;\r
}\r
\r
#tacticalOpsRoot .t-act .name {\r
  font-family: var(--t-font-display);\r
  letter-spacing: 0.14em;\r
  font-size: 0.66rem;\r
  font-weight: 700;\r
  line-height: 1.1;\r
  white-space: nowrap;\r
}\r
\r
#tacticalOpsRoot .t-act-svg {\r
  width: 16px;\r
  height: 16px;\r
  color: var(--t-ally);\r
  flex-shrink: 0;\r
}\r
\r
#tacticalOpsRoot .t-act:disabled .t-act-svg,\r
#tacticalOpsRoot .t-act.cooling .t-act-svg {\r
  color: var(--t-faint);\r
}\r
\r
#tacticalOpsRoot .t-act-obj .t-act-svg {\r
  color: var(--t-heal);\r
}\r
\r
#tacticalOpsRoot .t-act .slot {\r
  position: absolute;\r
  top: 0.12rem;\r
  left: 0.22rem;\r
  color: var(--t-faint);\r
  font-family: var(--t-font-display);\r
  font-size: 0.5rem;\r
  letter-spacing: 0.14em;\r
  font-weight: 700;\r
}\r
\r
#tacticalOpsRoot .t-act small {\r
  display: none;\r
}\r
\r
#tacticalOpsRoot .t-act:hover:not(:disabled) {\r
  border-color: #3ec6ff73;\r
}\r
\r
#tacticalOpsRoot .t-act:active:not(:disabled) {\r
  transform: scale(0.985);\r
}\r
\r
#tacticalOpsRoot .t-act.on {\r
  border-color: var(--t-ally);\r
  background: #3ec6ff18;\r
  box-shadow: inset 0 0 0 1px #3ec6ff66;\r
}\r
\r
#tacticalOpsRoot .t-act:disabled {\r
  opacity: 0.38;\r
}\r
\r
#tacticalOpsRoot .t-act .cd {\r
  position: absolute;\r
  top: 0.12rem;\r
  right: 0.18rem;\r
  color: var(--t-enemy);\r
  letter-spacing: 0.12em;\r
  font-family: var(--t-font-display);\r
  font-size: 0.52rem;\r
}\r
\r
#tacticalOpsRoot .t-act.cooling {\r
  opacity: 0.72;\r
}\r
\r
#tacticalOpsRoot .t-act-obj {\r
  box-shadow: inset 1px 0 0 #3ec6ff22;\r
}\r
\r
#tacticalOpsRoot .t-skip {\r
  letter-spacing: 0.14em;\r
  min-width: 3.4rem;\r
  min-height: 52px;\r
  padding: 0.38rem 0.45rem 0.28rem;\r
  flex-direction: column;\r
  gap: 0.08rem;\r
  font-size: 0.66rem;\r
}\r
\r
#tacticalOpsRoot .t-ticker {\r
  z-index: 32;\r
  font-family: var(--t-font-display);\r
  letter-spacing: 0.16em;\r
  color: var(--t-fg);\r
  white-space: nowrap;\r
  text-overflow: ellipsis;\r
  background: #07090de8;\r
  border: 1px solid #3ec6ff33;\r
  border-radius: 99px;\r
  max-width: min(72vw, 28rem);\r
  padding: 0.18rem 0.6rem;\r
  font-size: 0.6rem;\r
  position: absolute;\r
  top: auto;\r
  bottom: 0.45rem;\r
  left: 50%;\r
  overflow: hidden;\r
  transform: translate(-50%, 0);\r
  grid-area: field;\r
  align-self: end;\r
  justify-self: center;\r
  margin-top: 0;\r
  pointer-events: none;\r
}\r
\r
#tacticalOpsRoot .t-ticker-warn {\r
  color: var(--t-enemy);\r
  border-color: #e23d3d55;\r
  margin-top: 0;\r
  bottom: 2.1rem;\r
}\r
\r
#tacticalOpsRoot .t-obj-chip {\r
  grid-area: field;\r
  position: absolute;\r
  z-index: 35;\r
  top: 0.4rem;\r
  right: max(0.4rem, env(safe-area-inset-right));\r
  width: min(176px, 42vw);\r
  padding: 0.32rem 0.44rem 0.34rem;\r
  background: #080c11f2;\r
  border: 1px solid #3ec6ff40;\r
  border-radius: 8px;\r
  box-shadow: 0 8px 22px #00000080;\r
  pointer-events: none;\r
  min-width: 0;\r
  align-self: start;\r
  justify-self: end;\r
  height: max-content;\r
}\r
\r
#tacticalOpsRoot .t-obj-chip strong {\r
  display: block;\r
  font-family: var(--t-font-display);\r
  letter-spacing: 0.1em;\r
  text-transform: uppercase;\r
  color: var(--t-ally);\r
  font-size: 0.56rem;\r
  font-weight: 700;\r
  line-height: 1.15;\r
}\r
\r
#tacticalOpsRoot .t-obj-chip span {\r
  display: -webkit-box;\r
  -webkit-line-clamp: 1;\r
  -webkit-box-orient: vertical;\r
  overflow: hidden;\r
  line-clamp: 1;\r
  color: var(--t-fg);\r
  font-family: var(--t-font-display);\r
  letter-spacing: 0.04em;\r
  font-size: 0.5rem;\r
  line-height: 1.25;\r
  margin-top: 0.08rem;\r
}\r
\r
#tacticalOpsRoot .t-obj-chip small,\r
#tacticalOpsRoot .t-obj-chip em {\r
  display: block;\r
  color: var(--t-muted);\r
  font-family: var(--t-font-display);\r
  font-style: normal;\r
  letter-spacing: 0.06em;\r
  font-size: 0.48rem;\r
  line-height: 1.3;\r
  margin-top: 0.1rem;\r
}\r
\r
#tacticalOpsRoot .t-obj-rounds {\r
  display: flex;\r
  align-items: center;\r
  justify-content: space-between;\r
  gap: 0.35rem;\r
  margin-top: 0.16rem;\r
}\r
\r
#tacticalOpsRoot .t-obj-rounds em {\r
  margin: 0;\r
}\r
\r
#tacticalOpsRoot .t-obj-dots {\r
  display: flex;\r
  gap: 0.18rem;\r
  align-items: center;\r
}\r
\r
#tacticalOpsRoot .t-obj-dots i {\r
  width: 6px;\r
  height: 6px;\r
  border-radius: 99px;\r
  background: #e8edf226;\r
  display: block;\r
}\r
\r
#tacticalOpsRoot .t-obj-dots i.on {\r
  background: var(--t-ally);\r
  box-shadow: 0 0 6px #3ec6ff88;\r
}\r
\r
#tacticalOpsRoot .t-banner {\r
  z-index: 40;\r
  pointer-events: none;\r
  background: #0a0c1047;\r
  place-items: center;\r
  display: grid;\r
  position: absolute;\r
  inset: 0;\r
  grid-area: field;\r
}\r
\r
#tacticalOpsRoot .t-banner span {\r
  font-family: var(--t-font-display);\r
  letter-spacing: 0.3em;\r
  background: #07090de8;\r
  border: 1px solid #3ec6ff40;\r
  padding: 0.7rem 1.3rem;\r
  font-size: max(1.1rem, min(4vw, 2.1rem));\r
  font-weight: 700;\r
}\r
\r
/* Overlay HUD is painted on the field. pointer-events is not inherited, so\r
   children would otherwise steal enemy target taps. */\r
#tacticalOpsRoot .t-status *,\r
#tacticalOpsRoot .t-obj-chip *,\r
#tacticalOpsRoot .t-order-wrap *,\r
#tacticalOpsRoot .t-ticker *,\r
#tacticalOpsRoot .t-banner * {\r
  pointer-events: none;\r
}\r
\r
/* ---- COMPACT (phones + narrow Mini App) ---- */\r
#tacticalOpsRoot[data-layout="compact"] .t-brand p,\r
#tacticalOpsRoot[data-layout="compact"] .t-obj small,\r
#tacticalOpsRoot[data-layout="compact"] .t-act small {\r
  display: none;\r
}\r
\r
#tacticalOpsRoot[data-layout="compact"] .t-brand h1 {\r
  font-size: 0.62rem;\r
}\r
\r
#tacticalOpsRoot[data-layout="compact"] .t-obj {\r
  font-size: 0.5rem;\r
}\r
\r
#tacticalOpsRoot[data-layout="compact"] .t-status {\r
  width: min(196px, 52vw);\r
}\r
\r
#tacticalOpsRoot[data-layout="compact"] .t-obj-chip {\r
  width: min(148px, 38vw);\r
}\r
\r
#tacticalOpsRoot[data-layout="compact"] .t-order-wrap {\r
  display: none;\r
}\r
\r
#tacticalOpsRoot[data-layout="compact"] .t-ticker {\r
  margin-top: 0;\r
}\r
\r
#tacticalOpsRoot[data-layout="compact"] .t-token {\r
  width: 14%;\r
  min-width: 44px;\r
  max-width: 88px;\r
}\r
\r
#tacticalOpsRoot[data-layout="compact"] .t-token.alpha {\r
  width: 16%;\r
  min-width: 48px;\r
}\r
\r
#tacticalOpsRoot[data-layout="compact"] .t-token.leader {\r
  width: 17%;\r
  min-width: 52px;\r
}\r
\r
#tacticalOpsRoot[data-layout="compact"] .t-token.hound {\r
  width: 15%;\r
  min-width: 46px;\r
}\r
\r
#tacticalOpsRoot[data-layout="compact"] .t-plate {\r
  min-width: 56px;\r
  top: -26px;\r
}\r
\r
#tacticalOpsRoot[data-layout="compact"] .t-turn-sub {\r
  display: none;\r
}\r
\r
#tacticalOpsRoot[data-layout="compact"] .t-skip {\r
  min-width: 3.1rem;\r
  min-height: 52px;\r
  padding: 0.38rem 0.32rem 0.28rem;\r
  font-size: 0.62rem;\r
  letter-spacing: 0.1em;\r
}\r
\r
#tacticalOpsRoot[data-layout="compact"] .t-cell {\r
  width: 40px;\r
  min-width: 40px;\r
  height: 40px;\r
  min-height: 40px;\r
}\r
\r
/* ---- STANDARD (tablet) ---- */\r
#tacticalOpsRoot[data-layout="standard"] .t-brand h1 {\r
  font-size: 0.78rem;\r
}\r
\r
#tacticalOpsRoot[data-layout="standard"] .t-order-unit {\r
  width: 26px;\r
  height: 26px;\r
}\r
\r
#tacticalOpsRoot[data-layout="standard"] .t-status {\r
  width: min(240px, 36vw);\r
}\r
\r
#tacticalOpsRoot[data-layout="standard"] .t-obj-chip {\r
  width: min(200px, 32vw);\r
}\r
\r
#tacticalOpsRoot[data-layout="standard"] .t-act,\r
#tacticalOpsRoot[data-layout="standard"] .t-skip {\r
  min-height: 52px;\r
}\r
\r
/* ---- WIDE / EXPANDED (landscape + desktop) ---- */\r
#tacticalOpsRoot[data-layout="wide"] .t-battle {\r
  display: grid;\r
  grid-template-rows: 1fr;\r
  grid-template-areas: "field";\r
}\r
\r
#tacticalOpsRoot[data-layout="wide"] .t-top,\r
#tacticalOpsRoot[data-layout="wide"] .t-order-wrap,\r
#tacticalOpsRoot[data-layout="wide"] .t-dock,\r
#tacticalOpsRoot[data-layout="wide"] .t-status,\r
#tacticalOpsRoot[data-layout="wide"] .t-obj-chip {\r
  position: absolute;\r
}\r
\r
#tacticalOpsRoot[data-layout="wide"] .t-top {\r
  top: 0;\r
  left: 0;\r
  right: 0;\r
  grid-area: unset;\r
}\r
\r
#tacticalOpsRoot[data-layout="wide"] .t-order-wrap {\r
  top: 3.15rem;\r
  left: 50%;\r
  right: auto;\r
  grid-area: unset;\r
  max-width: min(28vw, 160px);\r
}\r
\r
#tacticalOpsRoot[data-layout="wide"] .t-field-wrap {\r
  position: absolute;\r
  inset: 0;\r
  grid-area: unset;\r
  height: 100%;\r
  min-height: 100%;\r
  max-height: none;\r
}\r
\r
#tacticalOpsRoot[data-layout="wide"] .t-status {\r
  left: max(0.7rem, env(safe-area-inset-left));\r
  top: 3.4rem;\r
  width: min(240px, 28vw);\r
  grid-area: unset;\r
  margin: 0;\r
}\r
\r
#tacticalOpsRoot[data-layout="wide"] .t-obj-chip {\r
  top: 3.4rem;\r
  right: max(0.7rem, env(safe-area-inset-right));\r
  width: min(220px, 26vw);\r
  grid-area: unset;\r
}\r
\r
#tacticalOpsRoot[data-layout="wide"] .t-status-stats {\r
  display: none;\r
}\r
\r
#tacticalOpsRoot[data-layout="wide"] .t-dock {\r
  left: 0;\r
  right: 0;\r
  bottom: 0;\r
  grid-area: unset;\r
}\r
\r
#tacticalOpsRoot[data-layout="wide"] .t-brand h1 {\r
  font-size: 0.82rem;\r
}\r
\r
#tacticalOpsRoot[data-layout="wide"] .t-act,\r
#tacticalOpsRoot[data-layout="wide"] .t-skip {\r
  min-height: 52px;\r
}\r
\r
#tacticalOpsRoot[data-layout="wide"] .t-skip {\r
  min-width: 4.4rem;\r
}\r
\r
#tacticalOpsRoot[data-layout="wide"] .t-ticker {\r
  top: auto;\r
  bottom: 4.6rem;\r
  margin-top: 0;\r
}\r
\r
/* Viewport CSS fallback (works even before data-layout is stamped) */\r
@container tops (max-width: 599px) {\r
  #tacticalOpsRoot .t-act small {\r
    display: none;\r
  }\r
}\r
\r
@media (max-width: 599px) {\r
  #tacticalOpsRoot .t-act small {\r
    display: none;\r
  }\r
}\r
\r
@media (max-height: 420px) {\r
  #tacticalOpsRoot .t-brand img {\r
    width: 32px;\r
    height: 32px;\r
  }\r
  #tacticalOpsRoot .t-act,\r
  #tacticalOpsRoot .t-skip {\r
    min-height: 48px;\r
  }\r
  #tacticalOpsRoot .t-act small {\r
    display: none;\r
  }\r
  #tacticalOpsRoot .t-status {\r
    min-height: 40px;\r
    padding: 0.18rem 0.4rem;\r
  }\r
  #tacticalOpsRoot .t-status img {\r
    width: 28px;\r
    height: 28px;\r
  }\r
}\r
\r
@media (prefers-reduced-motion: reduce) {\r
  #tacticalOpsRoot .t-token,\r
  #tacticalOpsRoot .t-hp-bar > i,\r
  #tacticalOpsRoot .t-btn,\r
  #tacticalOpsRoot .t-act {\r
    transition: none;\r
  }\r
  #tacticalOpsRoot .t-token.attacking img.body,\r
  #tacticalOpsRoot .t-float,\r
  #tacticalOpsRoot .t-impact {\r
    animation: none;\r
  }\r
  #tacticalOpsRoot .t-ring {\r
    filter: none;\r
  }\r
}\r
\r
@keyframes t-lunge {\r
  0% {\r
    transform: translate(0);\r
  }\r
  40% {\r
    transform: translate(10px) scale(1.04);\r
  }\r
  to {\r
    transform: translate(0);\r
  }\r
}\r
\r
@keyframes t-lunge-left {\r
  0% {\r
    transform: translate(0);\r
  }\r
  40% {\r
    transform: translate(-10px) scale(1.04);\r
  }\r
  to {\r
    transform: translate(0);\r
  }\r
}\r
\r
@keyframes t-float {\r
  0% {\r
    opacity: 0;\r
    transform: translate(-50%, -80%);\r
  }\r
  18% {\r
    opacity: 1;\r
  }\r
  to {\r
    opacity: 0;\r
    transform: translate(-50%, -160%);\r
  }\r
}\r
\r
@keyframes t-impact {\r
  0% {\r
    opacity: 0.9;\r
    transform: translate(-50%, -50%) scale(0.4);\r
  }\r
  to {\r
    opacity: 0;\r
    transform: translate(-50%, -50%) scale(1.6);\r
  }\r
}\r
\r
#tacticalOpsRoot .t-bg,\r
#tacticalOpsRoot .t-vignette,\r
#tacticalOpsRoot .t-field-art,\r
#tacticalOpsRoot .t-field-grade {\r
  pointer-events: none;\r
}\r
\r
/* Field mission information is a floating objective chip; keep leftover class harmless. */\r
#tacticalOpsRoot .t-field-rules { display: none; }\r
#tacticalOpsRoot .t-hold-cell { position: absolute; transform: translate(-50%, -50%); width: 10%; height: 15%; border: 1px solid #61ddff; background: #3ec6ff24; color: #a6ebff; font-size: 0.55rem; pointer-events: none; display: flex; align-items: end; justify-content: center; z-index: 2; }\r
\r
#tacticalOpsRoot .t-order-wrap:has(.t-field-rules) { flex-direction: row; align-items: center; }\r
\r
/* Premium command presentation: gameplay state remains owned by the store. */\r
#tacticalOpsRoot .t-deployment > *, #tacticalOpsRoot .t-war-table > * { flex-shrink: 0; }\r
#tacticalOpsRoot .t-deployment, #tacticalOpsRoot .t-war-table { gap: .65rem; margin: auto; }\r
#tacticalOpsRoot .t-deploy-hero { position: relative; isolation: isolate; padding: 3.5rem 1rem 1.2rem; overflow: hidden; border-bottom: 2px solid var(--t-accent); background: #0b151d; }\r
#tacticalOpsRoot .t-deploy-hero > img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; z-index:-2; opacity:.65; }\r
#tacticalOpsRoot .t-deploy-hero::after { content:""; position:absolute; inset:0; background:linear-gradient(0deg,#081018 5%,#08101844 100%); z-index:-1; }\r
#tacticalOpsRoot .t-deploy-hero .t-title { font-size:clamp(1.7rem,6vw,2.8rem)!important; line-height:1.08; letter-spacing:.035em; }\r
#tacticalOpsRoot .t-deploy-hero p { font-size:.85rem; line-height:1.5; }\r
#tacticalOpsRoot .t-conditions { padding:.8rem 0; display:grid; gap:.4rem; }\r
#tacticalOpsRoot .t-condition { border-left:3px solid #e5aa59; padding:.3rem .7rem; background:#221d17b8; }\r
#tacticalOpsRoot summary { cursor:pointer; min-height:36px; align-content:center; line-height:1.5; }\r
#tacticalOpsRoot .t-condition summary { font-size:.78rem; font-weight:700; color:#f4cc90; letter-spacing:.06em; }\r
#tacticalOpsRoot .t-condition p, #tacticalOpsRoot .t-detail p { font-size:.82rem; color:var(--t-muted); line-height:1.5; }\r
#tacticalOpsRoot .t-detail { padding:.5rem 0; border-top:1px solid #b7d7eb22; text-align:left; }\r
#tacticalOpsRoot .t-detail > summary { color:var(--t-muted); font-size:.75rem; letter-spacing:.045em; }\r
#tacticalOpsRoot .t-deploy-actions, #tacticalOpsRoot .t-result-actions { position:sticky!important; bottom:0; z-index:5!important; padding:.75rem 0 max(.6rem,env(safe-area-inset-bottom)); background:linear-gradient(#0b1119f5,#0b1119); border-top:1px solid #62c8ef44; margin-top:.75rem; flex-wrap:nowrap; }\r
#tacticalOpsRoot .t-deploy-actions .t-btn-primary, #tacticalOpsRoot .t-result-actions .t-btn-primary { flex:1; min-height:48px; background:linear-gradient(135deg,#9be6ff,#49b6dd); color:#07131b; border-color:#b9efff; font-weight:800; }\r
#tacticalOpsRoot .t-deployment .t-btn[aria-pressed="true"] { background:#153442; color:#c6f0ff; border-color:#66cdeb; box-shadow:inset 0 -3px #66cdeb; }\r
#tacticalOpsRoot .t-deployment .t-brief-grid { margin:.7rem 0; }\r
#tacticalOpsRoot .t-results-overlay { padding:.6rem; }\r
#tacticalOpsRoot .t-results { width:min(520px,100%); max-height:100%; overflow-y:auto; padding:0 1rem; text-align:left; border-radius:8px; background:#0b1119; }\r
#tacticalOpsRoot .t-outcome-hero { position:relative; isolation:isolate; margin:0 -1rem; padding:4rem 1rem 1rem; overflow:hidden; min-height:190px; display:flex; flex-direction:column; justify-content:flex-end; border-bottom:1px solid #76d9fb66; }\r
#tacticalOpsRoot .t-outcome-hero .t-results-plate { width:100%; height:100%; inset:0; opacity:.8; filter:none; object-position:50% 40%; z-index:-2; }\r
#tacticalOpsRoot .t-outcome-hero::after { content:""; position:absolute; inset:0; z-index:-1; background:linear-gradient(0deg,#0b1119 2%,#0b111970 70%,#0b111930); }\r
#tacticalOpsRoot .t-outcome-hero h2 { font-size:clamp(1.8rem,7vw,2.6rem); line-height:1.05; letter-spacing:.04em; margin:.4rem 0 0; color:#e1f7ff; }\r
#tacticalOpsRoot .t-outcome-stamp { color:#9de4bd; font-size:.65rem; letter-spacing:.2em; margin-bottom:.5rem; font-weight:800; }\r
#tacticalOpsRoot .is-failure .t-outcome-stamp { color:#ffa594; }\r
#tacticalOpsRoot .is-failure .t-outcome-hero { border-color:#ec6f59; }\r
#tacticalOpsRoot .t-field-feedback { padding:.8rem 0 0; text-align:left; }\r
#tacticalOpsRoot .t-unlock { padding:.65rem .8rem; background:linear-gradient(110deg,#3d311c,#1b211f); border-left:3px solid #f1c975; margin-bottom:.8rem; }\r
#tacticalOpsRoot .t-unlock strong { display:block; color:#ffe0a0; font-size:1rem; letter-spacing:.08em; margin-top:.25rem; }\r
#tacticalOpsRoot .t-progress-heading, #tacticalOpsRoot .t-mastery-heading { display:flex; justify-content:space-between; gap:.5rem; align-items:center; }\r
#tacticalOpsRoot .t-progress-heading strong { display:block; font-size:1.4rem; letter-spacing:.08em; }\r
#tacticalOpsRoot .t-progress-heading b { font-size:2rem; color:#b6eeff; text-align:right; line-height:1; }\r
#tacticalOpsRoot .t-progress-heading small { display:block; font-size:.55rem; letter-spacing:.08em; margin-top:.3rem; }\r
#tacticalOpsRoot .t-progress { appearance:none; display:block; border:0; border-radius:0; width:100%; height:5px; margin:.65rem 0 .4rem; background:#25313d; accent-color:#76d9fb; }\r
#tacticalOpsRoot .t-progress::-webkit-progress-bar { background:#25313d; }\r
#tacticalOpsRoot .t-progress::-webkit-progress-value { background:linear-gradient(90deg,#388aaa,#9de8ff); }\r
#tacticalOpsRoot .t-progress::-moz-progress-bar { background:#76d9fb; }\r
#tacticalOpsRoot .t-progress-caption { display:flex; justify-content:space-between; gap:.5rem; color:var(--t-muted); font-size:.58rem; letter-spacing:.04em; }\r
#tacticalOpsRoot .t-mastery-feedback { margin-top:1rem; }\r
#tacticalOpsRoot .t-mastery-row { padding:.65rem 0; border-bottom:1px solid #adcee21c; }\r
#tacticalOpsRoot .t-mastery-heading strong { font-size:.8rem; letter-spacing:.08em; }\r
#tacticalOpsRoot .t-mastery-heading span { margin-left:auto; color:var(--t-muted); font-size:.65rem; }\r
#tacticalOpsRoot .t-mastery-heading b { color:#a5e2b9; }\r
#tacticalOpsRoot .t-mastery-row small, #tacticalOpsRoot .t-field-feedback > small { font-size:.7rem; color:var(--t-muted); }\r
#tacticalOpsRoot .t-world-change { margin-top:.8rem; padding:.65rem .8rem; border-left:2px solid #70b9c5; background:#11232b; }\r
#tacticalOpsRoot .t-world-change strong, #tacticalOpsRoot .t-world-change small { display:block; margin-top:.3rem; }\r
#tacticalOpsRoot .t-world-change strong { font-size:.95rem; letter-spacing:.08em; }\r
#tacticalOpsRoot .t-world-change small { font-size:.65rem; color:var(--t-muted); }\r
#tacticalOpsRoot .t-results .t-stats { grid-template-columns:repeat(4,minmax(0,1fr)); gap:.5rem; padding:.8rem 0; margin:.6rem 0 0; border-top:1px solid #adcee222; }\r
#tacticalOpsRoot .t-results .t-stats dt { font-size:.52rem; letter-spacing:.04em; }\r
#tacticalOpsRoot .t-results .t-stats dd { font-size:1.15rem; }\r
#tacticalOpsRoot .t-result-actions .t-btn { font-size:.65rem; padding:.7rem; }\r
#tacticalOpsRoot .t-command-summary { display:grid; grid-template-columns:1fr 1fr; gap:1rem; border-block:1px solid #64d3fa55; padding:1rem 0; }\r
#tacticalOpsRoot .t-command-summary strong, #tacticalOpsRoot .t-command-summary small { display:block; margin-top:.35rem; }\r
#tacticalOpsRoot .t-command-summary strong { font-size:1.25rem; }\r
#tacticalOpsRoot .t-command-summary small { font-size:.6rem; color:var(--t-muted); }\r
#tacticalOpsRoot .t-mission-card { position:relative; isolation:isolate; overflow:hidden; padding:1.1rem; border-radius:5px; border-color:#64c4e64d; background:#0a141e; display:flex; flex-direction:column; gap:.65rem; }\r
#tacticalOpsRoot .t-card-art { position:absolute; inset:0; width:100%; height:150px; object-fit:cover; z-index:-2; opacity:.55; mask-image:linear-gradient(#000,#0000); }\r
#tacticalOpsRoot .t-mission-card h3 { color:#eef9ff; font-size:1.3rem; letter-spacing:.045em; margin:.8rem 0 .1rem!important; }\r
#tacticalOpsRoot .t-mission-card p { font-size:.82rem; color:var(--t-muted); margin:0!important; min-height:0!important; line-height:1.45; }\r
#tacticalOpsRoot .t-mission-card .t-btn { width:100%; margin-top:auto; min-height:44px; }\r
#tacticalOpsRoot .t-card-status { display:flex; gap:.4rem; font-size:.6rem; letter-spacing:.1em; color:#baefff; }\r
#tacticalOpsRoot .t-card-status span { background:#092234; border:1px solid #7ad7ff55; padding:.3rem .5rem; }\r
#tacticalOpsRoot .is-cleared .t-card-status span:last-child { color:#b0eac2; border-color:#83d6a466; background:#102b22; }\r
#tacticalOpsRoot .t-card-reward { font-size:.9rem; color:#ace6bd; padding:.6rem 0; }\r
#tacticalOpsRoot .t-card-reward span, #tacticalOpsRoot .t-card-reward small { font-size:.6rem; color:var(--t-muted); }\r
#tacticalOpsRoot .t-card-reward small { display:block; margin-top:.4rem; }\r
@media (max-width:380px) { #tacticalOpsRoot .t-results-overlay { padding:.3rem; } #tacticalOpsRoot .t-outcome-hero { min-height:165px; padding-top:2.5rem; } #tacticalOpsRoot .t-mastery-heading span { font-size:.58rem; } }\r
@media (prefers-reduced-motion:reduce) { #tacticalOpsRoot .t-progress { transition:none; } }\r
\r
#tacticalOpsRoot { --t-accent: #76d9fb; }\r
#tacticalOpsRoot .t-outcome-hero .t-results-plate { object-position:50% 8%; }\r
#tacticalOpsRoot .t-results, #tacticalOpsRoot .t-deployment, #tacticalOpsRoot .t-war-table { min-width:0; }\r
#tacticalOpsRoot .t-war-table > p { margin-bottom:.2rem!important; }\r
\r
#tacticalOpsRoot .t-deploy-hero > img { object-position:0% 50%; opacity:1; }\r
#tacticalOpsRoot .t-deploy-hero::after { background:linear-gradient(0deg,#081018 0%,#08101822 100%); }\r
#tacticalOpsRoot .t-card-art { object-position:0% 50%; opacity:.95; }\r
#tacticalOpsRoot .t-war-table > section { margin-top:.2rem!important; }\r
#tacticalOpsRoot .t-war-table > .t-title { font-size:1.8rem; }\r
#tacticalOpsRoot .t-war-table > p { font-size:.8rem!important; margin:0!important; }\r
#tacticalOpsRoot .t-war-table section > h2 { margin:.65rem 0; font-size:1.4rem; }\r
#tacticalOpsRoot .t-squad-preview { display:flex; gap:.55rem; align-items:center; padding:.5rem 0; }\r
#tacticalOpsRoot .t-squad-preview > div { position:relative; width:60px; }\r
#tacticalOpsRoot .t-squad-preview img { width:60px; height:52px; object-fit:cover; object-position:50% 15%; border:1px solid #6bcaef66; border-radius:3px; }\r
#tacticalOpsRoot .t-squad-preview div span { display:block; text-align:center; font-size:.55rem; letter-spacing:.07em; margin-top:.2rem; }\r
#tacticalOpsRoot .t-squad-preview > span { margin-left:auto; line-height:1.8; }\r
#tacticalOpsRoot .t-deployment-options { padding:.5rem .7rem; border:1px solid #9bcee433; }\r
#tacticalOpsRoot .t-deployment-options > summary { color:#b9e2f2; }\r
#tacticalOpsRoot .t-deployment .t-conditions { padding:.2rem 0; }\r
\r
/* Telegram Android presentation: system inset plus Telegram's content controls. */\r
#tacticalOpsRoot {\r
  --t-safe-top: max(var(--ah-safe-top, 0px), calc(max(env(safe-area-inset-top, 0px), var(--tg-safe-area-inset-top, 0px)) + var(--tg-content-safe-area-inset-top, 0px)));\r
}\r
#tacticalOpsRoot .t-war-table,\r
#tacticalOpsRoot .t-deployment {\r
  padding-top: calc(var(--t-safe-top) + 1rem);\r
}\r
#tacticalOpsRoot .t-results-overlay {\r
  padding-top: calc(var(--t-safe-top) + .6rem);\r
}\r
body:has(#tacticalOpsRoot[data-open="1"] .t-shell:is([data-screen="war-table"], [data-screen="brief"], [data-screen="results"])) #ahCommunityBtn {\r
  visibility: hidden;\r
  pointer-events: none;\r
}\r
#tacticalOpsRoot .t-war-table { --t-muted: #a3b1bf; --t-faint: #96a5b4; }\r
#tacticalOpsRoot .t-war-table .t-mission-card { padding: .9rem; gap: .45rem; }\r
#tacticalOpsRoot .t-war-table .t-mission-card h3 { margin: .45rem 0 .1rem!important; }\r
#tacticalOpsRoot .t-war-table .t-card-reward { padding: .35rem 0; }\r
#tacticalOpsRoot .t-results .t-outcome-hero { min-height: 155px; padding-top: 2rem; }\r
#tacticalOpsRoot .t-results .t-mastery-feedback { margin-top: .65rem; }\r
#tacticalOpsRoot .t-results .t-mastery-row { padding: .45rem 0; }\r
#tacticalOpsRoot .t-results .t-mastery-heading span { color: #a3b1bf; }\r
\r
#tacticalOpsRoot .t-pack-mastery { margin-top: .8rem; }\r
#tacticalOpsRoot .t-mastery-intro { font-size: .8rem; line-height: 1.5; }\r
#tacticalOpsRoot .t-mastery-next { margin: .45rem 0; font-size: .7rem; line-height: 1.5; color: var(--t-muted); }\r
#tacticalOpsRoot .t-mastery-next strong { color: var(--t-text); }\r
#tacticalOpsRoot .t-mastery-heading { flex-wrap: wrap; }\r

/* Premium War Table pass */
#tacticalOpsRoot .t-war-table-premium {
  gap: .85rem;
}
#tacticalOpsRoot .t-war-table-premium .t-panel {
  border-color: #63cdf34d;
  background: linear-gradient(180deg, rgba(7,18,29,.94), rgba(8,16,25,.98));
  box-shadow: 0 10px 30px rgba(0,0,0,.28), inset 0 1px 0 rgba(143,223,255,.05);
}
#tacticalOpsRoot .t-wt-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(180px, .8fr);
  gap: 1rem;
  padding: 1.15rem 1.15rem 1rem;
  align-items: end;
  overflow: hidden;
  position: relative;
}
#tacticalOpsRoot .t-wt-hero::after {
  content: "";
  position: absolute;
  inset: auto -10% -35% 42%;
  height: 180px;
  background: radial-gradient(circle, rgba(72,167,218,.2) 0%, rgba(72,167,218,0) 70%);
  pointer-events: none;
}
#tacticalOpsRoot .t-wt-title {
  font-size: clamp(2.2rem, 8vw, 3.7rem);
  margin: .15rem 0 .35rem;
  letter-spacing: .06em;
}
#tacticalOpsRoot .t-wt-intro,
#tacticalOpsRoot .t-wt-error,
#tacticalOpsRoot .t-wt-highlight {
  margin: 0;
  max-width: 42rem;
  line-height: 1.5;
}
#tacticalOpsRoot .t-wt-intro { color: #d8eff9; font-size: .98rem; }
#tacticalOpsRoot .t-wt-error { color: #ff9d8f; margin-top: .65rem; }
#tacticalOpsRoot .t-wt-highlight { color: #9fe7ff; margin-top: .65rem; font-size: .78rem; letter-spacing: .08em; }
#tacticalOpsRoot .t-wt-wolfmark {
  min-height: 150px;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  text-align: right;
  position: relative;
}
#tacticalOpsRoot .t-wt-wolfmark::before {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 70% 35%, rgba(82,184,255,.42) 0 2px, transparent 3px),
              radial-gradient(circle at 40% 30%, rgba(82,184,255,.28) 0 1px, transparent 2px),
              radial-gradient(circle at 58% 68%, rgba(82,184,255,.2) 0 1px, transparent 2px),
              linear-gradient(135deg, rgba(64,142,198,.08), rgba(64,142,198,0));
  opacity: .8;
}
#tacticalOpsRoot .t-wt-ethos {
  position: relative;
  z-index: 1;
  color: #b6d7e6;
  font-size: .66rem;
  line-height: 1.75;
  letter-spacing: .28em;
  text-transform: uppercase;
}
#tacticalOpsRoot .t-wt-status-rail {
  display: grid;
  grid-template-columns: repeat(3, minmax(0,1fr));
  gap: .75rem;
}
#tacticalOpsRoot .t-wt-status-card {
  padding: .9rem 1rem;
  display: flex;
  flex-direction: column;
  gap: .28rem;
}
#tacticalOpsRoot .t-wt-status-card strong {
  font-size: 1.1rem;
  letter-spacing: .06em;
  color: #eef9ff;
}
#tacticalOpsRoot .t-wt-status-card small {
  color: var(--t-muted);
  line-height: 1.45;
}
#tacticalOpsRoot .t-wt-status-card .t-progress { margin-top: .35rem; }
#tacticalOpsRoot .t-wt-feature {
  display: grid;
  grid-template-columns: minmax(120px, 180px) minmax(0,1fr) auto;
  gap: 1rem;
  align-items: center;
  padding: .85rem;
}
#tacticalOpsRoot .t-wt-feature-art {
  height: 110px;
  overflow: hidden;
  border: 1px solid #67cff24d;
  border-radius: 6px;
  background: #071019;
}
#tacticalOpsRoot .t-wt-feature-art img,
#tacticalOpsRoot .t-wt-mission-art img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 0% 50%;
  display: block;
}
#tacticalOpsRoot .t-wt-feature-copy h2 {
  margin: .25rem 0 .35rem;
  font-size: clamp(1.35rem, 4vw, 1.9rem);
}
#tacticalOpsRoot .t-wt-feature-copy p {
  margin: 0;
  color: var(--t-muted);
  line-height: 1.45;
}
#tacticalOpsRoot .t-wt-main-cta,
#tacticalOpsRoot .t-wt-mission-cta .t-btn {
  min-height: 50px;
  min-width: 190px;
  background: linear-gradient(180deg, rgba(52,189,255,.34), rgba(22,77,108,.55));
  border-color: #70d7ff;
  box-shadow: inset 0 0 0 1px rgba(178,237,255,.1), 0 0 18px rgba(50,165,219,.16);
}
#tacticalOpsRoot .t-wt-main-cta:hover:not(:disabled),
#tacticalOpsRoot .t-wt-mission-cta .t-btn:hover:not(:disabled) {
  background: linear-gradient(180deg, rgba(66,198,255,.42), rgba(26,93,130,.72));
}
#tacticalOpsRoot .t-wt-section,
#tacticalOpsRoot .t-wt-how,
#tacticalOpsRoot .t-pack-mastery-premium,
#tacticalOpsRoot .t-wt-footer-strip,
#tacticalOpsRoot .t-wt-legacy-run {
  padding: 1rem;
}
#tacticalOpsRoot .t-wt-section-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: .75rem;
  margin-bottom: .8rem;
}
#tacticalOpsRoot .t-wt-section-head .t-title {
  margin: 0;
  font-size: 1.2rem;
}
#tacticalOpsRoot .t-wt-section-head span {
  color: #90daf7;
  font-size: .72rem;
  letter-spacing: .16em;
}
#tacticalOpsRoot .t-wt-mission-list {
  display: flex;
  flex-direction: column;
  gap: .8rem;
}
#tacticalOpsRoot .t-wt-mission-card {
  display: grid;
  grid-template-columns: 176px minmax(0,1fr) auto;
  gap: .9rem;
  padding: .8rem;
  align-items: stretch;
}
#tacticalOpsRoot .t-wt-mission-art {
  min-height: 142px;
  border: 1px solid #5fc6e84a;
  border-radius: 6px;
  overflow: hidden;
  background: #071019;
}
#tacticalOpsRoot .t-wt-mission-head {
  display: flex;
  justify-content: space-between;
  gap: .8rem;
  align-items: flex-start;
}
#tacticalOpsRoot .t-wt-mission-head h3 {
  margin: 0 0 .25rem !important;
  font-size: clamp(1.15rem, 4vw, 1.55rem);
  letter-spacing: .04em;
}
#tacticalOpsRoot .t-wt-mission-head p { margin: 0 !important; }
#tacticalOpsRoot .t-wt-mission-state {
  white-space: nowrap;
  color: #9df0ff;
  font-size: .68rem;
  letter-spacing: .15em;
  border: 1px solid #66d6ff55;
  background: rgba(11,31,45,.9);
  border-radius: 999px;
  padding: .42rem .62rem;
}
#tacticalOpsRoot .t-wt-mission-card.is-cleared .t-wt-mission-state {
  color: #bfeecf;
  border-color: #83d6a466;
  background: rgba(17,43,34,.9);
}
#tacticalOpsRoot .t-wt-rewards-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0,1fr));
  gap: .6rem;
  margin-top: .8rem;
}
#tacticalOpsRoot .t-wt-reward-block {
  border: 1px solid #61c7eb2f;
  background: rgba(10,25,38,.88);
  border-radius: 6px;
  padding: .65rem .75rem;
}
#tacticalOpsRoot .t-wt-reward-block strong {
  display: block;
  margin-top: .28rem;
  color: #dff8ff;
  font-size: .92rem;
  letter-spacing: .06em;
}
#tacticalOpsRoot .t-wt-reward-block small { color: var(--t-muted); display: block; margin-top: .24rem; }
#tacticalOpsRoot .t-wt-card-detail { margin-top: .7rem; }
#tacticalOpsRoot .t-wt-mission-cta {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
#tacticalOpsRoot .t-wt-how-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0,1fr));
  gap: .7rem;
}
#tacticalOpsRoot .t-wt-how-step {
  border: 1px solid #5fc7eb33;
  background: rgba(9,22,34,.72);
  border-radius: 6px;
  padding: .8rem;
}
#tacticalOpsRoot .t-wt-how-step strong {
  display: block;
  color: #dff8ff;
  font-size: .84rem;
  letter-spacing: .08em;
}
#tacticalOpsRoot .t-wt-how-step p {
  margin: .45rem 0 0;
  color: var(--t-muted);
  font-size: .8rem;
  line-height: 1.45;
}
#tacticalOpsRoot .t-pack-head {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-end;
  margin-bottom: .85rem;
}
#tacticalOpsRoot .t-pack-head .t-title { margin: 0; font-size: 1.2rem; }
#tacticalOpsRoot .t-pack-head p,
#tacticalOpsRoot .t-pack-head small { margin: .3rem 0 0; color: var(--t-muted); line-height: 1.45; }
#tacticalOpsRoot .t-pack-list {
  display: flex;
  flex-direction: column;
  gap: .75rem;
}
#tacticalOpsRoot .t-mastery-premium-row {
  display: grid;
  grid-template-columns: 84px minmax(0,1fr);
  gap: .9rem;
  padding: .8rem 0;
}
#tacticalOpsRoot .t-mastery-premium-row:last-child { border-bottom: 0; }
#tacticalOpsRoot .t-mastery-avatar {
  width: 84px;
  min-height: 84px;
  border-radius: 8px;
  border: 1px solid #68cff25c;
  background: linear-gradient(180deg, rgba(18,39,57,.95), rgba(9,18,28,.98));
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ccefff;
  font-size: .82rem;
  letter-spacing: .12em;
}
#tacticalOpsRoot .t-mastery-main { min-width: 0; }
#tacticalOpsRoot .t-mastery-topline {
  display: flex;
  justify-content: space-between;
  gap: .8rem;
  align-items: flex-start;
}
#tacticalOpsRoot .t-mastery-topline strong {
  display: block;
  font-size: 1.1rem;
  letter-spacing: .06em;
  color: #eef9ff;
}
#tacticalOpsRoot .t-mastery-topline span {
  display: block;
  color: var(--t-muted);
  font-size: .72rem;
  letter-spacing: .08em;
  margin-top: .2rem;
}
#tacticalOpsRoot .t-mastery-status { text-align: right; }
#tacticalOpsRoot .t-mastery-status b {
  display: block;
  margin-top: .25rem;
  color: #dff8ff;
  font-size: .86rem;
}
#tacticalOpsRoot .t-mastery-progressline { margin-top: .55rem; }
#tacticalOpsRoot .t-mastery-progressline small { color: var(--t-muted); }
#tacticalOpsRoot .t-mastery-summary-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0,1fr));
  gap: .6rem;
  margin: .65rem 0;
}
#tacticalOpsRoot .t-mastery-summary-card {
  border: 1px solid #5fc7eb30;
  border-radius: 6px;
  background: rgba(9,22,34,.72);
  padding: .68rem .75rem;
}
#tacticalOpsRoot .t-mastery-summary-card strong {
  display: block;
  margin-top: .25rem;
  color: #e3f9ff;
  font-size: .84rem;
}
#tacticalOpsRoot .t-mastery-summary-card small { display: block; margin-top: .25rem; color: var(--t-muted); }
#tacticalOpsRoot .t-mastery-detail { margin-top: .3rem; }
#tacticalOpsRoot .t-wt-footer-strip {
  display: grid;
  grid-template-columns: repeat(3, minmax(0,1fr));
  gap: .8rem;
  align-items: center;
}
#tacticalOpsRoot .t-wt-footer-strip strong,
#tacticalOpsRoot .t-wt-legacy-run strong { display: block; margin-top: .28rem; }
#tacticalOpsRoot .t-wt-footer-actions {
  display: flex;
  justify-content: flex-end;
}
#tacticalOpsRoot .t-wt-legacy-run p { color: var(--t-muted); line-height: 1.45; }
#tacticalOpsRoot .t-wt-last-result,
#tacticalOpsRoot .t-wt-archive {
  margin-top: .15rem;
}
#tacticalOpsRoot .t-wt-canon-grid {
  margin-top: .8rem;
}
@media (max-width: 860px) {
  #tacticalOpsRoot .t-wt-status-rail,
  #tacticalOpsRoot .t-wt-how-grid,
  #tacticalOpsRoot .t-wt-footer-strip,
  #tacticalOpsRoot .t-mastery-summary-grid {
    grid-template-columns: 1fr;
  }
  #tacticalOpsRoot .t-wt-feature,
  #tacticalOpsRoot .t-wt-mission-card,
  #tacticalOpsRoot .t-mastery-premium-row,
  #tacticalOpsRoot .t-wt-hero {
    grid-template-columns: 1fr;
  }
  #tacticalOpsRoot .t-wt-mission-cta,
  #tacticalOpsRoot .t-wt-footer-actions,
  #tacticalOpsRoot .t-wt-feature-cta {
    justify-content: stretch;
  }
  #tacticalOpsRoot .t-wt-main-cta,
  #tacticalOpsRoot .t-wt-mission-cta .t-btn {
    width: 100%;
    min-width: 0;
  }
  #tacticalOpsRoot .t-pack-head,
  #tacticalOpsRoot .t-mastery-topline,
  #tacticalOpsRoot .t-wt-mission-head {
    flex-direction: column;
    align-items: flex-start;
  }
  #tacticalOpsRoot .t-mastery-status {
    text-align: left;
  }
}
@media (max-width: 520px) {
  #tacticalOpsRoot .t-brief.t-war-table-premium {
    padding-inline: max(.7rem, env(safe-area-inset-left));
  }
  #tacticalOpsRoot .t-wt-section,
  #tacticalOpsRoot .t-wt-how,
  #tacticalOpsRoot .t-pack-mastery-premium,
  #tacticalOpsRoot .t-wt-footer-strip,
  #tacticalOpsRoot .t-wt-legacy-run,
  #tacticalOpsRoot .t-wt-hero {
    padding: .85rem;
  }
  #tacticalOpsRoot .t-wt-title {
    font-size: clamp(1.9rem, 10vw, 2.8rem);
  }
}


/* Tactical Ops v2.9 — playable-loop clarity pass */
#tacticalOpsRoot .t-war-table-v29 {
  gap: .72rem;
}
#tacticalOpsRoot .t-war-table-v29 .t-panel {
  background: linear-gradient(180deg, rgba(7,17,27,.96), rgba(6,13,21,.98));
}
#tacticalOpsRoot .t-wt-hero-compact {
  grid-template-columns: minmax(0,1fr) auto;
  min-height: 0;
  padding: .92rem 1rem;
  align-items: center;
}
#tacticalOpsRoot .t-wt-hero-compact::after { display:none; }
#tacticalOpsRoot .t-wt-hero-compact .t-wt-title {
  font-size: clamp(1.9rem, 7vw, 3rem);
  margin-bottom: .18rem;
}
#tacticalOpsRoot .t-wt-hero-compact .t-wt-intro {
  font-size: .86rem;
  color: #c4dbe5;
}
#tacticalOpsRoot .t-wt-refresh {
  border: 1px solid #65cbed45;
  background: rgba(8,23,34,.72);
  color: #a8dced;
  border-radius: 5px;
  font: inherit;
  font-size: .61rem;
  letter-spacing: .13em;
  padding: .65rem .72rem;
}
#tacticalOpsRoot .t-wt-refresh:disabled { opacity:.45; }

#tacticalOpsRoot .t-wt-status-rail-v29 {
  grid-template-columns: repeat(3,minmax(0,1fr));
  gap: .6rem;
}
#tacticalOpsRoot .t-wt-status-rail-v29 .t-wt-status-card {
  min-height: 92px;
  padding: .76rem .82rem;
  justify-content: center;
}
#tacticalOpsRoot .t-wt-status-rail-v29 .t-wt-status-card strong {
  font-size: 1rem;
}
#tacticalOpsRoot .t-wt-status-rail-v29 .t-wt-status-card small {
  font-size: .67rem;
  line-height: 1.35;
}
#tacticalOpsRoot .t-wt-pressure-card.is-high {
  border-color: rgba(232,103,80,.52);
  background: linear-gradient(180deg, rgba(42,18,18,.93), rgba(17,12,15,.98));
}
#tacticalOpsRoot .t-wt-pressure-card.is-high strong { color:#ff9a86; }
#tacticalOpsRoot .t-wt-pressure-card.is-reduced,
#tacticalOpsRoot .t-wt-pressure-card.is-clear {
  border-color: rgba(101,208,171,.5);
}
#tacticalOpsRoot .t-wt-pressure-card.is-reduced strong,
#tacticalOpsRoot .t-wt-pressure-card.is-clear strong { color:#a6eccd; }

#tacticalOpsRoot .t-wt-next-op {
  grid-template-columns: 150px minmax(0,1fr) auto;
  padding: .72rem;
  border-color: rgba(102,218,255,.66)!important;
  box-shadow: 0 0 0 1px rgba(102,218,255,.08), 0 12px 34px rgba(0,0,0,.34)!important;
}
#tacticalOpsRoot .t-wt-next-op .t-wt-feature-art { height: 122px; }
#tacticalOpsRoot .t-wt-next-op h2 {
  font-size: clamp(1.45rem,5vw,2rem);
  margin:.15rem 0 .2rem;
}
#tacticalOpsRoot .t-wt-objective {
  color:#e5f5fb!important;
  font-size:.9rem;
}
#tacticalOpsRoot .t-wt-reward-chips {
  display:flex;
  flex-wrap:wrap;
  gap:.4rem;
  margin-top:.65rem;
}
#tacticalOpsRoot .t-wt-reward-chips span {
  border:1px solid rgba(95,199,235,.3);
  background:rgba(10,27,39,.78);
  border-radius:999px;
  padding:.34rem .5rem;
  color:#aebfca;
  font-size:.62rem;
  white-space:nowrap;
}
#tacticalOpsRoot .t-wt-reward-chips b { color:#dff8ff; }
#tacticalOpsRoot .t-wt-reward-chips .is-earned {
  color:#9fd8b5;
  border-color:rgba(116,208,150,.38);
}
#tacticalOpsRoot .t-wt-main-cta { min-width:165px; }

#tacticalOpsRoot .t-wt-legacy-run {
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:.8rem;
  padding:.75rem .9rem;
  border-color:rgba(243,187,90,.38)!important;
}
#tacticalOpsRoot .t-wt-legacy-run p {
  margin:.25rem 0 0;
  font-size:.72rem;
}

#tacticalOpsRoot .t-wt-current-ops {
  padding:.88rem;
}
#tacticalOpsRoot .t-wt-current-ops .t-wt-section-head {
  margin-bottom:.64rem;
}
#tacticalOpsRoot .t-wt-current-ops .t-wt-section-head .t-title {
  margin-top:.12rem;
}
#tacticalOpsRoot .t-wt-mission-list { gap:.58rem; }
#tacticalOpsRoot .t-wt-current-ops .t-wt-mission-card {
  grid-template-columns: 132px minmax(0,1fr) 142px;
  gap:.7rem;
  padding:.65rem;
  align-items:center;
}
#tacticalOpsRoot .t-wt-current-ops .t-wt-mission-art {
  min-height:112px;
  position:relative;
}
#tacticalOpsRoot .t-wt-mission-type {
  position:absolute;
  left:.45rem;
  bottom:.42rem;
  padding:.25rem .4rem;
  border:1px solid rgba(119,218,255,.5);
  background:rgba(3,14,22,.86);
  color:#b8edff;
  font-size:.55rem;
  letter-spacing:.12em;
}
#tacticalOpsRoot .t-wt-current-ops .t-wt-mission-head h3 {
  font-size:1.16rem;
}
#tacticalOpsRoot .t-wt-current-ops .t-wt-mission-head p {
  color:#d5e5eb;
  font-size:.77rem;
  line-height:1.35;
}
#tacticalOpsRoot .t-wt-current-ops .t-wt-mission-state {
  padding:.3rem .46rem;
  font-size:.57rem;
}
#tacticalOpsRoot .t-wt-mission-meta {
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:.4rem;
  margin-top:.5rem;
}
#tacticalOpsRoot .t-wt-mission-meta span {
  border-left:2px solid rgba(95,199,235,.45);
  background:rgba(9,23,34,.72);
  padding:.42rem .5rem;
  color:#a9b9c4;
  font-size:.62rem;
  line-height:1.35;
}
#tacticalOpsRoot .t-wt-mission-meta b {
  color:#dff7ff;
  margin-right:.2rem;
}
#tacticalOpsRoot .t-wt-mission-meta .is-earned {
  border-left-color:rgba(115,211,151,.58);
  color:#9dd3b1;
}
#tacticalOpsRoot .t-wt-current-ops .t-wt-card-detail {
  margin-top:.45rem;
}
#tacticalOpsRoot .t-wt-current-ops .t-wt-card-detail summary {
  font-size:.65rem;
}
#tacticalOpsRoot .t-wt-current-ops .t-wt-card-detail p {
  font-size:.7rem!important;
}
#tacticalOpsRoot .t-wt-current-ops .t-wt-mission-cta .t-btn {
  min-width:0;
  width:100%;
  min-height:44px;
}

#tacticalOpsRoot .t-pack-mastery-v29 {
  padding:.88rem;
}
#tacticalOpsRoot .t-pack-mastery-v29 .t-pack-head {
  margin-bottom:.55rem;
}
#tacticalOpsRoot .t-pack-mastery-v29 .t-pack-head p {
  font-size:.75rem;
}
#tacticalOpsRoot .t-pack-mastery-v29 .t-pack-head > small {
  font-size:.64rem;
}
#tacticalOpsRoot .t-pack-mastery-v29 .t-pack-list {
  display:grid;
  grid-template-columns:repeat(3,minmax(0,1fr));
  gap:.55rem;
}
#tacticalOpsRoot .t-mastery-card-v29 {
  grid-template-columns:48px minmax(0,1fr);
  gap:.55rem;
  padding:.62rem;
  border:1px solid rgba(95,199,235,.25);
  border-radius:6px;
  background:rgba(8,21,31,.74);
}
#tacticalOpsRoot .t-mastery-card-v29 .t-mastery-avatar {
  width:48px;
  min-height:48px;
  height:48px;
  font-size:.64rem;
}
#tacticalOpsRoot .t-mastery-card-v29 .t-mastery-topline strong {
  font-size:.88rem;
}
#tacticalOpsRoot .t-mastery-card-v29 .t-mastery-topline span {
  font-size:.58rem;
}
#tacticalOpsRoot .t-mastery-card-v29 .t-mastery-status b {
  font-size:.67rem;
}
#tacticalOpsRoot .t-mastery-card-v29 .t-mastery-progressline {
  margin-top:.35rem;
}
#tacticalOpsRoot .t-mastery-now-next {
  display:grid;
  grid-template-columns:1fr;
  gap:.42rem;
  margin-top:.42rem;
}
#tacticalOpsRoot .t-mastery-now-next > div {
  border-left:2px solid rgba(95,199,235,.35);
  padding-left:.45rem;
}
#tacticalOpsRoot .t-mastery-now-next strong,
#tacticalOpsRoot .t-mastery-now-next small {
  display:block;
}
#tacticalOpsRoot .t-mastery-now-next strong {
  margin-top:.16rem;
  color:#e3f8ff;
  font-size:.69rem;
}
#tacticalOpsRoot .t-mastery-now-next small {
  margin-top:.15rem;
  font-size:.6rem;
  color:#97a9b6;
  line-height:1.32;
}
#tacticalOpsRoot .t-mastery-card-v29 .t-mastery-detail {
  margin-top:.45rem;
}
#tacticalOpsRoot .t-mastery-card-v29 .t-mastery-detail summary {
  font-size:.62rem;
}
#tacticalOpsRoot .t-mastery-locked,
#tacticalOpsRoot .t-pack-pet-note {
  display:block;
  margin-top:.45rem;
  color:#a8b8c2;
  font-size:.62rem;
}

#tacticalOpsRoot .t-wt-story-archive {
  padding:.78rem .9rem;
}
#tacticalOpsRoot .t-wt-story-archive > summary {
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:.8rem;
  cursor:pointer;
  list-style:none;
}
#tacticalOpsRoot .t-wt-story-archive > summary::-webkit-details-marker { display:none; }
#tacticalOpsRoot .t-wt-story-archive > summary span strong {
  display:block;
  margin-top:.18rem;
  color:#e6f5fa;
  letter-spacing:.05em;
}
#tacticalOpsRoot .t-wt-story-archive > summary > b {
  color:#9ed8b4;
  font-size:.63rem;
  letter-spacing:.12em;
}
#tacticalOpsRoot .t-wt-story-archive > p {
  color:#9fb0bb;
  font-size:.72rem;
  margin:.65rem 0 0;
}
#tacticalOpsRoot .t-wt-story-archive .t-wt-canon-grid {
  grid-template-columns:repeat(3,minmax(0,1fr));
}
#tacticalOpsRoot .t-story-mission {
  display:grid;
  gap:.35rem;
  padding:.65rem;
}
#tacticalOpsRoot .t-story-mission small { color:#98aab5; }
#tacticalOpsRoot .t-story-mission .t-btn { margin-top:.25rem; }
#tacticalOpsRoot .t-wt-secondary-detail {
  opacity:.85;
  font-size:.72rem;
}

@media (max-width: 860px) {
  #tacticalOpsRoot .t-wt-next-op,
  #tacticalOpsRoot .t-wt-current-ops .t-wt-mission-card {
    grid-template-columns:1fr;
  }
  #tacticalOpsRoot .t-wt-next-op .t-wt-feature-art {
    height:150px;
  }
  #tacticalOpsRoot .t-wt-current-ops .t-wt-mission-art {
    min-height:128px;
  }
  #tacticalOpsRoot .t-pack-mastery-v29 .t-pack-list {
    grid-template-columns:1fr;
  }
  #tacticalOpsRoot .t-mastery-card-v29 {
    grid-template-columns:54px minmax(0,1fr);
  }
}
@media (max-width: 620px) {
  #tacticalOpsRoot .t-wt-status-rail-v29 {
    grid-template-columns:repeat(3,minmax(0,1fr));
    gap:.35rem;
  }
  #tacticalOpsRoot .t-wt-status-rail-v29 .t-wt-status-card {
    padding:.55rem .5rem;
    min-height:84px;
  }
  #tacticalOpsRoot .t-wt-status-rail-v29 .t-wt-status-card .t-kicker {
    font-size:.5rem;
  }
  #tacticalOpsRoot .t-wt-status-rail-v29 .t-wt-status-card strong {
    font-size:.76rem;
  }
  #tacticalOpsRoot .t-wt-status-rail-v29 .t-wt-status-card small {
    font-size:.54rem;
  }
  #tacticalOpsRoot .t-wt-status-rail-v29 .t-progress {
    margin:.35rem 0 .25rem;
  }
  #tacticalOpsRoot .t-wt-hero-compact {
    grid-template-columns:1fr auto;
    padding:.78rem;
  }
  #tacticalOpsRoot .t-wt-refresh {
    padding:.52rem;
    font-size:.52rem;
  }
  #tacticalOpsRoot .t-wt-reward-chips {
    display:grid;
    grid-template-columns:1fr;
  }
  #tacticalOpsRoot .t-wt-mission-meta {
    grid-template-columns:1fr;
  }
  #tacticalOpsRoot .t-wt-story-archive .t-wt-canon-grid {
    grid-template-columns:1fr;
  }
}


/* Tactical Ops v2.9 — mission brief clarity pass */
#tacticalOpsRoot .t-deployment-v29 {
  gap:.68rem;
}
#tacticalOpsRoot .t-deploy-hero-v29 {
  min-height:185px;
  padding:1rem;
  display:flex;
  align-items:flex-end;
  position:relative;
  overflow:hidden;
}
#tacticalOpsRoot .t-deploy-hero-v29 > img {
  position:absolute;
  inset:0;
  width:100%;
  height:100%;
  object-fit:cover;
  object-position:0% 50%;
}
#tacticalOpsRoot .t-deploy-hero-v29::after {
  content:"";
  position:absolute;
  inset:0;
  background:linear-gradient(90deg,rgba(5,12,19,.96) 0%,rgba(5,12,19,.68) 52%,rgba(5,12,19,.26) 100%);
}
#tacticalOpsRoot .t-deploy-hero-copy {
  position:relative;
  z-index:2;
  max-width:72%;
}
#tacticalOpsRoot .t-deploy-hero-copy .t-title {
  margin:.18rem 0 .2rem;
  font-size:clamp(1.9rem,6vw,3rem);
}
#tacticalOpsRoot .t-deploy-hero-copy p {
  margin:0;
  color:#d6e7ed;
  font-size:.88rem;
  line-height:1.42;
}
#tacticalOpsRoot .t-deploy-rotation {
  position:absolute;
  z-index:3;
  right:.8rem;
  top:.8rem;
  border:1px solid rgba(244,190,88,.45);
  background:rgba(23,18,8,.86);
  padding:.55rem .65rem;
  text-align:right;
}
#tacticalOpsRoot .t-deploy-rotation strong {
  display:block;
  margin-top:.18rem;
  color:#f4c96d;
  font-size:.72rem;
}

#tacticalOpsRoot .t-deploy-overview {
  display:grid;
  grid-template-columns:1.5fr repeat(3,minmax(0,.85fr));
  gap:.55rem;
  padding:.75rem;
}
#tacticalOpsRoot .t-deploy-summary-main,
#tacticalOpsRoot .t-deploy-summary-card {
  border:1px solid rgba(95,199,235,.22);
  background:rgba(8,22,32,.72);
  padding:.7rem;
}
#tacticalOpsRoot .t-deploy-summary-main strong,
#tacticalOpsRoot .t-deploy-summary-card strong {
  display:block;
  margin-top:.24rem;
  color:#e7f7fc;
  letter-spacing:.04em;
}
#tacticalOpsRoot .t-deploy-summary-main strong {
  font-size:1.05rem;
}
#tacticalOpsRoot .t-deploy-summary-main p,
#tacticalOpsRoot .t-deploy-summary-card small {
  display:block;
  margin:.35rem 0 0;
  color:#9eafb9;
  font-size:.67rem;
  line-height:1.38;
}
#tacticalOpsRoot .t-deploy-pressure.is-high {
  border-color:rgba(232,103,80,.4);
}
#tacticalOpsRoot .t-deploy-pressure.is-high strong { color:#ff9a86; }
#tacticalOpsRoot .t-deploy-pressure.is-reduced,
#tacticalOpsRoot .t-deploy-pressure.is-clear {
  border-color:rgba(101,208,171,.4);
}
#tacticalOpsRoot .t-deploy-pressure.is-reduced strong,
#tacticalOpsRoot .t-deploy-pressure.is-clear strong { color:#a6eccd; }

#tacticalOpsRoot .t-deploy-squad {
  padding:.8rem;
}
#tacticalOpsRoot .t-deploy-squad .t-wt-section-head {
  margin-bottom:.55rem;
}
#tacticalOpsRoot .t-deploy-squad .t-title {
  margin:.12rem 0 0;
  font-size:1.08rem;
}
#tacticalOpsRoot .t-squad-preview-v29 {
  border-top:1px solid rgba(95,199,235,.16);
  border-bottom:1px solid rgba(95,199,235,.16);
  padding:.6rem 0;
  margin:0 0 .6rem;
}
#tacticalOpsRoot .t-squad-preview-v29 > div {
  width:68px;
}
#tacticalOpsRoot .t-squad-preview-v29 img {
  width:68px;
  height:58px;
}
#tacticalOpsRoot .t-deploy-squad-picker p {
  margin:.25rem 0 .5rem;
  color:#9fb0bb;
  font-size:.7rem;
}
#tacticalOpsRoot .t-deploy-squad-picker .t-brief-actions {
  display:grid;
  grid-template-columns:repeat(3,minmax(0,1fr));
  gap:.45rem;
}
#tacticalOpsRoot .t-deploy-squad-picker .t-btn {
  min-height:52px;
  font-size:.66rem;
}
#tacticalOpsRoot .t-deploy-squad-picker .t-btn small {
  font-size:.52rem;
  color:#91a6b3;
}

#tacticalOpsRoot .t-deploy-rules,
#tacticalOpsRoot .t-deploy-depth {
  padding:.78rem .85rem;
}
#tacticalOpsRoot .t-deploy-rules > summary,
#tacticalOpsRoot .t-deploy-depth > summary {
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:.7rem;
  cursor:pointer;
  list-style:none;
}
#tacticalOpsRoot .t-deploy-rules > summary::-webkit-details-marker,
#tacticalOpsRoot .t-deploy-depth > summary::-webkit-details-marker { display:none; }
#tacticalOpsRoot .t-deploy-rules > summary span strong,
#tacticalOpsRoot .t-deploy-depth > summary span strong {
  display:block;
  margin-top:.18rem;
  color:#e3f5fa;
}
#tacticalOpsRoot .t-deploy-rules > summary > b,
#tacticalOpsRoot .t-deploy-depth > summary > b {
  color:#9bdcf4;
  font-size:.62rem;
  letter-spacing:.08em;
}
#tacticalOpsRoot .t-condition-v29 {
  margin-top:.55rem;
  border-left:2px solid rgba(95,199,235,.38);
  background:rgba(8,20,29,.62);
  padding:.55rem .65rem;
}
#tacticalOpsRoot .t-condition-v29 strong {
  display:block;
  color:#dff6ff;
  font-size:.68rem;
}
#tacticalOpsRoot .t-condition-v29 p {
  margin:.25rem 0 0;
  color:#9eafb9;
  font-size:.68rem;
  line-height:1.4;
}
#tacticalOpsRoot .t-deploy-tip,
#tacticalOpsRoot .t-deploy-resume {
  margin:.6rem 0 0;
  color:#aebdc6;
  font-size:.68rem;
  line-height:1.42;
}
#tacticalOpsRoot .t-deployment-options-v29 {
  margin-top:.65rem;
  padding:.65rem;
  background:rgba(7,18,26,.7);
}
#tacticalOpsRoot .t-deployment-options-v29 .t-kicker {
  margin-top:.5rem;
}
#tacticalOpsRoot .t-deployment-options-v29 small {
  display:block;
  margin-top:.35rem;
  color:#9eafb9;
  font-size:.64rem;
}
#tacticalOpsRoot .t-deployment-options-v29 .t-brief-actions {
  margin-top:.35rem;
}

#tacticalOpsRoot .t-deploy-depth .t-pack-mastery-v29 {
  margin-top:.65rem;
}
#tacticalOpsRoot .t-sidegrade-card {
  margin-top:.55rem;
}
#tacticalOpsRoot .t-sidegrade-card small {
  display:block;
  margin-top:.4rem;
  color:#9eafb9;
}
#tacticalOpsRoot .t-deploy-actions-v29 {
  position:sticky;
  bottom:max(.5rem,env(safe-area-inset-bottom));
  z-index:20;
  display:grid;
  grid-template-columns:110px minmax(0,1fr);
  gap:.55rem;
  padding:.55rem;
  border:1px solid rgba(95,199,235,.28);
  background:rgba(5,13,20,.94);
  backdrop-filter:blur(10px);
  box-shadow:0 -8px 26px rgba(0,0,0,.3);
}
#tacticalOpsRoot .t-deploy-actions-v29 .t-btn {
  min-height:50px;
}
#tacticalOpsRoot .t-deploy-actions-v29 .t-btn-primary {
  font-size:.78rem;
  letter-spacing:.12em;
}

@media (max-width:860px) {
  #tacticalOpsRoot .t-deploy-overview {
    grid-template-columns:1fr 1fr;
  }
  #tacticalOpsRoot .t-deploy-summary-main {
    grid-column:1 / -1;
  }
}
@media (max-width:620px) {
  #tacticalOpsRoot .t-deploy-hero-v29 {
    min-height:170px;
    padding:.78rem;
  }
  #tacticalOpsRoot .t-deploy-hero-copy {
    max-width:100%;
    padding-top:2.5rem;
  }
  #tacticalOpsRoot .t-deploy-rotation {
    right:.55rem;
    top:.55rem;
    padding:.42rem .5rem;
  }
  #tacticalOpsRoot .t-deploy-overview {
    grid-template-columns:1fr 1fr;
    padding:.6rem;
    gap:.4rem;
  }
  #tacticalOpsRoot .t-deploy-summary-main {
    grid-column:1 / -1;
  }
  #tacticalOpsRoot .t-deploy-summary-card {
    padding:.55rem;
  }
  #tacticalOpsRoot .t-deploy-summary-card strong {
    font-size:.76rem;
  }
  #tacticalOpsRoot .t-deploy-summary-card small {
    font-size:.56rem;
  }
  #tacticalOpsRoot .t-deploy-squad-picker .t-brief-actions {
    grid-template-columns:1fr;
  }
  #tacticalOpsRoot .t-deploy-actions-v29 {
    grid-template-columns:84px minmax(0,1fr);
  }
}


/* Tactical Ops v3.0A — rotation spine clarity */
#tacticalOpsRoot .t-wt-front {
  padding:.82rem .9rem;
  display:grid;
  gap:.62rem;
  border-color:rgba(244,201,109,.34);
}
#tacticalOpsRoot .t-wt-front-head {
  display:flex;
  align-items:flex-end;
  justify-content:space-between;
  gap:.8rem;
}
#tacticalOpsRoot .t-wt-front-head strong {
  display:block;
  margin-top:.12rem;
  color:#f2f9fc;
  font-size:1.18rem;
  letter-spacing:.07em;
}
#tacticalOpsRoot .t-wt-front-meta {
  display:flex;
  gap:.65rem;
  flex-wrap:wrap;
  justify-content:flex-end;
  color:#a9bac5;
  font-size:.64rem;
  text-transform:uppercase;
  letter-spacing:.06em;
}
#tacticalOpsRoot .t-wt-front-list {
  display:grid;
  grid-template-columns:repeat(3,minmax(0,1fr));
  gap:.45rem;
}
#tacticalOpsRoot .t-wt-front-row {
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:.55rem;
  min-width:0;
  padding:.5rem .58rem;
  border:1px solid rgba(95,199,235,.18);
  background:rgba(8,21,31,.72);
}
#tacticalOpsRoot .t-wt-front-row span {
  min-width:0;
  color:#d8e8ee;
  font-size:.69rem;
  line-height:1.25;
}
#tacticalOpsRoot .t-wt-front-row b {
  flex:0 0 auto;
  color:#f0c873;
  font-size:.54rem;
  letter-spacing:.08em;
}
#tacticalOpsRoot .t-wt-front-row b.is-secured {
  color:#9dd3b1;
}
@media (max-width:620px) {
  #tacticalOpsRoot .t-wt-front-head {
    align-items:flex-start;
    flex-direction:column;
    gap:.35rem;
  }
  #tacticalOpsRoot .t-wt-front-meta {
    justify-content:flex-start;
  }
  #tacticalOpsRoot .t-wt-front-list {
    grid-template-columns:1fr;
  }
}


/* Tactical Ops v3.1 — premium presentation pass */
#tacticalOpsRoot .t-war-table-v29 {
  position:relative;
}
#tacticalOpsRoot .t-wt-hero-compact {
  overflow:hidden;
  border-color:rgba(107,211,244,.34);
  background:
    linear-gradient(90deg,rgba(5,15,24,.98),rgba(7,18,28,.9) 58%,rgba(16,27,36,.78)),
    url("/images/tactical_ops/presentation/tactical_ops_start_hero_backdrop.png") center 42%/cover no-repeat !important;
  box-shadow:0 18px 42px rgba(0,0,0,.28), inset 0 1px 0 rgba(185,235,255,.04);
}
#tacticalOpsRoot .t-wt-hero-compact::before {
  content:"";
  position:absolute;
  inset:0;
  pointer-events:none;
  background:
    linear-gradient(120deg,transparent 0 62%,rgba(88,205,244,.07) 62% 63%,transparent 63%),
    radial-gradient(circle at 82% 28%,rgba(97,211,248,.11),transparent 33%);
}
#tacticalOpsRoot .t-wt-hero-compact > * { position:relative; z-index:1; }

#tacticalOpsRoot .t-wt-front {
  position:relative;
  overflow:hidden;
  background:
    linear-gradient(180deg,rgba(15,20,24,.96),rgba(6,15,22,.98)) !important;
  box-shadow:0 10px 28px rgba(0,0,0,.24);
}
#tacticalOpsRoot .t-wt-front::before {
  content:"";
  position:absolute;
  inset:0;
  pointer-events:none;
  background:
    linear-gradient(90deg,rgba(224,178,80,.08),transparent 30%),
    repeating-linear-gradient(135deg,transparent 0 18px,rgba(255,255,255,.018) 18px 19px);
}
#tacticalOpsRoot .t-wt-front > * { position:relative; z-index:1; }
#tacticalOpsRoot .t-wt-front-row {
  transition:border-color .15s ease, transform .15s ease, background .15s ease;
}
#tacticalOpsRoot .t-wt-front-row:has(.is-secured) {
  border-color:rgba(107,206,147,.28);
  background:linear-gradient(90deg,rgba(13,43,31,.64),rgba(8,21,31,.76));
}

#tacticalOpsRoot .t-wt-feature-art,
#tacticalOpsRoot .t-wt-mission-art {
  overflow:hidden;
  border:1px solid rgba(134,224,255,.17);
  background:#07131c;
}
#tacticalOpsRoot .t-wt-feature-art::after,
#tacticalOpsRoot .t-wt-mission-art::after {
  content:"";
  position:absolute;
  inset:0;
  pointer-events:none;
  background:linear-gradient(180deg,transparent 35%,rgba(3,10,16,.78) 100%);
}
#tacticalOpsRoot .t-wt-feature-art {
  position:relative;
}
#tacticalOpsRoot .t-wt-feature-art img,
#tacticalOpsRoot .t-wt-mission-art img {
  width:100%;
  height:100%;
  object-fit:cover;
  filter:saturate(.92) contrast(1.08);
  transform:scale(1.015);
}
#tacticalOpsRoot .t-wt-art-label {
  position:absolute;
  z-index:2;
  left:.55rem;
  bottom:.48rem;
  border-left:2px solid rgba(157,227,251,.72);
  background:rgba(4,13,20,.78);
  padding:.28rem .46rem;
  color:#def8ff;
  font-size:.52rem;
  letter-spacing:.14em;
  text-transform:uppercase;
}

#tacticalOpsRoot .t-wt-mission-card,
#tacticalOpsRoot .t-wt-next-op,
#tacticalOpsRoot .t-deploy-hero-v29 {
  --mission-accent:95,199,235;
}
#tacticalOpsRoot .t-mission-tone-recover { --mission-accent:77,208,199; }
#tacticalOpsRoot .t-mission-tone-intercept { --mission-accent:205,178,88; }
#tacticalOpsRoot .t-mission-tone-hold { --mission-accent:230,132,84; }
#tacticalOpsRoot .t-mission-tone-survive { --mission-accent:155,127,214; }
#tacticalOpsRoot .t-mission-tone-boss { --mission-accent:223,86,72; }
#tacticalOpsRoot .t-mission-tone-assault { --mission-accent:95,199,235; }

#tacticalOpsRoot .t-wt-mission-card,
#tacticalOpsRoot .t-wt-next-op {
  position:relative;
  border-color:rgba(var(--mission-accent),.34)!important;
  background:
    linear-gradient(90deg,rgba(var(--mission-accent),.055),transparent 34%),
    linear-gradient(180deg,rgba(7,17,27,.97),rgba(5,12,19,.99)) !important;
  box-shadow:0 12px 28px rgba(0,0,0,.24), inset 2px 0 0 rgba(var(--mission-accent),.46);
}
#tacticalOpsRoot .t-wt-next-op {
  box-shadow:0 14px 34px rgba(0,0,0,.31), inset 2px 0 0 rgba(var(--mission-accent),.65)!important;
}
#tacticalOpsRoot .t-wt-mission-type {
  z-index:2;
  border-color:rgba(var(--mission-accent),.52);
  color:rgb(var(--mission-accent));
}
#tacticalOpsRoot .t-wt-mission-state {
  border-color:rgba(var(--mission-accent),.32);
  color:rgb(var(--mission-accent));
  background:rgba(var(--mission-accent),.075);
}
#tacticalOpsRoot .t-wt-mission-card.is-cleared {
  opacity:.94;
}
#tacticalOpsRoot .t-wt-mission-card.is-cleared::after {
  content:"SECURED";
  position:absolute;
  top:.48rem;
  right:.52rem;
  color:rgba(153,222,181,.12);
  font-size:1.25rem;
  font-weight:900;
  letter-spacing:.16em;
  pointer-events:none;
}

#tacticalOpsRoot .t-deploy-hero-v29 {
  border:1px solid rgba(var(--mission-accent),.36);
  box-shadow:0 18px 38px rgba(0,0,0,.34), inset 0 -1px 0 rgba(var(--mission-accent),.18);
}
#tacticalOpsRoot .t-deploy-hero-v29::after {
  background:
    linear-gradient(90deg,rgba(4,11,18,.98) 0%,rgba(4,11,18,.78) 48%,rgba(4,11,18,.28) 100%),
    linear-gradient(180deg,transparent 55%,rgba(var(--mission-accent),.08) 100%);
}
#tacticalOpsRoot .t-deploy-mode-label {
  display:inline-block;
  margin-bottom:.38rem;
  border:1px solid rgba(var(--mission-accent),.38);
  border-left:3px solid rgba(var(--mission-accent),.86);
  background:rgba(3,12,18,.76);
  padding:.3rem .48rem;
  color:rgb(var(--mission-accent));
  font-size:.55rem;
  font-weight:800;
  letter-spacing:.16em;
}
#tacticalOpsRoot .t-deploy-summary-main {
  border-left:3px solid rgba(var(--mission-accent),.5);
}

#tacticalOpsRoot .t-pack-mastery-v29 {
  position:relative;
  overflow:hidden;
  background:
    linear-gradient(115deg,rgba(19,16,31,.96),rgba(7,17,27,.98) 42%,rgba(6,14,22,.99)) !important;
  border-color:rgba(168,134,227,.34)!important;
}
#tacticalOpsRoot .t-pack-mastery-v29::before {
  content:"";
  position:absolute;
  inset:0;
  pointer-events:none;
  background:
    radial-gradient(circle at 90% 10%,rgba(174,135,234,.10),transparent 32%),
    repeating-linear-gradient(135deg,transparent 0 22px,rgba(255,255,255,.012) 22px 23px);
}
#tacticalOpsRoot .t-pack-mastery-v29 > * { position:relative; z-index:1; }
#tacticalOpsRoot .t-pack-mastery-v29 .t-pack-head .t-title {
  text-shadow:0 0 18px rgba(174,135,234,.16);
}
#tacticalOpsRoot .t-mastery-card-v29 {
  background:
    linear-gradient(180deg,rgba(18,22,36,.78),rgba(7,18,27,.84));
  border-color:rgba(171,140,226,.22);
}
#tacticalOpsRoot .t-mastery-card-v29 .t-mastery-avatar {
  border-color:rgba(171,140,226,.42);
  background:linear-gradient(145deg,rgba(40,31,62,.9),rgba(9,22,31,.92));
  color:#e7dfff;
}

#tacticalOpsRoot .t-wt-story-archive {
  border-color:rgba(129,148,166,.24);
  background:
    linear-gradient(180deg,rgba(11,16,22,.95),rgba(5,11,17,.98)) !important;
}
#tacticalOpsRoot .t-story-mission {
  background:
    linear-gradient(180deg,rgba(12,21,29,.88),rgba(7,14,20,.94));
  border-color:rgba(129,163,181,.17);
}

@media (max-width:620px) {
  #tacticalOpsRoot .t-wt-feature-art,
  #tacticalOpsRoot .t-wt-current-ops .t-wt-mission-art {
    min-height:118px;
  }
  #tacticalOpsRoot .t-wt-art-label,
  #tacticalOpsRoot .t-wt-mission-type,
  #tacticalOpsRoot .t-deploy-mode-label {
    letter-spacing:.11em;
  }
  #tacticalOpsRoot .t-wt-mission-card.is-cleared::after {
    font-size:.95rem;
  }
}


/* === Tactical Ops Premium Combat Readability Pass P0 === */
#tacticalOpsRoot .t-act {
  min-height: 58px;
  padding: .34rem .18rem .26rem;
  background:
    linear-gradient(180deg, #111822f2, #080c12f7 68%),
    radial-gradient(120% 80% at 50% 0%, #3ec6ff12, transparent 60%);
  box-shadow: inset 0 1px 0 #ffffff0a, 0 8px 18px #0007;
}

#tacticalOpsRoot .t-act .name {
  font-size: .64rem;
  letter-spacing: .12em;
}

#tacticalOpsRoot .t-act .meta {
  display:block;
  margin-top:.11rem;
  color:#8295a6;
  font-family:var(--t-font-display);
  font-size:.42rem;
  line-height:1;
  letter-spacing:.11em;
  white-space:nowrap;
  text-transform:uppercase;
}

#tacticalOpsRoot .t-act-svg {
  width:18px;
  height:18px;
  margin-bottom:.05rem;
  filter:drop-shadow(0 0 7px currentColor);
}

#tacticalOpsRoot .t-act.kind-heavy .t-act-svg { color:#9bdfff; }
#tacticalOpsRoot .t-act.kind-control .t-act-svg { color:#f3be62; }
#tacticalOpsRoot .t-act.kind-heal .t-act-svg { color:var(--t-heal); }
#tacticalOpsRoot .t-act.kind-support .t-act-svg { color:#79e3d2; }
#tacticalOpsRoot .t-act.kind-objective .t-act-svg { color:#7ae6ff; }

#tacticalOpsRoot .t-act.kind-control {
  background:
    linear-gradient(180deg,#181612f4,#0a0d12f8 72%),
    radial-gradient(120% 80% at 50% 0%,#e8a73a18,transparent 62%);
}
#tacticalOpsRoot .t-act.kind-heal,
#tacticalOpsRoot .t-act.kind-support {
  background:
    linear-gradient(180deg,#0f1918f2,#080d11f8 72%),
    radial-gradient(120% 80% at 50% 0%,#59d8c418,transparent 62%);
}

#tacticalOpsRoot .t-act.on {
  transform:translateY(-1px);
  box-shadow:
    inset 0 0 0 1px #3ec6ff7a,
    inset 0 0 24px #3ec6ff12,
    0 0 16px #3ec6ff1e;
}
#tacticalOpsRoot .t-act.kind-control.on {
  border-color:#d7a54c;
  box-shadow:inset 0 0 0 1px #d7a54c77, 0 0 16px #d7a54c22;
}
#tacticalOpsRoot .t-act.kind-heal.on,
#tacticalOpsRoot .t-act.kind-support.on {
  border-color:#65dbc7;
  box-shadow:inset 0 0 0 1px #65dbc777, 0 0 16px #65dbc722;
}

#tacticalOpsRoot .t-act.cooling::after {
  content:"";
  position:absolute;
  inset:0;
  background:linear-gradient(135deg,#05080bd9,#10141a99);
  pointer-events:none;
  z-index:0;
}
#tacticalOpsRoot .t-act.cooling > * { position:relative; z-index:1; }
#tacticalOpsRoot .t-act .cd {
  z-index:2;
  padding:.05rem .18rem;
  border:1px solid #ff6b6b55;
  border-radius:99px;
  background:#260d0dd9;
  color:#ff8585;
}

#tacticalOpsRoot .t-actions-enemy {
  min-height:58px;
  display:flex;
  align-items:stretch;
}
#tacticalOpsRoot .t-enemy-command {
  position:relative;
  flex:1;
  min-height:58px;
  display:grid;
  grid-template-columns:auto 1fr;
  grid-template-rows:1fr 1fr;
  align-items:center;
  column-gap:.55rem;
  padding:.48rem .72rem;
  overflow:hidden;
  border:1px solid #e23d3d55;
  border-radius:var(--t-radius-sm);
  background:
    linear-gradient(90deg,#240b0bea,#0a0e14f4 64%),
    repeating-linear-gradient(135deg,#e23d3d08 0 6px,transparent 6px 12px);
  box-shadow:inset 0 0 24px #e23d3d12;
}
#tacticalOpsRoot .t-enemy-command::after {
  content:"";
  position:absolute;
  top:0; bottom:0;
  width:28%;
  left:-30%;
  background:linear-gradient(90deg,transparent,#ff5b5b1f,transparent);
  animation:t-enemy-scan 1.15s linear infinite;
}
#tacticalOpsRoot .t-enemy-command-icon {
  grid-row:1 / span 2;
  width:20px; height:20px;
  color:#ff7070;
  filter:drop-shadow(0 0 8px #e23d3d88);
}
#tacticalOpsRoot .t-enemy-command span {
  font-family:var(--t-font-display);
  letter-spacing:.16em;
  font-size:.64rem;
  color:#ff9b9b;
  align-self:end;
}
#tacticalOpsRoot .t-enemy-command small {
  font-family:var(--t-font-display);
  letter-spacing:.10em;
  font-size:.45rem;
  color:#8d99a6;
  align-self:start;
}
@keyframes t-enemy-scan { to { left:110%; } }

#tacticalOpsRoot .t-battle.is-focusing .t-grid i {
  opacity:.18;
  transition:opacity .14s ease;
}
#tacticalOpsRoot .t-battle.is-focusing .t-cell.move::after {
  opacity:.12;
}
#tacticalOpsRoot .t-battle.is-focusing .t-token.subdued {
  opacity:.34;
  filter:saturate(.35) brightness(.60);
}
#tacticalOpsRoot .t-battle.is-focusing .t-token.active {
  opacity:1;
  filter:none;
}
#tacticalOpsRoot .t-battle.is-focusing .t-token.active .t-ring {
  filter:drop-shadow(0 0 16px #3ec6ffff) drop-shadow(0 0 28px #3ec6ff66);
}

#tacticalOpsRoot .t-target-reticle {
  position:absolute;
  z-index:14;
  left:50%;
  bottom:2%;
  width:118%;
  aspect-ratio:1.15;
  transform:translateX(-50%);
  pointer-events:none;
  animation:t-reticle-breathe .9s ease-in-out infinite alternate;
}
#tacticalOpsRoot .t-target-reticle i {
  position:absolute;
  width:13px;
  height:13px;
  border-color:#ff6b6b;
  filter:drop-shadow(0 0 6px #e23d3daa);
}
#tacticalOpsRoot .t-target-reticle.ally i {
  border-color:#6de7ff;
  filter:drop-shadow(0 0 6px #3ec6ffaa);
}
#tacticalOpsRoot .t-target-reticle i:nth-child(1){left:0;top:0;border-left:2px solid;border-top:2px solid;}
#tacticalOpsRoot .t-target-reticle i:nth-child(2){right:0;top:0;border-right:2px solid;border-top:2px solid;}
#tacticalOpsRoot .t-target-reticle i:nth-child(3){left:0;bottom:0;border-left:2px solid;border-bottom:2px solid;}
#tacticalOpsRoot .t-target-reticle i:nth-child(4){right:0;bottom:0;border-right:2px solid;border-bottom:2px solid;}
@keyframes t-reticle-breathe {
  from { transform:translateX(-50%) scale(.96); opacity:.74; }
  to { transform:translateX(-50%) scale(1.03); opacity:1; }
}

#tacticalOpsRoot .t-battle.effect-control .t-target-reticle i {
  border-color:#f2bd59;
  filter:drop-shadow(0 0 7px #d79f3daa);
}
#tacticalOpsRoot .t-battle.focus-aura .t-token.targetable .t-ring,
#tacticalOpsRoot .t-battle.focus-ally .t-token.targetable .t-ring {
  filter:drop-shadow(0 0 10px #69dec9) drop-shadow(0 0 20px #69dec955);
}

#tacticalOpsRoot .t-token {
  transform-origin:50% 100%;
}
#tacticalOpsRoot .t-token.depth-0 { transform:translate(-50%,-88%) scale(.92); }
#tacticalOpsRoot .t-token.depth-1 { transform:translate(-50%,-88%) scale(.95); }
#tacticalOpsRoot .t-token.depth-2 { transform:translate(-50%,-88%) scale(.98); }
#tacticalOpsRoot .t-token.depth-3 { transform:translate(-50%,-88%) scale(1.01); }
#tacticalOpsRoot .t-token.depth-4 { transform:translate(-50%,-88%) scale(1.04); }

#tacticalOpsRoot .t-token:not(.active):not(.inspect):not(.targetable):not(.trace-carrier):not(.boss-target) .t-plate {
  min-width:54px;
  max-width:80px;
  padding:.08rem .24rem .11rem;
  background:#07090dc9;
  opacity:.82;
}
#tacticalOpsRoot .t-token:not(.active):not(.inspect):not(.targetable):not(.trace-carrier):not(.boss-target) .t-plate-name,
#tacticalOpsRoot .t-token:not(.active):not(.inspect):not(.targetable):not(.trace-carrier):not(.boss-target) .t-chips {
  display:none;
}
#tacticalOpsRoot .t-token.active .t-plate,
#tacticalOpsRoot .t-token.targetable .t-plate,
#tacticalOpsRoot .t-token.inspect .t-plate {
  box-shadow:0 8px 20px #000a, 0 0 14px #3ec6ff14;
}

#tacticalOpsRoot .t-impact {
  width:58px;
  height:58px;
  border-width:2px;
  box-shadow:0 0 18px #fff4;
}
#tacticalOpsRoot .t-impact-damage,
#tacticalOpsRoot .t-impact-control {
  border-color:#ffdfdf;
  animation:.34s ease-out forwards t-premium-hit;
}
#tacticalOpsRoot .t-impact-control {
  border-color:#f3c35d;
  box-shadow:0 0 18px #e2a83d66;
}
#tacticalOpsRoot .t-impact-heal,
#tacticalOpsRoot .t-impact-buff {
  border-color:#6fe6ce;
  box-shadow:0 0 18px #5bd9c777;
  animation:.42s ease-out forwards t-premium-support;
}
@keyframes t-premium-hit {
  0% { opacity:0; transform:translate(-50%,-50%) scale(.28) rotate(-12deg); }
  35% { opacity:1; transform:translate(-50%,-50%) scale(1.08) rotate(4deg); }
  100% { opacity:0; transform:translate(-50%,-50%) scale(1.55) rotate(0); }
}
@keyframes t-premium-support {
  0% { opacity:0; transform:translate(-50%,-50%) scale(.35); }
  30% { opacity:1; transform:translate(-50%,-50%) scale(.95); }
  100% { opacity:0; transform:translate(-50%,-50%) scale(1.8); }
}

#tacticalOpsRoot .t-token.attacking img.body {
  filter:drop-shadow(0 12px 16px #000a) brightness(1.08);
}
#tacticalOpsRoot .t-float.dmg {
  font-size:1.08rem;
  text-shadow:0 0 12px #e23d3d88, 0 2px 8px #000;
}
#tacticalOpsRoot .t-float.heal {
  text-shadow:0 0 12px #59d8c488, 0 2px 8px #000;
}

@media (max-width: 390px) {
  #tacticalOpsRoot .t-act { min-height:56px; }
  #tacticalOpsRoot .t-act .name { font-size:.59rem; letter-spacing:.10em; }
  #tacticalOpsRoot .t-act .meta { font-size:.38rem; letter-spacing:.08em; }
  #tacticalOpsRoot .t-act-svg { width:17px; height:17px; }
}

@media (prefers-reduced-motion: reduce) {
  #tacticalOpsRoot .t-target-reticle,
  #tacticalOpsRoot .t-enemy-command::after,
  #tacticalOpsRoot .t-impact-heal,
  #tacticalOpsRoot .t-impact-buff,
  #tacticalOpsRoot .t-impact-damage,
  #tacticalOpsRoot .t-impact-control {
    animation:none !important;
  }
}


/* === Tactical Ops Real-Device Premium Polish P1 ===
   Phone QA pass: command readability, HUD hierarchy and battlefield declutter.
   Presentation only — combat rules, targeting, AI and progression remain unchanged. */
#tacticalOpsRoot .t-dock {
  grid-template-columns: 42px minmax(0, 1fr) 54px;
  gap: .22rem;
  padding-left: max(.32rem, env(safe-area-inset-left));
  padding-right: max(.32rem, env(safe-area-inset-right));
}

#tacticalOpsRoot .t-actions {
  gap: .18rem;
  min-width: 0;
}

#tacticalOpsRoot .t-act {
  min-width: 0;
  min-height: 60px;
  padding: .42rem .10rem .28rem;
}

#tacticalOpsRoot .t-act .name {
  display: block;
  width: 100%;
  max-width: 100%;
  padding: 0 .04rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: clamp(.48rem, 1.75vw, .62rem);
  letter-spacing: clamp(.055em, .22vw, .11em);
  line-height: 1.05;
}

#tacticalOpsRoot .t-act .meta {
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: clamp(.34rem, 1.25vw, .40rem);
  letter-spacing: .06em;
}

#tacticalOpsRoot .t-act .slot {
  top: .10rem;
  left: .16rem;
  font-size: .43rem;
}

#tacticalOpsRoot .t-act .cd {
  top: .08rem;
  right: .12rem;
  font-size: .43rem;
}

#tacticalOpsRoot .t-act-svg {
  width: 17px;
  height: 17px;
  flex: 0 0 auto;
}

#tacticalOpsRoot .t-skip {
  min-width: 0;
  width: 54px;
  padding: .38rem .18rem .28rem;
  letter-spacing: .08em;
  font-size: .57rem;
}

#tacticalOpsRoot .t-icon-btn {
  width: 42px;
  min-width: 42px;
}

/* The selected-unit strip is the single source of detailed unit information.
   Active/inspected battlefield plates duplicate it and were the main source
   of the real-device card collisions seen in QA. */
#tacticalOpsRoot .t-token.active .t-plate,
#tacticalOpsRoot .t-token.inspect .t-plate {
  display: none;
}

/* Non-focus units keep only a compact tactical HP marker. */
#tacticalOpsRoot .t-token:not(.targetable):not(.trace-carrier):not(.boss-target):not(.active):not(.inspect) .t-plate {
  top: -17px;
  min-width: 44px;
  width: 48px;
  max-width: 48px;
  padding: .07rem .14rem .09rem;
  border-radius: 3px;
  opacity: .72;
  background: #07090dc4;
}

#tacticalOpsRoot .t-token:not(.targetable):not(.trace-carrier):not(.boss-target):not(.active):not(.inspect) .t-plate-name,
#tacticalOpsRoot .t-token:not(.targetable):not(.trace-carrier):not(.boss-target):not(.active):not(.inspect) .t-chips,
#tacticalOpsRoot .t-token:not(.targetable):not(.trace-carrier):not(.boss-target):not(.active):not(.inspect) .t-hp-num {
  display: none;
}

#tacticalOpsRoot .t-token:not(.targetable):not(.trace-carrier):not(.boss-target):not(.active):not(.inspect) .t-hp {
  margin: 0;
  gap: 0;
}

#tacticalOpsRoot .t-token:not(.targetable):not(.trace-carrier):not(.boss-target):not(.active):not(.inspect) .t-hp-bar {
  height: 3px;
}

/* Focused targets remain readable but are capped to a phone-safe footprint. */
#tacticalOpsRoot .t-token.targetable .t-plate,
#tacticalOpsRoot .t-token.trace-carrier .t-plate,
#tacticalOpsRoot .t-token.boss-target .t-plate {
  min-width: 58px;
  max-width: 88px;
  padding: .09rem .24rem .12rem;
}

#tacticalOpsRoot .t-token.targetable .t-plate-name,
#tacticalOpsRoot .t-token.trace-carrier .t-plate-name,
#tacticalOpsRoot .t-token.boss-target .t-plate-name {
  min-width: 0;
  font-size: .56rem;
  letter-spacing: .07em;
  overflow: hidden;
}

#tacticalOpsRoot .t-token.targetable .t-plate-name span,
#tacticalOpsRoot .t-token.trace-carrier .t-plate-name span,
#tacticalOpsRoot .t-token.boss-target .t-plate-name span {
  display: block;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Keep top HUD cards as two deliberate corners rather than competing panels. */
#tacticalOpsRoot .t-status {
  width: min(184px, 48vw);
  padding: .30rem .38rem .32rem;
  gap: .32rem;
}

#tacticalOpsRoot .t-status img {
  width: 32px;
  height: 32px;
}

#tacticalOpsRoot .t-status-name {
  font-size: .65rem;
  letter-spacing: .10em;
}

#tacticalOpsRoot .t-status-kit {
  font-size: .44rem;
}

#tacticalOpsRoot .t-status-mods {
  gap: .20rem;
  font-size: .49rem;
}

#tacticalOpsRoot .t-status-mods span {
  padding: .03rem .20rem;
}

#tacticalOpsRoot .t-obj-chip {
  width: min(164px, 43vw);
  padding: .30rem .38rem .32rem;
}

#tacticalOpsRoot .t-obj-chip strong {
  font-size: .52rem;
  letter-spacing: .08em;
}

#tacticalOpsRoot .t-obj-chip span,
#tacticalOpsRoot .t-obj-chip small,
#tacticalOpsRoot .t-obj-chip em {
  font-size: .44rem;
}

/* Move order portraits into the quiet center lane between both corner cards. */
#tacticalOpsRoot .t-order-wrap {
  top: .30rem;
  max-width: min(22vw, 108px);
}

#tacticalOpsRoot .t-order-unit {
  width: 19px;
  height: 19px;
}

#tacticalOpsRoot .t-ticker {
  max-width: min(68vw, 24rem);
  font-size: .55rem;
}

/* Phone battlefield: preserve characters as the visual focus, not labels. */
@media (max-width: 430px) {
  #tacticalOpsRoot .t-brand h1 {
    font-size: .62rem;
    letter-spacing: .10em;
  }

  #tacticalOpsRoot .t-turn strong {
    font-size: .62rem;
    letter-spacing: .14em;
  }

  #tacticalOpsRoot .t-obj {
    font-size: .50rem;
    letter-spacing: .08em;
  }

  #tacticalOpsRoot .t-token {
    max-width: 92px;
  }

  #tacticalOpsRoot .t-token.alpha {
    max-width: 104px;
  }

  #tacticalOpsRoot .t-token.leader {
    max-width: 112px;
  }

  #tacticalOpsRoot .t-token.hound {
    max-width: 98px;
  }
}

@media (max-width: 370px) {
  #tacticalOpsRoot .t-dock {
    grid-template-columns: 38px minmax(0, 1fr) 48px;
    gap: .14rem;
    padding-left: max(.24rem, env(safe-area-inset-left));
    padding-right: max(.24rem, env(safe-area-inset-right));
  }

  #tacticalOpsRoot .t-icon-btn {
    width: 38px;
    min-width: 38px;
  }

  #tacticalOpsRoot .t-skip {
    width: 48px;
    font-size: .51rem;
  }

  #tacticalOpsRoot .t-actions {
    gap: .12rem;
  }

  #tacticalOpsRoot .t-act {
    padding-left: .05rem;
    padding-right: .05rem;
  }

  #tacticalOpsRoot .t-act .name {
    font-size: .45rem;
    letter-spacing: .04em;
  }

  #tacticalOpsRoot .t-act .meta {
    font-size: .31rem;
    letter-spacing: .03em;
  }

  #tacticalOpsRoot .t-status {
    width: min(166px, 47vw);
  }

  #tacticalOpsRoot .t-obj-chip {
    width: min(150px, 42vw);
  }

  #tacticalOpsRoot .t-order-wrap {
    display: none;
  }
}


/* Edge-cell plate anchoring: labels stay inside the battlefield on narrow phones. */
#tacticalOpsRoot .t-token.edge-left .t-plate {
  left: 0;
  transform: translateX(-12%);
}

#tacticalOpsRoot .t-token.edge-right .t-plate {
  left: 100%;
  transform: translateX(-88%);
}

#tacticalOpsRoot .t-token.edge-left .t-objective-badge {
  left: 0;
  transform: translateX(-12%);
}

#tacticalOpsRoot .t-token.edge-right .t-objective-badge {
  left: 100%;
  transform: translateX(-88%);
}


/* === Tactical Ops Real-Device Battlefield Declutter P2 ===
   Real-device proof 2026-10-03: remove battlefield card stacks/clipping and
   reduce HOLD overlay dominance. Presentation-only; no combat logic changes. */
@media (max-width: 430px) {
  /* Detailed identity/HP already lives in the selected-unit strip. On the
     battlefield, characters + rings carry identity more cleanly than cards. */
  #tacticalOpsRoot .t-token .t-plate {
    display: none !important;
  }

  /* Objective cells should read as tactical zones, not opaque UI cards. */
  #tacticalOpsRoot .t-cell.hold,
  #tacticalOpsRoot .t-cell.objective,
  #tacticalOpsRoot .t-cell.recover {
    background: rgba(45, 188, 232, .055) !important;
    box-shadow:
      inset 0 0 0 1px rgba(76, 213, 255, .42),
      inset 0 0 18px rgba(45, 188, 232, .055) !important;
  }

  #tacticalOpsRoot .t-cell.hold::before,
  #tacticalOpsRoot .t-cell.objective::before,
  #tacticalOpsRoot .t-cell.recover::before {
    opacity: .42;
  }

  #tacticalOpsRoot .t-cell.hold::after,
  #tacticalOpsRoot .t-cell.objective::after,
  #tacticalOpsRoot .t-cell.recover::after {
    opacity: .48;
    font-size: .46rem;
    letter-spacing: .06em;
  }

  /* Give the battlefield more breathing room below the two corner HUD cards. */
  #tacticalOpsRoot .t-status {
    width: min(176px, 47vw);
    padding: .26rem .32rem .28rem;
  }

  #tacticalOpsRoot .t-obj-chip {
    width: min(154px, 41vw);
    padding: .26rem .32rem .28rem;
  }

  #tacticalOpsRoot .t-status img {
    width: 29px;
    height: 29px;
  }

  #tacticalOpsRoot .t-order-wrap {
    opacity: .62;
  }
}

/* Active Operation 02 must read as the next story, not as an archive. */
#tacticalOpsRoot .t-wt-campaign-feature { padding:1rem 1.05rem; border:1px solid rgba(117,217,244,.55); border-radius:8px; background:radial-gradient(circle at 93% 8%,rgba(156,69,69,.2),transparent 45%),linear-gradient(135deg,rgba(14,35,48,.98),rgba(6,14,22,.98)); box-shadow:0 4px 28px rgba(0,0,0,.3); }
#tacticalOpsRoot .t-wt-campaign-feature > p { color:#b3c8d1; margin:.65rem 0 .85rem; line-height:1.5; }
#tacticalOpsRoot .t-wt-campaign-feature .t-wt-canon-grid { grid-template-columns:repeat(3,minmax(0,1fr)); }
#tacticalOpsRoot .t-wt-campaign-actions { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:.8rem; padding:.82rem; margin-bottom:.8rem; border:1px solid rgba(113,207,235,.28); border-radius:6px; background:rgba(2,12,22,.55); }
#tacticalOpsRoot .t-wt-campaign-actions strong { display:block; margin-top:.22rem; color:#f1f9ff; font-size:1rem; }
#tacticalOpsRoot .t-wt-campaign-cta { min-height:44px; white-space:normal; }
@media (max-width:620px) {
  #tacticalOpsRoot .t-wt-campaign-feature { padding:.82rem; }
  #tacticalOpsRoot .t-wt-campaign-feature .t-wt-canon-grid { grid-template-columns:1fr; }
  #tacticalOpsRoot .t-wt-campaign-actions { align-items:stretch; flex-direction:column; }
  #tacticalOpsRoot .t-wt-campaign-cta { width:100%; }
}

/* P0-A: Telegram iOS WebKit field HUD containment.
   Absolutely positioned status/objective cards should be anchored to the
   battlefield, not participate as absolute children of the CSS grid.
   This prevents a full-height grid-track-sized card on narrow WebViews. */
#tacticalOpsRoot .t-field > .t-status,
#tacticalOpsRoot .t-field > .t-obj-chip {
  grid-area: auto;
  position: absolute;
  top: .4rem;
  bottom: auto;
  height: fit-content;
  min-height: 0;
  max-height: 140px;
  align-self: start;
  overflow: hidden;
}

#tacticalOpsRoot .t-field > .t-status {
  left: max(.4rem, env(safe-area-inset-left));
  right: auto;
}

#tacticalOpsRoot .t-field > .t-obj-chip {
  left: auto;
  right: max(.4rem, env(safe-area-inset-right));
}

/* The three header columns must not overlap if iOS enlarges text. */
#tacticalOpsRoot .t-top .t-brand,
#tacticalOpsRoot .t-top .t-brand > div,
#tacticalOpsRoot .t-top .t-brand h1,
#tacticalOpsRoot .t-top .t-turn,
#tacticalOpsRoot .t-top .t-obj {
  min-width: 0;
  max-width: 100%;
}

#tacticalOpsRoot .t-top .t-brand > div {
  width: 100%;
  overflow: hidden;
}


/* P0 mobile QA 18 Oct: identity on Results must never expand its portrait to viewport height. */
#tacticalOpsRoot .t-results .t-id-card {
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr);
  align-items: center;
  gap: .65rem;
  min-width: 0;
  margin: .6rem 0;
  padding: .55rem .65rem;
  border: 1px solid #69c9eb33;
  border-radius: 6px;
  background: #0b1b25;
}
#tacticalOpsRoot .t-results .t-id-card > img {
  display: block;
  width: 52px;
  height: 56px;
  max-width: 100%;
  object-fit: cover;
  object-position: 50% 15%;
  border-radius: 4px;
}
#tacticalOpsRoot .t-results .t-id-card > div { min-width: 0; }
#tacticalOpsRoot .t-results .t-id-card strong,
#tacticalOpsRoot .t-results .t-id-card small { display: block; overflow-wrap: anywhere; }
#tacticalOpsRoot .t-results .t-id-card strong { color: #e6f8ff; font-size: .78rem; }
#tacticalOpsRoot .t-results .t-id-card small { color: #a7c0cd; font-size: .64rem; line-height: 1.45; }

/* iOS Telegram: bounded, compact inspection HUD; objective/units remain visible. */
@media (max-width: 620px) {
  #tacticalOpsRoot .t-field > .t-status {
    box-sizing: border-box;
    width: min(176px, 47%);
    max-height: 92px;
    padding: .25rem .32rem;
    overflow: hidden;
    align-content: center;
  }
  #tacticalOpsRoot .t-field > .t-status img {
    width: 28px;
    height: 28px;
  }
  #tacticalOpsRoot .t-field > .t-status .t-status-kit,
  #tacticalOpsRoot .t-field > .t-status .t-chips { display: none; }
  #tacticalOpsRoot .t-field > .t-status .t-status-main { min-width: 0; }
}

/* Battlefield VNext preview: preserve tap targets without obscuring adjacent lanes. */
#tacticalOpsRoot .battlefield-vnext-preview .t-token { width: 10.5%; min-width: 34px; max-width: 104px; }
#tacticalOpsRoot .battlefield-vnext-preview .t-token.alpha { width: 11.7%; min-width: 38px; max-width: 116px; }
#tacticalOpsRoot .battlefield-vnext-preview .t-token.leader { width: 12.4%; min-width: 40px; max-width: 124px; }
#tacticalOpsRoot .battlefield-vnext-preview .t-token.hound { width: 11%; min-width: 36px; max-width: 110px; }
#tacticalOpsRoot .battlefield-vnext-preview .t-cell { width: 36px; min-width: 36px; height: 36px; min-height: 36px; }
#tacticalOpsRoot .battlefield-vnext-preview .t-grid i { width: 7px; height: 7px; }

/* Battlefield Lab is deliberately visible only inside Tactical Ops, including Telegram and APK. */
#tacticalOpsRoot .t-wt-battlefield-lab{display:flex;align-items:center;justify-content:space-between;gap:14px;border:1px solid rgba(96,205,241,.42);background:linear-gradient(110deg,rgba(5,36,51,.96),rgba(6,18,30,.92));padding:14px;}
#tacticalOpsRoot .t-wt-battlefield-lab>div{display:flex;flex-direction:column;align-items:flex-start;gap:4px;min-width:0;}
#tacticalOpsRoot .t-wt-battlefield-lab strong{font-size:15px;color:#bcf0ff;}
#tacticalOpsRoot .t-wt-battlefield-lab p{font-size:11px;line-height:1.5;margin:0;color:rgba(217,236,246,.77);}
#tacticalOpsRoot .t-wt-battlefield-lab .t-btn{min-height:44px;min-width:112px;flex-shrink:0;}
#tacticalOpsRoot .t-battle-lab-tag{color:#86e9ff;font-weight:800;letter-spacing:.05em;}
@media(max-width:520px){#tacticalOpsRoot .t-wt-battlefield-lab{flex-direction:column;align-items:stretch;}#tacticalOpsRoot .t-wt-battlefield-lab .t-btn{width:100%;}}

/* Battlefield VNext intelligence: readable enemy silhouettes and role callouts. */
#tacticalOpsRoot .t-enemy-archetype{position:absolute;left:50%;bottom:calc(100% + 6px);transform:translateX(-50%);z-index:12;pointer-events:none;padding:3px 5px;border-radius:4px;font-size:8px;font-weight:900;letter-spacing:.06em;line-height:1;white-space:nowrap;color:#fff5e5;border:1px solid rgba(255,174,100,.65);background:rgba(39,17,16,.88);box-shadow:0 0 10px rgba(214,86,54,.22);}
#tacticalOpsRoot .t-archetype-courier{color:#d4fbff;border-color:#70d7e4;background:rgba(4,44,59,.88);}
#tacticalOpsRoot .t-archetype-commander{color:#ffe9c6;border-color:#ffb56a;background:rgba(65,22,13,.93);}
#tacticalOpsRoot .t-archetype-marksman{color:#f2d6ff;border-color:#bc8af6;background:rgba(39,17,56,.9);}
#tacticalOpsRoot .t-archetype-disruptor{color:#ffdddc;border-color:#f17b82;background:rgba(53,9,25,.9);}
#tacticalOpsRoot .t-archetype-bulwark{color:#d8edff;border-color:#80bfff;background:rgba(15,30,60,.92);}
@media(max-width:500px){#tacticalOpsRoot .t-enemy-archetype{font-size:7px;letter-spacing:0;padding:2px 3px;}}

/* One-action reaction warning; the tile layer never captures touches. */
#tacticalOpsRoot .t-threat-tile{position:absolute;z-index:6;pointer-events:none;transform:translate(-50%,-50%);width:clamp(23px,6%,42px);aspect-ratio:1;border:2px solid rgba(255,111,111,.88);border-radius:10px;box-shadow:0 0 0 3px rgba(255,45,52,.1),0 0 14px rgba(255,61,52,.43);background:radial-gradient(circle,rgba(255,60,60,.25),rgba(211,15,22,.04));}
#tacticalOpsRoot .t-threat-warning{position:absolute;top:8px;left:8px;right:8px;z-index:20;pointer-events:none;display:flex;flex-direction:column;align-items:center;gap:3px;}
#tacticalOpsRoot .t-threat-warning span{display:block;max-width:100%;font-size:9px;line-height:1.3;font-weight:850;letter-spacing:.035em;text-align:center;color:#ffdfd8;padding:5px 8px;border:1px solid rgba(255,92,92,.75);border-radius:5px;background:rgba(31,8,15,.92);box-shadow:0 2px 10px rgba(0,0,0,.5);}
@media(prefers-reduced-motion:no-preference){#tacticalOpsRoot .t-threat-tile{animation:t-threat-pulse 1.6s ease-in-out infinite;}@keyframes t-threat-pulse{50%{box-shadow:0 0 0 8px rgba(255,45,52,.07),0 0 18px rgba(255,61,52,.55);}}}

/* Battlefield VNext WebApp: keep the tactical HUD within the safe visible viewport.
   Geometry remains 10x7; the HUD must not consume the battlefield's usable lanes. */
@media (max-width: 620px) {
  #tacticalOpsRoot .t-top {
    box-sizing: border-box;
    min-height: calc(44px + env(safe-area-inset-top, 0px));
    max-height: none;
    padding-top: max(8px, env(safe-area-inset-top, 0px));
    overflow: hidden;
  }
  #tacticalOpsRoot .t-top .t-brand h1 {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  #tacticalOpsRoot .t-field > .t-status,
  #tacticalOpsRoot .t-field > .t-obj-chip {
    top: max(8px, env(safe-area-inset-top, 0px));
    box-sizing: border-box;
    min-width: 0;
    max-width: calc(50% - 12px);
  }
  #tacticalOpsRoot .t-dock {
    box-sizing: border-box;
    padding-bottom: max(12px, env(safe-area-inset-bottom, 0px));
  }
  #tacticalOpsRoot .t-act .name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

/* Intent clarity P0: danger text must never sit beneath status/objective cards. */
#tacticalOpsRoot .t-threat-warning {
  top: clamp(116px, 15%, 180px);
  left: 12px;
  right: 12px;
  z-index: 24;
}
#tacticalOpsRoot .t-threat-warning span {
  max-width: min(100%, 540px);
  font-size: 11px;
  line-height: 1.45;
  padding: 9px 12px;
  background: rgba(25, 7, 13, .97);
}
#tacticalOpsRoot .t-threat-warning strong { color: #fff; }
@media (max-width: 620px) {
  #tacticalOpsRoot .t-threat-warning { top: clamp(108px, 15%, 154px); }
}

/* Tactical threat brief: a dedicated readable layer between the battlefield and dock. */
#tacticalOpsRoot .t-threat-brief {
  position: relative;
  z-index: 30;
  box-sizing: border-box;
  width: calc(100% - 24px);
  max-width: 560px;
  margin: 0 auto 6px;
  padding: 9px 12px 10px;
  border: 1px solid rgba(244, 102, 98, .58);
  border-left: 3px solid #ff7771;
  border-radius: 10px;
  background: linear-gradient(110deg, rgba(34, 12, 23, .98), rgba(14, 23, 38, .98));
  box-shadow: 0 5px 20px rgba(0,0,0,.42), inset 0 1px rgba(255,255,255,.07);
  color: #fff0ec;
  pointer-events: none;
}
#tacticalOpsRoot .t-threat-brief-head { display: flex; align-items: center; gap: 7px; font-size: 10px; line-height: 1.25; font-weight: 850; letter-spacing: .13em; }
#tacticalOpsRoot .t-threat-brief-pip { flex: none; width: 7px; height: 7px; border-radius: 50%; background: #ff7771; box-shadow: 0 0 8px #ff7771; }
#tacticalOpsRoot .t-threat-brief-head small { margin-left: auto; color: #ffb0a8; font-size: 9px; font-weight: 700; letter-spacing: .06em; }
#tacticalOpsRoot .t-threat-brief-detail { margin-top: 5px; font-size: 12px; font-weight: 750; line-height: 1.35; overflow-wrap: anywhere; }
#tacticalOpsRoot .t-threat-brief-action { margin-top: 6px; color: #b6e7f5; font-size: 10px; font-weight: 750; line-height: 1.3; letter-spacing: .06em; }
#tacticalOpsRoot .t-threat-brief-action span { color: #7395a5; padding: 0 3px; }
@media (max-width: 620px) {
  #tacticalOpsRoot .t-threat-brief { width: calc(100% - 16px); padding: 8px 10px; margin-bottom: 4px; }
  #tacticalOpsRoot .t-threat-brief-detail { font-size: 11px; }
  #tacticalOpsRoot .t-threat-brief-action { font-size: 9px; }
}

/* Player Growth & Mastery: one readable, touch-first Skillbook for every mission. */
#tacticalOpsRoot .t-growth-panel { margin-block: 16px; padding: clamp(14px, 3vw, 22px); border: 1px solid rgba(101,208,240,.34); background: linear-gradient(135deg,rgba(10,28,44,.98),rgba(10,17,30,.98)); }
#tacticalOpsRoot .t-growth-heading { display:flex; justify-content:space-between; align-items:flex-start; gap:12px; }
#tacticalOpsRoot .t-growth-heading h2 { margin:4px 0 6px; font-size:clamp(17px,3.2vw,24px); letter-spacing:.1em; color:#e5f6ff; }
#tacticalOpsRoot .t-growth-heading p { color:#9fb6c6; margin:0; font-size:12px; line-height:1.5; }
#tacticalOpsRoot .t-growth-points { min-width:94px; flex-shrink:0; border:1px solid rgba(110,205,241,.36); border-radius:9px; padding:9px 12px; text-align:center; background:rgba(21,68,89,.27); }
#tacticalOpsRoot .t-growth-points strong { display:block; color:#a9ecff; font-size:24px; font-variant-numeric:tabular-nums; }
#tacticalOpsRoot .t-growth-points small { display:block; font-size:9px; letter-spacing:.07em; color:#c5d8e5; }
#tacticalOpsRoot .t-growth-roster { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:7px; margin-top:18px; }
#tacticalOpsRoot .t-growth-roster button, #tacticalOpsRoot .t-growth-paths button, #tacticalOpsRoot .t-growth-skill-list button { color:#d3e4f0; background:rgba(12,30,47,.94); border:1px solid rgba(116,160,185,.28); border-radius:9px; cursor:pointer; text-align:left; }
#tacticalOpsRoot .t-growth-roster button { min-height:46px; padding:9px; text-align:center; font-weight:800; letter-spacing:.06em; }
#tacticalOpsRoot .t-growth-panel button.is-selected { background:rgba(27,77,97,.65); border-color:#66c9ed; box-shadow:inset 0 0 0 1px rgba(119,214,241,.25); }
#tacticalOpsRoot .t-growth-panel button:focus-visible { outline:2px solid #8de9ff; outline-offset:2px; }
#tacticalOpsRoot .t-growth-panel button:disabled { opacity:.48; cursor:not-allowed; }
#tacticalOpsRoot .t-growth-copy { display:flex; justify-content:space-between; gap:8px; align-items:center; flex-wrap:wrap; margin:16px 0 8px; font-size:12px; letter-spacing:.07em; }
#tacticalOpsRoot .t-growth-copy strong { font-size:14px; color:#e1f8ff; }
#tacticalOpsRoot .t-growth-copy span { font-size:10px; color:#9ddceb; }
#tacticalOpsRoot .t-growth-paths { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:8px; }
#tacticalOpsRoot .t-growth-paths button { min-height:92px; padding:12px; }
#tacticalOpsRoot .t-growth-paths b { display:block; font-size:12px; letter-spacing:.075em; }
#tacticalOpsRoot .t-growth-paths small { display:block; margin-top:7px; color:#a7bfd0; font-size:11px; line-height:1.4; }
#tacticalOpsRoot .t-growth-skill-list { display:grid; gap:7px; margin-top:15px; }
#tacticalOpsRoot .t-growth-skill-list button { min-height:58px; padding:11px 13px; }
#tacticalOpsRoot .t-growth-skill-title { display:flex; justify-content:space-between; gap:10px; color:#e3f5fe; font-size:12px; font-weight:800; letter-spacing:.06em; }
#tacticalOpsRoot .t-growth-skill-title em { font-size:10px; font-style:normal; font-weight:700; color:#87dcf5; flex-shrink:0; }
#tacticalOpsRoot .t-growth-skill-list small { display:block; margin-top:5px; color:#a6bfd2; font-size:11px; line-height:1.35; }
#tacticalOpsRoot .t-growth-confirm { margin-top:14px; display:flex; justify-content:space-between; align-items:center; gap:12px; padding:14px; border-radius:10px; border:1px solid rgba(108,194,231,.23); background:rgba(7,16,29,.7); }
#tacticalOpsRoot .t-growth-confirm > div { flex:1; min-width:0; }
#tacticalOpsRoot .t-growth-confirm strong, #tacticalOpsRoot .t-growth-confirm small { display:block; }
#tacticalOpsRoot .t-growth-confirm strong { color:#d7f4ff; font-size:13px; }
#tacticalOpsRoot .t-growth-confirm small { margin-top:4px; color:#b8cddb; font-size:11px; line-height:1.4; }
#tacticalOpsRoot .t-growth-confirm .t-btn { min-height:46px; min-width:145px; font-size:11px; white-space:normal; }
#tacticalOpsRoot .t-growth-respec { margin-top:12px; display:flex; gap:9px; flex-wrap:wrap; align-items:center; }
#tacticalOpsRoot .t-growth-respec span, #tacticalOpsRoot .t-growth-notice { font-size:12px; line-height:1.5; color:#bdcdd8; }
#tacticalOpsRoot .t-growth-respec .t-btn { min-height:44px; }
#tacticalOpsRoot .t-growth-error { font-size:12px; color:#ffc0b6; margin-top:12px; }
@media(max-width:620px) {
  #tacticalOpsRoot .t-growth-heading { flex-wrap:wrap; }
  #tacticalOpsRoot .t-growth-points { min-width:90px; }
  #tacticalOpsRoot .t-growth-paths button { min-height:108px; }
  #tacticalOpsRoot .t-growth-confirm { flex-direction:column; align-items:stretch; }
  #tacticalOpsRoot .t-growth-confirm .t-btn { width:100%; }
}

#tacticalOpsRoot .t-growth-result { margin:14px 0; padding:14px; border-radius:10px; border:1px solid rgba(107,198,224,.44); background:linear-gradient(125deg,rgba(15,57,76,.72),rgba(9,20,36,.94)); }
#tacticalOpsRoot .t-growth-result strong { display:block; margin:7px 0 5px; color:#b0ecff; font-size:clamp(15px,3vw,18px); letter-spacing:.06em; }
#tacticalOpsRoot .t-growth-result small { display:block; color:#bed3df; font-size:11px; line-height:1.45; }

/* VNext Step 5: existing-skill Signal Codex and squad opportunity cost. */
#tacticalOpsRoot .t-codex-brief { padding:clamp(12px,3vw,20px); margin-block:14px; border:1px solid rgba(89,196,225,.35); background:linear-gradient(130deg,rgba(11,34,51,.97),rgba(8,16,30,.96)); }
#tacticalOpsRoot .t-codex-tradeoff { color:#ffd79b; font-size:12px; line-height:1.5; margin:8px 0; }
#tacticalOpsRoot .t-codex-note { color:#a7c3d2; font-size:11px; line-height:1.5; margin:8px 0 14px; }
#tacticalOpsRoot .t-codex-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:9px; }
#tacticalOpsRoot .t-codex-family { min-width:0; padding:11px; border:1px solid rgba(117,172,191,.26); border-radius:9px; background:rgba(10,21,34,.85); }
#tacticalOpsRoot .t-codex-family>strong { display:block; color:#9ee7fc; font-size:11px; letter-spacing:.11em; margin-bottom:7px; }
#tacticalOpsRoot .t-codex-skill { padding:7px 0; border-top:1px solid rgba(128,170,192,.15); }
#tacticalOpsRoot .t-codex-skill b,#tacticalOpsRoot .t-codex-skill small { display:block; overflow-wrap:anywhere; }
#tacticalOpsRoot .t-codex-skill b { color:#e2f2fb; font-size:11px; }
#tacticalOpsRoot .t-codex-skill small,#tacticalOpsRoot .t-codex-empty { color:#a9bdcb; font-size:10px; line-height:1.5; }
@media(max-width:420px) {#tacticalOpsRoot .t-codex-grid {grid-template-columns:1fr}}

/* One pre-deployment loadout: existing authored slots, saved variants and counter options. */
#tacticalOpsRoot .t-codex-loadout,#tacticalOpsRoot .t-codex-counterlist,#tacticalOpsRoot .t-codex-variants { margin:12px 0; padding:12px; background:rgba(5,18,31,.7); border:1px solid rgba(110,177,205,.25); border-radius:10px; }
#tacticalOpsRoot .t-codex-loadout>strong,#tacticalOpsRoot .t-codex-counterlist>strong,#tacticalOpsRoot .t-codex-variants>strong { display:block; color:#a6edff; font-size:11px; letter-spacing:.09em; margin-bottom:8px; }
#tacticalOpsRoot .t-codex-loadout>small { display:block; font-size:11px; line-height:1.5; color:#b9cbd9; margin-bottom:12px; }
#tacticalOpsRoot .t-codex-unit { margin-top:11px; }
#tacticalOpsRoot .t-codex-unit>b { display:block; color:#e4f5fc; font-size:12px; padding-bottom:6px; }
#tacticalOpsRoot .t-codex-slots { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:6px; }
#tacticalOpsRoot .t-codex-slot { min-width:0; border-radius:7px; padding:9px 7px; background:rgba(30,65,83,.45); border:1px solid rgba(115,173,202,.27); overflow-wrap:anywhere; }
#tacticalOpsRoot .t-codex-slot strong { display:block; color:#d5f0fb; font-size:10px; line-height:1.4; }
#tacticalOpsRoot .t-codex-slot small { display:block; color:#b0c9d8; font-size:9px; line-height:1.45; margin-top:4px; }
#tacticalOpsRoot .t-codex-counters { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:6px; }
#tacticalOpsRoot .t-codex-counter { border-radius:7px; padding:9px; border:1px solid rgba(110,167,190,.28); min-width:0; }
#tacticalOpsRoot .t-codex-counter.is-ready { border-color:rgba(91,212,183,.45); background:rgba(21,76,72,.25); }
#tacticalOpsRoot .t-codex-counter.is-missing { background:rgba(21,28,37,.53); opacity:.78; }
#tacticalOpsRoot .t-codex-counter b,#tacticalOpsRoot .t-codex-counter small { display:block; overflow-wrap:anywhere; }
#tacticalOpsRoot .t-codex-counter b { font-size:10px; line-height:1.35; color:#e1f6f7; }
#tacticalOpsRoot .t-codex-counter small { margin-top:4px; font-size:10px; line-height:1.4; color:#aec5d3; }
#tacticalOpsRoot .t-codex-variants .t-sidegrade-card { padding:10px; margin:7px 0; }
@media(max-width:450px) {
  #tacticalOpsRoot .t-codex-slots { grid-template-columns:repeat(2,minmax(0,1fr)); }
  #tacticalOpsRoot .t-codex-counters { grid-template-columns:1fr; }
}


/* Tactical Command Deck v1 — screen-first navigation, existing actions preserved. */
#tacticalOpsRoot .t-command-nav {
  position: sticky;
  top: 0;
  z-index: 35;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 5px;
  margin: 8px 0 14px;
  padding: 6px;
  border: 1px solid rgba(104, 203, 238, .28);
  border-radius: 13px;
  background: rgba(3, 11, 20, .96);
  box-shadow: 0 9px 28px rgba(0, 0, 0, .33);
  backdrop-filter: blur(12px);
}
#tacticalOpsRoot .t-command-nav button {
  min-width: 0;
  min-height: 58px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 4px;
  padding: 8px 3px;
  border: 1px solid rgba(100, 151, 178, .2);
  border-radius: 9px;
  background: linear-gradient(160deg, #0d2130, #071420);
  color: #c9dde9;
  cursor: pointer;
}
#tacticalOpsRoot .t-command-nav button > span {
  color: #7398a9;
  font: 700 10px/1 var(--t-font-sans);
  letter-spacing: .18em;
}
#tacticalOpsRoot .t-command-nav button > strong {
  font: 800 clamp(9px, 2.4vw, 12px)/1.2 var(--t-font-sans);
  letter-spacing: .045em;
  overflow-wrap: anywhere;
}
#tacticalOpsRoot .t-command-nav button.is-current {
  color: #e7faff;
  border-color: rgba(114, 220, 247, .82);
  background: linear-gradient(160deg, rgba(30, 98, 124, .74), #10283a);
  box-shadow: inset 0 0 0 1px rgba(140, 231, 255, .16), 0 0 17px rgba(57, 162, 208, .12);
}
#tacticalOpsRoot .t-command-nav button.is-current > span { color: #f7ce87; }
#tacticalOpsRoot .t-command-nav button:focus-visible {
  outline: 2px solid #e6bf76;
  outline-offset: 2px;
}
#tacticalOpsRoot .t-command-pane { min-width: 0; min-height: 180px; animation: t-command-reveal .16s ease-out; }
#tacticalOpsRoot .t-command-pane > :first-child { margin-top: 0; }
#tacticalOpsRoot .t-command-pane .t-growth-panel { margin-top: 0; }
#tacticalOpsRoot .t-command-pane .t-pack-mastery-premium { margin-block: 12px; }
#tacticalOpsRoot .t-deploy-command-pane { padding-bottom: 5px; }
#tacticalOpsRoot .t-deploy-command-pane .t-deploy-squad,
#tacticalOpsRoot .t-deploy-command-pane .t-codex-brief { margin-top: 0; }
#tacticalOpsRoot .t-command-conditions-head {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding-bottom: .5rem; margin-bottom: .5rem;
  border-bottom: 1px solid rgba(98, 184, 222, .18);
}
#tacticalOpsRoot .t-command-conditions-head strong { font-size: .85rem; }
#tacticalOpsRoot .t-command-conditions-head b { color: #9fdaeb; font-size: .72rem; }
#tacticalOpsRoot .t-deployment.t-brief { padding-bottom: max(.65rem, env(safe-area-inset-bottom)); }
#tacticalOpsRoot .t-deploy-actions-v29 { flex: 0 0 auto; }
@keyframes t-command-reveal {
  from { opacity: .7; transform: translateY(3px); }
  to { opacity: 1; transform: translateY(0); }
}
@media (prefers-reduced-motion: reduce) {
  #tacticalOpsRoot .t-command-pane { animation: none; }
}
@media (max-width: 430px) {
  #tacticalOpsRoot .t-command-nav { gap: 3px; padding: 4px; margin: 7px 0 10px; }
  #tacticalOpsRoot .t-command-nav button { min-height: 55px; }
  #tacticalOpsRoot .t-command-nav button > strong { font-size: 9px; letter-spacing: .015em; }
  #tacticalOpsRoot .t-command-conditions-head { align-items: flex-start; flex-direction: column; }
}

/* Command Deck masterasset layer. Keep text and actual server data in HTML. */
#tacticalOpsRoot .t-command-art-shell {
  --t-command-assets: "/images/tactical_ops/presentation/command_deck/";
  background-image: linear-gradient(180deg, rgba(3,10,17,.79), rgba(3,10,17,.88) 48%, rgba(3,10,17,.96)), url("/images/tactical_ops/presentation/command_deck/command_room.webp");
  background-size: cover;
  background-position: center center;
  background-attachment: local;
}
#tacticalOpsRoot .t-command-art-shell.t-deployment {
  background-image: linear-gradient(180deg, rgba(3,10,17,.85), rgba(3,10,17,.90) 42%, rgba(3,10,17,.97)), url("/images/tactical_ops/presentation/command_deck/command_room.webp");
}
#tacticalOpsRoot .t-command-framed-nav {
  border-image: url("/images/tactical_ops/presentation/command_deck/frames/05_bar_nav_segmented.png") 25 45 25 45 / 9px 15px 9px 15px / 0 stretch;
}
#tacticalOpsRoot .t-command-art-shell .t-command-pane > .t-panel:not(.t-wt-next-op) {
  border-image: url("/images/tactical_ops/presentation/command_deck/frames/03_frame_content_panel.png") 66 80 66 80 / 9px 11px 9px 11px / 0 stretch;
}
#tacticalOpsRoot .t-command-mission-feature {
  position: relative;
  isolation: isolate;
}
#tacticalOpsRoot .t-command-mission-feature::before {
  content: "";
  position: absolute; inset: 0; z-index: -1; pointer-events: none;
  background: linear-gradient(90deg, rgba(5,13,22,.9),rgba(5,13,22,.22)), url("/images/tactical_ops/presentation/command_deck/mission_hologram.webp") center / cover;
  opacity: .55;
}
#tacticalOpsRoot .t-command-brief-hero {
  isolation: isolate;
}
#tacticalOpsRoot .t-command-brief-hero::before {
  content: "";
  position: absolute; inset: 0; z-index: -1; pointer-events: none;
  background: url("/images/tactical_ops/presentation/command_deck/mission_hologram.webp") center / cover;
  opacity: .27;
}
#tacticalOpsRoot .t-command-art-shell .t-command-hero-cta,
#tacticalOpsRoot .t-command-art-shell .t-command-action-dock .t-btn-primary {
  border-image: url("/images/tactical_ops/presentation/command_deck/frames/06_button_primary.png") 24 54 24 54 / 9px 18px 9px 18px / 0 stretch;
  background: linear-gradient(180deg,#174f69,#082635);
  color: #eafdff;
}
#tacticalOpsRoot .t-command-art-shell .t-command-action-dock .t-btn-ghost {
  border-image: url("/images/tactical_ops/presentation/command_deck/frames/07_button_secondary.png") 24 48 24 48 / 9px 15px 9px 15px / 0 stretch;
}
@media (max-width: 620px) {
  #tacticalOpsRoot .t-command-art-shell { background-position: 50% 30%; }
  #tacticalOpsRoot .t-command-mission-feature::before { opacity: .4; }
  #tacticalOpsRoot .t-command-art-shell .t-command-pane > .t-panel:not(.t-wt-next-op) { border-image-width: 6px 8px; }
}
@media (prefers-reduced-transparency: reduce) {
  #tacticalOpsRoot .t-command-art-shell { background-image: none; background-color: #07131e; }
}

/* Premium UX pass: tactical decisions first, authored art supports rather than competes. */
#tacticalOpsRoot .t-premium-ux { gap: .52rem; }
#tacticalOpsRoot .t-premium-ux .t-wt-hero-compact { min-height: 65px; padding: .55rem .8rem; }
#tacticalOpsRoot .t-premium-ux .t-wt-hero-compact .t-wt-title { font-size: clamp(1.3rem,5vw,2rem); margin: .05rem 0; line-height:1.1; }
#tacticalOpsRoot .t-premium-ux .t-wt-hero-compact .t-wt-intro { font-size: .7rem; line-height:1.3; }
#tacticalOpsRoot .t-premium-ux .t-wt-refresh { min-height: 44px; }
#tacticalOpsRoot .t-premium-ux .t-command-nav { margin: 3px 0 8px; }
#tacticalOpsRoot .t-premium-ux .t-command-nav button { min-height: 48px; }
#tacticalOpsRoot .t-premium-ux .t-command-pane { min-height:0; }
#tacticalOpsRoot .t-premium-ux .t-command-mission-feature { display:grid; grid-template-columns: 125px minmax(0,1fr) auto; gap:.55rem; padding:.65rem; border:1px solid rgba(111,209,240,.4)!important; box-shadow:0 10px 28px rgba(0,0,0,.3)!important; }
#tacticalOpsRoot .t-premium-ux .t-wt-next-op .t-wt-feature-art { height:118px; }
#tacticalOpsRoot .t-premium-ux .t-command-mission-feature h2 { font-size:clamp(1.1rem,4vw,1.55rem); line-height:1.15; }
#tacticalOpsRoot .t-premium-ux .t-command-mission-feature .t-wt-objective { font-size:.78rem; line-height:1.35; }
#tacticalOpsRoot .t-premium-ux .t-premium-reward-strip { display:flex; flex-wrap:wrap; gap:5px; margin-top:.4rem; }
#tacticalOpsRoot .t-premium-ux .t-premium-reward-strip span { min-width:0; flex:0 1 auto; padding:.28rem .42rem; font-size:.62rem; line-height:1.25; }
#tacticalOpsRoot .t-premium-ux .t-premium-status-rail { gap:5px; }
#tacticalOpsRoot .t-premium-ux .t-premium-status-rail .t-wt-status-card { min-height:65px; padding:.5rem .6rem; }
#tacticalOpsRoot .t-premium-ux .t-premium-status-rail .t-wt-status-card small { font-size:.58rem; line-height:1.28; }
#tacticalOpsRoot .t-premium-front-link { display:flex; align-items:center; justify-content:space-between; gap:12px; min-height:53px; width:100%; text-align:left; padding:.65rem .8rem; border:1px solid rgba(115,211,235,.4); border-radius:7px; color:#e1f5fc; background:linear-gradient(110deg,rgba(8,29,42,.98),rgba(7,18,28,.98)); cursor:pointer; }
#tacticalOpsRoot .t-premium-front-link>span { display:flex; flex-direction:column; gap:3px; }
#tacticalOpsRoot .t-premium-front-link>span:last-child { flex-direction:row; align-items:center; font-size:.66rem; letter-spacing:.07em; color:#b3e9fa; white-space:nowrap; }
#tacticalOpsRoot .t-premium-front-link strong { font-size:.7rem; letter-spacing:.12em; color:#f2c67d; }
#tacticalOpsRoot .t-premium-front-link small { color:#b4cad8; font-size:.67rem; }
#tacticalOpsRoot .t-premium-squad-switch { display:grid; grid-template-columns:1fr 1fr; gap:6px; margin:0 0 9px; padding:5px; background:rgba(3,12,21,.96); border:1px solid rgba(111,192,219,.3); border-radius:8px; }
#tacticalOpsRoot .t-premium-squad-switch button { min-width:0; min-height:45px; padding:7px 5px; border:1px solid rgba(104,156,184,.2); border-radius:6px; color:#b6d3e3; background:#0a1b2b; font:800 clamp(9px,2.5vw,12px)/1.25 var(--t-font-sans); letter-spacing:.04em; cursor:pointer; }
#tacticalOpsRoot .t-premium-squad-switch button.is-selected { border-color:#80d8ef; background:linear-gradient(130deg,#17455c,#0b2c40); color:#eefbff; }
#tacticalOpsRoot .t-premium-ux .t-growth-panel { padding:clamp(11px,3vw,18px); margin:0; }
#tacticalOpsRoot .t-premium-ux .t-growth-roster { margin-top:12px; }
#tacticalOpsRoot .t-premium-ux .t-growth-roster button { display:flex; flex-direction:column; align-items:center; gap:5px; min-height:82px; padding:6px; }
#tacticalOpsRoot .t-premium-ux .t-growth-roster img { display:block; width:43px; height:43px; border-radius:7px; object-fit:cover; object-position:center 20%; border:1px solid rgba(106,212,245,.44); }
#tacticalOpsRoot .t-premium-ux .t-growth-roster span { font-size:.67rem; }
#tacticalOpsRoot .t-premium-ux .t-growth-paths button { min-height:82px; padding:10px; }
#tacticalOpsRoot .t-premium-ux .t-growth-skill-list { margin-top:9px; gap:5px; }
#tacticalOpsRoot .t-premium-ux .t-growth-skill-list button { min-height:54px; padding:9px 11px; }
#tacticalOpsRoot .t-premium-ux .t-growth-confirm { margin-top:10px; padding:11px; }
#tacticalOpsRoot .t-premium-ux .t-pack-mastery-premium { margin:0; }
#tacticalOpsRoot .t-premium-mastery-roster { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:7px; margin:11px 0; }
#tacticalOpsRoot .t-premium-mastery-roster button { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:5px; min-height:84px; padding:7px; color:#c9e6f4; border:1px solid rgba(95,179,209,.36); border-radius:8px; background:rgba(10,27,42,.93); cursor:pointer; }
#tacticalOpsRoot .t-premium-mastery-roster button.is-selected { border-color:#73d5f5; color:#fff; background:linear-gradient(160deg,#153f55,#0a2436); }
#tacticalOpsRoot .t-premium-mastery-roster button img { width:45px; height:45px; object-fit:cover; object-position:center 20%; border-radius:6px; }
#tacticalOpsRoot .t-premium-mastery-roster button strong { font-size:.68rem; }
#tacticalOpsRoot .t-premium-avatar { width:54px; height:54px; padding:2px; overflow:hidden; }
#tacticalOpsRoot .t-premium-avatar img { width:100%; height:100%; object-fit:cover; object-position:center 20%; border-radius:4px; }
#tacticalOpsRoot .t-premium-ux .t-mastery-card-v29 { border-color:rgba(100,198,233,.35); }
#tacticalOpsRoot .t-premium-ux .t-command-pane > .t-panel:not(.t-wt-next-op) { border-image:none; border:1px solid rgba(92,189,222,.3); border-radius:9px; box-shadow:0 8px 24px rgba(0,0,0,.3); }
#tacticalOpsRoot .t-premium-ux .t-command-mission-feature { border-image:none; }
@media(max-width:620px) {
  #tacticalOpsRoot .t-premium-ux .t-command-mission-feature { grid-template-columns: minmax(0,1fr); padding:.65rem; }
  #tacticalOpsRoot .t-premium-ux .t-command-mission-feature .t-wt-feature-art { height:86px; }
  #tacticalOpsRoot .t-premium-ux .t-premium-reward-strip { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:4px; }
  #tacticalOpsRoot .t-premium-ux .t-premium-reward-strip span { font-size:.57rem; overflow-wrap:anywhere; }
  #tacticalOpsRoot .t-premium-ux .t-wt-next-op .t-wt-feature-cta { margin-top:0; }
  #tacticalOpsRoot .t-premium-ux .t-wt-main-cta { min-height:49px; }
  #tacticalOpsRoot .t-premium-ux .t-wt-status-card small { display:none; }
  #tacticalOpsRoot .t-premium-ux .t-command-nav button { min-height:48px; }
}
@media(max-width:360px) {
  #tacticalOpsRoot .t-premium-ux .t-growth-paths { grid-template-columns:1fr; }
  #tacticalOpsRoot .t-premium-ux .t-premium-status-rail .t-wt-status-card { padding:6px; }
}
@media(prefers-reduced-motion:reduce) { #tacticalOpsRoot .t-premium-ux .t-command-pane { animation:none; } }

/* Final Command Deck completion: focused choices, no duplicated tall panels. */
#tacticalOpsRoot .t-op-selector { display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;margin:8px 0 12px; }
#tacticalOpsRoot .t-op-selector button { min-width:0;min-height:82px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;text-align:center;padding:8px 4px;color:#b9d6e6;background:#091b2a;border:1px solid rgba(109,188,218,.35);border-radius:8px;cursor:pointer; }
#tacticalOpsRoot .t-op-selector button.is-selected {color:#f1fbff;background:linear-gradient(155deg,#16445c,#0b2537);border-color:#77d7f4;box-shadow:inset 0 0 0 1px rgba(133,222,250,.2);}
#tacticalOpsRoot .t-op-selector button span {font-size:10px;letter-spacing:.17em;color:#e6ba74;}
#tacticalOpsRoot .t-op-selector button strong {font-size:clamp(10px,2.4vw,13px);line-height:1.25;overflow-wrap:anywhere;}
#tacticalOpsRoot .t-op-selector button small {font-size:9px;color:#a8c8d6;}
#tacticalOpsRoot .t-op-selected .t-wt-mission-card {margin:0;}
#tacticalOpsRoot .t-op-selected .t-wt-mission-art {height:clamp(130px,22vw,185px);min-height:0;}
#tacticalOpsRoot .t-deployment.t-premium-ux {padding-bottom:calc(115px + env(safe-area-inset-bottom,0px));}
#tacticalOpsRoot .t-deployment.t-premium-ux .t-deploy-hero-v29 {min-height:128px;padding:.78rem;}
#tacticalOpsRoot .t-deployment.t-premium-ux .t-deploy-hero-copy .t-title {font-size:clamp(1.35rem,5.5vw,2rem);}
#tacticalOpsRoot .t-deployment.t-premium-ux .t-deploy-hero-copy p {font-size:.75rem;line-height:1.32;}
#tacticalOpsRoot .t-deployment.t-premium-ux .t-deploy-rotation {padding:.35rem .45rem;top:.5rem;right:.5rem;}
#tacticalOpsRoot .t-deployment.t-premium-ux .t-deploy-rotation strong {font-size:.6rem;}
#tacticalOpsRoot .t-deployment.t-premium-ux .t-deploy-overview {gap:7px;}
#tacticalOpsRoot .t-brief-mastery-optional {margin-top:8px;}
#tacticalOpsRoot .t-brief-optional-toggle {min-height:48px;display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;padding:11px;color:#d8f5ff;background:rgba(8,28,41,.98);border:1px solid rgba(95,199,235,.38);border-radius:7px;cursor:pointer;}
#tacticalOpsRoot .t-brief-optional-toggle strong {letter-spacing:.13em;font-size:.72rem;}
#tacticalOpsRoot .t-brief-optional-toggle span {font-size:.64rem;color:#97d9ef;white-space:nowrap;}
#tacticalOpsRoot .t-loadout-unit-picker {display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;margin:10px 0;}
#tacticalOpsRoot .t-loadout-unit-picker button {display:flex;align-items:center;flex-direction:column;gap:5px;min-height:78px;padding:7px 3px;border-radius:7px;border:1px solid rgba(112,193,227,.35);color:#c7e3f0;background:#0a2030;cursor:pointer;}
#tacticalOpsRoot .t-loadout-unit-picker button.is-selected {border-color:#78dbf6;background:#164157;}
#tacticalOpsRoot .t-loadout-unit-picker img {height:42px;width:42px;border-radius:5px;object-fit:cover;}
#tacticalOpsRoot .t-loadout-unit-picker span {font-size:10px;font-weight:800;}
#tacticalOpsRoot .t-codex-reference {margin-top:10px;border:1px solid rgba(90,176,204,.3);padding:10px;}
#tacticalOpsRoot .t-codex-reference summary {cursor:pointer;color:#b6e8f6;font-size:11px;font-weight:800;letter-spacing:.07em;}
#tacticalOpsRoot .t-command-action-dock {z-index:45;}
#tacticalOpsRoot .t-premium-ux .t-growth-paths {grid-template-columns:repeat(2,minmax(0,1fr));}
#tacticalOpsRoot .t-premium-ux .t-growth-paths button {min-height:76px;}
@media(max-width:620px) {
  #tacticalOpsRoot .t-deployment.t-premium-ux .t-deploy-summary-main {grid-column:1/-1;}
  #tacticalOpsRoot .t-deployment.t-premium-ux .t-deploy-summary-card {padding:.6rem;}
  #tacticalOpsRoot .t-deployment.t-premium-ux .t-deploy-hero-copy {max-width:100%;padding-top:44px;}
  #tacticalOpsRoot .t-deployment.t-premium-ux .t-codex-brief {padding:11px;}
  #tacticalOpsRoot .t-premium-ux .t-growth-paths {grid-template-columns:repeat(2,minmax(0,1fr));}
}
@media(max-width:350px) {
  #tacticalOpsRoot .t-op-selector button {min-height:76px;}
  #tacticalOpsRoot .t-op-selector button strong {font-size:9px;}
}

/* Mobile Mission Brief: action buttons follow content, never overlay squad/loadout. */
@media (max-width: 768px) {
  #tacticalOpsRoot .t-deployment.t-premium-ux .t-deploy-actions.t-deploy-actions-v29.t-command-action-dock {
    position: static !important;
    inset: auto !important;
    bottom: auto !important;
    transform: none !important;
    z-index: auto !important;
    margin-top: 12px;
    box-shadow: none;
    backdrop-filter: none;
  }
  #tacticalOpsRoot .t-deployment.t-premium-ux {
    padding-bottom: max(20px, env(safe-area-inset-bottom, 0px));
  }
}

/* TACTICAL MASTERY V1: event-confirmed four-unit combat identities. */
#tacticalOpsRoot .t-skill-rank {position:absolute;top:3px;right:4px;z-index:3;font-size:8px;line-height:1;font-weight:900;letter-spacing:.04em;color:#f0d099;background:rgba(17,26,36,.96);border:1px solid rgba(245,202,119,.58);border-radius:3px;padding:3px 4px;pointer-events:none;}
#tacticalOpsRoot .t-act.t-growth-rank1 {border-color:rgba(111,212,240,.52);}
#tacticalOpsRoot .t-act.t-growth-rank2 {border-color:rgba(224,174,91,.68);box-shadow:inset 0 0 0 1px rgba(255,208,139,.12),0 0 11px rgba(211,171,105,.17);}
#tacticalOpsRoot .t-act.t-growth-trained {border-color:rgba(122,204,226,.62);}
#tacticalOpsRoot .t-act.t-growth-signature {border-color:rgba(242,194,103,.82);box-shadow:inset 0 0 0 1px rgba(255,221,154,.21),0 0 16px rgba(115,212,241,.25);}
#tacticalOpsRoot .t-status {isolation:isolate;}
#tacticalOpsRoot .t-combat-identity {display:inline-flex;width:max-content;max-width:100%;margin-top:2px;padding:2px 5px;font-size:8px;line-height:1.2;font-weight:800;letter-spacing:.075em;background:rgba(8,34,46,.91);border-left:2px solid #6edaf5;color:#baebf7;}
#tacticalOpsRoot .t-combat-identity.t-identity-cnc {border-color:#d5ae66;color:#ead4a4;}
#tacticalOpsRoot .t-combat-identity.t-identity-shadow {border-color:#6fd9c5;color:#bff5e9;}
#tacticalOpsRoot .t-combat-identity.t-identity-pet {border-color:#9cc6ff;color:#c4daff;}
#tacticalOpsRoot .t-master-fx {--fx-c:#6dddf5;position:absolute;width:0;height:0;z-index:12;pointer-events:none;filter:drop-shadow(0 0 8px var(--fx-c));}
#tacticalOpsRoot .t-master-fx.fx-affinity-alpha {--fx-c:#74dffc;}
#tacticalOpsRoot .t-master-fx.fx-affinity-cnc {--fx-c:#ecc475;}
#tacticalOpsRoot .t-master-fx.fx-affinity-shadow {--fx-c:#7bf2da;}
#tacticalOpsRoot .t-master-fx.fx-affinity-pet {--fx-c:#a9caff;}
#tacticalOpsRoot .t-master-fx-ring {position:absolute;left:0;top:0;width:66px;height:66px;border:3px solid var(--fx-c);border-radius:50%;transform:translate(-50%,-50%);opacity:0;animation:t-mastery-burst .66s ease-out both;}
#tacticalOpsRoot .t-master-fx.fx-affinity-cnc .t-master-fx-ring {border-style:dashed;border-radius:8px;}
#tacticalOpsRoot .t-master-fx.fx-affinity-shadow .t-master-fx-ring {border-width:5px;box-shadow:inset 0 0 15px rgba(112,251,209,.38);}
#tacticalOpsRoot .t-master-fx.fx-affinity-pet .t-master-fx-ring {border-style:double;border-width:6px;}
#tacticalOpsRoot .t-master-fx.fx-tier-signature .t-master-fx-ring,#tacticalOpsRoot .t-master-fx.fx-tier-rank2 .t-master-fx-ring {width:86px;height:86px;box-shadow:0 0 17px var(--fx-c);}
#tacticalOpsRoot .t-master-fx-core {position:absolute;left:0;top:0;width:12px;height:12px;background:var(--fx-c);border-radius:50%;transform:translate(-50%,-50%);animation:t-mastery-core .5s ease-out both;}
#tacticalOpsRoot .t-master-fx.fx-mode-movement .t-master-fx-ring {border-radius:25%;border-style:dotted;}
@keyframes t-mastery-burst {0% {opacity:0;scale:.36;} 24% {opacity:.92;} 100% {opacity:0;scale:1.75;}}
@keyframes t-mastery-core {0% {opacity:.9;scale:1;} 100% {opacity:0;scale:4;}}
#tacticalOpsRoot .t-master-moment {position:absolute;left:50%;bottom:clamp(86px,15%,136px);transform:translateX(-50%);z-index:32;pointer-events:none;text-align:center;min-width:130px;max-width:min(86%,300px);padding:8px 13px;background:rgba(5,17,28,.94);border:1px solid #74dffc;border-radius:6px;box-shadow:0 7px 25px rgba(0,0,0,.55);animation:t-mastery-moment .95s ease-out both;}
#tacticalOpsRoot .t-master-moment strong {display:block;color:#e8faff;font-size:11px;letter-spacing:.12em;line-height:1.2;}
#tacticalOpsRoot .t-master-moment small {display:block;margin-top:4px;color:#b8d8e8;font-size:10px;letter-spacing:.08em;}
#tacticalOpsRoot .t-master-moment-cnc {border-color:#ecc475;}
#tacticalOpsRoot .t-master-moment-shadow {border-color:#7bf2da;}
#tacticalOpsRoot .t-master-moment-pet {border-color:#a9caff;}
#tacticalOpsRoot .t-master-moment-signature {box-shadow:0 0 15px rgba(223,191,114,.23),0 8px 26px rgba(0,0,0,.6);}
@keyframes t-mastery-moment {0% {opacity:0;translate:0 6px;} 18% {opacity:1;translate:0 0;} 78% {opacity:1;} 100% {opacity:0;translate:0 -6px;}}
#tacticalOpsRoot .t-growth-delta {display:flex;gap:5px;flex-wrap:wrap;margin:.5rem 0;}
#tacticalOpsRoot .t-growth-delta b {padding:5px 7px;border:1px solid rgba(95,204,237,.44);border-radius:4px;background:#0c2737;color:#bfeeff;font-size:10px;letter-spacing:.08em;}
#tacticalOpsRoot .t-growth-signature {display:inline-block;font-size:10px;color:#efd3a1;letter-spacing:.08em;}
#tacticalOpsRoot .t-growth-confirmed {padding:10px 12px;margin:8px 0;color:#bcf4de;background:#0d2925;border-left:3px solid #6cebc1;font-size:11px;font-weight:800;letter-spacing:.05em;}
#tacticalOpsRoot .t-mastery-combat-badge {display:inline-block;margin-bottom:8px;padding:5px 8px;border:1px solid rgba(113,208,227,.45);color:#a9e1f3;font-size:10px;letter-spacing:.09em;background:#0b2535;}
#tacticalOpsRoot .t-mastery-combat-badge.is-signature {color:#f4daa0;border-color:rgba(241,200,131,.66);}
#tacticalOpsRoot .t-mastery-reward.is-unlock {border-color:rgba(224,187,112,.7);background:linear-gradient(150deg,rgba(27,41,52,.95),rgba(18,27,36,.96));}
#tacticalOpsRoot .t-mastery-unlock {margin-top:8px;padding:10px 12px;border-left:3px solid #6edaf5;background:rgba(14,51,69,.67);}
#tacticalOpsRoot .t-mastery-unlock.is-signature {border-color:#f2c981;}
#tacticalOpsRoot .t-mastery-unlock strong {font-size:11px;color:#e9f7fb;letter-spacing:.07em;}
#tacticalOpsRoot .t-mastery-unlock p {margin:5px 0 0;font-size:11px;line-height:1.5;color:#afc9d8;}
@media (max-width:390px) {#tacticalOpsRoot .t-master-moment {bottom:90px;padding:6px 10px;} #tacticalOpsRoot .t-master-moment strong {font-size:10px;} #tacticalOpsRoot .t-skill-rank {font-size:7px;padding:2px;}}
@media (prefers-reduced-motion:reduce) {#tacticalOpsRoot .t-master-fx-ring,#tacticalOpsRoot .t-master-fx-core,#tacticalOpsRoot .t-master-moment {animation:none!important;} #tacticalOpsRoot .t-master-fx-ring,#tacticalOpsRoot .t-master-fx-core {display:none;} #tacticalOpsRoot .t-master-moment {opacity:1;}}

/* Nine authored combat identity emblems: scalable, distinct from character portraits. */
#tacticalOpsRoot .t-growth-core-emblem {width:38px;height:38px;object-fit:contain;flex:none;filter:drop-shadow(0 0 6px rgba(111,207,246,.25));}
#tacticalOpsRoot .t-growth-copy {display:flex;align-items:center;gap:9px;flex-wrap:wrap;}
#tacticalOpsRoot .t-growth-path-emblem {display:block;width:42px;height:42px;object-fit:contain;margin:0 0 5px;}
#tacticalOpsRoot .t-combat-identity {align-items:center;gap:4px;}
#tacticalOpsRoot .t-combat-emblem {height:17px;width:17px;object-fit:contain;flex:none;}
@media(max-width:390px){#tacticalOpsRoot .t-growth-path-emblem{width:34px;height:34px;}#tacticalOpsRoot .t-combat-emblem{width:13px;height:13px;}}

/* Tactical Ops P2 — authored action art (cosmetic-only, no new hit areas). */
#tacticalOpsRoot .t-act-art {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  flex: 0 0 28px;
  margin: -2px auto 0;
  pointer-events: none;
}
#tacticalOpsRoot .t-act-art .t-act-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 0 4px #3ec6ff33);
}
#tacticalOpsRoot .t-act-art .t-act-fallback { display: none; }
#tacticalOpsRoot .t-act-art.has-icon-error .t-act-image { display: none; }
#tacticalOpsRoot .t-act-art.has-icon-error .t-act-fallback { display: grid; place-items: center; }
#tacticalOpsRoot .t-act.cooling .t-act-image,
#tacticalOpsRoot .t-act:disabled .t-act-image {
  filter: grayscale(.75) brightness(.65);
}
#tacticalOpsRoot .t-act.on .t-act-image { filter: drop-shadow(0 0 5px #3ec6ff77); }
#tacticalOpsRoot .t-skip .t-act-art { width: 26px; height: 26px; flex-basis: 26px; margin: 0 auto; }
#tacticalOpsRoot .t-skip:disabled .t-act-image { filter: grayscale(1) brightness(.65); }
#tacticalOpsRoot .t-cell.move::after {
  background-image: url("/images/tactical_ops/actions/action_system_move.png"), radial-gradient(circle, #3ec6ff70 0%, #3ec6ff14 72%, transparent);
  background-repeat: no-repeat;
  background-position: center;
  background-size: 82% 82%, 100% 100%;
  width: 19px;
  height: 19px;
}
#tacticalOpsRoot .t-growth-skill-label { display: inline-flex; align-items: center; gap: 8px; min-width: 0; }
#tacticalOpsRoot .t-growth-action-icon { width: 28px; height: 28px; object-fit: contain; flex-shrink: 0; }
@media (max-width: 390px) {
  #tacticalOpsRoot .t-act-art { width: 24px; height: 24px; flex-basis: 24px; }
  #tacticalOpsRoot .t-skip .t-act-art { width: 23px; height: 23px; flex-basis: 23px; }
}

/* 12-frame, row-major 4x3 transparent atlases. Never intercept battlefield taps. */
#tacticalOpsRoot .t-sprite-fx {position:absolute;z-index:14;transform:translate(-50%,-50%);width:clamp(60px,11vw,118px);height:clamp(60px,11vw,118px);pointer-events:none;overflow:visible;}
#tacticalOpsRoot .t-sprite-fx-clip {width:100%;height:100%;overflow:hidden;animation:t-fx-visibility 1s steps(1,end) both;}
#tacticalOpsRoot .t-sprite-fx-sheet {width:400%;height:300%;background-size:100% 100%;background-repeat:no-repeat;animation:t-fx-atlas 1s steps(1,end) both;will-change:transform;}
@keyframes t-fx-atlas {
  0%,8.333%{transform:translate(0,0);}
  8.334%,16.666%{transform:translate(-25%,0);}
  16.667%,24.999%{transform:translate(-50%,0);}
  25%,33.333%{transform:translate(-75%,0);}
  33.334%,41.666%{transform:translate(0,-33.333%);}
  41.667%,49.999%{transform:translate(-25%,-33.333%);}
  50%,58.333%{transform:translate(-50%,-33.333%);}
  58.334%,66.666%{transform:translate(-75%,-33.333%);}
  66.667%,74.999%{transform:translate(0,-66.666%);}
  75%,83.333%{transform:translate(-25%,-66.666%);}
  83.334%,91.666%{transform:translate(-50%,-66.666%);}
  91.667%,100%{transform:translate(-75%,-66.666%);}
}
@keyframes t-fx-visibility{0%,99%{opacity:1;}100%{opacity:0;}}
@media(prefers-reduced-motion:reduce){
  #tacticalOpsRoot .t-sprite-fx-sheet{animation:none!important;transform:translate(-50%,-33.333%);}
  #tacticalOpsRoot .t-sprite-fx-clip{animation:none!important;}
}

/* BATTLEFIELD VISUAL CLOSURE — 2026-10-21. Existing combat logic untouched. */
/* Never stamp an ability icon onto every reachable destination. */
#tacticalOpsRoot .t-cell.move::after {
  background-image: radial-gradient(circle, rgba(97,214,245,.38) 0 21%, rgba(77,193,224,.12) 40%, transparent 76%);
  background-size: 100% 100%;
  background-repeat: no-repeat;
  width: 15px;
  height: 15px;
  border: 1px solid rgba(99,215,244,.48);
  box-shadow: 0 0 7px rgba(61,198,246,.18);
}
#tacticalOpsRoot .t-cell.move:hover::after,
#tacticalOpsRoot .t-cell.move:focus-visible::after {
  width: 21px;
  height: 21px;
  border-color: #92eaff;
  box-shadow: 0 0 0 4px rgba(58,196,234,.12),0 0 13px rgba(58,196,234,.32);
}
/* Preserve every 40–44 px transparent, keyboard-accessible movement hit area. */
#tacticalOpsRoot .t-status-portrait {
  width: 32px;
  height: 32px;
  position: relative;
  display: grid;
  place-items: center;
  border: 1px solid rgba(92,194,226,.48);
  border-radius: 5px;
  background: linear-gradient(160deg,#123043,#07131f);
  overflow: hidden;
  align-self: start;
}
#tacticalOpsRoot .t-status-portrait > img {
  position:relative;
  z-index:2;
  display:block;
  width:100%;
  height:100%;
  object-fit:cover;
  object-position:center 18%;
  border:0;
}
#tacticalOpsRoot .t-status-portrait-fallback {
  position:absolute;
  z-index:1;
  width:17px;
  height:17px;
  color:#79d8f4;
  opacity:.8;
}
#tacticalOpsRoot .t-status {grid-template-columns: 32px minmax(0,1fr);column-gap:.34rem;}
#tacticalOpsRoot .t-status-main {min-width:0;}
#tacticalOpsRoot .t-status-name {overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
#tacticalOpsRoot .t-combat-identity {max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:7px;letter-spacing:.035em;}
/* The rank is a compact upper-corner stamp. Icon and skill name keep their own lines. */
#tacticalOpsRoot .t-act .t-skill-rank {
  top:3px;
  right:3px;
  max-width:calc(100% - 22px);
  font-size:clamp(6px,1.1vw,8px);
  line-height:1.1;
  letter-spacing:.015em;
  padding:2px 3px;
  border-radius:3px;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:clip;
}
#tacticalOpsRoot .t-act .t-skill-rank.is-signature {
  color:#f2d9a0;
  border-color:rgba(236,190,102,.63);
  background:#251e17;
}
#tacticalOpsRoot .t-act .name {overflow:visible;text-overflow:clip;}
/* FX stay subordinate to red danger telegraphs and never absorb input. */
#tacticalOpsRoot .t-sprite-fx {pointer-events:none;filter:drop-shadow(0 0 5px rgba(91,202,235,.18));}
#tacticalOpsRoot .t-threat-tile {z-index:16;}
@media(max-width:620px) {
  #tacticalOpsRoot .t-field > .t-status .t-status-portrait {width:28px;height:28px;}
  #tacticalOpsRoot .t-field > .t-status {grid-template-columns:28px minmax(0,1fr);}
}
@media(prefers-reduced-motion:reduce) {
  #tacticalOpsRoot .t-cell.move::after {box-shadow:none;}
}

/* FINAL BATTLEFIELD SHELL: Telegram full-screen controls + system gesture-safe gameplay. */
#tacticalOpsRoot {
  --t-battle-safe-top: max(env(safe-area-inset-top, 0px), var(--ah-chrome-top, 0px));
  --t-battle-safe-bottom: max(env(safe-area-inset-bottom, 0px), var(--ah-safe-bottom, 0px));
}
#tacticalOpsRoot .t-shell[data-screen="battle"] .t-top {
  min-height: calc(46px + var(--t-battle-safe-top));
  max-height: none;
  padding-top: calc(var(--t-battle-safe-top) + 5px);
  padding-left: max(10px, var(--ah-safe-left, 0px));
  padding-right: max(10px, var(--ah-safe-right, 0px));
}
#tacticalOpsRoot .t-shell[data-screen="battle"] .t-top .t-brand { min-width: 0; }
#tacticalOpsRoot .t-shell[data-screen="battle"] .t-dock {
  padding-bottom: calc(10px + var(--t-battle-safe-bottom));
}
#tacticalOpsRoot .t-shell[data-screen="battle"] .t-field > .t-status,
#tacticalOpsRoot .t-shell[data-screen="battle"] .t-field > .t-obj-chip {top:10px;}
#tacticalOpsRoot .t-shell[data-screen="battle"] .t-status .t-combat-emblem[src=""] {display:none;}
body:has(#tacticalOpsRoot[data-open="1"] .t-shell[data-screen="battle"]) #ahCommunityBtn {
  visibility:hidden !important;
  pointer-events:none !important;
}
@media(max-width:620px) {
 #tacticalOpsRoot .t-shell[data-screen="battle"] .t-top {
   grid-template-columns:minmax(0,1fr) auto;
   gap:5px;
 }
 #tacticalOpsRoot .t-shell[data-screen="battle"] .t-top .t-obj {
   display:none;
 }
 #tacticalOpsRoot .t-shell[data-screen="battle"] .t-top .t-turn {
   justify-self:end;
 }
 #tacticalOpsRoot .t-shell[data-screen="battle"] .t-field > .t-status,
 #tacticalOpsRoot .t-shell[data-screen="battle"] .t-field > .t-obj-chip {
   top:12px;
 }
}

/* Player clarity: next mission, truthful progression, action recovery. */
#tacticalOpsRoot .t-player-route{display:grid;gap:6px;padding:12px 14px;margin:7px 0 11px;border:1px solid rgba(106,207,232,.57);border-left:3px solid #72d8ef;background:linear-gradient(110deg,rgba(12,49,64,.95),rgba(8,24,36,.96));border-radius:7px}
#tacticalOpsRoot .t-player-route>strong{font-family:var(--t-font-display);font-size:1rem;letter-spacing:.08em;color:#e1f7ff}
#tacticalOpsRoot .t-player-route>p{font-size:.77rem;line-height:1.35;margin:0;color:#b8d8e8}
#tacticalOpsRoot .t-player-route>small{font-size:.67rem;line-height:1.35;color:#b4cbd5}
#tacticalOpsRoot .t-player-route-metrics{display:flex;gap:5px;flex-wrap:wrap}
#tacticalOpsRoot .t-player-route-metrics span{padding:5px 7px;border:1px solid rgba(105,198,233,.28);background:rgba(5,26,39,.83);color:#c1e7f3;font-weight:800;font-size:.59rem;letter-spacing:.045em}
#tacticalOpsRoot .t-player-mission-counter{font-size:.65rem;font-weight:800;letter-spacing:.06em;color:#a9dbe9;margin-bottom:6px}
#tacticalOpsRoot .t-player-result-meaning{font-size:.76rem;line-height:1.45;margin:8px 0;padding:10px;color:#cfedf6;background:#102c3a;border-left:3px solid #70d8eb}
#tacticalOpsRoot .t-player-guidance{position:absolute;z-index:30;left:50%;top:72px;transform:translateX(-50%);width:max-content;max-width:min(82%,340px);display:flex;flex-direction:column;gap:3px;padding:7px 10px;pointer-events:none;text-align:center;border:1px solid rgba(96,194,225,.4);border-radius:6px;background:rgba(4,22,34,.93);box-shadow:0 6px 18px rgba(0,0,0,.26)}
#tacticalOpsRoot .t-player-guidance strong{font-size:.66rem;letter-spacing:.09em;color:#caf3fc}
#tacticalOpsRoot .t-player-guidance span{font-size:.66rem;line-height:1.3;color:#b4d6e2}
@media(max-width:620px){#tacticalOpsRoot .t-player-guidance{top:60px;max-width:75%;padding:5px 8px}#tacticalOpsRoot .t-player-guidance span{font-size:.60rem}}
`,So={requestClose:()=>{},dbg:!1};function Co(e){So={...So,...e}}function wo(e,t){let n=Math.max(0,Math.round(e));return n<=599?`compact`:n<=899?`standard`:`wide`}var To=`tacticalOpsRoot`,Eo=`tacticalOpsStyles`,Do=`tacticalOpsFonts`,G={apiPost:null,tg:null,dbg:!1,root:null,isOpen:!1,reactRoot:null,keyHandlerBound:!1,resizeBound:!1,prevBodyOverflow:``,prevHtmlOverflow:``,resizeObserver:null,battleWatcher:null},Oo=Promise.resolve();try{window.__AH_TACTICAL_OPS_VER__=ui,window.__TACTICAL_COMBAT__=or}catch{}function ko(){let e=document.getElementById(Eo);e||(e=document.createElement(`style`),e.id=Eo,document.head.appendChild(e)),e.textContent=xo}function Ao(){if(document.getElementById(Do))return;let e=document.createElement(`link`);e.id=Do,e.rel=`stylesheet`,e.href=`https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Source+Sans+3:wght@400;600;700&display=swap`,document.head.appendChild(e)}function jo(){let e=G.root||document.getElementById(To);if(!e)return;let t=window.visualViewport,n=G.tg?.viewportStableHeight||G.tg?.viewportHeight,r=Math.max(1,Math.round(t?.width||e.clientWidth||window.innerWidth)),i=Math.max(1,Math.round(t?.height||(typeof n==`number`?n:0)||window.innerHeight)),a=Math.round(t?.offsetTop||0),o=Math.round(t?.offsetLeft||0);e.style.position=`fixed`,e.style.left=`${o}px`,e.style.top=`${a}px`,e.style.right=`auto`,e.style.bottom=`auto`,e.style.width=`${r}px`,e.style.height=`${i}px`,e.style.maxHeight=`${i}px`,e.style.setProperty(`--tops-w`,`${r}px`),e.style.setProperty(`--tops-h`,`${i}px`),e.setAttribute(`data-layout`,wo(r,i)),Mo(e,r,i)}function Mo(e,t,n){let r=e.querySelector(`.t-field-wrap`);if(!r)return;let i=e.getAttribute(`data-layout`)||wo(t,n),a=t=>{let n=e.querySelector(t);return n?Math.round(n.getBoundingClientRect().height):0},o=a(`.t-top`)+a(`.t-dock`),s=i===`wide`?Math.max(160,n):Math.max(160,n-o);e.style.setProperty(`--tops-field-h`,`${s}px`),r.style.display=`block`,r.style.width=`100%`,r.style.minWidth=`0`,r.style.overflow=`hidden`,i===`wide`?(r.style.position=`absolute`,r.style.inset=`0`,r.style.height=`100%`,r.style.minHeight=`100%`,r.style.maxHeight=`none`):(r.style.position=`relative`,r.style.inset=`auto`,r.style.flex=`1 1 auto`,r.style.height=`${s}px`,r.style.minHeight=`${s}px`,r.style.maxHeight=`${s}px`);let c=e.querySelector(`.t-field`);c&&(c.style.position=`absolute`,c.style.inset=`0`,c.style.width=`100%`,c.style.height=`100%`);let l=e.querySelector(`.t-field-art`);l&&(l.style.position=`absolute`,l.style.inset=`0`,l.style.width=`100%`,l.style.height=`100%`,l.style.objectFit=`cover`,l.style.display=`block`)}function No(){jo()}function Po(){if(!G.resizeBound){window.addEventListener(`resize`,No);try{window.visualViewport?.addEventListener(`resize`,No),window.visualViewport?.addEventListener(`scroll`,No)}catch{}try{G.resizeObserver=new ResizeObserver(No),G.resizeObserver.observe(document.documentElement),G.root&&G.resizeObserver.observe(G.root)}catch{G.resizeObserver=null}Fo(),G.resizeBound=!0}}function Fo(){if(G.root&&!G.battleWatcher)try{G.battleWatcher=new MutationObserver(()=>{requestAnimationFrame(()=>jo())}),G.battleWatcher.observe(G.root,{childList:!0,subtree:!0})}catch{G.battleWatcher=null}}function Io(){if(G.resizeBound){window.removeEventListener(`resize`,No);try{window.visualViewport?.removeEventListener(`resize`,No),window.visualViewport?.removeEventListener(`scroll`,No)}catch{}try{G.resizeObserver?.disconnect()}catch{}G.resizeObserver=null;try{G.battleWatcher?.disconnect()}catch{}G.battleWatcher=null,G.resizeBound=!1}}function Lo(){G.prevBodyOverflow=document.body.style.overflow,G.prevHtmlOverflow=document.documentElement.style.overflow,document.body.style.overflow=`hidden`,document.documentElement.style.overflow=`hidden`}function Ro(){document.body.style.overflow=G.prevBodyOverflow,document.documentElement.style.overflow=G.prevHtmlOverflow}function zo(e){if(!G.isOpen||e.key!==`Escape`)return;let t=B.getState();t.screen===`battle`&&t.battle.mode===`targeting`?(t.cancel(),e.preventDefault(),e.stopPropagation()):t.screen===`brief`?(t.backToHub(),e.preventDefault(),e.stopPropagation()):(e.preventDefault(),e.stopPropagation(),qo())}function Bo(){G.keyHandlerBound||(document.addEventListener(`keydown`,zo,!0),G.keyHandlerBound=!0)}function Vo(){G.keyHandlerBound&&(document.removeEventListener(`keydown`,zo,!0),G.keyHandlerBound=!1)}function Ho(){ko(),Ao();let e=document.getElementById(To);return e||(e=document.createElement(`div`),e.id=To,e.setAttribute(`data-open`,`0`),document.body.appendChild(e)),G.root=e,e}function Uo(){G.isOpen=!1,Vo(),Io(),Ro(),G.reactRoot&&(G.reactRoot.unmount(),G.reactRoot=null);let e=G.root||document.getElementById(To);e&&(e.setAttribute(`data-open`,`0`),e.innerHTML=``);try{B.getState().backToHub()}catch{}}function Wo(){let e={close:()=>{Uo()},isOpen:()=>G.isOpen},t=window;try{t.AlphaNav?.push?t.AlphaNav.push(To,e):(t.navRegister?.(To,e),t.navOpen?.(To))}catch{}}function Go(e){let t=e&&typeof e==`object`?e:{};typeof t.apiPost==`function`&&(G.apiPost=t.apiPost),t.tg&&(G.tg=t.tg),typeof t.dbg==`boolean`&&(G.dbg=t.dbg);try{if(G.apiPost&&typeof window<`u`){let e=window;typeof e.apiPost!=`function`&&(e.apiPost=G.apiPost)}}catch{}return t.onboarding===`session`?(B.getState().configureOnboarding({enabled:!0}),Oo=Promise.resolve()):t.onboarding===`off`?(B.getState().configureOnboarding({enabled:!1}),Oo=Promise.resolve()):Oo=B.getState().loadFoundationProgression(),Co({requestClose:qo,dbg:G.dbg}),Yo}async function Ko(e){await Oo,typeof e==`string`&&e&&B.getState().openOperationBrief(e);let t=Ho();Co({requestClose:qo,dbg:G.dbg}),G.isOpen=!0,t.setAttribute(`data-open`,`1`),Lo(),Bo(),Po(),jo(),G.reactRoot||(G.reactRoot=(0,b.createRoot)(t)),G.reactRoot.render((0,y.createElement)(bo)),Wo();try{G.tg?.expand?.()}catch{}requestAnimationFrame(()=>jo()),setTimeout(()=>jo(),50)}function qo(){if(!G.isOpen)return;let e=window;try{if(e.AlphaNav?.close?.(To,{source:`tactical-ops-close`}))return}catch{}Uo();try{e.navClose?.(To)}catch{}}function Jo(){return{...ua(),open:G.isOpen,version:ui}}var Yo={init:Go,open:Ko,close:qo,refresh:Jo,getState:Jo};function Xo(){return window.TacticalOps=Yo,Yo}var Zo=Xo();try{let e=window;e.__AH_TACTICAL_OPS_VER__=ui,e.__TACTICAL_COMBAT__=or,e.TacticalOps=Zo}catch{}return e.API=Yo,e.BATTLEFIELD_LAB_KEY=ft,e.BATTLEFIELD_VNEXT_PREVIEW=M,e.DEF_CURVE=ht,e.GRID_COLS=N,e.GRID_ROWS=pt,e.METER_MAX=mt,e.STATUS_LABEL=Tt,e.STATUS_SHORT=Et,e.VERSION=ui,e.a1Range=ar,e.advanceToNext=Xn,e.aiUsesLegalRules=fn,e.applyAi=rr,e.applySkill=nn,e.applyStatus=yt,e.availableSkills=rn,e.beginUnitTurn=Yn,e.canOccupy=It,e.canRecover=Qn,e.cellKey=jt,e.chebyshev=At,e.chooseAiAction=dn,e.computeHeal=Ot,e.consumeMeter=Jt,e.cooldownLeft=$t,e.createBattle=Gn,e.default=Zo,e.effectiveAtk=xt,e.effectiveDef=St,e.effectiveSpd=Ct,e.evaluateOutcome=qn,e.fieldPercent=Lt,e.hasStatus=vt,e.inBounds=kt,e.inSkillRange=Rt,e.incomingDamageMultiplier=wt,e.isLegalTargetType=Wt,e.living=zt,e.mitigatedDamage=Dt,e.occupiedKeys=Mt,e.pickReadyId=qt,e.planAi=ir,e.previewQueue=Yt,e.reachableCells=Ft,e.resetStatusSeq=_t,e.resolveSkillTargets=Vt,e.skillNeedsTargetPick=Ut,e.skillReady=en,e.startBattle=Zn,e.tickUntilReady=Kt,e.tryMove=er,e.tryRecover=$n,e.trySkill=nr,e.trySkip=tr,e.unitAt=Nt,e.unitSkills=Qt,e.unitsInRadius=Bt,e.validTargetIds=Ht,e})({});