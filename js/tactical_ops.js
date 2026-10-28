/* tactical_ops.js v3.6.7-vnext-run-integrity */
var TacticalOpsBundle=(function(e){Object.defineProperties(e,{__esModule:{value:!0},[Symbol.toStringTag]:{value:`Module`}});var t=Object.create,n=Object.defineProperty,r=Object.getOwnPropertyDescriptor,i=Object.getOwnPropertyNames,a=Object.getPrototypeOf,o=Object.prototype.hasOwnProperty,s=(e,t)=>()=>(t||(e((t={exports:{}}).exports,t,t.exports),e=null),t.exports),c=(e,t)=>{let r={};for(var i in e)n(r,i,{get:e[i],enumerable:!0});return t||n(r,Symbol.toStringTag,{value:`Module`}),r},l=(e,t,a,s)=>{if(t&&typeof t==`object`||typeof t==`function`)for(var c=i(t),l=0,u=c.length,d;l<u;l++)d=c[l],!o.call(e,d)&&d!==a&&n(e,d,{get:(e=>t[e]).bind(null,d),enumerable:!(s=r(t,d))||s.enumerable});return e},u=(e,r,i)=>(i=e==null?{}:t(a(e)),l(r||!e||!e.__esModule||!o.call(e,`default`)?n(i,`default`,{value:e,enumerable:!0}):i,e)),d=s((e=>{function t(e,t){var n=e.length;e.push(t);a:for(;0<n;){var r=n-1>>>1,a=e[r];if(0<i(a,t))e[r]=t,e[n]=a,n=r;else break a}}function n(e){return e.length===0?null:e[0]}function r(e){if(e.length===0)return null;var t=e[0],n=e.pop();if(n!==t){e[0]=n;a:for(var r=0,a=e.length,o=a>>>1;r<o;){var s=2*(r+1)-1,c=e[s],l=s+1,u=e[l];if(0>i(c,n))l<a&&0>i(u,c)?(e[r]=u,e[l]=n,r=l):(e[r]=c,e[s]=n,r=s);else if(l<a&&0>i(u,n))e[r]=u,e[l]=n,r=l;else break a}}return t}function i(e,t){var n=e.sortIndex-t.sortIndex;return n===0?e.id-t.id:n}if(e.unstable_now=void 0,typeof performance==`object`&&typeof performance.now==`function`){var a=performance;e.unstable_now=function(){return a.now()}}else{var o=Date,s=o.now();e.unstable_now=function(){return o.now()-s}}var c=[],l=[],u=1,d=null,f=3,p=!1,m=!1,h=!1,g=!1,_=typeof setTimeout==`function`?setTimeout:null,v=typeof clearTimeout==`function`?clearTimeout:null,y=typeof setImmediate<`u`?setImmediate:null;function b(e){for(var i=n(l);i!==null;){if(i.callback===null)r(l);else if(i.startTime<=e)r(l),i.sortIndex=i.expirationTime,t(c,i);else break;i=n(l)}}function x(e){if(h=!1,b(e),!m){if(n(c)!==null)m=!0,S||(S=!0,O());else{var t=n(l);t!==null&&ee(x,t.startTime-e)}}}var S=!1,C=-1,w=5,T=-1;function E(){return g?!0:!(e.unstable_now()-T<w)}function D(){if(g=!1,S){var t=e.unstable_now();T=t;var i=!0;try{a:{m=!1,h&&(h=!1,v(C),C=-1),p=!0;var a=f;try{b:{for(b(t),d=n(c);d!==null&&!(d.expirationTime>t&&E());){var o=d.callback;if(typeof o==`function`){d.callback=null,f=d.priorityLevel;var s=o(d.expirationTime<=t);if(t=e.unstable_now(),typeof s==`function`){d.callback=s,b(t),i=!0;break b}d===n(c)&&r(c),b(t)}else r(c);d=n(c)}if(d!==null)i=!0;else{var u=n(l);u!==null&&ee(x,u.startTime-t),i=!1}}break a}finally{d=null,f=a,p=!1}i=void 0}}finally{i?O():S=!1}}}var O;if(typeof y==`function`)O=function(){y(D)};else if(typeof MessageChannel<`u`){var k=new MessageChannel,A=k.port2;k.port1.onmessage=D,O=function(){A.postMessage(null)}}else O=function(){_(D,0)};function ee(t,n){C=_(function(){t(e.unstable_now())},n)}e.unstable_IdlePriority=5,e.unstable_ImmediatePriority=1,e.unstable_LowPriority=4,e.unstable_NormalPriority=3,e.unstable_Profiling=null,e.unstable_UserBlockingPriority=2,e.unstable_cancelCallback=function(e){e.callback=null},e.unstable_forceFrameRate=function(e){0>e||125<e?console.error(`forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported`):w=0<e?Math.floor(1e3/e):5},e.unstable_getCurrentPriorityLevel=function(){return f},e.unstable_next=function(e){switch(f){case 1:case 2:case 3:var t=3;break;default:t=f}var n=f;f=t;try{return e()}finally{f=n}},e.unstable_requestPaint=function(){g=!0},e.unstable_runWithPriority=function(e,t){switch(e){case 1:case 2:case 3:case 4:case 5:break;default:e=3}var n=f;f=e;try{return t()}finally{f=n}},e.unstable_scheduleCallback=function(r,i,a){var o=e.unstable_now();switch(typeof a==`object`&&a?(a=a.delay,a=typeof a==`number`&&0<a?o+a:o):a=o,r){case 1:var s=-1;break;case 2:s=250;break;case 5:s=1073741823;break;case 4:s=1e4;break;default:s=5e3}return s=a+s,r={id:u++,callback:i,priorityLevel:r,startTime:a,expirationTime:s,sortIndex:-1},a>o?(r.sortIndex=a,t(l,r),n(c)===null&&r===n(l)&&(h?(v(C),C=-1):h=!0,ee(x,a-o))):(r.sortIndex=s,t(c,r),m||p||(m=!0,S||(S=!0,O()))),r},e.unstable_shouldYield=E,e.unstable_wrapCallback=function(e){var t=f;return function(){var n=f;f=t;try{return e.apply(this,arguments)}finally{f=n}}}})),f=s(((e,t)=>{t.exports=d()})),p=s((e=>{var t=Symbol.for(`react.transitional.element`),n=Symbol.for(`react.portal`),r=Symbol.for(`react.fragment`),i=Symbol.for(`react.strict_mode`),a=Symbol.for(`react.profiler`),o=Symbol.for(`react.consumer`),s=Symbol.for(`react.context`),c=Symbol.for(`react.forward_ref`),l=Symbol.for(`react.suspense`),u=Symbol.for(`react.memo`),d=Symbol.for(`react.lazy`),f=Symbol.for(`react.activity`),p=Symbol.iterator;function m(e){return typeof e!=`object`||!e?null:(e=p&&e[p]||e[`@@iterator`],typeof e==`function`?e:null)}var h={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},g=Object.assign,_={};function v(e,t,n){this.props=e,this.context=t,this.refs=_,this.updater=n||h}v.prototype.isReactComponent={},v.prototype.setState=function(e,t){if(typeof e!=`object`&&typeof e!=`function`&&e!=null)throw Error(`takes an object of state variables to update or a function which returns an object of state variables.`);this.updater.enqueueSetState(this,e,t,`setState`)},v.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,`forceUpdate`)};function y(){}y.prototype=v.prototype;function b(e,t,n){this.props=e,this.context=t,this.refs=_,this.updater=n||h}var x=b.prototype=new y;x.constructor=b,g(x,v.prototype),x.isPureReactComponent=!0;var S=Array.isArray;function C(){}var w={H:null,A:null,T:null,S:null},T=Object.prototype.hasOwnProperty;function E(e,n,r){var i=r.ref;return{$$typeof:t,type:e,key:n,ref:i===void 0?null:i,props:r}}function D(e,t){return E(e.type,t,e.props)}function O(e){return typeof e==`object`&&!!e&&e.$$typeof===t}function k(e){var t={"=":`=0`,":":`=2`};return`$`+e.replace(/[=:]/g,function(e){return t[e]})}var A=/\/+/g;function ee(e,t){return typeof e==`object`&&e&&e.key!=null?k(``+e.key):t.toString(36)}function te(e){switch(e.status){case`fulfilled`:return e.value;case`rejected`:throw e.reason;default:switch(typeof e.status==`string`?e.then(C,C):(e.status=`pending`,e.then(function(t){e.status===`pending`&&(e.status=`fulfilled`,e.value=t)},function(t){e.status===`pending`&&(e.status=`rejected`,e.reason=t)})),e.status){case`fulfilled`:return e.value;case`rejected`:throw e.reason}}throw e}function ne(e,r,i,a,o){var s=typeof e;(s===`undefined`||s===`boolean`)&&(e=null);var c=!1;if(e===null)c=!0;else switch(s){case`bigint`:case`string`:case`number`:c=!0;break;case`object`:switch(e.$$typeof){case t:case n:c=!0;break;case d:return c=e._init,ne(c(e._payload),r,i,a,o)}}if(c)return o=o(e),c=a===``?`.`+ee(e,0):a,S(o)?(i=``,c!=null&&(i=c.replace(A,`$&/`)+`/`),ne(o,r,i,``,function(e){return e})):o!=null&&(O(o)&&(o=D(o,i+(o.key==null||e&&e.key===o.key?``:(``+o.key).replace(A,`$&/`)+`/`)+c)),r.push(o)),1;c=0;var l=a===``?`.`:a+`:`;if(S(e))for(var u=0;u<e.length;u++)a=e[u],s=l+ee(a,u),c+=ne(a,r,i,s,o);else if(u=m(e),typeof u==`function`)for(e=u.call(e),u=0;!(a=e.next()).done;)a=a.value,s=l+ee(a,u++),c+=ne(a,r,i,s,o);else if(s===`object`){if(typeof e.then==`function`)return ne(te(e),r,i,a,o);throw r=String(e),Error(`Objects are not valid as a React child (found: `+(r===`[object Object]`?`object with keys {`+Object.keys(e).join(`, `)+`}`:r)+`). If you meant to render a collection of children, use an array instead.`)}return c}function re(e,t,n){if(e==null)return e;var r=[],i=0;return ne(e,r,``,``,function(e){return t.call(n,e,i++)}),r}function ie(e){if(e._status===-1){var t=e._result;t=t(),t.then(function(t){(e._status===0||e._status===-1)&&(e._status=1,e._result=t)},function(t){(e._status===0||e._status===-1)&&(e._status=2,e._result=t)}),e._status===-1&&(e._status=0,e._result=t)}if(e._status===1)return e._result.default;throw e._result}var j=typeof reportError==`function`?reportError:function(e){if(typeof window==`object`&&typeof window.ErrorEvent==`function`){var t=new window.ErrorEvent(`error`,{bubbles:!0,cancelable:!0,message:typeof e==`object`&&e&&typeof e.message==`string`?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process==`object`&&typeof process.emit==`function`){process.emit(`uncaughtException`,e);return}console.error(e)},M={map:re,forEach:function(e,t,n){re(e,function(){t.apply(this,arguments)},n)},count:function(e){var t=0;return re(e,function(){t++}),t},toArray:function(e){return re(e,function(e){return e})||[]},only:function(e){if(!O(e))throw Error(`React.Children.only expected to receive a single React element child.`);return e}};e.Activity=f,e.Children=M,e.Component=v,e.Fragment=r,e.Profiler=a,e.PureComponent=b,e.StrictMode=i,e.Suspense=l,e.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=w,e.__COMPILER_RUNTIME={__proto__:null,c:function(e){return w.H.useMemoCache(e)}},e.cache=function(e){return function(){return e.apply(null,arguments)}},e.cacheSignal=function(){return null},e.cloneElement=function(e,t,n){if(e==null)throw Error(`The argument must be a React element, but you passed `+e+`.`);var r=g({},e.props),i=e.key;if(t!=null)for(a in t.key!==void 0&&(i=``+t.key),t)!T.call(t,a)||a===`key`||a===`__self`||a===`__source`||a===`ref`&&t.ref===void 0||(r[a]=t[a]);var a=arguments.length-2;if(a===1)r.children=n;else if(1<a){for(var o=Array(a),s=0;s<a;s++)o[s]=arguments[s+2];r.children=o}return E(e.type,i,r)},e.createContext=function(e){return e={$$typeof:s,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null},e.Provider=e,e.Consumer={$$typeof:o,_context:e},e},e.createElement=function(e,t,n){var r,i={},a=null;if(t!=null)for(r in t.key!==void 0&&(a=``+t.key),t)T.call(t,r)&&r!==`key`&&r!==`__self`&&r!==`__source`&&(i[r]=t[r]);var o=arguments.length-2;if(o===1)i.children=n;else if(1<o){for(var s=Array(o),c=0;c<o;c++)s[c]=arguments[c+2];i.children=s}if(e&&e.defaultProps)for(r in o=e.defaultProps,o)i[r]===void 0&&(i[r]=o[r]);return E(e,a,i)},e.createRef=function(){return{current:null}},e.forwardRef=function(e){return{$$typeof:c,render:e}},e.isValidElement=O,e.lazy=function(e){return{$$typeof:d,_payload:{_status:-1,_result:e},_init:ie}},e.memo=function(e,t){return{$$typeof:u,type:e,compare:t===void 0?null:t}},e.startTransition=function(e){var t=w.T,n={};w.T=n;try{var r=e(),i=w.S;i!==null&&i(n,r),typeof r==`object`&&r&&typeof r.then==`function`&&r.then(C,j)}catch(e){j(e)}finally{t!==null&&n.types!==null&&(t.types=n.types),w.T=t}},e.unstable_useCacheRefresh=function(){return w.H.useCacheRefresh()},e.use=function(e){return w.H.use(e)},e.useActionState=function(e,t,n){return w.H.useActionState(e,t,n)},e.useCallback=function(e,t){return w.H.useCallback(e,t)},e.useContext=function(e){return w.H.useContext(e)},e.useDebugValue=function(){},e.useDeferredValue=function(e,t){return w.H.useDeferredValue(e,t)},e.useEffect=function(e,t){return w.H.useEffect(e,t)},e.useEffectEvent=function(e){return w.H.useEffectEvent(e)},e.useId=function(){return w.H.useId()},e.useImperativeHandle=function(e,t,n){return w.H.useImperativeHandle(e,t,n)},e.useInsertionEffect=function(e,t){return w.H.useInsertionEffect(e,t)},e.useLayoutEffect=function(e,t){return w.H.useLayoutEffect(e,t)},e.useMemo=function(e,t){return w.H.useMemo(e,t)},e.useOptimistic=function(e,t){return w.H.useOptimistic(e,t)},e.useReducer=function(e,t,n){return w.H.useReducer(e,t,n)},e.useRef=function(e){return w.H.useRef(e)},e.useState=function(e){return w.H.useState(e)},e.useSyncExternalStore=function(e,t,n){return w.H.useSyncExternalStore(e,t,n)},e.useTransition=function(){return w.H.useTransition()},e.version=`19.2.0`})),m=s(((e,t)=>{t.exports=p()})),h=s((e=>{var t=m();function n(e){var t=`https://react.dev/errors/`+e;if(1<arguments.length){t+=`?args[]=`+encodeURIComponent(arguments[1]);for(var n=2;n<arguments.length;n++)t+=`&args[]=`+encodeURIComponent(arguments[n])}return`Minified React error #`+e+`; visit `+t+` for the full message or use the non-minified dev environment for full errors and additional helpful warnings.`}function r(){}var i={d:{f:r,r:function(){throw Error(n(522))},D:r,C:r,L:r,m:r,X:r,S:r,M:r},p:0,findDOMNode:null},a=Symbol.for(`react.portal`);function o(e,t,n){var r=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:a,key:r==null?null:``+r,children:e,containerInfo:t,implementation:n}}var s=t.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;function c(e,t){if(e===`font`)return``;if(typeof t==`string`)return t===`use-credentials`?t:``}e.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=i,e.createPortal=function(e,t){var r=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)throw Error(n(299));return o(e,t,null,r)},e.flushSync=function(e){var t=s.T,n=i.p;try{if(s.T=null,i.p=2,e)return e()}finally{s.T=t,i.p=n,i.d.f()}},e.preconnect=function(e,t){typeof e==`string`&&(t?(t=t.crossOrigin,t=typeof t==`string`?t===`use-credentials`?t:``:void 0):t=null,i.d.C(e,t))},e.prefetchDNS=function(e){typeof e==`string`&&i.d.D(e)},e.preinit=function(e,t){if(typeof e==`string`&&t&&typeof t.as==`string`){var n=t.as,r=c(n,t.crossOrigin),a=typeof t.integrity==`string`?t.integrity:void 0,o=typeof t.fetchPriority==`string`?t.fetchPriority:void 0;n===`style`?i.d.S(e,typeof t.precedence==`string`?t.precedence:void 0,{crossOrigin:r,integrity:a,fetchPriority:o}):n===`script`&&i.d.X(e,{crossOrigin:r,integrity:a,fetchPriority:o,nonce:typeof t.nonce==`string`?t.nonce:void 0})}},e.preinitModule=function(e,t){if(typeof e==`string`){if(typeof t==`object`&&t){if(t.as==null||t.as===`script`){var n=c(t.as,t.crossOrigin);i.d.M(e,{crossOrigin:n,integrity:typeof t.integrity==`string`?t.integrity:void 0,nonce:typeof t.nonce==`string`?t.nonce:void 0})}}else t??i.d.M(e)}},e.preload=function(e,t){if(typeof e==`string`&&typeof t==`object`&&t&&typeof t.as==`string`){var n=t.as,r=c(n,t.crossOrigin);i.d.L(e,n,{crossOrigin:r,integrity:typeof t.integrity==`string`?t.integrity:void 0,nonce:typeof t.nonce==`string`?t.nonce:void 0,type:typeof t.type==`string`?t.type:void 0,fetchPriority:typeof t.fetchPriority==`string`?t.fetchPriority:void 0,referrerPolicy:typeof t.referrerPolicy==`string`?t.referrerPolicy:void 0,imageSrcSet:typeof t.imageSrcSet==`string`?t.imageSrcSet:void 0,imageSizes:typeof t.imageSizes==`string`?t.imageSizes:void 0,media:typeof t.media==`string`?t.media:void 0})}},e.preloadModule=function(e,t){if(typeof e==`string`){if(t){var n=c(t.as,t.crossOrigin);i.d.m(e,{as:typeof t.as==`string`&&t.as!==`script`?t.as:void 0,crossOrigin:n,integrity:typeof t.integrity==`string`?t.integrity:void 0})}else i.d.m(e)}},e.requestFormReset=function(e){i.d.r(e)},e.unstable_batchedUpdates=function(e,t){return e(t)},e.useFormState=function(e,t,n){return s.H.useFormState(e,t,n)},e.useFormStatus=function(){return s.H.useHostTransitionStatus()},e.version=`19.2.0`})),g=s(((e,t)=>{function n(){if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<`u`&&typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE==`function`)try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(n)}catch(e){console.error(e)}}n(),t.exports=h()})),_=s((e=>{var t=f(),n=m(),r=g();function i(e){var t=`https://react.dev/errors/`+e;if(1<arguments.length){t+=`?args[]=`+encodeURIComponent(arguments[1]);for(var n=2;n<arguments.length;n++)t+=`&args[]=`+encodeURIComponent(arguments[n])}return`Minified React error #`+e+`; visit `+t+` for the full message or use the non-minified dev environment for full errors and additional helpful warnings.`}function a(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)}function o(e){var t=e,n=e;if(e.alternate)for(;t.return;)t=t.return;else{e=t;do t=e,t.flags&4098&&(n=t.return),e=t.return;while(e)}return t.tag===3?n:null}function s(e){if(e.tag===13){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function c(e){if(e.tag===31){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function l(e){if(o(e)!==e)throw Error(i(188))}function u(e){var t=e.alternate;if(!t){if(t=o(e),t===null)throw Error(i(188));return t===e?e:null}for(var n=e,r=t;;){var a=n.return;if(a===null)break;var s=a.alternate;if(s===null){if(r=a.return,r!==null){n=r;continue}break}if(a.child===s.child){for(s=a.child;s;){if(s===n)return l(a),e;if(s===r)return l(a),t;s=s.sibling}throw Error(i(188))}if(n.return!==r.return)n=a,r=s;else{for(var c=!1,u=a.child;u;){if(u===n){c=!0,n=a,r=s;break}if(u===r){c=!0,r=a,n=s;break}u=u.sibling}if(!c){for(u=s.child;u;){if(u===n){c=!0,n=s,r=a;break}if(u===r){c=!0,r=s,n=a;break}u=u.sibling}if(!c)throw Error(i(189))}}if(n.alternate!==r)throw Error(i(190))}if(n.tag!==3)throw Error(i(188));return n.stateNode.current===n?e:t}function d(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e;for(e=e.child;e!==null;){if(t=d(e),t!==null)return t;e=e.sibling}return null}var p=Object.assign,h=Symbol.for(`react.element`),_=Symbol.for(`react.transitional.element`),v=Symbol.for(`react.portal`),y=Symbol.for(`react.fragment`),b=Symbol.for(`react.strict_mode`),x=Symbol.for(`react.profiler`),S=Symbol.for(`react.consumer`),C=Symbol.for(`react.context`),w=Symbol.for(`react.forward_ref`),T=Symbol.for(`react.suspense`),E=Symbol.for(`react.suspense_list`),D=Symbol.for(`react.memo`),O=Symbol.for(`react.lazy`),k=Symbol.for(`react.activity`),A=Symbol.for(`react.memo_cache_sentinel`),ee=Symbol.iterator;function te(e){return typeof e!=`object`||!e?null:(e=ee&&e[ee]||e[`@@iterator`],typeof e==`function`?e:null)}var ne=Symbol.for(`react.client.reference`);function re(e){if(e==null)return null;if(typeof e==`function`)return e.$$typeof===ne?null:e.displayName||e.name||null;if(typeof e==`string`)return e;switch(e){case y:return`Fragment`;case x:return`Profiler`;case b:return`StrictMode`;case T:return`Suspense`;case E:return`SuspenseList`;case k:return`Activity`}if(typeof e==`object`)switch(e.$$typeof){case v:return`Portal`;case C:return e.displayName||`Context`;case S:return(e._context.displayName||`Context`)+`.Consumer`;case w:var t=e.render;return e=e.displayName,e||(e=t.displayName||t.name||``,e=e===``?`ForwardRef`:`ForwardRef(`+e+`)`),e;case D:return t=e.displayName||null,t===null?re(e.type)||`Memo`:t;case O:t=e._payload,e=e._init;try{return re(e(t))}catch{}}return null}var ie=Array.isArray,j=n.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,M=r.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,ae={pending:!1,data:null,method:null,action:null},oe=[],N=-1;function se(e){return{current:e}}function P(e){0>N||(e.current=oe[N],oe[N]=null,N--)}function F(e,t){N++,oe[N]=e.current,e.current=t}var ce=se(null),le=se(null),ue=se(null),de=se(null);function I(e,t){switch(F(ue,t),F(le,e),F(ce,null),t.nodeType){case 9:case 11:e=(e=t.documentElement)&&(e=e.namespaceURI)?Vd(e):0;break;default:if(e=t.tagName,t=t.namespaceURI)t=Vd(t),e=Hd(t,e);else switch(e){case`svg`:e=1;break;case`math`:e=2;break;default:e=0}}P(ce),F(ce,e)}function fe(){P(ce),P(le),P(ue)}function pe(e){e.memoizedState!==null&&F(de,e);var t=ce.current,n=Hd(t,e.type);t!==n&&(F(le,e),F(ce,n))}function me(e){le.current===e&&(P(ce),P(le)),de.current===e&&(P(de),Qf._currentValue=ae)}var L,he;function ge(e){if(L===void 0)try{throw Error()}catch(e){var t=e.stack.trim().match(/\n( *(at )?)/);L=t&&t[1]||``,he=-1<e.stack.indexOf(`
    at`)?` (<anonymous>)`:-1<e.stack.indexOf(`@`)?`@unknown:0:0`:``}return`
`+L+e+he}var _e=!1;function ve(e,t){if(!e||_e)return``;_e=!0;var n=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{var r={DetermineComponentFrameRoot:function(){try{if(t){var n=function(){throw Error()};if(Object.defineProperty(n.prototype,"props",{set:function(){throw Error()}}),typeof Reflect==`object`&&Reflect.construct){try{Reflect.construct(n,[])}catch(e){var r=e}Reflect.construct(e,[],n)}else{try{n.call()}catch(e){r=e}e.call(n.prototype)}}else{try{throw Error()}catch(e){r=e}(n=e())&&typeof n.catch==`function`&&n.catch(function(){})}}catch(e){if(e&&r&&typeof e.stack==`string`)return[e.stack,r.stack]}return[null,null]}};r.DetermineComponentFrameRoot.displayName=`DetermineComponentFrameRoot`;var i=Object.getOwnPropertyDescriptor(r.DetermineComponentFrameRoot,`name`);i&&i.configurable&&Object.defineProperty(r.DetermineComponentFrameRoot,"name",{value:`DetermineComponentFrameRoot`});var a=r.DetermineComponentFrameRoot(),o=a[0],s=a[1];if(o&&s){var c=o.split(`
`),l=s.split(`
`);for(i=r=0;r<c.length&&!c[r].includes(`DetermineComponentFrameRoot`);)r++;for(;i<l.length&&!l[i].includes(`DetermineComponentFrameRoot`);)i++;if(r===c.length||i===l.length)for(r=c.length-1,i=l.length-1;1<=r&&0<=i&&c[r]!==l[i];)i--;for(;1<=r&&0<=i;r--,i--)if(c[r]!==l[i]){if(r!==1||i!==1)do if(r--,i--,0>i||c[r]!==l[i]){var u=`
`+c[r].replace(` at new `,` at `);return e.displayName&&u.includes(`<anonymous>`)&&(u=u.replace(`<anonymous>`,e.displayName)),u}while(1<=r&&0<=i);break}}}finally{_e=!1,Error.prepareStackTrace=n}return(n=e?e.displayName||e.name:``)?ge(n):``}function ye(e,t){switch(e.tag){case 26:case 27:case 5:return ge(e.type);case 16:return ge(`Lazy`);case 13:return e.child!==t&&t!==null?ge(`Suspense Fallback`):ge(`Suspense`);case 19:return ge(`SuspenseList`);case 0:case 15:return ve(e.type,!1);case 11:return ve(e.type.render,!1);case 1:return ve(e.type,!0);case 31:return ge(`Activity`);default:return``}}function be(e){try{var t=``,n=null;do t+=ye(e,n),n=e,e=e.return;while(e);return t}catch(e){return`
Error generating stack: `+e.message+`
`+e.stack}}var xe=Object.prototype.hasOwnProperty,Se=t.unstable_scheduleCallback,Ce=t.unstable_cancelCallback,we=t.unstable_shouldYield,Te=t.unstable_requestPaint,Ee=t.unstable_now,De=t.unstable_getCurrentPriorityLevel,Oe=t.unstable_ImmediatePriority,ke=t.unstable_UserBlockingPriority,Ae=t.unstable_NormalPriority,je=t.unstable_LowPriority,Me=t.unstable_IdlePriority,R=t.log,Ne=t.unstable_setDisableYieldValue,Pe=null,Fe=null;function Ie(e){if(typeof R==`function`&&Ne(e),Fe&&typeof Fe.setStrictMode==`function`)try{Fe.setStrictMode(Pe,e)}catch{}}var Le=Math.clz32?Math.clz32:Be,Re=Math.log,ze=Math.LN2;function Be(e){return e>>>=0,e===0?32:31-(Re(e)/ze|0)|0}var Ve=256,He=262144,Ue=4194304;function We(e){var t=e&42;if(t!==0)return t;switch(e&-e){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:return 64;case 128:return 128;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:return e&261888;case 262144:case 524288:case 1048576:case 2097152:return e&3932160;case 4194304:case 8388608:case 16777216:case 33554432:return e&62914560;case 67108864:return 67108864;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 0;default:return e}}function Ge(e,t,n){var r=e.pendingLanes;if(r===0)return 0;var i=0,a=e.suspendedLanes,o=e.pingedLanes;e=e.warmLanes;var s=r&134217727;return s===0?(s=r&~a,s===0?o===0?n||(n=r&~e,n!==0&&(i=We(n))):i=We(o):i=We(s)):(r=s&~a,r===0?(o&=s,o===0?n||(n=s&~e,n!==0&&(i=We(n))):i=We(o)):i=We(r)),i===0?0:t!==0&&t!==i&&(t&a)===0&&(a=i&-i,n=t&-t,a>=n||a===32&&n&4194048)?t:i}function Ke(e,t){return(e.pendingLanes&~(e.suspendedLanes&~e.pingedLanes)&t)===0}function qe(e,t){switch(e){case 1:case 2:case 4:case 8:case 64:return t+250;case 16:case 32:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t+5e3;case 4194304:case 8388608:case 16777216:case 33554432:return-1;case 67108864:case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function Je(){var e=Ue;return Ue<<=1,!(Ue&62914560)&&(Ue=4194304),e}function Ye(e){for(var t=[],n=0;31>n;n++)t.push(e);return t}function Xe(e,t){e.pendingLanes|=t,t!==268435456&&(e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0)}function Ze(e,t,n,r,i,a){var o=e.pendingLanes;e.pendingLanes=n,e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0,e.expiredLanes&=n,e.entangledLanes&=n,e.errorRecoveryDisabledLanes&=n,e.shellSuspendCounter=0;var s=e.entanglements,c=e.expirationTimes,l=e.hiddenUpdates;for(n=o&~n;0<n;){var u=31-Le(n),d=1<<u;s[u]=0,c[u]=-1;var f=l[u];if(f!==null)for(l[u]=null,u=0;u<f.length;u++){var p=f[u];p!==null&&(p.lane&=-536870913)}n&=~d}r!==0&&Qe(e,r,0),a!==0&&i===0&&e.tag!==0&&(e.suspendedLanes|=a&~(o&~t))}function Qe(e,t,n){e.pendingLanes|=t,e.suspendedLanes&=~t;var r=31-Le(t);e.entangledLanes|=t,e.entanglements[r]=e.entanglements[r]|1073741824|n&261930}function $e(e,t){var n=e.entangledLanes|=t;for(e=e.entanglements;n;){var r=31-Le(n),i=1<<r;i&t|e[r]&t&&(e[r]|=t),n&=~i}}function et(e,t){var n=t&-t;return n=n&42?1:tt(n),(n&(e.suspendedLanes|t))===0?n:0}function tt(e){switch(e){case 2:e=1;break;case 8:e=4;break;case 32:e=16;break;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:e=128;break;case 268435456:e=134217728;break;default:e=0}return e}function nt(e){return e&=-e,2<e?8<e?e&134217727?32:268435456:8:2}function rt(){var e=M.p;return e===0?(e=window.event,e===void 0?32:mp(e.type)):e}function it(e,t){var n=M.p;try{return M.p=e,t()}finally{M.p=n}}var at=Math.random().toString(36).slice(2),ot=`__reactFiber$`+at,st=`__reactProps$`+at,ct=`__reactContainer$`+at,lt=`__reactEvents$`+at,ut=`__reactListeners$`+at,dt=`__reactHandles$`+at,ft=`__reactResources$`+at,pt=`__reactMarker$`+at;function mt(e){delete e[ot],delete e[st],delete e[lt],delete e[ut],delete e[dt]}function ht(e){var t=e[ot];if(t)return t;for(var n=e.parentNode;n;){if(t=n[ct]||n[ot]){if(n=t.alternate,t.child!==null||n!==null&&n.child!==null)for(e=df(e);e!==null;){if(n=e[ot])return n;e=df(e)}return t}e=n,n=e.parentNode}return null}function gt(e){if(e=e[ot]||e[ct]){var t=e.tag;if(t===5||t===6||t===13||t===31||t===26||t===27||t===3)return e}return null}function _t(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e.stateNode;throw Error(i(33))}function vt(e){var t=e[ft];return t||(t=e[ft]={hoistableStyles:new Map,hoistableScripts:new Map}),t}function yt(e){e[pt]=!0}var bt=new Set,xt={};function St(e,t){Ct(e,t),Ct(e+`Capture`,t)}function Ct(e,t){for(xt[e]=t,e=0;e<t.length;e++)bt.add(t[e])}var wt=RegExp(`^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$`),Tt={},Et={};function Dt(e){return xe.call(Et,e)?!0:xe.call(Tt,e)?!1:wt.test(e)?Et[e]=!0:(Tt[e]=!0,!1)}function Ot(e,t,n){if(Dt(t)){if(n===null)e.removeAttribute(t);else{switch(typeof n){case`undefined`:case`function`:case`symbol`:e.removeAttribute(t);return;case`boolean`:var r=t.toLowerCase().slice(0,5);if(r!==`data-`&&r!==`aria-`){e.removeAttribute(t);return}}e.setAttribute(t,``+n)}}}function kt(e,t,n){if(n===null)e.removeAttribute(t);else{switch(typeof n){case`undefined`:case`function`:case`symbol`:case`boolean`:e.removeAttribute(t);return}e.setAttribute(t,``+n)}}function At(e,t,n,r){if(r===null)e.removeAttribute(n);else{switch(typeof r){case`undefined`:case`function`:case`symbol`:case`boolean`:e.removeAttribute(n);return}e.setAttributeNS(t,n,``+r)}}function jt(e){switch(typeof e){case`bigint`:case`boolean`:case`number`:case`string`:case`undefined`:return e;case`object`:return e;default:return``}}function Mt(e){var t=e.type;return(e=e.nodeName)&&e.toLowerCase()===`input`&&(t===`checkbox`||t===`radio`)}function Nt(e,t,n){var r=Object.getOwnPropertyDescriptor(e.constructor.prototype,t);if(!e.hasOwnProperty(t)&&r!==void 0&&typeof r.get==`function`&&typeof r.set==`function`){var i=r.get,a=r.set;return Object.defineProperty(e,t,{configurable:!0,get:function(){return i.call(this)},set:function(e){n=``+e,a.call(this,e)}}),Object.defineProperty(e,t,{enumerable:r.enumerable}),{getValue:function(){return n},setValue:function(e){n=``+e},stopTracking:function(){e._valueTracker=null,delete e[t]}}}}function Pt(e){if(!e._valueTracker){var t=Mt(e)?`checked`:`value`;e._valueTracker=Nt(e,t,``+e[t])}}function Ft(e){if(!e)return!1;var t=e._valueTracker;if(!t)return!0;var n=t.getValue(),r=``;return e&&(r=Mt(e)?e.checked?`true`:`false`:e.value),e=r,e!==n&&(t.setValue(e),!0)}function It(e){if(e=e||(typeof document<`u`?document:void 0),e===void 0)return null;try{return e.activeElement||e.body}catch{return e.body}}var Lt=/[\n"\\]/g;function Rt(e){return e.replace(Lt,function(e){return`\\`+e.charCodeAt(0).toString(16)+` `})}function zt(e,t,n,r,i,a,o,s){e.name=``,o!=null&&typeof o!=`function`&&typeof o!=`symbol`&&typeof o!=`boolean`?e.type=o:e.removeAttribute(`type`),t==null?o!==`submit`&&o!==`reset`||e.removeAttribute(`value`):o===`number`?(t===0&&e.value===``||e.value!=t)&&(e.value=``+jt(t)):e.value!==``+jt(t)&&(e.value=``+jt(t)),t==null?n==null?r!=null&&e.removeAttribute(`value`):Vt(e,o,jt(n)):Vt(e,o,jt(t)),i==null&&a!=null&&(e.defaultChecked=!!a),i!=null&&(e.checked=i&&typeof i!=`function`&&typeof i!=`symbol`),s!=null&&typeof s!=`function`&&typeof s!=`symbol`&&typeof s!=`boolean`?e.name=``+jt(s):e.removeAttribute(`name`)}function Bt(e,t,n,r,i,a,o,s){if(a!=null&&typeof a!=`function`&&typeof a!=`symbol`&&typeof a!=`boolean`&&(e.type=a),t!=null||n!=null){if(!(a!==`submit`&&a!==`reset`||t!=null)){Pt(e);return}n=n==null?``:``+jt(n),t=t==null?n:``+jt(t),s||t===e.value||(e.value=t),e.defaultValue=t}r=r??i,r=typeof r!=`function`&&typeof r!=`symbol`&&!!r,e.checked=s?e.checked:!!r,e.defaultChecked=!!r,o!=null&&typeof o!=`function`&&typeof o!=`symbol`&&typeof o!=`boolean`&&(e.name=o),Pt(e)}function Vt(e,t,n){t===`number`&&It(e.ownerDocument)===e||e.defaultValue===``+n||(e.defaultValue=``+n)}function Ht(e,t,n,r){if(e=e.options,t){t={};for(var i=0;i<n.length;i++)t[`$`+n[i]]=!0;for(n=0;n<e.length;n++)i=t.hasOwnProperty(`$`+e[n].value),e[n].selected!==i&&(e[n].selected=i),i&&r&&(e[n].defaultSelected=!0)}else{for(n=``+jt(n),t=null,i=0;i<e.length;i++){if(e[i].value===n){e[i].selected=!0,r&&(e[i].defaultSelected=!0);return}t!==null||e[i].disabled||(t=e[i])}t!==null&&(t.selected=!0)}}function Ut(e,t,n){t!=null&&(t=``+jt(t),t!==e.value&&(e.value=t),n==null)?e.defaultValue!==t&&(e.defaultValue=t):e.defaultValue=n==null?``:``+jt(n)}function Wt(e,t,n,r){if(t==null){if(r!=null){if(n!=null)throw Error(i(92));if(ie(r)){if(1<r.length)throw Error(i(93));r=r[0]}n=r}n??(n=``),t=n}n=jt(t),e.defaultValue=n,r=e.textContent,r===n&&r!==``&&r!==null&&(e.value=r),Pt(e)}function Gt(e,t){if(t){var n=e.firstChild;if(n&&n===e.lastChild&&n.nodeType===3){n.nodeValue=t;return}}e.textContent=t}var Kt=new Set(`animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp`.split(` `));function qt(e,t,n){var r=t.indexOf(`--`)===0;n==null||typeof n==`boolean`||n===``?r?e.setProperty(t,``):t===`float`?e.cssFloat=``:e[t]=``:r?e.setProperty(t,n):typeof n!=`number`||n===0||Kt.has(t)?t===`float`?e.cssFloat=n:e[t]=(``+n).trim():e[t]=n+`px`}function Jt(e,t,n){if(t!=null&&typeof t!=`object`)throw Error(i(62));if(e=e.style,n!=null){for(var r in n)!n.hasOwnProperty(r)||t!=null&&t.hasOwnProperty(r)||(r.indexOf(`--`)===0?e.setProperty(r,``):r===`float`?e.cssFloat=``:e[r]=``);for(var a in t)r=t[a],t.hasOwnProperty(a)&&n[a]!==r&&qt(e,a,r)}else for(var o in t)t.hasOwnProperty(o)&&qt(e,o,t[o])}function Yt(e){if(e.indexOf(`-`)===-1)return!1;switch(e){case`annotation-xml`:case`color-profile`:case`font-face`:case`font-face-src`:case`font-face-uri`:case`font-face-format`:case`font-face-name`:case`missing-glyph`:return!1;default:return!0}}var Xt=new Map([[`acceptCharset`,`accept-charset`],[`htmlFor`,`for`],[`httpEquiv`,`http-equiv`],[`crossOrigin`,`crossorigin`],[`accentHeight`,`accent-height`],[`alignmentBaseline`,`alignment-baseline`],[`arabicForm`,`arabic-form`],[`baselineShift`,`baseline-shift`],[`capHeight`,`cap-height`],[`clipPath`,`clip-path`],[`clipRule`,`clip-rule`],[`colorInterpolation`,`color-interpolation`],[`colorInterpolationFilters`,`color-interpolation-filters`],[`colorProfile`,`color-profile`],[`colorRendering`,`color-rendering`],[`dominantBaseline`,`dominant-baseline`],[`enableBackground`,`enable-background`],[`fillOpacity`,`fill-opacity`],[`fillRule`,`fill-rule`],[`floodColor`,`flood-color`],[`floodOpacity`,`flood-opacity`],[`fontFamily`,`font-family`],[`fontSize`,`font-size`],[`fontSizeAdjust`,`font-size-adjust`],[`fontStretch`,`font-stretch`],[`fontStyle`,`font-style`],[`fontVariant`,`font-variant`],[`fontWeight`,`font-weight`],[`glyphName`,`glyph-name`],[`glyphOrientationHorizontal`,`glyph-orientation-horizontal`],[`glyphOrientationVertical`,`glyph-orientation-vertical`],[`horizAdvX`,`horiz-adv-x`],[`horizOriginX`,`horiz-origin-x`],[`imageRendering`,`image-rendering`],[`letterSpacing`,`letter-spacing`],[`lightingColor`,`lighting-color`],[`markerEnd`,`marker-end`],[`markerMid`,`marker-mid`],[`markerStart`,`marker-start`],[`overlinePosition`,`overline-position`],[`overlineThickness`,`overline-thickness`],[`paintOrder`,`paint-order`],[`panose-1`,`panose-1`],[`pointerEvents`,`pointer-events`],[`renderingIntent`,`rendering-intent`],[`shapeRendering`,`shape-rendering`],[`stopColor`,`stop-color`],[`stopOpacity`,`stop-opacity`],[`strikethroughPosition`,`strikethrough-position`],[`strikethroughThickness`,`strikethrough-thickness`],[`strokeDasharray`,`stroke-dasharray`],[`strokeDashoffset`,`stroke-dashoffset`],[`strokeLinecap`,`stroke-linecap`],[`strokeLinejoin`,`stroke-linejoin`],[`strokeMiterlimit`,`stroke-miterlimit`],[`strokeOpacity`,`stroke-opacity`],[`strokeWidth`,`stroke-width`],[`textAnchor`,`text-anchor`],[`textDecoration`,`text-decoration`],[`textRendering`,`text-rendering`],[`transformOrigin`,`transform-origin`],[`underlinePosition`,`underline-position`],[`underlineThickness`,`underline-thickness`],[`unicodeBidi`,`unicode-bidi`],[`unicodeRange`,`unicode-range`],[`unitsPerEm`,`units-per-em`],[`vAlphabetic`,`v-alphabetic`],[`vHanging`,`v-hanging`],[`vIdeographic`,`v-ideographic`],[`vMathematical`,`v-mathematical`],[`vectorEffect`,`vector-effect`],[`vertAdvY`,`vert-adv-y`],[`vertOriginX`,`vert-origin-x`],[`vertOriginY`,`vert-origin-y`],[`wordSpacing`,`word-spacing`],[`writingMode`,`writing-mode`],[`xmlnsXlink`,`xmlns:xlink`],[`xHeight`,`x-height`]]),Zt=/^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;function Qt(e){return Zt.test(``+e)?`javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')`:e}function $t(){}var en=null;function tn(e){return e=e.target||e.srcElement||window,e.correspondingUseElement&&(e=e.correspondingUseElement),e.nodeType===3?e.parentNode:e}var nn=null,rn=null;function an(e){var t=gt(e);if(t&&(e=t.stateNode)){var n=e[st]||null;a:switch(e=t.stateNode,t.type){case`input`:if(zt(e,n.value,n.defaultValue,n.defaultValue,n.checked,n.defaultChecked,n.type,n.name),t=n.name,n.type===`radio`&&t!=null){for(n=e;n.parentNode;)n=n.parentNode;for(n=n.querySelectorAll(`input[name="`+Rt(``+t)+`"][type="radio"]`),t=0;t<n.length;t++){var r=n[t];if(r!==e&&r.form===e.form){var a=r[st]||null;if(!a)throw Error(i(90));zt(r,a.value,a.defaultValue,a.defaultValue,a.checked,a.defaultChecked,a.type,a.name)}}for(t=0;t<n.length;t++)r=n[t],r.form===e.form&&Ft(r)}break a;case`textarea`:Ut(e,n.value,n.defaultValue);break a;case`select`:t=n.value,t!=null&&Ht(e,!!n.multiple,t,!1)}}}var on=!1;function sn(e,t,n){if(on)return e(t,n);on=!0;try{return e(t)}finally{if(on=!1,(nn!==null||rn!==null)&&(yu(),nn&&(t=nn,e=rn,rn=nn=null,an(t),e)))for(t=0;t<e.length;t++)an(e[t])}}function cn(e,t){var n=e.stateNode;if(n===null)return null;var r=n[st]||null;if(r===null)return null;n=r[t];a:switch(t){case`onClick`:case`onClickCapture`:case`onDoubleClick`:case`onDoubleClickCapture`:case`onMouseDown`:case`onMouseDownCapture`:case`onMouseMove`:case`onMouseMoveCapture`:case`onMouseUp`:case`onMouseUpCapture`:case`onMouseEnter`:(r=!r.disabled)||(e=e.type,r=e!==`button`&&e!==`input`&&e!==`select`&&e!==`textarea`),e=!r;break a;default:e=!1}if(e)return null;if(n&&typeof n!=`function`)throw Error(i(231,t,typeof n));return n}var ln=typeof window<`u`&&window.document!==void 0&&window.document.createElement!==void 0,un=!1;if(ln)try{var dn={};Object.defineProperty(dn,"passive",{get:function(){un=!0}}),window.addEventListener(`test`,dn,dn),window.removeEventListener(`test`,dn,dn)}catch{un=!1}var fn=null,pn=null,z=null;function mn(){if(z)return z;var e,t=pn,n=t.length,r,i=`value`in fn?fn.value:fn.textContent,a=i.length;for(e=0;e<n&&t[e]===i[e];e++);var o=n-e;for(r=1;r<=o&&t[n-r]===i[a-r];r++);return z=i.slice(e,1<r?1-r:void 0)}function hn(e){var t=e.keyCode;return`charCode`in e?(e=e.charCode,e===0&&t===13&&(e=13)):e=t,e===10&&(e=13),32<=e||e===13?e:0}function gn(){return!0}function _n(){return!1}function vn(e){function t(t,n,r,i,a){for(var o in this._reactName=t,this._targetInst=r,this.type=n,this.nativeEvent=i,this.target=a,this.currentTarget=null,e)e.hasOwnProperty(o)&&(t=e[o],this[o]=t?t(i):i[o]);return this.isDefaultPrevented=(i.defaultPrevented==null?!1===i.returnValue:i.defaultPrevented)?gn:_n,this.isPropagationStopped=_n,this}return p(t.prototype,{preventDefault:function(){this.defaultPrevented=!0;var e=this.nativeEvent;e&&(e.preventDefault?e.preventDefault():typeof e.returnValue!=`unknown`&&(e.returnValue=!1),this.isDefaultPrevented=gn)},stopPropagation:function(){var e=this.nativeEvent;e&&(e.stopPropagation?e.stopPropagation():typeof e.cancelBubble!=`unknown`&&(e.cancelBubble=!0),this.isPropagationStopped=gn)},persist:function(){},isPersistent:gn}),t}var yn={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(e){return e.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},bn=vn(yn),xn=p({},yn,{view:0,detail:0}),Sn=vn(xn),Cn,wn,Tn,En=p({},xn,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:Ln,button:0,buttons:0,relatedTarget:function(e){return e.relatedTarget===void 0?e.fromElement===e.srcElement?e.toElement:e.fromElement:e.relatedTarget},movementX:function(e){return`movementX`in e?e.movementX:(e!==Tn&&(Tn&&e.type===`mousemove`?(Cn=e.screenX-Tn.screenX,wn=e.screenY-Tn.screenY):wn=Cn=0,Tn=e),Cn)},movementY:function(e){return`movementY`in e?e.movementY:wn}}),Dn=vn(En),On=vn(p({},En,{dataTransfer:0})),kn=vn(p({},xn,{relatedTarget:0})),An=vn(p({},yn,{animationName:0,elapsedTime:0,pseudoElement:0})),jn=vn(p({},yn,{clipboardData:function(e){return`clipboardData`in e?e.clipboardData:window.clipboardData}})),Mn=vn(p({},yn,{data:0})),Nn={Esc:`Escape`,Spacebar:` `,Left:`ArrowLeft`,Up:`ArrowUp`,Right:`ArrowRight`,Down:`ArrowDown`,Del:`Delete`,Win:`OS`,Menu:`ContextMenu`,Apps:`ContextMenu`,Scroll:`ScrollLock`,MozPrintableKey:`Unidentified`},Pn={8:`Backspace`,9:`Tab`,12:`Clear`,13:`Enter`,16:`Shift`,17:`Control`,18:`Alt`,19:`Pause`,20:`CapsLock`,27:`Escape`,32:` `,33:`PageUp`,34:`PageDown`,35:`End`,36:`Home`,37:`ArrowLeft`,38:`ArrowUp`,39:`ArrowRight`,40:`ArrowDown`,45:`Insert`,46:`Delete`,112:`F1`,113:`F2`,114:`F3`,115:`F4`,116:`F5`,117:`F6`,118:`F7`,119:`F8`,120:`F9`,121:`F10`,122:`F11`,123:`F12`,144:`NumLock`,145:`ScrollLock`,224:`Meta`},Fn={Alt:`altKey`,Control:`ctrlKey`,Meta:`metaKey`,Shift:`shiftKey`};function In(e){var t=this.nativeEvent;return t.getModifierState?t.getModifierState(e):(e=Fn[e])?!!t[e]:!1}function Ln(){return In}var Rn=vn(p({},xn,{key:function(e){if(e.key){var t=Nn[e.key]||e.key;if(t!==`Unidentified`)return t}return e.type===`keypress`?(e=hn(e),e===13?`Enter`:String.fromCharCode(e)):e.type===`keydown`||e.type===`keyup`?Pn[e.keyCode]||`Unidentified`:``},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:Ln,charCode:function(e){return e.type===`keypress`?hn(e):0},keyCode:function(e){return e.type===`keydown`||e.type===`keyup`?e.keyCode:0},which:function(e){return e.type===`keypress`?hn(e):e.type===`keydown`||e.type===`keyup`?e.keyCode:0}})),zn=vn(p({},En,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0})),Bn=vn(p({},xn,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:Ln})),Vn=vn(p({},yn,{propertyName:0,elapsedTime:0,pseudoElement:0})),Hn=vn(p({},En,{deltaX:function(e){return`deltaX`in e?e.deltaX:`wheelDeltaX`in e?-e.wheelDeltaX:0},deltaY:function(e){return`deltaY`in e?e.deltaY:`wheelDeltaY`in e?-e.wheelDeltaY:`wheelDelta`in e?-e.wheelDelta:0},deltaZ:0,deltaMode:0})),Un=vn(p({},yn,{newState:0,oldState:0})),Wn=[9,13,27,32],Gn=ln&&`CompositionEvent`in window,Kn=null;ln&&`documentMode`in document&&(Kn=document.documentMode);var qn=ln&&`TextEvent`in window&&!Kn,Jn=ln&&(!Gn||Kn&&8<Kn&&11>=Kn),Yn=` `,Xn=!1;function Zn(e,t){switch(e){case`keyup`:return Wn.indexOf(t.keyCode)!==-1;case`keydown`:return t.keyCode!==229;case`keypress`:case`mousedown`:case`focusout`:return!0;default:return!1}}function Qn(e){return e=e.detail,typeof e==`object`&&`data`in e?e.data:null}var $n=!1;function er(e,t){switch(e){case`compositionend`:return Qn(t);case`keypress`:return t.which===32?(Xn=!0,Yn):null;case`textInput`:return e=t.data,e===Yn&&Xn?null:e;default:return null}}function tr(e,t){if($n)return e===`compositionend`||!Gn&&Zn(e,t)?(e=mn(),z=pn=fn=null,$n=!1,e):null;switch(e){case`paste`:return null;case`keypress`:if(!(t.ctrlKey||t.altKey||t.metaKey)||t.ctrlKey&&t.altKey){if(t.char&&1<t.char.length)return t.char;if(t.which)return String.fromCharCode(t.which)}return null;case`compositionend`:return Jn&&t.locale!==`ko`?null:t.data;default:return null}}var nr={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function rr(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t===`input`?!!nr[e.type]:t===`textarea`}function ir(e,t,n,r){nn?rn?rn.push(r):rn=[r]:nn=r,t=Td(t,`onChange`),0<t.length&&(n=new bn(`onChange`,`change`,null,n,r),e.push({event:n,listeners:t}))}var ar=null,or=null;function sr(e){vd(e,0)}function cr(e){if(Ft(_t(e)))return e}function lr(e,t){if(e===`change`)return t}var ur=!1;if(ln){var dr;if(ln){var fr=`oninput`in document;if(!fr){var pr=document.createElement(`div`);pr.setAttribute(`oninput`,`return;`),fr=typeof pr.oninput==`function`}dr=fr}else dr=!1;ur=dr&&(!document.documentMode||9<document.documentMode)}function mr(){ar&&(ar.detachEvent(`onpropertychange`,hr),or=ar=null)}function hr(e){if(e.propertyName===`value`&&cr(or)){var t=[];ir(t,or,e,tn(e)),sn(sr,t)}}function gr(e,t,n){e===`focusin`?(mr(),ar=t,or=n,ar.attachEvent(`onpropertychange`,hr)):e===`focusout`&&mr()}function _r(e){if(e===`selectionchange`||e===`keyup`||e===`keydown`)return cr(or)}function vr(e,t){if(e===`click`)return cr(t)}function yr(e,t){if(e===`input`||e===`change`)return cr(t)}function br(e,t){return e===t&&(e!==0||1/e==1/t)||e!==e&&t!==t}var xr=typeof Object.is==`function`?Object.is:br;function Sr(e,t){if(xr(e,t))return!0;if(typeof e!=`object`||!e||typeof t!=`object`||!t)return!1;var n=Object.keys(e),r=Object.keys(t);if(n.length!==r.length)return!1;for(r=0;r<n.length;r++){var i=n[r];if(!xe.call(t,i)||!xr(e[i],t[i]))return!1}return!0}function Cr(e){for(;e&&e.firstChild;)e=e.firstChild;return e}function wr(e,t){var n=Cr(e);e=0;for(var r;n;){if(n.nodeType===3){if(r=e+n.textContent.length,e<=t&&r>=t)return{node:n,offset:t-e};e=r}a:{for(;n;){if(n.nextSibling){n=n.nextSibling;break a}n=n.parentNode}n=void 0}n=Cr(n)}}function Tr(e,t){return e&&t?e===t?!0:e&&e.nodeType===3?!1:t&&t.nodeType===3?Tr(e,t.parentNode):`contains`in e?e.contains(t):e.compareDocumentPosition?!!(e.compareDocumentPosition(t)&16):!1:!1}function Er(e){e=e!=null&&e.ownerDocument!=null&&e.ownerDocument.defaultView!=null?e.ownerDocument.defaultView:window;for(var t=It(e.document);t instanceof e.HTMLIFrameElement;){try{var n=typeof t.contentWindow.location.href==`string`}catch{n=!1}if(n)e=t.contentWindow;else break;t=It(e.document)}return t}function Dr(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t&&(t===`input`&&(e.type===`text`||e.type===`search`||e.type===`tel`||e.type===`url`||e.type===`password`)||t===`textarea`||e.contentEditable===`true`)}var Or=ln&&`documentMode`in document&&11>=document.documentMode,kr=null,Ar=null,jr=null,Mr=!1;function Nr(e,t,n){var r=n.window===n?n.document:n.nodeType===9?n:n.ownerDocument;Mr||kr==null||kr!==It(r)||(r=kr,`selectionStart`in r&&Dr(r)?r={start:r.selectionStart,end:r.selectionEnd}:(r=(r.ownerDocument&&r.ownerDocument.defaultView||window).getSelection(),r={anchorNode:r.anchorNode,anchorOffset:r.anchorOffset,focusNode:r.focusNode,focusOffset:r.focusOffset}),jr&&Sr(jr,r)||(jr=r,r=Td(Ar,`onSelect`),0<r.length&&(t=new bn(`onSelect`,`select`,null,t,n),e.push({event:t,listeners:r}),t.target=kr)))}function Pr(e,t){var n={};return n[e.toLowerCase()]=t.toLowerCase(),n[`Webkit`+e]=`webkit`+t,n[`Moz`+e]=`moz`+t,n}var Fr={animationend:Pr(`Animation`,`AnimationEnd`),animationiteration:Pr(`Animation`,`AnimationIteration`),animationstart:Pr(`Animation`,`AnimationStart`),transitionrun:Pr(`Transition`,`TransitionRun`),transitionstart:Pr(`Transition`,`TransitionStart`),transitioncancel:Pr(`Transition`,`TransitionCancel`),transitionend:Pr(`Transition`,`TransitionEnd`)},Ir={},Lr={};ln&&(Lr=document.createElement(`div`).style,`AnimationEvent`in window||(delete Fr.animationend.animation,delete Fr.animationiteration.animation,delete Fr.animationstart.animation),`TransitionEvent`in window||delete Fr.transitionend.transition);function Rr(e){if(Ir[e])return Ir[e];if(!Fr[e])return e;var t=Fr[e],n;for(n in t)if(t.hasOwnProperty(n)&&n in Lr)return Ir[e]=t[n];return e}var zr=Rr(`animationend`),Br=Rr(`animationiteration`),Vr=Rr(`animationstart`),Hr=Rr(`transitionrun`),Ur=Rr(`transitionstart`),Wr=Rr(`transitioncancel`),Gr=Rr(`transitionend`),Kr=new Map,qr=`abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel`.split(` `);qr.push(`scrollEnd`);function Jr(e,t){Kr.set(e,t),St(t,[e])}var Yr=typeof reportError==`function`?reportError:function(e){if(typeof window==`object`&&typeof window.ErrorEvent==`function`){var t=new window.ErrorEvent(`error`,{bubbles:!0,cancelable:!0,message:typeof e==`object`&&e&&typeof e.message==`string`?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process==`object`&&typeof process.emit==`function`){process.emit(`uncaughtException`,e);return}console.error(e)},Xr=[],Zr=0,Qr=0;function $r(){for(var e=Zr,t=Qr=Zr=0;t<e;){var n=Xr[t];Xr[t++]=null;var r=Xr[t];Xr[t++]=null;var i=Xr[t];Xr[t++]=null;var a=Xr[t];if(Xr[t++]=null,r!==null&&i!==null){var o=r.pending;o===null?i.next=i:(i.next=o.next,o.next=i),r.pending=i}a!==0&&ri(n,i,a)}}function ei(e,t,n,r){Xr[Zr++]=e,Xr[Zr++]=t,Xr[Zr++]=n,Xr[Zr++]=r,Qr|=r,e.lanes|=r,e=e.alternate,e!==null&&(e.lanes|=r)}function ti(e,t,n,r){return ei(e,t,n,r),ii(e)}function ni(e,t){return ei(e,null,null,t),ii(e)}function ri(e,t,n){e.lanes|=n;var r=e.alternate;r!==null&&(r.lanes|=n);for(var i=!1,a=e.return;a!==null;)a.childLanes|=n,r=a.alternate,r!==null&&(r.childLanes|=n),a.tag===22&&(e=a.stateNode,e===null||e._visibility&1||(i=!0)),e=a,a=a.return;return e.tag===3?(a=e.stateNode,i&&t!==null&&(i=31-Le(n),e=a.hiddenUpdates,r=e[i],r===null?e[i]=[t]:r.push(t),t.lane=n|536870912),a):null}function ii(e){if(50<uu)throw uu=0,du=null,Error(i(185));for(var t=e.return;t!==null;)e=t,t=e.return;return e.tag===3?e.stateNode:null}var ai={};function oi(e,t,n,r){this.tag=e,this.key=n,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.refCleanup=this.ref=null,this.pendingProps=t,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=r,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function si(e,t,n,r){return new oi(e,t,n,r)}function ci(e){return e=e.prototype,!(!e||!e.isReactComponent)}function li(e,t){var n=e.alternate;return n===null?(n=si(e.tag,t,e.key,e.mode),n.elementType=e.elementType,n.type=e.type,n.stateNode=e.stateNode,n.alternate=e,e.alternate=n):(n.pendingProps=t,n.type=e.type,n.flags=0,n.subtreeFlags=0,n.deletions=null),n.flags=e.flags&65011712,n.childLanes=e.childLanes,n.lanes=e.lanes,n.child=e.child,n.memoizedProps=e.memoizedProps,n.memoizedState=e.memoizedState,n.updateQueue=e.updateQueue,t=e.dependencies,n.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext},n.sibling=e.sibling,n.index=e.index,n.ref=e.ref,n.refCleanup=e.refCleanup,n}function ui(e,t){e.flags&=65011714;var n=e.alternate;return n===null?(e.childLanes=0,e.lanes=t,e.child=null,e.subtreeFlags=0,e.memoizedProps=null,e.memoizedState=null,e.updateQueue=null,e.dependencies=null,e.stateNode=null):(e.childLanes=n.childLanes,e.lanes=n.lanes,e.child=n.child,e.subtreeFlags=0,e.deletions=null,e.memoizedProps=n.memoizedProps,e.memoizedState=n.memoizedState,e.updateQueue=n.updateQueue,e.type=n.type,t=n.dependencies,e.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext}),e}function di(e,t,n,r,a,o){var s=0;if(r=e,typeof e==`function`)ci(e)&&(s=1);else if(typeof e==`string`)s=Uf(e,n,ce.current)?26:e===`html`||e===`head`||e===`body`?27:5;else a:switch(e){case k:return e=si(31,n,t,a),e.elementType=k,e.lanes=o,e;case y:return fi(n.children,a,o,t);case b:s=8,a|=24;break;case x:return e=si(12,n,t,a|2),e.elementType=x,e.lanes=o,e;case T:return e=si(13,n,t,a),e.elementType=T,e.lanes=o,e;case E:return e=si(19,n,t,a),e.elementType=E,e.lanes=o,e;default:if(typeof e==`object`&&e)switch(e.$$typeof){case C:s=10;break a;case S:s=9;break a;case w:s=11;break a;case D:s=14;break a;case O:s=16,r=null;break a}s=29,n=Error(i(130,e===null?`null`:typeof e,``)),r=null}return t=si(s,n,t,a),t.elementType=e,t.type=r,t.lanes=o,t}function fi(e,t,n,r){return e=si(7,e,r,t),e.lanes=n,e}function pi(e,t,n){return e=si(6,e,null,t),e.lanes=n,e}function mi(e){var t=si(18,null,null,0);return t.stateNode=e,t}function hi(e,t,n){return t=si(4,e.children===null?[]:e.children,e.key,t),t.lanes=n,t.stateNode={containerInfo:e.containerInfo,pendingChildren:null,implementation:e.implementation},t}var gi=new WeakMap;function _i(e,t){if(typeof e==`object`&&e){var n=gi.get(e);return n===void 0?(t={value:e,source:t,stack:be(t)},gi.set(e,t),t):n}return{value:e,source:t,stack:be(t)}}var vi=[],yi=0,bi=null,xi=0,Si=[],Ci=0,wi=null,Ti=1,Ei=``;function Di(e,t){vi[yi++]=xi,vi[yi++]=bi,bi=e,xi=t}function Oi(e,t,n){Si[Ci++]=Ti,Si[Ci++]=Ei,Si[Ci++]=wi,wi=e;var r=Ti;e=Ei;var i=32-Le(r)-1;r&=~(1<<i),n+=1;var a=32-Le(t)+i;if(30<a){var o=i-i%5;a=(r&(1<<o)-1).toString(32),r>>=o,i-=o,Ti=1<<32-Le(t)+i|n<<i|r,Ei=a+e}else Ti=1<<a|n<<i|r,Ei=e}function ki(e){e.return!==null&&(Di(e,1),Oi(e,1,0))}function Ai(e){for(;e===bi;)bi=vi[--yi],vi[yi]=null,xi=vi[--yi],vi[yi]=null;for(;e===wi;)wi=Si[--Ci],Si[Ci]=null,Ei=Si[--Ci],Si[Ci]=null,Ti=Si[--Ci],Si[Ci]=null}function ji(e,t){Si[Ci++]=Ti,Si[Ci++]=Ei,Si[Ci++]=wi,Ti=t.id,Ei=t.overflow,wi=e}var Mi=null,Ni=null,B=!1,Pi=null,Fi=!1,Ii=Error(i(519));function Li(e){throw Ui(_i(Error(i(418,1<arguments.length&&arguments[1]!==void 0&&arguments[1]?`text`:`HTML`,``)),e)),Ii}function Ri(e){var t=e.stateNode,n=e.type,r=e.memoizedProps;switch(t[ot]=e,t[st]=r,n){case`dialog`:$(`cancel`,t),$(`close`,t);break;case`iframe`:case`object`:case`embed`:$(`load`,t);break;case`video`:case`audio`:for(n=0;n<gd.length;n++)$(gd[n],t);break;case`source`:$(`error`,t);break;case`img`:case`image`:case`link`:$(`error`,t),$(`load`,t);break;case`details`:$(`toggle`,t);break;case`input`:$(`invalid`,t),Bt(t,r.value,r.defaultValue,r.checked,r.defaultChecked,r.type,r.name,!0);break;case`select`:$(`invalid`,t);break;case`textarea`:$(`invalid`,t),Wt(t,r.value,r.defaultValue,r.children)}n=r.children,typeof n!=`string`&&typeof n!=`number`&&typeof n!=`bigint`||t.textContent===``+n||!0===r.suppressHydrationWarning||jd(t.textContent,n)?(r.popover!=null&&($(`beforetoggle`,t),$(`toggle`,t)),r.onScroll!=null&&$(`scroll`,t),r.onScrollEnd!=null&&$(`scrollend`,t),r.onClick!=null&&(t.onclick=$t),t=!0):t=!1,t||Li(e,!0)}function zi(e){for(Mi=e.return;Mi;)switch(Mi.tag){case 5:case 31:case 13:Fi=!1;return;case 27:case 3:Fi=!0;return;default:Mi=Mi.return}}function Bi(e){if(e!==Mi)return!1;if(!B)return zi(e),B=!0,!1;var t=e.tag,n;if((n=t!==3&&t!==27)&&((n=t===5)&&(n=e.type,n=n===`form`||n===`button`||Ud(e.type,e.memoizedProps)),n=!n),n&&Ni&&Li(e),zi(e),t===13){if(e=e.memoizedState,e=e===null?null:e.dehydrated,!e)throw Error(i(317));Ni=uf(e)}else if(t===31){if(e=e.memoizedState,e=e===null?null:e.dehydrated,!e)throw Error(i(317));Ni=uf(e)}else t===27?(t=Ni,Zd(e.type)?(e=lf,lf=null,Ni=e):Ni=t):Ni=Mi?cf(e.stateNode.nextSibling):null;return!0}function Vi(){Ni=Mi=null,B=!1}function Hi(){var e=Pi;return e!==null&&(Xl===null?Xl=e:Xl.push.apply(Xl,e),Pi=null),e}function Ui(e){Pi===null?Pi=[e]:Pi.push(e)}var Wi=se(null),Gi=null,Ki=null;function qi(e,t,n){F(Wi,t._currentValue),t._currentValue=n}function Ji(e){e._currentValue=Wi.current,P(Wi)}function Yi(e,t,n){for(;e!==null;){var r=e.alternate;if((e.childLanes&t)===t?r!==null&&(r.childLanes&t)!==t&&(r.childLanes|=t):(e.childLanes|=t,r!==null&&(r.childLanes|=t)),e===n)break;e=e.return}}function Xi(e,t,n,r){var a=e.child;for(a!==null&&(a.return=e);a!==null;){var o=a.dependencies;if(o!==null){var s=a.child;o=o.firstContext;a:for(;o!==null;){var c=o;o=a;for(var l=0;l<t.length;l++)if(c.context===t[l]){o.lanes|=n,c=o.alternate,c!==null&&(c.lanes|=n),Yi(o.return,n,e),r||(s=null);break a}o=c.next}}else if(a.tag===18){if(s=a.return,s===null)throw Error(i(341));s.lanes|=n,o=s.alternate,o!==null&&(o.lanes|=n),Yi(s,n,e),s=null}else s=a.child;if(s!==null)s.return=a;else for(s=a;s!==null;){if(s===e){s=null;break}if(a=s.sibling,a!==null){a.return=s.return,s=a;break}s=s.return}a=s}}function Zi(e,t,n,r){e=null;for(var a=t,o=!1;a!==null;){if(!o){if(a.flags&524288)o=!0;else if(a.flags&262144)break}if(a.tag===10){var s=a.alternate;if(s===null)throw Error(i(387));if(s=s.memoizedProps,s!==null){var c=a.type;xr(a.pendingProps.value,s.value)||(e===null?e=[c]:e.push(c))}}else if(a===de.current){if(s=a.alternate,s===null)throw Error(i(387));s.memoizedState.memoizedState!==a.memoizedState.memoizedState&&(e===null?e=[Qf]:e.push(Qf))}a=a.return}e!==null&&Xi(t,e,n,r),t.flags|=262144}function Qi(e){for(e=e.firstContext;e!==null;){if(!xr(e.context._currentValue,e.memoizedValue))return!0;e=e.next}return!1}function $i(e){Gi=e,Ki=null,e=e.dependencies,e!==null&&(e.firstContext=null)}function ea(e){return ta(Gi,e)}function V(e,t){return Gi===null&&$i(e),ta(e,t)}function ta(e,t){var n=t._currentValue;if(t={context:t,memoizedValue:n,next:null},Ki===null){if(e===null)throw Error(i(308));Ki=t,e.dependencies={lanes:0,firstContext:t},e.flags|=524288}else Ki=Ki.next=t;return n}var na=typeof AbortController<`u`?AbortController:function(){var e=[],t=this.signal={aborted:!1,addEventListener:function(t,n){e.push(n)}};this.abort=function(){t.aborted=!0,e.forEach(function(e){return e()})}},ra=t.unstable_scheduleCallback,ia=t.unstable_NormalPriority,aa={$$typeof:C,Consumer:null,Provider:null,_currentValue:null,_currentValue2:null,_threadCount:0};function oa(){return{controller:new na,data:new Map,refCount:0}}function sa(e){e.refCount--,e.refCount===0&&ra(ia,function(){e.controller.abort()})}var ca=null,la=0,ua=0,da=null;function fa(e,t){if(ca===null){var n=ca=[];la=0,ua=ud(),da={status:`pending`,value:void 0,then:function(e){n.push(e)}}}return la++,t.then(pa,pa),t}function pa(){if(--la===0&&ca!==null){da!==null&&(da.status=`fulfilled`);var e=ca;ca=null,ua=0,da=null;for(var t=0;t<e.length;t++)(0,e[t])()}}function ma(e,t){var n=[],r={status:`pending`,value:null,reason:null,then:function(e){n.push(e)}};return e.then(function(){r.status=`fulfilled`,r.value=t;for(var e=0;e<n.length;e++)(0,n[e])(t)},function(e){for(r.status=`rejected`,r.reason=e,e=0;e<n.length;e++)(0,n[e])(void 0)}),r}var ha=j.S;j.S=function(e,t){$l=Ee(),typeof t==`object`&&t&&typeof t.then==`function`&&fa(e,t),ha!==null&&ha(e,t)};var ga=se(null);function _a(){var e=ga.current;return e===null?Ll.pooledCache:e}function va(e,t){t===null?F(ga,ga.current):F(ga,t.pool)}function ya(){var e=_a();return e===null?null:{parent:aa._currentValue,pool:e}}var ba=Error(i(460)),xa=Error(i(474)),Sa=Error(i(542)),Ca={then:function(){}};function wa(e){return e=e.status,e===`fulfilled`||e===`rejected`}function Ta(e,t,n){switch(n=e[n],n===void 0?e.push(t):n!==t&&(t.then($t,$t),t=n),t.status){case`fulfilled`:return t.value;case`rejected`:throw e=t.reason,ka(e),e;default:if(typeof t.status==`string`)t.then($t,$t);else{if(e=Ll,e!==null&&100<e.shellSuspendCounter)throw Error(i(482));e=t,e.status=`pending`,e.then(function(e){if(t.status===`pending`){var n=t;n.status=`fulfilled`,n.value=e}},function(e){if(t.status===`pending`){var n=t;n.status=`rejected`,n.reason=e}})}switch(t.status){case`fulfilled`:return t.value;case`rejected`:throw e=t.reason,ka(e),e}throw Da=t,ba}}function Ea(e){try{var t=e._init;return t(e._payload)}catch(e){throw typeof e==`object`&&e&&typeof e.then==`function`?(Da=e,ba):e}}var Da=null;function Oa(){if(Da===null)throw Error(i(459));var e=Da;return Da=null,e}function ka(e){if(e===ba||e===Sa)throw Error(i(483))}var Aa=null,ja=0;function Ma(e){var t=ja;return ja+=1,Aa===null&&(Aa=[]),Ta(Aa,e,t)}function Na(e,t){t=t.props.ref,e.ref=t===void 0?null:t}function Pa(e,t){throw t.$$typeof===h?Error(i(525)):(e=Object.prototype.toString.call(t),Error(i(31,e===`[object Object]`?`object with keys {`+Object.keys(t).join(`, `)+`}`:e)))}function Fa(e){function t(t,n){if(e){var r=t.deletions;r===null?(t.deletions=[n],t.flags|=16):r.push(n)}}function n(n,r){if(!e)return null;for(;r!==null;)t(n,r),r=r.sibling;return null}function r(e){for(var t=new Map;e!==null;)e.key===null?t.set(e.index,e):t.set(e.key,e),e=e.sibling;return t}function a(e,t){return e=li(e,t),e.index=0,e.sibling=null,e}function o(t,n,r){return t.index=r,e?(r=t.alternate,r===null?(t.flags|=67108866,n):(r=r.index,r<n?(t.flags|=67108866,n):r)):(t.flags|=1048576,n)}function s(t){return e&&t.alternate===null&&(t.flags|=67108866),t}function c(e,t,n,r){return t===null||t.tag!==6?(t=pi(n,e.mode,r),t.return=e,t):(t=a(t,n),t.return=e,t)}function l(e,t,n,r){var i=n.type;return i===y?d(e,t,n.props.children,r,n.key):t!==null&&(t.elementType===i||typeof i==`object`&&i&&i.$$typeof===O&&Ea(i)===t.type)?(t=a(t,n.props),Na(t,n),t.return=e,t):(t=di(n.type,n.key,n.props,null,e.mode,r),Na(t,n),t.return=e,t)}function u(e,t,n,r){return t===null||t.tag!==4||t.stateNode.containerInfo!==n.containerInfo||t.stateNode.implementation!==n.implementation?(t=hi(n,e.mode,r),t.return=e,t):(t=a(t,n.children||[]),t.return=e,t)}function d(e,t,n,r,i){return t===null||t.tag!==7?(t=fi(n,e.mode,r,i),t.return=e,t):(t=a(t,n),t.return=e,t)}function f(e,t,n){if(typeof t==`string`&&t!==``||typeof t==`number`||typeof t==`bigint`)return t=pi(``+t,e.mode,n),t.return=e,t;if(typeof t==`object`&&t){switch(t.$$typeof){case _:return n=di(t.type,t.key,t.props,null,e.mode,n),Na(n,t),n.return=e,n;case v:return t=hi(t,e.mode,n),t.return=e,t;case O:return t=Ea(t),f(e,t,n)}if(ie(t)||te(t))return t=fi(t,e.mode,n,null),t.return=e,t;if(typeof t.then==`function`)return f(e,Ma(t),n);if(t.$$typeof===C)return f(e,V(e,t),n);Pa(e,t)}return null}function p(e,t,n,r){var i=t===null?null:t.key;if(typeof n==`string`&&n!==``||typeof n==`number`||typeof n==`bigint`)return i===null?c(e,t,``+n,r):null;if(typeof n==`object`&&n){switch(n.$$typeof){case _:return n.key===i?l(e,t,n,r):null;case v:return n.key===i?u(e,t,n,r):null;case O:return n=Ea(n),p(e,t,n,r)}if(ie(n)||te(n))return i===null?d(e,t,n,r,null):null;if(typeof n.then==`function`)return p(e,t,Ma(n),r);if(n.$$typeof===C)return p(e,t,V(e,n),r);Pa(e,n)}return null}function m(e,t,n,r,i){if(typeof r==`string`&&r!==``||typeof r==`number`||typeof r==`bigint`)return e=e.get(n)||null,c(t,e,``+r,i);if(typeof r==`object`&&r){switch(r.$$typeof){case _:return e=e.get(r.key===null?n:r.key)||null,l(t,e,r,i);case v:return e=e.get(r.key===null?n:r.key)||null,u(t,e,r,i);case O:return r=Ea(r),m(e,t,n,r,i)}if(ie(r)||te(r))return e=e.get(n)||null,d(t,e,r,i,null);if(typeof r.then==`function`)return m(e,t,n,Ma(r),i);if(r.$$typeof===C)return m(e,t,n,V(t,r),i);Pa(t,r)}return null}function h(i,a,s,c){for(var l=null,u=null,d=a,h=a=0,g=null;d!==null&&h<s.length;h++){d.index>h?(g=d,d=null):g=d.sibling;var _=p(i,d,s[h],c);if(_===null){d===null&&(d=g);break}e&&d&&_.alternate===null&&t(i,d),a=o(_,a,h),u===null?l=_:u.sibling=_,u=_,d=g}if(h===s.length)return n(i,d),B&&Di(i,h),l;if(d===null){for(;h<s.length;h++)d=f(i,s[h],c),d!==null&&(a=o(d,a,h),u===null?l=d:u.sibling=d,u=d);return B&&Di(i,h),l}for(d=r(d);h<s.length;h++)g=m(d,i,h,s[h],c),g!==null&&(e&&g.alternate!==null&&d.delete(g.key===null?h:g.key),a=o(g,a,h),u===null?l=g:u.sibling=g,u=g);return e&&d.forEach(function(e){return t(i,e)}),B&&Di(i,h),l}function g(a,s,c,l){if(c==null)throw Error(i(151));for(var u=null,d=null,h=s,g=s=0,_=null,v=c.next();h!==null&&!v.done;g++,v=c.next()){h.index>g?(_=h,h=null):_=h.sibling;var y=p(a,h,v.value,l);if(y===null){h===null&&(h=_);break}e&&h&&y.alternate===null&&t(a,h),s=o(y,s,g),d===null?u=y:d.sibling=y,d=y,h=_}if(v.done)return n(a,h),B&&Di(a,g),u;if(h===null){for(;!v.done;g++,v=c.next())v=f(a,v.value,l),v!==null&&(s=o(v,s,g),d===null?u=v:d.sibling=v,d=v);return B&&Di(a,g),u}for(h=r(h);!v.done;g++,v=c.next())v=m(h,a,g,v.value,l),v!==null&&(e&&v.alternate!==null&&h.delete(v.key===null?g:v.key),s=o(v,s,g),d===null?u=v:d.sibling=v,d=v);return e&&h.forEach(function(e){return t(a,e)}),B&&Di(a,g),u}function b(e,r,o,c){if(typeof o==`object`&&o&&o.type===y&&o.key===null&&(o=o.props.children),typeof o==`object`&&o){switch(o.$$typeof){case _:a:{for(var l=o.key;r!==null;){if(r.key===l){if(l=o.type,l===y){if(r.tag===7){n(e,r.sibling),c=a(r,o.props.children),c.return=e,e=c;break a}}else if(r.elementType===l||typeof l==`object`&&l&&l.$$typeof===O&&Ea(l)===r.type){n(e,r.sibling),c=a(r,o.props),Na(c,o),c.return=e,e=c;break a}n(e,r);break}t(e,r),r=r.sibling}o.type===y?(c=fi(o.props.children,e.mode,c,o.key),c.return=e,e=c):(c=di(o.type,o.key,o.props,null,e.mode,c),Na(c,o),c.return=e,e=c)}return s(e);case v:a:{for(l=o.key;r!==null;){if(r.key===l){if(r.tag===4&&r.stateNode.containerInfo===o.containerInfo&&r.stateNode.implementation===o.implementation){n(e,r.sibling),c=a(r,o.children||[]),c.return=e,e=c;break a}n(e,r);break}t(e,r),r=r.sibling}c=hi(o,e.mode,c),c.return=e,e=c}return s(e);case O:return o=Ea(o),b(e,r,o,c)}if(ie(o))return h(e,r,o,c);if(te(o)){if(l=te(o),typeof l!=`function`)throw Error(i(150));return o=l.call(o),g(e,r,o,c)}if(typeof o.then==`function`)return b(e,r,Ma(o),c);if(o.$$typeof===C)return b(e,r,V(e,o),c);Pa(e,o)}return typeof o==`string`&&o!==``||typeof o==`number`||typeof o==`bigint`?(o=``+o,r!==null&&r.tag===6?(n(e,r.sibling),c=a(r,o),c.return=e,e=c):(n(e,r),c=pi(o,e.mode,c),c.return=e,e=c),s(e)):n(e,r)}return function(e,t,n,r){try{ja=0;var i=b(e,t,n,r);return Aa=null,i}catch(t){if(t===ba||t===Sa)throw t;var a=si(29,t,null,e.mode);return a.lanes=r,a.return=e,a}}}var Ia=Fa(!0),La=Fa(!1),Ra=!1;function za(e){e.updateQueue={baseState:e.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,lanes:0,hiddenCallbacks:null},callbacks:null}}function Ba(e,t){e=e.updateQueue,t.updateQueue===e&&(t.updateQueue={baseState:e.baseState,firstBaseUpdate:e.firstBaseUpdate,lastBaseUpdate:e.lastBaseUpdate,shared:e.shared,callbacks:null})}function Va(e){return{lane:e,tag:0,payload:null,callback:null,next:null}}function Ha(e,t,n){var r=e.updateQueue;if(r===null)return null;if(r=r.shared,J&2){var i=r.pending;return i===null?t.next=t:(t.next=i.next,i.next=t),r.pending=t,t=ii(e),ri(e,null,n),t}return ei(e,r,t,n),ii(e)}function Ua(e,t,n){if(t=t.updateQueue,t!==null&&(t=t.shared,n&4194048)){var r=t.lanes;r&=e.pendingLanes,n|=r,t.lanes=n,$e(e,n)}}function Wa(e,t){var n=e.updateQueue,r=e.alternate;if(r!==null&&(r=r.updateQueue,n===r)){var i=null,a=null;if(n=n.firstBaseUpdate,n!==null){do{var o={lane:n.lane,tag:n.tag,payload:n.payload,callback:null,next:null};a===null?i=a=o:a=a.next=o,n=n.next}while(n!==null);a===null?i=a=t:a=a.next=t}else i=a=t;n={baseState:r.baseState,firstBaseUpdate:i,lastBaseUpdate:a,shared:r.shared,callbacks:r.callbacks},e.updateQueue=n}else e=n.lastBaseUpdate,e===null?n.firstBaseUpdate=t:e.next=t,n.lastBaseUpdate=t}var Ga=!1;function Ka(){if(Ga){var e=da;if(e!==null)throw e}}function qa(e,t,n,r){Ga=!1;var i=e.updateQueue;Ra=!1;var a=i.firstBaseUpdate,o=i.lastBaseUpdate,s=i.shared.pending;if(s!==null){i.shared.pending=null;var c=s,l=c.next;c.next=null,o===null?a=l:o.next=l,o=c;var u=e.alternate;u!==null&&(u=u.updateQueue,s=u.lastBaseUpdate,s!==o&&(s===null?u.firstBaseUpdate=l:s.next=l,u.lastBaseUpdate=c))}if(a!==null){var d=i.baseState;o=0,u=l=c=null,s=a;do{var f=s.lane&-536870913,m=f!==s.lane;if(m?(X&f)===f:(r&f)===f){f!==0&&f===ua&&(Ga=!0),u!==null&&(u=u.next={lane:0,tag:s.tag,payload:s.payload,callback:null,next:null});a:{var h=e,g=s;f=t;var _=n;switch(g.tag){case 1:if(h=g.payload,typeof h==`function`){d=h.call(_,d,f);break a}d=h;break a;case 3:h.flags=h.flags&-65537|128;case 0:if(h=g.payload,f=typeof h==`function`?h.call(_,d,f):h,f==null)break a;d=p({},d,f);break a;case 2:Ra=!0}}f=s.callback,f!==null&&(e.flags|=64,m&&(e.flags|=8192),m=i.callbacks,m===null?i.callbacks=[f]:m.push(f))}else m={lane:f,tag:s.tag,payload:s.payload,callback:s.callback,next:null},u===null?(l=u=m,c=d):u=u.next=m,o|=f;if(s=s.next,s===null){if(s=i.shared.pending,s===null)break;m=s,s=m.next,m.next=null,i.lastBaseUpdate=m,i.shared.pending=null}}while(1);u===null&&(c=d),i.baseState=c,i.firstBaseUpdate=l,i.lastBaseUpdate=u,a===null&&(i.shared.lanes=0),Wl|=o,e.lanes=o,e.memoizedState=d}}function Ja(e,t){if(typeof e!=`function`)throw Error(i(191,e));e.call(t)}function Ya(e,t){var n=e.callbacks;if(n!==null)for(e.callbacks=null,e=0;e<n.length;e++)Ja(n[e],t)}var Xa=se(null),Za=se(0);function Qa(e,t){e=Hl,F(Za,e),F(Xa,t),Hl=e|t.baseLanes}function $a(){F(Za,Hl),F(Xa,Xa.current)}function eo(){Hl=Za.current,P(Xa),P(Za)}var to=se(null),no=null;function ro(e){var t=e.alternate;F(co,co.current&1),F(to,e),no===null&&(t===null||Xa.current!==null||t.memoizedState!==null)&&(no=e)}function io(e){F(co,co.current),F(to,e),no===null&&(no=e)}function ao(e){e.tag===22?(F(co,co.current),F(to,e),no===null&&(no=e)):oo(e)}function oo(){F(co,co.current),F(to,to.current)}function so(e){P(to),no===e&&(no=null),P(co)}var co=se(0);function lo(e){for(var t=e;t!==null;){if(t.tag===13){var n=t.memoizedState;if(n!==null&&(n=n.dehydrated,n===null||af(n)||of(n)))return t}else if(t.tag===19&&(t.memoizedProps.revealOrder===`forwards`||t.memoizedProps.revealOrder===`backwards`||t.memoizedProps.revealOrder===`unstable_legacy-backwards`||t.memoizedProps.revealOrder===`together`)){if(t.flags&128)return t}else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return null;t=t.return}t.sibling.return=t.return,t=t.sibling}return null}var uo=0,H=null,U=null,fo=null,po=!1,W=!1,mo=!1,ho=0,go=0,_o=null,vo=0;function G(){throw Error(i(321))}function yo(e,t){if(t===null)return!1;for(var n=0;n<t.length&&n<e.length;n++)if(!xr(e[n],t[n]))return!1;return!0}function bo(e,t,n,r,i,a){return uo=a,H=t,t.memoizedState=null,t.updateQueue=null,t.lanes=0,j.H=e===null||e.memoizedState===null?Is:Ls,mo=!1,a=n(r,i),mo=!1,W&&(a=So(t,n,r,i)),xo(e),a}function xo(e){j.H=Fs;var t=U!==null&&U.next!==null;if(uo=0,fo=U=H=null,po=!1,go=0,_o=null,t)throw Error(i(300));e===null||ec||(e=e.dependencies,e!==null&&Qi(e)&&(ec=!0))}function So(e,t,n,r){H=e;var a=0;do{if(W&&(_o=null),go=0,W=!1,25<=a)throw Error(i(301));if(a+=1,fo=U=null,e.updateQueue!=null){var o=e.updateQueue;o.lastEffect=null,o.events=null,o.stores=null,o.memoCache!=null&&(o.memoCache.index=0)}j.H=Rs,o=t(n,r)}while(W);return o}function Co(){var e=j.H,t=e.useState()[0];return t=typeof t.then==`function`?Ao(t):t,e=e.useState()[0],(U===null?null:U.memoizedState)!==e&&(H.flags|=1024),t}function wo(){var e=ho!==0;return ho=0,e}function To(e,t,n){t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~n}function Eo(e){if(po){for(e=e.memoizedState;e!==null;){var t=e.queue;t!==null&&(t.pending=null),e=e.next}po=!1}uo=0,fo=U=H=null,W=!1,go=ho=0,_o=null}function Do(){var e={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return fo===null?H.memoizedState=fo=e:fo=fo.next=e,fo}function Oo(){if(U===null){var e=H.alternate;e=e===null?null:e.memoizedState}else e=U.next;var t=fo===null?H.memoizedState:fo.next;if(t!==null)fo=t,U=e;else{if(e===null)throw H.alternate===null?Error(i(467)):Error(i(310));U=e,e={memoizedState:U.memoizedState,baseState:U.baseState,baseQueue:U.baseQueue,queue:U.queue,next:null},fo===null?H.memoizedState=fo=e:fo=fo.next=e}return fo}function ko(){return{lastEffect:null,events:null,stores:null,memoCache:null}}function Ao(e){var t=go;return go+=1,_o===null&&(_o=[]),e=Ta(_o,e,t),t=H,(fo===null?t.memoizedState:fo.next)===null&&(t=t.alternate,j.H=t===null||t.memoizedState===null?Is:Ls),e}function jo(e){if(typeof e==`object`&&e){if(typeof e.then==`function`)return Ao(e);if(e.$$typeof===C)return ea(e)}throw Error(i(438,String(e)))}function Mo(e){var t=null,n=H.updateQueue;if(n!==null&&(t=n.memoCache),t==null){var r=H.alternate;r!==null&&(r=r.updateQueue,r!==null&&(r=r.memoCache,r!=null&&(t={data:r.data.map(function(e){return e.slice()}),index:0})))}if(t??(t={data:[],index:0}),n===null&&(n=ko(),H.updateQueue=n),n.memoCache=t,n=t.data[t.index],n===void 0)for(n=t.data[t.index]=Array(e),r=0;r<e;r++)n[r]=A;return t.index++,n}function No(e,t){return typeof t==`function`?t(e):t}function Po(e){return Fo(Oo(),U,e)}function Fo(e,t,n){var r=e.queue;if(r===null)throw Error(i(311));r.lastRenderedReducer=n;var a=e.baseQueue,o=r.pending;if(o!==null){if(a!==null){var s=a.next;a.next=o.next,o.next=s}t.baseQueue=a=o,r.pending=null}if(o=e.baseState,a===null)e.memoizedState=o;else{t=a.next;var c=s=null,l=null,u=t,d=!1;do{var f=u.lane&-536870913;if(f===u.lane?(uo&f)===f:(X&f)===f){var p=u.revertLane;if(p===0)l!==null&&(l=l.next={lane:0,revertLane:0,gesture:null,action:u.action,hasEagerState:u.hasEagerState,eagerState:u.eagerState,next:null}),f===ua&&(d=!0);else if((uo&p)===p){u=u.next,p===ua&&(d=!0);continue}else f={lane:0,revertLane:u.revertLane,gesture:null,action:u.action,hasEagerState:u.hasEagerState,eagerState:u.eagerState,next:null},l===null?(c=l=f,s=o):l=l.next=f,H.lanes|=p,Wl|=p;f=u.action,mo&&n(o,f),o=u.hasEagerState?u.eagerState:n(o,f)}else p={lane:f,revertLane:u.revertLane,gesture:u.gesture,action:u.action,hasEagerState:u.hasEagerState,eagerState:u.eagerState,next:null},l===null?(c=l=p,s=o):l=l.next=p,H.lanes|=f,Wl|=f;u=u.next}while(u!==null&&u!==t);if(l===null?s=o:l.next=c,!xr(o,e.memoizedState)&&(ec=!0,d&&(n=da,n!==null)))throw n;e.memoizedState=o,e.baseState=s,e.baseQueue=l,r.lastRenderedState=o}return a===null&&(r.lanes=0),[e.memoizedState,r.dispatch]}function Io(e){var t=Oo(),n=t.queue;if(n===null)throw Error(i(311));n.lastRenderedReducer=e;var r=n.dispatch,a=n.pending,o=t.memoizedState;if(a!==null){n.pending=null;var s=a=a.next;do o=e(o,s.action),s=s.next;while(s!==a);xr(o,t.memoizedState)||(ec=!0),t.memoizedState=o,t.baseQueue===null&&(t.baseState=o),n.lastRenderedState=o}return[o,r]}function Lo(e,t,n){var r=H,a=Oo(),o=B;if(o){if(n===void 0)throw Error(i(407));n=n()}else n=t();var s=!xr((U||a).memoizedState,n);if(s&&(a.memoizedState=n,ec=!0),a=a.queue,ss(Bo.bind(null,r,a,e),[e]),a.getSnapshot!==t||s||fo!==null&&fo.memoizedState.tag&1){if(r.flags|=2048,ns(9,{destroy:void 0},zo.bind(null,r,a,n,t),null),Ll===null)throw Error(i(349));o||uo&127||Ro(r,t,n)}return n}function Ro(e,t,n){e.flags|=16384,e={getSnapshot:t,value:n},t=H.updateQueue,t===null?(t=ko(),H.updateQueue=t,t.stores=[e]):(n=t.stores,n===null?t.stores=[e]:n.push(e))}function zo(e,t,n,r){t.value=n,t.getSnapshot=r,Vo(t)&&K(e)}function Bo(e,t,n){return n(function(){Vo(t)&&K(e)})}function Vo(e){var t=e.getSnapshot;e=e.value;try{var n=t();return!xr(e,n)}catch{return!0}}function K(e){var t=ni(e,2);t!==null&&mu(t,e,2)}function Ho(e){var t=Do();if(typeof e==`function`){var n=e;if(e=n(),mo){Ie(!0);try{n()}finally{Ie(!1)}}}return t.memoizedState=t.baseState=e,t.queue={pending:null,lanes:0,dispatch:null,lastRenderedReducer:No,lastRenderedState:e},t}function Uo(e,t,n,r){return e.baseState=n,Fo(e,U,typeof r==`function`?r:No)}function Wo(e,t,n,r,a){if(Ms(e))throw Error(i(485));if(e=t.action,e!==null){var o={payload:a,action:e,next:null,isTransition:!0,status:`pending`,value:null,reason:null,listeners:[],then:function(e){o.listeners.push(e)}};j.T===null?o.isTransition=!1:n(!0),r(o),n=t.pending,n===null?(o.next=t.pending=o,Go(t,o)):(o.next=n.next,t.pending=n.next=o)}}function Go(e,t){var n=t.action,r=t.payload,i=e.state;if(t.isTransition){var a=j.T,o={};j.T=o;try{var s=n(i,r),c=j.S;c!==null&&c(o,s),Ko(e,t,s)}catch(n){Jo(e,t,n)}finally{a!==null&&o.types!==null&&(a.types=o.types),j.T=a}}else try{a=n(i,r),Ko(e,t,a)}catch(n){Jo(e,t,n)}}function Ko(e,t,n){typeof n==`object`&&n&&typeof n.then==`function`?n.then(function(n){qo(e,t,n)},function(n){return Jo(e,t,n)}):qo(e,t,n)}function qo(e,t,n){t.status=`fulfilled`,t.value=n,Yo(t),e.state=n,t=e.pending,t!==null&&(n=t.next,n===t?e.pending=null:(n=n.next,t.next=n,Go(e,n)))}function Jo(e,t,n){var r=e.pending;if(e.pending=null,r!==null){r=r.next;do t.status=`rejected`,t.reason=n,Yo(t),t=t.next;while(t!==r)}e.action=null}function Yo(e){e=e.listeners;for(var t=0;t<e.length;t++)(0,e[t])()}function Xo(e,t){return t}function Zo(e,t){if(B){var n=Ll.formState;if(n!==null){a:{var r=H;if(B){if(Ni){b:{for(var i=Ni,a=Fi;i.nodeType!==8;)if(!a||(i=cf(i.nextSibling),i===null)){i=null;break b}a=i.data,i=a===`F!`||a===`F`?i:null}if(i){Ni=cf(i.nextSibling),r=i.data===`F!`;break a}}Li(r)}r=!1}r&&(t=n[0])}}return n=Do(),n.memoizedState=n.baseState=t,r={pending:null,lanes:0,dispatch:null,lastRenderedReducer:Xo,lastRenderedState:t},n.queue=r,n=ks.bind(null,H,r),r.dispatch=n,r=Ho(!1),a=js.bind(null,H,!1,r.queue),r=Do(),i={state:t,dispatch:null,action:e,pending:null},r.queue=i,n=Wo.bind(null,H,i,a,n),i.dispatch=n,r.memoizedState=e,[t,n,!1]}function Qo(e){return $o(Oo(),U,e)}function $o(e,t,n){if(t=Fo(e,t,Xo)[0],e=Po(No)[0],typeof t==`object`&&t&&typeof t.then==`function`)try{var r=Ao(t)}catch(e){throw e===ba?Sa:e}else r=t;t=Oo();var i=t.queue,a=i.dispatch;return n!==t.memoizedState&&(H.flags|=2048,ns(9,{destroy:void 0},es.bind(null,i,n),null)),[r,a,e]}function es(e,t){e.action=t}function ts(e){var t=Oo(),n=U;if(n!==null)return $o(t,n,e);Oo(),t=t.memoizedState,n=Oo();var r=n.queue.dispatch;return n.memoizedState=e,[t,r,!1]}function ns(e,t,n,r){return e={tag:e,create:n,deps:r,inst:t,next:null},t=H.updateQueue,t===null&&(t=ko(),H.updateQueue=t),n=t.lastEffect,n===null?t.lastEffect=e.next=e:(r=n.next,n.next=e,e.next=r,t.lastEffect=e),e}function rs(){return Oo().memoizedState}function is(e,t,n,r){var i=Do();H.flags|=e,i.memoizedState=ns(1|t,{destroy:void 0},n,r===void 0?null:r)}function as(e,t,n,r){var i=Oo();r=r===void 0?null:r;var a=i.memoizedState.inst;U!==null&&r!==null&&yo(r,U.memoizedState.deps)?i.memoizedState=ns(t,a,n,r):(H.flags|=e,i.memoizedState=ns(1|t,a,n,r))}function os(e,t){is(8390656,8,e,t)}function ss(e,t){as(2048,8,e,t)}function cs(e){H.flags|=4;var t=H.updateQueue;if(t===null)t=ko(),H.updateQueue=t,t.events=[e];else{var n=t.events;n===null?t.events=[e]:n.push(e)}}function ls(e){var t=Oo().memoizedState;return cs({ref:t,nextImpl:e}),function(){if(J&2)throw Error(i(440));return t.impl.apply(void 0,arguments)}}function us(e,t){return as(4,2,e,t)}function ds(e,t){return as(4,4,e,t)}function fs(e,t){if(typeof t==`function`){e=e();var n=t(e);return function(){typeof n==`function`?n():t(null)}}if(t!=null)return e=e(),t.current=e,function(){t.current=null}}function ps(e,t,n){n=n==null?null:n.concat([e]),as(4,4,fs.bind(null,t,e),n)}function ms(){}function hs(e,t){var n=Oo();t=t===void 0?null:t;var r=n.memoizedState;return t!==null&&yo(t,r[1])?r[0]:(n.memoizedState=[e,t],e)}function gs(e,t){var n=Oo();t=t===void 0?null:t;var r=n.memoizedState;if(t!==null&&yo(t,r[1]))return r[0];if(r=e(),mo){Ie(!0);try{e()}finally{Ie(!1)}}return n.memoizedState=[r,t],r}function _s(e,t,n){return n===void 0||uo&1073741824&&!(X&261930)?e.memoizedState=t:(e.memoizedState=n,e=pu(),H.lanes|=e,Wl|=e,n)}function vs(e,t,n,r){return xr(n,t)?n:Xa.current===null?!(uo&42)||uo&1073741824&&!(X&261930)?(ec=!0,e.memoizedState=n):(e=pu(),H.lanes|=e,Wl|=e,t):(e=_s(e,n,r),xr(e,t)||(ec=!0),e)}function ys(e,t,n,r,i){var a=M.p;M.p=a!==0&&8>a?a:8;var o=j.T,s={};j.T=s,js(e,!1,t,n);try{var c=i(),l=j.S;l!==null&&l(s,c),typeof c==`object`&&c&&typeof c.then==`function`?As(e,t,ma(c,r),fu(e)):As(e,t,r,fu(e))}catch(n){As(e,t,{then:function(){},status:`rejected`,reason:n},fu())}finally{M.p=a,o!==null&&s.types!==null&&(o.types=s.types),j.T=o}}function bs(){}function xs(e,t,n,r){if(e.tag!==5)throw Error(i(476));var a=Ss(e).queue;ys(e,a,t,ae,n===null?bs:function(){return Cs(e),n(r)})}function Ss(e){var t=e.memoizedState;if(t!==null)return t;t={memoizedState:ae,baseState:ae,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:No,lastRenderedState:ae},next:null};var n={};return t.next={memoizedState:n,baseState:n,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:No,lastRenderedState:n},next:null},e.memoizedState=t,e=e.alternate,e!==null&&(e.memoizedState=t),t}function Cs(e){var t=Ss(e);t.next===null&&(t=e.alternate.memoizedState),As(e,t.next.queue,{},fu())}function ws(){return ea(Qf)}function Ts(){return Oo().memoizedState}function Es(){return Oo().memoizedState}function Ds(e){for(var t=e.return;t!==null;){switch(t.tag){case 24:case 3:var n=fu();e=Va(n);var r=Ha(t,e,n);r!==null&&(mu(r,t,n),Ua(r,t,n)),t={cache:oa()},e.payload=t;return}t=t.return}}function Os(e,t,n){var r=fu();n={lane:r,revertLane:0,gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null},Ms(e)?Ns(t,n):(n=ti(e,t,n,r),n!==null&&(mu(n,e,r),Ps(n,t,r)))}function ks(e,t,n){As(e,t,n,fu())}function As(e,t,n,r){var i={lane:r,revertLane:0,gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null};if(Ms(e))Ns(t,i);else{var a=e.alternate;if(e.lanes===0&&(a===null||a.lanes===0)&&(a=t.lastRenderedReducer,a!==null))try{var o=t.lastRenderedState,s=a(o,n);if(i.hasEagerState=!0,i.eagerState=s,xr(s,o))return ei(e,t,i,0),Ll===null&&$r(),!1}catch{}if(n=ti(e,t,i,r),n!==null)return mu(n,e,r),Ps(n,t,r),!0}return!1}function js(e,t,n,r){if(r={lane:2,revertLane:ud(),gesture:null,action:r,hasEagerState:!1,eagerState:null,next:null},Ms(e)){if(t)throw Error(i(479))}else t=ti(e,n,r,2),t!==null&&mu(t,e,2)}function Ms(e){var t=e.alternate;return e===H||t!==null&&t===H}function Ns(e,t){W=po=!0;var n=e.pending;n===null?t.next=t:(t.next=n.next,n.next=t),e.pending=t}function Ps(e,t,n){if(n&4194048){var r=t.lanes;r&=e.pendingLanes,n|=r,t.lanes=n,$e(e,n)}}var Fs={readContext:ea,use:jo,useCallback:G,useContext:G,useEffect:G,useImperativeHandle:G,useLayoutEffect:G,useInsertionEffect:G,useMemo:G,useReducer:G,useRef:G,useState:G,useDebugValue:G,useDeferredValue:G,useTransition:G,useSyncExternalStore:G,useId:G,useHostTransitionStatus:G,useFormState:G,useActionState:G,useOptimistic:G,useMemoCache:G,useCacheRefresh:G};Fs.useEffectEvent=G;var Is={readContext:ea,use:jo,useCallback:function(e,t){return Do().memoizedState=[e,t===void 0?null:t],e},useContext:ea,useEffect:os,useImperativeHandle:function(e,t,n){n=n==null?null:n.concat([e]),is(4194308,4,fs.bind(null,t,e),n)},useLayoutEffect:function(e,t){return is(4194308,4,e,t)},useInsertionEffect:function(e,t){is(4,2,e,t)},useMemo:function(e,t){var n=Do();t=t===void 0?null:t;var r=e();if(mo){Ie(!0);try{e()}finally{Ie(!1)}}return n.memoizedState=[r,t],r},useReducer:function(e,t,n){var r=Do();if(n!==void 0){var i=n(t);if(mo){Ie(!0);try{n(t)}finally{Ie(!1)}}}else i=t;return r.memoizedState=r.baseState=i,e={pending:null,lanes:0,dispatch:null,lastRenderedReducer:e,lastRenderedState:i},r.queue=e,e=e.dispatch=Os.bind(null,H,e),[r.memoizedState,e]},useRef:function(e){var t=Do();return e={current:e},t.memoizedState=e},useState:function(e){e=Ho(e);var t=e.queue,n=ks.bind(null,H,t);return t.dispatch=n,[e.memoizedState,n]},useDebugValue:ms,useDeferredValue:function(e,t){return _s(Do(),e,t)},useTransition:function(){var e=Ho(!1);return e=ys.bind(null,H,e.queue,!0,!1),Do().memoizedState=e,[!1,e]},useSyncExternalStore:function(e,t,n){var r=H,a=Do();if(B){if(n===void 0)throw Error(i(407));n=n()}else{if(n=t(),Ll===null)throw Error(i(349));X&127||Ro(r,t,n)}a.memoizedState=n;var o={value:n,getSnapshot:t};return a.queue=o,os(Bo.bind(null,r,o,e),[e]),r.flags|=2048,ns(9,{destroy:void 0},zo.bind(null,r,o,n,t),null),n},useId:function(){var e=Do(),t=Ll.identifierPrefix;if(B){var n=Ei,r=Ti;n=(r&~(1<<32-Le(r)-1)).toString(32)+n,t=`_`+t+`R_`+n,n=ho++,0<n&&(t+=`H`+n.toString(32)),t+=`_`}else n=vo++,t=`_`+t+`r_`+n.toString(32)+`_`;return e.memoizedState=t},useHostTransitionStatus:ws,useFormState:Zo,useActionState:Zo,useOptimistic:function(e){var t=Do();t.memoizedState=t.baseState=e;var n={pending:null,lanes:0,dispatch:null,lastRenderedReducer:null,lastRenderedState:null};return t.queue=n,t=js.bind(null,H,!0,n),n.dispatch=t,[e,t]},useMemoCache:Mo,useCacheRefresh:function(){return Do().memoizedState=Ds.bind(null,H)},useEffectEvent:function(e){var t=Do(),n={impl:e};return t.memoizedState=n,function(){if(J&2)throw Error(i(440));return n.impl.apply(void 0,arguments)}}},Ls={readContext:ea,use:jo,useCallback:hs,useContext:ea,useEffect:ss,useImperativeHandle:ps,useInsertionEffect:us,useLayoutEffect:ds,useMemo:gs,useReducer:Po,useRef:rs,useState:function(){return Po(No)},useDebugValue:ms,useDeferredValue:function(e,t){return vs(Oo(),U.memoizedState,e,t)},useTransition:function(){var e=Po(No)[0],t=Oo().memoizedState;return[typeof e==`boolean`?e:Ao(e),t]},useSyncExternalStore:Lo,useId:Ts,useHostTransitionStatus:ws,useFormState:Qo,useActionState:Qo,useOptimistic:function(e,t){return Uo(Oo(),U,e,t)},useMemoCache:Mo,useCacheRefresh:Es};Ls.useEffectEvent=ls;var Rs={readContext:ea,use:jo,useCallback:hs,useContext:ea,useEffect:ss,useImperativeHandle:ps,useInsertionEffect:us,useLayoutEffect:ds,useMemo:gs,useReducer:Io,useRef:rs,useState:function(){return Io(No)},useDebugValue:ms,useDeferredValue:function(e,t){var n=Oo();return U===null?_s(n,e,t):vs(n,U.memoizedState,e,t)},useTransition:function(){var e=Io(No)[0],t=Oo().memoizedState;return[typeof e==`boolean`?e:Ao(e),t]},useSyncExternalStore:Lo,useId:Ts,useHostTransitionStatus:ws,useFormState:ts,useActionState:ts,useOptimistic:function(e,t){var n=Oo();return U===null?(n.baseState=e,[e,n.queue.dispatch]):Uo(n,U,e,t)},useMemoCache:Mo,useCacheRefresh:Es};Rs.useEffectEvent=ls;function zs(e,t,n,r){t=e.memoizedState,n=n(r,t),n=n==null?t:p({},t,n),e.memoizedState=n,e.lanes===0&&(e.updateQueue.baseState=n)}var Bs={enqueueSetState:function(e,t,n){e=e._reactInternals;var r=fu(),i=Va(r);i.payload=t,n!=null&&(i.callback=n),t=Ha(e,i,r),t!==null&&(mu(t,e,r),Ua(t,e,r))},enqueueReplaceState:function(e,t,n){e=e._reactInternals;var r=fu(),i=Va(r);i.tag=1,i.payload=t,n!=null&&(i.callback=n),t=Ha(e,i,r),t!==null&&(mu(t,e,r),Ua(t,e,r))},enqueueForceUpdate:function(e,t){e=e._reactInternals;var n=fu(),r=Va(n);r.tag=2,t!=null&&(r.callback=t),t=Ha(e,r,n),t!==null&&(mu(t,e,n),Ua(t,e,n))}};function Vs(e,t,n,r,i,a,o){return e=e.stateNode,typeof e.shouldComponentUpdate==`function`?e.shouldComponentUpdate(r,a,o):t.prototype&&t.prototype.isPureReactComponent?!Sr(n,r)||!Sr(i,a):!0}function Hs(e,t,n,r){e=t.state,typeof t.componentWillReceiveProps==`function`&&t.componentWillReceiveProps(n,r),typeof t.UNSAFE_componentWillReceiveProps==`function`&&t.UNSAFE_componentWillReceiveProps(n,r),t.state!==e&&Bs.enqueueReplaceState(t,t.state,null)}function Us(e,t){var n=t;if(`ref`in t)for(var r in n={},t)r!==`ref`&&(n[r]=t[r]);if(e=e.defaultProps)for(var i in n===t&&(n=p({},n)),e)n[i]===void 0&&(n[i]=e[i]);return n}function Ws(e){Yr(e)}function Gs(e){console.error(e)}function Ks(e){Yr(e)}function qs(e,t){try{var n=e.onUncaughtError;n(t.value,{componentStack:t.stack})}catch(e){setTimeout(function(){throw e})}}function Js(e,t,n){try{var r=e.onCaughtError;r(n.value,{componentStack:n.stack,errorBoundary:t.tag===1?t.stateNode:null})}catch(e){setTimeout(function(){throw e})}}function Ys(e,t,n){return n=Va(n),n.tag=3,n.payload={element:null},n.callback=function(){qs(e,t)},n}function Xs(e){return e=Va(e),e.tag=3,e}function Zs(e,t,n,r){var i=n.type.getDerivedStateFromError;if(typeof i==`function`){var a=r.value;e.payload=function(){return i(a)},e.callback=function(){Js(t,n,r)}}var o=n.stateNode;o!==null&&typeof o.componentDidCatch==`function`&&(e.callback=function(){Js(t,n,r),typeof i!=`function`&&(nu===null?nu=new Set([this]):nu.add(this));var e=r.stack;this.componentDidCatch(r.value,{componentStack:e===null?``:e})})}function Qs(e,t,n,r,a){if(n.flags|=32768,typeof r==`object`&&r&&typeof r.then==`function`){if(t=n.alternate,t!==null&&Zi(t,n,a,!0),n=to.current,n!==null){switch(n.tag){case 31:case 13:return no===null?Eu():n.alternate===null&&Ul===0&&(Ul=3),n.flags&=-257,n.flags|=65536,n.lanes=a,r===Ca?n.flags|=16384:(t=n.updateQueue,t===null?n.updateQueue=new Set([r]):t.add(r),Wu(e,r,a)),!1;case 22:return n.flags|=65536,r===Ca?n.flags|=16384:(t=n.updateQueue,t===null?(t={transitions:null,markerInstances:null,retryQueue:new Set([r])},n.updateQueue=t):(n=t.retryQueue,n===null?t.retryQueue=new Set([r]):n.add(r)),Wu(e,r,a)),!1}throw Error(i(435,n.tag))}return Wu(e,r,a),Eu(),!1}if(B)return t=to.current,t===null?(r!==Ii&&(t=Error(i(423),{cause:r}),Ui(_i(t,n))),e=e.current.alternate,e.flags|=65536,a&=-a,e.lanes|=a,r=_i(r,n),a=Ys(e.stateNode,r,a),Wa(e,a),Ul!==4&&(Ul=2)):(!(t.flags&65536)&&(t.flags|=256),t.flags|=65536,t.lanes=a,r!==Ii&&(e=Error(i(422),{cause:r}),Ui(_i(e,n)))),!1;var o=Error(i(520),{cause:r});if(o=_i(o,n),Yl===null?Yl=[o]:Yl.push(o),Ul!==4&&(Ul=2),t===null)return!0;r=_i(r,n),n=t;do{switch(n.tag){case 3:return n.flags|=65536,e=a&-a,n.lanes|=e,e=Ys(n.stateNode,r,e),Wa(n,e),!1;case 1:if(t=n.type,o=n.stateNode,!(n.flags&128)&&(typeof t.getDerivedStateFromError==`function`||o!==null&&typeof o.componentDidCatch==`function`&&(nu===null||!nu.has(o))))return n.flags|=65536,a&=-a,n.lanes|=a,a=Xs(a),Zs(a,e,n,r),Wa(n,a),!1}n=n.return}while(n!==null);return!1}var $s=Error(i(461)),ec=!1;function tc(e,t,n,r){t.child=e===null?La(t,null,n,r):Ia(t,e.child,n,r)}function nc(e,t,n,r,i){n=n.render;var a=t.ref;if(`ref`in r){var o={};for(var s in r)s!==`ref`&&(o[s]=r[s])}else o=r;return $i(t),r=bo(e,t,n,o,a,i),s=wo(),e!==null&&!ec?(To(e,t,i),Tc(e,t,i)):(B&&s&&ki(t),t.flags|=1,tc(e,t,r,i),t.child)}function rc(e,t,n,r,i){if(e===null){var a=n.type;return typeof a==`function`&&!ci(a)&&a.defaultProps===void 0&&n.compare===null?(t.tag=15,t.type=a,ic(e,t,a,r,i)):(e=di(n.type,null,r,t,t.mode,i),e.ref=t.ref,e.return=t,t.child=e)}if(a=e.child,!Ec(e,i)){var o=a.memoizedProps;if(n=n.compare,n=n===null?Sr:n,n(o,r)&&e.ref===t.ref)return Tc(e,t,i)}return t.flags|=1,e=li(a,r),e.ref=t.ref,e.return=t,t.child=e}function ic(e,t,n,r,i){if(e!==null){var a=e.memoizedProps;if(Sr(a,r)&&e.ref===t.ref){if(ec=!1,t.pendingProps=r=a,Ec(e,i))e.flags&131072&&(ec=!0);else return t.lanes=e.lanes,Tc(e,t,i)}}return dc(e,t,n,r,i)}function ac(e,t,n,r){var i=r.children,a=e===null?null:e.memoizedState;if(e===null&&t.stateNode===null&&(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),r.mode===`hidden`){if(t.flags&128){if(a=a===null?n:a.baseLanes|n,e!==null){for(r=t.child=e.child,i=0;r!==null;)i=i|r.lanes|r.childLanes,r=r.sibling;r=i&~a}else r=0,t.child=null;return sc(e,t,a,n,r)}if(n&536870912)t.memoizedState={baseLanes:0,cachePool:null},e!==null&&va(t,a===null?null:a.cachePool),a===null?$a():Qa(t,a),ao(t);else return r=t.lanes=536870912,sc(e,t,a===null?n:a.baseLanes|n,n,r)}else a===null?(e!==null&&va(t,null),$a(),oo(t)):(va(t,a.cachePool),Qa(t,a),oo(t),t.memoizedState=null);return tc(e,t,i,n),t.child}function oc(e,t){return e!==null&&e.tag===22||t.stateNode!==null||(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),t.sibling}function sc(e,t,n,r,i){var a=_a();return a=a===null?null:{parent:aa._currentValue,pool:a},t.memoizedState={baseLanes:n,cachePool:a},e!==null&&va(t,null),$a(),ao(t),e!==null&&Zi(e,t,r,!0),t.childLanes=i,null}function q(e,t){return t=bc({mode:t.mode,children:t.children},e.mode),t.ref=e.ref,e.child=t,t.return=e,t}function cc(e,t,n){return Ia(t,e.child,null,n),e=q(t,t.pendingProps),e.flags|=2,so(t),t.memoizedState=null,e}function lc(e,t,n){var r=t.pendingProps,a=!!(t.flags&128);if(t.flags&=-129,e===null){if(B){if(r.mode===`hidden`)return e=q(t,r),t.lanes=536870912,oc(null,e);if(io(t),(e=Ni)?(e=rf(e,Fi),e=e!==null&&e.data===`&`?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:wi===null?null:{id:Ti,overflow:Ei},retryLane:536870912,hydrationErrors:null},n=mi(e),n.return=t,t.child=n,Mi=t,Ni=null)):e=null,e===null)throw Li(t);return t.lanes=536870912,null}return q(t,r)}var o=e.memoizedState;if(o!==null){var s=o.dehydrated;if(io(t),a){if(t.flags&256)t.flags&=-257,t=cc(e,t,n);else if(t.memoizedState!==null)t.child=e.child,t.flags|=128,t=null;else throw Error(i(558))}else if(ec||Zi(e,t,n,!1),a=(n&e.childLanes)!==0,ec||a){if(r=Ll,r!==null&&(s=et(r,n),s!==0&&s!==o.retryLane))throw o.retryLane=s,ni(e,s),mu(r,e,s),$s;Eu(),t=cc(e,t,n)}else e=o.treeContext,Ni=cf(s.nextSibling),Mi=t,B=!0,Pi=null,Fi=!1,e!==null&&ji(t,e),t=q(t,r),t.flags|=4096;return t}return e=li(e.child,{mode:r.mode,children:r.children}),e.ref=t.ref,t.child=e,e.return=t,e}function uc(e,t){var n=t.ref;if(n===null)e!==null&&e.ref!==null&&(t.flags|=4194816);else{if(typeof n!=`function`&&typeof n!=`object`)throw Error(i(284));(e===null||e.ref!==n)&&(t.flags|=4194816)}}function dc(e,t,n,r,i){return $i(t),n=bo(e,t,n,r,void 0,i),r=wo(),e!==null&&!ec?(To(e,t,i),Tc(e,t,i)):(B&&r&&ki(t),t.flags|=1,tc(e,t,n,i),t.child)}function fc(e,t,n,r,i,a){return $i(t),t.updateQueue=null,n=So(t,r,n,i),xo(e),r=wo(),e!==null&&!ec?(To(e,t,a),Tc(e,t,a)):(B&&r&&ki(t),t.flags|=1,tc(e,t,n,a),t.child)}function pc(e,t,n,r,i){if($i(t),t.stateNode===null){var a=ai,o=n.contextType;typeof o==`object`&&o&&(a=ea(o)),a=new n(r,a),t.memoizedState=a.state!==null&&a.state!==void 0?a.state:null,a.updater=Bs,t.stateNode=a,a._reactInternals=t,a=t.stateNode,a.props=r,a.state=t.memoizedState,a.refs={},za(t),o=n.contextType,a.context=typeof o==`object`&&o?ea(o):ai,a.state=t.memoizedState,o=n.getDerivedStateFromProps,typeof o==`function`&&(zs(t,n,o,r),a.state=t.memoizedState),typeof n.getDerivedStateFromProps==`function`||typeof a.getSnapshotBeforeUpdate==`function`||typeof a.UNSAFE_componentWillMount!=`function`&&typeof a.componentWillMount!=`function`||(o=a.state,typeof a.componentWillMount==`function`&&a.componentWillMount(),typeof a.UNSAFE_componentWillMount==`function`&&a.UNSAFE_componentWillMount(),o!==a.state&&Bs.enqueueReplaceState(a,a.state,null),qa(t,r,a,i),Ka(),a.state=t.memoizedState),typeof a.componentDidMount==`function`&&(t.flags|=4194308),r=!0}else if(e===null){a=t.stateNode;var s=t.memoizedProps,c=Us(n,s);a.props=c;var l=a.context,u=n.contextType;o=ai,typeof u==`object`&&u&&(o=ea(u));var d=n.getDerivedStateFromProps;u=typeof d==`function`||typeof a.getSnapshotBeforeUpdate==`function`,s=t.pendingProps!==s,u||typeof a.UNSAFE_componentWillReceiveProps!=`function`&&typeof a.componentWillReceiveProps!=`function`||(s||l!==o)&&Hs(t,a,r,o),Ra=!1;var f=t.memoizedState;a.state=f,qa(t,r,a,i),Ka(),l=t.memoizedState,s||f!==l||Ra?(typeof d==`function`&&(zs(t,n,d,r),l=t.memoizedState),(c=Ra||Vs(t,n,c,r,f,l,o))?(u||typeof a.UNSAFE_componentWillMount!=`function`&&typeof a.componentWillMount!=`function`||(typeof a.componentWillMount==`function`&&a.componentWillMount(),typeof a.UNSAFE_componentWillMount==`function`&&a.UNSAFE_componentWillMount()),typeof a.componentDidMount==`function`&&(t.flags|=4194308)):(typeof a.componentDidMount==`function`&&(t.flags|=4194308),t.memoizedProps=r,t.memoizedState=l),a.props=r,a.state=l,a.context=o,r=c):(typeof a.componentDidMount==`function`&&(t.flags|=4194308),r=!1)}else{a=t.stateNode,Ba(e,t),o=t.memoizedProps,u=Us(n,o),a.props=u,d=t.pendingProps,f=a.context,l=n.contextType,c=ai,typeof l==`object`&&l&&(c=ea(l)),s=n.getDerivedStateFromProps,(l=typeof s==`function`||typeof a.getSnapshotBeforeUpdate==`function`)||typeof a.UNSAFE_componentWillReceiveProps!=`function`&&typeof a.componentWillReceiveProps!=`function`||(o!==d||f!==c)&&Hs(t,a,r,c),Ra=!1,f=t.memoizedState,a.state=f,qa(t,r,a,i),Ka();var p=t.memoizedState;o!==d||f!==p||Ra||e!==null&&e.dependencies!==null&&Qi(e.dependencies)?(typeof s==`function`&&(zs(t,n,s,r),p=t.memoizedState),(u=Ra||Vs(t,n,u,r,f,p,c)||e!==null&&e.dependencies!==null&&Qi(e.dependencies))?(l||typeof a.UNSAFE_componentWillUpdate!=`function`&&typeof a.componentWillUpdate!=`function`||(typeof a.componentWillUpdate==`function`&&a.componentWillUpdate(r,p,c),typeof a.UNSAFE_componentWillUpdate==`function`&&a.UNSAFE_componentWillUpdate(r,p,c)),typeof a.componentDidUpdate==`function`&&(t.flags|=4),typeof a.getSnapshotBeforeUpdate==`function`&&(t.flags|=1024)):(typeof a.componentDidUpdate!=`function`||o===e.memoizedProps&&f===e.memoizedState||(t.flags|=4),typeof a.getSnapshotBeforeUpdate!=`function`||o===e.memoizedProps&&f===e.memoizedState||(t.flags|=1024),t.memoizedProps=r,t.memoizedState=p),a.props=r,a.state=p,a.context=c,r=u):(typeof a.componentDidUpdate!=`function`||o===e.memoizedProps&&f===e.memoizedState||(t.flags|=4),typeof a.getSnapshotBeforeUpdate!=`function`||o===e.memoizedProps&&f===e.memoizedState||(t.flags|=1024),r=!1)}return a=r,uc(e,t),r=!!(t.flags&128),a||r?(a=t.stateNode,n=r&&typeof n.getDerivedStateFromError!=`function`?null:a.render(),t.flags|=1,e!==null&&r?(t.child=Ia(t,e.child,null,i),t.child=Ia(t,null,n,i)):tc(e,t,n,i),t.memoizedState=a.state,e=t.child):e=Tc(e,t,i),e}function mc(e,t,n,r){return Vi(),t.flags|=256,tc(e,t,n,r),t.child}var hc={dehydrated:null,treeContext:null,retryLane:0,hydrationErrors:null};function gc(e){return{baseLanes:e,cachePool:ya()}}function _c(e,t,n){return e=e===null?0:e.childLanes&~n,t&&(e|=ql),e}function vc(e,t,n){var r=t.pendingProps,a=!1,o=!!(t.flags&128),s;if((s=o)||(s=e!==null&&e.memoizedState===null?!1:!!(co.current&2)),s&&(a=!0,t.flags&=-129),s=!!(t.flags&32),t.flags&=-33,e===null){if(B){if(a?ro(t):oo(t),(e=Ni)?(e=rf(e,Fi),e=e!==null&&e.data!==`&`?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:wi===null?null:{id:Ti,overflow:Ei},retryLane:536870912,hydrationErrors:null},n=mi(e),n.return=t,t.child=n,Mi=t,Ni=null)):e=null,e===null)throw Li(t);return of(e)?t.lanes=32:t.lanes=536870912,null}var c=r.children;return r=r.fallback,a?(oo(t),a=t.mode,c=bc({mode:`hidden`,children:c},a),r=fi(r,a,n,null),c.return=t,r.return=t,c.sibling=r,t.child=c,r=t.child,r.memoizedState=gc(n),r.childLanes=_c(e,s,n),t.memoizedState=hc,oc(null,r)):(ro(t),yc(t,c))}var l=e.memoizedState;if(l!==null&&(c=l.dehydrated,c!==null)){if(o)t.flags&256?(ro(t),t.flags&=-257,t=xc(e,t,n)):t.memoizedState===null?(oo(t),c=r.fallback,a=t.mode,r=bc({mode:`visible`,children:r.children},a),c=fi(c,a,n,null),c.flags|=2,r.return=t,c.return=t,r.sibling=c,t.child=r,Ia(t,e.child,null,n),r=t.child,r.memoizedState=gc(n),r.childLanes=_c(e,s,n),t.memoizedState=hc,t=oc(null,r)):(oo(t),t.child=e.child,t.flags|=128,t=null);else if(ro(t),of(c)){if(s=c.nextSibling&&c.nextSibling.dataset,s)var u=s.dgst;s=u,r=Error(i(419)),r.stack=``,r.digest=s,Ui({value:r,source:null,stack:null}),t=xc(e,t,n)}else if(ec||Zi(e,t,n,!1),s=(n&e.childLanes)!==0,ec||s){if(s=Ll,s!==null&&(r=et(s,n),r!==0&&r!==l.retryLane))throw l.retryLane=r,ni(e,r),mu(s,e,r),$s;af(c)||Eu(),t=xc(e,t,n)}else af(c)?(t.flags|=192,t.child=e.child,t=null):(e=l.treeContext,Ni=cf(c.nextSibling),Mi=t,B=!0,Pi=null,Fi=!1,e!==null&&ji(t,e),t=yc(t,r.children),t.flags|=4096);return t}return a?(oo(t),c=r.fallback,a=t.mode,l=e.child,u=l.sibling,r=li(l,{mode:`hidden`,children:r.children}),r.subtreeFlags=l.subtreeFlags&65011712,u===null?(c=fi(c,a,n,null),c.flags|=2):c=li(u,c),c.return=t,r.return=t,r.sibling=c,t.child=r,oc(null,r),r=t.child,c=e.child.memoizedState,c===null?c=gc(n):(a=c.cachePool,a===null?a=ya():(l=aa._currentValue,a=a.parent===l?a:{parent:l,pool:l}),c={baseLanes:c.baseLanes|n,cachePool:a}),r.memoizedState=c,r.childLanes=_c(e,s,n),t.memoizedState=hc,oc(e.child,r)):(ro(t),n=e.child,e=n.sibling,n=li(n,{mode:`visible`,children:r.children}),n.return=t,n.sibling=null,e!==null&&(s=t.deletions,s===null?(t.deletions=[e],t.flags|=16):s.push(e)),t.child=n,t.memoizedState=null,n)}function yc(e,t){return t=bc({mode:`visible`,children:t},e.mode),t.return=e,e.child=t}function bc(e,t){return e=si(22,e,null,t),e.lanes=0,e}function xc(e,t,n){return Ia(t,e.child,null,n),e=yc(t,t.pendingProps.children),e.flags|=2,t.memoizedState=null,e}function Sc(e,t,n){e.lanes|=t;var r=e.alternate;r!==null&&(r.lanes|=t),Yi(e.return,t,n)}function Cc(e,t,n,r,i,a){var o=e.memoizedState;o===null?e.memoizedState={isBackwards:t,rendering:null,renderingStartTime:0,last:r,tail:n,tailMode:i,treeForkCount:a}:(o.isBackwards=t,o.rendering=null,o.renderingStartTime=0,o.last=r,o.tail=n,o.tailMode=i,o.treeForkCount=a)}function wc(e,t,n){var r=t.pendingProps,i=r.revealOrder,a=r.tail;r=r.children;var o=co.current,s=!!(o&2);if(s?(o=o&1|2,t.flags|=128):o&=1,F(co,o),tc(e,t,r,n),r=B?xi:0,!s&&e!==null&&e.flags&128)a:for(e=t.child;e!==null;){if(e.tag===13)e.memoizedState!==null&&Sc(e,n,t);else if(e.tag===19)Sc(e,n,t);else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break a;for(;e.sibling===null;){if(e.return===null||e.return===t)break a;e=e.return}e.sibling.return=e.return,e=e.sibling}switch(i){case`forwards`:for(n=t.child,i=null;n!==null;)e=n.alternate,e!==null&&lo(e)===null&&(i=n),n=n.sibling;n=i,n===null?(i=t.child,t.child=null):(i=n.sibling,n.sibling=null),Cc(t,!1,i,n,a,r);break;case`backwards`:case`unstable_legacy-backwards`:for(n=null,i=t.child,t.child=null;i!==null;){if(e=i.alternate,e!==null&&lo(e)===null){t.child=i;break}e=i.sibling,i.sibling=n,n=i,i=e}Cc(t,!0,n,null,a,r);break;case`together`:Cc(t,!1,null,null,void 0,r);break;default:t.memoizedState=null}return t.child}function Tc(e,t,n){if(e!==null&&(t.dependencies=e.dependencies),Wl|=t.lanes,(n&t.childLanes)===0){if(e!==null){if(Zi(e,t,n,!1),(n&t.childLanes)===0)return null}else return null}if(e!==null&&t.child!==e.child)throw Error(i(153));if(t.child!==null){for(e=t.child,n=li(e,e.pendingProps),t.child=n,n.return=t;e.sibling!==null;)e=e.sibling,n=n.sibling=li(e,e.pendingProps),n.return=t;n.sibling=null}return t.child}function Ec(e,t){return(e.lanes&t)!==0||(e=e.dependencies,!!(e!==null&&Qi(e)))}function Dc(e,t,n){switch(t.tag){case 3:I(t,t.stateNode.containerInfo),qi(t,aa,e.memoizedState.cache),Vi();break;case 27:case 5:pe(t);break;case 4:I(t,t.stateNode.containerInfo);break;case 10:qi(t,t.type,t.memoizedProps.value);break;case 31:if(t.memoizedState!==null)return t.flags|=128,io(t),null;break;case 13:var r=t.memoizedState;if(r!==null)return r.dehydrated===null?(n&t.child.childLanes)===0?(ro(t),e=Tc(e,t,n),e===null?null:e.sibling):vc(e,t,n):(ro(t),t.flags|=128,null);ro(t);break;case 19:var i=!!(e.flags&128);if(r=(n&t.childLanes)!==0,r||(Zi(e,t,n,!1),r=(n&t.childLanes)!==0),i){if(r)return wc(e,t,n);t.flags|=128}if(i=t.memoizedState,i!==null&&(i.rendering=null,i.tail=null,i.lastEffect=null),F(co,co.current),r)break;return null;case 22:return t.lanes=0,ac(e,t,n,t.pendingProps);case 24:qi(t,aa,e.memoizedState.cache)}return Tc(e,t,n)}function Oc(e,t,n){if(e!==null){if(e.memoizedProps!==t.pendingProps)ec=!0;else{if(!Ec(e,n)&&!(t.flags&128))return ec=!1,Dc(e,t,n);ec=!!(e.flags&131072)}}else ec=!1,B&&t.flags&1048576&&Oi(t,xi,t.index);switch(t.lanes=0,t.tag){case 16:a:{var r=t.pendingProps;if(e=Ea(t.elementType),t.type=e,typeof e==`function`)ci(e)?(r=Us(e,r),t.tag=1,t=pc(null,t,e,r,n)):(t.tag=0,t=dc(null,t,e,r,n));else{if(e!=null){var a=e.$$typeof;if(a===w){t.tag=11,t=nc(null,t,e,r,n);break a}if(a===D){t.tag=14,t=rc(null,t,e,r,n);break a}}throw t=re(e)||e,Error(i(306,t,``))}}return t;case 0:return dc(e,t,t.type,t.pendingProps,n);case 1:return r=t.type,a=Us(r,t.pendingProps),pc(e,t,r,a,n);case 3:a:{if(I(t,t.stateNode.containerInfo),e===null)throw Error(i(387));r=t.pendingProps;var o=t.memoizedState;a=o.element,Ba(e,t),qa(t,r,null,n);var s=t.memoizedState;if(r=s.cache,qi(t,aa,r),r!==o.cache&&Xi(t,[aa],n,!0),Ka(),r=s.element,o.isDehydrated){if(o={element:r,isDehydrated:!1,cache:s.cache},t.updateQueue.baseState=o,t.memoizedState=o,t.flags&256){t=mc(e,t,r,n);break a}if(r!==a){a=_i(Error(i(424)),t),Ui(a),t=mc(e,t,r,n);break a}switch(e=t.stateNode.containerInfo,e.nodeType){case 9:e=e.body;break;default:e=e.nodeName===`HTML`?e.ownerDocument.body:e}for(Ni=cf(e.firstChild),Mi=t,B=!0,Pi=null,Fi=!0,n=La(t,null,r,n),t.child=n;n;)n.flags=n.flags&-3|4096,n=n.sibling}else{if(Vi(),r===a){t=Tc(e,t,n);break a}tc(e,t,r,n)}t=t.child}return t;case 26:return uc(e,t),e===null?(n=kf(t.type,null,t.pendingProps,null))?t.memoizedState=n:B||(n=t.type,e=t.pendingProps,r=Bd(ue.current).createElement(n),r[ot]=t,r[st]=e,Pd(r,n,e),yt(r),t.stateNode=r):t.memoizedState=kf(t.type,e.memoizedProps,t.pendingProps,e.memoizedState),null;case 27:return pe(t),e===null&&B&&(r=t.stateNode=ff(t.type,t.pendingProps,ue.current),Mi=t,Fi=!0,a=Ni,Zd(t.type)?(lf=a,Ni=cf(r.firstChild)):Ni=a),tc(e,t,t.pendingProps.children,n),uc(e,t),e===null&&(t.flags|=4194304),t.child;case 5:return e===null&&B&&((a=r=Ni)&&(r=tf(r,t.type,t.pendingProps,Fi),r===null?a=!1:(t.stateNode=r,Mi=t,Ni=cf(r.firstChild),Fi=!1,a=!0)),a||Li(t)),pe(t),a=t.type,o=t.pendingProps,s=e===null?null:e.memoizedProps,r=o.children,Ud(a,o)?r=null:s!==null&&Ud(a,s)&&(t.flags|=32),t.memoizedState!==null&&(a=bo(e,t,Co,null,null,n),Qf._currentValue=a),uc(e,t),tc(e,t,r,n),t.child;case 6:return e===null&&B&&((e=n=Ni)&&(n=nf(n,t.pendingProps,Fi),n===null?e=!1:(t.stateNode=n,Mi=t,Ni=null,e=!0)),e||Li(t)),null;case 13:return vc(e,t,n);case 4:return I(t,t.stateNode.containerInfo),r=t.pendingProps,e===null?t.child=Ia(t,null,r,n):tc(e,t,r,n),t.child;case 11:return nc(e,t,t.type,t.pendingProps,n);case 7:return tc(e,t,t.pendingProps,n),t.child;case 8:return tc(e,t,t.pendingProps.children,n),t.child;case 12:return tc(e,t,t.pendingProps.children,n),t.child;case 10:return r=t.pendingProps,qi(t,t.type,r.value),tc(e,t,r.children,n),t.child;case 9:return a=t.type._context,r=t.pendingProps.children,$i(t),a=ea(a),r=r(a),t.flags|=1,tc(e,t,r,n),t.child;case 14:return rc(e,t,t.type,t.pendingProps,n);case 15:return ic(e,t,t.type,t.pendingProps,n);case 19:return wc(e,t,n);case 31:return lc(e,t,n);case 22:return ac(e,t,n,t.pendingProps);case 24:return $i(t),r=ea(aa),e===null?(a=_a(),a===null&&(a=Ll,o=oa(),a.pooledCache=o,o.refCount++,o!==null&&(a.pooledCacheLanes|=n),a=o),t.memoizedState={parent:r,cache:a},za(t),qi(t,aa,a)):((e.lanes&n)!==0&&(Ba(e,t),qa(t,null,null,n),Ka()),a=e.memoizedState,o=t.memoizedState,a.parent===r?(r=o.cache,qi(t,aa,r),r!==a.cache&&Xi(t,[aa],n,!0)):(a={parent:r,cache:r},t.memoizedState=a,t.lanes===0&&(t.memoizedState=t.updateQueue.baseState=a),qi(t,aa,r))),tc(e,t,t.pendingProps.children,n),t.child;case 29:throw t.pendingProps}throw Error(i(156,t.tag))}function kc(e){e.flags|=4}function Ac(e,t,n,r,i){if((t=!!(e.mode&32))&&(t=!1),t){if(e.flags|=16777216,(i&335544128)===i){if(e.stateNode.complete)e.flags|=8192;else if(Cu())e.flags|=8192;else throw Da=Ca,xa}}else e.flags&=-16777217}function jc(e,t){if(t.type!==`stylesheet`||t.state.loading&4)e.flags&=-16777217;else if(e.flags|=16777216,!Wf(t)){if(Cu())e.flags|=8192;else throw Da=Ca,xa}}function Mc(e,t){t!==null&&(e.flags|=4),e.flags&16384&&(t=e.tag===22?536870912:Je(),e.lanes|=t,Jl|=t)}function Nc(e,t){if(!B)switch(e.tailMode){case`hidden`:t=e.tail;for(var n=null;t!==null;)t.alternate!==null&&(n=t),t=t.sibling;n===null?e.tail=null:n.sibling=null;break;case`collapsed`:n=e.tail;for(var r=null;n!==null;)n.alternate!==null&&(r=n),n=n.sibling;r===null?t||e.tail===null?e.tail=null:e.tail.sibling=null:r.sibling=null}}function Pc(e){var t=e.alternate!==null&&e.alternate.child===e.child,n=0,r=0;if(t)for(var i=e.child;i!==null;)n|=i.lanes|i.childLanes,r|=i.subtreeFlags&65011712,r|=i.flags&65011712,i.return=e,i=i.sibling;else for(i=e.child;i!==null;)n|=i.lanes|i.childLanes,r|=i.subtreeFlags,r|=i.flags,i.return=e,i=i.sibling;return e.subtreeFlags|=r,e.childLanes=n,t}function Fc(e,t,n){var r=t.pendingProps;switch(Ai(t),t.tag){case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return Pc(t),null;case 1:return Pc(t),null;case 3:return n=t.stateNode,r=null,e!==null&&(r=e.memoizedState.cache),t.memoizedState.cache!==r&&(t.flags|=2048),Ji(aa),fe(),n.pendingContext&&(n.context=n.pendingContext,n.pendingContext=null),(e===null||e.child===null)&&(Bi(t)?kc(t):e===null||e.memoizedState.isDehydrated&&!(t.flags&256)||(t.flags|=1024,Hi())),Pc(t),null;case 26:var a=t.type,o=t.memoizedState;return e===null?(kc(t),o===null?(Pc(t),Ac(t,a,null,r,n)):(Pc(t),jc(t,o))):o?o===e.memoizedState?(Pc(t),t.flags&=-16777217):(kc(t),Pc(t),jc(t,o)):(e=e.memoizedProps,e!==r&&kc(t),Pc(t),Ac(t,a,e,r,n)),null;case 27:if(me(t),n=ue.current,a=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==r&&kc(t);else{if(!r){if(t.stateNode===null)throw Error(i(166));return Pc(t),null}e=ce.current,Bi(t)?Ri(t,e):(e=ff(a,r,n),t.stateNode=e,kc(t))}return Pc(t),null;case 5:if(me(t),a=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==r&&kc(t);else{if(!r){if(t.stateNode===null)throw Error(i(166));return Pc(t),null}if(o=ce.current,Bi(t))Ri(t,o);else{var s=Bd(ue.current);switch(o){case 1:o=s.createElementNS(`http://www.w3.org/2000/svg`,a);break;case 2:o=s.createElementNS(`http://www.w3.org/1998/Math/MathML`,a);break;default:switch(a){case`svg`:o=s.createElementNS(`http://www.w3.org/2000/svg`,a);break;case`math`:o=s.createElementNS(`http://www.w3.org/1998/Math/MathML`,a);break;case`script`:o=s.createElement(`div`),o.innerHTML=`<script><\/script>`,o=o.removeChild(o.firstChild);break;case`select`:o=typeof r.is==`string`?s.createElement(`select`,{is:r.is}):s.createElement(`select`),r.multiple?o.multiple=!0:r.size&&(o.size=r.size);break;default:o=typeof r.is==`string`?s.createElement(a,{is:r.is}):s.createElement(a)}}o[ot]=t,o[st]=r;a:for(s=t.child;s!==null;){if(s.tag===5||s.tag===6)o.appendChild(s.stateNode);else if(s.tag!==4&&s.tag!==27&&s.child!==null){s.child.return=s,s=s.child;continue}if(s===t)break a;for(;s.sibling===null;){if(s.return===null||s.return===t)break a;s=s.return}s.sibling.return=s.return,s=s.sibling}t.stateNode=o;a:switch(Pd(o,a,r),a){case`button`:case`input`:case`select`:case`textarea`:r=!!r.autoFocus;break a;case`img`:r=!0;break a;default:r=!1}r&&kc(t)}}return Pc(t),Ac(t,t.type,e===null?null:e.memoizedProps,t.pendingProps,n),null;case 6:if(e&&t.stateNode!=null)e.memoizedProps!==r&&kc(t);else{if(typeof r!=`string`&&t.stateNode===null)throw Error(i(166));if(e=ue.current,Bi(t)){if(e=t.stateNode,n=t.memoizedProps,r=null,a=Mi,a!==null)switch(a.tag){case 27:case 5:r=a.memoizedProps}e[ot]=t,e=!!(e.nodeValue===n||r!==null&&!0===r.suppressHydrationWarning||jd(e.nodeValue,n)),e||Li(t,!0)}else e=Bd(e).createTextNode(r),e[ot]=t,t.stateNode=e}return Pc(t),null;case 31:if(n=t.memoizedState,e===null||e.memoizedState!==null){if(r=Bi(t),n!==null){if(e===null){if(!r)throw Error(i(318));if(e=t.memoizedState,e=e===null?null:e.dehydrated,!e)throw Error(i(557));e[ot]=t}else Vi(),!(t.flags&128)&&(t.memoizedState=null),t.flags|=4;Pc(t),e=!1}else n=Hi(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=n),e=!0;if(!e)return t.flags&256?(so(t),t):(so(t),null);if(t.flags&128)throw Error(i(558))}return Pc(t),null;case 13:if(r=t.memoizedState,e===null||e.memoizedState!==null&&e.memoizedState.dehydrated!==null){if(a=Bi(t),r!==null&&r.dehydrated!==null){if(e===null){if(!a)throw Error(i(318));if(a=t.memoizedState,a=a===null?null:a.dehydrated,!a)throw Error(i(317));a[ot]=t}else Vi(),!(t.flags&128)&&(t.memoizedState=null),t.flags|=4;Pc(t),a=!1}else a=Hi(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=a),a=!0;if(!a)return t.flags&256?(so(t),t):(so(t),null)}return so(t),t.flags&128?(t.lanes=n,t):(n=r!==null,e=e!==null&&e.memoizedState!==null,n&&(r=t.child,a=null,r.alternate!==null&&r.alternate.memoizedState!==null&&r.alternate.memoizedState.cachePool!==null&&(a=r.alternate.memoizedState.cachePool.pool),o=null,r.memoizedState!==null&&r.memoizedState.cachePool!==null&&(o=r.memoizedState.cachePool.pool),o!==a&&(r.flags|=2048)),n!==e&&n&&(t.child.flags|=8192),Mc(t,t.updateQueue),Pc(t),null);case 4:return fe(),e===null&&xd(t.stateNode.containerInfo),Pc(t),null;case 10:return Ji(t.type),Pc(t),null;case 19:if(P(co),r=t.memoizedState,r===null)return Pc(t),null;if(a=!!(t.flags&128),o=r.rendering,o===null){if(a)Nc(r,!1);else{if(Ul!==0||e!==null&&e.flags&128)for(e=t.child;e!==null;){if(o=lo(e),o!==null){for(t.flags|=128,Nc(r,!1),e=o.updateQueue,t.updateQueue=e,Mc(t,e),t.subtreeFlags=0,e=n,n=t.child;n!==null;)ui(n,e),n=n.sibling;return F(co,co.current&1|2),B&&Di(t,r.treeForkCount),t.child}e=e.sibling}r.tail!==null&&Ee()>eu&&(t.flags|=128,a=!0,Nc(r,!1),t.lanes=4194304)}}else{if(!a){if(e=lo(o),e!==null){if(t.flags|=128,a=!0,e=e.updateQueue,t.updateQueue=e,Mc(t,e),Nc(r,!0),r.tail===null&&r.tailMode===`hidden`&&!o.alternate&&!B)return Pc(t),null}else 2*Ee()-r.renderingStartTime>eu&&n!==536870912&&(t.flags|=128,a=!0,Nc(r,!1),t.lanes=4194304)}r.isBackwards?(o.sibling=t.child,t.child=o):(e=r.last,e===null?t.child=o:e.sibling=o,r.last=o)}return r.tail===null?(Pc(t),null):(e=r.tail,r.rendering=e,r.tail=e.sibling,r.renderingStartTime=Ee(),e.sibling=null,n=co.current,F(co,a?n&1|2:n&1),B&&Di(t,r.treeForkCount),e);case 22:case 23:return so(t),eo(),r=t.memoizedState!==null,e===null?r&&(t.flags|=8192):e.memoizedState!==null!==r&&(t.flags|=8192),r?n&536870912&&!(t.flags&128)&&(Pc(t),t.subtreeFlags&6&&(t.flags|=8192)):Pc(t),n=t.updateQueue,n!==null&&Mc(t,n.retryQueue),n=null,e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(n=e.memoizedState.cachePool.pool),r=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(r=t.memoizedState.cachePool.pool),r!==n&&(t.flags|=2048),e!==null&&P(ga),null;case 24:return n=null,e!==null&&(n=e.memoizedState.cache),t.memoizedState.cache!==n&&(t.flags|=2048),Ji(aa),Pc(t),null;case 25:return null;case 30:return null}throw Error(i(156,t.tag))}function Ic(e,t){switch(Ai(t),t.tag){case 1:return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 3:return Ji(aa),fe(),e=t.flags,e&65536&&!(e&128)?(t.flags=e&-65537|128,t):null;case 26:case 27:case 5:return me(t),null;case 31:if(t.memoizedState!==null){if(so(t),t.alternate===null)throw Error(i(340));Vi()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 13:if(so(t),e=t.memoizedState,e!==null&&e.dehydrated!==null){if(t.alternate===null)throw Error(i(340));Vi()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 19:return P(co),null;case 4:return fe(),null;case 10:return Ji(t.type),null;case 22:case 23:return so(t),eo(),e!==null&&P(ga),e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 24:return Ji(aa),null;case 25:return null;default:return null}}function Lc(e,t){switch(Ai(t),t.tag){case 3:Ji(aa),fe();break;case 26:case 27:case 5:me(t);break;case 4:fe();break;case 31:t.memoizedState!==null&&so(t);break;case 13:so(t);break;case 19:P(co);break;case 10:Ji(t.type);break;case 22:case 23:so(t),eo(),e!==null&&P(ga);break;case 24:Ji(aa)}}function Rc(e,t){try{var n=t.updateQueue,r=n===null?null:n.lastEffect;if(r!==null){var i=r.next;n=i;do{if((n.tag&e)===e){r=void 0;var a=n.create,o=n.inst;r=a(),o.destroy=r}n=n.next}while(n!==i)}}catch(e){Q(t,t.return,e)}}function zc(e,t,n){try{var r=t.updateQueue,i=r===null?null:r.lastEffect;if(i!==null){var a=i.next;r=a;do{if((r.tag&e)===e){var o=r.inst,s=o.destroy;if(s!==void 0){o.destroy=void 0,i=t;var c=n,l=s;try{l()}catch(e){Q(i,c,e)}}}r=r.next}while(r!==a)}}catch(e){Q(t,t.return,e)}}function Bc(e){var t=e.updateQueue;if(t!==null){var n=e.stateNode;try{Ya(t,n)}catch(t){Q(e,e.return,t)}}}function Vc(e,t,n){n.props=Us(e.type,e.memoizedProps),n.state=e.memoizedState;try{n.componentWillUnmount()}catch(n){Q(e,t,n)}}function Hc(e,t){try{var n=e.ref;if(n!==null){switch(e.tag){case 26:case 27:case 5:var r=e.stateNode;break;case 30:r=e.stateNode;break;default:r=e.stateNode}typeof n==`function`?e.refCleanup=n(r):n.current=r}}catch(n){Q(e,t,n)}}function Uc(e,t){var n=e.ref,r=e.refCleanup;if(n!==null){if(typeof r==`function`)try{r()}catch(n){Q(e,t,n)}finally{e.refCleanup=null,e=e.alternate,e!=null&&(e.refCleanup=null)}else if(typeof n==`function`)try{n(null)}catch(n){Q(e,t,n)}else n.current=null}}function Wc(e){var t=e.type,n=e.memoizedProps,r=e.stateNode;try{a:switch(t){case`button`:case`input`:case`select`:case`textarea`:n.autoFocus&&r.focus();break a;case`img`:n.src?r.src=n.src:n.srcSet&&(r.srcset=n.srcSet)}}catch(t){Q(e,e.return,t)}}function Gc(e,t,n){try{var r=e.stateNode;Fd(r,e.type,n,t),r[st]=t}catch(t){Q(e,e.return,t)}}function Kc(e){return e.tag===5||e.tag===3||e.tag===26||e.tag===27&&Zd(e.type)||e.tag===4}function qc(e){a:for(;;){for(;e.sibling===null;){if(e.return===null||Kc(e.return))return null;e=e.return}for(e.sibling.return=e.return,e=e.sibling;e.tag!==5&&e.tag!==6&&e.tag!==18;){if(e.tag===27&&Zd(e.type)||e.flags&2||e.child===null||e.tag===4)continue a;e.child.return=e,e=e.child}if(!(e.flags&2))return e.stateNode}}function Jc(e,t,n){var r=e.tag;if(r===5||r===6)e=e.stateNode,t?(n.nodeType===9?n.body:n.nodeName===`HTML`?n.ownerDocument.body:n).insertBefore(e,t):(t=n.nodeType===9?n.body:n.nodeName===`HTML`?n.ownerDocument.body:n,t.appendChild(e),n=n._reactRootContainer,n!=null||t.onclick!==null||(t.onclick=$t));else if(r!==4&&(r===27&&Zd(e.type)&&(n=e.stateNode,t=null),e=e.child,e!==null))for(Jc(e,t,n),e=e.sibling;e!==null;)Jc(e,t,n),e=e.sibling}function Yc(e,t,n){var r=e.tag;if(r===5||r===6)e=e.stateNode,t?n.insertBefore(e,t):n.appendChild(e);else if(r!==4&&(r===27&&Zd(e.type)&&(n=e.stateNode),e=e.child,e!==null))for(Yc(e,t,n),e=e.sibling;e!==null;)Yc(e,t,n),e=e.sibling}function Xc(e){var t=e.stateNode,n=e.memoizedProps;try{for(var r=e.type,i=t.attributes;i.length;)t.removeAttributeNode(i[0]);Pd(t,r,n),t[ot]=e,t[st]=n}catch(t){Q(e,e.return,t)}}var Zc=!1,Qc=!1,$c=!1,el=typeof WeakSet==`function`?WeakSet:Set,tl=null;function nl(e,t){if(e=e.containerInfo,Rd=sp,e=Er(e),Dr(e)){if(`selectionStart`in e)var n={start:e.selectionStart,end:e.selectionEnd};else a:{n=(n=e.ownerDocument)&&n.defaultView||window;var r=n.getSelection&&n.getSelection();if(r&&r.rangeCount!==0){n=r.anchorNode;var a=r.anchorOffset,o=r.focusNode;r=r.focusOffset;try{n.nodeType,o.nodeType}catch{n=null;break a}var s=0,c=-1,l=-1,u=0,d=0,f=e,p=null;b:for(;;){for(var m;f!==n||a!==0&&f.nodeType!==3||(c=s+a),f!==o||r!==0&&f.nodeType!==3||(l=s+r),f.nodeType===3&&(s+=f.nodeValue.length),(m=f.firstChild)!==null;)p=f,f=m;for(;;){if(f===e)break b;if(p===n&&++u===a&&(c=s),p===o&&++d===r&&(l=s),(m=f.nextSibling)!==null)break;f=p,p=f.parentNode}f=m}n=c===-1||l===-1?null:{start:c,end:l}}else n=null}n=n||{start:0,end:0}}else n=null;for(zd={focusedElem:e,selectionRange:n},sp=!1,tl=t;tl!==null;)if(t=tl,e=t.child,t.subtreeFlags&1028&&e!==null)e.return=t,tl=e;else for(;tl!==null;){switch(t=tl,o=t.alternate,e=t.flags,t.tag){case 0:if(e&4&&(e=t.updateQueue,e=e===null?null:e.events,e!==null))for(n=0;n<e.length;n++)a=e[n],a.ref.impl=a.nextImpl;break;case 11:case 15:break;case 1:if(e&1024&&o!==null){e=void 0,n=t,a=o.memoizedProps,o=o.memoizedState,r=n.stateNode;try{var h=Us(n.type,a);e=r.getSnapshotBeforeUpdate(h,o),r.__reactInternalSnapshotBeforeUpdate=e}catch(e){Q(n,n.return,e)}}break;case 3:if(e&1024){if(e=t.stateNode.containerInfo,n=e.nodeType,n===9)ef(e);else if(n===1)switch(e.nodeName){case`HEAD`:case`HTML`:case`BODY`:ef(e);break;default:e.textContent=``}}break;case 5:case 26:case 27:case 6:case 4:case 17:break;default:if(e&1024)throw Error(i(163))}if(e=t.sibling,e!==null){e.return=t.return,tl=e;break}tl=t.return}}function rl(e,t,n){var r=n.flags;switch(n.tag){case 0:case 11:case 15:vl(e,n),r&4&&Rc(5,n);break;case 1:if(vl(e,n),r&4){if(e=n.stateNode,t===null)try{e.componentDidMount()}catch(e){Q(n,n.return,e)}else{var i=Us(n.type,t.memoizedProps);t=t.memoizedState;try{e.componentDidUpdate(i,t,e.__reactInternalSnapshotBeforeUpdate)}catch(e){Q(n,n.return,e)}}}r&64&&Bc(n),r&512&&Hc(n,n.return);break;case 3:if(vl(e,n),r&64&&(e=n.updateQueue,e!==null)){if(t=null,n.child!==null)switch(n.child.tag){case 27:case 5:t=n.child.stateNode;break;case 1:t=n.child.stateNode}try{Ya(e,t)}catch(e){Q(n,n.return,e)}}break;case 27:t===null&&r&4&&Xc(n);case 26:case 5:vl(e,n),t===null&&r&4&&Wc(n),r&512&&Hc(n,n.return);break;case 12:vl(e,n);break;case 31:vl(e,n),r&4&&ll(e,n);break;case 13:vl(e,n),r&4&&ul(e,n),r&64&&(e=n.memoizedState,e!==null&&(e=e.dehydrated,e!==null&&(n=qu.bind(null,n),sf(e,n))));break;case 22:if(r=n.memoizedState!==null||Zc,!r){t=t!==null&&t.memoizedState!==null||Qc,i=Zc;var a=Qc;Zc=r,(Qc=t)&&!a?bl(e,n,!!(n.subtreeFlags&8772)):vl(e,n),Zc=i,Qc=a}break;case 30:break;default:vl(e,n)}}function il(e){var t=e.alternate;t!==null&&(e.alternate=null,il(t)),e.child=null,e.deletions=null,e.sibling=null,e.tag===5&&(t=e.stateNode,t!==null&&mt(t)),e.stateNode=null,e.return=null,e.dependencies=null,e.memoizedProps=null,e.memoizedState=null,e.pendingProps=null,e.stateNode=null,e.updateQueue=null}var al=null,ol=!1;function sl(e,t,n){for(n=n.child;n!==null;)cl(e,t,n),n=n.sibling}function cl(e,t,n){if(Fe&&typeof Fe.onCommitFiberUnmount==`function`)try{Fe.onCommitFiberUnmount(Pe,n)}catch{}switch(n.tag){case 26:Qc||Uc(n,t),sl(e,t,n),n.memoizedState?n.memoizedState.count--:n.stateNode&&(n=n.stateNode,n.parentNode.removeChild(n));break;case 27:Qc||Uc(n,t);var r=al,i=ol;Zd(n.type)&&(al=n.stateNode,ol=!1),sl(e,t,n),pf(n.stateNode),al=r,ol=i;break;case 5:Qc||Uc(n,t);case 6:if(r=al,i=ol,al=null,sl(e,t,n),al=r,ol=i,al!==null){if(ol)try{(al.nodeType===9?al.body:al.nodeName===`HTML`?al.ownerDocument.body:al).removeChild(n.stateNode)}catch(e){Q(n,t,e)}else try{al.removeChild(n.stateNode)}catch(e){Q(n,t,e)}}break;case 18:al!==null&&(ol?(e=al,Qd(e.nodeType===9?e.body:e.nodeName===`HTML`?e.ownerDocument.body:e,n.stateNode),Np(e)):Qd(al,n.stateNode));break;case 4:r=al,i=ol,al=n.stateNode.containerInfo,ol=!0,sl(e,t,n),al=r,ol=i;break;case 0:case 11:case 14:case 15:zc(2,n,t),Qc||zc(4,n,t),sl(e,t,n);break;case 1:Qc||(Uc(n,t),r=n.stateNode,typeof r.componentWillUnmount==`function`&&Vc(n,t,r)),sl(e,t,n);break;case 21:sl(e,t,n);break;case 22:Qc=(r=Qc)||n.memoizedState!==null,sl(e,t,n),Qc=r;break;default:sl(e,t,n)}}function ll(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null))){e=e.dehydrated;try{Np(e)}catch(e){Q(t,t.return,e)}}}function ul(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null&&(e=e.dehydrated,e!==null))))try{Np(e)}catch(e){Q(t,t.return,e)}}function dl(e){switch(e.tag){case 31:case 13:case 19:var t=e.stateNode;return t===null&&(t=e.stateNode=new el),t;case 22:return e=e.stateNode,t=e._retryCache,t===null&&(t=e._retryCache=new el),t;default:throw Error(i(435,e.tag))}}function fl(e,t){var n=dl(e);t.forEach(function(t){if(!n.has(t)){n.add(t);var r=Ju.bind(null,e,t);t.then(r,r)}})}function pl(e,t){var n=t.deletions;if(n!==null)for(var r=0;r<n.length;r++){var a=n[r],o=e,s=t,c=s;a:for(;c!==null;){switch(c.tag){case 27:if(Zd(c.type)){al=c.stateNode,ol=!1;break a}break;case 5:al=c.stateNode,ol=!1;break a;case 3:case 4:al=c.stateNode.containerInfo,ol=!0;break a}c=c.return}if(al===null)throw Error(i(160));cl(o,s,a),al=null,ol=!1,o=a.alternate,o!==null&&(o.return=null),a.return=null}if(t.subtreeFlags&13886)for(t=t.child;t!==null;)hl(t,e),t=t.sibling}var ml=null;function hl(e,t){var n=e.alternate,r=e.flags;switch(e.tag){case 0:case 11:case 14:case 15:pl(t,e),gl(e),r&4&&(zc(3,e,e.return),Rc(3,e),zc(5,e,e.return));break;case 1:pl(t,e),gl(e),r&512&&(Qc||n===null||Uc(n,n.return)),r&64&&Zc&&(e=e.updateQueue,e!==null&&(r=e.callbacks,r!==null&&(n=e.shared.hiddenCallbacks,e.shared.hiddenCallbacks=n===null?r:n.concat(r))));break;case 26:var a=ml;if(pl(t,e),gl(e),r&512&&(Qc||n===null||Uc(n,n.return)),r&4){var o=n===null?null:n.memoizedState;if(r=e.memoizedState,n===null){if(r===null){if(e.stateNode===null){a:{r=e.type,n=e.memoizedProps,a=a.ownerDocument||a;b:switch(r){case`title`:o=a.getElementsByTagName(`title`)[0],(!o||o[pt]||o[ot]||o.namespaceURI===`http://www.w3.org/2000/svg`||o.hasAttribute(`itemprop`))&&(o=a.createElement(r),a.head.insertBefore(o,a.querySelector(`head > title`))),Pd(o,r,n),o[ot]=e,yt(o),r=o;break a;case`link`:var s=Vf(`link`,`href`,a).get(r+(n.href||``));if(s){for(var c=0;c<s.length;c++)if(o=s[c],o.getAttribute(`href`)===(n.href==null||n.href===``?null:n.href)&&o.getAttribute(`rel`)===(n.rel==null?null:n.rel)&&o.getAttribute(`title`)===(n.title==null?null:n.title)&&o.getAttribute(`crossorigin`)===(n.crossOrigin==null?null:n.crossOrigin)){s.splice(c,1);break b}}o=a.createElement(r),Pd(o,r,n),a.head.appendChild(o);break;case`meta`:if(s=Vf(`meta`,`content`,a).get(r+(n.content||``))){for(c=0;c<s.length;c++)if(o=s[c],o.getAttribute(`content`)===(n.content==null?null:``+n.content)&&o.getAttribute(`name`)===(n.name==null?null:n.name)&&o.getAttribute(`property`)===(n.property==null?null:n.property)&&o.getAttribute(`http-equiv`)===(n.httpEquiv==null?null:n.httpEquiv)&&o.getAttribute(`charset`)===(n.charSet==null?null:n.charSet)){s.splice(c,1);break b}}o=a.createElement(r),Pd(o,r,n),a.head.appendChild(o);break;default:throw Error(i(468,r))}o[ot]=e,yt(o),r=o}e.stateNode=r}else Hf(a,e.type,e.stateNode)}else e.stateNode=If(a,r,e.memoizedProps)}else o===r?r===null&&e.stateNode!==null&&Gc(e,e.memoizedProps,n.memoizedProps):(o===null?n.stateNode!==null&&(n=n.stateNode,n.parentNode.removeChild(n)):o.count--,r===null?Hf(a,e.type,e.stateNode):If(a,r,e.memoizedProps))}break;case 27:pl(t,e),gl(e),r&512&&(Qc||n===null||Uc(n,n.return)),n!==null&&r&4&&Gc(e,e.memoizedProps,n.memoizedProps);break;case 5:if(pl(t,e),gl(e),r&512&&(Qc||n===null||Uc(n,n.return)),e.flags&32){a=e.stateNode;try{Gt(a,``)}catch(t){Q(e,e.return,t)}}r&4&&e.stateNode!=null&&(a=e.memoizedProps,Gc(e,a,n===null?a:n.memoizedProps)),r&1024&&($c=!0);break;case 6:if(pl(t,e),gl(e),r&4){if(e.stateNode===null)throw Error(i(162));r=e.memoizedProps,n=e.stateNode;try{n.nodeValue=r}catch(t){Q(e,e.return,t)}}break;case 3:if(Bf=null,a=ml,ml=gf(t.containerInfo),pl(t,e),ml=a,gl(e),r&4&&n!==null&&n.memoizedState.isDehydrated)try{Np(t.containerInfo)}catch(t){Q(e,e.return,t)}$c&&($c=!1,_l(e));break;case 4:r=ml,ml=gf(e.stateNode.containerInfo),pl(t,e),gl(e),ml=r;break;case 12:pl(t,e),gl(e);break;case 31:pl(t,e),gl(e),r&4&&(r=e.updateQueue,r!==null&&(e.updateQueue=null,fl(e,r)));break;case 13:pl(t,e),gl(e),e.child.flags&8192&&e.memoizedState!==null!=(n!==null&&n.memoizedState!==null)&&(Ql=Ee()),r&4&&(r=e.updateQueue,r!==null&&(e.updateQueue=null,fl(e,r)));break;case 22:a=e.memoizedState!==null;var l=n!==null&&n.memoizedState!==null,u=Zc,d=Qc;if(Zc=u||a,Qc=d||l,pl(t,e),Qc=d,Zc=u,gl(e),r&8192)a:for(t=e.stateNode,t._visibility=a?t._visibility&-2:t._visibility|1,a&&(n===null||l||Zc||Qc||yl(e)),n=null,t=e;;){if(t.tag===5||t.tag===26){if(n===null){l=n=t;try{if(o=l.stateNode,a)s=o.style,typeof s.setProperty==`function`?s.setProperty(`display`,`none`,`important`):s.display=`none`;else{c=l.stateNode;var f=l.memoizedProps.style,p=f!=null&&f.hasOwnProperty(`display`)?f.display:null;c.style.display=p==null||typeof p==`boolean`?``:(``+p).trim()}}catch(e){Q(l,l.return,e)}}}else if(t.tag===6){if(n===null){l=t;try{l.stateNode.nodeValue=a?``:l.memoizedProps}catch(e){Q(l,l.return,e)}}}else if(t.tag===18){if(n===null){l=t;try{var m=l.stateNode;a?$d(m,!0):$d(l.stateNode,!1)}catch(e){Q(l,l.return,e)}}}else if((t.tag!==22&&t.tag!==23||t.memoizedState===null||t===e)&&t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break a;for(;t.sibling===null;){if(t.return===null||t.return===e)break a;n===t&&(n=null),t=t.return}n===t&&(n=null),t.sibling.return=t.return,t=t.sibling}r&4&&(r=e.updateQueue,r!==null&&(n=r.retryQueue,n!==null&&(r.retryQueue=null,fl(e,n))));break;case 19:pl(t,e),gl(e),r&4&&(r=e.updateQueue,r!==null&&(e.updateQueue=null,fl(e,r)));break;case 30:break;case 21:break;default:pl(t,e),gl(e)}}function gl(e){var t=e.flags;if(t&2){try{for(var n,r=e.return;r!==null;){if(Kc(r)){n=r;break}r=r.return}if(n==null)throw Error(i(160));switch(n.tag){case 27:var a=n.stateNode;Yc(e,qc(e),a);break;case 5:var o=n.stateNode;n.flags&32&&(Gt(o,``),n.flags&=-33),Yc(e,qc(e),o);break;case 3:case 4:var s=n.stateNode.containerInfo;Jc(e,qc(e),s);break;default:throw Error(i(161))}}catch(t){Q(e,e.return,t)}e.flags&=-3}t&4096&&(e.flags&=-4097)}function _l(e){if(e.subtreeFlags&1024)for(e=e.child;e!==null;){var t=e;_l(t),t.tag===5&&t.flags&1024&&t.stateNode.reset(),e=e.sibling}}function vl(e,t){if(t.subtreeFlags&8772)for(t=t.child;t!==null;)rl(e,t.alternate,t),t=t.sibling}function yl(e){for(e=e.child;e!==null;){var t=e;switch(t.tag){case 0:case 11:case 14:case 15:zc(4,t,t.return),yl(t);break;case 1:Uc(t,t.return);var n=t.stateNode;typeof n.componentWillUnmount==`function`&&Vc(t,t.return,n),yl(t);break;case 27:pf(t.stateNode);case 26:case 5:Uc(t,t.return),yl(t);break;case 22:t.memoizedState===null&&yl(t);break;case 30:yl(t);break;default:yl(t)}e=e.sibling}}function bl(e,t,n){for(n=n&&!!(t.subtreeFlags&8772),t=t.child;t!==null;){var r=t.alternate,i=e,a=t,o=a.flags;switch(a.tag){case 0:case 11:case 15:bl(i,a,n),Rc(4,a);break;case 1:if(bl(i,a,n),r=a,i=r.stateNode,typeof i.componentDidMount==`function`)try{i.componentDidMount()}catch(e){Q(r,r.return,e)}if(r=a,i=r.updateQueue,i!==null){var s=r.stateNode;try{var c=i.shared.hiddenCallbacks;if(c!==null)for(i.shared.hiddenCallbacks=null,i=0;i<c.length;i++)Ja(c[i],s)}catch(e){Q(r,r.return,e)}}n&&o&64&&Bc(a),Hc(a,a.return);break;case 27:Xc(a);case 26:case 5:bl(i,a,n),n&&r===null&&o&4&&Wc(a),Hc(a,a.return);break;case 12:bl(i,a,n);break;case 31:bl(i,a,n),n&&o&4&&ll(i,a);break;case 13:bl(i,a,n),n&&o&4&&ul(i,a);break;case 22:a.memoizedState===null&&bl(i,a,n),Hc(a,a.return);break;case 30:break;default:bl(i,a,n)}t=t.sibling}}function xl(e,t){var n=null;e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(n=e.memoizedState.cachePool.pool),e=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(e=t.memoizedState.cachePool.pool),e!==n&&(e!=null&&e.refCount++,n!=null&&sa(n))}function Sl(e,t){e=null,t.alternate!==null&&(e=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==e&&(t.refCount++,e!=null&&sa(e))}function Cl(e,t,n,r){if(t.subtreeFlags&10256)for(t=t.child;t!==null;)wl(e,t,n,r),t=t.sibling}function wl(e,t,n,r){var i=t.flags;switch(t.tag){case 0:case 11:case 15:Cl(e,t,n,r),i&2048&&Rc(9,t);break;case 1:Cl(e,t,n,r);break;case 3:Cl(e,t,n,r),i&2048&&(e=null,t.alternate!==null&&(e=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==e&&(t.refCount++,e!=null&&sa(e)));break;case 12:if(i&2048){Cl(e,t,n,r),e=t.stateNode;try{var a=t.memoizedProps,o=a.id,s=a.onPostCommit;typeof s==`function`&&s(o,t.alternate===null?`mount`:`update`,e.passiveEffectDuration,-0)}catch(e){Q(t,t.return,e)}}else Cl(e,t,n,r);break;case 31:Cl(e,t,n,r);break;case 13:Cl(e,t,n,r);break;case 23:break;case 22:a=t.stateNode,o=t.alternate,t.memoizedState===null?a._visibility&2?Cl(e,t,n,r):(a._visibility|=2,Tl(e,t,n,r,!!(t.subtreeFlags&10256)||!1)):a._visibility&2?Cl(e,t,n,r):El(e,t),i&2048&&xl(o,t);break;case 24:Cl(e,t,n,r),i&2048&&Sl(t.alternate,t);break;default:Cl(e,t,n,r)}}function Tl(e,t,n,r,i){for(i=i&&(!!(t.subtreeFlags&10256)||!1),t=t.child;t!==null;){var a=e,o=t,s=n,c=r,l=o.flags;switch(o.tag){case 0:case 11:case 15:Tl(a,o,s,c,i),Rc(8,o);break;case 23:break;case 22:var u=o.stateNode;o.memoizedState===null?(u._visibility|=2,Tl(a,o,s,c,i)):u._visibility&2?Tl(a,o,s,c,i):El(a,o),i&&l&2048&&xl(o.alternate,o);break;case 24:Tl(a,o,s,c,i),i&&l&2048&&Sl(o.alternate,o);break;default:Tl(a,o,s,c,i)}t=t.sibling}}function El(e,t){if(t.subtreeFlags&10256)for(t=t.child;t!==null;){var n=e,r=t,i=r.flags;switch(r.tag){case 22:El(n,r),i&2048&&xl(r.alternate,r);break;case 24:El(n,r),i&2048&&Sl(r.alternate,r);break;default:El(n,r)}t=t.sibling}}var Dl=8192;function Ol(e,t,n){if(e.subtreeFlags&Dl)for(e=e.child;e!==null;)kl(e,t,n),e=e.sibling}function kl(e,t,n){switch(e.tag){case 26:Ol(e,t,n),e.flags&Dl&&e.memoizedState!==null&&Gf(n,ml,e.memoizedState,e.memoizedProps);break;case 5:Ol(e,t,n);break;case 3:case 4:var r=ml;ml=gf(e.stateNode.containerInfo),Ol(e,t,n),ml=r;break;case 22:e.memoizedState===null&&(r=e.alternate,r!==null&&r.memoizedState!==null?(r=Dl,Dl=16777216,Ol(e,t,n),Dl=r):Ol(e,t,n));break;default:Ol(e,t,n)}}function Al(e){var t=e.alternate;if(t!==null&&(e=t.child,e!==null)){t.child=null;do t=e.sibling,e.sibling=null,e=t;while(e!==null)}}function jl(e){var t=e.deletions;if(e.flags&16){if(t!==null)for(var n=0;n<t.length;n++){var r=t[n];tl=r,Pl(r,e)}Al(e)}if(e.subtreeFlags&10256)for(e=e.child;e!==null;)Ml(e),e=e.sibling}function Ml(e){switch(e.tag){case 0:case 11:case 15:jl(e),e.flags&2048&&zc(9,e,e.return);break;case 3:jl(e);break;case 12:jl(e);break;case 22:var t=e.stateNode;e.memoizedState!==null&&t._visibility&2&&(e.return===null||e.return.tag!==13)?(t._visibility&=-3,Nl(e)):jl(e);break;default:jl(e)}}function Nl(e){var t=e.deletions;if(e.flags&16){if(t!==null)for(var n=0;n<t.length;n++){var r=t[n];tl=r,Pl(r,e)}Al(e)}for(e=e.child;e!==null;){switch(t=e,t.tag){case 0:case 11:case 15:zc(8,t,t.return),Nl(t);break;case 22:n=t.stateNode,n._visibility&2&&(n._visibility&=-3,Nl(t));break;default:Nl(t)}e=e.sibling}}function Pl(e,t){for(;tl!==null;){var n=tl;switch(n.tag){case 0:case 11:case 15:zc(8,n,t);break;case 23:case 22:if(n.memoizedState!==null&&n.memoizedState.cachePool!==null){var r=n.memoizedState.cachePool.pool;r!=null&&r.refCount++}break;case 24:sa(n.memoizedState.cache)}if(r=n.child,r!==null)r.return=n,tl=r;else a:for(n=e;tl!==null;){r=tl;var i=r.sibling,a=r.return;if(il(r),r===n){tl=null;break a}if(i!==null){i.return=a,tl=i;break a}tl=a}}}var Fl={getCacheForType:function(e){var t=ea(aa),n=t.data.get(e);return n===void 0&&(n=e(),t.data.set(e,n)),n},cacheSignal:function(){return ea(aa).controller.signal}},Il=typeof WeakMap==`function`?WeakMap:Map,J=0,Ll=null,Y=null,X=0,Z=0,Rl=null,zl=!1,Bl=!1,Vl=!1,Hl=0,Ul=0,Wl=0,Gl=0,Kl=0,ql=0,Jl=0,Yl=null,Xl=null,Zl=!1,Ql=0,$l=0,eu=1/0,tu=null,nu=null,ru=0,iu=null,au=null,ou=0,su=0,cu=null,lu=null,uu=0,du=null;function fu(){return J&2&&X!==0?X&-X:j.T===null?rt():ud()}function pu(){if(ql===0){if(!(X&536870912)||B){var e=He;He<<=1,!(He&3932160)&&(He=262144),ql=e}else ql=536870912}return e=to.current,e!==null&&(e.flags|=32),ql}function mu(e,t,n){(e===Ll&&(Z===2||Z===9)||e.cancelPendingCommit!==null)&&(xu(e,0),vu(e,X,ql,!1)),Xe(e,n),J&2&&e===Ll||(e===Ll&&(!(J&2)&&(Gl|=n),Ul===4&&vu(e,X,ql,!1)),nd(e))}function hu(e,t,n){if(J&6)throw Error(i(327));var r=!n&&!(t&127)&&(t&e.expiredLanes)===0||Ke(e,t),a=r?ku(e,t):Du(e,t,!0),o=r;do{if(a===0){Bl&&!r&&vu(e,t,0,!1);break}if(n=e.current.alternate,o&&!_u(n))a=Du(e,t,!1),o=!1;else{if(a===2){if(o=t,e.errorRecoveryDisabledLanes&o)var s=0;else s=e.pendingLanes&-536870913,s=s===0?s&536870912?536870912:0:s;if(s!==0){t=s;a:{var c=e;a=Yl;var l=c.current.memoizedState.isDehydrated;if(l&&(xu(c,s).flags|=256),s=Du(c,s,!1),s!==2){if(Vl&&!l){c.errorRecoveryDisabledLanes|=o,Gl|=o,a=4;break a}o=Xl,Xl=a,o!==null&&(Xl===null?Xl=o:Xl.push.apply(Xl,o))}a=s}if(o=!1,a!==2)continue}}if(a===1){xu(e,0),vu(e,t,0,!0);break}a:{switch(r=e,o=a,o){case 0:case 1:throw Error(i(345));case 4:if((t&4194048)!==t)break;case 6:vu(r,t,ql,!zl);break a;case 2:Xl=null;break;case 3:case 5:break;default:throw Error(i(329))}if((t&62914560)===t&&(a=Ql+300-Ee(),10<a)){if(vu(r,t,ql,!zl),Ge(r,0,!0)!==0)break a;ou=t,r.timeoutHandle=Kd(gu.bind(null,r,n,Xl,tu,Zl,t,ql,Gl,Jl,zl,o,`Throttled`,-0,0),a);break a}gu(r,n,Xl,tu,Zl,t,ql,Gl,Jl,zl,o,null,-0,0)}break}}while(1);nd(e)}function gu(e,t,n,r,i,a,o,s,c,l,u,d,f,p){if(e.timeoutHandle=-1,d=t.subtreeFlags,d&8192||(d&16785408)==16785408){d={stylesheets:null,count:0,imgCount:0,imgBytes:0,suspenseyImages:[],waitingForImages:!0,waitingForViewTransition:!1,unsuspend:$t},kl(t,a,d);var m=(a&62914560)===a?Ql-Ee():(a&4194048)===a?$l-Ee():0;if(m=qf(d,m),m!==null){ou=a,e.cancelPendingCommit=m(Iu.bind(null,e,t,a,n,r,i,o,s,c,u,d,null,f,p)),vu(e,a,o,!l);return}}Iu(e,t,a,n,r,i,o,s,c)}function _u(e){for(var t=e;;){var n=t.tag;if((n===0||n===11||n===15)&&t.flags&16384&&(n=t.updateQueue,n!==null&&(n=n.stores,n!==null)))for(var r=0;r<n.length;r++){var i=n[r],a=i.getSnapshot;i=i.value;try{if(!xr(a(),i))return!1}catch{return!1}}if(n=t.child,t.subtreeFlags&16384&&n!==null)n.return=t,t=n;else{if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return!0;t=t.return}t.sibling.return=t.return,t=t.sibling}}return!0}function vu(e,t,n,r){t&=~Kl,t&=~Gl,e.suspendedLanes|=t,e.pingedLanes&=~t,r&&(e.warmLanes|=t),r=e.expirationTimes;for(var i=t;0<i;){var a=31-Le(i),o=1<<a;r[a]=-1,i&=~o}n!==0&&Qe(e,n,t)}function yu(){return J&6?!0:(rd(0,!1),!1)}function bu(){if(Y!==null){if(Z===0)var e=Y.return;else e=Y,Ki=Gi=null,Eo(e),Aa=null,ja=0,e=Y;for(;e!==null;)Lc(e.alternate,e),e=e.return;Y=null}}function xu(e,t){var n=e.timeoutHandle;n!==-1&&(e.timeoutHandle=-1,qd(n)),n=e.cancelPendingCommit,n!==null&&(e.cancelPendingCommit=null,n()),ou=0,bu(),Ll=e,Y=n=li(e.current,null),X=t,Z=0,Rl=null,zl=!1,Bl=Ke(e,t),Vl=!1,Jl=ql=Kl=Gl=Wl=Ul=0,Xl=Yl=null,Zl=!1,t&8&&(t|=t&32);var r=e.entangledLanes;if(r!==0)for(e=e.entanglements,r&=t;0<r;){var i=31-Le(r),a=1<<i;t|=e[i],r&=~a}return Hl=t,$r(),n}function Su(e,t){H=null,j.H=Fs,t===ba||t===Sa?(t=Oa(),Z=3):t===xa?(t=Oa(),Z=4):Z=t===$s?8:typeof t==`object`&&t&&typeof t.then==`function`?6:1,Rl=t,Y===null&&(Ul=1,qs(e,_i(t,e.current)))}function Cu(){var e=to.current;return e===null?!0:(X&4194048)===X?no===null:(X&62914560)===X||X&536870912?e===no:!1}function wu(){var e=j.H;return j.H=Fs,e===null?Fs:e}function Tu(){var e=j.A;return j.A=Fl,e}function Eu(){Ul=4,zl||(X&4194048)!==X&&to.current!==null||(Bl=!0),!(Wl&134217727)&&!(Gl&134217727)||Ll===null||vu(Ll,X,ql,!1)}function Du(e,t,n){var r=J;J|=2;var i=wu(),a=Tu();(Ll!==e||X!==t)&&(tu=null,xu(e,t)),t=!1;var o=Ul;a:do try{if(Z!==0&&Y!==null){var s=Y,c=Rl;switch(Z){case 8:bu(),o=6;break a;case 3:case 2:case 9:case 6:to.current===null&&(t=!0);var l=Z;if(Z=0,Rl=null,Nu(e,s,c,l),n&&Bl){o=0;break a}break;default:l=Z,Z=0,Rl=null,Nu(e,s,c,l)}}Ou(),o=Ul;break}catch(t){Su(e,t)}while(1);return t&&e.shellSuspendCounter++,Ki=Gi=null,J=r,j.H=i,j.A=a,Y===null&&(Ll=null,X=0,$r()),o}function Ou(){for(;Y!==null;)ju(Y)}function ku(e,t){var n=J;J|=2;var r=wu(),a=Tu();Ll!==e||X!==t?(tu=null,eu=Ee()+500,xu(e,t)):Bl=Ke(e,t);a:do try{if(Z!==0&&Y!==null){t=Y;var o=Rl;b:switch(Z){case 1:Z=0,Rl=null,Nu(e,t,o,1);break;case 2:case 9:if(wa(o)){Z=0,Rl=null,Mu(t);break}t=function(){Z!==2&&Z!==9||Ll!==e||(Z=7),nd(e)},o.then(t,t);break a;case 3:Z=7;break a;case 4:Z=5;break a;case 7:wa(o)?(Z=0,Rl=null,Mu(t)):(Z=0,Rl=null,Nu(e,t,o,7));break;case 5:var s=null;switch(Y.tag){case 26:s=Y.memoizedState;case 5:case 27:var c=Y;if(s?Wf(s):c.stateNode.complete){Z=0,Rl=null;var l=c.sibling;if(l!==null)Y=l;else{var u=c.return;u===null?Y=null:(Y=u,Pu(u))}break b}}Z=0,Rl=null,Nu(e,t,o,5);break;case 6:Z=0,Rl=null,Nu(e,t,o,6);break;case 8:bu(),Ul=6;break a;default:throw Error(i(462))}}Au();break}catch(t){Su(e,t)}while(1);return Ki=Gi=null,j.H=r,j.A=a,J=n,Y===null?(Ll=null,X=0,$r(),Ul):0}function Au(){for(;Y!==null&&!we();)ju(Y)}function ju(e){var t=Oc(e.alternate,e,Hl);e.memoizedProps=e.pendingProps,t===null?Pu(e):Y=t}function Mu(e){var t=e,n=t.alternate;switch(t.tag){case 15:case 0:t=fc(n,t,t.pendingProps,t.type,void 0,X);break;case 11:t=fc(n,t,t.pendingProps,t.type.render,t.ref,X);break;case 5:Eo(t);default:Lc(n,t),t=Y=ui(t,Hl),t=Oc(n,t,Hl)}e.memoizedProps=e.pendingProps,t===null?Pu(e):Y=t}function Nu(e,t,n,r){Ki=Gi=null,Eo(t),Aa=null,ja=0;var i=t.return;try{if(Qs(e,i,t,n,X)){Ul=1,qs(e,_i(n,e.current)),Y=null;return}}catch(t){if(i!==null)throw Y=i,t;Ul=1,qs(e,_i(n,e.current)),Y=null;return}t.flags&32768?(B||r===1?e=!0:Bl||X&536870912?e=!1:(zl=e=!0,(r===2||r===9||r===3||r===6)&&(r=to.current,r!==null&&r.tag===13&&(r.flags|=16384))),Fu(t,e)):Pu(t)}function Pu(e){var t=e;do{if(t.flags&32768){Fu(t,zl);return}e=t.return;var n=Fc(t.alternate,t,Hl);if(n!==null){Y=n;return}if(t=t.sibling,t!==null){Y=t;return}Y=t=e}while(t!==null);Ul===0&&(Ul=5)}function Fu(e,t){do{var n=Ic(e.alternate,e);if(n!==null){n.flags&=32767,Y=n;return}if(n=e.return,n!==null&&(n.flags|=32768,n.subtreeFlags=0,n.deletions=null),!t&&(e=e.sibling,e!==null)){Y=e;return}Y=e=n}while(e!==null);Ul=6,Y=null}function Iu(e,t,n,r,a,o,s,c,l){e.cancelPendingCommit=null;do Vu();while(ru!==0);if(J&6)throw Error(i(327));if(t!==null){if(t===e.current)throw Error(i(177));if(o=t.lanes|t.childLanes,o|=Qr,Ze(e,n,o,s,c,l),e===Ll&&(Y=Ll=null,X=0),au=t,iu=e,ou=n,su=o,cu=a,lu=r,t.subtreeFlags&10256||t.flags&10256?(e.callbackNode=null,e.callbackPriority=0,Yu(Ae,function(){return Hu(),null})):(e.callbackNode=null,e.callbackPriority=0),r=!!(t.flags&13878),t.subtreeFlags&13878||r){r=j.T,j.T=null,a=M.p,M.p=2,s=J,J|=4;try{nl(e,t,n)}finally{J=s,M.p=a,j.T=r}}ru=1,Lu(),Ru(),zu()}}function Lu(){if(ru===1){ru=0;var e=iu,t=au,n=!!(t.flags&13878);if(t.subtreeFlags&13878||n){n=j.T,j.T=null;var r=M.p;M.p=2;var i=J;J|=4;try{hl(t,e);var a=zd,o=Er(e.containerInfo),s=a.focusedElem,c=a.selectionRange;if(o!==s&&s&&s.ownerDocument&&Tr(s.ownerDocument.documentElement,s)){if(c!==null&&Dr(s)){var l=c.start,u=c.end;if(u===void 0&&(u=l),`selectionStart`in s)s.selectionStart=l,s.selectionEnd=Math.min(u,s.value.length);else{var d=s.ownerDocument||document,f=d&&d.defaultView||window;if(f.getSelection){var p=f.getSelection(),m=s.textContent.length,h=Math.min(c.start,m),g=c.end===void 0?h:Math.min(c.end,m);!p.extend&&h>g&&(o=g,g=h,h=o);var _=wr(s,h),v=wr(s,g);if(_&&v&&(p.rangeCount!==1||p.anchorNode!==_.node||p.anchorOffset!==_.offset||p.focusNode!==v.node||p.focusOffset!==v.offset)){var y=d.createRange();y.setStart(_.node,_.offset),p.removeAllRanges(),h>g?(p.addRange(y),p.extend(v.node,v.offset)):(y.setEnd(v.node,v.offset),p.addRange(y))}}}}for(d=[],p=s;p=p.parentNode;)p.nodeType===1&&d.push({element:p,left:p.scrollLeft,top:p.scrollTop});for(typeof s.focus==`function`&&s.focus(),s=0;s<d.length;s++){var b=d[s];b.element.scrollLeft=b.left,b.element.scrollTop=b.top}}sp=!!Rd,zd=Rd=null}finally{J=i,M.p=r,j.T=n}}e.current=t,ru=2}}function Ru(){if(ru===2){ru=0;var e=iu,t=au,n=!!(t.flags&8772);if(t.subtreeFlags&8772||n){n=j.T,j.T=null;var r=M.p;M.p=2;var i=J;J|=4;try{rl(e,t.alternate,t)}finally{J=i,M.p=r,j.T=n}}ru=3}}function zu(){if(ru===4||ru===3){ru=0,Te();var e=iu,t=au,n=ou,r=lu;t.subtreeFlags&10256||t.flags&10256?ru=5:(ru=0,au=iu=null,Bu(e,e.pendingLanes));var i=e.pendingLanes;if(i===0&&(nu=null),nt(n),t=t.stateNode,Fe&&typeof Fe.onCommitFiberRoot==`function`)try{Fe.onCommitFiberRoot(Pe,t,void 0,(t.current.flags&128)==128)}catch{}if(r!==null){t=j.T,i=M.p,M.p=2,j.T=null;try{for(var a=e.onRecoverableError,o=0;o<r.length;o++){var s=r[o];a(s.value,{componentStack:s.stack})}}finally{j.T=t,M.p=i}}ou&3&&Vu(),nd(e),i=e.pendingLanes,n&261930&&i&42?e===du?uu++:(uu=0,du=e):uu=0,rd(0,!1)}}function Bu(e,t){(e.pooledCacheLanes&=t)===0&&(t=e.pooledCache,t!=null&&(e.pooledCache=null,sa(t)))}function Vu(){return Lu(),Ru(),zu(),Hu()}function Hu(){if(ru!==5)return!1;var e=iu,t=su;su=0;var n=nt(ou),r=j.T,a=M.p;try{M.p=32>n?32:n,j.T=null,n=cu,cu=null;var o=iu,s=ou;if(ru=0,au=iu=null,ou=0,J&6)throw Error(i(331));var c=J;if(J|=4,Ml(o.current),wl(o,o.current,s,n),J=c,rd(0,!1),Fe&&typeof Fe.onPostCommitFiberRoot==`function`)try{Fe.onPostCommitFiberRoot(Pe,o)}catch{}return!0}finally{M.p=a,j.T=r,Bu(e,t)}}function Uu(e,t,n){t=_i(n,t),t=Ys(e.stateNode,t,2),e=Ha(e,t,2),e!==null&&(Xe(e,2),nd(e))}function Q(e,t,n){if(e.tag===3)Uu(e,e,n);else for(;t!==null;){if(t.tag===3){Uu(t,e,n);break}if(t.tag===1){var r=t.stateNode;if(typeof t.type.getDerivedStateFromError==`function`||typeof r.componentDidCatch==`function`&&(nu===null||!nu.has(r))){e=_i(n,e),n=Xs(2),r=Ha(t,n,2),r!==null&&(Zs(n,r,t,e),Xe(r,2),nd(r));break}}t=t.return}}function Wu(e,t,n){var r=e.pingCache;if(r===null){r=e.pingCache=new Il;var i=new Set;r.set(t,i)}else i=r.get(t),i===void 0&&(i=new Set,r.set(t,i));i.has(n)||(Vl=!0,i.add(n),e=Gu.bind(null,e,t,n),t.then(e,e))}function Gu(e,t,n){var r=e.pingCache;r!==null&&r.delete(t),e.pingedLanes|=e.suspendedLanes&n,e.warmLanes&=~n,Ll===e&&(X&n)===n&&(Ul===4||Ul===3&&(X&62914560)===X&&300>Ee()-Ql?!(J&2)&&xu(e,0):Kl|=n,Jl===X&&(Jl=0)),nd(e)}function Ku(e,t){t===0&&(t=Je()),e=ni(e,t),e!==null&&(Xe(e,t),nd(e))}function qu(e){var t=e.memoizedState,n=0;t!==null&&(n=t.retryLane),Ku(e,n)}function Ju(e,t){var n=0;switch(e.tag){case 31:case 13:var r=e.stateNode,a=e.memoizedState;a!==null&&(n=a.retryLane);break;case 19:r=e.stateNode;break;case 22:r=e.stateNode._retryCache;break;default:throw Error(i(314))}r!==null&&r.delete(t),Ku(e,n)}function Yu(e,t){return Se(e,t)}var Xu=null,Zu=null,Qu=!1,$u=!1,ed=!1,td=0;function nd(e){e!==Zu&&e.next===null&&(Zu===null?Xu=Zu=e:Zu=Zu.next=e),$u=!0,Qu||(Qu=!0,ld())}function rd(e,t){if(!ed&&$u){ed=!0;do for(var n=!1,r=Xu;r!==null;){if(!t){if(e!==0){var i=r.pendingLanes;if(i===0)var a=0;else{var o=r.suspendedLanes,s=r.pingedLanes;a=(1<<31-Le(42|e)+1)-1,a&=i&~(o&~s),a=a&201326741?a&201326741|1:a?a|2:0}a!==0&&(n=!0,cd(r,a))}else a=X,a=Ge(r,r===Ll?a:0,r.cancelPendingCommit!==null||r.timeoutHandle!==-1),!(a&3)||Ke(r,a)||(n=!0,cd(r,a))}r=r.next}while(n);ed=!1}}function id(){ad()}function ad(){$u=Qu=!1;var e=0;td!==0&&Gd()&&(e=td);for(var t=Ee(),n=null,r=Xu;r!==null;){var i=r.next,a=od(r,t);a===0?(r.next=null,n===null?Xu=i:n.next=i,i===null&&(Zu=n)):(n=r,(e!==0||a&3)&&($u=!0)),r=i}ru!==0&&ru!==5||rd(e,!1),td!==0&&(td=0)}function od(e,t){for(var n=e.suspendedLanes,r=e.pingedLanes,i=e.expirationTimes,a=e.pendingLanes&-62914561;0<a;){var o=31-Le(a),s=1<<o,c=i[o];c===-1?((s&n)===0||(s&r)!==0)&&(i[o]=qe(s,t)):c<=t&&(e.expiredLanes|=s),a&=~s}if(t=Ll,n=X,n=Ge(e,e===t?n:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),r=e.callbackNode,n===0||e===t&&(Z===2||Z===9)||e.cancelPendingCommit!==null)return r!==null&&r!==null&&Ce(r),e.callbackNode=null,e.callbackPriority=0;if(!(n&3)||Ke(e,n)){if(t=n&-n,t===e.callbackPriority)return t;switch(r!==null&&Ce(r),nt(n)){case 2:case 8:n=ke;break;case 32:n=Ae;break;case 268435456:n=Me;break;default:n=Ae}return r=sd.bind(null,e),n=Se(n,r),e.callbackPriority=t,e.callbackNode=n,t}return r!==null&&r!==null&&Ce(r),e.callbackPriority=2,e.callbackNode=null,2}function sd(e,t){if(ru!==0&&ru!==5)return e.callbackNode=null,e.callbackPriority=0,null;var n=e.callbackNode;if(Vu()&&e.callbackNode!==n)return null;var r=X;return r=Ge(e,e===Ll?r:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),r===0?null:(hu(e,r,t),od(e,Ee()),e.callbackNode!=null&&e.callbackNode===n?sd.bind(null,e):null)}function cd(e,t){if(Vu())return null;hu(e,t,!0)}function ld(){Yd(function(){J&6?Se(Oe,id):ad()})}function ud(){if(td===0){var e=ua;e===0&&(e=Ve,Ve<<=1,!(Ve&261888)&&(Ve=256)),td=e}return td}function dd(e){return e==null||typeof e==`symbol`||typeof e==`boolean`?null:typeof e==`function`?e:Qt(``+e)}function fd(e,t){var n=t.ownerDocument.createElement(`input`);return n.name=t.name,n.value=t.value,e.id&&n.setAttribute(`form`,e.id),t.parentNode.insertBefore(n,t),e=new FormData(e),n.parentNode.removeChild(n),e}function pd(e,t,n,r,i){if(t===`submit`&&n&&n.stateNode===i){var a=dd((i[st]||null).action),o=r.submitter;o&&(t=(t=o[st]||null)?dd(t.formAction):o.getAttribute(`formAction`),t!==null&&(a=t,o=null));var s=new bn(`action`,`action`,null,r,i);e.push({event:s,listeners:[{instance:null,listener:function(){if(r.defaultPrevented){if(td!==0){var e=o?fd(i,o):new FormData(i);xs(n,{pending:!0,data:e,method:i.method,action:a},null,e)}}else typeof a==`function`&&(s.preventDefault(),e=o?fd(i,o):new FormData(i),xs(n,{pending:!0,data:e,method:i.method,action:a},a,e))},currentTarget:i}]})}}for(var md=0;md<qr.length;md++){var hd=qr[md];Jr(hd.toLowerCase(),`on`+(hd[0].toUpperCase()+hd.slice(1)))}Jr(zr,`onAnimationEnd`),Jr(Br,`onAnimationIteration`),Jr(Vr,`onAnimationStart`),Jr(`dblclick`,`onDoubleClick`),Jr(`focusin`,`onFocus`),Jr(`focusout`,`onBlur`),Jr(Hr,`onTransitionRun`),Jr(Ur,`onTransitionStart`),Jr(Wr,`onTransitionCancel`),Jr(Gr,`onTransitionEnd`),Ct(`onMouseEnter`,[`mouseout`,`mouseover`]),Ct(`onMouseLeave`,[`mouseout`,`mouseover`]),Ct(`onPointerEnter`,[`pointerout`,`pointerover`]),Ct(`onPointerLeave`,[`pointerout`,`pointerover`]),St(`onChange`,`change click focusin focusout input keydown keyup selectionchange`.split(` `)),St(`onSelect`,`focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange`.split(` `)),St(`onBeforeInput`,[`compositionend`,`keypress`,`textInput`,`paste`]),St(`onCompositionEnd`,`compositionend focusout keydown keypress keyup mousedown`.split(` `)),St(`onCompositionStart`,`compositionstart focusout keydown keypress keyup mousedown`.split(` `)),St(`onCompositionUpdate`,`compositionupdate focusout keydown keypress keyup mousedown`.split(` `));var gd=`abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting`.split(` `),_d=new Set(`beforetoggle cancel close invalid load scroll scrollend toggle`.split(` `).concat(gd));function vd(e,t){t=!!(t&4);for(var n=0;n<e.length;n++){var r=e[n],i=r.event;r=r.listeners;a:{var a=void 0;if(t)for(var o=r.length-1;0<=o;o--){var s=r[o],c=s.instance,l=s.currentTarget;if(s=s.listener,c!==a&&i.isPropagationStopped())break a;a=s,i.currentTarget=l;try{a(i)}catch(e){Yr(e)}i.currentTarget=null,a=c}else for(o=0;o<r.length;o++){if(s=r[o],c=s.instance,l=s.currentTarget,s=s.listener,c!==a&&i.isPropagationStopped())break a;a=s,i.currentTarget=l;try{a(i)}catch(e){Yr(e)}i.currentTarget=null,a=c}}}}function $(e,t){var n=t[lt];n===void 0&&(n=t[lt]=new Set);var r=e+`__bubble`;n.has(r)||(Sd(t,e,2,!1),n.add(r))}function yd(e,t,n){var r=0;t&&(r|=4),Sd(n,e,r,t)}var bd=`_reactListening`+Math.random().toString(36).slice(2);function xd(e){if(!e[bd]){e[bd]=!0,bt.forEach(function(t){t!==`selectionchange`&&(_d.has(t)||yd(t,!1,e),yd(t,!0,e))});var t=e.nodeType===9?e:e.ownerDocument;t===null||t[bd]||(t[bd]=!0,yd(`selectionchange`,!1,t))}}function Sd(e,t,n,r){switch(mp(t)){case 2:var i=cp;break;case 8:i=lp;break;default:i=up}n=i.bind(null,t,n,e),i=void 0,!un||t!==`touchstart`&&t!==`touchmove`&&t!==`wheel`||(i=!0),r?i===void 0?e.addEventListener(t,n,!0):e.addEventListener(t,n,{capture:!0,passive:i}):i===void 0?e.addEventListener(t,n,!1):e.addEventListener(t,n,{passive:i})}function Cd(e,t,n,r,i){var a=r;if(!(t&1)&&!(t&2)&&r!==null)a:for(;;){if(r===null)return;var s=r.tag;if(s===3||s===4){var c=r.stateNode.containerInfo;if(c===i)break;if(s===4)for(s=r.return;s!==null;){var l=s.tag;if((l===3||l===4)&&s.stateNode.containerInfo===i)return;s=s.return}for(;c!==null;){if(s=ht(c),s===null)return;if(l=s.tag,l===5||l===6||l===26||l===27){r=a=s;continue a}c=c.parentNode}}r=r.return}sn(function(){var r=a,i=tn(n),s=[];a:{var c=Kr.get(e);if(c!==void 0){var l=bn,u=e;switch(e){case`keypress`:if(hn(n)===0)break a;case`keydown`:case`keyup`:l=Rn;break;case`focusin`:u=`focus`,l=kn;break;case`focusout`:u=`blur`,l=kn;break;case`beforeblur`:case`afterblur`:l=kn;break;case`click`:if(n.button===2)break a;case`auxclick`:case`dblclick`:case`mousedown`:case`mousemove`:case`mouseup`:case`mouseout`:case`mouseover`:case`contextmenu`:l=Dn;break;case`drag`:case`dragend`:case`dragenter`:case`dragexit`:case`dragleave`:case`dragover`:case`dragstart`:case`drop`:l=On;break;case`touchcancel`:case`touchend`:case`touchmove`:case`touchstart`:l=Bn;break;case zr:case Br:case Vr:l=An;break;case Gr:l=Vn;break;case`scroll`:case`scrollend`:l=Sn;break;case`wheel`:l=Hn;break;case`copy`:case`cut`:case`paste`:l=jn;break;case`gotpointercapture`:case`lostpointercapture`:case`pointercancel`:case`pointerdown`:case`pointermove`:case`pointerout`:case`pointerover`:case`pointerup`:l=zn;break;case`toggle`:case`beforetoggle`:l=Un}var d=!!(t&4),f=!d&&(e===`scroll`||e===`scrollend`),p=d?c===null?null:c+`Capture`:c;d=[];for(var m=r,h;m!==null;){var g=m;if(h=g.stateNode,g=g.tag,g!==5&&g!==26&&g!==27||h===null||p===null||(g=cn(m,p),g!=null&&d.push(wd(m,g,h))),f)break;m=m.return}0<d.length&&(c=new l(c,u,null,n,i),s.push({event:c,listeners:d}))}}if(!(t&7)){a:{if(c=e===`mouseover`||e===`pointerover`,l=e===`mouseout`||e===`pointerout`,c&&n!==en&&(u=n.relatedTarget||n.fromElement)&&(ht(u)||u[ct]))break a;if((l||c)&&(c=i.window===i?i:(c=i.ownerDocument)?c.defaultView||c.parentWindow:window,l?(u=n.relatedTarget||n.toElement,l=r,u=u?ht(u):null,u!==null&&(f=o(u),d=u.tag,u!==f||d!==5&&d!==27&&d!==6)&&(u=null)):(l=null,u=r),l!==u)){if(d=Dn,g=`onMouseLeave`,p=`onMouseEnter`,m=`mouse`,(e===`pointerout`||e===`pointerover`)&&(d=zn,g=`onPointerLeave`,p=`onPointerEnter`,m=`pointer`),f=l==null?c:_t(l),h=u==null?c:_t(u),c=new d(g,m+`leave`,l,n,i),c.target=f,c.relatedTarget=h,g=null,ht(i)===r&&(d=new d(p,m+`enter`,u,n,i),d.target=h,d.relatedTarget=f,g=d),f=g,l&&u)b:{for(d=Ed,p=l,m=u,h=0,g=p;g;g=d(g))h++;g=0;for(var _=m;_;_=d(_))g++;for(;0<h-g;)p=d(p),h--;for(;0<g-h;)m=d(m),g--;for(;h--;){if(p===m||m!==null&&p===m.alternate){d=p;break b}p=d(p),m=d(m)}d=null}else d=null;l!==null&&Dd(s,c,l,d,!1),u!==null&&f!==null&&Dd(s,f,u,d,!0)}}a:{if(c=r?_t(r):window,l=c.nodeName&&c.nodeName.toLowerCase(),l===`select`||l===`input`&&c.type===`file`)var v=lr;else if(rr(c)){if(ur)v=yr;else{v=_r;var y=gr}}else l=c.nodeName,!l||l.toLowerCase()!==`input`||c.type!==`checkbox`&&c.type!==`radio`?r&&Yt(r.elementType)&&(v=lr):v=vr;if(v&&(v=v(e,r))){ir(s,v,n,i);break a}y&&y(e,c,r),e===`focusout`&&r&&c.type===`number`&&r.memoizedProps.value!=null&&Vt(c,`number`,c.value)}switch(y=r?_t(r):window,e){case`focusin`:(rr(y)||y.contentEditable===`true`)&&(kr=y,Ar=r,jr=null);break;case`focusout`:jr=Ar=kr=null;break;case`mousedown`:Mr=!0;break;case`contextmenu`:case`mouseup`:case`dragend`:Mr=!1,Nr(s,n,i);break;case`selectionchange`:if(Or)break;case`keydown`:case`keyup`:Nr(s,n,i)}var b;if(Gn)b:{switch(e){case`compositionstart`:var x=`onCompositionStart`;break b;case`compositionend`:x=`onCompositionEnd`;break b;case`compositionupdate`:x=`onCompositionUpdate`;break b}x=void 0}else $n?Zn(e,n)&&(x=`onCompositionEnd`):e===`keydown`&&n.keyCode===229&&(x=`onCompositionStart`);x&&(Jn&&n.locale!==`ko`&&($n||x!==`onCompositionStart`?x===`onCompositionEnd`&&$n&&(b=mn()):(fn=i,pn=`value`in fn?fn.value:fn.textContent,$n=!0)),y=Td(r,x),0<y.length&&(x=new Mn(x,e,null,n,i),s.push({event:x,listeners:y}),b?x.data=b:(b=Qn(n),b!==null&&(x.data=b)))),(b=qn?er(e,n):tr(e,n))&&(x=Td(r,`onBeforeInput`),0<x.length&&(y=new Mn(`onBeforeInput`,`beforeinput`,null,n,i),s.push({event:y,listeners:x}),y.data=b)),pd(s,e,r,n,i)}vd(s,t)})}function wd(e,t,n){return{instance:e,listener:t,currentTarget:n}}function Td(e,t){for(var n=t+`Capture`,r=[];e!==null;){var i=e,a=i.stateNode;if(i=i.tag,i!==5&&i!==26&&i!==27||a===null||(i=cn(e,n),i!=null&&r.unshift(wd(e,i,a)),i=cn(e,t),i!=null&&r.push(wd(e,i,a))),e.tag===3)return r;e=e.return}return[]}function Ed(e){if(e===null)return null;do e=e.return;while(e&&e.tag!==5&&e.tag!==27);return e||null}function Dd(e,t,n,r,i){for(var a=t._reactName,o=[];n!==null&&n!==r;){var s=n,c=s.alternate,l=s.stateNode;if(s=s.tag,c!==null&&c===r)break;s!==5&&s!==26&&s!==27||l===null||(c=l,i?(l=cn(n,a),l!=null&&o.unshift(wd(n,l,c))):i||(l=cn(n,a),l!=null&&o.push(wd(n,l,c)))),n=n.return}o.length!==0&&e.push({event:t,listeners:o})}var Od=/\r\n?/g,kd=/\u0000|\uFFFD/g;function Ad(e){return(typeof e==`string`?e:``+e).replace(Od,`
`).replace(kd,``)}function jd(e,t){return t=Ad(t),Ad(e)===t}function Md(e,t,n,r,a,o){switch(n){case`children`:typeof r==`string`?t===`body`||t===`textarea`&&r===``||Gt(e,r):(typeof r==`number`||typeof r==`bigint`)&&t!==`body`&&Gt(e,``+r);break;case`className`:kt(e,`class`,r);break;case`tabIndex`:kt(e,`tabindex`,r);break;case`dir`:case`role`:case`viewBox`:case`width`:case`height`:kt(e,n,r);break;case`style`:Jt(e,r,o);break;case`data`:if(t!==`object`){kt(e,`data`,r);break}case`src`:case`href`:if(r===``&&(t!==`a`||n!==`href`)||r==null||typeof r==`function`||typeof r==`symbol`||typeof r==`boolean`){e.removeAttribute(n);break}r=Qt(``+r),e.setAttribute(n,r);break;case`action`:case`formAction`:if(typeof r==`function`){e.setAttribute(n,`javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')`);break}if(typeof o==`function`&&(n===`formAction`?(t!==`input`&&Md(e,t,`name`,a.name,a,null),Md(e,t,`formEncType`,a.formEncType,a,null),Md(e,t,`formMethod`,a.formMethod,a,null),Md(e,t,`formTarget`,a.formTarget,a,null)):(Md(e,t,`encType`,a.encType,a,null),Md(e,t,`method`,a.method,a,null),Md(e,t,`target`,a.target,a,null))),r==null||typeof r==`symbol`||typeof r==`boolean`){e.removeAttribute(n);break}r=Qt(``+r),e.setAttribute(n,r);break;case`onClick`:r!=null&&(e.onclick=$t);break;case`onScroll`:r!=null&&$(`scroll`,e);break;case`onScrollEnd`:r!=null&&$(`scrollend`,e);break;case`dangerouslySetInnerHTML`:if(r!=null){if(typeof r!=`object`||!(`__html`in r))throw Error(i(61));if(n=r.__html,n!=null){if(a.children!=null)throw Error(i(60));e.innerHTML=n}}break;case`multiple`:e.multiple=r&&typeof r!=`function`&&typeof r!=`symbol`;break;case`muted`:e.muted=r&&typeof r!=`function`&&typeof r!=`symbol`;break;case`suppressContentEditableWarning`:case`suppressHydrationWarning`:case`defaultValue`:case`defaultChecked`:case`innerHTML`:case`ref`:break;case`autoFocus`:break;case`xlinkHref`:if(r==null||typeof r==`function`||typeof r==`boolean`||typeof r==`symbol`){e.removeAttribute(`xlink:href`);break}n=Qt(``+r),e.setAttributeNS(`http://www.w3.org/1999/xlink`,`xlink:href`,n);break;case`contentEditable`:case`spellCheck`:case`draggable`:case`value`:case`autoReverse`:case`externalResourcesRequired`:case`focusable`:case`preserveAlpha`:r!=null&&typeof r!=`function`&&typeof r!=`symbol`?e.setAttribute(n,``+r):e.removeAttribute(n);break;case`inert`:case`allowFullScreen`:case`async`:case`autoPlay`:case`controls`:case`default`:case`defer`:case`disabled`:case`disablePictureInPicture`:case`disableRemotePlayback`:case`formNoValidate`:case`hidden`:case`loop`:case`noModule`:case`noValidate`:case`open`:case`playsInline`:case`readOnly`:case`required`:case`reversed`:case`scoped`:case`seamless`:case`itemScope`:r&&typeof r!=`function`&&typeof r!=`symbol`?e.setAttribute(n,``):e.removeAttribute(n);break;case`capture`:case`download`:!0===r?e.setAttribute(n,``):!1!==r&&r!=null&&typeof r!=`function`&&typeof r!=`symbol`?e.setAttribute(n,r):e.removeAttribute(n);break;case`cols`:case`rows`:case`size`:case`span`:r!=null&&typeof r!=`function`&&typeof r!=`symbol`&&!isNaN(r)&&1<=r?e.setAttribute(n,r):e.removeAttribute(n);break;case`rowSpan`:case`start`:r==null||typeof r==`function`||typeof r==`symbol`||isNaN(r)?e.removeAttribute(n):e.setAttribute(n,r);break;case`popover`:$(`beforetoggle`,e),$(`toggle`,e),Ot(e,`popover`,r);break;case`xlinkActuate`:At(e,`http://www.w3.org/1999/xlink`,`xlink:actuate`,r);break;case`xlinkArcrole`:At(e,`http://www.w3.org/1999/xlink`,`xlink:arcrole`,r);break;case`xlinkRole`:At(e,`http://www.w3.org/1999/xlink`,`xlink:role`,r);break;case`xlinkShow`:At(e,`http://www.w3.org/1999/xlink`,`xlink:show`,r);break;case`xlinkTitle`:At(e,`http://www.w3.org/1999/xlink`,`xlink:title`,r);break;case`xlinkType`:At(e,`http://www.w3.org/1999/xlink`,`xlink:type`,r);break;case`xmlBase`:At(e,`http://www.w3.org/XML/1998/namespace`,`xml:base`,r);break;case`xmlLang`:At(e,`http://www.w3.org/XML/1998/namespace`,`xml:lang`,r);break;case`xmlSpace`:At(e,`http://www.w3.org/XML/1998/namespace`,`xml:space`,r);break;case`is`:Ot(e,`is`,r);break;case`innerText`:case`textContent`:break;default:(!(2<n.length)||n[0]!==`o`&&n[0]!==`O`||n[1]!==`n`&&n[1]!==`N`)&&(n=Xt.get(n)||n,Ot(e,n,r))}}function Nd(e,t,n,r,a,o){switch(n){case`style`:Jt(e,r,o);break;case`dangerouslySetInnerHTML`:if(r!=null){if(typeof r!=`object`||!(`__html`in r))throw Error(i(61));if(n=r.__html,n!=null){if(a.children!=null)throw Error(i(60));e.innerHTML=n}}break;case`children`:typeof r==`string`?Gt(e,r):(typeof r==`number`||typeof r==`bigint`)&&Gt(e,``+r);break;case`onScroll`:r!=null&&$(`scroll`,e);break;case`onScrollEnd`:r!=null&&$(`scrollend`,e);break;case`onClick`:r!=null&&(e.onclick=$t);break;case`suppressContentEditableWarning`:case`suppressHydrationWarning`:case`innerHTML`:case`ref`:break;case`innerText`:case`textContent`:break;default:if(!xt.hasOwnProperty(n))a:{if(n[0]===`o`&&n[1]===`n`&&(a=n.endsWith(`Capture`),t=n.slice(2,a?n.length-7:void 0),o=e[st]||null,o=o==null?null:o[n],typeof o==`function`&&e.removeEventListener(t,o,a),typeof r==`function`)){typeof o!=`function`&&o!==null&&(n in e?e[n]=null:e.hasAttribute(n)&&e.removeAttribute(n)),e.addEventListener(t,r,a);break a}n in e?e[n]=r:!0===r?e.setAttribute(n,``):Ot(e,n,r)}}}function Pd(e,t,n){switch(t){case`div`:case`span`:case`svg`:case`path`:case`a`:case`g`:case`p`:case`li`:break;case`img`:$(`error`,e),$(`load`,e);var r=!1,a=!1,o;for(o in n)if(n.hasOwnProperty(o)){var s=n[o];if(s!=null)switch(o){case`src`:r=!0;break;case`srcSet`:a=!0;break;case`children`:case`dangerouslySetInnerHTML`:throw Error(i(137,t));default:Md(e,t,o,s,n,null)}}a&&Md(e,t,`srcSet`,n.srcSet,n,null),r&&Md(e,t,`src`,n.src,n,null);return;case`input`:$(`invalid`,e);var c=o=s=a=null,l=null,u=null;for(r in n)if(n.hasOwnProperty(r)){var d=n[r];if(d!=null)switch(r){case`name`:a=d;break;case`type`:s=d;break;case`checked`:l=d;break;case`defaultChecked`:u=d;break;case`value`:o=d;break;case`defaultValue`:c=d;break;case`children`:case`dangerouslySetInnerHTML`:if(d!=null)throw Error(i(137,t));break;default:Md(e,t,r,d,n,null)}}Bt(e,o,c,l,u,s,a,!1);return;case`select`:for(a in $(`invalid`,e),r=s=o=null,n)if(n.hasOwnProperty(a)&&(c=n[a],c!=null))switch(a){case`value`:o=c;break;case`defaultValue`:s=c;break;case`multiple`:r=c;default:Md(e,t,a,c,n,null)}t=o,n=s,e.multiple=!!r,t==null?n!=null&&Ht(e,!!r,n,!0):Ht(e,!!r,t,!1);return;case`textarea`:for(s in $(`invalid`,e),o=a=r=null,n)if(n.hasOwnProperty(s)&&(c=n[s],c!=null))switch(s){case`value`:r=c;break;case`defaultValue`:a=c;break;case`children`:o=c;break;case`dangerouslySetInnerHTML`:if(c!=null)throw Error(i(91));break;default:Md(e,t,s,c,n,null)}Wt(e,r,a,o);return;case`option`:for(l in n)if(n.hasOwnProperty(l)&&(r=n[l],r!=null))switch(l){case`selected`:e.selected=r&&typeof r!=`function`&&typeof r!=`symbol`;break;default:Md(e,t,l,r,n,null)}return;case`dialog`:$(`beforetoggle`,e),$(`toggle`,e),$(`cancel`,e),$(`close`,e);break;case`iframe`:case`object`:$(`load`,e);break;case`video`:case`audio`:for(r=0;r<gd.length;r++)$(gd[r],e);break;case`image`:$(`error`,e),$(`load`,e);break;case`details`:$(`toggle`,e);break;case`embed`:case`source`:case`link`:$(`error`,e),$(`load`,e);case`area`:case`base`:case`br`:case`col`:case`hr`:case`keygen`:case`meta`:case`param`:case`track`:case`wbr`:case`menuitem`:for(u in n)if(n.hasOwnProperty(u)&&(r=n[u],r!=null))switch(u){case`children`:case`dangerouslySetInnerHTML`:throw Error(i(137,t));default:Md(e,t,u,r,n,null)}return;default:if(Yt(t)){for(d in n)n.hasOwnProperty(d)&&(r=n[d],r!==void 0&&Nd(e,t,d,r,n,void 0));return}}for(c in n)n.hasOwnProperty(c)&&(r=n[c],r!=null&&Md(e,t,c,r,n,null))}function Fd(e,t,n,r){switch(t){case`div`:case`span`:case`svg`:case`path`:case`a`:case`g`:case`p`:case`li`:break;case`input`:var a=null,o=null,s=null,c=null,l=null,u=null,d=null;for(m in n){var f=n[m];if(n.hasOwnProperty(m)&&f!=null)switch(m){case`checked`:break;case`value`:break;case`defaultValue`:l=f;default:r.hasOwnProperty(m)||Md(e,t,m,null,r,f)}}for(var p in r){var m=r[p];if(f=n[p],r.hasOwnProperty(p)&&(m!=null||f!=null))switch(p){case`type`:o=m;break;case`name`:a=m;break;case`checked`:u=m;break;case`defaultChecked`:d=m;break;case`value`:s=m;break;case`defaultValue`:c=m;break;case`children`:case`dangerouslySetInnerHTML`:if(m!=null)throw Error(i(137,t));break;default:m!==f&&Md(e,t,p,m,r,f)}}zt(e,s,c,l,u,d,o,a);return;case`select`:for(o in m=s=c=p=null,n)if(l=n[o],n.hasOwnProperty(o)&&l!=null)switch(o){case`value`:break;case`multiple`:m=l;default:r.hasOwnProperty(o)||Md(e,t,o,null,r,l)}for(a in r)if(o=r[a],l=n[a],r.hasOwnProperty(a)&&(o!=null||l!=null))switch(a){case`value`:p=o;break;case`defaultValue`:c=o;break;case`multiple`:s=o;default:o!==l&&Md(e,t,a,o,r,l)}t=c,n=s,r=m,p==null?!!r!=!!n&&(t==null?Ht(e,!!n,n?[]:``,!1):Ht(e,!!n,t,!0)):Ht(e,!!n,p,!1);return;case`textarea`:for(c in m=p=null,n)if(a=n[c],n.hasOwnProperty(c)&&a!=null&&!r.hasOwnProperty(c))switch(c){case`value`:break;case`children`:break;default:Md(e,t,c,null,r,a)}for(s in r)if(a=r[s],o=n[s],r.hasOwnProperty(s)&&(a!=null||o!=null))switch(s){case`value`:p=a;break;case`defaultValue`:m=a;break;case`children`:break;case`dangerouslySetInnerHTML`:if(a!=null)throw Error(i(91));break;default:a!==o&&Md(e,t,s,a,r,o)}Ut(e,p,m);return;case`option`:for(var h in n)if(p=n[h],n.hasOwnProperty(h)&&p!=null&&!r.hasOwnProperty(h))switch(h){case`selected`:e.selected=!1;break;default:Md(e,t,h,null,r,p)}for(l in r)if(p=r[l],m=n[l],r.hasOwnProperty(l)&&p!==m&&(p!=null||m!=null))switch(l){case`selected`:e.selected=p&&typeof p!=`function`&&typeof p!=`symbol`;break;default:Md(e,t,l,p,r,m)}return;case`img`:case`link`:case`area`:case`base`:case`br`:case`col`:case`embed`:case`hr`:case`keygen`:case`meta`:case`param`:case`source`:case`track`:case`wbr`:case`menuitem`:for(var g in n)p=n[g],n.hasOwnProperty(g)&&p!=null&&!r.hasOwnProperty(g)&&Md(e,t,g,null,r,p);for(u in r)if(p=r[u],m=n[u],r.hasOwnProperty(u)&&p!==m&&(p!=null||m!=null))switch(u){case`children`:case`dangerouslySetInnerHTML`:if(p!=null)throw Error(i(137,t));break;default:Md(e,t,u,p,r,m)}return;default:if(Yt(t)){for(var _ in n)p=n[_],n.hasOwnProperty(_)&&p!==void 0&&!r.hasOwnProperty(_)&&Nd(e,t,_,void 0,r,p);for(d in r)p=r[d],m=n[d],!r.hasOwnProperty(d)||p===m||p===void 0&&m===void 0||Nd(e,t,d,p,r,m);return}}for(var v in n)p=n[v],n.hasOwnProperty(v)&&p!=null&&!r.hasOwnProperty(v)&&Md(e,t,v,null,r,p);for(f in r)p=r[f],m=n[f],!r.hasOwnProperty(f)||p===m||p==null&&m==null||Md(e,t,f,p,r,m)}function Id(e){switch(e){case`css`:case`script`:case`font`:case`img`:case`image`:case`input`:case`link`:return!0;default:return!1}}function Ld(){if(typeof performance.getEntriesByType==`function`){for(var e=0,t=0,n=performance.getEntriesByType(`resource`),r=0;r<n.length;r++){var i=n[r],a=i.transferSize,o=i.initiatorType,s=i.duration;if(a&&s&&Id(o)){for(o=0,s=i.responseEnd,r+=1;r<n.length;r++){var c=n[r],l=c.startTime;if(l>s)break;var u=c.transferSize,d=c.initiatorType;u&&Id(d)&&(c=c.responseEnd,o+=u*(c<s?1:(s-l)/(c-l)))}if(--r,t+=8*(a+o)/(i.duration/1e3),e++,10<e)break}}if(0<e)return t/e/1e6}return navigator.connection&&(e=navigator.connection.downlink,typeof e==`number`)?e:5}var Rd=null,zd=null;function Bd(e){return e.nodeType===9?e:e.ownerDocument}function Vd(e){switch(e){case`http://www.w3.org/2000/svg`:return 1;case`http://www.w3.org/1998/Math/MathML`:return 2;default:return 0}}function Hd(e,t){if(e===0)switch(t){case`svg`:return 1;case`math`:return 2;default:return 0}return e===1&&t===`foreignObject`?0:e}function Ud(e,t){return e===`textarea`||e===`noscript`||typeof t.children==`string`||typeof t.children==`number`||typeof t.children==`bigint`||typeof t.dangerouslySetInnerHTML==`object`&&t.dangerouslySetInnerHTML!==null&&t.dangerouslySetInnerHTML.__html!=null}var Wd=null;function Gd(){var e=window.event;return e&&e.type===`popstate`?e!==Wd&&(Wd=e,!0):(Wd=null,!1)}var Kd=typeof setTimeout==`function`?setTimeout:void 0,qd=typeof clearTimeout==`function`?clearTimeout:void 0,Jd=typeof Promise==`function`?Promise:void 0,Yd=typeof queueMicrotask==`function`?queueMicrotask:Jd===void 0?Kd:function(e){return Jd.resolve(null).then(e).catch(Xd)};function Xd(e){setTimeout(function(){throw e})}function Zd(e){return e===`head`}function Qd(e,t){var n=t,r=0;do{var i=n.nextSibling;if(e.removeChild(n),i&&i.nodeType===8){if(n=i.data,n===`/$`||n===`/&`){if(r===0){e.removeChild(i),Np(t);return}r--}else if(n===`$`||n===`$?`||n===`$~`||n===`$!`||n===`&`)r++;else if(n===`html`)pf(e.ownerDocument.documentElement);else if(n===`head`){n=e.ownerDocument.head,pf(n);for(var a=n.firstChild;a;){var o=a.nextSibling,s=a.nodeName;a[pt]||s===`SCRIPT`||s===`STYLE`||s===`LINK`&&a.rel.toLowerCase()===`stylesheet`||n.removeChild(a),a=o}}else n===`body`&&pf(e.ownerDocument.body)}n=i}while(n);Np(t)}function $d(e,t){var n=e;e=0;do{var r=n.nextSibling;if(n.nodeType===1?t?(n._stashedDisplay=n.style.display,n.style.display=`none`):(n.style.display=n._stashedDisplay||``,n.getAttribute(`style`)===``&&n.removeAttribute(`style`)):n.nodeType===3&&(t?(n._stashedText=n.nodeValue,n.nodeValue=``):n.nodeValue=n._stashedText||``),r&&r.nodeType===8){if(n=r.data,n===`/$`){if(e===0)break;e--}else n!==`$`&&n!==`$?`&&n!==`$~`&&n!==`$!`||e++}n=r}while(n)}function ef(e){var t=e.firstChild;for(t&&t.nodeType===10&&(t=t.nextSibling);t;){var n=t;switch(t=t.nextSibling,n.nodeName){case`HTML`:case`HEAD`:case`BODY`:ef(n),mt(n);continue;case`SCRIPT`:case`STYLE`:continue;case`LINK`:if(n.rel.toLowerCase()===`stylesheet`)continue}e.removeChild(n)}}function tf(e,t,n,r){for(;e.nodeType===1;){var i=n;if(e.nodeName.toLowerCase()!==t.toLowerCase()){if(!r&&(e.nodeName!==`INPUT`||e.type!==`hidden`))break}else if(!r){if(t===`input`&&e.type===`hidden`){var a=i.name==null?null:``+i.name;if(i.type===`hidden`&&e.getAttribute(`name`)===a)return e}else return e}else if(!e[pt])switch(t){case`meta`:if(!e.hasAttribute(`itemprop`))break;return e;case`link`:if(a=e.getAttribute(`rel`),a===`stylesheet`&&e.hasAttribute(`data-precedence`)||a!==i.rel||e.getAttribute(`href`)!==(i.href==null||i.href===``?null:i.href)||e.getAttribute(`crossorigin`)!==(i.crossOrigin==null?null:i.crossOrigin)||e.getAttribute(`title`)!==(i.title==null?null:i.title))break;return e;case`style`:if(e.hasAttribute(`data-precedence`))break;return e;case`script`:if(a=e.getAttribute(`src`),(a!==(i.src==null?null:i.src)||e.getAttribute(`type`)!==(i.type==null?null:i.type)||e.getAttribute(`crossorigin`)!==(i.crossOrigin==null?null:i.crossOrigin))&&a&&e.hasAttribute(`async`)&&!e.hasAttribute(`itemprop`))break;return e;default:return e}if(e=cf(e.nextSibling),e===null)break}return null}function nf(e,t,n){if(t===``)return null;for(;e.nodeType!==3;)if((e.nodeType!==1||e.nodeName!==`INPUT`||e.type!==`hidden`)&&!n||(e=cf(e.nextSibling),e===null))return null;return e}function rf(e,t){for(;e.nodeType!==8;)if((e.nodeType!==1||e.nodeName!==`INPUT`||e.type!==`hidden`)&&!t||(e=cf(e.nextSibling),e===null))return null;return e}function af(e){return e.data===`$?`||e.data===`$~`}function of(e){return e.data===`$!`||e.data===`$?`&&e.ownerDocument.readyState!==`loading`}function sf(e,t){var n=e.ownerDocument;if(e.data===`$~`)e._reactRetry=t;else if(e.data!==`$?`||n.readyState!==`loading`)t();else{var r=function(){t(),n.removeEventListener(`DOMContentLoaded`,r)};n.addEventListener(`DOMContentLoaded`,r),e._reactRetry=r}}function cf(e){for(;e!=null;e=e.nextSibling){var t=e.nodeType;if(t===1||t===3)break;if(t===8){if(t=e.data,t===`$`||t===`$!`||t===`$?`||t===`$~`||t===`&`||t===`F!`||t===`F`)break;if(t===`/$`||t===`/&`)return null}}return e}var lf=null;function uf(e){e=e.nextSibling;for(var t=0;e;){if(e.nodeType===8){var n=e.data;if(n===`/$`||n===`/&`){if(t===0)return cf(e.nextSibling);t--}else n!==`$`&&n!==`$!`&&n!==`$?`&&n!==`$~`&&n!==`&`||t++}e=e.nextSibling}return null}function df(e){e=e.previousSibling;for(var t=0;e;){if(e.nodeType===8){var n=e.data;if(n===`$`||n===`$!`||n===`$?`||n===`$~`||n===`&`){if(t===0)return e;t--}else n!==`/$`&&n!==`/&`||t++}e=e.previousSibling}return null}function ff(e,t,n){switch(t=Bd(n),e){case`html`:if(e=t.documentElement,!e)throw Error(i(452));return e;case`head`:if(e=t.head,!e)throw Error(i(453));return e;case`body`:if(e=t.body,!e)throw Error(i(454));return e;default:throw Error(i(451))}}function pf(e){for(var t=e.attributes;t.length;)e.removeAttributeNode(t[0]);mt(e)}var mf=new Map,hf=new Set;function gf(e){return typeof e.getRootNode==`function`?e.getRootNode():e.nodeType===9?e:e.ownerDocument}var _f=M.d;M.d={f:vf,r:yf,D:Sf,C:Cf,L:wf,m:Tf,X:Df,S:Ef,M:Of};function vf(){var e=_f.f(),t=yu();return e||t}function yf(e){var t=gt(e);t!==null&&t.tag===5&&t.type===`form`?Cs(t):_f.r(e)}var bf=typeof document>`u`?null:document;function xf(e,t,n){var r=bf;if(r&&typeof t==`string`&&t){var i=Rt(t);i=`link[rel="`+e+`"][href="`+i+`"]`,typeof n==`string`&&(i+=`[crossorigin="`+n+`"]`),hf.has(i)||(hf.add(i),e={rel:e,crossOrigin:n,href:t},r.querySelector(i)===null&&(t=r.createElement(`link`),Pd(t,`link`,e),yt(t),r.head.appendChild(t)))}}function Sf(e){_f.D(e),xf(`dns-prefetch`,e,null)}function Cf(e,t){_f.C(e,t),xf(`preconnect`,e,t)}function wf(e,t,n){_f.L(e,t,n);var r=bf;if(r&&e&&t){var i=`link[rel="preload"][as="`+Rt(t)+`"]`;t===`image`&&n&&n.imageSrcSet?(i+=`[imagesrcset="`+Rt(n.imageSrcSet)+`"]`,typeof n.imageSizes==`string`&&(i+=`[imagesizes="`+Rt(n.imageSizes)+`"]`)):i+=`[href="`+Rt(e)+`"]`;var a=i;switch(t){case`style`:a=Af(e);break;case`script`:a=Pf(e)}mf.has(a)||(e=p({rel:`preload`,href:t===`image`&&n&&n.imageSrcSet?void 0:e,as:t},n),mf.set(a,e),r.querySelector(i)!==null||t===`style`&&r.querySelector(jf(a))||t===`script`&&r.querySelector(Ff(a))||(t=r.createElement(`link`),Pd(t,`link`,e),yt(t),r.head.appendChild(t)))}}function Tf(e,t){_f.m(e,t);var n=bf;if(n&&e){var r=t&&typeof t.as==`string`?t.as:`script`,i=`link[rel="modulepreload"][as="`+Rt(r)+`"][href="`+Rt(e)+`"]`,a=i;switch(r){case`audioworklet`:case`paintworklet`:case`serviceworker`:case`sharedworker`:case`worker`:case`script`:a=Pf(e)}if(!mf.has(a)&&(e=p({rel:`modulepreload`,href:e},t),mf.set(a,e),n.querySelector(i)===null)){switch(r){case`audioworklet`:case`paintworklet`:case`serviceworker`:case`sharedworker`:case`worker`:case`script`:if(n.querySelector(Ff(a)))return}r=n.createElement(`link`),Pd(r,`link`,e),yt(r),n.head.appendChild(r)}}}function Ef(e,t,n){_f.S(e,t,n);var r=bf;if(r&&e){var i=vt(r).hoistableStyles,a=Af(e);t=t||`default`;var o=i.get(a);if(!o){var s={loading:0,preload:null};if(o=r.querySelector(jf(a)))s.loading=5;else{e=p({rel:`stylesheet`,href:e,"data-precedence":t},n),(n=mf.get(a))&&Rf(e,n);var c=o=r.createElement(`link`);yt(c),Pd(c,`link`,e),c._p=new Promise(function(e,t){c.onload=e,c.onerror=t}),c.addEventListener(`load`,function(){s.loading|=1}),c.addEventListener(`error`,function(){s.loading|=2}),s.loading|=4,Lf(o,t,r)}o={type:`stylesheet`,instance:o,count:1,state:s},i.set(a,o)}}}function Df(e,t){_f.X(e,t);var n=bf;if(n&&e){var r=vt(n).hoistableScripts,i=Pf(e),a=r.get(i);a||(a=n.querySelector(Ff(i)),a||(e=p({src:e,async:!0},t),(t=mf.get(i))&&zf(e,t),a=n.createElement(`script`),yt(a),Pd(a,`link`,e),n.head.appendChild(a)),a={type:`script`,instance:a,count:1,state:null},r.set(i,a))}}function Of(e,t){_f.M(e,t);var n=bf;if(n&&e){var r=vt(n).hoistableScripts,i=Pf(e),a=r.get(i);a||(a=n.querySelector(Ff(i)),a||(e=p({src:e,async:!0,type:`module`},t),(t=mf.get(i))&&zf(e,t),a=n.createElement(`script`),yt(a),Pd(a,`link`,e),n.head.appendChild(a)),a={type:`script`,instance:a,count:1,state:null},r.set(i,a))}}function kf(e,t,n,r){var a=(a=ue.current)?gf(a):null;if(!a)throw Error(i(446));switch(e){case`meta`:case`title`:return null;case`style`:return typeof n.precedence==`string`&&typeof n.href==`string`?(t=Af(n.href),n=vt(a).hoistableStyles,r=n.get(t),r||(r={type:`style`,instance:null,count:0,state:null},n.set(t,r)),r):{type:`void`,instance:null,count:0,state:null};case`link`:if(n.rel===`stylesheet`&&typeof n.href==`string`&&typeof n.precedence==`string`){e=Af(n.href);var o=vt(a).hoistableStyles,s=o.get(e);if(s||(a=a.ownerDocument||a,s={type:`stylesheet`,instance:null,count:0,state:{loading:0,preload:null}},o.set(e,s),(o=a.querySelector(jf(e)))&&!o._p&&(s.instance=o,s.state.loading=5),mf.has(e)||(n={rel:`preload`,as:`style`,href:n.href,crossOrigin:n.crossOrigin,integrity:n.integrity,media:n.media,hrefLang:n.hrefLang,referrerPolicy:n.referrerPolicy},mf.set(e,n),o||Nf(a,e,n,s.state))),t&&r===null)throw Error(i(528,``));return s}if(t&&r!==null)throw Error(i(529,``));return null;case`script`:return t=n.async,n=n.src,typeof n==`string`&&t&&typeof t!=`function`&&typeof t!=`symbol`?(t=Pf(n),n=vt(a).hoistableScripts,r=n.get(t),r||(r={type:`script`,instance:null,count:0,state:null},n.set(t,r)),r):{type:`void`,instance:null,count:0,state:null};default:throw Error(i(444,e))}}function Af(e){return`href="`+Rt(e)+`"`}function jf(e){return`link[rel="stylesheet"][`+e+`]`}function Mf(e){return p({},e,{"data-precedence":e.precedence,precedence:null})}function Nf(e,t,n,r){e.querySelector(`link[rel="preload"][as="style"][`+t+`]`)?r.loading=1:(t=e.createElement(`link`),r.preload=t,t.addEventListener(`load`,function(){return r.loading|=1}),t.addEventListener(`error`,function(){return r.loading|=2}),Pd(t,`link`,n),yt(t),e.head.appendChild(t))}function Pf(e){return`[src="`+Rt(e)+`"]`}function Ff(e){return`script[async]`+e}function If(e,t,n){if(t.count++,t.instance===null)switch(t.type){case`style`:var r=e.querySelector(`style[data-href~="`+Rt(n.href)+`"]`);if(r)return t.instance=r,yt(r),r;var a=p({},n,{"data-href":n.href,"data-precedence":n.precedence,href:null,precedence:null});return r=(e.ownerDocument||e).createElement(`style`),yt(r),Pd(r,`style`,a),Lf(r,n.precedence,e),t.instance=r;case`stylesheet`:a=Af(n.href);var o=e.querySelector(jf(a));if(o)return t.state.loading|=4,t.instance=o,yt(o),o;r=Mf(n),(a=mf.get(a))&&Rf(r,a),o=(e.ownerDocument||e).createElement(`link`),yt(o);var s=o;return s._p=new Promise(function(e,t){s.onload=e,s.onerror=t}),Pd(o,`link`,r),t.state.loading|=4,Lf(o,n.precedence,e),t.instance=o;case`script`:return o=Pf(n.src),(a=e.querySelector(Ff(o)))?(t.instance=a,yt(a),a):(r=n,(a=mf.get(o))&&(r=p({},n),zf(r,a)),e=e.ownerDocument||e,a=e.createElement(`script`),yt(a),Pd(a,`link`,r),e.head.appendChild(a),t.instance=a);case`void`:return null;default:throw Error(i(443,t.type))}else t.type===`stylesheet`&&!(t.state.loading&4)&&(r=t.instance,t.state.loading|=4,Lf(r,n.precedence,e));return t.instance}function Lf(e,t,n){for(var r=n.querySelectorAll(`link[rel="stylesheet"][data-precedence],style[data-precedence]`),i=r.length?r[r.length-1]:null,a=i,o=0;o<r.length;o++){var s=r[o];if(s.dataset.precedence===t)a=s;else if(a!==i)break}a?a.parentNode.insertBefore(e,a.nextSibling):(t=n.nodeType===9?n.head:n,t.insertBefore(e,t.firstChild))}function Rf(e,t){e.crossOrigin??(e.crossOrigin=t.crossOrigin),e.referrerPolicy??(e.referrerPolicy=t.referrerPolicy),e.title??(e.title=t.title)}function zf(e,t){e.crossOrigin??(e.crossOrigin=t.crossOrigin),e.referrerPolicy??(e.referrerPolicy=t.referrerPolicy),e.integrity??(e.integrity=t.integrity)}var Bf=null;function Vf(e,t,n){if(Bf===null){var r=new Map,i=Bf=new Map;i.set(n,r)}else i=Bf,r=i.get(n),r||(r=new Map,i.set(n,r));if(r.has(e))return r;for(r.set(e,null),n=n.getElementsByTagName(e),i=0;i<n.length;i++){var a=n[i];if(!(a[pt]||a[ot]||e===`link`&&a.getAttribute(`rel`)===`stylesheet`)&&a.namespaceURI!==`http://www.w3.org/2000/svg`){var o=a.getAttribute(t)||``;o=e+o;var s=r.get(o);s?s.push(a):r.set(o,[a])}}return r}function Hf(e,t,n){e=e.ownerDocument||e,e.head.insertBefore(n,t===`title`?e.querySelector(`head > title`):null)}function Uf(e,t,n){if(n===1||t.itemProp!=null)return!1;switch(e){case`meta`:case`title`:return!0;case`style`:if(typeof t.precedence!=`string`||typeof t.href!=`string`||t.href===``)break;return!0;case`link`:if(typeof t.rel!=`string`||typeof t.href!=`string`||t.href===``||t.onLoad||t.onError)break;switch(t.rel){case`stylesheet`:return e=t.disabled,typeof t.precedence==`string`&&e==null;default:return!0}case`script`:if(t.async&&typeof t.async!=`function`&&typeof t.async!=`symbol`&&!t.onLoad&&!t.onError&&t.src&&typeof t.src==`string`)return!0}return!1}function Wf(e){return!(e.type===`stylesheet`&&!(e.state.loading&3))}function Gf(e,t,n,r){if(n.type===`stylesheet`&&(typeof r.media!=`string`||!1!==matchMedia(r.media).matches)&&!(n.state.loading&4)){if(n.instance===null){var i=Af(r.href),a=t.querySelector(jf(i));if(a){t=a._p,typeof t==`object`&&t&&typeof t.then==`function`&&(e.count++,e=Jf.bind(e),t.then(e,e)),n.state.loading|=4,n.instance=a,yt(a);return}a=t.ownerDocument||t,r=Mf(r),(i=mf.get(i))&&Rf(r,i),a=a.createElement(`link`),yt(a);var o=a;o._p=new Promise(function(e,t){o.onload=e,o.onerror=t}),Pd(a,`link`,r),n.instance=a}e.stylesheets===null&&(e.stylesheets=new Map),e.stylesheets.set(n,t),(t=n.state.preload)&&!(n.state.loading&3)&&(e.count++,n=Jf.bind(e),t.addEventListener(`load`,n),t.addEventListener(`error`,n))}}var Kf=0;function qf(e,t){return e.stylesheets&&e.count===0&&Xf(e,e.stylesheets),0<e.count||0<e.imgCount?function(n){var r=setTimeout(function(){if(e.stylesheets&&Xf(e,e.stylesheets),e.unsuspend){var t=e.unsuspend;e.unsuspend=null,t()}},6e4+t);0<e.imgBytes&&Kf===0&&(Kf=62500*Ld());var i=setTimeout(function(){if(e.waitingForImages=!1,e.count===0&&(e.stylesheets&&Xf(e,e.stylesheets),e.unsuspend)){var t=e.unsuspend;e.unsuspend=null,t()}},(e.imgBytes>Kf?50:800)+t);return e.unsuspend=n,function(){e.unsuspend=null,clearTimeout(r),clearTimeout(i)}}:null}function Jf(){if(this.count--,this.count===0&&(this.imgCount===0||!this.waitingForImages)){if(this.stylesheets)Xf(this,this.stylesheets);else if(this.unsuspend){var e=this.unsuspend;this.unsuspend=null,e()}}}var Yf=null;function Xf(e,t){e.stylesheets=null,e.unsuspend!==null&&(e.count++,Yf=new Map,t.forEach(Zf,e),Yf=null,Jf.call(e))}function Zf(e,t){if(!(t.state.loading&4)){var n=Yf.get(e);if(n)var r=n.get(null);else{n=new Map,Yf.set(e,n);for(var i=e.querySelectorAll(`link[data-precedence],style[data-precedence]`),a=0;a<i.length;a++){var o=i[a];(o.nodeName===`LINK`||o.getAttribute(`media`)!==`not all`)&&(n.set(o.dataset.precedence,o),r=o)}r&&n.set(null,r)}i=t.instance,o=i.getAttribute(`data-precedence`),a=n.get(o)||r,a===r&&n.set(null,i),n.set(o,i),this.count++,r=Jf.bind(this),i.addEventListener(`load`,r),i.addEventListener(`error`,r),a?a.parentNode.insertBefore(i,a.nextSibling):(e=e.nodeType===9?e.head:e,e.insertBefore(i,e.firstChild)),t.state.loading|=4}}var Qf={$$typeof:C,Provider:null,Consumer:null,_currentValue:ae,_currentValue2:ae,_threadCount:0};function $f(e,t,n,r,i,a,o,s,c){this.tag=1,this.containerInfo=e,this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.next=this.pendingContext=this.context=this.cancelPendingCommit=null,this.callbackPriority=0,this.expirationTimes=Ye(-1),this.entangledLanes=this.shellSuspendCounter=this.errorRecoveryDisabledLanes=this.expiredLanes=this.warmLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=Ye(0),this.hiddenUpdates=Ye(null),this.identifierPrefix=r,this.onUncaughtError=i,this.onCaughtError=a,this.onRecoverableError=o,this.pooledCache=null,this.pooledCacheLanes=0,this.formState=c,this.incompleteTransitions=new Map}function ep(e,t,n,r,i,a,o,s,c,l,u,d){return e=new $f(e,t,n,o,c,l,u,d,s),t=1,!0===a&&(t|=24),a=si(3,null,null,t),e.current=a,a.stateNode=e,t=oa(),t.refCount++,e.pooledCache=t,t.refCount++,a.memoizedState={element:r,isDehydrated:n,cache:t},za(a),e}function tp(e){return e?(e=ai,e):ai}function np(e,t,n,r,i,a){i=tp(i),r.context===null?r.context=i:r.pendingContext=i,r=Va(t),r.payload={element:n},a=a===void 0?null:a,a!==null&&(r.callback=a),n=Ha(e,r,t),n!==null&&(mu(n,e,t),Ua(n,e,t))}function rp(e,t){if(e=e.memoizedState,e!==null&&e.dehydrated!==null){var n=e.retryLane;e.retryLane=n!==0&&n<t?n:t}}function ip(e,t){rp(e,t),(e=e.alternate)&&rp(e,t)}function ap(e){if(e.tag===13||e.tag===31){var t=ni(e,67108864);t!==null&&mu(t,e,67108864),ip(e,67108864)}}function op(e){if(e.tag===13||e.tag===31){var t=fu();t=tt(t);var n=ni(e,t);n!==null&&mu(n,e,t),ip(e,t)}}var sp=!0;function cp(e,t,n,r){var i=j.T;j.T=null;var a=M.p;try{M.p=2,up(e,t,n,r)}finally{M.p=a,j.T=i}}function lp(e,t,n,r){var i=j.T;j.T=null;var a=M.p;try{M.p=8,up(e,t,n,r)}finally{M.p=a,j.T=i}}function up(e,t,n,r){if(sp){var i=dp(r);if(i===null)Cd(e,t,r,fp,n),Cp(e,r);else if(Tp(i,e,t,n,r))r.stopPropagation();else if(Cp(e,r),t&4&&-1<Sp.indexOf(e)){for(;i!==null;){var a=gt(i);if(a!==null)switch(a.tag){case 3:if(a=a.stateNode,a.current.memoizedState.isDehydrated){var o=We(a.pendingLanes);if(o!==0){var s=a;for(s.pendingLanes|=2,s.entangledLanes|=2;o;){var c=1<<31-Le(o);s.entanglements[1]|=c,o&=~c}nd(a),!(J&6)&&(eu=Ee()+500,rd(0,!1))}}break;case 31:case 13:s=ni(a,2),s!==null&&mu(s,a,2),yu(),ip(a,2)}if(a=dp(r),a===null&&Cd(e,t,r,fp,n),a===i)break;i=a}i!==null&&r.stopPropagation()}else Cd(e,t,r,null,n)}}function dp(e){return e=tn(e),pp(e)}var fp=null;function pp(e){if(fp=null,e=ht(e),e!==null){var t=o(e);if(t===null)e=null;else{var n=t.tag;if(n===13){if(e=s(t),e!==null)return e;e=null}else if(n===31){if(e=c(t),e!==null)return e;e=null}else if(n===3){if(t.stateNode.current.memoizedState.isDehydrated)return t.tag===3?t.stateNode.containerInfo:null;e=null}else t!==e&&(e=null)}}return fp=e,null}function mp(e){switch(e){case`beforetoggle`:case`cancel`:case`click`:case`close`:case`contextmenu`:case`copy`:case`cut`:case`auxclick`:case`dblclick`:case`dragend`:case`dragstart`:case`drop`:case`focusin`:case`focusout`:case`input`:case`invalid`:case`keydown`:case`keypress`:case`keyup`:case`mousedown`:case`mouseup`:case`paste`:case`pause`:case`play`:case`pointercancel`:case`pointerdown`:case`pointerup`:case`ratechange`:case`reset`:case`resize`:case`seeked`:case`submit`:case`toggle`:case`touchcancel`:case`touchend`:case`touchstart`:case`volumechange`:case`change`:case`selectionchange`:case`textInput`:case`compositionstart`:case`compositionend`:case`compositionupdate`:case`beforeblur`:case`afterblur`:case`beforeinput`:case`blur`:case`fullscreenchange`:case`focus`:case`hashchange`:case`popstate`:case`select`:case`selectstart`:return 2;case`drag`:case`dragenter`:case`dragexit`:case`dragleave`:case`dragover`:case`mousemove`:case`mouseout`:case`mouseover`:case`pointermove`:case`pointerout`:case`pointerover`:case`scroll`:case`touchmove`:case`wheel`:case`mouseenter`:case`mouseleave`:case`pointerenter`:case`pointerleave`:return 8;case`message`:switch(De()){case Oe:return 2;case ke:return 8;case Ae:case je:return 32;case Me:return 268435456;default:return 32}default:return 32}}var hp=!1,gp=null,_p=null,vp=null,yp=new Map,bp=new Map,xp=[],Sp=`mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset`.split(` `);function Cp(e,t){switch(e){case`focusin`:case`focusout`:gp=null;break;case`dragenter`:case`dragleave`:_p=null;break;case`mouseover`:case`mouseout`:vp=null;break;case`pointerover`:case`pointerout`:yp.delete(t.pointerId);break;case`gotpointercapture`:case`lostpointercapture`:bp.delete(t.pointerId)}}function wp(e,t,n,r,i,a){return e===null||e.nativeEvent!==a?(e={blockedOn:t,domEventName:n,eventSystemFlags:r,nativeEvent:a,targetContainers:[i]},t!==null&&(t=gt(t),t!==null&&ap(t)),e):(e.eventSystemFlags|=r,t=e.targetContainers,i!==null&&t.indexOf(i)===-1&&t.push(i),e)}function Tp(e,t,n,r,i){switch(t){case`focusin`:return gp=wp(gp,e,t,n,r,i),!0;case`dragenter`:return _p=wp(_p,e,t,n,r,i),!0;case`mouseover`:return vp=wp(vp,e,t,n,r,i),!0;case`pointerover`:var a=i.pointerId;return yp.set(a,wp(yp.get(a)||null,e,t,n,r,i)),!0;case`gotpointercapture`:return a=i.pointerId,bp.set(a,wp(bp.get(a)||null,e,t,n,r,i)),!0}return!1}function Ep(e){var t=ht(e.target);if(t!==null){var n=o(t);if(n!==null){if(t=n.tag,t===13){if(t=s(n),t!==null){e.blockedOn=t,it(e.priority,function(){op(n)});return}}else if(t===31){if(t=c(n),t!==null){e.blockedOn=t,it(e.priority,function(){op(n)});return}}else if(t===3&&n.stateNode.current.memoizedState.isDehydrated){e.blockedOn=n.tag===3?n.stateNode.containerInfo:null;return}}}e.blockedOn=null}function Dp(e){if(e.blockedOn!==null)return!1;for(var t=e.targetContainers;0<t.length;){var n=dp(e.nativeEvent);if(n===null){n=e.nativeEvent;var r=new n.constructor(n.type,n);en=r,n.target.dispatchEvent(r),en=null}else return t=gt(n),t!==null&&ap(t),e.blockedOn=n,!1;t.shift()}return!0}function Op(e,t,n){Dp(e)&&n.delete(t)}function kp(){hp=!1,gp!==null&&Dp(gp)&&(gp=null),_p!==null&&Dp(_p)&&(_p=null),vp!==null&&Dp(vp)&&(vp=null),yp.forEach(Op),bp.forEach(Op)}function Ap(e,n){e.blockedOn===n&&(e.blockedOn=null,hp||(hp=!0,t.unstable_scheduleCallback(t.unstable_NormalPriority,kp)))}var jp=null;function Mp(e){jp!==e&&(jp=e,t.unstable_scheduleCallback(t.unstable_NormalPriority,function(){jp===e&&(jp=null);for(var t=0;t<e.length;t+=3){var n=e[t],r=e[t+1],i=e[t+2];if(typeof r!=`function`){if(pp(r||n)===null)continue;break}var a=gt(n);a!==null&&(e.splice(t,3),t-=3,xs(a,{pending:!0,data:i,method:n.method,action:r},r,i))}}))}function Np(e){function t(t){return Ap(t,e)}gp!==null&&Ap(gp,e),_p!==null&&Ap(_p,e),vp!==null&&Ap(vp,e),yp.forEach(t),bp.forEach(t);for(var n=0;n<xp.length;n++){var r=xp[n];r.blockedOn===e&&(r.blockedOn=null)}for(;0<xp.length&&(n=xp[0],n.blockedOn===null);)Ep(n),n.blockedOn===null&&xp.shift();if(n=(e.ownerDocument||e).$$reactFormReplay,n!=null)for(r=0;r<n.length;r+=3){var i=n[r],a=n[r+1],o=i[st]||null;if(typeof a==`function`)o||Mp(n);else if(o){var s=null;if(a&&a.hasAttribute(`formAction`)){if(i=a,o=a[st]||null)s=o.formAction;else if(pp(i)!==null)continue}else s=o.action;typeof s==`function`?n[r+1]=s:(n.splice(r,3),r-=3),Mp(n)}}}function Pp(){function e(e){e.canIntercept&&e.info===`react-transition`&&e.intercept({handler:function(){return new Promise(function(e){return i=e})},focusReset:`manual`,scroll:`manual`})}function t(){i!==null&&(i(),i=null),r||setTimeout(n,20)}function n(){if(!r&&!navigation.transition){var e=navigation.currentEntry;e&&e.url!=null&&navigation.navigate(e.url,{state:e.getState(),info:`react-transition`,history:`replace`})}}if(typeof navigation==`object`){var r=!1,i=null;return navigation.addEventListener(`navigate`,e),navigation.addEventListener(`navigatesuccess`,t),navigation.addEventListener(`navigateerror`,t),setTimeout(n,100),function(){r=!0,navigation.removeEventListener(`navigate`,e),navigation.removeEventListener(`navigatesuccess`,t),navigation.removeEventListener(`navigateerror`,t),i!==null&&(i(),i=null)}}}function Fp(e){this._internalRoot=e}Ip.prototype.render=Fp.prototype.render=function(e){var t=this._internalRoot;if(t===null)throw Error(i(409));var n=t.current;np(n,fu(),e,t,null,null)},Ip.prototype.unmount=Fp.prototype.unmount=function(){var e=this._internalRoot;if(e!==null){this._internalRoot=null;var t=e.containerInfo;np(e.current,2,null,e,null,null),yu(),t[ct]=null}};function Ip(e){this._internalRoot=e}Ip.prototype.unstable_scheduleHydration=function(e){if(e){var t=rt();e={blockedOn:null,target:e,priority:t};for(var n=0;n<xp.length&&t!==0&&t<xp[n].priority;n++);xp.splice(n,0,e),n===0&&Ep(e)}};var Lp=n.version;if(Lp!==`19.2.0`)throw Error(i(527,Lp,`19.2.0`));M.findDOMNode=function(e){var t=e._reactInternals;if(t===void 0)throw typeof e.render==`function`?Error(i(188)):(e=Object.keys(e).join(`,`),Error(i(268,e)));return e=u(t),e=e===null?null:d(e),e=e===null?null:e.stateNode,e};var Rp={bundleType:0,version:`19.2.0`,rendererPackageName:`react-dom`,currentDispatcherRef:j,reconcilerVersion:`19.2.0`};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<`u`){var zp=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!zp.isDisabled&&zp.supportsFiber)try{Pe=zp.inject(Rp),Fe=zp}catch{}}e.createRoot=function(e,t){if(!a(e))throw Error(i(299));var n=!1,r=``,o=Ws,s=Gs,c=Ks;return t!=null&&(!0===t.unstable_strictMode&&(n=!0),t.identifierPrefix!==void 0&&(r=t.identifierPrefix),t.onUncaughtError!==void 0&&(o=t.onUncaughtError),t.onCaughtError!==void 0&&(s=t.onCaughtError),t.onRecoverableError!==void 0&&(c=t.onRecoverableError)),t=ep(e,1,!1,null,null,n,r,null,o,s,c,Pp),e[ct]=t.current,xd(e),new Fp(t)}})),v=s(((e,t)=>{function n(){if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<`u`&&typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE==`function`)try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(n)}catch(e){console.error(e)}}n(),t.exports=_()})),y=u(m()),b=v(),x={alpha:[`vanguard`,`howlkeeper`],"ally-02":[`pursuer`,`disruptor`],"ally-03":[`sentinel`,`medic`]},S={alpha:[`alpha-strike`,`alpha-rend`,`alpha-howl`],"ally-02":[`u02-shot`,`u02-burst`,`u02-suppress`],"ally-03":[`u03-tap`,`u03-mend`,`u03-pack`]},C=[{skillId:`alpha-strike`,rank:1,label:`Long Step`,description:`Strike reaches one tile farther.`,rangeDelta:1},{skillId:`alpha-strike`,rank:2,label:`Relentless`,description:`Strike reaches two tiles farther.`,rangeDelta:2},{skillId:`alpha-rend`,rank:1,label:`Deep Cut`,description:`Bleed lasts one additional turn.`,durationDelta:1},{skillId:`alpha-rend`,rank:2,label:`Open Wound`,description:`Bleed lasts two additional turns.`,durationDelta:2},{skillId:`alpha-howl`,rank:1,label:`Pack Echo`,description:`Howl cooldown reduced by one turn.`,cooldownDelta:-1},{skillId:`alpha-howl`,rank:2,label:`Pack Rhythm`,description:`Howl cooldown reduced by two turns.`,cooldownDelta:-2},{skillId:`u02-shot`,rank:1,label:`Long Reach`,description:`Thrust reaches one additional tile.`,rangeDelta:1},{skillId:`u02-shot`,rank:2,label:`Pursuit`,description:`Thrust reaches two additional tiles.`,rangeDelta:2},{skillId:`u02-burst`,rank:1,label:`Rapid Lunge`,description:`Lunge cooldown reduced by one.`,cooldownDelta:-1},{skillId:`u02-burst`,rank:2,label:`Flow State`,description:`Lunge cooldown reduced by two.`,cooldownDelta:-2},{skillId:`u02-suppress`,rank:1,label:`Sustained Pressure`,description:`Pressure control lasts longer.`,durationDelta:1},{skillId:`u02-suppress`,rank:2,label:`Signal Lock`,description:`Pressure control lasts two turns longer.`,durationDelta:2},{skillId:`u03-tap`,rank:1,label:`Extended Reach`,description:`Basic skill reaches one tile farther.`,rangeDelta:1},{skillId:`u03-tap`,rank:2,label:`Relay Reach`,description:`Basic skill reaches two tiles farther.`,rangeDelta:2},{skillId:`u03-mend`,rank:1,label:`Fast Recovery`,description:`Mend cooldown reduced by one.`,cooldownDelta:-1},{skillId:`u03-mend`,rank:2,label:`Field Triage`,description:`Mend cooldown reduced by two.`,cooldownDelta:-2},{skillId:`u03-pack`,rank:1,label:`Long Watch`,description:`Pack support lasts one extra turn.`,durationDelta:1},{skillId:`u03-pack`,rank:2,label:`Hold Together`,description:`Pack support lasts two extra turns.`,durationDelta:2}];function w(e){if(!e||typeof e!=`object`)throw Error(`invalid_growth_snapshot`);let t=e;if(t.version!==1&&t.version!==2||!Number.isSafeInteger(t.revision)||t.revision<0||!Array.isArray(t.heroes)||t.heroes.length!==3)throw Error(`invalid_growth_snapshot`);let n=Object.keys(x);for(let e of n){let n=t.heroes.find(t=>t&&t.heroId===e);if(!n||t.heroes.filter(t=>t&&t.heroId===e).length!==1)throw Error(`invalid_growth_hero`);if(n.discipline!==null&&!x[e].includes(n.discipline))throw Error(`invalid_growth_discipline`);if(!n.ranks||typeof n.ranks!=`object`||Array.isArray(n.ranks))throw Error(`invalid_growth_ranks`);if(Object.keys(n.ranks).length&&n.discipline===null)throw Error(`invalid_growth_discipline`);if(n.respecUsed!==void 0&&typeof n.respecUsed!=`boolean`)throw Error(`invalid_growth_respec`);for(let[t,r]of Object.entries(n.ranks))if(!S[e].includes(t)||!Number.isInteger(r)||r<1||r>2)throw Error(`invalid_growth_rank`)}return t}function T(e){let t=e.split(`:mastery:`)[0];switch(t){case`u02-lunge-vanguard`:return`u02-burst`;case`u02-pressure-disruptor`:return`u02-suppress`;case`u03-mend-restorer`:return`u03-mend`;case`u03-pack-warden`:return`u03-pack`;default:return t}}function E(e,t){let n=T(e.id);if(!t||!S[t.heroId]?.includes(n))return e;let r=t.ranks[n]??0;if(!Number.isInteger(r)||r<0||r>2)return e;let i=r?C.find(e=>e.skillId===n&&e.rank===r):void 0,a=t.rulesVersion===2,o=a&&n===`u03-mend`,s={...e,maxRange:Math.max(e.minRange,e.maxRange+(i?.rangeDelta??0)+(o&&r>0&&e.targetType===`ALLY_SINGLE`?1:0)),cooldownMax:Math.max(+(e.cooldownMax>0),e.cooldownMax+(o?0:i?.cooldownDelta??0)),effects:e.effects.map(e=>e.kind===`status`&&i?.durationDelta?{...e,duration:(e.duration??1)+i.durationDelta}:{...e})};switch(o&&r>0&&e.targetType===`ALLY_AOE`&&(s.radius+=1),o&&r===2&&s.effects.push({kind:`status`,status:`GUARD`,duration:1,value:.2,on:e.targetType===`ALLY_AOE`?`aoe_allies`:`primary`,maxHpRatio:.5}),t.discipline){case`vanguard`:n===`alpha-howl`&&!s.effects.some(e=>e.status===`GUARD`)&&s.effects.push({kind:`status`,status:`GUARD`,duration:1,value:.2,on:`aoe_allies`});break;case`howlkeeper`:e.id===`alpha-howl`&&(s.radius+=1);break;case`pursuer`:n===`u02-shot`&&(s.maxRange+=1);break;case`disruptor`:n===`u02-suppress`&&(s.effects=s.effects.map(e=>e.kind===`status`?{...e,duration:(e.duration??1)+1}:e));break;case`sentinel`:a&&n===`u03-pack`&&s.effects.some(e=>e.status===`GUARD`)&&(s.effects=s.effects.map(e=>e.status===`GUARD`?{...e,duration:(e.duration??1)+1}:e)),n===`u03-pack`&&!s.effects.some(e=>e.status===`GUARD`)&&s.effects.push({kind:`status`,status:`GUARD`,duration:1,value:.2,on:`aoe_allies`});break;case`medic`:n===`u03-mend`&&(s.cooldownMax=Math.max(1,s.cooldownMax-1),a&&e.cooldownMax===1&&e.id.endsWith(`:mastery:SHADOW:3:A`)&&(s.effects=s.effects.map(e=>e.kind===`heal`?{...e,base:(e.base??0)+8}:e)))}return a&&n===`u03-mend`&&(s.desc=`MEND: ${s.targetType===`ALLY_AOE`?`radius ${s.radius}`:`range ${s.maxRange}`}; cooldown ${s.cooldownMax}. ${r?O(n,r,2):`Restore HP to an ally.`}${t.discipline===`medic`&&e.cooldownMax===1?` STEADY HAND: +8 base healing at the cooldown floor.`:``}`),s}function D(e,t){let n=e?.heroes.find(e=>e.heroId===t);return n?{...n,ranks:{...n.ranks},rulesVersion:e.version}:void 0}function O(e,t,n=1){return n===2&&e===`u03-mend`?t===1?`Rescue reach +1 cell (RESTORER: radius +1). Cooldown unchanged.`:`Keeps rescue reach. Allies at 50% HP or less before MEND gain 20% GUARD for 1 personal turn.`:C.find(n=>n.skillId===e&&n.rank===t)?.description||``}var k={"pet-bite":{id:`pet-bite`,name:`BITE`,desc:`Quick melee bite. Range 1.`,slot:`A1`,cooldownMax:0,targetType:`ENEMY_SINGLE`,minRange:1,maxRange:1,radius:0,effects:[{kind:`damage`,multiplier:1,on:`hits`}]},"pet-hamstring":{id:`pet-hamstring`,name:`HAMSTRING`,desc:`Melee bite. Slows enemy initiative by 50% for 2 turns, buying time to reach the relay.`,slot:`A2`,cooldownMax:3,targetType:`ENEMY_SINGLE`,minRange:1,maxRange:1,radius:0,effects:[{kind:`damage`,multiplier:.6,on:`hits`},{kind:`status`,status:`SPD_DOWN`,duration:2,value:.5,on:`hits`}]},"alpha-strike":{id:`alpha-strike`,name:`STRIKE`,desc:`Melee hit. Range 1.`,slot:`A1`,cooldownMax:0,targetType:`ENEMY_SINGLE`,minRange:1,maxRange:1,radius:0,effects:[{kind:`damage`,multiplier:1,on:`hits`}]},"alpha-rend":{id:`alpha-rend`,name:`REND`,desc:`Heavy melee hit. Applies Bleed for 2 turns.`,slot:`A2`,cooldownMax:3,targetType:`ENEMY_SINGLE`,minRange:1,maxRange:1,radius:0,effects:[{kind:`damage`,multiplier:1.45,on:`hits`},{kind:`status`,status:`BLEED`,duration:2,value:8,on:`hits`}]},"alpha-howl":{id:`alpha-howl`,name:`HOWL`,desc:`Squad pressure. Nearby allies gain ATK and SPD for 2 turns.`,slot:`A3`,cooldownMax:4,targetType:`ALLY_AOE`,minRange:0,maxRange:0,radius:2,effects:[{kind:`status`,status:`ATK_UP`,duration:2,value:.3,on:`aoe_allies`},{kind:`status`,status:`SPD_UP`,duration:2,value:.3,on:`aoe_allies`}]},"u02-shot":{id:`u02-shot`,name:`THRUST`,desc:`Polearm reach strike. Range 3.`,slot:`A1`,cooldownMax:0,targetType:`ENEMY_SINGLE`,minRange:1,maxRange:3,radius:0,effects:[{kind:`damage`,multiplier:1,on:`hits`}]},"u02-burst":{id:`u02-burst`,name:`LUNGE`,desc:`Heavy reach hit. Range 3.`,slot:`A2`,cooldownMax:3,targetType:`ENEMY_SINGLE`,minRange:1,maxRange:3,radius:0,effects:[{kind:`damage`,multiplier:1.55,on:`hits`}]},"u02-suppress":{id:`u02-suppress`,name:`PRESSURE`,desc:`Reach control. Lowers enemy ATK for 2 turns.`,slot:`A3`,cooldownMax:3,targetType:`ENEMY_SINGLE`,minRange:1,maxRange:3,radius:0,effects:[{kind:`damage`,multiplier:.7,on:`hits`},{kind:`status`,status:`ATK_DOWN`,duration:2,value:.3,on:`hits`}]},"u02-lunge-vanguard":{id:`u02-lunge-vanguard`,name:`LUNGE`,slot:`A2`,desc:`VANGUARD: commit to range 1. Heavy hit; gain 50% initiative speed for 2 turns.`,cooldownMax:3,targetType:`ENEMY_SINGLE`,minRange:1,maxRange:1,radius:0,effects:[{kind:`damage`,multiplier:1.55,on:`hits`},{kind:`status`,status:`SPD_UP`,duration:2,value:.5,on:`self`}]},"u02-pressure-disruptor":{id:`u02-pressure-disruptor`,name:`PRESSURE`,slot:`A3`,desc:`DISRUPTOR: range 3. No damage; lower enemy ATK by 30% and initiative speed by 40% for 2 turns.`,cooldownMax:3,targetType:`ENEMY_SINGLE`,minRange:1,maxRange:3,radius:0,effects:[{kind:`status`,status:`ATK_DOWN`,duration:2,value:.3,on:`hits`},{kind:`status`,status:`SPD_DOWN`,duration:2,value:.4,on:`hits`}]},"u03-tap":{id:`u03-tap`,name:`SWEEP`,desc:`Staff contact. Range 2.`,slot:`A1`,cooldownMax:0,targetType:`ENEMY_SINGLE`,minRange:1,maxRange:2,radius:0,effects:[{kind:`damage`,multiplier:.75,on:`hits`}]},"u03-mend":{id:`u03-mend`,name:`MEND`,desc:`Restore HP to one ally.`,slot:`A2`,cooldownMax:2,targetType:`ALLY_SINGLE`,minRange:0,maxRange:3,radius:0,effects:[{kind:`heal`,base:32,scale:.4,on:`primary`}]},"u03-pack":{id:`u03-pack`,name:`PACK SUPPORT`,desc:`Group mend. Nearby allies gain DEF for 2 turns.`,slot:`A3`,cooldownMax:4,targetType:`ALLY_AOE`,minRange:0,maxRange:0,radius:2,effects:[{kind:`heal`,base:18,scale:.2,on:`aoe_allies`},{kind:`status`,status:`DEF_UP`,duration:2,value:.4,on:`aoe_allies`}]},"u03-mend-restorer":{id:`u03-mend-restorer`,name:`MEND`,slot:`A2`,desc:`RESTORER: heal SHADOW and allies within 1 cell. Replaces the range-3 single-target heal.`,cooldownMax:2,targetType:`ALLY_AOE`,minRange:0,maxRange:0,radius:1,effects:[{kind:`heal`,base:32,scale:.4,on:`aoe_allies`}]},"u03-pack-warden":{id:`u03-pack-warden`,name:`PACK SUPPORT`,slot:`A3`,desc:`WARDEN: protect SHADOW and allies within 2 cells for 2 turns. Halves incoming damage; no healing or DEF boost.`,cooldownMax:4,targetType:`ALLY_AOE`,minRange:0,maxRange:0,radius:2,effects:[{kind:`status`,status:`GUARD`,duration:2,value:.5,on:`aoe_allies`}]},"hound-fortify":{id:`hound-fortify`,name:`BULWARK GUARD`,desc:`Protect the frontline by reducing incoming damage.`,slot:`A2`,cooldownMax:3,targetType:`SELF`,minRange:0,maxRange:0,radius:0,effects:[{kind:`status`,status:`GUARD`,duration:2,value:.5,on:`self`}]},"hound-pulse":{id:`hound-pulse`,name:`PULSE SHOT`,desc:`Medium-to-long range signal pulse. Weak at close quarters.`,slot:`A1`,cooldownMax:0,targetType:`ENEMY_SINGLE`,minRange:2,maxRange:4,radius:0,effects:[{kind:`damage`,multiplier:.85,on:`hits`}]},"hound-aim":{id:`hound-aim`,name:`TARGET LOCK`,desc:`Precise ranged attack which marks a vulnerable target.`,slot:`A2`,cooldownMax:3,targetType:`ENEMY_SINGLE`,minRange:2,maxRange:4,radius:0,effects:[{kind:`damage`,multiplier:1.2,on:`hits`},{kind:`status`,status:`DEF_DOWN`,duration:2,value:.2,on:`hits`}]},"hound-interference":{id:`hound-interference`,name:`SIGNAL JAM`,desc:`Jams one squad member and weakens their attack and speed.`,slot:`A2`,cooldownMax:3,targetType:`ENEMY_SINGLE`,minRange:1,maxRange:3,radius:0,effects:[{kind:`damage`,multiplier:.35,on:`hits`},{kind:`status`,status:`ATK_DOWN`,duration:2,value:.25,on:`hits`},{kind:`status`,status:`SPD_DOWN`,duration:2,value:.2,on:`hits`}]},"hostile-strike":{id:`hostile-strike`,name:`STRIKE`,desc:`Melee contact.`,slot:`A1`,cooldownMax:0,targetType:`ENEMY_SINGLE`,minRange:1,maxRange:1,radius:0,effects:[{kind:`damage`,multiplier:1,on:`hits`}]},"hostile-maul":{id:`hostile-maul`,name:`MAUL`,desc:`Heavy melee. Lowers ATK for 1 turn.`,slot:`A2`,cooldownMax:3,targetType:`ENEMY_SINGLE`,minRange:1,maxRange:1,radius:0,effects:[{kind:`damage`,multiplier:1.3,on:`hits`},{kind:`status`,status:`ATK_DOWN`,duration:1,value:.25,on:`hits`}]},"leader-strike":{id:`leader-strike`,name:`STRIKE`,desc:`Heavy melee contact.`,slot:`A1`,cooldownMax:0,targetType:`ENEMY_SINGLE`,minRange:1,maxRange:1,radius:0,effects:[{kind:`damage`,multiplier:1,on:`hits`}]},"leader-crush":{id:`leader-crush`,name:`CRUSH`,desc:`Devastating melee blow.`,slot:`A2`,cooldownMax:3,targetType:`ENEMY_SINGLE`,minRange:1,maxRange:1,radius:0,effects:[{kind:`damage`,multiplier:1.5,on:`hits`}]},"leader-intimidate":{id:`leader-intimidate`,name:`INTIMIDATE`,desc:`Tactical pressure. Lowers target ATK for 2 turns.`,slot:`A3`,cooldownMax:4,targetType:`ENEMY_SINGLE`,minRange:1,maxRange:2,radius:0,effects:[{kind:`damage`,multiplier:.55,on:`hits`},{kind:`status`,status:`ATK_DOWN`,duration:2,value:.3,on:`hits`}]}};function A(e){let t=k[e];if(!t)throw Error(`Unknown skill ${e}`);return t}function ee(e,t,n){if(!e)return[];let r=[];for(let i of t.filter(e=>e.team===`ally`)){let t=i.skillIds.map(e=>E(A(e),D(n,i.defId)));if(i.defId===`alpha`){let e=t.find(e=>e.name===`HOWL`);e&&r.push(`ALPHA: HOWL radius ${e.radius}; ${e.effects.some(e=>e.status===`GUARD`)?`GUARD covers nearby holders`:`buff a spread-out squad; no added GUARD`}.`)}else if(i.defId===`ally-02`){let a=t.find(e=>e.name===`THRUST`),o=t.find(e=>e.name===`PRESSURE`);a&&o&&r.push(`CNC: THRUST range ${a.maxRange}; PRESSURE range ${o.maxRange}, cooldown ${o.cooldownMax}. ${e.objectiveType===`INTERCEPT`?`Reach the courier before the exit.`:`Time control before the enemy strike.`} ${D(n,i.defId)?.discipline===`disruptor`?`Can cancel a real interruptible locked intent.`:`No locked-intent cancellation without the DISRUPTOR doctrine.`}`)}else if(i.defId===`ally-03`){let n=t.find(e=>e.name===`MEND`),i=t.find(e=>e.name===`PACK SUPPORT`);n&&i&&r.push(`SHADOW: MEND ${n.targetType===`ALLY_AOE`?`radius ${n.radius}`:`range ${n.maxRange}`}, cooldown ${n.cooldownMax}; PACK radius ${i.radius}. ${e.objectiveType===`HOLD`?`Cover the holder before an announced hit.`:`Recover lost HP between threats.`}`)}else i.defId.startsWith(`pet:`)&&r.push(`PET: move ${i.move}; RECOVER from ${i.recoverRange||1} cells. ${e.objectiveType===`INTERCEPT`?`HAMSTRING the courier; trade reach against PATHFINDER mobility.`:`Use relay reach only during an open signal window.`}`)}let i=e.objectiveType===`INTERCEPT`?[`CNC:`,`PET:`]:e.objectiveType===`RECOVER`?[`PET:`,`SHADOW:`]:[`SHADOW:`,`ALPHA:`];return r.sort((e,t)=>{let n=e=>{let t=i.findIndex(t=>e.startsWith(t));return t<0?2:t};return n(e)-n(t)})}function te(e,t){if(!e)return e;let n=t.flatMap(e=>e.buildEvidence?[e.buildEvidence]:[]);return n.length?{...e,fieldcraft:[...new Set([...e.fieldcraft||[],...n])].slice(-24)}:e}function ne(e,t,n){return e&&e.runId===t&&e.missionId===n?(e.fieldcraft||[]).slice(-3):[]}var re={standard:{name:`STANDARD APPROACH`,copy:`Spread across the west edge. Cover the north and center.`,cells:[{c:1,r:2},{c:1,r:0},{c:0,r:3}]},south:{name:`SOUTH APPROACH`,copy:`Group along the south edge. A different route; the north starts exposed. Same squad and stats.`,cells:[{c:0,r:4},{c:2,r:4},{c:0,r:2}]}};function ie(e){return e>=2?`HIGH`:e===1?`REDUCED`:`CLEAR`}function j(e){return e>=2?`Reinforcements arrive on their scheduled round.`:`Reinforcements arrive 1 round later in relevant Field Ops.`}function M(e){if(!e.results||e.outcome===`ongoing`)return null;let{victory:t,turns:n,squadStanding:r,squadDeployed:i}=e.results;return{victory:t,turns:n,squadStanding:r,squadDeployed:i,objectiveComplete:e.results.objectiveComplete===!0,healingActions:e.healingActions||0,...e.failureReason?{failureReason:e.failureReason}:{}}}function ae(e){return e===`attrition`?`ATTRITION`:`PURSUIT`}function oe(e,t){return e===`TARGET_ESCAPED`?`The signal courier reached its exit.`:e===`DEADLINE`?`The completion window closed.`:t===`SURVIVE`?`A squad member fell. The full squad must survive.`:`The squad was defeated.`}function N(e){return new Date(e*1e3).toISOString().slice(0,16).replace(`T`,` `)+` UTC`}function se(e){if(!e||typeof e!=`object`)return null;let t=e;return typeof t.id!=`string`||!t.id.trim()||typeof t.name!=`string`||!t.name.trim()||typeof t.img!=`string`||!/^https:\/\//.test(t.img)?null:{id:t.id,name:t.name,img:t.img}}function P(e){return{defId:`pet:${e.id}`,name:e.name,team:`ally`,role:`companion`,hp:78,atk:18,def:6,spd:13,move:4,sprite:e.img,portrait:e.img,skillIds:[`pet-bite`,`pet-hamstring`]}}var F=`/images/tactical_ops`,ce=`${F}/alpha.png`,le=`${F}/alpha-attack.png`,ue=`${F}/alpha-portrait.jpg`,de={id:`broken-signal`,name:`BROKEN SIGNAL`,objective:`Eliminate the hostile force and secure the tactical sector.`},I={alpha:{defId:`alpha`,name:`ALPHA`,team:`ally`,role:`alpha`,hp:120,atk:28,def:12,spd:14,move:3,sprite:ce,attackSprite:le,portrait:ue,skillIds:[`alpha-strike`,`alpha-rend`,`alpha-howl`]},"ally-02":{defId:`ally-02`,name:`CNC`,team:`ally`,role:`skirmisher`,hp:96,atk:22,def:8,spd:12,move:2,sprite:`${F}/cnc_map_unit.webp`,portrait:`${F}/cnc_portrait.webp`,skillIds:[`u02-shot`,`u02-burst`,`u02-suppress`]},"ally-03":{defId:`ally-03`,name:`SHADOW`,team:`ally`,role:`support`,hp:100,atk:16,def:10,spd:10,move:2,sprite:`${F}/ally03.png`,portrait:`${F}/ally03.png`,skillIds:[`u03-tap`,`u03-mend`,`u03-pack`]},hostile:{defId:`hostile`,name:`HOUND MK-2`,team:`enemy`,role:`hostile`,hp:68,atk:16,def:8,spd:11,move:2,sprite:`${F}/hound.png`,portrait:`${F}/hound.png`,skillIds:[`hostile-strike`,`hostile-maul`]},leader:{defId:`leader`,name:`BRUTE LEADER`,team:`enemy`,role:`leader`,hp:148,atk:24,def:14,spd:9,move:2,sprite:`${F}/leader.png`,portrait:`${F}/leader.png`,skillIds:[`leader-strike`,`leader-crush`,`leader-intimidate`]}},fe=[{defId:`alpha`,id:`alpha`,c:2,r:2},{defId:`ally-02`,id:`ally-02`,c:1,r:0},{defId:`ally-03`,id:`ally-03`,c:1,r:4},{defId:`hostile`,id:`h1`,c:5,r:0},{defId:`hostile`,id:`h2`,c:5,r:3},{defId:`hostile`,id:`h3`,c:6,r:4},{defId:`leader`,id:`leader`,c:6,r:2}],pe={"field-relay-recovery":6,"field-relay-hold":6,"field-relay-intercept":7,"field-isolated-hold":5};function me(e,t){let n=e.directive?[structuredClone(e.directive)]:[];if(e.activity!==`FIELD_OP`||t?.reportVersion!==3||t.directiveTier!==`advanced`)return n;let r=t.directiveSet===`pursuit`;if(r&&e.objectiveType===`SURVIVE`){let e=n.find(e=>e.reinforcement);e?.reinforcement&&(e.reinforcement.triggerRound=2,e.reinforcement.spawn.r=0,e.copy=`A HOUND enters from the north-east in round 2, one round later with reduced/clear pressure. Occupied entries use the nearest free cell.`)}let i=pe[e.missionId];if(r&&i?n.push({type:`NO_SAFE_EXTRACTION`,name:`NO SAFE EXTRACTION`,maxRounds:i,copy:`Complete by the end of round ${i}. At round ${i+1}, the operation fails even if your squad is standing.`}):n.some(e=>e.supportCooldownExtra)||n.push({type:`DISRUPTED_SUPPORT`,name:`DISRUPTED SUPPORT`,supportCooldownExtra:1,copy:`Healing and allied support skills take 1 extra personal turn to recharge. SILENT SHELTER bypasses this penalty for PACK SUPPORT.`}),!n.some(e=>e.reinforcement)){let e=r?2:3;n.push({type:`REINFORCEMENTS`,name:`REINFORCEMENTS`,copy:`A HOUND enters from the ${r?`north`:`south`}-east in round ${e}, one round later with reduced/clear pressure. Occupied entries use the nearest free cell.`,reinforcement:{spawn:{defId:`hostile`,id:`field-reinforcement`,c:7,r:r?0:4},triggerRound:e,telegraphed:!0,spawned:!1}})}return n}function L(e){let t=e.directive?.recoverEveryRounds;return!t||e.round%t===0}function he(e,t,n){return n.ignoreDisruption?0:t.team===`ally`&&n.effects.some(e=>e.kind===`heal`||e.kind===`status`&&[`SELF`,`ALLY_SINGLE`,`ALLY_AOE`].includes(n.targetType))&&e?.supportCooldownExtra||0}function ge(e){let t=e.objective;if(t?.type!==`HOLD`||!t.terminal)return!1;let n=e.units.filter(e=>!e.defeated&&Math.abs(e.c-t.terminal.c)+Math.abs(e.r-t.terminal.r)<=(t.radius??0));return n.some(e=>e.team===`ally`)&&!n.some(e=>e.team===`enemy`)}function _e(e){let t=e.objective;if(e.directive?.maxRounds&&e.round>e.directive.maxRounds)return{state:{...e,failureReason:`DEADLINE`},result:`defeat`};if(t?.type===`INTERCEPT`){let n=e.units.find(e=>e.id===t.targetId);return n?.defeated?{state:e,result:e.units.some(e=>e.team===`ally`&&!e.defeated)?`victory`:`defeat`}:n&&n.c===t.exit.c&&n.r===t.exit.r?{state:{...e,failureReason:`TARGET_ESCAPED`},result:`defeat`}:{state:e,result:null}}if(t?.type!==`HOLD`&&t?.type!==`SURVIVE`)return{state:e,result:null};let n=e.units.filter(e=>e.team===`ally`);if(!n.some(e=>!e.defeated)||t.type===`SURVIVE`&&n.some(e=>e.defeated))return{state:e,result:`defeat`};let r=e.round>t.checkedRound,i=t.type===`SURVIVE`?e.round-1:ge(e)?t.progress+ +!!r:0;return{state:{...e,objective:{...t,progress:i,checkedRound:e.round}},result:i>=t.duration?`victory`:null}}function ve(e){let t=e.objective,n=e.directive,r=t?.type===`HOLD`?`HOLD ${t.progress}/${t.duration} · ${ge(e)?`CONTROLLED`:`OCCUPY / CLEAR AREA`}`:t?.type===`SURVIVE`?`SURVIVE ${t.progress}/${t.duration} · ALL SQUAD MUST STAND`:n?.recoverEveryRounds?`RECOVER · SIGNAL ${L(e)?`OPEN`:`JAMMED — EVEN ROUNDS ONLY`}`:``,i=[n?.reinforcement&&e.reinforcement?`HOUND · ${e.reinforcement.spawned?`ARRIVED`:`ROUND ${e.reinforcement.triggerRound}`}`:``,n?.supportCooldownExtra?`SUPPORT COOLDOWNS +${n.supportCooldownExtra}`:``,n?.maxRounds?`WINDOW · ${Math.max(0,n.maxRounds-e.round+1)} ROUNDS LEFT`:``];return[t?.type===`INTERCEPT`?`INTERCEPT · STOP COURIER BEFORE EXIT`:r,...i].filter(Boolean).join(` · `)}function ye(e){if(!e.length)return null;if(e.length===1)return structuredClone(e[0]);if(e.filter(e=>e.reinforcement).length>1)throw Error(`Only one reinforcement schedule per condition set`);return{type:`COMPOSITE`,name:e.map(e=>e.name).join(` + `),copy:e.map(e=>e.copy).join(` `),conditions:structuredClone(e),recoverEveryRounds:Math.max(...e.map(e=>e.recoverEveryRounds||0)),supportCooldownExtra:Math.max(...e.map(e=>e.supportCooldownExtra||0)),maxRounds:e.find(e=>e.maxRounds)?.maxRounds,reinforcement:structuredClone(e.find(e=>e.reinforcement)?.reinforcement)}}function be(e,t,n){if(!n)return e;if(n.version!==1||n.effect!==`DELAY_REINFORCEMENT`||n.sourceChapterId!==`edge-relay`||n.missionId!==t||!e.reinforcement||e.reinforcement.triggerRound!==n.baselineRound||n.effectiveRound!==n.baselineRound+1)throw Error(`chapter_intel_rules_mismatch`);return{...e,reinforcement:{...e.reinforcement,triggerRound:n.effectiveRound}}}var xe={"broken-signal":{art:`/images/tactical_ops/presentation/tactical_ops_battlefield_backdrop.png`}};function Se(e){return xe[e?.battlefield||`broken-signal`]||xe[`broken-signal`]}var Ce=[{defId:`alpha`,id:`alpha`,c:0,r:2},{defId:`ally-02`,id:`ally-02`,c:1,r:0},{defId:`ally-03`,id:`ally-03`,c:1,r:4},{defId:`hostile`,id:`h1`,c:5,r:1},{defId:`hostile`,id:`h2`,c:6,r:3},{defId:`hostile`,id:`h3`,c:7,r:0}],we=[{defId:`alpha`,id:`alpha`,c:0,r:2},{defId:`hostile`,id:`h1`,c:5,r:1},{defId:`hostile`,id:`h2`,c:6,r:3}],Te={c:6,r:2},Ee=[{defId:`alpha`,id:`alpha`,c:1,r:2},{defId:`ally-02`,id:`ally-02`,c:1,r:0},{defId:`ally-03`,id:`ally-03`,c:0,r:3},{defId:`leader`,id:`leader`,c:6,r:2},{defId:`hostile`,id:`h1`,c:4,r:0},{defId:`hostile`,id:`h2`,c:5,r:4}],De={spawn:{defId:`hostile`,id:`commander-reinforcement`,c:7,r:4},triggerRound:2};function Oe(e,t){let n=!!(t&&e[1]===`pet:${t.id}`);return e.length!==2||e[0]!==`alpha`||!n&&![`ally-02`,`ally-03`].includes(e[1])?null:[{defId:`alpha`,id:`alpha`,c:0,r:2},{defId:e[1],id:e[1],c:1,r:e[1]===`ally-02`?0:4,...n?{unitDef:P(t)}:{}},...we.filter(e=>e.defId===`hostile`)]}function ke(e,t){return e.length!==3||e[0]!==`alpha`||new Set(e).size!==3||!e.slice(1).every(e=>e===`ally-02`||e===`ally-03`||t&&e===`pet:${t.id}`)?null:[{...Ee[0]},...e.slice(1).map((e,n)=>({defId:e,id:e,c:+(n===0),r:n===0?0:3,...t&&e===`pet:${t.id}`?{unitDef:P(t)}:{}})),...Ee.slice(3)]}var Ae={operationId:`broken-signal`,name:`BROKEN SIGNAL`,orderedMissionIds:[`broken-signal-breach`,`broken-signal-recover`,`broken-signal-commander`]},je={operationId:`dead-relay`,name:`THE DEAD RELAY`,orderedMissionIds:[`dead-relay-courier`,`dead-relay-hold`,`dead-relay-guardian`]},Me={"broken-signal-breach":{missionId:`broken-signal-breach`,operationId:Ae.operationId,name:`BREACH`,objectiveType:`ELIMINATE`,squadCap:3,briefCopy:`Break the perimeter before the signal disappears. Eliminate the HOUND MK-2 patrol.`,resultsCopy:`BREACH CLEARED. RECOVER SIGNAL UNLOCKED.`,executable:!0,spawns:Ce},"broken-signal-recover":{missionId:`broken-signal-recover`,operationId:Ae.operationId,name:`RECOVER SIGNAL`,objectiveType:`RECOVER`,squadCap:2,briefCopy:`Reach the relay terminal and recover the signal before the HOUND MK-2 patrol can stop you.`,resultsCopy:`OBJECTIVE COMPLETE · SIGNAL RECOVERED.`,executable:!0,terminal:Te},"broken-signal-commander":{missionId:`broken-signal-commander`,operationId:Ae.operationId,name:`SIGNAL COMMANDER`,objectiveType:`BOSS`,squadCap:3,briefCopy:`Break the commander signal. Control the HOUND pressure or find an opening to defeat the BRUTE LEADER.`,resultsCopy:`Continue to save: OPERATION 01 — BROKEN SIGNAL CLEARED · ARCHIVE ENTRY RECORDED · NEXT OPERATION SLOT OPENED. No Operation assigned.`,executable:!0,spawns:Ee}};function R(e){return e&&Me[e]||null}var Ne={activity:`FIELD_OP`,operationId:`field-ops`,regionId:`broken-signal`,battlefield:`broken-signal`,squadCap:3,executable:!0,resultsCopy:`Field Op complete. Your result records commander progress, the optional challenge and temporary signal pressure.`};Object.assign(Me,{"field-relay-recovery":{...Ne,missionId:`field-relay-recovery`,name:`RELAY RECOVERY`,objectiveType:`RECOVER`,challenge:{type:`TURN_LIMIT`,limit:4,label:`Recover by the end of round 4`},briefCopy:`Reach the relay and use RECOVER from within 1 cell. Eliminating the HOUND patrol is optional.`,terminal:{c:6,r:2},objective:{type:`RECOVER`,terminal:{c:6,r:2},completed:!1},spawns:we.filter(e=>e.defId===`hostile`),directive:{type:`SIGNAL_INTERFERENCE`,name:`SIGNAL INTERFERENCE`,recoverEveryRounds:2,copy:`RECOVER works only on even rounds (2, 4, 6...). Move and attack normally; reach cover or prepare protection while the signal is jammed.`},squadHint:`PET mobility can reach the relay early. CNC controls patrol pressure; SHADOW protects a squad waiting for the signal window.`},"field-relay-hold":{...Ne,missionId:`field-relay-hold`,name:`RELAY HOLD`,objectiveType:`HOLD`,challenge:{type:`NO_HEALING`,label:`Clear without using a healing skill`},briefCopy:`Keep at least one ally within 1 cell of the marked relay, with no enemy inside that area, across 3 consecutive round changes. Losing control resets progress.`,objective:{type:`HOLD`,terminal:{c:3,r:2},radius:1,duration:3,progress:0,checkedRound:1},spawns:[{defId:`hostile`,id:`h1`,c:5,r:1},{defId:`hostile`,id:`h2`,c:6,r:3}],directive:{type:`REINFORCEMENTS`,name:`REINFORCEMENTS`,copy:`One HOUND arrives at the marked entry in round 2, or round 3 when signal pressure is reduced/clear (nearest free cell if occupied). Clear or slow enemies before they contest the relay.`,reinforcement:{spawn:{defId:`hostile`,id:`field-reinforcement`,c:7,r:2},triggerRound:2,telegraphed:!0,spawned:!1}},squadHint:`CNC pressure helps keep the area clear. SHADOW sustains the holder; PET control can delay the arriving HOUND.`},"field-squad-survival":{...Ne,missionId:`field-squad-survival`,name:`SQUAD SURVIVAL`,objectiveType:`SURVIVE`,challenge:{type:`SQUAD`,required:[`ally-02`,`PET`],label:`Clear with CNC and your equipped PET`},briefCopy:`Keep all three squad members standing through 4 rounds, until round 5 begins. Any squad member falling fails the mission. Clearing enemies early does not end the timer.`,objective:{type:`SURVIVE`,duration:4,progress:0,checkedRound:1},spawns:[{defId:`hostile`,id:`h1`,c:4,r:0},{defId:`hostile`,id:`h2`,c:5,r:4},{defId:`hostile`,id:`h3`,c:6,r:2}],directive:{type:`DISRUPTED_SUPPORT`,name:`DISRUPTED SUPPORT`,supportCooldownExtra:1,copy:`Allied healing and self/ally buff skills take 1 extra personal turn to recharge after use. Attacks and movement are unchanged. Time support carefully and protect the weakest squad member.`},squadHint:`SHADOW still provides sustain, but timing matters. CNC can reduce incoming pressure; PET mobility and slows help keep the squad safe.`},"field-relay-intercept":{...Ne,missionId:`field-relay-intercept`,name:`RELAY INTERCEPT`,objectiveType:`RECOVER`,briefCopy:`Recover at the northern relay from within 1 cell. Rush the terminal or control the patrol before the incoming HOUND closes the route.`,terminal:{c:6,r:0},objective:{type:`RECOVER`,terminal:{c:6,r:0},completed:!1},spawns:[{defId:`hostile`,id:`h1`,c:4,r:1},{defId:`hostile`,id:`h2`,c:6,r:3}],directive:{type:`REINFORCEMENTS`,name:`REINFORCEMENTS`,copy:`One HOUND enters from the north-east in round 2, or round 3 when signal pressure is reduced/clear. The entry uses the nearest free cell if occupied.`,reinforcement:{spawn:{defId:`hostile`,id:`field-reinforcement`,c:7,r:0},triggerRound:2,telegraphed:!0,spawned:!1}},challenge:{type:`NO_HEALING`,label:`Recover without using a healing skill`},squadHint:`CNC can open the northern route. PET speed favors a rush; SHADOW makes a slower approach safer.`},"field-isolated-hold":{...Ne,missionId:`field-isolated-hold`,name:`ISOLATED HOLD`,objectiveType:`HOLD`,briefCopy:`Control the southern relay area within 1 cell for 2 consecutive round changes. Any enemy inside contests it; losing control resets progress. The BRUTE LEADER applies pressure from the center.`,objective:{type:`HOLD`,terminal:{c:4,r:3},radius:1,duration:2,progress:0,checkedRound:1},spawns:[{defId:`leader`,id:`leader`,c:6,r:2},{defId:`hostile`,id:`h1`,c:5,r:0}],directive:{type:`DISRUPTED_SUPPORT`,name:`DISRUPTED SUPPORT`,supportCooldownExtra:1,copy:`Allied healing and self/ally buff skills take 1 extra personal turn to recharge. Hold the area while planning longer gaps between support actions.`},challenge:{type:`TURN_LIMIT`,limit:5,label:`Secure the area by the end of round 5`},squadHint:`SHADOW can protect a stationary holder. CNC or PET control helps keep the leader outside the area. South Approach changes the route to this relay.`},"field-rearguard":{...Ne,missionId:`field-rearguard`,name:`REARGUARD`,objectiveType:`SURVIVE`,briefCopy:`Keep all three squad members standing through 5 rounds, until round 6 begins. Defend against the patrol and the arriving HOUND. Any squad member falling fails the mission.`,objective:{type:`SURVIVE`,duration:5,progress:0,checkedRound:1},spawns:[{defId:`hostile`,id:`h1`,c:4,r:1},{defId:`hostile`,id:`h2`,c:5,r:4}],directive:{type:`REINFORCEMENTS`,name:`REINFORCEMENTS`,copy:`One HOUND arrives from the south-east in round 3, or round 4 when signal pressure is reduced/clear. Protect the flank or regroup before it arrives.`,reinforcement:{spawn:{defId:`hostile`,id:`field-reinforcement`,c:7,r:4},triggerRound:3,telegraphed:!0,spawned:!1}},challenge:{type:`SQUAD`,required:[`ally-03`,`PET`],label:`Survive with SHADOW and your equipped PET`},squadHint:`SHADOW can sustain a defensive group. PET slows help delay the new arrival; CNC offers pressure if you forgo the optional squad challenge.`},"dead-relay-courier":{activity:`CANON`,missionId:`dead-relay-courier`,operationId:je.operationId,battlefield:`broken-signal`,name:`THE COURIER`,objectiveType:`INTERCEPT`,squadCap:3,executable:!0,briefCopy:`HOUND is evacuating relay intel. Stop the reinforced SIGNAL COURIER before it reaches the south-east exit. It moves up to 2 cells each turn, while a HOUND patrol pressures your flank. Slow, intercept or focus fire. Stop it by round 4 on the FIRST successful clear to earn intel for the next mission.`,resultsCopy:`Courier stopped. Relay coordinates recovered. The counterattack is imminent.`,objective:{type:`INTERCEPT`,targetId:`courier`,exit:{c:7,r:4}},spawns:[{defId:`hostile`,id:`courier`,c:4,r:0,unitDef:{...I.hostile,defId:`signal-courier`,name:`SIGNAL COURIER`,hp:100,move:2}},{defId:`hostile`,id:`h1`,c:5,r:3},{defId:`hostile`,id:`h2`,c:3,r:3}],squadHint:`CNC can suppress the fleeing courier. PET slows make interception easier, while SHADOW keeps a forward blocker alive.`},"dead-relay-hold":{activity:`CANON`,missionId:`dead-relay-hold`,operationId:je.operationId,battlefield:`broken-signal`,name:`RELAY UNDER FIRE`,objectiveType:`HOLD`,squadCap:3,executable:!0,briefCopy:`Hold the relay for 3 consecutive round changes. Any enemy inside the marked zone resets control. Your recovered courier intel delays one HOUND reinforcement by a round.`,resultsCopy:`Relay secured. The defensive perimeter is stable. Guardian access confirmed.`,objective:{type:`HOLD`,terminal:{c:3,r:2},radius:1,duration:3,progress:0,checkedRound:1},spawns:[{defId:`hostile`,id:`h1`,c:5,r:1},{defId:`hostile`,id:`h2`,c:6,r:3}],directive:{type:`REINFORCEMENTS`,name:`REINFORCEMENTS`,copy:`A HOUND arrives from the east on round 2, or round 3 if courier intel was captured in the first mission.`,reinforcement:{spawn:{defId:`hostile`,id:`dead-relay-reinforcement`,c:7,r:2},triggerRound:2,telegraphed:!0,spawned:!1}},squadHint:`SHADOW can sustain relay control. CNC and PET prevent enemy contesting.`},"dead-relay-guardian":{activity:`CANON`,missionId:`dead-relay-guardian`,operationId:je.operationId,battlefield:`broken-signal`,name:`RELAY GUARDIAN`,objectiveType:`BOSS`,squadCap:3,executable:!0,briefCopy:`Eliminate the Dead Relay Guardian while a telegraphed HOUND reinforcement closes from the flank. This is the final mission of Operation 02.`,resultsCopy:`OPERATION 02 — THE DEAD RELAY SECURED. Canonical campaign archive updated.`,objective:{type:`BOSS`,targetId:`leader`},spawns:[{defId:`leader`,id:`leader`,c:6,r:2,unitDef:{...I.leader,name:`DEAD RELAY GUARDIAN`}},{defId:`hostile`,id:`h1`,c:4,r:0},{defId:`hostile`,id:`h2`,c:5,r:4}],directive:{type:`REINFORCEMENTS`,name:`GUARDIAN REINFORCEMENT`,copy:`One HOUND enters from the south-east on round 3. The entry is telegraphed.`,reinforcement:{spawn:{defId:`hostile`,id:`guardian-reinforcement`,c:7,r:4},triggerRound:3,telegraphed:!0,spawned:!1}},squadHint:`Use your Pack's control and sustain to counter the Guardian's pressure, then focus on the boss.`}});var Pe=structuredClone(Me[`field-relay-intercept`]);Me[`field-relay-intercept`]={...Pe,objectiveType:`INTERCEPT`,terminal:void 0,briefCopy:`Stop the SIGNAL COURIER before it reaches the south-east EXIT. It moves 1 cell on each personal turn, taking the shortest free route. Block the route, slow it, or focus fire; patrol kills are optional.`,objective:{type:`INTERCEPT`,targetId:`courier`,exit:{c:7,r:4}},spawns:[{defId:`hostile`,id:`courier`,c:4,r:0,unitDef:{...I.hostile,defId:`signal-courier`,name:`SIGNAL COURIER`,move:1}},{defId:`hostile`,id:`h1`,c:4,r:2},{defId:`hostile`,id:`h2`,c:6,r:3}],challenge:{type:`NO_HEALING`,label:`Intercept without using a healing skill`},squadHint:`CNC DISRUPTOR and PET HAMSTRING slow the courier's turns. PET mobility can block its exit; SHADOW protects a forward blocker at the cost of another control unit.`};function Fe(e,t){return e.missionId===`field-relay-intercept`&&t?.reportVersion!=null&&t.reportVersion<3?Pe:e}function Ie(e,t,n,r=`standard`){if(e.operationId===je.operationId){let r=ke(t,n);return r?[...r.slice(0,3),...e.spawns||[]]:null}if(e.activity===`FIELD_OP`){let i=ke(t,n);return i&&re[r]?[...i.slice(0,3).map((e,t)=>({...e,...re[r].cells[t]})),...e.spawns||[]]:null}return e.objectiveType===`RECOVER`?Oe(t,n):e.objectiveType===`BOSS`?ke(t,n):e.spawns||null}function Le(e,t=!1,n,r){e=Fe(e,n);let i=e.objective?structuredClone(e.objective):e.objectiveType===`RECOVER`&&e.terminal?{type:`RECOVER`,terminal:{...e.terminal},completed:!1}:e.objectiveType===`BOSS`?{type:`BOSS`,targetId:`leader`}:null,a=ye(me(e,n)),o=a?.reinforcement||(e.objectiveType===`BOSS`?{...De,spawn:{...De.spawn},telegraphed:t,spawned:!1}:null);return e.activity===`FIELD_OP`&&o&&n&&n.pressure<2&&(o.triggerRound+=1),e.missionId===`dead-relay-hold`&&o&&r?.courierTraceAcquired&&(o.triggerRound=3),{objective:i,directive:a,reinforcement:o}}var Re={RECON:{title:`GHOST SIGNAL`,copy:`Recover the relay, then intercept the courier. Win with positioning and information.`,missions:[`field-relay-recovery`,`field-relay-intercept`,`dead-relay-courier`],effect:`DELAY_REINFORCEMENT`},DEFENSE:{title:`HOLD THE CHAIN`,copy:`Secure two contested locations, then keep the full squad alive.`,missions:[`field-relay-hold`,`field-isolated-hold`,`field-squad-survival`],effect:`SOUTH_APPROACH`},INTERDICTION:{title:`BREAK THE COMMAND`,copy:`Stop the courier, defend a flank, then defeat the relay Guardian.`,missions:[`field-relay-intercept`,`field-rearguard`,`dead-relay-guardian`],effect:`COMMAND_DISRUPTION`}},ze=new Set(Object.values(Re).flatMap(e=>[...e.missions]));function Be(e){if(!e||typeof e!=`object`||Array.isArray(e))return null;let t=e;if(t.version!==1||t.chapterId!==`edge-relay`||![`AVAILABLE`,`ACTIVE`,`COMPLETED`].includes(String(t.status))||t.doctrine!==null&&!Object.hasOwn(Re,String(t.doctrine))||!Number.isSafeInteger(t.revision)||Number(t.revision)<0||!Array.isArray(t.completedMissionIds)||t.completedMissionIds.some(e=>typeof e!=`string`||!ze.has(e))||new Set(t.completedMissionIds).size!==t.completedMissionIds.length||t.activeRunId!==null&&(typeof t.activeRunId!=`string`||!t.activeRunId)||![`NONE`,`DELAY_REINFORCEMENT`,`SOUTH_APPROACH`,`COMMAND_DISRUPTION`].includes(String(t.intelEffect))||t.intelConsumedByRunId!==null&&(typeof t.intelConsumedByRunId!=`string`||!t.intelConsumedByRunId)||t.lastReceiptId!==null&&(typeof t.lastReceiptId!=`string`||!t.lastReceiptId))return null;let n=t.doctrine,r=t.completedMissionIds;return t.status===`AVAILABLE`&&(n!==null||r.length!==0||t.activeRunId!==null||t.intelEffect!==`NONE`)||t.status!==`AVAILABLE`&&!n||n&&(r.some(e=>!Re[n].missions.includes(e))||Re[n].missions.some((e,t)=>t<r.length&&r[t]!==e))||t.status===`COMPLETED`&&(!n||r.length!==3||t.activeRunId!==null||t.intelEffect!==Re[n].effect)||t.status===`ACTIVE`&&r.length>=3?null:{version:1,chapterId:`edge-relay`,status:t.status,doctrine:n,revision:Number(t.revision),completedMissionIds:[...r],activeRunId:t.activeRunId,intelEffect:t.intelEffect,intelConsumedByRunId:t.intelConsumedByRunId,lastReceiptId:t.lastReceiptId}}function Ve(e){return e.status!==`ACTIVE`||!e.doctrine?null:Re[e.doctrine].missions[e.completedMissionIds.length]||null}function He(e){let t=Ve(e);return{complete:e.status===`COMPLETED`,stage:e.completedMissionIds.length,total:3,title:e.doctrine?Re[e.doctrine].title:`CHOOSE YOUR DOCTRINE`,nextMissionId:t,nextMissionName:t?R(t)?.name||t:null,consequence:e.status===`COMPLETED`?`Server-recorded campaign Intel is available only under the accepted next-run contract.`:e.doctrine?Re[e.doctrine].copy:`Doctrine selection must be recorded by the server before deployment.`}}function Ue(e){let t=[];if(!e?.completed)return t;let n=e.operations?.[je.operationId];if(n&&n.status!==`cleared`){let e=n.activeMissionRun,r=e?.missionId||je.orderedMissionIds.find(e=>n.missions[e]===`available`)||null;r&&t.push({id:`story`,category:`STORY`,missionId:r,title:`CONTINUE THE DEAD RELAY`,goal:`${R(r)?.name||`Next mission`} · ${R(r)?.objectiveType||`OBJECTIVE`}`,consequence:r===`dead-relay-courier`?`Intercept the courier; early first-clear Intel changes the next Hold battle.`:r===`dead-relay-hold`?`Control the relay to unlock the Guardian.`:`Defeat the Guardian to record Operation 02 completion.`,status:e?`IN_PROGRESS`:`READY`})}let r=e.fieldOps,i=r?.board,a=i?.activeMissionIds||[];if(!i||!r?.records)return t.push({id:`refresh`,category:`RETURN`,missionId:null,title:`SYNC THE FRONT`,goal:`Load current server rotation`,consequence:`No progress or eligibility is inferred until the War Table refreshes.`,status:`PENDING`}),t;let o=new Set(r.rotationProgress?.cycleId===i.cycleId?r.rotationProgress.clearedMissionIds:[]),s=a.filter(e=>!o.has(e)&&r.records[e]?.lastClearCycle!==i.cycleId),c=r.activeMissionRun,l=c&&R(c.missionId)?c:null;if(l)t.push({id:`resume`,category:`FRONT`,missionId:l.missionId,title:`FINISH ACCEPTED OPERATION`,goal:R(l.missionId)?.name||l.missionId,consequence:`Resume the server-accepted run using its frozen conditions; the battle restarts at round 1.`,status:`IN_PROGRESS`});else if(s.length){let e=s[0];t.push({id:`front`,category:`FRONT`,missionId:e,title:`SECURE THE CURRENT FRONT`,goal:`${s.length} of ${a.length} operations left · next: ${R(e)?.name||e}`,consequence:`A server-confirmed first clear advances the rotation and can affect regional Signal Pressure.`,status:`READY`})}else a.length&&t.push({id:`front`,category:`FRONT`,missionId:null,title:`CURRENT FRONT SECURED`,goal:`${a.length}/${a.length} operations completed`,consequence:`Wait for the next server rotation or attempt a still-open optional challenge.`,status:`COMPLETE`});let u=a.find(e=>R(e)?.challenge&&r.records[e]?.lastChallengeCycle!==i.cycleId);u?t.push({id:`challenge`,category:`CHALLENGE`,missionId:u,title:`COMPLETE A TACTICAL CHALLENGE`,goal:`${R(u)?.name}: ${R(u)?.challenge?.label}`,consequence:`Optional challenge progress is only awarded when the backend accepts the report; previous clears do not grant it again.`,status:`READY`}):a.length&&t.push({id:`challenge`,category:`CHALLENGE`,missionId:null,title:`ROTATION CHALLENGES COMPLETE`,goal:`All current eligible challenges recorded`,consequence:`No unearned challenge bonus is promised.`,status:`COMPLETE`});let d=r.commander?.unlockedDirectiveTiers||[],f=a.find(e=>r.records[e]?.lastAdvancedCycle!==i.cycleId);return d.includes(`advanced`)&&f?t.push({id:`advanced`,category:`ADVANCED`,missionId:f,title:`TAKE THE ADVANCED DIRECTIVE`,goal:`${R(f)?.name||f} · ADVANCED`,consequence:`Choose Advanced in the briefing; only server-confirmed advanced clears enter the career record.`,status:`READY`}):d.includes(`advanced`)?t.push({id:`advanced`,category:`ADVANCED`,missionId:null,title:`ADVANCED FRONT COMPLETE`,goal:`Advanced objectives recorded this rotation`,consequence:`Replays remain available for practice.`,status:`COMPLETE`}):t.push({id:`advanced`,category:`ADVANCED`,missionId:null,title:`UNLOCK ADVANCED DIRECTIVES`,goal:`Progress the backend Commander certification path`,consequence:`Higher difficulty is not selectable until unlocked by the server.`,status:`LOCKED`}),t}function We(e){let t=e?.fieldOps?.careerRecord;return t?{missions:t.missionSecures,challenges:t.challenges,advanced:t.advancedClears,fronts:t.frontsSecured}:null}function Ge(e){let t=e.objective;return t?.type===`HOLD`?`Control the relay for ${t.duration} consecutive round changes. Enemies inside the zone reset control.`:t?.type===`SURVIVE`?`Keep every deployed squad member alive through ${t.duration} rounds. Eliminating enemies does not end the timer.`:t?.type===`INTERCEPT`?`Stop the courier before it reaches the exit.`:e.objectiveType===`RECOVER`?`Reach the relay and activate RECOVER when the signal is open.`:e.objectiveType===`BOSS`?`Defeat the marked commander. Other enemies are not the objective.`:`Eliminate every hostile.`}function Ke(e){return e.objectiveType===`INTERCEPT`?`The courier escapes or the entire squad falls.`:e.objectiveType===`SURVIVE`?`Any deployed squad member falls.`:e.directive?.maxRounds?`The mission deadline (round ${e.directive.maxRounds}) expires or the squad falls.`:`The entire squad falls; mission-specific deadlines also apply where shown.`}function qe(e,t){if(e.activity!==`FIELD_OP`)return{clear:`NOT_APPLICABLE`,challenge:`NOT_APPLICABLE`,commander:`UNKNOWN`,copy:`Campaign progress is recorded by the server.`};if(!t?.board||!t.commander)return{clear:`UNKNOWN`,challenge:`UNKNOWN`,commander:`UNKNOWN`,copy:`Refresh to check this rotation's confirmed rewards.`};let n=t.records?.[e.missionId],r=n?.lastClearCycle===t.board.cycleId?`SECURED`:`AVAILABLE`,i=e.challenge?n?.lastChallengeCycle===t.board.cycleId?`SECURED`:`AVAILABLE`:`NOT_APPLICABLE`,a=t.commander.rank>=3||t.commander.certificationComplete?`CERTIFIED`:`ACTIVE`;return{clear:r,challenge:i,commander:a,copy:a===`CERTIFIED`?`Rank 3 complete. Commander points can still be recorded, but there is no next Commander rank.`:r===`SECURED`&&i!==`AVAILABLE`?`Clear and challenge secured for this rotation.`:r===`SECURED`?`Clear secured; the optional challenge may still award progress.`:`A first clear and an unfinished challenge can award progress if confirmed by the server.`}}function Je(e){let t=e.objective;if(t?.type===`HOLD`)return`HOLD ${t.progress}/${t.duration}`;if(t?.type===`SURVIVE`)return`SURVIVE ${t.progress}/${t.duration}`;if(t?.type===`INTERCEPT`){let n=e.units.find(e=>e.id===t.targetId);return n&&!n.defeated?`STOP COURIER BEFORE EXIT`:`COURIER STOPPED`}return t?.type===`RECOVER`?t.completed?`SIGNAL RECOVERED`:L(e)?`SIGNAL OPEN`:`SIGNAL JAMMED`:t?.type===`BOSS`?e.units.some(e=>e.id===t.targetId&&!e.defeated)?`DEFEAT COMMANDER`:`COMMANDER DEFEATED`:`${e.units.filter(e=>e.team===`enemy`&&!e.defeated).length} HOSTILES REMAIN`}function Ye(e){let t=e.objective;return t?.type===`HOLD`?ge(e)?{status:`CONTROLLED`,action:`Keep an ally in the relay zone through the next round change.`,progress:t.progress,total:t.duration}:e.units.filter(e=>!e.defeated&&Math.abs(e.c-t.terminal.c)+Math.abs(e.r-t.terminal.r)<=(t.radius??0)).some(e=>e.team===`enemy`)?{status:`CONTESTED`,action:`Remove enemies from the marked relay zone.`,progress:t.progress,total:t.duration}:{status:`OCCUPY RELAY`,action:`Move a living ally into the marked HOLD zone.`,progress:t.progress,total:t.duration}:t?.type===`SURVIVE`?{status:`KEEP SQUAD ALIVE`,action:`Hold formation until round ${t.duration+1} begins.`,progress:t.progress,total:t.duration}:t?.type===`INTERCEPT`?{status:`STOP COURIER`,action:`Block, slow or eliminate the courier before the exit.`,progress:null,total:null}:t?.type===`RECOVER`?{status:L(e)?`SIGNAL OPEN`:`SIGNAL JAMMED`,action:L(e)?`Get within range and use RECOVER.`:`Prepare position; wait for the signal window.`,progress:null,total:null}:t?.type===`BOSS`?{status:`DEFEAT COMMANDER`,action:`Defeat the marked commander. Ignore remaining patrol if safe.`,progress:null,total:null}:{status:`CLEAR HOSTILES`,action:`Eliminate the hostile squad.`,progress:null,total:null}}function Xe(e,t){let n=e?.board;if(!n?.activeMissionIds?.length)return{missionId:null,reason:`Refresh the War Table to see the next mission.`};let r=e?.activeMissionRun;if(r&&n.activeMissionIds.includes(r.missionId))return{missionId:r.missionId,reason:`Resume your accepted mission under its original conditions.`};let i=n.activeMissionIds.find(t=>e?.records?.[t]?.lastClearCycle!==n.cycleId);if(i)return{missionId:i,reason:`Secure another Field Op to advance the current front.`};let a=n.activeMissionIds.find(t=>R(t)?.challenge&&e?.records?.[t]?.lastChallengeCycle!==n.cycleId);return a?{missionId:a,reason:`All Field Ops secured. An optional challenge is still open.`}:{missionId:t&&n.activeMissionIds.includes(t)?t:n.activeMissionIds[0],reason:`Front secured. Replay to practice tactics or return after the next rotation; no new Commander reward is promised.`}}function Ze(e,t,n,r){let i=n?.missionId===e.missionId?n?.fieldContext?.reportVersion:t?.board?.reportVersion,a=i?Fe(e,{reportVersion:i}):e,o=qe(a,t),s=o.clear===`SECURED`?`CLEAR SECURED`:o.clear===`UNKNOWN`?`STATUS UNAVAILABLE`:o.clear===`NOT_APPLICABLE`?`CAMPAIGN RECORD`:o.commander===`CERTIFIED`?`FIRST CLEAR AVAILABLE`:`+2 COMMANDER IF ELIGIBLE`,c=o.challenge===`SECURED`?`CHALLENGE SECURED`:o.challenge===`UNKNOWN`?`STATUS UNAVAILABLE`:o.challenge===`NOT_APPLICABLE`?`NO FIELD CHALLENGE`:o.commander===`CERTIFIED`?`CHALLENGE OPEN`:`+1 COMMANDER IF ELIGIBLE`,l=a.activity===`FIELD_OP`?r?.missionId===a.missionId&&r.regionalApplied?`Latest recorded result changed Signal Pressure. Relevant reinforcements use the server-confirmed new pressure.`:`A first clear can secure this operation in the current rotation. Signal Pressure changes only if recorded by the server.`:a.resultsCopy;return{missionId:a.missionId,objectiveText:Ge(a),failConditionText:Ke(a),tacticalThreat:a.directive?.copy||a.squadHint||`Use positioning, skills and enemy ranges to control the encounter.`,nextConsequence:l,rewardEligibility:o,rewardClearText:s,rewardChallengeText:c,nextAction:Xe(t,a.missionId),source:t?.board?`ACCEPTED_RUN_AND_BACKEND_STATE`:`MISSION_DEFINITION_ONLY`}}function Qe(e){return e.victory?e.rankAfter>=3?`COMMANDER CERTIFIED · ${e.progressEarned} POINTS RECORDED IN HISTORY. NO HIGHER COMMANDER RANK.`:e.progressEarned>0?`COMMANDER PROGRESS RECORDED. YOUR NEXT CERTIFICATION MILESTONE IS CLOSER.`:`NO NEW COMMANDER PROGRESS ON THIS CLEAR. CHECK UNFINISHED CHALLENGES OR REPLAY FOR PRACTICE.`:`MISSION FAILED. No clear recorded. Regroup and retry.`}function $e(e,t,n){if(e){if(e.regionalApplied&&e.pressureBefore!==e.pressureAfter){let t=e.pressureAfter<2?`Relevant reinforcements now arrive one round later.`:`Reinforcements remain on schedule.`;return{label:`SIGNAL PRESSURE CHANGED`,detail:`Pressure ${e.pressureBefore} → ${e.pressureAfter}. ${t}`,source:`SERVER_RECEIPT`}}if(e.advancedUnlocked)return{label:`ADVANCED DIRECTIVES UNLOCKED`,detail:`A new tactical challenge is available at the War Table.`,source:`SERVER_RECEIPT`};if(e.frontJustSecured)return{label:`FRONT SECURED`,detail:`The current rotation's front is recorded as secured.`,source:`SERVER_RECEIPT`};if(e.rankAfter>e.rankBefore)return{label:`COMMANDER RANK ADVANCED`,detail:`Rank ${e.rankBefore} → ${e.rankAfter}; check new deployment options at the War Table.`,source:`SERVER_RECEIPT`};if(e.masteryChanges?.some(e=>e.beforeStage<e.stage)){let t=e.masteryChanges.find(e=>e.beforeStage<e.stage);return{label:`PACK MASTERY UNLOCKED`,detail:`${t.unitId}: stage ${t.beforeStage} → ${t.stage}. Check the saved specialization.`,source:`SERVER_RECEIPT`}}return null}return t?.victory&&t.missionId===`dead-relay-courier`&&n?.campaignIntel?.[`dead-relay`]?.courierTraceAcquired&&t.intelEarned?{label:`COURIER TRACE RECORDED`,detail:`The accepted Dead Relay Hold context can delay its reinforcement by one round. An already-started run keeps its original conditions.`,source:`SERVER_RECEIPT`}:null}function et(e,t,n){if(!n||!e&&!t)return null;let r=e||t;if(r&&!r.victory)return{title:`TRY A DIFFERENT TACTIC`,reason:`Review the mission objective and change your squad or route. No clear reward was recorded.`,missionId:r.missionId};if(e){let t=Xe(n.fieldOps,e.missionId),r=R(t.missionId);return{title:r?.name||`WAR TABLE`,reason:t.reason,missionId:r?.missionId||null}}if(t){let e=n.operations?.[`dead-relay`],t=[`dead-relay-courier`,`dead-relay-hold`,`dead-relay-guardian`].find(t=>e?.missions[t]===`available`);return t?{title:R(t)?.name||`NEXT CAMPAIGN MISSION`,reason:`Continue the server-unlocked Dead Relay campaign.`,missionId:t}:{title:`WAR TABLE`,reason:`Campaign progress is recorded. Explore available Field Ops or replay to practice; no additional reward is promised.`,missionId:null}}return null}function tt(e,t,n){return e&&t&&n&&e.runId===t&&e.missionId===n?e:null}function nt(e,t){return t?e.map(e=>e.defId===`ally-02`?{...e,unitDef:{...I[`ally-02`],move:t===`A`?3:2,skillIds:t===`A`?[`u02-shot`,`u02-lunge-vanguard`,`u02-suppress`]:[`u02-shot`,`u02-burst`,`u02-pressure-disruptor`]}}:e):e}var rt={"ally-02":{name:`CNC`,trained:{name:`REACH CONTROL`,copy:`PRESSURE reaches 1 cell farther, including DISRUPTOR.`,effect:{slot:`A3`,range:1}},options:{A:{name:`RELENTLESS`,copy:`PRESSURE recharges 1 personal turn sooner.`,effect:{slot:`A3`,cooldown:-1}},B:{name:`PIN DOWN`,copy:`PRESSURE debuffs last 1 personal turn longer.`,effect:{slot:`A3`,statusDuration:1}}}},"ally-03":{name:`SHADOW`,trained:{name:`WIDE SHELTER`,copy:`PACK SUPPORT reaches allies 1 cell farther, including WARDEN.`,effect:{slot:`A3`,radius:1}},options:{A:{name:`STEADY HAND`,copy:`MEND recharges 1 personal turn sooner, including RESTORER.`,effect:{slot:`A2`,cooldown:-1}},B:{name:`SILENT SHELTER`,copy:`PACK SUPPORT keeps its protection but removes healing and ignores Disrupted Support's extra cooldown. MEND still counts as healing.`,effect:{slot:`A3`,noHealing:!0,ignoreDisruption:!0}}}},PET:{name:`PET`,trained:{name:`RELAY SCOUT`,copy:`RECOVER works from 2 cells away. Signal windows still apply.`,effect:{recoverRange:2}},options:{A:{name:`REACHING SNARE`,copy:`HAMSTRING reaches 1 cell farther; control a nearby threat without leaving your position.`,effect:{slot:`A2`,range:1}},B:{name:`PATHFINDER`,copy:`Move 1 extra cell per personal turn to reach objectives or regroup with SHADOW.`,effect:{move:1}}}}},it=e=>{let t=e.startsWith(`pet:`)?`PET`:e;return Object.hasOwn(rt,t)?rt[t]:void 0},at=(e,t)=>e?.[t]||{progress:0,stage:1,unlockedOptions:[],selected:null};function ot(e){if(!e||typeof e!=`object`)return{};let t={};for(let[n,r]of Object.entries(e)){if(!it(n)||!r||typeof r!=`object`)continue;let e=r,i=Number.isInteger(e.progress)&&e.progress>=0?Math.min(8,e.progress):0,a=i>=8?3:i>=3?2:1;t[n]={progress:i,stage:a,unlockedOptions:a===3?[`A`,`B`]:[],selected:a===3?e.selected===`B`?`B`:`A`:null}}return t}function st(e,t){return e.map(e=>{let n=it(e.id),r=at(t,e.id);if(!n||r.stage<2)return e;let i=structuredClone(e.unitDef||I[e.defId]);i.combatMastery={progress:r.progress,stage:r.stage,selected:r.selected};let a=[n.trained,...r.stage>=3&&r.selected?[n.options[r.selected]]:[]];for(let{effect:e}of a)e.move&&(i.move+=e.move),e.recoverRange&&(i.recoverRange=e.recoverRange);return i.skillIds=i.skillIds.map(e=>{let t=k[e],i=a.filter(({effect:e})=>e.slot===t.slot);if(!i.length)return e;let o=`${e}:mastery:${n.name}:${r.stage}:${r.selected||`none`}`;if(!k[o]){let e=structuredClone(t);e.id=o;for(let{name:t,copy:n,effect:r}of i){e.maxRange+=r.range||0,e.radius+=r.radius||0,e.cooldownMax=Math.max(0,e.cooldownMax+(r.cooldown||0)),r.noHealing&&(e.effects=e.effects.filter(e=>e.kind!==`heal`)),r.ignoreDisruption&&(e.ignoreDisruption=!0);for(let t of e.effects)t.kind===`status`&&t.duration&&(t.duration+=r.statusDuration||0);e.desc+=` Mastery / ${t}: ${n}`}k[o]=e}return o}),{...e,unitDef:i}})}function ct(e,t){return[e?.fieldOps?.activeMissionRun,e?.chapterActiveMission,...Object.values(e?.operations||{}).map(e=>e.activeMissionRun)].some(e=>e?.squadIds.includes(t))}function lt(e,t){return t?e.map(e=>e.defId===`ally-03`?{...e,unitDef:{...I[`ally-03`],skillIds:t===`A`?[`u03-tap`,`u03-mend-restorer`,`u03-pack`]:[`u03-tap`,`u03-mend`,`u03-pack-warden`]}}:e):e}function ut(e,t){return st(lt(nt(e,t.kodaSidegrade),t.shadowSidegrade),t.packMastery)}function dt(e,t){return e.startsWith(`pet:`)?!t||e!==`pet:${t.id}`?null:{id:e,defId:e,c:0,r:0,unitDef:P(t)}:e!==`ally-02`&&e!==`ally-03`?null:{id:e,defId:e,c:0,r:0}}function ft(e,t,n){let r=dt(e,n);if(!r)return null;let i=ut([r],t)[0];return i.unitDef||I[i.defId]||null}function pt(e){return e.effects.map(e=>[e.kind,e.status||``,e.on||``,e.duration||0,e.value||0,e.base||0,e.scale||0,e.multiplier||0].join(`:`)).sort()}function mt(e){let t=new Map;for(let n of e.effects){let e=n.kind===`status`?`STATUS ${n.status}`:n.kind.toUpperCase(),r=n.kind===`status`?`${n.duration||0}T / ${Math.round((n.value||0)*100)}%`:n.kind===`damage`?`${n.multiplier??0}x`:`${n.base??0} + ${n.scale??0}x`;t.set(e,r)}return t}function ht(e,t){let n=`${t.slot} ${t.name}`,r=[],i=(e,t,i)=>{t!==i&&r.push(`${n} · ${e} ${t} → ${i}`)};i(`RANGE`,e.maxRange,t.maxRange),i(`RADIUS`,e.radius,t.radius),i(`COOLDOWN`,e.cooldownMax,t.cooldownMax),e.targetType!==t.targetType&&r.push(`${n} · TARGET ${e.targetType} → ${t.targetType}`),e.ignoreDisruption!==t.ignoreDisruption&&r.push(`${n} · IGNORE DISRUPTION ${e.ignoreDisruption===!0?`YES`:`NO`} → ${t.ignoreDisruption===!0?`YES`:`NO`}`);let a=mt(e),o=mt(t);for(let e of new Set([...a.keys(),...o.keys()]))a.get(e)!==o.get(e)&&r.push(`${n} · ${e} ${a.get(e)||`NONE`} → ${o.get(e)||`NONE`}`);return!r.length&&pt(e).join(`|`)!==pt(t).join(`|`)&&r.push(`${n} · EFFECT COMPOSITION CHANGED`),r}function gt(e,t,n){let r=[];e.move!==t.move&&r.push(`MOVE ${e.move} → ${t.move}`),(e.recoverRange||1)!==(t.recoverRange||1)&&r.push(`RECOVER RANGE ${e.recoverRange||1} → ${t.recoverRange||1}`);let i=D(n,t.defId);for(let n of t.skillIds){let t=E(A(n),i),a=e.skillIds.find(e=>A(e).slot===t.slot);a&&r.push(...ht(E(A(a),i),t))}return r}function _t(e,t,n){let r=e===`ally-02`?t.kodaSidegrade:t.shadowSidegrade;if(!r)return null;let i=ft(e,e===`ally-02`?{...t,kodaSidegrade:null}:{...t,shadowSidegrade:null}),a=ft(e,t);if(!i||!a)return null;let o=gt(i,a,n);return o.length?{subject:e===`ally-02`?`CNC`:`SHADOW`,comparison:`BASE → ${e===`ally-02`?r===`A`?`VANGUARD`:`DISRUPTOR`:r===`A`?`RESTORER`:`WARDEN`}`,changes:o,source:`SAVED_PROGRESSION`}:null}function vt(e){return e.stage>=3&&e.selected?{progress:3,stage:2,selected:null,unlockedOptions:[]}:{progress:0,stage:1,selected:null,unlockedOptions:[]}}function yt(e,t,n,r){let i=t.packMastery?.[e];if(!i||i.stage<2||i.stage>=3&&!i.selected)return null;let a=ft(e,{...t,packMastery:{...t.packMastery,[e]:vt(i)}},n),o=ft(e,t,n);if(!a||!o)return null;let s=gt(a,o,r);return s.length?{subject:e===`ally-02`?`CNC`:e===`ally-03`?`SHADOW`:`PET`,comparison:i.stage===2?`BASE → TRAINED`:`TRAINED → SAVED SIGNATURE`,changes:s,source:`SAVED_PROGRESSION`}:null}function bt(e,t,n,r){let i=t.packMastery?.[e];if(!i||i.stage!==3||!i.selected)return[];let a={...t,packMastery:{...t.packMastery,[e]:{...i,selected:i.selected===`A`?`B`:`A`}}},o=ft(e,t,n),s=ft(e,a,n);return o&&s?gt(o,s,r):[]}function xt(e,t){return{runId:e,missionId:t,moments:[]}}var St=e=>e.defId.startsWith(`pet:`),Ct=(e,t)=>e===t||e.startsWith(t+`:mastery:`);function wt(e,t){return e.moments.some(e=>e.kind===t.kind&&e.unitTurn===t.unitTurn)?e:{...e,moments:[...e.moments.slice(-23),t]}}function Tt(e,t,n,r,i,a,o){if(!e||o.outcome!==`ongoing`||t.defeated||t.team!==`ally`||!i.length)return e;let s=!!(r&&o.units.some(e=>e.id===r&&e.team===`enemy`)&&i.some(e=>e.type===`status`&&e.unitId===r)),c=t.defId===`ally-03`&&Ct(n,`u03-pack`)||t.defId===`ally-03`&&Ct(n,`u03-pack-warden`),l=i.some(e=>e.type===`status`&&o.units.some(t=>t.id===e.unitId&&t.team===`ally`)),u=e;return t.defId===`ally-02`&&(Ct(n,`u02-suppress`)||Ct(n,`u02-pressure-disruptor`))&&s&&(u=wt(u,{kind:`CNC_CONTROL`,unitTurn:o.unitTurn,detail:`CNC applied a control status to an enemy.`}),a&&(u=wt(u,{kind:`CNC_INTERRUPT`,unitTurn:o.unitTurn,detail:`CNC canceled a locked enemy intent with confirmed control.`}))),c&&l&&(u=wt(u,{kind:`SHADOW_COVER`,unitTurn:o.unitTurn,detail:`SHADOW applied protection to an ally.`})),St(t)&&Ct(n,`pet-hamstring`)&&s&&(u=wt(u,{kind:`PET_SLOW`,unitTurn:o.unitTurn,detail:`PET applied HAMSTRING to an enemy.`}),r===`courier`&&o.objective?.type===`INTERCEPT`&&(u=wt(u,{kind:`PET_COURIER_SLOW`,unitTurn:o.unitTurn,detail:`PET slowed the mission courier with HAMSTRING.`}))),u}function Et(e,t,n){if(!e||t.objective?.type!==`HOLD`||n.objective?.type!==`HOLD`||n.objective.progress<=t.objective.progress||!n.objective.terminal)return e;let r=n.objective;return n.units.some(e=>e.team===`ally`&&!e.defeated&&Math.max(Math.abs(e.c-r.terminal.c),Math.abs(e.r-r.terminal.r))<=(r.radius??0)&&e.statuses.some(e=>(e.source===`ally-03`||e.source.startsWith(`u03-pack`))&&(e.type===`GUARD`||e.type===`DEF_UP`)&&e.duration>0))?wt(e,{kind:`SHADOW_HOLD`,unitTurn:n.unitTurn,detail:`Relay control advanced to ${r.progress}/${r.duration} while SHADOW's protection covered the holder.`}):e}function Dt(e,t,n){if(!e)return[];let r=[];return t.includes(`ally-02`)&&n&&r.push({id:`cnc`,title:`CNC · COUNTER SPECIALIST`,instruction:`Use Disruptor PRESSURE on an announced, locked threat before it resolves.`,requirement:`Requires CNC Disruptor and a real VNext enemy intent. No bonus currency.`}),t.includes(`ally-03`)&&e.objectiveType===`HOLD`&&r.push({id:`shadow`,title:`SHADOW · RELAY GUARDIAN`,instruction:`Advance HOLD while an ally controlling the relay has SHADOW's active protection.`,requirement:`Enemy contesting resets progress. No bonus currency.`}),t.some(e=>e.startsWith(`pet:`))&&e.objectiveType===`INTERCEPT`&&r.push({id:`pet`,title:`PET · COURIER HUNTER`,instruction:`Apply HAMSTRING to the courier, then win the intercept objective.`,requirement:`PET is one possible approach; CNC or positioning can also stop the courier.`}),t.includes(`ally-03`)&&(t.includes(`ally-02`)||t.some(e=>e.startsWith(`pet:`)))&&r.push({id:`synergy`,title:`PACK · CHAIN REACTION`,instruction:`Win after CNC control → SHADOW cover, OR PET HAMSTRING → SHADOW cover.`,requirement:`Two legal routes. PET is optional; ability use must be confirmed by the engine.`}),r}function Ot(e,t,n){return e.some(r=>r.kind===t&&e.some(e=>e.kind===n&&e.unitTurn>r.unitTurn))}function kt(e,t,n,r){if(!e||e.runId!==t||!n)return[];let i=new Set(e.moments.map(e=>e.kind)),a=new Set(r.map(e=>e.id)),o=[];if(a.has(`cnc`)&&i.has(`CNC_INTERRUPT`)&&o.push({id:`cnc`,title:`COUNTER SPECIALIST`,evidence:`An enemy's locked attack was genuinely canceled by CNC.`}),a.has(`shadow`)&&i.has(`SHADOW_HOLD`)&&o.push({id:`shadow`,title:`RELAY GUARDIAN`,evidence:`HOLD progress advanced while SHADOW's protection covered the relay holder.`}),a.has(`pet`)&&i.has(`PET_COURIER_SLOW`)&&o.push({id:`pet`,title:`COURIER HUNTER`,evidence:`PET HAMSTRING affected the courier during the won intercept.`}),a.has(`synergy`)){let t=Ot(e.moments,`CNC_CONTROL`,`SHADOW_COVER`),n=Ot(e.moments,`PET_SLOW`,`SHADOW_COVER`);(t||n)&&o.push({id:`synergy`,title:`CHAIN REACTION`,evidence:t?`CNC control → SHADOW protection → objective won.`:`PET HAMSTRING → SHADOW protection → objective won.`})}return o}function At(e,t){if(!e||e.runId!==t)return null;for(let t of[`CNC_INTERRUPT`,`SHADOW_HOLD`,`PET_COURIER_SLOW`,`SHADOW_COVER`,`CNC_CONTROL`,`PET_SLOW`]){let n=e.moments.find(e=>e.kind===t);if(n)return n}return null}function jt(){if(typeof window>`u`)return null;let e=window.FirstSessionSpine;return!e||typeof e.view!=`function`||typeof e.subscribe!=`function`||typeof e.acknowledge!=`function`?null:e}function Mt(){let e=jt();return e?{view(){return{result:e.view()?.result??void 0}},subscribe(t){let n=e.subscribe(t);return typeof n==`function`?n:()=>void 0},acknowledge(t){return e.acknowledge(t)===!0}}:null}var Nt=e=>e.replace(/([a-z0-9])([A-Z])/g,`$1-$2`).toLowerCase(),Pt=e=>e.replace(/^([A-Z])|[\s-_]+(\w)/g,(e,t,n)=>n?n.toUpperCase():t.toLowerCase()),Ft=e=>{let t=Pt(e);return t.charAt(0).toUpperCase()+t.slice(1)},It=(...e)=>e.filter((e,t,n)=>!!e&&e.trim()!==``&&n.indexOf(e)===t).join(` `).trim(),Lt=e=>{for(let t in e)if(t.startsWith(`aria-`)||t===`role`||t===`title`)return!0},Rt={xmlns:`http://www.w3.org/2000/svg`,width:24,height:24,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:2,strokeLinecap:`round`,strokeLinejoin:`round`},zt=(0,y.forwardRef)(({color:e=`currentColor`,size:t=24,strokeWidth:n=2,absoluteStrokeWidth:r,className:i=``,children:a,iconNode:o,...s},c)=>(0,y.createElement)(`svg`,{ref:c,...Rt,width:t,height:t,stroke:e,strokeWidth:r?Number(n)*24/Number(t):n,className:It(`lucide`,i),...!a&&!Lt(s)&&{"aria-hidden":`true`},...s},[...o.map(([e,t])=>(0,y.createElement)(e,t)),...Array.isArray(a)?a:[a]])),Bt=(e,t)=>{let n=(0,y.forwardRef)(({className:n,...r},i)=>(0,y.createElement)(zt,{ref:i,iconNode:t,className:It(`lucide-${Nt(Ft(e))}`,`lucide-${e}`,n),...r}));return n.displayName=Ft(e),n},Vt=Bt(`axe`,[[`path`,{d:`m14 12-8.381 8.38a1 1 0 0 1-3.001-3L11 9`,key:`5z9253`}],[`path`,{d:`M15 15.5a.5.5 0 0 0 .5.5A6.5 6.5 0 0 0 22 9.5a.5.5 0 0 0-.5-.5h-1.672a2 2 0 0 1-1.414-.586l-5.062-5.062a1.205 1.205 0 0 0-1.704 0L9.352 5.648a1.205 1.205 0 0 0 0 1.704l5.062 5.062A2 2 0 0 1 15 13.828z`,key:`19zklq`}]]),Ht=Bt(`chevron-right`,[[`path`,{d:`m9 18 6-6-6-6`,key:`mthhwq`}]]),Ut=Bt(`chevrons-right`,[[`path`,{d:`m6 17 5-5-5-5`,key:`xnjwq`}],[`path`,{d:`m13 17 5-5-5-5`,key:`17xmmf`}]]),Wt=Bt(`crosshair`,[[`circle`,{cx:`12`,cy:`12`,r:`10`,key:`1mglay`}],[`line`,{x1:`22`,x2:`18`,y1:`12`,y2:`12`,key:`l9bcsi`}],[`line`,{x1:`6`,x2:`2`,y1:`12`,y2:`12`,key:`13hhkx`}],[`line`,{x1:`12`,x2:`12`,y1:`6`,y2:`2`,key:`10w3f3`}],[`line`,{x1:`12`,x2:`12`,y1:`22`,y2:`18`,key:`15g9kq`}]]),Gt=Bt(`heart-pulse`,[[`path`,{d:`M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z`,key:`c3ymky`}],[`path`,{d:`M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27`,key:`1uw2ng`}]]),Kt=Bt(`paw-print`,[[`circle`,{cx:`11`,cy:`4`,r:`2`,key:`vol9p0`}],[`circle`,{cx:`18`,cy:`8`,r:`2`,key:`17gozi`}],[`circle`,{cx:`20`,cy:`16`,r:`2`,key:`1v9bxh`}],[`path`,{d:`M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z`,key:`1ydw1z`}]]),qt=Bt(`rotate-ccw`,[[`path`,{d:`M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8`,key:`1357e3`}],[`path`,{d:`M3 3v5h5`,key:`1xhq8a`}]]),Jt=Bt(`shield`,[[`path`,{d:`M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z`,key:`oel41y`}]]),Yt=Bt(`slash`,[[`path`,{d:`M22 2 2 22`,key:`y4kqgn`}]]),Xt=Bt(`swords`,[[`polyline`,{points:`14.5 17.5 3 6 3 3 6 3 17.5 14.5`,key:`1hfsw2`}],[`line`,{x1:`13`,x2:`19`,y1:`19`,y2:`13`,key:`1vrmhu`}],[`line`,{x1:`16`,x2:`20`,y1:`16`,y2:`20`,key:`1bron3`}],[`line`,{x1:`19`,x2:`21`,y1:`21`,y2:`19`,key:`13pww6`}],[`polyline`,{points:`14.5 6.5 18 3 21 3 21 6 17.5 9.5`,key:`hbey2j`}],[`line`,{x1:`5`,x2:`9`,y1:`14`,y2:`18`,key:`1hf58s`}],[`line`,{x1:`7`,x2:`4`,y1:`17`,y2:`20`,key:`pidxm4`}],[`line`,{x1:`3`,x2:`5`,y1:`19`,y2:`21`,key:`1pehsh`}]]),Zt=Bt(`target`,[[`circle`,{cx:`12`,cy:`12`,r:`10`,key:`1mglay`}],[`circle`,{cx:`12`,cy:`12`,r:`6`,key:`1vlfrh`}],[`circle`,{cx:`12`,cy:`12`,r:`2`,key:`1c9p78`}]]),Qt=Bt(`volume-2`,[[`path`,{d:`M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z`,key:`uqj9uw`}],[`path`,{d:`M16 9a5 5 0 0 1 0 6`,key:`1q6k2b`}],[`path`,{d:`M19.364 18.364a9 9 0 0 0 0-12.728`,key:`ijwkga`}]]),$t=Bt(`volume-x`,[[`path`,{d:`M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z`,key:`uqj9uw`}],[`line`,{x1:`22`,x2:`16`,y1:`9`,y2:`15`,key:`1ewh16`}],[`line`,{x1:`16`,x2:`22`,y1:`9`,y2:`15`,key:`5ykzw1`}]]);function en(e,t){let n=Object.keys(S).find(t=>S[t].includes(e));return A(n&&(ut([{id:n,defId:n,c:0,r:0}],t||{})[0].unitDef||I[n]).skillIds.find(t=>T(t)===e)||e)}function tn(e,t){let n=[],r=(e,t,r)=>{t!==r&&n.push(`${e} ${t} → ${r}`)};t.targetType===`ALLY_AOE`?r(`RADIUS`,e.radius,t.radius):r(`RANGE`,e.maxRange,t.maxRange),r(`COOLDOWN`,e.cooldownMax,t.cooldownMax);for(let i of t.effects){let t=e.effects.find(e=>e.kind===i.kind&&e.status===i.status&&e.on===i.on);i.kind===`status`&&JSON.stringify(t)!==JSON.stringify(i)&&n.push(`${i.status} ${t?.duration??0} → ${i.duration} TURNS${i.maxHpRatio?` · ≤${i.maxHpRatio*100}% HP before healing`:``}`),i.kind===`heal`&&r(`HEAL BASE`,t?.base??0,i.base??0)}return n}function nn(e,t,n,r){let i={...t,discipline:t.discipline||r};return tn(E(e,i),E(e,{...i,ranks:{...i.ranks,[T(e.id)]:n}}))}function rn(e,t){return D(e,t)}var an={vanguard:`HOLD / SURVIVE: keep the holder inside HOWL. Gives up HOWLKEEPER's extra aura cell.`,howlkeeper:`INTERCEPT: buff a spread-out pursuit squad. Gives up VANGUARD's added GUARD.`,pursuer:`INTERCEPT: THRUST a courier from one extra cell. Gives up DISRUPTOR's longer control.`,disruptor:`BOSS / HOLD: keep PRESSURE debuffs active. Locked-intent cancellation requires this doctrine and an announced interruptible threat. Gives up PURSUER's THRUST reach.`,sentinel:`HOLD / SURVIVE: protect the relay holder with PACK SUPPORT. Gives up MEDIC's faster MEND.`,medic:`RECOVER / BOSS: heal a hurt ally before the next hit. Gives up SENTINEL's PACK GUARD benefit.`},on=e=>{let t,n=new Set,r=(e,r)=>{let i=typeof e==`function`?e(t):e;if(!Object.is(i,t)){let e=t;t=r??(typeof i!=`object`||!i)?i:Object.assign({},t,i),n.forEach(n=>n(t,e))}},i=()=>t,a={setState:r,getState:i,getInitialState:()=>o,subscribe:e=>(n.add(e),()=>n.delete(e))},o=t=e(r,i,a);return a},sn=e=>e?on(e):on,cn=e=>e;function ln(e,t=cn){let n=y.useSyncExternalStore(e.subscribe,()=>t(e.getState()),()=>t(e.getInitialState()));return y.useDebugValue(n),n}var un=e=>{let t=sn(e),n=e=>ln(t,e);return Object.assign(n,t),n},dn=e=>e?un(e):un,fn=`ah_tactical_battlefield_lab_v1`,pn=(()=>{if(typeof window>`u`)return!1;try{return new URLSearchParams(window.location.search).get(`tacticalBattlefieldVNext`)===`1`||window.localStorage.getItem(fn)===`10x7`}catch{return!1}})(),z=pn?10:8,mn=pn?7:5;function hn(e){pn=e?.rulesetVersion===`tactical-intent-vnext.0`,z=pn?10:8,mn=pn?7:5}var gn=100,_n=50,vn=1;function yn(){vn=1}function bn(e,t){return e.statuses.find(e=>e.type===t)}function xn(e,t,n,r,i){let a=e.statuses.find(e=>e.type===t);if(a){let t={...a,source:n,duration:Math.max(a.duration,r),value:i};return{unit:{...e,statuses:e.statuses.map(e=>e.id===a.id?t:e)},applied:t,refreshed:!0}}let o={id:`st-${vn++}`,type:t,source:n,duration:r,value:i};return{unit:{...e,statuses:[...e.statuses,o]},applied:o,refreshed:!1}}function Sn(e,t,n){let r=bn(e,t),i=bn(e,n),a=1;return r&&(a+=r.value),i&&(a-=i.value),Math.max(.4,a)}function Cn(e){return Math.max(1,Math.round(e.atk*Sn(e,`ATK_UP`,`ATK_DOWN`)))}function wn(e){return Math.max(0,Math.round(e.def*Sn(e,`DEF_UP`,`DEF_DOWN`)))}function Tn(e){return Math.max(1,Math.round(e.spd*Sn(e,`SPD_UP`,`SPD_DOWN`)))}function En(e){let t=bn(e,`GUARD`);return t?1-(t.guardReduction??.5):1}var Dn={ATK_UP:`ATK UP`,DEF_UP:`DEF UP`,SPD_UP:`SPD UP`,GUARD:`GUARD`,BLEED:`BLEED`,ATK_DOWN:`ATK DOWN`,DEF_DOWN:`DEF DOWN`,SPD_DOWN:`SPD DOWN`},On={ATK_UP:`ATK+`,DEF_UP:`DEF+`,SPD_UP:`SPD+`,GUARD:`GRD`,BLEED:`BLD`,ATK_DOWN:`ATK-`,DEF_DOWN:`DEF-`,SPD_DOWN:`SPD-`};function kn(e,t,n){let r=e*t,i=wn(n),a=i/(i+50);return Math.max(1,Math.round(r*(1-a)))}function An(e,t,n,r){let i=Math.round(e+n*t);return Math.max(0,Math.min(i,r.maxHp-r.hp))}function jn(e,t){return e>=0&&e<z&&t>=0&&t<mn}function Mn(e,t){return Math.max(Math.abs(e.c-t.c),Math.abs(e.r-t.r))}function Nn(e,t){return`${e},${t}`}function Pn(e,t){let n=new Set;for(let r of e)r.defeated||t&&r.id===t||n.add(Nn(r.c,r.r));return n}function Fn(e,t,n){return e.find(e=>!e.defeated&&e.c===t&&e.r===n)}function In(e,t){let n=[];for(let[r,i]of[[1,0],[-1,0],[0,1],[0,-1]]){let a=e+r,o=t+i;jn(a,o)&&n.push({c:a,r:o})}return n}function Ln(e,t,n=e.move){if(n<=0)return[];let r=Pn(t,e.id),i=new Set([Nn(e.c,e.r)]),a=[],o=[{c:e.c,r:e.r,d:0}];for(;o.length;){let e=o.shift();if(e.d!==n)for(let t of In(e.c,e.r)){let n=Nn(t.c,t.r);i.has(n)||r.has(n)||(i.add(n),a.push(t),o.push({...t,d:e.d+1}))}}return a}function Rn(e,t,n,r){return jn(t,n)&&!Pn(e,r).has(Nn(t,n))}function zn(e,t){let n=t/(mn-1),r=26+n*52,i=34+n*8,a=e/(z-1);return{x:50-i+i*2*a,y:r}}function Bn(e,t,n){let r=Mn(e,t);return r>=n.minRange&&r<=n.maxRange}function Vn(e,t){return e.filter(e=>!e.defeated&&(!t||e.team===t))}function Hn(e,t,n,r){return Vn(e,r).filter(e=>Mn(e,t)<=n)}function Un(e,t,n,r,i){switch(n.targetType){case`SELF`:return t.defeated?[]:[t];case`ALLY_SINGLE`:{let i=e.find(e=>e.id===r);return!i||i.defeated||i.team!==t.team||!Bn(t,i,n)?[]:[i]}case`ENEMY_SINGLE`:{let i=e.find(e=>e.id===r);return!i||i.defeated||i.team===t.team||!Bn(t,i,n)?[]:[i]}case`ALLY_AOE`:return Hn(e,{c:t.c,r:t.r},n.radius,t.team);case`ENEMY_AOE`:return Hn(e,{c:t.c,r:t.r},n.radius,t.team===`ally`?`enemy`:`ally`);case`AREA_RADIUS`:{let a=null;if(i&&jn(i.c,i.r))a=i;else if(r){let t=e.find(e=>e.id===r);t&&(a={c:t.c,r:t.r})}if(!a||!Bn(t,a,n))return[];let o=t.team===`ally`?`enemy`:`ally`;return Hn(e,a,n.radius,o)}default:return[]}}function Wn(e,t,n){switch(n.targetType){case`SELF`:case`ALLY_AOE`:case`ENEMY_AOE`:return[t.id];case`ALLY_SINGLE`:return Vn(e,t.team).filter(e=>Bn(t,e,n)).map(e=>e.id);case`ENEMY_SINGLE`:return Vn(e,t.team===`ally`?`enemy`:`ally`).filter(e=>Bn(t,e,n)).map(e=>e.id);case`AREA_RADIUS`:return Vn(e,t.team===`ally`?`enemy`:`ally`).filter(e=>Bn(t,e,n)).map(e=>e.id);default:return[]}}function Gn(e){return e.targetType===`ALLY_SINGLE`||e.targetType===`ENEMY_SINGLE`||e.targetType===`AREA_RADIUS`}function Kn(e){return e===`SELF`||e===`ALLY_SINGLE`||e===`ENEMY_SINGLE`||e===`ALLY_AOE`||e===`ENEMY_AOE`||e===`AREA_RADIUS`}function qn(e,t){return t.meter===e.meter?Tn(t)-Tn(e)||e.id.localeCompare(t.id):t.meter-e.meter}function Jn(e){let t=e.map(e=>({...e}));for(let e=0;e<400;e++){if(Vn(t).filter(e=>e.meter>=100).length)return t;for(let e of t)e.defeated||(e.meter+=Tn(e))}return t}function Yn(e){let t=Vn(e).filter(e=>e.meter>=100);return t.length?(t.sort(qn),t[0].id):null}function Xn(e){return{...e,meter:Math.max(0,e.meter-100),hasMoved:!1,hasActed:!1}}function Zn(e,t=6){let n=[],r=e.units.map(e=>({...e,statuses:e.statuses.map(e=>({...e})),cooldowns:{...e.cooldowns}}));if(e.activeId){let t=r.find(t=>t.id===e.activeId&&!t.defeated);t&&n.push(t.id)}for(;n.length<t;){r=Jn(r);let e=Yn(r);if(!e)break;n.push(e),r=r.map(t=>t.id===e?Xn(t):t)}return n.slice(0,t)}function Qn(e){return e.skillIds.map(t=>E(A(t),e.growth))}function $n(e,t){return Math.max(0,e.cooldowns[t]??0)}function er(e,t){return $n(e,t.id)<=0}function tr(e,t,n){return e.map(e=>e.id===t?n(e):e)}function nr(e,t,n,r){let i=e.units.find(t=>t.id===e.activeId);if(!i||i.defeated||i.hasActed)return{state:e,events:[],ok:!1,reason:`no-actor`};if(!i.skillIds.includes(t))return{state:e,events:[],ok:!1,reason:`unknown-skill`};let a=E(A(t),i.growth);if(!er(i,a))return{state:e,events:[],ok:!1,reason:`cooldown`};if(Gn(a)&&!n&&!r)return{state:e,events:[],ok:!1,reason:`need-target`};let o=Un(e.units,i,a,n,r);if(Gn(a)&&o.length===0)return{state:e,events:[],ok:!1,reason:`invalid-target`};!Gn(a)&&a.targetType!==`SELF`&&o.length;let s=[],c=E(A(t),i.growth?{...i.growth,ranks:{}}:void 0),l=Un(e.units,i,c,n,r),u=o.filter(e=>!l.some(t=>t.id===e.id)),d=e.units.map(e=>({...e,statuses:e.statuses.map(e=>({...e})),cooldowns:{...e.cooldowns}})),f=e.hostilesEliminated,p=e.damageTaken,m=n?d.find(e=>e.id===n):o[0],h=Cn(i),g=m?(e=>d.find(t=>t.id===e)?.name??e)(m.id):a.targetType===`SELF`?i.name:`squad`;s.push({type:`ticker`,text:`${i.name}  ·  ${a.name}${g&&g!==i.name?`  →  ${g}`:``}`});let _=e=>{if(e===`self`)return[d.find(e=>e.id===i.id)];if(e===`primary`){let e=m?d.find(e=>e.id===m.id):d.find(e=>e.id===i.id);return e?[e]:[]}return e===`aoe_allies`?o.filter(e=>e.team===i.team).map(e=>d.find(t=>t.id===e.id)):e===`aoe_enemies`?o.filter(e=>e.team!==i.team).map(e=>d.find(t=>t.id===e.id)):o.map(e=>d.find(t=>t.id===e.id)).filter(Boolean)};for(let t of a.effects){let n=_(t.on??`hits`).filter(Boolean);for(let r of n){let n=d.find(e=>e.id===r.id);if(!n||n.defeated)continue;let o=e.units.find(e=>e.id===n.id);if(!(t.maxHpRatio!==void 0&&o.hp/o.maxHp>t.maxHpRatio)){if(t.kind===`damage`){let e=kn(h,t.multiplier??1,n),r=e;e=Math.max(1,Math.round(e*En(n)));let i=Math.max(0,n.hp-e),a=i<=0;n.team===`ally`&&(p+=e),a&&n.team===`enemy`&&!n.defeated&&(f+=1),d=tr(d,n.id,e=>({...e,hp:i,defeated:a,statuses:a?[]:e.statuses})),s.push({type:`damage`,unitId:n.id,amount:e,text:`-${e}`,kind:`dmg`,...n.team===`ally`&&r>e?{buildEvidence:`${n.name}: GUARD prevented ${r-e} damage${r>=n.hp&&i>0?`; survived the blow`:``}.`}:{}}),a&&s.push({type:`defeat`,unitId:n.id,text:`DOWN`,kind:`info`})}else if(t.kind===`heal`){let e=An(t.base??0,t.scale??0,h,n);e>0&&(d=tr(d,n.id,t=>({...t,hp:Math.min(t.maxHp,t.hp+e)})),s.push({type:`heal`,unitId:n.id,amount:e,text:`+${e}`,kind:`heal`,...i.team===`ally`?{buildEvidence:`${i.name} ${a.name}: restored ${e} HP to ${n.name}.`}:{}}))}else if(t.kind===`status`&&t.status){let e=t.duration??1,r=t.value??0,o=xn(n,t.status,a.id,e,r);if(t.status===`GUARD`&&i.growth?.rulesVersion===2){let e=n.statuses.find(e=>e.type===`GUARD`),t=Math.max(e?e.guardReduction??.5:0,Math.min(.5,Math.max(0,r)));o.unit={...o.unit,statuses:o.unit.statuses.map(e=>e.type===`GUARD`?{...e,guardReduction:t}:e)}}d=tr(d,n.id,()=>o.unit),s.push({type:`status`,unitId:n.id,text:Dn[t.status],kind:t.status===`GUARD`?`guard`:`status`,...i.team===`ally`&&o.unit.statuses.some(e=>e.source===a.id&&e.type===t.status)?{buildEvidence:`${i.name} ${a.name}: ${Dn[t.status]} applied to ${n.name} (${e} personal turns).`}:{}})}}}}if(i.team===`ally`)for(let e of u)s.some(t=>t.unitId===e.id&&[`damage`,`heal`,`status`].includes(t.type))&&s.push({type:`info`,buildEvidence:`${i.name} ${a.name}: reached ${e.name} beyond the unranked ${a.targetType===`ALLY_AOE`?`radius`:`range`} (${Math.max(Math.abs(i.c-e.c),Math.abs(i.r-e.r))} cells).`});return d=tr(d,i.id,t=>({...t,hasActed:!0,cooldowns:{...t.cooldowns,[a.id]:a.cooldownMax+he(e.directive,i,a)}})),a.cooldownMax>0&&s.push({type:`cooldown`,unitId:i.id,text:a.name}),{state:{...e,healingActions:(e.healingActions||0)+(i.team===`ally`&&a.effects.some(e=>e.kind===`heal`)?1:0),units:d,hostilesEliminated:f,damageTaken:p,actionSkillId:null,mode:`locked`},events:s,ok:!0}}function rr(e,t){return Qn(t).map(n=>{let r=$n(t,n.id),i=r<=0;return{...n,desc:he(e.directive,t,n)?`${n.desc} Disrupted Support: cooldown +${he(e.directive,t,n)}.`:n.desc,ready:i,cd:r,targets:i?Wn(e.units,t,n):[]}})}function ir(e,t){return Vn(t,e.team===`ally`?`enemy`:`ally`)}function ar(e,t){return Vn(t,e.team)}function or(e){let t=0;return e.role===`alpha`&&(t+=40),e.role===`support`&&(t+=12),t+=(1-e.hp/e.maxHp)*30,t+=Cn(e)*.4,t}function sr(e,t,n){let r=n.maxHp>0?n.hp/n.maxHp:1,i=(1-r)*40,a=n.role===`support`?14:0,o=i+a+Cn(n)*.25,s=e.objective;if(!s)return o+(n.role===`alpha`?6:0);if(s.type===`HOLD`&&s.terminal){let e=Math.abs(n.c-s.terminal.c)+Math.abs(n.r-s.terminal.r);return o+(e<=(s.radius??0)?70:0)+Math.max(0,17-e*4)}if(s.type===`RECOVER`){let e=Math.abs(n.c-s.terminal.c)+Math.abs(n.r-s.terminal.r);return o+Math.max(0,50-e*9)}if(s.type===`SURVIVE`)return o+(1-r)*70+a*.5;if(s.type===`INTERCEPT`){let t=e.units.find(e=>e.id===s.targetId&&!e.defeated),r=t?Mn(n,t):9,i=Math.abs(n.c-s.exit.c)+Math.abs(n.r-s.exit.r);return o+Math.max(0,50-r*10)+Math.max(0,12-i*2)}if(s.type===`BOSS`){let r=e.units.find(e=>e.id===s.targetId&&!e.defeated),i=r?Mn(n,r):9;return o+Math.max(0,45-i*8)+(t.role===`leader`&&n.role===`support`?14:0)}return o}function cr(e,t,n,r){if(!t.length)return null;let i=[...t].sort((t,n)=>{if(pn&&r){let i=sr(r,e,t)+(e.archetype===`DISRUPTOR`&&t.role===`support`?35:0);return sr(r,e,n)+(e.archetype===`DISRUPTOR`&&n.role===`support`?35:0)-i||Mn(e,t)-Mn(e,n)||t.id.localeCompare(n.id)}return e.archetype===`DISRUPTOR`?Number(n.role===`support`)-Number(t.role===`support`)||or(n)-or(t):e.archetype===`MARKSMAN`?or(n)-or(t)||Mn(e,n)-Mn(e,t):e.role===`leader`?or(n)-or(t)||t.hp-n.hp:t.hp-n.hp||Mn(e,t)-Mn(e,n)});return(i.filter(t=>Bn(e,t,n))[0]??i[0])||null}function lr(e,t,n,r){if(Bn(e,r,n))return null;let i=Ln(e,t),a=null,o=1e9;for(let t of i){let i=Mn(t,r),s=(i>=n.minRange&&i<=n.maxRange?0:100)+(e.archetype===`MARKSMAN`?Math.abs(i-Math.max(2,n.maxRange-1)):i);s<o&&(o=s,a=t)}return a}function ur(e,t){let n=e.objective;if(n?.type!==`INTERCEPT`||n.targetId!==t.id)return null;let r=new Map,i=e=>`${e.c},${e.r}`,a=new Set(e.units.filter(e=>!e.defeated&&e.id!==t.id).map(i)),o=[{...n.exit,d:0}];r.set(i(n.exit),0);for(let e=0;e<o.length;e++){let t=o[e];for(let[e,n]of[[1,0],[-1,0],[0,1],[0,-1]]){let s={c:t.c+e,r:t.r+n,d:t.d+1};!jn(s.c,s.r)||a.has(i(s))||r.has(i(s))||(r.set(i(s),s.d),o.push(s))}}if(!t.hasMoved){let n=Ln(t,e.units).filter(e=>(r.get(i(e))??1/0)<(r.get(i(t))??1/0));if(n.sort((e,t)=>(r.get(i(e))??1/0)-(r.get(i(t))??1/0)),n[0])return{type:`move`,to:n[0]}}let s=rr(e,t).find(e=>e.ready&&e.slot===`A1`),c=s&&Wn(e.units,t,s)[0];return c?{type:`skill`,skillId:s.id,targetId:c}:{type:`skip`}}function dr(e){let t=e.units.find(t=>t.id===e.activeId);if(!t||t.team!==`enemy`||t.defeated||t.hasMoved)return null;let n=e.objective;if(n?.type!==`HOLD`||t.archetype===`MARKSMAN`||t.archetype===`COURIER`)return null;let r=e=>Math.abs(e.c-n.terminal.c)+Math.abs(e.r-n.terminal.r),i=r(t);if(i<=n.radius)return null;let a=Ln(t,e.units).filter(e=>r(e)<i);if(!a.length)return null;let o=Vn(e.units,`ally`);if(!o.some(e=>r(e)<=n.radius)&&i>t.move+n.radius+1)return null;let s=a.map(e=>{let t=r(e),n=o.reduce((t,n)=>t+ +(Mn(e,n)<=1),0);return{cell:e,score:t*100+n*5+e.c/100+e.r/1e3}}).sort((e,t)=>e.score-t.score)[0]?.cell;return s?{type:`move`,to:s}:null}function fr(e){let t=e.units.find(t=>t.id===e.activeId),n=e.objective;if(!t||t.team!==`enemy`||t.defeated||t.hasMoved||n?.type!==`RECOVER`||t.archetype===`MARKSMAN`||t.archetype===`COURIER`)return null;let r=e=>Math.abs(e.c-n.terminal.c)+Math.abs(e.r-n.terminal.r),i=Vn(e.units,`ally`),a=Math.min(...i.map(r));if(!i.length||a>4)return null;let o=r(t);if(o<=1||o>5)return null;let s=Ln(t,e.units).filter(e=>r(e)<o).sort((e,t)=>r(e)-r(t)||e.c-t.c||e.r-t.r)[0];return s?{type:`move`,to:s}:null}function pr(e){let t=e.units.find(t=>t.id===e.activeId);if(!t||t.team!==`enemy`||t.defeated)return null;if(e.objective?.type===`HOLD`){let n=e.objective;if(Vn(e.units,`ally`).some(e=>Math.abs(e.c-n.terminal.c)+Math.abs(e.r-n.terminal.r)<=n.radius)){let r=rr(e,t).filter(e=>e.ready&&e.targetType===`ENEMY_SINGLE`);for(let i of r){let r=cr(t,Vn(e.units,`ally`).filter(e=>Math.abs(e.c-n.terminal.c)+Math.abs(e.r-n.terminal.r)<=n.radius),i,e);if(r&&Bn(t,r,i))return{type:`skill`,skillId:i.id,targetId:r.id}}}return dr(e)}return e.objective?.type===`RECOVER`?fr(e):null}function mr(e){let t=e.units.find(t=>t.id===e.activeId);if(!t||t.defeated||t.team!==`enemy`)return{type:`skip`};let n=ur(e,t);if(n)return n;if(pn){let t=pr(e);if(t)return t}let r=rr(e,t).filter(e=>e.ready);if(t.archetype===`MARKSMAN`&&!t.hasMoved&&ir(t,e.units).some(e=>Mn(t,e)<=1)){let n=Ln(t,e.units).map(n=>({cell:n,d:Math.min(...ir(t,e.units).map(e=>Mn(n,e)))})).sort((e,t)=>t.d-e.d||e.cell.c-t.cell.c||e.cell.r-t.cell.r);if(n[0]?.d>1)return{type:`move`,to:n[0].cell}}let i=ir(t,e.units);if(!i.length)return{type:`skip`};let a=[...r].sort((e,n)=>{let r={A3:0,A2:1,A1:2}[e.slot]-{A3:0,A2:1,A1:2}[n.slot];return t.role===`leader`&&e.id.includes(`intimidate`)&&n.slot!==`A3`?-1:r});for(let n of a){if(n.targetType===`SELF`||n.targetType===`ALLY_AOE`||n.targetType===`ENEMY_AOE`){if(n.targetType===`ALLY_AOE`&&ar(t,e.units).filter(e=>e.hp<e.maxHp*.85).length===0&&n.effects.every(e=>e.kind!==`damage`))continue;return t.hasMoved,{type:`skill`,skillId:n.id}}let a=cr(t,i,n,e);if(a){if(Bn(t,a,n))return{type:`skill`,skillId:n.id,targetId:a.id};if(!t.hasMoved){let i=lr(t,e.units,n,a);if(i){let e={...t,c:i.c,r:i.r};if(Bn(e,a,n))return{type:`move`,to:i,then:{type:`skill`,skillId:n.id,targetId:a.id}};let o=r.find(e=>e.slot===`A1`)??n;return Bn(e,a,o)?{type:`move`,to:i,then:{type:`skill`,skillId:o.id,targetId:a.id}}:{type:`move`,to:i}}}}}if(!t.hasMoved){let n=[...i].sort((n,r)=>pn?sr(e,t,r)-sr(e,t,n):or(r)-or(n))[0],a=Ln(t,e.units),o=null,s=Mn(t,n);for(let e of a){let t=Mn(e,n);t<s&&(s=t,o=e)}if(o){let n={...t,c:o.c,r:o.r},a=r.find(e=>e.slot===`A1`);if(a){let t=cr(n,i,a,e);if(t&&Bn(n,t,a))return{type:`move`,to:o,then:{type:`skill`,skillId:a.id,targetId:t.id}}}return{type:`move`,to:o}}}return{type:`skip`}}function hr(e,t){let n=e.units.find(t=>t.id===e.activeId);if(!n)return!1;if(t.type===`skip`)return!0;if(t.type===`move`)return Ln(n,e.units).some(e=>e.c===t.to.c&&e.r===t.to.r);if(t.type===`skill`){let r=A(t.skillId);return!n.skillIds.includes(r.id)||!er(n,r)?!1:!Gn(r)||Wn(e.units,n,r).includes(t.targetId??``)}return!1}function gr(e){if(e.team!==`enemy`)return null;if(e.id===`courier`||e.defId===`signal-courier`)return`COURIER`;if(e.role===`leader`||e.id===`leader`)return`COMMANDER`;if(/reinforcement/.test(e.id))return`SKIRMISHER`;let t=e.id.match(/(?:^|[^a-z])h(\d+)(?:$|[^a-z])/i);return[`BULWARK`,`MARKSMAN`,`DISRUPTOR`,`SKIRMISHER`][((t?Number(t[1]):1)-1)%4]}function _r(e,t){return t===`COURIER`?{...e,move:Math.max(e.move,2),skillIds:[`hostile-strike`]}:t===`COMMANDER`?{...e,skillIds:[`leader-strike`,`leader-crush`,`leader-intimidate`]}:t===`BULWARK`?{...e,name:`HOUND BULWARK`,hp:Math.round(e.hp*1.35),def:e.def+5,move:1,skillIds:[`hostile-strike`,`hound-fortify`]}:t===`MARKSMAN`?{...e,name:`HOUND MARKSMAN`,hp:Math.round(e.hp*.88),move:2,skillIds:[`hound-pulse`,`hound-aim`]}:t===`DISRUPTOR`?{...e,name:`HOUND DISRUPTOR`,hp:Math.round(e.hp*.95),skillIds:[`hostile-strike`,`hound-interference`]}:{...e,name:`HOUND SKIRMISHER`,hp:Math.round(e.hp*.85),spd:e.spd+3,move:Math.max(3,e.move),skillIds:[`hostile-strike`,`hostile-maul`]}}function vr(e){return Number.isInteger(e.cols)&&Number.isInteger(e.rows)&&e.cols>=3&&e.rows>=3&&e.cols<=24&&e.rows<=16}function yr(e,t){return t.c>=0&&t.c<e.cols&&t.r>=0&&t.r<e.rows&&Number.isInteger(t.c)&&Number.isInteger(t.r)}function br(e,t,n){if(!vr(t)||!vr(n)||!yr(t,e))throw Error(`invalid topology or source point`);return{c:Math.round(e.c*(n.cols-1)/(t.cols-1)),r:Math.round(e.r*(n.rows-1)/(t.rows-1))}}var xr=`https://res.cloudinary.com/dnjwvxinh/image/upload`;function Sr(){return typeof window>`u`?null:window}function Cr(e){return String(e??``).trim()}function wr(...e){for(let t of e){let e=Cr(t);if(e)return e}return``}function Tr(e){return Cr(e).toLowerCase().replace(/[^\w]+/g,`_`).replace(/^_+|_+$/g,``)}function Er(e){let t=Cr(e),n=t.match(/\/assets\/(skins|equip|items)\/([^/?#]+)/i);return n?`${xr}/f_auto,q_auto/${n[1]}/${n[2]}`:t}function Dr(e){return e?!!(e.startsWith(`blob:`)||e.startsWith(`data:`)||/^https?:\/\//i.test(e)||e.startsWith(`/`)):!1}function Or(e,t){if(!e||typeof e!=`object`)return null;let n=e;if(n.empty===!0)return null;let r=wr(n.item_key,n.itemKey,n.key,n.item),i=wr(n.name,n.label,r);if(!r&&!i)return null;let a=wr(n.icon,n.img,n.image,n.image_path,n.imageUrl,n.url);return{slot:t,key:r||Tr(i),name:i||r,icon:Er(a)||kr(r||i),rarity:wr(n.rarity,`common`)}}function kr(e){let t=Tr(e);return t?`${xr}/f_auto,q_auto/equip/${t}.png`:``}function Ar(e){let t=Tr(e);return t?`${xr}/f_auto,q_auto/skins/${t}.webp`:``}function jr(e){let t=`${e?.key||``} ${e?.name||``}`.toLowerCase();return/axe|cleaver|chop|hatchet/.test(t)?`axe`:/spear|pike|pole|glaive|halberd|lance/.test(t)?`spear`:/staff|rod|scepter|wand|signal/.test(t)?`staff`:/hammer|mace|maul|gavel/.test(t)?`hammer`:/claw|fang|gauntlet|fist|knuckle/.test(t)?`claw`:/blade|sword|saber|omen|edge|fangblade|knife|dagger/.test(t)?`blade`:`melee`}function Mr(e){return e===`melee`?`MELEE KIT`:e.toUpperCase()}function Nr(e,t){if(!e)return null;let n=(Array.isArray(e.slots)?e.slots:[]).find(e=>Tr(e?.slot)===t);if(n)return Or(n,t);let r=e.equippedBySlot||e.equipped||{};if(r&&typeof r==`object`){let e=r[t];if(e)return Or(e,t)}let i=(Array.isArray(e.loadout)?e.loadout:[]).find(e=>Tr(e?.slot)===t);return i?Or(i,t):null}function Pr(){let e=Sr();if(!e)return null;let t=e.Equipped;return t&&t.state&&typeof t.state==`object`?t.state:e.__AH_EQUIPPED_STATE__&&typeof e.__AH_EQUIPPED_STATE__==`object`?e.__AH_EQUIPPED_STATE__:null}function Fr(){let e=Sr();if(!e)return{};let t=e.__PROFILE__||e.PROFILE||e.profileState||e.lastProfile||{};return t&&typeof t==`object`?t:{}}function Ir(){let e=Sr(),t=Fr(),n=``,r=``,i=``;try{let t=e?.document&&e.document.getElementById(`player-skin`);if(t){let e=t;n=wr(e.currentSrc,e.src),r=wr(e.dataset?.skinKey,e.getAttribute?.(`data-skin-key`)),i=wr(e.alt)}}catch{}let a=t.skin;if(typeof a==`string`)n=n||a;else if(a&&typeof a==`object`){let e=a;n=n||wr(e.img,e.url,e.preview_url,e.previewUrl),r=r||wr(e.key,e.skinKey,e.skin_key),i=i||wr(e.name,e.label)}return r=r||wr(t.skinKey,t.skin_key,t.activeSkin?.key),n=n||wr(t.heroImg,t.heroPng,t.character,t.characterPng,t.activeSkin?.img),!n&&r&&(n=`/assets/skins/${Tr(r)}.webp`),i.toLowerCase()===`alpha husky skin`&&(i=``),!i&&r&&(i=r.replace(/[_-]+/g,` `).replace(/\bskin\b/gi,``).trim()),{url:n,key:Tr(r),name:i}}function Lr(){let e=Sr();if(!e)return``;let t=Cr(e.__EquippedCharImgUrl);if(t)return t;try{let t=e.document&&e.document.getElementById(`equipped-character-img`),n=wr(t?.currentSrc,t?.src);if(Dr(n))return n}catch{}return``}function Rr(e){let t=e?.weapon??null,n=e?.armor??null,r=e?.weaponClass||jr(t),i=(e?.skinName||``).trim(),a=t?.name||Mr(r),o=n?.name||``,s=[i,t?.name?t.name:Mr(r)].filter(Boolean);return{unitName:e?.unitName||`ALPHA`,nickname:e?.nickname||``,skinKey:e?.skinKey||``,skinName:i,skinUrl:e?.skinUrl||``,portraitUrl:e?.portraitUrl||`/images/tactical_ops/alpha-portrait.jpg`,spriteUrl:e?.spriteUrl||`/images/tactical_ops/alpha.png`,attackSpriteUrl:e?.attackSpriteUrl||`/images/tactical_ops/alpha-attack.png`,weapon:t,armor:n,weaponClass:r,weaponLabel:a,armorLabel:o,summary:s.join(`  ·  `)||`ALPHA  ·  MELEE KIT`,source:e?.source||`fallback`,live:e?.live===!0}}function zr(){let e=Fr(),t=Pr(),n=Ir(),r=Lr(),i=wr(e.nickname,e.name,e.displayName),a=i?i.toUpperCase():`ALPHA`,o=Nr(t,`weapon`)||Nr(e,`weapon`),s=Nr(t,`armor`)||Nr(e,`armor`),c=Dr(n.url)?Er(n.url):n.key?Ar(n.key):``,l=Dr(c)?c:``,u=Dr(r)?r:``,d=`fallback`,f=ue;u?(f=u,d=`character-image`):l?(f=l,d=`skin`):(o||s)&&(d=`equipped`),d===`fallback`&&(o||s||n.key)&&(d=`equipped`);let p=d!==`fallback`||!!(o||s||n.key||i);return Rr({unitName:a,nickname:i,skinKey:n.key,skinName:n.name||(n.key?n.key.replace(/_+/g,` `):``),skinUrl:c,portraitUrl:f,spriteUrl:ce,attackSpriteUrl:le,weapon:o,armor:s,source:d,live:p})}function Br(e,t){return!t||e.defId!==`alpha`&&e.id!==`alpha`?e:{...e,name:t.unitName||e.name,portrait:t.portraitUrl||e.portrait,sprite:t.spriteUrl||e.sprite,attackSprite:t.attackSpriteUrl||e.attackSprite}}async function Vr(){let e=Sr();if(!e)return!1;if(Pr())return!0;let t=e.apiPost||e.S?.apiPost;try{if(typeof t==`function`){let n=await t(`/webapp/equipped/state`,{}),r=n&&(n.data||n.state||n);if(n&&(n.ok===!0||r?.slots)){e.__AH_EQUIPPED_STATE__=r;let t=e.Equipped;return t&&typeof t==`object`&&!t.state&&(t.state=r),!0}}}catch{}return!1}function Hr(e){let t=Sr();if(e&&t&&(t.__AH_TO_IDENTITY__=e),t&&t.__AH_TO_IDENTITY__)return t.__AH_TO_IDENTITY__;let n=zr();return t&&(t.__AH_TO_IDENTITY__=n),n}var Ur={cols:8,rows:5},Wr={cols:10,rows:7},Gr=e=>pn?br(e,Ur,Wr):{...e};function Kr(e){return{...e,statuses:e.statuses.map(e=>({...e})),cooldowns:{...e.cooldowns}}}function qr(e,t,n,r,i,a){let o=a||I[e];if(!o)throw Error(`Unknown unit def ${e}`);let s=pn?gr({id:t,defId:o.defId,role:o.role,team:o.team}):null,c=s?_r(o,s):o,l={};for(let e of c.skillIds)l[e]=0;let u={id:t,...s?{archetype:s}:{},defId:c.defId,name:c.name,team:c.team,role:c.role,hp:c.hp,maxHp:c.hp,atk:c.atk,def:c.def,spd:c.spd,move:c.move,recoverRange:c.recoverRange,c:n,r,statuses:[],cooldowns:l,meter:0,hasMoved:!1,hasActed:!1,defeated:!1,sprite:c.sprite,attackSprite:c.attackSprite,portrait:c.portrait,skillIds:[...c.skillIds],combatMastery:c.combatMastery?{...c.combatMastery}:void 0};return c.defId===`alpha`&&i?{...Br(u,i),weaponIcon:i.weapon?.icon||``,identitySource:i.source}:u}function Jr(e,t=fe,n=null,r=null,i=null,a=null,o){yn();let s=t.map(e=>({...e,...Gr(e)})),c=new Set;for(let e of s){let t=e.c+`,`+e.r;if(c.has(t))throw Error(`Battlefield spawn collision at `+t);c.add(t)}let l=o?w(o):null,u=s.map(t=>{let n=qr(t.defId,t.id,t.c,t.r,e,t.unitDef),r=n.team===`ally`?D(l,n.defId):void 0;return r?{...n,growth:{...r,ranks:{...r.ranks}}}:n});return{units:u,activeId:null,inspectId:null,actionSkillId:null,mode:`idle`,round:1,unitTurn:0,actionsLeftInRound:Vn(u).length,outcome:`ongoing`,damageTaken:0,healingActions:0,hostilesEliminated:0,results:null,objective:n?(()=>{let e=structuredClone(n);return(e.type===`RECOVER`||e.type===`HOLD`)&&e.terminal&&(e.terminal=Gr(e.terminal)),e.type===`INTERCEPT`&&(e.exit=Gr(e.exit)),e})():null,reinforcement:r?{...r,spawn:{...r.spawn,...Gr(r.spawn)}}:null,signalCarrierId:i,directive:a?structuredClone(a):null,routingTraceAcquired:!1,seed:1}}function Yr(e){return e.filter(e=>e.team===`ally`).length}function Xr(e){if(e.outcome!==`ongoing`)return e;let t=e.signalCarrierId&&!e.routingTraceAcquired&&e.units.find(t=>t.id===e.signalCarrierId)?.defeated===!0&&Vn(e.units,`enemy`).length>0?{...e,routingTraceAcquired:!0}:e,n=Vn(t.units,`ally`),r=Vn(t.units,`enemy`),i=Yr(t.units),a=_e(t);if(t=a.state,a.result){let e=a.result===`victory`,r={victory:e,turns:t.round,hostilesEliminated:t.hostilesEliminated,squadStanding:n.length,squadDeployed:i,damageTaken:t.damageTaken,bonesRecovered:0,objectiveComplete:e};return{...t,outcome:a.result,results:r,mode:`locked`,activeId:null,actionSkillId:null}}if(t.objective?.type===`BOSS`&&t.units.find(e=>e.id===t.objective.targetId)?.defeated||t.objective?.type===`RECOVER`&&t.objective.completed){let e={victory:!0,turns:t.round,hostilesEliminated:t.hostilesEliminated,squadStanding:n.length,squadDeployed:i,damageTaken:t.damageTaken,bonesRecovered:0,objectiveComplete:!0};return{...t,outcome:`victory`,results:e,mode:`locked`,activeId:null,actionSkillId:null}}if(r.length===0&&!t.objective){let e={victory:!0,turns:t.round,hostilesEliminated:t.hostilesEliminated,squadStanding:n.length,squadDeployed:i,damageTaken:t.damageTaken,bonesRecovered:18+t.hostilesEliminated*6};return{...t,outcome:`victory`,results:e,mode:`locked`,activeId:null,actionSkillId:null}}if(n.length===0){let e={victory:!1,turns:t.round,hostilesEliminated:t.hostilesEliminated,squadStanding:0,squadDeployed:i,damageTaken:t.damageTaken,bonesRecovered:0};return{...t,outcome:`defeat`,results:e,mode:`locked`,activeId:null,actionSkillId:null}}return t}function Zr(e){let t={};for(let[n,r]of Object.entries(e.cooldowns))t[n]=Math.max(0,(r??0)-1);return{...e,cooldowns:t}}function Qr(e,t){let n=[],r=e.units.map(Kr),i=e.hostilesEliminated,a=e.damageTaken;r=r.map(e=>{if(e.id!==t||e.defeated)return e;let r=Zr(e),o=[];for(let e of r.statuses){if(e.type===`BLEED`){let t=Math.max(1,Math.round(e.value)),o=Math.max(0,r.hp-t),s=o<=0;if(r.team===`ally`&&(a+=t),s&&r.team===`enemy`&&!r.defeated&&(i+=1),n.push({type:`damage`,unitId:r.id,amount:t,text:`-${t}`,kind:`dmg`}),n.push({type:`ticker`,text:`${r.name}  ·  BLEED`}),s)return n.push({type:`defeat`,unitId:r.id,text:`DOWN`,kind:`info`}),{...r,hp:o,defeated:!0,statuses:[]};r={...r,hp:o}}let t=e.duration-1;t<=0?n.push({type:`expire`,unitId:r.id,text:`${Dn[e.type]} ended`,kind:`info`}):o.push({...e,duration:t})}return{...r,statuses:o,hasMoved:!1,hasActed:!1}});let o={...e,units:r,hostilesEliminated:i,damageTaken:a,activeId:t,inspectId:null,actionSkillId:null,mode:`selected`};o=Xr(o);let s=o.units.find(e=>e.id===t);return(o.outcome!==`ongoing`||!s||s.defeated)&&(o={...o,activeId:s&&!s.defeated?o.activeId:null,mode:`locked`}),{state:o,events:n}}function $r(e){if(e.outcome!==`ongoing`)return{state:e,events:[]};let t=Jn(e.units.map(Kr)),n=Yn(t);if(!n)return{state:e,events:[]};t=t.map(e=>e.id===n?Xn(e):e);let r=e.actionsLeftInRound,i=e.round;r<=0&&(i+=1,r=Math.max(1,Vn(t).length)),--r;let a=Qr({...e,units:t,unitTurn:e.unitTurn+1,round:i,actionsLeftInRound:r,mode:`locked`},n),o=a.state,s=[...a.events],c=o.reinforcement;if(o.outcome===`ongoing`&&c&&!c.spawned&&o.round>=c.triggerRound){let e=c.spawn;if(o.directive?.reinforcement){let t=Array.from({length:z*mn},(e,t)=>({c:t%z,r:Math.floor(t/z)})).filter(e=>Rn(o.units,e.c,e.r)).sort((t,n)=>Math.abs(t.c-e.c)+Math.abs(t.r-e.r)-(Math.abs(n.c-e.c)+Math.abs(n.r-e.r)));if(!t.length)return{state:o,events:s};e={...e,...t[0]}}let t=qr(e.defId,e.id,e.c,e.r);o={...o,units:[...o.units,t],reinforcement:{...c,spawned:!0}},s.push({type:`ticker`,text:`REINFORCEMENT INBOUND · HOUND MK-2`})}let l=o.units.find(e=>e.id===n);return o.outcome===`ongoing`&&(!l||l.defeated)?$r({...o,activeId:null}):{state:o,events:s}}function ei(e,t=fe,n=null,r=null,i=null,a=null,o){return $r(Jr(e,t,n,r,i,a,o))}function ti(e){let t=e.units.find(t=>t.id===e.activeId),n=e.objective;return!n||n.type!==`RECOVER`||n.completed||!t||t.team!==`ally`||t.defeated||t.hasActed?!1:L(e)&&Math.abs(t.c-n.terminal.c)+Math.abs(t.r-n.terminal.r)<=(t.recoverRange||1)}function ni(e){if(!ti(e))return{state:e,events:[],ok:!1};let t=e.units.find(t=>t.id===e.activeId),n=e.units.map(e=>e.id===t.id?{...e,hasActed:!0}:e);return{state:Xr({...e,units:n,objective:{...e.objective,completed:!0},actionSkillId:null,mode:`locked`}),ok:!0,events:[{type:`status`,unitId:t.id,text:`SIGNAL RECOVERED`,kind:`info`},{type:`ticker`,text:`OBJECTIVE COMPLETE · SIGNAL RECOVERED`}]}}function ri(e,t,n){let r=e.units.find(t=>t.id===e.activeId);if(!r||r.defeated||r.hasMoved||r.hasActed||!Rn(e.units,t,n,r.id)||!Ln(r,e.units).some(e=>e.c===t&&e.r===n))return{state:e,events:[],ok:!1};let i=e.units.map(e=>e.id===r.id?{...e,c:t,r:n,hasMoved:!0}:e);return{state:Xr({...e,units:i,inspectId:null}),events:[{type:`move`,unitId:r.id,text:`${r.name}  ·  repositions`},{type:`ticker`,text:`${r.name}  ·  repositions`}],ok:!0}}function ii(e){let t=e.units.find(t=>t.id===e.activeId);if(!t||t.defeated||t.hasActed)return{state:e,events:[],ok:!1};let n=e.units.map(e=>e.id===t.id?{...e,hasActed:!0}:e);return{state:{...e,units:n,actionSkillId:null,mode:`locked`},events:[{type:`ticker`,text:`${t.name}  ·  holds`}],ok:!0}}function ai(e,t,n,r){let i=nr(e,t,n,r);return i.ok?{...i,state:Xr(i.state)}:i}function oi(e,t){if(!hr(e,t)&&t.type!==`skip`){let t=ii(e);return{state:t.state,events:t.events}}let n=[],r=e;if(t.type===`skip`){let e=ii(r);return{state:e.state,events:e.events}}if(t.type===`move`){let e=ri(r,t.to.c,t.to.r);if(e.ok&&(r=e.state,n.push(...e.events)),r.outcome!==`ongoing`)return{state:r,events:n};if(t.then){let e=oi(r,t.then);return{state:e.state,events:[...n,...e.events]}}let i=ii(r);return{state:i.state,events:[...n,...i.events]}}if(t.type===`skill`){let e=ai(r,t.skillId,t.targetId,t.cell);if(e.ok)return{state:e.state,events:[...n,...e.events]};let i=ii(r);return{state:i.state,events:[...n,...i.events]}}return{state:r,events:n}}function si(e){return mr(e)}function ci(e){let t=e.skillIds[0];return t?E(A(t),e.growth).maxRange:1}var li=c({BATTLEFIELD_LAB_KEY:()=>fn,BATTLEFIELD_VNEXT_PREVIEW:()=>pn,DEF_CURVE:()=>50,GRID_COLS:()=>z,GRID_ROWS:()=>mn,METER_MAX:()=>100,STATUS_LABEL:()=>Dn,STATUS_SHORT:()=>On,a1Range:()=>ci,advanceToNext:()=>$r,aiUsesLegalRules:()=>hr,applyAi:()=>oi,applySkill:()=>nr,applyStatus:()=>xn,availableSkills:()=>rr,beginUnitTurn:()=>Qr,canOccupy:()=>Rn,canRecover:()=>ti,cellKey:()=>Nn,chebyshev:()=>Mn,chooseAiAction:()=>mr,computeHeal:()=>An,consumeMeter:()=>Xn,cooldownLeft:()=>$n,createBattle:()=>Jr,effectiveAtk:()=>Cn,effectiveDef:()=>wn,effectiveSpd:()=>Tn,encounterPressureAction:()=>pr,evaluateOutcome:()=>Xr,fieldPercent:()=>zn,hasStatus:()=>bn,inBounds:()=>jn,inSkillRange:()=>Bn,incomingDamageMultiplier:()=>En,isLegalTargetType:()=>Kn,living:()=>Vn,mitigatedDamage:()=>kn,objectiveAwareEnemyAction:()=>dr,objectiveTargetScore:()=>sr,occupiedKeys:()=>Pn,pickReadyId:()=>Yn,planAi:()=>si,previewQueue:()=>Zn,reachableCells:()=>Ln,relayDenialAction:()=>fr,resetStatusSeq:()=>yn,resolveSkillTargets:()=>Un,selectAcceptedBattleRules:()=>hn,skillNeedsTargetPick:()=>Gn,skillReady:()=>er,startBattle:()=>ei,tickUntilReady:()=>Jn,tryMove:()=>ri,tryRecover:()=>ni,trySkill:()=>ai,trySkip:()=>ii,unitAt:()=>Fn,unitSkills:()=>Qn,unitsInRadius:()=>Hn,validTargetIds:()=>Wn}),ui=null,di=!1;function fi(){if(typeof window>`u`)return null;if(!ui){let e=window.AudioContext||window.webkitAudioContext;if(!e)return null;ui=new e}return ui}function pi(){let e=fi();e&&e.state===`suspended`&&e.resume()}function mi(){return di}function hi(e){di=e;try{localStorage.setItem(`tactical-ops-mute`,e?`1`:`0`)}catch{}}function gi(){try{di=localStorage.getItem(`tactical-ops-mute`)===`1`}catch{di=!1}return di}function _i(e,t,n,r=.05,i=0){if(di)return;let a=fi();if(!a)return;let o=a.currentTime+i,s=a.createOscillator(),c=a.createGain();s.type=n,s.frequency.setValueAtTime(e,o),c.gain.setValueAtTime(1e-4,o),c.gain.exponentialRampToValueAtTime(r,o+.012),c.gain.exponentialRampToValueAtTime(1e-4,o+t),s.connect(c),c.connect(a.destination),s.start(o),s.stop(o+t+.02)}function vi(e){switch(e){case`select`:_i(620,.06,`triangle`,.03);break;case`ui`:_i(480,.05,`square`,.02);break;case`move`:_i(220,.08,`sine`,.03);break;case`hit`:_i(140,.1,`sawtooth`,.06),_i(90,.12,`square`,.03,.02);break;case`guard`:_i(360,.1,`triangle`,.04);break;case`heal`:_i(520,.1,`sine`,.04),_i(780,.12,`sine`,.03,.05);break;case`turn`:_i(180,.14,`triangle`,.04),_i(240,.12,`sine`,.03,.08);break;case`win`:_i(440,.16,`triangle`,.05),_i(660,.2,`triangle`,.045,.12);break;case`lose`:_i(160,.22,`sawtooth`,.04),_i(90,.28,`sine`,.04,.1);break;case`status`:_i(400,.08,`triangle`,.03)}}var yi=`tactical-intent-vnext.0`,bi=pn;function xi(e){bi=e?.rulesetVersion===yi}var Si=[`ATTACK`,`AREA`,`JAM`,`ESCAPE`,`REINFORCEMENT`,`CHARGE`],Ci=[`KILL`,`DISRUPT`,`REPOSITION`,`BLOCK`,`PROTECT`,`TRADE`];function wi(e){return Number.isInteger(e.c)&&Number.isInteger(e.r)&&e.c>=0&&e.c<z&&e.r>=0&&e.r<mn}function Ti(e,t){return e.c===t.c&&e.r===t.r}function Ei(e,t){if(!e.id||!e.enemyId||!Si.includes(e.kind)||!e.predictedEffect.trim()||e.warnsOnUnitTurn!==t.unitTurn||!Number.isInteger(e.resolvesOnUnitTurn)||e.resolvesOnUnitTurn<=e.warnsOnUnitTurn||![`CANCEL`,`REANNOUNCE`].includes(e.fallbackPolicy)||!e.responses.length||!e.responses.every(e=>Ci.includes(e))||e.responses.length!==new Set(e.responses).size||!e.impactTiles.length||!e.impactTiles.every(wi)||e.targetTile!==null&&!wi(e.targetTile)||!e.targetUnitId&&!e.targetTile)throw Error(`invalid_tactical_intent`);let n=t.units.find(t=>t.id===e.enemyId);if(!n||n.team!==`enemy`||n.defeated)throw Error(`invalid_tactical_intent_source`);if(e.targetUnitId){let n=t.units.find(t=>t.id===e.targetUnitId);if(!n||n.defeated)throw Error(`invalid_tactical_intent_target`);if(e.targetTile&&!Ti(n,e.targetTile))throw Error(`intent_target_tile_mismatch`)}let r=Object.freeze({...e,targetTile:e.targetTile?Object.freeze({...e.targetTile}):null,impactTiles:Object.freeze(e.impactTiles.map(e=>Object.freeze({...e}))),responses:Object.freeze([...e.responses]),phase:`WINDUP`,rulesetVersion:yi});return{plan:r,event:{type:`threat_announced`,intentId:r.id,enemyId:r.enemyId,unitTurn:t.unitTurn}}}function Di(e,t,n=!1){if(e.rulesetVersion!==`tactical-intent-vnext.0`||t.unitTurn<e.warnsOnUnitTurn)throw Error(`intent_ruleset_or_clock_mismatch`);let r=t.units.find(t=>t.id===e.enemyId),i=e.targetUnitId?t.units.find(t=>t.id===e.targetUnitId):null,a=!r||r.defeated?`SOURCE_DEFEATED`:n?`COUNTERED`:e.targetUnitId&&(!i||i.defeated)?`TARGET_GONE`:i&&e.targetTile&&!Ti(i,e.targetTile)?`TARGET_MOVED`:null;if(a)return{status:`CANCELED`,reason:a,events:[{type:`threat_countered`,intentId:e.id,reason:a,unitTurn:t.unitTurn}]};if(t.unitTurn<e.resolvesOnUnitTurn)return{status:`WAIT`,plan:e,events:[]};if(e.phase===`COMMIT`)throw Error(`intent_already_committed`);return{status:`COMMIT`,plan:Object.freeze({...e,phase:`COMMIT`}),events:[{type:`threat_committed`,intentId:e.id,unitTurn:t.unitTurn}]}}function Oi(e,t,n){if(e.phase!==`COMMIT`||!Number.isInteger(t)||t<e.resolvesOnUnitTurn||n!==!0)throw Error(`unconfirmed_tactical_resolution`);return[{type:`threat_resolved`,intentId:e.id,unitTurn:t,confirmedByEngine:!0}]}function ki(e){if(e==null)return null;if(typeof e!=`object`||Array.isArray(e))throw Error(`invalid_run_rules_contract`);let t=e,n=[`rulesetVersion`,`missionId`,`missionRevision`,`combatProfileVersion`,`masterySnapshotVersion`,`rewardPolicyVersion`,`source`];if(Object.keys(t).length!==n.length||!n.every(e=>Object.prototype.hasOwnProperty.call(t,e)))throw Error(`invalid_run_rules_contract`);if(t.rulesetVersion!==`tactical-intent-vnext.0`||t.source!==`BACKEND_SNAPSHOT`||typeof t.missionId!=`string`||!t.missionId||![`missionRevision`,`combatProfileVersion`,`masterySnapshotVersion`,`rewardPolicyVersion`].every(e=>Number.isSafeInteger(t[e])&&t[e]>=1))throw Error(`unsupported_run_rules_contract`);return Object.freeze({...t})}var Ai={attack:3,defense:3,hp:12,initiative:1};function ji(e,t){if(e.version!==1)return 0;let n=Number(e[t]);return Number.isFinite(n)?Math.max(0,Math.min(Ai[t],Math.floor(n))):0}function Mi(e){let t=e&&typeof e==`object`?e:{};return{version:1,attack:ji(t,`attack`),defense:ji(t,`defense`),hp:ji(t,`hp`),initiative:ji(t,`initiative`)}}var Ni=[`strength`,`agility`,`defense`,`vitality`,`intelligence`,`luck`];function B(e){if(!e||typeof e!=`object`||Array.isArray(e))throw Error(`invalid_combat_profile_v2`);return e}function Pi(e,t){if(Object.keys(e).length!==t.length||!t.every(t=>Object.prototype.hasOwnProperty.call(e,t)))throw Error(`invalid_combat_profile_v2`)}function Fi(e,t,n){if(typeof e!=`number`||!Number.isInteger(e)||e<t||e>n)throw Error(`invalid_combat_profile_v2`);return e}function Ii(e,t=!1){let n=B(e);Pi(n,[...Ni]);let r={};for(let e of Ni)r[e]=Fi(n[e],t?-1e3:0,1e4);return r}function Li(e,t){if(typeof e!=`string`||e.length<1||e.length>t)throw Error(`invalid_combat_profile_v2`);return e}function Ri(e){if(e===void 0)return null;let t=B(e);if(Pi(t,[`version`,`mode`,`alpha`,`pet`]),t.version!==2||t.mode!==`inputs-only`)throw Error(`invalid_combat_profile_v2`);let n=B(t.alpha);Pi(n,[`level`,`base`,`gear`]);let r={level:Fi(n.level,1,1e4),base:Ii(n.base),gear:Ii(n.gear,!0)},i=null;if(t.pet!==null){let e=B(t.pet);Pi(e,[`id`,`name`,`img`,`level`,`effective`]);let n=Li(e.img,2048);if(!n.startsWith(`https://`))throw Error(`invalid_combat_profile_v2`);i={id:Li(e.id,128),name:Li(e.name,128),img:n,level:Fi(e.level,1,1e4),effective:Ii(e.effective)}}return{version:2,mode:`inputs-only`,alpha:r,pet:i}}var zi=[`hp`,`atk`,`def`,`spd`];function Bi(e){if(!e||typeof e!=`object`||Array.isArray(e))throw Error(`invalid_combat_profile_v3`);return e}function Vi(e,t){if(Object.keys(e).length!==t.length||!t.every(t=>Object.prototype.hasOwnProperty.call(e,t)))throw Error(`invalid_combat_profile_v3`)}function Hi(e,t,n){if(typeof e!=`number`||!Number.isInteger(e)||e<t||e>n)throw Error(`invalid_combat_profile_v3`);return e}function Ui(e,t,n){let r={};return zi.forEach((i,a)=>{r[i]=Hi(e[i],t[a],t[a]+n[a])}),r}function Wi(e){if(e===void 0)return null;let t=Bi(e);if(Vi(t,[`version`,`mode`,`alpha`,`pet`]),t.version!==3||t.mode!==`battle-v1`)throw Error(`invalid_combat_profile_v3`);let n=Bi(t.alpha);Vi(n,[...zi]);let r=Ui(n,[120,28,12,14],[18,11,9,2]),i=null;if(t.pet!==null){let e=Bi(t.pet);Vi(e,[`id`,`name`,`img`,...zi]);for(let t of[`id`,`name`,`img`])if(typeof e[t]!=`string`||!e[t].length||e[t].length>(t===`img`?2048:128))throw Error(`invalid_combat_profile_v3`);if(!e.img.startsWith(`https://`))throw Error(`invalid_combat_profile_v3`);i={id:e.id,name:e.name,img:e.img,...Ui(e,[78,18,6,13],[13,7,5,2])}}return{version:3,mode:`battle-v1`,alpha:r,pet:i}}function Gi(e,t,n){if(!t)return e;if(!n||n.pet?.id!==t.pet?.id||n.pet===null!=(t.pet===null))throw Error(`combat_profile_version_mismatch`);let r=0,i=0,a=e.map(e=>{if(e.defId===`alpha`)return r++,{...e,unitDef:{...e.unitDef||I.alpha,...t.alpha}};if(e.defId.startsWith(`pet:`)||e.id.startsWith(`pet:`)){if(i++,!t.pet||e.id!==`pet:${t.pet.id}`||!e.unitDef)throw Error(`combat_pet_mismatch`);let{hp:n,atk:r,def:a,spd:o}=t.pet;return{...e,unitDef:{...e.unitDef,hp:n,atk:r,def:a,spd:o}}}return e});if(r!==1||i>1||i>0&&!t.pet)throw Error(`combat_squad_mismatch`);return a}function Ki(e){"@babel/helpers - typeof";return Ki=typeof Symbol==`function`&&typeof Symbol.iterator==`symbol`?function(e){return typeof e}:function(e){return e&&typeof Symbol==`function`&&e.constructor===Symbol&&e!==Symbol.prototype?`symbol`:typeof e},Ki(e)}function qi(e,t){if(Ki(e)!=`object`||!e)return e;var n=e[Symbol.toPrimitive];if(n!==void 0){var r=n.call(e,t||`default`);if(Ki(r)!=`object`)return r;throw TypeError(`@@toPrimitive must return a primitive value.`)}return(t===`string`?String:Number)(e)}function Ji(e){var t=qi(e,`string`);return Ki(t)==`symbol`?t:t+``}function Yi(e,t,n){return(t=Ji(t))in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function Xi(e){if(!e||typeof e!=`object`)return;let t=e;if(!(!Number.isInteger(t.cycleId)||!Number.isInteger(t.pressure)||t.pressure<0||t.pressure>3||![`standard`,`south`].includes(t.approach)||![1,2,3].includes(t.reportVersion))&&(t.reportVersion!==3||[`standard`,`advanced`].includes(t.directiveTier)&&[`pursuit`,`attrition`].includes(t.directiveSet)))return{cycleId:t.cycleId,pressure:t.pressure,approach:t.approach,reportVersion:t.reportVersion,...t.reportVersion===3?{directiveTier:t.directiveTier,directiveSet:t.directiveSet}:{}}}function Zi(e){if(!e||typeof e!=`object`)return null;let t=e;return typeof t.runId!=`string`||typeof t.missionId!=`string`||typeof t.victory!=`boolean`||typeof t.challengeSuccess!=`boolean`||typeof t.regionalApplied!=`boolean`||![t.cycleId,t.challengeBonus,t.progressEarned,t.progressBefore,t.progressAfter,t.rankBefore,t.rankAfter,t.pressureBefore,t.pressureAfter,t.recordedAt].every(Number.isInteger)||!Array.isArray(t.unlockedApproaches)||!t.unlockedApproaches.every(e=>e===`standard`||e===`south`)?null:{...t,xpGranted:Number.isInteger(t.xpGranted)?Number(t.xpGranted):0,bonesGranted:Number.isInteger(t.bonesGranted)?Number(t.bonesGranted):0}}function Qi(e){try{return w(e)}catch{return null}}function $i(e){let t=Qi(e);if(!t)throw new V(`invalid_growth_snapshot`);return t}function ea(e,t){if(!e||typeof e!=`object`||!Number.isSafeInteger(t)||t<0)return null;let n=e,r=Qi({...n,revision:t});return!r||!Number.isSafeInteger(n.earnedPoints)||Number(n.earnedPoints)<0||!Number.isSafeInteger(n.spentPoints)||Number(n.spentPoints)<0||Number(n.spentPoints)>Number(n.earnedPoints)||!Array.isArray(n.claimedFirstClears)||n.claimedFirstClears.length!==Number(n.earnedPoints)||n.claimedFirstClears.some(e=>typeof e!=`string`)||new Set(n.claimedFirstClears).size!==n.claimedFirstClears.length||r.heroes.some(e=>typeof e.respecUsed!=`boolean`)||r.heroes.reduce((e,t)=>e+Object.values(t.ranks).reduce((e,t)=>e+t,0),0)!==Number(n.spentPoints)?null:{...r,earnedPoints:Number(n.earnedPoints),spentPoints:Number(n.spentPoints),claimedFirstClears:[...n.claimedFirstClears]}}var V=class extends Error{constructor(e,t=null){super(e),Yi(this,`code`,void 0),Yi(this,`state`,void 0),this.code=e,this.state=t}};function ta(){if(typeof window>`u`)return null;let e=window,t=e.apiPost||e.S?.apiPost||e.AH?.apiPost;return typeof t==`function`?t:null}function na(e){if(!e||typeof e!=`object`)return null;let t=e,n=String(t.foundationStage||``);if(![`solo-1`,`solo-2`,`ally-koda`,`full-broken-signal`,`completed`].includes(n))return null;let r=Number(t.revision);if(!Number.isInteger(r)||r<0)return null;let i={packMastery:ot(t.packMastery),version:1,vnextStartAvailable:t.vnextStartAvailable===!0,foundationStage:n,completed:t.completed===!0||n===`completed`,revision:r,activeRunId:typeof t.activeRunId==`string`&&t.activeRunId?t.activeRunId:null,lastCompletedRunId:typeof t.lastCompletedRunId==`string`&&t.lastCompletedRunId?t.lastCompletedRunId:null,updatedAt:Number.isFinite(Number(t.updatedAt))?Number(t.updatedAt):0};if(t.foundationRunRules!=null){let e=t.foundationRunRules;if(!e||typeof e!=`object`||Array.isArray(e)||typeof e.runId!=`string`||e.runId!==i.activeRunId)return null;let n=ki(e.rulesContract);if(!n)return null;i.foundationRunRules={runId:e.runId,rulesContract:n}}if(Object.prototype.hasOwnProperty.call(t,`playerGrowth`)){let e=ea(t.playerGrowth,r);if(!e)return null;i.playerGrowth=e}if(t.fieldOps&&typeof t.fieldOps==`object`){let e=t.fieldOps;if(!e.records||typeof e.records!=`object`)return null;let n={};for(let[t,r]of Object.entries(e.records)){if(!r||typeof r!=`object`)return null;let e=r;if(e.missionId!==t||!Number.isInteger(e.clearCount)||Number(e.clearCount)<0)return null;n[t]={missionId:t,completed:Number(e.clearCount)>0,clearCount:Number(e.clearCount),lastClearedAt:Number(e.lastClearedAt)||0,failCount:Number(e.failCount)||0,challengeCount:Number(e.challengeCount)||0,lastClearCycle:Number.isInteger(e.lastClearCycle)?Number(e.lastClearCycle):null,lastChallengeCycle:Number.isInteger(e.lastChallengeCycle)?Number(e.lastChallengeCycle):null},Array.isArray(e.squadIds)&&e.squadIds.every(e=>typeof e==`string`)&&(n[t].squadIds=[...e.squadIds]),n[t].advancedClearCount=Number.isInteger(e.advancedClearCount)&&Number(e.advancedClearCount)>=0?Number(e.advancedClearCount):0,n[t].lastAdvancedCycle=Number.isInteger(e.lastAdvancedCycle)?Number(e.lastAdvancedCycle):null}let r=sa({field:{...e,status:`active`,missions:{}}});if(!r)return null;if(i.fieldOps={records:n,activeMissionRun:r.field.activeMissionRun,lastCompletedMissionRunId:r.field.lastCompletedMissionRunId},e.board!=null||e.commander!=null||e.region!=null){let t=e.board,n=e.commander,r=e.region;if(!t||!Number.isInteger(t.cycleId)||!Number.isInteger(t.nextRotationAt)||!Array.isArray(t.activeMissionIds)||t.activeMissionIds.length!==3||new Set(t.activeMissionIds).size!==3||!t.activeMissionIds.every(e=>typeof e==`string`)||!n||![1,2,3].includes(n.rank)||!Number.isInteger(n.progress)||n.progress<0||!Array.isArray(n.unlockedApproaches)||!n.unlockedApproaches.every(e=>e===`standard`||e===`south`)||t.reportVersion!=null&&(t.reportVersion!==3||![`pursuit`,`attrition`].includes(t.directiveSet))||n.unlockedDirectiveTiers!=null&&(!Array.isArray(n.unlockedDirectiveTiers)||!n.unlockedDirectiveTiers.every(e=>[`standard`,`advanced`].includes(e)))||!r||!Number.isInteger(r.pressure)||r.pressure<0||r.pressure>3||r.cycleId!==t.cycleId)return null;let a=e.rotationProgress;if(a!=null&&(!Number.isInteger(a.cycleId)||a.cycleId!==t.cycleId||!Number.isInteger(a.securedCount)||!Number.isInteger(a.total)||a.total!==3||a.securedCount<0||a.securedCount>a.total||![a.clearedMissionIds,a.challengeMissionIds,a.advancedMissionIds].every(e=>Array.isArray(e)&&e.every(e=>typeof e==`string`&&t.activeMissionIds.includes(e)))||typeof a.frontSecured!=`boolean`||a.frontSecured!==(a.securedCount===a.total)))return null;let o=e.careerRecord;if(o!=null&&(o.version!==1||![o.missionSecures,o.challenges,o.advancedClears,o.frontsSecured].every(e=>Number.isInteger(e)&&e>=0)||o.lastSecuredCycle!=null&&!Number.isInteger(o.lastSecuredCycle)))return null;Object.assign(i.fieldOps,{board:t,commander:n,region:r,...a?{rotationProgress:a}:{},...o?{careerRecord:o}:{},lastResult:Zi(e.lastResult)})}}if(Object.prototype.hasOwnProperty.call(t,`tacticalChapter`)){let e=Be(t.tacticalChapter);if(!e)return null;if(i.tacticalChapter=e,t.chapterActiveMission!=null){let n=t.chapterActiveMission;if(!n||typeof n!=`object`||Array.isArray(n)||typeof n.runId!=`string`||n.runId!==e.activeRunId||typeof n.missionId!=`string`||!Array.isArray(n.squadIds)||!n.squadIds.every(e=>typeof e==`string`)||n.rulesContract?.rulesetVersion!==`tactical-intent-vnext.0`)return null;let r=Xi(n.fieldContext);if(n.fieldContext!=null&&!r)return null;let a=ki(n.rulesContract);if(!a||a.missionId!==n.missionId||!ra(n.chapterContext))return null;i.chapterActiveMission={runId:n.runId,missionId:n.missionId,squadIds:[...n.squadIds],rulesContract:a,chapterContext:ra(n.chapterContext),packMastery:ot(n.packMastery),tacticalProfile:Mi(n.tacticalProfile),...n.playerGrowth==null?{}:{playerGrowth:$i(n.playerGrowth)},...n.combatProfileV2==null?{}:{combatProfileV2:Ri(n.combatProfileV2)},...n.combatProfileV3==null?{}:{combatProfileV3:Wi(n.combatProfileV3)},...aa(n.campaignContext)?{campaignContext:aa(n.campaignContext)}:{},...r?{fieldContext:r}:{}}}}let a=sa(t.operations);if(i.playerIdentity=t.playerIdentity&&typeof t.playerIdentity==`object`?t.playerIdentity:void 0,i.activeTacticalProfile=Mi(t.activeTacticalProfile),Object.prototype.hasOwnProperty.call(t,`activeCombatProfileV2`)&&(i.activeCombatProfileV2=Ri(t.activeCombatProfileV2)),i.equippedPet=se(t.equippedPet),a&&(i.operations=a),t.campaignIntel&&typeof t.campaignIntel==`object`){let e=t.campaignIntel[`dead-relay`];e&&typeof e==`object`&&typeof e.courierTraceAcquired==`boolean`&&(i.campaignIntel={"dead-relay":{courierTraceAcquired:e.courierTraceAcquired}})}return i.kodaSidegrade=a?.[`broken-signal`]?.status===`cleared`&&(t.kodaSidegrade===`A`||t.kodaSidegrade===`B`)?t.kodaSidegrade:null,i.shadowSidegrade=a?.[`broken-signal`]?.status===`cleared`&&(t.shadowSidegrade===`A`||t.shadowSidegrade===`B`)?t.shadowSidegrade:null,t.intel&&typeof t.intel==`object`&&(i.intel={routingTrace:!!t.intel.routingTrace,commanderProfile:!!t.intel.commanderProfile}),t.archive&&typeof t.archive==`object`&&(i.archive={brokenSignal:!!t.archive.brokenSignal}),(t.nextOperationSlot===`unassigned`||t.nextOperationSlot===null)&&(i.nextOperationSlot=t.nextOperationSlot),i}function ra(e){if(!e||typeof e!=`object`)return;let t=e;if(!(t.version!==1||t.chapterId!==`edge-relay`||t.doctrine!==`RECON`||!Number.isInteger(t.stageIndex)||Number(t.stageIndex)<0||Number(t.stageIndex)>2))return{version:1,chapterId:`edge-relay`,doctrine:`RECON`,stageIndex:Number(t.stageIndex)}}function ia(e,t){if(!e||typeof e!=`object`)return;let n=e;if(n.version===1&&n.effect===`DELAY_REINFORCEMENT`&&n.sourceChapterId===`edge-relay`&&n.missionId===t&&Number.isInteger(n.baselineRound)&&Number.isInteger(n.effectiveRound)&&Number(n.effectiveRound)===Number(n.baselineRound)+1)return{version:1,effect:`DELAY_REINFORCEMENT`,sourceChapterId:`edge-relay`,missionId:t,baselineRound:Number(n.baselineRound),effectiveRound:Number(n.effectiveRound)}}function aa(e){if(!e||typeof e!=`object`)return null;let t=e;return t.version===1&&typeof t.courierTraceAcquired==`boolean`?{version:1,courierTraceAcquired:t.courierTraceAcquired}:null}function oa(e){if(!e||typeof e!=`object`)return null;let t=e;return typeof t.victory!=`boolean`||typeof t.objectiveComplete!=`boolean`||typeof t.missionId!=`string`||typeof t.runId!=`string`||typeof t.intelEarned!=`boolean`||![t.turns,t.squadStanding,t.squadDeployed].every(Number.isInteger)?null:{victory:t.victory,objectiveComplete:t.objectiveComplete,turns:Number(t.turns),squadStanding:Number(t.squadStanding),squadDeployed:Number(t.squadDeployed),missionId:t.missionId,runId:t.runId,intelEarned:t.intelEarned,...typeof t.failureReason==`string`?{failureReason:t.failureReason}:{}}}function sa(e){if(!e||typeof e!=`object`)return null;let t=e,n={};for(let[e,r]of Object.entries(t)){if(!r||typeof r!=`object`)return null;let t=r;if(t.status!==`active`&&t.status!==`cleared`||!t.missions||typeof t.missions!=`object`)return null;let i={};for(let[e,n]of Object.entries(t.missions)){if(n!==`locked`&&n!==`available`&&n!==`cleared`)return null;i[e]=n}let a=t.activeMissionRun,o=null;if(a!=null){if(typeof a!=`object`)return null;let e=a;if(typeof e.runId!=`string`||typeof e.missionId!=`string`)return null;let t=Array.isArray(e.squadIds)&&e.squadIds.every(e=>typeof e==`string`)?e.squadIds:[],n=Xi(e.fieldContext);if(e.fieldContext!=null&&!n)return null;let r=ki(e.rulesContract);if(r&&r.missionId!==e.missionId)return null;o={runId:e.runId,missionId:e.missionId,squadIds:t,...r?{rulesContract:r}:{},tacticalProfile:Mi(e.tacticalProfile),packMastery:ot(e.packMastery),...e.playerGrowth==null?{}:{playerGrowth:$i(e.playerGrowth)},...Object.prototype.hasOwnProperty.call(e,`combatProfileV2`)?{combatProfileV2:Ri(e.combatProfileV2)}:{},...Object.prototype.hasOwnProperty.call(e,`combatProfileV3`)?{combatProfileV3:Wi(e.combatProfileV3)}:{},...n?{fieldContext:n}:{},...aa(e.campaignContext)?{campaignContext:aa(e.campaignContext)}:{},...ra(e.chapterContext)?{chapterContext:ra(e.chapterContext)}:{},...ia(e.chapterIntel,e.missionId)?{chapterIntel:ia(e.chapterIntel,e.missionId)}:{}}}n[e]={status:t.status,missions:i,activeMissionRun:o,lastCompletedMissionRunId:typeof t.lastCompletedMissionRunId==`string`&&t.lastCompletedMissionRunId?t.lastCompletedMissionRunId:null}}return n}async function ca(e,t={}){let n=ta();if(!n)throw new V(`progression_unavailable`);let r;try{r=await n(e,t)}catch(e){let t=e&&typeof e==`object`?e:{},n=t.data&&typeof t.data==`object`&&!Array.isArray(t.data)?t.data:t,r=n.details&&typeof n.details==`object`&&!Array.isArray(n.details)?n.details:null,i=typeof n.code==`string`?n.code:``,a=Number(t.status);throw new V(/^[a-z][a-z0-9_]{0,63}$/i.test(i)?i:Number.isInteger(a)&&a>=400&&a<=599?`http_${a}`:`progression_request_failed`,na(r?.state))}if(!r||typeof r!=`object`)throw new V(`invalid_progression_response`);let i=r,a=i.details;if(i.ok!==!0)throw new V(String(i.code||`progression_request_failed`),na(a?.state));return i}function la(e){let t=na(e.data);if(!t)throw new V(`invalid_progression_response`);return t}async function ua(){return la(await ca(`/webapp/tactical-foundation/state`))}async function da(e,t,n){return la(await ca(`/webapp/tactical-foundation/start`,{requestId:e,expectedRevision:t,...n?{rulesetVersion:n}:{}}))}async function fa(e,t,n,r){return la(await ca(`/webapp/tactical-foundation/continue`,{requestId:e,expectedRevision:t,runId:n,...r?{rulesetVersion:r}:{}}))}async function pa(e,t,n){return la(await ca(`/webapp/tactical-foundation/chapter/choose`,{requestId:e,expectedRevision:t,doctrine:n}))}async function ma(e,t,n,r,i,a,o=!1,s){let c=await ca(o?`/webapp/tactical-foundation/chapter/mission/start`:`/webapp/tactical-foundation/mission/start`,{requestId:e,expectedRevision:t,missionId:n,...r?{squadIds:r}:{},...i?{fieldOptions:i}:{},...a?{rulesetVersion:a}:{},...!o&&s?{chapterIntelVersion:s}:{}}),l=c.run;if(!l||typeof l!=`object`)throw new V(`invalid_progression_response`);let u=l;if(typeof u.runId!=`string`||!u.runId||u.missionId!==n)throw new V(`invalid_progression_response`);let d=Array.isArray(u.squadIds)&&u.squadIds.every(e=>typeof e==`string`)?u.squadIds:[],f=Xi(u.fieldContext);if(u.fieldContext!=null&&!f)throw new V(`invalid_progression_response`);let p=ki(u.rulesContract);if(p&&p.missionId!==n)throw new V(`invalid_run_rules_contract`);return{state:la(c),run:{runId:u.runId,missionId:u.missionId,squadIds:d,...p?{rulesContract:p}:{},tacticalProfile:Mi(u.tacticalProfile),packMastery:ot(u.packMastery),...u.playerGrowth==null?{}:{playerGrowth:$i(u.playerGrowth)},...Object.prototype.hasOwnProperty.call(u,`combatProfileV2`)?{combatProfileV2:Ri(u.combatProfileV2)}:{},...Object.prototype.hasOwnProperty.call(u,`combatProfileV3`)?{combatProfileV3:Wi(u.combatProfileV3)}:{},...f?{fieldContext:f}:{},...aa(u.campaignContext)?{campaignContext:aa(u.campaignContext)}:{},...ra(u.chapterContext)?{chapterContext:ra(u.chapterContext)}:{},...ia(u.chapterIntel,u.missionId)?{chapterIntel:ia(u.chapterIntel,u.missionId)}:{}}}}async function ha(e,t,n,r=!1,i,a,o,s=!1){let c=await ca(s?`/webapp/tactical-foundation/chapter/mission/continue`:`/webapp/tactical-foundation/mission/continue`,{requestId:e,expectedRevision:t,runId:n,completionIntent:a?a.victory:!i||i.victory,routingTraceAcquired:r,...i?{fieldReport:i}:{},...a?{campaignReport:a}:{},...o?{rulesetVersion:o}:{}}),l=c.chapterResult,u=l?.version===1&&l.chapterId===`edge-relay`&&typeof l.runId==`string`&&typeof l.missionId==`string`&&typeof l.victory==`boolean`&&Number.isInteger(l.stageRecorded)&&typeof l.chapterComplete==`boolean`&&l.combatProof===`CLIENT_REPORT_ONLY`?{version:1,chapterId:`edge-relay`,runId:l.runId,missionId:l.missionId,victory:l.victory,stageRecorded:Number(l.stageRecorded),chapterComplete:l.chapterComplete,combatProof:`CLIENT_REPORT_ONLY`}:null;if(s&&!u)throw new V(`invalid_chapter_receipt`);return{state:la(c),firstClear:c.firstClear===!0,fieldResult:Zi(c.fieldResult),campaignResult:oa(c.campaignResult),chapterResult:u}}async function ga(e,t,n,r){return la(await ca(`/webapp/tactical-foundation/${n}-sidegrade`,{requestId:e,expectedRevision:t,[`${n}Sidegrade`]:r}))}async function _a(e,t,n,r,i,a){return la(await ca(`/webapp/tactical-foundation/growth/upgrade`,{requestId:e,expectedRevision:t,heroId:n,discipline:r,skillId:i,rank:a}))}async function va(e,t,n){return la(await ca(`/webapp/tactical-foundation/growth/respec`,{requestId:e,expectedRevision:t,heroId:n}))}async function ya(e,t,n,r){return la(await ca(`/webapp/tactical-foundation/pack-mastery`,{requestId:e,expectedRevision:t,unitId:n,choice:r}))}function ba(e){let t=typeof crypto<`u`&&typeof crypto.randomUUID==`function`?crypto.randomUUID():String(Date.now())+`-`+Math.random().toString(36).slice(2);return`tops-foundation-`+e+`-`+t}var xa=`tactical_ops.js v3.6.7-vnext-run-integrity`;function Sa(e){return e.defId===`alpha`||e.role===`alpha`?`alpha`:e.defId===`ally-02`?`cnc`:e.defId===`ally-03`?`shadow`:`pet`}function Ca(e,t){return e.growth?.ranks[T(t)]||0}function wa(e,t){let n=e.combatMastery;if(!n||n.stage<2)return null;let r=T(t),i=Sa(e);if(i===`cnc`&&r===`u02-suppress`)return n.stage>=3?`signature`:`trained`;if(i===`shadow`){if(r===`u03-pack`)return n.stage>=3&&n.selected===`B`?`signature`:`trained`;if(r===`u03-mend`&&n.stage>=3&&n.selected===`A`)return`signature`}return i===`pet`&&r===`pet-hamstring`&&n.stage>=3&&n.selected===`A`?`signature`:null}function Ta(e,t){let n=wa(e,t);if(n)return n;let r=Ca(e,t);return r===2?`rank2`:r===1?`rank1`:`base`}function Ea(e,t){let n=Ta(e,t);return n===`signature`?`SIGNATURE`:n===`trained`?`TRAINED`:n===`rank2`?`R2`:n===`rank1`?`R1`:null}function Da(e){if(e.defId===`alpha`)return e.growth?.discipline?.toUpperCase()||null;let t=e.combatMastery;return!t||t.stage<2?null:t.stage>=3&&t.selected?`MASTERED · ${t.selected}`:`TRAINED · 3/8`}function Oa(e,t,n,r,i){return nn(i||A(e),t,n,r)}function ka(e,t,n,r,i){let a=n.filter(e=>(e.type===`damage`||e.type===`heal`||e.type===`status`)&&!!e.unitId);if(!a.length&&!i)return null;let o=E(A(t),e.growth),s=a.filter(e=>e.type===`damage`).reduce((e,t)=>e+(t.amount||0),0),c=a.filter(e=>e.type===`heal`).reduce((e,t)=>e+(t.amount||0),0),l=a.filter(e=>e.type===`status`),u=l.some(e=>e.kind===`guard`),d=i?`control`:s?`damage`:c?`heal`:u?`guard`:l.length?`control`:`support`,f=i?`ENEMY INTENT CANCELED`:s?`−${s} HP`:c?`+${c} HP`:l.length?l[0].text||`STATUS APPLIED`:`EFFECT RESOLVED`,p=Ta(e,t),m=Ea(e,t),h=o.targetType===`ALLY_AOE`||o.targetType===`SELF`?e.id:a[0]?.unitId||e.id;return{id:r,actorId:e.id,targetId:h,affinity:Sa(e),tier:p,title:`${o.name}${m?` · `+m:``}`,consequence:f,mode:d,interrupted:i}}function Aa(e,t,n){return Sa(e)!==`pet`||e.combatMastery?.stage!==3||e.combatMastery.selected!==`B`||e.c===t.c&&e.r===t.r?null:{id:n,actorId:e.id,targetId:t.id,affinity:`pet`,tier:`signature`,title:`PATHFINDER · SIGNATURE`,consequence:`POSITION SECURED`,mode:`movement`,interrupted:!1}}var ja=`/images/tactical_ops/combat_fx/v1/`,Ma={alpha_strike:540,alpha_rend:680,alpha_howl:820,alpha_guard:640,cnc_thrust:500,cnc_lunge:580,cnc_pressure:720,cnc_interrupt:760,shadow_sweep:520,shadow_mend:760,shadow_pack_heal_def:820,shadow_pack_def_only:820,shadow_pack_guard:820,pet_bite:500,pet_hamstring:740,pet_pathfinder:660,objective_recover:880},Na={alpha_strike:`fx-alpha fx-hit fx-strike`,alpha_rend:`fx-alpha fx-hit fx-rend`,alpha_howl:`fx-alpha fx-howl`,alpha_guard:`fx-alpha fx-guard`,cnc_thrust:`fx-cnc fx-hit fx-thrust`,cnc_lunge:`fx-cnc fx-hit fx-lunge`,cnc_pressure:`fx-cnc fx-control`,cnc_interrupt:`fx-cnc fx-interrupt`,shadow_sweep:`fx-shadow fx-hit fx-sweep`,shadow_mend:`fx-shadow fx-mend`,shadow_pack_heal_def:`fx-shadow fx-pack`,shadow_pack_def_only:`fx-shadow fx-pack`,shadow_pack_guard:`fx-shadow fx-pack`,pet_bite:`fx-pet fx-hit fx-bite`,pet_hamstring:`fx-pet fx-hit fx-hamstring`,pet_pathfinder:`fx-pet fx-pathfinder`,objective_recover:`fx-objective fx-recover`};function Pa(e){return Na[e]??``}function Fa(e){return[`alpha_strike`,`alpha_rend`,`shadow_sweep`,`pet_bite`,`pet_hamstring`].includes(e)?`dash`:[`cnc_thrust`,`cnc_lunge`,`cnc_pressure`,`cnc_interrupt`].includes(e)?`beam`:`none`}function Ia(e){let t=e.find(e=>Fa(e.name)!==`none`);return t?Math.max(80,Math.round(t.durationMs*(Fa(t.name)===`beam`?.46:.37))):0}function La(e,t,n,r){if(!(e in Ma))throw Error(`Unknown combat FX `+e);return{id:t,name:e,targetId:n,terminal:r,durationMs:Ma[e]}}function Ra(e,t,n,r,i){let a=T(t),o=e=>n.some(t=>t.type===e),s=e=>n.some(t=>t.type===`status`&&(t.text||``).toUpperCase()===e),c=e=>[...new Set(n.filter(t=>t.type===e&&t.unitId).map(e=>e.unitId))],l=c(`damage`)[0]||c(`status`)[0]||c(`heal`)[0],u=[],d=(t,n)=>u.push({...La(t,r+u.length,n||e.id),actorId:e.id,from:{c:e.c,r:e.r}}),f=o(`damage`),p=n.some(e=>e.type===`heal`&&(e.amount||0)>0);switch(a){case`alpha-strike`:f&&d(`alpha_strike`,l);break;case`alpha-rend`:f&&d(`alpha_rend`,l);break;case`alpha-howl`:if((s(`ATK UP`)||s(`SPD UP`))&&d(`alpha_howl`),s(`GUARD`))for(let e of c(`status`).filter(e=>n.some(t=>t.type===`status`&&t.unitId===e&&t.kind===`guard`)))d(`alpha_guard`,e);break;case`u02-shot`:f&&d(`cnc_thrust`,l);break;case`u02-burst`:f&&d(`cnc_lunge`,l);break;case`u02-suppress`:s(`ATK DOWN`)&&d(`cnc_pressure`,l),i&&d(`cnc_interrupt`,l);break;case`u03-tap`:f&&d(`shadow_sweep`,l);break;case`u03-mend`:if(p)for(let e of c(`heal`))d(`shadow_mend`,e);break;case`u03-pack`:p&&s(`DEF UP`)?d(`shadow_pack_heal_def`):s(`DEF UP`)&&d(`shadow_pack_def_only`),s(`GUARD`)&&d(`shadow_pack_guard`);break;case`pet-bite`:f&&d(`pet_bite`,l);break;case`pet-hamstring`:s(`SPD DOWN`)&&d(`pet_hamstring`,l)}return u}function za(e,t,n){return!e.defId.startsWith(`pet:`)||e.combatMastery?.stage!==3||e.combatMastery.selected!==`B`||e.c===t.c&&e.r===t.r?[]:Math.abs(e.c-t.c)+Math.abs(e.r-t.r)>4?[La(`pet_pathfinder`,n,e.id)]:[]}function Ba(e,t,n){if(e.type!==`damage`||!e.unitId||!e.amount||e.amount<=0)return null;let r=t.find(t=>t.id===e.unitId);if(!r)return null;let i=n[e.unitId]??r.hp;return i>0&&i-e.amount<=0&&r.defeated?{unitId:e.unitId,kind:`finisher`,label:`TARGET DOWN`}:r.statuses.some(e=>e.type===`GUARD`)?{unitId:e.unitId,kind:`guarded`,label:`GUARD ACTIVE`}:null}function Va(e,t,n){return!e||!t||!n.some(e=>e.type===`status`&&e.unitId===t)?null:{unitId:t,kind:`counter`,label:`SIGNAL BROKEN`}}function Ha(e,t,n,r,i){if(e.team!==`enemy`||e.defeated)return null;let a=n.find(t=>(t.type===`damage`||t.type===`status`)&&t.unitId&&t.unitId!==e.id),o=r.find(e=>e.id===a?.unitId);if(!o)return null;let s=/jam|intimidate|interference/.test(t)?`jam`:/pulse|aim|shot/.test(t)||e.archetype===`MARKSMAN`?`ranged`:/crush|maul/.test(t)||e.role===`leader`?`heavy`:`melee`,c=s===`heavy`?680:s===`jam`?620:550,l=s===`heavy`?.49:s===`melee`?.42:.44;return{id:i,actorId:e.id,style:s,from:{c:e.c,r:e.r},to:{c:o.c,r:o.r},durationMs:c,contactMs:Math.round(c*l)}}var Ua={id:`solo-1`,operationName:`BROKEN SIGNAL — CONTACT`,objective:`Defeat the hostile scout.`,teaching:`Move toward the scout. STRIKE works from 1 tile away.`,steps:[`Tap a highlighted tile to move toward the scout.`,`When next to the scout, tap STRIKE (A1), then tap the scout.`],next:`solo-2`,resultsTitle:`DRILL COMPLETE`,resultsNote:`Next: multiple hostiles.`,spawns:[{defId:`alpha`,id:`alpha`,c:2,r:2},{defId:`hostile`,id:`h2`,c:5,r:3}]},Wa={id:`solo-2`,operationName:`BROKEN SIGNAL — SPLIT CONTACT`,objective:`Defeat both hostile scouts.`,teaching:`Attack one scout, then reposition to reach the other.`,steps:[`Move into attack range of the first scout.`,`Attack, then reposition for the second scout.`],next:`ally-koda`,resultsTitle:`DRILL COMPLETE`,resultsNote:`COLDNCURSED / CNC — BUG HUNTER WARDEN joins Alpha for the next deployment.`,spawns:[{defId:`alpha`,id:`alpha`,c:2,r:2},{defId:`hostile`,id:`h1`,c:5,r:0},{defId:`hostile`,id:`h2`,c:5,r:3}]},Ga={id:`ally-koda`,operationName:`BROKEN SIGNAL — PACK LINK`,objective:`Defeat the hostiles with Alpha and CNC.`,teaching:`Alpha attacks up close. CNC can attack from up to 3 tiles away.`,steps:[`Move Alpha close enough to strike.`,`Use CNC to attack enemies farther away.`],next:`full-broken-signal`,resultsTitle:`SQUAD LINK ESTABLISHED`,resultsNote:`Full operation ready.`,spawns:[{defId:`alpha`,id:`alpha`,c:2,r:2},{defId:`ally-02`,id:`ally-02`,c:1,r:0},{defId:`hostile`,id:`h1`,c:5,r:0},{defId:`hostile`,id:`h2`,c:5,r:3}]},Ka={id:`full-broken-signal`,operationName:`BROKEN SIGNAL`,objective:`Defeat the hostile squad to complete Broken Signal.`,teaching:`Alpha fights up close, CNC attacks from range, and Shadow supports the pack.`,steps:[`Use Alpha and CNC to pressure hostiles.`,`Keep the squad standing with Shadow's support.`],next:null,resultsTitle:`OPERATION COMPLETE`,resultsNote:`Hostile force eliminated.`,spawns:fe},qa={"solo-1":Ua,"solo-2":Wa,"ally-koda":Ga,"full-broken-signal":Ka},Ja=`solo-1`;function Ya(e){return Object.prototype.hasOwnProperty.call(qa,e)}function Xa(e){return e&&Ya(e)?qa[e]:Ua}function Za(e,t){return e?Xa(t).spawns:fe}function Qa(e,t){return e?Xa(t):Ka}function $a(e){let t=new Set,n=[];for(let r of e){let e=r.unitDef||I[r.defId];e&&e.team===`ally`&&!t.has(e.defId)&&(t.add(e.defId),n.push(e))}return n}function eo(e){let t=new Map;for(let n of e){let e=n.unitDef||I[n.defId];e&&e.team===`enemy`&&t.set(e.defId,{def:e,count:(t.get(e.defId)?.count||0)+1})}return[...t.values()]}var to=()=>({pending:[],ledger:[],sequence:0,reactionObserved:{}});function no(e){return e.type===`skill`?e:e.type===`move`&&e.then?.type===`skill`?e.then:null}function ro(e){return{c:e.c,r:e.r}}function io(e,t){let n=Zn(e,12),r=n.indexOf(t);if(r<0)return!1;let i=n.indexOf(t,r+1);return i<0?!1:n.slice(r+1,i).some(t=>e.units.some(e=>e.id===t&&e.team===`ally`&&!e.defeated))}function ao(e,t){if(!e.pending.length)return e;let n=[],r={...e.reactionObserved},i=[...e.ledger];for(let a of e.pending){let e=Di(a.plan,t);e.status===`CANCELED`?(i.push(...e.events),delete r[a.plan.id]):n.push(a)}return n.length===e.pending.length?e:{...e,pending:n,reactionObserved:r,ledger:i}}function oo(e,t){let n=t.units.find(e=>e.id===t.activeId);if(!n||n.team!==`ally`||n.defeated)return e;let r={...e.reactionObserved};for(let n of e.pending)t.unitTurn>n.plan.warnsOnUnitTurn&&(r[n.plan.id]=!0);return{...e,reactionObserved:r}}function so(e,t,n,r){if(n.type===`skip`||!no(n))return null;let i=e.units.find(e=>e.id===t);if(!i||i.defeated||i.team!==`enemy`)return null;let a=no(n),o=a?A(a.skillId):null;if(o&&(o.targetType===`SELF`||o.targetType===`ALLY_AOE`))return null;let s=a?.targetId?e.units.find(e=>e.id===a.targetId):null,c=s?ro(s):a?.cell?ro(a.cell):n.type===`move`?ro(n.to):ro(i),l=o&&[`AREA_RADIUS`,`ENEMY_AOE`].includes(o.targetType)?Array.from({length:z*mn},(e,t)=>({c:t%z,r:Math.floor(t/z)})).filter(e=>Math.max(Math.abs(e.c-c.c),Math.abs(e.r-c.r))<=o.radius):[c],u=o?.id.includes(`interference`)||o?.id.includes(`intimidate`)?`JAM`:n.type===`move`&&!a?`CHARGE`:o?.targetType===`AREA_RADIUS`||o?.targetType===`ENEMY_AOE`?`AREA`:`ATTACK`,{plan:d}=Ei({id:`threat:${e.unitTurn}:${t}:${r}`,enemyId:t,kind:u,targetUnitId:s?.id??null,targetTile:c,impactTiles:l,predictedEffect:o?o.name:`Enemy attack`,warnsOnUnitTurn:e.unitTurn,resolvesOnUnitTurn:e.unitTurn+1,responses:[`KILL`,`DISRUPT`,`REPOSITION`,`BLOCK`,`PROTECT`,`TRADE`],fallbackPolicy:`CANCEL`},e);return{plan:d,action:n}}function co(e,t){let n=t.units.find(e=>e.id===t.activeId);if(!n||n.team!==`enemy`||n.defeated||e.pending.some(e=>e.plan.enemyId===n.id)||!io(t,n.id))return e;let r=mr(t),i=so(t,n.id,r,e.sequence+1);return i?{...e,sequence:e.sequence+1,pending:[...e.pending,i],ledger:[...e.ledger,{type:`threat_announced`,intentId:i.plan.id,enemyId:n.id,unitTurn:t.unitTurn}]}:e}function lo(e,t){let n=e.pending.findIndex(e=>e.plan.enemyId===t.activeId);if(n<0)return{cycle:e,state:t};let r=e.pending[n],i=Di(r.plan,t);if(i.status===`COMMIT`&&!e.reactionObserved[r.plan.id]||i.status===`WAIT`)return{cycle:e,state:t};let a=e.pending.filter((e,t)=>t!==n),o={...e.reactionObserved};if(delete o[r.plan.id],i.status===`CANCELED`)return{state:t,cycle:{...e,pending:a,reactionObserved:o,ledger:[...e.ledger,...i.events]}};if(!hr(t,r.action))return{state:t,cycle:{...e,pending:a,reactionObserved:o,ledger:[...e.ledger,{type:`threat_countered`,intentId:r.plan.id,reason:`INVALIDATED`,unitTurn:t.unitTurn}]}};let s=t,c=oi(t,r.action),l=c.state!==s&&c.events.some(e=>e.type===`damage`||e.type===`status`||e.type===`move`||e.type===`heal`);return{state:c.state,events:c.events,cycle:{...e,pending:a,reactionObserved:o,ledger:[...e.ledger,...l?[...i.events,...Oi(i.plan,t.unitTurn,!0)]:[{type:`threat_countered`,intentId:r.plan.id,reason:`INVALIDATED`,unitTurn:t.unitTurn}]]}}}function uo(e,t,n,r,i,a,o){let s=t.units.find(e=>e.id===r);if(!s||s.team!==`ally`||s.defeated||s.defId!==`ally-02`||s.growth?.discipline!==`disruptor`||!(a===`u02-suppress`||a===`u02-pressure-disruptor`||a.startsWith(`u02-pressure-disruptor:mastery:`)||a.startsWith(`u02-suppress:mastery:`))||!o.some(e=>e.type===`status`&&e.unitId===i)||t.unitTurn!==n.unitTurn)return{cycle:e,interrupted:!1};let c=e.pending.find(e=>e.plan.enemyId===i);if(!c)return{cycle:e,interrupted:!1};let l=Di(c.plan,n,!0);if(l.status!==`CANCELED`)return{cycle:e,interrupted:!1};let u={...e.reactionObserved};return delete u[c.plan.id],{interrupted:!0,cycle:{...e,pending:e.pending.filter(e=>e.plan.id!==c.plan.id),reactionObserved:u,ledger:[...e.ledger,...l.events],interruptedEnemyIds:[...e.interruptedEnemyIds||[],i]}}}var H=xa;function U(e){return new Promise(t=>{if(typeof requestAnimationFrame>`u`){setTimeout(t,e);return}let n=performance.now(),r=i=>{i-n>=e?t():requestAnimationFrame(r)};requestAnimationFrame(r)})}var fo=1,po=1,W=0,mo=!1;function ho(e){return Zn(e,7)}function go(){return{units:[],activeId:null,inspectId:null,actionSkillId:null,mode:`idle`,round:1,unitTurn:0,actionsLeftInRound:0,outcome:`ongoing`,damageTaken:0,hostilesEliminated:0,results:null,seed:1,objective:null,reinforcement:null,signalCarrierId:null,routingTraceAcquired:!1}}function _o(e){return e.units.find(t=>t.id===e.activeId)}function vo(e){return e.foundationStage===`completed`?`full-broken-signal`:e.foundationStage}var G=dn((e,t)=>{let n=(n,r)=>{n&&(e({combatMoment:n}),U(1150).then(()=>{r===W&&t().combatMoment?.id===n.id&&e({combatMoment:null})}))},r=(n,r)=>{if(!n.length)return;let i=n.slice(0,5);e({combatFx:i}),U(Math.max(...i.map(e=>e.durationMs))+70).then(()=>{r===W&&t().combatFx[0]?.id===i[0].id&&e({combatFx:[]})})},i=async(t,n)=>(t&&(e({enemyScene:t}),await U(t.contactMs)),n===W),a=async(e,t)=>{let n=Ia(e);return n&&await U(n),t===W},o=(t,n)=>{let r=new Set(n.filter(e=>(e.type===`damage`||e.type===`heal`)&&e.unitId).map(e=>e.unitId));r.size&&e(e=>({displayHp:{...e.displayHp,...Object.fromEntries(t.units.filter(e=>r.has(e.id)).map(e=>[e.id,e.hp]))}}))},s=t=>{t.unitId&&e(e=>{if(!(t.unitId in e.displayHp))return{};let n=e.displayHp[t.unitId],r=Math.max(0,Number(t.amount)||0),i=e.battle.units.find(e=>e.id===t.unitId),a=t.type===`damage`?Math.max(0,n-r):Math.min(i?.maxHp??n+r,n+r);return{displayHp:{...e.displayHp,[t.unitId]:a}}})},c=(t,n)=>{if(!t||n!==W)return;let r={...t,id:po++};e(e=>({consequences:[...e.consequences,r].slice(-4)})),U(1050).then(()=>{n===W&&e(e=>({consequences:e.consequences.filter(e=>e.id!==r.id)}))})},l=(t,n,r)=>{let i=fo++;e(e=>({floats:[...e.floats,{id:i,unitId:t,text:n,kind:r}]})),U(900).then(()=>{e(e=>({floats:e.floats.filter(e=>e.id!==i)}))})},u=async(n,r)=>{if(r===W){e(e=>({s3CombatProof:te(e.s3CombatProof,n)}));for(let i of n){if(r!==W)return;if(i.type===`ticker`&&i.text&&e({ticker:i.text}),i.type===`banner`&&i.text){if(e({banner:i.text}),vi(`turn`),await U(520),r!==W)return;e({banner:null})}if(i.type===`damage`&&i.unitId&&i.text){if(c(Ba(i,t().battle.units,t().displayHp),r),s(i),vi(`hit`),e({impactId:i.unitId,impactKey:po++}),l(i.unitId,i.text,i.kind??`dmg`),await U(360),r!==W)return;e(e=>e.impactId===i.unitId?{impactId:null}:{})}i.type===`heal`&&i.unitId&&i.text&&(s(i),vi(`heal`),l(i.unitId,i.text,`heal`),await U(240)),i.type===`status`&&i.unitId&&i.text&&(vi(`status`),l(i.unitId,i.text,i.kind??`status`),await U(180)),i.type===`expire`&&i.unitId&&i.text&&l(i.unitId,i.text,`info`),i.type===`defeat`&&i.unitId&&(l(i.unitId,i.text??`DOWN`,`info`),await U(260)),i.type===`move`&&vi(`move`)}r===W&&e({displayHp:{}})}},d=async n=>{let{battle:r}=t();if(r.outcome===`victory`)return e({busy:!0,banner:`SECTOR SECURED`,ticker:null,attackingId:null}),vi(`win`),await U(1400),n===W&&e({screen:`sector`,busy:!1,banner:null}),!0;if(r.outcome===`defeat`){if(e({busy:!0,banner:`OPERATION FAILED`,ticker:null,attackingId:null}),vi(`lose`),await U(1200),n!==W)return!0;let r=R(t().selectedMissionId);return e({screen:t().chapterMode||r?.activity===`FIELD_OP`||r?.operationId===je.operationId?`results`:`defeat`,busy:!1,banner:null}),t().chapterMode?t().saveChapterResult():r?.activity===`FIELD_OP`&&t().saveFieldResult(),!0}return!1},f=to(),p=async n=>{if(n!==W||await d(n))return;let r=t().battle,i=$r(r),a=Et(t().s3CombatProof,r,i.state);if(bi&&(f=ao(f,i.state),e({threats:f.pending.map(e=>e.plan)})),e({battle:i.state,queue:ho(i.state),s3CombatProof:a}),await u(i.events,n),n!==W||await d(n))return;let o=_o(t().battle);if(bi&&o?.team===`ally`&&(f=oo(f,t().battle)),!o)e({busy:!1});else if(o.team===`enemy`){if(e({busy:!0,ticker:`${o.name}`}),await U(280),n!==W)return;await m(n)}else e({busy:!1,ticker:o.hasMoved?`${o.name}  ·  act`:`${o.name}  ·  move or act`})},m=async n=>{let r=t().battle,a=_o(r);if(!a||a.team!==`enemy`){await p(n);return}if(bi&&f.interruptedEnemyIds?.includes(a.id)){f={...f,interruptedEnemyIds:f.interruptedEnemyIds.filter(e=>e!==a.id)};let t=ii(r);if(!t.ok)throw Error(`interrupted_enemy_could_not_skip`);e({battle:t.state,queue:ho(t.state),ticker:`INTERRUPTED · ENEMY TURN LOST`}),await u(t.events,n),n===W&&await p(n);return}if(bi){let t=f.pending.find(e=>e.plan.enemyId===a.id);if(t){let s=lo(f,r);if(f=s.cycle,e({threats:f.pending.map(e=>e.plan)}),s.state!==r){let c=s.events??[],l=t.action.type===`skill`?t.action:t.action.type===`move`?t.action.then:null,d=l?.type===`skill`?Ha(a,l.skillId,c,r.units,po++):null;if(o(r,c),e({battle:s.state,queue:ho(s.state)}),!await i(d,n)||(await u(c,n),n!==W))return;e({enemyScene:null}),await U(160),n===W&&await p(n);return}if(!f.pending.some(e=>e.plan.id===t.plan.id)){let t=ii(r);e({battle:t.state,queue:ho(t.state),ticker:`THREAT COUNTERED`}),await u(t.events,n),n===W&&await p(n);return}let c=ii(r);e({battle:c.state,queue:ho(c.state),ticker:`THREAT WAITING`}),await u(c.events,n),n===W&&await p(n);return}{let t=co(f,r);if(t.pending.length>f.pending.length){f=t,e({threats:f.pending.map(e=>e.plan)});let i=ii(r);e({battle:i.state,queue:ho(i.state),ticker:`ENEMY INTENT REVEALED`}),await u(i.events,n),n===W&&await p(n);return}}}let s=si(r);s.type===`move`&&e({attackingId:null}),s.type===`skill`&&e({attackingId:a.id,lastActionSkillId:s.skillId});let c=oi(t().battle,s),l=s.type===`skill`?s:s.type===`move`?s.then:null,d=l?.type===`skill`?Ha(a,l.skillId,c.events,r.units,po++):null;o(r,c.events),e({battle:c.state,queue:ho(c.state),attackingId:s.type===`skill`?a.id:null}),await i(d,n)&&(await u(c.events,n),n===W&&(e({enemyScene:null}),e({attackingId:null}),await U(160),await p(n)))},h=async n=>{if(t().battle.routingTraceAcquired&&!mo){if(mo=!0,e({banner:`ROUTING TRACE ACQUIRED`,ticker:`Carrier signal recovered`}),vi(`status`),await U(900),n!==W)return;e({banner:null})}bi&&(f=ao(f,t().battle),e({threats:f.pending.map(e=>e.plan)})),!await d(n)&&await p(n)},g=t=>{e({progression:t,progressionStatus:`ready`,progressionError:null,progressionCommitPending:!1,onboardingEnabled:!0,onboardingStageId:vo(t),foundationCompleted:t.completed})},_=async(n,r)=>{let i=t();if(i.screen!==`brief`||i.busy||i.kodaSavePending||i.shadowSavePending||i.progression?.operations?.[`broken-signal`]?.status!==`cleared`||r!==`A`&&r!==`B`)return;let a=n===`koda`?`kodaSavePending`:`shadowSavePending`;e({[a]:!0,progressionError:null});try{let e=await ga(ba(`${n}-sidegrade`),i.progression.revision,n,r);e.revision>=(t().progression?.revision||0)&&g(e)}catch(r){let i=r instanceof V?r.state:null;i&&i.revision>=(t().progression?.revision||0)&&g(i),e({progressionError:`${n===`koda`?`CNC`:`SHADOW`} selection could not be saved. Retry your choice.`})}finally{e({[a]:!1})}},v=(n,r,i,a,o=!1,s=!1,c=null,l,d,p,h,g,_)=>{hn(g),xi(g||null),mo=!1,f=to();let v=Hr(zr()),{onboardingEnabled:y,onboardingStageId:b}=t(),x=i||Za(y,b),S=a?{type:`RECOVER`,terminal:a,completed:!1}:o?{type:`BOSS`,targetId:`leader`}:null,C=o?{...De,spawn:{...De.spawn},telegraphed:s,spawned:!1}:null,w=l?be(Le(l,s,d,p),l.missionId,_):{objective:S,reinforcement:C,directive:null},T=ei(v,x,w.objective,w.reinforcement,c,w.directive,h);vi(`turn`),e({screen:`battle`,identity:v,battle:T.state,queue:ho(T.state),busy:!0,banner:null,ticker:null,floats:[],threats:[],attackingId:null,impactId:null,combatMoment:null,s3CombatProof:l?xt(r,l.missionId):null,combatFx:[],enemyScene:null,displayHp:{},consequences:[],currentRunKey:r,activeRulesetVersion:g?.rulesetVersion||null,currentFieldContext:d||null,fieldResult:null,campaignResult:null,chapterResult:null,currentChapterIntel:_||null,currentCampaignContext:p||null,continueRequestId:null}),(async()=>{if(await u(T.events,n),n!==W)return;let r=_o(t().battle);r?.team===`enemy`?await m(n):e({busy:!1,ticker:r?r.name+`  ·  move or act`:null})})()};return{screen:`hub`,activeRulesetVersion:null,battle:go(),busy:!1,banner:null,ticker:null,floats:[],threats:[],attackingId:null,lastActionSkillId:null,impactId:null,impactKey:0,combatMoment:null,s3CombatProof:null,combatFx:[],enemyScene:null,displayHp:{},consequences:[],muted:!1,queue:[],identity:zr(),onboardingEnabled:!1,onboardingStageId:Ja,onboardingCompleted:{},lastVictoryKey:null,currentRunKey:null,progression:null,progressionStatus:`idle`,progressionError:null,progressionCommitPending:!1,continueRequestId:null,foundationCompleted:!1,selectedMissionId:null,missionFirstClear:null,selectedSquadIds:[],selectedApproach:`standard`,selectedDirectiveTier:`standard`,currentFieldContext:null,fieldResult:null,campaignResult:null,chapterResult:null,chapterMode:!1,currentChapterIntel:null,currentCampaignContext:null,kodaSavePending:!1,shadowSavePending:!1,configureOnboarding:n=>{let r=t().onboardingEnabled,i=typeof n.enabled==`boolean`?n.enabled:r,a=t().onboardingStageId,o=t().onboardingCompleted,s=t().lastVictoryKey,c=t().currentRunKey;n.stageId!=null&&n.stageId!==``?a=Xa(n.stageId).id:i&&!r&&(a=Ja,o={},s=null,c=null),e({onboardingEnabled:i,onboardingStageId:a,onboardingCompleted:o,lastVictoryKey:s,currentRunKey:c})},loadFoundationProgression:async()=>{e({progressionStatus:`loading`,progressionError:null});try{let t=await ua();g(t),t.completed&&t.operations?.[`broken-signal`]&&e({screen:`war-table`})}catch(t){let n=t instanceof V?t.code:`progression_request_failed`,r=t instanceof V?t.state:null;r&&g(r),e({progressionStatus:r?`ready`:`error`,progressionError:n})}},refreshIdentity:()=>{e({identity:Hr(zr())}),Vr().then(t=>{t&&e({identity:Hr(zr())})})},upgradeGrowth:async(n,r,i,a)=>{let o=t(),s=o.progression?.playerGrowth;if(o.screen!==`war-table`||o.busy||o.progressionCommitPending||!o.progression||!s)return;let c=D(s,n);if(!(!c||c.discipline&&c.discipline!==r||!(n===`alpha`&&[`vanguard`,`howlkeeper`].includes(r)||n===`ally-02`&&[`pursuer`,`disruptor`].includes(r)||n===`ally-03`&&[`sentinel`,`medic`].includes(r))||s.earnedPoints-s.spentPoints<1||(c.ranks[i]??0)+1!==a)&&nn(en(i,o.progression),c,a,r).length){e({progressionCommitPending:!0,progressionError:null});try{let e=await _a(ba(`growth-upgrade`),o.progression.revision,n,r,i,a);e.revision>=(t().progression?.revision??0)&&g(e)}catch(n){let r=n instanceof V?n.state:null;r&&r.revision>=(t().progression?.revision??0)&&g(r),e({progressionError:`Skillbook upgrade not confirmed (${n instanceof V?n.code:`progression_request_failed`}). Refresh to check your saved rank before trying again.`})}finally{e({progressionCommitPending:!1})}}},respecGrowth:async n=>{let r=t(),i=(r.progression?.playerGrowth)?.heroes.find(e=>e.heroId===n);if(!(r.screen!==`war-table`||r.busy||r.progressionCommitPending||!r.progression||!i||i.respecUsed||Object.keys(i.ranks).length===0)){e({progressionCommitPending:!0,progressionError:null});try{let e=await va(ba(`growth-respec`),r.progression.revision,n);e.revision>=(t().progression?.revision??0)&&g(e)}catch(n){let r=n instanceof V?n.state:null;r&&r.revision>=(t().progression?.revision??0)&&g(r),e({progressionError:`Respec was not saved. Refresh your Skillbook and try again.`})}finally{e({progressionCommitPending:!1})}}},selectMastery:async(n,r)=>{let i=t();if([`brief`,`war-table`].includes(i.screen)&&!i.busy&&!i.progressionCommitPending&&i.progression&&!(r!==`A`&&r!==`B`||ct(i.progression,n)||at(i.progression.packMastery,n).stage<3||at(i.progression.packMastery,n).selected===r)){e({progressionCommitPending:!0,progressionError:null});try{let e=await ya(ba(`pack-mastery`),i.progression.revision,n,r);e.revision>=(t().progression?.revision??0)&&g(e)}catch(n){let r=n instanceof V?n.state:null;r&&r.revision>=(t().progression?.revision??0)&&g(r),e({progressionError:n instanceof V&&n.code===`mastery_run_active`?`Finish this companion's committed attempt before changing mastery.`:`Mastery option could not be saved. Refresh and retry.`})}finally{e({progressionCommitPending:!1})}}},selectDirectiveTier:n=>{let r=t();r.screen!==`brief`||r.busy||r.progressionCommitPending||R(r.selectedMissionId)?.activity!==`FIELD_OP`||!r.progression?.fieldOps?.commander?.unlockedDirectiveTiers?.includes(n)||e({selectedDirectiveTier:n})},selectApproach:n=>{let r=t();r.screen!==`brief`||r.busy||R(r.selectedMissionId)?.activity!==`FIELD_OP`||r.progression?.fieldOps?.commander?.unlockedApproaches.includes(n)&&e({selectedApproach:n})},chooseDoctrine:async()=>{let n=t(),r=n.progression?.tacticalChapter;if(!n.progressionCommitPending&&n.progression&&r?.status===`AVAILABLE`){e({progressionCommitPending:!0,progressionError:null});try{let e=await pa(ba(`chapter-choose`),n.progression.revision,`RECON`);g(e)}catch(t){let n=t instanceof V?t.state:null;n&&g(n),e({progressionError:`Doctrine selection not recorded. Refresh to verify before retrying.`})}finally{e({progressionCommitPending:!1})}}},openChapterBrief:()=>{let n=t(),r=n.progression?.tacticalChapter;if(!r||r.status!==`ACTIVE`||r.doctrine!==`RECON`||!n.foundationCompleted)return;let i=[`field-relay-recovery`,`field-relay-intercept`,`dead-relay-courier`][r.completedMissionIds.length];if(!i)return;let a=n.progression?.chapterActiveMission;r.activeRunId&&(!a||a.runId!==r.activeRunId||a.missionId!==i)?e({progressionError:`Saved chapter run could not be restored. Refresh Tactical Ops.`}):e({screen:`brief`,chapterMode:!0,selectedMissionId:i,selectedSquadIds:a?.squadIds||[`alpha`,`ally-02`,`ally-03`],selectedApproach:a?.fieldContext?.approach||`standard`,selectedDirectiveTier:a?.fieldContext?.directiveTier||`standard`,currentCampaignContext:null,chapterResult:null,campaignResult:null,fieldResult:null,progressionError:null})},saveChapterResult:async()=>{let n=t(),r=R(n.selectedMissionId);if(!n.chapterMode||n.screen!==`results`||n.progressionCommitPending||!r||!n.currentRunKey||!n.progression||!n.battle.results||n.chapterResult?.runId===n.currentRunKey)return;let i=n.battle.results,a=r.activity===`FIELD_OP`?M(n.battle):{victory:n.battle.outcome===`victory`,turns:i.turns,objectiveComplete:n.battle.outcome===`victory`,squadStanding:i.squadStanding,squadDeployed:i.squadDeployed,...n.battle.failureReason?{failureReason:n.battle.failureReason}:{}};if(!a)return;let o=n.continueRequestId||ba(`chapter-continue`);e({progressionCommitPending:!0,progressionError:null,continueRequestId:o});try{let i=await ha(o,n.progression.revision,n.currentRunKey,!1,r.activity===`FIELD_OP`?a:void 0,r.activity===`FIELD_OP`?void 0:a,n.activeRulesetVersion||void 0,!0);if(!i.chapterResult||i.chapterResult.runId!==n.currentRunKey)throw new V(`invalid_chapter_receipt`);if(t().currentRunKey!==n.currentRunKey)return;g(i.state),e({chapterResult:i.chapterResult,progressionCommitPending:!1})}catch(r){if(t().currentRunKey!==n.currentRunKey)return;let i=r instanceof V?r.state:null;i&&g(i),e({progressionCommitPending:!1,progressionError:`Chapter result not confirmed. Retry saving or refresh.`})}},saveFieldResult:async()=>{let n=t();if(n.chapterMode||n.screen!==`results`||n.progressionCommitPending||!n.currentRunKey||!n.progression||R(n.selectedMissionId)?.activity!==`FIELD_OP`||n.fieldResult?.runId===n.currentRunKey&&n.fieldResult.missionId===n.selectedMissionId)return;let r=M(n.battle);if(!r)return;let i=n.continueRequestId||ba(`mission-continue`);e({progressionCommitPending:!0,progressionError:null,continueRequestId:i});try{let a=await ha(i,n.progression.revision,n.currentRunKey,!1,r,void 0,n.activeRulesetVersion||void 0);if(!a.fieldResult||a.fieldResult.runId!==n.currentRunKey||a.fieldResult.missionId!==n.selectedMissionId)throw new V(`invalid_progression_response`);if(t().currentRunKey!==n.currentRunKey)return;g(a.state),e({fieldResult:a.fieldResult,progressionCommitPending:!1})}catch(r){if(t().currentRunKey!==n.currentRunKey)return;let i=r instanceof V?r.state:null;i&&g(i);let a=i?.fieldOps?.lastResult;a?.runId===n.currentRunKey&&a.missionId===n.selectedMissionId?e({fieldResult:a,progressionError:null,progressionCommitPending:!1}):e({progressionCommitPending:!1,progressionError:`Result could not be recorded. Retry saving before returning or replaying.`})}},saveCampaignResult:async()=>{let n=t(),r=R(n.selectedMissionId);if(n.chapterMode||r?.operationId!==je.operationId||n.screen!==`results`||n.progressionCommitPending||!n.currentRunKey||!n.progression||!n.battle.results||n.battle.outcome===`ongoing`||n.campaignResult?.runId===n.currentRunKey&&n.campaignResult.missionId===r.missionId)return;let i=n.battle.results,a={victory:n.battle.outcome===`victory`,turns:i.turns,objectiveComplete:n.battle.outcome===`victory`,squadStanding:i.squadStanding,squadDeployed:i.squadDeployed,...n.battle.failureReason?{failureReason:n.battle.failureReason}:{}},o=n.continueRequestId||ba(`mission-continue`);e({progressionCommitPending:!0,progressionError:null,continueRequestId:o});try{let i=await ha(o,n.progression.revision,n.currentRunKey,!1,void 0,a,n.activeRulesetVersion||void 0);if(!i.campaignResult||i.campaignResult.runId!==n.currentRunKey||i.campaignResult.missionId!==r.missionId)throw new V(`invalid_progression_response`);if(t().currentRunKey!==n.currentRunKey)return;g(i.state),e({campaignResult:i.campaignResult,progressionCommitPending:!1})}catch(r){if(t().currentRunKey!==n.currentRunKey)return;let i=r instanceof V?r.state:null;if(i&&(g(i),i.operations?.[je.operationId]?.lastCompletedMissionRunId===n.currentRunKey)){e({progressionCommitPending:!1,progressionError:`Campaign save detected, but its receipt could not be verified. Refresh Tactical Ops to load the canonical state.`});return}e({progressionCommitPending:!1,progressionError:`Campaign record not saved. Retry before exiting or deploying again.`})}},openBrief:()=>{let n=t();n.foundationCompleted||n.progressionStatus===`error`||(vi(`ui`),e({screen:`brief`,identity:Hr(zr())}))},openOperationBrief:n=>{let r=t(),i=R(n);if(i?.activity===`FIELD_OP`&&!r.progression?.fieldOps?.board?.activeMissionIds.includes(n)&&r.progression?.fieldOps?.activeMissionRun?.missionId!==n){e({screen:`war-table`,progressionError:`That Field Op is no longer active. Choose one of the current three missions.`,selectedMissionId:null});return}let a=i?.activity===`FIELD_OP`?`available`:r.progression?.operations?.[i?.operationId||`broken-signal`]?.missions[n];if(!r.foundationCompleted||!i||!a||a===`locked`)return;vi(`ui`);let o=i.activity===`FIELD_OP`?r.progression?.fieldOps?.activeMissionRun:r.progression?.operations?.[i.operationId]?.activeMissionRun,s=o?.missionId===n?o.squadIds:r.progression?.fieldOps?.records[n]?.squadIds,c=s&&ke(s,r.progression?.equippedPet)?[...s]:[`alpha`,`ally-02`,`ally-03`];e({screen:`brief`,chapterMode:!1,currentChapterIntel:null,selectedMissionId:n,campaignResult:null,currentCampaignContext:o?.campaignContext||null,selectedDirectiveTier:o?.missionId===n&&o.fieldContext?.directiveTier||`standard`,selectedApproach:o?.missionId===n&&o.fieldContext?.approach||`standard`,fieldResult:null,missionFirstClear:null,selectedSquadIds:i.squadCap===3?c:[],progressionError:null,identity:Hr(zr())})},backToHub:()=>{let n=t();n.progressionCommitPending||(n.screen===`results`&&n.chapterMode&&!n.chapterResult?n.saveChapterResult():!n.chapterMode&&n.screen===`results`&&R(n.selectedMissionId)?.activity===`FIELD_OP`&&!n.fieldResult?n.saveFieldResult():!n.chapterMode&&n.screen===`results`&&R(n.selectedMissionId)?.operationId===je.operationId&&!n.campaignResult?n.saveCampaignResult():(W++,vi(`ui`),e({screen:t().foundationCompleted&&t().progression?.operations?.[`broken-signal`]?`war-table`:`hub`,battle:go(),activeRulesetVersion:null,chapterMode:!1,currentChapterIntel:null,chapterResult:null,banner:null,ticker:null,busy:!1,floats:[],queue:[],identity:Hr(zr()),selectedMissionId:null,missionFirstClear:null,selectedSquadIds:[]})))},deploy:()=>{if(t().busy||t().progressionCommitPending||t().kodaSavePending||t().shadowSavePending)return;let n=++W,r=t();if(r.onboardingEnabled&&r.progression){if(r.progressionStatus!==`ready`)return;if(r.foundationCompleted){let t=R(r.selectedMissionId);if(!t||!t.executable)return;if(t.activity===`FIELD_OP`&&!r.progression.fieldOps?.board){e({progressionError:`Refresh the War Table before deploying.`});return}let i=t.activity===`FIELD_OP`||t.operationId===je.operationId||t.objectiveType===`RECOVER`||t.objectiveType===`BOSS`?r.selectedSquadIds:void 0;if(!Ie(t,i||[],r.progression.equippedPet,r.selectedApproach)){e({progressionError:t.objectiveType===`BOSS`?`Choose exactly two companions for ALPHA.`:`Choose CNC, SHADOW or your equipped PET to accompany ALPHA.`});return}e({busy:!0,ticker:`Preparing operation run…`,progressionError:null}),(async()=>{try{let e=t.activity===`FIELD_OP`?r.progression.fieldOps?.activeMissionRun:r.progression.operations?.[t.operationId]?.activeMissionRun,a=r.chapterMode?yi:e?e.rulesContract?.rulesetVersion:r.progression.vnextStartAvailable?yi:void 0,o=await ma(ba(r.chapterMode?`chapter-start`:`mission-start`),r.progression.revision,t.missionId,i,t.activity===`FIELD_OP`?{cycleId:r.progression.fieldOps.board.cycleId,approach:r.selectedApproach,...r.progression.fieldOps.board.reportVersion===3?{reportVersion:3,directiveTier:r.selectedDirectiveTier}:{}}:void 0,a,r.chapterMode,!r.chapterMode&&t.operationId===je.operationId&&r.progression.tacticalChapter?.status===`COMPLETED`&&!r.progression.tacticalChapter.intelConsumedByRunId&&a===`tactical-intent-vnext.0`?1:void 0);if(n!==W)return;g(o.state);let s=Fe(t,o.run.fieldContext),c=o.run.combatProfileV2?.pet,l=c?{id:c.id,name:c.name,img:c.img}:o.state.equippedPet,u=Ie(s,o.run.squadIds,l,o.run.fieldContext?.approach);if(!u)throw new V(`invalid_progression_response`);v(n,o.run.runId,Gi(ut(u,{...o.state,packMastery:o.run.packMastery||{}}),o.run.combatProfileV3||null,o.run.combatProfileV2),s.objectiveType===`RECOVER`?s.terminal:void 0,t.objectiveType===`BOSS`,r.progression.intel?.routingTrace===!0,t.missionId===`broken-signal-breach`?`h1`:null,s,o.run.fieldContext,o.run.campaignContext,o.run.playerGrowth||null,o.run.rulesContract,o.run.chapterIntel)}catch(t){if(n!==W)return;let r=t instanceof V?t.code:`progression_request_failed`,i=t instanceof V?t.state:null;i&&g(i),e({screen:`war-table`,busy:!1,ticker:null,progressionError:r,selectedMissionId:null})}})();return}e({busy:!0,ticker:`Preparing Foundation run…`,progressionError:null}),(async()=>{try{let t=await da(ba(`start`),r.progression.revision,r.progression.activeRunId?r.progression.foundationRunRules?.rulesContract.rulesetVersion:r.progression.vnextStartAvailable?yi:void 0);if(n!==W)return;if(g(t),t.completed||!t.activeRunId){e({screen:`war-table`,battle:go(),busy:!1,ticker:null});return}v(n,t.activeRunId,void 0,void 0,!1,!1,null,void 0,void 0,null,null,t.foundationRunRules?.rulesContract||null)}catch(t){if(n!==W)return;let r=t instanceof V?t.code:`progression_request_failed`,i=t instanceof V?t.state:null;i&&g(i),e({screen:`brief`,busy:!1,ticker:null,progressionError:r})}})();return}let i=Hr(zr()),{onboardingEnabled:a,onboardingStageId:o}=t(),s=ei(i,Za(a,o));vi(`turn`),e({screen:`battle`,identity:i,battle:s.state,queue:ho(s.state),busy:!0,banner:null,ticker:null,floats:[],attackingId:null,impactId:null,enemyScene:null,displayHp:{},consequences:[],currentRunKey:`${o}:${n}`}),(async()=>{if(await u(s.events,n),n!==W)return;let r=_o(t().battle);r?.team===`enemy`?await m(n):e({busy:!1,ticker:r?`${r.name}  ·  move or act`:null})})()},inspectUnit:n=>{let{battle:r,busy:i,screen:a}=t();if(i||a!==`battle`)return;let o=r.units.find(e=>e.id===n);o&&!o.defeated&&(r.mode===`targeting`&&r.actionSkillId?t().selectTarget(n):(vi(`select`),e({battle:{...r,inspectId:r.inspectId===n?null:n}})))},selectCell:(i,a)=>{let{battle:o,busy:s,screen:c}=t();if(s||c!==`battle`)return;let l=o.units.find(e=>!e.defeated&&e.c===i&&e.r===a);if(l){t().inspectUnit(l.id);return}if(o.mode===`targeting`){e({battle:{...o,mode:`selected`,actionSkillId:null}});return}let u=_o(o);if(!u||u.team!==`ally`||u.hasMoved||u.hasActed)return;let d=ri(o,i,a);if(!d.ok)return;vi(`move`),e({battle:d.state,queue:ho(d.state),ticker:`${u.name}  ·  repositions`});let f=d.state.units.find(e=>e.id===u.id);f&&(n(Aa(u,f,po++),W),r(za(u,f,po++),W))},selectSkill:i=>{let{battle:s,busy:c}=t();if(c)return;let l=_o(s);if(!l||l.team!==`ally`||l.hasActed||l.defeated||!l.skillIds.includes(i))return;let d=E(A(i),l.growth);if((l.cooldowns[i]??0)>0)return;if(s.mode===`targeting`&&s.actionSkillId===i){e({battle:{...s,mode:`selected`,actionSkillId:null}});return}if(vi(`select`),!Gn(d)){let c=++W;e({busy:!0,attackingId:l.id,lastActionSkillId:i});let d=ai(s,i);if(!d.ok){e({busy:!1,attackingId:null,ticker:`${l.name}  ·  no target in range`});return}let f=Tt(t().s3CombatProof,l,i,void 0,d.events,!1,s);o(s,d.events),e({battle:d.state,queue:ho(d.state),s3CombatProof:f});let p=Ra(l,i,d.events,po++,!1);r(p,c),(async()=>{await a(p,c)&&(n(ka(l,i,d.events,po++,!1),c),await u(d.events,c),e({attackingId:null}),await h(c))})();return}let f=Wn(s.units,l,d);e({battle:{...s,mode:`targeting`,actionSkillId:i,inspectId:null},ticker:f.length===0?d.maxRange<=1?`${l.name}  ·  melee — move adjacent`:`${l.name}  ·  no target in range`:d.desc})},selectTarget:i=>{let{battle:s,busy:l}=t();if(l||s.mode!==`targeting`||!s.actionSkillId)return;let d=_o(s);if(!d||d.hasActed)return;let p=++W,m=s.actionSkillId;e({busy:!0,attackingId:d.id,lastActionSkillId:m});let g=ai(s,m,i);if(!g.ok){e({busy:!1,attackingId:null});return}let _=bi?uo(f,s,g.state,d.id,i,m,g.events):{cycle:f,interrupted:!1};_.interrupted&&(f=_.cycle,g.events.push({type:`info`,buildEvidence:`${d.name} PRESSURE canceled ${i}'s locked enemy intent.`}));let v=Tt(t().s3CombatProof,d,m,i,g.events,_.interrupted,s);o(s,g.events),e({s3CombatProof:v,battle:g.state,queue:ho(g.state),..._.interrupted?{threats:f.pending.map(e=>e.plan)}:{}});let y=Ra(d,m,g.events,po++,_.interrupted);r(y,p),(async()=>{await a(y,p)&&(n(ka(d,m,g.events,po++,_.interrupted),p),await u(g.events,p),_.interrupted&&(c(Va(_.interrupted,i,g.events),p),e({ticker:`SIGNAL INTERRUPTED · ENEMY INTENT CANCELED`}),vi(`status`)),e({attackingId:null}),await h(p))})()},selectRecover:()=>{let{battle:n,busy:i}=t();if(i)return;let a=_o(n);if(!a||a.team!==`ally`||a.hasActed||a.defeated)return;let o=ni(n);if(!o.ok){e({ticker:`${a.name}  ·  move adjacent to the relay terminal`});return}let s=++W;if(a.defId.startsWith(`pet:`)&&n.objective?.type===`RECOVER`){let e=Math.max(Math.abs(a.c-n.objective.terminal.c),Math.abs(a.r-n.objective.terminal.r));o.events.push({type:`info`,buildEvidence:`PET recovered the relay from ${e} cells (accepted reach ${a.recoverRange||1}).`})}e({busy:!0,battle:o.state,queue:ho(o.state),ticker:`SIGNAL RECOVERED`}),n.objective?.type===`RECOVER`&&r([La(`objective_recover`,po++,void 0,n.objective.terminal)],s),(async()=>{await u(o.events,s),await h(s)})()},selectKodaSidegrade:e=>_(`koda`,e),selectShadowSidegrade:e=>_(`shadow`,e),toggleCommanderTeammate:n=>{let r=t();if(r.screen!==`brief`||r.busy||r.kodaSavePending||r.shadowSavePending||r.selectedMissionId!==`broken-signal-commander`&&R(r.selectedMissionId)?.activity!==`FIELD_OP`&&R(r.selectedMissionId)?.operationId!==je.operationId||!Oe([`alpha`,n],r.progression?.equippedPet))return;let i=r.selectedSquadIds.slice(1);e({selectedSquadIds:[`alpha`,...i.includes(n)?i.filter(e=>e!==n):i.length<2?[...i,n]:i],progressionError:null})},selectRecoverTeammate:n=>{let r=t();r.screen!==`brief`||r.busy||r.kodaSavePending||r.shadowSavePending||r.selectedMissionId!==`broken-signal-recover`||Oe([`alpha`,n],r.progression?.equippedPet)&&e({selectedSquadIds:[`alpha`,n],progressionError:null})},skipTurn:()=>{let{battle:n,busy:r}=t();if(r)return;let i=_o(n);if(!i||i.team!==`ally`||i.hasActed)return;let a=++W,o=ii(n);o.ok&&(e({battle:o.state,busy:!0,ticker:o.events[0]?.text??null}),h(a))},cancel:()=>{let{battle:n,busy:r}=t();r||(n.mode===`targeting`?e({battle:{...n,mode:`selected`,actionSkillId:null}}):e({battle:{...n,inspectId:null}}))},replay:()=>{let e=t();if(!e.progressionCommitPending){if(e.chapterMode){if(e.screen===`results`&&!e.chapterResult){e.saveChapterResult();return}t().backToHub(),t().openChapterBrief()}else if(R(e.selectedMissionId)?.operationId===je.operationId&&e.screen===`results`){if(!e.campaignResult||e.campaignResult.runId!==e.currentRunKey||e.campaignResult.missionId!==e.selectedMissionId){e.saveCampaignResult();return}e.continueOnboarding(!0)}else R(e.selectedMissionId)?.activity===`FIELD_OP`?e.screen===`results`?e.continueOnboarding(!0):e.selectedMissionId&&(W++,e.openOperationBrief(e.selectedMissionId)):e.deploy()}},continueOnboarding:(n=!1)=>{let r=t();if(r.screen!==`results`)return;if(r.chapterMode){if(!r.chapterResult){r.saveChapterResult();return}t().backToHub();return}if(R(r.selectedMissionId)?.activity===`FIELD_OP`){if(!r.fieldResult||r.fieldResult.runId!==r.currentRunKey||r.fieldResult.missionId!==r.selectedMissionId){t().saveFieldResult();return}if(r.progressionCommitPending)return;t().backToHub(),n&&r.selectedMissionId&&(t().openOperationBrief(r.selectedMissionId),t().selectDirectiveTier(r.selectedDirectiveTier),t().selectApproach(r.selectedApproach));return}if(R(r.selectedMissionId)?.operationId===je.operationId){if(r.progressionCommitPending)return;if(!r.campaignResult||r.campaignResult.runId!==r.currentRunKey||r.campaignResult.missionId!==r.selectedMissionId){r.saveCampaignResult();return}let e=r.selectedMissionId;t().backToHub(),n&&e&&t().openOperationBrief(e);return}if(r.battle.outcome!==`victory`)return;if(r.foundationCompleted&&r.selectedMissionId){if(r.progressionCommitPending||!r.currentRunKey||!r.progression)return;let i=r.continueRequestId||ba(`mission-continue`);e({progressionCommitPending:!0,progressionError:null,continueRequestId:i}),(async()=>{try{let a=await ha(i,r.progression.revision,r.currentRunKey,r.selectedMissionId===`broken-signal-breach`&&r.battle.routingTraceAcquired,void 0,void 0,r.activeRulesetVersion||void 0);g(a.state),W++,vi(`ui`),e({screen:`war-table`,battle:go(),banner:null,ticker:null,busy:!1,floats:[],queue:[],currentRunKey:null,continueRequestId:null,missionFirstClear:R(r.selectedMissionId)?.activity===`FIELD_OP`?null:a.firstClear,selectedMissionId:null,selectedSquadIds:[]}),n===!0&&r.selectedMissionId&&t().openOperationBrief(r.selectedMissionId)}catch(t){let n=t instanceof V?t.code:`progression_request_failed`,r=t instanceof V?t.state:null;r&&g(r),e({progressionCommitPending:!1,progressionError:n})}})();return}if(!r.onboardingEnabled){t().backToHub();return}if(r.progression){if(r.progressionCommitPending||!r.currentRunKey)return;let t=r.continueRequestId||ba(`continue`);e({progressionCommitPending:!0,progressionError:null,continueRequestId:t}),(async()=>{try{let n=await fa(t,r.progression.revision,r.currentRunKey,r.progression.foundationRunRules?.rulesContract.rulesetVersion);if(g(n),W++,vi(`ui`),n.completed){e({screen:`war-table`,battle:go(),banner:null,ticker:null,busy:!1,floats:[],queue:[],currentRunKey:null,continueRequestId:null});return}e({screen:`brief`,battle:go(),banner:null,ticker:null,busy:!1,floats:[],queue:[],currentRunKey:null,continueRequestId:null,identity:Hr(zr())})}catch(t){let n=t instanceof V?t.code:`progression_request_failed`,i=t instanceof V?t.state:null;i&&(g(i),i.completed?e({screen:`war-table`,battle:go(),currentRunKey:null,continueRequestId:null}):i.foundationStage!==r.onboardingStageId&&e({screen:`brief`,battle:go(),currentRunKey:null,continueRequestId:null})),e({progressionCommitPending:!1,progressionError:n})}})();return}let i=Xa(r.onboardingStageId),a=r.currentRunKey;if(a&&r.lastVictoryKey!==a){let n={...r.onboardingCompleted,[i.id]:!0},o=i.next;if(e({onboardingCompleted:n,lastVictoryKey:a,onboardingStageId:o??i.id}),!o){t().backToHub();return}}else if(!i.next){t().backToHub();return}W++,vi(`ui`),e({screen:`brief`,battle:go(),banner:null,ticker:null,busy:!1,floats:[],queue:[],identity:Hr(zr())})},dismissSector:()=>{vi(`ui`),e({screen:`results`}),t().chapterMode?t().saveChapterResult():R(t().selectedMissionId)?.activity===`FIELD_OP`&&t().saveFieldResult(),!t().chapterMode&&R(t().selectedMissionId)?.operationId===je.operationId&&t().saveCampaignResult()},toggleMute:()=>{let n=!t().muted;hi(n),e({muted:n})}}});function yo(){let e=G.getState(),t=e.battle,n=_o(t),r=e.identity;return{version:H,screen:e.screen,turn:t.round,phase:n?.team===`enemy`?`enemy`:`player`,mode:t.mode,selectedId:t.activeId,busy:e.busy,units:t.units.map(e=>({id:e.id,name:e.name,side:e.team,hp:e.hp,maxHp:e.maxHp,atk:e.atk,def:e.def,spd:e.spd,move:e.move,c:e.c,r:e.r,hasMoved:e.hasMoved,hasActed:e.hasActed,guarding:e.statuses.some(e=>e.type===`GUARD`),defeated:e.defeated,strikeRange:ci(e),statuses:e.statuses,cooldowns:e.cooldowns})),results:t.results,activeId:t.activeId,queue:e.queue,identity:{source:r.source,live:r.live,unitName:r.unitName,skinKey:r.skinKey,skinName:r.skinName,weapon:r.weaponLabel,armor:r.armorLabel,summary:r.summary}}}function bo(){let{battle:e,busy:t}=G.getState();if(t||e.mode===`targeting`)return[];let n=_o(e);return!n||n.team!==`ally`||n.hasMoved||n.hasActed||n.defeated?[]:Ln(n,e.units)}function xo(){let{battle:e}=G.getState(),t=new Set;if(e.mode!==`targeting`||!e.actionSkillId)return t;let n=_o(e);if(!n)return t;try{let r=E(A(e.actionSkillId),n.growth);for(let i of Wn(e.units,n,r))t.add(i)}catch{}return t}typeof window<`u`&&(window.__tactical=G);function So(e,t){if(t!==`solo-1`||e.outcome!==`ongoing`)return null;let n=e.units.find(t=>t.id===e.activeId),r=e.units.find(e=>e.team===`enemy`&&!e.defeated);if(!n||n.defId!==`alpha`||n.defeated||n.hasActed||!r||e.mode===`targeting`)return null;let i=E(A(`alpha-strike`),n.growth);return(n.cooldowns[i.id]??0)===0&&Wn(e.units,n,i).includes(r.id)?{title:`STRIKE IS READY`,copy:`Tap STRIKE (A1), then tap the highlighted scout.`}:n.hasMoved?{title:`NEXT TURN`,copy:`Still too far away. Tap SKIP, then move closer on Alpha's next turn.`}:Ln(n,e.units).length>0?{title:`MOVE TOWARD SCOUT`,copy:`Tap a highlighted tile. Get 1 tile away from the scout to use STRIKE.`}:{title:`NO MOVE AVAILABLE`,copy:`Choose an available action or SKIP to advance the turn.`}}function Co(e,t){if(e.outcome!==`ongoing`)return null;let n=e.units.find(t=>t.id===e.activeId);if(!n||n.team!==`ally`||n.defeated||n.hasActed)return null;let r=e.units.filter(e=>!e.defeated&&e.team===`ally`),i=e.units.some(e=>e.defId===`alpha`&&e.defeated);if(e.mode===`targeting`&&e.actionSkillId){let t=E(A(e.actionSkillId),n.growth),r=Wn(e.units,n,t).length;return r===0?{title:`NO TARGET IN RANGE`,copy:n.hasMoved?`This skill cannot hit from here. Tap the skill again to cancel, then choose another ability or SKIP.`:`Tap the skill again to cancel. Move closer, then try again.`}:{title:`TARGET READY`,copy:`Tap one of the ${r} highlighted legal targets to use ${t.name}.`}}let a=n.skillIds.map(e=>E(A(e),n.growth)).filter(e=>(n.cooldowns[e.id]??0)===0).some(t=>(t.targetType===`ENEMY_SINGLE`||t.targetType===`AREA_RADIUS`)&&Wn(e.units,n,t).length>0);return i&&r.length>0?{title:`THE PACK FIGHTS ON`,copy:a?`${n.name} can still attack. Select a skill and a highlighted target.`:n.hasMoved?`${n.name} has no enemy in range. Use a support skill or SKIP to pass the turn.`:`${n.name} is still active. Move into range, use support, or SKIP.`}:t?.objectiveType===`HOLD`&&e.objective?.type===`HOLD`&&!e.units.some(e=>e.team===`enemy`&&!e.defeated)?{title:`SECURE THE RELAY`,copy:`No hostiles remain. Move a living ally into the marked HOLD zone and maintain control through the required round changes.`}:t?.objectiveType===`SURVIVE`&&e.objective?.type===`SURVIVE`&&!e.units.some(e=>e.team===`enemy`&&!e.defeated)?{title:`HOLD FORMATION`,copy:`Enemies cleared. Keep every squad member alive until the survival timer completes. Use SKIP to advance turns.`}:!a&&!n.hasMoved&&Ln(n,e.units).length>0?{title:`POSITION FIRST`,copy:`No enemy in attack range. Move into range or use an available support skill.`}:!a&&n.hasMoved?{title:`NO ATTACK IN RANGE`,copy:`Use an available support skill or SKIP. Your next turn will come.`}:t?.objectiveType===`HOLD`?{title:`HOLD THE RELAY`,copy:`Keep a living ally inside the marked zone. Clear enemies contesting it.`}:t?.objectiveType===`SURVIVE`?{title:`SURVIVE THE WAVES`,copy:`Keep your squad standing until the required round. Eliminating enemies early does not end the timer.`}:t?.objectiveType===`RECOVER`?{title:`REACH THE RELAY`,copy:`Approach the terminal and activate RECOVER when the signal is open.`}:null}function wo(e,t,n){if(!t||t.defId!==`ally-02`||t.growth?.discipline!==`disruptor`)return[];let r=new Set(n.map(e=>e.enemyId));return[...new Set(rr(e,t).filter(e=>e.ready&&(e.id===`u02-suppress`||e.id===`u02-pressure-disruptor`||e.id.startsWith(`u02-pressure-disruptor:mastery:`)||e.id.startsWith(`u02-suppress:mastery:`))&&e.effects.some(e=>e.kind===`status`)).flatMap(e=>e.targets.filter(e=>r.has(e))))]}function To(e){let{battle:t,busy:n}=e,r=t.units.find(e=>e.id===t.activeId),i=!!r&&r.team===`ally`&&!r.defeated&&!r.hasActed&&!n&&t.outcome===`ongoing`,a=t.outcome===`ongoing`&&e.activeRulesetVersion===`tactical-intent-vnext.0`?e.threats.filter(e=>e.rulesetVersion===yi):[],o=new Set(a.flatMap(e=>e.impactTiles.map(e=>Nn(e.c,e.r)))),s=i&&t.mode===`targeting`&&!!t.actionSkillId,c=r?rr(t,r):[],l=c.find(e=>e.id===t.actionSkillId),u=s&&l?.ready?l.targets:[],d=i?wo(t,r,a):[],f=(i&&!r.hasMoved&&!s?Ln(r,t.units):[]).some(e=>!o.has(Nn(e.c,e.r))),p=So(t,e.onboardingStageId),m=p||Co(t,e.mission),h=Je(t),g=Ye(t),_=a.map((e,n)=>({id:e.enemyId,label:`${n+1}`,name:t.units.find(t=>t.id===e.enemyId)?.name||`Enemy`,effect:e.predictedEffect})),v=s?u.length?`${l?.name} · ${u.length} legal target${u.length===1?``:`s`}`:r?.hasMoved?`No target · cancel, use support or Skip`:`No target in range · cancel to reposition`:null,y=e.consequences.find(e=>e.kind===`counter`),b=e.floats.find(e=>e.kind===`heal`||e.kind===`dmg`),x=e.combatMoment,S=y?`INTERRUPTED · enemy intent canceled`:b?`${b.kind===`heal`?`HEAL`:`HIT`} ${b.text} · ${t.units.find(e=>e.id===b.unitId)?.name||`unit`}`:x?`${x.title} · ${x.consequence}`:null,C=a.length?`REACT`:s?`TARGET`:n&&S?`RESOLVE`:i?`READ`:`WAIT`,w,T;return C===`REACT`?(w=`INCOMING ${a.length}`,T=v||(d.length?`Interrupt available · target a marked source`:f?`Move off striped cells · attack remains locked`:`Striped cells mark the announced attack`)):C===`TARGET`?(w=u.length?`CHOOSE TARGET`:`NO TARGET`,T=v):C===`RESOLVE`?(w=`RESOLVED`,T=S):C===`WAIT`?(w=t.outcome===`victory`?`SECTOR SECURED`:t.outcome===`defeat`?`OPERATION FAILED`:r?.team===`enemy`?`ENEMY ACTION`:`RESOLVING`,T=S||(r?r.name:`Preparing next activation`)):(w=p?.title||(m?.title===`THE PACK FIGHTS ON`?m.title:r?.hasMoved?`CHOOSE ACTION`:`READ THE FIELD`),T=m?.copy||g.action),!a.length&&!s&&t.reinforcement?.telegraphed&&!t.reinforcement.spawned&&C===`READ`&&(w=`REINFORCEMENT INBOUND`,T=`Marked entry · not spawned yet`),{mode:C,actor:r,interactive:i,targeting:s,targetIds:u,interruptTargetIds:d,threats:a,danger:o,sources:_,objective:h,title:w,detail:T,result:S,actions:c.map(e=>({id:e.id,reason:i?e.ready?Gn(e)&&!e.targets.length?`NO TARGET`:t.actionSkillId===e.id&&s?`CANCEL`:`READY`:`CD ${e.cd}`:`WAIT`})),showFallbackImpact:e.combatFx.length===0,showFallbackMasterFx:!1,primaryFx:e.combatFx.some(e=>e.name===`cnc_interrupt`)?e.combatFx.filter(e=>e.name!==`cnc_pressure`).map(t=>t.name===`cnc_interrupt`?{...t,durationMs:e.combatFx.find(e=>e.name===`cnc_pressure`)?.durationMs??t.durationMs}:t):e.combatFx}}function Eo(e,t,n){return{"--cell-touch-w":`${(68+e/Math.max(1,n-1)*16)/Math.max(1,t-1)*.88}cqw`,"--cell-touch-h":`${52/Math.max(1,n-1)*.88}cqh`}}var Do={"alpha-rend":{archetype:`heavy`,cue:`CLOSE · BLEED`,effectClass:`control`},"alpha-howl":{archetype:`support`,cue:`AURA · R2`,targetClass:`aura`,effectClass:`buff`},"pet-hamstring":{archetype:`control`,cue:`CLOSE · SLOW`,effectClass:`control`},"u02-suppress":{archetype:`control`,cue:`CONTROL · 3`,effectClass:`control`},"u02-pressure-disruptor":{archetype:`control`,cue:`CONTROL · 3`,effectClass:`control`},"u03-mend":{archetype:`heal`,cue:`ALLY · 3`,targetClass:`ally`,effectClass:`heal`},"u03-mend-restorer":{archetype:`heal`,cue:`AURA · R1`,targetClass:`aura`,effectClass:`heal`},"u03-pack":{archetype:`support`,cue:`AURA · R2`,targetClass:`aura`,effectClass:`buff`},"u03-pack-warden":{archetype:`support`,cue:`AURA · R2`,targetClass:`aura`,effectClass:`buff`}};function Oo(e){return e.targetType===`ALLY_AOE`?`aura`:e.targetType===`ALLY_SINGLE`||e.targetType===`SELF`?`ally`:`enemy`}function ko(e){if(e.effects.some(e=>e.kind===`heal`))return`heal`;let t=e.effects.filter(e=>e.kind===`status`);return t.some(e=>e.status&&String(e.status).endsWith(`_DOWN`))||t.some(e=>e.status===`BLEED`)?`control`:t.length?`buff`:`damage`}function Ao(e,t){return t===`heal`?`heal`:t===`control`?`control`:t===`buff`?`support`:e.effects.some(e=>e.kind===`damage`&&(e.multiplier??1)>=1.35)?`heavy`:`strike`}function jo(e,t){return e.targetType===`ALLY_AOE`?`AURA · R${Math.max(1,e.radius)}`:e.targetType===`ALLY_SINGLE`?`ALLY · ${e.maxRange}`:e.targetType===`SELF`?`SELF`:t===`control`?e.maxRange<=1?`CLOSE · CTRL`:`CONTROL · ${e.maxRange}`:e.maxRange<=1?`CLOSE · 1`:`REACH · ${e.maxRange}`}function Mo(e){let t=ko(e),n={archetype:Ao(e,t),cue:jo(e,t),targetClass:Oo(e),effectClass:t},r=Do[T(e.id)]||{};return{...n,...r,cue:e.targetType===`ALLY_AOE`?`AURA · R${Math.max(1,e.radius)}`:jo(e,t)}}var No={archetype:`objective`,cue:`OBJECTIVE`,targetClass:`objective`,effectClass:`objective`},Po=`/images/tactical_ops/emblems`,Fo={alpha:{core:`${Po}/emblem_alpha_core.png`,vanguard:`${Po}/emblem_alpha_vanguard.png`,howlkeeper:`${Po}/emblem_alpha_howlkeeper.png`},"ally-02":{core:`${Po}/emblem_cnc_core.png`,pursuer:`${Po}/emblem_cnc_pursuer.png`,disruptor:`${Po}/emblem_cnc_disruptor.png`},"ally-03":{core:`${Po}/emblem_shadow_core.png`,sentinel:`${Po}/emblem_shadow_sentinel.png`,medic:`${Po}/emblem_shadow_medic.png`}};function Io(e,t){if(!Object.prototype.hasOwnProperty.call(Fo,e))return null;let n=Fo[e];return(t&&Object.prototype.hasOwnProperty.call(n,t)?n[t]:n.core)||null}var Lo={action_alpha_strike:`/images/tactical_ops/actions/action_alpha_strike.png`,action_alpha_rend:`/images/tactical_ops/actions/action_alpha_rend.png`,action_alpha_howl:`/images/tactical_ops/actions/action_alpha_howl.png`,action_cnc_thrust:`/images/tactical_ops/actions/action_cnc_thrust.png`,action_cnc_lunge:`/images/tactical_ops/actions/action_cnc_lunge.png`,action_cnc_pressure:`/images/tactical_ops/actions/action_cnc_pressure.png`,action_shadow_sweep:`/images/tactical_ops/actions/action_shadow_sweep.png`,action_shadow_mend:`/images/tactical_ops/actions/action_shadow_mend.png`,action_shadow_pack_support:`/images/tactical_ops/actions/action_shadow_pack_support.png`,action_pet_bite:`/images/tactical_ops/actions/action_pet_bite.png`,action_pet_hamstring:`/images/tactical_ops/actions/action_pet_hamstring.png`,action_system_move:`/images/tactical_ops/actions/action_system_move.png`,action_system_recover:`/images/tactical_ops/actions/action_system_recover.png`,action_system_skip:`/images/tactical_ops/actions/action_system_skip.png`},Ro={"alpha-strike":`action_alpha_strike`,"alpha-rend":`action_alpha_rend`,"alpha-howl":`action_alpha_howl`,"u02-shot":`action_cnc_thrust`,"u02-burst":`action_cnc_lunge`,"u02-lunge-vanguard":`action_cnc_lunge`,"u02-suppress":`action_cnc_pressure`,"u02-pressure-disruptor":`action_cnc_pressure`,"u03-tap":`action_shadow_sweep`,"u03-mend":`action_shadow_mend`,"u03-mend-restorer":`action_shadow_mend`,"u03-pack":`action_shadow_pack_support`,"u03-pack-warden":`action_shadow_pack_support`,"pet-bite":`action_pet_bite`,"pet-hamstring":`action_pet_hamstring`};function zo(e){let t=Ro[e.split(`:mastery:`)[0]];return t?Lo[t]:null}function Bo(e){return e===`move`?Lo.action_system_move:e===`recover`?Lo.action_system_recover:Lo.action_system_skip}var Vo=s((e=>{var t=Symbol.for(`react.transitional.element`),n=Symbol.for(`react.fragment`);function r(e,n,r){var i=null;if(r!==void 0&&(i=``+r),n.key!==void 0&&(i=``+n.key),`key`in n)for(var a in r={},n)a!==`key`&&(r[a]=n[a]);else r=n;return n=r.ref,{$$typeof:t,type:e,key:i,ref:n===void 0?null:n,props:r}}e.Fragment=n,e.jsx=r,e.jsxs=r})),K=s(((e,t)=>{t.exports=Vo()}))(),Ho={battlefield:`/images/tactical_ops/presentation/tactical_ops_battlefield_backdrop.png`,traceTarget:`/images/tactical_ops/presentation/tactical_ops_trace_target.png`,signalRecovery:`/images/tactical_ops/presentation/tactical_ops_signal_recovery_marker.png`,bossTarget:`/images/tactical_ops/presentation/tactical_ops_boss_target.png`,reinforcementWarning:`/images/tactical_ops/presentation/tactical_ops_reinforcement_warning.png`};function Uo(e,t,n){let r=t.c-e.c,i=t.r-e.r;return!r&&!i?n:Math.abs(r)>=Math.abs(i)?r>0?`right`:`left`:i>0?`front`:`back`}var Wo=e=>`/images/tactical_ops/alpha_directional/${e}.png`;function Go(e,t){return e.team===`ally`&&e.role===`alpha`&&e.sprite===`/images/tactical_ops/alpha.png`&&!t.skinKey?.trim()&&!t.skinUrl?.trim()&&t.source!==`skin`&&t.source!==`character-image`}function Ko(){if(typeof window>`u`)return null;let e=window,t=e.__PROFILE__||e.PROFILE||e.profileState||e.lastProfile||{},n=t.level??t.lv??t.hero_level??t.heroLevel,r=typeof n==`number`?n:Number(n);return Number.isFinite(r)&&r>0?Math.floor(r):null}function qo(e){return e===`ATK_UP`||e===`DEF_UP`||e===`SPD_UP`||e===`GUARD`}function Jo(e){return e.role===`leader`?`leader`:e.role===`hostile`?`hound`:e.role===`alpha`?`alpha`:e.role===`ranged`||e.role===`skirmisher`?`skirmisher`:e.role===`support`?`support`:``}function Yo({archetype:e}){let t={className:`t-act-svg`,"aria-hidden":!0};return e===`strike`?(0,K.jsx)(Yt,{...t}):e===`heavy`?(0,K.jsx)(Vt,{...t}):e===`control`?(0,K.jsx)(Wt,{...t}):e===`heal`?(0,K.jsx)(Gt,{...t}):e===`support`?(0,K.jsx)(Jt,{...t}):e===`objective`?(0,K.jsx)(Zt,{...t}):(0,K.jsx)(Xt,{...t})}function Xo({src:e,archetype:t,fallback:n}){let r=n===`skip`?(0,K.jsx)(Ut,{className:`t-act-svg`,"aria-hidden":`true`}):(0,K.jsx)(Yo,{archetype:t});return e?(0,K.jsxs)(`span`,{className:`t-act-art`,"aria-hidden":`true`,children:[(0,K.jsx)(`img`,{className:`t-act-image`,src:e,alt:``,draggable:!1,decoding:`async`,onError:e=>e.currentTarget.parentElement?.classList.add(`has-icon-error`)}),(0,K.jsx)(`span`,{className:`t-act-fallback`,children:r})]},e):r}function Zo(e,t,n){let r=t-n;return r===0?`${e} ${t}`:`${e} ${r>0?`+`:``}${r}`}function Qo({selected:e,guarding:t}){return(0,K.jsxs)(`svg`,{className:`t-ring`,viewBox:`0 0 100 36`,"aria-hidden":`true`,children:[(0,K.jsx)(`ellipse`,{cx:`50`,cy:`22`,rx:e?40:34,ry:e?12:10,fill:`none`,stroke:`currentColor`,strokeWidth:e?1.8:1.2,opacity:e?.95:.55}),(0,K.jsx)(`ellipse`,{cx:`50`,cy:`22`,rx:e?32:26,ry:e?9:7,fill:`none`,stroke:`currentColor`,strokeWidth:`0.7`,opacity:`0.4`,strokeDasharray:`2 3`}),t?(0,K.jsx)(`ellipse`,{cx:`50`,cy:`22`,rx:`44`,ry:`13.5`,fill:`none`,stroke:`currentColor`,strokeWidth:`1`,opacity:`0.85`}):null]})}function $o({unit:e,selected:t,validTarget:n,targeting:r,attacking:i,inspecting:a,signalCarrier:o,interceptTarget:s=!1,hitReacting:c=!1,travelGhost:l=!1,shownHp:u,facingTarget:d}){let f=zn(e.c,e.r),p=u??e.hp,m=G(e=>e.inspectUnit),h=G(e=>e.selectTarget),g=G(e=>e.busy),_=G(e=>e.identity),v=e.team===`ally`&&e.role===`alpha`,b=Go(e,_),[x,S]=(0,y.useState)(!1),C=[`t-token`,e.team,Jo(e),b&&!x?`directional-alpha`:``,e.defeated&&p<=0?`defeated`:``,e.hasActed?`acted`:``,t?`selected active`:``,a?`inspect`:``,r&&!n&&!t?`subdued`:``,r&&n?`targetable`:``,i?`attacking`:``,c?`hit-reacting`:``,l?`travel-ghost`:``,o?`trace-carrier`:``,e.role===`leader`?`boss-target`:``,`depth-${Math.max(0,Math.min(4,Math.floor(e.r*4/(mn-1))))}`,e.c<=1?`edge-left`:``,e.c>=z-2?`edge-right`:``].filter(Boolean).join(` `),w=(0,y.useRef)({c:e.c,r:e.r}),[T,E]=(0,y.useState)(`front`);(0,y.useLayoutEffect)(()=>{let t=w.current;(t.c!==e.c||t.r!==e.r)&&(E(n=>Uo(t,e,n)),w.current={c:e.c,r:e.r})},[e.c,e.r]),(0,y.useLayoutEffect)(()=>{d&&E(t=>Uo(e,d,t))},[d?.c,d?.r,e.c,e.r]);let D=b&&!x?Wo(T):i&&e.attackSprite?e.attackSprite:e.sprite;return(0,K.jsxs)(K.Fragment,{children:[(0,K.jsxs)(`div`,{className:C,style:{left:`${f.x}%`,top:`${f.y}%`,zIndex:4+e.r*4+(t?2:0)},children:[(0,K.jsx)(Qo,{selected:t,guarding:e.statuses.some(e=>e.type===`GUARD`)&&!e.defeated}),r&&n&&!e.defeated?(0,K.jsxs)(`span`,{className:`t-target-reticle ${e.team}`,"aria-hidden":`true`,children:[(0,K.jsx)(`i`,{}),(0,K.jsx)(`i`,{}),(0,K.jsx)(`i`,{}),(0,K.jsx)(`i`,{})]}):null,e.archetype&&!e.defeated?(0,K.jsx)(`span`,{className:`t-enemy-archetype t-archetype-${e.archetype.toLowerCase()}`,"aria-label":`Enemy class: ${e.archetype}`,children:e.archetype}):null,o&&!e.defeated?(0,K.jsxs)(K.Fragment,{children:[(0,K.jsx)(`img`,{className:`t-token-marker trace`,src:Ho.traceTarget,alt:``}),(0,K.jsx)(`span`,{className:`t-objective-badge trace`,children:`TRACE TARGET`})]}):null,s&&!e.defeated?(0,K.jsxs)(K.Fragment,{children:[(0,K.jsx)(`img`,{className:`t-token-marker trace`,src:Ho.traceTarget,alt:``}),(0,K.jsx)(`span`,{className:`t-objective-badge trace`,children:`COURIER`})]}):null,e.role===`leader`&&!e.defeated?(0,K.jsxs)(K.Fragment,{children:[(0,K.jsx)(`img`,{className:`t-token-marker boss`,src:Ho.bossTarget,alt:``}),(0,K.jsx)(`span`,{className:`t-objective-badge boss`,children:`BOSS`})]}):null,b&&!x?(0,K.jsx)(`span`,{className:`t-alpha-ground-shadow`,"aria-hidden":`true`}):null,(0,K.jsx)(`img`,{className:`body`,src:D,alt:``,draggable:!1,onError:v&&!x?()=>S(!0):void 0}),p<=0?null:(0,K.jsxs)(`div`,{className:`t-plate`,children:[(0,K.jsx)(`div`,{className:`t-plate-name`,children:(0,K.jsx)(`span`,{children:e.name})}),(0,K.jsxs)(`div`,{className:`t-hp`,children:[(0,K.jsx)(`div`,{className:`t-hp-bar`,children:(0,K.jsx)(`i`,{style:{width:`${p/e.maxHp*100}%`}})}),(0,K.jsxs)(`span`,{className:`t-hp-num`,children:[p,`/`,e.maxHp]})]}),e.statuses.length?(0,K.jsx)(`div`,{className:`t-chips`,children:e.statuses.slice(0,3).map(e=>(0,K.jsx)(`span`,{className:`t-chip ${qo(e.type)?`buff`:`debuff`}`,children:On[e.type]},e.id))}):null,o&&!e.defeated?(0,K.jsx)(`div`,{className:`t-chips`,children:(0,K.jsx)(`span`,{className:`t-chip buff`,children:`TRACE`})}):null]})]}),(0,K.jsx)(`button`,{type:`button`,className:`t-hit t-unit-hit${r&&n?` is-legal-target`:``}`,disabled:g||e.defeated,"data-unit-id":e.id,style:{left:`${f.x}%`,top:`${f.y}%`,...Eo(e.r,z,mn)},"aria-label":`${e.name}. ${p}/${e.maxHp} HP${r&&n?`. Legal target`:``}`,onClick:t=>{t.detail===0&&(r&&n?h(e.id):m(e.id))},onPointerDown:t=>{t.stopPropagation(),pi(),r&&n?h(e.id):m(e.id)}})]})}function es({unit:e}){let[t,n]=(0,y.useState)(!1),r=e.portrait||e.sprite;return(0,K.jsxs)(`span`,{className:`t-status-portrait`,"aria-hidden":`true`,children:[!t&&r?(0,K.jsx)(`img`,{src:r,alt:``,onError:()=>n(!0)},r):null,(0,K.jsx)(Kt,{className:`t-status-portrait-fallback`})]})}function ts(){let e=G(e=>e.battle.inspectId),t=G(e=>e.battle.activeId),n=G(e=>e.battle.units),r=G(e=>e.displayHp),i=G(e=>e.identity),a=G(e=>e.progression?.equippedPet),[o,s]=(0,y.useState)(!1),c=n.find(e=>e.id===t)||n.find(e=>e.team===`ally`&&!e.defeated),l=n.find(t=>t.id===e);if(!c)return null;let u=r[c.id]??c.hp,d=c.role===`alpha`||c.defId===`alpha`||c.id===`alpha`,f=d?Ko():null,p=d?[f==null?null:`Lv ${f}`,i.skinName||i.armorLabel||i.weaponLabel].filter(Boolean).join(` · `):``,m=Cn(c),h=wn(c),g=`${l&&l.id!==c.id?`${l.name} ${r[l.id]??l.hp}/${l.maxHp} HP · `:``}ATK ${m} · DEF ${h} · SPD ${Tn(c)} · MOV ${c.move}${p?` · ${p}`:``}`;return(0,K.jsxs)(`button`,{type:`button`,className:`t-status t-hud-card ${o?`is-expanded`:``} ${c.team}${d?` is-alpha`:``}`,onClick:()=>s(e=>!e),"aria-expanded":o,"aria-label":`Acting unit: ${c.name}, ${u} of ${c.maxHp} HP. ${o?g+`. Tap to close details`:`Toggle combat details`}`,children:[(0,K.jsx)(es,{unit:c},c.id),(0,K.jsxs)(`div`,{className:`t-status-main`,children:[(0,K.jsxs)(`div`,{className:`t-status-head`,children:[(0,K.jsx)(`div`,{className:`t-status-name`,children:c.name}),d&&a?(0,K.jsx)(`span`,{className:`t-status-pet`,title:a.name,children:(0,K.jsx)(Kt,{className:`t-ico`,"aria-hidden":`true`})}):null]}),Da(c)?(0,K.jsxs)(`span`,{className:`t-combat-identity t-identity-${Sa(c)}`,children:[Io(c.defId,c.growth?.discipline)?(0,K.jsx)(`img`,{className:`t-combat-emblem`,src:Io(c.defId,c.growth?.discipline),alt:``,onError:e=>{e.currentTarget.style.display=`none`}}):null,Da(c)]}):null,p?(0,K.jsx)(`div`,{className:`t-status-kit`,children:p}):null,(0,K.jsxs)(`div`,{className:`t-status-mods`,children:[(0,K.jsx)(`span`,{children:Zo(`ATK`,m,c.atk)}),(0,K.jsx)(`span`,{children:Zo(`DEF`,h,c.def)})]}),(0,K.jsxs)(`div`,{className:`t-hp`,children:[(0,K.jsx)(`div`,{className:`t-hp-bar`,children:(0,K.jsx)(`i`,{style:{width:`${u/c.maxHp*100}%`}})}),(0,K.jsxs)(`span`,{className:`t-hp-num`,children:[u,`/`,c.maxHp]})]}),c.statuses.length?(0,K.jsx)(`div`,{className:`t-chips`,children:c.statuses.slice(0,3).map(e=>(0,K.jsx)(`span`,{className:`t-chip ${qo(e.type)?`buff`:`debuff`}`,children:On[e.type]},e.id))}):null]}),(0,K.jsx)(`span`,{className:`t-status-detail`,children:g}),(0,K.jsxs)(`dl`,{className:`t-status-stats`,children:[(0,K.jsxs)(`div`,{children:[(0,K.jsx)(`dt`,{children:`ATK`}),(0,K.jsx)(`dd`,{children:m})]}),(0,K.jsxs)(`div`,{children:[(0,K.jsx)(`dt`,{children:`DEF`}),(0,K.jsx)(`dd`,{children:h})]}),(0,K.jsxs)(`div`,{children:[(0,K.jsx)(`dt`,{children:`SPD`}),(0,K.jsx)(`dd`,{children:Tn(c)})]}),(0,K.jsxs)(`div`,{children:[(0,K.jsx)(`dt`,{children:`MOV`}),(0,K.jsx)(`dd`,{children:c.move})]})]})]})}function ns(){let e=G(e=>e.battle),[t,n]=(0,y.useState)(!1),r=R(G(e=>e.selectedMissionId)),i=G(e=>e.onboardingEnabled),a=G(e=>e.onboardingStageId),o=!r&&i,s=o?Qa(!0,a):null,c=o?So(e,a):null,l=ve(e),u=r?Je(e):null,d=Ye(e),f=e.objective;if(!l&&!r?.challenge&&!f&&!o)return null;let p=f?.type===`RECOVER`&&!L(e),m=f?.type===`RECOVER`?p?`Recover — Signal Jammed`:`Recover — Signal Open`:f?.type===`SURVIVE`?`Survive`:f?.type===`HOLD`?`Hold`:f?.type===`INTERCEPT`?`Intercept`:f?.type===`BOSS`?`Defeat Commander`:o?a===`solo-1`?`DEFEAT THE SCOUT`:a===`solo-2`?`DEFEAT BOTH SCOUTS`:`DEFEAT HOSTILES`:r?.name||`Objective`,h=f?.type===`RECOVER`?p?`Even rounds only`:`Reach the relay and recover`:l,g=[e.directive?.supportCooldownExtra?`Support cooldowns +${e.directive.supportCooldownExtra}`:``,e.directive?.maxRounds?`${Math.max(0,e.directive.maxRounds-e.round+1)} rounds left`:``].filter(Boolean).join(` · `),_=f&&(f.type===`HOLD`||f.type===`SURVIVE`)?f.duration:r?.challenge?.type===`TURN_LIMIT`?r.challenge.limit:null,v=o?c?.copy||s?.teaching||``:`${d.action}${h?` ${h}`:``}${g?` · ${g}`:``}`;return(0,K.jsxs)(`button`,{type:`button`,className:`t-obj-chip t-hud-card ${o?`is-training`:``} ${t?`is-expanded`:``}`,onClick:()=>n(e=>!e),"aria-expanded":t,"aria-label":`Mission objective: ${u||m}. ${t?v+` Tap to close details.`:(c?.title||d.status)+`. Tap for details.`}`,children:[(0,K.jsx)(`strong`,{children:u||m}),(0,K.jsx)(`span`,{className:`t-objective-summary`,children:o?c?.title||`DEFEAT HOSTILES`:f?.type===`RECOVER`&&f.completed?`OBJECTIVE COMPLETE`:d.status}),(0,K.jsx)(`span`,{className:`t-objective-detail`,children:v}),(0,K.jsx)(`span`,{className:`t-objective-directive`,children:d.status}),(0,K.jsx)(`small`,{className:`t-objective-action`,children:d.action}),h?(0,K.jsxs)(`span`,{children:[h,g?` · ${g}`:``]}):g?(0,K.jsx)(`span`,{children:g}):null,r?.challenge?(0,K.jsxs)(`small`,{children:[`OPTIONAL / `,r.challenge.label]}):null,_?(0,K.jsxs)(`div`,{className:`t-obj-rounds`,children:[(0,K.jsx)(`em`,{children:f?.type===`HOLD`||f?.type===`SURVIVE`?`${d.progress}/${d.total} CONTROL`:`Round ${e.round}/${_}`}),(0,K.jsx)(`span`,{className:`t-obj-dots`,"aria-hidden":`true`,children:Array.from({length:Math.min(_,8)},(t,n)=>(0,K.jsx)(`i`,{className:n<(f?.type===`HOLD`||f?.type===`SURVIVE`?f.progress:e.round)?`on`:``},n))})]}):null]})}function rs({actionStates:e}){let t=G(e=>e.battle),n=G(e=>e.busy),r=G(e=>e.selectSkill),i=G(e=>e.selectRecover),a=t.units.find(e=>e.id===t.activeId),o=!(!a||a.team!==`ally`||a.hasActed||a.defeated||n||t.outcome!==`ongoing`),s=a?rr(t,a):[],c=t.objective?.type===`RECOVER`&&!t.objective.completed,l=ti(t);return a?.team===`enemy`?(0,K.jsx)(`div`,{className:`t-actions t-actions-enemy`,"aria-live":`polite`,children:(0,K.jsxs)(`div`,{className:`t-enemy-command`,children:[(0,K.jsx)(Xt,{className:`t-enemy-command-icon`,"aria-hidden":`true`}),(0,K.jsx)(`span`,{children:`ENEMY ACTION`}),(0,K.jsx)(`small`,{children:a.name})]})}):(0,K.jsxs)(`div`,{className:`t-actions${c?` has-obj`:``}`,children:[[0,1,2].map(n=>{let i=s[n],c=t.actionSkillId&&i&&t.actionSkillId===i.id,l=i&&!i.ready,u=i?Mo(i):null,d=e.find(e=>e.id===i?.id)?.reason||`WAIT`,f=i&&a?Ta(a,i.id):`base`,p=i&&a?Ea(a,i.id):null;return(0,K.jsxs)(`button`,{type:`button`,className:`t-act t-growth-${f} ${c?`on`:``} ${l?`cooling`:``} ${u?`kind-${u.archetype} fx-${u.effectClass}`:``}`,disabled:!o||!i||!!l,"aria-pressed":!!c,"aria-label":i?`${i.slot} ${i.name}. ${d}. ${i.desc}`:`Empty slot A${n+1}`,onClick:()=>{i&&(pi(),r(i.id))},children:[(0,K.jsx)(Xo,{src:i?zo(i.id):null,archetype:u?.archetype}),(0,K.jsx)(`span`,{className:`slot`,children:i?.slot??`A${n+1}`}),p?(0,K.jsx)(`span`,{className:`t-skill-rank${p===`SIGNATURE`?` is-signature`:``}`,"aria-label":`Upgrade ${p}`,children:p}):null,(0,K.jsx)(`span`,{className:`name`,children:i?.name??`—`}),(0,K.jsx)(`span`,{className:`meta`,children:d}),l?(0,K.jsxs)(`span`,{className:`cd`,children:[i.cd,`T`]}):null]},n)}),c?(0,K.jsxs)(`button`,{type:`button`,className:`t-act t-act-obj kind-${No.archetype} fx-${No.effectClass} ${l?`on`:`cooling`}`,disabled:!o||!l,"aria-label":l&&o?`Recover. Complete objective, consumes action.`:L(t)?`Recover unavailable. Move within relay range on your turn.`:`Recover unavailable. Signal jammed.`,onClick:()=>{pi(),i()},children:[(0,K.jsx)(Xo,{src:Bo(`recover`),archetype:No.archetype}),(0,K.jsx)(`span`,{className:`slot`,children:`OBJ`}),(0,K.jsx)(`span`,{className:`name`,children:`RECOVER`}),(0,K.jsx)(`span`,{className:`meta`,children:o?l?`READY`:L(t)?`GET CLOSER`:`JAMMED`:`WAIT`})]}):null]})}function is(){let e=G(e=>e.battle),t=G(e=>e.activeRulesetVersion),n=e.units,r=G(e=>e.battle.mode),i=G(e=>e.battle.activeId),a=G(e=>e.battle.inspectId),o=G(e=>e.battle.actionSkillId),s=G(e=>e.lastActionSkillId),c=G(e=>e.combatMoment),l=G(e=>e.combatFx),u=G(e=>e.enemyScene),d=G(e=>e.displayHp),f=new Set(l.filter(e=>Fa(e.name)===`dash`&&e.actorId).map(e=>e.actorId)),p=G(e=>e.banner),m=G(e=>e.floats),h=G(e=>e.consequences),g=G(e=>e.threats),_=G(e=>e.attackingId),v=G(e=>e.impactId),b=G(e=>e.impactKey),x=G(e=>e.muted),S=G(e=>e.busy),C=G(e=>e.selectCell),w=G(e=>e.skipTurn),T=G(e=>e.cancel),E=G(e=>e.toggleMute),D=G(e=>e.battle.objective),O=R(G(e=>e.selectedMissionId)),k=G(e=>e.onboardingEnabled),ee=G(e=>e.onboardingStageId),te=G(e=>e.battle.reinforcement),ne=G(e=>e.battle.signalCarrierId),re=G(e=>e.identity),ie=(0,y.useMemo)(()=>new Set(bo().map(e=>Nn(e.c,e.r))),[n,i,r,S,o]),j=(0,y.useMemo)(()=>xo(),[n,i,r,o]),M=To({battle:e,activeRulesetVersion:t,busy:S,threats:g,combatMoment:c,combatFx:l,consequences:h,floats:m,banner:p,mission:O,onboardingStageId:k&&!O?ee:null}),ae=M.threats;M.actor;let oe=o?A(o):null,N=oe?Mo(oe):null,se=s?A(s):null,P=se?Mo(se):null,F=M.interactive,ce=n.find(e=>e.id===v),le=ce?zn(ce.c,ce.r):null;return(0,K.jsxs)(`div`,{className:`t-battle${k&&!O?` is-foundation-training`:``}${pn?` battlefield-vnext-preview`:``}${N?` is-focusing focus-${N.targetClass} effect-${N.effectClass}`:``}`,"data-impact-kind":P?.effectClass||`damage`,"data-decision":M.mode,children:[(0,K.jsxs)(`header`,{className:`t-top t-battle-hud-rail`,"aria-label":`Battle status and mission`,children:[(0,K.jsx)(ts,{}),(0,K.jsx)(ns,{})]}),(0,K.jsx)(`div`,{className:`t-field-wrap`,children:(0,K.jsxs)(`div`,{className:`t-field`,onPointerDown:e=>{S||e.target===e.currentTarget&&T()},children:[(0,K.jsx)(`img`,{className:`t-field-art`,src:Se(O).art,alt:``}),(0,K.jsx)(`div`,{className:`t-field-grade`}),(0,K.jsx)(`div`,{className:`t-vignette`}),(0,K.jsxs)(`div`,{className:`t-command-cue${c?` t-master-moment-cue`:``}`,role:`status`,"aria-live":`polite`,"aria-atomic":`true`,children:[(0,K.jsx)(`strong`,{children:M.title}),(0,K.jsx)(`span`,{children:M.detail}),M.sources.length?(0,K.jsx)(`small`,{children:M.sources.map(e=>`${e.label}. ${e.name} · ${e.effect}`).join(` / `)}):null,M.mode===`REACT`&&M.result?(0,K.jsx)(`small`,{children:M.result}):null]}),(0,K.jsx)(`div`,{className:`t-grid`,"aria-hidden":`true`,children:Array.from({length:z*mn},(e,t)=>{let n=t%z,r=Math.floor(t/z),i=zn(n,r);return(0,K.jsx)(`i`,{style:{left:`${i.x}%`,top:`${i.y}%`}},`g-${n}-${r}`)})}),ae.length>0?(0,K.jsx)(`svg`,{className:`t-threat-tethers`,viewBox:`0 0 100 100`,preserveAspectRatio:`none`,"aria-hidden":`true`,children:ae.map((e,t)=>{let r=n.find(t=>t.id===e.enemyId&&!t.defeated),i=e.impactTiles;if(!r||!i.length)return null;let a=zn(r.c,r.r),o=e.targetTile??(e.targetUnitId?n.find(t=>t.id===e.targetUnitId):null)??{c:i.reduce((e,t)=>e+t.c,0)/i.length,r:i.reduce((e,t)=>e+t.r,0)/i.length},s=zn(o.c,o.r);return a.x===s.x&&a.y===s.y?null:(0,K.jsxs)(`g`,{className:`t-threat-tether`,"data-threat-index":t+1,children:[(0,K.jsx)(`line`,{className:`t-threat-tether-halo`,x1:a.x,y1:a.y,x2:s.x,y2:s.y}),(0,K.jsx)(`line`,{className:`t-threat-tether-core`,x1:a.x,y1:a.y,x2:s.x,y2:s.y}),(0,K.jsx)(`circle`,{className:`t-threat-tether-end`,cx:s.x,cy:s.y,r:`.35`})]},e.id)})}):null,ae.flatMap((e,t)=>e.impactTiles.map((n,r)=>{let i=zn(n.c,n.r);return(0,K.jsxs)(`div`,{className:`t-threat-tile t-threat-tile-v2`,"data-threat-index":t+1,style:{left:i.x+`%`,top:i.y+`%`,...Eo(n.r,z,mn)},"aria-hidden":`true`,children:[(0,K.jsx)(`i`,{className:`t-threat-corner tl`}),(0,K.jsx)(`i`,{className:`t-threat-corner tr`}),(0,K.jsx)(`i`,{className:`t-threat-corner bl`}),(0,K.jsx)(`i`,{className:`t-threat-corner br`}),(0,K.jsx)(`span`,{children:t+1})]},e.id+`:`+r)})),M.sources.map(e=>{let t=n.find(t=>t.id===e.id);if(!t)return null;let r=zn(t.c,t.r);return(0,K.jsx)(`span`,{className:`t-threat-source`,style:{left:`${r.x}%`,top:`${r.y}%`},"aria-label":`Threat ${e.label}: ${e.name}, ${e.effect}`,children:e.label},e.id)}),D?.type===`HOLD`&&D.terminal?Array.from({length:z*mn},(e,t)=>({c:t%z,r:Math.floor(t/z)})).filter(e=>Math.abs(e.c-D.terminal.c)+Math.abs(e.r-D.terminal.r)<=(D.radius??0)).map(e=>{let t=zn(e.c,e.r);return(0,K.jsx)(`div`,{className:`t-hold-cell`,style:{left:`${t.x}%`,top:`${t.y}%`},"aria-label":`Hold area`,children:`HOLD`},`hold-${e.c}-${e.r}`)}):null,D?.type===`RECOVER`?(()=>{let e=zn(D.terminal.c,D.terminal.r);return(0,K.jsxs)(`div`,{className:`t-terminal ${D.completed?`complete`:``}`,style:{left:`${e.x}%`,top:`${e.y}%`},"aria-label":`Relay terminal`,children:[(0,K.jsx)(`img`,{className:`t-objective-marker-art`,src:Ho.signalRecovery,alt:``}),(0,K.jsx)(`span`,{children:`RELAY`}),(0,K.jsx)(`small`,{children:D.completed?`RECOVERED`:`RECOVER`})]})})():null,D?.type===`INTERCEPT`?(()=>{let e=zn(D.exit.c,D.exit.r);return(0,K.jsxs)(`div`,{className:`t-terminal`,style:{left:`${e.x}%`,top:`${e.y}%`},"aria-label":`Courier escape exit`,children:[(0,K.jsx)(`img`,{className:`t-objective-marker-art`,src:Ho.reinforcementWarning,alt:``}),(0,K.jsx)(`span`,{children:`EXIT`}),(0,K.jsx)(`small`,{children:`BLOCK / INTERCEPT`})]})})():null,te?.telegraphed&&!te.spawned?(()=>{let e=zn(te.spawn.c,te.spawn.r);return(0,K.jsxs)(`div`,{className:`t-reinforcement-marker`,style:{left:`${e.x}%`,top:`${e.y}%`},children:[(0,K.jsx)(`img`,{className:`t-objective-marker-art`,src:Ho.reinforcementWarning,alt:``}),(0,K.jsx)(`span`,{children:`INBOUND`}),(0,K.jsx)(`small`,{children:`HOUND`})]})})():null,Array.from({length:z*mn},(e,t)=>{let n=t%z,r=Math.floor(t/z),i=Nn(n,r);if(!M.interactive||!ie.has(i))return null;let a=zn(n,r);return(0,K.jsx)(`button`,{type:`button`,className:`t-cell move`,style:{left:`${a.x}%`,top:`${a.y}%`,...Eo(r,z,mn)},"aria-label":`Move to ${n},${r}`,onClick:e=>{e.detail===0&&C(n,r)},onPointerDown:e=>{e.stopPropagation(),pi(),C(n,r)}},i)}),n.slice().sort((e,t)=>e.r-t.r||e.c-t.c).map(e=>(0,K.jsx)($o,{unit:e,selected:e.id===i,validTarget:j.has(e.id),targeting:M.targeting,attacking:e.id===_,hitReacting:e.id===v&&b>0,shownHp:d[e.id],travelGhost:f.has(e.id),inspecting:e.id===a,signalCarrier:e.id===ne,interceptTarget:D?.type===`INTERCEPT`&&e.id===D.targetId,facingTarget:l.find(t=>t.actorId===e.id&&t.targetId&&t.targetId!==e.id)?n.find(t=>t.id===l.find(t=>t.actorId===e.id&&t.targetId&&t.targetId!==e.id)?.targetId):void 0},e.id)),u&&(()=>{let e=zn(u.from.c,u.from.r),t=zn(u.to.c,u.to.r),r=n.find(e=>e.id===u.actorId),i={"--enemy-x":e.x+`%`,"--enemy-y":e.y+`%`,"--enemy-target-x":t.x+`%`,"--enemy-target-y":t.y+`%`,"--enemy-duration":u.durationMs+`ms`};return(0,K.jsx)(`div`,{className:`t-hostile-scene t-hostile-${u.style}`,style:i,"aria-hidden":`true`,children:[`melee`,`heavy`].includes(u.style)&&r?(0,K.jsx)(`img`,{src:r.attackSprite||r.sprite,alt:``}):(0,K.jsx)(`svg`,{viewBox:`0 0 100 100`,preserveAspectRatio:`none`,children:(0,K.jsx)(`line`,{x1:e.x,y1:e.y,x2:t.x,y2:t.y})})},u.id)})(),M.primaryFx.map(e=>{let t=e.actorId?n.find(t=>t.id===e.actorId):null,r=e.terminal||n.find(t=>t.id===e.targetId);if(!t||!e.from||!r||e.from.c===r.c&&e.from.r===r.r)return null;let i=zn(e.from.c,e.from.r),a=zn(r.c,r.r),o=Fa(e.name);if(o===`none`)return null;let s=o===`beam`;return(0,K.jsx)(`div`,{className:`t-choreo-travel ${s?`ranged`:`melee`}`,style:{"--from-x":i.x+`%`,"--from-y":i.y+`%`,"--to-x":a.x+`%`,"--to-y":a.y+`%`,"--travel-ms":e.durationMs+`ms`},"aria-hidden":`true`,children:s?(0,K.jsx)(`svg`,{className:`t-choreo-line`,viewBox:`0 0 100 100`,preserveAspectRatio:`none`,children:(0,K.jsx)(`line`,{x1:i.x,y1:i.y,x2:a.x,y2:a.y})}):(0,K.jsx)(`img`,{className:`t-choreo-actor`,src:Go(t,re)?Wo(Uo(e.from,r,`front`)):t.attackSprite||t.sprite,alt:``,onError:e=>{Go(t,re)&&(e.currentTarget.onerror=null,e.currentTarget.src=t.attackSprite||t.sprite)}})},`travel-`+e.id)}),M.primaryFx.map(e=>{let t=n.find(t=>t.id===e.targetId),r=e.terminal||t;if(!r)return null;let i=zn(r.c,r.r);return(0,K.jsx)(`div`,{className:`t-sprite-fx ${[`alpha_howl`,`shadow_pack_heal_def`,`shadow_pack_def_only`,`shadow_pack_guard`].includes(e.name)?`fx-area fx-support`:``} ${Pa(e.name)}`,style:{left:i.x+`%`,top:i.y+`%`},"aria-hidden":`true`,children:(0,K.jsx)(`div`,{className:`t-sprite-fx-clip`,style:{animationDuration:e.durationMs+`ms`},children:(0,K.jsx)(`div`,{className:`t-sprite-fx-sheet`,style:{backgroundImage:`url("${ja}${e.name}.webp")`,animationDuration:e.durationMs+`ms`}})})},e.id)}),c&&M.showFallbackMasterFx&&(()=>{let e=n.find(e=>e.id===c.targetId);if(!e)return null;let t=zn(e.c,e.r);return(0,K.jsxs)(`div`,{className:`t-master-fx fx-affinity-${c.affinity} fx-tier-${c.tier} fx-mode-${c.mode}`,style:{left:`${t.x}%`,top:`${t.y}%`},"aria-hidden":`true`,children:[(0,K.jsx)(`i`,{className:`t-master-fx-ring`}),(0,K.jsx)(`i`,{className:`t-master-fx-core`})]},c.id)})(),h.map(e=>{let t=n.find(t=>t.id===e.unitId);if(!t)return null;let r=zn(t.c,t.r);return(0,K.jsx)(`div`,{className:`t-consequence t-consequence-${e.kind}`,style:{left:`clamp(82px, ${r.x}%, calc(100% - 82px))`,top:`clamp(24px, ${r.y-14}%, calc(100% - 32px))`},"aria-hidden":`true`,children:e.label},e.id)}),m.map(e=>{let t=n.find(t=>t.id===e.unitId);if(!t)return null;let r=zn(t.c,t.r);return(0,K.jsx)(`div`,{className:`t-float ${e.kind}`,style:{left:`${r.x}%`,top:`${r.y-6}%`},children:e.text},e.id)}),M.targeting&&M.targetIds.length?(0,K.jsx)(`div`,{className:`t-target-assist`,role:`group`,"aria-label":`Large legal target buttons`,children:M.targetIds.map(e=>{let t=n.find(t=>t.id===e);return(0,K.jsxs)(`button`,{type:`button`,onClick:t=>{t.stopPropagation(),pi(),G.getState().selectTarget(e)},children:[(0,K.jsx)(Wt,{"aria-hidden":`true`}),(0,K.jsxs)(`span`,{children:[t.name,(0,K.jsxs)(`small`,{children:[t.hp,`/`,t.maxHp,` HP`]})]})]},e)})}):null,le&&M.showFallbackImpact?(0,K.jsx)(`div`,{className:`t-impact t-impact-${P?.effectClass||`damage`}`,style:{left:`${le.x}%`,top:`${le.y-4}%`}},b):null]})}),(0,K.jsxs)(`footer`,{className:`t-dock`,children:[(0,K.jsx)(`button`,{type:`button`,className:`t-icon-btn`,"aria-label":M.targeting?`Cancel targeting`:x?`Unmute`:`Mute`,onClick:()=>{if(M.targeting){T();return}let e=!mi();hi(e),E(),pi(),e||vi(`ui`)},children:M.targeting?(0,K.jsxs)(`span`,{className:`t-cancel-label`,children:[`×`,(0,K.jsx)(`small`,{children:`CANCEL`})]}):x?(0,K.jsx)($t,{className:`t-ico`}):(0,K.jsx)(Qt,{className:`t-ico`})}),(0,K.jsx)(rs,{actionStates:M.actions}),(0,K.jsxs)(`button`,{type:`button`,className:`t-btn t-skip`,disabled:!F,onClick:()=>{pi(),w()},children:[(0,K.jsx)(Xo,{src:Bo(`skip`),fallback:`skip`}),`Skip`]})]})]})}function as(e){e.currentTarget.src=ue}function os(){let e=G(e=>e.identity);return(0,K.jsxs)(`div`,{className:`t-id-card`,"aria-label":`Player identity`,children:[(0,K.jsx)(`img`,{src:e.portraitUrl,alt:``,onError:as}),(0,K.jsxs)(`div`,{children:[(0,K.jsx)(`strong`,{children:e.unitName}),(0,K.jsx)(`small`,{children:e.summary})]})]})}function ss(e){return{"REACH CONTROL":`PRESSURE +1 RANGE`,"WIDE SHELTER":`PACK SUPPORT +1 RANGE`,"RELAY SCOUT":`RECOVER FROM 2 CELLS`,RELENTLESS:`PRESSURE COOLDOWN -1 TURN`,"PIN DOWN":`PRESSURE DEBUFFS +1 TURN`,"STEADY HAND":`MEND COOLDOWN -1 TURN`,"SILENT SHELTER":`PACK SUPPORT: NO HEALING / IGNORE DISRUPTION`,"REACHING SNARE":`HAMSTRING +1 RANGE`,PATHFINDER:`MOVE +1 CELL`}[e.name]||e.copy}function cs(e){return e.gained===3?`FIRST CLEAR + CHALLENGE`:e.progress<8?e.gained===2?`FIRST CLEAR`:`CHALLENGE`:`FIRST CLEAR / CHALLENGE / CAP REACHED`}function ls(e,t){return e===`ally-02`?{label:`CNC`,sublabel:`RELAY SCOUT`}:e===`ally-03`?{label:`SHADOW`,sublabel:`STEALTH OPERATIVE`}:{label:`PET`,sublabel:t||`COMPANION`}}function us({snapshot:e}){let t=G(e=>e.progression),n=G(e=>e.progressionCommitPending||e.busy),r=G(e=>e.selectMastery),i=t?.equippedPet,[a,o]=(0,y.useState)(`ally-02`),s=[`ally-02`,`ally-03`,...i?[`pet:${i.id}`]:[]];return(0,K.jsxs)(`section`,{className:`t-panel t-brief-block t-pack-mastery t-pack-mastery-premium t-pack-mastery-v29`,"aria-label":`Pack Mastery`,children:[(0,K.jsxs)(`div`,{className:`t-pack-head`,children:[(0,K.jsxs)(`div`,{children:[(0,K.jsx)(`div`,{className:`t-kicker`,children:`Your squad`}),(0,K.jsx)(`h2`,{className:`t-title`,children:`PACK MASTERY`}),(0,K.jsx)(`p`,{children:`Take companions into Field Ops to unlock permanent tactical abilities.`})]}),(0,K.jsx)(`small`,{children:`First clear +2 · challenge +1`})]}),(0,K.jsx)(`nav`,{className:`t-premium-mastery-roster`,"aria-label":`Select companion mastery`,children:s.map(e=>(0,K.jsxs)(`button`,{type:`button`,className:a===e?`is-selected`:``,"aria-pressed":a===e,onClick:()=>o(e),children:[(0,K.jsx)(`img`,{src:e.startsWith(`pet:`)?i?.img||I[`ally-03`].portrait:I[e].portrait,alt:``,onError:as}),(0,K.jsx)(`strong`,{children:ls(e,i?.name).label})]},e))}),(0,K.jsx)(`div`,{className:`t-pack-list t-premium-mastery-selected`,children:s.map(o=>{let c=it(o);if(!c||s.includes(a)&&o!==a||!s.includes(a)&&o!==s[0])return null;let l=at(e||t?.packMastery,o),u=!!e||ct(t,o),d=l.stage>=3&&l.selected?c.options[l.selected]:null,f=ls(o,i?.name),p=d||(l.stage>=2?c.trained:null),m=l.stage<2?3:l.stage<3?8:null,h=e?null:yt(o,{packMastery:t?.packMastery,kodaSidegrade:t?.kodaSidegrade,shadowSidegrade:t?.shadowSidegrade},i,t?.playerGrowth),g=e?[]:bt(o,{packMastery:t?.packMastery,kodaSidegrade:t?.kodaSidegrade,shadowSidegrade:t?.shadowSidegrade},i,t?.playerGrowth),_=l.stage<2?ss(c.trained):l.stage<3?`Choose a specialization`:`All mastery options unlocked`;return(0,K.jsxs)(`article`,{className:`t-mastery-row t-mastery-premium-row t-mastery-card-v29`,"data-mastery-companion":o,children:[(0,K.jsx)(`div`,{className:`t-mastery-avatar t-premium-avatar`,"aria-hidden":`true`,children:(0,K.jsx)(`img`,{src:o.startsWith(`pet:`)?i?.img||I[`ally-03`].portrait:I[o].portrait,alt:``,onError:as})}),(0,K.jsxs)(`div`,{className:`t-mastery-main`,children:[l.stage>=2?(0,K.jsx)(`div`,{className:`t-mastery-combat-badge ${l.stage>=3?`is-signature`:`is-trained`}`,children:l.stage>=3?`SIGNATURE EVOLUTION · 8/8`:`AWAKENED · 3/8`}):null,(0,K.jsxs)(`div`,{className:`t-mastery-topline`,children:[(0,K.jsxs)(`div`,{children:[(0,K.jsx)(`strong`,{children:f.label}),(0,K.jsx)(`span`,{children:f.sublabel})]}),(0,K.jsxs)(`div`,{className:`t-mastery-status`,children:[(0,K.jsxs)(`span`,{children:[l.progress,`/8 MASTERY`]}),(0,K.jsx)(`b`,{children:l.stage>=3?`MASTERED`:`STAGE ${l.stage}`})]})]}),(0,K.jsx)(`div`,{className:`t-mastery-progressline`,children:(0,K.jsx)(`progress`,{className:`t-progress`,"aria-label":`${c.name} mastery`,value:l.progress,max:8})}),(0,K.jsxs)(`div`,{className:`t-mastery-now-next`,children:[(0,K.jsxs)(`div`,{children:[(0,K.jsx)(`span`,{className:`t-kicker`,children:`Active`}),(0,K.jsx)(`strong`,{children:p?p.name:`NO MASTERY YET`}),(0,K.jsx)(`small`,{children:p?o===`ally-03`&&l.selected===`A`&&t?.playerGrowth?.version===2&&t.playerGrowth.heroes.find(e=>e.heroId===o)?.discipline===`medic`?`MEND +8 BASE HEAL · COOLDOWN 1`:ss(p):`Earn 3 Mastery to unlock the first ability.`})]}),(0,K.jsxs)(`div`,{children:[(0,K.jsx)(`span`,{className:`t-kicker`,children:`Next`}),(0,K.jsx)(`strong`,{children:m?`AT ${m} MASTERY`:`ALL PATHS UNLOCKED`}),(0,K.jsx)(`small`,{children:_})]})]}),l.stage>=2?(0,K.jsx)(`p`,{children:(0,K.jsxs)(`small`,{children:[`TRAINED · `,c.trained.name,`: `,c.trained.copy]})}):null,l.stage===3?(0,K.jsxs)(`div`,{className:`t-growth-delta`,"aria-label":`Saved versus alternate Mastery`,children:[(0,K.jsxs)(`small`,{children:[e?`FROZEN`:`SAVED`,` `,l.selected,` → ALTERNATE `,l.selected===`A`?`B`:`A`]}),g.length?g.map(e=>(0,K.jsx)(`b`,{children:e},e)):(0,K.jsx)(`small`,{children:e?`This run uses its frozen A/B. Compare alternatives in the War Table.`:`No additional effective change in this composition.`}),(0,K.jsxs)(`small`,{children:[o===`ally-02`?`INTERCEPT: recharge sooner or keep control longer.`:o===`ally-03`?`HOLD: compare MEND timing against healing-free, disruption-safe shelter. MEDIC + STEADY HAND in V2 adds 8 base healing at the cooldown floor.`:`RECOVER / INTERCEPT: choose objective mobility or HAMSTRING reach.`,` 8/8 is complete; experiment between runs without earning extra XP.`]})]}):null,h?(0,K.jsxs)(`div`,{className:`t-growth-delta`,"aria-label":`Saved Pack Mastery power proof`,children:[(0,K.jsxs)(`small`,{children:[`POWER PROOF · `,h.comparison]}),h.changes.map(e=>(0,K.jsx)(`b`,{children:e},e))]}):null,(0,K.jsxs)(`details`,{className:`t-detail t-mastery-detail`,children:[(0,K.jsx)(`summary`,{children:l.stage>=3?`Specialization`:`Ability details`}),(0,K.jsxs)(`p`,{children:[l.stage>=2?`TRAINED`:`AT 3 MASTERY`,`: `,c.trained.name,` / `,c.trained.copy]}),l.stage>=3?(0,K.jsxs)(K.Fragment,{children:[(0,K.jsx)(`div`,{className:`t-brief-actions`,children:[`A`,`B`].map(e=>(0,K.jsxs)(`button`,{type:`button`,className:`t-btn ${l.selected===e?`t-btn-primary`:``}`,"aria-pressed":l.selected===e,disabled:n||u,onClick:()=>void r(o,e),children:[c.options[e].name,l.selected===e?` / ACTIVE`:``]},e))}),[`A`,`B`].map(e=>(0,K.jsx)(`p`,{children:(0,K.jsxs)(`small`,{children:[c.options[e].name,`: `,o===`ally-03`&&e===`A`&&t?.playerGrowth?.version===2?`MEND cooldown -1, floor 1. With MEDIC at the floor: +8 base healing instead.`:c.options[e].copy]})},e))]}):(0,K.jsx)(`p`,{children:(0,K.jsx)(`small`,{children:`Specializations unlock at 8 Mastery.`})})]}),u?(0,K.jsx)(`small`,{className:`t-mastery-locked`,children:`Finish this companion's current run before changing specialization.`}):null]})]},o)})}),i?null:(0,K.jsx)(`small`,{className:`t-pack-pet-note`,children:`Equip a PET to add it to Pack Mastery.`})]})}function ds({changes:e,victory:t}){return e?.length?(0,K.jsxs)(`section`,{className:`t-mastery-feedback`,"aria-label":`Pack Mastery`,children:[(0,K.jsx)(`div`,{className:`t-kicker`,children:`PACK MASTERY`}),e.map(e=>{let n=it(e.unitId);return n?(0,K.jsxs)(`div`,{className:`t-mastery-row t-mastery-reward ${e.beforeStage===e.stage?``:`is-unlock`}`,"data-mastery-unit":e.unitId,children:[(0,K.jsxs)(`div`,{className:`t-mastery-heading`,children:[(0,K.jsx)(`strong`,{children:n.name}),(0,K.jsx)(`span`,{children:e.stage===3?`STAGE 3 COMPLETE`:`STAGE ${e.beforeStage===e.stage?``:`${e.beforeStage} → `}${e.stage}`}),e.gained>0||e.stage<3?(0,K.jsxs)(`b`,{children:[`+`,e.gained,` MASTERY`]}):null]}),e.gained>0?(0,K.jsx)(`small`,{children:cs(e)}):null,(0,K.jsx)(`progress`,{className:`t-progress`,"aria-label":`${n.name} mastery`,value:e.progress,max:8}),e.beforeStage<2&&e.stage>=2?(0,K.jsxs)(`div`,{className:`t-mastery-unlock`,children:[(0,K.jsxs)(`strong`,{children:[`AWAKENED · `,n.trained.name]}),(0,K.jsx)(`p`,{children:n.trained.copy})]}):null,e.newOptions.length?(0,K.jsxs)(`div`,{className:`t-mastery-unlock is-signature`,children:[(0,K.jsx)(`strong`,{children:`SIGNATURE EVOLUTION · 8/8`}),(0,K.jsxs)(`p`,{children:[n.options.A.name,` / `,n.options.B.name]}),(0,K.jsx)(`p`,{children:`Specializations unlocked. Choose outside an active run.`})]}):null,!e.gained&&e.progress<8?(0,K.jsx)(`small`,{children:t?`Award already earned. Try another mission or challenge.`:`Clear a Field Op to progress.`}):null]},e.unitId):null})]}):null}var fs=g(),ps=`/images/tactical_ops/signal_atlas/v1`,ms={atlasBackground:ps+`/environments/atlas_relay_chamber.webp`,sectorBackground:ps+`/environments/sector_signal_bay.webp`,coreBezel:ps+`/core/relay_core_bezel.webp`,sectorFrame:ps+`/frames/sector_plate.svg`,nodeFrame:ps+`/frames/skill_node_bezel.svg`,inspectorFrame:ps+`/frames/skill_inspector_frame.svg`,contact:ps+`/trim/signal_contact.svg`},hs={assault:ps+`/sectors/emblem_assault.webp`,command:ps+`/sectors/emblem_command.webp`,pursuit:ps+`/sectors/emblem_pursuit.webp`,control:ps+`/sectors/emblem_control.webp`,line:ps+`/sectors/emblem_front_line.webp`,support:ps+`/sectors/emblem_support.webp`},gs={alpha:[{id:`assault`,title:`ASSAULT`,description:`Strike · Rend`,skillIds:[`alpha-strike`,`alpha-rend`],tone:`amber`,emblemSrc:hs.assault},{id:`command`,title:`COMMAND`,description:`Howl`,skillIds:[`alpha-howl`],tone:`cyan`,emblemSrc:hs.command}],"ally-02":[{id:`pursuit`,title:`PURSUIT`,description:`Thrust · Lunge`,skillIds:[`u02-shot`,`u02-burst`],tone:`amber`,emblemSrc:hs.pursuit},{id:`control`,title:`CONTROL`,description:`Pressure`,skillIds:[`u02-suppress`],tone:`cyan`,emblemSrc:hs.control}],"ally-03":[{id:`line`,title:`FRONT LINE`,description:`Sweep`,skillIds:[`u03-tap`],tone:`amber`,emblemSrc:hs.line},{id:`support`,title:`SUPPORT`,description:`Mend · Pack Support`,skillIds:[`u03-mend`,`u03-pack`],tone:`cyan`,emblemSrc:hs.support}]},_s={alpha:`ALPHA`,"ally-02":`CNC`,"ally-03":`SHADOW`},vs={alpha:`PACK LEADER`,"ally-02":`TACTICAL HUNTER`,"ally-03":`SQUAD SUPPORT`},ys={vanguard:`HOWL grants a short protective GUARD to nearby allies.`,howlkeeper:`HOWL reaches allies across a larger area.`,pursuer:`THRUST gains one tile of reach.`,disruptor:`PRESSURE weakens enemy attacks for longer.`,sentinel:`PACK SUPPORT also grants a brief GUARD.`,medic:`MEND cooldown is reduced, to a minimum of one turn.`};function bs(e,t,n,r,i){return nn(i||A(e),n,t,r)}function xs(e,t,n,r,i,a,o){if(!S[e].includes(t))throw Error(`atlas_invalid_skill`);let s=r?.ranks[t]||0,c=n?C.find(e=>e.skillId===t&&e.rank===n):null,l=n?c?.label||`UNKNOWN RANK`:A(t).name,u={id:`skill:${e}:${t}:${n}`,skillId:t,rank:n,title:l,changes:[]};if(n===0)return{...u,state:`base`,reason:`Base action already available. No point required.`};if(s>=n)return{...u,state:n===2?`maxed`:`recorded`,reason:`Recorded in the server-owned Skillbook.`};if(!r||!c)return{...u,state:`unavailable`,reason:`Awaiting authenticated progression.`};if(n===2&&s<1)return{...u,state:`needs-rank-one`,reason:`Record Rank I of this skill first.`};if(r.discipline&&r.discipline!==i)return{...u,state:`different-discipline`,reason:`Another discipline is saved. A one-time respec may change it.`};let d=bs(t,n,r,i,o);return d.length?a<1?{...u,changes:d,state:`no-points`,reason:`Earn a first-clear point before purchasing.`}:{...u,changes:d,state:`available`,reason:`Eligible for a server-recorded purchase of 1 point.`}:{...u,changes:d,state:`no-effect`,reason:`This upgrade produces no effective battle change. Purchase disabled pending balance review.`}}function Ss(e,t){if(!Number.isInteger(t)||t<1||!Number.isInteger(e)||e<0||e>=t)throw Error(`atlas_invalid_sector_index`);if(t===2)return{x:e===0?24:76,y:18};let n=-Math.PI/2+e*2*Math.PI/t;return{x:Math.round((50+34*Math.cos(n))*10)/10,y:Math.round((50+34*Math.sin(n))*10)/10}}function Cs(e){e.currentTarget.hidden=!0}function ws(e){e.currentTarget.dataset.fallback?Cs(e):(e.currentTarget.dataset.fallback=`1`,as(e))}var Ts=Object.fromEntries(Object.entries(ms).map(([e,t])=>[`--tsa-${e}`,`url("${t}")`])),Es=[{id:`future-a`,title:`FUTURE 01`,x:14,y:62},{id:`future-b`,title:`FUTURE 02`,x:86,y:62},{id:`future-c`,title:`FUTURE 03`,x:14,y:86},{id:`future-d`,title:`FUTURE 04`,x:86,y:86}];function Ds({onClose:e}){let t=G(e=>e.progression),n=t?.playerGrowth,r=G(e=>e.progressionCommitPending),i=G(e=>e.progressionError),a=G(e=>e.upgradeGrowth),o=G(e=>e.respecGrowth),[s,c]=(0,y.useState)(`alpha`),[l,u]=(0,y.useState)(`atlas`),[d,f]=(0,y.useState)(`assault`),[p,m]=(0,y.useState)(0),[h,g]=(0,y.useState)(`vanguard`),[_,v]=(0,y.useState)(null),[b,S]=(0,y.useState)(null),[C,w]=(0,y.useState)(!1),[T,E]=(0,y.useState)(null),[D,k]=(0,y.useState)(!1),[ee,te]=(0,y.useState)(!0),ne=(0,y.useRef)(null),re=(0,y.useRef)(null),ie=gs[s],j=Math.ceil(ie.length/3),M=ie.slice(p*3,(p+1)*3),ae=ie.find(e=>e.id===d)||ie[0],oe=rn(n,s)||null,N=h;(0,y.useEffect)(()=>{g(oe?.discipline||x[s][0])},[s,oe?.discipline]);let se=n?n.earnedPoints-n.spentPoints:0,P=C||r,F=_&&ae.skillIds.includes(_.skillId)?xs(s,_.skillId,_.rank,oe,N,se,en(_.skillId,t)):null,ce=!(F?.state!==`available`||P||!n),le=!!(oe?.discipline&&!oe.respecUsed&&Object.keys(oe.ranks).length>0&&!P),ue=oe?.ranks||{};(0,y.useEffect)(()=>{if(!b)return;let e=document.activeElement,t=ne.current,n=document.body.style.overflow;document.body.style.overflow=`hidden`,t?.querySelector(`button`)?.focus();function r(e){if(e.key===`Escape`){e.preventDefault(),S(null);return}if(e.key!==`Tab`||!t)return;let n=Array.from(t.querySelectorAll(`button:not(:disabled)`)),r=n[0],i=n[n.length-1];e.shiftKey&&document.activeElement===r?(e.preventDefault(),i?.focus()):!e.shiftKey&&document.activeElement===i&&(e.preventDefault(),r?.focus())}return document.addEventListener(`keydown`,r),()=>{document.body.style.overflow=n,document.removeEventListener(`keydown`,r),e?.focus()}},[b]);function de(e,t){P||(v({skillId:e,rank:t}),E(null),S(null),requestAnimationFrame(()=>re.current?.scrollIntoView({block:`nearest`,behavior:`instant`})))}function fe(e){P||(c(e),m(0),f(gs[e][0].id),g(n?.heroes.find(t=>t.heroId===e)?.discipline||x[e][0]),u(`atlas`),v(null),E(null),S(null))}function pe(e){P||(f(e.id),u(`sector`),v(null),S(null),E(null))}async function me(){if(!F||!ce||!n||!t||!oe)return;let e={heroId:s,path:N,skillId:F.skillId,rank:F.rank,revision:t.revision};S(null),E(null),w(!0);try{await a(e.heroId,e.path,e.skillId,e.rank);let t=G.getState(),n=t.progression?.playerGrowth?.heroes.find(t=>t.heroId===e.heroId);t.progression&&t.progression.revision>e.revision&&(n?.ranks[e.skillId]||0)>=e.rank&&!t.progressionError?E({kind:`success`,text:`SERVER RECORDED · ${A(e.skillId).name} RANK ${e.rank}. Your next accepted run will use the saved skill. Existing runs keep their frozen build.`}):E({kind:`error`,text:t.progressionError||`Upgrade not confirmed by the server. Points and skill ownership remain server-owned; refresh and retry.`})}catch{E({kind:`error`,text:`Could not verify server receipt. Refresh before retrying.`})}finally{w(!1)}}async function L(){if(!le||!t)return;let e=t.revision,n=s;S(null),E(null),w(!0);try{await o(n);let t=G.getState(),r=t.progression?.playerGrowth?.heroes.find(e=>e.heroId===n);t.progression&&t.progression.revision>e&&r?.respecUsed&&!Object.keys(r.ranks).length&&!t.progressionError?(g(x[n][0]),v(null),E({kind:`success`,text:`SERVER RECORDED · This hero's one-time reset was used.`})):E({kind:`error`,text:t.progressionError||`Reset not confirmed. Refresh and check server progression.`})}catch{E({kind:`error`,text:`Reset receipt could not be verified.`})}finally{w(!1)}}return(0,K.jsxs)(`section`,{className:`tsa-root`,style:Ts,inert:!!b,"aria-busy":P,"aria-label":`Signal Atlas character Skillbook`,children:[(0,K.jsxs)(`header`,{className:`tsa-header`,children:[(0,K.jsxs)(`div`,{children:[(0,K.jsx)(`span`,{className:`tsa-eyebrow`,children:`TACTICAL OPS / CHARACTER DEVELOPMENT`}),(0,K.jsx)(`h2`,{children:`THE SIGNAL ATLAS`}),(0,K.jsx)(`span`,{className:`tsa-subtitle`,children:`THE CHAIN REMEMBERS`})]}),(0,K.jsxs)(`div`,{className:`tsa-points`,"aria-label":n?`${se} unspent skill points`:`Points unavailable`,children:[(0,K.jsx)(`strong`,{children:n?se:`—`}),(0,K.jsxs)(`small`,{children:[`POINTS`,(0,K.jsx)(`br`,{}),`AVAILABLE`]})]})]}),(0,K.jsx)(`div`,{className:`tsa-hero-tabs`,role:`group`,"aria-label":`Choose character`,children:Object.keys(_s).map(e=>(0,K.jsxs)(`button`,{type:`button`,disabled:P,"aria-pressed":s===e,className:s===e?`is-active`:``,onClick:()=>fe(e),children:[(0,K.jsx)(`img`,{src:I[e].portrait,onError:ws,alt:``}),(0,K.jsxs)(`span`,{children:[(0,K.jsx)(`b`,{children:_s[e]}),(0,K.jsx)(`small`,{children:vs[e]})]})]},e))}),n?null:(0,K.jsx)(`p`,{className:`tsa-banner`,role:`status`,children:`Waiting for authenticated Skillbook progression. No skills can be purchased offline.`}),(0,K.jsxs)(`div`,{className:`tsa-nav`,role:`group`,"aria-label":`Skillbook view`,children:[(0,K.jsx)(`button`,{type:`button`,className:l===`atlas`?`is-current`:``,"aria-pressed":l===`atlas`,onClick:()=>{u(`atlas`),S(null),E(null)},disabled:P,children:`◈ ATLAS OVERVIEW`}),(0,K.jsx)(`button`,{type:`button`,className:l===`sector`?`is-current`:``,"aria-pressed":l===`sector`,onClick:()=>u(`sector`),disabled:P,children:`◇ SECTOR FOCUS`}),(0,K.jsx)(`button`,{type:`button`,onClick:e,disabled:P,"aria-label":`Close Signal Atlas`,children:`✕ CLOSE`})]}),l===`atlas`?(0,K.jsxs)(`div`,{className:`tsa-overview`,children:[(0,K.jsxs)(`div`,{className:`tsa-atlas-title`,children:[(0,K.jsxs)(`span`,{children:[`ALPHA HUSKY / `,_s[s]]}),(0,K.jsx)(`strong`,{children:`COMBAT NETWORK`}),(0,K.jsx)(`small`,{children:`Select a live sector to inspect its real skills.`})]}),(0,K.jsxs)(`div`,{className:`tsa-atlas-map`,"aria-label":`Interactive skill sector map`,children:[(0,K.jsxs)(`svg`,{className:`tsa-links`,viewBox:`0 0 360 370`,preserveAspectRatio:`none`,"aria-hidden":`true`,children:[(0,K.jsx)(`circle`,{cx:`180`,cy:`185`,r:`129`,fill:`none`,stroke:`#426074`,strokeWidth:`1`,strokeDasharray:`4 9`}),(0,K.jsx)(`circle`,{cx:`180`,cy:`185`,r:`99`,fill:`none`,stroke:`#2F728D`,strokeWidth:`1`}),M.map((e,t)=>{let n=Ss(t,M.length);return(0,K.jsx)(`path`,{d:`M180 185 L${n.x*3.6} ${n.y*3.7}`,fill:`none`,stroke:`#6AC4DF`,strokeWidth:`2.8`},e.id)}),(0,K.jsx)(`path`,{d:`M180 185 L47 126 M180 185 L313 126 M180 185 L47 289 M180 185 L313 289`,fill:`none`,stroke:`#466071`,strokeWidth:`1.5`,strokeDasharray:`5 7`})]}),(0,K.jsx)(`div`,{className:`tsa-core-housing`,"aria-hidden":`true`,children:(0,K.jsx)(`img`,{className:`tsa-core-bezel`,src:ms.coreBezel,onError:Cs,alt:``})}),(0,K.jsxs)(`div`,{className:`tsa-core`,children:[(0,K.jsx)(`img`,{className:`tsa-core-portrait`,src:I[s].portrait,onError:ws,alt:``}),(0,K.jsx)(`img`,{className:`tsa-core-emblem`,onError:Cs,src:Io(s,null)||``,alt:``}),(0,K.jsx)(`b`,{children:_s[s]}),(0,K.jsx)(`small`,{children:`COMBAT CORE`})]}),M.map((e,t)=>(0,K.jsxs)(`button`,{className:`tsa-sector tsa-tone-${e.tone}`,style:{left:`${Ss(t,M.length).x}%`,top:`${Ss(t,M.length).y}%`},type:`button`,onClick:()=>pe(e),disabled:P,"aria-label":`Open ${e.title} sector, ${e.skillIds.length} skills`,children:[(0,K.jsxs)(`span`,{className:`tsa-sector-glyph`,children:[(0,K.jsx)(`img`,{src:e.emblemSrc,alt:``,decoding:`async`,onError:e=>{e.currentTarget.style.display=`none`,e.currentTarget.parentElement?.setAttribute(`data-art-failed`,`1`)}}),(0,K.jsx)(`span`,{className:`tsa-sector-glyph-fallback`,"aria-hidden":`true`,children:e.tone===`amber`?`✦`:`◎`})]}),(0,K.jsx)(`b`,{children:e.title}),(0,K.jsx)(`small`,{children:e.description}),(0,K.jsxs)(`em`,{children:[`RECORDED · `,e.skillIds.reduce((e,t)=>e+(ue[t]||0),0),`/`,e.skillIds.length*2]})]},e.id)),ie.length<=2&&Es.map(e=>(0,K.jsx)(`div`,{className:`tsa-reserve`,style:{left:`${e.x}%`,top:`${e.y}%`},"aria-label":`Unreleased expansion placeholder`,children:`⊕`},e.id))]}),j>1?(0,K.jsxs)(`div`,{className:`tsa-page-controls`,"aria-label":`Sector pages`,children:[(0,K.jsx)(`button`,{type:`button`,disabled:P||p===0,onClick:()=>m(e=>Math.max(0,e-1)),children:`← PREVIOUS`}),(0,K.jsxs)(`span`,{children:[`SECTORS `,p+1,` / `,j]}),(0,K.jsx)(`button`,{type:`button`,disabled:P||p===j-1,onClick:()=>m(e=>Math.min(j-1,e+1)),children:`NEXT →`})]}):null,(0,K.jsxs)(`div`,{className:`tsa-atlas-footer`,children:[(0,K.jsxs)(`span`,{children:[(0,K.jsx)(`b`,{children:`●`}),` LIVE SECTOR`]}),(0,K.jsx)(`span`,{children:`◌ DESIGN RESERVE — NOT RELEASED`})]}),(0,K.jsxs)(`button`,{type:`button`,className:`tsa-future-toggle`,disabled:P,"aria-expanded":D,onClick:()=>k(e=>!e),children:[`FUTURE EXPANSION `,D?`−`:`+`]}),D?(0,K.jsx)(`p`,{className:`tsa-explain`,children:`This atlas can accept additional sectors without changing existing skill IDs. Grey markers are design space only—not earnable abilities, locked missions or promised rewards.`}):null]}):(0,K.jsxs)(`div`,{className:`tsa-focus`,children:[(0,K.jsxs)(`div`,{className:`tsa-focus-heading`,children:[(0,K.jsxs)(`div`,{children:[(0,K.jsxs)(`span`,{className:`tsa-eyebrow`,children:[_s[s],` / `,ae.title,` SECTOR`]}),(0,K.jsxs)(`h3`,{children:[ae.title,` NETWORK`]}),(0,K.jsxs)(`small`,{children:[ae.description,` · `,ae.skillIds.length,` skills / 3 per hero`]})]}),(0,K.jsx)(`button`,{type:`button`,onClick:()=>u(`atlas`),disabled:P,children:`← ATLAS`})]}),(0,K.jsx)(`div`,{className:`tsa-sector-switch`,role:`group`,"aria-label":`Choose live sector`,children:ie.map(e=>(0,K.jsxs)(`button`,{type:`button`,"aria-pressed":e.id===ae.id,disabled:P,onClick:()=>pe(e),children:[e.title,(0,K.jsxs)(`small`,{children:[e.skillIds.reduce((e,t)=>e+(ue[t]||0),0),`/`,e.skillIds.length*2,` RECORDED`]})]},e.id))}),(0,K.jsx)(`div`,{className:`tsa-disciplines`,role:`group`,"aria-label":`Choose specialization preview`,children:x[s].map(e=>(0,K.jsxs)(`button`,{type:`button`,"aria-pressed":N===e,disabled:P,onClick:()=>{g(e),v(null),E(null)},className:N===e?`is-chosen`:``,children:[(0,K.jsx)(`img`,{onError:Cs,src:Io(s,e)||``,alt:``}),(0,K.jsx)(`b`,{children:e.toUpperCase()}),(0,K.jsx)(`span`,{children:oe?.discipline===e?`SERVER RECORDED`:oe?.discipline?`ALTERNATIVE · UNAVAILABLE`:`PREVIEW PATH`})]},e))}),(0,K.jsxs)(`p`,{className:`tsa-path-explain`,children:[ys[N],` `,oe?.discipline?`Your recorded discipline is fixed until an eligible one-time reset.`:`Previewing does not save a discipline. Your first successful skill purchase selects it.`]}),(0,K.jsx)(`button`,{type:`button`,className:`tsa-detail-toggle`,disabled:P,"aria-pressed":!ee,onClick:()=>te(e=>!e),children:ee?`SHOW FULL SKILL DETAILS +`:`COMPACT SKILL NETWORK −`}),(0,K.jsx)(`div`,{className:`tsa-lanes ${ee?`is-compact`:``}`,children:ae.skillIds.map(e=>{let n=A(e);return(0,K.jsxs)(`div`,{className:`tsa-lane`,children:[(0,K.jsxs)(`div`,{className:`tsa-lane-title`,children:[(0,K.jsx)(`img`,{onError:Cs,src:zo(e)||``,alt:``}),(0,K.jsxs)(`div`,{children:[(0,K.jsx)(`b`,{children:n.name}),(0,K.jsxs)(`small`,{children:[n.slot,` · `,n.desc]})]}),(0,K.jsxs)(`span`,{children:[ue[e]||0,`/2`]})]}),(0,K.jsx)(`div`,{className:`tsa-node-line`,role:`group`,"aria-label":`${n.name} upgrade ranks`,children:[0,1,2].map((r,i)=>{let a=xs(s,e,r,oe,N,se,en(e,t)),o=_?.skillId===e&&_.rank===r;return(0,K.jsxs)(`div`,{className:`tsa-node-wrap`,children:[i>0?(0,K.jsx)(`span`,{className:`tsa-connector ${(ue[e]||0)>=r?`is-lit`:``}`,"aria-hidden":`true`}):null,(0,K.jsxs)(`button`,{type:`button`,disabled:P,"aria-pressed":o,onClick:()=>de(e,r),className:`tsa-node tsa-state-${a.state} ${o?`is-focused`:``}`,"aria-label":`${n.name} rank ${r}, ${a.state}: ${a.reason}`,children:[(0,K.jsx)(`img`,{onError:Cs,src:zo(e)||``,alt:``}),r>0?(0,K.jsx)(`span`,{className:`tsa-rank-stamp`,"aria-hidden":`true`,children:a.state===`maxed`||a.state===`recorded`?`✓`:a.state===`needs-rank-one`?`⌁`:r===2?`II`:`I`}):null]}),(0,K.jsx)(`small`,{children:r===0?`BASE`:`RANK ${r===1?`I`:`II`}`}),(0,K.jsx)(`span`,{className:`tsa-node-status`,children:{base:`OWNED`,recorded:`SAVED`,maxed:`MAXED`,available:`AVAILABLE`,"needs-rank-one":`NEEDS I`,"no-points":`NO POINTS`,"different-discipline":`OTHER PATH`,"no-effect":`NO CHANGE`,unavailable:`OFFLINE`}[a.state]})]},a.id)})})]},e)})}),(0,K.jsx)(`section`,{ref:re,className:`tsa-inspector ${F?`has-selection`:``}`,"aria-label":`Skill node inspection`,"aria-live":`polite`,children:F?(0,K.jsxs)(K.Fragment,{children:[(0,K.jsxs)(`span`,{className:`tsa-eyebrow`,children:[A(F.skillId).name,` / `,F.rank===0?`BASE`:`RANK ${F.rank===1?`I`:`II`}`]}),(0,K.jsx)(`h3`,{children:F.title}),(0,K.jsxs)(`div`,{className:`tsa-saved-rank`,children:[`SAVED RANK `,ue[F.skillId]||0,` / 2 · `,F.rank===0?`BASE ACTION`:`INSPECTING RANK ${F.rank}`]}),(0,K.jsx)(`p`,{children:F.reason}),F.rank>0?(0,K.jsxs)(`p`,{children:[O(F.skillId,F.rank,n?.version),(0,K.jsx)(`br`,{}),an[N],(0,K.jsx)(`br`,{}),`Costs 1 shared point. Saved runs keep their frozen build; changes apply to the next accepted run.`]}):null,F.changes.length?(0,K.jsx)(`div`,{className:`tsa-deltas`,children:F.changes.map(e=>(0,K.jsx)(`strong`,{children:e},e))}):null,(0,K.jsxs)(`div`,{className:`tsa-inspector-bottom`,children:[(0,K.jsx)(`span`,{children:F.rank===0?`ALREADY OWNED`:F.state===`recorded`||F.state===`maxed`?`SERVER RECORDED`:`COST: 1 SKILL POINT`}),(0,K.jsx)(`button`,{type:`button`,disabled:!ce,onClick:()=>S(`upgrade`),children:C?`SAVING…`:F.state===`available`?`REVIEW UPGRADE`:`UNAVAILABLE`})]})]}):(0,K.jsxs)(K.Fragment,{children:[(0,K.jsx)(`span`,{className:`tsa-eyebrow`,children:`SELECT A NODE`}),(0,K.jsx)(`h3`,{children:`BUILD YOUR COMBAT IDENTITY`}),(0,K.jsx)(`p`,{children:`Tap a rank to inspect its real effect, prerequisite and server ownership before spending a point.`})]})}),(0,K.jsxs)(`div`,{className:`tsa-secondary`,children:[(0,K.jsx)(`button`,{type:`button`,disabled:!le,onClick:()=>S(`respec`),children:oe?.respecUsed?`ONE-TIME RESET USED`:`RESET THIS HERO · ONCE FREE`}),(0,K.jsx)(`small`,{children:`Pack Mastery remains separate.`})]})]}),T?(0,K.jsx)(`p`,{className:`tsa-feedback ${T.kind}`,role:T.kind===`error`?`alert`:`status`,children:T.text}):null,i&&!T?(0,K.jsx)(`p`,{className:`tsa-feedback error`,role:`alert`,children:i}):null,b&&typeof document<`u`?(0,fs.createPortal)((0,K.jsx)(`div`,{className:`tsa-dialog-backdrop`,children:(0,K.jsxs)(`div`,{ref:ne,className:`tsa-dialog`,role:`dialog`,"aria-modal":`true`,"aria-labelledby":`tsa-confirm-title`,children:[(0,K.jsx)(`span`,{className:`tsa-eyebrow`,children:`SERVER-RECORDED ACTION`}),(0,K.jsx)(`h3`,{id:`tsa-confirm-title`,children:b===`upgrade`?`CONFIRM SKILL UPGRADE`:`CONFIRM ONE-TIME RESET`}),(0,K.jsx)(`p`,{children:b===`upgrade`?`${F?.title} · cost 1 shared skill point. ${oe?.discipline?`Existing discipline remains recorded.`:`First purchase will record ${N.toUpperCase()} as this hero's discipline.`}`:`Refund this hero's spent skill points and clear their specialization. You cannot use this one-time reset again.`}),b===`upgrade`&&F?.changes.length?(0,K.jsx)(`div`,{className:`tsa-deltas`,children:F.changes.map(e=>(0,K.jsx)(`strong`,{children:e},e))}):null,b===`upgrade`?(0,K.jsxs)(`p`,{children:[an[N],(0,K.jsx)(`br`,{}),`1 shared point. First purchase selects this doctrine. One reset per hero. Applies to the next accepted run; saved runs stay frozen.`]}):null,(0,K.jsxs)(`div`,{className:`tsa-dialog-actions`,children:[(0,K.jsx)(`button`,{type:`button`,onClick:()=>S(null),children:`CANCEL`}),(0,K.jsx)(`button`,{type:`button`,className:`is-primary`,disabled:b===`upgrade`?!ce:!le,onClick:()=>void(b===`upgrade`?me():L()),children:`CONFIRM`})]})]})}),document.getElementById(`tacticalOpsRoot`)||document.body):null]})}function Os(){if(typeof window>`u`)return!1;try{return new URLSearchParams(window.location.search).get(`signalAtlasBeta`)===`1`||window.localStorage.getItem(`ah_signal_atlas_beta_v1`)===`on`||window.localStorage.getItem(`ah_tactical_battlefield_lab_v1`)===`10x7`}catch{return!1}}var ks={alpha:`ALPHA`,"ally-02":`CNC`,"ally-03":`SHADOW`},As={vanguard:`Protects the front line with a guarded HOWL.`,howlkeeper:`Extends HOWL's squad-wide reach.`,pursuer:`Extends THRUST's pursuit reach.`,disruptor:`Extends PRESSURE's enemy control.`,sentinel:`Adds GUARD to PACK SUPPORT.`,medic:`Makes MEND available more frequently.`};function js(){let e=G(e=>e.progression),t=e?.playerGrowth,n=G(e=>e.progressionCommitPending),r=G(e=>e.progressionError),i=G(e=>e.upgradeGrowth),a=G(e=>e.respecGrowth),[o,s]=(0,y.useState)(`alpha`),[c,l]=(0,y.useState)(!1),[u]=(0,y.useState)(Os),[d,f]=(0,y.useState)(`vanguard`),[p,m]=(0,y.useState)(null),[h,g]=(0,y.useState)(!1),[_,v]=(0,y.useState)(null),b=rn(t,o),w=t?t.earnedPoints-t.spentPoints:0;(0,y.useEffect)(()=>{f(b?.discipline??x[o][0]),m(null),g(!1)},[o,b?.discipline]);let T=p?A(p):null,E=p?b?.ranks[p]??0:0,D=E+1,k=p?C.find(e=>e.skillId===p&&e.rank===D):null,ee=n||!t||w<1||b?.discipline!=null&&b.discipline!==d,te=p&&k&&b?Oa(p,b,D,d,en(p,e)):[],ne=!!(p&&k&&!ee&&te.length>0),re=!!(b?.discipline&&!b?.respecUsed&&Object.keys(b.ranks).length>0),ie=T&&b&&E>0&&p?Oa(p,{...b,ranks:{...b.ranks,[p]:E-1}},E,b.discipline||d,en(p,e)):[],j=!!(_&&!n&&!r&&e&&e.revision>_.revision&&t?.heroes.find(e=>e.heroId===_.heroId)?.ranks[_.skillId]===_.rank);return c&&u?(0,K.jsx)(Ds,{onClose:()=>l(!1)}):(0,K.jsxs)(`section`,{className:`t-panel t-growth-panel`,"aria-label":`Character Skillbook`,children:[(0,K.jsxs)(`header`,{className:`t-growth-heading`,children:[(0,K.jsxs)(`div`,{children:[(0,K.jsx)(`span`,{className:`t-kicker`,children:`SQUAD PROGRESSION`}),(0,K.jsx)(`h2`,{children:`CHARACTER SKILLBOOK`}),(0,K.jsx)(`p`,{children:`Choose how each squad member fights. Your choices are saved to your Alpha account.`}),u?(0,K.jsx)(`button`,{type:`button`,className:`t-growth-atlas-cta`,onClick:()=>l(!0),children:`◈ OPEN SIGNAL ATLAS · BETA`}):null]}),(0,K.jsxs)(`div`,{className:`t-growth-points`,children:[(0,K.jsx)(`strong`,{children:t?w:`—`}),(0,K.jsx)(`small`,{children:`AVAILABLE POINTS`})]})]}),t?(0,K.jsxs)(K.Fragment,{children:[(0,K.jsx)(`nav`,{className:`t-growth-roster`,"aria-label":`Choose squad member`,children:Object.keys(ks).map(e=>(0,K.jsxs)(`button`,{className:e===o?`is-selected`:``,"aria-pressed":e===o,type:`button`,onClick:()=>s(e),children:[(0,K.jsx)(`img`,{src:I[e].portrait,alt:``,onError:as}),(0,K.jsx)(`span`,{children:ks[e]})]},e))}),(0,K.jsxs)(`div`,{className:`t-growth-copy`,children:[(0,K.jsx)(`img`,{className:`t-growth-core-emblem`,src:Io(o,b?.discipline)||``,alt:``,onError:e=>{e.currentTarget.style.display=`none`}}),(0,K.jsx)(`strong`,{children:ks[o]}),(0,K.jsx)(`span`,{children:b?.discipline?`SPECIALIZATION LOCKED IN`:`CHOOSE FIRST SPECIALIZATION`})]}),(0,K.jsx)(`div`,{className:`t-growth-paths`,children:x[o].map(e=>(0,K.jsxs)(`button`,{type:`button`,className:e===d?`is-selected`:``,disabled:n||b?.discipline!=null&&b.discipline!==e,"aria-pressed":e===d,onClick:()=>{f(e),m(null)},children:[(0,K.jsx)(`img`,{className:`t-growth-path-emblem`,src:Io(o,e)||``,alt:``,loading:`lazy`,onError:e=>{e.currentTarget.style.display=`none`}}),(0,K.jsx)(`b`,{children:e.toUpperCase()}),(0,K.jsx)(`small`,{children:As[e]})]},e))}),(0,K.jsx)(`div`,{className:`t-growth-skill-list`,children:S[o].map(e=>{let n=A(e),r=b?.ranks[e]??0,i=C.find(t=>t.skillId===e&&t.rank===r+1);return(0,K.jsxs)(`button`,{type:`button`,"aria-pressed":p===e,className:p===e?`is-selected`:``,onClick:()=>{m(e),g(!1)},children:[(0,K.jsxs)(`span`,{className:`t-growth-skill-title`,children:[(0,K.jsxs)(`span`,{className:`t-growth-skill-label`,children:[(0,K.jsx)(`img`,{className:`t-growth-action-icon`,src:zo(e)||``,alt:``,loading:`lazy`,onError:e=>{e.currentTarget.style.display=`none`}}),n.slot,` · `,n.name]}),(0,K.jsxs)(`em`,{children:[`RANK `,r,`/2`]})]}),(0,K.jsx)(`small`,{children:i?O(e,i.rank,t.version):`Maximum rank reached`})]},e)})}),(0,K.jsxs)(`div`,{className:`t-growth-confirm`,children:[(0,K.jsxs)(`div`,{"aria-live":`polite`,children:[(0,K.jsx)(`strong`,{children:T?T.name:`SELECT A SKILL`}),ie.length?(0,K.jsxs)(`div`,{className:`t-growth-delta`,"aria-label":`Saved power proof from server progression`,children:[(0,K.jsxs)(`small`,{children:[`SAVED POWER PROOF · CURRENT RANK `,E,`/2`]}),ie.map(e=>(0,K.jsx)(`b`,{children:e},e))]}):null,(0,K.jsx)(`small`,{children:(k&&p?O(p,D,t.version):null)??(T?`All upgrades unlocked.`:`Select one of the three skills to see its next upgrade.`)}),p?(0,K.jsxs)(`small`,{children:[an[d],` Costs 1 shared point. First purchase selects the doctrine; one reset per hero. Applies only to the next accepted run, never an existing saved run.`]}):null,te.length?(0,K.jsx)(`div`,{className:`t-growth-delta`,"aria-label":`Actual combat upgrade preview`,children:te.map(e=>(0,K.jsx)(`b`,{children:e},e))}):null,D===2&&k?(0,K.jsx)(`span`,{className:`t-growth-signature`,children:`RANK 2 · EVOLVED COMBAT EFFECT`}):null,(0,K.jsx)(`small`,{children:b?.discipline&&b.discipline!==d?`Other specialization is locked. Use your one free respec to change it.`:k&&!te.length?`No effective combat change at this rank. Purchase disabled pending balance review.`:w<1?`Earn a point from a first-time mission clear.`:`Each upgrade costs 1 point and changes real combat behavior.`})]}),(0,K.jsx)(`button`,{className:`t-btn t-btn-primary`,type:`button`,disabled:!ne,onClick:()=>{p&&ne&&(v({heroId:o,skillId:p,rank:D,revision:e?.revision??-1}),i(o,d,p,D))},children:n?`SAVING...`:`CONFIRM UPGRADE`})]}),j?(0,K.jsxs)(`p`,{className:`t-growth-confirmed`,role:`status`,children:[`UPGRADE RECORDED · RANK `,_?.rank,`/2 · READY FOR NEXT BATTLE`]}):null,re?(0,K.jsx)(`div`,{className:`t-growth-respec`,children:h?(0,K.jsxs)(K.Fragment,{children:[(0,K.jsx)(`span`,{children:`Refund this hero's skill points and reset their specialization? This is irreversible.`}),(0,K.jsx)(`button`,{className:`t-btn`,disabled:n,type:`button`,onClick:()=>g(!1),children:`CANCEL`}),(0,K.jsx)(`button`,{className:`t-btn`,disabled:n,type:`button`,onClick:()=>{g(!1),a(o)},children:`CONFIRM RESET`})]}):(0,K.jsx)(`button`,{className:`t-btn`,type:`button`,disabled:n,onClick:()=>g(!0),children:`RESET THIS HERO · ONCE FREE`})}):b?.respecUsed?(0,K.jsx)(`small`,{className:`t-growth-notice`,children:`This hero has already used their one free respec.`}):null,r?(0,K.jsx)(`p`,{className:`t-growth-error`,role:`alert`,children:r}):null]}):(0,K.jsx)(`p`,{className:`t-growth-notice`,children:`Skillbook is waiting for authenticated server progression. No upgrades can be spent offline.`})]})}var Ms=[`Recon`,`Control`,`Defense`,`Mobility`,`Support`];function Ns(e){let t=e.effects.filter(e=>e.kind===`status`);return e.effects.some(e=>e.kind===`heal`)?`Support`:t.some(e=>e.status===`GUARD`||e.status===`DEF_UP`)?`Defense`:t.some(e=>e.status===`ATK_DOWN`||e.status===`SPD_DOWN`)?`Control`:t.some(e=>e.status===`SPD_UP`&&e.on===`self`)?`Mobility`:t.some(e=>e.status===`ATK_UP`||e.status===`SPD_UP`)?`Support`:null}function Ps(e,t){let n=[];for(let r of e){let e=D(t,r.defId),i=Array.isArray(r.skillIds)?r.skillIds:[];for(let t of i){let i=E(A(t),e),a=Ns(i);a&&n.push({family:a,unit:r.name,skillId:T(t),skillName:i.name,slot:i.slot,description:i.desc,cooldown:i.cooldownMax})}}return n}function Fs(e,t){if(!e.includes(`alpha`))return`Alpha must lead the deployed squad.`;let n=[];return e.includes(`ally-02`)||n.push(`CNC range and pressure`),e.includes(`ally-03`)||n.push(`SHADOW healing and shelter`),t&&!e.includes(`pet:${t}`)&&n.push(`PET pursuit and HAMSTRING`),n.length?`Not deployed: ${n.join(`; `)}.`:`All currently available squad roles are deployed.`}function Is(e,t){return e.flatMap(e=>{let n=D(t,e.defId);return e.skillIds.map(t=>{let r=E(A(t),n);return{unitId:e.defId,unitName:e.name,slot:r.slot,skillId:t,name:r.name,family:Ns(r),cooldown:r.cooldownMax,minRange:r.minRange,maxRange:r.maxRange,description:r.desc,targetType:r.targetType,effects:r.effects.map(e=>({...e}))}})})}function Ls(e,t,n=!1){let r=t?.heroes.find(e=>e.heroId===`ally-02`)?.discipline===`disruptor`,i=n&&r?e.find(e=>e.unitId===`ally-02`&&T(e.skillId)===`u02-suppress`&&e.effects.some(e=>e.kind===`status`&&e.on===`hits`)):void 0,a=e.find(e=>e.effects.some(e=>e.kind===`status`&&e.status===`SPD_DOWN`&&(e.on===`hits`||e.on===`primary`||e.on===`aoe_enemies`))),o=e.find(e=>e.effects.some(e=>e.kind===`status`&&(e.status===`GUARD`||e.status===`DEF_UP`)&&(e.on===`aoe_allies`||e.on===`primary`))),s=e.find(e=>e.effects.some(e=>e.kind===`heal`&&(e.on===`primary`||e.on===`aoe_allies`))),c=(e,t,n,r)=>({id:e,label:t,available:!!n,source:n?`${n.unitName} · ${n.name}`:null,detail:r});return[c(`INTERRUPT`,`CANCEL LOCKED ATTACK`,i,n?`CNC Disruptor PRESSURE can cancel a confirmed locked attack.`:`Available only while VNext intent telegraphs are enabled.`),c(`SLOW`,`SLOW PURSUIT`,a,`Speed reduction can delay a pursuing or escaping unit.`),c(`PROTECT`,`PROTECT ALLIES`,o,`Shield or DEF support reduces danger while allies hold position.`),c(`RECOVER`,`RECOVER HP`,s,`Healing restores allies after damage; it does not cancel a locked attack.`)]}var Rs={startHero:`/images/tactical_ops/presentation/tactical_ops_start_hero_backdrop.png`,battlefield:`/images/tactical_ops/presentation/tactical_ops_battlefield_backdrop.png`,operationPlate:`/images/tactical_ops/presentation/tactical_ops_broken_signal_operation_plate.png`,resultsPlate:`/images/tactical_ops/presentation/tactical_ops_operation_complete_plate.png`,bossTarget:`/images/tactical_ops/presentation/tactical_ops_boss_target.png`,recoveryMarker:`/images/tactical_ops/presentation/tactical_ops_signal_recovery_marker.png`,traceTarget:`/images/tactical_ops/presentation/tactical_ops_trace_target.png`,reinforcementWarning:`/images/tactical_ops/presentation/tactical_ops_reinforcement_warning.png`};function zs(e){return e.objectiveType===`BOSS`?{art:Rs.bossTarget,tone:`boss`,label:`COMMAND TARGET`}:e.objectiveType===`RECOVER`?{art:Rs.recoveryMarker,tone:`recover`,label:`SIGNAL RECOVERY`}:e.objectiveType===`INTERCEPT`?{art:Rs.traceTarget,tone:`intercept`,label:`INTERCEPT`}:e.objectiveType===`HOLD`?{art:Rs.reinforcementWarning,tone:`hold`,label:`HOLD THE LINE`}:e.objectiveType===`SURVIVE`?{art:Rs.battlefield,tone:`survive`,label:`ENDURE`}:{art:Rs.operationPlate,tone:`assault`,label:`ASSAULT`}}var Bs={alpha:`Melee pressure`,skirmisher:`Skirmisher`,ranged:`Skirmisher`,support:`Support`,companion:`Mobile control`,hostile:`Melee`,leader:`Heavy`};function Vs(e){let t=e.objective;return t?.type===`INTERCEPT`?`Stop the courier before the south-east exit.`:t?.type===`HOLD`?`Control the relay · ${t.duration} consecutive round changes.`:t?.type===`SURVIVE`?`Keep the full squad standing · ${t.duration} rounds.`:e.objectiveType===`RECOVER`?`Reach the relay. Use RECOVER.`:e.objectiveType===`BOSS`?e.operationId===je.operationId?`Defeat the DEAD RELAY GUARDIAN.`:`Defeat the SIGNAL COMMANDER.`:`Eliminate the HOUND patrol.`}function Hs(e){return e.objectiveType===`SURVIVE`?`Your squad is ready. Deploy to earn Commander progress and rewards.`:e.objectiveType===`HOLD`?`Hold the relay under pressure and stabilize the area.`:e.objectiveType===`RECOVER`?`Move fast, reach the relay and recover the signal before the area collapses.`:e.objectiveType===`BOSS`?`End the chain. Defeat the Signal Commander and secure the operation.`:`Clear the route, protect your squad and keep momentum.`}function Us(e){return e.directive?.name||`STANDARD CONDITIONS`}function Ws(e,t){let n=e.skillIds.map(e=>k[e]?.name).filter(Boolean).join(` / `);return`${e.defId===`ally-02`?`BUG HUNTER WARDEN · Spear skirmisher`:Bs[e.role]||e.role} · ${n} · ${t||`MOVE ${e.move}`}`}function Gs({dim:e=.55,art:t=`/images/tactical_ops/battlefield.jpg`,className:n=``}){return(0,K.jsxs)(`div`,{className:`t-bg ${n}`,"aria-hidden":`true`,children:[(0,K.jsx)(`img`,{src:t,alt:``}),(0,K.jsx)(`div`,{className:`t-vignette`,style:{background:`rgb(10 12 16 / ${e})`}})]})}function Ks(){let e=G(e=>e.openBrief),t=G(e=>e.onboardingEnabled),n=G(e=>e.onboardingStageId),r=G(e=>e.foundationCompleted),i=G(e=>e.progressionStatus),a=G(e=>e.progressionError),o=Qa(t,n),s=r?`Foundation complete`:t?o.operationName:de.name,c=r?`Broken Signal training sequence completed.`:t?o.objective:i===`error`?`Foundation progression could not be loaded. Reopen Tactical Ops to retry.`:de.objective;return(0,K.jsxs)(`div`,{className:`t-fill`,children:[(0,K.jsx)(Gs,{dim:.35,art:Rs.startHero,className:`t-bg-hero`}),(0,K.jsx)(`div`,{className:`t-vignette`}),(0,K.jsx)(`div`,{className:`t-hub`,children:(0,K.jsxs)(`div`,{className:`t-hub-copy`,children:[(0,K.jsx)(`div`,{className:`t-kicker`,children:`Alpha Husky`}),(0,K.jsx)(`h1`,{className:`t-title`,children:`Tactical Ops`}),(0,K.jsx)(os,{}),(0,K.jsx)(`h2`,{children:`Combat Core`}),(0,K.jsxs)(`div`,{className:`t-panel t-op-card`,children:[(0,K.jsx)(`span`,{className:`t-kicker`,children:`Operation`}),(0,K.jsx)(`strong`,{children:s}),(0,K.jsx)(`p`,{children:c})]}),a?(0,K.jsx)(`p`,{style:{color:`var(--t-enemy)`,margin:`0.8rem 0 0`},children:a}):null,(0,K.jsx)(`div`,{className:`t-brief-actions`,children:(0,K.jsxs)(`button`,{type:`button`,className:`t-btn t-btn-primary`,onClick:e,disabled:r||i===`error`,children:[r?`Foundation complete`:`Mission Brief`,(0,K.jsx)(Ht,{className:`t-ico`})]})})]})})]})}function qs({receipt:e}){let t=G(e=>e.backToHub);return(0,K.jsxs)(`div`,{className:`t-fill`,children:[(0,K.jsx)(Gs,{dim:.6}),(0,K.jsx)(`div`,{className:`t-overlay t-results-overlay`,children:(0,K.jsxs)(`div`,{className:`t-modal t-panel t-results ${e.victory?`is-victory`:`is-failure`}`,"data-first-session-result":e.runId,children:[(0,K.jsxs)(`header`,{className:`t-outcome-hero`,children:[(0,K.jsxs)(`span`,{className:`t-kicker`,children:[`ACTION / `,e.name]}),(0,K.jsx)(`h2`,{className:`t-title`,children:e.victory?`MISSION SECURED`:`MISSION LOST`})]}),(0,K.jsx)(os,{}),(0,K.jsxs)(`dl`,{className:`t-stats`,children:[(0,K.jsxs)(`div`,{children:[(0,K.jsx)(`dt`,{children:`Turns`}),(0,K.jsx)(`dd`,{children:e.results.turns})]}),(0,K.jsxs)(`div`,{children:[(0,K.jsx)(`dt`,{children:`Eliminated`}),(0,K.jsx)(`dd`,{children:e.results.hostilesEliminated})]}),(0,K.jsxs)(`div`,{children:[(0,K.jsx)(`dt`,{children:`Squad standing`}),(0,K.jsxs)(`dd`,{children:[e.results.squadStanding,` / `,e.results.squadDeployed]})]})]}),(0,K.jsxs)(`section`,{"aria-label":`Consequence`,children:[(0,K.jsx)(`div`,{className:`t-kicker`,children:`CONSEQUENCE`}),(0,K.jsx)(`p`,{children:e.consequence})]}),e.fieldResult?(0,K.jsx)(Js,{result:e.fieldResult}):(0,K.jsxs)(`section`,{"aria-label":`Growth`,children:[(0,K.jsx)(`div`,{className:`t-kicker`,children:`GROWTH`}),(0,K.jsx)(`p`,{children:e.growth})]}),(0,K.jsx)(`div`,{className:`t-brief-actions t-result-actions`,children:(0,K.jsx)(`button`,{type:`button`,className:`t-btn t-btn-primary`,onClick:()=>{if(Mt()?.acknowledge(e.runId)){let e=G.getState();[`results`,`defeat`].includes(e.screen)&&t()}},children:`Continue`})})]})})]})}function Js({result:e}){let t=e.advancedUnlocked?`ADVANCED DIRECTIVES`:e.unlockedApproaches.includes(`south`)?`SOUTH APPROACH`:null,n=e.rankAfter<2?6:12;return(0,K.jsxs)(`section`,{className:`t-field-feedback`,"aria-label":`Recorded Field Op result`,children:[t?(0,K.jsxs)(`div`,{className:`t-unlock`,children:[(0,K.jsx)(`span`,{className:`t-kicker`,children:`UNLOCKED`}),(0,K.jsx)(`strong`,{children:t})]}):null,(0,K.jsxs)(`div`,{className:`t-progress-heading`,children:[(0,K.jsxs)(`div`,{children:[(0,K.jsx)(`span`,{className:`t-kicker`,children:`COMMANDER`}),(0,K.jsxs)(`strong`,{children:[`RANK `,e.rankBefore===e.rankAfter?``:`${e.rankBefore} → `,e.rankAfter]})]}),(0,K.jsxs)(`b`,{children:[`+`,e.progressEarned,(0,K.jsx)(`small`,{children:`PROGRESS`})]})]}),(0,K.jsx)(`progress`,{className:`t-progress`,"aria-label":`Commander progress`,value:Math.min(e.progressAfter,n),max:n}),(0,K.jsxs)(`div`,{className:`t-progress-caption`,children:[(0,K.jsxs)(`span`,{children:[e.progressBefore,` → `,e.progressAfter,` TOTAL`]}),(0,K.jsx)(`span`,{children:e.rankAfter>=3?`CERTIFIED · ALL CURRENT COMMAND TOOLS OPEN`:`${Math.max(0,n-e.progressAfter)} TO RANK ${e.rankAfter+1}`})]}),e.victory&&e.progressEarned===0?(0,K.jsxs)(`div`,{className:`t-mission-strip`,children:[(0,K.jsx)(`span`,{children:`CLEAR SECURED · REPLAY`}),(0,K.jsx)(`span`,{children:`+0 COMMANDER`})]}):null,e.victory&&e.firstCycleSecure===!1&&e.progressEarned>0?(0,K.jsxs)(`div`,{className:`t-mission-strip`,children:[(0,K.jsx)(`span`,{children:`CLEAR ALREADY SECURED`}),(0,K.jsxs)(`span`,{children:[`CHALLENGE +`,e.challengeBonus,` COMMANDER`]})]}):null,(0,K.jsxs)(`div`,{className:`t-mission-strip`,children:[(0,K.jsx)(`span`,{children:e.legacyReport?`CHALLENGE UNMEASURED`:e.challengeSuccess?e.challengeBonus?`CHALLENGE MET · +${e.challengeBonus} COMMANDER`:`CHALLENGE ✓`:`CHALLENGE NOT MET`}),e.directiveTier===`advanced`?(0,K.jsxs)(`span`,{children:[`ADVANCED · `,ae(e.directiveSet),e.firstCycleAdvanced?` · SECURED TODAY`:e.victory?` · REPLAY`:` · FAILED`]}):null]}),(0,K.jsx)(`p`,{className:`t-player-result-meaning`,children:Qe(e)}),(0,K.jsxs)(`div`,{className:`t-mission-strip t-field-rewards`,"aria-label":`Character rewards`,children:[(0,K.jsxs)(`span`,{children:[`+`,e.xpGranted,` EXP`]}),(0,K.jsxs)(`span`,{children:[`+`,e.bonesGranted,` BONES`]})]}),e.challengeSuccess&&!e.challengeBonus?(0,K.jsx)(`small`,{children:`Challenge bonus already earned this rotation.`}):null,(0,K.jsx)(ds,{changes:e.masteryChanges,victory:e.victory}),(0,K.jsxs)(`div`,{className:`t-world-change`,children:[(0,K.jsx)(`span`,{className:`t-kicker`,children:`SIGNAL PRESSURE`}),(0,K.jsx)(`strong`,{children:e.regionalApplied?`${ie(e.pressureBefore)} → ${ie(e.pressureAfter)}`:`CURRENT ROTATION UNCHANGED`}),(0,K.jsx)(`small`,{children:e.regionalApplied?e.pressureAfter<2?`+1 ROUND DELAY · REINFORCEMENTS`:`REINFORCEMENTS ON SCHEDULE`:`Earlier rotation attempt. Current front and Commander certification unchanged.`})]})]})}function Ys(){let[e,t]=(0,y.useState)(`command`),[n,r]=(0,y.useState)(`skillbook`),[i,a]=(0,y.useState)(null),o=G(e=>e.progression),s=G(e=>e.openOperationBrief),c=G(e=>e.chooseDoctrine),l=G(e=>e.openChapterBrief),u=G(e=>e.progressionCommitPending),d=G(e=>e.progressionError),f=G(e=>e.missionFirstClear),p=o?.operations?.[Ae.operationId],m=o?.operations?.[je.operationId],h=o?.campaignIntel?.[`dead-relay`]?.courierTraceAcquired===!0,g=o?.fieldOps,_=Ue(o),v=We(o),b=o?.tacticalChapter,x=b?He(b):null,S=G(e=>e.loadFoundationProgression),C=G(e=>e.progressionStatus===`loading`);(0,y.useEffect)(()=>{if(!g?.board)return;let e=()=>{document.visibilityState===`visible`&&G.getState().progressionStatus!==`loading`&&S()},t=window.setTimeout(e,Math.max(1e3,g.board.nextRotationAt*1e3-Date.now()+250));return document.addEventListener(`visibilitychange`,e),window.addEventListener(`focus`,e),()=>{window.clearTimeout(t),document.removeEventListener(`visibilitychange`,e),window.removeEventListener(`focus`,e)}},[g?.board?.nextRotationAt,S]);let w=g?.board?.activeMissionIds||[],T=w.map(e=>R(e)).filter(Boolean),E=g?.board?.cycleId,D=g?.rotationProgress,O=new Set(D?.clearedMissionIds||[]),k=g?.activeMissionRun&&w.includes(g.activeMissionRun.missionId)?R(g.activeMissionRun.missionId):null,A=Xe(g),ee=k||R(A.missionId)||T[0]||null,te=ee?g?.records[ee.missionId]:null,ne=ee?te?.lastClearCycle===E:!1,re=ee?te?.lastChallengeCycle===E:!1,M=ee?Ze(ee,g,g?.activeMissionRun,g?.lastResult):null,oe=g?.board?N(g.board.nextRotationAt):`REFRESH REQUIRED`,se=g?.commander?.rank||1,P=g?.commander?.progress||0,F=g?.commander?.nextRankAt||null,ce=F?Math.max(0,F-P):0,le=g?.region?ie(g.region.pressure):`UNKNOWN`,ue=g?.region?j(g.region.pressure):`Refresh to load current field conditions.`,de=g?.board?.reportVersion===3?ae(g.board.directiveSet):null,I=m?.activeMissionRun?.missionId||je.orderedMissionIds.find(e=>m?.missions[e]===`available`)||null,fe=p?.status===`cleared`?m?`BROKEN SIGNAL COMPLETE · OPERATION 02 THE DEAD RELAY NOW AVAILABLE`:`BROKEN SIGNAL COMPLETE · FIELD OPS NOW DRIVE YOUR TACTICAL PROGRESSION`:p?.missions[`broken-signal-recover`]===`cleared`?`RECOVER SIGNAL CLEARED · SIGNAL COMMANDER AVAILABLE`:`BREACH CLEARED · RECOVER SIGNAL UNLOCKED`,pe=m?(0,K.jsxs)(`section`,{className:`t-panel ${m.status===`cleared`?`t-wt-story-archive`:`t-wt-campaign-feature`}`,"aria-label":`Operation 02 campaign`,children:[(0,K.jsxs)(`div`,{className:`t-wt-section-head`,children:[(0,K.jsxs)(`div`,{children:[(0,K.jsx)(`span`,{className:`t-kicker`,children:`STORY CAMPAIGN · OPERATION 02`}),(0,K.jsx)(`h2`,{className:`t-title`,children:`THE DEAD RELAY`})]}),(0,K.jsx)(`strong`,{children:m.status===`cleared`?`CAMPAIGN SECURED`:m.missions[`dead-relay-courier`]===`locked`?`LOCKED`:`IN PROGRESS`})]}),(0,K.jsx)(`p`,{children:`Intercept the courier. Hold the relay. Defeat its Guardian. Each first clear unlocks the next stage; your courier Intel changes the Hold mission.`}),m.status!==`cleared`&&I?(0,K.jsxs)(`div`,{className:`t-wt-campaign-actions`,children:[(0,K.jsxs)(`div`,{children:[(0,K.jsx)(`span`,{className:`t-kicker`,children:`NEXT STORY MISSION`}),(0,K.jsx)(`strong`,{children:R(I)?.name||`THE DEAD RELAY`})]}),(0,K.jsx)(`button`,{className:`t-btn t-btn-primary t-wt-campaign-cta`,type:`button`,disabled:C,onClick:()=>s(I),children:m.activeMissionRun?.missionId?`RESUME CAMPAIGN`:`CONTINUE CAMPAIGN`})]}):null,(0,K.jsxs)(`div`,{className:`t-mission-strip`,children:[(0,K.jsx)(`span`,{children:`COURIER TRACE`}),(0,K.jsx)(`strong`,{children:h?`ACQUIRED · HOUND ARRIVES 1 ROUND LATER`:`NOT RECORDED · EARLY INTERCEPT REQUIRED`})]}),(0,K.jsx)(`div`,{className:`t-brief-grid t-wt-canon-grid`,children:je.orderedMissionIds.map((e,t)=>{let n=R(e);if(!n)return null;let r=m.missions[e]||`locked`,i=m.activeMissionRun?.missionId===e;return(0,K.jsxs)(`div`,{className:`t-panel t-brief-block t-story-mission is-${r}`,children:[(0,K.jsxs)(`span`,{className:`t-kicker`,children:[`MISSION `,String(t+1).padStart(2,`0`),` · `,n.objectiveType]}),(0,K.jsx)(`strong`,{children:n.name}),(0,K.jsx)(`small`,{children:r===`cleared`?`CLEARED`:r===`available`?`AVAILABLE`:`LOCKED`}),(0,K.jsx)(`button`,{type:`button`,className:`t-btn`,disabled:C||r===`locked`,onClick:()=>s(e),children:i?`RESUME FROM START`:r===`cleared`?`REPLAY`:r===`available`?`VIEW BRIEF`:`LOCKED`})]},e)})}),(0,K.jsx)(`small`,{children:`Resume restarts the accepted battle from turn 1; mid-battle positions and HP are not saved.`})]}):null;return(0,K.jsxs)(`div`,{className:`t-fill`,children:[(0,K.jsx)(Gs,{dim:.5,art:Rs.startHero,className:`t-bg-hero`}),(0,K.jsx)(`div`,{className:`t-vignette`}),(0,K.jsxs)(`div`,{className:`t-brief t-war-table-premium t-war-table-v29 t-command-art-shell t-premium-ux`,style:{maxWidth:`64rem`},children:[(0,K.jsxs)(`header`,{className:`t-panel t-wt-hero t-wt-hero-compact`,children:[(0,K.jsxs)(`div`,{className:`t-wt-branding`,children:[(0,K.jsx)(`div`,{className:`t-kicker`,children:`Alpha Husky / Tactical Ops`}),(0,K.jsx)(`h1`,{className:`t-title t-wt-title`,children:`TACTICAL OPS`}),(0,K.jsx)(`p`,{className:`t-wt-intro`,children:`Your next move starts here.`}),d?(0,K.jsx)(`p`,{className:`t-wt-error`,children:d}):null,f?(0,K.jsx)(`p`,{className:`t-wt-highlight`,children:fe}):null]}),(0,K.jsx)(`button`,{className:`t-wt-refresh`,type:`button`,disabled:C,onClick:()=>void S(),"aria-label":`Refresh Tactical Ops`,children:C?`SYNCING…`:`REFRESH`})]}),(0,K.jsx)(`nav`,{className:`t-command-nav t-command-framed-nav`,"aria-label":`Tactical command sections`,children:[[`command`,`01`,`COMMAND`],[`missions`,`02`,`MISSIONS`],[`squad`,`03`,`SQUAD`],[`archive`,`04`,`ARCHIVE`]].map(([n,r,i])=>(0,K.jsxs)(`button`,{type:`button`,className:e===n?`is-current`:``,"aria-pressed":e===n,onClick:()=>t(n),children:[(0,K.jsx)(`span`,{children:r}),(0,K.jsx)(`strong`,{children:i})]},n))}),e===`command`?(0,K.jsxs)(`div`,{className:`t-command-pane`,"aria-label":`Command overview`,children:[b&&x?(0,K.jsxs)(`section`,{className:`t-panel t-chapter-readout`,"aria-label":`Server accepted doctrine chapter`,children:[(0,K.jsx)(`div`,{className:`t-kicker`,children:`CAMPAIGN CHAPTER · SERVER RECORDED`}),(0,K.jsx)(`h2`,{className:`t-title`,children:x.title}),(0,K.jsx)(`div`,{className:`t-chapter-steps`,children:b.status===`AVAILABLE`?Object.entries(Re).map(([e,t])=>(0,K.jsxs)(`div`,{children:[(0,K.jsxs)(`strong`,{children:[e,` · `,t.title]}),(0,K.jsx)(`p`,{children:t.copy}),e===`RECON`?(0,K.jsx)(`button`,{type:`button`,className:`t-btn t-btn-primary`,disabled:C||u,onClick:()=>void c(),children:`COMMIT TO GHOST SIGNAL`}):(0,K.jsx)(`small`,{children:`Future doctrine · not yet operational`})]},e)):(0,K.jsxs)(K.Fragment,{children:[(0,K.jsxs)(`strong`,{children:[x.stage,` / `,x.total,` OPERATIONS VERIFIED`]}),(0,K.jsx)(`p`,{children:x.nextMissionName?`NEXT · ${x.nextMissionName}`:`CHAPTER COMPLETE`})]})}),b.status===`ACTIVE`&&b.doctrine===`RECON`?(0,K.jsx)(`button`,{type:`button`,className:`t-btn t-btn-primary`,disabled:C||u,onClick:l,children:b.activeRunId?`RESUME CHAPTER RUN`:`DEPLOY NEXT CHAPTER OP`}):null,b.status===`COMPLETED`?(0,K.jsx)(`strong`,{children:b.intelConsumedByRunId?`INTEL DEPLOYED IN AN ACCEPTED RUN`:`RECON INTEL READY · DELAY NEXT ELIGIBLE REINFORCEMENT`}):null,(0,K.jsx)(`p`,{children:x.consequence}),(0,K.jsx)(`small`,{children:b.status===`AVAILABLE`?`Doctrine selection becomes playable only after the server exposes a verified choice action. No client-only selection.`:`Mission progress advances only on the next accepted server receipt. Existing Field Ops can still be played normally.`})]}):null,(0,K.jsxs)(`section`,{className:`t-campaign-orders`,"aria-label":`Tactical campaign orders`,children:[(0,K.jsxs)(`div`,{className:`t-campaign-orders-head`,children:[(0,K.jsxs)(`div`,{children:[(0,K.jsx)(`span`,{className:`t-kicker`,children:`TACTICAL CAMPAIGN · ACTIVE ORDERS`}),(0,K.jsx)(`h2`,{children:`YOUR NEXT DECISIONS`})]}),(0,K.jsxs)(`small`,{children:[`SERVER-RECORDED GOALS`,(0,K.jsx)(`br`,{}),`NO UNCONFIRMED REWARDS`]})]}),(0,K.jsx)(`div`,{className:`t-campaign-orders-grid`,children:_.map(e=>(0,K.jsxs)(`article`,{className:`t-campaign-order is-${e.category.toLowerCase()} is-${e.status.toLowerCase()}`,children:[(0,K.jsxs)(`div`,{className:`t-campaign-order-top`,children:[(0,K.jsx)(`span`,{children:e.category}),(0,K.jsx)(`b`,{children:e.status.replace(`_`,` `)})]}),(0,K.jsx)(`h3`,{children:e.title}),(0,K.jsx)(`strong`,{children:e.goal}),(0,K.jsx)(`p`,{children:e.consequence}),e.missionId?(0,K.jsx)(`button`,{className:`t-btn t-btn-primary`,type:`button`,disabled:C,onClick:()=>s(e.missionId),children:e.status===`IN_PROGRESS`?`RESUME BRIEF`:`PLAN OPERATION`}):null]},e.id))}),v?(0,K.jsxs)(`div`,{className:`t-campaign-career`,"aria-label":`Persisted commander career`,children:[(0,K.jsxs)(`span`,{children:[`CAREER · `,v.missions,` FIELD SECURES`]}),(0,K.jsxs)(`span`,{children:[v.challenges,` CHALLENGES`]}),(0,K.jsxs)(`span`,{children:[v.advanced,` ADVANCED CLEARS`]}),(0,K.jsxs)(`span`,{children:[v.fronts,` FRONTS SECURED`]})]}):(0,K.jsx)(`small`,{children:`Career record unavailable until the server provides it.`})]}),ee?(()=>{let e=zs(ee);return(0,K.jsx)(K.Fragment,{children:(0,K.jsxs)(`section`,{className:`t-panel t-wt-feature t-wt-next-op t-command-mission-feature t-mission-tone-${e.tone}`,"aria-label":`Recommended next operation`,children:[(0,K.jsxs)(`div`,{className:`t-wt-feature-art`,children:[(0,K.jsx)(`img`,{src:e.art,alt:``,"aria-hidden":`true`}),(0,K.jsx)(`span`,{className:`t-wt-art-label`,children:e.label})]}),(0,K.jsxs)(`div`,{className:`t-wt-feature-copy`,children:[(0,K.jsx)(`div`,{className:`t-kicker`,children:k?`Resume run`:`Next op`}),(0,K.jsx)(`h2`,{children:ee.name}),(0,K.jsx)(`p`,{className:`t-wt-objective`,children:M?.objectiveText}),(0,K.jsxs)(`div`,{className:`t-player-route-metrics`,"aria-label":`Next step and rotation progress`,children:[(0,K.jsxs)(`span`,{children:[D?.securedCount||0,`/`,D?.total||w.length,` FIELD OPS SECURED`]}),(0,K.jsx)(`span`,{children:se>=3?`COMMANDER CERTIFIED`:F?`${ce} TO RANK ${se+1}`:`COMMANDER STATUS PENDING`}),(0,K.jsx)(`span`,{children:M?.rewardEligibility.clear===`SECURED`?`CLEAR SECURED`:`FIRST CLEAR OPEN`})]}),(0,K.jsx)(`p`,{className:`t-player-next-reason`,children:A.reason}),(0,K.jsxs)(`div`,{className:`t-wt-reward-chips t-premium-reward-strip`,"aria-label":`Mission progression rewards`,children:[(0,K.jsx)(`span`,{children:M?.rewardClearText}),(0,K.jsx)(`span`,{className:re?`is-earned`:``,children:M?.rewardChallengeText}),(0,K.jsx)(`span`,{children:`Mastery from eligible first clear / challenge`})]})]}),(0,K.jsx)(`div`,{className:`t-wt-feature-cta`,children:(0,K.jsxs)(`button`,{className:`t-btn t-btn-primary t-wt-main-cta t-command-hero-cta`,type:`button`,disabled:C,onClick:()=>s(ee.missionId),children:[k?`RESUME OP`:ne?`DEPLOY AGAIN`:`VIEW BRIEF`,(0,K.jsx)(Ht,{className:`t-ico`})]})})]})})})():null,(0,K.jsxs)(`section`,{className:`t-wt-status-rail t-wt-status-rail-v29 t-premium-status-rail`,"aria-label":`Tactical Ops overview`,children:[(0,K.jsxs)(`div`,{className:`t-panel t-wt-status-card t-wt-rank-card`,children:[(0,K.jsx)(`span`,{className:`t-kicker`,children:`Commander`}),(0,K.jsx)(`strong`,{children:se>=3?`RANK 3 · CERTIFIED`:`RANK ${se}`}),F?(0,K.jsxs)(K.Fragment,{children:[(0,K.jsx)(`progress`,{className:`t-progress`,value:Math.min(P,F),max:F}),(0,K.jsxs)(`small`,{children:[P,` / `,F,` progress`]})]}):(0,K.jsx)(`small`,{children:`All current command tools unlocked`})]}),(0,K.jsxs)(`div`,{className:`t-panel t-wt-status-card t-wt-pressure-card is-${le.toLowerCase()}`,children:[(0,K.jsx)(`span`,{className:`t-kicker`,children:`Area status`}),(0,K.jsx)(`strong`,{children:le}),(0,K.jsx)(`small`,{children:ue})]}),(0,K.jsxs)(`div`,{className:`t-panel t-wt-status-card`,children:[(0,K.jsx)(`span`,{className:`t-kicker`,children:`Rotation`}),(0,K.jsx)(`strong`,{children:oe}),(0,K.jsxs)(`small`,{children:[w.length||0,` active Field Ops`,de?` · ${de}`:``]})]})]}),g?.board&&D?(0,K.jsxs)(`button`,{type:`button`,className:`t-premium-front-link`,onClick:()=>t(`missions`),children:[(0,K.jsxs)(`span`,{children:[(0,K.jsx)(`strong`,{children:`FRONT STATUS`}),(0,K.jsxs)(`small`,{children:[D.securedCount,`/`,D.total,` SECURED · `,D.challengeMissionIds.length,` CHALLENGES`]})]}),(0,K.jsxs)(`span`,{children:[`VIEW MISSIONS `,(0,K.jsx)(Ht,{className:`t-ico`})]})]}):null,g?.activeMissionRun&&!g.board?.activeMissionIds.includes(g.activeMissionRun.missionId)?(0,K.jsxs)(`section`,{className:`t-panel t-wt-legacy-run`,children:[(0,K.jsxs)(`div`,{children:[(0,K.jsx)(`div`,{className:`t-kicker`,children:`Saved run`}),(0,K.jsx)(`strong`,{children:R(g.activeMissionRun.missionId)?.name}),(0,K.jsx)(`p`,{children:`This run started before the rotation changed. Its original conditions are preserved.`})]}),(0,K.jsx)(`button`,{type:`button`,className:`t-btn`,onClick:()=>s(g.activeMissionRun.missionId),children:`RESUME`})]}):null]}):null,e===`missions`?(0,K.jsxs)(`div`,{className:`t-command-pane`,"aria-label":`Operations and field missions`,children:[m?.status===`cleared`?null:pe,(0,K.jsxs)(`section`,{className:`t-panel t-wt-section t-wt-current-ops`,"aria-label":`Current Field Ops`,children:[(0,K.jsxs)(`div`,{className:`t-wt-section-head`,children:[(0,K.jsxs)(`div`,{children:[(0,K.jsx)(`div`,{className:`t-kicker`,children:`This rotation`}),(0,K.jsx)(`h2`,{className:`t-title`,children:`CURRENT FIELD OPS`})]}),(0,K.jsxs)(`span`,{children:[w.length,` ACTIVE`]})]}),(0,K.jsx)(`nav`,{className:`t-op-selector`,"aria-label":`Select a Field Op`,children:T.map((e,t)=>(0,K.jsxs)(`button`,{type:`button`,"aria-pressed":(i&&w.includes(i)?i:w[0])===e.missionId,className:(i&&w.includes(i)?i:w[0])===e.missionId?`is-selected`:``,onClick:()=>a(e.missionId),children:[(0,K.jsx)(`span`,{children:String(t+1).padStart(2,`0`)}),(0,K.jsx)(`strong`,{children:e.name}),(0,K.jsx)(`small`,{children:O.has(e.missionId)?`SECURED`:`FIRST CLEAR`})]},e.missionId))}),(0,K.jsx)(`div`,{className:`t-wt-mission-list t-op-selected`,children:T.filter(e=>e.missionId===(i&&w.includes(i)?i:w[0])).map(e=>{let t=g?.records[e.missionId],n=t?.lastClearCycle===g?.board?.cycleId,r=t?.lastChallengeCycle===g?.board?.cycleId,i=Fe(e,{reportVersion:g?.board?.reportVersion||2}),a=zs(i);return(0,K.jsxs)(`article`,{className:`t-wt-mission-card t-panel t-mission-tone-${a.tone} ${n?`is-cleared`:`is-active`}`,children:[(0,K.jsxs)(`div`,{className:`t-wt-mission-art`,children:[(0,K.jsx)(`img`,{src:a.art,alt:``,"aria-hidden":`true`}),(0,K.jsx)(`span`,{className:`t-wt-mission-type`,children:a.label})]}),(0,K.jsxs)(`div`,{className:`t-wt-mission-body`,children:[(0,K.jsxs)(`div`,{className:`t-wt-mission-head`,children:[(0,K.jsxs)(`div`,{children:[(0,K.jsx)(`h3`,{children:e.name}),(0,K.jsx)(`p`,{children:Vs(i)})]}),(0,K.jsx)(`div`,{className:`t-wt-mission-state`,children:n?`SECURED TODAY`:`AVAILABLE`})]}),(0,K.jsxs)(`div`,{className:`t-player-mission-counter`,children:[`OPERATION `,w.indexOf(e.missionId)+1,` / `,w.length,` · `,a.label,` · `,n?`CLEARED`:`UNCLEARED`]}),(0,K.jsxs)(`div`,{className:`t-wt-mission-meta`,children:[(0,K.jsxs)(`span`,{children:[(0,K.jsx)(`b`,{children:`CLEAR`}),` `,n?`SECURED · REPLAY`:`+2 COMMANDER`]}),(0,K.jsxs)(`span`,{className:r?`is-earned`:``,children:[(0,K.jsx)(`b`,{children:`CHALLENGE`}),` `,r?`✓`:`+1 COMMANDER · ${e.challenge?.label||`Optional challenge`}`]})]}),(0,K.jsxs)(`details`,{className:`t-detail t-wt-card-detail`,children:[(0,K.jsx)(`summary`,{children:`Field conditions`}),(0,K.jsxs)(`p`,{children:[(0,K.jsxs)(`strong`,{children:[Us(e),`.`]}),` `,Hs(e)]}),(0,K.jsxs)(`p`,{children:[(0,K.jsx)(`strong`,{children:`Area:`}),` `,ue]})]})]}),(0,K.jsx)(`div`,{className:`t-wt-mission-cta`,children:(0,K.jsxs)(`button`,{className:`t-btn t-btn-primary`,type:`button`,disabled:C,onClick:()=>s(e.missionId),children:[n?`DEPLOY AGAIN`:`VIEW BRIEF`,(0,K.jsx)(Ht,{className:`t-ico`})]})})]},e.missionId)})})]})]}):null,e===`squad`?(0,K.jsxs)(`div`,{className:`t-command-pane`,"aria-label":`Character progression and mastery`,children:[(0,K.jsxs)(`div`,{className:`t-premium-squad-switch`,role:`group`,"aria-label":`Squad progression view`,children:[(0,K.jsx)(`button`,{type:`button`,"aria-pressed":n===`skillbook`,className:n===`skillbook`?`is-selected`:``,onClick:()=>r(`skillbook`),children:`CHARACTER SKILLBOOK`}),(0,K.jsx)(`button`,{type:`button`,"aria-pressed":n===`mastery`,className:n===`mastery`?`is-selected`:``,onClick:()=>r(`mastery`),children:`PACK MASTERY`})]}),n===`skillbook`?(0,K.jsx)(js,{}):(0,K.jsx)(us,{})]}):null,e===`archive`?(0,K.jsxs)(`div`,{className:`t-command-pane`,"aria-label":`Campaign archive and test settings`,children:[m?.status===`cleared`?pe:null,(0,K.jsxs)(`details`,{className:`t-panel t-wt-story-archive`,children:[(0,K.jsxs)(`summary`,{children:[(0,K.jsxs)(`span`,{children:[(0,K.jsx)(`span`,{className:`t-kicker`,children:`Story archive`}),(0,K.jsx)(`strong`,{children:`OPERATION 01 · BROKEN SIGNAL`})]}),(0,K.jsx)(`b`,{children:p?.status===`cleared`?`COMPLETE`:`IN PROGRESS`})]}),(0,K.jsx)(`p`,{children:p?.status===`cleared`?`Canon secured. Replay the three story missions whenever you want.`:`Complete BREACH → RECOVER SIGNAL → SIGNAL COMMANDER to secure the operation.`}),(0,K.jsx)(`div`,{className:`t-brief-grid t-wt-canon-grid`,children:Ae.orderedMissionIds.map((e,t)=>{let n=R(e);if(!n)return null;let r=p?.missions[e]||`locked`,i=n.executable&&(r===`available`||r===`cleared`);return(0,K.jsxs)(`div`,{className:`t-panel t-brief-block t-story-mission is-${r}`,children:[(0,K.jsxs)(`span`,{className:`t-kicker`,children:[`MISSION `,String(t+1).padStart(2,`0`)]}),(0,K.jsx)(`strong`,{children:n.name}),(0,K.jsx)(`small`,{children:r===`cleared`?`CLEARED`:r===`available`?`AVAILABLE`:`LOCKED`}),(0,K.jsx)(`button`,{type:`button`,className:`t-btn`,disabled:!i,onClick:()=>s(e),children:r===`cleared`?`REPLAY`:r===`available`?`VIEW BRIEF`:`LOCKED`})]},e)})})]}),g?.lastResult?(0,K.jsxs)(`details`,{className:`t-detail t-wt-last-result t-wt-secondary-detail`,children:[(0,K.jsxs)(`summary`,{children:[`Last result · `,N(g.lastResult.recordedAt)]}),(0,K.jsxs)(`strong`,{children:[R(g.lastResult.missionId)?.name,` · `,g.lastResult.victory?`CLEARED`:`FAILED`]}),(0,K.jsx)(Js,{result:g.lastResult})]}):null,(0,K.jsxs)(`section`,{className:`t-panel t-wt-battlefield-lab`,"aria-label":`Battlefield Lab testing mode`,children:[(0,K.jsxs)(`div`,{children:[(0,K.jsx)(`span`,{className:`t-kicker`,children:`BATTLEFIELD LAB · DEVICE TEST`}),(0,K.jsx)(`strong`,{children:pn?`10 × 7 · EXPERIMENTAL`:`8 × 5 · CURRENT`}),(0,K.jsx)(`p`,{children:`Compare real missions with your signed-in Alpha account. This setting changes only the battlefield on this device. It does not reset or replace your account.`})]}),(0,K.jsx)(`button`,{type:`button`,className:`t-btn`,"aria-label":pn?`Switch to current 8 by 5 battlefield`:`Switch to experimental 10 by 7 battlefield`,onClick:()=>{try{if(pn){window.localStorage.removeItem(fn);let e=new URL(window.location.href);if(e.searchParams.has(`tacticalBattlefieldVNext`)){e.searchParams.delete(`tacticalBattlefieldVNext`),window.location.replace(e.toString());return}}else window.localStorage.setItem(fn,`10x7`);window.location.reload()}catch{window.alert(`Could not save the test mode on this device.`)}},children:pn?`USE 8 × 5`:`TEST 10 × 7`})]})]}):null]})]})}function Xs(){let[e,t]=(0,y.useState)(`mission`),[n,r]=(0,y.useState)(`alpha`),[i,a]=(0,y.useState)(!1),o=G(e=>e.identity),s=G(e=>e.deploy),c=G(e=>e.backToHub),l=G(e=>e.onboardingEnabled),u=G(e=>e.onboardingStageId),d=G(e=>e.selectedMissionId),f=G(e=>e.selectedSquadIds),p=G(e=>e.selectedApproach),m=G(e=>e.selectedDirectiveTier),h=G(e=>e.selectDirectiveTier),g=G(e=>e.selectApproach),_=G(e=>e.progression?.fieldOps),v=G(e=>e.progression?.packMastery),b=G(e=>e.progression?.playerGrowth),x=G(e=>e.selectRecoverTeammate),S=G(e=>e.toggleCommanderTeammate),C=G(e=>e.progression?.equippedPet),w=G(e=>e.progression?.kodaSidegrade),T=G(e=>e.progression?.operations?.[`broken-signal`]?.status===`cleared`),E=G(e=>e.kodaSavePending),D=G(e=>e.selectKodaSidegrade),O=G(e=>e.progression?.shadowSidegrade),k=G(e=>e.shadowSavePending),A=G(e=>e.selectShadowSidegrade),te=G(e=>e.progressionError),ne=G(e=>e.busy),M=Qa(l,u),oe=G(e=>e.chapterMode),se=G(e=>e.progression?.chapterActiveMission),P=G(e=>e.progression?.operations?.[je.operationId]?.activeMissionRun),F=G(e=>e.progression?.campaignIntel?.[`dead-relay`]?.courierTraceAcquired===!0),ce=P?.missionId===d?P.campaignContext:{version:1,courierTraceAcquired:F},le=R(d),ue=le?.operationId===je.operationId,I=oe?se:ue?P:_?.activeMissionRun,fe=I?.missionId===d&&I.squadIds.join(`,`)===f.join(`,`)&&(I.fieldContext?.approach||`standard`)===p&&(I.fieldContext?.directiveTier||`standard`)===m,pe=fe&&I?.fieldContext?I.fieldContext:{pressure:_?.region?.pressure??2,reportVersion:_?.board?.reportVersion||2,directiveTier:m,directiveSet:_?.board?.directiveSet},L=le?Fe(le,pe):null,he=L?.activity===`FIELD_OP`,ge=!!(L&&(he||ue||L.objectiveType===`BOSS`)),_e=L?Ie(L,f,C,p)||(he||ue?Ie(L,[`alpha`,`ally-02`,`ally-03`],C):L.objectiveType===`RECOVER`?Oe([`alpha`,`ally-02`]):Ee.filter(e=>![`ally-02`,`ally-03`].includes(e.defId))):M.spawns,ve=L?ut(_e,{kodaSidegrade:w,shadowSidegrade:O,packMastery:fe?I?.packMastery||{}:v}):_e,ye=L?me(L,pe):[],be=G(e=>e.currentChapterIntel),xe=L&&(he||ue)?be?.effectiveRound||Le(L,!1,pe,ce).reinforcement?.triggerRound:void 0,Se=L?L.name:l?M.operationName:de.name,Ce=L?L.briefCopy:l?M.objective:de.objective,we=$a(ve).map(e=>Br(e,o)),Te=fe?I?.playerGrowth:b,De=Ps(we,Te),ke=Is(we,Te),Ae=Ls(ke,Te,bi),Me=Dt(L,we.map(e=>e.defId),fe?I?.rulesContract?.rulesetVersion===`tactical-intent-vnext.0`:!!G.getState().progression?.vnextStartAvailable),Ne=Fs(f.length?f:we.map(e=>e.defId),C?.id),Pe=eo(ve),Re=L?`${L.objectiveType} · Squad cap ${L.squadCap}. `:l?M.teaching:`Units act individually by Speed. Alpha must close to melee range 1 before Strike or Rend.`,ze=he||ue?`PRIMARY OBJECTIVE: ${L.objectiveType}`:L?.objectiveType===`RECOVER`?`PRIMARY OBJECTIVE: RECOVER THE SIGNAL`:L?.objectiveType===`BOSS`?`PRIMARY OBJECTIVE: DEFEAT THE SIGNAL COMMANDER`:L?.objectiveType===`ELIMINATE`?`PRIMARY OBJECTIVE: ELIMINATE HOSTILES`:null,Be=!L&&l&&u===`ally-koda`?`CNC JOINED · ROSTER UPDATED`:!L&&l&&u===`full-broken-signal`?`SHADOW JOINED · FULL SQUAD READY`:null,Ve=ue?L?.missionId===`dead-relay-courier`?`EARLY INTERCEPT: first win by round 4 grants Courier Trace. Slower victory still unlocks Hold.`:L?.missionId===`dead-relay-hold`?`COURIER TRACE ${ce.courierTraceAcquired?`ACTIVE: HOUND ROUND 3`:`NOT ACQUIRED: HOUND ROUND 2`}`:`Guardian reinforcement arrives on round 3.`:L?.objectiveType===`BOSS`?`Routing Trace telegraphs the fixed reinforcement.`:L?.missionId===`broken-signal-breach`?`TRACE target can reveal Routing Trace.`:`No Intel required.`,He=L?Ze(L,_,fe?I:null,_?.lastResult):null,Ue=L?ee(L,we,Te):[],We=!L&&l?M.steps:[],Ge=He?.rewardEligibility,Ke=L?zs(L):{art:Rs.operationPlate,tone:`assault`,label:`TACTICAL OPS`};return(0,K.jsxs)(`div`,{className:`t-fill`,children:[(0,K.jsx)(Gs,{dim:.58}),(0,K.jsxs)(`div`,{className:`t-brief t-deployment t-deployment-v29 t-command-art-shell t-premium-ux`,children:[(0,K.jsxs)(`header`,{className:`t-deploy-hero t-deploy-hero-v29 t-command-brief-hero t-mission-tone-${Ke.tone}`,children:[(0,K.jsx)(`img`,{src:Ke.art,alt:``,"aria-hidden":`true`}),(0,K.jsxs)(`div`,{className:`t-deploy-hero-copy`,children:[(0,K.jsx)(`div`,{className:`t-deploy-mode-label`,children:Ke.label}),(0,K.jsxs)(`div`,{className:`t-kicker`,children:[he?`FIELD OPS`:`TACTICAL OPS`,` / MISSION BRIEF`]}),(0,K.jsx)(`h1`,{className:`t-title`,children:Se}),(0,K.jsx)(`p`,{children:L?Vs(L):Ce})]}),he&&_?.board?(0,K.jsxs)(`div`,{className:`t-deploy-rotation`,children:[(0,K.jsx)(`span`,{className:`t-kicker`,children:`Rotation`}),(0,K.jsx)(`strong`,{children:N(_.board.nextRotationAt)})]}):null]}),(0,K.jsx)(`nav`,{className:`t-command-nav t-deploy-command-nav t-command-framed-nav`,"aria-label":`Mission preparation sections`,children:[[`mission`,`01`,`MISSION`],[`squad`,`02`,`SQUAD`],[`loadout`,`03`,`LOADOUT`],[`intel`,`04`,`INTEL`]].map(([n,r,i])=>(0,K.jsxs)(`button`,{type:`button`,className:e===n?`is-current`:``,"aria-pressed":e===n,onClick:()=>t(n),children:[(0,K.jsx)(`span`,{children:r}),(0,K.jsx)(`strong`,{children:i})]},n))}),e===`mission`?(0,K.jsxs)(`div`,{className:`t-command-pane t-deploy-command-pane`,"aria-label":`Mission objective and rewards`,children:[Be?(0,K.jsx)(`div`,{className:`t-recruit-moment`,children:Be}):null,ue?(0,K.jsxs)(`div`,{className:`t-panel t-deploy-overview`,children:[(0,K.jsx)(`strong`,{children:`MISSION INTEL`}),(0,K.jsx)(`p`,{children:Ve})]}):null,(0,K.jsxs)(`section`,{className:`t-panel t-deploy-overview ${We.length?`t-training-overview`:``}`,"aria-label":`Mission overview`,children:[(0,K.jsxs)(`div`,{className:`t-deploy-summary-main`,children:[(0,K.jsx)(`div`,{className:`t-kicker`,children:We.length?`YOUR TRAINING GOAL`:`OBJECTIVE`}),(0,K.jsx)(`strong`,{children:He?.objectiveText||(ze?ze.replace(`PRIMARY OBJECTIVE: `,``):Ce)}),We.length?(0,K.jsx)(`ol`,{className:`t-training-steps`,"aria-label":`How to complete this training`,children:We.map((e,t)=>(0,K.jsxs)(`li`,{children:[(0,K.jsx)(`span`,{"aria-hidden":`true`,children:String(t+1).padStart(2,`0`)}),(0,K.jsx)(`p`,{children:e})]},e))}):(0,K.jsx)(`p`,{children:He?`FAIL IF: ${He.failConditionText}`:Re}),He?(0,K.jsxs)(`p`,{className:`t-brief-purpose-meta`,children:[(0,K.jsx)(`b`,{children:`WATCH FOR:`}),` `,He.tacticalThreat]}):null,Ue.length?(0,K.jsxs)(`details`,{className:`t-mission-extra`,"aria-label":`Optional squad tactics`,children:[(0,K.jsxs)(`summary`,{children:[`SQUAD TACTICS `,(0,K.jsx)(`span`,{children:`OPTIONAL`})]}),Ue.map(e=>(0,K.jsx)(`p`,{children:e},e)),fe?(0,K.jsx)(`small`,{children:`Saved mission: your original squad and equipment remain locked.`}):null]}):null,He?(0,K.jsxs)(`details`,{className:`t-mission-extra`,"aria-label":`Mission outcome and recording`,children:[(0,K.jsxs)(`summary`,{children:[`WHAT HAPPENS AFTER `,(0,K.jsx)(`span`,{children:`DETAILS`})]}),(0,K.jsx)(`p`,{children:He.nextConsequence})]}):null]}),he?(0,K.jsxs)(K.Fragment,{children:[(0,K.jsxs)(`div`,{className:`t-deploy-summary-card`,children:[(0,K.jsx)(`span`,{className:`t-kicker`,children:`Clear reward`}),(0,K.jsx)(`strong`,{children:Ge?.commander===`CERTIFIED`?`COMMANDER CERTIFIED`:Ge?.clear===`SECURED`?`CLEAR ALREADY SECURED`:Ge?.clear===`UNKNOWN`?`REWARD STATUS UNKNOWN`:`+2 COMMANDER · IF FIRST CLEAR`}),(0,K.jsx)(`small`,{children:Ge?.copy})]}),(0,K.jsxs)(`div`,{className:`t-deploy-summary-card`,children:[(0,K.jsx)(`span`,{className:`t-kicker`,children:`Bonus challenge`}),(0,K.jsx)(`strong`,{children:Ge?.commander===`CERTIFIED`?`COMMANDER CERTIFIED`:Ge?.challenge===`SECURED`?`CHALLENGE ALREADY SECURED`:Ge?.challenge===`UNKNOWN`?`CHALLENGE STATUS UNKNOWN`:`+1 COMMANDER · IF CHALLENGE MET`}),(0,K.jsx)(`small`,{children:L?.challenge?.label||`Optional challenge`})]}),(0,K.jsxs)(`div`,{className:`t-deploy-summary-card t-deploy-pressure is-${ie(pe.pressure).toLowerCase()}`,children:[(0,K.jsx)(`span`,{className:`t-kicker`,children:`Area status`}),(0,K.jsx)(`strong`,{children:ie(pe.pressure)}),(0,K.jsx)(`small`,{children:j(pe.pressure)})]})]}):null]})]}):null,e===`squad`?(0,K.jsxs)(`div`,{className:`t-command-pane t-deploy-command-pane`,"aria-label":`Squad composition and mastery`,children:[(0,K.jsxs)(`section`,{className:`t-panel t-deploy-squad`,"aria-label":`Squad`,children:[(0,K.jsxs)(`div`,{className:`t-wt-section-head`,children:[(0,K.jsxs)(`div`,{children:[(0,K.jsx)(`div`,{className:`t-kicker`,children:`Squad`}),(0,K.jsxs)(`h2`,{className:`t-title`,children:[we.length,` / `,L?.squadCap||we.length,` DEPLOYED`]})]}),fe?(0,K.jsx)(`span`,{children:ue?`RESUMING ACCEPTED RUN · ROUND 1 RESTART`:`RESUMING SAVED RUN`}):null]}),(0,K.jsx)(`div`,{className:`t-squad-preview t-squad-preview-v29`,"aria-label":`Selected squad`,children:we.map(e=>(0,K.jsxs)(`div`,{children:[(0,K.jsx)(`img`,{src:e.portrait,onError:e.defId===`alpha`?as:void 0,alt:``}),(0,K.jsx)(`span`,{children:e.defId===`ally-02`?`CNC`:e.role===`companion`?`PET`:e.name})]},e.defId))}),ge?(0,K.jsxs)(`div`,{className:`t-deploy-squad-picker`,children:[(0,K.jsx)(`p`,{children:`Choose two tactical companions.`}),(0,K.jsx)(`div`,{className:`t-brief-actions`,children:[{id:`ally-02`,label:`CNC`,role:`PRESSURE / DISRUPTION`,available:!0},{id:`ally-03`,label:`SHADOW`,role:`SUSTAIN / PROTECTION`,available:!0},{id:C?`pet:${C.id}`:`pet:unavailable`,label:C?`PET · ${C.name}`:`PET`,role:C?`MOBILITY / CONTROL`:`NO VALID PET EQUIPPED`,available:!!C}].map(e=>{let t=f.includes(e.id);return(0,K.jsxs)(`button`,{type:`button`,"aria-pressed":t,disabled:ne||E||k||!e.available||!t&&f.length>=3,className:`t-btn ${t?`t-btn-primary`:`t-btn-ghost`}`,onClick:()=>S(e.id),children:[e.label,(0,K.jsx)(`br`,{}),(0,K.jsx)(`small`,{children:e.role})]},e.id)})})]}):null,L?.objectiveType===`RECOVER`&&!he?(0,K.jsxs)(`div`,{className:`t-deploy-squad-picker`,children:[(0,K.jsx)(`p`,{children:`Choose one teammate for this recovery mission.`}),(0,K.jsxs)(`div`,{className:`t-brief-actions`,children:[(0,K.jsxs)(`button`,{type:`button`,disabled:ne,className:`t-btn ${f[1]===`ally-02`?`t-btn-primary`:`t-btn-ghost`}`,onClick:()=>x(`ally-02`),children:[`CNC`,(0,K.jsx)(`br`,{}),(0,K.jsx)(`small`,{children:`OFFENSE · PRESSURE`})]}),(0,K.jsxs)(`button`,{type:`button`,disabled:ne,className:`t-btn ${f[1]===`ally-03`?`t-btn-primary`:`t-btn-ghost`}`,onClick:()=>x(`ally-03`),children:[`SHADOW`,(0,K.jsx)(`br`,{}),(0,K.jsx)(`small`,{children:`SUPPORT · SUSTAIN`})]}),(0,K.jsxs)(`button`,{type:`button`,disabled:ne||!C,className:`t-btn ${C&&f[1]===`pet:${C.id}`?`t-btn-primary`:`t-btn-ghost`}`,onClick:()=>C&&x(`pet:${C.id}`),children:[`PET`,C?` · ${C.name}`:``,(0,K.jsx)(`br`,{}),(0,K.jsx)(`small`,{children:C?`MOBILITY · CONTROL`:`UNAVAILABLE`})]})]})]}):null]}),L?(0,K.jsxs)(`div`,{className:`t-brief-mastery-optional`,children:[(0,K.jsxs)(`button`,{type:`button`,className:`t-brief-optional-toggle`,"aria-expanded":i,onClick:()=>a(e=>!e),children:[(0,K.jsx)(`strong`,{children:`PACK MASTERY`}),(0,K.jsx)(`span`,{children:i?`HIDE DETAILS −`:`VIEW PROGRESSION +`})]}),i?(0,K.jsx)(us,{snapshot:fe?I?.packMastery:void 0}):null]}):null]}):null,e===`loadout`?(0,K.jsx)(`div`,{className:`t-command-pane t-deploy-command-pane`,"aria-label":`Equipped protocols and sidegrades`,children:(0,K.jsxs)(`section`,{className:`t-panel t-codex-brief`,"aria-label":`Signal Codex equipped capabilities`,children:[(0,K.jsx)(`div`,{className:`t-wt-section-head`,children:(0,K.jsxs)(`div`,{children:[(0,K.jsx)(`span`,{className:`t-kicker`,children:`SQUAD BUILD · REAL ABILITIES`}),(0,K.jsx)(`h2`,{className:`t-title`,children:`SIGNAL CODEX`})]})}),(0,K.jsx)(`p`,{className:`t-codex-tradeoff`,children:Ne}),Me.length?(0,K.jsxs)(`details`,{className:`t-detail t-s3-training`,"aria-label":`Optional tactical training goals`,children:[(0,K.jsxs)(`summary`,{children:[`OPTIONAL TRAINING · `,Me.length,` TACTICAL GOALS`]}),Me.map(e=>(0,K.jsxs)(`div`,{className:`t-s3-goal`,children:[(0,K.jsx)(`strong`,{children:e.title}),(0,K.jsx)(`p`,{children:e.instruction}),(0,K.jsx)(`small`,{children:e.requirement})]},e.id))]}):null,(0,K.jsx)(`p`,{className:`t-codex-note`,children:`Current squad's equipped protocols, based on real A1/A2/A3 abilities. No extra skills or battle slots are granted.`}),(0,K.jsxs)(`div`,{className:`t-codex-loadout`,children:[(0,K.jsx)(`strong`,{children:`ACTIVE LOADOUT · EXISTING ABILITY SLOTS`}),(0,K.jsx)(`small`,{children:`Change your squad above. Saved CNC / SHADOW variants can be selected below when unlocked; existing A1 / A2 / A3 cooldown rules stay in force.`}),(0,K.jsx)(`nav`,{className:`t-loadout-unit-picker`,"aria-label":`Select unit abilities`,children:we.map(e=>(0,K.jsxs)(`button`,{type:`button`,className:(we.some(e=>e.defId===n)?n:we[0]?.defId)===e.defId?`is-selected`:``,"aria-pressed":(we.some(e=>e.defId===n)?n:we[0]?.defId)===e.defId,onClick:()=>r(e.defId),children:[(0,K.jsx)(`img`,{src:e.portrait,alt:``,onError:as}),(0,K.jsx)(`span`,{children:e.defId===`ally-02`?`CNC`:e.defId===`ally-03`?`SHADOW`:e.defId.startsWith(`pet:`)?`PET`:e.name})]},e.defId))}),we.filter(e=>e.defId===(we.some(e=>e.defId===n)?n:we[0]?.defId)).map(e=>(0,K.jsxs)(`div`,{className:`t-codex-unit`,children:[(0,K.jsxs)(`b`,{children:[e.name,` · `,e.defId.startsWith(`pet:`)?`2 ABILITIES`:`3 ABILITIES`]}),(0,K.jsx)(`div`,{className:`t-codex-slots`,children:ke.filter(t=>t.unitId===e.defId).map((e,t)=>(0,K.jsxs)(`div`,{className:`t-codex-slot`,children:[(0,K.jsxs)(`strong`,{children:[e.slot,` · `,e.name]}),(0,K.jsxs)(`small`,{children:[e.family||`BASIC ATTACK`,` · CD `,e.cooldown,` · RANGE `,e.minRange,`–`,e.maxRange]})]},e.skillId+t))})]},e.defId))]}),(0,K.jsxs)(`div`,{className:`t-codex-counterlist`,"aria-label":`Tactical counter options`,children:[(0,K.jsx)(`strong`,{children:`COUNTERPLAY AVAILABLE TO THIS SQUAD`}),(0,K.jsx)(`div`,{className:`t-codex-counters`,children:Ae.map(e=>(0,K.jsxs)(`div`,{className:`t-codex-counter ${e.available?`is-ready`:`is-missing`}`,children:[(0,K.jsxs)(`b`,{children:[e.label,` · `,e.available?`READY`:`NOT EQUIPPED`]}),(0,K.jsx)(`small`,{children:e.source||e.detail})]},e.id))})]}),(0,K.jsxs)(`div`,{className:`t-codex-variants`,children:[(0,K.jsx)(`strong`,{children:`EXISTING SAVED VARIANTS`}),fe?(0,K.jsx)(`small`,{className:`t-codex-note`,children:`Accepted run · squad and variants are locked until this mission ends.`}):null,L&&ve.some(e=>e.defId===`ally-02`)?(0,K.jsxs)(`div`,{className:`t-panel t-brief-block t-sidegrade-card`,children:[(0,K.jsx)(`div`,{className:`t-kicker`,children:`CNC · BUG HUNTER WARDEN`}),T?(0,K.jsxs)(K.Fragment,{children:[(0,K.jsxs)(`div`,{className:`t-brief-actions`,children:[(0,K.jsx)(`button`,{type:`button`,disabled:fe||ne||E||k,"aria-pressed":w===`A`,className:`t-btn ${w===`A`?`t-btn-primary`:`t-btn-ghost`}`,onClick:()=>void D(`A`),children:`A · VANGUARD`}),(0,K.jsx)(`button`,{type:`button`,disabled:fe||ne||E||k,"aria-pressed":w===`B`,className:`t-btn ${w===`B`?`t-btn-primary`:`t-btn-ghost`}`,onClick:()=>void D(`B`),children:`B · DISRUPTOR`})]}),(0,K.jsx)(`small`,{children:E?`Saving CNC choice…`:w?`SAVED · ${w===`A`?`VANGUARD`:`DISRUPTOR`}`:`Base CNC · no sidegrade selected`}),!E&&!fe&&_t(`ally-02`,{kodaSidegrade:w,shadowSidegrade:O,packMastery:v},b)?(0,K.jsx)(`div`,{className:`t-growth-delta`,"aria-label":`CNC saved sidegrade power proof`,children:_t(`ally-02`,{kodaSidegrade:w,shadowSidegrade:O,packMastery:v},b).changes.map(e=>(0,K.jsx)(`b`,{children:e},e))}):null]}):(0,K.jsx)(`small`,{children:`CNC sidegrades unlock after BROKEN SIGNAL is cleared.`})]}):null,L&&ve.some(e=>e.defId===`ally-03`)?(0,K.jsxs)(`div`,{className:`t-panel t-brief-block t-sidegrade-card`,children:[(0,K.jsx)(`div`,{className:`t-kicker`,children:`SHADOW · STAFF SUPPORT`}),T?(0,K.jsxs)(K.Fragment,{children:[(0,K.jsxs)(`div`,{className:`t-brief-actions`,children:[(0,K.jsx)(`button`,{type:`button`,disabled:fe||ne||E||k,"aria-pressed":O===`A`,className:`t-btn ${O===`A`?`t-btn-primary`:`t-btn-ghost`}`,onClick:()=>void A(`A`),children:`A · RESTORER`}),(0,K.jsx)(`button`,{type:`button`,disabled:fe||ne||E||k,"aria-pressed":O===`B`,className:`t-btn ${O===`B`?`t-btn-primary`:`t-btn-ghost`}`,onClick:()=>void A(`B`),children:`B · WARDEN`})]}),(0,K.jsx)(`small`,{children:k?`Saving SHADOW choice…`:O?`SAVED · ${O===`A`?`RESTORER`:`WARDEN`}`:`Base SHADOW · no sidegrade selected`}),!k&&!fe&&_t(`ally-03`,{kodaSidegrade:w,shadowSidegrade:O,packMastery:v},b)?(0,K.jsx)(`div`,{className:`t-growth-delta`,"aria-label":`SHADOW saved sidegrade power proof`,children:_t(`ally-03`,{kodaSidegrade:w,shadowSidegrade:O,packMastery:v},b).changes.map(e=>(0,K.jsx)(`b`,{children:e},e))}):null]}):(0,K.jsx)(`small`,{children:`SHADOW sidegrades unlock after BROKEN SIGNAL is cleared.`})]}):null]}),(0,K.jsxs)(`details`,{className:`t-codex-reference`,children:[(0,K.jsx)(`summary`,{children:`ALL PROTOCOL FAMILIES · REFERENCE`}),(0,K.jsx)(`div`,{className:`t-codex-grid`,children:Ms.map(e=>{let t=De.filter(t=>t.family===e);return(0,K.jsxs)(`div`,{className:`t-codex-family`,children:[(0,K.jsx)(`strong`,{children:e.toUpperCase()}),t.length?t.map((e,t)=>(0,K.jsxs)(`div`,{className:`t-codex-skill`,children:[(0,K.jsxs)(`b`,{children:[e.unit,` · `,e.slot,` `,e.skillName]}),(0,K.jsxs)(`small`,{children:[`CD `,e.cooldown,` · `,e.description]})]},e.unit+e.skillId+t)):(0,K.jsx)(`small`,{className:`t-codex-empty`,children:`No equipped protocol in this family.`})]},e)})})]})]})}):null,e===`intel`?(0,K.jsxs)(`div`,{className:`t-command-pane t-deploy-command-pane`,"aria-label":`Mission conditions and enemy intelligence`,children:[ye.length||he?(0,K.jsxs)(`section`,{className:`t-panel t-deploy-rules`,children:[(0,K.jsxs)(`div`,{className:`t-command-conditions-head`,children:[(0,K.jsxs)(`span`,{children:[(0,K.jsx)(`span`,{className:`t-kicker`,children:`Tactical setup`}),(0,K.jsx)(`strong`,{children:`CONDITIONS & APPROACH`})]}),(0,K.jsxs)(`b`,{children:[m.toUpperCase(),p===`standard`?``:` · ${re[p].name}`]})]}),ye.length?(0,K.jsxs)(`section`,{className:`t-conditions`,"aria-label":`Special conditions`,children:[ye.map(e=>(0,K.jsxs)(`div`,{className:`t-condition t-condition-v29`,children:[(0,K.jsx)(`strong`,{children:e.maxRounds?`DEADLINE · ROUND ${e.maxRounds}`:e.reinforcement?`REINFORCEMENTS · ROUND ${xe}`:e.supportCooldownExtra?`LIMITED SUPPORT · +1 TURN`:e.name}),(0,K.jsx)(`p`,{children:e.copy})]},e.type)),L?.squadHint?(0,K.jsxs)(`p`,{className:`t-deploy-tip`,children:[(0,K.jsx)(`strong`,{children:`Squad tip:`}),` `,L.squadHint]}):null]}):null,he?(0,K.jsxs)(`div`,{className:`t-deployment-options t-deployment-options-v29`,children:[fe?(0,K.jsx)(`p`,{className:`t-deploy-resume`,children:`Original conditions are locked for this saved run. Changing squad, route or tier starts a new attempt.`}):null,_?.board?.reportVersion===3?(0,K.jsxs)(K.Fragment,{children:[(0,K.jsx)(`div`,{className:`t-kicker`,children:`Directive tier`}),(0,K.jsx)(`div`,{className:`t-brief-actions`,children:[`standard`,`advanced`].map(e=>(0,K.jsxs)(`button`,{type:`button`,className:`t-btn ${m===e?`t-btn-primary`:``}`,"aria-pressed":m===e,disabled:ne||!_.commander?.unlockedDirectiveTiers?.includes(e),onClick:()=>h(e),children:[e.toUpperCase(),e===`advanced`&&!_.commander?.unlockedDirectiveTiers?.includes(e)?` / RANK 3`:``]},e))}),(0,K.jsx)(`small`,{children:m===`advanced`?`${ae(pe.directiveSet)} · Advanced clear is recorded.`:`Standard field conditions.`})]}):null,(0,K.jsx)(`div`,{className:`t-kicker`,children:`Deployment approach`}),(0,K.jsx)(`div`,{className:`t-brief-actions`,children:[`standard`,`south`].map(e=>(0,K.jsxs)(`button`,{type:`button`,className:`t-btn ${p===e?`t-btn-primary`:``}`,"aria-pressed":p===e,disabled:ne||!_?.commander?.unlockedApproaches.includes(e),onClick:()=>g(e),children:[re[e].name,e===`south`&&!_?.commander?.unlockedApproaches.includes(`south`)?` / RANK 2`:``]},e))}),(0,K.jsx)(`small`,{children:re[p].copy})]}):null]}):null,L?(0,K.jsxs)(`details`,{className:`t-panel t-deploy-depth`,children:[(0,K.jsxs)(`summary`,{children:[(0,K.jsxs)(`span`,{children:[(0,K.jsx)(`span`,{className:`t-kicker`,children:`Optional depth`}),(0,K.jsx)(`strong`,{children:`MASTERY & LOADOUT`})]}),(0,K.jsx)(`b`,{children:`VIEW`})]}),(0,K.jsxs)(`details`,{className:`t-detail t-loadout-details`,children:[(0,K.jsx)(`summary`,{children:`Squad abilities & hostile intel`}),(0,K.jsxs)(`div`,{className:`t-brief-grid`,children:[(0,K.jsxs)(`div`,{className:`t-panel t-brief-block`,children:[(0,K.jsx)(`h3`,{children:`Allied squad`}),(0,K.jsx)(os,{}),we.map(e=>(0,K.jsxs)(`div`,{className:`t-unit-row`,children:[(0,K.jsx)(`img`,{src:e.portrait,onError:e.defId===`alpha`?as:void 0,alt:``,style:e.defId===`alpha`?void 0:{objectPosition:`50% 12%`}}),(0,K.jsxs)(`div`,{children:[(0,K.jsx)(`div`,{className:`t-title`,style:{fontSize:`0.95rem`},children:e.defId===`ally-02`?`COLDNCURSED`:e.name}),(0,K.jsx)(`div`,{style:{color:`var(--t-muted)`,fontSize:`0.8rem`},children:Ws(e)})]})]},e.defId))]}),(0,K.jsxs)(`div`,{className:`t-panel t-brief-block`,children:[(0,K.jsx)(`h3`,{children:`Hostile force`}),Pe.map(({def:e,count:t})=>(0,K.jsxs)(`div`,{className:`t-unit-row`,children:[(0,K.jsx)(`div`,{className:`t-unit-ph enemy`}),(0,K.jsxs)(`div`,{children:[(0,K.jsx)(`div`,{className:`t-title`,style:{fontSize:`0.95rem`},children:t>1?`${e.name} × ${t}`:e.name}),(0,K.jsx)(`div`,{style:{color:`var(--t-muted)`,fontSize:`0.8rem`},children:Ws(e,`${e.hp} HP`)})]})]},e.defId)),(0,K.jsx)(`p`,{style:{color:`var(--t-faint)`,fontSize:`0.78rem`,margin:`0.8rem 0 0`,lineHeight:1.45},children:Ve})]})]})]})]}):null]}):null,(0,K.jsxs)(`div`,{className:`t-brief-actions t-deploy-actions t-deploy-actions-v29 t-command-action-dock`,children:[(0,K.jsx)(`button`,{type:`button`,className:`t-btn t-btn-ghost`,onClick:c,children:`BACK`}),(0,K.jsxs)(`button`,{type:`button`,className:`t-btn t-btn-primary`,onClick:s,disabled:ne||E||k||!!L&&!Ie(L,f,C),children:[`DEPLOY SQUAD`,(0,K.jsx)(Ht,{className:`t-ico`})]})]}),te?(0,K.jsx)(`p`,{style:{color:`var(--t-enemy)`,marginTop:`0.8rem`},children:te}):null]})]})}function Zs(){let e=G(e=>e.dismissSector),t=G(e=>e.battle.objective?.type===`BOSS`),n=G(e=>R(e.selectedMissionId)?.activity===`FIELD_OP`);return(0,y.useEffect)(()=>{let t=0,n=performance.now(),r=i=>{i-n>=1600?e():t=requestAnimationFrame(r)};return t=requestAnimationFrame(r),()=>cancelAnimationFrame(t)},[e]),(0,K.jsxs)(`div`,{className:`t-fill`,children:[(0,K.jsx)(Gs,{dim:.5}),(0,K.jsx)(`div`,{className:`t-overlay`,style:{background:`rgb(10 12 16 / 0.45)`},children:(0,K.jsxs)(`div`,{className:`t-modal t-panel`,children:[(0,K.jsx)(`div`,{className:`t-kicker`,children:n?`FIELD OP`:`Operation`}),(0,K.jsx)(`h2`,{className:`t-title`,children:n?`Objective Complete`:`Sector Secured`}),(0,K.jsx)(`p`,{style:{color:`var(--t-muted)`,margin:`0 0 1.1rem`},children:n?`Mission objective achieved. Review Results to save this clear.`:t?`BRUTE LEADER defeated. Commander signal broken.`:`Hostile force eliminated.`}),(0,K.jsx)(`button`,{type:`button`,className:`t-btn t-btn-primary`,onClick:e,children:`Continue`})]})})]})}function Qs(){let e=G(e=>e.battle.failureReason),t=G(e=>e.battle.results),n=G(e=>e.fieldResult),r=G(e=>e.campaignResult),i=G(e=>e.chapterResult),a=G(e=>e.chapterMode),o=G(e=>e.saveChapterResult),s=G(e=>e.saveCampaignResult),c=G(e=>e.saveFieldResult),l=G(e=>e.replay),u=G(e=>e.backToHub),d=G(e=>e.continueOnboarding),f=G(e=>e.onboardingEnabled),p=G(e=>e.onboardingStageId),m=G(e=>e.selectedMissionId),h=G(e=>e.foundationCompleted),g=G(e=>e.progression),_=G(e=>e.progressionCommitPending),v=G(e=>e.progressionError),y=G(e=>e.battle.routingTraceAcquired),b=G(e=>e.s3CombatProof),x=G(e=>e.currentRunKey),S=G(e=>e.activeRulesetVersion),C=G(e=>e.selectedSquadIds),w=Qa(f,p),T=R(m),E=T?.activity===`FIELD_OP`,D=T?.operationId===je.operationId,O=R(Xe(g?.fieldOps,m).missionId),k=tt(n,x,m),A=tt(r,x,m),ee=$e(k,A,g),te=et(k,A,g),re=k?.runId||A?.runId||null,ie=Dt(T,C,S===`tactical-intent-vnext.0`),j=kt(b,re,!!(k?.victory||A?.victory),ie),M=At(b,re),ae=ne(b,x,m);if(!t)return null;let N=h&&!!T&&t.victory,se=f&&!h&&t.victory||N,P=se&&w.next!=null,F=N&&g?.operations?.[T?.operationId||Ae.operationId]?.missions[T?.missionId||``]===`available`;return(0,K.jsxs)(`div`,{className:`t-fill`,children:[(0,K.jsx)(Gs,{dim:.6}),(0,K.jsx)(`div`,{className:`t-overlay t-results-overlay`,children:(0,K.jsxs)(`div`,{className:`t-modal t-panel t-results ${t.victory?`is-victory`:`is-failure`}`,children:[(0,K.jsxs)(`header`,{className:`t-outcome-hero`,children:[(0,K.jsx)(`img`,{className:`t-results-plate`,src:t.victory?Rs.resultsPlate:Rs.operationPlate,alt:``,"aria-hidden":`true`}),(0,K.jsx)(`span`,{className:`t-outcome-stamp`,children:t.victory?`MISSION SECURED`:`MISSION LOST`}),(0,K.jsx)(`div`,{className:`t-kicker`,children:E?`FIELD OP / ${T.name}`:N&&T?T.name:se?w.operationName:`Broken Signal`}),(0,K.jsx)(`h2`,{className:`t-title`,children:D?t.victory?T?.objectiveType===`BOSS`?`DEAD RELAY SECURED`:`OBJECTIVE SECURED`:`MISSION FAILED`:E?t.victory?`FIELD OP COMPLETE`:`FIELD OP FAILED`:N?T?.objectiveType===`BOSS`?`SIGNAL COMMANDER DOWN`:T?.objectiveType===`RECOVER`?`OBJECTIVE COMPLETE`:F?`BREACH CLEARED`:`BREACH REPLAY COMPLETE`:se?w.resultsTitle:`Operation Complete`})]}),se?(0,K.jsx)(`p`,{style:{color:`var(--t-muted)`,margin:`0 0 1.1rem`},children:E?null:N?T?.objectiveType===`RECOVER`?F?`Continue to unlock SIGNAL COMMANDER.`:`SIGNAL RECOVERED.`:T?.objectiveType===`ELIMINATE`&&F?`RECOVER AVAILABLE.`:null:w.resultsNote}):null,N&&T?.missionId===`broken-signal-breach`?(0,K.jsxs)(`p`,{style:{color:y||g?.intel?.routingTrace?`var(--t-accent)`:`var(--t-faint)`,margin:`0 0 0.8rem`},children:[`ROUTING TRACE — `,y||g?.intel?.routingTrace?`ACQUIRED`:`MISSED`]}):null,N&&!D&&T?.objectiveType===`BOSS`?(0,K.jsx)(`p`,{style:{color:`var(--t-accent)`,margin:`0 0 0.8rem`},children:F?T.resultsCopy:g?.operations?.[je.operationId]?`BROKEN SIGNAL CLEARED · THE DEAD RELAY CAMPAIGN AVAILABLE`:`BROKEN SIGNAL remains CLEARED · ARCHIVE AVAILABLE · NEXT OPERATION SLOT EMPTY / UNASSIGNED`}):null,a?(0,K.jsxs)(`div`,{className:`t-panel`,role:`status`,children:[(0,K.jsx)(`strong`,{children:i?`CHAPTER RESULT RECORDED`:_?`RECORDING CHAPTER RESULT…`:`CHAPTER RESULT NOT YET RECORDED`}),(0,K.jsx)(`p`,{children:i?`GHOST SIGNAL · ${i.stageRecorded}/3 accepted operations. ${i.chapterComplete?`RECON Intel ready for a qualifying encounter.`:`Return to War Table for the next mission.`}`:`Only server-recorded results advance this chapter.`})]}):null,!a&&E?(0,K.jsxs)(`div`,{children:[t.victory?null:(0,K.jsxs)(`p`,{children:[oe(e,T.objectiveType),` No clear or commander progress earned.`]}),k?(0,K.jsx)(Js,{result:k}):(0,K.jsx)(`p`,{role:`status`,children:_?`Recording result…`:`Result not recorded yet.`})]}):null,!a&&E?(0,K.jsxs)(`details`,{className:`t-detail`,children:[(0,K.jsx)(`summary`,{children:`Challenge objective`}),(0,K.jsx)(`p`,{children:T.challenge?.label})]}):null,!a&&D?(0,K.jsxs)(`div`,{className:`t-panel t-deploy-overview`,role:`status`,children:[(0,K.jsx)(`strong`,{children:A?`RECORDED IN CAMPAIGN HISTORY`:_?`RECORDING CAMPAIGN RESULT...`:`RESULT AWAITS SERVER RECORD`}),(0,K.jsx)(`p`,{children:T?.missionId===`dead-relay-courier`?A&&(g?.campaignIntel?.[`dead-relay`]?.courierTraceAcquired||A.intelEarned)?`COURIER TRACE RECORDED · NEW HOLD RUNS USE DELAYED REINFORCEMENT`:A?t.victory?`Courier stopped. Early Intel was not secured; Hold is still unlocked.`:`Courier escaped. Retry this mission to open the relay route.`:`Courier result awaits server confirmation.`:T?.missionId===`dead-relay-hold`?A?t.victory?`Relay controlled. Guardian now available.`:`Relay control lost. Retry to secure the location.`:`Relay result awaits server confirmation.`:A?t.victory?`The Dead Relay is secure. Your campaign completion is recorded.`:`Guardian resisted. Regroup and retry.`:`Guardian result awaits server confirmation.`})]}):null,te?(0,K.jsxs)(`section`,{className:`t-panel t-s3-after-action`,"aria-label":`Confirmed consequence and next tactical goal`,"data-s3-receipt":re,children:[(0,K.jsx)(`span`,{className:`t-kicker`,children:`AFTER ACTION · SERVER RECORDED`}),ee?(0,K.jsxs)(`div`,{className:`t-s3-world-proof`,children:[(0,K.jsx)(`strong`,{children:ee.label}),(0,K.jsx)(`p`,{children:ee.detail})]}):(0,K.jsx)(`p`,{children:`No new persistent world change confirmed by this result.`}),(0,K.jsxs)(`div`,{className:`t-s3-next`,children:[(0,K.jsx)(`span`,{className:`t-kicker`,children:`ONE NEXT GOAL`}),(0,K.jsx)(`strong`,{children:te.title}),(0,K.jsx)(`p`,{children:te.reason})]})]}):null,(0,K.jsxs)(`section`,{className:`t-panel`,"aria-label":`Why your build mattered`,children:[(0,K.jsx)(`span`,{className:`t-kicker`,children:`WHY YOUR BUILD MATTERED`}),ae.length?ae.map(e=>(0,K.jsx)(`p`,{children:e},e)):(0,K.jsx)(`p`,{children:`No build-specific effect observed in this encounter.`}),(0,K.jsx)(`small`,{children:`Engine-observed on this device in this run only. These events are not persisted progress or extra rewards.`})]}),re&&M?(0,K.jsxs)(`section`,{className:`t-panel`,"aria-label":`This session combat evidence`,children:[(0,K.jsx)(`span`,{className:`t-kicker`,children:`THIS RUN · ENGINE-CONFIRMED MOMENT`}),(0,K.jsx)(`strong`,{children:M.detail}),(0,K.jsx)(`p`,{children:`Observed in the current device session only. Not a persisted combat event log or extra reward.`})]}):null,re&&j.length?(0,K.jsxs)(`section`,{className:`t-panel`,"aria-label":`Verified optional training`,children:[(0,K.jsx)(`span`,{className:`t-kicker`,children:`OPTIONAL TRAINING · CONFIRMED THIS RUN`}),j.map(e=>(0,K.jsxs)(`div`,{children:[(0,K.jsx)(`strong`,{children:e.title}),(0,K.jsx)(`p`,{children:e.evidence})]},e.id)),(0,K.jsx)(`small`,{children:`Training evidence is session-only; no extra rewards are awarded.`})]}):null,(0,K.jsx)(os,{}),(0,K.jsxs)(`dl`,{className:`t-stats`,children:[(0,K.jsxs)(`div`,{children:[(0,K.jsx)(`dt`,{children:`Turns`}),(0,K.jsx)(`dd`,{children:String(t.turns).padStart(2,`0`)})]}),(0,K.jsxs)(`div`,{children:[(0,K.jsx)(`dt`,{children:`Eliminated`}),(0,K.jsx)(`dd`,{children:t.hostilesEliminated})]}),(0,K.jsxs)(`div`,{children:[(0,K.jsx)(`dt`,{children:`Squad standing`}),(0,K.jsxs)(`dd`,{children:[t.squadStanding,` / `,t.squadDeployed]})]}),(0,K.jsxs)(`div`,{children:[(0,K.jsx)(`dt`,{children:`Damage taken`}),(0,K.jsx)(`dd`,{children:t.damageTaken})]})]}),g?.playerGrowth&&t.victory&&(E&&k||D&&A)&&g.playerGrowth.earnedPoints>g.playerGrowth.spentPoints?(0,K.jsxs)(`section`,{className:`t-growth-result`,"aria-label":`Server confirmed Skillbook progression`,children:[(0,K.jsx)(`span`,{className:`t-kicker`,children:`SERVER-CONFIRMED PROGRESSION`}),(0,K.jsxs)(`strong`,{children:[g.playerGrowth.earnedPoints-g.playerGrowth.spentPoints,` SKILL POINTS AVAILABLE`]}),(0,K.jsx)(`small`,{children:`First-time mission clears add one point. Spend available points on the War Table Skillbook before your next deployment.`})]}):null,(0,K.jsx)(`div`,{className:`t-brief-actions t-result-actions`,children:a?i?(0,K.jsx)(`button`,{type:`button`,className:`t-btn t-btn-primary`,onClick:()=>d(),children:`RETURN TO CHAPTER`}):(0,K.jsx)(`button`,{type:`button`,className:`t-btn t-btn-primary`,disabled:_,onClick:()=>void o(),children:_?`RECORDING…`:`RECORD CHAPTER RESULT`}):D?A?(0,K.jsxs)(K.Fragment,{children:[(0,K.jsx)(`button`,{type:`button`,className:`t-btn t-btn-primary`,onClick:()=>d(),children:`BACK TO CAMPAIGN`}),(0,K.jsx)(`button`,{type:`button`,className:`t-btn`,onClick:l,children:`REPLAY / SQUAD`})]}):(0,K.jsx)(`button`,{type:`button`,className:`t-btn t-btn-primary`,disabled:_,onClick:()=>void s(),children:_?`Recording...`:t.victory?`SAVE VICTORY`:`RECORD FAILURE / RETRY`}):E?(0,K.jsx)(K.Fragment,{children:k?(0,K.jsxs)(K.Fragment,{children:[(0,K.jsx)(`button`,{type:`button`,className:`t-btn t-btn-primary`,onClick:()=>d(),children:k.victory?O&&O.missionId!==m?`SEE NEXT: ${O.name}`:`SEE FIELD OPS`:`REGROUP AT WAR TABLE`}),(0,K.jsx)(`button`,{type:`button`,className:`t-btn`,onClick:l,children:`Replay / Squad`})]}):(0,K.jsx)(`button`,{type:`button`,className:`t-btn t-btn-primary`,disabled:_,onClick:()=>void c(),children:_?`Recording...`:`Retry saving result`})}):se?(0,K.jsxs)(K.Fragment,{children:[(0,K.jsxs)(`button`,{type:`button`,className:`t-btn t-btn-primary`,onClick:()=>d(),disabled:_,children:[_?`Saving…`:E?`Save clear / Field Ops`:N||P?`Continue`:`Return to Tactical Ops`,N||P?(0,K.jsx)(Ht,{className:`t-ico`}):null]}),(0,K.jsx)(`button`,{type:`button`,className:`t-btn`,onClick:l,disabled:_,children:E?`Save clear / Replay`:N?`REPLAY`:`Replay this drill`})]}):(0,K.jsxs)(K.Fragment,{children:[(0,K.jsx)(`button`,{type:`button`,className:`t-btn t-btn-primary`,onClick:l,children:`Replay operation`}),(0,K.jsx)(`button`,{type:`button`,className:`t-btn`,onClick:u,children:`Return to Tactical Ops`})]})}),v?(0,K.jsx)(`p`,{style:{color:`var(--t-enemy)`,margin:`0.8rem 0 0`},children:v}):null]})})]})}function $s(){let e=G(e=>e.battle.failureReason),t=R(G(e=>e.selectedMissionId)),n=t?.activity===`FIELD_OP`,r=G(e=>e.replay),i=G(e=>e.backToHub);return(0,K.jsxs)(`div`,{className:`t-fill`,children:[(0,K.jsx)(Gs,{dim:.7}),(0,K.jsx)(`div`,{className:`t-overlay`,children:(0,K.jsxs)(`div`,{className:`t-modal t-panel`,children:[(0,K.jsx)(`div`,{className:`t-kicker`,style:{color:`var(--t-enemy)`},children:n?`FIELD OP / ${t.name}`:`Broken Signal`}),(0,K.jsx)(`h2`,{className:`t-title`,children:n?`FIELD OP FAILED`:`Operation Failed`}),(0,K.jsx)(`p`,{style:{color:`var(--t-muted)`,margin:`0 0 1.1rem`},children:n?oe(e,t.objectiveType):`All allied units are down.`}),(0,K.jsxs)(`div`,{className:`t-brief-actions`,style:{justifyContent:`center`},children:[(0,K.jsxs)(`button`,{type:`button`,className:`t-btn t-btn-primary`,onClick:r,children:[(0,K.jsx)(qt,{className:`t-ico`}),` Retry`]}),(0,K.jsx)(`button`,{type:`button`,className:`t-btn`,onClick:i,children:`Return`})]})]})})]})}function ec(){let[,e]=(0,y.useState)(0);(0,y.useEffect)(()=>Mt()?.subscribe(()=>e(e=>e+1)),[]);let t=Mt()?.view().result,n=G(e=>e.screen),r=G(e=>e.selectSkill),i=G(e=>e.skipTurn),a=G(e=>e.muted);return(0,y.useEffect)(()=>{gi()&&(G.setState({muted:!0}),hi(!0))},[]),(0,y.useEffect)(()=>{let e=e=>{let t=G.getState(),n=t.battle.units.find(e=>e.id===t.battle.activeId);e.key===`1`&&n&&r(n.skillIds[0]),e.key===`2`&&n&&r(n.skillIds[1]),e.key===`3`&&n&&r(n.skillIds[2]),(e.key===`s`||e.key===`S`)&&i()};window.addEventListener(`keydown`,e);let t=()=>pi();return window.addEventListener(`pointerdown`,t,{once:!0}),()=>{window.removeEventListener(`keydown`,e),window.removeEventListener(`pointerdown`,t)}},[r,i]),(0,y.useEffect)(()=>{hi(a)},[a]),(0,K.jsx)(`div`,{className:`t-shell`,"data-screen":t?.confirmed?`results`:n,children:t?.confirmed?(0,K.jsx)(qs,{receipt:t}):(0,K.jsxs)(K.Fragment,{children:[n===`hub`?(0,K.jsx)(Ks,{}):null,n===`war-table`?(0,K.jsx)(Ys,{}):null,n===`brief`?(0,K.jsx)(Xs,{}):null,n===`battle`?(0,K.jsx)(is,{}):null,n===`sector`?(0,K.jsx)(Zs,{}):null,n===`results`?(0,K.jsx)(Qs,{}):null,n===`defeat`?(0,K.jsx)($s,{}):null]})})}var tc=`/* Alpha Husky Tactical Ops — viewport-first playability (V1)\r
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
#tacticalOpsRoot .t-battle .t-unit-hit.is-legal-target {border:2px solid #e3faff;background:#89dcf026;box-shadow:inset 0 0 0 1px #072430}
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
  overflow:hidden;pointer-events:none;display:flex;flex-direction:column;align-items:flex-start;gap:2px;
  padding-left:8px;border-left:2px solid #799cab;color:#e4f0f4;text-shadow:0 1px 2px #04111d;
}
#tacticalOpsRoot .t-command-cue strong {font:800 11px/14px var(--t-font-sans);letter-spacing:.035em}
#tacticalOpsRoot .t-command-cue > span {font:400 12px/15px var(--t-font-sans);max-width:100%;display:-webkit-box;-webkit-line-clamp:2;line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
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
#tacticalOpsRoot .t-battle .t-enemy-command {height:60px;min-height:60px;max-height:60px}
#tacticalOpsRoot .t-battle .t-act {height:60px;min-height:60px;padding:7px 1px 3px;gap:1px}
#tacticalOpsRoot .t-battle .t-act .name {font-size:10px;line-height:12px;letter-spacing:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#tacticalOpsRoot .t-battle .t-act .meta {font-size:10px;line-height:12px;letter-spacing:0;color:#d0e5ec}
#tacticalOpsRoot .t-battle .t-act .slot {font-size:9px;line-height:10px;letter-spacing:0}
#tacticalOpsRoot .t-battle .t-act-art {width:24px;height:24px;flex:0 0 24px;margin:0 auto}
#tacticalOpsRoot .t-battle .t-act.on {outline:1px solid #c1e9f1;outline-offset:-3px}
#tacticalOpsRoot .t-battle .t-act .cd {font-size:11px}
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
`,nc={requestClose:()=>{},dbg:!1};function rc(e){nc={...nc,...e}}function ic(e,t){let n=Math.max(0,Math.round(e));return n<=599?`compact`:n<=899?`standard`:`wide`}var ac=`tacticalOpsRoot`,oc=`tacticalOpsStyles`,sc=`tacticalOpsFonts`,q={apiPost:null,tg:null,dbg:!1,root:null,isOpen:!1,reactRoot:null,keyHandlerBound:!1,resizeBound:!1,prevBodyOverflow:``,prevHtmlOverflow:``,resizeObserver:null,battleWatcher:null},cc=Promise.resolve();try{window.__AH_TACTICAL_OPS_VER__=xa,window.__TACTICAL_COMBAT__=li}catch{}function lc(){let e=document.getElementById(oc);e||(e=document.createElement(`style`),e.id=oc,document.head.appendChild(e)),e.textContent=tc}function uc(){if(document.getElementById(sc))return;let e=document.createElement(`link`);e.id=sc,e.rel=`stylesheet`,e.href=`https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Source+Sans+3:wght@400;600;700&display=swap`,document.head.appendChild(e)}function dc(){let e=q.root||document.getElementById(ac);if(!e)return;let t=window.visualViewport,n=q.tg?.viewportStableHeight||q.tg?.viewportHeight,r=Math.max(1,Math.round(t?.width||e.clientWidth||window.innerWidth)),i=Math.max(1,Math.round(t?.height||(typeof n==`number`?n:0)||window.innerHeight)),a=Math.round(t?.offsetTop||0),o=Math.round(t?.offsetLeft||0);e.style.position=`fixed`,e.style.left=`${o}px`,e.style.top=`${a}px`,e.style.right=`auto`,e.style.bottom=`auto`,e.style.width=`${r}px`,e.style.height=`${i}px`,e.style.maxHeight=`${i}px`,e.style.setProperty(`--tops-w`,`${r}px`),e.style.setProperty(`--tops-h`,`${i}px`),e.setAttribute(`data-layout`,ic(r,i)),fc(e,r,i)}function fc(e,t,n){let r=e.querySelector(`.t-field-wrap`);if(!r)return;let i=e.getAttribute(`data-layout`)||ic(t,n),a=t=>{let n=e.querySelector(t);return n?Math.round(n.getBoundingClientRect().height):0},o=a(`.t-top`)+a(`.t-dock`),s=i===`wide`?Math.max(160,n):Math.max(160,n-o);e.style.setProperty(`--tops-field-h`,`${s}px`),r.style.display=`block`,r.style.width=`100%`,r.style.minWidth=`0`,r.style.overflow=`hidden`,i===`wide`?(r.style.position=`absolute`,r.style.inset=`0`,r.style.height=`100%`,r.style.minHeight=`100%`,r.style.maxHeight=`none`):(r.style.position=`relative`,r.style.inset=`auto`,r.style.flex=`1 1 auto`,r.style.height=`${s}px`,r.style.minHeight=`${s}px`,r.style.maxHeight=`${s}px`);let c=e.querySelector(`.t-field`);c&&(c.style.position=`absolute`,c.style.inset=`0`,c.style.width=`100%`,c.style.height=`100%`);let l=e.querySelector(`.t-field-art`);l&&(l.style.position=`absolute`,l.style.inset=`0`,l.style.width=`100%`,l.style.height=`100%`,l.style.objectFit=`cover`,l.style.display=`block`)}function pc(){dc()}function mc(){if(!q.resizeBound){window.addEventListener(`resize`,pc);try{window.visualViewport?.addEventListener(`resize`,pc),window.visualViewport?.addEventListener(`scroll`,pc)}catch{}try{q.resizeObserver=new ResizeObserver(pc),q.resizeObserver.observe(document.documentElement),q.root&&q.resizeObserver.observe(q.root)}catch{q.resizeObserver=null}hc(),q.resizeBound=!0}}function hc(){if(q.root&&!q.battleWatcher)try{q.battleWatcher=new MutationObserver(()=>{requestAnimationFrame(()=>dc())}),q.battleWatcher.observe(q.root,{childList:!0,subtree:!0})}catch{q.battleWatcher=null}}function gc(){if(q.resizeBound){window.removeEventListener(`resize`,pc);try{window.visualViewport?.removeEventListener(`resize`,pc),window.visualViewport?.removeEventListener(`scroll`,pc)}catch{}try{q.resizeObserver?.disconnect()}catch{}q.resizeObserver=null;try{q.battleWatcher?.disconnect()}catch{}q.battleWatcher=null,q.resizeBound=!1}}function _c(){q.prevBodyOverflow=document.body.style.overflow,q.prevHtmlOverflow=document.documentElement.style.overflow,document.body.style.overflow=`hidden`,document.documentElement.style.overflow=`hidden`}function vc(){document.body.style.overflow=q.prevBodyOverflow,document.documentElement.style.overflow=q.prevHtmlOverflow}function yc(e){if(!q.isOpen||e.key!==`Escape`)return;let t=G.getState();t.screen===`battle`&&t.battle.mode===`targeting`?(t.cancel(),e.preventDefault(),e.stopPropagation()):t.screen===`brief`?(t.backToHub(),e.preventDefault(),e.stopPropagation()):(e.preventDefault(),e.stopPropagation(),Dc())}function bc(){q.keyHandlerBound||(document.addEventListener(`keydown`,yc,!0),q.keyHandlerBound=!0)}function xc(){q.keyHandlerBound&&(document.removeEventListener(`keydown`,yc,!0),q.keyHandlerBound=!1)}function Sc(){lc(),uc();let e=document.getElementById(ac);return e||(e=document.createElement(`div`),e.id=ac,e.setAttribute(`data-open`,`0`),document.body.appendChild(e)),q.root=e,e}function Cc(){q.isOpen=!1,xc(),gc(),vc(),q.reactRoot&&(q.reactRoot.unmount(),q.reactRoot=null);let e=q.root||document.getElementById(ac);e&&(e.setAttribute(`data-open`,`0`),e.innerHTML=``);try{G.getState().backToHub()}catch{}}function wc(){let e={close:()=>{Cc()},isOpen:()=>q.isOpen},t=window;try{t.AlphaNav?.push?t.AlphaNav.push(ac,e):(t.navRegister?.(ac,e),t.navOpen?.(ac))}catch{}}function Tc(e){let t=e&&typeof e==`object`?e:{};typeof t.apiPost==`function`&&(q.apiPost=t.apiPost),t.tg&&(q.tg=t.tg),typeof t.dbg==`boolean`&&(q.dbg=t.dbg);try{if(q.apiPost&&typeof window<`u`){let e=window;typeof e.apiPost!=`function`&&(e.apiPost=q.apiPost)}}catch{}return t.onboarding===`session`?(G.getState().configureOnboarding({enabled:!0}),cc=Promise.resolve()):t.onboarding===`off`?(G.getState().configureOnboarding({enabled:!1}),cc=Promise.resolve()):cc=G.getState().loadFoundationProgression(),rc({requestClose:Dc,dbg:q.dbg}),kc}async function Ec(e){await cc,typeof e==`string`&&e&&G.getState().openOperationBrief(e);let t=Sc();rc({requestClose:Dc,dbg:q.dbg}),q.isOpen=!0,t.setAttribute(`data-open`,`1`),_c(),bc(),mc(),dc(),q.reactRoot||(q.reactRoot=(0,b.createRoot)(t)),q.reactRoot.render((0,y.createElement)(ec)),wc();try{q.tg?.expand?.()}catch{}requestAnimationFrame(()=>dc()),setTimeout(()=>dc(),50)}function Dc(){if(!q.isOpen)return;let e=window;try{if(e.AlphaNav?.close?.(ac,{source:`tactical-ops-close`}))return}catch{}Cc();try{e.navClose?.(ac)}catch{}}function Oc(){return{...yo(),open:q.isOpen,version:xa}}var kc={init:Tc,open:Ec,close:Dc,refresh:Oc,getState:Oc};function Ac(){return window.TacticalOps=kc,kc}var jc=Ac();try{let e=window;e.__AH_TACTICAL_OPS_VER__=xa,e.__TACTICAL_COMBAT__=li,e.TacticalOps=jc}catch{}return e.API=kc,e.BATTLEFIELD_LAB_KEY=fn,Object.defineProperty(e,"BATTLEFIELD_VNEXT_PREVIEW",{enumerable:!0,get:function(){return pn}}),e.DEF_CURVE=_n,Object.defineProperty(e,"GRID_COLS",{enumerable:!0,get:function(){return z}}),Object.defineProperty(e,"GRID_ROWS",{enumerable:!0,get:function(){return mn}}),e.METER_MAX=gn,e.STATUS_LABEL=Dn,e.STATUS_SHORT=On,e.VERSION=xa,e.a1Range=ci,e.advanceToNext=$r,e.aiUsesLegalRules=hr,e.applyAi=oi,e.applySkill=nr,e.applyStatus=xn,e.availableSkills=rr,e.beginUnitTurn=Qr,e.canOccupy=Rn,e.canRecover=ti,e.cellKey=Nn,e.chebyshev=Mn,e.chooseAiAction=mr,e.computeHeal=An,e.consumeMeter=Xn,e.cooldownLeft=$n,e.createBattle=Jr,e.default=jc,e.effectiveAtk=Cn,e.effectiveDef=wn,e.effectiveSpd=Tn,e.encounterPressureAction=pr,e.evaluateOutcome=Xr,e.fieldPercent=zn,e.hasStatus=bn,e.inBounds=jn,e.inSkillRange=Bn,e.incomingDamageMultiplier=En,e.isLegalTargetType=Kn,e.living=Vn,e.mitigatedDamage=kn,e.objectiveAwareEnemyAction=dr,e.objectiveTargetScore=sr,e.occupiedKeys=Pn,e.pickReadyId=Yn,e.planAi=si,e.previewQueue=Zn,e.reachableCells=Ln,e.relayDenialAction=fr,e.resetStatusSeq=yn,e.resolveSkillTargets=Un,e.selectAcceptedBattleRules=hn,e.skillNeedsTargetPick=Gn,e.skillReady=er,e.startBattle=ei,e.tickUntilReady=Jn,e.tryMove=ri,e.tryRecover=ni,e.trySkill=ai,e.trySkip=ii,e.unitAt=Fn,e.unitSkills=Qn,e.unitsInRadius=Hn,e.validTargetIds=Wn,e})({});