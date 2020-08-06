// Copyright (C) 2013 Yusuke Suzuki <utatane.tea@gmail.com>
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
//   * Redistributions of source code must retain the above copyright
//     notice, this list of conditions and the following disclaimer.
//   * Redistributions in binary form must reproduce the above copyright
//     notice, this list of conditions and the following disclaimer in the
//     documentation and/or other materials provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
// AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
// IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
// ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
// DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
// (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
// LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
// ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
// THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

var expect = require('chai').expect;
var esrecurse = require('..');

describe('object expression', () =>
    it('properties', function() {
        let tree = {
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

        let log = [];
        esrecurse.visit(tree, {
            Identifier(node) {
                return log.push(node.name);
            }
        }
        );


        return expect(log).to.deep.equal(['a', 'b']);
    })
);

describe('chain expression', () =>
    it('expressions', function() {
        let tree = {
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

        let log = [];
        esrecurse.visit(tree, {
                Identifier(node) {
                    return log.push(node.name);
                }
            }
        );


        return expect(log).to.deep.equal(['a', 'b']);
    })
);

describe('non listed keys throw an error', () =>
    it('traverse', function() {
        let tree = {
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

        return expect(function() {
            let log = [];
            return esrecurse.visit(
                tree,
                {
                    Literal(node) {
                        return log.push(node.value);
                    }
                }
            );
        }).to.throw('Unknown node type TestStatement.');
    })
);



describe('no listed keys fallback if "fallback" option was given', () =>
    it('traverse', function() {
        let tree = {
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

        let log = [];
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

        return expect(log).to.deep.equal([ 20 ]);
})
);

describe('no listed keys fallback if "fallback" option is a function', () =>
    it('traverse', function() {
        let tree = {
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

        return expect(result).to.equal(2);
    })
);


describe('inherit Visitor', function() {
    it('log names', function() {
        let tree = {
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
                super(null, {fallback: 'iteration'});
                this.log = [];
            }

            Identifier(node) {
                return this.log.push(node.name);
            }
        }

        let visitor = new Derived;
        visitor.visit(tree);

        return expect(visitor.log).to.deep.equal([ 'decl', 'a', 'rest' ]);
});

    return it('customize behavior', function() {
        let tree = {
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
                super(null, {fallback: 'iteration'});
                this.log = [];
            }

            BlockStatement(node) {}

            Identifier(node) {
                return this.log.push(node.name);
            }
        }

        let visitor = new Derived;
        visitor.visit(tree);

        return expect(visitor.log).to.deep.equal([ 'decl', 'a', 'rest' ]);
});
});

describe('bidirectional relationship at non visitor keys.', function() {
    it('ExpressionStatement <-> Identifier', function() {
        let tree = {
            type: 'ExpressionStatement',
            expression: {
                type: 'Identifier',
                name: 'foo'
            }
        };
        tree.expression.parent = tree;

        let log = [];
        esrecurse.visit(tree, {
            Identifier(node) {
                return log.push(node.name);
            }
        }
        );


        return expect(log).to.deep.equal(['foo']);
});

    return it('ExpressionStatement <-> UnknownNode with the childVisitorKeys option', function() {
        let tree = {
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

        let log = [];
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


        return expect(log).to.deep.equal(['foo']);
});
});
