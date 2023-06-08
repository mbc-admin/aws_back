'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Organization extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.Organization.hasMany(models.Department, { foreignKey: "organization_id" });
    }
  }
  Organization.init({
    name: DataTypes.STRING,
    logo: DataTypes.STRING,
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    employees: DataTypes.INTEGER,
    color1: DataTypes.STRING,
    color2: DataTypes.STRING,
    font_color: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Organization',
  });
  return Organization;
};