import express from 'express';
import connectionPool from './utils/db.mjs';

const app = express();
const port = 4001;

app.use(express.json());

app.get('/test', (req, res) => {
   return res.json('Server API is working 🚀');
});

// User สามารถดูข้อมูลแบบทดสอบทั้งหมดในระบบได้
app.get('/assignments', async (req, res) => {
   try {
      //ดึงข้อมูลจาก database
      const result = await connectionPool.query(`select * from assignments`);
      console.log('result: ', result);
      //return ว่าดึงข้อมูลสำเร็จ แสดง ข้อมูลเป็น row
      return res.status(200).json({ data: result.rows });
   } catch (error) {
      // หากไม่สามารถเข้า databaseให้แสดงข้อผิดพลาด}
      return res.status(500).json({
         message:
            'Server could not read assignment because database connection',
      });
   }
});

// User สามารถดูข้อมูลแบบทดสอบอันเดียวได้
app.get('/assignments/:assignmentId', async (req, res) => {
   try {
      // กำหนดตัวแปร รับค่า params ด้วย req.params.assignmentId
      const assignmentIdFromClient = req.params.assignmentId;
      if (assignmentIdFromClient) {
         //ดึงข้อมูลจาก database โดยอ้างอิงจาก params id
         const result = await connectionPool.query(
            `select * from assignments where assignment_id=$1`,
            [assignmentIdFromClient]
         );
         //return ว่าดึงข้อมูลสำเร็จ แสดง ข้อมูลเป็น row
         return res.status(200).json({ data: result.rows });
      } else {
         // หาไม่มีassignmentId ให้แสดงerror 400
         return res
            .status(404)
            .json({ message: 'Server could not find a requested assignment' });
      }
      // หากไม่สามารถเข้า databaseให้แสดงข้อผิดพลาด}
   } catch (error) {
      return res.status(500).json({
         message:
            'Server could not read assignment because database connection',
      });
   }
});

// User สามารถแก้ไขแบบทดสอบที่ได้เคยสร้างไว้ก่อนหน้านี้
app.put('/assignments/:assignmentId', async (req, res) => {
   // กำหนดตัวแปร รับค่า params ด้วย req.params.assignmentId
   const assignmentIdFromClient = req.params.assignmentId;
   // console.log('assignmentIdFromClient: ', assignmentIdFromClient);
   // กำหนด date to Update
   const updatedAssignment = { ...req.body, updated_at: new Date() };
   try {
      if (assignmentIdFromClient) {
         //ดึงข้อมูลจาก database โดยอ้างอิงจาก params id
         const result = await connectionPool.query(
            `update assignments 
            set title=$2,
            content =$3,
            category=$4,
            updated_at=$5
            where assignment_id=$1`,
            [
               assignmentIdFromClient,
               updatedAssignment.title,
               updatedAssignment.content,
               updatedAssignment.category,
               updatedAssignment.updated_at,
            ]
         );
         // console.log('result: ', result);
         //return ว่าดึงข้อมูลสำเร็จ แสดง ข้อมูลเป็น row
         return res
            .status(200)
            .json({ message: 'Updated assignment sucessfully' });
      } else {
         // หาไม่มีassignmentId ให้แสดงerror 400
         return res.status(404).json({
            message: 'Server could not find a requested assignment to update',
         });
      }
      // หากไม่สามารถเข้า databaseให้แสดงข้อผิดพลาด}
   } catch (error) {
      console.log('error: ', error);
      return res.status(500).json({
         message:
            'Server could not update assignment because database connection',
      });
   }
});
// User สามารถลบแบบทดสอบที่ได้เคยสร้างไว้ก่อนหน้านี้
app.delete('/assignments/:assignmentId', async (req, res) => {
   // กำหนดตัวแปร รับค่า params ด้วย req.params.assignmentId
   const assignmentIdFromClient = req.params.assignmentId;
   try {
      //ดึงข้อมูลจาก database โดยอ้างอิงจาก params id
      try {
         const result = await connectionPool.query(
            `delete from assignments where assignment_id=$1`,
            [assignmentIdFromClient]
         );
         //return ว่าดึงข้อมูลสำเร็จ แสดง ข้อมูลเป็น row
         return res
            .status(200)
            .json({ message: 'Deleted assignment sucessfully' });
      } catch (e) {
         // หาไม่มีassignmentId ให้แสดงerror 400
         return res.status(404).json({
            message: 'Server could not find a requested assignment to delete',
         });
      }
      // หากไม่สามารถเข้า databaseให้แสดงข้อผิดพลาด}
   } catch (error) {
      return res
         .status(500)
         .json({
            message:
               'Server could not delete assignment because database connection',
         });
   }
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
            `insert into assignments (title,content,category,published_at) 
            values($1,$2,$3,$4)`,
            [
               newAssignment.title,
               newAssignment.content,
               newAssignment.category,
               newAssignment.published_at,
            ]
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
