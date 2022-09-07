import {Client} from '@notionhq/client';
import { QueryDatabaseParameters } from '@notionhq/client/build/src/api-endpoints';

class NotionDatabase{
    protected client;
    private databaseId;
    private filter;
    constructor(client:Client, payload: QueryDatabaseParameters){
        this.client = client
        if(payload.database_id){
            this.databaseId = payload.database_id;
            this.filter = payload.filter;
        } else {
            throw new Error('Invalid environment settings');
        }
    }

    public async LookForWork(){
        try{
            if(this.filter){
                const result = await this.client.databases.query({
                    database_id: this.databaseId,
                    filter: this.filter
                });
                return result;        
            }else{
                return [];
            }
        }catch(e){
            console.log('error in NotionDatabase.LookForWork');
            throw e;
        }
    }
}

export default NotionDatabase;