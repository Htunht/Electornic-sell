import dotenv from "dotenv";
dotenv.config();

const port = {
  port: process.env.PORT || 7000,
  nodeEnv: process.env.NODE_ENV || "development",
};
export default port;
