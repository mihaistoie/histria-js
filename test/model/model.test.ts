
import * as assert from 'assert';
import * as path from 'path';
import * as mochaUtils from 'mocha';
import { Transaction, loadRules } from '../../src/index';
import { User } from './user';
import  * as rules from './rules/user-rules';

async function testUser(): Promise<void> {
    let transaction = new Transaction();
    let user = transaction.create<User>(User);
    // set 
    await user.firstName('John'); // user.firstName = 'John';
    let fullName = await user.fullName();  // fullName = user.fullName;
    assert.equal(fullName, 'John', 'Rules call ');

    await user.lastName('Doe');   // user.lastName = 'Doe';
    //get
    let fn = await user.firstName(); // fn = user.firstName;
    let ln = await user.lastName();  // ln = user.lastName;
    fullName = await user.fullName();  // fullName = user.fullName;
    
    assert.equal(fn, 'John', 'First Name set/get');
    
    assert.equal(ln, 'Doe', 'Last Name set/get');
    assert.equal(fullName, 'John DOE', 'Rules call');

}

describe('Base Model Test', () => {
    before(function(done) {
        assert.equal(rules.test, 1, 'Rules Loaded');
        loadRules(path.join(__dirname, 'rules')).then(() => {
            done();
        }).catch((ex) => {
            done(ex);
        });
    });
    it('Class test', function(done) {
        testUser().then(function() {
            done();
        }).catch(function(ex) {
            done(ex);
        })

    });

});
