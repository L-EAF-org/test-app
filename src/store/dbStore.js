
const questionFuns = require('./lib/questions.js')

const { v4: uuidv4 } = require('uuid')

function _loadOrganisations(db, io) {
  db.collection('leafTestOrganisations').find().toArray(function(err, res) {
    if (err) throw err
    io.emit('loadOrganisations', res)
  })
}

function _loadStudents(db, io, data) {
  db.collection('leafTestStudents').find({organisationId: data.organisationId}).toArray(function(err, res) {
    if (err) throw err
    io.emit('loadStudents', res)
  })
}

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
    _updateSectionQuestions(db, data.sectionId, res.length)
    io.emit('loadQuestions', res)
  })
}

function _updateSectionQuestions(db, id, n) {
  db.collection('leafTestSections').updateOne({id: id}, {$set: {questions: n}}, function(err, ) {
    if (err) throw err
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

function _loadTestInstance(db, io, id) {
  db.collection('leafTestTestInstances').findOne({id: id}, function(err, res) {
    if (err) throw err
    const testInstance = {
      id: id,
      correct: res.correct,
      organisation: res.organisation,
      test: res.test,
      student: res.student
    }
    io.emit('loadTestInstance', testInstance)
  })
}

module.exports = {

  loadTestOrganisationStudents: function(db, io, data, debugOn) {

    if (debugOn) { console.log('loadTestOrganisationStudents', data) }

    db.collection('leafTestStudents').find({organisationId: data.organisationId}).toArray(function(err, res) {
      if (err) throw err
      if (res.length) {
        const students = []
        for (let r = 0; r < res.length; r++) {
          students.push({
            id: res[r].id,
            student: res[r].student
          })
        }
        io.emit('loadTestOrganisationStudents', students)
      }
    })
  },

  loadTest: function(db, io, data, debugOn) {

    if (debugOn) { console.log('loadTest', data) }

    db.collection('leafTestTests').findOne({id: data.id}, function(err, res) {
      if (err) throw err
      if (res) {
        data.test = res.test
        db.collection('leafTestSections').find({testId: data.id}).toArray(function(err, res) {
          if (err) throw err
          if (res.length) {
            const sections = []
            for (let r = 0; r < res.length; r++) {
              sections.push({id: res[r].id, section: res[r].section, questions: []})
            }
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
      }
    })
  },

  createTestInstance: function(db, io, data, debugOn) {

    if (debugOn) { console.log('createTestInstance', data) }

    const correct = {
      questions: 0,
      sections: 0
    }
    db.collection('leafTestTestInstances').insertOne({id: data.id, date: new Date().toISOString(), correct: correct}, function(err, res) {
      if (err) throw err
      if (res) {
        db.collection('leafTestOrganisations').findOne({id: data.organisationId}, function(err, orgRes) {
          if (err) throw err
          if (orgRes) {
            const organisation = {
              id: orgRes.id,
              organisation: orgRes.organisation
            }
            db.collection('leafTestTestInstances').updateOne({id: data.id}, {$set: {organisation: organisation}}, function(err, res) {
              if (err) throw err
              _loadTestInstance(db, io, data.id)
            })
          }
        })
        db.collection('leafTestTests').findOne({id: data.testId}, function(err, testRes) {
          if (err) throw err
          if (testRes) {
            db.collection('leafTestSections').find({testId: testRes.id}).toArray(function(err, res) {
              if (err) throw err
              if (res.length) {
                const sections = []
                for (let r = 0; r < res.length; r++) {
                  sections.push({id: res[r].id, section: res[r].section, questions: []})
                }
                db.collection('leafTestQuestions').find({testId: testRes.id}).toArray(function(err, secRes) {
                  if (err) throw err
                  if (secRes.length) {
                    for (let i = 0; i < secRes.length; i++) {
                      for (let j = 0; j < sections.length; j++) {
                        if (secRes[i].sectionId == sections[j].id) {
                          sections[j].questions.push(secRes[i])
                        }
                      }
                    }
                  }
                  const test = {
                    id: testRes.id,
                    test: testRes.test,
                    sections: sections
                  }
                  db.collection('leafTestTestInstances').updateOne({id: data.id}, {$set: {test: test}}, function(err, res) {
                    if (err) throw err
                    _loadTestInstance(db, io, data.id)
                  })
                })
              }
            })
          }
        })
        db.collection('leafTestStudents').findOne({id: data.studentId}, function(err, studentRes) {
          if (err) throw err
          if (studentRes) {
            const student = {
              id: studentRes.id,
              student: studentRes.student
            }
            db.collection('leafTestTestInstances').updateOne({id: data.id}, {$set: {student: student}}, function(err, res) {
              if (err) throw err
              _loadTestInstance(db, io, data.id)
            })
          }
        })
      }
    })
  },

  deleteTestInstance: function(db, io, data, debugOn) {

    if (debugOn) { console.log('deleteTestInstance', data) }

    db.collection('leafTestTestInstances').deleteOne({id: data.id}, function(err, res) {
      if (err) throw err
      db.collection('leafTestTestInstances').find().toArray(function(err, res) {
        if (err) throw err
        io.emit('loadTestInstances', res)
      })
    })
  },

  setAnswer: function(db, io, data, debugOn) {

    if (debugOn) { console.log('setAnswer', data) }

    db.collection('leafTestTestInstances').findOne({id: data.testInstanceId}, function(err, res) {
      if (err) throw err
      if (res) {
        let correct = {
          sections: 0,
          questions: 0
        }
        const sections = []
        for (let i = 0; i < res.test.sections.length; i++) {
          const questions = []
          const section = res.test.sections[i]
          for (let j = 0; j < section.questions.length; j++) {
            let question = section.questions[j]
            if (question.id == data.questionId) {
              question = questionFuns.answer(question, data.answerId, data.value)
            }
            if (question.correct) {
              correct.questions = correct.questions + 1
            }
            questions.push(question)
          }
          section.questions = questions
          sections.push(section)
        }
        res.test.sections = sections
        db.collection('leafTestTestInstances').updateOne({id: data.testInstanceId}, {$set: {correct: correct, test: res.test}}, function(err, res) {
          if (err) throw err
          _loadTestInstance(db, io, data.testInstanceId)
        })
      }
    })
  },

  loadTestInstances: function(db, io, debugOn) {

    if (debugOn) { console.log('loadTestInstances') }

    db.collection('leafTestTestInstances').find().toArray(function(err, res) {
      if (err) throw err
      if (res.length) {
        io.emit('loadTestInstances', res)
      }
    })
  },

  loadOrganisations: function(db, io, debugOn) {

    if (debugOn) { console.log('loadOrganisations') }
    _loadOrganisations(db, io)
  },

  loadStudents: function(db, io, data, debugOn) {

    if (debugOn) { console.log('loadStudents', data) }
    _loadStudents(db, io, data)
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

  addOrganisation: function(db, io, data, debugOn) {

    if (debugOn) { console.log('addOrganisation', data) }

    db.collection('leafTestOrganisations').insertOne({organisation: data.organisation, id: uuidv4()}, function(err, res) {
      if (err) throw err
      if (res) {
        _loadOrganisations(db, io)
      }
    })
  },

  updateOrganisation: function(db, io, data, debugOn) {

    if (debugOn) { console.log('updateOrganisation', data) }

    db.collection('leafTestOrganisations').findOne({id: data.organisationId}, function(err, res) {
      if (err) throw err
      if (res) {
        res.organisation = data.organisation
        const id = res._id
        delete res._id
        db.collection('leafTestOrganisations').updateOne({'_id': id}, {$set: res}, function(err, res) {
          if (err) throw err
          _loadOrganisations(db, io)
        })
      }
    })
  },

  setOrganisationTest: function(db, io, data, debugOn) {

    if (debugOn) { console.log('setOrganisationTest', data) }

    db.collection('leafTestOrganisations').findOne({id: data.organisationId}, function(err, res) {
      if (err) throw err
      if (res) {
        const tests = res.tests ? res.tests : {}
        tests[data.testId] = {
          test: data.test,
          value: data.value
        }
        db.collection('leafTestOrganisations').updateOne({'_id': res._id}, {$set: {tests: tests}}, function(err, res) {
          if (err) throw err
          _loadOrganisations(db, io)
        })
      }
    })
  },

  deleteOrganisation: function(db, io, data, debugOn) {

    if (debugOn) { console.log('deleteOrganisation', data) }

    db.collection('leafTestOrganisations').deleteOne({id: data.organisationId}, function(err, res) {
      if (err) throw err
      _loadOrganisations(db, io)
    })
  },

  addStudent: function(db, io, data, debugOn) {

    if (debugOn) { console.log('addStudent', data) }

    db.collection('leafTestStudents').insertOne({organisationId: data.organisationId, id: uuidv4(), student: data.student}, function(err, res) {
      if (err) throw err
      _loadStudents(db, io, data)
    })
  },

  updateStudent: function(db, io, data, debugOn) {

    if (debugOn) { console.log('updateStudent', data) }

    db.collection('leafTestStudents').findOne({id: data.studentId}, function(err, res) {
      if (err) throw err
      if (res) {
        res.student = data.student
        const id = res._id
        delete res._id
        db.collection('leafTestStudents').updateOne({'_id': id}, {$set: res}, function(err, res) {
          if (err) throw err
          _loadStudents(db, io, data)
        })
      }
    })
  },

  deleteStudent: function(db, io, data, debugOn) {

    if (debugOn) { console.log('deleteStudent', data) }

    db.collection('leafTestStudents').deleteOne({id: data.studentId}, function(err, res) {
      if (err) throw err
      _loadStudents(db, io, data)
    })
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

  updateSectionQuestionsToShow: function(db, io, data, debugOn) {

    if (debugOn) { console.log('updateSectionQuestionsToShow', data) }

    db.collection('leafTestSections').findOne({id: data.id}, function(err, res) {
      if (err) throw err
      if (res) {
        res.questionsToShow = data.questionsToShow
        const id = res._id
        delete res._id
        db.collection('leafTestSections').updateOne({'_id': id}, {$set: res}, function(err, res) {
          if (err) throw err
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
      _updateSectionQuestions(db, data.sectionId, order)
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
      db.collection('leafTestQuestions').find({testId: data.testId, sectionId: data.sectionId}).toArray(function(err, res) {
        _updateSectionQuestions(db, data.sectionId, res.length)
        _loadQuestions(db, io, data)
      })
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

  saveAnswer: function(db, io, data, debugOn) {

    if (debugOn) { console.log('saveAnswer', data) }

    db.collection('leafTestQuestions').findOne({testId: data.testId, sectionId: data.sectionId, id: data.questionId}, function(err, res) {
      if (err) throw err
      if (res) {
        const answers = []
        for (let i = 0; i < res.answers.length; i++) {
          const answer = res.answers[i]
          if (answer.id == data.id) {
            answer.value = data.value
          }
          answers.push(answer)
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

  makeTrueFalseAnswer: function(db, io, data, debugOn) {

    if (debugOn) { console.log('makeTrueFalseAnswer', data) }

    db.collection('leafTestQuestions').findOne({testId: data.testId, sectionId: data.sectionId, id: data.questionId}, function(err, res) {
      if (err) throw err
      if (res) {
        db.collection('leafTestQuestions').updateOne({'_id': res._id}, {$set: {answer: data.val}}, function(err, res) {
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
        // TODO: Make this one property - single/trueFalse/multiple
        if (data.trueFalse) {
          res.trueFalse = data.trueFalse
          res.multiple = false
        } else {
          res.trueFalse = false
          res.multiple = data.multiple
        }
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
