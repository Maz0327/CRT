declare module 'connect-pg-simple' {
  import { Session, Store } from 'express-session';
  import { Pool } from 'pg';
  
  function connectPgSimple(session: any): new (options?: any) => Store;
  export = connectPgSimple;
}