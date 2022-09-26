import { Client } from '@notionhq/client';
import { booksDatabaseId, bookFilter } from '../config';
import Queue from '../Queue';
import { Clothe } from '../types/Clothe';
import NotionDatabase from './NotionDatabase';

// get images from links if preset and set at thumbnail

class Clothes extends NotionDatabase{
    constructor(client:Client, queue:Queue){
        super(client, queue, booksDatabaseId);
    }

    public async GenerateMessagesForQueue(notionResp: any):Promise<void>{
        for(const task of notionResp.results as Clothe[]){
        }
    }
}

export default Clothes;