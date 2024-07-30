import { PrismaClient } from '@prisma/client';
import { createTravel, getTravelsByUserAndProject, deleteTravel } from '@/utils/travel/travel-services';
import { errorMessage } from '@/utils/logging/logging-service';
import { createParsedDate } from '@/utils/date/date-service';
import { getOrCreateCategory } from '@/utils/category/category-services';

// mock

jest.mock('@prisma/client', () => {
    const mPrismaClient = {
        travel: {
            create: jest.fn(),
            findMany: jest.fn(),
            delete: jest.fn(),
        },
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

// ・新しい旅行データを作成して返すこと
// ・日付が無効な場合はエラーをスローすること
// ・ユーザーとプロジェクトに関連する旅行データを返すこと
// ・旅行データを削除すること

describe('travel-services', () => {
    const travelData = {
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
            const createdTravel = { ...travelData, date: parsedDate.toISOString(), categoryId: categoryData.id };

            (createParsedDate as jest.Mock).mockResolvedValue(parsedDate);
            (getOrCreateCategory as jest.Mock).mockResolvedValue(categoryData);
            (prisma.travel.create as jest.Mock).mockResolvedValue(createdTravel);

            const result = await createTravel(travelData);

            expect(createParsedDate).toHaveBeenCalledWith(travelData.date);
            expect(getOrCreateCategory).toHaveBeenCalledWith(travelData.category);
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

            await expect(createTravel(travelData)).rejects.toThrow('Invalid date format');
            expect(errorMessage).toHaveBeenCalledWith('travel-services.ts', 'Invalid date format');
        });
    });

    describe('getTravelsByUserAndProject', () => {
        test('should return travel data for user and project', async () => {
            const travelList = [
                { ...travelData, id: 'travel1', category: { id: 'category1', name: 'Test Category' } },
            ];

            (prisma.travel.findMany as jest.Mock).mockResolvedValue(travelList);

            const result = await getTravelsByUserAndProject(travelData.userId, travelData.projectId);

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

    describe('deleteTravel', () => {
        test('should delete travel data', async () => {
            const travelId = 'travel1';
            const deletedTravel = { ...travelData, id: travelId };

            (prisma.travel.delete as jest.Mock).mockResolvedValue(deletedTravel);

            const result = await deleteTravel(travelId);

            expect(prisma.travel.delete).toHaveBeenCalledWith({
                where: {
                    id: travelId,
                },
            });
            expect(result).toEqual(deletedTravel);
        });
    });
});
