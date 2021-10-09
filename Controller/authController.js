const crypto = require('crypto')
const User = require('./../Model/userModel')
const catchAsync = require('./catchAsync')
const jwt = require('jsonwebtoken')
const AppError = require('../utils/appError')
const { promisify } = require('util')
const sendEmail = require('../utils/email')

const signtoken = id=>{
    return jwt.sign({id}, "ABCDEFGHIIDIDJODJALDJALDJLAjd", {expiresIn: "5d"})
}

// Cookies are a simple piece of text that user can send to the client
// Browser automatically save the cookie that came from the server
const createSendToken = (res, statusCode, user)=>{
    const token = signtoken(user._id)
    const cookieOptions = {
        expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        httpOnly: true // It can't accessed or modified by any way from the browser
    }
    
    if(process.env.NODE_ENV === 'production') cookieOptions.secure = true

    res.cookie('jwt', token, cookieOptions)
    user.password = undefined
    res.status(statusCode).json({
        status: 'success',
        token,
        data:{
            user
        }
    })
}

exports.signup = catchAsync(async (req, res, next)=>{
    const newUser = await User.create(req.body)
    await new sendEmail(newUser, `http://127.0.0.1:3000/me`).sendWelcome()
    createSendToken(res, 201, newUser)
})


exports.login = catchAsync(async (req, res, next)=>{
    // 1) check if email exists and password is correct
    const {email, password} = req.body
    if(!password || !email){
        return next(new AppError("Please provide email and password", 400))
    }
    // 2) check if the password is correct adn user exist
    const user = await User.findOne({email}).select("+password")
    if(!user || !(await user.correctPassword(password, user.password)) ){
        return next(new AppError("Invaild email or password", 401))
    }
    // 3) send response to the user with token
    // const token = signtoken(user._id)
    // res.status(200).json({
    //     status: "success",
    //     token
    // })

    createSendToken(res, 200, user)

})

exports.logout = (req, res, next)=>{
    res.cookie('jwt', 'logout', {
        expires: new Date(Date.now() + 20*1000),
        httpOnly: true,
    })
    res.status(200).json({status: "success"})
}

exports.protect = catchAsync(async (req, res, next)=>{
    // 1) getting the token and check if it there
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1]
    }
    else if(req.cookies.jwt){
        token = req.cookies.jwt
    }
    if(!token){
        return next(new AppError('You are not logged in! please login to get access', 401))
    }
    // *** tell now I has the token but I don't if it's valid or not

    // 2) Verification token
        // 1) payload isn't mainuplated
        // 2) the token isn't expired
        // this promise return error if the one of the above errors occur 
        // we can handle this error by using try/catch block but we handle this using global express error
    const decode = await promisify( jwt.verify )(token, "ABCDEFGHIIDIDJODJALDJALDJLAjd")

    // these following steps some tutorial are not implement them and stop here
    // but it isn't secure enough because what if the user is deleted in the current time token will still
    // -- valid and it is may cause security issue because we didn't want him to keep logged
    // 2nd reason what if the user changed his password after the token has been issued it shouldn't work
    // -- and the token should not be valid so it can't access protected route

    // 3) Check if user still exists
    const currentUser = await User.findById(decode.id)
    if(!currentUser)
        return next(new AppError('The user belongs to this tolen does no longer exits.', 401))
    // 4) Check if user changed password after the token is issued
    if (currentUser.changedPasswordAfter(decode.iat)) {
        return next(
          new AppError('User recently changed password! Please log in again.', 401)
        );
      }
    
    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser
    res.locals.user = currentUser
    next()
})

exports.isLoggedIn = async(req, res, next)=>{
    try{
        if(req.cookies.jwt){
            const decode = await promisify( jwt.verify )(req.cookies.jwt, "ABCDEFGHIIDIDJODJALDJALDJLAjd")
        
            const currentUser = await User.findById(decode.id)
            if(!currentUser)
                return next()
                
            if (currentUser.changedPasswordAfter(decode.iat)) {
                return next();
              }
            
            // GRANT ACCESS TO PROTECTED ROUTE
            
            res.locals.user = currentUser
            return next()
        }
    }catch(err){
        return next()
    }
    next()
}


/*
    ************** Authorization *****************
    Authorization ==>> users roles and permission
    == مش كل اليوزر اللي عملت لوج ان ليها الحق تعمل كل العمليات علي مورد معين 
    مثلا مش هقدر اعمل حذف لاى مستخدم والمدير هو اللى يكون ليه الحق انه يعمل كده بس
    == So, we should specify some kind of users to do some actions on specific routes
    == So, everytime we should check if certain user is allowed to access a certain resource even
    if he logged in
*/

exports.restrictTo = (...roles)=>{
    return (req, res, next)=>{
        if(!roles.includes(req.user.role)){
            return next(new AppError('You do not have the permission to do that action', 403))
        }
        next()  
    }
}


exports.forgotPassword = catchAsync(async(req, res, next)=>{
    // 1) get the user based on the given email address
    const user = await User.findOne({email: req.body.email})
    if(!user){
        return next(new AppError('There is no user with this email address', 404))
    }
    // 2) generate random reset token 
    const resetToken = user.createPasswordCreateToken()
    await user.save({ validateBeforeSave: false})

    // 3) Send it to user's email
    // const message = `Forgot your password? Submit a PATCH request 
    //             with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forgot your
    //             password, please ignore this email!`
    try{
        const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`
        await new sendEmail(user, resetURL).sendPasswordReset()

        const ev = user.passwordResetExpires
        res.status(200).json({
            status: 'success',
            message: 'Token sent to the email!'
        })
    }
    catch(err){
        user.passwordResetToken = undefined
        user.passwordResetExpires = undefined
        await user.save({ validateBeforeSave: false})

        return next(new AppError('There was an error sending the email. Try again Later!', 500))
    }
})


exports.resetPassword = catchAsync(async(req, res, next)=>{
    // 1) get the token and validate it
    const hasedToken = crypto.createHash('sha256').update(req.params.token).digest('hex')
    // 2) get the user by the token from DB
    const user = await User.findOne({passwordResetToken: hasedToken, passwordResetExpires: {$gt: Date.now()}}).select('+password')

    if(!user){
        return next(new AppError('Token is invlid or has expired', 404))
    }

    // 3) set a new password 
    if(! await (user.correctPassword(req.body.currentPassword, user.password))){
        return next(new AppError('Current password isn\'t correct, please try again', 401))
    }
    // 4) Set the changeAt 
    user.password = req.body.password
    user.confirmPassword = req.body.confirmPassword
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save()
    // 4) generate a new token and login the user
    createSendToken(res, 200, user) 
})


// It's usually to update the password apart of the rest data of the application 
// As a kind of security
exports.updatePassword = catchAsync(async (req, res, next)=>{
     // 1) Get user from collection
    const user = await User.findById(req.user._id).select('+password')
    // 2) Check if POSTed current password is correct
    if(!user.correctPassword(req.body.currentPassword, user.password)){
        return next(new AppError('Current password is wrong', 401))
    }
    // 3) If so, update password
    user.password = req.body.password
    user.confirmPassword = req.body.confirmPassword

    //const token = await signtoken(user._id)
    await user.save()
    // User.findByIdAndUpdate will NOT work as intended!

    // 4) Log user in, send JWT
    createSendToken(res, 200, user)
    next()
})