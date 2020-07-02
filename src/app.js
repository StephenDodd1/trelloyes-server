require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const logger = require('../logger')
const { NODE_ENV } = require('./config')
const { v4: uuid } = require('uuid')
const cardRouter = require('./card/card-this.router')
const listRouter = require('./list/list-router')

const app = express()

const lists = [{
   id: 1,
   header: 'List One',
   cardIds: [1]
}];
 app.use(function validateBearerToken(req, res, next) {
   const apiToken = process.env.API_TOKEN
   const authToken = req.get('Authorization')
 
   if (!authToken || authToken.split(' ')[1] !== apiToken) {
      logger.error(`Unauthorized request to path: ${req.path}`);
      return res.status(401).json({ error: 'Unauthorized request' })
   }
   // move to the next middleware
   next()
})

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption))
app.use(helmet())
app.use(express.json())
app.get('/', (req, res) => {
   res.send('Hello, world!')
})

app.use(cardRouter)
app.use(listRouter)
app.use(function errorHandler(error, req, res, next) {
   let response
   if (NODE_ENV === 'production') {
      respone = { error: { message: 'server error'}}
   } else {
      console.error(error)
      response = {message: error.message, error }
   }
   res.status(500).json(response)
})
app.use(cors())

module.exports = app