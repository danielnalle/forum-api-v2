const AddedComment = require("../../Domains/comments/entities/AddedComment");
const CommentRepository = require("../../Domains/comments/CommentRepository");
const NotFoundError = require("../../Commons/exceptions/NotFoundError");
const AuthorizationError = require("../../Commons/exceptions/AuthorizationError");

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(newComment, threadId, owner) {
    const { content } = newComment;
    const id = `comment-${this._idGenerator()}`;

    const query = {
      text: "INSERT INTO comments(id, content, thread_id, owner) VALUES($1, $2, $3, $4) RETURNING id, content, owner",
      values: [id, content, threadId, owner],
    };

    const result = await this._pool.query(query);

    return new AddedComment({ ...result.rows[0] });
  }

  async verifyCommentOwner(commentId, owner) {
    const query = {
      text: "SELECT owner FROM comments WHERE id = $1",
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("komentar tidak ditemukan");
    }

    const comment = result.rows[0];
    if (comment.owner !== owner) {
      throw new AuthorizationError("anda tidak berhak mengakses resource ini");
    }
  }

  async checkAvailability(commentId) {
    const query = {
      text: 'SELECT id FROM comments WHERE id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('komentar tidak ditemukan');
    }
  }

  async deleteComment(commentId) {
    const query = {
      text: "UPDATE comments SET is_delete = TRUE WHERE id = $1",
      values: [commentId],
    };

    await this._pool.query(query);
  }

  async getCommentsByThreadId(threadId) {
    const query = {
      text: `SELECT c.id, u.username, c.date, c.content, c.is_delete, COUNT(cl.comment_id) AS like_count
             FROM comments c
             JOIN users u ON c.owner = u.id
             LEFT JOIN comment_likes cl ON c.id = cl.comment_id
             WHERE c.thread_id = $1
             GROUP BY c.id, u.username
             ORDER BY c.date ASC`,
      values: [threadId],
    };

    const result = await this._pool.query(query);
    return result.rows.map((row) => ({
      id: row.id,
      username: row.username,
      date: row.date,
      content: row.is_delete ? '**komentar telah dihapus**' : row.content,
      likeCount: parseInt(row.like_count, 10),
    }));
  }
}

module.exports = CommentRepositoryPostgres;
