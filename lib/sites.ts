export const projectSites = [
  { value: "arthurp", label: "arthurp.fr", domain: "arthurp.fr", description: "Site principal" },
  { value: "links", label: "links.arthurp.fr", domain: "links.arthurp.fr", description: "Liens centralises" },
  { value: "qcu", label: "qcu.arthurp.fr", domain: "qcu.arthurp.fr", description: "Quiz et QCU" },
  { value: "qrcode", label: "qrcode.arthurp.fr", domain: "qrcode.arthurp.fr", description: "Generateur de QR Code" },
  { value: "lazybot", label: "lazybot.arthurp.fr", domain: "lazybot.arthurp.fr", description: "Bot et automatisations" },
  { value: "learn", label: "learn.arthurp.fr", domain: "learn.arthurp.fr", description: "Ressources d'apprentissage" },
  { value: "sudoku", label: "sudoku.arthurp.fr", domain: "sudoku.arthurp.fr", description: "Jeu Sudoku" },
  { value: "reducelink", label: "reducelink.arthurp.fr", domain: "reducelink.arthurp.fr", description: "Reducteur de liens" },
  { value: "clock", label: "clock.arthurp.fr", domain: "clock.arthurp.fr", description: "Horloge en ligne" },
  { value: "form", label: "form.arthurp.fr", domain: "form.arthurp.fr", description: "Formulaires" },
  { value: "pomodoro", label: "pomodoro.arthurp.fr", domain: "pomodoro.arthurp.fr", description: "Timer pomodoro" },
  { value: "visio", label: "visio.arthurp.fr", domain: "visio.arthurp.fr", description: "Visioconference" },
  { value: "doudou", label: "doudou.arthurp.fr", domain: "doudou.arthurp.fr", description: "Projet Doudou" },
  { value: "portfolio", label: "portfolio.arthurp.fr", domain: "portfolio.arthurp.fr", description: "Portfolio" },
  { value: "moon", label: "moon.arthurp.fr", domain: "moon.arthurp.fr", description: "Projet Moon" },
  { value: "calculatrice", label: "calculatrice.arthurp.fr", domain: "calculatrice.arthurp.fr", description: "Calculatrice" },
  { value: "chrono", label: "chrono.arthurp.fr", domain: "chrono.arthurp.fr", description: "Chronometre" },
  { value: "blocnote", label: "blocnote.arthurp.fr", domain: "blocnote.arthurp.fr", description: "Bloc-notes" },
  { value: "imprimersudoku", label: "imprimersudoku.arthurp.fr", domain: "imprimersudoku.arthurp.fr", description: "Impression Sudoku" },
  { value: "other", label: "Autre", domain: "autre", description: "Autre demande" },
] as const;

export type ProjectSite = (typeof projectSites)[number];
export type ProjectValue = ProjectSite["value"];

export const PROJECT_VALUES = projectSites.map((site) => site.value) as [ProjectValue, ...ProjectValue[]];

export const PROJECT_LABELS: Record<ProjectValue, string> = Object.fromEntries(
  projectSites.map((site) => [site.value, site.label]),
) as Record<ProjectValue, string>;

export const PROJECT_DESCRIPTIONS: Record<ProjectValue, string> = Object.fromEntries(
  projectSites.map((site) => [site.value, site.description]),
) as Record<ProjectValue, string>;

export const footerSites = projectSites.filter((site) => site.value !== "other");

export function normalizeProjectParam(rawProject: string | null): ProjectValue | null {
  if (!rawProject) {
    return null;
  }

  const cleaned = rawProject.trim().toLowerCase();
  const byValue = projectSites.find((site) => site.value === cleaned);
  if (byValue) {
    return byValue.value;
  }

  const byDomain = projectSites.find((site) => site.domain === cleaned);
  if (byDomain) {
    return byDomain.value;
  }

  if (cleaned === "qr-code" || cleaned === "qr" || cleaned === "qr-code-generator") {
    return "qrcode";
  }

  return null;
}
