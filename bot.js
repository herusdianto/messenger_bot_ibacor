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

const API = require('./api')
const api = new API(api_key)

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

controller.hears([ 'help', 'bantuan' ], 'message_received', function(bot, message) {
    let reply = `Gunakan perintah di bawah ini:\n`
    reply += `help | bantuan => melihat pesan ini\n`
    reply += `kurs | cek kurs => cek kurs mata uang\n`
    reply += `pln | tagihan pln => cek tagihan pln\n`

    bot.reply(message, reply)
})

controller.hears([ 'kurs', 'cek kurs' ], 'message_received', function(bot, message) {
    bot.startConversation(message, function(response, convo) {
        let reply = api.getKursBankList()

        convo.ask(reply, function(response, convo) {
            let bank = response.text.toLowerCase()

            sendTypingOn(bot, message)

            api.getKursByBank(bank)
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

controller.hears([ 'pln', 'tagihan pln' ], 'message_received', function(bot, message) {
    bot.startConversation(message, function(response, convo) {
        askPLNIdPelanggan(bot, message, response, convo)
    })
})

controller.on('message_received', function(bot, message) {
    bot.reply(message, 'Maaf perintah tidak ditemukan, silahkan ketik `help`.')

    return
})

function askPLNIdPelanggan(bot, message, response, convo) {
    convo.ask('Berapa nomor ID pelanggan anda?', function(response, convo) {
        let idPelanggan = parseInt(response.text)

        if(isNaN(idPelanggan)) {
            let reply = 'ID pelanggan harus berupa angka, silahkan coba lagi.'

            bot.reply(message, reply)

            convo.next()

            return
        }

        sendTypingOn(bot, message)

        askPLNTahun(idPelanggan, bot, message, response, convo)

        convo.next()
    })
}

function askPLNTahun(idPelanggan, bot, message, response, convo) {
    convo.ask('Anda ingin cek tagihan untuk tahun berapa?', function(response, convo) {
        let tahun = parseInt(response.text)

        if(isNaN(tahun)) {
            let reply = 'Tahun harus berupa angka, silahkan coba lagi.'

            bot.reply(message, reply)

            convo.next()

            return
        }

        sendTypingOn(bot, message)

        askPLNBulan(idPelanggan, tahun, bot, message, response, convo)

        convo.next()
    })
}

function askPLNBulan(idPelanggan, tahun, bot, message, response, convo) {
    convo.ask('Bulan berapa? Isi dengan angka 01 sampai 12', function(response, convo) {
        let bulan = parseInt(response.text)

        if(isNaN(bulan)) {
            let reply = 'Bulan harus berupa angka, silahkan coba lagi.'

            bot.reply(message, reply)

            convo.next()

            return
        }

        // cuma ketik 1 bulan
        if(bulan.toString().length == 1) {
            bulan = `0${bulan}`
        }

        sendTypingOn(bot, message)

        api.getTagihanPLN(idPelanggan, tahun, bulan)
            .then(reply => {
                bot.reply(message, reply)

                convo.next()
            })
            .catch(reply => {
                handleError(bot, message, reply)

                convo.next()
            })
    })
}

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
