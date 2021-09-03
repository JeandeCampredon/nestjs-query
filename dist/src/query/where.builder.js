"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhereBuilder = void 0;
const typeorm_1 = require("typeorm");
const sql_comparison_builder_1 = require("./sql-comparison.builder");
/**
 * @internal
 * Builds a WHERE clause from a Filter.
 */
class WhereBuilder {
    constructor(sqlComparisonBuilder = new sql_comparison_builder_1.SQLComparisonBuilder()) {
        this.sqlComparisonBuilder = sqlComparisonBuilder;
    }
    /**
     * Builds a WHERE clause from a Filter.
     * @param where - the `typeorm` WhereExpression
     * @param filter - the filter to build the WHERE clause from.
     * @param alias - optional alias to use to qualify an identifier
     */
    build(where, filter, relationNames, alias) {
        const { and, or } = filter;
        if (and && and.length) {
            this.filterAnd(where, and, relationNames, alias);
        }
        if (or && or.length) {
            this.filterOr(where, or, relationNames, alias);
        }
        return this.filterFields(where, filter, relationNames, alias);
    }
    /**
     * ANDs multiple filters together. This will properly group every clause to ensure proper precedence.
     *
     * @param where - the `typeorm` WhereExpression
     * @param filters - the array of filters to AND together
     * @param alias - optional alias to use to qualify an identifier
     */
    filterAnd(where, filters, relationNames, alias) {
        return where.andWhere(new typeorm_1.Brackets((qb) => filters.reduce((w, f) => qb.andWhere(this.createBrackets(f, relationNames, alias)), qb)));
    }
    /**
     * ORs multiple filters together. This will properly group every clause to ensure proper precedence.
     *
     * @param where - the `typeorm` WhereExpression
     * @param filter - the array of filters to OR together
     * @param alias - optional alias to use to qualify an identifier
     */
    filterOr(where, filter, relationNames, alias) {
        return where.andWhere(new typeorm_1.Brackets((qb) => filter.reduce((w, f) => qb.orWhere(this.createBrackets(f, relationNames, alias)), qb)));
    }
    /**
     * Wraps a filter in brackes to ensure precedence.
     * ```
     * {a: { eq: 1 } } // "(a = 1)"
     * {a: { eq: 1 }, b: { gt: 2 } } // "((a = 1) AND (b > 2))"
     * ```
     * @param filter - the filter to wrap in brackets.
     * @param alias - optional alias to use to qualify an identifier
     */
    createBrackets(filter, relationNames, alias) {
        return new typeorm_1.Brackets((qb) => this.build(qb, filter, relationNames, alias));
    }
    /**
     * Creates field comparisons from a filter. This method will ignore and/or properties.
     * @param where - the `typeorm` WhereExpression
     * @param filter - the filter with fields to create comparisons for.
     * @param alias - optional alias to use to qualify an identifier
     */
    filterFields(where, filter, relationNames, alias) {
        return Object.keys(filter).reduce((w, field) => {
            if (field !== 'and' && field !== 'or') {
                return this.withFilterComparison(where, field, this.getField(filter, field), relationNames, alias);
            }
            return w;
        }, where);
    }
    getField(obj, field) {
        return obj[field];
    }
    withFilterComparison(where, field, cmp, relationNames, alias) {
        if (relationNames.includes(field)) {
            return this.withRelationFilter(where, field, cmp);
        }
        return where.andWhere(new typeorm_1.Brackets((qb) => {
            const opts = Object.keys(cmp);
            const sqlComparisons = opts.map((cmpType) => this.sqlComparisonBuilder.build(field, cmpType, cmp[cmpType], alias));
            sqlComparisons.map(({ sql, params }) => qb.orWhere(sql, params));
        }));
    }
    withRelationFilter(where, field, cmp) {
        return where.andWhere(new typeorm_1.Brackets((qb) => {
            const relationWhere = new WhereBuilder();
            // for now ignore relations of relations.
            return relationWhere.build(qb, cmp, [], field);
        }));
    }
}
exports.WhereBuilder = WhereBuilder;
//# sourceMappingURL=where.builder.js.map