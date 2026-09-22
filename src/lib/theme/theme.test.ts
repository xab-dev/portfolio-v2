import { describe, expect, it } from "vitest";
import { readStoredTheme, resolveTheme } from "./theme";

describe("readStoredTheme", () => {
  it("valeur stockée valide → elle est retournue telle quelle", () => {
    expect(readStoredTheme({ getItem: () => "light" })).toBe("light");
    expect(readStoredTheme({ getItem: () => "dark" })).toBe("dark");
  });

  it("valeur stockée invalide → null (on retombera sur le navigateur)", () => {
    expect(readStoredTheme({ getItem: () => "sombre" })).toBeNull();
    expect(readStoredTheme({ getItem: () => "" })).toBeNull();
  });

  it("aucune valeur stockée → null", () => {
    expect(readStoredTheme({ getItem: () => null })).toBeNull();
  });

  it("`getItem` qui lève (Safari privé, stockage bloqué) → null, pas d'exception", () => {
    expect(
      readStoredTheme({
        getItem: () => {
          throw new Error("SecurityError");
        },
      }),
    ).toBeNull();
  });

  it("storage indisponible (null) → null", () => {
    expect(readStoredTheme(null)).toBeNull();
  });
});

describe("resolveTheme", () => {
  it("un choix explicite prime sur le navigateur (D3), dans les deux sens", () => {
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
  });

  it("aucun choix stocké + navigateur en sombre → sombre", () => {
    expect(resolveTheme(null, true)).toBe("dark");
  });

  it("aucun choix stocké + navigateur en clair → clair", () => {
    expect(resolveTheme(null, false)).toBe("light");
  });
});
