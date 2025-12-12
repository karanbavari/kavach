import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Kavach } from '@karanbavari/kavach';
import dotenv from 'dotenv';

dotenv.config();

const fastify: FastifyInstance = Fastify({ logger: true });

// Initialize Kavach
const redisUrl = process.env.REDIS_URL;
const kavach = new Kavach({
    storage: redisUrl ? 'redis' : 'memory',
    redisUrl
});

interface SanitizeBody {
    text: string;
    sessionId: string;
}

interface DesanitizeBody {
    text: string;
    sessionId: string;
}

fastify.post('/v1/sanitize', async (request: FastifyRequest<{ Body: SanitizeBody }>, reply: FastifyReply) => {
    const { text, sessionId } = request.body;

    if (!text || !sessionId) {
        return reply.code(400).send({ error: 'Missing text or sessionId' });
    }

    try {
        const maskedText = await kavach.sanitize(text, sessionId);
        return { masked_text: maskedText };
    } catch (err) {
        request.log.error(err);
        return reply.code(500).send({ error: 'Sanitization failed' });
    }
});

fastify.post('/v1/desanitize', async (request: FastifyRequest<{ Body: DesanitizeBody }>, reply: FastifyReply) => {
    const { text, sessionId } = request.body;

    if (!text || !sessionId) {
        return reply.code(400).send({ error: 'Missing text or sessionId' });
    }

    try {
        const originalText = await kavach.desanitize(text, sessionId);
        return { original_text: originalText };
    } catch (err) {
        request.log.error(err);
        return reply.code(500).send({ error: 'Desanitization failed' });
    }
});

const start = async () => {
    try {
        await fastify.listen({ port: 3000, host: '0.0.0.0' });
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
