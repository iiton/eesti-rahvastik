# Eesti järgmised põlvkonnad — rahvastiku atlas

Avalik veeb: https://iiton.github.io/eesti-rahvastik/

Eraldi rahvastiku- ja haridusanalüüs. 35 Statistikaameti PxWeb tabelit, 437 875 algandmelahtrit, 23 graafikut. Ei sisalda tööhõiveanalüüsi.

## Sisu

Sünnid ja surmad 1919–2025; sündimuse vanuskordajad 1970–2025; sünnijärjekord; sünnipõlvkondade lastetus samas vanuses 2011/2021; lõpetatud ja pooleliolev pereloome; naiste koguarvu, vanusejaotuse ja vanuskordajate arvestuslik jaotus; maakondade vananemine ja ränne; tegelikud põhikooli/gümnaasiumi õpilased; 2024. aasta ametlikud rahvastikustsenaariumid ning 2026 esialgsed registreerimised.

## Taastamine ja kordamine — ainult Node.js

Repositoorium sisaldab avaldamisvalmis staatilist lehte. Täielik projekt koos algvastuste, päringute, metaandmete ning arvutuskoodiga on failis `data/reproduce.ndjson.gz`.

Node.js 22 või uuem:

```sh
node restore.mjs /tmp/rahvastik-work
cd /tmp/rahvastik-work
npm run build
npm test
npm run serve
```

Taastamise siht peab olema uus kaust; olemasolevaid faile ei kirjutata üle. Brauseritest vajab eraldi `playwright-core` paketti ja Chromiumi (`BROWSER_PATH` keskkonnamuutuja). Arvutamine ja staatilise lehe ehitamine ei vaja npm-sõltuvusi.

`npm run collect` kasutab talletatud päringute valikuid ja puhverdatud vastuseid. Värske täieliku andmekogumise jaoks varunda ning eemalda kõigepealt vastavad `data/raw/*.json` vastused (säilita `.meta.json` ja `.query.json`) ning HTML-märkuste vahemälu; metaandmeid saab uuendada `node scripts/metadata.mjs`. Seejärel kogu, ehita ja kontrolli uuesti. API skeemi ja allikamärkuste muutused vajavad ülevaatust.

## Kontrollid

Sündide-surmade bilanss; sünni üksikvanuste kogusummad; Shapley kolme teguri jaotus kontrollitud teise valemiga; laste arvu teadmata kategooriate erinev käsitlus 2011/2021; kooliastmete kogusummad; rände ja rahvaarvu bilanss; maakondade vanuserühmad; prognoositabelite ristkontroll. Brauseris kontrollitud 360, 390, 768, 1365 ja 1920 px; valikud, CSV, andmetabelid ja algandmete uurija.

## Tõlgenduspiirid

- Perioodi sündimuskordaja pole ühe sünnipõlvkonna lõplik laste arv.
- Lastetus teatud vanuses ei tähenda loobumisotsust.
- 2011 ja 2021 loenduste metoodikad erinevad; teadmata staatust ei käsitleta null lapsena.
- 2016 rahvastikuarvestus, 2017 haldusreform ja 2022 elukoha määramine muudavad võrreldavust.
- Prognoosid on 2024. aasta tingimuslikud stsenaariumid, mitte 2025 sündidega uuendatud ennustused.
- Kooliealiste rahvaarv ei võrdu õpilaste arvuga. Elukoht ei võrdu kooli asukohaga.
- 2026 registreerimiskuu andmed on esialgsed ja erinevad lõplikust sünniaasta statistikast.

Andmete allikaviited, päringud ja SHA-256 kontrollsummad: `data/sources.json` ja taastatav algandmearhiiv. Normaliseeritud CSV sisaldab ühikuid, allika algväärtust ning puuduva väärtuse põhjust; HT12 tuhandetes avaldatud õppijad on teisendatud inimesteks. ECharts: Apache 2.0 litsents (`vendor/ECHARTS-LICENSE.txt`).

## 100 aastat nullrändega

`projection.html` arvutab sünnid aastateks 2026–2125. Lähtepunkt 1.01.2026; 2025. aasta suremus ja sündimus (tundlikkus: 2023–2025 sündimus). Sisse- ja väljaränne mõlemad null. A hoiab püsiva kõigi elanike sündimusprofiili; B hoiab eraldi eestlaste ja ülejäänud rahvastiku profiilid. B rahvusjaotus on hinnanguline. 9 sisendtabelit, 5 interaktiivset SVG-graafikut, kõik mudeliaastad CSV-s. `npm run project` uuendab arvutust ja lehte; `npm test` kontrollib ka sõltumatu arvutusmeetodiga kõiki 400 mudeliaastat. `scripts/projection-collect.mjs` kogub mudeli algandmed.

