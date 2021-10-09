// Here we will get the data from the user interface then delegate actions
import regeneratorRuntime from "regenerator-runtime"
import '@babel/polyfill'
import { logout } from '../../Controller/authController'
import { login, logOut } from './login'
import { displayMap } from './mapbox'
import { updateSettings } from './updateData'
import { bookTour } from './stripe'


const mapbox = document.getElementById('map')
const bookingBtn = document.getElementById('booking')
const loginForm = document.querySelector('.form-login')
const logoutBtn = document.querySelector('.nav__el--logout')
const updateData = document.querySelector('.form-user-data')
const updatePassword = document.querySelector('.form-user-settings')


if(mapbox){
    const locations = JSON.parse(mapbox.dataset.locations)
    displayMap(locations)
}

if(loginForm){
    loginForm.addEventListener('submit', e=>{
        e.preventDefault()
        const email = document.getElementById('email').value
        const password = document.getElementById('password').value
        login(email, password)
    })
}

if(logoutBtn) logoutBtn.addEventListener('click', logOut)

// if(updateData) updateData.addEventListener('submit', e=>{
//     location.reload(true)
// })

if(updateData){
    updateData.addEventListener('submit', e=>{
        e.preventDefault()
        const form = new FormData()
        form.append('email', document.getElementById('email').value)
        form.append('name', document.getElementById('name').value)
        form.append('photo', document.getElementById('photo').files[0])
        updateSettings(form, 'data')
    })
}

if(updatePassword){
    updatePassword.addEventListener('submit', async e=>{
        e.preventDefault()
        document.getElementById('pass-btn').innerText = 'Updating ...'
        const currentPassword = document.getElementById('password-current').value
        const password = document.getElementById('password').value
        const confirmPassword = document.getElementById('password-confirm').value
        await updateSettings({currentPassword, password, confirmPassword}, 'password')
        document.getElementById('pass-btn').innerText = 'save password'
    })
}


if(bookingBtn){
    bookingBtn.addEventListener('click', async e=>{
        bookingBtn.textContent = 'processing ....'
        await bookTour(e.target.dataset.tourId)
    })
}