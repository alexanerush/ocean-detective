import {readdir,readFile,mkdir,writeFile} from 'node:fs/promises';
import {gzipSync} from 'node:zlib';
const files=await readdir('dist/assets');const rows=await Promise.all(files.filter(f=>/\.(js|css)$/.test(f)).map(async file=>{const data=await readFile(`dist/assets/${file}`);return {file,bytes:data.length,gzipBytes:gzipSync(data).length};}));await mkdir('reports',{recursive:true});await writeFile('reports/bundle.json',JSON.stringify(rows,null,2));console.table(rows);
