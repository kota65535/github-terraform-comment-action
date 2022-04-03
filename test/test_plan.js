const plan = require("../src/plan");
const fs = require("fs");


it("basic test", async () => {
  const file = fs.readFileSync(".github/plan3.stdout", 'utf-8')
  plan(file, ["action"])

});

