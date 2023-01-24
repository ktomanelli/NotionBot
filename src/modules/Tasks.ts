import { Client } from '@notionhq/client';
import { PageObjectResponse, PropertyItemListResponse, PropertyItemPropertyItemListResponse } from '@notionhq/client/build/src/api-endpoints';
import moment from 'moment';
import { tasksDatabaseId } from '../config';
import NotionDatabase from './NotionDatabase';
// todo:
// add due dates to tasks based on startdate and size
class Tasks extends NotionDatabase {
    constructor(client:Client){
        super(client, tasksDatabaseId);
    }

    public override async handleCreate(task:PageObjectResponse){
        if(this.flaggedForPillar(task)){
            this.SetPillarOnTask(task);
        }
        if(this.flaggedForSyncParent(task)){
            this.SyncParent(task);
        }
    }
    public override async handleUpdate(){
        throw new Error("Not Implemented")
    }
    public override async handleDelete(){
        throw new Error("Not Implemented")
    }

    public async SyncParent(task:PageObjectResponse){
        try{
            const parent = task;
            const subtasks = task.properties['Sub-Tasks'].type === 'relation' ? task.properties['Sub-Tasks'].relation : []
            for(const item of subtasks) {
                const subTask = await this.getPage(item.id);
                const options:any = {}
                const status = this.isDone(parent) && !this.isDone(subTask)
                if(status){
                    options.Status = {
                        status: {
                            name:"Done"
                        }
                    }
                }
                const projectId = parent.properties.Project.type === 'relation' ? parent.properties.Project.id : null;
                if(projectId && !this.HasProject(subTask)){
                    options.Project = {
                        relation: [
                            {id: projectId}
                        ]
                    }
                }
                const pillarId = parent.properties.Pillar.type === 'relation' ? parent.properties.Pillar.relation[0]?.id : null;
                if(pillarId && !this.HasPillar(subTask)){
                    options.Pillar = {
                        relation: [
                            {id: pillarId}
                        ]
                    }
                }
                const sprintId = parent.properties.Sprint.type === 'relation'? parent.properties.Sprint.relation[0]?.id : null;
                if(sprintId){
                    options.Sprint = {
                        relatation:[
                            {id: sprintId}
                        ]
                    }
                }
                const frequencyInput = parent.properties['Frequency Input'].type === 'date' ? parent.properties['Frequency Input'].date?.start : null;
                if(frequencyInput){
                    options["Frequency Input"] = {
                        date:{
                            start: this.toIsoString(new Date(frequencyInput)),
                            "time_zone": "America/New_York"
                        }
                    }
                }
                const recurring = parent.properties.Recurring.type === 'select' ? parent.properties.Recurring.select?.name : null;
                if(recurring){
                    options.Recurring = {
                        select:{
                            name: recurring
                        }
                    }
                }
                await this.updatePage(subTask.id, options)
            }
        }catch(e){
            console.log('error in SyncParent')
        }
    }

