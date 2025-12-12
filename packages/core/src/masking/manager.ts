import { PIIDetector, DetectedEntity } from '../ai/detector.js';
import { StorageAdapter } from '../storage/index.js';

export class TokenManager {
    private detector: PIIDetector | null = null;
    private storage: StorageAdapter;

    constructor(storage: StorageAdapter) {
        this.storage = storage;
    }

    private async getDetector() {
        if (!this.detector) {
            this.detector = await PIIDetector.getInstance();
        }
        return this.detector;
    }

    async mask(text: string, sessionId: string): Promise<string> {
        const detector = await this.getDetector();
        const entities = await detector.detect(text);

        // Sort entities by index to handle replacements correctly
        // NOTE: production version needs robust sub-word merging (##token).
        // This is a simplified logic for the prototype.

        let maskedText = text;
        let offsetAdjustment = 0;

        // Group tokens into words (Simplistic approach for MVP)
        // A real implementation would reconstruct words from BERT's sub-tokenization

        // For now, let's treat the model output carefully.
        // We will iterate and replace known PII entities.

        // To ensure consistency, we first check if we already masked this value.
        const existingMap = await this.storage.getAll(sessionId);
        const reverseMap: Record<string, string> = {}; // Value -> Token
        for (const [token, val] of Object.entries(existingMap)) {
            reverseMap[val] = token;
        }

        // Process from end to start to avoid index shifting issues
        // Wait... transformers.js output indices are original string based? Usually.
        // But simple replacement is safer if we just token-match high confidence entities.

        // Let's refine:
        // 1. Extract entities.
        // 2. Filter for PER, LOC, ORG.
        // 3. Generate tokens.

        let entityCounter: Record<string, number> = {};

        // Grouping logic (Naive):
        // If entity I-PER follows B-PER, it is same name.

        const combinedEntities = this.groupEntities(entities, text);

        for (const entity of combinedEntities) {
            const originalValue = entity.word;

            // Check if already has a token
            let token = reverseMap[originalValue];

            if (!token) {
                // Generate new token
                const type = entity.entity.replace(/^(B-|I-)/, ''); // PER, LOC
                const count = (entityCounter[type] || 0) + 1;
                entityCounter[type] = count;
                token = `{{${type}_${count}}}`;

                // Save
                await this.storage.set(sessionId, token, originalValue);
                reverseMap[originalValue] = token;
            }

            // Replace in text
            maskedText = maskedText.replace(originalValue, token);
        }

        return maskedText;
    }

    async unmask(text: string, sessionId: string): Promise<string> {
        const map = await this.storage.getAll(sessionId);
        let unmasked = text;

        // Replace all tokens with values
        for (const [token, value] of Object.entries(map)) {
            // escapte token for regex
            const safeToken = token.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            unmasked = unmasked.replace(new RegExp(safeToken, 'g'), value);
        }

        return unmasked;
    }

    private groupEntities(rawEntities: any[], text: string): { word: string, entity: string }[] {
        const grouped: { word: string, entity: string, start: number, end: number }[] = [];

        let current: any = null;

        for (const item of rawEntities) {
            // item = { entity: 'B-PER', score: 0.9, index: 1, word: 'Amit' }
            // Transformer.js sometimes returns subwords like 'Am', '##it'.

            const isSubword = item.word.startsWith('##');
            const cleanWord = isSubword ? item.word.substring(2) : item.word;

            if (current) {
                // Check continuity logic (index or entity type)
                // Ideally check if item.index == current.lastIndex + 1 ...
                // For MVP, if it is I-XX and matches current B-XX or I-XX

                // Very basic subword merging:
                if (isSubword || (item.entity.startsWith('I-') && current.entity.endsWith(item.entity.substring(2)))) {
                    current.word += cleanWord;
                    current.end = item.index; // approximate
                    continue;
                }
            }

            // Push previous
            if (current) {
                grouped.push(current);
            }

            // Start new
            current = {
                word: cleanWord,
                entity: item.entity,
                start: item.index,
                end: item.index
            };
        }

        if (current) grouped.push(current);

        return grouped;
    }
}
