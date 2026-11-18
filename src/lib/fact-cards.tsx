import type { InputCard } from "@/components/case-file/InputCarousel";
import { CostPerKm, TrainVsCars, ShortTripsShare } from "@/components/case-file/MobilityCharts";
import {
  SaisonProdukte, FoodWasteChart, LabelUebersicht, getSaisonInfo,
} from "@/components/case-file/ConsumptionCharts";
import { AlltagsTippsGrid, SparPotenzialChart } from "@/components/case-file/WohnenCharts";
import { RoteListeChart, UrsachenCarousel, VielfaltGrid } from "@/components/case-file/BiodiversityCharts";
import {
  CO2VergleichChart, AnteilErneuerbarChart, ImportabhaengigkeitChart,
} from "@/components/case-file/EnergietraegerCharts";
import waschmaschineEtiketteAsset from "@/assets/waschmaschine-klasse-a.png.asset.json";
import waschmaschineEtiketteEAsset from "@/assets/waschmaschine-klasse-e.png.asset.json";

/** Gemeinsame Quelle der 15 Faktenkarten: Etappen-Fachinput und Jakobs Notizbuch. */
function EnergieetikettenVisual() {
  return (
    <figure className="mx-auto flex w-full flex-col items-center">
      <div className="flex w-full items-end justify-center gap-3">
        <div className="flex flex-col items-center">
          <img src={waschmaschineEtiketteAsset.url} alt="Energieetikette einer Waschmaschine der Klasse A" className="block h-[220px] w-auto max-w-full object-contain" />
          <span className="mt-1 font-mono-typed text-[10px] uppercase tracking-wider text-stamp">Klasse A</span>
        </div>
        <div className="flex flex-col items-center">
          <img src={waschmaschineEtiketteEAsset.url} alt="Energieetikette einer Waschmaschine der Klasse E" className="block h-[220px] w-auto max-w-full object-contain" />
          <span className="mt-1 font-mono-typed text-[10px] uppercase tracking-wider text-stamp">Klasse E</span>
        </div>
      </div>
      <figcaption className="mt-2 text-center font-serif text-xs italic text-ink/70">
        Zwei Waschmaschinen im Vergleich. Links sparsam. Rechts stromhungrig.
      </figcaption>
    </figure>
  );
}

export function getFactCards(stage: number): InputCard[] {
  switch (stage) {
    case 1:
      return [
        { title: "Was kostet ein Kilometer wirklich?", body: "Zu den Autokosten gehören nicht nur Benzin. Auch Versicherung, Parken und Reparaturen gehören dazu. Das ergibt zusammen die Vollkosten.", visual: <CostPerKm /> },
        { title: "Ein Zug ersetzt viele Autos", body: "Ein Zug transportiert im Schnitt so viele Personen wie 90 Autos. Bei voller Kapazität wären es sogar bis zu 310. Der Grund: Züge sind oft nicht voll besetzt.", visual: <TrainVsCars /> },
        { title: "Aktive Mobilität", body: "Viele Autofahrten in der Schweiz sind sehr kurz. Fast die Hälfte ist kürzer als 5 Kilometer. Solche kurzen Strecken kann man gut mit dem Velo oder zu Fuss zurücklegen.", visual: <ShortTripsShare /> },
      ];
    case 2: {
      const saison = getSaisonInfo();
      return [
        { title: "Regional & saisonal einkaufen", body: `Regionale und saisonale Lebensmittel haben kürzere Transportwege und kürzere Lagerzeiten als importierte Ware. Im ${saison.label} sind zum Beispiel folgende Lebensmittel saisonal und regional:\u00a0`, visual: <SaisonProdukte /> },
        { title: "Food-Waste vermeiden", body: "Pro Person werden in der Schweiz jährlich viele Lebensmittel weggeworfen. Ein Grund dafür: Es wird zu viel eingekauft. Ein anderer Grund: Das Haltbarkeitsdatum läuft ab. Diese Grafik zeigt, wie viel das ausmacht.", visual: <FoodWasteChart /> },
        { title: "Auf die Verpackung achten", body: "Labels auf Verpackungen zeigen besondere Eigenschaften eines Produkts. Zum Beispiel gute Qualität, faire Herstellung oder Umweltschutz. Drei Beispiele aus Frau Bergers Laden:\u00a0", visual: <LabelUebersicht /> },
      ];
    }
    case 3:
      return [
        { title: "Energieetiketten", body: "Energieetiketten verraten, wie sparsam ein Gerät mit Strom umgeht. Geräte der Klasse A brauchen wenig Strom, Geräte der Klasse G deutlich mehr.", visual: <EnergieetikettenVisual /> },
        { title: "Kleine Veränderungen, grosse Wirkung", body: "Schon kleine Änderungen im Alltag sparen viel Energie.", visual: <AlltagsTippsGrid /> },
        { title: "Energie sparen bedeutet Geld sparen", body: "Es lohnt sich, Energie zu sparen. Wer Energie spart, spart auch Geld. Du kannst deine Nebenkosten um bis zu 30 % senken. Ein Beispiel:", visual: <SparPotenzialChart /> },
      ];
    case 4:
      return [
        { title: "Rote Liste", body: "Jede dritte untersuchte Art in der Schweiz gilt heute als gefährdet oder ist bereits ausgestorben. Diese bedrohten Arten stehen auf der sogenannten Roten Liste.", visual: <RoteListeChart /> },
        { title: "Ursachen", body: "Die Gründe für den Rückgang der Biodiversität sind vielfältig. Diese Bilder zeigen drei davon.", visual: <UrsachenCarousel /> },
        { title: "Biodiversität bedeutet Vielfalt", body: "All das brauchen wir zum Leben. Die Vielfalt an Arten sichert uns genau das.", visual: <VielfaltGrid />, visualFirst: true },
      ];
    case 5:
      return [
        { title: "Vergleich Energieträger", body: "Verschiedene Energiequellen verursachen unterschiedlich viel Gramm CO₂ pro Kilowattstunde Strom. Im Betrieb verursachen erneuerbare Energien praktisch keine CO₂-Emissionen.", visual: <CO2VergleichChart /> },
        { title: "Anteil erneuerbare Energien", body: "Der Anteil erneuerbarer Energien in der Schweiz betrug 2023 rund 28 Prozent. Der grösste Teil der Energie stammt also weiterhin aus fossilen Quellen wie Öl oder Gas.", visual: <AnteilErneuerbarChart /> },
        { title: "Abhängigkeit von Importen", body: "2024 war die Schweiz energetisch zu 68 Prozent vom Ausland abhängig. Solar- und Windenergie machen die Schweiz unabhängiger von diesen Importen, die vor allem in Krisenzeiten stark schwanken können.", visual: <ImportabhaengigkeitChart /> },
      ];
    default:
      return [];
  }
}
