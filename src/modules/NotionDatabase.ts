import {Client} from '@notionhq/client';
import { QueryDatabaseParameters } from '@notionhq/client/build/src/api-endpoints';
import * as fastq from "fastq";
import type { queueAsPromised } from "fastq";
import { QueueMessage } from '../types/QueueMessage';
import Queue from '../Queue';

class NotionDatabase{
    protected client;
    protected queue;
    private databaseId;
    private filter;
    constructor(client:Client, queue: Queue, payload: QueryDatabaseParameters){
        this.client = client;
        this.queue = queue;
        if(payload.database_id){
            this.databaseId = payload.database_id;
            this.filter = payload.filter;
        } else {
            throw new Error('Invalid environment settings');
        }
    }

    public async PutMessageOnQueue(message: QueueMessage){
        this.queue.push(message)
    }

    public async LookForWorkAndAddWorkToQueue(): Promise<void>{
        try{
            if(this.filter){
                const result = await this.client.databases.query({
                    database_id: this.databaseId,
                    filter: this.filter
                });
                return this.GenerateMessagesForQueue(result);
            }
        }catch(e){
            console.log('error in NotionDatabase.LookForWork',e);
            throw e;
        }
    }

    public async GenerateMessagesForQueue(notionResp: any):Promise<void>{
        throw new Error('method to be overriden');
    }

    protected async getPage(page_id: string){
        const page = await this.client.pages.retrieve({page_id});
        return page;
    }

    protected async updatePage(page_id:string, options:any){
        const page = await this.client.pages.update({page_id,properties:options});
        return page;
    }
}

export default NotionDatabase;