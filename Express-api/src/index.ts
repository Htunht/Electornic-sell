import "dotenv/config";
import app from "./app";
import config from "./config";
import http from "node:http";

const preferredPort = Number(config.port);
let currentPort = Number.isFinite(preferredPort) ? preferredPort : 7000;
let attempts = 0;

const server = http.createServer(app);

server.on("error", (e: any) => {
  if (e?.code === "EADDRINUSE") {
    console.error(`❌ Port ${currentPort} is already in use.`);
  } else {
    console.error(`❌ Failed to start server on port ${currentPort}:`, e?.message ?? e);
  }
  process.exit(1);
});

server.listen(currentPort, () => {
  console.log(`✅ Express server listening on port ${currentPort}`);
});

 
 
 
 
 
 
