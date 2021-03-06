import { SalesOrder } from '../model-model';
import { propChanged, init, title } from '../../../index';

const
    VAT_TAX = 0.193;

export class SalesOrderRules {

    @propChanged(SalesOrder, 'netAmount')
    @title(SalesOrder, 'netAmount => vat,  grossAmount')
    public static async netAmountChanged(so: SalesOrder, eventInfo: any): Promise<void> {
        return SalesOrderRules.calculateVatAndAmont(so, eventInfo);
    }
    @propChanged(SalesOrder, 'vat')
    @title(SalesOrder, 'vat => netAmount,  grossAmount')
    public static async vatChanged(so: SalesOrder, eventInfo: any): Promise<void> {
        if (eventInfo.isTriggeredBy('netAmount', so))
            return;
        const vat = so.vat.value;
        await so.netAmount.setValue(vat / VAT_TAX);
    }

    @propChanged(SalesOrder, 'grossAmount')
    @title(SalesOrder, 'grossAmount => vat,  netAmount')
    public static async grossAmountChanged(so: SalesOrder, eventInfo: any): Promise<void> {
        if (eventInfo.isTriggeredBy('netAmount', so))
            return;
        const ga = so.grossAmount.value;
        await so.netAmount.setValue(ga / (1 + VAT_TAX));
    }

    public static async calculateVatAndAmont(so: SalesOrder, eventInfo: any): Promise<void> {
        await so.setRuleCount(so.ruleCount + 1);
        await so.vat.setValue(so.netAmount.value * VAT_TAX);
        await so.grossAmount.setValue(so.netAmount.value + so.vat.value);
    }
}
