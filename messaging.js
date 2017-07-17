/**
 * Created by Jorta on 20/06/2017.
 */
const Logger = require('./logger').Logger;

module.exports.Messaging = {
    sendTextMessageToChannel(messageContent, channel) {
        channel.sendMessage(messageContent)
        .then(message => Logger.log('CMD', `Sent message: ${message.cleanContent}`))
        .catch(console.error);
    },

    sendImageToChannel(imagePath, channel) {
        channel.sendMessage('', {
        file: imagePath
    })
        .then(message => Logger.log('CMD', `Sent message: ${message.attachments.first().filename}`))
        .catch(console.error);
    }
};