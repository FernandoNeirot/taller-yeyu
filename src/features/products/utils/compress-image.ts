export const MAX_PRODUCT_IMAGES = 3;
export const MAX_IMAGE_BYTES = 50 * 1024;

export async function compressImageToWebp(file: File) {
  const bitmap = await createImageBitmap(file);
  let width = Math.min(bitmap.width, 1200);
  let quality = 0.8;
  let blob: Blob | null = null;

  while (width >= 360) {
    const height = Math.round((bitmap.height / bitmap.width) * width);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("No se pudo procesar la imagen.");
    }
    context.drawImage(bitmap, 0, 0, width, height);

    blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/webp", quality);
    });

    if (blob && blob.size <= MAX_IMAGE_BYTES) {
      break;
    }

    if (quality > 0.35) {
      quality -= 0.1;
    } else {
      width = Math.round(width * 0.8);
      quality = 0.7;
    }
  }

  bitmap.close();

  if (!blob || blob.size > MAX_IMAGE_BYTES) {
    throw new Error("La imagen no pudo comprimirse a menos de 50KB.");
  }

  return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".webp", {
    type: "image/webp",
  });
}

export async function fileToBase64(file: File) {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}
