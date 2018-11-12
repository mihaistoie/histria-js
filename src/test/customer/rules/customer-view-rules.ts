import { Customer, CustomerView } from '../customer-view-sample-model';
import { propChanged, init, title } from '../../../index';

export class CustomerViewRules {
    @propChanged(CustomerView, 'customer.firstName', 'customer.lastName')
    public static async customerNameChanged(viewOfCustomer: CustomerView, user: Customer, eventInfo: any): Promise<void> {
        await CustomerViewRules.updateFullName(viewOfCustomer, user);
    }
    @propChanged(CustomerView, 'customer')
    public static async customerChanged(viewOfCustomer: CustomerView, eventInfo: any, newValue: Customer, oldValue: Customer): Promise<void> {
        await CustomerViewRules.updateFullName(viewOfCustomer, newValue);
    }
    @title(CustomerView, 'Calculate:  FullName = FirstName + LastName')
    public static async updateFullName(viewOfCustomer: CustomerView, customer: Customer): Promise<void> {
        if (customer) {
            const fn = customer.firstName;
            const ln = customer.lastName;
            const fullName = [];
            if (fn) fullName.push(fn);
            if (ln) fullName.push(ln.toUpperCase());
            await viewOfCustomer.setFullName(fullName.join(' '));
        } else {
            await viewOfCustomer.setFullName('');
        }
    }
}
