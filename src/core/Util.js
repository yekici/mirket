// name:core.Util

var Util;

(function () {

    mi.Util = Util = function () {};


    /**
     *
     * @param {object} assign
     * @param {...object} object
     * @memberof Util
     */
    Util.assign = function (assign) {
        var objs = Array.prototype.slice.call(arguments , 1),
            length = objs.length,
            i = 0,
            obj , key;


        for ( ; i < length ; i++) {
            obj = objs[i];
            for (key in obj) {
                assign[key] = obj[key];
            }
        }

        return assign;
    };


    Util.assign(Util , /**@lends Util*/{

        EPSILON: 1e-14,

        /**
         * Sayfa açılışından sonra geçen zamanı döndürür
         */
        now: (function () {

            if (performance.now) {
                return function () {
                    return performance.now();
                }
            }

            var time = Date.now();

            return function () {
                return Date.now() - time;
            }

        })(),

        /**
         *
         */
        gid: (function () {
            var id = 1;
            return  function () {
                return id++;
            }
        })(),

        degreeToRadian: (function () {
            var constant = Math.PI / 180;
            return function (degree) {
                return degree * constant;
            }
        })(),

        radianToDegree: (function () {
            var constant = 180 / Math.PI;
            return function (radian) {
                return radian * constant;
            }
        })(),

        isFunction: function (item) {
            return typeof item === 'function';
        },

        isArray: function (item) {
            return Array.isArray(item) || item instanceof Array;
        },

        isBool: function (item) {
            return typeof item === 'boolean';
        },

        isNumber: function (item) {
            return typeof item === 'number'
        },

        isObject: function (obj) {
            return obj && Object.prototype.toString.call(obj) == '[object Object]';
        },

        isString: function (item) {
            return typeof item === 'string'
        },

        /**
         * Yeni sınıf oluşturur
         * @param {string} name Object adı
         * @param {function} init Kurucu method
         * @param {array} include Dahil edilecekler
         * @param {object} obj Sınıfın methodları
         * @returns {function}
         */
        class: function (name , init , include , obj) {

            if (!mi.isString(name)) {
                obj = include;
                include = init;
                init = name;
                name = null;
            }

            var prop = init.prototype,
                item , key , keys , i , j , _temp;

            _temp = prop._tObjectName;

            if (!mi.isArray(include)) {
                obj = include;
            } else {
                for (i = 0 ; i < include.length ; i++) {
                    item = mi.isFunction(include[i]) ? include[i].prototype : include[i];

                    /**
                     * kalıtım yapılmış ise aşağıdan yukarı doğru eklenince
                     * aynı isimli değerler super class daki değerleri alıyor
                     * halbuki son kalıtımdaki değerleri alması lazım
                     * bunu aşmak için yukardan aşağı yaptım
                     * {test: 1} super class
                     * {test: 2} alt class
                     *
                     * aşağıdan yukarı testin değeri 1
                     * yukardan aşağı testin değeri 2
                     */

                    var list = [],
                        length;

                    while (item !== Object.prototype) {
                        list.push(item);
                        item = item.__proto__;
                    }

                    length = list.length;

                    while (length--) {
                        item = list[length];
                        keys = Object.getOwnPropertyNames(item);

                        for (j = 0 ; j < keys.length ;j++) {
                            key = keys[j];
                            Object.defineProperty(prop , key , Object.getOwnPropertyDescriptor(item , key));
                        }
                    }

                }
            }


            prop._tObjectName = _temp;

            if (name) {

                if (prop._tObjectName) {
                    name = prop._tObjectName + '.' + name;
                } else {
                    name = 'mi.' + name;
                }

                prop._tObjectName = name;
                prop.toString = function () { return this._tObjectName};

            }

            obj && Util.assign(prop , obj);
            init.extend = Util.extend;
            prop.constructor = init;

            return init;
        },


        /**
         * Yeni kalıtılmış sınıf oluşturur
         * @param {string} name Object adı
         * @param {function} init Kurucu method
         * @param {array} include Dahil edilecekler
         * @param {object} obj Sınıfın methodları
         * @returns {function}
         */
        extend: function (name , init , include , obj) {
            var _temp = mi.isString(name) ? init : name;

            _temp.prototype = Object.create(this.prototype);

            return Util.class(name , init , include , obj);
        },

        /**
         * Ara değer
         * @param {number} val
         * @param {number} min
         * @param {number} max
         * @returns {number}
         */
        clamp: function (val , min , max) {
            if (val < min) return min;
            if (val > max) return max;
            return val;
        }

    });

    Util.assign(mi , Util);




})();