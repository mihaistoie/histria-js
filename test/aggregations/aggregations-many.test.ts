import * as assert from 'assert';
import * as path from 'path';
import * as mochaUtils from 'mocha';
import { Transaction, loadRules } from '../../src/index';
import { Cd } from './model/cd';
import { Song } from './model/song';

async function testCreate(): Promise<void> {
    let transaction = new Transaction();


}


async function testLoad(): Promise<void> {
    

}


describe('Relation One to One, Aggregation', () => {
    before(function (done) {
        //assert.equal(test, 1);
        //loadRules(path.join(__dirname, 'model', 'rules')).then(() => {
        //    done();
        //}).catch((ex) => {
        //    done(ex);
        //});
        done();
    });
    it('One to one aggregation - create', function (done) {
        testCreate().then(function () {
            done();
        }).catch(function (ex) {
            done(ex);
        })


    });
    it('One to one composition - load', function (done) {
        testLoad().then(function () {
            done();
        }).catch(function (ex) {
            done(ex);
        })


    });

});
