'use strict'

const page_token = process.env.page_token
const verify_token = process.env.verify_token
const api_key = process.env.api_key

const botkit = require('botkit')
const os = require('os')
const commandLineArgs = require('command-line-args')
const localtunnel = require('localtunnel')

const ops = commandLineArgs([
    {
        name: 'lt',
        alias: 'l',
        args: 1,
        description: 'Use localtunnel.me to make your bot available on the web.',
        type: Boolean,
        defaultValue: false
    },
    {
        name: 'ltsubdomain',
        alias: 's',
        args: 1,
        description: 'Custom subdomain for the localtunnel.me URL. This option can only be used together with --lt.',
        type: String,
        defaultValue: null
    },
])

const controller = botkit.facebookbot({
    debug: false,
    access_token: process.env.page_token,
    verify_token: process.env.verify_token,
    json_file_store: 'database'
})

const bot = controller.spawn({})

const IBacor = require('./ibacor')
const ibacor = new IBacor(api_key)

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

if(ops.lt === false && ops.ltsubdomain !== null) {
    console.log("Error: --ltsubdomain can only be used together with --lt.")
    process.exit()
}

controller.setupWebserver(process.env.port || 3000, function(err, webserver) {
    controller.createWebhookEndpoints(webserver, bot, function() {
        console.log('ONLINE!')
        if(ops.lt) {
            var tunnel = localtunnel(process.env.port || 3000, {subdomain: ops.ltsubdomain}, function(err, tunnel) {
                if (err) {
                    console.log(err)
                    process.exit()
                }
                console.log("Your bot is available on the web at the following URL: " + tunnel.url + '/facebook/receive')
            })

            tunnel.on('close', function() {
                console.log("Your bot is no longer available on the web at the localtunnnel.me URL.")
                process.exit()
            })
        }
    })
})

controller.hears('(.*) ?kurs ?(.*)', 'message_received', function(bot, message) {
    bot.startConversation(message, function(err, convo) {
        let reply = ibacor.getKursBankList()

        convo.ask(reply, function(response, convo) {
            let bank = response.text.toLowerCase()

            sendTypingOn(bot, message)

            ibacor.getKursByBank(bank)
                .then(reply => {
                    bot.reply(message, reply)

                    convo.next()
                })
                .catch(reply => {
                    handleError(bot, message, reply)

                    convo.next()
                })
        })
    })
})

controller.on('message_received', function(bot, message) {
    bot.reply(message, 'Maaf perintah tidak ditemukan, silahkan ketik `help`.')

    return
})

function sendTypingOn(bot, message) {
    let reply = {
        sender_action: 'typing_on'
    }

    bot.reply(message, reply)
}

function handleError(bot, message, reply) {
    reply = (reply !== undefined) ? reply : 'Maaf terjadi kesalahan, silahkan coba lagi.'

    bot.reply(message, reply)
}
