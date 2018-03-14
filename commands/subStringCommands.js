/**
 * Created by Jorta on 25/06/2017.
 */
const Logger = require('../util/logger').Logger;
let _author, _content;

module.exports.SubStringCommands = {
    processMessageIfCommandExists: function(message) {
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
				if(_isAskingMarkToPlay() && _isAdmiral()) {
					response = _getPlayGamesResponse();
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
	this._AdmiralId = require('../json/auth.json').admiralID
	this._MarkId = require('../json/auth.json').markID;
};

let _notFromBot = function() {
    return !this._author.bot;
};

let _isHeartCommand = function() {
    return this._content.includes('<3') && this._author.id === this._AdmiralId;
};

let _isAdmiral = function() {
	return this._author.id === this._AdmiralId;
}

let _isAyyCommand = function() {
    return this._content.includes(' ayy') || this._content === 'ayy';
};

let _isFairCommand = function() {
    return this._content.includes('fair') && this._author.username.includes('merk');
};

let _isMentioned = function() {
	return this._content.includes('haruna');
};

let _isAskingMarkToPlay = function() {
	return (this._content.includes('mark') || this._content.includes('merk'))
		&& this._content.includes('play') && this._content.includes('game');
};

let _getPlayGamesResponse = function() {
	return `<@${this._MarkId}>, Jordan would like to know if you want to play games? If you have time, desu!`;
};