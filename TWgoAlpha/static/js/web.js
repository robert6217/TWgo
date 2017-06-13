(function($) { "use strict";
    var storage = function() {
        var prefix = "mdn.search";
        var keys = ["key", "data"];
        var getKey = function(name) {
            return prefix + "." + name };
        return { flush: function() {
                var self = this;
                $.each(keys, function(index, key) { self.removeItem(key) }) }, serialize: function(value) {
                return JSON.stringify(value) }, deserialize: function(value) {
                if (typeof value !== "string") {
                    return undefined }
                try {
                    return JSON.parse(value) } catch (e) {
                    return value || undefined } }, getItem: function(key) {
                return this.deserialize(sessionStorage.getItem(getKey(key))) }, setItem: function(key, value) {
                return sessionStorage.setItem(getKey(key), this.serialize(value)) }, removeItem: function(key) {
                return sessionStorage.removeItem(getKey(key)) } } }();
    if ($("body").hasClass("search-navigator-flush")) { storage.flush() }
    $.fn.mozSearchResults = function(url) {
        var key = storage.getItem("key");
        var $nextLink = $(".from-search-next");
        var $prevLink = $(".from-search-previous");
        var nextDoc;
        var prevDoc;
        var data;
        if (!key && !url) {
            return }
        var populate = function(data) {
            if (!data || !data.documents || !data.documents.length) {
                return }
            var pageSlug = $("body").data("slug");
            var listFrag = document.createDocumentFragment();
            var found;
            var $navigatorList;
            if (data.query) { $("#main-q").attr("data-value", data.query) }
            $.each(data.documents, function() {
                if (this.slug === pageSlug) { found = this.slug } });
            if (!found) return;
            $(".from-search-navigate-wrap").removeClass("hidden");
            $navigatorList = $(".from-search-toc ol");
            $navigatorList.on("click", "a", function() { mdn.analytics.trackEvent({ category: "Search doc navigator", action: "Click", label: $(this).attr("href"), value: found }) });
            $.each(data.documents, function(index, doc) {
                var link = $("<a>", { text: doc.title, href: doc.url });
                if (doc.slug === pageSlug) { link.addClass("current");
                    nextDoc = data.documents[index + 1];
                    if (nextDoc) { $nextLink.attr("href", nextDoc.url).on("click", function() { mdn.analytics.trackEvent({ category: "Search doc navigator", action: "Click next", label: nextDoc.url, value: nextDoc.id }) }).removeClass("disabled") } else { $nextLink.attr("title", $nextLink.attr("data-empty-title")) }
                    prevDoc = data.documents[index - 1];
                    if (prevDoc) { $prevLink.attr("href", prevDoc.url).on("click", function() { mdn.analytics.trackEvent({ category: "Search doc navigator", action: "Click previous", label: prevDoc.url, value: prevDoc.id }) }).removeClass("disabled") } else { $prevLink.attr("title", $nextLink.attr("data-empty-title")) } }
                listFrag.appendChild($("<li></li>").append(link).get(0)) });
            $navigatorList.append(listFrag);
            $("#wiki-document-head").addClass("from-search") };
        if (!url) {
            if (key) { url = key } } else { storage.setItem("key", url) }
        data = storage.getItem("data");
        if (!data) { $.ajax({ url: url, dataType: "json", success: function(data) { storage.setItem("data", data);
                    populate(data) }, error: function(xhr, status, err) { console.error(url, status, err.toString()) } }) } else { populate(data) }
        return this } })(jQuery);
