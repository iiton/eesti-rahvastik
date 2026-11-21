/** Annual cohort-component model. Counts are expectations; never round internally. */
export const total=xs=>xs.reduce((n,x)=>n+x,0);
export function lifeTable(q,{infantAgeAtDeath=.1}={}){
 if(q.length!==101||q[100]<=0||q.some(x=>!Number.isFinite(x)||x<0||x>=1))throw new Error('Invalid mortality probabilities');
 const l=[100000];for(let a=0;a<=100;a++)l.push(l[a]*(1-q[a]));
 const L=l.slice(0,101).map((v,a)=>(v+l[a+1])/2);L[0]=l[0]*(1-(1-infantAgeAtDeath)*q[0]);
 const survival=L.slice(0,100).map((v,a)=>L[a+1]/v);survival.push(1-q[100]);
 if(survival.some(v=>v<0||v>1+1e-10))throw new Error('Invalid survival ratios');
 return {q,l,L,survival,newbornSurvival:L[0]/l[0],lifeExpectancy:(total(L.slice(0,100))+L[100]/q[100])/l[0],tailExpectancy:1/q[100]-.5};
}
export function advance(cohorts,life){const next=Array(101).fill(0);for(let a=0;a<100;a++)next[a+1]=cohorts[a]*life.survival[a];next[100]+=cohorts[100]*life.survival[100];return next;}
export function project({initial,groups,life,femaleShare,years=100,startYear=2026}){
 if(initial.length!==groups.length)throw new Error('Group mismatch');
 let states=initial.map(s=>({male:[...s.male],female:[...s.female]}));const rows=[];let legacy=initial.map(s=>[...s.female]);
 const snapshots=[{year:startYear,groups:states.map((s,i)=>({id:groups[i].id,male:[...s.male],female:[...s.female]}))}];
 for(let step=0;step<years;step++){
  const byGroup=states.map((state,i)=>{const birthFemaleShare=groups[i].femaleShare??femaleShare;const next={male:advance(state.male,life.male),female:advance(state.female,life.female)};
   const legacyNext=advance(legacy[i],life.female);const existingMotherBirths=total(legacy[i].map((n,a)=>(n+legacyNext[a])/2*(groups[i].rates[a]??0)));
   const exposures=state.female.map((n,a)=>(n+next.female[a])/2);
   const birthsByAge=exposures.map((n,a)=>n*(groups[i].rates[a]??0)),births=total(birthsByAge);
   const populationStart=total(state.male)+total(state.female);
   const existingDeaths=populationStart-total(next.male)-total(next.female);
   next.male[0]=births*(1-birthFemaleShare)*life.male.newbornSurvival;
   next.female[0]=births*birthFemaleShare*life.female.newbornSurvival;
   const infantDeaths=births-next.male[0]-next.female[0],deaths=existingDeaths+infantDeaths,populationEnd=total(next.male)+total(next.female);
   const count=(lo,hi)=>total(state.male.slice(lo,hi+1))+total(state.female.slice(lo,hi+1));
   return {id:groups[i].id,births,birthsByAge,existingMotherBirths,legacyNext,deaths,populationStart,populationEnd,age7to15:count(7,15),age16to18:count(16,18),age65plus:count(65,100),women15to49:total(state.female.slice(15,50)),balanceError:populationEnd-(populationStart+births-deaths),next};
  });
  const sums=Object.fromEntries(['births','existingMotherBirths','deaths','populationStart','populationEnd','age7to15','age16to18','age65plus','women15to49'].map(k=>[k,total(byGroup.map(r=>r[k]))]));
  const record={year:startYear+step,...sums,groups:byGroup.map(({next,legacyNext,...r})=>r)};rows.push(record);states=byGroup.map(r=>r.next);legacy=byGroup.map(r=>r.legacyNext);
  snapshots.push({year:startYear+step+1,groups:states.map((s,i)=>({id:groups[i].id,male:[...s.male],female:[...s.female]}))});
 }
 return {rows,snapshots};
}
export function demographicParameters(rates,life,femaleShare){const tfr=total(rates),weights=rates.map((r,a)=>r*life.L[a]/life.l[0]*femaleShare),nrr=total(weights),meanAge=total(weights.map((w,a)=>w*(a+.5)))/nrr;
 const objective=r=>total(weights.map((w,a)=>w*Math.exp(-r*(a+.5))));let lo=-.15,hi=.15;for(let i=0;i<100;i++){const mid=(lo+hi)/2;if(objective(mid)>1)lo=mid;else hi=mid}const intrinsic=(lo+hi)/2;
 return {tfr,nrr,meanGenerationAge:meanAge,intrinsicAnnualRate:intrinsic,halvingYears:intrinsic<0?Math.log(.5)/intrinsic:null};
}
