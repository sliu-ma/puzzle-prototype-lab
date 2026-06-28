// Ratspersonen für das Finale. Jede ist einem Thema zugeordnet
// und übernimmt die beiden Fragen aus diesem Bereich.

export type Ratsperson = {
  id: string;
  name: string;
  rolle: string;
  thema: "Mobilität" | "Konsum" | "Biodiversität" | "Wohnen" | "Energie";
  initialen: string;
  farbe: string;     // background tint class
  rand: string;      // border tint class
};

export const RAT: Ratsperson[] = [
  {
    id: "schmid",
    name: "Yvonne Schmid",
    rolle: "Verkehr & Infrastruktur",
    thema: "Mobilität",
    initialen: "YS",
    farbe: "bg-sky-100",
    rand: "border-sky-400",
  },
  {
    id: "brunner",
    name: "Karl Brunner",
    rolle: "Wirtschaft & Konsum",
    thema: "Konsum",
    initialen: "KB",
    farbe: "bg-amber-100",
    rand: "border-amber-400",
  },
  {
    id: "lindenmann",
    name: "Anna Lindenmann",
    rolle: "Umwelt & Natur",
    thema: "Biodiversität",
    initialen: "AL",
    farbe: "bg-emerald-100",
    rand: "border-emerald-400",
  },
  {
    id: "frei",
    name: "Markus Frei",
    rolle: "Bau & Wohnen",
    thema: "Wohnen",
    initialen: "MF",
    farbe: "bg-orange-100",
    rand: "border-orange-400",
  },
  {
    id: "vetterli",
    name: "Heinz Vetterli",
    rolle: "Gemeindepräsident · Energie",
    thema: "Energie",
    initialen: "HV",
    farbe: "bg-blue-100",
    rand: "border-blue-400",
  },
];

export function getRatspersonByThema(
  thema: "Mobilität" | "Konsum" | "Biodiversität" | "Wohnen" | "Energie",
): Ratsperson {
  return RAT.find((r) => r.thema === thema)!;
}
