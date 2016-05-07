'use strict';

var express = require('express');
var exphbs  = require('express-handlebars');
var path = require('path');
var bodyParser = require('body-parser');

var startServer = (options) =>  {

    let server, app, hbs;

    app = express();
    app.use(bodyParser.json());       // to support JSON-encoded bodies
    app.use(bodyParser.urlencoded());
    app.use(require('./routes'));
    app.use('/public', express.static(path.join(__dirname, 'kasse')));

    hbs = exphbs.create({
        defaultLayout: 'main',
        helpers: {
            ifNotData: function(a) {
                if (a && a.length > 0) {
                    return false;
                }
                return true;
            },
            isIsSameNumber: function(a, b) {
                return parseInt(a) === parseInt(b) ? 'selected' : false;
            },
            ifEquals: function(a, b, options) {
                if (a === b) {
                    return options.fn(this);
                }
                return options.inverse(this);
            },
            ifStringEquals: function(a, b, options) {
                if (a.toString().toLowerCase() === b.toString().toLowerCase()) {
                    return options.fn(this);
                }

                return options.inverse(this);
            },
            ifGreaterZero: function(a, options) {
                if (parseFloat(a)>0) {
                    return options.fn(this);
                }

                return options.inverse(this);
            },
            isCathrin: function(item) {
                console.log('item : ', item);
                return item.forename.toString().toLowerCase() === 'cathrin';
            },
            isMarek: function(item) {
                console.log('item : ', item);
                return item.forename.toString().toLowerCase() === 'marek';
            }
        },

        // Uses multiple partials dirs, templates in "shared/templates/" are shared
        // with the client-side of the app (see below).
        partialsDir: [
            'views/templates/'
        ]
    });
    app.engine('handlebars', hbs.engine);
    app.set('view engine', 'handlebars');
    app.set('/views', express.static(__dirname + '/views'));

    server = app.listen(options && options.port || 3000, () => {
            console.log('App listening on port 3000!');
    });

};

startServer();
// module.exports = function(options) {
//     return startServer(options);
// };

