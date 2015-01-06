// Load modules
var Insync = require('insync');
var Levelup = require('levelup');


// Declare internals
var internals = {};


var db = Levelup('./kgfc', { valueEncoding: 'json' });

db.get('players', function (err, players) {

    console.log(':: LENGTH ::', players.length);

    var i = 1000;
    console.log(':: PLAYER ::', players[i]);
});