## 1991–2001 sündinud naiste laste arv hariduse järgi

Ankur `#haridus-1991-2001`: RL214111 üksikvanused seisuga 31.12.2021, vanus 20–30. Avaldatud keskmised teadaoleva laste arvuga naiste seas, ka lastetud. Graafikul saab valida keskmise, teadmata laste arvuga naiste osakaalu või rühma suuruse; kõik 11 sünniaastat on ka staatilises tabelis. Haridus on loendushetke oma, mitte lõplik; need ei ole tänased ega lõpetatud peresuurused. Värskem RV096 ei eralda seda sünniaastate vahemikku täpselt. Kontroll: `node scripts/verify-education.mjs`.

## Õppijate arv 2027/28–2046/47

`students.html`: 20 õppeaastat, põhikooli ja gümnaasiumi kõik õppevormid, ülikoolid eraldi kogu kõrgharidusest. HTG03/HT290 2025/26 baas, UOE 2024/25 vanuseprofiilid, kolme õppetaseme eraldi kalibreerimine kõrghariduses. Nullränne ja 2025 sündimus; tundlikkus 2023–2025 sündimusega ning võrdlus Statistikaameti 2024 rahvastikuprognoosiga. Tegu on meie osalusmäärade mudeliga, mitte ametliku õpilasprognoosiga. Välisüliõpilaste vood ja tulevased õpivalikud pole eraldi modelleeritud. Ametlik HTM gümnasistide prognoos 2033-ni on eraldi, statsionaarse õppe kohta.

`node scripts/students-collect.mjs` kogub sisendid; `npm run students` arvutab ja ehitab; `node scripts/verify-students.mjs` kontrollib arvutusi. Algandmed, päringud ja kontrollsummad: `data/students/`; kogu projekt on taastamisarhiivis. `scripts/students-browser-check.mjs` kontrollib Chromiumi ja WebKiti telefonis, iPadi mõõdus ning arvutis.

## Sünnid 20–45-aastastele naistele, 1989–2025

`births.html` kasutab 20 Statistikaameti tabelit. Täpne 20–45 (mõlemad piirid kaasas) tuleb RV129 üksikvanustest; RV0212 aastakeskmine naiste arv annab suhtarvud alates 2000. aastast. Lisaks 10 ristlõikevaadet: maakond, haridus, sünnijärjekord, asustustüüp, eestlaste sündide tabel, ema kodakondsus ja sünniriik, isa vanus ning abieluline staatus/isa tuvastatus. Laiemate vanuserühmade tõttu on ristlõigete vaikevalik 20–39; 20+ sisaldab ka 46-aastaseid ja vanemaid. Täpset 20–45 jaotust neile tunnustele ei hinnata proportsionaalselt.

Arhiivi maakonnatabelite puuduvad teadmata elukoha lahtrid säilivad puuduvana. Riigi hariduse koond pärineb RV142/RV142U-st ja sünnijärjekord RV129-st; nii ei kao varasemad riigi aastad. Linn/maa jaotuse kogusummast ülejääk on märgitud arvutatud jäägina. 2017 haldusjaotuse ning 2022 elukoha arvestuse piir katkestab ühendusjoone, kuid kõik aastaväärtused jäävad alles. RV15 + RV152 ja RV129 20–39-aastaste summade erinevus (2014: 3; 2015: 14 last) on dokumenteeritud, algandmeid ei parandata oletuse põhjal.

`node scripts/births-collect.mjs` kogub sisendid; `npm run births` ehitab vaate; `node scripts/verify-births.mjs` kontrollib vanusepiire, aastaridu, sõltumatute tabelite summasid ja puuduvaid lahtreid. `scripts/births-browser-check.mjs` kontrollib Chromiumi ja WebKiti 390, 834 ja 1440 px juures, kõiki ristlõikeid ning CSV-sid. Põhivaate 40 kB JSON laaditakse sõltumatult valitud ristlõikest. Graafikud on SVG; aastate põhitabel on olemas ka JavaScriptita. Algandmed, päringud ja kontrollsummad on `data/births/` all ning taastamisarhiivis.

### Võrreldavad 100 000 naise rühmad

