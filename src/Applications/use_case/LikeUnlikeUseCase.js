class LikeUnlikeUseCase {
  constructor({ threadRepository, commentRepository, likeRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._likeRepository = likeRepository;
  }

  async execute(threadId, commentId, userId) {
    await this._threadRepository.checkAvailability(threadId);
    await this._commentRepository.checkAvailability(commentId);

    const isLiked = await this._likeRepository.isCommentLiked(commentId, userId);

    if (isLiked) {
      await this._likeRepository.unlikeComment(commentId, userId);
    } else {
      await this._likeRepository.likeComment(commentId, userId);
    }
  }
}

module.exports = LikeUnlikeUseCase;
