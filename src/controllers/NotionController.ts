import { Client } from "@notionhq/client";
import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { Request, Response } from "express";
import { billsDatabaseId, booksDatabaseId, clothesDatabaseId, tasksDatabaseId } from "../config";
import Bills from "../modules/Bills";
import Books from "../modules/Books";
import Clothes from "../modules/Clothes";
import Tasks from "../modules/Tasks";

export class NotionController{
    private client: Client;
    private tasks: Tasks;
    private books: Books;
    private bills: Bills;
    private clothes: Clothes;

    constructor(client:Client, tasks:Tasks, books:Books, bills:Bills, clothes:Clothes){
        this.client = client;
        this.tasks = tasks;
        this.books = books;
        this.bills = bills;
        this.clothes = clothes;
    }

    public handleCreate(req:Request,res:Response){
        const body:PageObjectResponse = req.body;
        const databaseId = body.parent.type==="database_id"?body.parent.database_id:''
        const module = this.getModule(databaseId);
        if(module){
            module.handleUpdate();
        }
        return res.sendStatus(200);
    }
    public handleUpdate(req:Request,res:Response){
        const body:PageObjectResponse = req.body;
        const databaseId = body.parent.type==="database_id"?body.parent.database_id:''
        const module = this.getModule(databaseId);
        if(module){
            module.handleUpdate();
        }
        return res.sendStatus(200);
    }
    public handleDelete(req:Request,res:Response){
        const body:PageObjectResponse = req.body;
        const databaseId = body.parent.type==="database_id"?body.parent.database_id:''
        const module = this.getModule(databaseId);
        if(module){
            module.handleUpdate();
        }
        return res.sendStatus(200);
    }

    private getModule(databaseId:string){
        switch(databaseId){
            case tasksDatabaseId:
                return this.tasks;
            case billsDatabaseId:
                return this.bills;
            case booksDatabaseId:
                return this.books;
            case clothesDatabaseId:
                return this.clothes;
            default:
                return null;
        }
    }
}