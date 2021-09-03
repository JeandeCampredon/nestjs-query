"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AggregateBuilder = void 0;
const common_1 = require("@nestjs/common");
const camel_case_1 = require("camel-case");
var AggregateFuncs;
(function (AggregateFuncs) {
    AggregateFuncs["AVG"] = "AVG";
    AggregateFuncs["SUM"] = "SUM";
    AggregateFuncs["COUNT"] = "COUNT";
    AggregateFuncs["MAX"] = "MAX";
    AggregateFuncs["MIN"] = "MIN";
})(AggregateFuncs || (AggregateFuncs = {}));
const AGG_REGEXP = /(AVG|SUM|COUNT|MAX|MIN|GROUP_BY)_(.*)/;
/**
 * @internal
 * Builds a WHERE clause from a Filter.
 */
class AggregateBuilder {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    static async asyncConvertToAggregateResponse(responsePromise) {
        const aggResponse = await responsePromise;
        return this.convertToAggregateResponse(aggResponse);
    }
    // eslint-disable-next-line @typescript-eslint/no-shadow
    static getAggregateSelects(query) {
        return [...this.getAggregateGroupBySelects(query), ...this.getAggregateFuncSelects(query)];
    }
    // eslint-disable-next-line @typescript-eslint/no-shadow
    static getAggregateGroupBySelects(query) {
        var _a;
        return ((_a = query.groupBy) !== null && _a !== void 0 ? _a : []).map((f) => this.getGroupByAlias(f));
    }
    // eslint-disable-next-line @typescript-eslint/no-shadow
    static getAggregateFuncSelects(query) {
        const aggs = [
            [AggregateFuncs.COUNT, query.count],
            [AggregateFuncs.SUM, query.sum],
            [AggregateFuncs.AVG, query.avg],
            [AggregateFuncs.MAX, query.max],
            [AggregateFuncs.MIN, query.min],
        ];
        return aggs.reduce((cols, [func, fields]) => {
            const aliases = (fields !== null && fields !== void 0 ? fields : []).map((f) => this.getAggregateAlias(func, f));
            return [...cols, ...aliases];
        }, []);
    }
    // eslint-disable-next-line @typescript-eslint/no-shadow
    static getAggregateAlias(func, field) {
        return `${func}_${field}`;
    }
    // eslint-disable-next-line @typescript-eslint/no-shadow
    static getGroupByAlias(field) {
        return `GROUP_BY_${field}`;
    }
    // eslint-disable-next-line @typescript-eslint/no-shadow
    static convertToAggregateResponse(rawAggregates) {
        return rawAggregates.map((response) => {
            return Object.keys(response).reduce((agg, resultField) => {
                const matchResult = AGG_REGEXP.exec(resultField);
                if (!matchResult) {
                    throw new Error('Unknown aggregate column encountered.');
                }
                const [matchedFunc, matchedFieldName] = matchResult.slice(1);
                const aggFunc = camel_case_1.camelCase(matchedFunc.toLowerCase());
                const fieldName = matchedFieldName;
                const aggResult = agg[aggFunc] || {};
                return {
                    ...agg,
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    [aggFunc]: { ...aggResult, [fieldName]: response[resultField] },
                };
            }, {});
        });
    }
    /**
     * Builds a aggregate SELECT clause from a aggregate.
     * @param qb - the `typeorm` SelectQueryBuilder
     * @param aggregate - the aggregates to select.
     * @param alias - optional alias to use to qualify an identifier
     */
    build(qb, aggregate, alias) {
        const selects = [
            ...this.createGroupBySelect(aggregate.groupBy, alias),
            ...this.createAggSelect(AggregateFuncs.COUNT, aggregate.count, alias),
            ...this.createAggSelect(AggregateFuncs.SUM, aggregate.sum, alias),
            ...this.createAggSelect(AggregateFuncs.AVG, aggregate.avg, alias),
            ...this.createAggSelect(AggregateFuncs.MAX, aggregate.max, alias),
            ...this.createAggSelect(AggregateFuncs.MIN, aggregate.min, alias),
        ];
        if (!selects.length) {
            throw new common_1.BadRequestException('No aggregate fields found.');
        }
        const [head, ...tail] = selects;
        return tail.reduce((acc, [select, selectAlias]) => acc.addSelect(select, selectAlias), qb.select(head[0], head[1]));
    }
    createAggSelect(func, fields, alias) {
        if (!fields) {
            return [];
        }
        return fields.map((field) => {
            const col = alias ? `${alias}.${field}` : field;
            return [`${func}(${col})`, AggregateBuilder.getAggregateAlias(func, field)];
        });
    }
    createGroupBySelect(fields, alias) {
        if (!fields) {
            return [];
        }
        return fields.map((field) => {
            const col = alias ? `${alias}.${field}` : field;
            return [`${col}`, AggregateBuilder.getGroupByAlias(field)];
        });
    }
}
exports.AggregateBuilder = AggregateBuilder;
//# sourceMappingURL=aggregate.builder.js.map