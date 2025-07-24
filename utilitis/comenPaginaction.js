
const comanPaginaction = async (model,query={},reqOuery={},opctions = {})=>{

    const {page = 1,limit =5,sort = "-createdAt"} = reqOuery;

    const paginactionOpctions = {
        page:parseInt(page),
        limit:parseInt(limit),
        sort,
        ...opctions
    }

    try {
       const result = await model.paginate(query,paginactionOpctions);   
       return {
            data:result.docs,
            totalDocs: result.totalDocs,
            limit: result.limit,
            totalPages: result.totalPages,
            currentPage: result.page,
            Counter: result.pagingCounter,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevPage: result.prevPage,
            nextPage: result.nextPage,
       }
    } catch (error) {
        console.log(error);
    }
    

}

export default comanPaginaction 