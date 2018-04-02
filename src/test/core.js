
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