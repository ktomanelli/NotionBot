import * as dotenv from 'dotenv';
dotenv.config();

const notionKey = process.env.NOTION_KEY || '';
const tasksDatabaseId = process.env.NOTION_TASKS_DATABASE || '';
const billsDatabaseId = process.env.NOTION_BILLS_DATABASE || '';
const booksDatabaseId = process.env.NOTION_BOOKS_DATABASE || '';
const clothesDatabaseId = process.env.NOTION_CLOTHES_DATABASE || '';

const taskFilter = () => ({
    or:[
        // sets pillar on task
        {
            and:[
                {
                    property: "Pillar",
                    relation: {
                        "is_empty": true
                    }
                },
                {
                    property: "Status",
                    status: {
                        "does_not_equal": "Done"
                    }
                }
            ]
        },
        // sets recurring tasks
        {
            and:[
                {            
                    property: "Recurring",
                    select: {
                        "is_not_empty": true
                    }
                },
                {
                    property: "Status",
                    status: {
                        "equals": "Done"
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
        // sets CompletedAt value
        {
            and:[
                {
                    property: "Status",
                    status: {
                        "equals": "Done"
                    }
                },
                {
                    property: "Completed At",
                    date: {
                        "is_empty": true
                    }
                },
            ]
        },
        // sets child tasks to mirror some properties of parent
        {
            property: "Parent",
            relation:{
                "is_not_empty": true
            }
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