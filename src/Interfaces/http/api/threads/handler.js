const AddThreadUseCase = require("../../../../Applications/use_case/AddThreadUseCase");
const AddCommentUseCase = require("../../../../Applications/use_case/AddCommentUseCase");
const DeleteCommentUseCase = require("../../../../Applications/use_case/DeleteCommentUseCase");
const GetThreadDetailUseCase = require("../../../../Applications/use_case/GetThreadDetailUseCase");
const LikeUnlikeUseCase = require('../../../../Applications/use_case/LikeUnlikeUseCase');

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.postCommentHandler = this.postCommentHandler.bind(this);
    this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
    this.getThreadByIdHandler = this.getThreadByIdHandler.bind(this);
    this.likeUnlikeHandler = this.likeUnlikeHandler.bind(this);
  }

  async postThreadHandler(request, h) {
    const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);
    const { id: owner } = request.auth.credentials;
    const addedThread = await addThreadUseCase.execute(request.payload, owner);

    const response = h.response({
      status: "success",
      data: {
        addedThread,
      },
    });
    response.code(201);
    return response;
  }

  async postCommentHandler(request, h) {
    const addCommentUseCase = this._container.getInstance(
      AddCommentUseCase.name
    );
    const { threadId } = request.params;
    const { id: owner } = request.auth.credentials;
    const addedComment = await addCommentUseCase.execute(
      request.payload,
      threadId,
      owner
    );

    const response = h.response({
      status: "success",
      data: {
        addedComment,
      },
    });
    response.code(201);
    return response;
  }

  async deleteCommentHandler(request, h) {
    const deleteCommentUseCase = this._container.getInstance(
      DeleteCommentUseCase.name
    );
    const { threadId, commentId } = request.params;
    const { id: owner } = request.auth.credentials;
    await deleteCommentUseCase.execute(threadId, commentId, owner);

    return {
      status: "success",
    };
  }

  async getThreadByIdHandler(request, h) {
    const getThreadDetailUseCase = this._container.getInstance(
      GetThreadDetailUseCase.name
    );
    const { threadId } = request.params;
    const thread = await getThreadDetailUseCase.execute(threadId);

    return {
      status: "success",
      data: {
        thread,
      },
    };
  }

  async likeUnlikeHandler(request, h) {
    const likeUnlikeUseCase = this._container.getInstance(LikeUnlikeUseCase.name);
    const { threadId, commentId } = request.params;
    const { id: userId } = request.auth.credentials;
    await likeUnlikeUseCase.execute(threadId, commentId, userId);

    return {
      status: 'success',
    };
  }
}

module.exports = ThreadsHandler;
