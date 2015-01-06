// Load modules
var Boom = require('boom');
var Insync = require('insync');
var Joi = require('joi');
var Levelup = require('levelup');
var Path = require('path');


// Declare internals
var internals = {};


var db = Levelup(Path.join(__dirname, '../../data/kgfc'), { valueEncoding: 'json' });

module.exports = internals.routes = [
{
    method: 'GET',
    path: '/keepers',
    handler: function (request, reply) {

        db.get('keepers', function (err, keepers) {

            if (err) {
                return reply(Boom.internal(err));
            }

            reply(keepers);
        });
    }
},
{
    method: 'GET',
    path: '/rosters',
    handler: function (request, reply) {

        db.get('rosters', function (err, rosters) {

            if (err) {
                return reply(Boom.internal(err));
            }

            reply(rosters);
        });
    }
},
{
    method: 'GET',
    path: '/finalrosters',
    handler: function (request, reply) {

        db.get('finalRosters', function (err, finalRosters) {

            if (err) {
                return reply(Boom.internal(err));
            }

            reply(finalRosters);
        });
    }
},
{
    method: 'GET',
    path: '/compare',
    handler: function (request, reply) {

        reply.view('compare');
    }
},
{
    method: 'POST',
    path: '/update',
    config: {
        validate: {
            payload: {
                previous: Joi.string().required(),
                update: Joi.string().required()
            }
        },
        handler: function (request, reply) {

            var getKeepers = function (next) {

                db.get('keepers', next);
            };

            var updatePlayer = function (keepers, next) {

                var playerUpdated = false;
                for (var i = 0, il = keepers.length; i < il; ++i) {
                    if (keepers[i].name === request.payload.previous) {
                        keepers[i].name = request.payload.update;
                        playerUpdated = true;
                    }
                }

                var err = null;
                if (!playerUpdated) {
                    err = new Error('Player not found');
                }

                next(err, keepers);
            };

            var updateKeepers = function (keepers, next) {

                db.put('keepers', keepers, next);
            };

            var getFinalRosters = function (keepers, next) {

                db.get('finalRosters', function (err, finalRosters) {

                    next(err, keepers, finalRosters);
                });
            };

            var getRosters = function (keepers, finalRosters, next) {

                db.get('rosters', function (err, rosters) {

                    next(err, keepers, finalRosters, rosters);
                });
            };

            var updateLists = function (keepers, finalRosters, rosters, next) {

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

                next(null, keepers, finalRosters, rosters);
            };

            var updateFinalRosters = function (keepers, finalRosters, rosters, next) {

                db.put('finalRosters', finalRosters, function (err) {

                    next(err, keepers, rosters);
                });
            };

            var updateRosters = function (keepers, rosters, next) {

                db.put('rosters', rosters, function (err) {

                    next(err, keepers);
                });
            };

            Insync.waterfall([
                getKeepers,
                updatePlayer,
                updateKeepers,
                getKeepers,
                getFinalRosters,
                getRosters,
                updateLists,
                updateFinalRosters,
                updateRosters,
                updateKeepers
                ], function (err) {

                    if (err) {
                        console.log(':: ERR ::', err)
                        return reply(Boom.internal(err));
                    }

                    return reply({ status: 'OK' });
                });
            }
        }
    },
    {
        method: 'GET',
        path: '/',
        handler: function (request, reply) {

            db.get('rosters', function (err, rosters) {

                if (err) {
                    return reply(Boom.internal(err));
                }

                rosters = rosters.sort(function (a,b) {

                    if (a.team > b.team) {
                        return 1;
                    }

                    return 0;
                });

                return reply.view('viewkeepers', { players: rosters });
            });
        }
    },
    {
        method: 'GET',
        path: '/cbs',
        handler: function (request, reply) {

            console.log(':: REQUEST ::', request)
            reply('OK');
        }
    },
    {
        method: 'GET',
        path: '/{param*}',
        handler: {
            directory: {
                path: Path.join(__dirname, '../public')
            }
        }
    }
    ];
