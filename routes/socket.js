var MsgLog = require('../model/log');

var onlineUsers = [];
var messages = [];


module.exports = function (socket) {

    //Når der kommer en besked ind til serveren
    socket.on('message', function (message) {
        messages.push(message); //gemmer beskeden i arrayet af meddelelser.
        broadcast('allMessages', messages); //Sender en liste med alle beskederne til frontend.
        broadcast('userlist', onlineUsers); //Sender en opdateret liste af brugere til frontend, hvergang en ny besked kommer eller en "info besked" kommer ind.
        console.log(messages);

        //----SAVE TO DB-LOG----
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
        //-------LOG END-------

    });


    //Når en ny bruger logger ind
    socket.on('newuser', function (user) {
        onlineUsers.push(user); //Tilføjer useren til online brugere
        broadcast('userlist', onlineUsers); //Sender listen til frontend.
        console.log("USERS: " + onlineUsers);
    });

    //Når en bruger logger ud
    socket.on('logout', function (user) {
        onlineUsers.splice(onlineUsers.indexOf(user), 1); //fjerner brugeren i arrayet med online users
        broadcast('userlist', onlineUsers); //Sender listen til frontend.
        console.log("USERS: " + onlineUsers);
    });


    //Vi kan lave koden dynamisk, så den bliver sendt videre, afhængigt af hvilken type vi sender med:
    function broadcast(type, payload) {
        socket.broadcast.emit(type, payload); //Sender til alle andre
        socket.emit(type, payload); //Sender tilbage til afsenderen
    }


};

