'use strict';
const {
  Model
} = require('sequelize');
const user = require('../models').User;
module.exports = (sequelize, DataTypes) => {
  class Channel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Channel.belongsTo(models.User, { foreignKey: "user_id" });
      Channel.hasMany(models.Message, { foreignKey: "channel_id" });
      Channel.hasMany(models.UserChannel, { foreignKey: "channel_id" });
      Channel.hasMany(models.ChannelResponseRate, { foreignKey: "channel_id" });
    }

    static async getAllActiveChannelsForUser(user_id){
      return Channel.findAll({where:{user_id: user_id,  ended_at: null}});
    }

    
  }
  Channel.init({
    rating: DataTypes.INTEGER,
    last_read_message:  DataTypes.DATE,
    ended_at: DataTypes.DATE,
    videocall_started_at: DataTypes.DATE,
    videocall_uuid: DataTypes.STRING,
    user_id: DataTypes.INTEGER
  }, {
      scopes: {
        status(status) {
          let opt = status == 1 ? null : {[sequelize.Op.not]: null};
          return {where: {
            ended_at: opt
          }
        }
        },
        byUser(value) {
          return {
            where: {
              user_id: value
            }
          }
        },
      },
    sequelize,
    modelName: 'Channel',
  });

  return Channel;
};