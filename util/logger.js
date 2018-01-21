/**
 * Created by Jorta on 20/06/2017.
 */
const moment = require('moment');

module.exports.Logger = {
    tag: {
        info: "INFO",
        music: "MUSIC",
        error: "ERROR",
        file: "FILE",
        success: "SUCC",
        message: {
            text: "MSG",
            image: "MSG_IMG"
        }
    },
    log: function(level, message) {
        _log(level, message);
    },

    logUserMessage: function(message) {
        let logMessage = _generateCommandLogMessage(message);
        _log('CMD', logMessage);
    }
};


let _assembleLogMessage = function(level, message) {
    return `[${_currentTime('HH:mm:ss')}][${level}] ${message}`;
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
    console.log(logMessage);
};