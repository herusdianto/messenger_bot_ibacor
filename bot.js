'use strict'

const page_token = process.env.page_token
const verify_token = process.env.verify_token
const api_key = process.env.api_key

const botkit = require('botkit')
const os = require('os')
const commandLineArgs = require('command-line-args')
const localtunnel = require('localtunnel')

const ops = commandLineArgs([{
    name: 'lt',
    alias: 'l',
    args: 1,
    description: 'Use localtunnel.me to make your bot available on the web.',
    type: Boolean,
    defaultValue: false
}, {
    name: 'ltsubdomain',
    alias: 's',
    args: 1,
    description: 'Custom subdomain for the localtunnel.me URL. This option can only be used together with --lt.',
    type: String,
    defaultValue: null
}, ])

const controller = botkit.facebookbot({
    debug: false,
    access_token: process.env.page_token,
    verify_token: process.env.verify_token,
    json_file_store: 'database'
})

const bot = controller.spawn({})

const Conversation = require('./conversation')
const conversation = new Conversation(api_key, page_token)

if (!page_token) {
    console.log('Error: Specify page_token in environment')
    process.exit(1)
}

if (!verify_token) {
    console.log('Error: Specify verify_token in environment')
    process.exit(1)
}

if (!api_key) {
    console.log('Error: Specify api_key in environment')
    process.exit(1)
}

if (ops.lt === false && ops.ltsubdomain !== null) {
    console.log('Error: --ltsubdomain can only be used together with --lt.')
    process.exit()
}

controller.setupWebserver(process.env.port || 3000, (err, webserver) => {
    controller.createWebhookEndpoints(webserver, bot, () => {
        console.log('ONLINE!')

        if (ops.lt) {
            var tunnel = localtunnel(process.env.port || 3000, { subdomain: ops.ltsubdomain }, (err, tunnel) => {
                if (err) {
                    console.log(err)
                    process.exit()
                }
                console.log('Your bot is available on the web at the following URL: ' + tunnel.url + '/facebook/receive')
            })

            tunnel.on('close', () => {
                console.log('Your bot is no longer available on the web at the localtunnnel.me URL.')
                process.exit()
            })
        }
    })
})

controller.hears(['help', 'bantuan'], 'message_received', (bot, message) => {
    conversation.sendHelp(bot, message)
})

controller.hears(['kurs'], 'message_received', (bot, message) => {
    conversation.askBankKurs(bot, message)
})

controller.hears(['pln'], 'message_received', (bot, message) => {
    conversation.askPLN(bot, message)
})

controller.on('message_received', (bot, message) => {
    bot.reply(message, 'Maaf perintah tidak ditemukan, silahkan ketik `help atau bantuan`.')

    return
})
