/**
 * @jest-environment node
 */
import { GET, POST } from '../route';

const post = (body: unknown, raw = false) =>
  POST(
    new Request('http://localhost/api/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: raw ? (body as string) : JSON.stringify(body),
    }),
  );

describe('/api/graphql', () => {
  it('answers a valid POST query', async () => {
    const response = await post({ query: '{ jobs { title } }' });
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.data.jobs).toHaveLength(5);
  });

  it('supports variables', async () => {
    const response = await post({
      query: 'query ($term: String!) { search(term: $term) { href } }',
      variables: { term: 'Kogan Page' },
    });
    const json = await response.json();
    expect(json.data.search[0].href).toBe('/our-work/kogan-page');
  });

  it('answers a GET query', async () => {
    const response = await GET(new Request('http://localhost/api/graphql?query=%7Bcompany%7Bname%7D%7D'));
    expect(response.status).toBe(200);
    expect((await response.json()).data.company.name).toBe('Byte9');
  });

  it('rejects a body that is not JSON', async () => {
    const response = await post('not json', true);
    expect(response.status).toBe(400);
  });

  it('rejects a request without a query', async () => {
    const response = await post({ variables: {} });
    expect(response.status).toBe(400);
    expect((await response.json()).errors[0].message).toMatch(/query/);
  });

  it('rejects variables that are not an object', async () => {
    const response = await post({ query: '{ jobs { title } }', variables: [1, 2] });
    expect(response.status).toBe(400);
  });

  it('limits query size', async () => {
    const response = await post({ query: `{ jobs { title } } #${'x'.repeat(5000)}` });
    expect(response.status).toBe(413);
  });

  it('returns GraphQL errors for invalid queries', async () => {
    const response = await post({ query: '{ notAField }' });
    expect(response.status).toBe(400);
    expect((await response.json()).errors.length).toBeGreaterThan(0);
  });

  it('is never cached', async () => {
    const response = await post({ query: '{ company { name } }' });
    expect(response.headers.get('Cache-Control')).toBe('no-store');
  });
});
