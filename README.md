# Eesti järgmised põlvkonnad — rahvastiku atlas

Avalik veeb: https://iiton.github.io/eesti-rahvastik/

Eraldi rahvastiku- ja haridusanalüüs. 34 Statistikaameti PxWeb tabelit, 432 835 algandmelahtrit, 22 graafikut. Ei sisalda tööhõiveanalüüsi.

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
