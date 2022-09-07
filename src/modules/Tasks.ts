import { Client } from '@notionhq/client';
import { PageObjectResponse, QueryDatabaseResponse } from '@notionhq/client/build/src/api-endpoints';
import { tasksDatabaseId, taskFilter } from '../config';
import NotionDatabase from './NotionDatabase';

//put pillars on tasks from projects
//add due dates to tasks

class Tasks extends NotionDatabase {
    constructor(client:Client){
        super(client, {database_id:tasksDatabaseId, filter:taskFilter as any});
    }

    public async DoWork(tasks:any){
        for(const task of tasks.results){
            this.setPillarOnTasks(task);
        }
    }
    
    private async setPillarOnTasks(task: any){
        const projectId = task.properties.Project.relation[0]?.id;
        const project = await this.getPage(projectId) as any;
        const pillarId = project.properties.Pillars.relation[0]?.id
        if(pillarId){
            this.addPillarToTask(task.id, pillarId);
        }else{
            console.warn(`${project.properties.Name.title[0].plain_text} does not have a Pillar assigned`)
        }
    }

    private async addPillarToTask(taskId:string, pillarId:string){
        const options = {
            Pillar: {
                relation: [
                    {id:pillarId}
                ]
            }
        }
        await this.updatePage(taskId, options)
    }

    private async getPage(page_id: string){
        const page = await this.client.pages.retrieve({page_id});
        return page;
    }

    private async updatePage(page_id:string, options:any){
        const page = await this.client.pages.update({page_id,properties:options});
        return page;
    }

}

export default Tasks;