(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.protocolCheck = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
function _registerEvent(target, eventType, cb) {
    if (target.addEventListener) {
        target.addEventListener(eventType, cb);
        return {
            remove: function () {
                target.removeEventListener(eventType, cb);
            }
        };
    } else {
        eventType = "on" + eventType;
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

function openUriWithHiddenFrame(uri, failCb, successCb) {

    var timeout = setTimeout(function () {
        failCb();
        handler.remove();
    }, 1000);

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

function openUriWithTimeoutHack(uri, failCb, successCb) {
    
    var timeout = setTimeout(function () {
        failCb();
        handler.remove();
    }, 1000);

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

function openUriUsingIEInOlderWindows(uri, failCb, successCb) {
    if (getInternetExplorerVersion() === 10) {
        openUriUsingIE10InWindows7(uri, failCb, successCb);
    } else if (getInternetExplorerVersion() === 9 || getInternetExplorerVersion() === 11) {
        openUriWithHiddenFrame(uri, failCb, successCb);
    } else {
        openUriInNewWindowHack(uri, failCb, successCb);
    }
}

function openUriUsingIE10InWindows7(uri, failCb, successCb) {
    var timeout = setTimeout(failCb, 1000);
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

function openUriInNewWindowHack(uri, failCb, successCb) {
    var myWindow = window.open('', '', 'width=0,height=0');

    if (myWindow !== null && typeof myWindow === 'object') {
        myWindow.document.write("<iframe src='" + uri + "'></iframe>");

        // Try opening the protocol (determines if protocol is installed)
        try {
            // If there's no error, the protocol is installed
            myWindow.location.href;
            setTimeout(function () {myWindow.close()}, 50);
        } catch (e) {
            // If there's an error, the protocol isn't installed
            myWindow.close();
            failCb();
        }
        // Try detecting a blur event in the main window (determines if an application launched)
        setTimeout(function () {
            var timeout = setTimeout(function () {
                handler.remove();
                failCb();
            }, 1000);
            
            var handler = _registerEvent(window, "blur", onBlur);

            function onBlur () {
                clearTimeout(timeout);
                handler.remove();
                successCb();
            }
        }, 100); // Wait until after the pop-up window closes before detecting any blur events trigger by the application launching
    } else {
        // New window is blocked
        failCb();
    }
}

function openUriWithMsLaunchUri(uri, failCb, successCb) {
    navigator.msLaunchUri(uri,
        successCb,
        failCb
    );
}

function checkBrowser() {
    var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
    return {
        isOpera   : isOpera,
        isFirefox : typeof InstallTrigger !== 'undefined',
        isSafari  : Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0,
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

module.exports = function(uri, failCb, successCb) {
    function failCallback() {
        failCb && failCb();
    }

    function successCallback() {
        successCb && successCb();
    }

    if (navigator.msLaunchUri) { //for IE and Edge in Win 8 and Win 10
        openUriWithMsLaunchUri(uri, failCb, successCb);
    } else {
        var browser = checkBrowser();

        if (browser.isFirefox) {
            openUriUsingFirefox(uri, failCallback, successCallback);
        } else if (browser.isChrome) {
            openUriWithTimeoutHack(uri, failCallback, successCallback);
        } else if (browser.isIE) {
            openUriUsingIEInOlderWindows(uri, failCallback, successCallback);
        } else {
            //not supported, implement please
        }
    }
}

},{}]},{},[1])(1)
});