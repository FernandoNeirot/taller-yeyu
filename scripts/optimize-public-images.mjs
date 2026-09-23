import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");

async function writeWebp(input, output, width, quality) {
  await mkdir(path.dirname(output), { recursive: true });
  const info = await sharp(input)
    .resize(width, null, { withoutEnlargement: true })
    .webp({ quality })
    .toFile(output);
  console.log(
    `${path.relative(root, output)} → ${(info.size / 1024).toFixed(1)} KB`,
  );
}

const processSource =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDXdThLsiPpi2lVmLN1j8tOrCnXRL_ZFl28S7bR094mQyg7AyJc8yc6KCZeKruPW-hCclEJDfgHa4XRUfvMxQiZF0AUlJDx-zEqvsTc0TQpxHB3ZLE9gCTd2AO_Udisj6vHKN6kaspdWYp8ikTdIBf4_DSY1EUHqiq5geu2py4RWsa11AiilZ9lSMnKP8LobiWi90MQuJTwGsGqJjQ9xFFtJkQMp1-dtmVwXuSkUuG0Wf05Zy4TmC__PQbOd3h2VjGnaA";

const processResponse = await fetch(processSource);
if (!processResponse.ok) {
  throw new Error(`No se pudo bajar la imagen de proceso (${processResponse.status})`);
}

const processBuffer = Buffer.from(await processResponse.arrayBuffer());

await Promise.all([
  writeWebp(
    path.join(publicDir, "principal.png"),
    path.join(publicDir, "principal.webp"),
    1920,
    72,
  ),
  writeWebp(
    path.join(publicDir, "principal.png"),
    path.join(publicDir, "principal-mobile.webp"),
    480,
    36,
  ),
  writeWebp(
    path.join(publicDir, "brand", "logo-dark.png"),
    path.join(publicDir, "brand", "logo-dark.webp"),
    416,
    82,
  ),
  writeWebp(
    path.join(publicDir, "brand", "logo-dark.png"),
    path.join(publicDir, "brand", "logo-sm.webp"),
    240,
    62,
  ),
  writeWebp(processBuffer, path.join(publicDir, "proceso.webp"), 1200, 72),
]);
