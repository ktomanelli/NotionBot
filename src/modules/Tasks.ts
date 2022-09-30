import { Client } from '@notionhq/client';
import moment from 'moment';
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
                    status: {
                        name:"In progress"
                    }
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
                        "start": this.toIsoString(this.now()),
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
        return this.isDone(task) && !task.properties["Completed At"].date?.start;
    }

    private flaggedForDailyReset(task: Task): boolean{
        return this.isDaily(task) && this.isReadyForDailyReset(task) && this.isDone(task) && this.hasCompletedTimestampFromPreviousDay(task)
    }
    private flaggedForWeeklyReset(task: Task): boolean{
        return this.isWeekly(task) && this.isReadyForWeeklyReset(task) && this.isDone(task) && this.hasCompletedTimestampFromPreviousWeek(task)
    }
    private flaggedForMonthlyReset(task: Task): boolean{
        return this.isMonthly(task) && this.isReadyForMonthlyReset(task) && this.isDone(task) && this.hasCompletedTimestampFromPreviousMonth(task)
    }

    private flaggedForPillar(task: Task): boolean{
        const pillarIsEmpty = task.properties.Pillar.relation.length === 0
        return pillarIsEmpty && !this.isDone(task);
    }

    private flaggedForSyncParent(task:Task){
        return task.properties.Parent.relation.length > 0;//&& !this.isDone(task);
    }

    // check for task completed yesterday or today before 3am
    private hasCompletedTimestampFromPreviousDay(task: Task){
        const dateString = task.properties["Completed At"].date?.start;
        const date = dateString ? new Date(dateString) : false; 
        return date && (!this.isToday(date)||(this.isToday(date) && date.getHours()<4));
    }
    private hasCompletedTimestampFromPreviousWeek(task: Task){
        const date = task.properties["Completed At"].date?.start;
        return date && !this.isThisWeek(date);
    }
    private hasCompletedTimestampFromPreviousMonth(task: Task){
        const date = task.properties["Completed At"].date?.start;
        return date && !this.isThisMonth(date);
    }

    private isDone(task: Task){
        return task.properties.Status?.status?.name === 'Done';
    }

    private isReadyForDailyReset(task: Task){
        if(task.properties['Frequency Input'].date?.start && task.properties.Recurring.select?.name === 'Daily'){
            return this.timeHasPast(new Date(task.properties['Frequency Input'].date.start))
        }else{
            console.log(`Recurring task, "${task.properties.Title.title[0].plain_text}" does not have Frequency Input set, or has invalid 'Recurring' value!`)
        }
        return false
    }

    private isReadyForWeeklyReset(task:Task){
        if(task.properties['Frequency Input'].date && task.properties.Recurring.select?.name === 'Weekly'){
            return this.weekDayHasPast(new Date(task.properties['Frequency Input'].date.start))
        }else{
            console.log(`Recurring task, "${task.properties.Title.title[0].plain_text}" does not have Frequency Input set, or has invalid 'Recurring' value!`)
        }
        return false
    }

    private isReadyForMonthlyReset(task:Task){
        if(task.properties['Frequency Input'].date && task.properties.Recurring.select?.name === 'Monthly'){
            return this.dateHasPast(new Date(task.properties['Frequency Input'].date.start))
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
        const now = this.now();
        const currentMinutes = now.getHours()*60+now.getMinutes();
        const dateMinutes = date.getHours()*60+date.getMinutes();
        return currentMinutes >= dateMinutes;
    }

    private weekDayHasPast(date:Date){
        const today = this.now().getDay();
        const dateDay = date.getDay();
        return today >= dateDay;
    }

    private dateHasPast(date:Date){
        const today = this.now().getDate();
        const dateDay = date.getDate();
        return today >= dateDay || today >= new Date(date.getFullYear(), date.getMonth()+1, 0).getDate();
    }

    private isToday(date:Date){
        return (this.now().getDate() === date.getDate()
        &&  this.now().getMonth() === date.getMonth()
        && this.now().getFullYear() === date.getFullYear());
    }
    private isThisWeek(date:Date){
        return moment().isoWeek() === moment(date.toISOString()).isoWeek()
    }
    private isThisMonth(date:Date){
        return (this.now().getMonth() === date.getMonth() 
        && this.now().getFullYear() === date.getFullYear());
    }

    private now(){
        return new Date()
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