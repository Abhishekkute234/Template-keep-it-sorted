import Link from "next/link";
import { categories } from "@/lib/data";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__grid">
        <div>
          <Logo size={56} />
          <p className="eyebrow" style={{ marginTop: 16 }}>Keep It Sorted</p>
          <p className="footer__blurb">
            Premium UI kits, coded website templates and app templates, handcrafted by humans and delivered with a straight face and dark sunglasses.
          </p>
        </div>
        <div>
          <p className="eyebrow">Marketplace</p>
          <ul>
            {categories.slice(0, 5).map((c) => (
              <li key={c.slug}>
                <Link href={`/shop?c=${c.slug}`}>{c.name}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow">More galaxies</p>
          <ul>
            {categories.slice(5).map((c) => (
              <li key={c.slug}>
                <Link href={`/shop?c=${c.slug}`}>{c.name}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow">Company</p>
          <ul>
            <li><Link href="/#chapter-5">Infinite Key</Link></li>
            <li><Link href="/#chapter-4">Become a creator</Link></li>
            <li><Link href="/shop">Licenses</Link></li>
            <li><Link href="/oops">Careers (cats welcome)</Link></li>
          </ul>
        </div>
      </div>
      <div className="footer__word" aria-hidden>
        KEEP IT SORTED
      </div>
      <div className="footer__base">
        <span>© 2026 Keep It Sorted. All pixels reserved, neatly.</span>
        <span>Made with Next.js, three.js & an alarming amount of coffee.</span>
      </div>
    </footer>
  );
}
