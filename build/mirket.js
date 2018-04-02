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

var Trees;

(function () {

    Trees = mi.Trees = {
        Operator        : 11,
        Paren           : 12,
        Variable        : 13,
        Assignment      : 14,
        Method          : 15,
        Array           : 16,
        String          : 17,
        Null            : 18,
        Number          : 19,
        Bool            : 20,
        UnaryOperator   : 21,
        Statement       : 22,
    }

})();
// require:core.Util
// require:core.Trees


var Tree;

(function () {

    Tree = mi.Tree = mi.class('Tree' , function () {

    } , {
        isType: function (type) {
            return this.type == type;
        },
        isTypes: function () {
            for (var i = 0 ; i < arguments.length ; i++) {
                if (arguments[i] == this.type) {
                    return true;
                }
            }
            return false;
        }
    });

    Tree.Operator = Tree.extend('Operator' , function (left , operator , right) {
        this.left = left;
        this.operator = operator;
        this.right = right;
        this.type = Trees.Operator;
    } , {
        toString: function () {
            return "{TO:" + this.left + " " + this.operator + " " + this.right + "}"
        }
    });

    Tree.UnaryOperator = Tree.extend('UnaryOperator' , function (operator , right) {
        this.operator = operator;
        this.right = right;
        this.type = Trees.UnaryOperator;
    } , {
        toString: function () {
            return "{TUO:" + this.operator + " " + this.right + "}"
        }
    });

    Tree.Paren = Tree.extend('Paren' , function (expr) {
        this.expr = expr;
        this.type = Trees.Paren;
    } , {
        toString: function () {
            return "{TP:" + this.expr + "}"
        }
    });

    Tree.Variable = Tree.extend('Variable' , function (name , args) {
        this.name = name;
        this.args = args;
        this.type = Trees.Variable;
    } , {
        toString: function () {
            return "{TV:" + this.name + (this.args ? ' [' + this.args + ']' : '') + "}"
        }
    });

    Tree.Method = Tree.extend('Variable' , function (name , args) {
        this.name = name;
        this.args = args;
        this.type = Trees.Method;
    } , {
        toString: function () {
            return "{TM:" + this.name + (this.args ? ' [' + this.args + ']' : '') + "}"
        }
    });


    Tree.Assignment = Tree.extend('Assignment' , function (variable , operator , right) {
        this.variable = variable;
        this.operator = operator;
        this.right = right;
        this.type = Trees.Assignment;
    } , {
        toString: function () {
            return "{TA:" + this.variable + " " + this.operator + " " + this.right + "}"
        }
    });

    Tree.Array = Tree.extend('Array' , function (args) {
        this.args = args;
        this.type = Trees.Array;
    } , {
        toString: function () {
            return "{TAR: [" + this.args + "]}"
        }
    });


    Tree.String = Tree.extend('String' , function (val) {
        this.val = val;
        this.type = Trees.String;
    } , {
        toString: function () {
            return "{TS:'" + this.val + "'}"
        }
    });

    Tree.Null = Tree.extend('Null' , function () {
        this.type = Trees.Null;
    } , {
        toString: function () {
            return "{TNULL}"
        }
    });

    Tree.Number = Tree.extend('Number' , function (val) {
        this.val = Number(val);
        this.type = Trees.Number;
    } , {
        toString: function () {
            return "{TN:" + this.val + "}"
        }
    });

    Tree.Bool = Tree.extend('Bool' , function (val) {
        this.val = val === true || val === 'true';
        this.type = Trees.Bool;
    } , {
        toString: function () {
            return "{TB:" + this.val + "}"
        }
    });

    Tree.Statement = Tree.extend('Statement' , function () {
        this.list = [];
        this.type = Trees.Statement;
    } , {
        toString: function () {
            return "{TS: [" + this.list + "]}"
        }
    });

})();
// require:core.Tree

var Parser;

