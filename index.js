/**
 * Created by Jorta on 25/06/2017.
 */
const SubStringCommands = require('./subStringCommands').SubStringCommands;
const Messaging = require('./messaging').Messaging;
const Logger = require('./logger').Logger;
const Commands = require('./commands').Commands;
const MusicCommands = require('./musicCommands').MusicCommands;
const Discord = require('discord.js');

let _haruna = new Discord.Client({'autoReconnect': true});

//intervals
let _hourlyInterval = null;

//string arrays of files
module.exports.pouts = require('./paths/pouts.json').paths;
module.exports.smugs = require('./paths/smugs.json').paths;
module.exports.selfies = require('./paths/selfies.json').paths;
module.exports.idleTexts = require('./paths/idles.json').paths;
module.exports.comfortTexts = require('./paths/comforts.json').paths;

let _hourlyTexts = require('./texts/hourly.json').texts;


module.exports.deleteMessagesFromChannel = function(numberOfMessages, channel) {
    let response = '';
    channel.bulkDelete(numberOfMessages)
        .then(message => {
            Logger.log('SUCCESS', 'deleted 100 messages from ' + channel);
        }).catch(reason => {
            response = 'Something went wrong on my end. Oops desu!';
            Logger.log('ERROR', `Something went wrong purging messages: ${reason} desu :c`);
        });
    return response;
};

module.exports.shutdownGracefully = function(channel) {
    _sendShutdownMessage(channel);
    let response = '';
    _haruna.destroy()
        .catch(error => {
            response = 'Something went wrong shutting down desu! :c';
            Logger.log('ERROR', 'error shutting down: ' + error);
        });
    return response;
};

let _sendShutdownMessage = function(channel) {
    Messaging.sendTextMessageToChannel('Goodnight Teitoku <3', channel);
};

module.exports.generateSelfInvite = function(channel) {
    _haruna.generateInvite(238283776)
        .then(link => {
            Logger.log('INFO', 'Invite link sent to ' + channel + '<3');
            Messaging.sendTextMessageToChannel(`You can invite me from ${link} desu! <3`, channel);
        }).catch(reason => {
            Logger.log('ERROR', `Error generating invite ${reason}`);
            Messaging.sendTextMessageToChannel('Oops, something went wrong desu! :c', channel);
        });
};

module.exports.setGameWithResponse = function(game) {
    let response = '';
    response = _setGameWithResponse(game);
    return response;
};

module.exports.setInterval = function(type, channelToMessage) {
   let interval = 60000; //60000 = one minute
    if(type === 'hourly') {
        _hourlyInterval = _haruna.setInterval(_hourlyNotifications, interval, channelToMessage);
    }
};

module.exports.clearInterval = function(type) {
    if(type === 'hourly') {
        _haruna.clearInterval(_hourlyInterval);
    }
};

//***********************
//Bot start up
//***********************
_haruna.on('ready', function() {
    Logger.log('INFO', 'Haruna is standing by in ' + _haruna.guilds.size + ' guilds!');
    _setGameWithResponse('');
});

let _setGameWithResponse = function(game) {
    let playing, response = '';
    if(game.length > 1) {
        playing = game;
    } else {
        playing = `Jortathlon's Secretary Ship`;
    }

    let status = {
        status: 'online',
        afk: false,
        game: {
            name: playing,
            url: ''
        }
    };

    _haruna.user.setPresence(status).then(user => {
        Logger.log('INFO', `Set game to ${user.presence.game.name}`);
        response = 'Game set! <3';
    }).catch(error => {
        Logger.log('ERROR', 'Something went wrong setting the game: ' + error + ' :c');
        response =  `Game not set, check the captain's log <3`;
    });

    return response;
};

let _hourlyNotifications = function(channelToMessage) {
    let now = new Date();
    let currentTime = _formatTime(now.getUTCMinutes(), now.getUTCHours());
    console.log(currentHour + ':' + currentMinute.toFixed(2) + ': called #_hourlyNotifications');

    if(currentTime.minute === 0) {
        let response = _hourlyTexts[parseInt(currentTime.hour)];
        Messaging.sendTextMessageToChannel(response, channelToMessage);
    }
};

let _formatTime = function(currentMinute, currentHour) {
    if(currentMinute < 10) {
        currentMinute = '0' + currentMinute;
    }
    if(currentHour < 10) {
        currentHour = '0' + currentHour;
    }

    return {hour: currentHour, minute: currentMinute};
};

//***********************
//Message received
//***********************
_haruna.on('message', function(message) {
    let response = '';

    if(_isGenericCommand(message.content)) {
        response = Commands.processMessageIfCommandExists(message);
    } else if(_isMusicCommand(message.content)) {
        response = MusicCommands.processMessageIfCommandExists(message);
    } else {
        response = SubStringCommands.processMessageIfCommandExists(message);
    }

    if(_hasResponseToGive(response)) {
        _respondViaChannel(response, message.channel);
    }

    // if(message.content.includes('+play')) {
    //     let song = message.content.slice(6);
    //     Logger.log('MUSIC', 'got a request');
    //     const voiceChannel = message.member.voiceChannel;
    //     if(!voiceChannel) {
    //         _respondViaChannel('Please be in a voice channel first desu! <3', message.channel);
    //     } else {
    //         voiceChannel.join()
    //             .then(connection => {
    //                 Logger.log('MUSIC', 'connected to ' + voiceChannel.name);
    //                 const stream = yt(song, {audioonly: true});
    //                 const dispatcher = connection.playStream(stream);
    //                 dispatcher.on('end', () => {
    //                     Logger.log('MUSIC', 'left ' + message.channel);
    //                     voiceChannel.leave();
    //                 });
    //             })
    //             .catch(error => {
    //                 Logger.log('ERR', error);
    //                 _respondViaChannel('there was an error desu! ;c' ,message.channel);
    //             });
    //     }
    // }
});

let _isGenericCommand = function(content) {
    return content.indexOf('-') === 0; //The '-' character is the command character e.g. '-hello'
};

let _isMusicCommand = function(content) {
    return content.indexOf('+') === 0; //Different command for music
};

let _hasResponseToGive = function(response) {
    return (response !== '') && _thereWasNoFuckUp(response);
};

let _thereWasNoFuckUp = function(hopefullyThisIsAString) {
    return hopefullyThisIsAString !== undefined;
};

let _respondViaChannel = function(response, channel) {
    if(_isImage(response)) {
        Messaging.sendImageToChannel(response, channel);
    } else {
        Messaging.sendTextMessageToChannel(response, channel);
    }
};

let _isImage = function(response) {
    return response.endsWith(".png") || response.endsWith(".jpg") || response.endsWith(".gif")
        || response.endsWith(".jpeg");
};


//***********************
//Guild join
//***********************
_haruna.on('guildCreate', function(guild) {
    Logger.log('INFO', 'Haruna has joined ' + guild.name + '! Now standing by in ' + _haruna.guilds.size + ' guilds! <3');
});


//***********************
//Guild leave
//***********************
_haruna.on('guildDelete', function(guild) {
    Logger.log('INFO', 'Haruna has left ' + guild.name + '! Now standing by in ' + _haruna.guilds.size + ' guilds! <3');
});

//load token from auth.json
_haruna.login(require('./auth.json').harunaLogin)
    .then(message => {
        Logger.log('INFO', 'Login success! \<3');
    })
    .catch(error => {
        Logger.log('INFO', 'Login failed: ' + error + ' :c');
    });