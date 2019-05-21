const express = require('express');
const serverless = require('serverless-http');
const isEmpty = require('lodash/isEmpty');
const Joi = require('joi');
const moment = require('moment-timezone');

const schema = require('./schema');

const { storeRecord, getRecords } = require('./model');
const { successResponse, errorResponse, joiErrorDetails } = require('./../../utils');
const { startup, errorHandler } = require('./../../middlewares');
const { PayloadNotReceived, PayloadInvalidReceived } = require('./../../constants/errorMessage');
const { joiOption } = require('./../../configs');

const app = express();

startup(app);

app.post('/timezone', async (req, res, next) => {
  const { payload = {} } = req.body;

  if (isEmpty(payload)) {
    next(PayloadNotReceived);
  } else {
    const { user_name, t_start_date, t_start_date_time } = payload;
    const sanitizedData = {
      user_name,
      t_start_date,
      t_start_date_time: moment(t_start_date_time, 'YYYY-MM-DD HH:mm').format('YYYY-MM-DD HH:mm'),
      t_advanced_start_date: moment(t_start_date, 'YYYY-MM-DD').add(1, 'month').format('YYYY-MM-DD'),
      t_advanced_start_date_time: moment(t_start_date_time, 'YYYY-MM-DD HH:mm').add(1, 'month').format('YYYY-MM-DD HH:mm'),
    };
    console.log('sanitizedData', sanitizedData);

    const { error: joiError } = Joi.validate(sanitizedData, schema, joiOption);

    if (!isEmpty(joiError)) {
      const details = joiErrorDetails(joiError);
      const response = { ...PayloadInvalidReceived, ...{ details } };
      next(response);
    } else {
      const affectedRows = await storeRecord(sanitizedData);
      try {
        if (affectedRows) {
          const result = await getRecords();
          const [lastRecord] = result.slice(-1);
          const record = {
            user_name: lastRecord.user_name,
            t_start_date: moment(lastRecord.t_start_date, 'YYYY-MM-DD', true).tz('Asia/Kolkata'),
            t_start_date_time: moment(lastRecord.t_start_date_time).tz('Asia/Kolkata'),
            // t_advanced_start_date: moment(lastRecord.t_advanced_start_date).tz('Asia/Kolkata'),
            // t_advanced_start_date_time: moment(lastRecord.t_advanced_start_date_time).tz('Asia/Kolkata'),
          };
          const response = successResponse(record, 'records successfully stored.');
          res.send(response);
        } else {
          const response = errorResponse('failed to store records.');
          res.send(response);
        }
      } catch (err) {
        console.log('err', err);
        res.send(err);
      }
    }
  }
});

app.get('/timezone', async (req, res, next) => {
  try {
    const result = await getRecords();
    res.send(result);
  } catch (err) {
    next(err);
  }
});

errorHandler(app);

module.exports.handler = serverless(app);
