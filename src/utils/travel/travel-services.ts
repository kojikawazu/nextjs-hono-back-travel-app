import { PrismaClient } from '@prisma/client';
import { logMessage, errorMessage } from '../logging/logging-service';
import type {
    TravelData,
    GroupedTravelData,
    GroupedTravelDataWithYear,
} from '../../types/types';
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

/**
 * 指定された期間でユーザーごとの旅行データを取得する
 * @param userId ユーザーID
 * @param period 'year' | 'month' | 'week' どの期間でグループ化するか
 * @returns グループ化された旅行データのリスト
 */
export async function getTravelsByUserGroupedByPeriod(
    userId: string,
    period: 'year' | 'month' | 'week'
): Promise<GroupedTravelData[] | GroupedTravelDataWithYear[]> {
    logMessage(SOURCE, 'getTravelsByUserGroupedByPeriod start');
    logMessage(SOURCE, `Period: ${period}`);

    let groupByClause: string;
    let selectClause: string;

    if (period === 'year') {
        groupByClause = `EXTRACT(YEAR FROM date)`;
        selectClause = `EXTRACT(YEAR FROM date) AS period_key`;
    } else if (period === 'month') {
        groupByClause = `EXTRACT(YEAR FROM date), EXTRACT(MONTH FROM date)`;
        selectClause = `EXTRACT(YEAR FROM date) AS year, EXTRACT(MONTH FROM date) AS period_key`;
    } else if (period === 'week') {
        groupByClause = `EXTRACT(YEAR FROM date), EXTRACT(WEEK FROM date)`;
        selectClause = `EXTRACT(YEAR FROM date) AS year, EXTRACT(WEEK FROM date) AS period_key`;
    } else {
        errorMessage(SOURCE, 'Invalid period specified');
        throw new Error('Invalid period specified');
    }

    const query = `
        SELECT ${selectClause}, COUNT(*)::int AS travel_count, SUM(amount)::numeric::int AS total_amount
        FROM "Travel"
        WHERE "userId" = $1
        GROUP BY ${groupByClause}
        ORDER BY ${groupByClause} ASC;
    `;

    const travels = await prisma.$queryRawUnsafe<
        GroupedTravelData[] | GroupedTravelDataWithYear[]
    >(query, userId);

    return travels.map((travel) => ({
        ...travel,
        ...(travel.hasOwnProperty('year') && {
            year: Number((travel as GroupedTravelDataWithYear).year),
        }),
        period_key: Number(travel.period_key),
        travel_count: Number(travel.travel_count),
        total_amount:
            travel.total_amount !== null ? Number(travel.total_amount) : null,
    }));
}

/**
 * 指定された期間でユーザーとプロジェクトごとの旅行データを取得する
 * @param userId ユーザーID
 * @param projectId プロジェクトID
 * @param period 'year' | 'month' | 'week' どの期間でグループ化するか
 * @returns グループ化された旅行データのリスト
 */
export async function getTravelsByUserAndProjectGroupedByPeriod(
    userId: string,
    projectId: string,
    period: 'year' | 'month' | 'week'
): Promise<GroupedTravelData[] | GroupedTravelDataWithYear[]> {
    logMessage(SOURCE, 'getTravelsByUserAndProjectGroupedByPeriod start');
    logMessage(SOURCE, `Period: ${period}`);

    let groupByClause: string;
    let selectClause: string;

    if (period === 'year') {
        groupByClause = `EXTRACT(YEAR FROM date)`;
        selectClause = `EXTRACT(YEAR FROM date) AS period_key`;
    } else if (period === 'month') {
        groupByClause = `EXTRACT(YEAR FROM date), EXTRACT(MONTH FROM date)`;
        selectClause = `EXTRACT(YEAR FROM date) AS year, EXTRACT(MONTH FROM date) AS period_key`;
    } else if (period === 'week') {
        groupByClause = `EXTRACT(YEAR FROM date), EXTRACT(WEEK FROM date)`;
        selectClause = `EXTRACT(YEAR FROM date) AS year, EXTRACT(WEEK FROM date) AS period_key`;
    } else {
        errorMessage(SOURCE, 'Invalid period specified');
        throw new Error('Invalid period specified');
    }

    const query = `
        SELECT ${selectClause}, COUNT(*)::int AS travel_count, SUM(amount)::numeric::int AS total_amount
        FROM "Travel"
        WHERE "userId" = $1 AND "projectId" = $2
        GROUP BY ${groupByClause}
        ORDER BY ${groupByClause} ASC;
    `;

    const travels = await prisma.$queryRawUnsafe<
        GroupedTravelData[] | GroupedTravelDataWithYear[]
    >(query, userId, projectId);

    return travels.map((travel) => ({
        ...travel,
        ...(travel.hasOwnProperty('year') && {
            year: Number((travel as GroupedTravelDataWithYear).year),
        }),
        period_key: Number(travel.period_key),
        travel_count: Number(travel.travel_count),
        total_amount:
            travel.total_amount !== null ? Number(travel.total_amount) : null,
    }));
}

