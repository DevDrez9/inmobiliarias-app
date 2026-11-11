import { NextRequest, NextResponse } from 'next/server';

const PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.ratelapps.alquilabo';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const cleanId = /^[a-zA-Z0-9-]+$/.test(id) ? id : '';

  if (!cleanId) {
    return NextResponse.redirect(PLAY_STORE_URL, 302);
  }

  const ua = request.headers.get('user-agent') || '';
  const isAndroid = /android/i.test(ua);
  const isIOS = /iphone|ipad|ipod/i.test(ua);

  const customSchemeUrl = `alquilabo://inmueble/${cleanId}`;
  const androidIntentUrl =
    `intent://inmueble/${cleanId}#Intent;` +
    `scheme=alquilabo;` +
    `package=com.ratelapps.alquilabo;` +
    `S.browser_fallback_url=${encodeURIComponent(PLAY_STORE_URL)};` +
    `end`;

  const primaryHref = isAndroid
    ? androidIntentUrl
    : isIOS
      ? customSchemeUrl
      : PLAY_STORE_URL;

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Abriendo AlquilaBo...</title>
  <style>
    body {
      margin: 0;
      font-family: system-ui, -apple-system, sans-serif;
      background: #0F172A;
      color: #F8FAFC;
      display: flex;
      min-height: 100vh;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .card {
      max-width: 380px;
      width: 100%;
      background: #1E293B;
      border-radius: 16px;
      padding: 28px 22px;
      text-align: center;
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35);
    }
    .logo {
      width: 140px;
      height: auto;
      border-radius: 12px;
      margin-bottom: 14px;
    }
    h1 { font-size: 20px; margin: 0 0 10px; }
    p { font-size: 14px; color: #94A3B8; margin: 0 0 22px; line-height: 1.5; }
    .btn {
      display: block;
      width: 100%;
      box-sizing: border-box;
      padding: 14px 16px;
      border-radius: 10px;
      font-weight: 600;
      text-decoration: none;
      margin-bottom: 10px;
    }
    .btn-primary { background: #16A34A; color: #FFFFFF; }
    .btn-secondary { background: #334155; color: #E2E8F0; }
  </style>
</head>
<body>
  <div class="card">
    <img class="logo" src="/logo-alquilabo.jpg" alt="AlquilaBo" />
    <h1>AlquilaBo</h1>
    <p>Estamos abriendo esta publicación en la aplicación...</p>
    <a class="btn btn-primary" href="${primaryHref}">Abrir en AlquilaBo</a>
    <a class="btn btn-secondary" href="${PLAY_STORE_URL}">Descargar en Google Play</a>
  </div>
  <script>
    (function () {
      var isAndroid = ${JSON.stringify(isAndroid)};
      var isIOS = ${JSON.stringify(isIOS)};
      if (isAndroid) {
        window.location.href = ${JSON.stringify(androidIntentUrl)};
      } else if (isIOS) {
        window.location.href = ${JSON.stringify(customSchemeUrl)};
      }
    })();
  </script>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
