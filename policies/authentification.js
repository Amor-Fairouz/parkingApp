let jwt = require('jsonwebtoken');
const privateKey = require('./secrets').privateKey;
const log = require('./tools').log
const decrypt = require('./tools').decrypt
const nremails = require('./nremails');
const tools = require('../policies/tools.js')


exports.tokenAuth = (req, res, next) => {
  //make sure these attributes are not sent on the body
  req.body = tools.deleteFromJson(req.body, ['id', 'createdAt', 'updatedAt'])
  if (
    (req.url.indexOf("/index") !== -1) ||
    (req.url.indexOf("/accounts/login") !== -1) ||
    (req.url.indexOf("/testing") !== -1) ||
    (req.url.indexOf("/accounts/emailVerification") !== -1) ||
    (req.url.indexOf("/feedbacks/create/nonRegisteredUser") !== -1)
  ) {
    return next();
  } else {
    if (req.headers.token) {
      //decoding token
      return jwt.verify(req.headers.token, privateKey, function(err, decoded) {
        if (err) {
          log().warn({
            message: err,
            route: req.originalUrl,
            ip: req._remoteAddress,
            userAgent: req.headers["user-agent"]
          });
          if (process.env.NODE_ENV == 'production')
            return res.status(400).send('token error')
          return res.status(400).send(err)
        } else {
          //token decryption
          decoded = {
            iv: decoded.iv,
            encryptedData: decoded.encryptedData
          }
          decoded = JSON.parse(decrypt(decoded))
          if (!decoded.user) {
            log().error({
              message: `[TOKEN_DOESNT_HAVE_USER_OBJECT]`,
              route: req.originalUrl,
              ip: req._remoteAddress,
              userAgent: req.headers["user-agent"],
              token: req.headers.token
            })
            if (process.env.NODE_ENV == 'production')
              return res.status(400).send('token error')
            return res.status(400).send('[TOKEN_DOESNT_HAVE_USER_OBJECT]');
          }
          //if token exist in session table so its valid, else its not
          return models.Session.findOne({
              where: {
                token: req.headers.token
              }
            })
            .then(session => {
              if (session != null) {
                if ((req._remoteAddress == decoded.auth.ip) && (req.headers[
                    "user-agent"] == decoded.auth.userAgent)) {
                  req.connectedUser = decoded.user;
                  //setting values for offset and limit for pagination
                  if (req.headers.page) {
                    if (parseInt(req.headers.page) >= 1) {
                      req.limit = 5;
                      req.offset = (parseInt(req.headers.page) * req.limit) -
                        req.limit;
                    }
                  } else {
                    req.offset = 0;
                    req.limit = 1000;
                  }
                  next()
                  return null;
                } else {
                  log().warn({
                    message: `[TOKEN_MISMATCH_SESSION] ${decoded.user.email} user.id=${decoded.user.id}`,
                    ip: req._remoteAddress,
                    userAgent: req.headers["user-agent"],
                    route: req.originalUrl,
                    token: req.headers.token
                  })
                  if (process.env.NODE_ENV == 'production')
                    return res.status(400).send('token error')
                  return res.status(400).send('token mismatch session')
                }
              } else {
                //token not found in session so its not valid
                nremails.invalidTokenLoginAttempt(decoded.user, req,
                  'en');
                log().warn({
                  message: `[INVALID_TOKEN] ${decoded.user.email} user.id=${decoded.user.id}`,
                  ip: req._remoteAddress,
                  userAgent: req.headers["user-agent"],
                  route: req.originalUrl,
                  token: req.headers.token
                })
                if (process.env.NODE_ENV == 'production')
                  return res.status(400).send('token error')
                return res.status(400).send('[INVALID_TOKEN]');
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
      });
    } else {
      //no token on the header
      if (req.url.indexOf("/accounts/register") !== -1) { //first time to create a super, no token provided
        return next();
      } else {
        log().warn({
          message: `[NO_TOKEN_PROVIDED_ON_HEADER]`,
          route: req.originalUrl,
          ip: req._remoteAddress,
          userAgent: req.headers["user-agent"]
        })
        if (process.env.NODE_ENV == 'production')
          return res.status(400).send('token error')
        return res.status(400).send('no token provided')
      }
    }
  }
}
