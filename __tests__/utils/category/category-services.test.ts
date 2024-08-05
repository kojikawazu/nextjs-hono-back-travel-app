import { PrismaClient } from '@prisma/client';
import { getOrCreateCategory } from '@/utils/category/category-services';
import { logMessage } from '@/utils/logging/logging-service';

// mock

jest.mock('@prisma/client', () => {
    const mPrismaClient = {
        category: {
            findFirst: jest.fn(),
            create: jest.fn(),
        },
    };
    return { PrismaClient: jest.fn(() => mPrismaClient) };
});

jest.mock('@/utils/logging/logging-service', () => ({
    logMessage: jest.fn(),
}));

// instance

const prisma = new PrismaClient();

// ・既存のカテゴリを返すこと
// ・見つからない場合は新しいカテゴリを作成すること

describe('getOrCreateCategory', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should return existing category', async () => {
        const categoryName = 'TestCategory';
        const mockCategory = { id: 1, name: categoryName };

        (prisma.category.findFirst as jest.Mock).mockResolvedValue(
            mockCategory
        );

        const result = await getOrCreateCategory(categoryName);

        expect(prisma.category.findFirst).toHaveBeenCalledWith({
            where: { name: categoryName },
        });
        expect(result).toEqual(mockCategory);
        expect(logMessage).toHaveBeenCalledWith(
            'category-services.ts',
            'getOrCreateCategory start'
        );
        expect(logMessage).toHaveBeenCalledWith(
            'category-services.ts',
            `Category data: ${mockCategory}`
        );
        expect(logMessage).toHaveBeenCalledWith(
            'category-services.ts',
            'getOrCreateCategory end'
        );
    });

    test('should create a new category if not found', async () => {
        const categoryName = 'NewCategory';
        const newCategory = { id: 2, name: categoryName };

        (prisma.category.findFirst as jest.Mock).mockResolvedValue(null);
        (prisma.category.create as jest.Mock).mockResolvedValue(newCategory);

        const result = await getOrCreateCategory(categoryName);

        expect(prisma.category.findFirst).toHaveBeenCalledWith({
            where: { name: categoryName },
        });
        expect(prisma.category.create).toHaveBeenCalledWith({
            data: { name: categoryName },
        });
        expect(result).toEqual(newCategory);
        expect(logMessage).toHaveBeenCalledWith(
            'category-services.ts',
            'getOrCreateCategory start'
        );
        expect(logMessage).toHaveBeenCalledWith(
            'category-services.ts',
            `Category NewCategory not found, creating...`
        );
        expect(logMessage).toHaveBeenCalledWith(
            'category-services.ts',
            `Category created: ${newCategory}`
        );
        expect(logMessage).toHaveBeenCalledWith(
            'category-services.ts',
            'getOrCreateCategory end'
        );
    });
});
