"use client";

export default function AppError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="not-found-page" role="alert">
      <p className="eyebrow">WORKSPACE ERROR</p>
      <h1>We couldn't load this view.</h1>
      <p>Your demo records are still local to this browser. Try loading the page again.</p>
      <button className="button button-primary" type="button" onClick={reset}>Try again</button>
    </main>
  );
}