(function () {

    Parser = mi.Parser = function (lexer) {
        if (!lexer)
            throw new Error('Lexer lazım');

        this.lexer = lexer;
        this.token = this.lexer.getNextToken();
    };

    mi.Parser.prototype = {
        eat: function (type) {
            if (this.token.isType(type)) {
                return (this.token = this.lexer.getNextToken());
            }
            throw new Error(Tokens.getTokenName(type) + ' Bekleniyordu fakat gelmedi');
        },

        factor: function () {
            var token = this.token,
                factor = null,
                args = null;

            if (token.isUnaryOperator()) {
                return new Tree.UnaryOperator(this.unaryOperator() , this.factor())
            }

            if (token.isType(Tokens.MINUS)) {
                this.eat(Tokens.MINUS);
                token = this.token;
                this.eat(Tokens.NUMBER);
                return new Tree.Number(token.val);
            }

            if (token.isType(Tokens.LBRACKET)) { // dizi
                this.eat(Tokens.LBRACKET);
                args = [];
                while (!this.token.isType(Tokens.RBRACKET)) {
                    args.push(this.expr([Tokens.COMMA , Tokens.RBRACKET]));
                    if (this.token.isType(Tokens.COMMA)) {
                        this.eat(Tokens.COMMA);
                    }
                }

                this.eat(Tokens.RBRACKET);
                return new Tree.Array(args);
            }

            if (token.isType(Tokens.ID)) {
                this.eat(Tokens.ID);
                if (this.token.isType(Tokens.LBRACKET)) { //elma[]
                    args = [];
                    while (this.token.isType(Tokens.LBRACKET)) {
                        this.eat(Tokens.LBRACKET);
                        if (this.token.isType(Tokens.RBRACKET)) {
                            this.eat(Tokens.RBRACKET);
                            break;
                        }
                        args.push(this.expr(Tokens.RBRACKET));
                        this.eat(Tokens.RBRACKET);
                    }
                    if (args.length == 0) {
                        throw new Error('dizi için erişim anahtarı yok');
                    }
                    return new Tree.Variable(token.val , args);
                }

                if (this.token.isType(Tokens.LPAREN)) { // elma()
                    this.eat(Tokens.LPAREN);
                    args = [];
                    while (!this.token.isType(Tokens.RPAREN)) {
                        args.push(this.expr([Tokens.COMMA , Tokens.RPAREN]));
                        if (this.token.isType(Tokens.COMMA)) {
                            this.eat(Tokens.COMMA);
                        }
                    }
                    this.eat(Tokens.RPAREN);
                    return new Tree.Method(token.val , args);
                }

                return new Tree.Variable(token.val , args);
            }

            if (token.isTypes(Tokens.NULL , Tokens.BOOL , Tokens.NUMBER , Tokens.STRING)) {

                this.eat(token.type);

                switch (token.type) {
                    case Tokens.NULL    : return new Tree.Null();
                    case Tokens.BOOL    : return new Tree.Bool(token.val);
                    case Tokens.NUMBER  : return new Tree.Number(token.val);
                    case Tokens.STRING  : return new Tree.String(token.val);
                }


                throw new Error('Tanımlanmamış veri ağacı');
            }


            if (token.isType(Tokens.LPAREN)) {
                this.eat(Tokens.LPAREN);
                factor = new Tree.Paren(this.expr(Tokens.RPAREN));
                this.eat(Tokens.RPAREN);
                return factor;
            }
            throw new Error('beklenilmeyen factor token:' + token);
        },

        operator: function () {
            var token = this.token;
            if (this.token.isOperator()) {
                this.eat(this.token.type);
                return token;
            }
            throw new Error('beklenilmeyen operator token');
        },

        unaryOperator: function () {
            var token = this.token;
            if (this.token.isUnaryOperator()) {
                this.eat(this.token.type);
                return token;
            }
            throw new Error('beklenilmeyen operator token');
        },

        //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_Precedence
        getOperatorPrecedence: function (token) {
            if (token.isTypes(Tokens.ASSIGNMENT))                       return 3;
            if (token.isTypes(Tokens.PUSH , Tokens.IN))                 return 4;
            if (token.isType(Tokens.OR))                                return 5;
            if (token.isType(Tokens.AND))                               return 6;
            if (token.isTypes(Tokens.EQUALS , Tokens.NOTEQUALS))        return 10;
            if (token.isTypes(Tokens.PLUS , Tokens.MINUS))              return 13;
            if (token.isTypes(Tokens.MUL , Tokens.DIV , Tokens.MOD))    return 14;
            if (token.isTypes(Tokens.POW))                              return 15;
            if (token.isTypes(Tokens.PRINT , Tokens.INPUT))             return 2;

            if (token.isUnaryOperator())                                return 16;


            throw new Error('Tanımlanmamış Operator');
        },

        expr: function (subExprLimiter) {
            var factor = this.factor(),
                operator = null,
                peakFactor = null,
                precedence = 0,
                assignment = null;

            if (!subExprLimiter) subExprLimiter = [0];
            if (!mi.isArray(subExprLimiter)) subExprLimiter = [subExprLimiter];


            if (this.token.isAssignment()) {
                if (!(factor instanceof Tree.Variable)) {
                    throw new Error('Sadece değişkenlere atama yapılabilir');
                }


                assignment = {
                    factor: factor,
                    operator: this.operator()
                };



                factor = this.factor();
            }


            while (!this.token.isTypes(Tokens.EOL , Tokens.SEMI) && !this.token.isTypes.apply(this.token , subExprLimiter)) {

                if (this.token.isAssignment()) {
                    throw new Error('Atama yapmak için parantez veya yeni satırı kullan');
                }

                if (this.token.isOperator()) {
                    operator = this.operator();
                    peakFactor = this.factor();



                    if (factor instanceof Tree && factor.isTypes(Trees.Operator , Trees.UnaryOperator)) {
                        precedence = this.getOperatorPrecedence(operator) - this.getOperatorPrecedence(factor.operator);

                        if (precedence > 0) {
                            

                            if (factor.isType(Trees.Operator)) {

                                factor = new Tree.Operator(
                                    factor.left ,
                                    factor.operator ,
                                    new Tree.Operator(factor.right , operator , peakFactor)
                                );

                            } else {

                                factor = new Tree.UnaryOperator(
                                    factor.operator ,
                                    new Tree.Operator(factor.right , operator , peakFactor)
                                );

                            }

                            continue;
                        }
                    }

                    factor = new Tree.Operator(factor , operator , peakFactor);
                } else {
                    throw new Error('Beklenilmeyen token:' + this.token);
                }
            }


            if (assignment) {
                if (!assignment.operator.isType(Tokens.ASSIGNMENT)) {
                    factor = new Tree.Assignment(
                        assignment.factor ,
                        assignment.operator ,
                        new Tree.Operator(assignment.factor , null , factor)
                    );
                    switch (assignment.operator.type) {
                        case Tokens.AT_PLUS:
                            factor.right.operator = Token(Tokens.PLUS);
                            break;
                        case Tokens.AT_MINUS:
                            factor.right.operator = Token(Tokens.MINUS);
                            break;
                        case Tokens.AT_MUL:
                            factor.right.operator = Token(Tokens.MUL);
                            break;
                        case Tokens.AT_DIV:
                            factor.right.operator = Token(Tokens.DIV);
                            break;
                        case Tokens.AT_MOD:
                            factor.right.operator = Token(Tokens.MOD);
                            break;
                        case Tokens.AT_POW:
                            factor.right.operator = Token(Tokens.POW);
                            break;
                        default: throw new Error('geçersiz atama operatörü');
                    }
                } else {
                    factor = new Tree.Assignment(assignment.factor , assignment.operator , factor);
                }
            }

            return factor;
        },

        statement: function () {
            var statement = new Tree.Statement();

            while (1) {
                if (this.token.isType(Tokens.EOL)) break;

                statement.list.push(this.expr());

                if (this.token.isType(Tokens.SEMI)) this.eat(Tokens.SEMI);
            }


            return statement;
        }

    };

})();
// require:core.Parser

