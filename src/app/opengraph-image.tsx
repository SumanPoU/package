import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt =
  "itzsa — React DataTable, Nepali UI & TypeScript npm packages";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 64,
        background: "#0b0b0b",
        color: "#f1efe8",
        fontFamily: "ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 10,
            background: "#1d9e75",
            color: "#04342c",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
            fontWeight: 600,
          }}
        >
          i
        </div>
        <div style={{ fontSize: 36, fontWeight: 600, letterSpacing: -1 }}>
          itzsa
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div
          style={{
            fontSize: 52,
            fontWeight: 600,
            letterSpacing: -1.5,
            lineHeight: 1.1,
            maxWidth: 980,
          }}
        >
          React DataTable & Nepal-ready TypeScript packages
        </div>
        <div style={{ fontSize: 24, color: "#888780", maxWidth: 900 }}>
          @itzsa/table · datepicker · nepal-pay · page-builder · more
        </div>
      </div>
      <div style={{ fontSize: 22, color: "#5f5e5a" }}>
        itzsa.acharya-suman.com.np · npm @itzsa
      </div>
    </div>,
    { ...size },
  );
}
