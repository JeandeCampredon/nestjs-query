import { Query, Class, Filter, AggregateQuery, AggregateResponse, ModifyRelationOptions, FindRelationOptions, GetByIdOptions } from '@nestjs-query/core';
import { Repository } from 'typeorm';
import { FilterQueryBuilder, RelationQueryBuilder } from '../query';
/**
 * Base class to house relations loading.
 * @internal
 */
export declare abstract class RelationQueryService<Entity> {
    abstract filterQueryBuilder: FilterQueryBuilder<Entity>;
    abstract EntityClass: Class<Entity>;
    abstract repo: Repository<Entity>;
    abstract getById(id: string | number, opts?: GetByIdOptions<Entity>): Promise<Entity>;
    /**
     * Query for relations for an array of Entities. This method will return a map with the Entity as the key and the relations as the value.
     * @param RelationClass - The class of the relation.
     * @param relationName - The name of the relation to load.
     * @param entities - the dtos to find relations for.
     * @param query - A query to use to filter, page, and sort relations.
     */
    queryRelations<Relation>(RelationClass: Class<Relation>, relationName: string, entities: Entity[], query: Query<Relation>): Promise<Map<Entity, Relation[]>>;
    /**
     * Query for an array of relations.
     * @param RelationClass - The class to serialize the relations into.
     * @param dto - The dto to query relations for.
     * @param relationName - The name of relation to query for.
     * @param query - A query to filter, page and sort relations.
     */
    queryRelations<Relation>(RelationClass: Class<Relation>, relationName: string, dto: Entity, query: Query<Relation>): Promise<Relation[]>;
    aggregateRelations<Relation>(RelationClass: Class<Relation>, relationName: string, entities: Entity[], filter: Filter<Relation>, aggregate: AggregateQuery<Relation>): Promise<Map<Entity, AggregateResponse<Relation>[]>>;
    aggregateRelations<Relation>(RelationClass: Class<Relation>, relationName: string, dto: Entity, filter: Filter<Relation>, aggregate: AggregateQuery<Relation>): Promise<AggregateResponse<Relation>[]>;
    countRelations<Relation>(RelationClass: Class<Relation>, relationName: string, entities: Entity[], filter: Filter<Relation>): Promise<Map<Entity, number>>;
    countRelations<Relation>(RelationClass: Class<Relation>, relationName: string, dto: Entity, filter: Filter<Relation>): Promise<number>;
    /**
     * Find a relation for an array of Entities. This will return a Map where the key is the Entity and the value is to
     * relation or undefined if not found.
     * @param RelationClass - the class of the relation
     * @param relationName - the name of the relation to load.
     * @param dtos - the dtos to find the relation for.
     * @param opts - Additional options
     */
    findRelation<Relation>(RelationClass: Class<Relation>, relationName: string, dtos: Entity[], opts?: FindRelationOptions<Relation>): Promise<Map<Entity, Relation | undefined>>;
    /**
     * Finds a single relation.
     * @param RelationClass - The class to serialize the relation into.
     * @param dto - The dto to find the relation for.
     * @param relationName - The name of the relation to query for.
     * @param opts - Additional options
     */
    findRelation<Relation>(RelationClass: Class<Relation>, relationName: string, dto: Entity, opts?: FindRelationOptions<Relation>): Promise<Relation | undefined>;
    /**
     * Add a single relation.
     * @param id - The id of the entity to add the relation to.
     * @param relationName - The name of the relation to query for.
     * @param relationIds - The ids of relations to add.
     * @param opts - Addition options
     */
    addRelations<Relation>(relationName: string, id: string | number, relationIds: (string | number)[], opts?: ModifyRelationOptions<Entity, Relation>): Promise<Entity>;
    /**
     * Set the relations on the entity.
     *
     * @param id - The id of the entity to set the relation on.
     * @param relationName - The name of the relation to query for.
     * @param relationIds - The ids of the relation to set on the entity. If the relationIds is empty all relations
     * will be removed.
     * @param opts - Additional options
     */
    setRelations<Relation>(relationName: string, id: string | number, relationIds: (string | number)[], opts?: ModifyRelationOptions<Entity, Relation>): Promise<Entity>;
    /**
     * Set the relation on the entity.
     *
     * @param id - The id of the entity to set the relation on.
     * @param relationName - The name of the relation to query for.
     * @param relationId - The id of the relation to set on the entity.
     * @param opts - Additional options
     */
    setRelation<Relation>(relationName: string, id: string | number, relationId: string | number, opts?: ModifyRelationOptions<Entity, Relation>): Promise<Entity>;
    /**
     * Removes multiple relations.
     * @param id - The id of the entity to add the relation to.
     * @param relationName - The name of the relation to query for.
     * @param relationIds - The ids of the relations to add.
     * @param opts - Additional options
     */
    removeRelations<Relation>(relationName: string, id: string | number, relationIds: (string | number)[], opts?: ModifyRelationOptions<Entity, Relation>): Promise<Entity>;
    /**
     * Remove the relation on the entity.
     *
     * @param id - The id of the entity to set the relation on.
     * @param relationName - The name of the relation to query for.
     * @param relationId - The id of the relation to set on the entity.
     */
    removeRelation<Relation>(relationName: string, id: string | number, relationId: string | number, opts?: ModifyRelationOptions<Entity, Relation>): Promise<Entity>;
    getRelationQueryBuilder<Relation>(name: string): RelationQueryBuilder<Entity, Relation>;
    /**
     * Query for an array of relations for multiple dtos.
     * @param RelationClass - The class to serialize the relations into.
     * @param entities - The entities to query relations for.
     * @param relationName - The name of relation to query for.
     * @param query - A query to filter, page or sort relations.
     */
    private batchQueryRelations;
    /**
     * Query for an array of relations for multiple dtos.
     * @param RelationClass - The class to serialize the relations into.
     * @param entities - The entities to query relations for.
     * @param relationName - The name of relation to query for.
     * @param query - A query to filter, page or sort relations.
     */
    private batchAggregateRelations;
    /**
     * Count the number of relations for multiple dtos.
     * @param RelationClass - The class to serialize the relations into.
     * @param entities - The entities to query relations for.
     * @param relationName - The name of relation to query for.
     * @param filter - The filter to apply to the relation query.
     */
    private batchCountRelations;
    /**
     * Query for a relation for multiple dtos.
     * @param RelationClass - The class to serialize the relations into.
     * @param dtos - The dto to query relations for.
     * @param relationName - The name of relation to query for.
     * @param query - A query to filter, page or sort relations.
     */
    private batchFindRelations;
    private createTypeormRelationQueryBuilder;
    private getRelationMeta;
    private getRelationEntity;
    private getRelationsFromPrimaryKeys;
    private getRelations;
    private foundAllRelations;
}
