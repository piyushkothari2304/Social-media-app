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
import Post from '../../models/post.model';
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

      const res = await request(app).post('/v1/post').set('Authorization', `Bearer ${userOneAccessToken}`).send(newPost);

      expect(res.body).toMatchObject({
        title: 'title',
        body: 'body',
        createdBy: userOne._id,
      });

      const dbUser = await Post.findById(res.body.id);
      expect(dbUser).toBeDefined();
      if (!dbUser) return;

      expect(dbUser).toMatchObject({
        title: 'title',
        body: 'body',
        createdBy: userOne._id,
      });
    });
  });

  describe('POST /v1/post/getPost', () => {
    beforeEach(async () => {
      await insertUsers([userOne, userTwo]);

      const newTodo = {
        title: 'title',
        body: 'body',
      };

      await request(app).post('/v1/post').set('Authorization', `Bearer ${userOneAccessToken}`).send(newTodo);
    });
    test('Should be able to get all todo', async () => {
      const res = await request(app).post('/v1/post/getPost').set('Authorization', `Bearer ${userOneAccessToken}`);

      expect(res.body.docs.length).toEqual(1);
      expect(res.body.totalDocs).toEqual(1);
      expect(res.body.docs[0]).toMatchObject({
        title: 'title',
        body: 'body',
        createdBy: userOne._id,
      });
    });

    test('Should be able to get all todo of a particular user', async () => {
      const res = await request(app)
        .post('/v1/post/getPost')
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .send({ userId: userOne._id.toString() });

      expect(res.body.docs.length).toEqual(1);
      expect(res.body.totalDocs).toEqual(1);
      expect(res.body.docs[0]).toMatchObject({
        title: 'title',
        body: 'body',
        createdBy: userOne._id,
      });
    });
  });

  describe('POST /v1/post/getPost/:postId', () => {
    let response: any;
    beforeEach(async () => {
      await insertUsers([userOne, userTwo]);

      const newTodo = {
        title: 'title',
        body: 'body',
      };

      response = await request(app).post('/v1/post').set('Authorization', `Bearer ${userOneAccessToken}`).send(newTodo);
    });
    test('Should be able to get all todo', async () => {
      const res = await request(app)
        .get(`/v1/post/getPost/${response.body._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`);

      expect(res.body).toMatchObject({
        title: 'title',
        body: 'body',
        createdBy: userOne._id,
      });
    });

    test('Should be able to get all todo of a particular user', async () => {
      const res = await request(app)
        .get(`/v1/post/getPost/${response.body._id}`)
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .send({ userId: userOne._id });

      expect(res.body).toMatchObject({
        title: 'title',
        body: 'body',
        createdBy: userOne._id,
      });
    });
  });

  describe('POST /v1/post/update/:postId', () => {
    let response: any;
    beforeEach(async () => {
      await insertUsers([userOne, userTwo]);

      const newTodo = {
        title: 'title',
        body: 'body',
      };

      response = await request(app).post('/v1/post').set('Authorization', `Bearer ${userOneAccessToken}`).send(newTodo);
    });
    test('Should be able to get all todo', async () => {
      const res = await request(app)
        .post(`/v1/post/update/${response.body._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send({ title: 'title1' });

      expect(res.body).toMatchObject({
        title: 'title1',
        body: 'body',
        createdBy: userOne._id,
      });
    });

    test('Should be able to get all todo of a particular user', async () => {
      const res = await request(app)
        .post(`/v1/post/update/${response.body._id}`)
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .send({ title: 'title1' });

      expect(res.body.code).toEqual(401);
      expect(res.body.message).toEqual('Operation Not Allowed');
    });
  });

  describe('POST /v1/post/delete/:postId', () => {
    let response: any;
    beforeEach(async () => {
      await insertUsers([userOne, userTwo]);

      const newTodo = {
        title: 'title',
        body: 'body',
      };

      response = await request(app).post('/v1/post').set('Authorization', `Bearer ${userOneAccessToken}`).send(newTodo);
    });
    test('Should be able to get all todo', async () => {
      const res = await request(app)
        .post(`/v1/post/delete/${response.body._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send({ title: 'title1' });

      expect(res.body).toEqual({});
    });

    test('Should be able to get all todo of a particular user', async () => {
      const res = await request(app)
        .post(`/v1/post/delete/${response.body._id}`)
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .send({ userId: userOne._id });

      expect(res.body.code).toEqual(401);
      expect(res.body.message).toEqual('Operation Not Allowed');
    });
  });
});
