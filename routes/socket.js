var MsgLog = require('../model/log');

var onlineUsers = [];
var messages = [];


module.exports = function (socket) {

    ////Når der kommer noget ind fra en socket (on), som hedder 'message', skal denne sendes ud (emit).
    //socket.on('message', function(message){
    //    console.log(message);
    //    //broadcast sender til alle, men ikke dig selv
    //    socket.broadcast.emit('message', message);
    //    //emit sender til dig selv.
    //    socket.emit('message', message);
    //});

    socket.on('message', function (message) {
        //broadcast('message', message);
        messages.push(message);
        broadcast('allMessages', messages);
        broadcast('userlist', onlineUsers);
        console.log(messages);

        //SAVE TO DB-LOG
        var newMessage = new MsgLog({
            message: message
        });
        // save the message
        newMessage.save(function (err) {
            if (err) {
                throw(err);
                console.log(err)
            } else {
                console.log("Message logged in db!")
            }
        });
        //LOG END

    });

    socket.on('newuser', function (user) {

        //var currentdate = new Date();
        //var datetime = currentdate.getDate() + "/"
        //    + (currentdate.getMonth()+1)  + "/"
        //    + currentdate.getFullYear() + " @ "
        //    + currentdate.getHours() + ":"
        //    + currentdate.getMinutes() + ":"
        //    + currentdate.getSeconds();

        //broadcast('newuser', user);
        onlineUsers.push(user);
        //broadcast('message', datetime + " - " + user + " logged on!");
        broadcast('userlist', onlineUsers);
        console.log("USERS: " + onlineUsers);
    });

    socket.on('logout', function (user) {

        //var currentdate = new Date();
        //var datetime = currentdate.getDate() + "/"
        //    + (currentdate.getMonth()+1)  + "/"
        //    + currentdate.getFullYear() + " @ "
        //    + currentdate.getHours() + ":"
        //    + currentdate.getMinutes() + ":"
        //    + currentdate.getSeconds();

        //broadcast('message', datetime + " - " + user + " logged out!");
        onlineUsers.splice(onlineUsers.indexOf(user), 1);
        //onlineUsers.remove(user);
        broadcast('userlist', onlineUsers);
        console.log("USERS: " + onlineUsers);
    });

    //Vi kan lave koden dynamisk, så den bliver sendt videre, afhængigt af hvilken type vi sender med:
    function broadcast(type, payload) {
        socket.broadcast.emit(type, payload); //Sender til alle andre
        socket.emit(type, payload); //Sender tilbage til afsenderen
    }


};

