let express = require('express');
let router = express.Router();
const log = require('../policies/tools').log
const fs = require("fs");
const {
  check, validationResult
} = require('express-validator');
const sequelize = require("sequelize");
const Op = sequelize.Op;
const appRootPath = require('app-root-path');

const path = require("path");

router.post('/create',  function(req, res, next) {

  if (req.connectedUser.isActive == true) {
    req.body.nbrCars= 0;
    req.body.isFull= false;
    req.body.AccountId= req.connectedUser.id;

    return  global.models.Parking.create(req.body)
      .then(parking => {

        const slots = typeof req.body.slots === "string" ? JSON.parse(req.body.slots) : req.body.slots



        for (let s = 0; s<parking.capacity; s++) {
          slots[s].ParkingId= parking.id;
          slots[s].isEmpty=true;
        //  slots[s].position= parking.name

        }

          global.models.Slot.bulkCreate(slots)

        log().verbose({
          message: 'new parking ' + parking.id +
            ' created by ' + req.connectedUser.email ,
          date: Date(Date.now())
        });


        return res.status(201).send(parking)

      })
      .catch(err => {
        log().error({
          message: err
        });
        if (process.env.NODE_ENV == 'production')
          return res.status(522).send('database fail');
        return res.status(522).send(err);
     })
  } else {
    return res.status(403).send('you dont have permission')
  }
});

module.exports = router;
