import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found-page">
      <p className="eyebrow">404 · PAGE NOT FOUND</p>
      <h1>This page isn't in your workspace.</h1>
      <p>Check the address, or return to the MediPath clinic workspace.</p>
      <Link className="button button-primary" href="/">Back to MediPath</Link>
    </main>
  );
}
