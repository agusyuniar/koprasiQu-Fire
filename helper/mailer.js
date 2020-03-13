const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    service : 'gmail',
    auth: {
        user: 'uu.niar@gmail.com',
        pass : 'nseimsaomzyotpyj'
    },
    tls : {
        rejectUnauthorized : false
    }
})

module.exports = {
    transporter
}