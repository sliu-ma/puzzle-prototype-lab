import { describe, it, expect } from "vitest";
import { mengenZeile, packungsZeile, type Produkt } from "../maya-data";

type TestProdukt = Pick<Produkt, "id" | "kategorie" | "preis" | "menge">;

const p = (
  id: string,
  kategorie: Produkt["kategorie"],
  preis: number,
  wert: number,
  einheit: NonNullable<Produkt["menge"]>["einheit"],
): TestProdukt => ({ id, kategorie, preis, menge: { wert, einheit } });

describe("mengenZeile", () => {
  it("Früchte pro 100 g", () =>
    expect(mengenZeile(p("erdbeeren-es", "fruechte-gemuese", 6.8, 500, "g"))).toBe(
      "500 g · CHF 1.36/100 g",
    ));

  it("Früchte in kg pro 100 g", () =>
    expect(mengenZeile(p("aepfel-ch", "fruechte-gemuese", 2.8, 1, "kg"))).toBe(
      "1 kg · CHF 0.28/100 g",
    ));

  it("Milch pro 100 ml", () =>
    expect(mengenZeile(p("milch-valflora", "milch-eier", 1.85, 1, "l"))).toBe(
      "1 l · CHF 0.19/100 ml",
    ));

  it("Rahm in dl pro 100 ml", () =>
    expect(mengenZeile(p("vollrahm-ch", "milch-eier", 2.1, 2.5, "dl"))).toBe(
      "2.5 dl · CHF 0.84/100 ml",
    ));

  it("Eier pro Stück", () =>
    expect(mengenZeile(p("eier-bio-ch", "milch-eier", 3.5, 4, "Stück"))).toBe(
      "4 Stück · CHF 0.88/Stück",
    ));

  it("Einzelstück ohne Grundpreis", () =>
    expect(mengenZeile(p("zitrone-it", "fruechte-gemuese", 0.45, 1, "Stück"))).toBe("1 Stück"));

  it("Zimt pro 10 g", () =>
    expect(mengenZeile(p("zimt-bio-fairtrade", "backzutaten", 1.6, 35, "g"))).toBe(
      "35 g · CHF 0.46/10 g",
    ));

  it("Backpulver pro 10 g", () =>
    expect(mengenZeile(p("backpulver", "backzutaten", 0.5, 85, "g"))).toBe(
      "85 g · CHF 0.06/10 g",
    ));

  it("Vanillezucker pro 10 g", () =>
    expect(mengenZeile(p("vanillezucker", "backzutaten", 0.45, 80, "g"))).toBe(
      "80 g · CHF 0.06/10 g",
    ));

  it("Mehl bleibt pro kg", () =>
    expect(mengenZeile(p("mehl-ch", "backzutaten", 1.9, 1, "kg"))).toBe("1 kg · CHF 1.90/kg"));

  it("Salz bleibt pro kg", () =>
    expect(mengenZeile(p("salz", "andere", 1.6, 500, "g"))).toBe("500 g · CHF 3.20/kg"));

  it("Mandeln bleiben pro kg", () =>
    expect(mengenZeile(p("mandeln-ch", "backzutaten", 2.8, 200, "g"))).toBe(
      "200 g · CHF 14.00/kg",
    ));

  it("ohne Menge keine Zeile", () =>
    expect(mengenZeile({ id: "x", kategorie: "andere", preis: 2, menge: undefined })).toBeNull());
});

describe("packungsZeile", () => {
  it("Gewicht", () =>
    expect(packungsZeile(p("erdbeeren-es", "fruechte-gemuese", 6.8, 500, "g"))).toBe("500 g"));
  it("Stückzahl", () =>
    expect(packungsZeile(p("eier-bio-ch", "milch-eier", 3.5, 4, "Stück"))).toBe("4 Stück"));
});
