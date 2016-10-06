'use strict'

const request = require('request')

class API {
    constructor(api_key) {
        this.api_key = api_key
    }

    getKursBankList() {
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

        return reply
    }

    getKursByBank(bank) {
        return new Promise((resolve, reject) => {
            let url = `http://ibacor.com/api/kurs?bank=${bank}`

            request(url, function (error, response, body) {
                if(error) {
                    reject(error)

                    return
                }

                if (!error && response.statusCode == 200) {
                    let object = JSON.parse(body)
                    let date = object.date
                    let data = object.data
                    let reply = ``

                    console.log(data)

                    if(data === undefined) {
                        reply = 'Data bank tidak ditemukan.'

                        reject(reply)

                        return
                    }

                    data = data[0]

                    let namaBank = data.bank.toUpperCase()
                    let kursJual = data.kurs.jual
                    let kursBeli = data.kurs.beli

                    reply += `Di bawah ini merupakan data kurs yang anda minta:\n`
                    reply += `Tanggal: ${date}\n`
                    reply += `Bank: ${namaBank}\n`
                    reply += `Mata Uang: ${data.kurs.mata_uang}\n`
                    reply += `Kurs Jual: ${kursJual}\n`
                    reply += `Kurs Beli: ${kursBeli}\n`

                    resolve(reply)
                }
            })
        })
    }
}

module.exports = API
