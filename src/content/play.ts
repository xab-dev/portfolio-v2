import { site } from "./site";

export const play = {
  title: "Jouer — haTD, mon tower defense (v1 en ligne)",
  intro: "Prototype jouable en ligne, développé seul et piloté par specs — la preuve la plus concrète que je livre des choses qui tournent.",
  url: site.hatdUrl,
  // DETTE-24 validé : le cold-open complet est trop long, 18 s suffisent comme teaser.
  teaserMs: 18_000,
  // T12 — ne pas changer sans nouvelle version de haTD (pas jouable au tactile).
  playableOnTouch: false,
};
