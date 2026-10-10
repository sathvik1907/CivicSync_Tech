import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'http';
import { app } from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';

let server;
let baseUrl;

describe('API Integration & Authorization Tests', () => {
  before(async () => {
    await connectDB();
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    baseUrl = `http://127.0.0.1:${port}`;
  });

  after(async () => {
    await new Promise((resolve) => server.close(resolve));
    await disconnectDB();
  });

  test('GET /health/live returns 200 and status ok', async () => {
    const res = await fetch(`${baseUrl}/health/live`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, 'ok');
  });

  test('GET /health/ready returns 200 when database is connected', async () => {
    const res = await fetch(`${baseUrl}/health/ready`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, 'ready');
    assert.equal(body.database, 'connected');
  });

  test('GET /api/v1/reference-data returns cities, departments, road segments', async () => {
    const res = await fetch(`${baseUrl}/api/v1/reference-data`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(Array.isArray(body.departments));
    assert.ok(Array.isArray(body.roadSegments));
    assert.ok(body.cities.includes('Chennai'));
  });

  test('GET /api/v1/projects returns paginated projects', async () => {
    const res = await fetch(`${baseUrl}/api/v1/projects?limit=5`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(Array.isArray(body.projects));
    assert.ok(body.pagination.total >= 18);
    // Check computed fields are present
    const first = body.projects[0];
    assert.ok(first.health !== undefined);
    assert.ok(first.budgetMetrics !== undefined);
  });

  test('GET /api/v1/auth/csrf returns csrf token and sets cookie', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/csrf`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.csrfToken);
    const setCookie = res.headers.get('set-cookie');
    assert.ok(setCookie.includes('civicsync_csrf'));
  });

  test('Protected routes reject anonymous request with 401', async () => {
    const res = await fetch(`${baseUrl}/api/v1/reports/mine`);
    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.code, 'UNAUTHORIZED');
  });

  test('Official routes reject unauthenticated mutations', async () => {
    const res = await fetch(`${baseUrl}/api/v1/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Unauthorized Project' })
    });
    // Missing auth/csrf
    assert.ok([401, 403].includes(res.status));
  });

  test('Unknown /api/* route returns 404 JSON (not HTML)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/nonexistent-route`);
    assert.equal(res.status, 404);
    const body = await res.json();
    assert.equal(body.code, 'NOT_FOUND');
  });

  test('Direct SPA route navigation returns HTML index', async () => {
    const res = await fetch(`${baseUrl}/projects/some-id`);
    assert.equal(res.status, 200);
    const text = await res.text();
    assert.ok(text.includes('<!DOCTYPE html>'));
    assert.ok(text.includes('CivicSync'));
  });

  test('Public registration creates only resident accounts and blocks role escalation', async () => {
    // 1. Get CSRF token
    const csrfRes = await fetch(`${baseUrl}/api/v1/auth/csrf`);
    const { csrfToken } = await csrfRes.json();
    const cookie = csrfRes.headers.get('set-cookie');

    // 2. Attempt registration with role=coordinator in body
    const regRes = await fetch(`${baseUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
        'Cookie': cookie
      },
      body: JSON.stringify({
        email: `citizen_${Date.now()}@example.com`,
        password: 'Password123!',
        displayName: 'Test Citizen',
        role: 'coordinator' // Attempt privilege escalation
      })
    });

    assert.equal(regRes.status, 201);
    const body = await regRes.json();
    // System must enforce role='resident'
    assert.equal(body.user.role, 'resident');
  });
});
