import { Client } from '@notionhq/client';
import { billsDatabaseId } from '../config';
import NotionDatabase from './NotionDatabase';

class Bills extends NotionDatabase{
    constructor(client:Client){
        super(client, billsDatabaseId);
    }

    public override async handleUpdate(){
        throw new Error("Not Implemented")
    }
    public override async handleCreate(){
        throw new Error("Not Implemented")
    }
    public override async handleDelete(){
        throw new Error("Not Implemented")
    }
}

export default Bills;