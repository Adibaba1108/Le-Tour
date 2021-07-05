class APIFeatures {
    constructor(query, queryString) {
      this.query = query; //this is mongoose query,it will be getting manipulated by all the other methods
      this.queryString = queryString; //this is the query string that we get from express(req.query)coming from the router
    }
  //Build QUERY we won't make it await as we will need to add sort page limit,etc fields to it too.

    filter() {
      const queryObj = { ...this.queryString };//this is done because we need to have a hard copy of the req.query object so that we can iterate through it and can delete page sort ,etc query as these won't be there in the documents and have to be applied afterwards.
      const excludedFields = ['page', 'sort', 'limit', 'fields'];  //these fields needed to be excluded as discussed in above comment.
      excludedFields.forEach(el => delete queryObj[el]); //deleting the excludedfileds if they are present in the query and we are deleting it from the hard copy.
  
      // 1B) Advanced filtering
      let queryStr = JSON.stringify(queryObj); //to convert the queryObj(JSON->string)//we took a let variable because we have to change it
      queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    //This is done because->gen syntax of writng a query->{difficulty:'easy,duration :{$gte :5}}
    //what req.query will log->{difficulty:'easy,duration :{gte :5}}...just the "$" sign is miising so we replace all the gt,gte,lt and lte with $ sign before it via regex
        
      this.query = this.query.find(JSON.parse(queryStr));//find here returns a query ,so can use async and await,but here we will not use await as this is not the final req,we have to add other fields also like page,limit ,etc.
      //also as Find() will retrun a query then we can add many more filtering methods that are present in the query object like done below.
     //we use let as many more function will be chaining with it.
  
      return this;
    }
  //2]Sorting //mongoose provide us an inbuilt function that can be easily be applied at a query object
    sort() {
      if (this.queryString.sort) {
        const sortBy = this.queryString.sort.split(',').join(' ');//As there can be multiple argument in the sort all will be separated initially by ',' and then we replace it by space and then put it the string in sort method
        this.query = this.query.sort(sortBy);
      } else {
        this.query = this.query.sort('-createdAt'); //if nothing is given just sort according to the tym that particular doc is created
      }
  
      return this;
    }
  
    //3]Field Limiting

    limitFields() {
      if (this.queryString.fields) {
        const fields = this.queryString.fields.split(',').join(' ');
        this.query = this.query.select(fields);//select is like a projection here for eg of what we want
      } else {
        this.query = this.query.select('-__v');//all except __v field .
      }
  
      return this;
    }
  //PAGINATION
    paginate() {
      const page = this.queryString.page * 1 || 1;//default value as 1
      const limit = this.queryString.limit * 1 || 100; //default value as 100
      const skip = (page - 1) * limit;//skip this much result
  
      this.query = this.query.skip(skip).limit(limit);
  
      return this;
    }
  }
  module.exports = APIFeatures;
  