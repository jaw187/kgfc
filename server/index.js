// Load modules
var Hapi = require('hapi');
var Handlebars = require('handlebars');
var Levelup = require('levelup');
var Path = require('path');


// Load libraries
var routes = require('./routes');


// Decalre internals
var internals = {}


var server = new Hapi.Server();

server.connection({ port: 10700 });


var viewOptions = {
    engines: {
        html: Handlebars
    },
    layout: true,
    layoutPath: Path.join(__dirname, 'views/layouts'),
    path: Path.join(__dirname, 'views'),
    isCached: false
};

server.views(viewOptions)


server.route(routes);


server.app.db = Levelup(Path.join(__dirname, '../data/kgfc'), { valueEncoding: 'json' });;

server.start(function () {

    console.log('Server started ... Neat deal')
});
