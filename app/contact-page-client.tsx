"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Link as LinkIcon, Mail, MessageCircle, Send, ShieldCheck } from "lucide-react";
import {
  contactPayloadSchema,
  normalizeProjectParam,
  PROJECT_LABELS,
  projectValues,
  REQUEST_TYPE_LABELS,
  requestTypeValues,
  type ContactPayload,
} from "@/lib/contact";
import { footerSites, PROJECT_DESCRIPTIONS } from "@/lib/sites";

type FormState = ContactPayload;
type StatusState = { type: "success" | "error"; message: string } | null;

type TouchedState = {
  [K in keyof FormState]?: boolean;
};

const initialState: FormState = {
  name: "",
  email: "",
  project: "other",
  requestType: "question",
  message: "",
  honeypot: "",
  sourceUrl: "",
};

const faqItems = [
  {
    question: "Tu reponds en combien de temps ?",
    answer: "En general sous 24h ouvrables. Pour les urgences techniques, je priorise les bugs critiques.",
  },
  {
    question: "Les projets sont-ils gratuits ?",
    answer: "La plupart ont un acces gratuit. Selon les besoins, certaines fonctionnalites peuvent etre premium ou auto-hebergees.",
  },
  {
    question: "Puis-je proposer une idee ?",
    answer: "Oui. Les suggestions sont les bienvenues, surtout si elles incluent le contexte, le besoin et un exemple concret.",
  },
];

function inputClass(hasError: boolean) {
  return [
    "w-full rounded-2xl border bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:ring-2 dark:bg-slate-950/60 dark:text-slate-100",
    hasError
      ? "border-rose-300 focus:border-rose-400 focus:ring-rose-200/70 dark:border-rose-500/40 dark:focus:ring-rose-500/30"
      : "border-slate-200 focus:border-cyan-300 focus:ring-cyan-200/70 dark:border-slate-800 dark:focus:border-cyan-500 dark:focus:ring-cyan-500/30",
  ].join(" ");
}

