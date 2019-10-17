import { startServer } from './server';
import { syncDB } from './orm';
import { connectToBus } from '../lib/bus';

async function startApp() {
  await syncDB();
  await connectToBus();
  startServer();
}

startApp();
