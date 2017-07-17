/**
 * Created by Jorta on 20/06/2017.
 */

module.exports.Logger = {
    log(level, message) {
        _log(level, message);
    },

    logUserMessage(message) {
        let logMessage = _generateCommandLogMessage(message); //TODO: somehow returns user message in level
        _log('CMD', logMessage);
    }
};

let _assembleLogMessage = function (level, message) {
    return '[' + level + ']' + " " + message;
};

let _generateCommandLogMessage = function(message) { //TODO: fix method
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
