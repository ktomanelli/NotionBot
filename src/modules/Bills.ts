import { Client } from '@notionhq/client';
import { billsDatabaseId, billFilter } from '../config';
import Queue from '../Queue';
import { Bill } from '../types/Bill';
import NotionDatabase from './NotionDatabase';

class Bills extends NotionDatabase{
    constructor(client:Client, queue: Queue){
        super(client, queue, billsDatabaseId);
    }

    public async GenerateMessagesForQueue(notionResp: any):Promise<void>{
        for(const task of notionResp.results as Bill[]){
        }
    }
}

export default Bills;