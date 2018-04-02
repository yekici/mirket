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