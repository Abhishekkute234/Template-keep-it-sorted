import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AccountActions, NameEditor } from "@/components/account/AccountActions";
import { Footer } from "@/components/ui/Footer";
import { resolveCartItem } from "@/lib/cart";
import { formatPrice } from "@/lib/data";
import { getCurrentUser, getUserCreatedAt } from "@/lib/server/auth";
import { collections } from "@/lib/server/mongo";

export const metadata: Metadata = { title: "My account — Keep It Sorted" };

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");

  const db = await collections();
  const [docs, since] = await Promise.all([db.orders.find({ userId: user.id }).sort({ createdAt: -1 }).limit(50).toArray(), getUserCreatedAt(user.id)]);
  const orders = docs.map((o) => ({ id: o._id, items: o.items, total: o.total, createdAt: o.createdAt }));

  return (
    <>
      <main className="page account">
        <header className="account__head">
          <div>
            <p className="eyebrow">My account</p>
            <h1 className="account__title">Hi, {user.name}.</h1>
          </div>
          <AccountActions />
        </header>

        <div className="account__grid">
          <section className="panel">
            <h2>Profile</h2>
            <NameEditor initial={user.name} />
            <dl className="kv">
              <dt>Email</dt>
              <dd>{user.email}</dd>
              <dt>Member since</dt>
              <dd>{since ? new Date(since).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "—"}</dd>
              <dt>Sign-in</dt>
              <dd>Email one-time code</dd>
            </dl>
          </section>

          <section className="panel">
            <h2>Orders &amp; downloads</h2>
            {orders.length === 0 ? (
              <div className="panel__empty">
                <p>No orders yet. Your future favourite template is one click away.</p>
                <Link href="/shop" className="btn btn--ghost">
                  Browse the archive
                </Link>
              </div>
            ) : (
              <ul className="orders">
                {orders.map((o) => (
                  <li key={o.id}>
                    <div className="orders__head">
                      <strong>Order {o.id}</strong>
                      <span>
                        {new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} · {formatPrice(o.total)}
                      </span>
                    </div>
                    <ul className="orders__items">
                      {o.items.map((id) => {
                        const line = resolveCartItem(id);
                        if (!line) return null;
                        return (
                          <li key={id}>
                            {line.product ? <Link href={`/product/${id}`}>{line.name}</Link> : <span>{line.name}</span>}
                            <span>{formatPrice(line.price)}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
