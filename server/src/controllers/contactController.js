import Contact from "../models/contactModels.js";

/**
 * @desc    Create New Contact Message
 * @route   POST /api/contact
 * @access  Public
 */
export const NewContact = async (req, res, next) => {
  try {
    const { fullName, email, mobileNumber, message } = req.body;

    // Validation
    if (!fullName || !email || !mobileNumber || !message) {
      const error = new Error("All fields are required");
      error.statusCode = 400;
      return next(error);
    }

    const newContact = await Contact.create({
      fullName,
      email,
      mobileNumber,
      message,
    });

    console.log("New Contact Message:", newContact._id);

    res.status(201).json({
      success: true,
      message:
        "Thanks for contacting us. We will get back to you within 24-48 hours.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get All Contact Messages
 * @route   GET /api/contact
 * @access  Admin
 */
export const GetAllContacts = async (req, res, next) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Contact messages fetched successfully",
      data: contacts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete Contact Message
 * @route   DELETE /api/contact/:id
 * @access  Admin
 */
export const DeleteContact = async (req, res, next) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      const error = new Error("Resource not found");
      error.statusCode = 404;
      return next(error);
    }

    await contact.deleteOne();

    res.status(200).json({
      success: true,
      message: "Contact message deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
