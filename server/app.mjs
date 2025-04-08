import express from 'express';
import connectionPool from './utils/db.mjs';

const app = express();
const port = 4001;

app.use(express.json());

app.get('/test', (req, res) => {
   return res.json('Server API is working 🚀');
});

// app.get('/assigntments', async (req, res) => {
app.get('/users', async (req, res) => {
   //ดึงข้อมูลจาก database
   const data = await connectionPool.query(`select * from users limit 3`);
   //return ว่าดึงข้อมูลสำเร็จ
   return res.status(200).json(data);
});

app.post('/assignments', async (req, res) => {
   try {
      //  access ข้อมูลใน body จาก request ด้วย req.body
      const newAssignment = {
         ...req.body,
         created_at: new Date(),
         updated_at: new Date(),
         published_at: new Date(),
      };
      // เขียนquery เพื่อ insert data by connectionPool
      console.log('dataInput:  ', newAssignment);
      if (
         newAssignment.title &&
         newAssignment.content &&
         newAssignment.category
      ) {
         await connectionPool.query(
            `insert into assignments (title,content,category) 
            values($1,$2,$3)`,
            [newAssignment.title, newAssignment.content, newAssignment.category]
         );

         return res
            .status(200)
            .json({ message: 'Created assignment sucessfully' });
      }
      // หากไม่ใส่ข้อมูลให้return errer 400
      else {
         console.log('data fail Input');
         return res.status(400).json({
            message:
               'Server could not create assignment because there are missing data from client',
         });
      }

      // หากสร้างข้อมูลสำเร็จให้ return 200 sucessfully
   } catch (error) {
      // หากไม่พบ data ให้ return 500
      console.log(error);
      return res.status(500).json({
         message:
            'Server could not create assignment because database connection',
      });
   }
});

app.listen(port, () => {
   console.log(`Server is running at ${port}`);
});
