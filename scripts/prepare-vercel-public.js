import { cpSync, existsSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

const distDirectory = resolve('dist')
const publicDirectory = resolve('public')

if (!existsSync(distDirectory)) {
  throw new Error('Run the Vite build before copying its files to the Vercel public directory.')
}

mkdirSync(publicDirectory, { recursive: true })
cpSync(distDirectory, publicDirectory, { recursive: true, force: true })
