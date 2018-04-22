import sinon from 'sinon';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
sinon.assert.expose(chai.assert, {prefix: ''});
