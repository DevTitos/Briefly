import { createMiddleware } from 'hono/factory';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import { validateSession } from '../db';

export const sessionMiddleware = createMiddleware(async (c, next) => {
  const sessionId = getCookie(c, 'session_id');
  let user = null;
  let session = null;

  if (sessionId) {
    session = await validateSession(sessionId);
    if (session) {
      user = session.user;
    } else {
      // Invalid session, clear cookie
      deleteCookie(c, 'session_id');
    }
  }

  c.set('user', user);
  c.set('session', session);
  await next();
});