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

const allowedOrigins = ['http://localhost:5173', 'http://10.97.25.2:5173'];

app.use(cors({
  origin: function(origin, callback){
    if(!origin) return callback(null, true); // untuk Postman, curl dll tanpa origin
    if(allowedOrigins.indexOf(origin) === -1){
      return callback(new Error('Not allowed by CORS'), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.use((req, res, next) => {
  const allowedOrigins = ['http://localhost:5173', 'http://10.97.25.2:5173'];
  const origin = req.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  // Untuk preflight OPTIONS request langsung kirim 200 tanpa lanjut ke route lain
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});
// deserialized token middleware
app.use(deserializedToken)


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
routes(app)
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`))
