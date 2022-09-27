import * as dotenv from 'dotenv';
dotenv.config();

const notionKey = process.env.NOTION_KEY || '';
const tasksDatabaseId = process.env.NOTION_TASKS_DATABASE || '';
const billsDatabaseId = process.env.NOTION_BILLS_DATABASE || '';
const booksDatabaseId = process.env.NOTION_BOOKS_DATABASE || '';
const clothesDatabaseId = process.env.NOTION_CLOTHES_DATABASE || '';

const taskFilter = () => ({
    or:[
        {
            //sets pillar on task
            and:[
                {
                    property: "Pillar",
                    relation: {
                        "is_empty": true
                    }
                },
                {
                    property: "Done",
                    checkbox: {
                        equals: false
                    }
                }
            ]
        },
        {
            //sets daily tasks
            and:[
                {            
                    property: "Daily",
                    checkbox: {
                        equals: true
                    }
                },
                {
                    property: "Done",
                    checkbox: {
                        equals: true
                    }
                },
                {
                    property: "Completed At",
                    date: {
                        "is_not_empty": true
                    }
                },
                {
                    property: "Completed At",
                    date: {
                        before: new Date().toISOString().split('T')[0]+"T12:00:00"
                    }
                }
            ]
        },
        {
            // sets CompletedAt value
            and:[
                {
                    property: "Done",
                    checkbox: {
                        equals: true
                    }
                },
                {
                    property: "Completed At",
                    date: {
                        "is_empty": true
                    }
                },
            ]
        }
    ]
});

const billFilter = () => null;

const bookFilter = () => null;

const clothesFilter = () => null;

export {
    notionKey, 
    tasksDatabaseId, 
    billsDatabaseId, 
    booksDatabaseId,
    clothesDatabaseId,
    taskFilter,
    billFilter,
    bookFilter,
    clothesFilter
};