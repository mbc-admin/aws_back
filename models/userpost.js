'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserPost extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.UserPost.belongsTo(models.User, { foreignKey: "user_id" });
      models.UserPost.belongsTo(models.Post, { foreignKey: "post_id" });

    }
  }
  UserPost.init({
    user_id: DataTypes.INTEGER,
    post_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'UserPost',
  });
  return UserPost;
};