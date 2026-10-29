import Link from "next/link";

export default function NotFound() {
  return (
    <main className="lost">
      <h1>404</h1>
      <p>This page was moved to a parallel universe. Our cat is out looking for it. It took snacks. It&apos;ll be a while.</p>
      <div className="btn-row" style={{ justifyContent: "center" }}>
        <Link href="/" className="btn btn--lime">
          Back to the story
        </Link>
        <Link href="/shop" className="btn btn--ghost">
          Browse the archive
        </Link>
      </div>
    </main>
  );
}
