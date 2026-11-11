import { NextResponse } from 'next/server';

const ASSET_LINKS = [
  {
    relation: ['delegate_permission/common.handle_all_urls'],
    target: {
      namespace: 'android_app',
      package_name: 'com.ratelapps.alquilabo',
      sha256_cert_fingerprints: [
        '0D:64:65:4E:96:B4:F2:50:10:CD:9F:20:53:2C:8E:45:B1:A9:63:6C:48:9C:92:E7:1A:FE:22:09:9A:CC:DC:A6',
        '9B:98:33:AF:8C:A8:E6:AD:F4:4E:8E:16:33:84:10:26:EE:F4:2E:3A:83:CD:C8:D4:61:B2:65:87:39:E9:B0:0B',
      ],
    },
  },
];

export async function GET() {
  return NextResponse.json(ASSET_LINKS, {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
