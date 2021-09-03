import { WhereExpression } from 'typeorm';
import { Filter } from '@nestjs-query/core';
import { SQLComparisonBuilder } from './sql-comparison.builder';
/**
 * @internal
 * Builds a WHERE clause from a Filter.
 */
export declare class WhereBuilder<Entity> {
    readonly sqlComparisonBuilder: SQLComparisonBuilder<Entity>;
    constructor(sqlComparisonBuilder?: SQLComparisonBuilder<Entity>);
    /**
     * Builds a WHERE clause from a Filter.
     * @param where - the `typeorm` WhereExpression
     * @param filter - the filter to build the WHERE clause from.
     * @param alias - optional alias to use to qualify an identifier
     */
    build<Where extends WhereExpression>(where: Where, filter: Filter<Entity>, relationNames: string[], alias?: string): Where;
    /**
     * ANDs multiple filters together. This will properly group every clause to ensure proper precedence.
     *
     * @param where - the `typeorm` WhereExpression
     * @param filters - the array of filters to AND together
     * @param alias - optional alias to use to qualify an identifier
     */
    private filterAnd;
    /**
     * ORs multiple filters together. This will properly group every clause to ensure proper precedence.
     *
     * @param where - the `typeorm` WhereExpression
     * @param filter - the array of filters to OR together
     * @param alias - optional alias to use to qualify an identifier
     */
    private filterOr;
    /**
     * Wraps a filter in brackes to ensure precedence.
     * ```
     * {a: { eq: 1 } } // "(a = 1)"
     * {a: { eq: 1 }, b: { gt: 2 } } // "((a = 1) AND (b > 2))"
     * ```
     * @param filter - the filter to wrap in brackets.
     * @param alias - optional alias to use to qualify an identifier
     */
    private createBrackets;
    /**
     * Creates field comparisons from a filter. This method will ignore and/or properties.
     * @param where - the `typeorm` WhereExpression
     * @param filter - the filter with fields to create comparisons for.
     * @param alias - optional alias to use to qualify an identifier
     */
    private filterFields;
    private getField;
    private withFilterComparison;
    private withRelationFilter;
}
