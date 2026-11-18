import { Router } from 'express'
import { userController, validateUserId } from '../controllers/userController.js'

const router = Router()

router.route('/').get(userController.list).post(userController.create)
router.route('/:id')
  .all(validateUserId)
  .get(userController.get)
  .put(userController.update)
  .delete(userController.remove)

export default router
