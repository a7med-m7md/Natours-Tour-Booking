const Users = require('./../Model/userModel')
const AppError = require('./../utils/appError')
const catchAsync = require('./catchAsync')
const factory = require('./handlerFactory')
const multer = require('multer')
const sharp = require('sharp')

// const storage = multer.diskStorage({
//     destination: (req, file, cb)=>{
//         cb(null, './public/img/users/')
//     },
//     filename: (req, file, cb)=>{
//         cb(null, `${req.user.id}${Date.now()}.${file.mimetype.split('/')[1]}`)
//     }
// })

const storage = multer.memoryStorage()
const fileFilter = async (req, file, cb)=>{
    if(file.mimetype.split('/')[0] === 'image') {
        cb(null, true)
    }
    else return cb(new AppError('You can upload only images', 400), false)
}
exports.uploadUserImage = multer({storage, fileFilter}).single('photo')

exports.resizeUserImage = async(req, res, next)=>{
    if(!req.file) next()
    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`
    await sharp(req.file.buffer)
            .resize(500, 500)
            .toFormat('jpeg')
            .jpeg({quality: 90})
            .toFile(`./public/img/users/${req.file.filename}`)
    next()
}

const filterObj = (obj, ...fields)=>{
    const newObj = {}
    Object.keys(obj).forEach(el=>{
        if(fields.includes(el)){
            newObj[el] = obj[el]
        }
    })
    return newObj
}

// Here we update the whole data of the application except the password
exports.updateMe = catchAsync(async (req, res, next)=>{
    // 1) create Error if the posted Data contains password or confirm password
    if(req.body.password || req.body.confirmPassword){
        return next(new AppError('This password isnot for udating password you can use /updatePassword', 400))
    }

    // 2) filter out unwanted data by names that shouldn't be update
    const filteredBody = filterObj(req.body, 'name', 'email')
    if(req.file) filteredBody.photo = req.file.filename
    // 3) Update the user in DB
    const updatedUser = await Users.findByIdAndUpdate(req.user.id, 
        filteredBody, {new: true, runValidators: true})

        // 4) return the respose
        res.status(200).json({
            status: 'success',
            data: {
                user: updatedUser
        }
    })
})

// deleting the user by setting the active field to false
exports.deleteMe = catchAsync(async(req, res, next)=>{
    await Users.findByIdAndUpdate(req.user.id, {active: false},{new: true, runValidators: true})
    res.status(204).json({
        status: 'success',
        data: null
    })
})

exports.getMe = catchAsync(async(req, res, next)=>{
    req.params.id = req.user.id
    next()
})


exports.createUser = (req, res)=>{
    res.status(500).json({
        status: "error",
        message: "This route isn't yet defined! Please use /signup instead"
    })
}

exports.getAllUsers = factory.getAll(Users)
exports.getUser = factory.getOne(Users)
// Don't update password with this route
exports.updateUser = factory.updateOne(Users)
exports.deleteUser = factory.deleteOne(Users)