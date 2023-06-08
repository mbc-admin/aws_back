'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

    return Promise.all([
      queryInterface.addColumn('Users', 'user_type', {
        type: Sequelize.ENUM('coach','user','admin','superadmin'),
        allowNull: false,
        defaultValue: 'user'
      }),

      queryInterface.addColumn('Users', 'response_time', {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
      }),

      queryInterface.addColumn('Users', 'total_interactions', {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
      }),

      queryInterface.addColumn('Users', 'reset_password_token', {
        type: Sequelize.STRING,
        allowNull: true,
      }),

    ]);


  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
