export type ArtKind =
  | "web"
  | "app"
  | "dash"
  | "icons"
  | "illus"
  | "font"
  | "3d"
  | "mockup"
  | "wire";

export type Category = {
  slug: string;
  name: string;
  short: string;
  count: number;
  color: string;
  kind: ArtKind;
  quip: string;
};

export type Author = {
  slug: string;
  name: string;
  city: string;
  color: string;
  sales: number;
  bio: string;
};

export type Product = {
  slug: string;
  name: string;
  tagline: string;
  category: string;
  author: string;
  price: number;
  rating: number;
  sales: number;
  colors: [string, string];
  formats: string[];
  badge?: "Bestseller" | "New" | "Trending" | "Free";
  includes: string[];
  released: string;
};

export const categories: Category[] = [
  { slug: "ui-kits", name: "UI Kits", short: "UI", count: 3412, color: "#4D7CFF", kind: "web", quip: "Components so tidy, Marie Kondo sent a thank-you note." },
  { slug: "website-templates", name: "Website Templates", short: "WEB", count: 2180, color: "#D4FF3A", kind: "web", quip: "Coded in Next.js. Loads faster than your client changes their mind." },
  { slug: "app-templates", name: "App Templates", short: "APP", count: 1964, color: "#FF3D81", kind: "app", quip: "iOS & Android screens. Thumb-tested, mom-approved." },
  { slug: "dashboards", name: "Dashboards", short: "DASH", count: 870, color: "#00D1B2", kind: "dash", quip: "Charts that only go up and to the right. Data not included." },
  { slug: "illustrations", name: "Illustrations", short: "ILL", count: 1320, color: "#FFB86B", kind: "illus", quip: "People with suspiciously long arms. As is tradition." },
  { slug: "3d-assets", name: "3D Assets", short: "3D", count: 940, color: "#8B5CF6", kind: "3d", quip: "Shiny blobs. Clients love shiny blobs. Science can't explain it." },
  { slug: "icons", name: "Icon Sets", short: "ICO", count: 1105, color: "#38BDF8", kind: "icons", quip: "Pixel-perfect. Even the hamburger menu is gluten-free." },
  { slug: "fonts", name: "Fonts", short: "Aa", count: 486, color: "#F2EFE9", kind: "font", quip: "Typefaces with more personality than your ex." },
  { slug: "mockups", name: "Mockups", short: "MCK", count: 1260, color: "#FF6B3D", kind: "mockup", quip: "Your design, on a phone, held by a stranger, in a park. Very real." },
  { slug: "wireframes", name: "Wireframe Kits", short: "WIRE", count: 410, color: "#9AA0A6", kind: "wire", quip: "Gray boxes. Infinite potential. Zero drama." },
];

export const totalProducts = categories.reduce((s, c) => s + c.count, 0);

export const authors: Author[] = [
  { slug: "mira-volt", name: "Mira Volt", city: "Berlin", color: "#4D7CFF", sales: 48210, bio: "Makes grids feel things. Has opinions about 4px." },
  { slug: "kenji-arc", name: "Kenji Arc", city: "Tokyo", color: "#FF3D81", sales: 39120, bio: "Designs dashboards so clean you could eat data off them." },
  { slug: "studio-oddity", name: "Studio Oddity", city: "Lisbon", color: "#D4FF3A", sales: 31870, bio: "Four people, one cat, unreasonable attention to kerning." },
  { slug: "lola-pixel", name: "Lola Pixel", city: "Mexico City", color: "#FFB86B", sales: 27440, bio: "Illustrator. Draws arms at whatever length feels right." },
  { slug: "null-and-void", name: "Null & Void", city: "Oslo", color: "#8B5CF6", sales: 22980, bio: "3D duo. Have rendered more blobs than any humans alive." },
  { slug: "fern-labs", name: "Fern Labs", city: "Bengaluru", color: "#00D1B2", sales: 19650, bio: "Ships Next.js templates before their coffee cools." },
];

