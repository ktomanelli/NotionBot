import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import responseTime from 'response-time';
import { Client } from '@notionhq/client';
import Tasks from './modules/Tasks';
import Books from './modules/Books';
import Bills from './modules/Bills';
import Clothes from './modules/Clothes';
import { notionKey } from './config';
import { NotionController } from './controllers/NotionController';

const app = express();
app.use(responseTime());
app.use(bodyParser.json());
const client = new Client({auth: notionKey});
const tasks = new Tasks(client);
const books = new Books(client);
const bills = new Bills(client);
const clothes = new Clothes(client);
const notionController = new NotionController(client, tasks, books, bills, clothes)

app.get('/',(req:Request,res:Response)=>res.send('app running successfully'));

app.get('/health',(req:Request,res:Response)=>res.send('todo: implement health check'));

app.put('/notion', async (req:Request,res:Response) => notionController.handleUpdate);
app.post('/notion', async (req:Request,res:Response) => notionController.handleCreate);
app.delete('/notion', async (req:Request,res:Response) => notionController.handleDelete);

app.listen(3000, ()=>{
    console.log('app listening on 3000')
})