var Interpreter;
(function () {

    Interpreter = mi.Interpreter = mi.class('Interpreter' , function (parser , scope) {
        this.tree = parser.statement();

        this.scope = scope || new Scope();

        mi.log(this.tree + '');
    } , {

        visit: function (tree) {
            if (tree instanceof Token) {
                return tree;
            }


            switch (tree.type) {
                case Trees.Operator     :   return this.operator(tree);
                case Trees.Paren        :   return this.paren(tree);
                case Trees.Variable     :   return this.variable(tree);
                case Trees.Assignment   :   return this.assignment(tree);
                case Trees.Method       :   return this.method(tree);
                case Trees.Array        :   return this.array(tree);
                case Trees.Null         :   return this.null(tree);
                case Trees.Bool         :   return this.bool(tree);
                case Trees.String       :   return this.string(tree);
                case Trees.Number       :   return this.number(tree);
                case Trees.UnaryOperator:   return this.unaryOperator(tree);
                case Trees.Statement    :   return this.statement(tree);
            }

            throw new Error('Tanımlanmamış Ağaç:' + tree);
        },

        unaryOperator: function (tree) {
            var operator = tree.operator,
                right = this.visit(tree.right);

            if (!(right instanceof Data)) {
                this._unexpectedContentError(4);
            }

            switch (operator.type) {
                case Tokens.TYPEOF      :
                    return new Data.String(DT.getTypeName(right.type));
                case Tokens.NOT         :
                    return new Data.Bool(!Interpreter.isLogicallyPositive(right));
                case Tokens.LENGTH      :
                    if (!right.accessWithArgs())
                        return new Data.Null();
                    return new Data.Number(right.val.length);
                case Tokens.ISNULL      :
                    return new Data.Bool(right.isNull());
                case Tokens.ISSTRING    :
                    return new Data.Bool(right.isString());
                case Tokens.ISNUMBER    :
                    return new Data.Bool(right.isNumber());
                case Tokens.ISARRAY     :
                    return new Data.Bool(right.isArray());
                case Tokens.ISBOOLEAN   :
                    return new Data.Bool(right.isBool());
                case Tokens.POP         :
                    if (!right.isArray() || right.val.length === 0) return new Data.Null();
                    right.val.pop()
                    return right;
                case Tokens.PRINT       :
                    console.log('print:' , right);
                    return right;
                case Tokens.INPUT       :
                    return new Data.String(window.prompt(right.isArray() ? 'null' : right.val));
            }

            throw new Error('tanımlanmamış unaryOperator');
        },

        number: function (tree) {
            return new Data.Number(tree.val);
        },

        string: function (tree) {
            return new Data.String(tree.val + '');
        },

        bool: function (tree) {
            return new Data.Bool(tree.val === true || tree.val === 'true');
        },

        null: function () {
            return new Data.Null();
        },

        array: function (tree) {

            var i = 0,
                length = tree.args.length,
                data = new Data.Array();

            for ( ; i < length ; i++) {
                data.val.push(this.visit(tree.args[i]));
            }

            return data;
        },

        method: function (tree) {
            mi.log('method içeriği istendi');
            var j = tree.args.length;
            while (j--) {
                this.visit(tree.args[j]);
            }
            return new Data.String('method_ici');
        },

        variable: function (tree) {
            if (!this.scope.exists(tree)) return new Data.Null();

            var value = this.scope.get(tree);

            if (tree.args) {
                if (value.accessWithArgs()) {
                    var args = tree.args,
                        i = 0,
                        length = args.length,
                        arg , val;

                    for ( ; i < length ; i++) {
                        if (!value.accessWithArgs()) return new Data.Null();
                        arg = this.visit(args[i]);
                        if (!arg.isNumberable()) return new Data.Null();
                        val = Math.round(arg.toNumber());

                        if (val >= 0 && val < value.val.length) {
                            value = value.val[val];
                            continue;
                        }
                        if (val < 0 && val >= value.val.length) {
                            value = value.val[val + value.val.length];
                            continue;
                        }
                        return new Data.Null();
                    }

                    if (mi.isString(value)) {
                        value = new Data.String(value);
                    }

                    return value;
                } else {
                    throw new Error('args ile erişim yok');
                }
            }

            return value;
        },

        assignment: function (tree) {
            var value = this.visit(tree.right);

      
            if (!(value instanceof Data)) {
                this._unexpectedContentError(5);
            }

            if (!tree.variable.args) {
                this.scope.set(tree.variable , value);
                return value;
            }

            if (!this.scope.exists(tree.variable)) return new Data.Null();

            var args = tree.variable.args,
                variable = this.scope.get(tree.variable),
                i = 0,
                length = args.length,
                arg , val;


            for ( ; i < length ; i++) {
                if (!variable.accessWithArgs()) throw new Error('args ile erişim yok');
                arg = this.visit(args[i]);
                if (!arg.isNumberable()) throw new Error('sadece sayılar ile erişim yapılabilir');
                val = Math.round(arg.toNumber());
                if (i == length - 1) {
                    variable.val[val] = value;
                } else {
                    variable = variable.val[val];
                }
            }



            return value;
        },

        paren: function (tree) {
            return this.visit(tree.expr);
        },

        _unexpectedContentError: function (id) {
            throw new Error(id + ' beklenilmeyen içerik');
        },

        operator: function (tree) {

            var left = this.visit(tree.left) ,
                operator = tree.operator ,
                logical = operator.isTypes(Tokens.AND , Tokens.OR),
                right = logical ? tree.right : this.visit(tree.right),
                _temp , lVal , rVal;

            if (!(left instanceof Data) || !(!logical ? right instanceof Data : true)) {
                this._unexpectedContentError(1);
            }



            switch (operator.type) {
                case Tokens.PLUS        :
                    if (
                        left.isTypes(DT.NUMBER , DT.STRING , DT.BOOL , DT.NULL) &&
                        right.isTypes(DT.NUMBER , DT.STRING , DT.BOOL , DT.NULL)
                    ) {

                        lVal = left.val;
                        rVal = right.val;


                        if (left.isNull()) lVal = 0;
                        if (right.isNull()) rVal = 0;


                        _temp = lVal + rVal;

                        return new Data[Data.detectType(_temp)](_temp);
                    } else if (left.isArray() && right.isArray()) {
                        return new Data.Array(left.clone().val.concat(right.clone().val));
                    }
                    return new Data.Null();


                case Tokens.MINUS       :
                    if (left.isNumberable() && right.isNumberable()) {
                        lVal = left.toNumber();
                        rVal = right.toNumber();

                        if (!rVal) return new Data.Number(lVal);

                        return new Data.Number(lVal - rVal);
                    }
                    return new Data.Null();


                case Tokens.MUL         :
                    if (left.isNumberable() && right.isNumberable()) {
                        lVal = left.toNumber();
                        rVal = right.toNumber();

                        if (!lVal || !rVal) return new Data.Number(0);
                        return new Data.Number(lVal * rVal);
                    }
                    return new Data.Null();


                case Tokens.DIV         :
                    if (left.isNumberable() && right.isNumberable()) {
                        lVal = left.toNumber();
                        rVal = right.toNumber();

                        if (!rVal) throw new Error('0 a bölünme hatası');
                        if (!lVal) return new Data.Number(0);
                        return new Data.Number(lVal / rVal);
                    }
                    return new Data.Null();


                case Tokens.MOD         :
                    if (left.isNumberable() && right.isNumberable()) {
                        return new Data.Number(left.toNumber() % right.toNumber());
                    }
                    return new Data.Null();

                case Tokens.POW         :
                    if (left.isNumberable() && right.isNumberable()) {
                        return new Data.Number(Math.pow(left.toNumber() , right.toNumber()));
                    }
                    return new Data.Null();


                case Tokens.AND         :

                    if (!Interpreter.isLogicallyPositive(left)) {
                        return left;
                    }

                    _temp = this.visit(right);

                    if (!(_temp instanceof Data)) {
                        this._unexpectedContentError(2);
                    }

                    return _temp;

                case Tokens.OR         :

                    if (Interpreter.isLogicallyPositive(left)) {
                        return left;
                    }

                    _temp = this.visit(right);

                    if (!(_temp instanceof Data)) {
                        this._unexpectedContentError(3);
                    }

                    return _temp;

                case Tokens.EQUALS      :
                case Tokens.NOTEQUALS   :
                    return new Data.Bool(Interpreter.equals(right , left) === (operator.type === Tokens.EQUALS));

                case Tokens.PUSH        :
                    if (!left.isArray()) return new Data.Null();
                    left.val.push(right.clone());
                    return left;

                case Tokens.IN          :
                    if (!right.accessWithArgs()) return new Data.Null();
                    var i = right.val.length;
                    while (i--) {
                        if (
                            Interpreter.equals(
                                mi.isString(right.val[i]) ? new Data.String(right.val[i]) : right.val[i] ,
                                left
                            )
                        ) {
                            return new Data.Bool(true);
                        }
                    }
                    return new Data.Bool(false);
                default: throw new Error('Geçersiz Operatör' + operator);
            }


        },


        statement: function (tree) {
            var i = 0 ,
                value;
            for (; i < tree.list.length; i++) {
                value = this.visit(tree.list[i]);
            }
            return value;
        },

        interpret: function () {
            return this.visit(this.tree);
        }
    });


    Interpreter.isLogicallyPositive = function (data) {
        return  !(
            data.isNull() ||
            data.isBool() && data.val === false ||
            data.isNumber() && data.val === 0 ||
            data.isString() && data.val.length == 0 ||
            data.isArray() && data.val.length == 0
        );
    };

    Interpreter.equals = function (right , left) {
            if (right.type !== left.type) return false;
            if (right === left) return true;
            if (right.accessWithArgs()) {
                if (left.val.length !== right.val.length) return false;
                return _check(left.val , right.val);
            }
            return right.val === left.val;
    };

    var _check = function (lVal , rVal ) {
        if (mi.isString(lVal)) return lVal === rVal;
        var i = lVal.length;
        while (i--) {
            if (!Interpreter.equals(lVal[i] , rVal[i])) {
                return false;
            }
        }
        return true;
    };


})();
var Tokens;

