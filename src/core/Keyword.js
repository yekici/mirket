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