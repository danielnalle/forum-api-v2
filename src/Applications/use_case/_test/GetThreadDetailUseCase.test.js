const CommentRepository = require("../../../Domains/comments/CommentRepository");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const GetThreadDetailUseCase = require("../GetThreadDetailUseCase");

describe("GetThreadDetailUseCase", () => {
  it("should orchestrating the get thread detail action correctly", async () => {
    // Arrange
    const threadId = "thread-123";
    const mockThread = {
      id: threadId,
      title: "sebuah thread",
      body: "sebuah body",
      date: new Date("2023-01-01T00:00:00.000Z"),
      username: "dicoding",
    };

    const mockComments = [
      {
        id: 'comment-123',
        username: 'johndoe',
        date: new Date('2023-01-01T00:01:00.000Z'),
        content: 'komentar pertama',
        likeCount: 0,
      },
      {
        id: 'comment-456',
        username: 'dicoding',
        date: new Date('2023-01-01T00:02:00.000Z'),
        content: '**komentar telah dihapus**',
        likeCount: 0,
      },
    ];

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockThreadRepository.getThreadById = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockThread));
    mockCommentRepository.getCommentsByThreadId = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockComments));

    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const threadDetail = await getThreadDetailUseCase.execute(threadId);

    // Assert
    expect(threadDetail.id).toEqual(mockThread.id);
    expect(threadDetail.title).toEqual(mockThread.title);
    expect(threadDetail.body).toEqual(mockThread.body);
    expect(threadDetail.username).toEqual(mockThread.username);
    expect(threadDetail.comments).toHaveLength(2);
    expect(threadDetail.comments[0].content).toEqual('komentar pertama');
    expect(threadDetail.comments[1].content).toEqual(
      '**komentar telah dihapus**'
    );
    expect(threadDetail.comments[0].likeCount).toEqual(0);
    expect(threadDetail.comments[1].likeCount).toEqual(0);
    expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(
      threadId
    );
  });
});
