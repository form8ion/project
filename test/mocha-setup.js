import sinon from 'sinon';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

console.log({env: process.env.NODE_ENV})
process.env.NODE_ENV = 'test';
console.log({env: process.env.NODE_ENV})

chai.use(chaiAsPromised);
sinon.assert.expose(chai.assert, {prefix: ''});
