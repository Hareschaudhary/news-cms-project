import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', 
    port: 587,
    secure: false,
    auth: {
        user:'nayanchaudhary539@gmail.com',
        pass: 'eard prpa zkuk gdmw', 
    },
});

export default transporter;