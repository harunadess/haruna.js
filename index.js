/**
 * Created by Jorta on 25/06/2017.
 */
const Discord = require('discord.js');

const SubStringCommands = require('./commands/subStringCommands').SubStringCommands;
const Messaging = require('./util/messaging').Messaging;
const Logger = require('./util/logger').Logger;
const Commands = require('./commands/commands').Commands;
const MusicCommands = require('./commands/musicCommands').MusicCommands;
const LocalStorage = require('./util/localStorage');
// const Storinator = require('./util/storinator'); //todo: implement - it, uhh, handles the really large i/o tasks maybe
// todo: promisify storage so it's not shit. relying on async makes the code messy.
//todo: fix intervals.
let _haruna = new Discord.Client({autoReconnect: true});

//local storage (in json)
let _jsonLocalStorage = null;
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
        .then(() => {
            Logger.log(Logger.tag.success, 'deleted 100 messages from ' + channel);
        }).catch(reason => {
        response = 'Something went wrong on my end :c';
        Logger.log(Logger.tag.error, `Something went wrong purging messages: ${reason} desu :c`);
    });
    return response;
};

module.exports.shutdownGracefully = function(channel) {
    _sendShutdownMessage(channel);
    let response = '';
    _haruna.destroy()
        .catch(error => {
            response = 'Something went wrong shutting down desu! :c';
            Logger.log(Logger.tag.error, 'error shutting down: ' + error.message);
        });
    return response;
};

let _sendShutdownMessage = function(channel) {
    Messaging.sendTextMessageToChannel('Goodnight Teitoku <3', channel);
};

module.exports.generateSelfInvite = function(channel) {
    _haruna.generateInvite(238283776)
        .then(link => {
            Logger.log(Logger.tag.info, `Invite link sent to ${channel} <3`);
            Messaging.sendTextMessageToChannel(`You can invite me from ${link} desu! <3`, channel);
        }).catch(reason => {
        Logger.log(Logger.tag.error, `Error generating invite ${reason}`);
        Messaging.sendTextMessageToChannel('Oops, something went wrong desu! :c', channel);
    });
};

module.exports.setGameWithResponse = function(game) {
    return _setGameWithResponse(game);
};

module.exports.toggleIntervals = function(type, channelToMessage) {
    let response = '';
    if(type === 'hourly') {
        if(!_findUserInStoredIntervals(type, channelToMessage)) {
            _setInterval(type, channelToMessage);
            response = `Set hourly messages! Use \`\`-hourly\`\` again to disable! <3`;
        } else {
            _clearIntervals(type, channelToMessage); //store intervals or something
            response = `Cleared hourly messages! Use \`\`-hourly\`\` again to enable! <3`;
        }
    } else {
        //handle other types
    }
    return response;
};

let _findUserInStoredIntervals = function(type, user) {
    console.log('_findUserInStoredIntervals');
    let JSONData = _jsonLocalStorage.getItemFromStorage('invervals');
    console.log(JSON.stringify(JSONData));

    /* let intervals = JSONData[type];
    if(intervals === undefined) {
        return null;
    }
    intervals.find(_user => {
        if(_isSameUser(user, _user.user)) {
            return user;
        }
    });
    return null; */
};

let _isSameUser = function(user, comparisonUser) {
    return ((user.id === comparisonUser.id)
    && (user.username === comparisonUser.username)
    && (user.discriminator === comparisonUser.discriminator));
};


//***********************
//Bot start up
//***********************
_haruna.on('ready', function() {
    let message = `Haruna is standing by in ${_haruna.guilds.size} guilds!\n[`;
    _haruna.guilds.map(guild => {message += `{${guild.name}}`;});
    message += `]`;
    Logger.log(Logger.tag.info, message);
    _init();
});

let _init = function() {
    _jsonLocalStorage = new LocalStorage();
    _jsonLocalStorage.setStorage('localStorage.json');
    _setGameWithResponse();
    _setInterval();    
};

