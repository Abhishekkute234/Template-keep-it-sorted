import { getCategory, type ArtKind, type Product } from "./data";

function rng(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hexLum(hex: string) {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, Math.min(r, w / 2, h / 2));
}

function fillRR(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fill: string | CanvasGradient) {
  rr(ctx, x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
}

type Pal = { a: string; b: string; ink: string; soft: string; panel: string; panelInk: string };

function bars(ctx: CanvasRenderingContext2D, x: number, y: number, widths: number[], h: number, gap: number, color: string) {
  widths.forEach((w, i) => fillRR(ctx, x, y + i * (h + gap), w, h, h / 2, color));
}

function drawWeb(ctx: CanvasRenderingContext2D, W: number, H: number, p: Pal, r: () => number) {
  const x = W * 0.1, y = H * 0.14, w = W * 0.8, h = H * 0.86;
  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = W * 0.05;
  fillRR(ctx, x, y, w, h, W * 0.025, p.panel);
  ctx.shadowBlur = 0;
  ["#FF5F57", "#FEBC2E", "#28C840"].forEach((c, i) => {
    ctx.beginPath();
    ctx.arc(x + W * 0.03 + i * W * 0.025, y + H * 0.045, W * 0.008, 0, Math.PI * 2);
    ctx.fillStyle = c;
    ctx.fill();
  });
  const cx = x + W * 0.05;
  bars(ctx, cx, y + H * 0.14, [w * 0.5, w * 0.38], H * 0.055, H * 0.025, p.panelInk);
  bars(ctx, cx, y + H * 0.32, [w * 0.42, w * 0.34, w * 0.3], H * 0.018, H * 0.018, p.soft);
  fillRR(ctx, cx, y + H * 0.46, w * 0.17, H * 0.07, H * 0.035, p.a);
  fillRR(ctx, cx + w * 0.2, y + H * 0.46, w * 0.14, H * 0.07, H * 0.035, p.soft);
  const ix = x + w * 0.58, iy = y + H * 0.12, iw = w * 0.36, ih = H * 0.42;
  const g = ctx.createLinearGradient(ix, iy, ix + iw, iy + ih);
  g.addColorStop(0, p.a);
  g.addColorStop(1, p.b);
  fillRR(ctx, ix, iy, iw, ih, W * 0.02, g);
  ctx.beginPath();
  ctx.arc(ix + iw * (0.3 + r() * 0.4), iy + ih * 0.5, ih * 0.28, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.fill();
  for (let i = 0; i < 3; i++) {
    const bx = cx + i * (w * 0.3);
    fillRR(ctx, bx, y + H * 0.62, w * 0.27, H * 0.22, W * 0.015, p.soft);
    fillRR(ctx, bx + W * 0.015, y + H * 0.645, W * 0.04, W * 0.04, W * 0.01, i === 1 ? p.b : p.a);
  }
}

function phone(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, p: Pal, r: () => number, tilt: number) {
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(tilt);
  ctx.translate(-w / 2, -h / 2);
  ctx.shadowColor = "rgba(0,0,0,0.4)";
  ctx.shadowBlur = w * 0.15;
  fillRR(ctx, 0, 0, w, h, w * 0.16, "#0d0d10");
  ctx.shadowBlur = 0;
  fillRR(ctx, w * 0.05, w * 0.05, w * 0.9, h - w * 0.1, w * 0.12, p.panel);
  fillRR(ctx, w * 0.36, w * 0.08, w * 0.28, w * 0.07, w * 0.035, "#0d0d10");
  const g = ctx.createLinearGradient(0, 0, w, h * 0.4);
  g.addColorStop(0, p.a);
  g.addColorStop(1, p.b);
  fillRR(ctx, w * 0.12, h * 0.12, w * 0.76, h * 0.3, w * 0.08, g);
  bars(ctx, w * 0.12, h * 0.47, [w * 0.6, w * 0.42], h * 0.03, h * 0.02, p.panelInk);
  for (let i = 0; i < 3; i++) {
    fillRR(ctx, w * 0.12, h * (0.6 + i * 0.1), w * 0.76, h * 0.075, w * 0.05, p.soft);
    ctx.beginPath();
    ctx.arc(w * 0.22, h * (0.6 + i * 0.1) + h * 0.0375, h * 0.022, 0, Math.PI * 2);
    ctx.fillStyle = r() > 0.5 ? p.a : p.b;
    ctx.fill();
  }
  ctx.restore();
}

function drawApp(ctx: CanvasRenderingContext2D, W: number, H: number, p: Pal, r: () => number) {
  const pw = W * 0.24, ph = pw * 2.05;
  phone(ctx, W * 0.2, H * 0.12, pw, ph, p, r, -0.12);
  phone(ctx, W * 0.56, H * 0.06, pw, ph, p, r, 0.1);
}

function drawDash(ctx: CanvasRenderingContext2D, W: number, H: number, p: Pal, r: () => number) {
  const x = W * 0.08, y = H * 0.12, w = W * 0.84, h = H * 0.8;
  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = W * 0.05;
  fillRR(ctx, x, y, w, h, W * 0.02, p.panel);
  ctx.shadowBlur = 0;
  fillRR(ctx, x, y, w * 0.18, h, W * 0.02, p.soft);
  bars(ctx, x + w * 0.03, y + h * 0.1, [w * 0.12, w * 0.09, w * 0.11, w * 0.08, w * 0.1], h * 0.035, h * 0.05, p.panelInk);
  const sx = x + w * 0.22;
  for (let i = 0; i < 3; i++) {
    fillRR(ctx, sx + i * w * 0.255, y + h * 0.07, w * 0.235, h * 0.2, W * 0.012, p.soft);
    fillRR(ctx, sx + i * w * 0.255 + w * 0.02, y + h * 0.17, w * 0.1, h * 0.06, h * 0.03, i === 0 ? p.a : i === 1 ? p.b : p.panelInk);
  }
  const cx = sx, cy = y + h * 0.33, cw = w * 0.5, ch = h * 0.58;
  fillRR(ctx, cx, cy, cw, ch, W * 0.012, p.soft);
  ctx.beginPath();
  let v = 0.7;
  for (let i = 0; i <= 12; i++) {
    v = Math.max(0.15, Math.min(0.85, v - (r() - 0.35) * 0.18));
    const px = cx + cw * 0.06 + (cw * 0.88 * i) / 12;
    const py = cy + ch * v;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.strokeStyle = p.a;
  ctx.lineWidth = W * 0.008;
  ctx.lineJoin = "round";
  ctx.stroke();
  const bx = cx + cw + w * 0.02, bw = w * 0.26;
  fillRR(ctx, bx, cy, bw, ch, W * 0.012, p.soft);
  for (let i = 0; i < 6; i++) {
    const bh = ch * (0.2 + r() * 0.6);
    fillRR(ctx, bx + bw * 0.1 + i * bw * 0.14, cy + ch * 0.92 - bh, bw * 0.08, bh, bw * 0.04, i % 2 ? p.b : p.a);
  }
}

function drawIcons(ctx: CanvasRenderingContext2D, W: number, H: number, p: Pal, r: () => number) {
  const cols = 6, rows = 4, s = W * 0.11, gap = W * 0.03;
  const ox = (W - (cols * s + (cols - 1) * gap)) / 2, oy = (H - (rows * s + (rows - 1) * gap)) / 2;
  for (let i = 0; i < cols * rows; i++) {
    const x = ox + (i % cols) * (s + gap), y = oy + Math.floor(i / cols) * (s + gap);
    fillRR(ctx, x, y, s, s, s * 0.28, p.panel);
    ctx.strokeStyle = (i * 7) % 5 === 0 ? p.a : p.panelInk;
    ctx.lineWidth = s * 0.07;
    ctx.lineCap = "round";
    const c = s / 2, k = s * 0.22;
    ctx.beginPath();
    switch (Math.floor(r() * 6)) {
      case 0: ctx.arc(x + c, y + c, k, 0, Math.PI * 2); break;
      case 1: ctx.rect(x + c - k, y + c - k, k * 2, k * 2); break;
      case 2: ctx.moveTo(x + c, y + c - k); ctx.lineTo(x + c + k, y + c + k); ctx.lineTo(x + c - k, y + c + k); ctx.closePath(); break;
      case 3: ctx.moveTo(x + c - k, y + c); ctx.lineTo(x + c + k, y + c); ctx.moveTo(x + c, y + c - k); ctx.lineTo(x + c, y + c + k); break;
      case 4: ctx.moveTo(x + c - k, y + c - k * 0.6); ctx.lineTo(x + c + k, y + c - k * 0.6); ctx.moveTo(x + c - k, y + c); ctx.lineTo(x + c + k, y + c); ctx.moveTo(x + c - k, y + c + k * 0.6); ctx.lineTo(x + c + k, y + c + k * 0.6); break;
      default: ctx.moveTo(x + c - k, y + c); ctx.lineTo(x + c - k * 0.2, y + c + k * 0.7); ctx.lineTo(x + c + k, y + c - k * 0.7);
    }
    ctx.stroke();
  }
}

function drawIllus(ctx: CanvasRenderingContext2D, W: number, H: number, p: Pal, r: () => number) {
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    const cx = W * (0.15 + r() * 0.7), cy = H * (0.2 + r() * 0.6), rad = W * (0.08 + r() * 0.12);
    for (let a = 0; a <= Math.PI * 2 + 0.01; a += Math.PI / 6) {
      const rr2 = rad * (0.8 + r() * 0.4);
      const px = cx + Math.cos(a) * rr2, py = cy + Math.sin(a) * rr2;
      if (a === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = i % 2 ? p.soft : "rgba(255,255,255,0.18)";
    ctx.fill();
  }
  // a character with heroically long arms
  const x = W * 0.5, y = H * 0.55;
  ctx.fillStyle = p.panel;
  fillRR(ctx, x - W * 0.07, y - H * 0.08, W * 0.14, H * 0.38, W * 0.07, p.panel);
  ctx.strokeStyle = p.panel;
  ctx.lineWidth = W * 0.022;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x - W * 0.06, y);
  ctx.quadraticCurveTo(x - W * 0.25, y - H * 0.1, x - W * 0.34, y - H * 0.34);
  ctx.moveTo(x + W * 0.06, y);
  ctx.quadraticCurveTo(x + W * 0.25, y + H * 0.05, x + W * 0.36, y - H * 0.2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y - H * 0.17, W * 0.06, 0, Math.PI * 2);
  ctx.fillStyle = p.b;
  ctx.fill();
}

function drawFont(ctx: CanvasRenderingContext2D, W: number, H: number, p: Pal, _r: () => number, name: string) {
  ctx.fillStyle = p.ink;
  ctx.textBaseline = "alphabetic";
  ctx.font = `900 ${H * 0.62}px ${name.includes("Serif") ? "Georgia, serif" : "Unbounded, Arial Black, sans-serif"}`;
  ctx.fillText("Aa", W * 0.07, H * 0.72);
  ctx.font = `500 ${H * 0.06}px "Space Grotesk", sans-serif`;
  ctx.globalAlpha = 0.75;
  ctx.fillText("ABCDEFGHIJKLM 0123456789", W * 0.08, H * 0.86);
  ctx.globalAlpha = 1;
  ctx.beginPath();
  ctx.arc(W * 0.82, H * 0.28, H * 0.1, 0, Math.PI * 2);
  ctx.fillStyle = p.a === p.ink ? p.b : p.a;
  ctx.fill();
}

function draw3D(ctx: CanvasRenderingContext2D, W: number, H: number, p: Pal, r: () => number) {
  for (let i = 0; i < 4; i++) {
    const cx = W * (0.2 + r() * 0.6), cy = H * (0.25 + r() * 0.5), rad = H * (0.1 + r() * 0.18);
    const g = ctx.createRadialGradient(cx - rad * 0.4, cy - rad * 0.4, rad * 0.1, cx, cy, rad);
    g.addColorStop(0, "#ffffff");
    g.addColorStop(0.35, i % 2 ? p.a : p.b);
    g.addColorStop(1, "rgba(0,0,0,0.55)");
    ctx.beginPath();
    ctx.arc(cx, cy, rad, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
  }
  ctx.beginPath();
  ctx.ellipse(W * 0.5, H * 0.52, W * 0.32, H * 0.12, -0.3, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255,255,255,0.6)";
  ctx.lineWidth = H * 0.025;
  ctx.stroke();
}

function drawMockup(ctx: CanvasRenderingContext2D, W: number, H: number, p: Pal, r: () => number) {
  const lw = W * 0.6, lh = lw * 0.62, lx = W * 0.12, ly = H * 0.16;
  ctx.shadowColor = "rgba(0,0,0,0.4)";
  ctx.shadowBlur = W * 0.05;
  fillRR(ctx, lx, ly, lw, lh, W * 0.02, "#111");
  ctx.shadowBlur = 0;
  const g = ctx.createLinearGradient(lx, ly, lx + lw, ly + lh);
  g.addColorStop(0, p.a);
  g.addColorStop(1, p.b);
  fillRR(ctx, lx + W * 0.015, ly + W * 0.015, lw - W * 0.03, lh - W * 0.03, W * 0.01, g);
  bars(ctx, lx + W * 0.05, ly + lh * 0.25, [lw * 0.45, lw * 0.3], lh * 0.08, lh * 0.05, "rgba(255,255,255,0.75)");
  fillRR(ctx, lx - W * 0.04, ly + lh, lw + W * 0.08, H * 0.04, H * 0.02, "#2a2a2e");
  phone(ctx, W * 0.66, H * 0.3, W * 0.18, W * 0.37, p, r, 0.08);
}

function drawWire(ctx: CanvasRenderingContext2D, W: number, H: number, p: Pal) {
  ctx.strokeStyle = p.panelInk;
  ctx.lineWidth = W * 0.004;
  ctx.setLineDash([W * 0.012, W * 0.008]);
  const boxes: [number, number, number, number][] = [
    [0.08, 0.1, 0.84, 0.12],
    [0.08, 0.28, 0.5, 0.36],
    [0.62, 0.28, 0.3, 0.16],
    [0.62, 0.48, 0.3, 0.16],
    [0.08, 0.7, 0.26, 0.2],
    [0.37, 0.7, 0.26, 0.2],
    [0.66, 0.7, 0.26, 0.2],
  ];
  boxes.forEach(([x, y, w, h], i) => {
    rr(ctx, W * x, H * y, W * w, H * h, W * 0.01);
    ctx.stroke();
    if (i === 1 || i >= 4) {
      ctx.beginPath();
      ctx.moveTo(W * x, H * y);
      ctx.lineTo(W * (x + w), H * (y + h));
      ctx.moveTo(W * (x + w), H * y);
      ctx.lineTo(W * x, H * (y + h));
      ctx.stroke();
    }
  });
  ctx.setLineDash([]);
  fillRR(ctx, W * 0.66, H * 0.33, W * 0.16, H * 0.04, H * 0.02, p.a);
}

export function drawProductArt(ctx: CanvasRenderingContext2D, W: number, H: number, product: Product) {
  const r = rng(product.slug);
  const [a, b] = product.colors;
  const kind: ArtKind = getCategory(product.category)?.kind ?? "web";
  const darkBg = hexLum(a) < 0.25;
  const pal: Pal = {
    a: darkBg ? b : a,
    b: darkBg ? a : b,
    ink: darkBg ? b : "#0b0b10",
    soft: "rgba(127,127,140,0.18)",
    panel: kind === "wire" ? "#1b1d22" : "#f7f6f2",
    panelInk: kind === "wire" ? "#9aa0a6" : "#17171c",
  };
  if (kind === "dash" || kind === "app") {
    pal.panel = "#121218";
    pal.panelInk = "#e9e8ef";
    pal.soft = "rgba(255,255,255,0.08)";
  }

  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, kind === "wire" ? "#0f1013" : a);
  bg.addColorStop(1, kind === "wire" ? "#1b1d22" : b);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // grain-ish dots for depth
  ctx.fillStyle = "rgba(255,255,255,0.06)";
  for (let i = 0; i < 60; i++) ctx.fillRect(r() * W, r() * H, W * 0.004, W * 0.004);

  switch (kind) {
    case "web": drawWeb(ctx, W, H, pal, r); break;
    case "app": drawApp(ctx, W, H, pal, r); break;
    case "dash": drawDash(ctx, W, H, pal, r); break;
    case "icons": drawIcons(ctx, W, H, pal, r); break;
    case "illus": drawIllus(ctx, W, H, pal, r); break;
    case "font": drawFont(ctx, W, H, pal, r, product.name); break;
    case "3d": draw3D(ctx, W, H, pal, r); break;
    case "mockup": drawMockup(ctx, W, H, pal, r); break;
    case "wire": drawWire(ctx, W, H, pal); break;
  }
}
