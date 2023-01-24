import { Client } from '@notionhq/client';
import { projectsDatabaseId } from '../config';
import NotionDatabase from './NotionDatabase';

class Projects extends NotionDatabase{
    constructor(client:Client){
        super(client, projectsDatabaseId);
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

export default Projects;