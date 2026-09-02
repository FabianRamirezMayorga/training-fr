/* Genera los iconos PNG de Training FR a partir del mismo trazado que
   icons/icon.svg: fondo transparente, sin dependencias externas.

   Uso:  node tools-generar-iconos.js icons
*/
const zlib = require('zlib');
const fs = require('fs');

const CIAN = [0x26, 0xc6, 0xda];
const VERDE = [0x8b, 0xc3, 0x4a];
const W = 7;                 // grosor del trazo, en unidades del viewBox de 100

/* Mismo trazado que el SVG. La curva se aproxima por una polilínea. */
function bezier(p0, c0, c1, p1, pasos) {
  const pts = [];
  for (let i = 0; i <= pasos; i++) {
    const t = i / pasos, u = 1 - t;
    pts.push([
      u * u * u * p0[0] + 3 * u * u * t * c0[0] + 3 * u * t * t * c1[0] + t * t * t * p1[0],
      u * u * u * p0[1] + 3 * u * u * t * c0[1] + 3 * u * t * t * c1[1] + t * t * t * p1[1]
    ]);
  }
  return pts;
}

function segmentos(pts, color, cap) {
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    out.push({ a: pts[i], b: pts[i + 1], color: color, cap: cap });
  }
  return out;
}

const TRAZOS = [].concat(
  segmentos([[28, 22], [28, 78]], CIAN, 'square'),
  segmentos([[28, 22], [62, 22]], CIAN, 'square'),
  segmentos([[45, 34], [45, 78]], VERDE, 'square'),
  segmentos(bezier([45, 34], [68, 34], [68, 58], [45, 58], 24), VERDE, 'round'),
  segmentos([[50, 56], [72, 78]], VERDE, 'square')
);

/* ¿El punto cae dentro del trazo? Devuelve su color, o null. */
function colorEn(px, py) {
  const r = W / 2;
  for (let i = TRAZOS.length - 1; i >= 0; i--) {
    const s = TRAZOS[i];
    const dx = s.b[0] - s.a[0], dy = s.b[1] - s.a[1];
    const len = Math.hypot(dx, dy);
    if (len < 1e-9) continue;
    const ux = dx / len, uy = dy / len;
    const vx = px - s.a[0], vy = py - s.a[1];
    const t = vx * ux + vy * uy;             // avance a lo largo del trazo
    const perp = Math.abs(vx * uy - vy * ux); // distancia perpendicular
    if (perp > r) continue;
    if (s.cap === 'square') {
      if (t >= -r && t <= len + r) return s.color;
    } else {
      if (t >= 0 && t <= len) return s.color;
      if (Math.hypot(px - s.a[0], py - s.a[1]) <= r) return s.color;
      if (Math.hypot(px - s.b[0], py - s.b[1]) <= r) return s.color;
    }
  }
  return null;
}

function crc32(buf) {
  const table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function png(size, path) {
  const N = 4;                       // supermuestreo 4x4 para bordes suaves
  const rows = [];
  for (let y = 0; y < size; y++) {
    const row = Buffer.alloc(1 + size * 4);
    row[0] = 0;                      // filtro none
    for (let x = 0; x < size; x++) {
      let hits = 0, r = 0, g = 0, b = 0;
      for (let sy = 0; sy < N; sy++) {
        for (let sx = 0; sx < N; sx++) {
          const c = colorEn((x + (sx + 0.5) / N) * 100 / size,
                            (y + (sy + 0.5) / N) * 100 / size);
          if (c) { hits++; r += c[0]; g += c[1]; b += c[2]; }
        }
      }
      const o = 1 + x * 4;
      if (hits) {
        row[o] = Math.round(r / hits);
        row[o + 1] = Math.round(g / hits);
        row[o + 2] = Math.round(b / hits);
        row[o + 3] = Math.round(hits / (N * N) * 255);
      }
    }
    rows.push(row);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6;          // 8 bits por canal, RGBA
  const out = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(Buffer.concat(rows), { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ]);
  fs.writeFileSync(path, out);
  console.log(path, out.length, 'bytes');
}

const dir = process.argv[2] || 'icons';
png(192, dir + '/icon-192.png');
png(512, dir + '/icon-512.png');
