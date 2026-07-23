import { ImageResponse } from "next/og";
import { siteConfig } from "@/data/site-config";

export const dynamic = "force-static";
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#76fbd9",
          border: "4px solid #000000",
          fontSize: 30,
          fontWeight: 900,
          color: "#000000",
        }}
      >
        {siteConfig.initials}
      </div>
    ),
    { ...size }
  );
}
