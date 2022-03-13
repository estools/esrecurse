/*
Copyright (C) 2013 Yusuke Suzuki <utatane.tea@gmail.com>

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright
    notice, this list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright
    notice, this list of conditions and the following disclaimer in the
    documentation and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

import esrecurse from '../';

describe('object expression', () => {
    it('properties', function() {
        const tree = {
            type: 'ObjectExpression',
            properties: [{
                type: 'Property',
                key: {
                    type: 'Identifier',
                    name: 'a'
                },
                value: {
                    type: 'Identifier',
                    name: 'b'
                }
            }]
        };

        const log = [];
        esrecurse.visit(tree, {
            Identifier(node) {
                return log.push(node.name);
            }
        }
        );

        expect(log).to.deep.equal(['a', 'b']);
    });

    it('silently recover when AST missing visitor keys', function() {
        const tree = {
            type: 'ObjectExpression',
            properties: [{
                type: 'Property',
                key: {
                    type: 'Identifier',
                    name: 'a'
                }
            }]
        };

        const log = [];
        esrecurse.visit(tree, {
            Identifier(node) {
                return log.push(node.name);
            }
        }
        );

        expect(log).to.deep.equal(['a']);
    });
});

describe('chain expression', () =>
    it('expressions', function() {
        const tree = {
            type: 'ChainExpression',
            expression: [{
                type: 'MemberExpression',
                object: {
                    type: 'Identifier',
                    name: 'a'
                },
                property: {
                    type: 'Identifier',
                    name: 'b'
                },
                computed: false,
                optional: true
            }]
        };

        const log = [];
        esrecurse.visit(tree, {
            Identifier(node) {
                return log.push(node.name);
            }
        });

        return expect(log).to.deep.equal(['a', 'b']);
    })
);

describe('non listed keys throw an error', () => {
    it('traverse', function() {
        const tree = {
            type: 'TestStatement',
            id: {
                type: 'Identifier',
                name: 'decl'
            },
            params: [{
                type: 'Identifier',
                name: 'a'
            }],
            defaults: [{
                type: 'Literal',
                value: 20
            }],
            rest: {
                type: 'Identifier',
                name: 'rest'
            },
            body: {
                type: 'BlockStatement',
                body: []
            }
        };

        expect(function() {
            const log = [];
            return esrecurse.visit(
                tree,
                {
                    Literal(node) {
                        return log.push(node.value);
                    }
                }
            );
        }).to.throw('Unknown node type TestStatement.');
    });
});


describe('no listed keys fallback if "fallback" option was given', () => {
    it('traverse', function() {
        const tree = {
            type: 'TestStatement',
            id: {
                type: 'Identifier',
                name: 'decl'
            },
            params: [{
                type: 'Identifier',
                name: 'a'
            }],
            defaults: [{
                type: 'Literal',
                value: 20
            }],
            rest: {
                type: 'Identifier',
                name: 'rest'
            },
            body: {
                type: 'BlockStatement',
                body: []
            }
        };

        const log = [];
        esrecurse.visit(
            tree,
            {
                Literal(node) {
                    return log.push(node.value);
                }
            },
            {
                fallback: 'iteration'
            }
        );

        expect(log).to.deep.equal([ 20 ]);
    });
});

describe('no listed keys fallback if "fallback" option is a function', () => {
    it('traverse', function() {
        const tree = {
            type: 'TestStatement',
            id: {
                type: 'Identifier',
                name: 'decl'
            },
            params: [{
                type: 'Identifier',
                name: 'a'
            }],
            defaults: [{
                type: 'Literal',
                value: 20
            }],
            rest: {
                type: 'Identifier',
                name: 'rest'
            },
            body: {
                type: 'BlockStatement',
                body: []
            }
        };

        let result = 0;
        esrecurse.visit(
            tree,
            {
                Identifier() {
                    return result++;
                }
            },
            {
                fallback(node) {
                    return Object.keys(node).filter(key => key !== 'id');
                }
            }
        );

        expect(result).to.equal(2);
    });
});


describe('inherit Visitor', function() {
    it('log names', function() {
        const tree = {
            type: 'TestStatement',
            id: {
                type: 'Identifier',
                name: 'decl'
            },
            params: [{
                type: 'Identifier',
                name: 'a'
            }],
            defaults: [{
                type: 'Literal',
                value: 20
            }],
            rest: {
                type: 'Identifier',
                name: 'rest'
            },
            body: {
                type: 'BlockStatement',
                body: []
            }
        };

        class Derived extends esrecurse.Visitor {
            constructor() {
                super(null, { fallback: 'iteration' });
                this.log = [];
            }

            Identifier(node) {
                return this.log.push(node.name);
            }
        }

        const visitor = new Derived();
        visitor.visit(tree);

        expect(visitor.log).to.deep.equal([ 'decl', 'a', 'rest' ]);
    });

    it('`visit` handles `null`', function () {
        class Derived extends esrecurse.Visitor {
            constructor() {
                super(null, { fallback: 'iteration' });
                this.log = [];
            }

            Identifier(node) {
                return this.log.push(node.name);
            }
        }

        const visitor = new Derived();
        visitor.visit(null);

        expect(visitor.log).to.be.empty;
    });

    it('`visit` defaults to Property type', function () {
        class Derived extends esrecurse.Visitor {
            constructor() {
                super(null, { fallback: 'iteration' });
                this.log = [];
            }

            key(node) {
                return this.log.push(node.name);
            }
            value(node) {
                return this.log.push(node.name);
            }
        }

        const visitor = new Derived();
        visitor.visit({
            key: {
                name: 'myKey',
                type: 'key'
            },
            value: {
                name: 'myValue',
                type: 'value'
            }
        });

        expect(visitor.log).to.deep.equal(['myKey', 'myValue']);
    });

    // `null` should not get to `visitChildren` through `visit`
    it('`visitChildren` handles `null`', function () {
        class Derived extends esrecurse.Visitor {
            constructor() {
                super(null, { fallback: 'iteration' });
                this.log = [];
            }

            Identifier(node) {
                return this.log.push(node.name);
            }
        }

        const visitor = new Derived();
        visitor.visitChildren(null);

        expect(visitor.log).to.be.empty;
    });

    it('`visitChildren` ignores non-Node children', function () {
        class Derived extends esrecurse.Visitor {
            constructor() {
                super(null, { fallback: 'iteration' });
                this.log = [];
            }

            FunctionDeclaration(node) {
                return this.log.push(node.name);
            }

            Identifier(node) {
                return this.log.push(node.name);
            }
        }

        const visitor = new Derived();
        visitor.visitChildren({
            type: 'FunctionDeclaration',
            params: [null, {}]
        });

        expect(visitor.log).to.be.empty;
    });

    it('`visitChildren` defaults to Property type', function () {
        class Derived extends esrecurse.Visitor {
            constructor() {
                super(null, { fallback: 'iteration' });
                this.log = [];
            }

            key(node) {
                return this.log.push(node.name);
            }
            value(node) {
                return this.log.push(node.name);
            }
        }

        const visitor = new Derived();
        visitor.visitChildren({
            key: {
                name: 'myKey',
                type: 'key'
            },
            value: {
                name: 'myValue',
                type: 'value'
            }
        });

        expect(visitor.log).to.deep.equal(['myKey', 'myValue']);
    });

    it('`visitChildren` visits non-Node `ObjectExpression`/`ObjectPattern` property keys', function () {
        class Derived extends esrecurse.Visitor {
            constructor() {
                super(null, { fallback: 'iteration' });
                this.log = [];
            }

            Property(node) {
                return this.log.push(node.name);
            }
        }

        const visitor = new Derived();
        visitor.visitChildren({
            type: 'ObjectExpression',
            properties: [{
                name: 'myExpression'
            }]
        });
        visitor.visitChildren({
            type: 'ObjectPattern',
            properties: [{
                name: 'myPattern'
            }]
        });

        expect(visitor.log).to.deep.equal(['myExpression', 'myPattern']);
    });

    it('customize behavior', function() {
        const tree = {
            type: 'TestStatement',
            id: {
                type: 'Identifier',
                name: 'decl'
            },
            params: [{
                type: 'Identifier',
                name: 'a'
            }],
            defaults: [{
                type: 'Literal',
                value: 20
            }],
            rest: {
                type: 'Identifier',
                name: 'rest'
            },
            body: {
                type: 'BlockStatement',
                body: [{
                    type: 'Identifier',
                    value: 'XXX'
                }]
            }
        };

        class Derived extends esrecurse.Visitor {
            constructor() {
                super(null, { fallback: 'iteration' });
                this.log = [];
            }

            BlockStatement(/* node */) {}

            Identifier(node) {
                return this.log.push(node.name);
            }
        }

        const visitor = new Derived();
        visitor.visit(tree);

        expect(visitor.log).to.deep.equal([ 'decl', 'a', 'rest' ]);
    });
});

describe('bidirectional relationship at non visitor keys.', function() {
    it('ExpressionStatement <-> Identifier', function() {
        const tree = {
            type: 'ExpressionStatement',
            expression: {
                type: 'Identifier',
                name: 'foo'
            }
        };
        tree.expression.parent = tree;

        const log = [];
        esrecurse.visit(tree, {
            Identifier(node) {
                return log.push(node.name);
            }
        });

        expect(log).to.deep.equal(['foo']);
    });

    it('ExpressionStatement <-> UnknownNode with the childVisitorKeys option', function() {
        const tree = {
            type: 'ExpressionStatement',
            expression: {
                type: 'UnknownNode',
                argument: {
                    type: 'Identifier',
                    name: 'foo'
                }
            }
        };
        tree.expression.parent = tree;
        tree.expression.argument.parent = tree.expression;

        const log = [];
        esrecurse.visit(
            tree,
            {
                Identifier(node) {
                    return log.push(node.name);
                }
            },
            {
                childVisitorKeys: {
                    UnknownNode: ['argument']
                }
            }
        );

        expect(log).to.deep.equal(['foo']);
    });
});
