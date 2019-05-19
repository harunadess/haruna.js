'use strict';

const Messaging = require('../util/messaging').Messaging;
const Logger = require('../util/logger').Logger;
const userJoinMessage = `Hi there, Haruna will send you hourly notifications until she goes offline, or you ask me to stop. To stop these messages, just say \`\`Haruna, hourlies\`\` <3`;
const userLeaveMessage = `Haruna will no longer send you hourly notifications. Say \`\`Haruna, hourlies\`\` to re-enable.`;

let lastHour, lastMinute, timeout;
let usersToMessage = [];

const TimedMessages = function() {
    TimedMessages.prototype.initialise = function() {
        _initialiseTimeChecking();
    };

    TimedMessages.prototype.setForUser = function(author) {
        if(_userInArray(author.id)) {
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
        return Promise.resolve(func()).then((newDuration) => {
            return _createInterval(func, newDuration);
        }).catch((error) => {
            Logger.log(Logger.tag.error, `Error in timedMessages _createInterval: ${error}`);
            return _createInterval(func, newDuration);
        });
    }, duration);
};

let _checkTime = function() {
    const time = new Date();
    const hour = time.getHours();
    const minute = time.getMinutes();
    let duration = 60000; //60000ms =  1 min
    let msgPromises = [];

    let message = `It is now ${hour < 10 ? '0' + hour : hour}:${minute < 10 ? '0' + minute : minute} hours.`;
    
    if (hour === 23) {
        message += ' Haruna thinks you should start heading to bed soon <3';
    } else if (hour === 0) {
        message += ' Haruna says you should be in bed now desu.';
    } else if (hour === 1) {
        message += ' Haruna is ordering you to go to sleep now. No buts.';
    }

    if(_hourInRange(hour)) { //todo: <- _hourInRange disabled
        switch(hour) {
            case 0:
                duration *= 15;
                break;
            case 1:
                duration *= 10;
                break;
            case 23:
            default:
                duration *= 20;
                break;
        }
        msgPromises = usersToMessage.map((user) => {
            return _sendMessageToUser(message, user.user);
        });
    } else if(_minuteInRange(minute) && lastHour != hour) {
        lastHour = hour;
        msgPromises = usersToMessage.map((user) => {
            return _sendMessageToUser(message, user.user);
        });
    }

    if(msgPromises = []) {
        msgPromises.push(new Promise((resolve, reject) => {
            resolve(duration);
            reject(duration);
        }));
    }

    return Promise.all(msgPromises).then(() => {
        return duration;
    }).catch((error) => {
        Logger.log(Logger.tag.error, `Error resolving timedMessages promise: ${error.message}`);
        return duration;
    });
};

let _hourInRange = function(hour) {
    return false;
    //return hour > 22 || hour < 6;
};

let _sendMessageToUser = function(message, user) {
    return Messaging.sendTextMessageToChannelNoDelay(message, user);
};

let _minuteInRange = function(minute) {
    return minute <= 20;
};

let _userInArray = function(authorID) {
    let userIndex = usersToMessage.findIndex((user) => {
        return user.id = authorID;
    });
    return userIndex != -1;
};

module.exports = TimedMessages;
