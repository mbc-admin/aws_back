'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserSpeciality extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.UserSpeciality.belongsTo(models.User, { foreignKey: "user_id" });
      models.UserSpeciality.belongsTo(models.Speciality, { foreignKey: "speciality_id" });
    }
  }
  UserSpeciality.init({
    user_id: DataTypes.INTEGER,
    speciality_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'UserSpeciality',
  });
  return UserSpeciality;
};