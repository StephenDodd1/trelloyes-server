const express = require('express')
const { v4: uuid } = require('uuid')
const logger = require('../logger')
const { cards, lists } = require('../store')

const listRouter = express.Router()
const bodyParser = express.json()

listRouter
  .route('/list')
  .get((req, res) => {
   res
      .json(lists)
   })
  .post(bodyParser, (req, res) => {
   const { header, cardIds = [] } = req.body;
 
   if (!header) {
     logger.error(`header is required`);
     return res
       .status(400)
       .send('invalid data');
   }
 
   if (cardIds.length > 0) {
      let valid = true;
      cardIds.forEach(cid => {
         const card = cards.find(c => c.id == cid);
         if (!card) {
            logger.error(`card with id ${cid} not found`);
            valid = false;
         }
      });
 
      if (!valid) {
         return res
            .status(400)
            .send('invalid data');
      }
   }
 
   const id = uuid();
 
   const list = {
      id,
      header,
      cardIds
   };
 
   lists.push(list);
 
   logger.info(`List with id ${id} created`);
 
   res
      .status(201)
      .location(`http://localhost:8000/list/${id}`)
      .json({id});  
   })

listRouter
  .route('/list/:id')
  .get((req, res) => {
   const { id } = req.params;
   const list = lists.find(li => li.id == id);
 
   if (!list) {
     logger.error(`List with id ${id} not found.`);
     return res
       .status(404)
       .send('List Not Found');
   }
   res.json(list);
   })
  .delete((req, res) => {
   const { id } = req.body;
   const listIndex = lists.findIndex(li => li.id == id)
   if (listIndex === -1) {
      logger.error(`list with ${id} not found`);
      return res
         .status(400)
         .send('not found')
   }
   lists.splice(listIndex, 1)
   logger.info(`list with ${id} deleted`);
   res
      .status(204)
      .end();  
   })

module.exports = listRouter