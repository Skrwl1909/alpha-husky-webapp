/* tactical_ops.js v2.2.3-field-geometry */
var TacticalOpsBundle=(function(e){Object.defineProperties(e,{__esModule:{value:!0},[Symbol.toStringTag]:{value:`Module`}});var t=Object.create,n=Object.defineProperty,r=Object.getOwnPropertyDescriptor,i=Object.getOwnPropertyNames,a=Object.getPrototypeOf,o=Object.prototype.hasOwnProperty,s=(e,t)=>()=>(t||(e((t={exports:{}}).exports,t),e=null),t.exports),c=(e,t)=>{let r={};for(var i in e)n(r,i,{get:e[i],enumerable:!0});return t||n(r,Symbol.toStringTag,{value:`Module`}),r},l=(e,t,a,s)=>{if(t&&typeof t==`object`||typeof t==`function`)for(var c=i(t),l=0,u=c.length,d;l<u;l++)d=c[l],!o.call(e,d)&&d!==a&&n(e,d,{get:(e=>t[e]).bind(null,d),enumerable:!(s=r(t,d))||s.enumerable});return e},u=(e,r,i)=>(i=e==null?{}:t(a(e)),l(r||!e||!e.__esModule||!o.call(e,`default`)?n(i,`default`,{value:e,enumerable:!0}):i,e)),d=s((e=>{function t(e,t){var n=e.length;e.push(t);a:for(;0<n;){var r=n-1>>>1,a=e[r];if(0<i(a,t))e[r]=t,e[n]=a,n=r;else break a}}function n(e){return e.length===0?null:e[0]}function r(e){if(e.length===0)return null;var t=e[0],n=e.pop();if(n!==t){e[0]=n;a:for(var r=0,a=e.length,o=a>>>1;r<o;){var s=2*(r+1)-1,c=e[s],l=s+1,u=e[l];if(0>i(c,n))l<a&&0>i(u,c)?(e[r]=u,e[l]=n,r=l):(e[r]=c,e[s]=n,r=s);else if(l<a&&0>i(u,n))e[r]=u,e[l]=n,r=l;else break a}}return t}function i(e,t){var n=e.sortIndex-t.sortIndex;return n===0?e.id-t.id:n}if(e.unstable_now=void 0,typeof performance==`object`&&typeof performance.now==`function`){var a=performance;e.unstable_now=function(){return a.now()}}else{var o=Date,s=o.now();e.unstable_now=function(){return o.now()-s}}var c=[],l=[],u=1,d=null,f=3,p=!1,m=!1,h=!1,g=!1,_=typeof setTimeout==`function`?setTimeout:null,v=typeof clearTimeout==`function`?clearTimeout:null,y=typeof setImmediate<`u`?setImmediate:null;function b(e){for(var i=n(l);i!==null;){if(i.callback===null)r(l);else if(i.startTime<=e)r(l),i.sortIndex=i.expirationTime,t(c,i);else break;i=n(l)}}function x(e){if(h=!1,b(e),!m){if(n(c)!==null)m=!0,ee||(ee=!0,re());else{var t=n(l);t!==null&&oe(x,t.startTime-e)}}}var ee=!1,S=-1,C=5,w=-1;function te(){return g?!0:!(e.unstable_now()-w<C)}function ne(){if(g=!1,ee){var t=e.unstable_now();w=t;var i=!0;try{a:{m=!1,h&&(h=!1,v(S),S=-1),p=!0;var a=f;try{b:{for(b(t),d=n(c);d!==null&&!(d.expirationTime>t&&te());){var o=d.callback;if(typeof o==`function`){d.callback=null,f=d.priorityLevel;var s=o(d.expirationTime<=t);if(t=e.unstable_now(),typeof s==`function`){d.callback=s,b(t),i=!0;break b}d===n(c)&&r(c),b(t)}else r(c);d=n(c)}if(d!==null)i=!0;else{var u=n(l);u!==null&&oe(x,u.startTime-t),i=!1}}break a}finally{d=null,f=a,p=!1}i=void 0}}finally{i?re():ee=!1}}}var re;if(typeof y==`function`)re=function(){y(ne)};else if(typeof MessageChannel<`u`){var ie=new MessageChannel,ae=ie.port2;ie.port1.onmessage=ne,re=function(){ae.postMessage(null)}}else re=function(){_(ne,0)};function oe(t,n){S=_(function(){t(e.unstable_now())},n)}e.unstable_IdlePriority=5,e.unstable_ImmediatePriority=1,e.unstable_LowPriority=4,e.unstable_NormalPriority=3,e.unstable_Profiling=null,e.unstable_UserBlockingPriority=2,e.unstable_cancelCallback=function(e){e.callback=null},e.unstable_forceFrameRate=function(e){0>e||125<e?console.error(`forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported`):C=0<e?Math.floor(1e3/e):5},e.unstable_getCurrentPriorityLevel=function(){return f},e.unstable_next=function(e){switch(f){case 1:case 2:case 3:var t=3;break;default:t=f}var n=f;f=t;try{return e()}finally{f=n}},e.unstable_requestPaint=function(){g=!0},e.unstable_runWithPriority=function(e,t){switch(e){case 1:case 2:case 3:case 4:case 5:break;default:e=3}var n=f;f=e;try{return t()}finally{f=n}},e.unstable_scheduleCallback=function(r,i,a){var o=e.unstable_now();switch(typeof a==`object`&&a?(a=a.delay,a=typeof a==`number`&&0<a?o+a:o):a=o,r){case 1:var s=-1;break;case 2:s=250;break;case 5:s=1073741823;break;case 4:s=1e4;break;default:s=5e3}return s=a+s,r={id:u++,callback:i,priorityLevel:r,startTime:a,expirationTime:s,sortIndex:-1},a>o?(r.sortIndex=a,t(l,r),n(c)===null&&r===n(l)&&(h?(v(S),S=-1):h=!0,oe(x,a-o))):(r.sortIndex=s,t(c,r),m||p||(m=!0,ee||(ee=!0,re()))),r},e.unstable_shouldYield=te,e.unstable_wrapCallback=function(e){var t=f;return function(){var n=f;f=t;try{return e.apply(this,arguments)}finally{f=n}}}})),f=s(((e,t)=>{t.exports=d()})),p=s((e=>{var t=Symbol.for(`react.transitional.element`),n=Symbol.for(`react.portal`),r=Symbol.for(`react.fragment`),i=Symbol.for(`react.strict_mode`),a=Symbol.for(`react.profiler`),o=Symbol.for(`react.consumer`),s=Symbol.for(`react.context`),c=Symbol.for(`react.forward_ref`),l=Symbol.for(`react.suspense`),u=Symbol.for(`react.memo`),d=Symbol.for(`react.lazy`),f=Symbol.for(`react.activity`),p=Symbol.iterator;function m(e){return typeof e!=`object`||!e?null:(e=p&&e[p]||e[`@@iterator`],typeof e==`function`?e:null)}var h={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},g=Object.assign,_={};function v(e,t,n){this.props=e,this.context=t,this.refs=_,this.updater=n||h}v.prototype.isReactComponent={},v.prototype.setState=function(e,t){if(typeof e!=`object`&&typeof e!=`function`&&e!=null)throw Error(`takes an object of state variables to update or a function which returns an object of state variables.`);this.updater.enqueueSetState(this,e,t,`setState`)},v.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,`forceUpdate`)};function y(){}y.prototype=v.prototype;function b(e,t,n){this.props=e,this.context=t,this.refs=_,this.updater=n||h}var x=b.prototype=new y;x.constructor=b,g(x,v.prototype),x.isPureReactComponent=!0;var ee=Array.isArray;function S(){}var C={H:null,A:null,T:null,S:null},w=Object.prototype.hasOwnProperty;function te(e,n,r){var i=r.ref;return{$$typeof:t,type:e,key:n,ref:i===void 0?null:i,props:r}}function ne(e,t){return te(e.type,t,e.props)}function re(e){return typeof e==`object`&&!!e&&e.$$typeof===t}function ie(e){var t={"=":`=0`,":":`=2`};return`$`+e.replace(/[=:]/g,function(e){return t[e]})}var ae=/\/+/g;function oe(e,t){return typeof e==`object`&&e&&e.key!=null?ie(``+e.key):t.toString(36)}function se(e){switch(e.status){case`fulfilled`:return e.value;case`rejected`:throw e.reason;default:switch(typeof e.status==`string`?e.then(S,S):(e.status=`pending`,e.then(function(t){e.status===`pending`&&(e.status=`fulfilled`,e.value=t)},function(t){e.status===`pending`&&(e.status=`rejected`,e.reason=t)})),e.status){case`fulfilled`:return e.value;case`rejected`:throw e.reason}}throw e}function ce(e,r,i,a,o){var s=typeof e;(s===`undefined`||s===`boolean`)&&(e=null);var c=!1;if(e===null)c=!0;else switch(s){case`bigint`:case`string`:case`number`:c=!0;break;case`object`:switch(e.$$typeof){case t:case n:c=!0;break;case d:return c=e._init,ce(c(e._payload),r,i,a,o)}}if(c)return o=o(e),c=a===``?`.`+oe(e,0):a,ee(o)?(i=``,c!=null&&(i=c.replace(ae,`$&/`)+`/`),ce(o,r,i,``,function(e){return e})):o!=null&&(re(o)&&(o=ne(o,i+(o.key==null||e&&e.key===o.key?``:(``+o.key).replace(ae,`$&/`)+`/`)+c)),r.push(o)),1;c=0;var l=a===``?`.`:a+`:`;if(ee(e))for(var u=0;u<e.length;u++)a=e[u],s=l+oe(a,u),c+=ce(a,r,i,s,o);else if(u=m(e),typeof u==`function`)for(e=u.call(e),u=0;!(a=e.next()).done;)a=a.value,s=l+oe(a,u++),c+=ce(a,r,i,s,o);else if(s===`object`){if(typeof e.then==`function`)return ce(se(e),r,i,a,o);throw r=String(e),Error(`Objects are not valid as a React child (found: `+(r===`[object Object]`?`object with keys {`+Object.keys(e).join(`, `)+`}`:r)+`). If you meant to render a collection of children, use an array instead.`)}return c}function le(e,t,n){if(e==null)return e;var r=[],i=0;return ce(e,r,``,``,function(e){return t.call(n,e,i++)}),r}function ue(e){if(e._status===-1){var t=e._result;t=t(),t.then(function(t){(e._status===0||e._status===-1)&&(e._status=1,e._result=t)},function(t){(e._status===0||e._status===-1)&&(e._status=2,e._result=t)}),e._status===-1&&(e._status=0,e._result=t)}if(e._status===1)return e._result.default;throw e._result}var T=typeof reportError==`function`?reportError:function(e){if(typeof window==`object`&&typeof window.ErrorEvent==`function`){var t=new window.ErrorEvent(`error`,{bubbles:!0,cancelable:!0,message:typeof e==`object`&&e&&typeof e.message==`string`?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process==`object`&&typeof process.emit==`function`){process.emit(`uncaughtException`,e);return}console.error(e)},E={map:le,forEach:function(e,t,n){le(e,function(){t.apply(this,arguments)},n)},count:function(e){var t=0;return le(e,function(){t++}),t},toArray:function(e){return le(e,function(e){return e})||[]},only:function(e){if(!re(e))throw Error(`React.Children.only expected to receive a single React element child.`);return e}};e.Activity=f,e.Children=E,e.Component=v,e.Fragment=r,e.Profiler=a,e.PureComponent=b,e.StrictMode=i,e.Suspense=l,e.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=C,e.__COMPILER_RUNTIME={__proto__:null,c:function(e){return C.H.useMemoCache(e)}},e.cache=function(e){return function(){return e.apply(null,arguments)}},e.cacheSignal=function(){return null},e.cloneElement=function(e,t,n){if(e==null)throw Error(`The argument must be a React element, but you passed `+e+`.`);var r=g({},e.props),i=e.key;if(t!=null)for(a in t.key!==void 0&&(i=``+t.key),t)!w.call(t,a)||a===`key`||a===`__self`||a===`__source`||a===`ref`&&t.ref===void 0||(r[a]=t[a]);var a=arguments.length-2;if(a===1)r.children=n;else if(1<a){for(var o=Array(a),s=0;s<a;s++)o[s]=arguments[s+2];r.children=o}return te(e.type,i,r)},e.createContext=function(e){return e={$$typeof:s,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null},e.Provider=e,e.Consumer={$$typeof:o,_context:e},e},e.createElement=function(e,t,n){var r,i={},a=null;if(t!=null)for(r in t.key!==void 0&&(a=``+t.key),t)w.call(t,r)&&r!==`key`&&r!==`__self`&&r!==`__source`&&(i[r]=t[r]);var o=arguments.length-2;if(o===1)i.children=n;else if(1<o){for(var s=Array(o),c=0;c<o;c++)s[c]=arguments[c+2];i.children=s}if(e&&e.defaultProps)for(r in o=e.defaultProps,o)i[r]===void 0&&(i[r]=o[r]);return te(e,a,i)},e.createRef=function(){return{current:null}},e.forwardRef=function(e){return{$$typeof:c,render:e}},e.isValidElement=re,e.lazy=function(e){return{$$typeof:d,_payload:{_status:-1,_result:e},_init:ue}},e.memo=function(e,t){return{$$typeof:u,type:e,compare:t===void 0?null:t}},e.startTransition=function(e){var t=C.T,n={};C.T=n;try{var r=e(),i=C.S;i!==null&&i(n,r),typeof r==`object`&&r&&typeof r.then==`function`&&r.then(S,T)}catch(e){T(e)}finally{t!==null&&n.types!==null&&(t.types=n.types),C.T=t}},e.unstable_useCacheRefresh=function(){return C.H.useCacheRefresh()},e.use=function(e){return C.H.use(e)},e.useActionState=function(e,t,n){return C.H.useActionState(e,t,n)},e.useCallback=function(e,t){return C.H.useCallback(e,t)},e.useContext=function(e){return C.H.useContext(e)},e.useDebugValue=function(){},e.useDeferredValue=function(e,t){return C.H.useDeferredValue(e,t)},e.useEffect=function(e,t){return C.H.useEffect(e,t)},e.useEffectEvent=function(e){return C.H.useEffectEvent(e)},e.useId=function(){return C.H.useId()},e.useImperativeHandle=function(e,t,n){return C.H.useImperativeHandle(e,t,n)},e.useInsertionEffect=function(e,t){return C.H.useInsertionEffect(e,t)},e.useLayoutEffect=function(e,t){return C.H.useLayoutEffect(e,t)},e.useMemo=function(e,t){return C.H.useMemo(e,t)},e.useOptimistic=function(e,t){return C.H.useOptimistic(e,t)},e.useReducer=function(e,t,n){return C.H.useReducer(e,t,n)},e.useRef=function(e){return C.H.useRef(e)},e.useState=function(e){return C.H.useState(e)},e.useSyncExternalStore=function(e,t,n){return C.H.useSyncExternalStore(e,t,n)},e.useTransition=function(){return C.H.useTransition()},e.version=`19.2.8`})),m=s(((e,t)=>{t.exports=p()})),h=s((e=>{var t=m();function n(e){var t=`https://react.dev/errors/`+e;if(1<arguments.length){t+=`?args[]=`+encodeURIComponent(arguments[1]);for(var n=2;n<arguments.length;n++)t+=`&args[]=`+encodeURIComponent(arguments[n])}return`Minified React error #`+e+`; visit `+t+` for the full message or use the non-minified dev environment for full errors and additional helpful warnings.`}function r(){}var i={d:{f:r,r:function(){throw Error(n(522))},D:r,C:r,L:r,m:r,X:r,S:r,M:r},p:0,findDOMNode:null},a=Symbol.for(`react.portal`);function o(e,t,n){var r=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:a,key:r==null?null:``+r,children:e,containerInfo:t,implementation:n}}var s=t.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;function c(e,t){if(e===`font`)return``;if(typeof t==`string`)return t===`use-credentials`?t:``}e.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=i,e.createPortal=function(e,t){var r=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)throw Error(n(299));return o(e,t,null,r)},e.flushSync=function(e){var t=s.T,n=i.p;try{if(s.T=null,i.p=2,e)return e()}finally{s.T=t,i.p=n,i.d.f()}},e.preconnect=function(e,t){typeof e==`string`&&(t?(t=t.crossOrigin,t=typeof t==`string`?t===`use-credentials`?t:``:void 0):t=null,i.d.C(e,t))},e.prefetchDNS=function(e){typeof e==`string`&&i.d.D(e)},e.preinit=function(e,t){if(typeof e==`string`&&t&&typeof t.as==`string`){var n=t.as,r=c(n,t.crossOrigin),a=typeof t.integrity==`string`?t.integrity:void 0,o=typeof t.fetchPriority==`string`?t.fetchPriority:void 0;n===`style`?i.d.S(e,typeof t.precedence==`string`?t.precedence:void 0,{crossOrigin:r,integrity:a,fetchPriority:o}):n===`script`&&i.d.X(e,{crossOrigin:r,integrity:a,fetchPriority:o,nonce:typeof t.nonce==`string`?t.nonce:void 0})}},e.preinitModule=function(e,t){if(typeof e==`string`){if(typeof t==`object`&&t){if(t.as==null||t.as===`script`){var n=c(t.as,t.crossOrigin);i.d.M(e,{crossOrigin:n,integrity:typeof t.integrity==`string`?t.integrity:void 0,nonce:typeof t.nonce==`string`?t.nonce:void 0})}}else t??i.d.M(e)}},e.preload=function(e,t){if(typeof e==`string`&&typeof t==`object`&&t&&typeof t.as==`string`){var n=t.as,r=c(n,t.crossOrigin);i.d.L(e,n,{crossOrigin:r,integrity:typeof t.integrity==`string`?t.integrity:void 0,nonce:typeof t.nonce==`string`?t.nonce:void 0,type:typeof t.type==`string`?t.type:void 0,fetchPriority:typeof t.fetchPriority==`string`?t.fetchPriority:void 0,referrerPolicy:typeof t.referrerPolicy==`string`?t.referrerPolicy:void 0,imageSrcSet:typeof t.imageSrcSet==`string`?t.imageSrcSet:void 0,imageSizes:typeof t.imageSizes==`string`?t.imageSizes:void 0,media:typeof t.media==`string`?t.media:void 0})}},e.preloadModule=function(e,t){if(typeof e==`string`){if(t){var n=c(t.as,t.crossOrigin);i.d.m(e,{as:typeof t.as==`string`&&t.as!==`script`?t.as:void 0,crossOrigin:n,integrity:typeof t.integrity==`string`?t.integrity:void 0})}else i.d.m(e)}},e.requestFormReset=function(e){i.d.r(e)},e.unstable_batchedUpdates=function(e,t){return e(t)},e.useFormState=function(e,t,n){return s.H.useFormState(e,t,n)},e.useFormStatus=function(){return s.H.useHostTransitionStatus()},e.version=`19.2.8`})),g=s(((e,t)=>{function n(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>`u`||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!=`function`))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(n)}catch(e){console.error(e)}}n(),t.exports=h()})),_=s((e=>{var t=f(),n=m(),r=g();function i(e){var t=`https://react.dev/errors/`+e;if(1<arguments.length){t+=`?args[]=`+encodeURIComponent(arguments[1]);for(var n=2;n<arguments.length;n++)t+=`&args[]=`+encodeURIComponent(arguments[n])}return`Minified React error #`+e+`; visit `+t+` for the full message or use the non-minified dev environment for full errors and additional helpful warnings.`}function a(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)}function o(e){var t=e,n=e;if(e.alternate)for(;t.return;)t=t.return;else{e=t;do t=e,t.flags&4098&&(n=t.return),e=t.return;while(e)}return t.tag===3?n:null}function s(e){if(e.tag===13){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function c(e){if(e.tag===31){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function l(e){if(o(e)!==e)throw Error(i(188))}function u(e){var t=e.alternate;if(!t){if(t=o(e),t===null)throw Error(i(188));return t===e?e:null}for(var n=e,r=t;;){var a=n.return;if(a===null)break;var s=a.alternate;if(s===null){if(r=a.return,r!==null){n=r;continue}break}if(a.child===s.child){for(s=a.child;s;){if(s===n)return l(a),e;if(s===r)return l(a),t;s=s.sibling}throw Error(i(188))}if(n.return!==r.return)n=a,r=s;else{for(var c=!1,u=a.child;u;){if(u===n){c=!0,n=a,r=s;break}if(u===r){c=!0,r=a,n=s;break}u=u.sibling}if(!c){for(u=s.child;u;){if(u===n){c=!0,n=s,r=a;break}if(u===r){c=!0,r=s,n=a;break}u=u.sibling}if(!c)throw Error(i(189))}}if(n.alternate!==r)throw Error(i(190))}if(n.tag!==3)throw Error(i(188));return n.stateNode.current===n?e:t}function d(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e;for(e=e.child;e!==null;){if(t=d(e),t!==null)return t;e=e.sibling}return null}var p=Object.assign,h=Symbol.for(`react.element`),_=Symbol.for(`react.transitional.element`),v=Symbol.for(`react.portal`),y=Symbol.for(`react.fragment`),b=Symbol.for(`react.strict_mode`),x=Symbol.for(`react.profiler`),ee=Symbol.for(`react.consumer`),S=Symbol.for(`react.context`),C=Symbol.for(`react.forward_ref`),w=Symbol.for(`react.suspense`),te=Symbol.for(`react.suspense_list`),ne=Symbol.for(`react.memo`),re=Symbol.for(`react.lazy`),ie=Symbol.for(`react.activity`),ae=Symbol.for(`react.memo_cache_sentinel`),oe=Symbol.iterator;function se(e){return typeof e!=`object`||!e?null:(e=oe&&e[oe]||e[`@@iterator`],typeof e==`function`?e:null)}var ce=Symbol.for(`react.client.reference`);function le(e){if(e==null)return null;if(typeof e==`function`)return e.$$typeof===ce?null:e.displayName||e.name||null;if(typeof e==`string`)return e;switch(e){case y:return`Fragment`;case x:return`Profiler`;case b:return`StrictMode`;case w:return`Suspense`;case te:return`SuspenseList`;case ie:return`Activity`}if(typeof e==`object`)switch(e.$$typeof){case v:return`Portal`;case S:return e.displayName||`Context`;case ee:return(e._context.displayName||`Context`)+`.Consumer`;case C:var t=e.render;return e=e.displayName,e||(e=t.displayName||t.name||``,e=e===``?`ForwardRef`:`ForwardRef(`+e+`)`),e;case ne:return t=e.displayName||null,t===null?le(e.type)||`Memo`:t;case re:t=e._payload,e=e._init;try{return le(e(t))}catch{}}return null}var ue=Array.isArray,T=n.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,E=r.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,de={pending:!1,data:null,method:null,action:null},fe=[],pe=-1;function me(e){return{current:e}}function he(e){0>pe||(e.current=fe[pe],fe[pe]=null,pe--)}function D(e,t){pe++,fe[pe]=e.current,e.current=t}var ge=me(null),_e=me(null),ve=me(null),ye=me(null);function be(e,t){switch(D(ve,t),D(_e,e),D(ge,null),t.nodeType){case 9:case 11:e=(e=t.documentElement)&&(e=e.namespaceURI)?Vd(e):0;break;default:if(e=t.tagName,t=t.namespaceURI)t=Vd(t),e=Hd(t,e);else switch(e){case`svg`:e=1;break;case`math`:e=2;break;default:e=0}}he(ge),D(ge,e)}function xe(){he(ge),he(_e),he(ve)}function Se(e){e.memoizedState!==null&&D(ye,e);var t=ge.current,n=Hd(t,e.type);t!==n&&(D(_e,e),D(ge,n))}function Ce(e){_e.current===e&&(he(ge),he(_e)),ye.current===e&&(he(ye),Qf._currentValue=de)}var we,Te;function Ee(e){if(we===void 0)try{throw Error()}catch(e){var t=e.stack.trim().match(/\n( *(at )?)/);we=t&&t[1]||``,Te=-1<e.stack.indexOf(`
    at`)?` (<anonymous>)`:-1<e.stack.indexOf(`@`)?`@unknown:0:0`:``}return`
`+we+e+Te}var De=!1;function Oe(e,t){if(!e||De)return``;De=!0;var n=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{var r={DetermineComponentFrameRoot:function(){try{if(t){var n=function(){throw Error()};if(Object.defineProperty(n.prototype,"props",{set:function(){throw Error()}}),typeof Reflect==`object`&&Reflect.construct){try{Reflect.construct(n,[])}catch(e){var r=e}Reflect.construct(e,[],n)}else{try{n.call()}catch(e){r=e}e.call(n.prototype)}}else{try{throw Error()}catch(e){r=e}(n=e())&&typeof n.catch==`function`&&n.catch(function(){})}}catch(e){if(e&&r&&typeof e.stack==`string`)return[e.stack,r.stack]}return[null,null]}};r.DetermineComponentFrameRoot.displayName=`DetermineComponentFrameRoot`;var i=Object.getOwnPropertyDescriptor(r.DetermineComponentFrameRoot,`name`);i&&i.configurable&&Object.defineProperty(r.DetermineComponentFrameRoot,"name",{value:`DetermineComponentFrameRoot`});var a=r.DetermineComponentFrameRoot(),o=a[0],s=a[1];if(o&&s){var c=o.split(`
`),l=s.split(`
`);for(i=r=0;r<c.length&&!c[r].includes(`DetermineComponentFrameRoot`);)r++;for(;i<l.length&&!l[i].includes(`DetermineComponentFrameRoot`);)i++;if(r===c.length||i===l.length)for(r=c.length-1,i=l.length-1;1<=r&&0<=i&&c[r]!==l[i];)i--;for(;1<=r&&0<=i;r--,i--)if(c[r]!==l[i]){if(r!==1||i!==1)do if(r--,i--,0>i||c[r]!==l[i]){var u=`
`+c[r].replace(` at new `,` at `);return e.displayName&&u.includes(`<anonymous>`)&&(u=u.replace(`<anonymous>`,e.displayName)),u}while(1<=r&&0<=i);break}}}finally{De=!1,Error.prepareStackTrace=n}return(n=e?e.displayName||e.name:``)?Ee(n):``}function ke(e,t){switch(e.tag){case 26:case 27:case 5:return Ee(e.type);case 16:return Ee(`Lazy`);case 13:return e.child!==t&&t!==null?Ee(`Suspense Fallback`):Ee(`Suspense`);case 19:return Ee(`SuspenseList`);case 0:case 15:return Oe(e.type,!1);case 11:return Oe(e.type.render,!1);case 1:return Oe(e.type,!0);case 31:return Ee(`Activity`);default:return``}}function Ae(e){try{var t=``,n=null;do t+=ke(e,n),n=e,e=e.return;while(e);return t}catch(e){return`
Error generating stack: `+e.message+`
`+e.stack}}var je=Object.prototype.hasOwnProperty,Me=t.unstable_scheduleCallback,Ne=t.unstable_cancelCallback,Pe=t.unstable_shouldYield,Fe=t.unstable_requestPaint,O=t.unstable_now,Ie=t.unstable_getCurrentPriorityLevel,Le=t.unstable_ImmediatePriority,Re=t.unstable_UserBlockingPriority,ze=t.unstable_NormalPriority,Be=t.unstable_LowPriority,Ve=t.unstable_IdlePriority,He=t.log,Ue=t.unstable_setDisableYieldValue,We=null,Ge=null;function Ke(e){if(typeof He==`function`&&Ue(e),Ge&&typeof Ge.setStrictMode==`function`)try{Ge.setStrictMode(We,e)}catch{}}var qe=Math.clz32?Math.clz32:Xe,Je=Math.log,Ye=Math.LN2;function Xe(e){return e>>>=0,e===0?32:31-(Je(e)/Ye|0)|0}var Ze=256,Qe=262144,$e=4194304;function et(e){var t=e&42;if(t!==0)return t;switch(e&-e){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:return 64;case 128:return 128;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:return e&261888;case 262144:case 524288:case 1048576:case 2097152:return e&3932160;case 4194304:case 8388608:case 16777216:case 33554432:return e&62914560;case 67108864:return 67108864;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 0;default:return e}}function tt(e,t,n){var r=e.pendingLanes;if(r===0)return 0;var i=0,a=e.suspendedLanes,o=e.pingedLanes;e=e.warmLanes;var s=r&134217727;return s===0?(s=r&~a,s===0?o===0?n||(n=r&~e,n!==0&&(i=et(n))):i=et(o):i=et(s)):(r=s&~a,r===0?(o&=s,o===0?n||(n=s&~e,n!==0&&(i=et(n))):i=et(o)):i=et(r)),i===0?0:t!==0&&t!==i&&(t&a)===0&&(a=i&-i,n=t&-t,a>=n||a===32&&n&4194048)?t:i}function nt(e,t){return(e.pendingLanes&~(e.suspendedLanes&~e.pingedLanes)&t)===0}function rt(e,t){switch(e){case 1:case 2:case 4:case 8:case 64:return t+250;case 16:case 32:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t+5e3;case 4194304:case 8388608:case 16777216:case 33554432:return-1;case 67108864:case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function it(){var e=$e;return $e<<=1,!($e&62914560)&&($e=4194304),e}function at(e){for(var t=[],n=0;31>n;n++)t.push(e);return t}function ot(e,t){e.pendingLanes|=t,t!==268435456&&(e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0)}function st(e,t,n,r,i,a){var o=e.pendingLanes;e.pendingLanes=n,e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0,e.expiredLanes&=n,e.entangledLanes&=n,e.errorRecoveryDisabledLanes&=n,e.shellSuspendCounter=0;var s=e.entanglements,c=e.expirationTimes,l=e.hiddenUpdates;for(n=o&~n;0<n;){var u=31-qe(n),d=1<<u;s[u]=0,c[u]=-1;var f=l[u];if(f!==null)for(l[u]=null,u=0;u<f.length;u++){var p=f[u];p!==null&&(p.lane&=-536870913)}n&=~d}r!==0&&ct(e,r,0),a!==0&&i===0&&e.tag!==0&&(e.suspendedLanes|=a&~(o&~t))}function ct(e,t,n){e.pendingLanes|=t,e.suspendedLanes&=~t;var r=31-qe(t);e.entangledLanes|=t,e.entanglements[r]=e.entanglements[r]|1073741824|n&261930}function lt(e,t){var n=e.entangledLanes|=t;for(e=e.entanglements;n;){var r=31-qe(n),i=1<<r;i&t|e[r]&t&&(e[r]|=t),n&=~i}}function ut(e,t){var n=t&-t;return n=n&42?1:dt(n),(n&(e.suspendedLanes|t))===0?n:0}function dt(e){switch(e){case 2:e=1;break;case 8:e=4;break;case 32:e=16;break;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:e=128;break;case 268435456:e=134217728;break;default:e=0}return e}function ft(e){return e&=-e,2<e?8<e?e&134217727?32:268435456:8:2}function pt(){var e=E.p;return e===0?(e=window.event,e===void 0?32:mp(e.type)):e}function mt(e,t){var n=E.p;try{return E.p=e,t()}finally{E.p=n}}var ht=Math.random().toString(36).slice(2),k=`__reactFiber$`+ht,gt=`__reactProps$`+ht,_t=`__reactContainer$`+ht,vt=`__reactEvents$`+ht,yt=`__reactListeners$`+ht,bt=`__reactHandles$`+ht,xt=`__reactResources$`+ht,St=`__reactMarker$`+ht;function Ct(e){delete e[k],delete e[gt],delete e[vt],delete e[yt],delete e[bt]}function wt(e){var t=e[k];if(t)return t;for(var n=e.parentNode;n;){if(t=n[_t]||n[k]){if(n=t.alternate,t.child!==null||n!==null&&n.child!==null)for(e=df(e);e!==null;){if(n=e[k])return n;e=df(e)}return t}e=n,n=e.parentNode}return null}function Tt(e){if(e=e[k]||e[_t]){var t=e.tag;if(t===5||t===6||t===13||t===31||t===26||t===27||t===3)return e}return null}function Et(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e.stateNode;throw Error(i(33))}function Dt(e){var t=e[xt];return t||(t=e[xt]={hoistableStyles:new Map,hoistableScripts:new Map}),t}function A(e){e[St]=!0}var Ot=new Set,kt={};function At(e,t){jt(e,t),jt(e+`Capture`,t)}function jt(e,t){for(kt[e]=t,e=0;e<t.length;e++)Ot.add(t[e])}var Mt=RegExp(`^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$`),Nt={},Pt={};function Ft(e){return je.call(Pt,e)?!0:je.call(Nt,e)?!1:Mt.test(e)?Pt[e]=!0:(Nt[e]=!0,!1)}function It(e,t,n){if(Ft(t)){if(n===null)e.removeAttribute(t);else{switch(typeof n){case`undefined`:case`function`:case`symbol`:e.removeAttribute(t);return;case`boolean`:var r=t.toLowerCase().slice(0,5);if(r!==`data-`&&r!==`aria-`){e.removeAttribute(t);return}}e.setAttribute(t,``+n)}}}function Lt(e,t,n){if(n===null)e.removeAttribute(t);else{switch(typeof n){case`undefined`:case`function`:case`symbol`:case`boolean`:e.removeAttribute(t);return}e.setAttribute(t,``+n)}}function j(e,t,n,r){if(r===null)e.removeAttribute(n);else{switch(typeof r){case`undefined`:case`function`:case`symbol`:case`boolean`:e.removeAttribute(n);return}e.setAttributeNS(t,n,``+r)}}function Rt(e){switch(typeof e){case`bigint`:case`boolean`:case`number`:case`string`:case`undefined`:return e;case`object`:return e;default:return``}}function zt(e){var t=e.type;return(e=e.nodeName)&&e.toLowerCase()===`input`&&(t===`checkbox`||t===`radio`)}function Bt(e,t,n){var r=Object.getOwnPropertyDescriptor(e.constructor.prototype,t);if(!e.hasOwnProperty(t)&&r!==void 0&&typeof r.get==`function`&&typeof r.set==`function`){var i=r.get,a=r.set;return Object.defineProperty(e,t,{configurable:!0,get:function(){return i.call(this)},set:function(e){n=``+e,a.call(this,e)}}),Object.defineProperty(e,t,{enumerable:r.enumerable}),{getValue:function(){return n},setValue:function(e){n=``+e},stopTracking:function(){e._valueTracker=null,delete e[t]}}}}function M(e){if(!e._valueTracker){var t=zt(e)?`checked`:`value`;e._valueTracker=Bt(e,t,``+e[t])}}function Vt(e){if(!e)return!1;var t=e._valueTracker;if(!t)return!0;var n=t.getValue(),r=``;return e&&(r=zt(e)?e.checked?`true`:`false`:e.value),e=r,e!==n&&(t.setValue(e),!0)}function Ht(e){if(e=e||(typeof document<`u`?document:void 0),e===void 0)return null;try{return e.activeElement||e.body}catch{return e.body}}var Ut=/[\n"\\]/g;function Wt(e){return e.replace(Ut,function(e){return`\\`+e.charCodeAt(0).toString(16)+` `})}function N(e,t,n,r,i,a,o,s){e.name=``,o!=null&&typeof o!=`function`&&typeof o!=`symbol`&&typeof o!=`boolean`?e.type=o:e.removeAttribute(`type`),t==null?o!==`submit`&&o!==`reset`||e.removeAttribute(`value`):o===`number`?(t===0&&e.value===``||e.value!=t)&&(e.value=``+Rt(t)):e.value!==``+Rt(t)&&(e.value=``+Rt(t)),t==null?n==null?r!=null&&e.removeAttribute(`value`):Kt(e,o,Rt(n)):Kt(e,o,Rt(t)),i==null&&a!=null&&(e.defaultChecked=!!a),i!=null&&(e.checked=i&&typeof i!=`function`&&typeof i!=`symbol`),s!=null&&typeof s!=`function`&&typeof s!=`symbol`&&typeof s!=`boolean`?e.name=``+Rt(s):e.removeAttribute(`name`)}function Gt(e,t,n,r,i,a,o,s){if(a!=null&&typeof a!=`function`&&typeof a!=`symbol`&&typeof a!=`boolean`&&(e.type=a),t!=null||n!=null){if(!(a!==`submit`&&a!==`reset`||t!=null)){M(e);return}n=n==null?``:``+Rt(n),t=t==null?n:``+Rt(t),s||t===e.value||(e.value=t),e.defaultValue=t}r=r??i,r=typeof r!=`function`&&typeof r!=`symbol`&&!!r,e.checked=s?e.checked:!!r,e.defaultChecked=!!r,o!=null&&typeof o!=`function`&&typeof o!=`symbol`&&typeof o!=`boolean`&&(e.name=o),M(e)}function Kt(e,t,n){t===`number`&&Ht(e.ownerDocument)===e||e.defaultValue===``+n||(e.defaultValue=``+n)}function qt(e,t,n,r){if(e=e.options,t){t={};for(var i=0;i<n.length;i++)t[`$`+n[i]]=!0;for(n=0;n<e.length;n++)i=t.hasOwnProperty(`$`+e[n].value),e[n].selected!==i&&(e[n].selected=i),i&&r&&(e[n].defaultSelected=!0)}else{for(n=``+Rt(n),t=null,i=0;i<e.length;i++){if(e[i].value===n){e[i].selected=!0,r&&(e[i].defaultSelected=!0);return}t!==null||e[i].disabled||(t=e[i])}t!==null&&(t.selected=!0)}}function Jt(e,t,n){if(t!=null&&(t=``+Rt(t),t!==e.value&&(e.value=t),n==null)){e.defaultValue!==t&&(e.defaultValue=t);return}e.defaultValue=n==null?``:``+Rt(n)}function Yt(e,t,n,r){if(t==null){if(r!=null){if(n!=null)throw Error(i(92));if(ue(r)){if(1<r.length)throw Error(i(93));r=r[0]}n=r}n??(n=``),t=n}n=Rt(t),e.defaultValue=n,r=e.textContent,r===n&&r!==``&&r!==null&&(e.value=r),M(e)}function Xt(e,t){if(t){var n=e.firstChild;if(n&&n===e.lastChild&&n.nodeType===3){n.nodeValue=t;return}}e.textContent=t}var Zt=new Set(`animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp`.split(` `));function Qt(e,t,n){var r=t.indexOf(`--`)===0;n==null||typeof n==`boolean`||n===``?r?e.setProperty(t,``):t===`float`?e.cssFloat=``:e[t]=``:r?e.setProperty(t,n):typeof n!=`number`||n===0||Zt.has(t)?t===`float`?e.cssFloat=n:e[t]=(``+n).trim():e[t]=n+`px`}function $t(e,t,n){if(t!=null&&typeof t!=`object`)throw Error(i(62));if(e=e.style,n!=null){for(var r in n)!n.hasOwnProperty(r)||t!=null&&t.hasOwnProperty(r)||(r.indexOf(`--`)===0?e.setProperty(r,``):r===`float`?e.cssFloat=``:e[r]=``);for(var a in t)r=t[a],t.hasOwnProperty(a)&&n[a]!==r&&Qt(e,a,r)}else for(var o in t)t.hasOwnProperty(o)&&Qt(e,o,t[o])}function en(e){if(e.indexOf(`-`)===-1)return!1;switch(e){case`annotation-xml`:case`color-profile`:case`font-face`:case`font-face-src`:case`font-face-uri`:case`font-face-format`:case`font-face-name`:case`missing-glyph`:return!1;default:return!0}}var tn=new Map([[`acceptCharset`,`accept-charset`],[`htmlFor`,`for`],[`httpEquiv`,`http-equiv`],[`crossOrigin`,`crossorigin`],[`accentHeight`,`accent-height`],[`alignmentBaseline`,`alignment-baseline`],[`arabicForm`,`arabic-form`],[`baselineShift`,`baseline-shift`],[`capHeight`,`cap-height`],[`clipPath`,`clip-path`],[`clipRule`,`clip-rule`],[`colorInterpolation`,`color-interpolation`],[`colorInterpolationFilters`,`color-interpolation-filters`],[`colorProfile`,`color-profile`],[`colorRendering`,`color-rendering`],[`dominantBaseline`,`dominant-baseline`],[`enableBackground`,`enable-background`],[`fillOpacity`,`fill-opacity`],[`fillRule`,`fill-rule`],[`floodColor`,`flood-color`],[`floodOpacity`,`flood-opacity`],[`fontFamily`,`font-family`],[`fontSize`,`font-size`],[`fontSizeAdjust`,`font-size-adjust`],[`fontStretch`,`font-stretch`],[`fontStyle`,`font-style`],[`fontVariant`,`font-variant`],[`fontWeight`,`font-weight`],[`glyphName`,`glyph-name`],[`glyphOrientationHorizontal`,`glyph-orientation-horizontal`],[`glyphOrientationVertical`,`glyph-orientation-vertical`],[`horizAdvX`,`horiz-adv-x`],[`horizOriginX`,`horiz-origin-x`],[`imageRendering`,`image-rendering`],[`letterSpacing`,`letter-spacing`],[`lightingColor`,`lighting-color`],[`markerEnd`,`marker-end`],[`markerMid`,`marker-mid`],[`markerStart`,`marker-start`],[`overlinePosition`,`overline-position`],[`overlineThickness`,`overline-thickness`],[`paintOrder`,`paint-order`],[`panose-1`,`panose-1`],[`pointerEvents`,`pointer-events`],[`renderingIntent`,`rendering-intent`],[`shapeRendering`,`shape-rendering`],[`stopColor`,`stop-color`],[`stopOpacity`,`stop-opacity`],[`strikethroughPosition`,`strikethrough-position`],[`strikethroughThickness`,`strikethrough-thickness`],[`strokeDasharray`,`stroke-dasharray`],[`strokeDashoffset`,`stroke-dashoffset`],[`strokeLinecap`,`stroke-linecap`],[`strokeLinejoin`,`stroke-linejoin`],[`strokeMiterlimit`,`stroke-miterlimit`],[`strokeOpacity`,`stroke-opacity`],[`strokeWidth`,`stroke-width`],[`textAnchor`,`text-anchor`],[`textDecoration`,`text-decoration`],[`textRendering`,`text-rendering`],[`transformOrigin`,`transform-origin`],[`underlinePosition`,`underline-position`],[`underlineThickness`,`underline-thickness`],[`unicodeBidi`,`unicode-bidi`],[`unicodeRange`,`unicode-range`],[`unitsPerEm`,`units-per-em`],[`vAlphabetic`,`v-alphabetic`],[`vHanging`,`v-hanging`],[`vIdeographic`,`v-ideographic`],[`vMathematical`,`v-mathematical`],[`vectorEffect`,`vector-effect`],[`vertAdvY`,`vert-adv-y`],[`vertOriginX`,`vert-origin-x`],[`vertOriginY`,`vert-origin-y`],[`wordSpacing`,`word-spacing`],[`writingMode`,`writing-mode`],[`xmlnsXlink`,`xmlns:xlink`],[`xHeight`,`x-height`]]),nn=/^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;function rn(e){return nn.test(``+e)?`javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')`:e}function an(){}var on=null;function sn(e){return e=e.target||e.srcElement||window,e.correspondingUseElement&&(e=e.correspondingUseElement),e.nodeType===3?e.parentNode:e}var cn=null,ln=null;function un(e){var t=Tt(e);if(t&&(e=t.stateNode)){var n=e[gt]||null;a:switch(e=t.stateNode,t.type){case`input`:if(N(e,n.value,n.defaultValue,n.defaultValue,n.checked,n.defaultChecked,n.type,n.name),t=n.name,n.type===`radio`&&t!=null){for(n=e;n.parentNode;)n=n.parentNode;for(n=n.querySelectorAll(`input[name="`+Wt(``+t)+`"][type="radio"]`),t=0;t<n.length;t++){var r=n[t];if(r!==e&&r.form===e.form){var a=r[gt]||null;if(!a)throw Error(i(90));N(r,a.value,a.defaultValue,a.defaultValue,a.checked,a.defaultChecked,a.type,a.name)}}for(t=0;t<n.length;t++)r=n[t],r.form===e.form&&Vt(r)}break a;case`textarea`:Jt(e,n.value,n.defaultValue);break a;case`select`:t=n.value,t!=null&&qt(e,!!n.multiple,t,!1)}}}var dn=!1;function fn(e,t,n){if(dn)return e(t,n);dn=!0;try{return e(t)}finally{if(dn=!1,(cn!==null||ln!==null)&&(bu(),cn&&(t=cn,e=ln,ln=cn=null,un(t),e)))for(t=0;t<e.length;t++)un(e[t])}}function pn(e,t){var n=e.stateNode;if(n===null)return null;var r=n[gt]||null;if(r===null)return null;n=r[t];a:switch(t){case`onClick`:case`onClickCapture`:case`onDoubleClick`:case`onDoubleClickCapture`:case`onMouseDown`:case`onMouseDownCapture`:case`onMouseMove`:case`onMouseMoveCapture`:case`onMouseUp`:case`onMouseUpCapture`:case`onMouseEnter`:(r=!r.disabled)||(e=e.type,r=e!==`button`&&e!==`input`&&e!==`select`&&e!==`textarea`),e=!r;break a;default:e=!1}if(e)return null;if(n&&typeof n!=`function`)throw Error(i(231,t,typeof n));return n}var mn=!(typeof window>`u`||window.document===void 0||window.document.createElement===void 0),P=!1;if(mn)try{var hn={};Object.defineProperty(hn,"passive",{get:function(){P=!0}}),window.addEventListener(`test`,hn,hn),window.removeEventListener(`test`,hn,hn)}catch{P=!1}var gn=null,_n=null,vn=null;function yn(){if(vn)return vn;var e,t=_n,n=t.length,r,i=`value`in gn?gn.value:gn.textContent,a=i.length;for(e=0;e<n&&t[e]===i[e];e++);var o=n-e;for(r=1;r<=o&&t[n-r]===i[a-r];r++);return vn=i.slice(e,1<r?1-r:void 0)}function bn(e){var t=e.keyCode;return`charCode`in e?(e=e.charCode,e===0&&t===13&&(e=13)):e=t,e===10&&(e=13),32<=e||e===13?e:0}function xn(){return!0}function Sn(){return!1}function Cn(e){function t(t,n,r,i,a){for(var o in this._reactName=t,this._targetInst=r,this.type=n,this.nativeEvent=i,this.target=a,this.currentTarget=null,e)e.hasOwnProperty(o)&&(t=e[o],this[o]=t?t(i):i[o]);return this.isDefaultPrevented=(i.defaultPrevented==null?!1===i.returnValue:i.defaultPrevented)?xn:Sn,this.isPropagationStopped=Sn,this}return p(t.prototype,{preventDefault:function(){this.defaultPrevented=!0;var e=this.nativeEvent;e&&(e.preventDefault?e.preventDefault():typeof e.returnValue!=`unknown`&&(e.returnValue=!1),this.isDefaultPrevented=xn)},stopPropagation:function(){var e=this.nativeEvent;e&&(e.stopPropagation?e.stopPropagation():typeof e.cancelBubble!=`unknown`&&(e.cancelBubble=!0),this.isPropagationStopped=xn)},persist:function(){},isPersistent:xn}),t}var wn={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(e){return e.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},Tn=Cn(wn),En=p({},wn,{view:0,detail:0}),Dn=Cn(En),On,kn,An,jn=p({},En,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:Hn,button:0,buttons:0,relatedTarget:function(e){return e.relatedTarget===void 0?e.fromElement===e.srcElement?e.toElement:e.fromElement:e.relatedTarget},movementX:function(e){return`movementX`in e?e.movementX:(e!==An&&(An&&e.type===`mousemove`?(On=e.screenX-An.screenX,kn=e.screenY-An.screenY):kn=On=0,An=e),On)},movementY:function(e){return`movementY`in e?e.movementY:kn}}),Mn=Cn(jn),Nn=Cn(p({},jn,{dataTransfer:0})),Pn=Cn(p({},En,{relatedTarget:0})),Fn=Cn(p({},wn,{animationName:0,elapsedTime:0,pseudoElement:0})),In=Cn(p({},wn,{clipboardData:function(e){return`clipboardData`in e?e.clipboardData:window.clipboardData}})),Ln=Cn(p({},wn,{data:0})),Rn={Esc:`Escape`,Spacebar:` `,Left:`ArrowLeft`,Up:`ArrowUp`,Right:`ArrowRight`,Down:`ArrowDown`,Del:`Delete`,Win:`OS`,Menu:`ContextMenu`,Apps:`ContextMenu`,Scroll:`ScrollLock`,MozPrintableKey:`Unidentified`},zn={8:`Backspace`,9:`Tab`,12:`Clear`,13:`Enter`,16:`Shift`,17:`Control`,18:`Alt`,19:`Pause`,20:`CapsLock`,27:`Escape`,32:` `,33:`PageUp`,34:`PageDown`,35:`End`,36:`Home`,37:`ArrowLeft`,38:`ArrowUp`,39:`ArrowRight`,40:`ArrowDown`,45:`Insert`,46:`Delete`,112:`F1`,113:`F2`,114:`F3`,115:`F4`,116:`F5`,117:`F6`,118:`F7`,119:`F8`,120:`F9`,121:`F10`,122:`F11`,123:`F12`,144:`NumLock`,145:`ScrollLock`,224:`Meta`},Bn={Alt:`altKey`,Control:`ctrlKey`,Meta:`metaKey`,Shift:`shiftKey`};function Vn(e){var t=this.nativeEvent;return t.getModifierState?t.getModifierState(e):(e=Bn[e])?!!t[e]:!1}function Hn(){return Vn}var Un=Cn(p({},En,{key:function(e){if(e.key){var t=Rn[e.key]||e.key;if(t!==`Unidentified`)return t}return e.type===`keypress`?(e=bn(e),e===13?`Enter`:String.fromCharCode(e)):e.type===`keydown`||e.type===`keyup`?zn[e.keyCode]||`Unidentified`:``},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:Hn,charCode:function(e){return e.type===`keypress`?bn(e):0},keyCode:function(e){return e.type===`keydown`||e.type===`keyup`?e.keyCode:0},which:function(e){return e.type===`keypress`?bn(e):e.type===`keydown`||e.type===`keyup`?e.keyCode:0}})),Wn=Cn(p({},jn,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0})),Gn=Cn(p({},En,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:Hn})),Kn=Cn(p({},wn,{propertyName:0,elapsedTime:0,pseudoElement:0})),qn=Cn(p({},jn,{deltaX:function(e){return`deltaX`in e?e.deltaX:`wheelDeltaX`in e?-e.wheelDeltaX:0},deltaY:function(e){return`deltaY`in e?e.deltaY:`wheelDeltaY`in e?-e.wheelDeltaY:`wheelDelta`in e?-e.wheelDelta:0},deltaZ:0,deltaMode:0})),Jn=Cn(p({},wn,{newState:0,oldState:0})),Yn=[9,13,27,32],Xn=mn&&`CompositionEvent`in window,Zn=null;mn&&`documentMode`in document&&(Zn=document.documentMode);var Qn=mn&&`TextEvent`in window&&!Zn,$n=mn&&(!Xn||Zn&&8<Zn&&11>=Zn),er=` `,tr=!1;function nr(e,t){switch(e){case`keyup`:return Yn.indexOf(t.keyCode)!==-1;case`keydown`:return t.keyCode!==229;case`keypress`:case`mousedown`:case`focusout`:return!0;default:return!1}}function rr(e){return e=e.detail,typeof e==`object`&&`data`in e?e.data:null}var ir=!1;function ar(e,t){switch(e){case`compositionend`:return rr(t);case`keypress`:return t.which===32?(tr=!0,er):null;case`textInput`:return e=t.data,e===er&&tr?null:e;default:return null}}function or(e,t){if(ir)return e===`compositionend`||!Xn&&nr(e,t)?(e=yn(),vn=_n=gn=null,ir=!1,e):null;switch(e){case`paste`:return null;case`keypress`:if(!(t.ctrlKey||t.altKey||t.metaKey)||t.ctrlKey&&t.altKey){if(t.char&&1<t.char.length)return t.char;if(t.which)return String.fromCharCode(t.which)}return null;case`compositionend`:return $n&&t.locale!==`ko`?null:t.data;default:return null}}var sr={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function cr(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t===`input`?!!sr[e.type]:t===`textarea`}function lr(e,t,n,r){cn?ln?ln.push(r):ln=[r]:cn=r,t=Ed(t,`onChange`),0<t.length&&(n=new Tn(`onChange`,`change`,null,n,r),e.push({event:n,listeners:t}))}var ur=null,dr=null;function fr(e){yd(e,0)}function pr(e){if(Vt(Et(e)))return e}function mr(e,t){if(e===`change`)return t}var hr=!1;if(mn){var gr;if(mn){var _r=`oninput`in document;if(!_r){var vr=document.createElement(`div`);vr.setAttribute(`oninput`,`return;`),_r=typeof vr.oninput==`function`}gr=_r}else gr=!1;hr=gr&&(!document.documentMode||9<document.documentMode)}function yr(){ur&&(ur.detachEvent(`onpropertychange`,br),dr=ur=null)}function br(e){if(e.propertyName===`value`&&pr(dr)){var t=[];lr(t,dr,e,sn(e)),fn(fr,t)}}function xr(e,t,n){e===`focusin`?(yr(),ur=t,dr=n,ur.attachEvent(`onpropertychange`,br)):e===`focusout`&&yr()}function Sr(e){if(e===`selectionchange`||e===`keyup`||e===`keydown`)return pr(dr)}function Cr(e,t){if(e===`click`)return pr(t)}function wr(e,t){if(e===`input`||e===`change`)return pr(t)}function Tr(e,t){return e===t&&(e!==0||1/e==1/t)||e!==e&&t!==t}var Er=typeof Object.is==`function`?Object.is:Tr;function Dr(e,t){if(Er(e,t))return!0;if(typeof e!=`object`||!e||typeof t!=`object`||!t)return!1;var n=Object.keys(e),r=Object.keys(t);if(n.length!==r.length)return!1;for(r=0;r<n.length;r++){var i=n[r];if(!je.call(t,i)||!Er(e[i],t[i]))return!1}return!0}function Or(e){for(;e&&e.firstChild;)e=e.firstChild;return e}function kr(e,t){var n=Or(e);e=0;for(var r;n;){if(n.nodeType===3){if(r=e+n.textContent.length,e<=t&&r>=t)return{node:n,offset:t-e};e=r}a:{for(;n;){if(n.nextSibling){n=n.nextSibling;break a}n=n.parentNode}n=void 0}n=Or(n)}}function Ar(e,t){return e&&t?e===t?!0:e&&e.nodeType===3?!1:t&&t.nodeType===3?Ar(e,t.parentNode):`contains`in e?e.contains(t):e.compareDocumentPosition?!!(e.compareDocumentPosition(t)&16):!1:!1}function jr(e){e=e!=null&&e.ownerDocument!=null&&e.ownerDocument.defaultView!=null?e.ownerDocument.defaultView:window;for(var t=Ht(e.document);t instanceof e.HTMLIFrameElement;){try{var n=typeof t.contentWindow.location.href==`string`}catch{n=!1}if(n)e=t.contentWindow;else break;t=Ht(e.document)}return t}function Mr(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t&&(t===`input`&&(e.type===`text`||e.type===`search`||e.type===`tel`||e.type===`url`||e.type===`password`)||t===`textarea`||e.contentEditable===`true`)}var Nr=mn&&`documentMode`in document&&11>=document.documentMode,Pr=null,Fr=null,Ir=null,Lr=!1;function Rr(e,t,n){var r=n.window===n?n.document:n.nodeType===9?n:n.ownerDocument;Lr||Pr==null||Pr!==Ht(r)||(r=Pr,`selectionStart`in r&&Mr(r)?r={start:r.selectionStart,end:r.selectionEnd}:(r=(r.ownerDocument&&r.ownerDocument.defaultView||window).getSelection(),r={anchorNode:r.anchorNode,anchorOffset:r.anchorOffset,focusNode:r.focusNode,focusOffset:r.focusOffset}),Ir&&Dr(Ir,r)||(Ir=r,r=Ed(Fr,`onSelect`),0<r.length&&(t=new Tn(`onSelect`,`select`,null,t,n),e.push({event:t,listeners:r}),t.target=Pr)))}function zr(e,t){var n={};return n[e.toLowerCase()]=t.toLowerCase(),n[`Webkit`+e]=`webkit`+t,n[`Moz`+e]=`moz`+t,n}var Br={animationend:zr(`Animation`,`AnimationEnd`),animationiteration:zr(`Animation`,`AnimationIteration`),animationstart:zr(`Animation`,`AnimationStart`),transitionrun:zr(`Transition`,`TransitionRun`),transitionstart:zr(`Transition`,`TransitionStart`),transitioncancel:zr(`Transition`,`TransitionCancel`),transitionend:zr(`Transition`,`TransitionEnd`)},Vr={},Hr={};mn&&(Hr=document.createElement(`div`).style,`AnimationEvent`in window||(delete Br.animationend.animation,delete Br.animationiteration.animation,delete Br.animationstart.animation),`TransitionEvent`in window||delete Br.transitionend.transition);function Ur(e){if(Vr[e])return Vr[e];if(!Br[e])return e;var t=Br[e],n;for(n in t)if(t.hasOwnProperty(n)&&n in Hr)return Vr[e]=t[n];return e}var Wr=Ur(`animationend`),Gr=Ur(`animationiteration`),Kr=Ur(`animationstart`),qr=Ur(`transitionrun`),Jr=Ur(`transitionstart`),Yr=Ur(`transitioncancel`),Xr=Ur(`transitionend`),Zr=new Map,Qr=`abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel`.split(` `);Qr.push(`scrollEnd`);function $r(e,t){Zr.set(e,t),At(t,[e])}var ei=typeof reportError==`function`?reportError:function(e){if(typeof window==`object`&&typeof window.ErrorEvent==`function`){var t=new window.ErrorEvent(`error`,{bubbles:!0,cancelable:!0,message:typeof e==`object`&&e&&typeof e.message==`string`?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process==`object`&&typeof process.emit==`function`){process.emit(`uncaughtException`,e);return}console.error(e)},ti=[],ni=0,ri=0;function ii(){for(var e=ni,t=ri=ni=0;t<e;){var n=ti[t];ti[t++]=null;var r=ti[t];ti[t++]=null;var i=ti[t];ti[t++]=null;var a=ti[t];if(ti[t++]=null,r!==null&&i!==null){var o=r.pending;o===null?i.next=i:(i.next=o.next,o.next=i),r.pending=i}a!==0&&ci(n,i,a)}}function ai(e,t,n,r){ti[ni++]=e,ti[ni++]=t,ti[ni++]=n,ti[ni++]=r,ri|=r,e.lanes|=r,e=e.alternate,e!==null&&(e.lanes|=r)}function oi(e,t,n,r){return ai(e,t,n,r),li(e)}function si(e,t){return ai(e,null,null,t),li(e)}function ci(e,t,n){e.lanes|=n;var r=e.alternate;r!==null&&(r.lanes|=n);for(var i=!1,a=e.return;a!==null;)a.childLanes|=n,r=a.alternate,r!==null&&(r.childLanes|=n),a.tag===22&&(e=a.stateNode,e===null||e._visibility&1||(i=!0)),e=a,a=a.return;return e.tag===3?(a=e.stateNode,i&&t!==null&&(i=31-qe(n),e=a.hiddenUpdates,r=e[i],r===null?e[i]=[t]:r.push(t),t.lane=n|536870912),a):null}function li(e){if(50<du)throw du=0,fu=null,Error(i(185));for(var t=e.return;t!==null;)e=t,t=e.return;return e.tag===3?e.stateNode:null}var ui={};function di(e,t,n,r){this.tag=e,this.key=n,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.refCleanup=this.ref=null,this.pendingProps=t,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=r,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function fi(e,t,n,r){return new di(e,t,n,r)}function pi(e){return e=e.prototype,!(!e||!e.isReactComponent)}function mi(e,t){var n=e.alternate;return n===null?(n=fi(e.tag,t,e.key,e.mode),n.elementType=e.elementType,n.type=e.type,n.stateNode=e.stateNode,n.alternate=e,e.alternate=n):(n.pendingProps=t,n.type=e.type,n.flags=0,n.subtreeFlags=0,n.deletions=null),n.flags=e.flags&65011712,n.childLanes=e.childLanes,n.lanes=e.lanes,n.child=e.child,n.memoizedProps=e.memoizedProps,n.memoizedState=e.memoizedState,n.updateQueue=e.updateQueue,t=e.dependencies,n.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext},n.sibling=e.sibling,n.index=e.index,n.ref=e.ref,n.refCleanup=e.refCleanup,n}function hi(e,t){e.flags&=65011714;var n=e.alternate;return n===null?(e.childLanes=0,e.lanes=t,e.child=null,e.subtreeFlags=0,e.memoizedProps=null,e.memoizedState=null,e.updateQueue=null,e.dependencies=null,e.stateNode=null):(e.childLanes=n.childLanes,e.lanes=n.lanes,e.child=n.child,e.subtreeFlags=0,e.deletions=null,e.memoizedProps=n.memoizedProps,e.memoizedState=n.memoizedState,e.updateQueue=n.updateQueue,e.type=n.type,t=n.dependencies,e.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext}),e}function gi(e,t,n,r,a,o){var s=0;if(r=e,typeof e==`function`)pi(e)&&(s=1);else if(typeof e==`string`)s=Uf(e,n,ge.current)?26:e===`html`||e===`head`||e===`body`?27:5;else a:switch(e){case ie:return e=fi(31,n,t,a),e.elementType=ie,e.lanes=o,e;case y:return _i(n.children,a,o,t);case b:s=8,a|=24;break;case x:return e=fi(12,n,t,a|2),e.elementType=x,e.lanes=o,e;case w:return e=fi(13,n,t,a),e.elementType=w,e.lanes=o,e;case te:return e=fi(19,n,t,a),e.elementType=te,e.lanes=o,e;default:if(typeof e==`object`&&e)switch(e.$$typeof){case S:s=10;break a;case ee:s=9;break a;case C:s=11;break a;case ne:s=14;break a;case re:s=16,r=null;break a}s=29,n=Error(i(130,e===null?`null`:typeof e,``)),r=null}return t=fi(s,n,t,a),t.elementType=e,t.type=r,t.lanes=o,t}function _i(e,t,n,r){return e=fi(7,e,r,t),e.lanes=n,e}function vi(e,t,n){return e=fi(6,e,null,t),e.lanes=n,e}function yi(e){var t=fi(18,null,null,0);return t.stateNode=e,t}function bi(e,t,n){return t=fi(4,e.children===null?[]:e.children,e.key,t),t.lanes=n,t.stateNode={containerInfo:e.containerInfo,pendingChildren:null,implementation:e.implementation},t}var xi=new WeakMap;function Si(e,t){if(typeof e==`object`&&e){var n=xi.get(e);return n===void 0?(t={value:e,source:t,stack:Ae(t)},xi.set(e,t),t):n}return{value:e,source:t,stack:Ae(t)}}var Ci=[],wi=0,Ti=null,Ei=0,Di=[],Oi=0,ki=null,Ai=1,ji=``;function Mi(e,t){Ci[wi++]=Ei,Ci[wi++]=Ti,Ti=e,Ei=t}function Ni(e,t,n){Di[Oi++]=Ai,Di[Oi++]=ji,Di[Oi++]=ki,ki=e;var r=Ai;e=ji;var i=32-qe(r)-1;r&=~(1<<i),n+=1;var a=32-qe(t)+i;if(30<a){var o=i-i%5;a=(r&(1<<o)-1).toString(32),r>>=o,i-=o,Ai=1<<32-qe(t)+i|n<<i|r,ji=a+e}else Ai=1<<a|n<<i|r,ji=e}function Pi(e){e.return!==null&&(Mi(e,1),Ni(e,1,0))}function Fi(e){for(;e===Ti;)Ti=Ci[--wi],Ci[wi]=null,Ei=Ci[--wi],Ci[wi]=null;for(;e===ki;)ki=Di[--Oi],Di[Oi]=null,ji=Di[--Oi],Di[Oi]=null,Ai=Di[--Oi],Di[Oi]=null}function Ii(e,t){Di[Oi++]=Ai,Di[Oi++]=ji,Di[Oi++]=ki,Ai=t.id,ji=t.overflow,ki=e}var Li=null,F=null,I=!1,Ri=null,zi=!1,Bi=Error(i(519));function Vi(e){throw qi(Si(Error(i(418,1<arguments.length&&arguments[1]!==void 0&&arguments[1]?`text`:`HTML`,``)),e)),Bi}function Hi(e){var t=e.stateNode,n=e.type,r=e.memoizedProps;switch(t[k]=e,t[gt]=r,n){case`dialog`:Q(`cancel`,t),Q(`close`,t);break;case`iframe`:case`object`:case`embed`:Q(`load`,t);break;case`video`:case`audio`:for(n=0;n<_d.length;n++)Q(_d[n],t);break;case`source`:Q(`error`,t);break;case`img`:case`image`:case`link`:Q(`error`,t),Q(`load`,t);break;case`details`:Q(`toggle`,t);break;case`input`:Q(`invalid`,t),Gt(t,r.value,r.defaultValue,r.checked,r.defaultChecked,r.type,r.name,!0);break;case`select`:Q(`invalid`,t);break;case`textarea`:Q(`invalid`,t),Yt(t,r.value,r.defaultValue,r.children)}n=r.children,typeof n!=`string`&&typeof n!=`number`&&typeof n!=`bigint`||t.textContent===``+n||!0===r.suppressHydrationWarning||Md(t.textContent,n)?(r.popover!=null&&(Q(`beforetoggle`,t),Q(`toggle`,t)),r.onScroll!=null&&Q(`scroll`,t),r.onScrollEnd!=null&&Q(`scrollend`,t),r.onClick!=null&&(t.onclick=an),t=!0):t=!1,t||Vi(e,!0)}function Ui(e){for(Li=e.return;Li;)switch(Li.tag){case 5:case 31:case 13:zi=!1;return;case 27:case 3:zi=!0;return;default:Li=Li.return}}function Wi(e){if(e!==Li)return!1;if(!I)return Ui(e),I=!0,!1;var t=e.tag,n;if((n=t!==3&&t!==27)&&((n=t===5)&&(n=e.type,n=n===`form`||n===`button`||Ud(e.type,e.memoizedProps)),n=!n),n&&F&&Vi(e),Ui(e),t===13){if(e=e.memoizedState,e=e===null?null:e.dehydrated,!e)throw Error(i(317));F=uf(e)}else if(t===31){if(e=e.memoizedState,e=e===null?null:e.dehydrated,!e)throw Error(i(317));F=uf(e)}else t===27?(t=F,Zd(e.type)?(e=lf,lf=null,F=e):F=t):F=Li?cf(e.stateNode.nextSibling):null;return!0}function Gi(){F=Li=null,I=!1}function Ki(){var e=Ri;return e!==null&&(Zl===null?Zl=e:Zl.push.apply(Zl,e),Ri=null),e}function qi(e){Ri===null?Ri=[e]:Ri.push(e)}var Ji=me(null),Yi=null,Xi=null;function Zi(e,t,n){D(Ji,t._currentValue),t._currentValue=n}function Qi(e){e._currentValue=Ji.current,he(Ji)}function $i(e,t,n){for(;e!==null;){var r=e.alternate;if((e.childLanes&t)===t?r!==null&&(r.childLanes&t)!==t&&(r.childLanes|=t):(e.childLanes|=t,r!==null&&(r.childLanes|=t)),e===n)break;e=e.return}}function ea(e,t,n,r){var a=e.child;for(a!==null&&(a.return=e);a!==null;){var o=a.dependencies;if(o!==null){var s=a.child;o=o.firstContext;a:for(;o!==null;){var c=o;o=a;for(var l=0;l<t.length;l++)if(c.context===t[l]){o.lanes|=n,c=o.alternate,c!==null&&(c.lanes|=n),$i(o.return,n,e),r||(s=null);break a}o=c.next}}else if(a.tag===18){if(s=a.return,s===null)throw Error(i(341));s.lanes|=n,o=s.alternate,o!==null&&(o.lanes|=n),$i(s,n,e),s=null}else s=a.child;if(s!==null)s.return=a;else for(s=a;s!==null;){if(s===e){s=null;break}if(a=s.sibling,a!==null){a.return=s.return,s=a;break}s=s.return}a=s}}function ta(e,t,n,r){e=null;for(var a=t,o=!1;a!==null;){if(!o){if(a.flags&524288)o=!0;else if(a.flags&262144)break}if(a.tag===10){var s=a.alternate;if(s===null)throw Error(i(387));if(s=s.memoizedProps,s!==null){var c=a.type;Er(a.pendingProps.value,s.value)||(e===null?e=[c]:e.push(c))}}else if(a===ye.current){if(s=a.alternate,s===null)throw Error(i(387));s.memoizedState.memoizedState!==a.memoizedState.memoizedState&&(e===null?e=[Qf]:e.push(Qf))}a=a.return}e!==null&&ea(t,e,n,r),t.flags|=262144}function na(e){for(e=e.firstContext;e!==null;){if(!Er(e.context._currentValue,e.memoizedValue))return!0;e=e.next}return!1}function ra(e){Yi=e,Xi=null,e=e.dependencies,e!==null&&(e.firstContext=null)}function ia(e){return oa(Yi,e)}function aa(e,t){return Yi===null&&ra(e),oa(e,t)}function oa(e,t){var n=t._currentValue;if(t={context:t,memoizedValue:n,next:null},Xi===null){if(e===null)throw Error(i(308));Xi=t,e.dependencies={lanes:0,firstContext:t},e.flags|=524288}else Xi=Xi.next=t;return n}var sa=typeof AbortController<`u`?AbortController:function(){var e=[],t=this.signal={aborted:!1,addEventListener:function(t,n){e.push(n)}};this.abort=function(){t.aborted=!0,e.forEach(function(e){return e()})}},ca=t.unstable_scheduleCallback,la=t.unstable_NormalPriority,L={$$typeof:S,Consumer:null,Provider:null,_currentValue:null,_currentValue2:null,_threadCount:0};function ua(){return{controller:new sa,data:new Map,refCount:0}}function da(e){e.refCount--,e.refCount===0&&ca(la,function(){e.controller.abort()})}var fa=null,pa=0,ma=0,ha=null;function ga(e,t){if(fa===null){var n=fa=[];pa=0,ma=dd(),ha={status:`pending`,value:void 0,then:function(e){n.push(e)}}}return pa++,t.then(_a,_a),t}function _a(){if(--pa===0&&fa!==null){ha!==null&&(ha.status=`fulfilled`);var e=fa;fa=null,ma=0,ha=null;for(var t=0;t<e.length;t++)(0,e[t])()}}function va(e,t){var n=[],r={status:`pending`,value:null,reason:null,then:function(e){n.push(e)}};return e.then(function(){r.status=`fulfilled`,r.value=t;for(var e=0;e<n.length;e++)(0,n[e])(t)},function(e){for(r.status=`rejected`,r.reason=e,e=0;e<n.length;e++)(0,n[e])(void 0)}),r}var ya=T.S;T.S=function(e,t){eu=O(),typeof t==`object`&&t&&typeof t.then==`function`&&ga(e,t),ya!==null&&ya(e,t)};var ba=me(null);function xa(){var e=ba.current;return e===null?K.pooledCache:e}function Sa(e,t){t===null?D(ba,ba.current):D(ba,t.pool)}function Ca(){var e=xa();return e===null?null:{parent:L._currentValue,pool:e}}var wa=Error(i(460)),Ta=Error(i(474)),Ea=Error(i(542)),Da={then:function(){}};function Oa(e){return e=e.status,e===`fulfilled`||e===`rejected`}function ka(e,t,n){switch(n=e[n],n===void 0?e.push(t):n!==t&&(t.then(an,an),t=n),t.status){case`fulfilled`:return t.value;case`rejected`:throw e=t.reason,Na(e),e;default:if(typeof t.status==`string`)t.then(an,an);else{if(e=K,e!==null&&100<e.shellSuspendCounter)throw Error(i(482));e=t,e.status=`pending`,e.then(function(e){if(t.status===`pending`){var n=t;n.status=`fulfilled`,n.value=e}},function(e){if(t.status===`pending`){var n=t;n.status=`rejected`,n.reason=e}})}switch(t.status){case`fulfilled`:return t.value;case`rejected`:throw e=t.reason,Na(e),e}throw ja=t,wa}}function Aa(e){try{var t=e._init;return t(e._payload)}catch(e){throw typeof e==`object`&&e&&typeof e.then==`function`?(ja=e,wa):e}}var ja=null;function Ma(){if(ja===null)throw Error(i(459));var e=ja;return ja=null,e}function Na(e){if(e===wa||e===Ea)throw Error(i(483))}var Pa=null,Fa=0;function Ia(e){var t=Fa;return Fa+=1,Pa===null&&(Pa=[]),ka(Pa,e,t)}function La(e,t){t=t.props.ref,e.ref=t===void 0?null:t}function Ra(e,t){throw t.$$typeof===h?Error(i(525)):(e=Object.prototype.toString.call(t),Error(i(31,e===`[object Object]`?`object with keys {`+Object.keys(t).join(`, `)+`}`:e)))}function za(e){function t(t,n){if(e){var r=t.deletions;r===null?(t.deletions=[n],t.flags|=16):r.push(n)}}function n(n,r){if(!e)return null;for(;r!==null;)t(n,r),r=r.sibling;return null}function r(e){for(var t=new Map;e!==null;)e.key===null?t.set(e.index,e):t.set(e.key,e),e=e.sibling;return t}function a(e,t){return e=mi(e,t),e.index=0,e.sibling=null,e}function o(t,n,r){return t.index=r,e?(r=t.alternate,r===null?(t.flags|=67108866,n):(r=r.index,r<n?(t.flags|=67108866,n):r)):(t.flags|=1048576,n)}function s(t){return e&&t.alternate===null&&(t.flags|=67108866),t}function c(e,t,n,r){return t===null||t.tag!==6?(t=vi(n,e.mode,r),t.return=e,t):(t=a(t,n),t.return=e,t)}function l(e,t,n,r){var i=n.type;return i===y?d(e,t,n.props.children,r,n.key):t!==null&&(t.elementType===i||typeof i==`object`&&i&&i.$$typeof===re&&Aa(i)===t.type)?(t=a(t,n.props),La(t,n),t.return=e,t):(t=gi(n.type,n.key,n.props,null,e.mode,r),La(t,n),t.return=e,t)}function u(e,t,n,r){return t===null||t.tag!==4||t.stateNode.containerInfo!==n.containerInfo||t.stateNode.implementation!==n.implementation?(t=bi(n,e.mode,r),t.return=e,t):(t=a(t,n.children||[]),t.return=e,t)}function d(e,t,n,r,i){return t===null||t.tag!==7?(t=_i(n,e.mode,r,i),t.return=e,t):(t=a(t,n),t.return=e,t)}function f(e,t,n){if(typeof t==`string`&&t!==``||typeof t==`number`||typeof t==`bigint`)return t=vi(``+t,e.mode,n),t.return=e,t;if(typeof t==`object`&&t){switch(t.$$typeof){case _:return n=gi(t.type,t.key,t.props,null,e.mode,n),La(n,t),n.return=e,n;case v:return t=bi(t,e.mode,n),t.return=e,t;case re:return t=Aa(t),f(e,t,n)}if(ue(t)||se(t))return t=_i(t,e.mode,n,null),t.return=e,t;if(typeof t.then==`function`)return f(e,Ia(t),n);if(t.$$typeof===S)return f(e,aa(e,t),n);Ra(e,t)}return null}function p(e,t,n,r){var i=t===null?null:t.key;if(typeof n==`string`&&n!==``||typeof n==`number`||typeof n==`bigint`)return i===null?c(e,t,``+n,r):null;if(typeof n==`object`&&n){switch(n.$$typeof){case _:return n.key===i?l(e,t,n,r):null;case v:return n.key===i?u(e,t,n,r):null;case re:return n=Aa(n),p(e,t,n,r)}if(ue(n)||se(n))return i===null?d(e,t,n,r,null):null;if(typeof n.then==`function`)return p(e,t,Ia(n),r);if(n.$$typeof===S)return p(e,t,aa(e,n),r);Ra(e,n)}return null}function m(e,t,n,r,i){if(typeof r==`string`&&r!==``||typeof r==`number`||typeof r==`bigint`)return e=e.get(n)||null,c(t,e,``+r,i);if(typeof r==`object`&&r){switch(r.$$typeof){case _:return e=e.get(r.key===null?n:r.key)||null,l(t,e,r,i);case v:return e=e.get(r.key===null?n:r.key)||null,u(t,e,r,i);case re:return r=Aa(r),m(e,t,n,r,i)}if(ue(r)||se(r))return e=e.get(n)||null,d(t,e,r,i,null);if(typeof r.then==`function`)return m(e,t,n,Ia(r),i);if(r.$$typeof===S)return m(e,t,n,aa(t,r),i);Ra(t,r)}return null}function h(i,a,s,c){for(var l=null,u=null,d=a,h=a=0,g=null;d!==null&&h<s.length;h++){d.index>h?(g=d,d=null):g=d.sibling;var _=p(i,d,s[h],c);if(_===null){d===null&&(d=g);break}e&&d&&_.alternate===null&&t(i,d),a=o(_,a,h),u===null?l=_:u.sibling=_,u=_,d=g}if(h===s.length)return n(i,d),I&&Mi(i,h),l;if(d===null){for(;h<s.length;h++)d=f(i,s[h],c),d!==null&&(a=o(d,a,h),u===null?l=d:u.sibling=d,u=d);return I&&Mi(i,h),l}for(d=r(d);h<s.length;h++)g=m(d,i,h,s[h],c),g!==null&&(e&&g.alternate!==null&&d.delete(g.key===null?h:g.key),a=o(g,a,h),u===null?l=g:u.sibling=g,u=g);return e&&d.forEach(function(e){return t(i,e)}),I&&Mi(i,h),l}function g(a,s,c,l){if(c==null)throw Error(i(151));for(var u=null,d=null,h=s,g=s=0,_=null,v=c.next();h!==null&&!v.done;g++,v=c.next()){h.index>g?(_=h,h=null):_=h.sibling;var y=p(a,h,v.value,l);if(y===null){h===null&&(h=_);break}e&&h&&y.alternate===null&&t(a,h),s=o(y,s,g),d===null?u=y:d.sibling=y,d=y,h=_}if(v.done)return n(a,h),I&&Mi(a,g),u;if(h===null){for(;!v.done;g++,v=c.next())v=f(a,v.value,l),v!==null&&(s=o(v,s,g),d===null?u=v:d.sibling=v,d=v);return I&&Mi(a,g),u}for(h=r(h);!v.done;g++,v=c.next())v=m(h,a,g,v.value,l),v!==null&&(e&&v.alternate!==null&&h.delete(v.key===null?g:v.key),s=o(v,s,g),d===null?u=v:d.sibling=v,d=v);return e&&h.forEach(function(e){return t(a,e)}),I&&Mi(a,g),u}function b(e,r,o,c){if(typeof o==`object`&&o&&o.type===y&&o.key===null&&(o=o.props.children),typeof o==`object`&&o){switch(o.$$typeof){case _:a:{for(var l=o.key;r!==null;){if(r.key===l){if(l=o.type,l===y){if(r.tag===7){n(e,r.sibling),c=a(r,o.props.children),c.return=e,e=c;break a}}else if(r.elementType===l||typeof l==`object`&&l&&l.$$typeof===re&&Aa(l)===r.type){n(e,r.sibling),c=a(r,o.props),La(c,o),c.return=e,e=c;break a}n(e,r);break}t(e,r),r=r.sibling}o.type===y?(c=_i(o.props.children,e.mode,c,o.key),c.return=e,e=c):(c=gi(o.type,o.key,o.props,null,e.mode,c),La(c,o),c.return=e,e=c)}return s(e);case v:a:{for(l=o.key;r!==null;){if(r.key===l){if(r.tag===4&&r.stateNode.containerInfo===o.containerInfo&&r.stateNode.implementation===o.implementation){n(e,r.sibling),c=a(r,o.children||[]),c.return=e,e=c;break a}n(e,r);break}t(e,r),r=r.sibling}c=bi(o,e.mode,c),c.return=e,e=c}return s(e);case re:return o=Aa(o),b(e,r,o,c)}if(ue(o))return h(e,r,o,c);if(se(o)){if(l=se(o),typeof l!=`function`)throw Error(i(150));return o=l.call(o),g(e,r,o,c)}if(typeof o.then==`function`)return b(e,r,Ia(o),c);if(o.$$typeof===S)return b(e,r,aa(e,o),c);Ra(e,o)}return typeof o==`string`&&o!==``||typeof o==`number`||typeof o==`bigint`?(o=``+o,r!==null&&r.tag===6?(n(e,r.sibling),c=a(r,o),c.return=e,e=c):(n(e,r),c=vi(o,e.mode,c),c.return=e,e=c),s(e)):n(e,r)}return function(e,t,n,r){try{Fa=0;var i=b(e,t,n,r);return Pa=null,i}catch(t){if(t===wa||t===Ea)throw t;var a=fi(29,t,null,e.mode);return a.lanes=r,a.return=e,a}}}var Ba=za(!0),Va=za(!1),Ha=!1;function Ua(e){e.updateQueue={baseState:e.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,lanes:0,hiddenCallbacks:null},callbacks:null}}function Wa(e,t){e=e.updateQueue,t.updateQueue===e&&(t.updateQueue={baseState:e.baseState,firstBaseUpdate:e.firstBaseUpdate,lastBaseUpdate:e.lastBaseUpdate,shared:e.shared,callbacks:null})}function Ga(e){return{lane:e,tag:0,payload:null,callback:null,next:null}}function Ka(e,t,n){var r=e.updateQueue;if(r===null)return null;if(r=r.shared,G&2){var i=r.pending;return i===null?t.next=t:(t.next=i.next,i.next=t),r.pending=t,t=li(e),ci(e,null,n),t}return ai(e,r,t,n),li(e)}function qa(e,t,n){if(t=t.updateQueue,t!==null&&(t=t.shared,n&4194048)){var r=t.lanes;r&=e.pendingLanes,n|=r,t.lanes=n,lt(e,n)}}function Ja(e,t){var n=e.updateQueue,r=e.alternate;if(r!==null&&(r=r.updateQueue,n===r)){var i=null,a=null;if(n=n.firstBaseUpdate,n!==null){do{var o={lane:n.lane,tag:n.tag,payload:n.payload,callback:null,next:null};a===null?i=a=o:a=a.next=o,n=n.next}while(n!==null);a===null?i=a=t:a=a.next=t}else i=a=t;n={baseState:r.baseState,firstBaseUpdate:i,lastBaseUpdate:a,shared:r.shared,callbacks:r.callbacks},e.updateQueue=n;return}e=n.lastBaseUpdate,e===null?n.firstBaseUpdate=t:e.next=t,n.lastBaseUpdate=t}var Ya=!1;function Xa(){if(Ya){var e=ha;if(e!==null)throw e}}function Za(e,t,n,r){Ya=!1;var i=e.updateQueue;Ha=!1;var a=i.firstBaseUpdate,o=i.lastBaseUpdate,s=i.shared.pending;if(s!==null){i.shared.pending=null;var c=s,l=c.next;c.next=null,o===null?a=l:o.next=l,o=c;var u=e.alternate;u!==null&&(u=u.updateQueue,s=u.lastBaseUpdate,s!==o&&(s===null?u.firstBaseUpdate=l:s.next=l,u.lastBaseUpdate=c))}if(a!==null){var d=i.baseState;o=0,u=l=c=null,s=a;do{var f=s.lane&-536870913,m=f!==s.lane;if(m?(J&f)===f:(r&f)===f){f!==0&&f===ma&&(Ya=!0),u!==null&&(u=u.next={lane:0,tag:s.tag,payload:s.payload,callback:null,next:null});a:{var h=e,g=s;f=t;var _=n;switch(g.tag){case 1:if(h=g.payload,typeof h==`function`){d=h.call(_,d,f);break a}d=h;break a;case 3:h.flags=h.flags&-65537|128;case 0:if(h=g.payload,f=typeof h==`function`?h.call(_,d,f):h,f==null)break a;d=p({},d,f);break a;case 2:Ha=!0}}f=s.callback,f!==null&&(e.flags|=64,m&&(e.flags|=8192),m=i.callbacks,m===null?i.callbacks=[f]:m.push(f))}else m={lane:f,tag:s.tag,payload:s.payload,callback:s.callback,next:null},u===null?(l=u=m,c=d):u=u.next=m,o|=f;if(s=s.next,s===null){if(s=i.shared.pending,s===null)break;m=s,s=m.next,m.next=null,i.lastBaseUpdate=m,i.shared.pending=null}}while(1);u===null&&(c=d),i.baseState=c,i.firstBaseUpdate=l,i.lastBaseUpdate=u,a===null&&(i.shared.lanes=0),Gl|=o,e.lanes=o,e.memoizedState=d}}function Qa(e,t){if(typeof e!=`function`)throw Error(i(191,e));e.call(t)}function $a(e,t){var n=e.callbacks;if(n!==null)for(e.callbacks=null,e=0;e<n.length;e++)Qa(n[e],t)}var eo=me(null),to=me(0);function no(e,t){e=Wl,D(to,e),D(eo,t),Wl=e|t.baseLanes}function ro(){D(to,Wl),D(eo,eo.current)}function io(){Wl=to.current,he(eo),he(to)}var ao=me(null),oo=null;function so(e){var t=e.alternate;D(R,R.current&1),D(ao,e),oo===null&&(t===null||eo.current!==null||t.memoizedState!==null)&&(oo=e)}function co(e){D(R,R.current),D(ao,e),oo===null&&(oo=e)}function lo(e){e.tag===22?(D(R,R.current),D(ao,e),oo===null&&(oo=e)):uo(e)}function uo(){D(R,R.current),D(ao,ao.current)}function fo(e){he(ao),oo===e&&(oo=null),he(R)}var R=me(0);function po(e){for(var t=e;t!==null;){if(t.tag===13){var n=t.memoizedState;if(n!==null&&(n=n.dehydrated,n===null||af(n)||of(n)))return t}else if(t.tag===19&&(t.memoizedProps.revealOrder===`forwards`||t.memoizedProps.revealOrder===`backwards`||t.memoizedProps.revealOrder===`unstable_legacy-backwards`||t.memoizedProps.revealOrder===`together`)){if(t.flags&128)return t}else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return null;t=t.return}t.sibling.return=t.return,t=t.sibling}return null}var mo=0,z=null,B=null,ho=null,go=!1,_o=!1,vo=!1,yo=0,bo=0,xo=null,So=0;function V(){throw Error(i(321))}function Co(e,t){if(t===null)return!1;for(var n=0;n<t.length&&n<e.length;n++)if(!Er(e[n],t[n]))return!1;return!0}function wo(e,t,n,r,i,a){return mo=a,z=t,t.memoizedState=null,t.updateQueue=null,t.lanes=0,T.H=e===null||e.memoizedState===null?Bs:Vs,vo=!1,a=n(r,i),vo=!1,_o&&(a=Eo(t,n,r,i)),To(e),a}function To(e){T.H=zs;var t=B!==null&&B.next!==null;if(mo=0,ho=B=z=null,go=!1,bo=0,xo=null,t)throw Error(i(300));e===null||ic||(e=e.dependencies,e!==null&&na(e)&&(ic=!0))}function Eo(e,t,n,r){z=e;var a=0;do{if(_o&&(xo=null),bo=0,_o=!1,25<=a)throw Error(i(301));if(a+=1,ho=B=null,e.updateQueue!=null){var o=e.updateQueue;o.lastEffect=null,o.events=null,o.stores=null,o.memoCache!=null&&(o.memoCache.index=0)}T.H=Hs,o=t(n,r)}while(_o);return o}function Do(){var e=T.H,t=e.useState()[0];return t=typeof t.then==`function`?No(t):t,e=e.useState()[0],(B===null?null:B.memoizedState)!==e&&(z.flags|=1024),t}function Oo(){var e=yo!==0;return yo=0,e}function ko(e,t,n){t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~n}function Ao(e){if(go){for(e=e.memoizedState;e!==null;){var t=e.queue;t!==null&&(t.pending=null),e=e.next}go=!1}mo=0,ho=B=z=null,_o=!1,bo=yo=0,xo=null}function jo(){var e={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return ho===null?z.memoizedState=ho=e:ho=ho.next=e,ho}function H(){if(B===null){var e=z.alternate;e=e===null?null:e.memoizedState}else e=B.next;var t=ho===null?z.memoizedState:ho.next;if(t!==null)ho=t,B=e;else{if(e===null)throw z.alternate===null?Error(i(467)):Error(i(310));B=e,e={memoizedState:B.memoizedState,baseState:B.baseState,baseQueue:B.baseQueue,queue:B.queue,next:null},ho===null?z.memoizedState=ho=e:ho=ho.next=e}return ho}function Mo(){return{lastEffect:null,events:null,stores:null,memoCache:null}}function No(e){var t=bo;return bo+=1,xo===null&&(xo=[]),e=ka(xo,e,t),t=z,(ho===null?t.memoizedState:ho.next)===null&&(t=t.alternate,T.H=t===null||t.memoizedState===null?Bs:Vs),e}function Po(e){if(typeof e==`object`&&e){if(typeof e.then==`function`)return No(e);if(e.$$typeof===S)return ia(e)}throw Error(i(438,String(e)))}function Fo(e){var t=null,n=z.updateQueue;if(n!==null&&(t=n.memoCache),t==null){var r=z.alternate;r!==null&&(r=r.updateQueue,r!==null&&(r=r.memoCache,r!=null&&(t={data:r.data.map(function(e){return e.slice()}),index:0})))}if(t??(t={data:[],index:0}),n===null&&(n=Mo(),z.updateQueue=n),n.memoCache=t,n=t.data[t.index],n===void 0)for(n=t.data[t.index]=Array(e),r=0;r<e;r++)n[r]=ae;return t.index++,n}function Io(e,t){return typeof t==`function`?t(e):t}function Lo(e){return Ro(H(),B,e)}function Ro(e,t,n){var r=e.queue;if(r===null)throw Error(i(311));r.lastRenderedReducer=n;var a=e.baseQueue,o=r.pending;if(o!==null){if(a!==null){var s=a.next;a.next=o.next,o.next=s}t.baseQueue=a=o,r.pending=null}if(o=e.baseState,a===null)e.memoizedState=o;else{t=a.next;var c=s=null,l=null,u=t,d=!1;do{var f=u.lane&-536870913;if(f===u.lane?(mo&f)===f:(J&f)===f){var p=u.revertLane;if(p===0)l!==null&&(l=l.next={lane:0,revertLane:0,gesture:null,action:u.action,hasEagerState:u.hasEagerState,eagerState:u.eagerState,next:null}),f===ma&&(d=!0);else if((mo&p)===p){u=u.next,p===ma&&(d=!0);continue}else f={lane:0,revertLane:u.revertLane,gesture:null,action:u.action,hasEagerState:u.hasEagerState,eagerState:u.eagerState,next:null},l===null?(c=l=f,s=o):l=l.next=f,z.lanes|=p,Gl|=p;f=u.action,vo&&n(o,f),o=u.hasEagerState?u.eagerState:n(o,f)}else p={lane:f,revertLane:u.revertLane,gesture:u.gesture,action:u.action,hasEagerState:u.hasEagerState,eagerState:u.eagerState,next:null},l===null?(c=l=p,s=o):l=l.next=p,z.lanes|=f,Gl|=f;u=u.next}while(u!==null&&u!==t);if(l===null?s=o:l.next=c,!Er(o,e.memoizedState)&&(ic=!0,d&&(n=ha,n!==null)))throw n;e.memoizedState=o,e.baseState=s,e.baseQueue=l,r.lastRenderedState=o}return a===null&&(r.lanes=0),[e.memoizedState,r.dispatch]}function zo(e){var t=H(),n=t.queue;if(n===null)throw Error(i(311));n.lastRenderedReducer=e;var r=n.dispatch,a=n.pending,o=t.memoizedState;if(a!==null){n.pending=null;var s=a=a.next;do o=e(o,s.action),s=s.next;while(s!==a);Er(o,t.memoizedState)||(ic=!0),t.memoizedState=o,t.baseQueue===null&&(t.baseState=o),n.lastRenderedState=o}return[o,r]}function Bo(e,t,n){var r=z,a=H(),o=I;if(o){if(n===void 0)throw Error(i(407));n=n()}else n=t();var s=!Er((B||a).memoizedState,n);if(s&&(a.memoizedState=n,ic=!0),a=a.queue,ds(Uo.bind(null,r,a,e),[e]),a.getSnapshot!==t||s||ho!==null&&ho.memoizedState.tag&1){if(r.flags|=2048,os(9,{destroy:void 0},Ho.bind(null,r,a,n,t),null),K===null)throw Error(i(349));o||mo&127||Vo(r,t,n)}return n}function Vo(e,t,n){e.flags|=16384,e={getSnapshot:t,value:n},t=z.updateQueue,t===null?(t=Mo(),z.updateQueue=t,t.stores=[e]):(n=t.stores,n===null?t.stores=[e]:n.push(e))}function Ho(e,t,n,r){t.value=n,t.getSnapshot=r,Wo(t)&&Go(e)}function Uo(e,t,n){return n(function(){Wo(t)&&Go(e)})}function Wo(e){var t=e.getSnapshot;e=e.value;try{var n=t();return!Er(e,n)}catch{return!0}}function Go(e){var t=si(e,2);t!==null&&hu(t,e,2)}function Ko(e){var t=jo();if(typeof e==`function`){var n=e;if(e=n(),vo){Ke(!0);try{n()}finally{Ke(!1)}}}return t.memoizedState=t.baseState=e,t.queue={pending:null,lanes:0,dispatch:null,lastRenderedReducer:Io,lastRenderedState:e},t}function qo(e,t,n,r){return e.baseState=n,Ro(e,B,typeof r==`function`?r:Io)}function Jo(e,t,n,r,a){if(Is(e))throw Error(i(485));if(e=t.action,e!==null){var o={payload:a,action:e,next:null,isTransition:!0,status:`pending`,value:null,reason:null,listeners:[],then:function(e){o.listeners.push(e)}};T.T===null?o.isTransition=!1:n(!0),r(o),n=t.pending,n===null?(o.next=t.pending=o,Yo(t,o)):(o.next=n.next,t.pending=n.next=o)}}function Yo(e,t){var n=t.action,r=t.payload,i=e.state;if(t.isTransition){var a=T.T,o={};T.T=o;try{var s=n(i,r),c=T.S;c!==null&&c(o,s),Xo(e,t,s)}catch(n){Qo(e,t,n)}finally{a!==null&&o.types!==null&&(a.types=o.types),T.T=a}}else try{a=n(i,r),Xo(e,t,a)}catch(n){Qo(e,t,n)}}function Xo(e,t,n){typeof n==`object`&&n&&typeof n.then==`function`?n.then(function(n){Zo(e,t,n)},function(n){return Qo(e,t,n)}):Zo(e,t,n)}function Zo(e,t,n){t.status=`fulfilled`,t.value=n,$o(t),e.state=n,t=e.pending,t!==null&&(n=t.next,n===t?e.pending=null:(n=n.next,t.next=n,Yo(e,n)))}function Qo(e,t,n){var r=e.pending;if(e.pending=null,r!==null){r=r.next;do t.status=`rejected`,t.reason=n,$o(t),t=t.next;while(t!==r)}e.action=null}function $o(e){e=e.listeners;for(var t=0;t<e.length;t++)(0,e[t])()}function es(e,t){return t}function ts(e,t){if(I){var n=K.formState;if(n!==null){a:{var r=z;if(I){if(F){b:{for(var i=F,a=zi;i.nodeType!==8;){if(!a){i=null;break b}if(i=cf(i.nextSibling),i===null){i=null;break b}}a=i.data,i=a===`F!`||a===`F`?i:null}if(i){F=cf(i.nextSibling),r=i.data===`F!`;break a}}Vi(r)}r=!1}r&&(t=n[0])}}return n=jo(),n.memoizedState=n.baseState=t,r={pending:null,lanes:0,dispatch:null,lastRenderedReducer:es,lastRenderedState:t},n.queue=r,n=Ns.bind(null,z,r),r.dispatch=n,r=Ko(!1),a=Fs.bind(null,z,!1,r.queue),r=jo(),i={state:t,dispatch:null,action:e,pending:null},r.queue=i,n=Jo.bind(null,z,i,a,n),i.dispatch=n,r.memoizedState=e,[t,n,!1]}function ns(e){return rs(H(),B,e)}function rs(e,t,n){if(t=Ro(e,t,es)[0],e=Lo(Io)[0],typeof t==`object`&&t&&typeof t.then==`function`)try{var r=No(t)}catch(e){throw e===wa?Ea:e}else r=t;t=H();var i=t.queue,a=i.dispatch;return n!==t.memoizedState&&(z.flags|=2048,os(9,{destroy:void 0},is.bind(null,i,n),null)),[r,a,e]}function is(e,t){e.action=t}function as(e){var t=H(),n=B;if(n!==null)return rs(t,n,e);H(),t=t.memoizedState,n=H();var r=n.queue.dispatch;return n.memoizedState=e,[t,r,!1]}function os(e,t,n,r){return e={tag:e,create:n,deps:r,inst:t,next:null},t=z.updateQueue,t===null&&(t=Mo(),z.updateQueue=t),n=t.lastEffect,n===null?t.lastEffect=e.next=e:(r=n.next,n.next=e,e.next=r,t.lastEffect=e),e}function ss(){return H().memoizedState}function cs(e,t,n,r){var i=jo();z.flags|=e,i.memoizedState=os(1|t,{destroy:void 0},n,r===void 0?null:r)}function ls(e,t,n,r){var i=H();r=r===void 0?null:r;var a=i.memoizedState.inst;B!==null&&r!==null&&Co(r,B.memoizedState.deps)?i.memoizedState=os(t,a,n,r):(z.flags|=e,i.memoizedState=os(1|t,a,n,r))}function us(e,t){cs(8390656,8,e,t)}function ds(e,t){ls(2048,8,e,t)}function fs(e){z.flags|=4;var t=z.updateQueue;if(t===null)t=Mo(),z.updateQueue=t,t.events=[e];else{var n=t.events;n===null?t.events=[e]:n.push(e)}}function ps(e){var t=H().memoizedState;return fs({ref:t,nextImpl:e}),function(){if(G&2)throw Error(i(440));return t.impl.apply(void 0,arguments)}}function ms(e,t){return ls(4,2,e,t)}function hs(e,t){return ls(4,4,e,t)}function gs(e,t){if(typeof t==`function`){e=e();var n=t(e);return function(){typeof n==`function`?n():t(null)}}if(t!=null)return e=e(),t.current=e,function(){t.current=null}}function _s(e,t,n){n=n==null?null:n.concat([e]),ls(4,4,gs.bind(null,t,e),n)}function vs(){}function ys(e,t){var n=H();t=t===void 0?null:t;var r=n.memoizedState;return t!==null&&Co(t,r[1])?r[0]:(n.memoizedState=[e,t],e)}function bs(e,t){var n=H();t=t===void 0?null:t;var r=n.memoizedState;if(t!==null&&Co(t,r[1]))return r[0];if(r=e(),vo){Ke(!0);try{e()}finally{Ke(!1)}}return n.memoizedState=[r,t],r}function xs(e,t,n){return n===void 0||mo&1073741824&&!(J&261930)?e.memoizedState=t:(e.memoizedState=n,e=mu(),z.lanes|=e,Gl|=e,n)}function Ss(e,t,n,r){return Er(n,t)?n:eo.current===null?!(mo&42)||mo&1073741824&&!(J&261930)?(ic=!0,e.memoizedState=n):(e=mu(),z.lanes|=e,Gl|=e,t):(e=xs(e,n,r),Er(e,t)||(ic=!0),e)}function Cs(e,t,n,r,i){var a=E.p;E.p=a!==0&&8>a?a:8;var o=T.T,s={};T.T=s,Fs(e,!1,t,n);try{var c=i(),l=T.S;l!==null&&l(s,c),typeof c==`object`&&c&&typeof c.then==`function`?Ps(e,t,va(c,r),pu(e)):Ps(e,t,r,pu(e))}catch(n){Ps(e,t,{then:function(){},status:`rejected`,reason:n},pu())}finally{E.p=a,o!==null&&s.types!==null&&(o.types=s.types),T.T=o}}function ws(){}function Ts(e,t,n,r){if(e.tag!==5)throw Error(i(476));var a=Es(e).queue;Cs(e,a,t,de,n===null?ws:function(){return Ds(e),n(r)})}function Es(e){var t=e.memoizedState;if(t!==null)return t;t={memoizedState:de,baseState:de,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:Io,lastRenderedState:de},next:null};var n={};return t.next={memoizedState:n,baseState:n,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:Io,lastRenderedState:n},next:null},e.memoizedState=t,e=e.alternate,e!==null&&(e.memoizedState=t),t}function Ds(e){var t=Es(e);t.next===null&&(t=e.alternate.memoizedState),Ps(e,t.next.queue,{},pu())}function Os(){return ia(Qf)}function ks(){return H().memoizedState}function As(){return H().memoizedState}function js(e){for(var t=e.return;t!==null;){switch(t.tag){case 24:case 3:var n=pu();e=Ga(n);var r=Ka(t,e,n);r!==null&&(hu(r,t,n),qa(r,t,n)),t={cache:ua()},e.payload=t;return}t=t.return}}function Ms(e,t,n){var r=pu();n={lane:r,revertLane:0,gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null},Is(e)?Ls(t,n):(n=oi(e,t,n,r),n!==null&&(hu(n,e,r),Rs(n,t,r)))}function Ns(e,t,n){Ps(e,t,n,pu())}function Ps(e,t,n,r){var i={lane:r,revertLane:0,gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null};if(Is(e))Ls(t,i);else{var a=e.alternate;if(e.lanes===0&&(a===null||a.lanes===0)&&(a=t.lastRenderedReducer,a!==null))try{var o=t.lastRenderedState,s=a(o,n);if(i.hasEagerState=!0,i.eagerState=s,Er(s,o))return ai(e,t,i,0),K===null&&ii(),!1}catch{}if(n=oi(e,t,i,r),n!==null)return hu(n,e,r),Rs(n,t,r),!0}return!1}function Fs(e,t,n,r){if(r={lane:2,revertLane:dd(),gesture:null,action:r,hasEagerState:!1,eagerState:null,next:null},Is(e)){if(t)throw Error(i(479))}else t=oi(e,n,r,2),t!==null&&hu(t,e,2)}function Is(e){var t=e.alternate;return e===z||t!==null&&t===z}function Ls(e,t){_o=go=!0;var n=e.pending;n===null?t.next=t:(t.next=n.next,n.next=t),e.pending=t}function Rs(e,t,n){if(n&4194048){var r=t.lanes;r&=e.pendingLanes,n|=r,t.lanes=n,lt(e,n)}}var zs={readContext:ia,use:Po,useCallback:V,useContext:V,useEffect:V,useImperativeHandle:V,useLayoutEffect:V,useInsertionEffect:V,useMemo:V,useReducer:V,useRef:V,useState:V,useDebugValue:V,useDeferredValue:V,useTransition:V,useSyncExternalStore:V,useId:V,useHostTransitionStatus:V,useFormState:V,useActionState:V,useOptimistic:V,useMemoCache:V,useCacheRefresh:V};zs.useEffectEvent=V;var Bs={readContext:ia,use:Po,useCallback:function(e,t){return jo().memoizedState=[e,t===void 0?null:t],e},useContext:ia,useEffect:us,useImperativeHandle:function(e,t,n){n=n==null?null:n.concat([e]),cs(4194308,4,gs.bind(null,t,e),n)},useLayoutEffect:function(e,t){return cs(4194308,4,e,t)},useInsertionEffect:function(e,t){cs(4,2,e,t)},useMemo:function(e,t){var n=jo();t=t===void 0?null:t;var r=e();if(vo){Ke(!0);try{e()}finally{Ke(!1)}}return n.memoizedState=[r,t],r},useReducer:function(e,t,n){var r=jo();if(n!==void 0){var i=n(t);if(vo){Ke(!0);try{n(t)}finally{Ke(!1)}}}else i=t;return r.memoizedState=r.baseState=i,e={pending:null,lanes:0,dispatch:null,lastRenderedReducer:e,lastRenderedState:i},r.queue=e,e=e.dispatch=Ms.bind(null,z,e),[r.memoizedState,e]},useRef:function(e){var t=jo();return e={current:e},t.memoizedState=e},useState:function(e){e=Ko(e);var t=e.queue,n=Ns.bind(null,z,t);return t.dispatch=n,[e.memoizedState,n]},useDebugValue:vs,useDeferredValue:function(e,t){return xs(jo(),e,t)},useTransition:function(){var e=Ko(!1);return e=Cs.bind(null,z,e.queue,!0,!1),jo().memoizedState=e,[!1,e]},useSyncExternalStore:function(e,t,n){var r=z,a=jo();if(I){if(n===void 0)throw Error(i(407));n=n()}else{if(n=t(),K===null)throw Error(i(349));J&127||Vo(r,t,n)}a.memoizedState=n;var o={value:n,getSnapshot:t};return a.queue=o,us(Uo.bind(null,r,o,e),[e]),r.flags|=2048,os(9,{destroy:void 0},Ho.bind(null,r,o,n,t),null),n},useId:function(){var e=jo(),t=K.identifierPrefix;if(I){var n=ji,r=Ai;n=(r&~(1<<32-qe(r)-1)).toString(32)+n,t=`_`+t+`R_`+n,n=yo++,0<n&&(t+=`H`+n.toString(32)),t+=`_`}else n=So++,t=`_`+t+`r_`+n.toString(32)+`_`;return e.memoizedState=t},useHostTransitionStatus:Os,useFormState:ts,useActionState:ts,useOptimistic:function(e){var t=jo();t.memoizedState=t.baseState=e;var n={pending:null,lanes:0,dispatch:null,lastRenderedReducer:null,lastRenderedState:null};return t.queue=n,t=Fs.bind(null,z,!0,n),n.dispatch=t,[e,t]},useMemoCache:Fo,useCacheRefresh:function(){return jo().memoizedState=js.bind(null,z)},useEffectEvent:function(e){var t=jo(),n={impl:e};return t.memoizedState=n,function(){if(G&2)throw Error(i(440));return n.impl.apply(void 0,arguments)}}},Vs={readContext:ia,use:Po,useCallback:ys,useContext:ia,useEffect:ds,useImperativeHandle:_s,useInsertionEffect:ms,useLayoutEffect:hs,useMemo:bs,useReducer:Lo,useRef:ss,useState:function(){return Lo(Io)},useDebugValue:vs,useDeferredValue:function(e,t){return Ss(H(),B.memoizedState,e,t)},useTransition:function(){var e=Lo(Io)[0],t=H().memoizedState;return[typeof e==`boolean`?e:No(e),t]},useSyncExternalStore:Bo,useId:ks,useHostTransitionStatus:Os,useFormState:ns,useActionState:ns,useOptimistic:function(e,t){return qo(H(),B,e,t)},useMemoCache:Fo,useCacheRefresh:As};Vs.useEffectEvent=ps;var Hs={readContext:ia,use:Po,useCallback:ys,useContext:ia,useEffect:ds,useImperativeHandle:_s,useInsertionEffect:ms,useLayoutEffect:hs,useMemo:bs,useReducer:zo,useRef:ss,useState:function(){return zo(Io)},useDebugValue:vs,useDeferredValue:function(e,t){var n=H();return B===null?xs(n,e,t):Ss(n,B.memoizedState,e,t)},useTransition:function(){var e=zo(Io)[0],t=H().memoizedState;return[typeof e==`boolean`?e:No(e),t]},useSyncExternalStore:Bo,useId:ks,useHostTransitionStatus:Os,useFormState:as,useActionState:as,useOptimistic:function(e,t){var n=H();return B===null?(n.baseState=e,[e,n.queue.dispatch]):qo(n,B,e,t)},useMemoCache:Fo,useCacheRefresh:As};Hs.useEffectEvent=ps;function Us(e,t,n,r){t=e.memoizedState,n=n(r,t),n=n==null?t:p({},t,n),e.memoizedState=n,e.lanes===0&&(e.updateQueue.baseState=n)}var Ws={enqueueSetState:function(e,t,n){e=e._reactInternals;var r=pu(),i=Ga(r);i.payload=t,n!=null&&(i.callback=n),t=Ka(e,i,r),t!==null&&(hu(t,e,r),qa(t,e,r))},enqueueReplaceState:function(e,t,n){e=e._reactInternals;var r=pu(),i=Ga(r);i.tag=1,i.payload=t,n!=null&&(i.callback=n),t=Ka(e,i,r),t!==null&&(hu(t,e,r),qa(t,e,r))},enqueueForceUpdate:function(e,t){e=e._reactInternals;var n=pu(),r=Ga(n);r.tag=2,t!=null&&(r.callback=t),t=Ka(e,r,n),t!==null&&(hu(t,e,n),qa(t,e,n))}};function Gs(e,t,n,r,i,a,o){return e=e.stateNode,typeof e.shouldComponentUpdate==`function`?e.shouldComponentUpdate(r,a,o):t.prototype&&t.prototype.isPureReactComponent?!Dr(n,r)||!Dr(i,a):!0}function Ks(e,t,n,r){e=t.state,typeof t.componentWillReceiveProps==`function`&&t.componentWillReceiveProps(n,r),typeof t.UNSAFE_componentWillReceiveProps==`function`&&t.UNSAFE_componentWillReceiveProps(n,r),t.state!==e&&Ws.enqueueReplaceState(t,t.state,null)}function qs(e,t){var n=t;if(`ref`in t)for(var r in n={},t)r!==`ref`&&(n[r]=t[r]);if(e=e.defaultProps)for(var i in n===t&&(n=p({},n)),e)n[i]===void 0&&(n[i]=e[i]);return n}function Js(e){ei(e)}function Ys(e){console.error(e)}function Xs(e){ei(e)}function Zs(e,t){try{var n=e.onUncaughtError;n(t.value,{componentStack:t.stack})}catch(e){setTimeout(function(){throw e})}}function Qs(e,t,n){try{var r=e.onCaughtError;r(n.value,{componentStack:n.stack,errorBoundary:t.tag===1?t.stateNode:null})}catch(e){setTimeout(function(){throw e})}}function $s(e,t,n){return n=Ga(n),n.tag=3,n.payload={element:null},n.callback=function(){Zs(e,t)},n}function ec(e){return e=Ga(e),e.tag=3,e}function tc(e,t,n,r){var i=n.type.getDerivedStateFromError;if(typeof i==`function`){var a=r.value;e.payload=function(){return i(a)},e.callback=function(){Qs(t,n,r)}}var o=n.stateNode;o!==null&&typeof o.componentDidCatch==`function`&&(e.callback=function(){Qs(t,n,r),typeof i!=`function`&&(ru===null?ru=new Set([this]):ru.add(this));var e=r.stack;this.componentDidCatch(r.value,{componentStack:e===null?``:e})})}function nc(e,t,n,r,a){if(n.flags|=32768,typeof r==`object`&&r&&typeof r.then==`function`){if(t=n.alternate,t!==null&&ta(t,n,a,!0),n=ao.current,n!==null){switch(n.tag){case 31:case 13:return oo===null?Du():n.alternate===null&&X===0&&(X=3),n.flags&=-257,n.flags|=65536,n.lanes=a,r===Da?n.flags|=16384:(t=n.updateQueue,t===null?n.updateQueue=new Set([r]):t.add(r),Gu(e,r,a)),!1;case 22:return n.flags|=65536,r===Da?n.flags|=16384:(t=n.updateQueue,t===null?(t={transitions:null,markerInstances:null,retryQueue:new Set([r])},n.updateQueue=t):(n=t.retryQueue,n===null?t.retryQueue=new Set([r]):n.add(r)),Gu(e,r,a)),!1}throw Error(i(435,n.tag))}return Gu(e,r,a),Du(),!1}if(I)return t=ao.current,t===null?(r!==Bi&&(t=Error(i(423),{cause:r}),qi(Si(t,n))),e=e.current.alternate,e.flags|=65536,a&=-a,e.lanes|=a,r=Si(r,n),a=$s(e.stateNode,r,a),Ja(e,a),X!==4&&(X=2)):(!(t.flags&65536)&&(t.flags|=256),t.flags|=65536,t.lanes=a,r!==Bi&&(e=Error(i(422),{cause:r}),qi(Si(e,n)))),!1;var o=Error(i(520),{cause:r});if(o=Si(o,n),Xl===null?Xl=[o]:Xl.push(o),X!==4&&(X=2),t===null)return!0;r=Si(r,n),n=t;do{switch(n.tag){case 3:return n.flags|=65536,e=a&-a,n.lanes|=e,e=$s(n.stateNode,r,e),Ja(n,e),!1;case 1:if(t=n.type,o=n.stateNode,!(n.flags&128)&&(typeof t.getDerivedStateFromError==`function`||o!==null&&typeof o.componentDidCatch==`function`&&(ru===null||!ru.has(o))))return n.flags|=65536,a&=-a,n.lanes|=a,a=ec(a),tc(a,e,n,r),Ja(n,a),!1}n=n.return}while(n!==null);return!1}var rc=Error(i(461)),ic=!1;function ac(e,t,n,r){t.child=e===null?Va(t,null,n,r):Ba(t,e.child,n,r)}function oc(e,t,n,r,i){n=n.render;var a=t.ref;if(`ref`in r){var o={};for(var s in r)s!==`ref`&&(o[s]=r[s])}else o=r;return ra(t),r=wo(e,t,n,o,a,i),s=Oo(),e!==null&&!ic?(ko(e,t,i),Ac(e,t,i)):(I&&s&&Pi(t),t.flags|=1,ac(e,t,r,i),t.child)}function sc(e,t,n,r,i){if(e===null){var a=n.type;return typeof a==`function`&&!pi(a)&&a.defaultProps===void 0&&n.compare===null?(t.tag=15,t.type=a,cc(e,t,a,r,i)):(e=gi(n.type,null,r,t,t.mode,i),e.ref=t.ref,e.return=t,t.child=e)}if(a=e.child,!jc(e,i)){var o=a.memoizedProps;if(n=n.compare,n=n===null?Dr:n,n(o,r)&&e.ref===t.ref)return Ac(e,t,i)}return t.flags|=1,e=mi(a,r),e.ref=t.ref,e.return=t,t.child=e}function cc(e,t,n,r,i){if(e!==null){var a=e.memoizedProps;if(Dr(a,r)&&e.ref===t.ref){if(ic=!1,t.pendingProps=r=a,jc(e,i))e.flags&131072&&(ic=!0);else return t.lanes=e.lanes,Ac(e,t,i)}}return gc(e,t,n,r,i)}function lc(e,t,n,r){var i=r.children,a=e===null?null:e.memoizedState;if(e===null&&t.stateNode===null&&(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),r.mode===`hidden`){if(t.flags&128){if(a=a===null?n:a.baseLanes|n,e!==null){for(r=t.child=e.child,i=0;r!==null;)i=i|r.lanes|r.childLanes,r=r.sibling;r=i&~a}else r=0,t.child=null;return dc(e,t,a,n,r)}if(n&536870912)t.memoizedState={baseLanes:0,cachePool:null},e!==null&&Sa(t,a===null?null:a.cachePool),a===null?ro():no(t,a),lo(t);else return r=t.lanes=536870912,dc(e,t,a===null?n:a.baseLanes|n,n,r)}else a===null?(e!==null&&Sa(t,null),ro(),uo(t)):(Sa(t,a.cachePool),no(t,a),uo(t),t.memoizedState=null);return ac(e,t,i,n),t.child}function uc(e,t){return e!==null&&e.tag===22||t.stateNode!==null||(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),t.sibling}function dc(e,t,n,r,i){var a=xa();return a=a===null?null:{parent:L._currentValue,pool:a},t.memoizedState={baseLanes:n,cachePool:a},e!==null&&Sa(t,null),ro(),lo(t),e!==null&&ta(e,t,r,!0),t.childLanes=i,null}function fc(e,t){return t=Tc({mode:t.mode,children:t.children},e.mode),t.ref=e.ref,e.child=t,t.return=e,t}function pc(e,t,n){return Ba(t,e.child,null,n),e=fc(t,t.pendingProps),e.flags|=2,fo(t),t.memoizedState=null,e}function mc(e,t,n){var r=t.pendingProps,a=!!(t.flags&128);if(t.flags&=-129,e===null){if(I){if(r.mode===`hidden`)return e=fc(t,r),t.lanes=536870912,uc(null,e);if(co(t),(e=F)?(e=rf(e,zi),e=e!==null&&e.data===`&`?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:ki===null?null:{id:Ai,overflow:ji},retryLane:536870912,hydrationErrors:null},n=yi(e),n.return=t,t.child=n,Li=t,F=null)):e=null,e===null)throw Vi(t);return t.lanes=536870912,null}return fc(t,r)}var o=e.memoizedState;if(o!==null){var s=o.dehydrated;if(co(t),a){if(t.flags&256)t.flags&=-257,t=pc(e,t,n);else if(t.memoizedState!==null)t.child=e.child,t.flags|=128,t=null;else throw Error(i(558))}else if(ic||ta(e,t,n,!1),a=(n&e.childLanes)!==0,ic||a){if(r=K,r!==null&&(s=ut(r,n),s!==0&&s!==o.retryLane))throw o.retryLane=s,si(e,s),hu(r,e,s),rc;Du(),t=pc(e,t,n)}else e=o.treeContext,F=cf(s.nextSibling),Li=t,I=!0,Ri=null,zi=!1,e!==null&&Ii(t,e),t=fc(t,r),t.flags|=4096;return t}return e=mi(e.child,{mode:r.mode,children:r.children}),e.ref=t.ref,t.child=e,e.return=t,e}function hc(e,t){var n=t.ref;if(n===null)e!==null&&e.ref!==null&&(t.flags|=4194816);else{if(typeof n!=`function`&&typeof n!=`object`)throw Error(i(284));(e===null||e.ref!==n)&&(t.flags|=4194816)}}function gc(e,t,n,r,i){return ra(t),n=wo(e,t,n,r,void 0,i),r=Oo(),e!==null&&!ic?(ko(e,t,i),Ac(e,t,i)):(I&&r&&Pi(t),t.flags|=1,ac(e,t,n,i),t.child)}function _c(e,t,n,r,i,a){return ra(t),t.updateQueue=null,n=Eo(t,r,n,i),To(e),r=Oo(),e!==null&&!ic?(ko(e,t,a),Ac(e,t,a)):(I&&r&&Pi(t),t.flags|=1,ac(e,t,n,a),t.child)}function vc(e,t,n,r,i){if(ra(t),t.stateNode===null){var a=ui,o=n.contextType;typeof o==`object`&&o&&(a=ia(o)),a=new n(r,a),t.memoizedState=a.state!==null&&a.state!==void 0?a.state:null,a.updater=Ws,t.stateNode=a,a._reactInternals=t,a=t.stateNode,a.props=r,a.state=t.memoizedState,a.refs={},Ua(t),o=n.contextType,a.context=typeof o==`object`&&o?ia(o):ui,a.state=t.memoizedState,o=n.getDerivedStateFromProps,typeof o==`function`&&(Us(t,n,o,r),a.state=t.memoizedState),typeof n.getDerivedStateFromProps==`function`||typeof a.getSnapshotBeforeUpdate==`function`||typeof a.UNSAFE_componentWillMount!=`function`&&typeof a.componentWillMount!=`function`||(o=a.state,typeof a.componentWillMount==`function`&&a.componentWillMount(),typeof a.UNSAFE_componentWillMount==`function`&&a.UNSAFE_componentWillMount(),o!==a.state&&Ws.enqueueReplaceState(a,a.state,null),Za(t,r,a,i),Xa(),a.state=t.memoizedState),typeof a.componentDidMount==`function`&&(t.flags|=4194308),r=!0}else if(e===null){a=t.stateNode;var s=t.memoizedProps,c=qs(n,s);a.props=c;var l=a.context,u=n.contextType;o=ui,typeof u==`object`&&u&&(o=ia(u));var d=n.getDerivedStateFromProps;u=typeof d==`function`||typeof a.getSnapshotBeforeUpdate==`function`,s=t.pendingProps!==s,u||typeof a.UNSAFE_componentWillReceiveProps!=`function`&&typeof a.componentWillReceiveProps!=`function`||(s||l!==o)&&Ks(t,a,r,o),Ha=!1;var f=t.memoizedState;a.state=f,Za(t,r,a,i),Xa(),l=t.memoizedState,s||f!==l||Ha?(typeof d==`function`&&(Us(t,n,d,r),l=t.memoizedState),(c=Ha||Gs(t,n,c,r,f,l,o))?(u||typeof a.UNSAFE_componentWillMount!=`function`&&typeof a.componentWillMount!=`function`||(typeof a.componentWillMount==`function`&&a.componentWillMount(),typeof a.UNSAFE_componentWillMount==`function`&&a.UNSAFE_componentWillMount()),typeof a.componentDidMount==`function`&&(t.flags|=4194308)):(typeof a.componentDidMount==`function`&&(t.flags|=4194308),t.memoizedProps=r,t.memoizedState=l),a.props=r,a.state=l,a.context=o,r=c):(typeof a.componentDidMount==`function`&&(t.flags|=4194308),r=!1)}else{a=t.stateNode,Wa(e,t),o=t.memoizedProps,u=qs(n,o),a.props=u,d=t.pendingProps,f=a.context,l=n.contextType,c=ui,typeof l==`object`&&l&&(c=ia(l)),s=n.getDerivedStateFromProps,(l=typeof s==`function`||typeof a.getSnapshotBeforeUpdate==`function`)||typeof a.UNSAFE_componentWillReceiveProps!=`function`&&typeof a.componentWillReceiveProps!=`function`||(o!==d||f!==c)&&Ks(t,a,r,c),Ha=!1,f=t.memoizedState,a.state=f,Za(t,r,a,i),Xa();var p=t.memoizedState;o!==d||f!==p||Ha||e!==null&&e.dependencies!==null&&na(e.dependencies)?(typeof s==`function`&&(Us(t,n,s,r),p=t.memoizedState),(u=Ha||Gs(t,n,u,r,f,p,c)||e!==null&&e.dependencies!==null&&na(e.dependencies))?(l||typeof a.UNSAFE_componentWillUpdate!=`function`&&typeof a.componentWillUpdate!=`function`||(typeof a.componentWillUpdate==`function`&&a.componentWillUpdate(r,p,c),typeof a.UNSAFE_componentWillUpdate==`function`&&a.UNSAFE_componentWillUpdate(r,p,c)),typeof a.componentDidUpdate==`function`&&(t.flags|=4),typeof a.getSnapshotBeforeUpdate==`function`&&(t.flags|=1024)):(typeof a.componentDidUpdate!=`function`||o===e.memoizedProps&&f===e.memoizedState||(t.flags|=4),typeof a.getSnapshotBeforeUpdate!=`function`||o===e.memoizedProps&&f===e.memoizedState||(t.flags|=1024),t.memoizedProps=r,t.memoizedState=p),a.props=r,a.state=p,a.context=c,r=u):(typeof a.componentDidUpdate!=`function`||o===e.memoizedProps&&f===e.memoizedState||(t.flags|=4),typeof a.getSnapshotBeforeUpdate!=`function`||o===e.memoizedProps&&f===e.memoizedState||(t.flags|=1024),r=!1)}return a=r,hc(e,t),r=!!(t.flags&128),a||r?(a=t.stateNode,n=r&&typeof n.getDerivedStateFromError!=`function`?null:a.render(),t.flags|=1,e!==null&&r?(t.child=Ba(t,e.child,null,i),t.child=Ba(t,null,n,i)):ac(e,t,n,i),t.memoizedState=a.state,e=t.child):e=Ac(e,t,i),e}function yc(e,t,n,r){return Gi(),t.flags|=256,ac(e,t,n,r),t.child}var bc={dehydrated:null,treeContext:null,retryLane:0,hydrationErrors:null};function xc(e){return{baseLanes:e,cachePool:Ca()}}function Sc(e,t,n){return e=e===null?0:e.childLanes&~n,t&&(e|=Jl),e}function Cc(e,t,n){var r=t.pendingProps,a=!1,o=!!(t.flags&128),s;if((s=o)||(s=e!==null&&e.memoizedState===null?!1:!!(R.current&2)),s&&(a=!0,t.flags&=-129),s=!!(t.flags&32),t.flags&=-33,e===null){if(I){if(a?so(t):uo(t),(e=F)?(e=rf(e,zi),e=e!==null&&e.data!==`&`?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:ki===null?null:{id:Ai,overflow:ji},retryLane:536870912,hydrationErrors:null},n=yi(e),n.return=t,t.child=n,Li=t,F=null)):e=null,e===null)throw Vi(t);return of(e)?t.lanes=32:t.lanes=536870912,null}var c=r.children;return r=r.fallback,a?(uo(t),a=t.mode,c=Tc({mode:`hidden`,children:c},a),r=_i(r,a,n,null),c.return=t,r.return=t,c.sibling=r,t.child=c,r=t.child,r.memoizedState=xc(n),r.childLanes=Sc(e,s,n),t.memoizedState=bc,uc(null,r)):(so(t),wc(t,c))}var l=e.memoizedState;if(l!==null&&(c=l.dehydrated,c!==null)){if(o)t.flags&256?(so(t),t.flags&=-257,t=Ec(e,t,n)):t.memoizedState===null?(uo(t),c=r.fallback,a=t.mode,r=Tc({mode:`visible`,children:r.children},a),c=_i(c,a,n,null),c.flags|=2,r.return=t,c.return=t,r.sibling=c,t.child=r,Ba(t,e.child,null,n),r=t.child,r.memoizedState=xc(n),r.childLanes=Sc(e,s,n),t.memoizedState=bc,t=uc(null,r)):(uo(t),t.child=e.child,t.flags|=128,t=null);else if(so(t),of(c)){if(s=c.nextSibling&&c.nextSibling.dataset,s)var u=s.dgst;s=u,r=Error(i(419)),r.stack=``,r.digest=s,qi({value:r,source:null,stack:null}),t=Ec(e,t,n)}else if(ic||ta(e,t,n,!1),s=(n&e.childLanes)!==0,ic||s){if(s=K,s!==null&&(r=ut(s,n),r!==0&&r!==l.retryLane))throw l.retryLane=r,si(e,r),hu(s,e,r),rc;af(c)||Du(),t=Ec(e,t,n)}else af(c)?(t.flags|=192,t.child=e.child,t=null):(e=l.treeContext,F=cf(c.nextSibling),Li=t,I=!0,Ri=null,zi=!1,e!==null&&Ii(t,e),t=wc(t,r.children),t.flags|=4096);return t}return a?(uo(t),c=r.fallback,a=t.mode,l=e.child,u=l.sibling,r=mi(l,{mode:`hidden`,children:r.children}),r.subtreeFlags=l.subtreeFlags&65011712,u===null?(c=_i(c,a,n,null),c.flags|=2):c=mi(u,c),c.return=t,r.return=t,r.sibling=c,t.child=r,uc(null,r),r=t.child,c=e.child.memoizedState,c===null?c=xc(n):(a=c.cachePool,a===null?a=Ca():(l=L._currentValue,a=a.parent===l?a:{parent:l,pool:l}),c={baseLanes:c.baseLanes|n,cachePool:a}),r.memoizedState=c,r.childLanes=Sc(e,s,n),t.memoizedState=bc,uc(e.child,r)):(so(t),n=e.child,e=n.sibling,n=mi(n,{mode:`visible`,children:r.children}),n.return=t,n.sibling=null,e!==null&&(s=t.deletions,s===null?(t.deletions=[e],t.flags|=16):s.push(e)),t.child=n,t.memoizedState=null,n)}function wc(e,t){return t=Tc({mode:`visible`,children:t},e.mode),t.return=e,e.child=t}function Tc(e,t){return e=fi(22,e,null,t),e.lanes=0,e}function Ec(e,t,n){return Ba(t,e.child,null,n),e=wc(t,t.pendingProps.children),e.flags|=2,t.memoizedState=null,e}function Dc(e,t,n){e.lanes|=t;var r=e.alternate;r!==null&&(r.lanes|=t),$i(e.return,t,n)}function Oc(e,t,n,r,i,a){var o=e.memoizedState;o===null?e.memoizedState={isBackwards:t,rendering:null,renderingStartTime:0,last:r,tail:n,tailMode:i,treeForkCount:a}:(o.isBackwards=t,o.rendering=null,o.renderingStartTime=0,o.last=r,o.tail=n,o.tailMode=i,o.treeForkCount=a)}function kc(e,t,n){var r=t.pendingProps,i=r.revealOrder,a=r.tail;r=r.children;var o=R.current,s=!!(o&2);if(s?(o=o&1|2,t.flags|=128):o&=1,D(R,o),ac(e,t,r,n),r=I?Ei:0,!s&&e!==null&&e.flags&128)a:for(e=t.child;e!==null;){if(e.tag===13)e.memoizedState!==null&&Dc(e,n,t);else if(e.tag===19)Dc(e,n,t);else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break a;for(;e.sibling===null;){if(e.return===null||e.return===t)break a;e=e.return}e.sibling.return=e.return,e=e.sibling}switch(i){case`forwards`:for(n=t.child,i=null;n!==null;)e=n.alternate,e!==null&&po(e)===null&&(i=n),n=n.sibling;n=i,n===null?(i=t.child,t.child=null):(i=n.sibling,n.sibling=null),Oc(t,!1,i,n,a,r);break;case`backwards`:case`unstable_legacy-backwards`:for(n=null,i=t.child,t.child=null;i!==null;){if(e=i.alternate,e!==null&&po(e)===null){t.child=i;break}e=i.sibling,i.sibling=n,n=i,i=e}Oc(t,!0,n,null,a,r);break;case`together`:Oc(t,!1,null,null,void 0,r);break;default:t.memoizedState=null}return t.child}function Ac(e,t,n){if(e!==null&&(t.dependencies=e.dependencies),Gl|=t.lanes,(n&t.childLanes)===0){if(e!==null){if(ta(e,t,n,!1),(n&t.childLanes)===0)return null}else return null}if(e!==null&&t.child!==e.child)throw Error(i(153));if(t.child!==null){for(e=t.child,n=mi(e,e.pendingProps),t.child=n,n.return=t;e.sibling!==null;)e=e.sibling,n=n.sibling=mi(e,e.pendingProps),n.return=t;n.sibling=null}return t.child}function jc(e,t){return(e.lanes&t)!==0||(e=e.dependencies,!!(e!==null&&na(e)))}function Mc(e,t,n){switch(t.tag){case 3:be(t,t.stateNode.containerInfo),Zi(t,L,e.memoizedState.cache),Gi();break;case 27:case 5:Se(t);break;case 4:be(t,t.stateNode.containerInfo);break;case 10:Zi(t,t.type,t.memoizedProps.value);break;case 31:if(t.memoizedState!==null)return t.flags|=128,co(t),null;break;case 13:var r=t.memoizedState;if(r!==null)return r.dehydrated===null?(n&t.child.childLanes)===0?(so(t),e=Ac(e,t,n),e===null?null:e.sibling):Cc(e,t,n):(so(t),t.flags|=128,null);so(t);break;case 19:var i=!!(e.flags&128);if(r=(n&t.childLanes)!==0,r||(ta(e,t,n,!1),r=(n&t.childLanes)!==0),i){if(r)return kc(e,t,n);t.flags|=128}if(i=t.memoizedState,i!==null&&(i.rendering=null,i.tail=null,i.lastEffect=null),D(R,R.current),r)break;return null;case 22:return t.lanes=0,lc(e,t,n,t.pendingProps);case 24:Zi(t,L,e.memoizedState.cache)}return Ac(e,t,n)}function Nc(e,t,n){if(e!==null){if(e.memoizedProps!==t.pendingProps)ic=!0;else{if(!jc(e,n)&&!(t.flags&128))return ic=!1,Mc(e,t,n);ic=!!(e.flags&131072)}}else ic=!1,I&&t.flags&1048576&&Ni(t,Ei,t.index);switch(t.lanes=0,t.tag){case 16:a:{var r=t.pendingProps;if(e=Aa(t.elementType),t.type=e,typeof e==`function`)pi(e)?(r=qs(e,r),t.tag=1,t=vc(null,t,e,r,n)):(t.tag=0,t=gc(null,t,e,r,n));else{if(e!=null){var a=e.$$typeof;if(a===C){t.tag=11,t=oc(null,t,e,r,n);break a}if(a===ne){t.tag=14,t=sc(null,t,e,r,n);break a}}throw t=le(e)||e,Error(i(306,t,``))}}return t;case 0:return gc(e,t,t.type,t.pendingProps,n);case 1:return r=t.type,a=qs(r,t.pendingProps),vc(e,t,r,a,n);case 3:a:{if(be(t,t.stateNode.containerInfo),e===null)throw Error(i(387));r=t.pendingProps;var o=t.memoizedState;a=o.element,Wa(e,t),Za(t,r,null,n);var s=t.memoizedState;if(r=s.cache,Zi(t,L,r),r!==o.cache&&ea(t,[L],n,!0),Xa(),r=s.element,o.isDehydrated){if(o={element:r,isDehydrated:!1,cache:s.cache},t.updateQueue.baseState=o,t.memoizedState=o,t.flags&256){t=yc(e,t,r,n);break a}if(r!==a){a=Si(Error(i(424)),t),qi(a),t=yc(e,t,r,n);break a}switch(e=t.stateNode.containerInfo,e.nodeType){case 9:e=e.body;break;default:e=e.nodeName===`HTML`?e.ownerDocument.body:e}for(F=cf(e.firstChild),Li=t,I=!0,Ri=null,zi=!0,n=Va(t,null,r,n),t.child=n;n;)n.flags=n.flags&-3|4096,n=n.sibling}else{if(Gi(),r===a){t=Ac(e,t,n);break a}ac(e,t,r,n)}t=t.child}return t;case 26:return hc(e,t),e===null?(n=kf(t.type,null,t.pendingProps,null))?t.memoizedState=n:I||(n=t.type,e=t.pendingProps,r=Bd(ve.current).createElement(n),r[k]=t,r[gt]=e,Pd(r,n,e),A(r),t.stateNode=r):t.memoizedState=kf(t.type,e.memoizedProps,t.pendingProps,e.memoizedState),null;case 27:return Se(t),e===null&&I&&(r=t.stateNode=ff(t.type,t.pendingProps,ve.current),Li=t,zi=!0,a=F,Zd(t.type)?(lf=a,F=cf(r.firstChild)):F=a),ac(e,t,t.pendingProps.children,n),hc(e,t),e===null&&(t.flags|=4194304),t.child;case 5:return e===null&&I&&((a=r=F)&&(r=tf(r,t.type,t.pendingProps,zi),r===null?a=!1:(t.stateNode=r,Li=t,F=cf(r.firstChild),zi=!1,a=!0)),a||Vi(t)),Se(t),a=t.type,o=t.pendingProps,s=e===null?null:e.memoizedProps,r=o.children,Ud(a,o)?r=null:s!==null&&Ud(a,s)&&(t.flags|=32),t.memoizedState!==null&&(a=wo(e,t,Do,null,null,n),Qf._currentValue=a),hc(e,t),ac(e,t,r,n),t.child;case 6:return e===null&&I&&((e=n=F)&&(n=nf(n,t.pendingProps,zi),n===null?e=!1:(t.stateNode=n,Li=t,F=null,e=!0)),e||Vi(t)),null;case 13:return Cc(e,t,n);case 4:return be(t,t.stateNode.containerInfo),r=t.pendingProps,e===null?t.child=Ba(t,null,r,n):ac(e,t,r,n),t.child;case 11:return oc(e,t,t.type,t.pendingProps,n);case 7:return ac(e,t,t.pendingProps,n),t.child;case 8:return ac(e,t,t.pendingProps.children,n),t.child;case 12:return ac(e,t,t.pendingProps.children,n),t.child;case 10:return r=t.pendingProps,Zi(t,t.type,r.value),ac(e,t,r.children,n),t.child;case 9:return a=t.type._context,r=t.pendingProps.children,ra(t),a=ia(a),r=r(a),t.flags|=1,ac(e,t,r,n),t.child;case 14:return sc(e,t,t.type,t.pendingProps,n);case 15:return cc(e,t,t.type,t.pendingProps,n);case 19:return kc(e,t,n);case 31:return mc(e,t,n);case 22:return lc(e,t,n,t.pendingProps);case 24:return ra(t),r=ia(L),e===null?(a=xa(),a===null&&(a=K,o=ua(),a.pooledCache=o,o.refCount++,o!==null&&(a.pooledCacheLanes|=n),a=o),t.memoizedState={parent:r,cache:a},Ua(t),Zi(t,L,a)):((e.lanes&n)!==0&&(Wa(e,t),Za(t,null,null,n),Xa()),a=e.memoizedState,o=t.memoizedState,a.parent===r?(r=o.cache,Zi(t,L,r),r!==a.cache&&ea(t,[L],n,!0)):(a={parent:r,cache:r},t.memoizedState=a,t.lanes===0&&(t.memoizedState=t.updateQueue.baseState=a),Zi(t,L,r))),ac(e,t,t.pendingProps.children,n),t.child;case 29:throw t.pendingProps}throw Error(i(156,t.tag))}function Pc(e){e.flags|=4}function Fc(e,t,n,r,i){if((t=!!(e.mode&32))&&(t=!1),t){if(e.flags|=16777216,(i&335544128)===i){if(e.stateNode.complete)e.flags|=8192;else if(wu())e.flags|=8192;else throw ja=Da,Ta}}else e.flags&=-16777217}function Ic(e,t){if(t.type!==`stylesheet`||t.state.loading&4)e.flags&=-16777217;else if(e.flags|=16777216,!Wf(t)){if(wu())e.flags|=8192;else throw ja=Da,Ta}}function Lc(e,t){t!==null&&(e.flags|=4),e.flags&16384&&(t=e.tag===22?536870912:it(),e.lanes|=t,Yl|=t)}function Rc(e,t){if(!I)switch(e.tailMode){case`hidden`:t=e.tail;for(var n=null;t!==null;)t.alternate!==null&&(n=t),t=t.sibling;n===null?e.tail=null:n.sibling=null;break;case`collapsed`:n=e.tail;for(var r=null;n!==null;)n.alternate!==null&&(r=n),n=n.sibling;r===null?t||e.tail===null?e.tail=null:e.tail.sibling=null:r.sibling=null}}function U(e){var t=e.alternate!==null&&e.alternate.child===e.child,n=0,r=0;if(t)for(var i=e.child;i!==null;)n|=i.lanes|i.childLanes,r|=i.subtreeFlags&65011712,r|=i.flags&65011712,i.return=e,i=i.sibling;else for(i=e.child;i!==null;)n|=i.lanes|i.childLanes,r|=i.subtreeFlags,r|=i.flags,i.return=e,i=i.sibling;return e.subtreeFlags|=r,e.childLanes=n,t}function zc(e,t,n){var r=t.pendingProps;switch(Fi(t),t.tag){case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return U(t),null;case 1:return U(t),null;case 3:return n=t.stateNode,r=null,e!==null&&(r=e.memoizedState.cache),t.memoizedState.cache!==r&&(t.flags|=2048),Qi(L),xe(),n.pendingContext&&(n.context=n.pendingContext,n.pendingContext=null),(e===null||e.child===null)&&(Wi(t)?Pc(t):e===null||e.memoizedState.isDehydrated&&!(t.flags&256)||(t.flags|=1024,Ki())),U(t),null;case 26:var a=t.type,o=t.memoizedState;return e===null?(Pc(t),o===null?(U(t),Fc(t,a,null,r,n)):(U(t),Ic(t,o))):o?o===e.memoizedState?(U(t),t.flags&=-16777217):(Pc(t),U(t),Ic(t,o)):(e=e.memoizedProps,e!==r&&Pc(t),U(t),Fc(t,a,e,r,n)),null;case 27:if(Ce(t),n=ve.current,a=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==r&&Pc(t);else{if(!r){if(t.stateNode===null)throw Error(i(166));return U(t),null}e=ge.current,Wi(t)?Hi(t,e):(e=ff(a,r,n),t.stateNode=e,Pc(t))}return U(t),null;case 5:if(Ce(t),a=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==r&&Pc(t);else{if(!r){if(t.stateNode===null)throw Error(i(166));return U(t),null}if(o=ge.current,Wi(t))Hi(t,o);else{var s=Bd(ve.current);switch(o){case 1:o=s.createElementNS(`http://www.w3.org/2000/svg`,a);break;case 2:o=s.createElementNS(`http://www.w3.org/1998/Math/MathML`,a);break;default:switch(a){case`svg`:o=s.createElementNS(`http://www.w3.org/2000/svg`,a);break;case`math`:o=s.createElementNS(`http://www.w3.org/1998/Math/MathML`,a);break;case`script`:o=s.createElement(`div`),o.innerHTML=`<script><\/script>`,o=o.removeChild(o.firstChild);break;case`select`:o=typeof r.is==`string`?s.createElement(`select`,{is:r.is}):s.createElement(`select`),r.multiple?o.multiple=!0:r.size&&(o.size=r.size);break;default:o=typeof r.is==`string`?s.createElement(a,{is:r.is}):s.createElement(a)}}o[k]=t,o[gt]=r;a:for(s=t.child;s!==null;){if(s.tag===5||s.tag===6)o.appendChild(s.stateNode);else if(s.tag!==4&&s.tag!==27&&s.child!==null){s.child.return=s,s=s.child;continue}if(s===t)break a;for(;s.sibling===null;){if(s.return===null||s.return===t)break a;s=s.return}s.sibling.return=s.return,s=s.sibling}t.stateNode=o;a:switch(Pd(o,a,r),a){case`button`:case`input`:case`select`:case`textarea`:r=!!r.autoFocus;break a;case`img`:r=!0;break a;default:r=!1}r&&Pc(t)}}return U(t),Fc(t,t.type,e===null?null:e.memoizedProps,t.pendingProps,n),null;case 6:if(e&&t.stateNode!=null)e.memoizedProps!==r&&Pc(t);else{if(typeof r!=`string`&&t.stateNode===null)throw Error(i(166));if(e=ve.current,Wi(t)){if(e=t.stateNode,n=t.memoizedProps,r=null,a=Li,a!==null)switch(a.tag){case 27:case 5:r=a.memoizedProps}e[k]=t,e=!!(e.nodeValue===n||r!==null&&!0===r.suppressHydrationWarning||Md(e.nodeValue,n)),e||Vi(t,!0)}else e=Bd(e).createTextNode(r),e[k]=t,t.stateNode=e}return U(t),null;case 31:if(n=t.memoizedState,e===null||e.memoizedState!==null){if(r=Wi(t),n!==null){if(e===null){if(!r)throw Error(i(318));if(e=t.memoizedState,e=e===null?null:e.dehydrated,!e)throw Error(i(557));e[k]=t}else Gi(),!(t.flags&128)&&(t.memoizedState=null),t.flags|=4;U(t),e=!1}else n=Ki(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=n),e=!0;if(!e)return t.flags&256?(fo(t),t):(fo(t),null);if(t.flags&128)throw Error(i(558))}return U(t),null;case 13:if(r=t.memoizedState,e===null||e.memoizedState!==null&&e.memoizedState.dehydrated!==null){if(a=Wi(t),r!==null&&r.dehydrated!==null){if(e===null){if(!a)throw Error(i(318));if(a=t.memoizedState,a=a===null?null:a.dehydrated,!a)throw Error(i(317));a[k]=t}else Gi(),!(t.flags&128)&&(t.memoizedState=null),t.flags|=4;U(t),a=!1}else a=Ki(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=a),a=!0;if(!a)return t.flags&256?(fo(t),t):(fo(t),null)}return fo(t),t.flags&128?(t.lanes=n,t):(n=r!==null,e=e!==null&&e.memoizedState!==null,n&&(r=t.child,a=null,r.alternate!==null&&r.alternate.memoizedState!==null&&r.alternate.memoizedState.cachePool!==null&&(a=r.alternate.memoizedState.cachePool.pool),o=null,r.memoizedState!==null&&r.memoizedState.cachePool!==null&&(o=r.memoizedState.cachePool.pool),o!==a&&(r.flags|=2048)),n!==e&&n&&(t.child.flags|=8192),Lc(t,t.updateQueue),U(t),null);case 4:return xe(),e===null&&Sd(t.stateNode.containerInfo),U(t),null;case 10:return Qi(t.type),U(t),null;case 19:if(he(R),r=t.memoizedState,r===null)return U(t),null;if(a=!!(t.flags&128),o=r.rendering,o===null){if(a)Rc(r,!1);else{if(X!==0||e!==null&&e.flags&128)for(e=t.child;e!==null;){if(o=po(e),o!==null){for(t.flags|=128,Rc(r,!1),e=o.updateQueue,t.updateQueue=e,Lc(t,e),t.subtreeFlags=0,e=n,n=t.child;n!==null;)hi(n,e),n=n.sibling;return D(R,R.current&1|2),I&&Mi(t,r.treeForkCount),t.child}e=e.sibling}r.tail!==null&&O()>tu&&(t.flags|=128,a=!0,Rc(r,!1),t.lanes=4194304)}}else{if(!a){if(e=po(o),e!==null){if(t.flags|=128,a=!0,e=e.updateQueue,t.updateQueue=e,Lc(t,e),Rc(r,!0),r.tail===null&&r.tailMode===`hidden`&&!o.alternate&&!I)return U(t),null}else 2*O()-r.renderingStartTime>tu&&n!==536870912&&(t.flags|=128,a=!0,Rc(r,!1),t.lanes=4194304)}r.isBackwards?(o.sibling=t.child,t.child=o):(e=r.last,e===null?t.child=o:e.sibling=o,r.last=o)}return r.tail===null?(U(t),null):(e=r.tail,r.rendering=e,r.tail=e.sibling,r.renderingStartTime=O(),e.sibling=null,n=R.current,D(R,a?n&1|2:n&1),I&&Mi(t,r.treeForkCount),e);case 22:case 23:return fo(t),io(),r=t.memoizedState!==null,e===null?r&&(t.flags|=8192):e.memoizedState!==null!==r&&(t.flags|=8192),r?n&536870912&&!(t.flags&128)&&(U(t),t.subtreeFlags&6&&(t.flags|=8192)):U(t),n=t.updateQueue,n!==null&&Lc(t,n.retryQueue),n=null,e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(n=e.memoizedState.cachePool.pool),r=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(r=t.memoizedState.cachePool.pool),r!==n&&(t.flags|=2048),e!==null&&he(ba),null;case 24:return n=null,e!==null&&(n=e.memoizedState.cache),t.memoizedState.cache!==n&&(t.flags|=2048),Qi(L),U(t),null;case 25:return null;case 30:return null}throw Error(i(156,t.tag))}function Bc(e,t){switch(Fi(t),t.tag){case 1:return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 3:return Qi(L),xe(),e=t.flags,e&65536&&!(e&128)?(t.flags=e&-65537|128,t):null;case 26:case 27:case 5:return Ce(t),null;case 31:if(t.memoizedState!==null){if(fo(t),t.alternate===null)throw Error(i(340));Gi()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 13:if(fo(t),e=t.memoizedState,e!==null&&e.dehydrated!==null){if(t.alternate===null)throw Error(i(340));Gi()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 19:return he(R),null;case 4:return xe(),null;case 10:return Qi(t.type),null;case 22:case 23:return fo(t),io(),e!==null&&he(ba),e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 24:return Qi(L),null;case 25:return null;default:return null}}function Vc(e,t){switch(Fi(t),t.tag){case 3:Qi(L),xe();break;case 26:case 27:case 5:Ce(t);break;case 4:xe();break;case 31:t.memoizedState!==null&&fo(t);break;case 13:fo(t);break;case 19:he(R);break;case 10:Qi(t.type);break;case 22:case 23:fo(t),io(),e!==null&&he(ba);break;case 24:Qi(L)}}function Hc(e,t){try{var n=t.updateQueue,r=n===null?null:n.lastEffect;if(r!==null){var i=r.next;n=i;do{if((n.tag&e)===e){r=void 0;var a=n.create,o=n.inst;r=a(),o.destroy=r}n=n.next}while(n!==i)}}catch(e){Z(t,t.return,e)}}function Uc(e,t,n){try{var r=t.updateQueue,i=r===null?null:r.lastEffect;if(i!==null){var a=i.next;r=a;do{if((r.tag&e)===e){var o=r.inst,s=o.destroy;if(s!==void 0){o.destroy=void 0,i=t;var c=n,l=s;try{l()}catch(e){Z(i,c,e)}}}r=r.next}while(r!==a)}}catch(e){Z(t,t.return,e)}}function Wc(e){var t=e.updateQueue;if(t!==null){var n=e.stateNode;try{$a(t,n)}catch(t){Z(e,e.return,t)}}}function Gc(e,t,n){n.props=qs(e.type,e.memoizedProps),n.state=e.memoizedState;try{n.componentWillUnmount()}catch(n){Z(e,t,n)}}function Kc(e,t){try{var n=e.ref;if(n!==null){switch(e.tag){case 26:case 27:case 5:var r=e.stateNode;break;case 30:r=e.stateNode;break;default:r=e.stateNode}typeof n==`function`?e.refCleanup=n(r):n.current=r}}catch(n){Z(e,t,n)}}function qc(e,t){var n=e.ref,r=e.refCleanup;if(n!==null){if(typeof r==`function`)try{r()}catch(n){Z(e,t,n)}finally{e.refCleanup=null,e=e.alternate,e!=null&&(e.refCleanup=null)}else if(typeof n==`function`)try{n(null)}catch(n){Z(e,t,n)}else n.current=null}}function Jc(e){var t=e.type,n=e.memoizedProps,r=e.stateNode;try{a:switch(t){case`button`:case`input`:case`select`:case`textarea`:n.autoFocus&&r.focus();break a;case`img`:n.src?r.src=n.src:n.srcSet&&(r.srcset=n.srcSet)}}catch(t){Z(e,e.return,t)}}function Yc(e,t,n){try{var r=e.stateNode;Fd(r,e.type,n,t),r[gt]=t}catch(t){Z(e,e.return,t)}}function Xc(e){return e.tag===5||e.tag===3||e.tag===26||e.tag===27&&Zd(e.type)||e.tag===4}function Zc(e){a:for(;;){for(;e.sibling===null;){if(e.return===null||Xc(e.return))return null;e=e.return}for(e.sibling.return=e.return,e=e.sibling;e.tag!==5&&e.tag!==6&&e.tag!==18;){if(e.tag===27&&Zd(e.type)||e.flags&2||e.child===null||e.tag===4)continue a;e.child.return=e,e=e.child}if(!(e.flags&2))return e.stateNode}}function Qc(e,t,n){var r=e.tag;if(r===5||r===6)e=e.stateNode,t?(n.nodeType===9?n.body:n.nodeName===`HTML`?n.ownerDocument.body:n).insertBefore(e,t):(t=n.nodeType===9?n.body:n.nodeName===`HTML`?n.ownerDocument.body:n,t.appendChild(e),n=n._reactRootContainer,n!=null||t.onclick!==null||(t.onclick=an));else if(r!==4&&(r===27&&Zd(e.type)&&(n=e.stateNode,t=null),e=e.child,e!==null))for(Qc(e,t,n),e=e.sibling;e!==null;)Qc(e,t,n),e=e.sibling}function $c(e,t,n){var r=e.tag;if(r===5||r===6)e=e.stateNode,t?n.insertBefore(e,t):n.appendChild(e);else if(r!==4&&(r===27&&Zd(e.type)&&(n=e.stateNode),e=e.child,e!==null))for($c(e,t,n),e=e.sibling;e!==null;)$c(e,t,n),e=e.sibling}function el(e){var t=e.stateNode,n=e.memoizedProps;try{for(var r=e.type,i=t.attributes;i.length;)t.removeAttributeNode(i[0]);Pd(t,r,n),t[k]=e,t[gt]=n}catch(t){Z(e,e.return,t)}}var tl=!1,nl=!1,rl=!1,il=typeof WeakSet==`function`?WeakSet:Set,al=null;function ol(e,t){if(e=e.containerInfo,Rd=sp,e=jr(e),Mr(e)){if(`selectionStart`in e)var n={start:e.selectionStart,end:e.selectionEnd};else a:{n=(n=e.ownerDocument)&&n.defaultView||window;var r=n.getSelection&&n.getSelection();if(r&&r.rangeCount!==0){n=r.anchorNode;var a=r.anchorOffset,o=r.focusNode;r=r.focusOffset;try{n.nodeType,o.nodeType}catch{n=null;break a}var s=0,c=-1,l=-1,u=0,d=0,f=e,p=null;b:for(;;){for(var m;f!==n||a!==0&&f.nodeType!==3||(c=s+a),f!==o||r!==0&&f.nodeType!==3||(l=s+r),f.nodeType===3&&(s+=f.nodeValue.length),(m=f.firstChild)!==null;)p=f,f=m;for(;;){if(f===e)break b;if(p===n&&++u===a&&(c=s),p===o&&++d===r&&(l=s),(m=f.nextSibling)!==null)break;f=p,p=f.parentNode}f=m}n=c===-1||l===-1?null:{start:c,end:l}}else n=null}n=n||{start:0,end:0}}else n=null;for(zd={focusedElem:e,selectionRange:n},sp=!1,al=t;al!==null;)if(t=al,e=t.child,t.subtreeFlags&1028&&e!==null)e.return=t,al=e;else for(;al!==null;){switch(t=al,o=t.alternate,e=t.flags,t.tag){case 0:if(e&4&&(e=t.updateQueue,e=e===null?null:e.events,e!==null))for(n=0;n<e.length;n++)a=e[n],a.ref.impl=a.nextImpl;break;case 11:case 15:break;case 1:if(e&1024&&o!==null){e=void 0,n=t,a=o.memoizedProps,o=o.memoizedState,r=n.stateNode;try{var h=qs(n.type,a);e=r.getSnapshotBeforeUpdate(h,o),r.__reactInternalSnapshotBeforeUpdate=e}catch(e){Z(n,n.return,e)}}break;case 3:if(e&1024){if(e=t.stateNode.containerInfo,n=e.nodeType,n===9)ef(e);else if(n===1)switch(e.nodeName){case`HEAD`:case`HTML`:case`BODY`:ef(e);break;default:e.textContent=``}}break;case 5:case 26:case 27:case 6:case 4:case 17:break;default:if(e&1024)throw Error(i(163))}if(e=t.sibling,e!==null){e.return=t.return,al=e;break}al=t.return}}function sl(e,t,n){var r=n.flags;switch(n.tag){case 0:case 11:case 15:xl(e,n),r&4&&Hc(5,n);break;case 1:if(xl(e,n),r&4){if(e=n.stateNode,t===null)try{e.componentDidMount()}catch(e){Z(n,n.return,e)}else{var i=qs(n.type,t.memoizedProps);t=t.memoizedState;try{e.componentDidUpdate(i,t,e.__reactInternalSnapshotBeforeUpdate)}catch(e){Z(n,n.return,e)}}}r&64&&Wc(n),r&512&&Kc(n,n.return);break;case 3:if(xl(e,n),r&64&&(e=n.updateQueue,e!==null)){if(t=null,n.child!==null)switch(n.child.tag){case 27:case 5:t=n.child.stateNode;break;case 1:t=n.child.stateNode}try{$a(e,t)}catch(e){Z(n,n.return,e)}}break;case 27:t===null&&r&4&&el(n);case 26:case 5:xl(e,n),t===null&&r&4&&Jc(n),r&512&&Kc(n,n.return);break;case 12:xl(e,n);break;case 31:xl(e,n),r&4&&fl(e,n);break;case 13:xl(e,n),r&4&&pl(e,n),r&64&&(e=n.memoizedState,e!==null&&(e=e.dehydrated,e!==null&&(n=Ju.bind(null,n),sf(e,n))));break;case 22:if(r=n.memoizedState!==null||tl,!r){t=t!==null&&t.memoizedState!==null||nl,i=tl;var a=nl;tl=r,(nl=t)&&!a?Cl(e,n,!!(n.subtreeFlags&8772)):xl(e,n),tl=i,nl=a}break;case 30:break;default:xl(e,n)}}function cl(e){var t=e.alternate;t!==null&&(e.alternate=null,cl(t)),e.child=null,e.deletions=null,e.sibling=null,e.tag===5&&(t=e.stateNode,t!==null&&Ct(t)),e.stateNode=null,e.return=null,e.dependencies=null,e.memoizedProps=null,e.memoizedState=null,e.pendingProps=null,e.stateNode=null,e.updateQueue=null}var W=null,ll=!1;function ul(e,t,n){for(n=n.child;n!==null;)dl(e,t,n),n=n.sibling}function dl(e,t,n){if(Ge&&typeof Ge.onCommitFiberUnmount==`function`)try{Ge.onCommitFiberUnmount(We,n)}catch{}switch(n.tag){case 26:nl||qc(n,t),ul(e,t,n),n.memoizedState?n.memoizedState.count--:n.stateNode&&(n=n.stateNode,n.parentNode.removeChild(n));break;case 27:nl||qc(n,t);var r=W,i=ll;Zd(n.type)&&(W=n.stateNode,ll=!1),ul(e,t,n),pf(n.stateNode),W=r,ll=i;break;case 5:nl||qc(n,t);case 6:if(r=W,i=ll,W=null,ul(e,t,n),W=r,ll=i,W!==null){if(ll)try{(W.nodeType===9?W.body:W.nodeName===`HTML`?W.ownerDocument.body:W).removeChild(n.stateNode)}catch(e){Z(n,t,e)}else try{W.removeChild(n.stateNode)}catch(e){Z(n,t,e)}}break;case 18:W!==null&&(ll?(e=W,Qd(e.nodeType===9?e.body:e.nodeName===`HTML`?e.ownerDocument.body:e,n.stateNode),Np(e)):Qd(W,n.stateNode));break;case 4:r=W,i=ll,W=n.stateNode.containerInfo,ll=!0,ul(e,t,n),W=r,ll=i;break;case 0:case 11:case 14:case 15:Uc(2,n,t),nl||Uc(4,n,t),ul(e,t,n);break;case 1:nl||(qc(n,t),r=n.stateNode,typeof r.componentWillUnmount==`function`&&Gc(n,t,r)),ul(e,t,n);break;case 21:ul(e,t,n);break;case 22:nl=(r=nl)||n.memoizedState!==null,ul(e,t,n),nl=r;break;default:ul(e,t,n)}}function fl(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null))){e=e.dehydrated;try{Np(e)}catch(e){Z(t,t.return,e)}}}function pl(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null&&(e=e.dehydrated,e!==null))))try{Np(e)}catch(e){Z(t,t.return,e)}}function ml(e){switch(e.tag){case 31:case 13:case 19:var t=e.stateNode;return t===null&&(t=e.stateNode=new il),t;case 22:return e=e.stateNode,t=e._retryCache,t===null&&(t=e._retryCache=new il),t;default:throw Error(i(435,e.tag))}}function hl(e,t){var n=ml(e);t.forEach(function(t){if(!n.has(t)){n.add(t);var r=Yu.bind(null,e,t);t.then(r,r)}})}function gl(e,t){var n=t.deletions;if(n!==null)for(var r=0;r<n.length;r++){var a=n[r],o=e,s=t,c=s;a:for(;c!==null;){switch(c.tag){case 27:if(Zd(c.type)){W=c.stateNode,ll=!1;break a}break;case 5:W=c.stateNode,ll=!1;break a;case 3:case 4:W=c.stateNode.containerInfo,ll=!0;break a}c=c.return}if(W===null)throw Error(i(160));dl(o,s,a),W=null,ll=!1,o=a.alternate,o!==null&&(o.return=null),a.return=null}if(t.subtreeFlags&13886)for(t=t.child;t!==null;)vl(t,e),t=t.sibling}var _l=null;function vl(e,t){var n=e.alternate,r=e.flags;switch(e.tag){case 0:case 11:case 14:case 15:gl(t,e),yl(e),r&4&&(Uc(3,e,e.return),Hc(3,e),Uc(5,e,e.return));break;case 1:gl(t,e),yl(e),r&512&&(nl||n===null||qc(n,n.return)),r&64&&tl&&(e=e.updateQueue,e!==null&&(r=e.callbacks,r!==null&&(n=e.shared.hiddenCallbacks,e.shared.hiddenCallbacks=n===null?r:n.concat(r))));break;case 26:var a=_l;if(gl(t,e),yl(e),r&512&&(nl||n===null||qc(n,n.return)),r&4){var o=n===null?null:n.memoizedState;if(r=e.memoizedState,n===null){if(r===null){if(e.stateNode===null){a:{r=e.type,n=e.memoizedProps,a=a.ownerDocument||a;b:switch(r){case`title`:o=a.getElementsByTagName(`title`)[0],(!o||o[St]||o[k]||o.namespaceURI===`http://www.w3.org/2000/svg`||o.hasAttribute(`itemprop`))&&(o=a.createElement(r),a.head.insertBefore(o,a.querySelector(`head > title`))),Pd(o,r,n),o[k]=e,A(o),r=o;break a;case`link`:var s=Vf(`link`,`href`,a).get(r+(n.href||``));if(s){for(var c=0;c<s.length;c++)if(o=s[c],o.getAttribute(`href`)===(n.href==null||n.href===``?null:n.href)&&o.getAttribute(`rel`)===(n.rel==null?null:n.rel)&&o.getAttribute(`title`)===(n.title==null?null:n.title)&&o.getAttribute(`crossorigin`)===(n.crossOrigin==null?null:n.crossOrigin)){s.splice(c,1);break b}}o=a.createElement(r),Pd(o,r,n),a.head.appendChild(o);break;case`meta`:if(s=Vf(`meta`,`content`,a).get(r+(n.content||``))){for(c=0;c<s.length;c++)if(o=s[c],o.getAttribute(`content`)===(n.content==null?null:``+n.content)&&o.getAttribute(`name`)===(n.name==null?null:n.name)&&o.getAttribute(`property`)===(n.property==null?null:n.property)&&o.getAttribute(`http-equiv`)===(n.httpEquiv==null?null:n.httpEquiv)&&o.getAttribute(`charset`)===(n.charSet==null?null:n.charSet)){s.splice(c,1);break b}}o=a.createElement(r),Pd(o,r,n),a.head.appendChild(o);break;default:throw Error(i(468,r))}o[k]=e,A(o),r=o}e.stateNode=r}else Hf(a,e.type,e.stateNode)}else e.stateNode=If(a,r,e.memoizedProps)}else o===r?r===null&&e.stateNode!==null&&Yc(e,e.memoizedProps,n.memoizedProps):(o===null?n.stateNode!==null&&(n=n.stateNode,n.parentNode.removeChild(n)):o.count--,r===null?Hf(a,e.type,e.stateNode):If(a,r,e.memoizedProps))}break;case 27:gl(t,e),yl(e),r&512&&(nl||n===null||qc(n,n.return)),n!==null&&r&4&&Yc(e,e.memoizedProps,n.memoizedProps);break;case 5:if(gl(t,e),yl(e),r&512&&(nl||n===null||qc(n,n.return)),e.flags&32){a=e.stateNode;try{Xt(a,``)}catch(t){Z(e,e.return,t)}}r&4&&e.stateNode!=null&&(a=e.memoizedProps,Yc(e,a,n===null?a:n.memoizedProps)),r&1024&&(rl=!0);break;case 6:if(gl(t,e),yl(e),r&4){if(e.stateNode===null)throw Error(i(162));r=e.memoizedProps,n=e.stateNode;try{n.nodeValue=r}catch(t){Z(e,e.return,t)}}break;case 3:if(Bf=null,a=_l,_l=gf(t.containerInfo),gl(t,e),_l=a,yl(e),r&4&&n!==null&&n.memoizedState.isDehydrated)try{Np(t.containerInfo)}catch(t){Z(e,e.return,t)}rl&&(rl=!1,bl(e));break;case 4:r=_l,_l=gf(e.stateNode.containerInfo),gl(t,e),yl(e),_l=r;break;case 12:gl(t,e),yl(e);break;case 31:gl(t,e),yl(e),r&4&&(r=e.updateQueue,r!==null&&(e.updateQueue=null,hl(e,r)));break;case 13:gl(t,e),yl(e),e.child.flags&8192&&e.memoizedState!==null!=(n!==null&&n.memoizedState!==null)&&($l=O()),r&4&&(r=e.updateQueue,r!==null&&(e.updateQueue=null,hl(e,r)));break;case 22:a=e.memoizedState!==null;var l=n!==null&&n.memoizedState!==null,u=tl,d=nl;if(tl=u||a,nl=d||l,gl(t,e),nl=d,tl=u,yl(e),r&8192)a:for(t=e.stateNode,t._visibility=a?t._visibility&-2:t._visibility|1,a&&(n===null||l||tl||nl||Sl(e)),n=null,t=e;;){if(t.tag===5||t.tag===26){if(n===null){l=n=t;try{if(o=l.stateNode,a)s=o.style,typeof s.setProperty==`function`?s.setProperty(`display`,`none`,`important`):s.display=`none`;else{c=l.stateNode;var f=l.memoizedProps.style,p=f!=null&&f.hasOwnProperty(`display`)?f.display:null;c.style.display=p==null||typeof p==`boolean`?``:(``+p).trim()}}catch(e){Z(l,l.return,e)}}}else if(t.tag===6){if(n===null){l=t;try{l.stateNode.nodeValue=a?``:l.memoizedProps}catch(e){Z(l,l.return,e)}}}else if(t.tag===18){if(n===null){l=t;try{var m=l.stateNode;a?$d(m,!0):$d(l.stateNode,!1)}catch(e){Z(l,l.return,e)}}}else if((t.tag!==22&&t.tag!==23||t.memoizedState===null||t===e)&&t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break a;for(;t.sibling===null;){if(t.return===null||t.return===e)break a;n===t&&(n=null),t=t.return}n===t&&(n=null),t.sibling.return=t.return,t=t.sibling}r&4&&(r=e.updateQueue,r!==null&&(n=r.retryQueue,n!==null&&(r.retryQueue=null,hl(e,n))));break;case 19:gl(t,e),yl(e),r&4&&(r=e.updateQueue,r!==null&&(e.updateQueue=null,hl(e,r)));break;case 30:break;case 21:break;default:gl(t,e),yl(e)}}function yl(e){var t=e.flags;if(t&2){try{for(var n,r=e.return;r!==null;){if(Xc(r)){n=r;break}r=r.return}if(n==null)throw Error(i(160));switch(n.tag){case 27:var a=n.stateNode;$c(e,Zc(e),a);break;case 5:var o=n.stateNode;n.flags&32&&(Xt(o,``),n.flags&=-33),$c(e,Zc(e),o);break;case 3:case 4:var s=n.stateNode.containerInfo;Qc(e,Zc(e),s);break;default:throw Error(i(161))}}catch(t){Z(e,e.return,t)}e.flags&=-3}t&4096&&(e.flags&=-4097)}function bl(e){if(e.subtreeFlags&1024)for(e=e.child;e!==null;){var t=e;bl(t),t.tag===5&&t.flags&1024&&t.stateNode.reset(),e=e.sibling}}function xl(e,t){if(t.subtreeFlags&8772)for(t=t.child;t!==null;)sl(e,t.alternate,t),t=t.sibling}function Sl(e){for(e=e.child;e!==null;){var t=e;switch(t.tag){case 0:case 11:case 14:case 15:Uc(4,t,t.return),Sl(t);break;case 1:qc(t,t.return);var n=t.stateNode;typeof n.componentWillUnmount==`function`&&Gc(t,t.return,n),Sl(t);break;case 27:pf(t.stateNode);case 26:case 5:qc(t,t.return),Sl(t);break;case 22:t.memoizedState===null&&Sl(t);break;case 30:Sl(t);break;default:Sl(t)}e=e.sibling}}function Cl(e,t,n){for(n=n&&!!(t.subtreeFlags&8772),t=t.child;t!==null;){var r=t.alternate,i=e,a=t,o=a.flags;switch(a.tag){case 0:case 11:case 15:Cl(i,a,n),Hc(4,a);break;case 1:if(Cl(i,a,n),r=a,i=r.stateNode,typeof i.componentDidMount==`function`)try{i.componentDidMount()}catch(e){Z(r,r.return,e)}if(r=a,i=r.updateQueue,i!==null){var s=r.stateNode;try{var c=i.shared.hiddenCallbacks;if(c!==null)for(i.shared.hiddenCallbacks=null,i=0;i<c.length;i++)Qa(c[i],s)}catch(e){Z(r,r.return,e)}}n&&o&64&&Wc(a),Kc(a,a.return);break;case 27:el(a);case 26:case 5:Cl(i,a,n),n&&r===null&&o&4&&Jc(a),Kc(a,a.return);break;case 12:Cl(i,a,n);break;case 31:Cl(i,a,n),n&&o&4&&fl(i,a);break;case 13:Cl(i,a,n),n&&o&4&&pl(i,a);break;case 22:a.memoizedState===null&&Cl(i,a,n),Kc(a,a.return);break;case 30:break;default:Cl(i,a,n)}t=t.sibling}}function wl(e,t){var n=null;e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(n=e.memoizedState.cachePool.pool),e=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(e=t.memoizedState.cachePool.pool),e!==n&&(e!=null&&e.refCount++,n!=null&&da(n))}function Tl(e,t){e=null,t.alternate!==null&&(e=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==e&&(t.refCount++,e!=null&&da(e))}function El(e,t,n,r){if(t.subtreeFlags&10256)for(t=t.child;t!==null;)Dl(e,t,n,r),t=t.sibling}function Dl(e,t,n,r){var i=t.flags;switch(t.tag){case 0:case 11:case 15:El(e,t,n,r),i&2048&&Hc(9,t);break;case 1:El(e,t,n,r);break;case 3:El(e,t,n,r),i&2048&&(e=null,t.alternate!==null&&(e=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==e&&(t.refCount++,e!=null&&da(e)));break;case 12:if(i&2048){El(e,t,n,r),e=t.stateNode;try{var a=t.memoizedProps,o=a.id,s=a.onPostCommit;typeof s==`function`&&s(o,t.alternate===null?`mount`:`update`,e.passiveEffectDuration,-0)}catch(e){Z(t,t.return,e)}}else El(e,t,n,r);break;case 31:El(e,t,n,r);break;case 13:El(e,t,n,r);break;case 23:break;case 22:a=t.stateNode,o=t.alternate,t.memoizedState===null?a._visibility&2?El(e,t,n,r):(a._visibility|=2,Ol(e,t,n,r,!!(t.subtreeFlags&10256)||!1)):a._visibility&2?El(e,t,n,r):kl(e,t),i&2048&&wl(o,t);break;case 24:El(e,t,n,r),i&2048&&Tl(t.alternate,t);break;default:El(e,t,n,r)}}function Ol(e,t,n,r,i){for(i=i&&(!!(t.subtreeFlags&10256)||!1),t=t.child;t!==null;){var a=e,o=t,s=n,c=r,l=o.flags;switch(o.tag){case 0:case 11:case 15:Ol(a,o,s,c,i),Hc(8,o);break;case 23:break;case 22:var u=o.stateNode;o.memoizedState===null?(u._visibility|=2,Ol(a,o,s,c,i)):u._visibility&2?Ol(a,o,s,c,i):kl(a,o),i&&l&2048&&wl(o.alternate,o);break;case 24:Ol(a,o,s,c,i),i&&l&2048&&Tl(o.alternate,o);break;default:Ol(a,o,s,c,i)}t=t.sibling}}function kl(e,t){if(t.subtreeFlags&10256)for(t=t.child;t!==null;){var n=e,r=t,i=r.flags;switch(r.tag){case 22:kl(n,r),i&2048&&wl(r.alternate,r);break;case 24:kl(n,r),i&2048&&Tl(r.alternate,r);break;default:kl(n,r)}t=t.sibling}}var Al=8192;function jl(e,t,n){if(e.subtreeFlags&Al)for(e=e.child;e!==null;)Ml(e,t,n),e=e.sibling}function Ml(e,t,n){switch(e.tag){case 26:jl(e,t,n),e.flags&Al&&e.memoizedState!==null&&Gf(n,_l,e.memoizedState,e.memoizedProps);break;case 5:jl(e,t,n);break;case 3:case 4:var r=_l;_l=gf(e.stateNode.containerInfo),jl(e,t,n),_l=r;break;case 22:e.memoizedState===null&&(r=e.alternate,r!==null&&r.memoizedState!==null?(r=Al,Al=16777216,jl(e,t,n),Al=r):jl(e,t,n));break;default:jl(e,t,n)}}function Nl(e){var t=e.alternate;if(t!==null&&(e=t.child,e!==null)){t.child=null;do t=e.sibling,e.sibling=null,e=t;while(e!==null)}}function Pl(e){var t=e.deletions;if(e.flags&16){if(t!==null)for(var n=0;n<t.length;n++){var r=t[n];al=r,Ll(r,e)}Nl(e)}if(e.subtreeFlags&10256)for(e=e.child;e!==null;)Fl(e),e=e.sibling}function Fl(e){switch(e.tag){case 0:case 11:case 15:Pl(e),e.flags&2048&&Uc(9,e,e.return);break;case 3:Pl(e);break;case 12:Pl(e);break;case 22:var t=e.stateNode;e.memoizedState!==null&&t._visibility&2&&(e.return===null||e.return.tag!==13)?(t._visibility&=-3,Il(e)):Pl(e);break;default:Pl(e)}}function Il(e){var t=e.deletions;if(e.flags&16){if(t!==null)for(var n=0;n<t.length;n++){var r=t[n];al=r,Ll(r,e)}Nl(e)}for(e=e.child;e!==null;){switch(t=e,t.tag){case 0:case 11:case 15:Uc(8,t,t.return),Il(t);break;case 22:n=t.stateNode,n._visibility&2&&(n._visibility&=-3,Il(t));break;default:Il(t)}e=e.sibling}}function Ll(e,t){for(;al!==null;){var n=al;switch(n.tag){case 0:case 11:case 15:Uc(8,n,t);break;case 23:case 22:if(n.memoizedState!==null&&n.memoizedState.cachePool!==null){var r=n.memoizedState.cachePool.pool;r!=null&&r.refCount++}break;case 24:da(n.memoizedState.cache)}if(r=n.child,r!==null)r.return=n,al=r;else a:for(n=e;al!==null;){r=al;var i=r.sibling,a=r.return;if(cl(r),r===n){al=null;break a}if(i!==null){i.return=a,al=i;break a}al=a}}}var Rl={getCacheForType:function(e){var t=ia(L),n=t.data.get(e);return n===void 0&&(n=e(),t.data.set(e,n)),n},cacheSignal:function(){return ia(L).controller.signal}},zl=typeof WeakMap==`function`?WeakMap:Map,G=0,K=null,q=null,J=0,Y=0,Bl=null,Vl=!1,Hl=!1,Ul=!1,Wl=0,X=0,Gl=0,Kl=0,ql=0,Jl=0,Yl=0,Xl=null,Zl=null,Ql=!1,$l=0,eu=0,tu=1/0,nu=null,ru=null,iu=0,au=null,ou=null,su=0,cu=0,lu=null,uu=null,du=0,fu=null;function pu(){return G&2&&J!==0?J&-J:T.T===null?pt():dd()}function mu(){if(Jl===0){if(!(J&536870912)||I){var e=Qe;Qe<<=1,!(Qe&3932160)&&(Qe=262144),Jl=e}else Jl=536870912}return e=ao.current,e!==null&&(e.flags|=32),Jl}function hu(e,t,n){(e===K&&(Y===2||Y===9)||e.cancelPendingCommit!==null)&&(Su(e,0),yu(e,J,Jl,!1)),ot(e,n),(!(G&2)||e!==K)&&(e===K&&(!(G&2)&&(Kl|=n),X===4&&yu(e,J,Jl,!1)),rd(e))}function gu(e,t,n){if(G&6)throw Error(i(327));var r=!n&&!(t&127)&&(t&e.expiredLanes)===0||nt(e,t),a=r?Au(e,t):Ou(e,t,!0),o=r;do{if(a===0){Hl&&!r&&yu(e,t,0,!1);break}if(n=e.current.alternate,o&&!vu(n)){a=Ou(e,t,!1),o=!1;continue}if(a===2){if(o=t,e.errorRecoveryDisabledLanes&o)var s=0;else s=e.pendingLanes&-536870913,s=s===0?s&536870912?536870912:0:s;if(s!==0){t=s;a:{var c=e;a=Xl;var l=c.current.memoizedState.isDehydrated;if(l&&(Su(c,s).flags|=256),s=Ou(c,s,!1),s!==2){if(Ul&&!l){c.errorRecoveryDisabledLanes|=o,Kl|=o,a=4;break a}o=Zl,Zl=a,o!==null&&(Zl===null?Zl=o:Zl.push.apply(Zl,o))}a=s}if(o=!1,a!==2)continue}}if(a===1){Su(e,0),yu(e,t,0,!0);break}a:{switch(r=e,o=a,o){case 0:case 1:throw Error(i(345));case 4:if((t&4194048)!==t)break;case 6:yu(r,t,Jl,!Vl);break a;case 2:Zl=null;break;case 3:case 5:break;default:throw Error(i(329))}if((t&62914560)===t&&(a=$l+300-O(),10<a)){if(yu(r,t,Jl,!Vl),tt(r,0,!0)!==0)break a;su=t,r.timeoutHandle=Kd(_u.bind(null,r,n,Zl,nu,Ql,t,Jl,Kl,Yl,Vl,o,`Throttled`,-0,0),a);break a}_u(r,n,Zl,nu,Ql,t,Jl,Kl,Yl,Vl,o,null,-0,0)}break}while(1);rd(e)}function _u(e,t,n,r,i,a,o,s,c,l,u,d,f,p){if(e.timeoutHandle=-1,d=t.subtreeFlags,d&8192||(d&16785408)==16785408){d={stylesheets:null,count:0,imgCount:0,imgBytes:0,suspenseyImages:[],waitingForImages:!0,waitingForViewTransition:!1,unsuspend:an},Ml(t,a,d);var m=(a&62914560)===a?$l-O():(a&4194048)===a?eu-O():0;if(m=qf(d,m),m!==null){su=a,e.cancelPendingCommit=m(Lu.bind(null,e,t,a,n,r,i,o,s,c,u,d,null,f,p)),yu(e,a,o,!l);return}}Lu(e,t,a,n,r,i,o,s,c)}function vu(e){for(var t=e;;){var n=t.tag;if((n===0||n===11||n===15)&&t.flags&16384&&(n=t.updateQueue,n!==null&&(n=n.stores,n!==null)))for(var r=0;r<n.length;r++){var i=n[r],a=i.getSnapshot;i=i.value;try{if(!Er(a(),i))return!1}catch{return!1}}if(n=t.child,t.subtreeFlags&16384&&n!==null)n.return=t,t=n;else{if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return!0;t=t.return}t.sibling.return=t.return,t=t.sibling}}return!0}function yu(e,t,n,r){t&=~ql,t&=~Kl,e.suspendedLanes|=t,e.pingedLanes&=~t,r&&(e.warmLanes|=t),r=e.expirationTimes;for(var i=t;0<i;){var a=31-qe(i),o=1<<a;r[a]=-1,i&=~o}n!==0&&ct(e,n,t)}function bu(){return G&6?!0:(id(0,!1),!1)}function xu(){if(q!==null){if(Y===0)var e=q.return;else e=q,Xi=Yi=null,Ao(e),Pa=null,Fa=0,e=q;for(;e!==null;)Vc(e.alternate,e),e=e.return;q=null}}function Su(e,t){var n=e.timeoutHandle;n!==-1&&(e.timeoutHandle=-1,qd(n)),n=e.cancelPendingCommit,n!==null&&(e.cancelPendingCommit=null,n()),su=0,xu(),K=e,q=n=mi(e.current,null),J=t,Y=0,Bl=null,Vl=!1,Hl=nt(e,t),Ul=!1,Yl=Jl=ql=Kl=Gl=X=0,Zl=Xl=null,Ql=!1,t&8&&(t|=t&32);var r=e.entangledLanes;if(r!==0)for(e=e.entanglements,r&=t;0<r;){var i=31-qe(r),a=1<<i;t|=e[i],r&=~a}return Wl=t,ii(),n}function Cu(e,t){z=null,T.H=zs,t===wa||t===Ea?(t=Ma(),Y=3):t===Ta?(t=Ma(),Y=4):Y=t===rc?8:typeof t==`object`&&t&&typeof t.then==`function`?6:1,Bl=t,q===null&&(X=1,Zs(e,Si(t,e.current)))}function wu(){var e=ao.current;return e===null?!0:(J&4194048)===J?oo===null:(J&62914560)===J||J&536870912?e===oo:!1}function Tu(){var e=T.H;return T.H=zs,e===null?zs:e}function Eu(){var e=T.A;return T.A=Rl,e}function Du(){X=4,Vl||(J&4194048)!==J&&ao.current!==null||(Hl=!0),!(Gl&134217727)&&!(Kl&134217727)||K===null||yu(K,J,Jl,!1)}function Ou(e,t,n){var r=G;G|=2;var i=Tu(),a=Eu();(K!==e||J!==t)&&(nu=null,Su(e,t)),t=!1;var o=X;a:do try{if(Y!==0&&q!==null){var s=q,c=Bl;switch(Y){case 8:xu(),o=6;break a;case 3:case 2:case 9:case 6:ao.current===null&&(t=!0);var l=Y;if(Y=0,Bl=null,Pu(e,s,c,l),n&&Hl){o=0;break a}break;default:l=Y,Y=0,Bl=null,Pu(e,s,c,l)}}ku(),o=X;break}catch(t){Cu(e,t)}while(1);return t&&e.shellSuspendCounter++,Xi=Yi=null,G=r,T.H=i,T.A=a,q===null&&(K=null,J=0,ii()),o}function ku(){for(;q!==null;)Mu(q)}function Au(e,t){var n=G;G|=2;var r=Tu(),a=Eu();K!==e||J!==t?(nu=null,tu=O()+500,Su(e,t)):Hl=nt(e,t);a:do try{if(Y!==0&&q!==null){t=q;var o=Bl;b:switch(Y){case 1:Y=0,Bl=null,Pu(e,t,o,1);break;case 2:case 9:if(Oa(o)){Y=0,Bl=null,Nu(t);break}t=function(){Y!==2&&Y!==9||K!==e||(Y=7),rd(e)},o.then(t,t);break a;case 3:Y=7;break a;case 4:Y=5;break a;case 7:Oa(o)?(Y=0,Bl=null,Nu(t)):(Y=0,Bl=null,Pu(e,t,o,7));break;case 5:var s=null;switch(q.tag){case 26:s=q.memoizedState;case 5:case 27:var c=q;if(s?Wf(s):c.stateNode.complete){Y=0,Bl=null;var l=c.sibling;if(l!==null)q=l;else{var u=c.return;u===null?q=null:(q=u,Fu(u))}break b}}Y=0,Bl=null,Pu(e,t,o,5);break;case 6:Y=0,Bl=null,Pu(e,t,o,6);break;case 8:xu(),X=6;break a;default:throw Error(i(462))}}ju();break}catch(t){Cu(e,t)}while(1);return Xi=Yi=null,T.H=r,T.A=a,G=n,q===null?(K=null,J=0,ii(),X):0}function ju(){for(;q!==null&&!Pe();)Mu(q)}function Mu(e){var t=Nc(e.alternate,e,Wl);e.memoizedProps=e.pendingProps,t===null?Fu(e):q=t}function Nu(e){var t=e,n=t.alternate;switch(t.tag){case 15:case 0:t=_c(n,t,t.pendingProps,t.type,void 0,J);break;case 11:t=_c(n,t,t.pendingProps,t.type.render,t.ref,J);break;case 5:Ao(t);default:Vc(n,t),t=q=hi(t,Wl),t=Nc(n,t,Wl)}e.memoizedProps=e.pendingProps,t===null?Fu(e):q=t}function Pu(e,t,n,r){Xi=Yi=null,Ao(t),Pa=null,Fa=0;var i=t.return;try{if(nc(e,i,t,n,J)){X=1,Zs(e,Si(n,e.current)),q=null;return}}catch(t){if(i!==null)throw q=i,t;X=1,Zs(e,Si(n,e.current)),q=null;return}t.flags&32768?(I||r===1?e=!0:Hl||J&536870912?e=!1:(Vl=e=!0,(r===2||r===9||r===3||r===6)&&(r=ao.current,r!==null&&r.tag===13&&(r.flags|=16384))),Iu(t,e)):Fu(t)}function Fu(e){var t=e;do{if(t.flags&32768){Iu(t,Vl);return}e=t.return;var n=zc(t.alternate,t,Wl);if(n!==null){q=n;return}if(t=t.sibling,t!==null){q=t;return}q=t=e}while(t!==null);X===0&&(X=5)}function Iu(e,t){do{var n=Bc(e.alternate,e);if(n!==null){n.flags&=32767,q=n;return}if(n=e.return,n!==null&&(n.flags|=32768,n.subtreeFlags=0,n.deletions=null),!t&&(e=e.sibling,e!==null)){q=e;return}q=e=n}while(e!==null);X=6,q=null}function Lu(e,t,n,r,a,o,s,c,l){e.cancelPendingCommit=null;do Hu();while(iu!==0);if(G&6)throw Error(i(327));if(t!==null){if(t===e.current)throw Error(i(177));if(o=t.lanes|t.childLanes,o|=ri,st(e,n,o,s,c,l),e===K&&(q=K=null,J=0),ou=t,au=e,su=n,cu=o,lu=a,uu=r,t.subtreeFlags&10256||t.flags&10256?(e.callbackNode=null,e.callbackPriority=0,Xu(ze,function(){return Uu(),null})):(e.callbackNode=null,e.callbackPriority=0),r=!!(t.flags&13878),t.subtreeFlags&13878||r){r=T.T,T.T=null,a=E.p,E.p=2,s=G,G|=4;try{ol(e,t,n)}finally{G=s,E.p=a,T.T=r}}iu=1,Ru(),zu(),Bu()}}function Ru(){if(iu===1){iu=0;var e=au,t=ou,n=!!(t.flags&13878);if(t.subtreeFlags&13878||n){n=T.T,T.T=null;var r=E.p;E.p=2;var i=G;G|=4;try{vl(t,e);var a=zd,o=jr(e.containerInfo),s=a.focusedElem,c=a.selectionRange;if(o!==s&&s&&s.ownerDocument&&Ar(s.ownerDocument.documentElement,s)){if(c!==null&&Mr(s)){var l=c.start,u=c.end;if(u===void 0&&(u=l),`selectionStart`in s)s.selectionStart=l,s.selectionEnd=Math.min(u,s.value.length);else{var d=s.ownerDocument||document,f=d&&d.defaultView||window;if(f.getSelection){var p=f.getSelection(),m=s.textContent.length,h=Math.min(c.start,m),g=c.end===void 0?h:Math.min(c.end,m);!p.extend&&h>g&&(o=g,g=h,h=o);var _=kr(s,h),v=kr(s,g);if(_&&v&&(p.rangeCount!==1||p.anchorNode!==_.node||p.anchorOffset!==_.offset||p.focusNode!==v.node||p.focusOffset!==v.offset)){var y=d.createRange();y.setStart(_.node,_.offset),p.removeAllRanges(),h>g?(p.addRange(y),p.extend(v.node,v.offset)):(y.setEnd(v.node,v.offset),p.addRange(y))}}}}for(d=[],p=s;p=p.parentNode;)p.nodeType===1&&d.push({element:p,left:p.scrollLeft,top:p.scrollTop});for(typeof s.focus==`function`&&s.focus(),s=0;s<d.length;s++){var b=d[s];b.element.scrollLeft=b.left,b.element.scrollTop=b.top}}sp=!!Rd,zd=Rd=null}finally{G=i,E.p=r,T.T=n}}e.current=t,iu=2}}function zu(){if(iu===2){iu=0;var e=au,t=ou,n=!!(t.flags&8772);if(t.subtreeFlags&8772||n){n=T.T,T.T=null;var r=E.p;E.p=2;var i=G;G|=4;try{sl(e,t.alternate,t)}finally{G=i,E.p=r,T.T=n}}iu=3}}function Bu(){if(iu===4||iu===3){iu=0,Fe();var e=au,t=ou,n=su,r=uu;t.subtreeFlags&10256||t.flags&10256?iu=5:(iu=0,ou=au=null,Vu(e,e.pendingLanes));var i=e.pendingLanes;if(i===0&&(ru=null),ft(n),t=t.stateNode,Ge&&typeof Ge.onCommitFiberRoot==`function`)try{Ge.onCommitFiberRoot(We,t,void 0,(t.current.flags&128)==128)}catch{}if(r!==null){t=T.T,i=E.p,E.p=2,T.T=null;try{for(var a=e.onRecoverableError,o=0;o<r.length;o++){var s=r[o];a(s.value,{componentStack:s.stack})}}finally{T.T=t,E.p=i}}su&3&&Hu(),rd(e),i=e.pendingLanes,n&261930&&i&42?e===fu?du++:(du=0,fu=e):du=0,id(0,!1)}}function Vu(e,t){(e.pooledCacheLanes&=t)===0&&(t=e.pooledCache,t!=null&&(e.pooledCache=null,da(t)))}function Hu(){return Ru(),zu(),Bu(),Uu()}function Uu(){if(iu!==5)return!1;var e=au,t=cu;cu=0;var n=ft(su),r=T.T,a=E.p;try{E.p=32>n?32:n,T.T=null,n=lu,lu=null;var o=au,s=su;if(iu=0,ou=au=null,su=0,G&6)throw Error(i(331));var c=G;if(G|=4,Fl(o.current),Dl(o,o.current,s,n),G=c,id(0,!1),Ge&&typeof Ge.onPostCommitFiberRoot==`function`)try{Ge.onPostCommitFiberRoot(We,o)}catch{}return!0}finally{E.p=a,T.T=r,Vu(e,t)}}function Wu(e,t,n){t=Si(n,t),t=$s(e.stateNode,t,2),e=Ka(e,t,2),e!==null&&(ot(e,2),rd(e))}function Z(e,t,n){if(e.tag===3)Wu(e,e,n);else for(;t!==null;){if(t.tag===3){Wu(t,e,n);break}if(t.tag===1){var r=t.stateNode;if(typeof t.type.getDerivedStateFromError==`function`||typeof r.componentDidCatch==`function`&&(ru===null||!ru.has(r))){e=Si(n,e),n=ec(2),r=Ka(t,n,2),r!==null&&(tc(n,r,t,e),ot(r,2),rd(r));break}}t=t.return}}function Gu(e,t,n){var r=e.pingCache;if(r===null){r=e.pingCache=new zl;var i=new Set;r.set(t,i)}else i=r.get(t),i===void 0&&(i=new Set,r.set(t,i));i.has(n)||(Ul=!0,i.add(n),e=Ku.bind(null,e,t,n),t.then(e,e))}function Ku(e,t,n){var r=e.pingCache;r!==null&&r.delete(t),e.pingedLanes|=e.suspendedLanes&n,e.warmLanes&=~n,K===e&&(J&n)===n&&(X===4||X===3&&(J&62914560)===J&&300>O()-$l?!(G&2)&&Su(e,0):ql|=n,Yl===J&&(Yl=0)),rd(e)}function qu(e,t){t===0&&(t=it()),e=si(e,t),e!==null&&(ot(e,t),rd(e))}function Ju(e){var t=e.memoizedState,n=0;t!==null&&(n=t.retryLane),qu(e,n)}function Yu(e,t){var n=0;switch(e.tag){case 31:case 13:var r=e.stateNode,a=e.memoizedState;a!==null&&(n=a.retryLane);break;case 19:r=e.stateNode;break;case 22:r=e.stateNode._retryCache;break;default:throw Error(i(314))}r!==null&&r.delete(t),qu(e,n)}function Xu(e,t){return Me(e,t)}var Zu=null,Qu=null,$u=!1,ed=!1,td=!1,nd=0;function rd(e){e!==Qu&&e.next===null&&(Qu===null?Zu=Qu=e:Qu=Qu.next=e),ed=!0,$u||($u=!0,ud())}function id(e,t){if(!td&&ed){td=!0;do for(var n=!1,r=Zu;r!==null;){if(!t){if(e!==0){var i=r.pendingLanes;if(i===0)var a=0;else{var o=r.suspendedLanes,s=r.pingedLanes;a=(1<<31-qe(42|e)+1)-1,a&=i&~(o&~s),a=a&201326741?a&201326741|1:a?a|2:0}a!==0&&(n=!0,ld(r,a))}else a=J,a=tt(r,r===K?a:0,r.cancelPendingCommit!==null||r.timeoutHandle!==-1),!(a&3)||nt(r,a)||(n=!0,ld(r,a))}r=r.next}while(n);td=!1}}function ad(){od()}function od(){ed=$u=!1;var e=0;nd!==0&&Gd()&&(e=nd);for(var t=O(),n=null,r=Zu;r!==null;){var i=r.next,a=sd(r,t);a===0?(r.next=null,n===null?Zu=i:n.next=i,i===null&&(Qu=n)):(n=r,(e!==0||a&3)&&(ed=!0)),r=i}iu!==0&&iu!==5||id(e,!1),nd!==0&&(nd=0)}function sd(e,t){for(var n=e.suspendedLanes,r=e.pingedLanes,i=e.expirationTimes,a=e.pendingLanes&-62914561;0<a;){var o=31-qe(a),s=1<<o,c=i[o];c===-1?((s&n)===0||(s&r)!==0)&&(i[o]=rt(s,t)):c<=t&&(e.expiredLanes|=s),a&=~s}if(t=K,n=J,n=tt(e,e===t?n:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),r=e.callbackNode,n===0||e===t&&(Y===2||Y===9)||e.cancelPendingCommit!==null)return r!==null&&r!==null&&Ne(r),e.callbackNode=null,e.callbackPriority=0;if(!(n&3)||nt(e,n)){if(t=n&-n,t===e.callbackPriority)return t;switch(r!==null&&Ne(r),ft(n)){case 2:case 8:n=Re;break;case 32:n=ze;break;case 268435456:n=Ve;break;default:n=ze}return r=cd.bind(null,e),n=Me(n,r),e.callbackPriority=t,e.callbackNode=n,t}return r!==null&&r!==null&&Ne(r),e.callbackPriority=2,e.callbackNode=null,2}function cd(e,t){if(iu!==0&&iu!==5)return e.callbackNode=null,e.callbackPriority=0,null;var n=e.callbackNode;if(Hu()&&e.callbackNode!==n)return null;var r=J;return r=tt(e,e===K?r:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),r===0?null:(gu(e,r,t),sd(e,O()),e.callbackNode!=null&&e.callbackNode===n?cd.bind(null,e):null)}function ld(e,t){if(Hu())return null;gu(e,t,!0)}function ud(){Yd(function(){G&6?Me(Le,ad):od()})}function dd(){if(nd===0){var e=ma;e===0&&(e=Ze,Ze<<=1,!(Ze&261888)&&(Ze=256)),nd=e}return nd}function fd(e){return e==null||typeof e==`symbol`||typeof e==`boolean`?null:typeof e==`function`?e:rn(``+e)}function pd(e,t){var n=t.ownerDocument.createElement(`input`);return n.name=t.name,n.value=t.value,e.id&&n.setAttribute(`form`,e.id),t.parentNode.insertBefore(n,t),e=new FormData(e),n.parentNode.removeChild(n),e}function md(e,t,n,r,i){if(t===`submit`&&n&&n.stateNode===i){var a=fd((i[gt]||null).action),o=r.submitter;o&&(t=(t=o[gt]||null)?fd(t.formAction):o.getAttribute(`formAction`),t!==null&&(a=t,o=null));var s=new Tn(`action`,`action`,null,r,i);e.push({event:s,listeners:[{instance:null,listener:function(){if(r.defaultPrevented){if(nd!==0){var e=o?pd(i,o):new FormData(i);Ts(n,{pending:!0,data:e,method:i.method,action:a},null,e)}}else typeof a==`function`&&(s.preventDefault(),e=o?pd(i,o):new FormData(i),Ts(n,{pending:!0,data:e,method:i.method,action:a},a,e))},currentTarget:i}]})}}for(var hd=0;hd<Qr.length;hd++){var gd=Qr[hd];$r(gd.toLowerCase(),`on`+(gd[0].toUpperCase()+gd.slice(1)))}$r(Wr,`onAnimationEnd`),$r(Gr,`onAnimationIteration`),$r(Kr,`onAnimationStart`),$r(`dblclick`,`onDoubleClick`),$r(`focusin`,`onFocus`),$r(`focusout`,`onBlur`),$r(qr,`onTransitionRun`),$r(Jr,`onTransitionStart`),$r(Yr,`onTransitionCancel`),$r(Xr,`onTransitionEnd`),jt(`onMouseEnter`,[`mouseout`,`mouseover`]),jt(`onMouseLeave`,[`mouseout`,`mouseover`]),jt(`onPointerEnter`,[`pointerout`,`pointerover`]),jt(`onPointerLeave`,[`pointerout`,`pointerover`]),At(`onChange`,`change click focusin focusout input keydown keyup selectionchange`.split(` `)),At(`onSelect`,`focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange`.split(` `)),At(`onBeforeInput`,[`compositionend`,`keypress`,`textInput`,`paste`]),At(`onCompositionEnd`,`compositionend focusout keydown keypress keyup mousedown`.split(` `)),At(`onCompositionStart`,`compositionstart focusout keydown keypress keyup mousedown`.split(` `)),At(`onCompositionUpdate`,`compositionupdate focusout keydown keypress keyup mousedown`.split(` `));var _d=`abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting`.split(` `),vd=new Set(`beforetoggle cancel close invalid load scroll scrollend toggle`.split(` `).concat(_d));function yd(e,t){t=!!(t&4);for(var n=0;n<e.length;n++){var r=e[n],i=r.event;r=r.listeners;a:{var a=void 0;if(t)for(var o=r.length-1;0<=o;o--){var s=r[o],c=s.instance,l=s.currentTarget;if(s=s.listener,c!==a&&i.isPropagationStopped())break a;a=s,i.currentTarget=l;try{a(i)}catch(e){ei(e)}i.currentTarget=null,a=c}else for(o=0;o<r.length;o++){if(s=r[o],c=s.instance,l=s.currentTarget,s=s.listener,c!==a&&i.isPropagationStopped())break a;a=s,i.currentTarget=l;try{a(i)}catch(e){ei(e)}i.currentTarget=null,a=c}}}}function Q(e,t){var n=t[vt];n===void 0&&(n=t[vt]=new Set);var r=e+`__bubble`;n.has(r)||(Cd(t,e,2,!1),n.add(r))}function bd(e,t,n){var r=0;t&&(r|=4),Cd(n,e,r,t)}var xd=`_reactListening`+Math.random().toString(36).slice(2);function Sd(e){if(!e[xd]){e[xd]=!0,Ot.forEach(function(t){t!==`selectionchange`&&(vd.has(t)||bd(t,!1,e),bd(t,!0,e))});var t=e.nodeType===9?e:e.ownerDocument;t===null||t[xd]||(t[xd]=!0,bd(`selectionchange`,!1,t))}}function Cd(e,t,n,r){switch(mp(t)){case 2:var i=cp;break;case 8:i=lp;break;default:i=up}n=i.bind(null,t,n,e),i=void 0,!P||t!==`touchstart`&&t!==`touchmove`&&t!==`wheel`||(i=!0),r?i===void 0?e.addEventListener(t,n,!0):e.addEventListener(t,n,{capture:!0,passive:i}):i===void 0?e.addEventListener(t,n,!1):e.addEventListener(t,n,{passive:i})}function wd(e,t,n,r,i){var a=r;if(!(t&1)&&!(t&2)&&r!==null)a:for(;;){if(r===null)return;var s=r.tag;if(s===3||s===4){var c=r.stateNode.containerInfo;if(c===i)break;if(s===4)for(s=r.return;s!==null;){var l=s.tag;if((l===3||l===4)&&s.stateNode.containerInfo===i)return;s=s.return}for(;c!==null;){if(s=wt(c),s===null)return;if(l=s.tag,l===5||l===6||l===26||l===27){r=a=s;continue a}c=c.parentNode}}r=r.return}fn(function(){var r=a,i=sn(n),s=[];a:{var c=Zr.get(e);if(c!==void 0){var l=Tn,u=e;switch(e){case`keypress`:if(bn(n)===0)break a;case`keydown`:case`keyup`:l=Un;break;case`focusin`:u=`focus`,l=Pn;break;case`focusout`:u=`blur`,l=Pn;break;case`beforeblur`:case`afterblur`:l=Pn;break;case`click`:if(n.button===2)break a;case`auxclick`:case`dblclick`:case`mousedown`:case`mousemove`:case`mouseup`:case`mouseout`:case`mouseover`:case`contextmenu`:l=Mn;break;case`drag`:case`dragend`:case`dragenter`:case`dragexit`:case`dragleave`:case`dragover`:case`dragstart`:case`drop`:l=Nn;break;case`touchcancel`:case`touchend`:case`touchmove`:case`touchstart`:l=Gn;break;case Wr:case Gr:case Kr:l=Fn;break;case Xr:l=Kn;break;case`scroll`:case`scrollend`:l=Dn;break;case`wheel`:l=qn;break;case`copy`:case`cut`:case`paste`:l=In;break;case`gotpointercapture`:case`lostpointercapture`:case`pointercancel`:case`pointerdown`:case`pointermove`:case`pointerout`:case`pointerover`:case`pointerup`:l=Wn;break;case`toggle`:case`beforetoggle`:l=Jn}var d=!!(t&4),f=!d&&(e===`scroll`||e===`scrollend`),p=d?c===null?null:c+`Capture`:c;d=[];for(var m=r,h;m!==null;){var g=m;if(h=g.stateNode,g=g.tag,g!==5&&g!==26&&g!==27||h===null||p===null||(g=pn(m,p),g!=null&&d.push(Td(m,g,h))),f)break;m=m.return}0<d.length&&(c=new l(c,u,null,n,i),s.push({event:c,listeners:d}))}}if(!(t&7)){a:{if(c=e===`mouseover`||e===`pointerover`,l=e===`mouseout`||e===`pointerout`,c&&n!==on&&(u=n.relatedTarget||n.fromElement)&&(wt(u)||u[_t]))break a;if((l||c)&&(c=i.window===i?i:(c=i.ownerDocument)?c.defaultView||c.parentWindow:window,l?(u=n.relatedTarget||n.toElement,l=r,u=u?wt(u):null,u!==null&&(f=o(u),d=u.tag,u!==f||d!==5&&d!==27&&d!==6)&&(u=null)):(l=null,u=r),l!==u)){if(d=Mn,g=`onMouseLeave`,p=`onMouseEnter`,m=`mouse`,(e===`pointerout`||e===`pointerover`)&&(d=Wn,g=`onPointerLeave`,p=`onPointerEnter`,m=`pointer`),f=l==null?c:Et(l),h=u==null?c:Et(u),c=new d(g,m+`leave`,l,n,i),c.target=f,c.relatedTarget=h,g=null,wt(i)===r&&(d=new d(p,m+`enter`,u,n,i),d.target=h,d.relatedTarget=f,g=d),f=g,l&&u)b:{for(d=Dd,p=l,m=u,h=0,g=p;g;g=d(g))h++;g=0;for(var _=m;_;_=d(_))g++;for(;0<h-g;)p=d(p),h--;for(;0<g-h;)m=d(m),g--;for(;h--;){if(p===m||m!==null&&p===m.alternate){d=p;break b}p=d(p),m=d(m)}d=null}else d=null;l!==null&&Od(s,c,l,d,!1),u!==null&&f!==null&&Od(s,f,u,d,!0)}}a:{if(c=r?Et(r):window,l=c.nodeName&&c.nodeName.toLowerCase(),l===`select`||l===`input`&&c.type===`file`)var v=mr;else if(cr(c)){if(hr)v=wr;else{v=Sr;var y=xr}}else l=c.nodeName,!l||l.toLowerCase()!==`input`||c.type!==`checkbox`&&c.type!==`radio`?r&&en(r.elementType)&&(v=mr):v=Cr;if(v&&(v=v(e,r))){lr(s,v,n,i);break a}y&&y(e,c,r),e===`focusout`&&r&&c.type===`number`&&r.memoizedProps.value!=null&&Kt(c,`number`,c.value)}switch(y=r?Et(r):window,e){case`focusin`:(cr(y)||y.contentEditable===`true`)&&(Pr=y,Fr=r,Ir=null);break;case`focusout`:Ir=Fr=Pr=null;break;case`mousedown`:Lr=!0;break;case`contextmenu`:case`mouseup`:case`dragend`:Lr=!1,Rr(s,n,i);break;case`selectionchange`:if(Nr)break;case`keydown`:case`keyup`:Rr(s,n,i)}var b;if(Xn)b:{switch(e){case`compositionstart`:var x=`onCompositionStart`;break b;case`compositionend`:x=`onCompositionEnd`;break b;case`compositionupdate`:x=`onCompositionUpdate`;break b}x=void 0}else ir?nr(e,n)&&(x=`onCompositionEnd`):e===`keydown`&&n.keyCode===229&&(x=`onCompositionStart`);x&&($n&&n.locale!==`ko`&&(ir||x!==`onCompositionStart`?x===`onCompositionEnd`&&ir&&(b=yn()):(gn=i,_n=`value`in gn?gn.value:gn.textContent,ir=!0)),y=Ed(r,x),0<y.length&&(x=new Ln(x,e,null,n,i),s.push({event:x,listeners:y}),b?x.data=b:(b=rr(n),b!==null&&(x.data=b)))),(b=Qn?ar(e,n):or(e,n))&&(x=Ed(r,`onBeforeInput`),0<x.length&&(y=new Ln(`onBeforeInput`,`beforeinput`,null,n,i),s.push({event:y,listeners:x}),y.data=b)),md(s,e,r,n,i)}yd(s,t)})}function Td(e,t,n){return{instance:e,listener:t,currentTarget:n}}function Ed(e,t){for(var n=t+`Capture`,r=[];e!==null;){var i=e,a=i.stateNode;if(i=i.tag,i!==5&&i!==26&&i!==27||a===null||(i=pn(e,n),i!=null&&r.unshift(Td(e,i,a)),i=pn(e,t),i!=null&&r.push(Td(e,i,a))),e.tag===3)return r;e=e.return}return[]}function Dd(e){if(e===null)return null;do e=e.return;while(e&&e.tag!==5&&e.tag!==27);return e||null}function Od(e,t,n,r,i){for(var a=t._reactName,o=[];n!==null&&n!==r;){var s=n,c=s.alternate,l=s.stateNode;if(s=s.tag,c!==null&&c===r)break;s!==5&&s!==26&&s!==27||l===null||(c=l,i?(l=pn(n,a),l!=null&&o.unshift(Td(n,l,c))):i||(l=pn(n,a),l!=null&&o.push(Td(n,l,c)))),n=n.return}o.length!==0&&e.push({event:t,listeners:o})}var kd=/\r\n?/g,Ad=/\u0000|\uFFFD/g;function jd(e){return(typeof e==`string`?e:``+e).replace(kd,`
`).replace(Ad,``)}function Md(e,t){return t=jd(t),jd(e)===t}function $(e,t,n,r,a,o){switch(n){case`children`:typeof r==`string`?t===`body`||t===`textarea`&&r===``||Xt(e,r):(typeof r==`number`||typeof r==`bigint`)&&t!==`body`&&Xt(e,``+r);break;case`className`:Lt(e,`class`,r);break;case`tabIndex`:Lt(e,`tabindex`,r);break;case`dir`:case`role`:case`viewBox`:case`width`:case`height`:Lt(e,n,r);break;case`style`:$t(e,r,o);break;case`data`:if(t!==`object`){Lt(e,`data`,r);break}case`src`:case`href`:if(r===``&&(t!==`a`||n!==`href`)){e.removeAttribute(n);break}if(r==null||typeof r==`function`||typeof r==`symbol`||typeof r==`boolean`){e.removeAttribute(n);break}r=rn(``+r),e.setAttribute(n,r);break;case`action`:case`formAction`:if(typeof r==`function`){e.setAttribute(n,`javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')`);break}if(typeof o==`function`&&(n===`formAction`?(t!==`input`&&$(e,t,`name`,a.name,a,null),$(e,t,`formEncType`,a.formEncType,a,null),$(e,t,`formMethod`,a.formMethod,a,null),$(e,t,`formTarget`,a.formTarget,a,null)):($(e,t,`encType`,a.encType,a,null),$(e,t,`method`,a.method,a,null),$(e,t,`target`,a.target,a,null))),r==null||typeof r==`symbol`||typeof r==`boolean`){e.removeAttribute(n);break}r=rn(``+r),e.setAttribute(n,r);break;case`onClick`:r!=null&&(e.onclick=an);break;case`onScroll`:r!=null&&Q(`scroll`,e);break;case`onScrollEnd`:r!=null&&Q(`scrollend`,e);break;case`dangerouslySetInnerHTML`:if(r!=null){if(typeof r!=`object`||!(`__html`in r))throw Error(i(61));if(n=r.__html,n!=null){if(a.children!=null)throw Error(i(60));e.innerHTML=n}}break;case`multiple`:e.multiple=r&&typeof r!=`function`&&typeof r!=`symbol`;break;case`muted`:e.muted=r&&typeof r!=`function`&&typeof r!=`symbol`;break;case`suppressContentEditableWarning`:case`suppressHydrationWarning`:case`defaultValue`:case`defaultChecked`:case`innerHTML`:case`ref`:break;case`autoFocus`:break;case`xlinkHref`:if(r==null||typeof r==`function`||typeof r==`boolean`||typeof r==`symbol`){e.removeAttribute(`xlink:href`);break}n=rn(``+r),e.setAttributeNS(`http://www.w3.org/1999/xlink`,`xlink:href`,n);break;case`contentEditable`:case`spellCheck`:case`draggable`:case`value`:case`autoReverse`:case`externalResourcesRequired`:case`focusable`:case`preserveAlpha`:r!=null&&typeof r!=`function`&&typeof r!=`symbol`?e.setAttribute(n,``+r):e.removeAttribute(n);break;case`inert`:case`allowFullScreen`:case`async`:case`autoPlay`:case`controls`:case`default`:case`defer`:case`disabled`:case`disablePictureInPicture`:case`disableRemotePlayback`:case`formNoValidate`:case`hidden`:case`loop`:case`noModule`:case`noValidate`:case`open`:case`playsInline`:case`readOnly`:case`required`:case`reversed`:case`scoped`:case`seamless`:case`itemScope`:r&&typeof r!=`function`&&typeof r!=`symbol`?e.setAttribute(n,``):e.removeAttribute(n);break;case`capture`:case`download`:!0===r?e.setAttribute(n,``):!1!==r&&r!=null&&typeof r!=`function`&&typeof r!=`symbol`?e.setAttribute(n,r):e.removeAttribute(n);break;case`cols`:case`rows`:case`size`:case`span`:r!=null&&typeof r!=`function`&&typeof r!=`symbol`&&!isNaN(r)&&1<=r?e.setAttribute(n,r):e.removeAttribute(n);break;case`rowSpan`:case`start`:r==null||typeof r==`function`||typeof r==`symbol`||isNaN(r)?e.removeAttribute(n):e.setAttribute(n,r);break;case`popover`:Q(`beforetoggle`,e),Q(`toggle`,e),It(e,`popover`,r);break;case`xlinkActuate`:j(e,`http://www.w3.org/1999/xlink`,`xlink:actuate`,r);break;case`xlinkArcrole`:j(e,`http://www.w3.org/1999/xlink`,`xlink:arcrole`,r);break;case`xlinkRole`:j(e,`http://www.w3.org/1999/xlink`,`xlink:role`,r);break;case`xlinkShow`:j(e,`http://www.w3.org/1999/xlink`,`xlink:show`,r);break;case`xlinkTitle`:j(e,`http://www.w3.org/1999/xlink`,`xlink:title`,r);break;case`xlinkType`:j(e,`http://www.w3.org/1999/xlink`,`xlink:type`,r);break;case`xmlBase`:j(e,`http://www.w3.org/XML/1998/namespace`,`xml:base`,r);break;case`xmlLang`:j(e,`http://www.w3.org/XML/1998/namespace`,`xml:lang`,r);break;case`xmlSpace`:j(e,`http://www.w3.org/XML/1998/namespace`,`xml:space`,r);break;case`is`:It(e,`is`,r);break;case`innerText`:case`textContent`:break;default:(!(2<n.length)||n[0]!==`o`&&n[0]!==`O`||n[1]!==`n`&&n[1]!==`N`)&&(n=tn.get(n)||n,It(e,n,r))}}function Nd(e,t,n,r,a,o){switch(n){case`style`:$t(e,r,o);break;case`dangerouslySetInnerHTML`:if(r!=null){if(typeof r!=`object`||!(`__html`in r))throw Error(i(61));if(n=r.__html,n!=null){if(a.children!=null)throw Error(i(60));e.innerHTML=n}}break;case`children`:typeof r==`string`?Xt(e,r):(typeof r==`number`||typeof r==`bigint`)&&Xt(e,``+r);break;case`onScroll`:r!=null&&Q(`scroll`,e);break;case`onScrollEnd`:r!=null&&Q(`scrollend`,e);break;case`onClick`:r!=null&&(e.onclick=an);break;case`suppressContentEditableWarning`:case`suppressHydrationWarning`:case`innerHTML`:case`ref`:break;case`innerText`:case`textContent`:break;default:if(!kt.hasOwnProperty(n))a:{if(n[0]===`o`&&n[1]===`n`&&(a=n.endsWith(`Capture`),t=n.slice(2,a?n.length-7:void 0),o=e[gt]||null,o=o==null?null:o[n],typeof o==`function`&&e.removeEventListener(t,o,a),typeof r==`function`)){typeof o!=`function`&&o!==null&&(n in e?e[n]=null:e.hasAttribute(n)&&e.removeAttribute(n)),e.addEventListener(t,r,a);break a}n in e?e[n]=r:!0===r?e.setAttribute(n,``):It(e,n,r)}}}function Pd(e,t,n){switch(t){case`div`:case`span`:case`svg`:case`path`:case`a`:case`g`:case`p`:case`li`:break;case`img`:Q(`error`,e),Q(`load`,e);var r=!1,a=!1,o;for(o in n)if(n.hasOwnProperty(o)){var s=n[o];if(s!=null)switch(o){case`src`:r=!0;break;case`srcSet`:a=!0;break;case`children`:case`dangerouslySetInnerHTML`:throw Error(i(137,t));default:$(e,t,o,s,n,null)}}a&&$(e,t,`srcSet`,n.srcSet,n,null),r&&$(e,t,`src`,n.src,n,null);return;case`input`:Q(`invalid`,e);var c=o=s=a=null,l=null,u=null;for(r in n)if(n.hasOwnProperty(r)){var d=n[r];if(d!=null)switch(r){case`name`:a=d;break;case`type`:s=d;break;case`checked`:l=d;break;case`defaultChecked`:u=d;break;case`value`:o=d;break;case`defaultValue`:c=d;break;case`children`:case`dangerouslySetInnerHTML`:if(d!=null)throw Error(i(137,t));break;default:$(e,t,r,d,n,null)}}Gt(e,o,c,l,u,s,a,!1);return;case`select`:for(a in Q(`invalid`,e),r=s=o=null,n)if(n.hasOwnProperty(a)&&(c=n[a],c!=null))switch(a){case`value`:o=c;break;case`defaultValue`:s=c;break;case`multiple`:r=c;default:$(e,t,a,c,n,null)}t=o,n=s,e.multiple=!!r,t==null?n!=null&&qt(e,!!r,n,!0):qt(e,!!r,t,!1);return;case`textarea`:for(s in Q(`invalid`,e),o=a=r=null,n)if(n.hasOwnProperty(s)&&(c=n[s],c!=null))switch(s){case`value`:r=c;break;case`defaultValue`:a=c;break;case`children`:o=c;break;case`dangerouslySetInnerHTML`:if(c!=null)throw Error(i(91));break;default:$(e,t,s,c,n,null)}Yt(e,r,a,o);return;case`option`:for(l in n)if(n.hasOwnProperty(l)&&(r=n[l],r!=null))switch(l){case`selected`:e.selected=r&&typeof r!=`function`&&typeof r!=`symbol`;break;default:$(e,t,l,r,n,null)}return;case`dialog`:Q(`beforetoggle`,e),Q(`toggle`,e),Q(`cancel`,e),Q(`close`,e);break;case`iframe`:case`object`:Q(`load`,e);break;case`video`:case`audio`:for(r=0;r<_d.length;r++)Q(_d[r],e);break;case`image`:Q(`error`,e),Q(`load`,e);break;case`details`:Q(`toggle`,e);break;case`embed`:case`source`:case`link`:Q(`error`,e),Q(`load`,e);case`area`:case`base`:case`br`:case`col`:case`hr`:case`keygen`:case`meta`:case`param`:case`track`:case`wbr`:case`menuitem`:for(u in n)if(n.hasOwnProperty(u)&&(r=n[u],r!=null))switch(u){case`children`:case`dangerouslySetInnerHTML`:throw Error(i(137,t));default:$(e,t,u,r,n,null)}return;default:if(en(t)){for(d in n)n.hasOwnProperty(d)&&(r=n[d],r!==void 0&&Nd(e,t,d,r,n,void 0));return}}for(c in n)n.hasOwnProperty(c)&&(r=n[c],r!=null&&$(e,t,c,r,n,null))}function Fd(e,t,n,r){switch(t){case`div`:case`span`:case`svg`:case`path`:case`a`:case`g`:case`p`:case`li`:break;case`input`:var a=null,o=null,s=null,c=null,l=null,u=null,d=null;for(m in n){var f=n[m];if(n.hasOwnProperty(m)&&f!=null)switch(m){case`checked`:break;case`value`:break;case`defaultValue`:l=f;default:r.hasOwnProperty(m)||$(e,t,m,null,r,f)}}for(var p in r){var m=r[p];if(f=n[p],r.hasOwnProperty(p)&&(m!=null||f!=null))switch(p){case`type`:o=m;break;case`name`:a=m;break;case`checked`:u=m;break;case`defaultChecked`:d=m;break;case`value`:s=m;break;case`defaultValue`:c=m;break;case`children`:case`dangerouslySetInnerHTML`:if(m!=null)throw Error(i(137,t));break;default:m!==f&&$(e,t,p,m,r,f)}}N(e,s,c,l,u,d,o,a);return;case`select`:for(o in m=s=c=p=null,n)if(l=n[o],n.hasOwnProperty(o)&&l!=null)switch(o){case`value`:break;case`multiple`:m=l;default:r.hasOwnProperty(o)||$(e,t,o,null,r,l)}for(a in r)if(o=r[a],l=n[a],r.hasOwnProperty(a)&&(o!=null||l!=null))switch(a){case`value`:p=o;break;case`defaultValue`:c=o;break;case`multiple`:s=o;default:o!==l&&$(e,t,a,o,r,l)}t=c,n=s,r=m,p==null?!!r!=!!n&&(t==null?qt(e,!!n,n?[]:``,!1):qt(e,!!n,t,!0)):qt(e,!!n,p,!1);return;case`textarea`:for(c in m=p=null,n)if(a=n[c],n.hasOwnProperty(c)&&a!=null&&!r.hasOwnProperty(c))switch(c){case`value`:break;case`children`:break;default:$(e,t,c,null,r,a)}for(s in r)if(a=r[s],o=n[s],r.hasOwnProperty(s)&&(a!=null||o!=null))switch(s){case`value`:p=a;break;case`defaultValue`:m=a;break;case`children`:break;case`dangerouslySetInnerHTML`:if(a!=null)throw Error(i(91));break;default:a!==o&&$(e,t,s,a,r,o)}Jt(e,p,m);return;case`option`:for(var h in n)if(p=n[h],n.hasOwnProperty(h)&&p!=null&&!r.hasOwnProperty(h))switch(h){case`selected`:e.selected=!1;break;default:$(e,t,h,null,r,p)}for(l in r)if(p=r[l],m=n[l],r.hasOwnProperty(l)&&p!==m&&(p!=null||m!=null))switch(l){case`selected`:e.selected=p&&typeof p!=`function`&&typeof p!=`symbol`;break;default:$(e,t,l,p,r,m)}return;case`img`:case`link`:case`area`:case`base`:case`br`:case`col`:case`embed`:case`hr`:case`keygen`:case`meta`:case`param`:case`source`:case`track`:case`wbr`:case`menuitem`:for(var g in n)p=n[g],n.hasOwnProperty(g)&&p!=null&&!r.hasOwnProperty(g)&&$(e,t,g,null,r,p);for(u in r)if(p=r[u],m=n[u],r.hasOwnProperty(u)&&p!==m&&(p!=null||m!=null))switch(u){case`children`:case`dangerouslySetInnerHTML`:if(p!=null)throw Error(i(137,t));break;default:$(e,t,u,p,r,m)}return;default:if(en(t)){for(var _ in n)p=n[_],n.hasOwnProperty(_)&&p!==void 0&&!r.hasOwnProperty(_)&&Nd(e,t,_,void 0,r,p);for(d in r)p=r[d],m=n[d],!r.hasOwnProperty(d)||p===m||p===void 0&&m===void 0||Nd(e,t,d,p,r,m);return}}for(var v in n)p=n[v],n.hasOwnProperty(v)&&p!=null&&!r.hasOwnProperty(v)&&$(e,t,v,null,r,p);for(f in r)p=r[f],m=n[f],!r.hasOwnProperty(f)||p===m||p==null&&m==null||$(e,t,f,p,r,m)}function Id(e){switch(e){case`css`:case`script`:case`font`:case`img`:case`image`:case`input`:case`link`:return!0;default:return!1}}function Ld(){if(typeof performance.getEntriesByType==`function`){for(var e=0,t=0,n=performance.getEntriesByType(`resource`),r=0;r<n.length;r++){var i=n[r],a=i.transferSize,o=i.initiatorType,s=i.duration;if(a&&s&&Id(o)){for(o=0,s=i.responseEnd,r+=1;r<n.length;r++){var c=n[r],l=c.startTime;if(l>s)break;var u=c.transferSize,d=c.initiatorType;u&&Id(d)&&(c=c.responseEnd,o+=u*(c<s?1:(s-l)/(c-l)))}if(--r,t+=8*(a+o)/(i.duration/1e3),e++,10<e)break}}if(0<e)return t/e/1e6}return navigator.connection&&(e=navigator.connection.downlink,typeof e==`number`)?e:5}var Rd=null,zd=null;function Bd(e){return e.nodeType===9?e:e.ownerDocument}function Vd(e){switch(e){case`http://www.w3.org/2000/svg`:return 1;case`http://www.w3.org/1998/Math/MathML`:return 2;default:return 0}}function Hd(e,t){if(e===0)switch(t){case`svg`:return 1;case`math`:return 2;default:return 0}return e===1&&t===`foreignObject`?0:e}function Ud(e,t){return e===`textarea`||e===`noscript`||typeof t.children==`string`||typeof t.children==`number`||typeof t.children==`bigint`||typeof t.dangerouslySetInnerHTML==`object`&&t.dangerouslySetInnerHTML!==null&&t.dangerouslySetInnerHTML.__html!=null}var Wd=null;function Gd(){var e=window.event;return e&&e.type===`popstate`?e!==Wd&&(Wd=e,!0):(Wd=null,!1)}var Kd=typeof setTimeout==`function`?setTimeout:void 0,qd=typeof clearTimeout==`function`?clearTimeout:void 0,Jd=typeof Promise==`function`?Promise:void 0,Yd=typeof queueMicrotask==`function`?queueMicrotask:Jd===void 0?Kd:function(e){return Jd.resolve(null).then(e).catch(Xd)};function Xd(e){setTimeout(function(){throw e})}function Zd(e){return e===`head`}function Qd(e,t){var n=t,r=0;do{var i=n.nextSibling;if(e.removeChild(n),i&&i.nodeType===8){if(n=i.data,n===`/$`||n===`/&`){if(r===0){e.removeChild(i),Np(t);return}r--}else if(n===`$`||n===`$?`||n===`$~`||n===`$!`||n===`&`)r++;else if(n===`html`)pf(e.ownerDocument.documentElement);else if(n===`head`){n=e.ownerDocument.head,pf(n);for(var a=n.firstChild;a;){var o=a.nextSibling,s=a.nodeName;a[St]||s===`SCRIPT`||s===`STYLE`||s===`LINK`&&a.rel.toLowerCase()===`stylesheet`||n.removeChild(a),a=o}}else n===`body`&&pf(e.ownerDocument.body)}n=i}while(n);Np(t)}function $d(e,t){var n=e;e=0;do{var r=n.nextSibling;if(n.nodeType===1?t?(n._stashedDisplay=n.style.display,n.style.display=`none`):(n.style.display=n._stashedDisplay||``,n.getAttribute(`style`)===``&&n.removeAttribute(`style`)):n.nodeType===3&&(t?(n._stashedText=n.nodeValue,n.nodeValue=``):n.nodeValue=n._stashedText||``),r&&r.nodeType===8){if(n=r.data,n===`/$`){if(e===0)break;e--}else n!==`$`&&n!==`$?`&&n!==`$~`&&n!==`$!`||e++}n=r}while(n)}function ef(e){var t=e.firstChild;for(t&&t.nodeType===10&&(t=t.nextSibling);t;){var n=t;switch(t=t.nextSibling,n.nodeName){case`HTML`:case`HEAD`:case`BODY`:ef(n),Ct(n);continue;case`SCRIPT`:case`STYLE`:continue;case`LINK`:if(n.rel.toLowerCase()===`stylesheet`)continue}e.removeChild(n)}}function tf(e,t,n,r){for(;e.nodeType===1;){var i=n;if(e.nodeName.toLowerCase()!==t.toLowerCase()){if(!r&&(e.nodeName!==`INPUT`||e.type!==`hidden`))break}else if(!r){if(t===`input`&&e.type===`hidden`){var a=i.name==null?null:``+i.name;if(i.type===`hidden`&&e.getAttribute(`name`)===a)return e}else return e}else if(!e[St])switch(t){case`meta`:if(!e.hasAttribute(`itemprop`))break;return e;case`link`:if(a=e.getAttribute(`rel`),a===`stylesheet`&&e.hasAttribute(`data-precedence`)||a!==i.rel||e.getAttribute(`href`)!==(i.href==null||i.href===``?null:i.href)||e.getAttribute(`crossorigin`)!==(i.crossOrigin==null?null:i.crossOrigin)||e.getAttribute(`title`)!==(i.title==null?null:i.title))break;return e;case`style`:if(e.hasAttribute(`data-precedence`))break;return e;case`script`:if(a=e.getAttribute(`src`),(a!==(i.src==null?null:i.src)||e.getAttribute(`type`)!==(i.type==null?null:i.type)||e.getAttribute(`crossorigin`)!==(i.crossOrigin==null?null:i.crossOrigin))&&a&&e.hasAttribute(`async`)&&!e.hasAttribute(`itemprop`))break;return e;default:return e}if(e=cf(e.nextSibling),e===null)break}return null}function nf(e,t,n){if(t===``)return null;for(;e.nodeType!==3;)if((e.nodeType!==1||e.nodeName!==`INPUT`||e.type!==`hidden`)&&!n||(e=cf(e.nextSibling),e===null))return null;return e}function rf(e,t){for(;e.nodeType!==8;)if((e.nodeType!==1||e.nodeName!==`INPUT`||e.type!==`hidden`)&&!t||(e=cf(e.nextSibling),e===null))return null;return e}function af(e){return e.data===`$?`||e.data===`$~`}function of(e){return e.data===`$!`||e.data===`$?`&&e.ownerDocument.readyState!==`loading`}function sf(e,t){var n=e.ownerDocument;if(e.data===`$~`)e._reactRetry=t;else if(e.data!==`$?`||n.readyState!==`loading`)t();else{var r=function(){t(),n.removeEventListener(`DOMContentLoaded`,r)};n.addEventListener(`DOMContentLoaded`,r),e._reactRetry=r}}function cf(e){for(;e!=null;e=e.nextSibling){var t=e.nodeType;if(t===1||t===3)break;if(t===8){if(t=e.data,t===`$`||t===`$!`||t===`$?`||t===`$~`||t===`&`||t===`F!`||t===`F`)break;if(t===`/$`||t===`/&`)return null}}return e}var lf=null;function uf(e){e=e.nextSibling;for(var t=0;e;){if(e.nodeType===8){var n=e.data;if(n===`/$`||n===`/&`){if(t===0)return cf(e.nextSibling);t--}else n!==`$`&&n!==`$!`&&n!==`$?`&&n!==`$~`&&n!==`&`||t++}e=e.nextSibling}return null}function df(e){e=e.previousSibling;for(var t=0;e;){if(e.nodeType===8){var n=e.data;if(n===`$`||n===`$!`||n===`$?`||n===`$~`||n===`&`){if(t===0)return e;t--}else n!==`/$`&&n!==`/&`||t++}e=e.previousSibling}return null}function ff(e,t,n){switch(t=Bd(n),e){case`html`:if(e=t.documentElement,!e)throw Error(i(452));return e;case`head`:if(e=t.head,!e)throw Error(i(453));return e;case`body`:if(e=t.body,!e)throw Error(i(454));return e;default:throw Error(i(451))}}function pf(e){for(var t=e.attributes;t.length;)e.removeAttributeNode(t[0]);Ct(e)}var mf=new Map,hf=new Set;function gf(e){return typeof e.getRootNode==`function`?e.getRootNode():e.nodeType===9?e:e.ownerDocument}var _f=E.d;E.d={f:vf,r:yf,D:Sf,C:Cf,L:wf,m:Tf,X:Df,S:Ef,M:Of};function vf(){var e=_f.f(),t=bu();return e||t}function yf(e){var t=Tt(e);t!==null&&t.tag===5&&t.type===`form`?Ds(t):_f.r(e)}var bf=typeof document>`u`?null:document;function xf(e,t,n){var r=bf;if(r&&typeof t==`string`&&t){var i=Wt(t);i=`link[rel="`+e+`"][href="`+i+`"]`,typeof n==`string`&&(i+=`[crossorigin="`+n+`"]`),hf.has(i)||(hf.add(i),e={rel:e,crossOrigin:n,href:t},r.querySelector(i)===null&&(t=r.createElement(`link`),Pd(t,`link`,e),A(t),r.head.appendChild(t)))}}function Sf(e){_f.D(e),xf(`dns-prefetch`,e,null)}function Cf(e,t){_f.C(e,t),xf(`preconnect`,e,t)}function wf(e,t,n){_f.L(e,t,n);var r=bf;if(r&&e&&t){var i=`link[rel="preload"][as="`+Wt(t)+`"]`;t===`image`&&n&&n.imageSrcSet?(i+=`[imagesrcset="`+Wt(n.imageSrcSet)+`"]`,typeof n.imageSizes==`string`&&(i+=`[imagesizes="`+Wt(n.imageSizes)+`"]`)):i+=`[href="`+Wt(e)+`"]`;var a=i;switch(t){case`style`:a=Af(e);break;case`script`:a=Pf(e)}mf.has(a)||(e=p({rel:`preload`,href:t===`image`&&n&&n.imageSrcSet?void 0:e,as:t},n),mf.set(a,e),r.querySelector(i)!==null||t===`style`&&r.querySelector(jf(a))||t===`script`&&r.querySelector(Ff(a))||(t=r.createElement(`link`),Pd(t,`link`,e),A(t),r.head.appendChild(t)))}}function Tf(e,t){_f.m(e,t);var n=bf;if(n&&e){var r=t&&typeof t.as==`string`?t.as:`script`,i=`link[rel="modulepreload"][as="`+Wt(r)+`"][href="`+Wt(e)+`"]`,a=i;switch(r){case`audioworklet`:case`paintworklet`:case`serviceworker`:case`sharedworker`:case`worker`:case`script`:a=Pf(e)}if(!mf.has(a)&&(e=p({rel:`modulepreload`,href:e},t),mf.set(a,e),n.querySelector(i)===null)){switch(r){case`audioworklet`:case`paintworklet`:case`serviceworker`:case`sharedworker`:case`worker`:case`script`:if(n.querySelector(Ff(a)))return}r=n.createElement(`link`),Pd(r,`link`,e),A(r),n.head.appendChild(r)}}}function Ef(e,t,n){_f.S(e,t,n);var r=bf;if(r&&e){var i=Dt(r).hoistableStyles,a=Af(e);t=t||`default`;var o=i.get(a);if(!o){var s={loading:0,preload:null};if(o=r.querySelector(jf(a)))s.loading=5;else{e=p({rel:`stylesheet`,href:e,"data-precedence":t},n),(n=mf.get(a))&&Rf(e,n);var c=o=r.createElement(`link`);A(c),Pd(c,`link`,e),c._p=new Promise(function(e,t){c.onload=e,c.onerror=t}),c.addEventListener(`load`,function(){s.loading|=1}),c.addEventListener(`error`,function(){s.loading|=2}),s.loading|=4,Lf(o,t,r)}o={type:`stylesheet`,instance:o,count:1,state:s},i.set(a,o)}}}function Df(e,t){_f.X(e,t);var n=bf;if(n&&e){var r=Dt(n).hoistableScripts,i=Pf(e),a=r.get(i);a||(a=n.querySelector(Ff(i)),a||(e=p({src:e,async:!0},t),(t=mf.get(i))&&zf(e,t),a=n.createElement(`script`),A(a),Pd(a,`link`,e),n.head.appendChild(a)),a={type:`script`,instance:a,count:1,state:null},r.set(i,a))}}function Of(e,t){_f.M(e,t);var n=bf;if(n&&e){var r=Dt(n).hoistableScripts,i=Pf(e),a=r.get(i);a||(a=n.querySelector(Ff(i)),a||(e=p({src:e,async:!0,type:`module`},t),(t=mf.get(i))&&zf(e,t),a=n.createElement(`script`),A(a),Pd(a,`link`,e),n.head.appendChild(a)),a={type:`script`,instance:a,count:1,state:null},r.set(i,a))}}function kf(e,t,n,r){var a=(a=ve.current)?gf(a):null;if(!a)throw Error(i(446));switch(e){case`meta`:case`title`:return null;case`style`:return typeof n.precedence==`string`&&typeof n.href==`string`?(t=Af(n.href),n=Dt(a).hoistableStyles,r=n.get(t),r||(r={type:`style`,instance:null,count:0,state:null},n.set(t,r)),r):{type:`void`,instance:null,count:0,state:null};case`link`:if(n.rel===`stylesheet`&&typeof n.href==`string`&&typeof n.precedence==`string`){e=Af(n.href);var o=Dt(a).hoistableStyles,s=o.get(e);if(s||(a=a.ownerDocument||a,s={type:`stylesheet`,instance:null,count:0,state:{loading:0,preload:null}},o.set(e,s),(o=a.querySelector(jf(e)))&&!o._p&&(s.instance=o,s.state.loading=5),mf.has(e)||(n={rel:`preload`,as:`style`,href:n.href,crossOrigin:n.crossOrigin,integrity:n.integrity,media:n.media,hrefLang:n.hrefLang,referrerPolicy:n.referrerPolicy},mf.set(e,n),o||Nf(a,e,n,s.state))),t&&r===null)throw Error(i(528,``));return s}if(t&&r!==null)throw Error(i(529,``));return null;case`script`:return t=n.async,n=n.src,typeof n==`string`&&t&&typeof t!=`function`&&typeof t!=`symbol`?(t=Pf(n),n=Dt(a).hoistableScripts,r=n.get(t),r||(r={type:`script`,instance:null,count:0,state:null},n.set(t,r)),r):{type:`void`,instance:null,count:0,state:null};default:throw Error(i(444,e))}}function Af(e){return`href="`+Wt(e)+`"`}function jf(e){return`link[rel="stylesheet"][`+e+`]`}function Mf(e){return p({},e,{"data-precedence":e.precedence,precedence:null})}function Nf(e,t,n,r){e.querySelector(`link[rel="preload"][as="style"][`+t+`]`)?r.loading=1:(t=e.createElement(`link`),r.preload=t,t.addEventListener(`load`,function(){return r.loading|=1}),t.addEventListener(`error`,function(){return r.loading|=2}),Pd(t,`link`,n),A(t),e.head.appendChild(t))}function Pf(e){return`[src="`+Wt(e)+`"]`}function Ff(e){return`script[async]`+e}function If(e,t,n){if(t.count++,t.instance===null)switch(t.type){case`style`:var r=e.querySelector(`style[data-href~="`+Wt(n.href)+`"]`);if(r)return t.instance=r,A(r),r;var a=p({},n,{"data-href":n.href,"data-precedence":n.precedence,href:null,precedence:null});return r=(e.ownerDocument||e).createElement(`style`),A(r),Pd(r,`style`,a),Lf(r,n.precedence,e),t.instance=r;case`stylesheet`:a=Af(n.href);var o=e.querySelector(jf(a));if(o)return t.state.loading|=4,t.instance=o,A(o),o;r=Mf(n),(a=mf.get(a))&&Rf(r,a),o=(e.ownerDocument||e).createElement(`link`),A(o);var s=o;return s._p=new Promise(function(e,t){s.onload=e,s.onerror=t}),Pd(o,`link`,r),t.state.loading|=4,Lf(o,n.precedence,e),t.instance=o;case`script`:return o=Pf(n.src),(a=e.querySelector(Ff(o)))?(t.instance=a,A(a),a):(r=n,(a=mf.get(o))&&(r=p({},n),zf(r,a)),e=e.ownerDocument||e,a=e.createElement(`script`),A(a),Pd(a,`link`,r),e.head.appendChild(a),t.instance=a);case`void`:return null;default:throw Error(i(443,t.type))}else t.type===`stylesheet`&&!(t.state.loading&4)&&(r=t.instance,t.state.loading|=4,Lf(r,n.precedence,e));return t.instance}function Lf(e,t,n){for(var r=n.querySelectorAll(`link[rel="stylesheet"][data-precedence],style[data-precedence]`),i=r.length?r[r.length-1]:null,a=i,o=0;o<r.length;o++){var s=r[o];if(s.dataset.precedence===t)a=s;else if(a!==i)break}a?a.parentNode.insertBefore(e,a.nextSibling):(t=n.nodeType===9?n.head:n,t.insertBefore(e,t.firstChild))}function Rf(e,t){e.crossOrigin??(e.crossOrigin=t.crossOrigin),e.referrerPolicy??(e.referrerPolicy=t.referrerPolicy),e.title??(e.title=t.title)}function zf(e,t){e.crossOrigin??(e.crossOrigin=t.crossOrigin),e.referrerPolicy??(e.referrerPolicy=t.referrerPolicy),e.integrity??(e.integrity=t.integrity)}var Bf=null;function Vf(e,t,n){if(Bf===null){var r=new Map,i=Bf=new Map;i.set(n,r)}else i=Bf,r=i.get(n),r||(r=new Map,i.set(n,r));if(r.has(e))return r;for(r.set(e,null),n=n.getElementsByTagName(e),i=0;i<n.length;i++){var a=n[i];if(!(a[St]||a[k]||e===`link`&&a.getAttribute(`rel`)===`stylesheet`)&&a.namespaceURI!==`http://www.w3.org/2000/svg`){var o=a.getAttribute(t)||``;o=e+o;var s=r.get(o);s?s.push(a):r.set(o,[a])}}return r}function Hf(e,t,n){e=e.ownerDocument||e,e.head.insertBefore(n,t===`title`?e.querySelector(`head > title`):null)}function Uf(e,t,n){if(n===1||t.itemProp!=null)return!1;switch(e){case`meta`:case`title`:return!0;case`style`:if(typeof t.precedence!=`string`||typeof t.href!=`string`||t.href===``)break;return!0;case`link`:if(typeof t.rel!=`string`||typeof t.href!=`string`||t.href===``||t.onLoad||t.onError)break;switch(t.rel){case`stylesheet`:return e=t.disabled,typeof t.precedence==`string`&&e==null;default:return!0}case`script`:if(t.async&&typeof t.async!=`function`&&typeof t.async!=`symbol`&&!t.onLoad&&!t.onError&&t.src&&typeof t.src==`string`)return!0}return!1}function Wf(e){return!(e.type===`stylesheet`&&!(e.state.loading&3))}function Gf(e,t,n,r){if(n.type===`stylesheet`&&(typeof r.media!=`string`||!1!==matchMedia(r.media).matches)&&!(n.state.loading&4)){if(n.instance===null){var i=Af(r.href),a=t.querySelector(jf(i));if(a){t=a._p,typeof t==`object`&&t&&typeof t.then==`function`&&(e.count++,e=Jf.bind(e),t.then(e,e)),n.state.loading|=4,n.instance=a,A(a);return}a=t.ownerDocument||t,r=Mf(r),(i=mf.get(i))&&Rf(r,i),a=a.createElement(`link`),A(a);var o=a;o._p=new Promise(function(e,t){o.onload=e,o.onerror=t}),Pd(a,`link`,r),n.instance=a}e.stylesheets===null&&(e.stylesheets=new Map),e.stylesheets.set(n,t),(t=n.state.preload)&&!(n.state.loading&3)&&(e.count++,n=Jf.bind(e),t.addEventListener(`load`,n),t.addEventListener(`error`,n))}}var Kf=0;function qf(e,t){return e.stylesheets&&e.count===0&&Xf(e,e.stylesheets),0<e.count||0<e.imgCount?function(n){var r=setTimeout(function(){if(e.stylesheets&&Xf(e,e.stylesheets),e.unsuspend){var t=e.unsuspend;e.unsuspend=null,t()}},6e4+t);0<e.imgBytes&&Kf===0&&(Kf=62500*Ld());var i=setTimeout(function(){if(e.waitingForImages=!1,e.count===0&&(e.stylesheets&&Xf(e,e.stylesheets),e.unsuspend)){var t=e.unsuspend;e.unsuspend=null,t()}},(e.imgBytes>Kf?50:800)+t);return e.unsuspend=n,function(){e.unsuspend=null,clearTimeout(r),clearTimeout(i)}}:null}function Jf(){if(this.count--,this.count===0&&(this.imgCount===0||!this.waitingForImages)){if(this.stylesheets)Xf(this,this.stylesheets);else if(this.unsuspend){var e=this.unsuspend;this.unsuspend=null,e()}}}var Yf=null;function Xf(e,t){e.stylesheets=null,e.unsuspend!==null&&(e.count++,Yf=new Map,t.forEach(Zf,e),Yf=null,Jf.call(e))}function Zf(e,t){if(!(t.state.loading&4)){var n=Yf.get(e);if(n)var r=n.get(null);else{n=new Map,Yf.set(e,n);for(var i=e.querySelectorAll(`link[data-precedence],style[data-precedence]`),a=0;a<i.length;a++){var o=i[a];(o.nodeName===`LINK`||o.getAttribute(`media`)!==`not all`)&&(n.set(o.dataset.precedence,o),r=o)}r&&n.set(null,r)}i=t.instance,o=i.getAttribute(`data-precedence`),a=n.get(o)||r,a===r&&n.set(null,i),n.set(o,i),this.count++,r=Jf.bind(this),i.addEventListener(`load`,r),i.addEventListener(`error`,r),a?a.parentNode.insertBefore(i,a.nextSibling):(e=e.nodeType===9?e.head:e,e.insertBefore(i,e.firstChild)),t.state.loading|=4}}var Qf={$$typeof:S,Provider:null,Consumer:null,_currentValue:de,_currentValue2:de,_threadCount:0};function $f(e,t,n,r,i,a,o,s,c){this.tag=1,this.containerInfo=e,this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.next=this.pendingContext=this.context=this.cancelPendingCommit=null,this.callbackPriority=0,this.expirationTimes=at(-1),this.entangledLanes=this.shellSuspendCounter=this.errorRecoveryDisabledLanes=this.expiredLanes=this.warmLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=at(0),this.hiddenUpdates=at(null),this.identifierPrefix=r,this.onUncaughtError=i,this.onCaughtError=a,this.onRecoverableError=o,this.pooledCache=null,this.pooledCacheLanes=0,this.formState=c,this.incompleteTransitions=new Map}function ep(e,t,n,r,i,a,o,s,c,l,u,d){return e=new $f(e,t,n,o,c,l,u,d,s),t=1,!0===a&&(t|=24),a=fi(3,null,null,t),e.current=a,a.stateNode=e,t=ua(),t.refCount++,e.pooledCache=t,t.refCount++,a.memoizedState={element:r,isDehydrated:n,cache:t},Ua(a),e}function tp(e){return e?(e=ui,e):ui}function np(e,t,n,r,i,a){i=tp(i),r.context===null?r.context=i:r.pendingContext=i,r=Ga(t),r.payload={element:n},a=a===void 0?null:a,a!==null&&(r.callback=a),n=Ka(e,r,t),n!==null&&(hu(n,e,t),qa(n,e,t))}function rp(e,t){if(e=e.memoizedState,e!==null&&e.dehydrated!==null){var n=e.retryLane;e.retryLane=n!==0&&n<t?n:t}}function ip(e,t){rp(e,t),(e=e.alternate)&&rp(e,t)}function ap(e){if(e.tag===13||e.tag===31){var t=si(e,67108864);t!==null&&hu(t,e,67108864),ip(e,67108864)}}function op(e){if(e.tag===13||e.tag===31){var t=pu();t=dt(t);var n=si(e,t);n!==null&&hu(n,e,t),ip(e,t)}}var sp=!0;function cp(e,t,n,r){var i=T.T;T.T=null;var a=E.p;try{E.p=2,up(e,t,n,r)}finally{E.p=a,T.T=i}}function lp(e,t,n,r){var i=T.T;T.T=null;var a=E.p;try{E.p=8,up(e,t,n,r)}finally{E.p=a,T.T=i}}function up(e,t,n,r){if(sp){var i=dp(r);if(i===null)wd(e,t,r,fp,n),Cp(e,r);else if(Tp(i,e,t,n,r))r.stopPropagation();else if(Cp(e,r),t&4&&-1<Sp.indexOf(e)){for(;i!==null;){var a=Tt(i);if(a!==null)switch(a.tag){case 3:if(a=a.stateNode,a.current.memoizedState.isDehydrated){var o=et(a.pendingLanes);if(o!==0){var s=a;for(s.pendingLanes|=2,s.entangledLanes|=2;o;){var c=1<<31-qe(o);s.entanglements[1]|=c,o&=~c}rd(a),!(G&6)&&(tu=O()+500,id(0,!1))}}break;case 31:case 13:s=si(a,2),s!==null&&hu(s,a,2),bu(),ip(a,2)}if(a=dp(r),a===null&&wd(e,t,r,fp,n),a===i)break;i=a}i!==null&&r.stopPropagation()}else wd(e,t,r,null,n)}}function dp(e){return e=sn(e),pp(e)}var fp=null;function pp(e){if(fp=null,e=wt(e),e!==null){var t=o(e);if(t===null)e=null;else{var n=t.tag;if(n===13){if(e=s(t),e!==null)return e;e=null}else if(n===31){if(e=c(t),e!==null)return e;e=null}else if(n===3){if(t.stateNode.current.memoizedState.isDehydrated)return t.tag===3?t.stateNode.containerInfo:null;e=null}else t!==e&&(e=null)}}return fp=e,null}function mp(e){switch(e){case`beforetoggle`:case`cancel`:case`click`:case`close`:case`contextmenu`:case`copy`:case`cut`:case`auxclick`:case`dblclick`:case`dragend`:case`dragstart`:case`drop`:case`focusin`:case`focusout`:case`input`:case`invalid`:case`keydown`:case`keypress`:case`keyup`:case`mousedown`:case`mouseup`:case`paste`:case`pause`:case`play`:case`pointercancel`:case`pointerdown`:case`pointerup`:case`ratechange`:case`reset`:case`resize`:case`seeked`:case`submit`:case`toggle`:case`touchcancel`:case`touchend`:case`touchstart`:case`volumechange`:case`change`:case`selectionchange`:case`textInput`:case`compositionstart`:case`compositionend`:case`compositionupdate`:case`beforeblur`:case`afterblur`:case`beforeinput`:case`blur`:case`fullscreenchange`:case`focus`:case`hashchange`:case`popstate`:case`select`:case`selectstart`:return 2;case`drag`:case`dragenter`:case`dragexit`:case`dragleave`:case`dragover`:case`mousemove`:case`mouseout`:case`mouseover`:case`pointermove`:case`pointerout`:case`pointerover`:case`scroll`:case`touchmove`:case`wheel`:case`mouseenter`:case`mouseleave`:case`pointerenter`:case`pointerleave`:return 8;case`message`:switch(Ie()){case Le:return 2;case Re:return 8;case ze:case Be:return 32;case Ve:return 268435456;default:return 32}default:return 32}}var hp=!1,gp=null,_p=null,vp=null,yp=new Map,bp=new Map,xp=[],Sp=`mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset`.split(` `);function Cp(e,t){switch(e){case`focusin`:case`focusout`:gp=null;break;case`dragenter`:case`dragleave`:_p=null;break;case`mouseover`:case`mouseout`:vp=null;break;case`pointerover`:case`pointerout`:yp.delete(t.pointerId);break;case`gotpointercapture`:case`lostpointercapture`:bp.delete(t.pointerId)}}function wp(e,t,n,r,i,a){return e===null||e.nativeEvent!==a?(e={blockedOn:t,domEventName:n,eventSystemFlags:r,nativeEvent:a,targetContainers:[i]},t!==null&&(t=Tt(t),t!==null&&ap(t)),e):(e.eventSystemFlags|=r,t=e.targetContainers,i!==null&&t.indexOf(i)===-1&&t.push(i),e)}function Tp(e,t,n,r,i){switch(t){case`focusin`:return gp=wp(gp,e,t,n,r,i),!0;case`dragenter`:return _p=wp(_p,e,t,n,r,i),!0;case`mouseover`:return vp=wp(vp,e,t,n,r,i),!0;case`pointerover`:var a=i.pointerId;return yp.set(a,wp(yp.get(a)||null,e,t,n,r,i)),!0;case`gotpointercapture`:return a=i.pointerId,bp.set(a,wp(bp.get(a)||null,e,t,n,r,i)),!0}return!1}function Ep(e){var t=wt(e.target);if(t!==null){var n=o(t);if(n!==null){if(t=n.tag,t===13){if(t=s(n),t!==null){e.blockedOn=t,mt(e.priority,function(){op(n)});return}}else if(t===31){if(t=c(n),t!==null){e.blockedOn=t,mt(e.priority,function(){op(n)});return}}else if(t===3&&n.stateNode.current.memoizedState.isDehydrated){e.blockedOn=n.tag===3?n.stateNode.containerInfo:null;return}}}e.blockedOn=null}function Dp(e){if(e.blockedOn!==null)return!1;for(var t=e.targetContainers;0<t.length;){var n=dp(e.nativeEvent);if(n===null){n=e.nativeEvent;var r=new n.constructor(n.type,n);on=r,n.target.dispatchEvent(r),on=null}else return t=Tt(n),t!==null&&ap(t),e.blockedOn=n,!1;t.shift()}return!0}function Op(e,t,n){Dp(e)&&n.delete(t)}function kp(){hp=!1,gp!==null&&Dp(gp)&&(gp=null),_p!==null&&Dp(_p)&&(_p=null),vp!==null&&Dp(vp)&&(vp=null),yp.forEach(Op),bp.forEach(Op)}function Ap(e,n){e.blockedOn===n&&(e.blockedOn=null,hp||(hp=!0,t.unstable_scheduleCallback(t.unstable_NormalPriority,kp)))}var jp=null;function Mp(e){jp!==e&&(jp=e,t.unstable_scheduleCallback(t.unstable_NormalPriority,function(){jp===e&&(jp=null);for(var t=0;t<e.length;t+=3){var n=e[t],r=e[t+1],i=e[t+2];if(typeof r!=`function`){if(pp(r||n)===null)continue;break}var a=Tt(n);a!==null&&(e.splice(t,3),t-=3,Ts(a,{pending:!0,data:i,method:n.method,action:r},r,i))}}))}function Np(e){function t(t){return Ap(t,e)}gp!==null&&Ap(gp,e),_p!==null&&Ap(_p,e),vp!==null&&Ap(vp,e),yp.forEach(t),bp.forEach(t);for(var n=0;n<xp.length;n++){var r=xp[n];r.blockedOn===e&&(r.blockedOn=null)}for(;0<xp.length&&(n=xp[0],n.blockedOn===null);)Ep(n),n.blockedOn===null&&xp.shift();if(n=(e.ownerDocument||e).$$reactFormReplay,n!=null)for(r=0;r<n.length;r+=3){var i=n[r],a=n[r+1],o=i[gt]||null;if(typeof a==`function`)o||Mp(n);else if(o){var s=null;if(a&&a.hasAttribute(`formAction`)){if(i=a,o=a[gt]||null)s=o.formAction;else if(pp(i)!==null)continue}else s=o.action;typeof s==`function`?n[r+1]=s:(n.splice(r,3),r-=3),Mp(n)}}}function Pp(){function e(e){e.canIntercept&&e.info===`react-transition`&&e.intercept({handler:function(){return new Promise(function(e){return i=e})},focusReset:`manual`,scroll:`manual`})}function t(){i!==null&&(i(),i=null),r||setTimeout(n,20)}function n(){if(!r&&!navigation.transition){var e=navigation.currentEntry;e&&e.url!=null&&navigation.navigate(e.url,{state:e.getState(),info:`react-transition`,history:`replace`})}}if(typeof navigation==`object`){var r=!1,i=null;return navigation.addEventListener(`navigate`,e),navigation.addEventListener(`navigatesuccess`,t),navigation.addEventListener(`navigateerror`,t),setTimeout(n,100),function(){r=!0,navigation.removeEventListener(`navigate`,e),navigation.removeEventListener(`navigatesuccess`,t),navigation.removeEventListener(`navigateerror`,t),i!==null&&(i(),i=null)}}}function Fp(e){this._internalRoot=e}Ip.prototype.render=Fp.prototype.render=function(e){var t=this._internalRoot;if(t===null)throw Error(i(409));var n=t.current;np(n,pu(),e,t,null,null)},Ip.prototype.unmount=Fp.prototype.unmount=function(){var e=this._internalRoot;if(e!==null){this._internalRoot=null;var t=e.containerInfo;np(e.current,2,null,e,null,null),bu(),t[_t]=null}};function Ip(e){this._internalRoot=e}Ip.prototype.unstable_scheduleHydration=function(e){if(e){var t=pt();e={blockedOn:null,target:e,priority:t};for(var n=0;n<xp.length&&t!==0&&t<xp[n].priority;n++);xp.splice(n,0,e),n===0&&Ep(e)}};var Lp=n.version;if(Lp!==`19.2.8`)throw Error(i(527,Lp,`19.2.8`));E.findDOMNode=function(e){var t=e._reactInternals;if(t===void 0)throw typeof e.render==`function`?Error(i(188)):(e=Object.keys(e).join(`,`),Error(i(268,e)));return e=u(t),e=e===null?null:d(e),e=e===null?null:e.stateNode,e};var Rp={bundleType:0,version:`19.2.8`,rendererPackageName:`react-dom`,currentDispatcherRef:T,reconcilerVersion:`19.2.8`};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<`u`){var zp=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!zp.isDisabled&&zp.supportsFiber)try{We=zp.inject(Rp),Ge=zp}catch{}}e.createRoot=function(e,t){if(!a(e))throw Error(i(299));var n=!1,r=``,o=Js,s=Ys,c=Xs;return t!=null&&(!0===t.unstable_strictMode&&(n=!0),t.identifierPrefix!==void 0&&(r=t.identifierPrefix),t.onUncaughtError!==void 0&&(o=t.onUncaughtError),t.onCaughtError!==void 0&&(s=t.onCaughtError),t.onRecoverableError!==void 0&&(c=t.onRecoverableError)),t=ep(e,1,!1,null,null,n,r,null,o,s,c,Pp),e[_t]=t.current,Sd(e),new Fp(t)}})),v=s(((e,t)=>{function n(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>`u`||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!=`function`))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(n)}catch(e){console.error(e)}}n(),t.exports=_()})),y=e=>e.replace(/([a-z0-9])([A-Z])/g,`$1-$2`).toLowerCase(),b=e=>e.replace(/^([A-Z])|[\s-_]+(\w)/g,(e,t,n)=>n?n.toUpperCase():t.toLowerCase()),x=e=>{let t=b(e);return t.charAt(0).toUpperCase()+t.slice(1)},ee=(...e)=>e.filter((e,t,n)=>!!e&&e.trim()!==``&&n.indexOf(e)===t).join(` `).trim(),S=e=>{for(let t in e)if(t.startsWith(`aria-`)||t===`role`||t===`title`)return!0},C={xmlns:`http://www.w3.org/2000/svg`,width:24,height:24,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:2,strokeLinecap:`round`,strokeLinejoin:`round`},w=u(m()),te=(0,w.forwardRef)(({color:e=`currentColor`,size:t=24,strokeWidth:n=2,absoluteStrokeWidth:r,className:i=``,children:a,iconNode:o,...s},c)=>(0,w.createElement)(`svg`,{ref:c,...C,width:t,height:t,stroke:e,strokeWidth:r?Number(n)*24/Number(t):n,className:ee(`lucide`,i),...!a&&!S(s)&&{"aria-hidden":`true`},...s},[...o.map(([e,t])=>(0,w.createElement)(e,t)),...Array.isArray(a)?a:[a]])),ne=(e,t)=>{let n=(0,w.forwardRef)(({className:n,...r},i)=>(0,w.createElement)(te,{ref:i,iconNode:t,className:ee(`lucide-${y(x(e))}`,`lucide-${e}`,n),...r}));return n.displayName=x(e),n},re=ne(`chevron-right`,[[`path`,{d:`m9 18 6-6-6-6`,key:`mthhwq`}]]),ie=ne(`rotate-ccw`,[[`path`,{d:`M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8`,key:`1357e3`}],[`path`,{d:`M3 3v5h5`,key:`1xhq8a`}]]),ae=ne(`volume-2`,[[`path`,{d:`M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z`,key:`uqj9uw`}],[`path`,{d:`M16 9a5 5 0 0 1 0 6`,key:`1q6k2b`}],[`path`,{d:`M19.364 18.364a9 9 0 0 0 0-12.728`,key:`ijwkga`}]]),oe=ne(`volume-x`,[[`path`,{d:`M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z`,key:`uqj9uw`}],[`line`,{x1:`22`,x2:`16`,y1:`9`,y2:`15`,key:`1ewh16`}],[`line`,{x1:`16`,x2:`22`,y1:`9`,y2:`15`,key:`5ykzw1`}]]),se=e=>{let t,n=new Set,r=(e,r)=>{let i=typeof e==`function`?e(t):e;if(!Object.is(i,t)){let e=t;t=r??(typeof i!=`object`||!i)?i:Object.assign({},t,i),n.forEach(n=>n(t,e))}},i=()=>t,a={setState:r,getState:i,getInitialState:()=>o,subscribe:e=>(n.add(e),()=>n.delete(e))},o=t=e(r,i,a);return a},ce=(e=>e?se(e):se),le=e=>e;function ue(e,t=le){let n=w.useSyncExternalStore(e.subscribe,w.useCallback(()=>t(e.getState()),[e,t]),w.useCallback(()=>t(e.getInitialState()),[e,t]));return w.useDebugValue(n),n}var T=e=>{let t=ce(e),n=e=>ue(t,e);return Object.assign(n,t),n},E=(e=>e?T(e):T),de=v(),fe=8,pe=5,me=100,he=50,D=1;function ge(){D=1}function _e(e,t){return e.statuses.find(e=>e.type===t)}function ve(e,t,n,r,i){let a=e.statuses.find(e=>e.type===t);if(a){let t={...a,source:n,duration:Math.max(a.duration,r),value:i};return{unit:{...e,statuses:e.statuses.map(e=>e.id===a.id?t:e)},applied:t,refreshed:!0}}let o={id:`st-${D++}`,type:t,source:n,duration:r,value:i};return{unit:{...e,statuses:[...e.statuses,o]},applied:o,refreshed:!1}}function ye(e,t,n){let r=_e(e,t),i=_e(e,n),a=1;return r&&(a+=r.value),i&&(a-=i.value),Math.max(.4,a)}function be(e){return Math.max(1,Math.round(e.atk*ye(e,`ATK_UP`,`ATK_DOWN`)))}function xe(e){return Math.max(0,Math.round(e.def*ye(e,`DEF_UP`,`DEF_DOWN`)))}function Se(e){return Math.max(1,Math.round(e.spd*ye(e,`SPD_UP`,`SPD_DOWN`)))}function Ce(e){return _e(e,`GUARD`)?.5:1}var we={ATK_UP:`ATK UP`,DEF_UP:`DEF UP`,SPD_UP:`SPD UP`,GUARD:`GUARD`,BLEED:`BLEED`,ATK_DOWN:`ATK DOWN`,DEF_DOWN:`DEF DOWN`,SPD_DOWN:`SPD DOWN`},Te={ATK_UP:`ATK+`,DEF_UP:`DEF+`,SPD_UP:`SPD+`,GUARD:`GRD`,BLEED:`BLD`,ATK_DOWN:`ATK-`,DEF_DOWN:`DEF-`,SPD_DOWN:`SPD-`};function Ee(e,t,n){let r=e*t,i=xe(n),a=i/(i+50);return Math.max(1,Math.round(r*(1-a)))}function De(e,t,n,r){let i=Math.round(e+n*t);return Math.max(0,Math.min(i,r.maxHp-r.hp))}function Oe(e,t){return e>=0&&e<8&&t>=0&&t<5}function ke(e,t){return Math.max(Math.abs(e.c-t.c),Math.abs(e.r-t.r))}function Ae(e,t){return`${e},${t}`}function je(e,t){let n=new Set;for(let r of e)r.defeated||t&&r.id===t||n.add(Ae(r.c,r.r));return n}function Me(e,t,n){return e.find(e=>!e.defeated&&e.c===t&&e.r===n)}function Ne(e,t){let n=[];for(let[r,i]of[[1,0],[-1,0],[0,1],[0,-1]]){let a=e+r,o=t+i;Oe(a,o)&&n.push({c:a,r:o})}return n}function Pe(e,t,n=e.move){if(n<=0)return[];let r=je(t,e.id),i=new Set([Ae(e.c,e.r)]),a=[],o=[{c:e.c,r:e.r,d:0}];for(;o.length;){let e=o.shift();if(e.d!==n)for(let t of Ne(e.c,e.r)){let n=Ae(t.c,t.r);i.has(n)||r.has(n)||(i.add(n),a.push(t),o.push({...t,d:e.d+1}))}}return a}function Fe(e,t,n,r){return Oe(t,n)&&!je(e,r).has(Ae(t,n))}function O(e,t){let n=t/4,r=26+n*52,i=34+n*8,a=e/7;return{x:50-i+i*2*a,y:r}}function Ie(e,t,n){let r=ke(e,t);return r>=n.minRange&&r<=n.maxRange}function Le(e,t){return e.filter(e=>!e.defeated&&(!t||e.team===t))}function Re(e,t,n,r){return Le(e,r).filter(e=>ke(e,t)<=n)}function ze(e,t,n,r,i){switch(n.targetType){case`SELF`:return t.defeated?[]:[t];case`ALLY_SINGLE`:{let i=e.find(e=>e.id===r);return!i||i.defeated||i.team!==t.team||!Ie(t,i,n)?[]:[i]}case`ENEMY_SINGLE`:{let i=e.find(e=>e.id===r);return!i||i.defeated||i.team===t.team||!Ie(t,i,n)?[]:[i]}case`ALLY_AOE`:return Re(e,{c:t.c,r:t.r},n.radius,t.team);case`ENEMY_AOE`:return Re(e,{c:t.c,r:t.r},n.radius,t.team===`ally`?`enemy`:`ally`);case`AREA_RADIUS`:{let a=null;if(i&&Oe(i.c,i.r))a=i;else if(r){let t=e.find(e=>e.id===r);t&&(a={c:t.c,r:t.r})}if(!a||!Ie(t,a,n))return[];let o=t.team===`ally`?`enemy`:`ally`;return Re(e,a,n.radius,o)}default:return[]}}function Be(e,t,n){switch(n.targetType){case`SELF`:case`ALLY_AOE`:case`ENEMY_AOE`:return[t.id];case`ALLY_SINGLE`:return Le(e,t.team).filter(e=>Ie(t,e,n)).map(e=>e.id);case`ENEMY_SINGLE`:return Le(e,t.team===`ally`?`enemy`:`ally`).filter(e=>Ie(t,e,n)).map(e=>e.id);case`AREA_RADIUS`:return Le(e,t.team===`ally`?`enemy`:`ally`).filter(e=>Ie(t,e,n)).map(e=>e.id);default:return[]}}function Ve(e){return e.targetType===`ALLY_SINGLE`||e.targetType===`ENEMY_SINGLE`||e.targetType===`AREA_RADIUS`}function He(e){return e===`SELF`||e===`ALLY_SINGLE`||e===`ENEMY_SINGLE`||e===`ALLY_AOE`||e===`ENEMY_AOE`||e===`AREA_RADIUS`}function Ue(e,t){return t.meter===e.meter?Se(t)-Se(e)||e.id.localeCompare(t.id):t.meter-e.meter}function We(e){let t=e.map(e=>({...e}));for(let e=0;e<400;e++){if(Le(t).filter(e=>e.meter>=100).length)return t;for(let e of t)e.defeated||(e.meter+=Se(e))}return t}function Ge(e){let t=Le(e).filter(e=>e.meter>=100);return t.length?(t.sort(Ue),t[0].id):null}function Ke(e){return{...e,meter:Math.max(0,e.meter-100),hasMoved:!1,hasActed:!1}}function qe(e,t=6){let n=[],r=e.units.map(e=>({...e,statuses:e.statuses.map(e=>({...e})),cooldowns:{...e.cooldowns}}));if(e.activeId){let t=r.find(t=>t.id===e.activeId&&!t.defeated);t&&n.push(t.id)}for(;n.length<t;){r=We(r);let e=Ge(r);if(!e)break;n.push(e),r=r.map(t=>t.id===e?Ke(t):t)}return n.slice(0,t)}var Je={"alpha-strike":{id:`alpha-strike`,name:`STRIKE`,desc:`Melee hit. Range 1.`,slot:`A1`,cooldownMax:0,targetType:`ENEMY_SINGLE`,minRange:1,maxRange:1,radius:0,effects:[{kind:`damage`,multiplier:1,on:`hits`}]},"alpha-rend":{id:`alpha-rend`,name:`REND`,desc:`Heavy melee hit. Applies Bleed for 2 turns.`,slot:`A2`,cooldownMax:3,targetType:`ENEMY_SINGLE`,minRange:1,maxRange:1,radius:0,effects:[{kind:`damage`,multiplier:1.45,on:`hits`},{kind:`status`,status:`BLEED`,duration:2,value:8,on:`hits`}]},"alpha-howl":{id:`alpha-howl`,name:`HOWL`,desc:`Squad pressure. Nearby allies gain ATK and SPD for 2 turns.`,slot:`A3`,cooldownMax:4,targetType:`ALLY_AOE`,minRange:0,maxRange:0,radius:2,effects:[{kind:`status`,status:`ATK_UP`,duration:2,value:.3,on:`aoe_allies`},{kind:`status`,status:`SPD_UP`,duration:2,value:.3,on:`aoe_allies`}]},"u02-shot":{id:`u02-shot`,name:`SHOT`,desc:`Single-target ranged fire.`,slot:`A1`,cooldownMax:0,targetType:`ENEMY_SINGLE`,minRange:1,maxRange:3,radius:0,effects:[{kind:`damage`,multiplier:1,on:`hits`}]},"u02-burst":{id:`u02-burst`,name:`BURST`,desc:`High-damage ranged shot.`,slot:`A2`,cooldownMax:3,targetType:`ENEMY_SINGLE`,minRange:1,maxRange:3,radius:0,effects:[{kind:`damage`,multiplier:1.55,on:`hits`}]},"u02-suppress":{id:`u02-suppress`,name:`SUPPRESS`,desc:`Lowers enemy ATK for 2 turns.`,slot:`A3`,cooldownMax:3,targetType:`ENEMY_SINGLE`,minRange:1,maxRange:3,radius:0,effects:[{kind:`damage`,multiplier:.7,on:`hits`},{kind:`status`,status:`ATK_DOWN`,duration:2,value:.3,on:`hits`}]},"u03-tap":{id:`u03-tap`,name:`TAP`,desc:`Light ranged contact fire.`,slot:`A1`,cooldownMax:0,targetType:`ENEMY_SINGLE`,minRange:1,maxRange:2,radius:0,effects:[{kind:`damage`,multiplier:.75,on:`hits`}]},"u03-mend":{id:`u03-mend`,name:`MEND`,desc:`Restore HP to one ally.`,slot:`A2`,cooldownMax:2,targetType:`ALLY_SINGLE`,minRange:0,maxRange:3,radius:0,effects:[{kind:`heal`,base:32,scale:.4,on:`primary`}]},"u03-pack":{id:`u03-pack`,name:`PACK SUPPORT`,desc:`Group mend. Nearby allies gain DEF for 2 turns.`,slot:`A3`,cooldownMax:4,targetType:`ALLY_AOE`,minRange:0,maxRange:0,radius:2,effects:[{kind:`heal`,base:18,scale:.2,on:`aoe_allies`},{kind:`status`,status:`DEF_UP`,duration:2,value:.4,on:`aoe_allies`}]},"hostile-strike":{id:`hostile-strike`,name:`STRIKE`,desc:`Melee contact.`,slot:`A1`,cooldownMax:0,targetType:`ENEMY_SINGLE`,minRange:1,maxRange:1,radius:0,effects:[{kind:`damage`,multiplier:1,on:`hits`}]},"hostile-maul":{id:`hostile-maul`,name:`MAUL`,desc:`Heavy melee. Lowers ATK for 1 turn.`,slot:`A2`,cooldownMax:3,targetType:`ENEMY_SINGLE`,minRange:1,maxRange:1,radius:0,effects:[{kind:`damage`,multiplier:1.3,on:`hits`},{kind:`status`,status:`ATK_DOWN`,duration:1,value:.25,on:`hits`}]},"leader-strike":{id:`leader-strike`,name:`STRIKE`,desc:`Heavy melee contact.`,slot:`A1`,cooldownMax:0,targetType:`ENEMY_SINGLE`,minRange:1,maxRange:1,radius:0,effects:[{kind:`damage`,multiplier:1,on:`hits`}]},"leader-crush":{id:`leader-crush`,name:`CRUSH`,desc:`Devastating melee blow.`,slot:`A2`,cooldownMax:3,targetType:`ENEMY_SINGLE`,minRange:1,maxRange:1,radius:0,effects:[{kind:`damage`,multiplier:1.5,on:`hits`}]},"leader-intimidate":{id:`leader-intimidate`,name:`INTIMIDATE`,desc:`Tactical pressure. Lowers target ATK for 2 turns.`,slot:`A3`,cooldownMax:4,targetType:`ENEMY_SINGLE`,minRange:1,maxRange:2,radius:0,effects:[{kind:`damage`,multiplier:.55,on:`hits`},{kind:`status`,status:`ATK_DOWN`,duration:2,value:.3,on:`hits`}]}};function Ye(e){let t=Je[e];if(!t)throw Error(`Unknown skill ${e}`);return t}function Xe(e){return e.skillIds.map(Ye)}function Ze(e,t){return Math.max(0,e.cooldowns[t]??0)}function Qe(e,t){return Ze(e,t.id)<=0}function $e(e,t,n){return e.map(e=>e.id===t?n(e):e)}function et(e,t,n,r){let i=e.units.find(t=>t.id===e.activeId);if(!i||i.defeated||i.hasActed)return{state:e,events:[],ok:!1,reason:`no-actor`};if(!i.skillIds.includes(t))return{state:e,events:[],ok:!1,reason:`unknown-skill`};let a=Ye(t);if(!Qe(i,a))return{state:e,events:[],ok:!1,reason:`cooldown`};if(Ve(a)&&!n&&!r)return{state:e,events:[],ok:!1,reason:`need-target`};let o=ze(e.units,i,a,n,r);if(Ve(a)&&o.length===0)return{state:e,events:[],ok:!1,reason:`invalid-target`};!Ve(a)&&a.targetType!==`SELF`&&o.length;let s=[],c=e.units.map(e=>({...e,statuses:e.statuses.map(e=>({...e})),cooldowns:{...e.cooldowns}})),l=e.hostilesEliminated,u=e.damageTaken,d=n?c.find(e=>e.id===n):o[0],f=be(i),p=d?(e=>c.find(t=>t.id===e)?.name??e)(d.id):a.targetType===`SELF`?i.name:`squad`;s.push({type:`ticker`,text:`${i.name}  ·  ${a.name}${p&&p!==i.name?`  →  ${p}`:``}`});let m=e=>{if(e===`self`)return[c.find(e=>e.id===i.id)];if(e===`primary`){let e=d?c.find(e=>e.id===d.id):c.find(e=>e.id===i.id);return e?[e]:[]}return e===`aoe_allies`?o.filter(e=>e.team===i.team).map(e=>c.find(t=>t.id===e.id)):e===`aoe_enemies`?o.filter(e=>e.team!==i.team).map(e=>c.find(t=>t.id===e.id)):o.map(e=>c.find(t=>t.id===e.id)).filter(Boolean)};for(let e of a.effects){let t=m(e.on??`hits`).filter(Boolean);for(let n of t){let t=c.find(e=>e.id===n.id);if(!(!t||t.defeated)){if(e.kind===`damage`){let n=Ee(f,e.multiplier??1,t);n=Math.max(1,Math.round(n*Ce(t)));let r=Math.max(0,t.hp-n),i=r<=0;t.team===`ally`&&(u+=n),i&&t.team===`enemy`&&!t.defeated&&(l+=1),c=$e(c,t.id,e=>({...e,hp:r,defeated:i,statuses:i?[]:e.statuses})),s.push({type:`damage`,unitId:t.id,amount:n,text:`-${n}`,kind:`dmg`}),i&&s.push({type:`defeat`,unitId:t.id,text:`DOWN`,kind:`info`})}else if(e.kind===`heal`){let n=De(e.base??0,e.scale??0,f,t);n>0&&(c=$e(c,t.id,e=>({...e,hp:Math.min(e.maxHp,e.hp+n)})),s.push({type:`heal`,unitId:t.id,amount:n,text:`+${n}`,kind:`heal`}))}else if(e.kind===`status`&&e.status){let n=e.duration??1,r=e.value??0,i=ve(t,e.status,a.id,n,r);c=$e(c,t.id,()=>i.unit),s.push({type:`status`,unitId:t.id,text:we[e.status],kind:e.status===`GUARD`?`guard`:`status`})}}}}return c=$e(c,i.id,e=>({...e,hasActed:!0,cooldowns:{...e.cooldowns,[a.id]:a.cooldownMax}})),a.cooldownMax>0&&s.push({type:`cooldown`,unitId:i.id,text:a.name}),{state:{...e,units:c,hostilesEliminated:l,damageTaken:u,actionSkillId:null,mode:`locked`},events:s,ok:!0}}function tt(e,t){return Xe(t).map(n=>{let r=Ze(t,n.id),i=r<=0;return{...n,ready:i,cd:r,targets:i?Be(e.units,t,n):[]}})}function nt(e,t){return Le(t,e.team===`ally`?`enemy`:`ally`)}function rt(e,t){return Le(t,e.team)}function it(e){let t=0;return e.role===`alpha`&&(t+=40),e.role===`support`&&(t+=12),t+=(1-e.hp/e.maxHp)*30,t+=be(e)*.4,t}function at(e,t,n){if(!t.length)return null;let r=[...t].sort((t,n)=>e.role===`leader`?it(n)-it(t)||t.hp-n.hp:t.hp-n.hp||ke(e,t)-ke(e,n));return(r.filter(t=>Ie(e,t,n))[0]??r[0])||null}function ot(e,t,n,r){if(Ie(e,r,n))return null;let i=Pe(e,t),a=null,o=1e9;for(let e of i){let t=ke(e,r),i=(t>=n.minRange&&t<=n.maxRange?0:100)+t;i<o&&(o=i,a=e)}return a}function st(e){let t=e.units.find(t=>t.id===e.activeId);if(!t||t.defeated||t.team!==`enemy`)return{type:`skip`};let n=tt(e,t).filter(e=>e.ready),r=nt(t,e.units);if(!r.length)return{type:`skip`};let i=[...n].sort((e,n)=>{let r={A3:0,A2:1,A1:2}[e.slot]-{A3:0,A2:1,A1:2}[n.slot];return t.role===`leader`&&e.id.includes(`intimidate`)&&n.slot!==`A3`?-1:r});for(let a of i){if(a.targetType===`SELF`||a.targetType===`ALLY_AOE`||a.targetType===`ENEMY_AOE`){if(a.targetType===`ALLY_AOE`&&rt(t,e.units).filter(e=>e.hp<e.maxHp*.85).length===0&&a.effects.every(e=>e.kind!==`damage`))continue;return t.hasMoved,{type:`skill`,skillId:a.id}}let i=at(t,r,a);if(i){if(Ie(t,i,a))return{type:`skill`,skillId:a.id,targetId:i.id};if(!t.hasMoved){let r=ot(t,e.units,a,i);if(r){let e={...t,c:r.c,r:r.r};if(Ie(e,i,a))return{type:`move`,to:r,then:{type:`skill`,skillId:a.id,targetId:i.id}};let o=n.find(e=>e.slot===`A1`)??a;return Ie(e,i,o)?{type:`move`,to:r,then:{type:`skill`,skillId:o.id,targetId:i.id}}:{type:`move`,to:r}}}}}if(!t.hasMoved){let i=[...r].sort((e,t)=>it(t)-it(e))[0],a=Pe(t,e.units),o=null,s=ke(t,i);for(let e of a){let t=ke(e,i);t<s&&(s=t,o=e)}if(o){let e={...t,c:o.c,r:o.r},i=n.find(e=>e.slot===`A1`);if(i){let t=at(e,r,i);if(t&&Ie(e,t,i))return{type:`move`,to:o,then:{type:`skill`,skillId:i.id,targetId:t.id}}}return{type:`move`,to:o}}}return{type:`skip`}}function ct(e,t){let n=e.units.find(t=>t.id===e.activeId);if(!n)return!1;if(t.type===`skip`)return!0;if(t.type===`move`)return Pe(n,e.units).some(e=>e.c===t.to.c&&e.r===t.to.r);if(t.type===`skill`){let r=Ye(t.skillId);return!n.skillIds.includes(r.id)||!Qe(n,r)?!1:!Ve(r)||Be(e.units,n,r).includes(t.targetId??``)}return!1}var lt=`/images/tactical_ops`,ut={id:`broken-signal`,name:`BROKEN SIGNAL`,objective:`Eliminate the hostile force and secure the tactical sector.`},dt={alpha:{defId:`alpha`,name:`ALPHA`,team:`ally`,role:`alpha`,hp:120,atk:28,def:12,spd:14,move:3,sprite:`${lt}/alpha.png`,attackSprite:`${lt}/alpha-attack.png`,portrait:`${lt}/alpha-portrait.jpg`,skillIds:[`alpha-strike`,`alpha-rend`,`alpha-howl`]},"ally-02":{defId:`ally-02`,name:`UNIT 02`,team:`ally`,role:`ranged`,hp:96,atk:22,def:8,spd:12,move:2,sprite:`${lt}/ally02.png`,portrait:`${lt}/ally02.png`,skillIds:[`u02-shot`,`u02-burst`,`u02-suppress`]},"ally-03":{defId:`ally-03`,name:`UNIT 03`,team:`ally`,role:`support`,hp:100,atk:16,def:10,spd:10,move:2,sprite:`${lt}/ally03.png`,portrait:`${lt}/ally03.png`,skillIds:[`u03-tap`,`u03-mend`,`u03-pack`]},hostile:{defId:`hostile`,name:`HOSTILE`,team:`enemy`,role:`hostile`,hp:68,atk:16,def:8,spd:11,move:2,sprite:`${lt}/hound.png`,portrait:`${lt}/hound.png`,skillIds:[`hostile-strike`,`hostile-maul`]},leader:{defId:`leader`,name:`HOSTILE LEADER`,team:`enemy`,role:`leader`,hp:148,atk:24,def:14,spd:9,move:2,sprite:`${lt}/leader.png`,portrait:`${lt}/leader.png`,skillIds:[`leader-strike`,`leader-crush`,`leader-intimidate`]}},ft=[{defId:`alpha`,id:`alpha`,c:2,r:2},{defId:`ally-02`,id:`ally-02`,c:1,r:0},{defId:`ally-03`,id:`ally-03`,c:1,r:4},{defId:`hostile`,id:`h1`,c:5,r:0},{defId:`hostile`,id:`h2`,c:5,r:3},{defId:`hostile`,id:`h3`,c:6,r:4},{defId:`leader`,id:`leader`,c:6,r:2}];function pt(e){return{...e,statuses:e.statuses.map(e=>({...e})),cooldowns:{...e.cooldowns}}}function mt(e,t,n,r){let i=dt[e];if(!i)throw Error(`Unknown unit def ${e}`);let a={};for(let e of i.skillIds)a[e]=0;return{id:t,defId:i.defId,name:i.name,team:i.team,role:i.role,hp:i.hp,maxHp:i.hp,atk:i.atk,def:i.def,spd:i.spd,move:i.move,c:n,r,statuses:[],cooldowns:a,meter:0,hasMoved:!1,hasActed:!1,defeated:!1,sprite:i.sprite,attackSprite:i.attackSprite,portrait:i.portrait,skillIds:[...i.skillIds]}}function ht(){ge();let e=ft.map(e=>mt(e.defId,e.id,e.c,e.r));return{units:e,activeId:null,inspectId:null,actionSkillId:null,mode:`idle`,round:1,unitTurn:0,actionsLeftInRound:Le(e).length,outcome:`ongoing`,damageTaken:0,hostilesEliminated:0,results:null,seed:1}}function k(e){if(e.outcome!==`ongoing`)return e;let t=Le(e.units,`ally`);if(Le(e.units,`enemy`).length===0){let n={victory:!0,turns:e.round,hostilesEliminated:e.hostilesEliminated,squadStanding:t.length,damageTaken:e.damageTaken,bonesRecovered:18+e.hostilesEliminated*6};return{...e,outcome:`victory`,results:n,mode:`locked`,activeId:null,actionSkillId:null}}if(t.length===0){let t={victory:!1,turns:e.round,hostilesEliminated:e.hostilesEliminated,squadStanding:0,damageTaken:e.damageTaken,bonesRecovered:0};return{...e,outcome:`defeat`,results:t,mode:`locked`,activeId:null,actionSkillId:null}}return e}function gt(e){let t={};for(let[n,r]of Object.entries(e.cooldowns))t[n]=Math.max(0,(r??0)-1);return{...e,cooldowns:t}}function _t(e,t){let n=[],r=e.units.map(pt),i=e.hostilesEliminated,a=e.damageTaken;r=r.map(e=>{if(e.id!==t||e.defeated)return e;let r=gt(e),o=[];for(let e of r.statuses){if(e.type===`BLEED`){let t=Math.max(1,Math.round(e.value)),o=Math.max(0,r.hp-t),s=o<=0;if(r.team===`ally`&&(a+=t),s&&r.team===`enemy`&&!r.defeated&&(i+=1),n.push({type:`damage`,unitId:r.id,amount:t,text:`-${t}`,kind:`dmg`}),n.push({type:`ticker`,text:`${r.name}  ·  BLEED`}),s)return n.push({type:`defeat`,unitId:r.id,text:`DOWN`,kind:`info`}),{...r,hp:o,defeated:!0,statuses:[]};r={...r,hp:o}}let t=e.duration-1;t<=0?n.push({type:`expire`,unitId:r.id,text:`${we[e.type]} ended`,kind:`info`}):o.push({...e,duration:t})}return{...r,statuses:o,hasMoved:!1,hasActed:!1}});let o={...e,units:r,hostilesEliminated:i,damageTaken:a,activeId:t,inspectId:null,actionSkillId:null,mode:`selected`};o=k(o);let s=o.units.find(e=>e.id===t);return(o.outcome!==`ongoing`||!s||s.defeated)&&(o={...o,activeId:s&&!s.defeated?o.activeId:null,mode:`locked`}),{state:o,events:n}}function vt(e){if(e.outcome!==`ongoing`)return{state:e,events:[]};let t=We(e.units.map(pt)),n=Ge(t);if(!n)return{state:e,events:[]};t=t.map(e=>e.id===n?Ke(e):e);let r=e.actionsLeftInRound,i=e.round;r<=0&&(i+=1,r=Math.max(1,Le(t).length)),--r;let a=_t({...e,units:t,unitTurn:e.unitTurn+1,round:i,actionsLeftInRound:r,mode:`locked`},n),o=a.state.units.find(e=>e.id===n),s=[...a.events];return a.state.outcome===`ongoing`&&(!o||o.defeated)?vt({...a.state,activeId:null}):{state:a.state,events:s}}function yt(){return vt(ht())}function bt(e,t,n){let r=e.units.find(t=>t.id===e.activeId);if(!r||r.defeated||r.hasMoved||r.hasActed||!Fe(e.units,t,n,r.id)||!Pe(r,e.units).some(e=>e.c===t&&e.r===n))return{state:e,events:[],ok:!1};let i=e.units.map(e=>e.id===r.id?{...e,c:t,r:n,hasMoved:!0}:e);return{state:{...e,units:i,inspectId:null},events:[{type:`move`,unitId:r.id,text:`${r.name}  ·  repositions`},{type:`ticker`,text:`${r.name}  ·  repositions`}],ok:!0}}function xt(e){let t=e.units.find(t=>t.id===e.activeId);if(!t||t.defeated||t.hasActed)return{state:e,events:[],ok:!1};let n=e.units.map(e=>e.id===t.id?{...e,hasActed:!0}:e);return{state:{...e,units:n,actionSkillId:null,mode:`locked`},events:[{type:`ticker`,text:`${t.name}  ·  holds`}],ok:!0}}function St(e,t,n,r){let i=et(e,t,n,r);return i.ok?{...i,state:k(i.state)}:i}function Ct(e,t){if(!ct(e,t)&&t.type!==`skip`){let t=xt(e);return{state:t.state,events:t.events}}let n=[],r=e;if(t.type===`skip`){let e=xt(r);return{state:e.state,events:e.events}}if(t.type===`move`){let e=bt(r,t.to.c,t.to.r);if(e.ok&&(r=e.state,n.push(...e.events)),t.then){let e=Ct(r,t.then);return{state:e.state,events:[...n,...e.events]}}let i=xt(r);return{state:i.state,events:[...n,...i.events]}}if(t.type===`skill`){let e=St(r,t.skillId,t.targetId,t.cell);if(e.ok)return{state:e.state,events:[...n,...e.events]};let i=xt(r);return{state:i.state,events:[...n,...i.events]}}return{state:r,events:n}}function wt(e){return st(e)}function Tt(e){let t=e.skillIds[0];return t?Ye(t).maxRange:1}var Et=c({DEF_CURVE:()=>50,GRID_COLS:()=>8,GRID_ROWS:()=>5,METER_MAX:()=>100,STATUS_LABEL:()=>we,STATUS_SHORT:()=>Te,a1Range:()=>Tt,advanceToNext:()=>vt,aiUsesLegalRules:()=>ct,applyAi:()=>Ct,applySkill:()=>et,applyStatus:()=>ve,availableSkills:()=>tt,beginUnitTurn:()=>_t,canOccupy:()=>Fe,cellKey:()=>Ae,chebyshev:()=>ke,chooseAiAction:()=>st,computeHeal:()=>De,consumeMeter:()=>Ke,cooldownLeft:()=>Ze,createBattle:()=>ht,effectiveAtk:()=>be,effectiveDef:()=>xe,effectiveSpd:()=>Se,evaluateOutcome:()=>k,fieldPercent:()=>O,hasStatus:()=>_e,inBounds:()=>Oe,inSkillRange:()=>Ie,incomingDamageMultiplier:()=>Ce,isLegalTargetType:()=>He,living:()=>Le,mitigatedDamage:()=>Ee,occupiedKeys:()=>je,pickReadyId:()=>Ge,planAi:()=>wt,previewQueue:()=>qe,reachableCells:()=>Pe,resetStatusSeq:()=>ge,resolveSkillTargets:()=>ze,skillNeedsTargetPick:()=>Ve,skillReady:()=>Qe,startBattle:()=>yt,tickUntilReady:()=>We,tryMove:()=>bt,trySkill:()=>St,trySkip:()=>xt,unitAt:()=>Me,unitSkills:()=>Xe,unitsInRadius:()=>Re,validTargetIds:()=>Be}),Dt=null,A=!1;function Ot(){if(typeof window>`u`)return null;if(!Dt){let e=window.AudioContext||window.webkitAudioContext;if(!e)return null;Dt=new e}return Dt}function kt(){let e=Ot();e&&e.state===`suspended`&&e.resume()}function At(){return A}function jt(e){A=e;try{localStorage.setItem(`tactical-ops-mute`,e?`1`:`0`)}catch{}}function Mt(){try{A=localStorage.getItem(`tactical-ops-mute`)===`1`}catch{A=!1}return A}function Nt(e,t,n,r=.05,i=0){if(A)return;let a=Ot();if(!a)return;let o=a.currentTime+i,s=a.createOscillator(),c=a.createGain();s.type=n,s.frequency.setValueAtTime(e,o),c.gain.setValueAtTime(1e-4,o),c.gain.exponentialRampToValueAtTime(r,o+.012),c.gain.exponentialRampToValueAtTime(1e-4,o+t),s.connect(c),c.connect(a.destination),s.start(o),s.stop(o+t+.02)}function Pt(e){switch(e){case`select`:Nt(620,.06,`triangle`,.03);break;case`ui`:Nt(480,.05,`square`,.02);break;case`move`:Nt(220,.08,`sine`,.03);break;case`hit`:Nt(140,.1,`sawtooth`,.06),Nt(90,.12,`square`,.03,.02);break;case`guard`:Nt(360,.1,`triangle`,.04);break;case`heal`:Nt(520,.1,`sine`,.04),Nt(780,.12,`sine`,.03,.05);break;case`turn`:Nt(180,.14,`triangle`,.04),Nt(240,.12,`sine`,.03,.08);break;case`win`:Nt(440,.16,`triangle`,.05),Nt(660,.2,`triangle`,.045,.12);break;case`lose`:Nt(160,.22,`sawtooth`,.04),Nt(90,.28,`sine`,.04,.1);break;case`status`:Nt(400,.08,`triangle`,.03)}}function Ft(e){return new Promise(t=>{if(typeof requestAnimationFrame>`u`){setTimeout(t,e);return}let n=performance.now(),r=i=>{i-n>=e?t():requestAnimationFrame(r)};requestAnimationFrame(r)})}var It=1,Lt=1,j=0;function Rt(e){return qe(e,7)}function zt(){return{units:[],activeId:null,inspectId:null,actionSkillId:null,mode:`idle`,round:1,unitTurn:0,actionsLeftInRound:0,outcome:`ongoing`,damageTaken:0,hostilesEliminated:0,results:null,seed:1}}function Bt(e){return e.units.find(t=>t.id===e.activeId)}var M=E((e,t)=>{let n=(t,n,r)=>{let i=It++;e(e=>({floats:[...e.floats,{id:i,unitId:t,text:n,kind:r}]})),Ft(900).then(()=>{e(e=>({floats:e.floats.filter(e=>e.id!==i)}))})},r=async(t,r)=>{for(let i of t){if(r!==j)return;if(i.type===`ticker`&&i.text&&e({ticker:i.text}),i.type===`banner`&&i.text){if(e({banner:i.text}),Pt(`turn`),await Ft(520),r!==j)return;e({banner:null})}i.type===`damage`&&i.unitId&&i.text&&(Pt(`hit`),e({impactId:i.unitId,impactKey:Lt++}),n(i.unitId,i.text,i.kind??`dmg`),await Ft(280)),i.type===`heal`&&i.unitId&&i.text&&(Pt(`heal`),n(i.unitId,i.text,`heal`),await Ft(240)),i.type===`status`&&i.unitId&&i.text&&(Pt(`status`),n(i.unitId,i.text,i.kind??`status`),await Ft(180)),i.type===`expire`&&i.unitId&&i.text&&n(i.unitId,i.text,`info`),i.type===`defeat`&&i.unitId&&(n(i.unitId,i.text??`DOWN`,`info`),await Ft(260)),i.type===`move`&&Pt(`move`)}},i=async n=>{let{battle:r}=t();return r.outcome===`victory`?(e({busy:!0,banner:`SECTOR SECURED`,ticker:null,attackingId:null}),Pt(`win`),await Ft(1400),n===j&&e({screen:`sector`,busy:!1,banner:null}),!0):r.outcome===`defeat`&&(e({busy:!0,banner:`OPERATION FAILED`,ticker:null,attackingId:null}),Pt(`lose`),await Ft(1200),n===j&&e({screen:`defeat`,busy:!1,banner:null}),!0)},a=async n=>{if(n!==j||await i(n))return;let a=vt(t().battle);if(e({battle:a.state,queue:Rt(a.state)}),await r(a.events,n),n!==j||await i(n))return;let s=Bt(t().battle);if(!s){e({busy:!1});return}if(s.team===`enemy`){if(e({busy:!0,ticker:`${s.name}`}),await Ft(280),n!==j)return;await o(n);return}e({busy:!1,ticker:s.hasMoved?`${s.name}  ·  act`:`${s.name}  ·  move or act`})},o=async n=>{let i=t().battle,o=Bt(i);if(!o||o.team!==`enemy`){await a(n);return}let s=wt(i);s.type===`move`&&e({attackingId:null}),s.type===`skill`&&e({attackingId:o.id});let c=Ct(t().battle,s);e({battle:c.state,queue:Rt(c.state),attackingId:s.type===`skill`?o.id:null}),await r(c.events,n),n===j&&(e({attackingId:null}),await Ft(160),await a(n))},s=async e=>{await i(e)||await a(e)};return{screen:`hub`,battle:zt(),busy:!1,banner:null,ticker:null,floats:[],attackingId:null,impactId:null,impactKey:0,muted:!1,queue:[],openBrief:()=>{Pt(`ui`),e({screen:`brief`})},backToHub:()=>{j++,Pt(`ui`),e({screen:`hub`,battle:zt(),banner:null,ticker:null,busy:!1,floats:[],queue:[]})},deploy:()=>{let n=++j,i=yt();Pt(`turn`),e({screen:`battle`,battle:i.state,queue:Rt(i.state),busy:!0,banner:null,ticker:null,floats:[],attackingId:null,impactId:null}),(async()=>{if(await r(i.events,n),n!==j)return;let a=Bt(t().battle);if(a?.team===`enemy`){await o(n);return}e({busy:!1,ticker:a?`${a.name}  ·  move or act`:null})})()},inspectUnit:n=>{let{battle:r,busy:i,screen:a}=t();if(i||a!==`battle`)return;let o=r.units.find(e=>e.id===n);if(!(!o||o.defeated)){if(r.mode===`targeting`&&r.actionSkillId){t().selectTarget(n);return}Pt(`select`),e({battle:{...r,inspectId:r.inspectId===n?null:n}})}},selectCell:(n,r)=>{let{battle:i,busy:a,screen:o}=t();if(a||o!==`battle`)return;let s=i.units.find(e=>!e.defeated&&e.c===n&&e.r===r);if(s){t().inspectUnit(s.id);return}if(i.mode===`targeting`){e({battle:{...i,mode:`selected`,actionSkillId:null}});return}let c=Bt(i);if(!c||c.team!==`ally`||c.hasMoved||c.hasActed)return;let l=bt(i,n,r);l.ok&&(Pt(`move`),e({battle:l.state,queue:Rt(l.state),ticker:`${c.name}  ·  repositions`}))},selectSkill:n=>{let{battle:i,busy:a}=t();if(a)return;let o=Bt(i);if(!o||o.team!==`ally`||o.hasActed||o.defeated||!o.skillIds.includes(n))return;let c=Ye(n);if((o.cooldowns[n]??0)>0)return;if(i.mode===`targeting`&&i.actionSkillId===n){e({battle:{...i,mode:`selected`,actionSkillId:null}});return}if(Pt(`select`),!Ve(c)){let t=++j;e({busy:!0,attackingId:o.id});let a=St(i,n);if(!a.ok){e({busy:!1,attackingId:null,ticker:`${o.name}  ·  no target in range`});return}e({battle:a.state,queue:Rt(a.state)}),(async()=>{await r(a.events,t),e({attackingId:null}),await s(t)})();return}let l=Be(i.units,o,c);e({battle:{...i,mode:`targeting`,actionSkillId:n,inspectId:null},ticker:l.length===0?c.maxRange<=1?`${o.name}  ·  melee — move adjacent`:`${o.name}  ·  no target in range`:c.desc})},selectTarget:n=>{let{battle:i,busy:a}=t();if(a||i.mode!==`targeting`||!i.actionSkillId)return;let o=Bt(i);if(!o||o.hasActed)return;let c=++j;e({busy:!0,attackingId:o.id});let l=St(i,i.actionSkillId,n);if(!l.ok){e({busy:!1,attackingId:null});return}e({battle:l.state,queue:Rt(l.state)}),(async()=>{await r(l.events,c),e({attackingId:null}),await s(c)})()},skipTurn:()=>{let{battle:n,busy:r}=t();if(r)return;let i=Bt(n);if(!i||i.team!==`ally`||i.hasActed)return;let a=++j,o=xt(n);o.ok&&(e({battle:o.state,busy:!0,ticker:o.events[0]?.text??null}),s(a))},cancel:()=>{let{battle:n,busy:r}=t();if(!r){if(n.mode===`targeting`){e({battle:{...n,mode:`selected`,actionSkillId:null}});return}e({battle:{...n,inspectId:null}})}},replay:()=>{t().deploy()},dismissSector:()=>{Pt(`ui`),e({screen:`results`})},toggleMute:()=>{let n=!t().muted;jt(n),e({muted:n})}}});function Vt(){let e=M.getState(),t=e.battle,n=Bt(t);return{version:`tactical_ops.js v2.1.0-combat-core`,screen:e.screen,turn:t.round,phase:n?.team===`enemy`?`enemy`:`player`,mode:t.mode,selectedId:t.activeId,busy:e.busy,units:t.units.map(e=>({id:e.id,name:e.name,side:e.team,hp:e.hp,maxHp:e.maxHp,atk:e.atk,def:e.def,spd:e.spd,move:e.move,c:e.c,r:e.r,hasMoved:e.hasMoved,hasActed:e.hasActed,guarding:e.statuses.some(e=>e.type===`GUARD`),defeated:e.defeated,strikeRange:Tt(e),statuses:e.statuses,cooldowns:e.cooldowns})),results:t.results,activeId:t.activeId,queue:e.queue}}function Ht(){let{battle:e,busy:t}=M.getState();if(t||e.mode===`targeting`)return[];let n=Bt(e);return!n||n.team!==`ally`||n.hasMoved||n.hasActed||n.defeated?[]:Pe(n,e.units)}function Ut(){let{battle:e}=M.getState(),t=new Set;if(e.mode!==`targeting`||!e.actionSkillId)return t;let n=Bt(e);if(!n)return t;try{let r=Ye(e.actionSkillId);for(let i of Be(e.units,n,r))t.add(i)}catch{}return t}typeof window<`u`&&(window.__tactical=M);var Wt=s((e=>{var t=Symbol.for(`react.transitional.element`);function n(e,n,r){var i=null;if(r!==void 0&&(i=``+r),n.key!==void 0&&(i=``+n.key),`key`in n)for(var a in r={},n)a!==`key`&&(r[a]=n[a]);else r=n;return n=r.ref,{$$typeof:t,type:e,key:i,ref:n===void 0?null:n,props:r}}e.jsx=n,e.jsxs=n})),N=s(((e,t)=>{t.exports=Wt()}))();function Gt(e){return e===`ATK_UP`||e===`DEF_UP`||e===`SPD_UP`||e===`GUARD`}function Kt(e){return e.role===`leader`?`leader`:e.role===`hostile`?`hound`:e.role===`alpha`?`alpha`:e.role===`ranged`?`skirmisher`:e.role===`support`?`support`:``}function qt({selected:e,guarding:t}){return(0,N.jsxs)(`svg`,{className:`t-ring`,viewBox:`0 0 100 36`,"aria-hidden":`true`,children:[(0,N.jsx)(`ellipse`,{cx:`50`,cy:`22`,rx:e?40:34,ry:e?12:10,fill:`none`,stroke:`currentColor`,strokeWidth:e?1.8:1.2,opacity:e?.95:.55}),(0,N.jsx)(`ellipse`,{cx:`50`,cy:`22`,rx:e?32:26,ry:e?9:7,fill:`none`,stroke:`currentColor`,strokeWidth:`0.7`,opacity:`0.4`,strokeDasharray:`2 3`}),t?(0,N.jsx)(`ellipse`,{cx:`50`,cy:`22`,rx:`44`,ry:`13.5`,fill:`none`,stroke:`currentColor`,strokeWidth:`1`,opacity:`0.85`}):null]})}function Jt({unit:e,selected:t,validTarget:n,targeting:r,attacking:i,inspecting:a}){let o=O(e.c,e.r),s=M(e=>e.inspectUnit),c=M(e=>e.selectTarget),l=[`t-token`,e.team,Kt(e),e.defeated?`defeated`:``,e.hasActed?`acted`:``,t?`selected active`:``,a?`inspect`:``,r&&!n&&!t?`subdued`:``,r&&n?`targetable`:``,i?`attacking`:``].filter(Boolean).join(` `),u=i&&e.attackSprite?e.attackSprite:e.sprite;return(0,N.jsxs)(`div`,{className:l,style:{left:`${o.x}%`,top:`${o.y}%`,zIndex:4+e.r*4+(t?2:0)},children:[(0,N.jsx)(qt,{selected:t,guarding:e.statuses.some(e=>e.type===`GUARD`)&&!e.defeated}),(0,N.jsx)(`img`,{className:`body`,src:u,alt:``,draggable:!1}),(0,N.jsx)(`button`,{type:`button`,className:`t-hit`,"aria-label":e.name,onPointerDown:t=>{t.stopPropagation(),kt(),r&&n?c(e.id):s(e.id)}}),e.defeated?null:(0,N.jsxs)(`div`,{className:`t-plate`,children:[(0,N.jsx)(`div`,{className:`t-plate-name`,children:(0,N.jsx)(`span`,{children:e.name})}),(0,N.jsxs)(`div`,{className:`t-hp`,children:[(0,N.jsx)(`div`,{className:`t-hp-bar`,children:(0,N.jsx)(`i`,{style:{width:`${e.hp/e.maxHp*100}%`}})}),(0,N.jsxs)(`span`,{className:`t-hp-num`,children:[e.hp,`/`,e.maxHp]})]}),e.statuses.length?(0,N.jsx)(`div`,{className:`t-chips`,children:e.statuses.slice(0,3).map(e=>(0,N.jsx)(`span`,{className:`t-chip ${Gt(e.type)?`buff`:`debuff`}`,children:Te[e.type]},e.id))}):null]})]})}function Yt(){let e=M(e=>e.queue),t=M(e=>e.battle.units),n=M(e=>e.battle.activeId);return(0,N.jsx)(`div`,{className:`t-order`,"aria-label":`Turn order`,children:e.map((e,r)=>{let i=t.find(t=>t.id===e);return i?(0,N.jsx)(`div`,{className:`t-order-unit ${i.team===`enemy`?`enemy`:``} ${e===n&&r===0?`active`:``}`,title:i.name,children:(0,N.jsx)(`img`,{src:i.portrait||i.sprite,alt:``})},`${e}-${r}`):null})})}function Xt(){let e=M(e=>e.battle.inspectId),t=M(e=>e.battle.activeId),n=M(e=>e.battle.units),r=n.find(t=>t.id===e)||n.find(e=>e.id===t);return r?(0,N.jsxs)(`aside`,{className:`t-status ${r.team}`,onPointerDown:e=>e.stopPropagation(),"aria-label":`Selected unit`,children:[(0,N.jsx)(`img`,{src:r.portrait||r.sprite,alt:``}),(0,N.jsxs)(`div`,{className:`t-status-main`,children:[(0,N.jsx)(`div`,{className:`t-status-name`,children:r.name}),(0,N.jsxs)(`div`,{className:`t-hp`,children:[(0,N.jsx)(`div`,{className:`t-hp-bar`,children:(0,N.jsx)(`i`,{style:{width:`${r.hp/r.maxHp*100}%`}})}),(0,N.jsxs)(`span`,{className:`t-hp-num`,children:[r.hp,`/`,r.maxHp]})]}),r.statuses.length?(0,N.jsx)(`div`,{className:`t-chips`,children:r.statuses.slice(0,3).map(e=>(0,N.jsx)(`span`,{className:`t-chip ${Gt(e.type)?`buff`:`debuff`}`,children:Te[e.type]},e.id))}):null]}),(0,N.jsxs)(`dl`,{className:`t-status-stats`,children:[(0,N.jsxs)(`div`,{children:[(0,N.jsx)(`dt`,{children:`ATK`}),(0,N.jsx)(`dd`,{children:be(r)})]}),(0,N.jsxs)(`div`,{children:[(0,N.jsx)(`dt`,{children:`DEF`}),(0,N.jsx)(`dd`,{children:xe(r)})]}),(0,N.jsxs)(`div`,{children:[(0,N.jsx)(`dt`,{children:`SPD`}),(0,N.jsx)(`dd`,{children:Se(r)})]}),(0,N.jsxs)(`div`,{children:[(0,N.jsx)(`dt`,{children:`MOV`}),(0,N.jsx)(`dd`,{children:r.move})]})]})]}):(0,N.jsx)(`aside`,{className:`t-status t-status-empty`,"aria-hidden":`true`})}function Zt(){let e=M(e=>e.battle),t=M(e=>e.busy),n=M(e=>e.selectSkill),r=e.units.find(t=>t.id===e.activeId),i=!!(r&&r.team===`ally`&&!r.hasActed&&!r.defeated&&!t),a=r?tt(e,r):[];return(0,N.jsx)(`div`,{className:`t-actions`,children:[0,1,2].map(t=>{let r=a[t],o=e.actionSkillId&&r&&e.actionSkillId===r.id,s=r&&!r.ready;return(0,N.jsxs)(`button`,{type:`button`,className:`t-act ${o?`on`:``} ${s?`cooling`:``}`,disabled:!i||!r||!!s,onClick:()=>{r&&(kt(),n(r.id))},children:[(0,N.jsxs)(`span`,{className:`row`,children:[(0,N.jsx)(`span`,{className:`slot`,children:r?.slot??`A${t+1}`}),r?.name??`—`]}),(0,N.jsx)(`small`,{children:r?.desc??``}),s?(0,N.jsxs)(`span`,{className:`cd`,children:[r.cd,`T`]}):null]},t)})})}function Qt(){let e=M(e=>e.battle.units),t=M(e=>e.battle.round),n=M(e=>e.battle.mode),r=M(e=>e.battle.activeId),i=M(e=>e.battle.inspectId),a=M(e=>e.battle.actionSkillId),o=M(e=>e.banner),s=M(e=>e.ticker),c=M(e=>e.floats),l=M(e=>e.attackingId),u=M(e=>e.impactId),d=M(e=>e.impactKey),f=M(e=>e.muted),p=M(e=>e.busy),m=M(e=>e.selectCell),h=M(e=>e.skipTurn),g=M(e=>e.cancel),_=M(e=>e.toggleMute),v=(0,w.useMemo)(()=>new Set(Ht().map(e=>Ae(e.c,e.r))),[e,r,n,p,a]),y=(0,w.useMemo)(()=>Ut(),[e,r,n,a]),b=e.find(e=>e.id===r),x=!!(b&&b.team===`ally`&&!b.hasActed&&!b.defeated&&!p),ee=e.find(e=>e.id===u&&!e.defeated),S=ee?O(ee.c,ee.r):null,C=b?.team===`enemy`?`Enemy act`:`Your act`;return(0,N.jsxs)(`div`,{className:`t-battle`,children:[(0,N.jsxs)(`header`,{className:`t-top`,children:[(0,N.jsxs)(`div`,{className:`t-brand`,children:[(0,N.jsx)(`img`,{src:`/images/tactical_ops/alpha-portrait.jpg`,alt:``}),(0,N.jsxs)(`div`,{children:[(0,N.jsx)(`h1`,{className:`t-title`,children:`Alpha Husky`}),(0,N.jsx)(`p`,{children:`Tactical Ops`})]})]}),(0,N.jsxs)(`div`,{className:`t-turn`,children:[(0,N.jsxs)(`strong`,{children:[`TURN `,String(t).padStart(2,`0`)]}),(0,N.jsxs)(`span`,{className:`t-turn-sub`,children:[C,b?` · ${b.name}`:``]})]}),(0,N.jsxs)(`div`,{className:`t-obj`,children:[ut.name,(0,N.jsx)(`small`,{children:`Secure sector`})]})]}),(0,N.jsx)(`div`,{className:`t-order-wrap`,children:(0,N.jsx)(Yt,{})}),s?(0,N.jsx)(`div`,{className:`t-ticker`,children:s}):null,(0,N.jsx)(`div`,{className:`t-field-wrap`,children:(0,N.jsxs)(`div`,{className:`t-field`,onPointerDown:()=>{p||g()},children:[(0,N.jsx)(`img`,{className:`t-field-art`,src:`/images/tactical_ops/battlefield.jpg`,alt:``}),(0,N.jsx)(`div`,{className:`t-field-grade`}),(0,N.jsx)(`div`,{className:`t-vignette`}),(0,N.jsx)(`div`,{className:`t-grid`,"aria-hidden":`true`,children:Array.from({length:40},(e,t)=>{let n=t%8,r=Math.floor(t/8),i=O(n,r);return(0,N.jsx)(`i`,{style:{left:`${i.x}%`,top:`${i.y}%`}},`g-${n}-${r}`)})}),Array.from({length:40},(e,t)=>{let n=t%8,r=Math.floor(t/8),i=Ae(n,r);if(!v.has(i))return null;let a=O(n,r);return(0,N.jsx)(`button`,{type:`button`,className:`t-cell move`,style:{left:`${a.x}%`,top:`${a.y}%`},"aria-label":`Move to ${n},${r}`,onPointerDown:e=>{e.stopPropagation(),kt(),m(n,r)}},i)}),e.slice().sort((e,t)=>e.r-t.r||e.c-t.c).map(e=>(0,N.jsx)(Jt,{unit:e,selected:e.id===r,validTarget:y.has(e.id),targeting:n===`targeting`,attacking:e.id===l,inspecting:e.id===i},e.id)),c.map(t=>{let n=e.find(e=>e.id===t.unitId);if(!n)return null;let r=O(n.c,n.r);return(0,N.jsx)(`div`,{className:`t-float ${t.kind}`,style:{left:`${r.x}%`,top:`${r.y-6}%`},children:t.text},t.id)}),S?(0,N.jsx)(`div`,{className:`t-impact`,style:{left:`${S.x}%`,top:`${S.y-4}%`}},d):null]})}),(0,N.jsx)(Xt,{}),o?(0,N.jsx)(`div`,{className:`t-banner`,children:(0,N.jsx)(`span`,{children:o})}):null,(0,N.jsxs)(`footer`,{className:`t-dock`,children:[(0,N.jsx)(`button`,{type:`button`,className:`t-icon-btn`,"aria-label":f?`Unmute`:`Mute`,onClick:()=>{let e=!At();jt(e),_(),kt(),e||Pt(`ui`)},children:f?(0,N.jsx)(oe,{className:`t-ico`}):(0,N.jsx)(ae,{className:`t-ico`})}),(0,N.jsx)(Zt,{}),(0,N.jsx)(`button`,{type:`button`,className:`t-btn t-skip`,disabled:!x,onClick:()=>{kt(),h()},children:`Skip`})]})]})}function $t({dim:e=.55}){return(0,N.jsxs)(`div`,{className:`t-bg`,"aria-hidden":`true`,children:[(0,N.jsx)(`img`,{src:`/images/tactical_ops/battlefield.jpg`,alt:``}),(0,N.jsx)(`div`,{className:`t-vignette`,style:{background:`rgb(10 12 16 / ${e})`}})]})}function en(){let e=M(e=>e.openBrief);return(0,N.jsxs)(`div`,{className:`t-fill`,children:[(0,N.jsx)($t,{dim:.35}),(0,N.jsx)(`div`,{className:`t-vignette`}),(0,N.jsx)(`div`,{className:`t-hub`,children:(0,N.jsxs)(`div`,{className:`t-hub-copy`,children:[(0,N.jsx)(`div`,{className:`t-kicker`,children:`Alpha Husky`}),(0,N.jsx)(`h1`,{className:`t-title`,children:`Tactical Ops`}),(0,N.jsx)(`h2`,{children:`Combat Core`}),(0,N.jsxs)(`div`,{className:`t-panel t-op-card`,children:[(0,N.jsx)(`span`,{className:`t-kicker`,children:`Operation`}),(0,N.jsx)(`strong`,{children:ut.name}),(0,N.jsx)(`p`,{children:ut.objective})]}),(0,N.jsx)(`div`,{className:`t-brief-actions`,children:(0,N.jsxs)(`button`,{type:`button`,className:`t-btn t-btn-primary`,onClick:e,children:[`Mission Brief`,(0,N.jsx)(re,{className:`t-ico`})]})})]})})]})}function tn(){let e=M(e=>e.deploy),t=M(e=>e.backToHub);return(0,N.jsxs)(`div`,{className:`t-fill`,children:[(0,N.jsx)($t,{dim:.55}),(0,N.jsxs)(`div`,{className:`t-brief`,children:[(0,N.jsx)(`div`,{className:`t-kicker`,children:`Tactical Ops`}),(0,N.jsx)(`h1`,{className:`t-title`,style:{fontSize:`clamp(1.8rem, 5vw, 2.8rem)`,margin:`0.2rem 0 0.2rem`},children:ut.name}),(0,N.jsx)(`p`,{style:{color:`var(--t-muted)`,margin:0,maxWidth:`40rem`},children:ut.objective}),(0,N.jsxs)(`div`,{className:`t-brief-grid`,children:[(0,N.jsxs)(`div`,{className:`t-panel t-brief-block`,children:[(0,N.jsx)(`h3`,{children:`Allied squad`}),(0,N.jsxs)(`div`,{className:`t-unit-row`,children:[(0,N.jsx)(`img`,{src:`/images/tactical_ops/alpha-portrait.jpg`,alt:``}),(0,N.jsxs)(`div`,{children:[(0,N.jsx)(`div`,{className:`t-title`,style:{fontSize:`0.95rem`},children:`ALPHA`}),(0,N.jsx)(`div`,{style:{color:`var(--t-muted)`,fontSize:`0.8rem`},children:`Melee pressure · Strike / Rend / Howl · MOVE 3`})]})]}),(0,N.jsxs)(`div`,{className:`t-unit-row`,children:[(0,N.jsx)(`img`,{src:`/images/tactical_ops/ally02.png`,alt:``,style:{objectPosition:`50% 12%`}}),(0,N.jsxs)(`div`,{children:[(0,N.jsx)(`div`,{className:`t-title`,style:{fontSize:`0.95rem`},children:`UNIT 02`}),(0,N.jsx)(`div`,{style:{color:`var(--t-muted)`,fontSize:`0.8rem`},children:`Ranged control · Shot / Burst / Suppress · MOVE 2`})]})]}),(0,N.jsxs)(`div`,{className:`t-unit-row`,children:[(0,N.jsx)(`img`,{src:`/images/tactical_ops/ally03.png`,alt:``,style:{objectPosition:`50% 12%`}}),(0,N.jsxs)(`div`,{children:[(0,N.jsx)(`div`,{className:`t-title`,style:{fontSize:`0.95rem`},children:`UNIT 03`}),(0,N.jsx)(`div`,{style:{color:`var(--t-muted)`,fontSize:`0.8rem`},children:`Support · Tap / Mend / Pack Support · MOVE 2`})]})]})]}),(0,N.jsxs)(`div`,{className:`t-panel t-brief-block`,children:[(0,N.jsx)(`h3`,{children:`Hostile force`}),(0,N.jsxs)(`div`,{className:`t-unit-row`,children:[(0,N.jsx)(`div`,{className:`t-unit-ph enemy`}),(0,N.jsxs)(`div`,{children:[(0,N.jsx)(`div`,{className:`t-title`,style:{fontSize:`0.95rem`},children:`HOSTILE × 3`}),(0,N.jsx)(`div`,{style:{color:`var(--t-muted)`,fontSize:`0.8rem`},children:`Melee · Strike / Maul · 68 HP`})]})]}),(0,N.jsxs)(`div`,{className:`t-unit-row`,children:[(0,N.jsx)(`div`,{className:`t-unit-ph enemy`}),(0,N.jsxs)(`div`,{children:[(0,N.jsx)(`div`,{className:`t-title`,style:{fontSize:`0.95rem`},children:`HOSTILE LEADER`}),(0,N.jsx)(`div`,{style:{color:`var(--t-muted)`,fontSize:`0.8rem`},children:`Heavy · Crush / Intimidate · 148 HP`})]})]}),(0,N.jsx)(`p`,{style:{color:`var(--t-faint)`,fontSize:`0.78rem`,margin:`0.8rem 0 0`,lineHeight:1.45},children:`Units act individually by Speed. Alpha must close to melee range 1 before Strike or Rend.`})]})]}),(0,N.jsxs)(`div`,{className:`t-brief-actions`,children:[(0,N.jsx)(`button`,{type:`button`,className:`t-btn t-btn-ghost`,onClick:t,children:`Back`}),(0,N.jsxs)(`button`,{type:`button`,className:`t-btn t-btn-primary`,onClick:e,children:[`Deploy`,(0,N.jsx)(re,{className:`t-ico`})]})]})]})]})}function nn(){let e=M(e=>e.dismissSector);return(0,w.useEffect)(()=>{let t=0,n=performance.now(),r=i=>{i-n>=1600?e():t=requestAnimationFrame(r)};return t=requestAnimationFrame(r),()=>cancelAnimationFrame(t)},[e]),(0,N.jsxs)(`div`,{className:`t-fill`,children:[(0,N.jsx)($t,{dim:.5}),(0,N.jsx)(`div`,{className:`t-overlay`,style:{background:`rgb(10 12 16 / 0.45)`},children:(0,N.jsxs)(`div`,{className:`t-modal t-panel`,children:[(0,N.jsx)(`div`,{className:`t-kicker`,children:`Operation`}),(0,N.jsx)(`h2`,{className:`t-title`,children:`Sector Secured`}),(0,N.jsx)(`p`,{style:{color:`var(--t-muted)`,margin:`0 0 1.1rem`},children:`Hostile force eliminated.`}),(0,N.jsx)(`button`,{type:`button`,className:`t-btn t-btn-primary`,onClick:e,children:`Continue`})]})})]})}function rn(){let e=M(e=>e.battle.results),t=M(e=>e.replay),n=M(e=>e.backToHub);return e?(0,N.jsxs)(`div`,{className:`t-fill`,children:[(0,N.jsx)($t,{dim:.6}),(0,N.jsx)(`div`,{className:`t-overlay`,children:(0,N.jsxs)(`div`,{className:`t-modal t-panel`,children:[(0,N.jsx)(`div`,{className:`t-kicker`,children:`Broken Signal`}),(0,N.jsx)(`h2`,{className:`t-title`,children:`Operation Complete`}),(0,N.jsxs)(`dl`,{className:`t-stats`,children:[(0,N.jsxs)(`div`,{children:[(0,N.jsx)(`dt`,{children:`Turns taken`}),(0,N.jsx)(`dd`,{children:String(e.turns).padStart(2,`0`)})]}),(0,N.jsxs)(`div`,{children:[(0,N.jsx)(`dt`,{children:`Hostiles eliminated`}),(0,N.jsx)(`dd`,{children:e.hostilesEliminated})]}),(0,N.jsxs)(`div`,{children:[(0,N.jsx)(`dt`,{children:`Squad standing`}),(0,N.jsxs)(`dd`,{children:[e.squadStanding,` / 3`]})]}),(0,N.jsxs)(`div`,{children:[(0,N.jsx)(`dt`,{children:`Damage taken`}),(0,N.jsx)(`dd`,{children:e.damageTaken})]})]}),(0,N.jsxs)(`div`,{className:`t-brief-actions`,style:{justifyContent:`center`},children:[(0,N.jsx)(`button`,{type:`button`,className:`t-btn t-btn-primary`,onClick:t,children:`Replay operation`}),(0,N.jsx)(`button`,{type:`button`,className:`t-btn`,onClick:n,children:`Return to Tactical Ops`})]})]})})]}):null}function an(){let e=M(e=>e.replay),t=M(e=>e.backToHub);return(0,N.jsxs)(`div`,{className:`t-fill`,children:[(0,N.jsx)($t,{dim:.7}),(0,N.jsx)(`div`,{className:`t-overlay`,children:(0,N.jsxs)(`div`,{className:`t-modal t-panel`,children:[(0,N.jsx)(`div`,{className:`t-kicker`,style:{color:`var(--t-enemy)`},children:`Broken Signal`}),(0,N.jsx)(`h2`,{className:`t-title`,children:`Operation Failed`}),(0,N.jsx)(`p`,{style:{color:`var(--t-muted)`,margin:`0 0 1.1rem`},children:`All allied units are down.`}),(0,N.jsxs)(`div`,{className:`t-brief-actions`,style:{justifyContent:`center`},children:[(0,N.jsxs)(`button`,{type:`button`,className:`t-btn t-btn-primary`,onClick:e,children:[(0,N.jsx)(ie,{className:`t-ico`}),` Retry`]}),(0,N.jsx)(`button`,{type:`button`,className:`t-btn`,onClick:t,children:`Return`})]})]})})]})}function on(){let e=M(e=>e.screen),t=M(e=>e.selectSkill),n=M(e=>e.skipTurn),r=M(e=>e.muted);return(0,w.useEffect)(()=>{Mt()&&(M.setState({muted:!0}),jt(!0))},[]),(0,w.useEffect)(()=>{let e=e=>{let r=M.getState(),i=r.battle.units.find(e=>e.id===r.battle.activeId);e.key===`1`&&i&&t(i.skillIds[0]),e.key===`2`&&i&&t(i.skillIds[1]),e.key===`3`&&i&&t(i.skillIds[2]),(e.key===`s`||e.key===`S`)&&n()};window.addEventListener(`keydown`,e);let r=()=>kt();return window.addEventListener(`pointerdown`,r,{once:!0}),()=>{window.removeEventListener(`keydown`,e),window.removeEventListener(`pointerdown`,r)}},[t,n]),(0,w.useEffect)(()=>{jt(r)},[r]),(0,N.jsxs)(`div`,{className:`t-shell`,children:[e===`hub`?(0,N.jsx)(en,{}):null,e===`brief`?(0,N.jsx)(tn,{}):null,e===`battle`?(0,N.jsx)(Qt,{}):null,e===`sector`?(0,N.jsx)(nn,{}):null,e===`results`?(0,N.jsx)(rn,{}):null,e===`defeat`?(0,N.jsx)(an,{}):null]})}var sn=`/* Alpha Husky Tactical Ops — viewport-first playability (V1)
   Combat layout only. No orientation gate. */

#tacticalOpsRoot {
  --t-font-display: "Rajdhani", "Trebuchet MS", sans-serif;
  --t-font-sans: "Source Sans 3", "Segoe UI", system-ui, sans-serif;
  --t-bg: #07090d;
  --t-surface: #0c1016;
  --t-elevated: #121820;
  --t-fg: #e7edf3;
  --t-muted: #7f8a97;
  --t-faint: #55606c;
  --t-line: #232a33;
  --t-ally: #3ec6ff;
  --t-ally-dim: #102e3d;
  --t-enemy: #e23d3d;
  --t-enemy-dim: #3d1212;
  --t-heal: #6fbf8a;
  --t-radius-sm: 6px;
  --t-radius-md: 10px;
  --t-radius-lg: 14px;
  --tops-header: 52px;
  --tops-order: 40px;
  --tops-status: 56px;
  --tops-dock: 72px;
  z-index: 1500;
  width: 100%;
  width: 100vw;
  height: 100%;
  height: 100dvh;
  height: 100svh;
  max-height: 100svh;
  color: var(--t-fg);
  font-family: var(--t-font-sans);
  background: var(--t-bg);
  -webkit-tap-highlight-color: transparent;
  overscroll-behavior: none;
  touch-action: manipulation;
  position: fixed;
  inset: 0;
  overflow: hidden;
  container-type: size;
  container-name: tops;
}

#tacticalOpsRoot[data-open="0"] {
  visibility: hidden;
  pointer-events: none;
}

#tacticalOpsRoot[data-open="1"] {
  visibility: visible;
  pointer-events: auto;
}

#tacticalOpsRoot,
#tacticalOpsRoot * {
  box-sizing: border-box;
}

#tacticalOpsRoot button:not(:disabled),
#tacticalOpsRoot [role="button"]:not(:disabled) {
  cursor: pointer;
}

#tacticalOpsRoot .t-ico {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
}

/* Rotate gate permanently disabled — portrait is a first-class layout. */
#tacticalOpsRoot .t-rotate-gate,
#tacticalOpsRoot .t-hint {
  display: none !important;
}

#tacticalOpsRoot .t-shell {
  height: 100%;
  width: 100%;
  min-height: 0;
  background: var(--t-bg);
  color: var(--t-fg);
  font-family: var(--t-font-sans);
  -webkit-user-select: none;
  user-select: none;
  touch-action: manipulation;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

#tacticalOpsRoot .t-fill {
  position: absolute;
  inset: 0;
}

#tacticalOpsRoot .t-bg {
  background:
    radial-gradient(120% 80% at 20% 40%, #143c5047, transparent 55%),
    radial-gradient(100% 80% at 85% 45%, #50101052, transparent 50%),
    var(--t-bg);
  position: absolute;
  inset: 0;
}

#tacticalOpsRoot .t-bg img {
  object-fit: cover;
  opacity: 0.42;
  filter: saturate(0.72) brightness(0.55) contrast(1.12);
  width: 100%;
  height: 100%;
}

#tacticalOpsRoot .t-vignette {
  pointer-events: none;
  background:
    linear-gradient(#07090de0 0%, transparent 16%, transparent 80%, #07090df2 100%),
    radial-gradient(transparent 40%, #07090dcc 100%);
  position: absolute;
  inset: 0;
  z-index: 2;
}

#tacticalOpsRoot .t-panel {
  background: #080c11e6;
  border: 1px solid #e8edf21f;
  box-shadow: 0 12px 40px #00000073;
}

#tacticalOpsRoot .t-kicker {
  font-family: var(--t-font-display);
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--t-ally);
  font-size: 0.68rem;
  font-weight: 600;
}

#tacticalOpsRoot .t-title {
  font-family: var(--t-font-display);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: 700;
  line-height: 0.95;
}

#tacticalOpsRoot .t-btn {
  min-height: 48px;
  font-family: var(--t-font-display);
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--t-fg);
  border-radius: var(--t-radius-sm);
  background: #171d24eb;
  border: 1px solid #e8edf229;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  padding: 0 1.25rem;
  font-size: 0.92rem;
  font-weight: 700;
  transition: transform 0.15s cubic-bezier(0.22, 1, 0.36, 1), background 0.15s, border-color 0.15s;
  display: inline-flex;
  touch-action: manipulation;
  user-select: none;
}

#tacticalOpsRoot .t-btn:hover:not(:disabled) {
  background: #1e2a34f2;
  border-color: #3ec6ff8c;
}

#tacticalOpsRoot .t-btn:active:not(:disabled) {
  transform: scale(0.98);
}

#tacticalOpsRoot .t-btn:disabled {
  opacity: 0.38;
}

#tacticalOpsRoot .t-btn-primary {
  color: var(--t-ally);
  background: #3ec6ff24;
  border-color: #3ec6ff8c;
}

#tacticalOpsRoot .t-btn-primary:hover:not(:disabled) {
  background: #3ec6ff38;
}

#tacticalOpsRoot .t-btn-ghost {
  background: transparent;
}

/* Hub / brief / results */
#tacticalOpsRoot .t-hub {
  height: 100%;
  padding: max(1.25rem, env(safe-area-inset-top)) max(1.25rem, env(safe-area-inset-right))
    max(1.5rem, env(safe-area-inset-bottom)) max(1.25rem, env(safe-area-inset-left));
  flex-direction: column;
  justify-content: flex-end;
  display: flex;
  position: relative;
  z-index: 2;
  pointer-events: auto;
}

#tacticalOpsRoot .t-hub-copy {
  z-index: 2;
  max-width: 36rem;
  position: relative;
}

#tacticalOpsRoot .t-hub h1 {
  margin: 0.2rem 0 0;
  font-size: max(2.2rem, min(8vw, 4.6rem));
}

#tacticalOpsRoot .t-hub h2 {
  color: var(--t-muted);
  font-size: max(1rem, min(3vw, 1.6rem));
  font-family: var(--t-font-display);
  letter-spacing: 0.32em;
  margin: 0.15rem 0 1.25rem;
  font-weight: 600;
}

#tacticalOpsRoot .t-op-card {
  border-radius: var(--t-radius-md);
  flex-direction: column;
  gap: 0.35rem;
  max-width: 28rem;
  margin-bottom: 1.15rem;
  padding: 1rem 1.15rem;
  display: flex;
}

#tacticalOpsRoot .t-op-card strong {
  font-family: var(--t-font-display);
  letter-spacing: 0.18em;
  font-size: 1.05rem;
}

#tacticalOpsRoot .t-op-card p {
  color: var(--t-muted);
  margin: 0;
  font-size: 0.92rem;
  line-height: 1.45;
}

#tacticalOpsRoot .t-brief {
  z-index: 2;
  height: 100%;
  padding: max(1rem, env(safe-area-inset-top)) max(1rem, env(safe-area-inset-right))
    max(1.1rem, env(safe-area-inset-bottom)) max(1rem, env(safe-area-inset-left));
  flex-direction: column;
  display: flex;
  position: relative;
  overflow: auto;
  pointer-events: auto;
}

#tacticalOpsRoot .t-brief-grid {
  grid-template-columns: 1fr;
  gap: 0.75rem;
  margin: 1rem 0 auto;
  display: grid;
}

@media (min-width: 800px) {
  #tacticalOpsRoot .t-brief-grid {
    grid-template-columns: 1.1fr 0.9fr;
  }
}

#tacticalOpsRoot .t-brief-block {
  border-radius: var(--t-radius-md);
  padding: 0.95rem 1rem;
}

#tacticalOpsRoot .t-brief-block h3 {
  font-family: var(--t-font-display);
  letter-spacing: 0.2em;
  color: var(--t-muted);
  margin: 0 0 0.55rem;
  font-size: 0.78rem;
}

#tacticalOpsRoot .t-unit-row {
  border-bottom: 1px solid #e8edf20f;
  align-items: center;
  gap: 0.7rem;
  padding: 0.45rem 0;
  display: flex;
}

#tacticalOpsRoot .t-unit-row:last-child {
  border-bottom: 0;
}

#tacticalOpsRoot .t-unit-row img,
#tacticalOpsRoot .t-unit-ph {
  object-fit: cover;
  object-position: 50% 40%;
  background: var(--t-elevated);
  border: 1px solid #3ec6ff40;
  border-radius: 4px;
  width: 42px;
  height: 42px;
  flex-shrink: 0;
}

#tacticalOpsRoot .t-unit-ph.enemy {
  border-color: #e23d3d66;
}

#tacticalOpsRoot .t-brief-actions {
  flex-wrap: wrap;
  gap: 0.7rem;
  display: flex;
}

#tacticalOpsRoot .t-overlay {
  z-index: 50;
  background: #0a0c109e;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  display: flex;
  position: absolute;
  inset: 0;
  pointer-events: auto;
}

#tacticalOpsRoot .t-modal {
  border-radius: var(--t-radius-lg);
  text-align: center;
  width: min(420px, 100%);
  padding: 1.4rem 1.3rem 1.2rem;
}

#tacticalOpsRoot .t-modal h2 {
  margin: 0.2rem 0 0.7rem;
  font-size: max(1.6rem, min(4vw, 2.2rem));
}

#tacticalOpsRoot .t-stats {
  text-align: left;
  grid-template-columns: 1fr 1fr;
  gap: 0.55rem 1rem;
  margin: 1rem 0 1.2rem;
  display: grid;
}

#tacticalOpsRoot .t-stats dt {
  font-family: var(--t-font-display);
  letter-spacing: 0.12em;
  color: var(--t-muted);
  text-transform: uppercase;
  font-size: 0.68rem;
}

#tacticalOpsRoot .t-stats dd {
  font-family: var(--t-font-display);
  font-variant-numeric: tabular-nums;
  margin: 0.1rem 0 0;
  font-size: 1.25rem;
  font-weight: 700;
  white-space: nowrap;
}

/* Compact / standard: stacked HUD, battlefield is the 1fr region.
   Wide: overlay HUD on a full-bleed field.
   Field row uses minmax(160px, 1fr) so absolute .t-field children cannot collapse the row to 0. */

#tacticalOpsRoot .t-battle {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: auto auto minmax(160px, 1fr) auto auto;
  grid-template-areas:
    "top"
    "order"
    "field"
    "status"
    "dock";
  height: 100%;
  width: 100%;
  min-height: 0;
  flex: 1 1 auto;
  position: relative;
  overflow: hidden;
}

#tacticalOpsRoot .t-top {
  grid-area: top;
  z-index: 30;
  padding: max(0.4rem, env(safe-area-inset-top)) max(0.6rem, env(safe-area-inset-right)) 0.25rem
    max(0.6rem, env(safe-area-inset-left));
  pointer-events: none;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: start;
  gap: 0.4rem;
  display: grid;
  position: relative;
  background: linear-gradient(#07090de8 0%, #07090d00 100%);
}

#tacticalOpsRoot .t-top > * {
  pointer-events: auto;
}

#tacticalOpsRoot .t-brand {
  align-items: center;
  gap: 0.45rem;
  min-width: 0;
  display: flex;
}

#tacticalOpsRoot .t-brand img {
  object-fit: cover;
  object-position: 50% 12%;
  border: 1px solid #3ec6ff73;
  border-radius: 4px;
  width: 36px;
  height: 36px;
  box-shadow: 0 0 0 1px #3ec6ff2e, 0 4px 14px #0008;
  flex-shrink: 0;
}

#tacticalOpsRoot .t-brand h1 {
  letter-spacing: 0.12em;
  margin: 0;
  font-size: 0.92rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

#tacticalOpsRoot .t-brand p {
  font-family: var(--t-font-display);
  letter-spacing: 0.18em;
  color: var(--t-ally);
  margin: 0;
  font-size: 0.58rem;
}

#tacticalOpsRoot .t-turn {
  text-align: center;
}

#tacticalOpsRoot .t-turn strong {
  font-family: var(--t-font-display);
  letter-spacing: 0.22em;
  font-size: 0.95rem;
  display: block;
}

#tacticalOpsRoot .t-turn-sub {
  font-family: var(--t-font-display);
  letter-spacing: 0.16em;
  color: var(--t-muted);
  font-size: 0.58rem;
  display: block;
  white-space: nowrap;
}

#tacticalOpsRoot .t-obj {
  text-align: right;
  font-family: var(--t-font-display);
  letter-spacing: 0.14em;
  color: var(--t-enemy);
  justify-self: end;
  font-size: 0.62rem;
  min-width: 0;
}

#tacticalOpsRoot .t-obj small {
  color: var(--t-muted);
  letter-spacing: 0.12em;
  margin-top: 0.1rem;
  display: block;
}

#tacticalOpsRoot .t-order-wrap {
  grid-area: order;
  z-index: 30;
  display: flex;
  justify-content: center;
  padding: 0.15rem 0.5rem 0.25rem;
  pointer-events: auto;
}

#tacticalOpsRoot .t-order {
  display: flex;
  gap: 0.28rem;
  justify-content: center;
  align-items: center;
  overflow-x: auto;
  overflow-y: hidden;
  max-width: 100%;
  scrollbar-width: none;
}

#tacticalOpsRoot .t-order::-webkit-scrollbar {
  display: none;
}

#tacticalOpsRoot .t-order-unit {
  width: 28px;
  height: 28px;
  border-radius: 4px;
  border: 1px solid #e8edf22e;
  overflow: hidden;
  position: relative;
  opacity: 0.55;
  flex-shrink: 0;
  background: var(--t-elevated);
  box-shadow: 0 2px 8px #0008;
}

#tacticalOpsRoot .t-order-unit img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 50% 18%;
  display: block;
}

#tacticalOpsRoot .t-order-unit.active {
  opacity: 1;
  border-color: var(--t-ally);
  box-shadow: 0 0 0 1px #3ec6ff99, 0 0 10px #3ec6ff55;
  transform: scale(1.12);
}

#tacticalOpsRoot .t-order-unit.enemy {
  border-color: #e23d3d66;
}

#tacticalOpsRoot .t-order-unit.enemy.active {
  border-color: var(--t-enemy);
  box-shadow: 0 0 0 1px #e23d3d99, 0 0 10px #e23d3d55;
}

#tacticalOpsRoot .t-top,
#tacticalOpsRoot .t-order-wrap,
#tacticalOpsRoot .t-status,
#tacticalOpsRoot .t-dock {
  flex: 0 0 auto;
}

#tacticalOpsRoot .t-field-wrap {
  grid-area: field;
  min-height: var(--tops-field-h, 160px);
  min-width: 0;
  position: relative;
  overflow: hidden;
  align-self: stretch;
  justify-self: stretch;
  width: 100%;
  height: var(--tops-field-h, auto);
  flex: 1 1 auto;
}

#tacticalOpsRoot .t-field {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

#tacticalOpsRoot .t-field-art {
  object-fit: cover;
  object-position: 50% 58%;
  filter: saturate(0.78) brightness(0.62) contrast(1.1);
  width: 100%;
  height: 100%;
  min-width: 100%;
  min-height: 100%;
  display: block;
  position: absolute;
  inset: 0;
  pointer-events: none;
}

#tacticalOpsRoot .t-field-grade {
  pointer-events: none;
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, #07090dcc 0%, transparent 18%, transparent 72%, #07090de6 100%),
    radial-gradient(70% 55% at 22% 48%, #123a4e55 0%, transparent 58%),
    radial-gradient(60% 50% at 78% 42%, #4a141455 0%, transparent 55%);
  z-index: 1;
}

#tacticalOpsRoot .t-field .t-vignette {
  z-index: 3;
}

#tacticalOpsRoot .t-grid {
  pointer-events: none;
  position: absolute;
  inset: 0;
  z-index: 4;
}

#tacticalOpsRoot .t-grid i {
  position: absolute;
  width: 9px;
  height: 9px;
  transform: translate(-50%, -50%) rotate(45deg);
  border: 1px solid #3ec6ff40;
  background: #3ec6ff14;
}

#tacticalOpsRoot .t-cell {
  z-index: 8;
  background: transparent;
  border: 0;
  border-radius: 999px;
  width: 44px;
  min-width: 44px;
  height: 44px;
  min-height: 44px;
  padding: 0;
  position: absolute;
  transform: translate(-50%, -50%);
  touch-action: manipulation;
}

#tacticalOpsRoot .t-cell.move:after {
  content: "";
  background: radial-gradient(circle, #3ec6ffa8 0%, #3ec6ff1f 68%, transparent 72%);
  border: 1px solid #3ec6ffb3;
  border-radius: 999px;
  width: 16px;
  height: 16px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 12px #3ec6ff59;
}

#tacticalOpsRoot .t-cell.move:hover:after,
#tacticalOpsRoot .t-cell.move:focus-visible:after {
  width: 20px;
  height: 20px;
}

#tacticalOpsRoot .t-token {
  z-index: 5;
  pointer-events: none;
  width: 13.6%;
  min-width: 48px;
  max-width: 132px;
  transition: left 0.28s cubic-bezier(0.22, 1, 0.36, 1), top 0.28s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.28s, filter 0.2s;
  position: absolute;
  transform: translate(-50%, -88%);
}

#tacticalOpsRoot .t-token.alpha {
  width: 15.2%;
  min-width: 54px;
  max-width: 148px;
}

#tacticalOpsRoot .t-token.leader {
  width: 16.5%;
  min-width: 58px;
  max-width: 160px;
}

#tacticalOpsRoot .t-token.hound {
  width: 14.5%;
  min-width: 52px;
  max-width: 140px;
}

#tacticalOpsRoot .t-token.defeated {
  opacity: 0;
  pointer-events: none;
  filter: grayscale() brightness(0.4);
}

#tacticalOpsRoot .t-token.acted:not(.selected) {
  filter: saturate(0.7) brightness(0.82);
}

#tacticalOpsRoot .t-token.subdued {
  opacity: 0.55;
  filter: saturate(0.55);
}

#tacticalOpsRoot .t-token.targetable:not(.defeated) .t-ring {
  filter: drop-shadow(0 0 8px #e23d3dd9);
}

#tacticalOpsRoot .t-token.targetable.ally:not(.defeated) .t-ring {
  filter: drop-shadow(0 0 8px #3ec6ffd9);
}

#tacticalOpsRoot .t-token.attacking img.body {
  animation: 0.38s cubic-bezier(0.22, 1, 0.36, 1) t-lunge;
}

#tacticalOpsRoot .t-token.enemy.attacking img.body {
  animation: 0.38s cubic-bezier(0.22, 1, 0.36, 1) t-lunge-left;
}

#tacticalOpsRoot .t-ring {
  pointer-events: none;
  width: 108%;
  position: absolute;
  bottom: 1%;
  left: 50%;
  transform: translate(-50%);
  filter: drop-shadow(0 0 8px currentColor);
}

#tacticalOpsRoot .t-token.ally .t-ring {
  color: var(--t-ally);
}

#tacticalOpsRoot .t-token.enemy .t-ring {
  color: var(--t-enemy);
}

#tacticalOpsRoot .t-token.active .t-ring {
  filter: drop-shadow(0 0 12px #3ec6ffe6);
}

#tacticalOpsRoot .t-token.enemy.active .t-ring {
  filter: drop-shadow(0 0 12px #e23d3de6);
}

#tacticalOpsRoot .t-hit {
  pointer-events: auto;
  z-index: 2;
  background: transparent;
  border: 0;
  width: 44px;
  height: 56px;
  min-width: 44px;
  min-height: 44px;
  padding: 0;
  position: absolute;
  bottom: 6%;
  left: 50%;
  transform: translate(-50%);
  touch-action: manipulation;
}

#tacticalOpsRoot .t-token img.body {
  pointer-events: none;
  filter: drop-shadow(0 10px 12px #0000008c);
  width: 100%;
  height: auto;
  display: block;
}

#tacticalOpsRoot .t-plate {
  pointer-events: none;
  background: #07090df2;
  border: 1px solid #e8edf21f;
  border-radius: 4px;
  min-width: 64px;
  max-width: 104px;
  padding: 0.1rem 0.3rem 0.14rem;
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translate(-50%);
  box-shadow: 0 6px 16px #00000073;
}

#tacticalOpsRoot .t-token.enemy .t-plate {
  border-color: #e23d3d73;
}

#tacticalOpsRoot .t-token.ally .t-plate {
  border-color: #3ec6ff61;
}

#tacticalOpsRoot .t-token.inspect:not(.active) .t-plate {
  border-color: #e8edf273;
}

#tacticalOpsRoot .t-plate-name {
  font-family: var(--t-font-display);
  letter-spacing: 0.1em;
  white-space: nowrap;
  justify-content: space-between;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.64rem;
  font-weight: 700;
  display: flex;
}

#tacticalOpsRoot .t-hp {
  align-items: center;
  gap: 0.3rem;
  margin-top: 0.12rem;
  display: flex;
}

#tacticalOpsRoot .t-hp-bar {
  background: #e8edf21f;
  border-radius: 99px;
  flex: 1;
  height: 4px;
  overflow: hidden;
}

#tacticalOpsRoot .t-hp-bar > i {
  background: var(--t-ally);
  width: 0;
  height: 100%;
  transition: width 0.28s cubic-bezier(0.22, 1, 0.36, 1);
  display: block;
}

#tacticalOpsRoot .t-token.ally .t-hp-bar > i {
  background: linear-gradient(90deg, #2aa8e0, #7ae0ff);
}

#tacticalOpsRoot .t-token.enemy .t-hp-bar > i {
  background: linear-gradient(90deg, #c62828, #ff6b6b);
}

#tacticalOpsRoot .t-hp-num {
  font-family: var(--t-font-display);
  font-variant-numeric: tabular-nums;
  color: var(--t-muted);
  font-size: 0.58rem;
}

#tacticalOpsRoot .t-chips {
  display: flex;
  gap: 0.15rem;
  flex-wrap: wrap;
  margin-top: 0.12rem;
}

#tacticalOpsRoot .t-chip {
  font-family: var(--t-font-display);
  font-size: 0.52rem;
  letter-spacing: 0.08em;
  padding: 0 0.22rem;
  border-radius: 2px;
  border: 1px solid #e8edf233;
  color: var(--t-muted);
  line-height: 1.3;
}

#tacticalOpsRoot .t-chip.buff {
  color: var(--t-ally);
  border-color: #3ec6ff66;
}

#tacticalOpsRoot .t-chip.debuff {
  color: #ff8a8a;
  border-color: #e23d3d73;
}

#tacticalOpsRoot .t-float {
  font-family: var(--t-font-display);
  letter-spacing: 0.06em;
  pointer-events: none;
  z-index: 20;
  text-shadow: 0 2px 8px #000c;
  font-size: 1rem;
  font-weight: 700;
  animation: 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards t-float;
  position: absolute;
  transform: translate(-50%, -120%);
}

#tacticalOpsRoot .t-float.dmg {
  color: #ff6b6b;
}

#tacticalOpsRoot .t-float.heal {
  color: var(--t-heal);
}

#tacticalOpsRoot .t-float.guard,
#tacticalOpsRoot .t-float.info {
  color: var(--t-ally);
  font-size: 0.78rem;
}

#tacticalOpsRoot .t-impact {
  pointer-events: none;
  z-index: 18;
  border: 2px solid #e8edf2d9;
  border-radius: 99px;
  width: 54px;
  height: 54px;
  animation: 0.38s ease-out forwards t-impact;
  position: absolute;
  transform: translate(-50%, -50%);
}

/* Compact always-visible selected-unit status */
#tacticalOpsRoot .t-status {
  grid-area: status;
  z-index: 32;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.5rem;
  padding: 0.28rem 0.55rem;
  margin: 0 0.45rem 0.15rem;
  background: #080c11f0;
  border: 1px solid #e8edf224;
  border-radius: 8px;
  pointer-events: auto;
  min-height: 48px;
}

#tacticalOpsRoot .t-status img {
  width: 36px;
  height: 36px;
  object-fit: cover;
  object-position: 50% 18%;
  border-radius: 4px;
  border: 1px solid #3ec6ff59;
  flex-shrink: 0;
}

#tacticalOpsRoot .t-status.enemy img {
  border-color: #e23d3d73;
}

#tacticalOpsRoot .t-status-name {
  font-family: var(--t-font-display);
  letter-spacing: 0.14em;
  font-size: 0.78rem;
  font-weight: 700;
}

#tacticalOpsRoot .t-status-stats {
  display: grid;
  grid-template-columns: repeat(4, auto);
  gap: 0.15rem 0.55rem;
  margin: 0;
}

#tacticalOpsRoot .t-status-stats dt {
  font-family: var(--t-font-display);
  letter-spacing: 0.08em;
  color: var(--t-muted);
  font-size: 0.52rem;
}

#tacticalOpsRoot .t-status-stats dd {
  margin: 0;
  font-family: var(--t-font-display);
  font-size: 0.72rem;
  font-variant-numeric: tabular-nums;
}

#tacticalOpsRoot .t-status-empty {
  opacity: 0.4;
}

#tacticalOpsRoot .t-dock {
  grid-area: dock;
  z-index: 30;
  padding: 0.3rem max(0.55rem, env(safe-area-inset-right)) max(0.55rem, env(safe-area-inset-bottom))
    max(0.55rem, env(safe-area-inset-left));
  background: linear-gradient(#0000, #07090df0 38%);
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: end;
  gap: 0.4rem;
  display: grid;
  position: relative;
}

#tacticalOpsRoot .t-icon-btn {
  border-radius: var(--t-radius-sm);
  width: 44px;
  height: 44px;
  min-width: 44px;
  min-height: 44px;
  color: var(--t-fg);
  background: #10141acc;
  border: 1px solid #e8edf21f;
  place-items: center;
  display: grid;
  touch-action: manipulation;
}

#tacticalOpsRoot .t-actions {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.35rem;
  width: 100%;
  max-width: 42rem;
  margin: 0 auto;
  display: grid;
}

#tacticalOpsRoot .t-act {
  text-align: left;
  min-height: 52px;
  color: var(--t-fg);
  border-radius: var(--t-radius-sm);
  background: #0a0e14f0;
  border: 1px solid #e8edf224;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.05rem;
  padding: 0.38rem 0.45rem 0.4rem;
  transition: border-color 0.15s, background 0.15s, transform 0.15s cubic-bezier(0.22, 1, 0.36, 1);
  display: flex;
  position: relative;
  overflow: hidden;
  touch-action: manipulation;
  user-select: none;
}

#tacticalOpsRoot .t-act .row {
  font-family: var(--t-font-display);
  letter-spacing: 0.14em;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.76rem;
  font-weight: 700;
  display: flex;
}

#tacticalOpsRoot .t-act .row .slot {
  color: var(--t-faint);
  font-size: 0.58rem;
  letter-spacing: 0.14em;
}

#tacticalOpsRoot .t-act small {
  color: var(--t-muted);
  letter-spacing: 0.02em;
  font-size: 0.58rem;
  line-height: 1.2;
}

#tacticalOpsRoot .t-act:hover:not(:disabled) {
  border-color: #3ec6ff73;
}

#tacticalOpsRoot .t-act:active:not(:disabled) {
  transform: scale(0.985);
}

#tacticalOpsRoot .t-act.on {
  border-color: var(--t-ally);
  background: #3ec6ff18;
  box-shadow: inset 0 0 0 1px #3ec6ff66;
}

#tacticalOpsRoot .t-act:disabled {
  opacity: 0.38;
}

#tacticalOpsRoot .t-act .cd {
  color: var(--t-enemy);
  letter-spacing: 0.12em;
  font-family: var(--t-font-display);
  font-size: 0.62rem;
}

#tacticalOpsRoot .t-act.cooling {
  opacity: 0.72;
}

#tacticalOpsRoot .t-skip {
  letter-spacing: 0.16em;
  min-width: 4.6rem;
  min-height: 52px;
  padding: 0 0.7rem;
}

#tacticalOpsRoot .t-ticker {
  z-index: 28;
  font-family: var(--t-font-display);
  letter-spacing: 0.16em;
  color: var(--t-fg);
  white-space: nowrap;
  text-overflow: ellipsis;
  background: #07090de8;
  border: 1px solid #3ec6ff33;
  border-radius: 99px;
  max-width: min(92vw, 36rem);
  padding: 0.22rem 0.7rem;
  font-size: 0.68rem;
  position: absolute;
  top: auto;
  bottom: auto;
  left: 50%;
  overflow: hidden;
  transform: translate(-50%, 0);
  grid-area: field;
  align-self: start;
  justify-self: center;
  margin-top: 0.35rem;
  pointer-events: none;
}

#tacticalOpsRoot .t-banner {
  z-index: 40;
  pointer-events: none;
  background: #0a0c1047;
  place-items: center;
  display: grid;
  position: absolute;
  inset: 0;
  grid-area: field;
}

#tacticalOpsRoot .t-banner span {
  font-family: var(--t-font-display);
  letter-spacing: 0.3em;
  background: #07090de8;
  border: 1px solid #3ec6ff40;
  padding: 0.7rem 1.3rem;
  font-size: max(1.1rem, min(4vw, 2.1rem));
  font-weight: 700;
}

/* ---- COMPACT (phones + narrow Mini App) ---- */
#tacticalOpsRoot[data-layout="compact"] .t-brand p,
#tacticalOpsRoot[data-layout="compact"] .t-obj small,
#tacticalOpsRoot[data-layout="compact"] .t-act small {
  display: none;
}

#tacticalOpsRoot[data-layout="compact"] .t-brand h1 {
  font-size: 0.78rem;
}

#tacticalOpsRoot[data-layout="compact"] .t-obj {
  font-size: 0.55rem;
}

#tacticalOpsRoot[data-layout="compact"] .t-token {
  width: 14%;
  min-width: 44px;
  max-width: 88px;
}

#tacticalOpsRoot[data-layout="compact"] .t-token.alpha {
  width: 16%;
  min-width: 48px;
}

#tacticalOpsRoot[data-layout="compact"] .t-token.leader {
  width: 17%;
  min-width: 52px;
}

#tacticalOpsRoot[data-layout="compact"] .t-token.hound {
  width: 15%;
  min-width: 46px;
}

#tacticalOpsRoot[data-layout="compact"] .t-plate {
  min-width: 56px;
  top: -26px;
}

#tacticalOpsRoot[data-layout="compact"] .t-status-stats {
  display: none;
}

#tacticalOpsRoot[data-layout="compact"] .t-skip {
  min-width: 0;
  padding: 0 0.55rem;
  font-size: 0.78rem;
  letter-spacing: 0.1em;
}

#tacticalOpsRoot[data-layout="compact"] .t-cell {
  width: 40px;
  min-width: 40px;
  height: 40px;
  min-height: 40px;
}

/* ---- STANDARD (tablet) ---- */
#tacticalOpsRoot[data-layout="standard"] .t-brand img {
  width: 42px;
  height: 42px;
}

#tacticalOpsRoot[data-layout="standard"] .t-order-unit {
  width: 32px;
  height: 32px;
}

#tacticalOpsRoot[data-layout="standard"] .t-act,
#tacticalOpsRoot[data-layout="standard"] .t-skip {
  min-height: 58px;
}

/* ---- WIDE / EXPANDED (landscape + desktop) ---- */
#tacticalOpsRoot[data-layout="wide"] .t-battle {
  display: grid;
  grid-template-rows: 1fr;
  grid-template-areas: "field";
}

#tacticalOpsRoot[data-layout="wide"] .t-top,
#tacticalOpsRoot[data-layout="wide"] .t-order-wrap,
#tacticalOpsRoot[data-layout="wide"] .t-dock,
#tacticalOpsRoot[data-layout="wide"] .t-status {
  position: absolute;
}

#tacticalOpsRoot[data-layout="wide"] .t-top {
  top: 0;
  left: 0;
  right: 0;
  grid-area: unset;
}

#tacticalOpsRoot[data-layout="wide"] .t-order-wrap {
  top: 3.4rem;
  left: 0;
  right: 0;
  grid-area: unset;
}

#tacticalOpsRoot[data-layout="wide"] .t-field-wrap {
  position: absolute;
  inset: 0;
  grid-area: unset;
  height: 100%;
  min-height: 100%;
  max-height: none;
}

#tacticalOpsRoot[data-layout="wide"] .t-status {
  left: max(0.7rem, env(safe-area-inset-left));
  top: 6.2rem;
  width: min(220px, 28vw);
  grid-template-columns: auto minmax(0, 1fr);
  grid-area: unset;
  margin: 0;
}

#tacticalOpsRoot[data-layout="wide"] .t-status-stats {
  grid-column: 1 / -1;
  grid-template-columns: repeat(4, 1fr);
}

#tacticalOpsRoot[data-layout="wide"] .t-dock {
  left: 0;
  right: 0;
  bottom: 0;
  grid-area: unset;
}

#tacticalOpsRoot[data-layout="wide"] .t-brand img {
  width: 46px;
  height: 46px;
}

#tacticalOpsRoot[data-layout="wide"] .t-act,
#tacticalOpsRoot[data-layout="wide"] .t-skip {
  min-height: 62px;
}

#tacticalOpsRoot[data-layout="wide"] .t-skip {
  min-width: 7.2rem;
}

#tacticalOpsRoot[data-layout="wide"] .t-ticker {
  top: 5.6rem;
  margin-top: 0;
}

/* Viewport CSS fallback (works even before data-layout is stamped) */
@container tops (max-width: 599px) {
  #tacticalOpsRoot .t-act small {
    display: none;
  }
}

@media (max-width: 599px) {
  #tacticalOpsRoot .t-act small {
    display: none;
  }
}

@media (max-height: 420px) {
  #tacticalOpsRoot .t-brand img {
    width: 32px;
    height: 32px;
  }
  #tacticalOpsRoot .t-act,
  #tacticalOpsRoot .t-skip {
    min-height: 48px;
  }
  #tacticalOpsRoot .t-act small {
    display: none;
  }
  #tacticalOpsRoot .t-status {
    min-height: 40px;
    padding: 0.18rem 0.4rem;
  }
  #tacticalOpsRoot .t-status img {
    width: 28px;
    height: 28px;
  }
}

@media (prefers-reduced-motion: reduce) {
  #tacticalOpsRoot .t-token,
  #tacticalOpsRoot .t-hp-bar > i,
  #tacticalOpsRoot .t-btn,
  #tacticalOpsRoot .t-act {
    transition: none;
  }
  #tacticalOpsRoot .t-token.attacking img.body,
  #tacticalOpsRoot .t-float,
  #tacticalOpsRoot .t-impact {
    animation: none;
  }
  #tacticalOpsRoot .t-ring {
    filter: none;
  }
}

@keyframes t-lunge {
  0% {
    transform: translate(0);
  }
  40% {
    transform: translate(10px) scale(1.04);
  }
  to {
    transform: translate(0);
  }
}

@keyframes t-lunge-left {
  0% {
    transform: translate(0);
  }
  40% {
    transform: translate(-10px) scale(1.04);
  }
  to {
    transform: translate(0);
  }
}

@keyframes t-float {
  0% {
    opacity: 0;
    transform: translate(-50%, -80%);
  }
  18% {
    opacity: 1;
  }
  to {
    opacity: 0;
    transform: translate(-50%, -160%);
  }
}

@keyframes t-impact {
  0% {
    opacity: 0.9;
    transform: translate(-50%, -50%) scale(0.4);
  }
  to {
    opacity: 0;
    transform: translate(-50%, -50%) scale(1.6);
  }
}

#tacticalOpsRoot .t-bg,
#tacticalOpsRoot .t-vignette,
#tacticalOpsRoot .t-field-art,
#tacticalOpsRoot .t-field-grade {
  pointer-events: none;
}
`,cn={requestClose:()=>{},dbg:!1};function ln(e){cn={...cn,...e}}function un(e,t){let n=Math.max(0,Math.round(e));return n<=599?`compact`:n<=899?`standard`:`wide`}var dn=`tactical_ops.js v2.2.3-field-geometry`,fn=`tacticalOpsRoot`,pn=`tacticalOpsStyles`,mn=`tacticalOpsFonts`,P={apiPost:null,tg:null,dbg:!1,root:null,isOpen:!1,reactRoot:null,keyHandlerBound:!1,resizeBound:!1,prevBodyOverflow:``,prevHtmlOverflow:``,resizeObserver:null,battleWatcher:null};try{window.__AH_TACTICAL_OPS_VER__=dn,window.__TACTICAL_COMBAT__=Et}catch{}function hn(){let e=document.getElementById(pn);e||(e=document.createElement(`style`),e.id=pn,document.head.appendChild(e)),e.textContent=sn}function gn(){if(document.getElementById(mn))return;let e=document.createElement(`link`);e.id=mn,e.rel=`stylesheet`,e.href=`https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Source+Sans+3:wght@400;600;700&display=swap`,document.head.appendChild(e)}function _n(){let e=P.root||document.getElementById(fn);if(!e)return;let t=window.visualViewport,n=P.tg?.viewportStableHeight||P.tg?.viewportHeight,r=Math.max(1,Math.round(t?.width||e.clientWidth||window.innerWidth)),i=Math.max(1,Math.round(t?.height||(typeof n==`number`?n:0)||window.innerHeight)),a=Math.round(t?.offsetTop||0),o=Math.round(t?.offsetLeft||0);e.style.position=`fixed`,e.style.left=`${o}px`,e.style.top=`${a}px`,e.style.right=`auto`,e.style.bottom=`auto`,e.style.width=`${r}px`,e.style.height=`${i}px`,e.style.maxHeight=`${i}px`,e.style.setProperty(`--tops-w`,`${r}px`),e.style.setProperty(`--tops-h`,`${i}px`),e.setAttribute(`data-layout`,un(r,i)),vn(e,r,i)}function vn(e,t,n){let r=e.querySelector(`.t-field-wrap`);if(!r)return;let i=e.getAttribute(`data-layout`)||un(t,n),a=t=>{let n=e.querySelector(t);return n?Math.round(n.getBoundingClientRect().height):0},o=a(`.t-top`)+a(`.t-order-wrap`)+a(`.t-status`)+a(`.t-dock`),s=i===`wide`?Math.max(160,n):Math.max(160,n-o);e.style.setProperty(`--tops-field-h`,`${s}px`),r.style.display=`block`,r.style.width=`100%`,r.style.minWidth=`0`,r.style.overflow=`hidden`,i===`wide`?(r.style.position=`absolute`,r.style.inset=`0`,r.style.height=`100%`,r.style.minHeight=`100%`,r.style.maxHeight=`none`):(r.style.position=`relative`,r.style.inset=`auto`,r.style.flex=`1 1 auto`,r.style.height=`${s}px`,r.style.minHeight=`${s}px`,r.style.maxHeight=`${s}px`);let c=e.querySelector(`.t-field`);c&&(c.style.position=`absolute`,c.style.inset=`0`,c.style.width=`100%`,c.style.height=`100%`);let l=e.querySelector(`.t-field-art`);l&&(l.style.position=`absolute`,l.style.inset=`0`,l.style.width=`100%`,l.style.height=`100%`,l.style.objectFit=`cover`,l.style.display=`block`)}function yn(){_n()}function bn(){if(!P.resizeBound){window.addEventListener(`resize`,yn);try{window.visualViewport?.addEventListener(`resize`,yn),window.visualViewport?.addEventListener(`scroll`,yn)}catch{}try{P.resizeObserver=new ResizeObserver(yn),P.resizeObserver.observe(document.documentElement),P.root&&P.resizeObserver.observe(P.root)}catch{P.resizeObserver=null}xn(),P.resizeBound=!0}}function xn(){if(!(!P.root||P.battleWatcher))try{P.battleWatcher=new MutationObserver(()=>{requestAnimationFrame(()=>_n())}),P.battleWatcher.observe(P.root,{childList:!0,subtree:!0})}catch{P.battleWatcher=null}}function Sn(){if(P.resizeBound){window.removeEventListener(`resize`,yn);try{window.visualViewport?.removeEventListener(`resize`,yn),window.visualViewport?.removeEventListener(`scroll`,yn)}catch{}try{P.resizeObserver?.disconnect()}catch{}P.resizeObserver=null;try{P.battleWatcher?.disconnect()}catch{}P.battleWatcher=null,P.resizeBound=!1}}function Cn(){P.prevBodyOverflow=document.body.style.overflow,P.prevHtmlOverflow=document.documentElement.style.overflow,document.body.style.overflow=`hidden`,document.documentElement.style.overflow=`hidden`}function wn(){document.body.style.overflow=P.prevBodyOverflow,document.documentElement.style.overflow=P.prevHtmlOverflow}function Tn(e){if(!P.isOpen||e.key!==`Escape`)return;let t=M.getState();if(t.screen===`battle`&&t.battle.mode===`targeting`){t.cancel(),e.preventDefault(),e.stopPropagation();return}if(t.screen===`brief`){t.backToHub(),e.preventDefault(),e.stopPropagation();return}e.preventDefault(),e.stopPropagation(),Nn()}function En(){P.keyHandlerBound||(document.addEventListener(`keydown`,Tn,!0),P.keyHandlerBound=!0)}function Dn(){P.keyHandlerBound&&(document.removeEventListener(`keydown`,Tn,!0),P.keyHandlerBound=!1)}function On(){hn(),gn();let e=document.getElementById(fn);return e||(e=document.createElement(`div`),e.id=fn,e.setAttribute(`data-open`,`0`),document.body.appendChild(e)),P.root=e,e}function kn(){P.isOpen=!1,Dn(),Sn(),wn(),P.reactRoot&&(P.reactRoot.unmount(),P.reactRoot=null);let e=P.root||document.getElementById(fn);e&&(e.setAttribute(`data-open`,`0`),e.innerHTML=``);try{M.getState().backToHub()}catch{}}function An(){let e={close:()=>{kn()},isOpen:()=>P.isOpen},t=window;try{t.AlphaNav?.push?t.AlphaNav.push(fn,e):(t.navRegister?.(fn,e),t.navOpen?.(fn))}catch{}}function jn(e){let t=e&&typeof e==`object`?e:{};typeof t.apiPost==`function`&&(P.apiPost=t.apiPost),t.tg&&(P.tg=t.tg),typeof t.dbg==`boolean`&&(P.dbg=t.dbg);try{if(P.apiPost&&typeof window<`u`){let e=window;typeof e.apiPost!=`function`&&(e.apiPost=P.apiPost)}}catch{}return ln({requestClose:Nn,dbg:P.dbg}),Fn}async function Mn(){let e=On();ln({requestClose:Nn,dbg:P.dbg}),P.isOpen=!0,e.setAttribute(`data-open`,`1`),Cn(),En(),bn(),_n(),P.reactRoot||(P.reactRoot=(0,de.createRoot)(e)),P.reactRoot.render((0,w.createElement)(on)),An();try{P.tg?.expand?.()}catch{}requestAnimationFrame(()=>_n()),setTimeout(()=>_n(),50)}function Nn(){if(!P.isOpen)return;let e=window;try{if(e.AlphaNav?.close?.(fn,{source:`tactical-ops-close`}))return}catch{}kn();try{e.navClose?.(fn)}catch{}}function Pn(){return{...Vt(),open:P.isOpen,version:dn}}var Fn={init:jn,open:Mn,close:Nn,refresh:Pn,getState:Pn};function In(){return window.TacticalOps=Fn,Fn}var Ln=In();try{let e=window;e.__AH_TACTICAL_OPS_VER__=dn,e.__TACTICAL_COMBAT__=Et,e.TacticalOps=Ln}catch{}return e.API=Fn,e.DEF_CURVE=he,e.GRID_COLS=fe,e.GRID_ROWS=pe,e.METER_MAX=me,e.STATUS_LABEL=we,e.STATUS_SHORT=Te,e.VERSION=dn,e.a1Range=Tt,e.advanceToNext=vt,e.aiUsesLegalRules=ct,e.applyAi=Ct,e.applySkill=et,e.applyStatus=ve,e.availableSkills=tt,e.beginUnitTurn=_t,e.canOccupy=Fe,e.cellKey=Ae,e.chebyshev=ke,e.chooseAiAction=st,e.computeHeal=De,e.consumeMeter=Ke,e.cooldownLeft=Ze,e.createBattle=ht,e.default=Ln,e.effectiveAtk=be,e.effectiveDef=xe,e.effectiveSpd=Se,e.evaluateOutcome=k,e.fieldPercent=O,e.hasStatus=_e,e.inBounds=Oe,e.inSkillRange=Ie,e.incomingDamageMultiplier=Ce,e.isLegalTargetType=He,e.living=Le,e.mitigatedDamage=Ee,e.occupiedKeys=je,e.pickReadyId=Ge,e.planAi=wt,e.previewQueue=qe,e.reachableCells=Pe,e.resetStatusSeq=ge,e.resolveSkillTargets=ze,e.skillNeedsTargetPick=Ve,e.skillReady=Qe,e.startBattle=yt,e.tickUntilReady=We,e.tryMove=bt,e.trySkill=St,e.trySkip=xt,e.unitAt=Me,e.unitSkills=Xe,e.unitsInRadius=Re,e.validTargetIds=Be,e})({});