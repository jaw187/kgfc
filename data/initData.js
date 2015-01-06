var Levelup = require('levelup');
var Insync = require('insync');


var init = function () {

    var db = Levelup('./kgfc', { valueEncoding: 'json' });

    var keepers = require('./keepervalue.json');
    var finalRosters = require('./finalrosters.json');

    var rosters = [];

    for (var i = 0, il = finalRosters.length; i < il; ++i) {
        var player = finalRosters[i];

        for (var j = 0, jl = keepers.length; j < jl; ++j) {
            var keeper = keepers[j];

            if (keeper.name === player.name) {
                player.round = keeper.round;

                rosters.push(player);

                finalRosters.splice(i,1);
                --i;
                --il;

                keepers.splice(j,1);
                --j;
                --jl;

                continue;
            }
        }
    }

    var updateRosters = function (next) {

        db.put('rosters', rosters, next);
    };

    var updateKeepers = function (next) {

        db.put('keepers', keepers, next);
    };

    var updateFinalRosters = function (next) {

        db.put('finalRosters', finalRosters, next);
    };

    Insync.waterfall([
        updateRosters,
        updateKeepers,
        updateFinalRosters
    ], function (err) {

        if (err) {
            return console.log(':: ERR ::', err);
        }

        console.log(':: FIN ::');
    });
};

//init();
