const path = require('path')
const express = require("express")
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet') // Every one make express app should use helmet because it handle a
                                 // Security best practices because express doesn't do that out of the box
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')
const tourRouter = require('./Routes/tourRouter')
const userRouter = require('./Routes/userRouter')
const reviewRouter = require('./Routes/reviewRouter')
const bookingRouter = require('./Routes/bookingRouter')
const viewRouter = require('./Routes/viewRouter')
const AppError = require('./utils/appError')
const globalErrorHandler = require('./Controller/errorController')
const app = express()
const cookieParser = require('cookie-parser')
const compression = require('compression')

// Setting pug templete engine
app.use(express.static(path.join(__dirname, 'public')))
app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'Views'))


// 1) Global middlewares
// Set security Http headers 
app.use(helmet())

if(process.env.NODE_ENV == "development"){
    app.use(morgan('dev'))
}

// Limit the number of requests from same IP
const limiter = rateLimit({
    max: 100,
    windowMs: 60*60*60*1000,
    message: "You do many requests from this IP, please try again in an hour"
})

app.use('/api', limiter)


// get the body data from req.body
app.use(express.json({ limit: '10kb'}))
app.use(express.urlencoded())
app.use(cookieParser())

//Data sanitize against NO SQL query injection
app.use(mongoSanitize())//It look at req.body,req.params,req.queryString and filter out dollar and dot
// Data sanitize against XSS
app.use(xss()) // and it is filter user input from any htmk milicous code by converting all html symbols

app.use(hpp({
    whitelist: 
    ['duration', 
    'price', 
    'difficulty', 
    'maxGroupSize', 
    'ratingsQuantity', 
    'ratingsAverage']
})) // 

app.use((req, res, next)=>{
    console.log(req.cookies)
    next()
})

app.use(compression())

app.use("/", viewRouter)
app.use("/api/v1/tours", tourRouter)
app.use("/api/v1/users", userRouter)
app.use("/api/v1/bookings", bookingRouter)
app.use("/api/v1/reviews", reviewRouter)
// 2) route handlers

app.use(globalErrorHandler)


// handling unhandled routes
app.all('*', (req, res, next)=>{
    // res.status(404).json({
    //     status: 'fail',
    //     message: `can't find ${req.originalUrl} route on the server`
    // })
    // const err = new Error(`can't find ${req.originalUrl} route on the server`)
    // err.statusCode = 404
    // err.status = 'fail'
    next(new AppError(`can't find ${req.originalUrl} route on the server`, 404))
})

module.exports = app

// 3) routers

// 4) start server