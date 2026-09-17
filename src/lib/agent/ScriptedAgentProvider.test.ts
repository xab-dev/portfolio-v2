import { describe, expect, it } from "vitest";
import { agentBullets, agentDefaultReply, agentReplies } from "../../content/agent";
import { matchReply } from "./ScriptedAgentProvider";

describe("matchReply", () => {
  it.each(agentBullets)("matche l'id de puce $id vers sa réponse scriptée", ({ id }) => {
    const reply = matchReply(id);
    expect(reply.text).toBe(agentReplies[id]);
    expect(reply.id).toBe(id);
  });

  it("matche une saisie libre par mot-clé (insensible à la casse et aux accents)", () => {
    const dispo = matchReply("Es-tu DISPONIBLE la semaine prochaine ?");
    expect(dispo.text).toBe(agentReplies.dispo);
    expect(dispo.id).toBe("dispo");
    const roi = matchReply("c'est quoi le ROI reel ?");
    expect(roi.text).toBe(agentReplies.roi);
    expect(roi.id).toBe("roi");
  });

  it("retombe sur la réponse par défaut sans correspondance", () => {
    const bonjour = matchReply("bonjour");
    expect(bonjour.text).toBe(agentDefaultReply);
    expect(bonjour.id).toBeUndefined();
    const vide = matchReply("");
    expect(vide.text).toBe(agentDefaultReply);
    expect(vide.id).toBeUndefined();
  });

  it("ne cite jamais le poker en dehors de la réponse roi", () => {
    for (const [id, text] of Object.entries(agentReplies)) {
      if (id === "roi") continue;
      expect(text.toLowerCase()).not.toContain("poker");
    }
    expect(agentDefaultReply.toLowerCase()).not.toContain("poker");
  });
});
