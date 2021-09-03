import { AggregateQuery, Class, Query } from '@nestjs-query/core';
import { Repository, SelectQueryBuilder, ObjectLiteral } from 'typeorm';
import { RelationMetadata } from 'typeorm/metadata/RelationMetadata';
import { FilterQueryBuilder } from './filter-query.builder';
interface JoinCondition {
    leftHand: string;
    rightHand: string;
}
interface JoinColumn {
    target: Class<unknown> | string;
    alias: string;
    conditions: JoinCondition[];
}
declare type SQLFragment = {
    sql: string;
    params: ObjectLiteral;
};
declare type PrimaryKey = {
    databasePath: string;
    selectPath: string;
    propertyName: string;
};
interface RelationQuery<Relation, Entity> {
    from: Class<Relation>;
    fromAlias: string;
    fromPrimaryKeys: PrimaryKey[];
    joins: JoinColumn[];
    whereCondition(entity: Entity): SQLFragment;
}
export declare type EntityIndexRelation<Relation> = Relation & {
    __nestjsQuery__entityIndex__: number;
};
/**
 * @internal
 *
 * Class that will convert a Query into a `typeorm` Query Builder.
 */
export declare class RelationQueryBuilder<Entity, Relation> {
    readonly repo: Repository<Entity>;
    readonly relation: string;
    private relationMetadata;
    readonly filterQueryBuilder: FilterQueryBuilder<Relation>;
    readonly relationRepo: Repository<Relation>;
    private paramCount;
    constructor(repo: Repository<Entity>, relation: string);
    select(entity: Entity, query: Query<Relation>): SelectQueryBuilder<Relation>;
    batchSelect(entities: Entity[], query: Query<Relation>): SelectQueryBuilder<EntityIndexRelation<Relation>>;
    batchAggregate(entities: Entity[], query: Query<Relation>, aggregateQuery: AggregateQuery<Relation>): SelectQueryBuilder<EntityIndexRelation<Record<string, unknown>>>;
    aggregate(entity: Entity, query: Query<Relation>, aggregateQuery: AggregateQuery<Relation>): SelectQueryBuilder<Relation>;
    private createUnionAggregateSubQuery;
    private createUnionSelectSubQuery;
    private createRelationQueryBuilder;
    private get relationMeta();
    getManyToOneOrOneToOneOwnerMeta(relation: RelationMetadata): RelationQuery<Relation, Entity>;
    getOneToManyOrOneToOneNotOwnerMeta(relation: RelationMetadata): RelationQuery<Relation, Entity>;
    getManyToManyOwnerMeta(relation: RelationMetadata): RelationQuery<Relation, Entity>;
    getManyToManyNotOwnerMetadata(relation: RelationMetadata): RelationQuery<Relation, Entity>;
    private getParamName;
    get entityIndexColName(): string;
    private get escapedEntityIndexColName();
    private get unionAlias();
    private get escapedUnionAlias();
    private escapeName;
    getRelationPrimaryKeysPropertyNameAndColumnsName(): {
        columnName: string;
        propertyName: string;
    }[];
}
export {};
