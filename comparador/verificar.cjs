const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {selectItems,countStates,validateData,escapeHTML,recordHTML}=require('./app.js');
const data=validateData(JSON.parse(fs.readFileSync(path.join(__dirname,'dados.json'),'utf8')));
assert.equal(new Set(data.items.map(item=>item.id)).size,data.items.length);
assert.deepEqual(countStates(data.items),{confirmado:4,'fora-de-contexto':1,'sem-prova':0,corrigido:2});
assert.equal(selectItems(data.items,{person:'Lula'}).length,2);
assert.equal(selectItems(data.items,{q:'FLAVIO'}).length,1);
assert.equal(selectItems(data.items,{person:'Jair Bolsonaro',category:'direitos',status:'corrigido'}).length,1);
assert.equal(selectItems(data.items,{status:'sem-prova'}).length,0);
assert.equal(selectItems(data.items,{q:'   '}).length,data.items.length);
assert.equal(escapeHTML('<script>"&'), '&lt;script&gt;&quot;&amp;');
assert.throws(()=>validateData({...data,items:[data.items[0],data.items[0]]}));
assert.throws(()=>validateData({...data,sources:{...data.sources,bad:{label:'x',kind:'x',published:'2026',url:'javascript:alert(1)'}}}));
for(const item of data.items){assert.ok(recordHTML(data,item).includes(`id="${item.id}"`));assert.ok(!/[\u2013\u2014]/.test(JSON.stringify(item)));}
console.log(`${data.items.length} fichas válidas; filtros, contagens, autoria, links seguros e escape verificados.`);
