'use strict';

var auth = require('basic-auth');
var express = require('express');
var router = express.Router();


var checkLogin = function (req) {

    var credentials = auth(req);

    if (!credentials || credentials.name !== 'test' || credentials.pass !== '1234') {
        return false;
    } else {
        return true;
    }

};

/******************************************
 * MONGOOSE
 ******************************************/

var mongoose = require('mongoose');
//mongoose.connect('localhost', 'triathloncollection2');
mongoose.connect('mongodb://localhost/haushaltskasse');
var Schema = mongoose.Schema;

/*****************************************
 * EVENTS (before : Triathlons)
 *****************************************/

var paymentSchema = new Schema({
    forename: String,
    description: String,
    amount: Number,
    month: Number,
    year: Number
});

var Payment = mongoose.model('Payment', paymentSchema);

router.get('/', (req, res) => {
    res.render('index', {title: 'Kasse'});
});

router.post('/monat', (req, res) => {
    if (!checkLogin(req)) {
        res.statusCode = 401;
        res.setHeader('WWW-Authenticate', 'Basic realm="example"');
        // res.end('Access denied');
        res.render('error', {title: 'Nicht eingeloggt'});
    } else {
        console.log('month : ', req.body.month, ' year ', req.body.year);
        console.log('req.body: ', req.body);
        // save the user
        Payment.find({
            $and: [
                {
                    month: parseInt(req.body.month)
                }, {
                    year: parseInt(req.body.year)
                }
            ]
        }, function(err, docs) {
            //console.log('err : ',err);
            console.log('docs : ', docs);
            var total = {
                cathrin: 0,
                overCathrin: 0,
                marek: 0,
                overMarek: 0
            };
            docs.map(function(x) {
                console.log('x : ', x);
                if (x.forename.toString().toLowerCase() === 'cathrin') {
                    total.cathrin += x.amount;
                }
                if (x.forename.toString().toLowerCase() === 'marek') {
                    total.marek += x.amount;
                }
            });
            total.cathrin = parseFloat(total.cathrin).toFixed(2);
            total.marek = parseFloat(total.marek).toFixed(2);
            total.overCathrin = parseFloat(total.cathrin - total.marek).toFixed(2);
            total.overMarek = parseFloat(total.marek - total.cathrin).toFixed(2);
            if (!err) {
                res.render('index', {title: 'Kasse', month: req.body.month, data: docs, total: total});
            } else {
                res.render('error', {title: 'Kasse'});
            }
        });
    }
});

router.get('/edit/:id', (req, res) => {
    if (!checkLogin(req)) {
        res.statusCode = 401;
        res.setHeader('WWW-Authenticate', 'Basic realm="example"');
        // res.end('Access denied');
        res.render('error', {title: 'Nicht eingeloggt'});
    } else {
        // save the user
        Payment.find({ _id: req.params.id}, function (err, docs) {
            console.log('docs : ', docs);
            if (!err) {
                res.render('edit', {title: 'Kasse', editData: docs[0]});
            } else {
                res.render('error', {title: 'Kasse'});
            }
        });
    }
});

router.post('/update', (req, res) => {
    if (!checkLogin(req)) {
        res.statusCode = 401;
        res.setHeader('WWW-Authenticate', 'Basic realm="example"');
        // res.end('Access denied');
        res.render('error', {title: 'Nicht eingeloggt'});
    } else {
        var _payment = req.body;
        _payment.amount = parseFloat(_payment.amount.toString().replace(',','.'));
        var _id = _payment._id;
        delete _payment._id;
        // save the user
        Payment.findOneAndUpdate({_id: _id}, _payment, function (err, docs) {
            console.log('docs : ', docs);
            if (!err) {
                res.render('index', {title: 'Kasse'});
            } else {
                res.render('error', {title: 'Konnte nicht geupdated werden'});
            }
        });
    }
});

router.get('/delete/:id', (req, res) => {
    if (!checkLogin(req)) {
        res.statusCode = 401;
        res.setHeader('WWW-Authenticate', 'Basic realm="example"');
        // res.end('Access denied');
        res.render('error', {title: 'Nicht eingeloggt'});
    } else {
        Payment.remove({_id: req.params.id}, function(err, docs) {
            console.log('docs : ', docs);
            if (!err) {
                res.render('index', {title: 'Kasse'});
            } else {
                res.render('error', {title: 'Konnte nicht geloescht werden'});
            }
        });
    }
});

router.post('/insert', (req, res) => {
    if (!checkLogin(req)) {
        res.statusCode = 401;
        res.setHeader('WWW-Authenticate', 'Basic realm="example"');
        // res.end('Access denied');
        res.render('error', {title: 'Nicht eingeloggt'});
    } else {
        var _payment = req.body;
        _payment.amount = parseFloat(_payment.amount.toString().replace(',', '.'));
        var newPayment = Payment(_payment);
        newPayment.save(function(err) {
            if (!err) {
                res.render('index', {title: 'Kasse', successMessage: 'Erfolgreich eingefuegt'});
            } else {
                res.render('error', {title: 'Konnte nicht gespeichert werden'});
            }
        });
    }
});


module.exports = router;