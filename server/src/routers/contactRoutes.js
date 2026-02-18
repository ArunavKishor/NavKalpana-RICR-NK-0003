import express from "express";
import { NewContact } from "../controllers/contactController.js";

const router = express.Router();

// Create New Contact Message
router.post("/new-contact", NewContact);

export default router;
