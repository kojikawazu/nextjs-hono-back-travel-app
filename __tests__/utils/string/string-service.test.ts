import { stringifyBigInt } from '@/utils/string/string-service';

describe('stringifyBigInt', () => {
    test('should convert BigInt values to strings in a simple object', () => {
        const input = { value: BigInt('12345678901234567890') };
        const expected = '{"value":"12345678901234567890"}';
        const result = stringifyBigInt(input);
        expect(result).toBe(expected);
    });

    test('should handle nested objects with BigInt values', () => {
        const input = {
            outer: {
                inner: BigInt('98765432109876543210'),
            },
        };
        const expected = '{"outer":{"inner":"98765432109876543210"}}';
        const result = stringifyBigInt(input);
        expect(result).toBe(expected);
    });

    test('should handle arrays with BigInt values', () => {
        const input = [BigInt(123), BigInt(456), BigInt(789)];
        const expected = '["123","456","789"]';
        const result = stringifyBigInt(input);
        expect(result).toBe(expected);
    });

    test('should handle a mix of BigInt and other types', () => {
        const input = {
            num: 123,
            str: 'test',
            bigInt: BigInt('1234567890'),
        };
        const expected = '{"num":123,"str":"test","bigInt":"1234567890"}';
        const result = stringifyBigInt(input);
        expect(result).toBe(expected);
    });

    test('should handle null and undefined values', () => {
        const input = {
            bigInt: BigInt('1234567890'),
            nullValue: null,
            undefinedValue: undefined,
        };
        const expected = '{"bigInt":"1234567890","nullValue":null}';
        const result = stringifyBigInt(input);
        expect(result).toBe(expected);
    });

    test('should handle objects without BigInt values', () => {
        const input = {
            num: 123,
            str: 'test',
        };
        const expected = '{"num":123,"str":"test"}';
        const result = stringifyBigInt(input);
        expect(result).toBe(expected);
    });

    test('should handle an object with an empty array', () => {
        const input = {
            items: [],
        };
        const expected = '{"items":[]}';
        const result = stringifyBigInt(input);
        expect(result).toBe(expected);
    });

    test('should handle an object with nested arrays and objects', () => {
        const input = {
            nestedArray: [
                { value: BigInt(123) },
                { value: 'string' },
                { value: 456 },
            ],
        };
        const expected =
            '{"nestedArray":[{"value":"123"},{"value":"string"},{"value":456}]}';
        const result = stringifyBigInt(input);
        expect(result).toBe(expected);
    });
});