let _setGameWithResponse = function(game) {
    let info, playing;
    if(game !== undefined) {
        playing = game;
        info = _jsonLocalStorage.getItemFromStorage('info');
        info.nowPlaying = playing;
        _jsonLocalStorage.writeJSONLocalStorage('localStorage.json', 'info', info);
    } else {
        try {
            info = _jsonLocalStorage.getItemFromStorage('info');
            playing = info.nowPlaying;
            Logger.log(Logger.tag.file, 'Successfully read nowPlaying from storage!');
        } catch(error) {
            Logger.log(Logger.tag.error, 'Error reading from storage: ' + error);
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
        Logger.log(Logger.tag.info, `Set game to '${user.presence.game.name}'`);
    }).catch(error => {
        Logger.log(Logger.tag.error, 'Something went wrong setting the game: ' + error + ' :c');
        _sendTextMessageToPortGeneral('Game not set :c');
    });
};

/* let _setInterval = function(type, userToMessage) {
    let minute = 60000;
    let intervals;
    _clearIntervals(type, userToMessage).then(() => {
        intervals = _jsonLocalStorage.getItemFromStorage('intervals');
        if(intervals === undefined) {
            Logger.log(Logger.tag.info, `Haruna couldn't find intervals..  Cancelling setting intervals.`);
            return;
        }
        if(type !== undefined && userToMessage !== undefined) {
            if(type === 'hourly') {
                intervals[type].push({
                    'userId': userToMessage.id,
                    'user': {
                        'id': userToMessage.id,
                        'username': userToMessage.username,
                        'discriminator': userToMessage.discriminator,
                        'avatar': userToMessage.avatar,
                        'bot': userToMessage.bot,
                        'lastMessageID': userToMessage.lastMessageID,
                        'lastMessage': userToMessage.lastMessage.toString()
                    }
                });
                _jsonLocalStorage.writeJSONLocalStorage('localStorage.json', 'intervals', intervals);
            }
            Logger.log(Logger.tag.file, 'Successfully saved user\'s interval to local storage! <3');
        } else {
            try {
                if(intervals.length > 0) {
                    let data, intervalSetPromises, user;
                    intervalSetPromises = Object.keys(intervals).map(intervalType => {
                        data = {
                            id: intervalType.user.id,
                            username: intervalType.user.username,
                            discriminator: intervalType.user.discriminator,
                            avatar: intervalType.user.avatar,
                            bot: intervalType.user.bot,
                            lastMessageID: intervalType.user.lastMessageID,
                            lastMessage: intervalType.user.lastMessage
                        };
                        user = new Discord.User(_haruna, data);
                        if(user.id === undefined && user.id !== '') {
                            Logger.log(Logger.tag.file, `No stored interval data for ${user.username}`);
                        } else {
                            intervals[intervalType].push({
                                userId: user.id, 
                                user: user
                            });
                            Logger.log(Logger.tag.file, `Set intervals for user ${user.username}! <3`);
                        }
                    });
                    Promise.all(intervalSetPromises).catch(error => {
                        Logger.log(Logger.tag.error, `Error settings intervals: ${error}`);
                    });
                } else {
                    Logger.log(Logger.tag.file, 'Haruna has no stored interval data');
                }
            } catch(error) {
                Logger.log(Logger.tag.error, `Error creating data obj for interval: ${error}`);
            }
        }
    }).catch(error => {
        Logger.log(Logger.tag.error, `Error clearing intervals: ${error}`);
    });
}; */

let _setInterval = function(type, userToMessage) {
    let intervals;
    _clearIntervals(type, userToMessage).then(success => {
        Logger.log(Logger.tag.info, success);
        intervals = _jsonLocalStorage.getItemFromStorage('intervals');
        if(intervals === undefined) {
            Logger.log(Logger.tag.info, `Haruna couldn't find intervals in local storage. Interval not set.`);
        } else {
            intervals[type].push({
                'userId': userToMessage.id,
                'user': {
                    'id': userToMessage.id,
                    'username': userToMessage.username,
                    'discriminator': userToMessage.discriminator,
                    'avatar': userToMessage.avatar,
                    'bot': userToMessage.bot,
                    'lastMessageID': userToMessage.lastMessageID,
                    'lastMessage': userToMessage.lastMessage.toString()
                }
            });
            _jsonLocalStorage.writeJSONLocalStorage('localStorage.json', 'intervals', intervals);
            Logger.log(Logger.tag.success, `Saved user's interval to local storage!`);
            _haruna.setInterval(_hourlyNotifications, 6000, userToMessage);
            Logger.log(Logger.tag.info, `Set interval for user ${userToMessage.username}`);
        }
    }).catch(error => {
        Logger.log(Logger.tag.error, `Error setting intervals: ${error}`);
    });
};