/**
 * 日付とユーザーIDで旅行データを取得する
 * @param userId ユーザーID
 * @param month 月
 * @returns 旅行データ
 */
export async function getTravelsByUserAndMonth(userId: string, month: string) {
    logMessage(SOURCE, 'getTravelsByUserAndMonth start');
    logMessage(SOURCE, `userId: ${userId} month: ${month}`);

    // 正規表現で年と月を取得
    const match = month.match(/\d+/g);
    if (!match || match.length !== 2) {
        errorMessage(SOURCE, `Invalid date format`);
        throw new Error('Invalid date format');
    }
    logMessage(SOURCE, `get year and month: ${match}`);

    const [year, monthStr] = month.match(/\d+/g)!.map(Number);
    const startDate = new Date(year, monthStr - 1, 1); // 月は0から始まるので -1
    const endDate = new Date(year, monthStr, 0, 23, 59, 59, 999); // 次の月の0日目は前月の最後の日

    // 指定された月の旅行データを取得
    const travels = await prisma.travel.findMany({
        where: {
            userId: userId,
            date: {
                gte: startDate,
                lte: endDate,
            },
        },
        include: {
            category: true,
        },
    });

    logMessage(SOURCE, `travels: ${travels.length}`);
    return travels;
}

/**
 * プロジェクトの開始日と終了日を取得する
 * @param projectId プロジェクトID
 * @param month 月
 * @returns プロジェクトの開始日と終了日
 */
export async function getProjectPeriod(projectId: string, month: string) {
    logMessage(SOURCE, 'getProjectPeriod start');
    logMessage(SOURCE, `projectId: ${projectId} month: ${month}`);

    // 正規表現で年と月を取得
    const match = month.match(/\d+/g);
    if (!match || match.length !== 2) {
        errorMessage(SOURCE, `Invalid date format`);
        throw new Error('Invalid date format');
    }
    logMessage(SOURCE, `get year and month: ${match}`);

    const [year, monthStr] = match.map(Number);
    const startDate = new Date(year, monthStr - 1, 1); // 月は0から始まるので -1
    const endDate = new Date(year, monthStr, 0, 23, 59, 59, 999); // 次の月の0日目は前月の最後の日

    // 指定された期間内の旅行データを取得
    const travels = await prisma.travel.findMany({
        where: {
            projectId: projectId,
            date: {
                gte: startDate,
                lte: endDate,
            },
        },
        select: {
            date: true,
        },
    });

    logMessage(SOURCE, `travels: ${travels.length}`);
    if (travels.length === 0) {
        return { startDate: null, endDate: null };
    }

    let earliestDate = travels[0]?.date || null;
    let latestDate = travels[0]?.date || null;

    travels.forEach((travel) => {
        if (travel.date) {
            if (!earliestDate || travel.date < earliestDate) {
                earliestDate = travel.date;
            }
            if (!latestDate || travel.date > latestDate) {
                latestDate = travel.date;
            }
        }
    });

    logMessage(SOURCE, `startDate: ${earliestDate}, endDate: ${latestDate}`);
    return { startDate: earliestDate, endDate: latestDate };
}
