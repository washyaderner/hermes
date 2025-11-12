import {
  BatchJob,
  BatchPromptItem,
  BatchProcessingResult,
  BatchProcessingMode,
  Platform,
} from "@/types";
import { generateId } from "@/lib/utils";
import { analyzePrompt, countTokens } from "@/lib/prompt-engine/analyzer";

/**
 * Batch Processor Engine
 * Handles queue management, pause/resume, and batch prompt processing
 */
export class BatchProcessor {
  private currentJob: BatchJob | null = null;
  private isPaused: boolean = false;
  private isProcessing: boolean = false;
  private queue: BatchPromptItem[] = [];
  private processingDelay: number = 500; // ms between prompts

  /**
   * Create a new batch job
   */
  createBatchJob(
    jobName: string,
    prompts: BatchPromptItem[],
    platforms: Platform[],
    mode: BatchProcessingMode
  ): BatchJob {
    const job: BatchJob = {
      jobId: generateId(),
      jobName,
      totalPrompts: prompts.length,
      processedCount: 0,
      failedCount: 0,
      mode,
      platforms,
      currentPlatformIndex: 0,
      status: "queued",
      results: [],
      errors: [],
    };

    this.currentJob = job;
    this.queue = [...prompts];
    this.isPaused = false;

    return job;
  }

  /**
   * Start processing the batch job
   */
  async startProcessing(
    onProgress?: (job: BatchJob, currentPrompt: BatchPromptItem) => void,
    onComplete?: (job: BatchJob) => void
  ): Promise<BatchJob> {
    if (!this.currentJob) {
      throw new Error("No batch job created");
    }

    if (this.isProcessing) {
      throw new Error("Already processing a batch job");
    }

    this.isProcessing = true;
    this.currentJob.status = "processing";
    this.currentJob.startedAt = new Date();

    while (this.queue.length > 0 && !this.isPaused) {
      const currentPromptItem = this.queue.shift()!;

      // Callback for progress updates
      if (onProgress) {
        onProgress(this.currentJob, currentPromptItem);
      }

      try {
        // Select platform based on mode
        const platform = this.selectPlatform();

        // Process the prompt
        const result = await this.processPrompt(currentPromptItem, platform);

        this.currentJob.results.push(result);
        this.currentJob.processedCount++;

        // Update platform index for rotation mode
        if (this.currentJob.mode === "rotate-platforms") {
          this.currentJob.currentPlatformIndex =
            (this.currentJob.currentPlatformIndex + 1) %
            this.currentJob.platforms.length;
        }
      } catch (error) {
        console.error(`Failed to process prompt ${currentPromptItem.id}:`, error);
        this.currentJob.errors.push({
          promptId: currentPromptItem.id,
          rowNumber: currentPromptItem.rowNumber,
          error: error instanceof Error ? error.message : "Unknown error",
        });
        this.currentJob.failedCount++;
      }

      // Small delay between requests
      await new Promise((resolve) => setTimeout(resolve, this.processingDelay));
    }

    // Finalize job
    if (this.queue.length === 0 && !this.isPaused) {
      this.currentJob.status = "completed";
      this.currentJob.completedAt = new Date();
      this.isProcessing = false;

      if (onComplete) {
        onComplete(this.currentJob);
      }
    } else if (this.isPaused) {
      this.currentJob.status = "paused";
      this.currentJob.pausedAt = new Date();
      this.isProcessing = false;
    }

    return this.currentJob;
  }

  /**
   * Process a single prompt
   */
  private async processPrompt(
    item: BatchPromptItem,
    platform: Platform
  ): Promise<BatchProcessingResult> {
    const startTime = Date.now();

    // Analyze prompt quality
    const analysis = analyzePrompt(item.originalPrompt);

    // Simulate enhancement (in production, call actual API)
    // For now, we'll create a mock enhanced version
    const enhancedPrompt = await this.simulateEnhancement(
      item.originalPrompt,
      platform
    );

    const processingTimeMs = Date.now() - startTime;

    return {
      id: item.id,
      originalPrompt: item.originalPrompt,
      enhancedPrompt,
      platform,
      qualityScore: analysis.qualityScore,
      tokenCount: countTokens(enhancedPrompt),
      processedAt: new Date(),
      processingTimeMs,
      rowNumber: item.rowNumber,
      variables: item.variables,
    };
  }

