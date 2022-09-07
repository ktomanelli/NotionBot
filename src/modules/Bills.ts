import { Client } from '@notionhq/client';
import { QueryDatabaseResponse } from '@notionhq/client/build/src/api-endpoints';
import { billsDatabaseId, billFilter } from '../config';
import NotionDatabase from './NotionDatabase';

class Bills extends NotionDatabase{
    constructor(client:Client){
        super(client, {database_id:billsDatabaseId, filter: billFilter as any});
    }

    public DoWork(bills: QueryDatabaseResponse){

    }
}

export default Bills;