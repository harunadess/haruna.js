'use strict';

const Logger = require('../util/logger').Logger;
const Messaging = require('../util/messaging').Messaging;
const userJoinMessage = `Hi there, Haruna will send you hourly notifications until she goes offline, or you stop them. To stop these messages, just say \`\`Haruna, hourlies\`\` <3`;
const userLeaveMessage = `Haruna will no longer send you hourly notifications. Say \`\`Haruna, hourlies\`\` to re-enable.`;
const admiralID = require('../../auth/auth').admiralID;

let timeout;
let lastHour;
let usersToMessage = [];

const TimedMessages = function() {
    TimedMessages.prototype.initialise = function() {
        _initialiseTimeChecking();
    };

    TimedMessages.prototype.setForUser = function(author) {
        let userIndex = _findInArray(author.id);
        if(userIndex != -1) {
            usersToMessage.splice(userIndex, 1);
            Logger.log(Logger.tag.info, `Removed user ${author.tag} from users`);

            Messaging.sendTextMessageToChannelNoDelay(userLeaveMessage, author);
        } else {
            usersToMessage.push({id: author.id, user: author});
            Logger.log(Logger.tag.info, `Added user ${author.tag} to users`);

            Messaging.sendTextMessageToChannelNoDelay(userJoinMessage, author);
        }
    };
};

let _initialiseTimeChecking = function() {
    const initDuration = 60000;
    timeout = _createInterval(_checkTime, initDuration);
};

let _createInterval = function(func, duration) {
    return setTimeout(() => {
        let newDuration = func();
        Logger.log(Logger.tag.info, `timeout function called`);
        return _createInterval(func, newDuration);
    }, duration);
};

let _checkTime = function() {
    const time = new Date();
    const hour = time.getHours();
    const minute = time.getMinutes();
    let duration = 60000;

    let message = `It is now ${hour < 10 ? '0' + hour : hour}:${minute < 10 ? '0' + minute : minute} hours.`;
    
    if (hour === 23) {
        message += ' Haruna thinks you should start heading to bed soon <3';
    } else if (hour === 0) {
        message += ' Haruna says you should be in bed now desu.';
    } else if (hour === 1) {
        message += ' Haruna is telling you to go to sleep now. No buts.';
    }

    if(_hourInRange(hour)) {
        usersToMessage.map((user) => {
            if(user.id === admiralID) {
                _sendMessageToUser(message, user);
            }
        });
    }

    if(_minuteInRange(minute) && lastHour != hour) {
        lastHour = hour;
        usersToMessage.map((user) => {
            _sendMessageToUser(message, user.user);
        });
    }

    return duration;
};

let _hourInRange = function(hour) {
    return hour > 22 || hour < 6;
};

let _sendMessageToUser = function(message, user) {
    Messaging.sendTextMessageToChannelNoDelay(message, user);
};

let _minuteInRange = function(minute) {
    return minute <= 20;
};

let _findInArray = function(authorID) {
    return usersToMessage.findIndex((user) => {
        return user.id = authorID;
    });
};

module.exports = TimedMessages;
