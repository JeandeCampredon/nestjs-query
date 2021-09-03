"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SQLComparisonBuilder = void 0;
const common_1 = require("../common");
/**
 * @internal
 * Builder to create SQL Comparisons. (=, !=, \>, etc...)
 */
class SQLComparisonBuilder {
    constructor(comparisonMap = SQLComparisonBuilder.DEFAULT_COMPARISON_MAP) {
        this.comparisonMap = comparisonMap;
    }
    get paramName() {
        const id = common_1.randomString();
        const param = `param${id}`;
        return param;
    }
    /**
     * Creates a valid SQL fragment with parameters.
     *
     * @param field - the property in Entity to create the comparison for.
     * @param cmp - the FilterComparisonOperator (eq, neq, gt, etc...)
     * @param val - the value to compare to
     * @param alias - alias for the field.
     */
    build(field, cmp, val, alias) {
        const col = alias ? `${alias}.${field}` : `${field}`;
        const normalizedCmp = cmp.toLowerCase();
        if (this.comparisonMap[normalizedCmp]) {
            // comparison operator (e.b. =, !=, >, <)
            return this.createComparisonSQL(normalizedCmp, col, val);
        }
        if (normalizedCmp === 'is') {
            // is comparison (IS TRUE, IS FALSE, IS NULL)
            return this.isComparisonSQL(col, val);
        }
        if (normalizedCmp === 'isnot') {
            // is comparison (IS NOT TRUE, IS NOT FALSE, IS NOT NULL, etc...)
            return this.isNotComparisonSQL(col, val);
        }
        if (normalizedCmp === 'in') {
            // in comparison (field IN (1,2,3))
            return this.inComparisonSQL(col, val);
        }
        if (normalizedCmp === 'notin') {
            // in comparison (field IN (1,2,3))
            return this.notInComparisonSQL(col, val);
        }
        if (normalizedCmp === 'between') {
            // between comparison (field BETWEEN x AND y)
            return this.betweenComparisonSQL(col, val);
        }
        if (normalizedCmp === 'notbetween') {
            // notBetween comparison (field NOT BETWEEN x AND y)
            return this.notBetweenComparisonSQL(col, val);
        }
        throw new Error(`unknown operator ${JSON.stringify(cmp)}`);
    }
    createComparisonSQL(cmp, col, val) {
        const operator = this.comparisonMap[cmp];
        const { paramName } = this;
        return { sql: `${col} ${operator} :${paramName}`, params: { [paramName]: val } };
    }
    isComparisonSQL(col, val) {
        if (val === null) {
            return { sql: `${col} IS NULL`, params: {} };
        }
        if (val === true) {
            return { sql: `${col} IS TRUE`, params: {} };
        }
        if (val === false) {
            return { sql: `${col} IS FALSE`, params: {} };
        }
        throw new Error(`unexpected is operator param ${JSON.stringify(val)}`);
    }
    isNotComparisonSQL(col, val) {
        if (val === null) {
            return { sql: `${col} IS NOT NULL`, params: {} };
        }
        if (val === true) {
            return { sql: `${col} IS NOT TRUE`, params: {} };
        }
        if (val === false) {
            return { sql: `${col} IS NOT FALSE`, params: {} };
        }
        throw new Error(`unexpected isNot operator param ${JSON.stringify(val)}`);
    }
    inComparisonSQL(col, val) {
        this.checkNonEmptyArray(val);
        const { paramName } = this;
        return {
            sql: `${col} IN (:...${paramName})`,
            params: { [paramName]: val },
        };
    }
    notInComparisonSQL(col, val) {
        this.checkNonEmptyArray(val);
        const { paramName } = this;
        return {
            sql: `${col} NOT IN (:...${paramName})`,
            params: { [paramName]: val },
        };
    }
    checkNonEmptyArray(val) {
        if (!Array.isArray(val)) {
            throw new Error(`Invalid in value expected an array got ${JSON.stringify(val)}`);
        }
        if (!val.length) {
            throw new Error(`Invalid in value expected a non-empty array got ${JSON.stringify(val)}`);
        }
    }
    betweenComparisonSQL(col, val) {
        if (this.isBetweenVal(val)) {
            const { paramName: lowerParamName } = this;
            const { paramName: upperParamName } = this;
            return {
                sql: `${col} BETWEEN :${lowerParamName} AND :${upperParamName}`,
                params: {
                    [lowerParamName]: val.lower,
                    [upperParamName]: val.upper,
                },
            };
        }
        throw new Error(`Invalid value for between expected {lower: val, upper: val} got ${JSON.stringify(val)}`);
    }
    notBetweenComparisonSQL(col, val) {
        if (this.isBetweenVal(val)) {
            const { paramName: lowerParamName } = this;
            const { paramName: upperParamName } = this;
            return {
                sql: `${col} NOT BETWEEN :${lowerParamName} AND :${upperParamName}`,
                params: {
                    [lowerParamName]: val.lower,
                    [upperParamName]: val.upper,
                },
            };
        }
        throw new Error(`Invalid value for not between expected {lower: val, upper: val} got ${JSON.stringify(val)}`);
    }
    isBetweenVal(val) {
        return val !== null && typeof val === 'object' && 'lower' in val && 'upper' in val;
    }
}
exports.SQLComparisonBuilder = SQLComparisonBuilder;
SQLComparisonBuilder.DEFAULT_COMPARISON_MAP = {
    eq: '=',
    neq: '!=',
    gt: '>',
    gte: '>=',
    lt: '<',
    lte: '<=',
    like: 'LIKE',
    notlike: 'NOT LIKE',
    ilike: 'ILIKE',
    notilike: 'NOT ILIKE',
};
//# sourceMappingURL=sql-comparison.builder.js.map