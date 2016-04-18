var mongoose = require('mongoose');

var connection = mongoose.connect('mongodb://meanchat:meanchat@ds011311.mlab.com:11311/meanchat', function(err){
    if(err){
        console.log("Failed to connect to db! ----- " + err);
    } else {
        console.log("Connected to db!");

    }
});

exports.connection = connection;