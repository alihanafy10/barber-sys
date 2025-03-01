import { Injectable } from "@nestjs/common";

@Injectable()
export class ApiFeatures{
    //mongooseQuery=> model
    //query=> req.query
    constructor( ) {}
    
    async filter_sort_pagination(mongooseQuery:any,query:any,select?:any,populate?:any) {
        const options:any = {}
        const { page = 1, limit = 10, sort, ...filters } = query;
        //populate
        if (populate) {
          options.populate = populate ;
        }
        //selecting
        if (select) {
            options.select={select}
        }
        //sort
        if (sort) {
            const sortObj = Object.entries(sort).reduce((acc, [key, value]) => {
                acc[key] = parseInt(value as string); // convert to number
          return acc;
            }, {});
            
            options.sort = sortObj;
        }
        //filter
        const stringfilters = JSON.stringify(filters);
        const replacefilters = stringfilters.replaceAll(
            /gt|gte|lt|lte/g,
            (ele) => `$${ele}`
        );
        const parsefilters = JSON.parse(replacefilters);
        //pagination
        const skip = (page - 1) * limit;
        options.page = page
        options.limit = limit
        options.skip = skip
        
        try {
            const data = await mongooseQuery.paginate(parsefilters, options);
            return data;
          } catch (error) {
            throw new Error(`Error during pagination: ${error.message}`);
          }
    }
}
 