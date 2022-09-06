import pgp from 'pg-promise'
import promise from 'bluebird'
import Fastify from 'fastify'
export const server = Fastify({ logger: true })
const { HOST, PASSWORD } = process.env
export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const initOptions = {
	promiseLib: promise
}
const pg = pgp(initOptions)
const cn = {
	host: HOST,
	port: 5432,
	database: 'postgres',
	user: 'postgres',
	password: PASSWORD,
	allowExitOnIdle: true
}
export const db = pg(cn)
