require('dotenv').config()
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')

const Note = require('./models/Note')

const app = express()
app.use(cors())
app.use(express.static('build'))
app.use(express.json())

morgan.token('body', function (req) { return Object.values(req.body).length > 0 ? JSON.stringify(req.body) : '' })
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

// eslint-disable-next-line no-undef
const PORT = process.env.PORT || 3001


app.get('/info', async (request, response, next) => {
  try{
    const count = await Note.count()
    const msg = `
    Phonebook has info for ${count} people <br/>
    ${Date()}`
    return response.send(msg)
  }
  catch (error) {
    next(error)
  }
})

app.get('/api/persons', async (request, response, next) => {
  try {
    const notes = await Note.find({})
    return response.json(notes)
  }
  catch (error) {
    next(error)
  }
})

app.get('/api/persons/:id', async (request, response, next) => {
  try {
    const id = request.params.id
    const res = await Note.findById(id)
    if (res) {
      return response.json(res)
    }
    else {
      return response.status(404).end()
    }
  }
  catch (error) {
    next(error)
  }
})

app.delete('/api/persons/:id', async (request, response, next) => {
  try {
    const id = request.params.id
    const res = await Note.findByIdAndDelete(id)
    if (res) {
      return response.status(204).end()
    }
    else {
      return response.status(404).json({ error: 'Unknown id' })
    }
  }
  catch (error) {
    next(error)
  }
})

app.post('/api/persons', async (request, response, next) => {
  try {
    const req = request.body
    const persons = await Note.find({})
    if (req.name === undefined) {
      return response.status(400).json({ error: 'name is missing' })
    }

    if (req.number === undefined) {
      return response.status(400).json({ error: 'number is missing' })
    }

    if (persons.find( p => p.name === req.name )) {
      return response.status(400).json({ error: 'name must be unique' })
    }

    const newPerson = {
      name: req.name,
      number: req.number
    }

    const note = new Note(newPerson)
    const res = await note.save()
    return response.status(201).json(res)
  }
  catch (error) {
    next(error)
  }
})

app.put('/api/persons/:id', async (request, response, next) => {
  try {
    const id = request.params.id
    const newPersonObj =  request.body
    const res = await Note.findByIdAndUpdate(id, newPersonObj, { new: true, runValidators: true })
    if (res) {
      return response.status(201).send(res)
    }
    else {
      return response.status(404).end()
    }
  }
  catch (error) {
    next(error)
  }

})

const unknownEndpoint = (request, response) => {
  response.status(404).json({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).json({ error: 'malformatted id' })
  }
  else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  else if (error.name === 'BadRequest') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}
app.use(errorHandler)

app.listen(PORT, () => console.log('Server is running on port ' + PORT))
