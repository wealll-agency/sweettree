/**
 * Base Shipping Provider Interface
 * All courier-specific providers must extend this class and implement its methods.
 */
class ShippingProvider {
  /**
   * Create a shipment with the courier.
   * @param {Object} payload Standardized shipment payload
   * @returns {Promise<Object>} Standardized response { success: true, waybill: string, raw: Object }
   */
  async createShipment(payload) {
    throw new Error('Method createShipment() must be implemented.');
  }

  /**
   * Track a shipment using the waybill.
   * @param {String} waybill
   * @returns {Promise<Object>} Standardized tracking response
   */
  async trackShipment(waybill) {
    throw new Error('Method trackShipment() must be implemented.');
  }

  /**
   * Cancel a shipment.
   * @param {String} waybill
   * @returns {Promise<Object>} Standardized cancellation response
   */
  async cancelShipment(waybill) {
    throw new Error('Method cancelShipment() must be implemented.');
  }

  /**
   * Generate a shipping label / packing slip.
   * @param {String} waybill
   * @returns {Promise<Object>} Standardized label response { labelUrl: string }
   */
  async generateLabel(waybill) {
    throw new Error('Method generateLabel() must be implemented.');
  }

  /**
   * Check if a pincode is serviceable.
   * @param {String} pincode
   * @returns {Promise<Boolean>}
   */
  async checkServiceability(pincode) {
    throw new Error('Method checkServiceability() must be implemented.');
  }
}

export default ShippingProvider;
