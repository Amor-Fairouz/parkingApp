/**
 * this file contains various functions that can serve in many projects.
 * import only necessary functions like : var myFunction = require('../policies/tools').myFunction
 * use it like : myFunction(param1, param2)
 */
const fs = require('fs');
var winston = require('winston'); //logging
const Transport = require('winston-transport'); //winston custom transport
const nodemailer = require("nodemailer");
const preferences = require('./preferences')
const secrets = require('../policies/secrets.json')
  // Nodejs encryption with CTR
const crypto = require('crypto');
const iv = crypto.randomBytes(16);
const packagejson = require('../package.json');
const appRootPath = require('app-root-path');
var moment = require('moment');
const path = require('path');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csv = require('csv-parser');
const chalk = require('chalk');

//token payload encryption and decryption before sign
exports.encrypt = text => {
  let cipher = crypto.createCipheriv(secrets.tokenEncryptionAlgorithm, Buffer
    .from(secrets.tokenEncryptionKey), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return {
    iv: iv.toString('hex'),
    encryptedData: encrypted.toString('hex')
  };
}

exports.decrypt = text => {
  let iv = Buffer.from(text.iv, 'hex');
  let encryptedText = Buffer.from(text.encryptedData, 'hex');
  let decipher = crypto.createDecipheriv(secrets.tokenEncryptionAlgorithm,
    Buffer.from(secrets.tokenEncryptionKey), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

//loggin system
var log = exports.log = (logFilename) => {
  //console.log('\n');//to make console more readable
  /*const myFormat2 = winston.format.printf(({ ip, userAgent, level, message, label, route, where, page, search, count, decoded, info, timestamp, token,request }) => {
      return JSON.stringify({ timestamp, level, message, decoded, info, where, page, search, count, route, ip, userAgent, token,request })
  });*/
  const myFormat = winston.format.printf(
    (msg) => JSON.stringify(msg)
  );

  if (!logFilename) logFilename = `${packagejson.name}`

  var options = {
    file: {
      level: 'verbose',
      filename: `${appRootPath}/logs/${logFilename}.log`,
      //timestamp: true,
      handleExceptions: true,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      json: true,
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD--HH:mm:ss.SSS'
        }),
        myFormat
      )
    },
    console: {
      level: 'debug',
      json: true,
      handleExceptions: true,
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD--HH:mm:ss.SSS'
        }),
        //myFormat,
        winston.format.colorize(),
        winston.format.json(),
        winston.format.simple(),
      )
    },
  };
  let myLog;
  // instantiate a new Winston Logger with the settings defined above
  if (preferences.emails.send == true || process.env.NODE_ENV == 'production') {
    myLog = winston.createLogger({
      transports: [
        new winston.transports.File(options.file) /*({ 'timestamp': true })*/ ,
        new winston.transports.Console(options.console),
        new EmailTransport()
      ],
      exitOnError: false, // do not exit on handled exceptions
    });
  } else {
    // console.log();//to make console more readable
    myLog = winston.createLogger({
      transports: [
        new winston.transports.File(options.file),
        new winston.transports.Console(options.console),
      ],
      exitOnError: false,
    });
  }
  return myLog
}

//attached to morgan, express logger
log.stream = {
  write: function(request, encoding) {
    //log().verbose(chalk.bgGreen(request));//morgan logging
    log().verbose(request); //morgan logging
    let rt = request.slice(request.indexOf('[*') + 2, request.indexOf('*]')) //rt like response time
    if (parseInt(rt) > preferences.responseTimeAlert) {
      log().warn({
        message: `request taking more than ${preferences.responseTimeAlert} ms`,
        request
      })
    }
    console.log('\n'); //to make console more readable
  },
};
//sending emails with winston on production
class EmailTransport extends Transport {
  constructor(opts) {
    super(opts);
  }
  async log(info, callback) {
    /*setImmediate(() => {
        this.emit('logged', info);
    });*/
    let transporter = nodemailer.createTransport({
      host: "smtp.ionos.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: preferences.emails.noreply,
        pass: secrets.noreplyPassword
      }
    });
    var to;
    switch (info.level) {
      case 'error':
        to = preferences.emails.sysAdmin;
        break;
      case 'warn':
        to = preferences.emails.maintainers;
        break;
      case 'info':
        to = preferences.emails.managers;
        break;
      case 'verbose':
        return
    }
    return await transporter.sendMail({
      from: `${packagejson.name}  <${preferences.emails.noreply}>`, // sender address
      to,
      subject: info.level,
      html: JSON.stringify(info)
    }, (error, emailInfo) => {
      if (error)
        return log().error({
          route: '[tools.log.EmailTransport]',
          message: error
        });
      return log().verbose({
        message: 'log email sent to ' + to,
        emailInfo
      });
    });
    // Perform the writing to the remote service
    //callback();
  }
};

