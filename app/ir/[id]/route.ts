import { NextResponse } from 'next/server';

function buildLauncherHtml(propertyId?: string) {
  const scheme = 'alquilabo';
  const androidPackage = 'com.ratelapps.alquilabo';
  const playStoreUrl =
    'https://play.google.com/store/apps/details?id=com.ratelapps.alquilabo';
  const deepLinkPath = propertyId ? `inmueble/${propertyId}` : 'home';
  const customSchemeUrl = `${scheme}://${deepLinkPath}`;
  // Intent URI con scheme obligatorio para Chrome/Android WebView + fallback automático a Play Store
  const androidIntentUrl = `intent://${deepLinkPath}#Intent;scheme=${scheme};package=${androidPackage};S.browser_fallback_url=${encodeURIComponent(
    playStoreUrl,
  )};end`;

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Abrir en la app AlquilaBO</title>
  <style>
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0b1f3a;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      text-align: center;
      padding: 24px;
    }
    .card {
      background: #ffffff;
      color: #0f172a;
      border-radius: 20px;
      padding: 32px 24px;
      max-width: 380px;
      width: 100%;
      box-shadow: 0 20px 40px rgba(0,0,0,0.35);
    }
    .logo {
      width: 180px;
      height: auto;
      margin-bottom: 16px;
    }
    h1 {
      font-size: 22px;
      margin: 0 0 8px;
      color: #0b1f3a;
    }
    p {
      font-size: 15px;
      color: #475569;
      margin: 0 0 24px;
    }
    .btn {
      display: block;
      width: 100%;
      box-sizing: border-box;
      padding: 14px 20px;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 700;
      text-decoration: none;
      margin-bottom: 12px;
    }
    .btn-primary {
      background: #16a34a;
      color: #ffffff;
    }
    .btn-secondary {
      background: #0b1f3a;
      color: #ffffff;
    }
  </style>
  <script>
    (function() {
      var ua = navigator.userAgent || '';
      var isAndroid = /android/i.test(ua);
      var intentUrl = ${JSON.stringify(androidIntentUrl)};
      var playStore = ${JSON.stringify(playStoreUrl)};

      if (isAndroid) {
        window.location.replace(intentUrl);
        setTimeout(function() {
          if (!document.hidden) {
            window.location.replace(playStore);
          }
        }, 1200);
      } else {
        window.location.replace(playStore);
      }
    })();
  </script>
</head>
<body>
  <div class="card">
    <img class="logo" src="/logo-alquilabo.jpg" alt="AlquilaBO" />
    <h1>Abriendo la app AlquilaBO...</h1>
    <p>Estamos abriendo este inmueble directamente en la aplicación móvil.</p>
    <a class="btn btn-primary" href="${androidIntentUrl}">Abrir en la app AlquilaBO</a>
    <a class="btn btn-secondary" href="${playStoreUrl}">Ver en Google Play</a>
  </div>
</body>
</html>`;
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  return new NextResponse(buildLauncherHtml(id), {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
