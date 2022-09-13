import Notion from './Notion';
import express, { Request, Response } from 'express';
const app = express();
const notion = new Notion();

app.get('/',(req:Request,res:Response)=>res.send('app running successfully'));

app.get('/health',(req:Request,res:Response)=>res.send('todo: implement health check'));

app.get('/notion', async (req:Request,res:Response) => await notion.LookForWork(req,res))

app.listen(3000, ()=>{
    console.log('app listening on 3000')
})