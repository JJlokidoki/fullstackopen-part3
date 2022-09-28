/* eslint-disable no-undef */
const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('Please provide the password as an argument: node mongo.js <password>')
  process.exit(1)
}

const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]

const url = `mongodb+srv://fwd:${password}@cluster0.3cd4rut.mongodb.net/?retryWrites=true&w=majority`

const noteSchema = new mongoose.Schema({
  id: String,
  name: String,
  number: String,
})

const Note = mongoose.model('Note', noteSchema)

async function createNote () {
  try {
    await mongoose.connect(url)
    console.log('connected')
    const note = new Note({
      id: Math.floor(Math.random() * 10000),
      name,
      number })
    await note.save()
    console.log('Note saved')
    await mongoose.connection.close()
  } catch (error) {
    console.log(error)
  }
}

async function listNotes () {
  try {
    await mongoose.connect(url)
    console.log('connected')
    const list = await Note.find({})
    list.forEach( (note) => console.log(note))
    await mongoose.connection.close()
  } catch (error) {
    console.log(error)
  }
}

if (!name && !number) {
  listNotes()
}
else {
  createNote()
}
