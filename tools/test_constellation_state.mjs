import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {model} from '../pages/profile/constellation/graph-model.mjs';
const graph=JSON.parse(readFileSync(new URL('../pages/profile/constellation/graph.json',import.meta.url)));
const db=model(graph),base='https://mirinaeman.com/constellation/';
const s=db.fromURL(base);assert.equal(s.selected,'work:snail-time-jeju');
for(const scope of ['all','papers'])for(const limit of [4,7]){
 const state={...s,scope},pool=db.pool(state),seen=[];
 for(let page=0;page<Math.ceil(pool.length/limit);page++)seen.push(...db.window({...state,page},limit).visible.map(n=>n.id));
 assert.deepEqual(seen,pool.map(n=>n.id),'pagination must not lose records');
}
const linked={...s,overview:false,selected:'creator:joonho'};
assert.ok(db.pool(linked).length>60,'high-degree creator remains accessible');
const state={...s,selected:'work:unfold-your-turn',overview:false,scope:'all',view:'list',query:'노래',page:2};
assert.deepEqual(db.fromURL(db.toURL(state,base)),{...state,missing:false});
assert.equal(db.fromURL(base+'?node=missing').missing,true);
assert.equal(db.window({...s,scope:'all',query:'not-a-real-record'}).visible.length,0);
for(const e of graph.edges)assert.ok(db.neighbors(e.target).some(x=>x.node.id===e.source),'reverse exploration');
console.log('Constellation state: PASS (all records, paging, deep links, missing and reverse relations)');