(function(win, doc, $) { "use strict";
    $(".toggleable").mozTogglers();
    (function() {
        var $quickLinks = $("#quick-links");
        setupTogglers($quickLinks.find("> ul > li, > ol > li"));
        $quickLinks.find(".toggleable").mozTogglers() })();
    $(".subnav").each(function() {
        var $subnav = $(this);
        var $subnavList = $subnav.find(" > ol");
        var minHeightFn = $(".zone-landing-header-preview-base").length ? setMinHeight : noop;
        if (!$subnavList.length) return;
        setupTogglers($subnavList.find("li"));
        $subnavList.find(".toggleable").mozTogglers({ slideCallback: minHeightFn });
        var used = [];
        var $selected = $subnavList.find('a[href$="' + doc.location.pathname + '"]');
        $selected.each(function() {
            var self = this;
            var $togglers = $(this).parents(".toggleable").find(".toggler");
            $togglers.each(function() {
                if ($.contains($(this).parent("li").get(0), self) && used.indexOf(this) === -1) { $(this).trigger("mdn:click");
                    used.push(this) } }) }).parent().addClass("current");
        $subnavList.addClass("accordion");

        function noop() {}

        function setMinHeight() {
            if ($(".zone-landing-header-preview-base").css("position") === "absolute") { $(".wiki-main-content").css("min-height", $subnav.height()) } }
        minHeightFn() });
    (function() {
        var searchUrl = $(doc.body).data("search-url");
        if (searchUrl) { $(".from-search-toc").mozSearchResults(searchUrl) } })();
    var fromSearchNav = $(".from-search-navigate");
    if (fromSearchNav.length) {
        var fromSearchList = $(".from-search-toc");
        fromSearchNav.mozMenu({ submenu: fromSearchList, brickOnClick: true, onOpen: function() { mdn.analytics.trackEvent({ category: "Search doc navigator", action: "Open on hover" }) }, onClose: function() { mdn.analytics.trackEvent({ category: "Search doc navigator", action: "Close on blur" }) } });
        fromSearchList.find("ol").mozKeyboardNav() }
    $(".page-watch a").on("click", function(e) { e.preventDefault();
        var $link = $(this);
        if ($link.hasClass("disabled")) return;
        mdn.analytics.trackEvent({ category: "Page Watch", action: $link.text().trim() });
        var $form = $link.closest("form");
        var notification = mdn.Notifier.growl($link.data("subscribe-status"), { duration: 0, type: "text" });
        $link.addClass("disabled");
        $.ajax($form.attr("action"), { cache: false, method: "post", data: $form.serialize() }).done(function(data) {
            var message;
            if (Number(data.status) === 1) { $link.text($link.data("unsubscribe-text"));
                message = $link.data("subscribe-message") } else { $link.text($link.data("subscribe-text"));
                message = $link.data("unsubscribe-message") }
            notification.success(message, 2e3);
            $link.removeClass("disabled") }) });

    function setupTogglers($elements) { $elements.each(function() {
            var $li = $(this);
            var $sublist = $li.find("> ul, > ol");
            if ($sublist.length) { $li.addClass("toggleable closed");
                $li.find("> a").addClass("toggler").prepend('<i aria-hidden="true" class="icon-caret-up"></i>');
                $sublist.addClass("toggle-container") } }) }
    $(".external").each(function() {
        var $link = $(this);
        if (!$link.find("img").length) $link.addClass("external-icon") });
    $("#wiki-document-head h1").each(function() {
        var $title = $(this);
        var text = $title.text();
        var split = text.split(/(?=[\.:\-\(A-Z][\.:\-\(A-Z]{0,}[a-zA-Z]{3})/g);
        $title.empty();
        $.each(split, function(key, value) { $title.append("<wbr>");
            $title.append(doc.createTextNode(value)) }) });
    if ($("article pre").length && "querySelectorAll" in doc)(function() {
        if (mdn.assets && mdn.assets.js.hasOwnProperty("syntax-prism")) { mdn.assets.js["syntax-prism"].forEach(function(url, index, array) {
                var syntaxScript = doc.createElement("script");
                syntaxScript.async = array.length === 1;
                if (index === 0) { syntaxScript.setAttribute("data-manual", "true") }
                syntaxScript.src = url;
                doc.head.appendChild(syntaxScript) }) } })();
    (function() {
        var syntaxSections = { css: { link: "/docs/Web/CSS/Value_definition_syntax", title: gettext("How to read CSS syntax."), urlTest: "/docs/Web/CSS/", classTest: "brush:css" }, html: { urlTest: "/docs/Web/HTML/", classTest: "brush:html" }, js: { urlTest: "/docs/Web/JavaScript/", classTest: "brush:js" }, api: { urlTest: "/docs/Web/API/", classTest: "brush:js" } };
        var $boxes = $(".syntaxbox, .twopartsyntaxbox");
        if ($boxes.length) {
            var isLinkMatch = false;
            var sectionMatch;
            for (var section in syntaxSections) {
                var sectionLink = syntaxSections[section].link;
                var sectionTest = syntaxSections[section].urlTest;
                if (window.location.href.indexOf(sectionLink) > -1) { isLinkMatch = true }
                if (window.location.href.indexOf(sectionTest) > -1) { sectionMatch = syntaxSections[section] } }
            if (!isLinkMatch) { $boxes.each(function() {
                    var $thisBox = $(this);
                    var syntaxLanguage;
                    if ($thisBox.hasClass("twopartsyntaxbox")) { syntaxLanguage = syntaxSections.css }
                    for (var section in syntaxSections) {
                        var classTest = syntaxSections[section].classTest;
                        if ($thisBox.hasClass(classTest)) { syntaxLanguage = syntaxSections[section] } }
                    if (!syntaxLanguage && sectionMatch) { syntaxLanguage = sectionMatch }
                    if (syntaxLanguage) {
                        if (syntaxLanguage.link && syntaxLanguage.title) {
                            var syntaxLink = syntaxLanguage.link;
                            var syntaxTitle = syntaxLanguage.title;
                            var $helpLink = $('<a href="' + syntaxLink + '" class="syntaxbox-help icon-only" lang="en"><i aria-hidden="true" class="icon-question-sign"></i><span>' + syntaxTitle + "</span></a>");
                            $thisBox.before($helpLink);
                            $thisBox.on("mouseenter", function() { $helpLink.addClass("isOpaque") });
                            $thisBox.on("mouseleave", function() { $helpLink.removeClass("isOpaque") }) } } }) } } })();
    $("#nav-access").on("click contextmenu", "a", function(event) {
        var $thisLink = $(this);
        var url = $thisLink.attr("href");
        var data = { category: "Access Links", action: $thisLink.text(), label: $thisLink.attr("href") };
        mdn.analytics.trackLink(event, url, data);
        if (win.ga) ga("set", "dimension11", "Yes") });
    $("#toc").on("click contextmenu", "a", function(event) {
        var $thisLink = $(this);
        var url = $thisLink.attr("href");
        var linkData = { category: "TOC Links", action: $thisLink.text(), label: $thisLink.attr("href") };
        mdn.analytics.trackLink(event, url, linkData);
        var fixed = $("#toc.fixed").length > 0 ? "fixed" : "not fixed";
        var clickData = { category: "TOC Click", action: fixed };
        mdn.analytics.trackLink(event, url, clickData) });
    $("#main-nav").on("click contextmenu", "a", function(event) {
        var url = this.href;
        var data = { category: "Wiki", action: "Main Nav", label: url };
        mdn.analytics.trackLink(event, url, data) });
    $(".crumbs").on("click contextmenu", "a", function(event) {
        var url = this.href;
        var data = { category: "Wiki", action: "Crumbs", label: url };
        mdn.analytics.trackLink(event, url, data) });
    (function() {
        var $toc = $("#toc");
        var tocOffset = $toc.offset();
        var $toggler = $toc.find("> .toggler");
        var fixedClass = "fixed";
        var $wikiRight = $("#wiki-right");
        var $pageButtons = $(".page-buttons");
        var pageButtonsOffset = $pageButtons.offset();
        var stickyFeatureEnabled = $pageButtons.attr("data-sticky") === "true";
        var buttonDirection = $("html").attr("dir") === "rtl" ? "left" : "right";
        var scrollFn = debounce(function(e) {
            var scroll = $(doc).scrollTop();
            var pageButtonsHeight = 0;
            var $mainContent = $(".wiki-main-content");
            var pointerEvents = $toggler.css("pointer-events");
            if (!e || e.type === "resize") {
                if (buttonDirection === "right") { pageButtonsOffset.right = $(win).width() - $mainContent.offset().left - $mainContent.innerWidth() }
                if ($toc.length) {
                    if (pointerEvents === "auto" || $toggler.find("i").css("display") !== "none") {
                        if (!$toc.attr("data-closed") && !$toggler.attr("data-clicked")) { $toggler.trigger("mdn:click") } } else if ($toc.attr("data-closed")) { $toggler.trigger("mdn:click") } } }
            if (stickyFeatureEnabled) { pageButtonsHeight = $pageButtons.innerHeight();
                if (scroll > pageButtonsOffset.top) { $pageButtons.addClass(fixedClass);
                    if ($pageButtons.css("position") === "fixed") { $pageButtons.css("min-width", $pageButtons.css("width"));
                        $pageButtons.css(buttonDirection, pageButtonsOffset[buttonDirection]) } } else { $pageButtons.removeClass(fixedClass) } }
            if (!$toc.length) return;
            var maxHeight = win.innerHeight - parseInt($toc.css("padding-top"), 10) - parseInt($toc.css("padding-bottom"), 10) - pageButtonsHeight;
            if (scroll + pageButtonsHeight > tocOffset.top && pointerEvents === "none") { $toc.css({ width: $toc.css("width"), top: pageButtonsHeight, maxHeight: maxHeight });
                $toc.addClass(fixedClass) } else { $toc.css({ width: "auto", maxHeight: "none" });
                $toc.removeClass(fixedClass) } }, 15);
        if ($toc.length || stickyFeatureEnabled) { scrollFn();
            $(win).on("scroll resize", scrollFn) } })();
    $(".htab").each(function(index) {
        var $htab = $(this);
        var $items = $htab.find(">ul>li");
        $htab.append($("div[id=compat-desktop]")[index]);
        $htab.append($("div[id=compat-mobile]")[index]);
        $items.find("a").on("click mdn:click", function(e) {
            var $this = $(this);
            if (e) { e.preventDefault();
                e.stopPropagation() }
            $items.removeClass("selected");
            $this.parent().addClass("selected");
            $htab.find(">div").hide().eq($items.index($this.parent())).show() }).eq(0).trigger("mdn:click") });
    $(".wiki-l10n").on("change", function() {
        if (this.value) { win.location = this.value } });
    $("body[contextmenu=edit-history-menu]").mozContextMenu(function(target, $contextMenu) {
        var $menuitems = $contextMenu.find("menuitem");
        var $body = $("body");
        var isTextSelected = !document.getSelection().isCollapsed;
        var isLinkTargeted = $(target).is("a") || $(target).parents().is("a");
        var isImageTargeted = $(target).is("img");
        if (isLinkTargeted || isTextSelected || isImageTargeted) { $body.attr("contextmenu", "") }
        $contextMenu.on("click", function(e) { location.href = $(e.target).data("action") + "?src=context" }) });
    var $kserrors = $("#kserrors");
    if ($kserrors.length) {
        var $kserrorsToggle = $kserrors.find(".kserrors-details-toggle");
        var $kserrorsDetails = $kserrors.find(".kserrors-details");
        $kserrorsToggle.toggleMessage({ toggleCallback: function() { $kserrorsDetails.toggleClass("hidden") } });
        var $kserrorsList = $("#kserrors-list");
        if ($kserrorsList.length) { $kserrorsList.each(function() {
                var $thisError = $(this);
                var errorType = $thisError.find(".kserror-type").text().trim();
                var errorMacro = $thisError.find(".kserror-macro").text().trim();
                var errorParse = $thisError.find(".kserror-parse").text().trim().replace(/\s\s+/g, " ");
                mdn.analytics.trackError("Kumascript Error", errorType, "in: " + errorMacro + "; parsing: " + errorParse) }) } else { mdn.analytics.trackError("Kumascript Error", "generic error") } }
    var $docPending = $("#doc-pending-fallback");
    if ($docPending.length) { mdn.analytics.trackError("Translation Pending", "displayed") }
    $(".stack-form").html('<form action="http://stackoverflow.com/search"><i class="stack-icon" aria-hidden="true"></i><label for="stack-search" class="offscreen">' + gettext("Search Stack Overflow") + '</label><input id="stack-search" placeholder="' + gettext("Search Stack Overflow") + '" /><button type="submit" class="offscreen">Submit Search</button></form>').find("form").on("submit", function(e) { e.preventDefault();
        var value = $(this).find("#stack-search").val();
        if (value !== "") { win.location = "http://stackoverflow.com/search?q=[firefox]+or+[firefox-os]+or+[html5-apps]+" + value } });
    (function() {
        var hiddenClass = "hidden";
        var shownClass = "shown";
        var $contributors = $(".contributor-avatars");
        var $showAllContributors;

        function loadImages(selector) {
            return $contributors.find(selector).mozLazyloadImage() }

        function initToggle() { $showAllContributors = $('<button id="contributors-toggle" type="button" class="transparent" data-alternate-message="' + $contributors.data("alternate-message") + '">' + $contributors.data("all-text") + "</button>");
            $showAllContributors.toggleMessage({ toggleCallback: toggleImages });
            $showAllContributors.appendTo($contributors) }

        function toggleImages() {
            var $hiddenContributors;
            $hiddenContributors = $contributors.find("li." + hiddenClass);
            $contributors.toggleClass("contributor-avatars-open");
            if ($hiddenContributors.length) { mdn.analytics.trackEvent({ category: "Top Contributors", action: "Show all" });
                $hiddenContributors.removeClass(hiddenClass);
                loadImages("noscript") } else { $contributors.find("li:not(." + shownClass + ")").addClass(hiddenClass) } }
        $contributors.on("click", "a", function(event) {
            var url = this.href;
            var index = $(this).parent().index() + 1;
            var data = { category: "Top Contributors", action: "Click position", label: index };
            mdn.analytics.trackLink(event, url, data) });
        if ($contributors.css("display") === "none") return;
        loadImages("li." + shownClass + " noscript");
        if ($contributors.data("has-hidden")) { initToggle() }
        $contributors.find("ul").on("focusin focusout", function(event) { $(this)[(event.type === "focusin" ? "add" : "remove") + "Class"]("focused") }) })();
    if ($("math").length)(function() {
        var $div = $('<div class="offscreen"><math xmlns="http://www.w3.org/1998/Math/MathML"><mspace height="23px" width="77px"/></math></div>').appendTo(document.body);
        var box = $div.get(0).firstChild.firstChild.getBoundingClientRect();
        $div.remove();
        var supportsMathML = Math.abs(box.height - 23) <= 1 && Math.abs(box.width - 77) <= 1;
        if (!supportsMathML) { $('<link href="' + mdn.staticPath + 'styles/libs/mathml.css" rel="stylesheet" type="text/css" />').appendTo(doc.head);
            $("#wikiArticle").prepend('<div class="notice"><p>' + gettext("Your browser does not support MathML. A CSS fallback has been used instead.") + "</p></div>") } })();
    (function() {
        var $button = $(".revision-list-controls .link-btn");
        if ($button.length) {
            var revisionButtonOffset = $button.offset().top;
            $(win).on("scroll", function() {
                var $compareButton = $button;
                var scroll = $(this).scrollTop();
                $compareButton.toggleClass("fixed", scroll >= revisionButtonOffset) }) } })();

    function debounce(func, wait, immediate) {
        var timeout;
        return function() {
            var context = this,
                args = arguments;
            var later = function() { timeout = null;
                if (!immediate) func.apply(context, args) };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args) } }(function() {
        var $youtubeIframes = $('iframe[src*="youtube.com/embed"]');
        var players = [];
        var timeoutFlag = 1;
        var timer;

        function timeout() {
            var fraction;
            timeoutFlag = 1;
            $.each(players, function(index, player) {
                if (player.getPlayerState() !== 1) return;
                timeoutFlag = 0;
                fraction = player.getCurrentTime() / player.getDuration();
                if (!player.checkpoint) { player.checkpoint = .1 + Math.round(fraction * 10) / 10 }
                if (fraction > player.checkpoint) { mdn.analytics.trackEvent({ category: "YouTube", action: "Percent Completed", label: player.getVideoUrl(), value: Math.round(player.checkpoint * 100) });
                    player.checkpoint += .1 } });
            if (timeoutFlag) {
                if (timer) clearTimeout(timer) } else { timer = setTimeout(timeout, 6e3) } }
        if (!$youtubeIframes.length) return;
        var origin = win.location.protocol + "//" + win.location.hostname + (win.location.port ? ":" + win.location.port : "");
        $youtubeIframes.each(function() { $(this).attr("src", function(i, src) {
                return src + (src.split("?")[1] ? "&" : "?") + "&enablejsapi=1&origin=" + origin }) });
        var youtubeScript = doc.createElement("script");
        youtubeScript.async = "true";
        youtubeScript.src = "//www.youtube.com/iframe_api";
        doc.body.appendChild(youtubeScript);
        win.onYouTubeIframeAPIReady = function(event) { $youtubeIframes.each(function(i) { players[i] = new YT.Player($(this).get(0));
                players[i].addEventListener("onStateChange", function(event) {
                    var action;
                    switch (event.data) {
                        case 0:
                            action = "Finished";
                            break;
                        case 1:
                            action = "Play";
                            if (timeoutFlag) { timeout() }
                            break;
                        case 2:
                            action = "Pause";
                            break;
                        case 3:
                            action = "Buffering";
                            break;
                        default:
                            return }
                    mdn.analytics.trackEvent({ category: "YouTube", action: action, label: players[i].getVideoUrl() }) });
                players[i].addEventListener("onPlaybackQualityChange", function(event) {
                    var value;
                    switch (event.data) {
                        case "small":
                            value = 240;
                            break;
                        case "medium":
                            value = 360;
                            break;
                        case "large":
                            value = 480;
                            break;
                        case "hd720":
                            value = 720;
                            break;
                        case "hd1080":
                            value = 1080;
                            break;
                        case "highres":
                            value = 1440;
                            break;
                        default:
                            value = 0 }
                    mdn.analytics.trackEvent({ category: "YouTube", action: "Playback Quality", label: players[i].getVideoUrl(), value: value }) });
                players[i].addEventListener("onError", function(event) { mdn.analytics.trackError("YouTube Error", event.data) }) }) } })();

    function initDetailsTags() {
        var supportsDetails = function(doc) {
            var el = doc.createElement("details");
            var isFake;
            var root;
            var diff;
            if (!("open" in el)) {
                return false }
            root = doc.body || function() {
                var de = doc.documentElement;
                isFake = true;
                return de.insertBefore(doc.createElement("body"), de.firstElementChild || de.firstChild) }();
            el.innerHTML = "<summary>a</summary>b";
            el.style.display = "block";
            root.appendChild(el);
            diff = el.offsetHeight;
            el.open = true;
            diff = diff != el.offsetHeight;
            root.removeChild(el);
            if (isFake) { root.parentNode.removeChild(root) }
            return diff }(document);
        if (supportsDetails) return;
        $("details").addClass("no-details").each(function() {
            var $details = $(this);
            var $detailsSummary = $("summary", $details);
            var $detailsNotSummary = $details.children(":not(summary)");
            var $detailsNotSummaryContents = $details.contents(":not(summary)");
            if (!$detailsSummary.length) { $detailsSummary = $(doc.createElement("summary")).text(gettext("Details")).prependTo($details) }
            if ($detailsNotSummary.length !== $detailsNotSummaryContents.length) { $detailsNotSummaryContents.filter(function() {
                    return this.nodeType === 3 && /[^\t\n\r ]/.test(this.data) }).wrap("<span>");
                $detailsNotSummary = $details.children(":not(summary)") }
            if (typeof $details.attr("open") !== "undefined") { $details.addClass("open");
                $detailsNotSummary.show() } else { $detailsNotSummary.hide() }
            $detailsSummary.attr("tabindex", 0).attr("role", "button").on("click", function() { $detailsSummary.focus();
                if (typeof $details.attr("open") !== "undefined") { $details.removeAttr("open");
                    $detailsSummary.attr("aria-expanded", "false") } else { $details.attr("open", "open");
                    $detailsSummary.attr("aria-expanded", "true") }
                $detailsNotSummary.slideToggle();
                $details.toggleClass("open") }).on("keyup", function(ev) {
                if (32 == ev.keyCode || 13 == ev.keyCode) { ev.preventDefault();
                    $detailsSummary.click() } }) }) }
    if ($("details").length) { initDetailsTags() }
    if (typeof document_saved !== "undefined" && document_saved) { localStorage.removeItem("draft/edit" + location.pathname);
        localStorage.removeItem("draft/edit" + location.pathname + "#save-time") } })(window, document, jQuery);
(function(win, doc, $) { "use strict";
    if (!win.waffle || !win.waffle.flag_is_active("wiki_samples")) return;
    var sites = ["codepen", "jsfiddle"];
    var frameLength = "frame_".length;
    var sourceURL = $("link[rel=canonical]").attr("href") || win.location.href.split("#")[0];
    var plug = "<!-- Learn about this code on MDN: " + sourceURL + " -->\n\n";
    var analytics = '<input type="hidden" name="utm_source" value="mdn" />' + '<input type="hidden" name="utm_medium" value="code-sample" />' + '<input type="hidden" name="utm_campaign" value="external-samples" />';
    $(".sample-code-frame").each(function() {
        var $this = $(this);
        var parentTable = $this.parents(".sample-code-table").get(0);
        var section = $this.attr("id").substring(frameLength);
        var source = $this.attr("src").replace(/^https?:\/\//, "");
        source = source.slice(source.indexOf("/"), source.indexOf("$"));
        var $sampleFrame = parentTable ? parentTable : $this;
        createSampleButtons($sampleFrame, section, source) });

    function openJSFiddle(title, htmlCode, cssCode, jsCode) {
        var $form = $('<form method="post" action="https://jsfiddle.net/api/mdn/" class="hidden">' + '<input type="hidden" name="html" />' + '<input type="hidden" name="css" />' + '<input type="hidden" name="js" />' + '<input type="hidden" name="title" />' + '<input type="hidden" name="wrap" value="b" />' + analytics + '<input type="submit" />' + "</form>").appendTo(doc.body);
        $form.find("input[name=html]").val(plug + htmlCode);
        $form.find("input[name=css]").val(cssCode);
        $form.find("input[name=js]").val(jsCode);
        $form.find("input[name=title]").val(title);
        $form.get(0).submit() }

    function openCodepen(title, htmlCode, cssCode, jsCode) {
        var $form = $('<form method="post" action="https://codepen.io/pen/define" class="hidden">' + '<input type="hidden" name="data">' + analytics + '<input type="submit" />' + "</form>").appendTo(doc.body);
        var data = { title: title, html: plug + htmlCode, css: cssCode, js: jsCode };
        $form.find("input[name=data]").val(JSON.stringify(data));
        $form.get(0).submit() }

    function openSample(sampleCodeHost, section, title, htmlCode, cssCode, jsCode) {
        var cssCleanCode = cssCode.replace(/\xA0/g, " ");
        mdn.analytics.trackEvent({ category: "Samples", action: "open-" + sampleCodeHost, label: section });
        if (win.ga) ga("set", "dimension8", "Yes");
        if (sampleCodeHost === "jsfiddle") { openJSFiddle(title, htmlCode, cssCleanCode, jsCode) } else if (sampleCodeHost === "codepen") { openCodepen(title, htmlCode, cssCleanCode, jsCode) } }

    function createSampleButtons($sampleFrame, section, source) { $.get(source + "?section=" + section + "&raw=1").then(function(sample) {
            var $sample = $("<div />").append(sample);
            var htmlCode = $sample.find("pre[class*=html]").text();
            var cssCode = $sample.find("pre[class*=css]").text();
            var jsCode = $sample.find("pre[class*=js]").text();
            var title = doc.getElementById(section);
            title = title ? title.textContent : "";
            if (htmlCode.length || cssCode.length || jsCode.length) {
                var $buttonContainer = $('<div class="open-in-host-container" />');
                $.each(sites, function() {
                    var sampleCodeHost = this.toLowerCase();
                    var $button = $("<button />", { "class": "open-in-host" });
                    var $icon = $("<i />", { "class": "icon-" + sampleCodeHost, "aria-hidden": "true" });
                    var $text = interpolate(gettext("Open in %(site)s"), { site: this }, true) + " ";
                    $button.append($text).append($icon).appendTo($buttonContainer);
                    $buttonContainer.insertAfter($sampleFrame);
                    $button.on("click", function() { openSample(sampleCodeHost, section, title, htmlCode, cssCode, jsCode) }) }) } else if ($sample.children().length == 0) { mdn.analytics.trackError("embedLiveSample Error", "$sample was empty", section) } else { mdn.analytics.trackError("embedLiveSample Error", "$sample did not cointain any code", section) } }).fail(function() { mdn.analytics.trackError("embedLiveSample Error", "ajax error retreiving source", section) }) } })(window, document, jQuery);
(function(ga, $, mdn) { "use strict";
    var $survey;
    var $votes;
    var gaInterval;
    var gaChecks = 0;

    function checkGA() {
        if (ga && ga.create) { showSurvey() } else if (gaChecks < 5) { setTimeout(checkGA, 500);
            gaChecks++ } }

    function showSurvey() { $survey = $("#helpful-survey");
        $votes = $survey.find(".helpful-survey-vote");
        $survey.removeClass("hidden");
        $votes.on("click", function() { mdn.analytics.trackEvent({ category: "helpful2", action: "vote", label: $(this).hasClass("helpful-survey-yes") ? "Yes" : "No" });
            $votes.prop("disabled", "disabled");
            $survey.addClass("submitted") }) }
    checkGA() })(window.ga, window.jQuery, window.mdn);
