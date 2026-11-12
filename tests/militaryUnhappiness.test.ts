import {
  MilitaryUnhappinessTable,
  aggressiveUnits,
  isAggressive,
  militaryUnhappiness,
  militaryUnhappinessPerUnit,
} from '../lib/militaryUnhappiness';
import City from '@civ-clone/core-city/City';
import Government from '@civ-clone/core-government/Government';
import PlayerGovernment from '@civ-clone/core-government/PlayerGovernment';
import Unit from '@civ-clone/core-unit/Unit';
import UnitRegistry from '@civ-clone/core-unit/UnitRegistry';
import { expect } from 'chai';

class Elected extends Government {}
class MoreElected extends Government {}
class Appointed extends Government {}

class Soldier extends Unit {}
class Flyer extends Unit {}
class Envoy extends Unit {}

const table: MilitaryUnhappinessTable = [
    [Elected, 1],
    [MoreElected, 2],
  ],
  playerGovernment = (government: Government): PlayerGovernment =>
    ({
      is: (...GovernmentTypes: (typeof Government)[]) =>
        GovernmentTypes.some(
          (GovernmentType) => government instanceof GovernmentType
        ),
    } as unknown as PlayerGovernment),
  // Stand-ins: a city and the units it supports, each `[UnitType, attack, at home]`.
  setUp = (...units: [typeof Unit, number, boolean][]) => {
    const home = {},
      away = {},
      city = { tile: () => home } as unknown as City,
      supported = units.map(
        ([UnitType, attack, atHome], index): Unit =>
          Object.assign(Object.create(UnitType.prototype), {
            id: () => `unit-${index}`,
            attack: () => ({ value: () => attack }),
            tile: () => (atHome ? home : away),
          }) as Unit
      ),
      unitRegistry = {
        getByCity: (cityToFind: unknown) =>
          cityToFind === city ? supported : [],
      } as unknown as UnitRegistry;

    return { city, supported, unitRegistry };
  },
  civilOptions = {
    neverAggressive: (unit: Unit) => unit instanceof Envoy,
    aggressiveAnywhere: (unit: Unit) => unit instanceof Flyer,
  };

describe('militaryUnhappiness', (): void => {
  it('finds the unhappiness per unit for the player’s government, or 0', (): void => {
    expect(
      militaryUnhappinessPerUnit(table, playerGovernment(new Elected()))
    ).equal(1);
    expect(
      militaryUnhappinessPerUnit(table, playerGovernment(new MoreElected()))
    ).equal(2);
    expect(
      militaryUnhappinessPerUnit(table, playerGovernment(new Appointed()))
    ).equal(0);
  });

  it('counts units with an attack that are away, or that count anywhere, but not those that never count', (): void => {
    const { city, supported, unitRegistry } = setUp(
        [Soldier, 1, false],
        [Soldier, 1, true],
        [Soldier, 0, false],
        [Flyer, 4, true],
        [Envoy, 1, false]
      ),
      aggressive = (unit: Unit, city: City) =>
        isAggressive(unit, city, civilOptions);

    expect(aggressiveUnits(city, aggressive, unitRegistry)).eql([
      supported[0],
      supported[3],
    ]);
    // With no options, only units away with an attack.
    expect(aggressiveUnits(city, isAggressive, unitRegistry)).eql([
      supported[0],
      supported[4],
    ]);
  });

  it('makes perUnit citizens unhappy for each aggressive unit', (): void => {
    const { city, supported, unitRegistry } = setUp(
        [Soldier, 1, false],
        [Soldier, 1, true],
        [Soldier, 3, false]
      ),
      yields = militaryUnhappiness(city, 2, isAggressive, unitRegistry);

    expect(yields.map((cityYield) => cityYield.value())).eql([2, 2]);
    expect(yields.map((cityYield) => cityYield.unit())).eql([
      supported[0],
      supported[2],
    ]);
  });

  it('spares what the exemption hook returns, leaving out units wholly spared', (): void => {
    const { city, supported, unitRegistry } = setUp(
        [Soldier, 1, false],
        [Flyer, 1, false]
      ),
      spared: [Unit, City][] = [],
      yields = militaryUnhappiness(
        city,
        2,
        isAggressive,
        unitRegistry,
        (unit, cityToSpare) => {
          spared.push([unit, cityToSpare]);

          return unit instanceof Flyer ? 2 : 1;
        }
      );

    expect(spared).eql([
      [supported[0], city],
      [supported[1], city],
    ]);
    expect(
      yields.map((cityYield) => [cityYield.unit(), cityYield.value()])
    ).eql([[supported[0], 1]]);
  });
});
