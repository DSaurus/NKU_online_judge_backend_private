// noinspection SpellCheckingInspection
const nodemailer = require('nodemailer')
const redis = require('redis')
const check = require('./form-check')
const db = require('../database/db')
const client = redis.createClient()
const {DB_EMAIL_VERIFY} = require('../config/redis')
const md5 = require('../lib/md5')
const {BASE_URL} = require('../config/basic')
client.select(DB_EMAIL_VERIFY)

// DEV: Send Email
const transporter = nodemailer.createTransport('smtp://@127.0.1.1:25')

const mailOptions = {
  from: 'SunriseFox <sunrisefox@vampire.rip>',
  subject: '用户注册验证邮件'
}

const convertToHash = (email) => {
  'use strict'
  return md5(Buffer.from(email).toString('base64') + new Date)
}

const register = (to, code, link, callback) => {
  'use strict'
  to = to.toLowerCase()
  if (check(['email'], [to])) callback({success: false, error: 'not valid email'})
  const email_suffix = db.splitEmail(to)[1]
  return client.set(email_suffix, 1, 'NX', 'EX', 30, (err, rep) => {
    if (err) return callback({success: false, error: err})
    if (!rep) return callback({success: false, error: 'sorry, we can only send to that server once every 30 second'})

    client.get(`banned:${to}`, (err, res) => {
      if (res) return callback({success: false, error: 'this email has been banned by user.'})
      const hash = convertToHash(to)
      client.set(hash, to, 'NX', 'EX', 172000)
      const arg = {
        text: `Your Code is: ${code} .\n Or you can use this link: ${link}`,
        html: `
        <!DOCTYPE html>
        <html>
        
        <head>
          <meta charset="UTF-8" />
          <title>
            验证邮件
          </title>
        </head>
        
        <body style="height:100%;width:100%;padding:0;margin:0;">
          <table style="background:#eaeced;" align="center" border="0" cellpadding="0" cellspacing="0" height="100%" width="100%" bgcolor="#eaeced">
            <tr height="100" style="background:#eaeced;"></tr>
            <tr align="center">
              <td width="50"></td>
              <td align="center">
                <table border="0" style="width:100%;height:100%;border:0;padding:0;margin:0;max-width:600px;background:#fff;border-radius:3px;"
                  align="center">
                  <tbody align="center">
                    <tr height="50"></tr>
                    <tr>
                      <td>
                        <table>
                          <tr align="center">
                            <td width="25">
                            </td>
                            <td width="300">
                              <img width="300" style="width:300px;" src="http://7sbxv9.com1.z0.glb.clouddn.com/logo.png" alt="NKUOJ" title="NKUOJ" />
                            </td>
                            <td style="line-height:70px;font-size:30px;font-weight:200;color:#9c6190;">
                              验证你的邮件
                            </td>
                            <td width="25">
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr height="50"></tr>
                    <tr>
                      <td align="center">
                        <table width="85%" style="color:#7e8890;width:85%;font-weight:200;line-height:1.3em;">
                          <tr>
                            <td>
                              <p align="center">
                                现在验证你的邮件，开启你在NKUOJ的探索！
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr height="30"></tr>
                    <tr align="center" height="52">
                      <td width="256" height="52" style="padding:14px 28px 14px 28px;width:200px;height:1.5em;background:#ffa7be;display:inline-block;line-height:1.5em;color:#fff;border-radius:3px;text-decoration:none;">
                        code:${code}
                      </td>
                    </tr>
                    <tr height="10"></tr>
                    <tr align="center">
                      <td style="color:#7e8890;">
                        或者
                      </td>
                    </tr>
                    <tr height="10"></tr>
                    <tr align="center" height="52">
                      <td width="256" height="52" style="background:#ff2b63;width:256px;display:inline-block;border-radius:3px;">
                        <a style="padding:14px 28px 14px 28px;width:200px;height:1.5em;background:#ff2b63;display:inline-block;line-height:1.5em;color:#fff;border-radius:3px;text-decoration:none;"
                          href="${link}">验证邮件地址</a>
                      </td>
                    </tr>
                    <tr height="30">
                      <td>
                      </td>
                    </tr>
                    <tr align="center">
                      <td style="font-weight: 500;color:#7e8890;">
                        注意：验证仅在十分钟内有效。
                      </td>
                    </tr>
                    <tr height="30">
                      <td>
                      </td>
                    </tr>
                  </tbody>
                  <tfoot align="center">
                    <tr align="center">
                      <td style="color:#ccc;">
                        -
                      </td>
                    </tr>
                    <tr height="25"></tr>
                    <tr align="center">
                      <td style="font-weight:400;color:#7e8890;">
                        Copyright(c)2018 NKUOJ,All rights reserved.
                      </td>
                    </tr>
                    <tr align="center">
                      <td style="font-weight:400;color:#7e8890;">
                        <a style="color:#d498a7;" href="${BASE_URL}/api/u/unsubscribe/${hash}/${Buffer.from(to).toString('base64')}">Unsubscribe</a> from NKUOJ.
                      </td>
                    </tr>
                    <tr height="50"></tr>
                  </tfoot>
                </table>
              </td>
              <td width="50"></td>
            </tr>
            <tr height="100" style="background:#eaeced;"></tr>
          </table>
        </body>
        
        </html>`,
        to: to
      }
      transporter.sendMail(Object.assign(mailOptions, arg), (error, info) => {
        if (error) return callback({success: false, error: error})
        return callback({success: true, info: info})
      })
    })
  })
}

const banEmail = (hash, email, unban, cb) => {
  'use strict'
  email = email.toLowerCase()
  if (unban) {
    client.del(`banned:${email}`, 1)
    cb({success: true})
  }
  else client.get(hash, (err, res) => {
    if (res === email) {
      client.set(`banned:${email}`, 1)
      cb({success: true})
    } else {
      console.log(email, res)
      cb({success: false, error: 'cannot find the key, the TTL is 2 days, sorry.'})
    }
  })
}

module.exports = {
  sendVerificationMail: register,
  banEmail: banEmail
}