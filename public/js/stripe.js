const axios = require('axios')
const stripe = Stripe(process.env.STRIPE_PUBLIC_KEY + '')
import { showAlert } from './alert'

console.log(process.env.STRIPE_PUBLIC_KEY)

export const bookTour = async (tourId)=>{
    try{
        const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`)
        
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id
        })
    }
    catch(err){
        console.log(err)
        showAlert('error', err)
    }
}