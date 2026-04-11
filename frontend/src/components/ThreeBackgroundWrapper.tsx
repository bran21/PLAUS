"use client";
import dynamic from "next/dynamic";
import React, { useState, useEffect } from "react";

const ThreeBackground = dynamic(() => import("./ThreeBackground"), {
  ssr: false,
});

function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

export default function ThreeBackgroundWrapper() {
  const [supported, setSupported] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!isWebGLAvailable()) {
      setSupported(false);
      console.warn("[Plaus] WebGL not available — using CSS fallback background");
    }
  }, []);

  if (!supported || hasError) {
    // CSS-only animated fallback background
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: -1,
          background:
            "radial-gradient(ellipse at 30% 20%, rgba(0, 214, 143, 0.06) 0%, transparent 50%), " +
            "radial-gradient(ellipse at 70% 80%, rgba(124, 58, 237, 0.04) 0%, transparent 50%), " +
            "#050b14",
          pointerEvents: "none",
        }}
      />
    );
  }

  return (
    <ErrorBoundary onError={() => setHasError(true)}>
      <ThreeBackground />
    </ErrorBoundary>
  );
}

/** Simple error boundary to catch WebGL/Three.js crashes */
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; onError: () => void },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; onError: () => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.warn("[Plaus] Three.js background failed, using CSS fallback:", error.message);
    this.props.onError();
  }

  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}
