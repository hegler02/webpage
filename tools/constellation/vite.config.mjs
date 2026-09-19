import {defineConfig} from 'vite';
import {readFileSync} from 'node:fs';
const manifest=JSON.parse(readFileSync(new URL('../../pages/profile/site.manifest.json',import.meta.url)));
export default defineConfig({appType:'mpa',server:{allowedHosts:['terminal.local']},plugins:[{name:'public-profile-routes',configureServer(server){server.middlewares.use((req,res,next)=>{const path=req.url.split('?')[0];const route=manifest.routes.find(r=>r.public_path===path);if(path.startsWith('/constellation/')&&!route)req.url='/pages/profile'+req.url;if(route)req.url='/pages/profile/'+route.physical_path+req.url.slice(path.length);next();});}}]});
