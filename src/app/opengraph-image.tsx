import { ImageResponse } from "next/og";
import { siteConfig } from "@/data/site-config";

export const dynamic = "force-static";
export const alt = siteConfig.seo.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
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
          padding: 48,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#ffffff",
            border: "6px solid #000000",
            borderRadius: 5,
            boxShadow: "16px 16px 0 #000000",
            gap: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 110,
              height: 110,
              backgroundColor: "#76fbd9",
              border: "5px solid #000000",
              borderRadius: 5,
              boxShadow: "8px 8px 0 #000000",
              fontSize: 56,
              fontWeight: 900,
              color: "#000000",
            }}
          >
            {siteConfig.initials}
          </div>
          <div
            style={{
              fontSize: 76,
              fontWeight: 900,
              color: "#000000",
              textAlign: "center",
            }}
          >
            {siteConfig.name}
          </div>
          <div
            style={{
              display: "flex",
              backgroundColor: "#fde047",
              border: "4px solid #000000",
              borderRadius: 5,
              boxShadow: "6px 6px 0 #000000",
              padding: "12px 28px",
              fontSize: 36,
              fontWeight: 700,
              color: "#000000",
            }}
          >
            Software Engineer · Backend &amp; Security
          </div>
          <div style={{ fontSize: 30, color: "#000000" }}>thegeorge.in</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
