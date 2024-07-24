import { Hono } from 'hono';
import { 
    logMessage,
    errorMessage,
} from '../../utils/logging/loggingService';
import { 
    createTravel,
    getTravelsByUserAndProject,
} from '../../utils/category/category-services';

const travels = new Hono();
const SOURCE  = 'travel-route.ts';

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
        logMessage(SOURCE, `isTravel? ${travels !== null}`);
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
    } catch(err) {
        errorMessage(SOURCE, 'Failed to add travel' + err);
        return c.json({ error: 'Failed to add travel' }, 500);
    }
});

export default travels;