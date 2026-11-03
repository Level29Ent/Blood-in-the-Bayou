export declare const NATIVE_AD_ELEMENT_NAME = "capacitor-admob-native";
interface NativeAdElementFeed {
    attach(slotKey: string, element: HTMLElement): void;
    detach(element: HTMLElement): void;
}
type NativeAdFeedLookup = (feedId: string) => NativeAdElementFeed | undefined;
export declare const defineNativeAdElement: (findFeed: NativeAdFeedLookup) => void;
export declare const connectNativeAdElements: () => void;
export {};
