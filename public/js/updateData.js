import axios from 'axios'
import { showAlert } from './alert'

export const updateSettings = async (data, type)=>{
    console.log(type)
    const url = type === 'password'?  '/api/v1/users/updatePassword' : '/api/v1/users/updateMe'
    try{
        const res = await axios({
            method: 'PATCH',
            url,
            data
            })
        showAlert('success', `${type.toUpperCase()} updated successfully!`)
    }catch(err){
        showAlert('error', err.response.data.message)
    }
}