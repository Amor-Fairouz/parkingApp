'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Parkings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
      },
      type: {
        type: Sequelize.STRING,
      },
      pricePerHour: {
        type: Sequelize.REAL
      },
      capacity: {
        type: Sequelize.INTEGER
      },
      nbrCars: {
        type: Sequelize.INTEGER
      },

      isFull: {
        defaultValue: false,
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
    return queryInterface.dropTable('Parkings');
  }
};