export default function ContactPageClient() {
  const searchParams = useSearchParams();
  const [form, setForm] = useState<FormState>(initialState);
  const [touched, setTouched] = useState<TouchedState>({});
  const [status, setStatus] = useState<StatusState>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    const projectFromQuery = normalizeProjectParam(searchParams.get("project"));
    if (!projectFromQuery) {
      return;
    }

    setForm((current) => ({ ...current, project: projectFromQuery }));
  }, [searchParams]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    setForm((current) => ({
      ...current,
      sourceUrl: `${window.location.origin}${window.location.pathname}${window.location.search}`,
    }));
  }, []);

  const validation = useMemo(() => contactPayloadSchema.safeParse(form), [form]);

  const fieldErrors = useMemo(() => {
    if (validation.success) {
      return {} as Record<keyof FormState, string | undefined>;
    }

    const flattened = validation.error.flatten().fieldErrors;
    return {
      name: flattened.name?.[0],
      email: flattened.email?.[0],
      project: flattened.project?.[0],
      requestType: flattened.requestType?.[0],
      message: flattened.message?.[0],
      honeypot: flattened.honeypot?.[0],
      sourceUrl: flattened.sourceUrl?.[0],
    } satisfies Record<keyof FormState, string | undefined>;
  }, [validation]);

  const isFormValid = validation.success;
  const selectedProjectLabel = PROJECT_LABELS[form.project];

  const updateField = (name: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [name]: value }));
    setStatus(null);
  };

  const markTouched = (name: keyof FormState) => {
    setTouched((current) => ({ ...current, [name]: true }));
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setHasSubmitted(true);

    if (!isFormValid) {
      setStatus({
        type: "error",
        message: "Le formulaire contient des erreurs. Corrige-les puis renvoie ton message.",
      });
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const payload = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.message ?? "Une erreur est survenue lors de l'envoi.");
      }

      setStatus({
        type: "success",
        message: "Message envoye ! Je te repondrai rapidement par email.",
      });
      setForm((current) => ({ ...initialState, project: current.project }));
      setTouched({});
      setHasSubmitted(false);
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Impossible d'envoyer le message pour le moment.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-[700px] space-y-8 px-4 py-10 sm:px-6 sm:py-14">
      <section className="animate-fade-in space-y-4 rounded-3xl border border-white/40 bg-white/70 p-6 shadow-lg shadow-slate-900/5 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70 sm:p-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
          <ShieldCheck className="h-4 w-4" />
          Reponse rapide ⚡
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          📬 Me contacter
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 sm:text-base">
          Une question, un bug ou une idee ? Je reponds rapidement.
        </p>
        <p className="text-sm font-medium text-cyan-700 dark:text-cyan-300">
          Temps de reponse moyen : &lt; 24h
        </p>
      </section>

      <section className="animate-fade-in rounded-3xl border border-white/40 bg-white/80 p-6 shadow-xl shadow-slate-900/5 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 sm:p-8">
        <div className="mb-6 rounded-2xl border border-cyan-100 bg-cyan-50/70 p-4 text-sm text-cyan-900 dark:border-cyan-900/40 dark:bg-cyan-900/20 dark:text-cyan-200">
          Vous contactez a propos de : <strong>{selectedProjectLabel}</strong>
          <div className="mt-1 text-xs opacity-80">{PROJECT_DESCRIPTIONS[form.project]}</div>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              Nom *
              <input
                name="name"
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                onBlur={() => markTouched("name")}
                className={inputClass(Boolean(fieldErrors.name && (touched.name || hasSubmitted)))}
                type="text"
                autoComplete="name"
                placeholder="Arthur"
                required
              />
              {fieldErrors.name && (touched.name || hasSubmitted) ? (
                <span className="text-xs text-rose-600 dark:text-rose-400">{fieldErrors.name}</span>
              ) : null}
            </label>

            <label className="space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              Email *
              <input
                name="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                onBlur={() => markTouched("email")}
                className={inputClass(Boolean(fieldErrors.email && (touched.email || hasSubmitted)))}
                type="email"
                autoComplete="email"
                placeholder="vous@domaine.fr"
                required
              />
              {fieldErrors.email && (touched.email || hasSubmitted) ? (
                <span className="text-xs text-rose-600 dark:text-rose-400">{fieldErrors.email}</span>
              ) : null}
            </label>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              Projet concerne
              <select
                name="project"
                value={form.project}
                onChange={(event) => updateField("project", event.target.value)}
                onBlur={() => markTouched("project")}
                className={inputClass(Boolean(fieldErrors.project && (touched.project || hasSubmitted)))}
              >
                {projectValues.map((project) => (
                  <option key={project} value={project}>
                    {PROJECT_LABELS[project]}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              Type de demande
              <select
                name="requestType"
                value={form.requestType}
                onChange={(event) => updateField("requestType", event.target.value)}
                onBlur={() => markTouched("requestType")}
                className={inputClass(Boolean(fieldErrors.requestType && (touched.requestType || hasSubmitted)))}
              >
                {requestTypeValues.map((requestType) => (
                  <option key={requestType} value={requestType}>
                    {REQUEST_TYPE_LABELS[requestType]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">
            Message *
            <textarea
              name="message"
              value={form.message}
              onChange={(event) => updateField("message", event.target.value)}
              onBlur={() => markTouched("message")}
              className={inputClass(Boolean(fieldErrors.message && (touched.message || hasSubmitted)))}
              placeholder="Explique ton besoin, le contexte, et le resultat attendu..."
              minLength={10}
              rows={6}
              required
            />
            {fieldErrors.message && (touched.message || hasSubmitted) ? (
              <span className="text-xs text-rose-600 dark:text-rose-400">{fieldErrors.message}</span>
            ) : (
              <span className="text-xs text-slate-500 dark:text-slate-400">Minimum 10 caracteres.</span>
            )}
          </label>

          <label className="sr-only" aria-hidden="true">
            Laisser ce champ vide
            <input
              tabIndex={-1}
              autoComplete="off"
              name="honeypot"
              value={form.honeypot}
              onChange={(event) => updateField("honeypot", event.target.value)}
              className="absolute left-[-9999px] top-[-9999px]"
            />
          </label>

          <input type="hidden" name="sourceUrl" value={form.sourceUrl} readOnly />

          <button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"
          >
            <Send className="h-4 w-4" />
            {isSubmitting ? "Envoi en cours..." : "Envoyer le message"}
          </button>

          {status ? (
            <p
              className={[
                "rounded-2xl border px-4 py-3 text-sm",
                status.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
                  : "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300",
              ].join(" ")}
            >
              {status.type === "success" ? "✅ " : "⚠️ "}
              {status.message}
            </p>
          ) : null}
        </form>
      </section>

      <section className="animate-fade-in rounded-3xl border border-white/40 bg-white/80 p-6 shadow-lg shadow-slate-900/5 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70 sm:p-8">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Autres moyens de contact</h2>
        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
          <a
            className="group rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-cyan-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-950/50"
            href="https://github.com/arthur-pbty"
            target="_blank"
            rel="noopener noreferrer"
          >
            <LinkIcon className="mb-2 h-5 w-5 text-slate-700 group-hover:text-cyan-600 dark:text-slate-200 dark:group-hover:text-cyan-300" />
            <p className="font-medium text-slate-900 dark:text-white">GitHub</p>
            <p className="text-slate-600 dark:text-slate-400">Pour signaler des bugs</p>
          </a>

          <a
            className="group rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-cyan-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-950/50"
            href="mailto:contact@arthurp.fr"
          >
            <Mail className="mb-2 h-5 w-5 text-slate-700 group-hover:text-cyan-600 dark:text-slate-200 dark:group-hover:text-cyan-300" />
            <p className="font-medium text-slate-900 dark:text-white">Email</p>
            <p className="text-slate-600 dark:text-slate-400">Contact direct</p>
          </a>

          <a
            className="group rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-cyan-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-950/50"
            href="https://contact.arthurp.fr"
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle className="mb-2 h-5 w-5 text-slate-700 group-hover:text-cyan-600 dark:text-slate-200 dark:group-hover:text-cyan-300" />
            <p className="font-medium text-slate-900 dark:text-white">contact.arthurp.fr</p>
            <p className="text-slate-600 dark:text-slate-400">Canal de contact principal</p>
          </a>
        </div>
      </section>

      <section className="animate-fade-in rounded-3xl border border-white/40 bg-white/80 p-6 shadow-lg shadow-slate-900/5 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70 sm:p-8">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">FAQ rapide</h2>
        <div className="mt-4 space-y-3">
          {faqItems.map((item) => (
            <details
              key={item.question}
              className="group rounded-2xl border border-slate-200 bg-white px-4 py-3 open:border-cyan-300 dark:border-slate-800 dark:bg-slate-950/40"
            >
              <summary className="cursor-pointer list-none text-sm font-medium text-slate-900 dark:text-slate-100">
                {item.question}
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
      </div>

      <footer className="animate-fade-in w-full border-y border-slate-200 bg-linear-to-b from-white/95 to-slate-50 text-sm text-slate-700 shadow-lg shadow-slate-900/5 dark:border-slate-800 dark:from-slate-900/80 dark:to-slate-950 dark:text-slate-300">
        <div className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-8 sm:py-12">
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 sm:p-6">
            <p className="text-base font-semibold text-slate-900 dark:text-white">ArthurP</p>
            <p className="mt-1 text-slate-600 dark:text-slate-400">Contact rapide et support projets via le hub de contact.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a
                className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-cyan-300 hover:text-cyan-700 dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-200 dark:hover:border-cyan-500 dark:hover:text-cyan-300"
                href="https://contact.arthurp.fr"
                target="_blank"
                rel="noopener noreferrer"
              >
                contact.arthurp.fr
              </a>
              <a
                className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-cyan-300 hover:text-cyan-700 dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-200 dark:hover:border-cyan-500 dark:hover:text-cyan-300"
                href="mailto:contact@arthurp.fr"
              >
                contact@arthurp.fr
              </a>
            </div>
          </div>

          <div className="mt-8 grid gap-8 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,1fr)]">
            <div>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">Navigation</p>
              <ul className="mt-3 space-y-2">
                <li><a className="hover:text-cyan-600 dark:hover:text-cyan-300" href="https://arthurp.fr" target="_blank" rel="noopener noreferrer">Accueil</a></li>
                <li><a className="hover:text-cyan-600 dark:hover:text-cyan-300" href="https://portfolio.arthurp.fr" target="_blank" rel="noopener noreferrer">Projets</a></li>
                <li><a className="hover:text-cyan-600 dark:hover:text-cyan-300" href="https://contact.arthurp.fr" target="_blank" rel="noopener noreferrer">Contact</a></li>
              </ul>
            </div>

            <div>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">Liens</p>
              <ul className="mt-3 space-y-2">
                <li><a className="hover:text-cyan-600 dark:hover:text-cyan-300" href="https://arthurp.fr" target="_blank" rel="noopener noreferrer">arthurp.fr</a></li>
                <li><a className="hover:text-cyan-600 dark:hover:text-cyan-300" href="https://github.com/arthur-pbty" target="_blank" rel="noopener noreferrer">GitHub</a></li>
                <li><a className="hover:text-cyan-600 dark:hover:text-cyan-300" href="mailto:contact@arthurp.fr">contact@arthurp.fr</a></li>
                <li><a className="hover:text-cyan-600 dark:hover:text-cyan-300" href="https://contact.arthurp.fr" target="_blank" rel="noopener noreferrer">contact.arthurp.fr</a></li>
              </ul>
            </div>

            <div>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">Legal</p>
              <ul className="mt-3 space-y-2">
                <li><Link className="hover:text-cyan-600 dark:hover:text-cyan-300" href="/mentions-legales">Mentions legales</Link></li>
                <li><Link className="hover:text-cyan-600 dark:hover:text-cyan-300" href="/politique-confidentialite">Politique de confidentialite</Link></li>
                <li><Link className="hover:text-cyan-600 dark:hover:text-cyan-300" href="/cgu">CGU</Link></li>
                <li><Link className="hover:text-cyan-600 dark:hover:text-cyan-300" href="/cookies">Cookies</Link></li>
                <li><Link className="hover:text-cyan-600 dark:hover:text-cyan-300" href="/admin">Admin</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-200 pt-5 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
            <p>© 2026 Arthur P. Tous droits reserves.</p>
            <p className="mt-1">Fait avec ❤️ et auto-heberge sur Proxmox.</p>
          </div>

          <div className="mt-6 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="rounded-full border border-slate-200 px-2 py-1 dark:border-slate-700">Docker</span>
            <span className="rounded-full border border-slate-200 px-2 py-1 dark:border-slate-700">Proxmox</span>
            <span className="rounded-full border border-slate-200 px-2 py-1 dark:border-slate-700">Next.js</span>
            <span className="rounded-full border border-slate-200 px-2 py-1 dark:border-slate-700">Node.js</span>
          </div>

          <details className="mt-6 rounded-2xl border border-slate-200 bg-white/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
            <summary className="cursor-pointer text-sm font-medium text-slate-900 dark:text-white">Afficher les autres sites ArthurP</summary>
            <ul className="mt-4 grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
              {footerSites.map((site) => (
                <li key={site.domain}>
                  <a
                    className="hover:text-cyan-600 dark:hover:text-cyan-300"
                    href={`https://${site.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {site.label}
                  </a>
                </li>
              ))}
            </ul>
          </details>
        </div>
      </footer>
    </div>
  );
}
