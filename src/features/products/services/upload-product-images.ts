import sharp from "sharp";
import { getAdminBucket } from "@/lib/firebase-admin";

const MAX_IMAGE_BYTES = 50 * 1024;
const MAX_IMAGES = 3;

export async function compressToWebp(buffer: Buffer) {
  let width = 1200;
  let quality = 80;
  let result = await sharp(buffer)
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .webp({ quality })
    .toBuffer();

  while (result.length > MAX_IMAGE_BYTES && (quality > 25 || width > 360)) {
    if (quality > 25) {
      quality -= 10;
    } else {
      width = Math.round(width * 0.8);
    }

    result = await sharp(buffer)
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality })
      .toBuffer();
  }

  if (result.length > MAX_IMAGE_BYTES) {
    throw new Error("La imagen no pudo comprimirse a menos de 50KB.");
  }

  return result;
}

export async function uploadProductImageBuffers(
  buffers: Buffer[],
  slug: string,
) {
  if (buffers.length > MAX_IMAGES) {
    throw new Error("Podés subir como máximo 3 fotos.");
  }

  const bucket = getAdminBucket();
  const urls: string[] = [];

  for (const source of buffers) {
    const webp = await compressToWebp(source);
    const path = `talleryeu-productos/${slug}/${crypto.randomUUID()}.webp`;
    const stored = bucket.file(path);
    const token = crypto.randomUUID();

    await stored.save(webp, {
      contentType: "image/webp",
      resumable: false,
      metadata: {
        cacheControl: "public, max-age=31536000",
        metadata: {
          firebaseStorageDownloadTokens: token,
        },
      },
    });

    const encoded = encodeURIComponent(path);
    urls.push(
      `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encoded}?alt=media&token=${token}`,
    );
  }

  return urls;
}

function storagePathFromUrl(url: string) {
  try {
    const parsed = new URL(url);
    const encodedPath = parsed.pathname.split("/o/")[1];
    if (!encodedPath) return null;
    return decodeURIComponent(encodedPath);
  } catch {
    return null;
  }
}

export async function deleteProductImages(urls: string[]) {
  const bucket = getAdminBucket();

  await Promise.all(
    urls.filter(Boolean).map(async (url) => {
      const path = storagePathFromUrl(url);
      if (!path) return;

      try {
        await bucket.file(path).delete({ ignoreNotFound: true });
      } catch (error) {
        console.error("No se pudo borrar la imagen del producto.", path, error);
      }
    }),
  );
}
