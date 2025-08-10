import express, { Application } from 'express'
import { routes } from './routes'
import bodyParser from 'body-parser'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import { swaggerSpec } from './docs/swagger'
import deserializedToken from './middlewares/deserializedToken'
import cookieParser from 'cookie-parser'

const app: Application = express()
const PORT: number = 3300

// routes(app);
// import { logger } from "./utils/logger";

// cookie parser
app.use(cookieParser())

// body parse

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())



// cors access handler

app.use(cors({
  origin: ['http://localhost:5173', 'http://10.97.25.2:5173'],
  credentials: true,
}));

app.use((req, res, next) => {
  const allowedOrigins = ['http://localhost:5173', 'http://10.97.25.2:5173'];
  const origin = req.headers.origin;

  if (typeof origin === 'string' && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// deserialized token middleware
app.use(deserializedToken)


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
routes(app)
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`))
