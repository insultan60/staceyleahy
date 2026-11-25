"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { images } from "@/content/site";

/**
 * "Tailored listings" lead popup. Opens once per visitor after a short delay
 * (or when they move to leave on desktop), never on the contact page.
 * Leads POST as JSON to NEXT_PUBLIC_LEAD_ENDPOINT (e.g. a Formspree or Web3Forms URL).
 */
const ENDPOINT = process.env.NEXT_PUBLIC_LEAD_ENDPOINT ?? "";
const KEY = "sl-lead-popup";
const DELAY_MS = 12000;

export default function LeadPopup() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (pathname.startsWith("/contact") || localStorage.getItem(KEY)) return;
    const show = () => setOpen(true);
    const t = setTimeout(show, DELAY_MS);
    const onLeave = (e: MouseEvent) => { if (e.clientY <= 0) show(); };
    document.addEventListener("mouseout", onLeave);
    return () => { clearTimeout(t); document.removeEventListener("mouseout", onLeave); };
  }, [pathname]);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const close = () => {
    localStorage.setItem(KEY, String(Date.now()));
    setOpen(false);
  };

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    setState("sending");
    try {
      if (ENDPOINT) {
        const r = await fetch(ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ ...data, subject: "New lead: Tailored listings", source: "Website popup", page: pathname }),
        });
        if (!r.ok) throw new Error(String(r.status));
      }
      localStorage.setItem(KEY, "subscribed");
      setState("done");
    } catch {
      setState("error");
    }
  }

  return (
    <dialog
      ref={dialog}
      onCancel={(e) => { e.preventDefault(); close(); }}
      onClick={(e) => { if (e.target === e.currentTarget) close(); }}
      aria-labelledby="lead-title"
      className="m-auto w-[min(92vw,1100px)] max-w-none bg-transparent p-0 backdrop:bg-forest-950/75 backdrop:backdrop-blur-sm"
    >
      <div className="grid overflow-hidden bg-ivory text-ink md:grid-cols-[1.15fr_1fr]">
        <div className="relative hidden min-h-[520px] md:block">
          <Image src={images.buy.src} alt="" fill sizes="560px" className="object-cover" />
        </div>
        <div className="relative px-7 py-12 sm:px-12 sm:py-16">
          <button type="button" onClick={close} aria-label="Close" className="absolute top-4 right-4 flex size-11 items-center justify-center text-3xl leading-none text-forest-900 hover:text-gold-600">
            ×
          </button>
          {state === "done" ? (
            <div role="status" className="flex h-full flex-col justify-center">
              <h2 className="font-display text-4xl text-forest-900 sm:text-5xl">Thank you.</h2>
              <p className="mt-4 text-ink-soft">Stacey will be in touch with listings that match what you&apos;re looking for.</p>
              <button type="button" onClick={close} className="btn-gold mt-8 self-start px-8 py-4 text-sm font-semibold tracking-[0.16em] uppercase">
                Close
              </button>
            </div>
          ) : (
            <>
              <h2 id="lead-title" className="font-display text-4xl leading-tight text-forest-900 uppercase sm:text-5xl">
                Tailored listings <br />
                <em className="text-gold-600 normal-case">for you</em>
              </h2>
              <p className="mt-5 text-sm leading-relaxed tracking-[0.06em] text-ink-soft uppercase">
                Say goodbye to endless searching. Get listings tailored to your dream home criteria sent directly to your inbox.
              </p>
              <form onSubmit={submit} className="mt-8 space-y-5">
                <label className="block">
                  <span className="sr-only">Email</span>
                  <input name="email" type="email" required placeholder="Email" autoComplete="email" className="w-full border border-forest-900/25 bg-white px-4 py-3.5 text-ink outline-none focus:border-gold-500" />
                </label>
                <label className="flex gap-3 text-xs leading-relaxed text-ink-soft">
                  <input name="consent" type="checkbox" required value="yes" className="mt-0.5 size-4 shrink-0 accent-forest-900" />
                  <span>
                    I agree to be contacted by Stacey Leahy via call, email, and text for real estate services. To opt out, reply
                    &lsquo;stop&rsquo; at any time or reply &lsquo;help&rsquo; for assistance. You can also click the unsubscribe link in
                    the emails. Message and data rates may apply. Message frequency may vary.{" "}
                    <Link href="/terms" className="underline" onClick={close}>Privacy Policy</Link>.
                  </span>
                </label>
                <button type="submit" disabled={state === "sending"} className="bg-forest-900 px-10 py-4 text-sm font-semibold tracking-[0.16em] text-ivory uppercase transition-colors hover:bg-gold-500 hover:text-forest-950 disabled:opacity-60">
                  {state === "sending" ? "Sending…" : "Submit"}
                </button>
                {state === "error" && <p role="alert" className="text-sm text-red-700">Something went wrong. Please try again or call (424) 522-8484.</p>}
              </form>
            </>
          )}
        </div>
      </div>
    </dialog>
  );
}
