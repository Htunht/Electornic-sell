import "dotenv/config";
import app from "./app";

import config from "./config";

app.listen(config.port, () => {
  console.log(`Express sever app listening on port ${config.port}`);
});
