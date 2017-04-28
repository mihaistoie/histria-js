import {
    Instance, View, InstanceState, InstanceErrors, modelManager,
    HasManyComposition, HasManyAggregation, HasManyRefObject,
    ErrorState, State, StringState, IdState, BooleanState, IntegerState,
    EnumState, NumberState, DateState, DateTimeState, RefArrayState, RefObjectState,
    NumberValue
} from '../../../index';
import { Employee } from './employee';


export class EmployeeAddress extends Instance {
    public static isPersistent: boolean = true;
    public get street(): string {
        return this.getPropertyByName('street');
    }
    public setStreet(value: string): Promise<string> {
        return this.setPropertyByName('street', value);
    }
    public get city(): string {
        return this.getPropertyByName('city');
    }
    public setCity(value: string): Promise<string> {
        return this.setPropertyByName('city', value);
    }
    public get province(): string {
        return this.getPropertyByName('province');
    }
    public setProvince(value: string): Promise<string> {
        return this.setPropertyByName('province', value);
    }
    public get postalCode(): string {
        return this.getPropertyByName('postalCode');
    }
    public setPostalCode(value: string): Promise<string> {
        return this.setPropertyByName('postalCode', value);
    }
    public get country(): string {
        return this.getPropertyByName('country');
    }
    public setCountry(value: string): Promise<string> {
        return this.setPropertyByName('country', value);
    }
    public get id(): any {
        return this._children.id.value;
    }
    public get employeeId(): any {
        return this._children.employeeId.value;
    }
    public employee(): Promise<Employee> {
        return this._children.employee.getValue();
    }
    public setEmployee(value: Employee): Promise<Employee> {
        return this._children.employee.setValue(value);
    }
    public get $states(): EmployeeAddressState {
        return <EmployeeAddressState>this._states;
    }
    public get $errors(): EmployeeAddressErrors {
        return <EmployeeAddressErrors>this._errors;
    }
    protected init() {
        super.init();
        let that = this;
        that._schema = EMPLOYEEADDRESS_SCHEMA;
    }
    protected createStates() {
        let that = this;
        that._states = new EmployeeAddressState(that, that._schema);
    }
    protected createErrors() {
        let that = this;
        that._errors = new EmployeeAddressErrors(that, that._schema);
    }
}

export class EmployeeAddressErrors extends InstanceErrors {
    public get $(): ErrorState {
        return this._messages.$;
    }
    public get street(): ErrorState {
        return this._messages.street;
    }
    public get city(): ErrorState {
        return this._messages.city;
    }
    public get province(): ErrorState {
        return this._messages.province;
    }
    public get postalCode(): ErrorState {
        return this._messages.postalCode;
    }
    public get country(): ErrorState {
        return this._messages.country;
    }
    public get id(): ErrorState {
        return this._messages.id;
    }
    public get employeeId(): ErrorState {
        return this._messages.employeeId;
    }
}

export class EmployeeAddressState extends InstanceState {
    public get street(): StringState {
        return this._states.street;
    }
    public get city(): StringState {
        return this._states.city;
    }
    public get province(): StringState {
        return this._states.province;
    }
    public get postalCode(): StringState {
        return this._states.postalCode;
    }
    public get country(): StringState {
        return this._states.country;
    }
    public get id(): IdState {
        return this._states.id;
    }
    public get employeeId(): IdState {
        return this._states.employeeId;
    }
}
export const
    EMPLOYEEADDRESS_SCHEMA = {
        type: 'object',
        name: 'employeeAddress',
        nameSpace: 'references',
        properties: {
            street: {
                title: 'Street',
                type: 'string'
            },
            city: {
                title: 'City',
                type: 'string'
            },
            province: {
                title: 'Province',
                type: 'string'
            },
            postalCode: {
                title: 'Postal Code',
                type: 'string'
            },
            country: {
                title: 'Country',
                type: 'string'
            },
            id: {
                type: 'integer',
                generated: true,
                format: 'id'
            },
            employeeId: {
                type: 'integer',
                isReadOnly: true,
                format: 'id'
            }
        },
        relations: {
            employee: {
                title: 'Address',
                type: 'belongsTo',
                model: 'employee',
                aggregationKind: 'composite',
                invRel: 'address',
                nameSpace: 'references',
                invType: 'hasOne',
                localFields: [
                    'employeeId'
                ],
                foreignFields: [
                    'id'
                ]
            }
        },
        meta: {
            parent: 'employee'
        }
    };