"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";

// Last resort when the root layout itself fails. It replaces the whole
// document, so it gets no global CSS or theme: the few styles it needs are
// inline and follow the device's light/dark setting.
const styles = `
  :root { color-scheme: light dark; }
  body {
    margin: 0;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
    background: #f7f8f9;
    color: #172b4d;
  }
  .card {
    max-width: 420px;
    width: 100%;
    padding: 32px;
    border: 1px solid #dfe1e6;
    border-radius: 16px;
    background: #ffffff;
    text-align: center;
  }
  h1 { margin: 0 0 8px; font-size: 22px; }
  p { margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #44546f; }
  button {
    cursor: pointer;
    border: 0;
    border-radius: 12px;
    padding: 10px 18px;
    font-size: 14px;
    font-weight: 600;
    color: #ffffff;
    background: #0c66e4;
  }
  small { display: block; margin-top: 16px; font-size: 12px; color: #626f86; }
  @media (prefers-color-scheme: dark) {
    body { background: #0f1115; color: #e6e9ef; }
    .card { background: #22272b; border-color: #3b444c; }
    p { color: #b6c2cf; }
    small { color: #8c9bab; }
    button { background: #579dff; color: #0f1115; }
  }
`;

export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error("GLOBAL_ERROR:", error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <title>Something went wrong · Flowboard</title>
        <style dangerouslySetInnerHTML={{ __html: styles }} />

        <div className="card">
          <h1>Something went wrong</h1>
          <p>Flowboard could not load. Your data is safe. Please try again.</p>
          <button type="button" onClick={() => retry()}>
            Try again
          </button>
          {error.digest && <small>Error reference: {error.digest}</small>}
        </div>
      </body>
    </html>
  );
}
