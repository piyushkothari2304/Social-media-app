## Social media app with todo lists

- User registration and login with logout is added.
- Added auth using JWT
- User can add, update, mark it as complete and delete his toDo task and can only view the toDos of other user.
- Also user can add, update and delete the post and can only view others post.
- A user can view all the comments of the post by post id. Comment can be updated or deleted by the comment poster user.
- API test cases are covered using Jest

## Installation Steps

    1. npm i
    2. npm run dev
    3. To run test cases: npm run test

## Bonus Point Covered:

- Created application using typescript
- Added rate limiter, Role based access control, refresh tokens, pagination for post, todo, comment and users

## Scaling

Currently we only CRUD operations, all queries are added in service file, going forward to scale the application, we can create a repo folder. Also we can add test cases for repo files
