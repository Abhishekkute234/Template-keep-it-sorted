"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { api, useApp, type User } from "@/components/providers/AppProvider";
import { toast } from "@/lib/store";

type Step = "email" | "code" | "name";

function OtpInput({ onChange, disabled }: { onChange: (code: string) => void; disabled?: boolean }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const [digits, setDigits] = useState<string[]>(() => Array(6).fill(""));

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  // Report only complete codes upward; partial input stays local.
  useEffect(() => {
    onChange(digits.every(Boolean) ? digits.join("") : "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [digits]);

  const set = (i: number, d: string) =>
    setDigits((prev) => {
      const next = prev.slice();
      next[i] = d;
      return next;
    });

  return (
    <div
      className="otp"
      onPaste={(e) => {
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (!pasted) return;
        e.preventDefault();
        setDigits(Array.from({ length: 6 }, (_, i) => pasted[i] ?? ""));
        refs.current[Math.min(pasted.length, 5)]?.focus();
      }}
    >
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          aria-label={`Digit ${i + 1}`}
          value={d}
          disabled={disabled}
          onFocus={(e) => e.target.select()}
          onChange={(e) => {
            let typed = e.target.value.replace(/\D/g, "");
            // Typing over an existing digit gives "old+new": keep just the new one.
            if (typed.length === 2 && d && typed.startsWith(d)) typed = typed[1];
            // Several digits at once (autofill, fast input): spread them across the boxes from here.
            if (typed.length > 1) {
              setDigits((prev) => {
                const next = prev.slice();
                for (let k = 0; k < typed.length && i + k < 6; k++) next[i + k] = typed[k];
                return next;
              });
              refs.current[Math.min(i + typed.length, 5)]?.focus();
              return;
            }
            set(i, typed);
            if (typed && i < 5) refs.current[i + 1]?.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !d && i > 0) {
              set(i - 1, "");
              refs.current[i - 1]?.focus();
            }
            if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
            if (e.key === "ArrowRight" && i < 5) refs.current[i + 1]?.focus();
          }}
        />
      ))}
    </div>
  );
}

export function LoginFlow({ next }: { next: string }) {
  const router = useRouter();
  const { setUser, setCartOpen } = useApp();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [devMode, setDevMode] = useState(false);
  const [otpKey, setOtpKey] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(t);
  }, [cooldown]);

  const finish = () => {
    const url = new URL(next, location.origin);
    // Coming back from "Sign in to check out": land with the cart open, ready to pay.
    if (url.searchParams.get("cart") === "open") {
      url.searchParams.delete("cart");
      setCartOpen(true);
    }
    router.push(url.pathname + url.search);
    router.refresh();
  };

  const sendCode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setBusy(true);
    setError("");
    const res = await api<{ dev?: boolean; retryAfter?: number }>("/api/auth/request-otp", "POST", { email });
    setBusy(false);
    if (res.error) {
      setError(res.error);
      if (res.retryAfter) setCooldown(res.retryAfter);
      return;
    }
    setDevMode(!!res.dev);
    setCode("");
    setOtpKey((k) => k + 1);
    setStep("code");
    setCooldown(60);
  };

  const verify = async (value: string) => {
    if (value.length !== 6 || busy) return;
    setBusy(true);
    setError("");
    const res = await api<{ user: User; isNew: boolean }>("/api/auth/verify-otp", "POST", { email, code: value });
    setBusy(false);
    if (res.error || !res.user) {
      setError(res.error ?? "Something went wrong. Try again.");
      setCode("");
      setOtpKey((k) => k + 1);
      return;
    }
    setUser(res.user);
    if (res.isNew) {
      setName(res.user.name);
      setStep("name");
    } else {
      toast(`Welcome back, ${res.user.name}.`);
      finish();
    }
  };

  const saveName = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const res = await api<{ user: User }>("/api/auth/me", "PATCH", { name });
    setBusy(false);
    if (res.error) return setError(res.error);
    if (res.user) setUser(res.user);
    toast(`Welcome to Keep It Sorted, ${res.user?.name ?? name}!`);
    finish();
  };

  return (
    <div className="auth-card">
      {step === "email" && (
        <form onSubmit={sendCode} noValidate>
          <p className="eyebrow">Sign in or create an account</p>
          <h1>Welcome. Let&apos;s get you sorted.</h1>
          <p className="auth-card__lede">Enter your email and we&apos;ll send a 6-digit code. No passwords to forget.</p>
          <label className="field-label" htmlFor="login-email">
            Email address
          </label>
          <input
            id="login-email"
            className="field field--lg"
            type="email"
            autoComplete="email"
            autoFocus
            required
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button className="btn btn--lime btn--block btn--tall" disabled={busy || !email || cooldown > 0}>
            {busy ? "Sending code…" : cooldown > 0 ? `Try again in ${cooldown}s` : "Email me a code"}
          </button>
          <p className="auth-card__fine">By continuing you agree to our terms. We&apos;ll only email you about your account.</p>
        </form>
      )}

      {step === "code" && (
        <div>
          <p className="eyebrow">Check your inbox</p>
          <h1>Enter your code</h1>
          <p className="auth-card__lede">
            We sent a 6-digit code to <b>{email}</b>. It expires in 10 minutes.
          </p>
          {devMode && <p className="auth-card__dev">Dev mode: email isn&apos;t configured, so the code is printed in the server terminal.</p>}
          <OtpInput
            key={otpKey}
            disabled={busy}
            onChange={(v) => {
              setCode(v);
              if (v.length === 6) verify(v);
            }}
          />
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button className="btn btn--lime btn--block btn--tall" onClick={() => verify(code)} disabled={busy || code.length !== 6}>
            {busy ? "Verifying…" : "Verify & sign in"}
          </button>
          <div className="auth-card__row">
            <button className="link-btn" onClick={() => sendCode()} disabled={busy || cooldown > 0}>
              {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
            </button>
            <button
              className="link-btn"
              onClick={() => {
                setStep("email");
                setError("");
              }}
            >
              Use a different email
            </button>
          </div>
        </div>
      )}

      {step === "name" && (
        <form onSubmit={saveName}>
          <p className="eyebrow">You&apos;re in</p>
          <h1>What should we call you?</h1>
          <p className="auth-card__lede">This shows up on your account and receipts. You can change it later.</p>
          <label className="field-label" htmlFor="login-name">
            Your name
          </label>
          <input id="login-name" className="field field--lg" autoFocus maxLength={60} value={name} onChange={(e) => setName(e.target.value)} />
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button className="btn btn--lime btn--block btn--tall" disabled={busy || !name.trim()}>
            {busy ? "Saving…" : "Continue"}
          </button>
          <button type="button" className="link-btn auth-card__skip" onClick={finish}>
            Skip for now
          </button>
        </form>
      )}
    </div>
  );
}
