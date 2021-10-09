const Tour = require('./../Model/tourModel')
const catchAsync = require('./catchAsync')
const factory = require('./handlerFactory')
const AppError = require('./../utils/appError')
const multer = require('multer')
const sharp = require('sharp')

const storage = multer.memoryStorage()
const fileFilter = (req, file, cb)=>{
    if(file.mimetype.startsWith('image')) cb(null, true)
    else cb(new AppError('You can only upload Images', 400), false)
}

const upload = multer({storage, fileFilter})
exports.uploadTourImages = upload.fields([
    {name: 'imageCover', maxCount: 1},
    {name: 'images', maxCount: 3}
])

exports.resizeTourImages = catchAsync(async (req, res, next)=>{
    if(!req.files.imageCover || !req.files.images) return next()
    // 1) for the imageCover
    req.body.imageCover = `tour-${req.user.id}-${Date.now()}.jpeg`
    await sharp(req.files.imageCover[0].buffer)
                .resize(2000, 1333)
                .toFormat('jpeg')
                .jpeg({quality: 90})
                .toFile(`./public/img/tours/${req.body.imageCover}`)
    // 2) for the Images
    req.body.images = []
    await Promise.all(req.files.images.map(async (el, index)=>{
        const filename = `tour-${req.params.id}-${Date.now()}-${index}.jpeg`
        await sharp(el.buffer)
                .resize(2000, 1333)
                .toFormat('jpeg')
                .jpeg({quality: 90})
                .toFile(`./public/img/tours/${filename}`)
        req.body.images.push(filename)
    }))
    next()
})

exports.aliasTopTour = (req, res, next)=>{
    req.query.limit = '5'
    req.query.sort = '-ratingsAverage,price'
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty'
    next()
}

// I need to push errors here to the global error handler
// problems ==>> the function is async


exports.getTourStats = catchAsync(async (req, res, next)=>{
        const stats = await Tour.aggregate([
            {
                $match: {ratingAverage: {$gte: 4.5}},
            },
            {
                $group: {
                    _id: "$difficulty",
                    avgRating: {$avg: "$price"},
                    avgPrice: {$avg: "$price"},
                    minPrice: {$min: "$price"},
                    maxPrice: {$max: "$price"},
                    numTours: {$sum: 1},
                    numRatings: {$sum: "$ratingQuantity"}
                }
            },
            {
                $sort: {avgPrice: 1}
            }
    ]);
        res.status(200).json({
            status: "success",
            data:{
                stats
            }
        })
})

exports.getMonthlyPlan = catchAsync(async (req, res, next)=>{
        const year = req.params.year * 1
        const plan = await Tour.aggregate([
            {
                $unwind: "$startDates"
            },
            {
                $match: {startDates: {$gte: new Date(`${year}-01-01`), $lte: new Date(`${year}-12-31`)}}
            },
            {
                $group: {
                    _id: {$month: "$startDates"},
                    numTourStarts: {$sum: 1},
                    tours: {$push: "$name"},
                }
            },
            {
                $addFields: {
                    month: "$_id"
                }
            },
            {
                $project: {
                    _id: 0
                }
            },
            {
                $sort: {numTourStarts: -1}
            },
            {
                $limit:12
            }
        ])
        res.status(200).json({
            status: "success",
            data: {
                plan
            }
        })
})

exports.getToursWithin = catchAsync(async (req, res, next)=>{
    const {distance, latlng, unit} = req.params
    const [lat, lng] = latlng.split(',')
    if(!lat || !lng){
        return next(new AppError('Please provide longtitude and latitude', 400))
    }
    // mongo expect to get a radian value distance / raduis of the earth
    const radius = unit === 'mi'? distance / 3963.2 : distance / 6378.1
                                                        // where I find this geometry ==>> sphere
    const tours = await Tour.find({ startLocation: {$geoWithin: {$centerSphere: [[lng, lat], radius]}}})
    res.status(200).json({
        status: 'success',
        result: tours.length,
        data: {
            data: tours
        }
    })
})

exports.getDistances = catchAsync(async(req, res, next)=>{
    const {latlng, unit} = req.params
    const [lat, lng] = latlng.split(',')
    if(!lat || !lng){
        return next(new AppError('Please provide longtitude and latitude', 400))
    }

    const multiplier = unit === 'mi'? 0.000621371: 0.001

    const distances = await Tour.aggregate([
        // First Stage in aggregation pipeline should be geonear
        {
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [lng * 1, lat * 1],
                },
                distanceField: 'distance',
                distanceMultiplier: multiplier
            }
        },
        {
            $project: {
                distance: 1,
                name: 1
            }
        }
    ])

    res.status(200).json({
        status: 'success',
        data: {
            data: distances
        }
    })
})


exports.getAllTours = factory.getAll(Tour)
exports.getTour = factory.getOne(Tour, {path: 'reviews'})
exports.createTour = factory.createOne(Tour)
exports.updateTour = factory.updateOne(Tour)
exports.deleteTour = factory.deleteOne(Tour)