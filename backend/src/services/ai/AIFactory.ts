import type { IAIProvider } from './IAIProvider.js';
import { GeminiProvider } from './providers/GeminiProvider.js';

export class AIFactory {
  private static instance: IAIProvider | null = null;

  static getProvider(): IAIProvider {
    if (this.instance) return this.instance;

    const providerName = process.env.AI_PROVIDER?.toUpperCase() || 'GEMINI';

    switch (providerName) {
      case 'GEMINI':
        this.instance = new GeminiProvider();
        break;
      // Future providers (OPENAI, GROQ) can be added here
      default:
        this.instance = new GeminiProvider();
    }

    return this.instance;
  }
}
