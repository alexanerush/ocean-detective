import { app } from './app';
import { db } from './db/connection';
import './db/models';
import { env } from './config/env';
async function start(){await db.authenticate();const server=app.listen(env.port,()=>console.log(JSON.stringify({level:'info',message:'Ocean Detective backend started',port:env.port})));for(const signal of ['SIGINT','SIGTERM'] as const){process.once(signal,()=>{server.close(()=>{void db.close().then(()=>process.exit(0));});});}}
start().catch(error=>{console.error(JSON.stringify({level:'error',message:'Backend startup failed',errorType:error?.name}));process.exit(1);});
