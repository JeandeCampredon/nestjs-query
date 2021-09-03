import { Query, DeleteManyResponse, UpdateManyResponse, DeepPartial, Class, QueryService, Filter, AggregateQuery, AggregateResponse, FindByIdOptions, GetByIdOptions, UpdateOneOptions, DeleteOneOptions, Filterable } from '@nestjs-query/core';
import { Repository } from 'typeorm';
import { FilterQueryBuilder } from '../query';
import { RelationQueryService } from './relation-query.service';
export interface TypeOrmQueryServiceOpts<Entity> {
    useSoftDelete?: boolean;
    filterQueryBuilder?: FilterQueryBuilder<Entity>;
}
/**
 * Base class for all query services that use a `typeorm` Repository.
 *
 * @example
 *
 * ```ts
 * @QueryService(TodoItemEntity)
 * export class TodoItemService extends TypeOrmQueryService<TodoItemEntity> {
 *   constructor(
 *      @InjectRepository(TodoItemEntity) repo: Repository<TodoItemEntity>,
 *   ) {
 *     super(repo);
 *   }
 * }
 * ```
 */
export declare class TypeOrmQueryService<Entity> extends RelationQueryService<Entity> implements QueryService<Entity, DeepPartial<Entity>, DeepPartial<Entity>> {
    readonly repo: Repository<Entity>;
    readonly filterQueryBuilder: FilterQueryBuilder<Entity>;
    readonly useSoftDelete: boolean;
    constructor(repo: Repository<Entity>, opts?: TypeOrmQueryServiceOpts<Entity>);
    get EntityClass(): Class<Entity>;
    /**
     * Query for multiple entities, using a Query from `@nestjs-query/core`.
     *
     * @example
     * ```ts
     * const todoItems = await this.service.query({
     *   filter: { title: { eq: 'Foo' } },
     *   paging: { limit: 10 },
     *   sorting: [{ field: "create", direction: SortDirection.DESC }],
     * });
     * ```
     * @param query - The Query used to filter, page, and sort rows.
     */
    query(query: Query<Entity>): Promise<Entity[]>;
    aggregate(filter: Filter<Entity>, aggregate: AggregateQuery<Entity>): Promise<AggregateResponse<Entity>[]>;
    count(filter: Filter<Entity>): Promise<number>;
    /**
     * Find an entity by it's `id`.
     *
     * @example
     * ```ts
     * const todoItem = await this.service.findById(1);
     * ```
     * @param id - The id of the record to find.
     */
    findById(id: string | number, opts?: FindByIdOptions<Entity>): Promise<Entity | undefined>;
    /**
     * Gets an entity by it's `id`. If the entity is not found a rejected promise is returned.
     *
     * @example
     * ```ts
     * try {
     *   const todoItem = await this.service.getById(1);
     * } catch(e) {
     *   console.error('Unable to find entity with id = 1');
     * }
     * ```
     * @param id - The id of the record to find.
     */
    getById(id: string | number, opts?: GetByIdOptions<Entity>): Promise<Entity>;
    /**
     * Creates a single entity.
     *
     * @example
     * ```ts
     * const todoItem = await this.service.createOne({title: 'Todo Item', completed: false });
     * ```
     * @param record - The entity to create.
     */
    createOne(record: DeepPartial<Entity>): Promise<Entity>;
    /**
     * Create multiple entities.
     *
     * @example
     * ```ts
     * const todoItem = await this.service.createMany([
     *   {title: 'Todo Item 1', completed: false },
     *   {title: 'Todo Item 2', completed: true },
     * ]);
     * ```
     * @param records - The entities to create.
     */
    createMany(records: DeepPartial<Entity>[]): Promise<Entity[]>;
    /**
     * Update an entity.
     *
     * @example
     * ```ts
     * const updatedEntity = await this.service.updateOne(1, { completed: true });
     * ```
     * @param id - The `id` of the record.
     * @param update - A `Partial` of the entity with fields to update.
     * @param opts - Additional options.
     */
    updateOne(id: number | string, update: DeepPartial<Entity>, opts?: UpdateOneOptions<Entity>): Promise<Entity>;
    /**
     * Update multiple entities with a `@nestjs-query/core` Filter.
     *
     * @example
     * ```ts
     * const { updatedCount } = await this.service.updateMany(
     *   { completed: true }, // the update to apply
     *   { title: { eq: 'Foo Title' } } // Filter to find records to update
     * );
     * ```
     * @param update - A `Partial` of entity with the fields to update
     * @param filter - A Filter used to find the records to update
     */
    updateMany(update: DeepPartial<Entity>, filter: Filter<Entity>): Promise<UpdateManyResponse>;
    /**
     * Delete an entity by `id`.
     *
     * @example
     *
     * ```ts
     * const deletedTodo = await this.service.deleteOne(1);
     * ```
     *
     * @param id - The `id` of the entity to delete.
     * @param filter Additional filter to use when finding the entity to delete.
     */
    deleteOne(id: string | number, opts?: DeleteOneOptions<Entity>): Promise<Entity>;
    /**
     * Delete multiple records with a `@nestjs-query/core` `Filter`.
     *
     * @example
     *
     * ```ts
     * const { deletedCount } = this.service.deleteMany({
     *   created: { lte: new Date('2020-1-1') }
     * });
     * ```
     *
     * @param filter - A `Filter` to find records to delete.
     */
    deleteMany(filter: Filter<Entity>): Promise<DeleteManyResponse>;
    /**
     * Restore an entity by `id`.
     *
     * @example
     *
     * ```ts
     * const restoredTodo = await this.service.restoreOne(1);
     * ```
     *
     * @param id - The `id` of the entity to restore.
     * @param opts Additional filter to use when finding the entity to restore.
     */
    restoreOne(id: string | number, opts?: Filterable<Entity>): Promise<Entity>;
    /**
     * Restores multiple records with a `@nestjs-query/core` `Filter`.
     *
     * @example
     *
     * ```ts
     * const { updatedCount } = this.service.restoreMany({
     *   created: { lte: new Date('2020-1-1') }
     * });
     * ```
     *
     * @param filter - A `Filter` to find records to delete.
     */
    restoreMany(filter: Filter<Entity>): Promise<UpdateManyResponse>;
    private ensureIsEntityAndDoesNotExist;
    private ensureEntityDoesNotExist;
    private ensureIdIsNotPresent;
    private ensureSoftDeleteEnabled;
}
