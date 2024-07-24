import joi from 'joi';
import {optionsSchemas} from '@form8ion/core';

export default joi.object().pattern(/^/, optionsSchemas.form8ionPlugin.keys({
  prompt: joi.func().required(),
  public: joi.bool(),
  private: joi.bool()
}));
