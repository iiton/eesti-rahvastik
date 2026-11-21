// Pure functions shared by the website, build and data checks. Missing is never zero.
export const sum=xs=>xs.length&&xs.every(Number.isFinite)?xs.reduce((a,b)=>a+b,0):null;
export const rate=(n,d)=>Number.isFinite(n)&&Number.isFinite(d)&&d>0?n/d*1000:null;
export const ageSets={'20-39':['20-24','25-29','30-34','35-39'],'20+':['20-24','25-29','30-34','35-39','40 ja vanemad'],'20-44':['20-24','25-29','30-34','35-39','40-44']};
export function exactSeries(data,parity=0,metric='count'){
 return data.years.map(r=>({year:r.year,value:metric==='count'?sum(r.births.map(a=>a[parity])):rate(sum(r.births.map(a=>a[parity])),sum(r.women))}));
}
export function compareOptions(dim){return dim.labels.map((label,index)=>({label,index})).filter(x=>!['Kokku','Kogu Eesti','Vanuserühmad kokku'].includes(x.label)&&!x.label.startsWith('..'));}
export function queryCube(d,filters,age='20-39',compare=''){
 const ai=d.dimensions.findIndex(v=>v.key==='Ema vanus'),ad=d.dimensions[ai];
 const wanted=ageSets[age]??[age];
 if(wanted.some(a=>!ad.labels.includes(a)))throw Error('Vanusevalik ei ole selles allikas saadaval: '+age);
 const ages=wanted.map(a=>ad.labels.indexOf(a));
 const ci=d.dimensions.findIndex(v=>v.key===compare);
 const groups=ci<0?[{label:'Valitud rühm',index:-1}]:compareOptions(d.dimensions[ci]);
 const years=[...new Set(d.rows.map(r=>r[0]))].sort((a,b)=>a-b);
 const out=new Map();
 for(const r of d.rows){
  if(!ages.includes(r[ai+1]))continue;
  if(d.dimensions.some((v,i)=>i!==ai&&i!==ci&&r[i+1]!==Number(filters[v.key]??0)))continue;
  const g=ci<0?-1:r[ci+1];if(!groups.some(x=>x.index===g))continue;
  const key=r[0]+'|'+g,vs=out.get(key)??[];vs.push(r.at(-1));out.set(key,vs);
 }
 return {years,groups:groups.map(g=>({...g,values:years.map(y=>{const cells=out.get(y+'|'+g.index)??[];return cells.length===ages.length?sum(cells):null})}))};
}
export function sourceForCube(d,filters,compare,year){
 const county=d.dimensions.find(v=>v.key==='Maakond');
 if(d.nationalSources&&compare!=='Maakond'&&county?.labels[Number(filters.Maakond??0)]==='Kogu Eesti')return d.nationalSources[year<2017?0:1];
 return d.ids.length===2?d.ids[year<2017?0:1]:d.ids[0];
}
