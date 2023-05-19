const nodemailer = require("nodemailer");

 async function sendConfimation(req, res) {

const { firstName, lastName, email, message, mailTo } = JSON.parse(req.body);

const transporter = nodemailer.createTransport({
    port: 465,
    host: "smtp.gmail.com",
    auth: {  
        user: process.env.USER,
        pass: process.env.PASS,
    },
    secure: true,
});

await new Promise((resolve, reject) => {
    transporter.verify(function (error, success) {
        if (error) {
            console.log(error);
            reject(error);
        } else {
            console.log("Server is ready to take our messages");
            resolve(success);
        }
    });
});

const mailData = {
    from: {
        name: `${firstName} ${lastName}`,
        address: "sosthenemounsambote14@gmail.com",
    },
    replyTo: email,
    to: mailTo,
    subject: `confirmation email`,
    text: message,
    html: `${message}`,
};

await new Promise((resolve, reject) => {
    // send mail
    transporter.sendMail(mailData, (err, info) => {
        if (err) {
            console.error(err);
            reject(err);
        } else {
            console.log(info);
            resolve(info);
        }
    });
});

res.status(200).json({ status: "OK" });
};

module.exports = sendConfimation