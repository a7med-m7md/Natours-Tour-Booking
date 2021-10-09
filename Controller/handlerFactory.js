const catchAsync = require('./catchAsync')
const ApiFeatures = require('./../utils/apiFeatures')
const AppError = require('./../utils/appError')

exports.deleteOne = Model => catchAsync(async(req, res, next)=>{
    const doc = await Model.findByIdAndDelete(req.params.id)
    if(!doc){
            return next(new AppError("No document found with that ID", 404))
        }
        res.status(204).json({
            status: "success",
            data: null
        })
})


exports.updateOne = Model=> catchAsync(async (req, res, next)=>{
        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        })
        if(!doc){
            return next(new AppError("No document found with that ID", 404))
        }
        res.status(200).json({
            status: "success",
            data: {
                data: doc
            }
        })
})


exports.createOne = Model => catchAsync(async (req, res, next)=>{
    const doc = await Model.create(req.body)
    res.status(201).json({
        status: "success",
        data: {
            data: doc
        }
    })
})


exports.getOne = (Model, popOptions)=> catchAsync(async (req, res, next)=>{
    // fill up the fields of guides with its actual data
    // populating behind the scene it is create a new query
    let query = Model.findById(req.params.id)
    if(popOptions)
        query = query.populate(popOptions)
    const doc = await query
    if(!doc){
        next(new AppError("No tour found with that ID"))
    }
    res.status(200).json({
        status: "success",
        data: {
            data: doc
        }
    })
})


exports.getAll = Model=>catchAsync(async (req, res, next)=>{
    // To allow for nested GET reviews on tour
    let filter = {}
    if(req.params.tourId) filter = {tour: req.params.tourId}

    const features = new ApiFeatures(Model.find(filter), req.query)
                    .filter()
                    .sort()
                    .limitFields()
                    .paginate()
    const docs = await features.query
    res.status(200).json({
        status: "success",
        result: docs.length,
        data: {
            data: docs
        }
    })

})