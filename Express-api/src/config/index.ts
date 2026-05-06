import dotenv from "dotenv";
dotenv.config();

const port = {
  port: process.env.PORT || 8085,   // Env file ကနေ လှမ်းယူ ပြီး မရှိရင် 8085 ကို default အနေနဲ့ သတ်မှတ်ထားတာ
  nodeEnv: process.env.NODE_ENV || "development",
};
export default port;
