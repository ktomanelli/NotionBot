import { Client } from '@notionhq/client';
import { booksDatabaseId } from '../config';
import NotionDatabase from './NotionDatabase';

// reach out to openlibrary, get covers + metadata + cleanup

class Books extends NotionDatabase{
    constructor(client:Client){
        super(client, booksDatabaseId);
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

export default Books;