// Public transport contract only. Identity remains in the host's existing apiPost.
const CHANNEL='alpha-last-stand-v1';
const paths=Object.freeze({state:'/webapp/bloodmoon/laststand/state',start:'/webapp/bloodmoon/laststand/start',submit:'/webapp/bloodmoon/laststand/submit'});
export const integratedMode=()=>new URLSearchParams(location.search).get('integrated')==='1';
export function receiptPresentation(receipt){
  if(receipt.mode==='AUTHENTICATED_SETTLEMENT_CANDIDATE'){
    if(!receipt.verified||receipt.settled!==true||![0,1].includes(receipt.attemptsConsumed)||!Number.isFinite(receipt.sharedHpDelta)||receipt.sharedHpDelta<0||receipt.contribution!==receipt.sharedHpDelta)throw Error('UNSUPPORTED_RECEIPT');
    return {title:receipt.sharedHpDelta>0?(receipt.status==='won'?'Verified victory · settled':'Verified run · settled'):'Verified result · no raid damage',
      summary:`Proposed isolated settlement: ${receipt.sharedHpDelta} raid damage · ${receipt.contribution} contribution · ${receipt.attemptsConsumed} attempt consumed.${receipt.reason?` ${receipt.reason}.`:''} Existing reward claims remain separate.`};
  }
  return {title:receipt.status==='won'?'Verified solo victory':'Verified run ended',summary:'No raid credit awarded. Attempts, cooldowns, shared HP, contribution and rewards are unchanged. Settlement policy remains pending.'};
}
export function childTransport(win=window){
  if(win.parent===win)throw Error('HOST_REQUIRED');
  let id=0,closed=false;const pending=new Map();
  const receive=e=>{
    if(e.origin!==win.location.origin||e.source!==win.parent||e.data?.channel!==CHANNEL||e.data.kind!=='response')return;
    const p=pending.get(e.data.id);if(!p)return;pending.delete(e.data.id);clearTimeout(p.timer);
    e.data.error?p.reject(Error(e.data.error)):p.resolve(e.data.result);
  };
  win.addEventListener('message',receive);
  return {request(action,payload={}){
    if(closed)return Promise.reject(Error('CLOSED'));
    if(!paths[action])return Promise.reject(Error('UNKNOWN_ACTION'));
    return new Promise((resolve,reject)=>{const key=++id;const timer=setTimeout(()=>{pending.delete(key);reject(Error('NETWORK_RETRY'));},12000);pending.set(key,{resolve,reject,timer});
      win.parent.postMessage({channel:CHANNEL,kind:'request',id:key,action,payload},win.location.origin);
    });
  },dispose(){closed=true;win.removeEventListener('message',receive);for(const p of pending.values()){clearTimeout(p.timer);p.reject(Error('CLOSED'));}pending.clear();}};
}
export function openLastStand({apiPost,onRefresh=()=>{},onClose=()=>{}}){
  if(document.getElementById('last-stand-host'))return;
  const root=document.createElement('section');root.id='last-stand-host';root.setAttribute('role','dialog');root.setAttribute('aria-label','Last Stand encounter');root.setAttribute('aria-modal','true');
  Object.assign(root.style,{position:'fixed',inset:'0',zIndex:'2147483000',background:'#060b12',display:'flex',flexDirection:'column',paddingTop:'env(safe-area-inset-top)'});
  const close=document.createElement('button');close.textContent='Return to Blood Moon';Object.assign(close.style,{background:'#112936',color:'#d7f9f3',border:'1px solid #609391',padding:'10px',flex:'0 0 auto'});
  const frame=document.createElement('iframe');frame.title='Authenticated Last Stand';frame.src='/prototypes/bloodmoon-v4/index.html?integrated=1';Object.assign(frame.style,{width:'100%',flex:'1',border:'0',minHeight:'0'});
  const previous=document.activeElement,overflow=document.body.style.overflow;document.body.style.overflow='hidden';
  let closed=false;const active=new Map();
  async function receive(e){
    const m=e.data;if(closed||e.origin!==location.origin||e.source!==frame.contentWindow||m?.channel!==CHANNEL||m.kind!=='request'||!Number.isSafeInteger(m.id)||!paths[m.action])return;
    if(active.has(m.id)||active.size>=2)return;
    const p=Promise.resolve().then(()=>apiPost(paths[m.action],m.payload));active.set(m.id,p);
    try{const result=await p;if(!closed)frame.contentWindow.postMessage({channel:CHANNEL,kind:'response',id:m.id,result},location.origin);
      if(m.action==='submit'&&result?.ok)await onRefresh();
    }catch{if(!closed)frame.contentWindow.postMessage({channel:CHANNEL,kind:'response',id:m.id,error:'NETWORK_RETRY'},location.origin);}finally{active.delete(m.id);}
  }
  close.onclick=()=>{closed=true;window.removeEventListener('message',receive);root.remove();document.body.style.overflow=overflow;previous?.focus();onClose();};
  window.addEventListener('message',receive);root.append(close,frame);document.body.append(root);close.focus();
}
