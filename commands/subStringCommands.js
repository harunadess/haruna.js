/**
 * Created by Jorta on 25/06/2017.
 */
const Logger = require('../util/logger').Logger;
let _author, _content;

module.exports.SubStringCommands = {
    processMessageIfCommandExists(message) {
        _initialiseVariables(message);
        let response = '';
        if(_notFromBot()) {
            if(_isHeartCommand()) {
                Logger.logUserMessage(message);
                response = '<3';
            } else if(_isAyyCommand()) {
                Logger.logUserMessage(message);
                response = 'lmao desu!';
            } else if(_isFairCommand()) {
                Logger.logUserMessage(message);
                response = 'fair desu';
            } else if(_isMentioned()) {
                Logger.logUserMessage(message);                
                if(_askingMarkToPlayGames()) {
                    response = _askMarkToPlayGames();
                } else {
                    response = 'Haruna is daijoubu!';
                }
            }
        }
        return response;
    }
};

let _initialiseVariables = function(message) {
    this._content = message.content.toLowerCase();
    this._author = message.author;
};

let _notFromBot = function() {
    return !this._author.bot;
};

let _isHeartCommand = function() {
    return this._content.includes('<3') && this._author.id === require('../json/auth.json').admiralID;
};

let _isAyyCommand = function() {
    return this._content.includes(' ayy') || this._content === 'ayy';
};

let _isFairCommand = function() {
    return this._content.includes('fair') && this._author.username.includes('merk');
};

let _isMentioned = function() {
    return this._content.includes('haruna');
};

let _askingMarkToPlayGames = function() {
    return (this._content.includes('can you') || this._content.includes('ask'))
        && (this._content.includes('mark') || this._content.includes('merk'))
        && (this._content.includes('games'));
};

let _askMarkToPlayGames = function() {
    let markId = require('../json/auth.json').markID;
    let admiralId = require('../json/auth.json').admiralID;
    return `<@${markId}>, if you have time, do you want to play games with <@${admiralId}>?`;
}