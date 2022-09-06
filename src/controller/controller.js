import { db } from '../utils'

export const createUser = async (request, reply) => {
	try {
		const { name } = request.body
		if (!name) reply.send({ success: false, message: 'name is required.' })

		const userExists = await db.oneOrNone('SELECT name FROM users WHERE name = $1', name)
		if (userExists) reply.send({ success: false, message: 'User already exists' })

		const newUser = await db.one(`INSERT INTO users (name) values ($1) RETURNING *`, name)
		if (newUser) reply.send({ success: true, message: newUser })
	} catch (err) {
		console.log(`createUser err: `, err.message)
		reply.send({ success: false, message: `Failed to create user` })
	}
}

export const getUsers = async (request, reply) => {
	try {
		const users = await db.many(`SELECT * FROM users`)
		users ? reply.send({ success: true, message: users }) : reply.send({ success: false, message: `Can't get users list` })
	} catch (err) {
		console.log(`getUsers err: `, err.message)
		reply.send({ success: false, message: `Failed to get users` })
	}
}

export const getUser = async (request, reply) => {
	try {
		const { name } = request.headers
		if (!name) reply.send({ success: false, message: 'name is required.' })

		const user = await db.one(`SELECT * FROM users WHERE name = $1`, name)
		if (!user) reply.send({ success: false, message: `User doesn't exist` })

		reply.send({ success: true, message: user })
	} catch (err) {
		console.log(`getUser err: `, err.message)
		reply.send({ success: false, message: `Failed to get user ${user}` })
	}
}

export const deleteUser = async (request, reply) => {
	try {
		const { name } = request.headers
		if (!name) reply.send({ success: false, message: 'name is required.' })

		const user = await db.one(`SELECT * FROM users WHERE name = $1`, name)
		if (!user) reply.send({ success: false, message: `User doesn't exist` })

		await db.oneOrNone(`DELETE FROM users WHERE name = $1`, name)
		reply.send({ success: true, message: user })
	} catch (err) {
		console.log(`deleteUser err: `, err.message)
		reply.send({ success: false, message: `Failed to delete user ${user}` })
	}
}
