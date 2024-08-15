import { PrismaClient } from '@prisma/client';
import type { ProjectData } from '@/types/types';
import { logMessage, errorMessage } from '@/utils/logging/logging-service';
import {
    getProjectById,
    updateProject,
    deleteProjects,
} from '@/utils/project/project-services';

jest.mock('@prisma/client', () => {
    const mPrismaClient = {
        project: {
            findUnique: jest.fn(),
            update: jest.fn(),
            deleteMany: jest.fn(),
        },
    };
    return { PrismaClient: jest.fn(() => mPrismaClient) };
});

jest.mock('@/utils/logging/logging-service', () => ({
    logMessage: jest.fn(),
    errorMessage: jest.fn(),
}));

const prisma = new PrismaClient();

describe('project-services', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should get project by id', async () => {
        const mockProject = {
            id: 'project1',
            name: 'Test Project',
            user: { id: 'user1', name: 'Test User' },
        };
        (prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);

        const result = await getProjectById('project1');

        expect(prisma.project.findUnique).toHaveBeenCalledWith({
            where: { id: 'project1' },
            include: { user: true },
        });
        expect(result).toEqual(mockProject);
        expect(logMessage).toHaveBeenCalledWith(
            'project-services.ts',
            'getProjectById start'
        );
    });

    it('should update project data', async () => {
        const mockUpdatedProject = {
            id: 'project1',
            name: 'Updated Project',
            description: 'Updated Description',
        };
        (prisma.project.update as jest.Mock).mockResolvedValue(
            mockUpdatedProject
        );

        const projectData: ProjectData = {
            name: 'Updated Project',
            description: 'Updated Description',
        };
        const result = await updateProject('project1', projectData);

        expect(prisma.project.update).toHaveBeenCalledWith({
            where: { id: 'project1' },
            data: projectData,
        });
        expect(result).toEqual(mockUpdatedProject);
        expect(logMessage).toHaveBeenCalledWith(
            'project-services.ts',
            'updateProject start'
        );
    });

    it('should delete projects by ids', async () => {
        const mockDeletedProjects = { count: 2 };
        (prisma.project.deleteMany as jest.Mock).mockResolvedValue(
            mockDeletedProjects
        );

        const result = await deleteProjects(['project1', 'project2']);

        expect(prisma.project.deleteMany).toHaveBeenCalledWith({
            where: { id: { in: ['project1', 'project2'] } },
        });
        expect(result).toEqual(mockDeletedProjects);
        expect(logMessage).toHaveBeenCalledWith(
            'project-services.ts',
            'deleteProjects start'
        );
    });

    it('should handle error during project update', async () => {
        const mockError = new Error('Update failed');
        (prisma.project.update as jest.Mock).mockRejectedValue(mockError);

        const projectData: ProjectData = {
            name: 'Updated Project',
            description: 'Updated Description',
        };

        await expect(updateProject('project1', projectData)).rejects.toThrow(
            'Update failed'
        );
        expect(errorMessage).toHaveBeenCalledWith(
            'project-services.ts',
            `Failed to update project: ${mockError}`
        );
    });
});
