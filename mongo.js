const mongoose = require('mongoose')

//console.log(process.argv,process.argv.length)

if (process.argv.length < 3) {
    console.log('Call the script:')
    console.log('To add new information:')
    console.log('node mongo.js <password> "name surname" phonenumber')
    console.log('To print the phonebook content:')
    console.log('node mongo.js <password>')
    process.exit(1)
}

const password = process.argv[2]
const url = `mongodb+srv://fullstack-shamaani:${password}@cluster0.y477via.mongodb.net/puhelinluetteloApp?retryWrites=true&w=majority`

mongoose.set('strictQuery',false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 5) {
    const name = process.argv[3]
    const number = process.argv[4]

    const person = new Person({
        name: name,
        number: number,
    })

    person.save().then(result => {
        console.log('Henkilötiedot tallennettu!')
        console.log(result)
        mongoose.connection.close()
    })
}
else if (process.argv.length === 3) {
    console.log('Haetaan henkilötiedot tietokannasta...')
    Person.find({}).then(result => {
        result.forEach(person => {
            console.log(person)
        })
        mongoose.connection.close()
    })
}
else { 
    console.log('Unknow command')
    mongoose.connection.close()
}