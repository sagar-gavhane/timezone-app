/* eslint-disable max-len */
const fetch = require('node-fetch');

const { dbConnector } = require('./../../configs');

global.fetch = fetch;

const storeRecord = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const {
        user_name, t_start_date, t_start_date_time, t_advanced_start_date, t_advanced_start_date_time,
      } = data;
      const query = 'INSERT INTO test_time(user_name, t_start_date, t_start_date_time, t_advanced_start_date, t_advanced_start_date_time) VALUES (?,?,?,?,?)';
      const args = [user_name, t_start_date, t_start_date_time, t_advanced_start_date, t_advanced_start_date_time];
      const { affectedRows } = await dbConnector.query(query, args);
      resolve(affectedRows);
    } catch (err) {
      console.log('err', err);
      reject(err);
    }
  });
};

const getRecords = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const query = 'SELECT * FROM test_time';
      const result = await dbConnector.query(query);
      resolve(result);
    } catch (err) {
      console.log('err', err);
      reject(err);
    }
  });
};

module.exports = { storeRecord, getRecords };