    public async SetDaily(task:PageObjectResponse){
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

    public async SetWeekly(task:PageObjectResponse){
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
    public async SetMonthly(task:PageObjectResponse){
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

    public async SetCompletedAt(task: PageObjectResponse){
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

    public async SetPillarOnTask(task: PageObjectResponse){
        try{
            const projectId = this.GetProject(task);
            if(projectId){
                const project = await this.getPage(projectId) as any;
                const pillarId = project.properties.Pillars.relation[0]?.id
                if(pillarId){
                    this.addPillarToTask(task.id, pillarId);
                }else{
                    console.warn(`${this.GetTitle(project)} does not have a Pillar assigned`)
                }
            }else{
                console.warn(`${this.GetTitle(task)} doesnt have a project assigned`)
            }
        }catch(e){
            console.log('error in SetPillarOnTask')
        }
    }

    private flaggedForCompletedAt(task: PageObjectResponse): boolean{
        return this.isDone(task) && !this.HasCompletedAt(task)
    }

    private flaggedForDailyReset(task: PageObjectResponse): boolean{
        return this.isDaily(task) && this.isReadyForDailyReset(task) && this.isDone(task) && this.hasCompletedTimestampFromPreviousDay(task)
    }
    private flaggedForWeeklyReset(task: PageObjectResponse): boolean{
        return this.isWeekly(task) && this.isReadyForWeeklyReset(task) && this.isDone(task) && this.hasCompletedTimestampFromPreviousWeek(task)
    }
    private flaggedForMonthlyReset(task: PageObjectResponse): boolean{
        return this.isMonthly(task) && this.isReadyForMonthlyReset(task) && this.isDone(task) && this.hasCompletedTimestampFromPreviousMonth(task)
    }

    private flaggedForPillar(task: PageObjectResponse): boolean{
        return !this.HasPillar(task) && !this.isDone(task);
    }

    private flaggedForSyncParent(task:PageObjectResponse){
        return this.HasSubTasks(task);
    }

    private HasSubTasks(task:PageObjectResponse){
        if(task.properties["Sub-Tasks"].type === 'relation'){
            return !!task.properties["Sub-Tasks"].relation.length
        }
        return false;
    }

    private HasProject(task:PageObjectResponse){
        if(task.properties.Project.type === 'relation'){
            return !!task.properties.Project.relation.length
        }
        return false;
    }
    private HasPillar(task:PageObjectResponse){
        if(task.properties.Pillar.type === 'relation'){
            return !!task.properties.Pillar.relation.length
        }
        return false;
    }

    private HasCompletedAt(task:PageObjectResponse){
        if(task.properties["Completed At"].type === 'date'){
            return !!task.properties["Completed At"].date?.start;
        }
        return false;
    }

    private HasFrequencyInput(task:PageObjectResponse){
        if(task.properties["Frequency Input"].type === 'date'){
            return !!task.properties["Frequency Input"].date?.start;
        }
        return false;
    }
    private GetProject(task:PageObjectResponse){
        if(task.properties.Project.type === 'relation'){
            return task.properties.Project.relation[0].id;
        }
        return null;
    }
    private GetFrequencyInput(task:PageObjectResponse):string{
        if(task.properties["Frequency Input"].type === 'date'){
            return task.properties["Frequency Input"].date ?task.properties["Frequency Input"].date.start : '';
        }
        return '';
    }
    private GetTitle(task:PageObjectResponse){
        if(task.properties.Title.type === 'title'){
            return task.properties.Title.title[0].plain_text;
        }
        return '';
    }
    private GetCompletedAt(task:PageObjectResponse){
        if(task.properties["Completed At"].type === 'date'){
            return task.properties["Completed At"].date ? task.properties["Completed At"].date.start : '';
        }
        return '';
    }
    // check for task completed yesterday or today before 3am
    private hasCompletedTimestampFromPreviousDay(task: PageObjectResponse){
        const dateString = this.GetCompletedAt(task);
        const date = dateString ? new Date(dateString) : false; 
        return date && (!this.isToday(date)||(this.isToday(date) && date.getHours()<4));
    }
    private hasCompletedTimestampFromPreviousWeek(task: PageObjectResponse){
        const dateString = this.GetCompletedAt(task);
        const date = dateString ? new Date(dateString) : false; 
        return date && !this.isThisWeek(date);
    }
    private hasCompletedTimestampFromPreviousMonth(task: PageObjectResponse){
        const dateString = this.GetCompletedAt(task);
        const date = dateString ? new Date(dateString) : false; 
        return date && !this.isThisMonth(date);
    }

    private isDone(task: PageObjectResponse){
        if(task.properties.Status.type === 'status'){
            return task.properties.Status.status?.name === 'Done';
        } 
        return false;
    }

    private isReadyForDailyReset(task: PageObjectResponse){
        if(this.HasFrequencyInput(task) && this.isDaily(task)){
            return this.timeHasPast(new Date(this.GetFrequencyInput(task)))
        }else{
            console.log(`Recurring task, "${this.GetTitle(task)}" does not have Frequency Input set, or has invalid 'Recurring' value!`)
        }
        return false
    }

    private isReadyForWeeklyReset(task:PageObjectResponse){
        if(this.HasFrequencyInput(task) && this.isWeekly(task)){
            return this.weekDayHasPast(new Date(this.GetFrequencyInput(task)))
        }else{
            console.log(`Recurring task, "${this.GetTitle(task)}" does not have Frequency Input set, or has invalid 'Recurring' value!`)
        }
        return false
    }

    private isReadyForMonthlyReset(task:PageObjectResponse){
        if(this.HasFrequencyInput(task) && this.isMonthly(task)){
            return this.dateHasPast(new Date(this.GetFrequencyInput(task)))
        }else{
            console.log(`Recurring task, "${this.GetTitle(task)}" does not have Frequency Input set, or has invalid 'Recurring' value!`)
        }
        return false
    }

    private isDaily(task: PageObjectResponse){
        if(task.properties.Recurring.type === 'select'){
            return task.properties.Recurring?.select?.name === 'Daily'
        }
        return false;
    }

    private isWeekly(task: PageObjectResponse){
        if(task.properties.Recurring.type === 'select'){
            return task.properties.Recurring?.select?.name === 'Weekly'
        }
        return false;
    }

    private isMonthly(task: PageObjectResponse){
        if(task.properties.Recurring.type === 'select'){
            return task.properties.Recurring?.select?.name === 'Monthly'
        }
        return false;
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