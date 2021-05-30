function _registerEvent(target, eventType, cb) {
    if (target.addEventListener) {
        target.addEventListener(eventType, cb);
        return {
            remove: function () {
                target.removeEventListener(eventType, cb);
            }
        };
    } else {
        target.attachEvent(eventType, cb);
        return {
            remove: function () {
                target.detachEvent(eventType, cb);
            }
        };
    }
}

function _createHiddenIframe(target, uri) {
    var iframe = document.createElement("iframe");
    iframe.src = uri;
    iframe.id = "hiddenIframe";
    iframe.style.display = "none";
    target.appendChild(iframe);

    return iframe;
}

function openUriWithHiddenFrame(uri, failCb, successCb, timeoutMs) {

    var timeout = setTimeout(function () {
        failCb();
        handler.remove();
    }, timeoutMs);

    var iframe = document.querySelector("#hiddenIframe");
    if (!iframe) {
        iframe = _createHiddenIframe(document.body, "about:blank");
    }

    var handler = _registerEvent(window, "blur", onBlur);

    function onBlur() {
        clearTimeout(timeout);
        handler.remove();
        successCb();
    }

    iframe.contentWindow.location.href = uri;
}

function openUriWithTimeoutHack(uri, failCb, successCb, timeoutMs) {
    
    var timeout = setTimeout(function () {
        failCb();
        handler.remove();
    }, timeoutMs);

    //handle page running in an iframe (blur must be registered with top level window)
    var target = window;
    while (target != target.parent) {
        target = target.parent;
    }

    var handler = _registerEvent(target, "blur", onBlur);

    function onBlur() {
        clearTimeout(timeout);
        handler.remove();
        successCb();
    }

    window.location = uri;
}

function openUriUsingFirefox(uri, failCb, successCb) {
    var iframe = document.querySelector("#hiddenIframe");

    if (!iframe) {
        iframe = _createHiddenIframe(document.body, "about:blank");
    }

    try {
        iframe.contentWindow.location.href = uri;
        successCb();
    } catch (e) {
        if (e.name == "NS_ERROR_UNKNOWN_PROTOCOL") {
            failCb();
        }
    }
}

function openUriUsingIEInOlderWindows(uri, failCb, successCb, timeoutMs) {
    if (getInternetExplorerVersion() === 10) {
        openUriUsingIE10InWindows7(uri, failCb, successCb, timeoutMs);
    } else if (getInternetExplorerVersion() === 9 || getInternetExplorerVersion() === 11) {
        openUriWithHiddenFrame(uri, failCb, successCb, timeoutMs);
    } else {
        openUriInNewWindowHack(uri, failCb, successCb, timeoutMs);
    }
}

function openUriUsingIE10InWindows7(uri, failCb, successCb, timeoutMs) {
    var timeout = setTimeout(failCb, timeoutMs);
    window.addEventListener("blur", function () {
        clearTimeout(timeout);
        successCb();
    });

    var iframe = document.querySelector("#hiddenIframe");
    if (!iframe) {
        iframe = _createHiddenIframe(document.body, "about:blank");
    }
    try {
        iframe.contentWindow.location.href = uri;
    } catch (e) {
        failCb();
        clearTimeout(timeout);
    }
}

function openUriInNewWindowHack(uri, failCb, successCb, timeoutMs) {
    var myWindow = window.open('', '', 'width=0,height=0');

    myWindow.document.write("<iframe src='" + uri + "'></iframe>");

    setTimeout(function () {
        try {
            myWindow.location.href;
            myWindow.setTimeout("window.close()", timeoutMs);
            successCb();
        } catch (e) {
            myWindow.close();
            failCb();
        }
    }, timeoutMs);
}

function openUriWithMsLaunchUri(uri, failCb, successCb) {
    navigator.msLaunchUri(uri,
        successCb,
        failCb
    );
}

function checkBrowser() {
    var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
    var ua = navigator.userAgent.toLowerCase();
    return {
        isOpera   : isOpera,
        isFirefox : typeof InstallTrigger !== 'undefined',
        isSafari  : (~ua.indexOf('safari') && !~ua.indexOf('chrome')) || Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0,
        isIOS     : /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream,
        isChrome  : !!window.chrome && !isOpera,
        isIE      : /*@cc_on!@*/false || !!document.documentMode // At least IE6
    }
}

function getInternetExplorerVersion() {
    var rv = -1;
    if (navigator.appName === "Microsoft Internet Explorer") {
        var ua = navigator.userAgent;
        var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
        if (re.exec(ua) != null)
            rv = parseFloat(RegExp.$1);
    }
    else if (navigator.appName === "Netscape") {
        var ua = navigator.userAgent;
        var re = new RegExp("Trident/.*rv:([0-9]{1,}[\.0-9]{0,})");
        if (re.exec(ua) != null) {
            rv = parseFloat(RegExp.$1);
        }
    }
    return rv;
}

function getTimeouts(timeouts) {
    timeouts = timeouts || {};
    return {
        chromeAndIOS: parseInt(timeouts.chromeAndIOS) || 1000,
        legacyIE: parseInt(timeouts.legacyIE) || 1000,
        safari: parseInt(timeouts.safari) || 1000
    };
}

module.exports = function(uri, failCb, successCb, unsupportedCb, timeouts) {
    function failCallback() {
        failCb && failCb();
    }

    function successCallback() {
        successCb && successCb();
    }

    timeouts = getTimeouts(timeouts);

    if (navigator.msLaunchUri) { //for IE and Edge in Win 8 and Win 10
        openUriWithMsLaunchUri(uri, failCb, successCb);
    } else {
        var browser = checkBrowser();

        if (browser.isFirefox) {
            openUriUsingFirefox(uri, failCallback, successCallback);
        } else if (browser.isChrome || browser.isIOS) {
            openUriWithTimeoutHack(uri, failCallback, successCallback, timeouts.chromeAndIOS);
        } else if (browser.isIE) {
            openUriUsingIEInOlderWindows(uri, failCallback, successCallback, timeouts.legacyIE);
        } else if (browser.isSafari) {
            openUriWithHiddenFrame(uri, failCallback, successCallback, timeouts.safari);
        } else {
            unsupportedCb();
            //not supported, implement please
        }
    }
}
