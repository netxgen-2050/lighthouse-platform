import { describe, expect, it } from "vitest";
import { idDeAncla } from "./ancla";

describe("idDeAncla", () => {
  it("devuelve el id de una necesidad", () => expect(idDeAncla("#necesidad-agua-tratamiento")).toBe("necesidad-agua-tratamiento"));
  it("ignora otras anclas y la ausencia de ancla", () => {
    expect(idDeAncla("#otra")).toBeNull();
    expect(idDeAncla("")).toBeNull();
  });
  it("ignora un ancla mal codificada sin lanzar error", () => {
    expect(() => idDeAncla("#%E0")).not.toThrow();
    expect(idDeAncla("#%E0")).toBeNull();
    expect(idDeAncla("#necesidad-%E0")).toBeNull();
  });
});
