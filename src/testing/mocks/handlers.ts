import { http, HttpResponse } from 'msw'

export const handlers = [
  // Mock Supabase auth endpoints
  http.post('http://localhost:54321/auth/v1/token', () => {
    return HttpResponse.json({
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
      },
    })
  }),

  http.get('http://localhost:54321/auth/v1/user', () => {
    return HttpResponse.json({
      id: 'test-user-id',
      email: 'test@example.com',
    })
  }),

  // Mock Supabase API endpoints
  http.get('http://localhost:54321/rest/v1/*', () => {
    return HttpResponse.json({ data: [], error: null })
  }),

  http.post('http://localhost:54321/rest/v1/*', () => {
    return HttpResponse.json({ data: {}, error: null })
  }),
]