import express, { Router } from 'express';
import { validate } from '../../modules/validate';
import { auth } from '../../modules/auth';
import { postController, postValidation } from '../../modules/post';

const router: Router = express.Router();

router.route('/').post(auth(), validate(postValidation.createPost), postController.createPost);

router.route('/getPost').post(auth(), validate(postValidation.getUserPost), postController.getUserPost);

router.route('/getPost/:postId').get(auth(), validate(postValidation.getPost), postController.getPostById);

router.route('/update/:postId').post(auth(), validate(postValidation.updatePost), postController.updatePost);

router.route('/delete/:postId').post(auth(), validate(postValidation.getPost), postController.deletePost);

export default router;
