
const { v4: uuidv4 } = require('uuid')

function _loadTests(db, io) {
  db.collection('leafTestTests').find().toArray(function(err, res) {
    if (err) throw err
    io.emit('loadTests', res)
  })
}

function _loadSections(db, io, data) {
  db.collection('leafTestSections').find({testId: data.testId}).toArray(function(err, res) {
    if (err) throw err
    io.emit('loadSections', res)
  })
}

function _loadQuestions(db, io, data) {
  db.collection('leafTestQuestions').find({testId: data.testId, sectionId: data.sectionId}).toArray(function(err, res) {
    if (err) throw err
    io.emit('loadQuestions', res)
  })
}

function swapSections(db, io, data, res, order1, order2) {
  let res1, res2, id1, id2
  for (let r = 0; r < res.length; r++) {
    if (res[r].order == order1) {
      id1 = res[r].id
    }
    if (res[r].order == order2) {
      id2 = res[r].id
    }
  }
  db.collection('leafTestSections').updateOne({id: id1}, {$set: {order: order2}}, function(err, res) {
    if (err) throw err
    _loadSections(db, io, data)
  })
  db.collection('leafTestSections').updateOne({id: id2}, {$set: {order: order1}}, function(err, res) {
    if (err) throw err
    _loadSections(db, io, data)
  })
}

function swapQuestions(db, io, data, res, order1, order2) {
  let res1, res2, id1, id2
  for (let r = 0; r < res.length; r++) {
    if (res[r].order == order1) {
      id1 = res[r].id
    }
    if (res[r].order == order2) {
      id2 = res[r].id
    }
  }
  db.collection('leafTestQuestions').updateOne({id: id1}, {$set: {order: order2}}, function(err, res) {
    if (err) throw err
    _loadQuestions(db, io, data)
  })
  db.collection('leafTestQuestions').updateOne({id: id2}, {$set: {order: order1}}, function(err, res) {
    if (err) throw err
    _loadQuestions(db, io, data)
  })
}

function swapAnswers(db, io, data, res, order1, order2) {
  const a1 = res.answers.find(function(a) {
    return a.order == order1
  })
  const a2 = res.answers.find(function(a) {
    return a.order == order2
  })
  a1.order = order2
  a2.order = order1
  const answers = []
  for (let i = 0; i < res.answers.length; i++) {
    if (res.answers[i].id == a1.id) {
      answers.push(a1)
    } else if (res.answers[i].id == a2.id) {
      answers.push(a2)
    } else {
      answers.push(res.answers[i])
    }
  }
  db.collection('leafTestQuestions').updateOne({'_id': res._id}, {$set: {answers: answers}}, function(err, res) {
    if (err) throw err
    _loadQuestions(db, io, data)
  })
}

