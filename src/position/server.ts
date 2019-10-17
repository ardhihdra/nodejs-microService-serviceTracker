import * as express from 'express';
import * as cors from 'cors';
import { createServer } from 'http';
import { Server } from 'net';
import { getPosition } from './position';

const PORT = process.env['POSITION_PORT'] || 3001;

const app = express();
app.set('port', PORT);
app.use(cors());

// routing
app.get('/position/:rider_id', getPosition);
app.all("*", (req, res) => res.status(404).send());

const server = createServer(app);

export function startServer(): Server {
  return server.listen(PORT, () => {
    console.log('server listen on port ', PORT);
  });
}