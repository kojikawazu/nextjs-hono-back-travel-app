import { Hono } from 'hono';
import { logMessage, errorMessage } from '../../utils/logging/logging-service';
import type {
    GroupedTravelData,
    GroupedTravelDataWithYear,
} from '../../types/types';
import {
    createTravel,
    updateTravel,
    deleteTravel,
    getTravelById,
    getTravelsByUserAndProject,
    getTravelsByUserGroupedByPeriod,
    getTravelsByUserAndProjectGroupedByPeriod,
    getTravelsByUserAndMonth,
} from '../../utils/travel/travel-services';

const travels = new Hono();
const SOURCE = 'travel-route.ts';

/**
 * 旅行データを取得する
 * @param userId ユーザーID
 * @param projectId プロジェクトID
 * @returns 200(プロジェクトデータ)
 * @returns 500
 * @returns 404
 */
travels.get('/:userId/:projectId', async (c) => {
    logMessage(SOURCE, '/projects/:userId/:projectId GET start');
    const { userId, projectId } = c.req.param();

    try {
        logMessage(SOURCE, 'Prisma getting...');
        const travels = await getTravelsByUserAndProject(userId, projectId);
        logMessage(
            SOURCE,
            `isTravel? ${travels !== null && travels.length > 0}`
        );
        logMessage(SOURCE, 'Prisma got');

        logMessage(SOURCE, '/projects/:userId/:projectId GET end');
        return c.json(travels, 200);
    } catch (err) {
        errorMessage(SOURCE, 'Failed to get travels' + err);
        return c.json({ error: 'Failed to get travels' }, 500);
    }
});

/**
 * プロジェクトを追加する
 * @param name 旅行名
 * @param description 旅行説明
 * @param amount 金額
 * @param date 日付
 * @param category カテゴリ
 * @param userId ユーザーID
 * @param projectId プロジェクトID
 * @returns 200(追加したプロジェクトデータ)
 * @returns 400
 * @returns 500
 */
travels.post('/', async (c) => {
    logMessage(SOURCE, '/travels POST start');
    const travelData = await c.req.json();

    if (
        !travelData.name ||
        !travelData.description ||
        !travelData.amount ||
        !travelData.date ||
        !travelData.category ||
        !travelData.userId ||
        !travelData.projectId
    ) {
        errorMessage(SOURCE, 'Invalid request[400]');
        return c.json({ error: 'Missing required fields' }, 400);
    }

    logMessage(SOURCE, 'Valid, OK');

    try {
        logMessage(SOURCE, 'Prisma creating...');
        const newTravel = await createTravel(travelData);
        logMessage(SOURCE, `Prisma created: ${newTravel}`);

        logMessage(SOURCE, '/travels POST end');
        return c.json(newTravel, 200);
    } catch (err) {
        errorMessage(SOURCE, 'Failed to add travel' + err);
        return c.json({ error: 'Failed to add travel' }, 500);
    }
});

/**
 * 旅行データを更新する
 */
travels.put('/:travelId', async (c) => {
    logMessage(SOURCE, '/travels/:travelId PUT start');
    const { travelId } = c.req.param();
    const travelData = await c.req.json();

    if (
        !travelData.name ||
        !travelData.description ||
        !travelData.amount ||
        !travelData.date ||
        !travelData.category
    ) {
        errorMessage(SOURCE, 'Invalid request[400]');
        return c.json({ error: 'Missing required fields' }, 400);
    }

    logMessage(SOURCE, 'Valid, OK');

    try {
        logMessage(SOURCE, 'Prisma checking existence...');
        const existingTravel = await getTravelById(travelId);
        if (!existingTravel) {
            errorMessage(SOURCE, 'Travel data not found[404]');
            return c.json({ error: 'Travel data not found' }, 404);
        }

        logMessage(SOURCE, 'Prisma updating...');
        const updatedTravel = await updateTravel(travelId, travelData);
        logMessage(SOURCE, `Prisma updated: ${updatedTravel}`);

        logMessage(SOURCE, '/travels PUT end');
        return c.json(updatedTravel, 200);
    } catch (err) {
        errorMessage(SOURCE, 'Failed to update travel' + err);
        return c.json({ error: 'Failed to update travel' }, 500);
    }
});

/**
 * 旅行データを削除する
 * @param travelId 旅行ID
 * @returns 200(削除した旅行データ)
 * @returns 500
 */
