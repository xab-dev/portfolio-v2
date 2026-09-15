import { describe, expect, it } from "vitest";
import { resolvePerfMode } from "./liteMode";

describe("resolvePerfMode", () => {
  it("surcharge ?perf=lite → lite, quel que soit le pointeur", () => {
    expect(
      resolvePerfMode({ search: "?perf=lite", storedOverride: null, prefersCoarsePointer: false }),
    ).toBe("lite");
  });

  it("surcharge ?perf=full → full, même sous pointeur coarse", () => {
    expect(
      resolvePerfMode({ search: "?perf=full", storedOverride: null, prefersCoarsePointer: true }),
    ).toBe("full");
  });

  it("pas de surcharge, pointeur coarse détecté → lite", () => {
    expect(
      resolvePerfMode({ search: "", storedOverride: null, prefersCoarsePointer: true }),
    ).toBe("lite");
  });

  it("pas de surcharge, pointeur fin ou matchMedia indisponible → full", () => {
    expect(
      resolvePerfMode({ search: "", storedOverride: null, prefersCoarsePointer: false }),
    ).toBe("full");
    expect(
      resolvePerfMode({ search: "", storedOverride: null, prefersCoarsePointer: null }),
    ).toBe("full");
  });

  it("surcharge mémorisée (sessionStorage) reprise en l'absence de paramètre URL", () => {
    expect(
      resolvePerfMode({ search: "", storedOverride: "lite", prefersCoarsePointer: false }),
    ).toBe("lite");
  });

  it("valeur ?perf= inconnue → ignorée, détection normale (edge case §4)", () => {
    expect(
      resolvePerfMode({ search: "?perf=turbo", storedOverride: null, prefersCoarsePointer: true }),
    ).toBe("lite");
    expect(
      resolvePerfMode({ search: "?perf=turbo", storedOverride: null, prefersCoarsePointer: false }),
    ).toBe("full");
  });
});
