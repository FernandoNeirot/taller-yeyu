import { ImageResponse } from "next/og";
import { getLogoDataUri } from "@/lib/seo/brand-image";
import { siteConfig } from "@/lib/seo/site";

export const alt = siteConfig.name;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const logoSrc = await getLogoDataUri();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#131313",
          border: "24px solid #a0522d",
        }}
      >
        <img
          alt=""
          src={logoSrc}
          width={420}
          height={396}
          style={{ objectFit: "contain" }}
        />
      </div>
    ),
    { ...size },
  );
}
