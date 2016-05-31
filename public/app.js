angular.module('meanchat', [])

    //Denne service er kopieret fra http://www.html5rocks.com/en/tutorials/frameworks/angular-websockets/
    .service('socket', function ($rootScope) {
        var socket = io.connect();
        return {
            on: function (eventName, callback) {
                socket.on(eventName, function () { //on = når noget modtages
                    var args = arguments;
                    $rootScope.$apply(function () {
                        callback.apply(socket, args);
                    });
                });
            },
            emit: function (eventName, data, callback) {
                socket.emit(eventName, data, function () { //emit = når noget sendes
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
    //------------------------------------------------------------------------------------------------------

    //Vænner arrayet om, så seneste beskeder ligger øverst.
    .filter("reverseFilter", function () {
        return function (items) {
            return items.slice().reverse(); // Create a copy of the array and reverse the order of the items
        };
    })

    .controller('mainController', ['socket', '$window', function (socket, $window) { //Socket servicen injectes

        var scope = this;

        scope.messages = [];

        scope.onlineusers = [];

        scope.sendDisabled = true;

        scope.haveChosenUsername = false;

        scope.loggedOut = false;

        scope.showLogout = false;

        scope.showUsersAndTextInput = false;

        var thisUser;

        //Hvis brugeren findes i localStorage
        if ($window.localStorage.username) {
            thisUser = $window.localStorage.username;
            scope.haveChosenUsername = true;
            scope.loggedOut = false;
            scope.sendDisabled = false;
            scope.showLogout = true;
            scope.showUsersAndTextInput = true;
            socket.emit('message', thisUser + " is back!");
        }

        //-----------OUTGOING-----------

        //Hvis ikke brugeren findes i localStorage
        scope.newuser = function () {

            $window.localStorage.username = scope.usernameInput; //username gemmes i localStorage
            socket.emit('newuser', scope.usernameInput); //New user sendes til serveren, og gemmes i dennes array over brugere.
            thisUser = scope.usernameInput;
            socket.emit('message', scope.usernameInput + " logged on!"); //Besked sendes til serveren, som sender videre til alle.

            scope.haveChosenUsername = true;
            scope.loggedOut = false;
            scope.sendDisabled = false;
            scope.showLogout = true;
            scope.showUsersAndTextInput = true;
        };

        //Log ud
        scope.logout = function () {
            socket.emit('logout', thisUser); //Brugeren fjernes fra arrayet.
            scope.loggedOut = true;
            socket.emit('message', thisUser + " logged out!");
            $window.localStorage.removeItem('username'); //username fjernes fra localStorage
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

            socket.emit('message', messageWithUser); //Sendes til serveren, og gemmes i et array derpå. Serveren sender beskeden retur til alle.
            scope.messageInput = ''; //inputfeltet cleares.
        };


        //-----------INCOMING-----------

        socket.on('allMessages', function (messages) { //Arrayet med alle beskederne opdateres fra serveren, når der sker ændringer.
            scope.messages = messages;
            console.log("MESSAGES: " + scope.messages);
        });

        //Når en ny userliste sendes ind fra sereren.
        socket.on('userlist', function (users) {
            scope.onlineusers = users; //Opdaterer userlisten på frontend - listen sendes af serveren, hvergnag der sker ændringer.
            console.log("USERLIST: " + scope.onlineusers);
        });

        //Når en ny bruger sendes til serveren, sendes denne ud til alle via "broadcast", incl liste af online users.
        socket.on('newuser', function (usernameInput) {
            console.log("user received and pushed!");
        });

    }]);