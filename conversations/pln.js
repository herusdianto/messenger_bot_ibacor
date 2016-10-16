'use strict'

const API = require('../api')
const General = require('./general')
var api, general

class PLN {

    constructor(api_key, access_token) {
        this.api = new API(api_key, access_token)
        this.general = new General()
    }

    askPLN(bot, message) {
        let self = this

        bot.startConversation(message, (response, convo) => {
            self.askPLNIdPelanggan(bot, message, response, convo)
        })
    }

    askPLNIdPelanggan(bot, message, response, convo) {
        let self = this

        convo.ask('Berapa nomor ID pelanggan anda?', (response, convo) => {
            let idPelanggan = parseInt(response.text.trim())

            if (isNaN(idPelanggan)) {
                let reply = 'ID pelanggan harus berupa angka, silahkan ulangi.'

                bot.reply(message, reply)

                convo.next()

                return
            }

            self.askPLNBulan(idPelanggan, bot, message, convo)

            convo.next()
        })
    }

    askPLNBulan(idPelanggan, bot, message, convo) {
        let self = this

        self.general.sendTypingOn(bot, message)

        convo.ask('Anda ingin cek tagihan untuk bulan berapa? Isi dengan angka 1 sampai 12', (response, convo) => {
            let bulan = parseInt(response.text.trim())

            if (isNaN(bulan)) {
                let reply = 'Bulan harus berupa angka, silahkan ulangi.'

                bot.reply(message, reply)

                convo.next()

                return
            }

            if (bulan.toString().length == 1) {
                bulan = `0${bulan}`
            }

            self.askPLNTahun(idPelanggan, bulan, bot, message, convo)

            convo.next()
        })
    }

    askPLNTahun(idPelanggan, bulan, bot, message, convo) {
        let self = this

        self.general.sendTypingOn(bot, message)

        convo.ask('Tahun berapa?', (response, convo) => {
            let tahun = parseInt(response.text.trim())

            if (isNaN(tahun)) {
                let reply = 'Tahun harus berupa angka, silahkan ulangi.'

                bot.reply(message, reply)

                convo.next()

                return
            }

            self.processPLN(idPelanggan, bulan, tahun, bot, message, convo)
        })
    }

    processPLN(idPelanggan, bulan, tahun, bot, message, convo) {
        let self = this

        self.general.sendTypingOn(bot, message)

        self.api.getTagihanPLN(idPelanggan, bulan, tahun)
            .then(body => {
                let data = body.data
                let reply = `Nama: ${data.nama}\n`
                reply += `Kota: ${data.namaupi}\n`
                reply += `Alamat: ${data.alamat}\n`
                reply += `Bulan: ${data.namathblrek}\n`
                reply += `Tagihan: ${data.tagihan}\n`
                reply += `Terbilang: ${data.terbilang}\n`

                if (data.ketlunas) {
                    reply += `Lunas: ${data.ketlunas}`
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

module.exports = PLN
