import { CommonFieldComparisonBetweenType, FilterComparisonOperators } from '@nestjs-query/core';
import { ObjectLiteral } from 'typeorm';
/**
 * @internal
 */
declare type CmpSQLType = {
    sql: string;
    params: ObjectLiteral;
};
/**
 * @internal
 */
export declare type EntityComparisonField<Entity, F extends keyof Entity> = Entity[F] | Entity[F][] | CommonFieldComparisonBetweenType<Entity[F]> | true | false | null;
/**
 * @internal
 * Builder to create SQL Comparisons. (=, !=, \>, etc...)
 */
export declare class SQLComparisonBuilder<Entity> {
    readonly comparisonMap: Record<string, string>;
    static DEFAULT_COMPARISON_MAP: Record<string, string>;
    constructor(comparisonMap?: Record<string, string>);
    private get paramName();
    /**
     * Creates a valid SQL fragment with parameters.
     *
     * @param field - the property in Entity to create the comparison for.
     * @param cmp - the FilterComparisonOperator (eq, neq, gt, etc...)
     * @param val - the value to compare to
     * @param alias - alias for the field.
     */
    build<F extends keyof Entity>(field: F, cmp: FilterComparisonOperators<Entity[F]>, val: EntityComparisonField<Entity, F>, alias?: string): CmpSQLType;
    private createComparisonSQL;
    private isComparisonSQL;
    private isNotComparisonSQL;
    private inComparisonSQL;
    private notInComparisonSQL;
    private checkNonEmptyArray;
    private betweenComparisonSQL;
    private notBetweenComparisonSQL;
    private isBetweenVal;
}
export {};