exports.sendNoReplyEmail = async(to, subject, html) => {
  let transporter = nodemailer.createTransport({
    host: "smtp.ionos.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: preferences.emails.noreply,
      pass: secrets.noreplyPassword
    }
  });
  await transporter.sendMail({
    from: packagejson.name + '  <' + preferences.emails.noreply + '>',
    to,
    subject,
    html
  }, (error, info) => {
    if (error) {
      log().error({
        route: '[tools.sendNoReplyEmail]',
        message: error.message
      });
    } else {
      log().verbose({
        message: 'noreply email sent to ' + to,
        info
      });
    }
  });
}


exports.dateToTime = date => {
  return date.slice(16, 21);
}

exports.timestampToHours = time => {
  return parseInt(time.slice(0, 2));
}

exports.timestampToMinutes = time => {
    return parseInt(time.slice(3, 5));
  }
  //check if a given day is the current day or not
exports.isToDay = date => {
    const toDay = new Date();
    const dateConvertedToDate = new Date(date);
    if (
      dateConvertedToDate.getFullYear() == toDay.getFullYear() &&
      dateConvertedToDate.getMonth() == toDay.getMonth() &&
      dateConvertedToDate.getDate() == toDay.getDate()
    ) {
      return true;
    } else {
      return false;
    }
  }
  //check if 2 matrixs are equals or not
exports.compare2Matrixs = (m1, m2, matrixHeight, matrixWidth) => {
    for (var h = 0; h < matrixHeight; h++) {
      for (var w = 0; w < matrixWidth; w++) {
        if (m1[h][w] != m2[h][w]) {
          return false
        }
      }
    }
    return true
  }
  //converting minutes to hours
exports.minutesToHours = (minutes, display) => {
  if (display == 'hoursOnly') {
    if (minutes > 59 || minutes < -59) {
      if (minutes % 60 == 0) {
        return minutes / 60
      } else {
        return Math.floor(minutes / 60)
      }
    } else {
      return minutes
    }
  }
  if (display == 'json') {
    if (minutes > 59) {
      var hours = Math.floor(minutes / 60);
      minutes = minutes - hours * 60;
      return {
        hours, minutes
      }
    } else {
      return {
        hours: 0,
        minutes
      }
    }
  }
}

exports.durationInDays = (date1, date2) => {
  if (date1 > date2) return false
  return Math.ceil((Math.abs(date2.getTime() - date1.getTime())) / (1000 * 60 *
    60 * 24)) + 1;
}

var getNextMondayOfTheWeek = exports.getNextMondayOfTheWeek = (dayName,
  excludeToday = true, refDate = new Date()) => {
  const dayOfWeek = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"]
    .indexOf('mon'.slice(0, 3).toLowerCase());
  if (dayOfWeek < 0) {
    return;
  }
  refDate.setHours(1, 0, 0, 0);
  refDate.setDate(refDate.getDate() + !!excludeToday + (dayOfWeek + 7 -
    refDate.getDay() - !!excludeToday) % 7);
  return refDate;
}

var getNextSunday = exports.getNextSunday = (dayName, excludeToday = true,
  refDate = new Date()) => {
  const dayOfWeek = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"]
    .indexOf('sun'.slice(0, 3).toLowerCase());
  if (dayOfWeek < 0) {
    return;
  }
  refDate.setHours(1, 0, 0, 0);
  refDate.setDate(refDate.getDate() + !!excludeToday + (dayOfWeek + 7 -
    refDate.getDay() - !!excludeToday) % 7);
  return refDate;
}

