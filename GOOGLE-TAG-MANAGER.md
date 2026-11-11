# Google Tag Manager web installation

Container: `GTM-MTKR4ZCD`. The bootstrap initializes `dataLayer`, the `gtm.start`/`gtm.js` event, and the compatibility `gtag` helper before asynchronously requesting Google's container. It does not install a GA measurement ID or publish/configure the container.

Duplicate execution in one document is ignored. Same-origin game iframes skip a second container when their top-level page already loaded it; direct game URLs still load normally. Cross-origin frames cannot inspect the parent and initialize their own document.

Web HTTP(S) only; Capacitor native runtimes skip loading. Native advertising IDs, consent and billing are unchanged. No personal game/account data is sent by this code. The tags configured inside GTM remain the owner's responsibility.

Consent: in the absence of an already initialized Google consent system, analytics/ad storage, ad-user-data and personalization default to denied. Your CMP must send consent updates when appropriate and the GTM container must use consent-aware tag templates. Container installation is not consent or a guarantee that custom tags comply. No noscript tracker is added because it could bypass this JavaScript consent initialization.

Verification: the Node regression checks simulate first/repeated execution, same-origin iframe deduplication, cross-origin fallback, native exclusion, consent order and the expected ID/async loader. Confirm actual hits in Google Tag Assistant/container Preview after merge; blockers, network access, consent and published tags affect delivery.
