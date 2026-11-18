interface Env {
  API_ORIGIN?: string;
}

interface PagesContext {
  request: Request;
  env: Env;
}

const DEFAULT_API_ORIGIN = 'https://appapi-production-328714f7.up.railway.app';

export async function onRequest(context: PagesContext): Promise<Response> {
  const origin = (context.env.API_ORIGIN || DEFAULT_API_ORIGIN).replace(/\/+$/, '');
  const incomingUrl = new URL(context.request.url);
  const targetUrl = `${origin}${incomingUrl.pathname}${incomingUrl.search}`;

  const headers = new Headers();
  const contentType = context.request.headers.get('Content-Type');
  if (contentType) headers.set('Content-Type', contentType);

  const authorization = context.request.headers.get('Authorization');
  if (authorization) headers.set('Authorization', authorization);

  const method = context.request.method.toUpperCase();
  const hasBody = method !== 'GET' && method !== 'HEAD';

  const upstreamResponse = await fetch(targetUrl, {
    method,
    headers,
    body: hasBody ? context.request.body : undefined,
  });

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: upstreamResponse.headers,
  });
}
