import { SalesOrder } from '../salesorder';
import { propChanged, init, title } from '../../../src/index';


const
    VAT_TAX = 0.193;


export class SalesOrderRules {

    @propChanged(SalesOrder, 'netAmount')
    @title(SalesOrder, 'netAmount => vat,  grossAmount')
    static async netAmountChanged(so: SalesOrder, eventInfo: any): Promise<void> {
        return SalesOrderRules.calculateVatAndAmont(so, eventInfo);
    }
    @propChanged(SalesOrder, 'vat')
    @title(SalesOrder, 'vat => netAmount,  grossAmount')
    static async vatChanged(so: SalesOrder, eventInfo: any): Promise<void> {
        if (eventInfo.isTriggeredBy('netAmount', so))
            return;
        let vat = so.vat.value;
        await so.netAmount.setValue(vat / VAT_TAX);
    }

    @propChanged(SalesOrder, 'grossAmount')
    @title(SalesOrder, 'grossAmount => vat,  netAmount')
    static async grossAmountChanged(so: SalesOrder, eventInfo: any): Promise<void> {
        if (eventInfo.isTriggeredBy('netAmount', so)) 
            return;
        let ga = so.grossAmount.value;
        await so.netAmount.setValue(ga / (1 + VAT_TAX));
    }


    static async calculateVatAndAmont(so: SalesOrder, eventInfo: any): Promise<void> {
        await so.ruleCount.setValue(so.ruleCount.value + 1)
        await so.vat.setValue(so.netAmount.value * VAT_TAX);
        await so.grossAmount.setValue(so.netAmount.value + so.vat.value);
    }
}

export var test = 1;




