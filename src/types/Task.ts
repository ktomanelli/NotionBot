import { CreatedAt } from "./CreatedAt"
import { Date } from "./Date"
import { Formula } from "./Formula"
import { Relation } from "./Relation"
import { Rollup } from "./Rollup"
import { Select } from "./Select"
import { Status } from "./Status"
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
        Status: Status,
        Recurring: Select,
        "Frequency Input": Date,
        'Start Date': Date,
        Pillar: Relation,
        Type: Formula,
        ID: Formula,
        'Completed At': Date,
        'Sub-Tasks': Relation,
        Project: Relation,
        Created_at: CreatedAt,
        Size: Relation,
        Parent: Relation,
        Title: Title
        Sprint: Relation,
        'Ordinal Number': Formula,
        Frequency: Formula,
        'Active Sprint': Rollup,
    }
    url: string
}