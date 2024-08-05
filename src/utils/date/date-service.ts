/**
 * Function to create a parsed date
 * @param date
 * @returns parsedDate
 */
export async function createParsedDate(date: string) {
    console.log('[Back] Creating parsed date');

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
        console.error('[Back] Invalid date format');
        return null;
    }

    console.log('[Back] Parsed date:', parsedDate);
    return parsedDate;
}
