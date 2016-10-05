# iBacor Messenger BOT

Repo ini merupakan contoh messenger BOT menggunakan [BotKit](https://github.com/howdyai/botkit) dan API dari [iBacor](ibacor.com/).

## Install

1. Clone repo

        git clone https://gitlab.com/herusdianto/messenger_bot_ibacor.git

2. Setelah selesai, buka terminal kemudian arahkan ke folder `messenger_bot_ibacor`:

        cd messenger_bot_ibacor

3. Install node dependencies:

        npm install

4. Copy file `run.sh.example` dan beri nama `run.sh`:

        cp run.sh.example run.sh

5. Sesuaikan value variabel `ACCESS_TOKEN` & `VERIFY_TOKEN` (didapat dari Facebook), `API_KEY` (didapat dari iBacor) dan `SUBDOMAIN` (untuk proses testing menggunakan Localtunnel).

6. Jalankan script `run.sh`:

        chmod +x run.sh

        ./run.sh

Untuk sementara (sampai botkit rilis minimal v0.2.3) anda harus ikuti langkah-langkah berikut:

1. Agar BotKit mendukung fitur Quick Reply Messenger, rubah file Facebook.js sesuai dengan petunjuk [disini](https://github.com/howdyai/botkit/pull/306/files).
2. Agar BotKit mendukung fitur Typing On, rubah file Facebook.js sesuai dengan petunjuk [disini](https://github.com/howdyai/botkit/pull/407/files).