Vaikimisi kuvatakse otsemeetodil standarditud sündide arv 100 000 naise kohta: igal aastal on sama 2005. aasta Eesti naiste vanusejaotus. Riigi 20–45 vaates kasutatakse üksikvanuseid (2000–2025); ristlõigetes viieaastaseid rühmi. Võrdluseks saab valida tegeliku vanusjaotusega määra või sündide arvu. Üksikvanuse profiil näitab 100 000 sama vanuse naise määra. See ei ole põhjuslikult puhas käitumismõõdik: haridus, varasem laste arv, pereseis ja ajastus võivad endiselt muutuda.

RV0231U, RV0282U, RV022U ja RV069U annavad rühmade naiste arvud. Hinnanguline aastakeskmine nimetaja on kahe järjestikuse 1. jaanuari keskmine; riigi nimetaja on võimalusel RV0212 avaldatud aastakeskmine. Hariduse, rahvuse ja kodakondsuse/sünniriigi määrad algavad 2018; maakonnad 2017. Rahvuse puhul kontrolliti RV122U kogusummade vastavust RV108 eestlastest emade sündidele 2018–2025; 2017 erinevus on 3 last ja määra ei arvutata. Hariduse × linn/maa ning rahvuse × linn/maa ühiseid nimetajaid siin ei ole. Sünnijärjekorra, isa vanuse ja abielulise staatuse määrade nimetaja on kõik valitud vanuses naised: need on sündmuste panused, mitte vastava laste arvu, partneri või abielustaatusega naiste tingimuslikud määrad. Avatud vanuserühmad, puuduv ja nulline nimetaja annavad puuduva määra.

`node scripts/births-denominators-collect.mjs` kogub nimetajad; `npm run births` arvutab ka standarditud mõõdikud. `verify-births-normalization.mjs` kontrollib sõltumatu valemiga standardimist, muutumatu vanuspõhise sündimusega sünteetiliste populatsioonide invariantsust, hariduse/maakonna nimetajaid ja puuduvaid ristlõikeid. Arvutuse kaalud on `data/births/exact.json`; risttabelite naiste arvud samas järjekorras kui lahtrid on `exposures` ning kaalude alus `standardPopulation`.

## Palgad ja koduhinnad 1997–2026

`housing.html` võrdleb eluruumina müüdud korterite ruutmeetrihindu Eesti brutokuupalgaga. Põhiaegrida 2004–2025: MaRu avaldatud keskmine või mediaan €/m², viis piirkonda, kuus suurusrühma. Kõik piirkonnad kasutavad sama Eesti palka. 60 m² on muudetav arvutuslik hinnanäide, mitte tegeliku säästmisaja või laenuvõime mõõt. Bürootehingute KV12 kvartalid 1997–2009 on eraldi vaade, piiriga 2002 vallasvara/kinnisvara vahel. Kinnisvara siin ei tähenda äri- ega põllumaad.

Palgatasemed: PA5321 ja PA001/PA004 vanas metoodikas, PA101 uues alates 2021; PA92/PA11/PA001 ja PA111 kvartalivõrdluseks. 2023 avaldamismuutus arvutati uues tabelis tagasi 2021. aastani. Absoluutvaates katkeb ühendusjoon 2021, puuduvat palgamediaani ei imputeerita. Kasvuindeksis vaikimisi aheldamine ühise 2022. aasta kaudu, tundlikkus 2021 ühendusega. Aheldatud euroväärtus on vaid indeksi arvutusvahend.

MaRu korterite hinnaindeks hõlmab 17 linna ja arvestab asukohta ning pindala. SA IA028 korterite ja majade indeksid esitatakse võrdluseks; nende lahknevust ei tõlgendata automaatselt ühe allika veana ega lahutata välja tõendamata „kvaliteedimõju”. Aastaks võetakse nelja kvartali indeksite keskmine, palgaks avaldatud aastapalk. 2026 on ainult kvartalivõrdlus sama kvartaliga aasta varem. 2026 III hinnaindeksile palk puudub.

Kogumine: `node scripts/housing-collect.mjs` ja `node scripts/housing-maru-collect.mjs`. Allikate päringud, ajatemplid ja SHA-256 on `data/housing/` manifestides. MaRu indeksite originaal-PDF on säilitatud ka base64 tekstina taastootmisarhiivis; `housing-index-extract.mjs` taastab tabeli tekstikoordinaatide vahemälust. PDF uuesti tekstiks lugemine vajab valikulist `pdfjs-dist` paketti (kasutatud 6.5.438) ja `HOUSING_PDFJS_MODULE` võib määrata mooduli tee. Tavaliseks ehituseks paketti vaja pole.

