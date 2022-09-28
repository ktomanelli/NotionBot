import { Client } from '@notionhq/client';
import { tasksDatabaseId } from '../config';
import Queue from '../Queue';
import { Action } from '../types/Action';
import { Task } from '../types/Task';
import NotionDatabase from './NotionDatabase';

// todo:
// add due dates to tasks based on startdate and size
class Tasks extends NotionDatabase {
    constructor(client:Client, queue: Queue){
        super(client, queue, tasksDatabaseId);
    }

    public async GenerateMessagesForQueue(notionResp: any): Promise<void>{

        console.log(notionResp.results.length)
        for(const task of notionResp.results as Task[]){
            if(this.flaggedForPillar(task)){
                this.PutMessageOnQueue({object: this, action: Action.SetPillarOnTask, item: task});
            }
            if(this.flaggedForCompletedAt(task)){
                this.PutMessageOnQueue({object: this, action: Action.SetCompletedAt, item: task});
            }
            if(this.flaggedForDailyReset(task)){
                this.PutMessageOnQueue({object: this, action: Action.SetDaily, item: task});
            }
            if(this.flaggedForWeeklyReset(task)){
                this.PutMessageOnQueue({object: this, action: Action.SetWeekly, item: task});
            }
            if(this.flaggedForMonthlyReset(task)){
                this.PutMessageOnQueue({object: this, action: Action.SetMonthly, item: task});
            }
            if(this.flaggedForSyncParent(task)){
                this.PutMessageOnQueue({object: this, action: Action.SyncParent, item: task});
            }
        }
    }

    public async SyncParent(task:Task){
        try{
            const parent = await this.getPage(task.properties.Parent.relation[0].id) as Task;
            const options:any = {}
            const status = this.isDone(parent) && !this.isDone(task)
            if(status){
                options.Status = {
                    status: {
                        name:"Done"
                    }
                }
            }
            const projectId = parent.properties.Project?.relation[0]?.id;
            if(projectId && task.properties.Project.relation.length === 0){
                options.Project = {
                    relation: [
                        {id: projectId}
                    ]
                }
            }
            const pillarId = parent.properties.Pillar?.relation[0]?.id;
            if(pillarId && task.properties.Pillar.relation.length === 0){
                options.Pillar = {
                    relation: [
                        {id: pillarId}
                    ]
                }
            }
            const sprintId = parent.properties.Sprint?.relation[0]?.id;
            if(sprintId){
                options.Sprint = {
                    relatation:[
                        {id: sprintId}
                    ]
                }
            }
            const frequencyInput = parent.properties['Frequency Input'].date?.start;
            if(frequencyInput){
                options["Frequency Input"] = {
                    date:{
                        start: this.toIsoString(new Date(frequencyInput))
                    }
                }
            }
            const recurring = parent.properties.Recurring.select?.name;
            if(recurring){
                options.Recurring = {
                    select:{
                        name: recurring
                    }
                }
            }
            await this.updatePage(task.id, options)
        }catch(e){
            console.log('error in SyncParent')
        }
    }

    public async SetDaily(task:Task){
        try{
            const options = {
                "Completed At":{
                    date: null
                },
                "Status": {
                    status: "In progress"
                }
            }
            await this.updatePage(task.id, options)
        }catch(e){
            console.log('error in SetDaily')
        }
    }
    public async SetWeekly(task:Task){
        try{
            const options = {
                "Completed At":{
                    date: null
                },
                "Status": {
                    status: "In progress"
                }
            }
            await this.updatePage(task.id, options)
        }catch(e){
            console.log('error in SetWeekly')
        }
    }
    public async SetMonthly(task:Task){
        try{
            const options = {
                "Completed At":{
                    date: null
                },
                "Status": {
                    status: "In progress"
                }
            }
            await this.updatePage(task.id, options)
        }catch(e){
            console.log('error in Set Monthly')
        }
    }

