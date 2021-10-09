
// this class make my code resuable and maintainable

class ApiFeatures{
    // I need the values of query from db
    // I need the query string on which I will take the filtration action
    constructor(query, queryString){
        this.query = query                      // Tour.find()
        this.queryString = queryString          // 
    }

    filter(){
        // 1A) implement filer
        const queryObj = {... this.queryString}
        const excludedFields = ['page', 'sort', 'limit', 'fields']
        excludedFields.forEach(el=> delete queryObj[el])

        // 1B) Advanced filer
        let queryStr = JSON.stringify(queryObj)
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, match=> `$${match}`)
        this.query = this.query.find(JSON.parse(queryStr))
        return this
    }
    
    sort(){
        // 2) Sorting results
        if(this.queryString.sort){
            const sortBy =this.queryString.sort.split(',').join(' ')
            this.query = this.query.sort(sortBy)
        }
        else{
            this.query = this.query.sort('-createdAt')
        }
        return this
    }

    limitFields(){
        // 3) Limiting fields
        if(this.queryString.fields){
            const fields = this.queryString.fields.split(',').join(' ')
            this.query = this.query.select(fields)
        }
        else{
            this.query = this.query.select('-__v')
        }
        return this
    }

    paginate(){
        // 4) Pagination
        const page = this.queryString.page*1 || 1
        const limit = this.queryString.limit*1 || 100
        const skip = (page - 1) * limit
        this.query = this.query.skip(skip).limit(limit)
        return this
    }

}

module.exports = ApiFeatures