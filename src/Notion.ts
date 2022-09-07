import {Client} from '@notionhq/client';
import {notionKey} from './config';
import Tasks from './modules/Tasks';
import Bills from './modules/Bills';
import Books from './modules/Books';
import { Request, Response } from 'express';
import { QueryDatabaseResponse } from '@notionhq/client/build/src/api-endpoints';

class Notion{
    private client;
    private tasks;
    private books;
    private bills;

    constructor(){
        if(notionKey){
            this.client = new Client({auth: notionKey});
            this.tasks = new Tasks(this.client);
            this.books = new Books(this.client);
            this.bills = new Bills(this.client);
        }else{
            throw new Error('Invalid notion key');
        }
    }

    public async LookForWork(req:Request,res:Response){
        try{
            const taskItems = await this.tasks.LookForWork() as QueryDatabaseResponse;
            const bookItems = await this.books.LookForWork() as QueryDatabaseResponse;
            const billItems = await this.bills.LookForWork() as QueryDatabaseResponse;
            
            await Promise.all([
                this.tasks.DoWork(taskItems),
                this.books.DoWork(bookItems),
                this.bills.DoWork(billItems),
            ]);
    
            res.status(200).json({complete:true});
        } catch(e){
            res.status(500).json(e)
        }
    }
}

export default Notion;