'use strict';
module.exports = (sequelize, DataTypes) => {
  let Slot = sequelize.define('Slot', {

    position: DataTypes.STRING,
    isEmpty: DataTypes.BOOLEAN,
    ParkingId: DataTypes.INTEGER,

  }, {});
  Slot.associate = function(models) {
    Slot.belongsTo(models.Parking);

  };


    



  return Slot;
};
