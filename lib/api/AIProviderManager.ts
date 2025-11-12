import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import Groq from 'groq-sdk';

export type AIProvider = 'openai' | 'anthropic' | 'groq' | 'together';

export interface AIProviderConfig {
  provider: AIProvider;
  apiKey: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface StreamingOptions {
  onToken?: (token: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: Error) => void;
  signal?: AbortSignal;
}

export class AIProviderManager {
  private openaiClient: OpenAI | null = null;
  private anthropicClient: Anthropic | null = null;
  private groqClient: Groq | null = null;

  constructor() {
    this.initializeClients();
  }

  private initializeClients() {
    // Initialize OpenAI
    if (process.env.OPENAI_API_KEY) {
      this.openaiClient = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }

    // Initialize Anthropic
    if (process.env.ANTHROPIC_API_KEY) {
      this.anthropicClient = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
    }

    // Initialize Groq
    if (process.env.GROQ_API_KEY) {
      this.groqClient = new Groq({
        apiKey: process.env.GROQ_API_KEY,
      });
    }
  }

  /**
   * Generate enhanced prompt with streaming
   */
  async generateWithStreaming(
    prompt: string,
    config: AIProviderConfig,
    options: StreamingOptions = {}
  ): Promise<string> {
    const { provider, model, maxTokens = 2000, temperature = 0.7 } = config;

    try {
      switch (provider) {
        case 'openai':
          return await this.streamOpenAI(prompt, model || 'gpt-4', maxTokens, temperature, options);
        
        case 'anthropic':
          return await this.streamAnthropic(prompt, model || 'claude-3-sonnet-20240229', maxTokens, temperature, options);
        
        case 'groq':
          return await this.streamGroq(prompt, model || 'mixtral-8x7b-32768', maxTokens, temperature, options);
        
        case 'together':
          return await this.streamTogether(prompt, model || 'mistralai/Mixtral-8x7B-Instruct-v0.1', maxTokens, temperature, options);
        
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }
    } catch (error) {
      if (options.onError) {
        options.onError(error as Error);
      }
      throw error;
    }
  }

  /**
   * Stream from OpenAI
   */
  private async streamOpenAI(
    prompt: string,
    model: string,
    maxTokens: number,
    temperature: number,
    options: StreamingOptions
  ): Promise<string> {
    if (!this.openaiClient) {
      throw new Error('OpenAI client not initialized. Check API key.');
    }

    const stream = await this.openaiClient.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
      temperature,
      stream: true,
    }, {
      signal: options.signal,
    });

    let fullText = '';

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullText += content;
        if (options.onToken) {
          options.onToken(content);
        }
      }
    }

    if (options.onComplete) {
      options.onComplete(fullText);
    }

    return fullText;
  }

  /**
   * Stream from Anthropic Claude
   */
  private async streamAnthropic(
    prompt: string,
    model: string,
    maxTokens: number,
    temperature: number,
    options: StreamingOptions
  ): Promise<string> {
    if (!this.anthropicClient) {
      throw new Error('Anthropic client not initialized. Check API key.');
    }

    const stream = await this.anthropicClient.messages.stream({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
      temperature,
    });

    let fullText = '';

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        const content = chunk.delta.text;
        fullText += content;
        if (options.onToken) {
          options.onToken(content);
        }
      }
    }

    if (options.onComplete) {
      options.onComplete(fullText);
    }

    return fullText;
  }

  /**
   * Stream from Groq (fast inference)
   */
  private async streamGroq(
    prompt: string,
    model: string,
    maxTokens: number,
    temperature: number,
    options: StreamingOptions
  ): Promise<string> {
    if (!this.groqClient) {
      throw new Error('Groq client not initialized. Check API key.');
    }

    const stream = await this.groqClient.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
      temperature,
      stream: true,
    });

    let fullText = '';

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullText += content;
        if (options.onToken) {
          options.onToken(content);
        }
      }
    }

    if (options.onComplete) {
      options.onComplete(fullText);
    }

    return fullText;
  }

  /**
   * Stream from Together AI
   */
  private async streamTogether(
    prompt: string,
    model: string,
    maxTokens: number,
    temperature: number,
    options: StreamingOptions
  ): Promise<string> {
    const apiKey = process.env.TOGETHER_API_KEY;
    if (!apiKey) {
      throw new Error('Together AI API key not found.');
    }

    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens,
        temperature,
        stream: true,
      }),
      signal: options.signal,
    });

    if (!response.ok) {
      throw new Error(`Together AI API error: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get response stream reader');
    }

    const decoder = new TextDecoder();
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim());

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices[0]?.delta?.content || '';
            if (content) {
              fullText += content;
              if (options.onToken) {
                options.onToken(content);
              }
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }

    if (options.onComplete) {
      options.onComplete(fullText);
    }

    return fullText;
  }

  /**
   * Test connection to a provider
   */
  async testConnection(provider: AIProvider): Promise<boolean> {
    try {
      const testPrompt = 'Say "OK" if you can hear me.';
      const config: AIProviderConfig = {
        provider,
        apiKey: '', // Will use env var
        maxTokens: 10,
        temperature: 0,
      };

      await this.generateWithStreaming(testPrompt, config);
      return true;
    } catch (error) {
      console.error(`Connection test failed for ${provider}:`, error);
      return false;
    }
  }

  /**
   * Get available providers (based on API keys)
   */
  getAvailableProviders(): AIProvider[] {
    const providers: AIProvider[] = [];

    if (this.openaiClient) providers.push('openai');
    if (this.anthropicClient) providers.push('anthropic');
    if (this.groqClient) providers.push('groq');
    if (process.env.TOGETHER_API_KEY) providers.push('together');

    return providers;
  }

  /**
   * Get fallback chain (in order of preference)
   */
  getFallbackChain(): AIProvider[] {
    const available = this.getAvailableProviders();
    
    // Preferred order: Groq (fast) -> OpenAI (quality) -> Anthropic -> Together
    const preferenceOrder: AIProvider[] = ['groq', 'openai', 'anthropic', 'together'];
    
    return preferenceOrder.filter(p => available.includes(p));
  }
}

// Singleton instance
let providerManager: AIProviderManager | null = null;

export function getAIProviderManager(): AIProviderManager {
  if (!providerManager) {
    providerManager = new AIProviderManager();
  }
  return providerManager;
}
