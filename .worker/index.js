var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// lib/timingMeta.js
var timingMeta_exports = {};
__export(timingMeta_exports, {
  getSpreadTimingProfile: () => getSpreadTimingProfile,
  getTimingHintForCard: () => getTimingHintForCard
});
function getSuitSpeedWeight(suit) {
  if (FAST_SUITS.has(suit))
    return 1;
  if (MID_SUITS.has(suit))
    return 0;
  if (SLOW_SUITS.has(suit))
    return -1;
  return 0;
}
function getRankTempoWeight(rankValue) {
  if (typeof rankValue !== "number")
    return 0;
  if (rankValue >= 1 && rankValue <= 4)
    return 1;
  if (rankValue >= 5 && rankValue <= 9)
    return 0;
  if (rankValue >= 10)
    return -1;
  return 0;
}
function getMajorTimingWeight(number) {
  if (typeof number !== "number")
    return 0;
  if (number >= 0 && number <= 6)
    return 0;
  if (number >= 7 && number <= 14)
    return -0.5;
  if (number >= 15)
    return -1;
  return 0;
}
function getTimingHintForCard(card = {}) {
  if (!card)
    return null;
  if (typeof card.number === "number" && card.number >= 0 && card.number <= 21) {
    const w = getMajorTimingWeight(card.number);
    if (w <= -1)
      return "longer-arc";
    if (w < 0)
      return "developing";
    return "developing";
  }
  const suit = card.suit || inferSuitFromName(card.card);
  const suitWeight = getSuitSpeedWeight(suit);
  const rankWeight = getRankTempoWeight(card.rankValue);
  const total = suitWeight + rankWeight;
  if (total >= 2)
    return "sooner";
  if (total >= 1)
    return "sooner";
  if (total <= -2)
    return "longer-arc";
  if (total <= -1)
    return "longer-arc";
  if (suit || typeof card.rankValue === "number")
    return "developing";
  return null;
}
function getSpreadTimingProfile({ cardsInfo = [], themes = {} } = {}) {
  if (!Array.isArray(cardsInfo) || cardsInfo.length === 0)
    return null;
  const namedFuturePositions = /* @__PURE__ */ new Set([
    "Future \u2014 trajectory if nothing shifts",
    "Near Future \u2014 what lies before (Card 4)",
    "Likely direction on current path",
    "Outcome \u2014 likely path if unchanged (Card 10)",
    "Outcome / what this can become"
  ]);
  const focusCards = cardsInfo.filter((c) => {
    const pos = (c.position || "").trim();
    return namedFuturePositions.has(pos);
  });
  const sample = focusCards.length > 0 ? focusCards : cardsInfo;
  let sooner = 0;
  let developing = 0;
  let longer = 0;
  for (const card of sample) {
    const hint = getTimingHintForCard(card);
    if (hint === "sooner")
      sooner++;
    else if (hint === "developing")
      developing++;
    else if (hint === "longer-arc")
      longer++;
  }
  const total = sooner + developing + longer;
  if (!total)
    return null;
  if (sooner / total >= 0.55 && sooner >= 2) {
    return "near-term-tilt";
  }
  if (longer / total >= 0.55 && longer >= 2) {
    return "longer-arc-tilt";
  }
  return "developing-arc";
}
function inferSuitFromName(name) {
  if (typeof name !== "string")
    return null;
  if (name.includes("Wands"))
    return "Wands";
  if (name.includes("Cups"))
    return "Cups";
  if (name.includes("Swords"))
    return "Swords";
  if (name.includes("Pentacles"))
    return "Pentacles";
  return null;
}
var FAST_SUITS, SLOW_SUITS, MID_SUITS;
var init_timingMeta = __esm({
  "lib/timingMeta.js"() {
    init_functionsRoutes_0_2857290313673917();
    FAST_SUITS = /* @__PURE__ */ new Set(["Wands", "Swords"]);
    SLOW_SUITS = /* @__PURE__ */ new Set(["Pentacles"]);
    MID_SUITS = /* @__PURE__ */ new Set(["Cups"]);
    __name(getSuitSpeedWeight, "getSuitSpeedWeight");
    __name(getRankTempoWeight, "getRankTempoWeight");
    __name(getMajorTimingWeight, "getMajorTimingWeight");
    __name(getTimingHintForCard, "getTimingHintForCard");
    __name(getSpreadTimingProfile, "getSpreadTimingProfile");
    __name(inferSuitFromName, "inferSuitFromName");
  }
});

// lib/spreadAnalysis.js
function getCardElement(cardName, cardNumber) {
  if (cardNumber !== void 0 && cardNumber >= 0 && cardNumber <= 21) {
    return MAJOR_ELEMENTS[cardNumber] || null;
  }
  for (const [suit, element] of Object.entries(SUIT_ELEMENTS)) {
    if (cardName.includes(suit)) {
      return element;
    }
  }
  return null;
}
function analyzeElementalDignity(card1, card2) {
  if (!card1 || !card2) {
    return {
      relationship: "neutral",
      description: null
    };
  }
  const e1 = getCardElement(card1.card || "", card1.number);
  const e2 = getCardElement(card2.card || "", card2.number);
  if (!e1 || !e2) {
    return {
      relationship: "neutral",
      description: null
    };
  }
  if (e1 === e2) {
    return {
      relationship: "amplified",
      element: e1,
      elements: [e1, e1],
      description: `Both ${e1} cards reinforce and intensify this elemental energy`
    };
  }
  const pair = `${e1}-${e2}`;
  if (["Fire-Air", "Air-Fire", "Water-Earth", "Earth-Water"].includes(pair)) {
    return {
      relationship: "supportive",
      elements: [e1, e2],
      description: `${e1} and ${e2} work harmoniously together, each supporting the other's expression`
    };
  }
  if (["Fire-Water", "Water-Fire", "Air-Earth", "Earth-Air"].includes(pair)) {
    return {
      relationship: "tension",
      elements: [e1, e2],
      description: `${e1} and ${e2} create friction that must be balanced and integrated`
    };
  }
  return {
    relationship: "neutral",
    description: null
  };
}
async function analyzeSpreadThemes(cardsInfo, options = {}) {
  const suitCounts = { Wands: 0, Cups: 0, Swords: 0, Pentacles: 0 };
  const elementCounts = { Fire: 0, Water: 0, Air: 0, Earth: 0 };
  let majorCount = 0;
  let reversalCount = 0;
  const numbers = [];
  cardsInfo.forEach((card) => {
    if (card.number >= 0 && card.number <= 21) {
      majorCount++;
    }
    for (const suit of Object.keys(suitCounts)) {
      if (card.card.includes(suit)) {
        suitCounts[suit]++;
        break;
      }
    }
    const element = getCardElement(card.card, card.number);
    if (element && elementCounts[element] !== void 0) {
      elementCounts[element]++;
    }
    const orientation = String(card.orientation || "").toLowerCase();
    if (orientation === "reversed") {
      reversalCount++;
    }
    if (typeof card.number === "number") {
      numbers.push(card.number);
    }
  });
  const totalCards = cardsInfo.length;
  const reversalRatio = reversalCount / totalCards;
  const majorRatio = majorCount / totalCards;
  const sortedSuitEntries = Object.entries(suitCounts).sort((a, b) => b[1] - a[1]);
  const dominantSuitEntry = sortedSuitEntries[0] || [null, 0];
  const secondSuitEntry = sortedSuitEntries[1] || [null, 0];
  const dominantElementEntry = Object.entries(elementCounts).sort((a, b) => b[1] - a[1])[0] || [null, 0];
  const avgNumber = numbers.length > 0 ? numbers.reduce((sum, n) => sum + n, 0) / numbers.length : null;
  let reversalFramework = selectReversalFramework(reversalRatio, cardsInfo);
  if (options.reversalFrameworkOverride && REVERSAL_FRAMEWORKS[options.reversalFrameworkOverride]) {
    reversalFramework = options.reversalFrameworkOverride;
  }
  const themes = {
    // Suit analysis
    suitCounts,
    dominantSuit: dominantSuitEntry[1] > 0 ? dominantSuitEntry[0] : null,
    suitFocus: getSuitFocusDescription({
      top: dominantSuitEntry,
      second: secondSuitEntry
    }),
    // Elemental analysis
    elementCounts,
    dominantElement: dominantElementEntry[1] > 0 ? dominantElementEntry[0] : null,
    elementalBalance: getMajorAwareElementalBalanceDescription({
      elementCounts,
      totalCards,
      majorRatio
    }),
    // Major Arcana analysis
    majorCount,
    majorRatio,
    archetypeLevel: majorRatio >= 0.5 ? "high" : majorRatio >= 0.3 ? "moderate" : "normal",
    archetypeDescription: getArchetypeDescription(majorRatio),
    // Reversal analysis
    reversalCount,
    reversalRatio,
    reversalFramework,
    reversalDescription: getReversalFrameworkDescription(reversalFramework),
    // Lifecycle/numerology
    averageNumber: avgNumber,
    lifecycleStage: getLifecycleStage(avgNumber),
    // Timing profile (set below)
    timingProfile: null
  };
  try {
    const { getSpreadTimingProfile: getSpreadTimingProfile2 } = await Promise.resolve().then(() => (init_timingMeta(), timingMeta_exports));
    themes.timingProfile = getSpreadTimingProfile2({ cardsInfo, themes });
  } catch {
    themes.timingProfile = null;
  }
  return themes;
}
function selectReversalFramework(ratio, cardsInfo) {
  if (ratio === 0)
    return "none";
  if (ratio >= 0.6)
    return "blocked";
  if (ratio >= 0.4)
    return "internalized";
  if (ratio >= 0.2)
    return "delayed";
  return "contextual";
}
function getReversalFrameworkDescription(framework) {
  return REVERSAL_FRAMEWORKS[framework] || REVERSAL_FRAMEWORKS.contextual;
}
function getSuitFocusDescription({ top, second }) {
  const [topSuit, topCount] = top || [null, 0];
  const [secondSuit, secondCount] = second || [null, 0];
  if (!topSuit || topCount < 2)
    return null;
  if (topCount === secondCount && topCount > 1 && secondSuit) {
    return `Balanced focus between ${topSuit} and ${secondSuit}, each surfacing ${topCount} times.`;
  }
  const descriptions = {
    Wands: `${topCount} Wands cards suggest a strong focus on action, creativity, passion, drive, and personal will.`,
    Cups: `${topCount} Cups cards indicate emotional matters, relationships, intuition, and heart-centered concerns are central to this reading.`,
    Swords: `${topCount} Swords cards point to mental processes, communication, truth-seeking, conflict resolution, and clarity of thought as key themes.`,
    Pentacles: `${topCount} Pentacles cards highlight practical matters, material resources, work, physical health, and tangible results.`
  };
  return descriptions[topSuit] || null;
}
function getMajorAwareElementalBalanceDescription({ elementCounts, totalCards, majorRatio }) {
  if (majorRatio > 0.8) {
    return "Archetypal energies dominate, transcending elemental themes.";
  }
  return getElementalBalanceDescription(elementCounts, totalCards);
}
function getElementalBalanceDescription(elementCounts, total) {
  const active = Object.entries(elementCounts).filter(([, count]) => count > 0).sort((a, b) => b[1] - a[1]);
  if (active.length === 0)
    return "Balanced elemental presence.";
  if (active.length === 1)
    return `Strong ${active[0][0]} emphasis dominates this reading.`;
  const [dominant] = active;
  const ratio = dominant[1] / total;
  if (ratio >= 0.5) {
    return `${dominant[0]} energy strongly dominates (${dominant[1]}/${total} cards), requiring attention to balance with other elements.`;
  }
  if (ratio >= 0.35) {
    return `${dominant[0]} leads (${dominant[1]}/${total}), with ${active.slice(1).map(([e, c]) => `${e} (${c})`).join(", ")} providing supporting or contrasting energies.`;
  }
  return `Mixed elemental energies: ${active.map(([e, c]) => `${e} (${c})`).join(", ")}.`;
}
function getArchetypeDescription(ratio) {
  if (ratio >= 0.5) {
    return "High Major Arcana presence indicates profound, soul-level themes, karmic patterns, and significant life transitions.";
  }
  if (ratio >= 0.3) {
    return "Moderate Major Arcana suggests important archetypal lessons woven through everyday matters.";
  }
  return "Primarily Minor Arcana, focusing on practical, day-to-day dynamics and immediate concerns.";
}
function getLifecycleStage(avgNumber) {
  if (avgNumber === null)
    return null;
  if (avgNumber <= 7)
    return "new cycles, initiative, fresh beginnings, and reclaiming agency";
  if (avgNumber <= 14)
    return "integration, balance, working through challenges, and staying centered amidst change";
  return "culmination, mastery, completion, and preparing to release what is finished";
}
function analyzeCelticCross(cardsInfo) {
  if (!cardsInfo || cardsInfo.length !== 10) {
    return null;
  }
  const nucleus = analyzeNucleus(cardsInfo[0], cardsInfo[1]);
  const timeline = analyzeTimeline(cardsInfo[2], cardsInfo[0], cardsInfo[3]);
  const consciousness = analyzeConsciousness(cardsInfo[5], cardsInfo[0], cardsInfo[4]);
  const staff = analyzeStaff(cardsInfo[6], cardsInfo[7], cardsInfo[8], cardsInfo[9]);
  const crossChecks = {
    goalVsOutcome: comparePositions(
      cardsInfo[4],
      cardsInfo[9],
      "Conscious Goal (Above)",
      "Outcome (Final)"
    ),
    adviceVsOutcome: comparePositions(
      cardsInfo[6],
      cardsInfo[9],
      "Self/Advice",
      "Outcome"
    ),
    subconsciousVsHopesFears: comparePositions(
      cardsInfo[5],
      cardsInfo[8],
      "Subconscious (Below)",
      "Hopes & Fears"
    ),
    nearFutureVsOutcome: comparePositions(
      cardsInfo[3],
      cardsInfo[9],
      "Near Future",
      "Outcome"
    )
  };
  return {
    version: "1.0.0",
    spreadKey: "celtic",
    themes: null,
    // Filled by performSpreadAnalysis; kept for normalized shape parity
    relationships: [
      {
        type: "nucleus",
        summary: nucleus.synthesis,
        positions: [0, 1],
        cards: [nucleus.present, nucleus.challenge]
      },
      {
        type: "timeline",
        summary: timeline.causality,
        positions: [2, 0, 3],
        cards: [
          { card: timeline.flow.past },
          { card: timeline.flow.present },
          { card: timeline.flow.future }
        ]
      },
      {
        type: "consciousness-axis",
        axis: "Subconscious \u2194 Conscious",
        summary: consciousness.synthesis,
        positions: [5, 4],
        cards: [consciousness.subconscious, consciousness.conscious]
      },
      {
        type: "staff-axis",
        axis: "Self/Advice \u2194 Outcome",
        summary: staff.adviceImpact,
        positions: [6, 9],
        cards: [staff.self, staff.outcome]
      },
      {
        type: "cross-check",
        key: "goalVsOutcome",
        summary: crossChecks.goalVsOutcome.synthesis,
        cards: [crossChecks.goalVsOutcome.position1, crossChecks.goalVsOutcome.position2]
      },
      {
        type: "cross-check",
        key: "adviceVsOutcome",
        summary: crossChecks.adviceVsOutcome.synthesis,
        cards: [crossChecks.adviceVsOutcome.position1, crossChecks.adviceVsOutcome.position2]
      },
      {
        type: "cross-check",
        key: "subconsciousVsHopesFears",
        summary: crossChecks.subconsciousVsHopesFears.synthesis,
        cards: [
          crossChecks.subconsciousVsHopesFears.position1,
          crossChecks.subconsciousVsHopesFears.position2
        ]
      },
      {
        type: "cross-check",
        key: "nearFutureVsOutcome",
        summary: crossChecks.nearFutureVsOutcome.synthesis,
        cards: [
          crossChecks.nearFutureVsOutcome.position1,
          crossChecks.nearFutureVsOutcome.position2
        ]
      }
    ],
    positionNotes: [
      {
        index: 0,
        label: "Present",
        notes: ["Core situation; anchor for nucleus and all axes."]
      },
      {
        index: 1,
        label: "Challenge",
        notes: ["Crossing tension; always read as obstacle to integrate."]
      },
      {
        index: 2,
        label: "Past",
        notes: ["Foundation feeding into present in the timeline."]
      },
      {
        index: 3,
        label: "Near Future",
        notes: ["Next chapter, cross-checked against Outcome."]
      },
      {
        index: 4,
        label: "Conscious",
        notes: ["Stated goals; cross-check with Outcome."]
      },
      {
        index: 5,
        label: "Subconscious",
        notes: ["Hidden drivers; cross-check with Hopes & Fears."]
      },
      {
        index: 6,
        label: "Self / Advice",
        notes: ["Active guidance; cross-check with Outcome."]
      },
      {
        index: 7,
        label: "External",
        notes: ["Environment and others; context, not command."]
      },
      {
        index: 8,
        label: "Hopes & Fears",
        notes: ["Mixed desires/anxieties; mirrored with Subconscious."]
      },
      {
        index: 9,
        label: "Outcome",
        notes: ["Trajectory if unchanged; never deterministic."]
      }
    ],
    // Raw components preserved for narrativeBuilder and any future consumers
    nucleus,
    timeline,
    consciousness,
    staff,
    crossChecks
  };
}
function analyzeNucleus(present, challenge) {
  const elemental = analyzeElementalDignity(present, challenge);
  const synthesis = elemental.relationship === "supportive" ? `The energies of ${present.card} and ${challenge.card} can work together constructively once the challenge is integrated.` : elemental.relationship === "tension" ? `${present.card} and ${challenge.card} create friction between present state and challenge, requiring careful balance.` : elemental.relationship === "amplified" ? `Both cards share ${elemental.element} energy, intensifying this theme at the heart of the matter.` : `${present.card} represents where you stand, while ${challenge.card} crosses as the immediate obstacle.`;
  return {
    theme: "The Heart of the Matter (Nucleus)",
    present: {
      card: present.card,
      orientation: present.orientation,
      meaning: present.meaning
    },
    challenge: {
      card: challenge.card,
      orientation: challenge.orientation,
      meaning: challenge.meaning
    },
    elementalDynamic: elemental,
    synthesis
  };
}
function analyzeTimeline(past, present, future) {
  const pastToPresent = analyzeElementalDignity(past, present);
  const presentToFuture = analyzeElementalDignity(present, future);
  const pastToFuture = analyzeElementalDignity(past, future);
  let causality = `${past.card} in the past has led to ${present.card} in the present.`;
  if (pastToPresent.relationship === "tension") {
    causality += ` The transition from past to present involved friction and adjustment.`;
  } else if (pastToPresent.relationship === "supportive") {
    causality += ` The past supports and flows naturally into the present state.`;
  }
  causality += ` This is developing toward ${future.card} in the near future.`;
  if (presentToFuture.relationship === "tension") {
    causality += ` Moving forward will require navigating elemental tension.`;
  } else if (presentToFuture.relationship === "supportive") {
    causality += ` The trajectory ahead is supported by current energies.`;
  }
  return {
    theme: "The Timeline",
    flow: {
      past: past.card,
      present: present.card,
      future: future.card
    },
    causality,
    pastToPresent,
    presentToFuture,
    pastToFuture
  };
}
function analyzeConsciousness(subconscious, present, conscious) {
  const belowToAbove = analyzeElementalDignity(subconscious, conscious);
  const alignment = belowToAbove.relationship === "supportive" ? "aligned" : belowToAbove.relationship === "tension" ? "conflicted" : belowToAbove.relationship === "amplified" ? "intensely unified" : "complex";
  let synthesis = `Hidden beneath awareness: ${subconscious.card} ${subconscious.orientation}. `;
  synthesis += `Conscious goal or aspiration: ${conscious.card} ${conscious.orientation}. `;
  if (alignment === "aligned") {
    synthesis += `Your subconscious drives and conscious goals are working together harmoniously.`;
  } else if (alignment === "conflicted") {
    synthesis += `There is tension between what you want consciously and what drives you beneath awareness. Integration is needed.`;
  } else if (alignment === "intensely unified") {
    synthesis += `Your inner depths and conscious mind are unified around the same ${belowToAbove.element} theme.`;
  } else {
    synthesis += `Your inner and outer goals show nuanced dynamics worth exploring.`;
  }
  return {
    theme: "Consciousness Flow (Vertical Axis)",
    alignment,
    subconscious: {
      card: subconscious.card,
      orientation: subconscious.orientation
    },
    conscious: {
      card: conscious.card,
      orientation: conscious.orientation
    },
    elementalRelationship: belowToAbove,
    synthesis
  };
}
function analyzeStaff(self, external, hopesFears, outcome) {
  const adviceToOutcome = analyzeElementalDignity(self, outcome);
  let adviceImpact;
  if (adviceToOutcome.relationship === "supportive") {
    adviceImpact = `Following the guidance of ${self.card} actively supports and harmonizes with the likely outcome of ${outcome.card}.`;
  } else if (adviceToOutcome.relationship === "tension") {
    adviceImpact = `Acting on ${self.card} creates dynamic tension with the trajectory toward ${outcome.card}, requiring skillful navigation.`;
  } else if (adviceToOutcome.relationship === "amplified") {
    adviceImpact = `The advice (${self.card}) and outcome (${outcome.card}) share the same ${adviceToOutcome.element} energy, creating a unified path forward.`;
  } else {
    adviceImpact = `The relationship between the advice of ${self.card} and the outcome shows subtle complexity.`;
  }
  return {
    theme: "The Staff (Context and Trajectory)",
    self: {
      card: self.card,
      orientation: self.orientation
    },
    external: {
      card: external.card,
      orientation: external.orientation
    },
    hopesFears: {
      card: hopesFears.card,
      orientation: hopesFears.orientation
    },
    outcome: {
      card: outcome.card,
      orientation: outcome.orientation
    },
    adviceToOutcome,
    adviceImpact
  };
}
function comparePositions(card1, card2, pos1Name, pos2Name) {
  const elemental = analyzeElementalDignity(card1, card2);
  const orientationMatch = card1.orientation === card2.orientation;
  let synthesis = `Comparing ${pos1Name} (${card1.card} ${card1.orientation}) with ${pos2Name} (${card2.card} ${card2.orientation}): `;
  if (elemental.description) {
    synthesis += elemental.description + ". ";
  }
  if (orientationMatch) {
    synthesis += "Both share the same orientation, suggesting thematic continuity.";
  } else {
    synthesis += "Different orientations suggest a shift or evolution between these positions.";
  }
  return {
    position1: { name: pos1Name, card: card1.card, orientation: card1.orientation, meaning: card1.meaning },
    position2: { name: pos2Name, card: card2.card, orientation: card2.orientation, meaning: card2.meaning },
    elementalRelationship: elemental,
    orientationAlignment: orientationMatch,
    synthesis
  };
}
function analyzeThreeCard(cardsInfo) {
  if (!cardsInfo || cardsInfo.length !== 3) {
    return null;
  }
  const [first, second, third] = cardsInfo;
  const firstToSecond = analyzeElementalDignity(first, second);
  const secondToThird = analyzeElementalDignity(second, third);
  const firstToThird = analyzeElementalDignity(first, third);
  const narrative = buildThreeCardNarrative(first, second, third, firstToSecond, secondToThird);
  return {
    version: "1.0.0",
    spreadKey: "threeCard",
    relationships: [
      {
        type: "sequence",
        summary: narrative,
        positions: [0, 1, 2],
        cards: [
          { card: first.card, orientation: first.orientation },
          { card: second.card, orientation: second.orientation },
          { card: third.card, orientation: third.orientation }
        ]
      }
    ],
    positionNotes: [
      { index: 0, label: "Past", notes: ["Foundation / cause."] },
      { index: 1, label: "Present", notes: ["Current state shaped by past."] },
      { index: 2, label: "Future", notes: ["Trajectory if nothing shifts."] }
    ],
    flow: {
      first: first.card,
      second: second.card,
      third: third.card
    },
    transitions: {
      firstToSecond,
      secondToThird,
      firstToThird
    },
    narrative
  };
}
function buildThreeCardNarrative(first, second, third, trans1, trans2) {
  let narrative = `The story unfolds from ${first.card} through ${second.card} to ${third.card}. `;
  if (trans1.relationship === "supportive") {
    narrative += `The transition from first to second position is harmonious. `;
  } else if (trans1.relationship === "tension") {
    narrative += `The move from first to second involves friction that shapes the narrative. `;
  }
  if (trans2.relationship === "supportive") {
    narrative += `The path forward from second to third is well-supported.`;
  } else if (trans2.relationship === "tension") {
    narrative += `Reaching the third position will require navigating dynamic tension.`;
  }
  return narrative;
}
function analyzeFiveCard(cardsInfo) {
  if (!cardsInfo || cardsInfo.length !== 5) {
    return null;
  }
  const coreVsChallenge = analyzeElementalDignity(cardsInfo[0], cardsInfo[1]);
  const supportVsDirection = analyzeElementalDignity(cardsInfo[3], cardsInfo[4]);
  const synthesis = `The core matter (${cardsInfo[0].card}) faces the challenge of ${cardsInfo[1].card}. Support comes through ${cardsInfo[3].card}, pointing toward ${cardsInfo[4].card} as the likely direction.`;
  return {
    version: "1.0.0",
    spreadKey: "fiveCard",
    relationships: [
      {
        type: "axis",
        axis: "Core vs Challenge",
        summary: coreVsChallenge.description || "Tension or harmony between core and challenge frames the heart of this spread.",
        positions: [0, 1],
        cards: [
          { card: cardsInfo[0].card, orientation: cardsInfo[0].orientation },
          { card: cardsInfo[1].card, orientation: cardsInfo[1].orientation }
        ]
      },
      {
        type: "axis",
        axis: "Support vs Direction",
        summary: supportVsDirection.description || "Supportive energies shape how the likely direction can be navigated.",
        positions: [3, 4],
        cards: [
          { card: cardsInfo[3].card, orientation: cardsInfo[3].orientation },
          { card: cardsInfo[4].card, orientation: cardsInfo[4].orientation }
        ]
      }
    ],
    positionNotes: [
      { index: 0, label: "Core", notes: ["Central issue."] },
      { index: 1, label: "Challenge", notes: ["Obstacle / friction."] },
      { index: 2, label: "Hidden", notes: ["Subconscious / unseen influence."] },
      { index: 3, label: "Support", notes: ["Helpful energy / allies."] },
      { index: 4, label: "Direction", notes: ["Likely direction on current path."] }
    ],
    coreVsChallenge,
    supportVsDirection,
    synthesis
  };
}
var MAJOR_ELEMENTS, SUIT_ELEMENTS, REVERSAL_FRAMEWORKS;
var init_spreadAnalysis = __esm({
  "lib/spreadAnalysis.js"() {
    init_functionsRoutes_0_2857290313673917();
    MAJOR_ELEMENTS = {
      0: "Air",
      // The Fool (Uranus/Air)
      1: "Air",
      // The Magician (Mercury)
      2: "Water",
      // The High Priestess (Moon)
      3: "Earth",
      // The Empress (Venus)
      4: "Fire",
      // The Emperor (Aries)
      5: "Earth",
      // The Hierophant (Taurus)
      6: "Air",
      // The Lovers (Gemini)
      7: "Water",
      // The Chariot (Cancer)
      8: "Fire",
      // Strength (Leo)
      9: "Earth",
      // The Hermit (Virgo)
      10: "Fire",
      // Wheel of Fortune (Jupiter)
      11: "Air",
      // Justice (Libra)
      12: "Water",
      // The Hanged Man (Neptune)
      13: "Water",
      // Death (Scorpio)
      14: "Fire",
      // Temperance (Sagittarius)
      15: "Earth",
      // The Devil (Capricorn)
      16: "Fire",
      // The Tower (Mars)
      17: "Air",
      // The Star (Aquarius)
      18: "Water",
      // The Moon (Pisces)
      19: "Fire",
      // The Sun (Sun)
      20: "Fire",
      // Judgement (Pluto)
      21: "Earth"
      // The World (Saturn)
    };
    SUIT_ELEMENTS = {
      "Wands": "Fire",
      "Cups": "Water",
      "Swords": "Air",
      "Pentacles": "Earth"
    };
    __name(getCardElement, "getCardElement");
    __name(analyzeElementalDignity, "analyzeElementalDignity");
    __name(analyzeSpreadThemes, "analyzeSpreadThemes");
    __name(selectReversalFramework, "selectReversalFramework");
    REVERSAL_FRAMEWORKS = {
      none: {
        name: "All Upright",
        description: "All cards appear upright, showing energies flowing freely and directly.",
        guidance: "Read each card's traditional upright meaning in the context of its position."
      },
      blocked: {
        name: "Blocked Energy",
        description: "Reversed cards show energies present but meeting resistance, obstacles, or internal barriers.",
        guidance: "Interpret reversals as the same energy encountering blockage that must be addressed before progress."
      },
      delayed: {
        name: "Delayed Timing",
        description: "Reversed cards indicate timing is not yet ripe; patience and preparation are needed.",
        guidance: "Read reversals as energies that will manifest later, after certain conditions are met."
      },
      internalized: {
        name: "Internal Processing",
        description: "Reversed cards point to inner work, private processing, and energies working beneath the surface.",
        guidance: "Interpret reversals as the same themes playing out in the inner world rather than external events."
      },
      contextual: {
        name: "Context-Dependent",
        description: "Reversed cards are interpreted individually based on their unique position and relationships.",
        guidance: "Read each reversal according to what makes most sense for that specific card and position."
      }
    };
    __name(getReversalFrameworkDescription, "getReversalFrameworkDescription");
    __name(getSuitFocusDescription, "getSuitFocusDescription");
    __name(getMajorAwareElementalBalanceDescription, "getMajorAwareElementalBalanceDescription");
    __name(getElementalBalanceDescription, "getElementalBalanceDescription");
    __name(getArchetypeDescription, "getArchetypeDescription");
    __name(getLifecycleStage, "getLifecycleStage");
    __name(analyzeCelticCross, "analyzeCelticCross");
    __name(analyzeNucleus, "analyzeNucleus");
    __name(analyzeTimeline, "analyzeTimeline");
    __name(analyzeConsciousness, "analyzeConsciousness");
    __name(analyzeStaff, "analyzeStaff");
    __name(comparePositions, "comparePositions");
    __name(analyzeThreeCard, "analyzeThreeCard");
    __name(buildThreeCardNarrative, "buildThreeCardNarrative");
    __name(analyzeFiveCard, "analyzeFiveCard");
  }
});

