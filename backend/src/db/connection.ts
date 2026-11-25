import { Sequelize } from 'sequelize';
import { env } from '../config/env';
export const db = new Sequelize(env.dbName, env.dbUser, env.dbPassword, { dialect:'postgres', host:env.dbHost, port:env.dbPort, logging:false, pool:{max:5,min:0,acquire:10000,idle:10000} });
