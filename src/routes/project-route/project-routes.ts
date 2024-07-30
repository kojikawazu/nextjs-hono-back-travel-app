import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';
import { 
    logMessage,
    errorMessage,
} from '../../utils/logging/logging-service';

const projects = new Hono();
const prisma   = new PrismaClient();
const SOURCE  = 'project-route.ts';

/**
 * プロジェクトを取得する
 * @param projectId プロジェクトID
 * @returns 200(プロジェクトデータ)
 * @returns 500
 * @returns 404
 */
projects.get('/:projectId', async (c) => {
    logMessage(SOURCE, '/projects/:projectId GET start');
    const { projectId } = c.req.param();

    try {
        logMessage(SOURCE, 'Prisma getting...');
        const projects = await prisma.project.findUnique({
            include: { user: true },
            where: { id: projectId },
        });
        logMessage(SOURCE, `isProject? ${projects !== null}`);

        if (!projects) {
            errorMessage(SOURCE, 'Project not found[404]');
            return c.json({ error: 'Project not found' }, 404);
        }

        logMessage(SOURCE, '/projects/:projectId GET end');
        return c.json(projects, 200);
    } catch (err) {
        errorMessage(SOURCE, 'Failed to get project' + err);
        return c.json({ error: 'Failed to fetch projects' }, 500);
    }
});

/**
 * ユーザーIDに紐づくプロジェクトを取得する
 * @param userId ユーザーID
 * @returns 200(プロジェクトデータリスト)
 * @returns 500
 * @returns 404
 */
projects.get('/user/:userId', async (c) => {
    logMessage(SOURCE, '/projects/user/:userId GET start');
    const { userId } = c.req.param();

    try {
        logMessage(SOURCE, 'Prisma getting...');
        const projects = await prisma.project.findMany({
            include: { user: true },
            where: { userId },
        });
        logMessage(SOURCE, `isProject? ${projects !== null}`);

        if (!projects) {
            errorMessage(SOURCE, 'Project not found[404]');
            return c.json({ error: 'Project not found' }, 404);
        }

        logMessage(SOURCE, '/projects/user/:userId GET end');
        return c.json(projects, 200);
    } catch (err) {
        errorMessage(SOURCE, 'Failed to get projects' + err);
        return c.json({ error: 'Failed to fetch projects' }, 500);
    }
});

/**
 * プロジェクトを追加する
 * @param name プロジェクト名
 * @param description プロジェクト説明
 * @param userId ユーザーID
 * @returns 200(追加したプロジェクトデータ)
 * @returns 400
 * @returns 500
 */
projects.post('/', async (c) => {
    logMessage(SOURCE, '/projects POST start');

    const {
        name,
        description,
        userId,
    } = await c.req.json();

    if (!name || !description || !userId) {
        errorMessage(SOURCE, 'Invalid request[400]');
        return c.json({ error: 'Missing required fields' }, 400);
    }

    logMessage(SOURCE, 'Valid, OK');

    try {
        logMessage(SOURCE, 'Prisma creating...');
        const newProject = await prisma.project.create({
            data: {
                name,
                description,
                userId,
            },
        });
        logMessage(SOURCE, 'Prisma created');

        logMessage(SOURCE, '/projects POST end');
        return c.json(newProject, 200);
    } catch(err) {
        errorMessage(SOURCE, 'Failed to add projects' + err);
        return c.json({ error: 'Failed to add projects' }, 500);
    }
});

export default projects;