export const testReport = {
  content: "",
  testCases: [],

  initiate() {
    return new Promise((resolve) => {
      const text = "> robot tests/snake.robot\n";
      this.content = "";
      let index = 0;
      const interval = 50; // milliseconds per character

      const typeWriter = () => {
        if (index < text.length) {
          this.content += text.charAt(index);
          index++;
          this.draw();
          setTimeout(typeWriter, interval);
        } else {
          resolve();
        }
      };

      typeWriter();
    });
  },

  clear() {
    this.content = "";
    this.testCases = [];
    this.draw();
  },

  addTestSuiteTitle(title) {
    const consoleWidth = 60;
    const doubleLine = "=".repeat(consoleWidth);

    this.content += `${doubleLine}\n${title}\n${doubleLine}\n`;
  },

  addCurrentTest(testName) {
    this.content += `${testName.padEnd(52, " ")}| `;
  },

  updateTestResult(testStatus) {
    this.content += `${testStatus} |\n`;
  },

  addSingleLineToTestReport() {
    const consoleWidth = 60;
    const singleLine = "-".repeat(consoleWidth);
    this.content += `${singleLine}\n`;
  },

  summarizeTestReport(suiteName) {
    const consoleWidth = 60;
    const singleLine = "-".repeat(consoleWidth);
    const doubleLine = "=".repeat(consoleWidth);

    let totalTests = this.testCases.length;
    let passedTests = this.testCases.filter((t) => t.status === "PASS").length;
    let failedTests = this.testCases.filter((t) => t.status === "FAIL").length;
    let skippedTests = this.testCases.filter((t) => t.status === "SKIP").length;
    let suiteStatus = failedTests > 0 ? "FAIL" : "PASS";

    // Display all SKIP tests before the summary
    this.testCases
      .filter((t) => t.status === "SKIP")
      .forEach((t) => {
        this.content += `${singleLine}\n${t.name.padEnd(52, " ")}| ${
          t.status
        } |\n`;
      });

    // Set suite status based on failed tests
    this.content += doubleLine + "\n";
    this.content += `${suiteName.padEnd(52, " ")}| ${suiteStatus} |\n`;
    this.content += `${totalTests} tests, ${passedTests} passed, ${failedTests} failed, ${skippedTests} skipped\n`;
    this.content += doubleLine + "\n";
    this.content += "Output:  /Users/robocon2025/game/output.xml\n";
    this.content += "Log:     /Users/robocon2025/game/log.html\n";
    this.content += "Report:  /Users/robocon2025/game/report.html\n";
    this.content += "\n>";
  },

  draw() {
    const testReportContainer = document.getElementById("test-report");
    testReportContainer.innerHTML = ""; // Clear previous content

    // Create a preformatted text element to display the lines
    const pre = document.createElement("pre");
    pre.innerHTML = testReport.content
      .replace(/PASS/g, '<span style="color: green;">PASS</span>')
      .replace(/FAIL/g, '<span style="color: red;">FAIL</span>')
      .replace(/SKIP/g, '<span style="color: yellow;">SKIP</span>');
    testReportContainer.appendChild(pre);
  },
};
