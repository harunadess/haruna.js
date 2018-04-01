'use strict';
const Discord = require('discord.js');
const fs = require('fs');

const SubStringCommands = require('./commands/subStringCommands');
const Messaging = require('./util/messaging').Messaging;
const Logger = require('./util/logger').Logger;
const Commands = require('./commands/commands').Commands;
const MusicCommands = require('./commands/musicCommands').MusicCommands;
const ConversationEngine = require('./commands/conversations');
const LocalStorage = require('./util/localStorage');
// const Storinator = require('./util/storinator'); //todo: implement - will be the wrapper for file system
//todo: fix intervals.
let _haruna = new Discord.Client({autoReconnect: true});
//substring commands
let _substringCommands = new SubStringCommands();
let _conversationEngine = new ConversationEngine.ConversationEngine();
let _jsonLocalStorage = new LocalStorage();
let _conversationEngineActive = false;
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
    Messaging.sendTextMessageToChannelNoDelay('Goodnight Teitoku <3', channel);
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

module.exports.setGameWithResponse = function(type, game) {
    return _setActivityWithResponse(type, game);
};

module.exports.toggleIntervals = function(type, channelToMessage) {
    let response = '';
    if(type === 'hourly') {
        if(!_findUserInStoredIntervals(type, channelToMessage)) {
            _setInterval(type, channelToMessage);
            response = `Set hourly messages! Use \`\`-hourly\`\` again to disable! <3`;
        } else {
            _clearIntervals(type, channelToMessage); //store intervals or something
            // _writeObjectToLocalStorage(_jsonLocalStorage);
            // LocalStorage.writeJSONLocalStorage(_jsonLocalStorage);
            response = `Cleared hourly messages! Use \`\`-hourly\`\` again to enable! <3`;
        }
    } else {
        //handle other types
    }
    return response;
};

let _findUserInStoredIntervals = function(type, user) {
    let JSONData = _jsonLocalStorage.getItemFromStorage('invervals');
    let intervals = JSONData[type];
    intervals.find(_user => {
        if(_isSameUser(user, _user.user)) {
            return user;
        }
    });
    return null;
};

let _isSameUser = function(user, comparisonUser) {
    return ((user.id === comparisonUser.id)
    && (user.username === comparisonUser.username)
    && (user.discriminator === comparisonUser.discriminator));
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
            Logger.log(Logger.tag.error, 'There was an error writing to json file: ' + err);
            return;
        }
        Logger.log(Logger.tag.file, 'Successfully wrote to storage! <3');
    });
};


//***********************
//Bot start up
//***********************
_haruna.on('ready', function() {
    let message = `Haruna is standing by in ${_haruna.guilds.size} guilds!\n[`;
	_haruna.guilds.map(guild => {message += `{${guild.name}},`;});
	message = message.substring(0, (message.length-1));
    message += `]`;
    Logger.log(Logger.tag.info, message);
    Promise.resolve(_init());
});

let _init = function() {
	return _jsonLocalStorage.setStorage('localStorage.json').then(() => {
		Logger.log(Logger.tag.info, `Successfully set local storage!`);
		return _setActivityWithResponse();
	}).catch(error => {
		Logger.log(Logger.tag.error, `Error setting local storage: ${error}`);
	});
    // _setInterval();    
};

let _setActivityWithResponse = function(type, game) {
    let info, playing, response = '';
    if(game !== undefined) {
        playing = game;
        return _jsonLocalStorage.getItemFromStorage('info').then(info => {
			info.activity.name = playing;
			info.activity.type = type;
			return _jsonLocalStorage.writeJSONLocalStorage('localStorage.json', 'info', info).then(() => {
				return _setActivity(type, playing);
			});
		});
    } else {
		Logger.log(Logger.tag.info, 'No activity provided, reading from storage.');
		return _jsonLocalStorage.getItemFromStorage('info').then(info => {
			playing = info.activity.name;
			type = info.activity.type;
			Logger.log(Logger.tag.file, 'Successfully read activity from storage!');
			return _setActivity(type, playing);
		}).catch(error => {
			Logger.log(Logger.tag.error, 'Error reading from storage: ' + error);
			playing = 'Jortathlon\'s Secretary Ship <3';
			type = 'PLAYING';
			return _setActivity(type, playing);
		});
	}
};

let _setActivity = function(type, playing) {
	let activity = {
		name: playing,
		options: {
			url: 'http://kancolle.wikia.com/wiki/Haruna',
			type: _getActivityType(type)
		}
	};
	
	return _haruna.user.setActivity(activity.name, activity.options).then(user => {
		Logger.log(Logger.tag.info, `Set game to ${user.presence.game.name}`);
	}).catch(error => {
		Logger.log(Logger.tag.error, 'Something went wrong setting the activity: ' + error + ' :c');
	});
};

let _getActivityType = function(type) {
	if(type.toLowerCase() === 'watching') {
		return 'WATCHING';
	} else if(type.toLowerCase() === 'listening') {
		return 'LISTENING';
	} else if(type.toLowerCase() === 'streaming') {
		return 'STREAMING';
	}
	return 'PLAYING';
}

