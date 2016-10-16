'use strict'

const API = require('../api')
const General = require('./general')
const moment = require('moment')
var api, general

class Zodiak {

    constructor(api_key, access_token) {
        this.api = new API(api_key, access_token)
        this.general = new General()
    }

    askZodiak(bot, message) {
        let self = this

        bot.startConversation(message, (response, convo) => {
            self.askZodiakNama(bot, message, response, convo)
        })
    }

    askZodiakNama(bot, message, response, convo) {
        let nama, self = this

        self.general.sendTypingOn(bot, message)

        self.api.getUserInfo(message.user)
            .then(body => {
                nama = `${body.first_name} ${body.last_name}`

                self.askZodiakTanggal(nama, bot, message, convo)
            })
            .catch(body => {
                self.general.handleError(bot, message)
            })
    }

    askZodiakTanggal(nama, bot, message, convo) {
        let self = this

        self.general.sendTypingOn(bot, message)

        convo.ask('Tanggal berapa anda lahir? Tulis dengan format DD-MM-YYYY.', (response, convo) => {
            let tanggal = response.text.trim()

            let tanggalMoment = moment(tanggal, 'DD-MM-YYYY')

            console.log(tanggalMoment)

            if (!tanggalMoment.isValid()) {
                let reply = 'Tanggal tidak valid.'

                bot.reply(message, reply)

                convo.repeat()

                convo.next()
            } else {
                self.processZodiak(nama, tanggal, bot, message, convo)
            }
        })
    }

    processZodiak(nama, tanggal, bot, message, convo) {
        let self = this

        self.general.sendTypingOn(bot, message)

        self.api.getZodiak(nama, tanggal)
            .then(body => {
                let reply = ``

                if(body === undefined) {
                    reply += 'Zodiak tidak diketahui atau tanggal salah.'

                    convo.repeat();
                } else {
                    reply += `Zodiak: ${body.zodiak}\n`
                    reply += `Umum: ${body.ramalan.umum}\n`
                    reply += `Single: ${body.ramalan.percintaan.single}\n`
                    reply += `Couple: ${body.ramalan.percintaan.couple}\n`
                    reply += `Keuangan: ${body.ramalan.karir_keuangan}\n`
                }

                bot.reply(message, reply)

                convo.next()
            })
            .catch(reply => {
                self.general.handleError(bot, message, reply)

                convo.next()
            })
    }

}

module.exports = Zodiak
