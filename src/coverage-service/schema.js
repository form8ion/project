import joi from 'joi';
import {optionsSchemas} from '@form8ion/core';

export default joi.object().pattern(joi.string(), optionsSchemas.form8ionPlugin).default({});
