import {
  UnitRegistry,
  instance as unitRegistryInstance,
} from '@civ-clone/core-unit/UnitRegistry';
import City from '@civ-clone/core-city/City';
import Government from '@civ-clone/core-government/Government';
import MilitaryUnhappiness from '@civ-clone/base-city-yield-military-unhappiness/MilitaryUnhappiness';
import PlayerGovernment from '@civ-clone/core-government/PlayerGovernment';
import Unit from '@civ-clone/core-unit/Unit';

/** The governments under which aggressive units make their home city unhappy, each with how many citizens per unit. */
export type MilitaryUnhappinessTable = [typeof Government, number][];

/** How many citizens each aggressive unit makes unhappy under the player's government: 0 if it isn't in the table. */
export const militaryUnhappinessPerUnit = (
  table: MilitaryUnhappinessTable,
  playerGovernment: PlayerGovernment
): number =>
  table.find(([GovernmentType]) => playerGovernment.is(GovernmentType))?.[1] ??
  0;

export type AggressiveOptions = {
  /** Units that never count, whatever their attack. */
  neverAggressive?: (unit: Unit) => boolean;
  /** Units that count even in their home city. */
  aggressiveAnywhere?: (unit: Unit) => boolean;
};

/**
 * Whether a unit supported by `city` is aggressive: it has an attack, and is away from the city, or is a kind that
 * counts anywhere.
 */
export const isAggressive = (
  unit: Unit,
  city: City,
  {
    neverAggressive = (): boolean => false,
    aggressiveAnywhere = (): boolean => false,
  }: AggressiveOptions = {}
): boolean =>
  !neverAggressive(unit) &&
  unit.attack().value() > 0 &&
  (aggressiveAnywhere(unit) || unit.tile() !== city.tile());

/** The units `city` supports that are aggressive, in the order the unit registry has them. */
export const aggressiveUnits = (
  city: City,
  aggressive: (unit: Unit, city: City) => boolean = isAggressive,
  unitRegistry: UnitRegistry = unitRegistryInstance
): Unit[] =>
  unitRegistry.getByCity(city).filter((unit) => aggressive(unit, city));

/**
 * How many of the citizens a unit would make unhappy are spared, by a city improvement such as a police station.
 * The default spares none.
 */
export type MilitaryUnhappinessExemption = (unit: Unit, city: City) => number;

export const noExemption: MilitaryUnhappinessExemption = (): number => 0;

/**
 * A `MilitaryUnhappiness` yield for each aggressive unit `city` supports, of `perUnit` less what `exemption` spares,
 * leaving out a unit that's wholly exempt.
 */
export const militaryUnhappiness = (
  city: City,
  perUnit: number,
  aggressive: (unit: Unit, city: City) => boolean = isAggressive,
  unitRegistry: UnitRegistry = unitRegistryInstance,
  exemption: MilitaryUnhappinessExemption = noExemption
): MilitaryUnhappiness[] =>
  aggressiveUnits(city, aggressive, unitRegistry)
    .map((unit): [Unit, number] => [unit, perUnit - exemption(unit, city)])
    .filter(([, value]) => value > 0)
    .map(([unit, value]) => new MilitaryUnhappiness(value, unit));
