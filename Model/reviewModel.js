const mongoose = require('mongoose')
const Tour = require('./tourModel')

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'Review can not be empty']
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    // This is a parent referencing
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to a tour']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a user']
    }
},{
    toJSON: {virtual: true},
    toObject: {virtual: true}
})

reviewSchema.index({ user: 1, tour: 1}, {unique: true})

reviewSchema.pre(/^find/, function(next){
    this.populate({
        path: 'user',
        select: 'name photo'
    })
    next()
})

reviewSchema.statics.calcAverageRatings = async function(tourId){
    // this points to the current Model
    const stats = await this.aggregate([
        {
            $match: {tour: tourId}
        },
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1},
                avgRating: {$avg: '$rating'}
            }
        }
    ])
    console.log(stats)
    await Tour.findByIdAndUpdate(tourId, {ratingAverage: stats[0].avgRating, ratingQuantity: stats[0].nRating})
}

// document middleware
reviewSchema.post('save', function(){
    // this ==>> current document
    this.constructor.calcAverageRatings(this.tour)
})

// findByIdAndUpdate
// findByIdAndDelete

// Query Middleware
reviewSchema.pre(/^findOneAnd/, async function(next){
    // this ==>> current Query
    this.r = await this.findOne()
    next()
})

reviewSchema.post(/^findOneAnd/, async function(){
    await this.r.constructor.calcAverageRatings(this.r.tour)
})

const Review = mongoose.model('Review', reviewSchema)

module.exports = Review