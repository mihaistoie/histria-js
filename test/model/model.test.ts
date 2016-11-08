
import * as assert from 'assert';
import * as mochaUtils from 'mocha';
import { Transaction } from '../../src/index';
import { User } from './user';


async function testUser(): Promise<void> {
    let transaction = new Transaction();
    let user = transaction.create<User>(User);
    // set 
    await user.firstName('John'); // user.firstName = 'John';
    await user.lastName('Doe');   // user.lastName = 'Doe';
    //get
    let fn = await user.firstName(); // fn = user.firstName;
    let ln = await user.lastName();  // ln = user.lastName;
    assert.equal(fn, 'John', 'First Name set/get');
    assert.equal(ln, 'Doe', 'Last Name set/get');
}

describe('Base Model Test', () => {
    it('Class test', function (done) {
        testUser().then(function(){
            done();
        }).catch(function(ex){
            done(ex);    
        })

    });

});