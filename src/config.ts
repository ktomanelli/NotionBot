import * as dotenv from 'dotenv';
dotenv.config();

const notionKey = process.env.NOTION_KEY || '';
const tasksDatabaseId = process.env.NOTION_TASKS_DATABASE || '';
const billsDatabaseId = process.env.NOTION_BILLS_DATABASE || '';
const booksDatabaseId = process.env.NOTION_BOOKS_DATABASE || '';
const clothesDatabaseId = process.env.NOTION_CLOTHES_DATABASE || '';
const ordersDatabaseId = process.env.NOTION_CLOTHES_DATABASE || '';
const outfitsDatabaseId = process.env.NOTION_CLOTHES_DATABASE || '';
const projectsDatabaseId = process.env.NOTION_CLOTHES_DATABASE || '';
const pillarsDatabaseId = process.env.NOTION_CLOTHES_DATABASE || '';

export {
    notionKey, 
    tasksDatabaseId, 
    billsDatabaseId, 
    booksDatabaseId,
    clothesDatabaseId,
    ordersDatabaseId,
    outfitsDatabaseId,
    projectsDatabaseId,
    pillarsDatabaseId,
};