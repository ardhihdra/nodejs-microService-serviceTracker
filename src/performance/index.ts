import { startServer } from './server';
import { syncDB } from './orm';
import { connectToBus } from '../lib/bus';
import { positionProjector } from './performance';

async function startApp() {
  await syncDB();
  await connectToBus();
  positionProjector();
  startServer();
}

startApp();
