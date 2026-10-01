// Objectif : vérifier la normalisation, la règle déterministe et la décision sémantique.
import test from "node:test";
import assert from "node:assert/strict";
import { subsidyCase, detectFundingOverlap } from "../src/index.mjs";
import { createFakeProvider } from "../src/jev.mjs";
const edge = {
  "id": "limite-1",
  "text": "Cas synthétique traité par une règle déterministe avant toute analyse sémantique.",
  "source": {
    "url": "https://example.test/cas-limite",
    "date": "2026-09-16"
  },
  "sameGrantId": true
};
test("exige une source", () => assert.throws(() => subsidyCase({ id: "x", text: "y" }), /source/));
test("applique le cas limite sans appel Jev", async () => { const provider = createFakeProvider(() => { throw new Error("appel interdit"); }); assert.equal((await detectFundingOverlap(edge, provider)).decision, "same_purpose"); assert.equal(provider.calls, 0); });
test("classe un dossier sourcé", async () => { const provider = createFakeProvider(() => ({ model: "jev-1.13.0", answers: { decision: { type: "choice", choice: "possible_overlap", probabilities: {
  "same_purpose": 0.05,
  "complementary": 0.05,
  "possible_overlap": 0.85,
  "unrelated": 0.05
}, confidence: 0.85 } }, usage: { input_tokens: 10, output_tokens: 0 } })); const result = await detectFundingOverlap({
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
}, provider); assert.equal(result.decision, "possible_overlap"); assert.equal(result.review, false); });

const dossierÀRevoir = {
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

test("marque une décision incertaine pour revue humaine", async () => {
  const provider = createFakeProvider(() => ({
    model: "jev-1.13.0",
    answers: {
      decision: {
        type: "choice",
        choice: "possible_overlap",
        probabilities: {
          same_purpose: 0.15,
          complementary: 0.15,
          possible_overlap: 0.55,
          unrelated: 0.15,
        },
        confidence: 0.62,
      },
    },
    usage: { input_tokens: 10, output_tokens: 0 },
  }));
  const résultat = await detectFundingOverlap(dossierÀRevoir, provider);
  assert.equal(résultat.decision, "possible_overlap");
  assert.equal(résultat.review, true);
  assert.equal(résultat.confidence, 0.62);
  assert.equal(provider.calls, 1);
});
