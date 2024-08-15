import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';
import { logMessage, errorMessage } from '../../utils/logging/logging-service';
import {
    getProjectById,
    updateProject,
    deleteProjects,
} from '@/utils/project/project-services';

const projects = new Hono();
const prisma = new PrismaClient();
const SOURCE = 'project-route.ts';

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

    const { name, description, userId } = await c.req.json();

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
    } catch (err) {
        errorMessage(SOURCE, 'Failed to add projects' + err);
        return c.json({ error: 'Failed to add projects' }, 500);
    }
});

/**
 * プロジェクトデータを更新する
 * @param name プロジェクト名
 * @param description プロジェクト説明
 * @returns 200(更新したプロジェクトデータ)
 * @returns 400
 * @returns 404
 * @returns 500
 */
projects.put('/:projectId', async (c) => {
    logMessage(SOURCE, '/projects/:projectId PUT start');
    const { projectId } = c.req.param();
    const projectData = await c.req.json();

    if (!projectData.name || !projectData.description) {
        errorMessage(SOURCE, 'Invalid request[400]');
        return c.json({ error: 'Missing required fields' }, 400);
    }

    logMessage(SOURCE, 'Valid, OK');

    try {
        logMessage(SOURCE, 'Prisma checking existence...');
        const existingProject = await getProjectById(projectId);
        if (!existingProject) {
            errorMessage(SOURCE, 'Project data not found[404]');
            return c.json({ error: 'Project data not found' }, 404);
        }

        logMessage(SOURCE, 'Prisma updating...');
        const updatedProject = await updateProject(projectId, projectData);
        logMessage(SOURCE, `Prisma updated: ${updatedProject}`);

        logMessage(SOURCE, '/projects/:projectId PUT end');
        return c.json(updatedProject, 200);
    } catch (err) {
        errorMessage(SOURCE, 'Failed to update project' + err);
        return c.json({ error: 'Failed to update project' }, 500);
    }
});

/**
 * 複数のプロジェクトを削除する
 * @params ids プロジェクトIDリスト
 * @returns 200(削除したプロジェクトデータ)
 * @returns 400
 * @returns 500
 */
projects.post('/delete', async (c) => {
    logMessage(SOURCE, '/projects/delete POST start');

    const { ids } = await c.req.json<{ ids: string[] }>();

    if (!ids || ids.length === 0) {
        errorMessage(SOURCE, 'No projects selected[400]');
        return c.json({ error: 'Missing required fields' }, 400);
    }

    logMessage(SOURCE, 'Valid, OK');

    try {
        logMessage(SOURCE, 'Prisma deleting...');
        const deletedProjects = await deleteProjects(ids);
        logMessage(SOURCE, 'Prisma deleted');

        logMessage(SOURCE, '/projects/delete POST end');
        return c.json(deletedProjects, 200);
    } catch (err) {
        errorMessage(SOURCE, 'Failed to delete projects' + err);
        return c.json({ error: 'Failed to delete projects' }, 500);
    }
});

export default projects;
