'use strict';
const Discord = require('discord.js');

const SubStringCommands = require('./commands/subStringCommands');
const Messaging = require('./util/messaging').Messaging;
const Logger = require('./util/logger').Logger;
const Commands = require('./commands/commands').Commands;
const MusicCommands = require('./commands/musicCommands').MusicCommands;
const LocalStorage = require('./util/localStorage');
// const ObjectConstructor = require('./util/objectConstructor');
const ConversationEngine = require('./commands/conversations');
const haruna = new Discord.Client({autoReconnect: true});
//substring commands
let _conversationEngine = new ConversationEngine.ConversationEngine();
let jsonLocalStorage = new LocalStorage();

let _conversationEngineActive = false;
//get stored responses from json
module.exports.pouts = require('./json/paths/pouts').paths;
module.exports.smugs = require('./json/paths/smugs.json').paths;
module.exports.selfies = require('./json/paths/selfies.json').paths;
module.exports.idleTexts = require('./json/paths/idles.json').paths;
module.exports.comfortTexts = require('./json/paths/comforts.json').paths;
module.exports.magic8BallResponses = require('./json/magic8BallResponses.json').responses;
module.exports.jsonLocalStorage = jsonLocalStorage;
module.exports.haruna = haruna;

// invoke events hooking and setup 
require('./discordEvents');

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
    haruna.destroy()
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
    haruna.generateInvite(36826112)
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

let _setActivityWithResponse = function(type, game) {
    let playing;
    if(game !== undefined) {
        playing = game;
        return jsonLocalStorage.getItemFromStorage('info').then(info => {
			info.activity.name = playing;
			info.activity.type = type;
			return jsonLocalStorage.writeJSONLocalStorage('localStorage.json', 'info', info).then(() => {
				return _setActivity(type, playing);
			});
		});
    } else {
		Logger.log(Logger.tag.info, 'No activity provided, reading from storage.');
		return jsonLocalStorage.getItemFromStorage('info').then(info => {
			playing = info.activity.name;
			type = info.activity.type;
			Logger.log(Logger.tag.file, 'Successfully read activity from storage!');
			return _setActivity(type, playing);
		}).catch(error => {
			Logger.log(Logger.tag.error, 'Error reading from storage: ' + error);
			playing = 'Secretary Ship <3';
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
	
	return haruna.user.setActivity(activity.name, activity.options).then(user => {
		Logger.log(Logger.tag.info, `Set game to ${user.presence.game.name}`);
	}).catch(error => {
		Logger.log(Logger.tag.error, 'Something went wrong setting the activity: ' + error + ' :c');
	});
};

let _getActivityType = function(type) {
	if(type.toLowerCase() === 'watching') {
		return type.toUpperCase();
	} else if(type.toLowerCase() === 'listening') {
		return type.toUpperCase();
	} else if(type.toLowerCase() === 'streaming') {
		return type.toUpperCase();
	}
	return 'PLAYING';
};

module.exports.findUser = function(nickname) {
	let user = undefined;
	haruna.guilds.map(guild => {
		guild.members.find(guildMember => {
			if (guildMember.user.username === nickname.trim() || (guildMember.nickname === nickname))
				user = guildMember;
		});
	});
	return user;	
};
