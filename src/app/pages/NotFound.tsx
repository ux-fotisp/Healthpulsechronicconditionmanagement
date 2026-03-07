import { useNavigate } from "react-router";
import { Home, ArrowLeft } from "lucide-react";

const C = {
  shell: "#4A4D4C",
  bg: "#FBFBFB",
  text: "#1E293B",
  textSub: "#475569",
  textMuted: "#94A3B8",
  primary: "#8EAF9D",
  primaryLight: "rgba(142,175,157,0.12)",
  border: "rgba(142,175,157,0.25)",
};

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div
      style={{ background: C.shell, minHeight: "100vh" }}
      className="flex items-center justify-center px-6"
    >
      <div
        className="rounded-2xl w-full text-center p-8"
        style={{
          maxWidth: 400,
          background: C.bg,
          border: `1px solid ${C.border}`,
        }}
      >
        <p
          style={{
            color: C.primary,
            fontSize: 64,
            fontWeight: 800,
            lineHeight: 1,
            fontFamily: "inherit",
          }}
        >
          404
        </p>
        <h1
          style={{
            color: C.text,
            fontSize: 22,
            fontWeight: 700,
            fontFamily: "inherit",
            marginTop: 8,
          }}
        >
          Page Not Found
        </h1>
        <p
          style={{
            color: C.textSub,
            fontSize: 14,
            fontFamily: "inherit",
            marginTop: 8,
            lineHeight: 1.6,
          }}
        >
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex gap-3 mt-6 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="rounded-xl flex items-center justify-center gap-2 px-5 transition-all"
            style={{
              minHeight: 48,
              background: C.primaryLight,
              border: `1px solid ${C.border}`,
              color: C.text,
              fontSize: 14,
              fontWeight: 700,
              fontFamily: "inherit",
            }}
            aria-label="Go back to previous page"
          >
            <ArrowLeft size={15} />
            Go Back
          </button>
          <button
            onClick={() => navigate("/")}
            className="rounded-xl flex items-center justify-center gap-2 px-5 transition-all"
            style={{
              minHeight: 48,
              background: C.primary,
              border: `1px solid ${C.border}`,
              color: C.shell,
              fontSize: 14,
              fontWeight: 700,
              fontFamily: "inherit",
            }}
            aria-label="Return to home dashboard"
          >
            <Home size={15} />
            Home
          </button>
        </div>
      </div>
    </div>
  );
}