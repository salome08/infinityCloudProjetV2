const sleep = require("system-sleep");
const numberOne = async (tab) => {
  console.log('two')
  await sleep(2000);
  console.log('you')
  tab.push('hello')
  return tab

}

const start = async () => {
  console.log('start')
  let tab = []
  tab = await numberOne(tab)
  console.log('tab', tab)
}

start();