let _setInterval = function(type, channelToMessage) {
    let minute = 60000;
    let intervals;
    _clearIntervals(type, channelToMessage);
    intervals = _jsonLocalStorage.getItemFromStorage('intervals');
    if(type !== undefined && channelToMessage !== undefined) {
        if(type === 'hourly') {
            intervals[type].push({
                'userId': channelToMessage.id,
                'user': {
                    "id": channelToMessage.id,
                    "username": channelToMessage.username,
                    "discriminator": channelToMessage.discriminator,
                    "avatar": channelToMessage.avatar,
                    "bot": channelToMessage.bot,
                    "lastMessageID": channelToMessage.lastMessageID,
                    "lastMessage": channelToMessage.lastMessage.toString()
                }
            });
			_jsonLocalStorage.writeJSONLocalStorage('localStorage.json', 'intervals', intervals);
			/* _jsonLocalStorage = require('./json/localStorage.json'); */
           /*  _jsonLocalStorage.intervals.hourly.push({
                "userId": channelToMessage.id,
                "user": {
                    "id": channelToMessage.id,
                    "username": channelToMessage.username,
                    "discriminator": channelToMessage.discriminator,
                    "avatar": channelToMessage.avatar,
                    "bot": channelToMessage.bot,
                    "lastMessageID": channelToMessage.lastMessageID,
                    "lastMessage": channelToMessage.lastMessage.toString()
                }
            });
            _writeObjectToLocalStorage(_jsonLocalStorage); */
        }
        Logger.log(Logger.tag.file, 'Successfully saved user\'s interval to local storage! <3');
    } else {
        try {
            intervals = _jsonLocalStorage.getItemFromStorage('intervals');
            if(intervals.length > 0) {
                let data, user;
                Object.keys(JSONData).map(intervalType => {
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
                        Logger.log(Logger.tag.file, 'No stored interval data');
                    } else {
                        intervals[intervalType].push({
                            userId: user.id, 
                            user: user
                        });
                        Logger.log(Logger.tag.file, `Set intervals for user ${user.username}! <3`);
                    }
                });
            } else {
                Logger.log(Logger.tag.file, 'Haruna has no stored interval data');
            }
        } catch(error) {
            Logger.log(Logger.tag.error, 'Error creating data obj for interval: ' + error);
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

let _clearIntervals = function(type, user) {
    let intervals = undefined, _user = undefined, it;
    intervals = _jsonLocalStorage.getItemFromStorage('intervals');
    
    let clearPromise = new Promise((succ, fail) => {
        try {
            Object.keys(intervals).map(intervalType => {
                it = intervalType;
                if(intervals[it].length > 0) {
                    _user = _findUserInStoredIntervals(intervals[it], user);
                    intervals[it] = _removeItemFromPosInArray(intervals[it], _user);
                    Logger.log(Logger.tag.info, `Haruna has removed ${_user} from ${it} intervals <3`);
                }
            });
            succ('daijoubu!');
        } catch(error) {
            Logger.log(Logger.tag.error, `Haruna has encountered an error in _clearIntervals: ${error}`);
            fail('shit!');
        }
    });
    clearPromise.then(succ => {
        _jsonLocalStorage.writeJSONLocalStorage('localStorage.json', 'intervals', intervals);
    }).catch(fail => {
        Logger.log(Logger.tag.info, `Haruna has encountered an error: ${fail}`);
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
        response = _substringCommands.processMessageIfCommandExists(message);
        if(_conversationEngineActive && response === '') {
            response = _conversationEngine.respond(message);
        }
    }

    if(_hasResponseToGive(response)) {
		Promise.resolve(response).then(result => {
			if(_thereWasNoFuckUp(result)) {
				_respondViaChannel(result, message.channel);            
			} else {
				Logger.log(Logger.tag.info, `Haruna encountered something strange: ${JSON.stringify(result)}`);
			}
		}).catch(error => {
			Logger.log(Logger.tag.error, `Haruna encountered an error: ${error}`);
		});
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

let _isImage = function(response) {
    return response.endsWith(".png") || response.endsWith(".jpg")
        || response.endsWith(".gif") || response.endsWith(".jpeg");
};

let _sendGreetingMessage = function() {
	let portGeneralID = require('./json/auth.json').port.general.id;
	let portGeneralChannel = _haruna.channels.get(portGeneralID);
	let greetingMessage = require('./json/conversationOptions.json').greeting;
	_respondViaChannel(greetingMessage, portGeneralChannel);
}


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
    Logger.log(Logger.tag.info, `Haruna has disconnected <3`);
});


//***********************
//Reconnect
//***********************
_haruna.on('reconnecting', function() {
    Logger.log(Logger.tag.info, 'Haruna is reconnecting! <3');
});


//***********************
//Error
//***********************
_haruna.on('error', function(error) {
    Logger.log(Logger.tag.error, `Haruna encountered a problem: ${error}`);
});


//load token from auth.json
_haruna.login(require('./json/auth.json').harunaLogin).then(() => {
	Logger.log(Logger.tag.info, 'Login success! \<3');
	_sendGreetingMessage();
}).catch(error => {
    Logger.log(Logger.tag.error, `Login failed: ${error} :c`);
});