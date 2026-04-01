export default function CookiesPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-10 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
      <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Politique cookies</h1>
      <section className="space-y-2">
        <p>Ce site utilise un cookie technique pour la session admin (connexion au tableau de bord).</p>
        <p>Aucun cookie publicitaire ou de tracking tiers n&apos;est depose par defaut.</p>
      </section>
      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Session admin</h2>
        <p>Le cookie admin est HttpOnly, SameSite=Lax et expire automatiquement.</p>
      </section>
    </main>
  );
}
