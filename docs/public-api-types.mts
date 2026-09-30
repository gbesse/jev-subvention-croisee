// Objectif : vérifier que les types publics sont importables.
import { subsidyCase, detectFundingOverlap } from "../src/index.mjs";
const dossier = subsidyCase({
  "id": "exemple-1",
  "text": "Deux subventions financent la médiation numérique du même quartier sur des périodes qui se recouvrent.",
  "source": {
    "url": "https://example.test/donnee-source",
    "date": "2026-09-15"
  },
  "details": {
    "territoire": "Commune Exemple",
    "origine": "donnée synthétique"
  }
});
void detectFundingOverlap(dossier, { decide: async () => ({}) });
