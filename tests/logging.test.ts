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

describe('logging configuration', () => {
  let backend: Server;

  beforeAll(() => {
    const app = express();
    app.get('*', (_, res) => res.send('ok'));
    backend = app.listen(9100);
  });

  afterAll(() => {
    backend.close();
  });

  it('logs full configuration when log is enabled', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const server = await startServer({
      port: 3200,
      nodes: { api: 'http://localhost:9100/api' },
      log: true,
    });

    const logs = spy.mock.calls.map(call => call[0]).join('\n');
    expect(logs).toContain('Proxy configuration');
    expect(logs).toContain('api');
    expect(logs).toContain('http://localhost:9100/api');

    server.close();
    spy.mockRestore();
  });
});
