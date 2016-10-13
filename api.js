'use strict'

const request = require('request')

class API {
    constructor(api_key, access_token) {
        this.api_key = api_key
        this.access_token = access_token
    }

    getUserInfo(userId) {
        return new Promise((resolve, reject) => {
            let url = `https://graph.facebook.com/v2.6/${userId}`

            request({
                method: 'GET',
                uri: url,
                qs: {
                    fields: 'first_name,last_name,profile_pic,locale,timezone,gender',
                    access_token: this.access_token
                },
                json: true
            }, (error, response, body) => {
                if(error) {
                    reject(error)

                    return
                }

                if(body.error) {
                    reject(body.error)

                    return
                }

                if (!error && response.statusCode == 200) {
                    resolve(body)
                }
            })
        })
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
            let url = `http://ibacor.com/api/kurs`

            request({
                method: 'GET',
                uri: url,
                qs: {
                    bank: bank
                },
                json: true
            }, (error, response, body) => {
                if(error) {
                    reject(error)

                    return
                }

                if(body.error) {
                    reject(body.error)

                    return
                }

                if (!error && response.statusCode == 200) {
                    let date = body.date
                    let data = body.data
                    let reply = ``

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
                    reply += `Kurs Beli: ${kursBeli}`

                    resolve(reply)
                }
            })
        })
    }

    getTagihanPLN(idPelanggan, tahun, bulan) {
        return new Promise((resolve, reject) => {
            let url = `http://ibacor.com/api/tagihan-pln?idp=${idPelanggan}&thn=${tahun}&bln=${bulan}`

            request(url, (error, response, body) => {
                if(error) {
                    reject(error)

                    return
                }

                if(body.error) {
                    reject(body.error)

                    return
                }

                if (!error && response.statusCode == 200) {
                    let status = body.status
                    let data = body.data
                    let reply = ``

                    if(status == 'error') {
                        reply = 'Data tagihan tidak ditemukan.'

                        reject(reply)

                        return
                    }

                    reply += `Di bawah ini merupakan data tagihan PLN yang anda minta:\n`
                    reply += `Nama: ${data.nama}\n`
                    reply += `Kota: ${data.namaupi}\n`
                    reply += `Alamat: ${data.alamat}\n`
                    reply += `Bulan: ${data.namathblrek}\n`
                    reply += `Tagihan: ${data.tagihan}\n`
                    reply += `Terbilang: ${data.terbilang}\n`

                    if(data.ketlunas) {
                        reply += `Lunas: ${data.ketlunas}`
                    }

                    resolve(reply)
                }
            })
        })
    }
}

module.exports = API