// lib/minorMeta.js
function parseMinorName(name) {
  if (!name || typeof name !== "string")
    return null;
  const match2 = name.match(
    /^(\w+)\s+of\s+(Wands|Cups|Swords|Pentacles)$/
  );
  if (!match2)
    return null;
  const [, rank, suit] = match2;
  return { rank, suit };
}
function getMinorContext(cardLike = {}) {
  const rawName = cardLike.card || cardLike.name;
  let suit = cardLike.suit;
  let rank = cardLike.rank;
  if ((!suit || !rank) && rawName) {
    const parsed = parseMinorName(rawName);
    if (parsed) {
      rank = rank || parsed.rank;
      suit = suit || parsed.suit;
    }
  }
  if (!suit || !rank)
    return null;
  const isCourt = ["Page", "Knight", "Queen", "King"].includes(rank);
  const pipValues = {
    Ace: 1,
    Two: 2,
    Three: 3,
    Four: 4,
    Five: 5,
    Six: 6,
    Seven: 7,
    Eight: 8,
    Nine: 9,
    Ten: 10
  };
  const courtValues = {
    Page: 11,
    Knight: 12,
    Queen: 13,
    King: 14
  };
  const inferredRankValue = isCourt ? courtValues[rank] : pipValues[rank];
  const rankValue = typeof cardLike.rankValue === "number" ? cardLike.rankValue : inferredRankValue;
  return {
    suit,
    rank,
    isCourt,
    rankValue,
    suitTheme: SUIT_THEMES[suit],
    pipTheme: !isCourt && typeof rankValue === "number" ? PIP_NUMEROLOGY[rankValue] : void 0,
    courtTheme: isCourt ? COURT_ARCHETYPES[rank] : void 0
  };
}
function buildMinorSummary(cardLike = {}) {
  const ctx = getMinorContext(cardLike);
  if (!ctx)
    return "";
  const bits = [];
  if (ctx.suitTheme) {
    bits.push(
      `As a ${ctx.suit} card, this speaks to ${ctx.suitTheme}.`
    );
  }
  if (ctx.isCourt && ctx.courtTheme) {
    bits.push(
      `As a ${ctx.rank}, it highlights ${ctx.courtTheme}.`
    );
  } else if (ctx.pipTheme) {
    bits.push(
      `At this rank, it marks ${ctx.pipTheme}.`
    );
  }
  return bits.join(" ");
}
var SUIT_THEMES, PIP_NUMEROLOGY, COURT_ARCHETYPES;
var init_minorMeta = __esm({
  "lib/minorMeta.js"() {
    init_functionsRoutes_0_2857290313673917();
    SUIT_THEMES = {
      Wands: "fire, initiative, creativity, desire, and the way you act on your will",
      Cups: "water, emotions, relationships, intuition, and how you give and receive care",
      Swords: "air, mind, truth, communication, and how you navigate tension or clarity",
      Pentacles: "earth, body, work, resources, and the material structures that support you"
    };
    PIP_NUMEROLOGY = {
      1: "a seed or new spark of this suit\u2019s energy, raw potential and beginnings",
      2: "duality, choices, early tension or balance within this suit\u2019s themes",
      3: "growth, first stability, collaboration, and visible development",
      4: "foundation, consolidation, stability that can comfort or confine",
      5: "conflict, disruption, tests that stress the pattern and demand adjustment",
      6: "recognition, victory, and public acknowledgment",
      7: "assessment, testing, deeper questions about direction and alignment",
      8: "dedication, focused work, sustained effort in this suit\u2019s domain",
      9: "fruition, culmination near completion, self-sufficiency in this area",
      10: "peak expression, legacy, long-term consequence of the suit\u2019s journey"
    };
    COURT_ARCHETYPES = {
      Page: "a student or messenger of this suit\u2014curiosity, signals, early expressions of this energy, often within you",
      Knight: "movement and pursuit in this suit\u2014how you or another actively chase, defend, or embody this energy",
      Queen: "mature, receptive mastery of this suit\u2014embodied wisdom, emotional intelligence, stewardship from within",
      King: "mature, directive mastery of this suit\u2014visible leadership, structure, and accountability in this area"
    };
    __name(parseMinorName, "parseMinorName");
    __name(getMinorContext, "getMinorContext");
    __name(buildMinorSummary, "buildMinorSummary");
  }
});

// lib/imageryHooks.js
function buildPipInterpretation(suit, rank) {
  const rankValue = PIP_RANK_VALUES[rank];
  const numerology = rankValue ? PIP_NUMEROLOGY[rankValue] : null;
  const suitTheme = SUIT_THEMES[suit] || `${suit.toLowerCase()} matters`;
  if (!numerology) {
    return `It deepens the ${suit} story through lived experience.`;
  }
  return `It highlights ${numerology} within ${suitTheme}.`;
}
function getImageryHook(cardNumber, orientation = "upright") {
  const imagery = MAJOR_ARCANA_IMAGERY[cardNumber];
  if (!imagery)
    return null;
  const isReversed = orientation.toLowerCase() === "reversed";
  return {
    visual: imagery.visual,
    interpretation: isReversed ? imagery.reversed : imagery.upright,
    sensory: imagery.sensory
  };
}
function isMajorArcana(cardNumber) {
  return cardNumber !== void 0 && cardNumber >= 0 && cardNumber <= 21;
}
function getElementalImagery(element1, element2) {
  if (!element1 || !element2)
    return null;
  const key = `${element1}-${element2}`;
  return ELEMENTAL_SENSORY[key] || null;
}
function getMinorImageryHook(input) {
  if (!input)
    return null;
  const {
    card,
    suit,
    rank,
    orientation = "Upright"
  } = input;
  const name = card || (rank && suit ? `${rank} of ${suit}` : null);
  const isReversed = String(orientation).toLowerCase() === "reversed";
  const isCourt = ["Page", "Knight", "Queen", "King"].includes(rank);
  if (name && MINOR_ARCANA_IMAGERY[name]) {
    const entry = MINOR_ARCANA_IMAGERY[name];
    return {
      visual: entry.visual,
      sensory: entry.sensory,
      interpretation: entry.interpretation + (isReversed ? " Read this as energy turned inward, delayed, or asking for recalibration." : "")
    };
  }
  if (!isCourt && name && MINOR_PIP_IMAGERY[name]) {
    const pipEntry = MINOR_PIP_IMAGERY[name];
    return {
      visual: pipEntry.visual,
      sensory: pipEntry.sensory,
      interpretation: pipEntry.interpretation + (isReversed ? " When reversed, notice where this flow turns inward or requests recalibration." : "")
    };
  }
  if (suit && MINOR_SUIT_IMAGERY[suit]) {
    const suitHook = MINOR_SUIT_IMAGERY[suit];
    return {
      visual: suitHook.visual,
      sensory: suitHook.sensory,
      interpretation: suitHook.interpretation
    };
  }
  return null;
}
var MINOR_ARCANA_IMAGERY, MINOR_SUIT_IMAGERY, PIP_RANK_VALUES, MINOR_PIP_IMAGERY, MAJOR_ARCANA_IMAGERY, ELEMENTAL_SENSORY;
var init_imageryHooks = __esm({
  "lib/imageryHooks.js"() {
    init_functionsRoutes_0_2857290313673917();
    init_minorMeta();
    MINOR_ARCANA_IMAGERY = {
      "Page of Wands": {
        visual: "Youthful figure holding a sprouting wand in a barren landscape",
        sensory: "First spark of curiosity, warm breeze of inspiration",
        interpretation: "Early-stage creative messages, exploring desire with playful courage."
      },
      "Knight of Wands": {
        visual: "Rider charging forward on a rearing horse with wand raised",
        sensory: "Rushing heat, drums of motion, sand kicked up by fast hooves",
        interpretation: "Bold, impulsive action; pursuing passion quickly and visibly."
      },
      "Queen of Wands": {
        visual: "Throne with lions and sunflowers, black cat at her feet",
        sensory: "Confident warmth, steady firelight, magnetic presence",
        interpretation: "Confident, charismatic leadership; tending creative fire with assurance."
      },
      "King of Wands": {
        visual: "Throne decorated with lions and salamanders, wand flowering",
        sensory: "Commanding warmth, steady blaze, visionary gaze",
        interpretation: "Visionary direction and decisive will in creative or entrepreneurial realms."
      },
      "Page of Cups": {
        visual: "Youthful figure contemplating a cup with a small fish emerging",
        sensory: "Soft tide against shore, shy smile, gentle surprise",
        interpretation: "Tentative emotional openings, messages of the heart, intuitive nudges."
      },
      "Knight of Cups": {
        visual: "Armored figure carrying a cup, horse stepping carefully",
        sensory: "Calm river, invitation in motion, poetic sincerity",
        interpretation: "Romantic or idealistic pursuit; moving toward emotional or creative offers."
      },
      "Queen of Cups": {
        visual: "Throne by the sea, ornate covered cup held with devotion",
        sensory: "Quiet waves, deep listening, comforting embrace",
        interpretation: "Emotional depth, empathy, intuitive care; holding space with sensitivity."
      },
      "King of Cups": {
        visual: "Throne on the water, waves beneath, cup and scepter balanced",
        sensory: "Rocking tide, composed breath, storm held kindly",
        interpretation: "Emotional maturity and steady leadership amid changing feelings."
      },
      "Page of Swords": {
        visual: "Youth with raised sword in shifting winds",
        sensory: "Quick gusts, alert stance, restless thoughts",
        interpretation: "Curiosity of the mind, questions, watching and learning; messages or ideas emerging."
      },
      "Knight of Swords": {
        visual: "Rider charging forward with sword raised, trees bent by wind",
        sensory: "Cutting wind, urgent hooves, sharp focus",
        interpretation: "Swift, uncompromising communication or decisions; moving fast on convictions."
      },
      "Queen of Swords": {
        visual: "Throne in clear air, sword upright, hand extended",
        sensory: "Crisp clarity, cool breeze, discerning gaze",
        interpretation: "Honest insight, boundaries, compassionate but direct truth-telling."
      },
      "King of Swords": {
        visual: "Throne high above, sword held with authority",
        sensory: "Still air before a verdict, precise words, mental order",
        interpretation: "Strategic thought, clear judgment, accountability through intellect."
      },
      "Page of Pentacles": {
        visual: "Youth studying a pentacle in a green field",
        sensory: "Fresh soil, focused gaze, new sprout",
        interpretation: "Beginnings in study, work, or health; grounding dreams into first practical steps."
      },
      "Knight of Pentacles": {
        visual: "Rider on a still horse, pentacle held steady",
        sensory: "Slow hoofbeats, patient breath, tilled earth",
        interpretation: "Steady, methodical progress; diligence, reliability, and follow-through."
      },
      "Queen of Pentacles": {
        visual: "Throne amidst vines and wildlife, pentacle cradled",
        sensory: "Warm hearth, fertile garden, soothing touch",
        interpretation: "Nurturing practicality; care through tangible support and resourcing."
      },
      "King of Pentacles": {
        visual: "Throne adorned with bulls and grapes, city behind",
        sensory: "Weight of success, rich textures, secure footing",
        interpretation: "Material mastery; stewardship of resources, legacy, and stability."
      }
    };
    MINOR_SUIT_IMAGERY = {
      Wands: {
        visual: "flame, branch, wand, desert heat, campfire glow",
        sensory: "crackle of fire, rush of momentum, creative spark",
        interpretation: "Action, will, creativity, desire, initiation."
      },
      Cups: {
        visual: "chalice, flowing water, moonlit sea, shared cup",
        sensory: "cool tides, heart swell, intuitive currents",
        interpretation: "Emotions, relationships, intuition, care, receptivity."
      },
      Swords: {
        visual: "sword, wind, storm clouds, cut of air",
        sensory: "sharp clarity, mental buzz, cool edge",
        interpretation: "Mind, truth, decisions, communication, conflict and resolution."
      },
      Pentacles: {
        visual: "coin, garden, stone path, roots",
        sensory: "solid ground, steady heartbeat, tactile focus",
        interpretation: "Body, work, resources, health, tangible commitments."
      }
    };
    PIP_RANK_VALUES = {
      Ace: 1,
      Two: 2,
      Three: 3,
      Four: 4,
      Five: 5,
      Six: 6,
      Seven: 7,
      Eight: 8,
      Nine: 9,
      Ten: 10
    };
    __name(buildPipInterpretation, "buildPipInterpretation");
    MINOR_PIP_IMAGERY = {
      "Ace of Wands": {
        visual: "Hand emerging from a cloud presenting a sprouting wand above rolling hills and a distant castle",
        sensory: "Pulse of heat in the palm, scent of resin and fresh growth on the wind",
        interpretation: buildPipInterpretation("Wands", "Ace")
      },
      "Two of Wands": {
        visual: "Figure standing on castle battlements holding a globe with two wands anchoring the space",
        sensory: "Cool stone beneath boots, breeze carrying distant possibilities",
        interpretation: buildPipInterpretation("Wands", "Two")
      },
      "Three of Wands": {
        visual: "Cloaked traveler watching ships depart from a cliff beside three rooted wands",
        sensory: "Salt air rising with anticipation, cloak catching a steady breeze",
        interpretation: buildPipInterpretation("Wands", "Three")
      },
      "Four of Wands": {
        visual: "Garland-draped wands forming a ceremonial arch as figures celebrate beyond it",
        sensory: "Laughter and music in warm air, scent of flowers and festivity",
        interpretation: buildPipInterpretation("Wands", "Four")
      },
      "Five of Wands": {
        visual: "Band of youths brandishing wands in spirited but chaotic competition",
        sensory: "Wooden staffs clacking, breathless shouts, crackle of spirited rivalry",
        interpretation: buildPipInterpretation("Wands", "Five")
      },
      "Six of Wands": {
        visual: "Laureled rider on horseback raising a wand while onlookers hold theirs aloft",
        sensory: "Cheer of the crowd, rhythmic hoofbeats, triumph warming the chest",
        interpretation: buildPipInterpretation("Wands", "Six")
      },
      "Seven of Wands": {
        visual: "Guardian braced on a hilltop thrusting a wand against unseen challengers below",
        sensory: "Adrenaline-quickened breath, gritty soil underfoot, resistance humming in muscles",
        interpretation: buildPipInterpretation("Wands", "Seven")
      },
      "Eight of Wands": {
        visual: "Eight wands streak diagonally through clear sky above distant meadows",
        sensory: "Rush of wind, momentum whistling forward, anticipation crackling",
        interpretation: buildPipInterpretation("Wands", "Eight")
      },
      "Nine of Wands": {
        visual: "Bandaged sentinel gripping a wand while eight others stand like a fence behind",
        sensory: "Muscles aching yet alert, heartbeat steadying, smell of earth after effort",
        interpretation: buildPipInterpretation("Wands", "Nine")
      },
      "Ten of Wands": {
        visual: "Figure hunched beneath the weight of ten bundled wands trudging toward town",
        sensory: "Strain in shoulders, labored breath, warmth of duty despite fatigue",
        interpretation: buildPipInterpretation("Wands", "Ten")
      },
      "Ace of Cups": {
        visual: "Hand emerging from a cloud presenting an overflowing chalice crowned by a dove",
        sensory: "Cool overflow cascading, heart swelling with gentle pulse of grace",
        interpretation: buildPipInterpretation("Cups", "Ace")
      },
      "Two of Cups": {
        visual: "Two figures exchange cups beneath a caduceus and lion-headed emblem",
        sensory: "Soft exchange of vows, shared heartbeat, warmth of mutual recognition",
        interpretation: buildPipInterpretation("Cups", "Two")
      },
      "Three of Cups": {
        visual: "Three women dance in a circle, cups raised amid harvest bounty",
        sensory: "Clinking cups, joyful laughter, scent of ripe fruit and flowers",
        interpretation: buildPipInterpretation("Cups", "Three")
      },
      "Four of Cups": {
        visual: "Seated figure beneath a tree contemplates three cups as a fourth is offered by a cloud",
        sensory: "Still air, muted heartbeat, cool bark pressing against the back during contemplation",
        interpretation: buildPipInterpretation("Cups", "Four")
      },
      "Five of Cups": {
        visual: "Cloaked figure mourns over three spilled cups while two remain standing near a river",
        sensory: "Cold mist clinging to skin, heaviness in the chest, distant rush of water not yet heard",
        interpretation: buildPipInterpretation("Cups", "Five")
      },
      "Six of Cups": {
        visual: "Child offers a flower-filled cup to another within a sunlit courtyard",
        sensory: "Sweet scent of blossoms, gentle laughter, nostalgia like warm sunlight",
        interpretation: buildPipInterpretation("Cups", "Six")
      },
      "Seven of Cups": {
        visual: "Silhouetted figure gazes at seven floating cups filled with fantastical visions",
        sensory: "Dreamlike haze, shimmering possibilities, dizzying mix of desire and uncertainty",
        interpretation: buildPipInterpretation("Cups", "Seven")
      },
      "Eight of Cups": {
        visual: "Traveler climbs away from stacked cups under moonlit sky and distant mountains",
        sensory: "Cool night air, crunch of gravel underfoot, pull of inner longing guiding the step",
        interpretation: buildPipInterpretation("Cups", "Eight")
      },
      "Nine of Cups": {
        visual: "Content figure sits before a curved display of nine cups like trophies",
        sensory: "Satiated sigh, velvety richness, quiet confidence settling in the belly",
        interpretation: buildPipInterpretation("Cups", "Nine")
      },
      "Ten of Cups": {
        visual: "Family rejoices beneath a rainbow of cups arching over a pastoral home",
        sensory: "Children laughing, harmonized heartbeat of loved ones, gentle rain-washed breeze",
        interpretation: buildPipInterpretation("Cups", "Ten")
      },
      "Ace of Swords": {
        visual: "Hand from a cloud raises a crowned sword above jagged mountains",
        sensory: "Cool rush of clarity, ozone in the air, mind snapping into focus",
        interpretation: buildPipInterpretation("Swords", "Ace")
      },
      "Two of Swords": {
        visual: "Blindfolded figure sits at the shoreline with crossed swords under a moonlit sky",
        sensory: "Still night breeze, tension in shoulders, quiet of suspended decision",
        interpretation: buildPipInterpretation("Swords", "Two")
      },
      "Three of Swords": {
        visual: "Heart pierced by three swords against a storm-laden, rain-filled sky",
        sensory: "Sharp sting of heartbreak, chill of rain, echo of thunder inside the chest",
        interpretation: buildPipInterpretation("Swords", "Three")
      },
      "Four of Swords": {
        visual: "Knight rests on a tomb within a chapel, swords hanging on the wall and one beneath",
        sensory: "Sacred silence, slow measured breath, cool stone supporting stillness",
        interpretation: buildPipInterpretation("Swords", "Four")
      },
      "Five of Swords": {
        visual: "Figure gathers swords with a sly grin as defeated figures walk away along the beach",
        sensory: "Salt wind whipping, hollow victory buzzing in ears, footsteps receding on wet sand",
        interpretation: buildPipInterpretation("Swords", "Five")
      },
      "Six of Swords": {
        visual: "Boat ferries cloaked figures across calm water with swords standing in the bow",
        sensory: "Gentle rocking of the boat, soft lapping water, muted conversation of transition",
        interpretation: buildPipInterpretation("Swords", "Six")
      },
      "Seven of Swords": {
        visual: "Sneaking figure tiptoes from a camp carrying five swords, two left behind",
        sensory: "Rustle of tents, quickened pulse, careful feet on dewy grass",
        interpretation: buildPipInterpretation("Swords", "Seven")
      },
      "Eight of Swords": {
        visual: "Blindfolded figure stands bound amid eight swords planted in soggy ground",
        sensory: "Damp chill around ankles, breath shallow, mind searching for the gap in confinement",
        interpretation: buildPipInterpretation("Swords", "Eight")
      },
      "Nine of Swords": {
        visual: "Person bolts upright in bed with hands covering their face, nine swords etched on the wall",
        sensory: "Nightmare echo, rapid heartbeat, darkness pressing against awareness",
        interpretation: buildPipInterpretation("Swords", "Nine")
      },
      "Ten of Swords": {
        visual: "First light dawns behind a figure lying prone with ten swords in their back",
        sensory: "Cold shock of finality, stillness before sunrise, awareness of inevitable ending",
        interpretation: buildPipInterpretation("Swords", "Ten")
      },
      "Ace of Pentacles": {
        visual: "Hand extends a pentacle from a cloud above a flowering garden and open archway",
        sensory: "Fresh earth scent, solid weight of opportunity in the palm, promise of growth",
        interpretation: buildPipInterpretation("Pentacles", "Ace")
      },
      "Two of Pentacles": {
        visual: "Figure juggles two pentacles linked by an infinity loop with ships pitching on waves behind",
        sensory: "Playful sway under shifting ground, salty breeze, balancing heartbeat keeping time",
        interpretation: buildPipInterpretation("Pentacles", "Two")
      },
      "Three of Pentacles": {
        visual: "Craftsman discusses cathedral plans with monk and noble as pentacles decorate the arch",
        sensory: "Chisel tapping stone, collaborative murmurs, dust motes lit by stained glass",
        interpretation: buildPipInterpretation("Pentacles", "Three")
      },
      "Four of Pentacles": {
        visual: "Figure sits guarding pentacles with a cityscape beyond",
        sensory: "Grip tightening around coin, sturdy seat beneath, city hum muted by guarded focus",
        interpretation: buildPipInterpretation("Pentacles", "Four")
      },
      "Five of Pentacles": {
        visual: "Two figures hobble through snow past a stained-glass window filled with pentacles",
        sensory: "Biting cold on skin, crunch of snow, faint glow of sanctuary just out of reach",
        interpretation: buildPipInterpretation("Pentacles", "Five")
      },
      "Six of Pentacles": {
        visual: "Merchant balances scales while giving coins to two kneeling figures",
        sensory: "Clink of coins, warm generosity flowing, gratitude mingling with need",
        interpretation: buildPipInterpretation("Pentacles", "Six")
      },
      "Seven of Pentacles": {
        visual: "Gardener pauses to assess pentacles growing on a vine by his side",
        sensory: "Earth under boots, patient breath, smell of greenery in slow maturation",
        interpretation: buildPipInterpretation("Pentacles", "Seven")
      },
      "Eight of Pentacles": {
        visual: "Craftsman carves pentacles along a workbench with a town in the distance",
        sensory: "Steady rhythm of hammer and chisel, focused gaze, calloused hands warm with effort",
        interpretation: buildPipInterpretation("Pentacles", "Eight")
      },
      "Nine of Pentacles": {
        visual: "Elegant figure in a vineyard holds a falcon with pentacles arrayed behind",
        sensory: "Silk brushing skin, bird's steady heartbeat, sunlit abundance settling calmly",
        interpretation: buildPipInterpretation("Pentacles", "Nine")
      },
      "Ten of Pentacles": {
        visual: "Generational scene beneath an archway adorned with pentacles, dogs at an elder's feet",
        sensory: "Home's hearth-warmth, gentle murmur of family, legacy felt in every touch",
        interpretation: buildPipInterpretation("Pentacles", "Ten")
      }
    };
    MAJOR_ARCANA_IMAGERY = {
      0: {
        // The Fool
        visual: "Figure at cliff's edge, white rose in hand, small dog at heels, sun rising behind",
        upright: "Notice the Fool's gaze toward the horizon\u2014an invitation to step forward into the unknown with trust.",
        reversed: "The figure hesitates at the precipice; the leap requires more preparation before the jump.",
        sensory: "Air fresh with possibility, ground firm yet temporary, the moment before flight"
      },
      1: {
        // The Magician
        visual: "Figure with infinity symbol overhead, tools of all suits laid before them, one hand to heaven, one to earth",
        upright: "See the Magician's tools arrayed\u2014all resources are present; what matters now is focused will.",
        reversed: "The tools remain, but the connecting current wavers; redirect scattered energy inward.",
        sensory: "Electric potential humming, channel opening, the sensation of power seeking direction"
      },
      2: {
        // The High Priestess
        visual: "Seated figure between pillars, lunar crown, scroll of hidden knowledge, veil behind",
        upright: "Picture the veil behind the High Priestess\u2014what's concealed will reveal itself through intuition, not force.",
        reversed: "The veil thickens; secrets remain hidden, requiring deeper stillness to penetrate.",
        sensory: "Moonlit silence, whispered knowing, the weight of unspoken truth"
      },
      3: {
        // The Empress
        visual: "Reclining figure in nature, wheat fields, waterfall, Venus symbol on heart shield",
        upright: "Observe the Empress amid abundance\u2014creativity flows when you nurture rather than push.",
        reversed: "The garden needs tending; creative blocks signal a call to self-care first.",
        sensory: "Rich earth, lush growth, the warmth of sunlight on skin, generative overflow"
      },
      4: {
        // The Emperor
        visual: "Enthroned figure, ram's head armrests, mountains behind, scepter and orb in hand",
        upright: "Note the Emperor's mountain throne\u2014stability comes through structure, leadership through clarity.",
        reversed: "The throne feels rigid; authority becomes tyranny when divorced from compassion.",
        sensory: "Stone solidity, weight of responsibility, the sharp edges of order"
      },
      5: {
        // The Hierophant
        visual: "Seated spiritual figure, crossed keys, two acolytes, raised hand in blessing",
        upright: "See the Hierophant's blessing hand\u2014tradition and teaching offer a path, not a prison.",
        reversed: "The keys turn inward; spiritual authority comes from personal truth, not inherited dogma.",
        sensory: "Incense smoke, ancient words, the resonance of collective wisdom"
      },
      6: {
        // The Lovers
        visual: "Two figures beneath an angel, tree of knowledge behind one, tree of life behind the other",
        upright: "Picture the angel's blessing above the Lovers\u2014alignment of values creates sacred union.",
        reversed: "The figures turn slightly away; misalignment requires honest examination before harmony.",
        sensory: "Magnetic pull, vulnerability exposed, the tremor of choice that shapes destiny"
      },
      7: {
        // The Chariot
        visual: "Armored figure in chariot, two sphinxes (black and white) pulling, city behind, starry canopy above",
        upright: "Notice the Chariot's opposing sphinxes\u2014mastery comes through directing contrary forces as one.",
        reversed: "The sphinxes pull in different directions; regain control by clarifying where you're heading.",
        sensory: "Reins taut, momentum building, the tension of harnessed power"
      },
      8: {
        // Strength
        visual: "Figure gently closing or opening lion's mouth, infinity symbol overhead, flowers in hair",
        upright: "See the gentle hand on the lion's jaw\u2014true strength is compassionate persuasion, not domination.",
        reversed: "The lion stirs restlessly; inner courage must be reclaimed through self-compassion first.",
        sensory: "Soft power, warm courage, the paradox of gentle mastery"
      },
      9: {
        // The Hermit
        visual: "Cloaked figure on mountain peak, lantern held high containing six-pointed star, staff in other hand",
        upright: "Picture the Hermit's lantern piercing darkness\u2014solitude illuminates what crowds obscure.",
        reversed: "The light dims from isolation; balance solitude with connection to avoid withdrawal.",
        sensory: "Crystalline silence, focused beam in darkness, the cold clarity of altitude"
      },
      10: {
        // Wheel of Fortune
        visual: "Great wheel turning, sphinx atop, snake descending, Anubis rising, Hebrew letters and alchemical symbols",
        upright: "Observe the ever-turning Wheel\u2014cycles change; what rises must descend, what falls will rise again.",
        reversed: "The Wheel resists its turn; clinging to the current phase delays inevitable transformation.",
        sensory: "Momentum shifting, the vertigo of change, fate's hand at the wheel"
      },
      11: {
        // Justice
        visual: "Seated figure, scales in one hand, sword in the other, purple veil behind, pillars flanking",
        upright: "Notice Justice's balanced scales\u2014truth seeks equilibrium, consequences align with actions.",
        reversed: "The scales tip unfairly; accountability is blurred, requiring honest self-examination.",
        sensory: "Sharp clarity, the weight of truth, balance achieved through precision"
      },
      12: {
        // The Hanged Man
        visual: "Figure suspended by one foot from living tree, halo around head, peaceful expression, other leg crossed",
        upright: "See the Hanged Man's serene face\u2014surrender inverts perspective, revealing what striving conceals.",
        reversed: "Suspended still, but struggling against the pause; resistance prolongs the waiting.",
        sensory: "Stillness that speaks, inverted clarity, the paradox of progress through pause"
      },
      13: {
        // Death
        visual: "Armored skeleton on white horse, banner with five-petaled rose, sun rising between towers",
        upright: "Picture the sun rising behind Death\u2014endings clear ground for what must be born next.",
        reversed: "The transformation stalls; inner metamorphosis proceeds privately before outer change manifests.",
        sensory: "Finality's clean cut, composting decay into fertile ground, the phoenix moment"
      },
      14: {
        // Temperance
        visual: "Angelic figure pouring water between cups, one foot on land, one in water, mountain and rising sun behind",
        upright: "Notice Temperance's flowing water\u2014balance is active mixing, not static division.",
        reversed: "The flow disrupts; excess or deficiency calls for recalibration and patience.",
        sensory: "Alchemical blending, fluid adjustment, the art of measured integration"
      },
      15: {
        // The Devil
        visual: "Horned figure, inverted pentagram, chained naked figures with tails, torch, raised hand",
        upright: "See the loose chains on the Devil's captives\u2014bondage is often chosen; freedom requires owning the key you hold.",
        reversed: "The chains loosen; awareness of patterns begins liberation from shadow attachments.",
        sensory: "Seductive weight, the comfort of familiar bindings, sulfur and shadow"
      },
      16: {
        // The Tower
        visual: "Lightning strikes crown of tower, figures falling, flaming debris, gray sky",
        upright: "Notice the Tower's lightning\u2014sudden upheaval shatters false structures, clearing space for truth.",
        reversed: "The strike lands internally; transformation proceeds through private revelation rather than external crisis.",
        sensory: "Thunderclap revelation, foundations crumbling, the vertigo of necessary collapse"
      },
      17: {
        // The Star
        visual: "Naked figure kneeling, pouring water into pool and onto land, large star overhead, seven smaller stars, bird in tree",
        upright: "Picture the Star's flowing water\u2014hope replenishes when you pour yourself into purpose and trust.",
        reversed: "The water hesitates; renew faith by reconnecting to what you truly believe in.",
        sensory: "Luminous hope, cool renewal, the quiet return of faith"
      },
      18: {
        // The Moon
        visual: "Full moon with face, two towers, dog and wolf howling, crayfish emerging from water, winding path",
        upright: "See the Moon's deceptive path\u2014navigate uncertainty by trusting intuition when clarity is absent.",
        reversed: "Illusions begin to thin; repressed emotions surface, bringing difficult clarity.",
        sensory: "Silver ambiguity, shifting shadows, the howl of primal emotion"
      },
      19: {
        // The Sun
        visual: "Radiant sun with face, naked child on white horse, sunflowers, red banner, wall behind",
        upright: "Notice the child's unguarded joy on the Sun's horse\u2014authenticity shines when pretense falls away.",
        reversed: "The light feels too bright or not quite reaching; reconnect with simple pleasures to restore vitality.",
        sensory: "Radiant warmth, innocent delight, golden clarity without shadow"
      },
      20: {
        // Judgement
        visual: "Angel blowing trumpet, naked figures rising from coffins with arms outstretched, mountains and water",
        upright: "Picture Judgement's trumpet call\u2014reckoning invites you to rise to your highest calling, absolved and renewed.",
        reversed: "The call sounds, but you hesitate; inner critic delays answering what you know you must do.",
        sensory: "Clarion summons, resurrection pull, the weight lifting from old shame"
      },
      21: {
        // The World
        visual: "Dancer with wreath, wands in hands, surrounded by wreath, four fixed signs in corners",
        upright: "See the World's dancing figure within the wreath\u2014completion celebrates wholeness before the next cycle begins.",
        reversed: "The dance slows near the end; closure delays, or shortcuts prevent true integration.",
        sensory: "Harmonious culmination, the satisfaction of full circle, seeds of the next beginning"
      }
    };
    __name(getImageryHook, "getImageryHook");
    __name(isMajorArcana, "isMajorArcana");
    ELEMENTAL_SENSORY = {
      "Fire-Air": {
        relationship: "supportive",
        imagery: "Picture a spark fanned into flame\u2014this illustrates how these energies amplify each other's potential."
      },
      "Air-Fire": {
        relationship: "supportive",
        imagery: "Like wind feeding flame, these forces work together to accelerate momentum and spread influence."
      },
      "Water-Earth": {
        relationship: "supportive",
        imagery: "As rain nourishes soil, these energies combine to create fertile ground for growth and manifestation."
      },
      "Earth-Water": {
        relationship: "supportive",
        imagery: "Like riverbanks shaping the flow, these elements guide and contain each other constructively."
      },
      "Fire-Water": {
        relationship: "tension",
        imagery: "Steam rises where fire meets water\u2014this friction creates obscuring mist that requires skillful navigation."
      },
      "Water-Fire": {
        relationship: "tension",
        imagery: "Water and flame struggle for dominance; integration requires honoring both emotional depth and passionate drive."
      },
      "Air-Earth": {
        relationship: "tension",
        imagery: "Wind scatters earth, earth dampens flight\u2014these forces must be consciously balanced to avoid stagnation or chaos."
      },
      "Earth-Air": {
        relationship: "tension",
        imagery: "Like dust devils in desert, grounded stability and airy ideals create productive friction when held together."
      },
      "Fire-Fire": {
        relationship: "amplified",
        imagery: "Flame meeting flame intensifies to wildfire\u2014this doubled energy demands conscious direction to avoid burnout."
      },
      "Water-Water": {
        relationship: "amplified",
        imagery: "Depths upon depths\u2014emotional currents run strong and deep, potentially overwhelming without grounding."
      },
      "Air-Air": {
        relationship: "amplified",
        imagery: "Thought spirals into thought\u2014mental energy accelerates, brilliant yet requiring earthing to manifest."
      },
      "Earth-Earth": {
        relationship: "amplified",
        imagery: "Foundation upon foundation builds bedrock stability, though too much weight may resist necessary change."
      }
    };
    __name(getElementalImagery, "getElementalImagery");
    __name(getMinorImageryHook, "getMinorImageryHook");
  }
});

