import { logMessage, errorMessage } from '@/utils/logging/logging-service';

// ・正しいメッセージをログすること
// ・正しいエラーメッセージをログすること

describe('loggingService', () => {
    const source = 'testSource';
    const message = 'testMessage';

    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('logMessage should log correct message', () => {
        logMessage(source, message);

        expect(console.log).toHaveBeenCalledWith('[Back] [testSource] testMessage');
    });

    test('errorMessage should log correct error message', () => {
        errorMessage(source, message);

        expect(console.error).toHaveBeenCalledWith('[Back] [testSource] testMessage');
    });
});
