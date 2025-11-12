export interface StreamChunk {
  content: string;
  timestamp: Date;
  isComplete: boolean;
}

export class StreamingResponseHandler {
  private chunks: StreamChunk[] = [];
  private fullText: string = '';
  private startTime: Date;
  private endTime: Date | null = null;

  constructor() {
    this.startTime = new Date();
  }

  handleChunk(content: string): StreamChunk {
    const chunk: StreamChunk = {
      content,
      timestamp: new Date(),
      isComplete: false,
    };

    this.chunks.push(chunk);
    this.fullText += content;

    return chunk;
  }

  handleComplete(): StreamChunk {
    this.endTime = new Date();
    
    const completeChunk: StreamChunk = {
      content: this.fullText,
      timestamp: new Date(),
      isComplete: true,
    };

    return completeChunk;
  }

  handleError(error: Error): void {
    this.endTime = new Date();
    console.error('Streaming error:', error);
  }

  getFullText(): string {
    return this.fullText;
  }

  getDuration(): number {
    const end = this.endTime || new Date();
    return end.getTime() - this.startTime.getTime();
  }

  getTokensPerSecond(tokenCount: number): number {
    const durationSeconds = this.getDuration() / 1000;
    return durationSeconds > 0 ? tokenCount / durationSeconds : 0;
  }

  reset(): void {
    this.chunks = [];
    this.fullText = '';
    this.startTime = new Date();
    this.endTime = null;
  }

  /**
   * Create a Server-Sent Events stream
   */
  static createSSEStream(
    readableStream: ReadableStream<string>
  ): ReadableStream<Uint8Array> {
    const encoder = new TextEncoder();

    return new ReadableStream({
      async start(controller) {
        const reader = readableStream.getReader();

        try {
          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              controller.enqueue(encoder.encode('data: [DONE]\n\n'));
              controller.close();
              break;
            }

            const data = JSON.stringify({ content: value });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }
        } catch (error) {
          controller.error(error);
        }
      },
    });
  }

  /**
   * Parse SSE stream from fetch response
   */
  static async* parseSSEStream(response: Response): AsyncGenerator<string> {
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;

          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              yield parsed.content;
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }
  }
}