exports.getNextDayOfTheWeek = (dayName, excludeToday = true, refDate = new Date()) => {
  const dayOfWeek = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"]
    .indexOf(dayName.slice(0, 3).toLowerCase());
  if (dayOfWeek < 0) {
    return;
  }
  refDate.setHours(1, 0, 0, 0);
  //refDate.setDate(refDate.getDate() + !!excludeToday +(dayOfWeek + 7 - refDate.getDay() - !!excludeToday) % 7);
  refDate.setDate(getNextSunday().getDate() + !!excludeToday + (dayOfWeek + 7 -
    getNextSunday().getDay() - !!excludeToday) % 7);

  //refDate.setDate(getNextMondayOfTheWeek().getDate() + !!excludeToday + (dayOfWeek + 7 - getNextMondayOfTheWeek().getDay() - !!excludeToday) % 7);
  return refDate;
}
exports.getNextDay = (dayName, excludeToday = true, refDate = new Date()) => {
  let tomorrow = new Date(new Date().setDate(new Date().getDate() + 1));
  return new Date((tomorrow).getTime() - ((tomorrow).getTimezoneOffset() *
    60000)).toISOString().split("T")[0];
}

exports.getRandomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min)) + min;

  }
  // Returns the ISO week of the date.
Date.prototype.getWeek = function() {
  var date = new Date(this.getTime());
  date.setHours(0, 0, 0, 0);
  // Thursday in current week decides the year.
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  // January 4 is always in week 1.
  var week1 = new Date(date.getFullYear(), 0, 4);
  // Adjust to Thursday in week 1 and count number of weeks from date to week1.
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 +
    (week1.getDay() + 6) % 7) / 7);
}

Date.prototype.getHoursMinutes = function() {
    let hours = this.getHours()
    let minutes = this.getMinutes()

    if (parseInt(this.getHours()) < 10) {
      hours = `0${this.getHours().toString()}`
    }

    if (parseInt(this.getMinutes()) < 10) {
      minutes = `0${this.getMinutes().toString()}`
    }

    return `${hours}:${minutes}`
  }
  // Returns the four-digit year corresponding to the ISO week of the date.
Date.prototype.getWeekYear = function() {
  var date = new Date(this.getTime());
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  return date.getFullYear();
}

Date.prototype.toDateOnly = function() {
  return new Date(this.getTime() - (this.getTimezoneOffset() * 60000)).toISOString()
    .split("T")[0];
}

Date.prototype.betweenDates = function(date1, date2) {

  if (this.toDateOnly >= date1 && this.toDateOnly <= date2) return true;
  return false
}

//use it like req.body = deleteFromJson(req.body,['status','isdeleted'])
exports.deleteFromJson = (json, toDelete) => {
  for (let t = 0; t < toDelete.length; t++) {
    delete json[toDelete[t]]
  }
  return json
}

exports.keepFromJson = (json, toKeep) => {
  let keys = Object.keys(json);
  for (let t = 0; t < keys.length; t++) {
    if (!toKeep.includes(keys[t])) {
      delete json[keys[t]]
    }
  }
  return json
}
exports.createDir = (directories) => {

  if (!fs.existsSync(`${appRootPath}/logs`)) {
    fs.mkdir(`${appRootPath}/logs`, function(err) {
      if (err) {
        log().error({
          message: err,
          route: '[/bin/www]'
        });
      } else {
        log().verbose({
          message: `[FILE_SYSTEM] ${appRootPath}/logs folder created`,
          route: '[/bin/www]'
        });
      }
    });
  }

}

