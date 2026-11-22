export const finite=v=>typeof v==='number'&&Number.isFinite(v);
export function months(price,wage,area=60){return finite(price)&&price>0&&finite(wage)&&wage>0&&finite(area)&&area>0?price*area/wage:null;}
export function relativeRatio(price,wage,basePrice,baseWage){return [price,wage,basePrice,baseWage].every(v=>finite(v)&&v>0)?100*(price/basePrice)/(wage/baseWage):null;}
export function selectedValue(row,{metric='months',wage='wage',price='price',area=60}={}){const m=months(row[price],row[wage],area);return m===null?null:metric==='sqm'?area/m:m;}
export function linkedWage(year,old,current,link=2022){if(year<=link)return old.get(year)??null;return [old.get(link),current.get(link),current.get(year)].every(v=>finite(v)&&v>0)?old.get(link)*current.get(year)/current.get(link):null;}
