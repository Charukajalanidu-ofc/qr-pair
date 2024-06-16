const PastebinAPI = require('pastebin-js'),
pastebin = new PastebinAPI('EMWTMkQAVfJa9kM-MRUrxd5Oku1U7pgL')
const {makeid} = require('./id');
const QRCode = require('qrcode');
const express = require('express');
const path = require('path');
const fs = require('fs');
let router = express.Router()
const pino = require("pino");
const {
	default: ShanWASocket,
	useMultiFileAuthState,
	jidNormalizedUser,
	Browsers,
	delay,
	makeInMemoryStore,
} = require("@whiskeysockets/baileys");
const axios = require("axios");

function removeFile(FilePath) {
	if (!fs.existsSync(FilePath)) return false;
	fs.rmSync(FilePath, {
		recursive: true,
		force: true
	})
};
const {
	readFile
} = require("node:fs/promises")
router.get('/', async (req, res) => {
	const id = makeid();
	async function DARK_SHAN() {
		const {
			state,
			saveCreds
		} = await useMultiFileAuthState(__dirname + '/auth_info_baileys')
		try {
			let shan = ShanWASocket({
				auth: state,
				printQRInTerminal: false,
				logger: pino({
					level: "silent"
				}),
				browser: [ "windows", "Edge", "Microsoft" ],
			});

			shan.ev.on('creds.update', saveCreds)
			shan.ev.on("connection.update", async (s) => {
				const {
					connection,
					lastDisconnect,
					qr
				} = s;
				if (qr) await res.end(await QRCode.toBuffer(qr));
				if (connection == "open") {
					await delay(5000);
					
					await delay(800);
					
				   let kushan = fs.readFileSync(__dirname + '/auth_info_baileys/creds.json');      
              const output = await axios.post('http://paste.c-net.org/',`${kushan}`, {headers: { 'Content-Type': 'application/x-www-form-urlencoded' }});
           
            let c = output.data.split('/')[3];
            
            let session  = await shan.sendMessage(shan.user.id, { 
               text: 'MR-KASUN:'+c.trim()});
				   let DARK_SHAN_MD = `┏┅┉⃝┅┅┅┅⃟┅◂ ◃ ◉ ▹ ▸┅⃟┅┅┅┅⃝┅┅┓

╟ ♤ 𝚃𝙷𝙰𝙽𝙺𝚂 𝙵𝙾𝚁 𝙲𝙷𝙾𝙾𝚂𝙴 *MR_KASUN-V2*👨‍💻┋

┋

╟ ♤ 𝙳𝙴𝚅𝙰𝙻𝙾𝙿𝙴𝚁 𝙱𝚈 *MR_KASUN-V2*✅

┋🍀have a nice day🌻

╟ 𝚃𝚄𝚃𝙾𝚁𝙸𝙰𝙻 𝙱𝙾𝚃 𝙲𝚁𝙴𝙰𝚃𝙴 𝚅𝙸𝙳𝙴𝙾

┋https://youtu.be/t7TLI7pHnF4?si=WGyI14Atcva5wshr

╟ ♤ 𝚆𝙷𝙰𝚃𝚂𝙰𝙿𝙿 𝙲𝙷𝙰𝙽𝙽𝙴𝙻

┋https://chat.whatsapp.com/L0RchYxWA8x2Lft8riYxny

╟ ♤ 𝙽𝙾𝚃𝙴

┋𝙳𝙾𝙽'𝚃 𝙿𝚁𝙾𝚅𝙸𝙳𝙴 𝚈𝙾𝚄 𝚂𝙴𝚂𝚂𝙸𝙾𝙽_𝙸𝙳 ┋ 𝚃𝙾  𝙰𝙽𝚈𝙾𝙽𝙴 𝙾𝚃𝙷𝙴𝚁𝚆𝙸𝚂𝙴 𝚃𝙷𝙰𝚃 𝙲𝙰𝙽 ┋𝙰𝙲𝙲𝙴𝚂𝚂 𝙲𝙷𝙰𝚃𝚂

◎┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅◎ 🍀WELCOME TO MR KASUN V2👨‍💻🍁

                         *MR_KASUN-V2*

◎┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅◎

┗┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┛*POWERD_BY-MR.KASUN-V2*
`

  await shan.sendMessage(shan.user.id,{text:DARK_SHAN_MD},{quoted:session})



					await delay(100);
					await shan.ws.close();
					return await removeFile(__dirname + '/auth_info_baileys');
				} else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode != 401) {
					await delay(10000);
					DARK_SHAN();
				}
			});
		} catch (err) {
			if (!res.headersSent) {
				await res.json({
					code: "Service Unavailable"
				});
			}
			console.log(err);
			await removeFile(__dirname + '/auth_info_baileys');
		}
	}
	return await DARK_SHAN()
});
module.exports = router
