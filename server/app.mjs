import express from "express";
import connectionPool from "./utils/db.mjs";

const app = express();
const port = 4001;

app.get("/test", (req, res) => {
  return res.json("Server API is working 🚀");
});

app.post("/assignments", async (req, res) => {
  
  const newAssignment = {
    ...req.body,
    created_at: new Date(),
    updated_at: new Date(),
    published_at: new Date(),
  };

  if (
    !newAssignment.title ||
    !newAssignment.content ||
    !newAssignment.category
  ) {
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
        1, // This is a mock user_id since we don't have an authentication system in the backend yet
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

app.get("/assignments", async (_, res) => {
  try {
    const result = await connectionPool.query("SELECT * FROM assignments");

    res.status(200).json({ data: result.rows });
  } catch (err) {
    console.error("Error fetching assignments:", err);
    res.status(500).json({
      message: "Server could not read assignment because database connection",
    });
  }
});

app.get("/assignments/:assignmentId", async (req, res) => {
  const { assignmentId } = req.params;

  try {
    const result = await connectionPool.query(
      "SELECT * FROM assignments WHERE id = $1",
      [assignmentId]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Server could not find a requested assignment" });
    }

    res.status(200).json({ data: result.rows[0] });
  } catch (err) {
    console.error("Error fetching assignment by ID:", err);
    res.status(500).json({
      message: "Server could not read assignment because database connection",
    });
  }
});

app.put("/assignments/:assignmentId", async (req, res) => {
  const { assignmentId } = req.params;
  const updatedAssignment = {
    ...req.body,
    updated_at: new Date(),
  };

  if (
    !updatedAssignment.title ||
    !updatedAssignment.content ||
    !updatedAssignment.category
  ) {
    return res.status(400).json({
      message:
        "Server could not update assignment because there are missing data from client",
    });
  }

  try {
    const result = await connectionPool.query(
      `UPDATE assignments SET title = $1, content = $2, category = $3, length = $4, user_id = $5, status = $6, updated_at = $7 WHERE id = $8 RETURNING *`,
      [
        updatedAssignment.title,
        updatedAssignment.content,
        updatedAssignment.category,
        updatedAssignment.length || 0,
        updatedAssignment.user_id || null,
        updatedAssignment.status || "draft",
        updatedAssignment.updated_at,
        assignmentId,
      ]
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "Server could not find the assignment to update" });
    }

    return res.status(200).json({
      message: "Updated assignment successfully",
      data: result.rows[0],
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      message: "Server could not update assignment because of a database error",
    });
  }
});

app.delete("/assignments/:assignmentId", async (req, res) => {
  const { assignmentId } = req.params;

  try {
    const result = await connectionPool.query(
      "DELETE FROM assignments WHERE id = $1 RETURNING *",
      [assignmentId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Server could not find a requested assignment to delete",
      });
    }

    res.status(200).json({ message: "Deleted assignment successfully" });
  } catch (err) {
    console.error("Error deleting assignment:", err);
    res.status(500).json({
      message: "Server could not delete assignment because database connection",
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
