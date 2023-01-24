import {Client} from '@notionhq/client';
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';

class NotionDatabase{
    protected client;
    private databaseId;
    constructor(client:Client, database_id: string){
        this.client = client;
        if(database_id){
            this.databaseId = database_id;
        } else {
            throw new Error('Invalid environment settings');
        }
    }

    protected async getPage(page_id: string): Promise<PageObjectResponse>{
        const page = await this.client.pages.retrieve({page_id});
        return page as PageObjectResponse;
    }

    protected async updatePage(page_id:string, options:any): Promise<PageObjectResponse>{
        const page = await this.client.pages.update({page_id,properties:options});
        return page as PageObjectResponse;
    }

    public async handleUpdate(page:PageObjectResponse){
        throw new Error("Not Implemented")
    }
    public async handleCreate(page:PageObjectResponse){
        throw new Error("Not Implemented")
    }
    public async handleDelete(page:PageObjectResponse){
        throw new Error("Not Implemented")
    }
}

export default NotionDatabase;