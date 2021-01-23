
function questionType(question) {
  let type
  if (question.trueFalse) {
    type = 'trueFalse'
  } else if (question.multiple) {
    type = 'multiple'
  } else {
    type = 'single'
  }
  return type
}

function singleAnswer(question, answerId) {
  let correct = false
  for (let i = 0; i < question.answers.length; i++) {
    const answer = question.answers[i]
    answer.submittedAnswer = answer.id == answerId
    if (answer.id == answerId && answer.answer) {
      correct = true
    }
  }
  return correct
}

function multipleAnswer(question, values) {
  question.correct = true
  for (let i = 0; i < values.length; i++) {
    const answer = question.answers.find(function(a) {
      return a.id == values[i].id
    })
    answer.submittedAnswer = values[i].value
    if (answer.answer != values[i].value) {
      question.correct = false
    }
  }
  return question
}

module.exports = {

  answer: function(question, answerId, value) {
    switch(questionType(question)) {
      case 'trueFalse':
        question.submittedAnswer = value
        question.correct = question.answer == value
        break
      case 'single':
        question.correct = singleAnswer(question, answerId)
        break
      case 'multiple':
        question = multipleAnswer(question, value)
        break
    }
    return question
  }
}
