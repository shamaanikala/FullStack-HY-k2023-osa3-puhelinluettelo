require('dotenv').config()
const express = require('express')
const app = express()
const Person = require('./models/person')

const morgan = require('morgan')
const cors = require('cors')

app.use(express.json())
app.use(cors())
app.use(express.static('build'))

// POST ei täällä...
app.use(morgan('tiny',{
    skip: function (req,res) {return req.method === 'POST'} // ei kahta kertaa POST
}))

// POST body merkkijonoksi
morgan.token('body',function (req, res) {
    //console.log('POST body',JSON.stringify(req.body))
    return JSON.stringify(req.body)
    //return 'lol' // tämän palautus onnistuu, eli str
})


// .. vaan täällä
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body ',{
    skip: function (req,res) {return req.method !== 'POST'}
}))


const unknowEndpoint = (request, response) => {
    response.status(404).send({error: 'unknown endpoint'})
}

const errorHandler = (error, request, response, next) => {
    console.log(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id'} )
    }
    //console.log('TÄÄLLÄ')
    if (error.message === 'MissingData') {
        return response.status(400).json({
            error: 'Entry must have both name and number included.'
        })
    }

    next(error)
}


let persons = []


app.get('/', (req,res) => {
    res.send(`<h1>Puhelinluettelo</h1>`)
})

app.get('/api/persons', (req,res) => {
    Person.find({}).then(persons => {
        res.json(persons)
    })
})

app.get('/info', (req,res) => {
    // Phonebook has info for X people
    //
    // Sat Jan 22 2022 22:26:20 GMT+0200 (Easter European Standard Time)
    //console.log('GET /info',Date())
    const msg = `Phonebook has info for ${persons.length} people<br /><br />${Date()}`
    res.send(msg)
})

app.get('/api/persons/:id', (request,response, next) => {
    Person.findById(request.params.id)
        .then(person => {
            if (person) {
                response.json(person)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (request,response, next) => {
    Person.findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})


const checkExistingId = (id,persons) => {
    return [...persons.map(p => p.id)].includes(id)
    ? true
    : false
} 


const generateRandomId = () => {
    // random integer between 1,2^64+1
    //console.log('generoidaan random id')
    const randomId = Math.floor(Math.random() * 2**64)+1
    return checkExistingId(randomId,persons)
    ? generateRandomId()
    : randomId 
}

app.post('/api/persons', (request,response,next) => {
    const body = request.body

    // console.log('request.body',body)

    if (!body.name || !body.number) {
        console.log('ERROR: missing name or number',Date())
        // return response.status(400).json({
        //    error: 'Entry must have both name and number included.'
        // })
        // heitetään oma Error. Muodostimen parametri on 
        // Error.message
        throw new Error('MissingData')
    }
    
    // if ([...persons.map(p => p.name)].includes(body.name)) {
    //     // console.log('ERROR: Duplicate name',Date())
    //     return response.status(400).json({
    //         error: 'name must be unique'
    //     })
    // }
    // console.log('Lisätään uusi yhteystieto')
    const person = new Person({
        name: body.name,
        number: body.number,
        //id: generateRandomId(),
    })
    //persons = persons.concat(person)

    //response.status(201).json(person)
    person.save().then(savedPerson => {
        response.json(savedPerson)
    })
})


app.use(errorHandler)
app.use(unknowEndpoint)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})