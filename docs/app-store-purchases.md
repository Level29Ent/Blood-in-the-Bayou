# Native purchases: release blocker

The browser game now includes a purchase/restore interface adapter, **not a live payment processor**. There is no StoreKit implementation in the source tree: the old downloadable iOS ZIP is not a maintained native billing project. No money is collected by this change.

Before release, the iOS host must implement `window.level29NativeStore` using a native bridge restricted to the game's trusted origin:

- `products(ids)` resolves `{id, displayPrice}[]` from StoreKit product metadata.
- `purchase(id)` invokes StoreKit, finishes only verified transactions and handles pending/cancelled transactions without granting access.
- `restore()` invokes the restore flow on explicit user action.
- `entitlements()` returns verified current product IDs, removing refunded/revoked purchases. Do not accept IDs from query strings or localStorage.

Proposed product IDs (must be created under the actual app's bundle in App Store Connect):
- `level29.adfree`: non-consumable, one-time USD $2.99 base price. Display the localized StoreKit price, not a hard-coded global price.
- `level29.midnight_finish`: cosmetic concept; **price and delivered cosmetic still require owner approval/implementation**. Do not configure or expose this product until the actual cosmetic is delivered.

The periodic offer only runs when native billing exists AND ads are actually enabled, at most every five active-play minutes, while waiting for a mission and on foot. It is dismissible and never blocks combat. Verified ad-free ownership suppresses the offer and ad requests. No web Stripe checkout or cross-device account entitlement service is present.

App Store Connect product setup, agreements/banking/tax, StoreKit bridge, sandbox/TestFlight purchase/refund/restore tests, cosmetic fulfillment, and App Review remain required. Do not publish a working purchase button until these are complete. The old packaged iOS download is unchanged.
