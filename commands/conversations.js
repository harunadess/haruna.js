const Logger = require('../logger').Logger;
const HarunaID = require('../json/auth.json').harunaID;
const AdmiralID = require('../json/auth.json').admiralID;

module.exports.ConversationEngine = (function() {
    let possibleResponses = {};
    function ConversationEngine() {
        possibleResponses = {
            greetings: {
                greets: require('../json/conversationOptions.json').greets,
                goodbyes: require('../json/conversationOptions.json').goodbyes,
                feelings: require('../json/conversationOptions.json').feelings
            }
        };
    }

    ConversationEngine.prototype.respond = function(message) {
        let _content = message.cleanContent;
        let _author = message.member;
        let chosenResponse;
        let actualResponse = '';

        if(_notFromHaruna(_author)) {
            if(_directedAtHaruna(_content)) {
                if(_isAGreeting()) {
                    chosenResponse = _randomPositionInArray(possibleResponses.greetings.greets);
                    actualResponse = _stringReplacer(chosenResponse, /-author-/i, _author);
                } else if(_isAGoodbye()) {
                    chosenResponse = _randomPositionInArray(possibleResponses.greetings.goodbyes);
                    actualResponse = _stringReplacer(chosenResponse, /-author-/i, _author);
                } else if(_isAskingHowHarunaIs()) {
                    chosenResponse = _randomPositionInArray(possibleResponses.greetings);
                    actualResponse = _stringReplacer(chosenResponse, /-author-/i, _author);
                }
            }
            return actualResponse;
        }
    };

    let _notFromHaruna = function() {
        return (this._author.id !== HarunaID && this._author.id === AdmiralID);
    };

    let _directedAtHaruna = function() {
        return this._content.toLowerCase().includes('haruna');
    };

    let _isAGreeting = function() {
        return this._content.includes('hello')
        || this._content.includes('hi')
        || this._content.includes('hey');
    };

    let _isAskingHowHarunaIs = function() {
        return this._content.includes('how are you')
        || this._content.includes('you feeling')
        || this._content.includes('what\'s up');
    };

    let _randomPositionInArray = function(array) {
        let element = array[Math.floor(Math.random()*array.length)];
        return element;
    };

    let _stringReplacer = function(string, target, value) {
        return string.replace(target, value);
    };

    let _isAGoodbye = function() {
        return this._content.includes('goodbye')
        || this._content.includes('bye')
        || this._content.includes('see you');
    };

    return ConversationEngine;
})(this.ConversationEngine || (this.ConversationEngine = {}));