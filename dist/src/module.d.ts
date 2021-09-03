import { Class } from '@nestjs-query/core';
import { DynamicModule } from '@nestjs/common';
import { Connection, ConnectionOptions } from 'typeorm';
export declare class NestjsQueryTypeOrmModule {
    static forFeature(entities: Class<unknown>[], connection?: Connection | ConnectionOptions | string): DynamicModule;
}
