import { describe, expect, it } from "vitest";
import { agentBullets, agentDefaultReply, agentReplies } from "../../content/agent";
import { matchReply } from "./ScriptedAgentProvider";

describe("matchReply", () => {
  it.each(agentBullets)("matche l'id de puce $id vers sa réponse scriptée", ({ id }) => {
    expect(matchReply(id).text).toBe(agentReplies[id]);
  });

  it("matche une saisie libre par mot-clé (insensible à la casse et aux accents)", () => {
    expect(matchReply("Es-tu DISPONIBLE la semaine prochaine ?").text).toBe(agentReplies.dispo);
    expect(matchReply("c'est quoi le ROI reel ?").text).toBe(agentReplies.roi);
  });

  it("retombe sur la réponse par défaut sans correspondance", () => {
    expect(matchReply("bonjour").text).toBe(agentDefaultReply);
    expect(matchReply("").text).toBe(agentDefaultReply);
  });

  it("ne cite jamais le poker en dehors de la réponse roi", () => {
    for (const [id, text] of Object.entries(agentReplies)) {
      if (id === "roi") continue;
      expect(text.toLowerCase()).not.toContain("poker");
    }
    expect(agentDefaultReply.toLowerCase()).not.toContain("poker");
  });
});
