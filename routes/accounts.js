let express = require('express');
let router = express.Router();
const env = process.env.NODE_ENV || 'development';
const {
  check, validationResult
} = require('express-validator');
const log = require('../policies/tools').log
let bcryptjs = require('bcryptjs');
const saltRounds = 10;
const fs = require("fs");
let jwt = require('jsonwebtoken');
let privateKey = require('../policies/secrets').privateKey;
let encrypt = require('../policies/tools').encrypt
let decrypt = require('../policies/tools').decrypt
const nremails = require('../policies/nremails');
const signOptions = require('../policies/preferences.js').signOptions
const deleteFromJson = require('../policies/tools').deleteFromJson

const preferences = require('../policies/preferences.js')
const tools = require('../policies/tools')
const sequelize = require("sequelize");
const path = require('path');
let appRootPath = require('app-root-path');
const Op = sequelize.Op;



//register

router.post('/register', [check('email').isEmail(), check("password").exists() /*,check("PharmacyId").exists(),*/ ],
  function(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      log().warn(JSON.stringify(errors.errors))
      return res.status(422).json({
        errors: errors.array()
      });
    }




      return bcryptjs.hash(req.body.password, saltRounds, function(
        err, hash) {
        if (err) {
          log().warn({
            route: '[/register]',
            message: err
          })
          return res.status(523).send('operation error');
        } else {
          req.body.password = hash;
          req.body.isActive = true


          global.models.Account.create(req.body).then(createdUser => {
            log().verbose({
              message: 'account ' + req.body.email +
                ' created'
            });
            delete createdUser.dataValues.password;
            return res.status(201).send(createdUser)
          }).catch(err => {
            log().error({
              route: '[/register]',
              message: err,
              date: Date(Date.now())
            });
            return res.status(522).send('database fail');
          })
        }
      });




  })

function doRegister(req, res) {
  req.body.isActive = true;

  bcryptjs.hash(req.body.password, saltRounds, function(err, hash) {
    if (err) {
      log().warn({
        route: '[/register]',
        message: err
      })
      return res.status(523).send('operation error');
    } else {
      req.body.password = hash;
      //registration email verification
      if (preferences.emails.verificationOnRegister == true) {
        req.body.isActive = false
          //generating email token
        const encryptedData = encrypt(JSON.stringify({
          user: {
            id: createdUser.id,
            email: req.body.email
          },
          auth: {
            ip: req._remoteAddress,
            userAgent: req.headers["user-agent"]
          }
        }))
        jwt.sign(encryptedData, privateKey, signOptions, function(err,
          token) {
          if (err) {
            log().debug({
              message: err
            });
            return res.status(523).send('operation error');
          } else {
            //token generated successfully
            nremails.verificationOnRegiser(token, req, 'en')
            return res.status(201).send(createdUser)
          }
        });
        //end generating email token
      }
      models.Account.create(req.body).then(createdUser => {
          delete createdUser.dataValues.password;
          log().verbose({
            message: `new account ${req.body.email}  created by ${req.connectedUser.email}`
          });
          return res.status(201).send(createdUser)
        })
        .catch(err => {
          //to avoid findOne to check if email exist
          if (err.errors) {
            if (err.errors[0].message == 'email must be unique') {
              log().verbose({
                route: '[/register.emailVerification.false]',
                message: req.body.email + ' email must be unique',
                ip: req._remoteAddress,
                userAgent: req.headers["user-agent"]
              });
              return res.status(461).send(err.errors[0].message);
            }
          } else if (err.parent.detail) {
            log().error({
              route: '[/register.emailVerification.false]',
              message: err.parent.detail
            });
            return res.status(522).send(err.parent.detail);
          } else {
            log().error({
              route: '[/register.emailVerification.false]',
              message: err
            });
            return res.status(522).send('fail');
          }
        })
    }
  });
}

