# Mobile visible-world budget

Diagnostics3 identifies mobile-road-fix-1 at pixel ratio .85,105textures,950geometries,1742drawcalls. The ratio fix is active; the newest entry has frames0 and cannot establish newFPS. Previous sessions remain in history,not new failures. No JSexception/contextloss is recorded; Safari termination cause remains unknown.

The old direct-render Low path retains desktop fog distances (day2400units/night1400). A mobile-only render wrapper caps normal-world far clipping to760units,with fog360–660. Aircraft use1700clipping/fog900–1500. Static scenery forms conservative bounding-box visibility islands; off-camera/distant islands are temporarily hidden per camera and restored on success or error. World,collisions,map locations,movement speed and saves are unchanged. Existing room/actor/animated ownership is preserved; marked moving roots are excluded. No lower pixel-ratio setting added. Desktop unchanged.

Full generated-world nonGPU camera audit at starting safehouse: estimated visible static mesh/material submissions1433→643. This is a source-frustum estimate,not actualWebGLcalls or measuredSafariFPS. World still constructs14,857meshes eagerly; culling does not unload memory or shorten construction. Static index may need rebuilding for future mutableworldfeatures. Existing new streamed rooms stay under their own culler. Long-session/physicaliPhone verification remains required.

Performance logger now waits for a measured frame interval and includes mobile-visible-world-1,hidden-islandcount. Initial0frame entries are not labeled0FPS anymore. No allissues/crashfree/60FPS claim. Native source archive updated,not built/signed/released. Rendering and tests recorded in PR.

For a desktop-pointer preview browser, `?mobilePreview=1` explicitly opts into the same mobile renderer budget (not touch/input emulation, auth bypass, or physical iPhone testing). Normal phone detection is unchanged. Desktop testing without this flag does not verify the mobile culler.
