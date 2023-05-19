require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
app.use(express.json());
const cors = require("cors");
app.use(cors());
const port = 5007 || 3000;
const mongoUrl = process.env.MONGO_URL;
const bodyParser = require("body-parser");
app.use(bodyParser.json());
const sendConfimation = require("./get-confirmation-code");

function connectToDatabase() {
  mongoose
    .connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {})
    .catch((error) => {});
}

const User = require("./schema_mongo");
const liste = [];

app.post("/userConfirmPass", async (req, res) => {
  try {
    const email = req.body.email;
    const emailEncrypted = req.body.emailEncrypted;
    const user = await User.findOne({ email: email });
    if (!user) {
      res.status(400).send();
      console.log("erreur");
    } else {
      const req = {
        body: JSON.stringify({
          firstName: "Sosthène",
          lastName: "Mounsamboté",
          email: "sosthenemounsambote14@gmail.com",
          message: `<div style="background-color: #f5f5f5; padding: 20px;">
          <h2 style="color: #333;">Veuillez confirmer votre adresse e-mail</h2>
          <p style="background-color: #fff; padding: 10px; border: 1px solid #ccc;">
            Veuillez confirmer votre adresse e-mail afin de vous connecter à votre compte. Votre code de confirmation est :
            <span style="color: blue; font-weight: bold;">${liste[0]}</span>
          </p>
          <span style="color: red; font-weight: bold;">Ce code va expirer dans 30 minutes</span>
          <p style="color: #333;">Merci de faire confiance à Unidocs.</p>
          <p style="color: red; font-weight: bold;">Cordialement,<br/>
          L'équipe Unidocs</p> 
        </div>
        `,
          mailTo: email,
        }),
      };

      const res = {
        status: (statusCode) => {
          console.log("Status:", statusCode);
          return {
            json: (data) => {
              console.log("Response:", data);
            },
          };
        },
      };
      sendConfimation(req,res)
      res.status(200).send(emailEncrypted);
    }
  } catch (error) {
    res.send({ status: error });
  }
});

app.get("/generateRandomCode", (req, res) => {
  const randomCode = generateRandomCode(6);
  liste[0] = randomCode;
  res.send({ code: randomCode , a: process.env.USER, b:process.env.PASS});
});

function generateRandomCode(length) {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

async function startServer() {
  await connectToDatabase();
  app.listen(port, () => {
    console.log(port);
  });
}

startServer();

const nodemailer = require("nodemailer");
async function sendEmail(emailEncrypted, mailTo) {
  try {
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.USER,
        pass: process.env.PASS,
      },
    });

    const mailOptions = {
      from: "sosthenemounsambote14@gmail.com",
      to: mailTo,
      subject: "Confirmation mail",
      html: `<div style="background-color: #f5f5f5; padding: 20px;">
      <h2 style="color: #333;">Veuillez confirmer votre adresse e-mail</h2>
      <p style="background-color: #fff; padding: 10px; border: 1px solid #ccc;">
        Veuillez confirmer votre adresse e-mail afin de vous connecter à votre compte. Votre code de confirmation est :
        <span style="color: blue; font-weight: bold;">${liste[0]}</span>
      </p>
      <span style="color: red; font-weight: bold;">Ce code va expirer dans 30 minutes</span>
      <p style="color: #333;">Merci de faire confiance à Unidocs.</p>
      <p style="color: red; font-weight: bold;">Cordialement,<br/>
      L'équipe Unidocs</p> 
    </div>
    `,
    };

    let info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}
