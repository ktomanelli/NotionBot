import * as fastq from "fastq";
import { queueAsPromised } from "fastq";
import { Action } from "./types/Action";
import { Bill } from "./types/Bill";
import { Book } from "./types/Book";
import { Clothe } from "./types/Clothe";
import { QueueMessage } from "./types/QueueMessage";
import { Task } from "./types/Task";

class Queue{
    private q: queueAsPromised<QueueMessage>;

    constructor(){
        this.q = fastq.promise(this.asyncWorker,5);
    }

    
    public push(message: QueueMessage){
        this.q.push(message).catch((err) => console.error(err))
    }
    
    private async asyncWorker (message: QueueMessage): Promise<void>{
        const {object, action, item} = message;
        await Queue.callMethodOnObject(object, Action[action], item);
    }
    private static async callMethodOnObject(object:any, method:string, arg:(Task|Book|Bill|Clothe)){
        await object[method](arg);
    }
}

export default Queue;