import {Client} from '@notionhq/client';
import { QueryDatabaseParameters } from '@notionhq/client/build/src/api-endpoints';
import { QueueMessage } from '../types/QueueMessage';
import Queue from '../Queue';

class NotionDatabase{
    protected client;
    protected queue;
    private databaseId;
    constructor(client:Client, queue: Queue, database_id: string){
        this.client = client;
        this.queue = queue;
        if(database_id){
            this.databaseId = database_id;
        } else {
            throw new Error('Invalid environment settings');
        }
    }

    public async PutMessageOnQueue(message: QueueMessage){
        this.queue.push(message)
    }

    public async LookForWorkAndAddWorkToQueue(filter:any): Promise<void>{
        try{
            if(filter){
                const result = await this.client.databases.query({
                    database_id: this.databaseId,
                    filter
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