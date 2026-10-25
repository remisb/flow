import {cp,mkdir,readdir,readFile,writeFile,rm} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
async function files(dir){let all=[];for(const entry of await readdir(dir,{withFileTypes:true})){const name=path.join(dir,entry.name);all.push(...entry.isDirectory()?await files(name):[name]);}return all.sort();}
const source=path.join(root,'src');const contents=await Promise.all((await files(source)).map(f=>readFile(f)));const hash=createHash('sha256');contents.forEach(c=>hash.update(c));const revision=hash.digest('hex').slice(0,12);
await rm(path.join(root,'dist'),{recursive:true,force:true});await mkdir(path.join(root,'dist'),{recursive:true});await cp(source,path.join(root,'dist'),{recursive:true});
// Fingerprint scripts and styles so an update never mixes old cached code with new HTML.
const names=(await readdir(path.join(root,'dist'))).filter(n=>n!=='sw.js'&&/\.(js|css)$/.test(n));
for(const file of await files(path.join(root,'dist'))){if(!/\.(html|js)$/.test(file)||file.endsWith('/sw.js'))continue;let text=await readFile(file,'utf8');for(const name of names)text=text.replaceAll('./'+name,'./'+name.replace(/\.(js|css)$/,'.'+revision+'.$1'));await writeFile(file,text);}
for(const name of names){await cp(path.join(root,'dist',name),path.join(root,'dist',name.replace(/\.(js|css)$/,'.'+revision+'.$1')));await rm(path.join(root,'dist',name));}
const assets=(await files(path.join(root,'dist'))).filter(f=>!f.endsWith('/sw.js')).map(f=>'./'+path.relative(path.join(root,'dist'),f).split(path.sep).join('/'));
let sw=await readFile(path.join(source,'sw.js'),'utf8');sw=sw.replace('__REVISION__',revision).replace('__ASSETS__',JSON.stringify(assets));await writeFile(path.join(root,'dist/sw.js'),sw);
console.log(`Built Flow ${revision}: ${assets.length} offline assets.`);
