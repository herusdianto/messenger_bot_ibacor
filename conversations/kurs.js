'use strict'

const API = require('../api')
const General = require('./general')
var api, general

class Kurs {

    constructor(api_key, access_token) {
        this.api = new API(api_key, access_token)
        this.general = new General()
    }

    askBankKurs(bot, message) {
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
                let bank = response.text.trim().toLowerCase()

                self.general.sendTypingOn(bot, message)

                self.api.getKursByBank(bank)
                    .then(body => {
                        let data = body.data[0]

                        let namaBank = data.bank.toUpperCase()
                        let kursJual = data.kurs.jual
                        let kursBeli = data.kurs.beli

                        let reply = `Bank: ${namaBank}\n`
                        reply += `Mata Uang: ${data.kurs.mata_uang}\n`
                        reply += `Kurs Jual: ${kursJual}\n`
                        reply += `Kurs Beli: ${kursBeli}`

                        bot.reply(message, reply)

                        convo.next()
                    })
                    .catch(reply => {
                        self.general.handleError(bot, message, reply)

                        convo.next()
                    })
            })
        })
    }

}

module.exports = Kurs
