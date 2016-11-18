import { SalesOrder } from '../salesorder';
import { propChanged, init, title } from '../../../src/index';


const
    VAT_TAX = 0.1;


export class SalesOrderRules {

    @propChanged(SalesOrder, 'netAmount')
    @title(SalesOrder, 'netAmount => vat,  grossAmount')
    static async netAmountChanged(so: SalesOrder, callStackInfo: any): Promise<void> {
        return SalesOrderRules.calculateVatAndGrossAmont(so, callStackInfo);
    }
    @propChanged(SalesOrder, 'vat')
    @title(SalesOrder, 'vat => netAmount,  grossAmount')
    static async vatChanged(so: SalesOrder, callStackInfo: any): Promise<void> {
        let vat = await so.vat.value();
        await so.netAmount.value(vat / VAT_TAX);
    }

    @propChanged(SalesOrder, 'grossAmount')
    @title(SalesOrder, 'grossAmount => vat,  netAmount')
    static async grossAmountChanged(so: SalesOrder, callStackInfo: any): Promise<void> {
        let ga = await so.grossAmount.value();
        await so.netAmount.value(ga / (1 + VAT_TAX));
    }


    static async calculateVatAndGrossAmont(so: SalesOrder, callStackInfo: any): Promise<void> {
        let na = await so.netAmount.value();
        await so.vat.value(na * VAT_TAX);
        let vat = await so.vat.value();
        await so.grossAmount.value(na + vat);
    }
}

export var test = 1;




