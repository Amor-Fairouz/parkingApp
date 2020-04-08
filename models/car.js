'use strict';
module.exports = (sequelize, DataTypes) => {
  let Car = sequelize.define('Car', {
    martricul: DataTypes.STRING,
    type: DataTypes.STRING,
    startDate: DataTypes.DATE,
    endDate: DataTypes.DATE,
    ParkingId: DataTypes.INTEGER,
    price : DataTypes.REAL,
    SlotId: DataTypes.INTEGER,

  }, {});
  Car.associate = function(models) {

    Car.belongsTo(models.Parking);
    Car.belongsTo(models.Slot);



  };

  return Car;
};
