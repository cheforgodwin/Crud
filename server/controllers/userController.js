import { Prisma } from '@prisma/client'
import { userModel } from '../models/userModel.js'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateUser(body) {
  const fullName = typeof body?.fullName === 'string' ? body.fullName.trim() : ''
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
  const phone = typeof body?.phone === 'string' ? body.phone.trim() : ''
  const errors = {}

  if (!fullName) errors.fullName = 'Enter your full name.'
  if (!email) errors.email = 'Enter your email address.'
  else if (!emailPattern.test(email)) errors.email = 'Enter a valid email address.'
  if (!phone) errors.phone = 'Enter your phone number.'

  return { data: { fullName, email, phone }, errors }
}

function sendDatabaseError(error, response, next) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return response.status(409).json({
        message: 'An account with this email address already exists.',
        errors: { email: 'This email address is already registered.' },
      })
    }

    if (error.code === 'P2025') {
      return response.status(404).json({ message: 'User not found.' })
    }
  }

  return next(error)
}

export const userController = {
  async list(_request, response, next) {
    try {
      const users = await userModel.findAll()
      return response.json({ users })
    } catch (error) {
      return next(error)
    }
  },

  async get(_request, response, next) {
    try {
      const user = await userModel.findById(response.locals.userId)
      if (!user) return response.status(404).json({ message: 'User not found.' })
      return response.json({ user })
    } catch (error) {
      return next(error)
    }
  },

  async create(request, response, next) {
    const { data, errors } = validateUser(request.body)
    if (Object.keys(errors).length) {
      return response.status(400).json({ message: 'Check the highlighted fields.', errors })
    }

    try {
      const user = await userModel.create(data)
      return response.status(201).json({ message: 'User created successfully.', user })
    } catch (error) {
      return sendDatabaseError(error, response, next)
    }
  },

  async update(request, response, next) {
    const { data, errors } = validateUser(request.body)
    if (Object.keys(errors).length) {
      return response.status(400).json({ message: 'Check the highlighted fields.', errors })
    }

    try {
      const user = await userModel.update(response.locals.userId, data)
      return response.json({ message: 'User updated successfully.', user })
    } catch (error) {
      return sendDatabaseError(error, response, next)
    }
  },

  async remove(_request, response, next) {
    try {
      await userModel.delete(response.locals.userId)
      return response.json({ message: 'User deleted successfully.' })
    } catch (error) {
      return sendDatabaseError(error, response, next)
    }
  },
}

export function validateUserId(request, response, next) {
  const id = typeof request.params.id === 'string' ? request.params.id.trim() : ''
  if (!id) return response.status(400).json({ message: 'A valid user ID is required.' })
  response.locals.userId = id
  return next()
}
