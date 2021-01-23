
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
    if (answer.id == answerId && answer.answer) {
      correct = true
    }
  }
  return correct
}

function multipleAnswer(question, values) {
  let correct = true
  for (let i = 0; i < values.length; i++) {
    const answer = question.answers.find(function(a) {
      return a.id == values[i].id
    })
    if (answer.answer != values[i].value) {
      correct = false
    }
  }
  return correct
}

module.exports = {

  answer: function(question, answerId, value) {
    switch(questionType(question)) {
      case 'trueFalse':
        question.correct = question.answer == value
        break
      case 'single':
        question.correct = singleAnswer(question, answerId)
        break
      case 'multiple':
        question.correct = multipleAnswer(question, value)
        break
    }
    return question
  }
}
