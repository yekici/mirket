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