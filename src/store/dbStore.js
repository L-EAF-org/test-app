
const { v4: uuidv4 } = require('uuid')

function _loadTests(db, io) {
  db.collection('leafTestTests').find().toArray(function(err, res) {
    if (err) throw err
    io.emit('loadTests', res)
  })
}

function _loadSections(db, io, data) {
  db.collection('leafTestSections').find({test: data.test}).toArray(function(err, res) {
    if (err) throw err
    io.emit('loadSections', res)
  })
}

function _loadQuestions(db, io, data) {
  db.collection('leafTestQuestions').find({test: data.test, section: data.section}).toArray(function(err, res) {
    if (err) throw err
    io.emit('loadQuestions', res)
  })
}

module.exports = {

  loadTests: function(db, io, debugOn) {

    if (debugOn) { console.log('loadTests') }
    _loadTests(db, io)
  },

  loadSections: function(db, io, data, debugOn) {

    if (debugOn) { console.log('loadSections', data) }
    _loadSections(db, io, data)
  },

  loadQuestions: function(db, io, data, debugOn) {

    if (debugOn) { console.log('loadQuestions', data) }
    _loadQuestions(db, io, data)
  },

  addTest: function(db, io, data, debugOn) {

    if (debugOn) { console.log('addTest', data) }

    db.collection('leafTestTests').insertOne({test: data.test}, function(err, res) {
      if (err) throw err
      if (res) {
        _loadTests(db, io)
      }
    })
  },

  addSection: function(db, io, data, debugOn) {

    if (debugOn) { console.log('addSection', data) }

    db.collection('leafTestSections').insertOne({test: data.test, section: data.section}, function(err, res) {
      if (err) throw err
      if (res) {
        _loadSections(db, io, data)
      }
    })
  },

  addQuestion: function(db, io, data, debugOn) {

    if (debugOn) { console.log('addQuestion', data) }

    db.collection('leafTestQuestions').find({test: data.test, section: data.section}).toArray(function(err, res) {
      if (err) throw err
      const order = res.length ? res.length + 1 : 1
      const question = {
        id: uuidv4(),
        order: order,
        multiple: false,
        question: data.question,
        answers: []
      }
      db.collection('leafTestQuestions').insertOne({test: data.test, section: data.section, question: question}, function(err, res) {
        if (err) throw err
        if (res) {
          _loadQuestions(db, io, data)
        }
      })
    })
  },

  addAnswer: function(db, io, data, debugOn) {

    if (debugOn) { console.log('addAnswer', data) }

    db.collection('leafTestQuestions').findOne({test: data.test, section: data.section, 'question.id': data.questionId}, function(err, res) {
      if (err) throw err
      if (res) {
        const order = res.question.answers.length + 1
        res.question.answers.push({
          id: uuidv4(),
          order: order,
          answer: false,
          value: data.answer
        })
        const id = res._id
        delete res._id
        db.collection('leafTestQuestions').updateOne({'_id': id}, {$set: res}, function(err, res) {
          if (err) throw err
          if (res) {
            _loadQuestions(db, io, data)
          }
        })
      }
    })
  },

  makeAnswer: function(db, io, data, debugOn) {

    if (debugOn) { console.log('makeAnswer', data) }

    db.collection('leafTestQuestions').findOne({test: data.test, section: data.section, 'question.id': data.questionId}, function(err, res) {
      if (err) throw err
      if (res) {
        const answers = []
        for (let i = 0; i < res.question.answers.length; i++) {
          const answer = res.question.answers[i]
          if (!res.question.multiple) {
            answer.answer = false
          }
          if (answer.id == data.answerId) {
            answer.answer = true
          }
          answers.push(answer)
        }
        res.question.answers = answers
        const id = res._id
        delete res._id
        db.collection('leafTestQuestions').updateOne({'_id': id}, {$set: res}, function(err, res) {
          if (err) throw err
          if (res) {
            _loadQuestions(db, io, data)
          }
        })
      }
    })
  },

  saveQuestionType: function(db, io, data, debugOn) {

    if (debugOn) { console.log('saveQuestionType', data) }

    db.collection('leafTestQuestions').findOne({test: data.test, section: data.section, 'question.id': data.questionId}, function(err, res) {
      if (err) throw err
      if (res) {
        res.question.multiple = data.multiple
        const id = res._id
        delete res._id
        db.collection('leafTestQuestions').updateOne({'_id': id}, {$set: res}, function(err, res) {
          if (err) throw err
          if (res) {
            _loadQuestions(db, io, data)
          }
        })
      }
    })
  },

  saveQuestionQuestion: function(db, io, data, debugOn) {

    if (debugOn) { console.log('saveQuestionQuestion', data) }

    db.collection('leafTestQuestions').findOne({test: data.test, section: data.section, 'question.id': data.questionId}, function(err, res) {
      if (err) throw err
      if (res) {
        res.question.question = data.question
        const id = res._id
        delete res._id
        db.collection('leafTestQuestions').updateOne({'_id': id}, {$set: res}, function(err, res) {
          if (err) throw err
          if (res) {
            _loadQuestions(db, io, data)
          }
        })
      }
    })
  }

}
