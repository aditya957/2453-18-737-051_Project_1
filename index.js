var express = require("express");
var app = express();

let server = require('./server');
let middleware = require('./middleware');
let config = require('./config');
const response = require('express');

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended : true}));
app.use(bodyParser.json());

const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb://127.0.0.1:27017';
const dbName = 'hospitalInventory';

let db

MongoClient.connect(url, { useUnifiedTopology: true },(err, client) => {
    if (err) return console.log(err);
    db = client.db(dbName);
    console.log(`Connected Database : ${url}`);
    console.log(`Database : ${dbName}`);
});


app.get('/ventilatorDetails', middleware.checkToken, (req, res) =>{
    console.log("Fetching ventilator details");
    var data = db.collection('ventilator').find().toArray().then(result => res.json(result));
});

app.get('/hospitalDetails', middleware.checkToken, (req, res) => {
    console.log("Fetching hospital details");
    var data = db.collection('hospital').find().toArray().then(result => res.json(result));
});

app.post('/searchbystatus', middleware.checkToken,  (req, res) => {
    var status = req.body.status;
    console.log(status);
    var ventilatordetails = db.collection('ventilator').find({"status" : status}).toArray().then(result => res.json(result));
});

app.post('/searchbyventname', middleware.checkToken,  (req,res) => {
    var name = req.query.name;
    console.log(name);
    var ventilatordetails = db.collection('ventilator').find({"name": new RegExp(name, 'i')}).toArray().then(result => res.json(result));
});

app.post('/searchbyhospital', middleware.checkToken, (req,res) => {
    var name = req.query.name;
    console.log(name);
    var hospitaldetails = db.collection('hospital').find({"name" : new RegExp(name, 'i')}).toArray().then(result => res.json(result));
});

app.put('/updateventilator', middleware.checkToken, (req,res) =>{
    var ventid = {ventilatorId : req.body.ventilatorId};
    console.log(ventid);
    var newvalues = { $set : {status : req.body.status} };
    db.collection('ventilator').updateOne(ventid, newvalues, function(err, result) {
        if(err) throw err;
        res.json("1 Updated");
    });
});

app.post('/addventilatorbyuser', middleware.checkToken,  (req,res) => {
    var hId = req.body.hId;
    var ventilatorId = req.body.ventilatorId;
    var status = req.body.status;
    var name = req.body.name;

    var item =
    {
        hId:hId, ventilatorId:ventilatorId, status:status, name:name
    };

    db.collection('ventilator').insertOne(item, function(err, result) {

        res.json("Item Inserted");
    });
});

app.delete('/delete', middleware.checkToken,  (req,res) => {
    var ventilatorId = req.query.ventilatorId;
    console.log(ventilatorId);

    var myquery1 = { ventilatorId: ventilatorId};
    db.collection('ventilator').deleteOne(myquery1, function(err, obj) {
        if(err) throw err;
        res.json("1 document deleted");
    });
});

app.listen(3000);