'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.Post.belongsTo(models.PostCategory, { foreignKey: "post_category_id" });
    }
  }
  Post.init({
    title: DataTypes.STRING,
    file: DataTypes.STRING,
    active: DataTypes.BOOLEAN,
    post_category_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Post',
  });
  return Post;
};