import { Authenticator } from "remix-auth";
import cache from "#app/utils/cache-server";
const cacheKey = `users`;
import { redirect } from 'react-router'
import { authSessionStorage } from './session.server'

export const sessionKey = "sessionId";

export async function getUser(request: Request) {
  const authSession = await authSessionStorage.getSession(
    request.headers.get('cookie'),
  )
  const sessionId = authSession.get(sessionKey)
  if (sessionId) {
    const cachedData = cache.get(cacheKey) || [];

    const finder = cachedData.find((d: { username: string }) =>
      d.username === sessionId.username
    );
    return finder
  }
}

export async function logout(request: Request) {
  const authSession = await authSessionStorage.getSession(
    request.headers.get('cookie'),
  )
  const sessionId = authSession.get(sessionKey)
  if (sessionId) {
    throw redirect('/', {
      headers: {
        'set-cookie': await authSessionStorage.destroySession(authSession),
      },
    })
  }
}


