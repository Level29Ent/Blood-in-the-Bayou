/**
 * The precision of an impression-level ad value.
 */
export var AdValuePrecision;
(function (AdValuePrecision) {
    /**
     * The ad value precision is unknown.
     */
    AdValuePrecision[AdValuePrecision["Unknown"] = 0] = "Unknown";
    /**
     * The ad value is estimated from aggregated data.
     */
    AdValuePrecision[AdValuePrecision["Estimated"] = 1] = "Estimated";
    /**
     * The ad value was provided by the publisher.
     */
    AdValuePrecision[AdValuePrecision["PublisherProvided"] = 2] = "PublisherProvided";
    /**
     * The ad value is the precise value paid for this ad.
     */
    AdValuePrecision[AdValuePrecision["Precise"] = 3] = "Precise";
})(AdValuePrecision || (AdValuePrecision = {}));
//# sourceMappingURL=ad-mob-revenue-data.interface.js.map