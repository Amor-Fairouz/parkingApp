/**
 * this file contains standard emails sent by server, lang is language choosen by the user , for now only english
 */
const sendNoReplyEmail = require('./tools').sendNoReplyEmail
var ip = require("ip");
var www = require('../bin/www')
const packagejson = require('../package.json');
const preferences = require('./preferences')

const emailSignature = exports.emailSignature = `<br><br>------------------------
${preferences.sbptech.name} ${preferences.sbptech.description} ------------------------<br>
telephone: ${preferences.sbptech.telephone}  email: ${preferences.sbptech.email}<br><br>
address: ${preferences.sbptech.address}<br><br>
${preferences.sbptech.logo}`

exports.failedLoginAttempt = (user, req, lang) => {
    if (preferences.emails.send == false && process.env.NODE_ENV != 'production') return
        if (!lang || lang == 'en') {

            sendNoReplyEmail(user.email, '3 failed login attempts',
                'Hi ' + user.firstName + ' ' + user.lastName + '<br>' +
                'your ' + packagejson.name + ' account had 3 failed login attempts <br>' +
                'ip: ' + req._remoteAddress + '<br>' +
                'browser: ' + req.headers["user-agent"] + '<br>' +
                'date: ' + Date(Date.now()) + emailSignature)
        }

}

exports.invalidTokenLoginAttempt = (user, req, lang) => {
    if (preferences.emails.send == false && process.env.NODE_ENV != 'production') return
        if (!lang || lang == 'en') {

            let to =user.email;
            let subject = 'Login attempt with old token detected';
            let html =
                `Hi ${user.firstName} ${user.lastName} <br>
                invalid token is a token of loggedout or password changed session <br>
                we detected a login attempt with invalid token to your ${packagejson.name} account <br>
                you should take steps to secure your device <br><br>
                ip: ${req._remoteAddress} <br>
                browser: ${req.headers["user-agent"]} <br>
                date: ${Date(Date.now())}
                 ${emailSignature}`
                sendNoReplyEmail(to, subject, html)
        }

}

exports.changePasswordWarning = (user, req, lang) => {
    //if (env != 'development') {

        if (preferences.emails.send == false && process.env.NODE_ENV != 'production') return
        if (!lang || lang == 'en') {

            sendNoReplyEmail(user.email, 'Please change password',
                'Hi ' + user.firstName + ' ' + user.lastName + '<br>' +
                'your ' + packagejson.name + ' account had 5 failed login attempts <br>' +
                'we advise you to change your password' +
                'ip: ' + req._remoteAddress + '<br>' +
                'browser: ' + req.headers["user-agent"] + '<br>' +
                'date: ' + Date(Date.now()) + emailSignature)
        }

}

exports.passwordChanged = (user, req, lang) => {
    //if (env != 'development') {

        if (preferences.emails.send == false && process.env.NODE_ENV != 'production') return
        if (!lang || lang == 'en') {

            sendNoReplyEmail(user.email, 'Your password is changed',
                'Hi ' + user.firstName + ' ' + user.lastName + '<br>' +
                'your ' + packagejson.name + ' password has been changed <br>' +
                'ip: ' + req._remoteAddress + '<br>' +
                'browser: ' + req.headers["user-agent"] + '<br>' +
                'date: ' + Date(Date.now()) + emailSignature)
        }

}

exports.passwordReset = (user, req,token, lang) => {
        if (!lang || lang == 'en') {
            let to = user.email

            let subject = `Password reset request`

            let html = `Hi ${user.firstName} ${user.lastName} <br>
            a password reset has been requested for your account.<br>
            If you did not please ignore this email, nothing harmful to your account is done.<br>
            if you already requested a password reset please click the link below and
             be waiting another email having a new generated password<br><br>
            ${preferences.backBaseUrl}/validatingPasswordReset/?token=${token}<br><br>

            date: ${Date(Date.now())}<br>
            ip: ${req._remoteAddress}<br>
            browser: ${req.headers['user-agent']}
            ${emailSignature}`
            return sendNoReplyEmail(to, subject, html)
        }
}

exports.passwordResetValidation = (user,generatedpassword, req, lang) => {
        if (!lang || lang == 'en') {
            let to = user.email

            let subject = `Password reset request`

            let html =`Hi ${user.firstName} ${user.lastName} <br>
            a password reset requested has been approved for your account.<br>
            your new password is: ${generatedpassword}<br>
            now try to login with the new password<br><br>
            ${preferences.frontBaseUrl}/#!/login <br><br>

            date: ${Date(Date.now())}<br>
            ip: ${req._remoteAddress}<br>
            browser: ${req.headers['user-agent']}
            ${emailSignature}`

            return sendNoReplyEmail(to, subject, html)
        }
}

exports.emailChanged = (user, req, lang) => {
    if (preferences.emails.send == false && process.env.NODE_ENV != 'production') return
            if (!lang || lang == 'en') {

            sendNoReplyEmail(user.email, 'Your email is changed',
                'Hi ' + user.firstName + ' ' + user.lastName + '<br>' +
                'your ' + packagejson.name + ' email has been changed <br>' +
                'ip: ' + req._remoteAddress + '<br>' +
                'browser: ' + req.headers["user-agent"] + '<br>' +
                'date: ' + Date(Date.now()) + emailSignature)
        }

}

exports.verificationOnRegiser = (token, req, lang) => {

        if (!lang || lang == 'en') {
            sendNoReplyEmail(req.body.email, 'Email verification',
                'Hi ' + req.body.firstName + ' ' + req.body.lastName + '<br>' +
                'a ' + packagejson.name + ' user account has been created with this email <br>' +
                'please click the following link to verify the email <br><br>' +
                ip.address() + ':' + www.port + '/users/emailVerification/' + token + '<br><br>' +
                'ip: ' + req._remoteAddress + '<br>' +
                'browser: ' + req.headers["user-agent"] + '<br>' +
                'date: ' + Date(Date.now()) + emailSignature)
        }

}

exports.feedback = (to, user, req, lang) => {
    if (preferences.emails.send == false && process.env.NODE_ENV != 'production') return
        if (!lang || lang == 'en') {
            sendNoReplyEmail(to, `Type ${req.body.type} feedback`, `Hi comrade! <br>
            ${user.firstName} ${user.lastName}, email: ${user.email} has a feedback for you:<br><br>
            Subject: ${req.body.subject}<br><br>
            ${req.body.text}<br>
            ip: ${req._remoteAddress}<br>
            browser: ${req.headers["user-agent"]}<br>
            date: ${Date(Date.now())} ${emailSignature}`)
        }

}

exports.WorkdayUpdated = (user, req,Workday, lang) => {
    if (preferences.emails.send == false && process.env.NODE_ENV != 'production') return
        if (!lang || lang == 'en') {
            let to = user.email

            let subject = `Your Workday was updated`

            let html = `Hi ${user.firstName} ${user.lastName} <br>
            you are affected a new Workday as described below:<br><br>
            ${JSON.stringify(Workday)}<br>

            date: ${Date(Date.now())} ${emailSignature}`

            sendNoReplyEmail(to, subject, html)
        }

}
