'use strict';
module.exports = (sequelize, DataTypes) => {
  let Account = sequelize.define('Account', {

    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    telephone: DataTypes.STRING,
    isActive: DataTypes.BOOLEAN,
  }, {});
  Account.associate = function(models) {


    Account.hasMany(models.Parking, {
      as: 'parkings'
    });
    Account.hasMany(models.Session, {
      as: 'sessions'
    });





  };

  return Account;
};
