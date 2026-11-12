"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.militaryUnhappiness = exports.noExemption = exports.aggressiveUnits = exports.isAggressive = exports.militaryUnhappinessPerUnit = void 0;
const UnitRegistry_1 = require("@civ-clone/core-unit/UnitRegistry");
const MilitaryUnhappiness_1 = require("@civ-clone/base-city-yield-military-unhappiness/MilitaryUnhappiness");
/** How many citizens each aggressive unit makes unhappy under the player's government: 0 if it isn't in the table. */
const militaryUnhappinessPerUnit = (table, playerGovernment) => {
    var _a, _b;
    return (_b = (_a = table.find(([GovernmentType]) => playerGovernment.is(GovernmentType))) === null || _a === void 0 ? void 0 : _a[1]) !== null && _b !== void 0 ? _b : 0;
};
exports.militaryUnhappinessPerUnit = militaryUnhappinessPerUnit;
/**
 * Whether a unit supported by `city` is aggressive: it has an attack, and is away from the city, or is a kind that
 * counts anywhere.
 */
const isAggressive = (unit, city, { neverAggressive = () => false, aggressiveAnywhere = () => false, } = {}) => !neverAggressive(unit) &&
    unit.attack().value() > 0 &&
    (aggressiveAnywhere(unit) || unit.tile() !== city.tile());
exports.isAggressive = isAggressive;
/** The units `city` supports that are aggressive, in the order the unit registry has them. */
const aggressiveUnits = (city, aggressive = exports.isAggressive, unitRegistry = UnitRegistry_1.instance) => unitRegistry.getByCity(city).filter((unit) => aggressive(unit, city));
exports.aggressiveUnits = aggressiveUnits;
const noExemption = () => 0;
exports.noExemption = noExemption;
/**
 * A `MilitaryUnhappiness` yield for each aggressive unit `city` supports, of `perUnit` less what `exemption` spares,
 * leaving out a unit that's wholly exempt.
 */
const militaryUnhappiness = (city, perUnit, aggressive = exports.isAggressive, unitRegistry = UnitRegistry_1.instance, exemption = exports.noExemption) => (0, exports.aggressiveUnits)(city, aggressive, unitRegistry)
    .map((unit) => [unit, perUnit - exemption(unit, city)])
    .filter(([, value]) => value > 0)
    .map(([unit, value]) => new MilitaryUnhappiness_1.default(value, unit));
exports.militaryUnhappiness = militaryUnhappiness;
//# sourceMappingURL=militaryUnhappiness.js.map