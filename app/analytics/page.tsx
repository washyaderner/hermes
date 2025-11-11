"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useHermesStore } from "@/lib/store";
import { generateAnalyticsReport } from "@/lib/analytics/engine";
import { AnalyticsReport } from "@/types";
import { DailyPromptsChart } from "@/components/analytics/DailyPromptsChart";
import { PlatformPieChart } from "@/components/analytics/PlatformPieChart";
import { SuccessRateChart } from "@/components/analytics/SuccessRateChart";
import { TokenUsageChart } from "@/components/analytics/TokenUsageChart";
import { QualityImprovementChart } from "@/components/analytics/QualityImprovementChart";
import { InsightsPanel } from "@/components/analytics/InsightsPanel";
import { Download, ArrowLeft, RefreshCw, FileText, Printer } from "lucide-react";
import { useRouter } from "next/navigation";
import { platforms as PLATFORMS } from "@/lib/prompt-engine/platforms";
import { downloadTextReport, printHTMLReport } from "@/lib/analytics/pdf-export";

export default function AnalyticsPage() {
  const router = useRouter();
  const { promptHistory, promptHistoryItems } = useHermesStore();
  const [report, setReport] = useState<AnalyticsReport | null>(null);
  const [periodDays, setPeriodDays] = useState<number>(30);
  const [isLoading, setIsLoading] = useState(false);

  // Generate report on mount and when period changes
  useEffect(() => {
    generateReport();
  }, [periodDays, promptHistory, promptHistoryItems]);

  const generateReport = () => {
    setIsLoading(true);
    try {
      const newReport = generateAnalyticsReport(
        promptHistory,
        promptHistoryItems,
        PLATFORMS,
        periodDays
      );
      setReport(newReport);
    } catch (error) {
      console.error("Failed to generate analytics report:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportJSON = () => {
    if (!report) return;

    const json = JSON.stringify(report, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `hermes-analytics-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!report) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Loading Analytics...</CardTitle>
              <CardDescription>Calculating your analytics data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const hasData = report.metrics.totalPrompts > 0;

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-muted-foreground">
              Insights from {report.periodStart.toLocaleDateString()} to{" "}
              {report.periodEnd.toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={periodDays.toString()}
            onChange={(e) => setPeriodDays(parseInt(e.target.value))}
            className="w-[180px]"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="60">Last 60 days</option>
            <option value="90">Last 90 days</option>
          </Select>

          <Button variant="outline" onClick={generateReport} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button onClick={handleExportJSON} disabled={!hasData} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            JSON
          </Button>

          <Button onClick={() => report && downloadTextReport(report)} disabled={!hasData} variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Text
          </Button>

          <Button onClick={() => report && printHTMLReport(report)} disabled={!hasData}>
            <Printer className="h-4 w-4 mr-2" />
            Print/PDF
          </Button>
        </div>
      </div>

      {!hasData ? (
        <Card>
          <CardHeader>
            <CardTitle>No Data Available</CardTitle>
            <CardDescription>
              Start creating and enhancing prompts to see analytics data here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Key Metrics Overview */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Prompts</CardTitle>
                <Badge variant="outline">📝</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{report.metrics.totalPrompts}</div>
                <p className="text-xs text-muted-foreground">
                  {report.metrics.totalEnhancements} enhancements
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Quality</CardTitle>
                <Badge variant="outline">⭐</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {report.metrics.avgQualityImprovement.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">improvement per prompt</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Time Saved</CardTitle>
                <Badge variant="outline">⏱️</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(report.metrics.timeSaved / 60).toFixed(1)} hrs
                </div>
                <p className="text-xs text-muted-foreground">
                  ~{report.metrics.timeSaved.toFixed(0)} minutes total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <Badge variant="outline">✅</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(report.metrics.successRate * 100).toFixed(0)}%
                </div>
                <p className="text-xs text-muted-foreground">prompts marked as favorites</p>
              </CardContent>
            </Card>
          </div>

          {/* Insights Panel */}
          <InsightsPanel insights={report.insights} />

          {/* Charts Row 1 */}
          <div className="grid gap-6 md:grid-cols-2">
            <DailyPromptsChart dailyMetrics={report.dailyMetrics} />
            <TokenUsageChart dailyMetrics={report.dailyMetrics} />
          </div>

          {/* Charts Row 2 */}
          <div className="grid gap-6 md:grid-cols-2">
            <PlatformPieChart platformStats={report.platformStats} />
            <SuccessRateChart platformStats={report.platformStats} />
          </div>

          {/* Quality Improvement Chart */}
          <QualityImprovementChart dailyMetrics={report.dailyMetrics} />

          {/* Top Prompts */}
          {report.topPrompts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Prompts</CardTitle>
                <CardDescription>Highest quality prompts from this period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {report.topPrompts.map((prompt, index) => (
                    <div
                      key={prompt.id}
                      className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-shrink-0">
                        <Badge variant="secondary" className="text-lg font-bold">
                          #{index + 1}
                        </Badge>
                      </div>
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{prompt.platform.name}</Badge>
                          <Badge variant="outline">Score: {prompt.qualityScore}/100</Badge>
                          <Badge variant="outline">{prompt.tokenCount} tokens</Badge>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Original: </span>
                          <span className="text-muted-foreground">{prompt.original}</span>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Enhanced: </span>
                          <span className="text-muted-foreground">{prompt.enhanced}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