export const products: Product[] = [
  { slug: "nebula-saas-kit", name: "Nebula SaaS Kit", tagline: "480+ components for SaaS products that actually convert.", category: "ui-kits", author: "mira-volt", price: 68, rating: 4.9, sales: 6120, colors: ["#4D7CFF", "#8B5CF6"], formats: ["Figma", "Framer"], badge: "Bestseller", includes: ["480+ components", "120 ready screens", "Light & dark modes", "Auto-layout 5.0"], released: "2026-08-12" },
  { slug: "orbit-landing", name: "Orbit — Next.js Landing", tagline: "A launch-day landing page. Rockets sold separately.", category: "website-templates", author: "fern-labs", price: 79, rating: 4.8, sales: 4380, colors: ["#D4FF3A", "#1A1A1A"], formats: ["Next.js", "React", "Tailwind", "Figma"], badge: "Trending", includes: ["12 coded pages", "App Router + TypeScript", "MDX blog", "Lighthouse 100"], released: "2026-09-30" },
  { slug: "ramen-food-app", name: "Ramen — Food Delivery App", tagline: "Hunger-to-checkout in three taps. Slurping optional.", category: "app-templates", author: "studio-oddity", price: 59, rating: 4.7, sales: 3210, colors: ["#FF6B3D", "#FFC93D"], formats: ["Figma", "React Native"], includes: ["86 mobile screens", "iOS & Android", "Prototype flows", "Design tokens"], released: "2026-06-02" },
  { slug: "pulse-analytics", name: "Pulse Analytics", tagline: "A dashboard that makes even churn look pretty.", category: "dashboards", author: "kenji-arc", price: 89, rating: 4.9, sales: 5530, colors: ["#00D1B2", "#0B3D91"], formats: ["Figma", "Next.js", "React"], badge: "Bestseller", includes: ["64 dashboard screens", "40+ chart types", "Coded React version", "Dark mode"], released: "2026-04-18" },
  { slug: "humans-of-pixel", name: "Humans of Pixel", tagline: "120 characters with arms of artistically varying length.", category: "illustrations", author: "lola-pixel", price: 39, rating: 4.8, sales: 2870, colors: ["#FF3D81", "#FFB4D0"], formats: ["Figma", "SVG", "PNG"], includes: ["120 characters", "Mix & match parts", "Editable colors", "SVG + PNG"], released: "2026-07-21" },
  { slug: "chromatic-blobs", name: "Chromatic Blobs 3D", tagline: "Glossy, wobbly, irresistible. The blob economy is booming.", category: "3d-assets", author: "null-and-void", price: 49, rating: 4.7, sales: 2410, colors: ["#8B5CF6", "#FF3D81"], formats: ["Blender", "GLB", "PNG"], badge: "New", includes: ["60 3D objects", "4K renders", "GLB for web", "Blender source"], released: "2026-10-20" },
  { slug: "stroke-icons", name: "Stroke 2.0 Icons", tagline: "2,400 icons. Every stroke perfectly unbothered.", category: "icons", author: "mira-volt", price: 0, rating: 4.9, sales: 18200, colors: ["#F2EFE9", "#7A7A7A"], formats: ["Figma", "SVG", "React"], badge: "Free", includes: ["2,400 icons", "3 stroke weights", "React package", "24px grid"], released: "2026-03-09" },
  { slug: "grotesk-deluxe", name: "Grotesk Deluxe", tagline: "A grotesk so bold it asks for the manager.", category: "fonts", author: "studio-oddity", price: 45, rating: 4.8, sales: 1980, colors: ["#111111", "#D4FF3A"], formats: ["OTF", "WOFF2", "Variable"], includes: ["9 weights + italics", "Variable font", "Web license", "420 glyphs"], released: "2026-05-14" },
  { slug: "device-parade", name: "Device Parade Mockups", tagline: "Phones, laptops, a tablet having an existential moment.", category: "mockups", author: "null-and-void", price: 35, rating: 4.6, sales: 2240, colors: ["#FFB86B", "#FF6B6B"], formats: ["Figma", "PSD"], includes: ["40 scenes", "Smart objects", "Shadow layers", "6K resolution"], released: "2026-02-27" },
  { slug: "bones-wireframes", name: "Bones Wireframe Kit", tagline: "All skeleton, no drama. Spooky-season approved.", category: "wireframes", author: "fern-labs", price: 25, rating: 4.6, sales: 1430, colors: ["#3A3F47", "#E5E7EB"], formats: ["Figma", "FigJam"], includes: ["300+ blocks", "Desktop & mobile", "User-flow kit", "Sticky notes"], released: "2026-01-15" },
  { slug: "fintech-pocket", name: "Fintech Pocket", tagline: "A banking app so calm it makes rent day feel okay.", category: "app-templates", author: "kenji-arc", price: 69, rating: 4.9, sales: 3920, colors: ["#00C2FF", "#2B2DFF"], formats: ["Figma", "Flutter"], badge: "Trending", includes: ["110 screens", "Cards & wallets", "Onboarding flows", "Flutter code"], released: "2026-09-04" },
  { slug: "atlas-portfolio", name: "Atlas Portfolio", tagline: "A Next.js portfolio that gets you hired (or at least noticed).", category: "website-templates", author: "fern-labs", price: 49, rating: 4.7, sales: 2650, colors: ["#F2EFE9", "#FF3D81"], formats: ["Next.js", "Framer Motion", "Figma"], badge: "New", includes: ["8 coded pages", "Case-study layouts", "CMS ready", "Page transitions"], released: "2026-10-11" },
  { slug: "glass-dashboard", name: "Glassmorphic Dashboard", tagline: "Frosted panels. Smooth blur. Zero practical purpose. Gorgeous.", category: "dashboards", author: "mira-volt", price: 75, rating: 4.6, sales: 1870, colors: ["#A78BFA", "#38BDF8"], formats: ["Figma", "React"], includes: ["38 screens", "Glass component set", "Widgets", "Charts"], released: "2026-08-01" },
  { slug: "commerce-os", name: "Commerce OS UI Kit", tagline: "Everything an online store needs, except customers.", category: "ui-kits", author: "kenji-arc", price: 99, rating: 4.9, sales: 4710, colors: ["#FF3D81", "#4D7CFF"], formats: ["Figma", "Sketch"], badge: "Bestseller", includes: ["900+ components", "Checkout flows", "Product pages", "Design tokens"], released: "2026-05-30" },
  { slug: "moodboard-illos", name: "Moodboard Illustrations", tagline: "Free vibes. Literally free. Our accountant is crying.", category: "illustrations", author: "lola-pixel", price: 0, rating: 4.7, sales: 9800, colors: ["#34D399", "#FDE68A"], formats: ["SVG", "PNG"], badge: "Free", includes: ["30 scenes", "SVG + PNG", "Commercial use", "Color variants"], released: "2026-06-19" },
  { slug: "isometric-city", name: "Isometric City 3D", tagline: "Build a skyline. No zoning permits required.", category: "3d-assets", author: "null-and-void", price: 55, rating: 4.8, sales: 2090, colors: ["#38BDF8", "#F472B6"], formats: ["Blender", "GLB", "Spline"], includes: ["140 buildings", "Roads & props", "Day/night lighting", "Web-ready GLB"], released: "2026-07-07" },
  { slug: "duotone-icons", name: "Duotone Icons", tagline: "Two tones. One love. 1,800 tiny pictures.", category: "icons", author: "studio-oddity", price: 32, rating: 4.7, sales: 2330, colors: ["#4D7CFF", "#D4FF3A"], formats: ["Figma", "SVG", "Icon font"], includes: ["1,800 icons", "Duotone & solid", "Icon font", "Figma variants"], released: "2026-04-02" },
  { slug: "serif-opera", name: "Serif Opera", tagline: "A dramatic serif for brands that cry at movies.", category: "fonts", author: "lola-pixel", price: 39, rating: 4.8, sales: 1210, colors: ["#2B1B17", "#F5D0A9"], formats: ["OTF", "WOFF2"], includes: ["6 weights", "Swash alternates", "Ligatures", "Web license"], released: "2026-03-22" },
  { slug: "fitness-coach", name: "Fitness Coach App", tagline: "It counts your reps. It does not judge. Much.", category: "app-templates", author: "fern-labs", price: 55, rating: 4.7, sales: 1760, colors: ["#D4FF3A", "#00C2FF"], formats: ["Figma", "SwiftUI"], badge: "New", includes: ["72 screens", "Workout builder", "Wearable screens", "SwiftUI starter"], released: "2026-10-05" },
  { slug: "agency-noir", name: "Agency Noir", tagline: "A dark-mode agency site with mysterious-but-hireable energy.", category: "website-templates", author: "studio-oddity", price: 65, rating: 4.8, sales: 3080, colors: ["#0A0A0A", "#FF6B3D"], formats: ["Next.js", "Webflow", "Figma"], badge: "Trending", includes: ["10 coded pages", "GSAP animations", "Webflow clone", "Case studies"], released: "2026-09-18" },
  { slug: "social-mockups", name: "Social Media Mockups", tagline: "Make your post look viral before it's even posted.", category: "mockups", author: "lola-pixel", price: 29, rating: 4.5, sales: 1550, colors: ["#F472B6", "#FDE68A"], formats: ["Figma", "PSD"], includes: ["24 platforms", "Feed & story frames", "Editable UI", "Light/dark"], released: "2026-02-08" },
  { slug: "crypto-terminal", name: "Crypto Terminal", tagline: "A trading dashboard with candles. Not the scented kind.", category: "dashboards", author: "kenji-arc", price: 85, rating: 4.6, sales: 1340, colors: ["#22C55E", "#0A0A0A"], formats: ["Figma", "React"], includes: ["30 screens", "Candlestick charts", "Order books", "Coded widgets"], released: "2026-06-26" },
  { slug: "mobile-kit-lite", name: "Mobile UI Kit Lite", tagline: "Our free starter kit. Training wheels, but stylish.", category: "ui-kits", author: "fern-labs", price: 0, rating: 4.6, sales: 12400, colors: ["#F59E0B", "#EF4444"], formats: ["Figma"], badge: "Free", includes: ["150 components", "20 screens", "Auto-layout", "Styles & tokens"], released: "2026-01-30" },
  { slug: "flowchart-wire", name: "Flowchart Wireframes", tagline: "Arrows pointing at things, professionally.", category: "wireframes", author: "mira-volt", price: 19, rating: 4.5, sales: 980, colors: ["#8B5CF6", "#E5E7EB"], formats: ["Figma", "FigJam"], includes: ["200 flow blocks", "Connectors", "Templates", "Annotations"], released: "2026-05-05" },
];

