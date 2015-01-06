// Load modules
var Hoek = require('hoek');


// Declare internals
var internals = {};


var generatePlayer = function (rawPlayer) {

    if (!rawPlayer.pro_status || rawPlayer.pro_status === 'U') {
        return null;
    }

    var player = {
        name: rawPlayer.fullname,
        id: rawPlayer.id,
        team: rawPlayer.pro_team,
        positions: Hoek.reach(rawPlayer, 'profile.eligible_positions'),
        photo: rawPlayer.photo,
        status: rawPlayer.pro_status
    }

    return player;
};

module.exports = internals.players = {
    handler: function (request, reply) {

        var db = request.server.app.db;

        db.get('players', function (err, players) {

            if (err) {
                return reply(Boom.internal(err));
            }

            var filteredPlayers = [];
            for (var i = 0, il = players.length; i < il; ++i) {
                var player = players[i];
                var filteredPlayer = generatePlayer(player);

                if (filteredPlayer) {
                    filteredPlayers.push(filteredPlayer);
                }
            }

            var players = filteredPlayers;
            var filteredPlayers = {};
            for (var i = 0, il = players.length; i < il; ++i) {
                var player = players[i];
                var status = player.status;
                var positions = player.positions;

                if (!positions || !status) {
                    console.log(':: PLAYER MISSING DETAILS ::', player);
                    continue;
                }

                for (var j = 0, jl = positions.length; j < jl; ++j) {
                    var position = positions[j];

                    if (!filteredPlayers[status]) {
                        filteredPlayers[status] = {};
                    }

                    if (!filteredPlayers[status][position]) {
                        filteredPlayers[status][position] = [];
                    }

                    filteredPlayers[status][position].push(player);
                }
            }

            reply(filteredPlayers);
        });
    }
};


/*
{
    firstname: 'Kyle',
    on_waivers: 0,
    photo: 'http://sports.cbsimg.net/images/players/unknown_hat.gif',
    position: 'RP',
    lastname: 'Crick',
    age: 22,
    pro_status: 'M',
    jersey: '47',
    fullname: 'Kyle Crick',
    id: '1947854',
    pro_team: 'SF',
    profile: {
        season_outlook: {
            created: null,
            outlook: null,
            modified: null
        },
        firstname: 'Kyle',
        free_agent: 1,
        on_waivers: 0,
        photo: 'http://sports.cbsimg.net/images/players/unknown_hat.gif',
        position: 'RP',
        lastname: 'Crick',
        age: 22,
        eligible_positions: [ 'RP' ],
        roster_trends: {
            start_pct: 0,
            owned_pct: 6
        },
        id: '1947854',
        profile_link: '<a class=\'playerLink\' href=\'http://929-h2h-points.baseball.cbssports.com/players/playerpage/1947854\'>Crick, Kyle</a> <span class="playerPositionAndTeam">RP | SF</span>',
        latest_update: {
            timestamp: '1403796212',
            players: [Object],
            author: [Object],
            news: 'Giants pitching prospect <a class="playerLink" href="/players/playerpage/1947854">Kyle Crick</a> struck out 10 hitters Wednesday during a minor-league start.&nbsp;\n<p>It was a totally dominant start. Crick had trouble with his control, walking five batters. Due to that, he was limited to just five innings. Crick only allowed one hit during the outing, so he was dominant when he was throwing strikes. Crick is currently in Double-A. He has a 3.52 ERA over 53 2/3 innings.</p>\n',
            type: null,
            id: '24598272',
            title: 'Kyle Crick strikes out 10'
        },
        pro_status: 'M',
        headshot_image: 'http://sports.cbsimg.net/images/players/unknown_hat.gif',
        profile_url: 'http://929-h2h-points.baseball.cbssports.com/players/playerpage/1947854',
        jersey: '47',
        fullname: 'Kyle Crick',
        pro_team: 'SF'
    }
} */
