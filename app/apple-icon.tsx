import { ImageResponse } from "next/og";
import { getLogoDataUri } from "@/lib/seo/brand-image";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default async function AppleIcon() {
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
        }}
      >
        <img
          alt=""
          src={logoSrc}
          width={156}
          height={147}
          style={{ objectFit: "contain" }}
        />
      </div>
    ),
    { ...size },
  );
}