export const plans = [
  {
    id: "single",
    name: "Single Ticket",
    price: "From $19",
    amount: null as number | null,
    period: "per product",
    blurb: "For the commitment-curious.",
    features: ["Lifetime updates for that item", "Commercial license", "Source files included", "1 sunglasses-cat sticker (very collectible)"],
  },
  {
    id: "infinite",
    name: "The Infinite Key",
    price: "$249",
    amount: 249 as number | null,
    period: "per year",
    blurb: "Every door on Keep It Sorted. Opens with a satisfying click.",
    features: [`All ${totalProducts.toLocaleString("en-US")} products, unlocked`, "New drops every week", "Unlimited projects & clients", "Priority support from actual humans"],
    featured: true,
  },
  {
    id: "forever",
    name: "Forever Key",
    price: "$699",
    amount: 699 as number | null,
    period: "one time",
    blurb: "Pay once. Brag eternally.",
    features: ["Everything, forever-ish", "Early access to new drops", "Team seats for 3", "Bragging rights (non-transferable)"],
  },
];

export const testimonials = [
  { quote: "I shipped a SaaS landing page in four hours. Then I took a nap. A very long nap.", name: "Priya N.", role: "Product Designer" },
  { quote: "My client thinks I'm a genius. Please do not tell them about this website.", name: "Marco D.", role: "Freelancer" },
  { quote: "I came for one icon set and left with the Infinite Key. No regrets.", name: "Sam K.", role: "Front-end Developer" },
  { quote: "Our design system went from 'chaos' to 'chef's kiss' in a sprint.", name: "Aya T.", role: "Design Lead" },
];

export const getCategory = (slug: string) => categories.find((c) => c.slug === slug);
export const getAuthor = (slug: string) => authors.find((a) => a.slug === slug);
export const getProduct = (slug: string) => products.find((p) => p.slug === slug);
export const trending = [...products].filter((p) => p.price > 0).sort((a, b) => b.sales - a.sales).slice(0, 8);
export const formatPrice = (p: number) => (p === 0 ? "Free" : `$${p}`);
