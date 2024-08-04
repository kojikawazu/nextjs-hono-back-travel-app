const PREFIX_LOG = '[Back]';

/**
 * ログメッセージ
 * @param source ソースコード名
 * @param message メッセージ
 */
export function logMessage(source: string, message: string) {
    console.log(`${PREFIX_LOG} [${source}] ${message}`);
}

/**
 * エラーログメッセージ
 * @param source ソースコード名
 * @param message メッセージ
 */
export function errorMessage(source: string, message: string) {
    console.error(`${PREFIX_LOG} [${source}] ${message}`);
}