(function () {

    Tokens = mi.Tokens = {
        EOL: 1,

        NUMBER      :   20,
        STRING      :   21,
        BOOL        :   22,
        NULL        :   23,
        ID          :   24,

        PLUS        :   40,
        MINUS       :   41,
        MUL         :   42,
        DIV         :   43,
        MOD         :   44,
        POW         :   45,
        AND         :   46,
        OR          :   47,
        EQUALS      :   48,
        NOTEQUALS   :   49,

        ASSIGNMENT  :   50,
        AT_PLUS     :   51,
        AT_MINUS    :   52,
        AT_MUL      :   53,
        AT_DIV      :   54,
        AT_MOD      :   55,
        AT_POW      :   56,


        LPAREN      :   70,
        RPAREN      :   71,

        LBRACKET    :   72,
        RBRACKET    :   73,

        COMMA       :   80,
        SEMI        :   81,

        TYPEOF      :   90,
        NOT         :   91,
        LENGTH      :   92,
        ISNULL      :   93,
        ISSTRING    :   94,
        ISNUMBER    :   95,
        ISARRAY     :   96,
        ISBOOLEAN   :   97,
        POP         :   98,
        PRINT       :   99,
        INPUT       :   100,


        PUSH        :   150,
        IN          :   151

    };

    Tokens.getTokenName = function (type) {
        var key;
        for (key in Tokens) {
            if (Tokens[key] == type) {
                return key;
            }
        }
        throw new Error('belirtilmemiş token');
    };



})();
// require:core.Tokens

