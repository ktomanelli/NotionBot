import { Client } from '@notionhq/client';
import { outfitsDatabaseId } from '../config';
import NotionDatabase from './NotionDatabase';

class Outfits extends NotionDatabase{
    constructor(client:Client){
        super(client, outfitsDatabaseId);
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

export default Outfits;