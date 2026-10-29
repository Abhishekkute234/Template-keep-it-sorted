import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatPrice, getAuthor, getCategory, getProduct, products } from "@/lib/data";
import { ProductCard } from "@/components/ui/ProductCard";
import { Footer } from "@/components/ui/Footer";
import { BuyButtons, ProductStage } from "@/components/product/ProductStage";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = getProduct((await params).slug);
  return { title: p ? `${p.name} — Keep It Sorted` : "Lost — Keep It Sorted", description: p?.tagline };
}

export default async function ProductPage({ params }: Props) {
  const product = getProduct((await params).slug);
  if (!product) notFound();
  const author = getAuthor(product.author)!;
  const cat = getCategory(product.category)!;
  const related = products.filter((p) => p.slug !== product.slug && (p.category === product.category || p.author === product.author)).slice(0, 4);

  return (
    <>
      <main className="page">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link href="/shop">Archive</Link>
          <span>/</span>
          <Link href={`/shop?c=${cat.slug}`}>{cat.name}</Link>
          <span>/</span>
          <span>{product.name}</span>
        </nav>

        <section className="product">
          <ProductStage slug={product.slug} />

          <div className="product__info">
            <p className="eyebrow" style={{ color: cat.color }}>
              {cat.name} {product.badge ? `· ${product.badge}` : ""}
            </p>
            <h1>{product.name}</h1>
            <p className="product__tagline">{product.tagline}</p>

            <Link href={`/shop?author=${author.slug}`} className="product__byline">
              <span className="avatar" style={{ background: author.color }}>
                {author.name
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)}
              </span>
              <span>
                <b>{author.name}</b>
                {author.city} · {author.sales.toLocaleString("en-US")} sales
              </span>
            </Link>

            <div className="product__price">
              <strong>{formatPrice(product.price)}</strong>
              <span>
                ★ {product.rating} · {product.sales.toLocaleString("en-US")} downloads
              </span>
            </div>

            <BuyButtons slug={product.slug} free={product.price === 0} />

            <p className="eyebrow">Formats</p>
            <div className="formats">
              {product.formats.map((f) => (
                <span key={f}>{f}</span>
              ))}
            </div>

            <p className="eyebrow">What&apos;s inside</p>
            <ul className="includes">
              {product.includes.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </div>
        </section>

        {related.length > 0 && (
          <>
            <div className="section-title">
              <h2>You might also panic-buy</h2>
              <Link href={`/shop?c=${cat.slug}`}>More {cat.name} →</Link>
            </div>
            <div className="grid">
              {related.map((p, i) => (
                <ProductCard key={p.slug} product={p} index={i} />
              ))}
            </div>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
