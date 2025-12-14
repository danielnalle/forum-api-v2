/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('comment_likes', {
    comment_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'comments(id)',
      onDelete: 'CASCADE',
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'users(id)',
      onDelete: 'CASCADE',
    },
  });

  pgm.addConstraint('comment_likes', 'unique_comment_id_and_user_id', {
    primaryKey: ['comment_id', 'user_id'],
  });
};

exports.down = (pgm) => {
  pgm.dropTable('comment_likes');
};