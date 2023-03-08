import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import request from 'supertest';
import { faker } from '@faker-js/faker';
import moment from 'moment';
import config from '../../config/config';
import tokenTypes from '../token/token.types';
import * as tokenService from '../token/token.service';
import app from '../../app';
import setupTestDB from '../jest/setupTestDB';
import Comment from '../../models/comment.model';
import User from '../../models/user.model';

setupTestDB();

const password = 'password1';
const salt = bcrypt.genSaltSync(8);
const hashedPassword = bcrypt.hashSync(password, salt);
const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');

const userOne = {
  _id: new mongoose.Types.ObjectId(),
  name: faker.name.findName(),
  email: faker.internet.email().toLowerCase(),
  password,
  role: 'user',
  isEmailVerified: false,
};

const userTwo = {
  _id: new mongoose.Types.ObjectId(),
  name: faker.name.findName(),
  email: faker.internet.email().toLowerCase(),
  password,
  role: 'user',
  isEmailVerified: false,
};

const userOneAccessToken = tokenService.generateToken(userOne._id, accessTokenExpires, tokenTypes.ACCESS);
const userTwoAccessToken = tokenService.generateToken(userTwo._id, accessTokenExpires, tokenTypes.ACCESS);

const insertUsers = async (users: Record<string, any>[]) => {
  await User.insertMany(users.map((user) => ({ ...user, password: hashedPassword })));
};

describe('Todo routes', () => {
  describe('POST /v1/post', () => {
    test('Should be able to create new post', async () => {
      await insertUsers([userOne]);

      const newPost = {
        title: 'title',
        body: 'body',
      };

      const post = await request(app).post('/v1/post').set('Authorization', `Bearer ${userOneAccessToken}`).send(newPost);

      const newComment = {
        message: 'message',
        postId: post.body._id,
      };

      const comment = await request(app)
        .post('/v1/comment')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newComment);

      expect(comment.body).toMatchObject({
        message: 'message',
        postId: post.body._id,
        createdBy: userOne._id,
      });

      const dbUser = await Comment.findById(comment.body.id);
      expect(dbUser).toBeDefined();
      if (!dbUser) return;

      expect(dbUser).toMatchObject({
        message: 'message',
        postId: post.body._id,
        createdBy: userOne._id,
      });
    });
  });

  describe('POST /v1/comment/getComment/:postId', () => {
    let post: any;
    beforeEach(async () => {
      await insertUsers([userOne, userTwo]);

      const newPost = {
        title: 'title',
        body: 'body',
      };

      post = await request(app).post('/v1/post').set('Authorization', `Bearer ${userOneAccessToken}`).send(newPost);

      const newComment = {
        message: 'message',
        postId: post.body._id,
      };

      await request(app).post('/v1/comment').set('Authorization', `Bearer ${userOneAccessToken}`).send(newComment);
    });
    test('Should be able to get all todo', async () => {
      const res = await request(app)
        .get(`/v1/comment/getComment/${post.body._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`);

      expect(res.body.docs.length).toEqual(1);
      expect(res.body.totalDocs).toEqual(1);
      expect(res.body.docs[0]).toMatchObject({
        message: 'message',
        postId: post.body._id,
        createdBy: userOne._id,
      });
    });
  });

  describe('POST /v1/comment/update/:commentId', () => {
    let post: any;
    let comment: any;
    beforeEach(async () => {
      await insertUsers([userOne, userTwo]);

      const newPost = {
        title: 'title',
        body: 'body',
      };

      post = await request(app).post('/v1/post').set('Authorization', `Bearer ${userOneAccessToken}`).send(newPost);

      const newComment = {
        message: 'message',
        postId: post.body._id,
      };

      comment = await request(app).post('/v1/comment').set('Authorization', `Bearer ${userOneAccessToken}`).send(newComment);
    });
    test('Should be able to get all todo', async () => {
      const res = await request(app)
        .post(`/v1/comment/update/${comment.body._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send({ message: 'message1' });

      expect(res.body).toMatchObject({
        message: 'message1',
        postId: post.body._id,
        createdBy: userOne._id,
      });
    });

    test('Should be able to get all todo of a particular user', async () => {
      const res = await request(app)
        .post(`/v1/comment/update/${comment.body._id}`)
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .send({ message: 'message1' });

      expect(res.body.code).toEqual(401);
      expect(res.body.message).toEqual('Operation Not Allowed');
    });
  });

  describe('POST /v1/post/delete/:postId', () => {
    let post: any;
    let comment: any;
    beforeEach(async () => {
      await insertUsers([userOne, userTwo]);

      const newPost = {
        title: 'title',
        body: 'body',
      };

      post = await request(app).post('/v1/post').set('Authorization', `Bearer ${userOneAccessToken}`).send(newPost);

      const newComment = {
        message: 'message',
        postId: post.body._id,
      };

      comment = await request(app).post('/v1/comment').set('Authorization', `Bearer ${userOneAccessToken}`).send(newComment);
    });
    test('Should be able to get all todo', async () => {
      const res = await request(app)
        .post(`/v1/comment/delete/${comment.body._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send({ title: 'title1' });

      expect(res.body).toEqual({});
    });

    test('Should be able to get all todo of a particular user', async () => {
      const res = await request(app)
        .post(`/v1/comment/delete/${comment.body._id}`)
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .send({ userId: userOne._id });

      expect(res.body.code).toEqual(401);
      expect(res.body.message).toEqual('Operation Not Allowed');
    });
  });
});
