import * as methods from './controller/controller'
import { server } from './utils'

server.post('/api/users', async (request, reply) => {
	await methods.createUser(request, reply)
})
server.get('/api/users', async (requst, reply) => {
	await methods.getUsers(requst, reply)
})
server.get('/api/user', async (request, reply) => {
	await methods.getUser(request, reply)
})
server.delete('/api/user', async (request, reply) => {
	await methods.deleteUser(request, reply)
})

server.post('/api/add_balance', async (request, reply) => {
	await methods.addBalance(request, reply)
})

server.post('/api/remove_balance', async (request, reply) => {
	await methods.removeBalance(request, reply)
})

server.listen({ port: 3000 }, (err) => {
	if (err) throw err
})
