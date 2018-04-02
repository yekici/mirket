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