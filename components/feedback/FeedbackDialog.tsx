"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FEEDBACK_TOPICS, type FeedbackTopic } from "@/lib/feedback";
import { api, useApp } from "@/components/providers/AppProvider";

const RATING_LABELS = ["", "Not great", "Meh", "It's fine", "Pretty good", "Love it"];

export function FeedbackDialog() {
  const { feedbackOpen, setFeedbackOpen, user } = useApp();
  const pathname = usePathname();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [topic, setTopic] = useState<FeedbackTopic>("Idea");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const firstRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!feedbackOpen) return;
    firstRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setFeedbackOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [feedbackOpen, setFeedbackOpen]);

  useEffect(() => {
    if (feedbackOpen) return;
    const t = window.setTimeout(() => {
      setSent(false);
      setError("");
    }, 300);
    return () => window.clearTimeout(t);
  }, [feedbackOpen]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) return setError("Pick a rating first.");
    setBusy(true);
    setError("");
    const res = await api("/api/feedback", "POST", { rating, topic, message, email: user ? undefined : email || undefined, page: pathname });
    setBusy(false);
    if (res.error) return setError(res.error);
    setSent(true);
    setRating(0);
    setMessage("");
  };

  const shown = hover || rating;

  return (
    <>
      <button className="feedback-tab" onClick={() => setFeedbackOpen(true)} aria-haspopup="dialog">
        Feedback
      </button>
      <div className={`modal ${feedbackOpen ? "is-open" : ""}`} aria-hidden={!feedbackOpen}>
        <div className="modal__scrim" onClick={() => setFeedbackOpen(false)} />
        <div className="modal__card" role="dialog" aria-modal="true" aria-labelledby="fb-title">
          <button className="icon-btn modal__close" onClick={() => setFeedbackOpen(false)} aria-label="Close feedback">
            ✕
          </button>
          {sent ? (
            <div className="modal__done">
              <p className="eyebrow">Received</p>
              <h2 id="fb-title">Thank you!</h2>
              <p>Every message gets read by a human (the cat supervises). It genuinely helps us keep things sorted.</p>
              <button className="btn btn--lime" onClick={() => setFeedbackOpen(false)}>
                Back to browsing
              </button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
              <p className="eyebrow">Feedback</p>
              <h2 id="fb-title">How&apos;s Keep It Sorted working for you?</h2>

              <div className="rating" role="radiogroup" aria-label="Rating" onMouseLeave={() => setHover(0)}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    ref={n === 1 ? firstRef : undefined}
                    type="button"
                    role="radio"
                    aria-checked={rating === n}
                    aria-label={`${n} star${n > 1 ? "s" : ""}`}
                    className={n <= shown ? "is-on" : ""}
                    onMouseEnter={() => setHover(n)}
                    onClick={() => setRating(n)}
                  >
                    ★
                  </button>
                ))}
                <span className="rating__label">{RATING_LABELS[shown] || "Tap a star"}</span>
              </div>

              <div className="chips" role="radiogroup" aria-label="Topic">
                {FEEDBACK_TOPICS.map((t) => (
                  <button key={t} type="button" role="radio" aria-checked={topic === t} className={`chip ${topic === t ? "is-active" : ""}`} onClick={() => setTopic(t)}>
                    {t}
                  </button>
                ))}
              </div>

              <label className="field-label" htmlFor="fb-message">
                Tell us more
              </label>
              <textarea
                id="fb-message"
                className="field field--area"
                rows={4}
                maxLength={2000}
                placeholder={topic === "Bug" ? "What happened, and what did you expect?" : "What would make this better?"}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <div className="field-hint">{message.length}/2000</div>

              {!user && (
                <>
                  <label className="field-label" htmlFor="fb-email">
                    Email <span>(optional, if you&apos;d like a reply)</span>
                  </label>
                  <input id="fb-email" className="field" type="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </>
              )}

              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}
              <button className="btn btn--lime btn--block" disabled={busy}>
                {busy ? "Sending…" : "Send feedback"}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