let _hourlyNotifications = function(channelToMessage) {
    let now = new Date();
    let currentTime = {
        hour: now.getHours(),
        minute: now.getMinutes()
    };

    if(currentTime.minute === 0) {
        let response = _hourlyTexts[currentTime.hour];
        Messaging.sendTextMessageToChannel(response, channelToMessage);
    }
};

/* let _clearIntervals = function(type, user) {
    let intervals = undefined, _user = undefined;
    intervals = _jsonLocalStorage.getItemFromStorage('intervals');
    if(intervals === undefined) {
        Logger.log(Logger.tag.error, `Can't find stored intervals in storage..`);
        return;
    }
    
    let clearPromise = new Promise((succ, fail) => {
        try {
            Object.keys(intervals).map(intervalType => {
                if(intervals[intervalType].length > 0) {
                    _user = _findUserInStoredIntervals(intervals[intervalType], user);
                    if(_user) {
                        intervals[intervalType] = _removeItemFromPosInArray(intervals[intervalType], _user);
                        Logger.log(Logger.tag.info, `Haruna has removed ${_user} from ${intervalType} intervals <3`);
                        succ('removed user from interval');
                    }
                }
            });
        } catch(error) {
            Logger.log(Logger.tag.error, `Haruna has encountered an error in _clearIntervals: ${error}`);
            fail(error);
        }
    });
    return clearPromise.then(succ => {
        Logger.log(Logger.tag.success, succ);
        _jsonLocalStorage.writeJSONLocalStorage('localStorage.json', 'intervals', intervals);
    }).catch(fail => {
        Logger.log(Logger.tag.error, fail);
    });
}; */

let _clearIntervals = function(type, user) {
    return new Promise((success, fail) => {
        success('not yet written');
        fail(new Error('failed'));
    });
};

let _removeItemFromPosInArray = function(array, item) {
    return array.splice(array.indexOf(item), 1);
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
        if(_thereWasNoFuckUp(response)) {
            _respondViaChannel(response, message.channel);            
        } else {
            Logger.log(Logger.tag.info, `Haruna encountered something strange, a response was not a string: ${JSON.stringify(response)}`);
        }
    }
});

let _isGenericCommand = function(content) {
    return content.indexOf('-') === 0; //The '-' character is the command character e.g. '-hello'
};

let _isMusicCommand = function(content) {
    return content.indexOf('+') === 0; //Different command character for music
};

let _hasResponseToGive = function(response) {
    return (response !== '') && (response !== undefined);
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

let _sendTextMessageToPortGeneral = function(text) {
    let portGeneralID = require('./json/auth.json').port.general.id;
    let portGeneralChannel = _haruna.channels.get(portGeneralID);
    Messaging.sendTextMessageToChannel(text, portGeneralChannel);
};

let _isImage = function(response) {
    return response.endsWith(".png") || response.endsWith(".jpg")
        || response.endsWith(".gif") || response.endsWith(".jpeg");
};


//***********************
//Guild join
//***********************
_haruna.on('guildCreate', function(guild) {
    Logger.log(Logger.tag.info, `Haruna has joined ${guild.name}! Now standing by in ${_haruna.guilds.size} guilds! <3`);
});


//***********************
//Guild leave
//***********************
_haruna.on('guildDelete', function(guild) {
    Logger.log(Logger.tag.info, `Haruna has left ${guild.name}! Now standing by in ${_haruna.guilds.size} guilds! <3`);
});


//***********************
//Disconnect
//***********************
_haruna.on('disconnect', function(reason) {
    Logger.log(Logger.tag.info, `Haruna has disconnected: ${reason}`);
});


//***********************
//Reconnect
//***********************
_haruna.on('reconnecting', function() {
    Logger.log(Logger.tag.info, 'Haruna is reconnecting... <3');
});


//***********************
//Error
//***********************
_haruna.on('error', function(error) {
    Logger.log(Logger.tag.error, `Haruna encountered a problem: ${error}`);
});


//load token from auth.json
_haruna.login(require('./json/auth.json').harunaLogin).then(() => {
    Logger.log(Logger.tag.info, 'Login success! <3');
    _sendTextMessageToPortGeneral('Fast battleship, Haruna, reporting for duty.' 
    + ' You\'re the admiral, correct? I\'m looking forward to working with you! <3');
}).catch(error => {
    Logger.log(Logger.tag.error, `Login failed: ${error} :c`);
});