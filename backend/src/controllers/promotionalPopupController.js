import PromotionalPopup from '../models/PromotionalPopup.js';

// ─────────────────────────────────────────────────────────────
// @desc    Get highest-priority active popup (customer-facing)
// @route   GET /api/promotional-popups/active
// @access  Public
// ─────────────────────────────────────────────────────────────
export const getActivePopup = async (req, res) => {
  try {
    const now = new Date();

    const popup = await PromotionalPopup.findOne({
      isActive: true,
      $or: [
        { startDate: null, endDate: null },
        { startDate: { $lte: now }, endDate: null },
        { startDate: null, endDate: { $gte: now } },
        { startDate: { $lte: now }, endDate: { $gte: now } }
      ]
    })
      .sort({ priority: -1 })
      .populate('productRef', 'name price discount discountType discountedPrice images unit stock _id')
      .populate('comboRef', 'name comboPrice image _id')
      .lean();

    if (!popup) {
      return res.status(200).json({ success: true, popup: null });
    }

    res.status(200).json({ success: true, popup });
  } catch (error) {
    console.error('getActivePopup error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Get all popups (admin list)
// @route   GET /api/promotional-popups
// @access  Private/Admin
// ─────────────────────────────────────────────────────────────
export const getAllPopups = async (req, res) => {
  try {
    const popups = await PromotionalPopup.find()
      .populate('productRef', 'name price images _id')
      .populate('comboRef', 'name comboPrice image _id')
      .sort({ priority: -1, createdAt: -1 })
      .lean();

    res.status(200).json({ success: true, count: popups.length, popups });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Create a new popup
// @route   POST /api/promotional-popups
// @access  Private/Admin
// ─────────────────────────────────────────────────────────────
export const createPopup = async (req, res) => {
  try {
    const {
      title, subtitle, badgeText, image, popupType,
      productRef, comboRef, benefits, promoMessage,
      ctaText, viewMoreText, isActive, priority,
      displayDelayMs, displayOncePerSession, startDate, endDate
    } = req.body;

    // Basic required field validation
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }
    if (!image) {
      return res.status(400).json({ success: false, message: 'Popup image is required' });
    }
    if (!popupType || !['product', 'combo'].includes(popupType)) {
      return res.status(400).json({ success: false, message: 'popupType must be "product" or "combo"' });
    }
    if (popupType === 'product' && !productRef) {
      return res.status(400).json({ success: false, message: 'A product must be selected for product-type popups' });
    }
    if (popupType === 'combo' && !comboRef) {
      return res.status(400).json({ success: false, message: 'A combo must be selected for combo-type popups' });
    }

    const popup = await PromotionalPopup.create({
      title: title.trim(),
      subtitle: subtitle?.trim() || '',
      badgeText: badgeText?.trim() || '🎁 SURPRISE',
      image,
      popupType,
      productRef: popupType === 'product' ? productRef : null,
      comboRef: popupType === 'combo' ? comboRef : null,
      benefits: Array.isArray(benefits) ? benefits.filter(b => b && b.trim()).slice(0, 5) : [],
      promoMessage: promoMessage?.trim() || '',
      ctaText: ctaText?.trim() || 'Add to Cart',
      viewMoreText: viewMoreText?.trim() || 'View More',
      isActive: Boolean(isActive),
      priority: Number(priority) || 0,
      displayDelayMs: Number(displayDelayMs) || 1500,
      displayOncePerSession: displayOncePerSession !== false,
      startDate: startDate || null,
      endDate: endDate || null,
      createdBy: req.user._id
    });

    res.status(201).json({ success: true, popup });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Update a popup
// @route   PUT /api/promotional-popups/:id
// @access  Private/Admin
// ─────────────────────────────────────────────────────────────
export const updatePopup = async (req, res) => {
  try {
    const existing = await PromotionalPopup.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Popup not found' });
    }

    const {
      title, subtitle, badgeText, image, popupType,
      productRef, comboRef, benefits, promoMessage,
      ctaText, viewMoreText, isActive, priority,
      displayDelayMs, displayOncePerSession, startDate, endDate
    } = req.body;

    // Build update payload from whitelisted fields only (prevents mass assignment)
    const update = {};
    if (title !== undefined) update.title = title.trim();
    if (subtitle !== undefined) update.subtitle = subtitle.trim();
    if (badgeText !== undefined) update.badgeText = badgeText.trim();
    if (image !== undefined) update.image = image;
    if (popupType !== undefined) {
      if (!['product', 'combo'].includes(popupType)) {
        return res.status(400).json({ success: false, message: 'Invalid popupType' });
      }
      update.popupType = popupType;
      update.productRef = popupType === 'product' ? (productRef || null) : null;
      update.comboRef = popupType === 'combo' ? (comboRef || null) : null;
    }
    if (benefits !== undefined) update.benefits = Array.isArray(benefits) ? benefits.filter(b => b && b.trim()).slice(0, 5) : [];
    if (promoMessage !== undefined) update.promoMessage = promoMessage.trim();
    if (ctaText !== undefined) update.ctaText = ctaText.trim();
    if (viewMoreText !== undefined) update.viewMoreText = viewMoreText.trim();
    if (isActive !== undefined) update.isActive = Boolean(isActive);
    if (priority !== undefined) update.priority = Number(priority);
    if (displayDelayMs !== undefined) update.displayDelayMs = Number(displayDelayMs);
    if (displayOncePerSession !== undefined) update.displayOncePerSession = Boolean(displayOncePerSession);
    if (startDate !== undefined) update.startDate = startDate || null;
    if (endDate !== undefined) update.endDate = endDate || null;

    const updated = await PromotionalPopup.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true }
    ).populate('productRef', 'name price images _id').populate('comboRef', 'name comboPrice image _id');

    res.status(200).json({ success: true, popup: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Delete a popup
// @route   DELETE /api/promotional-popups/:id
// @access  Private/Admin
// ─────────────────────────────────────────────────────────────
export const deletePopup = async (req, res) => {
  try {
    const popup = await PromotionalPopup.findById(req.params.id);
    if (!popup) {
      return res.status(404).json({ success: false, message: 'Popup not found' });
    }
    await popup.deleteOne();
    res.status(200).json({ success: true, message: 'Popup deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
