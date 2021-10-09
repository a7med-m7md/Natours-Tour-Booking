const Tour = require('../Model/tourModel')
const User = require('../Model/userModel')
const Booking = require('../Model/bookingModel')
const catchAsync = require('../Controller/catchAsync')
const AppError = require('../utils/appError')

exports.getOverview = catchAsync(async(req, res)=>{
    // 1) get all tours and send it to the templete
    const tours = await Tour.find()
    res.set(
      'Content-Security-Policy',
      "default-src 'self' ws://127.0.0.1:*/ ;connect-src 'self' https://*.mapbox.com ws://127.0.0.1:*/  ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self' ;img-src 'self' data:;object-src 'none';script-src https://api.mapbox.com/ https://api.mapbox.com/mapbox-gl-js/v2.3.1/mapbox-gl.js https://js.stripe.com/v3/ ws://127.0.0.1:* ws://127.0.0.1:* 'self' blob: ;script-src-attr 'none';frame-src https://js.stripe.com/ ;style-src https://api.mapbox.com/styles/v1/* 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
    ).status(200).render('overview', {
        title: 'All tours',
        tours
    })
})

exports.getTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
      path: 'reviews',
      fields: 'review rating user'
    });
    if(!tour){
      return next(new AppError('There is no tour with this name', 404))
    }
    res
    .set(
      'Content-Security-Policy',
      //"default-src * 'unsafe-inline' 'unsafe-eval'; script-src * 'unsafe-inline' 'unsafe-eval'; connect-src * 'unsafe-inline'; img-src * data: blob: 'unsafe-inline'; frame-src *; style-src * 'unsafe-inline'"
      //"connect-src 'self' https://*.mapbox.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
      //"default-src 'self' https://js.stripe.com/* ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://js.stripe.com/v3/ https://js.stripe.com/v3/ 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;",
      "default-src 'self' ws://127.0.0.1:*/ ;connect-src 'self' https://*.mapbox.com ws://127.0.0.1:*/  ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self' ;img-src 'self' data:;object-src 'none';script-src https://api.mapbox.com/ https://api.mapbox.com/mapbox-gl-js/v2.3.1/mapbox-gl.js https://js.stripe.com/v3/ ws://127.0.0.1:* ws://127.0.0.1:* 'self' blob: ;script-src-attr 'none';frame-src https://js.stripe.com/ ;style-src https://api.mapbox.com/styles/v1/* 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
      ).status(200).render('tour', {
        title: `${tour.name} Tour`,
        tour
      });
  });

exports.login = catchAsync(async (req, res, next)=>{
    res.set(
      'Content-Security-Policy',
      "default-src 'self' ws://127.0.0.1:*/ ;connect-src 'self' https://*.mapbox.com ws://127.0.0.1:*/  ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self' ;img-src 'self' data:;object-src 'none';script-src https://api.mapbox.com/ https://api.mapbox.com/mapbox-gl-js/v2.3.1/mapbox-gl.js https://js.stripe.com/v3/ ws://127.0.0.1:* ws://127.0.0.1:* 'self' blob: ;script-src-attr 'none';frame-src https://js.stripe.com/ ;style-src https://api.mapbox.com/styles/v1/* 'self' https: 'unsafe-inline';upgrade-insecure-requests;").status(200).render('login', {
        title: 'Login'
    })
})

exports.getUserData = (req, res, next)=>{
    res.status(200).set(
      'Content-Security-Policy',
      "default-src 'self' ws://127.0.0.1:*/ ;connect-src 'self' https://*.mapbox.com ws://127.0.0.1:*/  ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self' ;img-src 'self' data:;object-src 'none';script-src https://api.mapbox.com/ https://api.mapbox.com/mapbox-gl-js/v2.3.1/mapbox-gl.js https://js.stripe.com/v3/ ws://127.0.0.1:* ws://127.0.0.1:* 'self' blob: ;script-src-attr 'none';frame-src https://js.stripe.com/ ;style-src https://api.mapbox.com/styles/v1/* 'self' https: 'unsafe-inline';upgrade-insecure-requests;").
      render('accountInfo',{title: 'Your account info.',})
  }

exports.getMyTours = catchAsync( async(req, res, next)=>{
    // Get all booking tours
    const bookings = await Booking.find({user: req.user.id})
    
    // Filter depend on user 
    const tourIDs = bookings.map(el=> el.tour)
    const tours = await Tour.find({_id: {$in: tourIDs}})
    res.status(200).set(
      'Content-Security-Policy',
      "default-src 'self' ws://127.0.0.1:*/ ;connect-src 'self' https://*.mapbox.com ws://127.0.0.1:*/  ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self' ;img-src 'self' data:;object-src 'none';script-src https://api.mapbox.com/ https://api.mapbox.com/mapbox-gl-js/v2.3.1/mapbox-gl.js https://js.stripe.com/v3/ ws://127.0.0.1:* ws://127.0.0.1:* 'self' blob: ;script-src-attr 'none';frame-src https://js.stripe.com/ ;style-src https://api.mapbox.com/styles/v1/* 'self' https: 'unsafe-inline';upgrade-insecure-requests;")
      .render('overview', {
      title: 'My Tours',
      tours
    })
    next()
})