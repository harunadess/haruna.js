/**
 * Created by Jorta on 25/06/2017.
 */
const SubStringCommands = require('./commands/subStringCommands').SubStringCommands;
const Messaging = require('./messaging').Messaging;
const Logger = require('./logger').Logger;
const Commands = require('./commands/commands').Commands;
const MusicCommands = require('./commands/musicCommands').MusicCommands;
const ConversationEngine = require('./commands/conversations');
const Discord = require('discord.js');
const fs = require('fs');

let _haruna = new Discord.Client({ 'autoReconnect': true });

//local storage (in json)
let _jsonLocalStorage = null;
//intervals
let _hourlyInterval = null;
//conversation engine
let _conversationEngine = null;
let _conversationEngineActive = false;

try {
    _hourlyInterval = require('./json/localStorage.json').intervals.hourly.intervalChannel;
} catch(error) {
    Logger.log('ERROR', 'JSON error reading intervals.hourly.intervalChannel: ' + error);
    _hourlyInterval = null;
}

//string arrays of files
module.exports.pouts = require('./json/paths/pouts.json').paths;
module.exports.smugs = require('./json/paths/smugs.json').paths;
module.exports.selfies = require('./json/paths/selfies.json').paths;
module.exports.idleTexts = require('./json/paths/idles.json').paths;
module.exports.comfortTexts = require('./json/paths/comforts.json').paths;

let _hourlyTexts = require('./json/hourly.json').texts;


