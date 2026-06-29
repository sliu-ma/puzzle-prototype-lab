// TEMPORÄR: Testmodus – setze auf `false`, um die normalen Sperren
// (QR-Code-Gate, linearer Etappenablauf, Team-Registrierung) wieder zu aktivieren.
//
// Solange DEV_BYPASS === true:
//  - StageGate lässt jede Etappe direkt zu
//  - QRGate überspringt den Kamera-Scan
//  - Die Startseite zeigt zusätzlich Direktlinks zu allen Akten + Finale
//
// Vor dem Abgeben/Live-Schalten: DEV_BYPASS = false setzen.
export const DEV_BYPASS = true;
