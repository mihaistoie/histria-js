"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const path = require("path");
const index_1 = require("../../index");
const view_has_one_view_model_1 = require("./view-has-one-view-model");
const histria_utils_1 = require("histria-utils");
async function viewOfUserTestWithAddress() {
    const transaction = new index_1.Transaction();
    const userDetail = await transaction.create(view_has_one_view_model_1.UserDetail, { external: true });
    const address = await transaction.create(view_has_one_view_model_1.AddressView);
    await address.setStreet('Paris');
    const addressId = address.id;
    let user = await transaction.create(view_has_one_view_model_1.User);
    await userDetail.setUser(user);
    await user.setFirstName('John');
    assert.equal(userDetail.fullName, 'John', 'After user name changed');
    await user.setLastName('Doe');
    assert.equal(userDetail.fullName, 'John DOE', 'After  name and lastName changed');
    await userDetail.setUser(null);
    assert.equal(userDetail.fullName, '', 'User is null');
    await userDetail.setUser(user);
    assert.equal(userDetail.fullName, 'John DOE', 'User is not null');
    const det = await transaction.load(view_has_one_view_model_1.UserDetail, { id: 10, userId: 101 }, { external: true });
    user = await det.user();
    assert.notEqual(user, null, 'Lazy loading (1)');
    assert.equal(user.firstName, 'John', 'Lazy loading (2)');
    assert.equal(det.fullName, 'John SMITH', 'Rule called after lazy loading');
    const userDetId = det.id;
    const userId = det.userId;
    let ca = await userDetail.address();
    assert.equal(ca, null, 'Lazy loading (1)');
    await userDetail.setAddress(address);
    ca = await userDetail.address();
    assert.equal(userDetail.addressId, ca.id, 'Lazy loading (2)');
    assert.equal(ca, address, 'Lazy loading (3)');
    assert.equal(ca.owner, userDetail, 'Lazy loading (4)');
    await userDetail.setAddress(null);
    assert.equal(ca.owner, null, 'Owner of address is null (2)');
    assert.equal(userDetail.addressId, undefined, 'Owner of address is null (1)');
    await address.setUser(userDetail);
    await address.setUser(det);
    assert.equal(await userDetail.address(), null, 'User1 hasn\'t address');
    assert.equal(await det.address(), address, 'User2 has address');
    const address2 = await await transaction.create(view_has_one_view_model_1.AddressView);
    await address2.setStreet('London');
    await det.setAddress(address2);
    assert.equal(await address.user(), null, 'Address owner is null');
    assert.equal(await det.address(), address2, 'User2 has address2');
    const transactionData = transaction.saveToJson();
    await userDetail.setAddress(address);
    transaction.clear();
    await transaction.loadFromJson(transactionData, false);
    const data2 = transaction.saveToJson();
    assert.deepEqual(transactionData, data2, 'Restore Test');
    // Test that det.user is loaded
    const cuser = await transaction.findOne(view_has_one_view_model_1.User, { id: userId });
    const duser = await transaction.findOne(view_has_one_view_model_1.UserDetail, { id: userDetId });
    assert.equal(!!cuser, true, 'User found');
    assert.equal(!!duser, true, 'User Detail found');
    const user1 = await transaction.findOne(view_has_one_view_model_1.User, { id: 101 });
    await user1.setLastName('Doe');
    assert.equal(duser.fullName, 'John DOE', 'User suser.user is loaded after transaction restore');
    const address1 = await duser.address();
    const address3 = await transaction.findOne(view_has_one_view_model_1.AddressView, { id: addressId });
    assert.equal(!!address1, true, 'Address found');
    assert.equal(!!address3, true, 'Address found (2)');
    assert.equal(address3.street, 'Paris', 'Address found (2)');
    const cu = await address3.user();
    assert.equal(cu, null, 'User Detail found (2)');
    transaction.destroy();
}
async function viewOfUserTestRemove() {
    let transaction = new index_1.Transaction();
    let userDetail = await transaction.create(view_has_one_view_model_1.UserDetail, { external: true });
    let user = await transaction.create(view_has_one_view_model_1.User);
    await userDetail.setUser(user);
    let address = await transaction.create(view_has_one_view_model_1.AddressView);
    await address.setStreet('Paris');
    const addressId = address.id;
    await address.setUser(userDetail);
    assert.notEqual(await userDetail.address(), null, '(1) Address is not null');
    await userDetail.remove();
    const address3 = await transaction.findOne(view_has_one_view_model_1.AddressView, { id: addressId });
    assert.equal(address3, null, '(1) Address not found');
    transaction.destroy();
    transaction = new index_1.Transaction();
    userDetail = await transaction.create(view_has_one_view_model_1.UserDetail, { external: true });
    user = await transaction.create(view_has_one_view_model_1.User);
    await userDetail.setUser(user);
    address = await transaction.create(view_has_one_view_model_1.AddressView);
    await address.setUser(userDetail);
    await address.remove();
    assert.equal(await userDetail.address(), null, '(3) Address is  null');
    transaction.destroy();
}
describe('ViewHasOne<View> Model Test', () => {
    before((done) => {
        const dm = histria_utils_1.dbManager();
        dm.registerNameSpace('view-has-one-view', 'memory', { compositionsInParent: true });
        const store = dm.store('view-has-one-view');
        store.initNameSpace('view-has-one-view', {
            user: [
                {
                    id: 100,
                    firstName: 'Joe',
                    lastName: 'Doe',
                },
                {
                    id: 101,
                    firstName: 'John',
                    lastName: 'Smith',
                }
            ]
        });
        index_1.loadRules(path.join(__dirname, 'rules')).then(() => {
            done();
        }).catch((ex) => {
            done(ex);
        });
    });
    it('View of User with Address view test', (done) => {
        viewOfUserTestWithAddress().then(() => {
            done();
        }).catch((ex) => {
            done(ex);
        });
    });
    it('View of User with Address view test remove', (done) => {
        viewOfUserTestRemove().then(() => {
            done();
        }).catch((ex) => {
            done(ex);
        });
    });
});

//# sourceMappingURL=view-has-one-view.specs.js.map
