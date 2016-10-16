'use strict'

const General = require('./conversations/general')
const Help = require('./conversations/help')
const Kurs = require('./conversations/kurs')
const PLN = require('./conversations/pln')
const Zodiak = require('./conversations/zodiak')
const Siswa = require('./conversations/siswa')

var help,
    kurs,
    pln,
    zodiak,
    siswa

class Conversation {

    constructor(api_key, access_token) {
        this.help = new Help(api_key, access_token)
        this.kurs = new Kurs(api_key, access_token)
        this.pln = new PLN(api_key, access_token)
        this.zodiak = new Zodiak(api_key, access_token)
        this.siswa = new Siswa(api_key, access_token)
    }

    sendHelp(bot, message) {
        this.help.sendHelp(bot, message)
    }

    askBankKurs(bot, message) {
        this.kurs.askBankKurs(bot, message)
    }

    askPLN(bot, message) {
        this.pln.askPLN(bot, message)
    }

    askZodiak(bot, message) {
        this.zodiak.askZodiak(bot, message)
    }

    askSiswa(bot, message) {
        this.siswa.askSiswa(bot, message)
    }

}

module.exports = Conversation
