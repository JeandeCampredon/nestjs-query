"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilterQueryBuilder = void 0;
const core_1 = require("@nestjs-query/core");
const aggregate_builder_1 = require("./aggregate.builder");
const where_builder_1 = require("./where.builder");
/**
 * @internal
 *
 * Class that will convert a Query into a `typeorm` Query Builder.
 */
class FilterQueryBuilder {
    constructor(repo, whereBuilder = new where_builder_1.WhereBuilder(), aggregateBuilder = new aggregate_builder_1.AggregateBuilder()) {
        this.repo = repo;
        this.whereBuilder = whereBuilder;
        this.aggregateBuilder = aggregateBuilder;
    }
    /**
     * Create a `typeorm` SelectQueryBuilder with `WHERE`, `ORDER BY` and `LIMIT/OFFSET` clauses.
     *
     * @param query - the query to apply.
     */
    select(query) {
        const hasRelations = this.filterHasRelations(query.filter);
        let qb = this.createQueryBuilder();
        qb = hasRelations ? this.applyRelationJoins(qb, query.filter) : qb;
        qb = this.applyFilter(qb, query.filter, qb.alias);
        qb = this.applySorting(qb, query.sorting, qb.alias);
        qb = this.applyPaging(qb, query.paging, hasRelations);
        return qb;
    }
    selectById(id, query) {
        const hasRelations = this.filterHasRelations(query.filter);
        let qb = this.createQueryBuilder();
        qb = hasRelations ? this.applyRelationJoins(qb, query.filter) : qb;
        qb = qb.andWhereInIds(id);
        qb = this.applyFilter(qb, query.filter, qb.alias);
        qb = this.applySorting(qb, query.sorting, qb.alias);
        qb = this.applyPaging(qb, query.paging, hasRelations);
        return qb;
    }
    aggregate(query, aggregate) {
        let qb = this.createQueryBuilder();
        qb = this.applyAggregate(qb, aggregate, qb.alias);
        qb = this.applyFilter(qb, query.filter, qb.alias);
        qb = this.applyAggregateSorting(qb, aggregate.groupBy, qb.alias);
        qb = this.applyGroupBy(qb, aggregate.groupBy, qb.alias);
        return qb;
    }
    /**
     * Create a `typeorm` DeleteQueryBuilder with a WHERE clause.
     *
     * @param query - the query to apply.
     */
    delete(query) {
        return this.applyFilter(this.repo.createQueryBuilder().delete(), query.filter);
    }
    /**
     * Create a `typeorm` DeleteQueryBuilder with a WHERE clause.
     *
     * @param query - the query to apply.
     */
    softDelete(query) {
        return this.applyFilter(this.repo.createQueryBuilder().softDelete(), query.filter);
    }
    /**
     * Create a `typeorm` UpdateQueryBuilder with `WHERE` and `ORDER BY` clauses
     *
     * @param query - the query to apply.
     */
    update(query) {
        const qb = this.applyFilter(this.repo.createQueryBuilder().update(), query.filter);
        return this.applySorting(qb, query.sorting);
    }
    /**
     * Applies paging to a Pageable `typeorm` query builder
     * @param qb - the `typeorm` QueryBuilder
     * @param paging - the Paging options.
     * @param useSkipTake - if skip/take should be used instead of limit/offset.
     */
    applyPaging(qb, paging, useSkipTake) {
        if (!paging) {
            return qb;
        }
        if (useSkipTake) {
            return qb.take(paging.limit).skip(paging.offset);
        }
        return qb.limit(paging.limit).offset(paging.offset);
    }
    /**
     * Applies the filter from a Query to a `typeorm` QueryBuilder.
     *
     * @param qb - the `typeorm` QueryBuilder.
     * @param aggregate - the aggregates to select.
     * @param alias - optional alias to use to qualify an identifier
     */
    applyAggregate(qb, aggregate, alias) {
        return this.aggregateBuilder.build(qb, aggregate, alias);
    }
    /**
     * Applies the filter from a Query to a `typeorm` QueryBuilder.
     *
     * @param qb - the `typeorm` QueryBuilder.
     * @param filter - the filter.
     * @param alias - optional alias to use to qualify an identifier
     */
    applyFilter(qb, filter, alias) {
        if (!filter) {
            return qb;
        }
        return this.whereBuilder.build(qb, filter, this.getReferencedRelations(filter), alias);
    }
    /**
     * Applies the ORDER BY clause to a `typeorm` QueryBuilder.
     * @param qb - the `typeorm` QueryBuilder.
     * @param sorts - an array of SortFields to create the ORDER BY clause.
     * @param alias - optional alias to use to qualify an identifier
     */
    applySorting(qb, sorts, alias) {
        if (!sorts) {
            return qb;
        }
        return sorts.reduce((prevQb, { field, direction, nulls }) => {
            const col = alias ? `${alias}.${field}` : `${field}`;
            return prevQb.addOrderBy(col, direction, nulls);
        }, qb);
    }
    applyGroupBy(qb, groupBy, alias) {
        if (!groupBy) {
            return qb;
        }
        return groupBy.reduce((prevQb, group) => {
            const col = alias ? `${alias}.${group}` : `${group}`;
            return prevQb.addGroupBy(col);
        }, qb);
    }
    applyAggregateSorting(qb, groupBy, alias) {
        if (!groupBy) {
            return qb;
        }
        return groupBy.reduce((prevQb, field) => {
            const col = alias ? `${alias}.${field}` : `${field}`;
            return prevQb.addOrderBy(col, 'ASC');
        }, qb);
    }
    /**
     * Create a `typeorm` SelectQueryBuilder which can be used as an entry point to create update, delete or insert
     * QueryBuilders.
     */
    createQueryBuilder() {
        return this.repo.createQueryBuilder();
    }
    /**
     * Gets relations referenced in the filter and adds joins for them to the query builder
     * @param qb - the `typeorm` QueryBuilder.
     * @param filter - the filter.
     *
     * @returns the query builder for chaining
     */
    applyRelationJoins(qb, filter) {
        if (!filter) {
            return qb;
        }
        const referencedRelations = this.getReferencedRelations(filter);
        return referencedRelations.reduce((rqb, relation) => rqb.leftJoin(`${rqb.alias}.${relation}`, relation), qb);
    }
    /**
     * Checks if a filter references any relations.
     * @param filter
     *
     * @returns true if there are any referenced relations
     */
    filterHasRelations(filter) {
        if (!filter) {
            return false;
        }
        return this.getReferencedRelations(filter).length > 0;
    }
    getReferencedRelations(filter) {
        const { relationNames } = this;
        const referencedFields = core_1.getFilterFields(filter);
        return referencedFields.filter((f) => relationNames.includes(f));
    }
    get relationNames() {
        return this.repo.metadata.relations.map((r) => r.propertyName);
    }
}
exports.FilterQueryBuilder = FilterQueryBuilder;
//# sourceMappingURL=filter-query.builder.js.map