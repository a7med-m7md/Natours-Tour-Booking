const mongoose = require('mongoose')
const slugify = require('slugify')
// const User = require('./userModel')

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "A tour must have a name"],
        unique: true,
        trim: true
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a group size']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty']
    },
    ratingAverage: {
        type: Number,
        default: 4.5,
        set: (val)=>{
            return Math.round(val*10)/10
        }
    },
    ratingQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, "A tour must have a price"]
    },
    priceDiscount: Number,
    summary: {
        type: String,
        trim: true,
        required: [true, 'A tour must have a summary']
    },
    description: {
        type: String,
        required: [true, "A tour must have a description"]
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have an image cover']
    },
    images: [String],
    secretTour: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false,
    },
    startDates: [Date],
    startLocation: {
        //GeoJSON
        type: {
            type: String,
            default: 'Point',
            enum: ['Point'],
        },
        coordinates: [Number], //Longtitude and latitude,
        address: String,
        description: String
    },
    locations: [{
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
    }],
    // guides: Array
    guides: [{
        // Here it is still IDs as I put it but difference now
        // mongoose know this it is for User model
        // So, output will be IDs till I make a process called populating
        // After applying populating the output will be like embedding 
        // but it will affected when using large documents and 
        // the time will increase and the performance too
        // Populating will replace the referenced fields 
        // By its actual data and it is always happens in the query

        // steps:
        // create the refernce type
        // create the relationshop between the two datasets
        // populate that field
        type: mongoose.Schema.ObjectId,
        // we don't need to import the module like embedding
        ref: 'User'
    }]
}, {
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
})

tourSchema.index({price: 1, ratingsAverage: -1})
tourSchema.index({slug: 1})
// 2dsphere ==>> real point on the earth like sphere
// 2dindex ==>> fictional point on a simple 2 d plane
tourSchema.index({startLocation: '2dsphere'})

tourSchema.virtual('durationWeeks').get(function(){
    return this.duration / 7
})

// I can get all reviews but the problem is
// I can not get the reviews for a specific tour
// one solution to do that is to do it by making an array and seve the Ids of it 
// but I use parent refercing to avoid growing to indefinitly
// so, I use virtual populating 
// It is like virtual field 
// It will make a populting without saving data
// *** Hint: It will make a populting chain so may I lock some of them as needed
tourSchema.virtual('reviews', {
    ref: 'Review', // reference to the model
    foreignField: 'tour', // the field I want to populate from the sencond document
    localField: '_id' // the field I will connect it with the foreign field
})

//Mongoose middleware
// -- document    -- query    -- aggregation    -- model
tourSchema.pre('save', function(next){
    this.slug = slugify(this.name, '-')
    next()
})

// ***** Embedding
// It will get the document from the user and Embed it into the document
// tourSchema.pre('save', async function(next){
//     // It will return an array of promises
//     const guidePromises = this.guides.map(async id=> await User.findById(id))
//     this.guides = await Promise.all(guidePromises)
//     next()
// })

tourSchema.pre(/^find/, function(next){
    this.populate({
        path: 'guides',
        select: '-__v -passwordChanedAt'
    })
    next()
})


tourSchema.pre(/^find/, function(next){
    this.find({secretTour: {$ne: true}})
    next()
})
   

00// tourSchema.pre('aggregate', function(next){
//     this.pipeline().unshift({$match: {secretTour: {$ne: true}}})
//     next()
// })

const Tour = mongoose.model('Tour', tourSchema)


module.exports = Tour