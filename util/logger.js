'use strict';
const moment = require('moment');

module.exports.Logger = {
    tag: {
        info: 'INFO',
        music: 'MUSIC',
        error: 'ERROR',
        file: 'FILE',
        success: 'SUCC',
        message: {
            text: 'MSG',
            image: 'MSG_IMG'
        },
        command: 'CMD'
    },

    log(level, message) {
        _log(level, message);
    },
    logUserMessage(message) {
        let logMessage = _generateCommandLogMessage(message);
        _log(this.tag.command, logMessage);
    }
};


let _assembleLogMessage = function(level, message) {
    return `[${_currentTime('HH:mm:ss')}][${level}]--- ${message}`;
};

let _currentTime = function(format) {
    return moment().utc().format(format);
};

let _generateCommandLogMessage = function(message) {
    let channel = message.channel;
    let user = message.author;
    let logMessage = '';
    if(_channelIsATextChannel(channel.type)) {
        logMessage += '[' + message.guild.name + ']';
    }
    let userAndMessage = ' [' + user.username + '#' + user.discriminator + ']: ' + message.cleanContent;
    logMessage += userAndMessage;

    return logMessage;
};

let _channelIsATextChannel = function(channelType) {
    return channelType === 'text';
};

let _log = function(level, message) {
    let logMessage = _assembleLogMessage(level, message);
    if(level === 'ERROR') {
        console.error(logMessage);
    } else {
        console.log(logMessage);
    }
};