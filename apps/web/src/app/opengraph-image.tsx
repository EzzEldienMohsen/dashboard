import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#4f46e5",
        gap: 32,
      }}
    >
      <div
        style={{
          width: 96,
          height: 96,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#eef2ff",
          borderRadius: "50%",
          color: "#4f46e5",
          fontSize: 36,
          fontWeight: 700,
        }}
      >
        ED
      </div>
      <div
        style={{
          color: "#fff",
          fontSize: 64,
          fontWeight: 800,
          letterSpacing: "-0.02em",
          textAlign: "center",
        }}
      >
        School Dashboard
      </div>
      <div
        style={{
          color: "#c7d2fe",
          fontSize: 28,
          textAlign: "center",
        }}
      >
        Manage classes, students, and staff.
      </div>
    </div>,
    { ...size },
  );
}
