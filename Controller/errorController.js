const AppError = require('./../utils/appError')

const handleCastErrorDB = (err)=>{
    const message = `Invalid ${err.path}: ${err.value}`
    return AppError(message, 400)
}

const handleDuplicateErrorDB = (err)=>{
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0]
    const message = `Duplicate field value: ${value}. please use another value`
    return new AppError(message, 400)
}

const handleValidationErrorDB = (err)=>{
    const errors = Object.values(err.errors).map(el=> el.message)
    const message = `Invalid input data. ${errors.join('. ')}`
    return new AppError(message, 400)
}

const handleJsonWebTokenError = ()=> new AppError('Invalid Token, Please! loging again')


const handleTokenExpiredError = ()=> new AppError('Your token has expired! please login to get access', 401)


const sendErrorDev = (err, req, res)=>{
    // Errors For API
    if(req.originalUrl.startsWith('/api')){
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        })
    }
    // Errors to be rendered
    return res.status(err.statusCode).render('error', {
        title: 'Some thing went wrong!',
        msg: err.message
    })
}

const sendErrorProd = (err, req, res)=>{
    // For API
    if(req.originalUrl.startsWith('/api')){
        if(err.isOperational){
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message,
            })
        }
        console.log('Error ', err)
        return res.status(500).json({
            status: 'error',
            message: 'Something went very wrong'
        })
    }
    // For rendering pages
    if(err.isOperational){
        return res.status(err.statusCode).render('error', {
            title: 'Some thing went wrong!',
            msg: err.message,
        })
    }
    console.log('Error ', err)
    return res.status(500).render('error', {
        title: 'Some thing went wrong!',
        msg: 'please try again later!'
    })

}

module.exports = (err, req, res, next)=>{
    err.statusCode = err.statusCode || 500
    err.status = err.status || 'error'
    if(process.env.NODE_ENV === 'development'){
        sendErrorDev(err, req, res)
    }
    else if(process.env.NODE_ENV === 'production'){
        const error = {...err}
        if(error.name === 'CastError')
            error = handleCastErrorDB(error)
        if(error.code === 11000)
            error = handleDuplicateErrorDB(error)
        if(error.name === 'ValidationError')
            error = handleValidationErrorDB(error)
        if(error.name === 'JsonWebTokenError')
            handleJsonWebTokenError()
        if(error.name === 'TokenExpiredError')
            handleTokenExpiredError()
        sendErrorProd(error, req, res)
    }
        
}
