const { response } = require('express')
const express = require('express')
const app = express()

let persons = [
    {
        "name": "Arto Hellas",
        "number": "040-123456",
        "id": 1
    },
    {
        "name": "Ada Lovelace",
        "number": "39-44-5323523",
        "id": 2
    },
    {
        "name": "Dan Abramov",
        "number": "12-43-234345",
        "id": 3
    },
    {
        "name": "Mary Poppendieck",
        "number": "39-23-6423122",
        "id": 4
    }
]


app.get('/', (req,res) => {
    console.log('GET /',Date())
    res.send(`<h1>Puhelinluettelo</h1>`)
})

app.get('/api/persons', (req,res) => {
    console.log('GET /api/persons',Date())
    res.json(persons)
})

app.get('/info', (req,res) => {
    // Phonebook has info for X people
    //
    // Sat Jan 22 2022 22:26:20 GMT+0200 (Easter European Standard Time)
    console.log('GET /info',Date())
    const msg = `Phonebook has info for ${persons.length} people<br /><br />${Date()}`
    res.send(msg)
})

app.get('/api/persons/:id', (request,response) => {
    const id = Number(request.params.id)
    console.log(`GET /api/persons/${id}`,Date())
    const person = persons.find(person => person.id === id)
    if (person) {
        response.json(person)
    } else {
        console.log(`#STATUS 404: id=${id} not found!`,Date())
        response.status(404).send(
            `<h2>
                404 - Person not found!
            </h2>
            <br />
            <i>ID number ${id} does not exist in the data.</i>`)
    }
})

app.delete('/api/persons/:id', (request,response) => {
    const id = Number(request.params.id)
    console.log(`DELETE /api/persons/${id}`,Date())
    persons = persons.filter(p => p.id !== id)
    console.log('Persons filter jälk',persons)
    response.status(204).end()
})

const PORT = 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)