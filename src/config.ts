import * as dotenv from 'dotenv';
dotenv.config();

const notionKey = process.env.NOTION_KEY || '';
const tasksDatabaseId = process.env.NOTION_TASKS_DATABASE || '';
const billsDatabaseId = process.env.NOTION_BILLS_DATABASE || '';
const booksDatabaseId = process.env.NOTION_BOOKS_DATABASE || '';

const taskFilter = {
    and:[
        {
            "property": "Pillar",
            "relation": {
                "is_empty": true
            }
        },
        {
            "property": "Done",
            "checkbox": {
                "equals": false
            }
        }
    ]
};

const billFilter = null;

const bookFilter = null;

export {
    notionKey, 
    tasksDatabaseId, 
    billsDatabaseId, 
    booksDatabaseId,
    taskFilter,
    billFilter,
    bookFilter
};