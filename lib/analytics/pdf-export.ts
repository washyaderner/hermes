import { AnalyticsReport } from "@/types";

/**
 * Generate a formatted text report for PDF export
 */
export function generateTextReport(report: AnalyticsReport): string {
  const lines: string[] = [];

  // Header
  lines.push("═══════════════════════════════════════════════════════════");
  lines.push("           HERMES ANALYTICS REPORT");
  lines.push("═══════════════════════════════════════════════════════════");
  lines.push("");
  lines.push(`Generated: ${report.generatedAt.toLocaleString()}`);
  lines.push(`Period: ${report.periodStart.toLocaleDateString()} - ${report.periodEnd.toLocaleDateString()}`);
  lines.push("");

  // Key Metrics
  lines.push("───────────────────────────────────────────────────────────");
  lines.push("KEY METRICS");
  lines.push("───────────────────────────────────────────────────────────");
  lines.push("");
  lines.push(`Total Prompts: ${report.metrics.totalPrompts}`);
  lines.push(`Total Enhancements: ${report.metrics.totalEnhancements}`);
  lines.push(`Average Quality Improvement: ${report.metrics.avgQualityImprovement.toFixed(1)}%`);
  lines.push(`Total Tokens Processed: ${report.metrics.totalTokensProcessed.toLocaleString()}`);
  lines.push(`Average Tokens per Prompt: ${Math.round(report.metrics.avgTokensPerPrompt)}`);
  lines.push(`Time Saved: ${(report.metrics.timeSaved / 60).toFixed(1)} hours (${report.metrics.timeSaved.toFixed(0)} minutes)`);
  lines.push(`Success Rate: ${(report.metrics.successRate * 100).toFixed(1)}%`);
  if (report.metrics.mostUsedPlatform) {
    lines.push(`Most Used Platform: ${report.metrics.mostUsedPlatform.name}`);
  }
  if (report.metrics.mostSuccessfulPattern) {
    lines.push(`Most Successful Pattern: ${report.metrics.mostSuccessfulPattern}`);
  }
  lines.push("");

  // Insights
  lines.push("───────────────────────────────────────────────────────────");
  lines.push("INSIGHTS");
  lines.push("───────────────────────────────────────────────────────────");
  lines.push("");
  report.insights.forEach((insight) => {
    lines.push(`${insight.icon} ${insight.title}`);
    lines.push(`   ${insight.description}`);
    lines.push(`   Value: ${insight.value} | Trend: ${insight.trend.toUpperCase()} | Category: ${insight.category}`);
    lines.push("");
  });

  // Platform Statistics
  if (report.platformStats.length > 0) {
    lines.push("───────────────────────────────────────────────────────────");
    lines.push("PLATFORM USAGE STATISTICS");
    lines.push("───────────────────────────────────────────────────────────");
    lines.push("");

    // Sort by usage count
    const sortedStats = [...report.platformStats].sort((a, b) => b.usageCount - a.usageCount);

    sortedStats.forEach((stat, index) => {
      lines.push(`${index + 1}. ${stat.platformName}`);
      lines.push(`   Usage Count: ${stat.usageCount} (${stat.percentage.toFixed(1)}%)`);
      lines.push(`   Success Rate: ${(stat.successRate * 100).toFixed(1)}%`);
      lines.push(`   Avg Quality Score: ${stat.avgQualityScore.toFixed(1)}`);
      lines.push(`   Total Tokens: ${stat.totalTokens.toLocaleString()}`);
      lines.push("");
    });
  }

  // Daily Activity Summary
  if (report.dailyMetrics.length > 0) {
    lines.push("───────────────────────────────────────────────────────────");
    lines.push("DAILY ACTIVITY SUMMARY");
    lines.push("───────────────────────────────────────────────────────────");
    lines.push("");

    const totalPrompts = report.dailyMetrics.reduce((sum, d) => sum + d.promptCount, 0);
    const totalSuccess = report.dailyMetrics.reduce((sum, d) => sum + d.successCount, 0);
    const avgPromptsPerDay = totalPrompts / report.dailyMetrics.length;

    lines.push(`Total Days Analyzed: ${report.dailyMetrics.length}`);
    lines.push(`Total Prompts Created: ${totalPrompts}`);
    lines.push(`Average Prompts per Day: ${avgPromptsPerDay.toFixed(1)}`);
    lines.push(`Total Successful Prompts: ${totalSuccess}`);
    lines.push("");

    // Show top 5 most active days
    const topDays = [...report.dailyMetrics]
      .sort((a, b) => b.promptCount - a.promptCount)
      .slice(0, 5);

    lines.push("Most Active Days:");
    topDays.forEach((day, index) => {
      lines.push(`   ${index + 1}. ${day.date.toLocaleDateString()}: ${day.promptCount} prompts`);
    });
    lines.push("");
  }

  // Top Prompts
  if (report.topPrompts.length > 0) {
    lines.push("───────────────────────────────────────────────────────────");
    lines.push("TOP PERFORMING PROMPTS");
    lines.push("───────────────────────────────────────────────────────────");
    lines.push("");

    report.topPrompts.forEach((prompt, index) => {
      lines.push(`${index + 1}. Quality Score: ${prompt.qualityScore}/100`);
      lines.push(`   Platform: ${prompt.platform.name}`);
      lines.push(`   Tokens: ${prompt.tokenCount}`);
      lines.push(`   Original: ${prompt.original.substring(0, 100)}${prompt.original.length > 100 ? "..." : ""}`);
      lines.push(`   Enhanced: ${prompt.enhanced.substring(0, 100)}${prompt.enhanced.length > 100 ? "..." : ""}`);
      if (prompt.improvements.length > 0) {
        lines.push(`   Improvements:`);
        prompt.improvements.forEach((imp) => {
          lines.push(`      - ${imp}`);
        });
      }
      lines.push("");
    });
  }

  // Footer
  lines.push("═══════════════════════════════════════════════════════════");
  lines.push("           End of Report");
  lines.push("═══════════════════════════════════════════════════════════");

  return lines.join("\n");
}

