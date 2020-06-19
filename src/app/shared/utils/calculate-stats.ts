import {
  constants
} from "src/app/app.constants";

export class Stats {

  responses;
  constants = constants;
  answerMap;

  constructor(responses) {
    this.responses = responses;
    this.getResponseForQuestions();
  }

  getAnswerMap() {
    return this.answerMap;
  }

  getResponseForQuestions() {
    this.answerMap = {};

    const insertAnswer = (answerIndex, answer, question) => {
      let key = answer;
      if ([constants.answerTypes.text, constants.answerTypes.email].includes(question.type)) {
        key = answer ? 'filled' : 'unfilled';
      }
      if (answerIndex in question && key in question[answerIndex]) {
        return question[answerIndex][key] += 1;
      }
      question[answerIndex] = {
        ...question[answerIndex],
        [key]: 1
      }
    }

    for (const response of this.responses) {
      for (let questionIndex = 0; questionIndex < response.questions.length; questionIndex++) {
        const question = response.questions[questionIndex]; // actual question from response
        let _question = this.answerMap[questionIndex]; // map entry
        if (!_question) {
          this.answerMap[questionIndex] = {
            otherAnswer: question.otherAnswer,
            type: question.answerType,
            options: question.answers.length || 1,
            responses: 0
          };
          _question = this.answerMap[questionIndex];
        }
        if (question.answers.length) {
          for (let answerIndex = 0; answerIndex < question.answers.length; answerIndex++) {
            const answerObj = question.answers[answerIndex];
            insertAnswer(answerIndex, answerObj.answer, _question);
          }
        } else {
          const answerIndex = 0;
          insertAnswer(answerIndex, question.answer, _question);
        }
        _question.responses++;
      }
    }

    for (const questionIndex of Object.keys(this.answerMap)) {
      const question = this.answerMap[questionIndex];
      for (let optionIndex = 0; optionIndex < question.options; optionIndex++) {
        let response = 0;
        for (const option of Object.keys(question[optionIndex])) {
          const optionResponses = question[optionIndex][option];
          const answerPercentage = (optionResponses / question.responses) * 100;
          const answerWeight = this.getWeightFunctionForAnswer(question.type)(option);
          response += answerPercentage * answerWeight;
          question[optionIndex]['response'] = (response / 100).toFixed(1);
        }
      }
    }

  }

  getWeightFunctionForAnswer(questionType): Function {
    switch (questionType) {

      case constants.answerTypes.binary:
        return this.getWeightForBinary;

      case constants.answerTypes.checkbox:
      case constants.answerTypes.radioButton:
        return this.getWeightForCheckboxOrRadio;

      case constants.answerTypes.radioButton:
        return this.getWeightForCheckboxOrRadio;

      case constants.answerTypes.yesNoMaybe:
        return this.getWeightForYNM;

      case constants.answerTypes.smiley:
        return this.getWeightForSmiley;

      case constants.answerTypes.slider:
      case constants.answerTypes.value:
        return this.getWeightFromValue;

      case constants.answerTypes.dropdown:
        return this.getWeightForDropdown;

      case constants.answerTypes.text:
      case constants.answerTypes.email:
        return this.getWeightForText;

      default:
        return this.getWeightForRating;
    }
  }

  getWeightForDropdown(value): Number {
    return +value * 10;
  }

  getWeightForRating(rating): Number {
    switch (+rating) {
      case 5:
        return 100;
      case 4:
        return 75;
      case 3:
        return 50;
      case 2:
        return 25;
      default:
        return 0;
    }
  }

  getWeightForBinary(answer): Number {
    return answer === 'yes' ? 100 : 0;
  }

  getWeightForCheckboxOrRadio(checked): Number {
    return checked === 'true' ? 100 : 0;
  }

  getWeightFromValue(value): Number {
    return +value;
  }

  getWeightForYNM(answer): Number {
    return answer === 'yes' ? 100 : (answer === 'maybe' ? 50 : 0);
  }

  getWeightForSmiley(answer): Number {
    return answer === 'happy' ? 100 : (answer === 'medium' ? 50 : 0);
  }

  getWeightForText(answer): Number {
    return answer ? 100 : 0;
  }
}
