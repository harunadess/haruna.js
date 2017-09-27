/**
 * Created by Jorta on 20/06/2017.
 */
const Logger = require('./logger').Logger;

module.exports.Messaging = {
    sendTextMessageToChannel: function(messageContent, channel) {
        channel.send(messageContent)
            .then(message =>
                Logger.log('MSG', `Sent message: ${message.cleanContent}`)
            ).catch(console.error);
    },

    sendImageToChannel: function(imagePath, channel) {
        channel.send('', {file: imagePath})
            .then(message =>
                Logger.log('MSG_IMG', `Sent message: ${message.attachments.first().filename}`)
            ).catch(console.error);
    }
};