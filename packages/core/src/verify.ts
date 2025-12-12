import { Kavach } from './index.js';

async function main() {
    console.log('Initializing Kavach...');
    const kavach = new Kavach({ storage: 'memory' });
    const sessionId = 'test-session-1';

    const input = "Hello, my name is Amit Kumar and I live in Bangalore working for Google.";
    console.log(`\nOriginal: ${input}`);

    const masked = await kavach.sanitize(input, sessionId);
    console.log(`Masked:   ${masked}`);

    const unmasked = await kavach.desanitize(masked, sessionId);
    console.log(`Unmasked: ${unmasked}`);

    if (input === unmasked) {
        console.log('\n✅ Verification SUCCEEDED');
    } else {
        console.error('\n❌ Verification FAILED');
        process.exit(1);
    }
}

main().catch(console.error);
