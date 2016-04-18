angular.module('meanchat', [])

    //Denne service er kopieret fra http://www.html5rocks.com/en/tutorials/frameworks/angular-websockets/
    .service('socket', function ($rootScope) {
        var socket = io.connect();
        return {
            on: function (eventName, callback) {
                socket.on(eventName, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        callback.apply(socket, args);
                    });
                });
            },
            emit: function (eventName, data, callback) {
                socket.emit(eventName, data, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        if (callback) {
                            callback.apply(socket, args);
                        }
                    });
                });
            }
        };
    })

    //.factory('usersFactory', function(){
    //
    //    var onlineusers = [];
    //
    //    return {
    //        getOnlineusers: function returnOnlineUsers() {
    //            return onlineusers;
    //        },
    //        addOnlineusers: function addOnlineUsers(user) {
    //            onlineusers.push(user);
    //        },
    //        removeUser: function removeUser(user){
    //            onlineusers.splice(onlineusers.indexOf(user),1);
    //        }
    //    };
    //
    //})

    .filter("reverseFilter", function () {
        return function (items) {
            return items.slice().reverse(); // Create a copy of the array and reverse the order of the items
        };
    })

    .controller('mainController', ['socket', '$window', function (socket, $window) {

        var scope = this;

        scope.messages = [];

        scope.onlineusers = [];

        scope.sendDisabled = true;

        scope.haveChosenUsername = false;

        scope.loggedOut = false;

        scope.showLogout = false;

        scope.showUsersAndTextInput = false;

        var thisUser;

        if ($window.localStorage.username) {
            thisUser = $window.localStorage.username;
            scope.haveChosenUsername = true;
            scope.loggedOut = false;
            scope.sendDisabled = false;
            scope.showLogout = true;
            scope.showUsersAndTextInput = true;
            socket.emit('message', thisUser + " is back!");
        }


        //newUser sendes til serveren, og gemmes i en array liste
        scope.newuser = function () {

            $window.localStorage.username = scope.usernameInput;
            socket.emit('newuser', scope.usernameInput);
            thisUser = scope.usernameInput;
            socket.emit('message', scope.usernameInput + " logged on!");

            scope.haveChosenUsername = true;
            scope.loggedOut = false;
            scope.sendDisabled = false;
            scope.showLogout = true;
            scope.showUsersAndTextInput = true;
        };

        scope.logout = function () {
            socket.emit('logout', thisUser);
            scope.loggedOut = true;
            socket.emit('message', thisUser + " logged out!");
            $window.localStorage.removeItem('username');
        };

        //Her sendes en besked
        scope.sendMessage = function () {

            var currentdate = new Date();
            var datetime = currentdate.getDate() + "/"
                + (currentdate.getMonth() + 1) + "/"
                + currentdate.getFullYear() + " @ "
                + currentdate.getHours() + ":"
                + currentdate.getMinutes() + ":"
                + currentdate.getSeconds();

            var messageWithUser = datetime + " - " + thisUser + " says: " + scope.messageInput;

            socket.emit('message', messageWithUser); //Sendes til serveren, og gemmes i et array derpå.
            scope.messageInput = ''; //inputfeltet cleares.
        };

        ////Når en besked modtages fra serveren, smides indholdet ind i messages-arrayet.
        //socket.on('message', function (message) {
        //    //scope.messages.push({
        //    //    //Vi giver beskeden en body - den skal fanges på message.body i html'en.
        //    //    msg: message
        //    //});
        //    console.log("message received and pushed!");
        //});

        socket.on('allMessages', function (messages) { //det lokale message-array opdateres hvergang en ny besked bliver sendt til serveren.
            scope.messages = messages;
            console.log("MESSAGES: " + scope.messages);
        });


        socket.on('userlist', function (users) {
            scope.onlineusers = users;
            console.log("USERLIST: " + scope.onlineusers);
        });

        //Når en ny bruger sendes til serveren, sendes denne ud til alle via "broadcast", incl liste af online users.
        socket.on('newuser', function (usernameInput) {
            console.log("user received and pushed!");
        });

    }]);