var Keyword;

(function () {

    Keyword = mi.Keyword = {
        true        :   Tokens.BOOL,
        false       :   Tokens.BOOL,
        null        :   Tokens.NULL,
        and         :   Tokens.AND,
        or          :   Tokens.OR,
        typeof      :   Tokens.TYPEOF,
        not         :   Tokens.NOT,
        length      :   Tokens.LENGTH,
        isnull      :   Tokens.ISNULL,
        isstring    :   Tokens.ISSTRING,
        isnumber    :   Tokens.ISNUMBER,
        isarray     :   Tokens.ISARRAY,
        isboolean   :   Tokens.ISBOOLEAN,
        push        :   Tokens.PUSH,
        pop         :   Tokens.POP,
        in          :   Tokens.IN,
        print       :   Tokens.PRINT,
        input       :   Tokens.INPUT
    };

})();
var Token;

(function () {

    Token = mi.Token = function (type , val) {
        if (!(this instanceof Token))
            return new Token(type , val);

        this.type = type;
        this.val = val;
    };

    mi.Token.prototype = {
        isType: function (type) {
            return this.type === type;
        },
        isOperator: function () {
            return this.type >= 40 && this.type < 70 || this.type >= 150 && this.type < 170;
        },
        isUnaryOperator: function () {
            return this.type >= 90 && this.type < 150;
        },
        isAssignment: function () {
            return this.type >= 50 && this.type < 60;
        },
        isTypes: function () {
            for (var i = 0 ; i < arguments.length ; i++) {
                if (arguments[i] === this.type) {
                    return true;
                }
            }
            return false;
        },
        toString: function () {
            return "[T:" + Tokens.getTokenName(this.type) + (this.val !== void 0 ? ":" + this.val : '') + "]";
        }
    };

})();
// require:core.Token

