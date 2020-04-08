'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Sessions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      email: {
        allowNull: false,
        type: Sequelize.STRING
      },
      attempt: {
        defaultValue: 0,
        allowNull: false,
        type: Sequelize.INTEGER
      },
      token: {
        allowNull: false,

        type: Sequelize.TEXT
      },
      ip: {
        allowNull: false,

        type: Sequelize.STRING
      },
      userAgent: {

        type: Sequelize.STRING
      },
      isActive: {
        defaultValue: true,

        type: Sequelize.BOOLEAN

      },
      AccountId: {
        type: Sequelize.INTEGER,
        onDelete: "CASCADE",
        allowNull: true,
        references: {
          model: 'Accounts',
          key: 'id'
        }
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Sessions');
  }
};
