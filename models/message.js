'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Message.belongsTo(models.Channel, { foreignKey: "channel_id" });
      Message.belongsTo(models.User, { foreignKey: "user_id" })
    }
  }
  Message.init({
    content: DataTypes.TEXT,
    file: DataTypes.STRING,
    read_at: DataTypes.DATE,
    channel_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
    message_type: DataTypes.ENUM('message', 'event')
  }, {
    sequelize,
    modelName: 'Message',
  });
  return Message;
};