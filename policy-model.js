const positive=(n)=>{if(!Number.isFinite(n)||n<0)throw Error('Invalid nonnegative value');return n;};
const count=n=>{if(!Number.isInteger(n)||n<0||n>20)throw Error('Invalid child count');return n;};
export const years=Array.from({length:9},(_,i)=>2018+i);
export function benefits(children,year){count(children);if(!years.includes(year))throw Error('Unsupported year');const child=Math.min(children,2)*(year===2018?55:year<2023?60:80)+Math.max(0,children-2)*100;const large=children<3?0:year<2023?(children<7?300:400):year===2023?(children<7?650:850):(children<7?450:650);return{child,large,total:child+large};}
export function childDeduction(children,year){count(children);return year>=2024||children<2?0:1848+Math.max(0,children-2)*(year<2020?1848:3048);}
export function deductionLoss(children){return childDeduction(children,2023)*.2;}
export function personalAllowance(gross,year){positive(gross);if(!years.includes(year))throw Error('Unsupported year');return year>=2026?8400:Math.max(0,(year>=2023?7848:6000)*(1-Math.max(0,gross-14400)/10800));}
export function spouseDeduction(gross,spouseIncome=0){return Math.max(0,Math.min(2160-positive(spouseIncome),50400-positive(gross)-spouseIncome));}
export function energySupport(kwh,price,scheme){positive(kwh);positive(price);if(scheme==='2022')return Math.min(kwh,650)*Math.max(0,price-.12);if(scheme==='2023')return kwh*Math.min(.05,Math.max(0,price-.08));throw Error('Unknown scheme');}
export function motorNet(gross,children){return Math.max(0,positive(gross)-100*count(children));}
export function carTax({co2=180,mass=2600,age=8}={}){positive(co2);positive(mass);positive(age);const y=Math.floor(age),factor=y<5?1:y>=20?0:y>=15?.1:[.92,.84,.75,.67,.59,.51,.43,.35,.26,.18][y-5];const band=(v,start,end)=>Math.max(0,Math.min(v,end)-start);const annual=50+factor*(band(co2,117,150)*3+band(co2,150,200)*3.5+Math.max(0,co2-200)*4+Math.min(400,Math.max(0,mass-2000)*.4));const regFactor=[1,.87,.75,.65,.56,.48,.42,.36,.31,.26,.22,.19,.16,.14,.12,.10,.09,.08,.07,.06,.05][Math.min(20,y)];const registration=150+regFactor*(Math.min(co2,117)*5+band(co2,117,150)*10+band(co2,150,200)*30+Math.max(0,co2-200)*50+Math.min(2000,Math.max(0,mass-2000)*2));return{annual:Math.round(annual*100)/100,registration:Math.round(registration*100)/100,factor,regFactor};}
export function lostHomeInsurance(ages){return ages.length>=3&&ages.filter(a=>a<16).length>=3&&Math.min(...ages)>=8&&ages.length<7;}
export const profiles=[
{id:'single',name:'Üksi linnas elav naine',adults:1,salaries:[2400],ages:[],basket:600,housing:650,other:80,interest:2400,car:false,health:false},
{id:'two',name:'3 last, kaks teenijat',adults:2,salaries:[2400,1800],ages:[8,11,14],basket:1450,housing:1050,other:150,interest:4800,car:true,health:false},
{id:'one',name:'3 last, üks teenija',adults:2,salaries:[3500,0],ages:[8,11,14],basket:1450,housing:1050,other:150,interest:4800,car:true,health:true}
];
// Static households at each year's end-of-year rules, never a longitudinal family.
export function household(p,year){if(!years.includes(year))throw Error('Unsupported year');const rate=year>=2025?.22:.20;const salaries=p.salaries.map(positive),gross=salaries.reduce((a,b)=>a+b,0),children=count(p.ages.length);const bases=salaries.map(s=>Math.max(0,s*12*.964-personalAllowance(s*12,year)));const ordinaryTax=bases.reduce((a,b)=>a+b,0)*rate/12;
const remaining=[...bases];let interestSaving=0;if(year<2024){for(let i=0;i<salaries.length;i++){const eligible=Math.min(300,p.interest/salaries.length,salaries[i]*12*.5,remaining[i]);remaining[i]-=eligible;interestSaving+=eligible*rate/12;}}
let spouseSaving=0;if(year<2024&&p.adults===2&&salaries.filter(s=>s>0).length===1){const i=salaries.findIndex(s=>s>0);const d=Math.min(spouseDeduction(gross*12),remaining[i]);remaining[i]-=d;spouseSaving=d*rate/12;}
const best=Math.max(0,...remaining);const childSaving=Math.min(childDeduction(children,year),best)*rate/12;
const b=benefits(children,year);const vat=year<2024?.20:year===2024?.22:.24;const auto=year>=2025&&p.car?motorNet((p.carGross??carTax().annual)*(p.carCount??1),children)/12:0;
const health=year>=2026&&p.health&&salaries.filter(s=>s>0).length===1&&lostHomeInsurance(p.ages)?272:0;
const rows={netSalary:gross*.964-ordinaryTax,childBenefit:b.child,largeBenefit:b.large,childSaving,spouseSaving,interestSaving,consumption:-positive(p.basket)*(1+vat),housing:-positive(p.housing),other:-positive(p.other),car:-auto,health:-health};
const disposable=rows.netSalary+b.total+childSaving+spouseSaving+interestSaving;const balance=Object.values(rows).reduce((a,b)=>a+b,0);const eq=1+.5*(p.adults-1)+p.ages.reduce((s,a)=>s+(a<14?.3:.5),0);
return{year,gross,rows,disposable,balance,perPerson:balance/(p.adults+children),equivalizedIncome:disposable/eq,equivalence: eq};}
export const rowNames={netSalary:'Netopalk: isiklik maksuvaba tulu ja tulumaks',childBenefit:'Lapsetoetused',largeBenefit:'Lasterikka pere toetus',childSaving:'Laste tulumaksusoodustus',spouseSaving:'Abikaasa tulumaksusoodustus',interestSaving:'Intresside tulumaksusoodustus',consumption:'Standardkäibemaksuga tarbimine',housing:'Laenumakse või üür',other:'Muud samaks jäetud kulud',car:'Auto aastamaks pärast laste vähendust',health:'Koduse vanema vabatahtlik ravikindlustus'};
export const mortgageHistory=[{year:2004,cap:100000/15.6466,rate:.26},{year:2005,cap:50000/15.6466,rate:.24},{year:2008,cap:50000/15.6466,rate:.21},{year:2011,cap:3196,rate:.21},{year:2012,cap:1920,rate:.21},{year:2015,cap:1920,rate:.20},{year:2016,cap:1200,rate:.20},{year:2017,cap:300,rate:.20},{year:2023,cap:300,rate:.20},{year:2024,cap:0,rate:.20},{year:2026,cap:0,rate:.22}];
export function mortgageRefund(interest,people,row){positive(interest);return Math.min(interest,people*row.cap)*row.rate;}
