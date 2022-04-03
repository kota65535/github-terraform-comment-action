
const removeLinesBetween = (lines, beginPattern, endPattern, afterLines) => {
  const remained = []
  let found = false
  let afterLinesCount = 0
  for (const line of lines) {
    if (line.match(beginPattern)) {
      found = true
    }
    if (!found && afterLinesCount === 0) {
      remained.push(line)
    }
    afterLinesCount = Math.max(afterLinesCount - 1, 0)
    if (found && line.match(endPattern)) {
      found = false
      afterLinesCount = afterLines
    }
  }
  return remained
}

const findLinesBetween = (lines, beginPattern, endPattern) => {
  const matched = []
  let found = false
  for (const line of lines) {
    if (found) {
      matched.push(line)
    }
    if (line.match(beginPattern)) {
      matched.push(line)
      found = true
    }
    if (found && line.match(endPattern)) {
      break
    }
  }
  return matched
}

module.exports = {
  findLinesBetween,
  removeLinesBetween
}