var Lexer;

(function () {

    Lexer = mi.Lexer = function (text , pos) {
        if (!text || text.length < 1) throw new Error('Text Error');

        this.text = text;
        this.pos = pos || 0;
        this.char = this.text[this.pos];
        this.peak = this.pos + 1 < this.text.length ? this.text[this.pos + 1] : null;
        this.code = this.char.charCodeAt(0);
    };


    mi.Lexer.prototype = {
        advance: function () {
            if (this.pos >= this.text.length - 1) {
                this.char = null;
                this.peak = null;
                this.code = -1;
                return null;
            }
            this.char = this.text[++this.pos];
            this.code = this.char.charCodeAt(0);
            this.peak = this.pos < this.text.length ? this.text[this.pos + 1] : null;
            return this.char;
        },
        isDigit: function () {
            return this.code >= 48 && this.code <= 57;
        },
        isLetter: function () {
            return this.code >= 65 && this.code <= 90 || this.code >= 97 && this.code <= 122
        },
        isEOL: function () {
            return this.char == null;
        },
        scanNumber: function () {
            var val = '';

            while (this.isDigit()) {
                val += this.char;
                this.advance();
            }

            if (this.char == '.') {
                this.advance();
                val += '.';
                while (this.isDigit()) {
                    val += this.char;
                    this.advance();
                }
            }
            
            return Token(Tokens.NUMBER , Number(val));
        },
        scanString: function () {
            var val = '';

            this.advance();

            while (1) {
                if (this.char === null) {
                    throw new Error("String tanımlaması ' ile kapatılmalı");
                }
                if (this.char == "'") {
                    break;
                }
                val += this.char;
                this.advance();
            }

            this.advance();

            return Token(Tokens.STRING , val);
        },
        scanIdentifier: function () {
            var val = '';
            while (this.isIdentifierChar()) {
                val += this.char;
                this.advance();
            }

            return val;
        },
        isBeginIdentifierChar: function () {
            return this.isLetter() || this.char === '_' || this.char === '$';
        },
        isIdentifierChar: function () {
            return this.isBeginIdentifierChar() || this.isDigit();
        },
        getNextToken: function () {
            var limit = 10;
            while (limit--) {
                switch (this.char) {
                    case '+':
                        this.advance();
                        if (this.char === '=') {
                            this.advance();
                            return Token(Tokens.AT_PLUS);
                        }
                        return Token(Tokens.PLUS);
                    case '-':
                        this.advance();
                        if (this.char === '=') {
                            this.advance();
                            return Token(Tokens.AT_MINUS);
                        }
                        return Token(Tokens.MINUS);
                    case '*':
                        this.advance();
                        if (this.char === '=') {
                            this.advance();
                            return Token(Tokens.AT_MUL);
                        }
                        if (this.char === '*') {
                            this.advance();
                            if (this.char === '=') {
                                this.advance();
                                return Token(Tokens.AT_POW);
                            }
                            return Token(Tokens.POW);
                        }
                        return Token(Tokens.MUL);
                    case '%':
                        this.advance();
                        if (this.char === '=') {
                            this.advance();
                            return Token(Tokens.AT_MOD);
                        }
                        return Token(Tokens.MOD);
                    case '/':
                        this.advance();
                        if (this.char === '=') {
                            this.advance();
                            return Token(Tokens.AT_DIV);
                        }
                        return Token(Tokens.DIV);
                    case '(':
                        this.advance();
                        return Token(Tokens.LPAREN);
                    case ')':
                        this.advance();
                        return Token(Tokens.RPAREN);
                    case '[':
                        this.advance();
                        return Token(Tokens.LBRACKET);
                    case ']':
                        this.advance();
                        return Token(Tokens.RBRACKET);
                    case ',':
                        this.advance();
                        return Token(Tokens.COMMA);
                    case '=':
                        this.advance();
                        if (this.char === '=') {
                            this.advance();
                            return Token(Tokens.EQUALS);
                        }
                        return Token(Tokens.ASSIGNMENT);
                    case '!':
                        if (this.peak === '=') {
                            this.advance();
                            this.advance();
                            return Token(Tokens.NOTEQUALS);
                        }
                        throw new Error('Beklenilmeyen karakter:"' + this.char + '"');
                    case ';':
                        this.advance();
                        return Token(Tokens.SEMI);
                    case "'":
                        return this.scanString();
                    case ' ':
                        this.advance();
                        continue;
                    default:
                        if (this.isEOL()) {
                            return Token(Tokens.EOL);
                        }

                        if (this.isDigit()) {
                            return this.scanNumber();
                        }

                        if (this.isBeginIdentifierChar()) {
                            var id = this.scanIdentifier();

                            if (Keyword[id]) {
                                return Token(Keyword[id] , id);
                            }
                            
                            return Token(Tokens.ID , id);
                        }

                        throw new Error('Beklenilmeyen karakter:"' + this.char + '"');
                        break;
                }
            }
        }
    }


})();
// require:core.Tree

var Scope;
(function () {

    Scope = mi.Scope = mi.class('Scope' , function () {
        this.variables = {};
    } , {

        exists: function (variable) {
            return !!this.variables[variable.name];
        },

        get: function (variable) {
            return this.variables[variable.name];
        },

        set: function (variable , value) {
            this.variables[variable.name] = value;
        }

    });

})();

(function () {
    'use strict';

    mi.test('lexer' , function () {

        var lexer = new mi.Lexer(" 'deneme' ");

        var token = mi.Token();


        while ((token = lexer.getNextToken()) && !token.isType(Tokens.EOL)) {
            mi.log(token)
        }


    } , false);

    mi.test('parser' , function () {
        // 10 + 11 * 12 * 13 + 14
        // ((10 + (0)) + 11) * 12 * 13 + 14
        // ((10 + (0)) + -11.2) * 12 * 13 + 14
        var lexer = new mi.Lexer(" pop [2,3] push 3 + 1 push 4 "),
            parser = new mi.Parser(lexer),
            scope = new mi.Scope(),
            interpreter = new mi.Interpreter(parser , scope);


        var result = interpreter.interpret();



        mi.log(result + '' , result , scope.variables);
    });



})();
})(window);