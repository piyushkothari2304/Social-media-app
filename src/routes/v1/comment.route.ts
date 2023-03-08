import express, { Router } from 'express';
import { validate } from '../../modules/validate';
import { auth } from '../../modules/auth';
import { commentController, commentValidation } from '../../modules/comment';

const router: Router = express.Router();

router.route('/').post(auth(), validate(commentValidation.createComment), commentController.createComment);

router
  .route('/getComment/:postId')
  .get(auth(), validate(commentValidation.getComment), commentController.getCommentByPostId);

router.route('/update/:commentId').post(auth(), validate(commentValidation.updateComment), commentController.updateComment);

router.route('/delete/:commentId').post(auth(), validate(commentValidation.deleteComment), commentController.deleteComment);

export default router;
