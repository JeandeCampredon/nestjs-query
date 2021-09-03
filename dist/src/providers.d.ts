import { Class } from '@nestjs-query/core';
import { FactoryProvider } from '@nestjs/common';
import { Connection, ConnectionOptions } from 'typeorm';
export declare const createTypeOrmQueryServiceProviders: (entities: Class<unknown>[], connection?: string | Connection | ConnectionOptions | undefined) => FactoryProvider[];
