// require:core.Util
var Data , DT;


(function () {

    Data = mi.Data = mi.class('Data' , function (type) {
        this.type = type;
        this._accessWithArgs = false;
    } , {
        isString: function () {
            return this.type === DT.STRING;
        },
        isArray: function () {
            return this.type === DT.ARRAY;
        },
        isArrayOrString: function () {
            return this.isString() || this.isArray();
        },
        isNumber: function () {
            return this.type === DT.NUMBER;
        },
        isNull: function () {
            return this.type == DT.NULL;
        },
        isBool: function () {
            return this.type == DT.BOOL;
        },
        isTypes: function () {
            for (var i = 0 ; i < arguments.length ; i++) {
                if (arguments[i] == this.type) {
                    return true;
                }
            }
            return false;
        },
        accessWithArgs: function () {
            return this._accessWithArgs;
        },
        clone: function () {
            return new Data[Data.detectType(this.val)](this.val);
        }
    });

    Data.detectType = function (value) {
        if (mi.isArray(value)) {
            return DT.ARRAY;
        }

        if (mi.isString(value)) {
            return DT.STRING;
        }

        if (value === false || value === true) {
            return DT.BOOL;
        }

        if (mi.isNumber(value)) {
            return DT.NUMBER;
        }

        return DT.null;
    };



    DT = mi.DT = {
        STRING  :     90,
        NUMBER  :     91,
        ARRAY   :     92,
        NULL    :     93,
        BOOL    :     94
    };

    mi.DT.getTypeName = function (type) {

        switch (type) {
            case DT.STRING  : return 'string';
            case DT.NUMBER  : return 'number';
            case DT.ARRAY   : return 'array';
            case DT.NULL    : return 'null';
            case DT.BOOL    : return 'boolean';
        }

        throw new Error('Belirtilmemiş tür');
    };

    Data.Number = Data[DT.NUMBER] = Data.extend('Number' , function (value) {
        this.type = DT.NUMBER;
        this.val = value || 0;
    } , {
        toString: function () {
            return '{DN:' + this.val + '}';
        },
        isNumberable: function () {
            return true;
        },
        toNumber: function () {
            return this.val;
        }
    });

    Data.Bool = Data[DT.BOOL] = Data.extend('Bool' , function (value) {
        this.type = DT.BOOL;
        this.val = !!value;
    } , {
        toString: function () {
            return '{DB:' + this.val + '}';
        },
        isNumberable: function () {
            return true;
        },
        toNumber: function () {
            return this.val ? 1 : 0;
        }
    });

    Data.Null = Data[DT.NULL] = Data.extend('Null' , function () {
        this.type = DT.NULL;
        this.val = null;
    } , {
        toString: function () {
            return '{DNULL}';
        },
        isNumberable: function () {
            return true;
        },
        toNumber: function () {
            return 0;
        }
    });

    Data.Array = Data[DT.ARRAY] = Data.extend('Array' , function (value) {
        this.type = DT.ARRAY;
        this.val = value || [];
        this._accessWithArgs = true;
    } , {
        toString: function () {
            return '{DA:[' + this.val + ']}';
        },
        isNumberable: function () {
            return false;
        },
        clone: function () {
            var data = new Data.Array(),
                i = 0 ,
                length = this.val.length;

            for ( ; i < length ; i++) {
                data.val.push(this.val[i].clone());
            }
            return data;
        }
    });

    Data.String = Data[DT.STRING] = Data.extend('String' , function (value) {
        this.type = DT.STRING;
        this.val = (value || '') + '';
        this._accessWithArgs = true;
    } , {
        toString: function () {
            return "{DS:'" + this.val + "'}";
        },
        isNumberable: function () {
            return this.val.length > 0 && this.val.charCodeAt(0) >= 48 && this.val.charCodeAt(0) <= 57;
        },
        toNumber: function () {
            return parseInt(this.val);
        }
    });



})();
