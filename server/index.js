import 'dotenv/config'
import express from 'express'
import process from 'node:process'
import { disconnectDatabase } from './models/userModel.js'
import userRoutes from './routes/userRoutes.js'

const app = express()
const port = Number(process.env.PORT) || 3000

app.use(express.json({ limit: '10kb' }))

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok' })
})

app.use('/api/users', userRoutes)

app.use((error, _request, response, next) => {
  if (error instanceof SyntaxError && 'body' in error) {
    return response.status(400).json({ message: 'Request body must be valid JSON.' })
  }
  if (response.headersSent) return next(error)

  console.error('API request failed:', error)
  return response.status(500).json({ message: 'Something went wrong. Please try again.' })
})

const server = app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`)
})

async function shutdown() {
  server.close(async () => {
    await disconnectDatabase()
    process.exit(0)
  })
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
