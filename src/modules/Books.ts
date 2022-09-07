import { Client } from '@notionhq/client';
import { QueryDatabaseResponse } from '@notionhq/client/build/src/api-endpoints';
import { booksDatabaseId, bookFilter } from '../config';
import NotionDatabase from './NotionDatabase';

// reach out to openlibrary, get covers + metadata + cleanup

class Books extends NotionDatabase{
    constructor(client:Client){
        super(client, {database_id: booksDatabaseId, filter:bookFilter as any});
    }

    public DoWork(books: QueryDatabaseResponse){

    }
}

export default Books;