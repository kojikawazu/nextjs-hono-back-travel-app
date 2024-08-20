import { PrismaClient } from '@prisma/client';
import { errorMessage } from '@/utils/logging/logging-service';
import { createParsedDate } from '@/utils/date/date-service';
import { getOrCreateCategory } from '@/utils/category/category-services';
import {
    createTravel,
    updateTravel,
    deleteTravel,
    getTravelById,
    getTravelsByUserAndProject,
    getTravelsByUserGroupedByPeriod,
} from '@/utils/travel/travel-services';

// mock

jest.mock('@prisma/client', () => {
    const mPrismaClient = {
        travel: {
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
        },
        $queryRaw: jest.fn(),
        $queryRawUnsafe: jest.fn(),
    };
    return { PrismaClient: jest.fn(() => mPrismaClient) };
});

jest.mock('@/utils/logging/logging-service', () => ({
    logMessage: jest.fn(),
    errorMessage: jest.fn(),
}));

jest.mock('@/utils/date/date-service', () => ({
    createParsedDate: jest.fn(),
}));

jest.mock('@/utils/category/category-services', () => ({
    getOrCreateCategory: jest.fn(),
}));

// instance

const prisma = new PrismaClient();

describe('travel-services', () => {
    const travelData = {
        id: 'travel1',
        name: 'Test Travel',
        description: 'Test Description',
        amount: 100,
        date: '2023-07-31T12:00:00Z',
        userId: 'user1',
        projectId: 'project1',
        category: 'Test Category',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createTravel', () => {
        test('should create and return new travel data', async () => {
            const parsedDate = new Date(travelData.date);
            const categoryData = { id: 'category1' };
            const createdTravel = {
                ...travelData,
                date: parsedDate.toISOString(),
                categoryId: categoryData.id,
            };

            (createParsedDate as jest.Mock).mockResolvedValue(parsedDate);
            (getOrCreateCategory as jest.Mock).mockResolvedValue(categoryData);
            (prisma.travel.create as jest.Mock).mockResolvedValue(
                createdTravel
            );

            const result = await createTravel(travelData);

            expect(createParsedDate).toHaveBeenCalledWith(travelData.date);
            expect(getOrCreateCategory).toHaveBeenCalledWith(
                travelData.category
            );
            expect(prisma.travel.create).toHaveBeenCalledWith({
                data: {
                    name: travelData.name,
                    description: travelData.description,
                    amount: travelData.amount,
                    date: parsedDate.toISOString(),
                    userId: travelData.userId,
                    projectId: travelData.projectId,
                    categoryId: categoryData.id,
                },
            });
            expect(result).toEqual(createdTravel);
        });

        test('should throw error if date is invalid', async () => {
            (createParsedDate as jest.Mock).mockResolvedValue(null);

            await expect(createTravel(travelData)).rejects.toThrow(
                'Invalid date format'
            );
            expect(errorMessage).toHaveBeenCalledWith(
                'travel-services.ts',
                'Invalid date format'
            );
        });
    });

    describe('updateTravel', () => {
        test('should update and return travel data', async () => {
            const parsedDate = new Date(travelData.date);
            const categoryData = { id: 'category1' };
            const updatedTravel = {
                ...travelData,
                date: parsedDate.toISOString(),
                categoryId: categoryData.id,
            };

            (createParsedDate as jest.Mock).mockResolvedValue(parsedDate);
            (getOrCreateCategory as jest.Mock).mockResolvedValue(categoryData);
            (prisma.travel.update as jest.Mock).mockResolvedValue(
                updatedTravel
            );

            const result = await updateTravel(travelData.id, travelData);

            expect(createParsedDate).toHaveBeenCalledWith(travelData.date);
            expect(getOrCreateCategory).toHaveBeenCalledWith(
                travelData.category
            );
            expect(prisma.travel.update).toHaveBeenCalledWith({
                where: {
                    id: travelData.id,
                },
                data: {
                    name: travelData.name,
                    description: travelData.description,
                    amount: travelData.amount,
                    date: parsedDate.toISOString(),
                    categoryId: categoryData.id,
                },
            });
            expect(result).toEqual(updatedTravel);
        });

        test('should throw error if travel data does not exist', async () => {
            (prisma.travel.update as jest.Mock).mockRejectedValue(
                new Error('Travel data not found')
            );

            await expect(
                updateTravel(travelData.id, travelData)
            ).rejects.toThrow('Travel data not found');
            expect(errorMessage).toHaveBeenCalledWith(
                'travel-services.ts',
                'Failed to update travel: Error: Travel data not found'
            );
        });

        test('should throw error if date is invalid', async () => {
            (createParsedDate as jest.Mock).mockResolvedValue(null);

            await expect(
                updateTravel(travelData.id, travelData)
            ).rejects.toThrow('Invalid date format');
            expect(errorMessage).toHaveBeenCalledWith(
                'travel-services.ts',
                'Invalid date format'
            );
        });
    });

    describe('deleteTravel', () => {
        test('should delete travel data', async () => {
            const travelId = 'travel1';
            const deletedTravel = { ...travelData, id: travelId };

            (prisma.travel.delete as jest.Mock).mockResolvedValue(
                deletedTravel
            );

            const result = await deleteTravel(travelId);

            expect(prisma.travel.delete).toHaveBeenCalledWith({
                where: {
                    id: travelId,
                },
            });
            expect(result).toEqual(deletedTravel);
        });
    });

    describe('getTravelById', () => {
        test('should return travel data for travelId', async () => {
            (prisma.travel.findUnique as jest.Mock).mockResolvedValue(
                travelData
            );

            const result = await getTravelById(travelData.id);

            expect(prisma.travel.findUnique).toHaveBeenCalledWith({
                where: {
                    id: travelData.id,
                },
                include: {
                    category: true,
                },
            });
            expect(result).toEqual(travelData);
        });
    });

    describe('getTravelsByUserAndProject', () => {
        test('should return travel data for user and project', async () => {
            const travelList = {
                ...travelData,
                id: 'travel1',
                category: { id: 'category1', name: 'Test Category' },
            };

            (prisma.travel.findMany as jest.Mock).mockResolvedValue(travelList);

            const result = await getTravelsByUserAndProject(
                travelData.userId,
                travelData.projectId
            );

            expect(prisma.travel.findMany).toHaveBeenCalledWith({
                where: {
                    userId: travelData.userId,
                    projectId: travelData.projectId,
                },
                include: {
                    category: true,
                },
            });
            expect(result).toEqual(travelList);
        });
    });

    describe('getTravelsByUserGroupedByPeriod', () => {
        const mockTravels = [
            { period_key: 2023, travel_count: 2, total_amount: 300 },
            { period_key: 2024, travel_count: 1, total_amount: 150 },
        ];

        test('should return travels grouped by year', async () => {
            (prisma.$queryRawUnsafe as jest.Mock).mockResolvedValue(
                mockTravels
            );

            const result = await getTravelsByUserGroupedByPeriod(
                'user1',
                'year'
            );

            const calls = (prisma.$queryRawUnsafe as jest.Mock).mock.calls;

            expect(calls[0][1]).toBe('user1');
            expect(result).toEqual(mockTravels);
        });

        test('should return travels grouped by month', async () => {
            const mockMonthlyTravels = [
                {
                    year: 2023,
                    period_key: 7,
                    travel_count: 1,
                    total_amount: 100,
                },
                {
                    year: 2023,
                    period_key: 8,
                    travel_count: 2,
                    total_amount: 200,
                },
            ];
            (prisma.$queryRawUnsafe as jest.Mock).mockResolvedValue(
                mockMonthlyTravels
            );

            const result = await getTravelsByUserGroupedByPeriod(
                'user1',
                'month'
            );

            const calls = (prisma.$queryRawUnsafe as jest.Mock).mock.calls;

            expect(calls[0][1]).toBe('user1');
            expect(result).toEqual(mockMonthlyTravels);
        });

        test('should return travels grouped by week', async () => {
            const mockWeeklyTravels = [
                {
                    year: 2023,
                    period_key: 30,
                    travel_count: 1,
                    total_amount: 100,
                },
                {
                    year: 2023,
                    period_key: 31,
                    travel_count: 2,
                    total_amount: 200,
                },
            ];
            (prisma.$queryRawUnsafe as jest.Mock).mockResolvedValue(
                mockWeeklyTravels
            );

            const result = await getTravelsByUserGroupedByPeriod(
                'user1',
                'week'
            );

            const calls = (prisma.$queryRawUnsafe as jest.Mock).mock.calls;

            expect(calls[0][1]).toBe('user1');
            expect(result).toEqual(mockWeeklyTravels);
        });

        test('should throw error if invalid period is specified', async () => {
            await expect(
                getTravelsByUserGroupedByPeriod(
                    'user1',
                    'invalid_period' as unknown as 'year' | 'month' | 'week'
                )
            ).rejects.toThrow('Invalid period specified');

            expect(errorMessage).toHaveBeenCalledWith(
                'travel-services.ts',
                'Invalid period specified'
            );
        });
    });
});
