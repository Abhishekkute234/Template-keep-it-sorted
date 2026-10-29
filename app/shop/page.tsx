import type { Metadata } from "next";
import { ShopClient } from "@/components/shop/ShopClient";
import { Footer } from "@/components/ui/Footer";

export const metadata: Metadata = {
  title: "The Archive — Keep It Sorted",
  description: "Browse premium UI kits, website templates, app templates, dashboards, icons, fonts, mockups and 3D assets.",
};

export default async function ShopPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const pick = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : "");
  return (
    <>
      <ShopClient key={`${pick("c")}-${pick("author")}-${pick("q")}`} initialCategory={pick("c")} initialAuthor={pick("author")} initialQuery={pick("q")} />
      <Footer />
    </>
  );
}
