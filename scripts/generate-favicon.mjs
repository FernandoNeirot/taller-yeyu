import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const LOGO = join(ROOT, "public", "brand", "logo-dark.png");
const BACKGROUND = { r: 19, g: 19, b: 19, alpha: 1 };

async function squarePng(size) {
  const padded = Math.round(size * 0.82);
  const logo = await sharp(LOGO)
    .resize(padded, padded, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: BACKGROUND,
    },
  })
    .composite([{ input: logo, gravity: "centre" }])
    .png()
    .toBuffer();
}

function pngsToIco(images) {
  const count = images.length;
  const headerSize = 6 + 16 * count;
  let offset = headerSize;
  const entries = images.map((data) => {
    const entry = { data, offset };
    offset += data.length;
    return entry;
  });

  const buf = Buffer.alloc(offset);
  buf.writeUInt16LE(0, 0);
  buf.writeUInt16LE(1, 2);
  buf.writeUInt16LE(count, 4);

  let cursor = 6;
  images.forEach((data, index) => {
    const size = [16, 32, 48][index];
    buf.writeUInt8(size, cursor);
    buf.writeUInt8(size, cursor + 1);
    buf.writeUInt8(0, cursor + 2);
    buf.writeUInt8(0, cursor + 3);
    buf.writeUInt16LE(1, cursor + 4);
    buf.writeUInt16LE(32, cursor + 6);
    buf.writeUInt32LE(data.length, cursor + 8);
    buf.writeUInt32LE(entries[index].offset, cursor + 12);
    data.copy(buf, entries[index].offset);
    cursor += 16;
  });

  return buf;
}

const png16 = await squarePng(16);
const png32 = await squarePng(32);
const png48 = await squarePng(48);
const ico = pngsToIco([png16, png32, png48]);

await writeFile(join(ROOT, "src", "app", "favicon.ico"), ico);
await writeFile(join(ROOT, "public", "favicon.ico"), ico);
await writeFile(join(ROOT, "public", "favicon-48x48.png"), png48);

console.log("Generated favicon.ico (16/32/48) and favicon-48x48.png");
