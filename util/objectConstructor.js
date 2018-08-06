'use strict';

const ObjectConstructor = function() {
    ObjectConstructor.prototype.createDiscordUser = function(user) {
        let userObj = {
            id: user.id,
            username: user.username,
            discriminator: user.discriminator,
            avatar: userToMessage.avatar,
            bot: userToMessage.bot,
            lastMessageID: userToMessage.lastMessageID,
            lastMessage: userToMessage.lastMessage.toString()
        };

        return userObj;
    };

    ObjectConstructor.prototype.createInterval = function(userId, user) {
        let interval = {
            userId: userId,
            user: user
        };
        
        return interval;
    };
};

module.exports = ObjectConstructor;