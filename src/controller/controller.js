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

export const addBalance = async (request, reply) => {
	try {
		const { name, sum, confirmed } = request.body
		if (!name || !sum) reply.send({ success: false, message: 'name and sum are required.' })

		const { id } = await db.oneOrNone(`SELECT id FROM users WHERE name = $1`, name)
		if (!id) reply.send({ success: false, message: `User doesn't exist` })

		await db.tx(async (t) => {
			if (!confirmed) {
				reply.send({ success: false, message: `Transaction is not confirmed` })
			} else {
				let user = await t.one(`SELECT * FROM users WHERE id = $1 FOR UPDATE`, [id])
				const balance = Number(user.money) + sum

				await t.none(`UPDATE users SET money = $1 where id = $2`, [balance, id])
				reply.send({ success: true, message: `Transaction confirmed, new balance is ${balance}` })
			}
		})
	} catch (err) {
		console.log(`addBalance err: `, err.message)
		reply.send({ success: false, message: `Failed to add balance` })
	}
}

export const removeBalance = async (request, reply) => {
	try {
		const { name, sum, confirmed } = request.body
		if (!name || !sum) reply.send({ success: false, message: 'name and sum are required.' })

		const { id } = await db.oneOrNone(`SELECT id FROM users WHERE name = $1`, name)
		if (!id) reply.send({ success: false, message: `User doesn't exist` })

		await db.tx(async (t) => {
			if (!confirmed) {
				await t.oneOrNone(`INSERT INTO transactions (confirmed, sum, user_id) values ($1, $2, $3)`, [confirmed, sum, id])
				reply.send({ success: false, message: `Transaction is not confirmed` })
			} else {
				await t.oneOrNone(`INSERT INTO transactions (confirmed, sum, user_id) values ($1, $2, $3)`, [confirmed, sum, id])
				let { money } = await db.oneOrNone(`SELECT money FROM users WHERE id = $1 FOR UPDATE`, [id])
				if (money < sum) reply.send({ success: false, message: `Not enough money` })

				const balance = Number(money) - sum
				await t.none(`UPDATE users SET money = $1 where id = $2`, [balance, id])
				reply.send({ success: true, message: `Transaction confirmed, new balance is ${balance}` })
			}
		})
	} catch (err) {
		console.log(`removeBalance err: `, err.message)
		reply.send({ success: false, message: `Failed to remove balance` })
	}
}
