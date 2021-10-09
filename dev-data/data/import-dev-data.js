const mongoose = require('mongoose')
const fs = require('fs')
const Tour = require('./../../Model/tourModel')
const Review = require('./../../Model/reviewModel')
const User = require('./../../Model/userModel')


const DB = process.env.DATABASE.replace('<password>', process.env.DATABASE_PASSWORD)

mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
})



const tours =JSON.parse(fs.readFileSync(`${__dirname}/tours.json`))
const reviews =JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`))
const users =JSON.parse(fs.readFileSync(`${__dirname}/users.json`))

const importData = async ()=>{
    try{
        await Tour.create(tours, {validateBeforeSave: false})
        await User.create(users, {validateBeforeSave: false})
        await Review.create(reviews, {validateBeforeSave: false})
        console.log("Data imported successfully!")
    }
    catch(err){
        console.log("Can't import the data!")
    }
    process.exit()
}

const deleteData = async()=>{
    try{
        await Tour.deleteMany()
        await User.deleteMany()
        await Review.deleteMany()
        console.log("Data deleted Successfully!")
    }
    catch(err){
        console.log("Can't delete the data")
    }
    process.exit()
}

if(process.argv[2] == '--import'){
    importData()
}
else if(process.argv[2] == '--delete'){
    deleteData()
}
