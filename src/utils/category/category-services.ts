import { PrismaClient } from '@prisma/client';
import { logMessage } from '../logging/logging-service';

const prisma = new PrismaClient();
const SOURCE = 'category-services.ts';

/**
 * カテゴリを取得または作成する
 * @param categoryName カテゴリ名
 * @returns カテゴリデータ
 */
export async function getOrCreateCategory(categoryName: string) {
    logMessage(SOURCE, 'getOrCreateCategory start');

    let categoryData = await prisma.category.findFirst({
        where: { name: categoryName },
    });
    logMessage(SOURCE, `Category data: ${categoryData}`);

    if (!categoryData) {
        logMessage(SOURCE, `Category ${categoryName} not found, creating...`);
        categoryData = await prisma.category.create({
            data: { name: categoryName },
        });
        logMessage(SOURCE, `Category created: ${categoryData}`);
    }

    logMessage(SOURCE, 'getOrCreateCategory end');
    return categoryData;
}
