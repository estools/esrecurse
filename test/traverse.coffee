# Copyright (C) 2013 Yusuke Suzuki <utatane.tea@gmail.com>
#
# Redistribution and use in source and binary forms, with or without
# modification, are permitted provided that the following conditions are met:
#
#   * Redistributions of source code must retain the above copyright
#     notice, this list of conditions and the following disclaimer.
#   * Redistributions in binary form must reproduce the above copyright
#     notice, this list of conditions and the following disclaimer in the
#     documentation and/or other materials provided with the distribution.
#
# THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
# AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
# IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
# ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
# DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
# (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
# LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
# ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
# (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
# THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

'use strict'

{expect} = require 'chai'
esrecurse = require '..'

describe 'object expression', ->
    it 'properties', ->
        tree =
            type: 'ObjectExpression'
            properties: [{
                type: 'Property'
                key:
                    type: 'Identifier'
                    name: 'a'
                value:
                    type: 'Identifier'
                    name: 'b'
            }]

        log = []
        esrecurse.visit tree,
            Identifier: (node) ->
                log.push(node.name)


        expect(log).to.deep.equal ['a', 'b']


describe 'no listed keys fallback', ->
    it 'traverse', ->
        tree =
            type: 'TestStatement'
            id: {
                type: 'Identifier'
                name: 'decl'
            }
            params: [{
                type: 'Identifier'
                name: 'a'
            }]
            defaults: [{
                type: 'Literal'
                value: 20
            }]
            rest: {
                type: 'Identifier'
                name: 'rest'
            }
            body:
                type: 'BlockStatement'
                body: []

        log = []
        esrecurse.visit tree,
            Literal: (node) ->
                log.push(node.value)

        expect(log).to.deep.equal [ 20 ]


describe 'inherit Visitor', ->
    it 'log names', ->
        tree =
            type: 'TestStatement'
            id: {
                type: 'Identifier'
                name: 'decl'
            }
            params: [{
                type: 'Identifier'
                name: 'a'
            }]
            defaults: [{
                type: 'Literal'
                value: 20
            }]
            rest: {
                type: 'Identifier'
                name: 'rest'
            }
            body:
                type: 'BlockStatement'
                body: []

        class Derived extends esrecurse.Visitor
            constructor: ->
                @log = []
                super @

            Identifier: (node) ->
                @log.push node.name

        visitor = new Derived
        visitor.visit(tree)

        expect(visitor.log).to.deep.equal [ 'decl', 'a', 'rest' ]

    it 'customize behavior', ->
        tree =
            type: 'TestStatement'
            id: {
                type: 'Identifier'
                name: 'decl'
            }
            params: [{
                type: 'Identifier'
                name: 'a'
            }]
            defaults: [{
                type: 'Literal'
                value: 20
            }]
            rest: {
                type: 'Identifier'
                name: 'rest'
            }
            body:
                type: 'BlockStatement'
                body: [{
                    type: 'Identifier'
                    value: 'XXX'
                }]

        class Derived extends esrecurse.Visitor
            constructor: ->
                @log = []
                super @

            BlockStatement: (node) ->

            Identifier: (node) ->
                @log.push node.name

        visitor = new Derived
        visitor.visit(tree)

        expect(visitor.log).to.deep.equal [ 'decl', 'a', 'rest' ]
