import express from "express";
import connectionPool from "./utils/db.mjs";

const app = express();
const port = 4002;

app.use(express.json());

app.get("/test", (_, res) => {
  return res.json("Server API is working 🚀");
});

app.post("/assignments", async (req, res) => {
  
  const newAssignment = {
    ...req.body,
    created_at: new Date(),
    updated_at: new Date(),
    published_at: new Date(),
  };
  // Check missing data
  if (!newAssignment.title || !newAssignment.content || !newAssignment.category) {
    return res.status(400).json({
      message:
        "Server could not create assignment because there are missing data from client",
    });
  }

  try {
    await connectionPool.query(
      `insert into assignments (user_id, title, content, category, length, created_at, updated_at, published_at, status)
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        1, // นี่คือ user_id ที่ถูกจำลองขึ้นมา เนื่องจากเรายังไม่มีระบบ Authentication ในส่วน Back End
        newAssignment.title,
        newAssignment.content,
        newAssignment.category,
        newAssignment.length,
        newAssignment.created_at,
        newAssignment.updated_at,
        newAssignment.published_at,
        newAssignment.status,
      ]
    );

    return res.status(201).json({
      message: "Created assignment successfully",
    });
  } catch (error) {
    console.error("Database error:", error.message);
    return res.status(500).json({
      message: "Server could not create assignment because database connection",
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