// lib/narrativeSpine.js
function analyzeSpineCompleteness(text) {
  if (!text || typeof text !== "string") {
    return {
      isComplete: false,
      missingElements: ["what", "why", "whatsNext"],
      suggestions: ["Add concrete description of the card/situation", "Include causal connector", "Provide forward-looking guidance"]
    };
  }
  const lowerText = text.toLowerCase();
  const present = {};
  const missing = [];
  for (const [key, element] of Object.entries(SPINE_ELEMENTS)) {
    const hasElement = element.keywords.some((keyword) => lowerText.includes(keyword));
    present[key] = hasElement;
    if (element.required && !hasElement) {
      missing.push(key);
    }
  }
  return {
    isComplete: missing.length === 0,
    present,
    missing,
    suggestions: missing.map((key) => `Consider adding: ${SPINE_ELEMENTS[key].name}`)
  };
}
function buildWhyFromElemental(elementalRelationship, card1Name, card2Name) {
  if (!elementalRelationship || !elementalRelationship.relationship) {
    return null;
  }
  const safeCard1 = card1Name || "the first card";
  const safeCard2 = card2Name || "the second card";
  const { relationship } = elementalRelationship;
  const templates = {
    supportive: `Because ${safeCard1} supports and harmonizes with ${safeCard2}, these energies flow together constructively.`,
    tension: `However, ${safeCard1} creates friction with ${safeCard2}, requiring skillful navigation to integrate both.`,
    amplified: `Because both energies share the same elemental quality, ${safeCard1} and ${safeCard2} intensify this theme significantly.`,
    neutral: `${safeCard1} and ${safeCard2} work together with subtle complexity.`
  };
  return templates[relationship] || templates.neutral;
}
function enhanceSection(section, metadata = {}) {
  const analysis = analyzeSpineCompleteness(section);
  if (analysis.isComplete) {
    return {
      text: section,
      validation: { ...analysis, enhanced: false }
    };
  }
  let enhanced = section || "";
  const enhancements = [];
  if (analysis.missing.includes("what") && metadata.cards) {
    const cardInfo = Array.isArray(metadata.cards) ? metadata.cards[0] : metadata.cards;
    if (cardInfo && cardInfo.card && cardInfo.position) {
      const orientation = typeof cardInfo.orientation === "string" && cardInfo.orientation.trim() ? ` ${cardInfo.orientation}` : "";
      const whatStatement = `${cardInfo.position}: ${cardInfo.card}${orientation}.`;
      enhanced = `${whatStatement} ${enhanced}`.trim();
      enhancements.push("Added card identification");
    }
  }
  if (analysis.missing.includes("why") && metadata.relationships && metadata.cards) {
    const cards = Array.isArray(metadata.cards) ? metadata.cards : [metadata.cards];
    if (cards.length >= 2 && metadata.relationships.elementalRelationship) {
      const whyStatement = buildWhyFromElemental(
        metadata.relationships.elementalRelationship,
        cards[0].card,
        cards[1].card
      );
      if (whyStatement) {
        enhanced += ` ${whyStatement}`;
        enhancements.push("Added causal connector");
      }
    }
  }
  if (analysis.missing.includes("whatsNext") && metadata.type) {
    const forwardTypes = ["timeline", "outcome", "future", "staff"];
    if (forwardTypes.includes(metadata.type.toLowerCase())) {
      const guidancePrompt = "Consider what this trajectory invites you to do next.";
      enhanced += ` ${guidancePrompt}`;
      enhancements.push("Added forward-looking guidance");
    }
  }
  return {
    text: enhanced,
    validation: {
      ...analysis,
      enhanced: true,
      enhancements
    }
  };
}
function validateReadingNarrative(readingText) {
  if (!readingText || typeof readingText !== "string") {
    return {
      isValid: false,
      errors: ["Reading text is empty or invalid"]
    };
  }
  const sectionPattern = /\*\*([^*]+)\*\*/g;
  const sections = [];
  let match2;
  let lastIndex = 0;
  while ((match2 = sectionPattern.exec(readingText)) !== null) {
    if (lastIndex > 0) {
      const prevHeader = sections[sections.length - 1].header;
      const content = readingText.substring(lastIndex, match2.index).trim();
      sections[sections.length - 1].content = content;
    }
    sections.push({
      header: match2[1],
      start: match2.index,
      content: ""
    });
    lastIndex = sectionPattern.lastIndex;
  }
  if (sections.length > 0) {
    sections[sections.length - 1].content = readingText.substring(lastIndex).trim();
  }
  const analyses = sections.map((section) => ({
    header: section.header,
    analysis: analyzeSpineCompleteness(section.content)
  }));
  const incompleteCount = analyses.filter((a) => !a.analysis.isComplete).length;
  return {
    isValid: incompleteCount === 0,
    totalSections: sections.length,
    completeSections: sections.length - incompleteCount,
    incompleteSections: incompleteCount,
    sectionAnalyses: analyses,
    suggestions: incompleteCount > 0 ? ["Review incomplete sections and ensure they include: what is happening, why/how (connector), and what's next"] : []
  };
}
var SPINE_ELEMENTS;
var init_narrativeSpine = __esm({
  "lib/narrativeSpine.js"() {
    init_functionsRoutes_0_2857290313673917();
    SPINE_ELEMENTS = {
      what: {
        name: "What is happening",
        keywords: ["stands", "shows", "reveals", "manifests", "appears", "presents"],
        required: true
      },
      why: {
        name: "Why/How (connector)",
        keywords: ["because", "therefore", "however", "so that", "this", "since"],
        required: false
        // Optional for single-card sections
      },
      whatsNext: {
        name: "What's next",
        keywords: ["points toward", "suggests", "invites", "calls for", "trajectory", "path"],
        required: false
        // Optional for past-focused positions
      }
    };
    __name(analyzeSpineCompleteness, "analyzeSpineCompleteness");
    __name(buildWhyFromElemental, "buildWhyFromElemental");
    __name(enhanceSection, "enhanceSection");
    __name(validateReadingNarrative, "validateReadingNarrative");
  }
});

