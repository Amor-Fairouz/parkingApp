'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Cars', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      martricul: {
        type: Sequelize.STRING
      },
      type: {
        type: Sequelize.STRING,
      },
      startDate: {
        type: Sequelize.DATE
    },
    endDate: {
      type: Sequelize.DATE
    },

    price: {
      type: Sequelize.REAL
    },

      ParkingId: {
        type: Sequelize.INTEGER,
        onDelete: "CASCADE",
        allowNull: true,
        references: {
          model: 'Parkings',
          key: 'id'
        }
      },

      SlotId: {
        type: Sequelize.INTEGER,
        onDelete: "CASCADE",
        allowNull: trues
        references: {
          model: 'Slots',
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
    return queryInterface.dropTable('Cars');
  }
};
