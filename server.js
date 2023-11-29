const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const http = require("http");
const admin=require('./admin/adminRoutes')
require("dotenv").config();
require("./db/conn");
const cors = require('cors')
const server = http.createServer(app);



const corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200 
}

app.use(cors(corsOptions))
app.use(bodyParser.json());

app.use('/admin',admin)

app.get('/', (req, res) => {
  res.send('Welcome to Online')
})

app.use('/uploads',express.static('uploads'))

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});