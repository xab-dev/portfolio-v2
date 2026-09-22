import { beforeEach, describe, expect, it } from "vitest";
import { getServerTheme, getTheme, resetThemeStore, setTheme, subscribeTheme } from "./themeStore";

// Régression Phase 9c/4 : avec un état par instance de hook, le clic sur le
// bouton de la Navbar ne réveillait pas l'avatar du Hero. Ces tests verrouillent
// la diffusion à *tous* les abonnés, et la stabilité de l'instantané.
describe("themeStore", () => {
  beforeEach(() => {
    resetThemeStore();
  });

  it("sans DOM, la valeur de départ est le thème sombre", () => {
    expect(getTheme()).toBe("dark");
    expect(getServerTheme()).toBe("dark");
  });

  it("un changement réveille tous les abonnés, pas seulement le premier", () => {
    const vus: string[] = [];
    subscribeTheme(() => vus.push(`a:${getTheme()}`));
    subscribeTheme(() => vus.push(`b:${getTheme()}`));

    setTheme("light");

    expect(vus).toEqual(["a:light", "b:light"]);
    expect(getTheme()).toBe("light");
  });

  it("une valeur identique ne notifie personne (instantané stable)", () => {
    let appels = 0;
    subscribeTheme(() => {
      appels += 1;
    });

    setTheme("dark"); // déjà la valeur courante
    expect(appels).toBe(0);

    setTheme("light");
    setTheme("light");
    expect(appels).toBe(1);
  });

  it("un abonné désabonné ne reçoit plus rien", () => {
    let appels = 0;
    const desabonner = subscribeTheme(() => {
      appels += 1;
    });

    setTheme("light");
    expect(appels).toBe(1);

    desabonner();
    setTheme("dark");
    expect(appels).toBe(1);
  });

  it("un abonné qui se désabonne pendant la diffusion ne prive pas les suivants", () => {
    const vus: string[] = [];
    const desabonner = subscribeTheme(() => {
      vus.push("a");
      desabonner();
    });
    subscribeTheme(() => vus.push("b"));

    setTheme("light");

    expect(vus).toEqual(["a", "b"]);
  });
});