// lib/esotericMeta.js
function normalizeRank(rawRank) {
  if (!rawRank)
    return null;
  const key = rawRank.toString().trim().toLowerCase();
  switch (key) {
    case "ace":
      return "Ace";
    case "two":
      return "Two";
    case "three":
      return "Three";
    case "four":
      return "Four";
    case "five":
      return "Five";
    case "six":
      return "Six";
    case "seven":
      return "Seven";
    case "eight":
      return "Eight";
    case "nine":
      return "Nine";
    case "ten":
      return "Ten";
    case "page":
      return "Page";
    case "knight":
      return "Knight";
    case "queen":
      return "Queen";
    case "king":
      return "King";
    default:
      return null;
  }
}
function inferRankFromName(cardName) {
  if (typeof cardName !== "string")
    return null;
  const parts = cardName.split(" of ");
  if (!parts[0])
    return null;
  return normalizeRank(parts[0]);
}
function getRankKey(cardInfo) {
  const directRank = normalizeRank(cardInfo?.rank);
  if (directRank)
    return directRank;
  if (typeof cardInfo?.rankValue === "number") {
    const mapped = RANK_NAME_BY_VALUE[cardInfo.rankValue];
    if (mapped)
      return mapped;
  }
  return inferRankFromName(cardInfo?.card || "");
}
function resolveSuit(cardInfo) {
  if (cardInfo?.suit)
    return cardInfo.suit;
  if (typeof cardInfo?.card !== "string")
    return null;
  return SUITS.find((suit) => cardInfo.card.includes(suit)) || null;
}
function getAstroForCard(cardInfo = {}) {
  if (typeof cardInfo.number === "number" && cardInfo.number >= 0 && cardInfo.number <= 21) {
    return MAJOR_ARCANA_ASTRO[cardInfo.number] || null;
  }
  const suit = resolveSuit(cardInfo);
  const rankKey = getRankKey(cardInfo);
  if (suit && rankKey && MINOR_DECANS[suit] && MINOR_DECANS[suit][rankKey]) {
    return MINOR_DECANS[suit][rankKey];
  }
  return null;
}
function getQabalahForCard(cardInfo = {}) {
  if (typeof cardInfo.number === "number" && cardInfo.number >= 0 && cardInfo.number <= 21) {
    return MAJOR_PATHS[cardInfo.number] || null;
  }
  const suit = resolveSuit(cardInfo);
  const rankKey = getRankKey(cardInfo);
  const sephirothMeta = rankKey ? RANK_TO_SEPHIROTH[rankKey] : null;
  if (sephirothMeta) {
    const world = suit ? SUIT_TO_WORLD[suit] : null;
    return {
      label: sephirothMeta.label,
      focus: world ? `${sephirothMeta.focus} within ${world}` : sephirothMeta.focus
    };
  }
  return null;
}
function shouldSurfaceAstroLens(cardInfo = {}) {
  if (typeof cardInfo.number === "number" && cardInfo.number >= 0 && cardInfo.number <= 21) {
    return true;
  }
  const rankKey = getRankKey(cardInfo);
  return ASTRO_MINOR_PREFERRED_RANKS.has(rankKey || "");
}
function shouldSurfaceQabalahLens(cardInfo = {}) {
  if (typeof cardInfo.number === "number" && cardInfo.number >= 0 && cardInfo.number <= 21) {
    return true;
  }
  const rankKey = getRankKey(cardInfo);
  return QABALAH_MINOR_PREFERRED_RANKS.has(rankKey || "");
}
var MAJOR_ARCANA_ASTRO, MINOR_DECANS, MAJOR_PATHS, RANK_TO_SEPHIROTH, SUIT_TO_WORLD, ASTRO_MINOR_PREFERRED_RANKS, QABALAH_MINOR_PREFERRED_RANKS, RANK_NAME_BY_VALUE, SUITS;
var init_esotericMeta = __esm({
  "lib/esotericMeta.js"() {
    init_functionsRoutes_0_2857290313673917();
    MAJOR_ARCANA_ASTRO = {
      0: {
        label: "Air \u2014 the elemental current of Aleph",
        focus: "inviting openness, experimentation, and trust in the unfolding journey"
      },
      1: {
        label: "Mercury",
        focus: "supporting skillful communication and intentional manifestation"
      },
      2: {
        label: "The Moon",
        focus: "drawing you toward intuition, dreams, and liminal wisdom"
      },
      3: {
        label: "Venus",
        focus: "celebrating fertility, creativity, and receptive abundance"
      },
      4: {
        label: "Aries",
        focus: "emphasizing decisive leadership, structure, and sovereign agency"
      },
      5: {
        label: "Taurus",
        focus: "rooting guidance in steady devotion, embodiment, and values"
      },
      6: {
        label: "Gemini",
        focus: "highlighting choice, dialogue, and mirrored understanding"
      },
      7: {
        label: "Cancer",
        focus: "centering emotional protection, belonging, and purposeful movement"
      },
      8: {
        label: "Leo",
        focus: "calling up heart-led courage and radiant self-expression"
      },
      9: {
        label: "Virgo",
        focus: "favoring discernment, service, and grounded reflection"
      },
      10: {
        label: "Jupiter",
        focus: "opening cycles of expansion, fortune, and recalibration"
      },
      11: {
        label: "Libra",
        focus: "balancing fairness, equilibrium, and relational harmony"
      },
      12: {
        label: "Water \u2014 the elemental path of Mem",
        focus: "guiding surrender, sacrifice, and spiritual attunement"
      },
      13: {
        label: "Scorpio",
        focus: "navigating profound transformation and regenerative endings"
      },
      14: {
        label: "Sagittarius",
        focus: "encouraging synthesis, aim, and philosophical integration"
      },
      15: {
        label: "Capricorn",
        focus: "confronting structures, contracts, and mastery of material bonds"
      },
      16: {
        label: "Mars",
        focus: "igniting sudden change, liberation, and necessary disruption"
      },
      17: {
        label: "Aquarius",
        focus: "channeling vision, hope, and communal renewal"
      },
      18: {
        label: "Pisces",
        focus: "immersing you in intuition, dreams, and mystery"
      },
      19: {
        label: "The Sun",
        focus: "radiating vitality, clarity, and conscious joy"
      },
      20: {
        label: "Fire \u2014 the elemental path of Shin",
        focus: "stirring rebirth, awakening, and spiritual callings"
      },
      21: {
        label: "Saturn with an Earth resonance",
        focus: "grounding completion, responsibility, and embodied wholeness"
      }
    };
    MINOR_DECANS = {
      Wands: {
        Two: {
          label: "Mars in Aries",
          focus: "energizing bold planning and confident choice"
        },
        Three: {
          label: "Sun in Aries",
          focus: "illuminating momentum and visible expansion"
        },
        Four: {
          label: "Venus in Aries",
          focus: "warming celebration, community, and milestone anchoring"
        },
        Five: {
          label: "Saturn in Leo",
          focus: "testing resilience through spirited friction"
        },
        Six: {
          label: "Jupiter in Leo",
          focus: "rewarding leadership with recognition and support"
        },
        Seven: {
          label: "Mars in Leo",
          focus: "fueling courageous defense of personal vision"
        },
        Eight: {
          label: "Mercury in Sagittarius",
          focus: "quickening communication and swift progress"
        },
        Nine: {
          label: "Moon in Sagittarius",
          focus: "sustaining vigilance, intuition, and endurance"
        },
        Ten: {
          label: "Saturn in Sagittarius",
          focus: "asking for disciplined effort and meaningful closure"
        }
      },
      Cups: {
        Two: {
          label: "Venus in Cancer",
          focus: "nurturing bonds, reciprocity, and shared care"
        },
        Three: {
          label: "Mercury in Cancer",
          focus: "weaving heartfelt conversations and community"
        },
        Four: {
          label: "Moon in Cancer",
          focus: "drawing attention to interior tides and emotional safety"
        },
        Five: {
          label: "Mars in Scorpio",
          focus: "exposing intense feelings that crave transformation"
        },
        Six: {
          label: "Sun in Scorpio",
          focus: "reviving soulful loyalty, memory, and devotion"
        },
        Seven: {
          label: "Venus in Scorpio",
          focus: "casting alluring visions that call for discernment"
        },
        Eight: {
          label: "Saturn in Pisces",
          focus: "prompting sober release and spiritual maturity"
        },
        Nine: {
          label: "Jupiter in Pisces",
          focus: "expanding compassion, blessings, and wish fulfillment"
        },
        Ten: {
          label: "Mars in Pisces",
          focus: "motivating active devotion to shared dreams"
        }
      },
      Swords: {
        Two: {
          label: "Moon in Libra",
          focus: "seeking balanced choices through quiet reflection"
        },
        Three: {
          label: "Saturn in Libra",
          focus: "underscoring accountability, truth, and hard-won clarity"
        },
        Four: {
          label: "Jupiter in Libra",
          focus: "encouraging restorative pause and perspective"
        },
        Five: {
          label: "Venus in Aquarius",
          focus: "questioning alignments within communal ideals"
        },
        Six: {
          label: "Mercury in Aquarius",
          focus: "guiding strategic transitions into clearer mental space"
        },
        Seven: {
          label: "Moon in Aquarius",
          focus: "amplifying independent strategy and emotional detachment"
        },
        Eight: {
          label: "Jupiter in Gemini",
          focus: "magnifying mental loops that can still stretch open"
        },
        Nine: {
          label: "Mars in Gemini",
          focus: "stirring restless analyses that need compassionate focus"
        },
        Ten: {
          label: "Sun in Gemini",
          focus: "revealing full illumination after a cycle of thought concludes"
        }
      },
      Pentacles: {
        Two: {
          label: "Jupiter in Capricorn",
          focus: "supporting adaptable resourcefulness within structure"
        },
        Three: {
          label: "Mars in Capricorn",
          focus: "activating collaborative mastery through effort"
        },
        Four: {
          label: "Sun in Capricorn",
          focus: "spotlighting stewardship, stability, and long-term plans"
        },
        Five: {
          label: "Mercury in Taurus",
          focus: "calling attention to mindset shifts amid material strain"
        },
        Six: {
          label: "Moon in Taurus",
          focus: "encouraging reciprocal care and tangible nourishment"
        },
        Seven: {
          label: "Saturn in Taurus",
          focus: "highlighting patience, pruning, and deliberate progress"
        },
        Eight: {
          label: "Sun in Virgo",
          focus: "emphasizing craftsmanship, practice, and refinement"
        },
        Nine: {
          label: "Venus in Virgo",
          focus: "celebrating self-sufficiency and cultivated pleasures"
        },
        Ten: {
          label: "Mercury in Virgo",
          focus: "harmonizing legacy-building with practical intelligence"
        }
      }
    };
    MAJOR_PATHS = {
      0: {
        label: "Path Aleph (Kether \u2194 Chokmah)",
        focus: "channeling pure potential into first breath and awareness"
      },
      1: {
        label: "Path Beth (Kether \u2194 Binah)",
        focus: "guiding intention to take form through focused will"
      },
      2: {
        label: "Path Gimel (Kether \u2194 Tiphareth)",
        focus: "carrying mystery from crown to the heart-center"
      },
      3: {
        label: "Path Daleth (Chokmah \u2194 Binah)",
        focus: "bridging electric insight with receptive understanding"
      },
      4: {
        label: "Path Heh (Chokmah \u2194 Tiphareth)",
        focus: "seeding visionary fire into purposeful action"
      },
      5: {
        label: "Path Vav (Chokmah \u2194 Chesed)",
        focus: "extending divine impulse into benevolent structure"
      },
      6: {
        label: "Path Zayin (Binah \u2194 Tiphareth)",
        focus: "harmonizing discernment, choice, and soulful union"
      },
      7: {
        label: "Path Cheth (Binah \u2194 Geburah)",
        focus: "armoring compassion with disciplined courage"
      },
      8: {
        label: "Path Teth (Chesed \u2194 Geburah)",
        focus: "taming power through heart-centered strength"
      },
      9: {
        label: "Path Yod (Chesed \u2194 Tiphareth)",
        focus: "refining devotion through mindful service"
      },
      10: {
        label: "Path Kaph (Chesed \u2194 Netzach)",
        focus: "turning opportunity through the wheel of fortune"
      },
      11: {
        label: "Path Lamed (Geburah \u2194 Tiphareth)",
        focus: "measuring balance, justice, and ethical alignment"
      },
      12: {
        label: "Path Mem (Geburah \u2194 Hod)",
        focus: "inviting surrender that purifies perception"
      },
      13: {
        label: "Path Nun (Tiphareth \u2194 Netzach)",
        focus: "moving lifeforce toward profound transformation"
      },
      14: {
        label: "Path Samekh (Tiphareth \u2194 Yesod)",
        focus: "tempering experience into integrated wholeness"
      },
      15: {
        label: "Path Ayin (Tiphareth \u2194 Hod)",
        focus: "revealing shadow attachments for mindful release"
      },
      16: {
        label: "Path Peh (Netzach \u2194 Hod)",
        focus: "breaking open stale structures to free vitality"
      },
      17: {
        label: "Path Tzaddi (Netzach \u2194 Yesod)",
        focus: "catching starlight inspirations for embodied hope"
      },
      18: {
        label: "Path Qoph (Netzach \u2194 Malkuth)",
        focus: "guiding dreamscapes toward compassionate embodiment"
      },
      19: {
        label: "Path Resh (Hod \u2194 Yesod)",
        focus: "illuminating clarity that animates the self"
      },
      20: {
        label: "Path Shin (Hod \u2194 Malkuth)",
        focus: "sparking resurrection fire within lived reality"
      },
      21: {
        label: "Path Tav (Yesod \u2194 Malkuth)",
        focus: "grounding spiritual insight into the physical world"
      }
    };
    RANK_TO_SEPHIROTH = {
      Ace: {
        label: "Kether \u2014 Crown",
        focus: "pure seed potential entering this suit"
      },
      Two: {
        label: "Chokmah \u2014 Wisdom",
        focus: "dynamic surge of expanding energy"
      },
      Three: {
        label: "Binah \u2014 Understanding",
        focus: "shaping structure, pattern, and containment"
      },
      Four: {
        label: "Chesed \u2014 Mercy",
        focus: "stabilizing growth with generosity and order"
      },
      Five: {
        label: "Geburah \u2014 Severity",
        focus: "applying discernment, challenge, and recalibration"
      },
      Six: {
        label: "Tiphareth \u2014 Beauty",
        focus: "harmonizing the suit around its radiant heart"
      },
      Seven: {
        label: "Netzach \u2014 Victory",
        focus: "moving through desire, artistry, and endurance"
      },
      Eight: {
        label: "Hod \u2014 Splendor",
        focus: "refining intellect, craft, and communication"
      },
      Nine: {
        label: "Yesod \u2014 Foundation",
        focus: "coalescing the suit\u2019s energy into lived patterns"
      },
      Ten: {
        label: "Malkuth \u2014 Kingdom",
        focus: "manifesting tangible results and embodiment"
      }
    };
    SUIT_TO_WORLD = {
      Wands: "Atziluth (Fire) \u2014 archetypal impulse",
      Cups: "Briah (Water) \u2014 creative formation",
      Swords: "Yetzirah (Air) \u2014 mental shaping",
      Pentacles: "Assiah (Earth) \u2014 material expression"
    };
    ASTRO_MINOR_PREFERRED_RANKS = /* @__PURE__ */ new Set(["Two", "Three", "Six", "Nine"]);
    QABALAH_MINOR_PREFERRED_RANKS = /* @__PURE__ */ new Set(["Ace", "Six", "Ten"]);
    RANK_NAME_BY_VALUE = {
      1: "Ace",
      2: "Two",
      3: "Three",
      4: "Four",
      5: "Five",
      6: "Six",
      7: "Seven",
      8: "Eight",
      9: "Nine",
      10: "Ten",
      11: "Page",
      12: "Knight",
      13: "Queen",
      14: "King"
    };
    SUITS = ["Wands", "Cups", "Swords", "Pentacles"];
    __name(normalizeRank, "normalizeRank");
    __name(inferRankFromName, "inferRankFromName");
    __name(getRankKey, "getRankKey");
    __name(resolveSuit, "resolveSuit");
    __name(getAstroForCard, "getAstroForCard");
    __name(getQabalahForCard, "getQabalahForCard");
    __name(shouldSurfaceAstroLens, "shouldSurfaceAstroLens");
    __name(shouldSurfaceQabalahLens, "shouldSurfaceQabalahLens");
  }
});

