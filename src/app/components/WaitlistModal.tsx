"use client";

import { useState, FormEvent } from "react";

type WaitlistModalProps = {
  isOpen: boolean;
  onClose: () => void;
  /**
   * Where this signup came from, e.g. "hero_button", "footer", "blog_post_x".
   * This gets combined with UTM params server-side.
   */
  source?: string;
};

export default function WaitlistModal({
  isOpen,
  onClose,
  source = "hero_button",
}: WaitlistModalProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const formData = new FormData(e.currentTarget);
    const hp = (formData.get("hp") as string) || "";

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          source,
          hp, // honeypot field – server drops if non-empty
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setErrorMessage(
          data?.error || "Something went wrong. Please try again.",
        );
        return;
      }

      setStatus("success");
      setEmail("");
    } catch (err) {
      console.error("[WAITLIST] Frontend error:", err);
      setStatus("error");
      setErrorMessage("Something went wrong. Please try again.");
    }
  }

  function handleClose() {
    setStatus("idle");
    setErrorMessage("");
    setEmail("");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 px-6 py-6 shadow-2xl">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute right-3 top-3 rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-300 hover:bg-slate-700"
        >
          ✕
        </button>

        {status === "success" ? (
          <div className="space-y-3 text-center">
            <h2 className="text-xl font-semibold text-slate-50">
              You&apos;re on the list
            </h2>
            <p className="text-sm text-slate-400">
              We&apos;ll email you as soon as CyberFist VPN is ready for early
              access.
            </p>
            <button
              onClick={handleClose}
              className="mt-2 w-full rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-400"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-50">
                Join the CyberFist VPN waitlist
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Enter your email to get early access when we launch.
              </p>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="waitlist-email"
                className="block text-xs font-medium uppercase tracking-wide text-slate-400"
              >
                Email address
              </label>
              <input
                id="waitlist-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                placeholder="you@example.com"
              />
            </div>

            {/* Honeypot field – visible to bots, invisible to humans */}
            <div className="hidden">
              <label htmlFor="hp">Leave this field empty</label>
              <input
                id="hp"
                name="hp"
                type="text"
                autoComplete="off"
                tabIndex={-1}
              />
            </div>

            {status === "error" && (
              <p className="text-sm text-rose-400">{errorMessage}</p>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="flex w-full items-center justify-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {status === "loading" ? "Joining..." : "Join waitlist"}
            </button>

            <p className="text-center text-[11px] text-slate-500">
              No spam. We&apos;ll only contact you about CyberFist VPN.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
