process.on('uncaughtException', err=>{
    console.log("UnCaught Exception")
    console.log(err.name, err.message)
    process.exit(1)
})

require('dotenv').config({path: './config.env'})
const app = require('./app')
const mongoose = require('mongoose')

const DB = process.env.DATABASE.replace('<password>', process.env.DATABASE_PASSWORD)

mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(()=> {
    console.log("Connected to the database")
})


const port = process.env.PORT || 3000;
const server = app.listen(port, ()=>{
    console.log("Connected")
})

process.on('unhandledRejection', err=>{
    console.log("unhandled Rejection ! shutting down ...")
    console.log(err.name, err.message)
    server.close(()=>{
        process.exit(1)
    })
})

