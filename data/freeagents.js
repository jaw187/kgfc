
var Levelup = require('levelup');


var db = Levelup('./kgfc', { valueEncoding: 'json' });

var exceptions = {
    'Carlos Rondon' : 0,
    'Francisco Lindor' : 16,
    'Miguel Sano' : 16,
    'Jon Singleton' : 16
};

var round = 11;

var updateRoster = function () {

    db.get('finalRosters', function (err, finalRosters) {

        if (err) {
            return console.log(':: ERR ::', err);
        }

        db.get('rosters', function (err, rosters) {

            if (err) {
                return console.log(':: ERR ::', err);
            }

            for (var i = 0, il = finalRosters.length; i < il; ++i) {
                var player = finalRosters[i];
                player.round = round;

                if (exceptions[player.name]) {
                    player.round = exceptions[player.name];
                }

                rosters.push(player);
            }

            db.put('rosters', rosters, function (err) {

                if (err) {
                    return console.log(':: ERR ::', err);
                }

                console.log(':: FIN ::');
            });
        });
    });
};

updateRoster();
