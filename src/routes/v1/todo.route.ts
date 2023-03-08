import express, { Router } from 'express';
import { validate } from '../../modules/validate';
import { auth } from '../../modules/auth';
import { todoController, todoValidation } from '../../modules/todo';

const router: Router = express.Router();

router.route('/').post(auth(), validate(todoValidation.createTodo), todoController.createTodo);

router.route('/getTodo').post(auth(), validate(todoValidation.getUserTodo), todoController.getUserTodo);

router.route('/getTodo/:todoId').get(auth(), validate(todoValidation.getTodo), todoController.getTodoById);

router.route('/update/:todoId').post(auth(), validate(todoValidation.updateTodo), todoController.updateTodo);

router
  .route('/markAsCompleted/:todoId')
  .post(auth(), validate(todoValidation.updateTodoStatus), todoController.markAsComplete);

router.route('/delete/:todoId').post(auth(), validate(todoValidation.getTodo), todoController.deleteTodo);

export default router;
