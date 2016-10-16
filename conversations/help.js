'use strict'

const API = require('../api')
const General = require('./general')
var api, general

class Help {

    constructor(api_key, access_token) {
        this.api = new API(api_key, access_token)
        this.general = new General()
    }

    sendHelp(bot, message) {
        let self = this

        self.api.getUserInfo(message.user)
            .then(body => {
                let reply = `Hai ${body.first_name}, silahkan gunakan perintah di bawah ini:\n`
                reply += `help,bantuan => Melihat pesan ini.\n`
                reply += `kurs => Cek kurs mata uang.\n`
                reply += `pln => Cek tagihan pln.\n`

                bot.reply(message, reply)
            })
            .catch(body => {
                self.general.handleError(bot, message)
            })
    }

}

module.exports = Help