// lib/narrativeBuilder.js
function pickOne(value) {
  if (!value)
    return "";
  if (Array.isArray(value) && value.length > 0) {
    return value[Math.floor(Math.random() * value.length)];
  }
  return value;
}
function normalizeContext(context) {
  if (!context || typeof context !== "string")
    return "general";
  const key = context.trim().toLowerCase();
  if (["love", "career", "self", "spiritual"].includes(key)) {
    return key;
  }
  return "general";
}
function getContextDescriptor(context) {
  return CONTEXT_DESCRIPTORS[normalizeContext(context)] || CONTEXT_DESCRIPTORS.general;
}
function resolveSuitForContext(cardInfo = {}) {
  if (cardInfo.suit && MINOR_SUITS.includes(cardInfo.suit)) {
    return cardInfo.suit;
  }
  const name = typeof cardInfo.card === "string" ? cardInfo.card : "";
  return MINOR_SUITS.find((suit) => name.includes(suit)) || null;
}
function buildContextualClause(cardInfo = {}, context) {
  const normalized = normalizeContext(context);
  if (normalized === "general")
    return "";
  const cardName = (cardInfo.card || "").toLowerCase();
  const specificMap = CARD_SPECIFIC_CONTEXT[normalized];
  if (specificMap && specificMap[cardName]) {
    return specificMap[cardName];
  }
  const isMajor = typeof cardInfo.number === "number" && cardInfo.number >= 0 && cardInfo.number <= 21;
  if (isMajor) {
    return MAJOR_CONTEXT_LENSES[normalized] || "";
  }
  const suit = resolveSuitForContext(cardInfo);
  if (suit && SUIT_CONTEXT_LENSES[normalized]?.[suit]) {
    return SUIT_CONTEXT_LENSES[normalized][suit];
  }
  return MAJOR_CONTEXT_LENSES[normalized] || "";
}
function buildContextReminder(context) {
  const normalized = normalizeContext(context);
  if (normalized === "general")
    return "";
  return `We\u2019ll ground this reading in your ${getContextDescriptor(normalized)}, while keeping each card rooted in its Rider\u2013Waite\u2013Smith lineage.`;
}
function buildPositionCardText(cardInfo, position, options = {}) {
  const template = POSITION_LANGUAGE[position];
  const prevElementalRelationship = options.prevElementalRelationship;
  if (!template) {
    const safeCard2 = cardInfo.card || "this card";
    const safeOrientation2 = typeof cardInfo.orientation === "string" && cardInfo.orientation.trim() ? ` ${cardInfo.orientation}` : "";
    const meaning2 = formatMeaningForPosition(cardInfo.meaning || "", position);
    return `${position}: ${safeCard2}${safeOrientation2}. ${meaning2}`;
  }
  const safeCard = cardInfo.card || "this card";
  const safeOrientation = typeof cardInfo.orientation === "string" && cardInfo.orientation.trim() ? cardInfo.orientation : "";
  const introTemplate = pickOne(template.intro);
  const intro = typeof introTemplate === "function" ? introTemplate(safeCard, safeOrientation) : introTemplate || `${position}: ${safeCard} ${safeOrientation}.`;
  const meaning = formatMeaningForPosition(cardInfo.meaning || "", position);
  const contextClause = buildContextualClause(cardInfo, options.context);
  let esotericClause = "";
  if (shouldSurfaceAstroLens(cardInfo)) {
    const astro = getAstroForCard(cardInfo);
    if (astro?.label && astro?.focus) {
      esotericClause = `Traditionally linked with ${astro.label}, ${astro.focus}.`;
    }
  }
  if (!esotericClause && shouldSurfaceQabalahLens(cardInfo)) {
    const qabalah = getQabalahForCard(cardInfo);
    if (qabalah?.label && qabalah?.focus) {
      esotericClause = `On the Tree of Life, this aligns with ${qabalah.label}, ${qabalah.focus}.`;
    }
  }
  const occultFlavor = buildOccultFlavor(cardInfo);
  const enrichedMeaning = [meaning, contextClause, esotericClause, occultFlavor].filter(Boolean).join(" ");
  let imagery = "";
  if (template.useImagery && isMajorArcana(cardInfo.number)) {
    const hook = getImageryHook(cardInfo.number, cardInfo.orientation);
    if (hook && hook.interpretation) {
      imagery = ` ${hook.interpretation}`;
    }
  }
  let minorContextText = "";
  if (!isMajorArcana(cardInfo.number)) {
    const minorSummary = buildMinorSummary({
      card: cardInfo.card,
      name: cardInfo.card,
      suit: cardInfo.suit,
      rank: cardInfo.rank,
      rankValue: cardInfo.rankValue
    });
    if (minorSummary) {
      minorContextText = ` ${minorSummary}`;
    }
    const minorHook = getMinorImageryHook({
      card: cardInfo.card,
      suit: cardInfo.suit,
      rank: cardInfo.rank,
      orientation: cardInfo.orientation
    });
    if (minorHook && minorHook.visual) {
      minorContextText += ` Picture ${minorHook.visual}\u2014this subtly colors how this suit's lesson shows up here.`;
    }
  }
  let elementalImagery = "";
  if (prevElementalRelationship && prevElementalRelationship.elements) {
    const [e1, e2] = prevElementalRelationship.elements;
    const sensoryCue = getElementalImagery(e1, e2);
    if (sensoryCue && sensoryCue.imagery) {
      elementalImagery = ` ${sensoryCue.imagery}`;
    }
  }
  const frameText = pickOne(template.frame) || "";
  const safeElemental = elementalImagery || "";
  const positionLabel = position ? `${position}: ` : "";
  return `${positionLabel}${intro} ${enrichedMeaning}${imagery}${minorContextText} ${frameText}${safeElemental}`;
}
function buildReversalGuidance(reversalDescription) {
  return `Within the ${reversalDescription.name} lens, ${reversalDescription.guidance}`;
}
function getPositionOptions(themes, context) {
  const options = {};
  if (themes && themes.reversalDescription) {
    options.reversalDescription = themes.reversalDescription;
  }
  if (typeof context !== "undefined") {
    options.context = context;
  }
  return options;
}
function getCrossCheckReversalNote(position, themes) {
  if (!position || !themes || !themes.reversalDescription)
    return "";
  if ((position.orientation || "").toLowerCase() !== "reversed")
    return "";
  const guidance = buildReversalGuidance(themes.reversalDescription);
  const positionName = position.name || "Position";
  return `${positionName} (${position.card} ${position.orientation}): ${guidance}`;
}
function formatMeaningForPosition(meaning, position) {
  const firstClause = meaning.includes(".") ? meaning.split(".")[0] : meaning;
  const lowered = firstClause.toLowerCase();
  if (position.includes("Challenge") || position.includes("tension")) {
    return `The friction here shows how it centers on ${lowered}.`;
  }
  if (position.includes("Advice") || position.includes("how to meet") || position.includes("Self / Advice")) {
    return `This shows how it may help to lean into ${lowered}.`;
  }
  if (position.includes("Outcome") || position.includes("direction") || position.includes("Future")) {
    return `If things continue as they are, this shows how the trajectory leans toward ${lowered}.`;
  }
  if (position.includes("Subconscious") || position.includes("Hidden") || position.includes("Below")) {
    return `This reveals how, beneath awareness, part of you is still relating to ${lowered}.`;
  }
  if (position.includes("External")) {
    return `This shows that around you, circumstances echo ${lowered}.`;
  }
  if (position.includes("Hopes & Fears")) {
    return `This reveals both longing and worry around ${lowered}.`;
  }
  return `This shows ${lowered} as a live theme.`;
}
function buildCelticCrossReading({
  cardsInfo,
  userQuestion,
  reflectionsText,
  celticAnalysis,
  themes,
  context
}) {
  const sections = [];
  sections.push(buildOpening("Celtic Cross (Classic 10-Card)", userQuestion, context));
  sections.push(
    enhanceSection(
      buildNucleusSection(celticAnalysis.nucleus, cardsInfo, themes, context),
      { type: "nucleus", cards: [cardsInfo[0], cardsInfo[1]], relationships: { elementalRelationship: celticAnalysis.nucleus.elementalDynamic } }
    ).text
  );
  sections.push(
    enhanceSection(
      buildTimelineSection(celticAnalysis.timeline, cardsInfo, themes, context),
      { type: "timeline" }
    ).text
  );
  sections.push(
    enhanceSection(
      buildConsciousnessSection(celticAnalysis.consciousness, cardsInfo, themes, context),
      { type: "consciousness" }
    ).text
  );
  sections.push(
    enhanceSection(
      buildStaffSection(celticAnalysis.staff, cardsInfo, themes, context),
      { type: "staff" }
    ).text
  );
  sections.push(
    enhanceSection(
      buildCrossChecksSection(celticAnalysis.crossChecks, themes),
      { type: "relationships" }
    ).text
  );
  if (reflectionsText && reflectionsText.trim()) {
    sections.push(buildReflectionsSection(reflectionsText));
  }
  sections.push(
    enhanceSection(
      buildSynthesisSection(cardsInfo, themes, celticAnalysis, userQuestion, context),
      { type: "outcome" }
    ).text
  );
  const readingBody = sections.filter(Boolean).join("\n\n");
  const validation = validateReadingNarrative(readingBody);
  if (!validation.isValid) {
    console.debug("Celtic Cross narrative spine suggestions:", validation.suggestions || validation.sectionAnalyses);
  }
  return appendReversalReminder(readingBody, cardsInfo, themes);
}
function buildOpening(spreadName, userQuestion, context) {
  const question = userQuestion && userQuestion.trim();
  const base = question ? `Focusing on the ${spreadName}, I attune to your question: "${question}"

The cards respond with insight that honors both seen and unseen influences.` : `Focusing on the ${spreadName}, the cards speak to the energy most present for you right now.`;
  const contextReminder = buildContextReminder(context);
  return contextReminder ? `${base}

${contextReminder}` : base;
}
function appendReversalReminder(text, cardsInfo, themes) {
  if (!text)
    return text;
  if (!themes?.reversalDescription) {
    return text;
  }
  const reminder = `*Reversal lens reminder: ${buildReversalGuidance(themes.reversalDescription)}*`;
  if (text.includes(reminder)) {
    return text;
  }
  return `${text}

${reminder}`;
}
function buildNucleusSection(nucleus, cardsInfo, themes, context) {
  const present = cardsInfo[0];
  const challenge = cardsInfo[1];
  let section = `**THE HEART OF THE MATTER** (Nucleus)

`;
  const presentPosition = present.position || "Present \u2014 core situation (Card 1)";
  const challengePosition = challenge.position || "Challenge \u2014 crossing / tension (Card 2)";
  section += `${buildPositionCardText(present, presentPosition, getPositionOptions(themes, context))}

`;
  section += `${buildPositionCardText(challenge, challengePosition, getPositionOptions(themes, context))}

`;
  section += nucleus.synthesis;
  return section;
}
function buildTimelineSection(timeline, cardsInfo, themes, context) {
  const past = cardsInfo[2];
  const present = cardsInfo[0];
  const future = cardsInfo[3];
  let section = `**THE TIMELINE** (Horizontal Axis)

`;
  const options = getPositionOptions(themes, context);
  section += `${buildPositionCardText(past, past.position || "Past \u2014 what lies behind (Card 3)", options)}

`;
  const pastToPresent = timeline.pastToPresent;
  const presentConnector = getConnector("Present \u2014 core situation (Card 1)", "toPrev");
  section += `${presentConnector} ${buildPositionCardText(present, present.position || "Present \u2014 core situation (Card 1)", {
    ...options,
    prevElementalRelationship: pastToPresent
  })}

`;
  const presentToFuture = timeline.presentToFuture;
  const futureConnector = getConnector("Near Future \u2014 what lies before (Card 4)", "toPrev");
  section += `${futureConnector} ${buildPositionCardText(future, future.position || "Near Future \u2014 what lies before (Card 4)", {
    ...options,
    prevElementalRelationship: presentToFuture
  })}

`;
  section += timeline.causality;
  return section;
}
function getConnector(position, direction = "toPrev") {
  const template = POSITION_LANGUAGE[position];
  if (!template)
    return "";
  if (direction === "toPrev" && template.connectorToPrev) {
    return pickOne(template.connectorToPrev);
  }
  if (direction === "toNext" && template.connectorToNext) {
    return pickOne(template.connectorToNext);
  }
  return "";
}
function buildConsciousnessSection(consciousness, cardsInfo, themes, context) {
  const subconscious = cardsInfo[5];
  const conscious = cardsInfo[4];
  let section = `**CONSCIOUSNESS FLOW** (Vertical Axis)

`;
  section += `${buildPositionCardText(subconscious, subconscious.position || "Subconscious \u2014 roots / hidden forces (Card 6)", getPositionOptions(themes, context))}

`;
  section += `${buildPositionCardText(conscious, conscious.position || "Conscious \u2014 goals & focus (Card 5)", getPositionOptions(themes, context))}

`;
  section += consciousness.synthesis;
  if (consciousness.alignment === "conflicted") {
    section += `

*This misalignment suggests inner work is needed to bring your depths and aspirations into harmony.*`;
  } else if (consciousness.alignment === "aligned") {
    section += `

*This alignment is a source of power\u2014your whole being is moving in one direction.*`;
  }
  return section;
}
function buildStaffSection(staff, cardsInfo, themes, context) {
  const self = cardsInfo[6];
  const external = cardsInfo[7];
  const hopesFears = cardsInfo[8];
  const outcome = cardsInfo[9];
  let section = `**THE STAFF** (Context & Trajectory)

`;
  section += `${buildPositionCardText(self, self.position || "Self / Advice \u2014 how to meet this (Card 7)", getPositionOptions(themes, context))}

`;
  section += `${buildPositionCardText(external, external.position || "External Influences \u2014 people & environment (Card 8)", getPositionOptions(themes, context))}

`;
  section += `${buildPositionCardText(hopesFears, hopesFears.position || "Hopes & Fears \u2014 deepest wishes & worries (Card 9)", getPositionOptions(themes, context))}

`;
  section += `${buildPositionCardText(outcome, outcome.position || "Outcome \u2014 likely path if unchanged (Card 10)", getPositionOptions(themes, context))}

`;
  section += staff.adviceImpact;
  return section;
}
function buildCrossChecksSection(crossChecks, themes) {
  let section = `**KEY RELATIONSHIPS**

`;
  section += "This overview shows how core positions interact and compare.\n\n";
  section += formatCrossCheck("Conscious Goal vs Outcome", crossChecks.goalVsOutcome, themes);
  section += `

${formatCrossCheck("Advice vs Outcome", crossChecks.adviceVsOutcome, themes)}`;
  section += `

${formatCrossCheck("Near Future vs Outcome", crossChecks.nearFutureVsOutcome, themes)}`;
  section += `

${formatCrossCheck("Subconscious vs Hopes & Fears", crossChecks.subconsciousVsHopesFears, themes)}`;
  section += "\n\nTaken together, these cross-checks point toward how to translate the spread's insights into your next aligned step.";
  return section;
}
function formatCrossCheck(label, crossCheck, themes) {
  if (!crossCheck) {
    return `${label}: No comparative insight available.`;
  }
  const relationship = crossCheck.elementalRelationship?.relationship;
  let indicator = "";
  if (relationship === "tension") {
    indicator = "\u26A0\uFE0F Elemental tension signals friction that needs balancing.";
  } else if (relationship === "supportive") {
    indicator = "\u2713 Elemental harmony supports this pathway.";
  } else if (relationship === "amplified") {
    indicator = "Elemental repetition amplifies this theme significantly.";
  }
  const reversalNotes = [
    getCrossCheckReversalNote(crossCheck.position1, themes),
    getCrossCheckReversalNote(crossCheck.position2, themes)
  ].filter(Boolean);
  const parts = [];
  if (indicator)
    parts.push(indicator);
  parts.push(crossCheck.synthesis.trim());
  if (reversalNotes.length > 0) {
    parts.push(reversalNotes.join(" "));
  }
  return `${label}: ${parts.join(" ")}`.trim();
}
function buildReflectionsSection(reflectionsText) {
  return `**YOUR REFLECTIONS**

This reflection shows how this reading lands in your lived experience.

${reflectionsText.trim()}

Your intuitive impressions are valid and add personal meaning to this reading.`;
}
function buildSynthesisSection(cardsInfo, themes, celticAnalysis, userQuestion, context) {
  let section = `**SYNTHESIS & GUIDANCE**

`;
  section += "This synthesis shows how the spread integrates into actionable guidance.\n\n";
  if (context && context !== "general") {
    section += `Focus: Interpreting this guidance through ${getContextDescriptor(context)}.

`;
  }
  if (themes.suitFocus) {
    section += `${themes.suitFocus}

`;
  }
  if (themes.archetypeDescription) {
    section += `${themes.archetypeDescription}

`;
  }
  if (themes.elementalBalance) {
    section += `Elemental context: ${themes.elementalBalance}

`;
  }
  if (themes.timingProfile === "near-term-tilt") {
    section += `Pace: These dynamics are poised to move in the nearer term if you act on them.

`;
  } else if (themes.timingProfile === "longer-arc-tilt") {
    section += `Pace: This pattern points to a longer, structural shift that unfolds over time.

`;
  } else if (themes.timingProfile === "developing-arc") {
    section += `Pace: This reads as an unfolding chapter that rewards consistent, conscious engagement.

`;
  }
  const options = getPositionOptions(themes, context);
  const advice = cardsInfo[6];
  const outcome = cardsInfo[9];
  section += `**Your next step**
`;
  section += `This step shows where to focus your agency right now.
`;
  section += `${buildPositionCardText(advice, advice.position || "Self / Advice \u2014 how to meet this (Card 7)", options)}
`;
  section += `${celticAnalysis.staff.adviceImpact}

`;
  section += `**Trajectory Reminder**
${buildPositionCardText(outcome, outcome.position || "Outcome \u2014 likely path if unchanged (Card 10)", options)}
`;
  section += `Remember: The outcome shown by ${outcome.card} is a trajectory based on current patterns. Your choices, consciousness, and actions shape what unfolds. You are co-creating this path.`;
  return section;
}
function buildFiveCardReading({
  cardsInfo,
  userQuestion,
  reflectionsText,
  fiveCardAnalysis,
  themes,
  context
}) {
  const sections = [];
  const spreadName = "Five-Card Clarity";
  sections.push(
    buildOpening(
      spreadName,
      userQuestion || "This spread clarifies the core issue, the challenge, hidden influences, support, and where things are heading if nothing shifts.",
      context
    )
  );
  if (!Array.isArray(cardsInfo) || cardsInfo.length < 5) {
    return "This five-card spread is incomplete; please redraw or ensure all five cards are present.";
  }
  const [core, challenge, hidden, support, direction] = cardsInfo;
  const positionOptions = getPositionOptions(themes, context);
  let coreSection = `**FIVE-CARD CLARITY \u2014 CORE & CHALLENGE**

`;
  coreSection += buildPositionCardText(
    core,
    core.position || "Core of the matter",
    positionOptions
  );
  coreSection += "\n\n";
  const challengePosition = challenge.position || "Challenge or tension";
  const challengeConnector = getConnector(challengePosition, "toPrev");
  const challengeText = buildPositionCardText(
    challenge,
    challengePosition,
    {
      ...positionOptions,
      prevElementalRelationship: fiveCardAnalysis?.coreVsChallenge
    }
  );
  coreSection += challengeConnector ? `${challengeConnector} ${challengeText}` : challengeText;
  coreSection += "\n\n";
  if (fiveCardAnalysis?.coreVsChallenge?.description) {
    coreSection += `

${fiveCardAnalysis.coreVsChallenge.description}.`;
  }
  sections.push(enhanceSection(coreSection, {
    type: "nucleus",
    cards: [core, challenge],
    relationships: { elementalRelationship: fiveCardAnalysis?.coreVsChallenge }
  }).text);
  let hiddenSection = `**HIDDEN INFLUENCE**

`;
  const hiddenPosition = hidden.position || "Hidden / subconscious influence";
  const hiddenConnector = getConnector(hiddenPosition, "toPrev");
  const hiddenText = buildPositionCardText(
    hidden,
    hiddenPosition,
    positionOptions
  );
  hiddenSection += hiddenConnector ? `${hiddenConnector} ${hiddenText}` : hiddenText;
  sections.push(enhanceSection(hiddenSection, {
    type: "subconscious",
    cards: [hidden]
  }).text);
  let supportSection = `**SUPPORTING ENERGIES**

`;
  const supportPosition = support.position || "Support / helpful energy";
  const supportConnector = getConnector(supportPosition, "toPrev");
  const supportText = buildPositionCardText(
    support,
    supportPosition,
    positionOptions
  );
  supportSection += supportConnector ? `${supportConnector} ${supportText}` : supportText;
  sections.push(enhanceSection(supportSection, {
    type: "support",
    cards: [support]
  }).text);
  let directionSection = `**DIRECTION ON YOUR CURRENT PATH**

`;
  const directionPosition = direction.position || "Likely direction on current path";
  const directionConnector = getConnector(directionPosition, "toPrev");
  const directionText = buildPositionCardText(
    direction,
    directionPosition,
    {
      ...positionOptions,
      prevElementalRelationship: fiveCardAnalysis?.supportVsDirection
    }
  );
  directionSection += directionConnector ? `${directionConnector} ${directionText}` : directionText;
  if (fiveCardAnalysis?.synthesis) {
    directionSection += `

${fiveCardAnalysis.synthesis}`;
  }
  sections.push(enhanceSection(directionSection, {
    type: "outcome",
    cards: [direction],
    relationships: { elementalRelationship: fiveCardAnalysis?.supportVsDirection }
  }).text);
  if (reflectionsText && reflectionsText.trim()) {
    sections.push(buildReflectionsSection(reflectionsText));
  }
  const full = sections.filter(Boolean).join("\n\n");
  const validation = validateReadingNarrative(full);
  if (!validation.isValid) {
    console.debug("Five-Card narrative spine suggestions:", validation.suggestions || validation.sectionAnalyses);
  }
  return appendReversalReminder(full, cardsInfo, themes);
}
function buildRelationshipReading({
  cardsInfo,
  userQuestion,
  reflectionsText,
  themes,
  context
}) {
  const sections = [];
  const spreadName = "Relationship Snapshot";
  sections.push(
    buildOpening(
      spreadName,
      userQuestion || "This spread explores your energy, their energy, the connection between you, and guidance for relating with agency and care.",
      context
    )
  );
  const [youCard, themCard, connectionCard, dynamicsCard, outcomeCard] = Array.isArray(cardsInfo) ? cardsInfo : [];
  const options = getPositionOptions(themes, context);
  let reversalReminderEmbedded = false;
  let youThem = `**YOU AND THEM**

`;
  const dyadCards = [youCard, themCard].filter(Boolean);
  if (youCard) {
    const youText = buildPositionCardText(
      youCard,
      youCard.position || "You / your energy",
      options
    );
    youThem += youText;
    const youReversalNote = buildInlineReversalNote(youCard, themes, {
      shouldIncludeReminder: !reversalReminderEmbedded
    });
    if (youReversalNote) {
      youThem += `

${youReversalNote.text}`;
      if (youReversalNote.includesReminder) {
        reversalReminderEmbedded = true;
      }
    }
    youThem += "\n\n";
  }
  if (themCard) {
    const themPosition = themCard.position || "Them / their energy";
    const themConnector = getConnector(themPosition, "toPrev");
    const themText = buildPositionCardText(
      themCard,
      themPosition,
      options
    );
    youThem += themConnector ? `${themConnector} ${themText}` : themText;
    const themReversalNote = buildInlineReversalNote(themCard, themes, {
      shouldIncludeReminder: !reversalReminderEmbedded
    });
    if (themReversalNote) {
      youThem += `

${themReversalNote.text}`;
      if (themReversalNote.includesReminder) {
        reversalReminderEmbedded = true;
      }
    }
  }
  const elemental = analyzeElementalDignity(youCard, themCard);
  const summaryLines = [];
  if (elemental && elemental.description) {
    summaryLines.push(`*Elemental interplay between you: ${elemental.description}.*`);
    const elementalTakeaway = buildRelationshipElementalTakeaway(elemental, youCard, themCard);
    if (elementalTakeaway) {
      summaryLines.push(elementalTakeaway);
    }
  } else {
    summaryLines.push("Together, this pairing suggests the current dynamic between you and points toward how energy is moving in this connection.");
  }
  youThem += `

${summaryLines.join(" ")}`;
  const relationshipsMeta = elemental && elemental.description ? { elementalRelationship: elemental } : void 0;
  sections.push(
    enhanceSection(youThem, {
      type: "relationship-dyad",
      cards: dyadCards,
      relationships: relationshipsMeta
    }).text
  );
  if (connectionCard) {
    let connection = `**THE CONNECTION**

`;
    connection += "This position shows what the bond is asking for right now.\n\n";
    const connectionPosition = connectionCard.position || "The connection / shared lesson";
    const connectionConnector = getConnector(connectionPosition, "toPrev");
    const connectionText = buildPositionCardText(
      connectionCard,
      connectionPosition,
      options
    );
    connection += connectionConnector ? `${connectionConnector} ${connectionText}` : connectionText;
    const connectionReversalNote = buildInlineReversalNote(connectionCard, themes, {
      shouldIncludeReminder: !reversalReminderEmbedded
    });
    if (connectionReversalNote) {
      connection += `

${connectionReversalNote.text}`;
      if (connectionReversalNote.includesReminder) {
        reversalReminderEmbedded = true;
      }
    }
    connection += "\n\nThis focus invites you to notice what this bond is asking from both of you next.";
    sections.push(
      enhanceSection(connection, {
        type: "connection",
        cards: [connectionCard]
      }).text
    );
  }
  let guidance = `**GUIDANCE FOR THIS CONNECTION**

`;
  guidance += "This guidance shows how to participate with agency, honesty, and care.\n\n";
  const guidanceCards = [];
  if (dynamicsCard) {
    const dynamicsPosition = dynamicsCard.position || "Dynamics / guidance";
    const dynamicsConnector = getConnector(dynamicsPosition, "toPrev");
    const dynamicsText = buildPositionCardText(
      dynamicsCard,
      dynamicsPosition,
      options
    );
    guidance += dynamicsConnector ? `${dynamicsConnector} ${dynamicsText}` : dynamicsText;
    const dynamicsReversalNote = buildInlineReversalNote(dynamicsCard, themes, {
      shouldIncludeReminder: !reversalReminderEmbedded
    });
    if (dynamicsReversalNote) {
      guidance += `

${dynamicsReversalNote.text}`;
      if (dynamicsReversalNote.includesReminder) {
        reversalReminderEmbedded = true;
      }
    }
    guidance += "\n\n";
    guidanceCards.push(dynamicsCard);
  }
  if (outcomeCard) {
    const outcomePosition = outcomeCard.position || "Outcome / what this can become";
    const outcomeConnector = getConnector(outcomePosition, "toPrev");
    const outcomeText = buildPositionCardText(
      outcomeCard,
      outcomePosition,
      options
    );
    guidance += outcomeConnector ? `${outcomeConnector} ${outcomeText}` : outcomeText;
    const outcomeReversalNote = buildInlineReversalNote(outcomeCard, themes, {
      shouldIncludeReminder: !reversalReminderEmbedded
    });
    if (outcomeReversalNote) {
      guidance += `

${outcomeReversalNote.text}`;
      if (outcomeReversalNote.includesReminder) {
        reversalReminderEmbedded = true;
      }
    }
    guidance += "\n\n";
    guidanceCards.push(outcomeCard);
  }
  guidance += "Emphasize what supports honest communication, mutual respect, and boundaries. Treat these insights as a mirror that informs how you choose to show up\u2014never as a command to stay or leave.";
  const guidancePrompts = guidanceCards.map((card) => buildGuidanceActionPrompt(card, themes)).filter(Boolean);
  if (guidancePrompts.length > 0) {
    guidance += ` ${guidancePrompts.join(" ")}`;
  }
  guidance += "\n\nChoose the path that best honors honesty, care, and your own boundaries\u2014the outcome still rests in the choices you both make.";
  sections.push(
    enhanceSection(guidance, {
      type: "relationship-guidance",
      cards: guidanceCards
    }).text
  );
  if (reflectionsText && reflectionsText.trim()) {
    sections.push(buildReflectionsSection(reflectionsText));
  }
  const full = sections.filter(Boolean).join("\n\n");
  const validation = validateReadingNarrative(full);
  if (!validation.isValid) {
    console.debug("Relationship narrative spine suggestions:", validation.suggestions || validation.sectionAnalyses);
  }
  if (reversalReminderEmbedded) {
    return full;
  }
  return appendReversalReminder(full, cardsInfo, themes);
}
function buildRelationshipElementalTakeaway(elemental, youCard, themCard) {
  if (!elemental || !elemental.relationship) {
    return "";
  }
  const youName = youCard?.card || "your card";
  const themName = themCard?.card || "their card";
  switch (elemental.relationship) {
    case "supportive":
      return `Lean into this cooperative current by naming what ${youName} and ${themName} each need, then offer one concrete gesture that supports both.`;
    case "tension":
      return `If friction flares between ${youName} and ${themName}, pause to acknowledge it aloud and agree on one boundary or adjustment that keeps the exchange balanced.`;
    case "amplified":
      return `Because both cards amplify the same element, channel that intensity intentionally\u2014co-create a ritual or conversation that directs this shared energy toward something constructive.`;
    default:
      return "Stay curious about how each of you is showing up today and keep checking in so the energy stays responsive, not reactive.";
  }
}
function buildOccultFlavor(cardInfo) {
  if (!cardInfo || !isMajorArcana(cardInfo.number))
    return "";
  const astro = getAstroForCard(cardInfo);
  const qabalah = getQabalahForCard(cardInfo);
  const bits = [];
  if (astro?.label) {
    const detail = astro.focus ? `, ${astro.focus}` : "";
    bits.push(`echoes ${astro.label}${detail}`);
  }
  if (qabalah?.label) {
    const detail = qabalah.focus ? `, ${qabalah.focus}` : "";
    bits.push(`touches ${qabalah.label}${detail}`);
  }
  if (!bits.length)
    return "";
  return ` On an occult level, this ${bits.join(", ")}\u2014a symbolic backdrop rather than a fixed rule.`;
}
function buildGuidanceActionPrompt(cardInfo, themes) {
  if (!cardInfo)
    return "";
  const cardName = cardInfo.card || "This card";
  const clause = extractCoreTheme(cardInfo.meaning);
  if (!clause)
    return "";
  const clauseLower = decapitalize(clause);
  const isReversed = (cardInfo.orientation || "").toLowerCase() === "reversed";
  if (isReversed) {
    const lensName = themes?.reversalDescription?.name;
    const lensPrefix = lensName ? `Within the ${lensName} lens, ` : "";
    return `${lensPrefix}${cardName} reversed asks you to notice where ${clauseLower} feels blocked and to agree on one practical step that eases the pressure.`;
  }
  return `${cardName} invites you to practice ${clauseLower} together\u2014pick one specific action or conversation that expresses it this week.`;
}
function buildInlineReversalNote(cardInfo, themes, { shouldIncludeReminder = false } = {}) {
  if (!cardInfo || (cardInfo.orientation || "").toLowerCase() !== "reversed" || !themes?.reversalDescription) {
    return null;
  }
  const clause = extractCoreTheme(cardInfo.meaning);
  const clauseLower = clause ? decapitalize(clause) : "the blocked lesson";
  const cardName = cardInfo.card || "This card";
  if (shouldIncludeReminder) {
    const lensGuidance = buildReversalGuidance(themes.reversalDescription);
    return {
      text: `*Reversal lens reminder: ${lensGuidance} For ${cardName}, focus on where ${clauseLower} needs gentle attention before momentum can return.*`,
      includesReminder: true
    };
  }
  return {
    text: `*${cardName} reversed spotlights where ${clauseLower} needs gentle attention before momentum can return.*`,
    includesReminder: false
  };
}
function extractCoreTheme(meaning) {
  if (!meaning || typeof meaning !== "string")
    return "";
  const firstClause = meaning.split(/[.;]/)[0];
  return firstClause.trim();
}
function decapitalize(text) {
  if (!text)
    return "";
  return text.charAt(0).toLowerCase() + text.slice(1);
}
function buildDecisionReading({
  cardsInfo,
  userQuestion,
  reflectionsText,
  themes,
  context
}) {
  const sections = [];
  const spreadName = "Decision / Two-Path";
  sections.push(
    buildOpening(
      spreadName,
      userQuestion || "This spread illuminates the heart of your decision, two possible paths, clarifying insight, and a reminder of your agency.",
      context
    )
  );
  const [heart, pathA, pathB, clarifier, freeWill] = Array.isArray(cardsInfo) ? cardsInfo : [];
  const options = getPositionOptions(themes, context);
  let choice = `**THE CHOICE**

`;
  choice += buildPositionCardText(
    heart,
    heart.position || "Heart of the decision",
    options
  );
  choice += "\n\nThis position stands at the center of your decision and points toward what truly matters as you weigh each path.";
  sections.push(
    enhanceSection(choice, {
      type: "decision-core",
      cards: [heart]
    }).text
  );
  let aSection = `**PATH A**

`;
  const pathAPosition = pathA.position || "Path A \u2014 energy & likely outcome";
  const pathAConnector = getConnector(pathAPosition, "toPrev");
  const pathAText = buildPositionCardText(
    pathA,
    pathAPosition,
    options
  );
  aSection += pathAConnector ? `${pathAConnector} ${pathAText}` : pathAText;
  aSection += "\n\nThis path suggests one possible trajectory if you commit to this direction.";
  sections.push(
    enhanceSection(aSection, {
      type: "decision-path",
      cards: [pathA]
    }).text
  );
  let bSection = `**PATH B**

`;
  const pathBPosition = pathB.position || "Path B \u2014 energy & likely outcome";
  const pathBConnector = getConnector(pathBPosition, "toPrev");
  const pathBText = buildPositionCardText(
    pathB,
    pathBPosition,
    options
  );
  bSection += pathBConnector ? `${pathBConnector} ${pathBText}` : pathBText;
  bSection += "\n\nThis path suggests an alternate trajectory, inviting you to compare how each route aligns with your values.";
  sections.push(
    enhanceSection(bSection, {
      type: "decision-path",
      cards: [pathB]
    }).text
  );
  let clarity = `**CLARITY + AGENCY**

`;
  if (clarifier) {
    const clarifierPosition = clarifier.position || "What clarifies the best path";
    const clarifierConnector = getConnector(clarifierPosition, "toPrev");
    const clarifierText = buildPositionCardText(
      clarifier,
      clarifierPosition,
      options
    );
    clarity += clarifierConnector ? `${clarifierConnector} ${clarifierText}` : clarifierText;
    clarity += "\n\n";
  }
  if (pathA && pathB) {
    const elemental = analyzeElementalDignity(pathA, pathB);
    if (elemental && elemental.description) {
      clarity += `Comparing the two paths: ${elemental.description}. `;
    }
  }
  if (freeWill) {
    const freeWillPosition = freeWill.position || "What to remember about your free will";
    const freeWillConnector = getConnector(freeWillPosition, "toPrev");
    const freeWillText = buildPositionCardText(
      freeWill,
      freeWillPosition,
      options
    );
    clarity += freeWillConnector ? `${freeWillConnector} ${freeWillText}` : freeWillText;
    clarity += "\n\n";
  }
  clarity += "Use these insights to understand how each option feels in your body and life. The cards illuminate possibilities; you remain the one who chooses. Each route is a trajectory shaped by your next intentional steps.";
  sections.push(
    enhanceSection(clarity, {
      type: "decision-clarity",
      cards: [clarifier, freeWill].filter(Boolean)
    }).text
  );
  if (reflectionsText && reflectionsText.trim()) {
    sections.push(buildReflectionsSection(reflectionsText));
  }
  const full = sections.filter(Boolean).join("\n\n");
  const validation = validateReadingNarrative(full);
  if (!validation.isValid) {
    console.debug("Decision narrative spine suggestions:", validation.suggestions || validation.sectionAnalyses);
  }
  return appendReversalReminder(full, cardsInfo, themes);
}
function buildSingleCardReading({
  cardsInfo,
  userQuestion,
  reflectionsText,
  themes,
  context
}) {
  if (!Array.isArray(cardsInfo) || cardsInfo.length === 0 || !cardsInfo[0]) {
    return "**ONE-CARD INSIGHT**\n\nNo card data was provided. Please draw at least one card to receive a focused message.";
  }
  const card = cardsInfo[0];
  const options = getPositionOptions(themes, context);
  let narrative = `**ONE-CARD INSIGHT**

`;
  if (userQuestion && userQuestion.trim()) {
    narrative += `Focusing on your question "${userQuestion.trim()}", this card offers a snapshot of guidance in this moment.

`;
  } else {
    narrative += "This single card offers a focused snapshot of the energy around you right now.\n\n";
  }
  const contextReminder = buildContextReminder(context);
  if (contextReminder) {
    narrative += `${contextReminder}

`;
  }
  const positionLabel = card.position || "Theme / Guidance of the Moment";
  const baseText = buildPositionCardText(card, positionLabel, options);
  narrative += `${baseText}

`;
  narrative += "In simple terms: notice what this theme is asking you to acknowledge (WHAT), reflect on why it might be surfacing now (WHY), and choose one small, aligned next step that honors your agency (WHAT'S NEXT). Therefore, treat this insight as a living moment, not a fixed verdict\u2014a trajectory you actively shape.";
  if (reflectionsText && reflectionsText.trim()) {
    narrative += `

**Your Reflections**

${reflectionsText.trim()}`;
  }
  const validation = validateReadingNarrative(narrative);
  if (!validation.isValid) {
    console.debug("Single-card narrative spine suggestions:", validation.suggestions || validation.sectionAnalyses);
  }
  return appendReversalReminder(narrative, cardsInfo, themes);
}
function buildThreeCardReading({
  cardsInfo,
  userQuestion,
  reflectionsText,
  threeCardAnalysis,
  themes,
  context
}) {
  const sections = [];
  sections.push(buildOpening("Three-Card Story (Past \xB7 Present \xB7 Future)", userQuestion, context));
  const [past, present, future] = cardsInfo;
  const options = getPositionOptions(themes, context);
  let narrative = `**THE STORY**

`;
  narrative += `${buildPositionCardText(past, past.position || "Past \u2014 influences that led here", options)}

`;
  const firstToSecond = threeCardAnalysis?.transitions?.firstToSecond;
  const presentConnector = getConnector("Present \u2014 where you stand now", "toPrev");
  narrative += `${presentConnector} ${buildPositionCardText(present, present.position || "Present \u2014 where you stand now", {
    ...options,
    prevElementalRelationship: firstToSecond
  })}

`;
  const secondToThird = threeCardAnalysis?.transitions?.secondToThird;
  const futureConnector = getConnector("Future \u2014 trajectory if nothing shifts", "toPrev");
  narrative += `${futureConnector} ${buildPositionCardText(future, future.position || "Future \u2014 trajectory if nothing shifts", {
    ...options,
    prevElementalRelationship: secondToThird
  })}

`;
  if (threeCardAnalysis && threeCardAnalysis.narrative) {
    narrative += threeCardAnalysis.narrative;
  }
  sections.push(narrative);
  if (reflectionsText && reflectionsText.trim()) {
    sections.push(buildReflectionsSection(reflectionsText));
  }
  sections.push(buildThreeCardSynthesis(cardsInfo, themes, userQuestion, context));
  const full = sections.filter(Boolean).join("\n\n");
  return appendReversalReminder(full, cardsInfo, themes);
}
function buildThreeCardSynthesis(cardsInfo, themes, userQuestion, context) {
  let section = `**GUIDANCE**

`;
  if (context && context !== "general") {
    section += `Focus: Interpreting the path ahead through ${getContextDescriptor(context)}.

`;
  }
  if (themes.suitFocus) {
    section += `${themes.suitFocus}

`;
  }
  if (themes.timingProfile === "near-term-tilt") {
    section += `Pace: Signals here lean toward shifts in the nearer term, provided you participate with them.

`;
  } else if (themes.timingProfile === "longer-arc-tilt") {
    section += `Pace: This story speaks to a longer process that asks patience and steady engagement.

`;
  } else if (themes.timingProfile === "developing-arc") {
    section += `Pace: Expect this to unfold across a meaningful chapter rather than in a single moment.

`;
  }
  const future = cardsInfo[2];
  section += `The path ahead shows ${future.card} ${future.orientation}.`;
  if ((future.orientation || "").toLowerCase() === "reversed" && themes?.reversalDescription) {
    section += ` ${buildReversalGuidance(themes.reversalDescription)}`;
  }
  section += ` This is not fixed fate, but the trajectory of current momentum. Your awareness and choices shape what comes next.`;
  section += "\n\nAltogether, these threads suggest your next supportive step and point toward how to walk this path with agency.";
  return section;
}
function buildEnhancedClaudePrompt({
  spreadInfo,
  cardsInfo,
  userQuestion,
  reflectionsText,
  themes,
  spreadAnalysis,
  context
}) {
  const spreadKey = getSpreadKeyFromName(spreadInfo.name);
  const normalizedContext = normalizeContext(context);
  const systemPrompt = buildSystemPrompt(spreadKey, themes, normalizedContext);
  const userPrompt = buildUserPrompt(
    spreadKey,
    cardsInfo,
    userQuestion,
    reflectionsText,
    themes,
    spreadAnalysis,
    normalizedContext
  );
  return { systemPrompt, userPrompt };
}
function getSpreadKeyFromName(name) {
  const map = {
    "Celtic Cross (Classic 10-Card)": "celtic",
    "Three-Card Story (Past \xB7 Present \xB7 Future)": "threeCard",
    "Five-Card Clarity": "fiveCard",
    "One-Card Insight": "single",
    "Relationship Snapshot": "relationship",
    "Decision / Two-Path": "decision"
  };
  return map[name] || "general";
}
function buildSystemPrompt(spreadKey, themes, context) {
  const lines = [
    "You are an agency-forward professional tarot storyteller.",
    "",
    "NARRATIVE GUIDELINES:",
    '- Story spine every section (WHAT \u2192 WHY \u2192 WHAT\u2019S NEXT) using connectors like "Because...", "Therefore...", "However...".',
    "- Cite card names, positions, and elemental dignities; add concise sensory imagery (especially for Major Arcana) to illustrate meaning.",
    "- You may weave in standard astrological or Qabalah correspondences as gentle color only when they naturally support the card\u2019s core Rider\u2013Waite\u2013Smith meaning.",
    `- Honor the ${themes.reversalDescription.name} reversal lens and Minor suit/rank rules; never invent cards or outcomes.`,
    "- Keep the tone trauma-informed, empowering, and non-deterministic.",
    "- Do NOT provide medical, mental health, legal, financial, or abuse-safety directives; when such topics arise, gently encourage seeking qualified professional support.",
    "- Make clear that outcome and timing cards describe likely trajectories based on current patterns, not fixed fate or guarantees.",
    "- Deliver 4-6 flowing paragraphs separated by blank lines."
  ];
  if (spreadKey === "celtic") {
    lines.push(
      "",
      "CELTIC CROSS FLOW: Nucleus (1-2) \u2192 Timeline (3-1-4) \u2192 Consciousness (6-1-5) \u2192 Staff (7-10) \u2192 Cross-checks \u2192 Synthesis. Bridge each segment with the connectors above."
    );
  } else if (spreadKey === "threeCard") {
    lines.push(
      "",
      "THREE-CARD FLOW: Past \u2192 Present \u2192 Future. Show how each card leads to the next and note elemental support or tension along the way."
    );
  }
  lines.push(
    "",
    `REVERSAL LENS: ${themes.reversalDescription.name} \u2014 ${themes.reversalDescription.description} (${themes.reversalDescription.guidance})`,
    "ETHICS: Emphasize choice, agency, and trajectory language; forbid deterministic guarantees or fatalism.",
    "ETHICS: Do NOT provide diagnosis or treatment, or directives about medical, mental health, legal, financial, or abuse-safety matters; instead, when those themes surface, gently suggest consulting qualified professionals or trusted support resources."
  );
  if (context && context !== "general") {
    lines.push(
      "",
      `CONTEXT LENS: Frame insights through ${getContextDescriptor(context)} so guidance stays relevant to that arena.`
    );
  }
  return lines.join("\n");
}
function buildUserPrompt(spreadKey, cardsInfo, userQuestion, reflectionsText, themes, spreadAnalysis, context) {
  let prompt = ``;
  prompt += `**Question**: ${userQuestion || "(No explicit question; speak to the energy most present for the querent.)"}

`;
  const thematicLines = [];
  if (context && context !== "general") {
    thematicLines.push(`- Context lens: Focus the narrative through ${getContextDescriptor(context)}`);
  }
  if (themes.suitFocus)
    thematicLines.push(`- ${themes.suitFocus}`);
  if (themes.archetypeDescription)
    thematicLines.push(`- ${themes.archetypeDescription}`);
  if (themes.elementalBalance)
    thematicLines.push(`- ${themes.elementalBalance}`);
  thematicLines.push(`- Reversal framework: ${themes.reversalDescription.name}`);
  prompt += `**Thematic Context**:
${thematicLines.join("\n")}

`;
  if (spreadKey === "celtic" && spreadAnalysis) {
    prompt += buildCelticCrossPromptCards(cardsInfo, spreadAnalysis, themes, context);
  } else if (spreadKey === "threeCard" && spreadAnalysis) {
    prompt += buildThreeCardPromptCards(cardsInfo, spreadAnalysis, themes, context);
  } else if (spreadKey === "fiveCard" && spreadAnalysis) {
    prompt += buildFiveCardPromptCards(cardsInfo, spreadAnalysis, themes, context);
  } else if (spreadKey === "relationship") {
    prompt += buildRelationshipPromptCards(cardsInfo, themes, context);
  } else if (spreadKey === "decision") {
    prompt += buildDecisionPromptCards(cardsInfo, themes, context);
  } else if (spreadKey === "single") {
    prompt += buildSingleCardPrompt(cardsInfo, themes, context);
  } else {
    prompt += buildStandardPromptCards(cardsInfo, themes, context);
  }
  if (reflectionsText && reflectionsText.trim()) {
    prompt += `
**Querent's Reflections**:
${reflectionsText.trim()}

`;
  }
  prompt += `
Provide a cohesive, flowing narrative (no bullet lists) that:
- References specific cards and positions
- Integrates the thematic and elemental insights above
- Offers practical, grounded, empowering guidance
- Reminds the querent of their agency and free will
Apply Minor Arcana interpretation rules to all non-Major cards.`;
  prompt += `

Remember ethical constraints: emphasize agency, avoid guarantees, no medical/legal directives.`;
  return prompt;
}
function buildCelticCrossPromptCards(cardsInfo, analysis, themes, context) {
  const options = getPositionOptions(themes, context);
  let cards = `**NUCLEUS** (Heart of the Matter):
`;
  cards += buildCardWithImagery(cardsInfo[0], cardsInfo[0].position || "Present \u2014 core situation (Card 1)", options);
  cards += buildCardWithImagery(cardsInfo[1], cardsInfo[1].position || "Challenge \u2014 crossing / tension (Card 2)", options);
  cards += `Relationship insight: ${analysis.nucleus.synthesis}
`;
  cards += getElementalImageryText(analysis.nucleus.elementalDynamic) + "\n\n";
  cards += `**TIMELINE**:
`;
  cards += buildCardWithImagery(cardsInfo[2], cardsInfo[2].position || "Past \u2014 what lies behind (Card 3)", options);
  const presentPosition = cardsInfo[0].position || "Present \u2014 core situation (Card 1)";
  cards += buildCardWithImagery(
    cardsInfo[0],
    presentPosition,
    {
      ...options,
      prevElementalRelationship: analysis.timeline.pastToPresent
    },
    getConnector(presentPosition, "toPrev")
  );
  const futurePosition = cardsInfo[3].position || "Near Future \u2014 what lies before (Card 4)";
  cards += buildCardWithImagery(
    cardsInfo[3],
    futurePosition,
    {
      ...options,
      prevElementalRelationship: analysis.timeline.presentToFuture
    },
    getConnector(futurePosition, "toPrev")
  );
  cards += `Flow insight: ${analysis.timeline.causality}
`;
  cards += getElementalImageryText(analysis.timeline.pastToPresent) + "\n";
  cards += getElementalImageryText(analysis.timeline.presentToFuture) + "\n\n";
  cards += `**CONSCIOUSNESS**:
`;
  cards += buildCardWithImagery(cardsInfo[5], cardsInfo[5].position || "Subconscious \u2014 roots / hidden forces (Card 6)", options);
  cards += buildCardWithImagery(cardsInfo[4], cardsInfo[4].position || "Conscious \u2014 goals & focus (Card 5)", options);
  cards += `Alignment insight: ${analysis.consciousness.synthesis}
`;
  cards += getElementalImageryText(analysis.consciousness.elementalRelationship) + "\n\n";
  cards += `**STAFF** (Context & Outcome):
`;
  cards += buildCardWithImagery(cardsInfo[6], cardsInfo[6].position || "Self / Advice \u2014 how to meet this (Card 7)", options);
  cards += buildCardWithImagery(cardsInfo[7], cardsInfo[7].position || "External Influences \u2014 people & environment (Card 8)", options);
  cards += buildCardWithImagery(cardsInfo[8], cardsInfo[8].position || "Hopes & Fears \u2014 deepest wishes & worries (Card 9)", options);
  cards += buildCardWithImagery(cardsInfo[9], cardsInfo[9].position || "Outcome \u2014 likely path if unchanged (Card 10)", options);
  cards += `Advice-to-outcome insight: ${analysis.staff.adviceImpact}
`;
  cards += getElementalImageryText(analysis.staff.adviceToOutcome) + "\n\n";
  cards += `**KEY CROSS-CHECKS**:
`;
  cards += buildPromptCrossChecks(analysis.crossChecks, themes);
  return cards;
}
function buildThreeCardPromptCards(cardsInfo, analysis, themes, context) {
  const options = getPositionOptions(themes, context);
  const [past, present, future] = cardsInfo;
  let cards = `**THREE-CARD STORY STRUCTURE**
`;
  cards += `- Past foundation
- Present dynamics
- Future trajectory if nothing shifts

`;
  cards += buildCardWithImagery(
    past,
    past.position || "Past \u2014 influences that led here",
    options
  );
  const presentPosition = present.position || "Present \u2014 where you stand now";
  cards += buildCardWithImagery(
    present,
    presentPosition,
    {
      ...options,
      prevElementalRelationship: analysis?.transitions?.firstToSecond
    },
    getConnector(presentPosition, "toPrev")
  );
  const futurePosition = future.position || "Future \u2014 trajectory if nothing shifts";
  cards += buildCardWithImagery(
    future,
    futurePosition,
    {
      ...options,
      prevElementalRelationship: analysis?.transitions?.secondToThird
    },
    getConnector(futurePosition, "toPrev")
  );
  if (analysis?.narrative) {
    cards += `
${analysis.narrative.trim()}
`;
  }
  cards += "\nThis future position points toward the most likely trajectory if nothing shifts, inviting you to adjust your path with intention.";
  return cards;
}
function buildCardWithImagery(cardInfo, position, options, prefix = "") {
  const base = buildPositionCardText(cardInfo, position, options);
  const lead = prefix ? `${prefix} ${base}` : base;
  let text = `${lead}
`;
  if (isMajorArcana(cardInfo.number)) {
    const hook = getImageryHook(cardInfo.number, cardInfo.orientation);
    if (hook) {
      text += `*Imagery: ${hook.visual}*
`;
      text += `*Sensory: ${hook.sensory}*
`;
    }
  }
  return text;
}
function getElementalImageryText(elementalRelationship) {
  if (!elementalRelationship || !elementalRelationship.elements) {
    return "";
  }
  const [e1, e2] = elementalRelationship.elements;
  const imagery = getElementalImagery(e1, e2);
  if (imagery && imagery.imagery) {
    return `*Elemental imagery: ${imagery.imagery}*`;
  }
  return "";
}
function buildFiveCardPromptCards(cardsInfo, fiveCardAnalysis, themes, context) {
  const options = getPositionOptions(themes, context);
  const [core, challenge, hidden, support, direction] = cardsInfo;
  let out = `**FIVE-CARD CLARITY STRUCTURE**
`;
  out += `- Core of the matter
- Challenge or tension
- Hidden / subconscious influence
- Support / helpful energy
- Likely direction on current path

`;
  out += buildCardWithImagery(core, core.position || "Core of the matter", options);
  out += buildCardWithImagery(challenge, challenge.position || "Challenge or tension", {
    ...options,
    prevElementalRelationship: fiveCardAnalysis?.coreVsChallenge
  });
  out += buildCardWithImagery(hidden, hidden.position || "Hidden / subconscious influence", options);
  out += buildCardWithImagery(support, support.position || "Support / helpful energy", options);
  out += buildCardWithImagery(direction, direction.position || "Likely direction on current path", {
    ...options,
    prevElementalRelationship: fiveCardAnalysis?.supportVsDirection
  });
  return out;
}
function buildRelationshipPromptCards(cardsInfo, themes, context) {
  const options = getPositionOptions(themes, context);
  const [youCard, themCard, connectionCard, dynamicsCard, outcomeCard] = cardsInfo;
  let out = `**RELATIONSHIP SNAPSHOT STRUCTURE**
`;
  out += `- You / your energy
- Them / their energy
- The connection / shared lesson
- Dynamics / guidance
- Outcome / what this can become

`;
  if (youCard) {
    out += buildCardWithImagery(youCard, youCard.position || "You / your energy", options);
  }
  if (themCard) {
    out += buildCardWithImagery(themCard, themCard.position || "Them / their energy", options);
  }
  if (connectionCard) {
    out += buildCardWithImagery(
      connectionCard,
      connectionCard.position || "The connection / shared lesson",
      options
    );
  }
  if (dynamicsCard) {
    out += buildCardWithImagery(
      dynamicsCard,
      dynamicsCard.position || "Dynamics / guidance",
      options
    );
  }
  if (outcomeCard) {
    out += buildCardWithImagery(
      outcomeCard,
      outcomeCard.position || "Outcome / what this can become",
      options
    );
  }
  return out;
}
function buildDecisionPromptCards(cardsInfo, themes, context) {
  const options = getPositionOptions(themes, context);
  const [heart, pathA, pathB, clarifier, freeWill] = cardsInfo;
  let out = `**DECISION / TWO-PATH STRUCTURE**
`;
  out += `- Heart of the decision
- Path A \u2014 energy & likely outcome
- Path B \u2014 energy & likely outcome
- What clarifies the best path
- What to remember about your free will

`;
  if (heart) {
    out += buildCardWithImagery(
      heart,
      heart.position || "Heart of the decision",
      options
    );
  }
  if (pathA) {
    out += buildCardWithImagery(
      pathA,
      pathA.position || "Path A \u2014 energy & likely outcome",
      options
    );
  }
  if (pathB) {
    out += buildCardWithImagery(
      pathB,
      pathB.position || "Path B \u2014 energy & likely outcome",
      options
    );
  }
  if (clarifier) {
    out += buildCardWithImagery(
      clarifier,
      clarifier.position || "What clarifies the best path",
      options
    );
  }
  if (freeWill) {
    out += buildCardWithImagery(
      freeWill,
      freeWill.position || "What to remember about your free will",
      options
    );
  }
  return out;
}
function buildSingleCardPrompt(cardsInfo, themes, context) {
  const options = getPositionOptions(themes, context);
  const card = cardsInfo[0];
  if (!card)
    return "";
  let out = `**ONE-CARD INSIGHT STRUCTURE**
`;
  out += `- Theme / Guidance of the Moment

`;
  out += buildCardWithImagery(
    card,
    card.position || "Theme / Guidance of the Moment",
    options
  );
  return out;
}
function buildStandardPromptCards(cardsInfo, themes, context) {
  const options = getPositionOptions(themes, context);
  return cardsInfo.map((card, idx) => {
    const position = card.position || `Card ${idx + 1}`;
    return buildCardWithImagery(card, position, options);
  }).join("\n") + "\n";
}
function buildPromptCrossChecks(crossChecks, themes) {
  const entries = [
    ["Goal vs Outcome", crossChecks.goalVsOutcome],
    ["Advice vs Outcome", crossChecks.adviceVsOutcome],
    ["Near Future vs Outcome", crossChecks.nearFutureVsOutcome],
    ["Subconscious vs Hopes/Fears", crossChecks.subconsciousVsHopesFears]
  ];
  return entries.map(([label, value]) => {
    if (!value) {
      return `- ${label}: No comparative insight available.`;
    }
    const shortenMeaning = /* @__PURE__ */ __name((meaning) => {
      if (!meaning || typeof meaning !== "string")
        return "";
      const firstClause = meaning.split(/[.!?]/)[0].trim();
      if (!firstClause)
        return "";
      return firstClause.length > 90 ? `${firstClause.slice(0, 87)}...` : firstClause;
    }, "shortenMeaning");
    const summarizePosition = /* @__PURE__ */ __name((position) => {
      if (!position)
        return null;
      const base = `${position.name}: ${position.card} ${position.orientation}`.trim();
      const snippet = shortenMeaning(position.meaning);
      return snippet ? `${base} \u2014 ${snippet}` : base;
    }, "summarizePosition");
    const reversalNotes = [
      getCrossCheckReversalNote(value.position1, themes),
      getCrossCheckReversalNote(value.position2, themes)
    ].filter(Boolean);
    const details = [];
    if (value.elementalRelationship?.relationship === "tension") {
      details.push("\u26A0\uFE0F Elemental tension present.");
    } else if (value.elementalRelationship?.relationship === "supportive") {
      details.push("\u2713 Elemental harmony present.");
    } else if (value.elementalRelationship?.relationship === "amplified") {
      details.push("Elemental energies amplified.");
    }
    if (reversalNotes.length > 0) {
      details.push(reversalNotes.join(" "));
    }
    const positionsText = [summarizePosition(value.position1), summarizePosition(value.position2)].filter(Boolean).join(" | ");
    const parts = [`- ${label}: ${value.synthesis.trim()}`];
    if (positionsText) {
      parts.push(`(Positions: ${positionsText})`);
    }
    if (details.length > 0) {
      parts.push(details.join(" "));
    }
    return parts.join(" ");
  }).join("\n");
}
var CONTEXT_DESCRIPTORS, SUIT_CONTEXT_LENSES, MAJOR_CONTEXT_LENSES, CARD_SPECIFIC_CONTEXT, MINOR_SUITS, POSITION_LANGUAGE;
var init_narrativeBuilder = __esm({
  "lib/narrativeBuilder.js"() {
    init_functionsRoutes_0_2857290313673917();
    init_imageryHooks();
    init_minorMeta();
    init_narrativeSpine();
    init_spreadAnalysis();
    init_esotericMeta();
    CONTEXT_DESCRIPTORS = {
      love: "relationships and heart-centered experiences",
      career: "career, calling, and material pathways",
      self: "personal growth and inner landscape",
      spiritual: "spiritual practice and meaning-making",
      general: "overall life path"
    };
    SUIT_CONTEXT_LENSES = {
      love: {
        Wands: "In relationships, this encourages shared passion and momentum you cultivate together.",
        Cups: "In relationships, this highlights emotional reciprocity, listening, and care.",
        Swords: "In relationships, this invites honest dialogue, clear boundaries, and thoughtful communication.",
        Pentacles: "In relationships, this focuses on steady support, daily rituals, and building something lasting."
      },
      career: {
        Wands: "In your career, this points to initiative, leadership, and courageous momentum.",
        Cups: "In your career, this speaks to collaborative rapport, emotional intelligence, and people care.",
        Swords: "In your career, this stresses strategy, communication, and decisive clarity.",
        Pentacles: "In your career, this underscores planning, resources, and tangible results."
      },
      self: {
        Wands: "For personal growth, this asks you to kindle motivation and follow what energizes you.",
        Cups: "For personal growth, this centers emotional processing, self-compassion, and heart work.",
        Swords: "For personal growth, this supports mental clarity, journaling, and reframing stories.",
        Pentacles: "For personal growth, this recommends embodiment, somatic practice, and grounding routines."
      },
      spiritual: {
        Wands: "In your spiritual practice, this channels devotional fire and inspired action.",
        Cups: "In your spiritual practice, this deepens receptive listening and intuitive flow.",
        Swords: "In your spiritual practice, this sharpens discernment, study, and sacred speech.",
        Pentacles: "In your spiritual practice, this roots insight into ritual, service, and stewardship."
      }
    };
    MAJOR_CONTEXT_LENSES = {
      love: "In relationships, let this archetype illuminate the dynamics asking for attention.",
      career: "In your career, treat this archetype as guidance for how you show up in your work and collaborations.",
      self: "For personal growth, let this archetype mirror the inner work unfolding.",
      spiritual: "In your spiritual path, let this archetype frame the lesson seeking integration."
    };
    CARD_SPECIFIC_CONTEXT = {
      love: {
        "two of cups": "In relationships, this affirms mutual devotion, attentive listening, and balanced give-and-take.",
        "three of pentacles": "In relationships, this often looks like co-creating plans and valuing each person\u2019s contribution.",
        "ten of pentacles": "In relationships, this reflects building a lasting sense of home, legacy, and shared support.",
        "the hermit": "In relationships, this can signal honoring sacred space so deeper connection can emerge.",
        "the tower": "In relationships, this may surface ruptures that ultimately clear the way for honest connection."
      },
      career: {
        "two of cups": "In your career, this can indicate a supportive partnership, aligned collaborator, or trusted client bond.",
        "three of pentacles": "In your career, this emphasizes teamwork, craftsmanship, and being recognized for your expertise.",
        "ten of pentacles": "In your career, this points to long-term stability, succession planning, and sustainable prosperity.",
        "the hermit": "In your career, this invites strategic retreat to refine mastery before reengaging.",
        "the tower": "In your career, this flags sudden change that ultimately clears space for a truer trajectory."
      },
      self: {
        "three of swords": "For personal growth, this encourages tending to the wound with compassion, integration, and honest acknowledgement.",
        "nine of swords": "For personal growth, this highlights working with anxious narratives through grounding practices and support.",
        "the hermit": "For personal growth, this supports contemplative solitude and inner listening.",
        "wheel of fortune": "For personal growth, this reminds you to trust cycles and notice what is shifting within."
      },
      spiritual: {
        "the hermit": "In your spiritual path, this deepens the call toward contemplative retreat, sacred study, and inner guidance.",
        "wheel of fortune": "In your spiritual path, this points to trusting the greater pattern and aligning with the turning of time.",
        "temperance": "In your spiritual path, this celebrates alchemy, ritual balance, and embodied integration."
      }
    };
    MINOR_SUITS = ["Wands", "Cups", "Swords", "Pentacles"];
    __name(pickOne, "pickOne");
    __name(normalizeContext, "normalizeContext");
    __name(getContextDescriptor, "getContextDescriptor");
    __name(resolveSuitForContext, "resolveSuitForContext");
    __name(buildContextualClause, "buildContextualClause");
    __name(buildContextReminder, "buildContextReminder");
    POSITION_LANGUAGE = {
      // Celtic Cross positions
      "Present \u2014 core situation (Card 1)": {
        intro: [
          (card, orientation) => `At the heart of this moment stands ${card} ${orientation}.`,
          (card, orientation) => `Right now, your story is colored by ${card} ${orientation}.`,
          (card, orientation) => `The core tone of this moment comes through ${card} ${orientation}.`
        ],
        frame: [
          "This card sketches the atmosphere you\u2019re moving through right now.",
          "It points to what feels most alive, charged, or pressing in your experience.",
          "Treat this as a snapshot of how things feel from the inside out."
        ],
        connectorToPrev: ["Because of this foundation,", "Because of what has led you here,"],
        useImagery: true
      },
      "Challenge \u2014 crossing / tension (Card 2)": {
        intro: [
          (card, orientation) => `Crossing this, the challenge manifests as ${card} ${orientation}.`,
          (card, orientation) => `In tension with that, ${card} ${orientation} shows where things snag.`,
          (card, orientation) => `${card} ${orientation} highlights the knot in the story\u2014the part that feels tight or testing.`
        ],
        frame: [
          "This points to the friction, obstacle, or dynamic that asks for integration.",
          "Here we see where effort, honesty, or adjustment may be needed.",
          "Treat this not as doom, but as the leverage point where change is possible."
        ],
        connectorToPrev: ["However,", "However, at the same time,", "However, in contrast,"],
        useImagery: true
      },
      "Past \u2014 what lies behind (Card 3)": {
        intro: [
          (card, orientation) => `Looking to what lies behind, the past shows ${card} ${orientation}.`,
          (card, orientation) => `In the background, ${card} ${orientation} colors how you arrived here.`,
          (card, orientation) => `The roots of this story reach back to ${card} ${orientation}.`
        ],
        frame: [
          "This surfaces the experiences and patterns that set the stage for now.",
          "It names what you\u2019re carrying forward, consciously or not.",
          "Noticing this past context helps you choose what to keep and what to release."
        ],
        connectorToNext: ["Because of this,", "Because of this history,", "Because of this groundwork,"],
        useImagery: true
      },
      "Near Future \u2014 what lies before (Card 4)": {
        intro: [
          (card, orientation) => `What lies ahead in the near future: ${card} ${orientation}.`,
          (card, orientation) => `As the next chapter, ${card} ${orientation} comes into view.`,
          (card, orientation) => `Soon, the story leans into ${card} ${orientation}.`
        ],
        frame: [
          "This hints at near-term developments on your current trajectory, not a final verdict.",
          "See this as the next visible step if nothing major shifts.",
          "It sketches the emerging tone of what you\u2019re stepping into."
        ],
        connectorToPrev: ["Therefore,", "Therefore, looking ahead,", "Therefore, as this unfolds,"],
        useImagery: true
      },
      "Conscious \u2014 goals & focus (Card 5)": {
        intro: [
          (card, orientation) => `Your conscious goal, what you aspire toward: ${card} ${orientation}.`,
          (card, orientation) => `${card} ${orientation} speaks to what you know you\u2019re reaching for.`,
          (card, orientation) => `In your conscious mind, ${card} ${orientation} names your current aims.`
        ],
        frame: [
          "This reflects the intentions you can already name and the outcomes you\u2019re trying to move toward.",
          "It shows where your focus naturally goes when you think about this situation.",
          "Let it clarify what \u201Cdoing well\u201D here genuinely means to you."
        ],
        useImagery: true
      },
      "Subconscious \u2014 roots / hidden forces (Card 6)": {
        intro: [
          (card, orientation) => `Hidden beneath awareness, in the subconscious realm: ${card} ${orientation}.`,
          (card, orientation) => `Below the surface, ${card} ${orientation} stirs quietly.`,
          (card, orientation) => `In the deeper layers, ${card} ${orientation} speaks to what\u2019s moving you from within.`
        ],
        frame: [
          "This points to needs, fears, or loyalties that operate behind your conscious choices.",
          "Understanding this layer helps you respond with more self-compassion.",
          "Treat this as gentle intel about your inner landscape, not a judgment."
        ],
        connectorToNext: ["Yet beneath the surface,", "Yet beneath the surface, it all gathers,"],
        useImagery: true
      },
      "Self / Advice \u2014 how to meet this (Card 7)": {
        intro: [
          (card, orientation) => `Guidance on how to meet this situation comes through ${card} ${orientation}.`,
          (card, orientation) => `${card} ${orientation} offers a way you might show up for yourself here.`,
          (card, orientation) => `As counsel, ${card} ${orientation} sketches a stance that could support you.`
        ],
        frame: [
          "This suggests practical attitudes or small actions that are available to you.",
          "It highlights resources, boundaries, or habits that can anchor you.",
          "Take it as an invitation, not a command: notice what feels workable."
        ],
        connectorToPrev: ["Therefore, to navigate this landscape,", "Because of all of this,"],
        useImagery: true
      },
      "External Influences \u2014 people & environment (Card 8)": {
        intro: [
          (card, orientation) => `External influences, people and forces beyond your control: ${card} ${orientation}.`,
          (card, orientation) => `Around you, ${card} ${orientation} reflects other people and conditions in play.`,
          (card, orientation) => `In the wider field, ${card} ${orientation} points to what\u2019s happening around you rather than inside you.`
        ],
        frame: [
          "This shows dynamics you can respond to, but not fully control.",
          "It\u2019s a reminder to distinguish between your work and what belongs to others.",
          "Let this help you choose where to engage and where to release."
        ],
        connectorToPrev: ["Meanwhile, in the external world,", "Meanwhile, around you,"],
        useImagery: true
      },
      "Hopes & Fears \u2014 deepest wishes & worries (Card 9)": {
        intro: [
          (card, orientation) => `Your hopes and fears intertwine in ${card} ${orientation}.`,
          (card, orientation) => `${card} ${orientation} sits where desire and worry overlap.`,
          (card, orientation) => `This position, held by ${card} ${orientation}, tracks what you long for and what you guard against.`
        ],
        frame: [
          "It often names ambivalence\u2014wanting something and fearing its cost at the same time.",
          "Let this clarify what your heart is truly asking for beneath the anxiety.",
          "Being honest here can soften inner pressure and inform kinder choices."
        ],
        connectorToPrev: ["Meanwhile, emotionally,", "And so, on an emotional level,"],
        useImagery: true
      },
      "Outcome \u2014 likely path if unchanged (Card 10)": {
        intro: [
          (card, orientation) => `The likely outcome, if the current path continues: ${card} ${orientation}.`,
          (card, orientation) => `If nothing major shifts, ${card} ${orientation} sketches where this could be heading.`,
          (card, orientation) => `As things stand, ${card} ${orientation} maps a plausible direction of travel.`
        ],
        frame: [
          "This is a trajectory based on current patterns, not a fixed fate.",
          "Use it as feedback about where your present choices may lead.",
          "If you don\u2019t love this picture, that awareness is an invitation to course-correct."
        ],
        connectorToPrev: ["Therefore, all of this converges toward", "Therefore, taken together, this leans toward"],
        useImagery: true
      },
      // Three-Card positions
      "Past \u2014 influences that led here": {
        intro: [
          (card, orientation) => `The past, showing what has led to this moment: ${card} ${orientation}.`,
          (card, orientation) => `Behind you, ${card} ${orientation} outlines the experiences that fed into this chapter.`,
          (card, orientation) => `Looking back, ${card} ${orientation} traces the threads that shaped the current landscape.`
        ],
        frame: [
          "This represents the foundation, causes, and influences that set the stage for where you stand now.",
          "Noticing this helps you decide what you\u2019re done carrying and what still serves."
        ],
        connectorToNext: ["Because of this foundation,", "Because of this backdrop,"],
        useImagery: true
      },
      "Present \u2014 where you stand now": {
        intro: [
          (card, orientation) => `The present moment, where you stand right now: ${card} ${orientation}.`,
          (card, orientation) => `Right now, ${card} ${orientation} mirrors the live dynamics you\u2019re moving through.`,
          (card, orientation) => `In this moment, ${card} ${orientation} captures the tone of your experience.`
        ],
        frame: [
          "This is the current energy and active dynamic you are navigating.",
          "Treat it as a snapshot, not a sentence\u2014a view of what\u2019s here so you can choose how to meet it."
        ],
        connectorToPrev: ["And so,", "And so, from here,"],
        connectorToNext: ["This sets the stage for", "This sets the stage for the path leaning toward"],
        useImagery: true
      },
      "Future \u2014 trajectory if nothing shifts": {
        intro: [
          (card, orientation) => `The future, the trajectory ahead: ${card} ${orientation}.`,
          (card, orientation) => `If nothing major shifts, ${card} ${orientation} suggests where this might be heading.`,
          (card, orientation) => `Looking ahead, ${card} ${orientation} outlines a likely path of momentum.`
        ],
        frame: [
          "This shows where things are tending if you maintain your current course.",
          "Hold it as a forecast of trajectory, always adjustable through your choices."
        ],
        connectorToPrev: ["Therefore,", "Therefore, on this trajectory,"],
        useImagery: true
      },
      // Five-Card positions
      "Core of the matter": {
        intro: [
          (card, orientation) => `At the core of the matter: ${card} ${orientation}.`,
          (card, orientation) => `${card} ${orientation} sits at the center of this situation.`,
          (card, orientation) => `Here, ${card} ${orientation} names the heart of what you\u2019re really exploring.`
        ],
        frame: [
          "This is the central issue\u2014the thread that, if tended to, shifts the whole pattern.",
          "Let it help you focus on what truly matters beneath surface details."
        ],
        useImagery: true
      },
      "Challenge or tension": {
        intro: [
          (card, orientation) => `The challenge or tension: ${card} ${orientation}.`,
          (card, orientation) => `Here, ${card} ${orientation} shows where things snag or feel demanding.`,
          (card, orientation) => `${card} ${orientation} highlights the friction that wants attention.`
        ],
        frame: [
          "This marks the obstacle or knot to work with\u2014not a verdict, but an invitation to adjust.",
          "Naming this tension can make it more workable."
        ],
        connectorToPrev: ["However,", "However, in contrast,"],
        useImagery: true
      },
      "Hidden / subconscious influence": {
        intro: [
          (card, orientation) => `Hidden from view, the subconscious influence: ${card} ${orientation}.`,
          (card, orientation) => `Beneath the surface, ${card} ${orientation} moves quietly.`,
          (card, orientation) => `In the unseen layers, ${card} ${orientation} signals stories or needs that aren\u2019t fully voiced.`
        ],
        frame: [
          "This reveals influences beneath awareness\u2014unspoken fears, hopes, or loyalties.",
          "Seeing this gives you more compassionate context for your reactions."
        ],
        connectorToPrev: ["Yet beneath the surface,", "Yet beneath the surface, quietly,"],
        useImagery: true
      },
      "Support / helpful energy": {
        intro: [
          (card, orientation) => `Support and helpful energy come through: ${card} ${orientation}.`,
          (card, orientation) => `Here, ${card} ${orientation} shows what has your back.`,
          (card, orientation) => `${card} ${orientation} highlights resources, allies, or inner strengths available now.`
        ],
        frame: [
          "This is what you can lean on as you navigate the situation.",
          "Let this remind you that you are not moving through this empty-handed."
        ],
        connectorToPrev: ["Meanwhile,", "Meanwhile, alongside the challenge,"],
        connectorToNext: ["Therefore, drawing on this support,", "And so, if you lean into this support,"],
        useImagery: true
      },
      "Likely direction on current path": {
        intro: [
          (card, orientation) => `The likely direction, if you continue as you are: ${card} ${orientation}.`,
          (card, orientation) => `On this current path, ${card} ${orientation} sketches a probable trajectory.`,
          (card, orientation) => `If patterns hold, ${card} ${orientation} hints at where things may be heading.`
        ],
        frame: [
          "This is not fixed fate\u2014only the path of current momentum.",
          "Use it as feedback about how your present choices echo forward."
        ],
        connectorToPrev: ["Therefore,", "Therefore, taken together,"],
        useImagery: true
      },
      // Single card
      "Theme / Guidance of the Moment": {
        intro: [
          (card, orientation) => `This card shows: ${card} ${orientation}.`,
          (card, orientation) => `${card} ${orientation} offers a simple snapshot for right now.`,
          (card, orientation) => `For this moment, ${card} ${orientation} steps forward.`
        ],
        frame: [
          "This distills the essence of what wants your awareness.",
          "Hold it as a gentle focal point rather than a rigid rule."
        ],
        useImagery: true
      },
      // Relationship spread positions
      "You / your energy": {
        intro: [
          (card, orientation) => `Your energy in this dynamic: ${card} ${orientation}.`,
          (card, orientation) => `${card} ${orientation} reflects how you\u2019re currently arriving in this connection.`,
          (card, orientation) => `Here, ${card} ${orientation} mirrors your stance, needs, or patterns.`
        ],
        frame: [
          "This invites honest, compassionate self-recognition.",
          "Use it to notice how you participate, without blaming yourself."
        ],
        connectorToNext: ["And so,", "And so, from your side,"],
        useImagery: true
      },
      "Them / their energy": {
        intro: [
          (card, orientation) => `Their energy in this dynamic: ${card} ${orientation}.`,
          (card, orientation) => `${card} ${orientation} reflects how they\u2019re currently arriving in this connection.`,
          (card, orientation) => `Here, ${card} ${orientation} sketches their stance, needs, or patterns in the bond.`
        ],
        frame: [
          "This offers a snapshot of how they may be engaging, without claiming to read their mind.",
          "Treat it as information about the dynamic\u2014not a verdict on their character."
        ],
        connectorToPrev: ["Meanwhile,", "Meanwhile, alongside your energy,"],
        connectorToNext: ["Therefore, together, these energies create", "And so, in combination, these currents shape"],
        useImagery: true
      },
      "The connection / shared lesson": {
        intro: [
          (card, orientation) => `The connection itself, the shared lesson: ${card} ${orientation}.`,
          (card, orientation) => `${card} ${orientation} gives language to what this bond is asking of you both.`,
          (card, orientation) => `Here, ${card} ${orientation} frames the relationship as its own living entity.`
        ],
        frame: [
          "This card speaks to the shared lesson, patterns, and potentials alive between you.",
          "Let it name what this connection is teaching, without overstating what must happen next."
        ],
        connectorToPrev: ["Therefore,", "Therefore, taken together,"],
        useImagery: true
      },
      // Decision spread positions
      "Heart of the decision": {
        intro: [
          (card, orientation) => `At the heart of this decision: ${card} ${orientation}.`,
          (card, orientation) => `${card} ${orientation} shows what this choice is truly circling around.`,
          (card, orientation) => `Here, ${card} ${orientation} distills the core question beneath the logistics.`
        ],
        frame: [
          "This reveals what genuinely matters most as you consider your options.",
          "Let it help you name the values and needs that deserve to lead."
        ],
        connectorToNext: ["Therefore, with this understanding,", "And so, from this center,"],
        useImagery: true
      },
      "Path A \u2014 energy & likely outcome": {
        intro: [
          (card, orientation) => `Path A, its energy and likely outcome: ${card} ${orientation}.`,
          (card, orientation) => `If you lean into Path A, ${card} ${orientation} sketches how this route may feel.`,
          (card, orientation) => `As one possibility, Path A under ${card} ${orientation} outlines a distinct flavor of growth.`
        ],
        frame: [
          "This shows the character, challenges, and probable results of moving this way.",
          "Hold it as one trajectory among many, shaped by your choices."
        ],
        connectorToPrev: ["Because this option emerges,", "Because we are looking at one route,"],
        useImagery: true
      },
      "Path B \u2014 energy & likely outcome": {
        intro: [
          (card, orientation) => `Path B, its energy and likely outcome: ${card} ${orientation}.`,
          (card, orientation) => `If you lean into Path B, ${card} ${orientation} traces a different way this could unfold.`,
          (card, orientation) => `As another possibility, Path B under ${card} ${orientation} brings its own tone and lessons.`
        ],
        frame: [
          "This shows an alternate character and set of challenges to consider.",
          "Compare it with Path A by how your body and ethics respond, not from fear."
        ],
        connectorToPrev: ["However, alternatively,", "However, on the other hand,"],
        useImagery: true
      },
      "What clarifies the best path": {
        intro: [
          (card, orientation) => `What clarifies the best path forward: ${card} ${orientation}.`,
          (card, orientation) => `${card} ${orientation} adds perspective on how each option aligns with your real needs.`,
          (card, orientation) => `Here, ${card} ${orientation} softens confusion and highlights what rings true.`
        ],
        frame: [
          "This card offers perspective to help you discern which direction serves your integrity and wellbeing.",
          "Use it as a clarifying lens, not as a command."
        ],
        connectorToPrev: ["This sets the stage for clarity,", "This sets the stage for this clarifying view,"],
        useImagery: true
      },
      "What to remember about your free will": {
        intro: [
          (card, orientation) => `Remember about your free will and agency: ${card} ${orientation}.`,
          (card, orientation) => `${card} ${orientation} underscores that your choices remain central here.`,
          (card, orientation) => `This position, held by ${card} ${orientation}, is a reminder that no card overrides your consent or agency.`
        ],
        frame: [
          "This reminds you of your power to choose and re-choose as new information emerges.",
          "Let it anchor you in the understanding that you co-create outcomes."
        ],
        connectorToPrev: ["Meanwhile,", "And so, above all,"],
        useImagery: true
      }
    };
    __name(buildPositionCardText, "buildPositionCardText");
    __name(buildReversalGuidance, "buildReversalGuidance");
    __name(getPositionOptions, "getPositionOptions");
    __name(getCrossCheckReversalNote, "getCrossCheckReversalNote");
    __name(formatMeaningForPosition, "formatMeaningForPosition");
    __name(buildCelticCrossReading, "buildCelticCrossReading");
    __name(buildOpening, "buildOpening");
    __name(appendReversalReminder, "appendReversalReminder");
    __name(buildNucleusSection, "buildNucleusSection");
    __name(buildTimelineSection, "buildTimelineSection");
    __name(getConnector, "getConnector");
    __name(buildConsciousnessSection, "buildConsciousnessSection");
    __name(buildStaffSection, "buildStaffSection");
    __name(buildCrossChecksSection, "buildCrossChecksSection");
    __name(formatCrossCheck, "formatCrossCheck");
    __name(buildReflectionsSection, "buildReflectionsSection");
    __name(buildSynthesisSection, "buildSynthesisSection");
    __name(buildFiveCardReading, "buildFiveCardReading");
    __name(buildRelationshipReading, "buildRelationshipReading");
    __name(buildRelationshipElementalTakeaway, "buildRelationshipElementalTakeaway");
    __name(buildOccultFlavor, "buildOccultFlavor");
    __name(buildGuidanceActionPrompt, "buildGuidanceActionPrompt");
    __name(buildInlineReversalNote, "buildInlineReversalNote");
    __name(extractCoreTheme, "extractCoreTheme");
    __name(decapitalize, "decapitalize");
    __name(buildDecisionReading, "buildDecisionReading");
    __name(buildSingleCardReading, "buildSingleCardReading");
    __name(buildThreeCardReading, "buildThreeCardReading");
    __name(buildThreeCardSynthesis, "buildThreeCardSynthesis");
    __name(buildEnhancedClaudePrompt, "buildEnhancedClaudePrompt");
    __name(getSpreadKeyFromName, "getSpreadKeyFromName");
    __name(buildSystemPrompt, "buildSystemPrompt");
    __name(buildUserPrompt, "buildUserPrompt");
    __name(buildCelticCrossPromptCards, "buildCelticCrossPromptCards");
    __name(buildThreeCardPromptCards, "buildThreeCardPromptCards");
    __name(buildCardWithImagery, "buildCardWithImagery");
    __name(getElementalImageryText, "getElementalImageryText");
    __name(buildFiveCardPromptCards, "buildFiveCardPromptCards");
    __name(buildRelationshipPromptCards, "buildRelationshipPromptCards");
    __name(buildDecisionPromptCards, "buildDecisionPromptCards");
    __name(buildSingleCardPrompt, "buildSingleCardPrompt");
    __name(buildStandardPromptCards, "buildStandardPromptCards");
    __name(buildPromptCrossChecks, "buildPromptCrossChecks");
  }
});

