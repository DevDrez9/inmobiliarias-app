import { NextResponse } from 'next/server';

export async function GET() {
  const androidPackage = 'com.ratelapps.alquilabo';
  const playStoreUrl =
    'https://play.google.com/store/apps/details?id=com.ratelapps.alquilabo';
  const androidLauncherIntentUrl = `intent://#Intent;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;package=${androidPackage};S.browser_fallback_url=${encodeURIComponent(
    playStoreUrl,
  )};end`;

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Abrir en la app AlquilaBO</title>
  <script>
    (function() {
      var isAndroid = /android/i.test(navigator.userAgent || '');
      window.location.href = isAndroid ? ${JSON.stringify(androidLauncherIntentUrl)} : 'alquilabo://home';
      setTimeout(function() {
        if (!document.hidden) {
          window.location.href = ${JSON.stringify(playStoreUrl)};
        }
      }, 1800);
    })();
  </script>
</head>
<body style="background:#0b1f3a;color:#fff;font-family:sans-serif;text-align:center;padding:40px;">
  <p>Abriendo AlquilaBO...</p>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
