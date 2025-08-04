import express from 'express';
import type { Server } from 'http';

jest.mock('chalk', () => ({
  __esModule: true,
  default: {
    blue: (s: string) => s,
    cyan: (s: string) => s,
    magenta: (s: string) => s,
    yellow: (s: string) => s,
    green: (s: string) => s,
  },
}));

import { startServer } from '../src/application/server';

describe('startServer', () => {
  let proxy: Server;
  let auth: Server;
  let invoices: Server;

  beforeAll(async () => {
    const authApp = express();
    authApp.get('*', (_, res) => res.send('auth'));
    auth = authApp.listen(9001);

    const invoicesApp = express();
    invoicesApp.get('*', (_, res) => res.send('invoices'));
    invoices = invoicesApp.listen(9002);

    proxy = await startServer({
      port: 3100,
      nodes: {
        auth: 'http://localhost:9001/auth',
        invoices: 'http://localhost:9002/invoices',
      },
      log: false,
      cors: { origin: ['http://example.com'], methods: ['GET'] },
    });
  });

  afterAll(() => {
    proxy.close();
    auth.close();
    invoices.close();
  });

  it('routes each node to its destiny', async () => {
    const r1 = await fetch('http://localhost:3100/auth/test');
    expect(await r1.text()).toBe('auth');

    const r2 = await fetch('http://localhost:3100/invoices/test');
    expect(await r2.text()).toBe('invoices');
  });

  it('applies CORS headers when enabled', async () => {
    const res = await fetch('http://localhost:3100/auth/test', {
      headers: { Origin: 'http://example.com' }
    });
    expect(res.headers.get('access-control-allow-origin')).toBe('http://example.com');
  });
});
