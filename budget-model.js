import {benefits,personalAllowance,childDeduction,spouseDeduction,carTax,motorNet} from './policy-model.js';
export const profiles=[{id:'single1',name:'Üksi · 1 keskmine palk',short:'Üksi, 1×',people:1,salaries:[1],family:false},{id:'single2',name:'Üksi · 2 keskmist palka',short:'Üksi, 2×',people:1,salaries:[2],family:false},{id:'family1',name:'Pere · 1 teenija, kokku 2 keskmist',short:'Pere, 1 teenija',people:5,salaries:[2,0],family:true},{id:'family2',name:'Pere · 2 teenijat, kokku 2 keskmist',short:'Pere, 2 teenijat',people:5,salaries:[1,1],family:true}];
export const defaults={singleArea:45,familyArea:90,downpayment:20,term:30,housing:'new',wageSeries:'published',electricSingle:1500,electricFamily:4500,waterPerson:3,hotPerson:1.2,heatArea:100,heatPrice2025:100,waterPrice2025:2.52,maintenance2018:.8,km:15000,litres:7,carValue2018:22000,depreciation:10,carService2018:900,carInsurance2018:600,carTyres2018:180,carReserve:true};
export function annuity(principal,percent,months){if(principal===0)return 0;const r=percent/1200;return r===0?principal/months:principal*r/(1-(1+r)**-months);}
export function loan(principal,percent,years){const payment=annuity(principal,percent,years*12),rate=percent/1200;let balance=principal,interest=0;for(let m=0;m<12;m++){const i=balance*rate;interest+=i;balance-=payment-i;}return{payment,interestAnnual:interest,principalMonthly:(principal-balance)/12};}
export function income(profile,year,wage,interestAnnual=0){
 if(year===2015){
  const gross=profile.salaries.map(k=>k*wage*12),sum=gross.reduce((s,g)=>s+g,0),bases=gross.map(g=>Math.max(0,g*.964-1848));
  const netSalary=(sum*.964-bases.reduce((s,v)=>s+v,0)*.2)/12;
  let remaining=bases.reduce((s,v)=>s+v,0);
  const spouseD=profile.family?Math.min(remaining,gross.reduce((s,g)=>s+Math.max(0,1848-g*.964),0)):0;remaining-=spouseD;
  const childD=profile.family?Math.min(remaining,1848*2):0;remaining-=childD;
  const interestD=Math.min(interestAnnual,1920*(profile.family?2:1),sum*.5,remaining);
  const spouseSaving=spouseD*.2/12,childSaving=childD*.2/12,interestSaving=interestD*.2/12,taxRefund=spouseSaving+childSaving+interestSaving,childBenefit=profile.family?190:0;
  return{gross:sum/12,netSalary,netAfterDeclaration:netSalary+taxRefund,childBenefit,largeBenefit:0,benefit:childBenefit,interestSaving,spouseSaving,childSaving,taxRefund,total:netSalary+childBenefit+taxRefund};
 }

 const rate=year>=2025?.22:.2;const gross=profile.salaries.map(k=>k*wage*12);const bases=gross.map(g=>Math.max(0,g*.964-personalAllowance(g,year)));const netSalary=gross.reduce((s,g,i)=>s+g*.964-bases[i]*rate,0)/12;
 const rem=[...bases];let interestSaving=0,spouseSaving=0,childSaving=0;
 if(year<2024){const earners=gross.filter(g=>g>0).length;for(let i=0;i<gross.length;i++){if(gross[i]===0)continue;const d=Math.min(300,interestAnnual/earners,gross[i]*.5,rem[i]);rem[i]-=d;interestSaving+=d*rate/12;}
 if(profile.family&&earners===1){const i=gross.findIndex(g=>g>0);const d=Math.min(spouseDeduction(gross.reduce((s,v)=>s+v,0)),rem[i]);rem[i]-=d;spouseSaving=d*rate/12;}
 const d=Math.min(childDeduction(profile.family?3:0,year),Math.max(...rem));childSaving=d*rate/12;
 }
 const b=benefits(profile.family?3:0,year);const taxRefund=interestSaving+spouseSaving+childSaving;return{gross:gross.reduce((s,v)=>s+v,0)/12,netSalary,netAfterDeclaration:netSalary+taxRefund,childBenefit:b.child,largeBenefit:b.large,benefit:b.total,interestSaving,spouseSaving,childSaving,taxRefund,total:netSalary+b.total+taxRefund};
}
export function calculate(D,options={}){
 const o={...defaults,...options};for(const k of Object.keys(defaults)){if(typeof defaults[k]==='number'&&(!Number.isFinite(o[k])||o[k]<0))throw Error('Vigane sisend: '+k);}if(o.hotPerson>o.waterPerson)throw Error('Sooja vee kogus ei saa ületada kogu veekulu.');if(o.downpayment>100||o.term<1||o.depreciation>100)throw Error('Kontrolli laenu ja amortisatsiooni eeldusi.');
 const base=D.annual.find(r=>r.year===2018),last=D.annual.find(r=>r.year===2025);const years=[...D.annual,{...last,year:2026,wage:D.scenario2026.wage,wageLinked:D.scenario2026.wage*1685/1645,scenario:true}];
 const rows=[];
 for(const r of years){const year=r.year;const wage=o.wageSeries==='linked'?r.wageLinked:r.wage;
 const heatPrice=o.heatPrice2025*r.indices.CP0455/last.indices.CP0455;
 const waterPrice=o.waterPrice2025*(r.indices.CP0441/last.indices.CP0441+r.indices.CP0443/last.indices.CP0443)/2;
 for(const p of profiles){const area=p.family?o.familyArea:o.singleArea,priceM2=r.prices[p.family?'70-249,99':'41-54,99'],homePrice=area*priceM2;
 const mortgage=o.housing==='new'?loan(homePrice*(1-o.downpayment/100),r.mortgageRate,o.term):{payment:0,interestAnnual:0,principalMonthly:0};
 const waterM3=p.people*o.waterPerson*12,hotM3=p.people*o.hotPerson*12;
 const electricityKwh=p.family?o.electricFamily:o.electricSingle;
 // The UI keeps quantities within the published bands used here.
 const band=electricityKwh<2500?'KWH1000-2499':electricityKwh<5000?'KWH2500-4999':'KWH5000-14999';
 const utilities={electricity:electricityKwh*r.electricity[band]/12,water:waterM3*waterPrice/12,hotWater:hotM3*58*heatPrice/1000/12,spaceHeat:area*o.heatArea*heatPrice/1000/12,upkeep:area*o.maintenance2018*r.indices.CP0444/base.indices.CP0444};
 const utilityTotal=Object.values(utilities).reduce((s,v)=>s+v,0);const housing=mortgage.payment+utilityTotal;
 const age=year-2015,tax=year>=2025?carTax({co2:136*1.21,mass:2410,age}):{annual:0,registration:0};
 const auto={fuel:0,service:0,insurance:0,tyres:0,depreciation:0,tax:0};
 if(p.family){Object.assign(auto,{fuel:o.km*o.litres/100*r.diesel/12,service:o.carService2018*r.indices.CP0723/base.indices.CP0723*(1+.05*(year-2018))/12,insurance:o.carInsurance2018*r.indices.CP12541/base.indices.CP12541/12,tyres:o.carTyres2018*r.indices.CP07211/base.indices.CP07211/12,depreciation:o.carReserve?o.carValue2018*(1-o.depreciation/100)**(year-2018)*o.depreciation/100/12:0,tax:motorNet(tax.annual,3)/12});}
 const car=Object.values(auto).reduce((s,v)=>s+v,0),pay=income(p,year,wage,mortgage.interestAnnual),balance=pay.total-housing-car;
 rows.push({year,scenario:!!r.scenario,id:p.id,name:p.name,people:p.people,wage,...pay,area,homePrice,downpayment:o.housing==='new'?homePrice*o.downpayment/100:0,mortgage:mortgage.payment,mortgageInterest:mortgage.interestAnnual/12,mortgagePrincipal:mortgage.principalMonthly,utilities,utilityTotal,housing,auto,car,carOperating:car-auto.depreciation,carGrossTax:p.family?tax.annual:0,registrationIfBought:p.family?tax.registration:0,balance,perPerson:balance/p.people,realBalance:balance*last.cpi/r.cpi,realPerPerson:balance/p.people*last.cpi/r.cpi,heatPrice,waterPrice,electricityPrice:r.electricity[band],electricityKwh,waterM3,hotM3});
 }
 }
 return rows;
}
export const columns=[['year','Aasta'],['name','Leibkond'],['scenario','2026 stsenaarium (true/false)'],['gross','Brutopalk'],['netSalary','Netopalk enne aastadeklaratsiooni'],['taxRefund','Maksutagastus / 12 (sisaldub netotulus)'],['netAfterDeclaration','Netotulu pärast aastadeklaratsiooni, enne toetusi'],['benefit','Peretoetused'],['total','Tulu kokku'],['mortgage','Laenumakse'],['utilityTotal','Kommunaalid ja korrashoid'],['housing','Eluase kokku'],['car','Auto (kulum vastavalt valikule)'],['balance','Jääk pärast eluaset ja autot'],['perPerson','Jääk inimese kohta']];
export function csv(rows){return '\ufeff'+[columns.map(c=>c[1]).join(';'),...rows.map(r=>columns.map(([k])=>typeof r[k]==='number'?r[k].toFixed(k==='year'?0:2).replace('.',','):'"'+String(r[k]).replaceAll('"','""')+'"').join(';'))].join('\r\n');}
