import * as config from  './config'

const prefix = config.CONFIG_PREFIX

export const mkErr = msg => new Error(`${prefix}: ${msg}`)