  /**
   * Simulate prompt enhancement (replace with actual API call)
   */
  private async simulateEnhancement(
    prompt: string,
    platform: Platform
  ): Promise<string> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Mock enhancement
    return `[Enhanced for ${platform.name}]\n\n${prompt}\n\n[Added platform-specific optimizations and formatting]`;
  }

  /**
   * Select platform based on processing mode
   */
  private selectPlatform(): Platform {
    if (!this.currentJob) {
      throw new Error("No active batch job");
    }

    if (this.currentJob.mode === "single-platform") {
      return this.currentJob.platforms[0];
    } else {
      // rotate-platforms mode
      return this.currentJob.platforms[this.currentJob.currentPlatformIndex];
    }
  }

  /**
   * Pause the current batch job
   */
  pause(): void {
    if (this.isProcessing) {
      this.isPaused = true;
    }
  }

  /**
   * Resume a paused batch job
   */
  async resume(
    onProgress?: (job: BatchJob, currentPrompt: BatchPromptItem) => void,
    onComplete?: (job: BatchJob) => void
  ): Promise<BatchJob> {
    if (!this.currentJob || this.currentJob.status !== "paused") {
      throw new Error("No paused job to resume");
    }

    this.isPaused = false;
    return this.startProcessing(onProgress, onComplete);
  }

  /**
   * Cancel the current batch job
   */
  cancel(): void {
    if (this.currentJob) {
      this.currentJob.status = "failed";
      this.currentJob.completedAt = new Date();
      this.isPaused = false;
      this.isProcessing = false;
      this.queue = [];
    }
  }

  /**
   * Get current job status
   */
  getCurrentJob(): BatchJob | null {
    return this.currentJob;
  }

  /**
   * Get remaining queue size
   */
  getRemainingCount(): number {
    return this.queue.length;
  }

  /**
   * Get processing progress percentage
   */
  getProgress(): number {
    if (!this.currentJob) return 0;
    return Math.round(
      (this.currentJob.processedCount / this.currentJob.totalPrompts) * 100
    );
  }

  /**
   * Export results to CSV format
   */
  exportToCSV(job: BatchJob): string {
    const headers = [
      "Row",
      "Original Prompt",
      "Enhanced Prompt",
      "Platform",
      "Quality Score",
      "Token Count",
      "Processing Time (ms)",
    ];

    // Add variable columns if present
    const variableKeys =
      job.results.length > 0 && job.results[0].variables
        ? Object.keys(job.results[0].variables)
        : [];

    const allHeaders = [...headers, ...variableKeys];

    const csvRows = [allHeaders.join(",")];

    job.results.forEach((result) => {
      const row = [
        result.rowNumber.toString(),
        `"${result.originalPrompt.replace(/"/g, '""')}"`,
        `"${result.enhancedPrompt.replace(/"/g, '""')}"`,
        result.platform.name,
        result.qualityScore.toString(),
        result.tokenCount.toString(),
        result.processingTimeMs.toString(),
      ];

      // Add variable values
      variableKeys.forEach((key) => {
        const value = result.variables?.[key] || "";
        row.push(`"${value.replace(/"/g, '""')}"`);
      });

      csvRows.push(row.join(","));
    });

    return csvRows.join("\n");
  }

  /**
   * Export results to JSON format
   */
  exportToJSON(job: BatchJob): string {
    const exportData = {
      jobId: job.jobId,
      jobName: job.jobName,
      totalPrompts: job.totalPrompts,
      processedCount: job.processedCount,
      failedCount: job.failedCount,
      status: job.status,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
      results: job.results.map((result) => ({
        rowNumber: result.rowNumber,
        originalPrompt: result.originalPrompt,
        enhancedPrompt: result.enhancedPrompt,
        platform: result.platform.name,
        qualityScore: result.qualityScore,
        tokenCount: result.tokenCount,
        processingTimeMs: result.processingTimeMs,
        variables: result.variables,
      })),
      errors: job.errors,
    };

    return JSON.stringify(exportData, null, 2);
  }
}
