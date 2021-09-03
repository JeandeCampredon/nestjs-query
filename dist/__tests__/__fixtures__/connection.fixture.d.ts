import { Connection, ConnectionOptions } from 'typeorm';
export declare const CONNECTION_OPTIONS: ConnectionOptions;
export declare function createTestConnection(): Promise<Connection>;
export declare function closeTestConnection(): Promise<void>;
export declare function getTestConnection(): Connection;
export declare const truncate: (connection: Connection) => Promise<void>;
export declare const refresh: (connection?: Connection) => Promise<void>;
