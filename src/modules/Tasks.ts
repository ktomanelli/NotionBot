import { Client } from '@notionhq/client';
import { tasksDatabaseId, taskFilter } from '../config';
import { Task } from '../types/Task';
import NotionDatabase from './NotionDatabase';

// todo:
// add due dates to tasks based on startdate and size
class Tasks extends NotionDatabase {
    constructor(client:Client){
        super(client, {database_id:tasksDatabaseId, filter:taskFilter as any});
    }

    public async DoWork(taskResp: any){
        for(const task of taskResp.results as Task[]){
            if(this.flaggedForPillar(task)){
                this.setPillarOnTask(task);
            }
            if(this.flaggedForCompletedAt(task)){
                this.setCompletedAt(task)
            }
            if(this.flaggedForDaily(task)){
                this.setDaily(task)
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
    
    private async setDaily(task:Task){
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

    private async setCompletedAt(task: Task){
        const options = {
            "Completed At":{
                date: {
                    "start": this.toIsoString(new Date())
                }
            }
        }
        await this.updatePage(task.id, options)
    }

    private async setPillarOnTask(task: Task){
        const projectId = task.properties.Project.relation[0]?.id;
        const project = await this.getPage(projectId) as any;
        const pillarId = project.properties.Pillars.relation[0]?.id
        if(pillarId){
            this.addPillarToTask(task.id, pillarId);
        }else{
            console.warn(`${project.properties.Name.title[0].plain_text} does not have a Pillar assigned`)
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
        const tzo = -date.getTimezoneOffset();
        const dif = tzo >= 0 ? '+' : '-';
        const pad = function(num:number) {
            return (num < 10 ? '0' : '') + num;
        };
        
        return date.getFullYear() +
            '-' + pad(date.getMonth() + 1) +
            '-' + pad(date.getDate()) +
            'T' + pad(date.getHours()) +
            ':' + pad(date.getMinutes()) +
            ':' + pad(date.getSeconds()) +
            dif + pad(Math.floor(Math.abs(tzo) / 60)) +
            ':' + pad(Math.abs(tzo) % 60);
    }
}

export default Tasks;