import { BODY_ZONES, augmeticLocation, implantLocation } from "./biomonitor-body.js";
import { implantsOf, isImplantFitted } from "../implants/state.js";

function values(collection) { return Array.from(collection ?? []); }
function locationOf(item) { return item?.system?.location?.value ?? item?.system?.location ?? "body"; }

export function adjustRadiationDose(value, delta) {
  return Math.max(0, Math.min(10, (Number(value) || 0) + (Number(delta) || 0)));
}

export function biomonitorThreats(model) {
  const entries = [
    ...(model.effects ?? []).map(document => ({ document, kind: "condition" })),
    ...(model.injuries ?? []).map(document => ({ document, kind: "injury" })),
    ...(model.criticalItems ?? []).map(document => ({ document, kind: "critical" }))
  ];
  return { empty: entries.length === 0, entries };
}

// Смерть: либо на персонаже висит статус «Мёртв», либо непролеченных
// критических ран больше бонуса Стойкости — правило смерти, core p.214-218.
// criticals.max в impmal и есть этот бонус, поэтому ровно max — ещё не смерть.
function deathState(actor, criticals) {
  const statuses = actor?.statuses;
  const flagged = statuses?.has?.("dead")
    ?? values(actor?.effects).some(effect => !effect.disabled && effect.statuses?.has?.("dead"));
  return Boolean(flagged) || (criticals.max > 0 && criticals.value > criticals.max);
}

export function buildBiomonitorModel(actor, snapshot = {}) {
  const wounds = actor?.system?.combat?.wounds ?? { value: 0, max: 0 };
  const criticals = actor?.system?.combat?.criticals ?? { value: 0, max: 0 };
  const ratio = wounds.max ? wounds.value / wounds.max : 0;
  const statusKey = deathState(actor, criticals) ? "dead"
    : (wounds.max > 0 && wounds.value >= wounds.max) || (criticals.max > 0 && criticals.value >= criticals.max) ? "critical"
    : criticals.value > 0 || ratio >= 0.66 ? "severe" : ratio > 0 ? "wounded" : "stable";
  const injuries = values(actor?.itemTypes?.injury);
  const criticalItems = values(actor?.itemTypes?.critical);
  const augmetics = values(actor?.itemTypes?.augmetic);
  // Установленные импланты — рядом с родной аугметикой, но отдельным списком:
  // это другой тип, другой бюджет и другая раскраска. Только отображение —
  // ставит и снимает их Хирургеон, монитор остаётся read-only.
  const implants = implantsOf(actor).filter(isImplantFitted);
  const effects = values(actor?.effects).filter(effect => !effect.disabled);
  const zones = BODY_ZONES.map(zone => ({
    ...zone,
    armour: actor?.system?.combat?.hitLocations?.[zone.key]?.armour ?? 0,
    injuries: injuries.filter(item => locationOf(item) === zone.key),
    criticals: criticalItems.filter(item => locationOf(item) === zone.key),
    augmetics: augmetics.filter(item => augmeticLocation(item) === zone.key),
    implants: implants.filter(item => implantLocation(item) === zone.key)
  }));
  return {
    actorId: actor?.id, name: actor?.name,
    status: { key: statusKey }, wounds, criticals,
    injuries, criticalItems, augmetics, implants, effects, zones,
    internalAugmetics: augmetics.filter(item => augmeticLocation(item) === "internal"),
    internalImplants: implants.filter(item => implantLocation(item) === "internal"),
    environment: {
      radiationDose: Number(snapshot.radiationDose) || 0,
      radiation: Number(snapshot.radiation) || 0,
      temperature: snapshot.temperature ?? 20,
      gravity: snapshot.gravity ?? 1,
      atmosphere: snapshot.atmosphere ?? { type: "normal", intensity: 0 },
      nextExposure: snapshot.nextExposure ?? null
    }
  };
}
