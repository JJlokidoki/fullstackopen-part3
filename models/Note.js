const mongoose = require('mongoose')

// eslint-disable-next-line no-undef
const mongoUrl = process.env.MONGO_URL

mongoose.connect(mongoUrl)
  .then( () => {
    console.log('connected to mongodb')
  })
  .catch(error => {
    console.log('connected to MongoDb failed: ', error.message)
  })

const noteSchema = new mongoose.Schema({
  id: String,
  name: {
    type: String,
    minLength: 3,
    required: true
  },
  number: {
    type: String,
    minLength: 8,
    validate: {
      validator: function(v) {
        return /^\d{2,3}-\d*$/.test(v)
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
})
noteSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Note', noteSchema)