Ehitus: `npm run housing`, seejärel `node scripts/build.mjs` (avaleht ja taastootmisarhiiv). Kontroll: `node scripts/verify-housing.mjs` kontrollib muu hulgas kõigil 132 aasta/suurusrühma paaril Eesti = Tallinn + ülejäänud Eesti tehinguarvude võrdsust ning kaalutud keskmiste kooskõla. API piirkondId üksi ei välista Tallinna; vajalik on `valistus=tallinn`. Testid kontrollivad ka rahaühikute invariantsust, puuduvaid/salastatud väärtusi, palga aheldamist, PDF valitud väärtusi ja lähtefailide kontrollsummasid. `housing-browser-check.mjs` katab Chromiumi ja WebKiti 390, 834 ja 1440 px, valikud, CSV ja lehe horisontaalse ülevoolu. Brauser laadib 212 kB andmefaili ja kohaliku EChartsi SVG-renderdaja.


## Pere, kodu ja riigi reeglid 2004–2026

`policy.html` koondab 50 ametlikku allikat ja 27 muudatust või kehtivat meedet. Põhivõrdlus rakendab 2018–2026 aasta lõpu reegleid samadele nominaalsetele palkadele, kuludele ja laste vanustele. Kolm muudetavat näidisleibkonda, sama kogubruto võrdlus, maksusoodustuste tulupiirid, laste vanusest sõltuv koduse abikaasa kindlustus, mitme auto ühine laste vähendus ning CSV. See pole leibkondade esinduslik mikrosimulatsioon ega tegeliku ostujõu ajalugu.

Eraldi vaated: kolme lapse toetuste nominaalne ja IA02-ga deflateeritud ostujõud 2018–2025; intressisoodustuse muutused alates 2004; M1 kuni 7-kohalise sisepõlemismootoriga auto aastamaks ja ühekordne registreerimistasu; eri energiakriisi meetmete koguselaed. 2026 puuduv täisaasta hinnatase säilib puuduvana. Rahalise mehhanismi kirjeldust ei esitata sündide languse põhjusliku hinnanguna.

Kogumine: `node scripts/policy-collect.mjs` (IA02 metaandmed, päring, 96 algväärtust, SHA-256). Seaduste käsitsi kontrollitud andmeregister: `scripts/policy-data.mjs`; kolm Riigi Teataja HTML-väljavõtet ning hinnatabel on taastootmisarhiivis. Ehitus: `npm run policy`, seejärel `node scripts/build.mjs`. Kontroll: `node scripts/verify-policy.mjs` ja `node scripts/policy-browser-check.mjs`. Viimane katab Chromiumi/WebKiti, 390/834/1440 px, viis SVG-graafikut, maksuvõrdluse, kindlustuse erandi, filtrid ja CSV.

Sõnumite osa `#signaalid` eristab kuue ametliku tsitaadi täpset sõnastust, konteksti, võimalikku vastuvõtja tõlgendust ja tõendamata järeldusi. `node scripts/policy-signals.mjs` kontrollib tsitaadid otse allikate tekstist ning salvestab URL-id, kuupäevad ja vastuste SHA-256 kontrollsummad faili `data/policy/signals.json`. Algavaldamise ja viimase uuendamise kuupäeva ei samastata. Signaalide mõju ei hinnata väljamõeldud eurokulu või sündimata laste arvuna.

## Leibkondade aastaeelarved

`budget.html` võrdleb 2018–2025 nelja leibkonda: üksik ühe või kahe keskmise palgaga ning kolme lapsega pere ühe või kahe teenijaga (kokku kaks keskmist). 2026 on eraldi osaliste andmete reeglistsenaarium.

`site/data/budget/index.json` sisaldab normaliseeritud palka, Tallinna korterite tehinguhindu, EKP uute eluasemelaenude intressi, Eurostati elektri lõpphindu ja detailseid hinnaindekseid ning Euroopa Komisjoni diislikütuse nädalaread. Eluaseme- ja autokulude kogused ning osa hinnatasemeid on nähtavad mudelieeldused. Maksutagastus omistatakse tulu teenimise aastale. Auto kulum on asendusreserv; sissemakse on eraldi.

Allikaarhiivis: `node scripts/budget-collect.mjs` (vahemälu, `--refresh` uuendamiseks), `npm run budget`, `node scripts/verify-budget.mjs`. Ajalooline EC XLSX on arhiivis base64-kujul; parser kasutab ZIP-i avamiseks süsteemi `unzip` käsku, kõik arvutused on JavaScriptis. Brauserikontroll: `node scripts/budget-browser-check.mjs` (kohalik Playwright). Staatilised tabelid jäävad nähtavaks ka JavaScriptita.
