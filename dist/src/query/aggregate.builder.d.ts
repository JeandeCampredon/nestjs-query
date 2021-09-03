import { SelectQueryBuilder } from 'typeorm';
import { AggregateQuery, AggregateResponse } from '@nestjs-query/core';
declare enum AggregateFuncs {
    AVG = "AVG",
    SUM = "SUM",
    COUNT = "COUNT",
    MAX = "MAX",
    MIN = "MIN"
}
/**
 * @internal
 * Builds a WHERE clause from a Filter.
 */
export declare class AggregateBuilder<Entity> {
    static asyncConvertToAggregateResponse<Entity>(responsePromise: Promise<Record<string, unknown>[]>): Promise<AggregateResponse<Entity>[]>;
    static getAggregateSelects<Entity>(query: AggregateQuery<Entity>): string[];
    private static getAggregateGroupBySelects;
    private static getAggregateFuncSelects;
    static getAggregateAlias<Entity>(func: AggregateFuncs, field: keyof Entity): string;
    static getGroupByAlias<Entity>(field: keyof Entity): string;
    static convertToAggregateResponse<Entity>(rawAggregates: Record<string, unknown>[]): AggregateResponse<Entity>[];
    /**
     * Builds a aggregate SELECT clause from a aggregate.
     * @param qb - the `typeorm` SelectQueryBuilder
     * @param aggregate - the aggregates to select.
     * @param alias - optional alias to use to qualify an identifier
     */
    build<Qb extends SelectQueryBuilder<Entity>>(qb: Qb, aggregate: AggregateQuery<Entity>, alias?: string): Qb;
    private createAggSelect;
    private createGroupBySelect;
}
export {};
