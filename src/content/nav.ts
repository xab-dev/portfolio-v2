export interface NavLink {
  id: string;
  label: string;
}

export const navLinks: NavLink[] = [
  { id: "hero", label: "Accueil" },
  { id: "simulateur", label: "Simulateur" },
  { id: "playground", label: "Playground" },
  { id: "projets", label: "Projets" },
  { id: "competences", label: "Compétences" },
  { id: "contact", label: "Contact" },
  { id: "jouer", label: "Jouer" },
];
