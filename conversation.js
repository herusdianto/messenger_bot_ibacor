'use strict'

const API = require('./api')
var api

class Conversation {

    constructor(api_key, access_token) {
        this.api = new API(this.api_key, access_token)
    }

    sendTypingOn(bot, message) {
        let reply = {
            sender_action: 'typing_on'
        }

        bot.reply(message, reply)
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
                self.handleError(bot, message)
            })
    }

    sendKurs(bot, message) {
        let self = this

        bot.startConversation(message, (response, convo) => {
            let reply = {
                text: 'Silahkan pilih bank di bawah ini:',
                quick_replies: [
                    { content_type: 'text', title: 'BI', payload: 'KURS_BI' },
                    { content_type: 'text', title: 'BCA', payload: 'KURS_BCA' },
                    { content_type: 'text', title: 'BNI', payload: 'KURS_BNI' },
                    { content_type: 'text', title: 'BRI', payload: 'KURS_BRI' },
                    { content_type: 'text', title: 'BJB', payload: 'KURS_BJB' },
                ]
            }

            convo.ask(reply, (response, convo) => {
                let bank = response.text.toLowerCase()

                self.sendTypingOn(bot, message)

                self.api.getKursByBank(bank)
                    .then(reply => {
                        bot.reply(message, reply)

                        convo.next()
                    })
                    .catch(reply => {
                        self.handleError(bot, message, reply)

                        convo.next()
                    })
            })
        })
    }

    sendPLN(bot, message) {
        let self = this

        bot.startConversation(message, (response, convo) => {
            self.askPLNIdPelanggan(bot, message, response, convo)
        })
    }

    askPLNIdPelanggan(bot, message, response, convo) {
        let self = this

        convo.ask('Berapa nomor ID pelanggan anda?', (response, convo) => {
            let idPelanggan = parseInt(response.text)

            if (isNaN(idPelanggan)) {
                let reply = 'ID pelanggan harus berupa angka, silahkan coba lagi.'

                bot.reply(message, reply)

                convo.next()

                return
            }

            self.sendTypingOn(bot, message)

            self.askPLNBulan(idPelanggan, bot, message, convo)

            convo.next()
        })
    }

    askPLNBulan(idPelanggan, bot, message, convo) {
        let self = this

        convo.ask('Anda ingin cek tagihan untuk bulan berapa? Isi dengan angka 1 sampai 12', (response, convo) => {
            let bulan = parseInt(response.text)

            if (isNaN(bulan)) {
                let reply = 'Bulan harus berupa angka, silahkan coba lagi.'

                bot.reply(message, reply)

                convo.next()

                return
            }

            if (bulan.toString().length == 1) {
                bulan = `0${bulan}`
            }

            self.sendTypingOn(bot, message)

            self.askPLNTahun(idPelanggan, bulan, bot, message, convo)

            convo.next()
        })
    }

    askPLNTahun(idPelanggan, bulan, bot, message, convo) {
        let self = this

        convo.ask('Tahun berapa?', (response, convo) => {
            let tahun = parseInt(response.text)

            if (isNaN(tahun)) {
                let reply = 'Tahun harus berupa angka, silahkan coba lagi.'

                bot.reply(message, reply)

                convo.next()

                return
            }

            self.sendTypingOn(bot, message)

            self.api.getTagihanPLN(idPelanggan, bulan, tahun)
                .then(reply => {
                    bot.reply(message, reply)

                    convo.next()
                })
                .catch(reply => {
                    self.handleError(bot, message, reply)

                    convo.next()
                })
        })
    }

    handleError(bot, message, reply) {
        reply = (reply !== undefined) ? reply : 'Maaf terjadi kesalahan, silahkan coba lagi.'

        bot.reply(message, reply)
    }


}

module.exports = Conversation
