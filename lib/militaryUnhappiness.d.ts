import { UnitRegistry } from '@civ-clone/core-unit/UnitRegistry';
import City from '@civ-clone/core-city/City';
import Government from '@civ-clone/core-government/Government';
import MilitaryUnhappiness from '@civ-clone/base-city-yield-military-unhappiness/MilitaryUnhappiness';
import PlayerGovernment from '@civ-clone/core-government/PlayerGovernment';
import Unit from '@civ-clone/core-unit/Unit';
/** The governments under which aggressive units make their home city unhappy, each with how many citizens per unit. */
export type MilitaryUnhappinessTable = [typeof Government, number][];
/** How many citizens each aggressive unit makes unhappy under the player's government: 0 if it isn't in the table. */
export declare const militaryUnhappinessPerUnit: (
  table: MilitaryUnhappinessTable,
  playerGovernment: PlayerGovernment
) => number;
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
export declare const isAggressive: (
  unit: Unit,
  city: City,
  { neverAggressive, aggressiveAnywhere }?: AggressiveOptions
) => boolean;
/** The units `city` supports that are aggressive, in the order the unit registry has them. */
export declare const aggressiveUnits: (
  city: City,
  aggressive?: (unit: Unit, city: City) => boolean,
  unitRegistry?: UnitRegistry
) => Unit[];
/**
 * How many of the citizens a unit would make unhappy are spared, by a city improvement such as a police station.
 * The default spares none.
 */
export type MilitaryUnhappinessExemption = (unit: Unit, city: City) => number;
export declare const noExemption: MilitaryUnhappinessExemption;
/**
 * A `MilitaryUnhappiness` yield for each aggressive unit `city` supports, of `perUnit` less what `exemption` spares,
 * leaving out a unit that's wholly exempt.
 */
export declare const militaryUnhappiness: (
  city: City,
  perUnit: number,
  aggressive?: (unit: Unit, city: City) => boolean,
  unitRegistry?: UnitRegistry,
  exemption?: MilitaryUnhappinessExemption
) => MilitaryUnhappiness[];
