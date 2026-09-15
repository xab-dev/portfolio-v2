import { describe, expect, it } from "vitest";
import { parseSimulatorValue } from "./readSimulator";

describe("parseSimulatorValue", () => {
  it("clé absente (raw null) → source direct, sans erreur", () => {
    expect(parseSimulatorValue(null)).toEqual({ source: "direct" });
  });

  it("valeur illisible (JSON invalide ou forme inattendue) → source direct", () => {
    expect(parseSimulatorValue("pas du json")).toEqual({ source: "direct" });
    expect(parseSimulatorValue("{")).toEqual({ source: "direct" });
    expect(parseSimulatorValue("null")).toEqual({ source: "direct" });
    expect(parseSimulatorValue("42")).toEqual({ source: "direct" });
    expect(parseSimulatorValue(JSON.stringify({ selection: "support" }))).toEqual({ source: "direct" });
    expect(parseSimulatorValue(JSON.stringify({ selection: ["support", 1] }))).toEqual({ source: "direct" });
    expect(parseSimulatorValue(JSON.stringify({}))).toEqual({ source: "direct" });
  });

  it("valeur valide ({ selection: string[] }) → source simulator + sélection reprise", () => {
    expect(parseSimulatorValue(JSON.stringify({ selection: ["support", "saisie"] }))).toEqual({
      source: "simulator",
      simulatorSelection: ["support", "saisie"],
    });
    expect(parseSimulatorValue(JSON.stringify({ selection: [] }))).toEqual({
      source: "simulator",
      simulatorSelection: [],
    });
  });
});
