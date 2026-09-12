import Enquiry from '../models/Enquiry.js';
import CatalogLead from '../models/CatalogLead.js';

// POST /api/enquiries - Submit a new enquiry (public)
export const submitEnquiry = async (req, res) => {
  try {
    const { firstName, lastName, phone, email, queryType, message } = req.body;
    if (!firstName || !lastName || !phone || !email || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }
    const enquiry = await Enquiry.create({ firstName, lastName, phone, email, queryType, message });
    res.status(201).json({ success: true, message: 'Enquiry submitted successfully!', enquiry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/enquiries - Get all enquiries (admin)
export const getAllEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.find().sort({ createdAt: -1 });
    const unreadCount = await Enquiry.countDocuments({ isRead: false });
    res.json({ success: true, enquiries, unreadCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/enquiries/:id/read - Mark enquiry as read (admin)
export const markAsRead = async (req, res) => {
  try {
    const enquiry = await Enquiry.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    if (!enquiry) return res.status(404).json({ success: false, message: 'Enquiry not found.' });
    res.json({ success: true, enquiry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/enquiries/:id - Delete an enquiry (admin)
export const deleteEnquiry = async (req, res) => {
  try {
    await Enquiry.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Enquiry deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/enquiries/catalog-leads - Submit a new catalog lead (public)
export const submitCatalogLead = async (req, res) => {
  try {
    const { name, phone } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Name and phone are required.' });
    }
    const lead = await CatalogLead.create({ name, phone });
    res.status(201).json({ success: true, message: 'Catalog lead submitted successfully!', lead });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/enquiries/catalog-leads - Get all catalog leads (admin)
export const getCatalogLeads = async (req, res) => {
  try {
    const leads = await CatalogLead.find().sort({ createdAt: -1 });
    res.json({ success: true, leads });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
