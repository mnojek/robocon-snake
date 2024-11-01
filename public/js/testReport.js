export let testReport = "";
export const testCases = [];

export function initiateTestReport() {
  testReport = "> robot tests/snake.robot\n";
}

export function addTestSuiteTitle(title) {
  const consoleWidth = 60;
  const doubleLine = "=".repeat(consoleWidth);

  testReport += `${doubleLine}\n${title}\n${doubleLine}\n`;
}

export function addTestResult(testName, testStatus) {
  testReport += `${testName.padEnd(52, " ")}| ${testStatus} |\n`;
}

export function addCurrentTest(testName) {
  testReport += `${testName.padEnd(52, " ")}| `;
}

export function updateTestResult(testStatus) {
  testReport += `${testStatus} |\n`;
}

export function addSingleLineToTestReport() {
  const consoleWidth = 60;
  const singleLine = "-".repeat(consoleWidth);
  testReport += `${singleLine}\n`;
}

export function summarizeTestReport(suiteName) {
  const consoleWidth = 60;
  const singleLine = "-".repeat(consoleWidth);
  const doubleLine = "=".repeat(consoleWidth);

  let totalTests = testCases.length;
  let passedTests = testCases.filter((t) => t.status === "PASS").length;
  let failedTests = testCases.filter((t) => t.status === "FAIL").length;
  let skippedTests = testCases.filter((t) => t.status === "SKIP").length;
  let suiteStatus = failedTests > 0 ? "FAIL" : "PASS";

  // Display all SKIP tests before the summary
  testCases
    .filter((t) => t.status === "SKIP")
    .forEach((t) => {
      testReport += `${singleLine}\n${t.name.padEnd(52, " ")}| ${t.status} |\n`;
    });

  // Set suite status based on failed tests
  testReport += doubleLine + "\n";
  testReport += `${suiteName.padEnd(52, " ")}| ${suiteStatus} |\n`;
  testReport += `${totalTests} tests, ${passedTests} passed, ${failedTests} failed, ${skippedTests} skipped\n`;
  testReport += doubleLine + "\n";
  testReport += "Output:  /Users/robocon2025/game/output.xml\n";
  testReport += "Log:     /Users/robocon2025/game/log.html\n";
  testReport += "Report:  /Users/robocon2025/game/report.html\n";
  testReport += "\n>";
}