module.exports = {

  loadTest: function(db, io, data, debugOn) {

    if (debugOn) { console.log('loadTest', data) }

    db.collection('leafTestSections').find({testId: data.id}).toArray(function(err, res) {
      if (err) throw err
      if (res.length) {
        const sections = []
        for (let r = 0; r < res.length; r++) {
          sections.push({id: res[r].id, section: res[r].section, questions: []})
        }
        console.log(sections)
        db.collection('leafTestQuestions').find({testId: data.id}).toArray(function(err, secRes) {
          if (err) throw err
          if (secRes.length) {
            for (let i = 0; i < secRes.length; i++) {
              for (let j = 0; j < sections.length; j++) {
                if (secRes[i].sectionId == sections[j].id) {
                  sections[j].questions.push(secRes[i])
                }
              }
            }
            data.sections = sections
            io.emit('loadTest', data)
          }
        })
      }
    })
  },

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

    db.collection('leafTestTests').insertOne({test: data.test, id: uuidv4()}, function(err, res) {
      if (err) throw err
      if (res) {
        _loadTests(db, io)
      }
    })
  },

  updateTest: function(db, io, data, debugOn) {

    if (debugOn) { console.log('updateTest', data) }

    db.collection('leafTestTests').findOne({id: data.testId}, function(err, res) {
      if (err) throw err
      if (res) {
        res.test = data.test
        const id = res._id
        delete res._id
        db.collection('leafTestTests').updateOne({'_id': id}, {$set: res}, function(err, res) {
          if (err) throw err
          _loadTests(db, io)
        })
      }
    })
  },

  deleteTest: function(db, io, data, debugOn) {

    if (debugOn) { console.log('deleteTest', data) }

    db.collection('leafTestTests').deleteOne({id: data.testId}, function(err, res) {
      if (err) throw err
      _loadTests(db, io)
    })
  },

  addSection: function(db, io, data, debugOn) {

    if (debugOn) { console.log('addSection', data) }

    db.collection('leafTestSections').find({testId: data.testId}).toArray(function(err, res) {
      if (err) throw err
      console.log('N', res.length)
      const order = res.length ? res.length + 1 : 1
      db.collection('leafTestSections').insertOne({testId: data.testId, id: uuidv4(), order: order, section: data.section}, function(err, res) {
        if (err) throw err
        if (res) {
          _loadSections(db, io, data)
        }
      })
    })
  },

  updateSection: function(db, io, data, debugOn) {

    if (debugOn) { console.log('updateSection', data) }

    db.collection('leafTestSections').findOne({id: data.sectionId}, function(err, res) {
      if (err) throw err
      if (res) {
        res.section = data.section
        const id = res._id
        delete res._id
        db.collection('leafTestSections').updateOne({'_id': id}, {$set: res}, function(err, res) {
          if (err) throw err
          _loadSections(db, io, data)
        })
      }
    })
  },

  moveSectionUp: function(db, io, data, debugOn) {

    if (debugOn) { console.log('moveSectionUp', data) }

    db.collection('leafTestSections').find({testId: data.testId}).toArray(function(err, res) {
      if (err) throw err
      if (res.length) {
        swapSections(db, io, data, res, data.order, data.order - 1)
      }
    })
  },

  moveSectionDown: function(db, io, data, debugOn) {

    if (debugOn) { console.log('moveSectionDown', data) }

    db.collection('leafTestSections').find({testId: data.testId}).toArray(function(err, res) {
      if (err) throw err
      if (res.length) {
        swapSections(db, io, data, res, data.order, data.order + 1)
      }
    })
  },

  deleteSection: function(db, io, data, debugOn) {

    if (debugOn) { console.log('deleteSection', data) }

    db.collection('leafTestSections').deleteOne({id: data.sectionId}, function(err, res) {
      if (err) throw err
      _loadSections(db, io, data)
    })
  },

  addQuestion: function(db, io, data, debugOn) {

    if (debugOn) { console.log('addQuestion', data) }

    db.collection('leafTestQuestions').find({testId: data.testId, sectionId: data.sectionId}).toArray(function(err, res) {
      if (err) throw err
      const order = res.length ? res.length + 1 : 1
      const newRes = {
        testId: data.testId,
        sectionId: data.sectionId,
        id: uuidv4(),
        order: order,
        question: data.question,
        multiple: false,
        answers: []
      }
      db.collection('leafTestQuestions').insertOne(newRes, function(err, res) {
        if (err) throw err
        if (res) {
          _loadQuestions(db, io, data)
        }
      })
    })
  },

  deleteQuestion: function(db, io, data, debugOn) {

    if (debugOn) { console.log('deleteQuestion', data) }

    db.collection('leafTestQuestions').deleteOne({id: data.id}, function(err, res) {
      if (err) throw err
      _loadQuestions(db, io, data)
    })
  },

  moveQuestionUp: function(db, io, data, debugOn) {

    if (debugOn) { console.log('moveQuestionUp', data) }

    db.collection('leafTestQuestions').find({sectionId: data.sectionId}).toArray(function(err, res) {
      if (err) throw err
      if (res.length) {
        swapQuestions(db, io, data, res, data.order, data.order - 1)
      }
    })
  },

  moveQuestionDown: function(db, io, data, debugOn) {

    if (debugOn) { console.log('moveQuestionDown', data) }

    db.collection('leafTestQuestions').find({sectionId: data.sectionId}).toArray(function(err, res) {
      if (err) throw err
      if (res.length) {
        swapQuestions(db, io, data, res, data.order, data.order + 1)
      }
    })
  },

  addAnswer: function(db, io, data, debugOn) {

    if (debugOn) { console.log('addAnswer', data) }

    db.collection('leafTestQuestions').findOne({testId: data.testId, sectionId: data.sectionId, id: data.questionId}, function(err, res) {
      if (err) throw err
      if (res) {
        const order = res.answers.length + 1
        res.answers.push({
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

  deleteAnswer: function(db, io, data, debugOn) {

    if (debugOn) { console.log('deleteAnswer', data) }

    db.collection('leafTestQuestions').findOne({testId: data.testId, sectionId: data.sectionId, id: data.questionId}, function(err, res) {
      if (err) throw err
      if (res) {
        const answers = []
        for (let i = 0; i < res.answers.length; i++) {
          if (res.answers[i].id != data.id) {
            answers.push(res.answers[i])
          }
        }
        db.collection('leafTestQuestions').updateOne({id: data.questionId}, {$set: {answers: answers}}, function(err, res) {
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

    db.collection('leafTestQuestions').findOne({testId: data.testId, sectionId: data.sectionId, id: data.questionId}, function(err, res) {
      if (err) throw err
      if (res) {
        const answers = []
        for (let i = 0; i < res.answers.length; i++) {
          const answer = res.answers[i]
          if (!res.multiple) {
            answer.answer = false
          }
          if (answer.id == data.answerId) {
            answer.answer = true
          }
          answers.push(answer)
        }
        res.answers = answers
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

  moveAnswerUp: function(db, io, data, debugOn) {

    if (debugOn) { console.log('moveAnswerUp', data) }

    db.collection('leafTestQuestions').findOne({id: data.questionId}, function(err, res) {
      if (err) throw err
      if (res) {
        swapAnswers(db, io, data, res, data.order, data.order - 1)
      }
    })
  },

  moveAnswerDown: function(db, io, data, debugOn) {

    if (debugOn) { console.log('moveAnswerDown', data) }

    db.collection('leafTestQuestions').findOne({id: data.questionId}, function(err, res) {
      if (err) throw err
      if (res) {
        swapAnswers(db, io, data, res, data.order, data.order + 1)
      }
    })
  },
  saveQuestionType: function(db, io, data, debugOn) {

    if (debugOn) { console.log('saveQuestionType', data) }

    db.collection('leafTestQuestions').findOne({testId: data.testId, sectionId: data.sectionId, id: data.questionId}, function(err, res) {
      if (err) throw err
      if (res) {
        res.multiple = data.multiple
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

    db.collection('leafTestQuestions').findOne({testId: data.testId, sectionId: data.sectionId, id: data.questionId}, function(err, res) {
      if (err) throw err
      if (res) {
        res.question = data.question
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
