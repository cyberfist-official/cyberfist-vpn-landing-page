"use client";

import { FormEvent, useState } from "react";

type WaitlistModalProps = {
  children: React.ReactNode; // button label (e.g. "Join the Waitlist")
};

export default function WaitlistModal({ children }: WaitlistModalProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    // TODO: hook this up to a real backend (ConvertKit, MailerLite, etc.)
    console.log("Waitlist email:", email);

    setSubmitted(true);
  }

  function closeModal() {
    setOpen(false);
    setSubmitted(false);
    setEmail("");
  }

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center rounded-xl bg-accent-beige px-8 py-3 text-sm sm:text-base font-semibold text-dark-bg shadow-[0_18px_45px_rgba(0,0,0,0.55)] shadow-amber-900/30 transition hover:-translate-y-0.5 hover:shadow-[0_22px_55px_rgba(0,0,0,0.65)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal focus-visible:ring-offset-2 focus-visible:ring-offset-dark-bg"
      >
        {children}
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-3xl border border-emerald-500/15 bg-[#06181D] p-6 sm:p-8 shadow-2xl">
            <h2 className="mb-2 text-2xl sm:text-3xl font-bold text-cream">
              Join the Waitlist
            </h2>
            <p className="mb-6 text-sm sm:text-base text-muted">
              Be first to know when CyberFist goes live. No spam — ever.
            </p>

            {submitted ? (
              <p className="text-sm text-emerald-300">
                Thanks — you’re on the list. We’ll email you as soon as we’re
                ready.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <label className="block text-sm font-medium text-muted">
                  Email address
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="mt-2 w-full rounded-xl border border-emerald-500/25 bg-[#031015] px-3 py-2 text-sm sm:text-base text-cream placeholder:text-slate-500 outline-none focus:border-accent-teal focus:ring-1 focus:ring-accent-teal"
                  />
                </label>

                <button
                  type="submit"
                  className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-accent-beige px-4 py-2.5 text-sm sm:text-base font-semibold text-dark-bg shadow-[0_18px_45px_rgba(0,0,0,0.55)] shadow-amber-900/30 transition hover:-translate-y-0.5 hover:shadow-[0_22px_55px_rgba(0,0,0,0.65)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal focus-visible:ring-offset-2 focus-visible:ring-offset-[#06181D]"
                >
                  Join the Waitlist
                </button>
              </form>
            )}

            <button
              type="button"
              onClick={closeModal}
              className="mt-5 w-full rounded-xl border border-slate-600/60 bg-transparent px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-50/5"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
