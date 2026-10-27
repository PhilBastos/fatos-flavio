'use strict';
const STATES = {'confirmado':'Confirmado','fora-de-contexto':'Fora de contexto','sem-prova':'Sem prova','corrigido':'Corrigido'};
const SIDES = [{id:'bolsonaro-pl',name:'Bolsonaro / PL',people:'Jair Bolsonaro e Flávio Bolsonaro'},{id:'lula-pt',name:'Lula / PT',people:'Luiz Inácio Lula da Silva'}];
const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const normalize = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function selectItems(items, filters) {
  return items.filter(item => (!filters.category || item.category === filters.category) && (!filters.kind || item.kind === filters.kind) && (!filters.person || item.person === filters.person) && (!filters.status || item.status === filters.status) && (!filters.q || normalize([item.title,item.person,item.quote,item.context,item.check,item.counter,item.retractionDetail].join(' ')).includes(normalize(filters.q.trim()))));
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
  return data;
}
function sourceLink(data,id,label) {
  return `<a href="${escapeHTML(data.sources[id].url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(label || data.sources[id].label)} <span aria-hidden="true">↗</span><span class="sr-only"> (abre em nova aba)</span></a>`;
}
function recordHTML(data,item,prefix='') {
  const e=escapeHTML;
  return `<article class="record" id="${e(prefix+item.id)}" aria-labelledby="title-${e(prefix+item.id)}">
    <div class="meta"><span class="person">${e(item.person)}</span><span class="state" data-state="${e(item.status)}">${e(STATES[item.status])}</span></div>
    <span class="kind">${e(item.kind)}</span><p class="record-date">${e(item.dateLabel)} · ${e(item.partyAtTime)}</p><h4 id="title-${e(prefix+item.id)}"><a href="#${e(item.id)}">${e(item.title)}</a></h4>
    <blockquote><p>${item.quoteType==='Síntese documental'?e(item.quote):'“'+e(item.quote)+'”'}</p></blockquote><span class="quote-source">${e(item.quoteType || 'Transcrição curta')} via ${sourceLink(data,item.quoteSource)}</span>
    <p class="check"><span class="check-label">O que a checagem sustenta</span>${e(item.check)}</p>
    <div class="retraction"><span>Retratação ou correção</span><strong>${e(item.retraction)}</strong></div>
    <details><summary>Contexto, evolução e fontes</summary><div class="dossier"><h5>Contexto</h5><p>${e(item.context)}</p><h5>Contraditório e limites</h5><p>${e(item.counter)}</p><h5>Retratação</h5><p>${e(item.retractionDetail)}</p><h5>Nível de certeza</h5><p>${e(item.certainty)}</p><h5>Evolução documentada</h5><ol class="timeline">${item.timeline.map(event=>`<li><time datetime="${e(event.date)}">${e(event.date)}</time>${e(event.text)}<br>${sourceLink(data,event.source,'Consultar documento')}</li>`).join('')}</ol><h5>Fontes consultadas</h5><ol class="sources">${item.sources.map(id=>{const s=data.sources[id];return `<li>${sourceLink(data,id)}<span>${e(s.kind)} · Publicação: ${e(s.published)}</span>${s.note?`<p>${e(s.note)}</p>`:''}</li>`;}).join('')}</ol><p class="quote-source">Consulta desta edição: ${e(data.updated)}. As datas acima pertencem aos documentos e podem diferir da data da fala.</p><a class="share" href="#${e(item.id)}">Link direto para esta ficha ↗</a></div></details></article>`;
}
function itemLink(data,id) {
  const item=data.items.find(item=>item.id===id);
  return `<a href="#${escapeHTML(id)}">${escapeHTML(item.title)} ↗</a>`;
}
function renderMilitia(data) {
  const m=data.militiaDossier,e=escapeHTML;
  return `<div class="dossier-heading"><span class="eyebrow">Vínculos políticos e de gabinete</span><h2 id="milicias-titulo">${e(m.title)}</h2><p class="lead">${e(m.conclusion)}</p></div><div class="connection-map"><div class="connection-center">Flávio Bolsonaro<span>Deputado estadual nos episódios de 2005 e 2007</span></div><div class="connections">${m.links.map(link=>`<a class="connection" href="#${e(link.item)}"><strong>${e(link.label)}</strong><span>${e(link.detail)}</span><b aria-hidden="true">↗</b></a>`).join('')}</div><div class="connection-target"><strong>Adriano da Nóbrega</strong><span>Identificado pelo MPRJ como líder da milícia de Rio das Pedras</span>${sourceLink(data,'mprj','Documento do Ministério Público')}</div></div><details class="evidence-boundary" open><summary>O alcance dessa conclusão</summary><p>${e(m.boundary)}</p><a href="#flavio-rachadinha-processo">Ver denúncia, anulações e rejeição ↗</a><p class="source-inline">${m.sources.map(id=>sourceLink(data,id)).join(' · ')}</p></details>`;
}
function renderAnalysis(data) {
  const a=data.analysis,e=escapeHTML;
  return `<div class="analysis-heading"><span class="eyebrow">Análise política, fora da contagem</span><h2 id="fascismo-titulo">${e(a.title)}</h2><p>${e(a.intro)}</p></div><div class="criteria">${a.criteria.map((criterion,index)=>`<article><span class="criterion-index">CRITÉRIO ${index+1}</span><h3>${e(criterion.title)}</h3><p>${e(criterion.text)}</p><ul>${criterion.items.map(id=>`<li>${itemLink(data,id)}</li>`).join('')}</ul></article>`).join('')}</div><div class="analysis-reading"><p>${e(a.reading)}</p><p>${e(a.limits)}</p><div class="source-inline">${a.sources.map(id=>sourceLink(data,id)).join(' · ')}</div></div>`;
}
function renderIndicators(data,period='all') {
  const x=data.indicators,e=escapeHTML;
  const rows=x.series.filter(row=>period==='all'||(period==='bolsonaro'?row.year>=2019&&row.year<=2022:row.year>=2023));
  const max=Math.max(...x.series.map(row=>row.total));
  const government=year=>year<=2015?'Dilma':year===2016?'Dilma / Temer':year<=2018?'Temer':year<=2022?'Bolsonaro':'Lula';
  return `<div class="indicator-heading"><h3>${e(x.title)}</h3><p>${e(x.unit)}</p><div class="period-buttons" role="group" aria-label="Período dos indicadores">${[['all','2015 a 2024'],['bolsonaro','2019 a 2022'],['lula','2023 a 2024']].map(([value,label])=>`<button type="button" data-period="${value}" aria-pressed="${period===value}">${label}</button>`).join('')}</div></div><ol class="bars" aria-label="Notificações por ano, com escala comum de zero a 10.250">${rows.map(row=>`<li><span class="bar-year">${row.year}<small>${government(row.year)}</small></span><span class="bar-track" aria-hidden="true"><span style="width:${row.total/max*100}%"></span></span><strong>${row.total.toLocaleString('pt-BR')}</strong></li>`).join('')}</ol><p class="data-note">${e(x.note)} ${e(x.interpretation)}</p><p class="source-inline">${sourceLink(data,x.source)}</p><div class="indicator-extras"><article><span class="eyebrow">Outra base, outro indicador</span><h3>Mortes violentas LGBTI+</h3><p class="numeric-pair">${x.deaths.total0} <span>em ${x.deaths.year0} →</span> ${x.deaths.total1} <span>em ${x.deaths.year1}</span></p><p>${e(x.deaths.note)}</p>${sourceLink(data,x.deaths.source)}</article><article><span class="eyebrow">Questionamento sobre segurança</span><h3>Bahia e Brasil, ${x.bahia.year}</h3><p class="numeric-pair">40,9 <span>BA /</span> 20,1 <span>Brasil</span></p><p>${e(x.bahia.note)}</p>${sourceLink(data,x.bahia.source)}</article></div>`;
}
function renderQuestions(data) {
  const e=escapeHTML;
  return data.questions.map((q,index)=>`<details class="question" id="${e(q.id)}"><summary><span class="question-number">${String(index+1).padStart(2,'0')}</span><span>${e(q.title)}</span><b aria-hidden="true">+</b></summary><div class="question-body"><h3>O que a evidência sustenta</h3><p>${e(q.answer)}</p><h3>Até onde vai essa conclusão</h3><p>${e(q.limit)}</p>${q.items.length?`<ul>${q.items.map(id=>`<li>${itemLink(data,id)}</li>`).join('')}</ul>`:''}<div class="source-inline">${q.sources.map(id=>sourceLink(data,id)).join(' · ')}</div></div></details>`).join('');
}

