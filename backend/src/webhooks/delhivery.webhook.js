import Order from '../models/Order.js';

export const delhiveryWebhookHandler = async (req, res) => {
  try {
    const payload = req.body;
    
    // Delhivery pushes status updates via webhooks
    if (payload && payload.Waybill) {
      const order = await Order.findOne({ 'shipments.waybill': payload.Waybill });
      if (order) {
        if (payload.Status) {
          const shipment = order.shipments.find(s => s.waybill === payload.Waybill);
          if (shipment) {
            shipment.status = payload.Status.Status;
            shipment.lastUpdated = new Date();
            
            if (payload.Status.ExpectedDeliveryDate) {
              shipment.expectedDeliveryDate = new Date(payload.Status.ExpectedDeliveryDate);
            }
            if (payload.Status.ScannedLocation) {
              shipment.currentLocation = payload.Status.ScannedLocation;
            }
            if (payload.Status.Instructions) {
              shipment.lastScan = payload.Status.Instructions;
            }
          }
          
          // Map to standard order statuses if all shipments are delivered/cancelled
          if (order.shipments.every(s => s.status === 'Delivered')) {
            order.orderStatus = 'Delivered';
            order.deliveredAt = new Date();
          } else if (order.shipments.every(s => s.status === 'Cancelled')) {
            order.orderStatus = 'Cancelled';
          }
          
          await order.save();
        }
      }
    }
    
    // Always acknowledge the webhook quickly
    res.status(200).send('OK');
  } catch (error) {
    console.error('Delhivery Webhook error:', error);
    res.status(500).send('Error processing webhook');
  }
};
