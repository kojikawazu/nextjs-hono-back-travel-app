import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';

const projects = new Hono();
const prisma   = new PrismaClient();

/**
 * ユーザーIDに紐づくプロジェクトを取得する
 * @param userId ユーザーID
 * @returns 200(プロジェクトデータリスト)
 * @throws 500
 */
projects.get('/:userId', async (c) => {
    console.log('[Back] /projects GET start');
    const { userId } = c.req.param();

    try {
        console.log('[Back] get project data list.');
        const projects = await prisma.project.findMany({
            include: { user: true },
            where: { userId },
        });

        console.log('[Back] /projects GET end');
        return c.json(projects, 200);
    } catch (err) {
        console.error('[Back] Failed to get projects:', err);
        return c.json({ error: 'Failed to fetch projects' }, 500);
    }
});

/**
 * プロジェクトを追加する
 * @param name プロジェクト名
 * @param description プロジェクト説明
 * @param userId ユーザーID
 * @returns 200(追加したプロジェクトデータ)
 * @throws 400
 * @throws 500
 */
projects.post('/', async (c) => {
    console.log('[Back] /projects POST start');

    const {
        name,
        description,
        userId,
    } = await c.req.json();

    if (!name || !description || !userId) {
        console.error('[Back] Invalid request[400]');
        return c.json({ error: 'Missing required fields' }, 400);
    }

    console.log('[Back] Valid, OK');

    try {
        const newProject = await prisma.project.create({
            data: {
                name,
                description,
                userId,
            },
        });

        console.log('[Back] Prisma created');
        console.log('[Back] /projects POST end');
        return c.json(newProject, 200);
    } catch(err) {
        console.error('[Back] Failed to add projects:', err);
        return c.json({ error: 'Failed to add projects' }, 500);
    }
});

export default projects;