import { PrismaClient } from '@prisma/client';
import { logMessage, errorMessage } from '../logging/logging-service';
import type { TravelData } from '../../types/types';
import { createParsedDate } from '../date/date-service';
import { getOrCreateCategory } from '../category/category-services';

const prisma = new PrismaClient();
const SOURCE = 'travel-services.ts';

/**
 * 旅行データを追加する
 * @param travelData 旅行データ
 * @returns 追加した旅行データ
 */
export async function createTravel(travelData: TravelData) {
    logMessage(SOURCE, 'createTravel start');
    const parsedDate = await createParsedDate(travelData.date);
    logMessage(SOURCE, `Parsed date: ${parsedDate}`);

    if (!parsedDate) {
        errorMessage(SOURCE, 'Invalid date format');
        throw new Error('Invalid date format');
    }

    logMessage(SOURCE, 'Getting or creating category...');
    const categoryData = await getOrCreateCategory(travelData.category);
    logMessage(SOURCE, `Category data: ${categoryData}`);

    return await prisma.travel.create({
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
}

/**
 * 旅行データの更新
 * @param travelId 旅行ID
 * @param travelData 旅行データ
 * @returns 旅行データ
 */
export async function updateTravel(travelId: string, travelData: TravelData) {
    logMessage(SOURCE, 'updateTravel start');
    const parsedDate = await createParsedDate(travelData.date);
    logMessage(SOURCE, `Parsed date: ${parsedDate}`);

    if (!parsedDate) {
        errorMessage(SOURCE, 'Invalid date format');
        throw new Error('Invalid date format');
    }

    logMessage(SOURCE, 'Getting or creating category...');
    const categoryData = await getOrCreateCategory(travelData.category);
    logMessage(SOURCE, `Category data: ${categoryData}`);

    try {
        const updatedTravel = await prisma.travel.update({
            where: {
                id: travelId,
            },
            data: {
                name: travelData.name,
                description: travelData.description,
                amount: travelData.amount,
                date: parsedDate.toISOString(),
                categoryId: categoryData.id,
            },
        });

        logMessage(SOURCE, `Prisma updated: ${updatedTravel}`);
        return updatedTravel;
    } catch (error) {
        errorMessage(SOURCE, `Failed to update travel: ${error}`);
        throw error;
    }
}

/**
 * 旅行データを削除する
 * @param travelId 旅行ID
 * @returns 旅行データ
 */
export async function deleteTravel(travelId: string) {
    logMessage(SOURCE, 'deleteTravel start');

    return await prisma.travel.delete({
        where: {
            id: travelId,
        },
    });
}

/**
 * 旅行データの取得
 * @param travelId 旅行ID
 * @returns 旅行データ
 */
export async function getTravelById(travelId: string) {
    logMessage(SOURCE, 'getTravelById start');

    return await prisma.travel.findUnique({
        where: {
            id: travelId,
        },
        include: {
            category: true,
        },
    });
}

/**
 * プロジェクトとユーザーごとの旅行データを取得する
 * @param userId ユーザーID
 * @param projectId プロジェクトID
 * @returns 旅行データのリスト
 */
export async function getTravelsByUserAndProject(
    userId: string,
    projectId: string
) {
    logMessage(SOURCE, 'getTravelsByUserAndProject start');

    return await prisma.travel.findMany({
        where: {
            userId: userId,
            projectId: projectId,
        },
        include: {
            category: true,
        },
    });
}