module.exports.deleteMessagesFromChannel = function(numberOfMessages, channel) {
    let response = '';
    channel.bulkDelete(numberOfMessages, true)
        .then(message => {
            Logger.log('SUCCESS', 'deleted 100 messages from ' + channel);
        }).catch(reason => {
        response = 'Something went wrong on my end :c';
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
            Logger.log('INFO', 'Invite link sent to ' + channel + ' <3');
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

module.exports.toggleIntervals = function(type, channelToMessage) {
    let response = '';
    if(type === 'hourly') {
        if(!_hourlyInterval) {
            _setInterval(type, channelToMessage);
            response = `Set hourly messages! Use \`\`-hourly\`\` again to disable! <3`;
        } else {
            _clearInterval(type, channelToMessage);
            _hourlyInterval = null;
            _jsonLocalStorage = require('./json/localStorage.json');
            _jsonLocalStorage.intervals.hourly = undefined;
            _writeObjectToLocalStorage(_jsonLocalStorage);
            response = `Cleared hourly messages! Use \`\`-hourly\`\` again to enable! <3`;
        }
    } else {
        //handle other types
    }
    return response;
};

module.exports.setConversationEngineActive = function() {
    _conversationEngineActive = !_conversationEngineActive;
    if(_conversationEngineActive) {
        return `Haruna will now chat with you! <3`;
    } else {
        return `Haruna will return to only responding to commands! <3`;
    }
};

let _writeObjectToLocalStorage = function(obj) {
    let jsonObj = JSON.stringify(obj, null, 2);
    fs.writeFile('./json/localStorage.json', jsonObj, err => {
        if(err) {
            Logger.log('ERROR', 'There was an error writing to json file: ' + err);
            return;
        }
        Logger.log('FS', 'Successfully wrote to storage! <3');
    });
};


//***********************
//Bot start up
//***********************
_haruna.on('ready', function() {
    Logger.log('INFO', 'Haruna is standing by in ' + _haruna.guilds.size + ' guilds!');
    _init();
});

let _init = function() {
    _setGameWithResponse();
    _setInterval();
    _conversationEngine = new ConversationEngine.ConversationEngine();
};

let _setGameWithResponse = function(game) {
    let playing, response = '';
    if(game !== undefined) {
        playing = game;
        _jsonLocalStorage = require('./json/localStorage.json');
        _jsonLocalStorage.info.nowPlaying = playing;
        _writeObjectToLocalStorage(_jsonLocalStorage);
    } else {
        try {
            playing = require('./json/localStorage.json').info.nowPlaying;
            Logger.log('FS', 'Successfully read nowPlaying from storage!');
        } catch(error) {
            Logger.log('FS', 'Error reading from storage: ' + error);
            playing = 'Jortathlon\'s Secretary Ship <3';
        }
    }

    let status = {
        status: 'online',
        afk: false,
        game: {
            name: playing,
            url: 'http://kancolle.wikia.com/wiki/Haruna'
        }
    };

    _haruna.user.setPresence(status).then(user => {
        Logger.log('INFO', `Set game to ${user.presence.game.name}`);
        response = 'Game set! <3';
    }).catch(error => {
        Logger.log('ERROR', 'Something went wrong setting the game: ' + error + ' :c');
        response = `Game not set, check the captain's log <3`;
    });

    return response;
};

let _setInterval = function(type, channelToMessage) {
    let minute = 60000;
    if(type !== undefined && channelToMessage !== undefined) {
        if(type === 'hourly') {
            _hourlyInterval = _haruna.setInterval(_hourlyNotifications, minute, channelToMessage);
            _jsonLocalStorage = require('./json/localStorage.json');
            _jsonLocalStorage.intervals.hourly = {
                "id": channelToMessage.id,
                "username": channelToMessage.username,
                "discriminator": channelToMessage.discriminator,
                "avatar": channelToMessage.avatar,
                "bot": channelToMessage.bot,
                "lastMessageID": channelToMessage.lastMessageID,
                "lastMessage": channelToMessage.lastMessage.toString()
            };
            _writeObjectToLocalStorage(_jsonLocalStorage);
        }
        Logger.log('FS', 'Successfully saved interval to local storage! <3');
    } else {
        try {
            _jsonLocalStorage = require('./json/localStorage.json');
            let JSONData = _jsonLocalStorage.intervals.hourly;
            if(JSONData !== undefined) {
                let data = {
                    id: JSONData.id,
                    username: JSONData.username,
                    discriminator: JSONData.discriminator,
                    avatar: JSONData.avatar,
                    bot: JSONData.bot,
                    lastMessageID: JSONData.lastMessageID,
                    lastMessage: JSONData.lastMessage
                };
                let user = new Discord.User(_haruna, data);
                if(user.username === undefined) {
                    Logger.log('FS', 'No stored interval data');
                } else {
                    _hourlyInterval = _haruna.setInterval(_hourlyNotifications, minute, user);
                    Logger.log('FS', `Set intervals for user ${user.username}! <3`);
                }
            }
        } catch(error) {
            Logger.log('ERROR', 'Error creating data obj for interval: ' + error);
        }
    }
};

let _hourlyNotifications = function(channelToMessage) {
    let now = new Date();
    let currentTime = {
        hour: now.getHours(),
        minute: now.getUTCMinutes()
    };

    if(currentTime.minute === 0) {
        let response = _hourlyTexts[currentTime.hour];
        Messaging.sendTextMessageToChannel(response, channelToMessage);
    }
};

let _clearInterval = function(type) {
    if(type === 'hourly') {
        _haruna.clearInterval(_hourlyInterval);
    }
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
        if(_conversationEngineActive && response === '') {
            response = _conversationEngine.respond(message);
        }
    }

    if(_thereWasNoFuckUp(response)) {
        if(_hasResponseToGive(response)) {
            _respondViaChannel(response, message.channel);
        }
    }
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
    return (typeof hopefullyThisIsAString) === 'string';
};

let _respondViaChannel = function(response, channel) {
    if(_isImage(response)) {
        Messaging.sendImageToChannel(response, channel);
    } else {
        Messaging.sendTextMessageToChannel(response, channel);
    }
};

let _isImage = function(response) {
    return response.endsWith(".png") || response.endsWith(".jpg")
        || response.endsWith(".gif") || response.endsWith(".jpeg");
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


//***********************
//Disconnect
//***********************
_haruna.on('disconnect', function(reason) {
    Logger.log('INFO', 'Haruna has disconnected: ' + JSON.stringify(reason));
});


//***********************
//Reconnect
//***********************
_haruna.on('reconnecting', function(connect) {
    Logger.log('INFO', 'Haruna is reconnecting... <3 ' + JSON.stringify(connect));
});


//***********************
//Error
//***********************
_haruna.on('error', function(error) {
    Logger.log('ERROR', `Haruna encountered a problem: ${error}`);
});


//load token from auth.json
_haruna.login(require('./json/auth.json').harunaLogin)
    .then(() => {
        Logger.log('INFO', 'Login success! \<3');
    })
    .catch(error => {
        Logger.log('INFO', 'Login failed: ' + error + ' :c');
    });