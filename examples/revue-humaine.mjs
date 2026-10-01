// Objectif : montrer qu’une décision incertaine est explicitement envoyée en revue humaine.
import assert from "node:assert/strict";
import { detectFundingOverlap } from "../src/index.mjs";
import { createFakeProvider } from "../src/jev.mjs";
const dossier = {
  "id": "revue-1",
  "text": "Les deux conventions citent le même public, mais leurs calendriers et leurs dépenses éligibles ne se recouvrent que partiellement.",
  "source": {
    "url": "https://example.test/dossier-ambigu",
    "date": "2026-09-20"
  },
  "details": {
    "origine": "donnée synthétique",
    "signal": "informations incomplètes"
  }
};
const provider = createFakeProvider(() => ({
  model: "jev-1.13.0",
  answers: { decision: {
    type: "choice",
    choice: "possible_overlap",
    probabilities: {
  "same_purpose": 0.15,
  "complementary": 0.15,
  "possible_overlap": 0.55,
  "unrelated": 0.15
},
    confidence: 0.62,
  } },
  usage: { input_tokens: 140, output_tokens: 0 },
}));
const résultat = await detectFundingOverlap(dossier, provider);
assert.equal(résultat.decision, "possible_overlap");
assert.equal(résultat.review, true);
assert.equal(provider.calls, 1);
console.log(`Décision : ${résultat.label} · revue humaine : ${résultat.review} · confiance : ${résultat.confidence}`);
