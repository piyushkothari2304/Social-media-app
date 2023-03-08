import express, { Router } from 'express';
import authRoute from './auth.route';
import userRoute from './user.route';
import todoRoute from './todo.route';
import postRoute from './post.route';
import commentRoute from './comment.route';

const router = express.Router();

interface IRoute {
  path: string;
  route: Router;
}

const defaultIRoute: IRoute[] = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/todo',
    route: todoRoute,
  },
  {
    path: '/post',
    route: postRoute,
  },
  {
    path: '/comment',
    route: commentRoute,
  },
];

defaultIRoute.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