// lib/contextDetection.js
function sanitizeQuestion(question) {
  return typeof question === "string" ? question.trim().toLowerCase() : "";
}
function countMatches(text, keywords) {
  if (!text)
    return 0;
  let score = 0;
  for (const keyword of keywords) {
    if (keyword.includes(" ")) {
      if (text.includes(keyword)) {
        score += 3;
      }
    } else if (text.includes(keyword)) {
      score += 2;
    }
  }
  return score;
}
function inferContext(userQuestion, spreadKey) {
  const normalizedSpreadKey = typeof spreadKey === "string" ? spreadKey.toLowerCase() : "";
  const defaultContext = SPREAD_CONTEXT_DEFAULTS[normalizedSpreadKey] || null;
  const text = sanitizeQuestion(userQuestion);
  const scores = {
    love: 0,
    career: 0,
    self: 0,
    spiritual: 0
  };
  for (const [context, keywords] of Object.entries(CONTEXT_KEYWORDS)) {
    scores[context] = countMatches(text, keywords);
  }
  if (defaultContext) {
    scores[defaultContext] += 1;
  }
  let bestContext = "general";
  let bestScore = 0;
  for (const [context, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      bestContext = context;
    } else if (score === bestScore && score > 0) {
      const priority = ["love", "career", "self", "spiritual"];
      if (priority.indexOf(context) < priority.indexOf(bestContext)) {
        bestContext = context;
      }
    }
  }
  if (bestScore === 0 && defaultContext) {
    return defaultContext;
  }
  return bestScore > 0 ? bestContext : "general";
}
var SPREAD_CONTEXT_DEFAULTS, CONTEXT_KEYWORDS;
var init_contextDetection = __esm({
  "lib/contextDetection.js"() {
    init_functionsRoutes_0_2857290313673917();
    SPREAD_CONTEXT_DEFAULTS = {
      relationship: "love"
    };
    CONTEXT_KEYWORDS = {
      love: [
        "relationship",
        "relationships",
        "romance",
        "romantic",
        "love",
        "partner",
        "partnership",
        "marriage",
        "married",
        "spouse",
        "crush",
        "dating",
        "soulmate",
        "twin flame",
        "connection",
        "couple",
        "lover",
        "feelings",
        "intimacy"
      ],
      career: [
        "career",
        "job",
        "work",
        "working",
        "boss",
        "coworker",
        "manager",
        "business",
        "client",
        "project",
        "promotion",
        "salary",
        "money",
        "finance",
        "finances",
        "income",
        "profession",
        "entrepreneur",
        "company",
        "office",
        "team",
        "coworkers"
      ],
      self: [
        "self",
        "myself",
        "personal",
        "healing",
        "heal",
        "wellbeing",
        "well-being",
        "wellness",
        "growth",
        "confidence",
        "mindset",
        "mental health",
        "boundary",
        "boundaries",
        "shadow",
        "inner child",
        "therapy",
        "habit",
        "habits",
        "self-care",
        "self care"
      ],
      spiritual: [
        "spiritual",
        "spirit",
        "soul",
        "soulpath",
        "purpose",
        "mission",
        "intuition",
        "psychic",
        "meditation",
        "meditate",
        "prayer",
        "ritual",
        "energy",
        "energetic",
        "chakra",
        "astrology",
        "ancestor",
        "guides",
        "universe",
        "divine"
      ]
    };
    __name(sanitizeQuestion, "sanitizeQuestion");
    __name(countMatches, "countMatches");
    __name(inferContext, "inferContext");
  }
});

