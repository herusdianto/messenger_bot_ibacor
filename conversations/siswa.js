'use strict'

const API = require('../api')
const General = require('./general')
var api, general

class Siswa {

    constructor(api_key, access_token) {
        this.api = new API(api_key, access_token)
        this.general = new General()
    }

    askSiswa(bot, message) {
        let self = this

        bot.startConversation(message, (response, convo) => {
            convo.ask('Berapa NISN anda?', (response, convo) => {
                let nisn = response.text.trim()

                self.processSiswa(nisn, bot, message, convo)

                convo.next()
            })
        })
    }

    processSiswa(nisn, bot, message, convo) {
        let self = this

        self.general.sendTypingOn(bot, message)

        self.api.getDataSiswa(nisn)
            .then(body => {
                let siswa = body.siswa[0]
                let reply = `Nama: ${siswa.nama}\n`
                reply += `Jenis Kelamin: ${siswa.jenis_kelamin}\n`
                reply += `Lahir: ${siswa.tempat_lahir}, ${siswa.tanggal_lahir}\n`

                bot.reply(message, reply)

                convo.next()
            })
            .catch(reply => {
                self.general.handleError(bot, message, reply)

                convo.next()
            })
    }

}

module.exports = Siswa
