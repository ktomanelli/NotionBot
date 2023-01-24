import { Client } from '@notionhq/client';
import { ordersDatabaseId } from '../config';
import NotionDatabase from './NotionDatabase';

class Orders extends NotionDatabase{
    constructor(client:Client){
        super(client, ordersDatabaseId);
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

export default Orders;