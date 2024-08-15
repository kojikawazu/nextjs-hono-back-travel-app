import { PrismaClient } from '@prisma/client';
import { logMessage, errorMessage } from '../logging/logging-service';
import type { ProjectData } from '../../types/types';

const prisma = new PrismaClient();
const SOURCE = 'project-services.ts';

/**
 * プロジェクトデータの取得
 * @param projectId プロジェクトID
 * @returns プロジェクトデータ
 */
export async function getProjectById(projectId: string) {
    logMessage(SOURCE, 'getProjectById start');

    return await prisma.project.findUnique({
        where: {
            id: projectId,
        },
        include: {
            user: true,
        },
    });
}

/**
 * プロジェクトデータの更新
 * @param projectId プロジェクトID
 * @param projectData プロジェクトデータ
 * @returns プロジェクトデータ
 */
export async function updateProject(
    projectId: string,
    projectData: ProjectData
) {
    logMessage(SOURCE, 'updateProject start');

    try {
        const updatedProject = await prisma.project.update({
            where: {
                id: projectId,
            },
            data: {
                name: projectData.name,
                description: projectData.description,
            },
        });

        logMessage(SOURCE, `Prisma updated: ${updatedProject}`);
        return updatedProject;
    } catch (error) {
        errorMessage(SOURCE, `Failed to update project: ${error}`);
        throw error;
    }
}

/**
 * 複数のプロジェクトデータを削除する
 * @param projectIds プロジェクトID
 * @returns プロジェクトデータ
 */
export async function deleteProjects(projectIds: string[]) {
    logMessage(SOURCE, 'deleteProjects start');

    return await prisma.project.deleteMany({
        where: {
            id: { in: projectIds },
        },
    });
}
