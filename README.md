# base-government-military-unhappiness

Military unhappiness: under some governments, a city's aggressive units make its citizens unhappy.

- `lib/militaryUnhappiness`:
  - `MilitaryUnhappinessTable`: `[Government, perUnit][]`. `militaryUnhappinessPerUnit(table, playerGovernment)` finds
    the player's number, or 0.
  - `isAggressive(unit, city, { neverAggressive?, aggressiveAnywhere? })`: a unit with an attack that's away from its
    home city, or is a kind that counts anywhere, and isn't a kind that never counts. `aggressiveUnits(city,
    aggressive?, unitRegistry?)` lists the ones a city supports.
  - `militaryUnhappiness(city, perUnit, aggressive?, unitRegistry?, exemption?)`: a `MilitaryUnhappiness` yield (from
    `base-city-yield-military-unhappiness`) per aggressive unit. `exemption(unit, city)` is the hook for what spares
    some of that unhappiness (a police station, say): it returns how many citizens to spare for the unit, and a unit
    that's wholly spared gives no yield. The default, `noExemption`, spares none.

A library: it registers no rules, so a ruleset keeps its own rules, governments and numbers. See
`civ1-city-happiness` for Civilization's.
