require("dotenv").config()

const app= require('./app')
const PORT= process.env.PORT || 3001;
const logger= require("./src/utils/logger");

app.listen(PORT, ()=>{
  logger.info({ port: PORT, env: process.env.NODE_ENV || "development" }, "Server started");
});