"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { categories, plans, testimonials, totalProducts, trending } from "@/lib/data";
import { chapters } from "@/lib/chapters";
import { say, toast, useStory } from "@/lib/store";
import { enterVR } from "@/components/ui/Chrome";
import { Footer } from "@/components/ui/Footer";
import { useApp } from "@/components/providers/AppProvider";

function Kinetic({ lines, as: Tag = "h2", className = "" }: { lines: (string | ReactNode)[]; as?: "h1" | "h2"; className?: string }) {
  let i = 0;
  return (
    <Tag className={`kinetic ${className}`}>
      {lines.map((line, li) => (
        <span className="kinetic__line" key={li}>
          {typeof line === "string"
            ? line.split(" ").map((word, wi) => (
                <span key={wi}>
                  <span className="w">
                    <span className="w__in" style={{ ["--i" as string]: i++ }}>
                      {word}
                    </span>
                  </span>{" "}
                </span>
              ))
            : (
                <span className="w">
                  <span className="w__in" style={{ ["--i" as string]: i++ }}>
                    {line}
                  </span>
                </span>
              )}
        </span>
      ))}
    </Tag>
  );
}

function Chapter({ index, children, variant = "corner" }: { index: number; children: ReactNode; variant?: string }) {
  const active = useStory((s) => s.chapter) === index;
  const c = chapters[index];
  return (
    <section id={`chapter-${index}`} data-chapter={index} className={`chapter chapter--${variant} ${active ? "is-active" : ""}`}>
      <div className="chapter__stick">
        {index > 0 && (
          <p className="chapter__eyebrow">
            <span>Chapter {c.numeral}</span>
            <i />
            <span>{c.label}</span>
          </p>
        )}
        {children}
      </div>
    </section>
  );
}

function Ticker() {
  const items = categories.map((c) => c.name);
  return (
    <div className="ticker" aria-hidden>
      <div className="ticker__track">
        {[...items, ...items].map((t, i) => (
          <span key={i}>
            {t} <em>✦</em>
          </span>
        ))}
      </div>
    </div>
  );
}

function PlanButton({ id, featured, purchasable }: { id: string; featured: boolean; purchasable: boolean }) {
  const { addToCart, inCart, setCartOpen } = useApp();
  const cls = `btn ${featured ? "btn--lime" : "btn--ghost"} btn--block`;
  if (!purchasable)
    return (
      <Link href="/shop" className={cls}>
        Browse items
      </Link>
    );
  const key = `plan:${id}`;
  return inCart(key) ? (
    <button className="btn btn--ghost btn--block" onClick={() => setCartOpen(true)}>
      In your cart · View
    </button>
  ) : (
    <button className={cls} onClick={() => addToCart(key)}>
      {featured ? "Get the Infinite Key" : "Add to cart"}
    </button>
  );
}

function Newsletter() {
  const [sent, setSent] = useState(false);
  return (
    <form
      className="newsletter"
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
        toast("You're in! (Demo mode: nothing was actually sent.)");
      }}
    >
      <label htmlFor="nl-email" className="sr-only">
        Email
      </label>
      <input id="nl-email" type="email" required placeholder={sent ? "Welcome aboard, legend." : "your@email.com"} disabled={sent} />
      <button className="btn btn--lime" disabled={sent}>
        {sent ? "Subscribed ✓" : "Send me freebies"}
      </button>
    </form>
  );
}

