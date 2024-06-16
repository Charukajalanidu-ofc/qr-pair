const QRCode = require("qrcode");
const express = require("express");
const axios = require('axios');
const pino = require("pino");
const fs = require("fs");
const { makeid } = require("../lib/makeid");
const config = require('../config');
const {
  makeWASocket,
  useMultiFileAuthState,
  delay,
  fetchLatestBaileysVersion,
} = require("@whiskeysockets/baileys");
const router = express.Router();
const path = require("path");
const tempFolderPath = path.join(__dirname, "temp");

function removeFile(filePath) {
  if (!fs.existsSync(filePath)) return false;
  fs.rmSync(filePath, {
    recursive: true,
    force: true,
  });
}

router.get("/", async (req, res) => {
  const id = makeid();
  
  async function Getqr() {
    const { state, saveCreds } = await useMultiFileAuthState(path.join(tempFolderPath, id));
    const { version } = await fetchLatestBaileysVersion();
    try {
      const client = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: "silent" }),
        browser: ["Chrome", "Ubuntu", "3.0"],
      });

      client.ev.on("creds.update", saveCreds);
      client.ev.on("connection.update", async (s) => {
        const { connection, lastDisconnect, qr } = s;
        if (qr) await res.end(await QRCode.toBuffer(qr));
        if (connection == "open") {
          await delay(5000);
          const credsPath = path.join(tempFolderPath, id, "creds.json");
          const unique = fs.readFileSync(credsPath);
          const content = Buffer.from(unique).toString("base64");
          const response = await sendrequest(id, client.user.id, content);
          if (response && response.success === true) {
            await client.sendMessage(client.user.id, { text: id });
          } else {
            await client.sendMessage(client.user.id, { text: content });
          }
          await delay(100);
          await client.ws.close();
          return await removeFile(path.join(tempFolderPath, id));
        } else if (
          connection === "close" &&
          lastDisconnect &&
          lastDisconnect.error &&
          lastDisconnect.error.output.statusCode != 401
        ) {
          await delay(10000);
          Getqr();
        }
      });
    } catch (err) {
      if (!res.headersSent) {
        await res.json({ code: "Service Unavailable" });
      }
      console.log(err);
      await removeFile(path.join(tempFolderPath, id));
    }
  }
  return await Getqr();
});

async function sendrequest(id, number, content) {
  try {
    const response = await axios.post(`${config.ADMIN_URL}create`, {
      id: id,
      number: number,
      content: content,
    });
    return response.data;
  } catch (error) {
    console.error('Error making POST request:', error);
    return null;
  }
}

module.exports = router;

                         
