// src/lib/AdManager.js

class AdManager {
    constructor() {
        this.isAdShowing = false;
        this.adsInitialized = false;
    }

    init() {
        console.log("AdManager: Initialized H5 ad environment.");
        this.adsInitialized = true;
    }

    showInterstitialAd(onAdComplete) {
        if (!this.adsInitialized) {
            if (onAdComplete) onAdComplete();
            return;
        }

        if (this.isAdShowing) return;
        this.isAdShowing = true;

        console.log("Displaying interstitial ad...");

        // Simulated Ad Duration (Replace with real SDK callback when ready)
        setTimeout(() => {
            this.isAdShowing = false;
            console.log("Ad finished.");
            if (onAdComplete) onAdComplete();
        }, 3000);
    }
}

export const adManager = new AdManager();