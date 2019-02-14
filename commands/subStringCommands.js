'use strict';
const Logger = require('../util/logger').Logger;

const SubStringCommands = function() {
	this._author, this._content;
	this._AdmiralId = require('../../auth/auth').admiralID;
	this._MarkId = require('../../auth/auth').markID;
	
    SubStringCommands.prototype.processMessageIfCommandExists = function(message) {
        this._initialiseVariables(message);
        let response = '';
        if(this._notFromBot()) {
            if(this._isHeartCommand()) {
                Logger.logUserMessage(message);
                response = '<3';
            } else if(this._isAyyCommand()) {
                Logger.logUserMessage(message);
                response = 'lmao desu!';
            } else if(this._isFairCommand()) {
                Logger.logUserMessage(message);
                response = 'fair desu';
            } else if(this._isMentioned()) {
				Logger.logUserMessage(message);
				if(this._isAskingMarkToPlay() && this._isAdmiral()) {
					response = this._getPlayGamesResponse();
				} else {
					response = 'Haruna is daijoubu!';
				}
			}
        }
        return response;
	};
	
	SubStringCommands.prototype._initialiseVariables = function(message) {
		this._content = message.content.toLowerCase();
		this._author = message.author;
	};
	
	SubStringCommands.prototype._notFromBot = function() {
		return !this._author.bot;
	};
	
	SubStringCommands.prototype._isHeartCommand = function() {
		return this._content.includes('<3') && this._author.id === this._AdmiralId;
	};
	
	SubStringCommands.prototype._isAdmiral = function() {
		return this._author.id === this._AdmiralId;
	};
	
	SubStringCommands.prototype._isAyyCommand = function() {
		return this._content.includes(' ayy') || this._content === 'ayy';
	};
	
	SubStringCommands.prototype._isFairCommand = function() {
		return this._content.includes('fair') && this._author.username.includes('merk');
	};
	
	SubStringCommands.prototype._isMentioned = function() {
		return this._content.includes('haruna');
	};
	
	SubStringCommands.prototype._isAskingMarkToPlay = function() {
		return (this._content.includes('mark') || this._content.includes('merk'))
			&& this._content.includes('play') && this._content.includes('game');
	};
	
	SubStringCommands.prototype._getPlayGamesResponse = function() {
		return `<@${this._MarkId}>, Jordan would like to know if you want to play games? If you have time, desu!`;
	};
};

module.exports = SubStringCommands;
