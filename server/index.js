import 'dotenv/config'
import process from 'node:process'
import app from './app.js'
import { disconnectDatabase } from './models/userModel.js'

const port = Number(process.env.PORT) || 3000
const server = app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`)
})

function shutdown() {
  server.close(async () => {
    await disconnectDatabase()
    process.exit(0)
  })
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
