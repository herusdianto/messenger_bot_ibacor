'use strict'

const General = require('./conversations/general')
const Help = require('./conversations/help')
const Kurs = require('./conversations/kurs')
const PLN = require('./conversations/pln')
const Zodiak = require('./conversations/zodiak')

var help, kurs, pln, zodiak

class Conversation {

    constructor(api_key, access_token) {
        this.help = new Help(api_key, access_token)
        this.kurs = new Kurs(api_key, access_token)
        this.pln = new PLN(api_key, access_token)
        this.zodiak = new Zodiak(api_key, access_token)
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

}

module.exports = Conversation
