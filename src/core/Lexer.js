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