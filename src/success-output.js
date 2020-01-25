export default function (nextSteps) {
  nextSteps.forEach(todo => console.log(`\n\t*\t${todo.summary}`));   // eslint-disable-line no-console
}
