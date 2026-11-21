import {sum,rate,ageSets,exactSeries,queryCube,sourceForCube} from './births-model.js';
const $=id=>document.getElementById(id),f=(n,d=0)=>Number.isFinite(n)?n.toLocaleString('et-EE',{minimumFractionDigits:d,maximumFractionDigits:d}):'—';
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const plots=new Map(),cache=new Map();let exact,cube,cubeResult,cubeSequence=0;
const colors=['#087f8c','#db6b42','#6378bd','#9b5a83','#927326','#487857','#2771a5','#bf5366','#705b47','#51878e','#9677ad','#8f822a'];
window.births={plots};
function draw(id,options){if(!window.echarts)throw Error('Graafikute teek ei laadinud');let chart=plots.get(id);if(!chart){chart=echarts.init($(id),null,{renderer:'svg'});plots.set(id,chart);new ResizeObserver(()=>chart.resize()).observe($(id));}chart.setOption({animation:false,color:colors,textStyle:{fontFamily:'system-ui',fontSize:14,color:'#435469'},legend:{type:'scroll',top:0,left:0,right:0,textStyle:{fontSize:13}},grid:{left:62,right:18,top:82,bottom:55},tooltip:{trigger:'axis',confine:true,valueFormatter:n=>f(n,1)},...options},true);}
function xAxis(years){return {type:'category',data:years.map(String),axisLabel:{showMinLabel:true,showMaxLabel:true,hideOverlap:true,fontSize:13,interval:innerWidth<600?5:3}};}
function lines(years,groups,boundaries=[]){const segments=[-Infinity,...boundaries,Infinity],out=[];for(const [i,g] of groups.entries())for(let k=0;k<segments.length-1;k++)out.push({name:g.label,type:'line',showSymbol:true,symbolSize:4,connectNulls:false,lineStyle:{width:2.5,color:colors[i%colors.length]},itemStyle:{color:colors[i%colors.length]},data:years.map((y,j)=>y>=segments[k]&&y<segments[k+1]?g.values[j]:null),...(i===0&&k===0&&boundaries.length?{markLine:{silent:true,symbol:'none',label:{formatter:'{b}',fontSize:11,position:'insideEndTop'},lineStyle:{color:'#8794a1',type:'dashed'},data:boundaries.map(y=>({name:String(y),xAxis:String(y)}))}}:{})});return out;}
function csvDownload(rows,file){const text=rows.map(r=>r.map(v=>'"'+String(v??'').replaceAll('"','""')+'"').join(',')).join('\r\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\ufeff'+text],{type:'text/csv;charset=utf-8'}));a.download=file;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
function renderExact(){const p=+$('birth-parity').value,metric=$('birth-metric').value,year=+$('birth-year').value,rows=exactSeries(exact,p,metric),yr=exact.years.find(r=>r.year===year),base=exact.years.find(r=>r.year===2005),unit=metric==='count'?'Elussündinud lapsi':'Sünde 1000 naise kohta';
 $('birth-trend-title').textContent=`20–45-aastased · ${exact.parities[p]} · ${unit.toLowerCase()} · 1989–2025`;
 draw('birth-trend',{xAxis:xAxis(rows.map(r=>r.year)),yAxis:{type:'value',name:metric==='count'?'Lapsi':'Sünde / 1000',min:0},series:lines(rows.map(r=>r.year),[{label:exact.parities[p],values:rows.map(r=>r.value)}],metric==='rate'?[2016]:[])});
 const years=year===2005?[yr]:[base,yr];
 $('birth-profile-title').textContent=`Üksikvanused 20–45 · ${exact.parities[p]} · ${year===2005?'2005':`2005 ja ${year}`}`;
 draw('birth-profile',{xAxis:{type:'category',data:exact.ages,name:'Ema vanus',nameLocation:'middle',nameGap:30,axisLabel:{interval:innerWidth<600?4:1,showMaxLabel:true}},yAxis:{type:'value',name:metric==='count'?'Lapsi':'Sünde / 1000',min:0},series:years.map(r=>({name:String(r.year),type:'line',showSymbol:true,symbolSize:5,connectNulls:false,lineStyle:{width:3},data:r.births.map((a,i)=>metric==='count'?a[p]:rate(a[p],r.women[i]))}))});
 const value=rows.find(r=>r.year===year).value;
 $('exact-context').textContent=`${year} · täpselt 20–45-aastased · ${exact.parities[p]}: ${f(value,metric==='rate'?1:0)} ${unit.toLowerCase()}. `+(metric==='rate'?'Nimetaja on kõik selle vanuse naised, sõltumata nende laste arvust. 1989–1999 suhtarv puudub; 2016 tähistab rahvastiku arvestusmeetodi muutust.':'Vanus on lapse sünni hetkel; kaksikud loevad kahe lapsena.');
 window.births.exact=exact;window.births.exactRows=rows;
}
function options(el,items,value){el.innerHTML=items.map(x=>`<option value="${esc(x.value)}">${esc(x.label)}</option>`).join('');if(value!==undefined)el.value=value;}
function scope(){return $('cube-age').selectedOptions[0].textContent;}
function filters(){return Object.fromEntries([...document.querySelectorAll('[data-cube-filter]')].map(el=>[el.dataset.cubeFilter,+el.value]));}
function renderCube(){if(!cube)return;const comp=$('cube-compare').value,selected=filters(),age=$('cube-age').value;
 for(const el of document.querySelectorAll('[data-cube-filter]')){el.disabled=el.dataset.cubeFilter===comp;el.parentElement.classList.toggle('disabled',el.disabled);}
 const result=queryCube(cube,selected,age,comp),year=+$('cube-year').value;
 cubeResult=result;
 const filterText=cube.dimensions.filter(d=>d.key!=='Ema vanus'&&d.key!==comp).map(d=>`${d.key}: ${d.labels[selected[d.key]]}`).join(' · ');
 const context=`${cube.label} · ema vanus ${scope()}${filterText?' · '+filterText:''} · ${comp?'võrdlus: '+comp:'üks valitud rühm'}`;
 $('cube-context').textContent=context+'. '+(age==='20+'?'Sisaldab ka 46-aastaseid ja vanemaid; see pole täpne 20–45.':'See vanusevalik ei tähenda kogu 20–45 vahemikku.');
 $('cube-method').textContent=cube.notes+' Joonte eraldamine ei eemalda aastaväärtusi. Võrdlustunnuse filter on võrdlemise ajaks välja lülitatud.';
 $('cube-trend-title').textContent=`${cube.label} · ema vanus ${scope()} · ${result.years[0]}–${result.years.at(-1)}`;
 $('cube-bars-title').textContent=`${year} · ${cube.label} · ema vanus ${scope()}`;
 draw('cube-trend',{xAxis:xAxis(result.years),yAxis:{type:'value',name:'Lapsi',min:0},series:lines(result.years,result.groups,cube.boundaries)});
 const yi=result.years.indexOf(year),bars=result.groups.map(g=>({name:g.label,value:g.values[yi]})).sort((a,b)=>(b.value??-1)-(a.value??-1));
 const wrap=s=>s.length>23?s.match(/.{1,22}(?:\s|$)|.{1,22}/g).join('\n'):s;
 draw('cube-bars',{legend:{show:false},grid:{left:innerWidth<600?135:235,right:45,top:25,bottom:45},tooltip:{trigger:'axis',confine:true,valueFormatter:n=>f(n)},xAxis:{type:'value',name:'Lapsi',nameLocation:'middle',nameGap:28,axisLabel:{hideOverlap:true}},yAxis:{type:'category',inverse:true,data:bars.map(r=>r.name),axisLabel:{fontSize:12,formatter:wrap,width:innerWidth<600?120:215,overflow:'break'}},series:[{name:'Elussündinud',type:'bar',barMaxWidth:28,data:bars.map(r=>r.value),label:{show:true,position:'right',fontSize:12,formatter:p=>f(p.value)}}]});
 $('cube-table').innerHTML=`<table><caption>${esc(context)}</caption><thead><tr><th>Aasta</th><th>Allikas</th>${result.groups.map(g=>`<th>${esc(g.label)}</th>`).join('')}</tr></thead><tbody>${result.years.map((y,i)=>`<tr><th scope="row">${y}</th><td>${sourceForCube(cube,selected,comp,y)}</td>${result.groups.map(g=>`<td>${f(g.values[i])}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
 $('cube-json').href=`data/births/${cube.id}.json`;window.births.cube=cube;window.births.result=result;window.births.scope=age;window.births.context=context;
}
async function loadCube(){const token=++cubeSequence,id=$('cube-source').value;$('cube-status').hidden=false;$('cube-status').textContent='Laadin ristlõiget…';$('cube-csv').disabled=true;cube=null;
 try{if(!cache.has(id)){const r=await fetch(`data/births/${id}.json?v=1`);if(!r.ok)throw Error('Andmed: '+r.status);cache.set(id,await r.json());}if(token!==cubeSequence)return;cube=cache.get(id);
 const ages=cube.dimensions.find(d=>d.key==='Ema vanus').labels;
 const ageOptions=[{value:'20-39',label:'20–39 · täpselt eristatav'},...(ages.includes('40 ja vanemad')?[{value:'20+',label:'20+ · sisaldab ka 46+'}]:[]),...(ages.includes('40-44')?[{value:'20-44',label:'20–44 · ilma 45-aastasteta'}]:[]),...ages.filter(a=>/^(20-|25-|30-|35-|40)/.test(a)).map(a=>({value:a,label:a.replaceAll('-','–')}))];
 options($('cube-age'),ageOptions,'20-39');options($('cube-compare'),[{value:'',label:'Üks valitud rühm'},...cube.dimensions.filter(d=>d.key!=='Ema vanus').map(d=>({value:d.key,label:d.key}))],cube.compare);
 options($('cube-year'),[...new Set(cube.rows.map(r=>r[0]))].sort((a,b)=>b-a).map(y=>({value:y,label:y})),2025);
 $('cube-filters').innerHTML=cube.dimensions.filter(d=>d.key!=='Ema vanus').map(d=>`<label>${esc(d.key)}<select data-cube-filter="${esc(d.key)}">${d.labels.map((label,i)=>`<option value="${i}">${esc(label)}</option>`).join('')}</select></label>`).join('');
 for(const el of document.querySelectorAll('[data-cube-filter]'))el.addEventListener('change',renderCube);
 renderCube();$('cube-status').hidden=true;$('cube-csv').disabled=false;
 }catch(e){if(token!==cubeSequence)return;$('cube-status').textContent='Ristlõige ei laadinud: '+e.message;console.error(e);}
}
async function initExact(){try{const r=await fetch('data/births/exact.json?v=1');if(!r.ok)throw Error('Andmed: '+r.status);exact=await r.json();renderExact();$('birth-status').hidden=true;$('exact-csv').disabled=false;for(const id of ['birth-parity','birth-metric','birth-year'])$(id).addEventListener('change',renderExact);$('exact-csv').addEventListener('click',()=>csvDownload([['Aasta','Ema vanus','Sünnijärjekord','Mõõdik','Väärtus'],...window.births.exactRows.map(r=>[r.year,'20–45',exact.parities[+$('birth-parity').value],$('birth-metric').selectedOptions[0].textContent,r.value])],'sunnid-20-45-'+$('birth-metric').value+'.csv'));}catch(e){$('birth-status').textContent='Graafikud ei laadinud: '+e.message+'. Aastatabel on allpool alles.';console.error(e);}}
$('cube-source').addEventListener('change',loadCube);for(const id of ['cube-age','cube-compare','cube-year'])$(id).addEventListener('change',renderCube);
$('cube-csv').addEventListener('click',()=>{if(!cubeResult||!cube)return;csvDownload([['Vaade','Ema vanusevahemik','Filtrid','Aasta','Allikas',...cubeResult.groups.map(g=>g.label)],...cubeResult.years.map((y,i)=>[cube.label,scope(),window.births.context,y,sourceForCube(cube,filters(),$('cube-compare').value,y),...cubeResult.groups.map(g=>g.values[i])])],`sunnid-${cube.id}-${$('cube-age').value.replace('+','pluss')}.csv`);});
initExact();loadCube();
