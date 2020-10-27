import dotenv from 'dotenv'

dotenv.config()

declare module 'email-config' {
  emailHost: process.env.SMTP_HOST ?? ''
  emailPort: process.env.SMTP_PORT ?? ''
}
