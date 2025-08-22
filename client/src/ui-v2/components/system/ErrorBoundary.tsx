import React from "react";

type Props = { fallback?: React.ReactNode; children: React.ReactNode };

export class ErrorBoundary extends React.Component<Props, { error?: Error }> {
  constructor(props: Props) {
    super(props);
    this.state = { error: undefined };
  }
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log for debugging; keep in console only
    // You can wire this to Sentry later.
    // eslint-disable-next-line no-console
    console.error("[ErrorBoundary]", error, info);
  }
  render() {
    if (this.state.error) return this.props.fallback ?? null;
    return this.props.children;
  }
}

export function CrashScreen({ title = "Something went wrong", hint }: { title?: string; hint?: string }) {
  return (
    <div className="ui-v2 p-6">
      <div className="max-w-xl mx-auto">
        <div className="rounded-lg border border-white/10 bg-black/30 p-5">
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-sm opacity-70 mt-2">
            Check the browser console for the full stack trace. {hint ? `Hint: ${hint}` : ""}
          </p>
        </div>
      </div>
    </div>
  );
}