export interface PistonLanguageConfig {
  language: string;
  version: string;
}

export class LanguageMapper {
  private static readonly mappings: Record<string, PistonLanguageConfig> = {
    PYTHON: { language: 'python', version: '*' },
    CPP: { language: 'c++', version: '*' },
    JAVA: { language: 'java', version: '*' },
    JAVASCRIPT: { language: 'javascript', version: '*' },
    TYPESCRIPT: { language: 'typescript', version: '*' },
    C: { language: 'c', version: '*' },
    GO: { language: 'go', version: '*' },
    RUST: { language: 'rust', version: '*' },
  };

  /**
   * Returns the Piston language configuration for a given internal language ID.
   * Throws an error if the language is not supported.
   */
  static getPistonConfig(internalLanguage: string): PistonLanguageConfig {
    const config = this.mappings[internalLanguage.toUpperCase()];
    if (!config) {
      throw new Error(`Unsupported language requested: ${internalLanguage}`);
    }
    return config;
  }

  /**
   * Can be used to verify against Piston's /api/v2/runtimes endpoint if needed.
   */
  static getAllMappings(): Record<string, PistonLanguageConfig> {
    return this.mappings;
  }
}