/**
 * Generate HTML version for printing/PDF
 */
export function generateHTMLReport(report: AnalyticsReport): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hermes Analytics Report - ${report.generatedAt.toLocaleDateString()}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
      background: #fff;
    }

    .header {
      text-align: center;
      border-bottom: 4px solid #4f46e5;
      padding-bottom: 20px;
      margin-bottom: 40px;
    }

    .header h1 {
      font-size: 32px;
      color: #4f46e5;
      margin-bottom: 10px;
    }

    .header .subtitle {
      color: #666;
      font-size: 14px;
    }

    .section {
      margin-bottom: 40px;
      page-break-inside: avoid;
    }

    .section-title {
      font-size: 24px;
      color: #4f46e5;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .metric-card {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-left: 4px solid #4f46e5;
      padding: 20px;
      border-radius: 4px;
    }

    .metric-label {
      font-size: 12px;
      text-transform: uppercase;
      color: #666;
      margin-bottom: 8px;
      font-weight: 600;
    }

    .metric-value {
      font-size: 28px;
      font-weight: bold;
      color: #4f46e5;
      margin-bottom: 4px;
    }

    .metric-subtext {
      font-size: 13px;
      color: #888;
    }

    .insight-card {
      background: #fefce8;
      border-left: 4px solid #facc15;
      padding: 15px;
      margin-bottom: 15px;
      border-radius: 4px;
    }

    .insight-card h4 {
      color: #854d0e;
      margin-bottom: 5px;
      font-size: 16px;
    }

    .insight-card p {
      color: #713f12;
      font-size: 14px;
    }

    .platform-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
    }

    .platform-table th,
    .platform-table td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }

    .platform-table th {
      background: #f9fafb;
      font-weight: 600;
      color: #4f46e5;
    }

    .platform-table tr:hover {
      background: #f9fafb;
    }

    .prompt-card {
      background: #fff;
      border: 1px solid #e5e7eb;
      padding: 20px;
      margin-bottom: 20px;
      border-radius: 4px;
    }

    .prompt-card .badge {
      display: inline-block;
      padding: 4px 12px;
      background: #4f46e5;
      color: white;
      border-radius: 12px;
      font-size: 12px;
      margin-right: 8px;
      margin-bottom: 8px;
    }

    .prompt-text {
      margin-top: 10px;
      padding: 12px;
      background: #f9fafb;
      border-left: 3px solid #4f46e5;
      font-size: 13px;
      line-height: 1.5;
    }

    @media print {
      body {
        padding: 20px;
      }

      .section {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>⚡ Hermes Analytics Report</h1>
    <p class="subtitle">Generated: ${report.generatedAt.toLocaleString()}</p>
    <p class="subtitle">Period: ${report.periodStart.toLocaleDateString()} - ${report.periodEnd.toLocaleDateString()}</p>
  </div>

  <div class="section">
    <h2 class="section-title">Key Metrics</h2>
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-label">Total Prompts</div>
        <div class="metric-value">${report.metrics.totalPrompts}</div>
        <div class="metric-subtext">${report.metrics.totalEnhancements} enhancements</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Avg Quality Improvement</div>
        <div class="metric-value">${report.metrics.avgQualityImprovement.toFixed(1)}%</div>
        <div class="metric-subtext">improvement per prompt</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Time Saved</div>
        <div class="metric-value">${(report.metrics.timeSaved / 60).toFixed(1)} hrs</div>
        <div class="metric-subtext">${report.metrics.timeSaved.toFixed(0)} minutes total</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Success Rate</div>
        <div class="metric-value">${(report.metrics.successRate * 100).toFixed(1)}%</div>
        <div class="metric-subtext">prompts marked as favorites</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2 class="section-title">Insights</h2>
    ${report.insights.map((insight) => `
      <div class="insight-card">
        <h4>${insight.icon} ${insight.title}</h4>
        <p>${insight.description}</p>
      </div>
    `).join("")}
  </div>

  ${report.platformStats.length > 0 ? `
  <div class="section">
    <h2 class="section-title">Platform Usage Statistics</h2>
    <table class="platform-table">
      <thead>
        <tr>
          <th>Platform</th>
          <th>Usage Count</th>
          <th>Percentage</th>
          <th>Success Rate</th>
          <th>Avg Quality</th>
        </tr>
      </thead>
      <tbody>
        ${report.platformStats
          .sort((a, b) => b.usageCount - a.usageCount)
          .map((stat) => `
            <tr>
              <td><strong>${stat.platformName}</strong></td>
              <td>${stat.usageCount}</td>
              <td>${stat.percentage.toFixed(1)}%</td>
              <td>${(stat.successRate * 100).toFixed(1)}%</td>
              <td>${stat.avgQualityScore.toFixed(1)}</td>
            </tr>
          `).join("")}
      </tbody>
    </table>
  </div>
  ` : ""}

  ${report.topPrompts.length > 0 ? `
  <div class="section">
    <h2 class="section-title">Top Performing Prompts</h2>
    ${report.topPrompts.map((prompt, index) => `
      <div class="prompt-card">
        <div>
          <span class="badge">#${index + 1}</span>
          <span class="badge">${prompt.platform.name}</span>
          <span class="badge">Score: ${prompt.qualityScore}/100</span>
          <span class="badge">${prompt.tokenCount} tokens</span>
        </div>
        <div class="prompt-text">
          <strong>Original:</strong><br>${prompt.original}
        </div>
        <div class="prompt-text">
          <strong>Enhanced:</strong><br>${prompt.enhanced}
        </div>
      </div>
    `).join("")}
  </div>
  ` : ""}

  <div class="header" style="border-top: 4px solid #4f46e5; border-bottom: none; margin-top: 40px; padding-top: 20px;">
    <p class="subtitle">End of Report</p>
  </div>
</body>
</html>
  `;
}

/**
 * Download report as text file
 */
export function downloadTextReport(report: AnalyticsReport): void {
  const text = generateTextReport(report);
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `hermes-analytics-${report.generatedAt.toISOString().split("T")[0]}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Print HTML report (opens in new window for printing/saving as PDF)
 */
export function printHTMLReport(report: AnalyticsReport): void {
  const html = generateHTMLReport(report);
  const printWindow = window.open("", "_blank");

  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();

    // Wait for content to load, then trigger print dialog
    printWindow.onload = () => {
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    };
  }
}
