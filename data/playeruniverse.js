// Load modules
var Hoek = require('hoek');
var Insync = require('insync');
var Levelup = require('levelup');
var Wreck = require('wreck');


// Declare internals
var internals = {};


internals.url = 'http://api.cbssports.com/fantasy/players/';
internals.querystring = 'access_token=U2FsdGVkX1-Z-aURUwVNVeTjSJAsnx374EB0il6_qIJEFkb3lQ3IBAgbqpZ6ttNVIFCzpdYBf5bA8A9-ATM6leKTG3eAyIgXiQauOp9IS1qPbXV22tbTE47mHTCu3ct0' +
                        '&user_id=5b3ce5c3c046646b' +
                        '&SPORT=baseball' +
                        '&league_id=929-h2h-points' +
                        '&response_format=json' +
                        '&version=3.0';

var db = Levelup('./kgfc', { valueEncoding: 'json' });

var wreckOptions = {
    timeout: 60000
}

var getPlayers = function (next) {

    var url = internals.url + 'list?' + internals.querystring;
    Wreck.get(url, wreckOptions, function (err, response, payload) {

        if (err) {
            return next(err);
        }

        try {
            payload = JSON.parse(payload);
        }
        catch (error) {
            return next(error);
        }

        var players = Hoek.reach(payload, 'body.players')
        console.log(':: GOT PLAYERS ::', players.length)
        next(null, players);
    });
};

var getProfiles = function (players, next) {

    var failedPlayers = [];
    var finishedPlayers = [];

    var getProfile = function (player, next) {

        var url = internals.url + 'profile?' + internals.querystring + '&player_id=' + player.id;
        Wreck.get(url, wreckOptions, function (err, response, payload) {

            console.log(player.fullname);

            if (err) {
                failedPlayers.push(player);
                return next();
            }

            try {
                payload = JSON.parse(payload);
            }
            catch (error) {
                failedPlayers.push(player);
                return next();
            }

            player.profile = Hoek.reach(payload, 'body.player_profile.player');
            finishedPlayers.push(player);

            next();
        });
    };

    Insync.mapLimit(players, 100, getProfile, function (err) {

        next(err, failedPlayers, finishedPlayers);
    });
};

var saveFailedPlayers = function (failedPlayers, players, next) {

    console.log(':: FAILED PLAYERS COUNT ::', failedPlayers.length);
    console.log(':: SUCCESSFUL PLAYERS COUNT ::', players.length);

    db.put('failedPlayers', failedPlayers, function (err) {

        next(err, players);
    });
};

var savePlayers = function (players, next) {

    db.put('players', players, next);
}

var initData = function () {

    var start = new Date();

    Insync.waterfall([
        getPlayers,
        getProfiles,
        saveFailedPlayers,
        savePlayers
    ], function (err) {

        console.log(':: START ::', start)
        console.log(':: END   ::', new Date());

        if (err) {
            return console.log(':: ERR ::', err);
        }

        console.log(':: FIN ::');
    });
};

var getFailedPlayers = function (next) {

    db.get('failedPlayers', next);
};

var getExistingPlayers = function (finishedPlayers, next) {

    db.get('players', function (err, players) {

        if (err) {
            return next(err)
        }

        var updatedPlayers = players.concat(finishedPlayers);

        next(null, updatedPlayers);
    });
};

var retryFailed = function () {

    Insync.waterfall([
        getFailedPlayers,
        getProfiles,
        saveFailedPlayers,
        getExistingPlayers,
        savePlayers
    ], function (err) {

        if (err) {
            return console.log(':: ERR ::', err);
        }

        console.log(':: FIN ::');
    });
};

//initData();
retryFailed();

// http://api.cbssports.com/fantasy/players/list?version=3.0&SPORT=baseball&response_format=json
// http://api.cbssports.com/fantasy/players/profile?player_id=2044523&version=3.0&response_format=json&access_token=U2FsdGVkX1-Z-aURUwVNVeTjSJAsnx374EB0il6_qIJEFkb3lQ3IBAgbqpZ6ttNVIFCzpdYBf5bA8A9-ATM6leKTG3eAyIgXiQauOp9IS1qPbXV22tbTE47mHTCu3ct0&user_id=5b3ce5c3c046646b&SPORT=baseball&league_id=929-h2h-points
