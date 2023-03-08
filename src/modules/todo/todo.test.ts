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
import Todo from '../../models/todo.model';
import User from '../../models/user.model';
import { TodoStatusEnum } from '../../interfaces/todo.interfaces';

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
  describe('POST /v1/todo', () => {
    test('Should be able to create new todo', async () => {
      await insertUsers([userOne]);

      const newTodo = {
        title: 'title',
        description: 'desc',
        status: TodoStatusEnum.BACKLOG,
      };

      const res = await request(app).post('/v1/todo').set('Authorization', `Bearer ${userOneAccessToken}`).send(newTodo);

      expect(res.body).toMatchObject({
        title: 'title',
        description: 'desc',
        userId: userOne._id,
        status: TodoStatusEnum.BACKLOG,
      });

      const dbUser = await Todo.findById(res.body.id);
      expect(dbUser).toBeDefined();
      if (!dbUser) return;

      expect(dbUser).toMatchObject({
        title: 'title',
        description: 'desc',
        userId: userOne._id,
        status: TodoStatusEnum.BACKLOG,
      });
    });
  });

  describe('POST /v1/todo/getTodo', () => {
    beforeEach(async () => {
      await insertUsers([userOne, userTwo]);

      const newTodo = {
        title: 'title',
        description: 'desc',
        status: TodoStatusEnum.BACKLOG,
      };

      await request(app).post('/v1/todo').set('Authorization', `Bearer ${userOneAccessToken}`).send(newTodo);
    });
    test('Should be able to get all todo', async () => {
      const res = await request(app).post('/v1/todo/getTodo').set('Authorization', `Bearer ${userOneAccessToken}`);

      expect(res.body.docs.length).toEqual(1);
      expect(res.body.totalDocs).toEqual(1);
      expect(res.body.docs[0]).toMatchObject({
        title: 'title',
        description: 'desc',
        userId: userOne._id,
        status: TodoStatusEnum.BACKLOG,
      });
    });

    test('Should be able to get all todo of a particular user', async () => {
      const res = await request(app)
        .post('/v1/todo/getTodo')
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .send({ userId: userOne._id.toString() });

      expect(res.body.docs.length).toEqual(1);
      expect(res.body.totalDocs).toEqual(1);
      expect(res.body.docs[0]).toMatchObject({
        title: 'title',
        description: 'desc',
        userId: userOne._id,
        status: TodoStatusEnum.BACKLOG,
      });
    });
  });

  describe('POST /v1/todo/getTodo/:todoId', () => {
    let response: any;
    beforeEach(async () => {
      await insertUsers([userOne, userTwo]);

      const newTodo = {
        title: 'title',
        description: 'desc',
        status: TodoStatusEnum.BACKLOG,
      };

      response = await request(app).post('/v1/todo').set('Authorization', `Bearer ${userOneAccessToken}`).send(newTodo);
    });
    test('Should be able to get all todo', async () => {
      const res = await request(app)
        .get(`/v1/todo/getTodo/${response.body._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`);

      expect(res.body).toMatchObject({
        title: 'title',
        description: 'desc',
        userId: userOne._id,
        status: TodoStatusEnum.BACKLOG,
      });
    });

    test('Should be able to get all todo of a particular user', async () => {
      const res = await request(app)
        .get(`/v1/todo/getTodo/${response.body._id}`)
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .send({ userId: userOne._id });

      expect(res.body).toMatchObject({
        title: 'title',
        description: 'desc',
        userId: userOne._id,
        status: TodoStatusEnum.BACKLOG,
      });
    });
  });

  describe('POST /v1/todo/update/:todoId', () => {
    let response: any;
    beforeEach(async () => {
      await insertUsers([userOne, userTwo]);

      const newTodo = {
        title: 'title',
        description: 'desc',
        status: TodoStatusEnum.BACKLOG,
      };

      response = await request(app).post('/v1/todo').set('Authorization', `Bearer ${userOneAccessToken}`).send(newTodo);
    });
    test('Should be able to get all todo', async () => {
      const res = await request(app)
        .post(`/v1/todo/update/${response.body._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send({ title: 'title1' });

      expect(res.body).toMatchObject({
        title: 'title1',
        description: 'desc',
        userId: userOne._id,
        status: TodoStatusEnum.BACKLOG,
      });
    });

    test('Should be able to get all todo of a particular user', async () => {
      const res = await request(app)
        .post(`/v1/todo/update/${response.body._id}`)
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .send({ title: 'title1' });

      expect(res.body.code).toEqual(401);
      expect(res.body.message).toEqual('Operation Not Allowed');
    });
  });

  describe('POST /v1/todo/delete/:todoId', () => {
    let response: any;
    beforeEach(async () => {
      await insertUsers([userOne, userTwo]);

      const newTodo = {
        title: 'title',
        description: 'desc',
        status: TodoStatusEnum.BACKLOG,
      };

      response = await request(app).post('/v1/todo').set('Authorization', `Bearer ${userOneAccessToken}`).send(newTodo);
    });
    test('Should be able to get all todo', async () => {
      const res = await request(app)
        .post(`/v1/todo/delete/${response.body._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send({ title: 'title1' });

      expect(res.body).toEqual({});
    });

    test('Should be able to get all todo of a particular user', async () => {
      const res = await request(app)
        .post(`/v1/todo/delete/${response.body._id}`)
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .send({ userId: userOne._id });

      expect(res.body.code).toEqual(401);
      expect(res.body.message).toEqual('Operation Not Allowed');
    });
  });
});
