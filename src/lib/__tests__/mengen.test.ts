import { describe, it, expect } from "vitest";
import { mengenZeile } from "../maya-data";
describe("mengenZeile", () => {
  it("kg", () => expect(mengenZeile({ preis: 4.5, menge: { wert: 1, einheit: "kg" } })).toBe("1 kg · CHF 4.50/kg"));
  it("500 g auf kg", () => expect(mengenZeile({ preis: 6.8, menge: { wert: 500, einheit: "g" } })).toBe("500 g · CHF 13.60/kg"));
  it("Stück", () => expect(mengenZeile({ preis: 3.5, menge: { wert: 4, einheit: "Stück" } })).toBe("4 Stück · CHF 0.88/Stück"));
  it("dl auf l", () => expect(mengenZeile({ preis: 2.1, menge: { wert: 2.5, einheit: "dl" } })).toBe("2.5 dl · CHF 8.40/l"));
  it("kleine Menge pro 100 g", () => expect(mengenZeile({ preis: 1.6, menge: { wert: 35, einheit: "g" } })).toBe("35 g · CHF 4.57/100 g"));
});
