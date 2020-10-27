import nodemailer from 'nodemailer'

const sendEmail = async (
  options: nodemailer.SendMailOptions
) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.mailtrap.io',
    port: 2525,
    auth: {
      user: process.env.SMTP_EMAIL!,
      pass: process.env.SMTP_PASSWORD!,
    },
  })

  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
  }

  const info = await transporter.sendMail(message)
  // tslint:disable-next-line:no-console
  console.log('Message sent: %s', info.messageId)
}

export default sendEmail
