'use strict';
const STATES = {'confirmado':'Confirmado','fora-de-contexto':'Fora de contexto','sem-prova':'Sem prova','corrigido':'Corrigido'};
const SIDES = [{id:'bolsonaro-pl',name:'Bolsonaro / PL',people:'Jair Bolsonaro e Flávio Bolsonaro'},{id:'lula-pt',name:'Lula / PT',people:'Luiz Inácio Lula da Silva'}];
const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const normalize = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function selectItems(items, filters) {
  return items.filter(item => (!filters.category || item.category === filters.category) && (!filters.person || item.person === filters.person) && (!filters.status || item.status === filters.status) && (!filters.q || normalize([item.title,item.person,item.quote,item.context,item.check,item.counter,item.retractionDetail].join(' ')).includes(normalize(filters.q.trim()))));
}
function countStates(items) {
  return Object.fromEntries(Object.keys(STATES).map(status => [status,items.filter(item => item.status === status).length]));
}
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
    if (!['person','side','partyAtTime','category','date','dateLabel','title','status','quote','quoteSource','context','check','counter','certainty','retraction','retractionDetail'].every(key => typeof item[key] === 'string' && item[key])) throw Error('Ficha incompleta');
    if (!Object.hasOwn(STATES,item.status) || !['Lula','Jair Bolsonaro','Flávio Bolsonaro'].includes(item.person) || !data.categories.some(category => category.id === item.category)) throw Error('Classificação inválida');
    if (!['Documentada','Não localizada'].includes(item.retraction) || !Array.isArray(item.sources) || !item.sources.includes(item.quoteSource) || !item.sources.every(id => data.sources[id])) throw Error('Evidência incompleta');
    if (!Array.isArray(item.timeline) || !item.timeline.every(event => typeof event.text === 'string' && /^\d{4}(-\d{2})?(-\d{2})?$/.test(event.date) && item.sources.includes(event.source))) throw Error('Cronologia inválida');
    if (item.status === 'corrigido' && item.retraction !== 'Documentada') throw Error('Correção sem retratação documentada');
  }
  return data;
}
function sourceLink(data,id,label) {
  return `<a href="${escapeHTML(data.sources[id].url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(label || data.sources[id].label)} <span aria-hidden="true">↗</span><span class="sr-only"> (abre em nova aba)</span></a>`;
}
function recordHTML(data,item,prefix='') {
  const e=escapeHTML;
  return `<article class="record" id="${e(prefix+item.id)}" aria-labelledby="title-${e(prefix+item.id)}">
    <div class="meta"><span class="person">${e(item.person)}</span><span class="state" data-state="${e(item.status)}">${e(STATES[item.status])}</span></div>
    <p class="record-date">${e(item.dateLabel)} · ${e(item.partyAtTime)}</p><h4 id="title-${e(prefix+item.id)}"><a href="#${e(item.id)}">${e(item.title)}</a></h4>
    <blockquote><p>“${e(item.quote)}”</p></blockquote><span class="quote-source">Transcrição curta via ${sourceLink(data,item.quoteSource)}</span>
    <p class="check"><span class="check-label">O que a checagem sustenta</span>${e(item.check)}</p>
    <div class="retraction"><span>Retratação específica</span><strong>${e(item.retraction)}</strong></div>
    <details><summary>Contexto, evolução e fontes</summary><div class="dossier"><h5>Contexto</h5><p>${e(item.context)}</p><h5>Contraditório e limites</h5><p>${e(item.counter)}</p><h5>Retratação</h5><p>${e(item.retractionDetail)}</p><h5>Nível de certeza</h5><p>${e(item.certainty)}</p><h5>Evolução documentada</h5><ol class="timeline">${item.timeline.map(event=>`<li><time datetime="${e(event.date)}">${e(event.date)}</time>${e(event.text)}<br>${sourceLink(data,event.source,'Consultar documento')}</li>`).join('')}</ol><h5>Fontes consultadas</h5><ol class="sources">${item.sources.map(id=>{const s=data.sources[id];return `<li>${sourceLink(data,id)}<span>${e(s.kind)} · Publicação: ${e(s.published)}</span>${s.note?`<p>${e(s.note)}</p>`:''}</li>`;}).join('')}</ol><p class="quote-source">Consulta desta edição: ${e(data.updated)}. As datas acima pertencem aos documentos e podem diferir da data da fala.</p><a class="share" href="#${e(item.id)}">Link direto para esta ficha ↗</a></div></details></article>`;
}
async function start() {
  const records=document.querySelector('#records'),counts=document.querySelector('#counts'),form=document.querySelector('#filters'),result=document.querySelector('#result-count');
  try {
    const response=await fetch('dados.json');
    if (!response.ok) throw Error('Base indisponível');
    const data=validateData(await response.json());
    function render() {
      const filters=Object.fromEntries(new FormData(form));
      const items=selectItems(data.items,filters);
      result.textContent=`${items.length} de ${data.items.length} registros`;
      counts.innerHTML=`<div class="score-top"><div class="team"><span class="team-label">Lado A</span><h3>Bolsonaro <span>/ PL</span></h3><p>Jair e Flávio, identificados em cada ficha</p></div><div class="versus" aria-hidden="true">×</div><div class="team"><span class="team-label">Lado B</span><h3>Lula <span>/ PT</span></h3><p>Luiz Inácio Lula da Silva</p></div></div><div class="score-rows">${Object.entries(STATES).map(([status,label])=>{const left=items.filter(item=>item.side==='bolsonaro-pl'&&item.status===status).length;const right=items.filter(item=>item.side==='lula-pt'&&item.status===status).length;return `<details class="score-detail"><summary aria-label="${escapeHTML(label)}: Bolsonaro e PL ${left}, Lula e PT ${right}. Expandir registros"><span class="score-row"><span class="score-cell"><strong>${left}</strong><span class="pips" aria-hidden="true">${'<i></i>'.repeat(left)}</span></span><span class="score-state">${escapeHTML(label)}<small>Ver registros <b aria-hidden="true">+</b></small></span><span class="score-cell"><strong>${right}</strong><span class="pips" aria-hidden="true">${'<i></i>'.repeat(right)}</span></span></span></summary><div class="score-evidence">${SIDES.map(side=>{const evidence=items.filter(item=>item.side===side.id&&item.status===status);return `<section aria-label="${escapeHTML(side.name)}: ${escapeHTML(label)}"><div class="side-title"><h4>${escapeHTML(side.name)}</h4></div>${evidence.length?evidence.map(item=>recordHTML(data,item,'placar-')).join(''):'<p class="side-empty">Nenhum registro neste estado para o recorte atual.</p>'}</section>`;}).join('')}</div></details>`;}).join('')}</div><div class="score-caption"><span>Registros deste lado: ${items.filter(item=>item.side==='bolsonaro-pl').length}</span><span>Registros deste lado: ${items.filter(item=>item.side==='lula-pt').length}</span></div>`;
      records.innerHTML=items.length?data.categories.map(category=>{const group=items.filter(item=>item.category===category.id);return group.length?`<section class="group" aria-labelledby="group-${escapeHTML(category.id)}"><div class="group-head"><h3 id="group-${escapeHTML(category.id)}">${escapeHTML(category.title)}</h3><span>${group.length} REGISTROS</span></div><div class="comparison">${SIDES.map(side=>{const sideItems=group.filter(item=>item.side===side.id);return `<section class="side" aria-label="${escapeHTML(side.name)}: ${escapeHTML(category.title)}"><div class="side-title"><h4>${escapeHTML(side.name)}</h4><span>${sideItems.length} REGISTROS</span></div><div class="side-records">${sideItems.length?sideItems.map(item=>recordHTML(data,item)).join(''):'<p class="side-empty">Nenhum registro neste lado para o recorte atual.</p>'}</div></section>`;}).join('')}</div></section>`:'';}).join(''):'<p class="empty">Nenhum registro corresponde a estes filtros. Use “Limpar filtros” para voltar ao arquivo completo.</p>';
    }
    form.addEventListener('submit',event=>event.preventDefault());
    form.addEventListener('input',render);
    form.addEventListener('reset',()=>setTimeout(render,0));
    function revealHash() {
      const id=location.hash.slice(1);
      if (!data.items.some(item=>item.id===id)) return;
      if (!document.getElementById(id)) { form.querySelectorAll('input,select').forEach(field => { field.value=''; }); render(); }
      const article=document.getElementById(id);
      article.querySelector('details').open=true;
      article.scrollIntoView({block:'start'});
    }
    render();revealHash();window.addEventListener('hashchange',revealHash);
  } catch(error) {
    records.innerHTML='<p class="empty" role="alert">Não foi possível carregar os registros. Recarregue a página ou <a href="dados.json">consulte o arquivo de dados</a>.</p>';
    counts.textContent='Contagens indisponíveis.';
    result.textContent='Falha ao carregar';
    console.error(error);
  }
}
if (typeof document !== 'undefined') start();
if (typeof module !== 'undefined') module.exports={selectItems,countStates,validateData,escapeHTML,recordHTML};
