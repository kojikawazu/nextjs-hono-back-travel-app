/**
 * オブジェクト内の BigInt 値を文字列に変換して JSON 形式の文字列として返します。
 * @param obj - BigInt 値を含む可能性のあるオブジェクト。
 * @returns BigInt 値が文字列に変換された JSON 形式の文字列。
 */
export function stringifyBigInt(obj: unknown): string {
    return JSON.stringify(obj, (_, value) =>
        typeof value === 'bigint' ? value.toString() : value
    );
}
