import Order from '../models/Order.js';
import shippingService from '../services/shipping.service.js';

export const createShipment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const config = req.body;
    const order = await Order.findById(orderId).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const result = await shippingService.createShipment(order, config);
    
    res.status(200).json({ 
      success: true, 
      message: 'Shipment created successfully',
      shipments: result.shipments,
      result 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const trackShipment = async (req, res) => {
  try {
    const { waybill } = req.params;
    if (!waybill) {
      return res.status(400).json({ success: false, message: 'Waybill is required' });
    }

    const result = await shippingService.trackShipment(waybill);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelShipment = async (req, res) => {
  try {
    const { waybill } = req.params;
    if (!waybill) {
      return res.status(400).json({ success: false, message: 'Waybill is required' });
    }

    const result = await shippingService.cancelShipment(waybill);
    res.status(200).json({ success: true, message: 'Shipment cancelled', result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const generateLabel = async (req, res) => {
  try {
    const { waybill } = req.params;
    if (!waybill) {
      return res.status(400).json({ success: false, message: 'Waybill is required' });
    }

    const result = await shippingService.getLabel(waybill);
    if (!result.success) {
      return res.status(404).json({ success: false, message: 'Label not found for this waybill' });
    }
    res.status(200).json({ success: true, label: result.labelData, raw: result.raw }); 
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const generateManifest = async (req, res) => {
  try {
    const { waybill } = req.params;
    if (!waybill) {
      return res.status(400).json({ success: false, message: 'Waybill is required' });
    }

    const result = await shippingService.generateManifest(waybill);
    res.status(200).json({ success: true, message: 'Manifest generated', result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