async function start() {
  const records=document.querySelector('#records'),counts=document.querySelector('#counts'),form=document.querySelector('#filters'),result=document.querySelector('#result-count');
  try {
    const response=await fetch('dados.json?v=20261027-2');
    if (!response.ok) throw Error('Base indisponível');
    const data=validateData(await response.json());
    const categoryField=form.elements.category;
    categoryField.innerHTML='<option value="">Todas as categorias</option>'+data.categories.map(category=>`<option value="${escapeHTML(category.id)}">${escapeHTML(category.title)}</option>`).join('');
    const scoreCategory=document.querySelector('#score-category');
    scoreCategory.innerHTML=categoryField.innerHTML;
    document.querySelector('#militia-content').innerHTML=renderMilitia(data);
    document.querySelector('#analysis-content').innerHTML=renderAnalysis(data);
    const indicators=document.querySelector('#indicator-content');
    indicators.innerHTML=renderIndicators(data);
    indicators.addEventListener('click',event=>{const button=event.target.closest('button[data-period]');if(button)indicators.innerHTML=renderIndicators(data,button.dataset.period);});
    document.querySelector('#questions-content').innerHTML=renderQuestions(data);
    document.querySelector('#question-count').textContent=`${data.questions.length} perguntas examinadas`;
    function render() {
      const filters=Object.fromEntries(new FormData(form));
      const items=selectItems(data.items,filters);
      scoreCategory.value=filters.category;
      result.textContent=`${items.length} de ${data.items.length} registros`;
      counts.innerHTML=`<div class="score-top"><div class="team"><span class="team-label">Lado A</span><h3>Bolsonaro <span>/ PL</span></h3><p>Jair e Flávio, identificados em cada ficha</p></div><div class="versus" aria-hidden="true">×</div><div class="team"><span class="team-label">Lado B</span><h3>Lula <span>/ PT</span></h3><p>Luiz Inácio Lula da Silva</p></div></div><div class="score-rows">${Object.entries(STATES).map(([status,label])=>{const left=items.filter(item=>item.side==='bolsonaro-pl'&&item.status===status).length;const right=items.filter(item=>item.side==='lula-pt'&&item.status===status).length;return `<details class="score-detail"><summary aria-label="${escapeHTML(label)}: Bolsonaro e PL ${left}, Lula e PT ${right}. Expandir registros"><span class="score-row"><span class="score-cell"><strong>${left}</strong><span class="pips" aria-hidden="true">${'<i></i>'.repeat(left)}</span></span><span class="score-state">${escapeHTML(label)}<small>Ver registros <b aria-hidden="true">+</b></small></span><span class="score-cell"><strong>${right}</strong><span class="pips" aria-hidden="true">${'<i></i>'.repeat(right)}</span></span></span></summary><div class="score-evidence">${SIDES.map(side=>{const evidence=items.filter(item=>item.side===side.id&&item.status===status);return `<section aria-label="${escapeHTML(side.name)}: ${escapeHTML(label)}"><div class="side-title"><h4>${escapeHTML(side.name)}</h4></div>${evidence.length?evidence.map(item=>recordHTML(data,item,'placar-')).join(''):'<p class="side-empty">Nenhum registro neste estado para o recorte atual.</p>'}</section>`;}).join('')}</div></details>`;}).join('')}</div><div class="score-caption"><span>Registros deste lado: ${items.filter(item=>item.side==='bolsonaro-pl').length}</span><span>Registros deste lado: ${items.filter(item=>item.side==='lula-pt').length}</span></div>`;
      records.innerHTML=items.length?data.categories.map(category=>{const group=items.filter(item=>item.category===category.id);return group.length?`<details class="group" id="group-${escapeHTML(category.id)}"><summary class="group-head"><h3>${escapeHTML(category.title)}</h3><span>${group.length} REGISTROS <b aria-hidden="true">+</b></span></summary><div class="comparison">${SIDES.map(side=>{const sideItems=group.filter(item=>item.side===side.id);return `<section class="side" aria-label="${escapeHTML(side.name)}: ${escapeHTML(category.title)}"><div class="side-title"><h4>${escapeHTML(side.name)}</h4><span>${sideItems.length} REGISTROS</span></div><div class="side-records">${sideItems.length?sideItems.map(item=>recordHTML(data,item)).join(''):'<p class="side-empty">Nenhum registro neste lado para o recorte atual.</p>'}</div></section>`;}).join('')}</div></details>`:'';}).join(''):'<p class="empty">Nenhum registro corresponde a estes filtros. Use “Limpar filtros” para voltar ao arquivo completo.</p>';
    }
    scoreCategory.addEventListener('change',()=>{categoryField.value=scoreCategory.value;render();});
    form.addEventListener('submit',event=>event.preventDefault());
    form.addEventListener('input',render);
    form.addEventListener('reset',()=>setTimeout(render,0));
    function revealHash() {
      const id=location.hash.slice(1);
      if (!id) return;
      if (data.items.some(item=>item.id===id) && !document.getElementById(id)) { form.querySelectorAll('input,select').forEach(field => { field.value=''; }); render(); }
      const target=document.getElementById(id);
      if (!target) return;
      if (target.tagName==='DETAILS') target.open=true;
      let ancestor=target.parentElement;
      while(ancestor) { if(ancestor.tagName==='DETAILS') ancestor.open=true; ancestor=ancestor.parentElement; }
      if (target.classList.contains('record')) target.querySelector('details').open=true;
      target.scrollIntoView({block:'start'});
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
if (typeof module !== 'undefined') module.exports={selectItems,countStates,validateData,escapeHTML,recordHTML,renderMilitia,renderAnalysis,renderIndicators,renderQuestions};
