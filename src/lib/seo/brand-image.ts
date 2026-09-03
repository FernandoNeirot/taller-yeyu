import { readFile } from "node:fs/promises";
import { join } from "node:path";

export async function getLogoDataUri() {
  const logo = await readFile(
    join(process.cwd(), "public", "brand", "logo-dark.png"),
  );

  return `data:image/png;base64,${logo.toString("base64")}`;
}
