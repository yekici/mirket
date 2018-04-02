/*
* Yasin Ekici 2017
* */

(function (scope) {
    'use strict';

    var mi = scope.mi = scope.Mirket = function () {};

    mi.console = true;
    mi.empty = function () {};

    mi.log = mi.console ? console.log.bind(window) : mi.empty;
    mi.trace = mi.console ? console.trace.bind(window) : mi.empty;
    mi.assert = mi.console ? console.assert.bind(window) : mi.empty;
    mi.warn = mi.console ? console.warn.bind(window) : mi.empty;
    mi.group = mi.console ? function (name  , fn) {
        console.group(name);
        fn.call(this);
        console.groupEnd(name);
    } : mi.empty;
    mi.time = mi.console ? function (name  , fn) {
        console.time(name);
        fn.call(this);
        console.timeEnd(name);
    } : mi.empty;


    //Sınama sistemi
    var _testList = {};

    mi.testStatus = 1; // 2olunca test lerin adlarınıda yazar
    mi.testMode = 0;

    mi.test = function (name , fn , pr) {
        _testList[name] = fn;
        if (mi.testStatus && pr == null) {
            mi.execute(name);
        }
    };

    mi.execute = function (name) {
        if (mi.testStatus == 2) mi.log('begin::' + name);
        _testList[name].call(mi , name);
        if (mi.testStatus == 2) mi.log('end::' + name);
    };


//})(window);


