var init = function () {
    var Levelup = require('levelup');

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

    var ops = [
        { type: 'put', key: 'rosters', value: rosters },
        { type: 'put', key: 'keepers', value: keepers },
        { type: 'put', key: 'finalRosters', value: finalRosters }
    ];

    db.put('rosters', rosters, function (err) {

        db.put('keepers', keepers, function (err) {

            db.put('finalRosters', finalRosters, function (err) {


            });
        });
    });
};

//init();
