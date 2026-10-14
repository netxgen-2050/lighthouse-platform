import { describe, expect, it } from "vitest";
import { idDeAncla } from "./ancla";

describe("idDeAncla", () => {
  it("saca el # y decodifica", () => {
    expect(idDeAncla("#ticket")).toBe("ticket");
    expect(idDeAncla("#a%20b")).toBe("a b");
    expect(idDeAncla("")).toBe("");
  });
  it("no lanza con anclas mal codificadas", () => {
    expect(idDeAncla("#%E0")).toBe("%E0");
    expect(idDeAncla("#100%")).toBe("100%");
  });
});
