"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";

type AdminMessage = {
  id: number;
  name: string;
  email: string;
  project: string;
  requestType: string;
  message: string;
  createdAt: string;
  repliedAt: string | null;
  adminReply: string | null;
  status: "pending" | "replied";
};

type FilterState = "all" | "pending" | "replied";

export default function AdminPanelClient() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [login, setLogin] = useState({ username: "", password: "" });
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [replyDrafts, setReplyDrafts] = useState<Record<number, string>>({});
  const [replyingId, setReplyingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterState>("all");

  async function checkSession() {
    setIsChecking(true);
    try {
      const response = await fetch("/api/admin/me");
      setIsAuthenticated(response.ok);
    } finally {
      setIsChecking(false);
    }
  }

  useEffect(() => {
    checkSession();
  }, []);

  async function loadMessages() {
    setLoadingMessages(true);
    try {
      const response = await fetch("/api/admin/messages");
      if (!response.ok) {
        if (response.status === 401) {
          setIsAuthenticated(false);
          return;
        }
        throw new Error("Impossible de charger les messages.");
      }

      const data = (await response.json()) as { messages: AdminMessage[] };
      setMessages(data.messages);
      const initialDrafts = Object.fromEntries(
        data.messages.map((item) => [item.id, item.adminReply ?? ""]),
      ) as Record<number, string>;
      setReplyDrafts(initialDrafts);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Erreur de chargement.");
    } finally {
      setLoadingMessages(false);
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      loadMessages();
    }
  }, [isAuthenticated]);

  async function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthError(null);

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(login),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      setAuthError(payload?.message ?? "Connexion impossible.");
      return;
    }

    setIsAuthenticated(true);
    setLogin({ username: "", password: "" });
    await loadMessages();
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setIsAuthenticated(false);
    setMessages([]);
  }

  async function sendReply(id: number) {
    const reply = (replyDrafts[id] || "").trim();
    if (reply.length < 5) {
      setAuthError("La reponse doit contenir au moins 5 caracteres.");
      return;
    }

    setReplyingId(id);
    setAuthError(null);

    try {
      const response = await fetch(`/api/admin/messages/${id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(payload?.message ?? "Impossible d'envoyer la reponse.");
      }

      await loadMessages();
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Erreur d'envoi.");
    } finally {
      setReplyingId(null);
    }
  }

  async function toggleStatus(item: AdminMessage) {
    const nextStatus = item.status === "pending" ? "replied" : "pending";
    setStatusUpdatingId(item.id);
    setAuthError(null);

    try {
      const response = await fetch(`/api/admin/messages/${item.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(payload?.message ?? "Impossible de changer le statut.");
      }

      await loadMessages();
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Erreur de statut.");
    } finally {
      setStatusUpdatingId(null);
    }
  }

  async function removeMessage(id: number) {
    const confirmed = window.confirm("Supprimer ce message ? Cette action est irreversible.");
    if (!confirmed) {
      return;
    }

    setDeletingId(id);
    setAuthError(null);

    try {
      const response = await fetch(`/api/admin/messages/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(payload?.message ?? "Suppression impossible.");
      }

      await loadMessages();
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Erreur de suppression.");
    } finally {
      setDeletingId(null);
    }
  }

  const stats = useMemo(() => {
    const total = messages.length;
    const replied = messages.filter((item) => item.status === "replied").length;
    return { total, replied, pending: total - replied };
  }, [messages]);

  const filteredMessages = useMemo(() => {
    if (activeFilter === "all") {
      return messages;
    }

    return messages.filter((item) => item.status === activeFilter);
  }, [messages, activeFilter]);

  if (isChecking) {
    return <main className="mx-auto max-w-5xl px-4 py-10">Verification de session...</main>;
  }

  if (!isAuthenticated) {
    return (
      <main className="mx-auto max-w-md px-4 py-10">
        <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900/80">
          <div className="mb-4">
            <Link
              href="/"
              className="inline-flex rounded-xl border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              Retour a l&apos;accueil
            </Link>
          </div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Connexion admin</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Connecte-toi pour voir les messages et repondre depuis le tableau de bord.
          </p>
          <form className="mt-5 space-y-4" onSubmit={submitLogin}>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Identifiant
              <input
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
                value={login.username}
                onChange={(event) => setLogin((prev) => ({ ...prev, username: event.target.value }))}
                required
              />
            </label>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Mot de passe
              <input
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
                type="password"
                value={login.password}
                onChange={(event) => setLogin((prev) => ({ ...prev, password: event.target.value }))}
                required
              />
            </label>
            <button
              type="submit"
              className="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 dark:bg-cyan-500 dark:text-slate-950"
            >
              Se connecter
            </button>
          </form>
          {authError ? <p className="mt-3 text-sm text-rose-600">{authError}</p> : null}
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-10">
      <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900/80">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Espace admin</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">Gestion des messages de contact</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              Retour a l&apos;accueil
            </Link>
            <button
              onClick={logout}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              Se deconnecter
            </button>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <button
            onClick={() => setActiveFilter("all")}
            className={[
              "rounded-full px-3 py-1",
              activeFilter === "all" ? "bg-slate-900 text-white dark:bg-cyan-500 dark:text-slate-950" : "bg-slate-100 dark:bg-slate-800",
            ].join(" ")}
          >
            Total: {stats.total}
          </button>
          <button
            onClick={() => setActiveFilter("pending")}
            className={[
              "rounded-full px-3 py-1",
              activeFilter === "pending"
                ? "bg-amber-600 text-white dark:bg-amber-500 dark:text-slate-950"
                : "bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-200",
            ].join(" ")}
          >
            En attente: {stats.pending}
          </button>
          <button
            onClick={() => setActiveFilter("replied")}
            className={[
              "rounded-full px-3 py-1",
              activeFilter === "replied"
                ? "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950"
                : "bg-emerald-100 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-200",
            ].join(" ")}
          >
            Repondus: {stats.replied}
          </button>
        </div>
      </section>

      {loadingMessages ? (
        <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 dark:border-slate-800 dark:bg-slate-900/80">Chargement...</section>
      ) : null}

      {filteredMessages.map((item) => (
        <article key={item.id} className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">#{item.id} - {new Date(item.createdAt).toLocaleString("fr-FR")}</p>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{item.name} ({item.email})</h2>
              <p className="text-sm text-cyan-700 dark:text-cyan-300">{item.project} - {item.requestType}</p>
            </div>
            {item.status === "replied" ? (
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200">
                Repondu
              </span>
            ) : (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-500/20 dark:text-amber-200">
                En attente
              </span>
            )}
          </div>

          <p className="mt-4 whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-950/50">
            {item.message}
          </p>

          <div className="mt-4 space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Reponse admin
              <textarea
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                rows={4}
                value={replyDrafts[item.id] ?? ""}
                onChange={(event) =>
                  setReplyDrafts((prev) => ({ ...prev, [item.id]: event.target.value }))
                }
              />
            </label>
            <button
              onClick={() => sendReply(item.id)}
              disabled={replyingId === item.id}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60 dark:bg-cyan-500 dark:text-slate-950"
            >
              {replyingId === item.id ? "Envoi..." : "Envoyer la reponse"}
            </button>
            <div className="flex flex-wrap gap-2 pt-2">
              <button
                onClick={() => toggleStatus(item)}
                disabled={statusUpdatingId === item.id}
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100 disabled:opacity-60 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                {statusUpdatingId === item.id
                  ? "Mise a jour..."
                  : item.status === "pending"
                    ? "Passer en repondu"
                    : "Repasser en attente"}
              </button>
              <button
                onClick={() => removeMessage(item.id)}
                disabled={deletingId === item.id}
                className="rounded-xl border border-rose-300 px-3 py-2 text-sm text-rose-700 hover:bg-rose-50 disabled:opacity-60 dark:border-rose-500/40 dark:text-rose-300 dark:hover:bg-rose-500/10"
              >
                {deletingId === item.id ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </article>
      ))}

      {!loadingMessages && filteredMessages.length === 0 ? (
        <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300">
          Aucun message dans ce filtre.
        </section>
      ) : null}

      {authError ? <p className="text-sm text-rose-600 dark:text-rose-400">{authError}</p> : null}
    </main>
  );
}
