const { randomInt } = require('crypto');

var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

var users = 0;
var messages = [];
var userlistdict = {};
var usertocolor = {};

app.get('/', (req, res) => {
    res.sendFile('C:\\Users\\Evan\\Documents\\GitHub\\ChatApp\\index.html');
});

io.on('connection', (socket) => {
    months = ['Jan', 'Feb', 'Mar' , 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
    io.emit('any cookie');

    socket.on('chat message', (msg, user) => {
        if(msg.startsWith("/name ")){
            var msgsplit = msg.split(' ');
            var unique = true;
            for(i = 0; i < messages.length; i++){
                if(messages[i]['user'] == msgsplit[1]){
                   unique = false;
                }
            }
            if(unique){
                userlistdict[socket.id] = msgsplit[1];
                usertocolor[msgsplit[1]] = usertocolor[user];
                delete usertocolor[user];
                for(i = 0; i < messages.length; i++){
                    if(messages[i]['user'] == user){
                        messages[i]['user'] = msgsplit[1];
                    } 
                }

                io.emit('nameupdate', user, msgsplit[1]);
                io.emit('refresh userlist', userlistdict);
                io.emit('update cookie', msgsplit[1], usertocolor[msgsplit[1]]);
                io.emit('clear messages');

                for(i = 0; i < messages.length; i++){
                    io.emit('chat message', messages[i]['time'], messages[i]['user'], messages[i]['color'], messages[i]['message']);
                }
            }
        } else if(msg.startsWith("/color ")){
            var msgsplit = msg.split(' ');
            usertocolor[user] = msgsplit[1];
            for(i = 0; i < messages.length; i++){
               if(messages[i]['user'] == user){
                   messages[i]['color'] = usertocolor[user];
               }
            }

            io.emit('refresh userlist', userlistdict)
            io.emit('update cookie', user, usertocolor[user]);
            io.emit('clear messages');

            for(i = 0; i < messages.length; i++){
                io.emit('chat message', messages[i]['time'], messages[i]['user'], messages[i]['color'], messages[i]['message']);
            }
        } else {
            date = new Date();
            timestamp = months[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
            msg = msg.replace(':(','🙁');
            msg = msg.replace(':)','😁');
            msg = msg.replace(':O','😲');

            io.emit('chat message', timestamp, user, usertocolor[user], msg);
            messages.push({"time":timestamp, "user":user, "color":usertocolor[user], "message":msg});
        }
    });

    socket.on('refresh', (user) => {
        if(user === 'none'){
            user = "User" + users;
            io.emit('nameupdate', 'notused', user);
            users += 1;
            userlistdict[socket.id] = user;
            usertocolor[user] = '#000000';
            io.emit('update cookie', user, usertocolor[user]);
        }
        io.emit('refresh userlist', userlistdict)
        io.emit('clear messages');
        for(i = 0; i < messages.length; i++){
            io.emit('chat message', messages[i]['time'], messages[i]['user'], messages[i]['color'], messages[i]['message']);
        }
    });

    socket.on('disconnect', ()=>{
        delete userlistdict[socket.id];
        io.emit('refresh userlist', userlistdict)
    });

    socket.on('got cookie', (user,color) => {
        usertocolor[user] = color;
        userlistdict[socket.id] = user;
        io.emit('refresh userlist', userlistdict)
        io.emit('clear messages');

        for(i = 0; i < messages.length; i++){
            io.emit('chat message', messages[i]['time'], messages[i]['user'], messages[i]['color'], messages[i]['message']);
        }
    });

  });

http.listen(3000, () => {
    console.log('listening on *:3000');
});