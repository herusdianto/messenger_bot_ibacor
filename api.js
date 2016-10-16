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
                if (error) {
                    reject(error)

                    return
                }

                if (!error && response.statusCode == 200) {
                    resolve(body)
                }
            })
        })
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
                if (error) {
                    reject(error)

                    return
                }

                if (!error && response.statusCode == 200) {
                    let data = body.data

                    if (data === undefined) {
                        let reply = 'Data bank tidak ditemukan.'

                        reject(reply)

                        return
                    }

                    resolve(body)
                }
            })
        })
    }

    getTagihanPLN(idPelanggan, bulan, tahun) {
        return new Promise((resolve, reject) => {
            let url = `http://ibacor.com/api/tagihan-pln`

            request({
                method: 'GET',
                uri: url,
                qs: {
                    idp: idPelanggan,
                    thn: tahun,
                    bln: bulan,
                },
                json: true
            }, (error, response, body) => {
                if (error) {
                    reject(error)

                    return
                }

                if (!error && response.statusCode == 200) {
                    let status = body.status

                    if (status == 'error') {
                        let reply = 'Data tagihan tidak ditemukan.'

                        reject(reply)

                        return
                    }

                    resolve(body)
                }
            })
        })
    }

    getZodiak(nama, tanggal) {
        return new Promise((resolve, reject) => {
            let url = `http://ibacor.com/api/zodiak`

            request({
                method: 'GET',
                uri: url,
                qs: {
                    nama: nama,
                    tgl: tanggal,
                },
                json: true
            }, (error, response, body) => {
                if (error) {
                    reject(error)

                    return
                }

                if (!error && response.statusCode == 200) {
                    resolve(body)
                }
            })
        })
    }

}

module.exports = API
