/**
 * Created with JetBrains PhpStorm.
 * User: Lee
 * Date: 05/08/13
 * Time: 22:00
 * To change this template use File | Settings | File Templates.
 */
var mongo = require('mongodb');
var mongoose = require('mongoose');

var Server = mongo.Server,
//    Db = mongo.Db,
    BSON = mongo.BSONPure;

//var server = new Server('localhost', 27017, {auto_reconnect: true});
var db = mongoose.connect('localhost:27017/winedb').connection;


var wineSchema = mongoose.Schema({
    name: String,
    year: Number,
    grapes: String,
    country: String,
    region: String,
    description: String,
    picture: String
}, {safe:true});

var Wine = mongoose.model('Wine', wineSchema);

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback (err) {
    if(!err) {
        console.log("Connected to 'winedb' database");
        Wine.find().exec(function(err, collection) {
            if (err) {
                console.log("The 'wines' collection doesn't exist. Creating it with sample data...");
                populateDB();
            }
        });
    }
});

exports.findById = function(req, res) {
    var id = req.params.id;
    console.log('Retrieving wine: ' + id);
    Wine.findById(new BSON.ObjectID(id), function(err, item) {
        console.log('Found: ' + item);
        res.send(item);
    });
};

exports.findAll = function(req, res) {
    Wine.find().exec(function(err, items) {
        res.send(items);
    });
};

exports.addWine = function(req, res) {
    var wine = req.body;
    console.log('Adding wine: ' + JSON.stringify(wine));
    Wine.create(wine, function(err, result) {
        if (err) {
            res.send({'error':'An error has occurred'});
        } else {
            console.log('Success: ' + JSON.stringify(result[0]));
            res.send(result[0]);
        }
    });
};

exports.updateWine = function(req, res) {
    var id = req.params.id;
    var wine = req.body;
    console.log('Updating wine: ' + id);
    console.log(JSON.stringify(wine));
    Wine.update({'_id':new BSON.ObjectID(id)}, wine, {}, function(err, result) {
        if (err) {
            console.log('Error updating wine: ' + err);
            res.send({'error':'An error has occurred'});
        } else {
            console.log('' + result + ' document(s) updated');
            res.send(wine);
        }
    });
};

exports.deleteWine = function(req, res) {
    var id = req.params.id;
    console.log('Deleting wine: ' + id);
    Wine.findByIdAndRemove(new BSON.ObjectID(id), function(err, result) {
        if (err) {
            res.send({'error':'An error has occurred - ' + err});
        } else {
            console.log('' + result + ' document(s) deleted');
            res.send(req.body);
        }
    });
};

/*--------------------------------------------------------------------------------------------------------------------*/
// Populate database with sample data -- Only used once: the first time the application is started.
// You'd typically not find this code in a real-life app, since the database would already exist.
var populateDB = function() {

    Wine.create(
        {
            name: "CHATEAU DE SAINT COSME",
            year: "2009",
            grapes: "Grenache / Syrah",
            country: "France",
            region: "Southern Rhone",
            description: "The aromas of fruit and spice...",
            picture: "saint_cosme.jpg"
        },
        {
            name: "LAN RIOJA CRIANZA",
            year: "2006",
            grapes: "Tempranillo",
            country: "Spain",
            region: "Rioja",
            description: "A resurgence of interest in boutique vineyards...",
            picture: "lan_rioja.jpg"
        },
        function(err, result) {}
    );
};