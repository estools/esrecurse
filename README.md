### Esrecurse [![Build Status](https://travis-ci.org/estools/esrecurse.svg?branch=master)](https://travis-ci.org/estools/esrecurse)

Esrecurse ([esrecurse](https://github.com/estools/esrecurse)) is
[ECMAScript](https://www.ecma-international.org/publications/standards/Ecma-262.htm)
recursive traversing functionality.

### Example Usage

The following code will output all variables declared at the root of a file.

```javascript
esrecurse.visit(ast, {
    XXXStatement (node) {
        this.visit(node.left);
        // do something...
        this.visit(node.right);
    }
});
```

We can use `Visitor` instance.

```javascript
const visitor = new esrecurse.Visitor({
    XXXStatement (node) {
        this.visit(node.left);
        // do something...
        this.visit(node.right);
    }
});

visitor.visit(ast);
```

We can inherit `Visitor` instance easily.

```javascript
class Derived extends esrecurse.Visitor {
    constructor() {
        super(null);
    }

    XXXStatement(node) {
    }
}
```

```javascript
function DerivedVisitor() {
    esrecurse.Visitor.call(/* this for constructor */  this  /* visitor object automatically becomes this. */);
}
util.inherits(DerivedVisitor, esrecurse.Visitor);
DerivedVisitor.prototype.XXXStatement = function (node) {
    this.visit(node.left);
    // do something...
    this.visit(node.right);
};
```

And you can invoke default visiting operation inside custom visit operation.

```javascript
function DerivedVisitor() {
    esrecurse.Visitor.call(/* this for constructor */  this  /* visitor object automatically becomes this. */);
}
util.inherits(DerivedVisitor, esrecurse.Visitor);
DerivedVisitor.prototype.XXXStatement = function (node) {
    // do something...
    this.visitChildren(node);
};
```

The `childVisitorKeys` option does customize the behaviour of `this.visitChildren(node)`.
We can use user-defined node types.

```javascript
// This tree contains a user-defined `TestExpression` node.
const tree = {
    type: 'TestExpression',

    // This 'argument' is the property containing the other **node**.
    argument: {
        type: 'Literal',
        value: 20
    },

    // This 'extended' is the property not containing the other **node**.
    extended: true
};
esrecurse.visit(
    ast,
    {
        Literal (node) {
            // do something...
        }
    },
    {
        // Extending the existing traversing rules.
        childVisitorKeys: {
            // TargetNodeName: [ 'keys', 'containing', 'the', 'other', '**node**' ]
            TestExpression: ['argument']
        }
    }
);
```

We can use the `fallback` option as well.
If the `fallback` option is `"iteration"`, `esrecurse` would visit all enumerable properties of unknown nodes.
Please note circular references cause the stack overflow. AST might have circular references in additional properties for some purpose (e.g. `node.parent`).

```javascript
esrecurse.visit(
    ast,
    {
        Literal (node) {
            // do something...
        }
    },
    {
        fallback: 'iteration'
    }
);
```

If the `fallback` option is a function, `esrecurse` calls this function to determine the enumerable properties of unknown nodes.
Please note circular references cause the stack overflow. AST might have circular references in additional properties for some purpose (e.g. `node.parent`).

```javascript
esrecurse.visit(
    ast,
    {
        Literal (node) {
            // do something...
        }
    },
    {
        fallback (node) {
            return Object.keys(node).filter((key) => {
                return key !== 'argument'
            });
        }
    }
);
```

### License

See [LICENSE.md](./LICENSE.md).
