'use strict';
const STATES = {'confirmado':'Confirmado','fora-de-contexto':'Fora de contexto','sem-prova':'Sem prova','corrigido':'Corrigido'};
const SIDES = [{id:'bolsonaro-pl',name:'Bolsonaro / PL',people:'Jair Bolsonaro e Flávio Bolsonaro'},{id:'lula-pt',name:'Lula / PT',people:'Luiz Inácio Lula da Silva'}];
const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
function validateData(data) {
  if (!Array.isArray(data.items) || !Array.isArray(data.categories) || !data.sources || !/^\d{4}-\d{2}-\d{2}$/.test(data.updated)) throw Error('Base inválida');
  const ids = new Set();
  for (const [id,source] of Object.entries(data.sources)) {
    if (!id || !['label','kind','published','url'].every(key => typeof source[key] === 'string' && source[key])) throw Error('Fonte incompleta');
    if (new URL(source.url).protocol !== 'https:') throw Error('Link de fonte inválido');
  }
  for (const item of data.items) {
    if (!/^[a-z0-9-]+$/.test(item.id) || ids.has(item.id)) throw Error('Identificador inválido ou repetido');
    ids.add(item.id);
    if (!SIDES.some(side=>side.id===item.side) || item.side !== (item.person === 'Lula' ? 'lula-pt' : 'bolsonaro-pl')) throw Error('Lado incompatível com a autoria');
    if (!['person','side','partyAtTime','kind','category','date','dateLabel','title','status','quote','quoteSource','context','check','counter','certainty','retraction','retractionDetail'].every(key => typeof item[key] === 'string' && item[key])) throw Error('Ficha incompleta');
    if (!['Declaração','Ato institucional','Vínculo político e de gabinete','Processo judicial'].includes(item.kind)) throw Error('Tipo de ocorrência inválido');
    if (!Object.hasOwn(STATES,item.status) || !['Lula','Jair Bolsonaro','Flávio Bolsonaro'].includes(item.person) || !data.categories.some(category => category.id === item.category)) throw Error('Classificação inválida');
    if (!['Documentada','Não localizada','Não se aplica'].includes(item.retraction) || !Array.isArray(item.sources) || !item.sources.includes(item.quoteSource) || !item.sources.every(id => data.sources[id])) throw Error('Evidência incompleta');
    if (!Array.isArray(item.timeline) || !item.timeline.every(event => typeof event.text === 'string' && /^\d{4}(-\d{2})?(-\d{2})?$/.test(event.date) && item.sources.includes(event.source))) throw Error('Cronologia inválida');
    if (item.status === 'corrigido' && item.retraction !== 'Documentada') throw Error('Correção sem retratação documentada');
  }
  const hasSources=ids=>Array.isArray(ids)&&ids.length>0&&ids.every(id=>Object.hasOwn(data.sources,id));
  const hasItems=keys=>Array.isArray(keys)&&keys.every(id=>ids.has(id));
  if(!data.militiaDossier || !hasSources(data.militiaDossier.sources) || !data.militiaDossier.links.every(link=>ids.has(link.item))) throw Error('Dossiê incompleto');
  if(!data.analysis || !hasSources(data.analysis.sources) || !data.analysis.criteria.every(criterion=>hasItems(criterion.items))) throw Error('Análise incompleta');
  if(!Array.isArray(data.questions) || !data.questions.every(q=>/^q-[a-z0-9-]+$/.test(q.id)&&!ids.has(q.id)&&hasSources(q.sources)&&hasItems(q.items)&&['title','answer','limit'].every(key=>typeof q[key]==='string'&&q[key]))) throw Error('Perguntas inválidas');
  for(const question of data.questions) { if(ids.has(question.id)) throw Error('Pergunta repetida');ids.add(question.id); }
  if(!data.indicators || !hasSources([data.indicators.source,data.indicators.deaths.source,data.indicators.bahia.source]) || !Array.isArray(data.indicators.series) || !data.indicators.series.length || !data.indicators.series.every(row=>Number.isInteger(row.year)&&row.year>=1900&&Number.isInteger(row.total)&&row.total>=0)) throw Error('Indicadores inválidos');
  if(new Set(data.indicators.series.map(row=>row.year)).size!==data.indicators.series.length || data.indicators.series.some((row,index,rows)=>index&&row.year<=rows[index-1].year)) throw Error('Série fora de ordem');
  if(!Array.isArray(data.topics) || !data.topics.length) throw Error('Temas ausentes');
  const topicItems=[], topicQuestions=[], topicIds=new Set();
  for(const topic of data.topics) {
    if(!/^[a-z0-9-]+$/.test(topic.id) || ids.has(topic.id) || topicIds.has(topic.id) || !topic.title || !Array.isArray(topic.summaries) || topic.summaries.length!==2 || !topic.summaries.every(s=>typeof s==='string'&&s) || !hasItems(topic.items) || !Array.isArray(topic.questions) || !topic.questions.every(id=>data.questions.some(q=>q.id===id))) throw Error('Tema inválido');
    topicIds.add(topic.id);topicItems.push(...topic.items);topicQuestions.push(...topic.questions);
  }
  if(topicItems.length!==data.items.length || new Set(topicItems).size!==data.items.length || topicItems.some(id=>!data.items.some(item=>item.id===id))) throw Error('Registros ausentes ou repetidos nos temas');
  if(topicQuestions.length!==data.questions.length || new Set(topicQuestions).size!==data.questions.length) throw Error('Perguntas ausentes ou repetidas nos temas');
  return data;
}
function sourceLink(data,id,label) {
  return `<a href="${escapeHTML(data.sources[id].url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(label || data.sources[id].label)} <span aria-hidden="true">↗</span><span class="sr-only"> (abre em nova aba)</span></a>`;
}

