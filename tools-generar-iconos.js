/* Genera los iconos PNG de Training FR: monograma FR con barra de pesas,
   fondo transparente (RGBA), sin dependencias externas. */
const zlib = require('zlib');
const fs = require('fs');

const FG = [0x3d, 0xdc, 0x84];

/* Mismas coordenadas que icons/icon.svg, en un lienzo de 64x64 */
const RECTS = [
  [8, 10, 16, 46], [8, 10, 30, 18], [8, 24, 25, 31],              // F
  [36, 10, 44, 46], [36, 10, 58, 18], [36, 24, 58, 31],           // R
  [50, 10, 58, 31], [50, 31, 58, 46],
  [5, 52, 59, 58], [0, 48, 5, 62], [59, 48, 64, 62]               // barra y discos
];

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

/* Cobertura del píxel con supermuestreo 4x4, para bordes suaves */
function cover(x, y, s) {
  const N = 4;
  let hits = 0;
  for (let sy = 0; sy < N; sy++) {
    for (let sx = 0; sx < N; sx++) {
      const px = (x + (sx + 0.5) / N) * 64 / s;
      const py = (y + (sy + 0.5) / N) * 64 / s;
      for (const [x0, y0, x1, y1] of RECTS) {
        if (px >= x0 && px < x1 && py >= y0 && py < y1) { hits++; break; }
      }
    }
  }
  return hits / (N * N);
}

function png(size, path) {
  const rows = [];
  for (let y = 0; y < size; y++) {
    const row = Buffer.alloc(1 + size * 4);
    row[0] = 0;                                   // filtro none
    for (let x = 0; x < size; x++) {
      const a = Math.round(cover(x, y, size) * 255);
      const o = 1 + x * 4;
      row[o] = FG[0]; row[o + 1] = FG[1]; row[o + 2] = FG[2]; row[o + 3] = a;
    }
    rows.push(row);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6;                       // 8 bits, RGBA
  const out = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(Buffer.concat(rows), { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ]);
  fs.writeFileSync(path, out);
  console.log(path, out.length, 'bytes');
}

const dir = process.argv[2];
png(192, dir + '/icon-192.png');
png(512, dir + '/icon-512.png');
