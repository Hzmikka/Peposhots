import { ImageResponse } from "next/og";

export const alt =
  "Celeste Web Studio. Una web que ayuda a elegir y reservar. Proyecto: PepoShots.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const steps = ["Elige el servicio", "Conoce el precio", "Consulta tu fecha"];

export default function ProjectShareImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          position: "relative",
          width: "100%",
          height: "100%",
          padding: "48px 56px",
          background: "linear-gradient(120deg, #effaff 0%, #d8f1ff 65%, #b6e8f4 100%)",
          color: "#12374f",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 48,
            left: 56,
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 48,
              height: 48,
              borderRadius: 24,
              background: "#166a9b",
              color: "#ffffff",
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            C
          </div>
          <span style={{ fontSize: 28, fontWeight: 700 }}>
            Celeste Web Studio
          </span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            position: "absolute",
            top: 160,
            left: 56,
            width: 640,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 64,
              fontWeight: 700,
              lineHeight: 1.06,
              letterSpacing: -2,
            }}
          >
            Una web que ayuda a elegir y reservar.
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 28,
              fontSize: 25,
              color: "#426c82",
            }}
          >
            Proyecto: PepoShots
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 8,
              fontSize: 23,
              color: "#426c82",
            }}
          >
            Servicios para eventos en Miami
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            position: "absolute",
            top: 173,
            right: 56,
            width: 360,
            padding: "30px 26px",
            borderRadius: 24,
            border: "1px solid #b2d8e9",
            background: "#ffffff",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 17,
              letterSpacing: 2,
              color: "#527a8f",
              marginBottom: 25,
            }}
          >
            RECORRIDO DE LA WEB
          </div>
          {steps.map((step, index) => (
            <div
              key={step}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                marginTop: index === 0 ? 0 : 24,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 38,
                  height: 38,
                  flexShrink: 0,
                  borderRadius: 19,
                  background: "#d9f2fc",
                  color: "#166a9b",
                  fontSize: 21,
                  fontWeight: 700,
                }}
              >
                {index + 1}
              </div>
              <span style={{ fontSize: 24, fontWeight: 700 }}>{step}</span>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            position: "absolute",
            left: 56,
            bottom: 48,
            fontSize: 22,
            color: "#426c82",
          }}
        >
          Comprender para orientar.
        </div>
      </div>
    ),
    size,
  );
}
