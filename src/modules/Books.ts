import { Client } from '@notionhq/client';
import { booksDatabaseId, bookFilter } from '../config';
import Queue from '../Queue';
import { Book } from '../types/Book';
import NotionDatabase from './NotionDatabase';

// reach out to openlibrary, get covers + metadata + cleanup

class Books extends NotionDatabase{
    constructor(client:Client, queue: Queue){
        super(client, queue, booksDatabaseId);
    }

    public async GenerateMessagesForQueue(notionResp: any):Promise<void>{
        for(const task of notionResp.results as Book[]){
        }
    }
}

export default Books;