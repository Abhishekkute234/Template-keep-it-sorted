"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, useApp, type User } from "@/components/providers/AppProvider";
import { toast } from "@/lib/store";

export function AccountActions() {
  const { signOut, setFeedbackOpen } = useApp();
  return (
    <div className="btn-row">
      <button className="btn btn--ghost" onClick={() => setFeedbackOpen(true)}>
        Send feedback
      </button>
      <button className="btn btn--ghost" onClick={signOut}>
        Sign out
      </button>
    </div>
  );
}

export function NameEditor({ initial }: { initial: string }) {
  const router = useRouter();
  const { setUser } = useApp();
  const [name, setName] = useState(initial);
  const [busy, setBusy] = useState(false);
  const dirty = name.trim() !== initial && name.trim().length > 0;

  return (
    <form
      className="name-editor"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        const res = await api<{ user: User }>("/api/auth/me", "PATCH", { name });
        setBusy(false);
        if (res.error || !res.user) return toast(res.error ?? "Couldn't save your name.");
        setUser(res.user);
        toast("Name updated.");
        router.refresh();
      }}
    >
      <label className="field-label" htmlFor="acct-name">
        Display name
      </label>
      <div className="name-editor__row">
        <input id="acct-name" className="field" maxLength={60} value={name} onChange={(e) => setName(e.target.value)} />
        <button className="btn btn--lime btn--sm" disabled={!dirty || busy}>
          {busy ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}
