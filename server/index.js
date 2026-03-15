require("dotenv").config()

const app= require('./app')
const PORT= process.env.PORT || 3001;

app.listen(PORT, ()=>{
    console.log("\n🌬  Wind Forecast Monitor — server");
  console.log(`http://localhost:${PORT}/api/health`);
  console.log(`ENV: ${process.env.NODE_ENV || "development"}\n`);
})