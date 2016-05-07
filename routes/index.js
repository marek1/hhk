'use strict';

var express = require('express');
var router = express.Router();

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
    console.log('month : ',req.body.month, ' year ',req.body.year);
    console.log('req.body: ',req.body);
    // save the user
    Payment.find({
        $and : [
            {
                month: parseInt(req.body.month)
            },{
                year: parseInt(req.body.year)
            }
        ]
    }, function (err, docs) {
        //console.log('err : ',err);
        console.log('docs : ', docs);
        var total = {
            cathrin: 0,
            overCathrin: 0,
            marek: 0,
            overMarek: 0
        };
        docs.map(function(x){
            console.log('x : ',x);
            if (x.forename.toString().toLowerCase() === 'cathrin'){
                total.cathrin+=x.amount;
            }
            if (x.forename.toString().toLowerCase() === 'marek'){
                total.marek+=x.amount;
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

});

router.get('/edit/:id', (req, res) => {
    console.log('id : ', req.params.id);
    // save the user
    Payment.find({ _id: req.params.id}, function (err, docs) {
        console.log('docs : ', docs);

        if (!err) {
            res.render('edit', {title: 'Kasse', editData: docs[0]});
        } else {
            res.render('error', {title: 'Kasse'});
        }
    });
});

router.post('/update', (req, res) => {
    var _payment = req.body;
    // save the uservar _payment = req.body;
    _payment.amount = parseFloat(_payment.amount.toString().replace(',','.'));
    var _id = _payment._id;
    delete _payment._id;
    // save the user
    Payment.findOneAndUpdate({_id: _id}, _payment, function (err, docs) {
        console.log('docs : ', docs);
        if (!err) {
            res.render('index', {title: 'Kasse'});
        } else {
            res.render('error', {title: 'Kasse'});
        }
    });
});

router.get('/delete/:id', (req, res) => {
    console.log('id : ', req.params.id);
    // save the user
    Payment.remove({ _id: req.params.id}, function (err, docs) {
        console.log('docs : ', docs);
        if (!err) {
            res.render('index', {title: 'Kasse'});
        } else {
            res.render('error', {title: 'Kasse'});
        }
    });
});

router.post('/insert', (req, res) => {
    console.log('req.body: ',req.body);
    var _payment = req.body;
    _payment.amount = parseFloat(_payment.amount.toString().replace(',','.'));
    var newPayment = Payment(_payment);
    // save the user
    newPayment.save(function (err) {
        if (!err) {
            res.render('index', {title: 'Kasse'});
        } else {
            res.render('error', {title: 'Kasse'});
        }
    });
});


module.exports = router;