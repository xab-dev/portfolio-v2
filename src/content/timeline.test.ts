import { describe, expect, it } from "vitest";
import { timeline } from "./timeline";

const FORBIDDEN_PERSONAL_KEYWORDS = ["camargue", "coaching", "poker", "deux-roues"];

describe("timeline", () => {
  it("a des ids uniques", () => {
    const ids = timeline.map((milestone) => milestone.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("n'affiche aucun jalon du parcours personnel (DETTE-17)", () => {
    const haystack = timeline.map((m) => `${m.title} ${m.summary}`.toLowerCase()).join(" ");
    for (const keyword of FORBIDDEN_PERSONAL_KEYWORDS) {
      expect(haystack).not.toContain(keyword);
    }
  });

  it("n'invente jamais de date : dateKnown:false n'a pas de période exploitable", () => {
    for (const milestone of timeline) {
      if (!milestone.dateKnown) {
        expect(milestone.period).toBe("—");
      } else {
        expect(milestone.period.trim().length).toBeGreaterThan(0);
      }
    }
  });
});
