/* tactical_ops.js v3.6.63-tactical-power-v1 */
var TacticalOpsBundle=(function(e){Object.defineProperties(e,{__esModule:{value:!0},[Symbol.toStringTag]:{value:`Module`}});var t=Object.create,n=Object.defineProperty,r=Object.getOwnPropertyDescriptor,i=Object.getOwnPropertyNames,a=Object.getPrototypeOf,o=Object.prototype.hasOwnProperty,s=(e,t)=>()=>(t||(e((t={exports:{}}).exports,t),e=null),t.exports),c=(e,t)=>{let r={};for(var i in e)n(r,i,{get:e[i],enumerable:!0});return t||n(r,Symbol.toStringTag,{value:`Module`}),r},l=(e,t,a,s)=>{if(t&&typeof t==`object`||typeof t==`function`)for(var c=i(t),l=0,u=c.length,d;l<u;l++)d=c[l],!o.call(e,d)&&d!==a&&n(e,d,{get:(e=>t[e]).bind(null,d),enumerable:!(s=r(t,d))||s.enumerable});return e},u=(e,r,i)=>(i=e==null?{}:t(a(e)),l(r||!e||!e.__esModule||!o.call(e,`default`)?n(i,`default`,{value:e,enumerable:!0}):i,e)),d=s((e=>{function t(e,t){var n=e.length;e.push(t);a:for(;0<n;){var r=n-1>>>1,a=e[r];if(0<i(a,t))e[r]=t,e[n]=a,n=r;else break a}}function n(e){return e.length===0?null:e[0]}function r(e){if(e.length===0)return null;var t=e[0],n=e.pop();if(n!==t){e[0]=n;a:for(var r=0,a=e.length,o=a>>>1;r<o;){var s=2*(r+1)-1,c=e[s],l=s+1,u=e[l];if(0>i(c,n))l<a&&0>i(u,c)?(e[r]=u,e[l]=n,r=l):(e[r]=c,e[s]=n,r=s);else if(l<a&&0>i(u,n))e[r]=u,e[l]=n,r=l;else break a}}return t}function i(e,t){var n=e.sortIndex-t.sortIndex;return n===0?e.id-t.id:n}if(e.unstable_now=void 0,typeof performance==`object`&&typeof performance.now==`function`){var a=performance;e.unstable_now=function(){return a.now()}}else{var o=Date,s=o.now();e.unstable_now=function(){return o.now()-s}}var c=[],l=[],u=1,d=null,f=3,p=!1,m=!1,h=!1,g=!1,_=typeof setTimeout==`function`?setTimeout:null,v=typeof clearTimeout==`function`?clearTimeout:null,y=typeof setImmediate<`u`?setImmediate:null;function b(e){for(var i=n(l);i!==null;){if(i.callback===null)r(l);else if(i.startTime<=e)r(l),i.sortIndex=i.expirationTime,t(c,i);else break;i=n(l)}}function x(e){if(h=!1,b(e),!m){if(n(c)!==null)m=!0,S||(S=!0,O());else{var t=n(l);t!==null&&A(x,t.startTime-e)}}}var S=!1,C=-1,w=5,T=-1;function E(){return g?!0:!(e.unstable_now()-T<w)}function D(){if(g=!1,S){var t=e.unstable_now();T=t;var i=!0;try{a:{m=!1,h&&(h=!1,v(C),C=-1),p=!0;var a=f;try{b:{for(b(t),d=n(c);d!==null&&!(d.expirationTime>t&&E());){var o=d.callback;if(typeof o==`function`){d.callback=null,f=d.priorityLevel;var s=o(d.expirationTime<=t);if(t=e.unstable_now(),typeof s==`function`){d.callback=s,b(t),i=!0;break b}d===n(c)&&r(c),b(t)}else r(c);d=n(c)}if(d!==null)i=!0;else{var u=n(l);u!==null&&A(x,u.startTime-t),i=!1}}break a}finally{d=null,f=a,p=!1}i=void 0}}finally{i?O():S=!1}}}var O;if(typeof y==`function`)O=function(){y(D)};else if(typeof MessageChannel<`u`){var k=new MessageChannel,ee=k.port2;k.port1.onmessage=D,O=function(){ee.postMessage(null)}}else O=function(){_(D,0)};function A(t,n){C=_(function(){t(e.unstable_now())},n)}e.unstable_IdlePriority=5,e.unstable_ImmediatePriority=1,e.unstable_LowPriority=4,e.unstable_NormalPriority=3,e.unstable_Profiling=null,e.unstable_UserBlockingPriority=2,e.unstable_cancelCallback=function(e){e.callback=null},e.unstable_forceFrameRate=function(e){0>e||125<e?console.error(`forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported`):w=0<e?Math.floor(1e3/e):5},e.unstable_getCurrentPriorityLevel=function(){return f},e.unstable_next=function(e){switch(f){case 1:case 2:case 3:var t=3;break;default:t=f}var n=f;f=t;try{return e()}finally{f=n}},e.unstable_requestPaint=function(){g=!0},e.unstable_runWithPriority=function(e,t){switch(e){case 1:case 2:case 3:case 4:case 5:break;default:e=3}var n=f;f=e;try{return t()}finally{f=n}},e.unstable_scheduleCallback=function(r,i,a){var o=e.unstable_now();switch(typeof a==`object`&&a?(a=a.delay,a=typeof a==`number`&&0<a?o+a:o):a=o,r){case 1:var s=-1;break;case 2:s=250;break;case 5:s=1073741823;break;case 4:s=1e4;break;default:s=5e3}return s=a+s,r={id:u++,callback:i,priorityLevel:r,startTime:a,expirationTime:s,sortIndex:-1},a>o?(r.sortIndex=a,t(l,r),n(c)===null&&r===n(l)&&(h?(v(C),C=-1):h=!0,A(x,a-o))):(r.sortIndex=s,t(c,r),m||p||(m=!0,S||(S=!0,O()))),r},e.unstable_shouldYield=E,e.unstable_wrapCallback=function(e){var t=f;return function(){var n=f;f=t;try{return e.apply(this,arguments)}finally{f=n}}}})),f=s(((e,t)=>{t.exports=d()})),p=s((e=>{var t=Symbol.for(`react.transitional.element`),n=Symbol.for(`react.portal`),r=Symbol.for(`react.fragment`),i=Symbol.for(`react.strict_mode`),a=Symbol.for(`react.profiler`),o=Symbol.for(`react.consumer`),s=Symbol.for(`react.context`),c=Symbol.for(`react.forward_ref`),l=Symbol.for(`react.suspense`),u=Symbol.for(`react.memo`),d=Symbol.for(`react.lazy`),f=Symbol.for(`react.activity`),p=Symbol.iterator;function m(e){return typeof e!=`object`||!e?null:(e=p&&e[p]||e[`@@iterator`],typeof e==`function`?e:null)}var h={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},g=Object.assign,_={};function v(e,t,n){this.props=e,this.context=t,this.refs=_,this.updater=n||h}v.prototype.isReactComponent={},v.prototype.setState=function(e,t){if(typeof e!=`object`&&typeof e!=`function`&&e!=null)throw Error(`takes an object of state variables to update or a function which returns an object of state variables.`);this.updater.enqueueSetState(this,e,t,`setState`)},v.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,`forceUpdate`)};function y(){}y.prototype=v.prototype;function b(e,t,n){this.props=e,this.context=t,this.refs=_,this.updater=n||h}var x=b.prototype=new y;x.constructor=b,g(x,v.prototype),x.isPureReactComponent=!0;var S=Array.isArray;function C(){}var w={H:null,A:null,T:null,S:null},T=Object.prototype.hasOwnProperty;function E(e,n,r){var i=r.ref;return{$$typeof:t,type:e,key:n,ref:i===void 0?null:i,props:r}}function D(e,t){return E(e.type,t,e.props)}function O(e){return typeof e==`object`&&!!e&&e.$$typeof===t}function k(e){var t={"=":`=0`,":":`=2`};return`$`+e.replace(/[=:]/g,function(e){return t[e]})}var ee=/\/+/g;function A(e,t){return typeof e==`object`&&e&&e.key!=null?k(``+e.key):t.toString(36)}function j(e){switch(e.status){case`fulfilled`:return e.value;case`rejected`:throw e.reason;default:switch(typeof e.status==`string`?e.then(C,C):(e.status=`pending`,e.then(function(t){e.status===`pending`&&(e.status=`fulfilled`,e.value=t)},function(t){e.status===`pending`&&(e.status=`rejected`,e.reason=t)})),e.status){case`fulfilled`:return e.value;case`rejected`:throw e.reason}}throw e}function te(e,r,i,a,o){var s=typeof e;(s===`undefined`||s===`boolean`)&&(e=null);var c=!1;if(e===null)c=!0;else switch(s){case`bigint`:case`string`:case`number`:c=!0;break;case`object`:switch(e.$$typeof){case t:case n:c=!0;break;case d:return c=e._init,te(c(e._payload),r,i,a,o)}}if(c)return o=o(e),c=a===``?`.`+A(e,0):a,S(o)?(i=``,c!=null&&(i=c.replace(ee,`$&/`)+`/`),te(o,r,i,``,function(e){return e})):o!=null&&(O(o)&&(o=D(o,i+(o.key==null||e&&e.key===o.key?``:(``+o.key).replace(ee,`$&/`)+`/`)+c)),r.push(o)),1;c=0;var l=a===``?`.`:a+`:`;if(S(e))for(var u=0;u<e.length;u++)a=e[u],s=l+A(a,u),c+=te(a,r,i,s,o);else if(u=m(e),typeof u==`function`)for(e=u.call(e),u=0;!(a=e.next()).done;)a=a.value,s=l+A(a,u++),c+=te(a,r,i,s,o);else if(s===`object`){if(typeof e.then==`function`)return te(j(e),r,i,a,o);throw r=String(e),Error(`Objects are not valid as a React child (found: `+(r===`[object Object]`?`object with keys {`+Object.keys(e).join(`, `)+`}`:r)+`). If you meant to render a collection of children, use an array instead.`)}return c}function M(e,t,n){if(e==null)return e;var r=[],i=0;return te(e,r,``,``,function(e){return t.call(n,e,i++)}),r}function N(e){if(e._status===-1){var t=e._result;t=t(),t.then(function(t){(e._status===0||e._status===-1)&&(e._status=1,e._result=t)},function(t){(e._status===0||e._status===-1)&&(e._status=2,e._result=t)}),e._status===-1&&(e._status=0,e._result=t)}if(e._status===1)return e._result.default;throw e._result}var P=typeof reportError==`function`?reportError:function(e){if(typeof window==`object`&&typeof window.ErrorEvent==`function`){var t=new window.ErrorEvent(`error`,{bubbles:!0,cancelable:!0,message:typeof e==`object`&&e&&typeof e.message==`string`?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process==`object`&&typeof process.emit==`function`){process.emit(`uncaughtException`,e);return}console.error(e)},F={map:M,forEach:function(e,t,n){M(e,function(){t.apply(this,arguments)},n)},count:function(e){var t=0;return M(e,function(){t++}),t},toArray:function(e){return M(e,function(e){return e})||[]},only:function(e){if(!O(e))throw Error(`React.Children.only expected to receive a single React element child.`);return e}};e.Activity=f,e.Children=F,e.Component=v,e.Fragment=r,e.Profiler=a,e.PureComponent=b,e.StrictMode=i,e.Suspense=l,e.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=w,e.__COMPILER_RUNTIME={__proto__:null,c:function(e){return w.H.useMemoCache(e)}},e.cache=function(e){return function(){return e.apply(null,arguments)}},e.cacheSignal=function(){return null},e.cloneElement=function(e,t,n){if(e==null)throw Error(`The argument must be a React element, but you passed `+e+`.`);var r=g({},e.props),i=e.key;if(t!=null)for(a in t.key!==void 0&&(i=``+t.key),t)!T.call(t,a)||a===`key`||a===`__self`||a===`__source`||a===`ref`&&t.ref===void 0||(r[a]=t[a]);var a=arguments.length-2;if(a===1)r.children=n;else if(1<a){for(var o=Array(a),s=0;s<a;s++)o[s]=arguments[s+2];r.children=o}return E(e.type,i,r)},e.createContext=function(e){return e={$$typeof:s,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null},e.Provider=e,e.Consumer={$$typeof:o,_context:e},e},e.createElement=function(e,t,n){var r,i={},a=null;if(t!=null)for(r in t.key!==void 0&&(a=``+t.key),t)T.call(t,r)&&r!==`key`&&r!==`__self`&&r!==`__source`&&(i[r]=t[r]);var o=arguments.length-2;if(o===1)i.children=n;else if(1<o){for(var s=Array(o),c=0;c<o;c++)s[c]=arguments[c+2];i.children=s}if(e&&e.defaultProps)for(r in o=e.defaultProps,o)i[r]===void 0&&(i[r]=o[r]);return E(e,a,i)},e.createRef=function(){return{current:null}},e.forwardRef=function(e){return{$$typeof:c,render:e}},e.isValidElement=O,e.lazy=function(e){return{$$typeof:d,_payload:{_status:-1,_result:e},_init:N}},e.memo=function(e,t){return{$$typeof:u,type:e,compare:t===void 0?null:t}},e.startTransition=function(e){var t=w.T,n={};w.T=n;try{var r=e(),i=w.S;i!==null&&i(n,r),typeof r==`object`&&r&&typeof r.then==`function`&&r.then(C,P)}catch(e){P(e)}finally{t!==null&&n.types!==null&&(t.types=n.types),w.T=t}},e.unstable_useCacheRefresh=function(){return w.H.useCacheRefresh()},e.use=function(e){return w.H.use(e)},e.useActionState=function(e,t,n){return w.H.useActionState(e,t,n)},e.useCallback=function(e,t){return w.H.useCallback(e,t)},e.useContext=function(e){return w.H.useContext(e)},e.useDebugValue=function(){},e.useDeferredValue=function(e,t){return w.H.useDeferredValue(e,t)},e.useEffect=function(e,t){return w.H.useEffect(e,t)},e.useEffectEvent=function(e){return w.H.useEffectEvent(e)},e.useId=function(){return w.H.useId()},e.useImperativeHandle=function(e,t,n){return w.H.useImperativeHandle(e,t,n)},e.useInsertionEffect=function(e,t){return w.H.useInsertionEffect(e,t)},e.useLayoutEffect=function(e,t){return w.H.useLayoutEffect(e,t)},e.useMemo=function(e,t){return w.H.useMemo(e,t)},e.useOptimistic=function(e,t){return w.H.useOptimistic(e,t)},e.useReducer=function(e,t,n){return w.H.useReducer(e,t,n)},e.useRef=function(e){return w.H.useRef(e)},e.useState=function(e){return w.H.useState(e)},e.useSyncExternalStore=function(e,t,n){return w.H.useSyncExternalStore(e,t,n)},e.useTransition=function(){return w.H.useTransition()},e.version=`19.2.0`})),m=s(((e,t)=>{t.exports=p()})),h=s((e=>{var t=m();function n(e){var t=`https://react.dev/errors/`+e;if(1<arguments.length){t+=`?args[]=`+encodeURIComponent(arguments[1]);for(var n=2;n<arguments.length;n++)t+=`&args[]=`+encodeURIComponent(arguments[n])}return`Minified React error #`+e+`; visit `+t+` for the full message or use the non-minified dev environment for full errors and additional helpful warnings.`}function r(){}var i={d:{f:r,r:function(){throw Error(n(522))},D:r,C:r,L:r,m:r,X:r,S:r,M:r},p:0,findDOMNode:null},a=Symbol.for(`react.portal`);function o(e,t,n){var r=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:a,key:r==null?null:``+r,children:e,containerInfo:t,implementation:n}}var s=t.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;function c(e,t){if(e===`font`)return``;if(typeof t==`string`)return t===`use-credentials`?t:``}e.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=i,e.createPortal=function(e,t){var r=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)throw Error(n(299));return o(e,t,null,r)},e.flushSync=function(e){var t=s.T,n=i.p;try{if(s.T=null,i.p=2,e)return e()}finally{s.T=t,i.p=n,i.d.f()}},e.preconnect=function(e,t){typeof e==`string`&&(t?(t=t.crossOrigin,t=typeof t==`string`?t===`use-credentials`?t:``:void 0):t=null,i.d.C(e,t))},e.prefetchDNS=function(e){typeof e==`string`&&i.d.D(e)},e.preinit=function(e,t){if(typeof e==`string`&&t&&typeof t.as==`string`){var n=t.as,r=c(n,t.crossOrigin),a=typeof t.integrity==`string`?t.integrity:void 0,o=typeof t.fetchPriority==`string`?t.fetchPriority:void 0;n===`style`?i.d.S(e,typeof t.precedence==`string`?t.precedence:void 0,{crossOrigin:r,integrity:a,fetchPriority:o}):n===`script`&&i.d.X(e,{crossOrigin:r,integrity:a,fetchPriority:o,nonce:typeof t.nonce==`string`?t.nonce:void 0})}},e.preinitModule=function(e,t){if(typeof e==`string`){if(typeof t==`object`&&t){if(t.as==null||t.as===`script`){var n=c(t.as,t.crossOrigin);i.d.M(e,{crossOrigin:n,integrity:typeof t.integrity==`string`?t.integrity:void 0,nonce:typeof t.nonce==`string`?t.nonce:void 0})}}else t??i.d.M(e)}},e.preload=function(e,t){if(typeof e==`string`&&typeof t==`object`&&t&&typeof t.as==`string`){var n=t.as,r=c(n,t.crossOrigin);i.d.L(e,n,{crossOrigin:r,integrity:typeof t.integrity==`string`?t.integrity:void 0,nonce:typeof t.nonce==`string`?t.nonce:void 0,type:typeof t.type==`string`?t.type:void 0,fetchPriority:typeof t.fetchPriority==`string`?t.fetchPriority:void 0,referrerPolicy:typeof t.referrerPolicy==`string`?t.referrerPolicy:void 0,imageSrcSet:typeof t.imageSrcSet==`string`?t.imageSrcSet:void 0,imageSizes:typeof t.imageSizes==`string`?t.imageSizes:void 0,media:typeof t.media==`string`?t.media:void 0})}},e.preloadModule=function(e,t){if(typeof e==`string`){if(t){var n=c(t.as,t.crossOrigin);i.d.m(e,{as:typeof t.as==`string`&&t.as!==`script`?t.as:void 0,crossOrigin:n,integrity:typeof t.integrity==`string`?t.integrity:void 0})}else i.d.m(e)}},e.requestFormReset=function(e){i.d.r(e)},e.unstable_batchedUpdates=function(e,t){return e(t)},e.useFormState=function(e,t,n){return s.H.useFormState(e,t,n)},e.useFormStatus=function(){return s.H.useHostTransitionStatus()},e.version=`19.2.0`})),g=s(((e,t)=>{function n(){if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<`u`&&typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE==`function`)try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(n)}catch(e){console.error(e)}}n(),t.exports=h()})),_=s((e=>{var t=f(),n=m(),r=g();function i(e){var t=`https://react.dev/errors/`+e;if(1<arguments.length){t+=`?args[]=`+encodeURIComponent(arguments[1]);for(var n=2;n<arguments.length;n++)t+=`&args[]=`+encodeURIComponent(arguments[n])}return`Minified React error #`+e+`; visit `+t+` for the full message or use the non-minified dev environment for full errors and additional helpful warnings.`}function a(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)}function o(e){var t=e,n=e;if(e.alternate)for(;t.return;)t=t.return;else{e=t;do t=e,t.flags&4098&&(n=t.return),e=t.return;while(e)}return t.tag===3?n:null}function s(e){if(e.tag===13){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function c(e){if(e.tag===31){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function l(e){if(o(e)!==e)throw Error(i(188))}function u(e){var t=e.alternate;if(!t){if(t=o(e),t===null)throw Error(i(188));return t===e?e:null}for(var n=e,r=t;;){var a=n.return;if(a===null)break;var s=a.alternate;if(s===null){if(r=a.return,r!==null){n=r;continue}break}if(a.child===s.child){for(s=a.child;s;){if(s===n)return l(a),e;if(s===r)return l(a),t;s=s.sibling}throw Error(i(188))}if(n.return!==r.return)n=a,r=s;else{for(var c=!1,u=a.child;u;){if(u===n){c=!0,n=a,r=s;break}if(u===r){c=!0,r=a,n=s;break}u=u.sibling}if(!c){for(u=s.child;u;){if(u===n){c=!0,n=s,r=a;break}if(u===r){c=!0,r=s,n=a;break}u=u.sibling}if(!c)throw Error(i(189))}}if(n.alternate!==r)throw Error(i(190))}if(n.tag!==3)throw Error(i(188));return n.stateNode.current===n?e:t}function d(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e;for(e=e.child;e!==null;){if(t=d(e),t!==null)return t;e=e.sibling}return null}var p=Object.assign,h=Symbol.for(`react.element`),_=Symbol.for(`react.transitional.element`),v=Symbol.for(`react.portal`),y=Symbol.for(`react.fragment`),b=Symbol.for(`react.strict_mode`),x=Symbol.for(`react.profiler`),S=Symbol.for(`react.consumer`),C=Symbol.for(`react.context`),w=Symbol.for(`react.forward_ref`),T=Symbol.for(`react.suspense`),E=Symbol.for(`react.suspense_list`),D=Symbol.for(`react.memo`),O=Symbol.for(`react.lazy`),k=Symbol.for(`react.activity`),ee=Symbol.for(`react.memo_cache_sentinel`),A=Symbol.iterator;function j(e){return typeof e!=`object`||!e?null:(e=A&&e[A]||e[`@@iterator`],typeof e==`function`?e:null)}var te=Symbol.for(`react.client.reference`);function M(e){if(e==null)return null;if(typeof e==`function`)return e.$$typeof===te?null:e.displayName||e.name||null;if(typeof e==`string`)return e;switch(e){case y:return`Fragment`;case x:return`Profiler`;case b:return`StrictMode`;case T:return`Suspense`;case E:return`SuspenseList`;case k:return`Activity`}if(typeof e==`object`)switch(e.$$typeof){case v:return`Portal`;case C:return e.displayName||`Context`;case S:return(e._context.displayName||`Context`)+`.Consumer`;case w:var t=e.render;return e=e.displayName,e||(e=t.displayName||t.name||``,e=e===``?`ForwardRef`:`ForwardRef(`+e+`)`),e;case D:return t=e.displayName||null,t===null?M(e.type)||`Memo`:t;case O:t=e._payload,e=e._init;try{return M(e(t))}catch{}}return null}var N=Array.isArray,P=n.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,F=r.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,I={pending:!1,data:null,method:null,action:null},ne=[],L=-1;function R(e){return{current:e}}function z(e){0>L||(e.current=ne[L],ne[L]=null,L--)}function B(e,t){L++,ne[L]=e.current,e.current=t}var re=R(null),ie=R(null),ae=R(null),V=R(null);function oe(e,t){switch(B(ae,t),B(ie,e),B(re,null),t.nodeType){case 9:case 11:e=(e=t.documentElement)&&(e=e.namespaceURI)?Vd(e):0;break;default:if(e=t.tagName,t=t.namespaceURI)t=Vd(t),e=Hd(t,e);else switch(e){case`svg`:e=1;break;case`math`:e=2;break;default:e=0}}z(re),B(re,e)}function se(){z(re),z(ie),z(ae)}function ce(e){e.memoizedState!==null&&B(V,e);var t=re.current,n=Hd(t,e.type);t!==n&&(B(ie,e),B(re,n))}function le(e){ie.current===e&&(z(re),z(ie)),V.current===e&&(z(V),Qf._currentValue=I)}var ue,de;function H(e){if(ue===void 0)try{throw Error()}catch(e){var t=e.stack.trim().match(/\n( *(at )?)/);ue=t&&t[1]||``,de=-1<e.stack.indexOf(`
    at`)?` (<anonymous>)`:-1<e.stack.indexOf(`@`)?`@unknown:0:0`:``}return`
`+ue+e+de}var fe=!1;function pe(e,t){if(!e||fe)return``;fe=!0;var n=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{var r={DetermineComponentFrameRoot:function(){try{if(t){var n=function(){throw Error()};if(Object.defineProperty(n.prototype,"props",{set:function(){throw Error()}}),typeof Reflect==`object`&&Reflect.construct){try{Reflect.construct(n,[])}catch(e){var r=e}Reflect.construct(e,[],n)}else{try{n.call()}catch(e){r=e}e.call(n.prototype)}}else{try{throw Error()}catch(e){r=e}(n=e())&&typeof n.catch==`function`&&n.catch(function(){})}}catch(e){if(e&&r&&typeof e.stack==`string`)return[e.stack,r.stack]}return[null,null]}};r.DetermineComponentFrameRoot.displayName=`DetermineComponentFrameRoot`;var i=Object.getOwnPropertyDescriptor(r.DetermineComponentFrameRoot,`name`);i&&i.configurable&&Object.defineProperty(r.DetermineComponentFrameRoot,"name",{value:`DetermineComponentFrameRoot`});var a=r.DetermineComponentFrameRoot(),o=a[0],s=a[1];if(o&&s){var c=o.split(`
`),l=s.split(`
`);for(i=r=0;r<c.length&&!c[r].includes(`DetermineComponentFrameRoot`);)r++;for(;i<l.length&&!l[i].includes(`DetermineComponentFrameRoot`);)i++;if(r===c.length||i===l.length)for(r=c.length-1,i=l.length-1;1<=r&&0<=i&&c[r]!==l[i];)i--;for(;1<=r&&0<=i;r--,i--)if(c[r]!==l[i]){if(r!==1||i!==1)do if(r--,i--,0>i||c[r]!==l[i]){var u=`
`+c[r].replace(` at new `,` at `);return e.displayName&&u.includes(`<anonymous>`)&&(u=u.replace(`<anonymous>`,e.displayName)),u}while(1<=r&&0<=i);break}}}finally{fe=!1,Error.prepareStackTrace=n}return(n=e?e.displayName||e.name:``)?H(n):``}function me(e,t){switch(e.tag){case 26:case 27:case 5:return H(e.type);case 16:return H(`Lazy`);case 13:return e.child!==t&&t!==null?H(`Suspense Fallback`):H(`Suspense`);case 19:return H(`SuspenseList`);case 0:case 15:return pe(e.type,!1);case 11:return pe(e.type.render,!1);case 1:return pe(e.type,!0);case 31:return H(`Activity`);default:return``}}function he(e){try{var t=``,n=null;do t+=me(e,n),n=e,e=e.return;while(e);return t}catch(e){return`
Error generating stack: `+e.message+`
`+e.stack}}var ge=Object.prototype.hasOwnProperty,_e=t.unstable_scheduleCallback,U=t.unstable_cancelCallback,ve=t.unstable_shouldYield,ye=t.unstable_requestPaint,be=t.unstable_now,xe=t.unstable_getCurrentPriorityLevel,Se=t.unstable_ImmediatePriority,Ce=t.unstable_UserBlockingPriority,we=t.unstable_NormalPriority,Te=t.unstable_LowPriority,Ee=t.unstable_IdlePriority,De=t.log,Oe=t.unstable_setDisableYieldValue,ke=null,Ae=null;function je(e){if(typeof De==`function`&&Oe(e),Ae&&typeof Ae.setStrictMode==`function`)try{Ae.setStrictMode(ke,e)}catch{}}var Me=Math.clz32?Math.clz32:Fe,Ne=Math.log,Pe=Math.LN2;function Fe(e){return e>>>=0,e===0?32:31-(Ne(e)/Pe|0)|0}var Ie=256,Le=262144,Re=4194304;function ze(e){var t=e&42;if(t!==0)return t;switch(e&-e){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:return 64;case 128:return 128;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:return e&261888;case 262144:case 524288:case 1048576:case 2097152:return e&3932160;case 4194304:case 8388608:case 16777216:case 33554432:return e&62914560;case 67108864:return 67108864;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 0;default:return e}}function Be(e,t,n){var r=e.pendingLanes;if(r===0)return 0;var i=0,a=e.suspendedLanes,o=e.pingedLanes;e=e.warmLanes;var s=r&134217727;return s===0?(s=r&~a,s===0?o===0?n||(n=r&~e,n!==0&&(i=ze(n))):i=ze(o):i=ze(s)):(r=s&~a,r===0?(o&=s,o===0?n||(n=s&~e,n!==0&&(i=ze(n))):i=ze(o)):i=ze(r)),i===0?0:t!==0&&t!==i&&(t&a)===0&&(a=i&-i,n=t&-t,a>=n||a===32&&n&4194048)?t:i}function Ve(e,t){return(e.pendingLanes&~(e.suspendedLanes&~e.pingedLanes)&t)===0}function He(e,t){switch(e){case 1:case 2:case 4:case 8:case 64:return t+250;case 16:case 32:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t+5e3;case 4194304:case 8388608:case 16777216:case 33554432:return-1;case 67108864:case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function Ue(){var e=Re;return Re<<=1,!(Re&62914560)&&(Re=4194304),e}function We(e){for(var t=[],n=0;31>n;n++)t.push(e);return t}function Ge(e,t){e.pendingLanes|=t,t!==268435456&&(e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0)}function Ke(e,t,n,r,i,a){var o=e.pendingLanes;e.pendingLanes=n,e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0,e.expiredLanes&=n,e.entangledLanes&=n,e.errorRecoveryDisabledLanes&=n,e.shellSuspendCounter=0;var s=e.entanglements,c=e.expirationTimes,l=e.hiddenUpdates;for(n=o&~n;0<n;){var u=31-Me(n),d=1<<u;s[u]=0,c[u]=-1;var f=l[u];if(f!==null)for(l[u]=null,u=0;u<f.length;u++){var p=f[u];p!==null&&(p.lane&=-536870913)}n&=~d}r!==0&&qe(e,r,0),a!==0&&i===0&&e.tag!==0&&(e.suspendedLanes|=a&~(o&~t))}function qe(e,t,n){e.pendingLanes|=t,e.suspendedLanes&=~t;var r=31-Me(t);e.entangledLanes|=t,e.entanglements[r]=e.entanglements[r]|1073741824|n&261930}function Je(e,t){var n=e.entangledLanes|=t;for(e=e.entanglements;n;){var r=31-Me(n),i=1<<r;i&t|e[r]&t&&(e[r]|=t),n&=~i}}function Ye(e,t){var n=t&-t;return n=n&42?1:Xe(n),(n&(e.suspendedLanes|t))===0?n:0}function Xe(e){switch(e){case 2:e=1;break;case 8:e=4;break;case 32:e=16;break;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:e=128;break;case 268435456:e=134217728;break;default:e=0}return e}function Ze(e){return e&=-e,2<e?8<e?e&134217727?32:268435456:8:2}function Qe(){var e=F.p;return e===0?(e=window.event,e===void 0?32:mp(e.type)):e}function $e(e,t){var n=F.p;try{return F.p=e,t()}finally{F.p=n}}var et=Math.random().toString(36).slice(2),tt=`__reactFiber$`+et,nt=`__reactProps$`+et,rt=`__reactContainer$`+et,it=`__reactEvents$`+et,at=`__reactListeners$`+et,ot=`__reactHandles$`+et,st=`__reactResources$`+et,ct=`__reactMarker$`+et;function lt(e){delete e[tt],delete e[nt],delete e[it],delete e[at],delete e[ot]}function ut(e){var t=e[tt];if(t)return t;for(var n=e.parentNode;n;){if(t=n[rt]||n[tt]){if(n=t.alternate,t.child!==null||n!==null&&n.child!==null)for(e=df(e);e!==null;){if(n=e[tt])return n;e=df(e)}return t}e=n,n=e.parentNode}return null}function dt(e){if(e=e[tt]||e[rt]){var t=e.tag;if(t===5||t===6||t===13||t===31||t===26||t===27||t===3)return e}return null}function ft(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e.stateNode;throw Error(i(33))}function pt(e){var t=e[st];return t||(t=e[st]={hoistableStyles:new Map,hoistableScripts:new Map}),t}function mt(e){e[ct]=!0}var ht=new Set,gt={};function _t(e,t){vt(e,t),vt(e+`Capture`,t)}function vt(e,t){for(gt[e]=t,e=0;e<t.length;e++)ht.add(t[e])}var yt=RegExp(`^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$`),bt={},xt={};function St(e){return ge.call(xt,e)?!0:ge.call(bt,e)?!1:yt.test(e)?xt[e]=!0:(bt[e]=!0,!1)}function W(e,t,n){if(St(t)){if(n===null)e.removeAttribute(t);else{switch(typeof n){case`undefined`:case`function`:case`symbol`:e.removeAttribute(t);return;case`boolean`:var r=t.toLowerCase().slice(0,5);if(r!==`data-`&&r!==`aria-`){e.removeAttribute(t);return}}e.setAttribute(t,``+n)}}}function Ct(e,t,n){if(n===null)e.removeAttribute(t);else{switch(typeof n){case`undefined`:case`function`:case`symbol`:case`boolean`:e.removeAttribute(t);return}e.setAttribute(t,``+n)}}function wt(e,t,n,r){if(r===null)e.removeAttribute(n);else{switch(typeof r){case`undefined`:case`function`:case`symbol`:case`boolean`:e.removeAttribute(n);return}e.setAttributeNS(t,n,``+r)}}function Tt(e){switch(typeof e){case`bigint`:case`boolean`:case`number`:case`string`:case`undefined`:return e;case`object`:return e;default:return``}}function Et(e){var t=e.type;return(e=e.nodeName)&&e.toLowerCase()===`input`&&(t===`checkbox`||t===`radio`)}function Dt(e,t,n){var r=Object.getOwnPropertyDescriptor(e.constructor.prototype,t);if(!e.hasOwnProperty(t)&&r!==void 0&&typeof r.get==`function`&&typeof r.set==`function`){var i=r.get,a=r.set;return Object.defineProperty(e,t,{configurable:!0,get:function(){return i.call(this)},set:function(e){n=``+e,a.call(this,e)}}),Object.defineProperty(e,t,{enumerable:r.enumerable}),{getValue:function(){return n},setValue:function(e){n=``+e},stopTracking:function(){e._valueTracker=null,delete e[t]}}}}function Ot(e){if(!e._valueTracker){var t=Et(e)?`checked`:`value`;e._valueTracker=Dt(e,t,``+e[t])}}function kt(e){if(!e)return!1;var t=e._valueTracker;if(!t)return!0;var n=t.getValue(),r=``;return e&&(r=Et(e)?e.checked?`true`:`false`:e.value),e=r,e!==n&&(t.setValue(e),!0)}function At(e){if(e=e||(typeof document<`u`?document:void 0),e===void 0)return null;try{return e.activeElement||e.body}catch{return e.body}}var jt=/[\n"\\]/g;function Mt(e){return e.replace(jt,function(e){return`\\`+e.charCodeAt(0).toString(16)+` `})}function Nt(e,t,n,r,i,a,o,s){e.name=``,o!=null&&typeof o!=`function`&&typeof o!=`symbol`&&typeof o!=`boolean`?e.type=o:e.removeAttribute(`type`),t==null?o!==`submit`&&o!==`reset`||e.removeAttribute(`value`):o===`number`?(t===0&&e.value===``||e.value!=t)&&(e.value=``+Tt(t)):e.value!==``+Tt(t)&&(e.value=``+Tt(t)),t==null?n==null?r!=null&&e.removeAttribute(`value`):Ft(e,o,Tt(n)):Ft(e,o,Tt(t)),i==null&&a!=null&&(e.defaultChecked=!!a),i!=null&&(e.checked=i&&typeof i!=`function`&&typeof i!=`symbol`),s!=null&&typeof s!=`function`&&typeof s!=`symbol`&&typeof s!=`boolean`?e.name=``+Tt(s):e.removeAttribute(`name`)}function Pt(e,t,n,r,i,a,o,s){if(a!=null&&typeof a!=`function`&&typeof a!=`symbol`&&typeof a!=`boolean`&&(e.type=a),t!=null||n!=null){if(!(a!==`submit`&&a!==`reset`||t!=null)){Ot(e);return}n=n==null?``:``+Tt(n),t=t==null?n:``+Tt(t),s||t===e.value||(e.value=t),e.defaultValue=t}r=r??i,r=typeof r!=`function`&&typeof r!=`symbol`&&!!r,e.checked=s?e.checked:!!r,e.defaultChecked=!!r,o!=null&&typeof o!=`function`&&typeof o!=`symbol`&&typeof o!=`boolean`&&(e.name=o),Ot(e)}function Ft(e,t,n){t===`number`&&At(e.ownerDocument)===e||e.defaultValue===``+n||(e.defaultValue=``+n)}function It(e,t,n,r){if(e=e.options,t){t={};for(var i=0;i<n.length;i++)t[`$`+n[i]]=!0;for(n=0;n<e.length;n++)i=t.hasOwnProperty(`$`+e[n].value),e[n].selected!==i&&(e[n].selected=i),i&&r&&(e[n].defaultSelected=!0)}else{for(n=``+Tt(n),t=null,i=0;i<e.length;i++){if(e[i].value===n){e[i].selected=!0,r&&(e[i].defaultSelected=!0);return}t!==null||e[i].disabled||(t=e[i])}t!==null&&(t.selected=!0)}}function Lt(e,t,n){if(t!=null&&(t=``+Tt(t),t!==e.value&&(e.value=t),n==null)){e.defaultValue!==t&&(e.defaultValue=t);return}e.defaultValue=n==null?``:``+Tt(n)}function Rt(e,t,n,r){if(t==null){if(r!=null){if(n!=null)throw Error(i(92));if(N(r)){if(1<r.length)throw Error(i(93));r=r[0]}n=r}n??(n=``),t=n}n=Tt(t),e.defaultValue=n,r=e.textContent,r===n&&r!==``&&r!==null&&(e.value=r),Ot(e)}function zt(e,t){if(t){var n=e.firstChild;if(n&&n===e.lastChild&&n.nodeType===3){n.nodeValue=t;return}}e.textContent=t}var Bt=new Set(`animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp`.split(` `));function Vt(e,t,n){var r=t.indexOf(`--`)===0;n==null||typeof n==`boolean`||n===``?r?e.setProperty(t,``):t===`float`?e.cssFloat=``:e[t]=``:r?e.setProperty(t,n):typeof n!=`number`||n===0||Bt.has(t)?t===`float`?e.cssFloat=n:e[t]=(``+n).trim():e[t]=n+`px`}function Ht(e,t,n){if(t!=null&&typeof t!=`object`)throw Error(i(62));if(e=e.style,n!=null){for(var r in n)!n.hasOwnProperty(r)||t!=null&&t.hasOwnProperty(r)||(r.indexOf(`--`)===0?e.setProperty(r,``):r===`float`?e.cssFloat=``:e[r]=``);for(var a in t)r=t[a],t.hasOwnProperty(a)&&n[a]!==r&&Vt(e,a,r)}else for(var o in t)t.hasOwnProperty(o)&&Vt(e,o,t[o])}function Ut(e){if(e.indexOf(`-`)===-1)return!1;switch(e){case`annotation-xml`:case`color-profile`:case`font-face`:case`font-face-src`:case`font-face-uri`:case`font-face-format`:case`font-face-name`:case`missing-glyph`:return!1;default:return!0}}var Wt=new Map([[`acceptCharset`,`accept-charset`],[`htmlFor`,`for`],[`httpEquiv`,`http-equiv`],[`crossOrigin`,`crossorigin`],[`accentHeight`,`accent-height`],[`alignmentBaseline`,`alignment-baseline`],[`arabicForm`,`arabic-form`],[`baselineShift`,`baseline-shift`],[`capHeight`,`cap-height`],[`clipPath`,`clip-path`],[`clipRule`,`clip-rule`],[`colorInterpolation`,`color-interpolation`],[`colorInterpolationFilters`,`color-interpolation-filters`],[`colorProfile`,`color-profile`],[`colorRendering`,`color-rendering`],[`dominantBaseline`,`dominant-baseline`],[`enableBackground`,`enable-background`],[`fillOpacity`,`fill-opacity`],[`fillRule`,`fill-rule`],[`floodColor`,`flood-color`],[`floodOpacity`,`flood-opacity`],[`fontFamily`,`font-family`],[`fontSize`,`font-size`],[`fontSizeAdjust`,`font-size-adjust`],[`fontStretch`,`font-stretch`],[`fontStyle`,`font-style`],[`fontVariant`,`font-variant`],[`fontWeight`,`font-weight`],[`glyphName`,`glyph-name`],[`glyphOrientationHorizontal`,`glyph-orientation-horizontal`],[`glyphOrientationVertical`,`glyph-orientation-vertical`],[`horizAdvX`,`horiz-adv-x`],[`horizOriginX`,`horiz-origin-x`],[`imageRendering`,`image-rendering`],[`letterSpacing`,`letter-spacing`],[`lightingColor`,`lighting-color`],[`markerEnd`,`marker-end`],[`markerMid`,`marker-mid`],[`markerStart`,`marker-start`],[`overlinePosition`,`overline-position`],[`overlineThickness`,`overline-thickness`],[`paintOrder`,`paint-order`],[`panose-1`,`panose-1`],[`pointerEvents`,`pointer-events`],[`renderingIntent`,`rendering-intent`],[`shapeRendering`,`shape-rendering`],[`stopColor`,`stop-color`],[`stopOpacity`,`stop-opacity`],[`strikethroughPosition`,`strikethrough-position`],[`strikethroughThickness`,`strikethrough-thickness`],[`strokeDasharray`,`stroke-dasharray`],[`strokeDashoffset`,`stroke-dashoffset`],[`strokeLinecap`,`stroke-linecap`],[`strokeLinejoin`,`stroke-linejoin`],[`strokeMiterlimit`,`stroke-miterlimit`],[`strokeOpacity`,`stroke-opacity`],[`strokeWidth`,`stroke-width`],[`textAnchor`,`text-anchor`],[`textDecoration`,`text-decoration`],[`textRendering`,`text-rendering`],[`transformOrigin`,`transform-origin`],[`underlinePosition`,`underline-position`],[`underlineThickness`,`underline-thickness`],[`unicodeBidi`,`unicode-bidi`],[`unicodeRange`,`unicode-range`],[`unitsPerEm`,`units-per-em`],[`vAlphabetic`,`v-alphabetic`],[`vHanging`,`v-hanging`],[`vIdeographic`,`v-ideographic`],[`vMathematical`,`v-mathematical`],[`vectorEffect`,`vector-effect`],[`vertAdvY`,`vert-adv-y`],[`vertOriginX`,`vert-origin-x`],[`vertOriginY`,`vert-origin-y`],[`wordSpacing`,`word-spacing`],[`writingMode`,`writing-mode`],[`xmlnsXlink`,`xmlns:xlink`],[`xHeight`,`x-height`]]),Gt=/^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;function Kt(e){return Gt.test(``+e)?`javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')`:e}function qt(){}var Jt=null;function Yt(e){return e=e.target||e.srcElement||window,e.correspondingUseElement&&(e=e.correspondingUseElement),e.nodeType===3?e.parentNode:e}var Xt=null,Zt=null;function Qt(e){var t=dt(e);if(t&&(e=t.stateNode)){var n=e[nt]||null;a:switch(e=t.stateNode,t.type){case`input`:if(Nt(e,n.value,n.defaultValue,n.defaultValue,n.checked,n.defaultChecked,n.type,n.name),t=n.name,n.type===`radio`&&t!=null){for(n=e;n.parentNode;)n=n.parentNode;for(n=n.querySelectorAll(`input[name="`+Mt(``+t)+`"][type="radio"]`),t=0;t<n.length;t++){var r=n[t];if(r!==e&&r.form===e.form){var a=r[nt]||null;if(!a)throw Error(i(90));Nt(r,a.value,a.defaultValue,a.defaultValue,a.checked,a.defaultChecked,a.type,a.name)}}for(t=0;t<n.length;t++)r=n[t],r.form===e.form&&kt(r)}break a;case`textarea`:Lt(e,n.value,n.defaultValue);break a;case`select`:t=n.value,t!=null&&It(e,!!n.multiple,t,!1)}}}var $t=!1;function en(e,t,n){if($t)return e(t,n);$t=!0;try{return e(t)}finally{if($t=!1,(Xt!==null||Zt!==null)&&(_u(),Xt&&(t=Xt,e=Zt,Zt=Xt=null,Qt(t),e)))for(t=0;t<e.length;t++)Qt(e[t])}}function tn(e,t){var n=e.stateNode;if(n===null)return null;var r=n[nt]||null;if(r===null)return null;n=r[t];a:switch(t){case`onClick`:case`onClickCapture`:case`onDoubleClick`:case`onDoubleClickCapture`:case`onMouseDown`:case`onMouseDownCapture`:case`onMouseMove`:case`onMouseMoveCapture`:case`onMouseUp`:case`onMouseUpCapture`:case`onMouseEnter`:(r=!r.disabled)||(e=e.type,r=e!==`button`&&e!==`input`&&e!==`select`&&e!==`textarea`),e=!r;break a;default:e=!1}if(e)return null;if(n&&typeof n!=`function`)throw Error(i(231,t,typeof n));return n}var nn=typeof window<`u`&&window.document!==void 0&&window.document.createElement!==void 0,rn=!1;if(nn)try{var an={};Object.defineProperty(an,"passive",{get:function(){rn=!0}}),window.addEventListener(`test`,an,an),window.removeEventListener(`test`,an,an)}catch{rn=!1}var on=null,sn=null,cn=null;function ln(){if(cn)return cn;var e,t=sn,n=t.length,r,i=`value`in on?on.value:on.textContent,a=i.length;for(e=0;e<n&&t[e]===i[e];e++);var o=n-e;for(r=1;r<=o&&t[n-r]===i[a-r];r++);return cn=i.slice(e,1<r?1-r:void 0)}function un(e){var t=e.keyCode;return`charCode`in e?(e=e.charCode,e===0&&t===13&&(e=13)):e=t,e===10&&(e=13),32<=e||e===13?e:0}function dn(){return!0}function fn(){return!1}function pn(e){function t(t,n,r,i,a){for(var o in this._reactName=t,this._targetInst=r,this.type=n,this.nativeEvent=i,this.target=a,this.currentTarget=null,e)e.hasOwnProperty(o)&&(t=e[o],this[o]=t?t(i):i[o]);return this.isDefaultPrevented=(i.defaultPrevented==null?!1===i.returnValue:i.defaultPrevented)?dn:fn,this.isPropagationStopped=fn,this}return p(t.prototype,{preventDefault:function(){this.defaultPrevented=!0;var e=this.nativeEvent;e&&(e.preventDefault?e.preventDefault():typeof e.returnValue!=`unknown`&&(e.returnValue=!1),this.isDefaultPrevented=dn)},stopPropagation:function(){var e=this.nativeEvent;e&&(e.stopPropagation?e.stopPropagation():typeof e.cancelBubble!=`unknown`&&(e.cancelBubble=!0),this.isPropagationStopped=dn)},persist:function(){},isPersistent:dn}),t}var mn={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(e){return e.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},hn=pn(mn),gn=p({},mn,{view:0,detail:0}),_n=pn(gn),vn,yn,bn,xn=p({},gn,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:Mn,button:0,buttons:0,relatedTarget:function(e){return e.relatedTarget===void 0?e.fromElement===e.srcElement?e.toElement:e.fromElement:e.relatedTarget},movementX:function(e){return`movementX`in e?e.movementX:(e!==bn&&(bn&&e.type===`mousemove`?(vn=e.screenX-bn.screenX,yn=e.screenY-bn.screenY):yn=vn=0,bn=e),vn)},movementY:function(e){return`movementY`in e?e.movementY:yn}}),Sn=pn(xn),Cn=pn(p({},xn,{dataTransfer:0})),wn=pn(p({},gn,{relatedTarget:0})),Tn=pn(p({},mn,{animationName:0,elapsedTime:0,pseudoElement:0})),En=pn(p({},mn,{clipboardData:function(e){return`clipboardData`in e?e.clipboardData:window.clipboardData}})),Dn=pn(p({},mn,{data:0})),On={Esc:`Escape`,Spacebar:` `,Left:`ArrowLeft`,Up:`ArrowUp`,Right:`ArrowRight`,Down:`ArrowDown`,Del:`Delete`,Win:`OS`,Menu:`ContextMenu`,Apps:`ContextMenu`,Scroll:`ScrollLock`,MozPrintableKey:`Unidentified`},kn={8:`Backspace`,9:`Tab`,12:`Clear`,13:`Enter`,16:`Shift`,17:`Control`,18:`Alt`,19:`Pause`,20:`CapsLock`,27:`Escape`,32:` `,33:`PageUp`,34:`PageDown`,35:`End`,36:`Home`,37:`ArrowLeft`,38:`ArrowUp`,39:`ArrowRight`,40:`ArrowDown`,45:`Insert`,46:`Delete`,112:`F1`,113:`F2`,114:`F3`,115:`F4`,116:`F5`,117:`F6`,118:`F7`,119:`F8`,120:`F9`,121:`F10`,122:`F11`,123:`F12`,144:`NumLock`,145:`ScrollLock`,224:`Meta`},An={Alt:`altKey`,Control:`ctrlKey`,Meta:`metaKey`,Shift:`shiftKey`};function jn(e){var t=this.nativeEvent;return t.getModifierState?t.getModifierState(e):(e=An[e])?!!t[e]:!1}function Mn(){return jn}var Nn=pn(p({},gn,{key:function(e){if(e.key){var t=On[e.key]||e.key;if(t!==`Unidentified`)return t}return e.type===`keypress`?(e=un(e),e===13?`Enter`:String.fromCharCode(e)):e.type===`keydown`||e.type===`keyup`?kn[e.keyCode]||`Unidentified`:``},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:Mn,charCode:function(e){return e.type===`keypress`?un(e):0},keyCode:function(e){return e.type===`keydown`||e.type===`keyup`?e.keyCode:0},which:function(e){return e.type===`keypress`?un(e):e.type===`keydown`||e.type===`keyup`?e.keyCode:0}})),Pn=pn(p({},xn,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0})),Fn=pn(p({},gn,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:Mn})),In=pn(p({},mn,{propertyName:0,elapsedTime:0,pseudoElement:0})),Ln=pn(p({},xn,{deltaX:function(e){return`deltaX`in e?e.deltaX:`wheelDeltaX`in e?-e.wheelDeltaX:0},deltaY:function(e){return`deltaY`in e?e.deltaY:`wheelDeltaY`in e?-e.wheelDeltaY:`wheelDelta`in e?-e.wheelDelta:0},deltaZ:0,deltaMode:0})),Rn=pn(p({},mn,{newState:0,oldState:0})),zn=[9,13,27,32],Bn=nn&&`CompositionEvent`in window,Vn=null;nn&&`documentMode`in document&&(Vn=document.documentMode);var Hn=nn&&`TextEvent`in window&&!Vn,Un=nn&&(!Bn||Vn&&8<Vn&&11>=Vn),Wn=` `,G=!1;function Gn(e,t){switch(e){case`keyup`:return zn.indexOf(t.keyCode)!==-1;case`keydown`:return t.keyCode!==229;case`keypress`:case`mousedown`:case`focusout`:return!0;default:return!1}}function Kn(e){return e=e.detail,typeof e==`object`&&`data`in e?e.data:null}var qn=!1;function Jn(e,t){switch(e){case`compositionend`:return Kn(t);case`keypress`:return t.which===32?(G=!0,Wn):null;case`textInput`:return e=t.data,e===Wn&&G?null:e;default:return null}}function Yn(e,t){if(qn)return e===`compositionend`||!Bn&&Gn(e,t)?(e=ln(),cn=sn=on=null,qn=!1,e):null;switch(e){case`paste`:return null;case`keypress`:if(!(t.ctrlKey||t.altKey||t.metaKey)||t.ctrlKey&&t.altKey){if(t.char&&1<t.char.length)return t.char;if(t.which)return String.fromCharCode(t.which)}return null;case`compositionend`:return Un&&t.locale!==`ko`?null:t.data;default:return null}}var Xn={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function Zn(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t===`input`?!!Xn[e.type]:t===`textarea`}function Qn(e,t,n,r){Xt?Zt?Zt.push(r):Zt=[r]:Xt=r,t=Td(t,`onChange`),0<t.length&&(n=new hn(`onChange`,`change`,null,n,r),e.push({event:n,listeners:t}))}var $n=null,er=null;function tr(e){_d(e,0)}function nr(e){if(kt(ft(e)))return e}function rr(e,t){if(e===`change`)return t}var ir=!1;if(nn){var ar;if(nn){var or=`oninput`in document;if(!or){var sr=document.createElement(`div`);sr.setAttribute(`oninput`,`return;`),or=typeof sr.oninput==`function`}ar=or}else ar=!1;ir=ar&&(!document.documentMode||9<document.documentMode)}function cr(){$n&&($n.detachEvent(`onpropertychange`,lr),er=$n=null)}function lr(e){if(e.propertyName===`value`&&nr(er)){var t=[];Qn(t,er,e,Yt(e)),en(tr,t)}}function ur(e,t,n){e===`focusin`?(cr(),$n=t,er=n,$n.attachEvent(`onpropertychange`,lr)):e===`focusout`&&cr()}function dr(e){if(e===`selectionchange`||e===`keyup`||e===`keydown`)return nr(er)}function fr(e,t){if(e===`click`)return nr(t)}function pr(e,t){if(e===`input`||e===`change`)return nr(t)}function mr(e,t){return e===t&&(e!==0||1/e==1/t)||e!==e&&t!==t}var hr=typeof Object.is==`function`?Object.is:mr;function gr(e,t){if(hr(e,t))return!0;if(typeof e!=`object`||!e||typeof t!=`object`||!t)return!1;var n=Object.keys(e),r=Object.keys(t);if(n.length!==r.length)return!1;for(r=0;r<n.length;r++){var i=n[r];if(!ge.call(t,i)||!hr(e[i],t[i]))return!1}return!0}function _r(e){for(;e&&e.firstChild;)e=e.firstChild;return e}function vr(e,t){var n=_r(e);e=0;for(var r;n;){if(n.nodeType===3){if(r=e+n.textContent.length,e<=t&&r>=t)return{node:n,offset:t-e};e=r}a:{for(;n;){if(n.nextSibling){n=n.nextSibling;break a}n=n.parentNode}n=void 0}n=_r(n)}}function yr(e,t){return e&&t?e===t?!0:e&&e.nodeType===3?!1:t&&t.nodeType===3?yr(e,t.parentNode):`contains`in e?e.contains(t):e.compareDocumentPosition?!!(e.compareDocumentPosition(t)&16):!1:!1}function br(e){e=e!=null&&e.ownerDocument!=null&&e.ownerDocument.defaultView!=null?e.ownerDocument.defaultView:window;for(var t=At(e.document);t instanceof e.HTMLIFrameElement;){try{var n=typeof t.contentWindow.location.href==`string`}catch{n=!1}if(n)e=t.contentWindow;else break;t=At(e.document)}return t}function xr(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t&&(t===`input`&&(e.type===`text`||e.type===`search`||e.type===`tel`||e.type===`url`||e.type===`password`)||t===`textarea`||e.contentEditable===`true`)}var Sr=nn&&`documentMode`in document&&11>=document.documentMode,Cr=null,wr=null,Tr=null,Er=!1;function Dr(e,t,n){var r=n.window===n?n.document:n.nodeType===9?n:n.ownerDocument;Er||Cr==null||Cr!==At(r)||(r=Cr,`selectionStart`in r&&xr(r)?r={start:r.selectionStart,end:r.selectionEnd}:(r=(r.ownerDocument&&r.ownerDocument.defaultView||window).getSelection(),r={anchorNode:r.anchorNode,anchorOffset:r.anchorOffset,focusNode:r.focusNode,focusOffset:r.focusOffset}),Tr&&gr(Tr,r)||(Tr=r,r=Td(wr,`onSelect`),0<r.length&&(t=new hn(`onSelect`,`select`,null,t,n),e.push({event:t,listeners:r}),t.target=Cr)))}function Or(e,t){var n={};return n[e.toLowerCase()]=t.toLowerCase(),n[`Webkit`+e]=`webkit`+t,n[`Moz`+e]=`moz`+t,n}var kr={animationend:Or(`Animation`,`AnimationEnd`),animationiteration:Or(`Animation`,`AnimationIteration`),animationstart:Or(`Animation`,`AnimationStart`),transitionrun:Or(`Transition`,`TransitionRun`),transitionstart:Or(`Transition`,`TransitionStart`),transitioncancel:Or(`Transition`,`TransitionCancel`),transitionend:Or(`Transition`,`TransitionEnd`)},Ar={},jr={};nn&&(jr=document.createElement(`div`).style,`AnimationEvent`in window||(delete kr.animationend.animation,delete kr.animationiteration.animation,delete kr.animationstart.animation),`TransitionEvent`in window||delete kr.transitionend.transition);function Mr(e){if(Ar[e])return Ar[e];if(!kr[e])return e;var t=kr[e],n;for(n in t)if(t.hasOwnProperty(n)&&n in jr)return Ar[e]=t[n];return e}var Nr=Mr(`animationend`),Pr=Mr(`animationiteration`),Fr=Mr(`animationstart`),Ir=Mr(`transitionrun`),Lr=Mr(`transitionstart`),Rr=Mr(`transitioncancel`),zr=Mr(`transitionend`),Br=new Map,Vr=`abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel`.split(` `);Vr.push(`scrollEnd`);function Hr(e,t){Br.set(e,t),_t(t,[e])}var Ur=typeof reportError==`function`?reportError:function(e){if(typeof window==`object`&&typeof window.ErrorEvent==`function`){var t=new window.ErrorEvent(`error`,{bubbles:!0,cancelable:!0,message:typeof e==`object`&&e&&typeof e.message==`string`?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process==`object`&&typeof process.emit==`function`){process.emit(`uncaughtException`,e);return}console.error(e)},Wr=[],Gr=0,Kr=0;function qr(){for(var e=Gr,t=Kr=Gr=0;t<e;){var n=Wr[t];Wr[t++]=null;var r=Wr[t];Wr[t++]=null;var i=Wr[t];Wr[t++]=null;var a=Wr[t];if(Wr[t++]=null,r!==null&&i!==null){var o=r.pending;o===null?i.next=i:(i.next=o.next,o.next=i),r.pending=i}a!==0&&Zr(n,i,a)}}function Jr(e,t,n,r){Wr[Gr++]=e,Wr[Gr++]=t,Wr[Gr++]=n,Wr[Gr++]=r,Kr|=r,e.lanes|=r,e=e.alternate,e!==null&&(e.lanes|=r)}function Yr(e,t,n,r){return Jr(e,t,n,r),Qr(e)}function Xr(e,t){return Jr(e,null,null,t),Qr(e)}function Zr(e,t,n){e.lanes|=n;var r=e.alternate;r!==null&&(r.lanes|=n);for(var i=!1,a=e.return;a!==null;)a.childLanes|=n,r=a.alternate,r!==null&&(r.childLanes|=n),a.tag===22&&(e=a.stateNode,e===null||e._visibility&1||(i=!0)),e=a,a=a.return;return e.tag===3?(a=e.stateNode,i&&t!==null&&(i=31-Me(n),e=a.hiddenUpdates,r=e[i],r===null?e[i]=[t]:r.push(t),t.lane=n|536870912),a):null}function Qr(e){if(50<cu)throw cu=0,lu=null,Error(i(185));for(var t=e.return;t!==null;)e=t,t=e.return;return e.tag===3?e.stateNode:null}var $r={};function ei(e,t,n,r){this.tag=e,this.key=n,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.refCleanup=this.ref=null,this.pendingProps=t,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=r,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function ti(e,t,n,r){return new ei(e,t,n,r)}function ni(e){return e=e.prototype,!(!e||!e.isReactComponent)}function ri(e,t){var n=e.alternate;return n===null?(n=ti(e.tag,t,e.key,e.mode),n.elementType=e.elementType,n.type=e.type,n.stateNode=e.stateNode,n.alternate=e,e.alternate=n):(n.pendingProps=t,n.type=e.type,n.flags=0,n.subtreeFlags=0,n.deletions=null),n.flags=e.flags&65011712,n.childLanes=e.childLanes,n.lanes=e.lanes,n.child=e.child,n.memoizedProps=e.memoizedProps,n.memoizedState=e.memoizedState,n.updateQueue=e.updateQueue,t=e.dependencies,n.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext},n.sibling=e.sibling,n.index=e.index,n.ref=e.ref,n.refCleanup=e.refCleanup,n}function ii(e,t){e.flags&=65011714;var n=e.alternate;return n===null?(e.childLanes=0,e.lanes=t,e.child=null,e.subtreeFlags=0,e.memoizedProps=null,e.memoizedState=null,e.updateQueue=null,e.dependencies=null,e.stateNode=null):(e.childLanes=n.childLanes,e.lanes=n.lanes,e.child=n.child,e.subtreeFlags=0,e.deletions=null,e.memoizedProps=n.memoizedProps,e.memoizedState=n.memoizedState,e.updateQueue=n.updateQueue,e.type=n.type,t=n.dependencies,e.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext}),e}function ai(e,t,n,r,a,o){var s=0;if(r=e,typeof e==`function`)ni(e)&&(s=1);else if(typeof e==`string`)s=Uf(e,n,re.current)?26:e===`html`||e===`head`||e===`body`?27:5;else a:switch(e){case k:return e=ti(31,n,t,a),e.elementType=k,e.lanes=o,e;case y:return oi(n.children,a,o,t);case b:s=8,a|=24;break;case x:return e=ti(12,n,t,a|2),e.elementType=x,e.lanes=o,e;case T:return e=ti(13,n,t,a),e.elementType=T,e.lanes=o,e;case E:return e=ti(19,n,t,a),e.elementType=E,e.lanes=o,e;default:if(typeof e==`object`&&e)switch(e.$$typeof){case C:s=10;break a;case S:s=9;break a;case w:s=11;break a;case D:s=14;break a;case O:s=16,r=null;break a}s=29,n=Error(i(130,e===null?`null`:typeof e,``)),r=null}return t=ti(s,n,t,a),t.elementType=e,t.type=r,t.lanes=o,t}function oi(e,t,n,r){return e=ti(7,e,r,t),e.lanes=n,e}function si(e,t,n){return e=ti(6,e,null,t),e.lanes=n,e}function ci(e){var t=ti(18,null,null,0);return t.stateNode=e,t}function li(e,t,n){return t=ti(4,e.children===null?[]:e.children,e.key,t),t.lanes=n,t.stateNode={containerInfo:e.containerInfo,pendingChildren:null,implementation:e.implementation},t}var ui=new WeakMap;function di(e,t){if(typeof e==`object`&&e){var n=ui.get(e);return n===void 0?(t={value:e,source:t,stack:he(t)},ui.set(e,t),t):n}return{value:e,source:t,stack:he(t)}}var fi=[],pi=0,mi=null,hi=0,gi=[],_i=0,vi=null,yi=1,bi=``;function xi(e,t){fi[pi++]=hi,fi[pi++]=mi,mi=e,hi=t}function Si(e,t,n){gi[_i++]=yi,gi[_i++]=bi,gi[_i++]=vi,vi=e;var r=yi;e=bi;var i=32-Me(r)-1;r&=~(1<<i),n+=1;var a=32-Me(t)+i;if(30<a){var o=i-i%5;a=(r&(1<<o)-1).toString(32),r>>=o,i-=o,yi=1<<32-Me(t)+i|n<<i|r,bi=a+e}else yi=1<<a|n<<i|r,bi=e}function Ci(e){e.return!==null&&(xi(e,1),Si(e,1,0))}function wi(e){for(;e===mi;)mi=fi[--pi],fi[pi]=null,hi=fi[--pi],fi[pi]=null;for(;e===vi;)vi=gi[--_i],gi[_i]=null,bi=gi[--_i],gi[_i]=null,yi=gi[--_i],gi[_i]=null}function Ti(e,t){gi[_i++]=yi,gi[_i++]=bi,gi[_i++]=vi,yi=t.id,bi=t.overflow,vi=e}var Ei=null,Di=null,K=!1,Oi=null,ki=!1,Ai=Error(i(519));function ji(e){throw Li(di(Error(i(418,1<arguments.length&&arguments[1]!==void 0&&arguments[1]?`text`:`HTML`,``)),e)),Ai}function Mi(e){var t=e.stateNode,n=e.type,r=e.memoizedProps;switch(t[tt]=e,t[nt]=r,n){case`dialog`:vd(`cancel`,t),vd(`close`,t);break;case`iframe`:case`object`:case`embed`:vd(`load`,t);break;case`video`:case`audio`:for(n=0;n<hd.length;n++)vd(hd[n],t);break;case`source`:vd(`error`,t);break;case`img`:case`image`:case`link`:vd(`error`,t),vd(`load`,t);break;case`details`:vd(`toggle`,t);break;case`input`:vd(`invalid`,t),Pt(t,r.value,r.defaultValue,r.checked,r.defaultChecked,r.type,r.name,!0);break;case`select`:vd(`invalid`,t);break;case`textarea`:vd(`invalid`,t),Rt(t,r.value,r.defaultValue,r.children)}n=r.children,typeof n!=`string`&&typeof n!=`number`&&typeof n!=`bigint`||t.textContent===``+n||!0===r.suppressHydrationWarning||jd(t.textContent,n)?(r.popover!=null&&(vd(`beforetoggle`,t),vd(`toggle`,t)),r.onScroll!=null&&vd(`scroll`,t),r.onScrollEnd!=null&&vd(`scrollend`,t),r.onClick!=null&&(t.onclick=qt),t=!0):t=!1,t||ji(e,!0)}function Ni(e){for(Ei=e.return;Ei;)switch(Ei.tag){case 5:case 31:case 13:ki=!1;return;case 27:case 3:ki=!0;return;default:Ei=Ei.return}}function Pi(e){if(e!==Ei)return!1;if(!K)return Ni(e),K=!0,!1;var t=e.tag,n;if((n=t!==3&&t!==27)&&((n=t===5)&&(n=e.type,n=n===`form`||n===`button`||Ud(e.type,e.memoizedProps)),n=!n),n&&Di&&ji(e),Ni(e),t===13){if(e=e.memoizedState,e=e===null?null:e.dehydrated,!e)throw Error(i(317));Di=uf(e)}else if(t===31){if(e=e.memoizedState,e=e===null?null:e.dehydrated,!e)throw Error(i(317));Di=uf(e)}else t===27?(t=Di,Zd(e.type)?(e=lf,lf=null,Di=e):Di=t):Di=Ei?cf(e.stateNode.nextSibling):null;return!0}function Fi(){Di=Ei=null,K=!1}function Ii(){var e=Oi;return e!==null&&(Yl===null?Yl=e:Yl.push.apply(Yl,e),Oi=null),e}function Li(e){Oi===null?Oi=[e]:Oi.push(e)}var Ri=R(null),zi=null,Bi=null;function Vi(e,t,n){B(Ri,t._currentValue),t._currentValue=n}function Hi(e){e._currentValue=Ri.current,z(Ri)}function Ui(e,t,n){for(;e!==null;){var r=e.alternate;if((e.childLanes&t)===t?r!==null&&(r.childLanes&t)!==t&&(r.childLanes|=t):(e.childLanes|=t,r!==null&&(r.childLanes|=t)),e===n)break;e=e.return}}function Wi(e,t,n,r){var a=e.child;for(a!==null&&(a.return=e);a!==null;){var o=a.dependencies;if(o!==null){var s=a.child;o=o.firstContext;a:for(;o!==null;){var c=o;o=a;for(var l=0;l<t.length;l++)if(c.context===t[l]){o.lanes|=n,c=o.alternate,c!==null&&(c.lanes|=n),Ui(o.return,n,e),r||(s=null);break a}o=c.next}}else if(a.tag===18){if(s=a.return,s===null)throw Error(i(341));s.lanes|=n,o=s.alternate,o!==null&&(o.lanes|=n),Ui(s,n,e),s=null}else s=a.child;if(s!==null)s.return=a;else for(s=a;s!==null;){if(s===e){s=null;break}if(a=s.sibling,a!==null){a.return=s.return,s=a;break}s=s.return}a=s}}function Gi(e,t,n,r){e=null;for(var a=t,o=!1;a!==null;){if(!o){if(a.flags&524288)o=!0;else if(a.flags&262144)break}if(a.tag===10){var s=a.alternate;if(s===null)throw Error(i(387));if(s=s.memoizedProps,s!==null){var c=a.type;hr(a.pendingProps.value,s.value)||(e===null?e=[c]:e.push(c))}}else if(a===V.current){if(s=a.alternate,s===null)throw Error(i(387));s.memoizedState.memoizedState!==a.memoizedState.memoizedState&&(e===null?e=[Qf]:e.push(Qf))}a=a.return}e!==null&&Wi(t,e,n,r),t.flags|=262144}function Ki(e){for(e=e.firstContext;e!==null;){if(!hr(e.context._currentValue,e.memoizedValue))return!0;e=e.next}return!1}function qi(e){zi=e,Bi=null,e=e.dependencies,e!==null&&(e.firstContext=null)}function Ji(e){return Xi(zi,e)}function Yi(e,t){return zi===null&&qi(e),Xi(e,t)}function Xi(e,t){var n=t._currentValue;if(t={context:t,memoizedValue:n,next:null},Bi===null){if(e===null)throw Error(i(308));Bi=t,e.dependencies={lanes:0,firstContext:t},e.flags|=524288}else Bi=Bi.next=t;return n}var Zi=typeof AbortController<`u`?AbortController:function(){var e=[],t=this.signal={aborted:!1,addEventListener:function(t,n){e.push(n)}};this.abort=function(){t.aborted=!0,e.forEach(function(e){return e()})}},Qi=t.unstable_scheduleCallback,$i=t.unstable_NormalPriority,ea={$$typeof:C,Consumer:null,Provider:null,_currentValue:null,_currentValue2:null,_threadCount:0};function ta(){return{controller:new Zi,data:new Map,refCount:0}}function na(e){e.refCount--,e.refCount===0&&Qi($i,function(){e.controller.abort()})}var ra=null,ia=0,aa=0,oa=null;function sa(e,t){if(ra===null){var n=ra=[];ia=0,aa=ld(),oa={status:`pending`,value:void 0,then:function(e){n.push(e)}}}return ia++,t.then(ca,ca),t}function ca(){if(--ia===0&&ra!==null){oa!==null&&(oa.status=`fulfilled`);var e=ra;ra=null,aa=0,oa=null;for(var t=0;t<e.length;t++)(0,e[t])()}}function la(e,t){var n=[],r={status:`pending`,value:null,reason:null,then:function(e){n.push(e)}};return e.then(function(){r.status=`fulfilled`,r.value=t;for(var e=0;e<n.length;e++)(0,n[e])(t)},function(e){for(r.status=`rejected`,r.reason=e,e=0;e<n.length;e++)(0,n[e])(void 0)}),r}var ua=P.S;P.S=function(e,t){Zl=be(),typeof t==`object`&&t&&typeof t.then==`function`&&sa(e,t),ua!==null&&ua(e,t)};var da=R(null);function fa(){var e=da.current;return e===null?Nl.pooledCache:e}function pa(e,t){t===null?B(da,da.current):B(da,t.pool)}function ma(){var e=fa();return e===null?null:{parent:ea._currentValue,pool:e}}var ha=Error(i(460)),ga=Error(i(474)),_a=Error(i(542)),va={then:function(){}};function ya(e){return e=e.status,e===`fulfilled`||e===`rejected`}function ba(e,t,n){switch(n=e[n],n===void 0?e.push(t):n!==t&&(t.then(qt,qt),t=n),t.status){case`fulfilled`:return t.value;case`rejected`:throw e=t.reason,wa(e),e;default:if(typeof t.status==`string`)t.then(qt,qt);else{if(e=Nl,e!==null&&100<e.shellSuspendCounter)throw Error(i(482));e=t,e.status=`pending`,e.then(function(e){if(t.status===`pending`){var n=t;n.status=`fulfilled`,n.value=e}},function(e){if(t.status===`pending`){var n=t;n.status=`rejected`,n.reason=e}})}switch(t.status){case`fulfilled`:return t.value;case`rejected`:throw e=t.reason,wa(e),e}throw Sa=t,ha}}function xa(e){try{var t=e._init;return t(e._payload)}catch(e){throw typeof e==`object`&&e&&typeof e.then==`function`?(Sa=e,ha):e}}var Sa=null;function Ca(){if(Sa===null)throw Error(i(459));var e=Sa;return Sa=null,e}function wa(e){if(e===ha||e===_a)throw Error(i(483))}var Ta=null,Ea=0;function Da(e){var t=Ea;return Ea+=1,Ta===null&&(Ta=[]),ba(Ta,e,t)}function Oa(e,t){t=t.props.ref,e.ref=t===void 0?null:t}function ka(e,t){throw t.$$typeof===h?Error(i(525)):(e=Object.prototype.toString.call(t),Error(i(31,e===`[object Object]`?`object with keys {`+Object.keys(t).join(`, `)+`}`:e)))}function Aa(e){function t(t,n){if(e){var r=t.deletions;r===null?(t.deletions=[n],t.flags|=16):r.push(n)}}function n(n,r){if(!e)return null;for(;r!==null;)t(n,r),r=r.sibling;return null}function r(e){for(var t=new Map;e!==null;)e.key===null?t.set(e.index,e):t.set(e.key,e),e=e.sibling;return t}function a(e,t){return e=ri(e,t),e.index=0,e.sibling=null,e}function o(t,n,r){return t.index=r,e?(r=t.alternate,r===null?(t.flags|=67108866,n):(r=r.index,r<n?(t.flags|=67108866,n):r)):(t.flags|=1048576,n)}function s(t){return e&&t.alternate===null&&(t.flags|=67108866),t}function c(e,t,n,r){return t===null||t.tag!==6?(t=si(n,e.mode,r),t.return=e,t):(t=a(t,n),t.return=e,t)}function l(e,t,n,r){var i=n.type;return i===y?d(e,t,n.props.children,r,n.key):t!==null&&(t.elementType===i||typeof i==`object`&&i&&i.$$typeof===O&&xa(i)===t.type)?(t=a(t,n.props),Oa(t,n),t.return=e,t):(t=ai(n.type,n.key,n.props,null,e.mode,r),Oa(t,n),t.return=e,t)}function u(e,t,n,r){return t===null||t.tag!==4||t.stateNode.containerInfo!==n.containerInfo||t.stateNode.implementation!==n.implementation?(t=li(n,e.mode,r),t.return=e,t):(t=a(t,n.children||[]),t.return=e,t)}function d(e,t,n,r,i){return t===null||t.tag!==7?(t=oi(n,e.mode,r,i),t.return=e,t):(t=a(t,n),t.return=e,t)}function f(e,t,n){if(typeof t==`string`&&t!==``||typeof t==`number`||typeof t==`bigint`)return t=si(``+t,e.mode,n),t.return=e,t;if(typeof t==`object`&&t){switch(t.$$typeof){case _:return n=ai(t.type,t.key,t.props,null,e.mode,n),Oa(n,t),n.return=e,n;case v:return t=li(t,e.mode,n),t.return=e,t;case O:return t=xa(t),f(e,t,n)}if(N(t)||j(t))return t=oi(t,e.mode,n,null),t.return=e,t;if(typeof t.then==`function`)return f(e,Da(t),n);if(t.$$typeof===C)return f(e,Yi(e,t),n);ka(e,t)}return null}function p(e,t,n,r){var i=t===null?null:t.key;if(typeof n==`string`&&n!==``||typeof n==`number`||typeof n==`bigint`)return i===null?c(e,t,``+n,r):null;if(typeof n==`object`&&n){switch(n.$$typeof){case _:return n.key===i?l(e,t,n,r):null;case v:return n.key===i?u(e,t,n,r):null;case O:return n=xa(n),p(e,t,n,r)}if(N(n)||j(n))return i===null?d(e,t,n,r,null):null;if(typeof n.then==`function`)return p(e,t,Da(n),r);if(n.$$typeof===C)return p(e,t,Yi(e,n),r);ka(e,n)}return null}function m(e,t,n,r,i){if(typeof r==`string`&&r!==``||typeof r==`number`||typeof r==`bigint`)return e=e.get(n)||null,c(t,e,``+r,i);if(typeof r==`object`&&r){switch(r.$$typeof){case _:return e=e.get(r.key===null?n:r.key)||null,l(t,e,r,i);case v:return e=e.get(r.key===null?n:r.key)||null,u(t,e,r,i);case O:return r=xa(r),m(e,t,n,r,i)}if(N(r)||j(r))return e=e.get(n)||null,d(t,e,r,i,null);if(typeof r.then==`function`)return m(e,t,n,Da(r),i);if(r.$$typeof===C)return m(e,t,n,Yi(t,r),i);ka(t,r)}return null}function h(i,a,s,c){for(var l=null,u=null,d=a,h=a=0,g=null;d!==null&&h<s.length;h++){d.index>h?(g=d,d=null):g=d.sibling;var _=p(i,d,s[h],c);if(_===null){d===null&&(d=g);break}e&&d&&_.alternate===null&&t(i,d),a=o(_,a,h),u===null?l=_:u.sibling=_,u=_,d=g}if(h===s.length)return n(i,d),K&&xi(i,h),l;if(d===null){for(;h<s.length;h++)d=f(i,s[h],c),d!==null&&(a=o(d,a,h),u===null?l=d:u.sibling=d,u=d);return K&&xi(i,h),l}for(d=r(d);h<s.length;h++)g=m(d,i,h,s[h],c),g!==null&&(e&&g.alternate!==null&&d.delete(g.key===null?h:g.key),a=o(g,a,h),u===null?l=g:u.sibling=g,u=g);return e&&d.forEach(function(e){return t(i,e)}),K&&xi(i,h),l}function g(a,s,c,l){if(c==null)throw Error(i(151));for(var u=null,d=null,h=s,g=s=0,_=null,v=c.next();h!==null&&!v.done;g++,v=c.next()){h.index>g?(_=h,h=null):_=h.sibling;var y=p(a,h,v.value,l);if(y===null){h===null&&(h=_);break}e&&h&&y.alternate===null&&t(a,h),s=o(y,s,g),d===null?u=y:d.sibling=y,d=y,h=_}if(v.done)return n(a,h),K&&xi(a,g),u;if(h===null){for(;!v.done;g++,v=c.next())v=f(a,v.value,l),v!==null&&(s=o(v,s,g),d===null?u=v:d.sibling=v,d=v);return K&&xi(a,g),u}for(h=r(h);!v.done;g++,v=c.next())v=m(h,a,g,v.value,l),v!==null&&(e&&v.alternate!==null&&h.delete(v.key===null?g:v.key),s=o(v,s,g),d===null?u=v:d.sibling=v,d=v);return e&&h.forEach(function(e){return t(a,e)}),K&&xi(a,g),u}function b(e,r,o,c){if(typeof o==`object`&&o&&o.type===y&&o.key===null&&(o=o.props.children),typeof o==`object`&&o){switch(o.$$typeof){case _:a:{for(var l=o.key;r!==null;){if(r.key===l){if(l=o.type,l===y){if(r.tag===7){n(e,r.sibling),c=a(r,o.props.children),c.return=e,e=c;break a}}else if(r.elementType===l||typeof l==`object`&&l&&l.$$typeof===O&&xa(l)===r.type){n(e,r.sibling),c=a(r,o.props),Oa(c,o),c.return=e,e=c;break a}n(e,r);break}t(e,r),r=r.sibling}o.type===y?(c=oi(o.props.children,e.mode,c,o.key),c.return=e,e=c):(c=ai(o.type,o.key,o.props,null,e.mode,c),Oa(c,o),c.return=e,e=c)}return s(e);case v:a:{for(l=o.key;r!==null;){if(r.key===l){if(r.tag===4&&r.stateNode.containerInfo===o.containerInfo&&r.stateNode.implementation===o.implementation){n(e,r.sibling),c=a(r,o.children||[]),c.return=e,e=c;break a}n(e,r);break}t(e,r),r=r.sibling}c=li(o,e.mode,c),c.return=e,e=c}return s(e);case O:return o=xa(o),b(e,r,o,c)}if(N(o))return h(e,r,o,c);if(j(o)){if(l=j(o),typeof l!=`function`)throw Error(i(150));return o=l.call(o),g(e,r,o,c)}if(typeof o.then==`function`)return b(e,r,Da(o),c);if(o.$$typeof===C)return b(e,r,Yi(e,o),c);ka(e,o)}return typeof o==`string`&&o!==``||typeof o==`number`||typeof o==`bigint`?(o=``+o,r!==null&&r.tag===6?(n(e,r.sibling),c=a(r,o),c.return=e,e=c):(n(e,r),c=si(o,e.mode,c),c.return=e,e=c),s(e)):n(e,r)}return function(e,t,n,r){try{Ea=0;var i=b(e,t,n,r);return Ta=null,i}catch(t){if(t===ha||t===_a)throw t;var a=ti(29,t,null,e.mode);return a.lanes=r,a.return=e,a}}}var ja=Aa(!0),Ma=Aa(!1),Na=!1;function Pa(e){e.updateQueue={baseState:e.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,lanes:0,hiddenCallbacks:null},callbacks:null}}function Fa(e,t){e=e.updateQueue,t.updateQueue===e&&(t.updateQueue={baseState:e.baseState,firstBaseUpdate:e.firstBaseUpdate,lastBaseUpdate:e.lastBaseUpdate,shared:e.shared,callbacks:null})}function Ia(e){return{lane:e,tag:0,payload:null,callback:null,next:null}}function La(e,t,n){var r=e.updateQueue;if(r===null)return null;if(r=r.shared,Ml&2){var i=r.pending;return i===null?t.next=t:(t.next=i.next,i.next=t),r.pending=t,t=Qr(e),Zr(e,null,n),t}return Jr(e,r,t,n),Qr(e)}function Ra(e,t,n){if(t=t.updateQueue,t!==null&&(t=t.shared,n&4194048)){var r=t.lanes;r&=e.pendingLanes,n|=r,t.lanes=n,Je(e,n)}}function za(e,t){var n=e.updateQueue,r=e.alternate;if(r!==null&&(r=r.updateQueue,n===r)){var i=null,a=null;if(n=n.firstBaseUpdate,n!==null){do{var o={lane:n.lane,tag:n.tag,payload:n.payload,callback:null,next:null};a===null?i=a=o:a=a.next=o,n=n.next}while(n!==null);a===null?i=a=t:a=a.next=t}else i=a=t;n={baseState:r.baseState,firstBaseUpdate:i,lastBaseUpdate:a,shared:r.shared,callbacks:r.callbacks},e.updateQueue=n;return}e=n.lastBaseUpdate,e===null?n.firstBaseUpdate=t:e.next=t,n.lastBaseUpdate=t}var Ba=!1;function Va(){if(Ba){var e=oa;if(e!==null)throw e}}function Ha(e,t,n,r){Ba=!1;var i=e.updateQueue;Na=!1;var a=i.firstBaseUpdate,o=i.lastBaseUpdate,s=i.shared.pending;if(s!==null){i.shared.pending=null;var c=s,l=c.next;c.next=null,o===null?a=l:o.next=l,o=c;var u=e.alternate;u!==null&&(u=u.updateQueue,s=u.lastBaseUpdate,s!==o&&(s===null?u.firstBaseUpdate=l:s.next=l,u.lastBaseUpdate=c))}if(a!==null){var d=i.baseState;o=0,u=l=c=null,s=a;do{var f=s.lane&-536870913,m=f!==s.lane;if(m?(Fl&f)===f:(r&f)===f){f!==0&&f===aa&&(Ba=!0),u!==null&&(u=u.next={lane:0,tag:s.tag,payload:s.payload,callback:null,next:null});a:{var h=e,g=s;f=t;var _=n;switch(g.tag){case 1:if(h=g.payload,typeof h==`function`){d=h.call(_,d,f);break a}d=h;break a;case 3:h.flags=h.flags&-65537|128;case 0:if(h=g.payload,f=typeof h==`function`?h.call(_,d,f):h,f==null)break a;d=p({},d,f);break a;case 2:Na=!0}}f=s.callback,f!==null&&(e.flags|=64,m&&(e.flags|=8192),m=i.callbacks,m===null?i.callbacks=[f]:m.push(f))}else m={lane:f,tag:s.tag,payload:s.payload,callback:s.callback,next:null},u===null?(l=u=m,c=d):u=u.next=m,o|=f;if(s=s.next,s===null){if(s=i.shared.pending,s===null)break;m=s,s=m.next,m.next=null,i.lastBaseUpdate=m,i.shared.pending=null}}while(1);u===null&&(c=d),i.baseState=c,i.firstBaseUpdate=l,i.lastBaseUpdate=u,a===null&&(i.shared.lanes=0),Ul|=o,e.lanes=o,e.memoizedState=d}}function Ua(e,t){if(typeof e!=`function`)throw Error(i(191,e));e.call(t)}function Wa(e,t){var n=e.callbacks;if(n!==null)for(e.callbacks=null,e=0;e<n.length;e++)Ua(n[e],t)}var Ga=R(null),Ka=R(0);function qa(e,t){e=Vl,B(Ka,e),B(Ga,t),Vl=e|t.baseLanes}function Ja(){B(Ka,Vl),B(Ga,Ga.current)}function Ya(){Vl=Ka.current,z(Ga),z(Ka)}var Xa=R(null),Za=null;function Qa(e){var t=e.alternate;B(ro,ro.current&1),B(Xa,e),Za===null&&(t===null||Ga.current!==null||t.memoizedState!==null)&&(Za=e)}function $a(e){B(ro,ro.current),B(Xa,e),Za===null&&(Za=e)}function eo(e){e.tag===22?(B(ro,ro.current),B(Xa,e),Za===null&&(Za=e)):to(e)}function to(){B(ro,ro.current),B(Xa,Xa.current)}function no(e){z(Xa),Za===e&&(Za=null),z(ro)}var ro=R(0);function io(e){for(var t=e;t!==null;){if(t.tag===13){var n=t.memoizedState;if(n!==null&&(n=n.dehydrated,n===null||af(n)||of(n)))return t}else if(t.tag===19&&(t.memoizedProps.revealOrder===`forwards`||t.memoizedProps.revealOrder===`backwards`||t.memoizedProps.revealOrder===`unstable_legacy-backwards`||t.memoizedProps.revealOrder===`together`)){if(t.flags&128)return t}else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return null;t=t.return}t.sibling.return=t.return,t=t.sibling}return null}var ao=0,q=null,J=null,Y=null,oo=!1,so=!1,co=!1,lo=0,uo=0,fo=null,po=0;function mo(){throw Error(i(321))}function ho(e,t){if(t===null)return!1;for(var n=0;n<t.length&&n<e.length;n++)if(!hr(e[n],t[n]))return!1;return!0}function go(e,t,n,r,i,a){return ao=a,q=t,t.memoizedState=null,t.updateQueue=null,t.lanes=0,P.H=e===null||e.memoizedState===null?As:js,co=!1,a=n(r,i),co=!1,so&&(a=vo(t,n,r,i)),_o(e),a}function _o(e){P.H=ks;var t=J!==null&&J.next!==null;if(ao=0,Y=J=q=null,oo=!1,uo=0,fo=null,t)throw Error(i(300));e===null||Js||(e=e.dependencies,e!==null&&Ki(e)&&(Js=!0))}function vo(e,t,n,r){q=e;var a=0;do{if(so&&(fo=null),uo=0,so=!1,25<=a)throw Error(i(301));if(a+=1,Y=J=null,e.updateQueue!=null){var o=e.updateQueue;o.lastEffect=null,o.events=null,o.stores=null,o.memoCache!=null&&(o.memoCache.index=0)}P.H=Ms,o=t(n,r)}while(so);return o}function yo(){var e=P.H,t=e.useState()[0];return t=typeof t.then==`function`?Eo(t):t,e=e.useState()[0],(J===null?null:J.memoizedState)!==e&&(q.flags|=1024),t}function bo(){var e=lo!==0;return lo=0,e}function xo(e,t,n){t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~n}function So(e){if(oo){for(e=e.memoizedState;e!==null;){var t=e.queue;t!==null&&(t.pending=null),e=e.next}oo=!1}ao=0,Y=J=q=null,so=!1,uo=lo=0,fo=null}function Co(){var e={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return Y===null?q.memoizedState=Y=e:Y=Y.next=e,Y}function wo(){if(J===null){var e=q.alternate;e=e===null?null:e.memoizedState}else e=J.next;var t=Y===null?q.memoizedState:Y.next;if(t!==null)Y=t,J=e;else{if(e===null)throw q.alternate===null?Error(i(467)):Error(i(310));J=e,e={memoizedState:J.memoizedState,baseState:J.baseState,baseQueue:J.baseQueue,queue:J.queue,next:null},Y===null?q.memoizedState=Y=e:Y=Y.next=e}return Y}function To(){return{lastEffect:null,events:null,stores:null,memoCache:null}}function Eo(e){var t=uo;return uo+=1,fo===null&&(fo=[]),e=ba(fo,e,t),t=q,(Y===null?t.memoizedState:Y.next)===null&&(t=t.alternate,P.H=t===null||t.memoizedState===null?As:js),e}function Do(e){if(typeof e==`object`&&e){if(typeof e.then==`function`)return Eo(e);if(e.$$typeof===C)return Ji(e)}throw Error(i(438,String(e)))}function Oo(e){var t=null,n=q.updateQueue;if(n!==null&&(t=n.memoCache),t==null){var r=q.alternate;r!==null&&(r=r.updateQueue,r!==null&&(r=r.memoCache,r!=null&&(t={data:r.data.map(function(e){return e.slice()}),index:0})))}if(t??(t={data:[],index:0}),n===null&&(n=To(),q.updateQueue=n),n.memoCache=t,n=t.data[t.index],n===void 0)for(n=t.data[t.index]=Array(e),r=0;r<e;r++)n[r]=ee;return t.index++,n}function ko(e,t){return typeof t==`function`?t(e):t}function Ao(e){return jo(wo(),J,e)}function jo(e,t,n){var r=e.queue;if(r===null)throw Error(i(311));r.lastRenderedReducer=n;var a=e.baseQueue,o=r.pending;if(o!==null){if(a!==null){var s=a.next;a.next=o.next,o.next=s}t.baseQueue=a=o,r.pending=null}if(o=e.baseState,a===null)e.memoizedState=o;else{t=a.next;var c=s=null,l=null,u=t,d=!1;do{var f=u.lane&-536870913;if(f===u.lane?(ao&f)===f:(Fl&f)===f){var p=u.revertLane;if(p===0)l!==null&&(l=l.next={lane:0,revertLane:0,gesture:null,action:u.action,hasEagerState:u.hasEagerState,eagerState:u.eagerState,next:null}),f===aa&&(d=!0);else if((ao&p)===p){u=u.next,p===aa&&(d=!0);continue}else f={lane:0,revertLane:u.revertLane,gesture:null,action:u.action,hasEagerState:u.hasEagerState,eagerState:u.eagerState,next:null},l===null?(c=l=f,s=o):l=l.next=f,q.lanes|=p,Ul|=p;f=u.action,co&&n(o,f),o=u.hasEagerState?u.eagerState:n(o,f)}else p={lane:f,revertLane:u.revertLane,gesture:u.gesture,action:u.action,hasEagerState:u.hasEagerState,eagerState:u.eagerState,next:null},l===null?(c=l=p,s=o):l=l.next=p,q.lanes|=f,Ul|=f;u=u.next}while(u!==null&&u!==t);if(l===null?s=o:l.next=c,!hr(o,e.memoizedState)&&(Js=!0,d&&(n=oa,n!==null)))throw n;e.memoizedState=o,e.baseState=s,e.baseQueue=l,r.lastRenderedState=o}return a===null&&(r.lanes=0),[e.memoizedState,r.dispatch]}function Mo(e){var t=wo(),n=t.queue;if(n===null)throw Error(i(311));n.lastRenderedReducer=e;var r=n.dispatch,a=n.pending,o=t.memoizedState;if(a!==null){n.pending=null;var s=a=a.next;do o=e(o,s.action),s=s.next;while(s!==a);hr(o,t.memoizedState)||(Js=!0),t.memoizedState=o,t.baseQueue===null&&(t.baseState=o),n.lastRenderedState=o}return[o,r]}function No(e,t,n){var r=q,a=wo(),o=K;if(o){if(n===void 0)throw Error(i(407));n=n()}else n=t();var s=!hr((J||a).memoizedState,n);if(s&&(a.memoizedState=n,Js=!0),a=a.queue,is(Io.bind(null,r,a,e),[e]),a.getSnapshot!==t||s||Y!==null&&Y.memoizedState.tag&1){if(r.flags|=2048,$o(9,{destroy:void 0},Fo.bind(null,r,a,n,t),null),Nl===null)throw Error(i(349));o||ao&127||Po(r,t,n)}return n}function Po(e,t,n){e.flags|=16384,e={getSnapshot:t,value:n},t=q.updateQueue,t===null?(t=To(),q.updateQueue=t,t.stores=[e]):(n=t.stores,n===null?t.stores=[e]:n.push(e))}function Fo(e,t,n,r){t.value=n,t.getSnapshot=r,Lo(t)&&Ro(e)}function Io(e,t,n){return n(function(){Lo(t)&&Ro(e)})}function Lo(e){var t=e.getSnapshot;e=e.value;try{var n=t();return!hr(e,n)}catch{return!0}}function Ro(e){var t=Xr(e,2);t!==null&&fu(t,e,2)}function zo(e){var t=Co();if(typeof e==`function`){var n=e;if(e=n(),co){je(!0);try{n()}finally{je(!1)}}}return t.memoizedState=t.baseState=e,t.queue={pending:null,lanes:0,dispatch:null,lastRenderedReducer:ko,lastRenderedState:e},t}function Bo(e,t,n,r){return e.baseState=n,jo(e,J,typeof r==`function`?r:ko)}function Vo(e,t,n,r,a){if(Q(e))throw Error(i(485));if(e=t.action,e!==null){var o={payload:a,action:e,next:null,isTransition:!0,status:`pending`,value:null,reason:null,listeners:[],then:function(e){o.listeners.push(e)}};P.T===null?o.isTransition=!1:n(!0),r(o),n=t.pending,n===null?(o.next=t.pending=o,Ho(t,o)):(o.next=n.next,t.pending=n.next=o)}}function Ho(e,t){var n=t.action,r=t.payload,i=e.state;if(t.isTransition){var a=P.T,o={};P.T=o;try{var s=n(i,r),c=P.S;c!==null&&c(o,s),Uo(e,t,s)}catch(n){Go(e,t,n)}finally{a!==null&&o.types!==null&&(a.types=o.types),P.T=a}}else try{a=n(i,r),Uo(e,t,a)}catch(n){Go(e,t,n)}}function Uo(e,t,n){typeof n==`object`&&n&&typeof n.then==`function`?n.then(function(n){Wo(e,t,n)},function(n){return Go(e,t,n)}):Wo(e,t,n)}function Wo(e,t,n){t.status=`fulfilled`,t.value=n,Ko(t),e.state=n,t=e.pending,t!==null&&(n=t.next,n===t?e.pending=null:(n=n.next,t.next=n,Ho(e,n)))}function Go(e,t,n){var r=e.pending;if(e.pending=null,r!==null){r=r.next;do t.status=`rejected`,t.reason=n,Ko(t),t=t.next;while(t!==r)}e.action=null}function Ko(e){e=e.listeners;for(var t=0;t<e.length;t++)(0,e[t])()}function qo(e,t){return t}function Jo(e,t){if(K){var n=Nl.formState;if(n!==null){a:{var r=q;if(K){if(Di){b:{for(var i=Di,a=ki;i.nodeType!==8;){if(!a){i=null;break b}if(i=cf(i.nextSibling),i===null){i=null;break b}}a=i.data,i=a===`F!`||a===`F`?i:null}if(i){Di=cf(i.nextSibling),r=i.data===`F!`;break a}}ji(r)}r=!1}r&&(t=n[0])}}return n=Co(),n.memoizedState=n.baseState=t,r={pending:null,lanes:0,dispatch:null,lastRenderedReducer:qo,lastRenderedState:t},n.queue=r,n=ws.bind(null,q,r),r.dispatch=n,r=zo(!1),a=Es.bind(null,q,!1,r.queue),r=Co(),i={state:t,dispatch:null,action:e,pending:null},r.queue=i,n=Vo.bind(null,q,i,a,n),i.dispatch=n,r.memoizedState=e,[t,n,!1]}function Yo(e){return Xo(wo(),J,e)}function Xo(e,t,n){if(t=jo(e,t,qo)[0],e=Ao(ko)[0],typeof t==`object`&&t&&typeof t.then==`function`)try{var r=Eo(t)}catch(e){throw e===ha?_a:e}else r=t;t=wo();var i=t.queue,a=i.dispatch;return n!==t.memoizedState&&(q.flags|=2048,$o(9,{destroy:void 0},Zo.bind(null,i,n),null)),[r,a,e]}function Zo(e,t){e.action=t}function Qo(e){var t=wo(),n=J;if(n!==null)return Xo(t,n,e);wo(),t=t.memoizedState,n=wo();var r=n.queue.dispatch;return n.memoizedState=e,[t,r,!1]}function $o(e,t,n,r){return e={tag:e,create:n,deps:r,inst:t,next:null},t=q.updateQueue,t===null&&(t=To(),q.updateQueue=t),n=t.lastEffect,n===null?t.lastEffect=e.next=e:(r=n.next,n.next=e,e.next=r,t.lastEffect=e),e}function es(){return wo().memoizedState}function ts(e,t,n,r){var i=Co();q.flags|=e,i.memoizedState=$o(1|t,{destroy:void 0},n,r===void 0?null:r)}function ns(e,t,n,r){var i=wo();r=r===void 0?null:r;var a=i.memoizedState.inst;J!==null&&r!==null&&ho(r,J.memoizedState.deps)?i.memoizedState=$o(t,a,n,r):(q.flags|=e,i.memoizedState=$o(1|t,a,n,r))}function rs(e,t){ts(8390656,8,e,t)}function is(e,t){ns(2048,8,e,t)}function as(e){q.flags|=4;var t=q.updateQueue;if(t===null)t=To(),q.updateQueue=t,t.events=[e];else{var n=t.events;n===null?t.events=[e]:n.push(e)}}function os(e){var t=wo().memoizedState;return as({ref:t,nextImpl:e}),function(){if(Ml&2)throw Error(i(440));return t.impl.apply(void 0,arguments)}}function ss(e,t){return ns(4,2,e,t)}function cs(e,t){return ns(4,4,e,t)}function ls(e,t){if(typeof t==`function`){e=e();var n=t(e);return function(){typeof n==`function`?n():t(null)}}if(t!=null)return e=e(),t.current=e,function(){t.current=null}}function us(e,t,n){n=n==null?null:n.concat([e]),ns(4,4,ls.bind(null,t,e),n)}function ds(){}function fs(e,t){var n=wo();t=t===void 0?null:t;var r=n.memoizedState;return t!==null&&ho(t,r[1])?r[0]:(n.memoizedState=[e,t],e)}function ps(e,t){var n=wo();t=t===void 0?null:t;var r=n.memoizedState;if(t!==null&&ho(t,r[1]))return r[0];if(r=e(),co){je(!0);try{e()}finally{je(!1)}}return n.memoizedState=[r,t],r}function ms(e,t,n){return n===void 0||ao&1073741824&&!(Fl&261930)?e.memoizedState=t:(e.memoizedState=n,e=du(),q.lanes|=e,Ul|=e,n)}function hs(e,t,n,r){return hr(n,t)?n:Ga.current===null?!(ao&42)||ao&1073741824&&!(Fl&261930)?(Js=!0,e.memoizedState=n):(e=du(),q.lanes|=e,Ul|=e,t):(e=ms(e,n,r),hr(e,t)||(Js=!0),e)}function gs(e,t,n,r,i){var a=F.p;F.p=a!==0&&8>a?a:8;var o=P.T,s={};P.T=s,Es(e,!1,t,n);try{var c=i(),l=P.S;l!==null&&l(s,c),typeof c==`object`&&c&&typeof c.then==`function`?Ts(e,t,la(c,r),uu(e)):Ts(e,t,r,uu(e))}catch(n){Ts(e,t,{then:function(){},status:`rejected`,reason:n},uu())}finally{F.p=a,o!==null&&s.types!==null&&(o.types=s.types),P.T=o}}function _s(){}function vs(e,t,n,r){if(e.tag!==5)throw Error(i(476));var a=X(e).queue;gs(e,a,t,I,n===null?_s:function(){return ys(e),n(r)})}function X(e){var t=e.memoizedState;if(t!==null)return t;t={memoizedState:I,baseState:I,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:ko,lastRenderedState:I},next:null};var n={};return t.next={memoizedState:n,baseState:n,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:ko,lastRenderedState:n},next:null},e.memoizedState=t,e=e.alternate,e!==null&&(e.memoizedState=t),t}function ys(e){var t=X(e);t.next===null&&(t=e.alternate.memoizedState),Ts(e,t.next.queue,{},uu())}function bs(){return Ji(Qf)}function xs(){return wo().memoizedState}function Ss(){return wo().memoizedState}function Cs(e){for(var t=e.return;t!==null;){switch(t.tag){case 24:case 3:var n=uu();e=Ia(n);var r=La(t,e,n);r!==null&&(fu(r,t,n),Ra(r,t,n)),t={cache:ta()},e.payload=t;return}t=t.return}}function Z(e,t,n){var r=uu();n={lane:r,revertLane:0,gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null},Q(e)?Ds(t,n):(n=Yr(e,t,n,r),n!==null&&(fu(n,e,r),Os(n,t,r)))}function ws(e,t,n){Ts(e,t,n,uu())}function Ts(e,t,n,r){var i={lane:r,revertLane:0,gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null};if(Q(e))Ds(t,i);else{var a=e.alternate;if(e.lanes===0&&(a===null||a.lanes===0)&&(a=t.lastRenderedReducer,a!==null))try{var o=t.lastRenderedState,s=a(o,n);if(i.hasEagerState=!0,i.eagerState=s,hr(s,o))return Jr(e,t,i,0),Nl===null&&qr(),!1}catch{}if(n=Yr(e,t,i,r),n!==null)return fu(n,e,r),Os(n,t,r),!0}return!1}function Es(e,t,n,r){if(r={lane:2,revertLane:ld(),gesture:null,action:r,hasEagerState:!1,eagerState:null,next:null},Q(e)){if(t)throw Error(i(479))}else t=Yr(e,n,r,2),t!==null&&fu(t,e,2)}function Q(e){var t=e.alternate;return e===q||t!==null&&t===q}function Ds(e,t){so=oo=!0;var n=e.pending;n===null?t.next=t:(t.next=n.next,n.next=t),e.pending=t}function Os(e,t,n){if(n&4194048){var r=t.lanes;r&=e.pendingLanes,n|=r,t.lanes=n,Je(e,n)}}var ks={readContext:Ji,use:Do,useCallback:mo,useContext:mo,useEffect:mo,useImperativeHandle:mo,useLayoutEffect:mo,useInsertionEffect:mo,useMemo:mo,useReducer:mo,useRef:mo,useState:mo,useDebugValue:mo,useDeferredValue:mo,useTransition:mo,useSyncExternalStore:mo,useId:mo,useHostTransitionStatus:mo,useFormState:mo,useActionState:mo,useOptimistic:mo,useMemoCache:mo,useCacheRefresh:mo};ks.useEffectEvent=mo;var As={readContext:Ji,use:Do,useCallback:function(e,t){return Co().memoizedState=[e,t===void 0?null:t],e},useContext:Ji,useEffect:rs,useImperativeHandle:function(e,t,n){n=n==null?null:n.concat([e]),ts(4194308,4,ls.bind(null,t,e),n)},useLayoutEffect:function(e,t){return ts(4194308,4,e,t)},useInsertionEffect:function(e,t){ts(4,2,e,t)},useMemo:function(e,t){var n=Co();t=t===void 0?null:t;var r=e();if(co){je(!0);try{e()}finally{je(!1)}}return n.memoizedState=[r,t],r},useReducer:function(e,t,n){var r=Co();if(n!==void 0){var i=n(t);if(co){je(!0);try{n(t)}finally{je(!1)}}}else i=t;return r.memoizedState=r.baseState=i,e={pending:null,lanes:0,dispatch:null,lastRenderedReducer:e,lastRenderedState:i},r.queue=e,e=e.dispatch=Z.bind(null,q,e),[r.memoizedState,e]},useRef:function(e){var t=Co();return e={current:e},t.memoizedState=e},useState:function(e){e=zo(e);var t=e.queue,n=ws.bind(null,q,t);return t.dispatch=n,[e.memoizedState,n]},useDebugValue:ds,useDeferredValue:function(e,t){return ms(Co(),e,t)},useTransition:function(){var e=zo(!1);return e=gs.bind(null,q,e.queue,!0,!1),Co().memoizedState=e,[!1,e]},useSyncExternalStore:function(e,t,n){var r=q,a=Co();if(K){if(n===void 0)throw Error(i(407));n=n()}else{if(n=t(),Nl===null)throw Error(i(349));Fl&127||Po(r,t,n)}a.memoizedState=n;var o={value:n,getSnapshot:t};return a.queue=o,rs(Io.bind(null,r,o,e),[e]),r.flags|=2048,$o(9,{destroy:void 0},Fo.bind(null,r,o,n,t),null),n},useId:function(){var e=Co(),t=Nl.identifierPrefix;if(K){var n=bi,r=yi;n=(r&~(1<<32-Me(r)-1)).toString(32)+n,t=`_`+t+`R_`+n,n=lo++,0<n&&(t+=`H`+n.toString(32)),t+=`_`}else n=po++,t=`_`+t+`r_`+n.toString(32)+`_`;return e.memoizedState=t},useHostTransitionStatus:bs,useFormState:Jo,useActionState:Jo,useOptimistic:function(e){var t=Co();t.memoizedState=t.baseState=e;var n={pending:null,lanes:0,dispatch:null,lastRenderedReducer:null,lastRenderedState:null};return t.queue=n,t=Es.bind(null,q,!0,n),n.dispatch=t,[e,t]},useMemoCache:Oo,useCacheRefresh:function(){return Co().memoizedState=Cs.bind(null,q)},useEffectEvent:function(e){var t=Co(),n={impl:e};return t.memoizedState=n,function(){if(Ml&2)throw Error(i(440));return n.impl.apply(void 0,arguments)}}},js={readContext:Ji,use:Do,useCallback:fs,useContext:Ji,useEffect:is,useImperativeHandle:us,useInsertionEffect:ss,useLayoutEffect:cs,useMemo:ps,useReducer:Ao,useRef:es,useState:function(){return Ao(ko)},useDebugValue:ds,useDeferredValue:function(e,t){return hs(wo(),J.memoizedState,e,t)},useTransition:function(){var e=Ao(ko)[0],t=wo().memoizedState;return[typeof e==`boolean`?e:Eo(e),t]},useSyncExternalStore:No,useId:xs,useHostTransitionStatus:bs,useFormState:Yo,useActionState:Yo,useOptimistic:function(e,t){return Bo(wo(),J,e,t)},useMemoCache:Oo,useCacheRefresh:Ss};js.useEffectEvent=os;var Ms={readContext:Ji,use:Do,useCallback:fs,useContext:Ji,useEffect:is,useImperativeHandle:us,useInsertionEffect:ss,useLayoutEffect:cs,useMemo:ps,useReducer:Mo,useRef:es,useState:function(){return Mo(ko)},useDebugValue:ds,useDeferredValue:function(e,t){var n=wo();return J===null?ms(n,e,t):hs(n,J.memoizedState,e,t)},useTransition:function(){var e=Mo(ko)[0],t=wo().memoizedState;return[typeof e==`boolean`?e:Eo(e),t]},useSyncExternalStore:No,useId:xs,useHostTransitionStatus:bs,useFormState:Qo,useActionState:Qo,useOptimistic:function(e,t){var n=wo();return J===null?(n.baseState=e,[e,n.queue.dispatch]):Bo(n,J,e,t)},useMemoCache:Oo,useCacheRefresh:Ss};Ms.useEffectEvent=os;function Ns(e,t,n,r){t=e.memoizedState,n=n(r,t),n=n==null?t:p({},t,n),e.memoizedState=n,e.lanes===0&&(e.updateQueue.baseState=n)}var Ps={enqueueSetState:function(e,t,n){e=e._reactInternals;var r=uu(),i=Ia(r);i.payload=t,n!=null&&(i.callback=n),t=La(e,i,r),t!==null&&(fu(t,e,r),Ra(t,e,r))},enqueueReplaceState:function(e,t,n){e=e._reactInternals;var r=uu(),i=Ia(r);i.tag=1,i.payload=t,n!=null&&(i.callback=n),t=La(e,i,r),t!==null&&(fu(t,e,r),Ra(t,e,r))},enqueueForceUpdate:function(e,t){e=e._reactInternals;var n=uu(),r=Ia(n);r.tag=2,t!=null&&(r.callback=t),t=La(e,r,n),t!==null&&(fu(t,e,n),Ra(t,e,n))}};function Fs(e,t,n,r,i,a,o){return e=e.stateNode,typeof e.shouldComponentUpdate==`function`?e.shouldComponentUpdate(r,a,o):t.prototype&&t.prototype.isPureReactComponent?!gr(n,r)||!gr(i,a):!0}function Is(e,t,n,r){e=t.state,typeof t.componentWillReceiveProps==`function`&&t.componentWillReceiveProps(n,r),typeof t.UNSAFE_componentWillReceiveProps==`function`&&t.UNSAFE_componentWillReceiveProps(n,r),t.state!==e&&Ps.enqueueReplaceState(t,t.state,null)}function Ls(e,t){var n=t;if(`ref`in t)for(var r in n={},t)r!==`ref`&&(n[r]=t[r]);if(e=e.defaultProps)for(var i in n===t&&(n=p({},n)),e)n[i]===void 0&&(n[i]=e[i]);return n}function Rs(e){Ur(e)}function zs(e){console.error(e)}function Bs(e){Ur(e)}function Vs(e,t){try{var n=e.onUncaughtError;n(t.value,{componentStack:t.stack})}catch(e){setTimeout(function(){throw e})}}function Hs(e,t,n){try{var r=e.onCaughtError;r(n.value,{componentStack:n.stack,errorBoundary:t.tag===1?t.stateNode:null})}catch(e){setTimeout(function(){throw e})}}function Us(e,t,n){return n=Ia(n),n.tag=3,n.payload={element:null},n.callback=function(){Vs(e,t)},n}function Ws(e){return e=Ia(e),e.tag=3,e}function Gs(e,t,n,r){var i=n.type.getDerivedStateFromError;if(typeof i==`function`){var a=r.value;e.payload=function(){return i(a)},e.callback=function(){Hs(t,n,r)}}var o=n.stateNode;o!==null&&typeof o.componentDidCatch==`function`&&(e.callback=function(){Hs(t,n,r),typeof i!=`function`&&(eu===null?eu=new Set([this]):eu.add(this));var e=r.stack;this.componentDidCatch(r.value,{componentStack:e===null?``:e})})}function Ks(e,t,n,r,a){if(n.flags|=32768,typeof r==`object`&&r&&typeof r.then==`function`){if(t=n.alternate,t!==null&&Gi(t,n,a,!0),n=Xa.current,n!==null){switch(n.tag){case 31:case 13:return Za===null?wu():n.alternate===null&&Hl===0&&(Hl=3),n.flags&=-257,n.flags|=65536,n.lanes=a,r===va?n.flags|=16384:(t=n.updateQueue,t===null?n.updateQueue=new Set([r]):t.add(r),Uu(e,r,a)),!1;case 22:return n.flags|=65536,r===va?n.flags|=16384:(t=n.updateQueue,t===null?(t={transitions:null,markerInstances:null,retryQueue:new Set([r])},n.updateQueue=t):(n=t.retryQueue,n===null?t.retryQueue=new Set([r]):n.add(r)),Uu(e,r,a)),!1}throw Error(i(435,n.tag))}return Uu(e,r,a),wu(),!1}if(K)return t=Xa.current,t===null?(r!==Ai&&(t=Error(i(423),{cause:r}),Li(di(t,n))),e=e.current.alternate,e.flags|=65536,a&=-a,e.lanes|=a,r=di(r,n),a=Us(e.stateNode,r,a),za(e,a),Hl!==4&&(Hl=2)):(!(t.flags&65536)&&(t.flags|=256),t.flags|=65536,t.lanes=a,r!==Ai&&(e=Error(i(422),{cause:r}),Li(di(e,n)))),!1;var o=Error(i(520),{cause:r});if(o=di(o,n),Jl===null?Jl=[o]:Jl.push(o),Hl!==4&&(Hl=2),t===null)return!0;r=di(r,n),n=t;do{switch(n.tag){case 3:return n.flags|=65536,e=a&-a,n.lanes|=e,e=Us(n.stateNode,r,e),za(n,e),!1;case 1:if(t=n.type,o=n.stateNode,!(n.flags&128)&&(typeof t.getDerivedStateFromError==`function`||o!==null&&typeof o.componentDidCatch==`function`&&(eu===null||!eu.has(o))))return n.flags|=65536,a&=-a,n.lanes|=a,a=Ws(a),Gs(a,e,n,r),za(n,a),!1}n=n.return}while(n!==null);return!1}var qs=Error(i(461)),Js=!1;function Ys(e,t,n,r){t.child=e===null?Ma(t,null,n,r):ja(t,e.child,n,r)}function Xs(e,t,n,r,i){n=n.render;var a=t.ref;if(`ref`in r){var o={};for(var s in r)s!==`ref`&&(o[s]=r[s])}else o=r;return qi(t),r=go(e,t,n,o,a,i),s=bo(),e!==null&&!Js?(xo(e,t,i),bc(e,t,i)):(K&&s&&Ci(t),t.flags|=1,Ys(e,t,r,i),t.child)}function Zs(e,t,n,r,i){if(e===null){var a=n.type;return typeof a==`function`&&!ni(a)&&a.defaultProps===void 0&&n.compare===null?(t.tag=15,t.type=a,Qs(e,t,a,r,i)):(e=ai(n.type,null,r,t,t.mode,i),e.ref=t.ref,e.return=t,t.child=e)}if(a=e.child,!xc(e,i)){var o=a.memoizedProps;if(n=n.compare,n=n===null?gr:n,n(o,r)&&e.ref===t.ref)return bc(e,t,i)}return t.flags|=1,e=ri(a,r),e.ref=t.ref,e.return=t,t.child=e}function Qs(e,t,n,r,i){if(e!==null){var a=e.memoizedProps;if(gr(a,r)&&e.ref===t.ref){if(Js=!1,t.pendingProps=r=a,xc(e,i))e.flags&131072&&(Js=!0);else return t.lanes=e.lanes,bc(e,t,i)}}return oc(e,t,n,r,i)}function $s(e,t,n,r){var i=r.children,a=e===null?null:e.memoizedState;if(e===null&&t.stateNode===null&&(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),r.mode===`hidden`){if(t.flags&128){if(a=a===null?n:a.baseLanes|n,e!==null){for(r=t.child=e.child,i=0;r!==null;)i=i|r.lanes|r.childLanes,r=r.sibling;r=i&~a}else r=0,t.child=null;return tc(e,t,a,n,r)}if(n&536870912)t.memoizedState={baseLanes:0,cachePool:null},e!==null&&pa(t,a===null?null:a.cachePool),a===null?Ja():qa(t,a),eo(t);else return r=t.lanes=536870912,tc(e,t,a===null?n:a.baseLanes|n,n,r)}else a===null?(e!==null&&pa(t,null),Ja(),to(t)):(pa(t,a.cachePool),qa(t,a),to(t),t.memoizedState=null);return Ys(e,t,i,n),t.child}function ec(e,t){return e!==null&&e.tag===22||t.stateNode!==null||(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),t.sibling}function tc(e,t,n,r,i){var a=fa();return a=a===null?null:{parent:ea._currentValue,pool:a},t.memoizedState={baseLanes:n,cachePool:a},e!==null&&pa(t,null),Ja(),eo(t),e!==null&&Gi(e,t,r,!0),t.childLanes=i,null}function nc(e,t){return t=hc({mode:t.mode,children:t.children},e.mode),t.ref=e.ref,e.child=t,t.return=e,t}function rc(e,t,n){return ja(t,e.child,null,n),e=nc(t,t.pendingProps),e.flags|=2,no(t),t.memoizedState=null,e}function ic(e,t,n){var r=t.pendingProps,a=!!(t.flags&128);if(t.flags&=-129,e===null){if(K){if(r.mode===`hidden`)return e=nc(t,r),t.lanes=536870912,ec(null,e);if($a(t),(e=Di)?(e=rf(e,ki),e=e!==null&&e.data===`&`?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:vi===null?null:{id:yi,overflow:bi},retryLane:536870912,hydrationErrors:null},n=ci(e),n.return=t,t.child=n,Ei=t,Di=null)):e=null,e===null)throw ji(t);return t.lanes=536870912,null}return nc(t,r)}var o=e.memoizedState;if(o!==null){var s=o.dehydrated;if($a(t),a){if(t.flags&256)t.flags&=-257,t=rc(e,t,n);else if(t.memoizedState!==null)t.child=e.child,t.flags|=128,t=null;else throw Error(i(558))}else if(Js||Gi(e,t,n,!1),a=(n&e.childLanes)!==0,Js||a){if(r=Nl,r!==null&&(s=Ye(r,n),s!==0&&s!==o.retryLane))throw o.retryLane=s,Xr(e,s),fu(r,e,s),qs;wu(),t=rc(e,t,n)}else e=o.treeContext,Di=cf(s.nextSibling),Ei=t,K=!0,Oi=null,ki=!1,e!==null&&Ti(t,e),t=nc(t,r),t.flags|=4096;return t}return e=ri(e.child,{mode:r.mode,children:r.children}),e.ref=t.ref,t.child=e,e.return=t,e}function ac(e,t){var n=t.ref;if(n===null)e!==null&&e.ref!==null&&(t.flags|=4194816);else{if(typeof n!=`function`&&typeof n!=`object`)throw Error(i(284));(e===null||e.ref!==n)&&(t.flags|=4194816)}}function oc(e,t,n,r,i){return qi(t),n=go(e,t,n,r,void 0,i),r=bo(),e!==null&&!Js?(xo(e,t,i),bc(e,t,i)):(K&&r&&Ci(t),t.flags|=1,Ys(e,t,n,i),t.child)}function sc(e,t,n,r,i,a){return qi(t),t.updateQueue=null,n=vo(t,r,n,i),_o(e),r=bo(),e!==null&&!Js?(xo(e,t,a),bc(e,t,a)):(K&&r&&Ci(t),t.flags|=1,Ys(e,t,n,a),t.child)}function cc(e,t,n,r,i){if(qi(t),t.stateNode===null){var a=$r,o=n.contextType;typeof o==`object`&&o&&(a=Ji(o)),a=new n(r,a),t.memoizedState=a.state!==null&&a.state!==void 0?a.state:null,a.updater=Ps,t.stateNode=a,a._reactInternals=t,a=t.stateNode,a.props=r,a.state=t.memoizedState,a.refs={},Pa(t),o=n.contextType,a.context=typeof o==`object`&&o?Ji(o):$r,a.state=t.memoizedState,o=n.getDerivedStateFromProps,typeof o==`function`&&(Ns(t,n,o,r),a.state=t.memoizedState),typeof n.getDerivedStateFromProps==`function`||typeof a.getSnapshotBeforeUpdate==`function`||typeof a.UNSAFE_componentWillMount!=`function`&&typeof a.componentWillMount!=`function`||(o=a.state,typeof a.componentWillMount==`function`&&a.componentWillMount(),typeof a.UNSAFE_componentWillMount==`function`&&a.UNSAFE_componentWillMount(),o!==a.state&&Ps.enqueueReplaceState(a,a.state,null),Ha(t,r,a,i),Va(),a.state=t.memoizedState),typeof a.componentDidMount==`function`&&(t.flags|=4194308),r=!0}else if(e===null){a=t.stateNode;var s=t.memoizedProps,c=Ls(n,s);a.props=c;var l=a.context,u=n.contextType;o=$r,typeof u==`object`&&u&&(o=Ji(u));var d=n.getDerivedStateFromProps;u=typeof d==`function`||typeof a.getSnapshotBeforeUpdate==`function`,s=t.pendingProps!==s,u||typeof a.UNSAFE_componentWillReceiveProps!=`function`&&typeof a.componentWillReceiveProps!=`function`||(s||l!==o)&&Is(t,a,r,o),Na=!1;var f=t.memoizedState;a.state=f,Ha(t,r,a,i),Va(),l=t.memoizedState,s||f!==l||Na?(typeof d==`function`&&(Ns(t,n,d,r),l=t.memoizedState),(c=Na||Fs(t,n,c,r,f,l,o))?(u||typeof a.UNSAFE_componentWillMount!=`function`&&typeof a.componentWillMount!=`function`||(typeof a.componentWillMount==`function`&&a.componentWillMount(),typeof a.UNSAFE_componentWillMount==`function`&&a.UNSAFE_componentWillMount()),typeof a.componentDidMount==`function`&&(t.flags|=4194308)):(typeof a.componentDidMount==`function`&&(t.flags|=4194308),t.memoizedProps=r,t.memoizedState=l),a.props=r,a.state=l,a.context=o,r=c):(typeof a.componentDidMount==`function`&&(t.flags|=4194308),r=!1)}else{a=t.stateNode,Fa(e,t),o=t.memoizedProps,u=Ls(n,o),a.props=u,d=t.pendingProps,f=a.context,l=n.contextType,c=$r,typeof l==`object`&&l&&(c=Ji(l)),s=n.getDerivedStateFromProps,(l=typeof s==`function`||typeof a.getSnapshotBeforeUpdate==`function`)||typeof a.UNSAFE_componentWillReceiveProps!=`function`&&typeof a.componentWillReceiveProps!=`function`||(o!==d||f!==c)&&Is(t,a,r,c),Na=!1,f=t.memoizedState,a.state=f,Ha(t,r,a,i),Va();var p=t.memoizedState;o!==d||f!==p||Na||e!==null&&e.dependencies!==null&&Ki(e.dependencies)?(typeof s==`function`&&(Ns(t,n,s,r),p=t.memoizedState),(u=Na||Fs(t,n,u,r,f,p,c)||e!==null&&e.dependencies!==null&&Ki(e.dependencies))?(l||typeof a.UNSAFE_componentWillUpdate!=`function`&&typeof a.componentWillUpdate!=`function`||(typeof a.componentWillUpdate==`function`&&a.componentWillUpdate(r,p,c),typeof a.UNSAFE_componentWillUpdate==`function`&&a.UNSAFE_componentWillUpdate(r,p,c)),typeof a.componentDidUpdate==`function`&&(t.flags|=4),typeof a.getSnapshotBeforeUpdate==`function`&&(t.flags|=1024)):(typeof a.componentDidUpdate!=`function`||o===e.memoizedProps&&f===e.memoizedState||(t.flags|=4),typeof a.getSnapshotBeforeUpdate!=`function`||o===e.memoizedProps&&f===e.memoizedState||(t.flags|=1024),t.memoizedProps=r,t.memoizedState=p),a.props=r,a.state=p,a.context=c,r=u):(typeof a.componentDidUpdate!=`function`||o===e.memoizedProps&&f===e.memoizedState||(t.flags|=4),typeof a.getSnapshotBeforeUpdate!=`function`||o===e.memoizedProps&&f===e.memoizedState||(t.flags|=1024),r=!1)}return a=r,ac(e,t),r=!!(t.flags&128),a||r?(a=t.stateNode,n=r&&typeof n.getDerivedStateFromError!=`function`?null:a.render(),t.flags|=1,e!==null&&r?(t.child=ja(t,e.child,null,i),t.child=ja(t,null,n,i)):Ys(e,t,n,i),t.memoizedState=a.state,e=t.child):e=bc(e,t,i),e}function lc(e,t,n,r){return Fi(),t.flags|=256,Ys(e,t,n,r),t.child}var uc={dehydrated:null,treeContext:null,retryLane:0,hydrationErrors:null};function dc(e){return{baseLanes:e,cachePool:ma()}}function fc(e,t,n){return e=e===null?0:e.childLanes&~n,t&&(e|=Kl),e}function pc(e,t,n){var r=t.pendingProps,a=!1,o=!!(t.flags&128),s;if((s=o)||(s=e!==null&&e.memoizedState===null?!1:!!(ro.current&2)),s&&(a=!0,t.flags&=-129),s=!!(t.flags&32),t.flags&=-33,e===null){if(K){if(a?Qa(t):to(t),(e=Di)?(e=rf(e,ki),e=e!==null&&e.data!==`&`?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:vi===null?null:{id:yi,overflow:bi},retryLane:536870912,hydrationErrors:null},n=ci(e),n.return=t,t.child=n,Ei=t,Di=null)):e=null,e===null)throw ji(t);return of(e)?t.lanes=32:t.lanes=536870912,null}var c=r.children;return r=r.fallback,a?(to(t),a=t.mode,c=hc({mode:`hidden`,children:c},a),r=oi(r,a,n,null),c.return=t,r.return=t,c.sibling=r,t.child=c,r=t.child,r.memoizedState=dc(n),r.childLanes=fc(e,s,n),t.memoizedState=uc,ec(null,r)):(Qa(t),mc(t,c))}var l=e.memoizedState;if(l!==null&&(c=l.dehydrated,c!==null)){if(o)t.flags&256?(Qa(t),t.flags&=-257,t=gc(e,t,n)):t.memoizedState===null?(to(t),c=r.fallback,a=t.mode,r=hc({mode:`visible`,children:r.children},a),c=oi(c,a,n,null),c.flags|=2,r.return=t,c.return=t,r.sibling=c,t.child=r,ja(t,e.child,null,n),r=t.child,r.memoizedState=dc(n),r.childLanes=fc(e,s,n),t.memoizedState=uc,t=ec(null,r)):(to(t),t.child=e.child,t.flags|=128,t=null);else if(Qa(t),of(c)){if(s=c.nextSibling&&c.nextSibling.dataset,s)var u=s.dgst;s=u,r=Error(i(419)),r.stack=``,r.digest=s,Li({value:r,source:null,stack:null}),t=gc(e,t,n)}else if(Js||Gi(e,t,n,!1),s=(n&e.childLanes)!==0,Js||s){if(s=Nl,s!==null&&(r=Ye(s,n),r!==0&&r!==l.retryLane))throw l.retryLane=r,Xr(e,r),fu(s,e,r),qs;af(c)||wu(),t=gc(e,t,n)}else af(c)?(t.flags|=192,t.child=e.child,t=null):(e=l.treeContext,Di=cf(c.nextSibling),Ei=t,K=!0,Oi=null,ki=!1,e!==null&&Ti(t,e),t=mc(t,r.children),t.flags|=4096);return t}return a?(to(t),c=r.fallback,a=t.mode,l=e.child,u=l.sibling,r=ri(l,{mode:`hidden`,children:r.children}),r.subtreeFlags=l.subtreeFlags&65011712,u===null?(c=oi(c,a,n,null),c.flags|=2):c=ri(u,c),c.return=t,r.return=t,r.sibling=c,t.child=r,ec(null,r),r=t.child,c=e.child.memoizedState,c===null?c=dc(n):(a=c.cachePool,a===null?a=ma():(l=ea._currentValue,a=a.parent===l?a:{parent:l,pool:l}),c={baseLanes:c.baseLanes|n,cachePool:a}),r.memoizedState=c,r.childLanes=fc(e,s,n),t.memoizedState=uc,ec(e.child,r)):(Qa(t),n=e.child,e=n.sibling,n=ri(n,{mode:`visible`,children:r.children}),n.return=t,n.sibling=null,e!==null&&(s=t.deletions,s===null?(t.deletions=[e],t.flags|=16):s.push(e)),t.child=n,t.memoizedState=null,n)}function mc(e,t){return t=hc({mode:`visible`,children:t},e.mode),t.return=e,e.child=t}function hc(e,t){return e=ti(22,e,null,t),e.lanes=0,e}function gc(e,t,n){return ja(t,e.child,null,n),e=mc(t,t.pendingProps.children),e.flags|=2,t.memoizedState=null,e}function _c(e,t,n){e.lanes|=t;var r=e.alternate;r!==null&&(r.lanes|=t),Ui(e.return,t,n)}function vc(e,t,n,r,i,a){var o=e.memoizedState;o===null?e.memoizedState={isBackwards:t,rendering:null,renderingStartTime:0,last:r,tail:n,tailMode:i,treeForkCount:a}:(o.isBackwards=t,o.rendering=null,o.renderingStartTime=0,o.last=r,o.tail=n,o.tailMode=i,o.treeForkCount=a)}function yc(e,t,n){var r=t.pendingProps,i=r.revealOrder,a=r.tail;r=r.children;var o=ro.current,s=!!(o&2);if(s?(o=o&1|2,t.flags|=128):o&=1,B(ro,o),Ys(e,t,r,n),r=K?hi:0,!s&&e!==null&&e.flags&128)a:for(e=t.child;e!==null;){if(e.tag===13)e.memoizedState!==null&&_c(e,n,t);else if(e.tag===19)_c(e,n,t);else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break a;for(;e.sibling===null;){if(e.return===null||e.return===t)break a;e=e.return}e.sibling.return=e.return,e=e.sibling}switch(i){case`forwards`:for(n=t.child,i=null;n!==null;)e=n.alternate,e!==null&&io(e)===null&&(i=n),n=n.sibling;n=i,n===null?(i=t.child,t.child=null):(i=n.sibling,n.sibling=null),vc(t,!1,i,n,a,r);break;case`backwards`:case`unstable_legacy-backwards`:for(n=null,i=t.child,t.child=null;i!==null;){if(e=i.alternate,e!==null&&io(e)===null){t.child=i;break}e=i.sibling,i.sibling=n,n=i,i=e}vc(t,!0,n,null,a,r);break;case`together`:vc(t,!1,null,null,void 0,r);break;default:t.memoizedState=null}return t.child}function bc(e,t,n){if(e!==null&&(t.dependencies=e.dependencies),Ul|=t.lanes,(n&t.childLanes)===0){if(e!==null){if(Gi(e,t,n,!1),(n&t.childLanes)===0)return null}else return null}if(e!==null&&t.child!==e.child)throw Error(i(153));if(t.child!==null){for(e=t.child,n=ri(e,e.pendingProps),t.child=n,n.return=t;e.sibling!==null;)e=e.sibling,n=n.sibling=ri(e,e.pendingProps),n.return=t;n.sibling=null}return t.child}function xc(e,t){return(e.lanes&t)!==0||(e=e.dependencies,!!(e!==null&&Ki(e)))}function Sc(e,t,n){switch(t.tag){case 3:oe(t,t.stateNode.containerInfo),Vi(t,ea,e.memoizedState.cache),Fi();break;case 27:case 5:ce(t);break;case 4:oe(t,t.stateNode.containerInfo);break;case 10:Vi(t,t.type,t.memoizedProps.value);break;case 31:if(t.memoizedState!==null)return t.flags|=128,$a(t),null;break;case 13:var r=t.memoizedState;if(r!==null)return r.dehydrated===null?(n&t.child.childLanes)===0?(Qa(t),e=bc(e,t,n),e===null?null:e.sibling):pc(e,t,n):(Qa(t),t.flags|=128,null);Qa(t);break;case 19:var i=!!(e.flags&128);if(r=(n&t.childLanes)!==0,r||(Gi(e,t,n,!1),r=(n&t.childLanes)!==0),i){if(r)return yc(e,t,n);t.flags|=128}if(i=t.memoizedState,i!==null&&(i.rendering=null,i.tail=null,i.lastEffect=null),B(ro,ro.current),r)break;return null;case 22:return t.lanes=0,$s(e,t,n,t.pendingProps);case 24:Vi(t,ea,e.memoizedState.cache)}return bc(e,t,n)}function Cc(e,t,n){if(e!==null){if(e.memoizedProps!==t.pendingProps)Js=!0;else{if(!xc(e,n)&&!(t.flags&128))return Js=!1,Sc(e,t,n);Js=!!(e.flags&131072)}}else Js=!1,K&&t.flags&1048576&&Si(t,hi,t.index);switch(t.lanes=0,t.tag){case 16:a:{var r=t.pendingProps;if(e=xa(t.elementType),t.type=e,typeof e==`function`)ni(e)?(r=Ls(e,r),t.tag=1,t=cc(null,t,e,r,n)):(t.tag=0,t=oc(null,t,e,r,n));else{if(e!=null){var a=e.$$typeof;if(a===w){t.tag=11,t=Xs(null,t,e,r,n);break a}if(a===D){t.tag=14,t=Zs(null,t,e,r,n);break a}}throw t=M(e)||e,Error(i(306,t,``))}}return t;case 0:return oc(e,t,t.type,t.pendingProps,n);case 1:return r=t.type,a=Ls(r,t.pendingProps),cc(e,t,r,a,n);case 3:a:{if(oe(t,t.stateNode.containerInfo),e===null)throw Error(i(387));r=t.pendingProps;var o=t.memoizedState;a=o.element,Fa(e,t),Ha(t,r,null,n);var s=t.memoizedState;if(r=s.cache,Vi(t,ea,r),r!==o.cache&&Wi(t,[ea],n,!0),Va(),r=s.element,o.isDehydrated){if(o={element:r,isDehydrated:!1,cache:s.cache},t.updateQueue.baseState=o,t.memoizedState=o,t.flags&256){t=lc(e,t,r,n);break a}if(r!==a){a=di(Error(i(424)),t),Li(a),t=lc(e,t,r,n);break a}switch(e=t.stateNode.containerInfo,e.nodeType){case 9:e=e.body;break;default:e=e.nodeName===`HTML`?e.ownerDocument.body:e}for(Di=cf(e.firstChild),Ei=t,K=!0,Oi=null,ki=!0,n=Ma(t,null,r,n),t.child=n;n;)n.flags=n.flags&-3|4096,n=n.sibling}else{if(Fi(),r===a){t=bc(e,t,n);break a}Ys(e,t,r,n)}t=t.child}return t;case 26:return ac(e,t),e===null?(n=kf(t.type,null,t.pendingProps,null))?t.memoizedState=n:K||(n=t.type,e=t.pendingProps,r=Bd(ae.current).createElement(n),r[tt]=t,r[nt]=e,Pd(r,n,e),mt(r),t.stateNode=r):t.memoizedState=kf(t.type,e.memoizedProps,t.pendingProps,e.memoizedState),null;case 27:return ce(t),e===null&&K&&(r=t.stateNode=ff(t.type,t.pendingProps,ae.current),Ei=t,ki=!0,a=Di,Zd(t.type)?(lf=a,Di=cf(r.firstChild)):Di=a),Ys(e,t,t.pendingProps.children,n),ac(e,t),e===null&&(t.flags|=4194304),t.child;case 5:return e===null&&K&&((a=r=Di)&&(r=tf(r,t.type,t.pendingProps,ki),r===null?a=!1:(t.stateNode=r,Ei=t,Di=cf(r.firstChild),ki=!1,a=!0)),a||ji(t)),ce(t),a=t.type,o=t.pendingProps,s=e===null?null:e.memoizedProps,r=o.children,Ud(a,o)?r=null:s!==null&&Ud(a,s)&&(t.flags|=32),t.memoizedState!==null&&(a=go(e,t,yo,null,null,n),Qf._currentValue=a),ac(e,t),Ys(e,t,r,n),t.child;case 6:return e===null&&K&&((e=n=Di)&&(n=nf(n,t.pendingProps,ki),n===null?e=!1:(t.stateNode=n,Ei=t,Di=null,e=!0)),e||ji(t)),null;case 13:return pc(e,t,n);case 4:return oe(t,t.stateNode.containerInfo),r=t.pendingProps,e===null?t.child=ja(t,null,r,n):Ys(e,t,r,n),t.child;case 11:return Xs(e,t,t.type,t.pendingProps,n);case 7:return Ys(e,t,t.pendingProps,n),t.child;case 8:return Ys(e,t,t.pendingProps.children,n),t.child;case 12:return Ys(e,t,t.pendingProps.children,n),t.child;case 10:return r=t.pendingProps,Vi(t,t.type,r.value),Ys(e,t,r.children,n),t.child;case 9:return a=t.type._context,r=t.pendingProps.children,qi(t),a=Ji(a),r=r(a),t.flags|=1,Ys(e,t,r,n),t.child;case 14:return Zs(e,t,t.type,t.pendingProps,n);case 15:return Qs(e,t,t.type,t.pendingProps,n);case 19:return yc(e,t,n);case 31:return ic(e,t,n);case 22:return $s(e,t,n,t.pendingProps);case 24:return qi(t),r=Ji(ea),e===null?(a=fa(),a===null&&(a=Nl,o=ta(),a.pooledCache=o,o.refCount++,o!==null&&(a.pooledCacheLanes|=n),a=o),t.memoizedState={parent:r,cache:a},Pa(t),Vi(t,ea,a)):((e.lanes&n)!==0&&(Fa(e,t),Ha(t,null,null,n),Va()),a=e.memoizedState,o=t.memoizedState,a.parent===r?(r=o.cache,Vi(t,ea,r),r!==a.cache&&Wi(t,[ea],n,!0)):(a={parent:r,cache:r},t.memoizedState=a,t.lanes===0&&(t.memoizedState=t.updateQueue.baseState=a),Vi(t,ea,r))),Ys(e,t,t.pendingProps.children,n),t.child;case 29:throw t.pendingProps}throw Error(i(156,t.tag))}function wc(e){e.flags|=4}function Tc(e,t,n,r,i){if((t=!!(e.mode&32))&&(t=!1),t){if(e.flags|=16777216,(i&335544128)===i){if(e.stateNode.complete)e.flags|=8192;else if(xu())e.flags|=8192;else throw Sa=va,ga}}else e.flags&=-16777217}function Ec(e,t){if(t.type!==`stylesheet`||t.state.loading&4)e.flags&=-16777217;else if(e.flags|=16777216,!Wf(t)){if(xu())e.flags|=8192;else throw Sa=va,ga}}function Dc(e,t){t!==null&&(e.flags|=4),e.flags&16384&&(t=e.tag===22?536870912:Ue(),e.lanes|=t,ql|=t)}function Oc(e,t){if(!K)switch(e.tailMode){case`hidden`:t=e.tail;for(var n=null;t!==null;)t.alternate!==null&&(n=t),t=t.sibling;n===null?e.tail=null:n.sibling=null;break;case`collapsed`:n=e.tail;for(var r=null;n!==null;)n.alternate!==null&&(r=n),n=n.sibling;r===null?t||e.tail===null?e.tail=null:e.tail.sibling=null:r.sibling=null}}function kc(e){var t=e.alternate!==null&&e.alternate.child===e.child,n=0,r=0;if(t)for(var i=e.child;i!==null;)n|=i.lanes|i.childLanes,r|=i.subtreeFlags&65011712,r|=i.flags&65011712,i.return=e,i=i.sibling;else for(i=e.child;i!==null;)n|=i.lanes|i.childLanes,r|=i.subtreeFlags,r|=i.flags,i.return=e,i=i.sibling;return e.subtreeFlags|=r,e.childLanes=n,t}function Ac(e,t,n){var r=t.pendingProps;switch(wi(t),t.tag){case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return kc(t),null;case 1:return kc(t),null;case 3:return n=t.stateNode,r=null,e!==null&&(r=e.memoizedState.cache),t.memoizedState.cache!==r&&(t.flags|=2048),Hi(ea),se(),n.pendingContext&&(n.context=n.pendingContext,n.pendingContext=null),(e===null||e.child===null)&&(Pi(t)?wc(t):e===null||e.memoizedState.isDehydrated&&!(t.flags&256)||(t.flags|=1024,Ii())),kc(t),null;case 26:var a=t.type,o=t.memoizedState;return e===null?(wc(t),o===null?(kc(t),Tc(t,a,null,r,n)):(kc(t),Ec(t,o))):o?o===e.memoizedState?(kc(t),t.flags&=-16777217):(wc(t),kc(t),Ec(t,o)):(e=e.memoizedProps,e!==r&&wc(t),kc(t),Tc(t,a,e,r,n)),null;case 27:if(le(t),n=ae.current,a=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==r&&wc(t);else{if(!r){if(t.stateNode===null)throw Error(i(166));return kc(t),null}e=re.current,Pi(t)?Mi(t,e):(e=ff(a,r,n),t.stateNode=e,wc(t))}return kc(t),null;case 5:if(le(t),a=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==r&&wc(t);else{if(!r){if(t.stateNode===null)throw Error(i(166));return kc(t),null}if(o=re.current,Pi(t))Mi(t,o);else{var s=Bd(ae.current);switch(o){case 1:o=s.createElementNS(`http://www.w3.org/2000/svg`,a);break;case 2:o=s.createElementNS(`http://www.w3.org/1998/Math/MathML`,a);break;default:switch(a){case`svg`:o=s.createElementNS(`http://www.w3.org/2000/svg`,a);break;case`math`:o=s.createElementNS(`http://www.w3.org/1998/Math/MathML`,a);break;case`script`:o=s.createElement(`div`),o.innerHTML=`<script><\/script>`,o=o.removeChild(o.firstChild);break;case`select`:o=typeof r.is==`string`?s.createElement(`select`,{is:r.is}):s.createElement(`select`),r.multiple?o.multiple=!0:r.size&&(o.size=r.size);break;default:o=typeof r.is==`string`?s.createElement(a,{is:r.is}):s.createElement(a)}}o[tt]=t,o[nt]=r;a:for(s=t.child;s!==null;){if(s.tag===5||s.tag===6)o.appendChild(s.stateNode);else if(s.tag!==4&&s.tag!==27&&s.child!==null){s.child.return=s,s=s.child;continue}if(s===t)break a;for(;s.sibling===null;){if(s.return===null||s.return===t)break a;s=s.return}s.sibling.return=s.return,s=s.sibling}t.stateNode=o;a:switch(Pd(o,a,r),a){case`button`:case`input`:case`select`:case`textarea`:r=!!r.autoFocus;break a;case`img`:r=!0;break a;default:r=!1}r&&wc(t)}}return kc(t),Tc(t,t.type,e===null?null:e.memoizedProps,t.pendingProps,n),null;case 6:if(e&&t.stateNode!=null)e.memoizedProps!==r&&wc(t);else{if(typeof r!=`string`&&t.stateNode===null)throw Error(i(166));if(e=ae.current,Pi(t)){if(e=t.stateNode,n=t.memoizedProps,r=null,a=Ei,a!==null)switch(a.tag){case 27:case 5:r=a.memoizedProps}e[tt]=t,e=!!(e.nodeValue===n||r!==null&&!0===r.suppressHydrationWarning||jd(e.nodeValue,n)),e||ji(t,!0)}else e=Bd(e).createTextNode(r),e[tt]=t,t.stateNode=e}return kc(t),null;case 31:if(n=t.memoizedState,e===null||e.memoizedState!==null){if(r=Pi(t),n!==null){if(e===null){if(!r)throw Error(i(318));if(e=t.memoizedState,e=e===null?null:e.dehydrated,!e)throw Error(i(557));e[tt]=t}else Fi(),!(t.flags&128)&&(t.memoizedState=null),t.flags|=4;kc(t),e=!1}else n=Ii(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=n),e=!0;if(!e)return t.flags&256?(no(t),t):(no(t),null);if(t.flags&128)throw Error(i(558))}return kc(t),null;case 13:if(r=t.memoizedState,e===null||e.memoizedState!==null&&e.memoizedState.dehydrated!==null){if(a=Pi(t),r!==null&&r.dehydrated!==null){if(e===null){if(!a)throw Error(i(318));if(a=t.memoizedState,a=a===null?null:a.dehydrated,!a)throw Error(i(317));a[tt]=t}else Fi(),!(t.flags&128)&&(t.memoizedState=null),t.flags|=4;kc(t),a=!1}else a=Ii(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=a),a=!0;if(!a)return t.flags&256?(no(t),t):(no(t),null)}return no(t),t.flags&128?(t.lanes=n,t):(n=r!==null,e=e!==null&&e.memoizedState!==null,n&&(r=t.child,a=null,r.alternate!==null&&r.alternate.memoizedState!==null&&r.alternate.memoizedState.cachePool!==null&&(a=r.alternate.memoizedState.cachePool.pool),o=null,r.memoizedState!==null&&r.memoizedState.cachePool!==null&&(o=r.memoizedState.cachePool.pool),o!==a&&(r.flags|=2048)),n!==e&&n&&(t.child.flags|=8192),Dc(t,t.updateQueue),kc(t),null);case 4:return se(),e===null&&xd(t.stateNode.containerInfo),kc(t),null;case 10:return Hi(t.type),kc(t),null;case 19:if(z(ro),r=t.memoizedState,r===null)return kc(t),null;if(a=!!(t.flags&128),o=r.rendering,o===null){if(a)Oc(r,!1);else{if(Hl!==0||e!==null&&e.flags&128)for(e=t.child;e!==null;){if(o=io(e),o!==null){for(t.flags|=128,Oc(r,!1),e=o.updateQueue,t.updateQueue=e,Dc(t,e),t.subtreeFlags=0,e=n,n=t.child;n!==null;)ii(n,e),n=n.sibling;return B(ro,ro.current&1|2),K&&xi(t,r.treeForkCount),t.child}e=e.sibling}r.tail!==null&&be()>Ql&&(t.flags|=128,a=!0,Oc(r,!1),t.lanes=4194304)}}else{if(!a){if(e=io(o),e!==null){if(t.flags|=128,a=!0,e=e.updateQueue,t.updateQueue=e,Dc(t,e),Oc(r,!0),r.tail===null&&r.tailMode===`hidden`&&!o.alternate&&!K)return kc(t),null}else 2*be()-r.renderingStartTime>Ql&&n!==536870912&&(t.flags|=128,a=!0,Oc(r,!1),t.lanes=4194304)}r.isBackwards?(o.sibling=t.child,t.child=o):(e=r.last,e===null?t.child=o:e.sibling=o,r.last=o)}return r.tail===null?(kc(t),null):(e=r.tail,r.rendering=e,r.tail=e.sibling,r.renderingStartTime=be(),e.sibling=null,n=ro.current,B(ro,a?n&1|2:n&1),K&&xi(t,r.treeForkCount),e);case 22:case 23:return no(t),Ya(),r=t.memoizedState!==null,e===null?r&&(t.flags|=8192):e.memoizedState!==null!==r&&(t.flags|=8192),r?n&536870912&&!(t.flags&128)&&(kc(t),t.subtreeFlags&6&&(t.flags|=8192)):kc(t),n=t.updateQueue,n!==null&&Dc(t,n.retryQueue),n=null,e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(n=e.memoizedState.cachePool.pool),r=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(r=t.memoizedState.cachePool.pool),r!==n&&(t.flags|=2048),e!==null&&z(da),null;case 24:return n=null,e!==null&&(n=e.memoizedState.cache),t.memoizedState.cache!==n&&(t.flags|=2048),Hi(ea),kc(t),null;case 25:return null;case 30:return null}throw Error(i(156,t.tag))}function jc(e,t){switch(wi(t),t.tag){case 1:return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 3:return Hi(ea),se(),e=t.flags,e&65536&&!(e&128)?(t.flags=e&-65537|128,t):null;case 26:case 27:case 5:return le(t),null;case 31:if(t.memoizedState!==null){if(no(t),t.alternate===null)throw Error(i(340));Fi()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 13:if(no(t),e=t.memoizedState,e!==null&&e.dehydrated!==null){if(t.alternate===null)throw Error(i(340));Fi()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 19:return z(ro),null;case 4:return se(),null;case 10:return Hi(t.type),null;case 22:case 23:return no(t),Ya(),e!==null&&z(da),e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 24:return Hi(ea),null;case 25:return null;default:return null}}function Mc(e,t){switch(wi(t),t.tag){case 3:Hi(ea),se();break;case 26:case 27:case 5:le(t);break;case 4:se();break;case 31:t.memoizedState!==null&&no(t);break;case 13:no(t);break;case 19:z(ro);break;case 10:Hi(t.type);break;case 22:case 23:no(t),Ya(),e!==null&&z(da);break;case 24:Hi(ea)}}function Nc(e,t){try{var n=t.updateQueue,r=n===null?null:n.lastEffect;if(r!==null){var i=r.next;n=i;do{if((n.tag&e)===e){r=void 0;var a=n.create,o=n.inst;r=a(),o.destroy=r}n=n.next}while(n!==i)}}catch(e){Hu(t,t.return,e)}}function Pc(e,t,n){try{var r=t.updateQueue,i=r===null?null:r.lastEffect;if(i!==null){var a=i.next;r=a;do{if((r.tag&e)===e){var o=r.inst,s=o.destroy;if(s!==void 0){o.destroy=void 0,i=t;var c=n,l=s;try{l()}catch(e){Hu(i,c,e)}}}r=r.next}while(r!==a)}}catch(e){Hu(t,t.return,e)}}function Fc(e){var t=e.updateQueue;if(t!==null){var n=e.stateNode;try{Wa(t,n)}catch(t){Hu(e,e.return,t)}}}function Ic(e,t,n){n.props=Ls(e.type,e.memoizedProps),n.state=e.memoizedState;try{n.componentWillUnmount()}catch(n){Hu(e,t,n)}}function Lc(e,t){try{var n=e.ref;if(n!==null){switch(e.tag){case 26:case 27:case 5:var r=e.stateNode;break;case 30:r=e.stateNode;break;default:r=e.stateNode}typeof n==`function`?e.refCleanup=n(r):n.current=r}}catch(n){Hu(e,t,n)}}function Rc(e,t){var n=e.ref,r=e.refCleanup;if(n!==null){if(typeof r==`function`)try{r()}catch(n){Hu(e,t,n)}finally{e.refCleanup=null,e=e.alternate,e!=null&&(e.refCleanup=null)}else if(typeof n==`function`)try{n(null)}catch(n){Hu(e,t,n)}else n.current=null}}function zc(e){var t=e.type,n=e.memoizedProps,r=e.stateNode;try{a:switch(t){case`button`:case`input`:case`select`:case`textarea`:n.autoFocus&&r.focus();break a;case`img`:n.src?r.src=n.src:n.srcSet&&(r.srcset=n.srcSet)}}catch(t){Hu(e,e.return,t)}}function Bc(e,t,n){try{var r=e.stateNode;Fd(r,e.type,n,t),r[nt]=t}catch(t){Hu(e,e.return,t)}}function Vc(e){return e.tag===5||e.tag===3||e.tag===26||e.tag===27&&Zd(e.type)||e.tag===4}function Hc(e){a:for(;;){for(;e.sibling===null;){if(e.return===null||Vc(e.return))return null;e=e.return}for(e.sibling.return=e.return,e=e.sibling;e.tag!==5&&e.tag!==6&&e.tag!==18;){if(e.tag===27&&Zd(e.type)||e.flags&2||e.child===null||e.tag===4)continue a;e.child.return=e,e=e.child}if(!(e.flags&2))return e.stateNode}}function Uc(e,t,n){var r=e.tag;if(r===5||r===6)e=e.stateNode,t?(n.nodeType===9?n.body:n.nodeName===`HTML`?n.ownerDocument.body:n).insertBefore(e,t):(t=n.nodeType===9?n.body:n.nodeName===`HTML`?n.ownerDocument.body:n,t.appendChild(e),n=n._reactRootContainer,n!=null||t.onclick!==null||(t.onclick=qt));else if(r!==4&&(r===27&&Zd(e.type)&&(n=e.stateNode,t=null),e=e.child,e!==null))for(Uc(e,t,n),e=e.sibling;e!==null;)Uc(e,t,n),e=e.sibling}function Wc(e,t,n){var r=e.tag;if(r===5||r===6)e=e.stateNode,t?n.insertBefore(e,t):n.appendChild(e);else if(r!==4&&(r===27&&Zd(e.type)&&(n=e.stateNode),e=e.child,e!==null))for(Wc(e,t,n),e=e.sibling;e!==null;)Wc(e,t,n),e=e.sibling}function Gc(e){var t=e.stateNode,n=e.memoizedProps;try{for(var r=e.type,i=t.attributes;i.length;)t.removeAttributeNode(i[0]);Pd(t,r,n),t[tt]=e,t[nt]=n}catch(t){Hu(e,e.return,t)}}var Kc=!1,qc=!1,Jc=!1,Yc=typeof WeakSet==`function`?WeakSet:Set,Xc=null;function Zc(e,t){if(e=e.containerInfo,Rd=sp,e=br(e),xr(e)){if(`selectionStart`in e)var n={start:e.selectionStart,end:e.selectionEnd};else a:{n=(n=e.ownerDocument)&&n.defaultView||window;var r=n.getSelection&&n.getSelection();if(r&&r.rangeCount!==0){n=r.anchorNode;var a=r.anchorOffset,o=r.focusNode;r=r.focusOffset;try{n.nodeType,o.nodeType}catch{n=null;break a}var s=0,c=-1,l=-1,u=0,d=0,f=e,p=null;b:for(;;){for(var m;f!==n||a!==0&&f.nodeType!==3||(c=s+a),f!==o||r!==0&&f.nodeType!==3||(l=s+r),f.nodeType===3&&(s+=f.nodeValue.length),(m=f.firstChild)!==null;)p=f,f=m;for(;;){if(f===e)break b;if(p===n&&++u===a&&(c=s),p===o&&++d===r&&(l=s),(m=f.nextSibling)!==null)break;f=p,p=f.parentNode}f=m}n=c===-1||l===-1?null:{start:c,end:l}}else n=null}n=n||{start:0,end:0}}else n=null;for(zd={focusedElem:e,selectionRange:n},sp=!1,Xc=t;Xc!==null;)if(t=Xc,e=t.child,t.subtreeFlags&1028&&e!==null)e.return=t,Xc=e;else for(;Xc!==null;){switch(t=Xc,o=t.alternate,e=t.flags,t.tag){case 0:if(e&4&&(e=t.updateQueue,e=e===null?null:e.events,e!==null))for(n=0;n<e.length;n++)a=e[n],a.ref.impl=a.nextImpl;break;case 11:case 15:break;case 1:if(e&1024&&o!==null){e=void 0,n=t,a=o.memoizedProps,o=o.memoizedState,r=n.stateNode;try{var h=Ls(n.type,a);e=r.getSnapshotBeforeUpdate(h,o),r.__reactInternalSnapshotBeforeUpdate=e}catch(e){Hu(n,n.return,e)}}break;case 3:if(e&1024){if(e=t.stateNode.containerInfo,n=e.nodeType,n===9)ef(e);else if(n===1)switch(e.nodeName){case`HEAD`:case`HTML`:case`BODY`:ef(e);break;default:e.textContent=``}}break;case 5:case 26:case 27:case 6:case 4:case 17:break;default:if(e&1024)throw Error(i(163))}if(e=t.sibling,e!==null){e.return=t.return,Xc=e;break}Xc=t.return}}function Qc(e,t,n){var r=n.flags;switch(n.tag){case 0:case 11:case 15:pl(e,n),r&4&&Nc(5,n);break;case 1:if(pl(e,n),r&4){if(e=n.stateNode,t===null)try{e.componentDidMount()}catch(e){Hu(n,n.return,e)}else{var i=Ls(n.type,t.memoizedProps);t=t.memoizedState;try{e.componentDidUpdate(i,t,e.__reactInternalSnapshotBeforeUpdate)}catch(e){Hu(n,n.return,e)}}}r&64&&Fc(n),r&512&&Lc(n,n.return);break;case 3:if(pl(e,n),r&64&&(e=n.updateQueue,e!==null)){if(t=null,n.child!==null)switch(n.child.tag){case 27:case 5:t=n.child.stateNode;break;case 1:t=n.child.stateNode}try{Wa(e,t)}catch(e){Hu(n,n.return,e)}}break;case 27:t===null&&r&4&&Gc(n);case 26:case 5:pl(e,n),t===null&&r&4&&zc(n),r&512&&Lc(n,n.return);break;case 12:pl(e,n);break;case 31:pl(e,n),r&4&&il(e,n);break;case 13:pl(e,n),r&4&&al(e,n),r&64&&(e=n.memoizedState,e!==null&&(e=e.dehydrated,e!==null&&(n=Ku.bind(null,n),sf(e,n))));break;case 22:if(r=n.memoizedState!==null||Kc,!r){t=t!==null&&t.memoizedState!==null||qc,i=Kc;var a=qc;Kc=r,(qc=t)&&!a?hl(e,n,!!(n.subtreeFlags&8772)):pl(e,n),Kc=i,qc=a}break;case 30:break;default:pl(e,n)}}function $c(e){var t=e.alternate;t!==null&&(e.alternate=null,$c(t)),e.child=null,e.deletions=null,e.sibling=null,e.tag===5&&(t=e.stateNode,t!==null&&lt(t)),e.stateNode=null,e.return=null,e.dependencies=null,e.memoizedProps=null,e.memoizedState=null,e.pendingProps=null,e.stateNode=null,e.updateQueue=null}var el=null,tl=!1;function nl(e,t,n){for(n=n.child;n!==null;)rl(e,t,n),n=n.sibling}function rl(e,t,n){if(Ae&&typeof Ae.onCommitFiberUnmount==`function`)try{Ae.onCommitFiberUnmount(ke,n)}catch{}switch(n.tag){case 26:qc||Rc(n,t),nl(e,t,n),n.memoizedState?n.memoizedState.count--:n.stateNode&&(n=n.stateNode,n.parentNode.removeChild(n));break;case 27:qc||Rc(n,t);var r=el,i=tl;Zd(n.type)&&(el=n.stateNode,tl=!1),nl(e,t,n),pf(n.stateNode),el=r,tl=i;break;case 5:qc||Rc(n,t);case 6:if(r=el,i=tl,el=null,nl(e,t,n),el=r,tl=i,el!==null){if(tl)try{(el.nodeType===9?el.body:el.nodeName===`HTML`?el.ownerDocument.body:el).removeChild(n.stateNode)}catch(e){Hu(n,t,e)}else try{el.removeChild(n.stateNode)}catch(e){Hu(n,t,e)}}break;case 18:el!==null&&(tl?(e=el,Qd(e.nodeType===9?e.body:e.nodeName===`HTML`?e.ownerDocument.body:e,n.stateNode),Np(e)):Qd(el,n.stateNode));break;case 4:r=el,i=tl,el=n.stateNode.containerInfo,tl=!0,nl(e,t,n),el=r,tl=i;break;case 0:case 11:case 14:case 15:Pc(2,n,t),qc||Pc(4,n,t),nl(e,t,n);break;case 1:qc||(Rc(n,t),r=n.stateNode,typeof r.componentWillUnmount==`function`&&Ic(n,t,r)),nl(e,t,n);break;case 21:nl(e,t,n);break;case 22:qc=(r=qc)||n.memoizedState!==null,nl(e,t,n),qc=r;break;default:nl(e,t,n)}}function il(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null))){e=e.dehydrated;try{Np(e)}catch(e){Hu(t,t.return,e)}}}function al(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null&&(e=e.dehydrated,e!==null))))try{Np(e)}catch(e){Hu(t,t.return,e)}}function ol(e){switch(e.tag){case 31:case 13:case 19:var t=e.stateNode;return t===null&&(t=e.stateNode=new Yc),t;case 22:return e=e.stateNode,t=e._retryCache,t===null&&(t=e._retryCache=new Yc),t;default:throw Error(i(435,e.tag))}}function sl(e,t){var n=ol(e);t.forEach(function(t){if(!n.has(t)){n.add(t);var r=qu.bind(null,e,t);t.then(r,r)}})}function cl(e,t){var n=t.deletions;if(n!==null)for(var r=0;r<n.length;r++){var a=n[r],o=e,s=t,c=s;a:for(;c!==null;){switch(c.tag){case 27:if(Zd(c.type)){el=c.stateNode,tl=!1;break a}break;case 5:el=c.stateNode,tl=!1;break a;case 3:case 4:el=c.stateNode.containerInfo,tl=!0;break a}c=c.return}if(el===null)throw Error(i(160));rl(o,s,a),el=null,tl=!1,o=a.alternate,o!==null&&(o.return=null),a.return=null}if(t.subtreeFlags&13886)for(t=t.child;t!==null;)ul(t,e),t=t.sibling}var ll=null;function ul(e,t){var n=e.alternate,r=e.flags;switch(e.tag){case 0:case 11:case 14:case 15:cl(t,e),dl(e),r&4&&(Pc(3,e,e.return),Nc(3,e),Pc(5,e,e.return));break;case 1:cl(t,e),dl(e),r&512&&(qc||n===null||Rc(n,n.return)),r&64&&Kc&&(e=e.updateQueue,e!==null&&(r=e.callbacks,r!==null&&(n=e.shared.hiddenCallbacks,e.shared.hiddenCallbacks=n===null?r:n.concat(r))));break;case 26:var a=ll;if(cl(t,e),dl(e),r&512&&(qc||n===null||Rc(n,n.return)),r&4){var o=n===null?null:n.memoizedState;if(r=e.memoizedState,n===null){if(r===null){if(e.stateNode===null){a:{r=e.type,n=e.memoizedProps,a=a.ownerDocument||a;b:switch(r){case`title`:o=a.getElementsByTagName(`title`)[0],(!o||o[ct]||o[tt]||o.namespaceURI===`http://www.w3.org/2000/svg`||o.hasAttribute(`itemprop`))&&(o=a.createElement(r),a.head.insertBefore(o,a.querySelector(`head > title`))),Pd(o,r,n),o[tt]=e,mt(o),r=o;break a;case`link`:var s=Vf(`link`,`href`,a).get(r+(n.href||``));if(s){for(var c=0;c<s.length;c++)if(o=s[c],o.getAttribute(`href`)===(n.href==null||n.href===``?null:n.href)&&o.getAttribute(`rel`)===(n.rel==null?null:n.rel)&&o.getAttribute(`title`)===(n.title==null?null:n.title)&&o.getAttribute(`crossorigin`)===(n.crossOrigin==null?null:n.crossOrigin)){s.splice(c,1);break b}}o=a.createElement(r),Pd(o,r,n),a.head.appendChild(o);break;case`meta`:if(s=Vf(`meta`,`content`,a).get(r+(n.content||``))){for(c=0;c<s.length;c++)if(o=s[c],o.getAttribute(`content`)===(n.content==null?null:``+n.content)&&o.getAttribute(`name`)===(n.name==null?null:n.name)&&o.getAttribute(`property`)===(n.property==null?null:n.property)&&o.getAttribute(`http-equiv`)===(n.httpEquiv==null?null:n.httpEquiv)&&o.getAttribute(`charset`)===(n.charSet==null?null:n.charSet)){s.splice(c,1);break b}}o=a.createElement(r),Pd(o,r,n),a.head.appendChild(o);break;default:throw Error(i(468,r))}o[tt]=e,mt(o),r=o}e.stateNode=r}else Hf(a,e.type,e.stateNode)}else e.stateNode=If(a,r,e.memoizedProps)}else o===r?r===null&&e.stateNode!==null&&Bc(e,e.memoizedProps,n.memoizedProps):(o===null?n.stateNode!==null&&(n=n.stateNode,n.parentNode.removeChild(n)):o.count--,r===null?Hf(a,e.type,e.stateNode):If(a,r,e.memoizedProps))}break;case 27:cl(t,e),dl(e),r&512&&(qc||n===null||Rc(n,n.return)),n!==null&&r&4&&Bc(e,e.memoizedProps,n.memoizedProps);break;case 5:if(cl(t,e),dl(e),r&512&&(qc||n===null||Rc(n,n.return)),e.flags&32){a=e.stateNode;try{zt(a,``)}catch(t){Hu(e,e.return,t)}}r&4&&e.stateNode!=null&&(a=e.memoizedProps,Bc(e,a,n===null?a:n.memoizedProps)),r&1024&&(Jc=!0);break;case 6:if(cl(t,e),dl(e),r&4){if(e.stateNode===null)throw Error(i(162));r=e.memoizedProps,n=e.stateNode;try{n.nodeValue=r}catch(t){Hu(e,e.return,t)}}break;case 3:if(Bf=null,a=ll,ll=gf(t.containerInfo),cl(t,e),ll=a,dl(e),r&4&&n!==null&&n.memoizedState.isDehydrated)try{Np(t.containerInfo)}catch(t){Hu(e,e.return,t)}Jc&&(Jc=!1,fl(e));break;case 4:r=ll,ll=gf(e.stateNode.containerInfo),cl(t,e),dl(e),ll=r;break;case 12:cl(t,e),dl(e);break;case 31:cl(t,e),dl(e),r&4&&(r=e.updateQueue,r!==null&&(e.updateQueue=null,sl(e,r)));break;case 13:cl(t,e),dl(e),e.child.flags&8192&&e.memoizedState!==null!=(n!==null&&n.memoizedState!==null)&&($=be()),r&4&&(r=e.updateQueue,r!==null&&(e.updateQueue=null,sl(e,r)));break;case 22:a=e.memoizedState!==null;var l=n!==null&&n.memoizedState!==null,u=Kc,d=qc;if(Kc=u||a,qc=d||l,cl(t,e),qc=d,Kc=u,dl(e),r&8192)a:for(t=e.stateNode,t._visibility=a?t._visibility&-2:t._visibility|1,a&&(n===null||l||Kc||qc||ml(e)),n=null,t=e;;){if(t.tag===5||t.tag===26){if(n===null){l=n=t;try{if(o=l.stateNode,a)s=o.style,typeof s.setProperty==`function`?s.setProperty(`display`,`none`,`important`):s.display=`none`;else{c=l.stateNode;var f=l.memoizedProps.style,p=f!=null&&f.hasOwnProperty(`display`)?f.display:null;c.style.display=p==null||typeof p==`boolean`?``:(``+p).trim()}}catch(e){Hu(l,l.return,e)}}}else if(t.tag===6){if(n===null){l=t;try{l.stateNode.nodeValue=a?``:l.memoizedProps}catch(e){Hu(l,l.return,e)}}}else if(t.tag===18){if(n===null){l=t;try{var m=l.stateNode;a?$d(m,!0):$d(l.stateNode,!1)}catch(e){Hu(l,l.return,e)}}}else if((t.tag!==22&&t.tag!==23||t.memoizedState===null||t===e)&&t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break a;for(;t.sibling===null;){if(t.return===null||t.return===e)break a;n===t&&(n=null),t=t.return}n===t&&(n=null),t.sibling.return=t.return,t=t.sibling}r&4&&(r=e.updateQueue,r!==null&&(n=r.retryQueue,n!==null&&(r.retryQueue=null,sl(e,n))));break;case 19:cl(t,e),dl(e),r&4&&(r=e.updateQueue,r!==null&&(e.updateQueue=null,sl(e,r)));break;case 30:break;case 21:break;default:cl(t,e),dl(e)}}function dl(e){var t=e.flags;if(t&2){try{for(var n,r=e.return;r!==null;){if(Vc(r)){n=r;break}r=r.return}if(n==null)throw Error(i(160));switch(n.tag){case 27:var a=n.stateNode;Wc(e,Hc(e),a);break;case 5:var o=n.stateNode;n.flags&32&&(zt(o,``),n.flags&=-33),Wc(e,Hc(e),o);break;case 3:case 4:var s=n.stateNode.containerInfo;Uc(e,Hc(e),s);break;default:throw Error(i(161))}}catch(t){Hu(e,e.return,t)}e.flags&=-3}t&4096&&(e.flags&=-4097)}function fl(e){if(e.subtreeFlags&1024)for(e=e.child;e!==null;){var t=e;fl(t),t.tag===5&&t.flags&1024&&t.stateNode.reset(),e=e.sibling}}function pl(e,t){if(t.subtreeFlags&8772)for(t=t.child;t!==null;)Qc(e,t.alternate,t),t=t.sibling}function ml(e){for(e=e.child;e!==null;){var t=e;switch(t.tag){case 0:case 11:case 14:case 15:Pc(4,t,t.return),ml(t);break;case 1:Rc(t,t.return);var n=t.stateNode;typeof n.componentWillUnmount==`function`&&Ic(t,t.return,n),ml(t);break;case 27:pf(t.stateNode);case 26:case 5:Rc(t,t.return),ml(t);break;case 22:t.memoizedState===null&&ml(t);break;case 30:ml(t);break;default:ml(t)}e=e.sibling}}function hl(e,t,n){for(n=n&&!!(t.subtreeFlags&8772),t=t.child;t!==null;){var r=t.alternate,i=e,a=t,o=a.flags;switch(a.tag){case 0:case 11:case 15:hl(i,a,n),Nc(4,a);break;case 1:if(hl(i,a,n),r=a,i=r.stateNode,typeof i.componentDidMount==`function`)try{i.componentDidMount()}catch(e){Hu(r,r.return,e)}if(r=a,i=r.updateQueue,i!==null){var s=r.stateNode;try{var c=i.shared.hiddenCallbacks;if(c!==null)for(i.shared.hiddenCallbacks=null,i=0;i<c.length;i++)Ua(c[i],s)}catch(e){Hu(r,r.return,e)}}n&&o&64&&Fc(a),Lc(a,a.return);break;case 27:Gc(a);case 26:case 5:hl(i,a,n),n&&r===null&&o&4&&zc(a),Lc(a,a.return);break;case 12:hl(i,a,n);break;case 31:hl(i,a,n),n&&o&4&&il(i,a);break;case 13:hl(i,a,n),n&&o&4&&al(i,a);break;case 22:a.memoizedState===null&&hl(i,a,n),Lc(a,a.return);break;case 30:break;default:hl(i,a,n)}t=t.sibling}}function gl(e,t){var n=null;e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(n=e.memoizedState.cachePool.pool),e=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(e=t.memoizedState.cachePool.pool),e!==n&&(e!=null&&e.refCount++,n!=null&&na(n))}function _l(e,t){e=null,t.alternate!==null&&(e=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==e&&(t.refCount++,e!=null&&na(e))}function vl(e,t,n,r){if(t.subtreeFlags&10256)for(t=t.child;t!==null;)yl(e,t,n,r),t=t.sibling}function yl(e,t,n,r){var i=t.flags;switch(t.tag){case 0:case 11:case 15:vl(e,t,n,r),i&2048&&Nc(9,t);break;case 1:vl(e,t,n,r);break;case 3:vl(e,t,n,r),i&2048&&(e=null,t.alternate!==null&&(e=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==e&&(t.refCount++,e!=null&&na(e)));break;case 12:if(i&2048){vl(e,t,n,r),e=t.stateNode;try{var a=t.memoizedProps,o=a.id,s=a.onPostCommit;typeof s==`function`&&s(o,t.alternate===null?`mount`:`update`,e.passiveEffectDuration,-0)}catch(e){Hu(t,t.return,e)}}else vl(e,t,n,r);break;case 31:vl(e,t,n,r);break;case 13:vl(e,t,n,r);break;case 23:break;case 22:a=t.stateNode,o=t.alternate,t.memoizedState===null?a._visibility&2?vl(e,t,n,r):(a._visibility|=2,bl(e,t,n,r,!!(t.subtreeFlags&10256)||!1)):a._visibility&2?vl(e,t,n,r):xl(e,t),i&2048&&gl(o,t);break;case 24:vl(e,t,n,r),i&2048&&_l(t.alternate,t);break;default:vl(e,t,n,r)}}function bl(e,t,n,r,i){for(i=i&&(!!(t.subtreeFlags&10256)||!1),t=t.child;t!==null;){var a=e,o=t,s=n,c=r,l=o.flags;switch(o.tag){case 0:case 11:case 15:bl(a,o,s,c,i),Nc(8,o);break;case 23:break;case 22:var u=o.stateNode;o.memoizedState===null?(u._visibility|=2,bl(a,o,s,c,i)):u._visibility&2?bl(a,o,s,c,i):xl(a,o),i&&l&2048&&gl(o.alternate,o);break;case 24:bl(a,o,s,c,i),i&&l&2048&&_l(o.alternate,o);break;default:bl(a,o,s,c,i)}t=t.sibling}}function xl(e,t){if(t.subtreeFlags&10256)for(t=t.child;t!==null;){var n=e,r=t,i=r.flags;switch(r.tag){case 22:xl(n,r),i&2048&&gl(r.alternate,r);break;case 24:xl(n,r),i&2048&&_l(r.alternate,r);break;default:xl(n,r)}t=t.sibling}}var Sl=8192;function Cl(e,t,n){if(e.subtreeFlags&Sl)for(e=e.child;e!==null;)wl(e,t,n),e=e.sibling}function wl(e,t,n){switch(e.tag){case 26:Cl(e,t,n),e.flags&Sl&&e.memoizedState!==null&&Gf(n,ll,e.memoizedState,e.memoizedProps);break;case 5:Cl(e,t,n);break;case 3:case 4:var r=ll;ll=gf(e.stateNode.containerInfo),Cl(e,t,n),ll=r;break;case 22:e.memoizedState===null&&(r=e.alternate,r!==null&&r.memoizedState!==null?(r=Sl,Sl=16777216,Cl(e,t,n),Sl=r):Cl(e,t,n));break;default:Cl(e,t,n)}}function Tl(e){var t=e.alternate;if(t!==null&&(e=t.child,e!==null)){t.child=null;do t=e.sibling,e.sibling=null,e=t;while(e!==null)}}function El(e){var t=e.deletions;if(e.flags&16){if(t!==null)for(var n=0;n<t.length;n++){var r=t[n];Xc=r,kl(r,e)}Tl(e)}if(e.subtreeFlags&10256)for(e=e.child;e!==null;)Dl(e),e=e.sibling}function Dl(e){switch(e.tag){case 0:case 11:case 15:El(e),e.flags&2048&&Pc(9,e,e.return);break;case 3:El(e);break;case 12:El(e);break;case 22:var t=e.stateNode;e.memoizedState!==null&&t._visibility&2&&(e.return===null||e.return.tag!==13)?(t._visibility&=-3,Ol(e)):El(e);break;default:El(e)}}function Ol(e){var t=e.deletions;if(e.flags&16){if(t!==null)for(var n=0;n<t.length;n++){var r=t[n];Xc=r,kl(r,e)}Tl(e)}for(e=e.child;e!==null;){switch(t=e,t.tag){case 0:case 11:case 15:Pc(8,t,t.return),Ol(t);break;case 22:n=t.stateNode,n._visibility&2&&(n._visibility&=-3,Ol(t));break;default:Ol(t)}e=e.sibling}}function kl(e,t){for(;Xc!==null;){var n=Xc;switch(n.tag){case 0:case 11:case 15:Pc(8,n,t);break;case 23:case 22:if(n.memoizedState!==null&&n.memoizedState.cachePool!==null){var r=n.memoizedState.cachePool.pool;r!=null&&r.refCount++}break;case 24:na(n.memoizedState.cache)}if(r=n.child,r!==null)r.return=n,Xc=r;else a:for(n=e;Xc!==null;){r=Xc;var i=r.sibling,a=r.return;if($c(r),r===n){Xc=null;break a}if(i!==null){i.return=a,Xc=i;break a}Xc=a}}}var Al={getCacheForType:function(e){var t=Ji(ea),n=t.data.get(e);return n===void 0&&(n=e(),t.data.set(e,n)),n},cacheSignal:function(){return Ji(ea).controller.signal}},jl=typeof WeakMap==`function`?WeakMap:Map,Ml=0,Nl=null,Pl=null,Fl=0,Il=0,Ll=null,Rl=!1,zl=!1,Bl=!1,Vl=0,Hl=0,Ul=0,Wl=0,Gl=0,Kl=0,ql=0,Jl=null,Yl=null,Xl=!1,$=0,Zl=0,Ql=1/0,$l=null,eu=null,tu=0,nu=null,ru=null,iu=0,au=0,ou=null,su=null,cu=0,lu=null;function uu(){return Ml&2&&Fl!==0?Fl&-Fl:P.T===null?Qe():ld()}function du(){if(Kl===0){if(!(Fl&536870912)||K){var e=Le;Le<<=1,!(Le&3932160)&&(Le=262144),Kl=e}else Kl=536870912}return e=Xa.current,e!==null&&(e.flags|=32),Kl}function fu(e,t,n){(e===Nl&&(Il===2||Il===9)||e.cancelPendingCommit!==null)&&(yu(e,0),gu(e,Fl,Kl,!1)),Ge(e,n),(!(Ml&2)||e!==Nl)&&(e===Nl&&(!(Ml&2)&&(Wl|=n),Hl===4&&gu(e,Fl,Kl,!1)),td(e))}function pu(e,t,n){if(Ml&6)throw Error(i(327));var r=!n&&!(t&127)&&(t&e.expiredLanes)===0||Ve(e,t),a=r?Du(e,t):Tu(e,t,!0),o=r;do{if(a===0){zl&&!r&&gu(e,t,0,!1);break}if(n=e.current.alternate,o&&!hu(n)){a=Tu(e,t,!1),o=!1;continue}if(a===2){if(o=t,e.errorRecoveryDisabledLanes&o)var s=0;else s=e.pendingLanes&-536870913,s=s===0?s&536870912?536870912:0:s;if(s!==0){t=s;a:{var c=e;a=Jl;var l=c.current.memoizedState.isDehydrated;if(l&&(yu(c,s).flags|=256),s=Tu(c,s,!1),s!==2){if(Bl&&!l){c.errorRecoveryDisabledLanes|=o,Wl|=o,a=4;break a}o=Yl,Yl=a,o!==null&&(Yl===null?Yl=o:Yl.push.apply(Yl,o))}a=s}if(o=!1,a!==2)continue}}if(a===1){yu(e,0),gu(e,t,0,!0);break}a:{switch(r=e,o=a,o){case 0:case 1:throw Error(i(345));case 4:if((t&4194048)!==t)break;case 6:gu(r,t,Kl,!Rl);break a;case 2:Yl=null;break;case 3:case 5:break;default:throw Error(i(329))}if((t&62914560)===t&&(a=$+300-be(),10<a)){if(gu(r,t,Kl,!Rl),Be(r,0,!0)!==0)break a;iu=t,r.timeoutHandle=Kd(mu.bind(null,r,n,Yl,$l,Xl,t,Kl,Wl,ql,Rl,o,`Throttled`,-0,0),a);break a}mu(r,n,Yl,$l,Xl,t,Kl,Wl,ql,Rl,o,null,-0,0)}break}while(1);td(e)}function mu(e,t,n,r,i,a,o,s,c,l,u,d,f,p){if(e.timeoutHandle=-1,d=t.subtreeFlags,d&8192||(d&16785408)==16785408){d={stylesheets:null,count:0,imgCount:0,imgBytes:0,suspenseyImages:[],waitingForImages:!0,waitingForViewTransition:!1,unsuspend:qt},wl(t,a,d);var m=(a&62914560)===a?$-be():(a&4194048)===a?Zl-be():0;if(m=qf(d,m),m!==null){iu=a,e.cancelPendingCommit=m(Pu.bind(null,e,t,a,n,r,i,o,s,c,u,d,null,f,p)),gu(e,a,o,!l);return}}Pu(e,t,a,n,r,i,o,s,c)}function hu(e){for(var t=e;;){var n=t.tag;if((n===0||n===11||n===15)&&t.flags&16384&&(n=t.updateQueue,n!==null&&(n=n.stores,n!==null)))for(var r=0;r<n.length;r++){var i=n[r],a=i.getSnapshot;i=i.value;try{if(!hr(a(),i))return!1}catch{return!1}}if(n=t.child,t.subtreeFlags&16384&&n!==null)n.return=t,t=n;else{if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return!0;t=t.return}t.sibling.return=t.return,t=t.sibling}}return!0}function gu(e,t,n,r){t&=~Gl,t&=~Wl,e.suspendedLanes|=t,e.pingedLanes&=~t,r&&(e.warmLanes|=t),r=e.expirationTimes;for(var i=t;0<i;){var a=31-Me(i),o=1<<a;r[a]=-1,i&=~o}n!==0&&qe(e,n,t)}function _u(){return Ml&6?!0:(nd(0,!1),!1)}function vu(){if(Pl!==null){if(Il===0)var e=Pl.return;else e=Pl,Bi=zi=null,So(e),Ta=null,Ea=0,e=Pl;for(;e!==null;)Mc(e.alternate,e),e=e.return;Pl=null}}function yu(e,t){var n=e.timeoutHandle;n!==-1&&(e.timeoutHandle=-1,qd(n)),n=e.cancelPendingCommit,n!==null&&(e.cancelPendingCommit=null,n()),iu=0,vu(),Nl=e,Pl=n=ri(e.current,null),Fl=t,Il=0,Ll=null,Rl=!1,zl=Ve(e,t),Bl=!1,ql=Kl=Gl=Wl=Ul=Hl=0,Yl=Jl=null,Xl=!1,t&8&&(t|=t&32);var r=e.entangledLanes;if(r!==0)for(e=e.entanglements,r&=t;0<r;){var i=31-Me(r),a=1<<i;t|=e[i],r&=~a}return Vl=t,qr(),n}function bu(e,t){q=null,P.H=ks,t===ha||t===_a?(t=Ca(),Il=3):t===ga?(t=Ca(),Il=4):Il=t===qs?8:typeof t==`object`&&t&&typeof t.then==`function`?6:1,Ll=t,Pl===null&&(Hl=1,Vs(e,di(t,e.current)))}function xu(){var e=Xa.current;return e===null?!0:(Fl&4194048)===Fl?Za===null:(Fl&62914560)===Fl||Fl&536870912?e===Za:!1}function Su(){var e=P.H;return P.H=ks,e===null?ks:e}function Cu(){var e=P.A;return P.A=Al,e}function wu(){Hl=4,Rl||(Fl&4194048)!==Fl&&Xa.current!==null||(zl=!0),!(Ul&134217727)&&!(Wl&134217727)||Nl===null||gu(Nl,Fl,Kl,!1)}function Tu(e,t,n){var r=Ml;Ml|=2;var i=Su(),a=Cu();(Nl!==e||Fl!==t)&&($l=null,yu(e,t)),t=!1;var o=Hl;a:do try{if(Il!==0&&Pl!==null){var s=Pl,c=Ll;switch(Il){case 8:vu(),o=6;break a;case 3:case 2:case 9:case 6:Xa.current===null&&(t=!0);var l=Il;if(Il=0,Ll=null,ju(e,s,c,l),n&&zl){o=0;break a}break;default:l=Il,Il=0,Ll=null,ju(e,s,c,l)}}Eu(),o=Hl;break}catch(t){bu(e,t)}while(1);return t&&e.shellSuspendCounter++,Bi=zi=null,Ml=r,P.H=i,P.A=a,Pl===null&&(Nl=null,Fl=0,qr()),o}function Eu(){for(;Pl!==null;)ku(Pl)}function Du(e,t){var n=Ml;Ml|=2;var r=Su(),a=Cu();Nl!==e||Fl!==t?($l=null,Ql=be()+500,yu(e,t)):zl=Ve(e,t);a:do try{if(Il!==0&&Pl!==null){t=Pl;var o=Ll;b:switch(Il){case 1:Il=0,Ll=null,ju(e,t,o,1);break;case 2:case 9:if(ya(o)){Il=0,Ll=null,Au(t);break}t=function(){Il!==2&&Il!==9||Nl!==e||(Il=7),td(e)},o.then(t,t);break a;case 3:Il=7;break a;case 4:Il=5;break a;case 7:ya(o)?(Il=0,Ll=null,Au(t)):(Il=0,Ll=null,ju(e,t,o,7));break;case 5:var s=null;switch(Pl.tag){case 26:s=Pl.memoizedState;case 5:case 27:var c=Pl;if(s?Wf(s):c.stateNode.complete){Il=0,Ll=null;var l=c.sibling;if(l!==null)Pl=l;else{var u=c.return;u===null?Pl=null:(Pl=u,Mu(u))}break b}}Il=0,Ll=null,ju(e,t,o,5);break;case 6:Il=0,Ll=null,ju(e,t,o,6);break;case 8:vu(),Hl=6;break a;default:throw Error(i(462))}}Ou();break}catch(t){bu(e,t)}while(1);return Bi=zi=null,P.H=r,P.A=a,Ml=n,Pl===null?(Nl=null,Fl=0,qr(),Hl):0}function Ou(){for(;Pl!==null&&!ve();)ku(Pl)}function ku(e){var t=Cc(e.alternate,e,Vl);e.memoizedProps=e.pendingProps,t===null?Mu(e):Pl=t}function Au(e){var t=e,n=t.alternate;switch(t.tag){case 15:case 0:t=sc(n,t,t.pendingProps,t.type,void 0,Fl);break;case 11:t=sc(n,t,t.pendingProps,t.type.render,t.ref,Fl);break;case 5:So(t);default:Mc(n,t),t=Pl=ii(t,Vl),t=Cc(n,t,Vl)}e.memoizedProps=e.pendingProps,t===null?Mu(e):Pl=t}function ju(e,t,n,r){Bi=zi=null,So(t),Ta=null,Ea=0;var i=t.return;try{if(Ks(e,i,t,n,Fl)){Hl=1,Vs(e,di(n,e.current)),Pl=null;return}}catch(t){if(i!==null)throw Pl=i,t;Hl=1,Vs(e,di(n,e.current)),Pl=null;return}t.flags&32768?(K||r===1?e=!0:zl||Fl&536870912?e=!1:(Rl=e=!0,(r===2||r===9||r===3||r===6)&&(r=Xa.current,r!==null&&r.tag===13&&(r.flags|=16384))),Nu(t,e)):Mu(t)}function Mu(e){var t=e;do{if(t.flags&32768){Nu(t,Rl);return}e=t.return;var n=Ac(t.alternate,t,Vl);if(n!==null){Pl=n;return}if(t=t.sibling,t!==null){Pl=t;return}Pl=t=e}while(t!==null);Hl===0&&(Hl=5)}function Nu(e,t){do{var n=jc(e.alternate,e);if(n!==null){n.flags&=32767,Pl=n;return}if(n=e.return,n!==null&&(n.flags|=32768,n.subtreeFlags=0,n.deletions=null),!t&&(e=e.sibling,e!==null)){Pl=e;return}Pl=e=n}while(e!==null);Hl=6,Pl=null}function Pu(e,t,n,r,a,o,s,c,l){e.cancelPendingCommit=null;do zu();while(tu!==0);if(Ml&6)throw Error(i(327));if(t!==null){if(t===e.current)throw Error(i(177));if(o=t.lanes|t.childLanes,o|=Kr,Ke(e,n,o,s,c,l),e===Nl&&(Pl=Nl=null,Fl=0),ru=t,nu=e,iu=n,au=o,ou=a,su=r,t.subtreeFlags&10256||t.flags&10256?(e.callbackNode=null,e.callbackPriority=0,Ju(we,function(){return Bu(),null})):(e.callbackNode=null,e.callbackPriority=0),r=!!(t.flags&13878),t.subtreeFlags&13878||r){r=P.T,P.T=null,a=F.p,F.p=2,s=Ml,Ml|=4;try{Zc(e,t,n)}finally{Ml=s,F.p=a,P.T=r}}tu=1,Fu(),Iu(),Lu()}}function Fu(){if(tu===1){tu=0;var e=nu,t=ru,n=!!(t.flags&13878);if(t.subtreeFlags&13878||n){n=P.T,P.T=null;var r=F.p;F.p=2;var i=Ml;Ml|=4;try{ul(t,e);var a=zd,o=br(e.containerInfo),s=a.focusedElem,c=a.selectionRange;if(o!==s&&s&&s.ownerDocument&&yr(s.ownerDocument.documentElement,s)){if(c!==null&&xr(s)){var l=c.start,u=c.end;if(u===void 0&&(u=l),`selectionStart`in s)s.selectionStart=l,s.selectionEnd=Math.min(u,s.value.length);else{var d=s.ownerDocument||document,f=d&&d.defaultView||window;if(f.getSelection){var p=f.getSelection(),m=s.textContent.length,h=Math.min(c.start,m),g=c.end===void 0?h:Math.min(c.end,m);!p.extend&&h>g&&(o=g,g=h,h=o);var _=vr(s,h),v=vr(s,g);if(_&&v&&(p.rangeCount!==1||p.anchorNode!==_.node||p.anchorOffset!==_.offset||p.focusNode!==v.node||p.focusOffset!==v.offset)){var y=d.createRange();y.setStart(_.node,_.offset),p.removeAllRanges(),h>g?(p.addRange(y),p.extend(v.node,v.offset)):(y.setEnd(v.node,v.offset),p.addRange(y))}}}}for(d=[],p=s;p=p.parentNode;)p.nodeType===1&&d.push({element:p,left:p.scrollLeft,top:p.scrollTop});for(typeof s.focus==`function`&&s.focus(),s=0;s<d.length;s++){var b=d[s];b.element.scrollLeft=b.left,b.element.scrollTop=b.top}}sp=!!Rd,zd=Rd=null}finally{Ml=i,F.p=r,P.T=n}}e.current=t,tu=2}}function Iu(){if(tu===2){tu=0;var e=nu,t=ru,n=!!(t.flags&8772);if(t.subtreeFlags&8772||n){n=P.T,P.T=null;var r=F.p;F.p=2;var i=Ml;Ml|=4;try{Qc(e,t.alternate,t)}finally{Ml=i,F.p=r,P.T=n}}tu=3}}function Lu(){if(tu===4||tu===3){tu=0,ye();var e=nu,t=ru,n=iu,r=su;t.subtreeFlags&10256||t.flags&10256?tu=5:(tu=0,ru=nu=null,Ru(e,e.pendingLanes));var i=e.pendingLanes;if(i===0&&(eu=null),Ze(n),t=t.stateNode,Ae&&typeof Ae.onCommitFiberRoot==`function`)try{Ae.onCommitFiberRoot(ke,t,void 0,(t.current.flags&128)==128)}catch{}if(r!==null){t=P.T,i=F.p,F.p=2,P.T=null;try{for(var a=e.onRecoverableError,o=0;o<r.length;o++){var s=r[o];a(s.value,{componentStack:s.stack})}}finally{P.T=t,F.p=i}}iu&3&&zu(),td(e),i=e.pendingLanes,n&261930&&i&42?e===lu?cu++:(cu=0,lu=e):cu=0,nd(0,!1)}}function Ru(e,t){(e.pooledCacheLanes&=t)===0&&(t=e.pooledCache,t!=null&&(e.pooledCache=null,na(t)))}function zu(){return Fu(),Iu(),Lu(),Bu()}function Bu(){if(tu!==5)return!1;var e=nu,t=au;au=0;var n=Ze(iu),r=P.T,a=F.p;try{F.p=32>n?32:n,P.T=null,n=ou,ou=null;var o=nu,s=iu;if(tu=0,ru=nu=null,iu=0,Ml&6)throw Error(i(331));var c=Ml;if(Ml|=4,Dl(o.current),yl(o,o.current,s,n),Ml=c,nd(0,!1),Ae&&typeof Ae.onPostCommitFiberRoot==`function`)try{Ae.onPostCommitFiberRoot(ke,o)}catch{}return!0}finally{F.p=a,P.T=r,Ru(e,t)}}function Vu(e,t,n){t=di(n,t),t=Us(e.stateNode,t,2),e=La(e,t,2),e!==null&&(Ge(e,2),td(e))}function Hu(e,t,n){if(e.tag===3)Vu(e,e,n);else for(;t!==null;){if(t.tag===3){Vu(t,e,n);break}if(t.tag===1){var r=t.stateNode;if(typeof t.type.getDerivedStateFromError==`function`||typeof r.componentDidCatch==`function`&&(eu===null||!eu.has(r))){e=di(n,e),n=Ws(2),r=La(t,n,2),r!==null&&(Gs(n,r,t,e),Ge(r,2),td(r));break}}t=t.return}}function Uu(e,t,n){var r=e.pingCache;if(r===null){r=e.pingCache=new jl;var i=new Set;r.set(t,i)}else i=r.get(t),i===void 0&&(i=new Set,r.set(t,i));i.has(n)||(Bl=!0,i.add(n),e=Wu.bind(null,e,t,n),t.then(e,e))}function Wu(e,t,n){var r=e.pingCache;r!==null&&r.delete(t),e.pingedLanes|=e.suspendedLanes&n,e.warmLanes&=~n,Nl===e&&(Fl&n)===n&&(Hl===4||Hl===3&&(Fl&62914560)===Fl&&300>be()-$?!(Ml&2)&&yu(e,0):Gl|=n,ql===Fl&&(ql=0)),td(e)}function Gu(e,t){t===0&&(t=Ue()),e=Xr(e,t),e!==null&&(Ge(e,t),td(e))}function Ku(e){var t=e.memoizedState,n=0;t!==null&&(n=t.retryLane),Gu(e,n)}function qu(e,t){var n=0;switch(e.tag){case 31:case 13:var r=e.stateNode,a=e.memoizedState;a!==null&&(n=a.retryLane);break;case 19:r=e.stateNode;break;case 22:r=e.stateNode._retryCache;break;default:throw Error(i(314))}r!==null&&r.delete(t),Gu(e,n)}function Ju(e,t){return _e(e,t)}var Yu=null,Xu=null,Zu=!1,Qu=!1,$u=!1,ed=0;function td(e){e!==Xu&&e.next===null&&(Xu===null?Yu=Xu=e:Xu=Xu.next=e),Qu=!0,Zu||(Zu=!0,cd())}function nd(e,t){if(!$u&&Qu){$u=!0;do for(var n=!1,r=Yu;r!==null;){if(!t){if(e!==0){var i=r.pendingLanes;if(i===0)var a=0;else{var o=r.suspendedLanes,s=r.pingedLanes;a=(1<<31-Me(42|e)+1)-1,a&=i&~(o&~s),a=a&201326741?a&201326741|1:a?a|2:0}a!==0&&(n=!0,sd(r,a))}else a=Fl,a=Be(r,r===Nl?a:0,r.cancelPendingCommit!==null||r.timeoutHandle!==-1),!(a&3)||Ve(r,a)||(n=!0,sd(r,a))}r=r.next}while(n);$u=!1}}function rd(){id()}function id(){Qu=Zu=!1;var e=0;ed!==0&&Gd()&&(e=ed);for(var t=be(),n=null,r=Yu;r!==null;){var i=r.next,a=ad(r,t);a===0?(r.next=null,n===null?Yu=i:n.next=i,i===null&&(Xu=n)):(n=r,(e!==0||a&3)&&(Qu=!0)),r=i}tu!==0&&tu!==5||nd(e,!1),ed!==0&&(ed=0)}function ad(e,t){for(var n=e.suspendedLanes,r=e.pingedLanes,i=e.expirationTimes,a=e.pendingLanes&-62914561;0<a;){var o=31-Me(a),s=1<<o,c=i[o];c===-1?((s&n)===0||(s&r)!==0)&&(i[o]=He(s,t)):c<=t&&(e.expiredLanes|=s),a&=~s}if(t=Nl,n=Fl,n=Be(e,e===t?n:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),r=e.callbackNode,n===0||e===t&&(Il===2||Il===9)||e.cancelPendingCommit!==null)return r!==null&&r!==null&&U(r),e.callbackNode=null,e.callbackPriority=0;if(!(n&3)||Ve(e,n)){if(t=n&-n,t===e.callbackPriority)return t;switch(r!==null&&U(r),Ze(n)){case 2:case 8:n=Ce;break;case 32:n=we;break;case 268435456:n=Ee;break;default:n=we}return r=od.bind(null,e),n=_e(n,r),e.callbackPriority=t,e.callbackNode=n,t}return r!==null&&r!==null&&U(r),e.callbackPriority=2,e.callbackNode=null,2}function od(e,t){if(tu!==0&&tu!==5)return e.callbackNode=null,e.callbackPriority=0,null;var n=e.callbackNode;if(zu()&&e.callbackNode!==n)return null;var r=Fl;return r=Be(e,e===Nl?r:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),r===0?null:(pu(e,r,t),ad(e,be()),e.callbackNode!=null&&e.callbackNode===n?od.bind(null,e):null)}function sd(e,t){if(zu())return null;pu(e,t,!0)}function cd(){Yd(function(){Ml&6?_e(Se,rd):id()})}function ld(){if(ed===0){var e=aa;e===0&&(e=Ie,Ie<<=1,!(Ie&261888)&&(Ie=256)),ed=e}return ed}function ud(e){return e==null||typeof e==`symbol`||typeof e==`boolean`?null:typeof e==`function`?e:Kt(``+e)}function dd(e,t){var n=t.ownerDocument.createElement(`input`);return n.name=t.name,n.value=t.value,e.id&&n.setAttribute(`form`,e.id),t.parentNode.insertBefore(n,t),e=new FormData(e),n.parentNode.removeChild(n),e}function fd(e,t,n,r,i){if(t===`submit`&&n&&n.stateNode===i){var a=ud((i[nt]||null).action),o=r.submitter;o&&(t=(t=o[nt]||null)?ud(t.formAction):o.getAttribute(`formAction`),t!==null&&(a=t,o=null));var s=new hn(`action`,`action`,null,r,i);e.push({event:s,listeners:[{instance:null,listener:function(){if(r.defaultPrevented){if(ed!==0){var e=o?dd(i,o):new FormData(i);vs(n,{pending:!0,data:e,method:i.method,action:a},null,e)}}else typeof a==`function`&&(s.preventDefault(),e=o?dd(i,o):new FormData(i),vs(n,{pending:!0,data:e,method:i.method,action:a},a,e))},currentTarget:i}]})}}for(var pd=0;pd<Vr.length;pd++){var md=Vr[pd];Hr(md.toLowerCase(),`on`+(md[0].toUpperCase()+md.slice(1)))}Hr(Nr,`onAnimationEnd`),Hr(Pr,`onAnimationIteration`),Hr(Fr,`onAnimationStart`),Hr(`dblclick`,`onDoubleClick`),Hr(`focusin`,`onFocus`),Hr(`focusout`,`onBlur`),Hr(Ir,`onTransitionRun`),Hr(Lr,`onTransitionStart`),Hr(Rr,`onTransitionCancel`),Hr(zr,`onTransitionEnd`),vt(`onMouseEnter`,[`mouseout`,`mouseover`]),vt(`onMouseLeave`,[`mouseout`,`mouseover`]),vt(`onPointerEnter`,[`pointerout`,`pointerover`]),vt(`onPointerLeave`,[`pointerout`,`pointerover`]),_t(`onChange`,`change click focusin focusout input keydown keyup selectionchange`.split(` `)),_t(`onSelect`,`focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange`.split(` `)),_t(`onBeforeInput`,[`compositionend`,`keypress`,`textInput`,`paste`]),_t(`onCompositionEnd`,`compositionend focusout keydown keypress keyup mousedown`.split(` `)),_t(`onCompositionStart`,`compositionstart focusout keydown keypress keyup mousedown`.split(` `)),_t(`onCompositionUpdate`,`compositionupdate focusout keydown keypress keyup mousedown`.split(` `));var hd=`abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting`.split(` `),gd=new Set(`beforetoggle cancel close invalid load scroll scrollend toggle`.split(` `).concat(hd));function _d(e,t){t=!!(t&4);for(var n=0;n<e.length;n++){var r=e[n],i=r.event;r=r.listeners;a:{var a=void 0;if(t)for(var o=r.length-1;0<=o;o--){var s=r[o],c=s.instance,l=s.currentTarget;if(s=s.listener,c!==a&&i.isPropagationStopped())break a;a=s,i.currentTarget=l;try{a(i)}catch(e){Ur(e)}i.currentTarget=null,a=c}else for(o=0;o<r.length;o++){if(s=r[o],c=s.instance,l=s.currentTarget,s=s.listener,c!==a&&i.isPropagationStopped())break a;a=s,i.currentTarget=l;try{a(i)}catch(e){Ur(e)}i.currentTarget=null,a=c}}}}function vd(e,t){var n=t[it];n===void 0&&(n=t[it]=new Set);var r=e+`__bubble`;n.has(r)||(Sd(t,e,2,!1),n.add(r))}function yd(e,t,n){var r=0;t&&(r|=4),Sd(n,e,r,t)}var bd=`_reactListening`+Math.random().toString(36).slice(2);function xd(e){if(!e[bd]){e[bd]=!0,ht.forEach(function(t){t!==`selectionchange`&&(gd.has(t)||yd(t,!1,e),yd(t,!0,e))});var t=e.nodeType===9?e:e.ownerDocument;t===null||t[bd]||(t[bd]=!0,yd(`selectionchange`,!1,t))}}function Sd(e,t,n,r){switch(mp(t)){case 2:var i=cp;break;case 8:i=lp;break;default:i=up}n=i.bind(null,t,n,e),i=void 0,!rn||t!==`touchstart`&&t!==`touchmove`&&t!==`wheel`||(i=!0),r?i===void 0?e.addEventListener(t,n,!0):e.addEventListener(t,n,{capture:!0,passive:i}):i===void 0?e.addEventListener(t,n,!1):e.addEventListener(t,n,{passive:i})}function Cd(e,t,n,r,i){var a=r;if(!(t&1)&&!(t&2)&&r!==null)a:for(;;){if(r===null)return;var s=r.tag;if(s===3||s===4){var c=r.stateNode.containerInfo;if(c===i)break;if(s===4)for(s=r.return;s!==null;){var l=s.tag;if((l===3||l===4)&&s.stateNode.containerInfo===i)return;s=s.return}for(;c!==null;){if(s=ut(c),s===null)return;if(l=s.tag,l===5||l===6||l===26||l===27){r=a=s;continue a}c=c.parentNode}}r=r.return}en(function(){var r=a,i=Yt(n),s=[];a:{var c=Br.get(e);if(c!==void 0){var l=hn,u=e;switch(e){case`keypress`:if(un(n)===0)break a;case`keydown`:case`keyup`:l=Nn;break;case`focusin`:u=`focus`,l=wn;break;case`focusout`:u=`blur`,l=wn;break;case`beforeblur`:case`afterblur`:l=wn;break;case`click`:if(n.button===2)break a;case`auxclick`:case`dblclick`:case`mousedown`:case`mousemove`:case`mouseup`:case`mouseout`:case`mouseover`:case`contextmenu`:l=Sn;break;case`drag`:case`dragend`:case`dragenter`:case`dragexit`:case`dragleave`:case`dragover`:case`dragstart`:case`drop`:l=Cn;break;case`touchcancel`:case`touchend`:case`touchmove`:case`touchstart`:l=Fn;break;case Nr:case Pr:case Fr:l=Tn;break;case zr:l=In;break;case`scroll`:case`scrollend`:l=_n;break;case`wheel`:l=Ln;break;case`copy`:case`cut`:case`paste`:l=En;break;case`gotpointercapture`:case`lostpointercapture`:case`pointercancel`:case`pointerdown`:case`pointermove`:case`pointerout`:case`pointerover`:case`pointerup`:l=Pn;break;case`toggle`:case`beforetoggle`:l=Rn}var d=!!(t&4),f=!d&&(e===`scroll`||e===`scrollend`),p=d?c===null?null:c+`Capture`:c;d=[];for(var m=r,h;m!==null;){var g=m;if(h=g.stateNode,g=g.tag,g!==5&&g!==26&&g!==27||h===null||p===null||(g=tn(m,p),g!=null&&d.push(wd(m,g,h))),f)break;m=m.return}0<d.length&&(c=new l(c,u,null,n,i),s.push({event:c,listeners:d}))}}if(!(t&7)){a:{if(c=e===`mouseover`||e===`pointerover`,l=e===`mouseout`||e===`pointerout`,c&&n!==Jt&&(u=n.relatedTarget||n.fromElement)&&(ut(u)||u[rt]))break a;if((l||c)&&(c=i.window===i?i:(c=i.ownerDocument)?c.defaultView||c.parentWindow:window,l?(u=n.relatedTarget||n.toElement,l=r,u=u?ut(u):null,u!==null&&(f=o(u),d=u.tag,u!==f||d!==5&&d!==27&&d!==6)&&(u=null)):(l=null,u=r),l!==u)){if(d=Sn,g=`onMouseLeave`,p=`onMouseEnter`,m=`mouse`,(e===`pointerout`||e===`pointerover`)&&(d=Pn,g=`onPointerLeave`,p=`onPointerEnter`,m=`pointer`),f=l==null?c:ft(l),h=u==null?c:ft(u),c=new d(g,m+`leave`,l,n,i),c.target=f,c.relatedTarget=h,g=null,ut(i)===r&&(d=new d(p,m+`enter`,u,n,i),d.target=h,d.relatedTarget=f,g=d),f=g,l&&u)b:{for(d=Ed,p=l,m=u,h=0,g=p;g;g=d(g))h++;g=0;for(var _=m;_;_=d(_))g++;for(;0<h-g;)p=d(p),h--;for(;0<g-h;)m=d(m),g--;for(;h--;){if(p===m||m!==null&&p===m.alternate){d=p;break b}p=d(p),m=d(m)}d=null}else d=null;l!==null&&Dd(s,c,l,d,!1),u!==null&&f!==null&&Dd(s,f,u,d,!0)}}a:{if(c=r?ft(r):window,l=c.nodeName&&c.nodeName.toLowerCase(),l===`select`||l===`input`&&c.type===`file`)var v=rr;else if(Zn(c)){if(ir)v=pr;else{v=dr;var y=ur}}else l=c.nodeName,!l||l.toLowerCase()!==`input`||c.type!==`checkbox`&&c.type!==`radio`?r&&Ut(r.elementType)&&(v=rr):v=fr;if(v&&(v=v(e,r))){Qn(s,v,n,i);break a}y&&y(e,c,r),e===`focusout`&&r&&c.type===`number`&&r.memoizedProps.value!=null&&Ft(c,`number`,c.value)}switch(y=r?ft(r):window,e){case`focusin`:(Zn(y)||y.contentEditable===`true`)&&(Cr=y,wr=r,Tr=null);break;case`focusout`:Tr=wr=Cr=null;break;case`mousedown`:Er=!0;break;case`contextmenu`:case`mouseup`:case`dragend`:Er=!1,Dr(s,n,i);break;case`selectionchange`:if(Sr)break;case`keydown`:case`keyup`:Dr(s,n,i)}var b;if(Bn)b:{switch(e){case`compositionstart`:var x=`onCompositionStart`;break b;case`compositionend`:x=`onCompositionEnd`;break b;case`compositionupdate`:x=`onCompositionUpdate`;break b}x=void 0}else qn?Gn(e,n)&&(x=`onCompositionEnd`):e===`keydown`&&n.keyCode===229&&(x=`onCompositionStart`);x&&(Un&&n.locale!==`ko`&&(qn||x!==`onCompositionStart`?x===`onCompositionEnd`&&qn&&(b=ln()):(on=i,sn=`value`in on?on.value:on.textContent,qn=!0)),y=Td(r,x),0<y.length&&(x=new Dn(x,e,null,n,i),s.push({event:x,listeners:y}),b?x.data=b:(b=Kn(n),b!==null&&(x.data=b)))),(b=Hn?Jn(e,n):Yn(e,n))&&(x=Td(r,`onBeforeInput`),0<x.length&&(y=new Dn(`onBeforeInput`,`beforeinput`,null,n,i),s.push({event:y,listeners:x}),y.data=b)),fd(s,e,r,n,i)}_d(s,t)})}function wd(e,t,n){return{instance:e,listener:t,currentTarget:n}}function Td(e,t){for(var n=t+`Capture`,r=[];e!==null;){var i=e,a=i.stateNode;if(i=i.tag,i!==5&&i!==26&&i!==27||a===null||(i=tn(e,n),i!=null&&r.unshift(wd(e,i,a)),i=tn(e,t),i!=null&&r.push(wd(e,i,a))),e.tag===3)return r;e=e.return}return[]}function Ed(e){if(e===null)return null;do e=e.return;while(e&&e.tag!==5&&e.tag!==27);return e||null}function Dd(e,t,n,r,i){for(var a=t._reactName,o=[];n!==null&&n!==r;){var s=n,c=s.alternate,l=s.stateNode;if(s=s.tag,c!==null&&c===r)break;s!==5&&s!==26&&s!==27||l===null||(c=l,i?(l=tn(n,a),l!=null&&o.unshift(wd(n,l,c))):i||(l=tn(n,a),l!=null&&o.push(wd(n,l,c)))),n=n.return}o.length!==0&&e.push({event:t,listeners:o})}var Od=/\r\n?/g,kd=/\u0000|\uFFFD/g;function Ad(e){return(typeof e==`string`?e:``+e).replace(Od,`
`).replace(kd,``)}function jd(e,t){return t=Ad(t),Ad(e)===t}function Md(e,t,n,r,a,o){switch(n){case`children`:typeof r==`string`?t===`body`||t===`textarea`&&r===``||zt(e,r):(typeof r==`number`||typeof r==`bigint`)&&t!==`body`&&zt(e,``+r);break;case`className`:Ct(e,`class`,r);break;case`tabIndex`:Ct(e,`tabindex`,r);break;case`dir`:case`role`:case`viewBox`:case`width`:case`height`:Ct(e,n,r);break;case`style`:Ht(e,r,o);break;case`data`:if(t!==`object`){Ct(e,`data`,r);break}case`src`:case`href`:if(r===``&&(t!==`a`||n!==`href`)){e.removeAttribute(n);break}if(r==null||typeof r==`function`||typeof r==`symbol`||typeof r==`boolean`){e.removeAttribute(n);break}r=Kt(``+r),e.setAttribute(n,r);break;case`action`:case`formAction`:if(typeof r==`function`){e.setAttribute(n,`javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')`);break}if(typeof o==`function`&&(n===`formAction`?(t!==`input`&&Md(e,t,`name`,a.name,a,null),Md(e,t,`formEncType`,a.formEncType,a,null),Md(e,t,`formMethod`,a.formMethod,a,null),Md(e,t,`formTarget`,a.formTarget,a,null)):(Md(e,t,`encType`,a.encType,a,null),Md(e,t,`method`,a.method,a,null),Md(e,t,`target`,a.target,a,null))),r==null||typeof r==`symbol`||typeof r==`boolean`){e.removeAttribute(n);break}r=Kt(``+r),e.setAttribute(n,r);break;case`onClick`:r!=null&&(e.onclick=qt);break;case`onScroll`:r!=null&&vd(`scroll`,e);break;case`onScrollEnd`:r!=null&&vd(`scrollend`,e);break;case`dangerouslySetInnerHTML`:if(r!=null){if(typeof r!=`object`||!(`__html`in r))throw Error(i(61));if(n=r.__html,n!=null){if(a.children!=null)throw Error(i(60));e.innerHTML=n}}break;case`multiple`:e.multiple=r&&typeof r!=`function`&&typeof r!=`symbol`;break;case`muted`:e.muted=r&&typeof r!=`function`&&typeof r!=`symbol`;break;case`suppressContentEditableWarning`:case`suppressHydrationWarning`:case`defaultValue`:case`defaultChecked`:case`innerHTML`:case`ref`:break;case`autoFocus`:break;case`xlinkHref`:if(r==null||typeof r==`function`||typeof r==`boolean`||typeof r==`symbol`){e.removeAttribute(`xlink:href`);break}n=Kt(``+r),e.setAttributeNS(`http://www.w3.org/1999/xlink`,`xlink:href`,n);break;case`contentEditable`:case`spellCheck`:case`draggable`:case`value`:case`autoReverse`:case`externalResourcesRequired`:case`focusable`:case`preserveAlpha`:r!=null&&typeof r!=`function`&&typeof r!=`symbol`?e.setAttribute(n,``+r):e.removeAttribute(n);break;case`inert`:case`allowFullScreen`:case`async`:case`autoPlay`:case`controls`:case`default`:case`defer`:case`disabled`:case`disablePictureInPicture`:case`disableRemotePlayback`:case`formNoValidate`:case`hidden`:case`loop`:case`noModule`:case`noValidate`:case`open`:case`playsInline`:case`readOnly`:case`required`:case`reversed`:case`scoped`:case`seamless`:case`itemScope`:r&&typeof r!=`function`&&typeof r!=`symbol`?e.setAttribute(n,``):e.removeAttribute(n);break;case`capture`:case`download`:!0===r?e.setAttribute(n,``):!1!==r&&r!=null&&typeof r!=`function`&&typeof r!=`symbol`?e.setAttribute(n,r):e.removeAttribute(n);break;case`cols`:case`rows`:case`size`:case`span`:r!=null&&typeof r!=`function`&&typeof r!=`symbol`&&!isNaN(r)&&1<=r?e.setAttribute(n,r):e.removeAttribute(n);break;case`rowSpan`:case`start`:r==null||typeof r==`function`||typeof r==`symbol`||isNaN(r)?e.removeAttribute(n):e.setAttribute(n,r);break;case`popover`:vd(`beforetoggle`,e),vd(`toggle`,e),W(e,`popover`,r);break;case`xlinkActuate`:wt(e,`http://www.w3.org/1999/xlink`,`xlink:actuate`,r);break;case`xlinkArcrole`:wt(e,`http://www.w3.org/1999/xlink`,`xlink:arcrole`,r);break;case`xlinkRole`:wt(e,`http://www.w3.org/1999/xlink`,`xlink:role`,r);break;case`xlinkShow`:wt(e,`http://www.w3.org/1999/xlink`,`xlink:show`,r);break;case`xlinkTitle`:wt(e,`http://www.w3.org/1999/xlink`,`xlink:title`,r);break;case`xlinkType`:wt(e,`http://www.w3.org/1999/xlink`,`xlink:type`,r);break;case`xmlBase`:wt(e,`http://www.w3.org/XML/1998/namespace`,`xml:base`,r);break;case`xmlLang`:wt(e,`http://www.w3.org/XML/1998/namespace`,`xml:lang`,r);break;case`xmlSpace`:wt(e,`http://www.w3.org/XML/1998/namespace`,`xml:space`,r);break;case`is`:W(e,`is`,r);break;case`innerText`:case`textContent`:break;default:(!(2<n.length)||n[0]!==`o`&&n[0]!==`O`||n[1]!==`n`&&n[1]!==`N`)&&(n=Wt.get(n)||n,W(e,n,r))}}function Nd(e,t,n,r,a,o){switch(n){case`style`:Ht(e,r,o);break;case`dangerouslySetInnerHTML`:if(r!=null){if(typeof r!=`object`||!(`__html`in r))throw Error(i(61));if(n=r.__html,n!=null){if(a.children!=null)throw Error(i(60));e.innerHTML=n}}break;case`children`:typeof r==`string`?zt(e,r):(typeof r==`number`||typeof r==`bigint`)&&zt(e,``+r);break;case`onScroll`:r!=null&&vd(`scroll`,e);break;case`onScrollEnd`:r!=null&&vd(`scrollend`,e);break;case`onClick`:r!=null&&(e.onclick=qt);break;case`suppressContentEditableWarning`:case`suppressHydrationWarning`:case`innerHTML`:case`ref`:break;case`innerText`:case`textContent`:break;default:if(!gt.hasOwnProperty(n))a:{if(n[0]===`o`&&n[1]===`n`&&(a=n.endsWith(`Capture`),t=n.slice(2,a?n.length-7:void 0),o=e[nt]||null,o=o==null?null:o[n],typeof o==`function`&&e.removeEventListener(t,o,a),typeof r==`function`)){typeof o!=`function`&&o!==null&&(n in e?e[n]=null:e.hasAttribute(n)&&e.removeAttribute(n)),e.addEventListener(t,r,a);break a}n in e?e[n]=r:!0===r?e.setAttribute(n,``):W(e,n,r)}}}function Pd(e,t,n){switch(t){case`div`:case`span`:case`svg`:case`path`:case`a`:case`g`:case`p`:case`li`:break;case`img`:vd(`error`,e),vd(`load`,e);var r=!1,a=!1,o;for(o in n)if(n.hasOwnProperty(o)){var s=n[o];if(s!=null)switch(o){case`src`:r=!0;break;case`srcSet`:a=!0;break;case`children`:case`dangerouslySetInnerHTML`:throw Error(i(137,t));default:Md(e,t,o,s,n,null)}}a&&Md(e,t,`srcSet`,n.srcSet,n,null),r&&Md(e,t,`src`,n.src,n,null);return;case`input`:vd(`invalid`,e);var c=o=s=a=null,l=null,u=null;for(r in n)if(n.hasOwnProperty(r)){var d=n[r];if(d!=null)switch(r){case`name`:a=d;break;case`type`:s=d;break;case`checked`:l=d;break;case`defaultChecked`:u=d;break;case`value`:o=d;break;case`defaultValue`:c=d;break;case`children`:case`dangerouslySetInnerHTML`:if(d!=null)throw Error(i(137,t));break;default:Md(e,t,r,d,n,null)}}Pt(e,o,c,l,u,s,a,!1);return;case`select`:for(a in vd(`invalid`,e),r=s=o=null,n)if(n.hasOwnProperty(a)&&(c=n[a],c!=null))switch(a){case`value`:o=c;break;case`defaultValue`:s=c;break;case`multiple`:r=c;default:Md(e,t,a,c,n,null)}t=o,n=s,e.multiple=!!r,t==null?n!=null&&It(e,!!r,n,!0):It(e,!!r,t,!1);return;case`textarea`:for(s in vd(`invalid`,e),o=a=r=null,n)if(n.hasOwnProperty(s)&&(c=n[s],c!=null))switch(s){case`value`:r=c;break;case`defaultValue`:a=c;break;case`children`:o=c;break;case`dangerouslySetInnerHTML`:if(c!=null)throw Error(i(91));break;default:Md(e,t,s,c,n,null)}Rt(e,r,a,o);return;case`option`:for(l in n)if(n.hasOwnProperty(l)&&(r=n[l],r!=null))switch(l){case`selected`:e.selected=r&&typeof r!=`function`&&typeof r!=`symbol`;break;default:Md(e,t,l,r,n,null)}return;case`dialog`:vd(`beforetoggle`,e),vd(`toggle`,e),vd(`cancel`,e),vd(`close`,e);break;case`iframe`:case`object`:vd(`load`,e);break;case`video`:case`audio`:for(r=0;r<hd.length;r++)vd(hd[r],e);break;case`image`:vd(`error`,e),vd(`load`,e);break;case`details`:vd(`toggle`,e);break;case`embed`:case`source`:case`link`:vd(`error`,e),vd(`load`,e);case`area`:case`base`:case`br`:case`col`:case`hr`:case`keygen`:case`meta`:case`param`:case`track`:case`wbr`:case`menuitem`:for(u in n)if(n.hasOwnProperty(u)&&(r=n[u],r!=null))switch(u){case`children`:case`dangerouslySetInnerHTML`:throw Error(i(137,t));default:Md(e,t,u,r,n,null)}return;default:if(Ut(t)){for(d in n)n.hasOwnProperty(d)&&(r=n[d],r!==void 0&&Nd(e,t,d,r,n,void 0));return}}for(c in n)n.hasOwnProperty(c)&&(r=n[c],r!=null&&Md(e,t,c,r,n,null))}function Fd(e,t,n,r){switch(t){case`div`:case`span`:case`svg`:case`path`:case`a`:case`g`:case`p`:case`li`:break;case`input`:var a=null,o=null,s=null,c=null,l=null,u=null,d=null;for(m in n){var f=n[m];if(n.hasOwnProperty(m)&&f!=null)switch(m){case`checked`:break;case`value`:break;case`defaultValue`:l=f;default:r.hasOwnProperty(m)||Md(e,t,m,null,r,f)}}for(var p in r){var m=r[p];if(f=n[p],r.hasOwnProperty(p)&&(m!=null||f!=null))switch(p){case`type`:o=m;break;case`name`:a=m;break;case`checked`:u=m;break;case`defaultChecked`:d=m;break;case`value`:s=m;break;case`defaultValue`:c=m;break;case`children`:case`dangerouslySetInnerHTML`:if(m!=null)throw Error(i(137,t));break;default:m!==f&&Md(e,t,p,m,r,f)}}Nt(e,s,c,l,u,d,o,a);return;case`select`:for(o in m=s=c=p=null,n)if(l=n[o],n.hasOwnProperty(o)&&l!=null)switch(o){case`value`:break;case`multiple`:m=l;default:r.hasOwnProperty(o)||Md(e,t,o,null,r,l)}for(a in r)if(o=r[a],l=n[a],r.hasOwnProperty(a)&&(o!=null||l!=null))switch(a){case`value`:p=o;break;case`defaultValue`:c=o;break;case`multiple`:s=o;default:o!==l&&Md(e,t,a,o,r,l)}t=c,n=s,r=m,p==null?!!r!=!!n&&(t==null?It(e,!!n,n?[]:``,!1):It(e,!!n,t,!0)):It(e,!!n,p,!1);return;case`textarea`:for(c in m=p=null,n)if(a=n[c],n.hasOwnProperty(c)&&a!=null&&!r.hasOwnProperty(c))switch(c){case`value`:break;case`children`:break;default:Md(e,t,c,null,r,a)}for(s in r)if(a=r[s],o=n[s],r.hasOwnProperty(s)&&(a!=null||o!=null))switch(s){case`value`:p=a;break;case`defaultValue`:m=a;break;case`children`:break;case`dangerouslySetInnerHTML`:if(a!=null)throw Error(i(91));break;default:a!==o&&Md(e,t,s,a,r,o)}Lt(e,p,m);return;case`option`:for(var h in n)if(p=n[h],n.hasOwnProperty(h)&&p!=null&&!r.hasOwnProperty(h))switch(h){case`selected`:e.selected=!1;break;default:Md(e,t,h,null,r,p)}for(l in r)if(p=r[l],m=n[l],r.hasOwnProperty(l)&&p!==m&&(p!=null||m!=null))switch(l){case`selected`:e.selected=p&&typeof p!=`function`&&typeof p!=`symbol`;break;default:Md(e,t,l,p,r,m)}return;case`img`:case`link`:case`area`:case`base`:case`br`:case`col`:case`embed`:case`hr`:case`keygen`:case`meta`:case`param`:case`source`:case`track`:case`wbr`:case`menuitem`:for(var g in n)p=n[g],n.hasOwnProperty(g)&&p!=null&&!r.hasOwnProperty(g)&&Md(e,t,g,null,r,p);for(u in r)if(p=r[u],m=n[u],r.hasOwnProperty(u)&&p!==m&&(p!=null||m!=null))switch(u){case`children`:case`dangerouslySetInnerHTML`:if(p!=null)throw Error(i(137,t));break;default:Md(e,t,u,p,r,m)}return;default:if(Ut(t)){for(var _ in n)p=n[_],n.hasOwnProperty(_)&&p!==void 0&&!r.hasOwnProperty(_)&&Nd(e,t,_,void 0,r,p);for(d in r)p=r[d],m=n[d],!r.hasOwnProperty(d)||p===m||p===void 0&&m===void 0||Nd(e,t,d,p,r,m);return}}for(var v in n)p=n[v],n.hasOwnProperty(v)&&p!=null&&!r.hasOwnProperty(v)&&Md(e,t,v,null,r,p);for(f in r)p=r[f],m=n[f],!r.hasOwnProperty(f)||p===m||p==null&&m==null||Md(e,t,f,p,r,m)}function Id(e){switch(e){case`css`:case`script`:case`font`:case`img`:case`image`:case`input`:case`link`:return!0;default:return!1}}function Ld(){if(typeof performance.getEntriesByType==`function`){for(var e=0,t=0,n=performance.getEntriesByType(`resource`),r=0;r<n.length;r++){var i=n[r],a=i.transferSize,o=i.initiatorType,s=i.duration;if(a&&s&&Id(o)){for(o=0,s=i.responseEnd,r+=1;r<n.length;r++){var c=n[r],l=c.startTime;if(l>s)break;var u=c.transferSize,d=c.initiatorType;u&&Id(d)&&(c=c.responseEnd,o+=u*(c<s?1:(s-l)/(c-l)))}if(--r,t+=8*(a+o)/(i.duration/1e3),e++,10<e)break}}if(0<e)return t/e/1e6}return navigator.connection&&(e=navigator.connection.downlink,typeof e==`number`)?e:5}var Rd=null,zd=null;function Bd(e){return e.nodeType===9?e:e.ownerDocument}function Vd(e){switch(e){case`http://www.w3.org/2000/svg`:return 1;case`http://www.w3.org/1998/Math/MathML`:return 2;default:return 0}}function Hd(e,t){if(e===0)switch(t){case`svg`:return 1;case`math`:return 2;default:return 0}return e===1&&t===`foreignObject`?0:e}function Ud(e,t){return e===`textarea`||e===`noscript`||typeof t.children==`string`||typeof t.children==`number`||typeof t.children==`bigint`||typeof t.dangerouslySetInnerHTML==`object`&&t.dangerouslySetInnerHTML!==null&&t.dangerouslySetInnerHTML.__html!=null}var Wd=null;function Gd(){var e=window.event;return e&&e.type===`popstate`?e!==Wd&&(Wd=e,!0):(Wd=null,!1)}var Kd=typeof setTimeout==`function`?setTimeout:void 0,qd=typeof clearTimeout==`function`?clearTimeout:void 0,Jd=typeof Promise==`function`?Promise:void 0,Yd=typeof queueMicrotask==`function`?queueMicrotask:Jd===void 0?Kd:function(e){return Jd.resolve(null).then(e).catch(Xd)};function Xd(e){setTimeout(function(){throw e})}function Zd(e){return e===`head`}function Qd(e,t){var n=t,r=0;do{var i=n.nextSibling;if(e.removeChild(n),i&&i.nodeType===8){if(n=i.data,n===`/$`||n===`/&`){if(r===0){e.removeChild(i),Np(t);return}r--}else if(n===`$`||n===`$?`||n===`$~`||n===`$!`||n===`&`)r++;else if(n===`html`)pf(e.ownerDocument.documentElement);else if(n===`head`){n=e.ownerDocument.head,pf(n);for(var a=n.firstChild;a;){var o=a.nextSibling,s=a.nodeName;a[ct]||s===`SCRIPT`||s===`STYLE`||s===`LINK`&&a.rel.toLowerCase()===`stylesheet`||n.removeChild(a),a=o}}else n===`body`&&pf(e.ownerDocument.body)}n=i}while(n);Np(t)}function $d(e,t){var n=e;e=0;do{var r=n.nextSibling;if(n.nodeType===1?t?(n._stashedDisplay=n.style.display,n.style.display=`none`):(n.style.display=n._stashedDisplay||``,n.getAttribute(`style`)===``&&n.removeAttribute(`style`)):n.nodeType===3&&(t?(n._stashedText=n.nodeValue,n.nodeValue=``):n.nodeValue=n._stashedText||``),r&&r.nodeType===8){if(n=r.data,n===`/$`){if(e===0)break;e--}else n!==`$`&&n!==`$?`&&n!==`$~`&&n!==`$!`||e++}n=r}while(n)}function ef(e){var t=e.firstChild;for(t&&t.nodeType===10&&(t=t.nextSibling);t;){var n=t;switch(t=t.nextSibling,n.nodeName){case`HTML`:case`HEAD`:case`BODY`:ef(n),lt(n);continue;case`SCRIPT`:case`STYLE`:continue;case`LINK`:if(n.rel.toLowerCase()===`stylesheet`)continue}e.removeChild(n)}}function tf(e,t,n,r){for(;e.nodeType===1;){var i=n;if(e.nodeName.toLowerCase()!==t.toLowerCase()){if(!r&&(e.nodeName!==`INPUT`||e.type!==`hidden`))break}else if(!r){if(t===`input`&&e.type===`hidden`){var a=i.name==null?null:``+i.name;if(i.type===`hidden`&&e.getAttribute(`name`)===a)return e}else return e}else if(!e[ct])switch(t){case`meta`:if(!e.hasAttribute(`itemprop`))break;return e;case`link`:if(a=e.getAttribute(`rel`),a===`stylesheet`&&e.hasAttribute(`data-precedence`)||a!==i.rel||e.getAttribute(`href`)!==(i.href==null||i.href===``?null:i.href)||e.getAttribute(`crossorigin`)!==(i.crossOrigin==null?null:i.crossOrigin)||e.getAttribute(`title`)!==(i.title==null?null:i.title))break;return e;case`style`:if(e.hasAttribute(`data-precedence`))break;return e;case`script`:if(a=e.getAttribute(`src`),(a!==(i.src==null?null:i.src)||e.getAttribute(`type`)!==(i.type==null?null:i.type)||e.getAttribute(`crossorigin`)!==(i.crossOrigin==null?null:i.crossOrigin))&&a&&e.hasAttribute(`async`)&&!e.hasAttribute(`itemprop`))break;return e;default:return e}if(e=cf(e.nextSibling),e===null)break}return null}function nf(e,t,n){if(t===``)return null;for(;e.nodeType!==3;)if((e.nodeType!==1||e.nodeName!==`INPUT`||e.type!==`hidden`)&&!n||(e=cf(e.nextSibling),e===null))return null;return e}function rf(e,t){for(;e.nodeType!==8;)if((e.nodeType!==1||e.nodeName!==`INPUT`||e.type!==`hidden`)&&!t||(e=cf(e.nextSibling),e===null))return null;return e}function af(e){return e.data===`$?`||e.data===`$~`}function of(e){return e.data===`$!`||e.data===`$?`&&e.ownerDocument.readyState!==`loading`}function sf(e,t){var n=e.ownerDocument;if(e.data===`$~`)e._reactRetry=t;else if(e.data!==`$?`||n.readyState!==`loading`)t();else{var r=function(){t(),n.removeEventListener(`DOMContentLoaded`,r)};n.addEventListener(`DOMContentLoaded`,r),e._reactRetry=r}}function cf(e){for(;e!=null;e=e.nextSibling){var t=e.nodeType;if(t===1||t===3)break;if(t===8){if(t=e.data,t===`$`||t===`$!`||t===`$?`||t===`$~`||t===`&`||t===`F!`||t===`F`)break;if(t===`/$`||t===`/&`)return null}}return e}var lf=null;function uf(e){e=e.nextSibling;for(var t=0;e;){if(e.nodeType===8){var n=e.data;if(n===`/$`||n===`/&`){if(t===0)return cf(e.nextSibling);t--}else n!==`$`&&n!==`$!`&&n!==`$?`&&n!==`$~`&&n!==`&`||t++}e=e.nextSibling}return null}function df(e){e=e.previousSibling;for(var t=0;e;){if(e.nodeType===8){var n=e.data;if(n===`$`||n===`$!`||n===`$?`||n===`$~`||n===`&`){if(t===0)return e;t--}else n!==`/$`&&n!==`/&`||t++}e=e.previousSibling}return null}function ff(e,t,n){switch(t=Bd(n),e){case`html`:if(e=t.documentElement,!e)throw Error(i(452));return e;case`head`:if(e=t.head,!e)throw Error(i(453));return e;case`body`:if(e=t.body,!e)throw Error(i(454));return e;default:throw Error(i(451))}}function pf(e){for(var t=e.attributes;t.length;)e.removeAttributeNode(t[0]);lt(e)}var mf=new Map,hf=new Set;function gf(e){return typeof e.getRootNode==`function`?e.getRootNode():e.nodeType===9?e:e.ownerDocument}var _f=F.d;F.d={f:vf,r:yf,D:Sf,C:Cf,L:wf,m:Tf,X:Df,S:Ef,M:Of};function vf(){var e=_f.f(),t=_u();return e||t}function yf(e){var t=dt(e);t!==null&&t.tag===5&&t.type===`form`?ys(t):_f.r(e)}var bf=typeof document>`u`?null:document;function xf(e,t,n){var r=bf;if(r&&typeof t==`string`&&t){var i=Mt(t);i=`link[rel="`+e+`"][href="`+i+`"]`,typeof n==`string`&&(i+=`[crossorigin="`+n+`"]`),hf.has(i)||(hf.add(i),e={rel:e,crossOrigin:n,href:t},r.querySelector(i)===null&&(t=r.createElement(`link`),Pd(t,`link`,e),mt(t),r.head.appendChild(t)))}}function Sf(e){_f.D(e),xf(`dns-prefetch`,e,null)}function Cf(e,t){_f.C(e,t),xf(`preconnect`,e,t)}function wf(e,t,n){_f.L(e,t,n);var r=bf;if(r&&e&&t){var i=`link[rel="preload"][as="`+Mt(t)+`"]`;t===`image`&&n&&n.imageSrcSet?(i+=`[imagesrcset="`+Mt(n.imageSrcSet)+`"]`,typeof n.imageSizes==`string`&&(i+=`[imagesizes="`+Mt(n.imageSizes)+`"]`)):i+=`[href="`+Mt(e)+`"]`;var a=i;switch(t){case`style`:a=Af(e);break;case`script`:a=Pf(e)}mf.has(a)||(e=p({rel:`preload`,href:t===`image`&&n&&n.imageSrcSet?void 0:e,as:t},n),mf.set(a,e),r.querySelector(i)!==null||t===`style`&&r.querySelector(jf(a))||t===`script`&&r.querySelector(Ff(a))||(t=r.createElement(`link`),Pd(t,`link`,e),mt(t),r.head.appendChild(t)))}}function Tf(e,t){_f.m(e,t);var n=bf;if(n&&e){var r=t&&typeof t.as==`string`?t.as:`script`,i=`link[rel="modulepreload"][as="`+Mt(r)+`"][href="`+Mt(e)+`"]`,a=i;switch(r){case`audioworklet`:case`paintworklet`:case`serviceworker`:case`sharedworker`:case`worker`:case`script`:a=Pf(e)}if(!mf.has(a)&&(e=p({rel:`modulepreload`,href:e},t),mf.set(a,e),n.querySelector(i)===null)){switch(r){case`audioworklet`:case`paintworklet`:case`serviceworker`:case`sharedworker`:case`worker`:case`script`:if(n.querySelector(Ff(a)))return}r=n.createElement(`link`),Pd(r,`link`,e),mt(r),n.head.appendChild(r)}}}function Ef(e,t,n){_f.S(e,t,n);var r=bf;if(r&&e){var i=pt(r).hoistableStyles,a=Af(e);t=t||`default`;var o=i.get(a);if(!o){var s={loading:0,preload:null};if(o=r.querySelector(jf(a)))s.loading=5;else{e=p({rel:`stylesheet`,href:e,"data-precedence":t},n),(n=mf.get(a))&&Rf(e,n);var c=o=r.createElement(`link`);mt(c),Pd(c,`link`,e),c._p=new Promise(function(e,t){c.onload=e,c.onerror=t}),c.addEventListener(`load`,function(){s.loading|=1}),c.addEventListener(`error`,function(){s.loading|=2}),s.loading|=4,Lf(o,t,r)}o={type:`stylesheet`,instance:o,count:1,state:s},i.set(a,o)}}}function Df(e,t){_f.X(e,t);var n=bf;if(n&&e){var r=pt(n).hoistableScripts,i=Pf(e),a=r.get(i);a||(a=n.querySelector(Ff(i)),a||(e=p({src:e,async:!0},t),(t=mf.get(i))&&zf(e,t),a=n.createElement(`script`),mt(a),Pd(a,`link`,e),n.head.appendChild(a)),a={type:`script`,instance:a,count:1,state:null},r.set(i,a))}}function Of(e,t){_f.M(e,t);var n=bf;if(n&&e){var r=pt(n).hoistableScripts,i=Pf(e),a=r.get(i);a||(a=n.querySelector(Ff(i)),a||(e=p({src:e,async:!0,type:`module`},t),(t=mf.get(i))&&zf(e,t),a=n.createElement(`script`),mt(a),Pd(a,`link`,e),n.head.appendChild(a)),a={type:`script`,instance:a,count:1,state:null},r.set(i,a))}}function kf(e,t,n,r){var a=(a=ae.current)?gf(a):null;if(!a)throw Error(i(446));switch(e){case`meta`:case`title`:return null;case`style`:return typeof n.precedence==`string`&&typeof n.href==`string`?(t=Af(n.href),n=pt(a).hoistableStyles,r=n.get(t),r||(r={type:`style`,instance:null,count:0,state:null},n.set(t,r)),r):{type:`void`,instance:null,count:0,state:null};case`link`:if(n.rel===`stylesheet`&&typeof n.href==`string`&&typeof n.precedence==`string`){e=Af(n.href);var o=pt(a).hoistableStyles,s=o.get(e);if(s||(a=a.ownerDocument||a,s={type:`stylesheet`,instance:null,count:0,state:{loading:0,preload:null}},o.set(e,s),(o=a.querySelector(jf(e)))&&!o._p&&(s.instance=o,s.state.loading=5),mf.has(e)||(n={rel:`preload`,as:`style`,href:n.href,crossOrigin:n.crossOrigin,integrity:n.integrity,media:n.media,hrefLang:n.hrefLang,referrerPolicy:n.referrerPolicy},mf.set(e,n),o||Nf(a,e,n,s.state))),t&&r===null)throw Error(i(528,``));return s}if(t&&r!==null)throw Error(i(529,``));return null;case`script`:return t=n.async,n=n.src,typeof n==`string`&&t&&typeof t!=`function`&&typeof t!=`symbol`?(t=Pf(n),n=pt(a).hoistableScripts,r=n.get(t),r||(r={type:`script`,instance:null,count:0,state:null},n.set(t,r)),r):{type:`void`,instance:null,count:0,state:null};default:throw Error(i(444,e))}}function Af(e){return`href="`+Mt(e)+`"`}function jf(e){return`link[rel="stylesheet"][`+e+`]`}function Mf(e){return p({},e,{"data-precedence":e.precedence,precedence:null})}function Nf(e,t,n,r){e.querySelector(`link[rel="preload"][as="style"][`+t+`]`)?r.loading=1:(t=e.createElement(`link`),r.preload=t,t.addEventListener(`load`,function(){return r.loading|=1}),t.addEventListener(`error`,function(){return r.loading|=2}),Pd(t,`link`,n),mt(t),e.head.appendChild(t))}function Pf(e){return`[src="`+Mt(e)+`"]`}function Ff(e){return`script[async]`+e}function If(e,t,n){if(t.count++,t.instance===null)switch(t.type){case`style`:var r=e.querySelector(`style[data-href~="`+Mt(n.href)+`"]`);if(r)return t.instance=r,mt(r),r;var a=p({},n,{"data-href":n.href,"data-precedence":n.precedence,href:null,precedence:null});return r=(e.ownerDocument||e).createElement(`style`),mt(r),Pd(r,`style`,a),Lf(r,n.precedence,e),t.instance=r;case`stylesheet`:a=Af(n.href);var o=e.querySelector(jf(a));if(o)return t.state.loading|=4,t.instance=o,mt(o),o;r=Mf(n),(a=mf.get(a))&&Rf(r,a),o=(e.ownerDocument||e).createElement(`link`),mt(o);var s=o;return s._p=new Promise(function(e,t){s.onload=e,s.onerror=t}),Pd(o,`link`,r),t.state.loading|=4,Lf(o,n.precedence,e),t.instance=o;case`script`:return o=Pf(n.src),(a=e.querySelector(Ff(o)))?(t.instance=a,mt(a),a):(r=n,(a=mf.get(o))&&(r=p({},n),zf(r,a)),e=e.ownerDocument||e,a=e.createElement(`script`),mt(a),Pd(a,`link`,r),e.head.appendChild(a),t.instance=a);case`void`:return null;default:throw Error(i(443,t.type))}else t.type===`stylesheet`&&!(t.state.loading&4)&&(r=t.instance,t.state.loading|=4,Lf(r,n.precedence,e));return t.instance}function Lf(e,t,n){for(var r=n.querySelectorAll(`link[rel="stylesheet"][data-precedence],style[data-precedence]`),i=r.length?r[r.length-1]:null,a=i,o=0;o<r.length;o++){var s=r[o];if(s.dataset.precedence===t)a=s;else if(a!==i)break}a?a.parentNode.insertBefore(e,a.nextSibling):(t=n.nodeType===9?n.head:n,t.insertBefore(e,t.firstChild))}function Rf(e,t){e.crossOrigin??(e.crossOrigin=t.crossOrigin),e.referrerPolicy??(e.referrerPolicy=t.referrerPolicy),e.title??(e.title=t.title)}function zf(e,t){e.crossOrigin??(e.crossOrigin=t.crossOrigin),e.referrerPolicy??(e.referrerPolicy=t.referrerPolicy),e.integrity??(e.integrity=t.integrity)}var Bf=null;function Vf(e,t,n){if(Bf===null){var r=new Map,i=Bf=new Map;i.set(n,r)}else i=Bf,r=i.get(n),r||(r=new Map,i.set(n,r));if(r.has(e))return r;for(r.set(e,null),n=n.getElementsByTagName(e),i=0;i<n.length;i++){var a=n[i];if(!(a[ct]||a[tt]||e===`link`&&a.getAttribute(`rel`)===`stylesheet`)&&a.namespaceURI!==`http://www.w3.org/2000/svg`){var o=a.getAttribute(t)||``;o=e+o;var s=r.get(o);s?s.push(a):r.set(o,[a])}}return r}function Hf(e,t,n){e=e.ownerDocument||e,e.head.insertBefore(n,t===`title`?e.querySelector(`head > title`):null)}function Uf(e,t,n){if(n===1||t.itemProp!=null)return!1;switch(e){case`meta`:case`title`:return!0;case`style`:if(typeof t.precedence!=`string`||typeof t.href!=`string`||t.href===``)break;return!0;case`link`:if(typeof t.rel!=`string`||typeof t.href!=`string`||t.href===``||t.onLoad||t.onError)break;switch(t.rel){case`stylesheet`:return e=t.disabled,typeof t.precedence==`string`&&e==null;default:return!0}case`script`:if(t.async&&typeof t.async!=`function`&&typeof t.async!=`symbol`&&!t.onLoad&&!t.onError&&t.src&&typeof t.src==`string`)return!0}return!1}function Wf(e){return!(e.type===`stylesheet`&&!(e.state.loading&3))}function Gf(e,t,n,r){if(n.type===`stylesheet`&&(typeof r.media!=`string`||!1!==matchMedia(r.media).matches)&&!(n.state.loading&4)){if(n.instance===null){var i=Af(r.href),a=t.querySelector(jf(i));if(a){t=a._p,typeof t==`object`&&t&&typeof t.then==`function`&&(e.count++,e=Jf.bind(e),t.then(e,e)),n.state.loading|=4,n.instance=a,mt(a);return}a=t.ownerDocument||t,r=Mf(r),(i=mf.get(i))&&Rf(r,i),a=a.createElement(`link`),mt(a);var o=a;o._p=new Promise(function(e,t){o.onload=e,o.onerror=t}),Pd(a,`link`,r),n.instance=a}e.stylesheets===null&&(e.stylesheets=new Map),e.stylesheets.set(n,t),(t=n.state.preload)&&!(n.state.loading&3)&&(e.count++,n=Jf.bind(e),t.addEventListener(`load`,n),t.addEventListener(`error`,n))}}var Kf=0;function qf(e,t){return e.stylesheets&&e.count===0&&Xf(e,e.stylesheets),0<e.count||0<e.imgCount?function(n){var r=setTimeout(function(){if(e.stylesheets&&Xf(e,e.stylesheets),e.unsuspend){var t=e.unsuspend;e.unsuspend=null,t()}},6e4+t);0<e.imgBytes&&Kf===0&&(Kf=62500*Ld());var i=setTimeout(function(){if(e.waitingForImages=!1,e.count===0&&(e.stylesheets&&Xf(e,e.stylesheets),e.unsuspend)){var t=e.unsuspend;e.unsuspend=null,t()}},(e.imgBytes>Kf?50:800)+t);return e.unsuspend=n,function(){e.unsuspend=null,clearTimeout(r),clearTimeout(i)}}:null}function Jf(){if(this.count--,this.count===0&&(this.imgCount===0||!this.waitingForImages)){if(this.stylesheets)Xf(this,this.stylesheets);else if(this.unsuspend){var e=this.unsuspend;this.unsuspend=null,e()}}}var Yf=null;function Xf(e,t){e.stylesheets=null,e.unsuspend!==null&&(e.count++,Yf=new Map,t.forEach(Zf,e),Yf=null,Jf.call(e))}function Zf(e,t){if(!(t.state.loading&4)){var n=Yf.get(e);if(n)var r=n.get(null);else{n=new Map,Yf.set(e,n);for(var i=e.querySelectorAll(`link[data-precedence],style[data-precedence]`),a=0;a<i.length;a++){var o=i[a];(o.nodeName===`LINK`||o.getAttribute(`media`)!==`not all`)&&(n.set(o.dataset.precedence,o),r=o)}r&&n.set(null,r)}i=t.instance,o=i.getAttribute(`data-precedence`),a=n.get(o)||r,a===r&&n.set(null,i),n.set(o,i),this.count++,r=Jf.bind(this),i.addEventListener(`load`,r),i.addEventListener(`error`,r),a?a.parentNode.insertBefore(i,a.nextSibling):(e=e.nodeType===9?e.head:e,e.insertBefore(i,e.firstChild)),t.state.loading|=4}}var Qf={$$typeof:C,Provider:null,Consumer:null,_currentValue:I,_currentValue2:I,_threadCount:0};function $f(e,t,n,r,i,a,o,s,c){this.tag=1,this.containerInfo=e,this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.next=this.pendingContext=this.context=this.cancelPendingCommit=null,this.callbackPriority=0,this.expirationTimes=We(-1),this.entangledLanes=this.shellSuspendCounter=this.errorRecoveryDisabledLanes=this.expiredLanes=this.warmLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=We(0),this.hiddenUpdates=We(null),this.identifierPrefix=r,this.onUncaughtError=i,this.onCaughtError=a,this.onRecoverableError=o,this.pooledCache=null,this.pooledCacheLanes=0,this.formState=c,this.incompleteTransitions=new Map}function ep(e,t,n,r,i,a,o,s,c,l,u,d){return e=new $f(e,t,n,o,c,l,u,d,s),t=1,!0===a&&(t|=24),a=ti(3,null,null,t),e.current=a,a.stateNode=e,t=ta(),t.refCount++,e.pooledCache=t,t.refCount++,a.memoizedState={element:r,isDehydrated:n,cache:t},Pa(a),e}function tp(e){return e?(e=$r,e):$r}function np(e,t,n,r,i,a){i=tp(i),r.context===null?r.context=i:r.pendingContext=i,r=Ia(t),r.payload={element:n},a=a===void 0?null:a,a!==null&&(r.callback=a),n=La(e,r,t),n!==null&&(fu(n,e,t),Ra(n,e,t))}function rp(e,t){if(e=e.memoizedState,e!==null&&e.dehydrated!==null){var n=e.retryLane;e.retryLane=n!==0&&n<t?n:t}}function ip(e,t){rp(e,t),(e=e.alternate)&&rp(e,t)}function ap(e){if(e.tag===13||e.tag===31){var t=Xr(e,67108864);t!==null&&fu(t,e,67108864),ip(e,67108864)}}function op(e){if(e.tag===13||e.tag===31){var t=uu();t=Xe(t);var n=Xr(e,t);n!==null&&fu(n,e,t),ip(e,t)}}var sp=!0;function cp(e,t,n,r){var i=P.T;P.T=null;var a=F.p;try{F.p=2,up(e,t,n,r)}finally{F.p=a,P.T=i}}function lp(e,t,n,r){var i=P.T;P.T=null;var a=F.p;try{F.p=8,up(e,t,n,r)}finally{F.p=a,P.T=i}}function up(e,t,n,r){if(sp){var i=dp(r);if(i===null)Cd(e,t,r,fp,n),Cp(e,r);else if(Tp(i,e,t,n,r))r.stopPropagation();else if(Cp(e,r),t&4&&-1<Sp.indexOf(e)){for(;i!==null;){var a=dt(i);if(a!==null)switch(a.tag){case 3:if(a=a.stateNode,a.current.memoizedState.isDehydrated){var o=ze(a.pendingLanes);if(o!==0){var s=a;for(s.pendingLanes|=2,s.entangledLanes|=2;o;){var c=1<<31-Me(o);s.entanglements[1]|=c,o&=~c}td(a),!(Ml&6)&&(Ql=be()+500,nd(0,!1))}}break;case 31:case 13:s=Xr(a,2),s!==null&&fu(s,a,2),_u(),ip(a,2)}if(a=dp(r),a===null&&Cd(e,t,r,fp,n),a===i)break;i=a}i!==null&&r.stopPropagation()}else Cd(e,t,r,null,n)}}function dp(e){return e=Yt(e),pp(e)}var fp=null;function pp(e){if(fp=null,e=ut(e),e!==null){var t=o(e);if(t===null)e=null;else{var n=t.tag;if(n===13){if(e=s(t),e!==null)return e;e=null}else if(n===31){if(e=c(t),e!==null)return e;e=null}else if(n===3){if(t.stateNode.current.memoizedState.isDehydrated)return t.tag===3?t.stateNode.containerInfo:null;e=null}else t!==e&&(e=null)}}return fp=e,null}function mp(e){switch(e){case`beforetoggle`:case`cancel`:case`click`:case`close`:case`contextmenu`:case`copy`:case`cut`:case`auxclick`:case`dblclick`:case`dragend`:case`dragstart`:case`drop`:case`focusin`:case`focusout`:case`input`:case`invalid`:case`keydown`:case`keypress`:case`keyup`:case`mousedown`:case`mouseup`:case`paste`:case`pause`:case`play`:case`pointercancel`:case`pointerdown`:case`pointerup`:case`ratechange`:case`reset`:case`resize`:case`seeked`:case`submit`:case`toggle`:case`touchcancel`:case`touchend`:case`touchstart`:case`volumechange`:case`change`:case`selectionchange`:case`textInput`:case`compositionstart`:case`compositionend`:case`compositionupdate`:case`beforeblur`:case`afterblur`:case`beforeinput`:case`blur`:case`fullscreenchange`:case`focus`:case`hashchange`:case`popstate`:case`select`:case`selectstart`:return 2;case`drag`:case`dragenter`:case`dragexit`:case`dragleave`:case`dragover`:case`mousemove`:case`mouseout`:case`mouseover`:case`pointermove`:case`pointerout`:case`pointerover`:case`scroll`:case`touchmove`:case`wheel`:case`mouseenter`:case`mouseleave`:case`pointerenter`:case`pointerleave`:return 8;case`message`:switch(xe()){case Se:return 2;case Ce:return 8;case we:case Te:return 32;case Ee:return 268435456;default:return 32}default:return 32}}var hp=!1,gp=null,_p=null,vp=null,yp=new Map,bp=new Map,xp=[],Sp=`mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset`.split(` `);function Cp(e,t){switch(e){case`focusin`:case`focusout`:gp=null;break;case`dragenter`:case`dragleave`:_p=null;break;case`mouseover`:case`mouseout`:vp=null;break;case`pointerover`:case`pointerout`:yp.delete(t.pointerId);break;case`gotpointercapture`:case`lostpointercapture`:bp.delete(t.pointerId)}}function wp(e,t,n,r,i,a){return e===null||e.nativeEvent!==a?(e={blockedOn:t,domEventName:n,eventSystemFlags:r,nativeEvent:a,targetContainers:[i]},t!==null&&(t=dt(t),t!==null&&ap(t)),e):(e.eventSystemFlags|=r,t=e.targetContainers,i!==null&&t.indexOf(i)===-1&&t.push(i),e)}function Tp(e,t,n,r,i){switch(t){case`focusin`:return gp=wp(gp,e,t,n,r,i),!0;case`dragenter`:return _p=wp(_p,e,t,n,r,i),!0;case`mouseover`:return vp=wp(vp,e,t,n,r,i),!0;case`pointerover`:var a=i.pointerId;return yp.set(a,wp(yp.get(a)||null,e,t,n,r,i)),!0;case`gotpointercapture`:return a=i.pointerId,bp.set(a,wp(bp.get(a)||null,e,t,n,r,i)),!0}return!1}function Ep(e){var t=ut(e.target);if(t!==null){var n=o(t);if(n!==null){if(t=n.tag,t===13){if(t=s(n),t!==null){e.blockedOn=t,$e(e.priority,function(){op(n)});return}}else if(t===31){if(t=c(n),t!==null){e.blockedOn=t,$e(e.priority,function(){op(n)});return}}else if(t===3&&n.stateNode.current.memoizedState.isDehydrated){e.blockedOn=n.tag===3?n.stateNode.containerInfo:null;return}}}e.blockedOn=null}function Dp(e){if(e.blockedOn!==null)return!1;for(var t=e.targetContainers;0<t.length;){var n=dp(e.nativeEvent);if(n===null){n=e.nativeEvent;var r=new n.constructor(n.type,n);Jt=r,n.target.dispatchEvent(r),Jt=null}else return t=dt(n),t!==null&&ap(t),e.blockedOn=n,!1;t.shift()}return!0}function Op(e,t,n){Dp(e)&&n.delete(t)}function kp(){hp=!1,gp!==null&&Dp(gp)&&(gp=null),_p!==null&&Dp(_p)&&(_p=null),vp!==null&&Dp(vp)&&(vp=null),yp.forEach(Op),bp.forEach(Op)}function Ap(e,n){e.blockedOn===n&&(e.blockedOn=null,hp||(hp=!0,t.unstable_scheduleCallback(t.unstable_NormalPriority,kp)))}var jp=null;function Mp(e){jp!==e&&(jp=e,t.unstable_scheduleCallback(t.unstable_NormalPriority,function(){jp===e&&(jp=null);for(var t=0;t<e.length;t+=3){var n=e[t],r=e[t+1],i=e[t+2];if(typeof r!=`function`){if(pp(r||n)===null)continue;break}var a=dt(n);a!==null&&(e.splice(t,3),t-=3,vs(a,{pending:!0,data:i,method:n.method,action:r},r,i))}}))}function Np(e){function t(t){return Ap(t,e)}gp!==null&&Ap(gp,e),_p!==null&&Ap(_p,e),vp!==null&&Ap(vp,e),yp.forEach(t),bp.forEach(t);for(var n=0;n<xp.length;n++){var r=xp[n];r.blockedOn===e&&(r.blockedOn=null)}for(;0<xp.length&&(n=xp[0],n.blockedOn===null);)Ep(n),n.blockedOn===null&&xp.shift();if(n=(e.ownerDocument||e).$$reactFormReplay,n!=null)for(r=0;r<n.length;r+=3){var i=n[r],a=n[r+1],o=i[nt]||null;if(typeof a==`function`)o||Mp(n);else if(o){var s=null;if(a&&a.hasAttribute(`formAction`)){if(i=a,o=a[nt]||null)s=o.formAction;else if(pp(i)!==null)continue}else s=o.action;typeof s==`function`?n[r+1]=s:(n.splice(r,3),r-=3),Mp(n)}}}function Pp(){function e(e){e.canIntercept&&e.info===`react-transition`&&e.intercept({handler:function(){return new Promise(function(e){return i=e})},focusReset:`manual`,scroll:`manual`})}function t(){i!==null&&(i(),i=null),r||setTimeout(n,20)}function n(){if(!r&&!navigation.transition){var e=navigation.currentEntry;e&&e.url!=null&&navigation.navigate(e.url,{state:e.getState(),info:`react-transition`,history:`replace`})}}if(typeof navigation==`object`){var r=!1,i=null;return navigation.addEventListener(`navigate`,e),navigation.addEventListener(`navigatesuccess`,t),navigation.addEventListener(`navigateerror`,t),setTimeout(n,100),function(){r=!0,navigation.removeEventListener(`navigate`,e),navigation.removeEventListener(`navigatesuccess`,t),navigation.removeEventListener(`navigateerror`,t),i!==null&&(i(),i=null)}}}function Fp(e){this._internalRoot=e}Ip.prototype.render=Fp.prototype.render=function(e){var t=this._internalRoot;if(t===null)throw Error(i(409));var n=t.current;np(n,uu(),e,t,null,null)},Ip.prototype.unmount=Fp.prototype.unmount=function(){var e=this._internalRoot;if(e!==null){this._internalRoot=null;var t=e.containerInfo;np(e.current,2,null,e,null,null),_u(),t[rt]=null}};function Ip(e){this._internalRoot=e}Ip.prototype.unstable_scheduleHydration=function(e){if(e){var t=Qe();e={blockedOn:null,target:e,priority:t};for(var n=0;n<xp.length&&t!==0&&t<xp[n].priority;n++);xp.splice(n,0,e),n===0&&Ep(e)}};var Lp=n.version;if(Lp!==`19.2.0`)throw Error(i(527,Lp,`19.2.0`));F.findDOMNode=function(e){var t=e._reactInternals;if(t===void 0)throw typeof e.render==`function`?Error(i(188)):(e=Object.keys(e).join(`,`),Error(i(268,e)));return e=u(t),e=e===null?null:d(e),e=e===null?null:e.stateNode,e};var Rp={bundleType:0,version:`19.2.0`,rendererPackageName:`react-dom`,currentDispatcherRef:P,reconcilerVersion:`19.2.0`};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<`u`){var zp=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!zp.isDisabled&&zp.supportsFiber)try{ke=zp.inject(Rp),Ae=zp}catch{}}e.createRoot=function(e,t){if(!a(e))throw Error(i(299));var n=!1,r=``,o=Rs,s=zs,c=Bs;return t!=null&&(!0===t.unstable_strictMode&&(n=!0),t.identifierPrefix!==void 0&&(r=t.identifierPrefix),t.onUncaughtError!==void 0&&(o=t.onUncaughtError),t.onCaughtError!==void 0&&(s=t.onCaughtError),t.onRecoverableError!==void 0&&(c=t.onRecoverableError)),t=ep(e,1,!1,null,null,n,r,null,o,s,c,Pp),e[rt]=t.current,xd(e),new Fp(t)}})),v=s(((e,t)=>{function n(){if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<`u`&&typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE==`function`)try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(n)}catch(e){console.error(e)}}n(),t.exports=_()})),y=u(m()),b=v(),x={requestClose:()=>{},dbg:!1};function S(e){x={...x,...e}}function C(){return x}var w=`/images/tactical_ops`,T=`${w}/alpha.png`,E=`${w}/alpha-attack.png`,D=`${w}/alpha-portrait.jpg`,O={id:`broken-signal`,name:`BROKEN SIGNAL`,objective:`Eliminate the hostile force and secure the tactical sector.`},k={alpha:{defId:`alpha`,name:`ALPHA`,team:`ally`,role:`alpha`,hp:120,atk:28,def:12,spd:14,move:3,sprite:T,attackSprite:E,portrait:D,skillIds:[`alpha-strike`,`alpha-rend`,`alpha-howl`]},"ally-02":{defId:`ally-02`,name:`CNC`,team:`ally`,role:`skirmisher`,hp:96,atk:22,def:8,spd:12,move:2,sprite:`${w}/cnc_map_unit.webp`,portrait:`${w}/cnc_portrait.webp`,skillIds:[`u02-shot`,`u02-burst`,`u02-suppress`]},"ally-03":{defId:`ally-03`,name:`SHADOW`,team:`ally`,role:`support`,hp:100,atk:16,def:10,spd:10,move:2,sprite:`${w}/ally03.png`,portrait:`${w}/ally03.png`,skillIds:[`u03-tap`,`u03-mend`,`u03-pack`]},hostile:{defId:`hostile`,name:`HOUND MK-2`,team:`enemy`,role:`hostile`,hp:68,atk:16,def:8,spd:11,move:2,sprite:`${w}/hound.png`,portrait:`${w}/hound.png`,skillIds:[`hostile-strike`,`hostile-maul`]},leader:{defId:`leader`,name:`BRUTE LEADER`,team:`enemy`,role:`leader`,hp:148,atk:24,def:14,spd:9,move:2,sprite:`${w}/leader.png`,portrait:`${w}/leader.png`,skillIds:[`leader-strike`,`leader-crush`,`leader-intimidate`]}},ee=[{defId:`alpha`,id:`alpha`,c:2,r:2},{defId:`ally-02`,id:`ally-02`,c:1,r:0},{defId:`ally-03`,id:`ally-03`,c:1,r:4},{defId:`hostile`,id:`h1`,c:5,r:0},{defId:`hostile`,id:`h2`,c:5,r:3},{defId:`hostile`,id:`h3`,c:6,r:4},{defId:`leader`,id:`leader`,c:6,r:2}],A={"rapid-recovery":{name:`Rapid Recovery`,objective:`Recover the signal and win by round 4.`,missions:[`field-relay-recovery`]},"hold-together":{name:`Hold Together`,objective:`Hold the relay and win with all three allies standing.`,missions:[`field-relay-hold`,`field-isolated-hold`]},"cut-the-line":{name:`Cut the Line`,objective:`Stop the courier and win without using a healing ability.`,missions:[`field-relay-intercept`]}},j=`Field Tested`,te=`Range 1 → 2 · Direct hit 145% → 105% · Same Bleed`,M=e=>A[e].name;function N(e){for(let t of Object.keys(A)){let n=A[t];if(n.missions.includes(e))return{id:t,...n}}return null}function P(e){return typeof e==`string`&&Object.hasOwn(A,e)}function F(e,t){if(!e||typeof e!=`object`)return;let n=e;if(n.version===1&&n.cycleId===t.cycleId&&typeof n.enabled==`boolean`&&Array.isArray(n.completed)&&n.completed.every(P)&&new Set(n.completed).size===n.completed.length&&Array.isArray(n.eligibleMissionIds)&&new Set(n.eligibleMissionIds).size===n.eligibleMissionIds.length&&n.eligibleMissionIds.every(e=>{let r=N(e);return n.enabled&&t.activeMissionIds.includes(e)&&r&&!n.completed.includes(r.id)})&&n.sidegrade===(n.completed.length>=2?`reach-rend`:null)&&n.honor===(n.completed.length===3?`field-tested`:null)&&(n.selection===`rend`||n.selection===`reach-rend`&&n.sidegrade))return n}function I(e,t){if(!e||typeof e!=`object`)return;let n=e;if(P(n.id)&&N(t)?.id===n.id&&[1,2,3].includes(n.count)&&n.reward===(n.count===2?`reach-rend`:n.count===3?`field-tested`:null))return n}function ne(e,t){return t===`reach-rend`?e.map(e=>{if(e.defId!==`alpha`)return e;let t=e.unitDef||k.alpha;return{...e,unitDef:{...t,skillIds:t.skillIds.map(e=>e===`alpha-rend`?`alpha-reach-rend`:e)}}}):e}var L=e=>e.replace(/([a-z0-9])([A-Z])/g,`$1-$2`).toLowerCase(),R=e=>e.replace(/^([A-Z])|[\s-_]+(\w)/g,(e,t,n)=>n?n.toUpperCase():t.toLowerCase()),z=e=>{let t=R(e);return t.charAt(0).toUpperCase()+t.slice(1)},B=(...e)=>e.filter((e,t,n)=>!!e&&e.trim()!==``&&n.indexOf(e)===t).join(` `).trim(),re=e=>{for(let t in e)if(t.startsWith(`aria-`)||t===`role`||t===`title`)return!0},ie={xmlns:`http://www.w3.org/2000/svg`,width:24,height:24,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:2,strokeLinecap:`round`,strokeLinejoin:`round`},ae=(0,y.forwardRef)(({color:e=`currentColor`,size:t=24,strokeWidth:n=2,absoluteStrokeWidth:r,className:i=``,children:a,iconNode:o,...s},c)=>(0,y.createElement)(`svg`,{ref:c,...ie,width:t,height:t,stroke:e,strokeWidth:r?Number(n)*24/Number(t):n,className:B(`lucide`,i),...!a&&!re(s)&&{"aria-hidden":`true`},...s},[...o.map(([e,t])=>(0,y.createElement)(e,t)),...Array.isArray(a)?a:[a]])),V=(e,t)=>{let n=(0,y.forwardRef)(({className:n,...r},i)=>(0,y.createElement)(ae,{ref:i,iconNode:t,className:B(`lucide-${L(z(e))}`,`lucide-${e}`,n),...r}));return n.displayName=z(e),n},oe=V(`arrow-right`,[[`path`,{d:`M5 12h14`,key:`1ays0h`}],[`path`,{d:`m12 5 7 7-7 7`,key:`xquz4c`}]]),se=V(`axe`,[[`path`,{d:`m14 12-8.381 8.38a1 1 0 0 1-3.001-3L11 9`,key:`5z9253`}],[`path`,{d:`M15 15.5a.5.5 0 0 0 .5.5A6.5 6.5 0 0 0 22 9.5a.5.5 0 0 0-.5-.5h-1.672a2 2 0 0 1-1.414-.586l-5.062-5.062a1.205 1.205 0 0 0-1.704 0L9.352 5.648a1.205 1.205 0 0 0 0 1.704l5.062 5.062A2 2 0 0 1 15 13.828z`,key:`19zklq`}]]),ce=V(`bone`,[[`path`,{d:`M17 10c.7-.7 1.69 0 2.5 0a2.5 2.5 0 1 0 0-5 .5.5 0 0 1-.5-.5 2.5 2.5 0 1 0-5 0c0 .81.7 1.8 0 2.5l-7 7c-.7.7-1.69 0-2.5 0a2.5 2.5 0 0 0 0 5c.28 0 .5.22.5.5a2.5 2.5 0 1 0 5 0c0-.81-.7-1.8 0-2.5Z`,key:`w610uw`}]]),le=V(`check`,[[`path`,{d:`M20 6 9 17l-5-5`,key:`1gmf2c`}]]),ue=V(`chevron-right`,[[`path`,{d:`m9 18 6-6-6-6`,key:`mthhwq`}]]),de=V(`chevrons-right`,[[`path`,{d:`m6 17 5-5-5-5`,key:`xnjwq`}],[`path`,{d:`m13 17 5-5-5-5`,key:`17xmmf`}]]),H=V(`crosshair`,[[`circle`,{cx:`12`,cy:`12`,r:`10`,key:`1mglay`}],[`line`,{x1:`22`,x2:`18`,y1:`12`,y2:`12`,key:`l9bcsi`}],[`line`,{x1:`6`,x2:`2`,y1:`12`,y2:`12`,key:`13hhkx`}],[`line`,{x1:`12`,x2:`12`,y1:`6`,y2:`2`,key:`10w3f3`}],[`line`,{x1:`12`,x2:`12`,y1:`22`,y2:`18`,key:`15g9kq`}]]),fe=V(`hammer`,[[`path`,{d:`m15 12-8.373 8.373a1 1 0 1 1-3-3L12 9`,key:`eefl8a`}],[`path`,{d:`m18 15 4-4`,key:`16gjal`}],[`path`,{d:`m21.5 11.5-1.914-1.914A2 2 0 0 1 19 8.172V7l-2.26-2.26a6 6 0 0 0-4.202-1.756L9 2.96l.92.82A6.18 6.18 0 0 1 12 8.4V10l2 2h1.172a2 2 0 0 1 1.414.586L18.5 14.5`,key:`b7pghm`}]]),pe=V(`heart-pulse`,[[`path`,{d:`M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z`,key:`c3ymky`}],[`path`,{d:`M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27`,key:`1uw2ng`}]]),me=V(`log-out`,[[`path`,{d:`M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4`,key:`1uf3rs`}],[`polyline`,{points:`16 17 21 12 16 7`,key:`1gabdz`}],[`line`,{x1:`21`,x2:`9`,y1:`12`,y2:`12`,key:`1uyos4`}]]),he=V(`paw-print`,[[`circle`,{cx:`11`,cy:`4`,r:`2`,key:`vol9p0`}],[`circle`,{cx:`18`,cy:`8`,r:`2`,key:`17gozi`}],[`circle`,{cx:`20`,cy:`16`,r:`2`,key:`1v9bxh`}],[`path`,{d:`M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z`,key:`1ydw1z`}]]),ge=V(`rotate-ccw`,[[`path`,{d:`M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8`,key:`1357e3`}],[`path`,{d:`M3 3v5h5`,key:`1xhq8a`}]]),_e=V(`shield-check`,[[`path`,{d:`M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z`,key:`oel41y`}],[`path`,{d:`m9 12 2 2 4-4`,key:`dzmm74`}]]),U=V(`shield`,[[`path`,{d:`M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z`,key:`oel41y`}]]),ve=V(`slash`,[[`path`,{d:`M22 2 2 22`,key:`y4kqgn`}]]),ye=V(`swords`,[[`polyline`,{points:`14.5 17.5 3 6 3 3 6 3 17.5 14.5`,key:`1hfsw2`}],[`line`,{x1:`13`,x2:`19`,y1:`19`,y2:`13`,key:`1vrmhu`}],[`line`,{x1:`16`,x2:`20`,y1:`16`,y2:`20`,key:`1bron3`}],[`line`,{x1:`19`,x2:`21`,y1:`21`,y2:`19`,key:`13pww6`}],[`polyline`,{points:`14.5 6.5 18 3 21 3 21 6 17.5 9.5`,key:`hbey2j`}],[`line`,{x1:`5`,x2:`9`,y1:`14`,y2:`18`,key:`1hf58s`}],[`line`,{x1:`7`,x2:`4`,y1:`17`,y2:`20`,key:`pidxm4`}],[`line`,{x1:`3`,x2:`5`,y1:`19`,y2:`21`,key:`1pehsh`}]]),be=V(`target`,[[`circle`,{cx:`12`,cy:`12`,r:`10`,key:`1mglay`}],[`circle`,{cx:`12`,cy:`12`,r:`6`,key:`1vlfrh`}],[`circle`,{cx:`12`,cy:`12`,r:`2`,key:`1c9p78`}]]),xe=V(`triangle-alert`,[[`path`,{d:`m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3`,key:`wmoenq`}],[`path`,{d:`M12 9v4`,key:`juzpu7`}],[`path`,{d:`M12 17h.01`,key:`p32p05`}]]),Se=V(`volume-2`,[[`path`,{d:`M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z`,key:`uqj9uw`}],[`path`,{d:`M16 9a5 5 0 0 1 0 6`,key:`1q6k2b`}],[`path`,{d:`M19.364 18.364a9 9 0 0 0 0-12.728`,key:`ijwkga`}]]),Ce=V(`volume-x`,[[`path`,{d:`M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z`,key:`uqj9uw`}],[`line`,{x1:`22`,x2:`16`,y1:`9`,y2:`15`,key:`1ewh16`}],[`line`,{x1:`16`,x2:`22`,y1:`9`,y2:`15`,key:`5ykzw1`}]]),we=V(`zap`,[[`path`,{d:`M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z`,key:`1xq2db`}]]),Te=`ah_tactical_battlefield_lab_v1`,Ee=(()=>{if(typeof window>`u`)return!1;try{return new URLSearchParams(window.location.search).get(`tacticalBattlefieldVNext`)===`1`||window.localStorage.getItem(Te)===`10x7`}catch{return!1}})(),De=Ee?10:8,Oe=Ee?7:5;function ke(e){Ee=e?.rulesetVersion===`tactical-intent-vnext.0`,De=Ee?10:8,Oe=Ee?7:5}var Ae=100,je=50,Me=`tactical-intent-vnext.0`;function Ne(e){return e===`field-squad-survival`||e===`field-rearguard`}var Pe=Ee;function Fe(e){Pe=e?.rulesetVersion===Me}var Ie=[`ATTACK`,`AREA`,`JAM`,`ESCAPE`,`REINFORCEMENT`,`CHARGE`],Le=[`KILL`,`DISRUPT`,`REPOSITION`,`BLOCK`,`PROTECT`,`TRADE`];function Re(e){return Number.isInteger(e.c)&&Number.isInteger(e.r)&&e.c>=0&&e.c<De&&e.r>=0&&e.r<Oe}function ze(e,t){return e.c===t.c&&e.r===t.r}function Be(e,t){if(!e.id||!e.enemyId||!Ie.includes(e.kind)||!e.predictedEffect.trim()||e.warnsOnUnitTurn!==t.unitTurn||!Number.isInteger(e.resolvesOnUnitTurn)||e.resolvesOnUnitTurn<=e.warnsOnUnitTurn||![`CANCEL`,`REANNOUNCE`].includes(e.fallbackPolicy)||!e.responses.length||!e.responses.every(e=>Le.includes(e))||e.responses.length!==new Set(e.responses).size||!e.impactTiles.length||!e.impactTiles.every(Re)||e.targetTile!==null&&!Re(e.targetTile)||!e.targetUnitId&&!e.targetTile)throw Error(`invalid_tactical_intent`);let n=t.units.find(t=>t.id===e.enemyId);if(!n||n.team!==`enemy`||n.defeated)throw Error(`invalid_tactical_intent_source`);if(e.targetUnitId){let n=t.units.find(t=>t.id===e.targetUnitId);if(!n||n.defeated)throw Error(`invalid_tactical_intent_target`);if(e.targetTile&&!ze(n,e.targetTile))throw Error(`intent_target_tile_mismatch`)}let r=Object.freeze({...e,targetTile:e.targetTile?Object.freeze({...e.targetTile}):null,impactTiles:Object.freeze(e.impactTiles.map(e=>Object.freeze({...e}))),responses:Object.freeze([...e.responses]),phase:`WINDUP`,rulesetVersion:Me});return{plan:r,event:{type:`threat_announced`,intentId:r.id,enemyId:r.enemyId,unitTurn:t.unitTurn}}}function Ve(e,t,n=!1){if(e.rulesetVersion!==`tactical-intent-vnext.0`||t.unitTurn<e.warnsOnUnitTurn)throw Error(`intent_ruleset_or_clock_mismatch`);let r=t.units.find(t=>t.id===e.enemyId),i=e.targetUnitId?t.units.find(t=>t.id===e.targetUnitId):null,a=!r||r.defeated?`SOURCE_DEFEATED`:n?`COUNTERED`:e.targetUnitId&&(!i||i.defeated)?`TARGET_GONE`:i&&e.targetTile&&!ze(i,e.targetTile)?`TARGET_MOVED`:null;if(a)return{status:`CANCELED`,reason:a,events:[{type:`threat_countered`,intentId:e.id,reason:a,unitTurn:t.unitTurn}]};if(t.unitTurn<e.resolvesOnUnitTurn)return{status:`WAIT`,plan:e,events:[]};if(e.phase===`COMMIT`)throw Error(`intent_already_committed`);return{status:`COMMIT`,plan:Object.freeze({...e,phase:`COMMIT`}),events:[{type:`threat_committed`,intentId:e.id,unitTurn:t.unitTurn}]}}function He(e,t,n){if(e.phase!==`COMMIT`||!Number.isInteger(t)||t<e.resolvesOnUnitTurn||n!==!0)throw Error(`unconfirmed_tactical_resolution`);return[{type:`threat_resolved`,intentId:e.id,unitTurn:t,confirmedByEngine:!0}]}function Ue(e){if(e==null)return null;if(typeof e!=`object`||Array.isArray(e))throw Error(`invalid_run_rules_contract`);let t=e,n=[`rulesetVersion`,`missionId`,`missionRevision`,`combatProfileVersion`,`masterySnapshotVersion`,`rewardPolicyVersion`,`source`];if(Object.keys(t).length!==n.length||!n.every(e=>Object.prototype.hasOwnProperty.call(t,e)))throw Error(`invalid_run_rules_contract`);let r=t.missionId===`field-relay-intercept`||t.missionId===`dead-relay-hold`||Ne(t.missionId);if(t.rulesetVersion!==`tactical-intent-vnext.0`||t.source!==`BACKEND_SNAPSHOT`||typeof t.missionId!=`string`||!t.missionId||t.missionRevision!==1&&!(r&&t.missionRevision===2)||t.combatProfileVersion!==3||t.masterySnapshotVersion!==1||t.rewardPolicyVersion!==1)throw Error(`unsupported_run_rules_contract`);return Object.freeze({...t})}var We={anchor:{name:`ANCHOR`,benefit:`One relay tile; keep your defensive formation.`,cost:`Healing and allied support recharge 1 personal turn slower.`,priority:`Occupy the center tile and clear adjacent enemies immediately.`},crosslink:{name:`CROSSLINK`,benefit:`Normal healing and allied support recharge.`,cost:`Occupy three different relay tiles in sequence at round changes; a missed checkpoint resets the sequence.`,priority:`Start north, rotate east, then south. Clear the next relay before moving the holder.`}};function Ge(e){if(!e||typeof e!=`object`||Array.isArray(e))return null;let t=e;return Object.keys(t).length===3&&typeof t.runId==`string`&&t.runId.startsWith(`field_`)&&t.runId.length>6&&t.runId.length<=128&&Number.isSafeInteger(t.cycleId)&&Number.isSafeInteger(t.recordedAt)&&t.recordedAt>=0?{runId:t.runId,cycleId:t.cycleId,recordedAt:t.recordedAt}:null}var Ke={standard:{name:`STANDARD APPROACH`,copy:`Spread across the west edge. Cover the north and center.`,cells:[{c:1,r:2},{c:1,r:0},{c:0,r:3}]},south:{name:`SOUTH APPROACH`,copy:`Group along the south edge. A different route; the north starts exposed. Same squad and stats.`,cells:[{c:0,r:4},{c:2,r:4},{c:0,r:2}]}};function qe(e){return e>=2?`HIGH`:e===1?`REDUCED`:`CLEAR`}function Je(e){return e>=2?`Reinforcements arrive on their scheduled round.`:`Reinforcements arrive 1 round later in relevant Field Ops.`}function Ye(e){if(!e.results||e.outcome===`ongoing`)return null;let{victory:t,turns:n,squadStanding:r,squadDeployed:i}=e.results;return{victory:t,turns:n,squadStanding:r,squadDeployed:i,objectiveComplete:e.results.objectiveComplete===!0,healingActions:e.healingActions||0,...e.failureReason?{failureReason:e.failureReason}:{}}}function Xe(e){return e===`attrition`?`ATTRITION`:`PURSUIT`}function Ze(e,t){return e===`TARGET_ESCAPED`?`The signal courier reached its exit.`:e===`DEADLINE`?`The completion window closed.`:t===`SURVIVE`?`A squad member fell. The full squad must survive.`:`The squad was defeated.`}function Qe(e){return new Date(e*1e3).toISOString().slice(0,16).replace(`T`,` `)+` UTC`}function $e(e){if(!e||typeof e!=`object`)return null;let t=e;return typeof t.id!=`string`||!t.id.trim()||typeof t.name!=`string`||!t.name.trim()||typeof t.img!=`string`||!/^https:\/\//.test(t.img)?null:{id:t.id,name:t.name,img:t.img}}function et(e){return{defId:`pet:${e.id}`,name:e.name,team:`ally`,role:`companion`,hp:78,atk:18,def:6,spd:13,move:4,sprite:e.img,portrait:e.img,skillIds:[`pet-bite`,`pet-hamstring`]}}var tt={"field-relay-recovery":6,"field-relay-hold":6,"field-relay-intercept":7,"field-isolated-hold":5};function nt(e,t){if(t?.veteranChallenge===`pack-extraction-v1`)return[{type:`SIGNAL_INTERFERENCE`,name:`EXTRACTION WINDOW`,recoverEveryRounds:2,copy:`Whole squad within 2 cells. RECOVER on even rounds only.`},{type:`NO_SAFE_EXTRACTION`,name:`EXTRACTION DEADLINE`,maxRounds:6,copy:`Extract by round 6. A fallen or distant squad member prevents extraction.`},{type:`REINFORCEMENTS`,name:`PURSUIT`,copy:`A HOUND closes the east lane in round 2.`,reinforcement:{spawn:{defId:`hostile`,id:`field-reinforcement`,c:7,r:2},triggerRound:2,telegraphed:!0,spawned:!1}}];let n=e.directive?[structuredClone(e.directive)]:[];if(t&&[4,5].includes(t.reportVersion||0)&&t.masteryChallenge===`relay-lockdown-v1`){let e={type:`NO_SAFE_EXTRACTION`,name:`LOCKDOWN WINDOW`,maxRounds:6,copy:`Complete by the end of round 6. Round 7 fails the operation.`};return t?.lockdownPlan===`crosslink`?[...n,e]:[...n,{type:`NO_SAFE_EXTRACTION`,name:`LOCKDOWN WINDOW`,maxRounds:6,copy:`Complete by the end of round 6. Round 7 fails the operation.`},{type:`DISRUPTED_SUPPORT`,name:`DISRUPTED SUPPORT`,supportCooldownExtra:1,copy:`Healing and allied support recharge 1 personal turn slower. SILENT SHELTER bypasses this penalty for PACK SUPPORT.`}]}if(e.activity!==`FIELD_OP`||t?.reportVersion!==3||t.directiveTier!==`advanced`)return n;let r=t.directiveSet===`pursuit`;if(r&&e.objectiveType===`SURVIVE`){let e=n.find(e=>e.reinforcement);e?.reinforcement&&e.reinforcement.entryMeter==null&&(e.reinforcement.triggerRound=2,e.reinforcement.spawn.r=0,e.copy=`A HOUND enters from the north-east in round 2, one round later with reduced/clear pressure. Occupied entries use the nearest free cell.`)}let i=tt[e.missionId];if(r&&i?n.push({type:`NO_SAFE_EXTRACTION`,name:`NO SAFE EXTRACTION`,maxRounds:i,copy:`Complete by the end of round ${i}. At round ${i+1}, the operation fails even if your squad is standing.`}):n.some(e=>e.supportCooldownExtra)||n.push({type:`DISRUPTED_SUPPORT`,name:`DISRUPTED SUPPORT`,supportCooldownExtra:1,copy:`Healing and allied support skills take 1 extra personal turn to recharge. SILENT SHELTER bypasses this penalty for PACK SUPPORT.`}),!n.some(e=>e.reinforcement)){let e=r?2:3;n.push({type:`REINFORCEMENTS`,name:`REINFORCEMENTS`,copy:`A HOUND enters from the ${r?`north`:`south`}-east in round ${e}, one round later with reduced/clear pressure. Occupied entries use the nearest free cell.`,reinforcement:{spawn:{defId:`hostile`,id:`field-reinforcement`,c:7,r:r?0:4},triggerRound:e,telegraphed:!0,spawned:!1}})}return n}function rt(e){let t=e.directive?.recoverEveryRounds;return!t||e.round%t===0}function it(e,t,n){return n.ignoreDisruption?0:t.team===`ally`&&n.effects.some(e=>e.kind===`heal`||e.kind===`status`&&[`SELF`,`ALLY_SINGLE`,`ALLY_AOE`].includes(n.targetType))&&e?.supportCooldownExtra||0}function at(e,t){let n=e.objective;if(n?.type!==`HOLD`)return`UNOCCUPIED`;let r=e=>Math.abs(e.c-t.c)+Math.abs(e.r-t.r),i=n.radius??0;return e.units.some(e=>!e.defeated&&e.team===`enemy`&&r(e)<=i)?`CONTESTED`:e.units.some(e=>!e.defeated&&e.team===`ally`&&r(e)<=(n.holderRadius??i))?`CONTROLLED`:`UNOCCUPIED`}function ot(e){let t=e.objective;if(t?.type!==`HOLD`||!t.terminal)return!1;let n=t.relayPressure?.flank;return at(e,t.terminal)===`CONTROLLED`&&(!n||t.checkedRound<n.activeRound||at(e,n.tile)===`CONTROLLED`)}function st(e){let t=e.objective,n=e.directive?.maxRounds,r=!!(n&&e.round>n),i=t?.type===`HOLD`&&t.relayPressure;if(r&&!i)return{state:{...e,failureReason:`DEADLINE`},result:`defeat`};if(t?.type===`INTERCEPT`){let n=e.units.find(e=>e.id===t.targetId);return n?.defeated?{state:e,result:e.units.some(e=>e.team===`ally`&&!e.defeated)?`victory`:`defeat`}:n&&n.c===t.exit.c&&n.r===t.exit.r?{state:{...e,failureReason:`TARGET_ESCAPED`},result:`defeat`}:{state:e,result:null}}if(t?.type!==`HOLD`&&t?.type!==`SURVIVE`)return{state:e,result:null};let a=e.units.filter(e=>e.team===`ally`);if(!a.some(e=>!e.defeated)||t.type===`SURVIVE`&&a.some(e=>e.defeated))return{state:e,result:`defeat`};let o=e.round>t.checkedRound;if(t.type===`HOLD`&&(t.relayRoute?.length||i)){if(!o)return{state:e,result:null};let n=ot(e)?t.progress+1:0,i=t.relayRoute,a=i?.[Math.min(n,i.length-1)]??t.terminal,s=n>=t.duration,c=!s&&r;return{state:{...e,objective:{...t,progress:n,checkedRound:e.round,terminal:{...a}},...c?{failureReason:`DEADLINE`}:{}},result:s?`victory`:c?`defeat`:null}}let s=t.type===`SURVIVE`?e.round-1:ot(e)?t.progress+ +!!o:0;return{state:{...e,objective:{...t,progress:s,checkedRound:e.round}},result:s>=t.duration?`victory`:null}}function ct(e){let t=e.objective,n=e.directive,r=t?.type===`HOLD`&&t.relayRoute?`CROSSLINK ${t.progress}/${t.duration} · RELAY ${Math.min(t.progress+1,t.duration)} AT ${t.terminal.c+1},${t.terminal.r+1} · ${ot(e)?`READY FOR ROUND CHANGE`:`OCCUPY TILE / CLEAR ADJACENT ENEMIES`}`:t?.type===`HOLD`?`HOLD ${t.progress}/${t.duration} · ${ot(e)?`CONTROLLED`:t.holderRadius===0?`OCCUPY RELAY TILE / CLEAR ADJACENT ENEMIES`:`OCCUPY / CLEAR AREA`}`:t?.type===`SURVIVE`?`SURVIVE ${t.progress}/${t.duration} · ALL SQUAD MUST STAND`:t?.type===`RECOVER`&&t.squadExtractionRadius!=null?`PACK EXTRACTION · ${e.units.filter(e=>e.team===`ally`&&!e.defeated&&Math.abs(e.c-t.terminal.c)+Math.abs(e.r-t.terminal.r)<=t.squadExtractionRadius).length}/3 IN RANGE · EVEN ROUNDS ONLY`:n?.recoverEveryRounds?`RECOVER · SIGNAL ${rt(e)?`OPEN`:`JAMMED — EVEN ROUNDS ONLY`}`:``,i=[n?.reinforcement&&e.reinforcement?`HOUND · ${e.reinforcement.spawned?`ARRIVED`:`ROUND ${e.reinforcement.triggerRound}`}`:``,n?.supportCooldownExtra?`SUPPORT COOLDOWNS +${n.supportCooldownExtra}`:``,n?.maxRounds?`WINDOW · ${Math.max(0,n.maxRounds-e.round+1)} ROUNDS LEFT`:``];return[t?.type===`INTERCEPT`?`INTERCEPT · STOP COURIER BEFORE EXIT`:r,...i].filter(Boolean).join(` · `)}function lt(e){if(!e.length)return null;if(e.length===1)return structuredClone(e[0]);if(e.filter(e=>e.reinforcement).length>1)throw Error(`Only one reinforcement schedule per condition set`);return{type:`COMPOSITE`,name:e.map(e=>e.name).join(` + `),copy:e.map(e=>e.copy).join(` `),conditions:structuredClone(e),recoverEveryRounds:Math.max(...e.map(e=>e.recoverEveryRounds||0)),supportCooldownExtra:Math.max(...e.map(e=>e.supportCooldownExtra||0)),maxRounds:e.find(e=>e.maxRounds)?.maxRounds,reinforcement:structuredClone(e.find(e=>e.reinforcement)?.reinforcement)}}function ut(e,t,n){if(!n)return e;if(n.version!==1||n.effect!==`DELAY_REINFORCEMENT`||n.sourceChapterId!==`edge-relay`||n.missionId!==t||!e.reinforcement||e.reinforcement.triggerRound!==n.baselineRound||n.effectiveRound!==n.baselineRound+1)throw Error(`chapter_intel_rules_mismatch`);return{...e,reinforcement:{...e.reinforcement,triggerRound:n.effectiveRound}}}var dt={"broken-signal":{art:`/images/tactical_ops/battlefields/battlefield_broken_signal_mobile.webp`},"dead-relay":{art:`/images/tactical_ops/battlefields/battlefield_dead_relay_mobile.webp`},"field-ops":{art:`/images/tactical_ops/battlefields/battlefield_field_ops_mobile.webp`}};function ft(e){return dt[e?.battlefield||`broken-signal`]||dt[`broken-signal`]}var pt=[{defId:`alpha`,id:`alpha`,c:0,r:2},{defId:`ally-02`,id:`ally-02`,c:1,r:0},{defId:`ally-03`,id:`ally-03`,c:1,r:4},{defId:`hostile`,id:`h1`,c:5,r:1},{defId:`hostile`,id:`h2`,c:6,r:3},{defId:`hostile`,id:`h3`,c:7,r:0}],mt=[{defId:`alpha`,id:`alpha`,c:0,r:2},{defId:`hostile`,id:`h1`,c:5,r:1},{defId:`hostile`,id:`h2`,c:6,r:3}],ht={c:6,r:2},gt=[{defId:`alpha`,id:`alpha`,c:1,r:2},{defId:`ally-02`,id:`ally-02`,c:1,r:0},{defId:`ally-03`,id:`ally-03`,c:0,r:3},{defId:`leader`,id:`leader`,c:6,r:2},{defId:`hostile`,id:`h1`,c:4,r:0},{defId:`hostile`,id:`h2`,c:5,r:4}],_t={spawn:{defId:`hostile`,id:`commander-reinforcement`,c:7,r:4},triggerRound:2};function vt(e,t){let n=!!(t&&e[1]===`pet:${t.id}`);return e.length!==2||e[0]!==`alpha`||!n&&![`ally-02`,`ally-03`].includes(e[1])?null:[{defId:`alpha`,id:`alpha`,c:0,r:2},{defId:e[1],id:e[1],c:1,r:e[1]===`ally-02`?0:4,...n?{unitDef:et(t)}:{}},...mt.filter(e=>e.defId===`hostile`)]}function yt(e,t){return e.length!==3||e[0]!==`alpha`||new Set(e).size!==3||!e.slice(1).every(e=>e===`ally-02`||e===`ally-03`||t&&e===`pet:${t.id}`)?null:[{...gt[0]},...e.slice(1).map((e,n)=>({defId:e,id:e,c:+(n===0),r:n===0?0:3,...t&&e===`pet:${t.id}`?{unitDef:et(t)}:{}})),...gt.slice(3)]}var bt={operationId:`broken-signal`,name:`BROKEN SIGNAL`,orderedMissionIds:[`broken-signal-breach`,`broken-signal-recover`,`broken-signal-commander`]},xt={operationId:`dead-relay`,name:`THE DEAD RELAY`,orderedMissionIds:[`dead-relay-courier`,`dead-relay-hold`,`dead-relay-guardian`]},St={"broken-signal-breach":{missionId:`broken-signal-breach`,operationId:bt.operationId,name:`BREACH`,objectiveType:`ELIMINATE`,squadCap:3,briefCopy:`Break the perimeter before the signal disappears. Eliminate the HOUND MK-2 patrol.`,resultsCopy:`BREACH CLEARED. RECOVER SIGNAL UNLOCKED.`,executable:!0,spawns:pt},"broken-signal-recover":{missionId:`broken-signal-recover`,operationId:bt.operationId,name:`RECOVER SIGNAL`,objectiveType:`RECOVER`,squadCap:2,briefCopy:`Reach the relay terminal and recover the signal before the HOUND MK-2 patrol can stop you.`,resultsCopy:`OBJECTIVE COMPLETE · SIGNAL RECOVERED.`,executable:!0,terminal:ht},"broken-signal-commander":{missionId:`broken-signal-commander`,operationId:bt.operationId,name:`SIGNAL COMMANDER`,objectiveType:`BOSS`,squadCap:3,briefCopy:`Break the commander signal. Control the HOUND pressure or find an opening to defeat the BRUTE LEADER.`,resultsCopy:`Continue to save: OPERATION 01 — BROKEN SIGNAL CLEARED · ARCHIVE ENTRY RECORDED · NEXT OPERATION SLOT OPENED. No Operation assigned.`,executable:!0,spawns:gt}};function W(e){return e&&St[e]||null}var Ct=[`field-relay-recovery`,`field-relay-hold`,`field-squad-survival`,`field-relay-intercept`,`field-isolated-hold`,`field-rearguard`],wt={activity:`FIELD_OP`,operationId:`field-ops`,regionId:`broken-signal`,battlefield:`field-ops`,squadCap:3,executable:!0,resultsCopy:`Field Op complete. Your result records commander progress, the optional challenge and temporary signal pressure.`};Object.assign(St,{"field-relay-recovery":{...wt,missionId:`field-relay-recovery`,name:`RELAY RECOVERY`,objectiveType:`RECOVER`,challenge:{type:`TURN_LIMIT`,limit:4,label:`Recover by the end of round 4`},briefCopy:`Reach the relay and use RECOVER from within 1 cell. Eliminating the HOUND patrol is optional.`,terminal:{c:6,r:2},objective:{type:`RECOVER`,terminal:{c:6,r:2},completed:!1},spawns:mt.filter(e=>e.defId===`hostile`),directive:{type:`SIGNAL_INTERFERENCE`,name:`SIGNAL INTERFERENCE`,recoverEveryRounds:2,copy:`RECOVER works only on even rounds (2, 4, 6...). Move and attack normally; reach cover or prepare protection while the signal is jammed.`},squadHint:`PET mobility can reach the relay early. CNC controls patrol pressure; SHADOW protects a squad waiting for the signal window.`},"field-relay-hold":{...wt,missionId:`field-relay-hold`,name:`RELAY HOLD`,objectiveType:`HOLD`,challenge:{type:`NO_HEALING`,label:`Clear without using a healing skill`},briefCopy:`Keep at least one ally within 1 cell of the marked relay, with no enemy inside that area, across 3 consecutive round changes. Losing control resets progress.`,objective:{type:`HOLD`,terminal:{c:3,r:2},radius:1,duration:3,progress:0,checkedRound:1},spawns:[{defId:`hostile`,id:`h1`,c:5,r:1},{defId:`hostile`,id:`h2`,c:6,r:3}],directive:{type:`REINFORCEMENTS`,name:`REINFORCEMENTS`,copy:`One HOUND arrives at the marked entry in round 2, or round 3 when signal pressure is reduced/clear (nearest free cell if occupied). Clear or slow enemies before they contest the relay.`,reinforcement:{spawn:{defId:`hostile`,id:`field-reinforcement`,c:7,r:2},triggerRound:2,telegraphed:!0,spawned:!1}},squadHint:`CNC pressure helps keep the area clear. SHADOW sustains the holder; PET control can delay the arriving HOUND.`},"field-squad-survival":{...wt,missionId:`field-squad-survival`,name:`SQUAD SURVIVAL`,objectiveType:`SURVIVE`,challenge:{type:`SQUAD`,required:[`ally-02`,`PET`],label:`Clear with CNC and your equipped PET`},briefCopy:`Keep all three squad members standing through 4 rounds, until round 5 begins. Any squad member falling fails the mission. Clearing enemies early does not end the timer.`,objective:{type:`SURVIVE`,duration:4,progress:0,checkedRound:1},spawns:[{defId:`hostile`,id:`h1`,c:4,r:0},{defId:`hostile`,id:`h2`,c:5,r:4},{defId:`hostile`,id:`h3`,c:6,r:2}],directive:{type:`DISRUPTED_SUPPORT`,name:`DISRUPTED SUPPORT`,supportCooldownExtra:1,copy:`Allied healing and self/ally buff skills take 1 extra personal turn to recharge after use. Attacks and movement are unchanged. Time support carefully and protect the weakest squad member.`},squadHint:`SHADOW still provides sustain, but timing matters. CNC can reduce incoming pressure; PET mobility and slows help keep the squad safe.`},"field-relay-intercept":{...wt,missionId:`field-relay-intercept`,name:`RELAY INTERCEPT`,objectiveType:`RECOVER`,briefCopy:`Recover at the northern relay from within 1 cell. Rush the terminal or control the patrol before the incoming HOUND closes the route.`,terminal:{c:6,r:0},objective:{type:`RECOVER`,terminal:{c:6,r:0},completed:!1},spawns:[{defId:`hostile`,id:`h1`,c:4,r:1},{defId:`hostile`,id:`h2`,c:6,r:3}],directive:{type:`REINFORCEMENTS`,name:`REINFORCEMENTS`,copy:`One HOUND enters from the north-east in round 2, or round 3 when signal pressure is reduced/clear. The entry uses the nearest free cell if occupied.`,reinforcement:{spawn:{defId:`hostile`,id:`field-reinforcement`,c:7,r:0},triggerRound:2,telegraphed:!0,spawned:!1}},challenge:{type:`NO_HEALING`,label:`Recover without using a healing skill`},squadHint:`CNC can open the northern route. PET speed favors a rush; SHADOW makes a slower approach safer.`},"field-isolated-hold":{...wt,missionId:`field-isolated-hold`,name:`ISOLATED HOLD`,objectiveType:`HOLD`,briefCopy:`Control the southern relay area within 1 cell for 2 consecutive round changes. Any enemy inside contests it; losing control resets progress. The BRUTE LEADER applies pressure from the center.`,objective:{type:`HOLD`,terminal:{c:4,r:3},radius:1,duration:2,progress:0,checkedRound:1},spawns:[{defId:`leader`,id:`leader`,c:6,r:2},{defId:`hostile`,id:`h1`,c:5,r:0}],directive:{type:`DISRUPTED_SUPPORT`,name:`DISRUPTED SUPPORT`,supportCooldownExtra:1,copy:`Allied healing and self/ally buff skills take 1 extra personal turn to recharge. Hold the area while planning longer gaps between support actions.`},challenge:{type:`TURN_LIMIT`,limit:5,label:`Secure the area by the end of round 5`},squadHint:`SHADOW can protect a stationary holder. CNC or PET control helps keep the leader outside the area. South Approach changes the route to this relay.`},"field-rearguard":{...wt,missionId:`field-rearguard`,name:`REARGUARD`,objectiveType:`SURVIVE`,briefCopy:`Keep all three squad members standing through 5 rounds, until round 6 begins. Defend against the patrol and the arriving HOUND. Any squad member falling fails the mission.`,objective:{type:`SURVIVE`,duration:5,progress:0,checkedRound:1},spawns:[{defId:`hostile`,id:`h1`,c:4,r:1},{defId:`hostile`,id:`h2`,c:5,r:4}],directive:{type:`REINFORCEMENTS`,name:`REINFORCEMENTS`,copy:`One HOUND arrives from the south-east in round 3, or round 4 when signal pressure is reduced/clear. Protect the flank or regroup before it arrives.`,reinforcement:{spawn:{defId:`hostile`,id:`field-reinforcement`,c:7,r:4},triggerRound:3,telegraphed:!0,spawned:!1}},challenge:{type:`SQUAD`,required:[`ally-03`,`PET`],label:`Survive with SHADOW and your equipped PET`},squadHint:`SHADOW can sustain a defensive group. PET slows help delay the new arrival; CNC offers pressure if you forgo the optional squad challenge.`},"dead-relay-courier":{activity:`CANON`,missionId:`dead-relay-courier`,operationId:xt.operationId,battlefield:`dead-relay`,name:`THE COURIER`,objectiveType:`INTERCEPT`,squadCap:3,executable:!0,briefCopy:`HOUND is evacuating relay intel. Stop the reinforced SIGNAL COURIER before it reaches the south-east exit. It moves up to 2 cells each turn, while a HOUND patrol pressures your flank. Slow, intercept or focus fire. Stop it by round 4 on the FIRST successful clear to earn intel for the next mission.`,resultsCopy:`Courier stopped. Relay coordinates recovered. The counterattack is imminent.`,objective:{type:`INTERCEPT`,targetId:`courier`,exit:{c:7,r:4}},spawns:[{defId:`hostile`,id:`courier`,c:4,r:0,unitDef:{...k.hostile,defId:`signal-courier`,name:`SIGNAL COURIER`,hp:100,move:2}},{defId:`hostile`,id:`h1`,c:5,r:3},{defId:`hostile`,id:`h2`,c:3,r:3}],squadHint:`CNC can suppress the fleeing courier. PET slows make interception easier, while SHADOW keeps a forward blocker alive.`},"dead-relay-hold":{activity:`CANON`,missionId:`dead-relay-hold`,operationId:xt.operationId,battlefield:`dead-relay`,name:`RELAY UNDER FIRE`,objectiveType:`HOLD`,squadCap:3,executable:!0,briefCopy:`Hold the relay for 3 consecutive round changes. Any enemy inside the marked zone resets control. Your recovered courier intel delays one HOUND reinforcement by a round.`,resultsCopy:`Relay secured. The defensive perimeter is stable. Guardian access confirmed.`,objective:{type:`HOLD`,terminal:{c:3,r:2},radius:1,duration:3,progress:0,checkedRound:1},spawns:[{defId:`hostile`,id:`h1`,c:5,r:1},{defId:`hostile`,id:`h2`,c:6,r:3}],directive:{type:`REINFORCEMENTS`,name:`REINFORCEMENTS`,copy:`A HOUND arrives from the east on round 2, or round 3 if courier intel was captured in the first mission.`,reinforcement:{spawn:{defId:`hostile`,id:`dead-relay-reinforcement`,c:7,r:2},triggerRound:2,telegraphed:!0,spawned:!1}},squadHint:`SHADOW can sustain relay control. CNC and PET prevent enemy contesting.`},"dead-relay-guardian":{activity:`CANON`,missionId:`dead-relay-guardian`,operationId:xt.operationId,battlefield:`dead-relay`,name:`RELAY GUARDIAN`,objectiveType:`BOSS`,squadCap:3,executable:!0,briefCopy:`Eliminate the Dead Relay Guardian while a telegraphed HOUND reinforcement closes from the flank. This is the final mission of Operation 02.`,resultsCopy:`OPERATION 02 — THE DEAD RELAY SECURED. Canonical campaign archive updated.`,objective:{type:`BOSS`,targetId:`leader`},spawns:[{defId:`leader`,id:`leader`,c:6,r:2,unitDef:{...k.leader,name:`DEAD RELAY GUARDIAN`}},{defId:`hostile`,id:`h1`,c:4,r:0},{defId:`hostile`,id:`h2`,c:5,r:4}],directive:{type:`REINFORCEMENTS`,name:`GUARDIAN REINFORCEMENT`,copy:`One HOUND enters from the south-east on round 3. The entry is telegraphed.`,reinforcement:{spawn:{defId:`hostile`,id:`guardian-reinforcement`,c:7,r:4},triggerRound:3,telegraphed:!0,spawned:!1}},squadHint:`Use your Pack's control and sustain to counter the Guardian's pressure, then focus on the boss.`}});var Tt=structuredClone(St[`field-relay-intercept`]);St[`field-relay-intercept`]={...Tt,objectiveType:`INTERCEPT`,terminal:void 0,briefCopy:`Stop the SIGNAL COURIER before it reaches the south-east EXIT. It moves 1 cell on each personal turn, taking the shortest free route. Block the route, slow it, or focus fire; patrol kills are optional.`,objective:{type:`INTERCEPT`,targetId:`courier`,exit:{c:7,r:4}},spawns:[{defId:`hostile`,id:`courier`,c:4,r:0,unitDef:{...k.hostile,defId:`signal-courier`,name:`SIGNAL COURIER`,move:1}},{defId:`hostile`,id:`h1`,c:4,r:2},{defId:`hostile`,id:`h2`,c:6,r:3}],challenge:{type:`NO_HEALING`,label:`Intercept without using a healing skill`},squadHint:`CNC DISRUPTOR and PET HAMSTRING slow the courier's turns. PET mobility can block its exit; SHADOW protects a forward blocker at the cost of another control unit.`};function Et(e,t,n,r){if(e===`dead-relay-hold`&&t===`tactical-intent-vnext.0`)return r?r.rulesContract?.missionRevision===2?2:void 0:n===2?2:void 0}function Dt(e,t,n){if(e.missionId!==`dead-relay-hold`||t!==2)return e;if(!n||n.version!==1||typeof n.courierTraceAcquired!=`boolean`)throw Error(`invalid_g2_campaign_context`);return n.courierTraceAcquired?{...e,name:`RELAY UNDER FIRE · TRACED FLANK`,briefCopy:`COURIER TRACE: intercepted coordinates exposed a southern HOUND entry. Reinforcement arrives later, in round 3, but the eastern patrol has moved north to threaten your approach. Secure the relay quickly or guard the southern flank before it opens.`,spawns:(e.spawns||[]).map(e=>e.id===`h1`?{...e,c:5,r:0}:{...e}),directive:e.directive?{...e.directive,copy:`COURIER TRACE confirmed: a HOUND enters from the south-east in round 3 instead of the eastern round-2 lane. Choose relay control or southern screening.`,reinforcement:e.directive.reinforcement?{...e.directive.reinforcement,triggerRound:3,spawn:{...e.directive.reinforcement.spawn,c:7,r:4}}:void 0}:void 0,squadHint:`Intel buys one round, but shifts the HOUND to the south. CNC can intercept from the north while PET or SHADOW covers the later southern entry.`}:{...e,briefCopy:`No courier route Intel recorded. Hold the relay through three round changes while an eastern HOUND reinforces in round 2. Secure the relay early or clear the eastern lane first.`,squadHint:`Without Intel the round-2 eastern reinforcement pressures the relay. CNC can contest its approach; SHADOW buys time for the holder.`}}function Ot(e,t,n,r){if(Ne(e)&&t===`tactical-intent-vnext.0`)return r?r.rulesContract?.missionId===e&&r.rulesContract.missionRevision===2?2:void 0:n?.reportVersion===3&&n.surviveRevisionAvailable===2?2:void 0}function kt(e,t){let n=e.missionId===`field-rearguard`,r=t.directiveTier===`advanced`,i=r&&t.directiveSet===`pursuit`,a={c:5,r:i?0:4},o=n?4:3,s=r?{unitDef:{...k.hostile,atk:24}}:{};return{...e,briefCopy:`Keep all three allies standing for ${n?5:4} rounds. Break the patrol’s crossfire, then cover the marked flank before the reserve arrives.`,...r&&e.objective?.type===`SURVIVE`?{objective:{...e.objective,trackingMarksman:!0}}:{},spawns:[{defId:`hostile`,id:`h1`,c:4,r:1},{defId:`hostile`,id:`h2`,c:6,r:i?3:1,...s},{defId:`hostile`,id:`h3`,c:4,r:2},...n||r?[{defId:`hostile`,id:`h4`,c:3,r:0}]:[]],directive:{type:`REINFORCEMENTS`,name:`FLANK REINFORCEMENT`,copy:`A HOUND enters at the marked ${i?`north`:`south`} flank in round ${o}, one round later at reduced Signal Pressure. Occupied entries use the nearest free cell.`+(n?``:` Healing and allied support recharge one personal turn slower.`),...n?{}:{supportCooldownExtra:1},reinforcement:{spawn:{defId:`hostile`,id:`field-reinforcement`,...a},triggerRound:o,telegraphed:!0,spawned:!1,entryMeter:r?65:50}},squadHint:r?`TARGET LOCK tracks its marked ally. Close inside minimum range, break range, interrupt or guard. Screen injured allies from the reserve.`:`Move off marked tiles or close inside the Marksman’s firing range. Screen injured allies with CNC control, PET slows or SHADOW support.`}}function At(e,t,n=1,r){if(t?.reportVersion===3&&n===2&&Ne(e.missionId))return kt(e,t);if(e.missionId===`dead-relay-hold`)return Dt(e,n,r);if(e.missionId===`field-relay-intercept`&&t?.reportVersion===3&&n===2)return{...e,briefCopy:`The courier starts behind its patrol, close to the eastern escape lane. Cut north to slow and focus it, or send a protected blocker south to the exit. Ignoring the runner loses the operation.`,objective:{type:`INTERCEPT`,targetId:`courier`,exit:{c:7,r:4},screenedEscape:!0},spawns:[{...e.spawns[0],c:6,r:0},{...e.spawns[1],c:4,r:0},{...e.spawns[2],c:5,r:1}],squadHint:`Pursue north under the marksman's TARGET LOCK, or anchor the exit while the squad controls the courier. TARGET LOCK tracks its marked ally: break firing range, close inside minimum range, interrupt, or protect. A one-cell sidestep alone does not cancel it.`};if(t?.reportVersion===6&&t.veteranChallenge===`pack-extraction-v1`){if(e.missionId!==`field-relay-recovery`)throw Error(`invalid_veteran_mission`);return{...e,name:`VETERAN · PACK EXTRACTION`,briefCopy:`Bring all three squad members within 2 orthogonal cells of the relay, then RECOVER on an even round by round 6. A lone runner cannot extract the pack. No progression or currency rewards.`,objective:{type:`RECOVER`,terminal:{c:6,r:2},completed:!1,squadExtractionRadius:2},challenge:void 0,squadHint:`CNC screens while SHADOW protects the convoy, or use PET mobility and CNC control to regroup. Every deployed unit must reach the extraction area.`}}if(t?.reportVersion===5&&t.masteryChallenge===`relay-lockdown-v1`){if(e.missionId!==`field-relay-hold`||![`anchor`,`crosslink`].includes(t.lockdownPlan))throw Error(`invalid_lockdown_plan`);let n=At(e,{...t,reportVersion:4});if(t.lockdownPlan===`anchor`)return{...n,name:`RELAY LOCKDOWN · ANCHOR`};let r=[{c:3,r:1},{c:4,r:2},{c:3,r:3}];return{...n,name:`RELAY LOCKDOWN · CROSSLINK`,briefCopy:`Occupy the north, east, then south relay tiles at three consecutive round changes. Clear adjacent enemies at each checkpoint. Miss one and the sequence resets to north. Moving between checkpoints does not reset progress. Finish by round 6; normal support recharge.`,objective:{type:`HOLD`,terminal:r[0],relayRoute:r,radius:1,holderRadius:0,duration:3,progress:0,checkedRound:1},squadHint:`ALPHA rotates while CNC clears the next relay. Bring SHADOW for healing, or PET for slows and mobility. No specific sidegrade required.`}}if(t?.reportVersion===4&&t.masteryChallenge===`relay-lockdown-v1`){if(e.missionId!==`field-relay-hold`)throw Error(`invalid_mastery_mission`);return{...e,name:`RELAY LOCKDOWN`,briefCopy:`Keep one ally ON the relay tile for 3 consecutive round changes by the end of round 6. Any enemy within 1 orthogonal cell contests it and resets progress. Support recharges 1 personal turn slower; one HOUND arrives in round 2. Decide who anchors the tile and who clears the approaches.`,objective:{type:`HOLD`,terminal:{c:3,r:2},radius:1,holderRadius:0,duration:3,progress:0,checkedRound:1},squadHint:`Anchor ALPHA with SHADOW protection while CNC clears the approach, or trade SHADOW sustain for PET mobility and control. The holder cannot evade off the tile without resetting progress.`,resultsCopy:`Optional Relay Lockdown result recorded. Relay Mastery remains unlocked; no currency, Commander or Pack Mastery rewards.`}}return e.missionId===`field-relay-intercept`&&t?.reportVersion!=null&&t.reportVersion<3?Tt:e}function jt(e,t,n,r=`standard`){if(e.operationId===xt.operationId){let r=yt(t,n);return r?[...r.slice(0,3),...e.spawns||[]]:null}if(e.activity===`FIELD_OP`){let i=yt(t,n);return i&&Ke[r]?[...i.slice(0,3).map((e,t)=>({...e,...Ke[r].cells[t]})),...e.spawns||[]]:null}return e.objectiveType===`RECOVER`?vt(t,n):e.objectiveType===`BOSS`?yt(t,n):e.spawns||null}function Mt(e,t=!1,n,r){e=At(e,n);let i=e.objective?structuredClone(e.objective):e.objectiveType===`RECOVER`&&e.terminal?{type:`RECOVER`,terminal:{...e.terminal},completed:!1}:e.objectiveType===`BOSS`?{type:`BOSS`,targetId:`leader`}:null,a=lt(nt(e,n)),o=a?.reinforcement||(e.objectiveType===`BOSS`?{..._t,spawn:{..._t.spawn},telegraphed:t,spawned:!1}:null);return e.activity===`FIELD_OP`&&o&&n&&n.pressure<2&&(o.triggerRound+=1),e.missionId===`dead-relay-hold`&&o&&r?.courierTraceAcquired&&(o.triggerRound=3),{objective:i,directive:a,reinforcement:o}}var Nt={RECON:{title:`GHOST SIGNAL`,copy:`Recover the relay, then intercept the courier. Win with positioning and information.`,missions:[`field-relay-recovery`,`field-relay-intercept`,`dead-relay-courier`],effect:`DELAY_REINFORCEMENT`},DEFENSE:{title:`HOLD THE CHAIN`,copy:`Secure two contested locations, then keep the full squad alive.`,missions:[`field-relay-hold`,`field-isolated-hold`,`field-squad-survival`],effect:`SOUTH_APPROACH`},INTERDICTION:{title:`BREAK THE COMMAND`,copy:`Stop the courier, defend a flank, then defeat the relay Guardian.`,missions:[`field-relay-intercept`,`field-rearguard`,`dead-relay-guardian`],effect:`COMMAND_DISRUPTION`}},Pt=new Set(Object.values(Nt).flatMap(e=>[...e.missions]));function Ft(e){if(!e||typeof e!=`object`||Array.isArray(e))return null;let t=e;if(t.version!==1||t.chapterId!==`edge-relay`||![`AVAILABLE`,`ACTIVE`,`COMPLETED`].includes(String(t.status))||t.doctrine!==null&&!Object.hasOwn(Nt,String(t.doctrine))||!Number.isSafeInteger(t.revision)||Number(t.revision)<0||!Array.isArray(t.completedMissionIds)||t.completedMissionIds.some(e=>typeof e!=`string`||!Pt.has(e))||new Set(t.completedMissionIds).size!==t.completedMissionIds.length||t.activeRunId!==null&&(typeof t.activeRunId!=`string`||!t.activeRunId)||![`NONE`,`DELAY_REINFORCEMENT`,`SOUTH_APPROACH`,`COMMAND_DISRUPTION`].includes(String(t.intelEffect))||t.intelConsumedByRunId!==null&&(typeof t.intelConsumedByRunId!=`string`||!t.intelConsumedByRunId)||t.lastReceiptId!==null&&(typeof t.lastReceiptId!=`string`||!t.lastReceiptId))return null;let n=t.doctrine,r=t.completedMissionIds;return t.status===`AVAILABLE`&&(n!==null||r.length!==0||t.activeRunId!==null||t.intelEffect!==`NONE`)||t.status!==`AVAILABLE`&&!n||n&&(r.some(e=>!Nt[n].missions.includes(e))||Nt[n].missions.some((e,t)=>t<r.length&&r[t]!==e))||t.status===`COMPLETED`&&(!n||r.length!==3||t.activeRunId!==null||t.intelEffect!==Nt[n].effect)||t.status===`ACTIVE`&&r.length>=3?null:{version:1,chapterId:`edge-relay`,status:t.status,doctrine:n,revision:Number(t.revision),completedMissionIds:[...r],activeRunId:t.activeRunId,intelEffect:t.intelEffect,intelConsumedByRunId:t.intelConsumedByRunId,lastReceiptId:t.lastReceiptId}}function It(e){return e.status!==`ACTIVE`||!e.doctrine?null:Nt[e.doctrine].missions[e.completedMissionIds.length]||null}function Lt(e){let t=It(e);return{complete:e.status===`COMPLETED`,stage:e.completedMissionIds.length,total:3,title:e.doctrine?Nt[e.doctrine].title:`CHOOSE YOUR DOCTRINE`,nextMissionId:t,nextMissionName:t?W(t)?.name||t:null,consequence:e.status===`COMPLETED`?`Server-recorded campaign Intel is available only under the accepted next-run contract.`:e.doctrine?Nt[e.doctrine].copy:`Doctrine selection must be recorded by the server before deployment.`}}var Rt={alpha:[`vanguard`,`howlkeeper`],"ally-02":[`pursuer`,`disruptor`],"ally-03":[`sentinel`,`medic`]},zt={alpha:[`alpha-strike`,`alpha-rend`,`alpha-howl`],"ally-02":[`u02-shot`,`u02-burst`,`u02-suppress`],"ally-03":[`u03-tap`,`u03-mend`,`u03-pack`]},Bt=[{skillId:`alpha-strike`,rank:1,label:`Long Step`,description:`Strike reaches one tile farther.`,rangeDelta:1},{skillId:`alpha-strike`,rank:2,label:`Relentless`,description:`Strike reaches two tiles farther.`,rangeDelta:2},{skillId:`alpha-rend`,rank:1,label:`Deep Cut`,description:`Bleed lasts one additional turn.`,durationDelta:1},{skillId:`alpha-rend`,rank:2,label:`Open Wound`,description:`Bleed lasts two additional turns.`,durationDelta:2},{skillId:`alpha-howl`,rank:1,label:`Pack Echo`,description:`Howl cooldown reduced by one turn.`,cooldownDelta:-1},{skillId:`alpha-howl`,rank:2,label:`Pack Rhythm`,description:`Howl cooldown reduced by two turns.`,cooldownDelta:-2},{skillId:`u02-shot`,rank:1,label:`Long Reach`,description:`Thrust reaches one additional tile.`,rangeDelta:1},{skillId:`u02-shot`,rank:2,label:`Pursuit`,description:`Thrust reaches two additional tiles.`,rangeDelta:2},{skillId:`u02-burst`,rank:1,label:`Rapid Lunge`,description:`Lunge cooldown reduced by one.`,cooldownDelta:-1},{skillId:`u02-burst`,rank:2,label:`Flow State`,description:`Lunge cooldown reduced by two.`,cooldownDelta:-2},{skillId:`u02-suppress`,rank:1,label:`Sustained Pressure`,description:`Pressure control lasts longer.`,durationDelta:1},{skillId:`u02-suppress`,rank:2,label:`Signal Lock`,description:`Pressure control lasts two turns longer.`,durationDelta:2},{skillId:`u03-tap`,rank:1,label:`Extended Reach`,description:`Basic skill reaches one tile farther.`,rangeDelta:1},{skillId:`u03-tap`,rank:2,label:`Relay Reach`,description:`Basic skill reaches two tiles farther.`,rangeDelta:2},{skillId:`u03-mend`,rank:1,label:`Fast Recovery`,description:`Mend cooldown reduced by one.`,cooldownDelta:-1},{skillId:`u03-mend`,rank:2,label:`Field Triage`,description:`Mend cooldown reduced by two.`,cooldownDelta:-2},{skillId:`u03-pack`,rank:1,label:`Long Watch`,description:`Pack support lasts one extra turn.`,durationDelta:1},{skillId:`u03-pack`,rank:2,label:`Hold Together`,description:`Pack support lasts two extra turns.`,durationDelta:2}];function Vt(e){if(!e||typeof e!=`object`)throw Error(`invalid_growth_snapshot`);let t=e;if(t.version!==1&&t.version!==2||!Number.isSafeInteger(t.revision)||t.revision<0||!Array.isArray(t.heroes)||t.heroes.length!==3)throw Error(`invalid_growth_snapshot`);let n=Object.keys(Rt);for(let e of n){let n=t.heroes.find(t=>t&&t.heroId===e);if(!n||t.heroes.filter(t=>t&&t.heroId===e).length!==1)throw Error(`invalid_growth_hero`);if(n.discipline!==null&&!Rt[e].includes(n.discipline))throw Error(`invalid_growth_discipline`);if(!n.ranks||typeof n.ranks!=`object`||Array.isArray(n.ranks))throw Error(`invalid_growth_ranks`);if(Object.keys(n.ranks).length&&n.discipline===null)throw Error(`invalid_growth_discipline`);if(n.respecUsed!==void 0&&typeof n.respecUsed!=`boolean`)throw Error(`invalid_growth_respec`);for(let[t,r]of Object.entries(n.ranks))if(!zt[e].includes(t)||!Number.isInteger(r)||r<1||r>2)throw Error(`invalid_growth_rank`)}return t}function Ht(e){let t=e.split(`:mastery:`)[0];switch(t){case`alpha-reach-rend`:return`alpha-rend`;case`u02-lunge-vanguard`:return`u02-burst`;case`u02-pressure-disruptor`:return`u02-suppress`;case`u03-mend-restorer`:return`u03-mend`;case`u03-pack-warden`:return`u03-pack`;default:return t}}function Ut(e,t){let n=Ht(e.id);if(!t||!zt[t.heroId]?.includes(n))return e;let r=t.ranks[n]??0;if(!Number.isInteger(r)||r<0||r>2)return e;let i=r?Bt.find(e=>e.skillId===n&&e.rank===r):void 0,a=t.rulesVersion===2,o=a&&n===`u03-mend`,s={...e,maxRange:Math.max(e.minRange,e.maxRange+(i?.rangeDelta??0)+(o&&r>0&&e.targetType===`ALLY_SINGLE`?1:0)),cooldownMax:Math.max(+(e.cooldownMax>0),e.cooldownMax+(o?0:i?.cooldownDelta??0)),effects:e.effects.map(e=>e.kind===`status`&&i?.durationDelta?{...e,duration:(e.duration??1)+i.durationDelta}:{...e})};switch(o&&r>0&&e.targetType===`ALLY_AOE`&&(s.radius+=1),o&&r===2&&s.effects.push({kind:`status`,status:`GUARD`,duration:1,value:.2,on:e.targetType===`ALLY_AOE`?`aoe_allies`:`primary`,maxHpRatio:.5}),t.discipline){case`vanguard`:n===`alpha-howl`&&!s.effects.some(e=>e.status===`GUARD`)&&s.effects.push({kind:`status`,status:`GUARD`,duration:1,value:.2,on:`aoe_allies`});break;case`howlkeeper`:e.id===`alpha-howl`&&(s.radius+=1);break;case`pursuer`:n===`u02-shot`&&(s.maxRange+=1);break;case`disruptor`:n===`u02-suppress`&&(s.effects=s.effects.map(e=>e.kind===`status`?{...e,duration:(e.duration??1)+1}:e));break;case`sentinel`:a&&n===`u03-pack`&&s.effects.some(e=>e.status===`GUARD`)&&(s.effects=s.effects.map(e=>e.status===`GUARD`?{...e,duration:(e.duration??1)+1}:e)),n===`u03-pack`&&!s.effects.some(e=>e.status===`GUARD`)&&s.effects.push({kind:`status`,status:`GUARD`,duration:1,value:.2,on:`aoe_allies`});break;case`medic`:n===`u03-mend`&&(s.cooldownMax=Math.max(1,s.cooldownMax-1),a&&e.cooldownMax===1&&e.id.endsWith(`:mastery:SHADOW:3:A`)&&(s.effects=s.effects.map(e=>e.kind===`heal`?{...e,base:(e.base??0)+8}:e)))}return a&&n===`u03-mend`&&(s.desc=`MEND: ${s.targetType===`ALLY_AOE`?`radius ${s.radius}`:`range ${s.maxRange}`}; cooldown ${s.cooldownMax}. ${r?Gt(n,r,2):`Restore HP to an ally.`}${t.discipline===`medic`&&e.cooldownMax===1?` STEADY HAND: +8 base healing at the cooldown floor.`:``}`),s}function Wt(e,t){let n=e?.heroes.find(e=>e.heroId===t);return n?{...n,ranks:{...n.ranks},rulesVersion:e.version}:void 0}function Gt(e,t,n=1){return n===2&&e===`u03-mend`?t===1?`Rescue reach +1 cell (RESTORER: radius +1). Cooldown unchanged.`:`Keeps rescue reach. Allies at 50% HP or less before MEND gain 20% GUARD for 1 personal turn.`:Bt.find(n=>n.skillId===e&&n.rank===t)?.description||``}function Kt(e,t,n,r){if(!r||n!==`field-relay-recovery`||!e||typeof e!=`object`||Array.isArray(e))return null;let i=e;if(i.version!==1||i.runId!==t||!t.startsWith(`field_recover_v1_`)||i.kind!==`FIRST_RECOVERY_SUPPLY`&&i.kind!==`VETERAN_SERVICE_DISTINCTION`)return null;if(i.status===`UNAVAILABLE`)return{version:1,kind:i.kind,runId:t,status:`UNAVAILABLE`};if(i.kind===`FIRST_RECOVERY_SUPPLY`){if(i.status===`AWARDED`){let e=i.award;return e&&typeof e==`object`&&!Array.isArray(e)&&e.scrap===12?{version:1,kind:i.kind,runId:t,status:`AWARDED`,award:{scrap:12}}:null}return i.status===`ALREADY_AWARDED`&&typeof i.awardedRunId==`string`&&i.awardedRunId.startsWith(`field_recover_v1_`)?{version:1,kind:i.kind,runId:t,status:`ALREADY_AWARDED`,awardedRunId:i.awardedRunId}:null}if(i.status!==`AWARDED`&&i.status!==`IMPROVED`&&i.status!==`ALREADY_AWARDED`)return null;let a=i.record;if(!a||typeof a!=`object`||Array.isArray(a))return null;let o=a;return o.version!==1||typeof o.utcWeek!=`string`||!/^\d{4}-W(?:0[1-9]|[1-4]\d|5[0-3])$/.test(o.utcWeek)||typeof o.runId!=`string`||!o.runId.startsWith(`field_recover_v1_`)||!Number.isSafeInteger(o.completedAt)||Number(o.completedAt)<=0||!Number.isSafeInteger(o.bestRounds)||Number(o.bestRounds)<1||!Number.isSafeInteger(o.squadStanding)||Number(o.squadStanding)<1||Number(o.squadStanding)>3||i.status!==`ALREADY_AWARDED`&&o.runId!==t?null:{version:1,kind:i.kind,runId:t,status:i.status,record:{version:1,utcWeek:o.utcWeek,runId:o.runId,completedAt:Number(o.completedAt),bestRounds:Number(o.bestRounds),squadStanding:Number(o.squadStanding)}}}var qt=`tactical-intent-vnext.0`,Jt=e=>e&&typeof e==`object`&&!Array.isArray(e)?e:null,Yt=e=>Number.isInteger(e)&&Number(e)>=1&&Number(e)<=6,Xt=e=>typeof e==`string`&&/^trial_[a-z0-9]{6,}$/i.test(e);function Zt(e){let t=Jt(e);return!t||!Xt(t.runId)||!Yt(t.level)||t.trialRevision!==1||t.trialId!==`relay-pressure-v1-l${t.level}`||typeof t.victory!=`boolean`||t.objectiveComplete!==t.victory||!Number.isInteger(t.turns)||Number(t.turns)<1||Number(t.turns)>8||!Number.isInteger(t.squadStanding)||Number(t.squadStanding)<0||Number(t.squadStanding)>3||t.squadDeployed!==3||t.failureReason!==null&&t.failureReason!==`DEADLINE`||!Number.isInteger(t.recordedAt)||Number(t.recordedAt)<0||t.evidenceSource!==`ACCEPTED_CLIENT_REPORT`?null:t}function Qt(e){let t=Jt(e);return!t||!Xt(t.runId)||!Yt(t.level)||t.trialRevision!==1||t.trialId!==`relay-pressure-v1-l${t.level}`||!Array.isArray(t.squadIds)||t.squadIds.length!==3||t.squadIds[0]!==`alpha`||!t.squadIds.every(e=>typeof e==`string`)||new Set(t.squadIds).size!==3||!Jt(t.trialContext)||typeof t.trialContext.encounterHash!=`string`||!Jt(t.trialContext.encounter)||!Jt(t.rulesContract)||!Jt(t.combatProfileV3)||!Jt(t.combatProfileV2)||!Jt(t.playerGrowth)||!Jt(t.packMastery)||![`rend`,`reach-rend`].includes(String(t.fieldRend))?null:t}function $t(e){let t=Jt(e);if(!t||t.version!==1||typeof t.enabled!=`boolean`||t.trialRevision!==1||t.maxLevel!==6||!Number.isInteger(t.highestCleared)||Number(t.highestCleared)<0||Number(t.highestCleared)>6||t.rewardPolicy!==`NO_REWARDS`||t.evidenceSource!==`ACCEPTED_CLIENT_REPORT`||!Array.isArray(t.clears)||t.clears.length!==t.highestCleared)return null;for(let e=0;e<t.clears.length;e++){let n=Jt(t.clears[e]);if(!n||n.level!==e+1||n.trialRevision!==1||n.trialId!==`relay-pressure-v1-l${e+1}`||!Xt(n.runId)||!Number.isInteger(n.recordedAt))return null}let n=t.activeRun==null?null:Qt(t.activeRun),r=t.lastResult==null?null:Zt(t.lastResult);return t.activeRun!=null&&!n||t.lastResult!=null&&!r?null:{...t,activeRun:n,lastResult:r}}var en={"field-relay-recovery":`RECOVER`,"field-relay-intercept":`INTERCEPT`,"field-relay-hold":`HOLD`,"field-isolated-hold":`HOLD`,"field-squad-survival":`SURVIVE`,"field-rearguard":`SURVIVE`};function tn(e){if(!e||typeof e!=`object`)return;let t=e;return t.version===1&&Number.isInteger(t.credits)&&t.credits>=0&&t.credits<=12&&Array.isArray(t.missionIds)&&t.missionIds.every(e=>Object.hasOwn(en,e))&&(t.lastCycle===null||Number.isInteger(t.lastCycle))&&typeof t.enabled==`boolean`?{...t,missionIds:[...t.missionIds]}:void 0}function nn(e,t=!1){return!!e&&e.credits>=12&&new Set(e.missionIds).size>=(t?4:2)&&new Set(e.missionIds.map(e=>en[e])).size>=(t?3:2)}function rn(e,t){let n=new Set(e?.missionIds.map(e=>en[e]));return t?`${t===`SHADOW`?`HOLD + SURVIVE`:`RECOVER + INTERCEPT`} · ${n.size}/2 objective families · 1 credit per rotation`:`${new Set(e?.missionIds).size}/4 missions · ${n.size}/3 objective families · 1 credit per rotation`}var an={CNC:{name:`STATIC FIELD`,copy:`PRESSURE becomes radius-1 control with no damage. Range -1 and cooldown +1. A/B control timing still applies.`},SHADOW:{name:`FOCUSED WARD`,copy:`PACK SUPPORT becomes 3-turn GUARD with no healing, radius -1 and cooldown +1. Trade coverage for protection duration.`},PET:{name:`EXTRACTION SCOUT`,copy:`RECOVER reaches 3 cells. HAMSTRING cooldown +1. Trade control frequency for objective reach.`}},on={CREDIT_AVAILABLE:`Win an Advanced mission for a Veteran credit. Your result confirms it.`,DIVERSITY_AVAILABLE:`Try a different Advanced mission. It can build your Veteran record, but adds no extra credit.`,ROTATION_CREDIT_USED:`Veteran credit saved! One per rotation. No second credit yet — try an unfinished challenge.`,VETERAN_COMPLETE:`Veteran complete! Pack Extraction is practice — no new rewards.`,COMMANDER_CERTIFICATION_REQUIRED:`Earn Commander Rank 3 first. Finish your open missions and challenges.`,ADVANCED_UNAVAILABLE:`Advanced is not available right now.`,NO_MEANINGFUL_OBJECTIVE:`No new Veteran goal right now. Try unfinished missions or come back next rotation.`,STATUS_UNAVAILABLE:`Veteran status unavailable. Other missions are still playable; no credit promised.`};function sn(e,t){if(!e||typeof e!=`object`)return;let n=e;if(!(n.version!==1||!Number.isInteger(n.cycleId)||n.cycleId!==t||![`eligible`,`claimed`,`locked`,`unknown`].includes(n.status)||!Object.hasOwn(on,n.reason)||!Array.isArray(n.missionIds)||n.missionIds.some(e=>typeof e!=`string`||W(e)?.activity!==`FIELD_OP`)||new Set(n.missionIds).size!==n.missionIds.length||(n.status===`eligible`?!n.recommendedMissionId||!n.missionIds.includes(n.recommendedMissionId)||![`CREDIT_AVAILABLE`,`DIVERSITY_AVAILABLE`].includes(n.reason):n.recommendedMissionId!==null||n.missionIds.length!==0||[`CREDIT_AVAILABLE`,`DIVERSITY_AVAILABLE`].includes(n.reason))))return{...n,missionIds:[...n.missionIds]}}function cn(e,t,n,r=!1){let i={status:`unknown`,copy:on.STATUS_UNAVAILABLE};if(n?.masteryChallenge||n?.veteranChallenge)return{status:`locked`,copy:`Practice only. No Veteran credit or rewards.`};if(r&&(n?.progressionVersion!==2||n.cycleId!==e?.board?.cycleId))return{status:`unknown`,copy:`Your saved mission keeps its original rules. The result decides Veteran credit.`};let a=sn(e?.veteranOpportunity,e?.board?.cycleId);return e?.board?.nextRotationAt&&e.board.nextRotationAt*1e3<=Date.now()?{status:`unknown`,copy:`Rotation ended. Refresh for new missions. No credit promised yet.`}:a?a.status===`eligible`?t&&!a.missionIds.includes(t)?{status:`locked`,copy:`No Veteran credit here. Try the recommended Advanced mission.`}:t&&n?.directiveTier!==`advanced`?{status:`locked`,copy:`Pick Advanced for Veteran credit. Standard does not count.`}:{status:`eligible`,copy:on[a.reason]}:{status:a.status,copy:on[a.reason]}:i}function ln(e){return{CREDIT_RECORDED:`Rotation credit saved. Another mission cannot add a second credit this rotation.`,DIVERSITY_RECORDED:`Objective diversity recorded. The credit total is unchanged.`,ROTATION_CREDIT_USED:on.ROTATION_CREDIT_USED,VETERAN_COMPLETE:on.VETERAN_COMPLETE,ADVANCED_ACCEPTED_CLEAR_REQUIRED:`An eligible accepted Advanced victory in the current rotation was required. This receipt confirms no new Veteran credit.`,NEW_VETERAN_CONTRACT_REQUIRED:`This accepted run predates the Veteran contract. Its original conditions were preserved.`,FOUNDATION_REQUIRED_AT_START:`Companion Foundation Mastery was required when this run was accepted.`,OBJECTIVE_NOT_ELIGIBLE:`This objective does not qualify for this companion’s Veteran role.`}[e]||`No additional Veteran eligibility detail supplied by this receipt.`}var un={"pet-bite":{id:`pet-bite`,name:`BITE`,desc:`Quick melee bite. Range 1.`,slot:`A1`,cooldownMax:0,targetType:`ENEMY_SINGLE`,minRange:1,maxRange:1,radius:0,effects:[{kind:`damage`,multiplier:1,on:`hits`}]},"pet-hamstring":{id:`pet-hamstring`,name:`HAMSTRING`,desc:`Melee bite. Slows enemy initiative by 50% for 2 turns, buying time to reach the relay.`,slot:`A2`,cooldownMax:3,targetType:`ENEMY_SINGLE`,minRange:1,maxRange:1,radius:0,effects:[{kind:`damage`,multiplier:.6,on:`hits`},{kind:`status`,status:`SPD_DOWN`,duration:2,value:.5,on:`hits`}]},"alpha-strike":{id:`alpha-strike`,name:`STRIKE`,desc:`Melee hit. Range 1.`,slot:`A1`,cooldownMax:0,targetType:`ENEMY_SINGLE`,minRange:1,maxRange:1,radius:0,effects:[{kind:`damage`,multiplier:1,on:`hits`}]},"alpha-rend":{id:`alpha-rend`,name:`REND`,desc:`Heavy melee hit. Applies Bleed for 2 turns.`,slot:`A2`,cooldownMax:3,targetType:`ENEMY_SINGLE`,minRange:1,maxRange:1,radius:0,effects:[{kind:`damage`,multiplier:1.45,on:`hits`},{kind:`status`,status:`BLEED`,duration:2,value:8,on:`hits`}]},"alpha-reach-rend":{id:`alpha-reach-rend`,name:`REACH REND`,desc:`Cut from up to 2 cells away. Weaker direct hit than Rend, with the same Bleed.`,slot:`A2`,cooldownMax:3,targetType:`ENEMY_SINGLE`,minRange:1,maxRange:2,radius:0,effects:[{kind:`damage`,multiplier:1.05,on:`hits`},{kind:`status`,status:`BLEED`,duration:2,value:8,on:`hits`}]},"alpha-howl":{id:`alpha-howl`,name:`HOWL`,desc:`Squad pressure. Nearby allies gain ATK and SPD for 2 turns.`,slot:`A3`,cooldownMax:4,targetType:`ALLY_AOE`,minRange:0,maxRange:0,radius:2,effects:[{kind:`status`,status:`ATK_UP`,duration:2,value:.3,on:`aoe_allies`},{kind:`status`,status:`SPD_UP`,duration:2,value:.3,on:`aoe_allies`}]},"u02-shot":{id:`u02-shot`,name:`THRUST`,desc:`Polearm reach strike. Range 3.`,slot:`A1`,cooldownMax:0,targetType:`ENEMY_SINGLE`,minRange:1,maxRange:3,radius:0,effects:[{kind:`damage`,multiplier:1,on:`hits`}]},"u02-burst":{id:`u02-burst`,name:`LUNGE`,desc:`Heavy reach hit. Range 3.`,slot:`A2`,cooldownMax:3,targetType:`ENEMY_SINGLE`,minRange:1,maxRange:3,radius:0,effects:[{kind:`damage`,multiplier:1.55,on:`hits`}]},"u02-suppress":{id:`u02-suppress`,name:`PRESSURE`,desc:`Reach control. Lowers enemy ATK for 2 turns.`,slot:`A3`,cooldownMax:3,targetType:`ENEMY_SINGLE`,minRange:1,maxRange:3,radius:0,effects:[{kind:`damage`,multiplier:.7,on:`hits`},{kind:`status`,status:`ATK_DOWN`,duration:2,value:.3,on:`hits`}]},"u02-lunge-vanguard":{id:`u02-lunge-vanguard`,name:`LUNGE`,slot:`A2`,desc:`VANGUARD: commit to range 1. Heavy hit; gain 50% initiative speed for 2 turns.`,cooldownMax:3,targetType:`ENEMY_SINGLE`,minRange:1,maxRange:1,radius:0,effects:[{kind:`damage`,multiplier:1.55,on:`hits`},{kind:`status`,status:`SPD_UP`,duration:2,value:.5,on:`self`}]},"u02-pressure-disruptor":{id:`u02-pressure-disruptor`,name:`PRESSURE`,slot:`A3`,desc:`DISRUPTOR: range 3. No damage; lower enemy ATK by 30% and initiative speed by 40% for 2 turns.`,cooldownMax:3,targetType:`ENEMY_SINGLE`,minRange:1,maxRange:3,radius:0,effects:[{kind:`status`,status:`ATK_DOWN`,duration:2,value:.3,on:`hits`},{kind:`status`,status:`SPD_DOWN`,duration:2,value:.4,on:`hits`}]},"u03-tap":{id:`u03-tap`,name:`SWEEP`,desc:`Staff contact. Range 2.`,slot:`A1`,cooldownMax:0,targetType:`ENEMY_SINGLE`,minRange:1,maxRange:2,radius:0,effects:[{kind:`damage`,multiplier:.75,on:`hits`}]},"u03-mend":{id:`u03-mend`,name:`MEND`,desc:`Restore HP to one ally.`,slot:`A2`,cooldownMax:2,targetType:`ALLY_SINGLE`,minRange:0,maxRange:3,radius:0,effects:[{kind:`heal`,base:32,scale:.4,on:`primary`}]},"u03-pack":{id:`u03-pack`,name:`PACK SUPPORT`,desc:`Group mend. Nearby allies gain DEF for 2 turns.`,slot:`A3`,cooldownMax:4,targetType:`ALLY_AOE`,minRange:0,maxRange:0,radius:2,effects:[{kind:`heal`,base:18,scale:.2,on:`aoe_allies`},{kind:`status`,status:`DEF_UP`,duration:2,value:.4,on:`aoe_allies`}]},"u03-mend-restorer":{id:`u03-mend-restorer`,name:`MEND`,slot:`A2`,desc:`RESTORER: heal SHADOW and allies within 1 cell. Replaces the range-3 single-target heal.`,cooldownMax:2,targetType:`ALLY_AOE`,minRange:0,maxRange:0,radius:1,effects:[{kind:`heal`,base:32,scale:.4,on:`aoe_allies`}]},"u03-pack-warden":{id:`u03-pack-warden`,name:`PACK SUPPORT`,slot:`A3`,desc:`WARDEN: protect SHADOW and allies within 2 cells for 2 turns. Halves incoming damage; no healing or DEF boost.`,cooldownMax:4,targetType:`ALLY_AOE`,minRange:0,maxRange:0,radius:2,effects:[{kind:`status`,status:`GUARD`,duration:2,value:.5,on:`aoe_allies`}]},"hound-fortify":{id:`hound-fortify`,name:`BULWARK GUARD`,desc:`Protect the frontline by reducing incoming damage.`,slot:`A2`,cooldownMax:3,targetType:`SELF`,minRange:0,maxRange:0,radius:0,effects:[{kind:`status`,status:`GUARD`,duration:2,value:.5,on:`self`}]},"hound-pulse":{id:`hound-pulse`,name:`PULSE SHOT`,desc:`Medium-to-long range signal pulse. Weak at close quarters.`,slot:`A1`,cooldownMax:0,targetType:`ENEMY_SINGLE`,minRange:2,maxRange:4,radius:0,effects:[{kind:`damage`,multiplier:.85,on:`hits`}]},"hound-aim":{id:`hound-aim`,name:`TARGET LOCK`,desc:`Precise ranged attack which marks a vulnerable target.`,slot:`A2`,cooldownMax:3,targetType:`ENEMY_SINGLE`,minRange:2,maxRange:4,radius:0,effects:[{kind:`damage`,multiplier:1.2,on:`hits`},{kind:`status`,status:`DEF_DOWN`,duration:2,value:.2,on:`hits`}]},"hound-interference":{id:`hound-interference`,name:`SIGNAL JAM`,desc:`Jams one squad member and weakens their attack and speed.`,slot:`A2`,cooldownMax:3,targetType:`ENEMY_SINGLE`,minRange:1,maxRange:3,radius:0,effects:[{kind:`damage`,multiplier:.35,on:`hits`},{kind:`status`,status:`ATK_DOWN`,duration:2,value:.25,on:`hits`},{kind:`status`,status:`SPD_DOWN`,duration:2,value:.2,on:`hits`}]},"hostile-strike":{id:`hostile-strike`,name:`STRIKE`,desc:`Melee contact.`,slot:`A1`,cooldownMax:0,targetType:`ENEMY_SINGLE`,minRange:1,maxRange:1,radius:0,effects:[{kind:`damage`,multiplier:1,on:`hits`}]},"hostile-maul":{id:`hostile-maul`,name:`MAUL`,desc:`Heavy melee. Lowers ATK for 1 turn.`,slot:`A2`,cooldownMax:3,targetType:`ENEMY_SINGLE`,minRange:1,maxRange:1,radius:0,effects:[{kind:`damage`,multiplier:1.3,on:`hits`},{kind:`status`,status:`ATK_DOWN`,duration:1,value:.25,on:`hits`}]},"leader-strike":{id:`leader-strike`,name:`STRIKE`,desc:`Heavy melee contact.`,slot:`A1`,cooldownMax:0,targetType:`ENEMY_SINGLE`,minRange:1,maxRange:1,radius:0,effects:[{kind:`damage`,multiplier:1,on:`hits`}]},"leader-crush":{id:`leader-crush`,name:`CRUSH`,desc:`Devastating melee blow.`,slot:`A2`,cooldownMax:3,targetType:`ENEMY_SINGLE`,minRange:1,maxRange:1,radius:0,effects:[{kind:`damage`,multiplier:1.5,on:`hits`}]},"leader-intimidate":{id:`leader-intimidate`,name:`INTIMIDATE`,desc:`Tactical pressure. Lowers target ATK for 2 turns.`,slot:`A3`,cooldownMax:4,targetType:`ENEMY_SINGLE`,minRange:1,maxRange:2,radius:0,effects:[{kind:`damage`,multiplier:.55,on:`hits`},{kind:`status`,status:`ATK_DOWN`,duration:2,value:.3,on:`hits`}]}};function dn(e){let t=un[e];if(!t)throw Error(`Unknown skill ${e}`);return t}var fn={"ally-02":{name:`CNC`,trained:{name:`REACH CONTROL`,copy:`PRESSURE reaches 1 cell farther, including DISRUPTOR.`,effect:{slot:`A3`,range:1}},options:{A:{name:`RELENTLESS`,copy:`PRESSURE recharges 1 personal turn sooner.`,effect:{slot:`A3`,cooldown:-1}},B:{name:`PIN DOWN`,copy:`PRESSURE debuffs last 1 personal turn longer.`,effect:{slot:`A3`,statusDuration:1}}}},"ally-03":{name:`SHADOW`,trained:{name:`WIDE SHELTER`,copy:`PACK SUPPORT reaches allies 1 cell farther, including WARDEN.`,effect:{slot:`A3`,radius:1}},options:{A:{name:`STEADY HAND`,copy:`MEND recharges 1 personal turn sooner, including RESTORER.`,effect:{slot:`A2`,cooldown:-1}},B:{name:`SILENT SHELTER`,copy:`PACK SUPPORT keeps its protection but removes healing and ignores Disrupted Support's extra cooldown. MEND still counts as healing.`,effect:{slot:`A3`,noHealing:!0,ignoreDisruption:!0}}}},PET:{name:`PET`,trained:{name:`RELAY SCOUT`,copy:`RECOVER works from 2 cells away. Signal windows still apply.`,effect:{recoverRange:2}},options:{A:{name:`REACHING SNARE`,copy:`HAMSTRING reaches 1 cell farther; control a nearby threat without leaving your position.`,effect:{slot:`A2`,range:1}},B:{name:`PATHFINDER`,copy:`Move 1 extra cell per personal turn to reach objectives or regroup with SHADOW.`,effect:{move:1}}}}},pn=e=>{let t=e.startsWith(`pet:`)?`PET`:e;return Object.hasOwn(fn,t)?fn[t]:void 0},mn=(e,t)=>e?.[t]||{progress:0,stage:1,unlockedOptions:[],selected:null};function hn(e){if(!e||typeof e!=`object`)return{};let t={};for(let[n,r]of Object.entries(e)){if(!pn(n)||!r||typeof r!=`object`)continue;let e=r,i=Number.isInteger(e.progress)&&e.progress>=0?Math.min(8,e.progress):0,a=tn(e.veteran),o=i>=8&&nn(a)?4:i>=8?3:i>=3?2:1;t[n]={progress:i,stage:o,unlockedOptions:o>=3?[`A`,`B`]:[],selected:o>=3?e.selected===`B`?`B`:`A`:null,...a?{veteran:a}:{}}}return t}function gn(e,t){return e.map(e=>{let n=pn(e.id),r=mn(t,e.id);if(!n||r.stage<2)return e;let i=structuredClone(e.unitDef||k[e.defId]);i.combatMastery={progress:r.progress,stage:r.stage,selected:r.selected};let a=r.stage===4&&r.veteran?.enabled===!0,o=[n.trained,...r.stage>=3&&r.selected?[n.options[r.selected]]:[]];for(let{effect:e}of o)e.move&&(i.move+=e.move),e.recoverRange&&(i.recoverRange=e.recoverRange);return a&&n.name===`PET`&&(i.recoverRange=3),i.skillIds=i.skillIds.map(e=>{let t=un[e],i=o.filter(({effect:e})=>e.slot===t.slot),s=a&&(n.name===`PET`&&t.slot===`A2`||n.name!==`PET`&&t.slot===`A3`);if(!i.length&&!s)return e;let c=`${e}:mastery:${n.name}:${r.stage}:${r.selected||`none`}${a?`:veteran`:``}`;if(!un[c]){let e=structuredClone(t);e.id=c;for(let{name:t,copy:n,effect:r}of i){e.maxRange+=r.range||0,e.radius+=r.radius||0,e.cooldownMax=Math.max(0,e.cooldownMax+(r.cooldown||0)),r.noHealing&&(e.effects=e.effects.filter(e=>e.kind!==`heal`)),r.ignoreDisruption&&(e.ignoreDisruption=!0);for(let t of e.effects)t.kind===`status`&&t.duration&&(t.duration+=r.statusDuration||0);e.desc+=` Mastery / ${t}: ${n}`}s&&(e.cooldownMax+=1,n.name===`CNC`?(e.targetType=`AREA_RADIUS`,e.radius=1,e.maxRange=Math.max(1,e.maxRange-1),e.effects=e.effects.filter(e=>e.kind!==`damage`)):n.name===`SHADOW`&&(e.radius=Math.max(1,e.radius-1),e.effects=[{kind:`status`,status:`GUARD`,duration:3,value:.5,on:`aoe_allies`}]),e.desc+=` Veteran option: reduced frequency; role-specific utility.`),un[c]=e}return c}),{...e,unitDef:i}})}function _n(e,t){return[e?.fieldOps?.activeMissionRun,e?.chapterActiveMission,...Object.values(e?.operations||{}).map(e=>e.activeMissionRun)].some(e=>e?.squadIds.includes(t))}var vn={attack:3,defense:3,hp:12,initiative:1};function yn(e,t){if(e.version!==1)return 0;let n=Number(e[t]);return Number.isFinite(n)?Math.max(0,Math.min(vn[t],Math.floor(n))):0}function bn(e){let t=e&&typeof e==`object`?e:{};return{version:1,attack:yn(t,`attack`),defense:yn(t,`defense`),hp:yn(t,`hp`),initiative:yn(t,`initiative`)}}var xn=[`strength`,`agility`,`defense`,`vitality`,`intelligence`,`luck`];function Sn(e){if(!e||typeof e!=`object`||Array.isArray(e))throw Error(`invalid_combat_profile_v2`);return e}function Cn(e,t){if(Object.keys(e).length!==t.length||!t.every(t=>Object.prototype.hasOwnProperty.call(e,t)))throw Error(`invalid_combat_profile_v2`)}function wn(e,t,n){if(typeof e!=`number`||!Number.isInteger(e)||e<t||e>n)throw Error(`invalid_combat_profile_v2`);return e}function Tn(e,t=!1){let n=Sn(e);Cn(n,[...xn]);let r={};for(let e of xn)r[e]=wn(n[e],t?-1e3:0,1e4);return r}function En(e,t){if(typeof e!=`string`||e.length<1||e.length>t)throw Error(`invalid_combat_profile_v2`);return e}function Dn(e){if(e===void 0)return null;let t=Sn(e);if(Cn(t,[`version`,`mode`,`alpha`,`pet`]),t.version!==2||t.mode!==`inputs-only`)throw Error(`invalid_combat_profile_v2`);let n=Sn(t.alpha);Cn(n,[`level`,`base`,`gear`]);let r={level:wn(n.level,1,1e4),base:Tn(n.base),gear:Tn(n.gear,!0)},i=null;if(t.pet!==null){let e=Sn(t.pet);Cn(e,[`id`,`name`,`img`,`level`,`effective`]);let n=En(e.img,2048);if(!n.startsWith(`https://`))throw Error(`invalid_combat_profile_v2`);i={id:En(e.id,128),name:En(e.name,128),img:n,level:wn(e.level,1,1e4),effective:Tn(e.effective)}}return{version:2,mode:`inputs-only`,alpha:r,pet:i}}var On=[`hp`,`atk`,`def`,`spd`];function kn(e){if(!e||typeof e!=`object`||Array.isArray(e))throw Error(`invalid_combat_profile_v3`);return e}function An(e,t){if(Object.keys(e).length!==t.length||!t.every(t=>Object.prototype.hasOwnProperty.call(e,t)))throw Error(`invalid_combat_profile_v3`)}function jn(e,t,n){if(typeof e!=`number`||!Number.isInteger(e)||e<t||e>n)throw Error(`invalid_combat_profile_v3`);return e}function Mn(e,t,n){let r={};return On.forEach((i,a)=>{r[i]=jn(e[i],t[a],t[a]+n[a])}),r}function Nn(e){if(e===void 0)return null;let t=kn(e);if(An(t,Object.prototype.hasOwnProperty.call(t,`gearImpactV31`)?[`version`,`mode`,`alpha`,`pet`,`gearImpactV31`]:[`version`,`mode`,`alpha`,`pet`]),t.version!==3||t.mode!==`battle-v1`)throw Error(`invalid_combat_profile_v3`);let n=kn(t.alpha);An(n,[...On]);let r=Mn(n,[120,28,12,14],[18,11,9,2]),i=null;if(t.pet!==null){let e=kn(t.pet);An(e,[`id`,`name`,`img`,...On]);for(let t of[`id`,`name`,`img`])if(typeof e[t]!=`string`||!e[t].length||e[t].length>(t===`img`?2048:128))throw Error(`invalid_combat_profile_v3`);if(!e.img.startsWith(`https://`))throw Error(`invalid_combat_profile_v3`);i={id:e.id,name:e.name,img:e.img,...Mn(e,[78,18,6,13],[13,7,5,2])}}let a;if(Object.prototype.hasOwnProperty.call(t,`gearImpactV31`)){let e=kn(t.gearImpactV31);An(e,[`offense`,`guard`]),a={offense:jn(e.offense,0,2e4),guard:jn(e.guard,0,4e4)}}return{version:3,mode:`battle-v1`,alpha:r,pet:i,...a?{gearImpactV31:a}:{}}}function Pn(e,t,n){if(!t)return e;if(!n||n.pet?.id!==t.pet?.id||n.pet===null!=(t.pet===null))throw Error(`combat_profile_version_mismatch`);let r=0,i=0,a=e.map(e=>{if(e.defId===`alpha`)return r++,{...e,unitDef:{...e.unitDef||k.alpha,...t.alpha,...t.gearImpactV31?{gearImpactV31:t.gearImpactV31}:{}}};if(e.defId.startsWith(`pet:`)||e.id.startsWith(`pet:`)){if(i++,!t.pet||e.id!==`pet:${t.pet.id}`||!e.unitDef)throw Error(`combat_pet_mismatch`);let{hp:n,atk:r,def:a,spd:o}=t.pet;return{...e,unitDef:{...e.unitDef,hp:n,atk:r,def:a,spd:o}}}return e});if(r!==1||i>1||i>0&&!t.pet)throw Error(`combat_squad_mismatch`);return a}function Fn(e,t){return Pn(e,t.activeRunId&&t.foundationRunRules?.runId===t.activeRunId&&t.foundationRunRules.rulesContract.combatProfileVersion===3&&t.activeCombatProfileV3||null,t.activeCombatProfileV2)}function In(e){"@babel/helpers - typeof";return In=typeof Symbol==`function`&&typeof Symbol.iterator==`symbol`?function(e){return typeof e}:function(e){return e&&typeof Symbol==`function`&&e.constructor===Symbol&&e!==Symbol.prototype?`symbol`:typeof e},In(e)}function Ln(e,t){if(In(e)!=`object`||!e)return e;var n=e[Symbol.toPrimitive];if(n!==void 0){var r=n.call(e,t||`default`);if(In(r)!=`object`)return r;throw TypeError(`@@toPrimitive must return a primitive value.`)}return(t===`string`?String:Number)(e)}function Rn(e){var t=Ln(e,`string`);return In(t)==`symbol`?t:t+``}function zn(e,t,n){return(t=Rn(t))in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function Bn(e){if(!e||typeof e!=`object`)return;let t=e,n=t.fieldContractsVersion===1&&t.reportVersion===3&&[`rend`,`reach-rend`].includes(t.fieldRend);if(t.fieldContractsVersion==null&&t.fieldRend==null||n){if(t.reportVersion===6)return t.veteranChallenge===`pack-extraction-v1`&&t.masteryChallenge==null&&t.lockdownPlan==null&&t.progressionVersion===2&&Number.isInteger(t.cycleId)&&t.pressure===2&&[`standard`,`south`].includes(t.approach)&&t.directiveTier===`advanced`&&t.directiveSet===`pursuit`?{...t}:void 0;if(t.veteranChallenge==null&&(t.lockdownPlan==null||t.reportVersion===5&&[`anchor`,`crosslink`].includes(t.lockdownPlan))&&(t.reportVersion!==5||[`anchor`,`crosslink`].includes(t.lockdownPlan))){if([4,5].includes(t.reportVersion))return t.masteryChallenge!==`relay-lockdown-v1`||!Number.isInteger(t.cycleId)||t.pressure!==2||![`standard`,`south`].includes(t.approach)||t.directiveTier!==`advanced`||t.directiveSet!==`pursuit`?void 0:{...t};if(t.masteryChallenge==null&&!(!Number.isInteger(t.cycleId)||!Number.isInteger(t.pressure)||t.pressure<0||t.pressure>3||![`standard`,`south`].includes(t.approach)||![1,2,3].includes(t.reportVersion))&&(t.reportVersion!==3||[`standard`,`advanced`].includes(t.directiveTier)&&[`pursuit`,`attrition`].includes(t.directiveSet)))return{...n?{fieldContractsVersion:1,fieldRend:t.fieldRend}:{},cycleId:t.cycleId,pressure:t.pressure,approach:t.approach,reportVersion:t.reportVersion,...t.reportVersion===3?{directiveTier:t.directiveTier,directiveSet:t.directiveSet,...t.progressionVersion===2?{progressionVersion:2}:{}}:{}}}}}function Vn(e){if(!e||typeof e!=`object`)return null;let t=e;return typeof t.runId!=`string`||typeof t.missionId!=`string`||typeof t.victory!=`boolean`||typeof t.challengeSuccess!=`boolean`||typeof t.regionalApplied!=`boolean`||![t.cycleId,t.challengeBonus,t.progressEarned,t.progressBefore,t.progressAfter,t.rankBefore,t.rankAfter,t.pressureBefore,t.pressureAfter,t.recordedAt].every(Number.isInteger)||!Array.isArray(t.unlockedApproaches)||!t.unlockedApproaches.every(e=>e===`standard`||e===`south`)||t.veteranChallenge!=null&&(t.veteranChallenge!==`pack-extraction-v1`||t.missionId!==`field-relay-recovery`||t.masteryChallenge!=null||t.progressEarned!==0||t.challengeBonus!==0)||t.lockdownPlan!=null&&(t.masteryChallenge!==`relay-lockdown-v1`||![`anchor`,`crosslink`].includes(t.lockdownPlan))||t.firstLockdownClear!=null&&(!Ge(t.firstLockdownClear)||t.masteryChallenge!==`relay-lockdown-v1`)||t.lockdownFirstClear!=null&&(typeof t.lockdownFirstClear!=`boolean`||t.masteryChallenge!==`relay-lockdown-v1`)||t.lockdownFirstClear===!0&&(!t.victory||t.firstLockdownClear?.runId!==t.runId||t.firstLockdownClear?.cycleId!==t.cycleId||t.firstLockdownClear?.recordedAt!==t.recordedAt)?null:{...t,contractAward:t.victory&&!t.legacyReport&&!t.masteryChallenge&&!t.veteranChallenge?I(t.contractAward,t.missionId):void 0,rewardAmountsAvailable:Number.isInteger(t.xpGranted)&&Number.isInteger(t.bonesGranted),firstUpgradeScrapGranted:t.victory&&t.missionId===`field-relay-recovery`&&or(t.runId)&&!t.veteranChallenge&&!t.masteryChallenge&&t.firstUpgradeScrapGranted===8?8:void 0,xpGranted:Number.isInteger(t.xpGranted)?Number(t.xpGranted):0,bonesGranted:Number.isInteger(t.bonesGranted)?Number(t.bonesGranted):0}}function Hn(e){try{return Vt(e)}catch{return null}}function Un(e){let t=Hn(e);if(!t)throw new G(`invalid_growth_snapshot`);return t}function Wn(e,t){if(!e||typeof e!=`object`||!Number.isSafeInteger(t)||t<0)return null;let n=e,r=Hn({...n,revision:t});return!r||!Number.isSafeInteger(n.earnedPoints)||Number(n.earnedPoints)<0||!Number.isSafeInteger(n.spentPoints)||Number(n.spentPoints)<0||Number(n.spentPoints)>Number(n.earnedPoints)||!Array.isArray(n.claimedFirstClears)||n.claimedFirstClears.length!==Number(n.earnedPoints)||n.claimedFirstClears.some(e=>typeof e!=`string`)||new Set(n.claimedFirstClears).size!==n.claimedFirstClears.length||r.heroes.some(e=>typeof e.respecUsed!=`boolean`)||r.heroes.reduce((e,t)=>e+Object.values(t.ranks).reduce((e,t)=>e+t,0),0)!==Number(n.spentPoints)?null:{...r,earnedPoints:Number(n.earnedPoints),spentPoints:Number(n.spentPoints),claimedFirstClears:[...n.claimedFirstClears]}}var G=class extends Error{constructor(e,t=null){super(e),zn(this,`code`,void 0),zn(this,`state`,void 0),this.code=e,this.state=t}};function Gn(){if(typeof window>`u`)return null;let e=window,t=e.apiPost||e.S?.apiPost||e.AH?.apiPost;return typeof t==`function`?t:null}function Kn(e){if(!e||typeof e!=`object`)return null;let t=e,n=String(t.foundationStage||``);if(![`solo-1`,`solo-2`,`ally-koda`,`full-broken-signal`,`completed`].includes(n))return null;let r=Number(t.revision);if(!Number.isInteger(r)||r<0)return null;let i={packMastery:hn(t.packMastery),version:1,vnextStartAvailable:t.vnextStartAvailable===!0,foundationStage:n,completed:t.completed===!0||n===`completed`,revision:r,activeRunId:typeof t.activeRunId==`string`&&t.activeRunId?t.activeRunId:null,lastCompletedRunId:typeof t.lastCompletedRunId==`string`&&t.lastCompletedRunId?t.lastCompletedRunId:null,updatedAt:Number.isFinite(Number(t.updatedAt))?Number(t.updatedAt):0};if(Object.prototype.hasOwnProperty.call(t,`signalTrials`)){let e=$t(t.signalTrials);if(!e)return null;i.signalTrials=e}if(t.foundationRunRules!=null){let e=t.foundationRunRules;if(!e||typeof e!=`object`||Array.isArray(e)||typeof e.runId!=`string`||e.runId!==i.activeRunId)return null;let n=Ue(e.rulesContract);if(!n)return null;i.foundationRunRules={runId:e.runId,rulesContract:n}}if(Object.prototype.hasOwnProperty.call(t,`playerGrowth`)){let e=Wn(t.playerGrowth,r);if(!e)return null;i.playerGrowth=e}if(t.deadRelayHoldRevisionAvailable===2&&(i.deadRelayHoldRevisionAvailable=2),t.fieldOps&&typeof t.fieldOps==`object`){let e=t.fieldOps;if(!e.records||typeof e.records!=`object`)return null;let n={};for(let[t,r]of Object.entries(e.records)){if(!r||typeof r!=`object`)return null;let e=r;if(e.missionId!==t||!Number.isInteger(e.clearCount)||Number(e.clearCount)<0)return null;n[t]={missionId:t,completed:Number(e.clearCount)>0,clearCount:Number(e.clearCount),lastClearedAt:Number(e.lastClearedAt)||0,failCount:Number(e.failCount)||0,lastClearCycle:Number.isInteger(e.lastClearCycle)?Number(e.lastClearCycle):null,lastChallengeCycle:Number.isInteger(e.lastChallengeCycle)?Number(e.lastChallengeCycle):null},Array.isArray(e.squadIds)&&e.squadIds.every(e=>typeof e==`string`)&&(n[t].squadIds=[...e.squadIds]);for(let r of[`challengeCount`,`advancedClearCount`]){let i=e[r];typeof i==`number`&&Number.isSafeInteger(i)&&i>=0&&(n[t][r]=i)}n[t].lastAdvancedCycle=Number.isInteger(e.lastAdvancedCycle)?Number(e.lastAdvancedCycle):null}let r=Qn({field:{...e,status:`active`,missions:{}}});if(!r)return null;if(i.fieldOps={records:n,activeMissionRun:r.field.activeMissionRun,lastCompletedMissionRunId:r.field.lastCompletedMissionRunId},e.firstUpgradeSupplyMissionId===`field-relay-recovery`&&(i.fieldOps.firstUpgradeSupplyMissionId=e.firstUpgradeSupplyMissionId),e.interceptRevisionAvailable===2&&(i.fieldOps.interceptRevisionAvailable=2),e.veteranProgressionAvailable===!0){let t=tn(e.veteranCareer);if(!t)return null;i.fieldOps.veteranProgressionAvailable=!0,i.fieldOps.veteranCareer=t}if(e.lockdownPlansAvailable===!0&&(i.fieldOps.lockdownPlansAvailable=!0),e.masteryPath!=null){let t=e.masteryPath;if(t.version!==1||t.accomplishment!==null&&(![`field-relay-hold`,`field-isolated-hold`].includes(t.accomplishment?.missionId)||t.accomplishment?.evidence!==`SERVER_ADVANCED_HOLD`)||t.unlockedChallenge!==(t.accomplishment?`relay-lockdown-v1`:null))return null;let n=Ge(t.firstLockdownClear);if(t.firstLockdownClear!=null&&(!n||!t.accomplishment))return null;i.fieldOps.masteryPath={...t,...Object.prototype.hasOwnProperty.call(t,`firstLockdownClear`)?{firstLockdownClear:n}:{}}}if(e.board!=null||e.commander!=null||e.region!=null){let t=e.board,n=e.commander,r=e.region;if(!t||!Number.isInteger(t.cycleId)||!Number.isInteger(t.nextRotationAt)||!Array.isArray(t.activeMissionIds)||t.activeMissionIds.length!==3||new Set(t.activeMissionIds).size!==3||!t.activeMissionIds.every(e=>typeof e==`string`)||!n||![1,2,3,...e.veteranProgressionAvailable===!0?[4]:[]].includes(n.rank)||!Number.isInteger(n.progress)||n.progress<0||!Array.isArray(n.unlockedApproaches)||!n.unlockedApproaches.every(e=>e===`standard`||e===`south`)||t.reportVersion!=null&&(t.reportVersion!==3||![`pursuit`,`attrition`].includes(t.directiveSet))||n.unlockedDirectiveTiers!=null&&(!Array.isArray(n.unlockedDirectiveTiers)||!n.unlockedDirectiveTiers.every(e=>[`standard`,`advanced`].includes(e)))||!r||!Number.isInteger(r.pressure)||r.pressure<0||r.pressure>3||r.cycleId!==t.cycleId)return null;let a=e.rotationProgress;if(a!=null&&(!Number.isInteger(a.cycleId)||a.cycleId!==t.cycleId||!Number.isInteger(a.securedCount)||!Number.isInteger(a.total)||a.total!==3||a.securedCount<0||a.securedCount>a.total||![a.clearedMissionIds,a.challengeMissionIds,a.advancedMissionIds].every(e=>Array.isArray(e)&&e.every(e=>typeof e==`string`&&t.activeMissionIds.includes(e)))||typeof a.frontSecured!=`boolean`||a.frontSecured!==(a.securedCount===a.total)))return null;let o=e.careerRecord;if(o!=null&&(o.version!==1||![o.missionSecures,o.challenges,o.advancedClears,o.frontsSecured].every(e=>Number.isInteger(e)&&e>=0)||o.lastSecuredCycle!=null&&!Number.isInteger(o.lastSecuredCycle)))return null;Object.assign(i.fieldOps,{board:t,commander:n,region:r,...a?{rotationProgress:a}:{},...o?{careerRecord:o}:{},lastResult:Vn(e.lastResult)}),i.fieldOps.fieldContracts=F(e.fieldContracts,t);let s=sn(e.veteranOpportunity,t.cycleId);s&&s.missionIds.every(e=>t.activeMissionIds.includes(e))&&(i.fieldOps.veteranOpportunity=s)}}if(Object.prototype.hasOwnProperty.call(t,`tacticalChapter`)){let e=Ft(t.tacticalChapter);if(!e)return null;if(i.tacticalChapter=e,t.chapterActiveMission!=null){let n=t.chapterActiveMission;if(!n||typeof n!=`object`||Array.isArray(n)||typeof n.runId!=`string`||n.runId!==e.activeRunId||typeof n.missionId!=`string`||!Array.isArray(n.squadIds)||!n.squadIds.every(e=>typeof e==`string`)||n.rulesContract?.rulesetVersion!==`tactical-intent-vnext.0`)return null;let r=Bn(n.fieldContext);if(n.fieldContext!=null&&!r)return null;let a=Ue(n.rulesContract);if(!a||a.missionId!==n.missionId||!qn(n.chapterContext))return null;i.chapterActiveMission={runId:n.runId,missionId:n.missionId,squadIds:[...n.squadIds],rulesContract:a,chapterContext:qn(n.chapterContext),packMastery:hn(n.packMastery),tacticalProfile:bn(n.tacticalProfile),...n.playerGrowth==null?{}:{playerGrowth:Un(n.playerGrowth)},...n.combatProfileV2==null?{}:{combatProfileV2:Dn(n.combatProfileV2)},...Zn(n,a),...Yn(n.campaignContext)?{campaignContext:Yn(n.campaignContext)}:{},...r?{fieldContext:r}:{}}}}let a=Qn(t.operations);if(i.playerIdentity=t.playerIdentity&&typeof t.playerIdentity==`object`?t.playerIdentity:void 0,i.activeTacticalProfile=bn(t.activeTacticalProfile),Object.prototype.hasOwnProperty.call(t,`activeCombatProfileV2`)&&(i.activeCombatProfileV2=Dn(t.activeCombatProfileV2)),Object.prototype.hasOwnProperty.call(t,`activeCombatProfileV3`)){if(!i.activeRunId||i.foundationRunRules?.runId!==i.activeRunId||!i.activeCombatProfileV2)return null;let e;try{e=Nn(t.activeCombatProfileV3)}catch{return null}if(!e||e.pet?.id!==i.activeCombatProfileV2.pet?.id)return null;i.activeCombatProfileV3=e}if(i.equippedPet=$e(t.equippedPet),a&&(i.operations=a),t.campaignIntel&&typeof t.campaignIntel==`object`){let e=t.campaignIntel[`dead-relay`];e&&typeof e==`object`&&typeof e.courierTraceAcquired==`boolean`&&(i.campaignIntel={"dead-relay":{courierTraceAcquired:e.courierTraceAcquired}})}return i.kodaSidegrade=a?.[`broken-signal`]?.status===`cleared`&&(t.kodaSidegrade===`A`||t.kodaSidegrade===`B`)?t.kodaSidegrade:null,i.shadowSidegrade=a?.[`broken-signal`]?.status===`cleared`&&(t.shadowSidegrade===`A`||t.shadowSidegrade===`B`)?t.shadowSidegrade:null,t.intel&&typeof t.intel==`object`&&(i.intel={routingTrace:!!t.intel.routingTrace,commanderProfile:!!t.intel.commanderProfile}),t.archive&&typeof t.archive==`object`&&(i.archive={brokenSignal:!!t.archive.brokenSignal}),(t.nextOperationSlot===`unassigned`||t.nextOperationSlot===null)&&(i.nextOperationSlot=t.nextOperationSlot),i}function qn(e){if(!e||typeof e!=`object`)return;let t=e;if(!(t.version!==1||t.chapterId!==`edge-relay`||t.doctrine!==`RECON`||!Number.isInteger(t.stageIndex)||Number(t.stageIndex)<0||Number(t.stageIndex)>2))return{version:1,chapterId:`edge-relay`,doctrine:`RECON`,stageIndex:Number(t.stageIndex)}}function Jn(e,t){if(!e||typeof e!=`object`)return;let n=e;if(n.version===1&&n.effect===`DELAY_REINFORCEMENT`&&n.sourceChapterId===`edge-relay`&&n.missionId===t&&Number.isInteger(n.baselineRound)&&Number.isInteger(n.effectiveRound)&&Number(n.effectiveRound)===Number(n.baselineRound)+1)return{version:1,effect:`DELAY_REINFORCEMENT`,sourceChapterId:`edge-relay`,missionId:t,baselineRound:Number(n.baselineRound),effectiveRound:Number(n.effectiveRound)}}function Yn(e){if(!e||typeof e!=`object`)return null;let t=e;return t.version===1&&typeof t.courierTraceAcquired==`boolean`?{version:1,courierTraceAcquired:t.courierTraceAcquired}:null}function Xn(e){if(!e||typeof e!=`object`)return null;let t=e;return typeof t.victory!=`boolean`||typeof t.objectiveComplete!=`boolean`||typeof t.missionId!=`string`||typeof t.runId!=`string`||typeof t.intelEarned!=`boolean`||![t.turns,t.squadStanding,t.squadDeployed].every(Number.isInteger)?null:{victory:t.victory,objectiveComplete:t.objectiveComplete,turns:Number(t.turns),squadStanding:Number(t.squadStanding),squadDeployed:Number(t.squadDeployed),missionId:t.missionId,runId:t.runId,intelEarned:t.intelEarned,...typeof t.failureReason==`string`?{failureReason:t.failureReason}:{}}}function Zn(e,t){if(!t&&!Object.prototype.hasOwnProperty.call(e,`combatProfileV3`))return{};let n=Nn(e.combatProfileV3);if(t&&!n)throw new G(`invalid_combat_profile_v3`);return{combatProfileV3:n}}function Qn(e){if(!e||typeof e!=`object`)return null;let t=e,n={};for(let[e,r]of Object.entries(t)){if(!r||typeof r!=`object`)return null;let t=r;if(t.status!==`active`&&t.status!==`cleared`||!t.missions||typeof t.missions!=`object`)return null;let i={};for(let[e,n]of Object.entries(t.missions)){if(n!==`locked`&&n!==`available`&&n!==`cleared`)return null;i[e]=n}let a=t.activeMissionRun,o=null;if(a!=null){if(typeof a!=`object`)return null;let e=a;if(typeof e.runId!=`string`||typeof e.missionId!=`string`)return null;let t=Array.isArray(e.squadIds)&&e.squadIds.every(e=>typeof e==`string`)?e.squadIds:[],n=Bn(e.fieldContext);if(e.fieldContext!=null&&(!n||n.masteryChallenge&&e.missionId!==`field-relay-hold`||n.veteranChallenge&&e.missionId!==`field-relay-recovery`))return null;let r=Ue(e.rulesContract);if(r&&(r.missionId!==e.missionId||r.missionRevision===2&&Ne(r.missionId)&&n?.reportVersion!==3))return null;o={runId:e.runId,missionId:e.missionId,squadIds:t,...r?{rulesContract:r}:{},tacticalProfile:bn(e.tacticalProfile),packMastery:hn(e.packMastery),...e.playerGrowth==null?{}:{playerGrowth:Un(e.playerGrowth)},...Object.prototype.hasOwnProperty.call(e,`combatProfileV2`)?{combatProfileV2:Dn(e.combatProfileV2)}:{},...Zn(e,r),...n?{fieldContext:n}:{},...Yn(e.campaignContext)?{campaignContext:Yn(e.campaignContext)}:{},...qn(e.chapterContext)?{chapterContext:qn(e.chapterContext)}:{},...Jn(e.chapterIntel,e.missionId)?{chapterIntel:Jn(e.chapterIntel,e.missionId)}:{}}}n[e]={status:t.status,missions:i,activeMissionRun:o,lastCompletedMissionRunId:typeof t.lastCompletedMissionRunId==`string`&&t.lastCompletedMissionRunId?t.lastCompletedMissionRunId:null}}return n}async function $n(e,t={}){let n=Gn();if(!n)throw new G(`progression_unavailable`);let r;try{r=await n(e,t)}catch(e){let t=e&&typeof e==`object`?e:{},n=t.data&&typeof t.data==`object`&&!Array.isArray(t.data)?t.data:t,r=n.details&&typeof n.details==`object`&&!Array.isArray(n.details)?n.details:null,i=typeof n.code==`string`?n.code:``,a=Number(t.status);throw new G(/^[a-z][a-z0-9_]{0,63}$/i.test(i)?i:Number.isInteger(a)&&a>=400&&a<=599?`http_${a}`:`progression_request_failed`,Kn(r?.state))}if(!r||typeof r!=`object`)throw new G(`invalid_progression_response`);let i=r,a=i.details;if(i.ok!==!0)throw new G(String(i.code||`progression_request_failed`),Kn(a?.state));return i}function er(e){let t=Kn(e.data);if(!t)throw new G(`invalid_progression_response`);return t}async function tr(){return er(await $n(`/webapp/tactical-foundation/state`))}async function nr(e,t,n){return er(await $n(`/webapp/tactical-foundation/start`,{requestId:e,expectedRevision:t,...n?{rulesetVersion:n}:{}}))}async function rr(e,t,n,r){return er(await $n(`/webapp/tactical-foundation/continue`,{requestId:e,expectedRevision:t,runId:n,...r?{rulesetVersion:r}:{}}))}async function ir(e,t,n){return er(await $n(`/webapp/tactical-foundation/chapter/choose`,{requestId:e,expectedRevision:t,doctrine:n}))}async function ar(e,t,n,r,i,a,o=!1,s,c,l){let u=await $n(o?`/webapp/tactical-foundation/chapter/mission/start`:`/webapp/tactical-foundation/mission/start`,{requestId:e,expectedRevision:t,missionId:n,...l?{missionRevision:l}:{},...c?{masteryVersion:c}:{},...r?{squadIds:r}:{},...i?{fieldOptions:i}:{},...a?{rulesetVersion:a}:{},...!o&&s?{chapterIntelVersion:s}:{},...!o&&n===`field-relay-recovery`?{recoverAuthorityVersion:1}:{}}),d=u.run;if(!d||typeof d!=`object`)throw new G(`invalid_progression_response`);let f=d;if(typeof f.runId!=`string`||!f.runId||f.missionId!==n)throw new G(`invalid_progression_response`);let p=Array.isArray(f.squadIds)&&f.squadIds.every(e=>typeof e==`string`)?f.squadIds:[],m=Bn(f.fieldContext);if(f.fieldContext!=null&&(!m||m.masteryChallenge&&n!==`field-relay-hold`||m.veteranChallenge&&n!==`field-relay-recovery`)||i?.veteranChallenge&&m?.veteranChallenge!==i.veteranChallenge||i?.lockdownPlan&&m?.lockdownPlan!==i.lockdownPlan||i?.masteryChallenge&&m?.masteryChallenge!==i.masteryChallenge)throw new G(`invalid_progression_response`);let h=Ue(f.rulesContract);if(h&&(h.missionId!==n||h.missionRevision===2&&Ne(n)&&m?.reportVersion!==3))throw new G(`invalid_run_rules_contract`);return{state:er(u),run:{started:f.started===!0,runId:f.runId,missionId:f.missionId,squadIds:p,...h?{rulesContract:h}:{},tacticalProfile:bn(f.tacticalProfile),packMastery:hn(f.packMastery),...f.playerGrowth==null?{}:{playerGrowth:Un(f.playerGrowth)},...Object.prototype.hasOwnProperty.call(f,`combatProfileV2`)?{combatProfileV2:Dn(f.combatProfileV2)}:{},...Zn(f,h),...m?{fieldContext:m}:{},...Yn(f.campaignContext)?{campaignContext:Yn(f.campaignContext)}:{},...qn(f.chapterContext)?{chapterContext:qn(f.chapterContext)}:{},...Jn(f.chapterIntel,f.missionId)?{chapterIntel:Jn(f.chapterIntel,f.missionId)}:{}}}}function or(e){return typeof e==`string`&&e.startsWith(`field_recover_v1_`)}async function sr(e,t,n){let r=(await $n(`/webapp/tactical-foundation/recover/${e}`,{runId:t,...n})).recover;if(r?.runId!==t||!Number.isSafeInteger(r.revision)||typeof r.token!=`string`||r.battle?.objective?.type!==`RECOVER`||!Array.isArray(r.battle.units)||!Array.isArray(r.threats))throw new G(`invalid_progression_response`);return r}function cr(e){return sr(`state`,e,{})}async function lr(e,t){let n=await sr(`command`,e.runId,{expectedRevision:e.revision,token:e.token,command:t});if(n.revision!==e.revision+1||!Array.isArray(n.frames))throw new G(`invalid_progression_response`);return n}async function ur(e,t,n,r=!1,i,a,o,s=!1){let c=!s&&or(n)?{}:{completionIntent:a?a.victory:!i||i.victory,routingTraceAcquired:r,...i?{fieldReport:i}:{},...a?{campaignReport:a}:{}},l=await $n(s?`/webapp/tactical-foundation/chapter/mission/continue`:`/webapp/tactical-foundation/mission/continue`,{requestId:e,expectedRevision:t,runId:n,...c,...o?{rulesetVersion:o}:{}}),u=l.chapterResult,d=u?.version===1&&u.chapterId===`edge-relay`&&typeof u.runId==`string`&&typeof u.missionId==`string`&&typeof u.victory==`boolean`&&Number.isInteger(u.stageRecorded)&&typeof u.chapterComplete==`boolean`&&u.combatProof===`CLIENT_REPORT_ONLY`?{version:1,chapterId:`edge-relay`,runId:u.runId,missionId:u.missionId,victory:u.victory,stageRecorded:Number(u.stageRecorded),chapterComplete:u.chapterComplete,combatProof:`CLIENT_REPORT_ONLY`}:null;if(s&&!d)throw new G(`invalid_chapter_receipt`);let f=Vn(l.fieldResult),p=f?Kt(l.rewardMilestone,f.runId,f.missionId,f.victory):null;return{state:er(l),firstClear:l.firstClear===!0,fieldResult:f,fieldMilestone:p,campaignResult:Xn(l.campaignResult),chapterResult:d}}async function dr(e,t,n,r){let i=await $n(`/webapp/tactical-foundation/trial/start`,{requestId:e,expectedRevision:t,level:n,trialRevision:1,squadIds:r,rulesetVersion:qt}),a=i.run,o=Qt(a),s=a,c=er(i);if(!o||o.level!==n||o.squadIds.join(`,`)!==r.join(`,`)||o.rulesContract.missionId!==`field-relay-hold`||c.signalTrials?.activeRun?.runId!==o.runId)throw new G(`invalid_trial_start_response`);return{state:c,run:o,started:s?.started===!0}}async function fr(e,t,n,r){let i=await $n(`/webapp/tactical-foundation/trial/continue`,{requestId:e,expectedRevision:t,runId:n,completionIntent:r.victory,trialReport:r,rulesetVersion:qt}),a=Zt(i.trialResult),o=er(i);if(!a||a.runId!==n||o.signalTrials?.lastResult?.runId!==n)throw new G(`invalid_trial_result_receipt`);return{state:o,trialResult:a}}async function pr(e,t,n){return er(await $n(`/webapp/tactical-foundation/field-rend`,{requestId:e,expectedRevision:t,choice:n}))}async function mr(e,t,n,r){return er(await $n(`/webapp/tactical-foundation/${n}-sidegrade`,{requestId:e,expectedRevision:t,[`${n}Sidegrade`]:r}))}async function hr(e,t,n,r,i,a){return er(await $n(`/webapp/tactical-foundation/growth/upgrade`,{requestId:e,expectedRevision:t,heroId:n,discipline:r,skillId:i,rank:a}))}async function gr(e,t,n){return er(await $n(`/webapp/tactical-foundation/growth/respec`,{requestId:e,expectedRevision:t,heroId:n}))}async function _r(e,t,n,r){return er(await $n(`/webapp/tactical-foundation/pack-mastery`,{requestId:e,expectedRevision:t,unitId:n,choice:r}))}function vr(e){let t=typeof crypto<`u`&&typeof crypto.randomUUID==`function`?crypto.randomUUID():String(Date.now())+`-`+Math.random().toString(36).slice(2);return`tops-foundation-`+e+`-`+t}function yr(e){let t=e.objective;return t?.type===`RECOVER`&&t.squadExtractionRadius!=null?`Bring all three allies within 2 orthogonal cells, then RECOVER on an even round by round 6.`:t?.type===`HOLD`&&t.relayRoute?`Occupy north, east, then south at consecutive round changes. Moving between checkpoints is allowed; missing one resets to north. Finish by round 6.`:t?.type===`HOLD`?t.holderRadius===0?`Keep an ally ON the relay tile for ${t.duration} consecutive round changes by round 6. Enemies within 1 orthogonal cell reset control.`:`Control the relay for ${t.duration} consecutive round changes. Enemies inside the zone reset control.`:t?.type===`SURVIVE`?`Keep every deployed squad member alive through ${t.duration} rounds. Eliminating enemies does not end the timer.`:t?.type===`INTERCEPT`?`Defeat the courier before it reaches the marked exit. Other hostiles do not need to be eliminated.`:e.objectiveType===`RECOVER`?`Move an ally within its RECOVER range of the relay (normally 1 orthogonal cell), then use RECOVER on its turn before spending its action.`:e.objectiveType===`BOSS`?`Defeat the marked commander. Other enemies are not the objective.`:`Eliminate every hostile.`}function br(e){return(e.objectiveType===`INTERCEPT`?`The courier reaches the exit or the entire squad falls.`:e.objectiveType===`SURVIVE`?`Any deployed squad member falls.`:`The entire squad falls.`)+(e.directive?.maxRounds?` Complete by the end of round ${e.directive.maxRounds}; round ${e.directive.maxRounds+1} starts with mission failure.`:``)}function xr(e,t){if(e.objective?.type===`RECOVER`&&e.objective.squadExtractionRadius!=null)return{clear:`NOT_APPLICABLE`,challenge:`NOT_APPLICABLE`,commander:`CERTIFIED`,copy:`Optional Veteran practice. No currency or progression rewards.`};if(e.objective?.type===`HOLD`&&e.objective.holderRadius===0)return{clear:`NOT_APPLICABLE`,challenge:`NOT_APPLICABLE`,commander:`CERTIFIED`,copy:`Optional unlocked challenge. No currency, Commander points, growth points, Pack Mastery or regional rewards.`};if(e.activity!==`FIELD_OP`)return{clear:`NOT_APPLICABLE`,challenge:`NOT_APPLICABLE`,commander:`UNKNOWN`,copy:`Campaign progress is recorded by the server.`};if(!t?.board||!t.commander)return{clear:`UNKNOWN`,challenge:`UNKNOWN`,commander:`UNKNOWN`,copy:`Refresh to check this rotation's confirmed rewards.`};let n=t.records?.[e.missionId];if(t.board.nextRotationAt&&t.board.nextRotationAt*1e3<=Date.now())return{clear:`UNKNOWN`,challenge:`UNKNOWN`,commander:`UNKNOWN`,copy:`This rotation ended. Refresh the War Table to check new opportunities.`};if(!n||!t.board.activeMissionIds.includes(e.missionId))return{clear:`UNKNOWN`,challenge:`UNKNOWN`,commander:`UNKNOWN`,copy:`No current reward eligibility supplied for this mission. Refresh the War Table; no bonus is promised.`};let r=n?.lastClearCycle===t.board.cycleId?`SECURED`:`AVAILABLE`,i=e.challenge?n?.lastChallengeCycle===t.board.cycleId?`SECURED`:`AVAILABLE`:`NOT_APPLICABLE`,a=t.commander.rank>=3||t.commander.certificationComplete?`CERTIFIED`:`ACTIVE`;return{clear:r,challenge:i,commander:a,copy:a===`CERTIFIED`?t.commander.rank>=4?`Rank 4 Veteran earned. Base Commander points no longer raise your rank.`:t.veteranProgressionAvailable===!0?`Rank 3 certified. Rank 4 Veteran career advances through eligible Advanced Field Ops across rotations, not base Commander points.`:`Rank 3 certified. No further Commander rank is currently available.`:r===`SECURED`&&i!==`AVAILABLE`?`Clear and challenge secured for this rotation.`:r===`SECURED`?`Clear secured; the optional challenge may still award progress.`:`A first clear and an unfinished challenge can award progress if confirmed by the server.`}}function Sr(e){let t=e.objective;if(t?.type===`RECOVER`&&t.squadExtractionRadius!=null)return`PACK EXTRACTION · REGROUP ALL 3`;if(t?.type===`HOLD`&&t.relayRoute)return`CROSSLINK ${t.progress}/${t.duration}`;if(t?.type===`HOLD`)return`HOLD ${t.progress}/${t.duration}`;if(t?.type===`SURVIVE`)return`SURVIVE ${t.progress}/${t.duration}`;if(t?.type===`INTERCEPT`){let n=e.units.find(e=>e.id===t.targetId);return n&&!n.defeated?`STOP COURIER BEFORE EXIT`:`COURIER STOPPED`}return t?.type===`RECOVER`?t.completed?`SIGNAL RECOVERED`:rt(e)?`SIGNAL OPEN`:`SIGNAL JAMMED`:t?.type===`BOSS`?e.units.some(e=>e.id===t.targetId&&!e.defeated)?`DEFEAT COMMANDER`:`COMMANDER DEFEATED`:`${e.units.filter(e=>e.team===`enemy`&&!e.defeated).length} HOSTILES REMAIN`}function Cr(e){let t=e.objective;if(t?.type===`RECOVER`&&t.squadExtractionRadius!=null)return Dr(e);if(t?.type===`HOLD`&&t.relayPressure&&t.terminal){let n=t.relayPressure.flank,r=at(e,t.terminal),i=n&&at(e,n.tile),a=n&&e.round>=n.activeRound,o=r===`CONTROLLED`?a&&i!==`CONTROLLED`?{name:`FLANK`,state:i}:null:{name:t.relayRoute?`ACTIVE RELAY`:`MAIN RELAY`,state:r};return{status:o?`${o.name} · ${o.state}`:n&&!a?`FLANK OPENS ROUND ${n.activeRound}`:`CHECKPOINT READY`,action:o?.state===`CONTESTED`?`Clear the adjacent hostiles before the round ends.`:o?`Move an ally onto the marked tile before the round ends.`:n&&!a?`Send a second holder to the marked flank.`:`Keep the required tiles clear and occupied through the end of the round.`,progress:t.progress,total:t.duration}}return t?.type===`HOLD`&&t.relayRoute?{status:`RELAY ${Math.min(t.progress+1,3)} · ${[`NORTH`,`EAST`,`SOUTH`][Math.min(t.progress,2)]}`,action:`Occupy relay ${Math.min(t.progress+1,3)} at ${t.terminal.c+1},${t.terminal.r+1} and clear adjacent enemies before the next round change.`,progress:t.progress,total:t.duration}:t?.type===`HOLD`?ot(e)?{status:`CONTROLLED`,action:`Keep an ally in the relay zone through the next round change.`,progress:t.progress,total:t.duration}:e.units.filter(e=>!e.defeated&&Math.abs(e.c-t.terminal.c)+Math.abs(e.r-t.terminal.r)<=(t.radius??0)).some(e=>e.team===`enemy`)?{status:`CONTESTED`,action:`Remove enemies from the marked relay zone.`,progress:t.progress,total:t.duration}:{status:`OCCUPY RELAY`,action:t.holderRadius===0?`Move a living ally ON the relay tile; adjacent allies do not hold it.`:`Move a living ally into the marked HOLD zone.`,progress:t.progress,total:t.duration}:t?.type===`SURVIVE`?{status:`KEEP SQUAD ALIVE`,action:`Hold formation until round ${t.duration+1} begins.`,progress:t.progress,total:t.duration}:t?.type===`INTERCEPT`?{status:`STOP COURIER`,action:`Defeat the courier before exit column ${t.exit.c+1}, row ${t.exit.r+1}. Block its route or focus attacks; patrol kills are optional.`,progress:null,total:null}:t?.type===`RECOVER`?Dr(e):t?.type===`BOSS`?{status:`DEFEAT COMMANDER`,action:`Defeat the marked commander. Ignore remaining patrol if safe.`,progress:null,total:null}:{status:`CLEAR HOSTILES`,action:`Eliminate the hostile squad.`,progress:null,total:null}}function wr(e,t){let n=e?.board;if(e?.activeMissionRun&&W(e.activeMissionRun.missionId))return{missionId:e.activeMissionRun.missionId,reason:or(e.activeMissionRun.runId)?`Resume from your last confirmed action.`:`Resume your accepted mission under its original conditions; the battle restarts at round 1.`};if(!n?.activeMissionIds?.length)return{missionId:null,reason:`Refresh the War Table to see the next mission.`};let r=n.activeMissionIds.find(t=>e?.records?.[t]?.lastClearCycle!==n.cycleId);if(r)return{missionId:r,reason:`Secure another Field Op to advance the current front.`};let i=n.activeMissionIds.find(t=>W(t)?.challenge&&e?.records?.[t]?.lastChallengeCycle!==n.cycleId);return i?{missionId:i,reason:`All Field Ops secured. An optional challenge is still open.`}:{missionId:t&&n.activeMissionIds.includes(t)?t:n.activeMissionIds[0],reason:`Front secured. Replay to practice tactics or return after the next rotation; no new Commander reward is promised.`}}function Tr(e,t,n,r,i){let a=n?.missionId===e.missionId,o=a?n?.fieldContext:i||(t?.board?{reportVersion:t.board.reportVersion||2}:void 0),s=o?At(e,o,a?n?.rulesContract?.missionRevision:void 0):e,c={...s,directive:Mt(s,!1,o).directive||void 0},l=a&&n?.fieldContext?.cycleId!=null&&t?.board&&n.fieldContext.cycleId!==t.board.cycleId;if(o?.veteranChallenge)return{missionId:e.missionId,objectiveText:yr(c),failConditionText:br(c),tacticalThreat:`Move the whole squad. A lone runner cannot extract; protect slower allies until an even-round window.`,nextConsequence:`The accepted optional practice result is recorded. No currency, Commander or Pack Mastery awards.`,rewardEligibility:xr(c,t),rewardClearText:`OPTIONAL VETERAN PRACTICE`,rewardChallengeText:`NO PROGRESSION REWARD`,nextAction:{missionId:e.missionId,reason:`Return to an eligible Advanced Field Op for progression.`},source:a?`ACCEPTED_RUN_AND_BACKEND_STATE`:`MISSION_DEFINITION_ONLY`};if(o?.masteryChallenge)return{missionId:e.missionId,objectiveText:yr(c),failConditionText:br(c),tacticalThreat:o.lockdownPlan===`crosslink`?`Clear the next relay and move or hand off the holder before each round change. Support recharges normally.`:`One ally must anchor the exact tile. Clear adjacent contesters while support recharges slowly; evading off the relay resets control.`,nextConsequence:`Relay Mastery stays permanently unlocked. A confirmed challenge result is saved without base Field Op or progression rewards.`,rewardEligibility:xr(c,t),rewardClearText:`OPTIONAL TACTICAL CHALLENGE`,rewardChallengeText:`NO PROGRESSION REWARD`,nextAction:{missionId:e.missionId,reason:`Try another holder or squad after recording the result.`},source:a?`ACCEPTED_RUN_AND_BACKEND_STATE`:`MISSION_DEFINITION_ONLY`};let u=l?{clear:`UNKNOWN`,challenge:`UNKNOWN`,commander:(t?.commander?.rank||0)>=3?`CERTIFIED`:`UNKNOWN`,copy:`Accepted run from an earlier rotation. Reward eligibility comes from its receipt; this run does not secure the current rotation.`}:xr(c,t),d=u.clear===`SECURED`?`CLEAR SECURED`:u.clear===`UNKNOWN`?`STATUS UNAVAILABLE`:u.clear===`NOT_APPLICABLE`?`CAMPAIGN RECORD`:u.commander===`CERTIFIED`?`FIRST CLEAR AVAILABLE`:`+2 COMMANDER IF ELIGIBLE`,f=u.challenge===`SECURED`?`CHALLENGE SECURED`:u.challenge===`UNKNOWN`?`STATUS UNAVAILABLE`:u.challenge===`NOT_APPLICABLE`?`NO FIELD CHALLENGE`:u.commander===`CERTIFIED`?`CHALLENGE OPEN`:`+1 COMMANDER IF ELIGIBLE`,p=c.activity===`FIELD_OP`?r?.missionId===c.missionId&&r.regionalApplied?`Latest recorded result changed Signal Pressure. Relevant reinforcements use the server-confirmed new pressure.`:`A first clear can secure this operation in the current rotation. Signal Pressure changes only if recorded by the server.`:c.resultsCopy;return{missionId:c.missionId,objectiveText:yr(c)+(c.objectiveType===`RECOVER`&&c.directive?.recoverEveryRounds?` Signal opens on rounds divisible by ${c.directive.recoverEveryRounds} (${c.directive.recoverEveryRounds}, ${c.directive.recoverEveryRounds*2}, …).`:``),failConditionText:br(c),tacticalThreat:c.objective?.type===`INTERCEPT`&&c.objective.screenedEscape?`Screened courier. TARGET LOCK follows its marked ally (range 2–4). Break range, close in, interrupt or protect.`:c.directive?.copy||c.squadHint||`Use positioning, skills and enemy ranges to control the encounter.`,nextConsequence:p,rewardEligibility:u,rewardClearText:d,rewardChallengeText:f,nextAction:wr(t,c.missionId),source:t?.board?`ACCEPTED_RUN_AND_BACKEND_STATE`:`MISSION_DEFINITION_ONLY`}}function Er(e){return e.masteryChallenge?e.victory?`RELAY LOCKDOWN RECORDED. RELAY MASTERY COMPLETE · 1/1.`:`LOCKDOWN ATTEMPT RECORDED. YOUR PERMANENT ACCESS IS PRESERVED.`:e.victory?e.veteranCareer?e.veteranCareer.unlocked?`RANK 4 · VETERAN. PACK EXTRACTION UNLOCKED.`:`VETERAN CAREER ${e.veteranCareer.before} → ${e.veteranCareer.after}/12. ${e.veteranCareer.reason.replaceAll(`_`,` `)}.`:e.rankAfter>=3?`COMMANDER RANK ${e.rankAfter} · ${e.progressEarned} POINTS RECORDED. ${e.rankAfter>e.rankBefore?`RANK ADVANCE CONFIRMED BY THIS RECEIPT.`:`NO ADDITIONAL RANK CONFIRMED BY THIS RECEIPT.`}`:e.progressEarned>0?`COMMANDER PROGRESS RECORDED. YOUR NEXT CERTIFICATION MILESTONE IS CLOSER.`:`NO NEW COMMANDER PROGRESS ON THIS CLEAR. CHECK UNFINISHED CHALLENGES OR REPLAY FOR PRACTICE.`:`MISSION FAILED. No clear recorded. Regroup and retry.`}function Dr(e){let t=e.objective;if(t?.type!==`RECOVER`)return{status:`NO RELAY`,action:``,progress:null,total:null};if(t.completed)return{status:`OBJECTIVE COMPLETE`,action:`Signal recovered.`,progress:null,total:null};let n=e.directive?.recoverEveryRounds||1,r=Math.ceil(e.round/n)*n,i=rt(e),a=e.units.find(t=>t.id===e.activeId),o=a?.team===`ally`&&!a.defeated,s=o&&a.recoverRange||1,c=o?Math.abs(a.c-t.terminal.c)+Math.abs(a.r-t.terminal.r):null,l=i?`Signal open for round ${e.round}.`:`Opens round ${r}; every ${n} rounds.`,u=t.squadExtractionRadius==null?null:e.units.filter(e=>e.team===`ally`&&!e.defeated&&Math.abs(e.c-t.terminal.c)+Math.abs(e.r-t.terminal.r)<=t.squadExtractionRadius).length;if(u!=null&&u<3)return{status:`PACK ${u}/3 AT RELAY`,action:`Move every living squad member within 2 orthogonal cells. ${l}`,progress:null,total:null};let d=c===null?`Wait for a living ally's turn.`:`Relay distance ${c}; range ${s} (orthogonal). ${c>s?a.hasMoved?`Move spent; use support or SKIP, then approach next turn.`:`MOVE closer, then RECOVER.`:a.hasActed?`Action spent; wait for this ally's next turn.`:`Use RECOVER before acting.`}`;return{status:i?`SIGNAL OPEN`:`OPENS ROUND ${r}`,action:`${l} ${d}`,progress:null,total:null}}function Or(e){if(!e?.fieldContracts?.enabled||!e.board||e.board.nextRotationAt*1e3<=Date.now()||e.board.reportVersion!==3)return null;let t=e.fieldContracts.eligibleMissionIds.find(t=>{let n=N(t);return n&&e.board.activeMissionIds.includes(t)&&W(t)?.executable&&!e.fieldContracts.completed.includes(n.id)}),n=t&&N(t);return n?{missionId:t,title:n.name,reason:n.objective,tier:`standard`,resume:!1}:null}function kr(e,t){if(t?.contractAward?.reward!==`reach-rend`)return;let n=e?.fieldOps,r=n?.board;if(!e?.completed||!e.vnextStartAvailable||n?.activeMissionRun||!n?.fieldContracts?.enabled||!n.fieldContracts.sidegrade||r?.reportVersion!==3||r.nextRotationAt*1e3<=Date.now())return;let i=r.activeMissionIds.filter(e=>{let t=W(e);return t?.activity===`FIELD_OP`&&t.executable}),a=Or(n);return(a&&i.includes(a.missionId)?a.missionId:void 0)||i.find(e=>e!==t.missionId)||i[0]}function Ar(e){return e?.firstUpgradeSupplyMissionId!==`field-relay-recovery`||e.board?.reportVersion!==3||e.board.nextRotationAt*1e3<=Date.now()?null:{missionId:e.firstUpgradeSupplyMissionId,title:`FIRST UPGRADE SUPPLY`,reason:`Win Standard Relay Recovery for a one-time supply of 8 Scrap for Rustfang Fangs.`,tier:`standard`,resume:!1}}function jr(e){let t=e?.fieldOps,n=Mr(e).primary;return n?.resume||n?.missionId===t?.firstUpgradeSupplyMissionId?n:(e?.vnextStartAvailable?Or(t):null)||n}function Mr(e){if(!e?.completed)return{primary:null,alternatives:[]};let t=e.fieldOps,n=t?.board,r=(e,t,n,r=`standard`,i=!1)=>({missionId:e,title:t,reason:n,tier:r,resume:i}),i=e.chapterActiveMission||t?.activeMissionRun||Object.values(e.operations||{}).find(e=>e.activeMissionRun)?.activeMissionRun,a=i&&W(i.missionId)?r(i.missionId,`FINISH YOUR ACCEPTED MISSION`,or(i.runId)?`Resume from your last confirmed action.`:`Your squad and mission are saved. Ready to go again from round 1?`,i.fieldContext?.directiveTier||`standard`,!0):null;if(a&&i?.fieldContext?.masteryChallenge&&(a.masteryChallenge=i.fieldContext.masteryChallenge),e.tacticalChapter?.status===`ACTIVE`&&e.tacticalChapter.doctrine===`RECON`&&(!i||i===e.chapterActiveMission)){let t=It(e.tacticalChapter);t&&(a={...r(t,i?`FINISH YOUR ACCEPTED CHAPTER RUN`:`CONTINUE GHOST SIGNAL`,`Complete the next chapter objective. Chapter progress and Intel advance only on an accepted server result.`,i?.fieldContext?.directiveTier||`standard`,!!i),chapter:!0})}if(!a&&!e.signalTrials?.activeRun&&(a=Ar(t)),!a)for(let n of[bt,xt]){if(n===xt&&(a=e.vnextStartAvailable?Or(t):null,a))break;let i=n.orderedMissionIds.find(t=>e.operations?.[n.operationId]?.missions[t]===`available`);if(i){a=r(i,`CONTINUE THE STORY`,i===`dead-relay-courier`?`Defeat the courier to open Hold. An early first win can record Courier Trace for delayed Hold reinforcements.`:i.endsWith(`hold`)?`Control the relay to unlock the Guardian.`:i.endsWith(`guardian`)?`Defeat the Guardian to record The Dead Relay campaign completion.`:i.endsWith(`commander`)?`Defeat the commander to complete Broken Signal.`:`Complete this story objective to unlock the next campaign mission.`);break}}let o=[];if(!a&&n?.nextRotationAt&&n.nextRotationAt*1e3<=Date.now())return{primary:null,alternatives:[]};let s=sn(t?.veteranOpportunity,n?.cycleId);if(!a&&s?.status===`eligible`&&s.recommendedMissionId&&n?.activeMissionIds.includes(s.recommendedMissionId)&&(a=r(s.recommendedMissionId,`VETERAN OPPORTUNITY`,s.reason===`DIVERSITY_AVAILABLE`?`Add missing mission or objective diversity with an Advanced victory. No additional credit is promised.`:`Win this Advanced fight for a shot at your Veteran credit. The result confirms what you earn.`,`advanced`)),!a&&t?.masteryPath&&(t.commander?.rank||0)>=3&&n?.reportVersion===3){if(t.masteryPath.unlockedChallenge){let e=!!t.masteryPath.firstLockdownClear,n=t.masteryPath.firstLockdownClear!==void 0,i={...r(`field-relay-hold`,e?`RELAY LOCKDOWN · COMPLETED`:`RELAY MASTERY · 1/1`,t.lockdownPlansAvailable?`Choose Anchor to defend one tile with slower support, or Crosslink to rotate north, east, then south with normal support. Optional practice; no currency or progression rewards.`:e?`Your first recorded Relay Lockdown clear is saved permanently. Try another holder or squad for optional practice; no further unlock or reward is promised.`:n?`Relay Mastery recorded. Win Relay Lockdown to save its first completion: hold the exact relay tile while nearby enemies contest it, with a deadline and slower support. No currency or progression rewards.`:`Relay Mastery recorded. Relay Lockdown is available for optional practice: hold the exact relay tile while nearby enemies contest it, with a deadline and slower support. No currency or progression rewards.`,`advanced`),masteryChallenge:t.masteryPath.unlockedChallenge};e?o.push(i):a=i}else{let e=n.activeMissionIds.find(e=>[`field-relay-hold`,`field-isolated-hold`].includes(e));e&&(a=r(e,`RELAY MASTERY · 0/1`,`Win this Advanced HOLD to record Relay Mastery and permanently unlock Relay Lockdown. Standard clears and aggregate Advanced totals do not qualify. The next challenge pins the holder to the relay tile under a deadline and slower support.`,`advanced`))}}if(n&&t?.records&&t.commander){for(let e of n.activeMissionIds){let i=W(e);if(!i)continue;let a=At(i,{reportVersion:n.reportVersion||2}),s=t.records[e];xr(a,t).clear!==`UNKNOWN`&&(s?.lastClearCycle!==n.cycleId&&o.push(r(e,`SECURE A FIELD OP`,`Your first win here is still up for grabs. Take the field!`)),a.challenge&&s?.lastChallengeCycle!==n.cycleId&&o.push(r(e,`OPTIONAL CHALLENGE`,`${a.challenge.label}. ${s?.lastClearCycle===n.cycleId?`Clear bonus already secured; an eligible challenge can still add progress.`:`First win and bonus challenge are still up for grabs.`}`)),t.commander.unlockedDirectiveTiers?.includes(`advanced`)&&s?.lastAdvancedCycle!==n.cycleId&&o.push(r(e,`ADVANCED CHALLENGE`,`Ready for a tougher fight? Win on Advanced to mark the challenge. No extra currency.`,`advanced`)))}let e=e=>e.title===`SECURE A FIELD OP`?0:e.title===`OPTIONAL CHALLENGE`?1:e.title===`ADVANCED CHALLENGE`?2:3;if(o.sort((t,n)=>e(t)-e(n)),!a&&(a=o.shift()||null,!a)){let e=wr(t),i=n.activeMissionIds.every(e=>!!t.records[e]);e.missionId&&(a=r(e.missionId,i?`PRACTICE WITH YOUR SQUAD`:`REVIEW FIELD CONDITIONS`,i?`Current clear and challenge goals are recorded${t.commander?.unlockedDirectiveTiers?.includes(`advanced`)?`, including Advanced`:``}. Try another squad or route for practice; no new rotation bonus or rank is promised.`:`Progression eligibility is unavailable. Refresh the War Table or review this mission for practice; no new progress is promised.`))}}let c=new Set(a?[a.missionId]:[]),l=[];if(!i)for(let e of[`OPTIONAL CHALLENGE`,`ADVANCED CHALLENGE`]){let t=o.find(t=>t.title===e&&!c.has(t.missionId));t&&(l.push(t),c.add(t.missionId))}if(!i)for(let e of o){if(l.length>=2)break;c.has(e.missionId)||(l.push(e),c.add(e.missionId))}if(!i&&l.length<3){let e=o.find(e=>e.title===`RELAY LOCKDOWN · COMPLETED`&&!c.has(e.missionId));e&&l.push(e)}return{primary:a,alternatives:l}}function Nr(e){return e.veteranChallenge?{earned:`Optional Veteran practice recorded. No currency or progression.`,exhausted:`No eligible progress from practice.`,changed:`No regional change.`,future:`Return to an eligible Advanced Field Op.`}:e.lockdownPlan?{earned:`Server accepted ${e.lockdownPlan===`anchor`?`Anchor`:`Crosslink`} · ${e.victory?`objective completed`:`attempt failed`}. No currency, Commander or Pack Mastery progress.`,exhausted:`Optional practice; permanent Relay Mastery access preserved.`,changed:`Accepted plan recorded; no regional change.`,future:e.lockdownPlan===`anchor`?`Try Crosslink: rotate between three relay checkpoints with normal support recharge.`:`Try Anchor: hold one tile with slower support recharge.`}:e.masteryChallenge?{earned:`Optional challenge result recorded. No currency, Commander or Pack Mastery progress.`,exhausted:e.victory?e.lockdownFirstClear?`First recorded Relay Lockdown clear saved permanently.`:`This Relay Lockdown attempt completed. Relay Mastery remains 1/1.`:`Relay Lockdown failed. Your permanent unlock is preserved.`,changed:e.firstLockdownClear?`Lockdown completion is permanently recorded. No regional change or additional unlock.`:`No permanent Lockdown completion confirmed by this receipt. No regional change.`,future:e.victory?`Try a different holder or squad in Relay Lockdown; no additional progression reward.`:`Keep an ally on the exact relay tile and clear adjacent contesters before round 7.`}:{earned:e.rewardAmountsAvailable===!1?`Character reward amounts unavailable · ${e.progressEarned} Commander points recorded`:`${e.xpGranted} EXP · ${e.bonesGranted} Bones · ${e.progressEarned} Commander points recorded`,exhausted:`${e.victory?e.firstCycleSecure===!1?e.regionalApplied?`Clear bonus already secured this rotation.`:`No current-rotation clear bonus recorded.`:e.firstCycleSecure===!0?`First clear recorded this rotation.`:`Clear bonus eligibility not supplied; only the amounts above are confirmed.`:`No clear recorded. No victory bonus earned.`} ${e.legacyReport?`Challenge unmeasured in this receipt.`:e.challengeSuccess?e.challengeBonus>0?`Challenge completed · +${e.challengeBonus} bonus recorded.`:`Challenge completed; no new challenge bonus recorded.`:`Optional challenge not completed; no challenge bonus confirmed.`}`,changed:e.regionalApplied&&e.pressureBefore!==e.pressureAfter?`Signal Pressure ${e.pressureBefore} → ${e.pressureAfter}.`:e.frontJustSecured?`Current rotation front secured.`:`No regional change confirmed by this receipt.`,future:e.masteryUnlocked?`Relay Mastery recorded · 1/1. Relay Lockdown is permanently unlocked, including outside the base mission rotation.`:e.regionalApplied&&e.pressureBefore>=2&&e.pressureAfter<2?`New relevant Field Ops delay reinforcements by 1 round. Already accepted runs keep their original timing.`:e.regionalApplied&&e.pressureBefore<2&&e.pressureAfter>=2?`New relevant Field Ops use scheduled reinforcement timing. Already accepted runs keep their original timing.`:e.advancedUnlocked?`Advanced conditions are now available in eligible mission briefs.`:`No new battle modifier confirmed. Use your saved squad abilities or attempt an unfinished challenge.`}}function Pr(e,t){let n=e.masteryChanges?.find(e=>e.veteran?.unlocked||e.stage>e.beforeStage);if(e.veteranCareer?.unlocked)return{kind:`milestone`,eyebrow:`THE PACK LEVELS UP`,title:`VETERAN UNLOCKED!`,detail:`Rank 4 is yours. Pack Extraction is ready.`};if(e.rankAfter>e.rankBefore)return{kind:`milestone`,eyebrow:`RANK UP`,title:`COMMANDER RANK ${e.rankAfter}!`,detail:`Rank ${e.rankBefore} → ${e.rankAfter}. You earned it.`};if(n)return{kind:`milestone`,eyebrow:`PACK POWER UP`,title:`${n.unitId} · ${n.veteran?.unlocked?`VETERAN UNLOCKED`:`MASTERY STAGE ADVANCED`}`,detail:n.veteran?.unlocked?`Your companion has a new option. Check the squad.`:`Mastery ${n.beforeStage} → ${n.stage}. Check your squad.`};if(e.victory&&e.regionalApplied&&e.pressureBefore>=2&&e.pressureAfter<2)return{kind:`world`,beat:`breakthrough`,eyebrow:`THE PACK PUSHED BACK`,title:`HOUND HELD BACK!`,detail:`Pressure ${e.pressureBefore} → ${e.pressureAfter}. HOUND arrives 1 round later in new Field Ops with reinforcements. Ongoing missions keep their timing.`};if(e.victory&&e.regionalApplied&&e.pressureBefore!==e.pressureAfter){if(e.pressureAfter===0&&e.pressureBefore===1)return{kind:`world`,beat:`clear`,eyebrow:`THE PACK OWNS THIS GROUND`,title:`AREA CLEAR!`,detail:`Pressure 1 → 0. HOUND is still 1 round late in new eligible fights. No extra delay stacks.`};if(e.pressureBefore===3&&e.pressureAfter===2)return{kind:`world`,beat:`step`,eyebrow:`THE PACK PUSHED BACK`,title:`PRESSURE DOWN.`,detail:`Pressure 3 → 2. HOUND still arrives on schedule. Push harder to slow it down.`}}return t?{kind:`world`,eyebrow:`THE PACK MADE A MARK`,title:t.label,detail:t.detail}:e.veteranCareer&&e.veteranCareer.after>e.veteranCareer.before?{kind:`milestone`,eyebrow:`VETERAN PROGRESS`,title:`VETERAN ${e.veteranCareer.before} → ${e.veteranCareer.after}/12`,detail:`One more Veteran credit earned.`}:e.victory&&e.firstCycleSecure===!0?{kind:`secured`,eyebrow:`MISSION WIN`,title:`FIRST WIN SECURED!`,detail:e.challengeSuccess&&e.challengeBonus>0?`First win and challenge cleared. +${e.challengeBonus} challenge bonus.`:`First win saved this rotation. No new battle advantage this time.`}:{kind:`recorded`,eyebrow:`MISSION LOG`,title:e.victory?`WIN SAVED`:`ATTEMPT SAVED`,detail:e.victory?`Win saved. No new rank, skill or area change this time.`:`Attempt saved. No new unlock or area bonus.`}}function Fr(e,t,n){if(!e)return[];let r=[];for(let i of t.filter(e=>e.team===`ally`)){let t=i.skillIds.map(e=>Ut(dn(e),Wt(n,i.defId)));if(i.defId===`alpha`){let e=t.find(e=>e.name===`HOWL`);e&&r.push(`ALPHA: HOWL radius ${e.radius}; ${e.effects.some(e=>e.status===`GUARD`)?`GUARD covers nearby holders`:`buff a spread-out squad; no added GUARD`}.`)}else if(i.defId===`ally-02`){let a=t.find(e=>e.name===`THRUST`),o=t.find(e=>e.name===`PRESSURE`);a&&o&&r.push(`CNC: THRUST range ${a.maxRange}; PRESSURE range ${o.maxRange}, cooldown ${o.cooldownMax}. ${e.objectiveType===`INTERCEPT`?`Reach the courier before the exit.`:`Time control before the enemy strike.`} ${Wt(n,i.defId)?.discipline===`disruptor`?`Can cancel a real interruptible locked intent.`:`No locked-intent cancellation without the DISRUPTOR doctrine.`}`)}else if(i.defId===`ally-03`){let n=t.find(e=>e.name===`MEND`),i=t.find(e=>e.name===`PACK SUPPORT`);n&&i&&r.push(`SHADOW: MEND ${n.targetType===`ALLY_AOE`?`radius ${n.radius}`:`range ${n.maxRange}`}, cooldown ${n.cooldownMax}; PACK radius ${i.radius}. ${e.objectiveType===`HOLD`?`Cover the holder before an announced hit.`:`Recover lost HP between threats.`}`)}else i.defId.startsWith(`pet:`)&&r.push(`PET: move ${i.move}; RECOVER from ${i.recoverRange||1} cells. ${e.objectiveType===`INTERCEPT`?`HAMSTRING the courier; trade reach against PATHFINDER mobility.`:`Use relay reach only during an open signal window.`}`)}let i=e.objectiveType===`INTERCEPT`?[`CNC:`,`PET:`]:e.objectiveType===`RECOVER`?[`PET:`,`SHADOW:`]:[`SHADOW:`,`ALPHA:`];return r.sort((e,t)=>{let n=e=>{let t=i.findIndex(t=>e.startsWith(t));return t<0?2:t};return n(e)-n(t)})}function Ir(e,t){if(!e)return e;let n=t.flatMap(e=>e.buildEvidence?[e.buildEvidence]:[]);return n.length?{...e,fieldcraft:[...new Set([...e.fieldcraft||[],...n])].slice(-24)}:e}function Lr(e,t,n){return e&&e.runId===t&&e.missionId===n?(e.fieldcraft||[]).slice(-3):[]}function Rr(e,t){return t?e.map(e=>e.defId===`ally-02`?{...e,unitDef:{...k[`ally-02`],move:t===`A`?3:2,skillIds:t===`A`?[`u02-shot`,`u02-lunge-vanguard`,`u02-suppress`]:[`u02-shot`,`u02-burst`,`u02-pressure-disruptor`]}}:e):e}function zr(e,t){return t?e.map(e=>e.defId===`ally-03`?{...e,unitDef:{...k[`ally-03`],skillIds:t===`A`?[`u03-tap`,`u03-mend-restorer`,`u03-pack`]:[`u03-tap`,`u03-mend`,`u03-pack-warden`]}}:e):e}function Br(e,t){return gn(zr(Rr(e,t.kodaSidegrade),t.shadowSidegrade),t.packMastery)}function Vr(e,t){let n=Object.keys(zt).find(t=>zt[t].includes(e));return dn(n&&(Br([{id:n,defId:n,c:0,r:0}],t||{})[0].unitDef||k[n]).skillIds.find(t=>Ht(t)===e)||e)}function Hr(e,t){let n=[],r=(e,t,r)=>{t!==r&&n.push(`${e} ${t} → ${r}`)};t.targetType===`ALLY_AOE`?r(`RADIUS`,e.radius,t.radius):r(`RANGE`,e.maxRange,t.maxRange),r(`COOLDOWN`,e.cooldownMax,t.cooldownMax);for(let i of t.effects){let t=e.effects.find(e=>e.kind===i.kind&&e.status===i.status&&e.on===i.on);i.kind===`status`&&JSON.stringify(t)!==JSON.stringify(i)&&n.push(`${i.status} ${t?.duration??0} → ${i.duration} TURNS${i.maxHpRatio?` · ≤${i.maxHpRatio*100}% HP before healing`:``}`),i.kind===`heal`&&r(`HEAL BASE`,t?.base??0,i.base??0)}return n}function Ur(e,t,n,r){let i={...t,discipline:t.discipline||r};return Hr(Ut(e,i),Ut(e,{...i,ranks:{...i.ranks,[Ht(e.id)]:n}}))}function Wr(e,t){return Wt(e,t)}var Gr={vanguard:`HOLD / SURVIVE: keep the holder inside HOWL. Gives up HOWLKEEPER's extra aura cell.`,howlkeeper:`INTERCEPT: buff a spread-out pursuit squad. Gives up VANGUARD's added GUARD.`,pursuer:`INTERCEPT: THRUST a courier from one extra cell. Gives up DISRUPTOR's longer control.`,disruptor:`BOSS / HOLD: keep PRESSURE debuffs active. Locked-intent cancellation requires this doctrine and an announced interruptible threat. Gives up PURSUER's THRUST reach.`,sentinel:`HOLD / SURVIVE: protect the relay holder with PACK SUPPORT. Gives up MEDIC's faster MEND.`,medic:`RECOVER / BOSS: heal a hurt ally before the next hit. Gives up SENTINEL's PACK GUARD benefit.`},Kr=e=>{let t,n=new Set,r=(e,r)=>{let i=typeof e==`function`?e(t):e;if(!Object.is(i,t)){let e=t;t=r??(typeof i!=`object`||!i)?i:Object.assign({},t,i),n.forEach(n=>n(t,e))}},i=()=>t,a={setState:r,getState:i,getInitialState:()=>o,subscribe:e=>(n.add(e),()=>n.delete(e))},o=t=e(r,i,a);return a},qr=e=>e?Kr(e):Kr,Jr=e=>e;function Yr(e,t=Jr){let n=y.useSyncExternalStore(e.subscribe,()=>t(e.getState()),()=>t(e.getInitialState()));return y.useDebugValue(n),n}var Xr=e=>{let t=qr(e),n=e=>Yr(t,e);return Object.assign(n,t),n},Zr=e=>e?Xr(e):Xr,Qr=1;function $r(e=1){Qr=e}function ei(){return Qr}function ti(e,t){return e.statuses.find(e=>e.type===t)}function ni(e,t,n,r,i){let a=e.statuses.find(e=>e.type===t);if(a){let t={...a,source:n,duration:Math.max(a.duration,r),value:i};return{unit:{...e,statuses:e.statuses.map(e=>e.id===a.id?t:e)},applied:t,refreshed:!0}}let o={id:`st-${Qr++}`,type:t,source:n,duration:r,value:i};return{unit:{...e,statuses:[...e.statuses,o]},applied:o,refreshed:!1}}function ri(e,t,n){let r=ti(e,t),i=ti(e,n),a=1;return r&&(a+=r.value),i&&(a-=i.value),Math.max(.4,a)}function ii(e){return Math.max(1,Math.round(e.atk*ri(e,`ATK_UP`,`ATK_DOWN`)))}function ai(e){return Math.max(0,Math.round(e.def*ri(e,`DEF_UP`,`DEF_DOWN`)))}function oi(e){return Math.max(1,Math.round(e.spd*ri(e,`SPD_UP`,`SPD_DOWN`)))}function si(e){let t=ti(e,`GUARD`);return t?1-(t.guardReduction??.5):1}var ci={ATK_UP:`ATK UP`,DEF_UP:`DEF UP`,SPD_UP:`SPD UP`,GUARD:`GUARD`,BLEED:`BLEED`,ATK_DOWN:`ATK DOWN`,DEF_DOWN:`DEF DOWN`,SPD_DOWN:`SPD DOWN`},li={ATK_UP:`ATK+`,DEF_UP:`DEF+`,SPD_UP:`SPD+`,GUARD:`GRD`,BLEED:`BLD`,ATK_DOWN:`ATK-`,DEF_DOWN:`DEF-`,SPD_DOWN:`SPD-`};function ui(e,t,n){let r=e*t,i=ai(n),a=i/(i+50);return Math.max(1,Math.round(r*(1-a)))}function di(e,t,n,r){let i=Math.round(e+n*t);return Math.max(0,Math.min(i,r.maxHp-r.hp))}function fi(e,t){return e>=0&&e<De&&t>=0&&t<Oe}function pi(e,t){return Math.max(Math.abs(e.c-t.c),Math.abs(e.r-t.r))}function mi(e,t){return`${e},${t}`}function hi(e,t){let n=new Set;for(let r of e)r.defeated||t&&r.id===t||n.add(mi(r.c,r.r));return n}function gi(e,t,n){return e.find(e=>!e.defeated&&e.c===t&&e.r===n)}function _i(e,t){let n=[];for(let[r,i]of[[1,0],[-1,0],[0,1],[0,-1]]){let a=e+r,o=t+i;fi(a,o)&&n.push({c:a,r:o})}return n}function vi(e,t,n=e.move){if(n<=0)return[];let r=hi(t,e.id),i=new Set([mi(e.c,e.r)]),a=[],o=[{c:e.c,r:e.r,d:0}];for(;o.length;){let e=o.shift();if(e.d!==n)for(let t of _i(e.c,e.r)){let n=mi(t.c,t.r);i.has(n)||r.has(n)||(i.add(n),a.push(t),o.push({...t,d:e.d+1}))}}return a}function yi(e,t,n,r){return fi(t,n)&&!hi(e,r).has(mi(t,n))}var bi=Object.freeze({left:12,right:88,top:24,bottom:82,touchFill:.82});function xi(e,t,n,r){let i=e/Math.max(1,n-1),a=t/Math.max(1,r-1);return{x:bi.left+(bi.right-bi.left)*i,y:bi.top+(bi.bottom-bi.top)*a}}function Si(e,t){return xi(e,t,De,Oe)}function Ci(e,t){return{widthPct:(bi.right-bi.left)/Math.max(1,e-1)*bi.touchFill,heightPct:(bi.bottom-bi.top)/Math.max(1,t-1)*bi.touchFill}}function wi(e,t,n){let r=pi(e,t);return r>=n.minRange&&r<=n.maxRange}function Ti(e,t){return e.filter(e=>!e.defeated&&(!t||e.team===t))}function Ei(e,t,n,r){return Ti(e,r).filter(e=>pi(e,t)<=n)}function Di(e,t,n,r,i){switch(n.targetType){case`SELF`:return t.defeated?[]:[t];case`ALLY_SINGLE`:{let i=e.find(e=>e.id===r);return!i||i.defeated||i.team!==t.team||!wi(t,i,n)?[]:[i]}case`ENEMY_SINGLE`:{let i=e.find(e=>e.id===r);return!i||i.defeated||i.team===t.team||!wi(t,i,n)?[]:[i]}case`ALLY_AOE`:return Ei(e,{c:t.c,r:t.r},n.radius,t.team);case`ENEMY_AOE`:return Ei(e,{c:t.c,r:t.r},n.radius,t.team===`ally`?`enemy`:`ally`);case`AREA_RADIUS`:{let a=null;if(i&&fi(i.c,i.r))a=i;else if(r){let t=e.find(e=>e.id===r);t&&(a={c:t.c,r:t.r})}if(!a||!wi(t,a,n))return[];let o=t.team===`ally`?`enemy`:`ally`;return Ei(e,a,n.radius,o)}default:return[]}}function K(e,t,n){switch(n.targetType){case`SELF`:case`ALLY_AOE`:case`ENEMY_AOE`:return[t.id];case`ALLY_SINGLE`:return Ti(e,t.team).filter(e=>wi(t,e,n)).map(e=>e.id);case`ENEMY_SINGLE`:return Ti(e,t.team===`ally`?`enemy`:`ally`).filter(e=>wi(t,e,n)).map(e=>e.id);case`AREA_RADIUS`:return Ti(e,t.team===`ally`?`enemy`:`ally`).filter(e=>wi(t,e,n)).map(e=>e.id);default:return[]}}function Oi(e){return e.targetType===`ALLY_SINGLE`||e.targetType===`ENEMY_SINGLE`||e.targetType===`AREA_RADIUS`}function ki(e){return e===`SELF`||e===`ALLY_SINGLE`||e===`ENEMY_SINGLE`||e===`ALLY_AOE`||e===`ENEMY_AOE`||e===`AREA_RADIUS`}function Ai(e,t){return t.meter===e.meter?oi(t)-oi(e)||e.id.localeCompare(t.id):t.meter-e.meter}function ji(e){let t=e.map(e=>({...e}));for(let e=0;e<400;e++){if(Ti(t).filter(e=>e.meter>=100).length)return t;for(let e of t)e.defeated||(e.meter+=oi(e))}return t}function Mi(e){let t=Ti(e).filter(e=>e.meter>=100);return t.length?(t.sort(Ai),t[0].id):null}function Ni(e){return{...e,meter:Math.max(0,e.meter-100),hasMoved:!1,hasActed:!1}}function Pi(e,t=6){let n=[],r=e.units.map(e=>({...e,statuses:e.statuses.map(e=>({...e})),cooldowns:{...e.cooldowns}}));if(e.activeId){let t=r.find(t=>t.id===e.activeId&&!t.defeated);t&&n.push(t.id)}for(;n.length<t;){r=ji(r);let e=Mi(r);if(!e)break;n.push(e),r=r.map(t=>t.id===e?Ni(t):t)}return n.slice(0,t)}var Fi=1e6,Ii=18e4,Li=14e4,Ri=12;function zi(e,t,n,r){if(!t||e<=0)return{amount:0,carry:n};let i=n+Math.round(e*r*t/(t+Ri));return{amount:Math.floor(i/Fi),carry:i%Fi}}function Bi(e,t){let n=t.gearImpactV31?.offense;if(n==null)return{damage:e,bonus:0};let r=zi(e,n,t.gearOffenseCarryV31??0,Ii);return{damage:e+r.amount,carry:r.carry,bonus:r.amount}}function Vi(e,t){let n=t.gearImpactV31?.guard;if(n==null)return{damage:e,saved:0};let r=zi(e,n,t.gearGuardCarryV31??0,Li),i=Math.min(r.amount,Math.max(0,e-1));return{damage:e-i,carry:r.carry,saved:i}}function Hi(e){return e.skillIds.map(t=>Ut(dn(t),e.growth))}function Ui(e,t){return Math.max(0,e.cooldowns[t]??0)}function Wi(e,t){return Ui(e,t.id)<=0}function Gi(e,t,n){return e.map(e=>e.id===t?n(e):e)}function Ki(e,t,n,r){let i=e.units.find(t=>t.id===e.activeId);if(!i||i.defeated||i.hasActed)return{state:e,events:[],ok:!1,reason:`no-actor`};if(!i.skillIds.includes(t))return{state:e,events:[],ok:!1,reason:`unknown-skill`};let a=Ut(dn(t),i.growth);if(!Wi(i,a))return{state:e,events:[],ok:!1,reason:`cooldown`};if(Oi(a)&&!n&&!r)return{state:e,events:[],ok:!1,reason:`need-target`};let o=Di(e.units,i,a,n,r);if(Oi(a)&&o.length===0)return{state:e,events:[],ok:!1,reason:`invalid-target`};!Oi(a)&&a.targetType!==`SELF`&&o.length;let s=[],c=Ut(dn(t),i.growth?{...i.growth,ranks:{}}:void 0),l=Di(e.units,i,c,n,r),u=o.filter(e=>!l.some(t=>t.id===e.id)),d=e.units.map(e=>({...e,statuses:e.statuses.map(e=>({...e})),cooldowns:{...e.cooldowns}})),f=e.hostilesEliminated,p=e.damageTaken,m=n?d.find(e=>e.id===n):o[0],h=ii(i),g=m?(e=>d.find(t=>t.id===e)?.name??e)(m.id):a.targetType===`SELF`?i.name:`squad`;s.push({type:`ticker`,text:`${i.name}  ·  ${a.name}${g&&g!==i.name?`  →  ${g}`:``}`});let _=e=>{if(e===`self`)return[d.find(e=>e.id===i.id)];if(e===`primary`){let e=m?d.find(e=>e.id===m.id):d.find(e=>e.id===i.id);return e?[e]:[]}return e===`aoe_allies`?o.filter(e=>e.team===i.team).map(e=>d.find(t=>t.id===e.id)):e===`aoe_enemies`?o.filter(e=>e.team!==i.team).map(e=>d.find(t=>t.id===e.id)):o.map(e=>d.find(t=>t.id===e.id)).filter(Boolean)};for(let t of a.effects){let n=_(t.on??`hits`).filter(Boolean);for(let r of n){let n=d.find(e=>e.id===r.id);if(!n||n.defeated)continue;let o=e.units.find(e=>e.id===n.id);if(!(t.maxHpRatio!==void 0&&o.hp/o.maxHp>t.maxHpRatio)){if(t.kind===`damage`){let e=ui(h,t.multiplier??1,n),r=d.find(e=>e.id===i.id),a=Bi(e,r);e=a.damage,a.carry!==void 0&&(d=Gi(d,i.id,e=>({...e,gearOffenseCarryV31:a.carry})));let o=e;e=Math.max(1,Math.round(e*si(n)));let c=Vi(e,n);e=c.damage,c.carry!==void 0&&(d=Gi(d,n.id,e=>({...e,gearGuardCarryV31:c.carry})));let l=Math.max(0,n.hp-e),u=l<=0;n.team===`ally`&&(p+=e),u&&n.team===`enemy`&&!n.defeated&&(f+=1),d=Gi(d,n.id,e=>({...e,hp:l,defeated:u,statuses:u?[]:e.statuses})),s.push({type:`damage`,unitId:n.id,amount:e,text:`-${e}`,kind:`dmg`,...a.bonus>0&&i.defId===`alpha`?{buildEvidence:`ALPHA equipment impact dealt +${a.bonus} damage.`}:c.saved>0&&n.defId===`alpha`?{buildEvidence:`ALPHA equipment impact prevented ${c.saved} damage.`}:n.team===`ally`&&o>e?{buildEvidence:`${n.name}: GUARD prevented ${o-e} damage${o>=n.hp&&l>0?`; survived the blow`:``}.`}:{}}),u&&s.push({type:`defeat`,unitId:n.id,text:`DOWN`,kind:`info`})}else if(t.kind===`heal`){let e=di(t.base??0,t.scale??0,h,n);e>0&&(d=Gi(d,n.id,t=>({...t,hp:Math.min(t.maxHp,t.hp+e)})),s.push({type:`heal`,unitId:n.id,amount:e,text:`+${e}`,kind:`heal`,...i.team===`ally`?{buildEvidence:`${i.name} ${a.name}: restored ${e} HP to ${n.name}.`}:{}}))}else if(t.kind===`status`&&t.status){let e=t.duration??1,r=t.value??0,o=ni(n,t.status,a.id,e,r);if(t.status===`GUARD`&&i.growth?.rulesVersion===2){let e=n.statuses.find(e=>e.type===`GUARD`),t=Math.max(e?e.guardReduction??.5:0,Math.min(.5,Math.max(0,r)));o.unit={...o.unit,statuses:o.unit.statuses.map(e=>e.type===`GUARD`?{...e,guardReduction:t}:e)}}d=Gi(d,n.id,()=>o.unit),s.push({type:`status`,unitId:n.id,text:ci[t.status],kind:t.status===`GUARD`?`guard`:`status`,...i.team===`ally`&&o.unit.statuses.some(e=>e.source===a.id&&e.type===t.status)?{buildEvidence:`${i.name} ${a.name}: ${ci[t.status]} applied to ${n.name} (${e} personal turns).`}:{}})}}}}if(i.team===`ally`)for(let e of u)s.some(t=>t.unitId===e.id&&[`damage`,`heal`,`status`].includes(t.type))&&s.push({type:`info`,buildEvidence:`${i.name} ${a.name}: reached ${e.name} beyond the unranked ${a.targetType===`ALLY_AOE`?`radius`:`range`} (${Math.max(Math.abs(i.c-e.c),Math.abs(i.r-e.r))} cells).`});return d=Gi(d,i.id,t=>({...t,hasActed:!0,cooldowns:{...t.cooldowns,[a.id]:a.cooldownMax+it(e.directive,i,a)}})),a.cooldownMax>0&&s.push({type:`cooldown`,unitId:i.id,text:a.name}),{state:{...e,healingActions:(e.healingActions||0)+(i.team===`ally`&&a.effects.some(e=>e.kind===`heal`)?1:0),units:d,hostilesEliminated:f,damageTaken:p,actionSkillId:null,mode:`locked`},events:s,ok:!0}}function qi(e,t){return Hi(t).map(n=>{let r=Ui(t,n.id),i=r<=0;return{...n,desc:it(e.directive,t,n)?`${n.desc} Disrupted Support: cooldown +${it(e.directive,t,n)}.`:n.desc,ready:i,cd:r,targets:i?K(e.units,t,n):[]}})}function Ji(e,t){return Ti(t,e.team===`ally`?`enemy`:`ally`)}function Yi(e,t){return Ti(t,e.team)}function Xi(e){let t=0;return e.role===`alpha`&&(t+=40),e.role===`support`&&(t+=12),t+=(1-e.hp/e.maxHp)*30,t+=ii(e)*.4,t}function Zi(e,t,n){let r=n.maxHp>0?n.hp/n.maxHp:1,i=(1-r)*40,a=n.role===`support`?14:0,o=i+a+ii(n)*.25,s=e.objective;if(!s)return o+(n.role===`alpha`?6:0);if(s.type===`HOLD`&&s.terminal){let e=Math.abs(n.c-s.terminal.c)+Math.abs(n.r-s.terminal.r);return o+(e<=(s.radius??0)?70:0)+Math.max(0,17-e*4)}if(s.type===`RECOVER`){let e=Math.abs(n.c-s.terminal.c)+Math.abs(n.r-s.terminal.r);return o+Math.max(0,50-e*9)}if(s.type===`SURVIVE`)return o+(1-r)*70+a*.5;if(s.type===`INTERCEPT`){let t=e.units.find(e=>e.id===s.targetId&&!e.defeated),r=t?pi(n,t):9,i=Math.abs(n.c-s.exit.c)+Math.abs(n.r-s.exit.r);return o+Math.max(0,50-r*10)+Math.max(0,12-i*2)}if(s.type===`BOSS`){let r=e.units.find(e=>e.id===s.targetId&&!e.defeated),i=r?pi(n,r):9;return o+Math.max(0,45-i*8)+(t.role===`leader`&&n.role===`support`?14:0)}return o}function Qi(e,t,n,r){if(!t.length)return null;let i=[...t].sort((t,n)=>{if(Ee&&r){let i=Zi(r,e,t)+(e.archetype===`DISRUPTOR`&&t.role===`support`?35:0);return Zi(r,e,n)+(e.archetype===`DISRUPTOR`&&n.role===`support`?35:0)-i||pi(e,t)-pi(e,n)||t.id.localeCompare(n.id)}return e.archetype===`DISRUPTOR`?Number(n.role===`support`)-Number(t.role===`support`)||Xi(n)-Xi(t):e.archetype===`MARKSMAN`?Xi(n)-Xi(t)||pi(e,n)-pi(e,t):e.role===`leader`?Xi(n)-Xi(t)||t.hp-n.hp:t.hp-n.hp||pi(e,t)-pi(e,n)});return(i.filter(t=>wi(e,t,n))[0]??i[0])||null}function $i(e,t,n,r){if(wi(e,r,n))return null;let i=vi(e,t),a=null,o=1e9;for(let t of i){let i=pi(t,r),s=(i>=n.minRange&&i<=n.maxRange?0:100)+(e.archetype===`MARKSMAN`?Math.abs(i-Math.max(2,n.maxRange-1)):i);s<o&&(o=s,a=t)}return a}function ea(e,t){let n=e.objective;if(n?.type!==`INTERCEPT`||n.targetId!==t.id)return null;let r=new Map,i=e=>`${e.c},${e.r}`,a=new Set(e.units.filter(e=>!e.defeated&&e.id!==t.id).map(i)),o=[{...n.exit,d:0}];r.set(i(n.exit),0);for(let e=0;e<o.length;e++){let t=o[e];for(let[e,n]of[[1,0],[-1,0],[0,1],[0,-1]]){let s={c:t.c+e,r:t.r+n,d:t.d+1};!fi(s.c,s.r)||a.has(i(s))||r.has(i(s))||(r.set(i(s),s.d),o.push(s))}}if(!t.hasMoved){let a=vi(t,e.units).filter(e=>(r.get(i(e))??1/0)<(r.get(i(t))??1/0));if(a.sort((e,t)=>(r.get(i(e))??1/0)-(r.get(i(t))??1/0)),a[0]){let r=n.screenedEscape&&e.units.find(e=>!e.defeated&&e.team===`ally`&&e.c===n.exit.c&&e.r===n.exit.r),i=r&&qi(e,t).find(e=>e.ready&&e.slot===`A1`&&wi({...t,...a[0]},r,e));return{type:`move`,to:a[0],...i&&r?{then:{type:`skill`,skillId:i.id,targetId:r.id}}:{}}}}let s=qi(e,t).find(e=>e.ready&&e.slot===`A1`),c=s?K(e.units,t,s):[],l=n.screenedEscape&&e.units.find(e=>!e.defeated&&e.team===`ally`&&e.c===n.exit.c&&e.r===n.exit.r&&c.includes(e.id)),u=l?l.id:c[0];return u?{type:`skill`,skillId:s.id,targetId:u}:{type:`skip`}}function ta(e){let t=e.units.find(t=>t.id===e.activeId);if(!t||t.team!==`enemy`||t.defeated||t.hasMoved)return null;let n=e.objective;if(n?.type!==`HOLD`||t.archetype===`MARKSMAN`||t.archetype===`COURIER`)return null;let r=n.relayPressure?.flank,i=r?.enemyId===t.id?r.tile:n.terminal,a=e=>Math.abs(e.c-i.c)+Math.abs(e.r-i.r),o=a(t);if(o<=n.radius)return null;let s=vi(t,e.units).filter(e=>a(e)<o);if(!s.length)return null;let c=Ti(e.units,`ally`);if(!n.relayPressure&&!c.some(e=>a(e)<=n.radius)&&o>t.move+n.radius+1)return null;let l=s.map(e=>{let t=a(e),n=c.reduce((t,n)=>t+ +(pi(e,n)<=1),0);return{cell:e,score:t*100+n*5+e.c/100+e.r/1e3}}).sort((e,t)=>e.score-t.score)[0]?.cell;return l?{type:`move`,to:l}:null}function na(e){let t=e.units.find(t=>t.id===e.activeId),n=e.objective;if(!t||t.team!==`enemy`||t.defeated||t.hasMoved||n?.type!==`RECOVER`||t.archetype===`MARKSMAN`||t.archetype===`COURIER`)return null;let r=e=>Math.abs(e.c-n.terminal.c)+Math.abs(e.r-n.terminal.r),i=Ti(e.units,`ally`),a=Math.min(...i.map(r));if(!i.length||a>4)return null;let o=r(t);if(o<=1||o>5)return null;let s=vi(t,e.units).filter(e=>r(e)<o).sort((e,t)=>r(e)-r(t)||e.c-t.c||e.r-t.r)[0];return s?{type:`move`,to:s}:null}function ra(e){let t=e.units.find(t=>t.id===e.activeId);if(!t||t.team!==`enemy`||t.defeated)return null;if(e.objective?.type===`HOLD`){let n=e.objective,r=Ti(e.units,`ally`).some(e=>Math.abs(e.c-n.terminal.c)+Math.abs(e.r-n.terminal.r)<=n.radius);if(n.relayPressure){let t=ta(e);if(t)return t}if(r){let r=qi(e,t).filter(e=>e.ready&&e.targetType===`ENEMY_SINGLE`);for(let i of r){let r=Qi(t,Ti(e.units,`ally`).filter(e=>Math.abs(e.c-n.terminal.c)+Math.abs(e.r-n.terminal.r)<=n.radius),i,e);if(r&&wi(t,r,i))return{type:`skill`,skillId:i.id,targetId:r.id}}}return n.relayPressure?null:ta(e)}return e.objective?.type===`RECOVER`?na(e):null}function ia(e){let t=e.units.find(t=>t.id===e.activeId);if(!t||t.defeated||t.team!==`enemy`)return{type:`skip`};let n=ea(e,t);if(n)return n;if(Ee){let t=ra(e);if(t)return t}let r=qi(e,t).filter(e=>e.ready);if(t.archetype===`MARKSMAN`&&!t.hasMoved&&Ji(t,e.units).some(e=>pi(t,e)<=1)){let n=vi(t,e.units).map(n=>({cell:n,d:Math.min(...Ji(t,e.units).map(e=>pi(n,e)))})).sort((e,t)=>t.d-e.d||e.cell.c-t.cell.c||e.cell.r-t.cell.r);if(n[0]?.d>1)return{type:`move`,to:n[0].cell}}let i=Ji(t,e.units);if(!i.length)return{type:`skip`};let a=[...r].sort((e,n)=>{let r={A3:0,A2:1,A1:2}[e.slot]-{A3:0,A2:1,A1:2}[n.slot];return t.role===`leader`&&e.id.includes(`intimidate`)&&n.slot!==`A3`?-1:r});for(let n of a){if(n.targetType===`SELF`||n.targetType===`ALLY_AOE`||n.targetType===`ENEMY_AOE`){if(n.targetType===`ALLY_AOE`&&Yi(t,e.units).filter(e=>e.hp<e.maxHp*.85).length===0&&n.effects.every(e=>e.kind!==`damage`))continue;return t.hasMoved,{type:`skill`,skillId:n.id}}let a=Qi(t,i,n,e);if(a){if(wi(t,a,n))return{type:`skill`,skillId:n.id,targetId:a.id};if(!t.hasMoved){let i=$i(t,e.units,n,a);if(i){let e={...t,c:i.c,r:i.r};if(wi(e,a,n))return{type:`move`,to:i,then:{type:`skill`,skillId:n.id,targetId:a.id}};let o=r.find(e=>e.slot===`A1`)??n;return wi(e,a,o)?{type:`move`,to:i,then:{type:`skill`,skillId:o.id,targetId:a.id}}:{type:`move`,to:i}}}}}if(!t.hasMoved){let n=[...i].sort((n,r)=>Ee?Zi(e,t,r)-Zi(e,t,n):Xi(r)-Xi(n))[0],a=vi(t,e.units),o=null,s=pi(t,n);for(let e of a){let t=pi(e,n);t<s&&(s=t,o=e)}if(o){let n={...t,c:o.c,r:o.r},a=r.find(e=>e.slot===`A1`);if(a){let t=Qi(n,i,a,e);if(t&&wi(n,t,a))return{type:`move`,to:o,then:{type:`skill`,skillId:a.id,targetId:t.id}}}return{type:`move`,to:o}}}return{type:`skip`}}function aa(e,t){let n=e.units.find(t=>t.id===e.activeId);if(!n)return!1;if(t.type===`skip`)return!0;if(t.type===`move`)return vi(n,e.units).some(e=>e.c===t.to.c&&e.r===t.to.r);if(t.type===`skill`){let r=dn(t.skillId);return!n.skillIds.includes(r.id)||!Wi(n,r)?!1:!Oi(r)||K(e.units,n,r).includes(t.targetId??``)}return!1}function oa(e){if(e.team!==`enemy`)return null;if(e.id===`courier`||e.defId===`signal-courier`)return`COURIER`;if(e.role===`leader`||e.id===`leader`)return`COMMANDER`;if(/reinforcement/.test(e.id))return`SKIRMISHER`;let t=e.id.match(/(?:^|[^a-z])h(\d+)(?:$|[^a-z])/i);return[`BULWARK`,`MARKSMAN`,`DISRUPTOR`,`SKIRMISHER`][((t?Number(t[1]):1)-1)%4]}function sa(e,t){return t===`COURIER`?{...e,move:Math.max(e.move,2),skillIds:[`hostile-strike`]}:t===`COMMANDER`?{...e,skillIds:[`leader-strike`,`leader-crush`,`leader-intimidate`]}:t===`BULWARK`?{...e,name:`HOUND BULWARK`,hp:Math.round(e.hp*1.35),def:e.def+5,move:1,skillIds:[`hostile-strike`,`hound-fortify`]}:t===`MARKSMAN`?{...e,name:`HOUND MARKSMAN`,hp:Math.round(e.hp*.88),move:2,skillIds:[`hound-pulse`,`hound-aim`]}:t===`DISRUPTOR`?{...e,name:`HOUND DISRUPTOR`,hp:Math.round(e.hp*.95),skillIds:[`hostile-strike`,`hound-interference`]}:{...e,name:`HOUND SKIRMISHER`,hp:Math.round(e.hp*.85),spd:e.spd+3,move:Math.max(3,e.move),skillIds:[`hostile-strike`,`hostile-maul`]}}function ca(e){return Number.isInteger(e.cols)&&Number.isInteger(e.rows)&&e.cols>=3&&e.rows>=3&&e.cols<=24&&e.rows<=16}function la(e,t){return t.c>=0&&t.c<e.cols&&t.r>=0&&t.r<e.rows&&Number.isInteger(t.c)&&Number.isInteger(t.r)}function ua(e,t,n){if(!ca(t)||!ca(n)||!la(t,e))throw Error(`invalid topology or source point`);return{c:Math.round(e.c*(n.cols-1)/(t.cols-1)),r:Math.round(e.r*(n.rows-1)/(t.rows-1))}}var da=`https://res.cloudinary.com/dnjwvxinh/image/upload`;function fa(){return typeof window>`u`?null:window}function pa(e){return String(e??``).trim()}function ma(...e){for(let t of e){let e=pa(t);if(e)return e}return``}function ha(e){return pa(e).toLowerCase().replace(/[^\w]+/g,`_`).replace(/^_+|_+$/g,``)}function ga(e){let t=pa(e),n=t.match(/\/assets\/(skins|equip|items)\/([^/?#]+)/i);return n?`${da}/f_auto,q_auto/${n[1]}/${n[2]}`:t}function _a(e){return e?!!(e.startsWith(`blob:`)||e.startsWith(`data:`)||/^https?:\/\//i.test(e)||e.startsWith(`/`)):!1}function va(e,t){if(!e||typeof e!=`object`)return null;let n=e;if(n.empty===!0)return null;let r=ma(n.item_key,n.itemKey,n.key,n.item),i=ma(n.name,n.label,r);if(!r&&!i)return null;let a=ma(n.icon,n.img,n.image,n.image_path,n.imageUrl,n.url);return{slot:t,key:r||ha(i),name:i||r,icon:ga(a)||ya(r||i),rarity:ma(n.rarity,`common`)}}function ya(e){let t=ha(e);return t?`${da}/f_auto,q_auto/equip/${t}.png`:``}function ba(e){let t=`${e?.key||``} ${e?.name||``}`.toLowerCase();return/axe|cleaver|chop|hatchet/.test(t)?`axe`:/spear|pike|pole|glaive|halberd|lance/.test(t)?`spear`:/staff|rod|scepter|wand|signal/.test(t)?`staff`:/hammer|mace|maul|gavel/.test(t)?`hammer`:/claw|fang|gauntlet|fist|knuckle/.test(t)?`claw`:/blade|sword|saber|omen|edge|fangblade|knife|dagger/.test(t)?`blade`:`melee`}function xa(e){return e===`melee`?`MELEE KIT`:e.toUpperCase()}function Sa(e,t){if(!e)return null;let n=(Array.isArray(e.slots)?e.slots:[]).find(e=>ha(e?.slot)===t);if(n)return va(n,t);let r=e.equippedBySlot||e.equipped||{};if(r&&typeof r==`object`){let e=r[t];if(e)return va(e,t)}let i=(Array.isArray(e.loadout)?e.loadout:[]).find(e=>ha(e?.slot)===t);return i?va(i,t):null}function Ca(){let e=fa();if(!e)return null;let t=e.Equipped;return t&&t.state&&typeof t.state==`object`?t.state:e.__AH_EQUIPPED_STATE__&&typeof e.__AH_EQUIPPED_STATE__==`object`?e.__AH_EQUIPPED_STATE__:null}function wa(){let e=fa();if(!e)return{};let t=e.__PROFILE__||e.PROFILE||e.profileState||e.lastProfile||{};return t&&typeof t==`object`?t:{}}function Ta(){let e=fa(),t=wa(),n=``,r=``,i=``;try{let t=e?.document&&e.document.getElementById(`player-skin`);if(t){let e=t;n=ma(e.currentSrc,e.src),r=ma(e.dataset?.skinKey,e.getAttribute?.(`data-skin-key`)),i=ma(e.alt)}}catch{}let a=t.skin;if(typeof a==`string`)n=n||a;else if(a&&typeof a==`object`){let e=a;n=n||ma(e.img,e.url,e.preview_url,e.previewUrl),r=r||ma(e.key,e.skinKey,e.skin_key),i=i||ma(e.name,e.label)}return r=r||ma(t.skinKey,t.skin_key,t.activeSkin?.key),n=n||ma(t.heroImg,t.heroPng,t.character,t.characterPng,t.activeSkin?.img),i.toLowerCase()===`alpha husky skin`&&(i=``),!i&&r&&(i=r.replace(/[_-]+/g,` `).replace(/\bskin\b/gi,``).trim()),{url:n,key:ha(r),name:i}}function Ea(){let e={skinUrl:``,frameKey:``,frameUrl:``,glowUrl:``,sweepUrl:``,fit:{scale:1,offsetX:0,offsetY:0},confirmed:!1},t=fa(),n=t?.document;if(!t||!n)return e;let r=t.__ahAlphaAccountSession||null;if(r&&t.__AH_PROFILE_SESSION_REF__!==r)return e;let i=n.getElementById(`player-skin`),a=n.getElementById(`player-frame`),o=n.getElementById(`player-frame-glow`),s=n.getElementById(`player-frame-sweep`),c=wa(),l=ha(i?.dataset?.skinKey||c.skinKey||c.skin_key);c.skin&&typeof c.skin==`object`&&c.skin;let u=ma(i?.getAttribute(`src`)),d=_a(u)?ga(u):``,f=e=>{let t=pa(e?.getAttribute(`src`));return e&&e.style.display!==`none`&&_a(t)?ga(t):``},p=d?f(a):``,m=p?ha(a?.dataset?.frameKey):``,h=e=>{let t=e&&typeof e==`object`?e:{},n=(e,t)=>e==null||e===``||!Number.isFinite(Number(e))?t:Number(e);return{scale:n(t.scale,1),offsetX:n(t.offsetX??t.x,0),offsetY:n(t.offsetY??t.y,0)}},g=(e,t)=>{let n=e&&typeof e==`object`?e:{},r=n.overrides&&typeof n.overrides==`object`?n.overrides:{};return h(r[t]||n.default)},_=i?.__ahVisualFit&&typeof i.__ahVisualFit==`object`?h(i.__ahVisualFit):g(t.__AH_SKIN_FIT__,l),v=g(t.__AH_FRAME_FIT__||t.__AH_FRAME_SKIN_FIT__,m),y=g(t.__AH_SKIN_FRAME_COMBO_FIT__,l&&m?l+`::`+m:``),b=e=>m&&ha(e?.dataset?.frameKey)===m;return{skinUrl:d,frameKey:m,frameUrl:p,glowUrl:b(o)?f(o):``,sweepUrl:b(s)?f(s):``,fit:{scale:_.scale*v.scale*y.scale,offsetX:_.offsetX+v.offsetX+y.offsetX,offsetY:_.offsetY+v.offsetY+y.offsetY},confirmed:!!d}}function Da(){let e=fa();if(!e)return``;let t=pa(e.__EquippedCharImgUrl);if(t)return t;try{let t=e.document&&e.document.getElementById(`equipped-character-img`),n=ma(t?.currentSrc,t?.src);if(_a(n))return n}catch{}return``}function Oa(e){let t=e?.weapon??null,n=e?.armor??null,r=e?.weaponClass||ba(t),i=(e?.skinName||``).trim(),a=t?.name||xa(r),o=n?.name||``,s=[i,t?.name?t.name:xa(r)].filter(Boolean);return{unitName:e?.unitName||`ALPHA`,nickname:e?.nickname||``,skinKey:e?.skinKey||``,skinName:i,skinUrl:e?.skinUrl||``,cosmetic:e?.cosmetic||{skinUrl:``,frameKey:``,frameUrl:``,glowUrl:``,sweepUrl:``,fit:{scale:1,offsetX:0,offsetY:0},confirmed:!1},portraitUrl:e?.portraitUrl||D,spriteUrl:e?.spriteUrl||T,attackSpriteUrl:e?.attackSpriteUrl||E,weapon:t,armor:n,weaponClass:r,weaponLabel:a,armorLabel:o,summary:s.join(`  ·  `)||`ALPHA  ·  MELEE KIT`,source:e?.source||`fallback`,live:e?.live===!0}}function ka(){let e=wa(),t=Ca(),n=Ea(),r=fa(),i=!!r?.__ahAlphaAccountSession&&r.__AH_PROFILE_SESSION_REF__!==r.__ahAlphaAccountSession,a=i?{url:``,key:``,name:``}:Ta(),o=i?``:Da(),s=i?``:ma(e.nickname,e.name,e.displayName),c=s?s.toUpperCase():`ALPHA`,l=Sa(t,`weapon`)||Sa(e,`weapon`),u=Sa(t,`armor`)||Sa(e,`armor`),d=_a(a.url)?ga(a.url):``,f=_a(d)?d:``,p=_a(o)?o:``,m=`fallback`,h=D;p?(h=p,m=`character-image`):f?(h=f,m=`skin`):(l||u)&&(m=`equipped`),m===`fallback`&&(l||u||a.key)&&(m=`equipped`);let g=m!==`fallback`||!!(l||u||a.key||s);return Oa({unitName:c,nickname:s,skinKey:a.key,skinName:a.name||(a.key?a.key.replace(/_+/g,` `):``),skinUrl:d,cosmetic:n,portraitUrl:h,spriteUrl:T,attackSpriteUrl:E,weapon:l,armor:u,source:m,live:g})}function Aa(e,t){return!t||e.defId!==`alpha`&&e.id!==`alpha`?e:{...e,name:t.unitName||e.name,portrait:t.portraitUrl||e.portrait,sprite:t.spriteUrl||e.sprite,attackSprite:t.attackSpriteUrl||e.attackSprite}}async function ja(){let e=fa();if(!e)return!1;if(Ca())return!0;let t=e.apiPost||e.S?.apiPost;try{if(typeof t==`function`){let n=await t(`/webapp/equipped/state`,{}),r=n&&(n.data||n.state||n);if(n&&(n.ok===!0||r?.slots)){e.__AH_EQUIPPED_STATE__=r;let t=e.Equipped;return t&&typeof t==`object`&&!t.state&&(t.state=r),!0}}}catch{}return!1}function Ma(e){let t=fa();if(e&&t&&(t.__AH_TO_IDENTITY__=e),t&&t.__AH_TO_IDENTITY__)return t.__AH_TO_IDENTITY__;let n=ka();return t&&(t.__AH_TO_IDENTITY__=n),n}var Na={cols:8,rows:5},Pa={cols:10,rows:7},Fa=e=>Ee?ua(e,Na,Pa):{...e};function Ia(e){return{...e,statuses:e.statuses.map(e=>({...e})),cooldowns:{...e.cooldowns}}}function La(e,t,n,r,i,a){let o=a||k[e];if(!o)throw Error(`Unknown unit def ${e}`);let s=Ee?oa({id:t,defId:o.defId,role:o.role,team:o.team}):null,c=s?sa(o,s):o,l={};for(let e of c.skillIds)l[e]=0;let u={id:t,...s?{archetype:s}:{},defId:c.defId,name:c.name,team:c.team,role:c.role,hp:c.hp,maxHp:c.hp,atk:c.atk,def:c.def,spd:c.spd,move:c.move,recoverRange:c.recoverRange,c:n,r,statuses:[],cooldowns:l,meter:0,hasMoved:!1,hasActed:!1,defeated:!1,sprite:c.sprite,attackSprite:c.attackSprite,portrait:c.portrait,skillIds:[...c.skillIds],combatMastery:c.combatMastery?{...c.combatMastery}:void 0,...c.gearImpactV31?{gearImpactV31:{...c.gearImpactV31},gearOffenseCarryV31:0,gearGuardCarryV31:0}:{}};return c.defId===`alpha`&&i?{...Aa(u,i),weaponIcon:i.weapon?.icon||``,identitySource:i.source}:u}function Ra(e,t=ee,n=null,r=null,i=null,a=null,o){$r();let s=t.map(e=>({...e,...Fa(e)})),c=new Set;for(let e of s){let t=e.c+`,`+e.r;if(c.has(t))throw Error(`Battlefield spawn collision at `+t);c.add(t)}let l=o?Vt(o):null,u=s.map(t=>{let n=La(t.defId,t.id,t.c,t.r,e,t.unitDef),r=n.team===`ally`?Wt(l,n.defId):void 0;return r?{...n,growth:{...r,ranks:{...r.ranks}}}:n}),d=n?structuredClone(n):null;if(d?.type===`INTERCEPT`&&(d.exit=Fa(d.exit)),d?.type===`RECOVER`&&(d.terminal=Fa(d.terminal)),d?.type===`HOLD`){d.terminal&&(d.terminal=Fa(d.terminal)),d.relayRoute&&(d.relayRoute=d.relayRoute.map(Fa));let e=d.relayPressure?.flank;e&&(e.tile=Fa(e.tile))}return{units:u,activeId:null,inspectId:null,actionSkillId:null,mode:`idle`,round:1,unitTurn:0,actionsLeftInRound:Ti(u).length,outcome:`ongoing`,damageTaken:0,healingActions:0,hostilesEliminated:0,results:null,objective:d,reinforcement:r?{...r,spawn:{...r.spawn,...Fa(r.spawn)}}:null,signalCarrierId:i,directive:a?structuredClone(a):null,routingTraceAcquired:!1,seed:1}}function za(e){return e.filter(e=>e.team===`ally`).length}function Ba(e){if(e.outcome!==`ongoing`)return e;let t=e.signalCarrierId&&!e.routingTraceAcquired&&e.units.find(t=>t.id===e.signalCarrierId)?.defeated===!0&&Ti(e.units,`enemy`).length>0?{...e,routingTraceAcquired:!0}:e,n=Ti(t.units,`ally`),r=Ti(t.units,`enemy`),i=za(t.units),a=st(t);if(t=a.state,a.result){let e=a.result===`victory`,r={victory:e,turns:t.round,hostilesEliminated:t.hostilesEliminated,squadStanding:n.length,squadDeployed:i,damageTaken:t.damageTaken,bonesRecovered:0,objectiveComplete:e};return{...t,outcome:a.result,results:r,mode:`locked`,activeId:null,actionSkillId:null}}if(t.objective?.type===`BOSS`&&t.units.find(e=>e.id===t.objective.targetId)?.defeated){let e={victory:!0,turns:t.round,hostilesEliminated:t.hostilesEliminated,squadStanding:n.length,squadDeployed:i,damageTaken:t.damageTaken,bonesRecovered:0,objectiveComplete:!0};return{...t,outcome:`victory`,results:e,mode:`locked`,activeId:null,actionSkillId:null}}if(t.objective?.type===`RECOVER`&&t.objective.completed){let e={victory:!0,turns:t.round,hostilesEliminated:t.hostilesEliminated,squadStanding:n.length,squadDeployed:i,damageTaken:t.damageTaken,bonesRecovered:0,objectiveComplete:!0};return{...t,outcome:`victory`,results:e,mode:`locked`,activeId:null,actionSkillId:null}}if(r.length===0&&!t.objective){let e={victory:!0,turns:t.round,hostilesEliminated:t.hostilesEliminated,squadStanding:n.length,squadDeployed:i,damageTaken:t.damageTaken,bonesRecovered:18+t.hostilesEliminated*6};return{...t,outcome:`victory`,results:e,mode:`locked`,activeId:null,actionSkillId:null}}if(n.length===0){let e={victory:!1,turns:t.round,hostilesEliminated:t.hostilesEliminated,squadStanding:0,squadDeployed:i,damageTaken:t.damageTaken,bonesRecovered:0};return{...t,outcome:`defeat`,results:e,mode:`locked`,activeId:null,actionSkillId:null}}return t}function Va(e){let t={};for(let[n,r]of Object.entries(e.cooldowns))t[n]=Math.max(0,(r??0)-1);return{...e,cooldowns:t}}function Ha(e,t){let n=[],r=e.units.map(Ia),i=e.hostilesEliminated,a=e.damageTaken;r=r.map(e=>{if(e.id!==t||e.defeated)return e;let r=Va(e),o=[];for(let e of r.statuses){if(e.type===`BLEED`){let t=Math.max(1,Math.round(e.value)),o=Math.max(0,r.hp-t),s=o<=0;if(r.team===`ally`&&(a+=t),s&&r.team===`enemy`&&!r.defeated&&(i+=1),n.push({type:`damage`,unitId:r.id,amount:t,text:`-${t}`,kind:`dmg`}),n.push({type:`ticker`,text:`${r.name}  ·  BLEED`}),s)return n.push({type:`defeat`,unitId:r.id,text:`DOWN`,kind:`info`}),{...r,hp:o,defeated:!0,statuses:[]};r={...r,hp:o}}let t=e.duration-1;t<=0?n.push({type:`expire`,unitId:r.id,text:`${ci[e.type]} ended`,kind:`info`}):o.push({...e,duration:t})}return{...r,statuses:o,hasMoved:!1,hasActed:!1}});let o={...e,units:r,hostilesEliminated:i,damageTaken:a,activeId:t,inspectId:null,actionSkillId:null,mode:`selected`};o=Ba(o);let s=o.units.find(e=>e.id===t);return(o.outcome!==`ongoing`||!s||s.defeated)&&(o={...o,activeId:s&&!s.defeated?o.activeId:null,mode:`locked`}),{state:o,events:n}}function Ua(e){if(e.outcome!==`ongoing`)return{state:e,events:[]};let t=ji(e.units.map(Ia)),n=Mi(t);if(!n)return{state:e,events:[]};t=t.map(e=>e.id===n?Ni(e):e);let r=e.actionsLeftInRound,i=e.round;if(r<=0){if(i+=1,e.objective?.type===`HOLD`&&e.objective.relayPressure&&(e=Ba({...e,round:i}),e.outcome!==`ongoing`))return{state:e,events:[]};r=Math.max(1,Ti(t).length)}--r;let a=Ha({...e,units:t,unitTurn:e.unitTurn+1,round:i,actionsLeftInRound:r,mode:`locked`},n),o=a.state,s=[...a.events],c=o.reinforcement;if(o.outcome===`ongoing`&&c&&!c.spawned&&o.round>=c.triggerRound){let e=c.spawn;if(o.directive?.reinforcement){let t=Array.from({length:De*Oe},(e,t)=>({c:t%De,r:Math.floor(t/De)})).filter(e=>yi(o.units,e.c,e.r)).sort((t,n)=>Math.abs(t.c-e.c)+Math.abs(t.r-e.r)-(Math.abs(n.c-e.c)+Math.abs(n.r-e.r)));if(!t.length)return{state:o,events:s};e={...e,...t[0]}}let t=La(e.defId,e.id,e.c,e.r);c.entryMeter!=null&&(t.meter=c.entryMeter),o={...o,units:[...o.units,t],reinforcement:{...c,spawned:!0}},s.push({type:`ticker`,text:`REINFORCEMENT INBOUND · HOUND MK-2`})}let l=o.units.find(e=>e.id===n);return o.outcome===`ongoing`&&(!l||l.defeated)?Ua({...o,activeId:null}):{state:o,events:s}}function Wa(e,t=ee,n=null,r=null,i=null,a=null,o){return Ua(Ra(e,t,n,r,i,a,o))}function Ga(e){let t=e.units.find(t=>t.id===e.activeId),n=e.objective;return!n||n.type!==`RECOVER`||n.completed||!t||t.team!==`ally`||t.defeated||t.hasActed||n.squadExtractionRadius!=null&&(e.units.filter(e=>e.team===`ally`).length!==3||e.units.some(e=>e.team===`ally`&&(e.defeated||Math.abs(e.c-n.terminal.c)+Math.abs(e.r-n.terminal.r)>n.squadExtractionRadius)))?!1:rt(e)&&Math.abs(t.c-n.terminal.c)+Math.abs(t.r-n.terminal.r)<=(t.recoverRange||1)}function Ka(e){if(!Ga(e))return{state:e,events:[],ok:!1};let t=e.units.find(t=>t.id===e.activeId),n=e.units.map(e=>e.id===t.id?{...e,hasActed:!0}:e);return{state:Ba({...e,units:n,objective:{...e.objective,completed:!0},actionSkillId:null,mode:`locked`}),ok:!0,events:[{type:`status`,unitId:t.id,text:`SIGNAL RECOVERED`,kind:`info`},{type:`ticker`,text:`OBJECTIVE COMPLETE · SIGNAL RECOVERED`}]}}function qa(e,t,n){let r=e.units.find(t=>t.id===e.activeId);if(!r||r.defeated||r.hasMoved||r.hasActed||!yi(e.units,t,n,r.id)||!vi(r,e.units).some(e=>e.c===t&&e.r===n))return{state:e,events:[],ok:!1};let i=e.units.map(e=>e.id===r.id?{...e,c:t,r:n,hasMoved:!0}:e);return{state:Ba({...e,units:i,inspectId:null}),events:[{type:`move`,unitId:r.id,text:`${r.name}  ·  repositions`},{type:`ticker`,text:`${r.name}  ·  repositions`}],ok:!0}}function Ja(e){let t=e.units.find(t=>t.id===e.activeId);if(!t||t.defeated||t.hasActed)return{state:e,events:[],ok:!1};let n=e.units.map(e=>e.id===t.id?{...e,hasActed:!0}:e);return{state:{...e,units:n,actionSkillId:null,mode:`locked`},events:[{type:`ticker`,text:`${t.name}  ·  holds`}],ok:!0}}function Ya(e,t,n,r){let i=Ki(e,t,n,r);return i.ok?{...i,state:Ba(i.state)}:i}function Xa(e,t){if(!aa(e,t)&&t.type!==`skip`){let t=Ja(e);return{state:t.state,events:t.events}}let n=[],r=e;if(t.type===`skip`){let e=Ja(r);return{state:e.state,events:e.events}}if(t.type===`move`){let e=qa(r,t.to.c,t.to.r);if(e.ok&&(r=e.state,n.push(...e.events)),r.outcome!==`ongoing`)return{state:r,events:n};if(t.then){let e=Xa(r,t.then);return{state:e.state,events:[...n,...e.events]}}let i=Ja(r);return{state:i.state,events:[...n,...i.events]}}if(t.type===`skill`){let e=Ya(r,t.skillId,t.targetId,t.cell);if(e.ok)return{state:e.state,events:[...n,...e.events]};let i=Ja(r);return{state:i.state,events:[...n,...i.events]}}return{state:r,events:n}}function Za(e){return ia(e)}function Qa(e){let t=e.skillIds[0];return t?Ut(dn(t),e.growth).maxRange:1}var $a=c({BATTLEFIELD_LAB_KEY:()=>Te,BATTLEFIELD_VNEXT_PREVIEW:()=>Ee,DEF_CURVE:()=>50,FIELD_PROJECTION:()=>bi,GRID_COLS:()=>De,GRID_ROWS:()=>Oe,METER_MAX:()=>100,STATUS_LABEL:()=>ci,STATUS_SHORT:()=>li,a1Range:()=>Qa,advanceToNext:()=>Ua,aiUsesLegalRules:()=>aa,applyAi:()=>Xa,applySkill:()=>Ki,applyStatus:()=>ni,availableSkills:()=>qi,beginUnitTurn:()=>Ha,canOccupy:()=>yi,canRecover:()=>Ga,cellKey:()=>mi,chebyshev:()=>pi,chooseAiAction:()=>ia,computeHeal:()=>di,consumeMeter:()=>Ni,cooldownLeft:()=>Ui,createBattle:()=>Ra,effectiveAtk:()=>ii,effectiveDef:()=>ai,effectiveSpd:()=>oi,encounterPressureAction:()=>ra,evaluateOutcome:()=>Ba,fieldPercent:()=>Si,fieldPercentForGrid:()=>xi,fieldTouchFootprint:()=>Ci,getStatusSequence:()=>ei,hasStatus:()=>ti,inBounds:()=>fi,inSkillRange:()=>wi,incomingDamageMultiplier:()=>si,isLegalTargetType:()=>ki,living:()=>Ti,mitigatedDamage:()=>ui,objectiveAwareEnemyAction:()=>ta,objectiveTargetScore:()=>Zi,occupiedKeys:()=>hi,pickReadyId:()=>Mi,planAi:()=>Za,previewQueue:()=>Pi,reachableCells:()=>vi,relayDenialAction:()=>na,resetStatusSeq:()=>$r,resolveSkillTargets:()=>Di,selectAcceptedBattleRules:()=>ke,skillNeedsTargetPick:()=>Oi,skillReady:()=>Wi,startBattle:()=>Wa,tickUntilReady:()=>ji,tryMove:()=>qa,tryRecover:()=>Ka,trySkill:()=>Ya,trySkip:()=>Ja,unitAt:()=>gi,unitSkills:()=>Hi,unitsInRadius:()=>Ei,validTargetIds:()=>K}),eo=null,to=!1;function no(){if(typeof window>`u`)return null;if(!eo){let e=window.AudioContext||window.webkitAudioContext;if(!e)return null;eo=new e}return eo}function ro(){let e=no();e&&e.state===`suspended`&&e.resume()}function io(){return to}function ao(e){to=e;try{localStorage.setItem(`tactical-ops-mute`,e?`1`:`0`)}catch{}}function q(){try{to=localStorage.getItem(`tactical-ops-mute`)===`1`}catch{to=!1}return to}function J(e,t,n,r=.05,i=0){if(to)return;let a=no();if(!a)return;let o=a.currentTime+i,s=a.createOscillator(),c=a.createGain();s.type=n,s.frequency.setValueAtTime(e,o),c.gain.setValueAtTime(1e-4,o),c.gain.exponentialRampToValueAtTime(r,o+.012),c.gain.exponentialRampToValueAtTime(1e-4,o+t),s.connect(c),c.connect(a.destination),s.start(o),s.stop(o+t+.02)}function Y(e){switch(e){case`select`:J(620,.06,`triangle`,.03);break;case`ui`:J(480,.05,`square`,.02);break;case`move`:J(220,.08,`sine`,.03);break;case`hit`:J(140,.1,`sawtooth`,.06),J(90,.12,`square`,.03,.02);break;case`guard`:J(360,.1,`triangle`,.04);break;case`heal`:J(520,.1,`sine`,.04),J(780,.12,`sine`,.03,.05);break;case`turn`:J(180,.14,`triangle`,.04),J(240,.12,`sine`,.03,.08);break;case`win`:J(440,.16,`triangle`,.05),J(660,.2,`triangle`,.045,.12);break;case`lose`:J(160,.22,`sawtooth`,.04),J(90,.28,`sine`,.04,.1);break;case`status`:J(400,.08,`triangle`,.03)}}var oo=`tactical_ops.js v3.6.63-tactical-power-v1`;function so(e){return e.defId===`alpha`||e.role===`alpha`?`alpha`:e.defId===`ally-02`?`cnc`:e.defId===`ally-03`?`shadow`:`pet`}function co(e,t){return e.growth?.ranks[Ht(t)]||0}function lo(e,t){let n=e.combatMastery;if(!n||n.stage<2)return null;let r=Ht(t),i=so(e);if(i===`cnc`&&r===`u02-suppress`)return n.stage>=3?`signature`:`trained`;if(i===`shadow`){if(r===`u03-pack`)return n.stage>=3&&n.selected===`B`?`signature`:`trained`;if(r===`u03-mend`&&n.stage>=3&&n.selected===`A`)return`signature`}return i===`pet`&&r===`pet-hamstring`&&n.stage>=3&&n.selected===`A`?`signature`:null}function uo(e,t){let n=lo(e,t);if(n)return n;let r=co(e,t);return r===2?`rank2`:r===1?`rank1`:`base`}function fo(e,t){let n=uo(e,t);return n===`signature`?`SIGNATURE`:n===`trained`?`TRAINED`:n===`rank2`?`R2`:n===`rank1`?`R1`:null}function po(e){if(e.defId===`alpha`)return e.growth?.discipline?.toUpperCase()||null;let t=e.combatMastery;return!t||t.stage<2?null:t.stage>=3&&t.selected?`MASTERED · ${t.selected}`:`TRAINED · 3/8`}function mo(e,t,n,r,i){let a=n.filter(e=>(e.type===`damage`||e.type===`heal`||e.type===`status`)&&!!e.unitId);if(!a.length&&!i)return null;let o=Ut(dn(t),e.growth),s=a.filter(e=>e.type===`damage`).reduce((e,t)=>e+(t.amount||0),0),c=a.filter(e=>e.type===`heal`).reduce((e,t)=>e+(t.amount||0),0),l=a.filter(e=>e.type===`status`),u=l.some(e=>e.kind===`guard`),d=i?`control`:s?`damage`:c?`heal`:u?`guard`:l.length?`control`:`support`,f=i?`ENEMY INTENT CANCELED`:s?`−${s} HP`:c?`+${c} HP`:l.length?l[0].text||`STATUS APPLIED`:`EFFECT RESOLVED`,p=uo(e,t),m=fo(e,t),h=o.targetType===`ALLY_AOE`||o.targetType===`SELF`?e.id:a[0]?.unitId||e.id;return{id:r,actorId:e.id,targetId:h,affinity:so(e),tier:p,title:`${o.name}${m?` · `+m:``}`,consequence:f,mode:d,interrupted:i}}function ho(e,t,n){return so(e)!==`pet`||e.combatMastery?.stage!==3||e.combatMastery.selected!==`B`||e.c===t.c&&e.r===t.r?null:{id:n,actorId:e.id,targetId:t.id,affinity:`pet`,tier:`signature`,title:`PATHFINDER · SIGNATURE`,consequence:`POSITION SECURED`,mode:`movement`,interrupted:!1}}var go=`/images/tactical_ops/combat_fx/v1/`,_o={alpha_strike:540,alpha_rend:680,alpha_howl:820,alpha_guard:640,cnc_thrust:500,cnc_lunge:580,cnc_pressure:720,cnc_interrupt:760,shadow_sweep:520,shadow_mend:760,shadow_pack_heal_def:820,shadow_pack_def_only:820,shadow_pack_guard:820,pet_bite:500,pet_hamstring:740,pet_pathfinder:660,objective_recover:880},vo={alpha_strike:`fx-alpha fx-hit fx-strike`,alpha_rend:`fx-alpha fx-hit fx-rend`,alpha_howl:`fx-alpha fx-howl`,alpha_guard:`fx-alpha fx-guard`,cnc_thrust:`fx-cnc fx-hit fx-thrust`,cnc_lunge:`fx-cnc fx-hit fx-lunge`,cnc_pressure:`fx-cnc fx-control`,cnc_interrupt:`fx-cnc fx-interrupt`,shadow_sweep:`fx-shadow fx-hit fx-sweep`,shadow_mend:`fx-shadow fx-mend`,shadow_pack_heal_def:`fx-shadow fx-pack`,shadow_pack_def_only:`fx-shadow fx-pack`,shadow_pack_guard:`fx-shadow fx-pack`,pet_bite:`fx-pet fx-hit fx-bite`,pet_hamstring:`fx-pet fx-hit fx-hamstring`,pet_pathfinder:`fx-pet fx-pathfinder`,objective_recover:`fx-objective fx-recover`};function yo(e){return vo[e]??``}function bo(e){return[`alpha_strike`,`alpha_rend`,`shadow_sweep`,`pet_bite`,`pet_hamstring`].includes(e)?`dash`:[`cnc_thrust`,`cnc_lunge`,`cnc_pressure`,`cnc_interrupt`].includes(e)?`beam`:`none`}function xo(e){let t=e.find(e=>bo(e.name)!==`none`);return t?Math.max(80,Math.round(t.durationMs*(bo(t.name)===`beam`?.46:.37))):0}function So(e,t,n,r){if(!(e in _o))throw Error(`Unknown combat FX `+e);return{id:t,name:e,targetId:n,terminal:r,durationMs:_o[e]}}function Co(e,t,n,r,i){let a=Ht(t),o=e=>n.some(t=>t.type===e),s=e=>n.some(t=>t.type===`status`&&(t.text||``).toUpperCase()===e),c=e=>[...new Set(n.filter(t=>t.type===e&&t.unitId).map(e=>e.unitId))],l=c(`damage`)[0]||c(`status`)[0]||c(`heal`)[0],u=[],d=(t,n)=>u.push({...So(t,r+u.length,n||e.id),actorId:e.id,from:{c:e.c,r:e.r}}),f=o(`damage`),p=n.some(e=>e.type===`heal`&&(e.amount||0)>0);switch(a){case`alpha-strike`:f&&d(`alpha_strike`,l);break;case`alpha-rend`:f&&d(`alpha_rend`,l);break;case`alpha-howl`:if((s(`ATK UP`)||s(`SPD UP`))&&d(`alpha_howl`),s(`GUARD`))for(let e of c(`status`).filter(e=>n.some(t=>t.type===`status`&&t.unitId===e&&t.kind===`guard`)))d(`alpha_guard`,e);break;case`u02-shot`:f&&d(`cnc_thrust`,l);break;case`u02-burst`:f&&d(`cnc_lunge`,l);break;case`u02-suppress`:s(`ATK DOWN`)&&d(`cnc_pressure`,l),i&&d(`cnc_interrupt`,l);break;case`u03-tap`:f&&d(`shadow_sweep`,l);break;case`u03-mend`:if(p)for(let e of c(`heal`))d(`shadow_mend`,e);break;case`u03-pack`:p&&s(`DEF UP`)?d(`shadow_pack_heal_def`):s(`DEF UP`)&&d(`shadow_pack_def_only`),s(`GUARD`)&&d(`shadow_pack_guard`);break;case`pet-bite`:f&&d(`pet_bite`,l);break;case`pet-hamstring`:s(`SPD DOWN`)&&d(`pet_hamstring`,l)}return u}function wo(e,t,n){return!e.defId.startsWith(`pet:`)||e.combatMastery?.stage!==3||e.combatMastery.selected!==`B`||e.c===t.c&&e.r===t.r?[]:Math.abs(e.c-t.c)+Math.abs(e.r-t.r)>4?[So(`pet_pathfinder`,n,e.id)]:[]}function To(e,t,n){if(e.type!==`damage`||!e.unitId||!e.amount||e.amount<=0)return null;let r=t.find(t=>t.id===e.unitId);if(!r)return null;let i=n[e.unitId]??r.hp;return i>0&&i-e.amount<=0&&r.defeated?{unitId:e.unitId,kind:`finisher`,label:`TARGET DOWN`}:r.statuses.some(e=>e.type===`GUARD`)?{unitId:e.unitId,kind:`guarded`,label:`GUARD ACTIVE`}:null}function Eo(e,t,n){return!e||!t||!n.some(e=>e.type===`status`&&e.unitId===t)?null:{unitId:t,kind:`counter`,label:`SIGNAL BROKEN`}}function Do(e,t,n,r,i){if(e.team!==`enemy`||e.defeated)return null;let a=n.find(t=>(t.type===`damage`||t.type===`status`)&&t.unitId&&t.unitId!==e.id),o=r.find(e=>e.id===a?.unitId);if(!o)return null;let s=/jam|intimidate|interference/.test(t)?`jam`:/pulse|aim|shot/.test(t)||e.archetype===`MARKSMAN`?`ranged`:/crush|maul/.test(t)||e.role===`leader`?`heavy`:`melee`,c=s===`heavy`?680:s===`jam`?620:550,l=s===`heavy`?.49:s===`melee`?.42:.44;return{id:i,actorId:e.id,style:s,from:{c:e.c,r:e.r},to:{c:o.c,r:o.r},durationMs:c,contactMs:Math.round(c*l)}}function Oo(e,t){return{runId:e,missionId:t,moments:[]}}var ko=e=>e.defId.startsWith(`pet:`),Ao=(e,t)=>e===t||e.startsWith(t+`:mastery:`);function jo(e,t){return e.moments.some(e=>e.kind===t.kind&&e.unitTurn===t.unitTurn)?e:{...e,moments:[...e.moments.slice(-23),t]}}function Mo(e,t,n,r,i,a,o){if(!e||o.outcome!==`ongoing`||t.defeated||t.team!==`ally`||!i.length)return e;let s=!!(r&&o.units.some(e=>e.id===r&&e.team===`enemy`)&&i.some(e=>e.type===`status`&&e.unitId===r)),c=t.defId===`ally-03`&&Ao(n,`u03-pack`)||t.defId===`ally-03`&&Ao(n,`u03-pack-warden`),l=i.some(e=>e.type===`status`&&o.units.some(t=>t.id===e.unitId&&t.team===`ally`)),u=e;return t.defId===`ally-02`&&(Ao(n,`u02-suppress`)||Ao(n,`u02-pressure-disruptor`))&&s&&(u=jo(u,{kind:`CNC_CONTROL`,unitTurn:o.unitTurn,detail:`CNC applied a control status to an enemy.`}),a&&(u=jo(u,{kind:`CNC_INTERRUPT`,unitTurn:o.unitTurn,detail:`CNC canceled a locked enemy intent with confirmed control.`}))),c&&l&&(u=jo(u,{kind:`SHADOW_COVER`,unitTurn:o.unitTurn,detail:`SHADOW applied protection to an ally.`})),ko(t)&&Ao(n,`pet-hamstring`)&&s&&(u=jo(u,{kind:`PET_SLOW`,unitTurn:o.unitTurn,detail:`PET applied HAMSTRING to an enemy.`}),r===`courier`&&o.objective?.type===`INTERCEPT`&&(u=jo(u,{kind:`PET_COURIER_SLOW`,unitTurn:o.unitTurn,detail:`PET slowed the mission courier with HAMSTRING.`}))),u}function No(e,t,n){if(!e||t.objective?.type!==`HOLD`||n.objective?.type!==`HOLD`||n.objective.progress<=t.objective.progress||!n.objective.terminal)return e;let r=n.objective;return n.units.some(e=>e.team===`ally`&&!e.defeated&&Math.max(Math.abs(e.c-r.terminal.c),Math.abs(e.r-r.terminal.r))<=(r.radius??0)&&e.statuses.some(e=>(e.source===`ally-03`||e.source.startsWith(`u03-pack`))&&(e.type===`GUARD`||e.type===`DEF_UP`)&&e.duration>0))?jo(e,{kind:`SHADOW_HOLD`,unitTurn:n.unitTurn,detail:`Relay control advanced to ${r.progress}/${r.duration} while SHADOW's protection covered the holder.`}):e}function Po(e,t,n){if(!e)return[];let r=[];return t.includes(`ally-02`)&&n&&r.push({id:`cnc`,title:`CNC · COUNTER SPECIALIST`,instruction:`Use Disruptor PRESSURE on an announced, locked threat before it resolves.`,requirement:`Requires CNC Disruptor and a real VNext enemy intent. No bonus currency.`}),t.includes(`ally-03`)&&e.objectiveType===`HOLD`&&r.push({id:`shadow`,title:`SHADOW · RELAY GUARDIAN`,instruction:`Advance HOLD while an ally controlling the relay has SHADOW's active protection.`,requirement:`Enemy contesting resets progress. No bonus currency.`}),t.some(e=>e.startsWith(`pet:`))&&e.objectiveType===`INTERCEPT`&&r.push({id:`pet`,title:`PET · COURIER HUNTER`,instruction:`Apply HAMSTRING to the courier, then win the intercept objective.`,requirement:`PET is one possible approach; CNC or positioning can also stop the courier.`}),t.includes(`ally-03`)&&(t.includes(`ally-02`)||t.some(e=>e.startsWith(`pet:`)))&&r.push({id:`synergy`,title:`PACK · CHAIN REACTION`,instruction:`Win after CNC control → SHADOW cover, OR PET HAMSTRING → SHADOW cover.`,requirement:`Two legal routes. PET is optional; ability use must be confirmed by the engine.`}),r}function Fo(e,t,n){return e.some(r=>r.kind===t&&e.some(e=>e.kind===n&&e.unitTurn>r.unitTurn))}function Io(e,t,n,r){if(!e||e.runId!==t||!n)return[];let i=new Set(e.moments.map(e=>e.kind)),a=new Set(r.map(e=>e.id)),o=[];if(a.has(`cnc`)&&i.has(`CNC_INTERRUPT`)&&o.push({id:`cnc`,title:`COUNTER SPECIALIST`,evidence:`An enemy's locked attack was genuinely canceled by CNC.`}),a.has(`shadow`)&&i.has(`SHADOW_HOLD`)&&o.push({id:`shadow`,title:`RELAY GUARDIAN`,evidence:`HOLD progress advanced while SHADOW's protection covered the relay holder.`}),a.has(`pet`)&&i.has(`PET_COURIER_SLOW`)&&o.push({id:`pet`,title:`COURIER HUNTER`,evidence:`PET HAMSTRING affected the courier during the won intercept.`}),a.has(`synergy`)){let t=Fo(e.moments,`CNC_CONTROL`,`SHADOW_COVER`),n=Fo(e.moments,`PET_SLOW`,`SHADOW_COVER`);(t||n)&&o.push({id:`synergy`,title:`CHAIN REACTION`,evidence:t?`CNC control → SHADOW protection → objective won.`:`PET HAMSTRING → SHADOW protection → objective won.`})}return o}function Lo(e,t){if(!e||e.runId!==t)return null;for(let t of[`CNC_INTERRUPT`,`SHADOW_HOLD`,`PET_COURIER_SLOW`,`SHADOW_COVER`,`CNC_CONTROL`,`PET_SLOW`]){let n=e.moments.find(e=>e.kind===t);if(n)return n}return null}var Ro={id:`solo-1`,operationName:`BROKEN SIGNAL — CONTACT`,objective:`Defeat the hostile scout.`,teaching:`Move toward the scout. STRIKE works from 1 tile away.`,steps:[`Tap a highlighted tile to move toward the scout.`,`When next to the scout, tap STRIKE (A1), then tap the scout.`],next:`solo-2`,resultsTitle:`DRILL COMPLETE`,resultsNote:`Next: multiple hostiles.`,spawns:[{defId:`alpha`,id:`alpha`,c:2,r:2},{defId:`hostile`,id:`h2`,c:5,r:3}]},zo={id:`solo-2`,operationName:`BROKEN SIGNAL — SPLIT CONTACT`,objective:`Defeat both hostile scouts.`,teaching:`Attack one scout, then reposition to reach the other.`,steps:[`Move into attack range of the first scout.`,`Attack, then reposition for the second scout.`],next:`ally-koda`,resultsTitle:`DRILL COMPLETE`,resultsNote:`COLDNCURSED / CNC — BUG HUNTER WARDEN joins Alpha for the next deployment.`,spawns:[{defId:`alpha`,id:`alpha`,c:2,r:2},{defId:`hostile`,id:`h1`,c:5,r:0},{defId:`hostile`,id:`h2`,c:5,r:3}]},Bo={id:`ally-koda`,operationName:`BROKEN SIGNAL — PACK LINK`,objective:`Defeat the hostiles with Alpha and CNC.`,teaching:`Alpha attacks up close. CNC can attack from up to 3 tiles away.`,steps:[`Move Alpha close enough to strike.`,`Use CNC to attack enemies farther away.`],next:`full-broken-signal`,resultsTitle:`SQUAD LINK ESTABLISHED`,resultsNote:`Full operation ready.`,spawns:[{defId:`alpha`,id:`alpha`,c:2,r:2},{defId:`ally-02`,id:`ally-02`,c:1,r:0},{defId:`hostile`,id:`h1`,c:5,r:0},{defId:`hostile`,id:`h2`,c:5,r:3}]},Vo={id:`full-broken-signal`,operationName:`BROKEN SIGNAL`,objective:`Defeat the hostile squad to complete Broken Signal.`,teaching:`Alpha fights up close, CNC attacks from range, and Shadow supports the pack.`,steps:[`Use Alpha and CNC to pressure hostiles.`,`Keep the squad standing with Shadow's support.`],next:null,resultsTitle:`OPERATION COMPLETE`,resultsNote:`Hostile force eliminated.`,spawns:ee},Ho={"solo-1":Ro,"solo-2":zo,"ally-koda":Bo,"full-broken-signal":Vo},Uo=`solo-1`;function Wo(e){return Object.prototype.hasOwnProperty.call(Ho,e)}function Go(e){return e&&Wo(e)?Ho[e]:Ro}function Ko(e,t){return e?Go(t).spawns:ee}function qo(e,t){return e?Go(t):Vo}function Jo(e){let t=new Set,n=[];for(let r of e){let e=r.unitDef||k[r.defId];e&&e.team===`ally`&&!t.has(e.defId)&&(t.add(e.defId),n.push(e))}return n}function Yo(e){let t=new Map;for(let n of e){let e=n.unitDef||k[n.defId];e&&e.team===`enemy`&&t.set(e.defId,{def:e,count:(t.get(e.defId)?.count||0)+1})}return[...t.values()]}var Xo={c:3,r:2},Zo={c:3,r:1},Qo={c:4,r:2},$o={c:3,r:3},es={c:1,r:4},ts=[{threat:`contest`,deadline:7,patrol:[{c:4,r:1},{c:6,r:2},{c:5,r:3}],reserve:{c:7,r:2},arrival:3},{threat:`flank`,deadline:7,patrol:[{c:5,r:1},{c:5,r:2},{c:5,r:3}],reserve:{c:5,r:4},arrival:3,flank:es},{threat:`crosslink`,deadline:7,patrol:[{c:4,r:1},{c:6,r:2},{c:5,r:3}],reserve:{c:5,r:4},arrival:3,route:[Zo,Qo,$o,Xo]},{threat:`contest`,deadline:6,patrol:[{c:4,r:2},{c:5,r:1},{c:4,r:3}],reserve:{c:6,r:2},arrival:2},{threat:`flank`,deadline:6,patrol:[{c:5,r:1},{c:5,r:2},{c:4,r:3}],reserve:{c:4,r:4},arrival:2,flank:es},{threat:`crosslink`,deadline:6,patrol:[{c:4,r:1},{c:6,r:2},{c:4,r:3}],reserve:{c:5,r:4},arrival:2,route:[Zo,$o,{c:5,r:2},Xo]}],ns={contest:`RELAY CONTEST`,flank:`FLANK PRESSURE`,crosslink:`FORCED REPOSITION`},rs=`field-reinforcement`;function is(e,t){let n=Number.isInteger(e)?ts[e-1]:void 0;if(!n||t!==1)throw Error(`unsupported_relay_pressure_level`);let r=W(`field-relay-hold`),i=n.route?.[0]??Xo,a=n.patrol.map((e,t)=>({...e,defId:`hostile`,id:`h${t+1}`})),o=n.flank?3:4,s=`Secure ${o} consecutive checkpoints by the end of round ${n.deadline}. A missed checkpoint resets progress.`,c=n.threat===`flank`?`Hold the main relay. From round ${n.arrival}, also hold the marked flank relay.`:n.threat===`crosslink`?`Occupy the active relay at each checkpoint. The next relay activates after a successful check.`:`Occupy the relay and clear adjacent enemies before each checkpoint.`,l=n.threat===`flank`?`Send a second holder to the flank before the marked HOUND arrives. Keep support in reach of both holders.`:n.threat===`crosslink`?`Stage the next holder before the current checkpoint. Any living ally can make the handoff.`:`Keep one ally on the relay and use control or focus fire on enemies approaching the contest area.`,u={type:`REINFORCEMENTS`,name:`HOUND RESERVE`,copy:`A HOUND enters at the marked approach in round ${n.arrival}.`,maxRounds:n.deadline,reinforcement:{spawn:{...n.reserve,defId:`hostile`,id:rs},triggerRound:n.arrival,telegraphed:!0,spawned:!1}};return{...r,name:`RELAY PRESSURE ${e} · ${ns[n.threat]}`,challenge:void 0,briefCopy:`${c} ${s}`,resultsCopy:``,squadHint:l,spawns:a,directive:u,objective:{type:`HOLD`,terminal:i,radius:1,holderRadius:0,duration:o,progress:0,checkedRound:1,relayRoute:n.route,relayPressure:{flank:n.flank&&{tile:n.flank,activeRound:n.arrival,enemyId:rs}}}}}var as=()=>({pending:[],ledger:[],sequence:0,reactionObserved:{}});function os(e){return e.type===`skill`?e:e.type===`move`&&e.then?.type===`skill`?e.then:null}function ss(e){return{c:e.c,r:e.r}}function cs(e,t){let n=Pi(e,12),r=n.indexOf(t);if(r<0)return!1;let i=n.indexOf(t,r+1);return i<0?!1:n.slice(r+1,i).some(t=>e.units.some(e=>e.id===t&&e.team===`ally`&&!e.defeated))}function ls(e,t){if(!e.pending.length)return e;let n=[],r={...e.reactionObserved},i=[...e.ledger];for(let a of e.pending){let e=Ve(a.plan,t);e.status===`CANCELED`?(i.push(...e.events),delete r[a.plan.id]):n.push(a)}return n.length===e.pending.length?e:{...e,pending:n,reactionObserved:r,ledger:i}}function us(e,t){let n=t.units.find(e=>e.id===t.activeId);if(!n||n.team!==`ally`||n.defeated)return e;let r={...e.reactionObserved};for(let n of e.pending)t.unitTurn>n.plan.warnsOnUnitTurn&&(r[n.plan.id]=!0);return{...e,reactionObserved:r}}function ds(e,t,n,r){if(n.type===`skip`||!os(n))return null;let i=e.units.find(e=>e.id===t);if(!i||i.defeated||i.team!==`enemy`)return null;let a=os(n),o=a?dn(a.skillId):null;if(o&&(o.targetType===`SELF`||o.targetType===`ALLY_AOE`))return null;let s=a?.targetId?e.units.find(e=>e.id===a.targetId):null,c=e.objective,l=(c?.type===`INTERCEPT`&&c.screenedEscape||c?.type===`SURVIVE`&&c.trackingMarksman)===!0&&n.type===`skill`&&o?.id===`hound-aim`&&!!s,u=s?ss(s):a?.cell?ss(a.cell):n.type===`move`?ss(n.to):ss(i),d=o&&[`AREA_RADIUS`,`ENEMY_AOE`].includes(o.targetType)?Array.from({length:De*Oe},(e,t)=>({c:t%De,r:Math.floor(t/De)})).filter(e=>Math.max(Math.abs(e.c-u.c),Math.abs(e.r-u.r))<=o.radius):[u],f=o?.id.includes(`interference`)||o?.id.includes(`intimidate`)?`JAM`:n.type===`move`&&!a?`CHARGE`:o?.targetType===`AREA_RADIUS`||o?.targetType===`ENEMY_AOE`?`AREA`:`ATTACK`,{plan:p}=Be({id:`threat:${e.unitTurn}:${t}:${r}`,enemyId:t,kind:f,targetUnitId:s?.id??null,targetTile:l?null:u,impactTiles:d,predictedEffect:l?`TARGET LOCK · TRACKING · RANGE 2–4`:o?o.name:`Enemy attack`,warnsOnUnitTurn:e.unitTurn,resolvesOnUnitTurn:e.unitTurn+1,responses:[`KILL`,`DISRUPT`,`REPOSITION`,`BLOCK`,`PROTECT`,`TRADE`],fallbackPolicy:`CANCEL`},e);return{plan:p,action:n}}function fs(e,t){let n=t.units.find(e=>e.id===t.activeId);if(!n||n.team!==`enemy`||n.defeated||e.pending.some(e=>e.plan.enemyId===n.id)||!cs(t,n.id))return e;let r=ia(t),i=ds(t,n.id,r,e.sequence+1);return i?{...e,sequence:e.sequence+1,pending:[...e.pending,i],ledger:[...e.ledger,{type:`threat_announced`,intentId:i.plan.id,enemyId:n.id,unitTurn:t.unitTurn}]}:e}function ps(e,t){let n=e.pending.findIndex(e=>e.plan.enemyId===t.activeId);if(n<0)return{cycle:e,state:t};let r=e.pending[n],i=Ve(r.plan,t);if(i.status===`COMMIT`&&!e.reactionObserved[r.plan.id]||i.status===`WAIT`)return{cycle:e,state:t};let a=e.pending.filter((e,t)=>t!==n),o={...e.reactionObserved};if(delete o[r.plan.id],i.status===`CANCELED`)return{state:t,cycle:{...e,pending:a,reactionObserved:o,ledger:[...e.ledger,...i.events]}};if(!aa(t,r.action))return{state:t,cycle:{...e,pending:a,reactionObserved:o,ledger:[...e.ledger,{type:`threat_countered`,intentId:r.plan.id,reason:`INVALIDATED`,unitTurn:t.unitTurn}]}};let s=t,c=Xa(t,r.action),l=c.state!==s&&c.events.some(e=>e.type===`damage`||e.type===`status`||e.type===`move`||e.type===`heal`);return{state:c.state,events:c.events,cycle:{...e,pending:a,reactionObserved:o,ledger:[...e.ledger,...l?[...i.events,...He(i.plan,t.unitTurn,!0)]:[{type:`threat_countered`,intentId:r.plan.id,reason:`INVALIDATED`,unitTurn:t.unitTurn}]]}}}function ms(e,t,n,r,i,a,o){let s=t.units.find(e=>e.id===r);if(!s||s.team!==`ally`||s.defeated||s.defId!==`ally-02`||s.growth?.discipline!==`disruptor`||!(a===`u02-suppress`||a===`u02-pressure-disruptor`||a.startsWith(`u02-pressure-disruptor:mastery:`)||a.startsWith(`u02-suppress:mastery:`))||!o.some(e=>e.type===`status`&&e.unitId===i)||t.unitTurn!==n.unitTurn)return{cycle:e,interrupted:!1};let c=e.pending.find(e=>e.plan.enemyId===i);if(!c)return{cycle:e,interrupted:!1};let l=Ve(c.plan,n,!0);if(l.status!==`CANCELED`)return{cycle:e,interrupted:!1};let u={...e.reactionObserved};return delete u[c.plan.id],{interrupted:!0,cycle:{...e,pending:e.pending.filter(e=>e.plan.id!==c.plan.id),reactionObserved:u,ledger:[...e.ledger,...l.events],interruptedEnemyIds:[...e.interruptedEnemyIds||[],i]}}}var hs=oo;function gs(e){return new Promise(t=>{if(typeof requestAnimationFrame>`u`){setTimeout(t,e);return}let n=performance.now(),r=i=>{i-n>=e?t():requestAnimationFrame(r)};requestAnimationFrame(r)})}var _s=1,vs=1,X=0,ys=!1;function bs(e){return Pi(e,7)}function xs(){return{units:[],activeId:null,inspectId:null,actionSkillId:null,mode:`idle`,round:1,unitTurn:0,actionsLeftInRound:0,outcome:`ongoing`,damageTaken:0,hostilesEliminated:0,results:null,seed:1,objective:null,reinforcement:null,signalCarrierId:null,routingTraceAcquired:!1}}function Ss(e){return e.units.find(t=>t.id===e.activeId)}function Cs(e){return e.foundationStage===`completed`?`full-broken-signal`:e.foundationStage}var Z=Zr((e,t)=>{let n=(n,r)=>{n&&r===X&&(e({combatMoment:n}),gs(1150).then(()=>{t().combatMoment?.id===n.id&&e({combatMoment:null})}))},r=(n,r)=>{if(!n.length||r!==X)return;let i=n.slice(0,5);e({combatFx:i}),gs(Math.max(...i.map(e=>e.durationMs))+70).then(()=>{t().combatFx[0]?.id===i[0].id&&e({combatFx:[]})})},i=async(t,n)=>(t&&(e({enemyScene:t}),await gs(t.contactMs)),n===X),a=async(e,t)=>{let n=xo(e);return n&&await gs(n),t===X},o=(t,n)=>{let r=new Set(n.filter(e=>(e.type===`damage`||e.type===`heal`)&&e.unitId).map(e=>e.unitId));r.size&&e(e=>({displayHp:{...e.displayHp,...Object.fromEntries(t.units.filter(e=>r.has(e.id)).map(e=>[e.id,e.hp]))}}))},s=t=>{t.unitId&&e(e=>{if(!(t.unitId in e.displayHp))return{};let n=e.displayHp[t.unitId],r=Math.max(0,Number(t.amount)||0),i=e.battle.units.find(e=>e.id===t.unitId),a=t.type===`damage`?Math.max(0,n-r):Math.min(i?.maxHp??n+r,n+r);return{displayHp:{...e.displayHp,[t.unitId]:a}}})},c=(t,n)=>{if(!t||n!==X)return;let r={...t,id:vs++};e(e=>({consequences:[...e.consequences,r].slice(-4)})),gs(1050).then(()=>{e(e=>({consequences:e.consequences.filter(e=>e.id!==r.id)}))})},l=(t,n,r)=>{let i=_s++;e(e=>({floats:[...e.floats,{id:i,unitId:t,text:n,kind:r}]})),gs(900).then(()=>{e(e=>({floats:e.floats.filter(e=>e.id!==i)}))})},u=async(n,r)=>{if(r===X){e(e=>({s3CombatProof:Ir(e.s3CombatProof,n)}));for(let i of n){if(r!==X)return;if(i.type===`ticker`&&i.text&&e({ticker:i.text}),i.type===`banner`&&i.text){if(e({banner:i.text}),Y(`turn`),await gs(520),r!==X)return;e({banner:null})}if(i.type===`damage`&&i.unitId&&i.text){if(c(To(i,t().battle.units,t().displayHp),r),s(i),Y(`hit`),e({impactId:i.unitId,impactKey:vs++}),l(i.unitId,i.text,i.kind??`dmg`),await gs(360),r!==X)return;e(e=>e.impactId===i.unitId?{impactId:null}:{})}i.type===`heal`&&i.unitId&&i.text&&(s(i),Y(`heal`),l(i.unitId,i.text,`heal`),await gs(240)),i.type===`status`&&i.unitId&&i.text&&(Y(`status`),l(i.unitId,i.text,i.kind??`status`),await gs(180)),i.type===`expire`&&i.unitId&&i.text&&l(i.unitId,i.text,`info`),i.type===`defeat`&&i.unitId&&(l(i.unitId,i.text??`DOWN`,`info`),await gs(260)),i.type===`move`&&Y(`move`)}r===X&&e({displayHp:{}})}},d=async n=>{let{battle:r}=t();if(r.outcome===`victory`)return e({busy:!0,banner:`SECTOR SECURED`,ticker:null,attackingId:null}),Y(`win`),await gs(1400),n===X&&e({screen:`sector`,busy:!1,banner:null}),!0;if(r.outcome===`defeat`){if(e({busy:!0,banner:`OPERATION FAILED`,ticker:null,attackingId:null}),Y(`lose`),await gs(1200),n!==X)return!0;let r=W(t().selectedMissionId);return e({screen:t().selectedTrialLevel!=null||t().chapterMode||r?.activity===`FIELD_OP`||r?.operationId===xt.operationId?`results`:`defeat`,busy:!1,banner:null}),t().selectedTrialLevel!=null&&typeof t().saveTrialResult==`function`?t().saveTrialResult():t().chapterMode?t().saveChapterResult():r?.activity===`FIELD_OP`&&t().saveFieldResult(),!0}return!1},f=as(),p=null,m=(e,t)=>({...e,units:e.units.map(e=>e.defId===`alpha`?{...Aa(e,t),weaponIcon:t.weapon?.icon||``,identitySource:t.source}:e)}),h=async s=>{let l=t(),f=p;if(l.screen!==`battle`||l.busy||!f||f.runId!==l.currentRunKey)return;let h=++X;e({busy:!0,ticker:`Confirming action…`});let g;try{g=await lr(f,s)}catch{try{g=await cr(f.runId)}catch{h===X&&(t().backToHub(),e({progressionError:`Connection interrupted. Resume Relay Recovery to reconnect.`}));return}}if(h!==X)return;p=g;for(let d of g.frames??[]){let f=t().battle,p=Ss(f),g=m(d.battle,l.identity),_=d.skillId,v=_&&p?.team===`enemy`?Do(p,_,d.events,f.units,vs++):null;if(_&&o(f,d.events),e({battle:g,queue:bs(g),threats:d.threats,attackingId:_?p?.id??null:null,..._?{lastActionSkillId:_}:{}}),_&&p?.team===`ally`){let i=Co(p,_,d.events,vs++,!!d.interrupted);if(r(i,h),!await a(i,h))return;n(mo(p,_,d.events,vs++,!!d.interrupted),h),e({s3CombatProof:Mo(t().s3CombatProof,p,_,s.type===`skill`?s.targetId:void 0,d.events,!!d.interrupted,f)}),d.interrupted&&s.type===`skill`&&s.targetId&&c(Eo(!0,s.targetId,d.events),h)}if(s.type===`move`&&p?.team===`ally`){let e=g.units.find(e=>e.id===p.id);e&&(Y(`move`),n(ho(p,e,vs++),h),r(wo(p,e,vs++),h))}if(s.type===`recover`&&g.outcome===`victory`&&g.objective?.type===`RECOVER`&&r([So(`objective_recover`,vs++,void 0,g.objective.terminal)],h),!await i(v,h)||(await u(d.events,h),h!==X))return;e({enemyScene:null,attackingId:null})}let _=m(g.battle,l.identity);if(e({battle:_,queue:bs(_),threats:g.threats}),await d(h))return;let v=Ss(_);e({busy:!1,ticker:v?`${v.name}  ·  ${v.hasMoved?`act`:`move or act`}`:null})},g=async n=>{if(n!==X||await d(n))return;let r=t().battle,i=Ua(r),a=No(t().s3CombatProof,r,i.state);if(Pe&&(f=ls(f,i.state),e({threats:f.pending.map(e=>e.plan)})),e({battle:i.state,queue:bs(i.state),s3CombatProof:a}),await u(i.events,n),n!==X||await d(n))return;let o=Ss(t().battle);if(Pe&&o?.team===`ally`&&(f=us(f,t().battle)),!o){e({busy:!1});return}if(o.team===`enemy`){if(e({busy:!0,ticker:`${o.name}`}),await gs(280),n!==X)return;await _(n);return}e({busy:!1,ticker:o.hasMoved?`${o.name}  ·  act`:`${o.name}  ·  move or act`})},_=async n=>{let r=t().battle,a=Ss(r);if(!a||a.team!==`enemy`){await g(n);return}if(Pe&&f.interruptedEnemyIds?.includes(a.id)){f={...f,interruptedEnemyIds:f.interruptedEnemyIds.filter(e=>e!==a.id)};let t=Ja(r);if(!t.ok)throw Error(`interrupted_enemy_could_not_skip`);e({battle:t.state,queue:bs(t.state),ticker:`INTERRUPTED · ENEMY TURN LOST`}),await u(t.events,n),n===X&&await g(n);return}if(Pe){let t=f.pending.find(e=>e.plan.enemyId===a.id);if(t){let s=ps(f,r);if(f=s.cycle,e({threats:f.pending.map(e=>e.plan)}),s.state!==r){let c=s.events??[],l=t.action.type===`skill`?t.action:t.action.type===`move`?t.action.then:null,d=l?.type===`skill`?Do(a,l.skillId,c,r.units,vs++):null;if(o(r,c),e({battle:s.state,queue:bs(s.state)}),!await i(d,n)||(await u(c,n),n!==X))return;e({enemyScene:null}),await gs(160),n===X&&await g(n);return}if(!f.pending.some(e=>e.plan.id===t.plan.id)){let t=Ja(r);e({battle:t.state,queue:bs(t.state),ticker:`THREAT COUNTERED`}),await u(t.events,n),n===X&&await g(n);return}let c=Ja(r);e({battle:c.state,queue:bs(c.state),ticker:`THREAT WAITING`}),await u(c.events,n),n===X&&await g(n);return}{let t=fs(f,r);if(t.pending.length>f.pending.length){f=t,e({threats:f.pending.map(e=>e.plan)});let i=Ja(r);e({battle:i.state,queue:bs(i.state),ticker:`ENEMY INTENT REVEALED`}),await u(i.events,n),n===X&&await g(n);return}}}let s=Za(r);s.type===`move`&&e({attackingId:null}),s.type===`skill`&&e({attackingId:a.id,lastActionSkillId:s.skillId});let c=Xa(t().battle,s),l=s.type===`skill`?s:s.type===`move`?s.then:null,d=l?.type===`skill`?Do(a,l.skillId,c.events,r.units,vs++):null;o(r,c.events),e({battle:c.state,queue:bs(c.state),attackingId:s.type===`skill`?a.id:null}),await i(d,n)&&(await u(c.events,n),n===X&&(e({enemyScene:null}),e({attackingId:null}),await gs(160),await g(n)))},v=async n=>{if(t().battle.routingTraceAcquired&&!ys){if(ys=!0,e({banner:`ROUTING TRACE ACQUIRED`,ticker:`Carrier signal recovered`}),Y(`status`),await gs(900),n!==X)return;e({banner:null})}Pe&&(f=ls(f,t().battle),e({threats:f.pending.map(e=>e.plan)})),!await d(n)&&await g(n)},y=t=>{e({progression:t,progressionStatus:`ready`,progressionError:null,progressionCommitPending:!1,onboardingEnabled:!0,onboardingStageId:Cs(t),foundationCompleted:t.completed})},b=async(n,r)=>{let i=t();if(i.screen!==`brief`||i.busy||i.fieldRendSavePending||i.kodaSavePending||i.shadowSavePending||i.progression?.operations?.[`broken-signal`]?.status!==`cleared`||r!==`A`&&r!==`B`)return;let a=n===`koda`?`kodaSavePending`:`shadowSavePending`;e({[a]:!0,progressionError:null});try{let e=await mr(vr(`${n}-sidegrade`),i.progression.revision,n,r);e.revision>=(t().progression?.revision||0)&&y(e)}catch(r){let i=r instanceof G?r.state:null;i&&i.revision>=(t().progression?.revision||0)&&y(i),e({progressionError:`${n===`koda`?`CNC`:`SHADOW`} selection could not be saved. Retry your choice.`})}finally{e({[a]:!1})}},x=(n,r,i,a,o=!1,s=!1,c=null,l,h,g,v,y,b,x)=>{ke(y),Fe(y||null),ys=!1,f=as();let S=Ma(ka()),{onboardingEnabled:C,onboardingStageId:w}=t(),T=i||Ko(C,w),E=a?{type:`RECOVER`,terminal:a,completed:!1}:o?{type:`BOSS`,targetId:`leader`}:null,D=o?{..._t,spawn:{..._t.spawn},telegraphed:s,spawned:!1}:null,O=l?ut(Mt(l,s,h,g),l.missionId,b):{objective:E,reinforcement:D,directive:null};p=x??null;let k=x?{state:m(x.battle,S),events:[]}:Wa(S,T,O.objective,O.reinforcement,c,O.directive,v);Y(`turn`),e({screen:`battle`,identity:S,battle:k.state,queue:bs(k.state),busy:!0,banner:null,ticker:null,floats:[],threats:x?.threats??[],attackingId:null,impactId:null,combatMoment:null,s3CombatProof:l?Oo(r,l.missionId):null,combatFx:[],enemyScene:null,displayHp:{},consequences:[],currentRunKey:r,activeRulesetVersion:y?.rulesetVersion||null,currentFieldContext:h||null,fieldResult:null,fieldMilestone:null,campaignResult:null,chapterResult:null,currentChapterIntel:b||null,currentCampaignContext:g||null,continueRequestId:null}),(async()=>{if(await u(k.events,n),n!==X||x&&await d(n))return;let r=Ss(t().battle);if(r?.team===`enemy`){await _(n);return}e({busy:!1,ticker:r?r.name+`  ·  move or act`:null})})()};return{screen:`hub`,activeRulesetVersion:null,battle:xs(),busy:!1,banner:null,ticker:null,floats:[],threats:[],attackingId:null,lastActionSkillId:null,impactId:null,impactKey:0,combatMoment:null,s3CombatProof:null,combatFx:[],enemyScene:null,displayHp:{},consequences:[],muted:!1,queue:[],identity:ka(),onboardingEnabled:!1,onboardingStageId:Uo,onboardingCompleted:{},lastVictoryKey:null,currentRunKey:null,progression:null,progressionStatus:`idle`,progressionError:null,progressionCommitPending:!1,continueRequestId:null,foundationCompleted:!1,selectedMissionId:null,missionFirstClear:null,selectedSquadIds:[],selectedApproach:`standard`,selectedDirectiveTier:`standard`,selectedLockdownPlan:`anchor`,selectedVeteranChallenge:!1,selectedMasteryChallenge:null,currentFieldContext:null,fieldResult:null,fieldMilestone:null,campaignResult:null,chapterResult:null,selectedTrialLevel:null,trialResult:null,chapterMode:!1,currentChapterIntel:null,currentCampaignContext:null,kodaSavePending:!1,fieldRendSavePending:!1,briefEntry:null,shadowSavePending:!1,configureOnboarding:n=>{let r=t().onboardingEnabled,i=typeof n.enabled==`boolean`?n.enabled:r,a=t().onboardingStageId,o=t().onboardingCompleted,s=t().lastVictoryKey,c=t().currentRunKey;n.stageId!=null&&n.stageId!==``?a=Go(n.stageId).id:i&&!r&&(a=Uo,o={},s=null,c=null),e({onboardingEnabled:i,onboardingStageId:a,onboardingCompleted:o,lastVictoryKey:s,currentRunKey:c})},loadFoundationProgression:async()=>{e({progressionStatus:`loading`,progressionError:null});try{let t=await tr();y(t),t.completed&&t.operations?.[`broken-signal`]&&e({screen:`war-table`})}catch(t){let n=t instanceof G?t.code:`progression_request_failed`,r=t instanceof G?t.state:null;r&&y(r),e({progressionStatus:r?`ready`:`error`,progressionError:n})}},refreshIdentity:()=>{e({identity:Ma(ka())});let t=typeof window<`u`&&window.__ahAlphaAccountSession||null;ja().then(n=>{!n||typeof window<`u`&&(window.__ahAlphaAccountSession||null)!==t||e({identity:Ma(ka())})})},upgradeGrowth:async(n,r,i,a)=>{let o=t(),s=o.progression?.playerGrowth;if(o.screen!==`war-table`||o.busy||o.progressionCommitPending||!o.progression||!s)return;let c=Wt(s,n);if(!(!c||c.discipline&&c.discipline!==r||!(n===`alpha`&&[`vanguard`,`howlkeeper`].includes(r)||n===`ally-02`&&[`pursuer`,`disruptor`].includes(r)||n===`ally-03`&&[`sentinel`,`medic`].includes(r))||s.earnedPoints-s.spentPoints<1||(c.ranks[i]??0)+1!==a)&&Ur(Vr(i,o.progression),c,a,r).length){e({progressionCommitPending:!0,progressionError:null});try{let e=await hr(vr(`growth-upgrade`),o.progression.revision,n,r,i,a);e.revision>=(t().progression?.revision??0)&&y(e)}catch(n){let r=n instanceof G?n.state:null;r&&r.revision>=(t().progression?.revision??0)&&y(r),e({progressionError:`Skillbook upgrade not confirmed (${n instanceof G?n.code:`progression_request_failed`}). Refresh to check your saved rank before trying again.`})}finally{e({progressionCommitPending:!1})}}},respecGrowth:async n=>{let r=t(),i=(r.progression?.playerGrowth)?.heroes.find(e=>e.heroId===n);if(!(r.screen!==`war-table`||r.busy||r.progressionCommitPending||!r.progression||!i||i.respecUsed||Object.keys(i.ranks).length===0)){e({progressionCommitPending:!0,progressionError:null});try{let e=await gr(vr(`growth-respec`),r.progression.revision,n);e.revision>=(t().progression?.revision??0)&&y(e)}catch(n){let r=n instanceof G?n.state:null;r&&r.revision>=(t().progression?.revision??0)&&y(r),e({progressionError:`Respec was not saved. Refresh your Skillbook and try again.`})}finally{e({progressionCommitPending:!1})}}},selectMastery:async(n,r)=>{let i=t();if([`brief`,`war-table`].includes(i.screen)&&!i.busy&&!i.progressionCommitPending&&i.progression&&!(![`A`,`B`,`VETERAN_ON`,`VETERAN_OFF`].includes(r)||_n(i.progression,n)||mn(i.progression.packMastery,n).stage<3||mn(i.progression.packMastery,n).selected===r)){e({progressionCommitPending:!0,progressionError:null});try{let e=await _r(vr(`pack-mastery`),i.progression.revision,n,r);e.revision>=(t().progression?.revision??0)&&y(e)}catch(n){let r=n instanceof G?n.state:null;r&&r.revision>=(t().progression?.revision??0)&&y(r),e({progressionError:n instanceof G&&n.code===`mastery_run_active`?`Finish this companion's committed attempt before changing mastery.`:`Mastery option could not be saved. Refresh and retry.`})}finally{e({progressionCommitPending:!1})}}},selectLockdownPlan:n=>{let r=t();r.screen===`brief`&&!r.busy&&!r.progressionCommitPending&&r.selectedMasteryChallenge&&r.progression?.fieldOps?.lockdownPlansAvailable&&!r.progression.fieldOps.activeMissionRun&&[`anchor`,`crosslink`].includes(n)&&e({selectedLockdownPlan:n})},selectDirectiveTier:n=>{let r=t();r.selectedMasteryChallenge||r.screen!==`brief`||r.busy||r.progressionCommitPending||W(r.selectedMissionId)?.activity!==`FIELD_OP`||!r.progression?.fieldOps?.commander?.unlockedDirectiveTiers?.includes(n)||e({selectedDirectiveTier:n})},selectApproach:n=>{let r=t();r.progression?.fieldOps?.activeMissionRun?.fieldContext?.progressionVersion!==2&&(r.selectedMasteryChallenge&&r.progression?.fieldOps?.activeMissionRun||r.screen!==`brief`||r.busy||W(r.selectedMissionId)?.activity!==`FIELD_OP`||r.progression?.fieldOps?.commander?.unlockedApproaches.includes(n)&&e({selectedApproach:n}))},chooseDoctrine:async()=>{let n=t(),r=n.progression?.tacticalChapter;if(!n.progressionCommitPending&&n.progression&&r?.status===`AVAILABLE`){e({progressionCommitPending:!0,progressionError:null});try{let e=await ir(vr(`chapter-choose`),n.progression.revision,`RECON`);y(e)}catch(t){let n=t instanceof G?t.state:null;n&&y(n),e({progressionError:`Doctrine selection not recorded. Refresh to verify before retrying.`})}finally{e({progressionCommitPending:!1})}}},openChapterBrief:n=>{let r=t(),i=r.progression?.tacticalChapter;if(!i||i.status!==`ACTIVE`||i.doctrine!==`RECON`||!r.foundationCompleted)return;let a=[`field-relay-recovery`,`field-relay-intercept`,`dead-relay-courier`][i.completedMissionIds.length];if(!a)return;let o=r.progression?.chapterActiveMission;if(i.activeRunId&&(!o||o.runId!==i.activeRunId||o.missionId!==a)){e({progressionError:`Saved chapter run could not be restored. Refresh Tactical Ops.`});return}let s=o?.squadIds||[`alpha`,`ally-02`,`ally-03`];e({screen:`brief`,briefEntry:n??null,chapterMode:!0,selectedMasteryChallenge:null,selectedMissionId:a,selectedSquadIds:s,selectedApproach:o?.fieldContext?.approach||`standard`,selectedDirectiveTier:o?.fieldContext?.directiveTier||`standard`,currentCampaignContext:null,chapterResult:null,campaignResult:null,fieldResult:null,fieldMilestone:null,progressionError:null})},saveChapterResult:async()=>{let n=t(),r=W(n.selectedMissionId);if(!n.chapterMode||n.screen!==`results`||n.progressionCommitPending||!r||!n.currentRunKey||!n.progression||!n.battle.results||n.chapterResult?.runId===n.currentRunKey)return;let i=n.battle.results,a=r.activity===`FIELD_OP`?Ye(n.battle):{victory:n.battle.outcome===`victory`,turns:i.turns,objectiveComplete:n.battle.outcome===`victory`,squadStanding:i.squadStanding,squadDeployed:i.squadDeployed,...n.battle.failureReason?{failureReason:n.battle.failureReason}:{}};if(!a)return;let o=n.continueRequestId||vr(`chapter-continue`);e({progressionCommitPending:!0,progressionError:null,continueRequestId:o});try{let i=await ur(o,n.progression.revision,n.currentRunKey,!1,r.activity===`FIELD_OP`?a:void 0,r.activity===`FIELD_OP`?void 0:a,n.activeRulesetVersion||void 0,!0);if(!i.chapterResult||i.chapterResult.runId!==n.currentRunKey)throw new G(`invalid_chapter_receipt`);if(t().currentRunKey!==n.currentRunKey)return;y(i.state),e({chapterResult:i.chapterResult,progressionCommitPending:!1})}catch(r){if(t().currentRunKey!==n.currentRunKey)return;let i=r instanceof G?r.state:null;i&&y(i),e({progressionCommitPending:!1,progressionError:`Chapter result not confirmed. Retry saving or refresh.`})}},saveTrialResult:async()=>{let n=t();if(n.selectedTrialLevel===null||n.screen!==`results`||n.progressionCommitPending||!n.currentRunKey||!n.progression||!n.battle.results||n.trialResult?.runId===n.currentRunKey)return;let r=n.battle.results,i={trialLevel:n.selectedTrialLevel,trialRevision:1,victory:n.battle.outcome===`victory`,objectiveComplete:n.battle.outcome===`victory`,turns:r.turns,squadStanding:r.squadStanding,squadDeployed:r.squadDeployed,...n.battle.failureReason===`DEADLINE`?{failureReason:`DEADLINE`}:{}},a=n.continueRequestId||vr(`trial-continue`);e({progressionCommitPending:!0,progressionError:null,continueRequestId:a});try{let r=await fr(a,n.progression.revision,n.currentRunKey,i);if(t().currentRunKey!==n.currentRunKey)return;y(r.state),e({trialResult:r.trialResult,progressionCommitPending:!1})}catch(r){if(t().currentRunKey!==n.currentRunKey)return;let i=r instanceof G?r.state:null;i&&y(i);let a=i?.signalTrials?.lastResult;a?.runId===n.currentRunKey?e({trialResult:a,progressionCommitPending:!1,progressionError:null}):e({progressionCommitPending:!1,progressionError:`Trial result not saved. Retry recording before leaving.`})}},saveFieldResult:async()=>{let n=t();if(n.chapterMode||n.screen!==`results`||n.progressionCommitPending||!n.currentRunKey||!n.progression||W(n.selectedMissionId)?.activity!==`FIELD_OP`||n.fieldResult?.runId===n.currentRunKey&&n.fieldResult.missionId===n.selectedMissionId)return;let r=or(n.currentRunKey),i=r?null:Ye(n.battle);if(!r&&!i)return;i&&n.currentFieldContext?.fieldContractsVersion&&(i.fieldContractsVersion=n.currentFieldContext.fieldContractsVersion),i&&n.currentFieldContext?.veteranChallenge&&(i.veteranChallenge=n.currentFieldContext.veteranChallenge),i&&n.currentFieldContext?.lockdownPlan&&(i.lockdownPlan=n.currentFieldContext.lockdownPlan),i&&n.currentFieldContext?.masteryChallenge&&(i.masteryChallenge=n.currentFieldContext.masteryChallenge);let a=n.continueRequestId||vr(`mission-continue`);e({progressionCommitPending:!0,progressionError:null,continueRequestId:a});try{let r=await ur(a,n.progression.revision,n.currentRunKey,!1,i??void 0,void 0,n.activeRulesetVersion||void 0);if(!r.fieldResult||r.fieldResult.runId!==n.currentRunKey||r.fieldResult.missionId!==n.selectedMissionId)throw new G(`invalid_progression_response`);if(t().currentRunKey!==n.currentRunKey)return;r.state.revision>=(t().progression?.revision??0)&&y(r.state),e({fieldResult:r.fieldResult,fieldMilestone:r.fieldMilestone,progressionCommitPending:!1})}catch(r){if(t().currentRunKey!==n.currentRunKey)return;let i=r instanceof G?r.state:null;i&&y(i);let a=i?.fieldOps?.lastResult;a?.runId===n.currentRunKey&&a.missionId===n.selectedMissionId?e({fieldResult:a,fieldMilestone:null,progressionError:null,progressionCommitPending:!1}):e({progressionCommitPending:!1,progressionError:`Result could not be recorded. Retry saving before returning or replaying.`})}},saveCampaignResult:async()=>{let n=t(),r=W(n.selectedMissionId);if(n.chapterMode||r?.operationId!==xt.operationId||n.screen!==`results`||n.progressionCommitPending||!n.currentRunKey||!n.progression||!n.battle.results||n.battle.outcome===`ongoing`||n.campaignResult?.runId===n.currentRunKey&&n.campaignResult.missionId===r.missionId)return;let i=n.battle.results,a={victory:n.battle.outcome===`victory`,turns:i.turns,objectiveComplete:n.battle.outcome===`victory`,squadStanding:i.squadStanding,squadDeployed:i.squadDeployed,...n.battle.failureReason?{failureReason:n.battle.failureReason}:{}},o=n.continueRequestId||vr(`mission-continue`);e({progressionCommitPending:!0,progressionError:null,continueRequestId:o});try{let i=await ur(o,n.progression.revision,n.currentRunKey,!1,void 0,a,n.activeRulesetVersion||void 0);if(!i.campaignResult||i.campaignResult.runId!==n.currentRunKey||i.campaignResult.missionId!==r.missionId)throw new G(`invalid_progression_response`);if(t().currentRunKey!==n.currentRunKey)return;y(i.state),e({campaignResult:i.campaignResult,progressionCommitPending:!1})}catch(r){if(t().currentRunKey!==n.currentRunKey)return;let i=r instanceof G?r.state:null;if(i&&(y(i),i.operations?.[xt.operationId]?.lastCompletedMissionRunId===n.currentRunKey)){e({progressionCommitPending:!1,progressionError:`Campaign save detected, but its receipt could not be verified. Refresh Tactical Ops to load the canonical state.`});return}e({progressionCommitPending:!1,progressionError:`Campaign record not saved. Retry before exiting or deploying again.`})}},openTrialBrief:n=>{let r=t(),i=r.progression?.signalTrials;if(!(!r.foundationCompleted||!i?.enabled||!Number.isInteger(n)||n<1||n>6||n>i.highestCleared+1&&i.activeRun?.level!==n)){if(i.activeRun&&i.activeRun.level!==n){e({progressionError:`Finish the accepted Trial first.`});return}if(!i.activeRun&&(r.progression?.fieldOps?.activeMissionRun||r.progression?.chapterActiveMission||Object.values(r.progression?.operations||{}).some(e=>e.activeMissionRun))){e({progressionError:`Finish the accepted operation before starting a Trial.`});return}e({screen:`brief`,selectedTrialLevel:n,selectedMissionId:`field-relay-hold`,selectedSquadIds:[...i.activeRun?.squadIds||[`alpha`,`ally-02`,`ally-03`]],selectedApproach:`standard`,selectedMasteryChallenge:null,selectedVeteranChallenge:!1,chapterMode:!1,fieldResult:null,fieldMilestone:null,trialResult:null,progressionError:null,briefEntry:null})}},openBrief:()=>{let n=t();n.foundationCompleted||n.progressionStatus===`error`||(Y(`ui`),e({screen:`brief`,identity:Ma(ka())}))},openVeteranBrief:n=>{let r=t();!r.progression?.fieldOps?.veteranProgressionAvailable||(r.progression.fieldOps.commander?.rank||0)<4||r.progression.fieldOps.activeMissionRun||(e({selectedVeteranChallenge:!0}),t().openOperationBrief(`field-relay-recovery`,void 0,n),e({selectedVeteranChallenge:!0,selectedMasteryChallenge:null,screen:`brief`,selectedMissionId:`field-relay-recovery`,selectedDirectiveTier:`advanced`,selectedSquadIds:[`alpha`,`ally-02`,`ally-03`]}))},openOperationBrief:(n,r,i)=>{let a=t();if(a.progression?.signalTrials?.activeRun){e({progressionError:`Finish the accepted Signal Trial first.`});return}let o=W(n);if(r&&(n!==`field-relay-hold`||a.progression?.fieldOps?.masteryPath?.unlockedChallenge!==r))return;let s=a.progression?.fieldOps?.firstUpgradeSupplyMissionId===n;if(o?.activity===`FIELD_OP`&&!r&&!s&&!a.progression?.fieldOps?.board?.activeMissionIds.includes(n)&&!(a.selectedVeteranChallenge&&n===`field-relay-recovery`&&(a.progression?.fieldOps?.commander?.rank||0)>=4)&&a.progression?.fieldOps?.activeMissionRun?.missionId!==n){e({screen:`war-table`,progressionError:`That Field Op is no longer active. Choose one of the current three missions.`,selectedMissionId:null});return}let c=o?.activity===`FIELD_OP`?`available`:a.progression?.operations?.[o?.operationId||`broken-signal`]?.missions[n];if(!a.foundationCompleted||!o||!c||c===`locked`)return;Y(`ui`);let l=o.activity===`FIELD_OP`?a.progression?.fieldOps?.activeMissionRun:a.progression?.operations?.[o.operationId]?.activeMissionRun;if(r&&l&&l.fieldContext?.masteryChallenge!==r){e({progressionError:`Finish your accepted Field Op before starting Relay Lockdown.`});return}e({selectedVeteranChallenge:l?.fieldContext?.veteranChallenge===`pack-extraction-v1`,selectedLockdownPlan:l?.fieldContext?.lockdownPlan||`anchor`,selectedMasteryChallenge:l?.missionId===n?l.fieldContext?.masteryChallenge||null:r||null});let u=l?.missionId===n?l.squadIds:a.progression?.fieldOps?.records[n]?.squadIds,d=or(l?.runId)?l?.combatProfileV2?.pet:a.progression?.equippedPet,f=u&&yt(u,d)?[...u]:[`alpha`,`ally-02`,`ally-03`];e({screen:`brief`,briefEntry:i??null,selectedTrialLevel:null,trialResult:null,chapterMode:!1,currentChapterIntel:null,selectedMissionId:n,campaignResult:null,currentCampaignContext:l?.campaignContext||null,selectedDirectiveTier:l?.missionId===n?l.fieldContext?.directiveTier||`standard`:r?`advanced`:`standard`,selectedApproach:l?.missionId===n&&l.fieldContext?.approach||`standard`,fieldResult:null,fieldMilestone:null,missionFirstClear:null,selectedSquadIds:o.squadCap===3?f:[],progressionError:null,identity:Ma(ka())})},backToHub:()=>{let n=t();if(!n.progressionCommitPending){if(n.screen===`results`&&n.selectedTrialLevel!=null&&!n.trialResult){n.saveTrialResult();return}if(n.screen===`results`&&n.chapterMode&&!n.chapterResult){n.saveChapterResult();return}if(!n.chapterMode&&n.screen===`results`&&W(n.selectedMissionId)?.activity===`FIELD_OP`&&!n.fieldResult){n.saveFieldResult();return}if(!n.chapterMode&&n.screen===`results`&&W(n.selectedMissionId)?.operationId===xt.operationId&&!n.campaignResult){n.saveCampaignResult();return}X++,Y(`ui`),e({screen:t().foundationCompleted&&t().progression?.operations?.[`broken-signal`]?`war-table`:`hub`,battle:xs(),briefEntry:null,activeRulesetVersion:null,chapterMode:!1,currentChapterIntel:null,chapterResult:null,selectedTrialLevel:null,trialResult:null,banner:null,ticker:null,busy:!1,floats:[],queue:[],identity:Ma(ka()),selectedMissionId:null,missionFirstClear:null,selectedSquadIds:[]})}},deploy:()=>{if(t().busy||t().progressionCommitPending||t().kodaSavePending||t().shadowSavePending||t().fieldRendSavePending)return;let n=++X,r=t();if(r.selectedTrialLevel!=null&&r.progression&&r.progressionStatus===`ready`){let t=r.selectedTrialLevel,i=r.progression.signalTrials;if(!i?.enabled||i.activeRun&&i.activeRun.level!==t)return;e({busy:!0,ticker:`Preparing Signal Trial…`,progressionError:null}),(async()=>{try{let e=await dr(vr(`trial-start`),r.progression.revision,t,r.selectedSquadIds);if(n!==X)return;y(e.state);let i=is(t,1),a=e.run.combatProfileV2?.pet,o=jt(i,e.run.squadIds,a?{id:a.id,name:a.name,img:a.img}:e.state.equippedPet,`standard`);if(!o)throw new G(`invalid_trial_squad`);let s=o;x(n,e.run.runId,Pn(Br(ne(s,e.run.fieldRend),{...e.state,packMastery:e.run.packMastery}),e.run.combatProfileV3,e.run.combatProfileV2),void 0,!1,!1,null,i,void 0,null,e.run.playerGrowth,e.run.rulesContract)}catch(t){if(n!==X)return;let r=t instanceof G?t.state:null;r&&y(r),e({busy:!1,ticker:null,progressionError:t instanceof G?t.code:`trial_start_failed`})}})();return}if(r.onboardingEnabled&&r.progression){if(r.progressionStatus!==`ready`)return;if(r.foundationCompleted){let t=W(r.selectedMissionId);if(!t||!t.executable)return;if(t.activity===`FIELD_OP`&&!r.progression.fieldOps?.board){e({progressionError:`Refresh the War Table before deploying.`});return}let i=t.activity===`FIELD_OP`||t.operationId===xt.operationId||t.objectiveType===`RECOVER`||t.objectiveType===`BOSS`?r.selectedSquadIds:void 0,a=r.progression.fieldOps?.activeMissionRun,o=t.missionId===`field-relay-recovery`&&or(a?.runId)?a?.combatProfileV2?.pet:r.progression.equippedPet;if(!jt(t,i||[],o,r.selectedApproach)){e({progressionError:t.objectiveType===`BOSS`?`Choose exactly two companions for ALPHA.`:`Choose CNC, SHADOW or your equipped PET to accompany ALPHA.`});return}e({busy:!0,ticker:`Preparing operation run…`,progressionError:null}),(async()=>{try{let a=t.activity===`FIELD_OP`?r.progression.fieldOps?.activeMissionRun:r.progression.operations?.[t.operationId]?.activeMissionRun,o=r.chapterMode?Me:a?a.rulesContract?.rulesetVersion:r.progression.vnextStartAvailable?Me:void 0,s=await ar(vr(r.chapterMode?`chapter-start`:`mission-start`),r.progression.revision,t.missionId,i,t.activity===`FIELD_OP`?{...!r.chapterMode&&!r.selectedMasteryChallenge&&!r.selectedVeteranChallenge&&(a?.fieldContext?.fieldContractsVersion===1||!a&&o&&r.progression.fieldOps?.fieldContracts?.enabled)?{fieldContractsVersion:1}:{},cycleId:r.progression.fieldOps.board.cycleId,approach:r.selectedApproach,...r.selectedVeteranChallenge?{reportVersion:6,directiveTier:`advanced`,veteranChallenge:`pack-extraction-v1`}:r.selectedMasteryChallenge?{reportVersion:r.progression.fieldOps?.activeMissionRun?.fieldContext?.reportVersion||(r.progression.fieldOps?.lockdownPlansAvailable?5:4),directiveTier:`advanced`,masteryChallenge:r.selectedMasteryChallenge,...r.progression.fieldOps?.activeMissionRun?.fieldContext?.lockdownPlan?{lockdownPlan:r.progression.fieldOps.activeMissionRun.fieldContext.lockdownPlan}:!r.progression.fieldOps?.activeMissionRun&&r.progression.fieldOps?.lockdownPlansAvailable?{lockdownPlan:r.selectedLockdownPlan}:{}}:r.progression.fieldOps.board.reportVersion===3?{reportVersion:3,directiveTier:r.selectedDirectiveTier}:{}}:void 0,o,r.chapterMode,!r.chapterMode&&t.operationId===xt.operationId&&r.progression.tacticalChapter?.status===`COMPLETED`&&!r.progression.tacticalChapter.intelConsumedByRunId&&o===`tactical-intent-vnext.0`?1:void 0,r.progression.fieldOps?.veteranProgressionAvailable?2:void 0,t.missionId===`field-relay-intercept`&&o===`tactical-intent-vnext.0`&&(r.progression.fieldOps?.interceptRevisionAvailable===2||(r.chapterMode?r.progression.chapterActiveMission?.rulesContract?.missionRevision:a?.rulesContract?.missionRevision)===2)?2:Et(t.missionId,o,r.progression.deadRelayHoldRevisionAvailable,a)??(r.chapterMode?void 0:Ot(t.missionId,o,r.progression.fieldOps?.board,a)));if(n!==X)return;y(s.state);let c=At(t,s.run.fieldContext,s.run.rulesContract?.missionRevision,s.run.campaignContext);if(t.missionId===`field-relay-intercept`&&s.run.started){e({busy:!1,screen:`brief`,ticker:null});return}let l=s.run.combatProfileV2?.pet,u=l?{id:l.id,name:l.name,img:l.img}:s.state.equippedPet,d=jt(c,s.run.squadIds,u,s.run.fieldContext?.approach);if(!d)throw new G(`invalid_progression_response`);let f=or(s.run.runId)?await cr(s.run.runId):void 0;if(n!==X)return;x(n,s.run.runId,Pn(Br(ne(d,s.run.fieldContext?.fieldRend),{...s.state,packMastery:s.run.packMastery||{}}),s.run.combatProfileV3||null,s.run.combatProfileV2),c.objectiveType===`RECOVER`?c.terminal:void 0,t.objectiveType===`BOSS`,r.progression.intel?.routingTrace===!0,t.missionId===`broken-signal-breach`?`h1`:null,c,s.run.fieldContext,s.run.campaignContext,s.run.playerGrowth||null,s.run.rulesContract,s.run.chapterIntel,f)}catch(t){if(n!==X)return;let r=t instanceof G?t.code:`progression_request_failed`,i=t instanceof G?t.state:null;i&&y(i),e({screen:`war-table`,busy:!1,ticker:null,progressionError:r,selectedMissionId:null})}})();return}e({busy:!0,ticker:`Preparing Foundation run…`,progressionError:null}),(async()=>{try{let t=await nr(vr(`start`),r.progression.revision,r.progression.activeRunId?r.progression.foundationRunRules?.rulesContract.rulesetVersion:r.progression.vnextStartAvailable?Me:void 0);if(n!==X)return;if(y(t),t.completed||!t.activeRunId){e({screen:`war-table`,battle:xs(),busy:!1,ticker:null});return}let i=Fn(Ko(!0,Cs(t)),t);x(n,t.activeRunId,i,void 0,!1,!1,null,void 0,void 0,null,null,t.foundationRunRules?.rulesContract||null)}catch(t){if(n!==X)return;let r=t instanceof G?t.code:`progression_request_failed`,i=t instanceof G?t.state:null;i&&y(i),e({screen:`brief`,busy:!1,ticker:null,progressionError:r})}})();return}let i=Ma(ka()),{onboardingEnabled:a,onboardingStageId:o}=t(),s=Wa(i,Ko(a,o));Y(`turn`),e({screen:`battle`,identity:i,battle:s.state,queue:bs(s.state),busy:!0,banner:null,ticker:null,floats:[],attackingId:null,impactId:null,enemyScene:null,displayHp:{},consequences:[],currentRunKey:`${o}:${n}`}),(async()=>{if(await u(s.events,n),n!==X)return;let r=Ss(t().battle);if(r?.team===`enemy`){await _(n);return}e({busy:!1,ticker:r?`${r.name}  ·  move or act`:null})})()},inspectUnit:n=>{let{battle:r,busy:i,screen:a}=t();if(i||a!==`battle`)return;let o=r.units.find(e=>e.id===n);if(o&&!o.defeated){if(r.mode===`targeting`&&r.actionSkillId){t().selectTarget(n);return}Y(`select`),e({battle:{...r,inspectId:r.inspectId===n?null:n}})}},selectCell:(i,a)=>{let{battle:o,busy:s,screen:c}=t();if(s||c!==`battle`)return;let l=o.units.find(e=>!e.defeated&&e.c===i&&e.r===a);if(l){t().inspectUnit(l.id);return}if(o.mode===`targeting`){e({battle:{...o,mode:`selected`,actionSkillId:null}});return}let u=Ss(o);if(!u||u.team!==`ally`||u.hasMoved||u.hasActed)return;if(or(t().currentRunKey)){h({type:`move`,c:i,r:a});return}let d=qa(o,i,a);if(!d.ok)return;Y(`move`),e({battle:d.state,queue:bs(d.state),ticker:`${u.name}  ·  repositions`});let f=d.state.units.find(e=>e.id===u.id);f&&(n(ho(u,f,vs++),X),r(wo(u,f,vs++),X))},selectSkill:i=>{let{battle:s,busy:c}=t();if(c)return;let l=Ss(s);if(!l||l.team!==`ally`||l.hasActed||l.defeated||!l.skillIds.includes(i))return;let d=Ut(dn(i),l.growth);if((l.cooldowns[i]??0)>0)return;if(s.mode===`targeting`&&s.actionSkillId===i){e({battle:{...s,mode:`selected`,actionSkillId:null}});return}if(Y(`select`),!Oi(d)){if(or(t().currentRunKey)){h({type:`skill`,skillId:i});return}let c=++X;e({busy:!0,attackingId:l.id,lastActionSkillId:i});let d=Ya(s,i);if(!d.ok){e({busy:!1,attackingId:null,ticker:`${l.name}  ·  no target in range`});return}let f=Mo(t().s3CombatProof,l,i,void 0,d.events,!1,s);o(s,d.events),e({battle:d.state,queue:bs(d.state),s3CombatProof:f});let p=Co(l,i,d.events,vs++,!1);r(p,c),(async()=>{await a(p,c)&&(n(mo(l,i,d.events,vs++,!1),c),await u(d.events,c),e({attackingId:null}),await v(c))})();return}let f=K(s.units,l,d);e({battle:{...s,mode:`targeting`,actionSkillId:i,inspectId:null},ticker:f.length===0?d.maxRange<=1?`${l.name}  ·  melee — move adjacent`:`${l.name}  ·  no target in range`:d.desc})},selectTarget:i=>{let{battle:s,busy:l}=t();if(l||s.mode!==`targeting`||!s.actionSkillId)return;let d=Ss(s);if(!d||d.hasActed)return;if(or(t().currentRunKey)){h({type:`skill`,skillId:s.actionSkillId,targetId:i});return}let p=++X,m=s.actionSkillId;e({busy:!0,attackingId:d.id,lastActionSkillId:m});let g=Ya(s,m,i);if(!g.ok){e({busy:!1,attackingId:null});return}let _=Pe?ms(f,s,g.state,d.id,i,m,g.events):{cycle:f,interrupted:!1};_.interrupted&&(f=_.cycle,g.events.push({type:`info`,buildEvidence:`${d.name} PRESSURE canceled ${i}'s locked enemy intent.`}));let y=Mo(t().s3CombatProof,d,m,i,g.events,_.interrupted,s);o(s,g.events),e({s3CombatProof:y,battle:g.state,queue:bs(g.state),..._.interrupted?{threats:f.pending.map(e=>e.plan)}:{}});let b=Co(d,m,g.events,vs++,_.interrupted);r(b,p),(async()=>{await a(b,p)&&(n(mo(d,m,g.events,vs++,_.interrupted),p),await u(g.events,p),_.interrupted&&(c(Eo(_.interrupted,i,g.events),p),e({ticker:`SIGNAL INTERRUPTED · ENEMY INTENT CANCELED`}),Y(`status`)),e({attackingId:null}),await v(p))})()},selectRecover:()=>{let{battle:n,busy:i}=t();if(i)return;let a=Ss(n);if(!a||a.team!==`ally`||a.hasActed||a.defeated)return;if(or(t().currentRunKey)){h({type:`recover`});return}let o=Ka(n);if(!o.ok){e({ticker:`${a.name}  ·  move adjacent to the relay terminal`});return}let s=++X;if(a.defId.startsWith(`pet:`)&&n.objective?.type===`RECOVER`){let e=Math.max(Math.abs(a.c-n.objective.terminal.c),Math.abs(a.r-n.objective.terminal.r));o.events.push({type:`info`,buildEvidence:`PET recovered the relay from ${e} cells (accepted reach ${a.recoverRange||1}).`})}e({busy:!0,battle:o.state,queue:bs(o.state),ticker:`SIGNAL RECOVERED`}),n.objective?.type===`RECOVER`&&r([So(`objective_recover`,vs++,void 0,n.objective.terminal)],s),(async()=>{await u(o.events,s),await v(s)})()},selectKodaSidegrade:e=>b(`koda`,e),selectShadowSidegrade:e=>b(`shadow`,e),selectFieldRend:async n=>{let r=t(),i=r.progression?.fieldOps;if(!(r.screen!==`brief`||!r.progression||r.busy||r.fieldRendSavePending||r.kodaSavePending||r.shadowSavePending||i?.activeMissionRun||!i?.fieldContracts?.enabled||!i.fieldContracts.sidegrade||i.fieldContracts.selection===n)){e({fieldRendSavePending:!0,progressionError:null});try{let e=await pr(vr(`field-rend`),r.progression.revision,n);e.revision>=(t().progression?.revision??0)&&y(e)}catch(n){let r=n instanceof G?n.state:null;r&&r.revision>=(t().progression?.revision??0)&&y(r),e({progressionError:`Loadout could not be saved. Try again.`})}finally{e({fieldRendSavePending:!1})}}},toggleCommanderTeammate:n=>{let r=t();if(r.progression?.fieldOps?.activeMissionRun?.fieldContext?.progressionVersion===2||r.selectedMasteryChallenge&&r.progression?.fieldOps?.activeMissionRun?.fieldContext?.lockdownPlan||r.screen!==`brief`||r.busy||r.kodaSavePending||r.shadowSavePending||r.selectedMissionId!==`broken-signal-commander`&&W(r.selectedMissionId)?.activity!==`FIELD_OP`&&W(r.selectedMissionId)?.operationId!==xt.operationId||!vt([`alpha`,n],r.progression?.equippedPet))return;let i=r.selectedSquadIds.slice(1);e({selectedSquadIds:[`alpha`,...i.includes(n)?i.filter(e=>e!==n):i.length<2?[...i,n]:i],progressionError:null})},selectRecoverTeammate:n=>{let r=t();r.screen!==`brief`||r.busy||r.kodaSavePending||r.shadowSavePending||r.selectedMissionId!==`broken-signal-recover`||vt([`alpha`,n],r.progression?.equippedPet)&&e({selectedSquadIds:[`alpha`,n],progressionError:null})},skipTurn:()=>{let{battle:n,busy:r}=t();if(r)return;let i=Ss(n);if(!i||i.team!==`ally`||i.hasActed)return;if(or(t().currentRunKey)){h({type:`skip`});return}let a=++X,o=Ja(n);o.ok&&(e({battle:o.state,busy:!0,ticker:o.events[0]?.text??null}),v(a))},cancel:()=>{let{battle:n,busy:r}=t();if(!r){if(n.mode===`targeting`){e({battle:{...n,mode:`selected`,actionSkillId:null}});return}e({battle:{...n,inspectId:null}})}},replay:()=>{let e=t();if(!e.progressionCommitPending){if(e.selectedTrialLevel!=null){if(e.screen===`results`&&!e.trialResult){e.saveTrialResult();return}let n=e.selectedTrialLevel;t().backToHub(),t().openTrialBrief(n);return}if(e.chapterMode){if(e.screen===`results`&&!e.chapterResult){e.saveChapterResult();return}t().backToHub(),t().openChapterBrief();return}if(W(e.selectedMissionId)?.operationId===xt.operationId&&e.screen===`results`){if(!e.campaignResult||e.campaignResult.runId!==e.currentRunKey||e.campaignResult.missionId!==e.selectedMissionId){e.saveCampaignResult();return}e.continueOnboarding(!0);return}if(W(e.selectedMissionId)?.activity===`FIELD_OP`){e.screen===`results`?e.continueOnboarding(!0):e.selectedMissionId&&(X++,e.openOperationBrief(e.selectedMissionId));return}e.deploy()}},continueOnboarding:(n=!1)=>{let r=t();if(r.screen!==`results`)return;if(r.selectedTrialLevel!=null){if(!r.trialResult){t().saveTrialResult();return}let e=r.trialResult.victory?Math.min(6,r.selectedTrialLevel+1):r.selectedTrialLevel;t().backToHub(),(n||r.trialResult.victory)&&t().openTrialBrief(e);return}if(r.chapterMode){if(!r.chapterResult){r.saveChapterResult();return}t().backToHub();return}if(W(r.selectedMissionId)?.activity===`FIELD_OP`){if(!r.fieldResult||r.fieldResult.runId!==r.currentRunKey||r.fieldResult.missionId!==r.selectedMissionId){t().saveFieldResult();return}if(r.progressionCommitPending)return;t().backToHub(),n&&r.selectedMissionId&&(t().openOperationBrief(r.selectedMissionId,r.selectedMasteryChallenge||void 0),t().selectDirectiveTier(r.selectedDirectiveTier),t().selectApproach(r.selectedApproach));return}if(W(r.selectedMissionId)?.operationId===xt.operationId){if(r.progressionCommitPending)return;if(!r.campaignResult||r.campaignResult.runId!==r.currentRunKey||r.campaignResult.missionId!==r.selectedMissionId){r.saveCampaignResult();return}let e=r.selectedMissionId;t().backToHub(),n&&e&&t().openOperationBrief(e);return}if(r.battle.outcome!==`victory`)return;if(r.foundationCompleted&&r.selectedMissionId){if(r.progressionCommitPending||!r.currentRunKey||!r.progression)return;let i=r.continueRequestId||vr(`mission-continue`);e({progressionCommitPending:!0,progressionError:null,continueRequestId:i}),(async()=>{try{let a=await ur(i,r.progression.revision,r.currentRunKey,r.selectedMissionId===`broken-signal-breach`&&r.battle.routingTraceAcquired,void 0,void 0,r.activeRulesetVersion||void 0);y(a.state),X++,Y(`ui`),e({screen:`war-table`,battle:xs(),banner:null,ticker:null,busy:!1,floats:[],queue:[],currentRunKey:null,continueRequestId:null,missionFirstClear:W(r.selectedMissionId)?.activity===`FIELD_OP`?null:a.firstClear,selectedMissionId:null,selectedSquadIds:[]}),n===!0&&r.selectedMissionId&&t().openOperationBrief(r.selectedMissionId)}catch(t){let n=t instanceof G?t.code:`progression_request_failed`,r=t instanceof G?t.state:null;r&&y(r),e({progressionCommitPending:!1,progressionError:n})}})();return}if(!r.onboardingEnabled){t().backToHub();return}if(r.progression){if(r.progressionCommitPending||!r.currentRunKey)return;let t=r.continueRequestId||vr(`continue`);e({progressionCommitPending:!0,progressionError:null,continueRequestId:t}),(async()=>{try{let n=await rr(t,r.progression.revision,r.currentRunKey,r.progression.foundationRunRules?.rulesContract.rulesetVersion);if(y(n),X++,Y(`ui`),n.completed){e({screen:`war-table`,battle:xs(),banner:null,ticker:null,busy:!1,floats:[],queue:[],currentRunKey:null,continueRequestId:null});return}e({screen:`brief`,battle:xs(),banner:null,ticker:null,busy:!1,floats:[],queue:[],currentRunKey:null,continueRequestId:null,identity:Ma(ka())})}catch(t){let n=t instanceof G?t.code:`progression_request_failed`,i=t instanceof G?t.state:null;i&&(y(i),i.completed?e({screen:`war-table`,battle:xs(),currentRunKey:null,continueRequestId:null}):i.foundationStage!==r.onboardingStageId&&e({screen:`brief`,battle:xs(),currentRunKey:null,continueRequestId:null})),e({progressionCommitPending:!1,progressionError:n})}})();return}let i=Go(r.onboardingStageId),a=r.currentRunKey;if(a&&r.lastVictoryKey!==a){let n={...r.onboardingCompleted,[i.id]:!0},o=i.next;if(e({onboardingCompleted:n,lastVictoryKey:a,onboardingStageId:o??i.id}),!o){t().backToHub();return}}else if(!i.next){t().backToHub();return}X++,Y(`ui`),e({screen:`brief`,battle:xs(),banner:null,ticker:null,busy:!1,floats:[],queue:[],identity:Ma(ka())})},dismissSector:()=>{Y(`ui`),e({screen:`results`}),t().selectedTrialLevel==null?t().chapterMode?t().saveChapterResult():W(t().selectedMissionId)?.activity===`FIELD_OP`&&t().saveFieldResult():t().saveTrialResult(),!t().chapterMode&&W(t().selectedMissionId)?.operationId===xt.operationId&&t().saveCampaignResult()},toggleMute:()=>{let n=!t().muted;ao(n),e({muted:n})}}});function ws(){let e=Z.getState(),t=e.battle,n=Ss(t),r=e.identity;return{version:hs,screen:e.screen,turn:t.round,phase:n?.team===`enemy`?`enemy`:`player`,mode:t.mode,selectedId:t.activeId,busy:e.busy,units:t.units.map(e=>({id:e.id,name:e.name,side:e.team,hp:e.hp,maxHp:e.maxHp,atk:e.atk,def:e.def,spd:e.spd,move:e.move,c:e.c,r:e.r,hasMoved:e.hasMoved,hasActed:e.hasActed,guarding:e.statuses.some(e=>e.type===`GUARD`),defeated:e.defeated,strikeRange:Qa(e),statuses:e.statuses,cooldowns:e.cooldowns})),results:t.results,activeId:t.activeId,queue:e.queue,identity:{source:r.source,live:r.live,unitName:r.unitName,skinKey:r.skinKey,skinName:r.skinName,weapon:r.weaponLabel,armor:r.armorLabel,summary:r.summary}}}function Ts(){let{battle:e,busy:t}=Z.getState();if(t||e.mode===`targeting`)return[];let n=Ss(e);return!n||n.team!==`ally`||n.hasMoved||n.hasActed||n.defeated?[]:vi(n,e.units)}typeof window<`u`&&(window.__tactical=Z);var Es=s((e=>{var t=Symbol.for(`react.transitional.element`),n=Symbol.for(`react.fragment`);function r(e,n,r){var i=null;if(r!==void 0&&(i=``+r),n.key!==void 0&&(i=``+n.key),`key`in n)for(var a in r={},n)a!==`key`&&(r[a]=n[a]);else r=n;return n=r.ref,{$$typeof:t,type:e,key:i,ref:n===void 0?null:n,props:r}}e.Fragment=n,e.jsx=r,e.jsxs=r})),Q=s(((e,t)=>{t.exports=Es()}))();function Ds(e){e.currentTarget.onerror=null,e.currentTarget.src=D}function Os({className:e=``,fallbackUrl:t,identity:n}){let r=Z(e=>e.identity),i=n||r,a=i.cosmetic,o=!!a?.confirmed,s=o?a.skinUrl:t||i.portraitUrl||D,c=o?a.frameUrl:``,[l,u]=(0,y.useState)({}),d=e=>e&&!l[e]?e:``,f=e=>()=>u(t=>({...t,[e]:!0})),p=d(s)||D,m=o?a.fit:{scale:1,offsetX:0,offsetY:0},h={"--t-skin-scale":m.scale,"--t-skin-x":m.offsetX+`px`,"--t-skin-y":m.offsetY+`px`};return(0,Q.jsxs)(`span`,{className:`t-cosmetic-portrait ${e}`,style:h,"data-frame-key":c?a.frameKey:void 0,"data-cosmetic-confirmed":o?`yes`:`no`,"aria-hidden":`true`,children:[(0,Q.jsx)(`span`,{className:`t-cosmetic-viewport`,children:(0,Q.jsx)(`img`,{className:`t-cosmetic-skin`,src:p,alt:``,draggable:!1,onError:p===D?e=>{e.currentTarget.hidden=!0}:f(p)},p)}),d(c)?(0,Q.jsx)(`img`,{className:`t-cosmetic-frame`,src:c,alt:``,onError:f(c),draggable:!1}):null,c&&d(a.glowUrl)?(0,Q.jsx)(`img`,{className:`t-cosmetic-frame t-cosmetic-glow`,src:a.glowUrl,alt:``,onError:f(a.glowUrl),draggable:!1}):null,c&&d(a.sweepUrl)?(0,Q.jsx)(`img`,{className:`t-cosmetic-frame t-cosmetic-sweep`,src:a.sweepUrl,alt:``,onError:f(a.sweepUrl),draggable:!1}):null]})}function ks(){let e=Z(e=>e.identity),t=Z(e=>e.progression?.fieldOps?.fieldContracts?.honor);return(0,Q.jsxs)(`div`,{className:`t-id-card`,"aria-label":`Player identity`,children:[(0,Q.jsx)(Os,{}),(0,Q.jsxs)(`div`,{className:`t-id-copy`,children:[(0,Q.jsx)(`strong`,{children:e.unitName}),(0,Q.jsx)(`small`,{children:e.summary}),t?(0,Q.jsxs)(`small`,{className:`t-field-contract-honor`,children:[`Field Honor · `,j]}):null]})]})}var As={action_alpha_strike:`/images/tactical_ops/actions/action_alpha_strike.png`,action_alpha_rend:`/images/tactical_ops/actions/action_alpha_rend.png`,action_alpha_howl:`/images/tactical_ops/actions/action_alpha_howl.png`,action_cnc_thrust:`/images/tactical_ops/actions/action_cnc_thrust.png`,action_cnc_lunge:`/images/tactical_ops/actions/action_cnc_lunge.png`,action_cnc_pressure:`/images/tactical_ops/actions/action_cnc_pressure.png`,action_shadow_sweep:`/images/tactical_ops/actions/action_shadow_sweep.png`,action_shadow_mend:`/images/tactical_ops/actions/action_shadow_mend.png`,action_shadow_pack_support:`/images/tactical_ops/actions/action_shadow_pack_support.png`,action_pet_bite:`/images/tactical_ops/actions/action_pet_bite.png`,action_pet_hamstring:`/images/tactical_ops/actions/action_pet_hamstring.png`,action_system_move:`/images/tactical_ops/actions/action_system_move.png`,action_system_recover:`/images/tactical_ops/actions/action_system_recover.png`,action_system_skip:`/images/tactical_ops/actions/action_system_skip.png`},js={"alpha-strike":`action_alpha_strike`,"alpha-reach-rend":`action_alpha_rend`,"alpha-rend":`action_alpha_rend`,"alpha-howl":`action_alpha_howl`,"u02-shot":`action_cnc_thrust`,"u02-burst":`action_cnc_lunge`,"u02-lunge-vanguard":`action_cnc_lunge`,"u02-suppress":`action_cnc_pressure`,"u02-pressure-disruptor":`action_cnc_pressure`,"u03-tap":`action_shadow_sweep`,"u03-mend":`action_shadow_mend`,"u03-mend-restorer":`action_shadow_mend`,"u03-pack":`action_shadow_pack_support`,"u03-pack-warden":`action_shadow_pack_support`,"pet-bite":`action_pet_bite`,"pet-hamstring":`action_pet_hamstring`};function Ms(e){let t=js[e.split(`:mastery:`)[0]];return t?As[t]:null}function Ns(e){return e===`move`?As.action_system_move:e===`recover`?As.action_system_recover:As.action_system_skip}function Ps({milestone:e}){if(!e||e.status===`UNAVAILABLE`)return null;if(e.kind===`FIRST_RECOVERY_SUPPLY`)return e.status===`AWARDED`?(0,Q.jsxs)(`section`,{className:`t-fr-consequence t-fr-legacy`,"data-legacy":`first-awarded`,"aria-label":`Confirmed First Recovery Supply`,children:[(0,Q.jsx)(`span`,{className:`t-kicker`,children:`FIELD LEGACY · FIRST RECOVERY`}),(0,Q.jsx)(`strong`,{children:`+12 SCRAP EARNED`}),(0,Q.jsx)(`p`,{children:`First Recovery Supply saved. Open Forge to use your new materials.`})]}):(0,Q.jsxs)(`section`,{className:`t-fr-consequence t-fr-legacy t-fr-legacy-history`,"data-legacy":`first-previously-awarded`,"aria-label":`First Recovery Supply previously awarded`,children:[(0,Q.jsx)(`span`,{className:`t-kicker`,children:`FIELD LEGACY`}),(0,Q.jsx)(`strong`,{children:`First Recovery Supply already claimed`}),(0,Q.jsx)(`p`,{children:`Your one-time Scrap was awarded earlier. No extra Scrap this battle.`})]});let{record:t,status:n}=e;return(0,Q.jsxs)(`section`,{className:`t-fr-consequence t-fr-legacy`,"data-legacy":n===`AWARDED`?`veteran-awarded`:n===`IMPROVED`?`veteran-improved`:`veteran-record`,"aria-label":`Confirmed Veteran Service Distinction`,children:[(0,Q.jsx)(`span`,{className:`t-kicker`,children:`FIELD LEGACY · VETERAN SERVICE`}),(0,Q.jsx)(`strong`,{children:n===`AWARDED`?`WEEKLY DISTINCTION EARNED`:n===`IMPROVED`?`PERSONAL BEST IMPROVED`:`WEEKLY DISTINCTION RECORDED`}),(0,Q.jsxs)(`p`,{children:[t.utcWeek,` · `,t.squadStanding,`/3 standing · `,t.bestRounds,` rounds`]}),(0,Q.jsx)(`small`,{children:n===`ALREADY_AWARDED`?`Existing weekly best preserved. No new award.`:`Server-confirmed service record. No EXP or currency awarded.`})]})}function Fs(){let e=C().forge,[t,n]=(0,y.useState)(`loading`);(0,y.useEffect)(()=>{if(!e)return;let t=!0;return e.nextUpgrade().then(e=>{t&&n(e)},()=>{t&&n(`unavailable`)}),()=>{t=!1}},[e]);let r=t&&typeof t==`object`?t.rows:[],i=r.length>0,a=i&&r.every(e=>e.missing<=0);return(0,Q.jsxs)(`section`,{className:`t-fr-consequence t-fr-forge`,"aria-label":`Next Forge upgrade`,"data-materials":i?a?`ready`:`needed`:`unknown`,children:[(0,Q.jsx)(`span`,{className:`t-kicker`,children:`NEXT FORGE UPGRADE`}),e&&t&&typeof t==`object`?(0,Q.jsxs)(Q.Fragment,{children:[(0,Q.jsxs)(`div`,{className:`t-fr-forge-head`,children:[(0,Q.jsxs)(`span`,{className:`t-fr-forge-symbol`,"data-rarity":t.rarity||`common`,"aria-hidden":`true`,children:[(0,Q.jsx)(fe,{}),t.imageUrl?(0,Q.jsx)(`img`,{className:`t-fr-forge-item-art`,src:t.imageUrl,alt:``,loading:`lazy`,decoding:`async`,onError:e=>{e.currentTarget.hidden=!0}},t.key+`:`+t.imageUrl):null]}),(0,Q.jsxs)(`div`,{className:`t-fr-forge-identity`,children:[(0,Q.jsxs)(`strong`,{children:[t.name,` · ★`,t.stars]}),(0,Q.jsx)(`span`,{className:`t-fr-forge-readiness`,children:i?a?`MATERIALS READY`:`MATERIALS NEEDED`:`CHECK MATERIALS IN FORGE`})]})]}),(0,Q.jsx)(`ul`,{children:t.rows.map(e=>(0,Q.jsxs)(`li`,{"data-ready":e.missing<=0?`yes`:`no`,children:[(0,Q.jsxs)(`span`,{children:[e.label,` `,(0,Q.jsxs)(`b`,{children:[e.have.toLocaleString(),` / `,e.need.toLocaleString()]})]}),e.missing>0?(0,Q.jsxs)(`small`,{children:[`Missing `,e.missing.toLocaleString()]}):null]},e.label))}),(0,Q.jsx)(`button`,{type:`button`,className:`t-btn`,onClick:()=>e.openUpgrade(t.key),children:a?`UPGRADE IN FORGE`:`VIEW UPGRADE IN FORGE`})]}):(0,Q.jsx)(`p`,{role:`status`,children:!e||t===`unavailable`?`Forge details are unavailable. You can still choose your next operation.`:t===null?`No equipped upgrade could be confirmed.`:`Checking equipped gear and materials…`})]})}function Is({victory:e,missionName:t,plate:n,receipt:r,milestone:i,pending:a,error:o,failure:s,consequence:c,nextObjective:l,reachRendNext:u,actions:d,children:f}){let p=r?.victory?r.contractAward:void 0,m=p?.reward===`reach-rend`,h=m?Ms(`alpha-reach-rend`):null,g=r?`confirmed`:a?`pending`:o?`failed`:`unrecorded`,_=r?Nr(r):null,v=r?.rewardAmountsAvailable!==!1&&r?.xpGranted===0&&r.bonesGranted===0,y=r&&(r.victory||v)&&r.rewardAmountsAvailable!==!1&&Number.isSafeInteger(r.xpGranted)&&r.xpGranted>=0&&Number.isSafeInteger(r.bonesGranted)&&r.bonesGranted>=0,b=r?.victory&&y&&!v?r:null,x=r?.masteryChanges?.find(e=>e.veteran?.unlocked||e.stage>e.beforeStage),S=r&&r.rankAfter>r.rankBefore,C=!!(p?.reward||r?.veteranCareer?.unlocked||S||x),w=r?.veteranCareer&&r.veteranCareer.after>r.veteranCareer.before,T=r?.masteryChanges?.some(e=>e.gained>0),E=r?Pr(r,c):null,D=p?null:E,O=r?.veteranCareer?.unlocked?`VETERAN EARNED`:S?`RANK ${r.rankAfter} EARNED`:x?`${pn(x.unitId)?.name||x.unitId} · ${x.veteran?.unlocked?`VETERAN`:`STAGE ${x.stage}`}`:w?`VETERAN CAREER ADVANCED`:T?`PACK MASTERY RECORDED`:r&&r.progressEarned>0?`+${r.progressEarned} COMMANDER ${r.progressEarned===1?`POINT`:`POINTS`}`:`RUN RECORDED`,k=D?.kind===`recorded`&&(T||(r?.progressEarned??0)>0),ee=p?.reward===`field-tested`?`FIELD HONOR · ${j}`:r?.veteranCareer?.unlocked||S||x?O:null,A=(0,Q.jsx)(`div`,{className:`t-brief-actions t-result-actions`,children:d});return(0,Q.jsxs)(`div`,{className:`t-modal t-panel t-results t-field-results ${e?`is-victory`:`is-failure`}`,"data-reach-reward":m||void 0,"data-recording":g,"data-milestone":C?`confirmed`:void 0,children:[m?(0,Q.jsxs)(`section`,{className:`t-fr-reach-reward`,"aria-label":`Confirmed field contract`,children:[(0,Q.jsx)(`div`,{className:`t-fr-reward-commander`,"aria-label":`Your equipped Alpha`,children:(0,Q.jsx)(Os,{})}),(0,Q.jsxs)(`div`,{className:`t-fr-reward-copy`,children:[(0,Q.jsx)(`span`,{className:`t-kicker`,children:`VICTORY · ALPHA / A2`}),h?(0,Q.jsx)(`img`,{className:`t-fr-reward-icon`,src:h,alt:``}):null,(0,Q.jsx)(`h2`,{children:`Reach Rend`}),(0,Q.jsx)(`strong`,{children:`Unlocked`}),(0,Q.jsx)(`p`,{className:`t-fr-reward-stats`,children:te}),(0,Q.jsx)(`p`,{children:u}),l?(0,Q.jsx)(`p`,{children:l}):null,A,(0,Q.jsxs)(`small`,{children:[t,` · `,M(p.id),` completed · `,p.count,`/3`]})]})]}):(0,Q.jsxs)(`header`,{className:`t-outcome-hero${e?` t-fr-triumph`:``}`,children:[(0,Q.jsx)(`img`,{className:`t-results-plate`,src:n,alt:``,"aria-hidden":`true`}),e?(0,Q.jsx)(`span`,{className:`t-fr-triumph-emblem`,"aria-hidden":`true`,children:(0,Q.jsx)(_e,{})}):null,(0,Q.jsx)(`div`,{className:`t-kicker`,children:t}),(0,Q.jsx)(`h2`,{className:`t-title`,children:e?`VICTORY`:`DEFEAT`}),e?null:(0,Q.jsx)(`p`,{className:`t-fr-outcome`,children:s})]}),(0,Q.jsxs)(`div`,{className:`t-fr-record`,role:`status`,"aria-live":`polite`,"aria-atomic":`true`,children:[r?(0,Q.jsx)(le,{"aria-hidden":`true`}):g===`failed`?(0,Q.jsx)(xe,{"aria-hidden":`true`}):(0,Q.jsx)(U,{"aria-hidden":`true`}),(0,Q.jsxs)(`div`,{children:[(0,Q.jsx)(`strong`,{children:r?`SERVER RECORDED`:a?`RECORDING RESULT…`:o?`RECORDING FAILED`:`RESULT NOT RECORDED`}),(0,Q.jsx)(`p`,{children:r?`Receipt-confirmed progress below.`:a?`Waiting for confirmation. Earnings are not confirmed yet.`:`Earnings are not confirmed. Retry saving this result.`})]})]}),g===`failed`?(0,Q.jsx)(`p`,{className:`t-fr-error`,role:`alert`,children:o}):null,r?(0,Q.jsxs)(`section`,{className:`t-fr-consequence`,"aria-label":`Character payout`,children:[(0,Q.jsx)(`span`,{className:`t-kicker`,children:b?`CONFIRMED PAYOUT`:v?`TACTICAL RESULT`:`CHARACTER PAYOUT`}),b?(0,Q.jsxs)(`div`,{className:`t-fr-payout-grid`,"aria-label":`Receipt-confirmed rewards`,children:[(0,Q.jsxs)(`div`,{className:`t-fr-reward-unit`,"data-reward":`exp`,children:[(0,Q.jsx)(we,{"aria-hidden":`true`}),(0,Q.jsxs)(`span`,{children:[(0,Q.jsxs)(`strong`,{children:[`+`,b.xpGranted.toLocaleString()]}),(0,Q.jsx)(`small`,{children:`EXP`})]})]}),(0,Q.jsxs)(`div`,{className:`t-fr-reward-unit`,"data-reward":`bones`,children:[(0,Q.jsx)(ce,{"aria-hidden":`true`}),(0,Q.jsxs)(`span`,{children:[(0,Q.jsxs)(`strong`,{children:[`+`,b.bonesGranted.toLocaleString()]}),(0,Q.jsx)(`small`,{children:`Bones`})]})]})]}):(0,Q.jsx)(`p`,{children:v?`No EXP or Bones awarded for this result.`:`Character payout amounts are unavailable.`})]}):null,r?.victory?(0,Q.jsx)(Ps,{milestone:i}):null,r?.firstUpgradeScrapGranted===8?(0,Q.jsxs)(`section`,{className:`t-fr-consequence`,"aria-label":`Confirmed First Upgrade Supply`,children:[(0,Q.jsx)(`span`,{className:`t-kicker`,children:`FIRST UPGRADE SUPPLY`}),(0,Q.jsx)(`strong`,{children:`+8 SCRAP`}),(0,Q.jsx)(`p`,{children:`Use your Scrap in Forge to upgrade Rustfang Fangs.`})]}):null,p&&!m?(0,Q.jsxs)(`section`,{className:`t-fr-consequence t-field-contract`,"aria-label":`Confirmed field contract`,children:[(0,Q.jsxs)(`div`,{className:`t-kicker`,children:[M(p.id),` completed · `,p.count,`/3`]}),(0,Q.jsx)(`strong`,{className:ee?`t-fr-major-unlock`:void 0,children:p.reward===`field-tested`?`Field Honor earned · ${j}`:`One more contract unlocks Reach Rend`})]}):null,ee&&!p&&!D?(0,Q.jsx)(`div`,{className:`t-fr-major-unlock`,children:ee}):null,r&&D?(0,Q.jsxs)(`section`,{className:`t-fr-consequence t-fr-impact`,"data-impact-kind":D.kind,"data-impact-beat":D.beat,"aria-label":`Confirmed gameplay consequence`,children:[(0,Q.jsx)(`span`,{className:`t-fr-impact-overline`,children:`WHAT CHANGED`}),(0,Q.jsx)(`strong`,{className:`t-fr-impact-title`,children:k?O:D.title}),r.victory&&D.kind===`world`&&r.regionalApplied&&Number.isInteger(r.pressureBefore)&&Number.isInteger(r.pressureAfter)&&r.pressureBefore>=0&&r.pressureAfter>=0&&r.pressureBefore!==r.pressureAfter?(0,Q.jsxs)(`div`,{className:`t-fr-pressure-change`,"data-confirmed-pressure":`true`,"aria-label":`Confirmed pressure ${r.pressureBefore} to ${r.pressureAfter}`,children:[(0,Q.jsxs)(`span`,{children:[`PRESSURE `,(0,Q.jsx)(`strong`,{children:r.pressureBefore})]}),(0,Q.jsx)(oe,{"aria-hidden":`true`}),(0,Q.jsxs)(`span`,{children:[`PRESSURE `,(0,Q.jsx)(`strong`,{children:r.pressureAfter})]})]}):null,(0,Q.jsx)(`p`,{children:k?`Saved in your mission record.`:D.detail})]}):null,b&&!a?(0,Q.jsx)(Fs,{},b.runId):null,r&&!m?(0,Q.jsxs)(`div`,{className:`t-fr-next`,children:[(0,Q.jsx)(`span`,{className:`t-kicker`,children:`WHAT’S NEXT`}),l?(0,Q.jsx)(`p`,{children:l}):null]}):null,m?null:A,r?(0,Q.jsxs)(`details`,{className:`t-fr-ledger`,children:[(0,Q.jsxs)(`summary`,{children:[(0,Q.jsx)(`span`,{children:`MISSION RECORD`}),(0,Q.jsx)(`small`,{children:`Commander · Veteran · Mastery · Rewards`})]}),(0,Q.jsxs)(`section`,{className:`t-fr-earned`,"aria-label":`Confirmed mission earnings`,children:[(0,Q.jsxs)(`div`,{className:`t-fr-spotlight`,children:[(0,Q.jsx)(`span`,{className:`t-fr-insignia`,"aria-hidden":`true`,children:r.rankAfter}),(0,Q.jsxs)(`div`,{className:`t-fr-spotlight-copy`,children:[(0,Q.jsx)(`h3`,{children:C?`MILESTONE CONFIRMED`:`RECORDED THIS RUN`}),(0,Q.jsx)(`strong`,{className:`t-fr-achievement`,children:O}),(0,Q.jsxs)(`div`,{className:`t-fr-rank`,children:[(0,Q.jsx)(`span`,{children:`COMMANDER`}),(0,Q.jsxs)(`strong`,{children:[`RANK `,r.rankBefore===r.rankAfter?``:`${r.rankBefore} → `,r.rankAfter]}),(0,Q.jsxs)(`small`,{children:[r.progressBefore,` → `,r.progressAfter,` total points · rank shown by this receipt`]})]})]})]}),r.veteranCareer?.unlocked?(0,Q.jsxs)(`p`,{className:`t-fr-delta`,"data-veteran-career-delta":`true`,children:[`VETERAN CAREER `,r.veteranCareer.before,` → `,r.veteranCareer.after,`/12 · RANK 4 · PACK EXTRACTION UNLOCKED`]}):null,r.veteranCareer&&!r.veteranCareer.unlocked?(0,Q.jsxs)(`div`,{className:`t-pi-career`,"aria-label":`Veteran Career progress`,"data-progress-identity":`results`,children:[(0,Q.jsxs)(`div`,{className:`t-pi-career-head`,children:[(0,Q.jsx)(`span`,{children:`VETERAN CAREER · TOWARD RANK 4`}),(0,Q.jsxs)(`strong`,{"data-veteran-career-delta":`true`,children:[r.veteranCareer.before===r.veteranCareer.after?``:`${r.veteranCareer.before} → `,r.veteranCareer.after,`/12`]})]}),(0,Q.jsx)(`div`,{className:`t-pi-track`,role:`progressbar`,"aria-label":`Veteran career credits`,"aria-valuemin":0,"aria-valuemax":12,"aria-valuenow":r.veteranCareer.after,children:(0,Q.jsx)(`span`,{style:{width:`${Math.min(100,Math.max(0,r.veteranCareer.after/12*100))}%`}})}),(0,Q.jsx)(`p`,{children:ln(r.veteranCareer.reason)}),(0,Q.jsx)(`small`,{children:`Rank 4 also requires mission and objective diversity. Check the War Table for the next confirmed opportunity.`})]}):null,(0,Q.jsxs)(`dl`,{className:`t-fr-rewards`,children:[(0,Q.jsxs)(`div`,{"data-muted":!y||r.xpGranted===0?`true`:void 0,children:[(0,Q.jsx)(`dt`,{children:`EXP`}),(0,Q.jsx)(`dd`,{"aria-label":y?void 0:`EXP amount unavailable`,children:y?`+${r.xpGranted}`:`—`})]}),(0,Q.jsxs)(`div`,{"data-muted":!y||r.bonesGranted===0?`true`:void 0,children:[(0,Q.jsx)(`dt`,{children:`Bones`}),(0,Q.jsx)(`dd`,{"aria-label":y?void 0:`Bones amount unavailable`,children:y?`+${r.bonesGranted}`:`—`})]}),(0,Q.jsxs)(`div`,{"data-muted":r.progressEarned===0?`true`:void 0,children:[(0,Q.jsx)(`dt`,{children:`Commander points`}),(0,Q.jsxs)(`dd`,{children:[`+`,r.progressEarned]})]})]}),y?null:(0,Q.jsx)(`p`,{children:`Character reward amounts were not supplied by this receipt.`}),(0,Q.jsx)(`p`,{className:`t-fr-eligibility`,children:_?.exhausted}),r.masteryChanges?.map(e=>(0,Q.jsxs)(`p`,{className:`t-fr-delta`,children:[(0,Q.jsx)(`strong`,{children:pn(e.unitId)?.name||e.unitId}),` `,e.gained>0?`+${e.gained} Mastery earned`:`No new Mastery earned`,` · Foundation `,e.progress,`/8`,e.beforeStage===e.stage?``:` · Stage ${e.beforeStage} → ${e.stage}`,e.veteran&&(e.veteran.unlocked||e.veteran.after>e.veteran.before)?` · Veteran ${e.veteran.before} → ${e.veteran.after}/12 · ${e.veteran.unlocked?`New option unlocked`:ln(e.veteran.reason)}`:``]},e.unitId))]})]}):null,(0,Q.jsx)(`div`,{className:`t-fr-details`,children:f})]})}function Ls({victory:e,missionName:t,plate:n,receipt:r,milestone:i,pending:a,error:o,failure:s,kind:c,nextObjective:l,actions:u,children:d}){let f=r?`confirmed`:a?`pending`:o?`failed`:`unrecorded`,p=c===`lockdown`,m=p&&!!r?.firstLockdownClear,h=m&&r?.lockdownFirstClear===!0,g=r?.lockdownPlan===`anchor`?`ANCHOR`:r?.lockdownPlan===`crosslink`?`CROSSLINK`:null;return(0,Q.jsxs)(`div`,{className:`t-modal t-panel t-results t-field-results t-special-field-results ${e?`is-victory`:`is-failure`}`,"data-special-result":c,"data-recording":f,"data-milestone":h?`confirmed`:void 0,children:[(0,Q.jsxs)(`header`,{className:`t-outcome-hero`,children:[(0,Q.jsx)(`img`,{className:`t-results-plate`,src:n,alt:``,"aria-hidden":`true`}),(0,Q.jsx)(`div`,{className:`t-kicker`,children:t}),(0,Q.jsx)(`h2`,{className:`t-title`,children:e?`VICTORY`:`DEFEAT`}),e?null:(0,Q.jsx)(`p`,{className:`t-fr-outcome`,children:s})]}),(0,Q.jsxs)(`div`,{className:`t-fr-record`,role:`status`,"aria-live":`polite`,"aria-atomic":`true`,children:[r?(0,Q.jsx)(le,{"aria-hidden":`true`}):f===`failed`?(0,Q.jsx)(xe,{"aria-hidden":`true`}):(0,Q.jsx)(U,{"aria-hidden":`true`}),(0,Q.jsxs)(`div`,{children:[(0,Q.jsx)(`strong`,{children:r?`SERVER RECORDED`:a?`RECORDING RESULT…`:o?`RECORDING FAILED`:`RESULT NOT RECORDED`}),(0,Q.jsx)(`p`,{children:r?`Accepted mission receipt confirmed.`:a?`Waiting for the server receipt; no saved progress confirmed.`:`The local result has not been saved. Retry recording.`})]})]}),f===`failed`?(0,Q.jsx)(`p`,{className:`t-fr-error`,role:`alert`,children:o}):null,r?(0,Q.jsxs)(Q.Fragment,{children:[(0,Q.jsxs)(`section`,{className:`t-special-achievement`,"aria-label":`Server-confirmed special operation result`,children:[(0,Q.jsx)(`span`,{className:`t-kicker`,children:`WHAT CHANGED`}),(0,Q.jsx)(`strong`,{children:m?`LOCKDOWN COMPLETION RECORDED`:p?`LOCKDOWN RUN RECORDED`:`PACK EXTRACTION RUN RECORDED`}),(0,Q.jsx)(`p`,{children:m?h?`Relay Mastery 1/1 · first completion saved permanently.`:`Relay Mastery 1/1 · previously recorded completion preserved. No new progression reward.`:p?`Optional practice accepted${g?` · ${g} plan`:``}. No new currency or progression rewards.`:`Optional Veteran practice accepted. No currency, Commander, Veteran or Pack Mastery progress.`})]}),r.victory?(0,Q.jsx)(Ps,{milestone:i}):null,(0,Q.jsxs)(`div`,{className:`t-fr-next`,children:[(0,Q.jsx)(`span`,{className:`t-kicker`,children:`WHAT’S NEXT`}),l?(0,Q.jsx)(`p`,{children:l}):null]})]}):null,(0,Q.jsx)(`div`,{className:`t-brief-actions t-result-actions`,children:u}),(0,Q.jsx)(`div`,{className:`t-fr-details`,children:d})]})}var Rs=(e,t={})=>({missionId:e,title:``,reason:``,tier:`standard`,resume:!1,...t});function zs(e,t,n=!1){let r=e?.fieldOps,i=r?.board,a=!!(i&&i.nextRotationAt*1e3>Date.now()),o={action:null,label:a?`WAR TABLE`:`REFRESH WAR TABLE`,detail:a?`No eligible next operation confirmed.`:`Refresh to check current operations.`,refresh:!a};if(n||!e?.completed)return o;let s=Mr(e).primary,c=e.chapterActiveMission||r?.activeMissionRun||Object.values(e.operations||{}).find(e=>e.activeMissionRun)?.activeMissionRun;if(c||e.tacticalChapter?.activeRunId)return!s?.resume||s.missionId!==c?.missionId?o:{action:s,label:W(s.missionId)?.activity===`FIELD_OP`&&!s.chapter?`RESUME FIELD OP`:`RESUME ACCEPTED RUN`,detail:or(c.runId)?`Resume from your last confirmed action.`:`Resume from round 1 with your locked squad and mission setup.`};let l=Ar(r);if(l&&s?.missionId===l.missionId&&s.title===l.title)return{action:l,label:`NEXT: RELAY RECOVERY`,detail:l.reason};let u=`chapterId`in t,d=W(t.missionId),f=d?.activity===`FIELD_OP`,p=`masteryChallenge`in t&&t.masteryChallenge,m=`veteranChallenge`in t&&t.veteranChallenge,h=e.tacticalChapter?.status===`ACTIVE`&&e.tacticalChapter.doctrine===`RECON`&&It(e.tacticalChapter),g=xt.orderedMissionIds.find(t=>e.operations?.[xt.operationId]?.missions[t]===`available`),_=a&&i?.activeMissionIds.includes(t.missionId),v=!t.victory&&(u?h===t.missionId:p?r?.masteryPath?.unlockedChallenge===p:m?r?.veteranProgressionAvailable===!0&&(r.commander?.rank||0)>=4:f?_:e.operations?.[d?.operationId||``]?.missions[t.missionId]===`available`||e.operations?.[d?.operationId||``]?.missions[t.missionId]===`cleared`),y=v?Rs(t.missionId,{chapter:u,masteryChallenge:p||void 0,veteranChallenge:m||void 0,lockdownPlan:`lockdownPlan`in t?t.lockdownPlan:void 0,tier:`directiveTier`in t&&t.directiveTier===`advanced`?`advanced`:`standard`}):u&&h?Rs(h,{chapter:!0}):!f&&g?Rs(g):jr(e),b=W(y?.missionId);if(!y||!b?.executable)return!t.victory&&f&&!v?{...o,detail:`This Field Op is unavailable for retry. `+o.detail}:o;if(b.activity===`FIELD_OP`&&!y.chapter&&!y.masteryChallenge&&!y.veteranChallenge&&(!a||!i?.activeMissionIds.includes(b.missionId))||y.tier===`advanced`&&!y.masteryChallenge&&!y.veteranChallenge&&(!r?.commander?.unlockedDirectiveTiers?.includes(`advanced`)||i?.reportVersion!==3))return o;let x=y.veteranChallenge?{reportVersion:6,veteranChallenge:y.veteranChallenge}:y.masteryChallenge?{reportVersion:y.lockdownPlan?5:4,masteryChallenge:y.masteryChallenge,lockdownPlan:y.lockdownPlan}:b.activity===`FIELD_OP`?{reportVersion:y.chapter?3:i?.reportVersion||2,directiveTier:y.tier,directiveSet:i?.directiveSet,pressure:r?.region?.pressure??2}:void 0,S=e.vnextStartAvailable?Me:void 0,C=b.missionId===`field-relay-intercept`&&S&&r?.interceptRevisionAvailable===2?2:Et(b.missionId,S,e.deadRelayHoldRevisionAvailable)??Ot(b.missionId,S,i),w=e.campaignIntel?.[`dead-relay`],T=At(b,x,C,w&&{version:1,...w}),E=Mt(T,!1,x),D=yr(T),O=E.directive?.maxRounds&&!y.masteryChallenge&&!y.veteranChallenge?` Finish by round ${E.directive.maxRounds}.`:E.directive?.recoverEveryRounds&&!y.veteranChallenge?` Signal opens every ${E.directive.recoverEveryRounds} rounds.`:``,k=y.title===`PRACTICE WITH YOUR SQUAD`||y.title===`REVIEW FIELD CONDITIONS`||y.title===`RELAY LOCKDOWN · COMPLETED`||y.veteranChallenge||!!(y.masteryChallenge&&r?.masteryPath?.firstLockdownClear),ee=y.missionId&&N(y.missionId),A=!!(ee&&y.title===ee.name),j=`${A?ee.objective:D+O}${k?y.masteryChallenge||y.veteranChallenge?` Optional practice. No progression reward.`:` Optional practice. No new rotation progress confirmed.`:``}`,te=t.victory&&`contractAward`in t?kr(e,t):void 0,M=t.victory&&p&&r?.masteryPath?.unlockedChallenge===p?Rs(t.missionId,{tier:`advanced`,masteryChallenge:p,lockdownPlan:`lockdownPlan`in t?t.lockdownPlan:void 0}):t.victory&&m&&r?.veteranProgressionAvailable&&(r.commander?.rank||0)>=4?Rs(t.missionId,{tier:`advanced`,veteranChallenge:m}):b.squadCap>1?y:void 0;return{action:y,retry:v,equipMission:te,reviewAction:M,label:v?`RETRY MISSION`:k?`PRACTICE · ${b.name}`:A?`NEXT: ${ee.name}`:`${y.tier===`advanced`?`ADVANCED`:`NEXT`}: ${b.name}`,detail:!t.victory&&!v?`This attempt is unavailable for retry. ${j}`:M&&M!==y?`${j} Or change your squad for ${p?`Lockdown`:`Pack Extraction`} practice.`:j}}function Bs(e,t,n,r){return e===`TARGET_ESCAPED`?`The signal courier reached its exit.`:e===`DEADLINE`?`The completion window closed before you secured the objective.`:t===`SURVIVE`&&n<r?`A squad member fell. The full squad had to survive.`:n===0?`All allies fell before the objective was secured.`:`The objective was not secured.`}function Vs(e,t){return e.startsWith(`pet:`)?!t||e!==`pet:${t.id}`?null:{id:e,defId:e,c:0,r:0,unitDef:et(t)}:e!==`ally-02`&&e!==`ally-03`?null:{id:e,defId:e,c:0,r:0}}function Hs(e,t,n){let r=Vs(e,n);if(!r)return null;let i=Br([r],t)[0];return i.unitDef||k[i.defId]||null}function Us(e){return e.effects.map(e=>[e.kind,e.status||``,e.on||``,e.duration||0,e.value||0,e.base||0,e.scale||0,e.multiplier||0].join(`:`)).sort()}function Ws(e){let t=new Map;for(let n of e.effects){let e=n.kind===`status`?`STATUS ${n.status}`:n.kind.toUpperCase(),r=n.kind===`status`?`${n.duration||0}T / ${Math.round((n.value||0)*100)}%`:n.kind===`damage`?`${n.multiplier??0}x`:`${n.base??0} + ${n.scale??0}x`;t.set(e,r)}return t}function Gs(e,t){let n=`${t.slot} ${t.name}`,r=[],i=(e,t,i)=>{t!==i&&r.push(`${n} · ${e} ${t} → ${i}`)};i(`RANGE`,e.maxRange,t.maxRange),i(`RADIUS`,e.radius,t.radius),i(`COOLDOWN`,e.cooldownMax,t.cooldownMax),e.targetType!==t.targetType&&r.push(`${n} · TARGET ${e.targetType} → ${t.targetType}`),e.ignoreDisruption!==t.ignoreDisruption&&r.push(`${n} · IGNORE DISRUPTION ${e.ignoreDisruption===!0?`YES`:`NO`} → ${t.ignoreDisruption===!0?`YES`:`NO`}`);let a=Ws(e),o=Ws(t);for(let e of new Set([...a.keys(),...o.keys()]))a.get(e)!==o.get(e)&&r.push(`${n} · ${e} ${a.get(e)||`NONE`} → ${o.get(e)||`NONE`}`);return!r.length&&Us(e).join(`|`)!==Us(t).join(`|`)&&r.push(`${n} · EFFECT COMPOSITION CHANGED`),r}function Ks(e,t,n){let r=[];e.move!==t.move&&r.push(`MOVE ${e.move} → ${t.move}`),(e.recoverRange||1)!==(t.recoverRange||1)&&r.push(`RECOVER RANGE ${e.recoverRange||1} → ${t.recoverRange||1}`);let i=Wt(n,t.defId);for(let n of t.skillIds){let t=Ut(dn(n),i),a=e.skillIds.find(e=>dn(e).slot===t.slot);a&&r.push(...Gs(Ut(dn(a),i),t))}return r}function qs(e){return e.stage>=3&&e.selected?{progress:3,stage:2,selected:null,unlockedOptions:[]}:{progress:0,stage:1,selected:null,unlockedOptions:[]}}function Js(e,t,n,r){let i=t.packMastery?.[e];if(!i||i.stage<2||i.stage>=3&&!i.selected)return null;let a=Hs(e,{...t,packMastery:{...t.packMastery,[e]:qs(i)}},n),o=Hs(e,t,n);if(!a||!o)return null;let s=Ks(a,o,r);return s.length?{subject:e===`ally-02`?`CNC`:e===`ally-03`?`SHADOW`:`PET`,comparison:i.stage===2?`BASE → TRAINED`:`TRAINED → SAVED SIGNATURE`,changes:s,source:`SAVED_PROGRESSION`}:null}function Ys(e,t,n,r){let i=t.packMastery?.[e];if(!i||i.stage!==3||!i.selected)return[];let a={...t,packMastery:{...t.packMastery,[e]:{...i,selected:i.selected===`A`?`B`:`A`}}},o=Hs(e,t,n),s=Hs(e,a,n);return o&&s?Ks(o,s,r):[]}function Xs(e,t){if(e?.activity!==`FIELD_OP`||!t||!Number.isInteger(t.pressure)||t.pressure<0||t.pressure>3||t.masteryChallenge||t.veteranChallenge||t.lockdownPlan)return null;let n=Mt(e,!1,{...t,pressure:2}).reinforcement,r=Mt(e,!1,t).reinforcement;if(!n||!r||!Number.isInteger(n.triggerRound)||!Number.isInteger(r.triggerRound))return null;let i=r.triggerRound>n.triggerRound;return{baseRound:n.triggerRound,actualRound:r.triggerRound,delayed:i,text:i?`HOUND round ${r.triggerRound} (normally ${n.triggerRound}). Reduced Signal Pressure gives one extra preparation round.`:`HOUND round ${r.triggerRound}. Lower Signal Pressure below 2 to delay future new runs to round ${n.triggerRound+1}.`}}function Zs(e,t,n,r=Date.now(),i=`standard`,a=!1){if(!t||!n||n.cycleId!==t.cycleId||t.nextRotationAt*1e3<=r||!t.activeMissionIds.includes(e))return null;let o=W(e);if(!o)return null;let s={cycleId:t.cycleId,pressure:n.pressure,reportVersion:t.reportVersion||2,directiveTier:i,directiveSet:t.directiveSet};return Xs(At(o,s,Ot(e,a?Me:void 0,t)),s)}function Qs(e){let t=e?.fieldOps?.careerRecord;return t?{missions:t.missionSecures,challenges:t.challenges,advanced:t.advancedClears,fronts:t.frontsSecured}:null}function $s(e,t,n){if(e){if(e.regionalApplied&&e.pressureBefore!==e.pressureAfter){let t=e.pressureAfter<2?`New relevant Field Ops use a one-round reinforcement delay; already accepted runs keep their original timing.`:`Reinforcements remain on schedule.`;return{label:`SIGNAL PRESSURE CHANGED`,detail:`Pressure ${e.pressureBefore} → ${e.pressureAfter}. ${t}`,source:`SERVER_RECEIPT`}}if(e.advancedUnlocked)return{label:`ADVANCED DIRECTIVES UNLOCKED`,detail:`A new tactical challenge is available at the War Table.`,source:`SERVER_RECEIPT`};if(e.frontJustSecured)return{label:`FRONT SECURED`,detail:`The current rotation's front is recorded as secured.`,source:`SERVER_RECEIPT`};if(e.rankAfter>e.rankBefore)return{label:`COMMANDER RANK ADVANCED`,detail:`Rank ${e.rankBefore} → ${e.rankAfter}; check new deployment options at the War Table.`,source:`SERVER_RECEIPT`};if(e.masteryChanges?.some(e=>e.beforeStage<e.stage)){let t=e.masteryChanges.find(e=>e.beforeStage<e.stage);return{label:`PACK MASTERY UNLOCKED`,detail:`${t.unitId}: stage ${t.beforeStage} → ${t.stage}. Check the saved specialization.`,source:`SERVER_RECEIPT`}}return null}return t?.victory&&t.missionId===`dead-relay-courier`&&n?.campaignIntel?.[`dead-relay`]?.courierTraceAcquired&&t.intelEarned?{label:`COURIER TRACE RECORDED`,detail:n.vnextStartAvailable&&n.deadRelayHoldRevisionAvailable===2?`Next Hold: HOUND round 3. South-east entry.`:`Next Hold: HOUND delayed by one round.`,source:`SERVER_RECEIPT`}:null}function ec(e,t,n){if(!n||!e&&!t)return null;let r=e||t;if(r&&!r.victory)return{title:`TRY A DIFFERENT TACTIC`,reason:`Review the mission objective and change your squad or route. No clear reward was recorded.`,missionId:r.missionId};if(e){let t=Mr(n).primary||wr(n.fieldOps,e.missionId),r=W(t.missionId);return{title:r?.name||`WAR TABLE`,reason:t.reason,missionId:r?.missionId||null}}if(t){let e=n.operations?.[`dead-relay`],t=[`dead-relay-courier`,`dead-relay-hold`,`dead-relay-guardian`].find(t=>e?.missions[t]===`available`);return t?{title:W(t)?.name||`NEXT CAMPAIGN MISSION`,reason:t===`dead-relay-hold`?`Defend the relay to open the route to its Guardian.`:t===`dead-relay-guardian`?`Defeat the Guardian to secure the Dead Relay.`:`Intercept the courier to open the relay route.`,missionId:t}:{title:`WAR TABLE`,reason:`Campaign progress is recorded. Explore available Field Ops or replay to practice; no additional reward is promised.`,missionId:null}}return null}function tc(e,t,n){return e&&t&&n&&e.runId===t&&e.missionId===n?e:null}function nc(){if(typeof window>`u`)return null;let e=window.FirstSessionSpine;return!e||typeof e.view!=`function`||typeof e.subscribe!=`function`||typeof e.acknowledge!=`function`?null:e}function rc(){let e=nc();return e?{view(){return{result:e.view()?.result??void 0}},subscribe(t){let n=e.subscribe(t);return typeof n==`function`?n:()=>void 0},acknowledge(t){return e.acknowledge(t)===!0}}:null}function ic(e,t){if(t!==`solo-1`||e.outcome!==`ongoing`)return null;let n=e.units.find(t=>t.id===e.activeId),r=e.units.find(e=>e.team===`enemy`&&!e.defeated);if(!n||n.defId!==`alpha`||n.defeated||n.hasActed||!r||e.mode===`targeting`)return null;let i=Ut(dn(`alpha-strike`),n.growth);return(n.cooldowns[i.id]??0)===0&&K(e.units,n,i).includes(r.id)?{title:`STRIKE IS READY`,copy:`Tap STRIKE (A1), then tap the highlighted scout.`}:n.hasMoved?{title:`NEXT TURN`,copy:`Still too far away. Tap SKIP, then move closer on Alpha's next turn.`}:vi(n,e.units).length>0?{title:`MOVE TOWARD SCOUT`,copy:`Tap a highlighted tile. Get 1 tile away from the scout to use STRIKE.`}:{title:`NO MOVE AVAILABLE`,copy:`Choose an available action or SKIP to advance the turn.`}}function ac(e,t){if(e.outcome!==`ongoing`)return null;let n=e.units.find(t=>t.id===e.activeId);if(!n||n.team!==`ally`||n.defeated||n.hasActed)return null;let r=e.units.filter(e=>!e.defeated&&e.team===`ally`),i=e.units.some(e=>e.defId===`alpha`&&e.defeated);if(e.mode===`targeting`&&e.actionSkillId){let t=Ut(dn(e.actionSkillId),n.growth),r=K(e.units,n,t).length;return r===0?{title:`NO TARGET IN RANGE`,copy:n.hasMoved?`This skill cannot hit from here. Tap the skill again to cancel, then choose another ability or SKIP.`:`Tap the skill again to cancel. Move closer, then try again.`}:{title:`TARGET READY`,copy:`Tap one of the ${r} highlighted legal targets to use ${t.name}.`}}let a=n.skillIds.map(e=>Ut(dn(e),n.growth)).filter(e=>(n.cooldowns[e.id]??0)===0).some(t=>(t.targetType===`ENEMY_SINGLE`||t.targetType===`AREA_RADIUS`)&&K(e.units,n,t).length>0);if(i&&r.length>0)return{title:`THE PACK FIGHTS ON`,copy:a?`${n.name} can still attack. Select a skill and a highlighted target.`:n.hasMoved?`${n.name} has no enemy in range. Use a support skill or SKIP to pass the turn.`:`${n.name} is still active. Move into range, use support, or SKIP.`};if(e.objective?.type===`RECOVER`&&!e.objective.completed){let t=Dr(e);return{title:t.status,copy:t.action}}return t?.objectiveType===`HOLD`&&e.objective?.type===`HOLD`&&!e.units.some(e=>e.team===`enemy`&&!e.defeated)?{title:`SECURE THE RELAY`,copy:`No hostiles remain. Move a living ally into the marked HOLD zone and maintain control through the required round changes.`}:t?.objectiveType===`SURVIVE`&&e.objective?.type===`SURVIVE`&&!e.units.some(e=>e.team===`enemy`&&!e.defeated)?{title:`HOLD FORMATION`,copy:`Enemies cleared. Keep every squad member alive until the survival timer completes. Use SKIP to advance turns.`}:!a&&!n.hasMoved&&vi(n,e.units).length>0?{title:`POSITION FIRST`,copy:`No enemy in attack range. Move into range or use an available support skill.`}:!a&&n.hasMoved?{title:`NO ATTACK IN RANGE`,copy:`Use an available support skill or SKIP. Your next turn will come.`}:t?.objectiveType===`HOLD`?{title:`HOLD THE RELAY`,copy:`Keep a living ally inside the marked zone. Clear enemies contesting it.`}:t?.objectiveType===`SURVIVE`?{title:`SURVIVE THE WAVES`,copy:`Keep your squad standing until the required round. Eliminating enemies early does not end the timer.`}:null}function oc(e,t,n){if(!t||t.defId!==`ally-02`||t.growth?.discipline!==`disruptor`)return[];let r=new Set(n.map(e=>e.enemyId));return[...new Set(qi(e,t).filter(e=>e.ready&&(e.id===`u02-suppress`||e.id===`u02-pressure-disruptor`||e.id.startsWith(`u02-pressure-disruptor:mastery:`)||e.id.startsWith(`u02-suppress:mastery:`))&&e.effects.some(e=>e.kind===`status`)).flatMap(e=>e.targets.filter(e=>r.has(e))))]}function sc(e){let{battle:t,busy:n}=e,r=t.units.find(e=>e.id===t.activeId),i=!!r&&r.team===`ally`&&!r.defeated&&!r.hasActed&&!n&&t.outcome===`ongoing`,a=t.outcome===`ongoing`&&e.activeRulesetVersion===`tactical-intent-vnext.0`?e.threats.filter(e=>e.rulesetVersion===Me).map(e=>{let n=e.targetUnitId&&e.targetTile===null?t.units.find(t=>t.id===e.targetUnitId&&!t.defeated):null;return n?{...e,impactTiles:[{c:n.c,r:n.r}]}:e}):[],o=new Set(a.flatMap(e=>e.impactTiles.map(e=>mi(e.c,e.r)))),s=i&&t.mode===`targeting`&&!!t.actionSkillId,c=r?qi(t,r):[],l=c.find(e=>e.id===t.actionSkillId),u=s&&l?.ready?l.targets:[],d=i?oc(t,r,a):[],f=i&&!r.hasMoved&&!s?vi(r,t.units):[],p=f.some(e=>!o.has(mi(e.c,e.r))),m=ic(t,e.onboardingStageId),h=ac(t,e.mission),g=Sr(t),_=Cr(t),v=a.map((e,n)=>({id:e.enemyId,label:`${n+1}`,name:t.units.find(t=>t.id===e.enemyId)?.name||`Enemy`,effect:e.predictedEffect})),y=s?u.length?l?.name:r?.hasMoved?`Cancel or use support`:`Cancel to move into range`:null,b=e.consequences.find(e=>e.kind===`counter`),x=e.floats.find(e=>e.kind===`heal`||e.kind===`dmg`),S=e.combatMoment?.actorId===r?.id?e.combatMoment:null,C=b?`INTERRUPTED · enemy intent canceled`:S&&(S.mode===`guard`||S.mode===`control`)?`${S.title} · ${S.consequence}`:x?`${x.kind===`heal`?`HEAL`:`HIT`} ${x.text} · ${t.units.find(e=>e.id===x.unitId)?.name||`unit`}`:S?`${S.title} · ${S.consequence}`:null,w=a.length?`REACT`:s?`TARGET`:n&&C?`RESOLVE`:i?`READ`:`WAIT`,T,E;if(w===`REACT`)T=`INCOMING ${a.length}`,E=y||(a.some(e=>e.targetUnitId&&e.targetTile===null)?`TRACKING LOCK · break range, interrupt or guard`:d.length?`Interrupt available`:p?`Move off marked cells`:`Marked cells are under threat`);else if(w===`TARGET`)T=u.length?`CHOOSE TARGET`:`NO TARGET`,E=y||``;else if(w===`RESOLVE`)T=`RESOLVED`,E=C;else if(w===`WAIT`)T=t.outcome===`victory`?`SECTOR SECURED`:t.outcome===`defeat`?`OPERATION FAILED`:r?.team===`enemy`?`ENEMY ACTION`:`RESOLVING`,E=C||(r?r.name:`Preparing next activation`);else{T=m?.title||(h?.title===`POSITION FIRST`&&f.length?`MOVE INTO RANGE`:h?.title)||(r?.hasMoved?`CHOOSE ACTION`:`READ THE FIELD`);let e=t.objective?.type===`RECOVER`&&!t.objective.completed;E=m?.copy||(h&&!e?``:h?.copy||_.action)}return!a.length&&!s&&t.reinforcement?.telegraphed&&!t.reinforcement.spawned&&w===`READ`&&(T=`REINFORCEMENT INBOUND`,E=`Marked entry · not spawned yet`),{mode:w,actor:r,interactive:i,targeting:s,targetIds:u,interruptTargetIds:d,threats:a,danger:o,sources:v,objective:g,title:T,detail:E,result:C,actions:c.map(e=>({id:e.id,reason:e.ready?i?Oi(e)&&!e.targets.length?`NO TARGET`:t.actionSkillId===e.id&&s?`CANCEL`:`READY`:`WAIT`:`CD ${e.cd}`})),showFallbackImpact:e.combatFx.length===0,showFallbackMasterFx:!1,primaryFx:e.combatFx.some(e=>e.name===`cnc_interrupt`)?e.combatFx.filter(e=>e.name!==`cnc_pressure`).map(t=>t.name===`cnc_interrupt`?{...t,durationMs:e.combatFx.find(e=>e.name===`cnc_pressure`)?.durationMs??t.durationMs}:t):e.combatFx}}function cc(e,t,n){let{widthPct:r,heightPct:i}=Ci(t,n);return{"--cell-touch-w":`${r}cqw`,"--cell-touch-h":`${i}cqh`}}var lc={"alpha-rend":{archetype:`heavy`,cue:`CLOSE · BLEED`,effectClass:`control`},"alpha-howl":{archetype:`support`,cue:`AURA · R2`,targetClass:`aura`,effectClass:`buff`},"pet-hamstring":{archetype:`control`,cue:`CLOSE · SLOW`,effectClass:`control`},"u02-suppress":{archetype:`control`,cue:`CONTROL · 3`,effectClass:`control`},"u02-pressure-disruptor":{archetype:`control`,cue:`CONTROL · 3`,effectClass:`control`},"u03-mend":{archetype:`heal`,cue:`ALLY · 3`,targetClass:`ally`,effectClass:`heal`},"u03-mend-restorer":{archetype:`heal`,cue:`AURA · R1`,targetClass:`aura`,effectClass:`heal`},"u03-pack":{archetype:`support`,cue:`AURA · R2`,targetClass:`aura`,effectClass:`buff`},"u03-pack-warden":{archetype:`support`,cue:`AURA · R2`,targetClass:`aura`,effectClass:`buff`}};function uc(e){return e.targetType===`ALLY_AOE`?`aura`:e.targetType===`ALLY_SINGLE`||e.targetType===`SELF`?`ally`:`enemy`}function dc(e){if(e.effects.some(e=>e.kind===`heal`))return`heal`;let t=e.effects.filter(e=>e.kind===`status`);return t.some(e=>e.status&&String(e.status).endsWith(`_DOWN`))||t.some(e=>e.status===`BLEED`)?`control`:t.length?`buff`:`damage`}function fc(e,t){return t===`heal`?`heal`:t===`control`?`control`:t===`buff`?`support`:e.effects.some(e=>e.kind===`damage`&&(e.multiplier??1)>=1.35)?`heavy`:`strike`}function pc(e,t){return e.targetType===`ALLY_AOE`?`AURA · R${Math.max(1,e.radius)}`:e.targetType===`ALLY_SINGLE`?`ALLY · ${e.maxRange}`:e.targetType===`SELF`?`SELF`:t===`control`?e.maxRange<=1?`CLOSE · CTRL`:`CONTROL · ${e.maxRange}`:e.maxRange<=1?`CLOSE · 1`:`REACH · ${e.maxRange}`}function mc(e){let t=dc(e),n={archetype:fc(e,t),cue:pc(e,t),targetClass:uc(e),effectClass:t},r=lc[Ht(e.id)]||{};return{...n,...r,cue:e.targetType===`ALLY_AOE`?`AURA · R${Math.max(1,e.radius)}`:pc(e,t)}}var hc={archetype:`objective`,cue:`OBJECTIVE`,targetClass:`objective`,effectClass:`objective`},gc=`/images/tactical_ops/emblems`,_c={alpha:{core:`${gc}/emblem_alpha_core.png`,vanguard:`${gc}/emblem_alpha_vanguard.png`,howlkeeper:`${gc}/emblem_alpha_howlkeeper.png`},"ally-02":{core:`${gc}/emblem_cnc_core.png`,pursuer:`${gc}/emblem_cnc_pursuer.png`,disruptor:`${gc}/emblem_cnc_disruptor.png`},"ally-03":{core:`${gc}/emblem_shadow_core.png`,sentinel:`${gc}/emblem_shadow_sentinel.png`,medic:`${gc}/emblem_shadow_medic.png`}};function vc(e,t){if(!Object.prototype.hasOwnProperty.call(_c,e))return null;let n=_c[e];return(t&&Object.prototype.hasOwnProperty.call(n,t)?n[t]:n.core)||null}var yc=new Set([`BULWARK`,`MARKSMAN`,`DISRUPTOR`,`SKIRMISHER`,`COURIER`]);function bc(e,t){let n=e.role,r=e.archetype;return e.team!==`enemy`||n!==`hostile`||!r||!yc.has(r)||![`front`,`back`,`left`,`right`].includes(t)?null:`/images/tactical_ops/hounds/hound_${r.toLowerCase()}_${t}.webp`}function xc(e,t){if(!e||!t)return null;try{let n=Nn(e);return n&&n.pet?.id===t.pet?.id?n:null}catch{return null}}function Sc(e,t){if(!e||!t)return null;if(e.activeRunId===t&&e.foundationRunRules?.runId===t&&e.foundationRunRules.rulesContract.combatProfileVersion===3){let n=xc(e.activeCombatProfileV3,e.activeCombatProfileV2);if(n)return{runId:t,profile:n,petDeployed:!1}}let n=[e.fieldOps?.activeMissionRun,e.chapterActiveMission,e.signalTrials?.activeRun,...Object.values(e.operations||{}).map(e=>e.activeMissionRun)];for(let e of n){if(e?.runId!==t||e.rulesContract?.combatProfileVersion!==3||!e.squadIds.includes(`alpha`))continue;let n=xc(e.combatProfileV3,e.combatProfileV2);if(n)return{runId:t,profile:n,petDeployed:!!(n.pet&&e.squadIds.includes(`pet:${n.pet.id}`))}}return null}var Cc={battlefield:`/images/tactical_ops/presentation/tactical_ops_battlefield_backdrop.png`,signalRecovery:`/images/tactical_ops/presentation/tactical_ops_signal_recovery_marker.png`,reinforcementWarning:`/images/tactical_ops/presentation/tactical_ops_reinforcement_warning.png`};function wc(e,t,n){let r=t.c-e.c,i=t.r-e.r;return!r&&!i?n:Math.abs(r)>=Math.abs(i)?r>0?`right`:`left`:i>0?`front`:`back`}function Tc(e,t){let n,r=1/0;for(let i of t){if(i.team===e.team||i.defeated||i.hp<=0)continue;let t=pi(e,i);(t<r||t===r&&n&&i.id<n.id)&&(n=i,r=t)}return n}var Ec=e=>`/images/tactical_ops/alpha_directional/${e}.png`;function Dc(e,t){return e.team===`ally`&&e.role===`alpha`&&e.sprite===T&&!t.skinKey?.trim()&&!t.skinUrl?.trim()&&t.source!==`skin`&&t.source!==`character-image`}function Oc(){if(typeof window>`u`)return null;let e=window,t=e.__PROFILE__||e.PROFILE||e.profileState||e.lastProfile||{},n=t.level??t.lv??t.hero_level??t.heroLevel,r=typeof n==`number`?n:Number(n);return Number.isFinite(r)&&r>0?Math.floor(r):null}function kc(e){return e===`ATK_UP`||e===`DEF_UP`||e===`SPD_UP`||e===`GUARD`}function Ac(e){return e.role===`leader`?`leader`:e.role===`hostile`?`hound`:e.role===`alpha`?`alpha`:e.role===`ranged`||e.role===`skirmisher`?`skirmisher`:e.role===`support`?`support`:``}function jc({archetype:e}){let t={className:`t-act-svg`,"aria-hidden":!0};return e===`strike`?(0,Q.jsx)(ve,{...t}):e===`heavy`?(0,Q.jsx)(se,{...t}):e===`control`?(0,Q.jsx)(H,{...t}):e===`heal`?(0,Q.jsx)(pe,{...t}):e===`support`?(0,Q.jsx)(U,{...t}):e===`objective`?(0,Q.jsx)(be,{...t}):(0,Q.jsx)(ye,{...t})}function Mc({src:e,archetype:t,fallback:n}){let r=n===`skip`?(0,Q.jsx)(de,{className:`t-act-svg`,"aria-hidden":`true`}):(0,Q.jsx)(jc,{archetype:t});return e?(0,Q.jsxs)(`span`,{className:`t-act-art`,"aria-hidden":`true`,children:[(0,Q.jsx)(`img`,{className:`t-act-image`,src:e,alt:``,draggable:!1,decoding:`async`,onError:e=>e.currentTarget.parentElement?.classList.add(`has-icon-error`)}),(0,Q.jsx)(`span`,{className:`t-act-fallback`,children:r})]},e):r}function Nc(e,t,n){let r=t-n;return r===0?`${e} ${t}`:`${e} ${r>0?`+`:``}${r}`}function Pc({selected:e,guarding:t}){return(0,Q.jsxs)(`svg`,{className:`t-ring`,viewBox:`0 0 100 36`,"aria-hidden":`true`,children:[(0,Q.jsx)(`ellipse`,{cx:`50`,cy:`22`,rx:e?40:34,ry:e?12:10,fill:`none`,stroke:`currentColor`,strokeWidth:e?1.8:1.2,opacity:e?.95:.55}),(0,Q.jsx)(`ellipse`,{cx:`50`,cy:`22`,rx:e?32:26,ry:e?9:7,fill:`none`,stroke:`currentColor`,strokeWidth:`0.7`,opacity:`0.4`,strokeDasharray:`2 3`}),t?(0,Q.jsx)(`ellipse`,{cx:`50`,cy:`22`,rx:`44`,ry:`13.5`,fill:`none`,stroke:`currentColor`,strokeWidth:`1`,opacity:`0.85`}):null]})}function Fc({unit:e,selected:t,validTarget:n,targeting:r,attacking:i,inspecting:a,signalCarrier:o,interceptTarget:s=!1,arriving:c=!1,hitReacting:l=!1,travelGhost:u=!1,shownHp:d,facingTarget:f,idleTarget:p}){let m=Si(e.c,e.r),h=d??e.hp,g=Z(e=>e.inspectUnit),_=Z(e=>e.selectTarget),v=Z(e=>e.busy),b=Dc(e,Z(e=>e.identity)),x=!!bc(e,`front`),[S,C]=(0,y.useState)(!1),w=s?`COURIER`:o?`TRACE TARGET`:e.role===`leader`?`COMMANDER`:e.archetype,T=[`t-token`,e.team,Ac(e),e.id.startsWith(`pet:`)?`pet-actor`:``,c?`is-arriving`:``,b&&!S?`directional-alpha`:``,x&&!S?`directional-hound`:``,e.defeated&&h<=0?`defeated`:``,e.hasActed?`acted`:``,t?`selected active`:``,a?`inspect`:``,r&&!n&&!t?`subdued`:``,r&&n?`targetable`:``,i?`attacking`:``,l?`hit-reacting`:``,u?`travel-ghost`:``,o?`trace-carrier`:``,e.role===`leader`?`boss-target`:``,`depth-${Math.max(0,Math.min(4,Math.floor(e.r*4/(Oe-1))))}`,e.c<=1?`edge-left`:``,e.c>=De-2?`edge-right`:``].filter(Boolean).join(` `),E=(0,y.useRef)({c:e.c,r:e.r}),[D,O]=(0,y.useState)(),[k,ee]=(0,y.useState)(`front`),A=(b||x)&&!S;(0,y.useLayoutEffect)(()=>{let t=E.current,n={c:e.c,r:e.r};if(E.current=n,!A){O(void 0);return}if(t.c===n.c&&t.r===n.r)return;O(wc(t,n,`front`));let r=window.setTimeout(()=>O(void 0),280);return()=>window.clearTimeout(r)},[A,e.c,e.r]);let j=f??p,te=D??(j?wc(e,j,k):k);(0,y.useLayoutEffect)(()=>{A&&ee(te)},[A,te]);let M=!S&&b?Ec(te):!S&&x?bc(e,te):i&&e.attackSprite?e.attackSprite:e.sprite;return(0,Q.jsxs)(Q.Fragment,{children:[(0,Q.jsxs)(`div`,{className:T,style:{left:`${m.x}%`,top:`${m.y}%`,zIndex:4+e.r*4+(t?2:0)},children:[(0,Q.jsx)(Pc,{selected:t,guarding:e.statuses.some(e=>e.type===`GUARD`)&&!e.defeated}),r&&n&&!e.defeated?(0,Q.jsxs)(`span`,{className:`t-target-reticle ${e.team}`,"aria-hidden":`true`,children:[(0,Q.jsx)(`i`,{}),(0,Q.jsx)(`i`,{}),(0,Q.jsx)(`i`,{}),(0,Q.jsx)(`i`,{})]}):null,w&&!e.defeated?(0,Q.jsx)(`span`,{className:`t-enemy-archetype t-archetype-${w.toLowerCase().replaceAll(` `,`-`)}`,children:w}):null,b&&!S?(0,Q.jsx)(`span`,{className:`t-alpha-ground-shadow`,"aria-hidden":`true`}):null,(0,Q.jsx)(`img`,{className:`body`,src:M,alt:``,draggable:!1,onError:!S&&(b||x)?()=>C(!0):void 0}),h<=0?null:(0,Q.jsxs)(`div`,{className:`t-plate`,children:[(0,Q.jsx)(`div`,{className:`t-plate-name`,children:(0,Q.jsx)(`span`,{children:e.name})}),(0,Q.jsxs)(`div`,{className:`t-hp`,children:[(0,Q.jsx)(`div`,{className:`t-hp-bar`,children:(0,Q.jsx)(`i`,{style:{width:`${h/e.maxHp*100}%`}})}),(0,Q.jsxs)(`span`,{className:`t-hp-num`,children:[h,`/`,e.maxHp]})]}),e.statuses.length?(0,Q.jsx)(`div`,{className:`t-chips`,children:e.statuses.slice(0,3).map(e=>(0,Q.jsx)(`span`,{className:`t-chip ${kc(e.type)?`buff`:`debuff`}`,children:li[e.type]},e.id))}):null,o&&!e.defeated?(0,Q.jsx)(`div`,{className:`t-chips`,children:(0,Q.jsx)(`span`,{className:`t-chip buff`,children:`TRACE`})}):null]})]}),(0,Q.jsx)(`button`,{type:`button`,className:`t-hit t-unit-hit${r&&n?` is-legal-target`:``}`,disabled:v||e.defeated,"data-unit-id":e.id,style:{left:`${m.x}%`,top:`${m.y}%`,...cc(e.r,De,Oe)},"aria-label":`${e.name}. ${h}/${e.maxHp} HP${r&&n?`. Legal target`:``}`,onClick:t=>{t.detail===0&&(r&&n?_(e.id):g(e.id))},onPointerDown:t=>{t.stopPropagation(),ro(),r&&n?_(e.id):g(e.id)}})]})}function Ic({unit:e}){let[t,n]=(0,y.useState)(!1),r=e.portrait||e.sprite;return e.role===`alpha`||e.defId===`alpha`||e.id===`alpha`?(0,Q.jsx)(Os,{className:`t-status-portrait`,fallbackUrl:r}):(0,Q.jsxs)(`span`,{className:`t-status-portrait`,"aria-hidden":`true`,children:[!t&&r?(0,Q.jsx)(`img`,{src:r,alt:``,onError:()=>n(!0)},r):null,(0,Q.jsx)(he,{className:`t-status-portrait-fallback`})]})}function Lc(){let e=Z(e=>e.battle.inspectId),t=Z(e=>e.battle.activeId),n=Z(e=>e.battle.units),r=Z(e=>e.displayHp),i=Z(e=>e.identity),a=Z(e=>e.progression?.equippedPet),o=Z(e=>e.progression),s=Z(e=>e.currentRunKey),[c,l]=(0,y.useState)(!1),u=n.find(e=>e.id===t)||n.find(e=>e.team===`ally`&&!e.defeated),d=n.find(t=>t.id===e);if(!u)return null;let f=r[u.id]??u.hp,p=u.role===`alpha`||u.defId===`alpha`||u.id===`alpha`,m=Sc(o,s),h=p?m?.profile.alpha:m?.petDeployed&&m.profile.pet&&u.id===`pet:${m.profile.pet.id}`?m.profile.pet:null,g=p?Oc():null,_=p?[g==null?null:`Lv ${g}`,i.skinName||i.armorLabel||i.weaponLabel].filter(Boolean).join(` · `):``,v=ii(u),b=ai(u),x=u.statuses.find(e=>!kc(e.type))??u.statuses[0],S=u.statuses.map(e=>li[e.type]).join(`, `),C=`${h?`SERVER-LOCKED V3 · MAX HP ${h.hp} · ATK ${h.atk} · DEF ${h.def} · SPD ${h.spd} · `:``}${d&&d.id!==u.id?`${d.name} ${r[d.id]??d.hp}/${d.maxHp} HP · `:``}${S?`${S} · `:``}LIVE ATK ${v} · DEF ${b} · SPD ${oi(u)} · MOV ${u.move}${_?` · ${_}`:``}`;return(0,Q.jsxs)(`button`,{type:`button`,className:`t-status t-hud-card ${c?`is-expanded`:``} ${u.team}${p?` is-alpha`:``}`,onClick:()=>l(e=>!e),"aria-expanded":c,"aria-label":`Acting unit: ${u.name}, ${f} of ${u.maxHp} HP. ${c?C+`. Tap to close details`:`${h?`Server-confirmed V3 power. `:``}${S?S+`. `:``}Toggle combat details`}`,children:[(0,Q.jsx)(Ic,{unit:u},u.id),(0,Q.jsxs)(`div`,{className:`t-status-main`,children:[(0,Q.jsxs)(`div`,{className:`t-status-head`,children:[(0,Q.jsx)(`div`,{className:`t-status-name`,children:u.name}),h?(0,Q.jsx)(`span`,{className:`t-run-power-chip`,title:`Server-frozen Combat Profile V3 for this accepted run`,children:`V3`}):null,x?(0,Q.jsx)(`span`,{className:`t-chip t-status-effect ${kc(x.type)?`buff`:`debuff`}`,children:li[x.type]}):null,p&&a?(0,Q.jsx)(`span`,{className:`t-status-pet`,title:a.name,children:(0,Q.jsx)(he,{className:`t-ico`,"aria-hidden":`true`})}):null]}),po(u)?(0,Q.jsxs)(`span`,{className:`t-combat-identity t-identity-${so(u)}`,children:[vc(u.defId,u.growth?.discipline)?(0,Q.jsx)(`img`,{className:`t-combat-emblem`,src:vc(u.defId,u.growth?.discipline),alt:``,onError:e=>{e.currentTarget.style.display=`none`}}):null,po(u)]}):null,_?(0,Q.jsx)(`div`,{className:`t-status-kit`,children:_}):null,(0,Q.jsxs)(`div`,{className:`t-status-mods`,children:[(0,Q.jsx)(`span`,{children:Nc(`ATK`,v,u.atk)}),(0,Q.jsx)(`span`,{children:Nc(`DEF`,b,u.def)})]}),(0,Q.jsxs)(`div`,{className:`t-hp`,children:[(0,Q.jsx)(`div`,{className:`t-hp-bar`,children:(0,Q.jsx)(`i`,{style:{width:`${f/u.maxHp*100}%`}})}),(0,Q.jsxs)(`span`,{className:`t-hp-num`,children:[f,`/`,u.maxHp]})]}),u.statuses.length?(0,Q.jsx)(`div`,{className:`t-chips`,children:u.statuses.slice(0,3).map(e=>(0,Q.jsx)(`span`,{className:`t-chip ${kc(e.type)?`buff`:`debuff`}`,children:li[e.type]},e.id))}):null]}),(0,Q.jsx)(`span`,{className:`t-status-detail`,children:C}),(0,Q.jsxs)(`dl`,{className:`t-status-stats`,children:[(0,Q.jsxs)(`div`,{children:[(0,Q.jsx)(`dt`,{children:`ATK`}),(0,Q.jsx)(`dd`,{children:v})]}),(0,Q.jsxs)(`div`,{children:[(0,Q.jsx)(`dt`,{children:`DEF`}),(0,Q.jsx)(`dd`,{children:b})]}),(0,Q.jsxs)(`div`,{children:[(0,Q.jsx)(`dt`,{children:`SPD`}),(0,Q.jsx)(`dd`,{children:oi(u)})]}),(0,Q.jsxs)(`div`,{children:[(0,Q.jsx)(`dt`,{children:`MOV`}),(0,Q.jsx)(`dd`,{children:u.move})]})]})]})}function Rc(){let e=Z(e=>e.battle),[t,n]=(0,y.useState)(!1),r=Z(e=>e.selectedMissionId),i=Z(e=>e.selectedTrialLevel),a=i===null?W(r):is(i,1),o=Z(e=>e.currentFieldContext),s=Z(e=>e.onboardingEnabled),c=Z(e=>e.onboardingStageId),l=!a&&s,u=l?qo(!0,c):null,d=l?ic(e,c):null,f=ct(e),p=a?Sr(e):null,m=Cr(e),h=e.objective,g=e.reinforcement,_=a?Xs(a,o):null,v=!!(_?.delayed&&g&&!g.spawned&&_.actualRound===g.triggerRound);if(!f&&!a?.challenge&&!h&&!l)return null;let b=h?.type===`RECOVER`&&!rt(e),x=h?.type===`RECOVER`?b?`Recover — Signal Jammed`:`Recover — Signal Open`:h?.type===`SURVIVE`?`Survive`:h?.type===`HOLD`?h.relayRoute?`Crosslink`:`Hold`:h?.type===`INTERCEPT`?`Intercept`:h?.type===`BOSS`?`Defeat Commander`:l?c===`solo-1`?`DEFEAT THE SCOUT`:c===`solo-2`?`DEFEAT BOTH SCOUTS`:`DEFEAT HOSTILES`:a?.name||`Objective`,S=h?.type===`RECOVER`?b?Dr(e).action:`Reach the relay and recover`:f,C=[e.directive?.supportCooldownExtra?`Support cooldowns +${e.directive.supportCooldownExtra}`:``,e.directive?.maxRounds?`${Math.max(0,e.directive.maxRounds-e.round+1)} rounds left`:``].filter(Boolean).join(` · `),w=h&&(h.type===`HOLD`||h.type===`SURVIVE`)?h.duration:a?.challenge?.type===`TURN_LIMIT`?a.challenge.limit:null,T=l?d?.copy||u?.teaching||``:`${m.action}${S&&h?.type!==`RECOVER`?` ${S}`:``}${C?` · ${C}`:``}`,E=!l&&h?.type===`RECOVER`?h.completed?`RELAY RECOVERED`:h.squadExtractionRadius==null?`RECOVER RELAY`:`PACK EXTRACTION`:!l&&h?.type===`INTERCEPT`?`INTERCEPT COURIER`:p||x,D=l?d?.title||`DEFEAT HOSTILES`:h?.type===`RECOVER`&&h.completed?`OBJECTIVE COMPLETE`:h?.type===`INTERCEPT`?p===`COURIER STOPPED`?p:`BEFORE THE EXIT`:m.status;return(0,Q.jsxs)(`button`,{type:`button`,className:`t-obj-chip t-hud-card ${l?`is-training`:``} ${t?`is-expanded`:``}`,onClick:()=>n(e=>!e),"aria-expanded":t,"aria-label":`Mission objective: ${p||x}. ${t?T+` Tap to close details.`:(d?.title||m.status)+`. Tap for details.`}`,children:[(0,Q.jsx)(`strong`,{children:E}),(0,Q.jsx)(`span`,{className:`t-objective-summary`,"data-objective-state":h?.type===`HOLD`?D:void 0,children:D},E+D),(0,Q.jsx)(`span`,{className:`t-objective-detail`,children:T}),(0,Q.jsx)(`span`,{className:`t-objective-directive`,children:m.status}),(0,Q.jsx)(`small`,{className:`t-objective-action`,children:m.action}),v?(0,Q.jsxs)(`small`,{"data-player-voice-hound":`true`,children:[`HOUND HELD BACK! · ARRIVES ROUND `,g.triggerRound]}):null,S?(0,Q.jsxs)(`span`,{children:[S,C?` · ${C}`:``]}):C?(0,Q.jsx)(`span`,{children:C}):null,a?.challenge?(0,Q.jsxs)(`small`,{children:[`OPTIONAL / `,a.challenge.label]}):null,w?(0,Q.jsxs)(`div`,{className:`t-obj-rounds`,children:[(0,Q.jsx)(`em`,{children:h?.type===`HOLD`||h?.type===`SURVIVE`?`${m.progress}/${m.total} CONTROL`:`Round ${e.round}/${w}`}),(0,Q.jsx)(`span`,{className:`t-obj-dots`,"aria-hidden":`true`,children:Array.from({length:Math.min(w,8)},(t,n)=>(0,Q.jsx)(`i`,{className:n<(h?.type===`HOLD`||h?.type===`SURVIVE`?h.progress:e.round)?`on`:``},n))})]}):null]})}function zc({actionStates:e,usedSkillId:t}){let n=Z(e=>e.battle),r=Z(e=>e.busy),i=Z(e=>e.selectSkill),a=Z(e=>e.selectRecover),o=n.units.find(e=>e.id===n.activeId),s=!(!o||o.team!==`ally`||o.hasActed||o.defeated||r||n.outcome!==`ongoing`),c=o?qi(n,o):[],l=n.objective?.type===`RECOVER`&&!n.objective.completed,u=Ga(n);return o?.team===`enemy`?(0,Q.jsx)(`div`,{className:`t-actions t-actions-enemy`,"aria-live":`polite`,children:(0,Q.jsxs)(`div`,{className:`t-enemy-command`,children:[(0,Q.jsx)(ye,{className:`t-enemy-command-icon`,"aria-hidden":`true`}),(0,Q.jsx)(`span`,{children:`ENEMY ACTION`}),(0,Q.jsx)(`small`,{children:o.name})]})}):(0,Q.jsxs)(`div`,{className:`t-actions${l?` has-obj`:``}`,children:[[0,1,2].map(r=>{let a=c[r],l=n.actionSkillId&&a&&n.actionSkillId===a.id,u=a&&!a.ready,d=a?mc(a):null,f=a&&a.id===t?`USED`:e.find(e=>e.id===a?.id)?.reason||`WAIT`,p=f===`CANCEL`?`AIMING`:f,m=a&&o?uo(o,a.id):`base`,h=a&&o?fo(o,a.id):null;return(0,Q.jsxs)(`button`,{type:`button`,className:`t-act t-growth-${m} ${l?`on`:``} ${u?`cooling`:``} ${d?`kind-${d.archetype} fx-${d.effectClass}`:``}`,disabled:!s||!a||!!u,"aria-pressed":!!l,"aria-label":a?`${a.slot} ${a.name}. ${h?h+`. `:``}${f===`CANCEL`?`Targeting. Tap again to cancel`:f}. ${a.desc}`:`Empty slot A${r+1}`,onClick:()=>{a&&(ro(),i(a.id))},children:[(0,Q.jsxs)(`span`,{className:`t-act-keyline`,"aria-hidden":`true`,children:[(0,Q.jsx)(`span`,{className:`slot`,children:a?.slot??`A${r+1}`}),h?(0,Q.jsx)(`span`,{className:`t-skill-rank${h===`SIGNATURE`?` is-signature`:``}`,title:h,children:h===`SIGNATURE`?`SIG`:h===`TRAINED`?`TRN`:h}):null]}),(0,Q.jsx)(Mc,{src:a?Ms(a.id):null,archetype:d?.archetype}),(0,Q.jsx)(`span`,{className:`name`,children:a?.name??`—`}),(0,Q.jsx)(`span`,{className:`meta`,"data-action-state":f,children:p})]},r)}),l?(0,Q.jsxs)(`button`,{type:`button`,className:`t-act t-act-obj kind-${hc.archetype} fx-${hc.effectClass} ${u?`on`:`cooling`}`,disabled:!s||!u,"aria-label":u&&s?`Recover. Complete objective, consumes action.`:`Recover unavailable. ${Dr(n).action}`,onClick:()=>{ro(),a()},children:[(0,Q.jsx)(`span`,{className:`t-act-keyline`,"aria-hidden":`true`,children:(0,Q.jsx)(`span`,{className:`slot`,children:`OBJ`})}),(0,Q.jsx)(Mc,{src:Ns(`recover`),archetype:hc.archetype}),(0,Q.jsx)(`span`,{className:`name`,children:`RECOVER`}),(0,Q.jsx)(`span`,{className:`meta`,children:s?u?`READY`:rt(n)?`GET CLOSER`:`ROUND ${Math.ceil(n.round/(n.directive?.recoverEveryRounds||1))*(n.directive?.recoverEveryRounds||1)}`:`WAIT`})]}):null]})}function Bc(e,t){let n=(0,y.useRef)(void 0),[r,i]=(0,y.useState)(),a=e?.team===`ally`?e.id:void 0,o=e?.c,s=e?.r,c=e?.hasMoved;return(0,y.useLayoutEffect)(()=>{let e=n.current;n.current=a&&o!==void 0&&s!==void 0?{id:a,turn:t,cell:{c:o,r:s}}:void 0;let r=n.current,l=r&&e&&e.id===r.id&&e.turn===t&&(e.cell.c!==r.cell.c||e.cell.r!==r.cell.r);i(c&&l?{from:e.cell,to:r.cell}:void 0)},[a,t,o,s,c]),{trace:r,clearTrace:()=>i(void 0)}}function Vc(){let e=Z(e=>e.battle),t=Z(e=>e.activeRulesetVersion),n=e.units,r=Z(e=>e.battle.mode),i=Z(e=>e.battle.activeId),a=Z(e=>e.battle.inspectId),o=Z(e=>e.battle.actionSkillId),s=Z(e=>e.lastActionSkillId),c=Z(e=>e.combatMoment),l=Z(e=>e.combatFx),u=Z(e=>e.enemyScene),d=Z(e=>e.displayHp),f=new Set(l.filter(e=>bo(e.name)===`dash`&&e.actorId).map(e=>e.actorId)),p=Z(e=>e.banner),m=Z(e=>e.floats),h=Z(e=>e.consequences),g=Z(e=>e.threats),_=Z(e=>e.attackingId),v=Z(e=>e.impactId),b=Z(e=>e.impactKey),x=Z(e=>e.muted),S=Z(e=>e.busy),C=Z(e=>e.selectCell),w=Z(e=>e.skipTurn),T=Z(e=>e.cancel),E=Z(e=>e.toggleMute),D=Z(e=>e.battle.objective),O=W(Z(e=>e.selectedMissionId)),k=Z(e=>e.onboardingEnabled),ee=Z(e=>e.onboardingStageId),A=Z(e=>e.battle.reinforcement),j=Z(e=>e.battle.signalCarrierId),te=Z(e=>e.identity),M=(0,y.useMemo)(()=>new Map(n.filter(e=>!e.defeated&&(Dc(e,te)||bc(e,`front`))).map(e=>[e.id,Tc(e,n)])),[n,te]),N=(0,y.useMemo)(()=>new Set(Ts().map(e=>mi(e.c,e.r))),[n,i,r,S,o]),P=sc({battle:e,activeRulesetVersion:t,busy:S,threats:g,combatMoment:c,combatFx:l,consequences:h,floats:m,banner:p,mission:O,onboardingStageId:k&&!O?ee:null}),F=P.threats,I=P.actor,{trace:ne,clearTrace:L}=Bc(I,e.unitTurn),R=ne&&Si(ne.from.c,ne.from.r),z=ne&&Si(ne.to.c,ne.to.r),B=o?dn(o):null,re=B?mc(B):null,ie=s?dn(s):null,ae=ie?mc(ie):null,V=P.interactive,oe=n.find(e=>e.id===v),se=oe?Si(oe.c,oe.r):null;return(0,Q.jsxs)(`div`,{className:`t-battle${k&&!O?` is-foundation-training`:``}${Ee?` battlefield-vnext-preview`:``}${re?` is-focusing focus-${re.targetClass} effect-${re.effectClass}`:``}`,"data-projection":`relay-overhead-v1`,"data-impact-kind":ae?.effectClass||`damage`,"data-decision":P.mode,children:[(0,Q.jsxs)(`header`,{className:`t-top t-battle-hud-rail`,"aria-label":`Battle status and mission`,children:[(0,Q.jsx)(Lc,{}),(0,Q.jsx)(Rc,{})]}),(0,Q.jsx)(`div`,{className:`t-field-wrap`,children:(0,Q.jsxs)(`div`,{className:`t-field`,onPointerDown:e=>{S||e.target===e.currentTarget&&T()},children:[(0,Q.jsx)(`img`,{className:`t-field-art`,src:ft(O).art,alt:``}),(0,Q.jsx)(`div`,{className:`t-field-grade`}),(0,Q.jsx)(`div`,{className:`t-vignette`}),(0,Q.jsxs)(`div`,{className:`t-command-cue${c?` t-master-moment-cue`:``}`,role:`status`,"aria-live":`polite`,"aria-atomic":`true`,children:[(0,Q.jsxs)(`p`,{children:[(0,Q.jsx)(`strong`,{children:P.title}),(0,Q.jsx)(`span`,{children:P.detail})]}),P.mode===`REACT`&&P.result?(0,Q.jsx)(`small`,{className:`t-command-confirmation`,children:P.result}):null]}),(0,Q.jsx)(`div`,{className:`t-grid`,"aria-hidden":`true`,children:Array.from({length:De*Oe},(e,t)=>{let n=t%De,r=Math.floor(t/De),i=Si(n,r);return(0,Q.jsx)(`i`,{style:{left:`${i.x}%`,top:`${i.y}%`}},`g-${n}-${r}`)})}),R&&z&&!P.targeting&&!S?(0,Q.jsx)(`svg`,{className:`t-move-trace`,viewBox:`0 0 100 100`,preserveAspectRatio:`none`,"aria-hidden":`true`,onAnimationEnd:L,children:(0,Q.jsx)(`line`,{x1:R.x,y1:R.y,x2:z.x,y2:z.y})}):null,F.length>0?(0,Q.jsx)(`svg`,{className:`t-threat-tethers`,viewBox:`0 0 100 100`,preserveAspectRatio:`none`,"aria-hidden":`true`,children:F.map((e,t)=>{let r=n.find(t=>t.id===e.enemyId&&!t.defeated),i=e.impactTiles;if(!r||!i.length)return null;let a=Si(r.c,r.r),o=e.targetTile??(e.targetUnitId?n.find(t=>t.id===e.targetUnitId):null)??{c:i.reduce((e,t)=>e+t.c,0)/i.length,r:i.reduce((e,t)=>e+t.r,0)/i.length},s=Si(o.c,o.r);return a.x===s.x&&a.y===s.y?null:(0,Q.jsxs)(`g`,{className:`t-threat-tether`,"data-threat-index":t+1,children:[(0,Q.jsx)(`line`,{className:`t-threat-tether-halo`,x1:a.x,y1:a.y,x2:s.x,y2:s.y}),(0,Q.jsx)(`line`,{className:`t-threat-tether-core`,x1:a.x,y1:a.y,x2:s.x,y2:s.y}),(0,Q.jsx)(`circle`,{className:`t-threat-tether-end`,cx:s.x,cy:s.y,r:`.35`})]},e.id)})}):null,F.flatMap((e,t)=>e.impactTiles.map((n,r)=>{let i=Si(n.c,n.r);return(0,Q.jsxs)(`div`,{className:`t-threat-tile t-threat-tile-v2`,"data-threat-index":t+1,style:{left:i.x+`%`,top:i.y+`%`,...cc(n.r,De,Oe)},"aria-hidden":`true`,children:[(0,Q.jsx)(`i`,{className:`t-threat-corner tl`}),(0,Q.jsx)(`i`,{className:`t-threat-corner tr`}),(0,Q.jsx)(`i`,{className:`t-threat-corner bl`}),(0,Q.jsx)(`i`,{className:`t-threat-corner br`}),(0,Q.jsx)(`span`,{children:t+1})]},e.id+`:`+r)})),P.sources.map(e=>{let t=n.find(t=>t.id===e.id);if(!t)return null;let r=Si(t.c,t.r);return(0,Q.jsx)(`span`,{className:`t-threat-source`,style:{left:`${r.x}%`,top:`${r.y}%`},"aria-label":`Threat ${e.label}: ${e.name}, ${e.effect}`,children:e.label},e.id)}),D?.type===`HOLD`&&D.terminal?Array.from({length:De*Oe},(e,t)=>({c:t%De,r:Math.floor(t/De)})).filter(e=>Math.abs(e.c-D.terminal.c)+Math.abs(e.r-D.terminal.r)<=(D.radius??0)).map(e=>{let t=Si(e.c,e.r),n=D.holderRadius===0,r=e.c===D.terminal.c&&e.r===D.terminal.r;return(0,Q.jsx)(`div`,{className:`t-hold-cell ${n?r?`is-lockdown-anchor`:`is-contest-zone`:`is-hold-area`}${r?` is-hold-center`:``}`,style:{left:`${t.x}%`,top:`${t.y}%`},"aria-label":n?r?`Required relay holder tile`:`Enemy contest area`:`Hold area`,children:r?D.relayRoute?`R${Math.min(D.progress+1,D.duration)}`:`HOLD`:``},`hold-${e.c}-${e.r}`)}):null,D?.type===`HOLD`&&D.relayPressure?.flank?(()=>{let{tile:e,activeRound:t}=D.relayPressure.flank,n=Si(e.c,e.r);return(0,Q.jsx)(`div`,{className:`t-hold-cell is-lockdown-anchor is-hold-center`,style:{left:`${n.x}%`,top:`${n.y}%`},"aria-label":`Flank relay, required from round ${t}`,children:`FLANK`})})():null,D?.type===`RECOVER`?(()=>{let e=Si(D.terminal.c,D.terminal.r);return(0,Q.jsxs)(`div`,{className:`t-terminal ${D.completed?`complete`:``}`,style:{left:`${e.x}%`,top:`${e.y}%`},"aria-label":`Relay terminal`,children:[(0,Q.jsx)(`img`,{className:`t-objective-marker-art`,src:Cc.signalRecovery,alt:``}),(0,Q.jsx)(`span`,{children:`RELAY`}),(0,Q.jsx)(`small`,{children:D.completed?`RECOVERED`:`RECOVER`})]})})():null,D?.type===`INTERCEPT`?(()=>{let e=Si(D.exit.c,D.exit.r);return(0,Q.jsxs)(`div`,{className:`t-terminal is-courier-exit`,style:{left:`${e.x}%`,top:`${e.y}%`},"aria-label":`Courier escape exit`,children:[(0,Q.jsx)(me,{"aria-hidden":`true`}),(0,Q.jsx)(`span`,{children:`EXIT`})]})})():null,A?.telegraphed&&!A.spawned?(()=>{let e=Si(A.spawn.c,A.spawn.r);return(0,Q.jsxs)(`div`,{className:`t-reinforcement-marker`,style:{left:`${e.x}%`,top:`${e.y}%`},children:[(0,Q.jsx)(`img`,{className:`t-objective-marker-art`,src:Cc.reinforcementWarning,alt:``}),(0,Q.jsx)(`span`,{children:`HOUND INCOMING!`}),(0,Q.jsxs)(`small`,{children:[`ROUND `,A.triggerRound]})]})})():null,Array.from({length:De*Oe},(e,t)=>{let n=t%De,r=Math.floor(t/De),i=mi(n,r);if(!P.interactive||!N.has(i))return null;let a=Si(n,r);return(0,Q.jsx)(`button`,{type:`button`,className:`t-cell move`,"data-threatened":P.danger.has(i)||void 0,style:{left:`${a.x}%`,top:`${a.y}%`,...cc(r,De,Oe)},"aria-label":`Move to ${n},${r}${P.danger.has(i)?`. Threatened cell`:``}`,onClick:e=>{e.detail===0&&C(n,r)},onPointerDown:e=>{e.stopPropagation(),ro(),C(n,r)}},i)}),n.slice().sort((e,t)=>e.r-t.r||e.c-t.c).map(e=>{let t=S?l.find(t=>t.actorId===e.id&&(t.terminal||t.targetId&&t.targetId!==e.id)):void 0,r=u?.actorId===e.id?u.to:t?.terminal??n.find(e=>e.id===t?.targetId);return(0,Q.jsx)(Fc,{unit:e,selected:e.id===i,validTarget:P.targetIds.includes(e.id),targeting:P.targeting,attacking:e.id===_,hitReacting:e.id===v&&b>0,shownHp:d[e.id],travelGhost:f.has(e.id),inspecting:e.id===a,signalCarrier:e.id===j,interceptTarget:D?.type===`INTERCEPT`&&e.id===D.targetId,arriving:!!A?.spawned&&e.id===A.spawn.id,facingTarget:r,idleTarget:M.get(e.id)},e.id)}),u&&(()=>{let e=Si(u.from.c,u.from.r),t=Si(u.to.c,u.to.r),r=n.find(e=>e.id===u.actorId),i={"--enemy-x":e.x+`%`,"--enemy-y":e.y+`%`,"--enemy-target-x":t.x+`%`,"--enemy-target-y":t.y+`%`,"--enemy-duration":u.durationMs+`ms`};return(0,Q.jsx)(`div`,{className:`t-hostile-scene t-hostile-${u.style}`,style:i,"aria-hidden":`true`,children:[`melee`,`heavy`].includes(u.style)&&r?(0,Q.jsx)(`img`,{src:bc(r,wc(u.from,u.to,`front`))||r.attackSprite||r.sprite,alt:``,onError:e=>{e.currentTarget.onerror=null,e.currentTarget.src=r.attackSprite||r.sprite}}):(0,Q.jsx)(`svg`,{viewBox:`0 0 100 100`,preserveAspectRatio:`none`,children:(0,Q.jsx)(`line`,{x1:e.x,y1:e.y,x2:t.x,y2:t.y})})},u.id)})(),P.primaryFx.map(e=>{let t=e.actorId?n.find(t=>t.id===e.actorId):null,r=e.terminal||n.find(t=>t.id===e.targetId);if(!t||!e.from||!r||e.from.c===r.c&&e.from.r===r.r)return null;let i=Si(e.from.c,e.from.r),a=Si(r.c,r.r),o=bo(e.name);if(o===`none`)return null;let s=o===`beam`;return(0,Q.jsx)(`div`,{className:`t-choreo-travel ${s?`ranged`:`melee`}`,style:{"--from-x":i.x+`%`,"--from-y":i.y+`%`,"--to-x":a.x+`%`,"--to-y":a.y+`%`,"--travel-ms":e.durationMs+`ms`},"aria-hidden":`true`,children:s?(0,Q.jsx)(`svg`,{className:`t-choreo-line`,viewBox:`0 0 100 100`,preserveAspectRatio:`none`,children:(0,Q.jsx)(`line`,{x1:i.x,y1:i.y,x2:a.x,y2:a.y})}):(0,Q.jsx)(`img`,{className:`t-choreo-actor`,src:Dc(t,te)?Ec(wc(e.from,r,`front`)):bc(t,wc(e.from,r,`front`))||t.attackSprite||t.sprite,alt:``,onError:e=>{(Dc(t,te)||bc(t,`front`))&&(e.currentTarget.onerror=null,e.currentTarget.src=t.attackSprite||t.sprite)}})},`travel-`+e.id)}),P.primaryFx.map(e=>{let t=n.find(t=>t.id===e.targetId),r=e.terminal||t;if(!r)return null;let i=Si(r.c,r.r);return(0,Q.jsx)(`div`,{className:`t-sprite-fx ${[`alpha_howl`,`shadow_pack_heal_def`,`shadow_pack_def_only`,`shadow_pack_guard`].includes(e.name)?`fx-area fx-support`:``} ${yo(e.name)}`,style:{left:i.x+`%`,top:i.y+`%`},"aria-hidden":`true`,children:(0,Q.jsx)(`div`,{className:`t-sprite-fx-clip`,style:{animationDuration:e.durationMs+`ms`},children:(0,Q.jsx)(`div`,{className:`t-sprite-fx-sheet`,style:{backgroundImage:`url("${go}${e.name}.webp")`,animationDuration:e.durationMs+`ms`}})})},e.id)}),c&&P.showFallbackMasterFx&&(()=>{let e=n.find(e=>e.id===c.targetId);if(!e)return null;let t=Si(e.c,e.r);return(0,Q.jsxs)(`div`,{className:`t-master-fx fx-affinity-${c.affinity} fx-tier-${c.tier} fx-mode-${c.mode}`,style:{left:`${t.x}%`,top:`${t.y}%`},"aria-hidden":`true`,children:[(0,Q.jsx)(`i`,{className:`t-master-fx-ring`}),(0,Q.jsx)(`i`,{className:`t-master-fx-core`})]},c.id)})(),h.map(e=>{let t=n.find(t=>t.id===e.unitId);if(!t)return null;let r=Si(t.c,t.r);return(0,Q.jsx)(`div`,{className:`t-consequence t-consequence-${e.kind}`,style:{left:`clamp(82px, ${r.x}%, calc(100% - 82px))`,top:`clamp(24px, ${r.y-14}%, calc(100% - 32px))`},"aria-hidden":`true`,children:e.label},e.id)}),m.map(e=>{let t=n.find(t=>t.id===e.unitId);if(!t)return null;let r=Si(t.c,t.r);return(0,Q.jsx)(`div`,{className:`t-float ${e.kind}`,style:{left:`${r.x}%`,top:`${r.y-6}%`},children:e.text},e.id)}),P.targeting&&P.targetIds.length?(0,Q.jsx)(`div`,{className:`t-target-assist`,role:`group`,"aria-label":`Large legal target buttons`,children:P.targetIds.map(e=>{let t=n.find(t=>t.id===e);return(0,Q.jsxs)(`button`,{type:`button`,onClick:t=>{t.stopPropagation(),ro(),Z.getState().selectTarget(e)},children:[(0,Q.jsx)(H,{"aria-hidden":`true`}),(0,Q.jsxs)(`span`,{children:[t.name,(0,Q.jsxs)(`small`,{children:[t.hp,`/`,t.maxHp,` HP`]})]})]},e)})}):null,se&&P.showFallbackImpact?(0,Q.jsx)(`div`,{className:`t-impact t-impact-${ae?.effectClass||`damage`}`,style:{left:`${se.x}%`,top:`${se.y-4}%`}},b):null]})}),(0,Q.jsxs)(`footer`,{className:`t-dock${D?.type===`RECOVER`&&!D.completed?` has-recovery`:``}`,children:[(0,Q.jsx)(`button`,{type:`button`,className:`t-icon-btn`,"aria-label":P.targeting?`Cancel targeting`:x?`Unmute`:`Mute`,onClick:()=>{if(P.targeting){T();return}let e=!io();ao(e),E(),ro(),e||Y(`ui`)},children:P.targeting?(0,Q.jsxs)(`span`,{className:`t-cancel-label`,children:[`×`,(0,Q.jsx)(`small`,{children:`CANCEL`})]}):x?(0,Q.jsx)(Ce,{className:`t-ico`}):(0,Q.jsx)(Se,{className:`t-ico`})}),(0,Q.jsx)(zc,{actionStates:P.actions,usedSkillId:S&&I?.hasActed&&_===I.id?s:null}),(0,Q.jsxs)(`button`,{type:`button`,className:`t-btn t-skip`,disabled:!V,onClick:()=>{ro(),w()},children:[(0,Q.jsx)(Mc,{src:Ns(`skip`),fallback:`skip`}),`Skip`]})]})]})}function Hc(e){return{"REACH CONTROL":`PRESSURE +1 RANGE`,"WIDE SHELTER":`PACK SUPPORT +1 RANGE`,"RELAY SCOUT":`RECOVER FROM 2 CELLS`,RELENTLESS:`PRESSURE COOLDOWN -1 TURN`,"PIN DOWN":`PRESSURE DEBUFFS +1 TURN`,"STEADY HAND":`MEND COOLDOWN -1 TURN`,"SILENT SHELTER":`PACK SUPPORT: NO HEALING / IGNORE DISRUPTION`,"REACHING SNARE":`HAMSTRING +1 RANGE`,PATHFINDER:`MOVE +1 CELL`}[e.name]||e.copy}function Uc(e){return e.gained===3?`FIRST CLEAR + CHALLENGE`:e.progress<8?e.gained===2?`FIRST CLEAR`:`CHALLENGE`:`FIRST CLEAR / CHALLENGE / CAP REACHED`}function Wc(e,t){return e===`ally-02`?{label:`CNC`,sublabel:`RELAY SCOUT`}:e===`ally-03`?{label:`SHADOW`,sublabel:`STEALTH OPERATIVE`}:{label:`PET`,sublabel:t||`COMPANION`}}function Gc({snapshot:e}){let t=Z(e=>e.progression),n=Z(e=>e.progressionCommitPending||e.busy),r=Z(e=>e.selectMastery),i=t?.equippedPet,[a,o]=(0,y.useState)(`ally-02`),s=[`ally-02`,`ally-03`,...i?[`pet:${i.id}`]:[]];return(0,Q.jsxs)(`section`,{className:`t-panel t-brief-block t-pack-mastery t-pack-mastery-premium t-pack-mastery-v29`,"aria-label":`Pack Mastery`,children:[(0,Q.jsxs)(`div`,{className:`t-pack-head`,children:[(0,Q.jsxs)(`div`,{children:[(0,Q.jsx)(`div`,{className:`t-kicker`,children:`Your squad`}),(0,Q.jsx)(`h2`,{className:`t-title`,children:`PACK MASTERY`}),(0,Q.jsx)(`p`,{children:`Take companions into Field Ops to unlock permanent tactical abilities.`})]}),(0,Q.jsx)(`small`,{children:`First clear +2 · challenge +1`})]}),(0,Q.jsx)(`nav`,{className:`t-premium-mastery-roster`,"aria-label":`Select companion mastery`,children:s.map(e=>(0,Q.jsxs)(`button`,{type:`button`,className:a===e?`is-selected`:``,"aria-pressed":a===e,onClick:()=>o(e),children:[(0,Q.jsx)(`img`,{src:e.startsWith(`pet:`)?i?.img||k[`ally-03`].portrait:k[e].portrait,alt:``,onError:Ds}),(0,Q.jsx)(`strong`,{children:Wc(e,i?.name).label})]},e))}),(0,Q.jsx)(`div`,{className:`t-pack-list t-premium-mastery-selected`,children:s.map(o=>{let c=pn(o);if(!c||s.includes(a)&&o!==a||!s.includes(a)&&o!==s[0])return null;let l=mn(e||t?.packMastery,o),u=!!e||_n(t,o),d=l.stage>=3&&l.selected?c.options[l.selected]:null,f=Wc(o,i?.name),p=d||(l.stage>=2?c.trained:null),m=l.stage<2?3:l.stage<3?8:null,h=e?null:Js(o,{packMastery:t?.packMastery,kodaSidegrade:t?.kodaSidegrade,shadowSidegrade:t?.shadowSidegrade},i,t?.playerGrowth),g=e?[]:Ys(o,{packMastery:t?.packMastery,kodaSidegrade:t?.kodaSidegrade,shadowSidegrade:t?.shadowSidegrade},i,t?.playerGrowth),_=l.stage<2?Hc(c.trained):l.stage<3?`Choose a specialization`:`Foundation options unlocked`;return(0,Q.jsxs)(`article`,{className:`t-mastery-row t-mastery-premium-row t-mastery-card-v29`,"data-mastery-companion":o,children:[(0,Q.jsx)(`div`,{className:`t-mastery-avatar t-premium-avatar`,"aria-hidden":`true`,children:(0,Q.jsx)(`img`,{src:o.startsWith(`pet:`)?i?.img||k[`ally-03`].portrait:k[o].portrait,alt:``,onError:Ds})}),(0,Q.jsxs)(`div`,{className:`t-mastery-main`,children:[l.stage>=2?(0,Q.jsx)(`div`,{className:`t-mastery-combat-badge ${l.stage>=3?`is-signature`:`is-trained`}`,children:l.stage>=3?`SIGNATURE EVOLUTION · 8/8`:`AWAKENED · 3/8`}):null,(0,Q.jsxs)(`div`,{className:`t-mastery-topline`,children:[(0,Q.jsxs)(`div`,{children:[(0,Q.jsx)(`strong`,{children:f.label}),(0,Q.jsx)(`span`,{children:f.sublabel})]}),(0,Q.jsxs)(`div`,{className:`t-mastery-status`,children:[(0,Q.jsxs)(`span`,{children:[l.progress,`/8 MASTERY`]}),(0,Q.jsx)(`b`,{children:l.stage>=3?`MASTERED`:`STAGE ${l.stage}`})]})]}),(0,Q.jsx)(`div`,{className:`t-mastery-progressline`,children:(0,Q.jsx)(`progress`,{className:`t-progress`,"aria-label":`${c.name} mastery`,value:l.progress,max:8})}),l.veteran&&l.progress===8?(0,Q.jsxs)(`div`,{className:`t-growth-delta`,"data-veteran-mastery":o,children:[(0,Q.jsxs)(`strong`,{children:[`8/8 FOUNDATION COMPLETE → VETERAN `,l.veteran.credits,`/12`]}),(0,Q.jsx)(`progress`,{className:`t-progress`,value:l.veteran.credits,max:12,"aria-label":`Veteran Mastery`}),(0,Q.jsx)(`small`,{children:rn(l.veteran,o===`ally-03`?`SHADOW`:o.startsWith(`pet:`)?`PET`:`CNC`)}),(0,Q.jsx)(`small`,{children:l.veteran.lastCycle===t?.fieldOps?.board?.cycleId?`This rotation's credit is recorded. Your next eligible rotation can add one.`:`Next: win an Advanced eligible objective with this companion and all three allies standing.`}),(0,Q.jsx)(`b`,{children:an[o===`ally-03`?`SHADOW`:o.startsWith(`pet:`)?`PET`:`CNC`].name}),(0,Q.jsx)(`small`,{children:an[o===`ally-03`?`SHADOW`:o.startsWith(`pet:`)?`PET`:`CNC`].copy}),l.stage===4?(0,Q.jsx)(`button`,{type:`button`,className:`t-btn`,disabled:n||u,"aria-pressed":l.veteran.enabled,onClick:()=>void r(o,l.veteran.enabled?`VETERAN_OFF`:`VETERAN_ON`),children:l.veteran.enabled?`VETERAN OPTION ON · DISABLE`:`ENABLE VETERAN OPTION`}):(0,Q.jsx)(`small`,{children:`Unlock: 12 eligible rotation credits across both objective families. Participation, not verified skill-use proof.`})]}):null,(0,Q.jsxs)(`div`,{className:`t-mastery-now-next`,children:[(0,Q.jsxs)(`div`,{children:[(0,Q.jsx)(`span`,{className:`t-kicker`,children:`Active`}),(0,Q.jsx)(`strong`,{children:p?p.name:`NO MASTERY YET`}),(0,Q.jsx)(`small`,{children:p?o===`ally-03`&&l.selected===`A`&&t?.playerGrowth?.version===2&&t.playerGrowth.heroes.find(e=>e.heroId===o)?.discipline===`medic`?`MEND +8 BASE HEAL · COOLDOWN 1`:Hc(p):`Earn 3 Mastery to unlock the first ability.`})]}),(0,Q.jsxs)(`div`,{children:[(0,Q.jsx)(`span`,{className:`t-kicker`,children:`Next`}),(0,Q.jsx)(`strong`,{children:m?`AT ${m} MASTERY`:`FOUNDATION COMPLETE`}),(0,Q.jsx)(`small`,{children:_})]})]}),l.stage>=2?(0,Q.jsx)(`p`,{children:(0,Q.jsxs)(`small`,{children:[`TRAINED · `,c.trained.name,`: `,c.trained.copy]})}):null,l.stage>=3?(0,Q.jsxs)(`div`,{className:`t-growth-delta`,"aria-label":`Saved versus alternate Mastery`,children:[(0,Q.jsxs)(`small`,{children:[e?`FROZEN`:`SAVED`,` `,l.selected,` → ALTERNATE `,l.selected===`A`?`B`:`A`]}),g.length?g.map(e=>(0,Q.jsx)(`b`,{children:e},e)):(0,Q.jsx)(`small`,{children:e?`This run uses its frozen A/B. Compare alternatives in the War Table.`:`No additional effective change in this composition.`}),(0,Q.jsxs)(`small`,{children:[o===`ally-02`?`INTERCEPT: recharge sooner or keep control longer.`:o===`ally-03`?`HOLD: compare MEND timing against healing-free, disruption-safe shelter. MEDIC + STEADY HAND in V2 adds 8 base healing at the cooldown floor.`:`RECOVER / INTERCEPT: choose objective mobility or HAMSTRING reach.`,` Foundation 8/8 is complete. Veteran progress and its optional role capability appear below when supported by the server.`]})]}):null,h?(0,Q.jsxs)(`div`,{className:`t-growth-delta`,"aria-label":`Saved Pack Mastery power proof`,children:[(0,Q.jsxs)(`small`,{children:[`POWER PROOF · `,h.comparison]}),h.changes.map(e=>(0,Q.jsx)(`b`,{children:e},e))]}):null,(0,Q.jsxs)(`details`,{className:`t-detail t-mastery-detail`,children:[(0,Q.jsx)(`summary`,{children:l.stage>=3?`Specialization`:`Ability details`}),(0,Q.jsxs)(`p`,{children:[l.stage>=2?`TRAINED`:`AT 3 MASTERY`,`: `,c.trained.name,` / `,c.trained.copy]}),l.stage>=3?(0,Q.jsxs)(Q.Fragment,{children:[(0,Q.jsx)(`div`,{className:`t-brief-actions`,children:[`A`,`B`].map(e=>(0,Q.jsxs)(`button`,{type:`button`,className:`t-btn ${l.selected===e?`t-btn-primary`:``}`,"aria-pressed":l.selected===e,disabled:n||u,onClick:()=>void r(o,e),children:[c.options[e].name,l.selected===e?` / ACTIVE`:``]},e))}),[`A`,`B`].map(e=>(0,Q.jsx)(`p`,{children:(0,Q.jsxs)(`small`,{children:[c.options[e].name,`: `,o===`ally-03`&&e===`A`&&t?.playerGrowth?.version===2?`MEND cooldown -1, floor 1. With MEDIC at the floor: +8 base healing instead.`:c.options[e].copy]})},e))]}):(0,Q.jsx)(`p`,{children:(0,Q.jsx)(`small`,{children:`Specializations unlock at 8 Mastery.`})})]}),u?(0,Q.jsx)(`small`,{className:`t-mastery-locked`,children:`Finish this companion's current run before changing specialization.`}):null]})]},o)})}),i?null:(0,Q.jsx)(`small`,{className:`t-pack-pet-note`,children:`Equip a PET to add it to Pack Mastery.`})]})}function Kc({changes:e,victory:t}){return e?.length?(0,Q.jsxs)(`section`,{className:`t-mastery-feedback`,"aria-label":`Pack Mastery`,children:[(0,Q.jsx)(`div`,{className:`t-kicker`,children:`PACK MASTERY`}),e.map(e=>{let n=pn(e.unitId);return n?(0,Q.jsxs)(`div`,{className:`t-mastery-row t-mastery-reward ${e.beforeStage===e.stage?``:`is-unlock`}`,"data-mastery-unit":e.unitId,children:[(0,Q.jsxs)(`div`,{className:`t-mastery-heading`,children:[(0,Q.jsx)(`strong`,{children:n.name}),(0,Q.jsx)(`span`,{children:e.stage===3?`STAGE 3 COMPLETE`:`STAGE ${e.beforeStage===e.stage?``:`${e.beforeStage} → `}${e.stage}`}),e.gained>0||e.stage<3?(0,Q.jsxs)(`b`,{children:[`+`,e.gained,` MASTERY`]}):null]}),e.gained>0?(0,Q.jsx)(`small`,{children:Uc(e)}):null,(0,Q.jsx)(`progress`,{className:`t-progress`,"aria-label":`${n.name} mastery`,value:e.progress,max:8}),e.beforeStage<2&&e.stage>=2?(0,Q.jsxs)(`div`,{className:`t-mastery-unlock`,children:[(0,Q.jsxs)(`strong`,{children:[`AWAKENED · `,n.trained.name]}),(0,Q.jsx)(`p`,{children:n.trained.copy})]}):null,e.newOptions.length?(0,Q.jsxs)(`div`,{className:`t-mastery-unlock is-signature`,children:[(0,Q.jsx)(`strong`,{children:`SIGNATURE EVOLUTION · 8/8`}),(0,Q.jsxs)(`p`,{children:[n.options.A.name,` / `,n.options.B.name]}),(0,Q.jsx)(`p`,{children:`Specializations unlocked. Choose outside an active run.`})]}):null,e.veteran?(0,Q.jsxs)(`p`,{"data-veteran-delta":e.unitId,children:[`VETERAN `,e.veteran.before,` → `,e.veteran.after,`/12 · `,e.veteran.unlocked?`OPTION UNLOCKED`:e.veteran.reason.replaceAll(`_`,` `).toLowerCase()]}):null,!e.gained&&e.progress<8?(0,Q.jsx)(`small`,{children:t?`Award already earned. Try another mission or challenge.`:`Clear a Field Op to progress.`}):null]},e.unitId):null})]}):null}var qc=g(),Jc=`/images/tactical_ops/signal_atlas/v1`,Yc={atlasBackground:Jc+`/environments/atlas_relay_chamber.webp`,sectorBackground:Jc+`/environments/sector_signal_bay.webp`,coreBezel:Jc+`/core/relay_core_bezel.webp`,sectorFrame:Jc+`/frames/sector_plate.svg`,nodeFrame:Jc+`/frames/skill_node_bezel.svg`,inspectorFrame:Jc+`/frames/skill_inspector_frame.svg`,contact:Jc+`/trim/signal_contact.svg`},Xc={assault:Jc+`/sectors/emblem_assault.webp`,command:Jc+`/sectors/emblem_command.webp`,pursuit:Jc+`/sectors/emblem_pursuit.webp`,control:Jc+`/sectors/emblem_control.webp`,line:Jc+`/sectors/emblem_front_line.webp`,support:Jc+`/sectors/emblem_support.webp`};function Zc(e){return!!(e?.activeRunId||e?.chapterActiveMission||e?.tacticalChapter?.activeRunId||e?.fieldOps?.activeMissionRun||Object.values(e?.operations||{}).some(e=>e.activeMissionRun))}var Qc={alpha:[{id:`assault`,title:`ASSAULT`,description:`Strike · Rend`,skillIds:[`alpha-strike`,`alpha-rend`],tone:`amber`,emblemSrc:Xc.assault},{id:`command`,title:`COMMAND`,description:`Howl`,skillIds:[`alpha-howl`],tone:`cyan`,emblemSrc:Xc.command}],"ally-02":[{id:`pursuit`,title:`PURSUIT`,description:`Thrust · Lunge`,skillIds:[`u02-shot`,`u02-burst`],tone:`amber`,emblemSrc:Xc.pursuit},{id:`control`,title:`CONTROL`,description:`Pressure`,skillIds:[`u02-suppress`],tone:`cyan`,emblemSrc:Xc.control}],"ally-03":[{id:`line`,title:`FRONT LINE`,description:`Sweep`,skillIds:[`u03-tap`],tone:`amber`,emblemSrc:Xc.line},{id:`support`,title:`SUPPORT`,description:`Mend · Pack Support`,skillIds:[`u03-mend`,`u03-pack`],tone:`cyan`,emblemSrc:Xc.support}]},$c={alpha:`ALPHA`,"ally-02":`CNC`,"ally-03":`SHADOW`},el={alpha:`PACK LEADER`,"ally-02":`TACTICAL HUNTER`,"ally-03":`SQUAD SUPPORT`},tl={vanguard:`HOWL grants a short protective GUARD to nearby allies.`,howlkeeper:`HOWL reaches allies across a larger area.`,pursuer:`THRUST gains one tile of reach.`,disruptor:`PRESSURE weakens enemy attacks for longer.`,sentinel:`PACK SUPPORT also grants a brief GUARD.`,medic:`MEND cooldown is reduced, to a minimum of one turn.`};function nl(e,t,n,r,i){return Ur(i||dn(e),n,t,r)}function rl(e,t,n,r,i,a,o,s=!1){if(!zt[e].includes(t))throw Error(`atlas_invalid_skill`);let c=r?.ranks[t]||0,l=n?Bt.find(e=>e.skillId===t&&e.rank===n):null,u=n?l?.label||`UNKNOWN RANK`:dn(t).name,d={id:`skill:${e}:${t}:${n}`,skillId:t,rank:n,title:u,changes:[]};if(n===0)return{...d,state:`base`,reason:`Base action already available. No point required.`};if(c>=n)return{...d,state:n===2?`maxed`:`recorded`,reason:`Recorded in the server-owned Skillbook.`};if(!r||!l)return{...d,state:`unavailable`,reason:`Awaiting authenticated progression.`};if(s)return{...d,state:`active-run`,reason:`Complete the current mission before upgrading or resetting skills. The accepted run keeps its saved build.`};if(n===2&&c<1)return{...d,state:`needs-rank-one`,reason:`Record Rank I of this skill first.`};if(r.discipline&&r.discipline!==i)return{...d,state:`different-discipline`,reason:`Another discipline is saved. A one-time respec may change it.`};let f=nl(t,n,r,i,o);return f.length?a<1?{...d,changes:f,state:`no-points`,reason:`Earn a first-clear point before purchasing.`}:{...d,changes:f,state:`available`,reason:`Eligible for a server-recorded purchase of 1 point.`}:{...d,changes:f,state:`no-effect`,reason:t===`u03-mend`?`MEND is already at its minimum cooldown in this build. This rank adds no combat effect and cannot cost a point.`:`This rank adds no combat effect to the current build. No point can be spent.`}}function il(e,t){if(!Number.isInteger(t)||t<1||!Number.isInteger(e)||e<0||e>=t)throw Error(`atlas_invalid_sector_index`);if(t===2)return{x:e===0?24:76,y:18};let n=-Math.PI/2+e*2*Math.PI/t;return{x:Math.round((50+34*Math.cos(n))*10)/10,y:Math.round((50+34*Math.sin(n))*10)/10}}function al(e){e.currentTarget.hidden=!0}function ol(e){if(e.currentTarget.dataset.fallback){al(e);return}e.currentTarget.dataset.fallback=`1`,Ds(e)}var sl=Object.fromEntries(Object.entries(Yc).map(([e,t])=>[`--tsa-${e}`,`url("${t}")`])),cl=[{id:`future-a`,title:`FUTURE 01`,x:14,y:62},{id:`future-b`,title:`FUTURE 02`,x:86,y:62},{id:`future-c`,title:`FUTURE 03`,x:14,y:86},{id:`future-d`,title:`FUTURE 04`,x:86,y:86}];function ll({onClose:e}){let t=Z(e=>e.progression),n=t?.playerGrowth,r=Z(e=>e.progressionCommitPending),i=Z(e=>e.progressionError),a=Z(e=>e.upgradeGrowth),o=Z(e=>e.respecGrowth),[s,c]=(0,y.useState)(`alpha`),[l,u]=(0,y.useState)(`atlas`),[d,f]=(0,y.useState)(`assault`),[p,m]=(0,y.useState)(0),[h,g]=(0,y.useState)(`vanguard`),[_,v]=(0,y.useState)(null),[b,x]=(0,y.useState)(null),[S,C]=(0,y.useState)(!1),[w,T]=(0,y.useState)(null),[E,D]=(0,y.useState)(!1),[O,ee]=(0,y.useState)(!0),A=(0,y.useRef)(null),j=(0,y.useRef)(null),te=Qc[s],M=Math.ceil(te.length/3),N=te.slice(p*3,(p+1)*3),P=te.find(e=>e.id===d)||te[0],F=Wr(n,s)||null,I=h;(0,y.useEffect)(()=>{g(F?.discipline||Rt[s][0])},[s,F?.discipline]);let ne=n?n.earnedPoints-n.spentPoints:0,L=S||r,R=Zc(t),z=_&&P.skillIds.includes(_.skillId)?rl(s,_.skillId,_.rank,F,I,ne,Vr(_.skillId,t),R):null,B=!(z?.state!==`available`||L||!n),re=!!(F?.discipline&&!F.respecUsed&&Object.keys(F.ranks).length>0&&!L&&!R),ie=F?.ranks||{};(0,y.useEffect)(()=>{if(!b)return;let e=document.activeElement,t=A.current,n=document.body.style.overflow;document.body.style.overflow=`hidden`,t?.querySelector(`button`)?.focus();function r(e){if(e.key===`Escape`){e.preventDefault(),x(null);return}if(e.key!==`Tab`||!t)return;let n=Array.from(t.querySelectorAll(`button:not(:disabled)`)),r=n[0],i=n[n.length-1];e.shiftKey&&document.activeElement===r?(e.preventDefault(),i?.focus()):!e.shiftKey&&document.activeElement===i&&(e.preventDefault(),r?.focus())}return document.addEventListener(`keydown`,r),()=>{document.body.style.overflow=n,document.removeEventListener(`keydown`,r),e?.focus()}},[b]);function ae(e,t){L||(v({skillId:e,rank:t}),T(null),x(null),requestAnimationFrame(()=>j.current?.scrollIntoView({block:`nearest`,behavior:`instant`})))}function V(e){L||(c(e),m(0),f(Qc[e][0].id),g(n?.heroes.find(t=>t.heroId===e)?.discipline||Rt[e][0]),u(`atlas`),v(null),T(null),x(null))}function oe(e){L||(f(e.id),u(`sector`),v(null),x(null),T(null))}async function se(){if(!z||!B||!n||!t||!F)return;let e={heroId:s,path:I,skillId:z.skillId,rank:z.rank,revision:t.revision};x(null),T(null),C(!0);try{await a(e.heroId,e.path,e.skillId,e.rank);let t=Z.getState(),n=t.progression?.playerGrowth?.heroes.find(t=>t.heroId===e.heroId);t.progression&&t.progression.revision>e.revision&&(n?.ranks[e.skillId]||0)>=e.rank&&!t.progressionError?T({kind:`success`,text:`SERVER RECORDED · ${dn(e.skillId).name} RANK ${e.rank}. Your next accepted run will use the saved skill. Existing runs keep their frozen build.`}):T({kind:`error`,text:t.progressionError||`Upgrade not confirmed by the server. Points and skill ownership remain server-owned; refresh and retry.`})}catch{T({kind:`error`,text:`Could not verify server receipt. Refresh before retrying.`})}finally{C(!1)}}async function ce(){if(!re||!t)return;let e=t.revision,n=s;x(null),T(null),C(!0);try{await o(n);let t=Z.getState(),r=t.progression?.playerGrowth?.heroes.find(e=>e.heroId===n);t.progression&&t.progression.revision>e&&r?.respecUsed&&!Object.keys(r.ranks).length&&!t.progressionError?(g(Rt[n][0]),v(null),T({kind:`success`,text:`SERVER RECORDED · This hero's one-time reset was used.`})):T({kind:`error`,text:t.progressionError||`Reset not confirmed. Refresh and check server progression.`})}catch{T({kind:`error`,text:`Reset receipt could not be verified.`})}finally{C(!1)}}return(0,Q.jsxs)(`section`,{className:`tsa-root`,style:sl,inert:!!b,"aria-busy":L,"aria-label":`Signal Atlas character Skillbook`,children:[(0,Q.jsxs)(`header`,{className:`tsa-header`,children:[(0,Q.jsxs)(`div`,{children:[(0,Q.jsx)(`span`,{className:`tsa-eyebrow`,children:`TACTICAL OPS / CHARACTER DEVELOPMENT`}),(0,Q.jsx)(`h2`,{children:`THE SIGNAL ATLAS`}),(0,Q.jsx)(`span`,{className:`tsa-subtitle`,children:`THE CHAIN REMEMBERS`})]}),(0,Q.jsxs)(`div`,{className:`tsa-points`,"aria-label":n?`${ne} unspent skill points`:`Points unavailable`,children:[(0,Q.jsx)(`strong`,{children:n?ne:`—`}),(0,Q.jsxs)(`small`,{children:[`POINTS`,(0,Q.jsx)(`br`,{}),`AVAILABLE`]})]})]}),(0,Q.jsx)(`div`,{className:`tsa-hero-tabs`,role:`group`,"aria-label":`Choose character`,children:Object.keys($c).map(e=>(0,Q.jsxs)(`button`,{type:`button`,disabled:L,"aria-pressed":s===e,className:s===e?`is-active`:``,onClick:()=>V(e),children:[(0,Q.jsx)(`img`,{src:k[e].portrait,onError:ol,alt:``}),(0,Q.jsxs)(`span`,{children:[(0,Q.jsx)(`b`,{children:$c[e]}),(0,Q.jsx)(`small`,{children:el[e]})]})]},e))}),n?null:(0,Q.jsx)(`p`,{className:`tsa-banner`,role:`status`,children:`Waiting for authenticated Skillbook progression. No skills can be purchased offline.`}),R?(0,Q.jsxs)(`p`,{className:`tsa-banner`,role:`status`,id:`tsa-active-run`,children:[(0,Q.jsx)(`strong`,{children:`ACTIVE RUN · COMPLETE CURRENT MISSION`}),(0,Q.jsx)(`br`,{}),`Upgrades and one-time resets unlock after the server records the mission result. Your accepted build stays unchanged.`]}):null,(0,Q.jsxs)(`div`,{className:`tsa-nav`,role:`group`,"aria-label":`Skillbook view`,children:[(0,Q.jsx)(`button`,{type:`button`,className:l===`atlas`?`is-current`:``,"aria-pressed":l===`atlas`,onClick:()=>{u(`atlas`),x(null),T(null)},disabled:L,children:`◈ ATLAS OVERVIEW`}),(0,Q.jsx)(`button`,{type:`button`,className:l===`sector`?`is-current`:``,"aria-pressed":l===`sector`,onClick:()=>u(`sector`),disabled:L,children:`◇ SECTOR FOCUS`}),(0,Q.jsx)(`button`,{type:`button`,onClick:e,disabled:L,"aria-label":`Close Signal Atlas`,children:`✕ CLOSE`})]}),l===`atlas`?(0,Q.jsxs)(`div`,{className:`tsa-overview`,children:[(0,Q.jsxs)(`div`,{className:`tsa-atlas-title`,children:[(0,Q.jsxs)(`span`,{children:[`ALPHA HUSKY / `,$c[s]]}),(0,Q.jsx)(`strong`,{children:`COMBAT NETWORK`}),(0,Q.jsx)(`small`,{children:`Select a live sector to inspect its real skills.`})]}),(0,Q.jsxs)(`div`,{className:`tsa-atlas-map`,"aria-label":`Interactive skill sector map`,children:[(0,Q.jsxs)(`svg`,{className:`tsa-links`,viewBox:`0 0 360 370`,preserveAspectRatio:`none`,"aria-hidden":`true`,children:[(0,Q.jsx)(`circle`,{cx:`180`,cy:`185`,r:`129`,fill:`none`,stroke:`#426074`,strokeWidth:`1`,strokeDasharray:`4 9`}),(0,Q.jsx)(`circle`,{cx:`180`,cy:`185`,r:`99`,fill:`none`,stroke:`#2F728D`,strokeWidth:`1`}),N.map((e,t)=>{let n=il(t,N.length);return(0,Q.jsx)(`path`,{d:`M180 185 L${n.x*3.6} ${n.y*3.7}`,fill:`none`,stroke:`#6AC4DF`,strokeWidth:`2.8`},e.id)}),(0,Q.jsx)(`path`,{d:`M180 185 L47 126 M180 185 L313 126 M180 185 L47 289 M180 185 L313 289`,fill:`none`,stroke:`#466071`,strokeWidth:`1.5`,strokeDasharray:`5 7`})]}),(0,Q.jsx)(`div`,{className:`tsa-core-housing`,"aria-hidden":`true`,children:(0,Q.jsx)(`img`,{className:`tsa-core-bezel`,src:Yc.coreBezel,onError:al,alt:``})}),(0,Q.jsxs)(`div`,{className:`tsa-core`,children:[(0,Q.jsx)(`img`,{className:`tsa-core-portrait`,src:k[s].portrait,onError:ol,alt:``}),(0,Q.jsx)(`img`,{className:`tsa-core-emblem`,onError:al,src:vc(s,null)||``,alt:``}),(0,Q.jsx)(`b`,{children:$c[s]}),(0,Q.jsx)(`small`,{children:`COMBAT CORE`})]}),N.map((e,t)=>(0,Q.jsxs)(`button`,{className:`tsa-sector tsa-tone-${e.tone}`,style:{left:`${il(t,N.length).x}%`,top:`${il(t,N.length).y}%`},type:`button`,onClick:()=>oe(e),disabled:L,"aria-label":`Open ${e.title} sector, ${e.skillIds.length} skills`,children:[(0,Q.jsxs)(`span`,{className:`tsa-sector-glyph`,children:[(0,Q.jsx)(`img`,{src:e.emblemSrc,alt:``,decoding:`async`,onError:e=>{e.currentTarget.style.display=`none`,e.currentTarget.parentElement?.setAttribute(`data-art-failed`,`1`)}}),(0,Q.jsx)(`span`,{className:`tsa-sector-glyph-fallback`,"aria-hidden":`true`,children:e.tone===`amber`?`✦`:`◎`})]}),(0,Q.jsx)(`b`,{children:e.title}),(0,Q.jsx)(`small`,{children:e.description}),(0,Q.jsxs)(`em`,{children:[`RECORDED · `,e.skillIds.reduce((e,t)=>e+(ie[t]||0),0),`/`,e.skillIds.length*2]})]},e.id)),te.length<=2&&cl.map(e=>(0,Q.jsx)(`div`,{className:`tsa-reserve`,style:{left:`${e.x}%`,top:`${e.y}%`},"aria-label":`Unreleased expansion placeholder`,children:`⊕`},e.id))]}),M>1?(0,Q.jsxs)(`div`,{className:`tsa-page-controls`,"aria-label":`Sector pages`,children:[(0,Q.jsx)(`button`,{type:`button`,disabled:L||p===0,onClick:()=>m(e=>Math.max(0,e-1)),children:`← PREVIOUS`}),(0,Q.jsxs)(`span`,{children:[`SECTORS `,p+1,` / `,M]}),(0,Q.jsx)(`button`,{type:`button`,disabled:L||p===M-1,onClick:()=>m(e=>Math.min(M-1,e+1)),children:`NEXT →`})]}):null,(0,Q.jsxs)(`div`,{className:`tsa-atlas-footer`,children:[(0,Q.jsxs)(`span`,{children:[(0,Q.jsx)(`b`,{children:`●`}),` LIVE SECTOR`]}),(0,Q.jsx)(`span`,{children:`◌ DESIGN RESERVE — NOT RELEASED`})]}),(0,Q.jsxs)(`button`,{type:`button`,className:`tsa-future-toggle`,disabled:L,"aria-expanded":E,onClick:()=>D(e=>!e),children:[`FUTURE EXPANSION `,E?`−`:`+`]}),E?(0,Q.jsx)(`p`,{className:`tsa-explain`,children:`This atlas can accept additional sectors without changing existing skill IDs. Grey markers are design space only—not earnable abilities, locked missions or promised rewards.`}):null]}):(0,Q.jsxs)(`div`,{className:`tsa-focus`,children:[(0,Q.jsxs)(`div`,{className:`tsa-focus-heading`,children:[(0,Q.jsxs)(`div`,{children:[(0,Q.jsxs)(`span`,{className:`tsa-eyebrow`,children:[$c[s],` / `,P.title,` SECTOR`]}),(0,Q.jsxs)(`h3`,{children:[P.title,` NETWORK`]}),(0,Q.jsxs)(`small`,{children:[P.description,` · `,P.skillIds.length,` skills / 3 per hero`]})]}),(0,Q.jsx)(`button`,{type:`button`,onClick:()=>u(`atlas`),disabled:L,children:`← ATLAS`})]}),(0,Q.jsx)(`div`,{className:`tsa-sector-switch`,role:`group`,"aria-label":`Choose live sector`,children:te.map(e=>(0,Q.jsxs)(`button`,{type:`button`,"aria-pressed":e.id===P.id,disabled:L,onClick:()=>oe(e),children:[e.title,(0,Q.jsxs)(`small`,{children:[e.skillIds.reduce((e,t)=>e+(ie[t]||0),0),`/`,e.skillIds.length*2,` RECORDED`]})]},e.id))}),(0,Q.jsx)(`div`,{className:`tsa-disciplines`,role:`group`,"aria-label":`Choose specialization preview`,children:Rt[s].map(e=>(0,Q.jsxs)(`button`,{type:`button`,"aria-pressed":I===e,disabled:L,onClick:()=>{g(e),v(null),T(null)},className:I===e?`is-chosen`:``,children:[(0,Q.jsx)(`img`,{onError:al,src:vc(s,e)||``,alt:``}),(0,Q.jsx)(`b`,{children:e.toUpperCase()}),(0,Q.jsx)(`span`,{children:F?.discipline===e?`SERVER RECORDED`:F?.discipline?`ALTERNATIVE · UNAVAILABLE`:`PREVIEW PATH`})]},e))}),(0,Q.jsxs)(`p`,{className:`tsa-path-explain`,children:[tl[I],` `,F?.discipline?`Your recorded discipline is fixed until an eligible one-time reset.`:`Previewing does not save a discipline. Your first successful skill purchase selects it.`]}),(0,Q.jsx)(`button`,{type:`button`,className:`tsa-detail-toggle`,disabled:L,"aria-pressed":!O,onClick:()=>ee(e=>!e),children:O?`SHOW FULL SKILL DETAILS +`:`COMPACT SKILL NETWORK −`}),(0,Q.jsx)(`div`,{className:`tsa-lanes ${O?`is-compact`:``}`,children:P.skillIds.map(e=>{let n=dn(e);return(0,Q.jsxs)(`div`,{className:`tsa-lane`,children:[(0,Q.jsxs)(`div`,{className:`tsa-lane-title`,children:[(0,Q.jsx)(`img`,{onError:al,src:Ms(e)||``,alt:``}),(0,Q.jsxs)(`div`,{children:[(0,Q.jsx)(`b`,{children:n.name}),(0,Q.jsxs)(`small`,{children:[n.slot,` · `,n.desc]})]}),(0,Q.jsxs)(`span`,{children:[ie[e]||0,`/2`]})]}),(0,Q.jsx)(`div`,{className:`tsa-node-line`,role:`group`,"aria-label":`${n.name} upgrade ranks`,children:[0,1,2].map((r,i)=>{let a=rl(s,e,r,F,I,ne,Vr(e,t),R),o=_?.skillId===e&&_.rank===r;return(0,Q.jsxs)(`div`,{className:`tsa-node-wrap`,children:[i>0?(0,Q.jsx)(`span`,{className:`tsa-connector ${(ie[e]||0)>=r?`is-lit`:``}`,"aria-hidden":`true`}):null,(0,Q.jsxs)(`button`,{type:`button`,disabled:L,"aria-pressed":o,onClick:()=>ae(e,r),className:`tsa-node tsa-state-${a.state} ${o?`is-focused`:``}`,"aria-label":`${n.name} rank ${r}, ${a.state}: ${a.reason}`,children:[(0,Q.jsx)(`img`,{onError:al,src:Ms(e)||``,alt:``}),r>0?(0,Q.jsx)(`span`,{className:`tsa-rank-stamp`,"aria-hidden":`true`,children:a.state===`maxed`||a.state===`recorded`?`✓`:a.state===`needs-rank-one`?`⌁`:r===2?`II`:`I`}):null]}),(0,Q.jsx)(`small`,{children:r===0?`BASE`:`RANK ${r===1?`I`:`II`}`}),(0,Q.jsx)(`span`,{className:`tsa-node-status`,children:{base:`OWNED`,recorded:`SAVED`,maxed:`MAXED`,available:`AVAILABLE`,"needs-rank-one":`NEEDS I`,"no-points":`NO POINTS`,"different-discipline":`OTHER PATH`,"no-effect":`NO CHANGE`,unavailable:`OFFLINE`,"active-run":`ACTIVE RUN`}[a.state]})]},a.id)})})]},e)})}),(0,Q.jsx)(`section`,{ref:j,className:`tsa-inspector ${z?`has-selection`:``}`,"aria-label":`Skill node inspection`,"aria-live":`polite`,children:z?(0,Q.jsxs)(Q.Fragment,{children:[(0,Q.jsxs)(`span`,{className:`tsa-eyebrow`,children:[dn(z.skillId).name,` / `,z.rank===0?`BASE`:`RANK ${z.rank===1?`I`:`II`}`]}),(0,Q.jsx)(`h3`,{children:z.title}),(0,Q.jsxs)(`div`,{className:`tsa-saved-rank`,children:[`SAVED RANK `,ie[z.skillId]||0,` / 2 · `,z.rank===0?`BASE ACTION`:`INSPECTING RANK ${z.rank}`]}),(0,Q.jsx)(`p`,{children:z.reason}),z.rank>0?(0,Q.jsxs)(`p`,{children:[Gt(z.skillId,z.rank,n?.version),(0,Q.jsx)(`br`,{}),Gr[I],(0,Q.jsx)(`br`,{}),`Costs 1 shared point. Saved runs keep their frozen build; changes apply to the next accepted run.`]}):null,z.changes.length?(0,Q.jsx)(`div`,{className:`tsa-deltas`,children:z.changes.map(e=>(0,Q.jsx)(`strong`,{children:e},e))}):null,(0,Q.jsxs)(`div`,{className:`tsa-inspector-bottom`,children:[(0,Q.jsx)(`span`,{children:z.rank===0?`ALREADY OWNED`:z.state===`recorded`||z.state===`maxed`?`SERVER RECORDED`:`COST: 1 SKILL POINT`}),(0,Q.jsx)(`button`,{type:`button`,disabled:!B,"aria-describedby":R?`tsa-active-run`:void 0,onClick:()=>x(`upgrade`),children:S?`SAVING…`:z.state===`active-run`?`COMPLETE CURRENT MISSION`:z.state===`available`?`REVIEW UPGRADE`:`UNAVAILABLE`})]})]}):(0,Q.jsxs)(Q.Fragment,{children:[(0,Q.jsx)(`span`,{className:`tsa-eyebrow`,children:`SELECT A NODE`}),(0,Q.jsx)(`h3`,{children:`BUILD YOUR COMBAT IDENTITY`}),(0,Q.jsx)(`p`,{children:`Tap a rank to inspect its real effect, prerequisite and server ownership before spending a point.`})]})}),(0,Q.jsxs)(`div`,{className:`tsa-secondary`,children:[(0,Q.jsx)(`button`,{type:`button`,disabled:!re,"aria-describedby":R?`tsa-active-run`:void 0,onClick:()=>x(`respec`),children:F?.respecUsed?`ONE-TIME RESET USED`:`RESET THIS HERO · ONCE FREE`}),(0,Q.jsx)(`small`,{children:`Pack Mastery remains separate.`})]})]}),i?(0,Q.jsx)(`p`,{className:`tsa-feedback error`,role:`alert`,children:i}):w?(0,Q.jsx)(`p`,{className:`tsa-feedback ${w.kind}`,role:w.kind===`error`?`alert`:`status`,children:w.text}):null,b&&typeof document<`u`?(0,qc.createPortal)((0,Q.jsx)(`div`,{className:`tsa-dialog-backdrop`,children:(0,Q.jsxs)(`div`,{ref:A,className:`tsa-dialog`,role:`dialog`,"aria-modal":`true`,"aria-labelledby":`tsa-confirm-title`,children:[(0,Q.jsx)(`span`,{className:`tsa-eyebrow`,children:`SERVER-RECORDED ACTION`}),(0,Q.jsx)(`h3`,{id:`tsa-confirm-title`,children:b===`upgrade`?`CONFIRM SKILL UPGRADE`:`CONFIRM ONE-TIME RESET`}),R?(0,Q.jsx)(`p`,{role:`status`,children:`ACTIVE RUN · COMPLETE CURRENT MISSION before confirming an upgrade or reset.`}):null,(0,Q.jsx)(`p`,{children:b===`upgrade`?`${z?.title} · cost 1 shared skill point. ${F?.discipline?`Existing discipline remains recorded.`:`First purchase will record ${I.toUpperCase()} as this hero's discipline.`}`:`Refund this hero's spent skill points and clear their specialization. You cannot use this one-time reset again.`}),b===`upgrade`&&z?.changes.length?(0,Q.jsx)(`div`,{className:`tsa-deltas`,children:z.changes.map(e=>(0,Q.jsx)(`strong`,{children:e},e))}):null,b===`upgrade`?(0,Q.jsxs)(`p`,{children:[Gr[I],(0,Q.jsx)(`br`,{}),`1 shared point. First purchase selects this doctrine. One reset per hero. Applies to the next accepted run; saved runs stay frozen.`]}):null,(0,Q.jsxs)(`div`,{className:`tsa-dialog-actions`,children:[(0,Q.jsx)(`button`,{type:`button`,onClick:()=>x(null),children:`CANCEL`}),(0,Q.jsx)(`button`,{type:`button`,className:`is-primary`,disabled:b===`upgrade`?!B:!re,onClick:()=>void(b===`upgrade`?se():ce()),children:`CONFIRM`})]})]})}),document.getElementById(`tacticalOpsRoot`)||document.body):null]})}function ul({onClose:e}){return(0,Q.jsx)(ll,{onClose:e})}var dl=[`Recon`,`Control`,`Defense`,`Mobility`,`Support`];function fl(e){let t=e.effects.filter(e=>e.kind===`status`);return e.effects.some(e=>e.kind===`heal`)?`Support`:t.some(e=>e.status===`GUARD`||e.status===`DEF_UP`)?`Defense`:t.some(e=>e.status===`ATK_DOWN`||e.status===`SPD_DOWN`)?`Control`:t.some(e=>e.status===`SPD_UP`&&e.on===`self`)?`Mobility`:t.some(e=>e.status===`ATK_UP`||e.status===`SPD_UP`)?`Support`:null}function pl(e,t){let n=[];for(let r of e){let e=Wt(t,r.defId),i=Array.isArray(r.skillIds)?r.skillIds:[];for(let t of i){let i=Ut(dn(t),e),a=fl(i);a&&n.push({family:a,unit:r.name,skillId:Ht(t),skillName:i.name,slot:i.slot,description:i.desc,cooldown:i.cooldownMax})}}return n}function ml(e,t){return e.flatMap(e=>{let n=Wt(t,e.defId);return e.skillIds.map(t=>{let r=Ut(dn(t),n);return{unitId:e.defId,unitName:e.name,slot:r.slot,skillId:t,name:r.name,family:fl(r),cooldown:r.cooldownMax,minRange:r.minRange,maxRange:r.maxRange,description:r.desc,targetType:r.targetType,effects:r.effects.map(e=>({...e}))}})})}function hl(e,t,n=!1){let r=t?.heroes.find(e=>e.heroId===`ally-02`)?.discipline===`disruptor`,i=n&&r?e.find(e=>e.unitId===`ally-02`&&Ht(e.skillId)===`u02-suppress`&&e.effects.some(e=>e.kind===`status`&&e.on===`hits`)):void 0,a=e.find(e=>e.effects.some(e=>e.kind===`status`&&e.status===`SPD_DOWN`&&(e.on===`hits`||e.on===`primary`||e.on===`aoe_enemies`))),o=e.find(e=>e.effects.some(e=>e.kind===`status`&&(e.status===`GUARD`||e.status===`DEF_UP`)&&(e.on===`aoe_allies`||e.on===`primary`))),s=e.find(e=>e.effects.some(e=>e.kind===`heal`&&(e.on===`primary`||e.on===`aoe_allies`))),c=(e,t,n,r)=>({id:e,label:t,available:!!n,source:n?`${n.unitName} · ${n.name}`:null,detail:r});return[c(`INTERRUPT`,`CANCEL LOCKED ATTACK`,i,n?`CNC Disruptor PRESSURE can cancel a confirmed locked attack.`:`Available only while VNext intent telegraphs are enabled.`),c(`SLOW`,`SLOW PURSUIT`,a,`Speed reduction can delay a pursuing or escaping unit.`),c(`PROTECT`,`PROTECT ALLIES`,o,`Shield or DEF support reduces danger while allies hold position.`),c(`RECOVER`,`RECOVER HP`,s,`Healing restores allies after damage; it does not cancel a locked attack.`)]}var gl=`/images/tactical_ops/presentation/command_deck`,_l=Object.freeze({"broken-signal":gl+`/operations/alpha_wartable_broken_signal_v1.webp`,"dead-relay":gl+`/operations/alpha_wartable_dead_relay_v1.webp`,"field-ops":gl+`/operations/alpha_wartable_fracture_front_v1.webp`}),vl=Object.freeze({RECOVER:gl+`/mission_emblems/alpha_emblem_recover_v1_256.webp`,HOLD:gl+`/mission_emblems/alpha_emblem_hold_v1_256.webp`,SURVIVE:gl+`/mission_emblems/alpha_emblem_survive_v1_256.webp`,INTERCEPT:gl+`/mission_emblems/alpha_emblem_intercept_v1_256.webp`,BOSS:gl+`/mission_emblems/alpha_emblem_boss_v1_256.webp`});function yl(e){let t=e?.operationId===`dead-relay`||e?.battlefield===`dead-relay`?`dead-relay`:e?.operationId===`field-ops`||e?.activity===`FIELD_OP`||e?.battlefield===`field-ops`?`field-ops`:`broken-signal`,n=e?.objectiveType,r=n&&Object.prototype.hasOwnProperty.call(vl,n)?vl[n]:null;return{location:t,scene:_l[t],insignia:r,objective:n||null}}var bl={startHero:`/images/tactical_ops/presentation/tactical_ops_start_hero_backdrop.png`,battlefield:`/images/tactical_ops/presentation/tactical_ops_battlefield_backdrop.png`,operationPlate:`/images/tactical_ops/presentation/tactical_ops_broken_signal_operation_plate.png`,resultsPlate:`/images/tactical_ops/presentation/tactical_ops_operation_complete_plate.png`,bossTarget:`/images/tactical_ops/presentation/tactical_ops_boss_target.png`,recoveryMarker:`/images/tactical_ops/presentation/tactical_ops_signal_recovery_marker.png`,traceTarget:`/images/tactical_ops/presentation/tactical_ops_trace_target.png`,reinforcementWarning:`/images/tactical_ops/presentation/tactical_ops_reinforcement_warning.png`};function xl(e){let t=Z.getState();if(e.chapter){t.openChapterBrief();return}t.openOperationBrief(e.missionId,e.masteryChallenge),!e.resume&&e.tier===`advanced`&&Z.getState().selectDirectiveTier(`advanced`)}function Sl(e){return e.objectiveType===`BOSS`?{art:bl.bossTarget,tone:`boss`,label:`COMMAND TARGET`}:e.objectiveType===`RECOVER`?{art:bl.recoveryMarker,tone:`recover`,label:`SIGNAL RECOVERY`}:e.objectiveType===`INTERCEPT`?{art:bl.traceTarget,tone:`intercept`,label:`INTERCEPT`}:e.objectiveType===`HOLD`?{art:bl.reinforcementWarning,tone:`hold`,label:`HOLD THE LINE`}:e.objectiveType===`SURVIVE`?{art:bl.battlefield,tone:`survive`,label:`ENDURE`}:{art:bl.operationPlate,tone:`assault`,label:`ASSAULT`}}function Cl({mission:e,fallback:t,eager:n=!1}){let r=yl(e).scene;return(0,Q.jsx)(`img`,{className:`t-wt-scene`,src:r,alt:``,"aria-hidden":`true`,loading:n?`eager`:`lazy`,decoding:`async`,onError:e=>{e.currentTarget.onerror=null,e.currentTarget.src=t}})}function wl({mission:e}){let t=yl(e).insignia;return t?(0,Q.jsx)(`img`,{className:`t-wt-mission-emblem`,src:t,alt:``,"aria-hidden":`true`,loading:`lazy`,decoding:`async`,onError:e=>{e.currentTarget.hidden=!0}}):null}var Tl={alpha:`Melee pressure`,skirmisher:`Skirmisher`,ranged:`Skirmisher`,support:`Support`,companion:`Mobile control`,hostile:`Melee`,leader:`Heavy`};function El(e){let t=e.objective;return t?.type===`INTERCEPT`?`Stop the courier before the south-east exit.`:t?.type===`HOLD`?t.holderRadius===0?`OCCUPY THE EXACT RELAY TILE · ${t.duration} consecutive round changes.`:`Control the relay area · ${t.duration} consecutive round changes.`:t?.type===`SURVIVE`?`Keep the full squad standing · ${t.duration} rounds.`:e.objectiveType===`RECOVER`?`Reach the relay. Use RECOVER.`:e.objectiveType===`BOSS`?e.operationId===xt.operationId?`Defeat the DEAD RELAY GUARDIAN.`:`Defeat the SIGNAL COMMANDER.`:`Eliminate the HOUND patrol.`}function Dl(e){return e.directive?.name||`STANDARD CONDITIONS`}function Ol(e,t){let n=e.skillIds.map(e=>un[e]?.name).filter(Boolean).join(` / `);return`${e.defId===`ally-02`?`BUG HUNTER WARDEN · Spear skirmisher`:Tl[e.role]||e.role} · ${n} · ${t||`MOVE ${e.move}`}`}function kl({dim:e=.55,art:t=`/images/tactical_ops/battlefield.jpg`,className:n=``}){return(0,Q.jsxs)(`div`,{className:`t-bg ${n}`,"aria-hidden":`true`,children:[(0,Q.jsx)(`img`,{src:t,alt:``}),(0,Q.jsx)(`div`,{className:`t-vignette`,style:{background:`rgb(10 12 16 / ${e})`}})]})}function Al(){let e=Z(e=>e.openBrief),t=Z(e=>e.onboardingEnabled),n=Z(e=>e.onboardingStageId),r=Z(e=>e.foundationCompleted),i=Z(e=>e.progressionStatus),a=Z(e=>e.progressionError),o=qo(t,n),s=r?`Foundation complete`:t?o.operationName:O.name,c=r?`Broken Signal training sequence completed.`:t?o.objective:i===`error`?`Foundation progression could not be loaded. Reopen Tactical Ops to retry.`:O.objective;return(0,Q.jsxs)(`div`,{className:`t-fill`,children:[(0,Q.jsx)(kl,{dim:.35,art:bl.startHero,className:`t-bg-hero`}),(0,Q.jsx)(`div`,{className:`t-vignette`}),(0,Q.jsx)(`div`,{className:`t-hub`,children:(0,Q.jsxs)(`div`,{className:`t-hub-copy`,children:[(0,Q.jsx)(`div`,{className:`t-kicker`,children:`Alpha Husky`}),(0,Q.jsx)(`h1`,{className:`t-title`,children:`Tactical Ops`}),(0,Q.jsx)(ks,{}),(0,Q.jsx)(`h2`,{children:`Combat Core`}),(0,Q.jsxs)(`div`,{className:`t-panel t-op-card`,children:[(0,Q.jsx)(`span`,{className:`t-kicker`,children:`Operation`}),(0,Q.jsx)(`strong`,{children:s}),(0,Q.jsx)(`p`,{children:c})]}),a?(0,Q.jsx)(`p`,{style:{color:`var(--t-enemy)`,margin:`0.8rem 0 0`},children:a}):null,(0,Q.jsx)(`div`,{className:`t-brief-actions`,children:(0,Q.jsxs)(`button`,{type:`button`,className:`t-btn t-btn-primary`,onClick:e,disabled:r||i===`error`,children:[r?`Foundation complete`:`Mission Brief`,(0,Q.jsx)(ue,{className:`t-ico`})]})})]})})]})}function jl({receipt:e}){let t=Z(e=>e.backToHub);return(0,Q.jsxs)(`div`,{className:`t-fill`,children:[(0,Q.jsx)(kl,{dim:.6}),(0,Q.jsx)(`div`,{className:`t-overlay t-results-overlay`,children:(0,Q.jsxs)(`div`,{className:`t-modal t-panel t-results ${e.victory?`is-victory`:`is-failure`}`,"data-first-session-result":e.runId,children:[(0,Q.jsxs)(`header`,{className:`t-outcome-hero`,children:[(0,Q.jsxs)(`span`,{className:`t-kicker`,children:[`ACTION / `,e.name]}),(0,Q.jsx)(`h2`,{className:`t-title`,children:e.victory?`MISSION SECURED`:`MISSION LOST`})]}),(0,Q.jsx)(ks,{}),(0,Q.jsxs)(`dl`,{className:`t-stats`,children:[(0,Q.jsxs)(`div`,{children:[(0,Q.jsx)(`dt`,{children:`Turns`}),(0,Q.jsx)(`dd`,{children:e.results.turns})]}),(0,Q.jsxs)(`div`,{children:[(0,Q.jsx)(`dt`,{children:`Eliminated`}),(0,Q.jsx)(`dd`,{children:e.results.hostilesEliminated})]}),(0,Q.jsxs)(`div`,{children:[(0,Q.jsx)(`dt`,{children:`Squad standing`}),(0,Q.jsxs)(`dd`,{children:[e.results.squadStanding,` / `,e.results.squadDeployed]})]})]}),(0,Q.jsxs)(`section`,{"aria-label":`Consequence`,children:[(0,Q.jsx)(`div`,{className:`t-kicker`,children:`CONSEQUENCE`}),(0,Q.jsx)(`p`,{children:e.consequence})]}),e.fieldResult?(0,Q.jsx)(Ml,{result:e.fieldResult}):(0,Q.jsxs)(`section`,{"aria-label":`Growth`,children:[(0,Q.jsx)(`div`,{className:`t-kicker`,children:`GROWTH`}),(0,Q.jsx)(`p`,{children:e.growth})]}),(0,Q.jsx)(`div`,{className:`t-brief-actions t-result-actions`,children:(0,Q.jsx)(`button`,{type:`button`,className:`t-btn t-btn-primary`,onClick:()=>{if(rc()?.acknowledge(e.runId)){let e=Z.getState();[`results`,`defeat`].includes(e.screen)&&t()}},children:`Continue`})})]})})]})}function Ml({result:e}){if(e.veteranChallenge)return(0,Q.jsxs)(`section`,{className:`t-field-feedback`,"aria-label":`Recorded Veteran challenge`,children:[(0,Q.jsxs)(`strong`,{children:[`PACK EXTRACTION · `,e.victory?`COMPLETE`:`FAILED`]}),(0,Q.jsx)(`p`,{children:`Server-accepted optional practice. No currency, Commander, Veteran or Pack Mastery progress.`}),(0,Q.jsx)(`p`,{children:`Next: return to an eligible Advanced Field Op for progression.`})]});let t=e.masteryUnlocked?`RELAY MASTERY · RELAY LOCKDOWN UNLOCKED`:e.advancedUnlocked?`ADVANCED DIRECTIVES`:e.unlockedApproaches.includes(`south`)?`SOUTH APPROACH`:null,n=e.rankAfter<2?6:12,r=Nr(e);return(0,Q.jsxs)(`section`,{className:`t-field-feedback`,"aria-label":`Recorded Field Op result`,children:[t?(0,Q.jsxs)(`div`,{className:`t-unlock`,children:[(0,Q.jsx)(`span`,{className:`t-kicker`,children:`UNLOCKED`}),(0,Q.jsx)(`strong`,{children:t})]}):null,e.lockdownPlan?(0,Q.jsxs)(`p`,{"data-recorded-plan":e.lockdownPlan,children:[(0,Q.jsxs)(`b`,{children:[`SERVER-ACCEPTED PLAN · `,We[e.lockdownPlan].name]}),` · `,e.victory?`Objective completed`:`Attempt failed`,`. Next: `,e.lockdownPlan===`crosslink`?`try Anchor to hold one defensive position`:`try Crosslink to rotate between relay checkpoints`,`.`]}):null,e.firstLockdownClear?(0,Q.jsxs)(`div`,{className:`t-lockdown-achievement`,"data-lockdown-completion":`true`,role:`status`,children:[(0,Q.jsx)(`span`,{className:`t-kicker`,children:`PERMANENT FIELD RECORD`}),(0,Q.jsx)(`strong`,{children:e.lockdownFirstClear?`FIRST LOCKDOWN CLEAR RECORDED`:`LOCKDOWN COMPLETION RECORDED`}),(0,Q.jsx)(`span`,{children:`Saved permanently · Relay Mastery 1/1`})]}):null,e.masteryChallenge?e.firstLockdownClear?null:(0,Q.jsxs)(`p`,{children:[(0,Q.jsx)(`b`,{children:`RELAY MASTERY · 1/1`}),` · Permanent access preserved.`]}):(0,Q.jsxs)(Q.Fragment,{children:[(0,Q.jsxs)(`div`,{className:`t-progress-heading`,children:[(0,Q.jsxs)(`div`,{children:[(0,Q.jsx)(`span`,{className:`t-kicker`,children:`COMMANDER`}),(0,Q.jsxs)(`strong`,{children:[`RANK `,e.rankBefore===e.rankAfter?``:`${e.rankBefore} → `,e.rankAfter]})]}),(0,Q.jsxs)(`b`,{children:[`+`,e.progressEarned,(0,Q.jsx)(`small`,{children:`PROGRESS`})]})]}),(0,Q.jsx)(`progress`,{className:`t-progress`,"aria-label":`Commander progress`,value:Math.min(e.progressAfter,n),max:n}),(0,Q.jsxs)(`div`,{className:`t-progress-caption`,children:[(0,Q.jsxs)(`span`,{children:[e.progressBefore,` → `,e.progressAfter,` TOTAL`]}),(0,Q.jsx)(`span`,{children:e.rankAfter>=3?e.veteranCareer?e.rankAfter===4?`RANK 4 · VETERAN`:`CERTIFIED · VETERAN CAREER OPEN`:`CERTIFIED · ALL CURRENT COMMAND TOOLS OPEN`:`${Math.max(0,n-e.progressAfter)} TO RANK ${e.rankAfter+1}`})]})]}),e.victory&&e.progressEarned===0&&!e.masteryChallenge?(0,Q.jsxs)(`div`,{className:`t-mission-strip`,children:[(0,Q.jsx)(`span`,{children:`CLEAR SECURED · REPLAY`}),(0,Q.jsx)(`span`,{children:`+0 COMMANDER`})]}):null,e.victory&&e.firstCycleSecure===!1&&e.progressEarned>0?(0,Q.jsxs)(`div`,{className:`t-mission-strip`,children:[(0,Q.jsx)(`span`,{children:`CLEAR ALREADY SECURED`}),(0,Q.jsxs)(`span`,{children:[`CHALLENGE +`,e.challengeBonus,` COMMANDER`]})]}):null,e.masteryChallenge?null:(0,Q.jsxs)(`div`,{className:`t-mission-strip`,children:[(0,Q.jsx)(`span`,{children:e.legacyReport?`CHALLENGE UNMEASURED`:e.challengeSuccess?e.challengeBonus?`CHALLENGE MET · +${e.challengeBonus} COMMANDER`:`CHALLENGE ✓`:`CHALLENGE NOT MET`}),e.directiveTier===`advanced`?(0,Q.jsxs)(`span`,{children:[`ADVANCED · `,Xe(e.directiveSet),e.firstCycleAdvanced?` · SECURED TODAY`:e.victory?` · REPLAY`:` · FAILED`]}):null]}),(0,Q.jsx)(`p`,{className:`t-player-result-meaning`,children:Er(e)}),(0,Q.jsxs)(`div`,{className:`t-purpose-result`,"aria-label":`Earned and changed`,children:[(0,Q.jsxs)(`p`,{children:[(0,Q.jsx)(`b`,{children:e.masteryChallenge?`RECORD`:`EARNED`}),` `,r.earned]}),(0,Q.jsxs)(`p`,{children:[(0,Q.jsx)(`b`,{children:e.masteryChallenge?`STATUS`:`ELIGIBILITY`}),` `,r.exhausted]}),(0,Q.jsxs)(`p`,{children:[(0,Q.jsx)(`b`,{children:`WHAT CHANGED`}),` `,r.changed]}),(0,Q.jsxs)(`p`,{children:[(0,Q.jsx)(`b`,{children:`NEXT BATTLE`}),` `,r.future]})]}),e.challengeSuccess&&!e.challengeBonus?(0,Q.jsx)(`small`,{children:e.firstCycleChallenge===!1?`Challenge bonus already earned this rotation.`:`No new challenge bonus recorded.`}):null,e.veteranCareer?(0,Q.jsxs)(`p`,{"data-veteran-career-delta":`true`,children:[`COMMANDER VETERAN `,e.veteranCareer.before,` → `,e.veteranCareer.after,`/12 · `,e.veteranCareer.unlocked?`RANK 4 · PACK EXTRACTION UNLOCKED`:e.veteranCareer.reason.replaceAll(`_`,` `).toLowerCase()]}):null,(0,Q.jsx)(Kc,{changes:e.masteryChanges,victory:e.victory})]})}function Nl(e){let t=W(`dead-relay-hold`),n=e?.operations?.[xt.operationId]?.activeMissionRun,r=n?.missionId===t.missionId?n:null,i=r?r.rulesContract?.rulesetVersion:e?.vnextStartAvailable?Me:void 0,a=Et(t.missionId,i,e?.deadRelayHoldRevisionAvailable,r),o=e?.campaignIntel?.[`dead-relay`],s=r?r.campaignContext:o&&{version:1,...o},c=s?At(t,void 0,a,s):t;if(!s)return{mission:c,copy:`HOUND entry confirmed at deployment.`};let l=Mt(c,!1,void 0,s).reinforcement,u=e?.tacticalChapter;if(!r&&i&&!s.courierTraceAcquired&&u?.status===`COMPLETED`&&!u.intelConsumedByRunId)return{mission:c,copy:`HOUND timing confirmed at deployment.`};let d=r?.chapterIntel?.effectiveRound??l.triggerRound,f=a===2&&s.courierTraceAcquired?`South-east`:`East`;return{mission:c,copy:`${s.courierTraceAcquired?`COURIER TRACE`:`NO TRACE`} · HOUND round ${d}. ${f} entry.`}}function Pl(){let[e,t]=(0,y.useState)(`command`),[n,r]=(0,y.useState)(`skillbook`),i=e===`squad`&&n===`skillbook`,[a,o]=(0,y.useState)(null),s=Z(e=>e.progression),c=Z(e=>e.openOperationBrief),l=Z(e=>e.chooseDoctrine),u=Z(e=>e.openTrialBrief),d=Z(e=>e.openChapterBrief),f=Z(e=>e.progressionCommitPending),p=Z(e=>e.progressionError),m=Z(e=>e.missionFirstClear),h=s?.operations?.[bt.operationId],g=s?.operations?.[xt.operationId],_=s?.fieldOps,v=s?.signalTrials,b=_?.fieldContracts,x=Or(_),S=Mr(s),w=S.primary,T=cn(_),E=xl,D=Qs(s),O=s?.tacticalChapter,k=O?Lt(O):null,ee=Z(e=>e.loadFoundationProgression),A=Z(e=>e.progressionStatus===`loading`);(0,y.useEffect)(()=>{if(!_?.board)return;let e=()=>{document.visibilityState===`visible`&&Z.getState().progressionStatus!==`loading`&&ee()},t=window.setTimeout(e,Math.max(1e3,_.board.nextRotationAt*1e3-Date.now()+250));return document.addEventListener(`visibilitychange`,e),window.addEventListener(`focus`,e),()=>{window.clearTimeout(t),document.removeEventListener(`visibilitychange`,e),window.removeEventListener(`focus`,e)}},[_?.board?.nextRotationAt,ee]);let M=_?.board?.activeMissionIds||[],N=M.map(e=>W(e)).filter(Boolean),P=_?.board?.cycleId,F=_?.rotationProgress,I=new Set(F?.clearedMissionIds||[]),ne=W(w?.missionId),L=w?.masteryChallenge?{reportVersion:4,masteryChallenge:w.masteryChallenge,pressure:2,directiveTier:`advanced`,directiveSet:`pursuit`}:void 0,R=ne?At(ne,L):null,z=w?.chapter?s?.chapterActiveMission:R&&_?.activeMissionRun?.missionId===R.missionId?_.activeMissionRun:s?.operations?.[R?.operationId||``]?.activeMissionRun,B=R?Tr(R,_,z,_?.lastResult,L):null,re=_?.board?Qe(_.board.nextRotationAt):`REFRESH REQUIRED`,ie=_?.commander?.rank||0,ae=_?.commander?.progress||0,V=_?.commander?.nextRankAt||null,oe=_?.veteranProgressionAvailable&&ie>=3?_.veteranCareer:void 0,se=ie>=4?`RANK 4 · VETERAN`:ie===3?`RANK 3 · CERTIFIED`:ie?`COMMANDER RANK ${ie}`:`COMMANDER STATUS UNAVAILABLE`,ce=_?.region?qe(_.region.pressure):`UNKNOWN`,le=_?.region?Je(_.region.pressure):`Refresh to load current field conditions.`,de=M.map(e=>({id:e,window:Zs(e,_?.board,_?.region,Date.now(),`standard`,s?.vnextStartAvailable===!0)})).find(e=>e.window)||null,H=_?.board?.reportVersion===3?Xe(_.board.directiveSet):null,fe=g?.activeMissionRun?.missionId||xt.orderedMissionIds.find(e=>g?.missions[e]===`available`)||null,pe=h?.status===`cleared`?g?`BROKEN SIGNAL COMPLETE · OPERATION 02 THE DEAD RELAY NOW AVAILABLE`:`BROKEN SIGNAL COMPLETE · FIELD OPS NOW DRIVE YOUR TACTICAL PROGRESSION`:h?.missions[`broken-signal-recover`]===`cleared`?`RECOVER SIGNAL CLEARED · SIGNAL COMMANDER AVAILABLE`:`BREACH CLEARED · RECOVER SIGNAL UNLOCKED`,me=g?(0,Q.jsxs)(`section`,{className:`t-panel ${g.status===`cleared`?`t-wt-story-archive`:`t-wt-campaign-feature`}`,"aria-label":`Operation 02 campaign`,children:[(0,Q.jsxs)(`div`,{className:`t-wt-section-head`,children:[(0,Q.jsxs)(`div`,{children:[(0,Q.jsx)(`span`,{className:`t-kicker`,children:`STORY CAMPAIGN · OPERATION 02`}),(0,Q.jsx)(`h2`,{className:`t-title`,children:`THE DEAD RELAY`})]}),(0,Q.jsx)(`strong`,{children:g.status===`cleared`?`CAMPAIGN SECURED`:g.missions[`dead-relay-courier`]===`locked`?`LOCKED`:`IN PROGRESS`})]}),(0,Q.jsx)(`div`,{className:`t-wt-campaign-environment`,"aria-hidden":`true`,children:(0,Q.jsx)(Cl,{mission:W(`dead-relay-courier`),fallback:bl.operationPlate})}),(0,Q.jsx)(`p`,{children:`Intercept the courier. Hold the relay. Defeat its Guardian.`}),g.status!==`cleared`&&fe?(0,Q.jsxs)(`div`,{className:`t-wt-campaign-actions`,children:[(0,Q.jsxs)(`div`,{children:[(0,Q.jsx)(`span`,{className:`t-kicker`,children:`NEXT STORY MISSION`}),(0,Q.jsx)(`strong`,{children:W(fe)?.name||`THE DEAD RELAY`})]}),(0,Q.jsx)(`button`,{className:`t-btn t-btn-primary t-wt-campaign-cta`,type:`button`,disabled:A,onClick:()=>c(fe),children:g.activeMissionRun?.missionId?`RESUME CAMPAIGN`:`CONTINUE CAMPAIGN`})]}):null,fe===`dead-relay-hold`?(0,Q.jsxs)(`div`,{className:`t-mission-strip`,children:[(0,Q.jsx)(`span`,{children:`HOLD THREAT`}),(0,Q.jsx)(`strong`,{children:Nl(s).copy})]}):null,(0,Q.jsx)(`div`,{className:`t-brief-grid t-wt-canon-grid`,children:xt.orderedMissionIds.map((e,t)=>{let n=W(e);if(!n)return null;let r=g.missions[e]||`locked`,i=g.activeMissionRun?.missionId===e;return(0,Q.jsxs)(`div`,{className:`t-panel t-brief-block t-story-mission is-${r}`,children:[(0,Q.jsxs)(`span`,{className:`t-kicker t-wt-story-type`,children:[(0,Q.jsx)(wl,{mission:n}),` MISSION `,String(t+1).padStart(2,`0`),` · `,n.objectiveType]}),(0,Q.jsx)(`strong`,{children:n.name}),(0,Q.jsx)(`small`,{children:r===`cleared`?`CLEARED`:r===`available`?`AVAILABLE`:`LOCKED`}),(0,Q.jsx)(`button`,{type:`button`,className:`t-btn`,disabled:A||r===`locked`,onClick:()=>c(e),children:i?`RESUME FROM START`:r===`cleared`?`REPLAY`:r===`available`?`VIEW BRIEF`:`LOCKED`})]},e)})}),(0,Q.jsx)(`small`,{children:`Resume restarts the accepted battle from turn 1; mid-battle positions and HP are not saved.`})]}):null;return(0,Q.jsxs)(`div`,{className:`t-fill`,children:[(0,Q.jsx)(kl,{dim:.5,art:bl.startHero,className:`t-bg-hero`}),(0,Q.jsx)(`div`,{className:`t-vignette`}),(0,Q.jsxs)(`div`,{className:`t-brief t-war-table-premium t-war-table-v29 t-command-art-shell t-premium-ux t-command-deck-v3`,style:{maxWidth:`64rem`},children:[(0,Q.jsxs)(`header`,{className:`t-panel t-wt-hero t-wt-hero-compact`,children:[(0,Q.jsxs)(`div`,{className:`t-wt-branding`,children:[(0,Q.jsx)(`div`,{className:`t-kicker`,children:`Alpha Husky / Tactical Ops`}),(0,Q.jsx)(`h1`,{className:`t-title t-wt-title`,children:`TACTICAL OPS`}),p&&!i?(0,Q.jsx)(`p`,{className:`t-wt-error`,role:`alert`,children:p}):null,m?(0,Q.jsx)(`p`,{className:`t-wt-highlight`,children:pe}):null]}),(0,Q.jsx)(`button`,{className:`t-wt-refresh`,type:`button`,disabled:A,onClick:()=>void ee(),"aria-label":`Refresh Tactical Ops`,children:A?`SYNCING…`:`REFRESH`})]}),(0,Q.jsx)(`nav`,{className:`t-command-nav t-command-framed-nav`,"aria-label":`Tactical command sections`,children:[[`command`,`01`,`COMMAND`],[`missions`,`02`,`MISSIONS`],[`squad`,`03`,`SQUAD`],[`archive`,`04`,`ARCHIVE`]].map(([n,r,i])=>(0,Q.jsxs)(`button`,{type:`button`,className:e===n?`is-current`:``,"aria-pressed":e===n,onClick:()=>t(n),children:[(0,Q.jsx)(`span`,{children:r}),(0,Q.jsx)(`strong`,{children:i})]},n))}),e===`command`?(0,Q.jsxs)(`div`,{className:`t-command-pane`,"aria-label":`Command overview`,children:[R&&w?(()=>{let e=Sl(R),t=!w.resume&&w.title===x?.title?x:null,n=!w.resume&&R.activity===`FIELD_OP`?Zs(R.missionId,_?.board,_?.region,Date.now(),w.tier,!w.chapter&&s?.vnextStartAvailable===!0):null;return(0,Q.jsxs)(`section`,{className:`t-panel t-wt-feature t-wt-next-op t-command-mission-feature t-command-order t-mission-tone-${e.tone}`,"aria-label":`Recommended next operation`,"data-primary-purpose":`true`,"data-purpose-mission":R.missionId,children:[(0,Q.jsxs)(`div`,{className:`t-wt-feature-art`,children:[(0,Q.jsx)(Cl,{mission:R,fallback:e.art,eager:!0}),(0,Q.jsxs)(`span`,{className:`t-wt-art-label`,children:[(0,Q.jsx)(wl,{mission:R}),e.label]})]}),(0,Q.jsxs)(`div`,{className:`t-wt-feature-copy`,children:[(0,Q.jsx)(`div`,{className:`t-kicker t-cd-operation-label`,children:w.resume?`ACCEPTED OPERATION`:`NEXT OPERATION`}),(0,Q.jsx)(`h2`,{children:R.name}),(0,Q.jsx)(`p`,{className:`t-wt-objective`,children:t?.reason??B?.objectiveText}),(0,Q.jsxs)(`div`,{className:`t-command-order-value`,children:[(0,Q.jsx)(`strong`,{children:t?`FIELD CONTRACT · ${t.title}`:w.resume?`SQUAD SAVED`:w.title}),(0,Q.jsx)(`p`,{children:t?b?.sidegrade?`Complete the remaining contract to earn Field Tested honor.`:b?.completed.length===1?`Complete this contract to unlock Reach Rend.`:`Complete two Field Contracts to unlock Reach Rend.`:w.resume?or(z?.runId)?`Resume from your last confirmed action.`:`Resume with the accepted squad from round 1.`:w.reason})]}),n?(0,Q.jsx)(`p`,{className:`t-brief-purpose-meta`,"data-g4-command-window":`true`,children:n.text}):null]}),(0,Q.jsx)(`div`,{className:`t-wt-feature-cta`,children:(0,Q.jsxs)(`button`,{className:`t-btn t-btn-primary t-wt-main-cta t-command-hero-cta`,type:`button`,disabled:A,onClick:()=>E(w),children:[w.resume?`RESUME OP`:w.tier===`advanced`?`REVIEW ADVANCED`:`VIEW BRIEF`,(0,Q.jsx)(ue,{className:`t-ico`})]})})]})})():(0,Q.jsx)(`p`,{role:`status`,children:`Refresh to see available operations.`}),(0,Q.jsxs)(`section`,{className:`t-command-progress`,"aria-label":`Commander progress`,"data-veteran-career":oe?`true`:void 0,children:[(0,Q.jsxs)(`div`,{className:`t-command-progress-line`,children:[(0,Q.jsx)(`strong`,{children:se}),oe?(0,Q.jsxs)(`span`,{children:[`VETERAN · `,oe.credits,`/`,12]}):V?(0,Q.jsxs)(`span`,{children:[ae,`/`,V,` POINTS`]}):null]}),oe?(0,Q.jsxs)(Q.Fragment,{children:[(0,Q.jsx)(`progress`,{className:`t-progress`,"aria-label":`Veteran career credits`,value:oe.credits,max:12}),(0,Q.jsx)(`small`,{children:ie>=4?`Pack Extraction unlocked`:`Next · Rank 4 requires credits and diversity`})]}):V?(0,Q.jsxs)(Q.Fragment,{children:[(0,Q.jsx)(`progress`,{className:`t-progress`,"aria-label":`Commander rank points`,value:Math.min(ae,V),max:V}),(0,Q.jsxs)(`small`,{children:[`Next · Rank `,ie+1]})]}):null]}),v?.enabled?(0,Q.jsxs)(`section`,{className:`t-panel t-field-contract`,"aria-label":`Signal Trials`,"data-signal-trials":`true`,children:[(0,Q.jsx)(`div`,{className:`t-kicker`,children:`SIGNAL TRIALS · RELAY PRESSURE`}),(0,Q.jsxs)(`h2`,{className:`t-title`,children:[v.highestCleared,`/6 LEVELS CLEARED`]}),(0,Q.jsx)(`p`,{children:`Hold the relay under pressure. Contest → Flank → Reposition. Each level changes the tactical decision; no extra currency or rewards.`}),(0,Q.jsx)(`button`,{className:`t-btn t-btn-primary`,type:`button`,disabled:A,onClick:()=>u(v.activeRun?.level||Math.min(6,v.highestCleared+1)),children:v.activeRun?`RESUME TRIAL ${v.activeRun.level}`:v.highestCleared===6?`REPLAY TRIAL 6`:`PLAY TRIAL ${v.highestCleared+1}`})]}):null,b?.enabled||b?.honor?(0,Q.jsxs)(`details`,{className:`t-purpose-memory t-command-records t-cd-records`,"aria-label":`Field Contracts`,children:[(0,Q.jsxs)(`summary`,{children:[`FIELD CONTRACTS `,(0,Q.jsxs)(`span`,{children:[b.completed.length,`/3`]})]}),(0,Q.jsxs)(`div`,{className:`t-cd-record-body`,children:[(0,Q.jsx)(`strong`,{children:b.honor?`Field Honor · ${j}`:b.sidegrade?`Next reward · Field Tested honor`:`2 contracts unlock Reach Rend`}),x&&w?.title!==x.title?(0,Q.jsxs)(`p`,{children:[x.title,` · `,x.reason]}):null,!x&&b.completed.length<3?(0,Q.jsx)(`p`,{children:`Check the next rotation for an unfinished contract.`}):null]})]}):null,S.alternatives.length?(0,Q.jsxs)(`details`,{className:`t-purpose-alternatives`,"aria-label":`Optional alternatives`,children:[(0,Q.jsx)(`summary`,{children:`Other operations`}),S.alternatives.map(e=>(0,Q.jsxs)(`article`,{"data-purpose-mission":e.missionId,children:[(0,Q.jsxs)(`span`,{className:`t-kicker t-wt-story-type`,children:[W(e.missionId)?(0,Q.jsx)(wl,{mission:W(e.missionId)}):null,e.title]}),(0,Q.jsx)(`h3`,{children:W(e.missionId)?.name}),(0,Q.jsx)(`p`,{children:e.reason}),(0,Q.jsx)(`button`,{type:`button`,className:`t-btn`,disabled:A,onClick:()=>E(e),children:e.tier===`advanced`?`REVIEW ADVANCED`:`VIEW BRIEF`})]},e.missionId))]}):null,(0,Q.jsxs)(`details`,{className:`t-purpose-memory t-command-records t-cd-records`,"aria-label":`Permanent records and squad opportunity`,children:[(0,Q.jsxs)(`summary`,{children:[`FIELD ARCHIVE `,(0,Q.jsx)(`span`,{children:`RECORDS & SQUAD INTEL`})]}),(0,Q.jsxs)(`div`,{className:`t-cd-record-body`,children:[(0,Q.jsx)(`span`,{className:`t-kicker`,children:`PERMANENT FIELD RECORD`}),C().openFieldRecord?(0,Q.jsx)(`button`,{type:`button`,className:`t-btn`,onClick:C().openFieldRecord,children:`VIEW SERVICE RECORD`}):null,_?.veteranProgressionAvailable&&ie>=3?(0,Q.jsxs)(`div`,{"data-opportunity-status":T.status,children:[oe?(0,Q.jsx)(`p`,{children:rn(oe)}):null,(0,Q.jsx)(`p`,{children:T.copy}),ie>=4?(0,Q.jsx)(`button`,{type:`button`,className:`t-btn`,disabled:!!_?.activeMissionRun,onClick:()=>Z.getState().openVeteranBrief(),children:`PLAY PACK EXTRACTION`}):null]}):null,_?.masteryPath?(0,Q.jsxs)(`p`,{"data-mastery-progress":`true`,children:[`RELAY MASTERY · `,_.masteryPath.accomplishment?`1/1 · Relay Lockdown permanently unlocked.`:(_.commander?.rank||0)>=3?`0/1 · Win an Advanced Relay Hold or Isolated Hold. One is available each rotation.`:`0/1 · Reach Commander Rank 3, then win an Advanced HOLD to unlock Relay Lockdown.`]}):null,_?.masteryPath?.firstLockdownClear?(0,Q.jsx)(`p`,{"data-lockdown-completion":`true`,children:`RELAY LOCKDOWN · FIRST CLEAR RECORDED · Persists across rotations.`}):null,D?(0,Q.jsxs)(`p`,{children:[D.missions,` Field secures · `,D.challenges,` challenges · `,D.advanced,` Advanced clears · `,D.fronts,` fronts secured`]}):null,_?.lastResult?(0,Q.jsxs)(`details`,{className:`t-command-record-details`,children:[(0,Q.jsxs)(`summary`,{children:[`LAST MISSION · `,W(_.lastResult.missionId)?.name||_.lastResult.missionId]}),(0,Q.jsx)(`p`,{children:Nr(_.lastResult).changed})]}):null,(()=>{let e=[`ally-02`,`ally-03`,...s?.equippedPet?[`pet:${s.equippedPet.id}`]:[]].map(e=>Js(e,s||{},s?.equippedPet)).find(Boolean);return e?(0,Q.jsxs)(`p`,{children:[e.subject,`: `,e.changes[0],`. Compare your saved specialization before deploying.`]}):(0,Q.jsx)(`p`,{children:`Review saved abilities and squad roles before your next mission.`})})(),(0,Q.jsx)(`button`,{type:`button`,className:`t-btn`,onClick:()=>t(`squad`),children:`REVIEW SQUAD DEVELOPMENT`})]})]}),(0,Q.jsxs)(`section`,{className:`t-wt-status-rail t-wt-status-rail-v29 t-premium-status-rail t-cd-status`,"aria-label":`Tactical Ops overview`,children:[_?.board?(0,Q.jsxs)(`div`,{className:`t-panel t-wt-status-card`,children:[(0,Q.jsx)(`span`,{className:`t-kicker`,children:`Field Ops secured`}),(0,Q.jsxs)(`strong`,{children:[F?.securedCount??M.filter(e=>_.records[e]?.lastClearCycle===P).length,`/`,F?.total??M.length,` FIELD OPS SECURED`]})]}):null,(0,Q.jsxs)(`div`,{className:`t-panel t-wt-status-card t-wt-pressure-card is-${ce.toLowerCase()}`,children:[(0,Q.jsx)(`span`,{className:`t-kicker`,children:`Area status`}),(0,Q.jsx)(`strong`,{children:ce}),(0,Q.jsx)(`small`,{children:le}),de?(0,Q.jsxs)(`small`,{"data-g4-world-window":`true`,children:[W(de.id)?.name,` · `,de.window?.text]}):null]}),(0,Q.jsxs)(`div`,{className:`t-panel t-wt-status-card`,children:[(0,Q.jsx)(`span`,{className:`t-kicker`,children:`Rotation`}),(0,Q.jsx)(`strong`,{children:re}),(0,Q.jsxs)(`small`,{children:[M.length||0,` active Field Ops`,H?` · ${H}`:``]})]})]}),_?.board&&F?(0,Q.jsxs)(`button`,{type:`button`,className:`t-premium-front-link`,onClick:()=>t(`missions`),children:[(0,Q.jsxs)(`span`,{children:[(0,Q.jsx)(`strong`,{children:`FRONT STATUS`}),(0,Q.jsxs)(`small`,{children:[F.securedCount,`/`,F.total,` SECURED · `,F.challengeMissionIds.length,` CHALLENGES`]})]}),(0,Q.jsxs)(`span`,{children:[`VIEW MISSIONS `,(0,Q.jsx)(ue,{className:`t-ico`})]})]}):null]}):null,e===`missions`?(0,Q.jsxs)(`div`,{className:`t-command-pane`,"aria-label":`Operations and field missions`,children:[O&&k?(0,Q.jsxs)(`section`,{className:`t-panel t-chapter-readout`,"aria-label":`Server accepted doctrine chapter`,children:[(0,Q.jsx)(`div`,{className:`t-kicker`,children:`CAMPAIGN CHAPTER · SERVER RECORDED`}),(0,Q.jsx)(`h2`,{className:`t-title`,children:k.title}),(0,Q.jsx)(`div`,{className:`t-chapter-steps`,children:O.status===`AVAILABLE`?Object.entries(Nt).map(([e,t])=>(0,Q.jsxs)(`div`,{children:[(0,Q.jsxs)(`strong`,{children:[e,` · `,t.title]}),(0,Q.jsx)(`p`,{children:t.copy}),e===`RECON`?(0,Q.jsx)(`button`,{type:`button`,className:`t-btn t-btn-primary`,disabled:A||f,onClick:()=>void l(),children:`COMMIT TO GHOST SIGNAL`}):(0,Q.jsx)(`small`,{children:`Future doctrine · not yet operational`})]},e)):(0,Q.jsxs)(Q.Fragment,{children:[(0,Q.jsxs)(`strong`,{children:[k.stage,` / `,k.total,` OPERATIONS VERIFIED`]}),(0,Q.jsx)(`p`,{children:k.nextMissionName?`NEXT · ${k.nextMissionName}`:`CHAPTER COMPLETE`})]})}),O.status===`ACTIVE`&&O.doctrine===`RECON`?(0,Q.jsx)(`button`,{type:`button`,className:`t-btn t-btn-primary`,disabled:A||f,onClick:()=>d(),children:O.activeRunId?`RESUME CHAPTER RUN`:`DEPLOY NEXT CHAPTER OP`}):null,O.status===`COMPLETED`?(0,Q.jsx)(`strong`,{children:O.intelConsumedByRunId?`INTEL DEPLOYED IN AN ACCEPTED RUN`:`RECON INTEL READY · DELAY NEXT ELIGIBLE REINFORCEMENT`}):null,(0,Q.jsx)(`p`,{children:k.consequence}),(0,Q.jsx)(`small`,{children:O.status===`AVAILABLE`?`Doctrine selection becomes playable only after the server exposes a verified choice action. No client-only selection.`:`Mission progress advances only on the next accepted server receipt. Existing Field Ops can still be played normally.`})]}):null,g?.status===`cleared`?null:me,v?.enabled?(0,Q.jsxs)(`section`,{className:`t-panel t-wt-section`,"aria-label":`Relay Pressure levels`,children:[(0,Q.jsxs)(`div`,{className:`t-wt-section-head`,children:[(0,Q.jsxs)(`div`,{children:[(0,Q.jsx)(`span`,{className:`t-kicker`,children:`SIX TACTICAL TESTS`}),(0,Q.jsx)(`h2`,{className:`t-title`,children:`SIGNAL TRIALS`})]}),(0,Q.jsxs)(`strong`,{children:[v.highestCleared,`/6`]})]}),(0,Q.jsx)(`div`,{className:`t-brief-grid t-wt-canon-grid`,children:Array.from({length:6},(e,t)=>t+1).map(e=>{let t=is(e,1),n=e<=v.highestCleared+1||v.activeRun?.level===e,r=v.activeRun?.level===e;return(0,Q.jsxs)(`div`,{className:`t-panel t-brief-block`,children:[(0,Q.jsxs)(`span`,{className:`t-kicker`,children:[`TRIAL `,String(e).padStart(2,`0`)]}),(0,Q.jsx)(`strong`,{children:t.name}),(0,Q.jsx)(`small`,{children:e<=v.highestCleared?`CLEARED`:r?`ACCEPTED`:n?`AVAILABLE`:`LOCKED`}),(0,Q.jsx)(`p`,{children:t.squadHint}),(0,Q.jsx)(`button`,{className:`t-btn`,type:`button`,disabled:!n||A||!(!v.activeRun||r),onClick:()=>u(e),children:r?`RESUME`:e<=v.highestCleared?`REPLAY`:`VIEW BRIEF`})]},e)})})]}):null,(0,Q.jsxs)(`section`,{className:`t-panel t-wt-section t-wt-current-ops t-cd-current-ops`,"aria-label":`Current Field Ops`,children:[(0,Q.jsxs)(`div`,{className:`t-wt-section-head`,children:[(0,Q.jsxs)(`div`,{children:[(0,Q.jsx)(`div`,{className:`t-kicker`,children:`This rotation`}),(0,Q.jsx)(`h2`,{className:`t-title`,children:`CURRENT FIELD OPS`})]}),(0,Q.jsxs)(`span`,{className:`t-cd-live-count`,children:[M.length,` ACTIVE`]})]}),(0,Q.jsx)(`nav`,{className:`t-op-selector`,"aria-label":`Select a Field Op`,children:N.map((e,t)=>(0,Q.jsxs)(`button`,{type:`button`,"aria-pressed":(a&&M.includes(a)?a:M[0])===e.missionId,className:(a&&M.includes(a)?a:M[0])===e.missionId?`is-selected`:``,onClick:()=>o(e.missionId),children:[(0,Q.jsx)(`span`,{children:String(t+1).padStart(2,`0`)}),(0,Q.jsx)(wl,{mission:e}),(0,Q.jsx)(`strong`,{children:e.name}),(0,Q.jsx)(`small`,{children:I.has(e.missionId)?`SECURED`:`FIRST CLEAR`})]},e.missionId))}),(0,Q.jsx)(`div`,{className:`t-wt-mission-list t-op-selected t-cd-selected-operation`,children:N.filter(e=>e.missionId===(a&&M.includes(a)?a:M[0])).map(e=>{let t=_?.records[e.missionId],n=t?.lastClearCycle===_?.board?.cycleId,r=t?.lastChallengeCycle===_?.board?.cycleId,i=At(e,{reportVersion:_?.board?.reportVersion||2}),a=Sl(i),o=Tr(i,_),l=Zs(e.missionId,_?.board,_?.region,Date.now(),`standard`,s?.vnextStartAvailable===!0);return(0,Q.jsxs)(`article`,{className:`t-wt-mission-card t-panel t-mission-tone-${a.tone} ${n?`is-cleared`:`is-active`}`,children:[(0,Q.jsxs)(`div`,{className:`t-wt-mission-art`,children:[(0,Q.jsx)(Cl,{mission:i,fallback:a.art}),(0,Q.jsxs)(`span`,{className:`t-wt-mission-type`,children:[(0,Q.jsx)(wl,{mission:i}),a.label]})]}),(0,Q.jsxs)(`div`,{className:`t-wt-mission-body`,children:[(0,Q.jsxs)(`div`,{className:`t-wt-mission-head`,children:[(0,Q.jsxs)(`div`,{children:[(0,Q.jsx)(`h3`,{children:e.name}),(0,Q.jsx)(`p`,{children:El(i)})]}),(0,Q.jsx)(`div`,{className:`t-wt-mission-state`,"data-availability":n?`secured`:`available`,children:n?`SECURED TODAY`:`AVAILABLE`})]}),(0,Q.jsxs)(`div`,{className:`t-player-mission-counter`,children:[`OPERATION `,M.indexOf(e.missionId)+1,` / `,M.length,` · `,a.label,` · `,n?`CLEARED`:`UNCLEARED`]}),l?(0,Q.jsx)(`p`,{className:`t-brief-purpose-meta`,"data-g4-mission-window":`true`,children:l.text}):null,(0,Q.jsxs)(`div`,{className:`t-wt-mission-meta`,"aria-label":`Confirmed reward eligibility`,children:[(0,Q.jsxs)(`span`,{children:[(0,Q.jsx)(`b`,{children:`CLEAR`}),` `,o.rewardClearText]}),(0,Q.jsxs)(`span`,{className:r?`is-earned`:``,children:[(0,Q.jsx)(`b`,{children:`CHALLENGE`}),` `,o.rewardChallengeText,` · `,i.challenge?.label]})]}),(0,Q.jsxs)(`details`,{className:`t-detail t-wt-card-detail`,children:[(0,Q.jsx)(`summary`,{children:`Field conditions`}),(0,Q.jsxs)(`p`,{children:[(0,Q.jsxs)(`strong`,{children:[Dl(e),`.`]}),` `,o.tacticalThreat]}),(0,Q.jsxs)(`p`,{children:[(0,Q.jsx)(`strong`,{children:`Area:`}),` `,le]})]})]}),(0,Q.jsx)(`div`,{className:`t-wt-mission-cta`,children:(0,Q.jsxs)(`button`,{className:`t-btn t-btn-primary`,type:`button`,disabled:A,onClick:()=>c(e.missionId),children:[n?`DEPLOY AGAIN`:`VIEW BRIEF`,(0,Q.jsx)(ue,{className:`t-ico`})]})})]},e.missionId)})})]})]}):null,e===`squad`?(0,Q.jsxs)(`div`,{className:`t-command-pane`,"aria-label":`Character progression and mastery`,children:[b?.enabled&&b.sidegrade?(0,Q.jsxs)(`section`,{className:`t-panel t-field-contract`,"aria-label":`Field loadout`,children:[(0,Q.jsx)(`div`,{className:`t-kicker`,children:`ALPHA · FIELD LOADOUT`}),(0,Q.jsx)(`strong`,{children:b.selection===`reach-rend`?`Reach Rend equipped`:`Rend equipped`}),(0,Q.jsxs)(`p`,{children:[te,`. Change A2 in a Field Op’s Loadout.`]})]}):null,(0,Q.jsxs)(`div`,{className:`t-premium-squad-switch`,role:`group`,"aria-label":`Squad progression view`,children:[(0,Q.jsx)(`button`,{type:`button`,"aria-pressed":n===`skillbook`,className:n===`skillbook`?`is-selected`:``,onClick:()=>r(`skillbook`),children:`SIGNAL ATLAS`}),(0,Q.jsx)(`button`,{type:`button`,"aria-pressed":n===`mastery`,className:n===`mastery`?`is-selected`:``,onClick:()=>r(`mastery`),children:`PACK MASTERY`})]}),n===`skillbook`?(0,Q.jsx)(ul,{onClose:()=>t(`command`)}):(0,Q.jsx)(Gc,{})]}):null,e===`archive`?(0,Q.jsxs)(`div`,{className:`t-command-pane`,"aria-label":`Campaign archive and test settings`,children:[g?.status===`cleared`?me:null,(0,Q.jsxs)(`details`,{className:`t-panel t-wt-story-archive`,children:[(0,Q.jsxs)(`summary`,{children:[(0,Q.jsxs)(`span`,{children:[(0,Q.jsx)(`span`,{className:`t-kicker`,children:`Story archive`}),(0,Q.jsx)(`strong`,{children:`OPERATION 01 · BROKEN SIGNAL`})]}),(0,Q.jsx)(`b`,{children:h?.status===`cleared`?`COMPLETE`:`IN PROGRESS`})]}),(0,Q.jsx)(`p`,{children:h?.status===`cleared`?`Canon secured. Replay the three story missions whenever you want.`:`Complete BREACH → RECOVER SIGNAL → SIGNAL COMMANDER to secure the operation.`}),(0,Q.jsx)(`div`,{className:`t-brief-grid t-wt-canon-grid`,children:bt.orderedMissionIds.map((e,t)=>{let n=W(e);if(!n)return null;let r=h?.missions[e]||`locked`,i=n.executable&&(r===`available`||r===`cleared`);return(0,Q.jsxs)(`div`,{className:`t-panel t-brief-block t-story-mission is-${r}`,children:[(0,Q.jsxs)(`span`,{className:`t-kicker t-wt-story-type`,children:[(0,Q.jsx)(wl,{mission:n}),` MISSION `,String(t+1).padStart(2,`0`)]}),(0,Q.jsx)(`strong`,{children:n.name}),(0,Q.jsx)(`small`,{children:r===`cleared`?`CLEARED`:r===`available`?`AVAILABLE`:`LOCKED`}),(0,Q.jsx)(`button`,{type:`button`,className:`t-btn`,disabled:!i,onClick:()=>c(e),children:r===`cleared`?`REPLAY`:r===`available`?`VIEW BRIEF`:`LOCKED`})]},e)})})]}),_?.lastResult?(0,Q.jsxs)(`details`,{className:`t-detail t-wt-last-result t-wt-secondary-detail`,children:[(0,Q.jsxs)(`summary`,{children:[`Last result · `,Qe(_.lastResult.recordedAt)]}),(0,Q.jsxs)(`strong`,{children:[W(_.lastResult.missionId)?.name,` · `,_.lastResult.victory?`CLEARED`:`FAILED`]}),(0,Q.jsx)(Ml,{result:_.lastResult})]}):null,(0,Q.jsxs)(`section`,{className:`t-panel t-wt-battlefield-lab`,"aria-label":`Battlefield Lab testing mode`,children:[(0,Q.jsxs)(`div`,{children:[(0,Q.jsx)(`span`,{className:`t-kicker`,children:`BATTLEFIELD LAB · DEVICE TEST`}),(0,Q.jsx)(`strong`,{children:Ee?`10 × 7 · EXPERIMENTAL`:`8 × 5 · CURRENT`}),(0,Q.jsx)(`p`,{children:`Compare real missions with your signed-in Alpha account. This setting changes only the battlefield on this device. It does not reset or replace your account.`})]}),(0,Q.jsx)(`button`,{type:`button`,className:`t-btn`,"aria-label":Ee?`Switch to current 8 by 5 battlefield`:`Switch to experimental 10 by 7 battlefield`,onClick:()=>{try{if(Ee){window.localStorage.removeItem(Te);let e=new URL(window.location.href);if(e.searchParams.has(`tacticalBattlefieldVNext`)){e.searchParams.delete(`tacticalBattlefieldVNext`),window.location.replace(e.toString());return}}else window.localStorage.setItem(Te,`10x7`);window.location.reload()}catch{window.alert(`Could not save the test mode on this device.`)}},children:Ee?`USE 8 × 5`:`TEST 10 × 7`})]})]}):null]})]})}var Fl={"ally-02":[{name:`Vanguard`,slot:`A2`},{name:`Disruptor`,slot:`A3`}],"ally-03":[{name:`Restorer`,slot:`A2`},{name:`Warden`,slot:`A3`}]};function Il(e){return e.defId===`alpha`?`ALPHA`:e.defId===`ally-02`?`CNC`:e.defId===`ally-03`?`SHADOW`:e.defId.startsWith(`pet:`)?`PET`:e.name}function Ll(e){return e.targetType===`SELF`?`Self`:e.maxRange===0&&e.radius>0?`Radius ${e.radius}`:`Range ${e.minRange===e.maxRange?e.maxRange:`${e.minRange}–${e.maxRange}`}`}function Rl(e){let t=e.effects;return t.some(e=>e.status===`SPD_UP`&&e.on===`self`)?`Gain speed on hit`:t.some(e=>e.status===`SPD_DOWN`)?t.some(e=>e.kind===`damage`)?`Hit and slow`:`Slow without damage`:t.some(e=>e.status===`GUARD`)?t.some(e=>e.kind===`heal`)?`Heal and guard`:`Guard allies`:t.some(e=>e.kind===`heal`)?e.targetType===`ALLY_AOE`?`Heal nearby allies`:`Heal one ally`:Ll(e)}function zl(){let e=Z(e=>e.briefEntry),[t,n]=(0,y.useState)(e===`alpha-a2`?`loadout`:e===`squad`?`squad`:`mission`),r=(0,y.useRef)(null);(0,y.useEffect)(()=>{e===`alpha-a2`&&r.current?.focus()},[e]);let[i,a]=(0,y.useState)(`alpha`),[o,s]=(0,y.useState)(!1),c=Z(e=>e.identity),l=Z(e=>e.deploy),u=Z(e=>e.backToHub),d=Z(e=>e.onboardingEnabled),f=Z(e=>e.onboardingStageId),p=Z(e=>e.selectedMissionId),m=Z(e=>e.selectedTrialLevel),h=Z(e=>e.selectedSquadIds),g=Z(e=>e.selectedApproach),_=Z(e=>e.selectedDirectiveTier),v=Z(e=>e.selectedVeteranChallenge),b=Z(e=>e.selectedLockdownPlan),x=Z(e=>e.selectLockdownPlan),S=Z(e=>e.selectedMasteryChallenge),C=Z(e=>e.selectDirectiveTier),w=Z(e=>e.selectApproach),T=Z(e=>e.progression?.fieldOps),E=Z(e=>e.progression?.packMastery),D=Z(e=>e.progression?.playerGrowth),ee=Z(e=>e.selectRecoverTeammate),A=Z(e=>e.toggleCommanderTeammate),j=Z(e=>e.progression?.equippedPet),te=Z(e=>e.progression?.kodaSidegrade),M=Z(e=>e.progression?.operations?.[`broken-signal`]?.status===`cleared`),P=Z(e=>e.kodaSavePending),F=Z(e=>e.selectKodaSidegrade),I=Z(e=>e.progression?.shadowSidegrade),L=Z(e=>e.shadowSavePending),R=Z(e=>e.selectShadowSidegrade),z=Z(e=>e.progressionError),B=Z(e=>e.busy),re=qo(d,f),ie=Z(e=>e.chapterMode),ae=Z(e=>e.progression?.chapterActiveMission),V=Z(e=>e.progression),oe=V?.operations?.[xt.operationId]?.activeMissionRun,se=p===`dead-relay-hold`&&!ie?Nl(V):null,ce=m===null?W(p):is(m,1),le=ce?.operationId===xt.operationId,de=m===null?null:V?.signalTrials?.activeRun,H=m===null?ie?ae:le?oe:T?.activeMissionRun:null,fe=(0,y.useRef)(null);(0,y.useEffect)(()=>{p===`field-relay-intercept`&&H?.runId&&(n(`mission`),fe.current?.scrollTo({top:0}))},[p,H?.runId]);let pe=m===null?H?.missionId===p&&H.squadIds.join(`,`)===h.join(`,`)&&(H.fieldContext?.approach||`standard`)===g&&(H.fieldContext?.directiveTier||`standard`)===_:de?.level===m,me=pe?Sc(V,de?.runId||H?.runId):null,ge=pe&&H?.fieldContext?H.fieldContext:v?{reportVersion:6,veteranChallenge:`pack-extraction-v1`,pressure:2,directiveTier:`advanced`,directiveSet:`pursuit`}:S?{pressure:2,reportVersion:T?.lockdownPlansAvailable?5:4,...T?.lockdownPlansAvailable?{lockdownPlan:b}:{},directiveTier:`advanced`,directiveSet:`pursuit`,masteryChallenge:S}:{pressure:T?.region?.pressure??2,reportVersion:T?.board?.reportVersion||2,directiveTier:_,directiveSet:T?.board?.directiveSet},_e=pe?H?.rulesContract?.missionRevision:!ie&&!H&&V?.vnextStartAvailable&&ce?Ot(ce.missionId,Me,T?.board):void 0,U=m===null?se?.mission??(ce?At(ce,ge,_e,H?.campaignContext):null):ce,ve=m===null&&U?.activity===`FIELD_OP`,ye=T?.fieldContracts,be=ve&&!ie&&!S&&!v,xe=!H&&V?.vnextStartAvailable&&ge.reportVersion===3,Se=be&&U&&ye?.enabled?N(U.missionId):null,Ce=Se&&ye?.completed.includes(Se.id),we=Se&&(pe?H?.fieldContext?.fieldContractsVersion===1:xe&&T?.board&&T.board.nextRotationAt*1e3>Date.now()&&ye?.eligibleMissionIds.includes(U.missionId)),Te=()=>!!(T?.board&&T.board.nextRotationAt*1e3>Date.now()&&p&&T.board.activeMissionIds.includes(p)),Ee=be&&xe&&ye?.enabled&&ye.sidegrade&&Te(),De=de?.fieldRend||(pe?H?.fieldContext?.fieldRend:be&&xe&&ye?.enabled?ye.selection:void 0),Oe=Z(e=>e.fieldRendSavePending),ke=Z(e=>e.selectFieldRend),Ae=cn(T,U?.missionId,ge,pe),je=ve&&U?pe?Xs(U,H?.fieldContext):Zs(U.missionId,T?.board,T?.region,Date.now(),_,!ie&&!H&&V?.vnextStartAvailable===!0):null,Ne=!!(U&&(ve||le||m!==null||U.objectiveType===`BOSS`)),Pe=U?jt(U,h,j,g)||(ve||le?jt(U,[`alpha`,`ally-02`,`ally-03`],j):U.objectiveType===`RECOVER`?vt([`alpha`,`ally-02`]):gt.filter(e=>![`ally-02`,`ally-03`].includes(e.defId))):re.spawns,Fe=U?Br(ne(Pe,De),{kodaSidegrade:te,shadowSidegrade:I,packMastery:pe?H?.packMastery||{}:E}):Pe,Ie=U?nt(U,ge):[],Le=t===`loadout`?lt(Ie):null,Re=Z(e=>e.currentChapterIntel),ze=U&&(ve||le)?Re?.effectiveRound||Mt(U,!1,ge,H?.campaignContext).reinforcement?.triggerRound:void 0,Be=se&&ce?ce.name:U?U.name:d?re.operationName:O.name,Ve=U?U.briefCopy:d?re.objective:O.objective,He=Jo(Fe).map(e=>Aa(e,c)),Ue=de?.playerGrowth||(pe?H?.playerGrowth:D),Ge=pe?H?.combatProfileV2?.pet:null,Ye=t===`loadout`&&U?jt(U,h,Ge||j,g):Fe,Ze=t!==`loadout`||!Ye?[]:Ye===Fe?He:Jo(Br(ne(Ye,De),{kodaSidegrade:te,shadowSidegrade:I,packMastery:pe?H?.packMastery||{}:E})).map(e=>Aa(e,c)),$e=Ze.find(e=>e.defId===i)||Ze[0],et=$e?.defId===`alpha`&&be&&(!!(ye?.enabled&&ye.sidegrade)||De===`reach-rend`),tt=pe?De??`rend`:Ee?De:void 0,rt=U&&($e?.defId===`ally-02`||$e?.defId===`ally-03`)?$e.defId:null,at=rt===`ally-02`,ot=at?te:I,st=at?F:R,ct=at?P:L,ut=pe?H?.rulesContract?.rulesetVersion===Me:ie||!!V?.vnextStartAvailable,dt=t===`loadout`?Ze.map(e=>({...e,skillIds:e.skillIds.filter(e=>!!un[e])})):[],ft=pl(dt,Ue),pt=ml(dt,Ue),mt=hl(pt,Ue,ut),ht=t===`loadout`?Po(U,Ze.map(e=>e.defId),ut):[],_t={INTERRUPT:[`cancel locked attacks`,`attack cancel`],SLOW:[`slow enemies`,`enemy slow`],PROTECT:[`protect allies`,`ally protection`],RECOVER:[`heal allies`,`healing`]},yt=U?.objectiveType===`INTERCEPT`?`SLOW`:U?.objectiveType===`HOLD`?`PROTECT`:U?.objectiveType===`SURVIVE`?`RECOVER`:null,bt=mt.find(e=>e.id===yt),St=mt.filter(e=>e.available),Ct=bt?.available?bt:St[0],wt=St.find(e=>e!==Ct),Tt=Ze.length?Ct?`Can ${_t[Ct.id][0]}${bt&&!bt.available?` · No ${_t[bt.id][1]}`:wt?` and ${_t[wt.id][0]}`:``}.`:bt?`No ${_t[bt.id][1]} in this loadout.`:`No squad counters equipped.`:`Choose a valid squad in the Squad tab.`,Et=Yo(Fe),Dt=U?`${U.objectiveType} · Squad cap ${U.squadCap}. `:d?re.teaching:`Units act individually by Speed. Alpha must close to melee range 1 before Strike or Rend.`,kt=ve||le||m!==null?`PRIMARY OBJECTIVE: ${U.objectiveType}`:U?.objectiveType===`RECOVER`?`PRIMARY OBJECTIVE: RECOVER THE SIGNAL`:U?.objectiveType===`BOSS`?`PRIMARY OBJECTIVE: DEFEAT THE SIGNAL COMMANDER`:U?.objectiveType===`ELIMINATE`?`PRIMARY OBJECTIVE: ELIMINATE HOSTILES`:null,Nt=!U&&d&&f===`ally-koda`?`CNC JOINED · ROSTER UPDATED`:!U&&d&&f===`full-broken-signal`?`SHADOW JOINED · FULL SQUAD READY`:null,Pt=le?U?.missionId===`dead-relay-courier`?`EARLY INTERCEPT: first win by round 4 grants Courier Trace. Slower victory still unlocks Hold.`:se?se.copy:`Guardian reinforcement arrives on round 3.`:U?.objectiveType===`BOSS`?`Routing Trace telegraphs the fixed reinforcement.`:U?.missionId===`broken-signal-breach`?`TRACE target can reveal Routing Trace.`:`No Intel required.`,Ft=m===null&&U?Tr(U,T,pe?H:null,T?.lastResult,ge):null,It=U?.objectiveType===`RECOVER`,Lt=It&&(U?.objective?.type!==`RECOVER`||U.objective.squadExtractionRadius==null),Rt=U?Fr(U,He,Ue):[],zt=!U&&d?re.steps:[],Bt=Ft?.rewardEligibility,Vt=U?Sl(U):{art:bl.operationPlate,tone:`assault`,label:`TACTICAL OPS`},Ht=(0,Q.jsxs)(`div`,{className:`t-brief-actions t-deploy-actions t-deploy-actions-v29 t-command-action-dock`,children:[(0,Q.jsx)(`button`,{type:`button`,className:`t-btn t-btn-ghost`,onClick:u,children:`BACK`}),(0,Q.jsxs)(`button`,{type:`button`,className:`t-btn t-btn-primary`,onClick:l,disabled:B||Oe||P||L||!!U&&!jt(U,h,j),children:[m===null?U?.missionId===`field-relay-intercept`&&!pe?`LOCK SQUAD · REVIEW FORMATION`:`DEPLOY SQUAD`:de?`RESUME TRIAL`:`DEPLOY TRIAL`,(0,Q.jsx)(ue,{className:`t-ico`})]})]});return(0,Q.jsxs)(`div`,{className:`t-fill`,children:[(0,Q.jsx)(kl,{dim:.58}),(0,Q.jsxs)(`div`,{ref:fe,className:`t-brief t-deployment t-deployment-v29 t-command-art-shell t-premium-ux${t===`loadout`?` t-loadout-active`:``}`,children:[(0,Q.jsxs)(`header`,{className:`t-deploy-hero t-deploy-hero-v29 t-command-brief-hero t-mission-tone-${Vt.tone}`,children:[U?(0,Q.jsx)(Cl,{mission:U,fallback:Vt.art,eager:!0}):(0,Q.jsx)(`img`,{src:Vt.art,alt:``,"aria-hidden":`true`}),(0,Q.jsx)(`span`,{className:`t-wt-brief-emblem`,"aria-hidden":`true`,children:U?(0,Q.jsx)(wl,{mission:U}):null}),(0,Q.jsxs)(`div`,{className:`t-deploy-hero-copy`,children:[(0,Q.jsxs)(`div`,{className:`t-kicker`,children:[m===null?ve?`FIELD OPS`:`TACTICAL OPS`:`SIGNAL TRIAL ${m}/6`,` / MISSION BRIEF`]}),(0,Q.jsx)(`h1`,{className:`t-title`,children:Be})]})]}),(0,Q.jsx)(`nav`,{className:`t-command-nav t-deploy-command-nav t-command-framed-nav`,"aria-label":`Mission preparation sections`,children:[[`mission`,`01`,`MISSION`],[`squad`,`02`,`SQUAD`],[`loadout`,`03`,`LOADOUT`],[`intel`,`04`,`INTEL`]].map(([e,r,i])=>(0,Q.jsxs)(`button`,{type:`button`,className:t===e?`is-current`:``,"aria-pressed":t===e,onClick:()=>n(e),children:[(0,Q.jsx)(`span`,{children:r}),(0,Q.jsx)(`strong`,{children:i})]},e))}),t===`mission`?(0,Q.jsxs)(`div`,{className:`t-command-pane t-deploy-command-pane`,"aria-label":`Mission objective and rewards`,children:[Nt?(0,Q.jsx)(`div`,{className:`t-recruit-moment`,children:Nt}):null,(0,Q.jsxs)(`section`,{className:`t-panel t-deploy-overview ${zt.length?`t-training-overview`:``}`,"aria-label":`Mission overview`,children:[(0,Q.jsxs)(`div`,{className:`t-deploy-summary-main${It?` t-recover-objective`:``}`,children:[(0,Q.jsx)(`div`,{className:`t-kicker`,children:zt.length?`YOUR TRAINING GOAL`:ge.masteryChallenge?ge.lockdownPlan===`crosslink`?`LOCKDOWN · RELAY CHECKPOINTS`:`LOCKDOWN · EXACT TILE CONTROL`:It?`WIN CONDITION · RECOVER THE SIGNAL`:`OBJECTIVE`}),(0,Q.jsx)(`strong`,{children:m===null?ge.lockdownPlan?U?.briefCopy:ge.masteryChallenge?`Hold the exact relay tile · 3 consecutive round changes · finish by round 6.`:Lt?`GET TO THE RELAY. USE RECOVER.`:Ft?.objectiveText||(kt?kt.replace(`PRIMARY OBJECTIVE: `,``):Ve):U?.briefCopy}),Lt?(0,Q.jsxs)(`p`,{className:`t-brief-purpose-meta`,children:[`Get within range (normally 1 tile). `,U?.directive?.recoverEveryRounds?`Signal opens every ${U.directive.recoverEveryRounds} rounds. `:``,`Recover before acting.`]}):null,m===null?null:(0,Q.jsxs)(`p`,{className:`t-brief-purpose-meta`,children:[(0,Q.jsx)(`b`,{children:`TACTICAL HINT:`}),` `,U?.squadHint,` `,de?`This accepted run restarts at round 1 with the frozen squad.`:``]}),zt.length?(0,Q.jsx)(`ol`,{className:`t-training-steps`,"aria-label":`How to complete this training`,children:zt.map((e,t)=>(0,Q.jsxs)(`li`,{children:[(0,Q.jsx)(`span`,{"aria-hidden":`true`,children:String(t+1).padStart(2,`0`)}),(0,Q.jsx)(`p`,{children:e})]},e))}):(0,Q.jsx)(`p`,{className:It?`t-recover-failure`:void 0,children:Ft?(0,Q.jsxs)(Q.Fragment,{children:[(0,Q.jsx)(`b`,{children:`FAIL IF: `}),Ft.failConditionText]}):Dt}),ge.lockdownPlan===`crosslink`?(0,Q.jsxs)(`div`,{className:`t-lockdown-rule`,role:`note`,children:[(0,Q.jsx)(`strong`,{children:`NORTH → EAST → SOUTH`}),(0,Q.jsx)(`span`,{children:`Control is checked at round changes. Move between checkpoints; missing one resets to north.`})]}):ge.masteryChallenge?(0,Q.jsxs)(`div`,{className:`t-lockdown-rule`,role:`note`,children:[(0,Q.jsx)(`strong`,{children:`EXACT TILE ONLY`}),(0,Q.jsx)(`span`,{children:`Adjacent allies cannot hold. Enemies within 1 tile interrupt control.`})]}):null,ge.masteryChallenge||ge.veteranChallenge?(0,Q.jsx)(`p`,{className:`t-brief-purpose-meta`,children:(0,Q.jsx)(`b`,{children:Ft?.rewardChallengeText})}):null,Se?(0,Q.jsxs)(`div`,{className:`t-field-contract`,"aria-label":`Mission contract`,children:[(0,Q.jsxs)(`div`,{className:`t-kicker`,children:[`FIELD CONTRACT · `,Se.name]}),(0,Q.jsx)(`p`,{children:Ce?`Completed · permanent record`:we?Se.objective:pe?`This accepted run does not count toward Field Contracts.`:H?`Finish the accepted Field Op before starting a contract run.`:xe?`Unavailable for this rotation. Refresh the War Table for current eligibility.`:`Contracts require a compatible Field Op.`})]}):null,je?(0,Q.jsxs)(`p`,{className:`t-brief-purpose-meta`,"data-g4-brief-window":`true`,children:[pe?`ACCEPTED TIMING · `:``,je.text]}):null,Ft&&!ge.masteryChallenge&&!It?(0,Q.jsxs)(`p`,{className:`t-brief-purpose-meta`,children:[(0,Q.jsx)(`b`,{children:`WATCH FOR:`}),` `,se?.copy??(U?.missionId===`dead-relay-guardian`?Pt:Ft.tacticalThreat)]}):null,U?.objective?.type===`INTERCEPT`&&U.objective.screenedEscape?(0,Q.jsxs)(`p`,{className:`t-deploy-resume`,"data-intercept-formation":`2`,children:[(0,Q.jsx)(`b`,{children:`SCREENED COURIER · FORMATION LOCKED`}),(0,Q.jsx)(`br`,{}),`Rally and pursue for tempo, or use a mobile chase to limit exposure. A southern exit blockade buys time but commits a defender.`]}):U?.missionId===`field-relay-intercept`&&!pe?(0,Q.jsx)(`p`,{className:`t-deploy-resume`,children:`Lock your squad to review server-confirmed conditions before combat. No turn begins during review.`}):null]}),Ht,Ft?(0,Q.jsxs)(`details`,{className:`t-mission-extra t-brief-details`,"aria-label":`Mission outcome and recording`,children:[(0,Q.jsx)(`summary`,{children:`DETAILS`}),Lt?(0,Q.jsxs)(`section`,{"aria-label":`Recover rules`,children:[(0,Q.jsx)(`b`,{children:`FULL RECOVER RULES`}),(0,Q.jsx)(`p`,{children:Ft.objectiveText})]}):null,It?(0,Q.jsxs)(`section`,{"aria-label":`Tactical threats`,children:[(0,Q.jsx)(`b`,{children:`TACTICAL THREATS`}),(0,Q.jsx)(`p`,{children:Ft.tacticalThreat})]}):null,(0,Q.jsx)(`p`,{children:Ft.nextConsequence}),ve&&T?.board?(0,Q.jsxs)(`p`,{children:[(0,Q.jsx)(`b`,{children:`Rotation ends`}),` · `,Qe(T.board.nextRotationAt)]}):null,le&&!se?(0,Q.jsx)(`p`,{children:Pt}):null,ve?(0,Q.jsxs)(Q.Fragment,{children:[(0,Q.jsxs)(`p`,{"data-opportunity-status":Ae.status,role:`status`,children:[(0,Q.jsx)(`b`,{children:`Veteran eligibility`}),` · `,Ae.copy]}),(0,Q.jsxs)(`p`,{children:[(0,Q.jsx)(`b`,{children:Ft.rewardClearText}),` · `,Bt?.copy]}),(0,Q.jsxs)(`p`,{children:[(0,Q.jsx)(`b`,{children:Ft.rewardChallengeText}),` · `,U?.challenge?.label||`Optional challenge`]}),(0,Q.jsxs)(`p`,{children:[(0,Q.jsx)(`b`,{children:qe(ge.pressure)}),` · `,Je(ge.pressure)]})]}):null,Rt.length?(0,Q.jsxs)(`section`,{"aria-label":`Squad tactics`,children:[(0,Q.jsx)(`b`,{children:`SQUAD TACTICS`}),Rt.map(e=>(0,Q.jsx)(`p`,{children:e},e))]}):null]}):null]})]}):null,t===`squad`?(0,Q.jsxs)(`div`,{className:`t-command-pane t-deploy-command-pane`,"aria-label":`Squad composition and mastery`,children:[(0,Q.jsxs)(`section`,{className:`t-panel t-deploy-squad`,"aria-label":`Squad`,children:[(0,Q.jsxs)(`div`,{className:`t-wt-section-head`,children:[(0,Q.jsxs)(`div`,{children:[(0,Q.jsx)(`div`,{className:`t-kicker`,children:`Squad`}),(0,Q.jsxs)(`h2`,{className:`t-title`,children:[He.length,` / `,U?.squadCap||He.length,` DEPLOYED`]})]}),pe?(0,Q.jsx)(`span`,{children:le?`RESUMING ACCEPTED RUN · ROUND 1 RESTART`:`RESUMING SAVED RUN`}):null]}),(0,Q.jsx)(`div`,{className:`t-squad-preview t-squad-preview-v29`,"aria-label":`Selected squad`,children:He.map(e=>(0,Q.jsxs)(`div`,{children:[e.defId===`alpha`?(0,Q.jsx)(Os,{fallbackUrl:e.portrait}):(0,Q.jsx)(`img`,{src:e.portrait,alt:``}),(0,Q.jsx)(`span`,{children:e.defId===`ally-02`?`CNC`:e.role===`companion`?`PET`:e.name})]},e.defId))}),me?(0,Q.jsxs)(`section`,{className:`t-run-power`,"aria-label":`Server-confirmed combat power`,"data-power-source":`accepted-v3`,children:[(0,Q.jsxs)(`div`,{className:`t-run-power-head`,children:[(0,Q.jsx)(`strong`,{children:`ACCEPTED COMBAT POWER`}),(0,Q.jsx)(`span`,{children:`V3 · LOCKED FOR THIS RUN`})]}),(0,Q.jsx)(`p`,{children:`These are your server-frozen starting stats. Gear changes apply to a new battle, not this saved run.`}),(0,Q.jsxs)(`div`,{className:`t-run-power-unit`,children:[(0,Q.jsx)(`strong`,{children:`ALPHA`}),(0,Q.jsx)(`dl`,{children:[`hp`,`atk`,`def`,`spd`].map(e=>(0,Q.jsxs)(`div`,{children:[(0,Q.jsx)(`dt`,{children:e.toUpperCase()}),(0,Q.jsx)(`dd`,{children:me.profile.alpha[e]})]},e))})]}),me.petDeployed&&me.profile.pet?(0,Q.jsxs)(`div`,{className:`t-run-power-unit`,children:[(0,Q.jsxs)(`strong`,{children:[`PET · `,me.profile.pet.name]}),(0,Q.jsx)(`dl`,{children:[`hp`,`atk`,`def`,`spd`].map(e=>(0,Q.jsxs)(`div`,{children:[(0,Q.jsx)(`dt`,{children:e.toUpperCase()}),(0,Q.jsx)(`dd`,{children:me.profile.pet[e]})]},e))})]}):null]}):null,Ne?(0,Q.jsxs)(`div`,{className:`t-deploy-squad-picker`,children:[(0,Q.jsx)(`p`,{children:`Choose two tactical companions.`}),(0,Q.jsx)(`div`,{className:`t-brief-actions`,children:[{id:`ally-02`,label:`CNC`,role:`PRESSURE / DISRUPTION`,available:!0},{id:`ally-03`,label:`SHADOW`,role:`SUSTAIN / PROTECTION`,available:!0},{id:j?`pet:${j.id}`:`pet:unavailable`,label:j?`PET · ${j.name}`:`PET`,role:j?`MOBILITY / CONTROL`:`NO VALID PET EQUIPPED`,available:!!j}].map(e=>{let t=h.includes(e.id);return(0,Q.jsxs)(`button`,{type:`button`,"aria-pressed":t,disabled:B||!!H?.fieldContext?.lockdownPlan||H?.fieldContext?.progressionVersion===2||P||L||!e.available||!t&&h.length>=3,className:`t-btn ${t?`t-btn-primary`:`t-btn-ghost`}`,onClick:()=>A(e.id),children:[e.label,(0,Q.jsx)(`br`,{}),(0,Q.jsx)(`small`,{children:e.role})]},e.id)})})]}):null,U?.objectiveType===`RECOVER`&&!ve?(0,Q.jsxs)(`div`,{className:`t-deploy-squad-picker`,children:[(0,Q.jsx)(`p`,{children:`Choose one teammate for this recovery mission.`}),(0,Q.jsxs)(`div`,{className:`t-brief-actions`,children:[(0,Q.jsxs)(`button`,{type:`button`,disabled:B,className:`t-btn ${h[1]===`ally-02`?`t-btn-primary`:`t-btn-ghost`}`,onClick:()=>ee(`ally-02`),children:[`CNC`,(0,Q.jsx)(`br`,{}),(0,Q.jsx)(`small`,{children:`OFFENSE · PRESSURE`})]}),(0,Q.jsxs)(`button`,{type:`button`,disabled:B,className:`t-btn ${h[1]===`ally-03`?`t-btn-primary`:`t-btn-ghost`}`,onClick:()=>ee(`ally-03`),children:[`SHADOW`,(0,Q.jsx)(`br`,{}),(0,Q.jsx)(`small`,{children:`SUPPORT · SUSTAIN`})]}),(0,Q.jsxs)(`button`,{type:`button`,disabled:B||!j,className:`t-btn ${j&&h[1]===`pet:${j.id}`?`t-btn-primary`:`t-btn-ghost`}`,onClick:()=>j&&ee(`pet:${j.id}`),children:[`PET`,j?` · ${j.name}`:``,(0,Q.jsx)(`br`,{}),(0,Q.jsx)(`small`,{children:j?`MOBILITY · CONTROL`:`UNAVAILABLE`})]})]})]}):null]}),U?(0,Q.jsxs)(`div`,{className:`t-brief-mastery-optional`,children:[(0,Q.jsxs)(`button`,{type:`button`,className:`t-brief-optional-toggle`,"aria-expanded":o,onClick:()=>s(e=>!e),children:[(0,Q.jsx)(`strong`,{children:`PACK MASTERY`}),(0,Q.jsx)(`span`,{children:o?`HIDE DETAILS −`:`VIEW PROGRESSION +`})]}),o?(0,Q.jsx)(Gc,{snapshot:pe?H?.packMastery:void 0}):null]}):null]}):null,t===`loadout`?(0,Q.jsx)(`div`,{className:`t-command-pane t-deploy-command-pane`,"aria-label":`Squad loadout`,children:(0,Q.jsxs)(`section`,{className:`t-panel t-loadout-panel`,"aria-label":`Deployed squad and abilities`,children:[(0,Q.jsxs)(`h2`,{className:`t-kicker`,children:[`DEPLOYING · `,Ze.length]}),$e?(0,Q.jsxs)(Q.Fragment,{children:[(0,Q.jsx)(`nav`,{className:`t-loadout-unit-picker`,"aria-label":`Select unit abilities`,children:Ze.map(e=>(0,Q.jsxs)(`button`,{type:`button`,"aria-pressed":e.defId===$e.defId,onClick:()=>a(e.defId),children:[(0,Q.jsxs)(`span`,{className:`t-loadout-portrait`,"aria-hidden":`true`,children:[e.defId.startsWith(`pet:`)?(0,Q.jsx)(he,{size:20}):null,e.defId===`alpha`?(0,Q.jsx)(Os,{fallbackUrl:e.portrait}):(0,Q.jsx)(`img`,{src:e.portrait,alt:``,onError:e=>{e.currentTarget.hidden=!0}})]}),(0,Q.jsx)(`strong`,{children:Il(e)}),U&&(e.defId===`ally-02`||e.defId===`ally-03`)&&M&&!pe?(0,Q.jsx)(`small`,{children:`Variants`}):null]},e.defId))}),et?(0,Q.jsxs)(`section`,{className:`t-loadout-variants t-field-rend`,"aria-label":`ALPHA Field Rend`,"data-slot":`A2`,children:[(0,Q.jsx)(`h2`,{ref:r,tabIndex:-1,className:`t-kicker`,children:`ALPHA · A2`}),(0,Q.jsx)(`div`,{className:`t-loadout-choices`,children:[`rend`,`reach-rend`].map(e=>{let t=Ut(dn(`alpha-${e}`),Wt(Ue,$e.defId)),n=t.effects.find(e=>e.kind===`damage`)?.multiplier,r=t.effects.find(e=>e.kind===`status`&&e.status===`BLEED`),i=Ms(t.id),a=tt===e;return(0,Q.jsxs)(`button`,{type:`button`,"aria-pressed":a,disabled:!Ee||B||Oe||P||L,onClick:()=>{Te()&&ke(e)},children:[i?(0,Q.jsx)(`img`,{src:i,alt:``}):null,(0,Q.jsx)(`strong`,{children:t.name}),(0,Q.jsxs)(`small`,{children:[Ll(t),` `,t.maxRange===1?`cell`:`cells`,(0,Q.jsx)(`br`,{}),Math.round((n??0)*100),`% direct hit`]}),r?(0,Q.jsxs)(`small`,{className:`t-field-rend-bleed`,children:[`Bleed · `,r.duration,` turns`]}):null,(0,Q.jsx)(`span`,{className:`t-field-rend-state`,children:a?`EQUIPPED`:Ee?`AVAILABLE`:T?.activeMissionRun?`LOCKED`:`UNAVAILABLE`})]},e)})}),T?.activeMissionRun?(0,Q.jsxs)(`p`,{children:[(0,Q.jsx)(`strong`,{children:`Locked for current run.`}),` Finish the accepted Field Op to change A2.`]}):Ee?(0,Q.jsx)(`p`,{role:`status`,children:Oe?`Saving A2…`:`${tt===`reach-rend`?`Reach Rend`:`Rend`} equipped for new compatible Field Ops.`}):(0,Q.jsx)(`p`,{children:`Choose a current regular Field Op on the War Table to change A2.`}),z?(0,Q.jsx)(`p`,{role:`alert`,children:z}):null]}):null,rt?(0,Q.jsx)(`section`,{className:`t-loadout-variants`,"aria-label":`${Il($e)} variants`,children:pe?(0,Q.jsx)(`p`,{children:`Variants locked for this run.`}):M?(0,Q.jsxs)(Q.Fragment,{children:[(0,Q.jsx)(`div`,{className:`t-loadout-choices`,children:Fl[rt].map(({name:e,slot:t},n)=>{let r=n===0?`A`:`B`,i=Ut((Br([{id:rt,defId:rt,c:0,r:0}],{kodaSidegrade:at?r:te,shadowSidegrade:at?I:r,packMastery:E})[0].unitDef||k[rt]).skillIds.map(dn).find(e=>e.slot===t),Wt(Ue,rt));return(0,Q.jsxs)(`button`,{type:`button`,"aria-pressed":ot===r,disabled:B||Oe||P||L,onClick:()=>void st(r),children:[(0,Q.jsx)(`strong`,{children:e}),(0,Q.jsxs)(`small`,{children:[Rl(i),` · `,Ll(i)]})]},r)})}),(0,Q.jsx)(`p`,{role:`status`,children:ct?`Saving variant…`:ot?`Saved · ${Fl[rt][ot===`A`?0:1].name}`:`Base loadout equipped`})]}):(0,Q.jsx)(`p`,{children:`Variants unlock after Broken Signal.`})}):null,(0,Q.jsx)(`div`,{className:`t-loadout-slots${et?` t-loadout-slots-with-a2-picker`:``}`,"aria-label":`${Il($e)} equipped abilities`,children:[`A1`,`A2`,`A3`].map(e=>{if(e===`A2`&&et)return null;let t=pt.find(t=>t.unitId===$e.defId&&t.slot===e),n=t&&Ut(dn(t.skillId),Wt(Ue,$e.defId)),r=t&&Ms(t.skillId),i=$e.defId.startsWith(`pet:`)&&e===`A3`,a=n&&n.cooldownMax+it(Le,$e,n);return(0,Q.jsxs)(`div`,{className:`t-loadout-slot`,"data-slot":e,children:[(0,Q.jsx)(`span`,{children:e}),r?(0,Q.jsx)(`img`,{src:r,alt:``}):null,(0,Q.jsx)(`strong`,{children:n?.name||(i?`Unavailable`:`Empty`)}),n?(0,Q.jsxs)(`small`,{children:[(0,Q.jsxs)(`span`,{children:[`Cooldown `,a]}),(0,Q.jsx)(`span`,{children:Ll(n)})]}):i?(0,Q.jsx)(`small`,{children:`Pet has two slots`}):null]},e)})})]}):null,(0,Q.jsx)(`p`,{className:`t-loadout-readiness`,role:`status`,children:Tt})]})}):null,S&&(T?.lockdownPlansAvailable&&!pe||ge.lockdownPlan)?(0,Q.jsxs)(`section`,{className:`t-panel t-lockdown-plans`,"aria-label":`Deployment plans`,children:[(0,Q.jsx)(`div`,{className:`t-kicker`,children:pe?`ACCEPTED PLAN · LOCKED`:`CHOOSE A PLAN · OPTIONAL PRACTICE`}),(0,Q.jsx)(`div`,{className:`t-lockdown-plan-grid`,children:[`anchor`,`crosslink`].map(e=>(0,Q.jsxs)(`button`,{type:`button`,"data-lockdown-plan":e,"aria-pressed":(ge.lockdownPlan||b)===e,disabled:B||pe,onClick:()=>x(e),children:[(0,Q.jsx)(`strong`,{children:We[e].name}),(0,Q.jsxs)(`span`,{children:[(0,Q.jsx)(`b`,{children:`Benefit:`}),` `,We[e].benefit]}),(0,Q.jsxs)(`span`,{children:[(0,Q.jsx)(`b`,{children:`Cost:`}),` `,We[e].cost]}),(0,Q.jsxs)(`span`,{children:[(0,Q.jsx)(`b`,{children:`Priority:`}),` `,We[e].priority]})]},e))}),(0,Q.jsx)(`small`,{children:`Plan freezes when the server accepts deployment. No currency or progression reward.`})]}):null,t===`intel`?(0,Q.jsxs)(`div`,{className:`t-command-pane t-deploy-command-pane`,"aria-label":`Mission conditions and enemy intelligence`,children:[Ie.length||ve?(0,Q.jsxs)(`section`,{className:`t-panel t-deploy-rules`,children:[(0,Q.jsxs)(`div`,{className:`t-command-conditions-head`,children:[(0,Q.jsxs)(`span`,{children:[(0,Q.jsx)(`span`,{className:`t-kicker`,children:`Tactical setup`}),(0,Q.jsx)(`strong`,{children:`CONDITIONS & APPROACH`})]}),(0,Q.jsxs)(`b`,{children:[_.toUpperCase(),g===`standard`?``:` · ${Ke[g].name}`]})]}),Ie.length?(0,Q.jsxs)(`section`,{className:`t-conditions`,"aria-label":`Special conditions`,children:[Ie.map(e=>(0,Q.jsxs)(`div`,{className:`t-condition t-condition-v29`,children:[(0,Q.jsx)(`strong`,{children:se?`REINFORCEMENTS`:e.maxRounds?`DEADLINE · ROUND ${e.maxRounds}`:e.reinforcement?`REINFORCEMENTS · ROUND ${ze}`:e.supportCooldownExtra?`LIMITED SUPPORT · +1 TURN`:e.name}),(0,Q.jsx)(`p`,{children:se?.copy??e.copy})]},e.type)),U?.squadHint?(0,Q.jsxs)(`p`,{className:`t-deploy-tip`,children:[(0,Q.jsx)(`strong`,{children:`Squad tip:`}),` `,U.squadHint]}):null]}):null,ve?(0,Q.jsxs)(`div`,{className:`t-deployment-options t-deployment-options-v29`,children:[pe?(0,Q.jsx)(`p`,{className:`t-deploy-resume`,children:`Original conditions are locked for this saved run. Finish it before starting a different challenge.`}):null,ge.masteryChallenge?(0,Q.jsx)(`p`,{children:`RELAY MASTERY · 1/1 · Permanent Relay Lockdown access. Fixed pressure and deadline; support follows the accepted plan.`}):T?.board?.reportVersion===3?(0,Q.jsxs)(Q.Fragment,{children:[(0,Q.jsx)(`div`,{className:`t-kicker`,children:`Directive tier`}),(0,Q.jsx)(`div`,{className:`t-brief-actions`,children:[`standard`,`advanced`].map(e=>(0,Q.jsxs)(`button`,{type:`button`,className:`t-btn ${_===e?`t-btn-primary`:``}`,"aria-pressed":_===e,disabled:B||!T.commander?.unlockedDirectiveTiers?.includes(e),onClick:()=>C(e),children:[e.toUpperCase(),e===`advanced`&&!T.commander?.unlockedDirectiveTiers?.includes(e)?` / RANK 3`:``]},e))}),(0,Q.jsx)(`small`,{children:_===`advanced`?`${Xe(ge.directiveSet)} · Advanced clear is recorded.`:`Standard field conditions.`})]}):null,(0,Q.jsx)(`div`,{className:`t-kicker`,children:`Deployment approach`}),(0,Q.jsx)(`div`,{className:`t-brief-actions`,children:[`standard`,`south`].map(e=>(0,Q.jsxs)(`button`,{type:`button`,className:`t-btn ${g===e?`t-btn-primary`:``}`,"aria-pressed":g===e,disabled:B||!T?.commander?.unlockedApproaches.includes(e),onClick:()=>w(e),children:[Ke[e].name,e===`south`&&!T?.commander?.unlockedApproaches.includes(`south`)?` / RANK 2`:``]},e))}),(0,Q.jsx)(`small`,{children:Ke[g].copy})]}):null]}):null,U?(0,Q.jsxs)(`details`,{className:`t-panel t-deploy-depth`,children:[(0,Q.jsxs)(`summary`,{children:[(0,Q.jsxs)(`span`,{children:[(0,Q.jsx)(`span`,{className:`t-kicker`,children:`Optional depth`}),(0,Q.jsx)(`strong`,{children:`MASTERY & LOADOUT`})]}),(0,Q.jsx)(`b`,{children:`VIEW`})]}),(0,Q.jsxs)(`details`,{className:`t-detail t-loadout-details`,children:[(0,Q.jsx)(`summary`,{children:`Squad abilities & hostile intel`}),(0,Q.jsxs)(`div`,{className:`t-brief-grid`,children:[(0,Q.jsxs)(`div`,{className:`t-panel t-brief-block`,children:[(0,Q.jsx)(`h3`,{children:`Allied squad`}),(0,Q.jsx)(ks,{}),He.map(e=>(0,Q.jsxs)(`div`,{className:`t-unit-row`,children:[e.defId===`alpha`?(0,Q.jsx)(Os,{fallbackUrl:e.portrait}):(0,Q.jsx)(`img`,{src:e.portrait,alt:``,style:{objectPosition:`50% 12%`}}),(0,Q.jsxs)(`div`,{children:[(0,Q.jsx)(`div`,{className:`t-title`,style:{fontSize:`0.95rem`},children:e.defId===`ally-02`?`COLDNCURSED`:e.name}),(0,Q.jsx)(`div`,{style:{color:`var(--t-muted)`,fontSize:`0.8rem`},children:Ol(e)})]})]},e.defId))]}),(0,Q.jsxs)(`div`,{className:`t-panel t-brief-block`,children:[(0,Q.jsx)(`h3`,{children:`Hostile force`}),Et.map(({def:e,count:t})=>(0,Q.jsxs)(`div`,{className:`t-unit-row`,children:[(0,Q.jsx)(`div`,{className:`t-unit-ph enemy`}),(0,Q.jsxs)(`div`,{children:[(0,Q.jsx)(`div`,{className:`t-title`,style:{fontSize:`0.95rem`},children:t>1?`${e.name} × ${t}`:e.name}),(0,Q.jsx)(`div`,{style:{color:`var(--t-muted)`,fontSize:`0.8rem`},children:Ol(e,`${e.hp} HP`)})]})]},e.defId)),se?null:(0,Q.jsx)(`p`,{style:{color:`var(--t-faint)`,fontSize:`0.78rem`,margin:`0.8rem 0 0`,lineHeight:1.45},children:Pt})]})]})]})]}):null]}):null,t===`mission`?null:Ht,t===`loadout`?(0,Q.jsxs)(`details`,{className:`t-panel t-codex-reference`,children:[(0,Q.jsx)(`summary`,{children:`Details & Counterplay`}),(0,Q.jsxs)(`div`,{className:`t-loadout-reference-body`,children:[(0,Q.jsxs)(`section`,{"aria-label":`Tactical counter options`,children:[(0,Q.jsx)(`h2`,{className:`t-kicker`,children:`Counterplay`}),(0,Q.jsx)(`ul`,{children:mt.map(e=>(0,Q.jsxs)(`li`,{children:[(0,Q.jsx)(`strong`,{children:e.label}),(0,Q.jsx)(`span`,{children:e.available?e.source:`Unavailable · ${e.detail}`})]},e.id))})]}),ht.length?(0,Q.jsxs)(`section`,{"aria-label":`Optional tactical training goals`,children:[(0,Q.jsx)(`h2`,{className:`t-kicker`,children:`Optional training`}),(0,Q.jsx)(`ul`,{children:ht.map(e=>(0,Q.jsxs)(`li`,{children:[(0,Q.jsx)(`strong`,{children:e.title}),(0,Q.jsxs)(`span`,{children:[e.instruction,` `,e.requirement]})]},e.id))})]}):null,(0,Q.jsxs)(`section`,{"aria-label":`Signal Codex equipped capabilities`,children:[(0,Q.jsx)(`h2`,{className:`t-kicker`,children:`Signal Codex`}),(0,Q.jsx)(`ul`,{children:dl.map(e=>{let t=ft.filter(t=>t.family===e);return(0,Q.jsxs)(`li`,{children:[(0,Q.jsx)(`strong`,{children:e}),t.length?t.map(e=>(0,Q.jsxs)(`span`,{children:[e.unit,` · `,e.skillName]},`${e.unit}-${e.slot}`)):(0,Q.jsx)(`span`,{children:`No equipped protocol`})]},e)})})]})]})]}):null,z&&!(t===`loadout`&&et)?(0,Q.jsx)(`p`,{style:{color:`var(--t-enemy)`,marginTop:`0.8rem`},children:z}):null]})]})}function Bl(){let e=Z(e=>e.dismissSector),t=Z(e=>e.battle.objective?.type===`BOSS`),n=Z(e=>W(e.selectedMissionId)?.activity===`FIELD_OP`);return(0,y.useEffect)(()=>{let t=0,n=performance.now(),r=i=>{i-n>=1600?e():t=requestAnimationFrame(r)};return t=requestAnimationFrame(r),()=>cancelAnimationFrame(t)},[e]),(0,Q.jsxs)(`div`,{className:`t-fill`,children:[(0,Q.jsx)(kl,{dim:.5}),(0,Q.jsx)(`div`,{className:`t-overlay`,style:{background:`rgb(10 12 16 / 0.45)`},children:(0,Q.jsxs)(`div`,{className:`t-modal t-panel`,children:[(0,Q.jsx)(`div`,{className:`t-kicker`,children:n?`FIELD OP`:`Operation`}),(0,Q.jsx)(`h2`,{className:`t-title`,children:n?`Objective Complete`:`Sector Secured`}),(0,Q.jsx)(`p`,{style:{color:`var(--t-muted)`,margin:`0 0 1.1rem`},children:n?`Mission objective achieved. Review Results to save this clear.`:t?`BRUTE LEADER defeated. Commander signal broken.`:`Hostile force eliminated.`}),(0,Q.jsx)(`button`,{type:`button`,className:`t-btn t-btn-primary`,onClick:e,children:`Continue`})]})})]})}function Vl(){let e=Z(e=>e.currentFieldContext),t=Z(e=>e.selectedTrialLevel),n=Z(e=>e.trialResult),r=Z(e=>e.saveTrialResult),i=Z(e=>e.selectedMasteryChallenge),a=Z(e=>e.selectedVeteranChallenge),o=Z(e=>e.battle.failureReason),s=Z(e=>e.battle.results),c=Z(e=>e.fieldResult),l=Z(e=>e.fieldMilestone),u=Z(e=>e.campaignResult),d=Z(e=>e.chapterResult),f=Z(e=>e.chapterMode),p=Z(e=>e.saveChapterResult),m=Z(e=>e.saveCampaignResult),h=Z(e=>e.saveFieldResult),g=Z(e=>e.replay),_=Z(e=>e.backToHub),v=Z(e=>e.continueOnboarding),y=Z(e=>e.onboardingEnabled),b=Z(e=>e.onboardingStageId),x=Z(e=>e.selectedMissionId),S=Z(e=>e.foundationCompleted),C=Z(e=>e.progression),w=Z(e=>e.progressionCommitPending),T=Z(e=>e.progressionError),E=Z(e=>e.battle.routingTraceAcquired),D=Z(e=>e.s3CombatProof),O=Z(e=>e.currentRunKey),k=Z(e=>e.activeRulesetVersion),ee=Z(e=>e.selectedSquadIds),A=qo(y,b),j=W(x),te=tc(c,O,x)?.masteryChallenge,M=tc(c,O,x)?.veteranChallenge,N=j&&M?At(j,{reportVersion:6,veteranChallenge:M}):j&&te?At(j,{reportVersion:c?.lockdownPlan?5:4,masteryChallenge:te,lockdownPlan:c?.lockdownPlan}):j,P=N?.activity===`FIELD_OP`,F=N?.operationId===xt.operationId,I=tc(c,O,x),ne=I&&l?.runId===I.runId?l:null,L=tc(u,O,x),R=!f&&F?L:null,z=f?tc(d,O,x):null,B=f?z:I||R,re=B?zs(C,B,w):null,ie=e=>{if(!B)return;let t=Z.getState();if(t.screen!==`results`||t.progressionCommitPending||!tc(B,t.currentRunKey,t.selectedMissionId))return;let n=zs(t.progression,B),r=e===`squad`?n.reviewAction:n.action,i=e===`squad`?re?.reviewAction:re?.action,a=r&&i&&r.missionId===i.missionId&&r.tier===i.tier&&r.resume===i.resume&&r.chapter===i.chapter&&r.masteryChallenge===i.masteryChallenge&&r.veteranChallenge===i.veteranChallenge&&r.lockdownPlan===i.lockdownPlan;if(t.continueOnboarding(),Z.getState().screen!==`war-table`)return;if(!a||e===`equip`&&n.equipMission!==re?.equipMission){n.refresh&&t.loadFoundationProgression();return}if(e===`equip`&&n.equipMission){t.openOperationBrief(n.equipMission,void 0,`alpha-a2`);return}let o=e===`squad`?`squad`:void 0;if(r.chapter){t.openChapterBrief(o);return}if(r.veteranChallenge){t.openVeteranBrief(o);return}t.openOperationBrief(r.missionId,r.masteryChallenge,o),!r.resume&&Z.getState().screen===`brief`&&(t.selectDirectiveTier(r.tier),n.retry&&t.selectApproach(t.currentFieldContext?.approach??t.selectedApproach),r.lockdownPlan&&t.selectLockdownPlan(r.lockdownPlan))},ae=re?(0,Q.jsxs)(Q.Fragment,{children:[(0,Q.jsx)(`button`,{type:`button`,className:`t-btn t-btn-primary`,"data-next-decision":`primary`,disabled:w,onClick:()=>ie(re.equipMission?`equip`:`mission`),children:re.equipMission?`EQUIP REACH REND`:re.label}),re.equipMission?(0,Q.jsx)(`button`,{type:`button`,className:`t-btn`,onClick:()=>ie(`mission`),children:re.label}):re.reviewAction?(0,Q.jsx)(`button`,{type:`button`,className:`t-btn`,onClick:()=>ie(`squad`),children:`Review Squad`}):null]}):null,V=re?.equipMission?`Equip it in Loadout, then select A2 on ALPHA’s turn.`:re?.action?.resume?`Your setup is locked. Finish that run to equip Reach Rend.`:`Equip it in ALPHA’s Loadout when a regular Field Op is available.`,oe=$s(I,L,C),se=ec(I,L,C),ce=I?.runId||L?.runId||null,le=Po(N,ee,k===`tactical-intent-vnext.0`),de=Io(D,ce,!!(I?.victory||L?.victory),le),H=Lo(D,ce),fe=Lr(D,O,x);if(!s)return null;if(t!==null){let e=n?.runId===O?n:null,i=e?.victory?Math.min(6,t+1):t;return(0,Q.jsxs)(`div`,{className:`t-fill`,children:[(0,Q.jsx)(kl,{dim:.6}),(0,Q.jsx)(`div`,{className:`t-overlay t-results-overlay`,children:(0,Q.jsxs)(`div`,{className:`t-modal t-panel t-results ${s.victory?`is-victory`:`is-failure`}`,"data-signal-trial-result":t,children:[(0,Q.jsxs)(`span`,{className:`t-kicker`,children:[`SIGNAL TRIAL `,t,`/6 · RELAY PRESSURE`]}),(0,Q.jsx)(`h2`,{className:`t-title`,children:e?e.victory?`TRIAL CLEARED`:`TRIAL FAILED`:`RECORDING TRIAL`}),(0,Q.jsx)(`p`,{children:e?e.victory?`Level ${t} recorded. ${t<6?`Next pressure level unlocked.`:`All six Trials cleared.`}`:e.failureReason===`DEADLINE`?`The relay was not secured before the deadline. Reposition earlier and protect the holder.`:`Your squad fell before securing the relay.`:`The result must be recorded by the server before advancing.`}),(0,Q.jsxs)(`p`,{children:[`Turns: `,s.turns,` · Squad standing: `,s.squadStanding,`/`,s.squadDeployed,` · No currency or Commander rewards.`]}),e?(0,Q.jsxs)(`div`,{className:`t-brief-actions`,children:[(0,Q.jsx)(`button`,{className:`t-btn t-btn-primary`,type:`button`,onClick:()=>v(e.victory),children:e.victory?t===6?`REPLAY FINAL TRIAL`:`NEXT TRIAL ${i}`:`RETRY TRIAL`}),(0,Q.jsx)(`button`,{className:`t-btn`,type:`button`,onClick:_,children:`WAR TABLE`})]}):(0,Q.jsx)(`button`,{className:`t-btn t-btn-primary`,type:`button`,disabled:w,onClick:()=>void r(),children:w?`RECORDING…`:`RETRY RECORDING`}),T?(0,Q.jsx)(`p`,{role:`alert`,children:T}):null]})})]})}let pe=I?.victory??s.victory,me=R?.victory??s.victory,he=Bs((I||R)?.failureReason??o,N?.objectiveType||``,B&&`squadStanding`in B&&B.squadStanding!=null?B.squadStanding:s.squadStanding,B&&`squadDeployed`in B&&B.squadDeployed!=null?B.squadDeployed:s.squadDeployed),ge=S&&!!N&&s.victory,_e=y&&!S&&s.victory||ge,U=_e&&A.next!=null,ve=ge&&C?.operations?.[N?.operationId||bt.operationId]?.missions[N?.missionId||``]===`available`;if(P&&!f&&!te&&!M&&!i&&!a&&!e?.masteryChallenge&&!e?.lockdownPlan&&!e?.veteranChallenge)return(0,Q.jsxs)(`div`,{className:`t-fill`,children:[(0,Q.jsx)(kl,{dim:.6}),(0,Q.jsx)(`div`,{className:`t-overlay t-results-overlay`,children:(0,Q.jsxs)(Is,{victory:pe,missionName:N.name,plate:pe?bl.resultsPlate:bl.operationPlate,receipt:I,milestone:ne,pending:w,error:T,failure:he,consequence:oe,nextObjective:re?.detail,reachRendNext:V,actions:I?ae:(0,Q.jsx)(`button`,{type:`button`,className:`t-btn t-btn-primary`,disabled:w,onClick:()=>void h(),children:w?`Recording...`:`Retry saving result`}),children:[I?(0,Q.jsxs)(`details`,{className:`t-detail`,children:[(0,Q.jsx)(`summary`,{children:`Progression & eligibility`}),(0,Q.jsx)(`p`,{children:Nr(I).future}),(0,Q.jsxs)(`p`,{children:[`Challenge: `,I.legacyReport?`Unmeasured in this receipt`:I.challengeSuccess?`Met · +${I.challengeBonus} Commander bonus recorded`:`Not met`,`.`]}),I.directiveTier===`advanced`?(0,Q.jsxs)(`p`,{children:[`ADVANCED · `,Xe(I.directiveSet),` · `,I.firstCycleAdvanced?`Secured this rotation`:I.victory?`Replay recorded`:`Failed attempt recorded`,`.`]}):null,I.advancedUnlocked?(0,Q.jsx)(`p`,{children:`Advanced directives unlocked.`}):null,I.unlockedApproaches.includes(`south`)?(0,Q.jsx)(`p`,{children:`South approach unlocked.`}):null,(0,Q.jsx)(Kc,{changes:I.masteryChanges,victory:I.victory}),C?.playerGrowth&&s.victory&&C.playerGrowth.earnedPoints>C.playerGrowth.spentPoints?(0,Q.jsxs)(`p`,{children:[C.playerGrowth.earnedPoints-C.playerGrowth.spentPoints,` SKILL POINTS AVAILABLE · Total unspent balance, not points earned this run. Open the War Table Skillbook to spend them.`]}):null]}):null,(0,Q.jsxs)(`details`,{className:`t-detail`,children:[(0,Q.jsx)(`summary`,{children:`Combat report · this device`}),I&&H?(0,Q.jsxs)(`p`,{children:[(0,Q.jsx)(`b`,{children:`TACTICAL MOMENT`}),` · `,H.detail]}):null,(0,Q.jsx)(ks,{}),(0,Q.jsxs)(`dl`,{className:`t-stats`,children:[(0,Q.jsxs)(`div`,{children:[(0,Q.jsx)(`dt`,{children:`Turns`}),(0,Q.jsx)(`dd`,{children:s.turns})]}),(0,Q.jsxs)(`div`,{children:[(0,Q.jsx)(`dt`,{children:`Eliminated`}),(0,Q.jsx)(`dd`,{children:s.hostilesEliminated})]}),(0,Q.jsxs)(`div`,{children:[(0,Q.jsx)(`dt`,{children:`Squad standing`}),(0,Q.jsxs)(`dd`,{children:[s.squadStanding,` / `,s.squadDeployed]})]}),(0,Q.jsxs)(`div`,{children:[(0,Q.jsx)(`dt`,{children:`Damage taken`}),(0,Q.jsx)(`dd`,{children:s.damageTaken})]})]}),(0,Q.jsxs)(`p`,{children:[`Challenge objective: `,N.challenge?.label||`No optional challenge`]}),(0,Q.jsxs)(`section`,{"aria-label":`Why your build mattered`,children:[(0,Q.jsx)(`span`,{className:`t-kicker`,children:`WHY YOUR BUILD MATTERED`}),fe.length?fe.map(e=>(0,Q.jsx)(`p`,{children:e},e)):(0,Q.jsx)(`p`,{children:`No build-specific effect observed in this encounter.`}),(0,Q.jsx)(`small`,{children:`Engine-observed on this device in this run only. Not persisted progress or extra rewards.`})]}),ce&&de.length?(0,Q.jsxs)(`section`,{"aria-label":`Verified optional training`,children:[de.map(e=>(0,Q.jsxs)(`div`,{children:[(0,Q.jsx)(`strong`,{children:e.title}),(0,Q.jsx)(`p`,{children:e.evidence})]},e.id)),(0,Q.jsx)(`small`,{children:`Training evidence is session-only; no extra rewards are awarded.`})]}):null]})]})})]});let ye=!f&&P&&(te||M||i||a||e?.masteryChallenge||e?.lockdownPlan||e?.veteranChallenge)?M||a||e?.veteranChallenge?`extraction`:`lockdown`:null;if(ye)return(0,Q.jsxs)(`div`,{className:`t-fill`,children:[(0,Q.jsx)(kl,{dim:.6}),(0,Q.jsx)(`div`,{className:`t-overlay t-results-overlay`,children:(0,Q.jsx)(Ls,{kind:ye,victory:pe,missionName:N?.name||`FIELD OP`,plate:pe?bl.resultsPlate:bl.operationPlate,receipt:I,milestone:ne,pending:w,error:T,failure:he,nextObjective:re?.detail,actions:I?ae:(0,Q.jsx)(`button`,{type:`button`,className:`t-btn t-btn-primary`,disabled:w,onClick:()=>void h(),children:w?`Recording...`:`Retry saving result`}),children:(0,Q.jsxs)(`details`,{className:`t-detail`,"data-special-evidence":`true`,children:[(0,Q.jsx)(`summary`,{children:`Full field record & combat evidence`}),I?(0,Q.jsx)(Ml,{result:I}):(0,Q.jsx)(`p`,{children:`Progress is not confirmed without a matching server receipt.`}),I&&se?(0,Q.jsxs)(`section`,{className:`t-panel t-s3-after-action`,"aria-label":`Confirmed consequence and next tactical goal`,children:[(0,Q.jsx)(`span`,{className:`t-kicker`,children:`AFTER ACTION · SERVER RECORDED`}),oe?(0,Q.jsxs)(`div`,{className:`t-s3-world-proof`,children:[(0,Q.jsx)(`strong`,{children:oe.label}),(0,Q.jsx)(`p`,{children:oe.detail})]}):(0,Q.jsx)(`p`,{children:`No new persistent world change confirmed by this result.`}),(0,Q.jsxs)(`div`,{className:`t-s3-next`,children:[(0,Q.jsx)(`span`,{className:`t-kicker`,children:`ONE NEXT GOAL`}),(0,Q.jsx)(`strong`,{children:se.title}),(0,Q.jsx)(`p`,{children:se.reason})]})]}):null,(0,Q.jsx)(ks,{}),(0,Q.jsxs)(`dl`,{className:`t-stats`,children:[(0,Q.jsxs)(`div`,{children:[(0,Q.jsx)(`dt`,{children:`Turns`}),(0,Q.jsx)(`dd`,{children:s.turns})]}),(0,Q.jsxs)(`div`,{children:[(0,Q.jsx)(`dt`,{children:`Eliminated`}),(0,Q.jsx)(`dd`,{children:s.hostilesEliminated})]}),(0,Q.jsxs)(`div`,{children:[(0,Q.jsx)(`dt`,{children:`Squad standing`}),(0,Q.jsxs)(`dd`,{children:[s.squadStanding,` / `,s.squadDeployed]})]}),(0,Q.jsxs)(`div`,{children:[(0,Q.jsx)(`dt`,{children:`Damage taken`}),(0,Q.jsx)(`dd`,{children:s.damageTaken})]})]}),(0,Q.jsxs)(`section`,{className:`t-panel`,"aria-label":`Why your build mattered`,children:[(0,Q.jsx)(`span`,{className:`t-kicker`,children:`WHY YOUR BUILD MATTERED`}),fe.length?fe.map(e=>(0,Q.jsx)(`p`,{children:e},e)):(0,Q.jsx)(`p`,{children:`No build-specific effect observed in this encounter.`}),(0,Q.jsx)(`small`,{children:`Engine-observed on this device only; not persisted progress or extra rewards.`})]}),ce&&H?(0,Q.jsxs)(`p`,{children:[H.detail,` · Observed in this device session only.`]}):null,ce&&de.length?(0,Q.jsx)(`section`,{"aria-label":`Verified optional training`,children:de.map(e=>(0,Q.jsxs)(`div`,{children:[(0,Q.jsx)(`strong`,{children:e.title}),(0,Q.jsx)(`p`,{children:e.evidence})]},e.id))}):null,C?.playerGrowth&&I&&s.victory&&C.playerGrowth.earnedPoints>C.playerGrowth.spentPoints?(0,Q.jsxs)(`p`,{className:`t-special-balance`,children:[C.playerGrowth.earnedPoints-C.playerGrowth.spentPoints,` SKILL POINTS AVAILABLE · Total unspent balance, not a reward from this run.`]}):null]})})})]});let be=(0,Q.jsxs)(Q.Fragment,{children:[(0,Q.jsxs)(`section`,{className:`t-panel`,"aria-label":`Why your build mattered`,children:[(0,Q.jsx)(`span`,{className:`t-kicker`,children:`WHY YOUR BUILD MATTERED`}),fe.length?fe.map(e=>(0,Q.jsx)(`p`,{children:e},e)):(0,Q.jsx)(`p`,{children:`No build-specific effect observed in this encounter.`}),(0,Q.jsx)(`small`,{children:`Engine-observed on this device in this run only. These events are not persisted progress or extra rewards.`})]}),ce&&H?(0,Q.jsxs)(`section`,{className:`t-panel`,"aria-label":`This session combat evidence`,children:[(0,Q.jsx)(`span`,{className:`t-kicker`,children:`THIS RUN · ENGINE-CONFIRMED MOMENT`}),(0,Q.jsx)(`strong`,{children:H.detail}),(0,Q.jsx)(`p`,{children:`Observed in the current device session only. Not a persisted combat event log or extra reward.`})]}):null,ce&&de.length?(0,Q.jsxs)(`section`,{className:`t-panel`,"aria-label":`Verified optional training`,children:[(0,Q.jsx)(`span`,{className:`t-kicker`,children:`OPTIONAL TRAINING · CONFIRMED THIS RUN`}),de.map(e=>(0,Q.jsxs)(`div`,{children:[(0,Q.jsx)(`strong`,{children:e.title}),(0,Q.jsx)(`p`,{children:e.evidence})]},e.id)),(0,Q.jsx)(`small`,{children:`Training evidence is session-only; no extra rewards are awarded.`})]}):null,(0,Q.jsx)(ks,{}),(0,Q.jsxs)(`dl`,{className:`t-stats`,children:[(0,Q.jsxs)(`div`,{children:[(0,Q.jsx)(`dt`,{children:`Turns`}),(0,Q.jsx)(`dd`,{children:String(s.turns).padStart(2,`0`)})]}),(0,Q.jsxs)(`div`,{children:[(0,Q.jsx)(`dt`,{children:`Eliminated`}),(0,Q.jsx)(`dd`,{children:s.hostilesEliminated})]}),(0,Q.jsxs)(`div`,{children:[(0,Q.jsx)(`dt`,{children:`Squad standing`}),(0,Q.jsxs)(`dd`,{children:[s.squadStanding,` / `,s.squadDeployed]})]}),(0,Q.jsxs)(`div`,{children:[(0,Q.jsx)(`dt`,{children:`Damage taken`}),(0,Q.jsx)(`dd`,{children:s.damageTaken})]})]}),C?.playerGrowth&&s.victory&&(P&&I||F&&L)&&C.playerGrowth.earnedPoints>C.playerGrowth.spentPoints?(0,Q.jsxs)(`section`,{className:`t-growth-result`,"aria-label":`Server confirmed Skillbook progression`,children:[(0,Q.jsx)(`span`,{className:`t-kicker`,children:`SERVER-CONFIRMED PROGRESSION`}),(0,Q.jsxs)(`strong`,{children:[C.playerGrowth.earnedPoints-C.playerGrowth.spentPoints,` SKILL POINTS AVAILABLE`]}),(0,Q.jsx)(`small`,{children:`First-time mission clears add one point. Spend available points on the War Table Skillbook before your next deployment.`})]}):null]});return(0,Q.jsxs)(`div`,{className:`t-fill`,children:[(0,Q.jsx)(kl,{dim:.6}),(0,Q.jsx)(`div`,{className:`t-overlay t-results-overlay`,children:(0,Q.jsxs)(`div`,{className:`t-modal t-panel t-results ${me?`is-victory`:`is-failure`}`,children:[(0,Q.jsxs)(`header`,{className:`t-outcome-hero`,children:[(0,Q.jsx)(`img`,{className:`t-results-plate`,src:me?bl.resultsPlate:bl.operationPlate,alt:``,"aria-hidden":`true`}),(0,Q.jsx)(`span`,{className:`t-outcome-stamp`,children:me?`MISSION SECURED`:`MISSION LOST`}),(0,Q.jsx)(`div`,{className:`t-kicker`,children:P?`FIELD OP / ${N.name}`:(R||ge)&&N?N.name:_e?A.operationName:`Broken Signal`}),(0,Q.jsx)(`h2`,{className:`t-title`,children:I?.masteryChallenge?s.victory?`RELAY LOCKDOWN COMPLETE`:`RELAY LOCKDOWN FAILED`:R?me?`VICTORY`:`DEFEAT`:F?s.victory?N?.objectiveType===`BOSS`?`DEAD RELAY SECURED`:`OBJECTIVE SECURED`:`MISSION FAILED`:P?s.victory?`FIELD OP COMPLETE`:`FIELD OP FAILED`:ge?N?.objectiveType===`BOSS`?`SIGNAL COMMANDER DOWN`:N?.objectiveType===`RECOVER`?`OBJECTIVE COMPLETE`:ve?`BREACH CLEARED`:`BREACH REPLAY COMPLETE`:_e?A.resultsTitle:`Operation Complete`})]}),_e?(0,Q.jsx)(`p`,{style:{color:`var(--t-muted)`,margin:`0 0 1.1rem`},children:P?null:ge?N?.objectiveType===`RECOVER`?ve?`Continue to unlock SIGNAL COMMANDER.`:`SIGNAL RECOVERED.`:N?.objectiveType===`ELIMINATE`&&ve?`RECOVER AVAILABLE.`:null:A.resultsNote}):null,ge&&N?.missionId===`broken-signal-breach`?(0,Q.jsxs)(`p`,{style:{color:E||C?.intel?.routingTrace?`var(--t-accent)`:`var(--t-faint)`,margin:`0 0 0.8rem`},children:[`ROUTING TRACE — `,E||C?.intel?.routingTrace?`ACQUIRED`:`MISSED`]}):null,ge&&!F&&!f&&N?.objectiveType===`BOSS`?(0,Q.jsx)(`p`,{style:{color:`var(--t-accent)`,margin:`0 0 0.8rem`},children:ve?N.resultsCopy:C?.operations?.[xt.operationId]?`BROKEN SIGNAL CLEARED · THE DEAD RELAY CAMPAIGN AVAILABLE`:`BROKEN SIGNAL remains CLEARED · ARCHIVE AVAILABLE · NEXT OPERATION SLOT EMPTY / UNASSIGNED`}):null,f?(0,Q.jsxs)(`div`,{className:`t-panel`,role:`status`,children:[(0,Q.jsx)(`strong`,{children:z?`CHAPTER RESULT RECORDED`:w?`RECORDING CHAPTER RESULT…`:`CHAPTER RESULT NOT YET RECORDED`}),(0,Q.jsx)(`p`,{children:z?`GHOST SIGNAL · ${z.stageRecorded}/3 operations recorded.${z.chapterComplete?` RECON Intel ready for a qualifying encounter.`:``}`:`Only server-recorded results advance this chapter.`})]}):null,!f&&P?(0,Q.jsxs)(`div`,{children:[s.victory?null:(0,Q.jsxs)(`p`,{children:[Ze(o,N.objectiveType),` No clear or commander progress earned.`]}),I?(0,Q.jsx)(Ml,{result:I}):(0,Q.jsx)(`p`,{role:`status`,children:w?`Recording result…`:`Result not recorded yet.`})]}):null,!f&&P?(0,Q.jsxs)(`details`,{className:`t-detail`,children:[(0,Q.jsx)(`summary`,{children:`Challenge objective`}),(0,Q.jsx)(`p`,{children:N.challenge?.label})]}):null,R?(0,Q.jsxs)(`section`,{className:`t-campaign-result-impact`,role:`status`,children:[(0,Q.jsx)(`span`,{className:`t-kicker`,children:`WHAT CHANGED`}),(0,Q.jsx)(`strong`,{children:oe?.label||(L?.victory?`VICTORY SAVED`:`DEFEAT SAVED`)}),oe?(0,Q.jsx)(`p`,{children:oe.detail}):L?.victory&&!L.intelEarned&&N?.missionId===`dead-relay-courier`?(0,Q.jsx)(`p`,{children:`Courier stopped. No Courier Trace earned this run.`}):null]}):!f&&F?(0,Q.jsx)(`div`,{className:`t-panel t-deploy-overview`,role:`status`,children:(0,Q.jsx)(`strong`,{children:w?`RECORDING CAMPAIGN RESULT...`:`RESULT AWAITS SERVER RECORD`})}):null,se&&!F?(0,Q.jsxs)(`section`,{className:`t-panel t-s3-after-action`,"aria-label":`Confirmed consequence and next tactical goal`,"data-s3-receipt":ce,children:[(0,Q.jsx)(`span`,{className:`t-kicker`,children:`AFTER ACTION · SERVER RECORDED`}),oe?(0,Q.jsxs)(`div`,{className:`t-s3-world-proof`,children:[(0,Q.jsx)(`strong`,{children:oe.label}),(0,Q.jsx)(`p`,{children:oe.detail})]}):null,(0,Q.jsxs)(`div`,{className:`t-s3-next`,children:[(0,Q.jsx)(`span`,{className:`t-kicker`,children:`ONE NEXT GOAL`}),(0,Q.jsx)(`strong`,{children:se.title}),(0,Q.jsx)(`p`,{children:se.reason})]})]}):null,R?null:be,B&&!B.victory?(0,Q.jsx)(`p`,{className:`t-fr-outcome`,children:he}):null,re?(0,Q.jsxs)(`div`,{className:`t-fr-next`,children:[(0,Q.jsx)(`span`,{className:`t-kicker`,children:`WHAT’S NEXT`}),(0,Q.jsx)(`p`,{children:re.detail})]}):null,(0,Q.jsx)(`div`,{className:`t-brief-actions t-result-actions`,children:f?z?ae:(0,Q.jsx)(`button`,{type:`button`,className:`t-btn t-btn-primary`,disabled:w,onClick:()=>void p(),children:w?`RECORDING…`:`RECORD CHAPTER RESULT`}):F?R?ae:(0,Q.jsx)(`button`,{type:`button`,className:`t-btn t-btn-primary`,disabled:w,onClick:()=>void m(),children:w?`Recording...`:s.victory?`SAVE VICTORY`:`RECORD FAILURE`}):_e?(0,Q.jsxs)(Q.Fragment,{children:[(0,Q.jsxs)(`button`,{type:`button`,className:`t-btn t-btn-primary`,onClick:()=>v(),disabled:w,children:[w?`Saving…`:P?`Save clear / Field Ops`:ge||U?`Continue`:`Return to Tactical Ops`,ge||U?(0,Q.jsx)(ue,{className:`t-ico`}):null]}),(0,Q.jsx)(`button`,{type:`button`,className:`t-btn`,onClick:g,disabled:w,children:P?`Save clear / Replay`:ge?`REPLAY`:`Replay this drill`})]}):(0,Q.jsxs)(Q.Fragment,{children:[(0,Q.jsx)(`button`,{type:`button`,className:`t-btn t-btn-primary`,onClick:g,children:`Replay operation`}),(0,Q.jsx)(`button`,{type:`button`,className:`t-btn`,onClick:_,children:`Return to Tactical Ops`})]})}),R?(0,Q.jsxs)(`details`,{className:`t-detail`,children:[(0,Q.jsx)(`summary`,{children:`Combat report · this device`}),be]}):null,T?(0,Q.jsx)(`p`,{style:{color:`var(--t-enemy)`,margin:`0.8rem 0 0`},children:T}):null]})})]})}function Hl(){let e=Z(e=>e.battle.failureReason),t=W(Z(e=>e.selectedMissionId)),n=t?.activity===`FIELD_OP`,r=Z(e=>e.replay),i=Z(e=>e.backToHub);return(0,Q.jsxs)(`div`,{className:`t-fill`,children:[(0,Q.jsx)(kl,{dim:.7}),(0,Q.jsx)(`div`,{className:`t-overlay`,children:(0,Q.jsxs)(`div`,{className:`t-modal t-panel`,children:[(0,Q.jsx)(`div`,{className:`t-kicker`,style:{color:`var(--t-enemy)`},children:n?`FIELD OP / ${t.name}`:`Broken Signal`}),(0,Q.jsx)(`h2`,{className:`t-title`,children:n?`FIELD OP FAILED`:`Operation Failed`}),(0,Q.jsx)(`p`,{style:{color:`var(--t-muted)`,margin:`0 0 1.1rem`},children:n?Ze(e,t.objectiveType):`All allied units are down.`}),(0,Q.jsxs)(`div`,{className:`t-brief-actions`,style:{justifyContent:`center`},children:[(0,Q.jsxs)(`button`,{type:`button`,className:`t-btn t-btn-primary`,onClick:r,children:[(0,Q.jsx)(ge,{className:`t-ico`}),` Retry`]}),(0,Q.jsx)(`button`,{type:`button`,className:`t-btn`,onClick:i,children:`Return`})]})]})})]})}function Ul(){let[,e]=(0,y.useState)(0);(0,y.useEffect)(()=>rc()?.subscribe(()=>e(e=>e+1)),[]);let t=rc()?.view().result,n=Z(e=>e.screen),r=Z(e=>e.selectSkill),i=Z(e=>e.skipTurn),a=Z(e=>e.muted);return(0,y.useEffect)(()=>{q()&&(Z.setState({muted:!0}),ao(!0))},[]),(0,y.useEffect)(()=>{let e=e=>{let t=Z.getState(),n=t.battle.units.find(e=>e.id===t.battle.activeId);e.key===`1`&&n&&r(n.skillIds[0]),e.key===`2`&&n&&r(n.skillIds[1]),e.key===`3`&&n&&r(n.skillIds[2]),(e.key===`s`||e.key===`S`)&&i()};window.addEventListener(`keydown`,e);let t=()=>ro();return window.addEventListener(`pointerdown`,t,{once:!0}),()=>{window.removeEventListener(`keydown`,e),window.removeEventListener(`pointerdown`,t)}},[r,i]),(0,y.useEffect)(()=>{ao(a)},[a]),(0,Q.jsx)(`div`,{className:`t-shell`,"data-screen":t?.confirmed?`results`:n,children:t?.confirmed?(0,Q.jsx)(jl,{receipt:t}):(0,Q.jsxs)(Q.Fragment,{children:[n===`hub`?(0,Q.jsx)(Al,{}):null,n===`war-table`?(0,Q.jsx)(Pl,{}):null,n===`brief`?(0,Q.jsx)(zl,{}):null,n===`battle`?(0,Q.jsx)(Vc,{}):null,n===`sector`?(0,Q.jsx)(Bl,{}):null,n===`results`?(0,Q.jsx)(Vl,{}):null,n===`defeat`?(0,Q.jsx)(Hl,{}):null]})})}var Wl=`/* Alpha Husky Tactical Ops — viewport-first playability (V1)\r
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
#tacticalOpsRoot .t-token.directional-alpha .t-alpha-ground-shadow {\r
  position:absolute; left:12%; right:12%; bottom:3%; height:9%;\r
  border-radius:50%; background:radial-gradient(ellipse,rgba(0,0,0,.52),transparent 72%);\r
  pointer-events:none;\r
}\r
#tacticalOpsRoot .t-token.directional-alpha img.body { position:relative; }\r
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

/* Mission Brief · Loadout */
#tacticalOpsRoot .t-loadout-active.t-deployment.t-premium-ux .t-deploy-hero-v29 {
  min-height: 86px; padding-top: max(26px, var(--ah-chrome-top, 0px));
}
#tacticalOpsRoot .t-loadout-active.t-deployment.t-premium-ux .t-deploy-hero-copy { padding-top: 0; }
#tacticalOpsRoot .t-loadout-active .t-deploy-hero .t-title { font-size: clamp(17px, 5.4vw, 26px) !important; }
#tacticalOpsRoot .t-loadout-slot small > span { display: block; }
#tacticalOpsRoot .t-loadout-panel { padding: 11px; margin: 0; }
#tacticalOpsRoot .t-loadout-panel h2,
#tacticalOpsRoot .t-loadout-reference-body h2 { margin: 0; }
#tacticalOpsRoot .t-loadout-unit-picker,
#tacticalOpsRoot .t-loadout-slots,
#tacticalOpsRoot .t-loadout-choices { display: grid; gap: 6px; }
#tacticalOpsRoot .t-loadout-unit-picker,
#tacticalOpsRoot .t-loadout-slots { grid-template-columns: repeat(3, minmax(0, 1fr)); }
#tacticalOpsRoot .t-loadout-unit-picker { margin: 7px 0 9px; }
#tacticalOpsRoot .t-loadout-unit-picker button,
#tacticalOpsRoot .t-loadout-choices button {
  min-width: 0; min-height: 44px; padding: 5px; border-radius: 7px;
  border: 1px solid #4a7488; background: #0a2030; color: var(--t-text, #e2f2fb);
  font: inherit; cursor: pointer;
}
#tacticalOpsRoot .t-loadout-unit-picker button[aria-pressed="true"],
#tacticalOpsRoot .t-loadout-choices button[aria-pressed="true"] {
  border-color: #92e7ff; background: #164157; box-shadow: inset 0 -2px #78dbf6;
}
#tacticalOpsRoot .t-loadout-unit-picker button { display: grid; place-content: start center; justify-items: center; gap: 3px; }
#tacticalOpsRoot .t-loadout-portrait { width: 36px; height: 36px; display: grid; place-items: center; position: relative; color: #a6e4f1; }
#tacticalOpsRoot .t-loadout-portrait img { position: absolute; inset: 0; width: 100%; height: 100%; border-radius: 5px; object-fit: cover; }
#tacticalOpsRoot .t-loadout-unit-picker strong { font-size: 11px; }
#tacticalOpsRoot .t-loadout-unit-picker small { font-size: 10px; color: #a6e4f1; }
#tacticalOpsRoot .t-loadout-choices { grid-template-columns: repeat(2, minmax(0, 1fr)); }
#tacticalOpsRoot .t-loadout-choices button { text-align: left; padding: 6px 8px; }
#tacticalOpsRoot .t-loadout-choices button:disabled { cursor: default; opacity: .65; }
#tacticalOpsRoot .t-loadout-choices strong,
#tacticalOpsRoot .t-loadout-slot strong { display: block; font-size: 12px; }
#tacticalOpsRoot .t-loadout-choices small,
#tacticalOpsRoot .t-loadout-slot small { display: block; margin-top: 3px; color: #bdd2dd; font-size: 11px; line-height: 1.25; }
#tacticalOpsRoot .t-loadout-variants p { margin: 4px 0 8px; color: #bdd2dd; font-size: 11px; }
#tacticalOpsRoot .t-loadout-slot {
  min-width: 0; min-height: 68px; padding: 6px;
  border-radius: 7px; border: 1px solid #375467; background: #091c2a; overflow-wrap: anywhere;
}
#tacticalOpsRoot .t-loadout-slot > span { color: #a6e4f1; font-size: 10px; font-weight: 800; }
#tacticalOpsRoot .t-loadout-slot img { width: 24px; height: 24px; object-fit: contain; vertical-align: middle; margin-inline-start: 4px; }
#tacticalOpsRoot .t-field-rend { margin-bottom: 8px; }
#tacticalOpsRoot .t-field-rend .t-loadout-choices { margin-top: 5px; }
#tacticalOpsRoot .t-field-rend .t-loadout-choices button { min-height: 64px; }
#tacticalOpsRoot .t-field-rend .t-loadout-choices button[aria-pressed="true"]:disabled { opacity: 1; }
#tacticalOpsRoot .t-field-rend-state {
  display: block; margin-top: 5px; color: var(--t-text); font-size: 10px; font-weight: 800; letter-spacing: .04em;
}
#tacticalOpsRoot .t-field-rend button[aria-pressed="true"] .t-field-rend-state { color: var(--t-accent); }
#tacticalOpsRoot .t-field-rend [role="alert"] { color: var(--t-enemy); }
#tacticalOpsRoot .t-loadout-slots-with-a2-picker { grid-template-columns: repeat(2, minmax(0, 1fr)); }
#tacticalOpsRoot .t-loadout-readiness { margin: 8px 0 0; color: #b9e8f5; font-size: 12px; }
#tacticalOpsRoot .t-codex-reference { margin-top: 8px; padding: 0 11px; }
#tacticalOpsRoot .t-codex-reference > summary {
  min-height: 44px; padding: 13px 0; cursor: pointer; color: #b9e8f5; font-size: 13px; font-weight: 800;
}
#tacticalOpsRoot .t-loadout-reference-body { display: grid; gap: 12px; padding: 0 0 11px; }
#tacticalOpsRoot .t-loadout-reference-body ul { list-style: none; margin: 4px 0 0; padding: 0; }
#tacticalOpsRoot .t-loadout-reference-body li { border-top: 1px solid #375467; padding: 6px 0; font-size: 12px; }
#tacticalOpsRoot .t-loadout-reference-body li span { display: block; color: #bdd2dd; margin-top: 2px; }



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
#tacticalOpsRoot .t-deploy-command-pane .t-deploy-squad { margin-top: 0; }
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
#tacticalOpsRoot .t-command-action-dock {z-index:45;}
#tacticalOpsRoot .t-premium-ux .t-growth-paths {grid-template-columns:repeat(2,minmax(0,1fr));}
#tacticalOpsRoot .t-premium-ux .t-growth-paths button {min-height:76px;}
@media(max-width:620px) {
  #tacticalOpsRoot .t-deployment.t-premium-ux .t-deploy-summary-main {grid-column:1/-1;}
  #tacticalOpsRoot .t-deployment.t-premium-ux .t-deploy-summary-card {padding:.6rem;}
  #tacticalOpsRoot .t-deployment.t-premium-ux .t-deploy-hero-copy {max-width:100%;padding-top:44px;}
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
#tacticalOpsRoot .t-obj-chip{width:min(220px,48vw);padding:8px 9px;background:rgba(3,19,29,.96);border-color:rgba(87,211,239,.58)}
#tacticalOpsRoot .t-obj-chip strong{font-size:.65rem;letter-spacing:.045em;line-height:1.25}
#tacticalOpsRoot .t-obj-chip .t-objective-directive{display:block;-webkit-line-clamp:unset;line-clamp:unset;overflow:visible;color:#7edcf0;font-size:.67rem;line-height:1.3;font-weight:800;letter-spacing:.06em;margin-top:5px}
#tacticalOpsRoot .t-obj-chip .t-objective-action{display:block;color:#d4edf4;font-size:.61rem;line-height:1.35;letter-spacing:0;white-space:normal;margin:3px 0}
#tacticalOpsRoot .t-obj-chip .t-obj-rounds{margin-top:7px;border-top:1px solid rgba(124,210,227,.2);padding-top:5px}
#tacticalOpsRoot .t-brief-purpose-meta{font-size:.76rem;line-height:1.4;color:#b8d6e2;margin-top:9px}
#tacticalOpsRoot .t-brief-purpose-meta b{color:#7edcf0}
#tacticalOpsRoot .t-player-result-next{padding:11px 13px;margin:10px 0;border-left:3px solid #6fcee3;background:#0c2837;display:grid;gap:6px}
#tacticalOpsRoot .t-player-result-next strong{font-family:var(--t-font-display);color:#e4faff;letter-spacing:.07em}
#tacticalOpsRoot .t-player-result-next p{color:#b8d8e5;font-size:.75rem;margin:0;line-height:1.4}
@media(max-width:620px){
 #tacticalOpsRoot .t-shell[data-screen="battle"] .t-obj-chip{width:min(184px,46vw);padding:7px 8px}
 #tacticalOpsRoot .t-shell[data-screen="battle"] .t-obj-chip strong{font-size:.59rem}
 #tacticalOpsRoot .t-shell[data-screen="battle"] .t-obj-chip .t-objective-directive{font-size:.60rem}
 #tacticalOpsRoot .t-shell[data-screen="battle"] .t-obj-chip .t-objective-action{font-size:.57rem}
 #tacticalOpsRoot .t-player-route{padding:9px 10px;margin:6px 0 0;border-radius:6px}
 #tacticalOpsRoot .t-player-route-metrics{gap:4px}
 #tacticalOpsRoot .t-wt-next-op .t-wt-feature-copy h2{font-size:clamp(.95rem,3.5vw,1.25rem)}
 #tacticalOpsRoot .t-wt-next-op .t-wt-feature-copy .t-wt-objective{font-size:.72rem}
}

/* S1: one mission hero on mobile; no duplicate next-step card. */
#tacticalOpsRoot .t-wt-feature-copy .t-player-route-metrics{margin:8px 0 4px}
#tacticalOpsRoot .t-wt-feature-copy .t-player-next-reason{font-size:.73rem;line-height:1.4;color:#b9dfec;margin:7px 0 8px}
#tacticalOpsRoot .t-wt-feature-copy .t-player-route-metrics span{font-size:.58rem}
@media(max-width:620px){#tacticalOpsRoot .t-wt-feature-copy .t-player-route-metrics{gap:4px}#tacticalOpsRoot .t-wt-feature-copy .t-player-route-metrics span{padding:4px 6px}}

/* Battlefield P5 — BLACKGLASS RELAY COMMAND.
   One fixed rail, one projected field, one fixed dock. Presentation only. */
#tacticalOpsRoot .t-shell[data-screen="battle"] .t-battle-hud-rail {
  display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:6px;
  height:calc(52px + var(--t-battle-safe-top));min-height:calc(52px + var(--t-battle-safe-top));
  padding:calc(var(--t-battle-safe-top) + 4px) max(5px,var(--ah-safe-right,0px)) 4px max(5px,var(--ah-safe-left,0px));
  background:linear-gradient(180deg,#071725,#0a202e);border:0;
  overflow:hidden;pointer-events:auto;align-items:stretch;
}
#tacticalOpsRoot .t-shell[data-screen="battle"] .t-battle-hud-rail .t-hud-card {
  box-sizing:border-box;position:relative;inset:auto;grid-area:auto;display:grid;
  margin:0;width:100%;min-width:0;max-width:none;height:44px;min-height:44px;max-height:44px;
  padding:3px 6px;overflow:hidden;border:1px solid #426272;border-radius:5px;
  background:linear-gradient(145deg,#102e3e,#0b1e2c);box-shadow:inset 0 1px #bce5ef0d;
  color:#e2f3f7;font:inherit;text-align:left;cursor:pointer;pointer-events:auto;touch-action:manipulation;
}
#tacticalOpsRoot .t-shell[data-screen="battle"] .t-battle-hud-rail .t-status {
  grid-template-columns:27px minmax(0,1fr);column-gap:6px;align-items:center;
}
#tacticalOpsRoot .t-shell[data-screen="battle"] .t-battle-hud-rail .t-status-portrait {width:27px;height:27px}
#tacticalOpsRoot .t-shell[data-screen="battle"] .t-battle-hud-rail .t-status-portrait > img {width:100%;height:100%}
#tacticalOpsRoot .t-shell[data-screen="battle"] .t-battle-hud-rail .t-status-name {
  font-size:11px;line-height:14px;letter-spacing:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#edf9fc;
}
#tacticalOpsRoot .t-shell[data-screen="battle"] .t-battle-hud-rail .t-status .t-hp {margin-top:2px;gap:4px}
#tacticalOpsRoot .t-shell[data-screen="battle"] .t-battle-hud-rail .t-hp-num {font-size:11px;line-height:13px;color:#deedf4}
#tacticalOpsRoot .t-shell[data-screen="battle"] .t-battle-hud-rail .t-obj-chip {align-content:center;gap:1px}
#tacticalOpsRoot .t-shell[data-screen="battle"] .t-battle-hud-rail .t-obj-chip strong {
  font-size:11px;line-height:14px;letter-spacing:0;color:#e2f4f7;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block;
}
#tacticalOpsRoot .t-shell[data-screen="battle"] .t-battle-hud-rail .t-status-kit,
#tacticalOpsRoot .t-shell[data-screen="battle"] .t-battle-hud-rail .t-status-mods,
#tacticalOpsRoot .t-shell[data-screen="battle"] .t-battle-hud-rail .t-combat-identity,
#tacticalOpsRoot .t-shell[data-screen="battle"] .t-battle-hud-rail .t-chips,
#tacticalOpsRoot .t-shell[data-screen="battle"] .t-battle-hud-rail .t-status-stats,
#tacticalOpsRoot .t-shell[data-screen="battle"] .t-battle-hud-rail .t-objective-directive,
#tacticalOpsRoot .t-shell[data-screen="battle"] .t-battle-hud-rail .t-objective-action,
#tacticalOpsRoot .t-shell[data-screen="battle"] .t-battle-hud-rail .t-obj-chip > span:not(.t-objective-summary):not(.t-objective-detail),
#tacticalOpsRoot .t-shell[data-screen="battle"] .t-battle-hud-rail .t-obj-chip > small,
#tacticalOpsRoot .t-shell[data-screen="battle"] .t-battle-hud-rail .t-obj-rounds {display:none}
#tacticalOpsRoot .t-battle-hud-rail .t-status-detail,
#tacticalOpsRoot .t-battle-hud-rail .t-objective-detail {display:none}
#tacticalOpsRoot .t-battle-hud-rail .t-objective-summary {display:block;color:#a3d9e6;font-size:11px;line-height:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
/* Details replace content inside the same 44px card; no growth, board overlay,
   automatic closing, or competing popovers. Long detail lines pan horizontally. */
#tacticalOpsRoot .t-shell[data-screen="battle"] .t-battle-hud-rail .t-hud-card.is-expanded {border-color:#b3dfe9;box-shadow:none}
#tacticalOpsRoot .t-shell[data-screen="battle"] .t-battle-hud-rail .t-status.is-expanded {grid-template-columns:minmax(0,1fr);grid-template-rows:16px 16px;align-content:center;gap:0}
#tacticalOpsRoot .t-shell[data-screen="battle"] .t-battle-hud-rail .t-status.is-expanded .t-status-portrait {display:none}
#tacticalOpsRoot .t-shell[data-screen="battle"] .t-battle-hud-rail .t-status.is-expanded .t-status-main {display:flex;align-items:center;gap:5px;min-width:0}
#tacticalOpsRoot .t-shell[data-screen="battle"] .t-battle-hud-rail .t-status.is-expanded .t-hp-bar {display:none}
#tacticalOpsRoot .t-shell[data-screen="battle"] .t-battle-hud-rail .t-status.is-expanded .t-hp {margin:0}
#tacticalOpsRoot .t-shell[data-screen="battle"] .t-battle-hud-rail .t-status.is-expanded .t-status-detail,
#tacticalOpsRoot .t-battle-hud-rail .t-obj-chip.is-expanded .t-objective-detail {
  display:block;font-size:11px;line-height:16px;color:#e2f3f7;white-space:nowrap;overflow-x:auto;touch-action:pan-x;scrollbar-width:none;
}
#tacticalOpsRoot .t-battle-hud-rail .t-obj-chip.is-expanded .t-objective-summary {display:none}
#tacticalOpsRoot .t-shell[data-screen="battle"] .t-order-wrap {display:none}
#tacticalOpsRoot .t-battle .t-field {container-type:size}
/* Use the existing image without excessive blackening; local grade separates silhouettes. */
#tacticalOpsRoot .t-battle .t-field-art {filter:saturate(.72) brightness(.98) contrast(.96)}
#tacticalOpsRoot .t-battle .t-field-grade {background:linear-gradient(180deg,#07172570,transparent 24%,#081a2930 70%,#061321b8),radial-gradient(ellipse at center,#3b647b20,transparent 70%)}
#tacticalOpsRoot .t-battle .t-grid i {opacity:.34;border-color:#a9cfdb70;background:none}
#tacticalOpsRoot .t-battle .t-token .body {filter:drop-shadow(0 3px 3px #020a14) drop-shadow(0 0 2px #bdd7e740)}
#tacticalOpsRoot .t-battle .t-token.directional-alpha .body {filter:none}
#tacticalOpsRoot .t-battle .t-token.active .t-ring {filter:none;color:#b7f0ff}
#tacticalOpsRoot .t-battle .t-token.subdued {opacity:.65;filter:saturate(.6)}
/* Actual pointer regions use projection spacing, NEVER overlapping 44px boxes.
   Unit hit buttons are siblings at their cell anchors, not offset inside sprites. */
#tacticalOpsRoot .t-battle .t-cell,
#tacticalOpsRoot .t-battle .t-unit-hit {
  width:min(44px,var(--cell-touch-w));height:min(44px,var(--cell-touch-h));
  min-width:0;min-height:0;max-width:44px;max-height:44px;
  position:absolute;bottom:auto;transform:translate(-50%,-50%);border-radius:4px;transition:none;
}
#tacticalOpsRoot .t-battle .t-unit-hit {z-index:35;border:0;background:transparent}
/* Interactive hit region remains unchanged: visual brackets are on the separate token. */
#tacticalOpsRoot .t-battle .t-unit-hit.is-legal-target {border:0;background:transparent;box-shadow:none}
#tacticalOpsRoot .t-battle .t-unit-hit.is-legal-target:focus-visible {
  outline:2px solid #f4d49f;outline-offset:2px;
}
#tacticalOpsRoot .t-battle .t-cell.move::after {width:9px;height:9px;border-radius:2px;box-shadow:none;background:#8adbed20;border:1px solid #a2e0ef;transform:translate(-50%,-50%) rotate(45deg)}
#tacticalOpsRoot .t-battle .t-cell.move:hover::after,
#tacticalOpsRoot .t-battle .t-cell.move:focus-visible::after {width:13px;height:13px;background:#a1e7f178;box-shadow:none}
#tacticalOpsRoot .t-battle :is(.t-unit-hit,.t-cell,button):focus-visible {outline:2px solid #f4d49f;outline-offset:1px}
#tacticalOpsRoot .t-battle .t-threat-tile {
  z-index:32;width:var(--cell-touch-w);height:var(--cell-touch-h);aspect-ratio:auto;
  border:2px solid #ffb4a5;border-radius:3px;box-shadow:none;animation:none;
  background:repeating-linear-gradient(135deg,#b9323655 0 3px,#220f1a33 3px 7px);pointer-events:none;
}
#tacticalOpsRoot .t-threat-tile > span {position:absolute;right:0;top:0;padding:0 2px;font:900 11px/12px var(--t-font-sans);color:#fff4ec;background:#751f2d}
#tacticalOpsRoot .t-threat-source {position:absolute;z-index:33;transform:translate(-50%,-50%);color:#fff0e8;background:#692431;border:1px solid #ffb4a5;border-radius:3px;font:800 11px/15px var(--t-font-sans);min-width:16px;text-align:center;pointer-events:none}
#tacticalOpsRoot .t-command-cue {
  position:absolute;z-index:34;left:10px;right:10px;top:7px;max-height:calc(21cqh - 10px);
  overflow:hidden;pointer-events:none;display:grid;gap:2px;
  padding-left:8px;border-left:2px solid #799cab;color:#e4f0f4;text-shadow:0 1px 2px #04111d;
}
#tacticalOpsRoot .t-command-cue p {margin:0;font:400 11px/15px var(--t-font-sans);display:-webkit-box;-webkit-line-clamp:2;line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
#tacticalOpsRoot .t-command-cue strong {margin-right:6px;font-weight:850;letter-spacing:.025em;color:#effaff}
#tacticalOpsRoot .t-command-cue .t-command-confirmation {font-weight:800;color:#d1f1e4}
#tacticalOpsRoot .t-command-cue small {font:500 11px/14px var(--t-font-sans);color:#c2d8e4}
#tacticalOpsRoot .t-battle[data-decision="REACT"] .t-command-cue {border-color:#ffb4a5}
#tacticalOpsRoot .t-battle[data-decision="REACT"] .t-command-cue strong {color:#ffcfbf}
#tacticalOpsRoot .t-battle[data-decision="REACT"] :is(.t-ring,.t-target-reticle) {animation:none;filter:none}
#tacticalOpsRoot .t-battle[data-decision="RESOLVE"] .t-command-cue {border-color:#c9e8d9}
/* Assistance is optional and outside projected rows. Small/short boards retain
   exact per-cell input; no global confirmation/double-tap gesture. */
#tacticalOpsRoot .t-target-assist {display:none}
@container (min-height:340px) {
  #tacticalOpsRoot .t-target-assist {position:absolute;z-index:34;left:10px;right:10px;bottom:8px;display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;pointer-events:auto}
  #tacticalOpsRoot .t-target-assist button {flex:0 0 auto;min-width:112px;max-width:200px;height:44px;display:flex;align-items:center;gap:7px;padding:4px 9px;color:#e5f6fa;background:#102c3d;border:1px solid #92cfdd;border-radius:5px;font:700 11px/14px var(--t-font-sans);text-align:left;touch-action:pan-x}
  #tacticalOpsRoot .t-target-assist svg {width:16px;height:16px;flex:none}
  #tacticalOpsRoot .t-target-assist small {display:block;color:#c2dde5;font-size:11px;font-weight:400}
}
#tacticalOpsRoot .t-shell[data-screen="battle"] .t-dock {grid-template-columns:44px minmax(0,1fr) 50px;gap:3px;padding-top:2px;padding-left:max(5px,var(--ah-safe-left,0px));padding-right:max(5px,var(--ah-safe-right,0px))}
#tacticalOpsRoot .t-battle .t-icon-btn {width:44px;min-width:44px;height:44px;min-height:44px}
#tacticalOpsRoot .t-battle .t-actions {min-height:60px}
/* Four equal cards clipped RECOVER at 320px. Reserve its label width while
   retaining the 60px dock and at least 44px for each of the three skill inputs. */
#tacticalOpsRoot .t-battle .t-actions.has-obj {gap:2px}
#tacticalOpsRoot .t-battle .t-actions.has-obj .t-act-obj {flex:0 0 68px}
@media (max-width:360px) {
  #tacticalOpsRoot .t-battle .t-actions.has-obj .t-act {min-width:44px}
  #tacticalOpsRoot .t-battle .t-actions.has-obj .t-act.kind-control {flex-grow:1.24}
  #tacticalOpsRoot .t-battle .t-actions.has-obj .t-act.kind-control .name {font:800 8.5px/12px var(--t-font-sans);padding-inline:0}
  #tacticalOpsRoot .t-battle .t-actions.has-obj .t-act:not(.t-act-obj) .meta {font:700 8px/12px var(--t-font-sans)}
}
#tacticalOpsRoot .t-shell[data-screen="battle"] .t-dock.has-recovery {grid-template-columns:44px minmax(0,1fr) 44px;gap:2px}
#tacticalOpsRoot .t-battle .t-enemy-command {height:60px;min-height:60px;max-height:60px}
#tacticalOpsRoot .t-battle .t-act {height:60px;min-height:60px;padding:2px 1px;gap:0}
#tacticalOpsRoot .t-battle .t-act .name {flex-shrink:0;font-size:10px;line-height:12px;letter-spacing:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#tacticalOpsRoot .t-battle .t-act .meta {flex-shrink:0;margin-top:0;font-size:10px;line-height:12px;letter-spacing:0;color:#d0e5ec}
#tacticalOpsRoot .t-battle .t-act-keyline {display:flex;flex:0 0 10px;width:100%;justify-content:space-between;align-items:center;gap:2px}
#tacticalOpsRoot .t-battle .t-act-keyline .slot {position:static;font-size:8px;line-height:10px;letter-spacing:0}
#tacticalOpsRoot .t-battle .t-act-keyline .t-skill-rank {position:static;max-width:none;padding:0 2px;font-size:7px;line-height:8px}
#tacticalOpsRoot .t-battle .t-act-art {width:20px;height:20px;flex:0 0 20px;margin:0 auto}
#tacticalOpsRoot .t-battle .t-act.on {outline:1px solid #c1e9f1;outline-offset:-3px}
#tacticalOpsRoot .t-battle .t-act .meta[data-action-state^="CD"] {color:#ffd2a0}
#tacticalOpsRoot .t-battle .t-act .meta[data-action-state="USED"] {color:#d4eddf}
#tacticalOpsRoot .t-battle .t-skip {min-width:44px;padding-inline:2px;font-size:11px;letter-spacing:0}
#tacticalOpsRoot .t-cancel-label {font:400 24px/22px var(--t-font-sans)}
#tacticalOpsRoot .t-cancel-label small {display:block;font:700 9px/10px var(--t-font-sans)}
@media(prefers-reduced-motion:reduce) {
  #tacticalOpsRoot .t-battle :is(.t-token,.t-ring,.t-target-reticle,.t-terminal,.t-reinforcement-marker) {animation:none!important;transition:none!important}
  #tacticalOpsRoot .t-battle .t-unit-hit.is-legal-target {background:#2e5c70}
}

/* Combat FX readability P1 — confirmed effects only; no targeting or gameplay changes. */
#tacticalOpsRoot .t-sprite-fx { width:clamp(72px,18vw,132px);height:clamp(72px,18vw,132px);filter:drop-shadow(0 0 8px rgba(73,206,248,.26)); }
#tacticalOpsRoot .t-sprite-fx.fx-area {width:clamp(115px,29vw,205px);height:clamp(115px,29vw,205px);z-index:13;}
#tacticalOpsRoot .t-sprite-fx.fx-area::before {content:"";position:absolute;inset:25%;border-radius:50%;background:radial-gradient(circle,rgba(93,231,244,.19),rgba(54,172,216,.07) 48%,transparent 72%);animation:t-fx-soft-wave .72s ease-out both;pointer-events:none;}
#tacticalOpsRoot .t-sprite-fx.fx-area.fx-support::before {background:radial-gradient(circle,rgba(88,239,199,.22),rgba(60,192,159,.07) 52%,transparent 74%);}
#tacticalOpsRoot .t-master-fx-ring {width:48px;height:48px;border:0;border-radius:50%;background:radial-gradient(circle,transparent 35%,var(--fx-c) 72%,transparent 77%);opacity:0;animation:t-fx-soft-wave .48s ease-out both;}
#tacticalOpsRoot .t-master-fx.fx-affinity-cnc .t-master-fx-ring,#tacticalOpsRoot .t-master-fx.fx-affinity-pet .t-master-fx-ring {border:0;border-radius:50%;}
#tacticalOpsRoot .t-master-fx.fx-affinity-shadow .t-master-fx-ring {border:0;box-shadow:none;}
#tacticalOpsRoot .t-master-fx.fx-tier-signature .t-master-fx-ring,#tacticalOpsRoot .t-master-fx.fx-tier-rank2 .t-master-fx-ring {width:66px;height:66px;box-shadow:none;}
#tacticalOpsRoot .t-master-fx-core {width:9px;height:9px;box-shadow:0 0 11px var(--fx-c);}
#tacticalOpsRoot .t-impact {width:30px;height:30px;border:0;border-radius:50%;background:radial-gradient(circle,rgba(246,250,255,.83),rgba(136,219,245,.33) 30%,transparent 72%);box-shadow:none;animation:.27s ease-out forwards t-fx-contact;}
#tacticalOpsRoot .t-impact-control {background:radial-gradient(circle,rgba(255,227,158,.82),rgba(234,166,68,.3) 32%,transparent 72%);box-shadow:none;animation:.3s ease-out forwards t-fx-contact;}
#tacticalOpsRoot .t-impact-heal,#tacticalOpsRoot .t-impact-buff {background:radial-gradient(circle,rgba(174,255,221,.72),rgba(86,211,176,.23) 34%,transparent 73%);box-shadow:none;animation:.34s ease-out forwards t-fx-contact;}
@keyframes t-fx-contact {0%{opacity:0;transform:translate(-50%,-50%) scale(.35);}30%{opacity:1;transform:translate(-50%,-50%) scale(1);}100%{opacity:0;transform:translate(-50%,-50%) scale(1.85);}}
@keyframes t-fx-soft-wave {0%{opacity:0;transform:scale(.35);}25%{opacity:.85;}100%{opacity:0;transform:scale(2.5);}}
@media(prefers-reduced-motion:reduce){#tacticalOpsRoot .t-sprite-fx.fx-area::before{animation:none;opacity:.3;transform:none;}#tacticalOpsRoot .t-impact{animation:none;opacity:.35;}}


/* Combat FX Identity P2 — purely decorative layers on already-confirmed atlases.
   Maintain red telegraph priority, tap freedom, and reduced-motion fallback. */
#tacticalOpsRoot .t-sprite-fx.fx-alpha {--t-fx-ink:rgba(116,223,252,.82);filter:drop-shadow(0 0 7px rgba(74,196,246,.25));}
#tacticalOpsRoot .t-sprite-fx.fx-cnc {--t-fx-ink:rgba(245,189,100,.82);filter:drop-shadow(0 0 7px rgba(239,178,86,.26));}
#tacticalOpsRoot .t-sprite-fx.fx-shadow {--t-fx-ink:rgba(114,246,212,.82);filter:drop-shadow(0 0 7px rgba(93,222,186,.26));}
#tacticalOpsRoot .t-sprite-fx.fx-pet {--t-fx-ink:rgba(181,208,255,.85);filter:drop-shadow(0 0 6px rgba(153,190,245,.24));}
#tacticalOpsRoot .t-sprite-fx.fx-objective {--t-fx-ink:rgba(135,233,255,.8);filter:drop-shadow(0 0 9px rgba(87,206,249,.24));}
#tacticalOpsRoot .t-sprite-fx.fx-hit::before {content:"";position:absolute;inset:27% 43%;z-index:1;pointer-events:none;border-radius:40%;background:linear-gradient(180deg,transparent 3%,var(--t-fx-ink) 48%,transparent 98%);transform:rotate(-42deg);animation:t-fx-identity-hit .30s ease-out both;}
#tacticalOpsRoot .t-sprite-fx.fx-rend::before {inset:18% 45%;transform:rotate(-35deg);animation-duration:.39s;}
#tacticalOpsRoot .t-sprite-fx.fx-rend::after {content:"";position:absolute;inset:25% 39%;z-index:1;pointer-events:none;background:linear-gradient(180deg,transparent,var(--t-fx-ink),transparent);transform:rotate(-51deg);animation:t-fx-identity-hit .43s .06s ease-out both;}
#tacticalOpsRoot .t-sprite-fx.fx-thrust::before {inset:42% 16%;height:12%;border-radius:0;transform:rotate(-10deg);animation-duration:.26s;}
#tacticalOpsRoot .t-sprite-fx.fx-lunge::before {inset:36% 16%;height:22%;border-radius:0;transform:rotate(-17deg);animation-duration:.38s;}
#tacticalOpsRoot .t-sprite-fx.fx-sweep::before {inset:34% 19%;border-radius:50%;background:linear-gradient(120deg,transparent 10%,var(--t-fx-ink) 48%,transparent 78%);transform:rotate(18deg);}
#tacticalOpsRoot .t-sprite-fx.fx-control::before,#tacticalOpsRoot .t-sprite-fx.fx-interrupt::before {content:"";position:absolute;inset:27%;z-index:1;pointer-events:none;border:2px dashed var(--t-fx-ink);border-radius:9px;box-shadow:inset 0 0 13px rgba(255,192,99,.11);animation:t-fx-identity-lock .55s ease-out both;}
#tacticalOpsRoot .t-sprite-fx.fx-interrupt::before {border-style:solid;clip-path:polygon(0 0,100% 0,100% 37%,70% 37%,70% 63%,100% 63%,100% 100%,0 100%);animation-duration:.70s;}
#tacticalOpsRoot .t-sprite-fx.fx-mend::before {content:"";position:absolute;inset:16% 33%;z-index:1;pointer-events:none;background:linear-gradient(90deg,transparent,rgba(121,255,211,.26),transparent);clip-path:polygon(40% 0,60% 0,60% 40%,100% 40%,100% 60%,60% 60%,60% 100%,40% 100%,40% 60%,0 60%,0 40%,40% 40%);animation:t-fx-identity-support .66s ease-out both;}
#tacticalOpsRoot .t-sprite-fx.fx-guard:not(.fx-area)::before {content:"";position:absolute;inset:20% 26%;z-index:1;pointer-events:none;border:2px solid var(--t-fx-ink);border-radius:42% 42% 58% 58%;box-shadow:inset 0 0 14px rgba(116,223,252,.15);animation:t-fx-identity-support .53s ease-out both;}
#tacticalOpsRoot .t-sprite-fx.fx-bite::before {clip-path:polygon(0 0,50% 28%,100% 0,67% 100%,30% 100%);transform:rotate(-25deg);}
#tacticalOpsRoot .t-sprite-fx.fx-hamstring::before {inset:37% 20%;transform:rotate(55deg);}
#tacticalOpsRoot .t-sprite-fx.fx-pathfinder::before {content:"";position:absolute;inset:39% 17%;z-index:1;pointer-events:none;background:linear-gradient(90deg,transparent,var(--t-fx-ink),transparent);clip-path:polygon(0 44%,72% 44%,72% 0,100% 50%,72% 100%,72% 56%,0 56%);animation:t-fx-identity-support .55s ease-out both;}
#tacticalOpsRoot .t-sprite-fx.fx-recover::before {content:"";position:absolute;inset:22%;z-index:1;pointer-events:none;border:2px solid var(--t-fx-ink);clip-path:polygon(25% 0,75% 0,100% 50%,75% 100%,25% 100%,0 50%);background:radial-gradient(circle,rgba(96,206,242,.17),transparent 62%);animation:t-fx-identity-support .68s ease-out both;}
#tacticalOpsRoot .t-sprite-fx.fx-howl::after {content:"";position:absolute;inset:43% 12%;z-index:1;pointer-events:none;background:linear-gradient(90deg,transparent,var(--t-fx-ink),transparent);clip-path:polygon(0 45%,22% 45%,30% 20%,40% 75%,52% 0,64% 80%,72% 44%,100% 44%,100% 55%,74% 55%,64% 100%,52% 28%,40% 100%,28% 45%,20% 55%,0 55%);animation:t-fx-identity-support .72s ease-out both;}
#tacticalOpsRoot .t-sprite-fx.fx-pack::after {content:"";position:absolute;inset:28%;z-index:1;pointer-events:none;border:1px solid var(--t-fx-ink);border-radius:16%;transform:rotate(45deg);animation:t-fx-identity-support .67s ease-out both;}
@keyframes t-fx-identity-hit {0%{opacity:0;scale:.3;}28%{opacity:.76;}100%{opacity:0;scale:1.5;}}
@keyframes t-fx-identity-lock {0%{opacity:0;scale:.6;}34%{opacity:.75;}100%{opacity:0;scale:1.3;}}
@keyframes t-fx-identity-support {0%{opacity:0;scale:.65;}35%{opacity:.55;}100%{opacity:0;scale:1.45;}}
@media(prefers-reduced-motion:reduce){
  #tacticalOpsRoot .t-sprite-fx.fx-hit::before,#tacticalOpsRoot .t-sprite-fx.fx-rend::after,
  #tacticalOpsRoot .t-sprite-fx.fx-control::before,#tacticalOpsRoot .t-sprite-fx.fx-interrupt::before,
  #tacticalOpsRoot .t-sprite-fx.fx-mend::before,#tacticalOpsRoot .t-sprite-fx.fx-guard::before,
  #tacticalOpsRoot .t-sprite-fx.fx-pathfinder::before,#tacticalOpsRoot .t-sprite-fx.fx-recover::before,
  #tacticalOpsRoot .t-sprite-fx.fx-howl::after,#tacticalOpsRoot .t-sprite-fx.fx-pack::after {animation:none!important;opacity:0!important;}
}

/* Combat contact P3 — confirmed damage only. Never changes tactical geometry. */
#tacticalOpsRoot .t-token.hit-reacting:not(.defeated) img.body {
  animation:t-contact-recoil .34s cubic-bezier(.16,.8,.24,1) both !important;
  transform-origin:50% 78%;
  filter:drop-shadow(0 8px 14px rgba(0,0,0,.65)) brightness(1.4) contrast(1.11);
}
#tacticalOpsRoot .t-token.hit-reacting.defeated {
  opacity:1;
  filter:brightness(.72) saturate(.65);
}
#tacticalOpsRoot .t-token.hit-reacting.defeated img.body {
  animation:t-contact-collapse .35s ease-in both !important;
  transform-origin:50% 82%;
}
@keyframes t-contact-recoil {
  0%{transform:translateX(0) scale(1);filter:brightness(1);}
  18%{transform:translateX(5px) rotate(3deg) scale(1.05);filter:brightness(1.8);}
  52%{transform:translateX(-3px) rotate(-2deg) scale(.97);filter:brightness(1.25);}
  100%{transform:translateX(0) rotate(0) scale(1);filter:brightness(1);}
}
@keyframes t-contact-collapse {
  0%{opacity:1;transform:translateY(0) rotate(0) scale(1);}
  60%{opacity:.9;transform:translateY(8px) rotate(8deg) scale(.96);}
  100%{opacity:.55;transform:translateY(15px) rotate(12deg) scale(.91);}
}
@media(prefers-reduced-motion:reduce) {
  #tacticalOpsRoot .t-token.hit-reacting img.body {animation:none!important;transform:none!important;}
  #tacticalOpsRoot .t-token.hit-reacting.defeated {opacity:.6;}
}

/* Event-confirmed choreography: one actor-to-target travel per accepted combat atlas. */
#tacticalOpsRoot .t-choreo-travel{position:absolute;inset:0;z-index:15;pointer-events:none;overflow:visible;--travel-ms:580ms;}
#tacticalOpsRoot .t-choreo-travel .t-choreo-actor{
  position:absolute;left:var(--from-x);top:var(--from-y);width:clamp(42px,12%,110px);height:auto;
  filter:drop-shadow(0 5px 10px #0009);transform:translate(-50%,-88%);
  animation:t-choreo-dash var(--travel-ms) ease-in-out both;
}
@keyframes t-choreo-dash{
  0%{left:var(--from-x);top:var(--from-y);opacity:0;scale:.92;}
  12%{opacity:.95;}
  37%{left:var(--to-x);top:var(--to-y);opacity:1;scale:1.08;}
  64%{left:var(--to-x);top:var(--to-y);opacity:.9;}
  100%{left:var(--from-x);top:var(--from-y);opacity:0;scale:1;}
}
#tacticalOpsRoot .t-choreo-line{position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none;}
#tacticalOpsRoot .t-choreo-line line{stroke:#f5bf79;stroke-width:1.5;stroke-linecap:round;vector-effect:non-scaling-stroke;stroke-dasharray:8 100;animation:t-choreo-shot var(--travel-ms) ease-out both;filter:drop-shadow(0 0 4px #eab865);}
@keyframes t-choreo-shot{0%{opacity:0;stroke-dashoffset:100;}15%{opacity:1;}46%{stroke-dashoffset:0;opacity:1;}100%{stroke-dashoffset:-20;opacity:0;}}
@media(prefers-reduced-motion:reduce){#tacticalOpsRoot .t-choreo-travel{display:none!important;}}

/* Choreography S4: one visible actor during confirmed travel. */
#tacticalOpsRoot .t-token.travel-ghost img.body {visibility:hidden;}
#tacticalOpsRoot .t-token.travel-ghost .t-ring {opacity:.5;}
#tacticalOpsRoot .t-choreo-travel.melee .t-choreo-actor {animation-timing-function:cubic-bezier(.22,.72,.21,1);}
#tacticalOpsRoot .t-choreo-travel.ranged .t-choreo-line line {stroke-width:2;stroke-dasharray:12 100;}
@media(prefers-reduced-motion:reduce){#tacticalOpsRoot .t-token.travel-ghost img.body {visibility:visible!important;}}

/* S6: only confirmed hostile actions, pointer transparent; red danger tiles stay above. */
#tacticalOpsRoot .t-hostile-scene{position:absolute;inset:0;z-index:15;pointer-events:none;overflow:visible;}
#tacticalOpsRoot .t-hostile-scene img{position:absolute;left:var(--enemy-x);top:var(--enemy-y);width:clamp(42px,12%,104px);height:auto;transform:translate(-50%,-88%);animation:t-hostile-dash var(--enemy-duration) ease-in-out both;filter:drop-shadow(0 0 8px #eb715599);}
#tacticalOpsRoot .t-hostile-heavy img{animation-name:t-hostile-heavy;}
@keyframes t-hostile-dash{0%{left:var(--enemy-x);top:var(--enemy-y);opacity:0;scale:.85;}15%{opacity:1;}42%{left:var(--enemy-target-x);top:var(--enemy-target-y);scale:1.06;}100%{left:var(--enemy-x);top:var(--enemy-y);opacity:0;}}
@keyframes t-hostile-heavy{0%{left:var(--enemy-x);top:var(--enemy-y);opacity:0;scale:.85;}25%{opacity:1;scale:1.05;}49%{left:var(--enemy-target-x);top:var(--enemy-target-y);scale:1.17;}100%{left:var(--enemy-x);top:var(--enemy-y);opacity:0;}}
#tacticalOpsRoot .t-hostile-scene svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible;}
#tacticalOpsRoot .t-hostile-scene line{stroke:#f7776c;stroke-width:2;vector-effect:non-scaling-stroke;stroke-dasharray:10 100;animation:t-hostile-beam var(--enemy-duration) ease-out both;filter:drop-shadow(0 0 4px #f4544b);}
#tacticalOpsRoot .t-hostile-jam line{stroke:#d5a0ff;stroke-dasharray:3 8;}
@keyframes t-hostile-beam{0%{stroke-dashoffset:100;opacity:0;}16%{opacity:1;}44%{stroke-dashoffset:0;}100%{stroke-dashoffset:-15;opacity:0;}}
@media(prefers-reduced-motion:reduce){#tacticalOpsRoot .t-hostile-scene{display:none!important;}}

/* S7 combat consequences: event-verified signals; never fabricated damage or rewards. */
#tacticalOpsRoot .t-consequence{position:absolute;z-index:15;pointer-events:none;transform:translate(-50%,-50%);font-size:clamp(9px,1.85vw,12px);font-weight:900;letter-spacing:.075em;white-space:nowrap;padding:5px 8px;border:1px solid rgba(212,231,242,.6);border-radius:5px;color:#effaff;background:linear-gradient(120deg,rgba(9,22,37,.94),rgba(24,46,62,.9));text-shadow:0 1px 4px #000;box-shadow:0 5px 20px #0009;animation:t-consequence-rise 1s ease-out both;}
#tacticalOpsRoot .t-consequence-finisher{color:#ffe7c2;border-color:rgba(244,182,113,.75);background:linear-gradient(110deg,rgba(58,29,20,.95),rgba(30,25,30,.93));}
#tacticalOpsRoot .t-consequence-counter{color:#aef8ef;border-color:rgba(101,237,221,.8);background:linear-gradient(110deg,rgba(8,42,47,.95),rgba(18,28,45,.93));}
#tacticalOpsRoot .t-consequence-guarded{color:#c9e5ff;border-color:rgba(124,193,248,.78);}
@keyframes t-consequence-rise{0%{opacity:0;translate:0 6px;scale:.86;}18%{opacity:1;scale:1.06;}65%{opacity:.98;}100%{opacity:0;translate:0 -24px;scale:.98;}}
@media(prefers-reduced-motion:reduce){#tacticalOpsRoot .t-consequence{animation:none;opacity:1;}}

/* Threat Telegraph V2 — low-occlusion Blackglass projection, scoped to announced VNext intents.
   Drawn beneath characters and tap targets; no gameplay or hit-area changes. */
#tacticalOpsRoot .t-battle .t-threat-tile-v2 {
  z-index:16;
  width:var(--cell-touch-w);
  height:var(--cell-touch-h);
  aspect-ratio:auto;
  border:1px solid rgba(255,154,146,.46);
  border-radius:5px;
  background:radial-gradient(ellipse at center,rgba(220,57,73,.075),rgba(245,72,79,.015) 68%,transparent);
  box-shadow:inset 0 0 0 1px rgba(255,128,132,.065),0 0 9px rgba(224,70,75,.13);
  pointer-events:none;
  animation:none;
}
#tacticalOpsRoot .t-threat-tile-v2 .t-threat-corner {
  position:absolute; width:8px; height:8px;
  border-color:#ffb4aa; border-style:solid;
  filter:drop-shadow(0 0 3px rgba(255,99,99,.35));
}
#tacticalOpsRoot .t-threat-tile-v2 .t-threat-corner.tl {top:-1px;left:-1px;border-width:2px 0 0 2px}
#tacticalOpsRoot .t-threat-tile-v2 .t-threat-corner.tr {top:-1px;right:-1px;border-width:2px 2px 0 0}
#tacticalOpsRoot .t-threat-tile-v2 .t-threat-corner.bl {bottom:-1px;left:-1px;border-width:0 0 2px 2px}
#tacticalOpsRoot .t-threat-tile-v2 .t-threat-corner.br {bottom:-1px;right:-1px;border-width:0 2px 2px 0}
#tacticalOpsRoot .t-threat-tile-v2 > span {
  position:absolute; top:-7px;right:-7px;min-width:15px;height:15px;
  display:grid;place-items:center;padding:0 3px;
  color:#fff1e6;background:#642b34;border:1px solid #ffa3a0;
  border-radius:4px;font:800 10px/1 var(--t-font-sans);
  box-shadow:0 1px 5px #0009;
}
#tacticalOpsRoot .t-threat-tethers {
  position:absolute;inset:0;width:100%;height:100%;z-index:15;
  overflow:visible;pointer-events:none;
}
#tacticalOpsRoot .t-threat-tether-halo {
  fill:none;stroke:rgba(255,91,102,.16);stroke-width:.65;
  vector-effect:non-scaling-stroke;
}
#tacticalOpsRoot .t-threat-tether-core {
  fill:none;stroke:rgba(255,172,157,.67);stroke-width:1;
  vector-effect:non-scaling-stroke;stroke-dasharray:3 5;
}
#tacticalOpsRoot .t-threat-tether-end {fill:#ffc0a6;opacity:.68}
@media(prefers-reduced-motion:no-preference) {
  #tacticalOpsRoot .t-threat-tile-v2 {animation:t-threat-v2-breathe 2.4s ease-in-out infinite}
  #tacticalOpsRoot .t-threat-tether-core {animation:t-threat-v2-trace 4s linear infinite}
  @keyframes t-threat-v2-breathe {50%{border-color:rgba(255,183,161,.8);box-shadow:0 0 11px rgba(229,68,78,.21)}}
  @keyframes t-threat-v2-trace {to{stroke-dashoffset:-32}}
}
@media(prefers-reduced-motion:reduce) {
  #tacticalOpsRoot .t-threat-tile-v2,
  #tacticalOpsRoot .t-threat-tether-core {animation:none!important}
}

/* Target acquisition — quiet optics, authored for the dark battlefield.
   Separate visual reticle from the 44px interactive hit region. */
#tacticalOpsRoot .t-battle .t-target-reticle {
  left:50%;bottom:7%;width:94%;aspect-ratio:1.08;
  transform:translateX(-50%);opacity:.86;
  animation:t-premium-target-breathe 2.2s ease-in-out infinite alternate;
  filter:none;
}
#tacticalOpsRoot .t-battle .t-target-reticle i {
  width:10px;height:10px;
  border-color:#70c9df;filter:none;opacity:.85;
}
#tacticalOpsRoot .t-battle .t-target-reticle.ally i {border-color:#86e6d5}
#tacticalOpsRoot .t-battle.effect-control .t-target-reticle i {border-color:#e2bd79;filter:none}
#tacticalOpsRoot .t-battle .t-target-reticle i:nth-child(1) {border-width:1.5px 0 0 1.5px}
#tacticalOpsRoot .t-battle .t-target-reticle i:nth-child(2) {border-width:1.5px 1.5px 0 0}
#tacticalOpsRoot .t-battle .t-target-reticle i:nth-child(3) {border-width:0 0 1.5px 1.5px}
#tacticalOpsRoot .t-battle .t-target-reticle i:nth-child(4) {border-width:0 1.5px 1.5px 0}
@keyframes t-premium-target-breathe {
  from {transform:translateX(-50%) scale(.98);opacity:.65}
  to {transform:translateX(-50%) scale(1.015);opacity:.94}
}
@media(prefers-reduced-motion:reduce) {
  #tacticalOpsRoot .t-battle .t-target-reticle {animation:none!important;opacity:1}
}

.t-lockdown-plan-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.t-lockdown-plan-grid button{min-width:0;display:flex;flex-direction:column;gap:6px;text-align:left;color:inherit;background:#091723;border:1px solid #415565;border-radius:10px;padding:12px;font:inherit;white-space:normal;overflow-wrap:anywhere}.t-lockdown-plan-grid button[aria-pressed="true"]{border-color:#e9b665;background:#23221c}.t-lockdown-plan-grid button:disabled{opacity:.8}.t-lockdown-plan-grid span{font-size:12px;line-height:1.45}.t-lockdown-plans small{display:block;margin-top:8px}@media(max-width:430px){.t-lockdown-plan-grid{grid-template-columns:1fr}}

/* V1 player experience. All board paint stays inside the existing input geometry. */
#tacticalOpsRoot .t-command-deck-v3 .t-command-progress {
  display:grid;gap:7px;margin:0 0 10px;padding:11px 12px;
  background:#0a1d29;border-inline-start:2px solid #78d2e5;color:#eff9fc;
}
#tacticalOpsRoot .t-command-progress-line {
  display:flex;flex-wrap:wrap;justify-content:space-between;gap:3px 10px;
  font-size:clamp(12px,3.4vw,15px);font-weight:800;letter-spacing:.04em;
}
#tacticalOpsRoot .t-command-progress-line span {color:#a6e4f1}
#tacticalOpsRoot .t-command-progress .t-progress {width:100%;height:6px;margin:0}
#tacticalOpsRoot .t-command-progress small {font-size:12px;color:#c4d9e2}
#tacticalOpsRoot .t-command-deck-v3 .t-purpose-alternatives > summary {
  min-height:44px;padding:12px;color:#c4d9e2;cursor:pointer;
}
#tacticalOpsRoot .t-deployment.t-premium-ux .t-deploy-hero-v29.t-command-brief-hero {
  min-height:108px;padding-top:max(38px,var(--ah-chrome-top,0px));
}
#tacticalOpsRoot .t-deployment.t-premium-ux .t-command-nav.t-deploy-command-nav {margin-block:5px 8px}
#tacticalOpsRoot .t-deployment.t-premium-ux .t-deploy-command-pane .t-deploy-overview {
  display:block;padding:0;border:0;background:none;box-shadow:none;
}
#tacticalOpsRoot .t-deployment.t-premium-ux .t-deploy-summary-main {
  padding:10px 14px;background:#081924ee;box-shadow:none;
}
#tacticalOpsRoot .t-deployment.t-premium-ux .t-deploy-summary-main > .t-kicker {letter-spacing:.1em}
#tacticalOpsRoot .t-deployment.t-premium-ux .t-deploy-command-pane .t-brief-details {
  margin-top:10px;padding-inline:12px;border:0;border-top:1px solid #3a5967;border-radius:0;background:#081924d9;
}
#tacticalOpsRoot .t-deployment.t-premium-ux .t-deploy-command-pane .t-brief-details summary {
  min-height:44px;padding-inline:0;
}
#tacticalOpsRoot .t-deployment.t-premium-ux .t-command-action-dock .t-btn-ghost {
  white-space:nowrap;letter-spacing:.08em;padding-inline:6px;
}
@media (max-width:600px) {
  #tacticalOpsRoot .t-command-deck-v3 .t-wt-hero.t-wt-hero-compact {
    padding-top:max(12px,var(--ah-chrome-top,0px),env(safe-area-inset-top,0px));
  }
  #tacticalOpsRoot .t-command-deck-v3 .t-wt-next-op .t-wt-feature-art {height:86px}
}

#tacticalOpsRoot .t-battle[data-projection] .t-token:not(.defeated) img.body {
  scale:1.1;transform-origin:50% 100%;
  filter:drop-shadow(0 2px 2px #020811) drop-shadow(0 0 2px #c3e6f088);
}
#tacticalOpsRoot .t-battle[data-projection] .t-token.ally.active .t-ring {
  color:#b5f5ff;filter:drop-shadow(0 0 4px #6be4ffcf);
}
#tacticalOpsRoot .t-battle[data-projection] .t-token.active .t-ring ellipse:first-child {stroke-width:2.8}
#tacticalOpsRoot .t-battle .t-token .t-hp-bar {
  min-height:4px;background:#081018;box-shadow:0 0 0 1px #8195a08a;
}
#tacticalOpsRoot .t-battle .t-token .t-hp-num {color:#f4fbff}
#tacticalOpsRoot .t-battle .t-token .t-chip {background:#0b1c28;border-color:#8ab3c3;color:#e0f6ff}
#tacticalOpsRoot .t-battle .t-token .t-chip.debuff {border-color:#e58e87;color:#ffd0c8}
#tacticalOpsRoot .t-battle .t-status-effect {color:#d8f5ef;background:#143532;white-space:nowrap}
#tacticalOpsRoot .t-battle .t-status-effect.debuff {color:#ffd0c8;background:#412127}
#tacticalOpsRoot .t-battle .t-status.is-expanded .t-status-effect {display:none}
#tacticalOpsRoot .t-battle[data-projection] .t-field .t-grid i {opacity:.32}
#tacticalOpsRoot .t-battle[data-projection] .t-cell.move::after {
  width:10px;height:10px;border:1px solid #a8f0fb;border-radius:50%;
  transform:translate(-50%,-50%);background:#4cc9de55;box-shadow:0 0 0 2px #07212a;
}
#tacticalOpsRoot .t-battle[data-projection] .t-cell.move[data-threatened="true"]::after {
  border-color:#ffd6aa;background:#341d22;box-shadow:0 0 0 2px #291017;
}
#tacticalOpsRoot .t-battle[data-projection] .t-cell.move:is(:hover,:focus-visible)::after {
  width:13px;height:13px;background:#7bdeed;
}
#tacticalOpsRoot .t-battle[data-projection] .t-cell.move[data-threatened="true"]:is(:hover,:focus-visible)::after {
  background:#ffd6aa;
}
#tacticalOpsRoot .t-battle[data-projection] .t-target-reticle.enemy i {border-color:#ffd292}
#tacticalOpsRoot .t-battle[data-projection] .t-command-cue {
  width:fit-content;max-width:calc(100% - 20px);padding:4px 8px;
  background:#071622ef;border-radius:0 3px 3px 0;
}
#tacticalOpsRoot .t-battle[data-projection] .t-dock .t-act {min-width:44px}
#tacticalOpsRoot .t-battle[data-projection] .t-dock .t-act:not(:disabled) .name {color:#f2fbff}
#tacticalOpsRoot .t-battle[data-projection] .t-dock .t-act .meta[data-action-state="NO TARGET"] {color:#b4c8d1}
#tacticalOpsRoot .t-battle[data-projection] .t-move-trace line {stroke:#90eaff;stroke-width:2.5}
#tacticalOpsRoot .t-battle[data-projection] .t-float {text-shadow:0 1px 2px #000,0 0 6px #000,0 0 3px #000}
#tacticalOpsRoot .t-results .t-campaign-result-impact {
  display:grid;gap:6px;margin:12px 0 16px;padding:12px 14px;
  border-inline-start:3px solid #98d4de;background:#102b38;
}
#tacticalOpsRoot .t-results .t-campaign-result-impact p {margin:0;color:#d4e8ed}

.t-field-contract {
  display: grid;
  gap: .3rem;
  padding: .65rem .8rem;
  border-inline-start: 2px solid var(--t-accent, #e1aa59);
  overflow-wrap: anywhere;
}
.t-field-contract p, .t-fr-next p { margin: 0; }
.t-field-contract-honor { color: var(--t-accent, #e1aa59); }

/* Field reward, A2 comparison and the next Command order. */
#tacticalOpsRoot .t-field-results .t-fr-reach-reward {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  border: 1px solid #ac8752;
  border-radius: 8px;
  background: #0c1219;
}
#tacticalOpsRoot .t-fr-reward-portrait {
  position: absolute;
  z-index: -2;
  inset: 0 0 auto;
  width: 100%;
  height: 232px;
  object-fit: cover;
  object-position: center 64%;
  opacity: .88;
}
#tacticalOpsRoot .t-fr-reach-reward::before {
  position: absolute;
  z-index: -1;
  inset: 0;
  content: "";
  background: linear-gradient(180deg, #10151d80 0%, #15161a12 33%, #0a1019ed 61%, #0a1019 78%);
}
#tacticalOpsRoot .t-fr-reward-copy {
  display: grid;
  justify-items: center;
  padding: 14px clamp(10px, 4vw, 22px);
  text-align: center;
}
#tacticalOpsRoot .t-fr-reward-copy > .t-kicker {
  justify-self: start;
  padding: 5px 7px;
  background: #0a1019db;
  color: #e9dabf;
}
#tacticalOpsRoot .t-fr-reward-copy > .t-fr-reward-icon {
  width: 46px;
  height: 46px;
  object-fit: contain;
  justify-self: end;
  margin-top: clamp(28px, 10vh, 84px);
  margin-inline-end: 4px;
  filter: drop-shadow(0 0 10px #e6b65e80);
}
#tacticalOpsRoot .t-fr-reward-copy h2 {
  margin: 4px 0;
  font: 850 clamp(29px, 8.4vw, 52px)/1 var(--t-font-display);
  letter-spacing: .07em;
  text-transform: uppercase;
  color: #ffe0a2;
  text-shadow: 0 2px 16px #0a1019;
}
#tacticalOpsRoot .t-fr-reward-copy > strong {
  color: #a4eafb;
  font-size: 11px;
  letter-spacing: .23em;
  text-transform: uppercase;
}
#tacticalOpsRoot .t-field-results .t-fr-reward-copy .t-fr-reward-stats {
  margin-top: 10px;
  padding-block: 5px;
  border-block: 1px solid #a5814980;
  color: #f4e5c7;
}
#tacticalOpsRoot .t-field-results .t-fr-reward-copy .t-result-actions { width: 100%; padding-bottom: 8px; }
#tacticalOpsRoot .t-field-results .t-fr-reward-copy .t-result-actions .t-btn-primary {
  border-color: #ffe0a2;
  color: #20190d;
  background: linear-gradient(160deg, #ffe2a4, #d2a75d);
  font-weight: 850;
}
#tacticalOpsRoot .t-fr-reward-copy > small { font-size: 10px; color: #afc2cc; }
#tacticalOpsRoot .t-field-results .t-fr-major-unlock {
  margin-block: 8px;
  color: #ffe0a2;
  font: 800 16px/1.25 var(--t-font-display);
}
@media (prefers-reduced-motion: no-preference) {
  #tacticalOpsRoot .t-fr-reward-copy h2 { animation: t-reach-title-in 280ms ease-out; }
}
@keyframes t-reach-title-in {
  from { opacity: .72; transform: translateY(3px); }
  to { opacity: 1; transform: translateY(0); }
}

#tacticalOpsRoot .t-field-rend .t-loadout-choices button {
  position: relative;
  padding: 9px;
  border-color: #765e38;
  background: radial-gradient(ellipse at 20% 0, #3a3024, #111b25 75%);
  text-align: start;
}
#tacticalOpsRoot .t-field-rend .t-loadout-choices button[aria-pressed="true"] {
  border-color: #92e7ff;
  background: radial-gradient(ellipse at 20% 0, #183f50, #101f2b 75%);
}
#tacticalOpsRoot .t-field-rend .t-loadout-choices button:disabled { opacity: 1; cursor: default; }
#tacticalOpsRoot .t-field-rend .t-loadout-choices button:disabled[aria-pressed="false"] { border-color: #586875; background: #15202b; }
#tacticalOpsRoot .t-field-rend .t-loadout-choices button img {
  display: block;
  width: 30px;
  height: 30px;
  object-fit: contain;
  margin-bottom: 4px;
}
#tacticalOpsRoot .t-field-rend .t-loadout-choices strong { font: 800 13px/1.2 var(--t-font-display); }
#tacticalOpsRoot .t-field-rend .t-field-rend-bleed { color: #a4eafb; }
#tacticalOpsRoot .t-field-rend button:enabled[aria-pressed="false"] .t-field-rend-state { color: #ffe0a2; }
#tacticalOpsRoot .t-field-rend button:focus-visible { outline: 2px solid #e1faff; outline-offset: -3px; }

#tacticalOpsRoot .t-command-order .t-command-order-value {
  margin-top: 9px;
  padding-inline-start: 9px;
  border-inline-start: 2px solid #bd985f;
}
#tacticalOpsRoot .t-command-order .t-command-order-value strong {
  color: #ffe0a2;
  font-size: 10px;
  letter-spacing: .08em;
}
#tacticalOpsRoot .t-command-order .t-command-order-value p {
  margin: 3px 0 0;
  color: #c4d8e1;
  font-size: 12px;
  line-height: 1.35;
}

/* Tactical Player Identity V2: shared, pointer-transparent cosmetic composition. */
#tacticalOpsRoot .t-cosmetic-portrait {
  display:block;position:relative;flex:0 0 auto;isolation:isolate;width:52px;height:56px;min-width:0;
  pointer-events:none;overflow:visible;border:1px solid #548aa04d;border-radius:6px;background:#0b1720;
  --t-frame-scale:1.34;--t-frame-x:0px;--t-frame-y:3px;
}
#tacticalOpsRoot .t-cosmetic-viewport {position:absolute;inset:5% 8% 7%;overflow:hidden;border-radius:5px;z-index:1;}
#tacticalOpsRoot .t-cosmetic-skin {
  display:block;width:100%;height:100%;border:0;border-radius:0;object-fit:contain;object-position:center bottom;
  transform-origin:center bottom;transform:translate(var(--t-skin-x),var(--t-skin-y)) scale(var(--t-skin-scale));
}
#tacticalOpsRoot .t-cosmetic-frame {
  display:block;position:absolute;z-index:3;inset:-4px;width:calc(100% + 8px);height:calc(100% + 8px);
  border:0;border-radius:0;object-fit:contain;pointer-events:none;
  transform:translate(var(--t-frame-x),var(--t-frame-y)) scale(var(--t-frame-scale));transform-origin:center;
}
#tacticalOpsRoot .t-cosmetic-portrait[data-frame-key="dual_supporter_frame"] .t-cosmetic-frame {
  transform:translate(var(--t-frame-x),var(--t-frame-y)) scale(var(--t-frame-scale)) scale(.94) scaleY(.96);
}
#tacticalOpsRoot .t-cosmetic-portrait[data-frame-key="server_signal_frame"] .t-cosmetic-frame {
  transform:translate(var(--t-frame-x),var(--t-frame-y)) scale(var(--t-frame-scale)) translateY(1px) scale(.975) scaleY(.945);
}
#tacticalOpsRoot .t-cosmetic-glow {z-index:4;opacity:.16;}
#tacticalOpsRoot .t-cosmetic-sweep {z-index:5;opacity:0;}
@media (prefers-reduced-motion:no-preference) {
  html:not(.ah-perf-lite) #tacticalOpsRoot .t-cosmetic-portrait[data-frame-key="pioneer_frame"] .t-cosmetic-glow,
  html:not(.ah-perf-lite) #tacticalOpsRoot .t-cosmetic-portrait[data-frame-key="signal_rank_plate"] .t-cosmetic-glow {animation:t-identity-glow 3.2s ease-in-out infinite;}
  html:not(.ah-perf-lite) #tacticalOpsRoot .t-cosmetic-portrait[data-frame-key="pioneer_frame"] .t-cosmetic-sweep,
  html:not(.ah-perf-lite) #tacticalOpsRoot .t-cosmetic-portrait[data-frame-key="signal_rank_plate"] .t-cosmetic-sweep {animation:t-identity-sweep 5.6s linear infinite;}
}
@keyframes t-identity-glow {0%,100%{opacity:.14}50%{opacity:.25}}
@keyframes t-identity-sweep {0%,14%,30%,100%{opacity:0}21%{opacity:.11}}
html.ah-perf-lite #tacticalOpsRoot .t-cosmetic-glow,
body.ah-perf-lite #tacticalOpsRoot .t-cosmetic-glow {opacity:.12;animation:none;}
html.ah-perf-lite #tacticalOpsRoot .t-cosmetic-sweep,
body.ah-perf-lite #tacticalOpsRoot .t-cosmetic-sweep {opacity:0;animation:none;}
#tacticalOpsRoot .t-id-card {
  display:grid;grid-template-columns:52px minmax(0,1fr);align-items:center;gap:.65rem;
  min-width:0;margin:.55rem 0;padding:.5rem .6rem;border:1px solid #69c9eb26;border-radius:7px;background:#08141de6;
}
#tacticalOpsRoot .t-id-card .t-id-copy {min-width:0;}
#tacticalOpsRoot .t-id-card strong,#tacticalOpsRoot .t-id-card small {display:block;overflow-wrap:anywhere;}
#tacticalOpsRoot .t-id-card strong {color:#e6f8ff;font-size:.78rem;}
#tacticalOpsRoot .t-id-card small {color:#a7c0cd;font-size:.64rem;line-height:1.45;}
#tacticalOpsRoot .t-squad-preview .t-cosmetic-portrait {width:68px;height:58px;}
#tacticalOpsRoot .t-squad-preview .t-cosmetic-portrait img,
#tacticalOpsRoot .t-loadout-portrait .t-cosmetic-portrait img {max-width:none;border:0;border-radius:0;object-fit:contain;object-position:center bottom;}
#tacticalOpsRoot .t-loadout-portrait .t-cosmetic-portrait {width:36px;height:36px;}
#tacticalOpsRoot .t-status .t-cosmetic-portrait {width:38px;height:38px;}
#tacticalOpsRoot .t-status .t-cosmetic-portrait img {border:0;object-fit:contain;}
#tacticalOpsRoot .t-status .t-cosmetic-portrait .t-cosmetic-frame {width:calc(100% + 8px);height:calc(100% + 8px);}
#tacticalOpsRoot .t-results .t-id-card .t-cosmetic-portrait {width:52px;height:56px;}
#tacticalOpsRoot .t-fr-reward-commander {
  position:absolute;z-index:-2;inset:0 0 auto;height:232px;display:flex;align-items:center;justify-content:center;
  pointer-events:none;background:radial-gradient(ellipse at 50% 36%,#35607730,transparent 74%);
}
#tacticalOpsRoot .t-fr-reward-commander .t-cosmetic-portrait {width:min(42%,156px);height:184px;border:0;background:transparent;}
@media(max-width:360px) {
  #tacticalOpsRoot .t-squad-preview {gap:.4rem;}
  #tacticalOpsRoot .t-squad-preview .t-cosmetic-portrait {width:60px;height:52px;}
}

/* Tactical Power V1: receipt-independent, server-frozen run stats. No new HUD row. */
#tacticalOpsRoot .t-run-power {
  margin:.65rem 0 .25rem;padding:.7rem .75rem;
  border:1px solid #68c6e65b;border-radius:7px;
  background:linear-gradient(145deg,#102c3bea,#091923ed);
  box-shadow:inset 0 1px #dcf7ff10;
}
#tacticalOpsRoot .t-run-power-head {
  display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;
  gap:.25rem .65rem;color:#e6f9ff;
  font-family:var(--t-font-display);font-size:.68rem;letter-spacing:.09em;
}
#tacticalOpsRoot .t-run-power-head > span {
  color:#91dbe9;font-size:.57rem;white-space:nowrap;
}
#tacticalOpsRoot .t-run-power > p {
  color:#adceda;font-size:.66rem;line-height:1.4;margin:.4rem 0 .6rem;
}
#tacticalOpsRoot .t-run-power-unit + .t-run-power-unit {margin-top:.55rem;}
#tacticalOpsRoot .t-run-power-unit > strong {
  display:block;color:#d7f4fb;font-size:.63rem;letter-spacing:.08em;margin-bottom:.32rem;
}
#tacticalOpsRoot .t-run-power-unit dl {
  display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:5px;margin:0;
}
#tacticalOpsRoot .t-run-power-unit dl > div {
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  min-width:0;min-height:45px;padding:.3rem .18rem;
  border:1px solid #4fabc73b;border-radius:4px;background:#061822b9;
}
#tacticalOpsRoot .t-run-power-unit dt {
  color:#94b9c8;font-size:.55rem;letter-spacing:.08em;
}
#tacticalOpsRoot .t-run-power-unit dd {
  margin:.1rem 0 0;color:#eafaff;font-size:.91rem;font-weight:700;
  font-variant-numeric:tabular-nums;
}
#tacticalOpsRoot .t-battle-hud-rail .t-run-power-chip {
  color:#8ae1ee;border:1px solid #64bcd15e;border-radius:3px;
  padding:0 3px;font:700 8px/12px var(--t-font-display);
  letter-spacing:.04em;white-space:nowrap;flex-shrink:0;
}
@media(max-width:360px) {
  #tacticalOpsRoot .t-run-power {padding:.6rem .55rem;}
  #tacticalOpsRoot .t-run-power-unit dl {gap:4px;}
}

/* Signal Atlas V2: presentation-only skin for canonical Player Growth. */
#tacticalOpsRoot .tsa-root { --tsa-bg:#06121e; --tsa-line:#4c8ca4; --tsa-cyan:#8bdcf0; --tsa-amber:#eac080; color:#d7edf7; background:radial-gradient(ellipse at 50% 30%,rgba(32,94,117,.36),transparent 61%),linear-gradient(155deg,#091e2d,#050d18 75%); border:1px solid rgba(91,175,207,.48); border-radius:12px; padding:0 0 max(22px,env(safe-area-inset-bottom)); overflow:hidden; min-width:0; position:relative; box-shadow:inset 0 1px rgba(159,236,255,.1),0 17px 36px rgba(0,0,0,.38); }
#tacticalOpsRoot .tsa-root button { cursor:pointer; font-family:inherit; color:inherit; touch-action:manipulation; }
#tacticalOpsRoot .tsa-root button:disabled { cursor:not-allowed; opacity:.52; }
#tacticalOpsRoot .tsa-root button:focus-visible { outline:3px solid #ecfaff; outline-offset:3px; z-index:9; }
#tacticalOpsRoot .tsa-header { display:flex; justify-content:space-between; gap:8px; align-items:center; padding:16px clamp(10px,2.5vw,20px); background:linear-gradient(105deg,rgba(5,13,25,.98),rgba(14,44,59,.91)); border-bottom:1px solid rgba(99,205,234,.38); }
#tacticalOpsRoot .tsa-header h2 { margin:3px 0; color:#f3fbff; font-size:clamp(19px,4.7vw,29px); line-height:1.08; font-weight:900; letter-spacing:.055em; }
#tacticalOpsRoot .tsa-eyebrow { font-size:10px; font-weight:800; letter-spacing:.12em; color:#85d6e9; display:block; }
#tacticalOpsRoot .tsa-subtitle { color:#9db7c7; font-size:10px; letter-spacing:.045em; }
#tacticalOpsRoot .tsa-points { flex:0 0 80px; border:1px solid #64aeca; border-radius:7px; display:grid; align-items:center; justify-items:center; padding:5px; background:rgba(10,57,73,.55); }
#tacticalOpsRoot .tsa-points strong { font-size:29px; color:#adf0ff; line-height:1.05; font-variant-numeric:tabular-nums; }
#tacticalOpsRoot .tsa-points small { font-size:8px; color:#daedf6; font-weight:800; line-height:1.3; letter-spacing:.08em; text-align:center; }
#tacticalOpsRoot .tsa-hero-tabs { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:6px; padding:9px; background:#06121ded; }
#tacticalOpsRoot .tsa-hero-tabs button { min-width:0; min-height:63px; display:flex; align-items:center; text-align:left; gap:6px; padding:5px; background:linear-gradient(135deg,#0b2434,#071421); border:1px solid rgba(92,144,169,.38); border-radius:7px; }
#tacticalOpsRoot .tsa-hero-tabs button.is-active { border-color:#85deed; box-shadow:inset 0 0 0 1px rgba(87,215,246,.22),0 0 12px rgba(28,144,198,.17); background:#103a4c; }
#tacticalOpsRoot .tsa-hero-tabs img { width:40px; height:45px; object-fit:cover; object-position:center 20%; border-radius:5px; flex:none; background:#0b2a39; }
#tacticalOpsRoot .tsa-hero-tabs span { min-width:0; }
#tacticalOpsRoot .tsa-hero-tabs b { display:block; font-size:11px; color:#f5fbff; }
#tacticalOpsRoot .tsa-hero-tabs small { display:block; font-size:8px; color:#9dc4d3; line-height:1.3; margin-top:3px; }
#tacticalOpsRoot .tsa-nav { display:grid; grid-template-columns:1fr 1fr auto; gap:5px; padding:0 9px 9px; background:#06121ded; }
#tacticalOpsRoot .tsa-nav button { min-width:0; min-height:44px; border-radius:5px; border:1px solid #33596b; background:#0b2432; color:#accbd9; font-size:10px; font-weight:850; letter-spacing:.045em; padding:6px; }
#tacticalOpsRoot .tsa-nav button.is-current { color:#edfbff; border-color:#6acbe2; background:#174b60; }
#tacticalOpsRoot .tsa-overview { padding:8px clamp(8px,2vw,16px) 13px; }
#tacticalOpsRoot .tsa-atlas-title { padding:9px 4px; display:grid; gap:3px; }
#tacticalOpsRoot .tsa-atlas-title span { color:#88d7ea; font-size:9px; font-weight:800; letter-spacing:.11em; }
#tacticalOpsRoot .tsa-atlas-title strong { font-size:19px; color:#effaff; letter-spacing:.09em; }
#tacticalOpsRoot .tsa-atlas-title small { color:#a2bfcf; font-size:11px; }
#tacticalOpsRoot .tsa-atlas-map { height:clamp(300px,86vw,460px); max-width:570px; margin:auto; position:relative; overflow:hidden; border:1px solid rgba(104,190,218,.33); border-radius:10px; isolation:isolate; background:radial-gradient(circle at center,rgba(40,112,147,.28) 0 18%,transparent 55%),repeating-radial-gradient(circle at center,transparent 0 32px,rgba(66,124,149,.09) 33px 34px),linear-gradient(135deg,#071320,#0c2635 52%,#050f1a); }
#tacticalOpsRoot .tsa-atlas-map::before {content:"";position:absolute;inset:0;opacity:.21;pointer-events:none;background:linear-gradient(45deg,transparent 49.8%,#6597aa 50%,transparent 50.2%),linear-gradient(-45deg,transparent 49.8%,#6597aa 50%,transparent 50.2%); }
#tacticalOpsRoot .tsa-links { position:absolute;inset:0;width:100%;height:100%;pointer-events:none;filter:drop-shadow(0 0 3px rgba(49,188,227,.18)); }
#tacticalOpsRoot .tsa-core { display:flex; flex-direction:column; align-items:center; justify-content:center; position:absolute;left:50%;top:50%;transform:translate(-50%,-50%); width:clamp(94px,29vw,142px);aspect-ratio:1;border:3px solid #93eafa;border-radius:50%;background:radial-gradient(circle,#245e73,#0a2133 70%);box-shadow:inset 0 0 24px #337b9c6d,0 0 20px #3cbed34d;text-align:center; }
#tacticalOpsRoot .tsa-core img { height:43%; width:55%; object-fit:contain; }
#tacticalOpsRoot .tsa-core b { font-size:clamp(13px,3.7vw,20px);letter-spacing:.07em;color:#fff; }
#tacticalOpsRoot .tsa-core small { font-size:8px;letter-spacing:.05em;color:#b8e3ee; }
#tacticalOpsRoot .tsa-sector { display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;position:absolute;transform:translate(-50%,-50%);width:clamp(82px,26%,135px);min-height:80px;background:linear-gradient(145deg,#15445b,#071e31);border:2px solid #68bed7;border-radius:14px;text-align:center;box-shadow:0 0 13px #3cb9d34a;padding:6px; }
#tacticalOpsRoot .tsa-sector.tsa-tone-amber { border-color:#dcb678; }
#tacticalOpsRoot .tsa-sector.tsa-tone-cyan { border-color:#69bfe2; }
#tacticalOpsRoot .tsa-sector .tsa-sector-glyph { font-size:22px;color:#e8ca94;line-height:1; }
#tacticalOpsRoot .tsa-sector.tsa-tone-cyan .tsa-sector-glyph { color:#95e2f2; }
#tacticalOpsRoot .tsa-sector b { font-size:12px;color:#effbff;letter-spacing:.06em; }
#tacticalOpsRoot .tsa-sector small { font-size:9px;color:#c2d5dd;line-height:1.2; }
#tacticalOpsRoot .tsa-sector em { font-style:normal;color:#80d7e8;font-weight:900;font-size:9px; }
#tacticalOpsRoot .tsa-reserve { width:46px;height:46px;border:1px dashed #5b6d78;background:rgba(14,31,40,.9);border-radius:50%;position:absolute;transform:translate(-50%,-50%);display:grid;place-items:center;font-size:25px;color:#76909c;opacity:.75;pointer-events:none; }
#tacticalOpsRoot .tsa-atlas-footer { display:flex; flex-wrap:wrap;justify-content:center;gap:12px;padding:9px;font-size:9px;letter-spacing:.04em;color:#a8c4d1; }
#tacticalOpsRoot .tsa-atlas-footer b { color:#6de8df; }
#tacticalOpsRoot .tsa-future-toggle {display:block;width:100%;min-height:44px;border:1px solid rgba(96,147,173,.35);background:#0b2331;color:#bfdae5;font-size:11px;letter-spacing:.05em;border-radius:7px; }
#tacticalOpsRoot .tsa-explain { color:#a3c0cc;font-size:12px;line-height:1.5; }
#tacticalOpsRoot .tsa-focus { padding:8px clamp(9px,2.5vw,18px) 20px; }
#tacticalOpsRoot .tsa-focus-heading { display:flex;justify-content:space-between;gap:8px;align-items:center;padding:12px 2px; }
#tacticalOpsRoot .tsa-focus-heading h3 { margin:4px 0;color:#f1faff;font-size:21px; }
#tacticalOpsRoot .tsa-focus-heading small {font-size:11px;color:#a6c7d5;}
#tacticalOpsRoot .tsa-focus-heading button { min-height:44px;background:#102c3c;border:1px solid #457489;border-radius:7px;white-space:nowrap;padding:7px;font-size:10px; }
#tacticalOpsRoot .tsa-disciplines {display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;}
#tacticalOpsRoot .tsa-disciplines button { display:grid;grid-template-columns:38px 1fr;grid-template-rows:auto auto;align-items:center;column-gap:8px;text-align:left;min-width:0;min-height:68px;padding:8px;border:1px solid #3d596b;border-radius:9px;background:#0b1e2d; }
#tacticalOpsRoot .tsa-disciplines button.is-chosen { border-color:#83dfec; background:linear-gradient(120deg,#123f50,#091e2d); }
#tacticalOpsRoot .tsa-disciplines img {grid-row:1/3;width:38px;height:38px;object-fit:contain;}
#tacticalOpsRoot .tsa-disciplines b {font-size:11px;letter-spacing:.04em;color:#e9f7fe;}
#tacticalOpsRoot .tsa-disciplines span {color:#9ac1d0;font-size:9px;}
#tacticalOpsRoot .tsa-path-explain {min-height:24px;color:#b2cbdb;font-size:11px;line-height:1.55;margin:11px 0;}
#tacticalOpsRoot .tsa-lanes {display:grid;gap:11px;}
#tacticalOpsRoot .tsa-lane {padding:10px 11px;border:1px solid #386780;border-radius:11px;background:linear-gradient(115deg,#0b2334,#081725);}
#tacticalOpsRoot .tsa-lane-title {display:flex;gap:10px;align-items:center;margin-bottom:9px;}
#tacticalOpsRoot .tsa-lane-title img {width:41px;height:41px;object-fit:contain;flex:none;}
#tacticalOpsRoot .tsa-lane-title div {min-width:0;flex:1;}
#tacticalOpsRoot .tsa-lane-title b {display:block;font-size:13px;color:#e9f8ff;}
#tacticalOpsRoot .tsa-lane-title small {display:block;font-size:10px;color:#a4c0cf;line-height:1.25;}
#tacticalOpsRoot .tsa-lane-title>span {font-size:12px;font-weight:850;color:#9de1ed;}
#tacticalOpsRoot .tsa-node-line {display:flex;align-items:center;justify-content:space-between;gap:0;padding:4px 1px 0; }
#tacticalOpsRoot .tsa-node-wrap {display:flex;flex:1;min-width:0;align-items:center;flex-direction:column;position:relative;}
#tacticalOpsRoot .tsa-connector {position:absolute;top:25px;left:calc(-50% + 26px);width:calc(100% - 52px);height:3px;background:#466075;z-index:0; }
#tacticalOpsRoot .tsa-connector.is-lit {background:#67cde1;box-shadow:0 0 8px #4fc3e680;}
#tacticalOpsRoot .tsa-node {z-index:1;position:relative;width:51px;height:51px;border-radius:50%;display:grid;place-items:center;border:2px solid #61798b;background:radial-gradient(circle,#112c3e,#071724);box-shadow:inset 0 0 10px #102d3e; }
#tacticalOpsRoot .tsa-node span {font-size:22px;color:#a6c4d0;font-weight:900;}
#tacticalOpsRoot .tsa-node img {width:33px;height:33px;object-fit:contain;}
#tacticalOpsRoot .tsa-node.tsa-state-base,#tacticalOpsRoot .tsa-node.tsa-state-recorded,#tacticalOpsRoot .tsa-node.tsa-state-maxed {border-color:#77dcd6;box-shadow:0 0 9px #43bac653,inset 0 0 11px #174958;}
#tacticalOpsRoot .tsa-node.tsa-state-recorded span,#tacticalOpsRoot .tsa-node.tsa-state-maxed span {color:#9ff0d8;}
#tacticalOpsRoot .tsa-node.tsa-state-available {border-color:#e3bc82;box-shadow:0 0 11px #deb36f42; }
#tacticalOpsRoot .tsa-node.tsa-state-available span {color:#ffdfa7;}
#tacticalOpsRoot .tsa-node.is-focused {outline:2px solid #f7ead0;outline-offset:3px;}
#tacticalOpsRoot .tsa-node-wrap>small {font-size:9px;letter-spacing:.05em;margin-top:8px;color:#b2cad8;}
#tacticalOpsRoot .tsa-inspector {margin-top:13px;padding:15px;border:1px solid #5a94ab;border-radius:10px;background:linear-gradient(130deg,#102e40,#070f1c);min-height:150px;}
#tacticalOpsRoot .tsa-inspector h3 {color:#f5f9ff;letter-spacing:.04em;font-size:21px;margin:5px 0;}
#tacticalOpsRoot .tsa-inspector p {font-size:12px;line-height:1.6;color:#c3d7e2;}
#tacticalOpsRoot .tsa-deltas {display:flex;gap:6px;flex-wrap:wrap;margin:10px 0;}
#tacticalOpsRoot .tsa-deltas strong {padding:7px;border:1px solid #5ba9c1;background:#103e52;border-radius:6px;font-size:11px;color:#d1f8ff;}
#tacticalOpsRoot .tsa-inspector-bottom {display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:12px;}
#tacticalOpsRoot .tsa-inspector-bottom span {font-size:11px;color:#f2d49a;font-weight:800;}
#tacticalOpsRoot .tsa-inspector-bottom button {min-height:48px;padding:8px 12px;background:linear-gradient(115deg,#efc47d,#dba65b);border:1px solid #ffe1a7;border-radius:6px;color:#0c1b23;font-weight:950;font-size:12px;white-space:nowrap;}
#tacticalOpsRoot .tsa-inspector-bottom button:disabled {background:#263c49;border-color:#456277;color:#bdd2de;}
#tacticalOpsRoot .tsa-secondary {display:flex;justify-content:space-between;align-items:center;gap:6px;flex-wrap:wrap;padding:12px 0;}
#tacticalOpsRoot .tsa-secondary button {border:1px solid #55778a;background:#132634;border-radius:5px;padding:8px;min-height:44px;color:#c9deea;font-size:10px;}
#tacticalOpsRoot .tsa-secondary small {color:#8ea9b7;font-size:10px;}
#tacticalOpsRoot .tsa-banner,#tacticalOpsRoot .tsa-feedback {margin:8px 11px;padding:10px;border-left:3px solid #7cb9d5;background:#122d40;color:#d4ebf5;font-size:12px;line-height:1.5;}
#tacticalOpsRoot .tsa-feedback.error {border-color:#e99691;background:#34242a;color:#fbd1ca;}
#tacticalOpsRoot .tsa-feedback.success {border-color:#8ad9bc;background:#173b36;color:#dcfff1;}
#tacticalOpsRoot .tsa-dialog-backdrop {position:fixed;inset:0;background:#020910d9;display:flex;align-items:center;justify-content:center;padding:17px;z-index:1000;}
#tacticalOpsRoot .tsa-dialog {background:linear-gradient(#133347,#081826);border:1px solid #8ed7e9;border-radius:13px;width:min(100%,430px);padding:22px;box-shadow:0 18px 80px #000a;}
#tacticalOpsRoot .tsa-dialog h3 {margin:7px 0;color:#f0fbff;font-size:20px;}
#tacticalOpsRoot .tsa-dialog p {font-size:13px;line-height:1.6;color:#c1dae5;}
#tacticalOpsRoot .tsa-dialog-actions {display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:20px;}
#tacticalOpsRoot .tsa-dialog-actions button {min-height:49px;background:#1d3749;border:1px solid #5c8da3;border-radius:6px;color:#e9f6ff;font-size:11px;font-weight:900;}
#tacticalOpsRoot .tsa-dialog-actions button.is-primary {background:#e7b773;border-color:#ffe2ac;color:#0a1821;}
@media(max-width:380px){
  #tacticalOpsRoot .tsa-hero-tabs img {width:34px;height:39px;}
  #tacticalOpsRoot .tsa-hero-tabs button {gap:3px;padding:4px;}
  #tacticalOpsRoot .tsa-hero-tabs small {font-size:7px;}
  #tacticalOpsRoot .tsa-disciplines img {width:32px;height:32px;}
  #tacticalOpsRoot .tsa-disciplines button {grid-template-columns:32px 1fr;gap:4px;padding:5px;}
  #tacticalOpsRoot .tsa-disciplines b {font-size:10px;}
  #tacticalOpsRoot .tsa-inspector-bottom {align-items:stretch;flex-direction:column;}
  #tacticalOpsRoot .tsa-node {width:48px;height:48px;}
  #tacticalOpsRoot .tsa-connector {top:24px;}
}
@media(prefers-reduced-motion:reduce){#tacticalOpsRoot .tsa-root *{transition:none!important;animation:none!important;}}

/* New skillbook is opt-in until device and G0 gates close. */
#tacticalOpsRoot .t-growth-atlas-cta {display:inline-flex;align-items:center;justify-content:center;min-height:48px;margin:11px 0 0;padding:11px 16px;border:1px solid #83d5e9;border-radius:7px;background:linear-gradient(105deg,#18516a,#0b2b3f);box-shadow:0 0 15px #309ab34a;color:#ecfaff;font-size:11px;font-weight:900;letter-spacing:.08em;cursor:pointer;}
#tacticalOpsRoot .t-growth-atlas-cta:focus-visible {outline:3px solid #f7fcff;outline-offset:2px;}

#tacticalOpsRoot .tsa-page-controls { display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:7px;margin:9px 0 3px; }
#tacticalOpsRoot .tsa-page-controls button {min-height:44px;padding:7px;border:1px solid #4d8095;background:#102b39;color:#d4eaf4;border-radius:6px;font-weight:800;font-size:10px;}
#tacticalOpsRoot .tsa-page-controls span {font-size:10px;text-align:center;font-weight:850;color:#99dae8;letter-spacing:.05em;}

/* Cinematic depth reuses existing Tactical Ops artwork, never bakes in rank state or UI text. */
#tacticalOpsRoot .tsa-atlas-map {background:radial-gradient(circle at center,rgba(26,111,143,.43),transparent 63%),repeating-radial-gradient(circle at center,transparent 0 32px,rgba(88,160,184,.11) 33px 34px),linear-gradient(135deg,rgba(5,18,30,.91),rgba(4,15,26,.91)),url("/images/tactical_ops/presentation/tactical_ops_start_hero_backdrop.png") center / cover;}
#tacticalOpsRoot .tsa-core {overflow:hidden;}
#tacticalOpsRoot .tsa-core::after {content:"";position:absolute;inset:0;background:linear-gradient(transparent 17%,rgba(4,17,27,.14) 46%,rgba(2,11,19,.95) 95%);pointer-events:none;}
#tacticalOpsRoot .tsa-core img.tsa-core-portrait {position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 26%;filter:saturate(.88) contrast(1.04);}
#tacticalOpsRoot .tsa-core img.tsa-core-emblem {position:absolute;right:6px;top:6px;width:22px;height:22px;object-fit:contain;z-index:2;filter:drop-shadow(0 1px 3px #001);}
#tacticalOpsRoot .tsa-core b,#tacticalOpsRoot .tsa-core small {position:relative;z-index:2;text-shadow:0 2px 5px #000,0 0 3px #000;top:26%;}


/* P1 visual polish: cinematic relay chamber, without baked-in status or gameplay imagery. */
#tacticalOpsRoot .tsa-root {border-color:#497a92;border-radius:10px;background:linear-gradient(180deg,rgba(5,13,22,.96),rgba(6,16,27,.94)),url("/images/tactical_ops/presentation/command_deck/command_room.webp") center/cover;box-shadow:inset 0 1px #8edfff33,0 18px 34px #0009}
#tacticalOpsRoot .tsa-header {position:relative;isolation:isolate;padding:12px 13px 13px;background:linear-gradient(100deg,#071726f0,#0b2c3edc),url("/images/tactical_ops/presentation/command_deck/command_room.webp") center/cover}
#tacticalOpsRoot .tsa-header::after {content:"";position:absolute;inset:auto 10px 0;height:1px;background:linear-gradient(90deg,transparent,#85d7ef,transparent);pointer-events:none}
#tacticalOpsRoot .tsa-header h2 {font-family:var(--t-font-display);font-size:clamp(21px,5.3vw,30px);letter-spacing:.07em;text-shadow:0 2px 6px #000}
#tacticalOpsRoot .tsa-subtitle {display:block;font-size:10px;line-height:1.35;max-width:28ch}
#tacticalOpsRoot .tsa-points {min-width:76px;background:linear-gradient(135deg,#13485c,#061824);border:1px solid #78bfd3;border-radius:3px;clip-path:polygon(9px 0,100% 0,100% calc(100% - 9px),calc(100% - 9px) 100%,0 100%,0 9px)}
#tacticalOpsRoot .tsa-hero-tabs {padding:8px 9px 7px;background:#061521b8}
#tacticalOpsRoot .tsa-hero-tabs button {min-height:60px;border-radius:3px;clip-path:polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px);background:linear-gradient(140deg,#112c3c,#071824)}
#tacticalOpsRoot .tsa-hero-tabs button.is-active {background:linear-gradient(110deg,#185369,#082537);border-color:#8ddbed;box-shadow:inset 0 0 0 1px #8cecff35}
#tacticalOpsRoot .tsa-nav {background:#061521ba}
#tacticalOpsRoot .tsa-nav button {border-radius:3px;background:linear-gradient(155deg,#112f40,#071823);clip-path:polygon(7px 0,100% 0,100% calc(100% - 7px),calc(100% - 7px) 100%,0 100%,0 7px)}
#tacticalOpsRoot .tsa-overview {background:linear-gradient(180deg,#06152180,#07182550)}
#tacticalOpsRoot .tsa-atlas-title strong,#tacticalOpsRoot .tsa-focus-heading h3 {font-family:var(--t-font-display);letter-spacing:.09em;text-shadow:0 3px 8px #000}
#tacticalOpsRoot .tsa-atlas-map {height:clamp(320px,90vw,475px);border-color:#598ba3;border-radius:4px;background:radial-gradient(circle at 50% 53%,#2e78944a,transparent 48%),linear-gradient(180deg,#03101db0,#04101ab8),url("/images/tactical_ops/presentation/command_deck/command_room.webp") center/cover;box-shadow:inset 0 0 55px #000b,0 9px 26px #0008}
#tacticalOpsRoot .tsa-atlas-map::after {content:"";position:absolute;inset:6px;pointer-events:none;border:1px solid #78cfe21a;clip-path:polygon(0 0,100% 0,100% 100%,0 100%);box-shadow:inset 0 0 25px #47bed21a}
#tacticalOpsRoot .tsa-core {border:4px double #b1ecf6;background:#0a2236;box-shadow:0 0 0 7px #103c4b,0 0 0 10px #549cbd77,0 0 0 17px #0a29435e,0 0 25px #58cae575,inset 0 0 18px #75d1ee44}
#tacticalOpsRoot .tsa-core::before {content:"";position:absolute;inset:-13px;border:1px dashed #80cde2aa;border-radius:50%;pointer-events:none}
#tacticalOpsRoot .tsa-sector {border-radius:5px;min-height:85px;clip-path:polygon(14px 0,calc(100% - 14px) 0,100% 13px,100% calc(100% - 13px),calc(100% - 14px) 100%,14px 100%,0 calc(100% - 13px),0 13px);background:linear-gradient(140deg,#193d50e8,#061521f0);box-shadow:inset 0 0 20px #5bd0f019,0 4px 15px #000b}
#tacticalOpsRoot .tsa-sector.tsa-tone-amber {border-color:#e8b875;background:linear-gradient(135deg,#4d361b,#0b1b28 75%)}
#tacticalOpsRoot .tsa-sector.tsa-tone-cyan {border-color:#7bdef4}
#tacticalOpsRoot .tsa-sector-glyph {filter:drop-shadow(0 0 4px currentColor)}
#tacticalOpsRoot .tsa-sector b {font-family:var(--t-font-display);font-size:14px}
#tacticalOpsRoot .tsa-reserve {width:40px;height:40px;border:1px dashed #71859188;background:#04131ec9;color:#8195a5;opacity:.6}
#tacticalOpsRoot .tsa-future-toggle {border-radius:3px;background:linear-gradient(120deg,#0f2a3b,#071925);letter-spacing:.13em}
#tacticalOpsRoot .tsa-focus {background:linear-gradient(180deg,#061421c9,#0a233075)}
#tacticalOpsRoot .tsa-disciplines button {border-radius:4px;min-height:64px;background:linear-gradient(130deg,#102a3b,#061826);clip-path:polygon(9px 0,100% 0,100% calc(100% - 9px),calc(100% - 9px) 100%,0 100%,0 9px)}
#tacticalOpsRoot .tsa-disciplines button.is-chosen {border-color:#92ecfa;box-shadow:inset 0 0 0 1px #9be9f448}
#tacticalOpsRoot .tsa-lane {border-radius:5px;border-color:#548aa3;background:linear-gradient(110deg,#102a3fef,#071723e8),url("/images/tactical_ops/presentation/command_deck/mission_hologram.webp") center/cover;box-shadow:inset 0 1px #99eaf321,0 4px 15px #0006}
#tacticalOpsRoot .tsa-node {width:54px;height:54px;border:3px double #667f91;box-shadow:0 0 0 3px #15334588,inset 0 0 18px #0007}
#tacticalOpsRoot .tsa-node.tsa-state-base,#tacticalOpsRoot .tsa-node.tsa-state-recorded,#tacticalOpsRoot .tsa-node.tsa-state-maxed {border-color:#82e6eb;box-shadow:0 0 0 3px #2b879649,0 0 15px #4dd1e86b,inset 0 0 14px #184d5a}
#tacticalOpsRoot .tsa-node.tsa-state-available {border-color:#eac282;box-shadow:0 0 0 3px #e6b36e25,0 0 15px #edbe7a55,inset 0 0 12px #5c422339}
#tacticalOpsRoot .tsa-node.is-focused {outline:2px solid #fff1d2;outline-offset:5px}
#tacticalOpsRoot .tsa-node-wrap>small {font-size:10px;color:#c6dfeb}
#tacticalOpsRoot .tsa-connector {height:3px;top:27px;background:#445970}
#tacticalOpsRoot .tsa-connector.is-lit {background:linear-gradient(90deg,#40a7c9,#a6f3fa)}
#tacticalOpsRoot .tsa-inspector {border-radius:5px;border-color:#83b0c0;background:linear-gradient(120deg,#102a3eea,#061623f0);box-shadow:inset 0 1px #92e5f121,0 7px 20px #0005}
#tacticalOpsRoot .tsa-inspector h3 {font-family:var(--t-font-display);font-size:23px}
#tacticalOpsRoot .tsa-inspector-bottom button {border-radius:3px;clip-path:polygon(9px 0,100% 0,100% calc(100% - 9px),calc(100% - 9px) 100%,0 100%,0 9px);background:linear-gradient(130deg,#f7d192,#e6a953);box-shadow:inset 0 1px #fff9}
#tacticalOpsRoot .tsa-inspector-bottom button:disabled {background:#263c49;box-shadow:none}
@media(max-width:430px){#tacticalOpsRoot .tsa-header {padding:11px 10px}#tacticalOpsRoot .tsa-atlas-map{height:clamp(305px,96vw,420px)}#tacticalOpsRoot .tsa-node{width:50px;height:50px}#tacticalOpsRoot .tsa-connector{top:25px}#tacticalOpsRoot .tsa-lane{padding:9px}#tacticalOpsRoot .tsa-sector{min-height:78px}}
@media(prefers-reduced-transparency:reduce){#tacticalOpsRoot .tsa-root{background:#071726}#tacticalOpsRoot .tsa-lane{background:#102a3f}#tacticalOpsRoot .tsa-atlas-map{background:#0b2637}}

/* Keep host navigation from covering the Atlas when scrolling on small portrait phones. */
#tacticalOpsRoot .t-command-art-shell:has(.tsa-root) .t-command-nav {position:relative;top:auto;z-index:2}
#tacticalOpsRoot .t-command-art-shell:has(.tsa-root) .t-command-pane {animation:none}
#tacticalOpsRoot .tsa-node img {width:29px;height:29px;object-fit:contain;filter:drop-shadow(0 1px 4px #0ad3)}
#tacticalOpsRoot .tsa-node .tsa-rank-stamp {position:absolute;right:-6px;bottom:-6px;display:grid;place-items:center;min-width:20px;height:20px;padding:0 3px;border-radius:50%;border:1px solid #819fb4;background:#071927;color:#c9dde9;font-size:11px;line-height:1;font-weight:900;box-shadow:0 2px 6px #000b}
#tacticalOpsRoot .tsa-state-available .tsa-rank-stamp {border-color:#e5bd7d;color:#ffe3ae;background:#322515}
#tacticalOpsRoot .tsa-state-recorded .tsa-rank-stamp,#tacticalOpsRoot .tsa-state-maxed .tsa-rank-stamp {border-color:#7bdbc9;color:#adf8e4;background:#0b3637}
#tacticalOpsRoot .tsa-node.tsa-state-needs-rank-one img,#tacticalOpsRoot .tsa-node.tsa-state-no-points img,#tacticalOpsRoot .tsa-node.tsa-state-different-discipline img,#tacticalOpsRoot .tsa-node.tsa-state-no-effect img {filter:grayscale(1);opacity:.43}
#tacticalOpsRoot .tsa-detail-toggle {display:block;width:100%;min-height:44px;margin:3px 0 9px;background:#0c2332;border:1px solid #507f96;color:#bce3ef;font-size:10px;font-weight:800;letter-spacing:.08em;border-radius:3px}
#tacticalOpsRoot .tsa-lanes.is-compact {gap:7px}
#tacticalOpsRoot .tsa-lanes.is-compact .tsa-lane {padding:8px 10px 7px}
#tacticalOpsRoot .tsa-lanes.is-compact .tsa-lane-title {margin-bottom:3px}
#tacticalOpsRoot .tsa-lanes.is-compact .tsa-lane-title img {width:32px;height:32px}
#tacticalOpsRoot .tsa-lanes.is-compact .tsa-lane-title small {display:none}
#tacticalOpsRoot .tsa-lanes.is-compact .tsa-node-wrap>small {margin-top:5px}
#tacticalOpsRoot .tsa-lanes.is-compact .tsa-node-line {padding:1px 0 0}
@media(max-width:390px){#tacticalOpsRoot .tsa-node img{width:26px;height:26px}#tacticalOpsRoot .tsa-node .tsa-rank-stamp{min-width:18px;height:18px;font-size:10px}}

/* P2 FROZEN RELAY ASSET INTEGRATION — UI art only, preserves server-owned progression.
   New Atlas environment and crests apply only inside the existing opt-in Signal Atlas. */
#tacticalOpsRoot .tsa-atlas-map {
  background-image:linear-gradient(180deg,rgba(4,13,22,.68),rgba(5,17,27,.60) 45%,rgba(3,12,20,.82)),url("/images/tactical_ops/signal_atlas/v1/environments/atlas_relay_chamber.webp");
  background-position:center,center 43%;
  background-size:cover;
}
#tacticalOpsRoot .tsa-sector .tsa-sector-glyph {width:37px;height:37px;display:flex;align-items:center;justify-content:center;line-height:0;flex:none;}
#tacticalOpsRoot .tsa-sector .tsa-sector-glyph img {width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 1px 2px #00121d);}
#tacticalOpsRoot .tsa-sector .tsa-sector-glyph-fallback {display:none;line-height:1;}
#tacticalOpsRoot .tsa-sector .tsa-sector-glyph[data-art-failed="1"] .tsa-sector-glyph-fallback {display:inline;}
#tacticalOpsRoot .tsa-sector {background:linear-gradient(145deg,#102c3cf5,#071924f4);}
@media(max-width:380px) { #tacticalOpsRoot .tsa-sector .tsa-sector-glyph {width:32px;height:32px;} }
/* END P2 FROZEN RELAY ASSET INTEGRATION */

/* P3 final integration. Artwork frames controls; text and native borders survive art loss. */
#tacticalOpsRoot .tsa-root {box-sizing:border-box;overflow-wrap:anywhere;--tsa-recorded:#edc184;}
#tacticalOpsRoot .tsa-root *,#tacticalOpsRoot .tsa-dialog * {box-sizing:border-box;}
#tacticalOpsRoot .tsa-root img[hidden] {display:none!important;}
#tacticalOpsRoot .tsa-header>div:first-child {min-width:0;}
#tacticalOpsRoot .tsa-header .tsa-eyebrow {font-size:9px;letter-spacing:.06em;}
#tacticalOpsRoot .tsa-hero-tabs button,#tacticalOpsRoot .tsa-nav button,#tacticalOpsRoot .tsa-disciplines button {clip-path:none;}
#tacticalOpsRoot .tsa-hero-tabs img {width:26px;height:34px;}
#tacticalOpsRoot .tsa-hero-tabs b {font-size:10px;letter-spacing:0;white-space:nowrap;}
#tacticalOpsRoot .tsa-hero-tabs small {font-size:9px;}
#tacticalOpsRoot .tsa-nav {grid-template-columns:1fr 1fr 52px;}
#tacticalOpsRoot .tsa-nav button {font-size:10px;letter-spacing:0;min-width:44px;}
#tacticalOpsRoot .tsa-atlas-map {height:clamp(300px,85vw,390px);}
#tacticalOpsRoot .tsa-core-housing {position:absolute;left:50%;top:58%;transform:translate(-50%,-50%);width:clamp(136px,39vw,176px);aspect-ratio:1;pointer-events:none;z-index:2;}
#tacticalOpsRoot .tsa-core-bezel {width:100%;height:100%;object-fit:contain;}
#tacticalOpsRoot .tsa-core {top:58%;width:clamp(94px,27vw,122px);box-shadow:0 4px 20px #0009;border:1px solid #72a6bb;z-index:1;}
#tacticalOpsRoot .tsa-core::before {display:none;}
#tacticalOpsRoot .tsa-core b {font-size:16px;}
#tacticalOpsRoot .tsa-core small {font-size:8px;letter-spacing:0;}
#tacticalOpsRoot .tsa-core b,#tacticalOpsRoot .tsa-core small {top:20%;}
#tacticalOpsRoot .tsa-sector,#tacticalOpsRoot .tsa-sector.tsa-tone-amber,#tacticalOpsRoot .tsa-sector.tsa-tone-cyan {width:44%;max-width:194px;min-height:112px;padding:10px 2px;gap:3px;border:10px solid #4c7183;border-image:var(--tsa-sectorFrame) 42 fill / 10px;clip-path:none;background:#0a2030;box-shadow:0 4px 12px #0008;}
#tacticalOpsRoot .tsa-sector:enabled:hover {background:#14374a;}
#tacticalOpsRoot .tsa-sector:focus-visible {outline-offset:0;}
#tacticalOpsRoot .tsa-sector em {color:var(--tsa-recorded);font-size:10px;}
#tacticalOpsRoot .tsa-sector b {font-size:12px;letter-spacing:.02em;}
#tacticalOpsRoot .tsa-sector small {font-size:10px;}
#tacticalOpsRoot .tsa-sector .tsa-sector-glyph {width:34px;height:34px;filter:none;}
#tacticalOpsRoot .tsa-reserve {width:28px;height:28px;font-size:18px;opacity:.45;}
#tacticalOpsRoot .tsa-atlas-footer {gap:6px 14px;font-size:10px;}
#tacticalOpsRoot .tsa-focus {background:linear-gradient(180deg,#04121be8,#04121bdb),var(--tsa-sectorBackground) center top / cover;}
#tacticalOpsRoot .tsa-focus-heading h3 {font-size:19px;letter-spacing:.04em;}
#tacticalOpsRoot .tsa-sector-switch {display:grid;grid-template-columns:1fr 1fr;gap:7px;margin:0 0 12px;}
#tacticalOpsRoot .tsa-sector-switch button {min-width:44px;min-height:48px;padding:8px;border:1px solid #4c7183;background:#091d2c;color:#bcd4e1;font-size:12px;font-weight:800;border-radius:4px;}
#tacticalOpsRoot .tsa-sector-switch button[aria-pressed=true] {border-color:#8bdcf0;background:#153a4b;color:#effaff;box-shadow:inset 0 -2px #8bdcf0;}
#tacticalOpsRoot .tsa-sector-switch small {display:block;font-size:10px;color:#edc184;margin-top:3px;}
#tacticalOpsRoot .tsa-disciplines b {overflow-wrap:anywhere;font-size:11px;}
#tacticalOpsRoot .tsa-disciplines span {font-size:10px;}
#tacticalOpsRoot .tsa-path-explain {font-size:12px;line-height:1.5;}
#tacticalOpsRoot .tsa-lane {background:linear-gradient(110deg,#0c2637f5,#071723f2);box-shadow:inset 0 1px #99eaf321;}
#tacticalOpsRoot .tsa-node {width:54px;height:54px;border:1px solid #587587;background:radial-gradient(circle,#183a4e,#071724);box-shadow:none!important;}
#tacticalOpsRoot .tsa-node::before {content:"";position:absolute;inset:-4px;background:var(--tsa-nodeFrame) center / contain no-repeat;pointer-events:none;}
#tacticalOpsRoot .tsa-node img {width:28px;height:28px;filter:none;}
#tacticalOpsRoot .tsa-node.tsa-state-base {border-color:#8ca9b7;}
#tacticalOpsRoot .tsa-node.tsa-state-available {border-color:#8bdcf0;background:#123a4a;outline:1px solid #8bdcf0;outline-offset:2px;}
#tacticalOpsRoot .tsa-node.tsa-state-recorded,#tacticalOpsRoot .tsa-node.tsa-state-maxed {border-color:#edc184;background:#332b20;}
#tacticalOpsRoot .tsa-node.tsa-state-recorded .tsa-rank-stamp,#tacticalOpsRoot .tsa-node.tsa-state-maxed .tsa-rank-stamp {color:#ffe1ac;border-color:#edc184;background:#30271c;}
#tacticalOpsRoot .tsa-node.tsa-state-available .tsa-rank-stamp {color:#b6f2ff;border-color:#8bdcf0;background:#0c2b3a;}
#tacticalOpsRoot .tsa-node.is-focused {outline:2px solid #effaff;outline-offset:4px;}
#tacticalOpsRoot .tsa-connector {top:27px;background:#3f596b;}
#tacticalOpsRoot .tsa-connector.is-lit {background:#caa56e;box-shadow:none;}
#tacticalOpsRoot .tsa-node-status {font-size:9px;line-height:1.4;color:#b9ccd8;display:block;text-align:center;margin-top:3px;}
#tacticalOpsRoot .tsa-node-wrap:has(.tsa-state-available) .tsa-node-status {color:#a6eaff;}
#tacticalOpsRoot .tsa-node-wrap:has(.tsa-state-recorded,.tsa-state-maxed) .tsa-node-status {color:#f2ce95;}
#tacticalOpsRoot .tsa-inspector {position:relative;scroll-margin:16px;border:14px solid #628695;border-image:var(--tsa-inspectorFrame) 48 fill / 14px;padding:7px;background:#081b29;box-shadow:none;}
#tacticalOpsRoot .tsa-inspector.has-selection::after {content:"";position:absolute;right:8px;top:5px;width:18px;height:18px;background:var(--tsa-contact) center / contain no-repeat;pointer-events:none;}
#tacticalOpsRoot .tsa-inspector .tsa-eyebrow {padding-right:22px;}
#tacticalOpsRoot .tsa-inspector h3 {font-size:21px;line-height:1.2;letter-spacing:.03em;}
#tacticalOpsRoot .tsa-saved-rank {font-size:10px;color:#efcc94;margin:9px 0;font-weight:800;}
#tacticalOpsRoot .tsa-inspector-bottom {flex-wrap:wrap;}
#tacticalOpsRoot .tsa-inspector-bottom button {white-space:normal;clip-path:none;min-width:44px;}
#tacticalOpsRoot .tsa-secondary small {font-size:11px;}
#tacticalOpsRoot .tsa-dialog-backdrop {padding:max(16px,env(safe-area-inset-top),var(--tg-content-safe-area-inset-top,0px)) max(12px,env(safe-area-inset-right)) max(16px,env(safe-area-inset-bottom),var(--tg-content-safe-area-inset-bottom,0px));height:100dvh;overflow-y:auto;overscroll-behavior:contain;}
#tacticalOpsRoot .tsa-dialog {box-sizing:border-box;max-height:100%;overflow-y:auto;overscroll-behavior:contain;padding:18px;flex-shrink:1;overflow-wrap:anywhere;}
#tacticalOpsRoot .tsa-dialog-actions {position:sticky;bottom:-18px;background:#0b2030;padding:10px 0;margin-top:10px;}
#tacticalOpsRoot .tsa-dialog-actions button {min-width:44px;}
#tacticalOpsRoot .tsa-dialog button:focus-visible {outline:3px solid #effaff;outline-offset:2px;}
@media(max-width:380px){
  #tacticalOpsRoot .tsa-hero-tabs button {flex-direction:column;align-items:flex-start;gap:4px;padding:7px;}
  #tacticalOpsRoot .tsa-hero-tabs img {display:none;}
  #tacticalOpsRoot .tsa-hero-tabs button {min-height:57px;}
  #tacticalOpsRoot .tsa-hero-tabs small {font-size:9px;}
  #tacticalOpsRoot .tsa-disciplines button {grid-template-columns:26px 1fr;gap:5px;padding:7px;}
  #tacticalOpsRoot .tsa-disciplines img {width:26px;height:26px;}
}
@media(prefers-reduced-transparency:reduce){#tacticalOpsRoot .tsa-focus{background:#071726}}
@media(forced-colors:active){#tacticalOpsRoot .tsa-root button {border:2px solid ButtonText;border-image:none;}#tacticalOpsRoot .tsa-node::before,#tacticalOpsRoot .tsa-core-housing{display:none}#tacticalOpsRoot .tsa-inspector{border-image:none}}
@media(max-width:380px){
  #tacticalOpsRoot .tsa-disciplines button {grid-template-columns:1fr;grid-template-rows:auto auto;justify-items:start;gap:4px;}
  #tacticalOpsRoot .tsa-disciplines img {display:none;}
  #tacticalOpsRoot .tsa-disciplines b {font-size:11px;}
}

/* S8 — Final Combat Visual Cohesion.
   Render-only overrides. Source of truth for events, hit targets, HP, skills,
   movement and telegraphs remains unchanged. Load LAST in styles.ts. */
#tacticalOpsRoot .t-battle {
  --t8-cyan: #8fe3f2;
  --t8-amber: #efc28b;
  --t8-danger: #ff7774;
  --t8-ink: rgba(5, 17, 29, .96);
  --t8-ease: cubic-bezier(.19, .75, .23, 1);
}
/* One depth model: traversal and contact below the dangerous squares;
   confirmed numbers and the battle HUD remain clearly legible. */
#tacticalOpsRoot .t-choreo-travel,
#tacticalOpsRoot .t-hostile-scene { z-index: 14; pointer-events: none; }
#tacticalOpsRoot .t-sprite-fx,
#tacticalOpsRoot .t-master-fx { z-index: 15; pointer-events: none; }
#tacticalOpsRoot .t-consequence { z-index: 17; pointer-events: none; }
#tacticalOpsRoot .t-impact { z-index: 18; pointer-events: none; }
#tacticalOpsRoot .t-threat-tile { z-index: 19; pointer-events: none; }
#tacticalOpsRoot .t-float { z-index: 20; pointer-events: none; }

/* A restrained visual vocabulary. Contact follows travel; action numbers
   are the strongest transient signal, except persistent enemy-danger tiles. */
#tacticalOpsRoot .t-choreo-travel .t-choreo-actor {
  filter: drop-shadow(0 7px 12px rgba(0,0,0,.66));
  animation-timing-function: var(--t8-ease);
}
#tacticalOpsRoot .t-hostile-scene img {
  filter: drop-shadow(0 7px 12px rgba(0,0,0,.66)) drop-shadow(0 0 7px rgba(235,112,91,.28));
}
#tacticalOpsRoot .t-choreo-line line { filter: drop-shadow(0 0 3px rgba(246,192,117,.35)); }
#tacticalOpsRoot .t-hostile-scene line { filter: drop-shadow(0 0 4px rgba(252,101,89,.42)); }

/* Actual damage only: 360 ms pulse is timed to the battleStore event. */
#tacticalOpsRoot .t-impact {
  width: 48px; height: 48px;
  border: 2px solid rgba(241,229,204,.83);
  box-shadow: 0 0 0 2px rgba(4,15,26,.55), 0 0 17px rgba(239,194,139,.25);
  animation: t8-contact-pulse .36s var(--t8-ease) both;
}
@keyframes t8-contact-pulse {
  0% { opacity: 0; scale: .64; }
  18% { opacity: .92; scale: 1; }
  65% { opacity: .55; scale: 1.18; }
  100% { opacity: 0; scale: 1.52; }
}
#tacticalOpsRoot .t-float.dmg {
  color: #ffc7b3;
  text-shadow: 0 2px 4px #070d15, 0 0 12px rgba(255,111,99,.36);
}
#tacticalOpsRoot .t-float.heal { color: #a2f5d4; }

/* Confirmed consequence captions always fit the battlefield, including
   10x7 edge tiles and compact 8x5 legacy boards. Left/top are CSS-clamped
   by Battle.tsx; never place an interactive surface over the field. */
#tacticalOpsRoot .t-consequence {
  max-width: min(190px, 72%);
  box-sizing: border-box;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.15;
  padding: 5px 9px;
  border-radius: 4px;
  letter-spacing: .09em;
  font-family: var(--t-font-display);
  font-weight: 800;
  color: #e6f4f8;
  border: 1px solid rgba(143,227,242,.57);
  background: linear-gradient(115deg, rgba(6,23,36,.98), rgba(14,37,50,.94));
  box-shadow: 0 2px 0 rgba(123,221,235,.12) inset, 0 7px 16px rgba(0,0,0,.55);
  animation: t8-consequence .99s var(--t8-ease) both;
}
#tacticalOpsRoot .t-consequence-finisher {
  color: #ffe5c8;
  border-color: rgba(239,194,139,.80);
  background: linear-gradient(115deg,rgba(56,29,24,.98),rgba(19,28,38,.96));
}
#tacticalOpsRoot .t-consequence-counter {
  color: #b6fff0;
  border-color: rgba(112,236,212,.79);
  background: linear-gradient(115deg,rgba(8,41,42,.98),rgba(12,31,43,.96));
}
#tacticalOpsRoot .t-consequence-guarded {
  color: #d4ebff;
  border-color: rgba(148,195,243,.76);
  background: linear-gradient(115deg,rgba(13,33,59,.98),rgba(9,24,39,.96));
}
@keyframes t8-consequence {
  0% { opacity: 0; translate: 0 5px; scale: .94; }
  20%, 63% { opacity: 1; translate: 0 0; scale: 1; }
  100% { opacity: 0; translate: 0 -10px; scale: .98; }
}

@media(max-width:620px) {
  #tacticalOpsRoot .t-consequence { font-size: 10px; padding: 4px 6px; letter-spacing: .045em; }
  #tacticalOpsRoot .t-impact { width: 42px; height: 42px; }
}
/* Accessibility: no looping flashes or moving critical captions when the
   user requests reduced motion. Truthful text stays visible until timeout. */
@media(prefers-reduced-motion:reduce) {
  #tacticalOpsRoot .t-consequence { animation: none !important; opacity: 1; translate: none; scale: 1; }
  #tacticalOpsRoot .t-impact { animation: none !important; opacity: .35; scale: 1; }
  #tacticalOpsRoot .t-float { animation: none !important; }
}


/* One identification plate, above its owner. Objective actors use the same
   clearance as regular hostiles so their silhouette stays readable. */
#tacticalOpsRoot .t-battle .t-enemy-archetype {
  bottom: calc(100% + 3px);
  background: #101920;
  border-color: #82949d;
  color: #dae6ed;
  box-shadow: none;
}
#tacticalOpsRoot .t-battle :is(.t-archetype-courier,.t-archetype-trace-target) {
  border-color: #80cbd9;
  color: #d9f5fa;
}
#tacticalOpsRoot .t-battle .t-archetype-commander {
  border-color: #f0a093;
  color: #ffe2d9;
}
#tacticalOpsRoot .t-battle .t-terminal.is-courier-exit {
  width: 34px;
  height: 34px;
  transform: translate(-50%, -50%);
  grid-template-rows: 15px 9px;
  align-content: center;
  border: 1px dashed #aedce6;
  border-radius: 4px;
  background: #0a2430;
  box-shadow: none;
  animation: none;
}
#tacticalOpsRoot .is-courier-exit svg {width: 14px;height: 14px}
#tacticalOpsRoot .t-terminal.is-courier-exit span {font-size: 8px;letter-spacing: .06em}
#tacticalOpsRoot .t-battle .t-hold-cell.is-hold-area:not(.is-hold-center) {background: #123d4e21;border-color: #91c1ce65}
#tacticalOpsRoot .t-battle .t-hold-cell.is-hold-center {font-weight: 800;color: #d7f1f6}
#tacticalOpsRoot .t-battle[data-projection="relay-overhead-v1"] .t-field .t-grid i {opacity: .52}
#tacticalOpsRoot .t-battle .t-cell.move::after {width:7px;height:7px;background:#85c6d016;border-color:#a7dae1b5}
#tacticalOpsRoot .t-battle .t-cell.move:is(:hover,:focus-visible)::after {width:11px;height:11px;background:#a1d9e36e;border-color:#daf5fb}

/* The trail follows only confirmed displacement and sits beneath the actors.
   Reinforcement confirmation uses the spawned unit's own ring. */
#tacticalOpsRoot .t-move-trace {
  position:absolute;inset:0;width:100%;height:100%;z-index:3;pointer-events:none;
  animation:t-confirmed-move .46s ease-out both;
}
#tacticalOpsRoot .t-move-trace line {
  stroke:#b6dce5;stroke-width:2;stroke-dasharray:3 5;stroke-linecap:round;vector-effect:non-scaling-stroke;
}
@keyframes t-confirmed-move {0%,60%{opacity:.72} 100%{opacity:0}}
#tacticalOpsRoot .t-battle .t-token.is-arriving .t-ring {animation:t-contact-signal .58s ease-out}
#tacticalOpsRoot .t-battle .t-objective-summary:is([data-objective-state="CONTROLLED"],[data-objective-state="CONTESTED"]) {animation:t-contact-signal .4s ease-out}
@keyframes t-contact-signal {from{opacity:.5} to{opacity:1}}
@media (prefers-reduced-motion:reduce) {
  #tacticalOpsRoot .t-move-trace {visibility:hidden}
  #tacticalOpsRoot .t-battle .t-objective-summary[data-objective-state] {animation:none}
}

/* S9: strategy-facing campaign orders; no fake reward state. */
#tacticalOpsRoot .t-campaign-orders{display:grid;gap:10px;margin:10px 0 14px;padding:14px;border:1px solid rgba(107,213,235,.42);background:linear-gradient(145deg,rgba(8,29,44,.96),rgba(7,18,30,.98));border-radius:8px}
#tacticalOpsRoot .t-campaign-orders-head{display:flex;justify-content:space-between;align-items:center;gap:10px}
#tacticalOpsRoot .t-campaign-orders-head h2{font-family:var(--t-font-display);color:#e3f9ff;font-size:clamp(17px,3.7vw,23px);letter-spacing:.07em;margin:2px 0}
#tacticalOpsRoot .t-campaign-orders-head small{color:#a8cbd6;text-align:right;font-size:10px}
#tacticalOpsRoot .t-campaign-orders-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,190px),1fr));gap:9px}
#tacticalOpsRoot .t-campaign-order{display:grid;align-content:start;gap:6px;min-width:0;border:1px solid rgba(116,190,211,.28);border-left:3px solid #6ed3e7;background:rgba(3,15,26,.8);padding:11px;border-radius:5px}
#tacticalOpsRoot .t-campaign-order.is-story{border-left-color:#eab474}
#tacticalOpsRoot .t-campaign-order.is-challenge{border-left-color:#a5e9ce}
#tacticalOpsRoot .t-campaign-order.is-advanced{border-left-color:#b6b4f5}
#tacticalOpsRoot .t-campaign-order.is-complete{opacity:.75}
#tacticalOpsRoot .t-campaign-order-top{display:flex;justify-content:space-between;gap:5px;color:#a5ced9;font-size:10px;font-weight:800;letter-spacing:.07em}
#tacticalOpsRoot .t-campaign-order-top b{color:#dcf7ff}
#tacticalOpsRoot .t-campaign-order h3{margin:1px 0;color:#effbff;font-size:14px;line-height:1.15}
#tacticalOpsRoot .t-campaign-order strong{color:#9cdeed;font-size:11px}
#tacticalOpsRoot .t-campaign-order p{margin:0;color:#b6cdd9;font-size:11px;line-height:1.4}
#tacticalOpsRoot .t-campaign-order button{margin-top:auto;min-height:36px}
#tacticalOpsRoot .t-campaign-career{display:flex;flex-wrap:wrap;gap:6px}
#tacticalOpsRoot .t-campaign-career span{font-size:10px;color:#c8e9f0;border:1px solid rgba(110,197,220,.28);padding:5px 7px;background:rgba(5,20,31,.85)}
@media(max-width:620px){#tacticalOpsRoot .t-campaign-orders{padding:10px}#tacticalOpsRoot .t-campaign-orders-grid{grid-template-columns:1fr}#tacticalOpsRoot .t-campaign-order{padding:9px}}

/* S9B. Hidden unless the backend supplies valid tacticalChapter data. */
#tacticalOpsRoot .t-chapter-readout{display:grid;gap:9px;margin:10px 0 13px;padding:14px;border:1px solid rgba(234,182,109,.55);border-left:3px solid #e8bd82;background:linear-gradient(135deg,rgba(21,33,46,.98),rgba(7,19,31,.97));border-radius:7px}
#tacticalOpsRoot .t-chapter-readout .t-title{font-size:clamp(19px,4vw,27px);color:#e9f7ff;margin:0}
#tacticalOpsRoot .t-chapter-readout p{font-size:12px;color:#bed8e2;line-height:1.4;margin:0}
#tacticalOpsRoot .t-chapter-readout small{font-size:10px;color:#9fbac8;line-height:1.4}
#tacticalOpsRoot .t-chapter-steps{display:grid;gap:8px;grid-template-columns:repeat(auto-fit,minmax(min(100%,190px),1fr))}
#tacticalOpsRoot .t-chapter-steps > div{padding:10px;background:rgba(6,24,38,.88);border:1px solid rgba(117,201,220,.32)}
#tacticalOpsRoot .t-chapter-steps strong{font-size:12px;letter-spacing:.06em;color:#f1d4ab}

/* Player-first mission clarity — presentation-only.
   No new overlays, hit regions, rewards, targeting, or combat state. */
#tacticalOpsRoot .t-deployment .t-training-overview {
  grid-template-columns: minmax(0, 1fr);
}
#tacticalOpsRoot .t-training-overview .t-deploy-summary-main {
  position: relative;
  min-width: 0;
  padding: clamp(13px, 3vw, 20px);
  border: 1px solid rgba(108, 218, 235, .57);
  border-left: 3px solid #83deeb;
  border-radius: 9px;
  background: linear-gradient(135deg, rgba(11, 42, 55, .97), rgba(5, 19, 32, .97));
  box-shadow: inset 0 1px 0 rgba(218, 250, 255, .1), 0 14px 32px rgba(0, 0, 0, .27);
  overflow: hidden;
}
#tacticalOpsRoot .t-training-overview .t-deploy-summary-main::before {
  content: "";
  position: absolute;
  inset: 0 0 auto;
  height: 1px;
  background: linear-gradient(90deg, #8ae6ec, rgba(138, 230, 236, 0));
  pointer-events: none;
}
#tacticalOpsRoot .t-training-overview .t-kicker {
  color: #9de7ef;
  font-weight: 850;
  letter-spacing: .12em;
}
#tacticalOpsRoot .t-training-overview .t-deploy-summary-main > strong {
  color: #f0fbff;
  font-size: clamp(17px, 4.3vw, 23px);
  line-height: 1.22;
  letter-spacing: .015em;
  text-wrap: balance;
}
#tacticalOpsRoot .t-training-steps {
  list-style: none;
  display: grid;
  gap: 9px;
  padding: 0;
  margin: 15px 0 0;
  counter-reset: none;
}
#tacticalOpsRoot .t-training-steps li {
  display: grid;
  grid-template-columns: 30px minmax(0, 1fr);
  gap: 11px;
  align-items: center;
  min-width: 0;
  padding: 11px 12px;
  background: rgba(4, 19, 31, .72);
  border: 1px solid rgba(122, 210, 229, .24);
  border-radius: 7px;
}
#tacticalOpsRoot .t-training-steps li:first-child {
  border-color: rgba(112, 219, 238, .48);
  background: linear-gradient(90deg, rgba(25, 81, 96, .42), rgba(5, 24, 37, .82));
}
#tacticalOpsRoot .t-training-steps li > span {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 5px;
  background: rgba(129, 224, 238, .12);
  color: #b7f3f6;
  font: 800 13px/1 var(--t-font-sans);
  border: 1px solid rgba(145, 224, 239, .27);
}
#tacticalOpsRoot .t-training-steps li:last-child > span {
  color: #f3d19a;
  border-color: rgba(240, 196, 129, .28);
  background: rgba(240, 196, 129, .1);
}
#tacticalOpsRoot .t-training-steps li > p {
  margin: 0;
  color: #e2f1f6;
  font: 500 clamp(13px, 3.4vw, 15px)/1.45 var(--t-font-sans);
  letter-spacing: 0;
  overflow-wrap: anywhere;
}
#tacticalOpsRoot .t-deploy-summary-main .t-mission-extra {
  margin-top: 11px;
  padding: 0 10px;
  border: 1px solid rgba(125, 201, 221, .26);
  border-radius: 6px;
  background: rgba(4, 18, 30, .62);
}
#tacticalOpsRoot .t-mission-extra > summary {
  min-height: 44px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #d7eff6;
  font: 800 11px/1.4 var(--t-font-sans);
  letter-spacing: .045em;
}
#tacticalOpsRoot .t-mission-extra > summary > span {
  color: #9ecdd9;
  font-size: 10px;
}
#tacticalOpsRoot .t-mission-extra[open] > summary {
  border-bottom: 1px solid rgba(125, 201, 221, .19);
}
#tacticalOpsRoot .t-deploy-summary-main .t-mission-extra > p,
#tacticalOpsRoot .t-deploy-summary-main .t-mission-extra > small {
  display: block;
  margin: 9px 0;
  color: #bfdbe5;
  font: 500 12px/1.5 var(--t-font-sans);
  letter-spacing: 0;
}
#tacticalOpsRoot .t-mission-extra > summary:focus-visible {
  outline: 2px solid #a4eaf4;
  outline-offset: 3px;
}
#tacticalOpsRoot .t-shell[data-screen="battle"] .t-battle-hud-rail .t-obj-chip.is-training {
  border-color: rgba(126, 226, 238, .74);
  background: linear-gradient(145deg, #143849, #0a2534);
}
#tacticalOpsRoot .t-shell[data-screen="battle"] .t-battle-hud-rail .t-obj-chip.is-training .t-objective-summary {
  color: #a2f0f0;
  font-weight: 800;
  letter-spacing: .01em;
}
#tacticalOpsRoot .t-battle.is-foundation-training[data-decision="READ"] .t-command-cue {
  border-left-color: #9be8ef;
  background: linear-gradient(90deg, rgba(4, 24, 35, .82), rgba(4, 24, 35, 0));
  text-shadow: 0 1px 3px #030b13;
}
#tacticalOpsRoot .t-battle.is-foundation-training[data-decision="READ"] .t-command-cue strong {
  color: #c7f7f9;
}
@media (max-width: 380px) {
  #tacticalOpsRoot .t-training-steps li { padding: 10px 8px; gap: 8px; }
  #tacticalOpsRoot .t-training-overview .t-deploy-summary-main { padding: 12px; }
}
@media (prefers-reduced-motion: reduce) {
  #tacticalOpsRoot .t-training-overview *,
  #tacticalOpsRoot .t-mission-extra { animation: none !important; transition: none !important; }
}

/* Player purpose uses the existing Command surfaces and natural mobile flow. */
#tacticalOpsRoot .t-purpose-alternatives {display:grid;gap:12px;margin:16px 0;min-width:0}
#tacticalOpsRoot .t-purpose-alternatives article {border-top:1px solid #315266;padding:14px 0;min-width:0}
#tacticalOpsRoot .t-purpose-alternatives h3 {margin:6px 0;font-size:16px}
#tacticalOpsRoot .t-purpose-alternatives p,
#tacticalOpsRoot .t-purpose-memory p,
#tacticalOpsRoot .t-purpose-result p {font-size:13px;line-height:1.5;overflow-wrap:anywhere}
#tacticalOpsRoot .t-purpose-memory {margin:16px 0;padding:14px 0;border-top:1px solid #315266;min-width:0}
#tacticalOpsRoot .t-purpose-result b {display:block;color:var(--t-accent);font-size:11px;letter-spacing:.08em}
#tacticalOpsRoot .t-purpose-alternatives .t-btn,
#tacticalOpsRoot .t-purpose-memory .t-btn {min-height:44px;max-width:100%;white-space:normal}
#tacticalOpsRoot .t-command-mission-feature .t-wt-reward-chips {display:flex;flex-wrap:wrap;overflow:visible}
#tacticalOpsRoot .t-command-mission-feature .t-wt-reward-chips span {min-width:0;max-width:100%;white-space:normal;overflow-wrap:anywhere}

/* DEPTH 01.1 — AAA clarity pass from real Android/Telegram playtest.
   Presentation only: no accepted-run, combat, reward or backend mutation. */
#tacticalOpsRoot .t-deployment.t-premium-ux .t-deploy-hero-v29{
  min-height:172px; padding:62px 16px 17px;
  border-bottom:1px solid rgba(124,223,243,.58);
  background:linear-gradient(120deg,#07111c,#0b2839);
}
#tacticalOpsRoot .t-deployment.t-premium-ux .t-deploy-hero-copy{
  padding-top:0; max-width:100%; min-width:0;
}
#tacticalOpsRoot .t-deployment.t-premium-ux .t-deploy-hero-copy .t-title{
  font-size:clamp(24px,6.2vw,35px); line-height:1.08; letter-spacing:.035em;
  text-shadow:0 3px 14px #000d;
}
#tacticalOpsRoot .t-deployment.t-premium-ux .t-deploy-hero-copy p{
  color:#dff6fc; font-size:clamp(12px,3.3vw,15px); line-height:1.4;
  max-width:44ch; overflow-wrap:anywhere;
}
#tacticalOpsRoot .t-deployment.t-premium-ux .t-command-nav{
  position:relative; top:auto; z-index:2; margin:10px 0 12px;
}
#tacticalOpsRoot .t-deployment.t-premium-ux .t-command-nav button{
  min-height:55px;
}
#tacticalOpsRoot .t-deployment.t-premium-ux .t-command-pane,
#tacticalOpsRoot .t-deployment.t-premium-ux .t-deploy-summary-main,
#tacticalOpsRoot .t-deployment.t-premium-ux .t-deploy-summary-card{
  min-width:0; overflow-wrap:anywhere;
}
#tacticalOpsRoot .t-deployment.t-premium-ux .t-deploy-summary-main > strong{
  font-size:clamp(17px,4vw,21px);line-height:1.3;letter-spacing:.005em;
}
#tacticalOpsRoot .t-deployment.t-premium-ux .t-deploy-summary-card strong{
  font-size:clamp(12px,3.1vw,15px);line-height:1.35;overflow-wrap:anywhere;
}
#tacticalOpsRoot .t-deployment.t-premium-ux .t-deploy-summary-card small{
  font-size:clamp(11px,2.9vw,13px);line-height:1.4;
}
#tacticalOpsRoot .t-lockdown-rule{
  display:grid;gap:6px;margin:12px 0 4px;padding:14px 15px;
  border:1px solid rgba(245,197,115,.64);border-left:4px solid #f2c67d;border-radius:7px;
  background:linear-gradient(105deg,rgba(80,50,23,.52),rgba(9,30,43,.92));
  box-shadow:inset 0 1px rgba(255,234,198,.08);
}
#tacticalOpsRoot .t-lockdown-rule strong{
  font-size:clamp(13px,3.5vw,16px);letter-spacing:.08em;color:#ffe6b4;
}
#tacticalOpsRoot .t-lockdown-rule span{
  font-size:clamp(12px,3.2vw,14px);line-height:1.5;color:#e3eefa;
}
#tacticalOpsRoot .t-deployment .t-codex-slot{padding:11px;min-width:0}
#tacticalOpsRoot .t-deployment .t-codex-slot strong{font-size:clamp(11px,3vw,13px);line-height:1.35}
#tacticalOpsRoot .t-deployment .t-codex-slot small{font-size:clamp(11px,2.9vw,12px);line-height:1.45}
#tacticalOpsRoot .t-deployment .t-codex-counter b{font-size:12px}
#tacticalOpsRoot .t-deployment .t-codex-counter small{font-size:11px}
#tacticalOpsRoot .t-results .t-lockdown-achievement{
  display:grid;gap:7px;margin:19px 0 10px;padding:16px 17px;
  border:1px solid rgba(121,230,215,.65);border-left:4px solid #8de1cb;
  border-radius:8px;background:linear-gradient(135deg,rgba(17,65,63,.7),rgba(8,28,43,.93));
  box-shadow:0 8px 32px #0005,inset 0 1px #d5fff01c;
}
#tacticalOpsRoot .t-results .t-lockdown-achievement strong{
  color:#edfff7;font-size:clamp(17px,4.5vw,22px);line-height:1.18;letter-spacing:.025em;
}
#tacticalOpsRoot .t-results .t-lockdown-achievement>span:last-child{
  font-size:13px;color:#b9e7dc;line-height:1.45;
}
#tacticalOpsRoot .t-results .t-outcome-hero h2{
  overflow-wrap:anywhere;text-wrap:balance;
}
#tacticalOpsRoot .t-results .t-purpose-result{
  display:grid;gap:8px;min-width:0;
}
#tacticalOpsRoot .t-results .t-purpose-result p{
  margin:0;padding:11px 12px;border:1px solid rgba(100,181,204,.24);
  border-radius:6px;background:rgba(9,27,39,.55);line-height:1.55;overflow-wrap:anywhere;
}
#tacticalOpsRoot .t-results .t-purpose-result b{margin-bottom:5px}
#tacticalOpsRoot .t-results .t-result-actions{
  position:static!important;inset:auto!important;transform:none!important;
  z-index:auto!important;margin:17px 0 0;padding:15px 0 max(18px,env(safe-area-inset-bottom,0px));
  background:linear-gradient(180deg,rgba(10,29,41,.65),rgba(6,16,25,.95));
  border-top:1px solid rgba(106,202,227,.35);
  display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:9px;
}
#tacticalOpsRoot .t-results .t-result-actions .t-btn{
  min-width:0;max-width:100%;min-height:51px;white-space:normal;
  overflow-wrap:anywhere;font-size:clamp(11px,2.9vw,13px);line-height:1.35;
  padding:11px 8px;letter-spacing:.03em;
}
#tacticalOpsRoot .t-results .t-result-actions .t-btn:only-child{grid-column:1/-1}
#tacticalOpsRoot .t-results-overlay .t-results{
  box-sizing:border-box;min-height:0;overflow-y:auto;overscroll-behavior:contain;
  padding-bottom:max(22px,env(safe-area-inset-bottom,0px));
}
@media(max-width:430px){
  #tacticalOpsRoot .t-deployment.t-premium-ux .t-deploy-hero-v29{min-height:172px;padding-top:61px}
  #tacticalOpsRoot .t-deployment.t-premium-ux .t-command-nav button>strong{font-size:10px}
  #tacticalOpsRoot .t-deployment .t-codex-slots{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}
  #tacticalOpsRoot .t-deployment .t-codex-slot{padding:10px}
  #tacticalOpsRoot .t-results .t-result-actions{grid-template-columns:minmax(0,1fr)}
  #tacticalOpsRoot .t-results .t-result-actions .t-btn{width:100%}
}
@media(min-width:431px) and (max-width:620px){
  #tacticalOpsRoot .t-deployment .t-codex-slots{grid-template-columns:repeat(3,minmax(0,1fr))}
}
@media(prefers-reduced-motion:reduce){
  #tacticalOpsRoot .t-lockdown-achievement,#tacticalOpsRoot .t-lockdown-rule{animation:none!important}
}

/* AAA clarity: concise command history, priority objective and calmer fight layers. */
#tacticalOpsRoot .t-command-records {display:grid;gap:10px;padding:14px 0;margin:12px 0;border-top:1px solid rgba(110,197,222,.35)}
#tacticalOpsRoot .t-command-records>p{margin:0;padding:9px 12px;background:rgba(10,29,42,.62);border-left:2px solid rgba(116,212,233,.5);font-size:clamp(12px,3.2vw,14px);line-height:1.5}
#tacticalOpsRoot .t-command-record-details{border:1px solid rgba(107,173,196,.26);border-radius:6px;padding:0 10px;background:rgba(7,24,36,.58)}
#tacticalOpsRoot .t-command-record-details summary{min-height:44px;display:flex;align-items:center;cursor:pointer;font-size:11px;font-weight:800;letter-spacing:.04em;color:#b7d9e8}
#tacticalOpsRoot .t-command-record-details p{font-size:12px;line-height:1.5;margin:0 0 11px}
#tacticalOpsRoot .t-deployment.t-premium-ux .t-lockdown-rule{padding:11px 13px;gap:3px;margin:9px 0}
#tacticalOpsRoot .t-deployment.t-premium-ux .t-lockdown-rule strong{font-size:12px}
#tacticalOpsRoot .t-deployment.t-premium-ux .t-lockdown-rule span{font-size:12px}
#tacticalOpsRoot .t-battle .t-hold-cell.is-contest-zone{
  background:rgba(48,169,184,.045);border:1px dashed rgba(98,198,220,.25);
  color:transparent;box-shadow:none;
}
#tacticalOpsRoot .t-battle .t-hold-cell.is-lockdown-anchor{
  background:rgba(37,165,188,.15);border:2px solid rgba(114,222,239,.9);
  box-shadow:inset 0 0 0 1px rgba(35,111,126,.4),0 0 14px rgba(41,163,181,.18);
  color:#c8f9ff;font-size:10px;font-weight:900;letter-spacing:.05em;
}
#tacticalOpsRoot .t-battle .t-hold-cell.is-hold-area{
  background:rgba(47,174,200,.10);border-color:rgba(103,210,233,.65);color:#d1f5fa;
}
#tacticalOpsRoot .t-battle .t-command-cue {
  background:linear-gradient(90deg,rgba(6,18,28,.9),rgba(8,19,28,.38));
  border-left-width:2px;max-width:min(330px,calc(100% - 20px));
  padding:7px 10px;box-shadow:none;
}
#tacticalOpsRoot .t-battle .t-enemy-archetype{
  background:rgba(13,27,37,.78);border-color:rgba(133,178,195,.4);
  color:#bbd3dc;box-shadow:none;
}
#tacticalOpsRoot .t-battle .t-act.on{
  border-color:#9de8f5;box-shadow:inset 0 0 0 1px rgba(150,231,248,.35),0 0 12px rgba(57,178,207,.15)
}
@media(max-width:430px){
 #tacticalOpsRoot .t-command-records{gap:7px}
 #tacticalOpsRoot .t-battle .t-command-cue{max-width:calc(100% - 20px)}
}

/* RECOVER: distinguish the action that wins from failure and optional intel. */
#tacticalOpsRoot .t-deployment.t-premium-ux .t-recover-objective {
  padding: 14px;
  border: 1px solid rgba(124,223,243,.4);
  border-left: 3px solid #83deeb;
  background: linear-gradient(120deg,rgba(11,42,55,.9),rgba(5,19,32,.9));
}
#tacticalOpsRoot .t-recover-objective > .t-kicker {color:#a4eaf4;margin-bottom:8px;}
#tacticalOpsRoot .t-deployment.t-premium-ux .t-recover-objective > strong {
  display:block;font-size:clamp(16px,4vw,19px);line-height:1.45;
}
#tacticalOpsRoot .t-deployment.t-premium-ux .t-recover-objective > .t-recover-failure {
  margin:12px 0 0;padding-top:10px;border-top:1px solid rgba(125,201,221,.22);
  color:#d6e3eb;font-size:13px;line-height:1.5;
}
#tacticalOpsRoot .t-recover-failure > b {color:#f2c67d;font-size:11px;letter-spacing:.04em;}

/* Ordinary Field Ops only. Static, receipt-confirmed progression; no inferred rewards. */
#tacticalOpsRoot .t-results.t-field-results{
  --fr-ice:#9ce8ef;--fr-metal:#c5d9df;--fr-prestige:#e8ca8b;
  width:min(100%,38rem);max-width:38rem;padding:0 18px max(16px,env(safe-area-inset-bottom,0px));
  border:1px solid #405963;border-top:2px solid #a4dbe1;border-radius:2px;
  background:linear-gradient(125deg,#17262d 0%,#0b151c 35%,#091219 75%,#142028);
  box-shadow:inset 1px 0 #c4e7ed12,inset -1px 0 #0008,0 20px 70px #000b;
  color:var(--t-fg);text-align:left;overflow-y:auto;overflow-x:hidden;scroll-padding-block:12px;
  overscroll-behavior:contain;
}
#tacticalOpsRoot .t-field-results.is-failure{--fr-ice:#e4a193;border-top-color:#b57869}
#tacticalOpsRoot .t-field-results .t-outcome-hero{
  position:relative;isolation:isolate;margin:0 -18px;padding:18px 18px 14px;
  min-height:224px;justify-content:flex-end;border-bottom:1px solid #7da8b04d;
  background:#091219;
}
#tacticalOpsRoot .t-field-results .t-outcome-hero .t-results-plate{
  width:100%;height:100%;inset:0;opacity:1;filter:none;object-fit:cover;object-position:50% 8%;z-index:-2;
}
#tacticalOpsRoot .t-field-results .t-outcome-hero::after{
  background:linear-gradient(0deg,#0b151c 0%,#0b151cf2 12%,#09121996 37%,#09121900 66%),linear-gradient(90deg,#04101750,transparent 75%);
}
#tacticalOpsRoot .t-field-results.is-failure .t-outcome-hero .t-results-plate{filter:saturate(.65) brightness(1.15);object-position:0% 50%}
#tacticalOpsRoot .t-field-results.is-failure .t-outcome-hero::after{
  background:linear-gradient(0deg,#0b151c 0%,#171619ed 16%,#24131652 55%,#20101712);
}
#tacticalOpsRoot .t-field-results .t-outcome-stamp{
  position:absolute;top:13px;left:18px;right:18px;display:flex;align-items:center;gap:8px;
  font:700 9px/1.4 var(--t-font-sans);letter-spacing:.18em;color:#c0d5db;
}
#tacticalOpsRoot .t-field-results .t-outcome-stamp>span{color:var(--fr-ice);letter-spacing:-.08em}
#tacticalOpsRoot .t-field-results .t-outcome-hero .t-kicker{margin-top:104px;color:#b7d5df;font-size:10px;letter-spacing:.18em}
#tacticalOpsRoot .t-field-results .t-outcome-hero .t-title{
  font-size:clamp(27px,7.8vw,38px);line-height:.98;margin:5px 0 7px;letter-spacing:.025em;color:#f2fbff;
  text-shadow:0 2px 14px #000b;text-wrap:balance;
}
#tacticalOpsRoot .t-field-results p{margin:5px 0 0;line-height:1.45;font-size:12px;color:#bdcdd6;overflow-wrap:anywhere}
#tacticalOpsRoot .t-field-results .t-fr-outcome{font-size:11px;color:#d0e0e8;max-width:44ch}
#tacticalOpsRoot .t-field-results .t-fr-outcome span{color:#adc1cb}
#tacticalOpsRoot .t-field-results .t-fr-record{
  display:flex;gap:8px;align-items:center;padding:10px 0;margin:0;border:0;border-bottom:1px solid #6a8c9838;background:none;
}
#tacticalOpsRoot .t-field-results .t-fr-record>svg{width:16px;height:16px;flex:none;color:var(--fr-ice)}
#tacticalOpsRoot .t-field-results .t-fr-record strong{font-size:10px;letter-spacing:.09em;color:#c8dce4}
#tacticalOpsRoot .t-field-results .t-fr-record p{margin:2px 0 0;font-size:11px;color:#a9bfca}
#tacticalOpsRoot .t-field-results[data-recording=confirmed] .t-fr-record>svg{color:#a8d9c5}
#tacticalOpsRoot .t-field-results .t-fr-error{margin:4px 0 0;padding:8px 0;color:#ffd0c7}
#tacticalOpsRoot .t-field-results .t-fr-earned{margin-top:12px}
#tacticalOpsRoot .t-field-results .t-fr-spotlight{display:flex;align-items:center;gap:12px;margin-bottom:11px;min-width:0}
#tacticalOpsRoot .t-field-results .t-fr-spotlight-copy{min-width:0;flex:1}
#tacticalOpsRoot .t-field-results .t-fr-insignia{
  width:54px;min-height:64px;flex:none;display:grid;place-items:center;
  clip-path:polygon(50% 0,96% 22%,96% 76%,50% 100%,4% 76%,4% 22%);
  background:linear-gradient(140deg,#86a5af 0%,#223d48 18%,#0c1c27 47%,#3a5963 82%,#aec7cd);
  color:#d9f7ff;font:800 29px/1 var(--t-font-display);text-shadow:0 2px 5px #000;
  box-shadow:inset 0 0 0 3px #8bddea38;
}
#tacticalOpsRoot .t-field-results h3{font-size:9px;letter-spacing:.14em;margin:0 0 4px;color:#a6c5d2}
#tacticalOpsRoot .t-field-results .t-fr-achievement{display:block;font:800 clamp(17px,4.5vw,24px)/1.15 var(--t-font-display);color:#e3f7fa;overflow-wrap:anywhere}
#tacticalOpsRoot .t-field-results[data-milestone=confirmed] .t-fr-achievement{color:var(--fr-prestige)}
#tacticalOpsRoot .t-field-results[data-milestone=confirmed] .t-fr-insignia{
  color:#fff0ce;background:linear-gradient(140deg,#f0d6a0,#675940 18%,#262a2a 47%,#8e7853 82%,#e5c993);
}
#tacticalOpsRoot .t-field-results[data-milestone=confirmed] .t-fr-spotlight{padding-block:4px}
#tacticalOpsRoot .t-field-results .t-fr-rank{margin-top:5px;display:flex;flex-wrap:wrap;align-items:baseline;gap:3px 6px}
#tacticalOpsRoot .t-field-results .t-fr-rank>span{font-size:9px;color:#a6beca;letter-spacing:.08em}
#tacticalOpsRoot .t-field-results .t-fr-rank>strong{font-size:12px;line-height:1.3;color:#d9eaf0}
#tacticalOpsRoot .t-field-results .t-fr-rank>small{flex-basis:100%;font-size:10px;line-height:1.4;color:#a9beca}
#tacticalOpsRoot .t-field-results .t-fr-rewards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));margin:0;padding-block:8px;border-block:1px solid #6586953d}
#tacticalOpsRoot .t-field-results .t-fr-rewards>div{padding:0 8px;min-width:0;border-right:1px solid #6586953d}
#tacticalOpsRoot .t-field-results .t-fr-rewards>div:first-child{padding-left:0}
#tacticalOpsRoot .t-field-results .t-fr-rewards>div:last-child{border-right:0}
#tacticalOpsRoot .t-field-results dt{font-size:10px;line-height:1.35;color:#afc4ce;overflow-wrap:anywhere}
#tacticalOpsRoot .t-field-results .t-fr-rewards dd{margin:3px 0 0;font:700 16px/1.2 var(--t-font-display);color:#d4eef4;font-variant-numeric:tabular-nums;overflow-wrap:anywhere}
#tacticalOpsRoot .t-field-results .t-fr-rewards [data-muted] dd{color:#a7b9c3;font-size:14px;font-weight:500}
#tacticalOpsRoot .t-field-results .t-fr-eligibility{font-size:11px;line-height:1.4;margin-top:6px}
#tacticalOpsRoot .t-field-results .t-fr-delta{padding-left:8px;border-left:1px solid #bea5758c;color:#d9d5c6;font-size:11px}
#tacticalOpsRoot .t-field-results .t-fr-consequence{margin-top:12px;padding:0 0 0 10px;border-left:2px solid #719caa;background:none}
#tacticalOpsRoot .t-field-results .t-fr-consequence>.t-kicker,#tacticalOpsRoot .t-field-results .t-fr-next>.t-kicker{font-size:9px;letter-spacing:.14em;color:#9bbdcb}
#tacticalOpsRoot .t-field-results .t-fr-consequence>strong,#tacticalOpsRoot .t-field-results .t-fr-next>strong{display:block;margin-top:3px;font-size:13px;line-height:1.3;color:#e2f0f6}
#tacticalOpsRoot .t-field-results .t-fr-next{padding-top:12px}
#tacticalOpsRoot .t-field-results .t-fr-next p{font-size:11px;line-height:1.4}
#tacticalOpsRoot .t-field-results .t-fr-forge ul{list-style:none;margin:6px 0;padding:0}
#tacticalOpsRoot .t-field-results .t-fr-forge li{margin:5px 0;font-size:12px;overflow-wrap:anywhere}
#tacticalOpsRoot .t-field-results .t-fr-forge small{display:block;color:#bdcdd6}
#tacticalOpsRoot .t-field-results .t-fr-forge .t-btn{min-height:44px;margin-top:4px}
#tacticalOpsRoot .t-field-results .t-result-actions{margin:12px 0 0;grid-template-columns:minmax(0,1fr);background:none;padding:0 0 12px;gap:7px}
#tacticalOpsRoot .t-field-results .t-result-actions .t-btn{min-height:44px;white-space:normal;overflow-wrap:anywhere}
#tacticalOpsRoot .t-field-results .t-result-actions .t-btn-primary{min-height:48px;border-color:#8fcbd9;color:#ecfcff;background:linear-gradient(175deg,#294957,#172e3c 45%,#102330 55%,#23424e);box-shadow:inset 0 1px #d1f5ff38,inset 0 -2px #020c14,0 3px 12px #0004}
#tacticalOpsRoot .t-field-results .t-result-actions .t-btn:not(.t-btn-primary){border-color:#6585954d;background:none;color:#bdced8}
#tacticalOpsRoot .t-field-results .t-fr-details{border-top:1px solid #6586953d}
#tacticalOpsRoot .t-field-results .t-fr-details>details{margin:0;border:0;border-bottom:1px solid #344c5c;border-radius:0;background:none;padding:0}
#tacticalOpsRoot .t-field-results summary{min-height:48px;display:list-item;align-content:center;padding:12px 6px;color:#c0d5df;font-size:12px;line-height:1.5;cursor:pointer;overflow-wrap:anywhere}
#tacticalOpsRoot .t-field-results details[open]{padding-bottom:12px}
#tacticalOpsRoot .t-field-results :is(button,summary):focus-visible{outline:2px solid #c6f3ff;outline-offset:-3px}
#tacticalOpsRoot .t-field-results .t-fr-details .t-panel{margin-top:10px}
@media(max-width:350px){
  #tacticalOpsRoot .t-field-results .t-outcome-hero{min-height:205px}
  #tacticalOpsRoot .t-field-results .t-outcome-hero .t-kicker{margin-top:84px}
  #tacticalOpsRoot .t-field-results .t-fr-insignia{width:44px;min-height:54px;font-size:24px}
  #tacticalOpsRoot .t-field-results .t-fr-spotlight{gap:9px}
}

/* Optional special modes: compact confirmed outcome; full evidence on demand. */
#tacticalOpsRoot .t-special-field-results .t-outcome-hero{min-height:182px}
#tacticalOpsRoot .t-special-field-results .t-outcome-hero .t-kicker{margin-top:66px}
#tacticalOpsRoot .t-special-field-results .t-outcome-hero .t-title{font-size:clamp(23px,6.5vw,33px)}
#tacticalOpsRoot .t-special-achievement{margin:13px 0 4px;padding:13px 14px;border:1px solid #6d9d9f;background:linear-gradient(120deg,#133136,#091923)}
#tacticalOpsRoot .t-special-achievement>strong{display:block;margin:6px 0;font:800 clamp(16px,4.5vw,22px)/1.2 var(--t-font-display);color:#e5f7f4}
#tacticalOpsRoot .t-special-achievement .t-kicker{font-size:10px;letter-spacing:.12em}
#tacticalOpsRoot .t-special-field-results[data-milestone=confirmed] .t-special-achievement{border-color:#a78d62;background:linear-gradient(120deg,#322c20,#101b22)}
#tacticalOpsRoot .t-special-field-results[data-milestone=confirmed] .t-special-achievement>strong{color:#f1d7a6}
#tacticalOpsRoot .t-special-field-results .t-fr-next{padding-top:11px}
#tacticalOpsRoot .t-special-field-results .t-fr-details{margin-top:2px}
#tacticalOpsRoot .t-special-field-results .t-fr-details>details>summary{font-weight:700}
#tacticalOpsRoot .t-special-field-results .t-fr-details>details[open]{padding:12px 0}
#tacticalOpsRoot .t-special-field-results .t-fr-details .t-field-feedback{margin:6px 0}
#tacticalOpsRoot .t-special-field-results .t-special-balance{padding:10px;border:1px solid #466877;background:#0c2530}

/* After Action Impact V1 — one receipt-confirmed breakthrough, one next decision.
   Ordinary Field Ops only. No global modal, campaign, legacy or special-mode changes. */
#tacticalOpsRoot .t-field-results:not(.t-special-field-results) .t-outcome-hero{
  min-height:155px;padding-bottom:12px;
}
#tacticalOpsRoot .t-field-results:not(.t-special-field-results) .t-outcome-hero .t-kicker{
  margin-top:54px;
}
#tacticalOpsRoot .t-field-results:not(.t-special-field-results) .t-outcome-hero .t-title{
  font-size:clamp(25px,7.2vw,35px);line-height:1.04;
}
#tacticalOpsRoot .t-field-results:not(.t-special-field-results) .t-fr-record{
  padding-block:8px;
}
#tacticalOpsRoot .t-field-results:not(.t-special-field-results)[data-recording=confirmed] .t-fr-record p{
  display:none;
}
#tacticalOpsRoot .t-field-results:not(.t-special-field-results) .t-fr-impact{
  position:relative;isolation:isolate;overflow:hidden;margin:12px 0 0;
  padding:14px 15px 15px;border:1px solid #6eaab5;
  border-left:3px solid #ace9ef;border-radius:3px;
  background:linear-gradient(122deg,#163a43 0%,#0c2631 48%,#0a1922 100%);
  box-shadow:inset 0 1px #c5f6ff23,0 8px 25px #0004;
}
#tacticalOpsRoot .t-field-results:not(.t-special-field-results) .t-fr-impact::after{
  content:"";position:absolute;right:-22px;top:-35px;width:145px;height:145px;
  border:1px solid #9bdde51b;border-radius:50%;
  box-shadow:0 0 0 22px #86cad00b,0 0 0 44px #86cad008;
  pointer-events:none;z-index:-1;
}
#tacticalOpsRoot .t-field-results .t-fr-impact-overline{
  display:block;margin-bottom:5px;font:700 9px/1.4 var(--t-font-sans);
  letter-spacing:.16em;color:#a4cbd6;
}
#tacticalOpsRoot .t-field-results .t-fr-impact-overline span{
  color:#b9f5fc;margin-right:5px;
}
#tacticalOpsRoot .t-field-results .t-fr-impact-title{
  display:block;max-width:29ch;margin:0;
  font:800 clamp(18px,4.8vw,25px)/1.13 var(--t-font-display);
  letter-spacing:.025em;text-wrap:balance;color:#ecfbff;
}
#tacticalOpsRoot .t-field-results .t-fr-impact p{
  position:relative;max-width:56ch;margin-top:7px;
  font-size:12px;line-height:1.5;color:#d4e8ed;
}
#tacticalOpsRoot .t-field-results .t-fr-impact[data-impact-kind=milestone]{
  border-color:#b99d66;border-left-color:#f7dca0;
  background:linear-gradient(120deg,#3b3424,#19272c 62%,#0b1a24);
}
#tacticalOpsRoot .t-field-results .t-fr-impact[data-impact-kind=milestone] .t-fr-impact-title{color:#ffe7b0}
#tacticalOpsRoot .t-field-results .t-fr-impact[data-impact-kind=secured]{
  border-color:#6d928d;border-left-color:#a0e2c8;
  background:linear-gradient(110deg,#173632,#13262b,#0a1720);
}
#tacticalOpsRoot .t-field-results .t-fr-impact[data-impact-kind=recorded]{
  border-color:#526b75;border-left-color:#86a2ad;
  background:linear-gradient(110deg,#192a32,#101e26);
}
#tacticalOpsRoot .t-field-results:not(.t-special-field-results) .t-fr-next{
  margin-top:11px;padding:0 1px;
}
#tacticalOpsRoot .t-field-results:not(.t-special-field-results) .t-fr-next>strong{
  font-size:15px;color:#eaf7fb;
}
#tacticalOpsRoot .t-field-results:not(.t-special-field-results) .t-fr-next p{
  font-size:11px;line-height:1.38;margin-top:3px;
}
#tacticalOpsRoot .t-field-results:not(.t-special-field-results) .t-result-actions{
  margin-top:9px;padding-bottom:10px;
}
#tacticalOpsRoot .t-field-results:not(.t-special-field-results) .t-result-actions .t-btn-primary{
  min-height:50px;border-color:#a1dce5;
  box-shadow:inset 0 1px #d1f5ff4b,inset 0 -2px #020c14,0 5px 16px #0005;
}
#tacticalOpsRoot .t-field-results .t-fr-ledger{
  margin:2px 0 0;border-top:1px solid #65869540;
}
#tacticalOpsRoot .t-field-results .t-fr-ledger>summary{
  display:flex;justify-content:space-between;align-items:center;gap:10px;
  min-height:48px;padding:10px 3px;list-style:none;
  font-size:10px;font-weight:800;letter-spacing:.12em;color:#c6e4ec;
}
#tacticalOpsRoot .t-field-results .t-fr-ledger>summary::-webkit-details-marker{display:none}
#tacticalOpsRoot .t-field-results .t-fr-ledger>summary::after{
  content:"+";font:600 18px/1 var(--t-font-sans);color:#9ccbd5;
}
#tacticalOpsRoot .t-field-results .t-fr-ledger[open]>summary::after{content:"−"}
#tacticalOpsRoot .t-field-results .t-fr-ledger>summary small{
  margin-left:auto;font-size:10px;font-weight:400;letter-spacing:0;color:#9db9c4;
}
#tacticalOpsRoot .t-field-results .t-fr-ledger .t-fr-earned{
  margin-top:2px;padding:12px 0;border-top:1px solid #6586953d;
}
#tacticalOpsRoot .t-field-results:not(.t-special-field-results) .t-fr-details{
  margin-top:2px;
}
@media(max-width:350px){
  #tacticalOpsRoot .t-field-results:not(.t-special-field-results) .t-outcome-hero{min-height:142px}
  #tacticalOpsRoot .t-field-results:not(.t-special-field-results) .t-outcome-hero .t-kicker{margin-top:43px}
  #tacticalOpsRoot .t-field-results .t-fr-impact{padding:11px 12px 12px}
  #tacticalOpsRoot .t-field-results .t-fr-ledger>summary small{font-size:9px;max-width:14ch}
}
@media(prefers-reduced-motion:no-preference){
  #tacticalOpsRoot .t-field-results .t-result-actions .t-btn-primary {
    transition:border-color .15s ease;
  }
}
#tacticalOpsRoot .t-results .t-fr-replay {
  min-height:44px;margin-top:8px;padding-inline:5px;background:none;border:0;
  color:#c1d5df;text-decoration:underline;text-underline-offset:3px;
}

/* Player Voice V1: visual weight follows an actual gameplay consequence. */
#tacticalOpsRoot .t-field-results .t-fr-impact[data-impact-beat="step"]{
  border-color:#526d78;border-left-color:#8ba8b4;
  background:linear-gradient(115deg,#172b33,#0c1b23 70%);
  box-shadow:inset 0 1px #d8eff018;
}
#tacticalOpsRoot .t-field-results .t-fr-impact[data-impact-beat="step"] .t-fr-impact-title{
  color:#d6e7eb;font-size:clamp(16px,4.5vw,22px);
}
#tacticalOpsRoot .t-field-results .t-fr-impact[data-impact-beat="breakthrough"]{
  border-color:#89d8e4;border-left-color:#caf7ff;
  background:linear-gradient(118deg,#1c4852,#0f3440 45%,#09212c);
  box-shadow:inset 0 1px #dafaff4a,0 0 22px #74cce017,0 10px 25px #0005;
}
#tacticalOpsRoot .t-field-results .t-fr-impact[data-impact-beat="breakthrough"] .t-fr-impact-title{
  color:#f3ffff;
}
#tacticalOpsRoot .t-field-results .t-fr-impact[data-impact-beat="clear"]{
  border-color:#7aa897;border-left-color:#a8e3cd;
  background:linear-gradient(116deg,#1b3935,#0d2b31 54%,#0b1a25);
}
#tacticalOpsRoot .t-field-results .t-fr-impact[data-impact-beat="clear"] .t-fr-impact-title{
  color:#d5ffe7;
}

/* Engine-observed memory uses a quieter line than the receipt and next CTA. */
#tacticalOpsRoot .t-field-results .t-fr-tactical-moment {
  margin: 0;
  padding: .55rem .7rem;
  border-left: 2px solid #7d9da8;
  color: #d4e4e9;
  font-size: .75rem;
  line-height: 1.4;
}
#tacticalOpsRoot .t-fr-tactical-moment b {
  display: block;
  color: #a7c5cf;
  font-size: .65rem;
  letter-spacing: .06em;
}

#tacticalOpsRoot .t-results [data-next-decision="primary"] {
  min-height: 44px;
  white-space: normal;
  overflow-wrap: anywhere;
}
#tacticalOpsRoot .t-results .t-result-actions:has([data-next-decision]) .t-btn {
  min-height: 44px;
}


/* Victory Experience V2: ordinary Field Ops only; restrained motion and receipt-owned data. */
#tacticalOpsRoot .t-field-results:not(.t-special-field-results):not([data-reach-reward=true]){padding-inline:18px}
#tacticalOpsRoot .t-field-results:not(.t-special-field-results) .t-fr-triumph{
  min-height:138px;margin-inline:-18px;padding:12px 18px 10px;border-bottom-color:#80b9c082;
}
#tacticalOpsRoot .t-field-results .t-fr-triumph::before{
  content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;
  background:radial-gradient(ellipse 65% 75% at 78% 62%,#84dce526,transparent 75%);
}
#tacticalOpsRoot .t-field-results .t-fr-triumph .t-kicker{margin-top:47px;letter-spacing:.12em;font-size:10px;color:#deedf1}
#tacticalOpsRoot .t-field-results .t-fr-triumph .t-title{
  font-size:clamp(31px,9vw,42px);margin:2px 0 4px;letter-spacing:.055em;
  text-shadow:0 1px 2px #020b12,0 0 20px #7de8f44a;
}
#tacticalOpsRoot .t-field-results .t-fr-triumph-emblem{
  position:absolute;top:10px;right:14px;width:40px;height:40px;display:grid;place-items:center;
  border:1px solid #b7e9e778;background:linear-gradient(145deg,#18414a,#0a1d2a);
  box-shadow:0 0 20px #7ddeeb22;
  clip-path:polygon(50% 0%,91% 15%,91% 67%,50% 100%,9% 67%,9% 15%);
}
#tacticalOpsRoot .t-field-results .t-fr-triumph-emblem svg{width:23px;height:23px;color:#c9f6f7;stroke-width:1.7}
#tacticalOpsRoot .t-field-results:not(.t-special-field-results) .t-fr-record{padding-block:7px;min-height:35px}
#tacticalOpsRoot .t-field-results:not(.t-special-field-results) .t-fr-consequence:not(.t-fr-impact):not(.t-fr-forge){margin-top:9px}
#tacticalOpsRoot .t-field-results .t-fr-payout-grid{
  display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:7px;
}
#tacticalOpsRoot .t-field-results .t-fr-reward-unit{
  display:flex;align-items:center;gap:9px;min-width:0;min-height:64px;padding:10px 11px;
  border:1px solid #608f9c8e;border-radius:3px;
  background:linear-gradient(126deg,#193845,#0c212c 80%);box-shadow:inset 0 1px #d5f7ff22;
}
#tacticalOpsRoot .t-field-results .t-fr-reward-unit[data-reward=bones]{
  border-color:#9b86596b;background:linear-gradient(126deg,#352e24,#1b2428 85%);
}
#tacticalOpsRoot .t-field-results .t-fr-reward-unit>svg{width:21px;height:21px;flex:none;color:#9de9f0;stroke-width:1.7}
#tacticalOpsRoot .t-field-results .t-fr-reward-unit[data-reward=bones]>svg{color:#ead19b}
#tacticalOpsRoot .t-field-results .t-fr-reward-unit>span{display:flex;min-width:0;flex-direction:column;gap:2px}
#tacticalOpsRoot .t-field-results .t-fr-reward-unit strong{
  font:800 clamp(21px,6vw,29px)/1.04 var(--t-font-display);color:#f2fdff;
  font-variant-numeric:tabular-nums;overflow-wrap:anywhere;
}
#tacticalOpsRoot .t-field-results .t-fr-reward-unit small{
  font-size:10px;line-height:1.2;font-weight:700;letter-spacing:.12em;color:#a9cbd2;
}
#tacticalOpsRoot .t-field-results .t-fr-reward-unit[data-reward=bones] small{color:#decba6}
#tacticalOpsRoot .t-field-results:not(.t-special-field-results) .t-fr-impact{margin-top:9px;padding:11px 12px 12px}
#tacticalOpsRoot .t-field-results .t-fr-impact-title{font-size:clamp(17px,5vw,23px)}
#tacticalOpsRoot .t-field-results .t-fr-pressure-change{
  display:flex;align-items:center;flex-wrap:wrap;gap:6px;margin-top:8px;
  color:#d8f4f4;font:700 10px/1.3 var(--t-font-sans);
}
#tacticalOpsRoot .t-field-results .t-fr-pressure-change>span{
  display:inline-flex;align-items:baseline;gap:6px;padding:5px 7px;
  border:1px solid #91b5be68;background:#081f29a8;
}
#tacticalOpsRoot .t-field-results .t-fr-pressure-change strong{
  font:800 17px/1 var(--t-font-display);font-variant-numeric:tabular-nums;color:#eefcfd;
}
#tacticalOpsRoot .t-field-results .t-fr-pressure-change svg{width:13px;height:13px;flex:none;color:#b0ddd9}
#tacticalOpsRoot .t-field-results .t-fr-impact[data-impact-beat=clear] .t-fr-pressure-change>span:last-child{border-color:#9bdab0}
#tacticalOpsRoot .t-field-results:not(.t-special-field-results) .t-fr-forge{
  margin-top:9px;padding:11px 12px 12px;
  border:1px solid #6e818878;border-left:3px solid #c8b68a;
  border-radius:3px;background:linear-gradient(130deg,#252b2d,#111f27 66%,#101921);
}
#tacticalOpsRoot .t-field-results .t-fr-forge-head{display:flex;align-items:center;gap:10px;margin-top:7px;min-width:0}
#tacticalOpsRoot .t-field-results .t-fr-forge-symbol{
  display:grid;place-items:center;width:42px;height:42px;flex:none;
  border:1px solid #ab9b7e88;background:linear-gradient(145deg,#493f31,#182830);color:#eddbad;
}
#tacticalOpsRoot .t-field-results .t-fr-forge-symbol svg{width:24px;height:24px;stroke-width:1.6}
#tacticalOpsRoot .t-field-results .t-fr-forge-symbol{position:relative;overflow:hidden;isolation:isolate}
#tacticalOpsRoot .t-field-results .t-fr-forge-symbol .t-fr-forge-item-art{
  position:absolute;inset:2px;width:calc(100% - 4px);height:calc(100% - 4px);
  object-fit:contain;display:block;filter:drop-shadow(0 1px 3px #0009)
}
#tacticalOpsRoot .t-field-results .t-fr-forge-symbol .t-fr-forge-item-art[hidden]{display:none}
#tacticalOpsRoot .t-field-results .t-fr-forge-symbol[data-rarity=uncommon]{border-color:#8ab99a99}
#tacticalOpsRoot .t-field-results .t-fr-forge-symbol[data-rarity=rare]{border-color:#76a9dbaa}
#tacticalOpsRoot .t-field-results .t-fr-forge-symbol[data-rarity=epic]{border-color:#bb91ecaa}
#tacticalOpsRoot .t-field-results .t-fr-forge-symbol[data-rarity=legendary]{border-color:#d4af6dbb}
#tacticalOpsRoot .t-field-results .t-fr-forge-identity{display:flex;flex-direction:column;gap:4px;min-width:0}
#tacticalOpsRoot .t-field-results .t-fr-forge-identity>strong{
  display:block;font:800 clamp(14px,4.4vw,18px)/1.2 var(--t-font-display);
  color:#fff1d4;overflow-wrap:anywhere;
}
#tacticalOpsRoot .t-field-results .t-fr-forge-readiness{font:700 10px/1.3 var(--t-font-sans);letter-spacing:.08em;color:#d7c5a3}
#tacticalOpsRoot .t-field-results .t-fr-forge[data-materials=ready] .t-fr-forge-readiness{color:#b9f3d2}
#tacticalOpsRoot .t-field-results .t-fr-forge ul{margin:8px 0 6px;display:grid;gap:0}
#tacticalOpsRoot .t-field-results .t-fr-forge li{margin:0;padding:5px 0;border-top:1px solid #9cb5bb24;font-size:11px}
#tacticalOpsRoot .t-field-results .t-fr-forge li>span{
  display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:3px 8px;
}
#tacticalOpsRoot .t-field-results .t-fr-forge li b{font-variant-numeric:tabular-nums;color:#e8eff1}
#tacticalOpsRoot .t-field-results .t-fr-forge li small{margin-top:2px;font-size:10px}
#tacticalOpsRoot .t-field-results .t-fr-forge li[data-ready=yes] b{color:#bcecd5}
#tacticalOpsRoot .t-field-results .t-fr-forge .t-btn{width:100%;min-height:44px;margin-top:7px;border-color:#a89b7a7a}
#tacticalOpsRoot .t-field-results:not(.t-special-field-results) .t-fr-next{margin-top:8px;padding:0 2px}
#tacticalOpsRoot .t-field-results:not(.t-special-field-results) .t-result-actions{margin-top:7px;padding-bottom:7px}
#tacticalOpsRoot .t-field-results:not(.t-special-field-results) .t-result-actions .t-btn-primary{
  min-height:50px;border-color:#c0eff2;background:linear-gradient(170deg,#325c68,#173943 60%,#122932);
}
@media(max-width:350px){
  #tacticalOpsRoot .t-field-results:not(.t-special-field-results) .t-fr-triumph{min-height:125px}
  #tacticalOpsRoot .t-field-results .t-fr-triumph .t-kicker{margin-top:37px}
  #tacticalOpsRoot .t-field-results .t-fr-reward-unit{gap:6px;min-height:58px;padding:8px}
  #tacticalOpsRoot .t-field-results .t-fr-reward-unit>svg{width:18px;height:18px}
}
@media(prefers-reduced-motion:no-preference){
  #tacticalOpsRoot .t-field-results.is-victory .t-fr-triumph-emblem{animation:fr-v2-crest .56s ease-out both}
  #tacticalOpsRoot .t-field-results.is-victory .t-fr-triumph .t-title{animation:fr-v2-title .52s ease-out .09s both}
  #tacticalOpsRoot .t-field-results.is-victory[data-recording=confirmed] .t-fr-payout-grid{animation:fr-v2-reveal .46s ease-out .24s both}
  #tacticalOpsRoot .t-field-results.is-victory[data-recording=confirmed] .t-fr-impact{animation:fr-v2-reveal .46s ease-out .36s both}
  #tacticalOpsRoot .t-field-results.is-victory[data-recording=confirmed] .t-fr-forge{animation:fr-v2-reveal .46s ease-out .46s both}
}
@keyframes fr-v2-crest{from{opacity:.15;transform:translateY(7px) scale(.94)}to{opacity:1;transform:none}}
@keyframes fr-v2-title{from{opacity:.45;transform:translateY(7px)}to{opacity:1;transform:none}}
@keyframes fr-v2-reveal{from{opacity:.3;transform:translateY(5px)}to{opacity:1;transform:none}}
@media(prefers-reduced-motion:reduce){
  #tacticalOpsRoot .t-field-results .t-fr-triumph-emblem,
  #tacticalOpsRoot .t-field-results .t-fr-triumph .t-title,
  #tacticalOpsRoot .t-field-results .t-fr-payout-grid,
  #tacticalOpsRoot .t-field-results .t-fr-impact,
  #tacticalOpsRoot .t-field-results .t-fr-forge{animation:none;transition:none}
}

/* Field Legacy, only shown from accepted backend settlement receipts. */
#tacticalOpsRoot .t-field-results .t-fr-legacy{padding:12px;margin-top:12px;border:1px solid #bba47885;background:linear-gradient(140deg,#342e25,#172329);border-radius:3px}
#tacticalOpsRoot .t-field-results .t-fr-legacy>.t-kicker{color:#dbc494}
#tacticalOpsRoot .t-field-results .t-fr-legacy>strong{display:block;margin-top:4px;font:800 clamp(16px,4.5vw,21px)/1.18 var(--t-font-display);color:#f2dfb6}
#tacticalOpsRoot .t-field-results .t-fr-legacy p{font-size:12px;color:#d6d3c9}
#tacticalOpsRoot .t-field-results .t-fr-legacy small{display:block;margin-top:5px;font-size:10px;color:#b9bdba}
#tacticalOpsRoot .t-field-results .t-fr-legacy-history{padding:9px 11px;background:transparent;border-color:#78909855}
#tacticalOpsRoot .t-field-results .t-fr-legacy-history>strong{font-size:13px;color:#cbd9dd}

/* Command Deck V3 — bespoke Alpha Husky presentation, no component framework. */
#tacticalOpsRoot .t-command-deck-v3{--cd-ice:#a5e8f2;--cd-line:#426476;--cd-bg:#08141d}
#tacticalOpsRoot .t-command-deck-v3 .t-wt-hero-compact{padding:11px 14px;min-height:69px;border-bottom:1px solid #4c7e8a}
#tacticalOpsRoot .t-command-deck-v3 .t-wt-hero-compact .t-wt-title{font-size:clamp(24px,6vw,34px);letter-spacing:.065em}
#tacticalOpsRoot .t-command-deck-v3 .t-wt-intro{font-size:11px}
#tacticalOpsRoot .t-command-deck-v3 .t-command-nav{margin:9px 0 11px;gap:5px}
#tacticalOpsRoot .t-command-deck-v3 .t-command-nav button{min-height:47px}
#tacticalOpsRoot .t-command-deck-v3 .t-wt-next-op{
  display:grid;grid-template-columns:minmax(0,1fr);gap:0;padding:0;overflow:hidden;
  border:1px solid rgba(var(--mission-accent),.55)!important;background:#06131c!important;
  box-shadow:inset 0 1px #cff5ff16,0 14px 38px #0008!important}
#tacticalOpsRoot .t-command-deck-v3 .t-wt-next-op .t-wt-feature-art{height:clamp(116px,22vw,196px);min-height:0;border:0;border-radius:0}
#tacticalOpsRoot .t-command-deck-v3 .t-wt-next-op .t-wt-feature-art img{object-position:center 35%;filter:saturate(.85) contrast(1.12)}
#tacticalOpsRoot .t-command-deck-v3 .t-wt-next-op .t-wt-feature-art::after{background:linear-gradient(0deg,#06131c 0%,#06131c66 26%,transparent 75%)}
#tacticalOpsRoot .t-command-deck-v3 .t-wt-next-op .t-wt-feature-copy{padding:0 15px 6px;min-width:0}
#tacticalOpsRoot .t-command-deck-v3 .t-cd-operation-label{color:var(--cd-ice);letter-spacing:.105em;font-size:10px}
#tacticalOpsRoot .t-command-deck-v3 .t-wt-next-op h2{font-size:clamp(23px,6vw,33px);line-height:1.03;margin:5px 0 7px;color:#f1f8fa;overflow-wrap:anywhere}
#tacticalOpsRoot .t-command-deck-v3 .t-wt-objective{font-size:clamp(12px,3vw,14px)!important;line-height:1.4}
#tacticalOpsRoot .t-command-deck-v3 .t-player-route-metrics{margin-top:8px}
#tacticalOpsRoot .t-command-deck-v3 .t-player-next-reason{font-size:11px;line-height:1.4;margin:6px 0}
#tacticalOpsRoot .t-command-deck-v3 .t-wt-reward-chips{display:flex;flex-wrap:wrap;gap:5px;margin-top:8px}
#tacticalOpsRoot .t-command-deck-v3 .t-wt-reward-chips span{
  border-radius:2px;white-space:normal;min-width:0;max-width:100%;padding:5px 7px;
  background:#11242dbd;border:1px solid #587c8b55;font-size:10px;line-height:1.3}
#tacticalOpsRoot .t-command-deck-v3 .t-wt-feature-cta{display:grid;gap:4px;padding:9px 15px 14px;min-width:0}
#tacticalOpsRoot .t-command-deck-v3 .t-cd-action-prompt{color:#a4c7d4;font-size:9px;font-weight:800;letter-spacing:.15em}
#tacticalOpsRoot .t-command-deck-v3 .t-wt-main-cta{width:100%;min-height:49px;display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:12px;letter-spacing:.09em}
#tacticalOpsRoot .t-command-deck-v3 .t-wt-main-cta:focus-visible,#tacticalOpsRoot .t-command-deck-v3 .t-op-selector button:focus-visible{outline:2px solid #c3f5fa;outline-offset:2px}
#tacticalOpsRoot .t-command-deck-v3 .t-wt-main-cta:not(:disabled):active{transform:translateY(1px)}
#tacticalOpsRoot .t-command-deck-v3 .t-purpose-alternatives{gap:6px;margin:8px 0}
#tacticalOpsRoot .t-command-deck-v3 .t-purpose-alternatives article{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:2px 10px;align-items:center;padding:10px 12px;background:#0a1c29d9;border:1px solid #46697966;min-width:0}
#tacticalOpsRoot .t-command-deck-v3 .t-purpose-alternatives article>p{grid-column:1/-1;grid-row:3;line-height:1.4;font-size:11px;margin:0}
#tacticalOpsRoot .t-command-deck-v3 .t-purpose-alternatives article>h3{font-size:13px;margin:0;min-width:0}
#tacticalOpsRoot .t-command-deck-v3 .t-purpose-alternatives article>.t-kicker{grid-column:1/-1;font-size:9px}
#tacticalOpsRoot .t-command-deck-v3 .t-purpose-alternatives .t-btn{grid-column:2;grid-row:2;font-size:10px;min-height:44px}
#tacticalOpsRoot .t-command-deck-v3 .t-cd-records{margin:8px 0;padding:0 10px;border:1px solid #4260707a;background:#081924b8}
#tacticalOpsRoot .t-command-deck-v3 .t-cd-records>summary{display:flex;align-items:center;justify-content:space-between;min-height:44px;gap:8px;cursor:pointer;color:#d4e8ef;font-size:11px;font-weight:800;letter-spacing:.1em}
#tacticalOpsRoot .t-command-deck-v3 .t-cd-records>summary span{color:#8dbbc8;font-size:9px;letter-spacing:.04em}
#tacticalOpsRoot .t-command-deck-v3 .t-cd-records .t-cd-record-body{padding:10px 2px 13px;border-top:1px solid #44687855}
#tacticalOpsRoot .t-command-deck-v3 .t-cd-status{gap:6px;margin:10px 0}
#tacticalOpsRoot .t-command-deck-v3 .t-cd-status .t-wt-status-card{min-width:0;min-height:76px;padding:9px 8px;background:linear-gradient(160deg,#132c37,#07151f);border-color:#52748288}
#tacticalOpsRoot .t-command-deck-v3 .t-cd-status .t-wt-status-card strong{font-size:clamp(11px,2.7vw,15px);overflow-wrap:anywhere}
#tacticalOpsRoot .t-command-deck-v3 .t-cd-status .t-wt-status-card small{font-size:10px;line-height:1.35}
#tacticalOpsRoot .t-command-deck-v3 .t-wt-current-ops{padding:10px;background:#071620e8}
#tacticalOpsRoot .t-command-deck-v3 .t-cd-current-ops .t-wt-section-head{gap:8px}
#tacticalOpsRoot .t-command-deck-v3 .t-cd-live-count{color:#a2dfe8;letter-spacing:.1em;font-size:10px}
#tacticalOpsRoot .t-command-deck-v3 .t-op-selector{gap:5px;margin-bottom:10px}
#tacticalOpsRoot .t-command-deck-v3 .t-op-selector button{min-height:47px;border:1px solid #46687984;background:#071a26;transition:border-color .14s ease,background .14s ease;min-width:0}
#tacticalOpsRoot .t-command-deck-v3 .t-op-selector button.is-selected{border-color:#97d8e7;background:linear-gradient(160deg,#1b4652,#0b2634)}
#tacticalOpsRoot .t-command-deck-v3 .t-wt-current-ops .t-wt-mission-card{grid-template-columns:minmax(0,1fr);gap:0;padding:0;overflow:hidden;border:1px solid rgba(var(--mission-accent),.48)!important}
#tacticalOpsRoot .t-command-deck-v3 .t-wt-current-ops .t-wt-mission-art{height:125px;min-height:0;border:0}
#tacticalOpsRoot .t-command-deck-v3 .t-wt-mission-body{padding:10px 12px 3px;min-width:0}
#tacticalOpsRoot .t-command-deck-v3 .t-wt-mission-head{gap:6px}
#tacticalOpsRoot .t-command-deck-v3 .t-wt-current-ops .t-wt-mission-head h3{font-size:clamp(18px,4vw,22px);line-height:1.13}
#tacticalOpsRoot .t-command-deck-v3 .t-wt-current-ops .t-wt-mission-head p{font-size:12px;line-height:1.38}
#tacticalOpsRoot .t-command-deck-v3 .t-wt-mission-meta{gap:5px;margin-top:8px}
#tacticalOpsRoot .t-command-deck-v3 .t-wt-mission-meta span{font-size:10px;line-height:1.4;padding:6px 7px}
#tacticalOpsRoot .t-command-deck-v3 .t-wt-mission-cta{padding:9px 12px 12px}
#tacticalOpsRoot .t-command-deck-v3 .t-wt-mission-cta .t-btn{min-height:48px;width:100%}
#tacticalOpsRoot .t-command-deck-v3 .t-wt-card-detail summary{min-height:44px}
@media(min-width:860px){
  #tacticalOpsRoot .t-command-deck-v3 .t-wt-next-op{grid-template-columns:42% minmax(0,1fr)}
  #tacticalOpsRoot .t-command-deck-v3 .t-wt-next-op .t-wt-feature-art{grid-row:1/3;height:100%;min-height:265px}
  #tacticalOpsRoot .t-command-deck-v3 .t-wt-next-op .t-wt-feature-copy{padding:22px 18px 2px}
  #tacticalOpsRoot .t-command-deck-v3 .t-wt-feature-cta{grid-column:2}
  #tacticalOpsRoot .t-command-deck-v3 .t-wt-current-ops .t-wt-mission-card{grid-template-columns:30% minmax(0,1fr) 145px}
  #tacticalOpsRoot .t-command-deck-v3 .t-wt-current-ops .t-wt-mission-art{height:100%;min-height:145px}
  #tacticalOpsRoot .t-command-deck-v3 .t-wt-mission-cta{align-self:center}
}
@media(max-width:380px){
  #tacticalOpsRoot .t-command-deck-v3 .t-wt-hero-compact{padding:9px}
  #tacticalOpsRoot .t-command-deck-v3 .t-wt-next-op .t-wt-feature-art{height:104px}
  #tacticalOpsRoot .t-command-deck-v3 .t-wt-next-op .t-wt-feature-copy{padding:0 11px 5px}
  #tacticalOpsRoot .t-command-deck-v3 .t-wt-feature-cta{padding:8px 11px 12px}
  #tacticalOpsRoot .t-command-deck-v3 .t-cd-status .t-wt-status-card{padding:7px 5px}
  #tacticalOpsRoot .t-command-deck-v3 .t-purpose-alternatives article{grid-template-columns:minmax(0,1fr)}
  #tacticalOpsRoot .t-command-deck-v3 .t-purpose-alternatives .t-btn{grid-column:1;grid-row:auto;width:100%}
  #tacticalOpsRoot .t-command-deck-v3 .t-purpose-alternatives article>p{grid-column:1;grid-row:auto}
}
@media(prefers-reduced-motion:reduce){
  #tacticalOpsRoot .t-command-deck-v3 *{transition:none!important;animation:none!important}
}


/* Mobile Telegram/standalone header: preserve the brand hierarchy without
   placing critical navigation under the host app's top chrome. */
@media (max-width: 600px) {
  #tacticalOpsRoot .t-command-deck-v3 .t-wt-hero-compact {
    padding-top: max(18px, env(safe-area-inset-top, 0px));
    min-height: 90px;
  }
  #tacticalOpsRoot .t-command-deck-v3 .t-wt-branding { min-width: 0; }
  #tacticalOpsRoot .t-command-deck-v3 .t-wt-hero-compact .t-wt-title {
    font-size: clamp(22px, 6vw, 29px);
    line-height: 1.12;
  }
  #tacticalOpsRoot .t-command-deck-v3 .t-wt-intro { line-height: 1.35; }
  #tacticalOpsRoot .t-command-deck-v3 .t-command-nav { margin-top: 11px; }
  #tacticalOpsRoot .t-command-deck-v3 [data-veteran-career="true"] > strong {
    display: block;
    line-height: 1.3;
    overflow-wrap: anywhere;
  }
}


/* Progression Identity V1: readable receipt-owned progress, no new mechanics. */
#tacticalOpsRoot .t-pi-career{margin:12px 0;padding:15px;border:1px solid rgba(94,195,226,.48);border-radius:9px;background:linear-gradient(125deg,rgba(16,52,67,.92),rgba(6,17,27,.96));box-shadow:inset 0 1px 0 rgba(191,238,250,.13)}
#tacticalOpsRoot .t-pi-career-head{display:flex;align-items:baseline;justify-content:space-between;gap:12px;font-size:11px;font-weight:800;letter-spacing:.11em;color:#c1e7f2}
#tacticalOpsRoot .t-pi-career-head strong{font-size:22px;letter-spacing:0;color:#fff;white-space:nowrap;font-variant-numeric:tabular-nums}
#tacticalOpsRoot .t-pi-track{height:12px;margin:12px 0 9px;border:1px solid rgba(116,191,213,.5);border-radius:3px;background:repeating-linear-gradient(90deg,rgba(21,48,61,.9) 0,rgba(21,48,61,.9) calc(8.333% - 2px),rgba(2,11,18,.98) calc(8.333% - 2px),rgba(2,11,18,.98) 8.333%);overflow:hidden}
#tacticalOpsRoot .t-pi-track>span{display:block;height:100%;background:linear-gradient(90deg,#2b92af,#7ce3f7);box-shadow:0 0 12px rgba(86,211,246,.65);transition:width .5s ease-out}
#tacticalOpsRoot .t-pi-career p{margin:6px 0;font-size:13px;font-weight:700;color:#e3f5fa}
#tacticalOpsRoot .t-pi-career small{display:block;color:#b3cbd3;font-size:12px;line-height:1.45}
@media(prefers-reduced-motion:reduce){#tacticalOpsRoot .t-pi-track>span{transition:none}}


/* Commander Progress V2: rank identity and next action, without duplicating the ledger. */
#tacticalOpsRoot .t-pi-v2-heading{display:flex;align-items:center;gap:13px;padding:4px 0 0}
#tacticalOpsRoot .t-pi-v2-medal{position:relative;flex:0 0 80px;width:80px;height:92px;display:flex;flex-direction:column;align-items:center;justify-content:center;clip-path:polygon(50% 0,93% 21%,93% 75%,50% 100%,7% 75%,7% 21%);background:linear-gradient(140deg,#5d9bab 0%,#142f43 40%,#0b1825 68%,#a2dbe8 100%);filter:drop-shadow(0 2px 5px rgba(51,172,205,.25));color:#f1fcff}
#tacticalOpsRoot .t-pi-v2-medal:before{content:"";position:absolute;inset:4px;clip-path:inherit;background:linear-gradient(150deg,#1b3b4c,#091522 72%);z-index:-1}
#tacticalOpsRoot .t-pi-v2-medal-icon{font-size:17px;color:#80d6e9;line-height:1}
#tacticalOpsRoot .t-pi-v2-medal strong{font-size:34px;line-height:1.05;font-weight:900;font-variant-numeric:tabular-nums}
#tacticalOpsRoot .t-pi-v2-medal small{font-size:8px;font-weight:900;letter-spacing:.05em}
#tacticalOpsRoot .t-pi-v2-heading-copy{min-width:0;display:grid;gap:5px}
#tacticalOpsRoot .t-pi-v2-heading-copy>strong{font-size:clamp(18px,4.5vw,24px);line-height:1.14;color:#f4fbff}
#tacticalOpsRoot .t-pi-v2-heading-copy>small{font-size:12px;color:#b7d0d8;line-height:1.4}
#tacticalOpsRoot [data-veteran-career="true"] .t-pi-v2{margin:9px 0;padding:12px 13px}
#tacticalOpsRoot [data-veteran-career="true"] .t-pi-v2 .t-pi-track{margin:9px 0 7px}
#tacticalOpsRoot .t-pi-v2-next{padding:8px 11px;border-left:3px solid #5cbcd7;background:rgba(43,109,132,.12)}
#tacticalOpsRoot .t-pi-v2-next>span{font-size:10px;font-weight:900;letter-spacing:.15em;color:#83d9f1}
#tacticalOpsRoot .t-pi-v2-next p{margin:4px 0 0;font-size:13px;line-height:1.4;color:#dcecf1}
#tacticalOpsRoot .t-pi-v2-rules{margin:7px 0 11px;color:#b5cbd4;font-size:12px}
#tacticalOpsRoot .t-pi-v2-rules summary{cursor:pointer;padding:6px 0;text-decoration:underline;text-underline-offset:3px}
#tacticalOpsRoot .t-pi-v2-rules p{margin:7px 0;line-height:1.45}
@media(max-width:380px){#tacticalOpsRoot .t-pi-v2-medal{flex-basis:68px;width:68px;height:80px}#tacticalOpsRoot .t-pi-v2-heading{gap:9px}}

/* War Table Environment & Mission Insignia V2 — approved eight-asset set.
   Keep the server-owned mission copy, reward truth, state and CTA above artwork. */
#tacticalOpsRoot .t-wt-feature-art,
#tacticalOpsRoot .t-wt-mission-art,
#tacticalOpsRoot .t-wt-campaign-environment { position:relative; isolation:isolate; overflow:hidden; background:#07121b; }
#tacticalOpsRoot .t-command-deck-v3 .t-wt-next-op .t-wt-feature-art { height:clamp(154px,33vw,235px); }
#tacticalOpsRoot .t-command-deck-v3 .t-wt-current-ops .t-wt-mission-art { height:clamp(158px,30vw,204px); }
#tacticalOpsRoot .t-wt-feature-art > .t-wt-scene,
#tacticalOpsRoot .t-wt-mission-art > .t-wt-scene,
#tacticalOpsRoot .t-wt-campaign-environment > .t-wt-scene {
 display:block;width:100%;height:100%;object-fit:cover;object-position:64% 48%;
 filter:saturate(.83) contrast(1.06);border:0;pointer-events:none;
}
#tacticalOpsRoot .t-wt-feature-art::after,
#tacticalOpsRoot .t-wt-mission-art::after {
 content:"";position:absolute;inset:0;pointer-events:none;
 background:linear-gradient(0deg,rgba(3,11,18,.9),transparent 53%,rgba(3,11,18,.10));
}
#tacticalOpsRoot .t-wt-art-label,
#tacticalOpsRoot .t-wt-mission-type { z-index:2;display:inline-flex;align-items:center;gap:7px; }
#tacticalOpsRoot .t-wt-mission-emblem {
 display:inline-block;position:relative;z-index:2;flex:none;width:29px;height:29px;
 object-fit:contain!important;filter:none!important;vertical-align:middle;pointer-events:none;
}
#tacticalOpsRoot .t-wt-mission-emblem[hidden] {display:none!important;}
#tacticalOpsRoot .t-wt-art-label .t-wt-mission-emblem {width:33px;height:33px;}
#tacticalOpsRoot .t-wt-mission-type .t-wt-mission-emblem {width:28px;height:28px;}
#tacticalOpsRoot .t-op-selector .t-wt-mission-emblem {width:24px;height:24px;}
#tacticalOpsRoot .t-command-deck-v3 .t-op-selector button {
 display:grid;grid-template-columns:24px 26px minmax(0,1fr);gap:3px 7px;align-items:center;
 text-align:left;min-height:53px;padding:8px;white-space:normal;
}
#tacticalOpsRoot .t-command-deck-v3 .t-op-selector button > span {grid-column:1;grid-row:1/3;}
#tacticalOpsRoot .t-command-deck-v3 .t-op-selector button > .t-wt-mission-emblem {grid-column:2;grid-row:1/3;}
#tacticalOpsRoot .t-command-deck-v3 .t-op-selector button > strong {grid-column:3;grid-row:1;min-width:0;overflow-wrap:anywhere;}
#tacticalOpsRoot .t-command-deck-v3 .t-op-selector button > small {grid-column:3;grid-row:2;}
#tacticalOpsRoot .t-wt-story-type {display:inline-flex;align-items:center;gap:7px;}
#tacticalOpsRoot .t-wt-story-type .t-wt-mission-emblem {width:25px;height:25px;}
#tacticalOpsRoot .t-wt-story-archive .t-story-mission.is-locked {filter:saturate(.65);border-color:#6b80914a;}
#tacticalOpsRoot .t-story-mission.is-locked .t-wt-mission-emblem {opacity:.55;}
#tacticalOpsRoot .t-story-mission.is-cleared .t-wt-mission-emblem {opacity:.86;}
#tacticalOpsRoot .t-wt-campaign-environment {height:clamp(105px,25vw,176px);margin-bottom:10px;border:1px solid #8a56664a;border-radius:4px;}
#tacticalOpsRoot .t-wt-campaign-environment::after {content:"";position:absolute;inset:0;background:linear-gradient(0deg,#08131bd8,transparent 70%);pointer-events:none;}
#tacticalOpsRoot .t-wt-mission-state[data-availability="secured"] {color:#b9eacb;border-color:#80cba06c;}
#tacticalOpsRoot .t-wt-mission-state[data-availability="available"] {color:#a9e9fa;}
#tacticalOpsRoot .t-deploy-hero-v29 > .t-wt-scene {
 position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:64% 50%;
 filter:saturate(.79) contrast(1.08);pointer-events:none;
}
#tacticalOpsRoot .t-wt-brief-emblem {position:absolute;top:13px;right:13px;z-index:2;display:block;pointer-events:none;}
#tacticalOpsRoot .t-wt-brief-emblem .t-wt-mission-emblem {width:37px;height:37px;}
#tacticalOpsRoot .t-deploy-hero-v29 .t-deploy-hero-copy {position:relative;z-index:2;}
@media(max-width:430px){
 #tacticalOpsRoot .t-command-deck-v3 .t-wt-next-op .t-wt-feature-art {height:clamp(146px,44vw,178px);}
 #tacticalOpsRoot .t-command-deck-v3 .t-wt-current-ops .t-wt-mission-art {height:155px;}
 #tacticalOpsRoot .t-wt-brief-emblem {top:9px;right:9px;}
 #tacticalOpsRoot .t-wt-brief-emblem .t-wt-mission-emblem {width:30px;height:30px;}
}
@media(prefers-reduced-motion:reduce){
 #tacticalOpsRoot .t-wt-mission-emblem,#tacticalOpsRoot .t-wt-scene{animation:none!important;transition:none!important;}
}

/* Compact Mission selector V2: never wrap individual title letters on narrow phones. */
@media(max-width:620px){
 #tacticalOpsRoot .t-command-deck-v3 .t-op-selector button {
  grid-template-columns:18px minmax(0,1fr);grid-template-rows:auto auto;
  gap:3px 5px;padding:6px 5px;
 }
 #tacticalOpsRoot .t-command-deck-v3 .t-op-selector button > span {
  grid-column:1;grid-row:1;font-size:9px;align-self:center;
 }
 #tacticalOpsRoot .t-command-deck-v3 .t-op-selector button > .t-wt-mission-emblem {
  grid-column:1;grid-row:2;width:18px;height:18px;
 }
 #tacticalOpsRoot .t-command-deck-v3 .t-op-selector button > strong {
  grid-column:2;grid-row:1;font-size:clamp(9px,2.25vw,11px);
  line-height:1.22;letter-spacing:0;overflow-wrap:normal;word-break:normal;hyphens:none;
 }
 #tacticalOpsRoot .t-command-deck-v3 .t-op-selector button > small {
  grid-column:2;grid-row:2;font-size:9px;letter-spacing:0;overflow-wrap:normal;
 }
}

/* Tactical Overhead Projection V1
   Global shared presentation for Legacy 8x5 and VNext 10x7.
   Three approved authored arena artworks are registered by mission family.
   The source artwork is portrait-native and is not stretched or painted with
   gameplay grids. Shared camera anchors are derived from fieldPercent().
   No overlays claim functional cover, elevation, blocked terrain or new rules. */
#tacticalOpsRoot .t-battle[data-projection="relay-overhead-v1"] {
  --tops-projection-snow: rgba(186, 218, 234, .27);
  --tops-projection-ink: rgba(4, 14, 23, .60);
}
#tacticalOpsRoot .t-battle[data-projection="relay-overhead-v1"] .t-field-art {
  object-position: 50% 50%;
  filter: saturate(.82) brightness(1.00) contrast(1.01);
}
#tacticalOpsRoot .t-battle[data-projection="relay-overhead-v1"] .t-field-grade {
  background:
    linear-gradient(180deg, rgba(4,13,22,.40), transparent 20%, transparent 76%, rgba(4,13,22,.53)),
    radial-gradient(ellipse 80% 74% at 50% 49%, rgba(66,113,136,.045), transparent 76%);
}
#tacticalOpsRoot .t-battle[data-projection="relay-overhead-v1"] .t-grid i {
  width: 9px;
  height: 9px;
  border: 1px solid rgba(182,219,235,.31);
  background: rgba(106,186,215,.035);
  opacity: .78;
}
/* The projected cell is already the token and input anchor; subtle grounding
   must not translate any hitbox or compete with the live threat layer. */
#tacticalOpsRoot .t-battle[data-projection="relay-overhead-v1"] .t-token .t-ring {
  opacity: .90;
}
#tacticalOpsRoot .t-battle[data-projection="relay-overhead-v1"] .t-token.active .t-ring {
  opacity: 1;
}
@media (prefers-reduced-motion: reduce) {
  #tacticalOpsRoot .t-battle[data-projection="relay-overhead-v1"] .t-grid i {
    animation: none !important;
  }
}

/* Authoritative 9:16 battlefield art is never warped into a landscape canvas.
   The backdrop is decorative; combat overlays always use full field anchors.
   Keep the same portrait art on wider screens until a real wide master exists. */
#tacticalOpsRoot[data-layout="wide"] .t-battle[data-projection="relay-overhead-v1"] .t-field-art {
  object-fit: cover;
  object-position: 50% 48%;
}


/* Battlefield Visual Alignment V1 — grounded silhouettes, render-only.
   Projection anchors, movement, input hitboxes, objective tiles and threats
   remain untouched. Sizes are constrained by BOTH column and row pitch,
   because Alpha/CNC/SHADOW artwork is ~2:1 but HOUNDs are near square.
   The feet, ground shadow and selection ring share the canonical cell anchor.
   Container query units reference .t-field (container-type:size). */
#tacticalOpsRoot .t-battle[data-projection="relay-overhead-v1"] .t-token {
  width: 10%;
  width: min(10cqw, 49px, 10cqh);
  min-width: 0;
  max-width: none;
  transform: translate(-50%, -100%);
}
#tacticalOpsRoot .t-battle[data-projection="relay-overhead-v1"] .t-token.alpha {
  width: min(10.2cqw, 52px, 9.6cqh);
}
#tacticalOpsRoot .t-battle[data-projection="relay-overhead-v1"] .t-token.leader {
  width: min(10.2cqw, 54px, 12cqh);
}
#tacticalOpsRoot .t-battle[data-projection="relay-overhead-v1"] .t-token.hound {
  width: min(10.1cqw, 50px, 13cqh);
}

/* Preserve the authored 0.92–1.04 depth cue, but keep every foot on the cell.
   The parent .t-token already has transform-origin: 50% 100%. */
#tacticalOpsRoot .t-battle[data-projection="relay-overhead-v1"] .t-token.depth-0 { transform: translate(-50%, -100%) scale(.92); }
#tacticalOpsRoot .t-battle[data-projection="relay-overhead-v1"] .t-token.depth-1 { transform: translate(-50%, -100%) scale(.95); }
#tacticalOpsRoot .t-battle[data-projection="relay-overhead-v1"] .t-token.depth-2 { transform: translate(-50%, -100%) scale(.98); }
#tacticalOpsRoot .t-battle[data-projection="relay-overhead-v1"] .t-token.depth-3 { transform: translate(-50%, -100%) scale(1.01); }
#tacticalOpsRoot .t-battle[data-projection="relay-overhead-v1"] .t-token.depth-4 { transform: translate(-50%, -100%) scale(1.04); }

/* Ring ellipse center sits at the foot anchor for 28–52px portrait tokens. */
#tacticalOpsRoot .t-battle[data-projection="relay-overhead-v1"] .t-token .t-ring {
  bottom: -5px;
}
#tacticalOpsRoot .t-battle[data-projection="relay-overhead-v1"] .t-token.directional-alpha .t-alpha-ground-shadow {
  bottom: -1%;
  height: 6%;
}
#tacticalOpsRoot .t-battle[data-projection="relay-overhead-v1"] .t-token.directional-hound::before {
  bottom: 0;
  height: 10%;
}

/* Dense accepted VNext 10x7: keep even foreground silhouettes inside their
   adjacent column pitch; cap tall sprites by row height, not only device width. */
#tacticalOpsRoot .t-battle[data-projection="relay-overhead-v1"].battlefield-vnext-preview .t-token {
  width: min(7.6cqw, 39px, 6.7cqh);
}
#tacticalOpsRoot .t-battle[data-projection="relay-overhead-v1"].battlefield-vnext-preview .t-token.alpha {
  width: min(8cqw, 41px, 6.7cqh);
}
#tacticalOpsRoot .t-battle[data-projection="relay-overhead-v1"].battlefield-vnext-preview .t-token.leader {
  width: min(7.9cqw, 44px, 8.8cqh);
}
#tacticalOpsRoot .t-battle[data-projection="relay-overhead-v1"].battlefield-vnext-preview .t-token.hound {
  width: min(7.85cqw, 41px, 8.8cqh);
}

/* Preserve fabric and metal midtones. The small, dark foot shadow anchors
   each family independently of the focus ring and invisible hit target. */
#tacticalOpsRoot .t-battle[data-projection="relay-overhead-v1"] .t-token:is(.skirmisher,.support,.leader,.pet-actor) img.body {
  position: relative;
  filter: brightness(1.07) drop-shadow(0 -1px 1px rgba(192,207,212,.36)) drop-shadow(0 1px 1px #091017);
}
#tacticalOpsRoot .t-battle[data-projection="relay-overhead-v1"] .t-token:is(.skirmisher,.support,.leader,.pet-actor)::before {
  content: "";
  position: absolute;
  inset: auto 13% -2px;
  height: 7px;
  background: radial-gradient(ellipse, rgba(1,6,10,.76), transparent 72%);
}
#tacticalOpsRoot .t-battle[data-projection="relay-overhead-v1"] .t-token.pet-actor img.body {
  max-height: 8cqh;
  object-fit: contain;
  object-position: center bottom;
}
#tacticalOpsRoot .t-battle[data-projection="relay-overhead-v1"] .t-token.directional-alpha img.body {
  filter: brightness(1.07) drop-shadow(0 -.5px .75px rgba(205,215,220,.54));
}

/* HOUND Directional V1 — presentation-only final enemy silhouettes.
   Ground shadow and lighting do not affect the independently positioned
   hitboxes, movement tiles, intents, action events or mission outcomes. */
#tacticalOpsRoot .t-token.directional-hound {
  isolation: isolate;
}
#tacticalOpsRoot .t-token.directional-hound::before {
  content: "";
  pointer-events: none;
  position: absolute;
  z-index: -1;
  left: 16%;
  width: 68%;
  height: 11%;
  bottom: 7%;
  border-radius: 50%;
  background: radial-gradient(ellipse, rgba(0,0,0,.64), rgba(0,0,0,.09) 65%, transparent 80%);
}
#tacticalOpsRoot .t-token.directional-hound img.body {
  position: relative;
  object-fit: contain;
  filter: drop-shadow(0 5px 5px rgba(2,8,17,.86)) drop-shadow(0 0 2px rgba(241,116,104,.30));
}
/* No extra animations: existing event-driven strike and reaction rules apply. */
@media (prefers-reduced-motion: reduce) {
  #tacticalOpsRoot .t-token.directional-hound img.body {
    transition: none !important;
  }
}

/* Tight, neutral-warm separation preserves the armor material on overhead ice. */
#tacticalOpsRoot .t-battle[data-projection="relay-overhead-v1"] .t-token.hound img.body {
  position: relative;
  filter: brightness(1.13) drop-shadow(0 -.7px .8px rgba(226,205,186,.45)) drop-shadow(0 1px 1px #151017);
}
#tacticalOpsRoot .t-battle[data-projection="relay-overhead-v1"] .t-token.hound::before {
  content: "";
  position: absolute;
  inset: auto 16% -2px;
  width: auto;
  z-index: auto;
  height: 7px;
  background: radial-gradient(ellipse, rgba(1,6,10,.76), transparent 72%);
}

/* Axial MARKSMAN art uses only about half its square width. Side poses
   already occupy 92%, and their feet end 8% above the canvas edge. */
#tacticalOpsRoot .t-token.directional-hound img.body:is([src$="hound_marksman_front.webp"],[src$="hound_marksman_back.webp"]) {
  scale: 1.14;
  transform-origin: 50% 100%;
}
#tacticalOpsRoot .t-token.directional-hound img.body:is([src$="hound_marksman_left.webp"],[src$="hound_marksman_right.webp"]) {
  translate: 0 8%;
}
#tacticalOpsRoot .t-battle[data-projection="relay-overhead-v1"] .t-token.directional-hound img.body[src*="hound_marksman_"] {
  filter: brightness(1.20) drop-shadow(0 -.7px .8px rgba(235,214,191,.56)) drop-shadow(0 1px 1px #151017);
}
`;function Gl(e,t){let n=Math.max(0,Math.round(e));return n<=599?`compact`:n<=899?`standard`:`wide`}function Kl(e,t,n){let r=0;for(let i of t){let t=e?.[i]?.[n];if(t==null)return null;r+=t}return r}function ql(e){let t=e.fieldOps,n=t?.records,r=t?.fieldContracts,i=t?.commander,a=i&&i.rank>=3?t?.veteranCareer:void 0,o=Mr(e).primary,s=Or(t),c=!o?.resume&&o?.title===s?.title&&s;return{fieldAvailable:!!t,total:Kl(n,Ct,`clearCount`),objectives:[`RECOVER`,`HOLD`,`SURVIVE`,`INTERCEPT`].map(e=>({label:e,count:Kl(n,Ct.filter(t=>en[t]===e),`clearCount`)})),advanced:Kl(n,Ct,`advancedClearCount`),challenges:Kl(n,Ct,`challengeCount`),commander:i?{rank:i.rank,points:i.progress,target:i.nextRankAt}:null,veteran:a?{credits:a.credits,target:12,requirement:i?.rank===3?rn(a):null}:null,contracts:r?{completed:r.completed.length,honor:!!r.honor}:null,lockdown:!!t?.masteryPath?.firstLockdownClear,next:o?{mission:W(o.missionId)?.name??o.missionId,title:c?`Field Contract · ${s.title}`:o.title,reason:o.reason,action:o.resume?`Resume operation`:o.tier===`advanced`?`Review Advanced brief`:`View mission brief`}:null}}var Jl=`tacticalOpsRoot`,Yl=`tacticalOpsStyles`,Xl=`tacticalOpsFonts`,$={apiPost:null,tg:null,dbg:!1,root:null,isOpen:!1,reactRoot:null,keyHandlerBound:!1,resizeBound:!1,prevBodyOverflow:``,prevHtmlOverflow:``,resizeObserver:null,battleWatcher:null},Zl=Promise.resolve();try{window.__AH_TACTICAL_OPS_VER__=oo,window.__TACTICAL_COMBAT__=$a}catch{}function Ql(){let e=document.getElementById(Yl);e||(e=document.createElement(`style`),e.id=Yl,document.head.appendChild(e)),e.textContent=Wl}function $l(){if(document.getElementById(Xl))return;let e=document.createElement(`link`);e.id=Xl,e.rel=`stylesheet`,e.href=`https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Source+Sans+3:wght@400;600;700&display=swap`,document.head.appendChild(e)}function eu(){let e=$.root||document.getElementById(Jl);if(!e)return;let t=window.visualViewport,n=$.tg?.viewportStableHeight||$.tg?.viewportHeight,r=Math.max(1,Math.round(t?.width||e.clientWidth||window.innerWidth)),i=Math.max(1,Math.round(t?.height||(typeof n==`number`?n:0)||window.innerHeight)),a=Math.round(t?.offsetTop||0),o=Math.round(t?.offsetLeft||0);e.style.position=`fixed`,e.style.left=`${o}px`,e.style.top=`${a}px`,e.style.right=`auto`,e.style.bottom=`auto`,e.style.width=`${r}px`,e.style.height=`${i}px`,e.style.maxHeight=`${i}px`,e.style.setProperty(`--tops-w`,`${r}px`),e.style.setProperty(`--tops-h`,`${i}px`),e.setAttribute(`data-layout`,Gl(r,i)),tu(e,r,i)}function tu(e,t,n){let r=e.querySelector(`.t-field-wrap`);if(!r)return;let i=e.getAttribute(`data-layout`)||Gl(t,n),a=t=>{let n=e.querySelector(t);return n?Math.round(n.getBoundingClientRect().height):0},o=a(`.t-top`)+a(`.t-dock`),s=i===`wide`?Math.max(160,n):Math.max(160,n-o);e.style.setProperty(`--tops-field-h`,`${s}px`),r.style.display=`block`,r.style.width=`100%`,r.style.minWidth=`0`,r.style.overflow=`hidden`,i===`wide`?(r.style.position=`absolute`,r.style.inset=`0`,r.style.height=`100%`,r.style.minHeight=`100%`,r.style.maxHeight=`none`):(r.style.position=`relative`,r.style.inset=`auto`,r.style.flex=`1 1 auto`,r.style.height=`${s}px`,r.style.minHeight=`${s}px`,r.style.maxHeight=`${s}px`);let c=e.querySelector(`.t-field`);c&&(c.style.position=`absolute`,c.style.inset=`0`,c.style.width=`100%`,c.style.height=`100%`);let l=e.querySelector(`.t-field-art`);l&&(l.style.position=`absolute`,l.style.inset=`0`,l.style.width=`100%`,l.style.height=`100%`,l.style.objectFit=`cover`,l.style.display=`block`)}function nu(){eu()}function ru(){if(!$.resizeBound){window.addEventListener(`resize`,nu);try{window.visualViewport?.addEventListener(`resize`,nu),window.visualViewport?.addEventListener(`scroll`,nu)}catch{}try{$.resizeObserver=new ResizeObserver(nu),$.resizeObserver.observe(document.documentElement),$.root&&$.resizeObserver.observe($.root)}catch{$.resizeObserver=null}iu(),$.resizeBound=!0}}function iu(){if($.root&&!$.battleWatcher)try{$.battleWatcher=new MutationObserver(()=>{requestAnimationFrame(()=>eu())}),$.battleWatcher.observe($.root,{childList:!0,subtree:!0})}catch{$.battleWatcher=null}}function au(){if($.resizeBound){window.removeEventListener(`resize`,nu);try{window.visualViewport?.removeEventListener(`resize`,nu),window.visualViewport?.removeEventListener(`scroll`,nu)}catch{}try{$.resizeObserver?.disconnect()}catch{}$.resizeObserver=null;try{$.battleWatcher?.disconnect()}catch{}$.battleWatcher=null,$.resizeBound=!1}}function ou(){$.prevBodyOverflow=document.body.style.overflow,$.prevHtmlOverflow=document.documentElement.style.overflow,document.body.style.overflow=`hidden`,document.documentElement.style.overflow=`hidden`}function su(){document.body.style.overflow=$.prevBodyOverflow,document.documentElement.style.overflow=$.prevHtmlOverflow}var cu=`tacticalOpsBrowserExit`;function lu(){return window.AlphaBrowserGuestV1?.active===!0}function uu(){if(!$.isOpen||document.querySelector(`.tsa-dialog[aria-modal="true"]`))return;let e=Z.getState();if(e.progressionCommitPending||e.busy||e.kodaSavePending||e.shadowSavePending){window.alert(`Finish the current action before leaving Tactical Ops.`);return}let t=[e.fieldResult,e.campaignResult,e.chapterResult].some(t=>t?.runId===e.currentRunKey);if(e.screen===`results`&&e.currentRunKey&&!t){window.alert(`This mission result is not yet server-recorded. Save or retry before exiting.`);return}(e.screen!==`battle`||window.confirm(`Exit Tactical Ops? Unsaved combat actions may be lost. Your accepted run can be resumed from its saved start.`))&&xu()}function du(){if(!lu())return;let e=document.getElementById(cu);e||(e=document.createElement(`button`),e.id=cu,e.type=`button`,e.textContent=`× Exit`,e.setAttribute(`aria-label`,`Exit Tactical Ops`),e.title=`Return to Alpha Husky Dashboard`,e.style.cssText=[`position:fixed`,`top:calc(env(safe-area-inset-top, 0px) + 10px)`,`right:calc(env(safe-area-inset-right, 0px) + 10px)`,`z-index:2147483000`,`min-height:44px`,`min-width:76px`,`padding:9px 13px`,`border:1px solid #7da9c4`,`border-radius:11px`,`background:rgba(8,21,36,.96)`,`color:#edf6ff`,`font:700 14px system-ui,sans-serif`,`cursor:pointer`].join(`;`),e.addEventListener(`click`,uu),document.body.appendChild(e))}function fu(e){if(!$.isOpen||e.key!==`Escape`||document.querySelector(`.tsa-dialog[aria-modal="true"]`))return;let t=Z.getState();if(t.screen===`battle`&&t.battle.mode===`targeting`){t.cancel(),e.preventDefault(),e.stopPropagation();return}if(t.screen===`brief`){t.backToHub(),e.preventDefault(),e.stopPropagation();return}e.preventDefault(),e.stopPropagation(),xu()}function pu(){$.keyHandlerBound||(document.addEventListener(`keydown`,fu,!0),$.keyHandlerBound=!0)}function mu(){$.keyHandlerBound&&(document.removeEventListener(`keydown`,fu,!0),$.keyHandlerBound=!1)}function hu(){Ql(),$l();let e=document.getElementById(Jl);return e||(e=document.createElement(`div`),e.id=Jl,e.setAttribute(`data-open`,`0`),document.body.appendChild(e)),$.root=e,e}function gu(){$.isOpen&&Z.getState().refreshIdentity()}function _u(){document.getElementById(cu)?.remove(),$.isOpen=!1,mu(),au(),window.removeEventListener(`ah:profile-updated`,gu),su(),$.reactRoot&&($.reactRoot.unmount(),$.reactRoot=null);let e=$.root||document.getElementById(Jl);e&&(e.setAttribute(`data-open`,`0`),e.innerHTML=``);try{Z.getState().backToHub()}catch{}}function vu(){let e={close:()=>{_u()},isOpen:()=>$.isOpen},t=window;try{t.AlphaNav?.push?t.AlphaNav.push(Jl,e):(t.navRegister?.(Jl,e),t.navOpen?.(Jl))}catch{}}function yu(e){let t=e&&typeof e==`object`?e:{};typeof t.apiPost==`function`&&($.apiPost=t.apiPost),t.tg&&($.tg=t.tg),typeof t.dbg==`boolean`&&($.dbg=t.dbg);try{if($.apiPost&&typeof window<`u`){let e=window;typeof e.apiPost!=`function`&&(e.apiPost=$.apiPost)}}catch{}return t.onboarding===`session`?(Z.getState().configureOnboarding({enabled:!0}),Zl=Promise.resolve()):t.onboarding===`off`?(Z.getState().configureOnboarding({enabled:!1}),Zl=Promise.resolve()):Zl=Z.getState().loadFoundationProgression(),S({requestClose:xu,dbg:$.dbg}),Tu}async function bu(e){await Zl,Z.getState().refreshIdentity(),typeof e==`string`&&e&&Z.getState().openOperationBrief(e);let t=hu(),{FieldRecord:n,Forge:r,HomeNav:i,Inventory:a}=window;S({requestClose:xu,openInventory:typeof i?.openInventory==`function`||typeof a?.open==`function`?()=>{xu(),typeof i?.openInventory==`function`?i.openInventory():a?.open?.()}:void 0,openFieldRecord:n?.openSelf?()=>{xu(),n.openSelf?.({focusService:!0})}:void 0,forge:typeof r?.nextUpgrade==`function`&&typeof r.openUpgrade==`function`?{nextUpgrade:()=>r.nextUpgrade(),openUpgrade:e=>{xu(),r.openUpgrade(e)}}:void 0,dbg:$.dbg}),$.isOpen=!0,t.setAttribute(`data-open`,`1`),ou(),pu(),ru(),window.addEventListener(`ah:profile-updated`,gu),eu(),$.reactRoot||($.reactRoot=(0,b.createRoot)(t)),$.reactRoot.render((0,y.createElement)(Ul)),vu(),du();try{$.tg?.expand?.()}catch{}requestAnimationFrame(()=>eu()),setTimeout(()=>eu(),50)}function xu(){if(!$.isOpen)return;let e=window;try{if(e.AlphaNav?.close?.(Jl,{source:`tactical-ops-close`}))return}catch{}_u();try{e.navClose?.(Jl)}catch{}}function Su(){return{...ws(),open:$.isOpen,version:oo}}async function Cu(){await Zl;let{progression:e,progressionStatus:t}=Z.getState();if(t!==`ready`||!e)throw Error(`Service record unavailable`);return ql(e)}async function wu(){await Zl,await Z.getState().loadFoundationProgression();let{progression:e,progressionStatus:t,progressionError:n}=Z.getState();if(t!==`ready`||n||!e)throw Error(`Current Tactical Ops objective could not be verified`);let r=Mr(e).primary;await bu(),r&&xl(r)}var Tu={init:yu,open:bu,close:xu,refresh:Su,getState:Su,loadServiceRecord:Cu,openNextObjective:wu};function Eu(){return window.TacticalOps=Tu,Tu}var Du=Eu();try{let e=window;e.__AH_TACTICAL_OPS_VER__=oo,e.__TACTICAL_COMBAT__=$a,e.TacticalOps=Du}catch{}return e.API=Tu,e.BATTLEFIELD_LAB_KEY=Te,Object.defineProperty(e,"BATTLEFIELD_VNEXT_PREVIEW",{enumerable:!0,get:function(){return Ee}}),e.DEF_CURVE=je,e.FIELD_PROJECTION=bi,Object.defineProperty(e,"GRID_COLS",{enumerable:!0,get:function(){return De}}),Object.defineProperty(e,"GRID_ROWS",{enumerable:!0,get:function(){return Oe}}),e.METER_MAX=Ae,e.STATUS_LABEL=ci,e.STATUS_SHORT=li,e.VERSION=oo,e.a1Range=Qa,e.advanceToNext=Ua,e.aiUsesLegalRules=aa,e.applyAi=Xa,e.applySkill=Ki,e.applyStatus=ni,e.availableSkills=qi,e.beginUnitTurn=Ha,e.canOccupy=yi,e.canRecover=Ga,e.cellKey=mi,e.chebyshev=pi,e.chooseAiAction=ia,e.computeHeal=di,e.consumeMeter=Ni,e.cooldownLeft=Ui,e.createBattle=Ra,e.default=Du,e.effectiveAtk=ii,e.effectiveDef=ai,e.effectiveSpd=oi,e.encounterPressureAction=ra,e.evaluateOutcome=Ba,e.fieldPercent=Si,e.fieldPercentForGrid=xi,e.fieldTouchFootprint=Ci,e.getStatusSequence=ei,e.hasStatus=ti,e.inBounds=fi,e.inSkillRange=wi,e.incomingDamageMultiplier=si,e.isLegalTargetType=ki,e.living=Ti,e.mitigatedDamage=ui,e.objectiveAwareEnemyAction=ta,e.objectiveTargetScore=Zi,e.occupiedKeys=hi,e.pickReadyId=Mi,e.planAi=Za,e.previewQueue=Pi,e.reachableCells=vi,e.relayDenialAction=na,e.resetStatusSeq=$r,e.resolveSkillTargets=Di,e.selectAcceptedBattleRules=ke,e.skillNeedsTargetPick=Oi,e.skillReady=Wi,e.startBattle=Wa,e.tickUntilReady=ji,e.tryMove=qa,e.tryRecover=Ka,e.trySkill=Ya,e.trySkip=Ja,e.unitAt=gi,e.unitSkills=Hi,e.unitsInRadius=Ei,e.validTargetIds=K,e})({});