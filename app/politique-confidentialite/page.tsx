export default function PolitiqueConfidentialitePage() {
  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-10 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
      <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Politique de confidentialite</h1>
      <section className="space-y-2">
        <p>
          Les informations saisies dans le formulaire (nom, email, message, projet, URL source) sont utilisees
          uniquement pour traiter votre demande.
        </p>
        <p>Les donnees sont stockees dans une base PostgreSQL auto-hebergee et ne sont pas revendues.</p>
      </section>
      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Base legale</h2>
        <p>Interet legitime: repondre aux demandes de contact et assurer le support des projets.</p>
      </section>
      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Conservation</h2>
        <p>Les messages sont conserves le temps necessaire au support et au suivi des echanges.</p>
      </section>
      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Droits</h2>
        <p>Vous pouvez demander acces, rectification ou suppression via contact@arthurp.fr.</p>
      </section>
    </main>
  );
}
