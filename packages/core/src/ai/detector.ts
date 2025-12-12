import { pipeline, env } from '@xenova/transformers';

// Skip local checks for models to ensure smooth first run if not cached
env.allowLocalModels = false;
env.useBrowserCache = false;

export interface DetectedEntity {
    word: string;
    entity: string;
    score: number;
    index: number;
}

export class PIIDetector {
    private pipe: any;
    private static instance: PIIDetector;

    private constructor() { }

    static async getInstance(): Promise<PIIDetector> {
        if (!PIIDetector.instance) {
            PIIDetector.instance = new PIIDetector();
            await PIIDetector.instance.init();
        }
        return PIIDetector.instance;
    }

    private async init() {
        console.log('Loading PII Detection Model...');
        this.pipe = await pipeline('token-classification', 'Xenova/bert-base-NER');
        console.log('Model Loaded.');
    }

    async detect(text: string): Promise<DetectedEntity[]> {
        if (!this.pipe) await this.init();
        const output = await this.pipe(text);

        // Normalize output
        // The model might return sub-tokens (e.g., "A", "##mit"). Detailed reconstruction logic needed.
        // For MVP, we will rely on basic mapping.
        return output;
    }
}
