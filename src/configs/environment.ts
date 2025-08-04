import 'dotenv/config'

const config = {
  db: process.env.DB,
  jwt_public_key: process.env.JWT_PUBLIC_KEY,
  jwt_private_key: process.env.JWT_PRIVATE_KEY
}

export default config
