/*
  godex.js
  a javascript library for pokemon go
*/

// Define Godex [Data]
var godex = {
  pokemon: pokemon,
  types: types,
  levels: levels,
  moves: moves,
  appraise: appraise,
  gymtool: gymtool
};

// Build and Return Library
(function(godex) {
  // simple function to clean keys
  var key = function(string) {
      if (typeof string !== "string") return string;
      else return string
        .replace(".", "")
        .replace(" ", "-")
        .replace("'", "")
        .toLowerCase();
    },
    rnd = function(num) {
      return Math.round(num * 100) / 100;
    };

  var build = function(thing, data, modifier) {

    if (thing == "pokemon") {
      // Don't build out data for self-referenced things
      // this is to save time, so when we get a pokemon here,
      // we don't build it, just get the data.
      if (!modifier) {
        data.count = 1;
        data.offense = {};
        data.defense = {};
        data.moves = {
          quick: {},
          charge: {}
        };
        var pokeLoop = {
          // this is just me being lazy
          // and coding an array to loop through
          // rather than sort through all of
          // these with individual loops, add them
          // all to an object and then just loop that
          "halfTo": "offense",
          "halfFrom": "defense",
          "twiceTo": "offense",
          "twiceFrom": "defense"
        };

        // for each type the pokemon is
        for (var _type in data.type) {
          var x, type = godex.types[data.type[_type]];

          // now we loop through that loop up there
          for (x in pokeLoop) {
            for (var i = 0;i < type[x].length;i++) {
              var key = pokeLoop[x],
                target = type[x][i],
                score = data[key][target];
              if (x.indexOf("half") > -1) {
                // if a score isn't assigned, we assign it the score
                if (!score) data[key][target] = 0.8;
                else data[key][target] = rnd(data[key][target] * 0.8);
                // but if a score is assigned, multiply it.
              } else {
                if (!score) data[key][target] = 1.25;
                else data[key][target] = rnd(data[key][target] * 1.25);
              }
            }
          }
        }

        // Calculate this Pokemon's Max CP
        var maxAtk = data.stats.attack + 15;
        var maxDef = Math.pow(data.stats.defense + 15, 0.5);
        var maxSta = Math.pow(data.stats.stamina + 15, 0.5);
        var maxMod = Math.pow(godex.levels["40"].cpm, 2);
        data.maxCP = Math.floor(maxAtk * (maxDef * maxSta * maxMod) / 10);

        // Let's build out the evolves!
        data.evolves = {};
        var m1, m2, m3, e1 = [], e2 = [], e3 = [];

        // Does this pokemon evolve from something?
        if (data.evolveFrom) {
          m1 = dex.get("pokemon", data.evolveFrom, 1);
        } else if (data.evolveTo) {
          data.evolves.current = 1;
          m1 = { evolveTo: data.evolveTo, current: true };
        } else {
          data.evolves.current = 1;
          m1 = { current: true, only: true };
        }
        if (m1) e1.push(m1);

        // Make sure THAT pokemon doesn't evolve from something...
        if (m1.evolveFrom) {
          m2 = e1;
          m1 = dex.get("pokemon", e1.evolveFrom, 1);
        }

        // If we have stage 1, check for stage 2
        if (m1 && !m2 && m1.evolveTo) {
          if (Array.isArray(m1.evolveTo)) {
            for (var to in m1.evolveTo) {
              m2 = dex.get("pokemon", m1.evolveTo[to], 1);
              if (m2.name == data.name ) {
                data.evolves.current = 2;
                e2.push({ current: true, evolveTo: m2.evolveTo });
              } else {
                e2.push(m2);
              }
            }
          } else {
            m2 = dex.get("pokemon", m1.evolveTo, 1);
            if (m2.name == data.name) {
              data.evolves.current = 2;
              e2.push({ current: true, evolveTo: m2.evolveTo });
            } else {
              e2.push(m2);
            }
          }
        }

        // If we have stage 2, check for stage 3
        if (m1 && m2 && m2.evolveTo) {
          m3 = dex.get("pokemon", m2.evolveTo, 1);
          if (m3.name == data.name) {
            m3 = { current: true };
            data.evolves.current = 3;
          }
        }
        if (m3) e3.push(m3);

        if (e1.length) data.evolves.stageOne = e1;
        if (e2.length) data.evolves.stageTwo = e2;
        if (e3.length) data.evolves.stageThree = e3;

        // Let's build the moves!
        for (var _qm in data.quickMoves) {
          var qm = data.quickMoves[_qm];
          data.moves.quick[qm] = dex.get("move", qm, data.type);
        }

        for (var _cm in data.chargeMoves) {
          var cm = data.chargeMoves[_cm];
          data.moves.charge[cm] = dex.get("move", cm, data.type);
        }

        // Figure out best move!
        var best = 0;
        for (var _mq in data.moves.quick) {
          var mq = data.moves.quick[_mq];
          if (mq.offenseADPS) {
            if (mq.offenseADPS > best) {
              best = mq.offenseADPS;
              data.moves.bestQuick = _mq;
            }
          } else {
            if (mq.offenseDPS > best) {
              best = mq.offenseDPS;
              data.moves.bestQuick = _mq;
            }
          }
        }

        best = 0;
        for (var _mc in data.moves.charge) {
          var mc = data.moves.charge[_mc];
          if (mc.offenseADPS) {
            if (mc.offenseADPS > best) {
              best = mc.offenseADPS;
              data.moves.bestCharge = _mc;
            }
          } else {
            if (mc.offenseDPS > best) {
              best = mc.offenseDPS;
              data.moves.bestCharge = _mc;
            }
          }
        }
      }
    }

    if (thing == "move" || thing == "moves") {
      data.offenseDPS = rnd(data.attack / data.cooldown);
      data.defenseDPS = rnd(data.attack / (data.cooldown + 2));
      if (modifier) {
        // check for STAB
        if (modifier.indexOf(data.type) > -1) {
          // Apply Stab!
          data.offenseADPS = rnd(data.offenseDPS * 1.25);
          data.defenseADPS = rnd(data.defenseDPS * 1.25);
        }
      }
    }

    return data;
  };

  // Fetch data
  var get = function() {
    var args = arguments;
    if (!args.length) return { method: "get", err: "No arguments passed." };

    var result = false, search, subtype = false,
      target = args.length > 1 ? args[1] : args[0], modifier = args[2],
      location = args.length > 1 ? args[0].toLowerCase() : "pokemon";

    // Subproperty Location?
    if (location.indexOf(".") > -1) {
      subtype = location.split(".")[1];
      location = location.split(".")[0];
      search = godex[location];
    } else {
      if (location == "type") location = "types";
      if (location == "move") location = "moves";
      if (location == "level") location = "levels";
      search = godex[location];
    }

    if (!search) return { method: "get", err: "Couldn't find: " + location };

    // If subproperty, get it!
    if (subtype) {
      result = [];
      for (var subtypes in search) {
        var fetch = search[subtypes],
          _data = fetch[subtype];
        fetch.key = subtypes;
        if (!_data) {
          return { method: "get", err: "Couldn't find subtype: " + subtype };
        }
        if (Array.isArray(_data)) {
          if (_data.indexOf(target.toLowerCase()) > -1) result.push(fetch);
        } else if (isNaN(_data)) {
          if (_data.toLowerCase() == target.toLowerCase()) result.push(fetch);
        } else {
          if (_data == target) result.push(fetch);
        }
      }
      return result;
    }
    // Are we just fetching the data?
    if (target == "all") return search;

    // Or a list of the data?
    if (target == "list") {
      result = [];
      for (var thing in search) {
        if (search[thing].name) {
          result.push({
            key: thing,
            name: search[thing].name
          });
        } else {
          result.push({
            key: thing,
            data: search[thing]
          });
        }
      }
      return result;
    }

    // Is it as simple as a key?
    if (search[key(target)]) result = search[key(target)];

    // Well, let's look deeper
    for (var query in search) {
      // Is it a name?
      if (search[query].name == target) result = search[query];

      // Or an ID?
      if (search[query].id == parseInt(target)) result = search[query];
    }

    if (result) {
      // do some building
      result = build(location, result, modifier);
    } else {
      result = { method: "get", err: "Couldn't find: " + target };
    }
    return result;
  };

  // Appraise a pokemon
  var appraise = function(options) {
    options.pokemon = get(options.pokemon);
    if (!options.pokemon) return { method: "appraise", err: "Poke Not Found" };
    if (!options.cp) return { method: "appraise", err: "CP Not Entered" };
    if (!options.hp) return { method: "appraise", err: "HP Not Entered" };
    if (!options.dust) return { method: "appraise", err: "Dust Not Entered" };

    options.levels = get("levels.dust", options.dust);
    if (!options.levels.length) return { method: "appraise", err: "Dust Invalid" };

    return godex.appraise(options);
  };

  // define the Library
  var dex = {
    get: get,
    gym: gymtool,
    appraise: appraise,

    aZ: [ "A","B","C","D","E","F","G","H","I","J","K",
        "L","M","N","O","P","R","S","T","V","W","Z" ],

    dustLevels: [ 200, 400, 600, 800, 1000, 1300, 1600, 1900, 2200, 2500,
      3000, 3500, 4000, 4500, 5000, 6000, 7000, 8000, 9000, 10000 ]
  };

  // Export to node or the browser, whichever is being used!
  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = dex;
  else
    window.dex = dex;
})(godex || {});
