import { buildRoutes } from '../src/cli/buildRoutes';

describe('buildRoutes', () => {
  it('parses node mappings', () => {
    const routes = buildRoutes([
      'auth:http://localhost:9001/auth',
      'invoices:http://localhost:9002/invoices'
    ]);
    expect(routes).toEqual({
      auth: 'http://localhost:9001/auth',
      invoices: 'http://localhost:9002/invoices'
    });
  });
});
