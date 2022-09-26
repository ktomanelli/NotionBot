import { Client } from '@notionhq/client';
import { tasksDatabaseId, taskFilter } from '../config';
import Queue from '../Queue';
import { Action } from '../types/Action';
import { Task } from '../types/Task';
import NotionDatabase from './NotionDatabase';

// todo:
// add due dates to tasks based on startdate and size
class Tasks extends NotionDatabase {
    constructor(client:Client, queue: Queue){
        super(client, queue, {database_id:tasksDatabaseId, filter:taskFilter as any});
    }

    public async GenerateMessagesForQueue(notionResp: any): Promise<void>{
        for(const task of notionResp.results as Task[]){
            if(this.flaggedForPillar(task)){
                this.PutMessageOnQueue({object: this, action: Action.SetPillarOnTask, item: task});
            }
            if(this.flaggedForCompletedAt(task)){
                this.PutMessageOnQueue({object: this, action: Action.SetCompletedAt, item: task});
            }
            if(this.flaggedForDaily(task)){
                this.PutMessageOnQueue({object: this, action: Action.SetDaily, item: task});
            }
        }
    }

    private flaggedForCompletedAt(task: Task): boolean{
        return this.isDone(task) && !this.hasCompletedTimestamp(task);
    }

    private flaggedForDaily(task: Task): boolean{
        return this.isDone(task) && this.hasCompletedTimestamp(task)
    }

    private flaggedForPillar(task: Task): boolean{
        const pillarIsEmpty = task.properties.Pillar.relation.length === 0
        return pillarIsEmpty && !this.isDone(task);
    }

    private hasCompletedTimestamp(task: Task){
        return task.properties["Completed At"].date !== null;
    }

    private isDone(task: Task){
        return task.properties.Done.checkbox
    }
    
    public async SetDaily(task:Task){
        const options = {
            "Completed At":{
                date: null
            },
            "Done": {
                checkbox: false
            }
        }
        await this.updatePage(task.id, options)
    }

    public async SetCompletedAt(task: Task){
        const options = {
            "Completed At":{
                date: {
                    "start": this.toIsoString(new Date()),
                    "time_zone": "America/New_York"
                }
            }
        }
        await this.updatePage(task.id, options)
    }

    public async SetPillarOnTask(task: Task){
        const projectId = task.properties.Project.relation[0]?.id;
        if(projectId){
            const project = await this.getPage(projectId) as any;
            const pillarId = project.properties.Pillars.relation[0]?.id
            if(pillarId){
                this.addPillarToTask(task.id, pillarId);
            }else{
                console.warn(`${project.properties.Name.title[0].plain_text} does not have a Pillar assigned`)
            }
        }else{
            console.warn(`${task.properties.Title.title[0].plain_text} doesnt have a project assigned`)
        }
    }

    private async addPillarToTask(taskId: string, pillarId: string){
        const options = {
            Pillar: {
                relation: [
                    {id:pillarId}
                ]
            }
        }
        await this.updatePage(taskId, options)
    }

    private toIsoString(date:Date) {
        const pad = function(num:number) {
            return (num < 10 ? '0' : '') + num;
        };
        
        return date.getFullYear() +
            '-' + pad(date.getMonth() + 1) +
            '-' + pad(date.getDate()) +
            'T' + pad(date.getHours()) +
            ':' + pad(date.getMinutes()) +
            ':' + pad(date.getSeconds());
    }
}

export default Tasks;