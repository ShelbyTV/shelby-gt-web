require([
        "jquery",
        "libs/underscore-1.5.1",
        "mods/app",
        "mods/search/search",
        "mods/analytics/analytics",
        "mods/analytics/trackers",
        "mods/navigation/navigation",
        "mods/social",
        "mods/facebook/client",
        "mods/facebook/share",
        'mods/registration/regcontroller'
],
function ($,_,app, search, analytics, trackers, nav, socialObj, fbClient, fbShare, registration) {

    var appConfig;
    
    appConfig = app.getConfig();

    app.setup();
    search.setup();
    analytics.setup({ gaAcctId: appConfig.GAAcctId }).listen();
    trackers.setup({ cookieDomain: appConfig.CookieHostname }).listen();
    nav.listen();
    socialObj.setup();
    registration.setup();

    $(document).ready(function() {
        fbClient.setup();
        fbShare.setup({}, $('.fbshare-container')).listen();
        if (appConfig.ShowRegPopup && appConfig.IsSinglePostPage && device.is.desktop) {
            $(".js-registration-btn").trigger("showRegistration");
        }
    });

});