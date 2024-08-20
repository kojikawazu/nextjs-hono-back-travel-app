export interface ProjectData {
    name: string;
    description: string;
}

export interface TravelData {
    name: string;
    description: string;
    amount: number;
    date: string;
    category: string;
    userId: string;
    projectId: string;
}

export interface GroupedTravelData {
    period_key: number; // EXTRACT関数の結果は数値 (年、月、週など)
    travel_count: number;
    total_amount: number | null; // SUM(amount) の結果は null の可能性もあります
}

export interface GroupedTravelDataWithYear extends GroupedTravelData {
    year: number;
}
