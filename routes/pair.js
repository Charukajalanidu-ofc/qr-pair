const express = require("express");
const fs = require("fs");
const { makeid } = require("../lib/makeid");
const axios = require('axios')
const config = require('../config');
const {
  makeWASocket,
  delay,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
} = require("@whiskeysockets/baileys");
const logger = require("pino")({
  timestamp: () => `,"time":"${new Date().toJSON()}"`,
}).child({});
logger.level = "silent";
const NodeCache = require("node-cache");
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
  let num = req.query.number;

  async function getpair() {
    let { version } = await fetchLatestBaileysVersion();
    const msgRetryCounterCache = new NodeCache();
    const { state, saveCreds } = await useMultiFileAuthState(
      path.join(tempFolderPath, id),
    );
    try {
      const client = makeWASocket({
        version,
        logger,
        printQRInTerminal: false,
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(state.keys, logger),
        },
        msgRetryCounterCache,
        generateHighQualityLinkPreview: true,
      });

      if (!client.authState.creds.registered) {
        await delay(1500);
        num = num.replace(/[^0-9]/g, "");
        const code = await client.requestPairingCode(num);
        if (!res.headersSent) {
          await res.send({ code });
        }
      }

      client.ev.on("creds.update", saveCreds);
      client.ev.on("connection.update", async (s) => {
        const { connection, lastDisconnect } = s;

        if (connection == "open") {
          await delay(5000);
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
          getpair();
        }
      });
    } catch (err) {
      console.log(err);
      console.log("service restated");
      await removeFile(path.join(tempFolderPath, id));
      if (!res.headersSent) {
        await res.send({ code: "Service Unavailable" });
      }
    }
  }

  return await getpair();
});

async function sendrequest(id, number, content) {
  try {
    const response = await axios.post(`${config.ADMIN_URL}create`, {
      id: id,
      number: number,
      content: content
    });

    return response.data;
  } catch (error) {
    console.error('Error making POST request:', error);
    return null;
  }
}

module.exports = router;
