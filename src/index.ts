import Notion from './Notion';
import express, { Request, Response } from 'express';
import { Client } from '@notionhq/client';
import Tasks from './modules/Tasks';
import Books from './modules/Books';
import Bills from './modules/Bills';
import Clothes from './modules/Clothes';
import Queue from './Queue';
import { notionKey } from './config';

const app = express();
const client = new Client({auth: notionKey});
const queue = new Queue();
const tasks = new Tasks(client, queue);
const books = new Books(client, queue);
const bills = new Bills(client, queue);
const clothes = new Clothes(client, queue);
const notion = new Notion(tasks, books, bills, clothes);

app.get('/',(req:Request,res:Response)=>res.send('app running successfully'));

app.get('/health',(req:Request,res:Response)=>res.send('todo: implement health check'));

app.get('/notion', async (req:Request,res:Response) => await notion.LookForWork(req,res))

app.listen(3000, ()=>{
    console.log('app listening on 3000')
})