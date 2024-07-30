import { createParsedDate } from '@/utils/date/date-service';

// ・有効な日付文字列に対して有効な Date オブジェクトを返すこと
// ・無効な日付文字列に対して null を返すこと
// ・空の日付文字列に対して null を返すこと
// ・異なるフォーマットの有効な日付文字列に対して有効な Date オブジェクトを返すこと

describe('createParsedDate', () => {
    test('should return a valid Date object for a valid date string', async () => {
        const dateStr = '2023-07-31T12:00:00.000Z';
        const result = await createParsedDate(dateStr);
        
        expect(result).not.toBeNull();
        expect(result).toBeInstanceOf(Date);
        expect(result?.toISOString()).toBe(dateStr);
    });

    test('should return null for an invalid date string', async () => {
        const dateStr = 'invalid-date';
        const result = await createParsedDate(dateStr);
        
        expect(result).toBeNull();
    });

    test('should return null for an empty date string', async () => {
        const dateStr = '';
        const result = await createParsedDate(dateStr);
        
        expect(result).toBeNull();
    });

    test('should return a valid Date object for a valid date string in different format', async () => {
        const dateStr = 'July 31, 2023 12:00:00 GMT+0000';
        const result = await createParsedDate(dateStr);
        
        expect(result).not.toBeNull();
        expect(result).toBeInstanceOf(Date);
        expect(result?.toISOString()).toBe('2023-07-31T12:00:00.000Z');
    });
});
