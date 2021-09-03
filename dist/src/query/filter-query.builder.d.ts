import { Filter, Paging, Query, SortField, AggregateQuery } from '@nestjs-query/core';
import { DeleteQueryBuilder, QueryBuilder, Repository, SelectQueryBuilder, UpdateQueryBuilder, WhereExpression } from 'typeorm';
import { SoftDeleteQueryBuilder } from 'typeorm/query-builder/SoftDeleteQueryBuilder';
import { AggregateBuilder } from './aggregate.builder';
import { WhereBuilder } from './where.builder';
/**
 * @internal
 *
 * Interface that for Typeorm query builders that are sortable.
 */
interface Sortable<Entity> extends QueryBuilder<Entity> {
    addOrderBy(sort: string, order?: 'ASC' | 'DESC', nulls?: 'NULLS FIRST' | 'NULLS LAST'): this;
}
interface Groupable<Entity> extends QueryBuilder<Entity> {
    addGroupBy(groupBy: string): this;
}
/**
 * @internal
 *
 * Interface for `typeorm` query builders that are pageable.
 */
interface Pageable<Entity> extends QueryBuilder<Entity> {
    limit(limit?: number): this;
    offset(offset?: number): this;
    skip(skip?: number): this;
    take(take?: number): this;
}
/**
 * @internal
 *
 * Class that will convert a Query into a `typeorm` Query Builder.
 */
export declare class FilterQueryBuilder<Entity> {
    readonly repo: Repository<Entity>;
    readonly whereBuilder: WhereBuilder<Entity>;
    readonly aggregateBuilder: AggregateBuilder<Entity>;
    constructor(repo: Repository<Entity>, whereBuilder?: WhereBuilder<Entity>, aggregateBuilder?: AggregateBuilder<Entity>);
    /**
     * Create a `typeorm` SelectQueryBuilder with `WHERE`, `ORDER BY` and `LIMIT/OFFSET` clauses.
     *
     * @param query - the query to apply.
     */
    select(query: Query<Entity>): SelectQueryBuilder<Entity>;
    selectById(id: string | number | (string | number)[], query: Query<Entity>): SelectQueryBuilder<Entity>;
    aggregate(query: Query<Entity>, aggregate: AggregateQuery<Entity>): SelectQueryBuilder<Entity>;
    /**
     * Create a `typeorm` DeleteQueryBuilder with a WHERE clause.
     *
     * @param query - the query to apply.
     */
    delete(query: Query<Entity>): DeleteQueryBuilder<Entity>;
    /**
     * Create a `typeorm` DeleteQueryBuilder with a WHERE clause.
     *
     * @param query - the query to apply.
     */
    softDelete(query: Query<Entity>): SoftDeleteQueryBuilder<Entity>;
    /**
     * Create a `typeorm` UpdateQueryBuilder with `WHERE` and `ORDER BY` clauses
     *
     * @param query - the query to apply.
     */
    update(query: Query<Entity>): UpdateQueryBuilder<Entity>;
    /**
     * Applies paging to a Pageable `typeorm` query builder
     * @param qb - the `typeorm` QueryBuilder
     * @param paging - the Paging options.
     * @param useSkipTake - if skip/take should be used instead of limit/offset.
     */
    applyPaging<P extends Pageable<Entity>>(qb: P, paging?: Paging, useSkipTake?: boolean): P;
    /**
     * Applies the filter from a Query to a `typeorm` QueryBuilder.
     *
     * @param qb - the `typeorm` QueryBuilder.
     * @param aggregate - the aggregates to select.
     * @param alias - optional alias to use to qualify an identifier
     */
    applyAggregate<Qb extends SelectQueryBuilder<Entity>>(qb: Qb, aggregate: AggregateQuery<Entity>, alias?: string): Qb;
    /**
     * Applies the filter from a Query to a `typeorm` QueryBuilder.
     *
     * @param qb - the `typeorm` QueryBuilder.
     * @param filter - the filter.
     * @param alias - optional alias to use to qualify an identifier
     */
    applyFilter<Where extends WhereExpression>(qb: Where, filter?: Filter<Entity>, alias?: string): Where;
    /**
     * Applies the ORDER BY clause to a `typeorm` QueryBuilder.
     * @param qb - the `typeorm` QueryBuilder.
     * @param sorts - an array of SortFields to create the ORDER BY clause.
     * @param alias - optional alias to use to qualify an identifier
     */
    applySorting<T extends Sortable<Entity>>(qb: T, sorts?: SortField<Entity>[], alias?: string): T;
    applyGroupBy<T extends Groupable<Entity>>(qb: T, groupBy?: (keyof Entity)[], alias?: string): T;
    applyAggregateSorting<T extends Sortable<Entity>>(qb: T, groupBy?: (keyof Entity)[], alias?: string): T;
    /**
     * Create a `typeorm` SelectQueryBuilder which can be used as an entry point to create update, delete or insert
     * QueryBuilders.
     */
    private createQueryBuilder;
    /**
     * Gets relations referenced in the filter and adds joins for them to the query builder
     * @param qb - the `typeorm` QueryBuilder.
     * @param filter - the filter.
     *
     * @returns the query builder for chaining
     */
    applyRelationJoins(qb: SelectQueryBuilder<Entity>, filter?: Filter<Entity>): SelectQueryBuilder<Entity>;
    /**
     * Checks if a filter references any relations.
     * @param filter
     *
     * @returns true if there are any referenced relations
     */
    filterHasRelations(filter?: Filter<Entity>): boolean;
    private getReferencedRelations;
    private get relationNames();
}
export {};
