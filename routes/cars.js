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

router.post('/verifyCheckInCar',  function(req, res, next) {

  if (req.connectedUser.isActive == true) {


    global.models.Parking.findOne({where:{
      type:req.body.type
    },include: [{
        model: models.Slot,
        as: 'slots',

      }]}).then(parking=>{

//check if this parking  support receiving more nbrCars
if(parking.capacity> parking.nbrCars && parking.isFull== false){

    parking.nbrCars++;


    if(  parking.nbrCars==parking.capacity){
        parking.isFull= true
    }
    parking.save();
 global.models.Slot.findOne({where:{
  ParkingId:parking.id,
  isEmpty:true
}}).then(slot=>{

  if(slot){

    slot.isEmpty=false

    slot.save();


        req.body.startDate= new Date();
        req.body.ParkingId= parking.id;
        req.body.SlotId= slot.id
        req.body.price=0



  return  global.models.Car.create(req.body).then(car => {


      return res.status(201).send("WELOCOME Your need to go to parking :"+parking.name +"in slot position"+slot.position)



    }).catch(err => {
            log().error({
              message: err
            });
            if (process.env.NODE_ENV == 'production')
              return res.status(522).send('database fail');
            return res.status(522).send(err);
         })

}else{
  return res.status(424).send("All slots are busy ....")




}


})





   }
else{

  return res.status(423).send("Sorry our Parking is Full ....")

}








}).catch(err => {
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


router.put('/checkOutCar',  function(req, res, next) {

  if (req.connectedUser.isActive == true) {


    global.models.Car.findOne({where:{
      martricul:req.body.martricul
    },include: [{
        model: models.Parking,
      },{
        model: models.Slot,


      }]}).then(car=>{
        console.log(car.Slot.isEmpty);
        console.log(car.endDate);


        if(car.Slot.isEmpty==false && car.endDate== null){


          car.endDate= new Date();


          let hours =0;
          hours=Math.abs(car.endDate- car.startDate) / 3600000;

  car.price= hours* car.Parking.pricePerHour

  car.Parking.nbrCars--;
  car.Slot.isEmpty=true;
  car.Slot.ParkingId=null;


          car.save();


          return res.status(200).send("Mr/Mss owner of car :"+car.martricul+ "you  spent :"+hours+ "in our parking and you must pay :  "+car.price);


        }else{

          return res.status(406).send("this slot is empty");

        }

}).catch(err => {
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