function links(data,ids) { return ids.map(id=>sourceLink(data,id)).join(' · '); }
function itemLink(data,id) {return `<a href="#${escapeHTML(id)}">${escapeHTML(data.items.find(item=>item.id===id).title)} ↗</a>`;}
function recordHTML(data,item) {
  const e=escapeHTML;
  return `<details class="record" id="${e(item.id)}"><summary><span class="record-meta">${e(item.person)} · ${e(item.dateLabel)}</span><span class="record-title">${e(item.title)}</span><span class="state" data-state="${e(item.status)}">${e(STATES[item.status])}</span><span class="record-toggle" aria-hidden="true">+</span></summary><div class="record-body"><p class="small">${e(item.kind)} · ${e(item.partyAtTime)}</p><blockquote>${item.quoteType==='Síntese documental'?e(item.quote):'“'+e(item.quote)+'”'}</blockquote><p class="small">${e(item.quoteType||'Transcrição curta')} via ${sourceLink(data,item.quoteSource)}</p><h4>O que está documentado</h4><p>${e(item.check)}</p><h4>Retratação: ${e(item.retraction)}</h4><p>${e(item.retractionDetail)}</p><h4>Contexto</h4><p>${e(item.context)}</p><h4>Contraditório e certeza</h4><p>${e(item.counter)}</p><p>${e(item.certainty)}</p><h4>Evolução documentada</h4><ol class="timeline">${item.timeline.map(event=>`<li><time>${e(event.date)}</time> ${e(event.text)} ${sourceLink(data,event.source,'Fonte')}</li>`).join('')}</ol><h4>Fontes</h4><ul class="sources">${item.sources.map(id=>{const s=data.sources[id];return `<li>${sourceLink(data,id)}<small>${e(s.kind)} · ${e(s.published)}</small>${s.note?`<p>${e(s.note)}</p>`:''}</li>`;}).join('')}</ul><a class="small" href="#${e(item.id)}">Link para este registro ↗</a></div></details>`;
}
function questionHTML(data,q) {
 const e=escapeHTML;
 return `<details class="question" id="${e(q.id)}"><summary>${e(q.title)}<span aria-hidden="true">+</span></summary><div class="question-body"><p>${e(q.answer)}</p><p class="small">${e(q.limit)}</p>${q.items.length?`<ul>${q.items.map(id=>`<li>${itemLink(data,id)}</li>`).join('')}</ul>`:''}<p class="source-links">${links(data,q.sources)}</p></div></details>`;
}
function renderAnalysis(data) {
 const a=data.analysis,e=escapeHTML;
 return `<details class="question" id="fascismo"><summary>${e(a.title)}<span aria-hidden="true">+</span></summary><div class="question-body"><p>${e(a.intro)}</p>${a.criteria.map(c=>`<h4>${e(c.title)}</h4><p>${e(c.text)}</p><ul>${c.items.map(id=>`<li>${itemLink(data,id)}</li>`).join('')}</ul>`).join('')}<p>${e(a.reading)}</p><p class="small">${e(a.limits)}</p><p class="source-links">${links(data,a.sources)}</p></div></details>`;
}
function renderTopics(data) {
 const e=escapeHTML;
 return data.topics.map((topic,index)=>{
 const group=data.items.filter(item=>topic.items.includes(item.id));
 const extras=topic.id==='milicias'?`<aside class="context-note"><h3>O que os vínculos demonstram</h3><p>${e(data.militiaDossier.conclusion)}</p><p class="small">${e(data.militiaDossier.boundary)}</p></aside>`:'';
 return `<details class="topic" id="${e(topic.id)}"><summary><span class="topic-title"><span>${String(index+1).padStart(2,'0')}</span>${e(topic.title)}</span><span class="comparison-overview">${SIDES.map((side,i)=>`<span class="overview-side"><span class="sr-only">${e(side.name)}: </span><span class="overview-text">${e(topic.summaries[i])}</span><span class="record-count">${group.filter(item=>item.side===side.id).length} registros no arquivo</span></span>`).join('')}</span><span class="topic-action"><span class="closed-label">Abrir fatos e fontes</span><span class="open-label">Fechar comparação</span><b aria-hidden="true">+</b></span></summary><div class="topic-content"><div class="evidence-columns">${SIDES.map(side=>`<section aria-label="${e(side.name)}: ${e(topic.title)}"><h3 class="evidence-team">${e(side.name)}</h3>${group.filter(item=>item.side===side.id).map(item=>recordHTML(data,item)).join('')||'<p class="small no-records">Sem registro correspondente neste recorte.</p>'}</section>`).join('')}</div>${extras}<div class="questions"><h3>Questionamentos deste tema</h3>${topic.questions.map(id=>questionHTML(data,data.questions.find(q=>q.id===id))).join('')}${topic.id==='instituicoes'?renderAnalysis(data):''}</div></div></details>`;
 }).join('');
}
async function start() {
 const target=document.querySelector('#topics');
 try {
  const response=await fetch('dados.json?v=20261027-3');
  if(!response.ok) throw Error('Base indisponível');
  const data=validateData(await response.json());
  target.innerHTML=renderTopics(data);
  document.querySelector('#edition').textContent=`${data.items.length} registros · Atualizado em ${data.updated.split('-').reverse().join('/')}`;
  function revealHash() {
   const id=decodeURIComponent(location.hash.slice(1)), el=document.getElementById(id==='violencia'?'q-lgbt-violencia':id);
   if(!id||!el)return;
   let node=el;while(node){if(node.tagName==='DETAILS')node.open=true;node=node.parentElement;}
   el.scrollIntoView({block:'start'});
  }
  revealHash();window.addEventListener('hashchange',revealHash);
 } catch(error) {
  target.innerHTML='<p role="alert">Não foi possível carregar a comparação. Recarregue a página ou <a href="dados.json">consulte os dados</a>.</p>';
  console.error(error);
 }
}
if(typeof document!=='undefined') start();
if(typeof module!=='undefined') module.exports={validateData,escapeHTML,recordHTML,renderTopics,renderAnalysis};