// api/tarot-reading.js
async function performSpreadAnalysis(spreadInfo, cardsInfo, options = {}, requestId = "unknown") {
  if (!spreadInfo || !Array.isArray(cardsInfo) || cardsInfo.length === 0) {
    console.warn(`[${requestId}] performSpreadAnalysis: missing or invalid spreadInfo/cardsInfo, falling back to generic themes only.`);
    return {
      themes: { suitCounts: {}, elementCounts: {}, reversalCount: 0, reversalFramework: "contextual", reversalDescription: { name: "Context-Dependent", description: "Reversed cards are interpreted individually based on context.", guidance: "Read each reversal in light of its position and relationships." } },
      spreadAnalysis: null,
      spreadKey: "general"
    };
  }
  let themes;
  try {
    console.log(`[${requestId}] Analyzing spread themes...`);
    themes = await analyzeSpreadThemes(cardsInfo, {
      reversalFrameworkOverride: options.reversalFrameworkOverride
    });
    console.log(`[${requestId}] Theme analysis complete:`, {
      suitCounts: themes.suitCounts,
      elementCounts: themes.elementCounts,
      reversalCount: themes.reversalCount,
      framework: themes.reversalFramework
    });
  } catch (err) {
    console.error(`[${requestId}] performSpreadAnalysis: analyzeSpreadThemes failed, using minimal fallback themes.`, err);
    themes = {
      suitCounts: {},
      elementCounts: {},
      reversalCount: 0,
      reversalFramework: "contextual",
      reversalDescription: {
        name: "Context-Dependent",
        description: "Reversed cards are interpreted individually based on context.",
        guidance: "Read each reversal by listening to its position and neighboring cards."
      }
    };
  }
  let spreadAnalysis = null;
  let spreadKey = "general";
  try {
    spreadKey = getSpreadKey(spreadInfo.name);
    console.log(`[${requestId}] Spread key identified: ${spreadKey}`);
    if (spreadKey === "celtic" && cardsInfo.length === 10) {
      console.log(`[${requestId}] Performing Celtic Cross analysis...`);
      spreadAnalysis = analyzeCelticCross(cardsInfo);
      console.log(`[${requestId}] Celtic Cross analysis complete`);
    } else if (spreadKey === "threeCard" && cardsInfo.length === 3) {
      console.log(`[${requestId}] Performing Three-Card analysis...`);
      spreadAnalysis = analyzeThreeCard(cardsInfo);
      console.log(`[${requestId}] Three-Card analysis complete`);
    } else if (spreadKey === "fiveCard" && cardsInfo.length === 5) {
      console.log(`[${requestId}] Performing Five-Card analysis...`);
      spreadAnalysis = analyzeFiveCard(cardsInfo);
      console.log(`[${requestId}] Five-Card analysis complete`);
    } else {
      console.log(`[${requestId}] No specific analysis for spreadKey: ${spreadKey} with ${cardsInfo.length} cards`);
    }
  } catch (err) {
    console.error(`[${requestId}] performSpreadAnalysis: spread-specific analysis failed, continuing with themes only.`, err);
    spreadAnalysis = null;
    spreadKey = "general";
  }
  return {
    themes,
    spreadAnalysis,
    spreadKey
  };
}
function getSpreadKey(spreadName) {
  const map = {
    "Celtic Cross (Classic 10-Card)": "celtic",
    "Three-Card Story (Past \xB7 Present \xB7 Future)": "threeCard",
    "Five-Card Clarity": "fiveCard",
    "One-Card Insight": "single",
    "Relationship Snapshot": "relationship",
    "Decision / Two-Path": "decision"
  };
  return map[spreadName] || "general";
}
async function readRequestBody(request) {
  if (request.headers.get("content-length") === "0") {
    return {};
  }
  const text = await request.text();
  if (!text) {
    return {};
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Invalid JSON payload.");
  }
}
function validatePayload({ spreadInfo, cardsInfo }) {
  if (!spreadInfo || typeof spreadInfo.name !== "string") {
    return "Missing spread information.";
  }
  if (!Array.isArray(cardsInfo) || cardsInfo.length === 0) {
    return "No cards were provided for the reading.";
  }
  const hasInvalidCard = cardsInfo.some((card) => {
    if (typeof card !== "object" || card === null)
      return true;
    const requiredFields = ["position", "card", "orientation", "meaning"];
    return requiredFields.some((field) => {
      const value = card[field];
      return typeof value !== "string" || !value.trim();
    });
  });
  if (hasInvalidCard) {
    return "One or more cards are missing required details.";
  }
  return null;
}
async function generateWithAzureGPT5Responses(env, { spreadInfo, cardsInfo, userQuestion, reflectionsText, analysis, context }, requestId = "unknown") {
  const endpoint = env.AZURE_OPENAI_ENDPOINT.replace(/\/+$/, "");
  const apiKey = env.AZURE_OPENAI_API_KEY;
  const modelName = env.AZURE_OPENAI_GPT5_MODEL;
  console.log(`[${requestId}] Building Azure GPT-5 prompts...`);
  const { systemPrompt, userPrompt } = buildEnhancedClaudePrompt({
    spreadInfo,
    cardsInfo,
    userQuestion,
    reflectionsText,
    themes: analysis.themes,
    spreadAnalysis: analysis.spreadAnalysis,
    context
  });
  console.log(`[${requestId}] System prompt length: ${systemPrompt.length}, User prompt length: ${userPrompt.length}`);
  const url = `${endpoint}/openai/v1/responses`;
  console.log(`[${requestId}] Making Azure GPT-5 Responses API request to: ${url}`);
  console.log(`[${requestId}] Using model: ${modelName}`);
  let reasoningEffort = "medium";
  if (modelName && modelName.toLowerCase().includes("gpt-5-pro")) {
    reasoningEffort = "high";
    console.log(`[${requestId}] Detected gpt-5-pro, using 'high' reasoning effort`);
  }
  const requestBody = {
    model: modelName,
    instructions: systemPrompt,
    input: userPrompt,
    max_output_tokens: 1500,
    temperature: 0.7,
    reasoning: {
      effort: reasoningEffort
      // Dynamically set based on model
    },
    text: {
      verbosity: "medium"
      // low, medium, or high - controls output conciseness
    }
  };
  console.log(`[${requestId}] Request config:`, {
    model: requestBody.model,
    max_output_tokens: requestBody.max_output_tokens,
    temperature: requestBody.temperature,
    reasoning_effort: requestBody.reasoning.effort,
    verbosity: requestBody.text.verbosity
  });
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "content-type": "application/json"
    },
    body: JSON.stringify(requestBody)
  });
  console.log(`[${requestId}] Azure Responses API response status: ${response.status}`);
  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    console.error(`[${requestId}] Azure Responses API error response:`, errText);
    throw new Error(`Azure OpenAI GPT-5 Responses API error ${response.status}: ${errText}`);
  }
  const data = await response.json();
  console.log(`[${requestId}] Azure Responses API response received:`, {
    id: data.id,
    model: data.model,
    status: data.status,
    outputCount: data.output?.length,
    usage: data.usage
  });
  let content = "";
  if (data.output && Array.isArray(data.output)) {
    for (const item of data.output) {
      if (item.type === "message" && item.content) {
        for (const contentItem of item.content) {
          if (contentItem.type === "output_text" && contentItem.text) {
            content += contentItem.text;
          }
        }
      }
    }
  }
  if (!content && data.output_text) {
    content = data.output_text;
  }
  if (!content || typeof content !== "string" || !content.trim()) {
    console.error(`[${requestId}] Empty or invalid response from Azure GPT-5:`, {
      hasOutput: !!data.output,
      outputLength: data.output?.length,
      status: data.status
    });
    throw new Error("Empty response from Azure OpenAI GPT-5 Responses API");
  }
  console.log(`[${requestId}] Generated reading length: ${content.length} characters`);
  console.log(`[${requestId}] Token usage:`, {
    input_tokens: data.usage?.input_tokens,
    output_tokens: data.usage?.output_tokens,
    reasoning_tokens: data.usage?.output_tokens_details?.reasoning_tokens,
    total_tokens: data.usage?.total_tokens
  });
  return content.trim();
}
function composeReadingEnhanced({ spreadInfo, cardsInfo, userQuestion, reflectionsText, analysis, context }) {
  const { themes, spreadAnalysis, spreadKey } = analysis;
  return generateReadingFromAnalysis({
    spreadKey,
    spreadAnalysis,
    cardsInfo,
    userQuestion,
    reflectionsText,
    themes,
    spreadInfo,
    context
  });
}
function generateReadingFromAnalysis({ spreadKey, spreadAnalysis, cardsInfo, userQuestion, reflectionsText, themes, spreadInfo, context }) {
  const builder = SPREAD_READING_BUILDERS[spreadKey];
  if (builder) {
    const result = builder({
      spreadAnalysis,
      cardsInfo,
      userQuestion,
      reflectionsText,
      themes,
      spreadInfo,
      context
    });
    if (typeof result === "string" && result.trim()) {
      return result;
    }
  }
  return buildGenericReading({
    spreadInfo,
    cardsInfo,
    userQuestion,
    reflectionsText,
    themes,
    context
  });
}
function buildGenericReading({ spreadInfo, cardsInfo, userQuestion, reflectionsText, themes, context }) {
  const spreadName = spreadInfo?.name?.trim() || "your chosen spread";
  const entries = [];
  const safeCards = Array.isArray(cardsInfo) ? cardsInfo : [];
  const openingText = userQuestion && userQuestion.trim() ? `Focusing on the ${spreadName.toLowerCase()}, I attune to your question: "${userQuestion.trim()}"

The cards respond with insight that honors both seen and unseen influences.` : `Focusing on the ${spreadName.toLowerCase()}, the cards speak to the energy most present for you right now.`;
  entries.push({
    text: openingText,
    metadata: { type: "opening", cards: safeCards.length > 0 ? [safeCards[0]] : [] }
  });
  entries.push({
    text: buildCardsSection(safeCards, context),
    metadata: { type: "cards", cards: safeCards }
  });
  if (reflectionsText && reflectionsText.trim()) {
    entries.push({
      text: `**Your Reflections**

${reflectionsText.trim()}

Your intuitive impressions add personal meaning to this reading.`,
      metadata: { type: "reflections" }
    });
  }
  const finalCard = safeCards.length > 0 ? safeCards[safeCards.length - 1] : null;
  entries.push({
    text: buildEnhancedSynthesis(safeCards, themes, userQuestion, context),
    metadata: { type: "synthesis", cards: finalCard ? [finalCard] : [] }
  });
  const sections = entries.map(({ text, metadata }) => enhanceSection(text, metadata).text).filter(Boolean);
  const readingBody = sections.join("\n\n");
  return appendGenericReversalReminder(readingBody, safeCards, themes);
}
function buildCardsSection(cardsInfo, context) {
  const lines = cardsInfo.map((card) => {
    const position = (card.position || "").trim() || `Card ${cardsInfo.indexOf(card) + 1}`;
    const description = buildPositionCardText(card, position, { context });
    return `**${position}**
${description}`;
  });
  return `**The Cards Speak**

${lines.join("\n\n")}`;
}
function buildEnhancedSynthesis(cardsInfo, themes, userQuestion, context) {
  let section = `**Synthesis & Guidance**

`;
  if (context && context !== "general") {
    const contextMap = {
      love: "relationships and heart-centered experience",
      career: "career, vocation, and material pathways",
      self: "personal growth and inner landscape",
      spiritual: "spiritual practice and meaning-making"
    };
    const descriptor = contextMap[context] || "your life as a whole";
    section += `Focus: Interpreting the spread through the lens of ${descriptor}.

`;
  }
  if (themes.suitFocus) {
    section += `${themes.suitFocus}

`;
  }
  if (themes.timingProfile === "near-term-tilt") {
    section += `Pace: These influences are likely to move or clarify in the nearer term, assuming you stay engaged with them.

`;
  } else if (themes.timingProfile === "longer-arc-tilt") {
    section += `Pace: This reading leans toward a slower-burn, structural arc that unfolds over a longer chapter, not overnight.

`;
  } else if (themes.timingProfile === "developing-arc") {
    section += `Pace: Themes here describe an unfolding chapter\u2014neither instant nor distant, but evolving as you work with them.

`;
  }
  if (themes.archetypeDescription) {
    section += `${themes.archetypeDescription}

`;
  }
  if (themes.elementalBalance) {
    section += `Elemental context: ${themes.elementalBalance}

`;
  }
  if (themes.lifecycleStage) {
    section += `The cards speak to ${themes.lifecycleStage}.

`;
  }
  const personalAnchor = userQuestion?.trim() ? "Take the next small, intentional step that honors both your intuition and the practical realities at hand." : "Carry this insight gently into your next steps, allowing space for new awareness to bloom.";
  section += `${personalAnchor}

`;
  section += `Remember: These cards show a trajectory based on current patterns. Your awareness, choices, and actions shape what unfolds. You are co-creating this path.`;
  return section;
}
function appendGenericReversalReminder(readingText, cardsInfo, themes) {
  if (!readingText)
    return readingText;
  const hasReversed = Array.isArray(cardsInfo) && cardsInfo.some(
    (card) => (card?.orientation || "").toLowerCase() === "reversed"
  );
  if (!hasReversed || !themes?.reversalDescription) {
    return readingText;
  }
  const reminder = `*Reversal lens reminder: Within the ${themes.reversalDescription.name} lens, ${themes.reversalDescription.guidance}*`;
  if (readingText.includes(reminder)) {
    return readingText;
  }
  return `${readingText}

${reminder}`;
}
function jsonResponse(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...init.headers || {}
    }
  });
}
var onRequestGet, onRequestPost, SPREAD_READING_BUILDERS;
var init_tarot_reading = __esm({
  "api/tarot-reading.js"() {
    init_functionsRoutes_0_2857290313673917();
    init_spreadAnalysis();
    init_narrativeBuilder();
    init_narrativeSpine();
    init_contextDetection();
    onRequestGet = /* @__PURE__ */ __name(async ({ env }) => {
      return jsonResponse({
        status: "ok",
        provider: env?.AZURE_OPENAI_GPT5_MODEL ? "azure-gpt5" : "local",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    }, "onRequestGet");
    onRequestPost = /* @__PURE__ */ __name(async ({ request, env }) => {
      const startTime = Date.now();
      const requestId = crypto.randomUUID ? crypto.randomUUID() : `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log(`[${requestId}] === TAROT READING REQUEST START ===`);
      try {
        console.log(`[${requestId}] Reading request body...`);
        const payload = await readRequestBody(request);
        const { spreadInfo, cardsInfo, userQuestion, reflectionsText, reversalFrameworkOverride } = payload;
        console.log(`[${requestId}] Payload parsed:`, {
          spreadName: spreadInfo?.name,
          cardCount: cardsInfo?.length,
          hasQuestion: !!userQuestion,
          hasReflections: !!reflectionsText,
          reversalOverride: reversalFrameworkOverride
        });
        const validationError = validatePayload(payload);
        if (validationError) {
          console.error(`[${requestId}] Validation failed:`, validationError);
          return jsonResponse(
            { error: validationError },
            { status: 400 }
          );
        }
        console.log(`[${requestId}] Payload validation passed`);
        console.log(`[${requestId}] Starting spread analysis...`);
        const analysisStart = Date.now();
        const analysis = await performSpreadAnalysis(spreadInfo, cardsInfo, {
          reversalFrameworkOverride
        }, requestId);
        const analysisTime = Date.now() - analysisStart;
        console.log(`[${requestId}] Spread analysis completed in ${analysisTime}ms:`, {
          spreadKey: analysis.spreadKey,
          hasSpreadAnalysis: !!analysis.spreadAnalysis,
          reversalCount: analysis.themes?.reversalCount,
          reversalFramework: analysis.themes?.reversalFramework
        });
        const context = inferContext(userQuestion, analysis.spreadKey);
        console.log(`[${requestId}] Context inferred: ${context}`);
        let reading;
        let usedAzureGPT5 = false;
        if (env && env.AZURE_OPENAI_API_KEY && env.AZURE_OPENAI_ENDPOINT && env.AZURE_OPENAI_GPT5_MODEL) {
          console.log(`[${requestId}] Azure OpenAI GPT-5 credentials found, attempting generation...`);
          console.log(`[${requestId}] Azure config:`, {
            endpoint: env.AZURE_OPENAI_ENDPOINT,
            model: env.AZURE_OPENAI_GPT5_MODEL,
            hasApiKey: !!env.AZURE_OPENAI_API_KEY
          });
          const azureStart = Date.now();
          try {
            reading = await generateWithAzureGPT5Responses(env, {
              spreadInfo,
              cardsInfo,
              userQuestion,
              reflectionsText,
              analysis,
              context
            }, requestId);
            const azureTime = Date.now() - azureStart;
            console.log(`[${requestId}] Azure GPT-5 generation successful in ${azureTime}ms, reading length: ${reading?.length || 0}`);
            usedAzureGPT5 = true;
          } catch (err) {
            const azureTime = Date.now() - azureStart;
            console.error(`[${requestId}] Azure OpenAI GPT-5 generation failed after ${azureTime}ms, falling back to local composer:`, {
              error: err.message,
              stack: err.stack
            });
          }
        } else {
          console.log(`[${requestId}] Azure OpenAI GPT-5 credentials not configured, using local composer`, {
            hasApiKey: !!env?.AZURE_OPENAI_API_KEY,
            hasEndpoint: !!env?.AZURE_OPENAI_ENDPOINT,
            hasModel: !!env?.AZURE_OPENAI_GPT5_MODEL
          });
        }
        if (!reading) {
          console.log(`[${requestId}] Generating reading with local composer...`);
          const localStart = Date.now();
          reading = composeReadingEnhanced({
            spreadInfo,
            cardsInfo,
            userQuestion,
            reflectionsText,
            analysis,
            context
          });
          const localTime = Date.now() - localStart;
          console.log(`[${requestId}] Local composer completed in ${localTime}ms, reading length: ${reading?.length || 0}`);
          if (!reading || !reading.toString().trim()) {
            console.error(`[${requestId}] composeReadingEnhanced returned empty reading; returning structured error.`);
            return jsonResponse(
              { error: "Analysis failed to produce a narrative. Please retry your reading." },
              { status: 500 }
            );
          }
        }
        const totalTime = Date.now() - startTime;
        const provider = usedAzureGPT5 ? "azure-gpt5" : "local";
        console.log(`[${requestId}] Request completed successfully in ${totalTime}ms using provider: ${provider}`);
        console.log(`[${requestId}] === TAROT READING REQUEST END ===`);
        return jsonResponse({
          reading,
          provider,
          themes: analysis.themes,
          context,
          spreadAnalysis: {
            // Normalize top-level metadata for all spreads
            version: "1.0.0",
            spreadKey: analysis.spreadKey,
            // For spreads where analyzeX already returns normalized shape, prefer it directly
            ...analysis.spreadAnalysis || {}
          }
        });
      } catch (error) {
        const totalTime = Date.now() - startTime;
        console.error(`[${requestId}] FATAL ERROR after ${totalTime}ms:`, {
          error: error.message,
          stack: error.stack,
          name: error.name
        });
        console.log(`[${requestId}] === TAROT READING REQUEST END (ERROR) ===`);
        return jsonResponse(
          { error: "Failed to generate reading." },
          { status: 500 }
        );
      }
    }, "onRequestPost");
    __name(performSpreadAnalysis, "performSpreadAnalysis");
    __name(getSpreadKey, "getSpreadKey");
    __name(readRequestBody, "readRequestBody");
    __name(validatePayload, "validatePayload");
    __name(generateWithAzureGPT5Responses, "generateWithAzureGPT5Responses");
    SPREAD_READING_BUILDERS = {
      celtic: ({ spreadAnalysis, cardsInfo, userQuestion, reflectionsText, themes, context }) => spreadAnalysis ? buildCelticCrossReading({
        cardsInfo,
        userQuestion,
        reflectionsText,
        celticAnalysis: spreadAnalysis,
        themes,
        context
      }) : null,
      threeCard: ({ spreadAnalysis, cardsInfo, userQuestion, reflectionsText, themes, context }) => spreadAnalysis ? buildThreeCardReading({
        cardsInfo,
        userQuestion,
        reflectionsText,
        threeCardAnalysis: spreadAnalysis,
        themes,
        context
      }) : null,
      fiveCard: ({ spreadAnalysis, cardsInfo, userQuestion, reflectionsText, themes, context }) => spreadAnalysis ? buildFiveCardReading({
        cardsInfo,
        userQuestion,
        reflectionsText,
        fiveCardAnalysis: spreadAnalysis,
        themes,
        context
      }) : null,
      relationship: ({ cardsInfo, userQuestion, reflectionsText, themes, context }) => buildRelationshipReading({ cardsInfo, userQuestion, reflectionsText, themes, context }),
      decision: ({ cardsInfo, userQuestion, reflectionsText, themes, context }) => buildDecisionReading({ cardsInfo, userQuestion, reflectionsText, themes, context }),
      single: ({ cardsInfo, userQuestion, reflectionsText, themes, context }) => buildSingleCardReading({ cardsInfo, userQuestion, reflectionsText, themes, context })
    };
    __name(composeReadingEnhanced, "composeReadingEnhanced");
    __name(generateReadingFromAnalysis, "generateReadingFromAnalysis");
    __name(buildGenericReading, "buildGenericReading");
    __name(buildCardsSection, "buildCardsSection");
    __name(buildEnhancedSynthesis, "buildEnhancedSynthesis");
    __name(appendGenericReversalReminder, "appendGenericReversalReminder");
    __name(jsonResponse, "jsonResponse");
  }
});

// api/tts.js
async function readJson(request) {
  if (request.headers.get("content-length") === "0") {
    return {};
  }
  const text = await request.text();
  if (!text)
    return {};
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Invalid JSON payload.");
  }
}
function sanitizeText(text) {
  if (typeof text !== "string")
    return "";
  return text.trim().slice(0, 4e3);
}
async function generateWithAzureGptMiniTTS(env, { text, context, voice, speed }) {
  const endpoint = env.endpoint.replace(/\/+$/, "");
  const deployment = env.deployment;
  const format = env.format || "mp3";
  const useV1Format = env.useV1Format === "true" || env.useV1Format === true;
  const apiVersion = useV1Format ? "preview" : env.apiVersion || "2025-04-01-preview";
  const instructions = INSTRUCTION_TEMPLATES[context] || INSTRUCTION_TEMPLATES.default;
  const validVoices = ["nova", "shimmer", "alloy", "echo", "fable", "onyx"];
  const selectedVoice = validVoices.includes(voice) ? voice : "nova";
  const selectedSpeed = speed !== void 0 ? Math.max(0.25, Math.min(4, speed)) : 0.95;
  const url = useV1Format ? `${endpoint}/openai/v1/audio/speech?api-version=${apiVersion}` : `${endpoint}/openai/deployments/${deployment}/audio/speech?api-version=${apiVersion}`;
  const payload = {
    input: text,
    // Required: text to synthesize (max 4096 chars)
    model: deployment,
    // Required: deployment/model identifier
    voice: selectedVoice,
    // Required: voice selection
    response_format: format,
    // Optional: audio format (mp3, wav, opus, flac, etc.)
    speed: selectedSpeed
    // Optional: playback speed (0.25-4.0, default 1.0)
  };
  const isSteerableModel = deployment.toLowerCase().includes("gpt-4o") || deployment.toLowerCase().includes("mini-tts") || deployment.toLowerCase().includes("audio-preview");
  if (isSteerableModel) {
    payload.instructions = instructions;
  }
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "api-key": env.apiKey,
      "content-type": "application/json"
      // JSON works despite docs saying multipart/form-data
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(`Azure TTS error ${response.status}: ${errText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const base64 = uint8ToBase64(new Uint8Array(arrayBuffer));
  const mime = format === "wav" ? "audio/wav" : `audio/${format}`;
  return `data:${mime};base64,${base64}`;
}
async function generateWithAzureGptMiniTTSStream(env, { text, context, voice, speed }) {
  const endpoint = env.endpoint.replace(/\/+$/, "");
  const deployment = env.deployment;
  const format = env.format || "mp3";
  const useV1Format = env.useV1Format === "true" || env.useV1Format === true;
  const apiVersion = useV1Format ? "preview" : env.apiVersion || "2025-04-01-preview";
  const instructions = INSTRUCTION_TEMPLATES[context] || INSTRUCTION_TEMPLATES.default;
  const validVoices = ["nova", "shimmer", "alloy", "echo", "fable", "onyx"];
  const selectedVoice = validVoices.includes(voice) ? voice : "nova";
  const selectedSpeed = speed !== void 0 ? Math.max(0.25, Math.min(4, speed)) : 0.95;
  const url = useV1Format ? `${endpoint}/openai/v1/audio/speech?api-version=${apiVersion}` : `${endpoint}/openai/deployments/${deployment}/audio/speech?api-version=${apiVersion}`;
  const payload = {
    input: text,
    model: deployment,
    voice: selectedVoice,
    response_format: format,
    speed: selectedSpeed,
    stream_format: "audio"
    // Stream raw audio chunks (safer, works with all models)
  };
  const isSteerableModel = deployment.toLowerCase().includes("gpt-4o") || deployment.toLowerCase().includes("mini-tts") || deployment.toLowerCase().includes("audio-preview");
  if (isSteerableModel) {
    payload.instructions = instructions;
  }
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "api-key": env.apiKey,
      "content-type": "application/json"
      // JSON works despite docs saying multipart/form-data
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(`Azure TTS streaming error ${response.status}: ${errText}`);
  }
  const mime = format === "wav" ? "audio/wav" : `audio/${format}`;
  return new Response(response.body, {
    headers: {
      "content-type": mime,
      "transfer-encoding": "chunked",
      "cache-control": "no-cache"
    }
  });
}
function generateFallbackWaveform(text) {
  const sampleRate = 22050;
  const words = text.split(/\s+/).filter(Boolean).length || 1;
  const durationSeconds = Math.min(6, Math.max(1.5, words * 0.55));
  const totalSamples = Math.floor(sampleRate * durationSeconds);
  const baseFrequency = 200 + Math.min(300, words * 40);
  const sweepFrequency = baseFrequency + Math.min(260, text.length);
  const amplitude = 0.4;
  const buffer = new ArrayBuffer(44 + totalSamples * 2);
  const view = new DataView(buffer);
  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + totalSamples * 2, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, "data");
  view.setUint32(40, totalSamples * 2, true);
  const dataView = new DataView(buffer, 44);
  for (let i = 0; i < totalSamples; i += 1) {
    const time = i / sampleRate;
    const sweep = baseFrequency + (sweepFrequency - baseFrequency) * (i / totalSamples);
    const envelope = Math.sin(Math.PI * Math.min(1, time / durationSeconds));
    const sample = Math.sin(2 * Math.PI * sweep * time) * amplitude * envelope;
    dataView.setInt16(i * 2, sample * 32767, true);
  }
  const wavBytes = new Uint8Array(buffer);
  const base64Audio = uint8ToBase64(wavBytes);
  return `data:audio/wav;base64,${base64Audio}`;
}
function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i += 1) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
function uint8ToBase64(uint8Array) {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(uint8Array).toString("base64");
  }
  let binary = "";
  const chunkSize = 32768;
  for (let i = 0; i < uint8Array.length; i += chunkSize) {
    const chunk = uint8Array.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}
function jsonResponse2(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...init.headers || {}
    }
  });
}
function resolveEnv(env, key) {
  if (env && typeof env[key] !== "undefined" && env[key] !== null) {
    return env[key];
  }
  if (typeof process !== "undefined" && process.env && typeof process.env[key] !== "undefined") {
    return process.env[key];
  }
  return void 0;
}
var onRequestGet2, onRequestPost2, INSTRUCTION_TEMPLATES;
var init_tts = __esm({
  "api/tts.js"() {
    init_functionsRoutes_0_2857290313673917();
    onRequestGet2 = /* @__PURE__ */ __name(async ({ env }) => {
      const azureEndpoint = resolveEnv(env, "AZURE_OPENAI_TTS_ENDPOINT") || resolveEnv(env, "AZURE_OPENAI_ENDPOINT");
      const azureKey = resolveEnv(env, "AZURE_OPENAI_TTS_API_KEY") || resolveEnv(env, "AZURE_OPENAI_API_KEY");
      const azureDeployment = resolveEnv(env, "AZURE_OPENAI_GPT_AUDIO_MINI_DEPLOYMENT");
      const hasAzure = !!(azureEndpoint && azureKey && azureDeployment);
      return jsonResponse2({
        status: "ok",
        provider: hasAzure ? "azure-openai" : "local",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    }, "onRequestGet");
    onRequestPost2 = /* @__PURE__ */ __name(async ({ request, env }) => {
      try {
        const url = new URL(request.url);
        const stream = url.searchParams.get("stream") === "true";
        const { text, context, voice, speed } = await readJson(request);
        const sanitizedText = sanitizeText(text);
        if (!sanitizedText) {
          return jsonResponse2(
            { error: 'The "text" field is required.' },
            { status: 400 }
          );
        }
        const azureConfig = {
          endpoint: resolveEnv(env, "AZURE_OPENAI_TTS_ENDPOINT") || resolveEnv(env, "AZURE_OPENAI_ENDPOINT"),
          apiKey: resolveEnv(env, "AZURE_OPENAI_TTS_API_KEY") || resolveEnv(env, "AZURE_OPENAI_API_KEY"),
          deployment: resolveEnv(env, "AZURE_OPENAI_GPT_AUDIO_MINI_DEPLOYMENT"),
          apiVersion: resolveEnv(env, "AZURE_OPENAI_API_VERSION"),
          format: resolveEnv(env, "AZURE_OPENAI_GPT_AUDIO_MINI_FORMAT"),
          useV1Format: resolveEnv(env, "AZURE_OPENAI_USE_V1_FORMAT")
        };
        if (azureConfig.endpoint && azureConfig.apiKey && azureConfig.deployment) {
          try {
            if (stream) {
              return await generateWithAzureGptMiniTTSStream(azureConfig, {
                text: sanitizedText,
                context: context || "default",
                voice: voice || "nova",
                speed
              });
            } else {
              const audio = await generateWithAzureGptMiniTTS(azureConfig, {
                text: sanitizedText,
                context: context || "default",
                voice: voice || "nova",
                speed
              });
              if (audio) {
                return jsonResponse2({ audio, provider: "azure-gpt-4o-mini-tts" });
              }
            }
          } catch (error) {
            console.error("Azure OpenAI gpt-4o-mini-tts failed, falling back to local waveform:", error);
          }
        }
        const fallbackAudio = generateFallbackWaveform(sanitizedText);
        if (stream) {
          return new Response(fallbackAudio.split(",")[1], {
            headers: {
              "content-type": "audio/wav",
              "transfer-encoding": "chunked"
            }
          });
        }
        return jsonResponse2({ audio: fallbackAudio, provider: "fallback" });
      } catch (error) {
        console.error("tts function error:", error);
        return jsonResponse2(
          { error: "Unable to generate audio at this time." },
          { status: 500 }
        );
      }
    }, "onRequestPost");
    __name(readJson, "readJson");
    __name(sanitizeText, "sanitizeText");
    INSTRUCTION_TEMPLATES = {
      "card-reveal": `Speak gently and mystically, as a tarot reader revealing a single card with reverence.
    Use a slightly slower pace with brief pauses after the card name and orientation.
    Convey wisdom and contemplation in your tone.`,
      "full-reading": `Speak as a wise, compassionate tarot reader sharing a complete reading.
    Use a thoughtful, contemplative tone with natural pauses between card descriptions and themes.
    Allow space for reflection\u2014speak slowly and deliberately, as if sitting across from the querent.
    Convey mystical depth while remaining grounded and accessible.
    Maintain a gentle, trauma-informed presence throughout.`,
      "synthesis": `Speak as a tarot reader weaving together the threads of a reading into cohesive guidance.
    Use a flowing, storytelling cadence that connects themes and patterns.
    Pause briefly between major insights to allow integration.
    Convey both wisdom and warmth, emphasizing agency and empowerment.`,
      "question": `Speak gently and clearly, acknowledging the querent's question with respect.
    Use a warm, inviting tone that creates space for exploration rather than fixed answers.`,
      "reflection": `Speak softly and affirmingly, honoring the querent's personal reflections.
    Use a validating, supportive tone that acknowledges their intuitive insights.`,
      "default": `Speak thoughtfully and gently, as a tarot reader sharing wisdom.
    Use a mystical yet grounded tone with natural pacing and slight pauses for contemplation.`
    };
    __name(generateWithAzureGptMiniTTS, "generateWithAzureGptMiniTTS");
    __name(generateWithAzureGptMiniTTSStream, "generateWithAzureGptMiniTTSStream");
    __name(generateFallbackWaveform, "generateFallbackWaveform");
    __name(writeString, "writeString");
    __name(uint8ToBase64, "uint8ToBase64");
    __name(jsonResponse2, "jsonResponse");
    __name(resolveEnv, "resolveEnv");
  }
});

// ../.wrangler/tmp/pages-CNuxh6/functionsRoutes-0.2857290313673917.mjs
var routes;
var init_functionsRoutes_0_2857290313673917 = __esm({
  "../.wrangler/tmp/pages-CNuxh6/functionsRoutes-0.2857290313673917.mjs"() {
    init_tarot_reading();
    init_tarot_reading();
    init_tts();
    init_tts();
    routes = [
      {
        routePath: "/api/tarot-reading",
        mountPath: "/api",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet]
      },
      {
        routePath: "/api/tarot-reading",
        mountPath: "/api",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost]
      },
      {
        routePath: "/api/tts",
        mountPath: "/api",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet2]
      },
      {
        routePath: "/api/tts",
        mountPath: "/api",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost2]
      }
    ];
  }
});

// ../node_modules/wrangler/templates/pages-template-worker.ts
init_functionsRoutes_0_2857290313673917();

// ../node_modules/path-to-regexp/dist.es2015/index.js
init_functionsRoutes_0_2857290313673917();
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");

// ../node_modules/wrangler/templates/pages-template-worker.ts
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: () => {
            isFailOpen = true;
          }
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");
export {
  pages_template_worker_default as default
};
