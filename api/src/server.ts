import express, { Request, Response } from 'express'

const app = express()
app.use(express.json())
const port = 3000

app.get('/', (req, res) => {
	res.send('Hello World! 2')
})

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`)
})