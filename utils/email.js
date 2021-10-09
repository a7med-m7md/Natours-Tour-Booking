const nodemailer = require('nodemailer')
const html2text = require('html2text')
const pug = require('pug')

module.exports = class Email {
    constructor(user, url){
        this.url = url
        this.firstName = user.name.split(' ')[0]
        this.to = user.email
        this.from = '"ِAhmed Mohamed" <new00hurt@gmail.com>'
    }

    createTransport(){
        if(process.env.NODE_ENV == 'production')
            return nodemailer.createTransport({
                service: '"SendGrid"', // no need to set host or port etc.
                auth: {
                    user: process.env.GRIDBOX_USERNAME,
                    pass: process.env.GRIDBOX_PASSWORD

                }
            })

        return nodemailer.createTransport({
            host: "smtp.mailtrap.io",
            port: 587,
            auth: {
                user: process.env.MAILTRAP_USERNAME,
                pass: process.env.MAILTRAP_PASSWORD
            }
        })
    }

    async send(templete, subject){
        const html = pug.renderFile(`${__dirname}/../Views/email/${templete}.pug`, {
            firstName: this.firstName,
            url: this.url,
            subject
        })

        const text = html2text.fromString(html)

        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            text,
            html 
        }
        console.log(mailOptions)
        await this.createTransport().sendMail(mailOptions)
    }

    async sendWelcome(){
        await this.send('welcome', 'Welcome to Natours Family!')
    }

    async sendPasswordReset(){
        await this.send('passwordReset', 'Your password reset (Valid for 10 minutes)')
    }
}