//a account can login with his email or telephone
router.post('/login', [check("login").exists(), check("password").exists(), ],
    function(req, res, next) {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        log().warn(JSON.stringify(errors.errors))
        return res.status(422).json({
          errors: errors.array()
        });
      }
      global.models.Account.findOne({
          where: {
            [Op.or]: [{
              email: req.body.login
            }, {
              telephone: req.body.login
            }],
             isActive: true
          }
        })
        .then(user => {
          //if there is a user having that email
          if (user) {
            //decrypt password
            bcryptjs.compare(req.body.password, user.password, function(err,
              result) {
              if (err) {
                log().debug({
                  message: err
                });
                return res.status(523).send('operation error')
              } else {
                //if passwords match
                if (result) {
                  //generating token for logged in user
                  delete user.dataValues.password;

                  const encryptedData = encrypt(JSON.stringify({
                    user, auth: {
                      ip: req._remoteAddress,
                      userAgent: req.headers["user-agent"]
                    }
                  }))
                  jwt.sign(encryptedData, privateKey, signOptions,
                    function(err, token) {
                      if (err) {
                        log().debug({
                          message: err
                        });
                        return res.status(523).send('operation error');
                      } else {
                        //token generated successfully
                        //saving current session data
                        models.Session.create({
                            AccountId: user.id,
                            email: user.email,
                            token,
                            ip: req._remoteAddress,
                            userAgent: req.headers["user-agent"]
                          })
                          .then(session => {
                            //attaching generated token to user object
                            user.dataValues.token = token;
                            user.save();
                            //notifying users of same pharmacy
                            io.sockets.in(
                              `pharmacy_${user.PharmacyId}`).emit(
                              'userConnected', {
                                message: `AccountId=${user.id} loggedIn`,
                                data: user.email
                              });
                            log().verbose({
                              message: user.email + ' loggedIn'
                            })
                            return res.status(200).send(user);
                          })
                        locations.catch(err => {
                          log().error({
                            message: err,
                            route: req.originalUrl,
                            ip: req._remoteAddress,
                            userAgent: req.headers["user-agent"],
                            date: Date(Date.now())
                          });

                          if (process.env.NODE_ENV == 'production') {
                            return res.status(522).send(
                              'database fail');
                          } else {
                            return res.status(522).send(err);
                          }
                        })
                      }
                    });
                  //end generating token for logged in userr
                }
                //wrong password
                else {
                  //fetch login attempts from same ip and user agent
                  global.models.Session.findOne({
                      order: [
                        ["updatedAt", "DESC"]
                      ],
                      where: {
                        AccountId: user.id,
                        ip: req._remoteAddress,
                        userAgent: req.headers["user-agent"]
                      }
                    })
                    .then(session => {
                      if (session != null) {
                        session.attempt++;
                        session.save();
                        //notify user by email if reached 3 faild attempts
                        if (session.attempt == 3) {
                          log().warn(user.email +
                            ' 3 failed login attempts');
                          nremails.failedLoginAttemptEmail(user, req,
                            'en');
                          return res.status(401).send(
                            '3 failed login attempts')
                        }
                        //advice user to change password if reached 5 failed login attempts
                        else if (session.attempt == 5) {
                          log().warn({
                            message: user.email +
                              ' 5 failed login attempts',
                            ip: req._remoteAddress,
                            userAgent: req.headers["user-agent"],
                            date: Date(Date.now())
                          });
                          changePasswordWarningEmail(user, req, 'en');
                          return res.status(401).send(
                            '5 failed login attempts')
                        } else {
                          log().debug({
                            message: 'user.email ' + user.email +
                              ' wrong password'
                          });
                          return res.status(401).send('wrong password')
                        }
                      } else {
                        global.models.Session.create({
                            AccountId: user.id,
                            email: user.email,
                            token: 'login_attempt_failed',
                            attempt: 1,
                            ip: req._remoteAddress,
                            userAgent: req.headers["user-agent"]
                          })
                          .then(session => {
                            log().debug({
                              message: user.email +
                                ' wrong password'
                            });
                            return res.status(401).send(
                              'wrong password')
                          })
                          .catch(err => {

                            log().error({
                              message: err,
                              route: req.originalUrl,
                              ip: req._remoteAddress,
                              userAgent: req.headers["user-agent"],
                              date: Date(Date.now())
                            });
                            if (process.env.NODE_ENV == 'production') {
                              return res.status(522).send(
                                'database fail');
                            } else {
                              return res.status(522).send(err);
                            }

                          })
                      }
                    })
                    .catch(err => {
                      log().error({
                        message: err,
                        route: req.originalUrl
                      });
                      if (process.env.NODE_ENV == 'production')
                        return res.status(522).send('fail');
                      return res.status(522).send(err);
                    })
                }
              }
            });
          } else {
            //no user found using req.body.login
            log().debug({
              message: '[/login] user with ' + req.body.login +
                ' not found ',
              ip: req._remoteAddress,
              userAgent: req.headers["user-agent"],
              date: Date(Date.now())
            });
            return res.status(404).send('no user found with ' + req.body.login)
          }
        }).catch(err => {
          log().error({
            message: err,
            route: '[/register]',
            date: Date(Date.now())
          });
          return res.status(522).send('database fail');
        })
    })
module.exports = router;
