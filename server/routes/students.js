// Instantiate router - DO NOT MODIFY
const express = require('express');
const router = express.Router();

// Import model(s)
const { Student } = require('../db/models');
const { Op } = require("sequelize");

// List
router.get('/', async (req, res, next) => {
    let errorResult = { errors: [], count: 0, pageCount: 0 };

    // Phase 2A: Use query params for page & size
    // Your code here 
    let pagination = {}
    const page = req.query.page === undefined ? 1 : parseInt(req.query.page);
    const size = req.query.size === undefined ? 10 : parseInt(req.query.size);

    // Phase 2B: Calculate limit and offset
    // Phase 2B (optional): Special case to return all students (page=0, size=0)
    // Phase 2B: Add an error message to errorResult.errors of
        // 'Requires valid page and size params' when page or size is invalid
    // Your code here 
    if (page >= 1 && size >= 1 && size < 200) {
        pagination.limit = size;
        pagination.offset = size * (page - 1);
    } 
    else if(page == 0 && size == 0){
    } 
    else {
        errorResult.errors.push('Requires valid page and size params')
    }

    // Phase 4: Student Search Filters
    /*
        firstName filter:
            If the firstName query parameter exists, set the firstName query
                filter to find a similar match to the firstName query parameter.
            For example, if firstName query parameter is 'C', then the
                query should match with students whose firstName is 'Cam' or
                'Royce'.
        lastName filter: (similar to firstName)
            If the lastName query parameter exists, set the lastName query
                filter to find a similar match to the lastName query parameter.
            For example, if lastName query parameter is 'Al', then the
                query should match with students whose lastName has 'Alfonsi' or
                'Palazzo'.

        lefty filter:
            If the lefty query parameter is a string of 'true' or 'false', set
                the leftHanded query filter to a boolean of true or false
            If the lefty query parameter is neither of those, add an error
                message of 'Lefty should be either true or false' to
                errorResult.errors
    */
    const where = {};

    // Your code here phase 4
    const firstName = req.query.firstName
    if (firstName) {
        let search = firstName.split('').join('%')
        where.firstName = {
            [Op.like]: `%${search}%`
        };
    }
    const lastName = req.query.lastName
    if (lastName) {
        where.lastName = {
            [Op.like]: `%${lastName}%`
        };
    }

    const lefty = req.query.lefty;

    if (lefty !== undefined) {
        if (lefty !== 'true' && lefty !== 'false') {
            errorResult.errors.push('Lefty should be either true or false');
        } else {
            const boolean = leftyParam === 'true';
            where.leftHanded = boolean;
        }
    }


    // Phase 2C: Handle invalid params with "Bad Request" response
    if(errorResult.errors.length>=1){
        res.statusCode = 400;
        res.json(errorResult)
        return
    }
    // Phase 3C: Include total student count in the response even if params were
        // invalid
        /*
            If there are elements in the errorResult.errors array, then
            return a "Bad Request" response with the errorResult as the body
            of the response.

            Ex:
                errorResult = {
                    errors: [{ message: 'Grade should be a number' }],
                    count: 267,
                    pageCount: 0
                }
        */
    // Your code here 

    let result = {};

    // Phase 3A: Include total number of results returned from the query without
        // limits and offsets as a property of count on the result
        // Note: This should be a new query
    
    const {count ,rows} = await Student.findAndCountAll({
        attributes: ['id', 'firstName', 'lastName', 'leftHanded'],
        where,
        // Phase 1A: Order the Students search results
        order: [['lastName','ASC'],['firstName','ASC']],
        ...pagination
    });
    result.count = count
    result.rows = rows
    
    // Phase 2E: Include the page number as a key of page in the response data
        // In the special case (page=0, size=0) that returns all students, set
            // page to 1
        /*
            Response should be formatted to look like this:
            {
                rows: [{ id... }] // query results,
                page: 1
            }
        */
    // Your code here 
    result.page = page
    if(page == 0 && size == 0){
        result.page = 1
    } 
    // Phase 3B:
        // Include the total number of available pages for this query as a key
            // of pageCount in the response data
        // In the special case (page=0, size=0) that returns all students, set
            // pageCount to 1
        /*
            Response should be formatted to look like this:
            {
                count: 17 // total number of query results without pagination
                rows: [{ id... }] // query results,
                page: 2, // current page of this query
                pageCount: 10 // total number of available pages for this query
            }
        */
    // Your code here 
    result.pageCount = Math.ceil(count/size)

    res.json(result);
});

// Export class - DO NOT MODIFY
module.exports = router;