exports.createDirectory = (targetDir, {
  isRelativeToScript = false
} = {}) => {
  const sep = path.sep;
  const initDir = path.isAbsolute(targetDir) ? sep : '';
  const baseDir = appRootPath + '/'

  return targetDir.split(sep).reduce((parentDir, childDir) => {
    const curDir = path.resolve(baseDir, parentDir, childDir);
    try {
      fs.mkdirSync(curDir);
    } catch (err) {
      if (err.code == 'EEXIST') { // curDir already exists!
        return curDir;
      }

      // To avoid `EISDIR` error on Mac and `EACCES`-->`ENOENT` and `EPERM` on Windows.
      if (err.code == 'ENOENT') { // Throw the original parentDir error on curDir `ENOENT` failure.
        throw new Error(`EACCES: permission denied, mkdir '${parentDir}'`);
      }

      const caughtErr = ['EACCES', 'EPERM', 'EISDIR'].indexOf(err.code) >
        -1;
      if (!caughtErr || caughtErr && curDir == path.resolve(targetDir)) {
        throw err; // Throw if it's just the last created dir.
      }
    }

    return curDir;
  }, initDir);
}

exports.csvExport = (data, fileName, res) => {
  let keys = Object.keys(data[0]);
  let header = []
  for (let k = 0; k < keys.length; k++) {
    header.push({
      id: keys[k],
      title: keys[k]
    })
  }
  fileName = fileName + '-' + Date.now()
  let path = `${appRootPath}/uploads/csv/${fileName}.csv`
  const csvWriter = createCsvWriter({
    path, header
  });
  return csvWriter
    .writeRecords(data)
    .then(c => {
      log().verbose({
        message: `${path} created successfully`
      })
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition',
        'attachment; filename=\"' + fileName +
        '.csv\"');
      return res.status(200).sendFile(path);
    });
}


exports.csvImport = (filePath) => {
  let csvData = []
  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (row) => {
      csvData.push(row)
    })
    .on('end', () => {
      log().verbose({
        message: `${filePath} successfully processed`
      })
      return csvData
    });
}

//extract ids from an object and pusht them into an array
exports.getIdsOnArray = (idsString) => {
  idsString = idsString.toString()
  let id, ids = []
  if (idsString[0] == '[') {
    idsString = idsString.slice(1, idsString.length - 1)
  }
  if (idsString[idsString.length - 1] == ']') {
    idsString = idsString.slice(0, idsString.length - 1)
  }

  while (idsString.length != 0) {
    if (idsString.includes(',')) {
      id = idsString.slice(0, idsString.indexOf(','))
    } else {
      id = idsString.slice(0, idsString.length)
    }
    if (parseInt(id) || id == 0) {
      ids.push(parseInt(id))
    }
    idsString = idsString.slice(id.length + 1, idsString.length)
  }
  return ids
}

let notSeenNotifications = exports.notSeenNotifications = (receiverId) => {
  let where = {}
  where.isSeen = false
  where.isDeleted = false
  where.ReceiverId = receiverId
  return models.Notification.findAll({
      where,
      order: [
        ['id', 'DESC'],
      ]
    })
    .then(notifications => {
      io.sockets.in(`user_${receiverId}`).emit(
        'receiveNotSeenNotifications', {
          messages: `you have ${notifications.length} notifications`,
          data: notifications
        })
      return log().verbose({
        message: colors.bgMagenta(
          `[receiveNotSeenNotifications] user.id=${receiverId} received ${notifications.length} Not Seen Notifications`
        )
      })
    })
    .catch(err => {
      console.log(colors.bgRed(err));
      return log().error({
        message: err
      });
    })
}
exports.sendNotification = (ReceiverId, SenderId, type, TypeId, subject, text,
  data, user) => {
  return models.Notification.create({
      ReceiverId,
      SenderId,
      type,
      TypeId,
      subject,
      text,
      isSeen: false,
        isDeleted: false,
    })
    .then(notification => {
      //sending notification
      io.sockets.in(`user_${ReceiverId}`).emit('newNotification', {
        message: text,
        data
      });
      //sending notSeenNotifications
      notSeenNotifications(ReceiverId)
      if (user != null) {
        return log(ReceiverId).verbose({
          message: `${user.email} role ${user.role} received notification.id=${notification.id} of subject ${notification.subject}`
        });
      } else {
        return log(ReceiverId).verbose({
          message: `user.id=${ReceiverId} received notification.id=${notification.id} of subject ${notification.subject}`
        });
      }
    })
    .catch(err => {
      console.log(colors.bgRed(err));
      return log().error({
        message: err,
        route: 'tools/createNotification'
      });
    })
}
