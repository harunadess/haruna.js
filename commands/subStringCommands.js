/**
 * Created by Jorta on 25/06/2017.
 */
const Logger = require('../logger').Logger;

let _content;
let _author;

module.exports.SubStringCommands = {
    processMessageIfCommandExists: function(message) {
        _initialiseVariables(message);
        let response = '';
        if(_notFromBot()) {
            if(_isHeartCommand()) {
                Logger.logUserMessage(message);
                response = '\<3';
            } else if(_isAyyCommand()) {
                Logger.logUserMessage(message);
                response = 'lmao desu!';
            } else if(_isFairCommand()) {
                Logger.logUserMessage(message);
                response = 'fair desu';
            }
        }
        return response;
    }
};

let _initialiseVariables = function(message) {
    this._content = message.content;
    this._author = message.author;
};

let _notFromBot = function() {
    return !this._author.bot;
};

let _isHeartCommand = function() {
    return this._content.includes('<3') && this._author.id === require('../json/auth.json').admiralID;
};

let _isAyyCommand = function() {
    return this._content.toLowerCase().includes(' ayy') || this._content.toLowerCase() === 'ayy';
};

let _isFairCommand = function() {
    return this._content.includes('fair') && this._author.username.includes('merk');
};

