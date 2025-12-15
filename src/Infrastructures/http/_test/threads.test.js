const pool = require("../../database/postgres/pool");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const LikesTableTestHelper = require("../../../../tests/LikesTableTestHelper");
const container = require("../../container");
const createServer = require("../createServer");

describe("/threads endpoint", () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe("when POST /threads", () => {
    it("should response 201 and persisted thread", async () => {
      // Arrange
      const server = await createServer(container);
      const requestPayload = {
        title: "sebuah thread",
        body: "ini adalah body",
      };
      const registerResponse = await server.inject({
        method: "POST",
        url: "/users",
        payload: {
          username: "dicoding",
          password: "secret",
          fullname: "Dicoding Indonesia",
        },
      });
      const {
        data: { addedUser },
      } = JSON.parse(registerResponse.payload);
      const loginResponse = await server.inject({
        method: "POST",
        url: "/authentications",
        payload: { username: "dicoding", password: "secret" },
      });
      const {
        data: { accessToken },
      } = JSON.parse(loginResponse.payload);

      // Action
      const response = await server.inject({
        method: "POST",
        url: "/threads",
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.data.addedThread).toBeDefined();
      expect(responseJson.data.addedThread.owner).toEqual(addedUser.id);
    });

    it("should response 400 when request payload not contain needed property", async () => {
      // Arrange
      const server = await createServer(container);
      const requestPayload = { body: "ini body" }; // title is missing
      await server.inject({
        method: "POST",
        url: "/users",
        payload: {
          username: "dicoding",
          password: "secret",
          fullname: "Dicoding Indonesia",
        },
      });
      const loginResponse = await server.inject({
        method: "POST",
        url: "/authentications",
        payload: { username: "dicoding", password: "secret" },
      });
      const {
        data: { accessToken },
      } = JSON.parse(loginResponse.payload);

      // Action
      const response = await server.inject({
        method: "POST",
        url: "/threads",
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
    });

    it("should response 401 when request without token", async () => {
      // Arrange
      const server = await createServer(container);
      const requestPayload = { title: "judul", body: "ini body" };

      // Action
      const response = await server.inject({
        method: "POST",
        url: "/threads",
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual("Unauthorized");
    });
  });

  describe("when POST /threads/{threadId}/comments", () => {
    it("should response 201 and persisted comment", async () => {
      // Arrange
      const server = await createServer(container);
      const requestPayload = { content: "sebuah komentar" };
      const ownerRegister = await server.inject({
        method: "POST",
        url: "/users",
        payload: {
          username: "owner",
          password: "secret",
          fullname: "Thread Owner",
        },
      });
      const {
        data: { addedUser: owner },
      } = JSON.parse(ownerRegister.payload);
      const commenterRegister = await server.inject({
        method: "POST",
        url: "/users",
        payload: {
          username: "commenter",
          password: "secret",
          fullname: "Commenter User",
        },
      });
      const {
        data: { addedUser: commenter },
      } = JSON.parse(commenterRegister.payload);
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        owner: owner.id,
      });
      const loginResponse = await server.inject({
        method: "POST",
        url: "/authentications",
        payload: { username: "commenter", password: "secret" },
      });
      const {
        data: { accessToken },
      } = JSON.parse(loginResponse.payload);

      // Action
      const response = await server.inject({
        method: "POST",
        url: "/threads/thread-123/comments",
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.data.addedComment).toBeDefined();
      expect(responseJson.data.addedComment.owner).toEqual(commenter.id);
    });

    it("should response 404 when thread is not found", async () => {
      // Arrange
      const server = await createServer(container);
      const requestPayload = { content: "sebuah komentar" };
      await server.inject({
        method: "POST",
        url: "/users",
        payload: {
          username: "dicoding",
          password: "secret",
          fullname: "Dicoding Indonesia",
        },
      });
      const loginResponse = await server.inject({
        method: "POST",
        url: "/authentications",
        payload: { username: "dicoding", password: "secret" },
      });
      const {
        data: { accessToken },
      } = JSON.parse(loginResponse.payload);

      // Action
      const response = await server.inject({
        method: "POST",
        url: "/threads/thread-xxx/comments", // Non-existent thread
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual("fail");
    });
  });

  describe("when DELETE /threads/{threadId}/comments/{commentId}", () => {
    it("should response 200 and success status", async () => {
      // Arrange
      const server = await createServer(container);
      const registerResponse = await server.inject({
        method: "POST",
        url: "/users",
        payload: {
          username: "owner",
          password: "secret",
          fullname: "User Owner",
        },
      });
      const {
        data: { addedUser },
      } = JSON.parse(registerResponse.payload);
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        owner: addedUser.id,
      });
      await CommentsTableTestHelper.addComment({
        id: "comment-123",
        threadId: "thread-123",
        owner: addedUser.id,
      });
      const loginResponse = await server.inject({
        method: "POST",
        url: "/authentications",
        payload: { username: "owner", password: "secret" },
      });
      const {
        data: { accessToken },
      } = JSON.parse(loginResponse.payload);

      // Action
      const response = await server.inject({
        method: "DELETE",
        url: "/threads/thread-123/comments/comment-123",
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual("success");
    });

    it("should response 403 when user is not the owner", async () => {
      // Arrange
      const server = await createServer(container);
      const ownerRegister = await server.inject({
        method: "POST",
        url: "/users",
        payload: {
          username: "owner",
          password: "secret",
          fullname: "Owner User",
        },
      });
      const {
        data: { addedUser: owner },
      } = JSON.parse(ownerRegister.payload);
      await server.inject({
        method: "POST",
        url: "/users",
        payload: {
          username: "attacker",
          password: "secret",
          fullname: "Attacker User",
        },
      });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        owner: owner.id,
      });
      await CommentsTableTestHelper.addComment({
        id: "comment-123",
        threadId: "thread-123",
        owner: owner.id,
      });
      const attackerLogin = await server.inject({
        method: "POST",
        url: "/authentications",
        payload: { username: "attacker", password: "secret" },
      });
      const {
        data: { accessToken },
      } = JSON.parse(attackerLogin.payload);

      // Action
      const response = await server.inject({
        method: "DELETE",
        url: "/threads/thread-123/comments/comment-123",
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual("fail");
    });
  });

  describe("when GET /threads/{threadId}", () => {
    it("should response 200 and return thread detail with comments", async () => {
      // Arrange
      const server = await createServer(container);
      await UsersTableTestHelper.addUser({
        id: "user-123",
        username: "dicoding",
      });
      await UsersTableTestHelper.addUser({
        id: "user-456",
        username: "johndoe",
      });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        owner: "user-123",
        body: "body thread",
      });
      await CommentsTableTestHelper.addComment({
        id: "comment-123",
        threadId: "thread-123",
        owner: "user-456",
        content: "komentar pertama",
        date: new Date("2023-01-01T10:00:00.000Z"),
      });
      await CommentsTableTestHelper.addComment({
        id: "comment-456",
        threadId: "thread-123",
        owner: "user-123",
        isDelete: true,
        date: new Date("2023-01-01T10:05:00.000Z"),
      });

      // Action
      const response = await server.inject({
        method: "GET",
        url: "/threads/thread-123",
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread.comments).toHaveLength(2);
      expect(responseJson.data.thread.comments[0].content).toEqual(
        "komentar pertama"
      );
      expect(responseJson.data.thread.comments[1].content).toEqual(
        "**komentar telah dihapus**"
      );
    });

    it("should response 404 when thread not found", async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: "GET",
        url: "/threads/thread-xxx",
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual("fail");
    });
  });

  describe('when PUT /threads/{threadId}/comments/{commentId}/likes', () => {
    it('should response 200 and persist like when user has not liked comment', async () => {
      // Arrange
      const server = await createServer(container);
      const USERNAME = 'john_doe';
      const PASSWORD = 'secret_password';
      const FULLNAME = 'John Doe';

      const registerUserResponse = await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: USERNAME,
          password: PASSWORD,
          fullname: FULLNAME,
        },
      });
      const { data: { addedUser } } = JSON.parse(registerUserResponse.payload);

      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: addedUser.id });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: addedUser.id });

      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: USERNAME,
          password: PASSWORD,
        },
      });
      const { data: { accessToken } } = JSON.parse(loginResponse.payload);

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: '/threads/thread-123/comments/comment-123/likes',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 200 and remove like when user has liked comment', async () => {
      // Arrange
      const server = await createServer(container);
      const USERNAME = 'john_doe';
      const PASSWORD = 'secret_password';
      const FULLNAME = 'John Doe';

      const registerUserResponse = await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: USERNAME,
          password: PASSWORD,
          fullname: FULLNAME,
        },
      });
      const { data: { addedUser } } = JSON.parse(registerUserResponse.payload);

      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: addedUser.id });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: addedUser.id });
      await LikesTableTestHelper.likeComment({ commentId: 'comment-123', userId: addedUser.id });

      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: USERNAME,
          password: PASSWORD,
        },
      });
      const { data: { accessToken } } = JSON.parse(loginResponse.payload);

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: '/threads/thread-123/comments/comment-123/likes',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 404 when thread is not found', async () => {
      // Arrange
      const server = await createServer(container);
      const USERNAME = 'john_doe';
      const PASSWORD = 'secret_password';
      const FULLNAME = 'John Doe';

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: USERNAME,
          password: PASSWORD,
          fullname: FULLNAME,
        },
      });
      // No thread added here to simulate not found scenario

      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: USERNAME,
          password: PASSWORD,
        },
      });
      const { data: { accessToken } } = JSON.parse(loginResponse.payload);

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: '/threads/thread-xxx/comments/comment-123/likes',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
    });

    it('should response 404 when comment is not found', async () => {
      // Arrange
      const server = await createServer(container);
      const USERNAME = 'john_doe';
      const PASSWORD = 'secret_password';
      const FULLNAME = 'John Doe';

      const registerUserResponse = await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: USERNAME,
          password: PASSWORD,
          fullname: FULLNAME,
        },
      });
      const { data: { addedUser } } = JSON.parse(registerUserResponse.payload);
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: addedUser.id });
      // No comment added here to simulate not found scenario

      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: USERNAME,
          password: PASSWORD,
        },
      });
      const { data: { accessToken } } = JSON.parse(loginResponse.payload);

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: '/threads/thread-123/comments/comment-xxx/likes',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
    });

    it('should response 401 when request without token', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: '/threads/thread-123/comments/comment-123/likes',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
    });
  });
});
