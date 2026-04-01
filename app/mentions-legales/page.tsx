export default function MentionsLegalesPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-10 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
      <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Mentions legales</h1>
      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Editeur</h2>
        <p>ArthurP - Developpeur web & homelab</p>
        <p>Site de contact: contact.arthurp.fr</p>
        <p>Email: contact@arthurp.fr</p>
      </section>
      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Hebergement</h2>
        <p>Site auto-heberge sur infrastructure personnelle (Proxmox).</p>
      </section>
      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Propriete intellectuelle</h2>
        <p>Les contenus, marques et elements visuels restent la propriete de leurs auteurs respectifs.</p>
      </section>
      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Contact</h2>
        <p>Pour toute question legale: contact.arthurp.fr ou contact@arthurp.fr</p>
      </section>
    </main>
  );
}
