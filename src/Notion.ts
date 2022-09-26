import {Client} from '@notionhq/client';
import {notionKey} from './config';
import { QueryDatabaseResponse } from '@notionhq/client/build/src/api-endpoints';
import { Request, Response } from 'express';
import Tasks from './modules/Tasks';
import Bills from './modules/Bills';
import Books from './modules/Books';
import Clothes from './modules/Clothes';

class Notion{
    private tasks;
    private books;
    private bills;
    private clothes;

    constructor(tasks:Tasks, books:Books, bills:Bills, clothes:Clothes){
        this.tasks = tasks;
        this.books = books;
        this.bills = bills;
        this.clothes = clothes;
    }

    public async LookForWork(req:Request,res:Response){
        try{
            await Promise.all([
                this.tasks.LookForWorkAndAddWorkToQueue(),
                this.books.LookForWorkAndAddWorkToQueue(),
                this.bills.LookForWorkAndAddWorkToQueue(),
                this.clothes.LookForWorkAndAddWorkToQueue(),
            ])

            res.status(200).json({complete:true});
        } catch(e){
            res.status(500).json(e)
        }
    }
}

export default Notion;