    public async SetCompletedAt(task: Task){
        try{
            const options = {
                "Completed At":{
                    date: {
                        "start": this.toIsoString(new Date()),
                        "time_zone": "America/New_York"
                    }
                }
            }
            await this.updatePage(task.id, options)
        }catch(e){
            console.log('error in SetCompletedAt')
        }
    }

    public async SetPillarOnTask(task: Task){
        try{
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
        }catch(e){
            console.log('error in SetPillarOnTask')
        }
    }

    private flaggedForCompletedAt(task: Task): boolean{
        return this.isDone(task) && !this.hasCompletedTimestamp(task);
    }

    private flaggedForDailyReset(task: Task): boolean{
        return this.isDaily(task) && this.isReadyForDailyReset(task) && this.isDone(task) && this.hasCompletedTimestamp(task)
    }
    private flaggedForWeeklyReset(task: Task): boolean{
        return this.isWeekly(task) && this.isReadyForWeeklyReset(task) && this.isDone(task) && this.hasCompletedTimestamp(task)
    }
    private flaggedForMonthlyReset(task: Task): boolean{
        return this.isMonthly(task) && this.isReadyForMonthlyReset(task) && this.isDone(task) && this.hasCompletedTimestamp(task)
    }

    private flaggedForPillar(task: Task): boolean{
        const pillarIsEmpty = task.properties.Pillar.relation.length === 0
        return pillarIsEmpty && !this.isDone(task);
    }

    private flaggedForSyncParent(task:Task){
        return task.properties.Parent.relation.length > 0;//&& !this.isDone(task);
    }

    private hasCompletedTimestamp(task: Task){
        return task.properties["Completed At"].date !== null;
    }

    private isDone(task: Task){
        return task.properties.Status?.status?.name === 'Done';
    }

    private isReadyForDailyReset(task: Task){
        if(task.properties['Frequency Input'].date && task.properties.Recurring.select?.name === 'Daily'){
            return this.timeHasPast(new Date(task.properties['Frequency Input'].date))
        }else{
            console.log(`Recurring task, "${task.properties.Title.title[0].plain_text}" does not have Frequency Input set, or has invalid 'Recurring' value!`)
        }
        return false
    }

    private isReadyForWeeklyReset(task:Task){
        if(task.properties['Frequency Input'].date && task.properties.Recurring.select?.name === 'Weekly'){
            return this.weekDayHasPast(new Date(task.properties['Frequency Input'].date))
        }else{
            console.log(`Recurring task, "${task.properties.Title.title[0].plain_text}" does not have Frequency Input set, or has invalid 'Recurring' value!`)
        }
        return false
    }

    private isReadyForMonthlyReset(task:Task){
        if(task.properties['Frequency Input'].date && task.properties.Recurring.select?.name === 'Monthly'){
            return this.dateHasPast(new Date(task.properties['Frequency Input'].date))
        }else{
            console.log(`Recurring task, "${task.properties.Title.title[0].plain_text}" does not have Frequency Input set, or has invalid 'Recurring' value!`)
        }
        return false
    }

    private isDaily(task: Task){
        return task.properties.Recurring?.select?.name === 'Daily'
    }

    private isWeekly(task: Task){
        return task.properties.Recurring?.select?.name === 'Weekly'
    }

    private isMonthly(task: Task){
        return task.properties.Recurring?.select?.name === 'Monthly'
    }

    private timeHasPast(date:Date){
        const now = new Date();
        const currentMinutes = now.getHours()*60+now.getMinutes();
        const dateMinutes = date.getHours()*60+date.getMinutes();
        return currentMinutes <= dateMinutes;
    }

    private weekDayHasPast(date:Date){
        const today = new Date().getDay();
        const dateDay = date.getDay();
        return today <= dateDay;
    }

    private dateHasPast(date:Date){
        const today = new Date().getDate();
        const dateDay = date.getDate();
        return today <= dateDay || today <= new Date(date.getFullYear(), date.getMonth()+1, 0).getDate();
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