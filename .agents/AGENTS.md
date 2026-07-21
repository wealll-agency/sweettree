# Project Constraints and Rules

The following rules have been strictly set by the user and MUST NOT be changed or overridden in the future. These apply strictly to the live/production environment as well.

## 1. CCAvenue Payment Integration
- **Strict Rule:** NEVER change the checkout UI or business logic related to payments.
- **Strict Rule:** Use the official CCAvenue encryption algorithm ONLY. Do NOT implement any custom patches or custom encryption logic.
- **Strict Rule:** Ensure Sandbox and Production credentials are never mixed. Always use the exact Merchant ID, Access Code, and Working Key provided in the respective environment's configuration.

## 2. Checkout Resume Flow
- **Strict Rule:** Guest users clicking "Pay Now" must be prompted to authenticate, but their complete checkout state (cart, route, address, coupon, etc.) MUST be securely saved.
- **Strict Rule:** After successful Login/Register, the user MUST be automatically redirected back to the exact Checkout page they were on.
- **Strict Rule:** NEVER redirect a user back to the Home page if their authentication originated from the Checkout flow.

## 3. Alerts and Notifications
- **Strict Rule:** NEVER use native `window.alert()` or `window.confirm()` anywhere in the application.
- **Strict Rule:** Always use the custom Bootstrap-based `NotificationContext` (Modals/Toasts) for user prompts and confirmations.

## 4. Form Inputs and Placeholders
- **Strict Rule:** Do NOT use `placeholder` attributes on any HTML or React inputs/forms anywhere on the website.

---
*Note to agents: Adhere to these rules unconditionally to prevent overriding critical user-approved functionality.*
