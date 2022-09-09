import { Checkbox } from "./Checkbox"
import { Date } from "./Date"
import { Formula } from "./Formula"
import { Relation } from "./Relation"
import { Title } from "./Title"

export type Task = {
    object: string,
    id: string,
    created_time: string,
    last_edited_time: string,
    created_by: { object: string, id: string },
    last_edited_by: { object: string, id: string },
    cover?: null,//?
    icon?: null,//?
    parent: {
        type: string,
        database_id: string
    },
    archived: Boolean,
    properties: {
        'End Date': Formula,
        'In Progress (Will work on today)': Checkbox,
        'Start Date': Date,
        Pillar: Relation,
        Daily: Checkbox,
        Type: Formula,
        ID: Formula,
        'Completed At': Date,
        'Sub-Tasks': Relation,
        Project: Relation,
        Done: Checkbox,
        Created_at: {
        id: string,
        type: string,
        created_time: string
        },
        Size: Relation,
        Parent: Relation,
        Title: Title
    },
    url: string
}