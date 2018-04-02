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