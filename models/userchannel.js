'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserChannel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      UserChannel.belongsTo(models.User, { foreignKey: "user_id" });
      UserChannel.belongsTo(models.Channel, { foreignKey: "channel_id" });
    }
  }
  UserChannel.init({
    channel_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
    last_read_message:  DataTypes.DATE,
  }, {
    sequelize,
    modelName: 'UserChannel',
  });
  return UserChannel;
};