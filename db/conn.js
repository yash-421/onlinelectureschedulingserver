const mongoose=require('mongoose')
mongoose.set('strictQuery',false)
const databaseUrl = process.env.DB;

options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    family: 4
};

mongoose.connect(databaseUrl).then(() => {
    console.log('database connection successful')
}).catch((err) => {
    console.log("no connection", err)
})