import express from "express";
import {
  NewContact,
  GetAllContacts,
  DeleteContact,
} from "../controllers/contactController.js";

const router = express.Router();

// Create New Contact Message
router.post("/", NewContact);

// Get All Contact Messages (Admin)
router.get("/", GetAllContacts);

// Delete Contact Message
router.delete("/:id", DeleteContact);

export default router;
