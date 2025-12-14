const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const LikeRepository = require('../../../Domains/likes/LikeRepository');
const LikeUnlikeUseCase = require('../LikeUnlikeUseCase');

describe('LikeUnlikeUseCase', () => {
  it('should orchestrating the like comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      userId: 'user-123',
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    /** mocking needed function */
    mockThreadRepository.checkAvailability = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.checkAvailability = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockLikeRepository.isCommentLiked = jest.fn()
      .mockImplementation(() => Promise.resolve(false));
    mockLikeRepository.likeComment = jest.fn()
      .mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const likeUnlikeUseCase = new LikeUnlikeUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    await likeUnlikeUseCase.execute(useCasePayload.threadId, useCasePayload.commentId, useCasePayload.userId);

    // Assert
    expect(mockThreadRepository.checkAvailability).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.checkAvailability).toBeCalledWith(useCasePayload.commentId);
    expect(mockLikeRepository.isCommentLiked).toBeCalledWith(useCasePayload.commentId, useCasePayload.userId);
    expect(mockLikeRepository.likeComment).toBeCalledWith(useCasePayload.commentId, useCasePayload.userId);
  });

  it('should orchestrating the unlike comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      userId: 'user-123',
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    /** mocking needed function */
    mockThreadRepository.checkAvailability = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.checkAvailability = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockLikeRepository.isCommentLiked = jest.fn()
      .mockImplementation(() => Promise.resolve(true));
    mockLikeRepository.unlikeComment = jest.fn()
      .mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const likeUnlikeUseCase = new LikeUnlikeUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    await likeUnlikeUseCase.execute(useCasePayload.threadId, useCasePayload.commentId, useCasePayload.userId);

    // Assert
    expect(mockThreadRepository.checkAvailability).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.checkAvailability).toBeCalledWith(useCasePayload.commentId);
    expect(mockLikeRepository.isCommentLiked).toBeCalledWith(useCasePayload.commentId, useCasePayload.userId);
    expect(mockLikeRepository.unlikeComment).toBeCalledWith(useCasePayload.commentId, useCasePayload.userId);
  });
});
