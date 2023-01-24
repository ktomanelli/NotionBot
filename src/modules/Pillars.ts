import { Client } from '@notionhq/client';
import { pillarsDatabaseId } from '../config';
import NotionDatabase from './NotionDatabase';

class Pillars extends NotionDatabase{
    constructor(client:Client){
        super(client, pillarsDatabaseId);
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

export default Pillars;