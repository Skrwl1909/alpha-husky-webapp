import {test} from 'node:test';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {childTransport} from './integration.js';
function fixture(){
  let listener;const sent=[],parent={postMessage:(data,origin)=>sent.push({data,origin})};
  const win={parent,location:{origin:'https://game.example'},addEventListener:(type,fn)=>{listener=fn;},removeEventListener:()=>{listener=null;}};
  return {win,parent,sent,send:data=>listener?.(data)};
}
test('child transport binds messages to exact host origin/source and never carries credentials',async()=>{
  const f=fixture(),t=childTransport(f.win),p=t.request('state');assert.equal(f.sent[0].origin,f.win.location.origin);assert.deepEqual(f.sent[0].data.payload,{});
  const response={channel:'alpha-last-stand-v1',kind:'response',id:1,result:{ok:true}};
  f.send({origin:'https://evil.example',source:f.parent,data:response});f.send({origin:f.win.location.origin,source:{},data:response});
  f.send({origin:f.win.location.origin,source:f.parent,data:response});assert.deepEqual(await p,{ok:true});t.dispose();
});
test('unknown actions and closed transports cannot call arbitrary authenticated endpoints',async()=>{
  const f=fixture(),t=childTransport(f.win);await assert.rejects(t.request('attack'),/UNKNOWN_ACTION/);assert.equal(f.sent.length,0);
  const p=t.request('start',{run_id:'synthetic',raidInstanceId:'test'});t.dispose();await assert.rejects(p,/CLOSED/);
  await assert.rejects(t.request('state'),/CLOSED/);const solo={};solo.parent=solo;assert.throws(()=>childTransport(solo),/HOST_REQUIRED/);
});
test('legacy Blood Moon attack implementation remains byte-equivalent and integration has no economy endpoint',async()=>{
  const source=await readFile(new URL('../../js/bloodmoon.js',import.meta.url),'utf8');
  const normalized=source.replaceAll('\r\n','\n'),begin=normalized.indexOf('  async function attack()'),end=normalized.indexOf('  async function claim(',begin);
  assert.equal(createHash('sha256').update(normalized.slice(begin,end)).digest('hex'),'7936bd1c604bb0ae77728d9c5107634898a6b6ce8b52cfa2507e4ae2d14b9bde');
  assert(source.includes('async function attack()'));assert(source.includes('run_id: commandId'));assert(source.includes('bloodMoonLastStandBtn'));
  const bridge=await readFile(new URL('./integration.js',import.meta.url),'utf8');
  assert(!bridge.includes('/claim'));assert(!bridge.includes('/attack'));assert(!bridge.includes('localStorage'));
});
