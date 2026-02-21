import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") ?? "Document Tools That Work";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #ffffff 0%, #f8f7f4 100%)",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Red accent blob */}
        <div
          style={{
            position: "absolute",
            top: "-80px",
            right: "-80px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "rgba(225,6,0,0.07)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-60px",
            left: "-60px",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: "rgba(225,6,0,0.05)",
          }}
        />

        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "14px",
              background: "#E10600",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: "16px",
            }}
          >
            <span style={{ color: "#fff", fontSize: "22px", fontWeight: 900 }}>
              df
            </span>
          </div>
          <span style={{ fontSize: "32px", fontWeight: 900, color: "#111111" }}>
            doc<span style={{ color: "#E10600" }}>focal</span>
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: "56px",
            fontWeight: 900,
            color: "#111111",
            textAlign: "center",
            lineHeight: 1.1,
            maxWidth: "900px",
            marginBottom: "24px",
            letterSpacing: "-2px",
          }}
        >
          {title}
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: "22px",
            color: "#6B7280",
            textAlign: "center",
            maxWidth: "700px",
          }}
        >
          Write · Edit PDFs · Build CVs · Convert · Publish EPUB
        </div>

        {/* Feature pills */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "40px",
          }}
        >
          {["Free to start", "Browser-based", "No install needed"].map(
            (label) => (
              <div
                key={label}
                style={{
                  padding: "8px 20px",
                  borderRadius: "999px",
                  border: "1.5px solid rgba(225,6,0,0.25)",
                  background: "rgba(225,6,0,0.05)",
                  color: "#E10600",
                  fontSize: "15px",
                  fontWeight: 600,
                }}
              >
                {label}
              </div>
            )
          )}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
