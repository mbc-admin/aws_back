'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ChannelResponseRate extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ChannelResponseRate.belongsTo(models.Channel, { foreignKey: "channel_id" })
    }
  }
  ChannelResponseRate.init({
    response_time: DataTypes.INTEGER,
    channel_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'ChannelResponseRate',
  });
  return ChannelResponseRate;
};