'use strict'

class General {

    sendTypingOn(bot, message) {
        let reply = {
            sender_action: 'typing_on'
        }

        bot.reply(message, reply)
    }

    handleError(bot, message, reply) {
        reply = (reply !== undefined) ? reply : 'Maaf terjadi kesalahan, silahkan coba lagi.'

        bot.reply(message, reply)
    }

}

module.exports = General
