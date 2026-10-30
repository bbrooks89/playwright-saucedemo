import { test, expect } from '@playwright/test';

test.describe('Posts API', () => {
  test('GET a single post returns 200 and the right post', async ({ request }) => {
    const response = await request.get('/posts/1');

    expect(response.status()).toBe(200);
    const post = await response.json();
    expect(post.id).toBe(1);
    expect(post.title).toBeTruthy();
  });

  test('GET posts filtered by user returns only that user', async ({ request }) => {
    const response = await request.get('/posts', { params: { userId: 1 } });

    expect(response.ok()).toBeTruthy();
    const posts = await response.json();
    expect(posts.length).toBeGreaterThan(0);
    for (const post of posts) {
      expect(post.userId).toBe(1);
    }
  });

  test('POST creates a post and returns 201', async ({ request }) => {
    const response = await request.post('/posts', {
      data: { title: 'Playwright API test', body: 'Hello', userId: 1 },
    });

    expect(response.status()).toBe(201);
    const created = await response.json();
    expect(created.title).toBe('Playwright API test');
    expect(created.id).toBeDefined();
  });

  test('GET a post that does not exist returns 404', async ({ request }) => {
    // your turn: request /posts/99999 and assert the status is 404
   const response = await request.get('/posts/99999');

    // 2. Assert that the HTTP status code is 404
    expect(response.status()).toBe(404);
  });
});
