const crypto = require('crypto')
const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')

// name, email, photo, password, confirm password
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'please tell us your name']
    },
    email: {
        type: String,
        required: [true, 'please provide your email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'please provide a valid email']
    },
    role: {
        type: String,
        enum: ["user", "lead", "lead-guide", "admin"],
        default: "user"
    },
    photo: String,
    password: {
        type: String,
        required: [true, 'please provide a valid password'],
        minlength: 8,
        select: false
    },
    confirmPassword: {
        type: String,
        required: [true, 'please confirm your password'],
        validate: {
            validator: function(el){
                return this.password === el
            },
            message: "passwords are not the same"
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true
    },
})

userSchema.methods.correctPassword = async function(candidatePassword, userPassword){
    return await bcrypt.compare(candidatePassword, userPassword)
}


userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(
        this.passwordChangedAt.getTime() / 1000,
        10
        );
    
        return JWTTimestamp < changedTimestamp;
    }
    
    // False means NOT changed
    return false;
};

userSchema.methods.createPasswordCreateToken = function(){
    // This is the token that will send to the user email to reset new Password
    const resetToken = crypto.randomBytes(32).toString('hex')
    // set the hashed encrypted password to the database so that if attacker access the DB can't do anything
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    // Set the expiration of the resetToken after 10 min
    console.log({resetToken}, this.passwordResetToken)
    this.passwordResetExpires = Date.now() + 10*60*1000
    // Send the unencrypted token to the user
    return resetToken
}

userSchema.pre('save', function(next){
    if(!this.isModified('password') || this.isNew) return next()
    this.passwordChangedAt = Date.now() - 1000
    next()
})

userSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next()
    this.password = await bcrypt.hash(this.password, 12)
    this.confirmPassword = undefined
    next()
})

userSchema.pre(/^find/, function(next){
    this.find({active: {$ne: false}})
    next()
})


const User = mongoose.model('User', userSchema)

module.exports = User