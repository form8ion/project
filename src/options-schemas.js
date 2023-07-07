import joi from 'joi';

export const overridesSchema = joi.object({copyrightHolder: joi.string()});

export const decisionsSchema = joi.object();
