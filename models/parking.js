'use strict';
module.exports = (sequelize, DataTypes) => {
  let Parking = sequelize.define('Parking', {

    name: DataTypes.STRING,
    type: DataTypes.STRING,
    pricePerHour: DataTypes.REAL,
    capacity: DataTypes.INTEGER,
    nbrCars: DataTypes.INTEGER,
    isFull: DataTypes.BOOLEAN,
    AccountId: DataTypes.INTEGER,

  }, {});
  Parking.associate = function(models) {
    Parking.belongsTo(models.Account);

    Parking.hasMany(models.Car, {
      as: 'cars'
    });


    Parking.hasMany(models.Slot, {
      as: 'slots'
    });





  };

  return Parking;
};
