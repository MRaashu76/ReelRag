import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
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
          background: "#000000",
          borderRadius: "8px",
        }}
      >
        {/* Instagram rounded square border */}
        <div
          style={{
            position: "absolute",
            width: "26px",
            height: "26px",
            borderRadius: "7px",
            border: "2.5px solid transparent",
            background:
              "linear-gradient(#000,#000) padding-box, linear-gradient(135deg, #FF0000, #E1306C) border-box",
          }}
        />
        {/* Instagram top-right dot */}
        <div
          style={{
            position: "absolute",
            top: "5px",
            right: "5px",
            width: "4px",
            height: "4px",
            borderRadius: "50%",
            background: "#E1306C",
          }}
        />
        {/* YouTube play triangle */}
        <div
          style={{
            width: 0,
            height: 0,
            borderTop: "7px solid transparent",
            borderBottom: "7px solid transparent",
            borderLeft: "12px solid white",
            marginLeft: "2px",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
