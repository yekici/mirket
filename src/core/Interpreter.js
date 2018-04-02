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