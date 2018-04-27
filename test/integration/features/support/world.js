export function World() {
  const answers = {};

  this.setAnswerFor = (questionName, value) => {
    answers[questionName] = value;
  };

  this.getAnswerFor = questionName => answers[questionName];
}
