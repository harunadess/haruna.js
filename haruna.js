/**
 * Created by Jorta on 25/06/2017.
 */
/*
 *   Haruna bot created by Jordan
 *   node.js version of Haruna bot created in C#
 */

const SubStringCommands = require('./subStringCommands').SubStringCommands;
const Messaging = require('./messaging').Messaging;
const Logger = require('./logger').Logger;
const Commands = require('./commands').Commands;
const Discord = require('discord.js');

let _haruna = new Discord.Client({ 'autoReconnect': true });

//string arrays of files
module.exports.pouts = require('./images/paths/pouts.json').paths;
module.exports.smugs = require('./images/paths/smugs.json').paths;
module.exports.selfies = require('./images/paths/selfies.json').paths;
module.exports.idleTexts = require('./images/paths/idles.json').paths;
module.exports.comfortTexts = require('./images/paths/comforts.json').paths;

module.exports.deleteMessagesFromChannel = function(numberOfMessages, channel) {
    let response = '';
    channel.bulkDelete(numberOfMessages)
        .then(message => {
            Logger.log('SUCCESS', 'deleted 100 messages from ' + channel);
        })
        .catch(reason => {
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
        })
        .catch(reason => {
            Logger.log('ERROR', `Error generating invite ${reason}`);
            Messaging.sendTextMessageToChannel('Oops, something went wrong desu! :c', channel);
        });
};


//***********************
//Bot start up
//***********************
_haruna.on('ready', function() {
    Logger.log('INFO', 'Haruna is standing by in ' + _haruna.guilds.size + ' guilds!');
    _setGame();
});

let _setGame = function() {
    _haruna.user.setGame('Secretary ship to Jortathlon <3')
        .then(message => {
            Logger.log('INFO', `Success setting game! <3`);
        })
        .catch(error => {
            Logger.log('ERROR', 'Something went wrong setting the game: ' + error + ' :c');
        });
};


//***********************
//Message received
//***********************
_haruna.on('message', function(message) {
    let response = '';

    if(_isGenericCommand(message.content)) {
        response = Commands.processMessageIfCommandExists(message);
    } else {
        response = SubStringCommands.processMessageIfCommandExists(message);
    }

    if(_hasResponseToGive(response)) {
        _respondViaChannel(response, message.channel);
    }
});

let _isGenericCommand = function(content) {
    return content.indexOf('-') === 0; //The '-' character is the command character e.g. '-hello'
};

let _hasResponseToGive = function(response) {
    return response !== '';
};

let _respondViaChannel = function(response, channel) {
    if(_isImage(response)) {
        Messaging.sendImageToChannel(response, channel);
    } else {
        Messaging.sendTextMessageToChannel(response, channel);
    }
};

let _isImage = function(response) {
    return response.includes(".png") || response.includes(".jpg") || response.includes(".gif");
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