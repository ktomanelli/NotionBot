import { Request, Response } from 'express';
import Tasks from './modules/Tasks';
import Bills from './modules/Bills';
import Books from './modules/Books';
import Clothes from './modules/Clothes';
import { taskFilter } from './config';

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
                this.tasks.LookForWorkAndAddWorkToQueue(taskFilter()),
                this.books.LookForWorkAndAddWorkToQueue(null),
                this.bills.LookForWorkAndAddWorkToQueue(null),
                this.clothes.LookForWorkAndAddWorkToQueue(null),
            ])

            res.status(200).json({complete:true});
        } catch(e){
            res.status(500).json(e)
        }
    }
}

export default Notion;