export function Overlay() {
  return (
    <main className="overlay">
      {/* PROLOGUE */}
      <Chapter index={0} variant="hero">
        <div className="hero__top">
          <p className="eyebrow">Keep It Sorted — a story in seven chapters</p>
          <p className="eyebrow eyebrow--right">{totalProducts.toLocaleString("en-US")} templates · 1,200+ creators</p>
        </div>
        <div className="hero__bottom">
          <Kinetic as="h1" className="display" lines={["Once upon a deadline,", "a designer needed a miracle."]} />
          <div className="hero__aside">
            <p className="lede">
              Premium <b>UI kits</b>, coded <b>website templates</b> and <b>app templates</b>, told as a story you can scroll, click, and even step inside with a VR headset.
            </p>
            <div className="btn-row">
              <a href="#chapter-1" className="btn btn--lime">
                Begin the story ↓
              </a>
              <button className="btn btn--ghost" onClick={enterVR}>
                ◉◉ Step into VR
              </button>
              <Link href="/shop" className="btn btn--link">
                Skip to the shop →
              </Link>
            </div>
          </div>
        </div>
        <Ticker />
      </Chapter>

      {/* I — THE PROBLEM */}
      <Chapter index={1}>
        <div className="copy">
          <Kinetic lines={["It was 2:47 AM.", "The client said", <>“make it <span className="hl hl--pink">pop</span>.”</>]} />
          <p className="lede">
            Fonts were fighting. Grids were crying. Somebody named a file <code>final_v9_REAL.fig</code>. Our hero needed help — the kind that comes pre-built, pixel-perfect and licensed.
          </p>
          <p className="hint">
            <span className="hint__dot" /> Hover the floating words to fix them. It's oddly satisfying.
          </p>
        </div>
      </Chapter>

      {/* II — CATEGORIES */}
      <Chapter index={2}>
        <div className="copy">
          <Kinetic lines={["Ten galaxies.", <>Zero <span className="hl">blank canvases</span>.</>]} />
          <p className="lede">Every corner of the marketplace, mapped as a constellation. Click a monolith to warp straight into its category.</p>
          <div className="chips">
            {categories.map((c) => (
              <Link key={c.slug} href={`/shop?c=${c.slug}`} className="chip" style={{ ["--accent" as string]: c.color }}>
                {c.name} <small>{c.count.toLocaleString("en-US")}</small>
              </Link>
            ))}
          </div>
        </div>
      </Chapter>

      {/* III — TRENDING */}
      <Chapter index={3}>
        <div className="copy">
          <Kinetic lines={["The bestsellers", <>everyone <span className="hl hl--blue">pretends</span></>, "they built themselves."]} />
          <p className="lede">
            This week&apos;s most-downloaded templates, kits and dashboards. Hover a frame for the gossip, click it to take it home.
          </p>
          <div className="btn-row">
            <Link href="/shop" className="btn btn--lime">
              Browse all {totalProducts.toLocaleString("en-US")} →
            </Link>
            <Link href={`/product/${trending[0].slug}`} className="btn btn--ghost">
              Today&apos;s #1: {trending[0].name}
            </Link>
          </div>
        </div>
      </Chapter>

      {/* IV — CREATORS */}
      <Chapter index={4}>
        <div className="copy">
          <Kinetic lines={["Behind every pixel", "is a human who", <><span className="hl hl--lime">skipped lunch</span>.</>]} />
          <p className="lede">
            1,200+ independent designers and developers from 60 countries. They keep 70% of every sale. We keep the snacks.
          </p>
          <div className="btn-row">
            <button
              className="btn btn--ghost"
              onClick={() => {
                toast("Creator applications open soon! Practice your best 'thoughtful designer' pose meanwhile.");
                say("A future creator! Quick, someone get them a turtleneck.");
              }}
            >
              Become a creator
            </button>
          </div>
        </div>
      </Chapter>

      {/* V — INFINITE KEY */}
      <Chapter index={5} variant="pricing">
        <div className="copy copy--narrow">
          <Kinetic lines={["One key.", "Every door.", <span className="hl hl--lime" key="f">Forever-ish.</span>]} />
          <p className="lede">Unlock all of Keep It Sorted — every kit, template and font, plus everything we drop next.</p>
        </div>
        <div className="plans">
          {plans.map((p) => (
            <article key={p.id} className={`plan ${p.featured ? "plan--featured" : ""}`}>
              {p.featured && <span className="plan__flag">Most loved</span>}
              <h3>{p.name}</h3>
              <p className="plan__price">
                {p.price} <small>{p.period}</small>
              </p>
              <p className="plan__blurb">{p.blurb}</p>
              <ul>
                {p.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <PlanButton id={p.id} featured={!!p.featured} purchasable={p.amount != null} />
            </article>
          ))}
        </div>
      </Chapter>

      {/* VI — REVIEWS */}
      <Chapter index={6}>
        <div className="copy">
          <Kinetic lines={["Word of mouth", <>(and of very <span className="hl hl--pink">happy</span></>, "keyboards)."]} />
          <div className="stats">
            <div>
              <strong>4.9</strong>
              <span>average rating</span>
            </div>
            <div>
              <strong>380K+</strong>
              <span>happy humans</span>
            </div>
            <div>
              <strong>0</strong>
              <span>refunds for bad jokes</span>
            </div>
          </div>
          <p className="hint">
            <span className="hint__dot" /> Hover the stars to leave your own rating. We can take it.
          </p>
        </div>
        <ul className="sr-only">
          {testimonials.map((t) => (
            <li key={t.name}>
              “{t.quote}” — {t.name}, {t.role}
            </li>
          ))}
        </ul>
      </Chapter>

      {/* EPILOGUE */}
      <Chapter index={7} variant="finale">
        <Kinetic className="finale__title" lines={["And they shipped", "happily ever after."]} />
        <div className="finale__bottom">
          <Link href="/shop" className="btn btn--lime btn--xl">
            Step through the portal →
          </Link>
          <div>
            <p className="eyebrow">One free template a week. Plus jokes. Mostly jokes.</p>
            <Newsletter />
          </div>
        </div>
      </Chapter>

      <Footer />
    </main>
  );
}
