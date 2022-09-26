import NotionDatabase from '../modules/NotionDatabase';
import { Action } from './Action';
import { Task } from './Task';
import {Book} from './Book';
import {Bill} from './Bill';
import { Clothe} from './Clothe'

export interface QueueMessage{
    object: NotionDatabase
    action: Action;
    item: Task | Book | Bill | Clothe;
}