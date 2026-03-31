import dotenv from "dotenv";
dotenv.config();

const port = {
  port: process.env.PORT || 7000,   // Env file ကနေ လှမ်းယူ ပြီး မရှိရင် 7000 ကို default အနေနဲ့ သတ်မှတ်ထားတာ
  nodeEnv: process.env.NODE_ENV || "development",
};
export default port;
