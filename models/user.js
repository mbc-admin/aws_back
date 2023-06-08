'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.User.hasMany(models.Device, { foreignKey: "user_id" });
      models.User.belongsTo(models.Organization, { foreignKey: "organization_id" });
      models.User.belongsTo(models.Department, { foreignKey: "department_id" });
      models.User.belongsTo(models.Country, { foreignKey: "country_id" });
      models.User.hasMany(models.UserSpeciality, { foreignKey: "user_id" });
      models.User.belongsToMany(models.Speciality, { through: models.UserSpeciality, foreignKey: "user_id", otherKey: 'speciality_id'  });
      User.hasMany(models.Channel, { foreignKey: "user_id" });
      User.hasMany(models.Message, { foreignKey: "user_id" });
      User.hasMany(models.UserChannel, { foreignKey: "user_id" });

    }
  }
  User.init({
    name: DataTypes.STRING,
    lastname: DataTypes.STRING,
    image: DataTypes.STRING,
    status: DataTypes.STRING,
    phone: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    nif: DataTypes.STRING,
    description: DataTypes.TEXT,
    birthday: DataTypes.DATE,
    gender: DataTypes.STRING,
    country_id: DataTypes.INTEGER,
    city: DataTypes.STRING,
    organization_id: DataTypes.INTEGER,
    department_id: DataTypes.INTEGER,
    reset_password_token: DataTypes.STRING,
    user_type: DataTypes.ENUM('coach','user','admin','superadmin'),
    response_time: DataTypes.INTEGER,
    total_interactions: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};