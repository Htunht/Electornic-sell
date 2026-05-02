import "dotenv/config";
import app from "./app";
import config from "./config";

app.listen(config.port, (err?: any) => {
  if (err) {
    console.error(`Failed to start server on port ${config.port}:`, err.message || err);
    process.exit(1);
  }
  console.log(`✅ Express server listening on port ${config.port}`);
});
 
 
 
 
 
 
