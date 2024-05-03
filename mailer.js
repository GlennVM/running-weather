const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.MAIL,
        pass: process.env.MAIL_PASS,
    },
})

const sendMail = (recipient, subject, text) => {
    const message = {
        from: process.env.MAIL,
        to: recipient,
        subject,
        text
    }
    
    // nodemailer still works callback style, converting this to promise
    return new Promise((resolve, reject) => {
        transporter.sendMail(message, (err, res) => err ? reject(err) : resolve(res))
    })
}

module.exports = sendMail