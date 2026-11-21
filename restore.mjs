// Run from a downloaded static publication: node restore.mjs /path/to/new-workspace
import fs from 'node:fs/promises';import path from 'node:path';import {gunzipSync} from 'node:zlib';
const destination=path.resolve(process.argv[2]??'reproduced');
const archive=await fs.readFile('data/reproduce.ndjson.gz');
for(const line of gunzipSync(archive).toString('utf8').trim().split('\n')){const record=JSON.parse(line),file=path.resolve(destination,record.path);if(!file.startsWith(destination+path.sep))throw new Error('Invalid archive path');await fs.mkdir(path.dirname(file),{recursive:true});await fs.writeFile(file,record.content,{flag:'wx'});}
await fs.mkdir(path.join(destination,'site/data'),{recursive:true});console.log('Restored to '+destination+'. Run npm run build && npm test there.');
