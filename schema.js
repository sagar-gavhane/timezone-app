const Joi = require('joi');

module.exports = Joi.object().keys({
  user_name: Joi.string().required(),
  t_start_date: Joi.string().required(),
  t_start_date_time: Joi.string().required(),
});
