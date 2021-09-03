"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelationQueryBuilder = void 0;
const typeorm_1 = require("typeorm");
const DriverUtils_1 = require("typeorm/driver/DriverUtils");
const filter_query_builder_1 = require("./filter-query.builder");
const aggregate_builder_1 = require("./aggregate.builder");
/**
 * @internal
 *
 * Class that will convert a Query into a `typeorm` Query Builder.
 */
class RelationQueryBuilder {
    constructor(repo, relation) {
        this.repo = repo;
        this.relation = relation;
        this.relationRepo = this.repo.manager.getRepository(this.relationMeta.from);
        this.filterQueryBuilder = new filter_query_builder_1.FilterQueryBuilder(this.relationRepo);
        this.paramCount = 0;
    }
    select(entity, query) {
        const hasRelations = this.filterQueryBuilder.filterHasRelations(query.filter);
        let relationBuilder = this.createRelationQueryBuilder(entity);
        relationBuilder = hasRelations
            ? this.filterQueryBuilder.applyRelationJoins(relationBuilder, query.filter)
            : relationBuilder;
        relationBuilder = this.filterQueryBuilder.applyFilter(relationBuilder, query.filter, relationBuilder.alias);
        relationBuilder = this.filterQueryBuilder.applyPaging(relationBuilder, query.paging);
        return this.filterQueryBuilder.applySorting(relationBuilder, query.sorting, relationBuilder.alias);
    }
    batchSelect(entities, query) {
        const meta = this.relationMeta;
        const unionFragment = this.createUnionSelectSubQuery(entities, query);
        const unionedBuilder = this.relationRepo
            .createQueryBuilder(meta.fromAlias)
            .addSelect(`${this.escapedUnionAlias}.${this.escapedEntityIndexColName}`, this.entityIndexColName)
            .innerJoin(`(${unionFragment.sql})`, this.unionAlias, unionFragment.joinCondition, unionFragment.params);
        return this.filterQueryBuilder.applySorting(unionedBuilder.addOrderBy(`${this.escapedUnionAlias}.${this.escapedEntityIndexColName}`, 'ASC'), query.sorting, unionedBuilder.alias);
    }
    batchAggregate(entities, query, aggregateQuery) {
        const selects = [...aggregate_builder_1.AggregateBuilder.getAggregateSelects(aggregateQuery), this.entityIndexColName].map((c) => this.escapeName(c));
        const unionFragment = this.createUnionAggregateSubQuery(entities, query, aggregateQuery);
        return this.relationRepo.manager.connection
            .createQueryBuilder()
            .select(selects)
            .from(`(${unionFragment.sql})`, this.unionAlias)
            .setParameters(unionFragment.params);
    }
    aggregate(entity, query, aggregateQuery) {
        let relationBuilder = this.createRelationQueryBuilder(entity);
        relationBuilder = this.filterQueryBuilder.applyAggregate(relationBuilder, aggregateQuery, relationBuilder.alias);
        relationBuilder = this.filterQueryBuilder.applyFilter(relationBuilder, query.filter, relationBuilder.alias);
        relationBuilder = this.filterQueryBuilder.applyAggregateSorting(relationBuilder, aggregateQuery.groupBy, relationBuilder.alias);
        relationBuilder = this.filterQueryBuilder.applyGroupBy(relationBuilder, aggregateQuery.groupBy, relationBuilder.alias);
        return relationBuilder;
    }
    createUnionAggregateSubQuery(entities, query, aggregateQuery) {
        const { fromAlias } = this.relationMeta;
        const subQueries = entities.map((e, index) => {
            const subQuery = this.aggregate(e, query, aggregateQuery);
            return subQuery.addSelect(`${index}`, this.entityIndexColName);
        });
        const unionSqls = subQueries.reduce(({ unions, parameters }, sq) => ({
            unions: [...unions, sq.getQuery()],
            parameters: { ...parameters, ...sq.getParameters() },
        }), { unions: [], parameters: {} });
        const unionSql = unionSqls.unions
            .map((u) => `SELECT * FROM (${u}) AS ${this.escapeName(fromAlias)}`)
            .join(' UNION ALL ');
        return { sql: unionSql, params: unionSqls.parameters };
    }
    createUnionSelectSubQuery(entities, query) {
        const { fromPrimaryKeys, fromAlias } = this.relationMeta;
        const subQueries = entities.map((e, index) => {
            const subQuery = this.select(e, query);
            return subQuery
                .select(fromPrimaryKeys.map((fpk) => fpk.selectPath))
                .addSelect(`${index}`, this.entityIndexColName);
        });
        const unionSqls = subQueries.reduce(({ unions, parameters }, sq) => ({
            unions: [...unions, sq.getQuery()],
            parameters: { ...parameters, ...sq.getParameters() },
        }), { unions: [], parameters: {} });
        const unionSql = unionSqls.unions
            .map((u) => `SELECT * FROM (${u}) AS ${this.escapeName(fromAlias)}`)
            .join(' UNION ALL ');
        const joinCondition = fromPrimaryKeys
            .map((fpk) => `${fpk.selectPath} = ${this.escapedUnionAlias}.${this.escapeName(`${fromAlias}_${fpk.databasePath}`)}`)
            .join(' AND ');
        return { sql: unionSql, params: unionSqls.parameters, joinCondition };
    }
    createRelationQueryBuilder(entity) {
        const meta = this.relationMeta;
        const queryBuilder = this.relationRepo.createQueryBuilder(meta.fromAlias);
        const joinedBuilder = meta.joins.reduce((qb, join) => {
            const conditions = join.conditions.map(({ leftHand, rightHand }) => `${leftHand} = ${rightHand}`);
            return qb.innerJoin(join.target, join.alias, conditions.join(' AND '));
        }, queryBuilder);
        return joinedBuilder.where(new typeorm_1.Brackets((bqb) => {
            const where = meta.whereCondition(entity);
            bqb.andWhere(where.sql, where.params);
        }));
    }
    get relationMeta() {
        if (this.relationMetadata) {
            return this.relationMetadata;
        }
        const relation = this.repo.metadata.relations.find((r) => r.propertyName === this.relation);
        if (!relation) {
            throw new Error(`Unable to find entity for relation '${this.relation}'`);
        }
        else if (relation.isManyToOne || relation.isOneToOneOwner) {
            this.relationMetadata = this.getManyToOneOrOneToOneOwnerMeta(relation);
        }
        else if (relation.isOneToMany || relation.isOneToOneNotOwner) {
            this.relationMetadata = this.getOneToManyOrOneToOneNotOwnerMeta(relation);
        }
        else if (relation.isManyToManyOwner) {
            this.relationMetadata = this.getManyToManyOwnerMeta(relation);
        }
        else {
            // many-to-many non owner
            this.relationMetadata = this.getManyToManyNotOwnerMetadata(relation);
        }
        return this.relationMetadata;
    }
    getManyToOneOrOneToOneOwnerMeta(relation) {
        const aliasName = relation.entityMetadata.name;
        const { primaryColumns } = relation.entityMetadata;
        const { joinColumns } = relation;
        const joins = [
            {
                target: relation.entityMetadata.target,
                alias: aliasName,
                conditions: joinColumns.map((joinColumn) => ({
                    leftHand: `${aliasName}.${joinColumn.propertyName}`,
                    rightHand: `${relation.propertyName}.${joinColumn.referencedColumn.propertyName}`,
                })),
            },
        ];
        const fromPrimaryKeys = relation.inverseEntityMetadata.primaryColumns.map((pk) => ({
            selectPath: `${relation.propertyName}.${pk.propertyName}`,
            databasePath: pk.databasePath,
            propertyName: pk.propertyName,
        }));
        return {
            from: relation.type,
            fromAlias: relation.propertyName,
            fromPrimaryKeys,
            joins,
            whereCondition: (entity) => {
                const params = {};
                const sql = primaryColumns
                    .map((column) => {
                    const paramName = this.getParamName(aliasName);
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    params[paramName] = column.getEntityValue(entity);
                    return `${aliasName}.${column.propertyPath} = :${paramName}`;
                })
                    .join(' AND ');
                return { sql, params };
            },
        };
    }
    getOneToManyOrOneToOneNotOwnerMeta(relation) {
        const aliasName = relation.propertyName;
        const columns = relation.inverseRelation.joinColumns;
        const fromPrimaryKeys = relation.inverseEntityMetadata.primaryColumns.map((pk) => ({
            selectPath: `${aliasName}.${pk.propertyName}`,
            databasePath: pk.databasePath,
            propertyName: pk.propertyName,
        }));
        return {
            from: relation.inverseRelation.entityMetadata.target,
            fromAlias: aliasName,
            fromPrimaryKeys,
            joins: [],
            whereCondition: (entity) => {
                const params = {};
                const sql = columns
                    .map((col) => {
                    const paramName = this.getParamName(aliasName);
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    params[paramName] = col.referencedColumn.getEntityValue(entity);
                    return `${aliasName}.${col.propertyPath} = :${paramName}`;
                })
                    .join(' AND ');
                return { sql, params };
            },
        };
    }
    getManyToManyOwnerMeta(relation) {
        const mainAlias = relation.propertyName;
        const joinAlias = relation.junctionEntityMetadata.tableName;
        const joins = [
            {
                target: joinAlias,
                alias: joinAlias,
                conditions: relation.inverseJoinColumns.map((inverseJoinColumn) => ({
                    leftHand: `${joinAlias}.${inverseJoinColumn.propertyName}`,
                    rightHand: `${mainAlias}.${inverseJoinColumn.referencedColumn.propertyName}`,
                })),
            },
        ];
        const fromPrimaryKeys = relation.inverseEntityMetadata.primaryColumns.map((pk) => ({
            selectPath: `${mainAlias}.${pk.propertyName}`,
            databasePath: pk.databasePath,
            propertyName: pk.propertyName,
        }));
        return {
            from: relation.type,
            fromAlias: mainAlias,
            fromPrimaryKeys,
            joins,
            whereCondition: (entity) => {
                const params = {};
                const sql = relation.joinColumns
                    .map((joinColumn) => {
                    const paramName = this.getParamName(joinColumn.propertyName);
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    params[paramName] = joinColumn.referencedColumn.getEntityValue(entity);
                    return `${joinAlias}.${joinColumn.propertyName} = :${paramName}`;
                })
                    .join(' AND ');
                return { sql, params };
            },
        };
    }
    getManyToManyNotOwnerMetadata(relation) {
        const mainAlias = relation.propertyName;
        const joinAlias = relation.junctionEntityMetadata.tableName;
        const joins = [
            {
                target: joinAlias,
                alias: joinAlias,
                conditions: relation.inverseRelation.joinColumns.map((joinColumn) => ({
                    leftHand: `${joinAlias}.${joinColumn.propertyName}`,
                    rightHand: `${mainAlias}.${joinColumn.referencedColumn.propertyName}`,
                })),
            },
        ];
        const fromPrimaryKeys = relation.inverseEntityMetadata.primaryColumns.map((pk) => ({
            selectPath: `${mainAlias}.${pk.propertyName}`,
            databasePath: pk.databasePath,
            propertyName: pk.propertyName,
        }));
        return {
            from: relation.type,
            fromAlias: mainAlias,
            fromPrimaryKeys,
            joins,
            whereCondition: (entity) => {
                const params = {};
                const sql = relation
                    .inverseRelation.inverseJoinColumns.map((inverseJoinColumn) => {
                    const paramName = this.getParamName(inverseJoinColumn.propertyName);
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    params[paramName] = inverseJoinColumn.referencedColumn.getEntityValue(entity);
                    return `${joinAlias}.${inverseJoinColumn.propertyName} = :${paramName}`;
                })
                    .join(' AND ');
                return { sql, params };
            },
        };
    }
    getParamName(prefix) {
        this.paramCount += 1;
        return `${prefix}_${this.paramCount}`;
    }
    get entityIndexColName() {
        return '__nestjsQuery__entityIndex__';
    }
    get escapedEntityIndexColName() {
        return this.escapeName(this.entityIndexColName);
    }
    get unionAlias() {
        return 'unioned';
    }
    get escapedUnionAlias() {
        return this.escapeName(this.unionAlias);
    }
    escapeName(str) {
        return this.relationRepo.manager.connection.driver.escape(str);
    }
    getRelationPrimaryKeysPropertyNameAndColumnsName() {
        return this.relationMeta.fromPrimaryKeys.map((pk) => ({
            propertyName: pk.propertyName,
            columnName: DriverUtils_1.DriverUtils.buildColumnAlias(this.relationRepo.manager.connection.driver, this.relationMeta.fromAlias, pk.databasePath),
        }));
    }
}
exports.RelationQueryBuilder = RelationQueryBuilder;
//# sourceMappingURL=relation-query.builder.js.map