export const hideAlert = ()=>{
    const el = document.querySelector('.alert')
    if(el) el.parentElement.removeChild(el)
}


export const showAlert = (type, msg)=>{
    hideAlert()
    const el = document.createElement('div')
    el.className = `alert alert--${type}`
    el.innerText = msg
    // const markup = `<div class="alert alert--${type}">${msg}</div>`
    document.querySelector('body').insertAdjacentElement('afterbegin', el)
    window.setTimeout(hideAlert, 5000)
}