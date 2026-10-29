"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { chapters } from "@/lib/chapters";
import { motion, nav, useStory } from "@/lib/store";
import { Overlay } from "./Overlay";
import { Logo } from "@/components/ui/Logo";

const Experience = dynamic(() => import("@/components/three/Experience"), { ssr: false });

const LOADING_LINES = [
  "Reticulating splines…",
  "Convincing pixels to align…",
  "Kerning the cosmos…",
  "Sorting the unsortable…",
  "Removing lorem ipsum from the universe…",
  "Centering a div (this may take a while)…",
];

function Loader() {
  const ready = useStory((s) => s.ready);
  const [pct, setPct] = useState(0);
  const [line, setLine] = useState(0);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => {
      setPct((p) => (ready ? Math.min(100, p + 9) : Math.min(94, p + Math.random() * 6)));
      setLine((l) => l + 1);
    }, 140);
    return () => window.clearInterval(id);
  }, [ready]);

  useEffect(() => {
    if (ready && pct >= 100) {
      const t = window.setTimeout(() => setGone(true), 650);
      return () => window.clearTimeout(t);
    }
  }, [ready, pct]);

  if (gone) return null;
  return (
    <div className={`loader ${ready && pct >= 100 ? "is-done" : ""}`} aria-hidden>
      <Logo size={72} className="loader__logo" />
      <div className="loader__pct">
        {Math.floor(pct)}
        <small>%</small>
      </div>
      <p className="loader__line">{LOADING_LINES[Math.floor(line / 8) % LOADING_LINES.length]}</p>
      <div className="loader__bar">
        <span style={{ transform: `scaleX(${pct / 100})` }} />
      </div>
    </div>
  );
}

function Hud() {
  const chapter = useStory((s) => s.chapter);
  const fixed = useStory((s) => s.fixed);
  const [p, setP] = useState(0);

  useEffect(() => {
    const on = () => setP(motion.target);
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  const jump = (i: number) => {
    const el = document.getElementById(`chapter-${i}`);
    if (el) window.scrollTo({ top: el.offsetTop, behavior: "smooth" });
  };

  return (
    <>
      <div className="progress" aria-hidden>
        <span style={{ transform: `scaleX(${p})` }} />
      </div>
      <nav className="hud" aria-label="Chapters">
        {chapters.map((c, i) => (
          <button key={c.id} className={`hud__item ${i === chapter ? "is-active" : ""}`} onClick={() => jump(i)}>
            <span className="hud__num">{c.numeral}</span>
            <span className="hud__label">
              {c.label}
              {c.id === "problem" && fixed > 0 ? ` · ${fixed}/14 fixed` : ""}
            </span>
          </button>
        ))}
      </nav>
    </>
  );
}

export default function Journey() {
  const router = useRouter();

  useEffect(() => {
    nav.go = (href: string) => router.push(href);
  }, [router]);

  useEffect(() => {
    const sections = () => Array.from(document.querySelectorAll<HTMLElement>("[data-chapter]"));
    const measure = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      motion.anchors = sections().map((s) => Math.min(1, s.offsetTop / max));
      onScroll();
    };
    const onScroll = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      motion.target = Math.min(1, Math.max(0, scrollY / max));
      for (const s of sections()) {
        const local = (scrollY - s.offsetTop) / Math.max(1, s.offsetHeight - innerHeight);
        s.style.setProperty("--sp", Math.min(1.5, Math.max(-0.5, local)).toFixed(3));
      }
    };
    const onMove = (e: PointerEvent) => {
      motion.mouse.x = (e.clientX / innerWidth) * 2 - 1;
      motion.mouse.y = -((e.clientY / innerHeight) * 2 - 1);
    };
    measure();
    document.fonts?.ready.then(measure);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onMove);
    if (location.hash) {
      const el = document.querySelector<HTMLElement>(location.hash);
      if (el) window.setTimeout(() => window.scrollTo({ top: el.offsetTop }), 50);
    }
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <>
      <Loader />
      <div className="stage">
        <Experience />
      </div>
      <Hud />
      <Overlay />
    </>
  );
}
