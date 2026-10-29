"use client";

import { useEffect, useMemo, useState } from "react";
import { authors, categories, getAuthor, getCategory, products, totalProducts } from "@/lib/data";
import { ProductCard } from "@/components/ui/ProductCard";

type Sort = "popular" | "newest" | "low" | "high" | "rating";

const EMPTY_LINES = [
  "Nothing here. Even our cat checked twice.",
  "Zero results. The void stares back, but stylishly.",
  "No matches. Try fewer words, or bribe the search bar.",
];

export function ShopClient({ initialCategory, initialAuthor, initialQuery }: { initialCategory: string; initialAuthor: string; initialQuery: string }) {
  const [cat, setCat] = useState(getCategory(initialCategory) ? initialCategory : "");
  const [author, setAuthor] = useState(getAuthor(initialAuthor) ? initialAuthor : "");
  const [query, setQuery] = useState(initialQuery);
  const [sort, setSort] = useState<Sort>("popular");
  const [freeOnly, setFreeOnly] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams();
    if (cat) params.set("c", cat);
    if (author) params.set("author", author);
    if (query) params.set("q", query);
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `/shop?${qs}` : "/shop");
  }, [cat, author, query]);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const out = products.filter(
      (p) =>
        (!cat || p.category === cat) &&
        (!author || p.author === author) &&
        (!freeOnly || p.price === 0) &&
        (!q || `${p.name} ${p.tagline} ${p.formats.join(" ")} ${getCategory(p.category)?.name}`.toLowerCase().includes(q)),
    );
    const by: Record<Sort, (a: (typeof products)[number], b: (typeof products)[number]) => number> = {
      popular: (a, b) => b.sales - a.sales,
      newest: (a, b) => b.released.localeCompare(a.released),
      low: (a, b) => a.price - b.price,
      high: (a, b) => b.price - a.price,
      rating: (a, b) => b.rating - a.rating,
    };
    return out.sort(by[sort]);
  }, [cat, author, query, sort, freeOnly]);

  const activeCat = getCategory(cat);
  const activeAuthor = getAuthor(author);

  return (
    <main className="page">
      <header className="shop__head">
        <div>
          <p className="eyebrow">{activeCat ? `Galaxy · ${activeCat.name}` : activeAuthor ? `Creator · ${activeAuthor.city}` : "Keep It Sorted · The Archive"}</p>
          <h1 className="shop__title">
            {activeCat ? (
              activeCat.name
            ) : activeAuthor ? (
              activeAuthor.name
            ) : (
              <>
                THE <span>ARCHIVE</span>
              </>
            )}
          </h1>
        </div>
        <p className="shop__sub">
          {activeCat
            ? activeCat.quip
            : activeAuthor
              ? activeAuthor.bio
              : `${totalProducts.toLocaleString("en-US")} things you didn't know you needed. Handpicked, pixel-checked, neatly sorted.`}
        </p>
      </header>

      <div className="shop__bar">
        <div className="chips">
          <button className={`chip ${!cat ? "is-active" : ""}`} onClick={() => setCat("")}>
            All
          </button>
          {categories.map((c) => (
            <button key={c.slug} className={`chip ${cat === c.slug ? "is-active" : ""}`} style={{ ["--accent" as string]: c.color }} onClick={() => setCat(cat === c.slug ? "" : c.slug)}>
              {c.name}
            </button>
          ))}
        </div>
        <div className="shop__tools">
          <input className="field" type="search" placeholder="Search templates…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search" />
          <select className="field" value={author} onChange={(e) => setAuthor(e.target.value)} aria-label="Creator">
            <option value="">All creators</option>
            {authors.map((a) => (
              <option key={a.slug} value={a.slug}>
                {a.name}
              </option>
            ))}
          </select>
          <select className="field" value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sort">
            <option value="popular">Most popular</option>
            <option value="newest">Newest drops</option>
            <option value="rating">Top rated</option>
            <option value="low">Price: low to high</option>
            <option value="high">Price: high to low</option>
          </select>
          <button className={`chip ${freeOnly ? "is-active" : ""}`} onClick={() => setFreeOnly((f) => !f)}>
            Free only
          </button>
        </div>
      </div>

      <div className="shop__status">
        <span>
          Showing <b>{list.length}</b> handpicked item{list.length === 1 ? "" : "s"}
          {activeCat && <> from {activeCat.count.toLocaleString("en-US")} in this galaxy</>}
        </span>
        {(cat || author || query || freeOnly) && (
          <button
            className="btn btn--link"
            onClick={() => {
              setCat("");
              setAuthor("");
              setQuery("");
              setFreeOnly(false);
            }}
          >
            Clear filters ✕
          </button>
        )}
      </div>

      {list.length ? (
        <div className="grid">
          {list.map((p, i) => (
            <ProductCard key={p.slug} product={p} index={i} />
          ))}
        </div>
      ) : (
        <div className="empty">
          <strong>{EMPTY_LINES[query.length % EMPTY_LINES.length]}</strong>
          Try another galaxy, or clear the filters.
        </div>
      )}
    </main>
  );
}
