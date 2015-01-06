// Load modules
var Boom = require('boom');
var Insync = require('insync');
var Joi = require('joi');
var Path = require('path');

var Players = require('./players');


// Declare internals
var internals = {};


module.exports = internals.routes = [
    {
        method: 'GET',
        path: '/players',
        config: Players
    },
    {
        method: 'GET',
        path: '/playeruniverse',
        handler: function (request, reply) {

            reply.view('players')
        }
    },
    {
        method: 'GET',
        path: '/rosters',
        handler: function (request, reply) {

            var db = request.server.app.db;
            db.get('rosters', function (err, rosters) {

                if (err) {
                    return reply(Boom.internal(err));
                }

                rosters = rosters.sort(function (a,b) {

                    if (a.team < b.team) {
                        return -1;
                    }

                    if (a.team === b.team && a.round < b.round) {
                        return -1;
                    }

                    return 1;
                });

                return reply.view('rosters', { players: rosters });
            });
        }
    },
    {
        method: 'GET',
        path: '/',
        handler: function (request, reply) {

            reply('OK')
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
