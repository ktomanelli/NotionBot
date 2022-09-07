import Notion from './Notion';
import express from 'express';
const app = express();
const notion = new Notion();

app.get('/',(req,res)=>res.send('app running successfully'));

app.get('/health',(req,res)=>res.send('todo: implement health check'));

app.get('/notion', async (req,res) => await notion.LookForWork(req,res))

app.listen(3000, ()=>{
    console.log('app listening on 3000')
})