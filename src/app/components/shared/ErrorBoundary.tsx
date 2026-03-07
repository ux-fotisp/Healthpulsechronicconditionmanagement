import React, { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { C, T, L } from "../../design/tokens";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * HealthPulse · Error Boundary
 * ═════════════════════════════
 * Catches render-time exceptions in any child tree and presents
 * a recovery UI with "Try Again" + "Go Home" actions.
 * WCAG 2.1 AA compliant · Muted Healing Palette.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary] Caught error:", error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            background: C.shell,
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            className="rounded-2xl overflow-hidden w-full"
            style={{
              maxWidth: L.maxWidth,
              background: C.bg,
              border: `1px solid ${C.alertBorder}`,
            }}
          >
            {/* Header */}
            <div
              className="flex items-center gap-3 px-5 py-4"
              style={{
                background: C.alertLight,
                borderBottom: `1px solid ${C.alertBorder}`,
              }}
            >
              <div
                className="flex items-center justify-center rounded-xl"
                style={{
                  width: 44,
                  height: 44,
                  background: "rgba(212,163,115,0.2)",
                  border: `1px solid ${C.alertBorder}`,
                }}
              >
                <AlertTriangle size={20} color={C.alert} />
              </div>
              <div>
                <h2
                  style={{
                    color: C.text,
                    fontSize: T.h3,
                    fontWeight: 700,
                    fontFamily: "inherit",
                    margin: 0,
                  }}
                >
                  {this.props.fallbackTitle ?? "Something went wrong"}
                </h2>
                <p
                  style={{
                    color: C.textSub,
                    fontSize: T.caption,
                    fontFamily: "inherit",
                    margin: 0,
                  }}
                >
                  An unexpected error occurred
                </p>
              </div>
            </div>

            {/* Error details */}
            <div className="px-5 py-4">
              <p
                style={{
                  color: C.textSub,
                  fontSize: T.bodySm,
                  fontFamily: "inherit",
                  lineHeight: 1.6,
                  marginBottom: 16,
                }}
              >
                This page couldn't load properly. Your data is safe — try
                refreshing or return to the dashboard.
              </p>

              {this.state.error && (
                <div
                  className="rounded-xl px-4 py-3 mb-4"
                  style={{
                    background: C.secondaryLight,
                    border: `1px solid ${C.secondaryBorder}`,
                  }}
                >
                  <p
                    style={{
                      color: C.textMuted,
                      fontSize: T.nano,
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      fontFamily: "inherit",
                      marginBottom: 4,
                    }}
                  >
                    ERROR DETAILS
                  </p>
                  <p
                    style={{
                      color: C.textSub,
                      fontSize: T.micro,
                      fontFamily: "monospace",
                      lineHeight: 1.5,
                      wordBreak: "break-word",
                    }}
                  >
                    {this.state.error.message}
                  </p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={this.handleRetry}
                  className="flex-1 rounded-xl flex items-center justify-center gap-2 transition-all"
                  style={{
                    background: "#4A4D4C",
                    border: "1px solid rgba(142,175,157,0.4)",
                    color: "#FFFFFF",
                    fontSize: T.bodySm,
                    fontWeight: 700,
                    fontFamily: "inherit",
                    minHeight: L.touch,
                  }}
                  aria-label="Try loading this page again"
                >
                  <RefreshCw size={15} color="#FFFFFF" />
                  Try Again
                </button>
                <button
                  onClick={this.handleGoHome}
                  className="rounded-xl px-5 flex items-center justify-center gap-2 transition-all"
                  style={{
                    background: "#4A4D4C",
                    border: "1px solid rgba(142,175,157,0.4)",
                    color: "#FFFFFF",
                    fontSize: T.bodySm,
                    fontWeight: 700,
                    fontFamily: "inherit",
                    minHeight: L.touch,
                  }}
                  aria-label="Return to the home dashboard"
                >
                  <Home size={15} color="#FFFFFF" />
                  Home
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}