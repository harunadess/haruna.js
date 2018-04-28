'use strict';
const Discord = require('discord.js');

const SubStringCommands = require('./commands/subStringCommands');
const Messaging = require('./util/messaging').Messaging;
const Logger = require('./util/logger').Logger;
const Commands = require('./commands/commands').Commands;
const MusicCommands = require('./commands/musicCommands').MusicCommands;
const LocalStorage = require('./util/localStorage');
const ObjectConstructor = require('./util/objectConstructor');
const ConversationEngine = require('./commands/conversations');
//todo: fix intervals.
let _haruna = new Discord.Client({autoReconnect: true});
//substring commands
let _substringCommands = new SubStringCommands();
let _conversationEngine = new ConversationEngine.ConversationEngine();
let _jsonLocalStorage = new LocalStorage();
try {
    let _objectConstructor = new ObjectConstructor();
} catch(error) {
    console.log('couldnt create objectConstructor', error);
}
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

module.exports.toggleIntervals = function(type, userToMessage) {
    let response = '';
    if(type === 'hourly') {
        if(!_findUserInStoredIntervals(type, userToMessage)) {
            return _setInterval(type, userToMessage).then(() => {
                response = `Set hourly messages! Use \`\`-hourly\`\` again to disable! <3`;
                return response;
            }).catch(error => {
                response = `Haruna failed to set hourly messages :c Contact teitoku for more info! <3`;
                return response;
            });
        } else {
            return _clearIntervals(type, userToMessage).then(() => {
                response = `Cleared hourly messages! Use \`\`-hourly\`\` again to enable! <3`;
                return response;
            }).catch(error => {
                response = `Haruna failed to clear hourly messages :c`;
                return response;
            });
        }
    } else {
        //handle other types
        return Promise.resolve('Only hourly intervals are implemented yet desu!');
    }
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
		return _setActivityWithResponse().then(() => {
            // return _setInterval();
        });
	}).catch(error => {
		Logger.log(Logger.tag.error, `Error setting local storage: ${error}`);
	});
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

let _findUserInStoredIntervals = function(type, userToMessage) {
    //todo: what it says
};

let _setInterval = function(type, userToMessage) {
    //todo: handle no type or user specified
    if(!type || !userToMessage) {
        return Promise.resolve('Have not implemented setting from storage yet');
    }
    let intervals;
    return _jsonLocalStorage.getItemFromStorage('intervals').then(storedIntervals => {
        intervals = storedIntervals;
        console.log('intervals', intervals);

        let user = _objectConstructor.createDiscordUser(userToMessage);
        let interval = _objectConstructor.createInterval(user.id, user);
        intervals[type].push(interval);
        return _jsonLocalStorage.writeJSONLocalStorage('localStorage.json', 'intervals', intervals).then(() => {
            Logger.log(Logger.tag.info, `Haruna has saved the interval!`);
            //todo: actually set the interval
        }).catch(error => {
            Logger.log(Logger.tag.error, `Haruna failed to save the interval :c ${error}`);
        });
    }).catch(error => {
        Logger.error(`Can't set interval for ${userToMessage}`);
        return `Sorry, Haruna ran into a problem setting your interval :c`;
    });
};

let _clearInterval = function(type, userToMessage) {
    //todo: find interval
    //todo: clear interval
    //todo: save interval
    return Promise.resolve('Not implemented yet.');
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

let _sendTextMessageToPortGeneral = function(text) {
    let portGeneralID = require('./json/auth.json').port.general.id;
    let portGeneralChannel = _haruna.channels.get(portGeneralID);
    Messaging.sendTextMessageToChannel(text, portGeneralChannel);
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
    Logger.log(Logger.tag.error, `Haruna encountered a connection problem: ${JSON.stringify(error, null, 2)}`);
});


//load token from auth.json
_haruna.login(require('./json/auth.json').harunaLogin).then(() => {
	Logger.log(Logger.tag.info, 'Login success! \<3');
	_sendGreetingMessage();
}).catch(error => {
    Logger.log(Logger.tag.error, `Login failed: ${error} :c`);
    console.log(error);
});