travels.delete('/:travelId', async (c) => {
    logMessage(SOURCE, '/travels/:travelId DELETE start');
    const { travelId } = c.req.param();

    try {
        logMessage(SOURCE, 'Prisma deleting...');
        const deletedTravel = await deleteTravel(travelId);
        logMessage(SOURCE, `Prisma deleted: ${deletedTravel}`);

        logMessage(SOURCE, '/travels/:travelId DELETE end');
        return c.json(deletedTravel, 200);
    } catch (err) {
        errorMessage(SOURCE, 'Failed to delete travel' + err);
        return c.json({ error: 'Failed to delete travel' }, 500);
    }
});

/**
 * 指定した期間でグループ化された旅行データを取得する
 * @param userId ユーザーID
 * @returns 200(グループ化された旅行データ)
 * @returns 400
 * @returns 404
 * @returns 500
 */
travels.get('/:userId/grouped/:period', async (c) => {
    logMessage(SOURCE, '/travels/:userId:/grouped/:period GET start');
    const { userId, period } = c.req.param();

    if (!['year', 'month', 'week'].includes(period)) {
        errorMessage(SOURCE, 'Invalid request[400]');
        return c.json({ error: 'Invalid period' }, 400);
    }

    try {
        const periodType = period as 'year' | 'month' | 'week';

        logMessage(SOURCE, 'Prisma getting grouped travels...');
        const groupedTravels:
            | GroupedTravelData[]
            | GroupedTravelDataWithYear[] =
            await getTravelsByUserGroupedByPeriod(userId, periodType);
        logMessage(
            SOURCE,
            `isTravel? ${groupedTravels !== null && groupedTravels.length > 0}`
        );
        logMessage(SOURCE, 'Prisma got');

        logMessage(SOURCE, '/travels/:userId:/grouped/:period GET end');
        return c.json(groupedTravels, 200);
    } catch (err) {
        errorMessage(SOURCE, 'Failed to get grouped travels' + err);
        return c.json({ error: 'Failed to get grouped travels' }, 500);
    }
});

/**
 * 指定した期間でグループ化された旅行データを取得する
 * @param userId ユーザーID
 * @param projectId プロジェクトID
 * @returns 200(グループ化された旅行データ)
 * @returns 400
 * @returns 404
 * @returns 500
 */
travels.get('/:userId/:projectId/grouped/:period', async (c) => {
    logMessage(
        SOURCE,
        '/travels/:userId:/:projectId/grouped/:period GET start'
    );
    const { userId, projectId, period } = c.req.param();

    if (!['year', 'month', 'week'].includes(period)) {
        errorMessage(SOURCE, 'Invalid request[400]');
        return c.json({ error: 'Invalid period' }, 400);
    }

    try {
        const periodType = period as 'year' | 'month' | 'week';

        logMessage(SOURCE, 'Prisma getting grouped travels...');
        const groupedTravels:
            | GroupedTravelData[]
            | GroupedTravelDataWithYear[] =
            await getTravelsByUserAndProjectGroupedByPeriod(
                userId,
                projectId,
                periodType
            );
        logMessage(
            SOURCE,
            `isTravel? ${groupedTravels !== null && groupedTravels.length > 0}`
        );
        logMessage(SOURCE, 'Prisma got');

        logMessage(
            SOURCE,
            '/travels/:userId:/:projectId/grouped/:period GET end'
        );
        return c.json(groupedTravels, 200);
    } catch (err) {
        errorMessage(SOURCE, 'Failed to get grouped travels' + err);
        return c.json({ error: 'Failed to get grouped travels' }, 500);
    }
});

/**
 * 月ごとの旅行データを取得する
 * @param userId ユーザーID
 * @param month 月（例: 2024年1月）
 * @returns 200(旅行データ)
 * @returns 400
 * @returns 500
 */
travels.get('/calendar/:userId/:month', async (c) => {
    logMessage(SOURCE, '/travels/:userId/:month GET start');
    const { userId, month } = c.req.param();

    // 月のバリデーション: "YYYY年M月" 形式であるか確認
    const monthPattern = /^\d{4}年\d{1,2}月$/;
    if (!monthPattern.test(month)) {
        errorMessage(SOURCE, 'Invalid month format[400]');
        return c.json(
            { error: 'Invalid month format. Expected format is YYYY年M月.' },
            400
        );
    }

    try {
        logMessage(SOURCE, 'Prisma getting...');
        const travels = await getTravelsByUserAndMonth(userId, month);
        logMessage(
            SOURCE,
            `isTravel? ${travels !== null && travels.length > 0}`
        );
        logMessage(SOURCE, 'Prisma got');

        logMessage(SOURCE, '/travels/:userId/:month GET end');
        return c.json(travels, 200);
    } catch (err) {
        errorMessage(SOURCE, 'Failed to get travels' + err);
        return c.json({ error: 'Failed to get travels' }, 500);
    }
});

export default travels;
